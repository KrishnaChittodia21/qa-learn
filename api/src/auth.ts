// Better Auth on the qa_learn database: email + password with verification and reset.
// Adapted from system-design-learn's api/src/auth.ts (no social sign-in and no app enrolment: this database is qa-learn's alone).
import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { captcha } from 'better-auth/plugins'
import type { FastifyBaseLogger } from 'fastify'
import { ObjectId, type Db } from 'mongodb'
import type { Config } from './config.ts'
import type { EmailVerdict } from './email-check.ts'
import { APP_NAME, buttonEmail, type Mailer } from './mail.ts'

/** emails one address can get per UTC hour (sign-up, resends and resets together) */
export const EMAILS_PER_ADDRESS_HOUR = 3
/** wrong passwords per email before sign-in to it is refused, counted from the first miss for SIGN_IN_LOCK_MS */
export const SIGN_IN_FAILS = 10
export const SIGN_IN_LOCK_MS = 15 * 60_000
/** collections holding one user's data, emptied when the account is deleted */
export const USER_DATA = ['progress', 'exam_sessions', 'feedback']

export function createAuth(
  config: Config,
  db: Db,
  mailer: Mailer,
  log: FastifyBaseLogger,
  onDeleted?: (userId: string) => Promise<void>,
  checkEmail: (email: string) => Promise<EmailVerdict> = async () => 'ok',
) {
  // the SMTP send is not awaited: replying at the same speed whether or not the email exists hides which emails have accounts
  // emails sent per UTC day, in Mongo so restarts and several instances share one count
  const quota = db.collection<{ _id: string; n: number }>('email_quota')
  const today = () => new Date().toISOString().slice(0, 10)
  // per-address counts per UTC hour (TTL-cleaned), so no one can flood an inbox or drain the day's quota on one address
  const perRecipient = db.collection<{ _id: string; n: number; at: Date }>('email_sent')
  const send = async (to: string, subject: string, text: string, html?: string) => {
    const hour = `${to.toLowerCase()}:${new Date().toISOString().slice(0, 13)}`
    const sent = await perRecipient.findOneAndUpdate({ _id: hour }, { $inc: { n: 1 }, $setOnInsert: { at: new Date() } }, { upsert: true, returnDocument: 'after' })
    // only the domain is logged, so the logs hold no addresses
    const domain = to.split('@')[1]
    if ((sent?.n ?? 1) > EMAILS_PER_ADDRESS_HOUR) return log.warn({ domain, subject }, 'email skipped: per-address hourly limit')
    // counts sent emails only; the before hook below is what stops new ones once the day is full
    mailer
      .send({ to, subject, text, html })
      .then(() => quota.updateOne({ _id: today() }, { $inc: { n: 1 } }, { upsert: true }))
      .catch((err) => log.error({ err, domain, subject }, 'email failed'))
  }
  const sendsEmail = new Set(['/sign-up/email', '/send-verification-email', '/request-password-reset'])
  // the last fifth of the day's quota is kept for password resets, so a sign-up flood can't lock people out
  const quotaFor = (path: string) => (path === '/request-password-reset' ? config.emailsPerDay : Math.floor(config.emailsPerDay * 0.8))
  const users = db.collection('users')
  // when each address last got a confirm link (TTL-cleaned); sign-in only resends after VERIFY_COOLDOWN_MS
  const verifySent = db.collection<{ _id: string; at: Date }>('verify_sent')
  const VERIFY_COOLDOWN_MS = 15 * 60_000
  return betterAuth({
    appName: APP_NAME,
    baseURL: config.appUrl,
    basePath: '/api/auth',
    secret: config.authSecret,
    trustedOrigins: config.corsOrigins,
    database: mongodbAdapter(db),
    telemetry: { enabled: false },
    // the profile changes through checked /api/me routes (M3); Better Auth's own route would store any name and image URL
    disabledPaths: ['/update-user'],
    // Fastify's limiter covers the auth routes (app.ts), so every 429 has the same shape
    rateLimit: { enabled: false },
    // app.ts sets this from Fastify's proxy-aware req.ip. A request sent straight to the service could spoof it, so
    // with PROXY_SECRET set those are refused (app.ts); sign-in also has a per-account limit and emails a per-address one
    advanced: { ipAddress: { ipAddressHeaders: ['x-client-ip'] } },
    user: {
      modelName: 'users',
      additionalFields: {
        role: { type: ['user', 'admin'], defaultValue: 'user', input: false },
      },
      // Profile → Delete account (with the password); everything the account owns goes with it
      deleteUser: {
        enabled: true,
        // the account is already gone here: every cleanup runs even if one fails, and failures are logged, not thrown
        afterDelete: async (user) => {
          const results = await Promise.allSettled([
            ...USER_DATA.map((c) => db.collection(c).deleteMany({ userId: user.id })),
            Promise.resolve(onDeleted?.(user.id)),
          ])
          for (const r of results) if (r.status === 'rejected') log.error({ err: r.reason, userId: user.id }, 'account cleanup failed')
        },
      },
    },
    // every login marks the account active (Admin's activity counts read it)
    databaseHooks: {
      session: {
        create: {
          after: async (session) => {
            await db.collection('users').updateOne({ _id: new ObjectId(session.userId) }, { $set: { lastActiveAt: new Date() } })
          },
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // a taken email is refused on the form, without sending anything (as in system-design-learn; the captcha and
        // rate limit keep it from being used to list accounts)
        const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : ''
        // sign-up takes the same profile rules as /api/me: no picture URL, a name of 1-60 characters
        if (ctx.path === '/sign-up/email') {
          const name = ctx.body?.name
          if (ctx.body?.image !== undefined) throw new APIError('BAD_REQUEST', { code: 'VALIDATION', message: 'Set a picture from your profile after signing up' })
          if (typeof name !== 'string' || name.length > 60 || !/\S/.test(name)) throw new APIError('BAD_REQUEST', { code: 'VALIDATION', message: 'Use a name of 1 to 60 characters' })
        }
        if (ctx.path === '/sign-up/email' && email && (await users.findOne({ email }, { projection: { _id: 1 } })))
          throw new APIError('UNPROCESSABLE_ENTITY', { code: 'USER_ALREADY_EXISTS', message: 'An account with this email already exists. Sign in instead.' })
        // a throwaway inbox or a domain that can't receive mail is refused before any email is sent
        if (ctx.path === '/sign-up/email' && email) {
          const verdict = await checkEmail(email)
          if (verdict === 'disposable') throw new APIError('BAD_REQUEST', { code: 'EMAIL_DISPOSABLE', message: 'Please use an email address you keep.' })
          if (verdict === 'no-mail') throw new APIError('BAD_REQUEST', { code: 'EMAIL_DOMAIN', message: "This email domain can't receive mail. Check the spelling." })
        }
        // out of emails for today: say so up front instead of making an account whose confirm email never comes
        if (!sendsEmail.has(ctx.path) || ((await quota.findOne({ _id: today() }))?.n ?? 0) < quotaFor(ctx.path)) return
        throw new APIError('TOO_MANY_REQUESTS', { code: 'EMAIL_QUOTA', message: 'We have sent all the emails we can for today. Please come back tomorrow.' })
      }),
    },
    // signed session copy in a cookie: most requests skip the DB; a role change or sign-out elsewhere lags up to 5 min
    // idle timeout: signed out after 1 h without requests; activity renews the expiry at most every 5 min
    session: { expiresIn: 60 * 60, updateAge: 5 * 60, cookieCache: { enabled: true, maxAge: 5 * 60 } },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      revokeSessionsOnPasswordReset: true,
      // a new password lifts the wrong-password limit (app.ts), as its message promises
      onPasswordReset: async ({ user }) => {
        await db.collection<{ _id: string }>('signin_fail').deleteOne({ _id: user.email.toLowerCase() })
      },
      sendResetPassword: async ({ user, url }) =>
        await send(
          user.email,
          'Reset your password',
          `Someone asked to reset the password for ${user.email}.\n\nReset it here (the link works for 1 hour):\n${url}\n\nIf it wasn't you, ignore this email.`,
          buttonEmail({
            heading: 'Reset your password',
            lines: [`Someone asked to reset the password for ${user.email}.`, 'Choose a new one with the button below. The link works for 1 hour.'],
            button: 'Choose a new password',
            url,
            note: "If it wasn't you, ignore this email. Your password stays the same.",
          }),
        ),
    },
    emailVerification: {
      sendOnSignUp: true,
      // an unconfirmed account gets a fresh link when it signs in (e.g. the first email never arrived), at most every 15 min
      sendOnSignIn: true,
      // the link only confirms: the owner then signs in with their own password, so a password someone else chose at
      // sign-up never ends up in an account its owner is using
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }, request) => {
        const fromSignIn = !!request && new URL(request.url).pathname.endsWith('/sign-in/email')
        if (fromSignIn && (await verifySent.findOne({ _id: user.email, at: { $gt: new Date(Date.now() - VERIFY_COOLDOWN_MS) } }))) return
        // the before hook only checks the quota on the routes that exist to send email; sign-in skips the resend once it is full
        if (fromSignIn && ((await quota.findOne({ _id: today() }))?.n ?? 0) >= quotaFor('/send-verification-email')) return
        await verifySent.updateOne({ _id: user.email }, { $set: { at: new Date() } }, { upsert: true })
        await send(
          user.email,
          'Confirm your email',
          `Welcome to ${APP_NAME}!\n\nConfirm your email to finish signing up:\n${url}`,
          buttonEmail({
            heading: `Welcome to ${APP_NAME}!`,
            lines: ['One step left: confirm your email and you are in. Your progress, exams and saved items will follow you to any device.'],
            button: 'Confirm my email',
            url,
            note: "You got this because someone signed up with this address. If it wasn't you, ignore it and no account is made.",
          }),
        )
      },
    },
    // the forms that send an email pass the Turnstile token in the x-captcha-response header
    plugins: config.turnstileSecret
      ? [captcha({ provider: 'cloudflare-turnstile', secretKey: config.turnstileSecret, endpoints: [...sendsEmail] })]
      : [],
  })
}

export type Auth = ReturnType<typeof createAuth>

/** Better Auth does not create Mongo indexes; the unique email index also stops a double signup race. */
export async function ensureAuthIndexes(db: Db) {
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('session').createIndex({ token: 1 }, { unique: true }),
    db.collection('session').createIndex({ userId: 1 }),
    db.collection('session').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('account').createIndex({ userId: 1 }),
    db.collection('verification').createIndex({ identifier: 1 }),
    db.collection('verification').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection('verify_sent').createIndex({ at: 1 }, { expireAfterSeconds: 3600 }),
    db.collection('email_sent').createIndex({ at: 1 }, { expireAfterSeconds: 3600 }),
    db.collection('signin_fail').createIndex({ at: 1 }, { expireAfterSeconds: SIGN_IN_LOCK_MS / 1000 }),
  ])
}
