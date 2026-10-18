import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import Badge from './Badge';
import { tierName } from './achState';
import { achievementById, TIER_LABEL, type EarnedTier } from '../../content/achievements';
import { useAchievementEvaluations } from '../../lib/achievements';
import { useProgress } from '../../lib/progress';
import { useFocusTrap } from '../../lib/useFocusTrap';
import { prefersReducedMotion } from '../../lib/appEvents';
import type { Unlocked } from '../../lib/useAchievements';

const SPECTRUM = ['#C8FF3D', '#3DFFC2', '#3DD9FF', '#8F7BFF', '#E08BFF'];
const RAY_FILL = ['var(--lime)', 'var(--mint)', 'var(--cyan)', 'var(--iris)', 'var(--lilac)'];

/** One confetti burst in the spectrum plus the earned tiers' metal (read from the theme tokens). */
function burst(tiers: EarnedTier[]) {
  if (prefersReducedMotion()) return;
  const css = getComputedStyle(document.documentElement);
  const metal = [...new Set(tiers.filter((t) => t !== 'standard').map((t) => css.getPropertyValue(`--tier-${t}`).trim()))]
    // canvas-confetti only understands hex colours
    .filter((c) => /^#[0-9a-f]{3,8}$/i.test(c));
  const colors = [...SPECTRUM, ...metal];
  import('canvas-confetti')
    .then(({ default: confetti }) => {
      const opts = { colors, disableForReducedMotion: true, zIndex: 120, shapes: ['square' as const], scalar: 0.9 };
      confetti({ ...opts, particleCount: 90, spread: 70, startVelocity: 42, origin: { y: 0.5 } });
      setTimeout(() => confetti({ ...opts, particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } }), 200);
      setTimeout(() => confetti({ ...opts, particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } }), 200);
    })
    .catch(() => {
      // confetti is decoration; the dialog already says it
    });
}

/** Spectral ray burst behind the hero medal (36 tapered rays, faded by a radial mask). */
function Rays() {
  const cx = 280;
  const cy = 196;
  const rays = Array.from({ length: 36 }, (_, k) => {
    const a = ((k * 10 + (k % 2 ? 3 : -2)) * Math.PI) / 180;
    const len = 230 + ((k * 37) % 3) * 30 + (k % 3 === 0 ? 50 : 0);
    const w = ((k % 3 === 0 ? 1.6 : 0.8) * Math.PI) / 180;
    const p = (ang: number) => `${(cx + Math.cos(ang) * len).toFixed(1)},${(cy + Math.sin(ang) * len).toFixed(1)}`;
    return { pts: `${cx},${cy} ${p(a - w)} ${p(a + w)}`, fill: RAY_FILL[k % 5], o: k % 3 === 0 ? 0.8 : 0.55 };
  });
  return (
    <svg className="burst" viewBox="0 0 560 420" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cel-fade" cx="50%" cy="46.7%" r="55%">
          <stop offset=".18" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="cel-mask">
          <rect width="560" height="420" fill="url(#cel-fade)" />
        </mask>
      </defs>
      <g mask="url(#cel-mask)" className="b-rays">
        {rays.map((r, i) => (
          <polygon key={i} points={r.pts} style={{ fill: r.fill }} opacity={r.o} />
        ))}
      </g>
    </svg>
  );
}

const stamp = (d: Date) =>
  `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

/**
 * "Achievement unlocked" dialog. One item → the medal pops in large over a spectral ray burst;
 * several (first load with existing progress, a big jump) → one combined grid. Focus-trapped; Esc,
 * the close button, a backdrop click or "Keep going" dismiss it. Reduced motion: no burst, pop or
 * confetti — the dialog simply fades in.
 */
export default function AchievementCelebration({ items, onClose, onViewAll }: { items: Unlocked[]; onClose: () => void; onViewAll: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const p = useProgress();
  const evs = useAchievementEvaluations(p);
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
  const firstEv = first ? evs[first.id] : undefined;

  return (
    <div className="modal-backdrop ach-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        ref={ref}
        className={`panel cut-lg modal ach-modal ${single ? 'is-single' : 'is-many'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ach-title"
        aria-describedby="ach-desc"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? { duration: 0.2 } : { duration: 0.34, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {single && first ? (
          <>
            <div className="cel-hero" data-theme="dark">
              {!reduce && <Rays />}
              <div className="cel-eyebrow">
                <Sparkles size={14} aria-hidden="true" /> Achievement unlocked
              </div>
              <Badge art={first.a.art} tier={first.tier} size="xl" className={reduce ? '' : 'pop'} />
            </div>
            <button type="button" className="icon-btn ach-close" data-theme="dark" aria-label="Close" onClick={onClose}>
              <X size={16} aria-hidden="true" />
            </button>
            <h2 className="h2" id="ach-title">
              {first.a.name}
            </h2>
            <span className={`tpill ${first.tier === 'standard' ? '' : first.tier}`}>{TIER_LABEL[first.tier] ? `${TIER_LABEL[first.tier]} tier` : 'Certified'}</span>
            <p id="ach-desc">{first.a.description}</p>
            {firstEv && (
              <span className="coord">
                {firstEv.value} {first.a.unit.toUpperCase()} · {stamp(new Date())}
              </span>
            )}
          </>
        ) : (
          <div className="multi">
            <div className="p-head">
              <span className="mlabel">
                <Sparkles size={12} aria-hidden="true" /> Achievements unlocked
              </span>
              <span className="mlabel">
                <b>{list.length}</b> new
              </span>
              <button type="button" className="icon-btn ach-close-m" aria-label="Close" onClick={onClose}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <h2 className="h3" id="ach-title">
              Whoa, {list.length} new badges!
            </h2>
            <p id="ach-desc">Look at you go. Here&apos;s everything your progress just unlocked.</p>
            <ul className="mgrid">
              {list.map((i, n) => (
                <motion.li
                  key={i.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: reduce ? 0 : 0.06 + Math.min(n, 12) * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <Badge art={i.a.art} tier={i.tier} size="md" />
                  <b>{i.a.name}</b>
                  <small>{tierName(i.tier).toUpperCase()}</small>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className="ach-acts">
          <button type="button" className="btn btn-line btn-sm" onClick={onViewAll}>
            View all achievements
            <span className="arr">
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          </button>
          <button type="button" className="btn btn-holo btn-sm" onClick={onClose} data-autofocus>
            Woohoo, keep going
          </button>
        </div>
      </motion.div>
    </div>
  );
}
