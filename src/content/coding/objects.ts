import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-objects-deep-equal',
    category: 'objects',
    difficulty: 'hard',
    title: 'Deep equality',
    prompt: `Write \`deepEqual(a, b)\` that returns \`true\` if two JSON-like values are structurally equal: same primitives, same array items in the same order, and same object keys with deep-equal values (key order does not matter). This is what \`expect(x).toEqual(y)\` does for you in Playwright.

**Example 1**
\`\`\`
deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })  // true
\`\`\`
**Example 2**
\`\`\`
deepEqual([1, 2], [2, 1])  // false
\`\`\`

**Constraints**
- Values are numbers, strings, booleans, \`null\`, arrays or plain objects.
- An array is never equal to an object.`,
    fnName: 'deepEqual',
    starter: `/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function deepEqual(a, b) {
  // your code
}`,
    tests: [
      { args: [{ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }], expected: true },
      { args: [[1, 2], [2, 1]], expected: false },
      { args: [{ x: 1, y: 2 }, { y: 2, x: 1 }], expected: true },
      { args: [null, null], expected: true },
      { args: [null, {}], expected: false },
      { args: [[], {}], expected: false },
      { args: [{ a: 1 }, { a: 1, b: 2 }], expected: false, hidden: true },
      { args: [1, '1'], expected: false, hidden: true },
      { args: [{ user: { roles: ['admin', 'qa'] } }, { user: { roles: ['admin', 'qa'] } }], expected: true, hidden: true },
    ],
    hints: [
      'If `a === b`, they are equal (covers identical primitives).',
      'If either is not an object or is null, they are unequal at this point.',
      'Check array-ness matches, key counts match, then recurse on every key.',
    ],
    solution: `function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}`,
    explanation: `**Approach:** recursion with early exits.
1. \`===\` handles equal primitives and the same reference.
2. Anything that is not a non-null object at this point is unequal (\`typeof null === 'object'\` is the trap).
3. An array vs an object is unequal. For arrays, \`Object.keys\` returns the indices, so one loop handles both.
4. Same key count, and each key exists in \`b\` with a deep-equal value.

**Complexity:** O(n) over all nested values, O(depth) stack.

**Shortcut (and why it's wrong):** \`JSON.stringify(a) === JSON.stringify(b)\` fails when key order differs. Node has \`util.isDeepStrictEqual\`, and test runners have \`toEqual\`.

**Say aloud:** "The null check and the array-vs-object check are the bugs I'd test for. I'd also mention that NaN, Dates and cycles are out of scope here."`,
    followUps: [
      { q: 'How would you handle NaN?', a: 'NaN !== NaN, so add a check: if both are numbers and both Number.isNaN, treat them as equal (Object.is(a, b) also does this).' },
      { q: 'What is the difference between toEqual and toStrictEqual in Jest/Playwright?', a: 'toStrictEqual also checks undefined properties, array sparseness and class types; toEqual ignores undefined props.' },
    ],
  },
  {
    id: 'code-objects-deep-merge',
    category: 'objects',
    difficulty: 'medium',
    title: 'Deep merge two objects',
    prompt: `Write \`deepMerge(base, override)\` that returns a **new** object. Nested plain objects merge recursively; for any other value (primitive or array) the value from \`override\` wins. Neither input may be mutated. This is how test configs layer environment overrides on defaults.

**Example 1**
\`\`\`
deepMerge({ use: { headless: true, viewport: { w: 1280 } } }, { use: { viewport: { h: 720 } } })
// { use: { headless: true, viewport: { w: 1280, h: 720 } } }
\`\`\`
**Example 2**
\`\`\`
deepMerge({ tags: ['a'] }, { tags: ['b'] })  // { tags: ['b'] }   (arrays replaced)
\`\`\`

**Constraints**
- JSON-like values only.`,
    fnName: 'deepMerge',
    starter: `/**
 * @param {object} base
 * @param {object} override
 * @returns {object}
 */
function deepMerge(base, override) {
  // your code
}`,
    tests: [
      {
        args: [{ use: { headless: true, viewport: { w: 1280 } } }, { use: { viewport: { h: 720 } } }],
        expected: { use: { headless: true, viewport: { w: 1280, h: 720 } } },
      },
      { args: [{ tags: ['a'] }, { tags: ['b'] }], expected: { tags: ['b'] } },
      { args: [{}, {}], expected: {} },
      { args: [{ a: 1 }, {}], expected: { a: 1 } },
      { args: [{ a: 1 }, { a: 2, b: 3 }], expected: { a: 2, b: 3 } },
      { args: [{ a: { x: 1 } }, { a: 5 }], expected: { a: 5 }, hidden: true },
      { args: [{ a: 5 }, { a: { x: 1 } }], expected: { a: { x: 1 } }, hidden: true },
      { args: [{ retries: 0, env: { url: 'dev' } }, { env: { url: 'qa', token: null } }], expected: { retries: 0, env: { url: 'qa', token: null } }, hidden: true },
    ],
    hints: [
      'Start with a shallow copy of `base`.',
      'For each key in `override`: if both sides are plain objects, recurse; otherwise take the override value.',
      'Write an `isPlainObject` helper: not null, typeof object, not an array.',
    ],
    solution: `function deepMerge(base, override) {
  const isObj = function (v) { return v !== null && typeof v === 'object' && !Array.isArray(v); };
  const out = Object.assign({}, base);
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    out[key] = isObj(b) && isObj(o) ? deepMerge(b, o) : o;
  }
  return out;
}`,
    explanation: `**Approach:** copy \`base\`, then for every override key either recurse (both sides plain objects) or replace.

**Complexity:** O(n) over the keys of both objects.

**Shallow alternative:** \`{ ...base, ...override }\` or \`Object.assign\` only merges the top level. \`use.viewport\` would be replaced wholesale, losing \`w\`. That is the main point of this problem.

**Caveat:** nested values taken from \`base\` that are not overridden are shared by reference. For full isolation, deep clone first.

**Say aloud:** "Spread is shallow. Config merging needs recursion on plain objects, with arrays replaced rather than concatenated, and I'd confirm that rule."`,
    followUps: [
      { q: 'Why does { ...a, ...b } lose nested settings?', a: 'Spread copies only top-level keys, so b.use replaces a.use entirely instead of merging the nested fields.' },
    ],
  },
  {
    id: 'code-objects-invert',
    category: 'objects',
    difficulty: 'easy',
    title: 'Invert keys and values',
    prompt: `Write \`invertObject(obj)\` that swaps keys and values. Values become string keys. If two keys share a value, the **later** key wins.

**Example 1**
\`\`\`
invertObject({ a: '1', b: '2' })  // { '1': 'a', '2': 'b' }
\`\`\`
**Example 2**
\`\`\`
invertObject({ x: 'same', y: 'same' })  // { same: 'y' }
\`\`\`

**Constraints**
- Values are strings or numbers.`,
    fnName: 'invertObject',
    starter: `/**
 * @param {Record<string, string|number>} obj
 * @returns {Record<string, string>}
 */
function invertObject(obj) {
  // your code
}`,
    tests: [
      { args: [{ a: '1', b: '2' }], expected: { '1': 'a', '2': 'b' } },
      { args: [{ x: 'same', y: 'same' }], expected: { same: 'y' } },
      { args: [{}], expected: {} },
      { args: [{ ok: 200 }], expected: { '200': 'ok' } },
      { args: [{ admin: 'role1', qa: 'role2' }], expected: { role1: 'admin', role2: 'qa' } },
      { args: [{ a: 1, b: 2, c: 1 }], expected: { '1': 'c', '2': 'b' }, hidden: true },
      { args: [{ k: 'v' }], expected: { v: 'k' }, hidden: true },
    ],
    hints: [
      'Loop over `Object.keys(obj)` (or `Object.entries`).',
      'Assign `out[obj[key]] = key`; later keys overwrite earlier ones automatically.',
    ],
    solution: `function invertObject(obj) {
  const out = {};
  for (const key of Object.keys(obj)) {
    out[obj[key]] = key;
  }
  return out;
}`,
    explanation: `**Approach:** iterate the entries and assign value → key. Collisions resolve to the last key because of iteration order.

**Complexity:** O(n) time and space.

**With built-ins:** \`Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))\`.

**Say aloud:** "I'd ask what should happen when values repeat. Overwrite, keep first, or collect into arrays are all valid, but it needs a decision and a test."`,
    followUps: [
      { q: 'How would you keep all keys when values collide?', a: 'Map each value to an array of keys: (out[v] ||= []).push(k), giving e.g. { same: ["x", "y"] }.' },
    ],
  },
  {
    id: 'code-objects-pick',
    category: 'objects',
    difficulty: 'easy',
    title: 'Pick keys from an object',
    prompt: `Write \`pick(obj, keys)\` that returns a new object with only the listed keys **that exist** in \`obj\`. This is useful for asserting on a subset of an API response.

**Example 1**
\`\`\`
pick({ id: 1, name: 'Bob', token: 'x' }, ['id', 'name'])  // { id: 1, name: 'Bob' }
\`\`\`
**Example 2**
\`\`\`
pick({ a: 1 }, ['b'])  // {}
\`\`\`

**Constraints**
- Keep keys whose value is \`null\` or \`0\` or \`false\`.`,
    fnName: 'pick',
    starter: `/**
 * @param {object} obj
 * @param {string[]} keys
 * @returns {object}
 */
function pick(obj, keys) {
  // your code
}`,
    tests: [
      { args: [{ id: 1, name: 'Bob', token: 'x' }, ['id', 'name']], expected: { id: 1, name: 'Bob' } },
      { args: [{ a: 1 }, ['b']], expected: {} },
      { args: [{}, ['a']], expected: {} },
      { args: [{ a: 1, b: 2 }, []], expected: {} },
      { args: [{ a: 0, b: false, c: null }, ['a', 'b', 'c']], expected: { a: 0, b: false, c: null } },
      { args: [{ x: { y: 1 }, z: 2 }, ['x']], expected: { x: { y: 1 } }, hidden: true },
      { args: [{ a: 1, b: 2 }, ['b', 'a', 'b']], expected: { b: 2, a: 1 }, hidden: true },
    ],
    hints: [
      'Loop over `keys`, not over the object.',
      'Use `key in obj` or `hasOwnProperty`, not a truthiness check, so `0`/`false`/`null` survive.',
    ],
    solution: `function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
  }
  return out;
}`,
    explanation: `**Approach:** iterate the requested keys, copying those that exist as own properties.

**Complexity:** O(k) for k requested keys.

**With built-ins:** \`Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]))\`. Lodash has \`_.pick\`, and the inverse is \`omit\`.

**Say aloud:** "The bug to avoid is \`if (obj[key])\`, which drops 0, false and null. Those are often the values you most want to assert on."`,
    followUps: [
      { q: 'How would you implement omit?', a: 'Copy all own keys of obj, skipping any that appear in the keys list (use a Set for O(1) lookups).' },
    ],
  },
  {
    id: 'code-objects-count-by',
    category: 'objects',
    difficulty: 'easy',
    title: 'Count items by property',
    prompt: `Write \`countBy(items, prop)\` that counts objects by the value of \`prop\`.

**Example 1**
\`\`\`
countBy([{ s: 'pass' }, { s: 'fail' }, { s: 'pass' }], 's')  // { pass: 2, fail: 1 }
\`\`\`
**Example 2**
\`\`\`
countBy([], 's')  // {}
\`\`\`

**Constraints**
- Items missing the property count under \`"undefined"\`.`,
    fnName: 'countBy',
    starter: `/**
 * @param {object[]} items
 * @param {string} prop
 * @returns {Record<string, number>}
 */
function countBy(items, prop) {
  // your code
}`,
    tests: [
      { args: [[{ s: 'pass' }, { s: 'fail' }, { s: 'pass' }], 's'], expected: { pass: 2, fail: 1 } },
      { args: [[], 's'], expected: {} },
      { args: [[{ b: 'chromium' }], 'b'], expected: { chromium: 1 } },
      { args: [[{ a: 1 }, { b: 1 }], 'a'], expected: { '1': 1, undefined: 1 } },
      { args: [[{ p: 1 }, { p: 1 }, { p: 2 }], 'p'], expected: { '1': 2, '2': 1 } },
      { args: [[{ sev: 'high' }, { sev: 'low' }, { sev: 'high' }, { sev: 'high' }], 'sev'], expected: { high: 3, low: 1 }, hidden: true },
      { args: [[{ ok: true }, { ok: false }, { ok: true }], 'ok'], expected: { true: 2, false: 1 }, hidden: true },
    ],
    hints: [
      'This is the frequency-count pattern applied to `item[prop]`.',
      '`counts[k] = (counts[k] || 0) + 1`.',
    ],
    solution: `function countBy(items, prop) {
  const counts = {};
  for (const item of items) {
    const k = String(item[prop]);
    counts[k] = (counts[k] || 0) + 1;
  }
  return counts;
}`,
    explanation: `**Approach:** a single pass tallying \`String(item[prop])\`.

**Complexity:** O(n) time, O(k) space.

**With built-ins:** \`items.reduce((acc, it) => { acc[it[prop]] = (acc[it[prop]] ?? 0) + 1; return acc; }, {})\`. Or \`Object.groupBy\`, then map each group to its length.

**Say aloud:** "Bugs by severity, tests by status: this is the counting pattern again. I'd mention that keys are stringified, so true becomes 'true'."`,
    followUps: [
      { q: 'How would you sort the result by count, descending?', a: 'Object.entries(counts).sort((a, b) => b[1] - a[1]) gives [key, count] pairs from most to least frequent.' },
    ],
  },
  {
    id: 'code-objects-deep-clone',
    category: 'objects',
    difficulty: 'medium',
    title: 'Deep clone (no structuredClone)',
    prompt: `Write \`cloneAndSet(obj, path, value)\`. It must **deep clone** \`obj\` without \`structuredClone\` or \`JSON\`, set the dot-separated \`path\` on the **clone** to \`value\`, and return \`{ original: obj, copy }\`. If your clone is shallow, the original changes too, and the tests will catch it.

**Example 1**
\`\`\`
cloneAndSet({ user: { name: 'a' } }, 'user.name', 'b')
// { original: { user: { name: 'a' } }, copy: { user: { name: 'b' } } }
\`\`\`
**Example 2**
\`\`\`
cloneAndSet({ items: [1, 2] }, 'items.0', 9)
// { original: { items: [1, 2] }, copy: { items: [9, 2] } }
\`\`\`

**Constraints**
- JSON-like values (objects, arrays, primitives, null). The path always exists up to its parent.`,
    fnName: 'cloneAndSet',
    starter: `/**
 * @param {object} obj
 * @param {string} path  e.g. "user.address.city"
 * @param {any} value
 * @returns {{ original: object, copy: object }}
 */
function cloneAndSet(obj, path, value) {
  // your code
}`,
    tests: [
      { args: [{ user: { name: 'a' } }, 'user.name', 'b'], expected: { original: { user: { name: 'a' } }, copy: { user: { name: 'b' } } } },
      { args: [{ items: [1, 2] }, 'items.0', 9], expected: { original: { items: [1, 2] }, copy: { items: [9, 2] } } },
      { args: [{ a: 1 }, 'a', 2], expected: { original: { a: 1 }, copy: { a: 2 } } },
      { args: [{ a: 1 }, 'b', null], expected: { original: { a: 1 }, copy: { a: 1, b: null } } },
      {
        args: [{ a: { b: { c: { d: 1 } } } }, 'a.b.c.d', 2],
        expected: { original: { a: { b: { c: { d: 1 } } } }, copy: { a: { b: { c: { d: 2 } } } } },
      },
      {
        args: [{ list: [{ id: 1 }, { id: 2 }] }, 'list.1.id', 99],
        expected: { original: { list: [{ id: 1 }, { id: 2 }] }, copy: { list: [{ id: 1 }, { id: 99 }] } },
        hidden: true,
      },
      {
        args: [{ cfg: { tags: ['smoke'] }, n: null }, 'cfg.tags.0', 'regression'],
        expected: { original: { cfg: { tags: ['smoke'] }, n: null }, copy: { cfg: { tags: ['regression'] }, n: null } },
        hidden: true,
      },
    ],
    hints: [
      'deepClone: primitives and null are returned as-is; arrays map deepClone over items; objects copy each key via deepClone.',
      'To set a path: split on ".", walk to the parent, assign the last segment.',
      'A spread `{ ...obj }` only copies the top level, so nested objects are still shared.',
    ],
    solution: `function cloneAndSet(obj, path, value) {
  function deepClone(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(deepClone);
    const out = {};
    for (const k of Object.keys(v)) out[k] = deepClone(v[k]);
    return out;
  }
  const copy = deepClone(obj);
  const parts = path.split('.');
  let target = copy;
  for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]];
  target[parts[parts.length - 1]] = value;
  return { original: obj, copy };
}`,
    explanation: `**Approach:** a recursive \`deepClone\`. Primitives are returned, arrays are mapped, and objects are rebuilt key by key. Then walk the path on the clone and assign. Because nothing is shared, the original stays intact.

**Complexity:** O(n) over every nested value.

**Alternatives:** \`structuredClone(obj)\` (modern built-in, handles Dates, Maps and cycles), \`JSON.parse(JSON.stringify(obj))\` (drops \`undefined\`, functions, and turns Dates into strings), or lodash \`cloneDeep\`.

**Say aloud:** "Spread is shallow, so mutating test data copied with spread leaks between tests. For fixtures I'd use structuredClone. Cycles would need a WeakMap of already-cloned objects."`,
    followUps: [
      { q: 'How do you handle circular references in a manual deep clone?', a: 'Keep a WeakMap from source object to its clone. Before cloning an object, return the existing clone if it is already in the map.' },
    ],
  },
  {
    id: 'code-objects-flatten-object',
    category: 'objects',
    difficulty: 'medium',
    title: 'Flatten a nested object to dot paths',
    prompt: `Write \`flattenObject(obj)\` that converts nested plain objects into a single-level object with dot-separated keys. Arrays and primitives are **leaf values** (kept as-is). Empty nested objects produce no keys.

**Example 1**
\`\`\`
flattenObject({ user: { name: 'a', address: { city: 'Pune' } }, active: true })
// { 'user.name': 'a', 'user.address.city': 'Pune', active: true }
\`\`\`
**Example 2**
\`\`\`
flattenObject({ tags: ['x', 'y'] })  // { tags: ['x', 'y'] }
\`\`\`

**Constraints**
- \`null\` is a leaf value.`,
    fnName: 'flattenObject',
    starter: `/**
 * @param {object} obj
 * @returns {Record<string, any>}
 */
function flattenObject(obj) {
  // your code
}`,
    tests: [
      {
        args: [{ user: { name: 'a', address: { city: 'Pune' } }, active: true }],
        expected: { 'user.name': 'a', 'user.address.city': 'Pune', active: true },
      },
      { args: [{ tags: ['x', 'y'] }], expected: { tags: ['x', 'y'] } },
      { args: [{}], expected: {} },
      { args: [{ a: null }], expected: { a: null } },
      { args: [{ a: {} , b: 1 }], expected: { b: 1 } },
      { args: [{ a: { b: { c: { d: 0 } } } }], expected: { 'a.b.c.d': 0 }, hidden: true },
      { args: [{ x: { y: [1, { z: 2 }] }, w: 'k' }], expected: { 'x.y': [1, { z: 2 }], w: 'k' }, hidden: true },
    ],
    hints: [
      'Write a helper `walk(value, prefix)`.',
      'If value is a plain object, recurse into each key with `prefix ? prefix + "." + key : key`.',
      'Otherwise assign `out[prefix] = value`.',
    ],
    solution: `function flattenObject(obj) {
  const out = {};
  function walk(value, prefix) {
    const isObj = value !== null && typeof value === 'object' && !Array.isArray(value);
    if (isObj) {
      for (const k of Object.keys(value)) walk(value[k], prefix ? prefix + '.' + k : k);
    } else {
      out[prefix] = value;
    }
  }
  for (const k of Object.keys(obj)) walk(obj[k], k);
  return out;
}`,
    explanation: `**Approach:** a DFS carrying the path prefix. Plain objects recurse and anything else is written under the accumulated path. Empty objects have no keys, so they produce nothing.

**Complexity:** O(n) over all nested keys, O(depth) stack.

**Alternative:** iterative with a stack of \`[value, prefix]\` pairs. Some variants also flatten arrays as \`tags.0\` and \`tags.1\`, so clarify which one is wanted.

**Say aloud:** "Useful for comparing two API responses field by field. Flatten both, then diff the keys and report the exact path that changed."`,
    followUps: [
      { q: 'How would you unflatten back into a nested object?', a: 'For each dotted key, split on ".", walk/create nested objects for all but the last segment, then assign the value at the last one.' },
    ],
  },
];
