// Synced progress (M2): one document per account, batched versioned writes, a one-time import of browser progress,
// and badges earned on the server. Adapted from system-design-learn's api/src/progress.ts.
import type { FastifyInstance } from 'fastify'
import { ObjectId, type Db } from 'mongodb'
import { loadContent } from '../../scripts/content-split.ts'
import { buildAchievementContext, evaluateAll, mergeEarned, newlyEarned, type StoredAchievement } from '../../src/content/achievements.ts'
import { PHASES } from '../../src/content/phases.ts'
import { PW_LAB_STEPS } from '../../src/content/pwlab.ts'
import { SHORTS_DATA } from '../../src/content/shorts.ts'
import type { Progress } from '../../src/lib/progress.ts'
import { applyOps, buildContentIndex, DEFAULT_PROGRESS, mergeImport, type Op } from '../../src/lib/progress-ops.ts'
import { httpError } from './app.ts'

interface ProgressDoc {
  /** the user id: one document per account */
  _id: string
  userId: string
  version: number
  progress: Progress
  imported?: boolean
  timeZone?: string
  /** ids of the last batches applied, so a batch resent after a lost reply is not applied twice */
  recentBatches?: string[]
  updatedAt: Date
}

const id = { type: 'string', minLength: 1, maxLength: 120, pattern: '^[\\w:./-]+$' } as const
const day = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' } as const
export const strict = (properties: Record<string, unknown>, required: string[] = Object.keys(properties)) =>
  ({ type: 'object', additionalProperties: false, required, properties }) as const

// exam scores and answer results ('test', 'answers') are recorded by the service when it grades, never sent by the app
const opSchemas = [
  strict({ op: { const: 'section' }, topicId: id, index: { type: 'integer', minimum: 0, maximum: 200 }, read: { type: 'boolean' } }),
  strict({ op: { const: 'sectionsAll' }, topicId: id }),
  strict({ op: { const: 'flag' }, bucket: { enum: ['boe', 'cc', 'code', 'company'] }, id, on: { type: 'boolean' } }),
  strict({ op: { const: 'rate' }, id, rating: { enum: ['nailed', 'partial', 'missed', null] } }),
  strict({ op: { const: 'draft' }, id, text: { type: 'string', maxLength: 20_000 } }),
  strict({
    op: { const: 'settings' },
    settings: strict({
      passMark: { type: 'integer', minimum: 50, maximum: 100 },
      secondsPerQuestion: { type: 'integer', minimum: 30, maximum: 300 },
      shuffle: { type: 'boolean' },
      theme: { enum: ['system', 'light', 'dark'] },
      studyLock: { enum: ['off', 'exam', 'exam-interview'] },
      accent: { enum: ['indigo', 'teal', 'rose', 'amber'] },
    }, []),
  }),
  strict({ op: { const: 'saved' }, action: { enum: ['add', 'remove', 'done'] }, kind: { enum: ['topic', 'section', 'interview', 'drill', 'company', 'coding', 'pwlab', 'short'] }, ref: id }),
  strict({ op: { const: 'short' }, id, event: { enum: ['watched', 'quiz-first', 'quiz-retry'] } }),
  strict({ op: { const: 'steps' }, topicId: id, index: { type: 'integer', minimum: 0, maximum: 200 }, missed: { type: 'integer', minimum: 0, maximum: 50 } }),
  strict({ op: { const: 'reset' } }),
]

export const validTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}
export const utcDay = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)
/** Better Auth stores user ids as ObjectIds in Mongo and hands them out as strings */
const userKey = (userId: string) => (ObjectId.isValid(userId) ? new ObjectId(userId) : userId)

export async function progressRoutes(app: FastifyInstance, db: Db) {
  const content = await loadContent()
  const { topics, coding, companyQuestions } = content
  const ix = buildContentIndex(topics, coding.map((q) => q.id), companyQuestions.map((q) => q.id), PW_LAB_STEPS.map((s) => s.id), SHORTS_DATA.map((s) => s.id))
  const achievementCtx = buildAchievementContext({ topics, phases: PHASES, coding, companyQuestions })
  const col = db.collection<ProgressDoc>('progress')
  const users = db.collection('users')

  /** Earns badges on the server from the stored progress; returns the newly earned ones for the celebration. */
  const award = (p: Progress, timeZone: string | undefined, at: number) => {
    const earned = newlyEarned(evaluateAll(p, { ...achievementCtx, timeZone }), p.achievements)
    return { progress: earned.length ? { ...p, achievements: mergeEarned(p.achievements, earned, at) } : p, earned }
  }
  const load = async (userId: string): Promise<ProgressDoc> =>
    (await col.findOne({ _id: userId })) ?? { _id: userId, userId, version: 0, progress: DEFAULT_PROGRESS, updatedAt: new Date(0) }

  /** Optimistic write: only lands if nobody else wrote since `doc.version`. False means a conflict. */
  const save = async (doc: ProgressDoc, set: Partial<ProgressDoc>, batchId?: string) => {
    try {
      const res = await col.updateOne(
        { _id: doc._id, version: doc.version },
        {
          $set: { ...set, version: doc.version + 1, updatedAt: new Date() },
          $setOnInsert: { userId: doc.userId },
          ...(batchId && { $push: { recentBatches: { $each: [batchId], $slice: -50 } } }),
        },
        { upsert: doc.version === 0 },
      )
      return res.matchedCount + res.upsertedCount === 1
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return false // another device created it first
      throw err
    }
  }
  // at most one write every 10 minutes per account
  const touch = (userId: string) =>
    users.updateOne(
      { _id: userKey(userId) as ObjectId, $or: [{ lastActiveAt: { $lt: new Date(Date.now() - 10 * 60_000) } }, { lastActiveAt: { $exists: false } }] },
      { $set: { lastActiveAt: new Date() } },
    )
  const conflict = (doc: ProgressDoc) => ({
    error: { code: 'VERSION_CONFLICT', message: 'Progress changed on another device; merge and resend' },
    current: { version: doc.version, progress: doc.progress },
  })

  /** Server-side changes (grading results): applied on top of whatever is stored, retrying if a device writes meanwhile. */
  const record = async (userId: string, ops: Op[], day: string, timeZone: string) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const doc = await load(userId)
      const now = new Date()
      const applied = applyOps(doc.progress, ops, ix, day, now.toISOString())
      const { progress, earned } = award(applied.progress, timeZone, now.getTime())
      if (await save(doc, { progress, timeZone })) {
        await touch(userId)
        return { version: doc.version + 1, progress, earned }
      }
    }
    throw new Error('progress kept changing while recording a result')
  }

  app.get('/api/progress', { preHandler: app.requireUser }, async (req) => {
    const doc = await load(req.user!.id)
    return { version: doc.version, progress: doc.progress, imported: !!doc.imported }
  })

  app.patch('/api/progress', {
    preHandler: app.requireUser,
    schema: {
      body: strict({
        batchId: { type: 'string', minLength: 8, maxLength: 64, pattern: '^[\\w-]+$' },
        baseVersion: { type: 'integer', minimum: 0 },
        day,
        timeZone: { type: 'string', maxLength: 64 },
        ops: { type: 'array', minItems: 1, maxItems: 200, items: { oneOf: opSchemas } },
      }),
    },
  }, async (req, reply) => {
    const body = req.body as { batchId: string; baseVersion: number; day: string; timeZone: string; ops: Op[] }
    if (!validTimeZone(body.timeZone)) throw httpError(400, 'VALIDATION', `Unknown time zone "${body.timeZone}"`)
    // the learner's local date is within a day of UTC anywhere on Earth
    if (body.day < utcDay(-1) || body.day > utcDay(1)) throw httpError(400, 'VALIDATION', 'day must be the local date today')
    const userId = req.user!.id
    const doc = await load(userId)
    if (doc.recentBatches?.includes(body.batchId)) return { version: doc.version, earned: [], skipped: [], duplicate: true }
    if (body.baseVersion !== doc.version) return reply.status(409).send(conflict(doc))

    const now = new Date()
    const applied = applyOps(doc.progress, body.ops, ix, body.day, now.toISOString())
    const { progress, earned } = award(applied.progress, body.timeZone, now.getTime())
    if (!(await save(doc, { progress, timeZone: body.timeZone }, body.batchId))) return reply.status(409).send(conflict(await load(userId)))
    await touch(userId)
    return { version: doc.version + 1, earned, skipped: applied.skipped }
  })

  app.post('/api/progress/import', {
    // once per account, and browser drafts alone may hold DRAFTS_MAX_CHARS (2M chars, up to 3 bytes each in UTF-8)
    bodyLimit: 8_000_000,
    // before the body is read, so only a logged-in account can send that much
    onRequest: app.requireUser,
    schema: { body: strict({ progress: { type: 'object' }, timeZone: { type: 'string', maxLength: 64 } }) },
  }, async (req, reply) => {
    const body = req.body as { progress: Record<string, unknown>; timeZone: string }
    if (!validTimeZone(body.timeZone)) throw httpError(400, 'VALIDATION', `Unknown time zone "${body.timeZone}"`)
    const doc = await load(req.user!.id)
    if (doc.imported) {
      return reply.status(409).send({ error: { code: 'ALREADY_IMPORTED', message: 'This account already imported browser progress' }, current: { version: doc.version, progress: doc.progress } })
    }
    const merged = mergeImport(doc.progress, body.progress, ix)
    const { progress, earned } = award({ ...merged, achievements: doc.progress.achievements }, body.timeZone, Date.now())
    progress.achievements = keepLocalDates(progress.achievements, body.progress.achievements)
    if (!(await save(doc, { progress, imported: true, timeZone: body.timeZone }))) return reply.status(409).send(conflict(await load(req.user!.id)))
    return { version: doc.version + 1, progress, earned }
  })

  // the signed-in account, for the app's header, profile and role checks
  app.get('/api/me', { preHandler: app.requireUser }, async (req) => {
    const u = await users.findOne({ _id: userKey(req.user!.id) as ObjectId })
    if (!u) throw httpError(401, 'UNAUTHENTICATED', 'Log in to continue')
    return {
      id: req.user!.id, email: u.email, name: u.name, image: u.image ?? null, role: u.role,
      prefs: { tourSeen: false, ...u.prefs }, lastActiveAt: u.lastActiveAt ?? null, createdAt: u.createdAt,
    }
  })

  // the profile basics (Better Auth's own update-user is off: it would store any name and any picture URL)
  app.patch('/api/me', {
    preHandler: app.requireUser,
    schema: {
      body: { ...strict({ name: { type: 'string', minLength: 1, maxLength: 60, pattern: '\\S' }, prefs: strict({ tourSeen: { type: 'boolean' } }, []) }, []), minProperties: 1 },
    },
  }, async (req) => {
    const body = req.body as { name?: string; prefs?: { tourSeen?: boolean } }
    const set: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name) set.name = body.name.trim()
    for (const [k, v] of Object.entries(body.prefs ?? {})) set[`prefs.${k}`] = v
    await users.updateOne({ _id: userKey(req.user!.id) as ObjectId }, { $set: set })
    return { ok: true }
  })

  return { ix, content, load, record }
}

export type ProgressStore = Awaited<ReturnType<typeof progressRoutes>>

/** For badges the server confirmed, keep the earlier earned dates the browser had (the real "earned on" day). */
function keepLocalDates(server: Record<string, StoredAchievement> | undefined, local: unknown): Record<string, StoredAchievement> | undefined {
  if (!server || !local || typeof local !== 'object') return server
  const out = { ...server }
  for (const [badge, s] of Object.entries(server)) {
    const l = (local as Record<string, { earnedAt?: unknown; tiers?: Record<string, unknown> }>)[badge]
    if (!l) continue
    const tiers = { ...s.tiers }
    for (const [tier, at] of Object.entries(l.tiers ?? {})) {
      const key = tier as keyof typeof tiers
      if (key in tiers && typeof at === 'number' && at > 0 && at < (tiers[key] ?? Infinity)) tiers[key] = at
    }
    const earnedAt = typeof l.earnedAt === 'number' && l.earnedAt > 0 ? Math.min(s.earnedAt, l.earnedAt) : s.earnedAt
    out[badge] = { ...s, tiers, earnedAt }
  }
  return out
}
