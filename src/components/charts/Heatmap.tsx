import type { DayCell } from '../../lib/dashMetrics';
import { useRoving, useTooltip } from './core';
import { ChartTooltip } from './ChartTooltip';
import { Legend } from './Legend';

const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const fmt = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * Calendar of study days: columns are weeks (oldest left), rows Monday → Sunday.
 * Activity is yes/no per day, so one filled step on an empty track; today is ringed.
 * One tab stop; arrow keys move by day (↑ ↓) and week (← →).
 */
export function Heatmap({ weeks, color }: { weeks: DayCell[][]; color: string }) {
  const { ref: tipRef, tip, bind } = useTooltip();
  // column-major flat list so ↓ is the next day and → the same weekday next week
  const cells = weeks.flat();
  const todayIndex = Math.max(0, cells.findIndex((c) => c.today));
  // future days are drawn but not focusable
  const roving = useRoving(todayIndex + 1, { step: 7, initial: todayIndex });
  return (
    <div className="heatmap-wrap" ref={tipRef}>
      <div className="heatmap" role="group" aria-label="Study days, last 12 weeks. Use the arrow keys to move between days." style={{ gridTemplateColumns: `auto repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {WEEKDAYS.map((d, row) => (
          <div key={`l${row}`} className="heatmap-daylabel" style={{ gridColumn: 1, gridRow: row + 1 }} aria-hidden="true">
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const col = Math.floor(i / 7) + 2;
          const row = (i % 7) + 1;
          const label = `${fmt(c.day)}${c.today ? ' (today)' : ''}: ${c.future ? 'upcoming' : c.active ? 'studied' : 'no activity'}`;
          return (
            <div
              key={c.day}
              role="img"
              aria-label={label}
              className={`heatmap-cell ${c.active ? 'on' : ''} ${c.today ? 'today' : ''} ${c.future ? 'future' : ''}`}
              style={{ gridColumn: col, gridRow: row, background: c.future ? 'transparent' : c.active ? color : undefined }}
              {...(c.future ? {} : roving.itemProps(i, i === roving.active))}
              {...bind({
                value: c.future ? 'Upcoming' : c.active ? 'Studied' : 'No activity',
                label: `${fmt(c.day)}${c.today ? ' · today' : ''}`,
                color: c.active ? color : undefined,
              })}
            />
          );
        })}
      </div>
      <Legend
        items={[
          { label: 'No activity', color: 'var(--viz-empty)' },
          { label: 'Studied', color },
        ]}
      />
      <ChartTooltip tip={tip} />
    </div>
  );
}
