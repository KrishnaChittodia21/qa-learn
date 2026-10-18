import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { dismissToast, getToasts, subscribeToasts } from '../lib/celebrate';

/** Bottom-right toasts (auto-hide after 3s; above the dock on phones), announced politely to screen readers. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts);
  const reduce = useReducedMotion();
  return (
    <div className="toaster" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            layout={!reduce}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.16 } }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <span className="node pass toast-node" aria-hidden="true" />
            <div className="toast-b">
              <span className="toast-k">Run log</span>
              <strong>{t.title}</strong>
              {t.detail && <span className="toast-d">{t.detail}</span>}
            </div>
            <button type="button" className="icon-btn toast-x" aria-label="Dismiss" onClick={() => dismissToast(t.id)}>
              <X size={14} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
