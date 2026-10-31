// Server-graded practice (M2): exams marked against the answer key, answers revealed only after a real attempt,
// company answers behind sign-in, and caps that make copying the whole answer set slow and visible.
// Adapted from system-design-learn's api/src/practice.ts (no company-track unlock; coding solutions added).
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { ObjectId, type Db } from 'mongodb'
import { httpError } from './app.ts'
import type { Config } from './config.ts'
import { strict, utcDay, validTimeZone, type ProgressStore } from './progress.ts'

export const LIMITS = {
  /** the most questions one exam or drill can hold (a topic's whole pool is 13–20 today) */
  examSizeMax: 50,
  /** network slack after the exam timer runs out */
  graceMs: 60_000,
  /** answers released per UTC day (an exam counts each question; a reveal counts 1) */
  revealsPerDay: { account: 300, ip: 600 },
  /** exams (topic or drill) an account can start per UTC hour; each submit is a grading oracle */
  examStartsPerHour: 20,
  minAttemptSeconds: 20,
  minAttemptChars: 20,
  /** refused junk attempts per day before the account is flagged */
  junkToFlag: 10,
}

interface Session {
  _id: string
  userId: string
  topicId: string | null
  /** every question of the topic: only these runs count towards passing */
  full: boolean
  questionIds: string[]
  deadline: Date
  answers: Record<string, number[]>
  /** answered one at a time (interview mode): already graded and revealed, can't change */
  locked: string[]
  submittedAt?: Date
  expireAt: Date
}
type KeyDoc = { _id: string; kind?: string; topicId?: string } & Record<string, unknown>

/** reveal route kind → the answer-key kind it reads ('coding' lives in coding_solutions) */
const REVEAL_KINDS = { interview: 'interview', drill: 'drill', challenge: 'challenge', coding: 'coding' } as const
type RevealKind = keyof typeof REVEAL_KINDS
const META = new Set(['_id', 'topicId', 'kind', 'contentHash'])
const strip = (doc: Record<string, unknown>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))
const userKey = (userId: string) => (ObjectId.isValid(userId) ? new ObjectId(userId) : userId) as ObjectId
const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x))
const sample = <T>(items: T[], n: number) => {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

const id = { type: 'string', minLength: 1, maxLength: 120, pattern: '^[\\w:./-]+$' } as const
const choice = { type: 'array', maxItems: 10, uniqueItems: true, items: { type: 'integer', minimum: 0, maximum: 9 } } as const
const dayAndZone = { day: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, timeZone: { type: 'string', maxLength: 64 } }

export async function ensurePracticeIndexes(db: Db) {
  await Promise.all([
    db.collection('exam_sessions').createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('exam_sessions').createIndex({ userId: 1 }),
    db.collection('reveal_counts').createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('users').createIndex({ flaggedAt: -1 }, { sparse: true }),
  ])
}

export async function practiceRoutes(app: FastifyInstance, db: Db, config: Config, store: ProgressStore) {
  // the key only changes on deploy (sync runs, then the service restarts), so it lives in memory
  const load = async (name: string) => new Map((await db.collection<KeyDoc>(name).find({}).toArray()).map((d) => [d._id, d]))
  const [key, coding, company] = await Promise.all([load('answer_keys'), load('coding_solutions'), load('company_questions')])
  if (!key.size) app.log.warn('answer key is empty: run `npm run sync:answers`')
  const { topics, coding: problems } = store.content
  const topicById = new Map(topics.map((t) => [t.id, t]))
  /** what a code reveal's attempt must differ from: the untouched starter isn't an attempt */
  const starters = new Map<string, string>([
    ...topics.flatMap((t) => t.codeChallenges.map((c) => [`challenge:${c.id}`, c.starter.code.trim()] as const)),
    ...problems.map((q) => [`coding:${q.id}`, q.starter.trim()] as const),
  ])
  const sessions = db.collection<Session>('exam_sessions')
  const counts = db.collection<{ _id: string; n: number; expireAt: Date }>('reveal_counts')
  const users = db.collection<{ _id: ObjectId; flaggedAt?: Date; flags?: { reason: string; at: Date }[] }>('users')

  const bump = async (counter: string, n: number) => {
    const doc = await counts.findOneAndUpdate(
      { _id: counter },
      { $inc: { n }, $setOnInsert: { expireAt: new Date(Date.now() + 2 * 86_400_000) } },
      { upsert: true, returnDocument: 'after' },
    )
    return doc?.n ?? n
  }
  const flag = (userId: string, reason: string) =>
    users.updateOne({ _id: userKey(userId) }, { $set: { flaggedAt: new Date() }, $push: { flags: { $each: [{ reason, at: new Date() }], $slice: -20 } } })

  /** Counts `n` released answers against today's caps; false (and a flag) once the account or IP is over. */
  const spend = async (req: FastifyRequest, n: number) => {
    if (n <= 0) return true
    const day = utcDay(0)
    const [account, ip] = await Promise.all([bump(`u:${req.user!.id}:${day}`, n), bump(`ip:${req.ip}:${day}`, n)])
    if (account <= LIMITS.revealsPerDay.account && ip <= LIMITS.revealsPerDay.ip) return true
    await flag(req.user!.id, account > LIMITS.revealsPerDay.account ? 'daily reveal cap (account)' : `daily reveal cap (IP ${req.ip})`)
    return false
  }
  const capped = () => httpError(429, 'REVEAL_LIMIT', 'Daily limit for answers reached; it resets at 00:00 UTC')

  /** mirrors practiceLocked in src/lib/stats.ts */
  const studyLocked = (p: Awaited<ReturnType<typeof store.load>>['progress'], topicId: string, kind: 'exam' | 'interview') => {
    const t = topicById.get(topicId)
    if (!t || p.settings.studyLock === 'off' || p.tests[topicId]?.passedAt) return false
    const read = new Set(p.sections[topicId] ?? [])
    if (t.sections.every((_, i) => read.has(i))) return false
    return kind === 'exam' || p.settings.studyLock === 'exam-interview'
  }

  const isCorrect = (qid: string, chosen: number[]) => sameSet(chosen, key.get(qid)!.correct as number[])
  const graded = (qid: string, chosen: number[]) => {
    const k = key.get(qid)!
    return { id: qid, chosen, correct: isCorrect(qid, chosen), correctOptions: k.correct, explanation: k.explanation, followUps: k.followUps ?? [] }
  }
  const ownSession = async (req: FastifyRequest, examId: string) => {
    const s = await sessions.findOne({ _id: examId })
    if (!s || s.userId !== req.user!.id) throw httpError(404, 'NOT_FOUND', 'No such exam')
    if (s.submittedAt) throw httpError(409, 'ALREADY_SUBMITTED', 'This exam was already submitted')
    return s
  }
  const startSession = async (req: FastifyRequest, topicId: string | null, questionIds: string[], full: boolean, minutes: number) => {
    // a question without its answer can't be graded: refuse before anything is counted or stored, instead of an exam
    // that fails on submit (the key loads at startup, so this means content shipped before `npm run sync:answers`)
    const unkeyed = questionIds.filter((q) => key.get(q)?.kind !== 'mcq')
    if (unkeyed.length) {
      req.log.warn({ topicId, missing: unkeyed.length }, 'exam refused: questions missing from the answer key')
      throw Object.assign(httpError(503, 'EXAMS_UNAVAILABLE', 'Exams are being updated. Try again in a few minutes.'), { expose: true })
    }
    const hour = new Date().toISOString().slice(0, 13)
    if ((await bump(`start:${req.user!.id}:${hour}`, 1)) > LIMITS.examStartsPerHour) {
      throw httpError(429, 'EXAM_LIMIT', `You can start ${LIMITS.examStartsPerHour} exams an hour; try again later`)
    }
    // over today's answer cap a submit returns only the score, and a short exam's score would still say which answers
    // are right: so no new exams until the cap resets
    const day = utcDay(0)
    const used = new Map((await counts.find({ _id: { $in: [`u:${req.user!.id}:${day}`, `ip:${req.ip}:${day}`] } }).toArray()).map((c) => [c._id, c.n]))
    if ((used.get(`u:${req.user!.id}:${day}`) ?? 0) >= LIMITS.revealsPerDay.account || (used.get(`ip:${req.ip}:${day}`) ?? 0) >= LIMITS.revealsPerDay.ip) throw capped()
    const s: Session = {
      _id: randomBytes(12).toString('hex'), userId: req.user!.id, topicId, full, questionIds,
      deadline: new Date(Date.now() + minutes * 60_000 + LIMITS.graceMs), answers: {}, locked: [],
      expireAt: new Date(Date.now() + 86_400_000),
    }
    await sessions.insertOne(s)
    return { examId: s._id, questionIds, full, deadline: new Date(s.deadline.getTime() - LIMITS.graceMs).toISOString() }
  }

  // ---- exams ----
  app.post('/api/exams/topic/:topicId/start', {
    preHandler: app.requireUser,
    schema: {
      params: strict({ topicId: id }),
      body: strict({ size: { type: 'integer', minimum: 1, maximum: LIMITS.examSizeMax }, minutes: { type: 'integer', minimum: 1, maximum: 180 } }, []),
    },
  }, async (req) => {
    const { topicId } = req.params as { topicId: string }
    const body = req.body as { size?: number; minutes?: number }
    const topic = topicById.get(topicId)
    if (!topic) throw httpError(404, 'NOT_FOUND', 'No such topic')
    const p = (await store.load(req.user!.id)).progress
    if (studyLocked(p, topicId, 'exam')) throw httpError(403, 'STUDY_FIRST', 'Mark every Learn section read (or pass the exam) to unlock it')
    const fullSize = topic.test.length
    const size = Math.min(body.size ?? fullSize, fullSize)
    const minutes = body.minutes ?? Math.ceil((size * p.settings.secondsPerQuestion) / 60)
    return startSession(req, topicId, sample(topic.test.map((q) => q.id), size), size === fullSize, minutes)
  })

  // mistakes drill: only questions this account has already answered
  app.post('/api/exams/drill/start', {
    preHandler: app.requireUser,
    schema: { body: strict({ questionIds: { type: 'array', minItems: 1, maxItems: LIMITS.examSizeMax, uniqueItems: true, items: id }, minutes: { type: 'integer', minimum: 1, maximum: 180 } }, ['questionIds']) },
  }, async (req) => {
    const body = req.body as { questionIds: string[]; minutes?: number }
    const p = (await store.load(req.user!.id)).progress
    if (!body.questionIds.every((q) => p.mcq[q])) throw httpError(403, 'NOT_ANSWERED', 'Drills only cover questions you have answered before')
    return startSession(req, null, body.questionIds, false, body.minutes ?? Math.ceil((body.questionIds.length * p.settings.secondsPerQuestion) / 60))
  })

  // interview mode: lock one answer in and see its feedback straight away
  app.post('/api/exams/:examId/answer', {
    preHandler: app.requireUser,
    schema: { params: strict({ examId: id }), body: strict({ questionId: id, choice }) },
  }, async (req) => {
    const { examId } = req.params as { examId: string }
    const { questionId, choice: chosen } = req.body as { questionId: string; choice: number[] }
    const s = await ownSession(req, examId)
    if (!s.questionIds.includes(questionId)) throw httpError(404, 'NOT_FOUND', 'That question is not in this exam')
    if (Date.now() > s.deadline.getTime()) throw httpError(409, 'TIME_UP', 'Time is up; submit the exam')
    if (!chosen.length) throw httpError(400, 'ATTEMPT_REQUIRED', 'Choose an answer first')
    if (s.locked.includes(questionId)) throw httpError(409, 'ALREADY_LOCKED', 'That answer is already locked in')
    // charge before locking: submit reveals every locked question, so a lock must never outlive a refused spend
    if (!(await spend(req, 1))) throw capped()
    const res = await sessions.updateOne(
      { _id: examId, locked: { $ne: questionId }, submittedAt: { $exists: false } },
      { $set: { [`answers.${questionId}`]: chosen }, $push: { locked: questionId } },
    )
    if (!res.modifiedCount) throw httpError(409, 'ALREADY_LOCKED', 'That answer is already locked in')
    return graded(questionId, chosen)
  })

  app.post('/api/exams/:examId/submit', {
    preHandler: app.requireUser,
    schema: {
      params: strict({ examId: id }),
      body: strict({ answers: { type: 'object', maxProperties: LIMITS.examSizeMax, additionalProperties: choice }, ...dayAndZone }),
    },
  }, async (req) => {
    const { examId } = req.params as { examId: string }
    const body = req.body as { answers: Record<string, number[]>; day: string; timeZone: string }
    if (!validTimeZone(body.timeZone)) throw httpError(400, 'VALIDATION', `Unknown time zone "${body.timeZone}"`)
    if (body.day < utcDay(-1) || body.day > utcDay(1)) throw httpError(400, 'VALIDATION', 'day must be the local date today')
    const s = await ownSession(req, examId)
    // answers that arrive after the timer (plus slack) don't count; locked-in ones always do
    const late = Date.now() > s.deadline.getTime()
    // only this exam's questions are kept: the body's keys are otherwise unchecked
    const sent = late ? {} : Object.fromEntries(s.questionIds.filter((q) => Object.hasOwn(body.answers, q)).map((q) => [q, body.answers[q]]))
    const answers = { ...sent, ...Object.fromEntries(s.locked.map((q) => [q, s.answers[q]])) }
    // claim the submission first, so a double click can't record the exam twice
    const claimed = await sessions.updateOne({ _id: examId, submittedAt: { $exists: false } }, { $set: { submittedAt: new Date(), answers } })
    if (!claimed.modifiedCount) throw httpError(409, 'ALREADY_SUBMITTED', 'This exam was already submitted')

    const reveal = await spend(req, s.questionIds.length - s.locked.length)
    const score = Math.round((s.questionIds.filter((q) => isCorrect(q, answers[q] ?? [])).length / s.questionIds.length) * 100)
    // over the cap only the score comes back: per-question right/wrong (here or in progress.mcq) would leak the key
    const items = s.questionIds.map((q) => (reveal || s.locked.includes(q) ? graded(q, answers[q] ?? []) : { id: q, chosen: answers[q] ?? [] }))
    const results = items.flatMap((i) => ('correct' in i ? [{ id: i.id, correct: i.correct }] : []))
    const ops = [
      ...(results.length ? [{ op: 'answers' as const, results }] : []),
      ...(s.full && s.topicId ? [{ op: 'test' as const, topicId: s.topicId, score }] : []),
    ]
    const { version, progress, earned } = await store.record(req.user!.id, ops, body.day, body.timeZone)
    return {
      score, late, items, earned, version, revealsLimited: !reveal,
      ...(s.topicId && { test: progress.tests[s.topicId] ?? null }),
    }
  })

  // ---- reveals: open the question (starts the clock), write an attempt, then see the answer ----
  // a key of its own, derived from the auth secret, so reveal tokens and session cookies never share one
  const revealKey = createHmac('sha256', config.authSecret).update('reveal-token').digest()
  const sign = (payload: string) => createHmac('sha256', revealKey).update(payload).digest('base64url')
  const revealParams = strict({ kind: { enum: Object.keys(REVEAL_KINDS) }, id })
  const answerFor = (kind: RevealKind, qid: string) =>
    kind === 'coding' ? coding.get(qid) : key.get(qid)?.kind === REVEAL_KINDS[kind] ? key.get(qid) : undefined

  app.post('/api/reveal/:kind/:id/open', { preHandler: app.requireUser, schema: { params: revealParams, body: strict({}, []) } }, async (req) => {
    const { kind, id: qid } = req.params as { kind: RevealKind; id: string }
    if (!answerFor(kind, qid)) throw httpError(404, 'NOT_FOUND', 'No such question')
    const payload = `${req.user!.id}|${kind}|${qid}|${Date.now()}`
    return { token: `${Buffer.from(payload).toString('base64url')}.${sign(payload)}` }
  })

  app.post('/api/reveal/:kind/:id', {
    preHandler: app.requireUser,
    schema: { params: revealParams, body: strict({ token: { type: 'string', maxLength: 400 }, attempt: { type: 'string', maxLength: 20_000 } }) },
  }, async (req) => {
    const { kind, id: qid } = req.params as { kind: RevealKind; id: string }
    const { token, attempt } = req.body as { token: string; attempt: string }
    const k = answerFor(kind, qid)
    if (!k) throw httpError(404, 'NOT_FOUND', 'No such question')

    const [encoded, mac] = token.split('.')
    const payload = Buffer.from(encoded ?? '', 'base64url').toString()
    const expected = Buffer.from(sign(payload))
    const given = Buffer.from(mac ?? '')
    const [uid, tkind, tid, issued] = payload.split('|')
    if (given.length !== expected.length || !timingSafeEqual(given, expected) || uid !== req.user!.id || tkind !== kind || tid !== qid) {
      throw httpError(400, 'BAD_TOKEN', 'Open the question first')
    }
    const age = (Date.now() - Number(issued)) / 1000
    if (!Number.isFinite(age) || age > 86_400) throw httpError(400, 'BAD_TOKEN', 'Open the question again')
    if (age < LIMITS.minAttemptSeconds) throw httpError(400, 'TOO_FAST', `Spend at least ${LIMITS.minAttemptSeconds} seconds on it first`)

    if (kind === 'interview' && studyLocked((await store.load(req.user!.id)).progress, k.topicId!, 'interview')) {
      throw httpError(403, 'STUDY_FIRST', 'Mark every Learn section read to unlock interview answers')
    }

    // a real attempt: long enough, not one repeated character, and for code not the untouched starter
    const text = attempt.trim()
    if (text.length < LIMITS.minAttemptChars || new Set(text.replace(/\s/g, '')).size < 6 || text === starters.get(`${kind}:${qid}`)) {
      if ((await bump(`junk:${req.user!.id}:${utcDay(0)}`, 1)) === LIMITS.junkToFlag) await flag(req.user!.id, 'repeated junk attempts')
      throw httpError(400, 'ATTEMPT_REQUIRED', `Write your own answer first (at least ${LIMITS.minAttemptChars} characters)`)
    }
    // one answer per token: a used one is kept until it would have expired anyway
    const used = await counts.updateOne({ _id: `tok:${mac}` }, { $setOnInsert: { n: 1, expireAt: new Date(Number(issued) + 86_400_000) } }, { upsert: true })
    if (!used.upsertedCount) throw httpError(400, 'BAD_TOKEN', 'Open the question again')
    if (!(await spend(req, 1))) throw capped()
    return strip(k)
  })

  // ---- company questions: the strong answer for a signed-in learner ----
  // a fresh session: a signed-out or deleted account can't keep pulling answers for the cookie cache's 5 minutes
  app.get('/api/company/:id', { preHandler: app.requireFreshUser, schema: { params: strict({ id }) } }, async (req) => {
    const { id: qid } = req.params as { id: string }
    const doc = company.get(qid)
    if (!doc) throw httpError(404, 'NOT_FOUND', 'No such company question')
    if (!(await spend(req, 1))) throw capped()
    return { id: qid, ...strip(doc) }
  })
}
