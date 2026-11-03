// The Shorts player (M7): beats one at a time with progress bars, Back / Next, tap zones, hold or Space to pause,
// reading speed, a "Your turn" quiz that blocks Next until answered, and an end card.
// Adapted from system-design-learn's ShortPlayer.tsx, trimmed to the eight beat types qa-learn uses.
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { beatMs, SPEEDS, type ShortEntry } from '../lib/shorts';
import { SaveButton } from './SaveButton';
import type { ShortBeat, ShortStat } from '../types';


const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** `*words*` → gradient words, `**words**` → bold */
function marks(text: string | undefined): ReactNode {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) =>
    part.startsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

const fmt = (n: number, decimals = 0) => (decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-IN'));

function Stats({ stats, delay }: { stats?: ShortStat[]; delay: string }) {
  if (!stats?.length) return null;
  return (
    <div className={`sp-stats sp-in ${delay}`}>
      {stats.map((s) => (
        <span className="sp-stat" key={s.label}>
          {typeof s.value === 'number' ? <span data-count={s.value}>0</span> : s.value}
          <span>{s.label}</span>
        </span>
      ))}
    </div>
  );
}

type Solve = (firstTry: boolean) => void;

function Quiz({ beat, solved, onSolve }: { beat: Extract<ShortBeat, { type: 'quiz' }>; solved: boolean; onSolve: Solve }) {
  const [picked, setPicked] = useState<number | null>(solved ? beat.answer : null);
  const [shake, setShake] = useState(0);
  const missed = useRef(false);
  const right = solved || picked === beat.answer;
  return (
    <>
      <div className="sp-opts sp-in d2" role="group" aria-label="Your answer">
        {beat.options.map((o, i) => (
          <button
            key={`${i}-${picked === i ? shake : 0}`}
            type="button"
            className={`sp-opt ${(right && i === beat.answer) ? 'right' : !right && picked === i ? 'wrong' : ''}`}
            disabled={right}
            onClick={(e) => {
              e.stopPropagation();
              setPicked(i);
              setShake((n) => n + 1);
              if (i === beat.answer) onSolve(!missed.current);
              else missed.current = true;
            }}
          >
            {o.text}
          </button>
        ))}
      </div>
      <p className="sp-fb" aria-live="polite">
        {right ? (
          <>
            <b>Right.</b> {beat.options[beat.answer].why} Press Next to continue.
          </>
        ) : picked !== null ? (
          <>
            <b className="no">Not that one:</b> {beat.options[picked].why}
          </>
        ) : null}
      </p>
    </>
  );
}

function Beat({ beat, solved, onSolve }: { beat: ShortBeat; solved: boolean; onSolve: Solve }) {
  const head = beat.head && <h2 className="sp-head sp-in d1">{marks(beat.head)}</h2>;
  const sub = (cls = 'd4') => beat.sub && <p className={`sp-sub sp-in ${cls}`}>{marks(beat.sub)}</p>;
  const kicker = <span className="sp-kick sp-in">{beat.kicker}</span>;
  switch (beat.type) {
    case 'counter':
      return (
        <>
          {kicker}
          {head}
          <div className="sp-num sp-in d1">
            <span data-count={beat.value} data-dec={beat.decimals ?? 0}>0</span>
            {beat.suffix}
            <small>{beat.unit}</small>
          </div>
          <Stats stats={beat.stats} delay="d3" />
          {sub('d3')}
        </>
      );
    case 'spike':
      return (
        <>
          {kicker}
          {head}
          <svg className="sp-viz sp-in d2" viewBox="0 0 320 150" aria-hidden="true">
            <defs>
              <linearGradient id="sp-grad" x1="0" x2="1">
                <stop offset="0" style={{ stopColor: 'var(--sp-blue)' }} />
                <stop offset=".6" style={{ stopColor: 'var(--sp-cyan)' }} />
                <stop offset="1" style={{ stopColor: 'var(--sp-amber)' }} />
              </linearGradient>
            </defs>
            <path d="M0 140 H320" style={{ stroke: 'var(--sp-line-2)' }} />
            <path className="sp-draw" pathLength={1} d="M0 128 C 60 126, 90 122, 120 118 S 160 110, 175 60 S 200 20, 215 22 S 260 30, 320 34" fill="none" stroke="url(#sp-grad)" strokeWidth={4} strokeLinecap="round" />
            <circle className="sp-pop" style={{ animationDelay: '2s', fill: 'var(--sp-amber)' }} cx={178} cy={52} r={6} />
            <text className="sp-in" style={{ animationDelay: '2.2s', fill: 'var(--sp-amber)' }} x={188} y={70}>
              {beat.mark}
            </text>
          </svg>
          <Stats stats={beat.stats} delay="d4" />
          {sub()}
        </>
      );
    case 'race':
      return (
        <>
          {kicker}
          {head}
          <div className="sp-race sp-in d2">
            {beat.lanes.map((l) => (
              <div className="sp-lane" key={l.label}>
                {l.label}
                <span className="sp-track">
                  <i style={{ animationDuration: `${l.seconds}s`, animationDelay: `${0.9 + (l.after ?? 0)}s`, background: `var(--sp-${l.tone})` }} />
                </span>
              </div>
            ))}
          </div>
          <Stats stats={beat.stats} delay="d4" />
          {sub('d5')}
        </>
      );
    case 'grid':
      return (
        <>
          {kicker}
          {head}
          <div className="sp-grid sp-in d2">
            {Array.from({ length: beat.cells }, (_, i) => (
              <i key={i} style={{ animationDelay: `${0.9 + i * 0.04}s` }} />
            ))}
          </div>
          <p className="sp-sub sp-in d5">{marks(beat.caption)}</p>
          {sub('d6')}
        </>
      );
    case 'ladder': {
      const max = Math.max(...beat.rungs.map((r) => r.amount));
      return (
        <>
          {kicker}
          {head}
          <div className="sp-ladder">
            {beat.rungs.map((r, i) => (
              <div className="sp-rung" key={r.label} style={{ animationDelay: `${0.8 + i * 0.7}s` }}>
                <span>{r.label}</span>
                <span className="sp-pods" style={{ ['--s' as string]: r.amount / max }} />
                <span>
                  {r.amount.toLocaleString('en-IN')} {beat.unit}
                </span>
              </div>
            ))}
          </div>
          {sub('d6')}
        </>
      );
    }
    case 'toggles': {
      let off = 0;
      return (
        <>
          {kicker}
          {head}
          <div className="sp-feats sp-in d2">
            {beat.items.map((it) =>
              it.keep ? (
                <div className="sp-feat keep" key={it.label}>
                  {it.label}
                  <span className="sp-shield">{beat.keepLabel ?? 'NEVER OFF'}</span>
                </div>
              ) : (
                <div className="sp-feat shed" key={it.label} style={{ animationDelay: `${1.4 + off++ * 0.7}s` }}>
                  {it.label}
                  <span className="sp-tg" />
                </div>
              ),
            )}
          </div>
          {sub('d6')}
        </>
      );
    }
    case 'flow':
      return (
        <>
          {kicker}
          {head}
          <ol className="sp-flow">
            {beat.steps.map((s, i) => (
              <li key={s} className={beat.broken === i ? 'broken' : ''} style={{ animationDelay: `${0.8 + i * 0.6}s` }}>
                {s}
              </li>
            ))}
          </ol>
          {sub('d6')}
        </>
      );
    case 'quiz':
      return (
        <>
          {kicker}
          <h2 className="sp-head sp-head-q sp-in d1">{marks(beat.head)}</h2>
          <Quiz beat={beat} solved={solved} onSolve={onSolve} />
        </>
      );
  }
}

/** The next Short when playing a list (Saved → Play all) */
export interface UpNext {
  href: string;
  title: string;
  /** "2 of 5" */
  position: string;
}

const UP_NEXT_SECONDS = 5;

/**
 * Plays one Short. `onFinish` fires once, when the end card is reached; `onQuiz` when a quiz is answered. With `next`,
 * the end card moves on to it after a few seconds.
 */
export function ShortPlayer({ entry, onFinish, onQuiz, next: upNext }: { entry: ShortEntry; onFinish?: () => void; onQuiz?: (firstTry: boolean) => void; next?: UpNext }) {
  const { short, topic, section } = entry;
  const beats = short.beats;
  const END = beats.length; // the end card comes after the last beat
  const [cur, setCur] = useState(0);
  const [run, setRun] = useState(0); // remounts the beat, so its animations start again
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [solved, setSolved] = useState<Set<number>>(() => new Set());
  const elapsed = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  const beat = cur < END ? beats[cur] : null;
  const waiting = beat?.type === 'quiz' && !solved.has(cur);
  const show = useCallback(
    (i: number) => {
      elapsed.current = 0;
      setCur(Math.max(0, Math.min(END, i)));
      setRun((n) => n + 1);
    },
    [END],
  );
  const next = useCallback(() => {
    if (waiting || cur >= END) return;
    show(cur + 1);
  }, [waiting, cur, END, show]);
  // Back plays the previous beat from its start, already playing
  const prev = useCallback(() => {
    if (cur === 0) return;
    show(cur - 1);
    setPaused(false);
  }, [cur, show]);

  useEffect(() => {
    if (cur === END && !finished.current) {
      finished.current = true;
      onFinish?.();
    }
  }, [cur, END, onFinish]);

  // playing a list: the end card counts down to the next Short (paused or replaying stops it)
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(UP_NEXT_SECONDS);
  useEffect(() => {
    if (!upNext || cur !== END || paused || held) return;
    if (countdown <= 0) {
      navigate(upNext.href);
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [upNext, cur, END, paused, held, countdown, navigate]);

  // the beat clock: fills the bars and counts numbers up; it stops while paused or held, and waits on a quiz
  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    const rm = reducedMotion();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const length = beat ? beatMs(beat) / speed : Infinity;
      if (!paused && !held && beat && beat.type !== 'quiz') elapsed.current += dt;
      const k = Number.isFinite(length) ? Math.min(1, elapsed.current / length) : 0;
      bars.current?.querySelectorAll<HTMLElement>('i').forEach((el, i) => {
        const f = i < cur ? 1 : i > cur ? 0 : beat?.type === 'quiz' ? (solved.has(cur) ? 1 : 0) : beat ? k : 1;
        el.style.transform = `scaleX(${f})`;
      });
      stage.current?.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count);
        const t = rm ? 1 : Math.max(0, Math.min(1, (elapsed.current - 500) / 1600));
        el.textContent = fmt(to * (1 - (1 - t) ** 3), Number(el.dataset.dec ?? 0));
      });
      if (beat && beat.type !== 'quiz' && elapsed.current >= length) next();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [beat, cur, paused, held, speed, solved, next, run]);

  // keyboard: ← → move, Space pauses (not while typing, and not on a control that handles its own keys)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable], .sp-opt, .sp-nav, .sp-pp, a, .btn')) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // a tap on a side moves; a long press pauses until released (like Stories)
  const press = useRef({ timer: 0, held: false });
  const zone = (go: () => void) => ({
    onPointerDown: () => {
      press.current.held = false;
      press.current.timer = window.setTimeout(() => {
        press.current.held = true;
        setHeld(true);
      }, 260);
    },
    onPointerUp: () => {
      clearTimeout(press.current.timer);
      if (press.current.held) setHeld(false);
      else go();
    },
    onPointerLeave: () => {
      clearTimeout(press.current.timer);
      if (press.current.held) setHeld(false);
    },
  });

  // keep the same point in the beat when the speed changes; read from a ref so quick taps all count
  const speedNow = useRef<(typeof SPEEDS)[number]>(1);
  const cycleSpeed = () => {
    const old = speedNow.current;
    const s = SPEEDS[(SPEEDS.indexOf(old) + 1) % SPEEDS.length];
    elapsed.current = (elapsed.current * old) / s;
    speedNow.current = s;
    setSpeed(s);
  };
  const lesson = `/topic/${topic.id}?tab=learn&s=${section}`;

  return (
    <div className={`sp ${paused || held ? 'paused' : ''}`} role="region" aria-roledescription="short video" aria-label={short.title}>
      <div className="sp-bars" ref={bars} aria-hidden="true">
        {[...beats, null].map((b, i) => (
          <div key={i} className={`sp-bar ${b?.type === 'quiz' ? 'q' : ''}`}>
            <i />
          </div>
        ))}
      </div>
      <div className="sp-top">
        <span className="sp-avatar" aria-hidden="true">
          QA
        </span>
        <span className="sp-who">
          <b>qa-learn</b>
          <span>{topic.title}</span>
        </span>
        <span className="sp-save">
          <SaveButton kind="short" id={short.id} compact />
        </span>
        <button type="button" className="sp-pp sp-speed" onClick={cycleSpeed} aria-label={`${speed}× reading speed (${speed === 1 ? 'normal' : speed < 1 ? 'slower' : 'faster'})`} title="Reading speed">
          {speed}×
        </button>
        <button type="button" className="sp-pp" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'}>
          {paused ? '▶' : '❚❚'}
        </button>
      </div>

      <div className="sp-stage" ref={stage} key={run} aria-live="polite">
        {beat ? (
          <Beat
            beat={beat}
            solved={solved.has(cur)}
            onSolve={(firstTry) => {
              setSolved((s) => new Set(s).add(cur));
              onQuiz?.(firstTry);
            }}
          />
        ) : (
          <>
            <span className="sp-kick sp-in">The lesson</span>
            <h2 className="sp-head sp-in d1">{marks(short.takeaway.head)}</h2>
            <p className="sp-sub sp-in d2">{marks(short.takeaway.sub)}</p>
            <div className="sp-end sp-in d3">
              {upNext && (
                <Link className="btn btn-primary" to={upNext.href}>
                  ▶ Next Short ({upNext.position}){paused || held ? '' : ` in ${countdown} s`}
                  <span className="sp-next-title">{upNext.title}</span>
                </Link>
              )}
              <Link className={`btn ${upNext ? '' : 'btn-primary'}`} to={lesson}>
                📖 Read the full lesson
              </Link>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setCountdown(UP_NEXT_SECONDS);
                  show(0);
                }}
              >
                ↻ Watch again
              </button>
            </div>
          </>
        )}
      </div>

      {beat && <button type="button" className="sp-zone l" aria-label="Previous beat" {...zone(prev)} />}
      {beat && !waiting && <button type="button" className="sp-zone r" aria-label="Next beat" {...zone(next)} />}
      {held && <div className="sp-hold">PAUSED</div>}

      <div className="sp-foot">
        <div className="sp-navrow">
          <button type="button" className="sp-nav" onClick={prev} disabled={cur === 0}>
            ‹ Back
          </button>
          <span className="sp-count" aria-live="polite">
            {paused ? <span className="sp-paused">Paused · ▶ to play</span> : `${Math.min(cur, END) + 1} / ${END + 1}`}
          </span>
          <button
            type="button"
            className="sp-nav"
            onClick={() => {
              next();
              setPaused(false);
            }}
            disabled={cur >= END || waiting}
          >
            Next ›
          </button>
        </div>
        <span className="sp-title">{short.title}</span>
        <span className="sp-tags">{short.tags.map((t) => `#${t}`).join(' ')}</span>
      </div>
    </div>
  );
}
