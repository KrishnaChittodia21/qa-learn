// Study plan maths (pure): covered minutes, the pacer, behind/ahead, catch-up advice and the projected date of every
// phase. Days are local YYYY-MM-DD strings, so they compare as strings. Adapted from system-design-learn's lib/pace.ts.
import type { Phase } from '../content/phases';
import type { Topic as TopicLike } from '../types';
import { localDay, type Progress, type StudyPlan } from './progress';
import { topicCompletion } from './stats';

export const DAILY_MIN = 15;
export const DAILY_MAX = 180;
export const DAYS_PER_WEEK = [3, 4, 5, 6, 7];
/** a gap smaller than this is "on pace" */
const BEHIND_MIN = 15;
const CATCH_UP_DAYS = 14;
/** stop walking the calendar after ~10 years (only reachable with absurd inputs) */
const MAX_WALK = 3650;
// study days run Monday onwards: 5 days a week = Mon–Fri
const STUDY_DOW = [1, 2, 3, 4, 5, 6, 0];

export function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: string, n: number): string {
  const d = parseDay(day);
  d.setDate(d.getDate() + n);
  return localDay(d);
}

export function isStudyDay(day: string, daysPerWeek: number): boolean {
  return STUDY_DOW.slice(0, daysPerWeek).includes(parseDay(day).getDay());
}

/** study days in [from, to) */
export function studyDaysBetween(from: string, to: string, daysPerWeek: number): number {
  let n = 0;
  for (let d = from, i = 0; d < to && i < MAX_WALK; d = addDays(d, 1), i++) if (isStudyDay(d, daysPerWeek)) n++;
  return n;
}

/** planned minutes on a day, including any catch-up minutes */
function minutesOn(plan: StudyPlan, day: string, withCatchUp = true): number {
  if (!isStudyDay(day, plan.daysPerWeek)) return 0;
  const extra = withCatchUp && plan.catchUp && day <= plan.catchUp.until ? plan.catchUp.extraMinutes : 0;
  return plan.dailyMinutes + extra;
}

/** the day on which `need` more minutes are done, studying from `from` (inclusive) */
function dayAfter(plan: StudyPlan, from: string, need: number, withCatchUp = true): string {
  let left = need;
  let d = from;
  for (let i = 0; i < MAX_WALK; i++, d = addDays(d, 1)) {
    left -= minutesOn(plan, d, withCatchUp);
    if (left <= 0) return d;
  }
  return d;
}

// ---- the course as a line of stops (one per phase), in study order ----

export interface Stop {
  id: string;
  number: number;
  title: string;
  /** cumulative minutes at the start and end of the phase */
  start: number;
  end: number;
}

export interface Course {
  stops: Stop[];
  total: number;
  /** cumulative minutes at the end of each topic */
  topicEnd: Map<string, number>;
}

/** short stop names for the map and the Today card (the full phase titles are too long to sit on a line) */
const SHORT: Record<string, string> = {
  'manual-basics': 'Manual basics',
  'manual-advanced': 'Test design',
  'api-sql': 'API & SQL',
  javascript: 'JavaScript',
  'pw-basics': 'Playwright',
  'pw-framework': 'Framework & CI',
  'ai-testing': 'AI testing',
  interview: 'Interview',
};
export const stopName = (s: Stop) => SHORT[s.id] ?? s.title;

export function courseLine(topics: TopicLike[], phases: Phase[]): Course {
  const topicEnd = new Map<string, number>();
  let sum = 0;
  for (const t of topics) topicEnd.set(t.id, (sum += t.estimatedMinutes));
  let at = 0;
  const stops = phases
    .map((ph) => {
      const mins = topics.filter((t) => t.phase === ph.id).reduce((a, t) => a + t.estimatedMinutes, 0);
      const stop = { id: ph.id, number: ph.number, title: ph.title, start: at, end: at + mins };
      at += mins;
      return stop;
    })
    .filter((s) => s.end > s.start);
  return { stops, total: sum, topicEnd };
}

/** study time already covered: each topic's minutes × its completion (sections, practice and exam) */
export function coveredMinutes(p: Progress, topics: TopicLike[]): number {
  return Math.round(topics.reduce((a, t) => a + (t.estimatedMinutes * topicCompletion(p, t)) / 100, 0));
}

export interface GoalTarget {
  /** study minutes in the goal */
  minutes: number;
  /** of those, still to do */
  remaining: number;
  label: string;
  /** index of the stop the goal ends in */
  stop: number;
  /** the goal as its own line: one stop per phase with something picked, measured in goal minutes */
  stops: Stop[];
  /** minutes still to do in each of those stops */
  stopRemaining: number[];
}

/** A goal is 'all' or a comma-separated list of 'phase:<id>', 'topic:<id>' and 'section:<topic id>:<index>'.
 *  An old single-value goal is a list of one. */
export function parseGoal(goal: string): string[] {
  const parts = goal.split(',').map((x) => x.trim()).filter(Boolean);
  return parts.length && !parts.includes('all') ? parts : ['all'];
}
export const joinGoal = (parts: string[]) => (parts.length ? parts.join(',') : 'all');

/** Only the picked items count: each topic once, either whole (picked itself or through its phase) or just the picked sections. */
export function goalTarget(goal: string, course: Course, topics: TopicLike[], p: Progress): GoalTarget {
  const parts = parseGoal(goal);
  const isAll = parts[0] === 'all';
  const whole = new Set<string>(isAll ? topics.map((t) => t.id) : []);
  const secs = new Map<string, Set<number>>();
  const labels: string[] = [];
  for (const part of parts) {
    const [kind, id, idx] = part.split(':');
    const t = topics.find((x) => x.id === id);
    if (kind === 'phase') {
      const stop = course.stops.find((x) => x.id === id);
      if (!stop) continue;
      topics.filter((x) => x.phase === id).forEach((x) => whole.add(x.id));
      labels.push(`Finish phase ${stop.number}: ${stop.title}`);
    } else if (kind === 'topic' && t) {
      whole.add(t.id);
      labels.push(`Cover ${t.title}`);
    } else if (kind === 'section' && t && t.sections[Number(idx)]) {
      if (!secs.has(t.id)) secs.set(t.id, new Set());
      secs.get(t.id)!.add(Number(idx));
      labels.push(`Read ${t.sections[Number(idx)].heading}`);
    }
  }
  // minutes in the goal and still to do, per phase (course order)
  const per = new Map<string, { m: number; r: number }>();
  for (const t of topics) {
    const picked = secs.get(t.id);
    if (!whole.has(t.id) && !picked) continue;
    const acc = per.get(t.phase) ?? { m: 0, r: 0 };
    if (whole.has(t.id)) {
      acc.m += t.estimatedMinutes;
      acc.r += t.estimatedMinutes * (1 - topicCompletion(p, t) / 100);
    } else {
      // a section's share of the topic, done once it is marked read
      const share = t.estimatedMinutes / Math.max(1, t.sections.length);
      const read = new Set(p.sections[t.id] ?? []);
      acc.m += share * picked!.size;
      acc.r += share * [...picked!].filter((i) => !read.has(i)).length;
    }
    per.set(t.phase, acc);
  }
  if (!per.size) return goalTarget('all', course, topics, p);
  let at = 0;
  const stops: Stop[] = [];
  const stopRemaining: number[] = [];
  for (const st of course.stops) {
    const x = per.get(st.id);
    if (!x) continue;
    stops.push({ ...st, start: at, end: at + x.m });
    stopRemaining.push(Math.round(x.r));
    at += x.m;
  }
  const minutes = at;
  const remaining = stopRemaining.reduce((a, x) => a + x, 0);
  const stop = Math.max(0, course.stops.findIndex((x) => x.id === stops[stops.length - 1].id));
  if (isAll) return { minutes: Math.round(minutes), remaining, label: 'Finish the whole course', stop, stops, stopRemaining };
  const nSec = [...secs.values()].reduce((a, x) => a + x.size, 0);
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const label =
    labels.length === 1 ? labels[0] : `Cover ${[whole.size && plural(whole.size, 'topic'), nSec && plural(nSec, 'section')].filter(Boolean).join(' and ')}`;
  return { minutes: Math.round(minutes), remaining, label, stop, stops, stopRemaining };
}

// ---- the pace ----

export type PaceState = 'behind' | 'on' | 'ahead' | 'done';

export interface Pace {
  covered: number;
  /** where the plan says you'd be by the start of today (the pacer) */
  expected: number;
  /** expected − covered, in minutes (negative = ahead) */
  gap: number;
  state: PaceState;
  goal: GoalTarget;
  /** projected finish from your real position (with any catch-up minutes) */
  finish: string | null;
  /** study days later than the pacer's finish, if you keep the base pace */
  extraDays: number;
  /** that later finish */
  slowFinish: string | null;
  /** suggested extra minutes a day for the next two weeks */
  catchUpPerDay: number;
  /** last study day before today (activity days now; the server's lastActiveAt once there is a backend) */
  lastActive?: string;
  /** study days missed since the last study day (counted from the baseline at the earliest) */
  missedDays: number;
  todayMinutes: number;
  /** the goal's own path: its stops, its length, where you and the pacer are on it (goal minutes), and the date each
   *  stop is reached studying the picks in course order (null once that stop is covered) */
  line: { stops: Stop[]; total: number; you: number; pacer: number; dates: (string | null)[] };
}

export function computePace(plan: StudyPlan, covered: number, course: Course, topics: TopicLike[], p: Progress, today = localDay()): Pace {
  const activityDays = p.activityDays ?? [];
  const goal = goalTarget(plan.goal, course, topics, p);
  const planned = studyDaysBetween(plan.baselineAt, today, plan.daysPerWeek) * plan.dailyMinutes;
  const expected = Math.min(course.total, plan.baselineCovered + planned);
  const gap = Math.round(expected - covered);
  const done = goal.remaining <= 0;
  const state: PaceState = done ? 'done' : gap >= BEHIND_MIN ? 'behind' : -gap >= plan.dailyMinutes ? 'ahead' : 'on';

  // the pacer is `gap` minutes ahead of you (or level), whatever the goal
  const finish = done ? null : dayAfter(plan, today, goal.remaining);
  const pacerFinish = done ? null : dayAfter(plan, today, Math.max(1, goal.remaining - Math.max(0, gap)), false);
  const slowFinish = done ? null : dayAfter(plan, today, goal.remaining, false);
  const extraDays = slowFinish && pacerFinish && slowFinish > pacerFinish ? studyDaysBetween(pacerFinish, slowFinish, plan.daysPerWeek) : 0;

  const window = Math.max(1, studyDaysBetween(today, addDays(today, CATCH_UP_DAYS), plan.daysPerWeek));
  const catchUpPerDay = gap > 0 ? Math.min(DAILY_MAX - plan.dailyMinutes, Math.max(5, Math.ceil(gap / window / 5) * 5)) : 0;

  const lastActive = [...activityDays].reverse().find((d) => d < today);
  const missedFrom = lastActive && addDays(lastActive, 1) > plan.baselineAt ? addDays(lastActive, 1) : plan.baselineAt;
  const missedDays = state !== 'behind' ? 0 : studyDaysBetween(missedFrom, today, plan.daysPerWeek);

  return {
    covered,
    expected,
    gap,
    state,
    goal,
    finish,
    extraDays,
    slowFinish,
    catchUpPerDay: Math.max(0, catchUpPerDay),
    lastActive,
    missedDays,
    todayMinutes: minutesOn(plan, today),
    line: goalLine(plan, goal, gap, today),
  };
}

function goalLine(plan: StudyPlan, goal: GoalTarget, gap: number, today: string): Pace['line'] {
  const total = Math.max(1, goal.minutes);
  const you = Math.max(0, goal.minutes - goal.remaining);
  let left = 0;
  const dates = goal.stopRemaining.map((r) => {
    left += r;
    return r <= 0 ? null : dayAfter(plan, today, left);
  });
  return { stops: goal.stops, total, you, pacer: Math.max(0, Math.min(total, you + gap)), dates };
}

export function newPlan(covered: number, today = localDay()): StudyPlan {
  return { dailyMinutes: 45, daysPerWeek: 5, goal: 'all', startedAt: today, baselineAt: today, baselineCovered: covered };
}

/** pace changed: the pacer keeps its position (so any gap stays) and runs at the new pace from today */
export function repace(plan: StudyPlan, expected: number, today = localDay()): StudyPlan {
  return { ...plan, baselineAt: today, baselineCovered: expected };
}

/** finish date moved (or plan started): the pacer restarts from today at your real position, so old misses stop counting */
export function rebase(plan: StudyPlan, covered: number, today = localDay()): StudyPlan {
  return { ...plan, baselineAt: today, baselineCovered: covered, catchUp: undefined };
}

export function withCatchUp(plan: StudyPlan, extraMinutes: number, today = localDay()): StudyPlan {
  return { ...plan, catchUp: { extraMinutes, until: addDays(today, CATCH_UP_DAYS - 1) } };
}

/** "2 h 15 m", "40 m" */
export function hm(mins: number): string {
  const m = Math.round(Math.abs(mins));
  const h = Math.floor(m / 60);
  return h ? `${h} h${m % 60 ? ` ${m % 60} m` : ''}` : `${m} m`;
}

export function fmtDay(day: string, year = false): string {
  return parseDay(day).toLocaleDateString('en-GB', year ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' });
}
