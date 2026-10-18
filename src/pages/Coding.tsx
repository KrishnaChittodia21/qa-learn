import { useEffect, useState, type CSSProperties, type ReactNode, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Lightbulb, Play, RotateCcw, Search, Send } from 'lucide-react';
import { CODING_PROBLEMS } from '../content';
import type { CodingProblem, Difficulty } from '../types';
import { setDraft, setFlag, useProgress, type Progress } from '../lib/progress';
import { celebrate } from '../lib/celebrate';
import { RunnerConsole } from '../components/TestRunner';
import { runSummary, useTestRun } from '../lib/testRun';
import { CodeBlock, CodeEditor, FollowUps, Markdown } from '../components/ui';

type Cat = CodingProblem['category'];
const CATEGORIES: { id: Cat; label: string; short: string; c: string }[] = [
  { id: 'arrays', label: 'Arrays', short: 'ARR', c: 'var(--lime)' },
  { id: 'strings', label: 'Strings', short: 'STR', c: 'var(--mint)' },
  { id: 'objects', label: 'Objects', short: 'OBJ', c: 'var(--cyan)' },
  { id: 'logic', label: 'Logic & numbers', short: 'LOG', c: 'var(--flaky)' },
  { id: 'async', label: 'Async & promises', short: 'ASY', c: 'var(--iris)' },
  { id: 'qa-utils', label: 'QA utilities', short: 'QA', c: 'var(--lilac)' },
];
const CAT_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
const DIFFS: { id: Difficulty; label: string; abbr: string }[] = [
  { id: 'easy', label: 'Easy', abbr: 'EASY' },
  { id: 'medium', label: 'Medium', abbr: 'MED' },
  { id: 'hard', label: 'Hard', abbr: 'HARD' },
  { id: 'expert', label: 'Expert', abbr: 'EXP' },
];
const DIFF_ABBR: Record<Difficulty, string> = { easy: 'EASY', medium: 'MED', hard: 'HARD', expert: 'EXP' };

type PState = 'ok' | 'draft' | 'todo';
function problemState(p: Progress, q: CodingProblem): PState {
  if (p.code[q.id]) return 'ok';
  const d = p.drafts[`code:${q.id}`];
  return d !== undefined && d !== q.starter ? 'draft' : 'todo';
}
const MARK: Record<PState, string> = { ok: '✓', draft: '◆', todo: '○' };
const STATE_LABEL: Record<PState, string> = { ok: 'solved', draft: 'draft saved', todo: 'not started' };
const pad = (n: number) => String(n).padStart(2, '0');

/** portal a readout into the shell's console strip */
const noopSubscribe = () => () => {};
const getSlot = () => document.getElementById('console-slot');

function ConsoleSlot({ children }: { children: ReactNode }) {
  // read after commit: on first load the shell's slot mounts in the same commit as the page
  const el = useSyncExternalStore(noopSubscribe, getSlot, () => null);
  return el ? createPortal(children, el) : null;
}

// ---------- filters ----------
type StatusF = 'all' | 'unsolved' | 'draft' | 'solved';
interface Filters {
  q: string;
  diff: 'all' | Difficulty;
  status: StatusF;
  cat: 'all' | Cat;
}
const NO_FILTERS: Filters = { q: '', diff: 'all', status: 'all', cat: 'all' };

function applyFilters(p: Progress, f: Filters, ignoreCat = false) {
  const needle = f.q.trim().toLowerCase();
  return CODING_PROBLEMS.filter((q) => {
    if (!ignoreCat && f.cat !== 'all' && q.category !== f.cat) return false;
    if (f.diff !== 'all' && q.difficulty !== f.diff) return false;
    const st = problemState(p, q);
    if (f.status === 'unsolved' && st === 'ok') return false;
    if (f.status === 'draft' && st !== 'draft') return false;
    if (f.status === 'solved' && st !== 'ok') return false;
    if (needle && !`${q.title} ${q.fnName} ${q.category}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}

function FilterControls({ f, set, p, compact }: { f: Filters; set: (f: Filters) => void; p: Progress; compact?: boolean }) {
  const diffs = DIFFS.filter((d) => CODING_PROBLEMS.some((q) => q.difficulty === d.id));
  const counts = {
    unsolved: CODING_PROBLEMS.filter((q) => !p.code[q.id]).length,
    draft: CODING_PROBLEMS.filter((q) => problemState(p, q) === 'draft').length,
    solved: CODING_PROBLEMS.filter((q) => p.code[q.id]).length,
  };
  const toggleStatus = (s: StatusF) => set({ ...f, status: f.status === s ? 'all' : s });
  const statusChip = (s: Exclude<StatusF, 'all'>, label: string) => (
    <button type="button" className={`chip ${f.status === s ? 'on' : ''}`} aria-pressed={f.status === s} onClick={() => toggleStatus(s)}>
      {label} <span className="n">{counts[s]}</span>
    </button>
  );
  return (
    <div className={`cx-filters ${compact ? 'compact' : ''}`}>
      <div className="cx-srch">
        <Search size={15} aria-hidden="true" />
        <input
          className="input"
          type="search"
          placeholder="Filter problems…"
          value={f.q}
          onChange={(e) => set({ ...f, q: e.target.value })}
          aria-label="Filter problems by name"
        />
      </div>
      <div className="cx-dseg" role="group" aria-label="Difficulty">
        <button type="button" aria-pressed={f.diff === 'all'} onClick={() => set({ ...f, diff: 'all' })}>
          All<small>{CODING_PROBLEMS.length}</small>
        </button>
        {diffs.map((d) => (
          <button key={d.id} type="button" aria-pressed={f.diff === d.id} onClick={() => set({ ...f, diff: d.id })}>
            {d.abbr}
            <small>{CODING_PROBLEMS.filter((q) => q.difficulty === d.id).length}</small>
          </button>
        ))}
      </div>
      <div className="cx-fchips" role="group" aria-label="Status">
        {statusChip('unsolved', 'Unsolved')}
        {statusChip('draft', 'Drafts')}
        {statusChip('solved', 'Solved')}
      </div>
      {!compact && (
        <div className="cx-fchips cx-cats" role="group" aria-label="Category">
          <button type="button" className={`chip ${f.cat === 'all' ? 'on' : ''}`} aria-pressed={f.cat === 'all'} onClick={() => set({ ...f, cat: 'all' })}>
            All suites
          </button>
          {CATEGORIES.map((c) => {
            const n = CODING_PROBLEMS.filter((q) => q.category === c.id).length;
            if (!n) return null;
            return (
              <button
                key={c.id}
                type="button"
                className={`chip ${f.cat === c.id ? 'on' : ''}`}
                aria-pressed={f.cat === c.id}
                style={{ '--c': c.c } as CSSProperties}
                onClick={() => set({ ...f, cat: c.id })}
              >
                <i className="cx-dia" aria-hidden="true" />
                {c.label} <span className="n">{n}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProblemRow({ q, p, current }: { q: CodingProblem; p: Progress; current?: boolean }) {
  const st = problemState(p, q);
  return (
    <li>
      <Link to={`/coding/${q.id}`} className={`cx-pi ${st} ${current ? 'cur' : ''}`} aria-current={current ? 'page' : undefined}>
        <span className="m" role="img" aria-label={STATE_LABEL[st]}>
          {MARK[st]}
        </span>
        <span className="t">{q.title}</span>
        <span className={`df ${q.difficulty}`}>{DIFF_ABBR[q.difficulty]}</span>
      </Link>
    </li>
  );
}

function GroupHead({ c, p, shown, children }: { c: (typeof CATEGORIES)[number]; p: Progress; shown?: number; children?: ReactNode }) {
  const all = CODING_PROBLEMS.filter((q) => q.category === c.id);
  const solved = all.filter((q) => p.code[q.id]).length;
  return (
    <>
      <span className="nm">
        <i className="cx-dia" aria-hidden="true" />
        {c.label}
      </span>
      <span className="ct">
        {shown !== undefined && shown !== all.length ? `${shown} shown · ` : ''}
        {solved} / {all.length}
        {children}
      </span>
      <span
        className="seg thin"
        style={{ '--n': all.length, '--v': solved, '--g': c.c, '--gap': all.length > 20 ? '1px' : '2px' } as CSSProperties}
        aria-hidden="true"
      />
    </>
  );
}

// ---------- progress readout (shared by list + problem) ----------
function Readouts({ p, current }: { p: Progress; current?: CodingProblem }) {
  const total = CODING_PROBLEMS.length;
  const solved = CODING_PROBLEMS.filter((q) => p.code[q.id]).length;
  const drafts = CODING_PROBLEMS.filter((q) => problemState(p, q) === 'draft').length;
  const diffs = DIFFS.map((d) => {
    const all = CODING_PROBLEMS.filter((q) => q.difficulty === d.id);
    return { ...d, all: all.length, solved: all.filter((q) => p.code[q.id]).length };
  }).filter((d) => d.all > 0);
  const cats = CATEGORIES.map((c) => {
    const all = CODING_PROBLEMS.filter((q) => q.category === c.id);
    const s = all.filter((q) => p.code[q.id]).length;
    return { ...c, all: all.length, solved: s, pct: all.length ? Math.round((s / all.length) * 100) : 0 };
  }).filter((c) => c.all > 0);
  const ranked = [...cats].sort((a, b) => a.pct - b.pct);
  const nextDiff = diffs.find((d) => d.solved < d.all);

  return (
    <section className="panel flat cx-prog rise" style={{ '--i': 1 } as CSSProperties} aria-label="Coding progress">
      <div className="ch">
        <div className="mlabel">
          <span>Solved</span>
          <span>CH1</span>
        </div>
        <div className="readout">
          <span className="num">
            {solved}
            <small>/{total}</small>
          </span>
        </div>
        <span className="seg" style={{ '--n': 24, '--v': Math.round((solved / Math.max(1, total)) * 24) } as CSSProperties} aria-hidden="true" />
        <p className="foot">
          <b>{Math.round((solved / Math.max(1, total)) * 100)}%</b> of the bank · <b>{drafts}</b> draft{drafts === 1 ? '' : 's'}
        </p>
      </div>
      <div className="ch">
        <div className="mlabel">
          <span>Difficulty</span>
          <span>CH2</span>
        </div>
        <div className="cx-dif">
          {diffs.map((d) => {
            const n = Math.min(d.all, 20);
            return (
              <div key={d.id}>
                <span>{d.abbr}</span>
                <span
                  className="seg thin"
                  style={
                    {
                      '--n': n,
                      '--v': Math.round((d.solved / d.all) * n),
                      '--g': d.id === 'easy' ? 'var(--mint)' : d.id === 'medium' ? 'var(--cyan)' : 'var(--lilac)',
                    } as CSSProperties
                  }
                  aria-hidden="true"
                />
                <span>
                  {d.solved}/{d.all}
                </span>
              </div>
            );
          })}
        </div>
        {current ? (
          <p className="foot">
            this spec: <b>{current.difficulty}</b> · {current.tests.length} tests
          </p>
        ) : (
          nextDiff && (
            <p className="foot">
              open: <b>{nextDiff.label}</b> × {nextDiff.all - nextDiff.solved}
            </p>
          )
        )}
      </div>
      <div className="ch">
        <div className="mlabel">
          <span>Suite coverage</span>
          <span>CH3</span>
        </div>
        <div className="cx-hist" aria-hidden="true">
          {cats.map((c) => (
            <div key={c.id} className={`b ${current?.category === c.id ? 'cur' : ''}`} style={{ '--c': c.c, '--v': c.pct } as CSSProperties}>
              <span className="bar" />
              <span className="lb">{c.short}</span>
            </div>
          ))}
        </div>
        <ul className="sr-only">
          {cats.map((c) => (
            <li key={c.id}>
              {c.label}: {c.solved} of {c.all} solved
            </li>
          ))}
        </ul>
        {ranked.length > 1 && (
          <div className="cx-hist-k">
            <span>
              weakest <b>{ranked[0].short.toLowerCase()}</b> {ranked[0].pct}%
            </span>
            <span>
              best <b>{ranked[ranked.length - 1].short.toLowerCase()}</b> {ranked[ranked.length - 1].pct}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- list page ----------
export function CodingListPage() {
  const p = useProgress();
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const list = applyFilters(p, f);
  const solved = CODING_PROBLEMS.filter((q) => p.code[q.id]).length;
  const next = CODING_PROBLEMS.find((q) => problemState(p, q) === 'draft') ?? CODING_PROBLEMS.find((q) => !p.code[q.id]);
  const filtered = f.q !== '' || f.diff !== 'all' || f.status !== 'all' || f.cat !== 'all';

  return (
    <div className="page cx-page">
      <ConsoleSlot>
        <span className="cx-slot">
          {solved}/{CODING_PROBLEMS.length} solved
        </span>
      </ConsoleSlot>
      <div className="cx-bento cx-list-bento">
        <section className="panel cut-lg cx-hero rise" style={{ '--i': 0 } as CSSProperties}>
          <div className="cx-hero-top">
            <span className="chip holo">Problem bank</span>
            <span className="coord">
              {CODING_PROBLEMS.length} SPECS · {CATEGORIES.length} SUITES
            </span>
          </div>
          <h1 className="cx-h1">
            Coding <span className="outline">practice</span>
          </h1>
          <p className="lede">
            The array, string and object problems that QA automation and SDET interviews ask. Write the function in the editor,
            <b> run</b> the visible tests, then <b>submit</b> to run the hidden ones too. Your code runs in your browser.
          </p>
          {next && (
            <div className="cx-hero-cta">
              <Link to={`/coding/${next.id}`} className="btn btn-holo">
                {problemState(p, next) === 'draft' ? 'Resume draft' : 'Next unsolved'}{' '}
                <span className="arr">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
              <span className="cx-hero-next">
                <span className="mlabel">
                  {CAT_BY_ID.get(next.category)?.short} · {DIFF_ABBR[next.difficulty]}
                </span>
                <span>{next.title}</span>
              </span>
            </div>
          )}
        </section>

        <Readouts p={p} />

        <section className="panel flat cx-filterbar rise" style={{ '--i': 2 } as CSSProperties} aria-label="Filter problems">
          <FilterControls f={f} set={setF} p={p} />
          <div className="cx-filter-foot">
            <span className="mlabel">
              <b>{list.length}</b> / {CODING_PROBLEMS.length} specs
            </span>
            {filtered && (
              <button type="button" className="btn-ghost btn-xs" onClick={() => setF(NO_FILTERS)}>
                Clear filters
              </button>
            )}
          </div>
        </section>
      </div>

      {!CODING_PROBLEMS.length && <p className="ink3">Problems are still being written. Check back soon.</p>}
      {CODING_PROBLEMS.length > 0 && list.length === 0 && (
        <div className="panel flat cx-empty">
          <span className="mlabel">0 matches</span>
          <p>No problem matches these filters.</p>
          <button type="button" className="btn btn-sm" onClick={() => setF(NO_FILTERS)}>
            Clear filters
          </button>
        </div>
      )}

      <div className="cx-suites">
        {CATEGORIES.map((c, i) => {
          const rows = list.filter((q) => q.category === c.id);
          if (!rows.length) return null;
          return (
            <section key={c.id} className="panel cx-suite rise" style={{ '--c': c.c, '--i': 3 + i } as CSSProperties} aria-label={c.label}>
              <div className="cx-grp-h">
                <GroupHead c={c} p={p} shown={rows.length} />
              </div>
              <ul className="cx-pl">
                {rows.map((q) => (
                  <ProblemRow key={q.id} q={q} p={p} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------- problem page ----------
export function CodingProblemPage() {
  const { pid = '' } = useParams();
  const idx = CODING_PROBLEMS.findIndex((q) => q.id === pid);
  const q = CODING_PROBLEMS[idx];
  if (!q) {
    return (
      <div className="page cx-page">
        <section className="panel cx-empty">
          <span className="chip fail">404 · spec not found</span>
          <h1 className="h2">Problem not found</h1>
          <Link to="/coding" className="btn">
            <ArrowLeft size={16} aria-hidden="true" /> All problems
          </Link>
        </section>
      </div>
    );
  }
  // keyed so that switching problems resets editor state, results and hints
  return <ProblemView key={q.id} q={q} n={idx + 1} prev={CODING_PROBLEMS[idx - 1]} next={CODING_PROBLEMS[idx + 1]} />;
}

function ProblemBank({ p, current }: { p: Progress; current: CodingProblem }) {
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const [open, setOpen] = useState<Set<Cat>>(() => new Set([current.category]));
  const list = applyFilters(p, f, true);
  const searching = f.q !== '' || f.diff !== 'all' || f.status !== 'all';
  const solved = CODING_PROBLEMS.filter((q) => p.code[q.id]).length;
  const toggle = (c: Cat) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  return (
    <aside className="panel cx-bank" aria-label="Problem bank">
      <div className="p-head">
        <span className="mlabel">Problem bank</span>
        <span className="mlabel">
          <b>{solved}</b> / {CODING_PROBLEMS.length} solved
        </span>
      </div>
      <FilterControls f={f} set={setF} p={p} compact />
      <div className="cx-bank-scroll">
        {CATEGORIES.map((c) => {
          const rows = list.filter((q) => q.category === c.id);
          if (!rows.length) return null;
          const isOpen = searching || open.has(c.id);
          return (
            <div key={c.id} className={`cx-grp ${isOpen ? 'open' : ''}`} style={{ '--c': c.c } as CSSProperties}>
              <button type="button" className="cx-grp-h" aria-expanded={isOpen} onClick={() => toggle(c.id)} disabled={searching}>
                <GroupHead c={c} p={p} shown={searching ? rows.length : undefined}>
                  <ChevronDown size={13} aria-hidden="true" className="chev" />
                </GroupHead>
              </button>
              {isOpen && (
                <ul className="cx-pl">
                  {rows.map((q) => (
                    <ProblemRow key={q.id} q={q} p={p} current={q.id === current.id} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="cx-bank-none">No matches.</p>}
      </div>
      <div className="cx-bank-foot">
        <Link to="/coding" className="mlabel">
          ← All problems
        </Link>
        <span className="mlabel">{CATEGORIES.length} suites</span>
      </div>
    </aside>
  );
}

/** the shared editor with a line-number gutter (dark island) */
function NumberedEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const lines = Math.max(1, value.split('\n').length);
  return (
    <div className="cx-ed-wrap" data-theme="dark">
      <div className="cx-gutter" aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div className="cx-ed-main">
        <CodeEditor value={value} onChange={onChange} language="javascript" />
      </div>
    </div>
  );
}

function ProblemView({ q, n, prev, next }: { q: CodingProblem; n: number; prev?: CodingProblem; next?: CodingProblem }) {
  const p = useProgress();
  const draftKey = `code:${q.id}`;
  const code = p.drafts[draftKey] ?? q.starter;
  const [hints, setHints] = useState(0);
  const [showSol, setShowSol] = useState(false);
  // bumping the key clears the previous results after a reset
  const [runKey, setRunKey] = useState(0);
  const st = problemState(p, q);
  const cat = CAT_BY_ID.get(q.category);
  const visible = q.tests.filter((t) => !t.hidden);
  // bring the solution into view when it is opened from the editor's action bar
  useEffect(() => {
    if (!showSol) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('cx-solution')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [showSol]);
  const hiddenN = q.tests.length - visible.length;

  return (
    <div className="page cx-page cx-problem">
      <ConsoleSlot>
        <span className="cx-slot">
          problem {pad(n)} / {CODING_PROBLEMS.length} · {STATE_LABEL[st]}
        </span>
      </ConsoleSlot>
      <div className="cx-bento cx-prob-bento">
        <ProblemBank p={p} current={q} />
        <Readouts p={p} current={q} />

        <section className="panel cx-stmt rise" style={{ '--i': 2 } as CSSProperties} aria-labelledby="cx-title">
          <div className="cx-st-top">
            {st === 'ok' ? (
              <span className="chip pass">✓ solved</span>
            ) : st === 'draft' ? (
              <span className="chip run">draft</span>
            ) : (
              <span className="chip skip">unsolved</span>
            )}
            <span className="mlabel cx-st-cat" style={{ '--c': cat?.c } as CSSProperties}>
              <i className="cx-dia" aria-hidden="true" /> {cat?.label} · <b>#{pad(n)}</b>
            </span>
          </div>
          <h1 id="cx-title" className="cx-title">
            {q.title}
          </h1>
          <div className="cx-meta">
            <span className={`tag df-${q.difficulty}`}>{DIFF_ABBR[q.difficulty]}</span>
            <span className="tag">{q.fnName}()</span>
            <span className="tag">
              {visible.length} tests{hiddenN ? ` + ${hiddenN} hidden` : ''}
            </span>
          </div>
          <div className="cx-prose">
            <Markdown>{q.prompt}</Markdown>
          </div>

          {visible.length > 0 && (
            <div className="cx-ex">
              <div className="cx-ex-h">
                <span className="mlabel">Example tests</span>
                <span className="mlabel">
                  {Math.min(3, visible.length)} of {visible.length} visible
                </span>
              </div>
              {visible.slice(0, 3).map((t, i) => (
                <div key={i} className="cx-ex-row">
                  <span className="k">{pad(i + 1)}</span>
                  <code>
                    {q.fnName}({t.args.map((a) => JSON.stringify(a)).join(', ')})<span className="arrow"> → </span>
                    <b>{JSON.stringify(t.expected)}</b>
                  </code>
                </div>
              ))}
            </div>
          )}

          {q.hints.length > 0 && (
            <div className="cx-hints" aria-live="polite">
              {q.hints.map((h, i) =>
                i < hints ? (
                  <div key={i} className="cx-hint open">
                    <span className="mlabel">Hint {i + 1}</span>
                    <div className="cx-hint-body">
                      <Markdown>{h}</Markdown>
                    </div>
                  </div>
                ) : i === hints ? (
                  <button key={i} type="button" className="cx-hint next" onClick={() => setHints((x) => x + 1)}>
                    <span className="mlabel">Hint {i + 1}</span>
                    <span className="cx-hint-body">
                      <Lightbulb size={14} aria-hidden="true" /> Reveal hint {i + 1} of {q.hints.length}
                    </span>
                  </button>
                ) : (
                  <div key={i} className="cx-hint locked" aria-hidden="true">
                    <span className="mlabel">Hint {i + 1}</span>
                    <span className="bl">
                      <i style={{ width: '46%' }} />
                      <i style={{ width: '22%' }} />
                      <i style={{ width: '14%' }} />
                    </span>
                  </div>
                ),
              )}
            </div>
          )}

          {q.askedIn && (
            <div className="cx-tie">
              <span className="mlabel">Asked in interviews</span>
              {q.askedIn}
            </div>
          )}
        </section>

        <Workbench
          key={runKey}
          q={q}
          code={code}
          onChange={(v) => setDraft(draftKey, v)}
          hintsShown={hints}
          onHint={() => setHints((x) => Math.min(q.hints.length, x + 1))}
          showSol={showSol}
          onSolution={() => setShowSol((s) => !s)}
          onReset={() => {
            setDraft(draftKey, q.starter);
            setRunKey((k) => k + 1);
          }}
        />

        {showSol && (
          <section id="cx-solution" className="panel cx-sol" aria-label="Reference solution and explanation">
            <div className="p-head">
              <span className="mlabel">
                Reference solution <b>· {q.fnName}.js</b>
              </span>
              <button type="button" className="btn-ghost btn-xs" onClick={() => setShowSol(false)}>
                Hide
              </button>
            </div>
            <CodeBlock snippet={{ language: 'javascript', title: 'Solution', code: q.solution }} />
            <Markdown>{q.explanation}</Markdown>
            <FollowUps items={q.followUps} />
          </section>
        )}

        <nav className="panel flat cx-pager" aria-label="Problem navigation">
          {prev ? (
            <Link to={`/coding/${prev.id}`}>
              <span className="mlabel">← Prev · #{pad(n - 1)}</span>
              <span className="t">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/coding/${next.id}`} className="nx">
              <span className="mlabel">Next · #{pad(n + 1)} →</span>
              <span className="t">{next.title}</span>
            </Link>
          ) : (
            <Link to="/coding" className="nx">
              <span className="mlabel">Done →</span>
              <span className="t">All problems</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}

function Workbench({
  q,
  code,
  onChange,
  hintsShown,
  onHint,
  showSol,
  onSolution,
  onReset,
}: {
  q: CodingProblem;
  code: string;
  onChange: (v: string) => void;
  hintsShown: number;
  onHint: () => void;
  showSol: boolean;
  onSolution: () => void;
  onReset: () => void;
}) {
  const t = useTestRun({
    code,
    fnName: q.fnName,
    tests: q.tests,
    onAllPassed: () => {
      setFlag('code', q.id, true);
      celebrate('Problem solved!', `${q.title}: all ${q.tests.length} tests pass.`);
    },
  });
  const s = runSummary(t.run);
  const hasRun = !!t.run && !t.busy;
  const allHints = hintsShown >= q.hints.length;

  return (
    <>
      <section className="panel cx-ed" data-theme="dark" aria-label="Code editor">
        <div className="cx-ed-tabs">
          <span className="on">{q.fnName}.js</span>
          <span className="cx-hide-s">
            tests.spec.js
            {hasRun && !s.all && <span className="cnt">{s.failed}×</span>}
          </span>
          <span className="rt cx-hide-s">autosaved</span>
          <button type="button" className="cx-reset" onClick={onReset} title="Reset to the starter code">
            <RotateCcw size={13} aria-hidden="true" /> Reset
          </button>
        </div>
        <NumberedEditor value={code} onChange={onChange} />
        <div className="cx-ed-act">
          {t.hasHidden && (
            <button className="btn" type="button" disabled={t.busy} onClick={() => void t.execute('run')}>
              <Play size={15} aria-hidden="true" /> Run
            </button>
          )}
          <button className="btn btn-holo" type="button" disabled={t.busy} onClick={() => void t.execute('submit')}>
            <Send size={15} aria-hidden="true" /> {t.hasHidden ? 'Submit' : `Run all ${q.tests.length}`}
          </button>
          <span className="sp" />
          {q.hints.length > 0 && (
            <button className="btn-ghost" type="button" disabled={allHints} onClick={onHint} title={allHints ? 'Every hint is shown' : 'Reveal the next hint'}>
              <Lightbulb size={15} aria-hidden="true" /> Hint {allHints ? `${q.hints.length}/${q.hints.length}` : hintsShown + 1}
            </button>
          )}
          <button className="btn-ghost" type="button" aria-expanded={showSol} onClick={onSolution}>
            <BookOpen size={15} aria-hidden="true" /> Solution
          </button>
        </div>
        <div className="cx-ed-status">
          {t.busy ? (
            <span className="run">● running</span>
          ) : !hasRun ? (
            <span>ready</span>
          ) : t.run?.fatal ? (
            <span className="e">✗ error</span>
          ) : s.all ? (
            <span className="ok">✓ {s.passed} passing</span>
          ) : (
            <span className="e">✗ {s.failed} failing</span>
          )}
          <span>{code.split('\n').length} lines</span>
          <span className="sp" />
          <span className="cx-hide-s">spaces: 2</span>
          <span className="cx-hide-s">UTF-8</span>
          <span className="ok">◆ sandbox</span>
        </div>
      </section>
      <RunnerConsole className="cx-run" run={t.run} busy={t.busy} fnName={q.fnName} tests={q.tests} history={t.history} />
    </>
  );
}
