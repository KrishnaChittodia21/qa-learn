// Pure simulation of (a) what for...of, for...in, forEach (and Object.entries) visit, and
// (b) control flow through try / catch / finally.
// Semantics modelled: for...of walks the iterator (values, array indices only); for...in walks
// enumerable string KEYS, including extra own properties; forEach visits indices 0..length-1 and
// cannot break (return only ends the current callback). A plain object is not iterable (TypeError)
// and has no forEach. finally runs after try/catch however they complete; a pending return/throw
// resumes after finally unless finally itself returns (which overrides it).
// Console output of every variant is checked against real Node in tests.
import type { BaseFrame } from '../../core';

export type Mode = 'iterate' | 'errors';
export type Target = 'array' | 'object';
export type Flow = 'ok' | 'throw' | 'return' | 'rethrow' | 'finallyReturn';
export type BlockId = 'try' | 'catch' | 'finally' | 'after' | 'caller';
export type BlockState = 'idle' | 'active' | 'ran' | 'skipped' | 'waiting';

export interface Params {
  mode: Mode;
  target: Target;
  stop: 'no' | 'yes';
  flow: Flow;
}

export interface Item {
  key: string;
  val: string;
  /** array index vs extra own property */
  kind: 'index' | 'prop';
}

export interface Column {
  title: string;
  got: { text: string; bad?: boolean }[];
  state: 'idle' | 'run' | 'done' | 'error' | 'broke';
}

export interface LtFrame extends BaseFrame {
  line: number;
  out: string[];
  // iterate mode
  items: Item[];
  cursor: number;
  cols: Column[];
  col: number;
  // errors mode
  blocks: Record<BlockId, BlockState>;
  at?: BlockId;
  pending?: { kind: 'return' | 'throw'; text: string };
  result?: { kind: 'return' | 'throw'; text: string };
}

// ---- code ------------------------------------------------------------------------------
export function iterCode(target: Target, stop: boolean): string[] {
  if (target === 'object')
    return [
      "const user = { name: 'standard_user', role: 'admin' };",
      'try {',
      '  for (const v of user) console.log(v);',
      '} catch (e) { console.log(e.message); }',
      'for (const k in user) {',
      '  console.log(k, user[k]);',
      '}',
      'try {',
      '  user.forEach((v) => console.log(v));',
      '} catch (e) { console.log(e.message); }',
      'for (const [k, v] of Object.entries(user)) {',
      '  console.log(k, v);',
      '}',
    ];
  const head = ["const browsers = ['chromium', 'firefox', 'webkit'];", "browsers.extra = 'oops';"];
  if (!stop) return [...head, 'for (const b of browsers) {', '  console.log(b);', '}', 'for (const k in browsers) {', '  console.log(k);', '}', 'browsers.forEach((b) => {', '  console.log(b);', '});'];
  return [
    ...head,
    'for (const b of browsers) {',
    "  if (b === 'firefox') break;",
    '  console.log(b);',
    '}',
    'for (const k in browsers) {',
    "  if (browsers[k] === 'firefox') break;",
    '  console.log(k);',
    '}',
    'browsers.forEach((b) => {',
    "  if (b === 'firefox') return; // break = SyntaxError",
    '  console.log(b);',
    '});',
  ];
}

const FN_HEAD = ['function checkout() {', '  try {', "    console.log('try: add to cart');"];
const CALLER = ["try { console.log('result: ' + checkout()); }", "catch (e) { console.log('caller caught: ' + e.message); }"];
const CATCH = ['  } catch (err) {', "    console.log('catch: ' + err.message);"];
const FIN = ['  } finally {', "    console.log('finally: clear cart');"];
const TAIL = ['  }', "  console.log('after try/catch');", "  return 'done';", '}'];
const THROW = "    throw new Error('card declined');";

export const FLOWS: Record<Flow, { label: string; code: string[] }> = {
  ok: { label: 'no error', code: [...FN_HEAD, "    console.log('try: pay');", ...CATCH, ...FIN, ...TAIL, ...CALLER] },
  throw: { label: 'error thrown', code: [...FN_HEAD, THROW, "    console.log('try: pay');", ...CATCH, ...FIN, ...TAIL, ...CALLER] },
  return: { label: 'return inside try', code: [...FN_HEAD, "    return 'paid';", ...CATCH, ...FIN, ...TAIL, ...CALLER] },
  rethrow: { label: 'error rethrown', code: [...FN_HEAD, THROW, ...CATCH, '    throw err;', ...FIN, ...TAIL, ...CALLER] },
  finallyReturn: { label: 'return in finally', code: [...FN_HEAD, THROW, ...CATCH, '    throw err;', ...FIN, "    return 'cleaned up'; // overrides!", ...TAIL, ...CALLER] },
};

export function codeFor(p: Params): string[] {
  return p.mode === 'iterate' ? iterCode(p.target, p.stop === 'yes') : FLOWS[p.flow].code;
}

const IDLE: Record<BlockId, BlockState> = { try: 'idle', catch: 'idle', finally: 'idle', after: 'idle', caller: 'idle' };

export function simulate(p: Params): LtFrame[] {
  const frames: LtFrame[] = [];
  const out: string[] = [];
  let items: Item[] = [];
  let cursor = -1;
  let col = -1;
  let cols: Column[] = [];
  let blocks = { ...IDLE };
  let at: BlockId | undefined;
  let pending: LtFrame['pending'];
  let result: LtFrame['result'];
  const snap = (line: number, caption: string, predict?: string) =>
    frames.push({ line, out: [...out], items: items.map((x) => ({ ...x })), cursor, cols: cols.map((c) => ({ ...c, got: [...c.got] })), col, blocks: { ...blocks }, at, pending, result, caption, predict });

  if (p.mode === 'iterate') {
    const stop = p.stop === 'yes';
    const s = stop ? 1 : 0; // line offset per loop when the `if` line exists
    if (p.target === 'array') {
      cols = [
        { title: 'for...of', got: [], state: 'idle' },
        { title: 'for...in', got: [], state: 'idle' },
        { title: 'forEach', got: [], state: 'idle' },
      ];
      snap(-1, `Three loops over the same array${stop ? ", each trying to stop at 'firefox'" : ''}. Each column records what that loop actually visited.`);
      items = ['chromium', 'firefox', 'webkit'].map((v, i) => ({ key: String(i), val: `'${v}'`, kind: 'index' }));
      snap(0, 'An array is an object with index keys 0, 1, 2 and a length of 3.');
      items.push({ key: 'extra', val: "'oops'", kind: 'prop' });
      snap(1, 'An extra property is added (libraries and polyfills do this). It is NOT an index, so length stays 3.', stop ? undefined : 'Which of the three loops will visit extra?');
      const L = [2, 5 + s, 8 + s * 2];
      // for...of
      col = 0;
      cols[0].state = 'run';
      for (let i = 0; i < 3; i++) {
        cursor = i;
        const v = items[i].val;
        if (stop && i === 1) {
          cols[0].state = 'broke';
          snap(L[0] + 1, `b = ${v} matches: break exits the for...of loop immediately. webkit is never visited.`);
          break;
        }
        out.push(v.slice(1, -1));
        cols[0].got.push({ text: v });
        snap(L[0] + 1 + s, `for...of asks the array's iterator for the next VALUE: b = ${v}.`, i === 0 ? 'for...in comes next on the same array. What will k hold on its first visit?' : undefined);
      }
      if (!stop) {
        cursor = -1;
        cols[0].state = 'done';
        snap(L[0], 'The iterator is done after index 2. for...of never sees extra: the array iterator yields indices 0..length-1 only.');
      }
      // for...in
      col = 1;
      cols[1].state = 'run';
      for (let i = 0; i < 4; i++) {
        cursor = i;
        if (stop && i === 1) {
          cols[1].state = 'broke';
          snap(L[1] + 1, "browsers['1'] is 'firefox': break works in for...in too.");
          break;
        }
        out.push(items[i].key);
        cols[1].got.push({ text: `'${items[i].key}'`, bad: i === 3 });
        snap(
          L[1] + 1 + s,
          i === 3 ? "k = 'extra': for...in enumerates every enumerable string key, so the extra property shows up as if it were an item." : `k = '${items[i].key}': a KEY, and always a string. k + 1 would be '${items[i].key}1', not ${i + 1}.`,
          i === 2 && !stop ? 'The three indices are done. Is the loop finished?' : undefined,
        );
      }
      if (!stop) {
        cursor = -1;
        cols[1].state = 'done';
        snap(L[1], 'for...in finished after 4 keys. Use it for plain objects (or better, Object.entries), never for arrays.');
      }
      // forEach
      col = 2;
      cols[2].state = 'run';
      for (let i = 0; i < 3; i++) {
        cursor = i;
        const v = items[i].val;
        if (stop && i === 1) {
          cols[2].got.push({ text: '(skipped)', bad: true });
          snap(L[2] + 1, "return only ends THIS callback call. forEach doesn't care and calls the callback again for the next index.", 'Will webkit still be logged?');
          continue;
        }
        out.push(v.slice(1, -1));
        cols[2].got.push({ text: v });
        snap(L[2] + 1 + s, `forEach calls the callback with index ${i}: b = ${v}.`);
      }
      cursor = -1;
      cols[2].state = 'done';
      snap(L[2], stop ? 'forEach visited everything: there is no way to break out of it (except throwing). Use for...of when you need break or await.' : 'forEach also ignores extra (it walks 0..length-1). It cannot break, and an await inside its callback does not pause the loop.');
      col = -1;
      snap(-1, stop ? 'for...of and for...in stopped at firefox; forEach only skipped it. In Playwright, iterate with for (const row of await rows.all()) so break and await both work.' : 'Values: for...of. String keys (plus extra props): for...in. forEach: values, but no break and no await.');
    } else {
      cols = [
        { title: 'for...of', got: [], state: 'idle' },
        { title: 'for...in', got: [], state: 'idle' },
        { title: 'forEach', got: [], state: 'idle' },
        { title: 'Object.entries', got: [], state: 'idle' },
      ];
      snap(-1, 'The same loops over a plain object (think: a test user record). Each one is wrapped so an error does not stop the script.');
      items = [
        { key: 'name', val: "'standard_user'", kind: 'prop' },
        { key: 'role', val: "'admin'", kind: 'prop' },
      ];
      snap(0, 'A plain object: two properties, no indices, no length, no iterator.', 'Can for...of loop over it?');
      col = 0;
      cols[0].state = 'error';
      cols[0].got.push({ text: 'TypeError', bad: true });
      snap(2, 'for...of first asks user[Symbol.iterator]. Plain objects do not have one, so it throws a TypeError before visiting anything.');
      out.push('user is not iterable');
      snap(3, 'The catch logs the message.');
      col = 1;
      cols[1].state = 'run';
      snap(4, 'for...in does not need an iterator: it enumerates the object\'s enumerable string keys, in insertion order.');
      for (let i = 0; i < 2; i++) {
        cursor = i;
        out.push(`${items[i].key} ${items[i].val.slice(1, -1)}`);
        cols[1].got.push({ text: `'${items[i].key}'` });
        snap(5, `k = '${items[i].key}', and user[k] reads its value. This is what for...in is for.`, i === 1 ? 'Does a plain object have a forEach method?' : undefined);
      }
      cursor = -1;
      cols[1].state = 'done';
      col = 2;
      cols[2].state = 'error';
      cols[2].got.push({ text: 'TypeError', bad: true });
      snap(8, 'forEach is an ARRAY method. user.forEach is undefined, and calling undefined throws a TypeError.');
      out.push('user.forEach is not a function');
      snap(9, 'The catch logs the message.');
      col = 3;
      cols[3].state = 'run';
      for (let i = 0; i < 2; i++) {
        cursor = i;
        out.push(`${items[i].key} ${items[i].val.slice(1, -1)}`);
        cols[3].got.push({ text: `[${items[i].key}, …]` });
        snap(11, `Object.entries(user) returns an ARRAY of [key, value] pairs, which for...of can walk. Destructuring gives k = '${items[i].key}', v = ${items[i].val}.`);
      }
      cursor = -1;
      cols[3].state = 'done';
      col = -1;
      snap(-1, 'For objects use Object.keys / values / entries with for...of: you get break, await and no inherited-key surprises.');
    }
    return frames;
  }

  // ---------------- error flow ----------------
  const code = FLOWS[p.flow].code;
  const ln = (needle: string, from = 0) => code.findIndex((l, i) => i >= from && l.includes(needle));
  const tryL = ln('try {');
  const catchL = ln('catch (err)');
  const finL = ln('finally');
  const afterL = ln('after try/catch');
  const callerL = ln('result: ');
  const caughtL = ln('caller caught');
  const mark = (b: BlockId, st: BlockState) => (blocks = { ...blocks, [b]: st });
  const go = (b: BlockId) => {
    if (at && blocks[at] === 'active') mark(at, at === 'caller' ? 'waiting' : 'ran');
    at = b;
    mark(b, 'active');
  };
  const log = (s: string) => out.push(s);
  const thrown = p.flow !== 'ok' && p.flow !== 'return';

  snap(-1, `Scenario: ${FLOWS[p.flow].label}. Watch the token move through try → catch → finally and see what the caller finally receives.`);
  go('caller');
  snap(callerL, 'The caller calls checkout() inside its own try. A new function frame starts.');
  go('try');
  snap(tryL, 'Enter the try block.');
  log('try: add to cart');
  snap(tryL + 1, 'First statement runs normally.', p.flow === 'ok' ? 'Nothing will throw in this run. Will the finally block still run?' : p.flow === 'return' ? "Next line is return 'paid'. Will finally still run?" : 'The next line throws. Which lines run next?');
  if (p.flow === 'ok') {
    log('try: pay');
    snap(tryL + 2, 'Second statement runs; the try block completes normally.');
    mark('try', 'ran');
    mark('catch', 'skipped');
    snap(catchL, 'No error was thrown, so the catch block is skipped entirely.');
  } else if (p.flow === 'return') {
    pending = { kind: 'return', text: "'paid'" };
    snap(tryL + 2, "return 'paid' is evaluated, but the function does NOT leave yet: the return is parked as a pending completion because a finally block is waiting.");
    mark('try', 'ran');
    mark('catch', 'skipped');
    snap(catchL, 'A return is not an error, so catch is skipped.');
  } else {
    pending = { kind: 'throw', text: "Error('card declined')" };
    snap(tryL + 2, "throw: execution jumps out of try immediately.", 'Is there anything left in try that will run?');
    if (p.flow === 'throw') snap(tryL + 3, "console.log('try: pay') is skipped: nothing after the throw in try runs.");
    pending = undefined;
    go('catch');
    snap(catchL, 'The catch block receives the error as err; the throw is now handled.');
    log('catch: card declined');
    snap(catchL + 1, 'catch logs err.message.');
    if (p.flow !== 'throw') {
      pending = { kind: 'throw', text: "Error('card declined')" };
      snap(catchL + 2, 'throw err rethrows the same error. It is parked as pending: finally must run first.', p.flow === 'finallyReturn' ? 'finally contains a return. What will the caller receive?' : 'Does the caller see this error?');
    }
  }
  go('finally');
  snap(finL, pending ? `finally runs even though a ${pending.kind} is pending.` : 'finally runs: it always does, error or not.');
  log('finally: clear cart');
  snap(finL + 1, 'The cleanup runs: log out, delete the test booking, close the page.', p.flow === 'ok' || p.flow === 'return' ? "finally is done. Does console.log('after try/catch') run next?" : undefined);
  if (p.flow === 'finallyReturn') {
    pending = { kind: 'return', text: "'cleaned up'" };
    snap(finL + 2, "return inside finally REPLACES the pending throw. The error is silently swallowed, which would turn a failing test green.");
  }
  mark('finally', 'ran');
  if (pending) {
    mark('after', 'skipped');
    at = 'caller';
    result = pending;
    snap(afterL, `finally finished, so the pending ${pending.kind} resumes: the lines after try/catch are skipped and checkout() ${pending.kind === 'return' ? `returns ${pending.text}` : 'throws to its caller'}.`);
    pending = undefined;
  } else {
    go('after');
    log('after try/catch');
    snap(afterL, 'With no pending completion, execution continues after the try statement.');
    result = { kind: 'return', text: "'done'" };
    snap(afterL + 1, "return 'done': there is no finally around this line, so the function returns straight away.");
  }
  go('caller');
  if (result.kind === 'return') {
    log(`result: ${result.text.slice(1, -1)}`);
    snap(callerL, `The caller logs the returned value: result: ${result.text.slice(1, -1)}.`);
    mark('caller', 'ran');
    snap(caughtL, "The caller's catch is skipped: checkout() did not throw.");
  } else {
    snap(callerL, "checkout() threw, so console.log('result: …') never runs.");
    log('caller caught: card declined');
    snap(caughtL, "The caller's catch gets the rethrown error: the failure is reported, not hidden.");
  }
  mark('caller', 'ran');
  at = undefined;
  snap(-1, thrown && p.flow !== 'finallyReturn' && p.flow !== 'throw' ? 'Rethrowing after logging keeps the failure visible to the test runner, and finally still cleaned up.' : p.flow === 'finallyReturn' ? 'Never return from finally: it overrides returns AND throws. Keep finally for cleanup only.' : 'finally ran in every path. Code placed after try/catch only runs when nothing is pending.');
  return frames;
}
