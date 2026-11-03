// A section taught as small animated steps (M11). Watch steps loop like a GIF; a Your-turn step must be solved
// before Next opens (a hint after a miss, "Show me the answer" after two).
import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Pause, Play } from 'lucide-react';
import type { Step, StepLesson as Lesson, StepTask } from '../../types';
import { HIT, NINES, NINES_TARGET, Stage, VIEW, dbLoad, effLatency, hitCalm, jitterCalm, jitterPeak, parseAmount, quiet, shuffleFor, timesOff } from './stage';

/** **bold** and `code`, nothing else */
function inline(s: string): ReactNode {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((p, i) =>
    p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : <Fragment key={i}>{p}</Fragment>,
  );
}

interface Props {
  lesson: Lesson;
  /** every Your turn solved and Finish pressed; `missed` = Your turns not solved on the first try */
  onFinish: (missed: number) => void;
  onRead: () => void;
  /** shown on the last step, e.g. a link to this section's Short */
  end?: ReactNode;
}

export function StepLesson({ lesson, onFinish, onRead, end }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const stage = useRef<Stage | null>(null);
  const [cur, setCur] = useState(0);
  const [line, setLine] = useState(-1);
  const [paused, setPaused] = useState(false);
  // phones: the diagram turns tall so its text stays readable
  const [tall, setTall] = useState(false);
  const [solved, setSolved] = useState<Set<number>>(() => new Set());
  const [missed, setMissed] = useState<Set<number>>(() => new Set());
  const steps = lesson.steps;
  const step = steps[cur];
  // button text for each box; two boxes with the same label (two "Breaker"s) also show their subtitle
  const labels = useMemo(() => {
    const seen = new Map<string, number>();
    for (const a of lesson.actors) seen.set(a.label, (seen.get(a.label) ?? 0) + 1);
    return Object.fromEntries(lesson.actors.map((a) => [a.id, (seen.get(a.label) ?? 0) > 1 && a.sub ? `${a.label} · ${a.sub}` : a.label]));
  }, [lesson]);
  const turns = useMemo(() => steps.flatMap((s, i) => (s.kind === 'turn' ? [i] : [])), [steps]);
  // a step opens once every Your turn before it is solved
  const reachable = (k: number) => turns.every((t) => t >= k || solved.has(t));
  const isSolved = solved.has(cur);
  const blocked = step.kind === 'turn' && !isSolved;
  const last = cur === steps.length - 1;

  useEffect(() => {
    const box = svg.current!.parentElement!;
    // below ~440px the wide diagram's text would shrink under 11px
    const ro = new ResizeObserver(() => setTall(box.clientWidth < 440));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    stage.current = new Stage(svg.current!, lesson, setLine, tall);
    return () => stage.current?.reset();
  }, [lesson, tall]);

  // each step starts from a clean stage; Watch steps, and Your turns once solved, loop like a GIF
  useEffect(() => {
    const st = stage.current!;
    st.reset();
    if (step.kind === 'watch') void quiet(st.loop(step.script));
    else if (isSolved && step.then) void quiet(st.loop(step.then, step.setup));
    else void quiet(st.play(step.setup ?? []));
  }, [step, isSolved, tall]);

  const go = (k: number) => {
    if (k < 0 || k >= steps.length || !reachable(k)) return;
    setCur(k);
    setLine(-1);
    setPaused(false);
  };
  const next = () => {
    if (blocked) return;
    if (last) onFinish(missed.size);
    else go(cur + 1);
  };

  // ← → move between steps while focus is inside this lesson
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || !root.current?.contains(t)) return;
      if (e.key === 'ArrowRight' && !blocked && !last) go(cur + 1);
      if (e.key === 'ArrowLeft') go(cur - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const solve = (missedIt: boolean) => {
    if (missedIt) setMissed((m) => new Set(m).add(cur));
    setSolved((s) => new Set(s).add(cur));
    setPaused(false);
  };

  return (
    <div className="sl" ref={root}>
      <div className="sl-dots" aria-label="Steps">
        {steps.map((s, k) => (
          <button
            key={k}
            type="button"
            className={`sl-dot ${s.kind === 'turn' ? 'turn' : ''} ${k === cur ? 'now' : ''} ${solved.has(k) || (s.kind === 'watch' && k < cur) ? 'done' : ''}`}
            aria-label={`Step ${k + 1}: ${s.title}${s.kind === 'turn' ? ' (your turn)' : ''}`}
            aria-current={k === cur ? 'step' : undefined}
            disabled={!reachable(k)}
            onClick={() => go(k)}
          />
        ))}
      </div>

      <div className="sl-body">
        <div className="sl-text">
          <div className={`sl-kind ${step.kind}`}>{step.kind === 'turn' ? '✎ Your turn' : '▶ Watch'}</div>
          <h3 className="sl-title">{step.title}</h3>
          <ol className="sl-lines">
            {step.lines.map((l, k) => (
              <li key={k} className={k === line ? 'on' : k < line ? 'done' : ''}>
                {inline(l)}
              </li>
            ))}
          </ol>
        </div>
        <div className="sl-stage">
          <svg ref={svg} viewBox={tall ? VIEW.tall : VIEW.wide} role="img" aria-label={`Diagram for step ${cur + 1}: ${step.title}`} />
        </div>
      </div>

      <div className="sl-act">
        {step.kind === 'watch' ? (
          <p className="sl-muted">{last && end ? end : 'Watch the diagram: it loops, and each line lights up as it happens.'}</p>
        ) : (
          <Task key={cur} step={step} stage={stage} done={isSolved} onSolve={solve} labels={labels} />
        )}
      </div>

      <div className="sl-nav">
        <button type="button" className="btn-ghost btn-sm" disabled={cur === 0} onClick={() => go(cur - 1)}>
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        <span className="sl-count mono">
          {cur + 1} / {steps.length}
        </span>
        <button
          type="button"
          className="btn-ghost btn-sm sl-pause"
          aria-pressed={paused}
          onClick={() => {
            stage.current!.paused = !paused;
            setPaused(!paused);
          }}
        >
          {paused ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />} {paused ? 'Play' : 'Pause'}
        </button>
        <button type="button" className="btn btn-primary btn-sm" disabled={blocked} onClick={next}>
          {blocked ? 'Solve it to continue' : last ? 'Finish ✓' : 'Next'} {!blocked && !last && <ArrowRight size={15} aria-hidden />}
        </button>
        <button type="button" className="btn-ghost btn-sm sl-read" onClick={onRead}>
          <BookOpen size={15} aria-hidden /> Read it instead
        </button>
      </div>
    </div>
  );
}

type TurnStep = Extract<Step, { kind: 'turn' }>;

/** one Your-turn task: shared feedback, hints and "Show me the answer" */
function Task({
  step,
  stage,
  done,
  onSolve,
  labels,
}: {
  step: TurnStep;
  stage: RefObject<Stage | null>;
  done: boolean;
  onSolve: (missed: boolean) => void;
  labels: Record<string, string>;
}) {
  const [misses, setMisses] = useState(0);
  const [hint, setHint] = useState('');
  const t = step.task;
  const right = () => onSolve(misses > 0);
  const wrong = (h: string) => {
    setMisses((m) => m + 1);
    setHint(h);
  };

  // a pick task also works by clicking the boxes on the diagram
  useEffect(() => {
    if (t.type !== 'pick' || done) return;
    const st = stage.current!;
    st.pickable(pickIds(t), (id) => {
      if (id === t.answer) return right();
      st.wrongPick(id);
      wrong(t.hints[id] ?? 'Not that one.');
    });
    return () => st.pickable(null);
  });

  return (
    <div className={`sl-task ${done ? 'is-done' : ''}`}>
      <p className="sl-q">{inline(t.question)}</p>
      {t.type === 'pick' && !done && <p className="sl-muted">Click a box on the diagram, or use the buttons.</p>}
      <TaskBody task={t} done={done} onRight={right} onWrong={wrong} labels={labels} />
      {(done || hint) && (
        <div className={`sl-fb ${done ? 'ok' : 'no'}`} role="status">
          <b>{done ? 'Right.' : 'Not quite.'}</b> {inline(done ? step.solved : hint)}
        </div>
      )}
      {!done && misses >= 2 && (
        <button type="button" className="btn btn-sm sl-reveal" onClick={() => onSolve(true)}>
          Show me the answer
        </button>
      )}
    </div>
  );
}

const pickIds = (t: Extract<StepTask, { type: 'pick' }>) => [...new Set([...Object.keys(t.hints), t.answer])];

interface BodyProps {
  task: StepTask;
  done: boolean;
  onRight: () => void;
  onWrong: (hint: string) => void;
  labels: Record<string, string>;
}

function TaskBody({ task: t, done, onRight, onWrong, labels }: BodyProps) {
  const [picked, setPicked] = useState<number[]>([]);
  const [tried, setTried] = useState<Set<number>>(() => new Set());
  const miss = (k: number, hint: string) => {
    setTried((s) => new Set(s).add(k));
    onWrong(hint);
  };
  const cls = (k: number, isAnswer: boolean) => (done && isAnswer ? 'right' : !done && tried.has(k) ? 'wrong' : '');
  switch (t.type) {
    case 'pick':
      return (
        <div className="sl-opts">
          {pickIds(t).map((id, k) => (
            <button key={id} type="button" className={`sl-opt ${cls(k, id === t.answer)}`} disabled={done} onClick={() => (id === t.answer ? onRight() : miss(k, t.hints[id]))}>
              {labels[id] ?? id}
            </button>
          ))}
        </div>
      );
    case 'choose':
      return (
        <div className="sl-opts">
          {shuffleFor(t.question, t.options.length).map((k, pos) => {
            const o = t.options[k];
            return (
              <button
                key={k}
                type="button"
                className={`sl-opt ${cls(k, k === t.answer)}`}
                disabled={done}
                onClick={() => (k === t.answer ? onRight() : miss(k, o.why ?? 'Read the lines beside the diagram again.'))}
              >
                <span className="sl-opt-k">{'ABCDE'[pos]}</span>
                <span>{inline(o.text)}</span>
              </button>
            );
          })}
        </div>
      );
    case 'number':
      return (
        <div className="sl-row">
          {t.options.map((n, k) => (
            <button key={n} type="button" className={`sl-num ${cls(k, n === t.answer)}`} disabled={done} onClick={() => (n === t.answer ? onRight() : miss(k, t.hint))}>
              {n.toLocaleString('en-US')}
            </button>
          ))}
        </div>
      );
    case 'order':
    case 'build': {
      const items = t.type === 'order' ? t.items : t.parts.map((p) => p.text);
      // a fixed shuffle, never the right order
      const shown = [...items.keys()].sort((a, b) => ((a * 3 + 1) % items.length) - ((b * 3 + 1) % items.length));
      const filled = done ? items.length : picked.length;
      // identical tokens (the two 1s in 3-2-1-1-0) are interchangeable: match by text, not by position
      const tap = (k: number) => {
        if (items[k] !== items[picked.length]) return onWrong(t.hint);
        setPicked([...picked, k]);
        if (picked.length + 1 === items.length) onRight();
      };
      return (
        <>
          <div className="sl-row">
            {shown.map((k) => (
              <button key={k} type="button" className={`sl-token ${done || picked.includes(k) ? 'used' : ''}`} disabled={done || picked.includes(k)} onClick={() => tap(k)}>
                {items[k]}
              </button>
            ))}
          </div>
          {t.type === 'order' ? (
            <ol className="sl-slots">
              {items.map((it, k) => (
                <li key={k} className={k < filled ? 'filled' : ''}>
                  {k < filled ? it : ''}
                </li>
              ))}
            </ol>
          ) : (
            <div className="sl-build">
              {t.parts.map((p, k) => (
                <Fragment key={k}>
                  {k > 0 && <span className="sl-join mono">{t.join}</span>}
                  <span className={`sl-part ${k < filled ? 'filled' : ''}`}>
                    <span className="mono">{k < filled ? p.text : '?'}</span>
                    <small>{p.label}</small>
                  </span>
                </Fragment>
              ))}
            </div>
          )}
        </>
      );
    }
    case 'slider':
      if (t.model === 'availability') return <NinesSlider task={t} done={done} onRight={onRight} />;
      return t.model === 'hit-ratio' ? <HitRatioSlider task={t} done={done} onRight={onRight} /> : <JitterSlider task={t} done={done} onRight={onRight} />;
    case 'break':
      return <BreakIt task={t} done={done} onRight={onRight} />;
    case 'estimate':
      return <Estimate task={t} done={done} onRight={onRight} onWrong={onWrong} />;
    case 'dial':
      return <Dial task={t} done={done} onRight={onRight} />;
  }
}

// ---- built-in charts and switches ----

function JitterSlider({ task, done, onRight }: { task: Extract<StepTask, { type: 'slider' }>; done: boolean; onRight: () => void }) {
  const [v, setV] = useState(done ? 15 : task.min);
  const { counts, peak } = jitterPeak(v);
  const tone = peak > 12 ? 'err' : peak > 5 ? 'miss' : 'ok';
  return (
    <div className="sl-slider">
      <div className={`sl-chart tone-${tone}`} aria-hidden>
        {counts.map((c, k) => (
          <span key={k} style={{ height: `${(c / 40) * 100}%` }} />
        ))}
      </div>
      <div className="sl-row sl-slider-row">
        <label htmlFor="sl-jit">{task.label}</label>
        <input
          id="sl-jit"
          type="range"
          min={task.min}
          max={task.max}
          value={v}
          disabled={done}
          onChange={(e) => {
            const n = Number(e.target.value);
            setV(n);
            if (jitterCalm(n)) onRight();
          }}
        />
        <span className="mono">
          ±{v}
          {task.unit}
        </span>
      </div>
      <p className={`sl-peak tone-${tone}`} aria-live="polite">
        Peak: {peak} database reads at the same moment
      </p>
    </div>
  );
}

/** the value is tenths of a percent (500 = 50.0%), so the slider can reach 99.9% */
function HitRatioSlider({ task, done, onRight }: { task: Extract<StepTask, { type: 'slider' }>; done: boolean; onRight: () => void }) {
  const [v, setV] = useState(done ? 990 : task.min);
  const h = v / 1000;
  const db = dbLoad(h);
  const tone = db <= HIT.dbLimit ? 'ok' : db <= HIT.dbLimit * 4 ? 'miss' : 'err';
  return (
    <div className="sl-slider">
      <div className="sl-hit" aria-hidden>
        <span className="sl-hit-l">Cache answers (share)</span>
        <span className="sl-hit-bar tone-ok">
          <i style={{ width: `${h * 100}%` }} />
        </span>
        <span className="sl-hit-l">Database (0–5k/s)</span>
        {/* scaled to 0–5,000 reads/s (full at 90%), so its 500/s limit line is easy to see */}
        <span className={`sl-hit-bar tone-${tone}`}>
          <i style={{ width: `${Math.max(0.6, Math.min(100, (db / 5000) * 100))}%` }} />
          <b style={{ left: `${(HIT.dbLimit / 5000) * 100}%` }} />
        </span>
      </div>
      <div className="sl-row sl-slider-row">
        <label htmlFor="sl-hit">{task.label}</label>
        <input
          id="sl-hit"
          type="range"
          min={task.min}
          max={task.max}
          value={v}
          disabled={done}
          onChange={(e) => {
            const n = Number(e.target.value);
            setV(n);
            if (hitCalm(n / 1000)) onRight();
          }}
        />
        <span className="mono">{(v / 10).toFixed(1)}%</span>
      </div>
      <p className={`sl-peak tone-${tone}`} aria-live="polite">
        Database: {db.toLocaleString('en-US')} reads/s (it can take {HIT.dbLimit}) · average read {effLatency(h).toFixed(2)} ms
      </p>
    </div>
  );
}

/** pick the cheapest number of nines that keeps downtime under the target */
function NinesSlider({ task, done, onRight }: { task: Extract<StepTask, { type: 'slider' }>; done: boolean; onRight: () => void }) {
  const [i, setI] = useState(done ? NINES_TARGET : 0);
  const n = NINES[i];
  const tone = i < NINES_TARGET ? 'err' : i === NINES_TARGET ? 'ok' : 'miss';
  return (
    <div className="sl-slider">
      <div className="sl-nines" aria-hidden>
        {NINES.map((x, k) => (
          <span key={x.a} className={k === i ? `on tone-${tone}` : ''}>
            {x.a}
          </span>
        ))}
      </div>
      <div className="sl-row sl-slider-row">
        <label htmlFor="sl-nines">{task.label}</label>
        <input
          id="sl-nines"
          type="range"
          min={0}
          max={NINES.length - 1}
          step={1}
          value={i}
          disabled={done}
          aria-valuetext={n.a}
          onChange={(e) => {
            const k = Number(e.target.value);
            setI(k);
            if (k === NINES_TARGET) onRight();
          }}
        />
        <span className="mono">{n.a}</span>
      </div>
      <p className={`sl-peak tone-${tone}`} aria-live="polite">
        Down {n.month} a month ({n.year} a year).{' '}
        {i < NINES_TARGET ? 'Too much downtime.' : i > NINES_TARGET ? 'Meets it, but needs far more than necessary.' : 'Meets it.'} Needs: {n.needs}.
      </p>
    </div>
  );
}

function BreakIt({ task, done, onRight }: { task: Extract<StepTask, { type: 'break' }>; done: boolean; onRight: () => void }) {
  const [off, setOff] = useState(done);
  return (
    <div className="sl-row">
      <button type="button" role="switch" aria-checked={off} className={`sl-switch ${off ? 'on' : ''}`} disabled={done} onClick={() => setOff(!off)}>
        <span className="sl-switch-tg" aria-hidden /> {task.offLabel}
      </button>
      <button type="button" className="btn btn-sm" disabled={!off || done} onClick={onRight}>
        {task.sendLabel}
      </button>
    </div>
  );
}

const num = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

/** type your own estimate; close enough (within `within`×) counts, and a miss says how far off and which way */
function Estimate({ task, done, onRight, onWrong }: { task: Extract<StepTask, { type: 'estimate' }>; done: boolean; onRight: () => void; onWrong: (hint: string) => void }) {
  const [s, setS] = useState('');
  const [unread, setUnread] = useState(false);
  const check = (e: FormEvent) => {
    e.preventDefault();
    const v = parseAmount(s, task.unit);
    setUnread(v === null || v <= 0);
    if (v === null || v <= 0) return;
    const r = v / task.answer;
    if (r <= task.within && r >= 1 / task.within) return onRight();
    onWrong(`About ${timesOff(r > 1 ? r : 1 / r)}× too ${r > 1 ? 'high' : 'low'}. ${task.hint}`);
  };
  return (
    <form className="sl-row sl-est" onSubmit={check}>
      <input
        className="sl-est-in mono"
        aria-label={`Your estimate, in ${task.unit}`}
        inputMode="decimal"
        autoComplete="off"
        placeholder="e.g. 2.3K or 10^5"
        value={done && !s ? num(task.answer) : s}
        disabled={done}
        onChange={(e) => setS(e.target.value)}
      />
      <span className="mono sl-est-u">{task.unit}</span>
      <button type="submit" className="btn btn-sm" disabled={done || !s.trim()}>
        Check
      </button>
      {unread && !done && <span className="sl-muted">Type a number, like 2300, 2.3K or 10^5.</span>}
      {done && <span className="sl-muted">Anything within {task.within}× of {num(task.answer)} counts.</span>}
    </form>
  );
}

/** provision units until capacity covers the need without wasting more than `slack` */
function Dial({ task, done, onRight }: { task: Extract<StepTask, { type: 'dial' }>; done: boolean; onRight: () => void }) {
  const slack = task.slack ?? 1.5;
  const step = task.step ?? 1;
  const fits = (n: number) => n * task.per >= task.need && n * task.per <= task.need * slack;
  const [n, setN] = useState(done ? Math.ceil(task.need / task.per / step) * step : task.min);
  const cap = n * task.per;
  const tone = cap < task.need ? 'err' : fits(n) ? 'ok' : 'miss';
  return (
    <div className="sl-slider">
      <div className="sl-hit" aria-hidden>
        <span className="sl-hit-l">Capacity vs need</span>
        {/* the need sits at the middle line; the bar is capacity */}
        <span className={`sl-hit-bar tone-${tone}`}>
          <i style={{ width: `${Math.max(1, Math.min(100, (cap / (task.need * 2)) * 100))}%` }} />
          <b style={{ left: '50%' }} />
        </span>
      </div>
      <div className="sl-row sl-slider-row">
        <label htmlFor="sl-dial">{task.label}</label>
        <input
          id="sl-dial"
          type="range"
          min={task.min}
          max={task.max}
          step={step}
          value={n}
          disabled={done}
          onChange={(e) => {
            const k = Number(e.target.value);
            setN(k);
            if (fits(k)) onRight();
          }}
        />
        <span className="mono">
          {n} {task.unit}
        </span>
      </div>
      <p className={`sl-peak tone-${tone}`} aria-live="polite">
        {n} × {num(task.per)} = {num(cap)} {task.capUnit} · needed {num(task.need)}.{' '}
        {cap < task.need ? 'Not enough: the overflow queues and times out.' : fits(n) ? 'Covers it with sensible headroom.' : `Covers it ${timesOff(cap / task.need)}× over: money spent on idle capacity.`}
      </p>
    </div>
  );
}
