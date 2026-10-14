// Pure simulation of JS variables (stack) and objects (heap) for five reference/copy scenarios.
// Primitives are stored in the variable; objects live on the heap and variables hold a reference.
// Each scenario's console output is checked against real Node in tests.
import type { BaseFrame } from '../../core';

export type ScenarioId = 'primitive' | 'assign' | 'spread' | 'clone' | 'function';

export interface Var {
  name: string;
  /** primitive value as JS would print it in code, e.g. 29.99 or 'standard_user' */
  value?: string;
  /** heap object id */
  ref?: string;
  scope: string;
}

export interface Field {
  k: string;
  v?: string;
  ref?: string;
}

export interface Obj {
  id: string;
  kind: 'object' | 'array';
  fields: Field[];
}

export interface RefFrame extends BaseFrame {
  line: number;
  vars: Var[];
  objs: Obj[];
  out: string[];
  /** names of variables / "objId.field" changed in this frame */
  hot: string[];
}

interface Step {
  line: number;
  caption: string;
  predict?: string;
  run?: (s: State) => void;
  log?: (s: State) => string;
}

interface State {
  vars: Var[];
  objs: Obj[];
  hot: string[];
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  code: string[];
  steps: Step[];
  outro: string;
}

// ---- tiny heap helpers -------------------------------------------------------------------
const q = (s: string) => `'${s}'`;
const v = (s: State, name: string) => s.vars.find((x) => x.name === name)!;
const o = (s: State, id: string) => s.objs.find((x) => x.id === id)!;
const setVar = (s: State, x: Var) => {
  const i = s.vars.findIndex((y) => y.name === x.name);
  if (i >= 0) s.vars[i] = x;
  else s.vars.push(x);
  s.hot.push(x.name);
};
const field = (s: State, id: string, k: string, f: Omit<Field, 'k'>) => {
  const ob = o(s, id);
  const i = ob.fields.findIndex((x) => x.k === k);
  if (i >= 0) ob.fields[i] = { k, ...f };
  else ob.fields.push({ k, ...f });
  s.hot.push(`${id}.${k}`);
};
const arrPush = (s: State, id: string, val: string) => {
  const ob = o(s, id);
  ob.fields.push({ k: String(ob.fields.length), v: val });
  s.hot.push(`${id}.${ob.fields.length - 1}`);
};
const newObj = (s: State, ob: Obj) => {
  s.objs.push(ob);
  s.hot.push(ob.id);
};
const user = (s: State, id: string, cartId: string, name: string, cart: string[] = []) => {
  newObj(s, { id, kind: 'object', fields: [{ k: 'name', v: q(name) }, { k: 'cart', ref: cartId }] });
  newObj(s, { id: cartId, kind: 'array', fields: cart.map((c, i) => ({ k: String(i), v: q(c) })) });
};
/** print a value the way console.log would (compact) */
export function print(s: { objs: Obj[] }, f: Field | Var): string {
  const raw = 'k' in f ? f.v : f.value;
  if (raw !== undefined) return raw.startsWith("'") ? raw.slice(1, -1) : raw;
  const ob = s.objs.find((x) => x.id === f.ref)!;
  if (ob.kind === 'array') return `[${ob.fields.map((x) => x.v).join(', ')}]`;
  return `{ ${ob.fields.map((x) => `${x.k}: ${x.v ?? '…'}`).join(', ')} }`;
}
const cart = (s: State, varName: string) => o(s, o(s, v(s, varName).ref!).fields.find((f) => f.k === 'cart')!.ref!);
const cartStr = (s: State, varName: string) => `[${cart(s, varName).fields.map((x) => x.v).join(', ')}]`;

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  primitive: {
    id: 'primitive',
    label: 'primitive copy',
    code: [
      'let price = 29.99;',
      'let copy = price;',
      'copy = 9.99;',
      'console.log(price);',
      "let name = 'standard_user';",
      'let alias = name;',
      'alias.toUpperCase();',
      'console.log(name);',
      'console.log(alias === name);',
      'function bump(n) { n = n + 1; }',
      'bump(price);',
      'console.log(price);',
    ],
    steps: [
      { line: 0, caption: 'price holds the number 29.99 directly. Numbers, strings, booleans, null, undefined, bigint and symbol are primitives: no heap object, no arrow.', run: (s) => setVar(s, { name: 'price', value: '29.99', scope: 'global' }) },
      { line: 1, caption: 'let copy = price copies the VALUE 29.99 into a second, independent box.', run: (s) => setVar(s, { name: 'copy', value: '29.99', scope: 'global' }), predict: 'copy is set to 9.99 next. What will console.log(price) print?' },
      { line: 2, caption: 'Reassigning copy only changes copy\'s own box.', run: (s) => setVar(s, { name: 'copy', value: '9.99', scope: 'global' }) },
      { line: 3, caption: 'price is untouched: 29.99.', log: (s) => print(s, v(s, 'price')) },
      { line: 4, caption: 'Strings are primitives too: name holds the text itself.', run: (s) => setVar(s, { name: 'name', value: q('standard_user'), scope: 'global' }) },
      { line: 5, caption: 'alias gets its own copy of the value.', run: (s) => setVar(s, { name: 'alias', value: q('standard_user'), scope: 'global' }), predict: 'alias.toUpperCase() runs next. Will name change?' },
      { line: 6, caption: 'Strings are immutable: toUpperCase() RETURNS a new string, which is thrown away here. Neither alias nor name changes.' },
      { line: 7, caption: 'name is still standard_user. To keep the result you must assign it: alias = alias.toUpperCase().', log: (s) => print(s, v(s, 'name')) },
      { line: 8, caption: 'Primitives compare by value, so two separate boxes holding the same text are ===.', log: (s) => String(v(s, 'alias').value === v(s, 'name').value) },
      { line: 10, caption: 'Calling bump(price) copies the value 29.99 into the parameter n, a new box in the function\'s frame.', run: (s) => setVar(s, { name: 'n', value: '29.99', scope: 'bump()' }) },
      { line: 9, caption: 'n = n + 1 changes the parameter box only.', run: (s) => setVar(s, { name: 'n', value: '30.99', scope: 'bump()' }), predict: 'bump() returns now. What does console.log(price) print?' },
      { line: 10, caption: 'bump() returns and its frame (with n) is discarded.', run: (s) => (s.vars = s.vars.filter((x) => x.scope !== 'bump()')) },
      { line: 11, caption: 'Still 29.99: a function can never change a primitive variable it was passed.', log: (s) => print(s, v(s, 'price')) },
    ],
    outro: 'Primitive assignment always copies the value. Mutation-through-another-name can only happen with objects (including arrays and functions).',
  },
  assign: {
    id: 'assign',
    label: 'object assignment',
    code: [
      "const user = { name: 'standard_user', cart: [] };",
      'let alias = user;',
      "alias.name = 'locked_out_user';",
      'console.log(user.name);',
      'console.log(alias === user);',
      "alias.cart.push('Backpack');",
      'console.log(user.cart);',
      "alias = { name: 'problem_user' };",
      'console.log(user.name);',
      'console.log(alias === user);',
    ],
    steps: [
      { line: 0, caption: 'The object literal is created on the heap (with its cart array as a second object). user holds a REFERENCE to it, drawn as an arrow.', run: (s) => (user(s, 'u', 'c', 'standard_user'), setVar(s, { name: 'user', ref: 'u', scope: 'global' })) },
      { line: 1, caption: 'let alias = user copies the reference, not the object: two arrows, one object.', run: (s) => setVar(s, { name: 'alias', ref: 'u', scope: 'global' }), predict: 'alias.name is changed next. What will console.log(user.name) print?' },
      { line: 2, caption: 'alias.name = … follows alias\'s arrow and mutates the one shared object.', run: (s) => field(s, 'u', 'name', { v: q('locked_out_user') }) },
      { line: 3, caption: 'user\'s arrow leads to the same object, so user.name is locked_out_user too.', log: (s) => print(s, o(s, 'u').fields[0]) },
      { line: 4, caption: '=== on objects compares references: same arrow target → true.', log: () => 'true' },
      { line: 5, caption: 'Nested data is reached through the same arrows: alias.cart and user.cart are the same array.', run: (s) => arrPush(s, 'c', q('Backpack')) },
      { line: 6, caption: "user.cart shows the item pushed via alias.", log: (s) => cartStr(s, 'user') },
      { line: 7, caption: 'Reassigning alias points its arrow at a brand-new object. That is NOT a mutation; user is unaffected.', run: (s) => (newObj(s, { id: 'n', kind: 'object', fields: [{ k: 'name', v: q('problem_user') }] }), setVar(s, { name: 'alias', ref: 'n', scope: 'global' })), predict: 'alias now points elsewhere. What does console.log(user.name) print?' },
      { line: 8, caption: 'Still locked_out_user: the earlier mutation stays, the reassignment did not touch user.', log: (s) => print(s, o(s, 'u').fields[0]) },
      { line: 9, caption: 'Different objects → false, even if their contents were identical. Use toEqual (deep) not toBe (reference) to compare test data.', log: () => 'false' },
    ],
    outro: 'const user only stops user being re-pointed; the object it points to is still fully mutable (Object.freeze makes it shallow-read-only).',
  },
  spread: {
    id: 'spread',
    label: 'spread (shallow copy)',
    code: [
      "const user = { name: 'standard_user', cart: [] };",
      'const copy = { ...user };',
      "copy.name = 'visual_user';",
      "copy.cart.push('Backpack');",
      'console.log(user.name);',
      'console.log(user.cart);',
      'console.log(copy.cart === user.cart);',
      "copy.cart = [...copy.cart, 'Onesie'];",
      'console.log(user.cart);',
      'console.log(copy.cart === user.cart);',
    ],
    steps: [
      { line: 0, caption: 'user → object; its cart field holds a reference to a separate array object.', run: (s) => (user(s, 'u', 'c', 'standard_user'), setVar(s, { name: 'user', ref: 'u', scope: 'global' })) },
      { line: 1, caption: '{ ...user } builds a NEW object and copies each top-level field: the name string by value, and the cart REFERENCE as-is.', run: (s) => (newObj(s, { id: 'k', kind: 'object', fields: [{ k: 'name', v: q('standard_user') }, { k: 'cart', ref: 'c' }] }), setVar(s, { name: 'copy', ref: 'k', scope: 'global' })) },
      { line: 2, caption: 'copy.name changes only the copy: top-level fields really were copied.', run: (s) => field(s, 'k', 'name', { v: q('visual_user') }), predict: "copy.cart.push('Backpack') runs next. What will console.log(user.cart) print?" },
      { line: 3, caption: 'copy.cart follows the copied reference to the ONE shared array and pushes into it.', run: (s) => arrPush(s, 'c', q('Backpack')) },
      { line: 4, caption: 'user.name is still standard_user.', log: (s) => print(s, o(s, 'u').fields[0]) },
      { line: 5, caption: "…but user.cart now contains 'Backpack': nested objects are shared by a shallow copy.", log: (s) => cartStr(s, 'user') },
      { line: 6, caption: 'Both cart fields point at the same array, so === is true.', log: () => 'true', predict: "copy.cart = [...copy.cart, 'Onesie'] runs next. Does user.cart get 'Onesie'?" },
      { line: 7, caption: 'Array spread builds a NEW array and the assignment re-points copy.cart at it. Nothing is mutated: the immutable-update pattern.', run: (s) => (newObj(s, { id: 'd', kind: 'array', fields: [{ k: '0', v: q('Backpack') }, { k: '1', v: q('Onesie') }] }), field(s, 'k', 'cart', { ref: 'd' })) },
      { line: 8, caption: "user.cart is still just ['Backpack'].", log: (s) => cartStr(s, 'user') },
      { line: 9, caption: 'Now the carts are separate arrays.', log: () => 'false' },
    ],
    outro: 'Spread, Object.assign and Array.from/slice are all shallow (one level). Use structuredClone when the data has nested objects or arrays.',
  },
  clone: {
    id: 'clone',
    label: 'structuredClone (deep)',
    code: [
      "const user = { name: 'error_user', cart: ['Backpack'] };",
      'const clone = structuredClone(user);',
      "clone.cart.push('Bike Light');",
      'console.log(user.cart);',
      'console.log(clone.cart);',
      'console.log(clone.cart === user.cart);',
      'const shallow = { ...user };',
      "shallow.cart.push('Onesie');",
      'console.log(user.cart);',
      'console.log(clone.cart);',
    ],
    steps: [
      { line: 0, caption: 'user → object → cart array holding one item.', run: (s) => (user(s, 'u', 'c', 'error_user', ['Backpack']), setVar(s, { name: 'user', ref: 'u', scope: 'global' })) },
      { line: 1, caption: 'structuredClone walks the whole graph and copies EVERY object it reaches: a new user object AND a new cart array.', run: (s) => (user(s, 'k', 'd', 'error_user', ['Backpack']), setVar(s, { name: 'clone', ref: 'k', scope: 'global' })), predict: "clone.cart.push('Bike Light') runs next. What will console.log(user.cart) print?" },
      { line: 2, caption: "The push follows clone's arrows to clone's own array.", run: (s) => arrPush(s, 'd', q('Bike Light')) },
      { line: 3, caption: "user.cart is unchanged: ['Backpack'].", log: (s) => cartStr(s, 'user') },
      { line: 4, caption: 'clone.cart has both items.', log: (s) => cartStr(s, 'clone'), predict: 'Is clone.cart === user.cart?' },
      { line: 5, caption: 'Two different arrays → false.', log: () => 'false' },
      { line: 6, caption: 'For contrast, a shallow spread copy: a new object whose cart arrow points at user\'s array.', run: (s) => (newObj(s, { id: 'h', kind: 'object', fields: [{ k: 'name', v: q('error_user') }, { k: 'cart', ref: 'c' }] }), setVar(s, { name: 'shallow', ref: 'h', scope: 'global' })), predict: "shallow.cart.push('Onesie'): which carts will contain 'Onesie'?" },
      { line: 7, caption: "The push lands in user's array, shared with shallow.", run: (s) => arrPush(s, 'c', q('Onesie')) },
      { line: 8, caption: "user.cart changed through the shallow copy…", log: (s) => cartStr(s, 'user') },
      { line: 9, caption: '…while the deep clone is completely isolated.', log: (s) => cartStr(s, 'clone') },
    ],
    outro: 'structuredClone (Node 17+, all modern browsers) keeps Dates, Maps, Sets and cycles, but throws DataCloneError on functions. JSON.parse(JSON.stringify(x)) also deep-copies but turns Dates into strings and drops undefined and functions.',
  },
  function: {
    id: 'function',
    label: 'function mutates its argument',
    code: [
      "const baseUser = { name: 'standard_user', cart: [] };",
      'function addToCart(u, item) {',
      '  u.cart.push(item);',
      '  return u;',
      '}',
      "const u1 = addToCart(baseUser, 'Backpack'); // test 1",
      "const u2 = addToCart(baseUser, 'Onesie');   // test 2",
      'console.log(u2.cart.length); // test 2 expects 1',
      'console.log(u1 === u2);',
      "const makeUser = () => ({ ...baseUser, cart: [] });",
      "const u3 = addToCart(makeUser(), 'Onesie'); // fixed",
      'console.log(u3.cart.length);',
    ],
    steps: [
      { line: 0, caption: 'A shared test-data fixture at module level, as often seen in spec files.', run: (s) => (user(s, 'u', 'c', 'standard_user'), setVar(s, { name: 'baseUser', ref: 'u', scope: 'global' })) },
      { line: 5, caption: "Test 1 calls addToCart(baseUser, 'Backpack'). Arguments are passed by SHARING: parameter u gets a copy of the reference.", run: (s) => (setVar(s, { name: 'u', ref: 'u', scope: 'addToCart()' }), setVar(s, { name: 'item', value: q('Backpack'), scope: 'addToCart()' })), predict: 'u.cart.push(item) runs inside the function. Does baseUser change?' },
      { line: 2, caption: "u.cart.push mutates the caller's object: baseUser.cart now holds 'Backpack'.", run: (s) => arrPush(s, 'c', q('Backpack')) },
      { line: 3, caption: 'return u hands back the SAME reference; the function frame is popped and u1 points at baseUser\'s object.', run: (s) => ((s.vars = s.vars.filter((x) => x.scope !== 'addToCart()')), setVar(s, { name: 'u1', ref: 'u', scope: 'global' })) },
      { line: 6, caption: "Test 2 starts and expects a fresh user with an empty cart, then adds 'Onesie'.", run: (s) => (setVar(s, { name: 'u', ref: 'u', scope: 'addToCart()' }), setVar(s, { name: 'item', value: q('Onesie'), scope: 'addToCart()' })), predict: 'How many items will u2.cart hold after this call?' },
      { line: 2, caption: "The push lands in the same array: ['Backpack', 'Onesie']. Test 1's data leaked into test 2.", run: (s) => arrPush(s, 'c', q('Onesie')) },
      { line: 3, caption: 'Returned and assigned to u2: three names, one object.', run: (s) => ((s.vars = s.vars.filter((x) => x.scope !== 'addToCart()')), setVar(s, { name: 'u2', ref: 'u', scope: 'global' })) },
      { line: 7, caption: 'Length 2, test 2 fails, and only when run after test 1: an order-dependent flaky test.', log: (s) => String(cart(s, 'u2').fields.length) },
      { line: 8, caption: 'u1 and u2 are the same object.', log: () => 'true', predict: 'makeUser() builds the data inside a function. How many items will u3.cart hold?' },
      { line: 10, caption: 'The fix: a factory returns a brand-new object on every call. Spread copies name, and cart gets a NEW empty array (spreading alone would share baseUser.cart).', run: (s) => user(s, 'f', 'g', 'standard_user') },
      { line: 10, caption: "addToCart pushes into the fresh array; baseUser's cart is not touched.", run: (s) => (arrPush(s, 'g', q('Onesie')), setVar(s, { name: 'u3', ref: 'f', scope: 'global' })) },
      { line: 11, caption: 'Length 1 regardless of test order: each test owns its data.', log: (s) => String(cart(s, 'u3').fields.length) },
    ],
    outro: 'Build test data per test (a factory or beforeEach), or copy inside helpers with structuredClone(u). Never mutate a shared fixture.',
  },
};

export interface Params {
  scenario: ScenarioId;
}

export function simulate({ scenario }: Params): RefFrame[] {
  const sc = SCENARIOS[scenario];
  const s: State = { vars: [], objs: [], hot: [] };
  const out: string[] = [];
  const frames: RefFrame[] = [];
  const snap = (line: number, caption: string, predict?: string) =>
    frames.push({
      line,
      vars: s.vars.map((x) => ({ ...x })),
      objs: s.objs.map((x) => ({ ...x, fields: x.fields.map((f) => ({ ...f })) })),
      out: [...out],
      hot: [...s.hot],
      caption,
      predict,
    });
  snap(-1, `Scenario: ${sc.label}. Variables live on the left; objects live on the heap on the right and are reached through references (arrows).`);
  for (const st of sc.steps) {
    s.hot = [];
    st.run?.(s);
    if (st.log) out.push(st.log(s));
    snap(st.line, st.log ? `console.log → ${out[out.length - 1]}. ${st.caption}` : st.caption, st.predict);
  }
  s.hot = [];
  snap(-1, sc.outro);
  return frames;
}
