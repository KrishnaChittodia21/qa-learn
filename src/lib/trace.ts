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
