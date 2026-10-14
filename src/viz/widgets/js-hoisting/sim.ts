// Pure simulation of JavaScript's two-phase execution of a script.
// Phase 1 (creation / declaration instantiation): every declaration in the scope is registered
// before any line runs: function declarations get their whole function (the last one with a name
// wins and a same-named var never resets it), var gets undefined, let/const/class are created but
// left UNINITIALISED (temporal dead zone). Phase 2 (execution) runs lines top to bottom; reading a
// TDZ binding (even with typeof) throws ReferenceError. Each snippet's output is checked against
// real Node in tests.
import type { BaseFrame } from '../../core';

export type SnippetId = 'tdz' | 'functions' | 'time' | 'names';
export type Kind = 'var' | 'let' | 'const' | 'function';
export type Phase = 'creation' | 'execution' | 'crashed' | 'done';

export interface Slot {
  name: string;
  kind: Kind;
  /** printed value; TDZ for uninitialised */
  value: string;
}

export const TDZ = '‹uninitialised›';

export interface HoFrame extends BaseFrame {
  phase: Phase;
  line: number;
  mem: Slot[];
  out: { text: string; err?: boolean }[];
  /** binding just written / read */
  hot?: string;
  /** binding read while in the TDZ */
  boom?: string;
}

type Op =
  | { k: 'decl'; line: number; name: string; kind: Kind; value?: string; caption: string; predict?: string }
  | { k: 'run'; line: number; caption: string; predict?: string; set?: [string, string]; read?: string; log?: string; err?: string; crash?: string };

export interface Snippet {
  id: SnippetId;
  label: string;
  code: string[];
  ops: Op[];
  /** caption at the end of phase 1 */
  ready: string;
  readyPredict: string;
  outro: string;
}

const F = (line: number, name: string, value: string, caption: string): Op => ({ k: 'decl', line, name, kind: 'function', value, caption });

export const SNIPPETS: Record<SnippetId, Snippet> = {
  tdz: {
    id: 'tdz',
    label: 'var vs let/const (TDZ)',
    code: ['console.log(score);', 'var score = 90;', 'console.log(score);', "let level = 'smoke';", 'console.log(level);', 'console.log(typeof plan);', "const plan = 'regression';", "console.log('never runs');"],
    ops: [
      { k: 'decl', line: 1, name: 'score', kind: 'var', caption: 'var score is registered and initialised to undefined straight away. The = 90 part waits for phase 2.' },
      { k: 'decl', line: 3, name: 'level', kind: 'let', caption: 'let level is registered too (it IS hoisted) but left uninitialised: it is in the temporal dead zone until its line runs.' },
      { k: 'decl', line: 6, name: 'plan', kind: 'const', caption: 'const plan: same as let, registered and uninitialised.' },
      { k: 'run', line: 0, read: 'score', log: 'undefined', caption: 'score already exists and holds undefined, so reading it early silently gives undefined (no error).' },
      { k: 'run', line: 1, set: ['score', '90'], caption: 'The assignment part of var score = 90 runs now.' },
      { k: 'run', line: 2, read: 'score', log: '90', caption: 'Now 90.' },
      { k: 'run', line: 3, set: ['level', "'smoke'"], caption: "let level = 'smoke' runs: level leaves the TDZ and is initialised.", predict: "typeof is 'safe' for names that were never declared. What does typeof plan do while plan is still in the TDZ?" },
      { k: 'run', line: 4, read: 'level', log: 'smoke', caption: 'Reading level after its line is fine.' },
      { k: 'run', line: 5, read: 'plan', crash: "ReferenceError: Cannot access 'plan' before initialization", caption: 'plan exists but is uninitialised: ANY access throws, even typeof. The uncaught error stops the script.' },
    ],
    ready: 'Phase 1 is done: three names are registered before a single line has run.',
    readyPredict: 'Line 1 reads score before var score = 90. Error or undefined?',
    outro: "Lines 7–8 never ran. var hides early access by giving undefined; let/const make it loud. That is why let/const are preferred.",
  },
  functions: {
    id: 'functions',
    label: 'declaration vs expressions',
    code: [
      'console.log(add(2, 3));',
      'try { multiply(2, 3); } catch (e) { console.log(e.name); }',
      'try { divide(6, 3); } catch (e) { console.log(e.name); }',
      'function add(x, y) { return x + y; }',
      'var multiply = function (x, y) { return x * y; };',
      'const divide = (x, y) => x / y;',
      'console.log(multiply(2, 3), divide(6, 3));',
    ],
    ops: [
      F(3, 'add', 'ƒ add', 'A function DECLARATION is registered with its whole body: add is callable from line 1.'),
      { k: 'decl', line: 4, name: 'multiply', kind: 'var', caption: 'var multiply = function…: only the var is hoisted, as undefined. The function is created when line 5 runs.' },
      { k: 'decl', line: 5, name: 'divide', kind: 'const', caption: 'const divide = () => …: a const, so uninitialised (TDZ).' },
      { k: 'run', line: 0, read: 'add', log: '5', caption: 'add already holds the function: calling before the definition works.' },
      { k: 'run', line: 1, read: 'multiply', err: 'TypeError', caption: 'multiply holds undefined, and calling undefined throws TypeError: multiply is not a function. The catch logs e.name.' },
      { k: 'run', line: 2, read: 'divide', err: 'ReferenceError', caption: "divide is in the TDZ, so even touching it throws ReferenceError (Cannot access 'divide' before initialization)." },
      { k: 'run', line: 3, caption: 'The function declaration line does nothing now: it was fully handled in phase 1.', predict: 'Two assignment lines come next. What will the last line print?' },
      { k: 'run', line: 4, set: ['multiply', 'ƒ anonymous'], caption: 'Now the function expression is created and assigned to multiply.' },
      { k: 'run', line: 5, set: ['divide', 'ƒ arrow'], caption: 'divide is initialised: its TDZ ends here.' },
      { k: 'run', line: 6, log: '6 2', caption: 'Both work after their lines ran.' },
    ],
    ready: 'Registered: add (whole function), multiply (undefined), divide (TDZ).',
    readyPredict: 'Lines 2 and 3 call multiply and divide early. Which error does each throw?',
    outro: 'Declaration: callable early. var + function expression: TypeError (not a function). let/const + arrow: ReferenceError. The error name tells you how it was declared.',
  },
  time: {
    id: 'time',
    label: 'TDZ is about time',
    code: ['function readTimeout() {', '  return timeout;', '}', 'try {', '  readTimeout();', '} catch (e) { console.log(e.name); }', 'const timeout = 30000;', 'console.log(readTimeout());'],
    ops: [
      F(0, 'readTimeout', 'ƒ readTimeout', 'readTimeout is a declaration: registered with its body.'),
      { k: 'decl', line: 6, name: 'timeout', kind: 'const', caption: 'timeout is a const further down: registered, uninitialised.' },
      { k: 'run', line: 0, caption: 'The declaration lines are skipped: readTimeout already exists. Its body mentions timeout, which is fine: nothing is read until it is CALLED.' },
      { k: 'run', line: 4, caption: 'readTimeout() is called from inside try. A new function scope starts.' },
      { k: 'run', line: 1, read: 'timeout', caption: 'return timeout: not in the function scope, so lookup goes outward to the script scope and finds timeout… still in the TDZ.' },
      { k: 'run', line: 5, err: 'ReferenceError', caption: 'A ReferenceError is thrown, caught by the caller, and the catch logs e.name.' },
      { k: 'run', line: 6, set: ['timeout', '30000'], caption: 'const timeout = 30000 runs: the TDZ ends.', predict: 'The SAME function is called again. Does it still throw?' },
      { k: 'run', line: 7, caption: 'readTimeout() is called a second time.' },
      { k: 'run', line: 1, read: 'timeout', caption: 'Same lookup, but now timeout is initialised: it returns 30000.' },
      { k: 'run', line: 7, log: '30000', caption: 'The value comes back and is logged.' },
    ],
    ready: 'Registered: readTimeout (the function) and timeout (TDZ).',
    readyPredict: 'readTimeout is defined ABOVE the const, but called before the const line runs. Does that work?',
    outro: 'The TDZ is about WHEN code runs, not where it is written: a function may mention a later const as long as it is called after that const line executed.',
  },
  names: {
    id: 'names',
    label: 'same names: var vs function',
    code: [
      'console.log(typeof report);',
      "var report = 'ready';",
      'function report() {}',
      'console.log(typeof report);',
      "function pick() { return 'first'; }",
      'console.log(pick());',
      "function pick() { return 'second'; }",
    ],
    ops: [
      F(2, 'report', 'ƒ report', 'Function declarations are instantiated first: report = the function.'),
      { k: 'decl', line: 1, name: 'report', kind: 'var', value: 'ƒ report', caption: 'var report names an existing binding, so nothing changes: a var declaration never resets a function to undefined.' },
      F(4, 'pick', "ƒ pick → 'first'", "pick is registered with the first body…"),
      F(6, 'pick', "ƒ pick → 'second'", '…then the second declaration of pick overwrites it. The last same-named declaration wins, for every call, including calls above it.'),
      { k: 'run', line: 0, read: 'report', log: 'function', caption: 'typeof report is "function": phase 1 left the function there.', predict: "var report = 'ready' runs next. What will the second typeof print?" },
      { k: 'run', line: 1, set: ['report', "'ready'"], caption: "Now the assignment part of the var line runs and replaces the function with a string." },
      { k: 'run', line: 2, caption: 'The function declaration line does nothing in phase 2.' },
      { k: 'run', line: 3, read: 'report', log: 'string', caption: 'typeof report is now "string".' },
      { k: 'run', line: 4, caption: 'Nothing to do: already registered (and already overwritten).', predict: 'pick() is called next. first or second?' },
      { k: 'run', line: 5, read: 'pick', log: 'second', caption: "pick() runs the body that won in phase 1: 'second', even though that declaration sits BELOW the call." },
      { k: 'run', line: 6, caption: 'The second declaration line also does nothing now.' },
    ],
    ready: 'Phase 1 done: report holds the function, pick holds the SECOND body.',
    readyPredict: 'Line 1: typeof report. "undefined" (var) or "function"?',
    outro: 'Interview rule: do phase 1 on paper first (functions get bodies, the last one wins; vars get undefined but never overwrite a function; let/const go into the TDZ), then execute line by line.',
  },
};

export interface Params {
  snippet: SnippetId;
}

export function simulate({ snippet }: Params): HoFrame[] {
  const sn = SNIPPETS[snippet];
  const frames: HoFrame[] = [];
  let mem: Slot[] = [];
  const out: HoFrame['out'] = [];
  let phase: Phase = 'creation';
  const snap = (line: number, caption: string, predict?: string, hot?: string, boom?: string) =>
    frames.push({ phase, line, mem: mem.map((m) => ({ ...m })), out: out.map((o) => ({ ...o })), hot, boom, caption, predict });
  const setMem = (name: string, kind: Kind, value: string) => {
    const i = mem.findIndex((m) => m.name === name);
    if (i >= 0) mem[i] = { name, kind: mem[i].kind === 'function' && kind === 'var' ? 'function' : kind, value };
    else mem = [...mem, { name, kind, value }];
  };

  snap(-1, 'Phase 1, creation: before running anything, the engine scans the whole scope and registers every declaration in memory.');
  for (const op of sn.ops) {
    if (op.k !== 'decl') continue;
    setMem(op.name, op.kind, op.value ?? (op.kind === 'var' ? 'undefined' : op.kind === 'function' ? `ƒ ${op.name}` : TDZ));
    snap(op.line, op.caption, op.predict, op.name);
  }
  phase = 'execution';
  snap(-1, `${sn.ready} Phase 2, execution: now the lines run top to bottom.`, sn.readyPredict);
  for (const op of sn.ops) {
    if (op.k !== 'run') continue;
    const slot = op.read ? mem.find((m) => m.name === op.read) : undefined;
    const inTdz = slot?.value === TDZ;
    if (op.set) {
      const m = mem.find((x) => x.name === op.set![0])!;
      setMem(op.set[0], m.kind, op.set[1]);
    }
    if (op.log) out.push({ text: op.log });
    if (op.err) out.push({ text: op.err, err: true });
    if (op.crash) {
      out.push({ text: `Uncaught ${op.crash}`, err: true });
      phase = 'crashed';
    }
    snap(op.line, op.log ? `console.log → ${op.log}. ${op.caption}` : op.caption, op.predict, op.set?.[0] ?? op.read, inTdz ? op.read : undefined);
    if (phase === 'crashed') break;
  }
  if (phase !== 'crashed') phase = 'done';
  snap(-1, sn.outro);
  return frames;
}
