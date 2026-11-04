import { attemptOk, MIN_ATTEMPT_CHARS, type Reveal } from '../lib/answers';

/** Shows the answer once the learner has made a real attempt, and says what it is waiting for. Renders nothing once revealed. */
export function RevealButton<T>({ r, attempt, starter, label }: { r: Reveal<T>; attempt: string; starter?: string; label: string }) {
  if (r.answer) return null;
  const ready = attemptOk(attempt, starter);
  const hint = ready
    ? ''
    : starter !== undefined && attempt.trim() === starter.trim()
      ? 'Change the starter first: your own attempt unlocks the reference.'
      : `Write your own answer first (at least ${MIN_ATTEMPT_CHARS} characters).`;
  return (
    <div className="reveal-gate">
      <button className="btn btn-line btn-sm" type="button" disabled={!ready} onClick={r.reveal}>
        {label}
      </button>
      {hint && (
        <span className="reveal-hint" aria-live="polite">
          {hint}
        </span>
      )}
    </div>
  );
}
