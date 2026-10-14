import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, simulate, type Col, type Params, type Scenario, type V } from './sim';

const LX = 6;
const GX = 192;
const GW = 404;
const RH = 24;
const TOP = 30;

const VCOL: Record<V, string> = { T: 'var(--good)', F: 'var(--bad)', '-': 'var(--muted)' };

export default function DecisionTableViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const n = f.conditions.length;
  const cw = Math.min(56, GW / 2 ** n);
  const actTop = TOP + RH * (n + 1) + 10;
  const H = actTop + RH * f.actions.length + 40;

  // slot of each column: visible columns pack left; removed ones slide into the previous visible slot
  const slot = new Map<number, number>();
  let k = -1;
  for (const c of f.cols) {
    if (c.state !== 'gone') k++;
    slot.set(c.id, Math.max(0, k));
  }
  const visible = f.cols.filter((c) => c.state !== 'gone').length;

  const cellFill = (c: Col) =>
    f.hi.includes(c.id)
      ? c.state === 'infeasible' || c.state === 'gone'
        ? 'var(--bad-soft)'
        : c.state === 'merging'
          ? 'var(--warn-soft)'
          : 'var(--accent-soft)'
      : c.state === 'infeasible'
        ? 'var(--bad-soft)'
        : 'var(--surface-2)';

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
              { value: 'login', label: 'login' },
              { value: 'discount', label: 'checkout discount' },
            ]}
            onChange={(scenario) => setParams((p) => ({ ...p, scenario }))}
          />
          <Slider label="Conditions" value={params.n} min={2} max={4} onChange={(n) => setParams((p) => ({ ...p, n }))} format={(v) => `${v} → ${2 ** v} rules`} />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> T
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> F
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> – don't care
          <span className="viz-key" style={{ background: 'var(--bad-soft)', border: '1px solid var(--bad)' }} /> infeasible
          <span className="viz-key" style={{ background: 'var(--warn-soft)', border: '1px solid var(--warn)' }} /> merging
        </>
      }
    >
      <svg viewBox={`0 0 600 ${H}`} className="viz-svg" role="img" aria-label={`Decision table with ${n} conditions: ${visible} of ${2 ** n} rules remain. Phase: ${f.phase}.`}>
        {/* row labels */}
        <text x={LX} y={TOP + 15} fontSize={10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
          Conditions
        </text>
        {f.conditions.map((c, r) => (
          <g key={c}>
            <rect x={LX - 2} y={TOP + RH * (r + 1)} width={GX - LX - 4} height={RH - 2} rx={4} fill={f.phase === 'fill' && r === f.rowsFilled - 1 ? 'var(--accent-soft)' : 'transparent'} style={{ transition: 'fill 0.35s ease' }} />
            <text x={LX + 4} y={TOP + RH * (r + 1) + 15} fontSize={10.5}>
              <tspan fontWeight={700}>C{r + 1}</tspan> {c}
            </text>
          </g>
        ))}
        <line x1={LX} x2={596} y1={actTop - 5} y2={actTop - 5} stroke="var(--border)" strokeWidth={2} />
        {f.actions.map((a, r) => (
          <text key={a} x={LX + 4} y={actTop + RH * r + 15} fontSize={10.5}>
            <tspan fontWeight={700}>A{r + 1}</tspan> {a}
          </text>
        ))}
        {/* columns */}
        {f.cols.map((c) => {
          const gone = c.state === 'gone';
          const label = f.phase === 'final' ? `R${(slot.get(c.id) ?? 0) + 1}` : `R${c.id + 1}`;
          return (
            <g
              key={c.id}
              style={{ transform: `translate(${GX + (slot.get(c.id) ?? 0) * cw}px, 0px)`, opacity: gone ? 0 : 1, transition: 'transform 0.6s cubic-bezier(.4,0,.2,1), opacity 0.5s ease' }}
            >
              <text x={cw / 2} y={TOP + 15} textAnchor="middle" fontSize={cw < 30 ? 9 : 10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
                {label}
              </text>
              {c.vals.map((v, r) => (
                <g key={r}>
                  <rect x={1} y={TOP + RH * (r + 1)} width={cw - 2} height={RH - 2} rx={3} fill={cellFill(c)} stroke={f.hi.includes(c.id) ? 'var(--text-2)' : 'var(--border)'} strokeWidth={0.6} style={{ transition: 'fill 0.35s ease' }} />
                  <text x={cw / 2} y={TOP + RH * (r + 1) + 15} textAnchor="middle" fontSize={12} fontWeight={700} opacity={r < f.rowsFilled ? 1 : 0} style={{ fill: VCOL[v], transition: 'opacity 0.35s ease' }}>
                    {v === '-' ? '–' : v}
                  </text>
                </g>
              ))}
              {f.actions.map((a, r) => {
                const on = c.acts?.includes(a);
                return (
                  <g key={a}>
                    <rect x={1} y={actTop + RH * r} width={cw - 2} height={RH - 2} rx={3} fill={on ? 'var(--accent-soft)' : cellFill(c)} stroke="var(--border)" strokeWidth={0.6} style={{ transition: 'fill 0.35s ease' }} />
                    <text x={cw / 2} y={actTop + RH * r + 15} textAnchor="middle" fontSize={12} fontWeight={700} opacity={on ? 1 : 0} style={{ fill: 'var(--accent)', transition: 'opacity 0.35s ease' }}>
                      ✕
                    </text>
                  </g>
                );
              })}
              {c.state === 'infeasible' && (
                <line x1={2} x2={cw - 2} y1={TOP + RH} y2={actTop + RH * f.actions.length - 2} stroke="var(--bad)" strokeWidth={2} />
              )}
              {c.acts && c.acts.length === 0 && c.state !== 'infeasible' && (
                <text x={cw / 2} y={actTop + RH * f.actions.length + 12} textAnchor="middle" fontSize={9} className="viz-label">
                  none
                </text>
              )}
            </g>
          );
        })}
        <text x={LX} y={H - 8} fontSize={11} fontWeight={700}>
          Rules: {2 ** n} full → {visible} {f.phase === 'final' ? `= ${visible} test cases` : 'remaining'}
        </text>
        <text x={596} y={H - 8} textAnchor="end" className="viz-label">
          {f.phase === 'fill' ? `row ${f.rowsFilled}/${n}: block size ${2 ** (n - f.rowsFilled)}` : f.phase}
        </text>
      </svg>
    </VizFrame>
  );
}
