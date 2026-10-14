import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { FIXTURES, FIXTURE_SCOPE, simulate, type Kind, type Mode, type Params, type TestStatus } from './sim';

const KIND_COLOR: Record<Kind, string> = {
  worker: 'var(--accent)',
  wfix: 'var(--accent)',
  tfix: 'var(--muted)',
  hook: 'var(--warn)',
  pass: 'var(--good)',
  fail: 'var(--bad)',
  skip: 'var(--muted)',
};
const STATUS_COLOR: Record<TestStatus, { fill: string; stroke: string }> = {
  pending: { fill: 'var(--surface-2)', stroke: 'var(--border)' },
  running: { fill: 'var(--accent-soft)', stroke: 'var(--accent)' },
  passed: { fill: 'var(--good-soft)', stroke: 'var(--good)' },
  failed: { fill: 'var(--bad-soft)', stroke: 'var(--bad)' },
  skipped: { fill: 'var(--surface-2)', stroke: 'var(--muted)' },
};
const LANE_X = 178;
const LANE_W = 420;
const ROW = 18;
const LOG_Y = 74;
const VISIBLE = 14;
const ease = 'fill 0.35s ease, stroke 0.35s ease, opacity 0.35s ease';

export default function PwHooksFixturesViz() {
  const [params, setParams] = useState<Params>({ workers: 2, fail: 'yes', mode: 'default' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const n = params.workers;
  const laneW = LANE_W / n - (n > 1 ? 6 : 0);

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Slider label="Workers" value={n} min={1} max={2} onChange={(v) => setParams((p) => ({ ...p, workers: v }))} />
          <Choice<'no' | 'yes'>
            label="Test 2 fails"
            value={params.fail}
            options={[
              { value: 'no', label: 'no' },
              { value: 'yes', label: 'yes' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, fail: v }))}
          />
          <Choice<Mode>
            label="describe mode"
            value={params.mode}
            options={[
              { value: 'default', label: 'default' },
              { value: 'parallel', label: 'parallel' },
              { value: 'serial', label: 'serial' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, mode: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> worker / worker-scoped fixture
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> test-scoped fixture
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> hook
          <span className="viz-key" style={{ background: 'var(--good)' }} /> test passed
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> test failed
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`Tests: ${f.tests.map((t, i) => `test ${i + 1} ${t.status}`).join(', ')}. beforeAll has run ${f.beforeAllRuns} times.`}
      >
        {/* describe block */}
        <rect x={2} y={4} width={166} height={156} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={12} y={22} fontSize={11} style={{ fontFamily: 'var(--mono)' }}>
          describe('todos')
        </text>
        <text x={12} y={37} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          mode: {params.mode} · workers: {n}
        </text>
        {f.tests.map((t, i) => {
          const c = STATUS_COLOR[t.status];
          return (
            <g key={i}>
              <rect x={12} y={48 + i * 34} width={146} height={28} rx={6} fill={c.fill} stroke={c.stroke} strokeWidth={t.status === 'running' ? 2.5 : 1.5} style={{ transition: ease }} />
              <text x={22} y={66 + i * 34} fontSize={11} fontWeight={700}>
                test {i + 1}
              </text>
              <text x={150} y={66 + i * 34} textAnchor="end" fontSize={9.5} style={{ fill: t.status === 'failed' ? 'var(--bad)' : 'var(--text-2)' }}>
                {t.status}
                {t.worker ? ` · w#${t.worker}` : ''}
              </text>
            </g>
          );
        })}
        {/* counters */}
        <text x={6} y={186} fontSize={11} style={{ fill: 'var(--text-2)' }}>
          beforeAll ran
        </text>
        <text x={160} y={186} textAnchor="end" fontSize={16} fontWeight={800} style={{ fill: 'var(--warn)' }}>
          {f.beforeAllRuns}×
        </text>
        <text x={6} y={210} fontSize={11} style={{ fill: 'var(--text-2)' }}>
          worker processes
        </text>
        <text x={160} y={210} textAnchor="end" fontSize={16} fontWeight={800} style={{ fill: 'var(--accent)' }}>
          {f.slots.reduce((a, s) => a + s.started, 0)}
        </text>
        <text x={6} y={234} fontSize={11} style={{ fill: 'var(--text-2)' }}>
          time
        </text>
        <text x={160} y={234} textAnchor="end" fontSize={16} fontWeight={800}>
          t={f.now}
        </text>
        <text x={6} y={262} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          fixtures: account, browser = worker
        </text>
        <text x={6} y={276} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          page, todoPage = test (todoPage
        </text>
        <text x={6} y={290} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          uses page + account)
        </text>

        {/* worker lanes */}
        {f.slots.map((s, si) => {
          const x0 = LANE_X + si * (laneW + 6);
          const mine = f.lines.filter((l) => l.slot === si);
          const first = Math.max(0, mine.length - VISIBLE);
          const pw = (laneW - 10) / 4;
          return (
            <g key={si}>
              <rect x={x0} y={4} width={laneW} height={332} rx={8} fill="var(--surface)" stroke={s.worker ? 'var(--accent)' : 'var(--border)'} strokeWidth={s.worker ? 1.8 : 1} style={{ transition: ease }} />
              <text x={x0 + 8} y={21} fontSize={11} fontWeight={700}>
                slot {si + 1}: {s.worker ? `worker #${s.worker}` : s.started ? 'no worker (discarded)' : 'idle'}
              </text>
              {FIXTURES.map((fx, k) => {
                const alive = s.alive.includes(fx);
                const wk = FIXTURE_SCOPE[fx] === 'worker';
                return (
                  <g key={fx} style={{ opacity: alive ? 1 : 0.45, transition: ease }}>
                    <rect
                      x={x0 + 5 + k * pw}
                      y={30}
                      width={pw - 4}
                      height={20}
                      rx={10}
                      fill={alive ? (wk ? 'var(--accent-soft)' : 'var(--surface-2)') : 'transparent'}
                      stroke={alive ? (wk ? 'var(--accent)' : 'var(--text-2)') : 'var(--border)'}
                      strokeDasharray={alive ? undefined : '3 3'}
                      style={{ transition: ease }}
                    />
                    <text x={x0 + 5 + k * pw + (pw - 4) / 2} y={44} textAnchor="middle" fontSize={n > 1 ? 8.5 : 10} style={{ fill: alive ? 'var(--text)' : 'var(--muted)' }}>
                      {fx}
                    </text>
                  </g>
                );
              })}
              <line x1={x0 + 6} y1={58} x2={x0 + laneW - 6} y2={58} stroke="var(--border)" />
              {mine.length === 0 && (
                <text x={x0 + laneW / 2} y={120} textAnchor="middle" fontSize={10} className="viz-label">
                  {params.mode === 'parallel' ? 'waiting for work' : 'idle: the describe is one unit of work'}
                </text>
              )}
              {mine.map((l, idx) => {
                const row = idx - first;
                const cur = l.id === f.current;
                return (
                  <g key={l.id} style={{ transform: `translateY(${LOG_Y + row * ROW}px)`, transition: 'transform 0.4s ease, opacity 0.4s ease', opacity: row < 0 ? 0 : 1 }}>
                    <rect x={x0 + 4} y={-12} width={laneW - 8} height={ROW - 2} rx={4} fill={cur ? 'var(--accent-soft)' : 'transparent'} style={{ transition: ease }} />
                    <rect x={x0 + 7} y={-9} width={4} height={11} rx={1.5} fill={KIND_COLOR[l.kind]} />
                    <text x={x0 + 16} y={0} fontSize={n > 1 ? 9.5 : 10.5} fontWeight={l.kind === 'pass' || l.kind === 'fail' || cur ? 700 : 400} style={{ fill: l.kind === 'fail' ? 'var(--bad)' : l.kind === 'pass' ? 'var(--good)' : 'var(--text)', fontFamily: 'var(--mono)' }}>
                      {n > 1 ? l.short : l.text.length > 62 ? l.short : l.text}
                    </text>
                    <text x={x0 + laneW - 8} y={0} textAnchor="end" fontSize={8.5} style={{ fill: 'var(--muted)' }}>
                      {l.t}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </VizFrame>
  );
}
