// Pure simulation of risk-based testing (ISTQB CTFL v4.0, 5.2): release items are placed on a
// 5×5 likelihood × impact matrix, scored (L × I, 1–25), banded (low 1–7, medium 8–14, high 15–25),
// ranked into a test priority list, and a time budget is allocated by risk level: smoke first,
// then depth for high risks, key paths for medium, a time-boxed check for low. No React here.
import type { BaseFrame } from '../../core';

export type Change = 'none' | 'payment' | 'coupon';
export interface Params {
  /** team test hours available for this release */
  hours: number;
  /** new information that moves an item's likelihood */
  change: Change;
}
export const DEFAULT_PARAMS: Params = { hours: 24, change: 'payment' };

export type Level = 'HIGH' | 'MED' | 'LOW';
export interface Item {
  id: string;
  name: string;
  l: number;
  i: number;
  why: string;
}

/** the release in the topic's worked example (risk register R1–R6) */
export const ITEMS: Item[] = [
  { id: 'R1', name: 'Payment SDK upgrade', l: 3, i: 5, why: 'a small code change, but money and every customer: impact 5' },
  { id: 'R2', name: 'Coupon engine', l: 4, i: 4, why: 'new, complex rules (stacking, expiry, rounding): likelihood 4' },
  { id: 'R3', name: 'Sort by price', l: 3, i: 3, why: 'decimals, currency and ties can sort wrongly' },
  { id: 'R4', name: 'Save for later', l: 3, i: 3, why: 'items can be lost on login' },
  { id: 'R5', name: 'Listing redesign', l: 4, i: 2, why: 'layout often breaks on mobile, but nobody loses money' },
  { id: 'R6', name: 'Footer links', l: 2, i: 1, why: 'tiny change, almost no harm' },
];

export const level = (score: number): Level => (score >= 15 ? 'HIGH' : score >= 8 ? 'MED' : 'LOW');
/** hours each level needs for its full test approach */
export const DEPTH: Record<Level, number> = { HIGH: 6, MED: 3, LOW: 0.25 };
export const APPROACH: Record<Level, string> = {
  HIGH: 'formal techniques + ET sessions',
  MED: 'key paths + 1 session',
  LOW: '15-min tour',
};
export const SMOKE = 1;

export interface Placed {
  l: number;
  i: number;
  /** false = still in the tray below the matrix */
  on: boolean;
}
export type Alloc = 'pending' | 'full' | 'partial' | 'none';
export interface Frame extends BaseFrame {
  placed: Placed[];
  showBands: boolean;
  /** item indexes in priority order (empty until ranked) */
  order: number[];
  hours: number[];
  alloc: Alloc[];
  /** hours spent so far, including smoke */
  used: number;
  smoke: boolean;
  focus: number | null;
  /** the item whose likelihood changed this sprint */
  moved: number | null;
}

export const fmt = (h: number) => (h < 1 ? `${Math.round(h * 60)} min` : `${Number.isInteger(h) ? h : h.toFixed(1)} h`);

export function simulate(p: Params): Frame[] {
  const frames: Frame[] = [];
  const placed: Placed[] = ITEMS.map((it) => ({ l: it.l, i: it.i, on: false }));
  let showBands = false;
  let order: number[] = [];
  const hours = ITEMS.map(() => 0);
  const alloc: Alloc[] = ITEMS.map(() => 'pending');
  let used = 0;
  let smoke = false;
  let moved: number | null = null;
  const score = (k: number) => placed[k].l * placed[k].i;

  const push = (caption: string, focus: number | null = null, predict?: string) =>
    frames.push({ caption, predict, placed: placed.map((x) => ({ ...x })), showBands, order: [...order], hours: [...hours], alloc: [...alloc], used, smoke, focus, moved });

  push('Six changes are in this release. Risk-based testing asks two questions for each: how LIKELY is it to fail, and how BAD would the failure be? Risk level = likelihood × impact (1–25).');
  ITEMS.forEach((it, k) => {
    placed[k].on = true;
    const s = it.l * it.i;
    push(
      `${it.id} ${it.name}: likelihood ${it.l} × impact ${it.i} = ${s}. ${it.why.charAt(0).toUpperCase() + it.why.slice(1)}.`,
      k,
      k === 0 ? 'The payment SDK change is only a version bump. Where on the matrix should it land?' : undefined,
    );
  });
  showBands = true;
  push('Bands from the risk matrix: HIGH 15–25 (test first, deep), MEDIUM 8–14 (key paths + one exploratory session), LOW 1–7 (smoke-level check, accept residual risk).');

  const rank = () => {
    order = ITEMS.map((_, k) => k).sort((a, b) => score(b) - score(a) || placed[b].i - placed[a].i || a - b);
  };
  rank();
  push(
    `Ranked into a test priority list: ${order.map((k) => `${ITEMS[k].id} (${score(k)})`).join(', ')}. Ties are broken by impact.`,
    null,
    p.change !== 'none' ? 'Risk is not a one-time spreadsheet. What should happen to this list when new information arrives mid-sprint?' : undefined,
  );

  if (p.change !== 'none') {
    const k = p.change === 'payment' ? 0 : 1;
    const before = order.indexOf(k) + 1;
    const oldScore = score(k);
    moved = k;
    placed[k].l = p.change === 'payment' ? 5 : 2;
    rank();
    push(
      p.change === 'payment'
        ? `News at stand-up: the payment integration code was rewritten this sprint, not just bumped. Likelihood 3 → 5, so R1 scores ${score(k)} (was ${oldScore}) and moves from #${before} to #${order.indexOf(k) + 1}.`
        : `News at refinement: the coupon engine now reuses the proven pricing library, so far less new code. Likelihood 4 → 2, so R2 scores ${score(k)} (was ${oldScore}) and drops from #${before} to #${order.indexOf(k) + 1}, out of the HIGH band.`,
      k,
    );
  } else {
    push('No new information this sprint, so the ranking stands. (It is still re-checked at every stand-up: new bugs and changes move items.)');
  }

  // allocation
  smoke = true;
  used = Math.min(SMOKE, p.hours);
  push(`Budget: ${fmt(p.hours)} of test time. Smoke first (${fmt(SMOKE)}): is the build even testable? Only then spend time on depth.`);
  order.forEach((k, pos) => {
    const lv = level(score(k));
    const need = DEPTH[lv];
    const left = p.hours - used;
    let cap: string;
    if (left >= need) {
      hours[k] = need;
      alloc[k] = 'full';
      cap = `#${pos + 1} ${ITEMS[k].id} (${lv}) gets ${fmt(need)}: ${APPROACH[lv]}.`;
    } else if (left >= 0.25) {
      hours[k] = Math.floor(left * 4) / 4;
      alloc[k] = 'partial';
      cap = `#${pos + 1} ${ITEMS[k].id} (${lv}) needs ${fmt(need)} but only ${fmt(hours[k])} is left: a time-boxed check of its most critical path. The rest is residual risk.`;
    } else {
      alloc[k] = 'none';
      cap = `#${pos + 1} ${ITEMS[k].id} (${lv}) gets no time. It is not silently skipped: it goes into the report as untested residual risk.`;
    }
    used += hours[k];
    const predict = pos === 3 ? `${fmt(Math.max(0, p.hours - used))} left for the last two items. What does each get?` : undefined;
    push(cap, k, predict);
  });
  const highs = order.filter((k) => level(score(k)) === 'HIGH');
  const targets = highs.length ? highs : [order[0]];
  /** at most two extra 90-minute sessions per top risk; anything beyond is buffer */
  const extra = Math.min(Math.floor((p.hours - used) / 1.5), targets.length * 2);
  if (extra > 0) {
    for (let n = 0; n < extra; n++) hours[targets[n % targets.length]] += 1.5;
    used += extra * 1.5;
    const buffer = p.hours - used;
    push(
      `${extra} spare 90-minute exploratory session${extra > 1 ? 's go' : ' goes'} to the HIGH risks (${[...new Set(targets.slice(0, extra))].map((k) => ITEMS[k].id).join(', ')}), not spread evenly: depth follows risk.` +
        (buffer >= 1 ? ` The remaining ${fmt(buffer)} is kept as buffer for retests and regression.` : ''),
    );
  }
  const untested = order.filter((k) => alloc[k] !== 'full').map((k) => ITEMS[k].id);
  push(
    untested.length
      ? `Report to the release owner: ${fmt(used)} used. Deeply covered: ${order.filter((k) => alloc[k] === 'full').map((k) => ITEMS[k].id).join(', ') || 'none'}. Residual risk: ${untested.join(', ')} only partly or not tested. Testing informs the decision; it does not make it.`
      : `Report: every item got its full approach in ${fmt(used)}. Residual risk is low, but R6 still had only a tour, which the report says out loud.`,
  );
  return frames;
}
