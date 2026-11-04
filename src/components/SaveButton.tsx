import { Star } from 'lucide-react';
import { isSaved, toggleSaved, useProgress, type SavedKind } from '../lib/progress';
import { showToast } from '../lib/celebrate';

/** ☆ Save for later: puts this item on the Saved page. Adapted from system-design-learn's SaveButton. */
export function SaveButton({ kind, id, compact = false }: { kind: SavedKind; id: string; compact?: boolean }) {
  const p = useProgress();
  const on = isSaved(p, kind, id);
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
