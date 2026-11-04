// Step-through traces of a learner's own solution (the visualiser inside the coding test runner).
// `instrument()` (instrument.ts, loaded only when a trace is asked for) parses the code with acorn and adds a recorder call before every statement:
//   __s(line, "fnName", () => ({ ...every variable in scope }))
// and wraps every returned value in __r(line, "fnName", getter, value). The code then runs in the same
// sandboxed worker as the tests (runCode.ts), which records one snapshot per step for one test.
// TRACE_RUNTIME is that recorder, as plain JS source so the worker (and the unit tests) can load it.

/** one recorded moment: the line about to run (or returning), and every variable in scope then */
export interface TraceStep {
  line: number;
  fn: string;
  vars: Record<string, unknown>;
  /** set on the step where a function returns: its returned value */
  ret?: unknown;
  returned?: boolean;
}

export interface Trace {
  steps: TraceStep[];
  /** what the traced call returned (undefined → "(undefined)", as in the test results) */
  got?: unknown;
  error?: string;
  /** the line that was running when it threw */
  errorLine?: number;
  /** the recorder stopped saving steps after MAX_STEPS; the run itself finished */
  truncated: boolean;
  /** could not run at all: syntax error, missing function, timeout */
  fatal?: string;
}

export const MAX_STEPS = 1200;

/** The recorder, as source. Snapshots are cloned and trimmed so later mutation can't change history. */
export const TRACE_RUNTIME = `
var __T = { steps: [], truncated: false, lastLine: 0 };
var __clone = function (v, d) {
  d = d || 0;
  if (v === undefined) return { __undef: true };
  if (v === null || typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'bigint') return String(v) + 'n';
  if (typeof v === 'function') return { __fn: v.name || 'anonymous' };
  if (d > 3) return { __more: true };
  if (Array.isArray(v)) {
    var a = v.slice(0, 40).map(function (x) { return __clone(x, d + 1); });
    if (v.length > 40) a.push({ __more: v.length - 40 });
    return a;
  }
  if (v instanceof Map) return { __map: Array.from(v).slice(0, 20).map(function (e) { return [__clone(e[0], d + 1), __clone(e[1], d + 1)]; }) };
  if (v instanceof Set) return { __set: Array.from(v).slice(0, 30).map(function (x) { return __clone(x, d + 1); }) };
  if (typeof v === 'object') {
    if (typeof v.then === 'function') return { __promise: true };
    var o = {}; var ks = Object.keys(v).slice(0, 20);
    for (var i = 0; i < ks.length; i++) o[ks[i]] = __clone(v[ks[i]], d + 1);
    return o;
  }
  return String(v);
};
var __snap = function (get) {
  var raw; try { raw = get(); } catch (e) { raw = {}; }
  var out = {};
  for (var k in raw) out[k] = __clone(raw[k]);
  return out;
};
globalThis.__s = function (line, fn, get) {
  __T.lastLine = line;
  if (__T.steps.length >= ${MAX_STEPS}) { __T.truncated = true; return; }
  __T.steps.push({ line: line, fn: fn, vars: __snap(get) });
};
globalThis.__r = function (line, fn, get, value) {
  __T.lastLine = line;
  if (__T.steps.length < ${MAX_STEPS}) __T.steps.push({ line: line, fn: fn, vars: __snap(get), ret: __clone(value), returned: true });
  else __T.truncated = true;
  return value;
};
`;

// ---- where it went wrong ----

/** one wrong part of the result and the step that last wrote it */
export interface CulpritPart {
  /** the array index, or undefined for a whole value */
  index?: number;
  /** index into trace.steps of the step that last changed it (the start, when it never changed) */
  step: number;
  line: number;
  /** still the value it came in with: no line ever changed it */
  never: boolean;
}
export interface Culprit {
  /** the variable that was returned */
  name: string;
  parts: CulpritPart[];
  /** set when the returned array has the wrong number of items */
  length?: { got: number; want: number };
}

const eq = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * For a wrong return: the variable that was returned, and for each wrong part of it (each wrong array cell, or the
 * whole value) the step that last changed it. Uses only the learner's own trace, so it works whatever the approach.
 * Null when there is nothing to point at: it passed, crashed, never returned, or returned an expression, not a variable.
 */
export function whereItWentWrong(trace: Trace, fnName: string, expected: unknown): Culprit | null {
  if (trace.error || trace.fatal) return null;
  const steps = trace.steps;
  let retAt = -1;
  for (let i = steps.length - 1; i >= 0; i--)
    if (steps[i].returned && steps[i].fn === fnName) {
      retAt = i;
      break;
    }
  if (retAt < 0 || eq(steps[retAt].ret, expected)) return null;
  const ret = steps[retAt].ret;
  const name = Object.keys(steps[retAt].vars).find((k) => eq(steps[retAt].vars[k], ret));
  if (!name) return null;
  // the returned variable over time, in this function only (a callback's variable of the same name is another one)
  const own = steps.map((s, i) => ({ s, i })).filter(({ s, i }) => i <= retAt && s.fn === fnName && name in s.vars);
  const first = steps.findIndex((s) => s.fn === fnName);
  const isParam = own.length > 0 && own[0].i === first;
  /** the step where `pick(value)` last changed, among this function's steps */
  const lastChange = (pick: (v: unknown) => unknown) => {
    let at = own[0];
    for (let k = 1; k < own.length; k++) if (!eq(pick(own[k].s.vars[name]), pick(own[k - 1].s.vars[name]))) at = own[k];
    // a step records values before its line runs: the change first shows at `at`, so the line that made it ran just before
    return { step: at.i, line: at.i > 0 ? steps[at.i - 1].line : at.s.line, never: isParam && at.i === own[0].i };
  };
  if (Array.isArray(ret) && Array.isArray(expected)) {
    const parts: CulpritPart[] = [];
    for (let j = 0; j < Math.min(ret.length, expected.length); j++)
      if (!eq(ret[j], expected[j])) parts.push({ index: j, ...lastChange((v) => (Array.isArray(v) ? v[j] : undefined)) });
    return { name, parts, length: ret.length === expected.length ? undefined : { got: ret.length, want: expected.length } };
  }
  return { name, parts: [lastChange((v) => v)] };
}
