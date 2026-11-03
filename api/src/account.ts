// Profile and feedback (M3): a built-in avatar or a picture uploaded straight to Cloudinary with signed params, and
// the "suggest content / report a bug" form. Adapted from system-design-learn's api/src/account.ts.
import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { ObjectId, type Db } from 'mongodb'
import { presetOf } from '../../src/lib/avatar-presets.ts'
import { httpError } from './app.ts'
import type { Config } from './config.ts'
import { strict } from './progress.ts'

const FOLDER = 'qa-avatars'
/** square crop around the face, applied by Cloudinary on upload, so a huge photo never reaches anyone */
const TRANSFORMATION = 'c_fill,g_face,w_256,h_256'
const FEEDBACK_PER_HOUR = 5

const userKey = (userId: string) => (ObjectId.isValid(userId) ? new ObjectId(userId) : userId) as ObjectId

/** Cloudinary's signature: the params sorted, joined as k=v&k=v, with the secret appended, SHA-1 */
export function cloudinarySign(params: Record<string, string | number>, secret: string) {
  const base = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(base + secret).digest('hex')
}

/** Removes the account's picture from Cloudinary (account deletion, or back to an avatar); best effort. */
export async function deleteAvatar(config: Config, userId: string) {
  const c = config.cloudinary
  if (!c) return
  // invalidate: the CDN drops its cached copy too, so the old picture stops showing
  const params = { invalidate: 'true', public_id: `${FOLDER}/${userId}`, timestamp: Math.floor(Date.now() / 1000) }
  const body = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), api_key: c.key, signature: cloudinarySign(params, c.secret) })
  await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/image/destroy`, { method: 'POST', body, signal: AbortSignal.timeout(5000) }).catch(() => undefined)
}

export async function ensureAccountIndexes(db: Db) {
  await Promise.all([
    db.collection('feedback').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('feedback').createIndex({ createdAt: -1 }),
    db.collection('feedback_sent').createIndex({ at: 1 }, { expireAfterSeconds: 3600 }),
  ])
}

export async function accountRoutes(app: FastifyInstance, db: Db, config: Config) {
  const users = db.collection('users')
  const feedback = db.collection('feedback')

  // ---- picture: the browser uploads straight to Cloudinary with these signed params, then saves the URL here ----
  app.post('/api/me/avatar/sign', { preHandler: app.requireUser, schema: { body: strict({}, []) } }, async (req) => {
    const c = config.cloudinary
    if (!c) throw Object.assign(httpError(503, 'UPLOADS_OFF', 'Picture uploads are not set up yet'), { expose: true })
    const params = {
      allowed_formats: 'jpg,jpeg,png,webp',
      folder: FOLDER,
      // a new picture replaces the old one at the same URL; invalidate makes the CDN fetch it instead of its cached copy
      invalidate: 'true',
      overwrite: 'true',
      public_id: req.user!.id,
      timestamp: Math.floor(Date.now() / 1000),
      transformation: TRANSFORMATION,
    }
    return { url: `https://api.cloudinary.com/v1_1/${c.cloud}/image/upload`, params: { ...params, api_key: c.key, signature: cloudinarySign(params, c.secret) } }
  })

  app.put('/api/me/avatar', {
    preHandler: app.requireUser,
    schema: { body: strict({ url: { type: ['string', 'null'], maxLength: 500 } }) },
  }, async (req) => {
    const { url } = req.body as { url: string | null }
    const c = config.cloudinary
    // a built-in avatar ("preset:fox"), or this account's own upload in our Cloudinary folder, so nobody can point
    // their picture at another site
    const own = c && url && new RegExp(`^https://res\\.cloudinary\\.com/${c.cloud}/image/upload/(v\\d+/)?${FOLDER}/${req.user!.id}\\.(jpg|jpeg|png|webp)$`).test(url)
    if (url !== null && !presetOf(url) && !own) throw httpError(400, 'VALIDATION', 'That picture was not uploaded through this app')
    const before = await users.findOneAndUpdate({ _id: userKey(req.user!.id) }, { $set: { image: url, updatedAt: new Date() } }, { returnDocument: 'before' })
    // an uploaded picture replaced by initials or a built-in avatar: remove the old file from Cloudinary
    const hadUpload = typeof before?.image === 'string' && before.image.startsWith('https://')
    if (hadUpload && !own) await deleteAvatar(config, req.user!.id)
    return { image: url }
  })

  // ---- feedback: signed-in learners write and read their own; admins read all and reply ----
  app.post('/api/feedback', {
    preHandler: app.requireUser,
    schema: {
      body: strict({
        type: { enum: ['content', 'bug'] },
        page: { type: 'string', maxLength: 200 },
        message: { type: 'string', minLength: 10, maxLength: 2000 },
      }),
    },
  }, async (req, reply) => {
    const body = req.body as { type: 'content' | 'bug'; page: string; message: string }
    // one atomic count per account per UTC hour, so parallel posts can't all pass a count taken before any insert
    const hour = await db.collection<{ _id: string; n: number; at: Date }>('feedback_sent').findOneAndUpdate(
      { _id: `${req.user!.id}:${new Date().toISOString().slice(0, 13)}` },
      { $inc: { n: 1 }, $setOnInsert: { at: new Date() } },
      { upsert: true, returnDocument: 'after' },
    )
    if ((hour?.n ?? 1) > FEEDBACK_PER_HOUR) throw httpError(429, 'RATE_LIMITED', 'Thanks! That is plenty for one hour; please send more later')
    await feedback.insertOne({ userId: req.user!.id, type: body.type, page: body.page, message: body.message.trim(), status: 'new', createdAt: new Date() })
    return reply.status(201).send({ ok: true })
  })

  /** what both sides see of one item; the reply's author stays server-side */
  const row = (f: Record<string, unknown>) => ({
    id: String(f._id), type: f.type, page: f.page, message: f.message, status: f.status, createdAt: f.createdAt,
    reply: f.reply ? { text: (f.reply as { text: string }).text, at: (f.reply as { at: Date }).at } : null,
  })

  // the learner's own reports with the team's reply, shown under the feedback form (in-app only, no email)
  app.get('/api/feedback', { preHandler: app.requireUser }, async (req) =>
    (await feedback.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(50).toArray()).map(row))

  app.get('/api/admin/feedback', { preHandler: app.requireAdmin }, async () => {
    const items = await feedback.find({}).sort({ createdAt: -1 }).limit(100).toArray()
    const ids = [...new Set(items.map((f) => f.userId as string))].map(userKey)
    // who sent it, for the admin only: learners never see anyone else's feedback
    const posters = new Map((await users.find({ _id: { $in: ids } }, { projection: { email: 1, name: 1, image: 1 } }).toArray()).map((u) => [String(u._id), u]))
    return items.map((f) => {
      const u = posters.get(f.userId)
      return { ...row(f), email: (u?.email as string) ?? null, name: (u?.name as string) ?? null, image: (u?.image as string) ?? null }
    })
  })

  // one reply per item (saving again replaces it), or close / reopen without replying
  app.patch('/api/admin/feedback/:id', {
    preHandler: app.requireAdmin,
    schema: {
      params: strict({ id: { type: 'string', pattern: '^[0-9a-f]{24}$' } }),
      body: { ...strict({ reply: { type: 'string', maxLength: 2000 }, status: { enum: ['new', 'closed'] } }, []), minProperties: 1, maxProperties: 1 },
    },
  }, async (req) => {
    const { id } = req.params as { id: string }
    const body = req.body as { reply?: string; status?: 'new' | 'closed' }
    const text = body.reply?.trim()
    if (body.reply !== undefined && !text) throw httpError(400, 'VALIDATION', 'Write a reply first')
    const set = text ? { reply: { text, at: new Date(), by: req.user!.id }, status: 'replied' } : { status: body.status }
    const updated = await feedback.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: set }, { returnDocument: 'after' })
    if (!updated) throw httpError(404, 'NOT_FOUND', 'No such feedback')
    return row(updated)
  })
}
