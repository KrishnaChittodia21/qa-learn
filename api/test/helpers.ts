// Shared test helpers, adapted from system-design-learn's api/test/helpers.ts.
import { MongoClient, type Db } from 'mongodb'
import type { App } from '../src/app.ts'
import type { Mail } from '../src/mail.ts'

export const ORIGIN = 'http://localhost:5173'
export const SECRET = 'test-secret-test-secret-test-secret-123'
export const TEST_URI = process.env.TEST_MONGODB_URI
/** pass as the `skip` option of tests that need a real mongod */
export const NEEDS_DB = !TEST_URI && 'set TEST_MONGODB_URI (a local mongod, never Atlas)'

/** A throwaway database, dropped by the returned `drop`. */
export async function testDb(): Promise<{ db: Db; drop: () => Promise<void> }> {
  const client = new MongoClient(TEST_URI!, { serverSelectionTimeoutMS: 5000, ignoreUndefined: true })
  await client.connect()
  const db = client.db(`qa_learn_test_${process.pid}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`)
  return { db, drop: async () => { await db.dropDatabase(); await client.close() } }
}

/** Calls the app the way a browser on ORIGIN would, keeping its cookies between requests. */
export class Browser {
  cookies = new Map<string, string>()
  app: App
  ip: string
  constructor(app: App, ip = '127.0.0.1') {
    this.app = app
    this.ip = ip
  }
  async req(method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, payload?: object) {
    const res = await this.app.inject({
      method, url, payload, remoteAddress: this.ip,
      headers: { origin: ORIGIN, cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ') },
    })
    for (const c of ([] as string[]).concat(res.headers['set-cookie'] ?? [])) {
      const [pair, ...attrs] = c.split(';')
      const [name, value] = pair.split('=')
      if (value === '' || attrs.some((a) => /max-age=0/i.test(a))) this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
    return res
  }
}

export const lastMail = (outbox: Mail[], subject: string, to?: string) =>
  [...outbox].reverse().find((m) => m.subject === subject && (!to || m.to === to))
export const linkIn = (mail: Mail | undefined) => new URL(mail!.text.match(/https?:\/\/\S+/)![0])
/** emails are sent in the background */
export const settle = () => new Promise((r) => setTimeout(r, 50))

/** Signs up and clicks the verification link; returns a logged-in browser. */
export async function verifiedUser(app: App, outbox: Mail[], email: string, password = 'a-good-password-1') {
  // own IP per user: signups are limited to 3 a minute per IP
  const b = new Browser(app, `10.1.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`)
  const res = await b.req('POST', '/api/auth/sign-up/email', { email, password, name: email.split('@')[0] })
  if (res.statusCode !== 200) throw new Error(`signup failed: ${res.body}`)
  await settle()
  const link = linkIn(lastMail(outbox, 'Confirm your email', email))
  await b.req('GET', link.pathname + link.search)
  // the link only confirms (autoSignInAfterVerification is off)
  const login = await b.req('POST', '/api/auth/sign-in/email', { email, password })
  if (login.statusCode !== 200) throw new Error(`sign-in failed: ${login.body}`)
  return b
}
