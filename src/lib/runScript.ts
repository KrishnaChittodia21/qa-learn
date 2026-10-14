// Runs a free-form JavaScript snippet (the Playground) in a throwaway Web Worker and
// collects its console output. Top-level `await` works. The run finishes when the script
// and every timer/promise it started have settled, or after `timeoutMs`.
// Values are printed the way Node prints them, so outputs match the lessons' `// →` comments.

export type LineKind = 'log' | 'info' | 'warn' | 'error';

export interface ScriptLine {
  kind: LineKind;
  text: string;
  /** milliseconds since the run started */
  t: number;
}

export interface ScriptResult {
  lines: ScriptLine[];
  /** uncaught error, with the line number in the learner's code when known */
  error?: { message: string; line?: number };
  timedOut: boolean;
  ms: number;
}

const WORKER_SRC = String.raw`
const MAX_LINES = 500;
const lines = [];
const t0 = performance.now();
const push = (kind, text) => {
  if (lines.length < MAX_LINES) lines.push({ kind, text, t: Math.round(performance.now() - t0) });
  else if (lines.length === MAX_LINES) lines.push({ kind: 'warn', text: '… output truncated after ' + MAX_LINES + ' lines', t: 0 });
};

// ---- Node-like value formatting (util.inspect, simplified) ----
const quote = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
const keyName = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));
function fmt(v, depth, seen) {
  if (v === null) return 'null';
  const t = typeof v;
  if (t === 'undefined') return 'undefined';
  if (t === 'string') return depth === 0 ? v : quote(v);
  if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
  if (t === 'bigint') return v + 'n';
  if (t === 'boolean') return String(v);
  if (t === 'symbol') return v.toString();
  if (t === 'function') {
    const kind = /^class\s/.test(Function.prototype.toString.call(v)) ? 'class' : 'Function';
    return v.name ? '[' + kind + ': ' + v.name + ']' : '[' + kind + ' (anonymous)]';
  }
  if (seen.includes(v)) return '[Circular *1]';
  if (v instanceof Error) return depth === 0 ? v.name + ': ' + v.message : '[' + v.name + ': ' + v.message + ']';
  if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : v.toISOString();
  if (v instanceof RegExp) return String(v);
  if (v instanceof Promise) return 'Promise { <pending or settled> }';
  if (depth > 2) return Array.isArray(v) ? '[Array]' : '[Object]';
  const next = seen.concat([v]);
  const join = (open, items, close) => {
    if (!items.length) return open.trim() + close.trim();
    const one = open + ' ' + items.join(', ') + ' ' + close;
    return one.length <= 72 ? one : open + '\n' + items.map((x) => '  ' + x.replace(/\n/g, '\n  ')).join(',\n') + '\n' + close;
  };
  if (Array.isArray(v)) {
    const items = [];
    let holes = 0;
    const flush = () => { if (holes) { items.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>'); holes = 0; } };
    for (let i = 0; i < v.length; i++) {
      if (!(i in v)) { holes++; continue; }
      flush();
      if (items.length >= 100) { items.push('... ' + (v.length - i) + ' more items'); holes = 0; break; }
      items.push(fmt(v[i], depth + 1, next));
    }
    flush();
    for (const k of Object.keys(v)) if (!/^\d+$/.test(k)) items.push(keyName(k) + ': ' + fmt(v[k], depth + 1, next));
    return join('[', items, ']');
  }
  if (v instanceof Map) return join('Map(' + v.size + ') {', [...v].map(([k, x]) => fmt(k, depth + 1, next) + ' => ' + fmt(x, depth + 1, next)), '}');
  if (v instanceof Set) return join('Set(' + v.size + ') {', [...v].map((x) => fmt(x, depth + 1, next)), '}');
  const proto = Object.getPrototypeOf(v);
  const ctor = proto && proto.constructor && proto.constructor.name;
  const prefix = proto === null ? '[Object: null prototype] ' : ctor && ctor !== 'Object' ? ctor + ' ' : '';
  const items = Object.keys(v).map((k) => keyName(k) + ': ' + fmt(v[k], depth + 1, next));
  return prefix + join('{', items, '}');
}
const fmtArgs = (args) => args.map((a) => fmt(a, 0, [])).join(' ');

for (const kind of ['log', 'info', 'warn', 'error']) console[kind] = (...a) => push(kind, fmtArgs(a));
console.debug = console.log;
console.table = (data) => push('log', fmt(data, 0, []));
const counts = {};
console.count = (label = 'default') => { counts[label] = (counts[label] || 0) + 1; push('log', label + ': ' + counts[label]); };
const timers0 = {};
console.time = (label = 'default') => { timers0[label] = performance.now(); };
console.timeEnd = (label = 'default') => push('log', label + ': ' + (performance.now() - (timers0[label] || 0)).toFixed(3) + 'ms');
console.assert = (cond, ...a) => { if (!cond) push('error', 'Assertion failed' + (a.length ? ': ' + fmtArgs(a) : '')); };

// ---- error line numbers ----
let OFFSET = 0;
const lineOf = (err) => {
  const m = /<anonymous>:(\d+):\d+/.exec((err && err.stack) || '');
  if (!m) return undefined;
  const n = Number(m[1]) - OFFSET;
  return n > 0 ? n : undefined;
};
let firstError;
const report = (err) => {
  const message = err instanceof Error ? err.name + ': ' + err.message : 'Uncaught ' + fmt(err, 1, []);
  const line = err instanceof Error ? lineOf(err) : undefined;
  if (!firstError) firstError = { message, line };
  push('error', 'Uncaught ' + message + (line ? '  (line ' + line + ')' : ''));
};

// ---- track timers so the run ends when nothing is pending ----
const active = new Set();
const realST = setTimeout, realCT = clearTimeout, realSI = setInterval, realCI = clearInterval;
self.setTimeout = (fn, ms, ...args) => {
  const id = realST(() => { active.delete(id); try { if (typeof fn === 'function') fn(...args); } catch (e) { report(e); } }, ms);
  active.add(id);
  return id;
};
self.clearTimeout = (id) => { active.delete(id); realCT(id); };
self.setInterval = (fn, ms, ...args) => {
  const id = realSI(() => { try { fn(...args); } catch (e) { report(e); } }, ms);
  active.add(id);
  return id;
};
self.clearInterval = (id) => { active.delete(id); realCI(id); };
self.addEventListener('unhandledrejection', (e) => { e.preventDefault(); report(e.reason); });

self.onmessage = async (e) => {
  const { code, offset } = e.data;
  OFFSET = offset;
  let main;
  try {
    main = new Function('return (async () => {\n' + code + '\n})();');
  } catch (err) {
    // syntax errors: the browser doesn't give a reliable line here, so report the message only
    firstError = { message: err.name + ': ' + err.message };
    self.postMessage({ lines, error: firstError, ms: 0 });
    return;
  }
  try {
    await main();
  } catch (err) {
    report(err);
  }
  // let the queues drain: finish once no timer is pending for two consecutive checks
  let idle = 0;
  while (idle < 2) {
    await new Promise((r) => realST(r, 10));
    idle = active.size === 0 ? idle + 1 : 0;
  }
  self.postMessage({ lines, error: firstError, ms: Math.round(performance.now() - t0) });
};
`;

// `new Function` adds "function anonymous(\n) {\n" (2 lines) and the async wrapper adds 1,
// so line N of the learner's code is reported as line N + 3.
const LINE_OFFSET = 3;

let workerUrl: string | undefined;

export function runScript(code: string, timeoutMs = 5000): Promise<ScriptResult> {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  const worker = new Worker(workerUrl);
  const started = performance.now();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        lines: [],
        timedOut: true,
        ms: timeoutMs,
        error: {
          message: `Stopped after ${timeoutMs / 1000}s. Look for an infinite loop, a setInterval that is never cleared, or a Promise that never settles.`,
        },
      });
    }, timeoutMs);
    worker.onmessage = (e: MessageEvent<Omit<ScriptResult, 'timedOut'>>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ ...e.data, timedOut: false });
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      e.preventDefault();
      resolve({ lines: [], timedOut: false, ms: Math.round(performance.now() - started), error: { message: e.message || 'The code could not be run.' } });
    };
    worker.postMessage({ code, offset: LINE_OFFSET });
  });
}
