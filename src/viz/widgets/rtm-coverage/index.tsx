import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, REQ02_CHANGED, REQS, TCS, simulate, type Params, type ReqStatus, type Scenario, type TcStatus, type Trace } from './sim';

const GX = 206;
const CW = 30;
const TOP = 44;
const RH = 32;
const SX = 512;
const cx = (i: number) => GX + i * CW + CW / 2;
const ry = (r: number) => TOP + r * RH;
const T = 'fill 0.35s ease, stroke 0.35s ease, opacity 0.35s ease';

const TC_COL: Record<TcStatus, string> = {
  none: 'var(--border)',
  notrun: 'var(--muted)',
  pass: 'var(--good)',
  fail: 'var(--bad)',
  blocked: 'var(--warn)',
};
const REQ_PILL: Record<ReqStatus, { label: string; c: string; soft: string }> = {
  gap: { label: 'NOT COVERED', c: 'var(--bad)', soft: 'var(--bad-soft)' },
  notrun: { label: 'NOT RUN', c: 'var(--muted)', soft: 'var(--surface-2)' },
  partial: { label: 'IN PROGRESS', c: 'var(--accent)', soft: 'var(--accent-soft)' },
  pass: { label: 'PASS', c: 'var(--good)', soft: 'var(--good-soft)' },
  risk: { label: 'AT RISK', c: 'var(--bad)', soft: 'var(--bad-soft)' },
  blocked: { label: 'BLOCKED', c: 'var(--warn)', soft: 'var(--warn-soft)' },
};

export default function RtmCoverageViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const rowOf = (i: number) => TCS[i].req ?? 5;
  const lastCol = f.cols.length ? Math.max(...f.cols) : 9;
  const firstCol = f.cols.length ? Math.min(...f.cols) : 0;
  const statusText = REQS.map((r, k) => `${r.id} ${REQ_PILL[f.reqStatus[k]].label.toLowerCase()}`).join(', ');

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Scenario>
            label="Scenario"
            value={params.scenario}
            options={[
              { value: 'writing', label: 'writing tests' },
              { value: 'execution', label: 'execution' },
              { value: 'change', label: 'change request' },
            ]}
            onChange={(scenario) => setParams((p) => ({ ...p, scenario }))}
          />
          <Choice<Trace>
            label="Trace"
            value={params.trace}
            options={[
              { value: 'both', label: 'both ways' },
              { value: 'forward', label: 'forward only' },
              { value: 'backward', label: 'backward only' },
            ]}
            onChange={(trace) => setParams((p) => ({ ...p, trace }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> pass
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> fail / gap
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> blocked / orphan / impacted
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> not run
          <span className="viz-key" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }} /> trace
        </>
      }
    >
      <svg
        viewBox="0 0 600 316"
        className="viz-svg"
        role="img"
        aria-label={`Traceability matrix. Coverage ${f.covered} of 5 requirements, ${f.passing} fully passing. ${statusText}.${f.gaps.length ? ' Coverage gap: REQ-CPN-04.' : ''}${f.orphans.length ? ' Orphan test: TC-09.' : ''}`}
      >
        <defs>
          <marker id="rtm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {/* bands: gap rows, orphan columns, trace row/column */}
        {[0, 1, 2, 3, 4].map((r) => (
          <rect key={`g${r}`} x={2} y={ry(r) + 1} width={596} height={RH - 2} rx={5} fill="var(--bad-soft)" opacity={f.gaps.includes(r) ? 1 : 0} style={{ transition: T }} />
        ))}
        {TCS.map((_, i) => (
          <rect key={`o${i}`} x={GX + i * CW + 1} y={22} width={CW - 2} height={ry(6) - 22} rx={5} fill="var(--warn-soft)" opacity={f.orphans.includes(i) ? 1 : 0} style={{ transition: T }} />
        ))}
        <rect x={2} y={3} width={SX - 6} height={RH - 6} rx={5} fill="var(--accent-soft)" opacity={f.row !== null ? 0.9 : 0} style={{ transform: `translateY(${ry(f.row ?? 0)}px)`, transition: 'transform 0.5s ease, opacity 0.35s ease' }} />
        {TCS.map((_, i) => (
          <rect key={`c${i}`} x={GX + i * CW + 3} y={24} width={CW - 6} height={ry(6) - 26} rx={5} fill="var(--accent-soft)" opacity={f.dir === 'bwd' && f.cols.includes(i) ? 0.9 : 0} style={{ transition: T }} />
        ))}
        {/* column headers */}
        <text x={GX - 6} y={36} textAnchor="end" className="viz-label">
          test cases →
        </text>
        {TCS.map((t, i) => (
          <text key={t.id} x={cx(i)} y={36} textAnchor="middle" fontSize={10} fontWeight={700} opacity={f.tc[i] === 'none' ? 0.25 : 1} style={{ fill: f.orphans.includes(i) ? 'var(--warn)' : 'var(--text)', transition: T }}>
            {t.id.slice(3)}
          </text>
        ))}
        <text x={SX + 42} y={36} textAnchor="middle" className="viz-label">
          roll-up
        </text>
        {/* requirement rows */}
        {REQS.map((r, k) => {
          const pill = REQ_PILL[f.reqStatus[k]];
          return (
            <g key={r.id}>
              <line x1={4} x2={596} y1={ry(k)} y2={ry(k)} stroke="var(--border)" strokeWidth={0.6} />
              <text x={8} y={ry(k) + 13} fontSize={10.5} fontWeight={700}>
                {r.id}
                {f.gaps.includes(k) && (
                  <tspan dx={6} fontSize={9.5} style={{ fill: 'var(--bad)' }}>
                    GAP
                  </tspan>
                )}
              </text>
              <text x={8} y={ry(k) + 26} fontSize={9.5} style={{ fill: k === 1 && f.changed ? 'var(--warn)' : 'var(--text-2)' }}>
                {k === 1 && f.changed ? REQ02_CHANGED : r.text}
              </text>
              <rect x={SX} y={ry(k) + 7} width={84} height={18} rx={9} fill={pill.soft} stroke={pill.c} style={{ transition: T }} />
              <text x={SX + 42} y={ry(k) + 19.5} textAnchor="middle" fontSize={9} fontWeight={700} style={{ fill: pill.c, transition: T }}>
                {pill.label}
              </text>
            </g>
          );
        })}
        <line x1={4} x2={596} y1={ry(5)} y2={ry(5)} stroke="var(--border)" strokeWidth={0.6} />
        <text x={8} y={ry(5) + 19} fontSize={10} fontStyle="italic" style={{ fill: 'var(--text-2)' }}>
          (no requirement)
        </text>
        <line x1={4} x2={596} y1={ry(6)} y2={ry(6)} stroke="var(--border)" strokeWidth={0.6} />
        {/* cells */}
        {TCS.map((t, i) => {
          const s = f.tc[i];
          const y = ry(rowOf(i)) + RH / 2;
          const imp = f.impacted.includes(i);
          return (
            <g key={t.id} opacity={s === 'none' ? 0 : 1} style={{ transition: 'opacity 0.4s ease' }}>
              <circle cx={cx(i)} cy={y} r={imp ? 12 : 0} fill="none" stroke="var(--warn)" strokeWidth={2} strokeDasharray="3 2" style={{ transition: 'r 0.35s ease' }} />
              <circle cx={cx(i)} cy={y} r={8} fill={s === 'notrun' ? 'var(--surface-2)' : TC_COL[s]} stroke={TC_COL[s]} strokeWidth={2} style={{ transition: T }} />
              <text x={cx(i)} y={y + 3.5} textAnchor="middle" fontSize={9} fontWeight={700} style={{ fill: s === 'notrun' ? 'var(--muted)' : 'var(--surface-2)' }}>
                {s === 'pass' ? '✓' : s === 'fail' ? '✗' : s === 'blocked' ? '!' : '·'}
              </text>
            </g>
          );
        })}
        {/* trace arrows */}
        {f.dir === 'fwd' && f.row !== null && (
          <line x1={150} x2={f.cols.length ? cx(lastCol) - 10 : SX - 8} y1={ry(f.row) + 6} y2={ry(f.row) + 6} stroke="var(--accent)" strokeWidth={1.6} markerEnd="url(#rtm-arrow)" />
        )}
        {f.dir === 'bwd' && f.cols.length > 0 && (
          <path
            d={`M${cx(firstCol)},40 L${cx(firstCol)},${ry(rowOf(firstCol)) + 6} L${f.row !== null || TCS[firstCol].req !== null ? 150 : cx(firstCol) - 12},${ry(rowOf(firstCol)) + 6}`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.6}
            markerEnd="url(#rtm-arrow)"
          />
        )}
        {/* metrics */}
        {[
          { label: 'Requirement coverage', n: f.covered, c: 'var(--accent)' },
          { label: 'Fully passing', n: f.passing, c: 'var(--good)' },
        ].map((m, k) => (
          <g key={m.label}>
            <text x={8} y={ry(6) + 20 + k * 18} fontSize={10.5}>
              {m.label}: <tspan fontWeight={700}>{m.n}/5 ({m.n * 20}%)</tspan>
            </text>
            <rect x={196} y={ry(6) + 11 + k * 18} width={150} height={10} rx={5} fill="var(--surface-2)" stroke="var(--border)" />
            <rect x={196} y={ry(6) + 11 + k * 18} width={m.n * 30} height={10} rx={5} fill={m.c} style={{ transition: 'width 0.5s ease' }} />
          </g>
        ))}
        <text x={596} y={ry(6) + 20} textAnchor="end" fontSize={10} fontWeight={700} style={{ fill: 'var(--bad)' }} opacity={f.bug ? 1 : 0}>
          {f.bug ?? ''}
        </text>
        <text x={596} y={ry(6) + 38} textAnchor="end" className="viz-label">
          {f.dir === 'fwd' ? 'forward: requirement → tests' : f.dir === 'bwd' ? 'backward: test → requirement' : ''}
        </text>
      </svg>
    </VizFrame>
  );
}
