// The step tracer behind the coding visualiser (src/lib/instrument.ts + trace.ts): instrumented code must behave exactly like the
// original, and record steps on the learner's own line numbers. Checked against every reference solution.
// Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const T = {
  ...(await load<typeof import('../src/lib/trace')>('/src/lib/trace.ts')),
  ...(await load<typeof import('../src/lib/instrument')>('/src/lib/instrument.ts')),
};

type Rec = { steps: { line: number; fn: string; vars: Record<string, unknown>; returned?: boolean; ret?: unknown }[]; lastLine: number };
/** the worker's job in miniature: the recorder, then the (instrumented) code, then the function */
function load1(code: string, fnName: string) {
  const make = new Function(`${T.TRACE_RUNTIME}\n${code}\n;return { fn: typeof ${fnName} === 'function' ? ${fnName} : undefined, T: __T };`);
  return make() as { fn: (...a: unknown[]) => unknown; T: Rec };
}
const norm = (v: unknown) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

test('instrumented reference solutions return exactly what the originals return, with steps on real lines', async () => {
  let checked = 0;
  for (const q of C.CODING_PROBLEMS) {
    if (!q.solution) continue;
    const plain = load1(q.solution, q.fnName);
    const traced = load1(T.instrument(q.solution), q.fnName);
    assert.ok(traced.fn, `${q.id}: ${q.fnName} still defined after instrumenting`);
    const lines = q.solution.split('\n').length;
    for (const t of q.tests) {
      const a = norm(await plain.fn(...structuredClone(t.args)));
      const b = norm(await traced.fn(...structuredClone(t.args)));
      assert.deepEqual(b, a, `${q.id}: same result for ${JSON.stringify(t.args).slice(0, 60)}`);
    }
    assert.ok(traced.T.steps.length > 0, `${q.id}: steps recorded`);
    for (const s of traced.T.steps) assert.ok(s.line >= 1 && s.line <= lines, `${q.id}: line ${s.line} is in the code`);
    checked++;
  }
  assert.ok(checked > 60, `${checked} reference solutions traced`);
});

test('a trace shows the variables, the loop progress and the returned value', () => {
  const code = ['function sum(arr) {', '  let total = 0;', '  for (let i = 0; i < arr.length; i++) {', '    total += arr[i];', '  }', '  return total;', '}'].join('\n');
  const { fn, T: rec } = load1(T.instrument(code), 'sum');
  assert.equal(fn([2, 3]), 5);
  // a return line is two moments: about to run it, then the value it returned
  assert.deepEqual(
    rec.steps.map((s) => s.line),
    [2, 3, 4, 4, 6, 6],
  );
  assert.deepEqual(rec.steps[0].vars, { arr: [2, 3] });
  assert.deepEqual(rec.steps[3].vars, { arr: [2, 3], total: 2, i: 1 });
  const last = rec.steps.at(-1)!;
  assert.equal(last.returned, true);
  assert.equal(last.ret, 5);
});

test('single-statement bodies, callbacks and a not-yet-declared name are handled', () => {
  const code = ['function f(xs) {', '  if (!xs.length) return [];', '  const out = xs.map((x) => x * 2);', '  for (const x of out) if (x > 4) return x;', '  return -1;', '}'].join('\n');
  const { fn, T: rec } = load1(T.instrument(code), 'f');
  assert.equal(fn([1, 3]), 6);
  assert.deepEqual(fn([]), []);
  assert.ok(rec.steps.some((s) => s.fn === 'callback' && s.returned), 'the arrow callback is a returning step');
  // `out` is not shown before its declaration ran
  assert.ok(!('out' in rec.steps[0].vars));
});

test('a syntax error is reported, not swallowed', () => {
  assert.throws(() => T.instrument('function f( {'), SyntaxError);
});
