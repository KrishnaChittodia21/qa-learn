// Adapted from system-design-learn's api/src/config.ts.
export interface Config {
  production: boolean
  mongoUri: string
  mongoDb: string
  port: number
  /** the frontend's origin; the service is reached through it (`/api/*` is rewritten), so login cookies are first-party */
  appUrl: string
  /** browser origins allowed to call the service (the frontend) */
  corsOrigins: string[]
  /** proxies in front of the service (Vercel rewrite + Render = 2); 0 locally. Decides which IP rate limits see */
  trustProxyHops: number
  /** when set, only requests carrying it in x-qa-proxy (added by the frontend host's rewrite) are served */
  proxySecret?: string
  rateLimitPerMinute: number
  logLevel: string
  authSecret: string
  /** Gmail when `host` is unset (development); a transactional provider such as Brevo in production */
  smtp?: { user: string; pass: string; host?: string; port: number; from: string }
  /** Cloudflare Turnstile on sign-up; off when unset, required in production */
  turnstileSecret?: string
  emailsPerDay: number
}

/** Reads and checks the environment once at startup, so a bad setting stops the service instead of failing later. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const errors: string[] = []
  const production = env.NODE_ENV === 'production'
  const whole = (name: string, fallback: number) => {
    const n = Number(env[name] ?? fallback)
    if (!Number.isInteger(n) || n < 0) errors.push(`${name} must be a whole number, got "${env[name]}"`)
    return n
  }
  const origin = /^https?:\/\/[^/]+$/
  // trimmed: a space pasted into a dashboard field is invisible there
  const appUrl = env.APP_URL?.trim() || 'http://localhost:5173'
  if (!origin.test(appUrl)) errors.push(`APP_URL: "${appUrl}" must look like https://host (no path)`)
  const origins = (env.CORS_ORIGINS ?? appUrl).split(',').map((s) => s.trim()).filter(Boolean)
  for (const o of origins) if (!origin.test(o)) errors.push(`CORS_ORIGINS: "${o}" must look like https://host (no path)`)
  if (!env.MONGODB_URI) errors.push('MONGODB_URI is not set')
  if ((env.BETTER_AUTH_SECRET ?? '').length < 32) errors.push('BETTER_AUTH_SECRET must be at least 32 characters (openssl rand -base64 32)')
  // both halves of the SMTP login, or neither
  if (!env.SMTP_USER !== !env.SMTP_PASS) errors.push('SMTP_USER and SMTP_PASS must be set together')
  const smtpLogin = env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  const smtpHost = env.SMTP_HOST || undefined
  // a provider's SMTP login is not an address people can reply to, so it needs its own verified sender
  if (smtpLogin && smtpHost && !env.SMTP_FROM) errors.push('SMTP_FROM (the verified sender address) is required with SMTP_HOST')
  if (env.SMTP_FROM && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SMTP_FROM)) errors.push(`SMTP_FROM must be an email address, got "${env.SMTP_FROM}"`)
  if (production) {
    // without these, verification links would only reach the logs and sign-up would have no CAPTCHA
    if (!smtpLogin) errors.push('SMTP_USER and SMTP_PASS are required in production')
    if (!env.TURNSTILE_SECRET_KEY) errors.push('TURNSTILE_SECRET_KEY is required in production (sign-up CAPTCHA)')
    if (!appUrl.startsWith('https://')) errors.push('APP_URL must be https in production')
    // without it the Render URL answers anyone directly, with a client IP they can fake
    if ((env.PROXY_SECRET ?? '').length < 32) errors.push('PROXY_SECRET (at least 32 characters, the same value as on the frontend host) is required in production')
  }

  const config: Config = {
    production,
    mongoUri: env.MONGODB_URI ?? '',
    mongoDb: env.MONGODB_DB || 'qa_learn',
    port: whole('PORT', 3001),
    appUrl,
    corsOrigins: origins,
    trustProxyHops: whole('TRUST_PROXY_HOPS', 0),
    proxySecret: env.PROXY_SECRET || undefined,
    rateLimitPerMinute: whole('RATE_LIMIT_PER_MINUTE', 120),
    logLevel: env.LOG_LEVEL || 'info',
    authSecret: env.BETTER_AUTH_SECRET ?? '',
    smtp: smtpLogin && { ...smtpLogin, host: smtpHost, port: whole('SMTP_PORT', 587), from: env.SMTP_FROM || smtpLogin.user },
    turnstileSecret: env.TURNSTILE_SECRET_KEY || undefined,
    // Brevo's free plan sends 300 a day; a little under leaves room for a race
    emailsPerDay: whole('EMAILS_PER_DAY', 280),
  }
  if (errors.length) throw new Error(`Bad config (see .env.example):\n- ${errors.join('\n- ')}`)
  return config
}
