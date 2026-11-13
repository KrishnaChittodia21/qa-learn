// The visualiser inside the test runner: runs the learner's own code on one visible test with every step recorded
// (lib/trace.ts + instrument.ts), then plays it back: the line running now, every variable (arrays as cells with
// their index variables as pointers, objects as key → value), what changed, and where the result went wrong.
// Hidden tests are never traced: their inputs stay hidden.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pause, Play } from 'lucide-react';
import type { CodingTest } from '../types';
import type { RunRecord } from '../lib/testRun';
import { runTrace } from '../lib/runCode';
import { whereItWentWrong, type Trace, type TraceStep } from '../lib/trace';
import { BugsyTip } from './Doodles';

const SPEEDS: [number, string][] = [
  [1400, '0.5×'],
  [750, '1×'],
  [380, '2×'],
  [150, '4×'],
];
const pad = (n: number) => String(n).padStart(2, '0');
/** names that read as positions in an array: shown as pointers under its cells */
const POINTER = /^([ijklmnpqrw]|lo|hi|mid|left|right|start|end|slow|fast|write|read|idx|index|pos|ptr|cur|head|tail|front|back)\d?$/i;

type Marker = { __undef?: true; __fn?: string; __more?: number | true; __map?: [unknown, unknown][]; __set?: unknown[]; __promise?: true };
const isMarker = (v: unknown): v is Marker => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).some((k) => k.startsWith('__'));

/** a recorded value as short text */
function show(v: unknown): string {
  if (v === '(undefined)') return 'undefined';
  if (isMarker(v)) {
    if (v.__undef) return 'undefined';
    if (v.__fn) return `ƒ ${v.__fn}`;
    if (v.__promise) return 'Promise';
    if (v.__more) return typeof v.__more === 'number' ? `…+${v.__more}` : '…';
    if (v.__map) return `Map(${v.__map.map(([k, x]) => `${show(k)} → ${show(x)}`).join(', ')})`;
    if (v.__set) return `Set(${v.__set.map(show).join(', ')})`;
  }
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(show).join(', ')}]`;
  if (v && typeof v === 'object') return `{${Object.entries(v).map(([k, x]) => `${k}: ${show(x)}`).join(', ')}}`;
  return String(v);
}
/** the same value as the tests compare it (JSON), so the verdict matches the test runner */
const same = (a: unknown, b: unknown) => {
  const n = (v: unknown) => JSON.stringify(v === '(undefined)' || (isMarker(v) && v.__undef) ? null : v);
  return n(a) === n(b);
};
/** a cell wide enough for the longest value in it (pointers slide by the same width) */
const cellW = (vals: unknown[]) => Math.max(46, Math.min(120, Math.max(0, ...vals.map((x) => show(x).length)) * 8 + 18));
const isFlat = (v: unknown): v is unknown[] => Array.isArray(v) && v.length <= 40 && v.every((x) => x === null || typeof x !== 'object' || isMarker(x));

function ArrayCells({ name, value, prev, pointers, expect }: { name: string; value: unknown[]; prev?: unknown; pointers: { name: string; at: number }[]; expect?: unknown[] }) {
  const before = Array.isArray(prev) ? prev : undefined;
  // pointers on the same cell stack instead of overlapping
  const row: Record<number, number> = {};
  return (
    <div className="tv-arr" style={{ '--n': Math.max(value.length, 1), '--cw': `${cellW([...value, ...(expect ?? [])])}px` } as CSSProperties}>
      <div className="tv-cells" role="list" aria-label={`${name}: ${show(value)}`}>
        {value.map((x, i) => {
          const changed = before ? !same(before[i], x) : false;
          const wrong = expect && !same(expect[i], x);
          return (
            <span key={i} role="listitem" className={`tv-cell ${changed ? 'chg' : ''} ${wrong ? 'wrong' : ''}`}>
              <span className="tv-cv">{show(x)}</span>
              <span className="tv-ci">{i}</span>
            </span>
          );
        })}
        {value.length === 0 && <span className="tv-empty">empty</span>}
      </div>
      {expect && (
        <div className="tv-cells tv-expect" role="list" aria-label={`expected: ${show(expect)}`}>
          {expect.map((x, i) => (
            <span key={i} role="listitem" className={`tv-cell ${same(value[i], x) ? '' : 'want'}`}>
              <span className="tv-cv">{show(x)}</span>
            </span>
          ))}
          <span className="tv-expect-l">expected</span>
        </div>
      )}
      {pointers.length > 0 && (
        <div className="tv-ptrs" aria-hidden="true">
          {pointers.map((p) => {
            const lvl = (row[p.at] = (row[p.at] ?? -1) + 1);
            return (
              <span key={p.name} className={`tv-ptr ${p.at >= value.length ? 'past' : ''}`} style={{ '--at': p.at, '--lvl': lvl } as CSSProperties}>
                ▲ {p.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VarView({ name, value, prev, all, expect }: { name: string; value: unknown; prev?: unknown; all: Record<string, unknown>; expect?: unknown }) {
  const changed = prev !== undefined && !same(prev, value);
  const fresh = prev === undefined;
  let body;
  if (isFlat(value)) {
    const pointers = Object.entries(all)
      .filter(([n, v]) => n !== name && POINTER.test(n) && typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= value.length)
      .map(([n, v]) => ({ name: n, at: v as number }));
    body = <ArrayCells name={name} value={value} prev={prev} pointers={pointers} expect={Array.isArray(expect) ? expect : undefined} />;
  } else if (Array.isArray(value) && value.length <= 8 && value.every((r) => isFlat(r))) {
    body = (
      <div className="tv-grid">
        {value.map((r, i) => (
          <ArrayCells key={i} name={`${name}[${i}]`} value={r as unknown[]} prev={Array.isArray(prev) ? prev[i] : undefined} pointers={[]} />
        ))}
      </div>
    );
  } else if (value && typeof value === 'object' && !Array.isArray(value) && (!isMarker(value) || (value as Marker).__map)) {
    const entries: [string, unknown][] = isMarker(value) ? (value as Marker).__map!.map(([k, x]) => [show(k), x]) : Object.entries(value);
    const pe = prev && typeof prev === 'object' ? (isMarker(prev) && (prev as Marker).__map ? Object.fromEntries((prev as Marker).__map!.map(([k, x]) => [show(k), x])) : (prev as Record<string, unknown>)) : undefined;
    body = (
      <div className="tv-obj">
        {entries.map(([k, x]) => (
          <span key={k} className={`tv-kv ${pe && !same(pe[k], x) ? 'chg' : ''}`}>
            <b>{k}</b> → {show(x)}
          </span>
        ))}
        {entries.length === 0 && <span className="tv-empty">{isMarker(value) ? 'empty Map' : '{}'}</span>}
      </div>
    );
  } else body = <span className={`tv-prim ${changed ? 'chg' : ''}`}>{show(value)}</span>;
  return (
    <div className={`tv-var ${changed ? 'changed' : ''} ${fresh ? 'fresh' : ''}`}>
      <span className="tv-vn">{name}</span>
      <div className="tv-vb">{body}</div>
    </div>
  );
}

/** the end of the story: what came back, against what the test expects, with a jump to where it happened */
function Verdict({ trace, test, fnName, go }: { trace: Trace; test: CodingTest; fnName: string; go: (i: number) => void }) {
  const last = trace.steps.length - 1;
  if (trace.error)
    return (
      <div className="tv-verdict bad" role="status">
        <b>✗ Crashed on line {trace.errorLine}:</b> {trace.error}
        <button type="button" className="btn-ghost btn-xs" onClick={() => go(last)}>
          Go to the crash
        </button>
      </div>
    );
  const retAt = trace.steps.findLastIndex((s) => s.returned && s.fn === fnName);
  const ok = same(trace.got, test.expected);
  if (ok)
    return (
      <div className="tv-verdict ok" role="status">
        <b>✓ Returns {show(test.expected)}</b>, which is what the test expects.
      </div>
    );
  if (retAt < 0)
    return (
      <div className="tv-verdict bad" role="status">
        <b>✗ The function ended without returning anything</b> (undefined). The test expects {show(test.expected)}: is a <code>return</code> missing, or never reached?
        <button type="button" className="btn-ghost btn-xs" onClick={() => go(last)}>
          Go to the last step
        </button>
      </div>
    );
  const why = whereItWentWrong(trace, fnName, test.expected);
  const exp = test.expected as unknown[];
  return (
    <div className="tv-verdict bad" role="status">
      <b>
        ✗ Returned {show(trace.got)} on line {trace.steps[retAt].line}
      </b>
      , but the test expects <b>{show(test.expected)}</b>.
      <button type="button" className="btn-ghost btn-xs" onClick={() => go(retAt)}>
        Go to the return
      </button>
      {why && (why.parts.length > 0 || why.length) && (
        <div className="tv-why">
          <span className="mlabel">
            Where it went wrong in <code>{why.name}</code>
          </span>
          <ul>
            {why.length && (
              <li>
                It has {why.length.got} items; the test expects {why.length.want}.
              </li>
            )}
            {why.parts.slice(0, 4).map((p) => (
              <li key={p.index ?? 'v'}>
                {p.index === undefined ? <code>{why.name}</code> : <>cell {p.index}</>}{' '}
                {p.never ? (
                  <>
                    never changed: it still holds its starting value
                    {p.index !== undefined && <> instead of {show(exp[p.index])}</>}.
                  </>
                ) : (
                  <>
                    last changed on <b>line {p.line}</b>
                    {p.index !== undefined && <> (should end as {show(exp[p.index])})</>}.
                  </>
                )}
                <button type="button" className="btn-ghost btn-xs" onClick={() => go(p.step)}>
                  {p.never ? 'Show the start' : 'Show it'}
                </button>
              </li>
            ))}
            {why.parts.length > 4 && <li>…and {why.parts.length - 4} more cells.</li>}
          </ul>
          <BugsyTip>
            {why.parts[0]?.never ? (
              <>
                no line ever wrote {why.parts[0].index === undefined ? <code>{why.name}</code> : <>cell {why.parts[0].index}</>}. Step through the loop and ask which line
                should have.
              </>
            ) : why.parts[0] ? (
              <>
                replay it and watch line {why.parts[0].line}: that is where <code>{why.name}</code> last got a wrong value.
              </>
            ) : (
              <>compare the length you build with the length the test expects.</>
            )}
          </BugsyTip>
        </div>
      )}
    </div>
  );
}

export function TraceViewer({ code, fnName, tests, run }: { code: string; fnName: string; tests: CodingTest[]; run: RunRecord }) {
  const visible = tests.map((t, i) => ({ t, i })).filter((x) => !x.t.hidden);
  const resultOf = (i: number) => run.results.find((r) => r.index === i);
  const firstFail = visible.find((x) => resultOf(x.i) && !resultOf(x.i)!.pass);
  const hiddenOnly = !firstFail && run.results.some((r) => r.hidden && !r.pass);
  const [pick, setPick] = useState<number>(firstFail?.i ?? visible[0]?.i ?? 0);
  // the trace and the test it belongs to: while they differ, the picked test is still being traced
  const [res, setRes] = useState<{ pick: number; trace: Trace } | null>(null);
  const [step, setStep] = useState(0);
  const [play, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(750);
  const codeBox = useRef<HTMLOListElement>(null);
  // the code as it was when the tests ran: this viewer belongs to that run
  const [ranCode] = useState(code);
  const lines = useMemo(() => ranCode.split('\n'), [ranCode]);

  // trace the picked test (on open, the first failing visible one)
  useEffect(() => {
    let live = true;
    const t = tests[pick];
    if (!t || t.hidden) return;
    void runTrace(ranCode, fnName, t).then((tr) => {
      if (!live) return;
      setRes({ pick, trace: tr });
      setStep(0);
      setPlaying(!tr.fatal && tr.steps.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches);
    });
    return () => {
      live = false;
    };
  }, [pick, fnName, tests, ranCode]);

  const busy = res?.pick !== pick;
  const trace = busy ? null : res!.trace;
  const n = trace?.steps.length ?? 0;
  // play: one step per tick; it stops by itself at the last step
  const playing = play && step < n - 1;
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setStep((s) => s + 1), speed);
    return () => clearTimeout(id);
  }, [playing, step, n, speed]);

  const cur: TraceStep | undefined = trace?.steps[step];
  const prev = trace?.steps[step - 1];
  // keep the lit line in view inside the code box, without moving the page
  useEffect(() => {
    const box = codeBox.current;
    const li = box?.querySelector<HTMLElement>('.now');
    if (!box || !li) return;
    if (li.offsetTop < box.scrollTop || li.offsetTop + li.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = li.offsetTop - box.clientHeight / 2;
  }, [step, trace]);

  const go = (i: number) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(n - 1, i)));
  };
  const test = tests[pick];
  const atEnd = step >= n - 1;
  const crashLine = trace?.error && atEnd ? trace.errorLine : undefined;
  const finalReturn = !!cur?.returned && cur.fn === fnName && step === trace?.steps.findLastIndex((x) => x.returned && x.fn === fnName);

  return (
    <section className="tv" aria-label="Step-through visualiser" aria-live="off">
      <div className="tv-head">
        <span className="mlabel">
          Visualise <b>· step through your code</b>
        </span>
        <div className="tv-picks" role="group" aria-label="Test to visualise">
          {visible.map(({ i }) => {
            const r = resultOf(i);
            return (
              <button key={i} type="button" className={`tv-pick ${r ? (r.pass ? 'ok' : 'bad') : ''}`} aria-pressed={pick === i} onClick={() => setPick(i)}>
                {r ? (r.pass ? '✓' : '✗') : '·'} {pad(i + 1)}
              </button>
            );
          })}
        </div>
      </div>
      {hiddenOnly && <p className="tv-note">Only hidden tests fail. Their inputs stay hidden, so step through a visible test and think about which edge case it does not cover.</p>}
      {test && (
        <p className="tv-call mono">
          {fnName}({test.args.map(show).join(', ')}) <span>→ expects {show(test.expected)}</span>
        </p>
      )}
      {busy && <p className="tv-note">Tracing your code…</p>}
      {!busy && trace?.fatal && <p className="tv-verdict bad">✗ {trace.fatal}</p>}
      {!busy && trace && !trace.fatal && n === 0 && <p className="tv-note">Nothing ran: there were no statements to step through.</p>}
      {!busy && trace && !trace.fatal && cur && test && (
        <>
          <div className="tv-stage">
            <ol className="tv-code" ref={codeBox} aria-label="Your code">
              {lines.map((l, i) => (
                <li key={i} className={`${cur.line === i + 1 ? 'now' : ''} ${crashLine === i + 1 ? 'crash' : ''}`} aria-current={cur.line === i + 1 ? 'step' : undefined}>
                  <span className="tv-ln">{i + 1}</span>
                  <code>{l || ' '}</code>
                </li>
              ))}
            </ol>
            <div className="tv-state">
              <div className="tv-where">
                in <b>{cur.fn === '(top)' ? 'top level' : `${cur.fn}()`}</b> · line {cur.line}
                {cur.returned && (
                  <span className="tv-ret">
                    returns <b>{show(cur.ret)}</b>
                  </span>
                )}
              </div>
              {Object.keys(cur.vars).length === 0 && <p className="tv-note">No variables yet.</p>}
              {Object.entries(cur.vars).map(([k, v]) => (
                <VarView
                  key={k}
                  name={k}
                  value={v}
                  prev={prev && prev.fn === cur.fn ? prev.vars[k] : undefined}
                  all={cur.vars}
                  // on the final return, the variable being returned is laid against what the test expects
                  expect={finalReturn && same(v, cur.ret) && !same(v, test.expected) ? test.expected : undefined}
                />
              ))}
            </div>
          </div>
          <div className="tv-ctl">
            <button type="button" className="btn-ghost btn-xs" onClick={() => go(0)} disabled={step === 0} aria-label="First step">
              <ChevronsLeft size={15} aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost btn-xs" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Previous step">
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-sm tv-play"
              onClick={() => {
                if (atEnd) setStep(0);
                setPlaying((p) => !p || atEnd);
              }}
            >
              {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />} {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
            </button>
            <button type="button" className="btn-ghost btn-xs" onClick={() => go(step + 1)} disabled={atEnd} aria-label="Next step">
              <ChevronRight size={15} aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost btn-xs" onClick={() => go(n - 1)} disabled={atEnd} aria-label="Last step">
              <ChevronsRight size={15} aria-hidden="true" />
            </button>
            <input type="range" className="tv-scrub" min={0} max={Math.max(0, n - 1)} value={step} onChange={(e) => go(Number(e.target.value))} aria-label="Step" />
            <span className="mono tv-count">
              {step + 1}/{n}
              {trace.truncated ? '+' : ''}
            </span>
            <select className="tv-speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Speed">
              {SPEEDS.map(([ms, l]) => (
                <option key={ms} value={ms}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          {trace.truncated && <p className="tv-note">Showing the first {n} steps; the rest ran but were not recorded.</p>}
          <Verdict trace={trace} test={test} fnName={fnName} go={go} />
        </>
      )}
    </section>
  );
}
