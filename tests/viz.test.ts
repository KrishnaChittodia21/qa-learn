// Interactive visualisations (src/viz): every topic has at least one, and every placement lands on a real section,
// so a renamed heading can't silently drop a widget from its lesson. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const R = await load<typeof import('../src/viz/registry')>('/src/viz/registry.ts');

test('every topic has at least one interactive visualisation', () => {
  const placed = new Set(R.VIZ.flatMap((v) => v.meta.placements.map((p) => p.topic)));
  const missing = C.TOPICS.filter((t) => !placed.has(t.id)).map((t) => t.id);
  assert.deepEqual(missing, []);
});

test('every placement points at an existing topic section', () => {
  for (const { meta } of R.VIZ) {
    for (const p of meta.placements) {
      const topic = C.TOPIC_BY_ID.get(p.topic);
      assert.ok(topic, `${meta.id}: unknown topic ${p.topic}`);
      assert.ok(
        topic.sections.some((s) => s.heading.startsWith(p.heading)),
        `${meta.id}: no section in ${p.topic} starts with "${p.heading}"`,
      );
    }
  }
});
