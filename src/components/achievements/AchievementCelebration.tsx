import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import Badge from './Badge';
import { achievementById, TIER_LABEL, type EarnedTier } from '../../content/achievements';
import { useFocusTrap } from '../../lib/useFocusTrap';
import { prefersReducedMotion } from '../../lib/appEvents';
import type { Unlocked } from '../../lib/useAchievements';

/** One confetti burst in the earned tiers' colours (read from the theme tokens). */
function burst(tiers: EarnedTier[]) {
  if (prefersReducedMotion()) return;
  const css = getComputedStyle(document.documentElement);
  const colors = [...new Set(tiers.flatMap((t) => [`--tier-${t}-hi`, `--tier-${t}-lo`]).concat('--accent', '--margin-rule'))]
    .map((name) => css.getPropertyValue(name).trim())
    // canvas-confetti only understands hex colours
    .filter((c) => /^#[0-9a-f]{3,8}$/i.test(c));
  import('canvas-confetti')
    .then(({ default: confetti }) => {
      const opts = { colors: colors.length ? colors : undefined, disableForReducedMotion: true, zIndex: 120 };
      confetti({ ...opts, particleCount: 110, spread: 75, startVelocity: 45, origin: { y: 0.55 } });
      setTimeout(() => confetti({ ...opts, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 200);
      setTimeout(() => confetti({ ...opts, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 200);
    })
    .catch(() => {
      // confetti is decoration; the dialog already says it
    });
}

/**
 * "Achievement unlocked" dialog. One item → the badge animates in large (scale + rotate + shine);
 * several (first load with existing progress, a big jump) → one combined grid. Focus-trapped; Esc,
 * the close button, a backdrop click or "Keep going" dismiss it.
 */
export default function AchievementCelebration({ items, onClose, onViewAll }: { items: Unlocked[]; onClose: () => void; onViewAll: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useFocusTrap(ref, true, onClose);
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    burst(items.map((i) => i.tier));
  }, [items]);

  const list = items.flatMap((i) => (achievementById[i.id] ? [{ ...i, a: achievementById[i.id] }] : []));
  const single = list.length === 1;
  const first = list[0];
  const pop = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { scale: 0.2, rotate: -200, opacity: 0 }, animate: { scale: 1, rotate: 0, opacity: 1 } };

  return (
    <div className="modal-backdrop ach-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        ref={ref}
        className={`modal ach-modal ${single ? '' : 'ach-modal-many'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ach-title"
        aria-describedby="ach-desc"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 30, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      >
        <button type="button" className="btn-ghost icon-btn ach-close" aria-label="Close" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>
        <p className="eyebrow ach-eyebrow">
          <Sparkles size={14} aria-hidden="true" /> {single ? 'Achievement unlocked!' : 'Achievements unlocked!'}
        </p>

        {single && first ? (
          <div className="ach-single">
            <div className="ach-hero" aria-hidden="true">
              <motion.div {...pop} transition={{ type: 'spring', stiffness: 170, damping: 14, delay: 0.1 }}>
                <Badge art={first.a.art} tier={first.tier} size="lg" shine />
              </motion.div>
            </div>
            <h2 id="ach-title">{first.a.name}</h2>
            {TIER_LABEL[first.tier] && <span className={`ach-tier-pill tier-${first.tier}`}>{TIER_LABEL[first.tier]} tier</span>}
            <p id="ach-desc" className="muted">
              {first.a.description}
            </p>
          </div>
        ) : (
          <>
            <h2 id="ach-title">Whoa, {list.length} new badges!</h2>
            <p id="ach-desc" className="muted">
              Look at you go. Here&apos;s everything your progress just unlocked.
            </p>
            <ul className="ach-burst-grid">
              {list.map((i, n) => (
                <motion.li
                  key={i.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 + Math.min(n, 16) * 0.05 }}
                >
                  <Badge art={i.a.art} tier={i.tier} size="md" />
                  <span className="ach-burst-name">{i.a.name}</span>
                  {TIER_LABEL[i.tier] && <span className="small muted">{TIER_LABEL[i.tier]}</span>}
                </motion.li>
              ))}
            </ul>
          </>
        )}

        <div className="ach-actions">
          <button type="button" className="btn" onClick={onViewAll}>
            View all achievements <ArrowRight size={15} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose} data-autofocus>
            Woohoo, keep going
          </button>
        </div>
      </motion.div>
    </div>
  );
}
