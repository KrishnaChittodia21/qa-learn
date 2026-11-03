// Profile, feedback and saved items (M3) against a real MongoDB (throwaway database). Skipped unless TEST_MONGODB_URI is set.
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { Db } from 'mongodb'
import { loadContent } from '../../scripts/content-split.ts'
import { buildApp, type App } from '../src/app.ts'
import { ensureAuthIndexes } from '../src/auth.ts'
import { loadConfig } from '../src/config.ts'
import type { Mail } from '../src/mail.ts'
import { NEEDS_DB, SECRET, TEST_URI, testDb, verifiedUser } from './helpers.ts'

const skip = NEEDS_DB
let db: Db
let drop: () => Promise<void>
let app: App
const outbox: Mail[] = []
let n = 0
const user = () => verifiedUser(app, outbox, `acct${n++}@example.com`)
const { topics } = await loadContent()
const t = topics[0]

before(async () => {
  if (skip) return
  ;({ db, drop } = await testDb())
  await ensureAuthIndexes(db)
  const config = { ...loadConfig({ MONGODB_URI: TEST_URI!, BETTER_AUTH_SECRET: SECRET, RATE_LIMIT_PER_MINUTE: '1000' }), logLevel: 'silent' }
  app = await buildApp(config, { db, mailer: { send: async (m) => { outbox.push(m) } } })
})
after(async () => {
  if (!skip) await drop()
})

test('a built-in avatar or initials; any other picture URL is refused; uploads are off without Cloudinary', { skip }, async () => {
  const b = await user()
  assert.equal((await b.req('PUT', '/api/me/avatar', { url: 'preset:fox' })).statusCode, 200)
  assert.equal((await b.req('GET', '/api/me')).json().image, 'preset:fox')
  for (const url of ['preset:not-an-avatar', 'https://evil.example/me.png', 'https://res.cloudinary.com/x/image/upload/qa-avatars/someone-else.png']) {
    assert.equal((await b.req('PUT', '/api/me/avatar', { url })).statusCode, 400, url)
  }
  assert.equal((await b.req('PUT', '/api/me/avatar', { url: null })).statusCode, 200)
  assert.equal((await b.req('GET', '/api/me')).json().image, null)
  const sign = await b.req('POST', '/api/me/avatar/sign', {})
  assert.equal(sign.statusCode, 503)
  assert.equal(sign.json().error.code, 'UPLOADS_OFF')
})

test('the name: 1 to 60 characters, not blank; the guide flag', { skip }, async () => {
  const b = await user()
  assert.equal((await b.req('PATCH', '/api/me', { name: '  Grace Hopper ' })).statusCode, 200)
  assert.equal((await b.req('GET', '/api/me')).json().name, 'Grace Hopper')
  for (const name of ['', '   ', 'x'.repeat(61)]) assert.equal((await b.req('PATCH', '/api/me', { name })).statusCode, 400, JSON.stringify(name))
  assert.equal((await b.req('PATCH', '/api/me', { role: 'admin' })).statusCode, 400, 'only name and prefs can change')
  assert.equal((await b.req('PATCH', '/api/me', {})).statusCode, 400)
  assert.equal((await b.req('PATCH', '/api/me', { prefs: { tourSeen: true } })).statusCode, 200)
  assert.equal((await b.req('GET', '/api/me')).json().prefs.tourSeen, true)
})

test('feedback: 5 an hour, each learner sees only their own, only admins read all and reply', { skip }, async () => {
  const ada = await user()
  const bob = await user()
  const send = (b: typeof ada, message: string) => b.req('POST', '/api/feedback', { type: 'bug', page: '/topic/x', message })
  assert.equal((await send(ada, 'too short')).statusCode, 400)
  for (let i = 0; i < 5; i++) assert.equal((await send(ada, `The exam timer looks wrong, report ${i}`)).statusCode, 201)
  assert.equal((await send(ada, 'One more report about the timer')).json().error.code, 'RATE_LIMITED')
  assert.equal((await send(bob, 'Please add a topic on contract testing')).statusCode, 201)
  assert.equal((await ada.req('GET', '/api/feedback')).json().length, 5)
  assert.deepEqual((await bob.req('GET', '/api/feedback')).json().map((f: { message: string }) => f.message), ['Please add a topic on contract testing'])

  assert.equal((await bob.req('GET', '/api/admin/feedback')).statusCode, 403)
  await db.collection('users').updateOne({ email: (await bob.req('GET', '/api/me')).json().email }, { $set: { role: 'admin' } })
  const all = (await bob.req('GET', '/api/admin/feedback')).json()
  assert.equal(all.length, 6)
  assert.ok(all.every((f: { email: string | null }) => f.email?.startsWith('acct')), 'admins see who sent each one')
  const replied = await bob.req('PATCH', `/api/admin/feedback/${all[0].id}`, { reply: 'Thanks, fixed in the next release.' })
  assert.equal(replied.json().status, 'replied')
  assert.equal(replied.json().reply.by, undefined, "the replier's id stays server-side")
})

test('saved items go through a progress batch; unknown kinds are refused', { skip }, async () => {
  const b = await user()
  const batch = (ops: object[]) => ({ batchId: `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`, baseVersion: 0, day: new Date().toISOString().slice(0, 10), timeZone: 'UTC', ops })
  assert.equal((await b.req('PATCH', '/api/progress', batch([{ op: 'saved', action: 'add', kind: 'shorts', ref: t.id }]))).statusCode, 400)
  const res = await b.req('PATCH', '/api/progress', batch([{ op: 'saved', action: 'add', kind: 'section', ref: `${t.id}:0` }, { op: 'saved', action: 'add', kind: 'pwlab', ref: 'step1' }]))
  assert.equal(res.statusCode, 200, res.body)
  const saved = (await b.req('GET', '/api/progress')).json().progress.saved
  assert.deepEqual(saved.map((s: { kind: string; ref: string }) => `${s.kind}:${s.ref}`), [`section:${t.id}:0`, 'pwlab:step1'])
})
