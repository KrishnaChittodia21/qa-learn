// Adapted from system-design-learn's api/src/mail.ts.
import nodemailer from 'nodemailer'
import type { FastifyBaseLogger } from 'fastify'
import type { Config } from './config.ts'

export const APP_NAME = 'QA.learn'

export interface Mail {
  to: string
  subject: string
  text: string
  /** the designed version; mail apps that can't show HTML fall back to text */
  html?: string
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** A one-button email. Tables and inline styles: most mail apps drop <style> and flexbox. */
export function buttonEmail(o: { heading: string; lines: string[]; button: string; url: string; note: string }) {
  const url = esc(o.url)
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#334155">${esc(t)}</p>`
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f1f5f9">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 16px;font-size:15px;font-weight:700;color:#0f172a">&#9670; ${APP_NAME}</td></tr>
<tr><td style="background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;padding:32px 28px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a">${esc(o.heading)}</h1>
${o.lines.map(p).join('\n')}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td style="border-radius:10px;background:#4f46e5">
<a href="${url}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px">${esc(o.button)}</a>
</td></tr></table>
<p style="margin:0 0 6px;font-size:13px;color:#64748b">Button not working? Paste this into your browser:</p>
<p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all"><a href="${url}" style="color:#4f46e5">${url}</a></p>
</td></tr>
<tr><td style="padding:16px 4px 0;font-size:12px;line-height:1.5;color:#94a3b8">${esc(o.note)}</td></tr>
</table></td></tr></table></body></html>`
}

export interface Mailer {
  send(mail: Mail): Promise<void>
}

/** SMTP: Gmail in development, a transactional provider in production. Without SMTP (dev only) the email goes to the log. */
export function createMailer(config: Config, log: FastifyBaseLogger): Mailer {
  const smtp = config.smtp
  if (!smtp) {
    return {
      async send(mail) {
        log.warn({ to: mail.to, subject: mail.subject }, `SMTP not set, email not sent. Body:\n${mail.text}`)
      },
    }
  }
  const auth = { user: smtp.user, pass: smtp.pass }
  // 587 upgrades to TLS (STARTTLS); 465 is TLS from the start
  const transport = smtp.host
    ? nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, auth })
    : nodemailer.createTransport({ service: 'gmail', auth })
  return {
    async send(mail) {
      await transport.sendMail({ from: `${APP_NAME} <${smtp.from}>`, ...mail })
    },
  }
}
