// Shorts (M7): every Short is valid and lands on its lesson section, the validator rejects malformed ones, and
// "Short of the day" moves on in course order. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';
import type { Short } from '../src/types';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const D = await load<typeof import('../src/content/shorts')>('/src/content/shorts.ts');
const L = await load<typeof import('../src/lib/shorts')>('/src/lib/shorts.ts');
const headings = new Map(C.TOPICS.map((t) => [t.id, t.sections.map((s) => s.heading)]));

test('every Short is valid and resolves to a section', () => {
  assert.deepEqual(D.shortProblems(D.SHORTS_DATA, headings), []);
  assert.equal(L.SHORTS.length, D.SHORTS_DATA.length, 'a Short whose section is missing would vanish');
  assert.equal(D.SHORTS_DATA.length, 12);
});

test('the validator rejects malformed Shorts', () => {
  const good = structuredClone(D.SHORTS_DATA[0]);
  const bad = (change: (s: Short) => void, expect: RegExp) => {
    const s = structuredClone(good);
    change(s);
    const problems = D.shortProblems([s], headings);
    assert.ok(problems.some((p) => expect.test(p)), `expected ${expect} in ${JSON.stringify(problems)}`);
  };
  bad((s) => (s.beats = s.beats.filter((b) => b.type !== 'quiz')), /exactly one quiz/);
  bad((s) => s.beats.push(structuredClone(s.beats.find((b) => b.type === 'quiz')!)), /exactly one quiz/);
  bad((s) => ((s.beats.find((b) => b.type === 'quiz') as { answer: number }).answer = 9), /answer must point/);
  bad((s) => ((s.beats[0] as { type: string }).type = 'hologram'), /unknown beat type/);
  bad((s) => ((s.beats.find((b) => b.type === 'counter') as { value: unknown }).value = 'lots'), /number and a unit/);
  bad((s) => (s.heading = 'No such section'), /no section/);
  bad((s) => (s.id = 'Not Kebab'), /kebab-case/);
  assert.match(D.shortProblems([good, good], headings).join(), /duplicate id/);
});

test('Short of the day: the first unwatched in course order; one watched today stays up', () => {
  const [a, b] = L.SHORTS;
  assert.equal(L.shortOfTheDay({}, '2026-11-04')?.entry, a);
  const watched = { [a.short.id]: { watchedAt: '2026-11-04T08:00:00Z', day: '2026-11-04' } };
  assert.deepEqual(L.shortOfTheDay(watched, '2026-11-04'), { entry: a, watched: true });
  assert.equal(L.shortOfTheDay(watched, '2026-11-05')?.entry, b);
});

test('a quiz waits for the learner; other beats stay up long enough to read', () => {
  for (const { short } of L.SHORTS) for (const beat of short.beats) assert.ok(L.beatMs(beat) >= 5200);
  assert.equal(L.beatMs({ type: 'quiz', kicker: 'k', head: 'h', options: [], answer: 0 }), Infinity);
});
