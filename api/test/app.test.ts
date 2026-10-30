// The service base (M1): errors, schemas, headers, CORS, rate limits, config checks. No database needed.
// Adapted from system-design-learn's api/test/app.test.ts. Run: npm test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Db } from 'mongodb'
import { buildApp } from '../src/app.ts'
import { loadConfig, type Config } from '../src/config.ts'

const ORIGIN = 'http://localhost:5173'
const config: Config = { ...loadConfig({ MONGODB_URI: 'mongodb://unused' }), logLevel: 'silent' }
const fakeDb = (command: () => Promise<unknown>) => ({ db: { command } as unknown as Db })
const okDb = fakeDb(async () => ({ ok: 1 }))

test('defaults: the qa_learn database on port 3001, CORS for the local app only', () => {
  assert.equal(config.mongoDb, 'qa_learn')
  assert.equal(config.port, 3001)
  assert.deepEqual(config.corsOrigins, [ORIGIN])
})

test('health pings the database', async () => {
  const app = await buildApp(config, okDb)
  const res = await app.inject('/health')
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.json(), { ok: true })
})

test('server errors use the error format and hide internals', async () => {
  const app = await buildApp(config, fakeDb(async () => { throw new Error('auth failed for user admin') }))
  const res = await app.inject('/health')
  assert.equal(res.statusCode, 500)
  assert.deepEqual(res.json(), { error: { code: 'INTERNAL', message: 'Something went wrong' } })
})

test('unknown routes use the error format and get security headers', async () => {
  const app = await buildApp(config, okDb)
  const res = await app.inject('/nope')
  assert.equal(res.statusCode, 404)
  assert.equal(res.json().error.code, 'NOT_FOUND')
  assert.equal(res.headers['x-content-type-options'], 'nosniff')
})

test('probing unknown routes is rate limited too', async () => {
  const app = await buildApp({ ...config, rateLimitPerMinute: 2 }, okDb)
  const codes = []
  for (let i = 0; i < 3; i++) codes.push((await app.inject(`/nope-${i}`)).statusCode)
  assert.deepEqual(codes, [404, 404, 429])
})

test('invalid input is rejected with details', async () => {
  const app = await buildApp(config, okDb)
  app.post('/echo', { schema: { body: { type: 'object', required: ['n'], properties: { n: { type: 'integer' } } } } }, async (req) => req.body)
  const res = await app.inject({ method: 'POST', url: '/echo', payload: { n: 'x' } })
  assert.equal(res.statusCode, 400)
  assert.equal(res.json().error.code, 'VALIDATION')
  assert.equal(res.json().error.details[0].path, '/n')
})

test('a route that takes input without a schema fails at startup', async () => {
  const app = await buildApp(config, okDb)
  assert.throws(() => app.post('/raw', async () => 'x'), /needs a schema for: body/)
  assert.throws(() => app.get('/items/:id', async () => 'x'), /needs a schema for: params/)
})

test('CORS allows only the qa-learn app', async () => {
  const app = await buildApp(config, okDb)
  const ok = await app.inject({ url: '/health', headers: { origin: ORIGIN } })
  assert.equal(ok.headers['access-control-allow-origin'], ORIGIN)
  const other = await app.inject({ url: '/health', headers: { origin: 'https://evil.example' } })
  assert.equal(other.headers['access-control-allow-origin'], undefined)
})

test('rate limit returns 429 in the error format; health has its own shared limit', async () => {
  const app = await buildApp({ ...config, rateLimitPerMinute: 2 }, okDb)
  app.get('/ping', async () => 'pong')
  const codes = []
  for (let i = 0; i < 3; i++) codes.push((await app.inject('/ping')).statusCode)
  assert.deepEqual(codes, [200, 200, 429])
  assert.equal((await app.inject('/ping')).json().error.code, 'RATE_LIMITED')
  for (let i = 0; i < 60; i++) assert.equal((await app.inject('/health')).statusCode, 200)
  assert.equal((await app.inject('/health')).statusCode, 429)
  // one bucket for every caller: a new (or faked) IP does not get a fresh 60
  assert.equal((await app.inject({ url: '/health', remoteAddress: '10.99.0.1' })).statusCode, 429)
})

test('with PROXY_SECRET set, only calls that came through the frontend host are served; /health stays open', async () => {
  const app = await buildApp({ ...config, proxySecret: 'proxy-secret-123' }, okDb)
  const call = (url: string, headers: Record<string, string> = {}) => app.inject({ method: 'GET', url, headers })
  assert.equal((await call('/api/anything')).statusCode, 403)
  assert.equal((await call('/api/anything', { 'x-qa-proxy': 'wrong-secret-123' })).statusCode, 403)
  assert.equal((await call('/api/anything', { 'x-qa-proxy': 'proxy-secret-123' })).statusCode, 404)
  assert.equal((await call('/health?x=1')).statusCode, 200)
  await app.close()
})

test('production refuses to start without https or a proxy secret', () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'x' }),
    (e: Error) => /APP_URL must be https/.test(e.message) && /PROXY_SECRET/.test(e.message),
  )
  assert.throws(() => loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'x', APP_URL: 'https://qa.example', PROXY_SECRET: 'short' }), /PROXY_SECRET/)
  const ok = loadConfig({ NODE_ENV: 'production', MONGODB_URI: 'x', APP_URL: 'https://qa.example', PROXY_SECRET: 'p'.repeat(32) })
  assert.equal(ok.production, true)
})

test('bad config stops startup with every problem listed', () => {
  assert.throws(
    () => loadConfig({ PORT: 'abc', CORS_ORIGINS: 'https://x.dev/path' }),
    (e: Error) => /PORT/.test(e.message) && /CORS_ORIGINS/.test(e.message) && /MONGODB_URI/.test(e.message),
  )
})
