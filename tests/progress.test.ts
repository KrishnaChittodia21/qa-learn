// The local progress store (src/lib/progress.ts): loading old or broken saves, and the rules every study action
// follows. M2 replaces storage with the synced store, so these rules are what that store must keep. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load, stubStorage, freshProgress } from './helpers.ts';
import type { Progress } from '../src/lib/progress';

const KEY = 'qa-learn-progress-v1';
const loadWith = async (saved: string) => {
  const store = stubStorage(saved);
  return { store, mod: await load<typeof import('../src/lib/progress')>('/src/lib/progress.ts') };
};

test('a first visit starts from empty progress with default settings', async () => {
  const { p } = await freshProgress();
  assert.deepEqual(p.tests, {});
  assert.deepEqual(p.sections, {});
  assert.deepEqual(p.activityDays, []);
  assert.deepEqual(p.settings, { passMark: 70, secondsPerQuestion: 90, shuffle: true, theme: 'system', studyLock: 'exam', accent: 'indigo' });
});

test('an old save keeps its data and gains settings and fields added since', async () => {
  const { mod } = await loadWith(JSON.stringify({ sections: { 'mt-fundamentals': [0, 2] }, settings: { passMark: 80 } }));
  const p = mod.getProgress();
  assert.deepEqual(p.sections, { 'mt-fundamentals': [0, 2] });
  assert.equal(p.settings.passMark, 80);
  assert.equal(p.settings.accent, 'indigo');
  assert.deepEqual(p.code, {});
  assert.deepEqual(p.achievements, {});
});

test('a corrupt save falls back to defaults instead of crashing', async () => {
  const { mod } = await loadWith('{not json');
  assert.deepEqual(mod.getProgress().tests, {});
});

test('changes are written to storage under the progress key', async () => {
  const { store, mod } = await loadWith(JSON.stringify({}));
  mod.toggleSectionRead('mt-fundamentals', 1);
  assert.deepEqual((JSON.parse(store.get(KEY)!) as Progress).sections, { 'mt-fundamentals': [1] });
});

test('an exam keeps the best score, counts attempts, stamps the first pass once and keeps 10 attempts', async () => {
  const { mod } = await freshProgress();
  mod.recordTest('t', 50);
  let rec = mod.getProgress().tests.t;
  assert.equal(rec.passedAt, undefined);
  mod.recordTest('t', 90);
  rec = mod.getProgress().tests.t;
  const firstPass = rec.passedAt;
  assert.ok(firstPass);
  mod.recordTest('t', 60);
  rec = mod.getProgress().tests.t;
  assert.deepEqual([rec.best, rec.last, rec.attempts, rec.passedAt], [90, 60, 3, firstPass]);
  assert.ok(mod.isPassed(mod.getProgress(), 't'), 'a later fail does not un-pass a topic');
  for (let i = 0; i < 12; i++) mod.recordTest('t', i);
  rec = mod.getProgress().tests.t;
  assert.equal(rec.attempts, 15);
  assert.equal(rec.history!.length, 10);
  assert.equal(rec.history!.at(-1)!.score, 11);
});

test('the pass mark comes from settings', async () => {
  const { mod } = await freshProgress();
  mod.setSettings({ passMark: 95 });
  mod.recordTest('t', 90);
  assert.equal(mod.getProgress().tests.t.passedAt, undefined);
});

test('exam answers count how often each question was seen and missed', async () => {
  const { mod } = await freshProgress();
  mod.recordAnswers([{ id: 'q1', correct: false }, { id: 'q2', correct: true }]);
  mod.recordAnswers([{ id: 'q1', correct: true }]);
  const { q1, q2 } = mod.getProgress().mcq;
  assert.deepEqual([q1.seen, q1.wrong, q1.lastCorrect], [2, 1, true]);
  assert.deepEqual([q2.seen, q2.wrong, q2.lastCorrect], [1, 0, true]);
});

test('sections toggle on and off and stay sorted', async () => {
  const { mod } = await freshProgress();
  for (const i of [3, 0, 2]) mod.toggleSectionRead('t', i);
  assert.deepEqual(mod.getProgress().sections.t, [0, 2, 3]);
  mod.toggleSectionRead('t', 2);
  assert.deepEqual(mod.getProgress().sections.t, [0, 3]);
  mod.markAllSectionsRead('t', 4);
  assert.deepEqual(mod.getProgress().sections.t, [0, 1, 2, 3]);
});

test('flags and interview ratings can be set and cleared', async () => {
  const { mod } = await freshProgress();
  mod.setFlag('code', 'p1', true);
  mod.rateIQ('iq1', 'partial');
  assert.deepEqual([mod.getProgress().code, mod.getProgress().iq], [{ p1: true }, { iq1: 'partial' }]);
  mod.setFlag('code', 'p1', false);
  mod.rateIQ('iq1', null);
  assert.deepEqual([mod.getProgress().code, mod.getProgress().iq], [{}, {}]);
});

test('study actions record today once; settings changes are not study', async () => {
  const { mod } = await freshProgress();
  mod.setSettings({ theme: 'dark' });
  assert.deepEqual(mod.getProgress().activityDays, []);
  mod.toggleSectionRead('t', 0);
  mod.toggleSectionRead('t', 1);
  assert.deepEqual(mod.getProgress().activityDays, [mod.localDay()]);
});

test('activity days are capped at 400', async () => {
  const days = Array.from({ length: 400 }, (_, i) => new Date(Date.UTC(2020, 0, 1) + i * 86_400_000).toISOString().slice(0, 10));
  const { mod } = await loadWith(JSON.stringify({ activityDays: days }));
  mod.toggleSectionRead('t', 0);
  const after = mod.getProgress().activityDays!;
  assert.equal(after.length, 400);
  assert.equal(after.at(-1), mod.localDay());
  assert.equal(after[0], days[1]);
});

test('earned badges never downgrade', async () => {
  const { mod } = await freshProgress();
  mod.earnAchievements([{ id: 'spec-reader', tier: 'gold', tiers: ['bronze', 'silver', 'gold'] }], 1000);
  mod.earnAchievements([{ id: 'spec-reader', tier: 'bronze', tiers: ['bronze'] }], 2000);
  assert.deepEqual(mod.getProgress().achievements!['spec-reader'], { tier: 'gold', earnedAt: 1000, tiers: { bronze: 1000, silver: 1000, gold: 1000 } });
});

test('reset clears progress but keeps settings', async () => {
  const { mod } = await freshProgress();
  mod.setSettings({ passMark: 85 });
  mod.recordTest('t', 90);
  mod.resetProgress();
  assert.deepEqual(mod.getProgress().tests, {});
  assert.equal(mod.getProgress().settings.passMark, 85);
});
