// Dashboard metrics: pure functions over Progress + content, used by the Home charts.
import type { CodingProblem, Difficulty, Topic } from '../types';
import type { Phase } from '../content/phases';
import { localDay, type Progress } from './progress';
import { topicCompletion, topicStatus } from './stats';
import { accuracyBreakdown, weakTopics, type TopicWeakness } from './weak';

export interface StatusCounts {
  passed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

/** topics by state: exam passed / touched but not passed / untouched */
export function statusCounts(p: Progress, topics: Topic[]): StatusCounts {
  const c = { passed: 0, inProgress: 0, notStarted: 0, total: topics.length };
  for (const t of topics) {
    const s = topicStatus(p, t);
    if (s === 'passed') c.passed++;
    else if (s === 'in-progress') c.inProgress++;
    else c.notStarted++;
  }
  return c;
}

export interface PhaseProgress {
  id: string;
  number: number;
  title: string;
  /** average topic completion, 0–100 */
  pct: number;
  passed: number;
  total: number;
}

/** completion per phase, in course order; phases without topics are skipped */
export function phaseProgress(p: Progress, topics: Topic[], phases: Phase[]): PhaseProgress[] {
  return phases
    .map((ph) => {
      const ts = topics.filter((t) => t.phase === ph.id);
      const pct = ts.length ? Math.round(ts.reduce((a, t) => a + topicCompletion(p, t), 0) / ts.length) : 0;
      const passed = ts.filter((t) => topicStatus(p, t) === 'passed').length;
      return { id: ph.id, number: ph.number, title: ph.title, pct, passed, total: ts.length };
    })
    .filter((x) => x.total > 0);
}

export interface ExamScore {
  topic: Topic;
  best: number;
  last: number;
  attempts: number;
  passed: boolean;
}

/** every topic with at least one full-length exam attempt, in course order */
export function examScores(p: Progress, topics: Topic[]): ExamScore[] {
  return topics
    .filter((t) => p.tests[t.id]?.attempts)
    .map((t) => {
      const r = p.tests[t.id];
      return { topic: t, best: r.best, last: r.last, attempts: r.attempts, passed: !!r.passedAt };
    });
}

export interface ExamAttempt {
  at: string;
  score: number;
  topic: Topic;
}

/** full-length exam attempts across all topics, oldest first (only attempts saved with a timestamp) */
export function examTimeline(p: Progress, topics: Topic[], limit = 20): ExamAttempt[] {
  const out: ExamAttempt[] = [];
  for (const t of topics) for (const h of p.tests[t.id]?.history ?? []) out.push({ at: h.at, score: h.score, topic: t });
  return out.sort((a, b) => a.at.localeCompare(b.at)).slice(-limit);
}

export interface Ratio {
  done: number;
  total: number;
}

export interface Kpis {
  examsPassed: Ratio;
  readiness: number;
  /** mean best score over attempted topics; null before the first exam */
  avgBest: number | null;
  /** share of attempted exam questions whose latest answer is correct; null before any answer */
  mcqAccuracy: number | null;
  mcqSeen: number;
  interview: Ratio;
}

export function kpis(p: Progress, topics: Topic[]): Kpis {
  const scores = examScores(p, topics);
  const { byDifficulty } = accuracyBreakdown(p, topics);
  const all = Object.values(byDifficulty).reduce((a, x) => ({ seen: a.seen + x.seen, correct: a.correct + x.correct }), { seen: 0, correct: 0 });
  const iqIds = new Set(topics.flatMap((t) => t.interviewQuestions.map((q) => q.id)));
  return {
    examsPassed: { done: scores.filter((s) => s.passed).length, total: topics.length },
    readiness: topics.length ? Math.round(topics.reduce((a, t) => a + topicCompletion(p, t), 0) / topics.length) : 0,
    avgBest: scores.length ? Math.round(scores.reduce((a, s) => a + s.best, 0) / scores.length) : null,
    mcqAccuracy: all.seen ? Math.round((all.correct / all.seen) * 100) : null,
    mcqSeen: all.seen,
    interview: { done: Object.keys(p.iq).filter((id) => iqIds.has(id)).length, total: iqIds.size },
  };
}

export interface DifficultyAccuracy {
  level: Difficulty;
  seen: number;
  correct: number;
  pct: number;
}

/** accuracy per difficulty level, only levels with at least one answered question */
export function difficultyAccuracy(p: Progress, topics: Topic[]): DifficultyAccuracy[] {
  const { byDifficulty } = accuracyBreakdown(p, topics);
  return (['easy', 'medium', 'hard', 'expert'] as Difficulty[])
    .map((level) => ({ level, ...byDifficulty[level], pct: byDifficulty[level].seen ? Math.round((byDifficulty[level].correct / byDifficulty[level].seen) * 100) : 0 }))
    .filter((x) => x.seen > 0);
}

export interface RatingCounts {
  nailed: number;
  partial: number;
  missed: number;
  total: number;
}

/** self-ratings of interview answers for questions that still exist in the course */
export function ratingCounts(p: Progress, topics: Topic[]): RatingCounts {
  const c = { nailed: 0, partial: 0, missed: 0, total: 0 };
  for (const t of topics)
    for (const q of t.interviewQuestions) {
      const r = p.iq[q.id];
      if (!r) continue;
      c[r]++;
      c.total++;
    }
  return c;
}

export interface DayCell {
  day: string;
  active: boolean;
  today: boolean;
  /** after today: drawn empty, not focusable */
  future: boolean;
}

/** the last `weeks` calendar weeks (Monday-first columns, oldest first), ending with the week that holds `now` */
export function activityWeeks(days: string[] = [], now = new Date(), weeks = 12): DayCell[][] {
  const set = new Set(days);
  const today = localDay(now);
  const mondayOffset = (now.getDay() + 6) % 7;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset - (weeks - 1) * 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      const day = localDay(date);
      return { day, active: set.has(day), today: day === today, future: day > today };
    }),
  );
}

/** number of distinct study days within the last `n` days, today included */
export function activeInLast(days: string[] = [], n: number, now = new Date()): number {
  const set = new Set(days);
  let c = 0;
  for (let i = 0; i < n; i++) if (set.has(localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)))) c++;
  return c;
}

export const CODING_CATEGORY_LABEL: Record<CodingProblem['category'], string> = {
  arrays: 'Arrays',
  strings: 'Strings',
  objects: 'Objects',
  logic: 'Logic',
  async: 'Async',
  'qa-utils': 'QA utilities',
};

export interface CategoryProgress {
  id: CodingProblem['category'];
  label: string;
  solved: number;
  total: number;
}

/** solved coding problems per category, in a fixed category order */
export function codingByCategory(p: Progress, problems: CodingProblem[]): CategoryProgress[] {
  return (Object.keys(CODING_CATEGORY_LABEL) as CodingProblem['category'][])
    .map((id) => {
      const qs = problems.filter((q) => q.category === id);
      return { id, label: CODING_CATEGORY_LABEL[id], solved: qs.filter((q) => p.code[q.id]).length, total: qs.length };
    })
    .filter((c) => c.total > 0);
}

/** count of flags in `bucket` whose id is in `ids` */
export function flagged(bucket: Record<string, true>, ids: string[]): Ratio {
  return { done: ids.filter((id) => bucket[id]).length, total: ids.length };
}

/** weak topics for the dashboard chart: most questions currently wrong first, ties in weak.ts order */
export function weakForChart(p: Progress, topics: Topic[], limit = 6): TopicWeakness[] {
  return weakTopics(p, topics)
    .map((w, i) => ({ w, i }))
    .sort((a, b) => b.w.wrong.length - a.w.wrong.length || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.w);
}
