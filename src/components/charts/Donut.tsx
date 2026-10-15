import type { ReactNode } from 'react';
import { pctOf, useTooltip } from './core';
import { ChartTooltip } from './ChartTooltip';
import { Legend } from './Legend';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  detail?: string;
}

/**
 * Part-to-whole ring (≤ 6 segments). A 2px surface gap separates segments; the
 * legend beside it carries every label, count and share, so colour is never alone.
 */
export function Donut({
  segments,
  center,
  centerLabel,
  size = 168,
  thickness = 18,
  unit = 'topics',
  ariaLabel,
}: {
  segments: DonutSegment[];
  center: ReactNode;
  centerLabel: string;
  size?: number;
  thickness?: number;
  unit?: string;
  ariaLabel: string;
}) {
  const { ref: tipRef, tip, bind } = useTooltip();
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = (size - thickness) / 2 - 3;
  const circ = 2 * Math.PI * r;
  const shown = segments.filter((s) => s.value > 0);
  const gap = shown.length > 1 ? 2 : 0;
  // cumulative start of each segment along the ring
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((acc, x) => acc + (x.value / Math.max(1, total)) * circ, 0));
  return (
    <div className="donut-wrap" ref={tipRef}>
      <div className="donut" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="group" aria-label={`${ariaLabel}: ${segments.map((s) => `${s.label} ${s.value}`).join(', ')}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {total === 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--viz-empty)" strokeWidth={thickness} />}
            {segments.map((s, i) => {
              if (!s.value) return null;
              const len = (s.value / total) * circ;
              const dash = Math.max(0.5, len - gap);
              const offset = -starts[i];
              const share = pctOf(s.value, total);
              const aria = `${s.label}: ${s.value} ${unit} (${share}%)`;
              return (
                <circle
                  key={s.label}
                  className="donut-seg"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={offset}
                  tabIndex={0}
                  role="img"
                  aria-label={aria}
                  {...bind({ value: `${s.value} ${unit} · ${share}%`, label: s.label, detail: s.detail, color: s.color })}
                />
              );
            })}
          </g>
        </svg>
        <div className="donut-center" aria-hidden="true">
          <div className="donut-value">{center}</div>
          <div className="donut-label">{centerLabel}</div>
        </div>
      </div>
      <Legend
        className="donut-legend"
        items={segments.map((s) => ({ label: s.label, color: s.color, value: `${s.value} · ${pctOf(s.value, total)}%` }))}
      />
      <ChartTooltip tip={tip} />
    </div>
  );
}
