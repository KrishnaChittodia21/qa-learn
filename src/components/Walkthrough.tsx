// "Show me" (M4): a spotlight walkthrough that dims the page, cuts a hole around a real element and explains it in a
// callout beside it. Steps whose element is not on screen (another layout, a locked tab) are skipped.
// Adapted from system-design-learn's Walkthrough.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { endWalk, type WalkStep } from '../lib/guide';
import { useFocusTrap } from '../lib/useFocusTrap';

/** a mouse and keyboard (not a phone or tablet): only then are keyboard shortcuts worth mentioning */
const HAS_KEYBOARD = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const PAD = 8;
const GAP = 14;
const POP_W = 340;

/** first matching element that is actually laid out (hidden nav variants are skipped) */
function find(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el;
  }
  return null;
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Walkthrough({ steps: all }: { steps: WalkStep[] }) {
  // resolve once on start: only steps that can point at something
  const [steps] = useState(() => all.filter((s) => find(s.target)));
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(() => (steps[0] ? find(steps[0].target)!.getBoundingClientRect() : null));
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, endWalk);
  const step = steps[i];

  const measure = useCallback(() => {
    const el = step && find(step.target);
    setBox(el ? el.getBoundingClientRect() : null);
  }, [step]);

  // bring the target into view, then follow it while the page scrolls or resizes
  useLayoutEffect(() => {
    const el = step && find(step.target);
    if (!el) return;
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    let raf = requestAnimationFrame(measure);
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    // smooth scrolling moves the target after this effect: keep measuring until it settles
    const t = window.setInterval(measure, 60);
    const stop = window.setTimeout(() => window.clearInterval(t), 800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(t);
      window.clearTimeout(stop);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [step, measure]);

  useEffect(() => {
    if (!steps.length) endWalk();
  }, [steps.length]);

  if (!step || !box) return null;
  const last = i === steps.length - 1;
  const go = (n: number) => setI(Math.max(0, Math.min(steps.length - 1, n)));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  };

  // the callout goes below the target, or above when there is no room; phones dock it to the bottom (CSS)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const below = vh - box.bottom > 230 || box.top < 230;
  const left = Math.min(Math.max(12, box.left + box.width / 2 - POP_W / 2), vw - POP_W - 12);
  const pos = below ? { top: Math.min(box.bottom + PAD + GAP, vh - 210), left } : { bottom: vh - box.top + PAD + GAP, left };
  const arrowX = Math.min(Math.max(20, box.left + box.width / 2 - left), POP_W - 20);

  return (
    <div className="walk" onKeyDown={onKey}>
      {/* blocks clicks on the page while the walkthrough runs */}
      <div className="walk-shield" aria-hidden="true" />
      <div
        className="walk-spot"
        aria-hidden="true"
        style={{ top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 }}
      />
      <div
        ref={ref}
        className={`walk-pop panel ${below ? 'below' : 'above'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="walk-title"
        aria-describedby="walk-text"
        tabIndex={-1}
        style={{ ...pos, width: POP_W, ['--ax' as string]: `${arrowX}px` }}
      >
        <div className="walk-top">
          <span className="mlabel">
            Show me · {i + 1} of {steps.length}
          </span>
          <button type="button" className="icon-btn" aria-label="End the walkthrough" onClick={endWalk}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <h2 id="walk-title" className="walk-title">
          {step.title}
        </h2>
        <p id="walk-text">
          {step.text}
          {step.shortcut && HAS_KEYBOARD && <> Shortcut: {step.shortcut}.</>}
        </p>
        <div className="walk-meter" aria-hidden="true">
          <i style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="walk-foot">
          <button type="button" className="btn-ghost btn-sm" onClick={endWalk}>
            Skip
          </button>
          <div className="pg-acts">
            <button type="button" className="btn btn-sm" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step">
              <ArrowLeft size={15} aria-hidden="true" />
            </button>
            {last ? (
              <button type="button" className="btn btn-holo btn-sm" data-autofocus onClick={endWalk}>
                Done
              </button>
            ) : (
              <button type="button" className="btn btn-holo btn-sm" data-autofocus onClick={() => go(i + 1)}>
                Next <ArrowRight size={15} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
