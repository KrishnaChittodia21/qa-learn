import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { saveUiPrefs, useUiPrefs } from '../lib/uiPrefs';

/** A small dismissible tip shown until the learner closes it (remembered in UI prefs). */
export function CoachTip({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const prefs = useUiPrefs();
  const reduce = useReducedMotion();
  const visible = prefs.showCoachTips && !prefs.coachDismissed[id];
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.aside
          className="coach-tip"
          aria-label="Tip"
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: 'easeOut' }}
        >
          <span className="coach-icon mlabel" aria-hidden="true">
            Tip
          </span>
          <div>
            <strong>{title}</strong> {children}
          </div>
          <button
            type="button"
            className="icon-btn coach-x"
            aria-label="Dismiss tip"
            onClick={() => saveUiPrefs({ coachDismissed: { ...prefs.coachDismissed, [id]: true } })}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
