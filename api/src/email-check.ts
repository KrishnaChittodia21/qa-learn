// Checks a sign-up email before the confirmation link is sent: throwaway inboxes are refused, and so are domains
// that can't receive mail (no mail server and no address in DNS). Whether the mailbox itself exists can't be checked
// without sending to it; the confirmation link stays the real test. Copied from system-design-learn's api/src/email-check.ts.
import { Resolver } from 'node:dns/promises'

/** Temporary-inbox services (and their sub-domains). A short list kept here rather than a dependency. */
export const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  '10minutemail.com', '10minutemail.net', '1secmail.com', '1secmail.net', '1secmail.org', 'burnermail.io',
  'crazymailing.com', 'discard.email', 'dispostable.com', 'emailfake.com', 'emailondeck.com', 'fakeinbox.com',
  'fakemail.net', 'getairmail.com', 'getnada.com', 'grr.la', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'harakirimail.com', 'inboxkitten.com', 'linshiyouxiang.net',
  'mail.tm', 'mailcatch.com', 'maildrop.cc', 'mailforspam.com', 'mailinator.com', 'mailnesia.com', 'mailpoof.com',
  'mailsac.com', 'minuteinbox.com', 'mintemail.com', 'moakt.com', 'mohmal.com', 'mytemp.email', 'nada.email',
  'sharklasers.com', 'spambox.us', 'spamgourmet.com', 'temp-mail.io', 'temp-mail.org', 'tempinbox.com',
  'tempmail.com', 'tempmail.plus', 'tempmailo.com', 'tempr.email', 'throwawaymail.com', 'trashmail.com',
  'trashmail.de', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
])

/** the DNS lookups the check needs (node:dns/promises, or a stand-in in tests) */
export interface MailDns {
  resolveMx(domain: string): Promise<{ exchange: string; priority: number }[]>
  resolve4(domain: string): Promise<string[]>
  resolve6(domain: string): Promise<string[]>
}

export type EmailVerdict = 'ok' | 'no-mail' | 'disposable'

const HOUR = 60 * 60_000
const CACHE_MAX = 5_000
// definite "doesn't exist" answers; anything else (timeout, server failure) is DNS trouble, not an answer
const NOT_FOUND = new Set(['ENOTFOUND', 'ENODATA'])
const code = (e: unknown) => (e as { code?: string })?.code ?? ''

export const isDisposable = (domain: string) => {
  const parts = domain.split('.')
  return parts.some((_, i) => DISPOSABLE_DOMAINS.has(parts.slice(i).join('.')))
}

/** true: takes mail; false: definitely doesn't; null: DNS trouble, no answer */
async function receivesMail(dns: MailDns, domain: string): Promise<boolean | null> {
  try {
    const mx = await dns.resolveMx(domain)
    // a "null MX" (RFC 7505: one record whose exchange is ".") says the domain takes no mail
    if (mx.length === 1 && (mx[0].exchange === '' || mx[0].exchange === '.')) return false
    if (mx.length) return true
  } catch (e) {
    if (!NOT_FOUND.has(code(e))) return null
  }
  // no MX record: mail goes to the domain's own address (RFC 5321 §5.1)
  for (const lookup of [dns.resolve4, dns.resolve6]) {
    try {
      if ((await lookup.call(dns, domain)).length) return true
    } catch (e) {
      if (!NOT_FOUND.has(code(e))) return null
    }
  }
  return false
}

/**
 * The sign-up check. Without `dns` only the throwaway list applies (local development and tests that don't pass one).
 * DNS trouble lets the sign-up through: a slow resolver must not lock real people out. Definite answers are cached
 * per domain for an hour.
 */
export function emailChecker(dns?: MailDns, now: () => number = Date.now) {
  const cache = new Map<string, { ok: boolean; at: number }>()
  return async (email: string): Promise<EmailVerdict> => {
    const at = email.lastIndexOf('@')
    const domain = email.slice(at + 1).trim().toLowerCase().replace(/\.$/, '')
    if (at < 1 || !domain) return 'ok' // not an email: Better Auth's own format check answers that
    if (isDisposable(domain)) return 'disposable'
    if (!dns) return 'ok'
    const hit = cache.get(domain)
    if (hit && now() - hit.at < HOUR) return hit.ok ? 'ok' : 'no-mail'
    const ok = await receivesMail(dns, domain)
    if (ok === null) return 'ok'
    if (cache.size >= CACHE_MAX) cache.clear()
    cache.set(domain, { ok, at: now() })
    return ok ? 'ok' : 'no-mail'
  }
}

/** the system resolver, with a short timeout: a sign-up waits at most ~2 s per lookup */
export function systemDns(): MailDns {
  const r = new Resolver({ timeout: 2_000, tries: 1 })
  return { resolveMx: (d) => r.resolveMx(d), resolve4: (d) => r.resolve4(d), resolve6: (d) => r.resolve6(d) }
}
