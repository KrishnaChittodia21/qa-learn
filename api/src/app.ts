// The qa-api service base (M1), adapted from system-design-learn's api/src/app.ts: one error format, a schema on
// every route that takes input, security headers, CORS for the qa-learn app only, rate limits and a health check.
// Sign-in (Better Auth) since M2.
import { timingSafeEqual } from 'node:crypto'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { fromNodeHeaders } from 'better-auth/node'
import Fastify, { type FastifyError, type FastifyRequest } from 'fastify'
import type { Db } from 'mongodb'
import { createAuth, SIGN_IN_FAILS, type Auth } from './auth.ts'
import type { Config } from './config.ts'
import { emailChecker, systemDns, type MailDns } from './email-check.ts'
import { createMailer, type Mailer } from './mail.ts'
import { practiceRoutes } from './practice.ts'
import { progressRoutes } from './progress.ts'

const TAKES_BODY = ['POST', 'PUT', 'PATCH']

/** Per-minute limits per IP for the auth routes people try to brute-force or spam; others use the global limit. */
const AUTH_LIMITS: Record<string, number> = {
  '/api/auth/sign-in/email': 5,
  '/api/auth/sign-up/email': 3,
  '/api/auth/request-password-reset': 3,
  '/api/auth/reset-password': 5,
  '/api/auth/send-verification-email': 3,
}

export type SessionUser = Auth['$Infer']['Session']['user']

declare module 'fastify' {
  interface FastifyInstance {
    auth: Auth
    /** preHandler: 401 unless logged in; sets req.user */
    requireUser: (req: FastifyRequest) => Promise<void>
    /** preHandler: 401 unless logged in, 403 unless admin */
    requireAdmin: (req: FastifyRequest) => Promise<void>
    /** requireUser without the 5-minute cookie cache, for reads that release answers */
    requireFreshUser: (req: FastifyRequest) => Promise<void>
  }
  interface FastifyRequest {
    user: SessionUser | null
  }
  interface FastifyContextConfig {
    /** the handler validates its own input, so the schema rule below does not apply */
    ownValidation?: boolean
  }
}

export const httpError = (statusCode: number, code: string, message: string) => Object.assign(new Error(message), { statusCode, code })

/** The service without a listener: server.ts starts it, tests call it with `app.inject`.
 * `dns`: the lookups for the sign-up email check; production uses the system resolver, elsewhere only the throwaway list applies */
export async function buildApp(config: Config, deps: { db: Db; mailer?: Mailer; dns?: MailDns }) {
  const app = Fastify({
    logger: config.logLevel === 'silent' ? false : {
      level: config.logLevel,
      redact: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-qa-proxy"]', 'res.headers["set-cookie"]'],
    },
    trustProxy: (_addr, hop) => hop < config.trustProxyHops,
    bodyLimit: 100_000, // progress batches are small; anything bigger is abuse
    // reject what doesn't match instead of quietly fixing it: stripping unknown fields also corrupts `oneOf` branches
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  })

  // only the frontend host's rewrite knows PROXY_SECRET: a call straight to the service URL, where the client IP can be
  // spoofed, is refused before it reaches a rate limit or a route. /health stays open for uptime pings
  if (config.proxySecret) {
    const expected = Buffer.from(config.proxySecret)
    app.addHook('onRequest', async (req, reply) => {
      if (req.url.split('?')[0] === '/health') return
      const given = Buffer.from(String(req.headers['x-qa-proxy'] ?? ''))
      if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
        return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Use the app at its own address' } })
      }
    })
  }

  // every route that takes input declares its shape, so nothing unchecked reaches Mongo
  app.addHook('onRoute', (route) => {
    if (route.config?.ownValidation) return
    const methods = ([] as string[]).concat(route.method)
    const missing = [
      methods.some((m) => TAKES_BODY.includes(m)) && !route.schema?.body && 'body',
      route.url.includes(':') && !route.schema?.params && 'params',
    ].filter(Boolean)
    if (missing.length) throw new Error(`${methods.join(',')} ${route.url} needs a schema for: ${missing.join(', ')}`)
  })

  // one error shape everywhere: { error: { code, message, details? } }
  app.setErrorHandler((err: FastifyError, req, reply) => {
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500
    // 5xx details stay in the log, unless the error was raised on purpose with a message meant for the user
    const hide = status >= 500 && !(err as { expose?: boolean }).expose
    if (hide) req.log.error(err)
    return reply.status(status).send({
      error: {
        code: err.validation ? 'VALIDATION' : hide ? 'INTERNAL' : err.code || 'ERROR',
        message: hide ? 'Something went wrong' : err.message,
        ...(err.validation && {
          details: err.validation.map((v) => ({ path: v.instancePath || String(v.params?.missingProperty ?? ''), message: v.message })),
        }),
      },
    })
  })

  await app.register(helmet)
  await app.register(cors, { origin: config.corsOrigins, credentials: true })
  await app.register(rateLimit, {
    max: config.rateLimitPerMinute,
    timeWindow: '1 minute',
    // shortcut: in-memory counts, fine for one instance; move to a shared store if the service ever runs on 2+
    errorResponseBuilder: (_req, ctx) => ({ statusCode: 429, code: 'RATE_LIMITED', message: `Too many requests, try again in ${ctx.after}` }),
  })
  // after the plugins, so 404s also get security headers and count towards the rate limit
  app.setNotFoundHandler({ preHandler: app.rateLimit() }, (req, reply) =>
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: `${req.method} ${req.url} does not exist` } }))

  // uptime pings hit this every few minutes; one bucket for everyone (callers can reach it without the proxy secret, so
  // their IP can't be trusted here) stops DB-ping floods
  app.get('/health', { config: { rateLimit: { max: 60, timeWindow: '1 minute', keyGenerator: () => 'health' } } }, async () => {
    await deps.db.command({ ping: 1 })
    return { ok: true }
  })

  // ---- sign-in (Better Auth) ----
  const checkEmail = emailChecker(deps.dns ?? (config.production ? systemDns() : undefined))
  const auth = createAuth(config, deps.db, deps.mailer ?? createMailer(config, app.log), app.log, undefined, checkEmail)
  app.decorate('auth', auth)
  app.decorateRequest('user', null)

  // the normalised path Better Auth routes on, so spellings like /api/auth/%2e/sign-in/email share the same limits
  const authPath = (req: FastifyRequest) => new URL(req.url, 'http://x').pathname
  // wrong passwords per email, independent of IP (TTL-cleaned after SIGN_IN_LOCK_MS): stops guessing from many addresses
  const signInFails = deps.db.collection<{ _id: string; n: number; at: Date }>('signin_fail')
  /** a Turnstile token (x-captcha-response) that Cloudflare accepts; without a key there is no check to pass */
  const humanCheck = async (req: FastifyRequest) => {
    const token = req.headers['x-captcha-response']
    if (!config.turnstileSecret || typeof token !== 'string' || !token) return false
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: config.turnstileSecret, response: token, remoteip: req.ip }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => null)
    return !!res?.ok && ((await res.json().catch(() => null)) as { success?: boolean } | null)?.success === true
  }
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    config: {
      ownValidation: true,
      rateLimit: {
        max: (req: FastifyRequest) => AUTH_LIMITS[authPath(req)] ?? config.rateLimitPerMinute,
        keyGenerator: (req: FastifyRequest) => `${req.ip}|${authPath(req)}`,
      },
    },
    async handler(req, reply) {
      const body = req.body as { email?: unknown } | undefined
      const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
      const signInEmail = authPath(req) === '/api/auth/sign-in/email' ? email : ''
      if (signInEmail) {
        // counted before the password check, so parallel guesses can't all slip under the limit
        const tries = (await signInFails.findOneAndUpdate({ _id: signInEmail }, { $inc: { n: 1 }, $setOnInsert: { at: new Date() } }, { upsert: true, returnDocument: 'after' }))?.n ?? 1
        // past the limit a human check is asked for instead of a hard lock, so nobody can lock someone else out by guessing
        if (tries > SIGN_IN_FAILS && !(await humanCheck(req))) {
          return reply.status(429).send({
            error: config.turnstileSecret
              ? { code: 'CAPTCHA_REQUIRED', message: 'Too many wrong passwords for this account. Complete the check below and try again.' }
              : { code: 'ACCOUNT_LOCKED', message: 'Too many wrong passwords for this account. Try again in 15 minutes, or reset your password.' },
          })
        }
      }
      const headers = fromNodeHeaders(req.headers)
      headers.set('x-client-ip', req.ip)
      const res = await auth.handler(new Request(new URL(req.url, config.appUrl), {
        method: req.method,
        headers,
        body: req.method === 'POST' ? JSON.stringify(req.body ?? {}) : undefined,
      }))
      // only a wrong password (401) stays counted
      if (signInEmail && res.ok) await signInFails.deleteOne({ _id: signInEmail })
      else if (signInEmail && res.status !== 401) await signInFails.updateOne({ _id: signInEmail }, { $inc: { n: -1 } })
      reply.status(res.status)
      res.headers.forEach((value, key) => { if (key !== 'set-cookie') reply.header(key, value) })
      const cookies = res.headers.getSetCookie()
      if (cookies.length) reply.header('set-cookie', cookies)
      return reply.send(res.body ? await res.text() : null)
    },
  })

  // fresh: skip the 5-minute cookie cache, so a demoted admin or a revoked session is refused at once
  const loadUser = async (req: FastifyRequest, fresh = false) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers), query: { disableCookieCache: fresh } })
    if (!session) throw httpError(401, 'UNAUTHENTICATED', 'Log in to continue')
    req.user = session.user
    return session.user
  }
  // writes also skip it, so a deleted account or a session revoked by a password reset can't write for those 5 minutes
  app.decorate('requireUser', async (req: FastifyRequest) => { await loadUser(req, req.method !== 'GET') })
  app.decorate('requireFreshUser', async (req: FastifyRequest) => { await loadUser(req, true) })
  app.decorate('requireAdmin', async (req: FastifyRequest) => {
    if ((await loadUser(req, true)).role !== 'admin') throw httpError(403, 'FORBIDDEN', 'Admins only')
  })

  const store = await progressRoutes(app, deps.db)
  await practiceRoutes(app, deps.db, config, store)

  return app
}

export type App = Awaited<ReturnType<typeof buildApp>>
