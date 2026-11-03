// Optional parts of a Learn section (M8): the shared rules npm run validate uses. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';
import type { Section } from '../src/types';

const R = await load<typeof import('../src/content/sectionRules')>('/src/content/sectionRules.ts');
const C = await load<typeof import('../src/content')>('/src/content/index.ts');

test('every section in the course passes the rules, and the three M8 sections have Learn more', () => {
  for (const t of C.TOPICS) for (const s of t.sections) assert.deepEqual(R.sectionProblems(s), [], `${t.id}: ${s.heading}`);
  const withLearnMore = C.TOPICS.flatMap((t) => t.sections.filter((s) => s.learnMore).map((s) => t.id));
  assert.deepEqual(withLearnMore.sort(), ['mt-test-design', 'pw-locators', 'sql-joins-validation']);
});

test('a malformed learnMore fails', () => {
  const base: Section = { heading: 'H', body: 'b' };
  const long = 'x'.repeat(80);
  assert.match(R.sectionProblems({ ...base, learnMore: { body: 'too short' } }).join(), /at least 80/);
  assert.match(R.sectionProblems({ ...base, learnMore: { body: long, links: [{ name: 'A', url: 'http://a.example', what: 'w' }] } }).join(), /https URL/);
  assert.match(R.sectionProblems({ ...base, learnMore: { body: long, links: [{ name: '', url: 'https://a.example', what: 'w' }] } }).join(), /name and a what/);
  assert.deepEqual(R.sectionProblems({ ...base, learnMore: { body: long, links: [{ name: 'A', url: 'https://a.example', what: 'w' }] } }), []);
});

const V = await load<{ checkSteps: (lesson: unknown, where: string) => string[] }>('/scripts/validate-steps.mjs');
const O = await load<typeof import('../src/lib/progress-ops')>('/src/lib/progress-ops.ts');
const W = await load<typeof import('../src/lib/weak')>('/src/lib/weak.ts');

test('the three M8 step lessons are valid, and a malformed step fails', () => {
  const lessons = C.TOPICS.flatMap((t) => t.sections.flatMap((s, i) => (s.steps ? [{ t, i, steps: s.steps }] : [])));
  assert.deepEqual(lessons.map((l) => l.t.id).sort(), ['mt-test-design', 'pw-locators', 'sql-joins-validation']);
  for (const l of lessons) assert.deepEqual(V.checkSteps(l.steps, l.t.id), []);

  const good = structuredClone(lessons[0].steps);
  const fails = (change: (x: typeof good) => void, expect: RegExp) => {
    const x = structuredClone(good);
    change(x);
    assert.match(V.checkSteps(x, 'x').join('\n'), expect);
  };
  const turn = (x: typeof good) => x.steps.find((s) => s.kind === 'turn' && s.task.type === 'choose') as Extract<(typeof good.steps)[number], { kind: 'turn' }>;
  fails((x) => ((turn(x).task as { answer: number }).answer = 9), /answer index out of range/);
  fails((x) => (x.steps = x.steps.filter((s) => s.kind === 'watch')), /at least one Your turn/);
  fails((x) => ((x.steps[0] as { script: unknown[] }).script = [{ say: 7 }]), /say 7/);
  fails((x) => ((x.steps[0] as { kind: string }).kind = 'dance'), /kind must be watch or turn/);
});

test('finishing a step lesson records its misses; Weak areas shows them and a clean run clears them', () => {
  const ix = O.buildContentIndex(C.TOPICS, [], [], [], []);
  const t = C.TOPIC_BY_ID.get('sql-joins-validation')!;
  const i = t.sections.findIndex((s) => s.steps);
  const run = (p: typeof O.DEFAULT_PROGRESS, missed: number) => O.applyOps(p, [{ op: 'steps', topicId: t.id, index: i, missed }], ix, '2026-11-04', '2026-11-04T10:00:00Z');
  let { progress, skipped } = run(structuredClone(O.DEFAULT_PROGRESS), 2);
  assert.deepEqual(skipped, []);
  assert.deepEqual(W.weakTopics(progress, [t])[0]?.shakySteps, [{ index: i, heading: t.sections[i].heading, missed: 2 }]);
  ({ progress } = run(progress, 0));
  assert.deepEqual(W.weakTopics(progress, [t]), [], 'a clean run clears it');
  assert.equal(O.applyOps(progress, [{ op: 'steps', topicId: t.id, index: 999, missed: 1 }], ix, '2026-11-04', 'now').skipped.length, 1);
});
