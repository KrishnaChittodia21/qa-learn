import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { attemptOk, MIN_ATTEMPT_CHARS, type Reveal } from '../lib/answers';

/**
 * The button that asks qa-api for an answer (lib/answers.ts). Signed out it is a sign-up link; signed in it waits for
 * the question's clock and a real attempt, and says which one it is waiting for. Renders nothing once revealed.
 */
export function RevealButton<T>({ r, attempt, starter, label, what }: { r: Reveal<T>; attempt: string; starter?: string; label: string; what: string }) {
  const { pathname, search } = useLocation();
  if (r.answer || r.status === 'loading') return null;
  if (r.status === 'out') {
    return (
      <Link className="btn btn-line btn-sm" to={`/signup?next=${encodeURIComponent(pathname + search)}`}>
        <Lock size={14} aria-hidden="true" /> Sign up to {what}
      </Link>
    );
  }
  const ready = attemptOk(attempt, starter);
  const hint = !ready
    ? starter !== undefined && attempt.trim() === starter.trim()
      ? 'Change the starter first: your own attempt unlocks the reference.'
      : `Write your own answer first (at least ${MIN_ATTEMPT_CHARS} characters).`
    : r.wait > 0
      ? `Think it through: available in ${r.wait}s.`
      : '';
  return (
    <div className="reveal-gate">
      <button className="btn btn-line btn-sm" type="button" disabled={!ready || r.wait > 0 || r.busy} onClick={() => void r.reveal(attempt)}>
        {r.busy ? 'Checking…' : label}
      </button>
      {hint && (
        <span className="reveal-hint" aria-live="polite">
          {hint}
        </span>
      )}
      {r.error && (
        <p className="auth-err" role="alert">
          {r.error}
        </p>
      )}
    </div>
  );
}
