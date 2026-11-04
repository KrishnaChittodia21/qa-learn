// Progress changes as data (src/lib/progress-ops.ts): the rules for Save for later, Shorts and step lessons. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';
import type { Progress } from '../src/lib/progress';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const O = await load<typeof import('../src/lib/progress-ops')>('/src/lib/progress-ops.ts');
const { PW_LAB_STEPS } = await load<typeof import('../src/content/pwlab')>('/src/content/pwlab.ts');
const { SHORTS_DATA } = await load<typeof import('../src/content/shorts')>('/src/content/shorts.ts');
const ix = O.buildContentIndex(C.TOPICS, C.CODING_PROBLEMS.map((q) => q.id), C.COMPANY_QUESTIONS.map((q) => q.id), PW_LAB_STEPS.map((s) => s.id), SHORTS_DATA.map((s) => s.id));
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

test('saved items: real content only, no duplicates, done and back again, not study, kept by reset', () => {
  const section = `${t.id}:1`;
  let r = apply(fresh(), [
    { op: 'saved', action: 'add', kind: 'section', ref: section },
    { op: 'saved', action: 'add', kind: 'section', ref: section },
    { op: 'saved', action: 'add', kind: 'pwlab', ref: PW_LAB_STEPS[0].id },
    { op: 'saved', action: 'add', kind: 'coding', ref: C.CODING_PROBLEMS[0].id },
    { op: 'saved', action: 'add', kind: 'section', ref: `${t.id}:1.5` },
    { op: 'saved', action: 'add', kind: 'interview', ref: 'no-such-question' },
    { op: 'saved', action: 'done', kind: 'topic', ref: t.id },
  ]);
  assert.deepEqual(r.progress.saved!.map((s) => s.kind), ['section', 'pwlab', 'coding']);
  assert.deepEqual(r.skipped.map((s) => s.reason), ['unknown item', 'unknown item', 'not saved']);
  assert.deepEqual(r.progress.activityDays, [], 'saving is not studying');
  r = apply(r.progress, [{ op: 'saved', action: 'done', kind: 'section', ref: section }]);
  assert.equal(r.progress.saved![0].doneAt, NOW);
  // saving a done item again puts it back at the end of the list, not done
  r = O.applyOps(r.progress, [{ op: 'saved', action: 'add', kind: 'section', ref: section }], ix, DAY, '2026-11-01T00:00:00.000Z');
  assert.deepEqual([r.progress.saved!.at(-1)!.ref, r.progress.saved!.at(-1)!.doneAt], [section, undefined]);
  r = apply(r.progress, [{ op: 'saved', action: 'remove', kind: 'pwlab', ref: PW_LAB_STEPS[0].id }, { op: 'reset' }]);
  assert.equal(r.progress.saved!.length, 2, 'reset clears progress, not bookmarks');
});

test('the saved list is capped', () => {
  const ids = C.TOPICS.flatMap((x) => x.sections.map((_, i) => `${x.id}:${i}`));
  const full = { ...fresh(), saved: Array.from({ length: O.SAVED_MAX }, (_, i) => ({ kind: 'section' as const, ref: ids[i % ids.length] + `-${i}`, addedAt: NOW })) };
  assert.deepEqual(apply(full, [{ op: 'saved', action: 'add', kind: 'topic', ref: t.id }]).skipped, [{ index: 0, reason: 'saved list full' }]);
});

test('Shorts: the first watch (with its day) and the first quiz result are kept; unknown Shorts are refused', () => {
  const id = SHORTS_DATA[0].id;
  let { progress, skipped } = apply(fresh(), [
    { op: 'short', id, event: 'quiz-retry' },
    { op: 'short', id, event: 'quiz-first' },
    { op: 'short', id, event: 'watched' },
    { op: 'short', id: 'no-such-short', event: 'watched' },
  ]);
  assert.deepEqual(skipped, [{ index: 3, reason: 'unknown short' }]);
  assert.deepEqual(progress.shorts?.[id], { quiz: 'retry', watchedAt: NOW, day: DAY });
  assert.ok(progress.activityDays?.includes(DAY), 'watching a Short counts as study');
  ({ progress } = O.applyOps(progress, [{ op: 'short', id, event: 'watched' }], ix, '2026-11-02', '2026-11-02T09:00:00.000Z'));
  assert.equal(progress.shorts?.[id]?.day, DAY, 'a re-watch keeps the first day');

  const saved = apply(fresh(), [{ op: 'saved', action: 'add', kind: 'short', ref: id }, { op: 'saved', action: 'add', kind: 'short', ref: 'nope' }]);
  assert.equal(saved.progress.saved?.length, 1);

});
