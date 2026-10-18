import { type CSSProperties, type ReactNode } from 'react';
import { Check, Play } from 'lucide-react';
import type { CodingTest } from '../types';
import { runSummary, useTestRun, type RunRecord } from '../lib/testRun';

const fmt = (v: unknown) => {
  if (v === '(undefined)') return 'undefined';
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
};
const pad = (n: number) => String(n).padStart(2, '0');

/** Expected/received with the differing array items marked (whole value when not two arrays). */
function DiffValue({ value, other }: { value: unknown; other: unknown }) {
  if (Array.isArray(value) && Array.isArray(other)) {
    return (
      <>
        [
        {value.map((x, i) => (
          <span key={i}>
            {i > 0 && ', '}
            {fmt(x) === fmt(other[i]) ? fmt(x) : <mark>{fmt(x)}</mark>}
          </span>
        ))}
        ]
      </>
    );
  }
  return fmt(value) === fmt(other) ? <>{fmt(value)}</> : <mark>{fmt(value)}</mark>;
}

/** The dark-island test console: ✓/✗ lines, expected/received diff, summary bar, session run history. */
export function RunnerConsole({
  run,
  busy,
  fnName,
  tests,
  history,
  className = '',
}: {
  run: RunRecord | null;
  busy: boolean;
  fnName: string;
  tests: CodingTest[];
  history?: RunRecord[];
  className?: string;
}) {
  const hidden = tests.filter((t) => t.hidden).length;
  const visible = tests.length - hidden;
  const s = runSummary(run);
  const failLabel = run?.fatal ? 'error' : `${s.failed} failed`;

  return (
    <section className={`panel tr-panel ${className}`} data-theme="dark" aria-label="Test runner">
      <div className="tr-head">
        <span className="tr-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="tr-ttl">test runner{run ? ` — run #${run.no}` : ''}</span>
        {busy ? (
          <span className="chip run">running</span>
        ) : run ? (
          s.all ? (
            <span className="chip pass">{run.mode === 'submit' ? 'all pass' : 'visible pass'}</span>
          ) : (
            <span className="chip fail glitch" data-text={failLabel}>
              {failLabel}
            </span>
          )
        ) : (
          <span className="chip skip">idle</span>
        )}
      </div>

      <div className="tr-body runner" aria-live="polite">
        <div className="tr-cmd">
          <span>$</span> qa-learn test {fnName} {run?.mode === 'submit' ? '--all' : '--visible'}
        </div>
        {!run && !busy && (
          <div className="tr-info">
            {visible} visible tests{hidden ? ` · ${hidden} hidden run on Submit` : ''}. Press Run.
            <span className="caret" aria-hidden="true" />
          </div>
        )}
        {busy && (
          <div className="tr-info">
            Running in a sandboxed worker…
            <span className="caret" aria-hidden="true" />
          </div>
        )}
        {run && !busy && (
          <>
            <div className="tr-info">
              {run.mode === 'submit'
                ? `Running all ${run.total} tests${hidden ? ` (${hidden} hidden)` : ''}`
                : `Running ${visible} visible tests${hidden ? ` · ${hidden} hidden run on Submit` : ''}`}
            </div>
            {run.fatal && (
              <div className="rl fail tr-fatal">
                <span className="m">✗</span>
                <span className="tx">{run.fatal}</span>
                <span className="d" />
              </div>
            )}
            {run.results.map((r, i) => (
              <div key={r.index} className="tr-row" style={{ '--i': i } as CSSProperties}>
                <div className={`rl ${r.pass ? 'pass' : 'fail'}`}>
                  <span className="m" role="img" aria-label={r.pass ? 'passed' : 'failed'}>
                    {r.pass ? '✓' : '✗'}
                  </span>
                  {r.hidden ? (
                    <span className="tx">
                      {pad(r.index + 1)} hidden test{!r.pass && r.error ? ` — threw ${r.error}` : ''}
                    </span>
                  ) : (
                    <span className="tx" title={`${fnName}(${r.args.map(fmt).join(', ')}) → ${fmt(r.expected)}`}>
                      {pad(r.index + 1)} {fnName}({r.args.map(fmt).join(', ')})
                      {r.pass && (
                        <>
                          {' → '}
                          <b>{fmt(r.expected)}</b>
                        </>
                      )}
                    </span>
                  )}
                  <span className="d">{r.hidden ? 'hidden' : ''}</span>
                </div>
                {!r.pass && !r.hidden && (
                  <div className="tr-diff">
                    <div className="dl exp">
                      <span className="sg">−</span>
                      <span className="lb">Expected</span>
                      <span className="vv">
                        <DiffValue value={r.expected} other={r.got} />
                      </span>
                    </div>
                    <div className="dl rec">
                      <span className="sg">+</span>
                      <span className="lb">{r.error ? 'Threw' : 'Received'}</span>
                      <span className="vv">{r.error ? <mark>{r.error}</mark> : <DiffValue value={r.got} other={r.expected} />}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!run.fatal && run.mode === 'run' && hidden > 0 && (
              <div className="rl skip">
                <span className="m">–</span>
                <span className="tx">{hidden} hidden · run on Submit</span>
                <span className="d">skip</span>
              </div>
            )}
            {run.logs.length > 0 && (
              <>
                <div className="mlabel tr-loglabel">
                  Console <b>· {run.logs.length}</b>
                </div>
                <pre className="console-out" data-theme="dark">
                  {run.logs.join('\n')}
                </pre>
              </>
            )}
          </>
        )}
      </div>

      {run && !busy && (
        <div className="tr-sum">
          <div className="tr-bar" aria-hidden="true">
            {s.passed > 0 && <i className="p" style={{ flex: s.passed }} />}
            {s.failed > 0 && <i className="f" style={{ flex: s.failed }} />}
            {s.notRun > 0 && <i className="h" style={{ flex: s.notRun }} />}
          </div>
          <div className="tr-txt">
            <b className="t-pass">{s.passed} passed</b>
            {s.failed > 0 && <b className="t-fail">{s.failed} failed</b>}
            {s.notRun > 0 && <span>{s.notRun} hidden</span>}
            <span className="sp">{run.ms}ms</span>
          </div>
          {run.mode === 'submit' && s.all && <p className="tr-note">All tests pass. Compare with the reference solution.</p>}
          {run.mode === 'run' && s.all && s.notRun > 0 && <p className="tr-note">Visible tests pass. Now Submit to run the hidden ones too.</p>}
        </div>
      )}

      {history && history.length > 0 && (
        <div className="tr-hist">
          <div className="mlabel">
            Run history <b>· this session</b>
          </div>
          <div className="tr-att">
            {history.slice(-3).map((h) => {
              const hs = runSummary(h);
              const n = Math.max(1, h.results.length);
              return (
                <div key={h.no} className={hs.all ? 'ok' : 'bad'}>
                  <div className="r">
                    <span>
                      {h.mode === 'submit' ? 'SUB' : 'RUN'} {h.no}
                    </span>
                    <span>{h.at}</span>
                  </div>
                  <div className="v">
                    {hs.passed}
                    <small>/{h.results.length}</small>
                  </div>
                  <span
                    className="seg thin"
                    style={{ '--n': n, '--v': hs.passed, '--g': hs.all ? 'var(--pass)' : 'var(--fail)' } as CSSProperties}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/** Run / Submit buttons. */
export function TestActions({
  busy,
  hasHidden,
  execute,
  total,
  extra,
}: {
  busy: boolean;
  hasHidden: boolean;
  execute: (mode: 'run' | 'submit') => void;
  total: number;
  extra?: ReactNode;
}) {
  return (
    <div className="tr-actions">
      {hasHidden && (
        <button className="btn" type="button" disabled={busy} onClick={() => execute('run')}>
          <Play size={15} aria-hidden="true" /> Run
        </button>
      )}
      <button className="btn btn-holo" type="button" disabled={busy} onClick={() => execute('submit')}>
        <Check size={15} aria-hidden="true" /> {hasHidden ? `Submit · ${total} tests` : `Run all ${total} tests`}
      </button>
      {extra}
    </div>
  );
}

/** Run / Submit buttons plus the test console (used by the topic code labs). */
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
  extraActions?: ReactNode;
}) {
  const t = useTestRun({ code, fnName, tests, onAllPassed });
  return (
    <div className="test-runner">
      <TestActions busy={t.busy} hasHidden={t.hasHidden} execute={(m) => void t.execute(m)} total={tests.length} extra={extraActions} />
      {(t.run || t.busy) && <RunnerConsole run={t.run} busy={t.busy} fnName={fnName} tests={tests} />}
    </div>
  );
}
