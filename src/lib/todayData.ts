// Today screen: pure derivations over Progress + content (no React, no storage).
// Everything the Today instruments show (coverage prism, journey pipeline, runner log, skill radar,
// 30-day signal) is computed here from what src/lib/progress.ts really records.
import type { PhaseId, Topic } from '../types';
import type { Phase } from '../content/phases';
import { localDay, type Progress } from './progress';
import { weakTopics } from './weak';

const passedTopic = (p: Progress, id: string) => !!p.tests[id]?.passedAt;

// ---------- coverage prism: 4 tracks, bottom → top ----------
export type SpectrumHue = 'lime' | 'mint' | 'cyan' | 'iris';

export interface Track {
  code: string;
  name: string;
  /** short name for phones */
  short: string;
  hue: SpectrumHue;
  phases: PhaseId[];
  done: number;
  total: number;
}

const TRACK_DEFS: Omit<Track, 'done' | 'total'>[] = [
  { code: 'T1', name: 'Manual & API', short: 'Manual & API', hue: 'lime', phases: ['manual-basics', 'manual-advanced', 'api-sql'] },
  { code: 'T2', name: 'JavaScript', short: 'JavaScript', hue: 'mint', phases: ['javascript'] },
  { code: 'T3', name: 'Playwright', short: 'Playwright', hue: 'cyan', phases: ['pw-basics', 'pw-framework'] },
  { code: 'T4', name: 'AI & Interview', short: 'AI & Int.', hue: 'iris', phases: ['ai-testing', 'interview'] },
];

/** passed topics per track (a topic counts once its full exam is passed) */
export function trackCoverage(p: Progress, topics: Topic[]): Track[] {
  return TRACK_DEFS.map((d) => {
    const ts = topics.filter((t) => d.phases.includes(t.phase));
    return { ...d, done: ts.filter((t) => passedTopic(p, t.id)).length, total: ts.length };
  });
}

// ---------- journey pipeline: one stage per phase ----------
export type StageState = 'pass' | 'flaky' | 'fail' | 'now' | 'queued';

export interface Stage {
  phase: Phase;
  state: StageState;
  passed: number;
  total: number;
  /** attempted but not passed yet */
  failing: number;
}

/**
 * pass = every topic passed · now = the phase holding the next step · behind the current phase:
 * fail = an attempted exam is still below the pass mark, flaky = some topics not passed yet ·
 * after it: queued.
 */
export function pipelineStages(p: Progress, topics: Topic[], phases: Phase[], current?: Topic): Stage[] {
  const curIdx = current ? phases.findIndex((ph) => ph.id === current.phase) : -1;
  return phases
    .map((phase, i) => {
      const ts = topics.filter((t) => t.phase === phase.id);
      const passed = ts.filter((t) => passedTopic(p, t.id)).length;
      const failing = ts.filter((t) => p.tests[t.id]?.attempts && !passedTopic(p, t.id)).length;
      let state: StageState;
      if (ts.length && passed === ts.length) state = 'pass';
      else if (i === curIdx) state = 'now';
      else if (curIdx >= 0 && i > curIdx) state = 'queued';
      else if (curIdx < 0 && passed === 0 && failing === 0) state = 'queued';
      else state = failing ? 'fail' : 'flaky';
      return { phase, state, passed, total: ts.length, failing };
    })
    .filter((s) => s.total > 0);
}

// ---------- runner log ----------
export type RunKind = 'pass' | 'fail' | 'flaky' | 'skip' | 'run';

export interface RunLine {
  key: string;
  kind: RunKind;
  /** spec id, e.g. "sql-joins-validation" or "pwlab @step3" */
  spec: string;
  /** the bold part after › */
  what: string;
  /** trailing plain text */
  extra?: string;
  /** right column: relative time, duration or a status word */
  d: string;
  /** ms since epoch, for ordering (lines without one go after the timed ones) */
  at?: number;
}

/** subset of public/judge-results.json the Today screen reads (written by `npm run judge`) */
export interface JudgeStep {
  id: string;
  title: string;
  status: 'no-tests' | 'fails-on-correct' | 'flaky' | 'error' | 'scored';
  mutantsCaught: number;
  mutantsTotal: number;
  durationMs: number;
}
export interface JudgeSummary {
  generatedAt: string;
  overall: { mutantsCaught: number; mutantsTotal: number };
  steps: Record<string, JudgeStep>;
}

export function relTime(ms: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return 'now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 60 ? `${d}d ago` : `${Math.round(d / 30)}mo ago`;
}

export interface ExamEvent {
  topic: Topic;
  at: number;
  score: number;
  kind: 'pass' | 'fail' | 'flaky';
  /** failed attempts before this pass (flaky = passed on retry) */
  retry: number;
}

/** every saved full-exam attempt as a check: pass, fail, or flaky (first pass after failed attempts) */
export function examEvents(p: Progress, topics: Topic[]): ExamEvent[] {
  const mark = p.settings.passMark;
  const out: ExamEvent[] = [];
  for (const t of topics) {
    let fails = 0;
    let passedBefore = false;
    for (const h of p.tests[t.id]?.history ?? []) {
      const ok = h.score >= mark;
      const at = Date.parse(h.at) || 0;
      if (!ok) {
        fails++;
        out.push({ topic: t, at, score: h.score, kind: 'fail', retry: 0 });
      } else {
        out.push({ topic: t, at, score: h.score, kind: !passedBefore && fails > 0 ? 'flaky' : 'pass', retry: fails });
        passedBefore = true;
      }
    }
  }
  return out.sort((a, b) => b.at - a.at);
}

export function judgeLines(judge: JudgeSummary | null): RunLine[] {
  if (!judge) return [];
  const at = Date.parse(judge.generatedAt) || 0;
  return Object.values(judge.steps)
    .filter((s) => s && s.status !== 'no-tests')
    .map((s) => {
      const caught = `${s.mutantsCaught}/${s.mutantsTotal} bugs caught`;
      const kind: RunKind =
        s.status === 'flaky' ? 'flaky' : s.status !== 'scored' ? 'fail' : s.mutantsCaught > 0 ? 'pass' : 'fail';
      const extra =
        s.status === 'flaky'
          ? 'flaky tests'
          : s.status === 'fails-on-correct'
            ? 'tests fail on the correct app'
            : s.status === 'error'
              ? 'test run error'
              : caught;
      return { key: `pw-${s.id}`, kind, spec: `pwlab @${s.id}`, what: s.title, extra, d: `${(s.durationMs / 1000).toFixed(1)}s`, at };
    });
}

// ---------- skill radar: 6 axes, share of exam questions currently answered correctly ----------
export interface SkillAxis {
  label: string;
  value: number;
  correct: number;
  questions: number;
}

const AXES: { label: string; phases: PhaseId[] }[] = [
  { label: 'Test design', phases: ['manual-basics', 'manual-advanced'] },
  { label: 'API & SQL', phases: ['api-sql'] },
  { label: 'JavaScript', phases: ['javascript'] },
  { label: 'Playwright', phases: ['pw-basics'] },
  { label: 'CI & debugging', phases: ['pw-framework'] },
  { label: 'AI & interview', phases: ['ai-testing', 'interview'] },
];

export function skillAxes(p: Progress, topics: Topic[]): SkillAxis[] {
  return AXES.map((a) => {
    const qs = topics.filter((t) => a.phases.includes(t.phase)).flatMap((t) => t.test);
    const correct = qs.filter((q) => p.mcq[q.id]?.lastCorrect).length;
    return { label: a.label, correct, questions: qs.length, value: qs.length ? Math.round((correct / qs.length) * 100) : 0 };
  });
}

// ---------- 30-day signal ----------
export interface SignalDay {
  day: string;
  /** 0 = no study that day, else a 6–100 bar height (more recorded answers / exams = taller) */
  h: number;
}

export function activitySignal(p: Progress, n = 30, now = new Date()): SignalDay[] {
  const active = new Set(p.activityDays ?? []);
  const events = new Map<string, number>();
  const bump = (iso?: string) => {
    if (!iso) return;
    const d = localDay(new Date(iso));
    events.set(d, (events.get(d) ?? 0) + 1);
  };
  Object.values(p.mcq).forEach((r) => bump(r.lastAt));
  Object.values(p.tests).forEach((r) => r.history?.forEach((h) => bump(h.at)));
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i));
    const day = localDay(d);
    return { day, h: active.has(day) ? Math.min(100, 30 + (events.get(day) ?? 0) * 7) : 0 };
  });
}

// ---------- the single weakest spot ----------
export function weakestSpot(p: Progress, topics: Topic[]) {
  const w = weakTopics(p, topics)[0];
  if (!w) return null;
  const mark = p.settings.passMark;
  const fails = (p.tests[w.topic.id]?.history ?? []).filter((h) => h.score < mark).length;
  return { ...w, fails };
}

/** "Locators: Finding Elements the Way Users Do" → head "Locators", sub "Finding Elements the Way Users Do" */
export function splitTitle(title: string): { head: string; sub?: string } {
  const i = title.indexOf(': ');
  if (i > 0 && i < 40) return { head: title.slice(0, i), sub: title.slice(i + 2) };
  return { head: title };
}
