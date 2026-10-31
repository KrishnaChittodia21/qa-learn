// Sign-in end to end against a real MongoDB (throwaway database). Ported from system-design-learn's api/test/auth.test.ts.
// Skipped unless TEST_MONGODB_URI is set: TEST_MONGODB_URI=mongodb://127.0.0.1:27017 npm test
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { Db } from 'mongodb'
import { buildApp, type App } from '../src/app.ts'
import { ensureAuthIndexes, USER_DATA } from '../src/auth.ts'
import { loadConfig } from '../src/config.ts'
import type { Mail } from '../src/mail.ts'
import { Browser, lastMail, linkIn, NEEDS_DB, ORIGIN, SECRET, settle, TEST_URI, testDb, verifiedUser } from './helpers.ts'

const skip = NEEDS_DB
const EMAIL = 'ada@example.com'
let db: Db
let drop: () => Promise<void>
let app: App
const outbox: Mail[] = []
const config = (extra: Record<string, string> = {}) =>
  ({ ...loadConfig({ MONGODB_URI: TEST_URI ?? 'x', BETTER_AUTH_SECRET: SECRET, RATE_LIMIT_PER_MINUTE: '1000', ...extra }), logLevel: 'silent' })

before(async () => {
  if (skip) return
  ;({ db, drop } = await testDb())
  await ensureAuthIndexes(db)
  app = await buildApp(config(), { db, mailer: { send: async (m) => { outbox.push(m) } } })
  app.get('/api/admin/test', { preHandler: app.requireAdmin }, async () => ({ ok: true }))
  app.get('/api/me-test', { preHandler: app.requireUser }, async (req) => ({ email: req.user?.email }))
})
after(async () => {
  if (!skip) await drop()
})

test('sign up → verify → log in → admin guard → reset → log out', { skip }, async () => {
  const me = new Browser(app)

  // sign up: no session until the email is confirmed
  const signup = await me.req('POST', '/api/auth/sign-up/email', { email: EMAIL, password: 'first-pass-123', name: 'Ada' })
  assert.equal(signup.statusCode, 200, signup.body)
  assert.equal((await me.req('GET', '/api/me-test')).statusCode, 401)
  assert.equal((await me.req('POST', '/api/auth/sign-in/email', { email: EMAIL, password: 'first-pass-123' })).statusCode, 403, 'unverified accounts cannot log in')
  await settle()
  const confirms = () => outbox.filter((m) => m.to === EMAIL && m.subject === 'Confirm your email').length
  assert.equal(confirms(), 1, 'signing in again within 15 minutes does not send another link')
  assert.match(lastMail(outbox, 'Confirm your email')!.text, /Welcome to QA\.learn/)

  // the verification link confirms the email but does not sign in: the owner signs in with their own password
  const verify = linkIn(lastMail(outbox, 'Confirm your email'))
  assert.equal(verify.origin, ORIGIN, 'links point at the frontend, which forwards /api to the service')
  const verified = await me.req('GET', verify.pathname + verify.search)
  assert.ok([200, 302].includes(verified.statusCode), verified.body)
  const user = await db.collection('users').findOne({ email: EMAIL })
  assert.equal(user?.emailVerified, true)
  assert.equal(user?.role, 'user')
  assert.equal((await me.req('GET', '/api/me-test')).statusCode, 401, 'confirming is not signing in')
  const login = await me.req('POST', '/api/auth/sign-in/email', { email: EMAIL, password: 'first-pass-123' })
  assert.equal(login.statusCode, 200, login.body)
  assert.match(String(login.headers['set-cookie']), /HttpOnly/i)
  assert.equal((await me.req('GET', '/api/me-test')).json().email, EMAIL)
  assert.ok((await db.collection('users').findOne({ email: EMAIL }))?.lastActiveAt, 'signing in marks the account active')

  // the same email again, any case: refused on the form, no second account, no email spent on it
  const mailsBefore = outbox.length
  const dup = await new Browser(app, '10.9.9.9').req('POST', '/api/auth/sign-up/email', { email: EMAIL.toUpperCase(), password: 'other-pass-123', name: 'Eve' })
  assert.equal(dup.statusCode, 422, dup.body)
  assert.equal(dup.json().code, 'USER_ALREADY_EXISTS')
  await settle()
  assert.equal(outbox.length, mailsBefore)

  // a user is blocked from admin routes; an admin is not (checked against the database, not the cookie)
  assert.equal((await new Browser(app).req('GET', '/api/admin/test')).statusCode, 401)
  assert.equal((await me.req('GET', '/api/admin/test')).json().error.code, 'FORBIDDEN')
  await db.collection('users').updateOne({ email: EMAIL }, { $set: { role: 'admin' } })
  assert.equal((await me.req('GET', '/api/admin/test')).statusCode, 200)

  // a role can't be set by the user at sign-up
  await new Browser(app).req('POST', '/api/auth/sign-up/email', { email: 'eve@example.com', password: 'eve-pass-1234', name: 'Eve', role: 'admin' })
  assert.notEqual((await db.collection('users').findOne({ email: 'eve@example.com' }))?.role, 'admin')

  // password reset by email; old password and old sessions stop working
  assert.equal((await new Browser(app).req('POST', '/api/auth/request-password-reset', { email: EMAIL, redirectTo: `${ORIGIN}/#/reset` })).statusCode, 200)
  await settle()
  const resetLink = linkIn(lastMail(outbox, 'Reset your password'))
  const landing = await new Browser(app).req('GET', resetLink.pathname + resetLink.search)
  const token = new URL(String(landing.headers.location)).searchParams.get('token')
  assert.ok(token, `reset link should redirect with a token, got ${landing.statusCode}`)
  assert.equal((await new Browser(app).req('POST', '/api/auth/reset-password', { token, newPassword: 'second-pass-456' })).statusCode, 200)
  assert.equal((await me.req('GET', '/api/admin/test')).statusCode, 401, 'sessions are revoked on reset')
  assert.equal((await new Browser(app).req('POST', '/api/auth/sign-in/email', { email: EMAIL, password: 'first-pass-123' })).statusCode, 401)

  const again = new Browser(app)
  assert.equal((await again.req('POST', '/api/auth/sign-in/email', { email: EMAIL, password: 'second-pass-456' })).statusCode, 200)
  assert.equal((await again.req('POST', '/api/auth/sign-out', {})).statusCode, 200)
  assert.equal((await again.req('GET', '/api/me-test')).statusCode, 401)
})

test('throwaway inboxes and bad names are refused before any account or email', { skip }, async () => {
  const signUp = (body: object) => new Browser(app, '10.23.0.1').req('POST', '/api/auth/sign-up/email', { password: 'a-good-password-1', ...body })
  const throwaway = await signUp({ email: 'x@mailinator.com', name: 'X' })
  assert.equal(throwaway.json().code, 'EMAIL_DISPOSABLE')
  assert.equal((await signUp({ email: 'rules@example.com', name: 'Ok', image: 'https://evil.example/x.png' })).statusCode, 400)
  assert.equal((await signUp({ email: 'rules@example.com', name: 'x'.repeat(61) })).statusCode, 400)
  assert.equal(await db.collection('users').countDocuments({ email: { $in: ['x@mailinator.com', 'rules@example.com'] } }), 0)
})

test("once the day's emails run out, sign-up says come back tomorrow; resets keep the last fifth", { skip }, async () => {
  const quota = db.collection<{ _id: string; n: number }>('email_quota')
  const day = new Date().toISOString().slice(0, 10)
  await quota.updateOne({ _id: day }, { $set: { n: 230 } }, { upsert: true })
  const res = await new Browser(app, '10.8.8.8').req('POST', '/api/auth/sign-up/email', { email: 'late@example.com', password: 'a-good-password-1', name: 'Late' })
  assert.equal(res.json().code, 'EMAIL_QUOTA')
  assert.match(res.json().message, /tomorrow/)
  assert.equal(await db.collection('users').countDocuments({ email: 'late@example.com' }), 0)
  const reset = await new Browser(app, '10.8.8.9').req('POST', '/api/auth/request-password-reset', { email: EMAIL, redirectTo: `${ORIGIN}/#/reset` })
  assert.equal(reset.statusCode, 200, reset.body)
  await quota.deleteOne({ _id: day })
})

test('one address gets at most 3 emails an hour', { skip }, async () => {
  const email = 'inbox@example.com'
  await new Browser(app, '10.30.0.1').req('POST', '/api/auth/sign-up/email', { email, password: 'a-good-password-1', name: 'Inbox' })
  for (let i = 0; i < 5; i++) await new Browser(app, `10.30.1.${i + 1}`).req('POST', '/api/auth/request-password-reset', { email, redirectTo: `${ORIGIN}/#/reset` })
  await settle()
  assert.equal(outbox.filter((m) => m.to === email).length, 3)
})

test('sign-in attempts are limited per IP, and a spoofed X-Forwarded-For does not help', { skip }, async () => {
  const codes = []
  for (let i = 0; i < 6; i++) {
    codes.push((await new Browser(app, '10.0.0.9').req('POST', '/api/auth/sign-in/email', { email: 'nobody@example.com', password: `guess-${i}-xxxx` })).statusCode)
  }
  assert.deepEqual(codes, [401, 401, 401, 401, 401, 429])
  assert.equal((await new Browser(app, '10.0.0.10').req('POST', '/api/auth/sign-in/email', { email: 'nobody2@example.com', password: 'guess-x-xxxx' })).statusCode, 401)
  const spoofed = []
  for (let i = 0; i < 6; i++) {
    spoofed.push((await app.inject({
      method: 'POST', url: '/api/auth/sign-in/email', remoteAddress: '10.0.0.77',
      headers: { origin: ORIGIN, 'x-forwarded-for': `203.0.113.${i}` },
      payload: { email: 'nobody3@example.com', password: `guess-${i}-xxxx` },
    })).statusCode)
  }
  assert.equal(spoofed.at(-1), 429, String(spoofed))
  // dot-segment spellings of the path share the limit
  const dots = []
  for (let i = 0; i < 6; i++) dots.push((await new Browser(app, '10.24.0.1').req('POST', '/api/auth/%2e/sign-in/email', { email: 'dots@example.com', password: `guess-${i}-xxxx` })).statusCode)
  assert.equal(dots.at(-1), 429, String(dots))
})

test('wrong passwords lock one account for every IP, even in parallel; a reset unlocks it', { skip }, async () => {
  const email = 'target@example.com'
  await verifiedUser(app, outbox, email, 'right-pass-123')
  const res = await Promise.all(Array.from({ length: 30 }, (_, i) =>
    new Browser(app, `10.21.${i}.1`).req('POST', '/api/auth/sign-in/email', { email, password: `guess-${i}-xxxx` })))
  assert.equal(res.filter((r) => r.statusCode === 401).length, 10)
  assert.ok(res.filter((r) => r.statusCode === 429).every((r) => r.json().error.code === 'ACCOUNT_LOCKED'))
  // the owner resets the password by email, and the new one works straight away
  await new Browser(app, '10.20.2.1').req('POST', '/api/auth/request-password-reset', { email, redirectTo: `${ORIGIN}/#/reset` })
  await settle()
  const link = linkIn(lastMail(outbox, 'Reset your password', email))
  const token = new URL(String((await new Browser(app).req('GET', link.pathname + link.search)).headers.location)).searchParams.get('token')
  assert.equal((await new Browser(app).req('POST', '/api/auth/reset-password', { token, newPassword: 'brand-new-pass-1' })).statusCode, 200)
  assert.equal((await new Browser(app, '10.20.3.1').req('POST', '/api/auth/sign-in/email', { email, password: 'brand-new-pass-1' })).statusCode, 200)
})

test('with Turnstile on, too many wrong passwords ask for the check instead of locking the owner out', { skip }, async () => {
  const email = 'checked@example.com'
  await verifiedUser(app, outbox, email, 'right-pass-123')
  const guarded = await buildApp(config({ TURNSTILE_SECRET_KEY: 'test-turnstile-secret' }), { db, mailer: { send: async () => {} } })
  // Cloudflare's answer, stubbed: only the token "good" passes
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    if (!String(url).includes('turnstile/v0/siteverify')) return realFetch(url, init)
    return new Response(JSON.stringify({ success: new URLSearchParams(String(init?.body)).get('response') === 'good' }))
  }) as typeof fetch
  try {
    for (let i = 0; i < 10; i++) await new Browser(guarded, `10.22.${i}.1`).req('POST', '/api/auth/sign-in/email', { email, password: `guess-${i}-xxxx` })
    const sign = (password: string, captcha?: string) => guarded.inject({
      method: 'POST', url: '/api/auth/sign-in/email', remoteAddress: '10.22.50.1',
      headers: { origin: ORIGIN, ...(captcha && { 'x-captcha-response': captcha }) }, payload: { email, password },
    })
    assert.equal((await sign('right-pass-123')).json().error.code, 'CAPTCHA_REQUIRED', 'even the right password needs the check now')
    assert.equal((await sign('right-pass-123', 'bad')).json().error.code, 'CAPTCHA_REQUIRED')
    assert.equal((await sign('right-pass-123', 'good')).statusCode, 200, 'with the check, the owner gets in')
  } finally {
    globalThis.fetch = realFetch
    await guarded.close()
  }
})

test('on https the session cookie is Secure, HttpOnly and SameSite=Lax; other sites are refused', { skip }, async () => {
  const site = 'https://qa.example.com'
  const secure = await buildApp(config({ APP_URL: site }), { db, mailer: { send: async (m) => { outbox.push(m) } } })
  const call = (url: string, payload?: object, origin = site) =>
    secure.inject({ method: payload ? 'POST' : 'GET', url, payload, remoteAddress: '10.0.0.88', headers: { origin } })
  assert.equal((await call('/api/auth/sign-up/email', { email: 'tls@example.com', password: 'tls-pass-1234', name: 'Tls' })).statusCode, 200)
  await settle()
  const link = linkIn(lastMail(outbox, 'Confirm your email', 'tls@example.com'))
  await call(link.pathname + link.search)
  const login = await call('/api/auth/sign-in/email', { email: 'tls@example.com', password: 'tls-pass-1234' })
  const session = ([] as string[]).concat(login.headers['set-cookie'] ?? []).find((c) => /session_token=/.test(c))
  assert.ok(session, String(login.headers['set-cookie']))
  assert.match(session, /^__Secure-/)
  assert.match(session, /; Secure/i)
  assert.match(session, /; HttpOnly/i)
  assert.match(session, /; SameSite=Lax/i)
  assert.equal((await call('/api/auth/sign-in/email', { email: 'tls@example.com', password: 'tls-pass-1234' }, 'https://evil.example')).statusCode, 403)
  await secure.close()
})

test("Better Auth's update-user is off; deleting the account removes the user's data", { skip }, async () => {
  const email = 'leaving@example.com'
  const b = await verifiedUser(app, outbox, email, 'leaving-pass-1')
  assert.equal((await b.req('POST', '/api/auth/update-user', { image: 'https://evil.example/t.png', name: 'x'.repeat(5000) })).statusCode, 404)
  const user = await db.collection('users').findOne({ email })
  const userId = String(user!._id)
  for (const c of USER_DATA) await db.collection(c).insertOne({ userId, n: 1 })
  await db.collection('progress').insertOne({ userId: 'someone-else', n: 1 })
  const del = await b.req('POST', '/api/auth/delete-user', { password: 'leaving-pass-1' })
  assert.equal(del.statusCode, 200, del.body)
  await settle()
  assert.equal(await db.collection('users').countDocuments({ email }), 0)
  for (const c of USER_DATA) assert.equal(await db.collection(c).countDocuments({ userId }), 0, c)
  assert.equal(await db.collection('progress').countDocuments({ userId: 'someone-else' }), 1, "other users' data stays")
})
