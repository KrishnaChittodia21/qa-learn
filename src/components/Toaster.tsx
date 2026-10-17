import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PartyPopper, X } from 'lucide-react';
import { dismissToast, getToasts, subscribeToasts } from '../lib/celebrate';

/** Bottom-right toasts (auto-hide after 3s), announced politely to screen readers. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts);
  return (
    <div className="toaster" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            layout
            initial={{ opacity: 0, y: 40, scale: 0.8, rotate: 4 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, x: 60, rotate: 6, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          >
            <PartyPopper size={18} aria-hidden="true" className="toast-icon" />
            <div>
              <strong>{t.title}</strong>
              {t.detail && <div className="small muted">{t.detail}</div>}
            </div>
            <button type="button" className="btn-ghost icon-btn" aria-label="Dismiss" onClick={() => dismissToast(t.id)}>
              <X size={16} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
