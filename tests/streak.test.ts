// Study streaks: the current streak on Home (src/lib/streak.ts) and the longest streak the badges use
// (longestStreak in src/content/achievements.ts). Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load, stubStorage } from './helpers.ts';

stubStorage();
const { studyStreak, lastSevenDays } = await load<typeof import('../src/lib/streak')>('/src/lib/streak.ts');
const { localDay } = await load<typeof import('../src/lib/progress')>('/src/lib/progress.ts');
const { longestStreak } = await load<typeof import('../src/content/achievements')>('/src/content/achievements.ts');

// noon local time, so the days around it are the same in every time zone
const now = new Date(2026, 9, 15, 12);
const ago = (n: number) => localDay(new Date(2026, 9, 15 - n, 12));

test('no study days means no streak', () => {
  assert.equal(studyStreak([], now), 0);
  assert.equal(studyStreak(undefined, now), 0);
});

test('counts consecutive days ending today', () => {
  assert.equal(studyStreak([ago(2), ago(1), ago(0)], now), 3);
});

test('a streak ending yesterday is kept until today is over', () => {
  assert.equal(studyStreak([ago(3), ago(2), ago(1)], now), 3);
});

test('a missed day breaks the streak', () => {
  assert.equal(studyStreak([ago(5), ago(4), ago(2)], now), 0);
  assert.equal(studyStreak([ago(5), ago(4), ago(1), ago(0)], now), 2);
});

test('the streak runs across month ends', () => {
  const nov2 = new Date(2026, 10, 2, 12);
  const days = [new Date(2026, 9, 30, 12), new Date(2026, 9, 31, 12), new Date(2026, 10, 1, 12), nov2].map((d) => localDay(d));
  assert.equal(studyStreak(days, nov2), 4);
});

test('the week strip has 7 days, oldest first, with today last', () => {
  const week = lastSevenDays([ago(0), ago(3)], now);
  assert.equal(week.length, 7);
  assert.deepEqual(week.map((d) => d.day), [6, 5, 4, 3, 2, 1, 0].map(ago));
  assert.deepEqual(week.map((d) => d.active), [false, false, false, true, false, false, true]);
  assert.deepEqual(week.map((d) => d.today), [false, false, false, false, false, false, true]);
});

test('the longest streak ignores order, duplicates and junk', () => {
  assert.equal(longestStreak([]), 0);
  assert.equal(longestStreak(['2026-01-03', '2026-01-01', '2026-01-02', '2026-01-02', 'nonsense']), 3);
  assert.equal(longestStreak(['2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']), 4);
});

test('the longest streak crosses a daylight-saving change', () => {
  // Europe and the US change clocks in late March and early November
  const days = ['2026-03-28', '2026-03-29', '2026-03-30', '2026-10-31', '2026-11-01', '2026-11-02'];
  assert.equal(longestStreak(days), 3);
});
