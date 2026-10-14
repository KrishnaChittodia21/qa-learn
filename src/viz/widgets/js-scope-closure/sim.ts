// Pure simulation of call-stack frames, scope (environment) records and closures.
// Model: every function call pushes a stack frame and creates a new environment whose parent is
// the environment the function was CREATED in (lexical scope), stored on the function as its
// [[Environment]] (the "backpack"). When the call returns the frame pops; its environment is
// garbage only if no live function still points at it. `for (let …)` creates a fresh environment
// per iteration; `for (var …)` uses one function/script-level binding. Console output of each
// scenario is checked against real Node in tests.
import type { BaseFrame } from '../../core';

export type ScenarioId = 'counter' | 'two' | 'loop' | 'idgen';

export interface Binding {
  k: string;
  v: string;
  /** function value(s): ids of the environments each function's backpack points to */
  fns?: string[];
}

export interface Env {
  id: string;
  label: string;
  parent?: string;
  vars: Binding[];
  /** layout slot: transient call environments of the same function reuse one place */
  slot: string;
}

export interface StackEntry {
  id: string;
  label: string;
  env: string;
}

export interface ScFrame extends BaseFrame {
  line: number;
  envs: Env[];
  stack: StackEntry[];
  out: string[];
  /** env ids / "env.var" keys changed in this frame */
  hot: string[];
  /** variable lookup walking the scope chain: the envs visited, last one is where it was found */
  look?: { name: string; path: string[]; found: boolean };
}

interface Step {
  line: number;
  caption: string;
  predict?: string;
  run?: (s: State) => void;
  log?: string;
}

interface State {
  envs: Env[];
  stack: StackEntry[];
  hot: string[];
  look?: ScFrame['look'];
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  code: string[];
  intro: string;
  steps: Step[];
  outro: string;
}

// ---- helpers ----------------------------------------------------------------------------
const env = (s: State, id: string) => s.envs.find((e) => e.id === id)!;
const set = (s: State, envId: string, k: string, v: string, fns?: string[]) => {
  const e = env(s, envId);
  const i = e.vars.findIndex((b) => b.k === k);
  const b = { k, v, fns };
  if (i >= 0) e.vars[i] = b;
  else e.vars.push(b);
  s.hot.push(`${envId}.${k}`);
};
const newEnv = (s: State, e: Omit<Env, 'slot'> & { slot?: string }) => {
  s.envs.push({ slot: e.id, ...e });
  s.hot.push(e.id);
};
const push = (s: State, id: string, label: string, envId: string) => s.stack.push({ id, label, env: envId });
/** pop the top frame; drop its environment unless a function value still points at it (the closure) */
const pop = (s: State) => {
  const f = s.stack.pop()!;
  const captured = s.envs.some((e) => e.vars.some((b) => b.fns?.includes(f.env)));
  if (!captured) s.envs = s.envs.filter((e) => e.id !== f.env);
};
/** walk the scope chain from envId looking for name */
const lookup = (s: State, envId: string, name: string) => {
  const path: string[] = [];
  let cur: string | undefined = envId;
  while (cur) {
    path.push(cur);
    const e = env(s, cur);
    if (e.vars.some((b) => b.k === name)) {
      s.look = { name, path, found: true };
      return;
    }
    cur = e.parent;
  }
  s.look = { name, path, found: false };
};
const TDZ = '‹uninitialised›';

const makeCounterCode = [
  'function makeCounter() {',
  '  let count = 0;',
  '  return function inc() {',
  '    count += 1;',
  '    return count;',
  '  };',
  '}',
];

/** steps for calling makeCounter() and storing the result in `name` */
function makeCounterCall(callLine: number, name: string, envId: string, first: boolean): Step[] {
  return [
    {
      line: callLine,
      caption: `makeCounter() is called: a stack frame is pushed and a NEW environment is created for this call, its parent is global (where makeCounter was written).`,
      run: (s) => (push(s, `f-${envId}`, 'makeCounter()', envId), newEnv(s, { id: envId, label: `makeCounter #${envId.slice(1)}`, parent: 'g', vars: [{ k: 'count', v: TDZ }] })),
    },
    { line: 1, caption: 'let count = 0 initialises count inside this call\'s environment.', run: (s) => set(s, envId, 'count', '0') },
    {
      line: 2,
      caption: 'The inner function inc is created HERE, so its backpack ([[Environment]]) points at this call\'s environment.',
      predict: first ? 'makeCounter() is about to return and its stack frame will pop. Does count disappear?' : undefined,
      run: (s) => (s.hot.push(`fn-${envId}`), set(s, envId, '(returns)', 'ƒ inc', [envId])),
    },
    {
      line: callLine,
      caption: `The frame pops, but the environment survives: ${name} holds inc, and inc's backpack still references it. That kept-alive environment is the closure.`,
      run: (s) => {
        set(s, 'g', name, 'ƒ inc', [envId]);
        env(s, envId).vars = env(s, envId).vars.filter((b) => b.k !== '(returns)');
        pop(s);
      },
    },
  ];
}

/** steps for calling a counter function stored in `name` whose backpack is envId */
function incCall(callLine: number, name: string, envId: string, callId: string, result: string, predict?: string, slot = 'inc'): Step[] {
  return [
    {
      line: callLine,
      caption: `${name}() pushes a frame for inc. Its new (empty) environment's parent is the BACKPACK environment, not the caller's scope.`,
      predict,
      run: (s) => (push(s, callId, `${name}() → inc`, callId), newEnv(s, { id: callId, label: 'inc() call', parent: envId, vars: [], slot })),
    },
    {
      line: 3,
      caption: `count += 1: count is not in inc's own environment, so lookup walks up the scope chain and finds it in the backpack. It becomes ${result}.`,
      run: (s) => (lookup(s, callId, 'count'), set(s, envId, 'count', result)),
    },
    {
      line: callLine,
      caption: `return count gives ${result}; inc's frame and its empty environment are discarded. The backpack environment stays.`,
      log: result,
      run: (s) => pop(s),
    },
  ];
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  counter: {
    id: 'counter',
    label: 'makeCounter() × 3 calls',
    code: [...makeCounterCode, 'const counter = makeCounter();', 'console.log(counter());', 'console.log(counter());', 'console.log(counter());'],
    intro: 'Before any line runs, the global environment holds makeCounter (a hoisted function declaration) and counter, still uninitialised (const).',
    steps: [
      ...makeCounterCall(7, 'counter', 'e1', true),
      ...incCall(8, 'counter', 'e1', 'c1', '1'),
      ...incCall(9, 'counter', 'e1', 'c2', '2', 'Second call. count lives in the backpack, not in a frame. What will it print?'),
      ...incCall(10, 'counter', 'e1', 'c3', '3'),
    ],
    outro: 'count survived three calls because it lives in the environment captured by inc, not in any stack frame. Nothing outside can touch it: count is private state.',
  },
  two: {
    id: 'two',
    label: 'two independent counters',
    code: [...makeCounterCode, 'const a = makeCounter();', 'const b = makeCounter();', 'console.log(a());', 'console.log(a());', 'console.log(b());'],
    intro: 'Same factory, called twice. Global holds makeCounter (hoisted) and a, b (uninitialised).',
    steps: [
      ...makeCounterCall(7, 'a', 'e1', true),
      ...makeCounterCall(8, 'b', 'e2', false).map((st, i) => (i === 0 ? { ...st, predict: 'makeCounter() runs again. Will b share a\'s count?' } : st)),
      ...incCall(9, 'a', 'e1', 'c1', '1'),
      ...incCall(10, 'a', 'e1', 'c2', '2'),
      ...incCall(11, 'b', 'e2', 'c3', '1', 'a has counted to 2. What does b() print?', 'inc2'),
    ],
    outro: "Each call of makeCounter created its own environment, so a and b carry different backpacks. That is why per-test data factories don't leak state between tests.",
  },
  loop: {
    id: 'loop',
    label: 'var vs let in a loop',
    code: [
      'const viaVar = [];',
      'const viaLet = [];',
      'for (var i = 0; i < 3; i++) {',
      '  viaVar.push(() => i);',
      '}',
      'for (let j = 0; j < 3; j++) {',
      '  viaLet.push(() => j);',
      '}',
      'console.log(viaVar.map((f) => f()));',
      'console.log(viaLet.map((f) => f()));',
    ],
    intro: 'Creation phase: var i is hoisted to the script scope as undefined; viaVar and viaLet are uninitialised consts. j does not exist yet: it belongs to the loop.',
    steps: [
      { line: 0, caption: 'Two empty arrays that will collect callback functions (think: one cleanup callback per created test user).', run: (s) => (set(s, 'g', 'viaVar', '[]'), set(s, 'g', 'viaLet', '[]')) },
      { line: 2, caption: 'for (var i …): there is ONE i, in the global environment. i = 0.', run: (s) => set(s, 'g', 'i', '0') },
      { line: 3, caption: '() => i is created in the global scope, so its backpack points at global, the one shared i.', run: (s) => set(s, 'g', 'viaVar', '[ƒ]', ['g']) },
      { line: 3, caption: 'i++ updated the SAME binding to 1; the second arrow also points at global.', run: (s) => (set(s, 'g', 'i', '1'), set(s, 'g', 'viaVar', '[ƒ, ƒ]', ['g', 'g'])) },
      { line: 3, caption: 'i = 2, third arrow, same backpack.', run: (s) => (set(s, 'g', 'i', '2'), set(s, 'g', 'viaVar', '[ƒ, ƒ, ƒ]', ['g', 'g', 'g'])) },
      { line: 2, caption: 'i++ makes i 3, the test 3 < 3 fails and the loop ends. i is still there afterwards (var ignores the block).', predict: 'Each arrow will run later and read i. What will they return?', run: (s) => set(s, 'g', 'i', '3') },
      { line: 5, caption: 'for (let j …): the loop creates a fresh environment PER ITERATION. Iteration 1 gets its own j = 0.', run: (s) => newEnv(s, { id: 'j0', label: 'iteration 1', parent: 'g', vars: [{ k: 'j', v: '0' }] }) },
      { line: 6, caption: 'This arrow is created inside iteration 1, so its backpack points at j = 0.', run: (s) => set(s, 'g', 'viaLet', '[ƒ]', ['j0']) },
      { line: 6, caption: 'Next iteration: j is copied into a NEW environment and incremented there (j = 1); the arrow created now captures it.', run: (s) => (newEnv(s, { id: 'j1', label: 'iteration 2', parent: 'g', vars: [{ k: 'j', v: '1' }] }), set(s, 'g', 'viaLet', '[ƒ, ƒ]', ['j0', 'j1'])) },
      { line: 6, caption: 'Iteration 3: another environment with j = 2 and a third arrow.', run: (s) => (newEnv(s, { id: 'j2', label: 'iteration 3', parent: 'g', vars: [{ k: 'j', v: '2' }] }), set(s, 'g', 'viaLet', '[ƒ, ƒ, ƒ]', ['j0', 'j1', 'j2'])) },
      { line: 5, caption: 'j becomes 3 in a fresh copy, 3 < 3 fails and the loop ends. That last copy is not captured by anyone, and j is not visible after the loop.' },
      { line: 8, caption: 'viaVar.map calls the first arrow: lookup i → not in its own scope → found in global: 3.', run: (s) => (push(s, 'm1', 'map()', ''), push(s, 'a1', '() => i', 'g'), lookup(s, 'g', 'i')) },
      { line: 8, caption: 'All three arrows share the global i, so all three read 3.', log: '[ 3, 3, 3 ]', run: (s) => (s.stack = [], (s.look = undefined)) },
      { line: 9, caption: 'viaLet.map: the first arrow looks up j and finds it in ITS iteration environment: 0.', predict: 'Will the let-arrows also print 3, 3, 3?', run: (s) => (push(s, 'm2', 'map()', ''), push(s, 'a2', '() => j', 'j0'), lookup(s, 'j0', 'j')) },
      { line: 9, caption: 'Second arrow → iteration 2 → j = 1.', run: (s) => ((s.stack[2] = { id: 'a3', label: '() => j', env: 'j1' }), lookup(s, 'j1', 'j')) },
      { line: 9, caption: 'Third arrow → iteration 3 → j = 2.', run: (s) => ((s.stack[2] = { id: 'a4', label: '() => j', env: 'j2' }), lookup(s, 'j2', 'j')) },
      { line: 9, caption: 'Each arrow remembered its own j.', log: '[ 0, 1, 2 ]', run: (s) => ((s.stack = []), (s.look = undefined)) },
    ],
    outro: 'Closures capture variables (bindings), not values. var gives one shared binding; let gives one binding per iteration. Same rule explains setTimeout-in-a-loop puzzles.',
  },
  idgen: {
    id: 'idgen',
    label: 'unique test-data ids',
    code: [
      'function makeIdGen(prefix) {',
      '  let n = 0;',
      '  return () => `${prefix}-${++n}`;',
      '}',
      "const nextOrder = makeIdGen('order');",
      'console.log(nextOrder());',
      'console.log(nextOrder());',
      'console.log(typeof n);',
    ],
    intro: 'A closure-based id generator, the classic way to give every test unique data (order-1, order-2 …) without a global counter.',
    steps: [
      { line: 4, caption: "makeIdGen('order') pushes a frame and creates an environment holding the parameter prefix and the uninitialised n.", run: (s) => (push(s, 'f1', "makeIdGen('order')", 'e1'), newEnv(s, { id: 'e1', label: 'makeIdGen call', parent: 'g', vars: [{ k: 'prefix', v: "'order'" }, { k: 'n', v: TDZ }] })) },
      { line: 1, caption: 'let n = 0.', run: (s) => set(s, 'e1', 'n', '0') },
      { line: 2, caption: 'The arrow is created here; its backpack points at this environment (prefix AND n).', predict: 'The frame is about to pop. Can nextOrder still read prefix?', run: (s) => set(s, 'e1', '(returns)', 'ƒ arrow', ['e1']) },
      { line: 4, caption: 'Frame popped; nextOrder holds the arrow and the environment lives on in its backpack.', run: (s) => (set(s, 'g', 'nextOrder', 'ƒ arrow', ['e1']), (env(s, 'e1').vars = env(s, 'e1').vars.filter((b) => b.k !== '(returns)')), pop(s)) },
      { line: 5, caption: 'nextOrder() pushes a frame; its environment\'s parent is the backpack.', run: (s) => (push(s, 'c1', 'nextOrder()', 'c1'), newEnv(s, { id: 'c1', label: 'arrow call', parent: 'e1', vars: [], slot: 'call' })) },
      { line: 2, caption: '++n: lookup walks to the backpack and increments n to 1; prefix is found there too.', run: (s) => (lookup(s, 'c1', 'n'), set(s, 'e1', 'n', '1')) },
      { line: 5, caption: 'Returns order-1 and the call frame pops.', log: 'order-1', run: (s) => ((s.look = undefined), pop(s)) },
      { line: 6, caption: 'Second call, new frame, same backpack.', predict: 'What id comes out this time?', run: (s) => (push(s, 'c2', 'nextOrder()', 'c2'), newEnv(s, { id: 'c2', label: 'arrow call', parent: 'e1', vars: [], slot: 'call' })) },
      { line: 2, caption: '++n turns 1 into 2 in the shared backpack.', run: (s) => (lookup(s, 'c2', 'n'), set(s, 'e1', 'n', '2')) },
      { line: 6, caption: 'order-2: unique because the count persisted between calls.', log: 'order-2', run: (s) => ((s.look = undefined), pop(s)) },
      { line: 7, caption: 'typeof n from the top level: lookup starts in global and finds no n (the chain only goes OUTWARD, never into the backpack). typeof gives undefined instead of throwing.', log: 'undefined', run: (s) => lookup(s, 'g', 'n') },
    ],
    outro: 'n is truly private: only the arrow can reach it. Each makeIdGen call would start its own sequence, e.g. makeIdGen(\'user\') → user-1.',
  },
};

export interface Params {
  scenario: ScenarioId;
}

export function simulate({ scenario }: Params): ScFrame[] {
  const sc = SCENARIOS[scenario];
  const globals: Binding[] =
    scenario === 'loop'
      ? [{ k: 'viaVar', v: TDZ }, { k: 'viaLet', v: TDZ }, { k: 'i', v: 'undefined' }]
      : scenario === 'idgen'
        ? [{ k: 'makeIdGen', v: 'ƒ makeIdGen' }, { k: 'nextOrder', v: TDZ }]
        : [{ k: 'makeCounter', v: 'ƒ makeCounter' }, ...(scenario === 'two' ? ['a', 'b'] : ['counter']).map((k) => ({ k, v: TDZ }))];
  const s: State = { envs: [{ id: 'g', label: 'global', vars: globals, slot: 'g' }], stack: [], hot: [] };
  const out: string[] = [];
  const frames: ScFrame[] = [];
  const snap = (line: number, caption: string, predict?: string) =>
    frames.push({
      line,
      envs: s.envs.map((e) => ({ ...e, vars: e.vars.map((b) => ({ ...b, fns: b.fns && [...b.fns] })) })),
      stack: s.stack.map((x) => ({ ...x })),
      out: [...out],
      hot: [...s.hot],
      look: s.look && { ...s.look, path: [...s.look.path] },
      caption,
      predict,
    });
  snap(-1, sc.intro);
  for (const st of sc.steps) {
    s.hot = [];
    s.look = undefined;
    // the script itself runs in a global frame while any line executes
    if (!s.stack.length || s.stack[0].id !== 'script') s.stack.unshift({ id: 'script', label: '(global script)', env: 'g' });
    st.run?.(s);
    if (!s.stack.length || s.stack[0].id !== 'script') s.stack.unshift({ id: 'script', label: '(global script)', env: 'g' });
    if (st.log) out.push(st.log);
    snap(st.line, st.log ? `console.log → ${st.log}. ${st.caption}` : st.caption, st.predict);
  }
  s.hot = [];
  s.look = undefined;
  s.stack = [];
  snap(-1, sc.outro);
  return frames;
}
