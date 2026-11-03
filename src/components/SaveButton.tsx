import { Lock, Star } from 'lucide-react';
import { isSaved, toggleSaved, useProgress, type SavedKind } from '../lib/progress';
import { useSession } from '../lib/session';
import { showToast } from '../lib/celebrate';

/** ☆ Save for later: puts this item on the Saved page. An account feature: signed out it only explains that.
 * Adapted from system-design-learn's SaveButton. */
export function SaveButton({ kind, id, compact = false }: { kind: SavedKind; id: string; compact?: boolean }) {
  const p = useProgress();
  const session = useSession();
  const on = isSaved(p, kind, id);
  if (session.status !== 'in') {
    return (
      <button
        type="button"
        className={`save-btn locked ${compact ? 'compact' : ''}`}
        aria-disabled="true"
        aria-label="Save for later (sign up to unlock)"
        title="Sign up to save for later"
        onClick={() => showToast('Sign up to save for later', 'Saved for later comes with an account.', 3000)}
      >
        <Lock size={13} aria-hidden="true" />
        {!compact && <span>Save</span>}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`save-btn ${on ? 'on' : ''} ${compact ? 'compact' : ''}`}
      aria-pressed={on}
      aria-label={compact ? (on ? 'Saved for later; remove from Saved' : 'Save for later') : undefined}
      title={on ? 'Remove from Saved' : 'Save for later'}
      onClick={() => {
        toggleSaved(kind, id);
        if (!on) showToast('Saved for later', 'Find it under Saved in the menu.', 2500);
      }}
    >
      <Star size={15} aria-hidden="true" fill={on ? 'currentColor' : 'none'} />
      {!compact && <span>{on ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
