// Progress changes as data (src/lib/progress-ops.ts): the rules the app and qa-api both apply, and the first-login
// import that must never trust the browser with an exam pass. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';
import type { Progress } from '../src/lib/progress';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const O = await load<typeof import('../src/lib/progress-ops')>('/src/lib/progress-ops.ts');
const ix = O.buildContentIndex(C.TOPICS, C.CODING_PROBLEMS.map((q) => q.id), C.COMPANY_QUESTIONS.map((q) => q.id));
const fresh = (): Progress => structuredClone(O.DEFAULT_PROGRESS);
const DAY = '2026-10-31';
const NOW = '2026-10-31T10:00:00.000Z';
const [t] = C.TOPICS;
const apply = (p: Progress, ops: Parameters<typeof O.applyOps>[1]) => O.applyOps(p, ops, ix, DAY, NOW);

test('study changes apply and record the day once; settings and reset are not study', () => {
  const { progress, skipped } = apply(fresh(), [
    { op: 'section', topicId: t.id, index: 1, read: true },
    { op: 'section', topicId: t.id, index: 0, read: true },
    { op: 'flag', bucket: 'cc', id: t.codeChallenges[0].id, on: true },
    { op: 'rate', id: t.interviewQuestions[0].id, rating: 'partial' },
    { op: 'draft', id: `iq:${t.interviewQuestions[0].id}`, text: 'my answer' },
  ]);
  assert.deepEqual(skipped, []);
  assert.deepEqual(progress.sections[t.id], [0, 1]);
  assert.equal(progress.cc[t.codeChallenges[0].id], true);
  assert.equal(progress.iq[t.interviewQuestions[0].id], 'partial');
  assert.equal(progress.drafts[`iq:${t.interviewQuestions[0].id}`], 'my answer');
  assert.deepEqual(progress.activityDays, [DAY]);
  assert.deepEqual(apply(fresh(), [{ op: 'settings', settings: { theme: 'dark' } }]).progress.activityDays, []);
});

test('unknown content is skipped with a reason, the rest of the batch still applies', () => {
  const { progress, skipped } = apply(fresh(), [
    { op: 'section', topicId: 'no-such-topic', index: 0, read: true },
    { op: 'section', topicId: t.id, index: 999, read: true },
    { op: 'flag', bucket: 'code', id: 'no-such-problem', on: true },
    { op: 'draft', id: 'evil:anything', text: 'x' },
    { op: 'sectionsAll', topicId: t.id },
  ]);
  assert.deepEqual(skipped.map((s) => s.index), [0, 1, 2, 3]);
  assert.equal(progress.sections[t.id].length, t.sections.length);
  assert.equal(progress.sections['no-such-topic'], undefined);
});

test('an exam result keeps the best score and stamps the first pass once', () => {
  let p = apply(fresh(), [{ op: 'test', topicId: t.id, score: 50 }]).progress;
  assert.equal(p.tests[t.id].passedAt, undefined);
  p = apply(p, [{ op: 'test', topicId: t.id, score: 90 }]).progress;
  p = O.applyOps(p, [{ op: 'test', topicId: t.id, score: 60 }], ix, DAY, '2026-11-01T00:00:00.000Z').progress;
  assert.deepEqual([p.tests[t.id].best, p.tests[t.id].last, p.tests[t.id].attempts, p.tests[t.id].passedAt], [90, 60, 3, NOW]);
});

test('an empty draft is removed; drafts are capped', () => {
  const key = `code:${C.CODING_PROBLEMS[0].id}`;
  let p = apply(fresh(), [{ op: 'draft', id: key, text: 'x' }]).progress;
  p = apply(p, [{ op: 'draft', id: key, text: '' }]).progress;
  assert.equal(p.drafts[key], undefined);
  const big = 'y'.repeat(O.DRAFTS_MAX_CHARS);
  assert.deepEqual(apply(fresh(), [{ op: 'draft', id: key, text: big }, { op: 'draft', id: `cc:${t.codeChallenges[0].id}`, text: 'z' }]).skipped, [{ index: 1, reason: 'drafts full' }]);
});

test('reset clears study progress but keeps settings and earned badges', () => {
  const p = { ...fresh(), settings: { ...fresh().settings, passMark: 85 }, achievements: { 'hello-tester': { tier: 'standard' as const, earnedAt: 1 } } };
  const after = apply(apply(p, [{ op: 'sectionsAll', topicId: t.id }]).progress, [{ op: 'reset' }]).progress;
  assert.deepEqual(after.sections, {});
  assert.equal(after.settings.passMark, 85);
  assert.deepEqual(after.achievements, p.achievements);
});

test('activity days stay sorted, unique and capped', () => {
  const days = Array.from({ length: O.ACTIVITY_DAYS_MAX }, (_, i) => new Date(Date.UTC(2025, 0, 1) + i * 86_400_000).toISOString().slice(0, 10));
  const p = apply({ ...fresh(), activityDays: days }, [{ op: 'sectionsAll', topicId: t.id }]).progress;
  assert.equal(p.activityDays!.length, O.ACTIVITY_DAYS_MAX);
  assert.equal(p.activityDays!.at(-1), DAY);
});

test('import never takes an exam pass or a badge from the browser', () => {
  const local = {
    tests: { [t.id]: { best: 100, last: 100, attempts: 1, passedAt: NOW, history: [{ at: NOW, score: 100 }] } },
    achievements: { 'release-candidate': { tier: 'diamond', earnedAt: 1 } },
  };
  const merged = O.mergeImport(fresh(), local, ix);
  assert.equal(merged.tests[t.id].best, 100, 'the score is kept for Weak areas and history');
  assert.equal(merged.tests[t.id].passedAt, undefined, 'but not the pass');
  assert.deepEqual(merged.achievements, {});
});

test('import keeps only real, well-formed items and the furthest-along copy', () => {
  const server = apply(fresh(), [{ op: 'section', topicId: t.id, index: 2, read: true }, { op: 'rate', id: t.interviewQuestions[0].id, rating: 'nailed' }]).progress;
  const local = {
    sections: { [t.id]: [0, 2, -1, 9999, 'x'], 'fake-topic': [0] },
    iq: { [t.interviewQuestions[0].id]: 'missed', 'fake-iq': 'nailed' },
    cc: { [t.codeChallenges[0].id]: true, 'fake-cc': true },
    mcq: { [t.test[0].id]: { seen: 3, wrong: 1, lastCorrect: true, lastAt: NOW }, [t.test[1].id]: { seen: 1, wrong: 5, lastCorrect: true, lastAt: NOW } },
    drafts: { [`iq:${t.interviewQuestions[1].id}`]: 'kept', 'iq:fake': 'dropped' },
    activityDays: ['2026-10-01', 'not-a-day', 42],
    settings: { passMark: 80, theme: 'neon' },
  };
  const m = O.mergeImport(server, local, ix);
  assert.deepEqual(m.sections, { [t.id]: [0, 2] });
  assert.equal(m.iq[t.interviewQuestions[0].id], 'nailed', "the account's own rating wins");
  assert.deepEqual(Object.keys(m.cc), [t.codeChallenges[0].id]);
  assert.deepEqual(Object.keys(m.mcq), [t.test[0].id], 'more wrong than seen is junk');
  assert.deepEqual(Object.keys(m.drafts), [`iq:${t.interviewQuestions[1].id}`]);
  assert.deepEqual(m.activityDays, ['2026-10-01', DAY]);
  assert.equal(m.settings.passMark, 80);
  assert.equal(m.settings.theme, 'system');
  // an account that already chose its settings keeps them
  const chosen = { ...server, settings: { ...server.settings, passMark: 60 } };
  assert.equal(O.mergeImport(chosen, local, ix).settings.passMark, 60);
});

test('importing junk changes nothing', () => {
  for (const junk of [null, 42, 'x', [], { tests: 'x', sections: [1], mcq: null }]) {
    assert.deepEqual(O.mergeImport(fresh(), junk, ix), fresh());
  }
});
