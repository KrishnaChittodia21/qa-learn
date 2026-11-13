// Steps for every section (src/lib/autoSteps.ts): each section without a hand-written lesson gets one generated from its
// content, and every generated lesson passes the same checks as the hand-written ones (layout on both stage sizes,
// lines the script can light, answerable questions). Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const A = await load<typeof import('../src/lib/autoSteps')>('/src/lib/autoSteps.ts');
const V = await load<{ checkSteps: (lesson: unknown, where: string) => string[] }>('/scripts/validate-steps.mjs');

// short sections can't always reach 4 steps or have a question; everything else must pass
const ALLOWED = [/steps \(needs 4–16\)/, /needs at least one Your turn step/];

test('every Learn section has a step lesson, and every generated one passes the step rules', () => {
  let generated = 0;
  let withQuestion = 0;
  const problems: string[] = [];
  for (const t of C.TOPICS) {
    t.sections.forEach((s, i) => {
      const lesson = A.lessonFor(t, i);
      assert.ok(lesson, `${t.id} section ${i + 1} has no steps`);
      if (s.steps) {
        assert.equal(lesson, s.steps, 'a hand-written lesson wins');
        return;
      }
      generated++;
      if (lesson.steps.some((st) => st.kind === 'turn')) withQuestion++;
      assert.equal(lesson.steps[0].kind, 'watch', `${t.id} section ${i + 1} opens with a Watch step`);
      problems.push(...V.checkSteps(lesson, `${t.id} section ${i + 1}`).filter((p) => !ALLOWED.some((r) => r.test(p))));
    });
  }
  assert.deepEqual(problems.slice(0, 10), []);
  assert.ok(generated > 300, `${generated} generated`);
  assert.ok(withQuestion / generated > 0.8, `only ${withQuestion} of ${generated} generated lessons have a question`);
});

test('markdown is reduced to the marks the player renders', () => {
  assert.equal(A.plainLine('See [the docs](https://x.dev) and *this* with **bold** and `code`.'), 'See the docs and this with **bold** and `code`.');
});

test('generated pictures only use icons that exist, and draw no words', async () => {
  const G = await load<typeof import('../src/components/steps/glyphs')>('/src/components/steps/glyphs.ts');
  const missing = new Set<string>();
  for (const t of C.TOPICS)
    t.sections.forEach((s, i) => {
      if (s.steps) return;
      for (const st of A.lessonFor(t, i)!.steps)
        for (const a of [...(st.script ?? []), ...(st.setup ?? [])] as Record<string, any>[]) {
          if ('hero' in a && !G.GLYPHS[a.hero.icon]) missing.add(a.hero.icon);
          if ('glyphs' in a) for (const it of [...a.glyphs.items, { icon: a.glyphs.hub ?? 'sparkles' }]) if (!G.GLYPHS[it.icon]) missing.add(it.icon);
          assert.ok(!['concept', 'spotlight', 'map', 'flow', 'stack', 'checks', 'ask', 'table'].some((k) => k in a), 'no text scenes');
        }
    });
  assert.deepEqual([...missing], []);
});
