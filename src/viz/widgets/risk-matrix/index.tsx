import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { APPROACH, DEFAULT_PARAMS, ITEMS, fmt, level, simulate, type Alloc, type Change, type Level, type Params } from './sim';

const GX = 58;
const GY = 26;
const C = 42;
const LX = 300;
const LY = 44;
const RH = 31;
const HPX = 6.6; // px per test hour in the allocation bars (capped at 9 h)
const ease = 'transform 0.6s cubic-bezier(.4,0,.2,1), opacity 0.4s ease';

const LV: Record<Level, { c: string; soft: string }> = {
  HIGH: { c: 'var(--bad)', soft: 'var(--bad-soft)' },
  MED: { c: 'var(--warn)', soft: 'var(--warn-soft)' },
  LOW: { c: 'var(--good)', soft: 'var(--good-soft)' },
};
const ALLOC: Record<Alloc, string> = { pending: '', full: '', partial: 'partial', none: 'not tested' };

/** centre of the matrix cell for likelihood l (row, 5 at top) and impact i (column) */
const cell = (l: number, i: number): [number, number] => [GX + (i - 1) * C + C / 2, GY + (5 - l) * C + C / 2];

export default function RiskMatrixViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const ranked = f.order.length > 0;
  const budgetW = 290;
  const scaleB = budgetW / params.hours;

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Slider label="Test time budget" value={params.hours} min={4} max={40} step={2} format={(v) => `${v} h`} onChange={(hours) => setParams((p) => ({ ...p, hours }))} />
          <Choice<Change>
            label="New information"
            value={params.change}
            options={[
              { value: 'none', label: 'none' },
              { value: 'payment', label: 'payment code rewritten' },
              { value: 'coupon', label: 'coupon engine reuses proven lib' },
            ]}
            onChange={(change) => setParams((p) => ({ ...p, change }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> HIGH 15–25
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> MEDIUM 8–14
          <span className="viz-key" style={{ background: 'var(--good)' }} /> LOW 1–7
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> smoke
        </>
      }
    >
      <svg
        viewBox="0 0 600 330"
        className="viz-svg"
        role="img"
        aria-label={`Risk matrix, 5 by 5. ${ITEMS.map((it, k) => `${it.id} ${it.name} score ${f.placed[k].l * f.placed[k].i}${f.hours[k] ? `, ${fmt(f.hours[k])}` : ''}`).join('; ')}. Budget used ${fmt(f.used)} of ${params.hours} h.`}
      >
        {/* matrix */}
        {[5, 4, 3, 2, 1].map((l) =>
          [1, 2, 3, 4, 5].map((i) => {
            const s = l * i;
            const band = LV[level(s)];
            return (
              <g key={`${l}-${i}`}>
                <rect x={GX + (i - 1) * C + 1} y={GY + (5 - l) * C + 1} width={C - 2} height={C - 2} rx={4} fill={f.showBands ? band.soft : 'var(--surface-2)'} stroke="var(--border)" style={{ transition: 'fill 0.5s ease' }} />
                <text x={GX + i * C - 4} y={GY + (6 - l) * C - 5} textAnchor="end" fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
                  {s}
                </text>
              </g>
            );
          }),
        )}
        {[1, 2, 3, 4, 5].map((n) => (
          <g key={n}>
            <text x={GX - 8} y={GY + (5 - n) * C + C / 2 + 4} textAnchor="end" fontSize={10}>
              {n}
            </text>
            <text x={GX + (n - 1) * C + C / 2} y={GY + 5 * C + 14} textAnchor="middle" fontSize={10}>
              {n}
            </text>
          </g>
        ))}
        <text x={GX + 2.5 * C} y={GY + 5 * C + 28} textAnchor="middle" className="viz-label">
          IMPACT (harm if it fails) →
        </text>
        <text x={14} y={GY + 2.5 * C} textAnchor="middle" className="viz-label" transform={`rotate(-90 14 ${GY + 2.5 * C})`}>
          LIKELIHOOD →
        </text>
        <text x={GX} y={324} className="viz-label">
          {f.placed.some((x) => !x.on) ? 'tray: not yet assessed' : ''}
        </text>
        {/* item tokens */}
        {ITEMS.map((it, k) => {
          const pl = f.placed[k];
          const same = ITEMS.map((_, j) => j).filter((j) => f.placed[j].on && f.placed[j].l === pl.l && f.placed[j].i === pl.i);
          const off = same.length > 1 ? (same.indexOf(k) - (same.length - 1) / 2) * 21 : 0;
          const [x, y] = pl.on ? cell(pl.l, pl.i) : [GX + 14 + k * 34, 300];
          const s = pl.l * pl.i;
          const c = f.showBands ? LV[level(s)].c : 'var(--accent)';
          return (
            <g key={it.id} style={{ transform: `translate(${x + off}px, ${y}px)`, transition: ease }} opacity={pl.on ? 1 : 0.55}>
              <circle r={13} fill="none" stroke="var(--accent)" strokeWidth={2} opacity={f.focus === k || f.moved === k ? 1 : 0} strokeDasharray={f.moved === k ? '3 2' : undefined} style={{ transition: 'opacity 0.35s ease' }} />
              <circle r={10} fill={c} stroke="var(--surface-2)" strokeWidth={1.5} style={{ transition: 'fill 0.4s ease' }} />
              <text y={3.5} textAnchor="middle" fontSize={9.5} fontWeight={700} style={{ fill: 'var(--surface-2)' }}>
                {it.id}
              </text>
            </g>
          );
        })}
        {/* priority list */}
        <text x={LX} y={20} fontSize={11} fontWeight={700} opacity={ranked ? 1 : 0.4}>
          Test priority list
        </text>
        <text x={596} y={20} textAnchor="end" className="viz-label">
          {ranked ? 'score · level · test hours' : 'ranked after scoring'}
        </text>
        {ITEMS.map((it, k) => {
          const pos = ranked ? f.order.indexOf(k) : k;
          const s = f.placed[k].l * f.placed[k].i;
          const lv = level(s);
          const a = f.alloc[k];
          const barC = a === 'partial' ? 'var(--warn)' : LV[lv].c;
          return (
            <g key={it.id} style={{ transform: `translate(${LX}px, ${LY + pos * RH}px)`, transition: ease }} opacity={ranked ? 1 : 0.25}>
              <rect x={0} y={-14} width={296} height={RH - 4} rx={6} fill={f.focus === k ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={f.focus === k ? 'var(--accent)' : 'var(--border)'} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
              <text x={8} y={2} fontSize={10.5} fontWeight={700}>
                {ranked ? `#${pos + 1}` : ''} {it.id}
              </text>
              <text x={44} y={2} fontSize={9.5}>
                {it.name}
              </text>
              <text x={162} y={2} fontSize={10} fontWeight={700} style={{ fill: LV[lv].c, transition: 'fill 0.35s ease' }}>
                {s} {lv}
              </text>
              <rect x={208} y={-8} width={Math.min(9, f.hours[k]) * HPX} height={9} rx={3} fill={barC} style={{ transition: 'width 0.5s ease, fill 0.35s ease' }} />
              <text x={290} y={2} textAnchor="end" fontSize={9.5} fontWeight={700} style={{ fill: a === 'none' ? 'var(--bad)' : 'var(--text-2)' }}>
                {a === 'pending' ? '' : a === 'none' ? ALLOC.none : fmt(f.hours[k])}
              </text>
              <text x={44} y={10} fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
                {a === 'full' ? APPROACH[lv] : ALLOC[a]}
              </text>
            </g>
          );
        })}
        {/* budget bar */}
        <text x={LX} y={252} fontSize={10.5}>
          Budget: <tspan fontWeight={700}>{fmt(f.used)}</tspan> of {params.hours} h used
        </text>
        <rect x={LX} y={260} width={budgetW} height={14} rx={4} fill="var(--surface-2)" stroke="var(--border)" />
        <rect x={LX} y={260} width={f.smoke ? Math.min(1, params.hours) * scaleB : 0} height={14} rx={4} fill="var(--muted)" style={{ transition: 'width 0.5s ease' }} />
        {f.order.map((k, n) => {
          const before = 1 + f.order.slice(0, n).reduce((a, j) => a + f.hours[j], 0);
          const lv = level(f.placed[k].l * f.placed[k].i);
          return (
            <rect key={k} x={LX + Math.min(before, params.hours) * scaleB} y={260} width={f.hours[k] * scaleB} height={14} fill={f.alloc[k] === 'partial' ? 'var(--warn)' : LV[lv].c} stroke="var(--surface-2)" strokeWidth={0.8} opacity={0.85} style={{ transition: 'width 0.5s ease, x 0.5s ease' }} />
          );
        })}
        <text x={LX} y={290} className="viz-label">
          smoke → depth by risk → report residual risk
        </text>
      </svg>
    </VizFrame>
  );
}
