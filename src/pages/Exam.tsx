import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useBlocker, useParams } from 'react-router-dom';
import { MCQ_TOPIC, PHASES, TOPICS, TOPIC_BY_ID } from '../content';
import { ArrowRight, Check } from 'lucide-react';
import { celebrate } from '../lib/celebrate';
import type { Difficulty, MCQ, Topic } from '../types';
import { recordAnswers, recordTest, useProgress } from '../lib/progress';
import { sectionForQuestion, weakSections } from '../lib/weak';
import { practiceLocked } from '../lib/stats';
import { StudyLock } from './Topic';
import { CodeBlock, FollowUps, Markdown, formatClock } from '../components/ui';

interface Item {
  q: MCQ;
  /** order[displayIndex] = original option index */
  order: number[];
}

type Answers = Record<string, number[]>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

/* ---------- small presentation helpers ---------- */
const LETTERS = 'ABCDEFGHIJ';
const LEVELS: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
const LEVEL_FILL: Record<Difficulty, string> = { easy: 'var(--mint)', medium: 'var(--cyan)', hard: 'var(--iris)', expert: 'var(--lilac)' };
const specId = (i: number) => `S${String(i + 1).padStart(2, '0')}`;
const two = (n: number) => String(n).padStart(2, '0');
/** m:ss for per-spec timings */
const mss = (s: number) => `${Math.floor(s / 60)}:${two(Math.floor(s % 60))}`;
/** markdown question → one plain line for the reporter */
const plain = (md: string) =>
  md
    .split('\n')
    .find((l) => l.trim() && !l.startsWith('```'))
    ?.replace(/[`*_>#]/g, '')
    .trim() ?? md;
const cssVars = (v: Record<string, string | number>) => v as CSSProperties;
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();

interface SpecMeta {
  topic?: Topic;
  section: number;
  heading: string;
}
function specMeta(q: MCQ): SpecMeta {
  const topic = MCQ_TOPIC.get(q.id);
  if (!topic) return { section: -1, heading: '' };
  const section = sectionForQuestion(topic, q);
  return { topic, section, heading: topic.sections[section]?.heading ?? '' };
}

function PhaseLabel({ phaseNo }: { phaseNo?: number }) {
  return (
    <span className="mlabel">
      {phaseNo ? (
        <>
          <b>Phase {two(phaseNo)}</b> · exam
        </>
      ) : (
        <b>Practice drill</b>
      )}
    </span>
  );
}

function Keys({ lock }: { lock: boolean }) {
  return (
    <div className="ex-kb">
      <span className="keys">
        <kbd>1</kbd>
        <kbd>5</kbd>
      </span>
      <span>select options</span>
      <span className="keys">
        <kbd>←</kbd>
        <kbd>→</kbd>
      </span>
      <span>previous / next spec</span>
      <span className="keys">
        <kbd>F</kbd>
      </span>
      <span>flag for review</span>
      {lock && (
        <>
          <span className="keys">
            <kbd>L</kbd>
          </span>
          <span>lock in &amp; hear the follow-up</span>
        </>
      )}
    </div>
  );
}

export default function ExamPage() {
  const { id = '' } = useParams();
  const p = useProgress();
  const topic = TOPIC_BY_ID.get(id);
  if (!topic) return <div className="page">Topic not found</div>;
  if (practiceLocked(p, topic, 'exam')) {
    return (
      <div className="page">
        <Link to={`/topic/${topic.id}`} className="muted small">
          ← {topic.title}
        </Link>
        <StudyLock topic={topic} what="exam" />
      </div>
    );
  }
  return (
    <Exam
      key={topic.id}
      title={topic.title}
      questions={topic.test}
      recordTopicId={topic.id}
      backHref={`/topic/${topic.id}?tab=exam`}
    />
  );
}

export interface ExamProps {
  title: string;
  questions: MCQ[];
  /** full-length attempts count towards this topic's pass; omit for practice drills */
  recordTopicId?: string;
  backHref: string;
}

export function Exam({ title, questions, recordTopicId, backHref }: ExamProps) {
  const p = useProgress();
  const total = questions.length;
  const [phase, setPhase] = useState<'setup' | 'running' | 'done'>('setup');
  const [count, setCount] = useState(total);
  const [minutes, setMinutes] = useState(Math.ceil((total * p.settings.secondsPerQuestion) / 60));
  const [shuffleOn, setShuffleOn] = useState(p.settings.shuffle);
  // interview mode: lock each answer, then see feedback and the interviewer's follow-ups at once
  const [interviewMode, setInterviewMode] = useState(true);
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Item[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [cur, setCur] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [totalSecs, setTotalSecs] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  // seconds spent per spec, banked whenever the learner moves to another question
  const [spent, setSpent] = useState<Record<string, number>>({});
  // `remaining` at the moment the current question was opened
  const [switchAt, setSwitchAt] = useState(0);
  const deadline = useRef(0);
  const startedAt = useRef(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong'>('all');
  // compact sticky readout appears once the HUD scrolls out of view
  const hudRef = useRef<HTMLElement>(null);
  const [hudOut, setHudOut] = useState(false);

  const topic = recordTopicId ? TOPIC_BY_ID.get(recordTopicId) : undefined;
  const phaseNo = topic ? PHASES.find((ph) => ph.id === topic.phase)?.number : undefined;
  // after a full run is recorded, attempts already includes this run
  const runNo = (recordTopicId ? (p.tests[recordTopicId]?.attempts ?? 0) : 0) + (phase === 'done' && items.length === total ? 0 : 1);

  const start = () => {
    const qs = shuffleOn ? shuffle(questions) : questions;
    const chosen = qs.slice(0, count).map((q) => {
      const idx = q.options.map((_, i) => i);
      return { q, order: shuffleOn ? shuffle(idx) : idx };
    });
    setItems(chosen);
    setAnswers({});
    setFlagged(new Set());
    setLocked(new Set());
    setCur(0);
    setSpent({});
    const secs = Math.max(1, minutes) * 60;
    startedAt.current = Date.now();
    deadline.current = Date.now() + secs * 1000;
    setRemaining(secs);
    setTotalSecs(secs);
    setSwitchAt(secs);
    setPhase('running');
  };

  /** move to question `next`, banking the time spent on the current one */
  const go = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(items.length - 1, next));
      if (n === cur || !items[cur]) return;
      const id = items[cur].q.id;
      const d = Math.max(0, switchAt - remaining);
      setSpent((s) => ({ ...s, [id]: (s[id] ?? 0) + d }));
      setSwitchAt(remaining);
      setCur(n);
    },
    [items, cur, switchAt, remaining],
  );
  /** seconds spent on a spec, including the live time on the current one */
  const timeOn = (i: number) => {
    const id = items[i]?.q.id;
    if (!id) return 0;
    return (spent[id] ?? 0) + (i === cur ? Math.max(0, switchAt - Math.max(0, remaining)) : 0);
  };

  const score = useMemo(() => {
    if (!items.length) return 0;
    const correct = items.filter((it) => sameSet(answers[it.q.id] ?? [], it.q.correct)).length;
    return Math.round((correct / items.length) * 100);
  }, [items, answers]);

  const submit = useCallback(() => {
    setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
    setPhase('done');
  }, []);
  const confirmSubmit = () => {
    const un = items.filter((it) => !(answers[it.q.id] ?? []).length).length;
    if (!un || window.confirm(`${un} question(s) unanswered. Submit anyway?`)) submit();
  };

  // record result once when finishing a full-length exam
  const recorded = useRef(false);
  useEffect(() => {
    if (phase === 'running') recorded.current = false;
    if (phase === 'done' && !recorded.current) {
      recorded.current = true;
      recordAnswers(items.map((it) => ({ id: it.q.id, correct: sameSet(answers[it.q.id] ?? [], it.q.correct) })));
      if (recordTopicId && items.length === total) {
        recordTest(recordTopicId, score);
        if (score >= p.settings.passMark) celebrate('Exam passed!', `${title}: ${score}%`);
      }
    }
  }, [phase, items, answers, total, recordTopicId, score, p.settings.passMark, title]);

  // countdown
  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => {
      const left = Math.round((deadline.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) submit();
    }, 250);
    return () => clearInterval(t);
  }, [phase, submit]);

  // guard against leaving mid-exam
  const blocker = useBlocker(phase === 'running');
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Leave the exam? Your progress in this attempt will be lost.')) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (phase !== 'running') return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [phase]);

  const toggle = useCallback((item: Item, original: number) => {
    setAnswers((a) => {
      const prev = a[item.q.id] ?? [];
      const multi = item.q.correct.length > 1;
      const next = multi ? (prev.includes(original) ? prev.filter((x) => x !== original) : [...prev, original]) : [original];
      return { ...a, [item.q.id]: next };
    });
  }, []);
  const toggleFlag = useCallback((id: string) => {
    setFlagged((f) => {
      const s = new Set(f);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }, []);
  const lockIn = useCallback((id: string) => setLocked((l) => new Set(l).add(id)), []);

  // keyboard: 1-5 choose, ←/→ navigate, f flag, l lock in (interview mode)
  useEffect(() => {
    if (phase !== 'running') return;
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const item = items[cur];
      if (!item) return;
      const n = Number(e.key);
      if (n >= 1 && n <= item.order.length) {
        if (!locked.has(item.q.id)) toggle(item, item.order[n - 1]);
      } else if (e.key === 'ArrowRight') go(cur + 1);
      else if (e.key === 'ArrowLeft') go(cur - 1);
      else if (e.key.toLowerCase() === 'f') toggleFlag(item.q.id);
      else if (e.key.toLowerCase() === 'l' && interviewMode && (answers[item.q.id] ?? []).length) lockIn(item.q.id);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [phase, items, cur, toggle, locked, go, toggleFlag, lockIn, interviewMode, answers]);

  useEffect(() => {
    const el = hudRef.current;
    if (phase !== 'running' || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setHudOut(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [phase]);

  // section metadata for every spec in this run (TF-IDF matching is cached in lib/weak)
  const meta = useMemo(() => items.map((it) => specMeta(it.q)), [items]);

  /* ===================== SETUP ===================== */
  if (phase === 'setup') {
    const mix = LEVELS.map((d) => ({ d, n: questions.filter((q) => q.difficulty === d).length })).filter((x) => x.n);
    const history = recordTopicId ? (p.tests[recordTopicId]?.history ?? []).slice(-4) : [];
    const perQ = Math.round((minutes * 60) / Math.max(1, count));
    const segN = Math.min(total, 40);
    return (
      <div className="page ex">
        <Link to={backHref} className="ex-back mlabel">
          ← Back
        </Link>
        <div className="ex-bento">
          <section className="panel cut-lg ex-setup rise" style={cssVars({ '--i': 1 })} aria-labelledby="ex-setup-t">
            <div className="p-head">
              <PhaseLabel phaseNo={phaseNo} />
              <span className="mlabel">Configure run</span>
            </div>
            <h1 className="h1 ex-setup-t" id="ex-setup-t">
              {title}
            </h1>
            <p className="lede ex-setup-lede">Ready, set, test. Pick the run settings; the clock starts when you do.</p>

            <div className="ex-fields">
              <div className="ex-field">
                <label className="mlabel" htmlFor="ex-min">
                  Time limit · <b>minutes</b>
                </label>
                <div className="ex-field-row">
                  <input
                    id="ex-min"
                    className="input ex-num"
                    type="number"
                    min={1}
                    max={240}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value) || 1)}
                  />
                  {[5, 10, 15, 20, 30].map((m) => (
                    <button key={m} type="button" className={`chip ${minutes === m ? 'on' : ''}`} onClick={() => setMinutes(m)}>
                      {m}m
                    </button>
                  ))}
                </div>
                <span className="ex-hint">≈ {perQ}s per question</span>
              </div>

              <div className="ex-field">
                <label className="mlabel" htmlFor="ex-count">
                  Specs in this run ·{' '}
                  <b>
                    {count} / {total}
                  </b>
                </label>
                <input
                  id="ex-count"
                  className="ex-range"
                  type="range"
                  min={Math.min(5, total)}
                  max={total}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
                <div className="seg thin" style={cssVars({ '--n': segN, '--v': (count / total) * segN })} aria-hidden="true" />
                {recordTopicId ? (
                  count < total ? (
                    <span className="ex-hint t-flaky">Practice mode: only full-length attempts count towards passing.</span>
                  ) : (
                    <span className="ex-hint">Full length: this run counts towards passing the topic.</span>
                  )
                ) : (
                  <span className="ex-hint">Practice drill: updates your weak areas, never affects exam passes.</span>
                )}
              </div>

              <label className="ex-check">
                <input type="checkbox" checked={shuffleOn} onChange={(e) => setShuffleOn(e.target.checked)} />
                <span>
                  <b>Shuffle</b> questions and options
                </span>
              </label>
              <label className="ex-check">
                <input type="checkbox" checked={interviewMode} onChange={(e) => setInterviewMode(e.target.checked)} />
                <span>
                  <b>Interview mode</b>: lock each answer to get instant feedback and the interviewer&apos;s follow-ups (like a real
                  interview)
                </span>
              </label>
            </div>

            <div className="ex-setup-act">
              <button className="btn btn-holo btn-lg" type="button" onClick={start}>
                Start run · {minutes} min{' '}
                <span className="arr">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </button>
              <span className="mlabel">
                pass mark <b>{p.settings.passMark}%</b>
              </span>
            </div>
          </section>

          <aside className="panel ex-brief rise" style={cssVars({ '--i': 2 })} aria-label="Run summary">
            <div className="p-head">
              <span className="mlabel">{recordTopicId ? <b>Run #{runNo}</b> : <b>Drill</b>}</span>
              <span className="chip run">Queued</span>
            </div>
            <div className="ex-brief-read">
              <div className="readout">
                <span className="num">
                  {count}
                  <small>specs</small>
                </span>
              </div>
              <div className="readout">
                <span className="num">
                  {minutes}
                  <small>min</small>
                </span>
              </div>
            </div>
            <hr className="hair" />
            <div className="mlabel ex-sub-h">
              Difficulty mix · <b>{total} in the bank</b>
            </div>
            <div className="ex-dl">
              {mix.map(({ d, n }) => (
                <div key={d}>
                  <span className="nm">{d}</span>
                  <span className="v">{n}</span>
                  <div className="seg thin" style={cssVars({ '--n': total, '--v': n, '--gap': '1px', '--g': LEVEL_FILL[d] })} />
                </div>
              ))}
            </div>
            {history.length > 0 && (
              <>
                <hr className="hair" />
                <div className="mlabel ex-sub-h">Previous runs</div>
                <div className="ex-att">
                  {history.map((h, i) => {
                    const ok = h.score >= p.settings.passMark;
                    return (
                      <div key={h.at + i} className="at">
                        <span className="b">
                          <i className={ok ? '' : 'f'} style={{ width: `${h.score}%` }} />
                          <em style={{ left: `${p.settings.passMark}%` }} />
                        </span>
                        <span className={`v ${ok ? 't-pass' : 't-fail'}`}>{h.score}</span>
                        <span className="d">{dayLabel(h.at)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <hr className="hair" />
            <Keys lock />
          </aside>
        </div>
      </div>
    );
  }

  /* ===================== RUNNING ===================== */
  if (phase === 'running') {
    const item = items[cur];
    const selected = answers[item.q.id] ?? [];
    const multi = item.q.correct.length > 1;
    const answered = items.filter((it) => (answers[it.q.id] ?? []).length > 0).length;
    const urgent = remaining <= 60;
    const isLocked = interviewMode && locked.has(item.q.id);
    const gotIt = sameSet(selected, item.q.correct);
    const isFlagged = flagged.has(item.q.id);
    const m = meta[cur];
    const last = cur === items.length - 1;
    const rightPicks = selected.filter((x) => item.q.correct.includes(x)).length;
    const wrongPicks = selected.length - rightPicks;

    const statuses = items.map((it) => {
      const sel = answers[it.q.id] ?? [];
      if (interviewMode && locked.has(it.q.id)) return sameSet(sel, it.q.correct) ? 'pass' : 'fail';
      if (flagged.has(it.q.id)) return 'flag';
      if (sel.length) return 'ans';
      return 'q';
    });
    const nPass = statuses.filter((s) => s === 'pass').length;
    const nFail = statuses.filter((s) => s === 'fail').length;
    const nQueued = items.length - answered;

    // countdown bar: filled segments = time left (depletes towards END on the left)
    const segN = 36;
    const left = Math.max(0, remaining);
    const segV = (left / totalSecs) * segN;
    const budget = totalSecs / items.length;
    const times = items.map((_, i) => timeOn(i));
    const paceMax = Math.max(budget * 1.6, ...times, 1);
    const specsLeft = items.length - answered;
    const perLeft = specsLeft ? Math.round(left / specsLeft) : 0;
    const slot = typeof document !== 'undefined' ? document.getElementById('console-slot') : null;
    const cols = { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` };

    return (
      <div className="page ex ex-run">
        {slot &&
          createPortal(
            <span className={`ex-slot ${urgent ? 'urgent' : ''}`}>
              {recordTopicId ? `Run #${runNo}` : 'Drill'} · {formatClock(left)}
            </span>,
            slot,
          )}

        <div className={`ex-pin ${hudOut ? 'show' : ''} ${urgent ? 'urgent' : ''}`} aria-hidden={!hudOut}>
          <span className="mono">
            Q {two(cur + 1)}/{two(items.length)}
          </span>
          <div className="seg thin" style={cssVars({ '--n': segN, '--v': segV, '--gap': '2px' })} />
          <span className="numeral">{formatClock(left)}</span>
          <span className="mlabel">
            <b>{answered}</b>/{items.length}
          </span>
          <button className="btn btn-line btn-xs" type="button" tabIndex={hudOut ? 0 : -1} onClick={confirmSubmit}>
            Submit
          </button>
        </div>

        <div className="ex-bento">
          {/* ---------- HUD ---------- */}
          <section ref={hudRef} className={`panel flat ex-hud rise ${urgent ? 'urgent' : ''}`} style={cssVars({ '--i': 1 })} aria-label="Run status">
            <div className="hud-t">
              <PhaseLabel phaseNo={phaseNo} />
              <h1 className="h2 hud-title">{title}</h1>
              <div className="hud-run">
                <span className="mono">RUN · {items.length} SPECS</span>
                <span className="mlabel">pass {p.settings.passMark}%</span>
              </div>
            </div>
            <div
              className="hud-timer"
              role="timer"
              aria-label={`${Math.floor(left / 60)} minutes ${left % 60} seconds remaining of ${Math.round(totalSecs / 60)}`}
            >
              <div className={`numeral ${urgent ? 't-fail' : ''}`}>
                {formatClock(left)}
                <small>{urgent ? 'FINAL MINUTE' : 'REMAINING'}</small>
              </div>
              <div className="tl">
                <span className="mlabel">
                  Time left · <b>{Math.round(totalSecs / 60)} min</b>
                </span>
                <span className="mlabel nowrap">{formatClock(totalSecs - left)} used</span>
              </div>
              <div className="cd" aria-hidden="true">
                <div className="seg" style={cssVars({ '--n': segN, '--v': segV, '--gap': '3px' })} />
                <span className="now" style={{ left: `calc(${(left / totalSecs) * 100}% - 1px)` }} />
              </div>
              <div className="cd-ax" aria-hidden="true">
                <span>END 00:00</span>
                <span>{formatClock(totalSecs / 2)}</span>
                <span>{formatClock(totalSecs)} START</span>
              </div>
            </div>
            <div className="hud-r">
              {interviewMode && (
                <span className="imode">
                  <i />
                  Interview mode
                </span>
              )}
              <div className="cnts">
                <span>
                  <b>{answered}</b>/{items.length} answered
                </span>
                <span>
                  <b className="t-flaky">{flagged.size}</b> flagged
                </span>
              </div>
              <button className="btn btn-line btn-sm" type="button" onClick={confirmSubmit}>
                Submit run
              </button>
            </div>
          </section>

          {/* ---------- QUESTION (the one foil card) ---------- */}
          <section className="panel foil cut-lg ex-q" aria-labelledby="ex-q-t">
            <div className="q-top">
              <span className="q-no">
                Q {two(cur + 1)}
                <small>/{two(items.length)}</small>
              </span>
              <span className={`chip lvl lvl-${item.q.difficulty}`}>{item.q.difficulty}</span>
              {multi && <span className="chip flaky">Select all that apply</span>}
              {m.section >= 0 && (
                <span className="coord">
                  §{m.section + 1} {m.heading}
                  {isLocked ? ' · LOCKED' : ''}
                </span>
              )}
            </div>
            <div className="q-text" id="ex-q-t">
              <Markdown>{item.q.question}</Markdown>
            </div>
            {item.q.code && <CodeBlock snippet={item.q.code} />}
            <div className="opts" role="group" aria-label={multi ? 'Options (select all that apply)' : 'Options'}>
              {item.order.map((orig, di) => {
                const on = selected.includes(orig);
                const correct = item.q.correct.includes(orig);
                let cls = on ? 'sel' : '';
                let verdict = on ? 'selected' : '';
                if (isLocked) {
                  if (correct && on) [cls, verdict] = ['ok', '✓ your pick'];
                  else if (correct) [cls, verdict] = ['miss', 'missed'];
                  else if (on) [cls, verdict] = ['bad', '✗ wrong pick'];
                  else [cls, verdict] = ['dim', '—'];
                }
                const letter = LETTERS[di];
                return (
                  <button
                    key={orig}
                    type="button"
                    className={`opt ${cls} ${multi ? 'multi' : ''}`}
                    disabled={isLocked}
                    aria-pressed={on}
                    onClick={() => toggle(item, orig)}
                  >
                    <span className={`k ${cls === 'bad' ? 'glitch' : ''}`} data-text={letter}>
                      {letter}
                    </span>
                    <span className="t">
                      <Markdown>{item.q.options[orig]}</Markdown>
                    </span>
                    <span className="v">{verdict}</span>
                  </button>
                );
              })}
            </div>
            {isLocked && (
              <div className={`ex-fb ${gotIt ? 'ok' : 'bad'}`} role="status">
                <div className="h">
                  {gotIt ? (
                    <b>✓ Correct</b>
                  ) : (
                    <b className="glitch" data-text="✗ Not quite">
                      ✗ Not quite
                    </b>
                  )}
                  <span className={`chip ${gotIt ? 'pass' : 'fail'}`}>{gotIt ? 'Pass' : 'Fail'}</span>
                  <span className="mlabel">
                    {rightPicks} of {item.q.correct.length} right
                    {wrongPicks > 0 && ` · ${wrongPicks} wrong pick${wrongPicks === 1 ? '' : 's'}`}
                  </span>
                </div>
                <div className="explanation">
                  <Markdown>{item.q.explanation}</Markdown>
                </div>
              </div>
            )}
            <div className="q-act">
              <button className="btn btn-ghost btn-sm" type="button" disabled={cur === 0} onClick={() => go(cur - 1)}>
                ← Previous
              </button>
              <button
                className={`btn btn-sm btn-flag ${isFlagged ? 'on' : ''}`}
                type="button"
                aria-pressed={isFlagged}
                onClick={() => toggleFlag(item.q.id)}
              >
                {isFlagged ? '⚑ Flagged' : '⚐ Flag'} <kbd>F</kbd>
              </button>
              <span className="sp-x" />
              {interviewMode &&
                (isLocked ? (
                  <button className="btn btn-sm btn-locked" type="button" disabled>
                    <Check size={14} aria-hidden="true" /> Locked in
                  </button>
                ) : (
                  <button className="btn btn-line btn-sm" type="button" disabled={!selected.length} onClick={() => lockIn(item.q.id)}>
                    Lock in <kbd>L</kbd>
                  </button>
                ))}
              {last ? (
                <button className="btn btn-holo btn-sm" type="button" onClick={confirmSubmit}>
                  Finish run{' '}
                  <span className="arr">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </button>
              ) : (
                <button className="btn btn-holo btn-sm" type="button" onClick={() => go(cur + 1)}>
                  Next spec{' '}
                  <span className="arr">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>
          </section>

          {/* ---------- REPORTER NAVIGATOR ---------- */}
          <section className="panel ex-nav" aria-labelledby="ex-nv-t">
            <div className="nv-h">
              <div className="p-head">
                <span className="mlabel" id="ex-nv-t">
                  Reporter · <b>list</b>
                </span>
                <span className="mlabel">{items.length} specs</span>
              </div>
              <div className="nv-bar" aria-hidden="true" style={cols}>
                {statuses.map((s, i) => (
                  <i key={items[i].q.id} className={`${s} ${i === cur ? 'c' : ''}`} />
                ))}
              </div>
              <div className="nv-cnt">
                {interviewMode ? (
                  <>
                    <span>
                      <b className="t-pass">{nPass} passed</b>
                    </span>
                    <span>
                      <b className="t-fail">{nFail} failed</b>
                    </span>
                  </>
                ) : (
                  <span>
                    <b className="t-iris">{answered} answered</b>
                  </span>
                )}
                <span>
                  <b className="t-flaky">{flagged.size} flagged</b>
                </span>
                <span>{nQueued} queued</span>
              </div>
            </div>
            <ol className="specs" aria-label="Specs">
              {items.map((it, i) => {
                const s = statuses[i];
                const mark = s === 'pass' ? '✓' : s === 'fail' ? '✗' : s === 'flag' ? '⚑' : s === 'ans' ? '◆' : '·';
                const t = times[i];
                const mi = meta[i];
                return (
                  <li key={it.q.id}>
                    <button
                      type="button"
                      className={`srow ${s} ${i === cur ? 'cur' : ''}`}
                      aria-current={i === cur ? 'step' : undefined}
                      aria-label={`${specId(i)}: ${s === 'q' ? 'queued' : s === 'ans' ? 'answered' : s === 'flag' ? 'flagged' : s === 'pass' ? 'passed' : 'failed'}`}
                      onClick={() => go(i)}
                    >
                      <span className={`m ${s === 'fail' && i !== cur ? 'glitch' : ''}`} data-text={mark} aria-hidden="true">
                        {mark}
                      </span>
                      <span className="id">{specId(i)}</span>
                      <span className="tx">{plain(it.q.question)}</span>
                      <span className="tm">{t >= 1 ? mss(t) : '—'}</span>
                      <span className="sub">
                        {mi.section >= 0 ? `§${mi.section + 1} ${mi.heading} · ` : ''}
                        {it.q.difficulty}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <Keys lock={interviewMode} />
          </section>

          {/* ---------- FOLLOW-UP (interview mode) ---------- */}
          {interviewMode && (
            <section className="panel hov ex-fu" aria-label="Interviewer follow-up">
              <div className="p-head">
                <span className="mlabel">
                  Interviewer follow-up · <b>{item.q.followUps?.length ?? 0}</b>
                </span>
                <span className={`chip ${isLocked ? 'run' : 'skip'}`}>{isLocked ? 'Asked' : 'Waiting'}</span>
              </div>
              {isLocked ? (
                item.q.followUps?.length ? (
                  <FollowUps key={item.q.id} items={item.q.followUps} />
                ) : (
                  <p className="fu-a">No follow-up for this spec. The interviewer moves on.</p>
                )
              ) : (
                <p className="fu-a">Lock in your answer to see the verdict and hear what the interviewer asks next.</p>
              )}
              {isLocked && m.topic && m.section >= 0 && (
                <div className="fu-act">
                  <Link className="btn btn-line btn-sm" to={`/topic/${m.topic.id}?tab=learn&s=${m.section}`}>
                    Revise §{m.section + 1}
                  </Link>
                  <span className="mlabel">revealed on lock-in</span>
                </div>
              )}
            </section>
          )}

          {/* ---------- PACE ---------- */}
          <section className={`panel ex-pace ${interviewMode ? '' : 'wide'}`} aria-labelledby="ex-pc-t">
            <div className="p-head">
              <span className="mlabel" id="ex-pc-t">
                Pace · <b>sec per spec</b>
              </span>
              <span className="mlabel">budget {Math.round(budget)}s</span>
            </div>
            <div className="pace" style={cols} aria-hidden="true">
              <span className="bud" style={{ bottom: `${(budget / paceMax) * 100}%` }} data-l={`${Math.round(budget)}s / spec`} />
              {items.map((it, i) => {
                const s = statuses[i];
                const cls = i === cur ? 'c' : s === 'pass' ? 'p' : s === 'fail' ? 'f' : times[i] >= 1 ? 'a' : 'q';
                return <i key={it.q.id} className={cls} style={cls === 'q' ? undefined : { height: `${Math.max(3, (times[i] / paceMax) * 100)}%` }} />;
              })}
            </div>
            {items.length <= 24 && (
              <div className="pace-ax" style={cols} aria-hidden="true">
                {items.map((it, i) => (
                  <span key={it.q.id} className={i === cur ? 'c' : ''}>
                    {two(i + 1)}
                  </span>
                ))}
              </div>
            )}
            <div className="pace-f">
              <span>
                {specsLeft} spec{specsLeft === 1 ? '' : 's'} left · <b>{perLeft}s</b> each
              </span>
              <span className={specsLeft && perLeft < budget * 0.6 ? 't-flaky' : ''}>
                {specsLeft === 0 ? 'all answered' : perLeft >= budget * 0.6 ? 'on budget' : 'behind budget'}
              </span>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* ===================== RESULTS ===================== */
  const passed = score >= p.settings.passMark;
  const correctCount = items.filter((it) => sameSet(answers[it.q.id] ?? [], it.q.correct)).length;
  const full = !!recordTopicId && items.length === total;
  const missed = items.filter((it) => !sameSet(answers[it.q.id] ?? [], it.q.correct)).map((it) => it.q);
  const indexed = items.map((it, i) => ({ it, i }));
  const shown = indexed.filter(({ it }) => reviewFilter === 'all' || !sameSet(answers[it.q.id] ?? [], it.q.correct));
  const rec = recordTopicId ? p.tests[recordTopicId] : undefined;
  const history = rec?.history ?? [];
  const prev = full && history.length > 1 ? history[history.length - 2].score : undefined;
  const delta = prev === undefined ? undefined : score - prev;
  const attempts = full ? history.slice(-3) : [];
  const half = Math.ceil(items.length / 2);
  const cols = [indexed.slice(0, half), indexed.slice(half)];

  return (
    <div className="page ex ex-done">
      <Link to={backHref} className="ex-back mlabel">
        ← Back
      </Link>
      <div className="done-bar">
        <h1 className="h2">Run complete</h1>
        <span>
          {full ? `RUN #${runNo} · ` : ''}
          {formatClock(elapsed)}
        </span>
        <span className="sp-x" />
        <span className="tag">{recordTopicId ? `${recordTopicId} › exam` : 'mistakes › drill'}</span>
      </div>
      <div className="ruler" aria-hidden="true" />

      <div className="ex-bento">
        <section className={`panel cut-lg r-score rise ${passed ? 'is-pass' : 'is-fail'}`} style={cssVars({ '--i': 1 })} aria-labelledby="ex-sc-t">
          <div className="p-head">
            <span className="mlabel" id="ex-sc-t">
              Score · <b>{title}</b>
            </span>
            {full ? <span className="chip pass">Counts toward pass</span> : <span className="chip skip">Practice · not counted</span>}
          </div>
          <div className="big">
            <div className={`numeral ${passed ? 'holo-text' : 't-fail'}`}>
              {score}
              <small>%</small>
            </div>
            <div className={`stamp ${passed ? 'pass' : 'fail'}`}>
              <b>{passed ? 'PASS' : 'FAIL'}</b>
              <span>
                ≥ {p.settings.passMark}
                {full ? ` · RUN #${runNo}` : ''}
              </span>
            </div>
          </div>
          <div className="scale" style={cssVars({ '--v': score, '--m': p.settings.passMark, ...(passed ? {} : { '--g': 'var(--fail)' }) })}>
            <span className="tr" />
            <span className="fl" />
            <span className="ticks" />
            <span className="mk" data-l={`PASS ${p.settings.passMark}`} />
            <span className="nums">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </span>
          </div>
          <p className="lede">
            {passed ? (full ? 'You passed! This topic is green.' : 'Great practice run!') : 'So close! Review, then have another go.'}
            {!full && ' Practice runs never count towards passing.'}
          </p>
          <div className="r-meta">
            <div>
              <span className="mlabel">Correct</span>
              <b>
                {correctCount}
                <span className="ink3 of">/{items.length}</span>
              </b>
            </div>
            <div>
              <span className="mlabel">Time used</span>
              <b>{formatClock(elapsed)}</b>
            </div>
            <div>
              <span className="mlabel">vs last</span>
              <b className={delta === undefined ? 'ink3' : delta >= 0 ? 't-pass' : 't-fail'}>
                {delta === undefined ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}
              </b>
            </div>
          </div>
          {attempts.length > 0 && (
            <div className="ex-att">
              <div className="mlabel ex-att-h">
                <span>
                  Attempts · <b>{rec?.attempts ?? history.length}</b>
                </span>
                <span>best {rec?.best ?? score}</span>
              </div>
              {attempts.map((h, i) => {
                const ok = h.score >= p.settings.passMark;
                return (
                  <div key={h.at + i} className="at">
                    <span className="b">
                      <i className={ok ? '' : 'f'} style={{ width: `${h.score}%` }} />
                      <em style={{ left: `${p.settings.passMark}%` }} />
                    </span>
                    <span className={`v ${ok ? 't-pass' : 't-fail'}`}>{h.score}</span>
                    <span className="d">{i === attempts.length - 1 ? 'NOW' : dayLabel(h.at)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="r-act">
            {missed.length > 0 && (
              <Link className="btn btn-holo btn-sm" to={recordTopicId ? `/practice?topic=${recordTopicId}` : '/practice'}>
                Practise the {missed.length} I missed{' '}
                <span className="arr">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            )}
            <button className={`btn btn-sm ${missed.length ? 'btn-line' : 'btn-holo'}`} type="button" onClick={() => setPhase('setup')}>
              Retake
            </button>
            <Link className="btn btn-ghost btn-sm" to="/weak-areas">
              All weak areas →
            </Link>
          </div>
          {passed && full && <NextTopicLink topicId={recordTopicId} />}
        </section>

        <section className="panel r-sum rise" data-theme="dark" style={cssVars({ '--i': 2 })} aria-labelledby="ex-rs-t">
          <div className="rs-h">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="ttl" id="ex-rs-t">
              reporter — {recordTopicId ?? 'mistakes'} {recordTopicId ? 'exam' : 'drill'}
            </span>
            <span className={`chip ${passed ? 'pass' : 'fail'}`}>{passed ? 'Passed' : 'Failed'}</span>
          </div>
          <div className="rs-b runner">
            {cols.map((col, ci) => (
              <div key={ci}>
                {col.map(({ it, i }) => {
                  const sel = answers[it.q.id] ?? [];
                  const ok = sameSet(sel, it.q.correct);
                  const st = ok ? 'pass' : sel.length ? 'fail' : 'skip';
                  const t = timeOn(i);
                  return (
                    <div key={it.q.id} className={`rl ${st}`}>
                      <span className="m">{ok ? '✓' : sel.length ? '✗' : '–'}</span>
                      <span className="tx">
                        {specId(i)} › {ok ? <b>{plain(it.q.question)}</b> : plain(it.q.question)}
                      </span>
                      <span className="d">{t >= 1 ? mss(t) : '—'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="rs-f">
            <div className="rs-bar" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
              {items.map((it) => (
                <i key={it.q.id} className={sameSet(answers[it.q.id] ?? [], it.q.correct) ? '' : 'f'} />
              ))}
            </div>
            <div className="rs-txt">
              <span className="big-t t-pass">{correctCount} passed</span>
              <span>·</span>
              <span className="big-t t-fail">{items.length - correctCount} failed</span>
              <span className="rs-tot">
                {items.length} specs · {formatClock(elapsed)}
              </span>
            </div>
          </div>
        </section>

        <AttemptAnalysis items={items.map((it) => it.q)} missed={missed} />
        <DifficultyPanel items={items.map((it) => it.q)} missed={missed} />
      </div>

      <div className="ex-rev-h">
        <h2 className="h2">Let&apos;s review</h2>
        <div className="row gap-s">
          <button type="button" className={`chip ${reviewFilter === 'all' ? 'on' : ''}`} onClick={() => setReviewFilter('all')}>
            All ({items.length})
          </button>
          <button type="button" className={`chip ${reviewFilter === 'wrong' ? 'on' : ''}`} onClick={() => setReviewFilter('wrong')}>
            Wrong only ({items.length - correctCount})
          </button>
        </div>
      </div>
      <div className="ex-review">
        {shown.map(({ it, i }) => {
          const sel = answers[it.q.id] ?? [];
          const ok = sameSet(sel, it.q.correct);
          const mi = meta[i];
          return (
            <article key={it.q.id} className={`panel ex-rv ${ok ? 'ok' : 'bad'}`}>
              <div className="q-top">
                <span className="q-no sm">{specId(i)}</span>
                {ok ? (
                  <span className="chip pass">✓ Passed</span>
                ) : sel.length ? (
                  <span className="chip fail">✗ Failed</span>
                ) : (
                  <span className="chip skip">Unanswered</span>
                )}
                <span className={`chip lvl lvl-${it.q.difficulty}`}>{it.q.difficulty}</span>
                {mi.section >= 0 && (
                  <span className="coord">
                    §{mi.section + 1} {mi.heading}
                  </span>
                )}
              </div>
              <div className="q-text sm">
                <Markdown>{it.q.question}</Markdown>
              </div>
              {it.q.code && <CodeBlock snippet={it.q.code} compact />}
              <div className="opts">
                {it.order.map((orig, di) => {
                  const isC = it.q.correct.includes(orig);
                  const isS = sel.includes(orig);
                  const [cls, v] = isC && isS ? ['ok', '✓ your pick'] : isC ? ['miss', 'correct'] : isS ? ['bad', '✗ your pick'] : ['dim', ''];
                  return (
                    <div key={orig} className={`opt ${cls}`}>
                      <span className="k">{LETTERS[di]}</span>
                      <span className="t">
                        <Markdown>{it.q.options[orig]}</Markdown>
                      </span>
                      <span className="v">{v}</span>
                    </div>
                  );
                })}
              </div>
              <div className="explanation">
                <Markdown>{it.q.explanation}</Markdown>
              </div>
              <FollowUps items={it.q.followUps} startOpen={0} />
            </article>
          );
        })}
      </div>
    </div>
  );
}

/** Weak areas for one attempt: missed questions grouped by topic section. */
function AttemptAnalysis({ items, missed }: { items: MCQ[]; missed: MCQ[] }) {
  const byTopic = new Map<string, MCQ[]>();
  for (const q of missed) {
    const t = MCQ_TOPIC.get(q.id);
    if (t) byTopic.set(t.id, [...(byTopic.get(t.id) ?? []), q]);
  }
  const multiTopic = byTopic.size > 1;
  const specNo = new Map(items.map((q, i) => [q.id, specId(i)]));
  return (
    <section className="panel r-lost rise" style={cssVars({ '--i': 3 })} aria-labelledby="ex-lost-t">
      <div className="p-head">
        <h2 className="p-title" id="ex-lost-t">
          {missed.length ? 'Where the marks slipped' : 'Not a single weak spot this time!'}
        </h2>
      </div>
      {!missed.length && (
        <div className="runner ex-clear" data-theme="dark">
          <div className="rl pass">
            <span className="m">✓</span>
            <span className="tx">
              <b>
                {items.length} of {items.length} specs passed
              </b>{' '}
              · nothing to revise
            </span>
            <span className="d">0 failed</span>
          </div>
        </div>
      )}
      <div className="lost">
        {[...byTopic].map(([topicId, qs]) => {
          const topic = TOPIC_BY_ID.get(topicId)!;
          const inTopic = items.filter((q) => MCQ_TOPIC.get(q.id)?.id === topicId);
          return (
            <div key={topicId} className="lost-topic">
              {multiTopic && <div className="mlabel lost-t">{topic.title}</div>}
              {weakSections(topic, qs).map((ws) => {
                const inSection = inTopic.filter((q) => sectionForQuestion(topic, q) === ws.index).length || ws.missed.length;
                return (
                  <div key={ws.index} className="lr">
                    <span className="no">§{ws.index + 1}</span>
                    <span className="nm">{ws.heading}</span>
                    <Link to={`/topic/${topic.id}?tab=learn&s=${ws.index}`} className="btn btn-line btn-sm">
                      Revise
                    </Link>
                    <span className="sub">
                      {ws.missed.map((q) => specNo.get(q.id)).join(', ')} · {ws.missed.length} of {inSection} missed
                    </span>
                    <div className="seg thin" style={cssVars({ '--n': inSection, '--v': ws.missed.length, '--g': 'var(--fail)' })} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {missed.length > 0 && (
        <p className="tip">
          Missed specs go to <Link to="/weak-areas">Weak areas</Link> and come back in your next practice drill. Sections are matched
          automatically from each question&apos;s wording; the review below has the exact reasoning.
        </p>
      )}
    </section>
  );
}

/** Accuracy per difficulty level for one attempt. */
function DifficultyPanel({ items, missed }: { items: MCQ[]; missed: MCQ[] }) {
  const missedIds = new Set(missed.map((q) => q.id));
  const rows = LEVELS.map((d) => {
    const qs = items.filter((q) => q.difficulty === d);
    const ok = qs.filter((q) => !missedIds.has(q.id)).length;
    return { d, n: qs.length, ok, rate: qs.length ? Math.round((ok / qs.length) * 100) : 0 };
  }).filter((r) => r.n);
  const low = rows.filter((r) => r.rate < 60);
  return (
    <section className="panel hov r-diff rise" style={cssVars({ '--i': 4 })} aria-labelledby="ex-df-t">
      <div className="p-head">
        <span className="mlabel" id="ex-df-t">
          By difficulty
        </span>
        <span className="mlabel">{items.length} specs</span>
      </div>
      <div className="ex-dl">
        {rows.map((r) => (
          <div key={r.d} className={r.rate < 60 ? 'low' : ''}>
            <span className="nm">{r.d}</span>
            <span className="v">
              {r.ok}/{r.n}
              <small>{r.rate}%</small>
            </span>
            <div className="seg" style={cssVars({ '--n': r.n, '--v': r.ok, '--g': LEVEL_FILL[r.d] })} />
          </div>
        ))}
      </div>
      <p className="note">
        {low.length ? (
          <>
            Below 60% on <b>{low.map((r) => r.d).join(', ')}</b>: worth a second read before moving on.
          </>
        ) : (
          'Every difficulty level at 60% or better.'
        )}
      </p>
    </section>
  );
}

/** After a passing exam: one obvious way forward. */
function NextTopicLink({ topicId }: { topicId?: string }) {
  const idx = TOPICS.findIndex((t) => t.id === topicId);
  const next = TOPICS[idx + 1];
  return (
    <div className="ex-next">
      <span className="mlabel">Topic done · next up</span>
      <Link className="btn btn-line btn-sm" to={next ? `/topic/${next.id}` : '/coding'}>
        {next ? next.title : 'Practise JS coding problems'} <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
