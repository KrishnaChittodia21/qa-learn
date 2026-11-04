// Playground snippets (src/lib/playground.ts): a first visit starts from the runnable sample; an untouched copy of the
// old one-line default is upgraded to it, and anything the learner wrote is kept. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};
const P = await load<typeof import('../src/lib/playground')>('/src/lib/playground.ts');
const KEY = 'qa-learn-playground-v1';

test('a first visit opens the sample, which runs', async () => {
  store.clear();
  const s = P.loadPlayground();
  assert.equal(s.snippets[0].code, P.SAMPLE);
  const logs: string[] = [];
  const log = console.log;
  console.log = (...a: unknown[]) => void logs.push(a.join(' '));
  try {
    await new Function('return (async () => {\n' + P.SAMPLE + '\n})();')();
  } finally {
    console.log = log;
  }
  assert.ok(logs.includes('4/4 checks passed'), logs.join('\n'));
});

test('the old untouched default is upgraded; edited code is kept', () => {
  const old = "// Write JavaScript here and press Run (Ctrl/⌘ + Enter)\nconsole.log('Hello, QA!');\n";
  store.set(KEY, JSON.stringify({ active: 's1', snippets: [{ id: 's1', name: 'Scratch', code: old }, { id: 's2', name: 'Mine', code: 'console.log(1)' }] }));
  const s = P.loadPlayground();
  assert.equal(s.snippets[0].code, P.SAMPLE);
  assert.equal(s.snippets[1].code, 'console.log(1)');
});
