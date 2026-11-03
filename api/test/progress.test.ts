// Synced progress against a real MongoDB (throwaway database): batches, conflicts, resends, the one-time import,
// badges earned on the server and accounts kept apart. Skipped unless TEST_MONGODB_URI is set.
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { Db } from 'mongodb'
import { loadContent } from '../../scripts/content-split.ts'
import { buildApp, type App } from '../src/app.ts'
import { ensureAuthIndexes } from '../src/auth.ts'
import { loadConfig } from '../src/config.ts'
import type { Mail } from '../src/mail.ts'
import { Browser, NEEDS_DB, SECRET, TEST_URI, testDb, verifiedUser } from './helpers.ts'

const skip = NEEDS_DB
let db: Db
let drop: () => Promise<void>
let app: App
const outbox: Mail[] = []
const { topics } = await loadContent()
const t = topics.find((x) => x.id === 'mt-fundamentals')!
const today = () => new Date().toISOString().slice(0, 10)
let n = 0
const batch = (baseVersion: number, ops: object[], extra: object = {}) =>
  ({ batchId: `batch-${Date.now()}-${n++}`, baseVersion, day: today(), timeZone: 'Asia/Kolkata', ops, ...extra })

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

test('logged out: progress and /api/me are refused', { skip }, async () => {
  const anon = new Browser(app)
  assert.equal((await anon.req('GET', '/api/progress')).statusCode, 401)
  assert.equal((await anon.req('PATCH', '/api/progress', batch(0, [{ op: 'sectionsAll', topicId: t.id }]))).statusCode, 401)
  assert.equal((await anon.req('GET', '/api/me')).statusCode, 401)
})

test('a batch saves, earns a badge on the server, and shows on a second device', { skip }, async () => {
  const phone = await verifiedUser(app, outbox, 'sync@example.com')
  const first = await phone.req('GET', '/api/progress')
  assert.deepEqual([first.json().version, first.json().imported], [0, false])
  const res = await phone.req('PATCH', '/api/progress', batch(0, [{ op: 'section', topicId: t.id, index: 0, read: true }]))
  assert.equal(res.statusCode, 200, res.body)
  assert.equal(res.json().version, 1)
  assert.ok(res.json().earned.some((e: { id: string }) => e.id === 'hello-tester'), 'first section read earns the welcome badge')

  // the same account signed in on another device
  const laptop = new Browser(app, '10.50.0.1')
  assert.equal((await laptop.req('POST', '/api/auth/sign-in/email', { email: 'sync@example.com', password: 'a-good-password-1' })).statusCode, 200)
  const there = (await laptop.req('GET', '/api/progress')).json()
  assert.deepEqual(there.progress.sections[t.id], [0])
  assert.equal(there.progress.achievements['hello-tester'].tier, 'standard')
  assert.deepEqual(there.progress.activityDays, [today()])
  const me = (await laptop.req('GET', '/api/me')).json()
  assert.deepEqual([me.email, me.role], ['sync@example.com', 'user'])
})

test('a stale device gets 409 with the current copy; a resent batch is applied once', { skip }, async () => {
  const b = await verifiedUser(app, outbox, 'conflict@example.com')
  const body = batch(0, [{ op: 'section', topicId: t.id, index: 1, read: true }])
  assert.equal((await b.req('PATCH', '/api/progress', body)).json().version, 1)
  const resent = await b.req('PATCH', '/api/progress', body)
  assert.equal(resent.json().duplicate, true, 'a resend after a lost reply is not applied twice')
  assert.equal(resent.json().version, 1)
  const stale = await b.req('PATCH', '/api/progress', batch(0, [{ op: 'section', topicId: t.id, index: 2, read: true }]))
  assert.equal(stale.statusCode, 409)
  assert.equal(stale.json().error.code, 'VERSION_CONFLICT')
  assert.equal(stale.json().current.version, 1)
  assert.deepEqual(stale.json().current.progress.sections[t.id], [1])
})

test('the app cannot send exam results, unknown ops, a bad day or a bad time zone', { skip }, async () => {
  const b = await verifiedUser(app, outbox, 'cheat@example.com')
  const refused = async (body: object) => (await b.req('PATCH', '/api/progress', body)).statusCode
  assert.equal(await refused(batch(0, [{ op: 'test', topicId: t.id, score: 100 }])), 400, 'scores only come from server grading')
  assert.equal(await refused(batch(0, [{ op: 'answers', results: [{ id: t.test[0].id, correct: true }] }])), 400)
  assert.equal(await refused(batch(0, [{ op: 'section', topicId: t.id, index: 0, read: true, extra: 1 }])), 400)
  assert.equal(await refused(batch(0, [{ op: 'settings', settings: { passMark: 5 } }])), 400)
  assert.equal(await refused(batch(0, [{ op: 'sectionsAll', topicId: t.id }], { day: '2020-01-01' })), 400)
  assert.equal(await refused(batch(0, [{ op: 'sectionsAll', topicId: t.id }], { timeZone: 'Mars/Olympus' })), 400)
  assert.equal(await refused(batch(0, [])), 400)
  assert.equal((await b.req('GET', '/api/progress')).json().version, 0, 'nothing was written')
})

test('first-login import merges once, without exam passes, and earns badges from what it brought', { skip }, async () => {
  const b = await verifiedUser(app, outbox, 'import@example.com')
  const local = {
    sections: { [t.id]: [0, 1, 2] },
    tests: { [t.id]: { best: 100, last: 100, attempts: 1, passedAt: '2026-10-01T10:00:00.000Z', history: [{ at: '2026-10-01T10:00:00.000Z', score: 100 }] } },
    achievements: { 'hello-tester': { tier: 'standard', earnedAt: 1_700_000_000_000 }, 'release-candidate': { tier: 'diamond', earnedAt: 1 } },
    activityDays: ['2026-10-01'],
  }
  const res = await b.req('POST', '/api/progress/import', { progress: local, timeZone: 'Asia/Kolkata' })
  assert.equal(res.statusCode, 200, res.body)
  const p = res.json().progress
  assert.deepEqual(p.sections[t.id], [0, 1, 2])
  assert.equal(p.tests[t.id].passedAt, undefined, 'a pass only comes from a server-graded exam')
  assert.equal(p.achievements['hello-tester'].earnedAt, 1_700_000_000_000, 'a confirmed badge keeps its earlier local date')
  assert.equal(p.achievements['release-candidate'], undefined, 'an unearned badge is not taken')
  const again = await b.req('POST', '/api/progress/import', { progress: local, timeZone: 'Asia/Kolkata' })
  assert.equal(again.statusCode, 409)
  assert.equal(again.json().error.code, 'ALREADY_IMPORTED')
  assert.equal((await b.req('GET', '/api/progress')).json().imported, true)
})

test("one account can never read or change another's progress", { skip }, async () => {
  const ada = await verifiedUser(app, outbox, 'ada2@example.com')
  const bob = await verifiedUser(app, outbox, 'bob2@example.com')
  await ada.req('PATCH', '/api/progress', batch(0, [{ op: 'sectionsAll', topicId: t.id }]))
  const bobs = (await bob.req('GET', '/api/progress')).json()
  assert.deepEqual([bobs.version, bobs.progress.sections], [0, {}])
  await bob.req('PATCH', '/api/progress', batch(0, [{ op: 'reset' }]))
  assert.equal((await ada.req('GET', '/api/progress')).json().progress.sections[t.id].length, t.sections.length)
})

test('Shorts and step lessons sync: watched, quiz result and step misses are stored; bad values are refused', { skip }, async () => {
  const me = await verifiedUser(app, outbox, 'shorts@example.com')
  const res = await me.req('PATCH', '/api/progress', batch(0, [
    { op: 'short', id: 'test-pyramid', event: 'quiz-first' },
    { op: 'short', id: 'test-pyramid', event: 'watched' },
    { op: 'steps', topicId: t.id, index: 0, missed: 2 },
    { op: 'saved', action: 'add', kind: 'short', ref: 'test-pyramid' },
  ]))
  assert.equal(res.statusCode, 200, res.body)
  const p = (await me.req('GET', '/api/progress')).json().progress
  assert.equal(p.shorts['test-pyramid'].quiz, 'first')
  assert.equal(p.shorts['test-pyramid'].day, today())
  assert.equal(p.steps[`${t.id}:0`].missed, 2)
  assert.equal(p.saved[0].kind, 'short')
  assert.ok(res.json().earned.some((e: { id: string }) => e.id === 'opening-scene'), 'the first watched Short earns its badge on the server too')

  for (const op of [
    { op: 'short', id: 'test-pyramid', event: 'skipped' },
    { op: 'steps', topicId: t.id, index: 0, missed: -1 },
    { op: 'steps', topicId: t.id, index: 0, missed: 2, extra: true },
  ]) assert.equal((await me.req('PATCH', '/api/progress', batch(1, [op]))).statusCode, 400, JSON.stringify(op))
})
