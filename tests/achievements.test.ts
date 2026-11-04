// Badges (src/content/achievements.ts): sound for every learner. Nothing for a new learner, every badge for one who
// finished the course, tiers that only go up, and the "struggle" badges earned only by struggling. M5 moves this
// evaluation to the service, so these tests are what it must keep passing. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load, freshProgress } from './helpers.ts';
import type { Progress } from '../src/lib/progress';

const A = await load<typeof import('../src/content/achievements')>('/src/content/achievements.ts');
const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const SH = await load<typeof import('../src/content/shorts')>('/src/content/shorts.ts');
const LAB = (await load<typeof import('../src/content/pwlab')>('/src/content/pwlab.ts')).PW_LAB_STEPS.map((s) => s.id);
const ctx = A.buildAchievementContext({ topics: C.TOPICS, phases: C.PHASES, coding: C.CODING_PROBLEMS, companyQuestions: C.COMPANY_QUESTIONS, pwlabSteps: LAB });
const { p: empty } = await freshProgress();
const fresh = (): Progress => structuredClone(empty);
const day = (i: number) => new Date(Date.UTC(2026, 0, 1) + i * 86_400_000).toISOString().slice(0, 10);

// earned by failing, retrying or studying at night, so a perfect learner doesn't get them
const STRUGGLE_BADGES = ['regression-ranger', 'midnight-deploy', 'flaky-fixer'];

/** every piece of content done, every exam passed first time at 100% at midday, 400 days in a row */
function finished(): Progress {
  const p = fresh();
  for (const t of C.TOPICS) {
    p.sections[t.id] = t.sections.map((_, i) => i);
    p.tests[t.id] = { best: 100, last: 100, attempts: 1, passedAt: '2026-02-01', history: [{ at: '2026-02-01T12:00:00Z', score: 100 }] };
    for (const c of t.codeChallenges) p.cc[c.id] = true;
    for (const q of t.interviewQuestions) p.iq[q.id] = 'nailed';
    for (const q of t.envelopeQuestions) p.boe[q.id] = true;
    for (const q of t.test) p.mcq[q.id] = { seen: 1, wrong: 0, lastCorrect: true, lastAt: '2026-02-01T12:00:00Z' };
  }
  for (const q of C.CODING_PROBLEMS) p.code[q.id] = true;
  for (const q of C.COMPANY_QUESTIONS) p.company[q.id] = true;
  p.activityDays = Array.from({ length: 400 }, (_, i) => day(i));
  // one Short a day for a week (the Shorts streak's top tier is 7)
  p.shorts = Object.fromEntries(SH.SHORTS_DATA.slice(0, 7).map((s, i) => [s.id, { watchedAt: `${day(i)}T12:00:00Z`, day: day(i) }]));
  p.pwlab = Object.fromEntries(LAB.map((id) => [id, true as const]));
  p.walksDone = 1;
  p.saved = C.CODING_PROBLEMS.slice(0, 25).map((q) => ({ kind: 'coding', ref: q.id, addedAt: '2026-02-01', doneAt: '2026-02-02' }));
  return p;
}

const topTier = (a: (typeof A.ACHIEVEMENTS)[number]) => a.tiers?.at(-1)?.tier ?? 'standard';

test('every badge has a unique id, a known group, words to show and tiers in rising order', () => {
  const groups = new Set(A.GROUPS.map((g) => g.id));
  assert.equal(new Set(A.ACHIEVEMENTS.map((a) => a.id)).size, A.ACHIEVEMENTS.length);
  for (const a of A.ACHIEVEMENTS) {
    assert.ok(groups.has(a.group), `${a.id}: unknown group ${a.group}`);
    assert.ok(a.name && a.description && a.art && a.unit, `${a.id}: missing text`);
    assert.ok(!!a.tiers !== (a.goal !== undefined), `${a.id}: needs tiers or a goal, not both`);
    const goals = (a.tiers ?? []).map((t) => (typeof t.goal === 'function' ? t.goal(ctx) : t.goal));
    goals.forEach((g, i) => assert.ok(i === 0 || g > goals[i - 1], `${a.id}: tier goals must rise`));
    // a short ladder may skip a tier (bronze → gold), but never goes down
    const ranks = (a.tiers ?? []).map((t) => A.tierRank(t.tier));
    ranks.forEach((r, i) => assert.ok(i === 0 || r > ranks[i - 1], `${a.id}: tiers out of order`));
  }
});

test('every phase has a graduate badge and every phase badge is a real phase', () => {
  const phaseBadges = A.ACHIEVEMENTS.filter((a) => a.id.startsWith('phase-')).map((a) => a.id.slice('phase-'.length));
  assert.deepEqual(phaseBadges.sort(), C.PHASES.map((ph) => ph.id).sort());
});

test('a new learner has earned nothing and every locked badge says what to do', () => {
  const ev = A.evaluateAll(fresh(), ctx);
  for (const a of A.ACHIEVEMENTS) {
    assert.equal(ev[a.id].tier, null, `${a.id} earned with no progress`);
    assert.ok(ev[a.id].requirement.length > 5, `${a.id}: no requirement text`);
  }
  assert.deepEqual(A.newlyEarned(ev, {}), []);
});

test('a learner who finished the course reaches the top tier of every badge except the struggle ones', () => {
  const ev = A.evaluateAll(finished(), ctx);
  for (const a of A.ACHIEVEMENTS) {
    if (STRUGGLE_BADGES.includes(a.id)) assert.equal(ev[a.id].tier, null, `${a.id} earned without struggling`);
    else assert.equal(ev[a.id].tier, topTier(a), `${a.id} stopped at ${ev[a.id].tier}`);
  }
});

test('struggle badges: failing twice before a pass, fixing a missed question, studying at night', () => {
  const p = finished();
  const t = C.TOPICS[0];
  p.tests[t.id] = {
    best: 90,
    last: 90,
    attempts: 3,
    passedAt: '2026-02-03T10:00:00.000Z',
    history: [
      { at: '2026-02-01T10:00:00.000Z', score: 40 },
      { at: '2026-02-02T10:00:00.000Z', score: 60 },
      { at: '2026-02-03T10:00:01.000Z', score: 90 },
    ],
  };
  const q = t.test[0];
  p.mcq[q.id] = { seen: 2, wrong: 1, lastCorrect: true, lastAt: new Date(2026, 1, 3, 1, 30).toISOString() }; // 01:30 local
  const ev = A.evaluateAll(p, ctx);
  assert.equal(ev['flaky-fixer'].tier, 'standard');
  assert.equal(ev['midnight-deploy'].tier, 'standard');
  assert.equal(ev['regression-ranger'].value, 1);
});

test("the night-owl badge reads the learner's time zone when one is given (the service runs on UTC)", () => {
  const p = fresh();
  // 20:30 UTC: 02:00 the next morning in India, 20:30 in London (winter)
  p.mcq[C.TOPICS[0].test[0].id] = { seen: 1, wrong: 0, lastCorrect: true, lastAt: '2026-01-15T20:30:00.000Z' };
  assert.equal(A.evaluateAll(p, { ...ctx, timeZone: 'Asia/Kolkata' })['midnight-deploy'].tier, 'standard');
  assert.equal(A.evaluateAll(p, { ...ctx, timeZone: 'Europe/London' })['midnight-deploy'].tier, null);
});

test('the first-time-pass badge does not count a pass after a fail', () => {
  const p = fresh();
  const [a, b] = C.TOPICS;
  p.tests[a.id] = { best: 100, last: 100, attempts: 1, passedAt: '2026-02-01T10:00:00.000Z', history: [{ at: '2026-02-01T10:00:01.000Z', score: 100 }] };
  p.tests[b.id] = {
    best: 100,
    last: 100,
    attempts: 2,
    passedAt: '2026-02-02T10:00:00.000Z',
    history: [
      { at: '2026-02-01T10:00:00.000Z', score: 30 },
      { at: '2026-02-02T10:00:01.000Z', score: 100 },
    ],
  };
  assert.equal(A.evaluateAll(p, ctx)['first-pass-yield'].value, 1);
});

test('stored tiers are never re-awarded, downgraded or lost when progress shrinks', () => {
  const full = A.evaluateAll(finished(), ctx);
  const stored = A.mergeEarned({}, A.newlyEarned(full, {}), 1000);
  assert.deepEqual(A.newlyEarned(full, stored), [], 'nothing new on the second check');
  // progress reset: evaluations drop to nothing, but nothing earned is taken away
  const afterReset = A.mergeEarned(stored, A.newlyEarned(A.evaluateAll(fresh(), ctx), stored), 2000);
  assert.deepEqual(afterReset, stored);
});

test('climbing a tier records when each tier was first reached', () => {
  const p = fresh();
  const t = C.TOPICS[0];
  p.sections[t.id] = [0];
  let stored = A.mergeEarned({}, A.newlyEarned(A.evaluateAll(p, ctx), {}), 1000);
  assert.equal(stored['hello-tester']?.tier, 'standard');
  stored = A.mergeEarned(stored, A.newlyEarned(A.evaluateAll(finished(), ctx), stored), 2000);
  const spec = stored['spec-reader'];
  assert.equal(spec.tier, 'diamond');
  assert.equal(spec.earnedAt, 2000);
  assert.deepEqual(Object.keys(spec.tiers!).sort(), ['bronze', 'diamond', 'gold', 'silver']);
  assert.equal(stored['hello-tester'].earnedAt, 1000, 'an earlier badge keeps its date');
});

test('earned list ignores unknown ids and lists the newest first', () => {
  const list = A.earnedList({
    'hello-tester': { tier: 'standard', earnedAt: 1 },
    'spec-reader': { tier: 'bronze', earnedAt: 5 },
    'removed-badge': { tier: 'gold', earnedAt: 9 },
  });
  assert.deepEqual(list.map((e) => e.id), ['spec-reader', 'hello-tester']);
});

test('Full Spectrum needs one solved problem per difficulty; Backlog Burner counts only saved items marked done', () => {
  const p = fresh();
  const byDiff = (d: string) => C.CODING_PROBLEMS.find((q) => q.difficulty === d)!.id;
  p.code[byDiff('easy')] = true;
  p.code[C.CODING_PROBLEMS.filter((q) => q.difficulty === 'easy')[1].id] = true;
  p.code[byDiff('medium')] = true;
  assert.equal(A.evaluateAll(p, ctx)['full-spectrum'].tier, null, 'two difficulties is not enough');
  p.code[byDiff('hard')] = true;
  assert.equal(A.evaluateAll(p, ctx)['full-spectrum'].tier, 'standard');

  p.saved = [
    { kind: 'coding', ref: byDiff('easy'), addedAt: '2026-02-01' },
    { kind: 'coding', ref: byDiff('medium'), addedAt: '2026-02-01', doneAt: '2026-02-03' },
  ];
  const ev = A.evaluateAll(p, ctx)['backlog-burner'];
  assert.equal(ev.value, 1, 'a saved item not marked done does not count');
  assert.equal(ev.tier, 'bronze');
});

test('Shorts badges: the first watched Short, and a run of days with one watched', () => {
  const p = fresh();
  const [a, b, c] = SH.SHORTS_DATA.map((s) => s.id);
  p.shorts = { [a]: { quiz: 'first' } };
  assert.equal(A.evaluateAll(p, ctx)['opening-scene'].tier, null, 'answering the quiz is not watching to the end');
  p.shorts = { [a]: { watchedAt: '2026-03-01T10:00:00Z', day: '2026-03-01' }, [b]: { watchedAt: '2026-03-02T10:00:00Z', day: '2026-03-02' } };
  const ev = A.evaluateAll(p, ctx);
  assert.equal(ev['opening-scene'].tier, 'standard');
  assert.equal(ev['daily-short'].value, 2);
  p.shorts[c] = { watchedAt: '2026-03-03T10:00:00Z', day: '2026-03-03' };
  assert.equal(A.evaluateAll(p, ctx)['daily-short'].tier, 'bronze');
});

test('Bug Squasher counts Lab steps with every bug caught; Shown Around needs a walkthrough followed to Done', () => {
  const p = fresh();
  p.pwlab = { [LAB[0]]: true, 'no-such-step': true };
  let ev = A.evaluateAll(p, ctx);
  assert.equal(ev['bug-squasher'].value, 1, 'unknown step ids are ignored');
  assert.equal(ev['bug-squasher'].tier, 'bronze');
  assert.equal(ev['shown-around'].tier, null);
  p.walksDone = 1;
  ev = A.evaluateAll(p, ctx);
  assert.equal(ev['shown-around'].tier, 'standard');
});
