import { pctOf, useTooltip } from './core';
import { ChartTooltip } from './ChartTooltip';
import { Legend } from './Legend';

export interface StackSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * One 100% stacked bar for an ordered part-to-whole. Segments are separated by a
 * 2px surface gap; the legend underneath carries each label, count and share.
 */
export function StackedBar({ segments, unit, ariaLabel }: { segments: StackSegment[]; unit: string; ariaLabel: string }) {
  const { ref: tipRef, tip, bind } = useTooltip();
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="stackbar-wrap" ref={tipRef}>
      <div className="stackbar" role="group" aria-label={ariaLabel}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const share = pctOf(s.value, total);
            return (
              <div
                key={s.label}
                className="stackbar-seg"
                style={{ flexGrow: s.value, background: s.color }}
                tabIndex={0}
                role="img"
                aria-label={`${s.label}: ${s.value} ${unit} (${share}%)`}
                {...bind({ value: `${s.value} ${unit} · ${share}%`, label: s.label, color: s.color })}
              />
            );
          })}
      </div>
      <Legend items={segments.map((s) => ({ label: s.label, color: s.color, value: `${s.value} · ${pctOf(s.value, total)}%` }))} />
      <ChartTooltip tip={tip} />
    </div>
  );
}
