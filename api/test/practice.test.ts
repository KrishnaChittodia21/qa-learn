// Server grading and reveals against a real MongoDB (throwaway database) with the real answer key: no answer before
// an attempt, scores only from grading, accounts kept apart, and caps that stop a scripted scrape.
// Skipped unless TEST_MONGODB_URI is set.
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { Db } from 'mongodb'
import { buildAnswerKey, loadContent } from '../../scripts/content-split.ts'
import { buildApp, type App } from '../src/app.ts'
import { ensureAuthIndexes } from '../src/auth.ts'
import { loadConfig } from '../src/config.ts'
import type { Mail } from '../src/mail.ts'
import { LIMITS } from '../src/practice.ts'
import { syncAnswerKeys } from '../src/sync-answer-keys.ts'
import { Browser, NEEDS_DB, SECRET, TEST_URI, testDb, verifiedUser } from './helpers.ts'

const skip = NEEDS_DB
let db: Db
let drop: () => Promise<void>
let app: App
const outbox: Mail[] = []
const keys = await buildAnswerKey()
const { topics, coding, companyQuestions } = await loadContent()
const t = topics.find((x) => x.id === 'mt-fundamentals')!
const correctOf = (qid: string) => keys.answer_keys.find((k) => k._id === qid)!.correct as number[]
const zone = { day: new Date().toISOString().slice(0, 10), timeZone: 'Asia/Kolkata' }
let users = 0
const user = () => verifiedUser(app, outbox, `learner${users++}@example.com`)
/** a learner who has read every section of `t`, so its exam is unlocked */
const studied = async () => {
  const b = await user()
  const res = await b.req('PATCH', '/api/progress', { batchId: `read-${Date.now()}-${users}`, baseVersion: 0, ...zone, ops: [{ op: 'sectionsAll', topicId: t.id }] })
  assert.equal(res.statusCode, 200, res.body)
  return b
}

before(async () => {
  if (skip) return
  ;({ db, drop } = await testDb())
  await ensureAuthIndexes(db)
  await syncAnswerKeys(db, keys)
  const config = { ...loadConfig({ MONGODB_URI: TEST_URI!, BETTER_AUTH_SECRET: SECRET, RATE_LIMIT_PER_MINUTE: '1000' }), logLevel: 'silent' }
  app = await buildApp(config, { db, mailer: { send: async (m) => { outbox.push(m) } } })
})
after(async () => {
  if (!skip) await drop()
})

test('logged out: exams, reveals and company answers are refused', { skip }, async () => {
  const b = new Browser(app)
  assert.equal((await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).statusCode, 401)
  assert.equal((await b.req('POST', `/api/reveal/interview/${t.interviewQuestions[0].id}/open`, {})).statusCode, 401)
  assert.equal((await b.req('GET', `/api/company/${companyQuestions[0].id}`)).statusCode, 401)
})

test('the exam is locked until the lesson is read; the start reply holds no answers', { skip }, async () => {
  const fresh = await user()
  const locked = await fresh.req('POST', `/api/exams/topic/${t.id}/start`, {})
  assert.equal(locked.statusCode, 403)
  assert.equal(locked.json().error.code, 'STUDY_FIRST')

  const b = await studied()
  const start = await b.req('POST', `/api/exams/topic/${t.id}/start`, {})
  assert.equal(start.statusCode, 200, start.body)
  const exam = start.json()
  assert.equal(exam.full, true)
  assert.deepEqual([...exam.questionIds].sort(), t.test.map((q) => q.id).sort(), 'a full run is the whole pool, shuffled')
  assert.doesNotMatch(start.body, /correct|explanation/)
})

test('a full run is graded on the server: a pass, the answers, badges, and no second submit', { skip }, async () => {
  const b = await studied()
  const { examId, questionIds } = (await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).json()
  // all right except one, plus a stray answer for a question not in this exam
  const answers = Object.fromEntries(questionIds.map((q: string, i: number) => [q, i === 0 ? [9] : correctOf(q)]))
  answers['not-in-this-exam'] = [0]
  const res = await b.req('POST', `/api/exams/${examId}/submit`, { answers, ...zone })
  assert.equal(res.statusCode, 200, res.body)
  const r = res.json()
  assert.equal(r.score, Math.round(((questionIds.length - 1) / questionIds.length) * 100))
  assert.ok(r.test.passedAt, 'over the pass mark: the pass is recorded by the server')
  assert.equal(r.items.length, questionIds.length)
  assert.deepEqual(r.items[1].correctOptions, correctOf(questionIds[1]))
  assert.equal(typeof r.items[1].explanation, 'string')
  assert.ok(r.earned.some((e: { id: string }) => e.id === 'first-green-run'), 'first exam passed earns its badge')

  const p = (await b.req('GET', '/api/progress')).json().progress
  assert.equal(p.mcq[questionIds[0]].lastCorrect, false)
  assert.equal(p.mcq[questionIds[1]].lastCorrect, true)
  assert.equal(p.mcq['not-in-this-exam'], undefined)
  assert.equal((await b.req('POST', `/api/exams/${examId}/submit`, { answers, ...zone })).json().error.code, 'ALREADY_SUBMITTED')
})

test('a shorter run records answers but never counts towards passing', { skip }, async () => {
  const b = await studied()
  const { examId, questionIds, full } = (await b.req('POST', `/api/exams/topic/${t.id}/start`, { size: 3 })).json()
  assert.deepEqual([questionIds.length, full], [3, false])
  const r = (await b.req('POST', `/api/exams/${examId}/submit`, { answers: Object.fromEntries(questionIds.map((q: string) => [q, correctOf(q)])), ...zone })).json()
  assert.equal(r.score, 100)
  assert.equal(r.test, null)
})

test('interview mode: one locked answer graded at once, never changed, kept on submit', { skip }, async () => {
  const b = await studied()
  const { examId, questionIds } = (await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).json()
  const q = questionIds[0]
  const lock = await b.req('POST', `/api/exams/${examId}/answer`, { questionId: q, choice: correctOf(q) })
  assert.equal(lock.statusCode, 200, lock.body)
  assert.equal(lock.json().correct, true)
  assert.equal((await b.req('POST', `/api/exams/${examId}/answer`, { questionId: q, choice: [9] })).json().error.code, 'ALREADY_LOCKED')
  // the submit tries to change the locked answer; the locked one counts
  const r = (await b.req('POST', `/api/exams/${examId}/submit`, { answers: { [q]: [9] }, ...zone })).json()
  assert.equal(r.items.find((i: { id: string }) => i.id === q).correct, true)
})

test('answers sent after the timer do not count; another account cannot touch the exam', { skip }, async () => {
  const b = await studied()
  const other = await user()
  const { examId, questionIds } = (await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).json()
  const answers = Object.fromEntries(questionIds.map((q: string) => [q, correctOf(q)]))
  assert.equal((await other.req('POST', `/api/exams/${examId}/submit`, { answers, ...zone })).statusCode, 404)
  assert.equal((await other.req('POST', `/api/exams/${examId}/answer`, { questionId: questionIds[0], choice: [0] })).statusCode, 404)
  await db.collection('exam_sessions').updateOne({ _id: examId }, { $set: { deadline: new Date(Date.now() - 1000) } })
  const r = (await b.req('POST', `/api/exams/${examId}/submit`, { answers, ...zone })).json()
  assert.equal(r.late, true)
  assert.equal(r.score, 0)
})

test('mistakes drills only cover questions already answered', { skip }, async () => {
  const b = await studied()
  const [q] = t.test
  assert.equal((await b.req('POST', '/api/exams/drill/start', { questionIds: [q.id] })).json().error.code, 'NOT_ANSWERED')
  const { examId } = (await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).json()
  await b.req('POST', `/api/exams/${examId}/submit`, { answers: {}, ...zone })
  const drill = await b.req('POST', '/api/exams/drill/start', { questionIds: [q.id] })
  assert.equal(drill.statusCode, 200, drill.body)
  assert.equal(drill.json().full, false)
})

/** opens a question, then answers it at once (the token's time is signed, so the wait is lowered instead) */
async function reveal(b: Browser, kind: string, qid: string, attempt: string) {
  const { token } = (await b.req('POST', `/api/reveal/${kind}/${qid}/open`, {})).json()
  const saved = LIMITS.minAttemptSeconds
  LIMITS.minAttemptSeconds = 0
  try {
    return { token, res: await b.req('POST', `/api/reveal/${kind}/${qid}`, { token, attempt }) }
  } finally {
    LIMITS.minAttemptSeconds = saved
  }
}
const REAL = 'Boundary values: test 0, 1, 99 and 100; equivalence classes cover the rest of the range.'

test('reveals need time on the question and a real attempt; each token works once and for its owner only', { skip }, async () => {
  const b = await studied()
  const iq = t.interviewQuestions[0]
  const { token } = (await b.req('POST', `/api/reveal/interview/${iq.id}/open`, {})).json()
  assert.equal((await b.req('POST', `/api/reveal/interview/${iq.id}`, { token, attempt: REAL })).json().error.code, 'TOO_FAST')

  assert.equal((await reveal(b, 'interview', iq.id, 'too short')).res.json().error.code, 'ATTEMPT_REQUIRED')
  assert.equal((await reveal(b, 'interview', iq.id, 'a'.repeat(50))).res.json().error.code, 'ATTEMPT_REQUIRED', 'one repeated character is not an attempt')
  const ok = await reveal(b, 'interview', iq.id, REAL)
  assert.equal(ok.res.statusCode, 200, ok.res.body)
  assert.equal(typeof ok.res.json().modelAnswer, 'string')
  assert.ok(Array.isArray(ok.res.json().whatInterviewerLooksFor))
  assert.equal(ok.res.json().topicId, undefined, 'no key bookkeeping fields')

  const saved = LIMITS.minAttemptSeconds
  LIMITS.minAttemptSeconds = 0
  try {
    assert.equal((await b.req('POST', `/api/reveal/interview/${iq.id}`, { token: ok.token, attempt: REAL })).json().error.code, 'BAD_TOKEN', 'a used token')
    const other = await user()
    assert.equal((await other.req('POST', `/api/reveal/interview/${iq.id}`, { token: ok.token, attempt: REAL })).json().error.code, 'BAD_TOKEN', "someone else's token")
    assert.equal((await b.req('POST', `/api/reveal/drill/${iq.id}`, { token: ok.token, attempt: REAL })).statusCode, 404, 'an interview id is not a drill')
  } finally {
    LIMITS.minAttemptSeconds = saved
  }
})

test('code reveals refuse the untouched starter; every reveal kind returns its own answer fields', { skip }, async () => {
  const b = await studied()
  const lab = t.codeChallenges[0]
  assert.equal((await reveal(b, 'challenge', lab.id, lab.starter.code)).res.json().error.code, 'ATTEMPT_REQUIRED')
  assert.equal(typeof (await reveal(b, 'challenge', lab.id, `${lab.starter.code}\n// my fix: check the boundary first`)).res.json().solution.code, 'string')
  const problem = coding[0]
  assert.equal((await reveal(b, 'coding', problem.id, problem.starter)).res.json().error.code, 'ATTEMPT_REQUIRED')
  const sol = (await reveal(b, 'coding', problem.id, `${problem.starter}\n  return input.filter(Boolean); // attempt`)).res.json()
  assert.deepEqual([typeof sol.solution, typeof sol.explanation], ['string', 'string'])
  const drill = (await reveal(b, 'drill', t.envelopeQuestions[0].id, REAL)).res.json()
  assert.ok(Array.isArray(drill.steps) && typeof drill.answer === 'string')
})

test('with the stricter study lock, interview answers wait for the lesson too', { skip }, async () => {
  const b = await user()
  await b.req('PATCH', '/api/progress', { batchId: `lock-${Date.now()}`, baseVersion: 0, ...zone, ops: [{ op: 'settings', settings: { studyLock: 'exam-interview' } }] })
  assert.equal((await reveal(b, 'interview', t.interviewQuestions[0].id, REAL)).res.json().error.code, 'STUDY_FIRST')
})

test('company answers come to any signed-in learner', { skip }, async () => {
  const b = await user()
  const q = companyQuestions[0]
  const res = await b.req('GET', `/api/company/${q.id}`)
  assert.equal(res.statusCode, 200, res.body)
  assert.equal(res.json().answer, q.answer)
  assert.equal((await b.req('GET', '/api/company/no-such-question')).statusCode, 404)
})

test('past the daily cap: no more answers, no new exams, only the score, and the account is flagged', { skip }, async () => {
  const b = await studied()
  const saved = LIMITS.revealsPerDay.account
  LIMITS.revealsPerDay.account = 3
  try {
    const { examId, questionIds } = (await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).json()
    const r = (await b.req('POST', `/api/exams/${examId}/submit`, { answers: Object.fromEntries(questionIds.map((q: string) => [q, correctOf(q)])), ...zone })).json()
    assert.equal(r.revealsLimited, true)
    assert.equal(r.score, 100, 'the score still comes back')
    assert.ok(r.items.every((i: object) => !('correct' in i) && !('explanation' in i)), 'but not which answers were right')
    assert.equal((await b.req('POST', `/api/exams/topic/${t.id}/start`, {})).json().error.code, 'REVEAL_LIMIT')
    assert.equal((await b.req('GET', `/api/company/${companyQuestions[0].id}`)).json().error.code, 'REVEAL_LIMIT')
    const me = (await b.req('GET', '/api/me')).json()
    const flagged = await db.collection('users').findOne({ email: me.email })
    assert.ok(flagged?.flaggedAt)
    assert.match(flagged?.flags[0].reason, /daily reveal cap/)
  } finally {
    LIMITS.revealsPerDay.account = saved
  }
})
