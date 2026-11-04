// Plan your journey (src/lib/pace.ts): the course line, and the pacer's verdict as days pass. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load, freshProgress } from './helpers.ts';

const P = await load<typeof import('../src/lib/pace')>('/src/lib/pace.ts');
const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const course = P.courseLine(C.TOPICS, C.PHASES);
const { p: empty } = await freshProgress();
const MONDAY = '2026-11-02';

test('the course line has one stop per phase, end to end', () => {
  assert.equal(course.total, C.TOPICS.reduce((a, t) => a + t.estimatedMinutes, 0));
  assert.equal(course.stops.length, C.PHASES.length);
  assert.equal(course.stops[0].start, 0);
  assert.equal(course.stops.at(-1)!.end, course.total);
  for (const s of course.stops) assert.ok(P.stopName(s).length <= 16, `short name for ${s.id}`);
});

test('a new plan is on pace; missed study days put you behind with catch-up advice; more minutes finish sooner', () => {
  const plan = P.newPlan(0, MONDAY);
  const start = P.computePace(plan, 0, course, C.TOPICS, empty, MONDAY);
  assert.equal(start.state, 'on');
  assert.ok(start.finish && start.finish > MONDAY);

  // a week later, nothing studied
  const later = P.computePace(plan, 0, course, C.TOPICS, empty, P.addDays(MONDAY, 7));
  assert.equal(later.state, 'behind');
  assert.ok(later.gap > 0 && later.catchUpPerDay > 0);

  const faster = P.computePace({ ...plan, dailyMinutes: plan.dailyMinutes * 2 }, 0, course, C.TOPICS, empty, MONDAY);
  assert.ok(faster.finish! < start.finish!, 'twice the minutes, an earlier finish');
});
