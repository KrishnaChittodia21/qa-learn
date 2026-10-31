// Sign in, create an account, forgot / reset password. Better Auth does the work on /api/auth; these pages are forms.
// Adapted from system-design-learn's src/pages/Auth.tsx.
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, MailCheck, Unlock } from 'lucide-react';
import { PasswordField } from '../components/PasswordField';
import { ApiError } from '../lib/api';
import { suggestEmail } from '../lib/emailHint';
import { requestPasswordReset, resendVerification, resetPassword, signIn, signUp, useSession } from '../lib/session';

const MIN_PASSWORD = 8;
const message = (e: unknown) => {
  if (!(e instanceof ApiError)) return 'Something went wrong. Please try again.';
  if (e.code === 'INVALID_EMAIL_OR_PASSWORD') return 'That email and password don’t match an account.';
  if (e.code === 'EMAIL_NOT_VERIFIED') return 'Confirm your email first with the link we emailed you (check spam too). Signing in sends a new one at most every 15 minutes.';
  if (e.code === 'USER_ALREADY_EXISTS' || e.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') return 'An account with this email already exists. Sign in instead.';
  if (e.code === 'RATE_LIMITED') return 'Too many tries. Wait a minute and try again.';
  return e.message;
};
/** only same-app paths, so a crafted ?next= can't send someone to another site */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/');

function AuthShell({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <div className="page auth-page">
      <Link to="/" className="auth-back">
        <ArrowLeft size={15} aria-hidden="true" /> Back to the course
      </Link>
      <section className="panel auth-card" aria-labelledby="auth-h">
        <h1 id="auth-h" className="auth-title">
          {title}
        </h1>
        {lead && <p className="auth-lead">{lead}</p>}
        {children}
      </section>
    </div>
  );
}

/** shown on sign in and sign up, so it is clear what an account adds */
const UNLOCKS = [
  'Your progress saved to your account, on every device',
  'Timed topic exams, graded the moment you submit',
  'Model interview answers, lab and coding solutions after you try',
  'Strong answers to real company interview questions',
  'Achievements, your study streak and Weak areas',
  'Mistakes drills of the questions you got wrong',
];
function Unlocks() {
  return (
    <section className="auth-unlocks" aria-labelledby="unlocks-h">
      <h2 id="unlocks-h">
        <Unlock size={16} aria-hidden="true" /> What your account unlocks
      </h2>
      <ul>
        {UNLOCKS.map((u) => (
          <li key={u}>
            <Check size={15} aria-hidden="true" /> {u}
          </li>
        ))}
      </ul>
      <p className="auth-alt">Lessons, animations and the Playground stay open without an account.</p>
    </section>
  );
}

function Field({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  if (input.type === 'password') return <PasswordField label={label} {...input} />;
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input className="auth-input" {...input} />
    </label>
  );
}

function Problem({ text }: { text: string }) {
  return text ? (
    <p className="auth-err" role="alert">
      {text}
    </p>
  ) : null;
}

/** Cloudflare Turnstile, only when the site key is configured (the service then requires the token on every form that sends an email) */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; 'expired-callback': () => void }) => string };
  }
}
function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !box.current) return;
    const el = box.current;
    const render = () => window.turnstile?.render(el, { sitekey: SITE_KEY, callback: onToken, 'expired-callback': () => onToken('') });
    if (window.turnstile) {
      render();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [onToken]);
  return SITE_KEY ? <div ref={box} className="auth-captcha" /> : null;
}

export function LoginPage() {
  const session = useSession();
  const [params] = useSearchParams();
  // read once: while the page animates out it sees the next URL, which has no ?next=
  const [next] = useState(() => safeNext(params.get('next')));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // after many wrong passwords on an account the service asks for the human check; each try needs a fresh widget
  const [check, setCheck] = useState(0);
  const [captcha, setCaptcha] = useState('');
  if (session.status === 'in') return <Navigate to={next} replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (check && SITE_KEY && !captcha) return setError('Please complete the check above the button.');
    setBusy(true);
    setError('');
    try {
      // no navigate here: the <Navigate> above takes over as soon as the session says signed in, and a second one
      // after the account's progress loads would pull the learner back if they had already moved on
      await signIn(email.trim(), password, captcha || undefined);
    } catch (err) {
      if (check || (err instanceof ApiError && err.code === 'CAPTCHA_REQUIRED')) {
        setCaptcha('');
        setCheck((n) => n + 1);
      }
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      title="Sign in"
      lead={
        params.get('link')
          ? `That confirmation link ${params.get('link') === 'expired' ? 'has expired (links last 1 hour)' : "didn't work"}. Sign in and we'll email you a new one.`
          : params.get('verified')
            ? 'Email confirmed. Sign in to start.'
            : params.get('reset')
              ? 'Password changed. Sign in with the new one.'
              : 'Your progress, exams and answers follow you to any device.'
      }
    >
      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {check > 0 && <Turnstile key={check} onToken={setCaptcha} />}
        <Problem text={error} />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-alt">
        <Link to="/forgot">Forgot your password?</Link> · New here? <Link to={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
      </p>
      <Unlocks />
    </AuthShell>
  );
}

export function SignupPage() {
  const session = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [resent, setResent] = useState(false);
  // a Turnstile token works once, also when the request fails: each failure gets a fresh widget
  const [round, setRound] = useState(0);
  const retry = (err: unknown) => {
    setCaptcha('');
    setRound((n) => n + 1);
    setError(message(err));
  };
  if (session.status === 'in') return <Navigate to="/" replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for the password.`);
    if (SITE_KEY && !captcha) return setError('Please complete the check above the button.');
    setBusy(true);
    setError('');
    try {
      await signUp(name.trim(), email.trim(), password, captcha || undefined);
      // a Turnstile token works once: the resend button below gets a fresh one
      setCaptcha('');
      setSent(true);
    } catch (err) {
      retry(err);
    } finally {
      setBusy(false);
    }
  };
  if (sent) {
    return (
      <AuthShell title="Check your email" lead={<>We sent a link to <strong>{email}</strong>. Open it to confirm your email, then sign in.</>}>
        <div className="auth-sent">
          <MailCheck size={28} aria-hidden="true" />
          <p>No email after a minute? Check spam, or send it again.</p>
        </div>
        {!resent && <Turnstile key={round} onToken={setCaptcha} />}
        <button
          className="btn"
          type="button"
          disabled={resent || (!!SITE_KEY && !captcha)}
          onClick={() => void resendVerification(email.trim(), captcha || undefined).then(() => setResent(true), retry)}
        >
          {resent ? 'Sent again' : 'Send the link again'}
        </button>
        <Problem text={error} />
        <p className="auth-alt">
          Confirmed on another device? <Link to="/login">Sign in</Link>
        </p>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Create your account" lead="Save your progress, take graded exams and see model answers after you try.">
      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        <Field label="Name" autoComplete="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {/* a likely typo in a common domain: one tap fixes it, and it never blocks sign-up */}
        {suggestEmail(email) && (
          <p className="auth-hint" role="status">
            Did you mean{' '}
            <button type="button" className="btn-ghost btn-xs" onClick={() => setEmail(suggestEmail(email)!)}>
              {suggestEmail(email)}
            </button>
            ?
          </p>
        )}
        <Field
          label={`Password (at least ${MIN_PASSWORD} characters)`}
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Turnstile key={round} onToken={setCaptcha} />
        <Problem text={error} />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="auth-alt">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      <Unlocks />
    </AuthShell>
  );
}

export function ForgotPage() {
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (SITE_KEY && !captcha) return setError('Please complete the check above the button.');
    setBusy(true);
    setError('');
    try {
      await requestPasswordReset(email.trim(), captcha || undefined);
      setSent(true);
    } catch (err) {
      // the token is spent even when the request fails: a fresh widget for the retry
      setCaptcha('');
      setRound((n) => n + 1);
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell title="Reset your password" lead={sent ? undefined : 'We’ll email you a link to choose a new one.'}>
      {sent ? (
        <div className="auth-sent">
          <MailCheck size={28} aria-hidden="true" />
          <p>
            If <strong>{email}</strong> has an account, a reset link is on its way. It works for one hour.
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={(e) => void submit(e)}>
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Turnstile key={round} onToken={setCaptcha} />
          <Problem text={error} />
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Sending…' : 'Email me a reset link'}
          </button>
        </form>
      )}
      <p className="auth-alt">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}

export function ResetPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  // Better Auth adds ?token= to the page URL (before the #); a hash-route query works too
  const outer = new URLSearchParams(window.location.search);
  const token = params.get('token') ?? outer.get('token') ?? '';
  const failed = params.get('error') ?? outer.get('error');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!token || failed) {
    return (
      <AuthShell title="This link has expired" lead="Reset links work once, for one hour.">
        <Link className="btn btn-primary" to="/forgot">
          Send a new link
        </Link>
      </AuthShell>
    );
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for the password.`);
    setBusy(true);
    setError('');
    try {
      await resetPassword(token, password);
      // drop the token from the address bar, then sign in with the new password
      window.history.replaceState(null, '', `${window.location.pathname}#/login?reset=1`);
      nav('/login?reset=1', { replace: true });
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell title="Choose a new password" lead="You’ll be signed out everywhere else.">
      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        <Field
          label={`New password (at least ${MIN_PASSWORD} characters)`}
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Problem text={error} />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthShell>
  );
}
