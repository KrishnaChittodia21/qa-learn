import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, epReps, partOf, partitions, simulate, type PartId, type Params, type Variant } from './sim';

const X0 = 14;
const X1 = 586;
const BREAK = 22;
const LINE_Y = 120;
const TONE: Record<PartId, string> = { Q: 'bad', P: 'good', R: 'bad' };

/** integers drawn on the (broken) axis: windows around 0, min, max plus the EP representatives */
function axisInts(min: number, max: number): number[] {
  const s = new Set<number>();
  const add = (a: number, b: number) => {
    for (let v = Math.max(0, a); v <= b; v++) s.add(v);
  };
  add(0, 2);
  add(min - 3, min + 3);
  add(max - 3, max + 3);
  epReps(partitions(min, max)).forEach((r) => s.add(r));
  return [...s].sort((a, b) => a - b);
}

export default function BvaEpViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const { min, variant } = params;
  const max = Math.max(params.max, min);
  const parts = partitions(min, max);

  const ints = axisInts(min, max);
  const breaks = ints.filter((v, k) => k > 0 && v - ints[k - 1] > 1).length;
  const u = (X1 - X0 - 18 - breaks * BREAK) / ints.length;
  const xs = new Map<number, number>();
  let x = X0;
  ints.forEach((v, k) => {
    if (k > 0 && v - ints[k - 1] > 1) x += BREAK;
    xs.set(v, x + u / 2);
    x += u;
  });
  const px = (v: number) => xs.get(v) ?? 0;
  const shown = (v: number) => f.shown.includes(partOf(v, parts));
  const T = f.table;
  const tw = T ? Math.min(46, (590 - 76) / T.length) : 0;

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Slider label="Valid min" value={min} min={1} max={40} onChange={(v) => setParams((p) => ({ ...p, min: v, max: Math.max(p.max, v) }))} />
          <Slider label="Valid max" value={max} min={1} max={99} onChange={(v) => setParams((p) => ({ ...p, max: v, min: Math.min(p.min, v) }))} />
          <Choice<Variant>
            label="BVA variant"
            value={variant}
            options={[
              { value: '2', label: '2-value' },
              { value: '3', label: '3-value' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, variant: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good-soft)', border: '1px solid var(--good)' }} /> valid partition
          <span className="viz-key" style={{ background: 'var(--bad-soft)', border: '1px solid var(--bad)' }} /> invalid partition
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> EP representative
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> BVA coverage item
          <span className="viz-key ring" /> boundary value
        </>
      }
    >
      <svg
        viewBox="0 40 600 300"
        className="viz-svg"
        role="img"
        aria-label={`Valid range ${min} to ${max}. ${f.shown.length} partitions shown, EP values ${f.ep.join(', ') || 'none'}, BVA values ${f.bva.join(', ') || 'none'}.`}
      >
        {/* partition bands */}
        {ints.map((v, k) => {
          const pid = partOf(v, parts);
          const on = shown(v);
          const gapBefore = k > 0 && v - ints[k - 1] > 1;
          const samePrev = gapBefore && partOf(ints[k - 1], parts) === pid;
          return (
            <g key={v}>
              {samePrev && (
                <rect x={px(ints[k - 1]) + u / 2} y={LINE_Y - 18} width={BREAK} height={36} fill={on ? `var(--${TONE[pid]}-soft)` : 'var(--surface-2)'} opacity={0.6} style={{ transition: 'fill 0.4s ease' }} />
              )}
              <rect x={px(v) - u / 2} y={LINE_Y - 18} width={u + 0.5} height={36} fill={on ? `var(--${TONE[pid]}-soft)` : 'var(--surface-2)'} style={{ transition: 'fill 0.4s ease' }} />
            </g>
          );
        })}
        {parts.map((p) => {
          const vs = ints.filter((v) => partOf(v, parts) === p.id);
          if (!vs.length) return null;
          const cx = (px(vs[0]) + px(vs[vs.length - 1])) / 2;
          const on = f.shown.includes(p.id);
          return (
            <text key={p.id} x={cx} y={LINE_Y - 24} textAnchor="middle" fontSize={11} fontWeight={700} opacity={on ? 1 : 0} style={{ fill: `var(--${TONE[p.id]})`, transition: 'opacity 0.4s ease' }}>
              {px(vs[vs.length - 1]) - px(vs[0]) < 70 ? p.id : `${p.id}: ${p.hi === null ? `${p.lo}+` : p.lo === p.hi ? p.lo : `${p.lo}–${p.hi}`} ${p.valid ? 'valid' : 'invalid'}`}
            </text>
          );
        })}
        <line x1={X0} x2={X1} y1={LINE_Y} y2={LINE_Y} stroke="var(--text-2)" strokeWidth={1.5} />
        <path d={`M${X1},${LINE_Y - 5} L${X1 + 8},${LINE_Y} L${X1},${LINE_Y + 5}`} fill="var(--text-2)" />
        {ints.map((v, k) =>
          k > 0 && v - ints[k - 1] > 1 ? (
            <text key={'b' + v} x={px(v) - u / 2 - BREAK / 2} y={LINE_Y + 5} textAnchor="middle" fontSize={14} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
              ≈
            </text>
          ) : null,
        )}
        {ints.map((v) => {
          const isB = f.boundaries.includes(v);
          const focus = f.focus === v;
          return (
            <g key={'t' + v}>
              <line x1={px(v)} x2={px(v)} y1={LINE_Y - 4} y2={LINE_Y + 4} stroke="var(--text-2)" />
              <circle cx={px(v)} cy={LINE_Y} r={isB ? (focus ? 8 : 6) : 0} fill="none" stroke={focus ? 'var(--text)' : 'var(--text-2)'} strokeWidth={focus ? 2.5 : 1.5} className="viz-dot" />
              <text x={px(v)} y={LINE_Y + 32} textAnchor="middle" fontSize={u < 22 ? 8.5 : 10} fontWeight={isB ? 700 : 400} style={{ fill: isB ? 'var(--text)' : 'var(--text-2)' }}>
                {v}
              </text>
            </g>
          );
        })}
        {ints.map((v) => {
          const e = f.ep.includes(v);
          const b = f.bva.includes(v);
          const fresh = f.fresh.includes(v);
          return (
            <g key={'d' + v}>
              <line x1={px(v)} x2={px(v)} y1={78} y2={84} stroke="var(--accent)" strokeDasharray="2 2" opacity={e ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }} />
              <circle cx={px(v)} cy={72} r={e ? 7 : 0} fill="var(--accent)" stroke="var(--text)" strokeWidth={fresh && e ? 2 : 0} className="viz-dot" />
              <line x1={px(v)} x2={px(v)} y1={LINE_Y + 36} y2={190} stroke="var(--warn)" strokeDasharray="2 2" opacity={b ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }} />
              <circle cx={px(v)} cy={196} r={b ? 7 : 0} fill="var(--warn)" stroke="var(--text)" strokeWidth={fresh && b ? 2 : 0} className="viz-dot" />
            </g>
          );
        })}
        {/* final table */}
        {T ? (
          <g>
            {['value', 'partition', 'from', 'expect'].map((h, r) => (
              <text key={h} x={12} y={236 + r * 24} fontSize={10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
                {h}
              </text>
            ))}
            {T.map((t, c) => {
              const cx = 76 + c * tw;
              const ok = t.part === 'P';
              return (
                <g key={t.v}>
                  <rect x={cx} y={220} width={tw - 3} height={94} rx={4} fill={ok ? 'var(--good-soft)' : 'var(--bad-soft)'} />
                  <text x={cx + tw / 2 - 1.5} y={236} textAnchor="middle" fontSize={11} fontWeight={700}>
                    {t.v}
                  </text>
                  <text x={cx + tw / 2 - 1.5} y={260} textAnchor="middle" fontSize={10}>
                    {t.part}
                  </text>
                  <text x={cx + tw / 2 - 1.5} y={284} textAnchor="middle" fontSize={tw < 40 ? 8 : 9.5} style={{ fill: t.by === 'BVA' ? 'var(--warn)' : 'var(--accent)' }}>
                    {t.by}
                  </text>
                  <text x={cx + tw / 2 - 1.5} y={308} textAnchor="middle" fontSize={9.5} fontWeight={700} style={{ fill: ok ? 'var(--good)' : 'var(--bad)' }}>
                    {ok ? 'accept' : 'reject'}
                  </text>
                </g>
              );
            })}
            <text x={300} y={334} textAnchor="middle" fontSize={11} fontWeight={700}>
              {T.length} test values · {T.filter((t) => t.part === 'P').length} valid · {T.filter((t) => t.part !== 'P').length} invalid
            </text>
          </g>
        ) : (
          <g>
            <rect x={4} y={222} width={592} height={84} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
            <text x={14} y={242} fontSize={10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
              {variant}-value BVA rule (ISTQB v4.0) · EP values: {f.ep.length} · BVA values: {f.bva.length}
            </text>
            <text x={14} y={262} fontSize={10.5}>
              {variant === '2'
                ? 'For each boundary value: the value + its closest neighbour in the ADJACENT partition.'
                : 'For each boundary value: the value + BOTH neighbours (some items are not boundary values).'}
            </text>
            <text x={14} y={282} fontSize={10.5}>
              Boundary values = min and max of every partition: {f.boundaries.length ? f.boundaries.join(', ') : '(not yet marked)'}
            </text>
            <text x={14} y={300} className="viz-label">
              Coverage = items exercised ÷ items identified. The axis is broken (≈) to zoom on the edges.
            </text>
          </g>
        )}
      </svg>
    </VizFrame>
  );
}
