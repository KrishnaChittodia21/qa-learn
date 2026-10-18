// Shared building blocks for interactive, step-by-step visualisations.
// Pattern: a pure `simulate(params) => Frame[]` produces every state up front, so stepping
// backwards, resetting and changing parameters are trivial and deterministic. Components
// only render the current frame.
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface BaseFrame {
  /** one or two sentences narrating what just happened (read by screen readers) */
  caption: string;
  /** optional "what happens next?" prompt shown before advancing past this frame */
  predict?: string;
}

/** Placement of a visualisation inside a topic's Learn tab. */
export interface VizPlacement {
  topic: string;
  /** the section heading must START with this text */
  heading: string;
}

export interface VizMeta {
  id: string;
  title: string;
  /** one line: what the learner can explore */
  blurb: string;
  placements: VizPlacement[];
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Steps through precomputed frames with play/pause/speed. */
export function useFrames<F extends BaseFrame>(frames: F[]) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = frames.length - 1;

  // new simulation (params changed) → start over
  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [frames]);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(last, x + 1)), 1100 / speed);
    return () => clearTimeout(t);
  }, [playing, i, last, speed]);

  return {
    i,
    frame: frames[Math.min(i, last)],
    total: frames.length,
    playing,
    speed,
    setSpeed,
    play: () => {
      if (i >= last) setI(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    next: () => {
      setPlaying(false);
      setI((x) => Math.min(last, x + 1));
    },
    prev: () => {
      setPlaying(false);
      setI((x) => Math.max(0, x - 1));
    },
    reset: () => {
      setPlaying(false);
      setI(0);
    },
    seek: (n: number) => {
      setPlaying(false);
      setI(Math.max(0, Math.min(last, n)));
    },
  };
}

export type Stepper = ReturnType<typeof useFrames<BaseFrame>>;

/** Figure numbering supplied by the page that places a visualisation ("Fig 4.1", spec "05.2"). */
const FigureContext = createContext<{ fig?: string; spec?: string }>({});

/** Wrap a placed visualisation so its frame can label itself "Fig 4.1 · SPEC 05.2". */
export function VizFigure({ fig, spec, children }: { fig?: string; spec?: string; children: ReactNode }) {
  return <FigureContext.Provider value={{ fig, spec }}>{children}</FigureContext.Provider>;
}

/** Card chrome: title, parameter controls, the drawing, transport controls and narration. */
export function VizFrame({
  title,
  blurb,
  stepper,
  controls,
  children,
  legend,
}: {
  title: string;
  blurb?: string;
  stepper: Stepper;
  /** parameter sliders/toggles */
  controls?: ReactNode;
  /** the SVG drawing */
  children: ReactNode;
  legend?: ReactNode;
}) {
  const { frame, i, total, playing, speed } = stepper;
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const fig = useContext(FigureContext);
  useEffect(() => setRevealed(false), [i]);

  // keyboard: ←/→ step, space play/pause (only when focus is inside this card)
  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') stepper.next();
    else if (e.key === 'ArrowLeft') stepper.prev();
    else if (e.key === ' ') {
      e.preventDefault();
      if (playing) stepper.pause();
      else stepper.play();
    } else return;
    e.stopPropagation();
  };

  return (
    <figure
      className={`viz panel cut-lg ${playing ? 'is-playing' : ''}`}
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={`${title} interactive visualisation`}
    >
      <div className="viz-head">
        <span className="chip holo viz-eyebrow">{fig.fig ? `Fig ${fig.fig}` : 'Interactive'}</span>
        <div className="viz-head-t">
          <div className="viz-title">{title}</div>
          {blurb && <div className="viz-blurb">{blurb}</div>}
        </div>
        <span className="viz-coord" aria-hidden="true">
          {fig.spec ? `SPEC ${fig.spec} · ` : ''}STEP {String(i + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
      </div>
      {controls && <div className="viz-controls">{controls}</div>}
      <div className="viz-stage">
        {children}
        <span className="xhair c1" aria-hidden="true">
          <i />
        </span>
        <span className="xhair c2" aria-hidden="true">
          <i />
        </span>
        {playing && <span className="scan viz-scan" aria-hidden="true" />}
      </div>
      {legend && <div className="viz-legend">{legend}</div>}
      <div className="viz-caption" aria-live="polite">
        <span className="viz-stepno">
          Step {i + 1}/{total}
        </span>{' '}
        {frame.caption}
      </div>
      {frame.predict && (
        <div className="viz-predict">
          <span className="mlabel">Predict</span> {frame.predict}{' '}
          {!revealed ? (
            <button type="button" className="link-btn" onClick={() => setRevealed(true)}>
              Think, then reveal →
            </button>
          ) : i < total - 1 ? (
            <button type="button" className="link-btn" onClick={stepper.next}>
              See what happens →
            </button>
          ) : null}
        </div>
      )}
      <div className="viz-transport">
        <button type="button" className="btn btn-xs" onClick={stepper.reset} aria-label="Reset">
          ⏮
        </button>
        <button type="button" className="btn btn-xs" onClick={stepper.prev} disabled={i === 0} aria-label="Previous step">
          ◀
        </button>
        {playing ? (
          <button type="button" className="btn btn-xs btn-primary" onClick={stepper.pause} aria-label="Pause">
            ❚❚ Pause
          </button>
        ) : (
          <button type="button" className="btn btn-xs btn-primary" onClick={stepper.play} aria-label="Play">
            ▶ Play
          </button>
        )}
        <button type="button" className="btn btn-xs" onClick={stepper.next} disabled={i === total - 1} aria-label="Next step">
          ▶
        </button>
        <div className="viz-scrub-wrap">
          <input
            className="viz-scrub"
            type="range"
            min={0}
            max={total - 1}
            value={i}
            onChange={(e) => stepper.seek(Number(e.target.value))}
            aria-label="Scrub through steps"
          />
          <div className="seg thin viz-seg" style={{ '--n': total, '--v': i + 1, '--gap': '2px' } as React.CSSProperties} aria-hidden="true" />
        </div>
        <label className="viz-speed">
          Speed
          <select value={speed} onChange={(e) => stepper.setSpeed(Number(e.target.value))}>
            {[0.5, 1, 2, 4].map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
      </div>
    </figure>
  );
}

/** Labelled range input for simulation parameters. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="viz-slider">
      <span>
        {label}: <strong>{format(value)}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/** Segmented choice control. */
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="viz-choice" role="group" aria-label={label}>
      <span>{label}:</span>
      {options.map((o) => (
        <button key={o.value} type="button" className={`chip ${value === o.value ? 'on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Deterministic PRNG (mulberry32) so simulations replay identically. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Run a pure simulation, re-running only when the (JSON-serialisable) params change. */
export function useSimulation<P, F extends BaseFrame>(simulate: (p: P) => F[], params: P): F[] {
  const key = JSON.stringify(params);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => simulate(params), [key]);
}
