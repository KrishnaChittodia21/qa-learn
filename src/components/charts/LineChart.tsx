import type { PointerEvent } from 'react';
import { useRoving, useTooltip, useWidth, type TipData } from './core';
import { ChartTooltip } from './ChartTooltip';
import { Legend } from './Legend';

export interface LinePoint {
  id: string;
  value: number;
  ariaLabel: string;
  tip: TipData;
}

/**
 * Single-series line on a 0–max scale. A crosshair snaps to the nearest point;
 * the points form one tab stop (← → move between them). Optional reference line.
 */
export function LineChart({
  points,
  max = 100,
  ticks = [0, 50, 100],
  tickFormat = (v: number) => `${v}%`,
  color,
  height = 180,
  reference,
  xLabels,
  seriesLabel = 'Value',
}: {
  points: LinePoint[];
  max?: number;
  ticks?: number[];
  tickFormat?: (v: number) => string;
  color: string;
  height?: number;
  reference?: { value: number; label: string };
  /** labels under the first and last point */
  xLabels?: [string, string];
  /** legend name of the line when a reference line is drawn */
  seriesLabel?: string;
}) {
  const { ref: tipRef, tip, place, hide } = useTooltip();
  const { ref, width } = useWidth<HTMLDivElement>(320);
  const roving = useRoving(points.length);
  const axisW = 34;
  const right = 12;
  const top = 12;
  const bottom = xLabels ? 22 : 8;
  const plotH = height - top - bottom;
  const plotW = Math.max(40, width - axisW - right);
  const x = (i: number) => axisW + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => top + plotH - (Math.max(0, Math.min(max, v)) / max) * plotH;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const hoverIndex = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - r.left) / Math.max(1, r.width);
    return points.length > 1 ? Math.round(rel * (points.length - 1)) : 0;
  };
  const last = points.length - 1;
  return (
    <div className="linechart" ref={tipRef}>
      <div ref={ref}>
        <svg width={width} height={height} className="chart-svg" role="group" aria-label="Line chart">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={axisW} x2={width - right} y1={y(t)} y2={y(t)} className={t === 0 ? 'chart-axis' : 'chart-grid'} />
              <text x={axisW - 6} y={y(t)} dy="0.32em" textAnchor="end" className="chart-tick">
                {tickFormat(t)}
              </text>
            </g>
          ))}
          {reference && (
            <g aria-hidden="true">
              <line x1={axisW} x2={width - right} y1={y(reference.value)} y2={y(reference.value)} className="chart-ref" />
            </g>
          )}
          <line
            x1={x(roving.active)}
            x2={x(roving.active)}
            y1={top}
            y2={top + plotH}
            className="chart-crosshair"
            style={{ opacity: tip ? 1 : 0 }}
          />
          <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="chart-line" />
          {/* crosshair layer: the pointer only has to be nearest in x */}
          <rect
            x={axisW}
            y={top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={(e) => {
              const i = hoverIndex(e);
              // anchor the readout on the snapped point, not the pointer, so it never covers the line there
              const svg = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
              if (svg) place(svg.left + x(i), svg.top + y(points[i].value), { ...points[i].tip, color });
              roving.setActive(i);
            }}
            onPointerLeave={hide}
          />
          {points.map((p, i) => (
            <circle
              key={p.id}
              cx={x(i)}
              cy={y(p.value)}
              r={i === last || (tip && i === roving.active) ? 5 : 4}
              fill={color}
              stroke="var(--surface)"
              strokeWidth={2}
              className="chart-dot"
              role="img"
              aria-label={p.ariaLabel}
              {...roving.itemProps(i, i === roving.active)}
              onFocus={(e) => {
                const b = e.currentTarget.getBoundingClientRect();
                place(b.left + b.width / 2, b.top, { ...p.tip, color });
              }}
              onBlur={hide}
              style={{ pointerEvents: 'none' }}
            />
          ))}
          {points.length > 0 && (
            <text x={x(last)} y={y(points[last].value) - 10} textAnchor={points.length > 1 ? 'end' : 'middle'} className="chart-cap">
              {tickFormat(points[last].value)}
            </text>
          )}
          {xLabels && (
            <>
              <text x={axisW} y={height - 6} className="chart-xlabel" textAnchor="start">
                {xLabels[0]}
              </text>
              <text x={width - right} y={height - 6} className="chart-xlabel" textAnchor="end">
                {xLabels[1]}
              </text>
            </>
          )}
        </svg>
      </div>
      {reference && (
        <Legend
          items={[
            { label: seriesLabel, color, kind: 'line' },
            { label: reference.label, color: 'var(--text-2)', kind: 'line' },
          ]}
        />
      )}
      <ChartTooltip tip={tip} />
    </div>
  );
}
