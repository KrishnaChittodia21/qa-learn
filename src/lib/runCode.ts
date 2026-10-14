// Runs a learner's JavaScript function against test cases inside a throwaway Web Worker,
// so an infinite loop or a crash can never freeze the page. The worker is killed after
// `timeoutMs` and on completion.
import type { CodingTest } from '../types';

export interface TestResult {
  index: number;
  hidden: boolean;
  pass: boolean;
  args: unknown[];
  expected: unknown;
  got?: unknown;
  error?: string;
}

export interface RunResult {
  results: TestResult[];
  /** console.log / console.error lines captured while running */
  logs: string[];
  /** a problem that stopped every test: syntax error, missing function, timeout */
  fatal?: string;
}

// Plain JS source for the worker (not bundled; built into a Blob URL at runtime).
const WORKER_SRC = `
const fmt = (v) => {
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};
const deepEqual = (a, b) => {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
};
// normalise the value the same way the expected value was stored (JSON), e.g. undefined → null
const norm = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

self.onmessage = async (e) => {
  const { src, fnName, tests } = e.data;
  const logs = [];
  const capture = (...xs) => { if (logs.length < 200) logs.push(xs.map(fmt).join(' ')); };
  console.log = capture; console.info = capture; console.warn = capture; console.error = capture;
  let fn;
  try {
    fn = new Function(src + '\\n;return typeof ' + fnName + " === 'function' ? " + fnName + ' : undefined;')();
  } catch (err) {
    self.postMessage({ results: [], logs, fatal: 'SyntaxError: ' + err.message });
    return;
  }
  if (!fn) {
    self.postMessage({ results: [], logs, fatal: 'Function "' + fnName + '" is not defined. Keep the starter function name.' });
    return;
  }
  const results = [];
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const args = JSON.parse(JSON.stringify(t.args));
    try {
      const got = await fn(...args);
      let pass = false;
      try { pass = deepEqual(norm(got), norm(t.expected)); } catch { pass = false; }
      results.push({ index: i, hidden: !!t.hidden, pass, args: t.args, expected: t.expected, got: got === undefined ? '(undefined)' : got });
    } catch (err) {
      results.push({ index: i, hidden: !!t.hidden, pass: false, args: t.args, expected: t.expected, error: (err && err.name ? err.name + ': ' : '') + (err && err.message ? err.message : String(err)) });
    }
  }
  self.postMessage({ results, logs });
};
`;

let workerUrl: string | undefined;

export function runTests(src: string, fnName: string, tests: CodingTest[], timeoutMs = 4000): Promise<RunResult> {
  workerUrl ??= URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  const worker = new Worker(workerUrl);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        results: [],
        logs: [],
        fatal: `Timed out after ${timeoutMs / 1000}s. Check for an infinite loop or a Promise that never resolves.`,
      });
    }, timeoutMs);
    worker.onmessage = (e: MessageEvent<RunResult>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ results: [], logs: [], fatal: e.message || 'The code crashed while loading.' });
    };
    worker.postMessage({ src, fnName, tests });
  });
}
