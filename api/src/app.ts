// The qa-api service base (M1), adapted from system-design-learn's api/src/app.ts: one error format, a schema on
// every route that takes input, security headers, CORS for the qa-learn app only, rate limits and a health check.
// Sign-in, progress and grading routes are added from M2 on.
import { timingSafeEqual } from 'node:crypto'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyError } from 'fastify'
import type { Db } from 'mongodb'
import type { Config } from './config.ts'

const TAKES_BODY = ['POST', 'PUT', 'PATCH']

declare module 'fastify' {
  interface FastifyContextConfig {
    /** the handler validates its own input, so the schema rule below does not apply */
    ownValidation?: boolean
  }
}

/** The service without a listener: server.ts starts it, tests call it with `app.inject`. */
export async function buildApp(config: Config, deps: { db: Db }) {
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

  return app
}

export type App = Awaited<ReturnType<typeof buildApp>>
