// Shared chart plumbing (no components here): colour roles, tooltip state, container width, roving focus.
import { useCallback, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';

/** colour roles for marks; the values live in index.css (validated light + dark) */
export const C = {
  series: 'var(--viz-series)',
  weak: 'var(--viz-weak)',
  ord1: 'var(--viz-ord-1)',
  ord2: 'var(--viz-ord-2)',
  ord3: 'var(--viz-ord-3)',
  empty: 'var(--viz-empty)',
} as const;

export interface TipData {
  /** the number, shown strong */
  value: string;
  /** what the number is, shown secondary */
  label: string;
  detail?: string;
  /** series colour for the short line-key */
  color?: string;
}

export interface PlacedTip extends TipData {
  x: number;
  y: number;
  /** container width, for keeping the tooltip inside it */
  w: number;
}

/**
 * One tooltip per chart. Attach `ref` to the positioned wrapper, spread `bind(data)` on each
 * mark (pointer + focus: keyboard focus shows the same readout as hover) and render
 * `<ChartTooltip tip={tip} />`.
 */
export function useTooltip<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [tip, setTip] = useState<PlacedTip | null>(null);
  const place = useCallback((clientX: number, clientY: number, data: TipData) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ ...data, x: clientX - r.left, y: clientY - r.top, w: r.width });
  }, []);
  const hide = useCallback(() => setTip(null), []);
  const bind = useCallback(
    (data: TipData) => ({
      onPointerMove: (e: PointerEvent) => place(e.clientX, e.clientY, data),
      onPointerLeave: hide,
      onFocus: (e: FocusEvent<Element>) => {
        const b = e.currentTarget.getBoundingClientRect();
        place(b.left + b.width / 2, b.top, data);
      },
      onBlur: hide,
    }),
    [place, hide],
  );
  return { ref, tip, bind, place, hide };
}

/** width of an element, kept in sync with ResizeObserver */
export function useWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width) || fallback));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return { ref, width };
}

/**
 * Roving tabindex for dense marks (heatmap cells, line points): one tab stop,
 * ←/→ move by `step` (a week in the heatmap), ↑/↓ by one, Home/End to the ends.
 */
export function useRoving(count: number, { step = 1, initial = count - 1 }: { step?: number; initial?: number } = {}) {
  const [active, setActive] = useState(Math.max(0, Math.min(initial, count - 1)));
  const nodes = useRef(new Map<number, HTMLElement | SVGElement>());
  const move = useCallback(
    (to: number) => {
      const i = Math.max(0, Math.min(count - 1, to));
      setActive(i);
      nodes.current.get(i)?.focus();
    },
    [count],
  );
  const itemProps = useCallback(
    (i: number, isActive: boolean) => ({
      ref: (el: HTMLElement | SVGElement | null) => {
        if (el) nodes.current.set(i, el);
        else nodes.current.delete(i);
      },
      tabIndex: isActive ? 0 : -1,
      onKeyDown: (e: KeyboardEvent) => {
        const delta: Record<string, number> = { ArrowRight: step, ArrowLeft: -step, ArrowDown: 1, ArrowUp: -1 };
        if (e.key in delta) move(i + delta[e.key]);
        else if (e.key === 'Home') move(0);
        else if (e.key === 'End') move(count - 1);
        else return;
        e.preventDefault();
      },
      onClick: () => setActive(i),
    }),
    [count, move, step],
  );
  return { active, setActive, itemProps };
}

export const pctOf = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
