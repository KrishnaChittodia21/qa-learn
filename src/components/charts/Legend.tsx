import type { ReactNode } from 'react';

export interface LegendItem {
  label: string;
  color: string;
  /** rect for bars/areas, line for lines */
  kind?: 'rect' | 'line';
  /** optional value shown after the label (direct labelling) */
  value?: ReactNode;
}

/** Swatch mirrors the mark; text stays in text tokens, never the series colour. */
export function Legend({ items, className = '' }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={`chart-legend ${className}`}>
      {items.map((it) => (
        <li key={it.label}>
          <span className={`chart-swatch ${it.kind === 'line' ? 'line' : ''}`} style={{ background: it.color }} aria-hidden="true" />
          <span>{it.label}</span>
          {it.value !== undefined && <span className="chart-legend-value">{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}
