import { useState } from 'react';
import { Check, Play } from 'lucide-react';
import type { CodingTest } from '../types';
import { runTests, type RunResult } from '../lib/runCode';

/**
 * Run / Submit buttons plus a per-test result list for a JavaScript function.
 * "Run" executes only the visible tests; "Submit" executes all of them, hidden ones included.
 */
export function TestRunner({
  code,
  fnName,
  tests,
  onAllPassed,
  extraActions,
}: {
  code: string;
  fnName: string;
  tests: CodingTest[];
  onAllPassed?: () => void;
  extraActions?: React.ReactNode;
}) {
  const [run, setRun] = useState<(RunResult & { mode: 'run' | 'submit' }) | null>(null);
  const [busy, setBusy] = useState(false);
  const hasHidden = tests.some((t) => t.hidden);

  const execute = async (mode: 'run' | 'submit') => {
    setBusy(true);
    // keep each test's original index so "Hidden test #n" stays stable between Run and Submit
    const picked = tests.map((t, i) => ({ t, i })).filter((x) => mode === 'submit' || !x.t.hidden);
    const res = await runTests(
      code,
      fnName,
      picked.map((x) => x.t),
    );
    res.results = res.results.map((r, k) => ({ ...r, index: picked[k]?.i ?? r.index }));
    setRun({ ...res, mode });
    setBusy(false);
    if (mode === 'submit' && !res.fatal && res.results.length === tests.length && res.results.every((r) => r.pass)) {
      onAllPassed?.();
    }
  };

  const passed = run?.results.filter((r) => r.pass).length ?? 0;
  const allPassed = !!run && !run.fatal && passed === run.results.length;

  return (
    <div className="test-runner">
      <div className="row gap-s wrap coding-actions">
        {hasHidden && (
          <button className="btn" type="button" disabled={busy} onClick={() => execute('run')}>
            <Play size={15} aria-hidden="true" /> Run examples
          </button>
        )}
        <button className="btn btn-primary" type="button" disabled={busy} onClick={() => execute('submit')}>
          <Check size={15} aria-hidden="true" /> {hasHidden ? `Submit (all ${tests.length} tests)` : `Run all ${tests.length} tests`}
        </button>
        {extraActions}
      </div>

      {run && (
        <div className={`card coding-result ${allPassed ? 'good' : 'bad'}`} aria-live="polite">
          {run.fatal ? (
            <p>
              <strong>⚠ {run.fatal}</strong>
            </p>
          ) : (
            <p>
              <strong>
                {passed}/{run.results.length} tests passed
              </strong>
              {run.mode === 'submit' && allPassed && ' 🎉 All tests pass! Compare with the reference solution.'}
              {run.mode === 'run' && allPassed && ' · now Submit to run the hidden tests.'}
            </p>
          )}
          <ul className="test-results">
            {run.results.map((r) => (
              <li key={r.index} className={r.pass ? 'pass' : 'fail'}>
                <span>{r.pass ? '✓' : '✗'}</span>
                {r.hidden ? (
                  <span className="muted">
                    Hidden test #{r.index + 1}
                    {!r.pass && r.error ? ` threw ${r.error}` : ''}
                  </span>
                ) : (
                  <code>
                    {fnName}({r.args.map((a) => JSON.stringify(a)).join(', ')}) → expected {JSON.stringify(r.expected)}
                    {!r.pass && (r.error ? `, threw ${r.error}` : `, got ${JSON.stringify(r.got)}`)}
                  </code>
                )}
              </li>
            ))}
          </ul>
          {run.logs.length > 0 && (
            <>
              <div className="label">Console</div>
              <pre className="console-out">{run.logs.join('\n')}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
