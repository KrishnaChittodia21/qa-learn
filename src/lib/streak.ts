// Study streak: consecutive local days with any recorded study activity.
import { localDay } from './progress';

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Days in a row ending today (or yesterday, so the streak isn't "lost" before
 * the learner has had a chance to study today).
 */
export function studyStreak(days: string[] = [], now = new Date()): number {
  const set = new Set(days);
  let cursor = set.has(localDay(now)) ? now : addDays(now, -1);
  let n = 0;
  while (set.has(localDay(cursor))) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/** The last 7 days, oldest first, with whether each had activity. */
export function lastSevenDays(days: string[] = [], now = new Date()) {
  const set = new Set(days);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, i - 6);
    return { day: localDay(d), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), active: set.has(localDay(d)), today: i === 6 };
  });
}
