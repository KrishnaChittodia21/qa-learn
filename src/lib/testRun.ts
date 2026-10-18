// Run state for the coding test runner (components/TestRunner.tsx): executes a learner's function
// against its tests in a worker and keeps this session's run history (never saved).
import { useRef, useState } from 'react';
import type { CodingTest } from '../types';
import { runTests, type RunResult } from './runCode';

/** one finished run (session only: kept in component state, never saved) */
export type RunRecord = RunResult & { mode: 'run' | 'submit'; ms: number; no: number; at: string; total: number };

/**
 * Runs a JavaScript function against its tests in a worker.
 * "Run" executes only the visible tests; "Submit" executes all of them, hidden ones included.
 */
export function useTestRun({
  code,
  fnName,
  tests,
  onAllPassed,
}: {
  code: string;
  fnName: string;
  tests: CodingTest[];
  onAllPassed?: () => void;
}) {
  const [run, setRun] = useState<RunRecord | null>(null);
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const counter = useRef(0);
  const hasHidden = tests.some((t) => t.hidden);

  const execute = async (mode: 'run' | 'submit') => {
    setBusy(true);
    // keep each test's original index so "Hidden test #n" stays stable between Run and Submit
    const picked = tests.map((t, i) => ({ t, i })).filter((x) => mode === 'submit' || !x.t.hidden);
    const t0 = performance.now();
    const res = await runTests(
      code,
      fnName,
      picked.map((x) => x.t),
    );
    const ms = Math.max(1, Math.round(performance.now() - t0));
    res.results = res.results.map((r, k) => ({ ...r, index: picked[k]?.i ?? r.index }));
    counter.current += 1;
    const rec: RunRecord = {
      ...res,
      mode,
      ms,
      no: counter.current,
      total: tests.length,
      at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setRun(rec);
    setHistory((h) => [...h, rec].slice(-6));
    setBusy(false);
    if (mode === 'submit' && !res.fatal && res.results.length === tests.length && res.results.every((r) => r.pass)) {
      onAllPassed?.();
    }
  };

  return { run, history, busy, hasHidden, execute };
}

/** Pass / fail / not-run counts of a run. */
export function runSummary(run: RunRecord | null) {
  if (!run) return { passed: 0, failed: 0, notRun: 0, all: false };
  const passed = run.results.filter((r) => r.pass).length;
  const failed = run.fatal ? Math.max(1, run.results.length - passed) : run.results.length - passed;
  const notRun = run.fatal ? 0 : run.total - run.results.length;
  return { passed, failed, notRun, all: !run.fatal && failed === 0 && run.results.length > 0 };
}

