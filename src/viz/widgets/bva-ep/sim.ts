// Pure simulation of Equivalence Partitioning (EP) and Boundary Value Analysis (BVA) for an
// integer "age" field, following ISTQB CTFL v4.0:
//  - partitions are ordered: Q = {0..min-1} (too young), P = {min..max} (valid), R = {max+1..} (too old)
//  - boundary values are the minimum and maximum of each partition (R is open-ended, so only max+1)
//  - 2-value BVA: each boundary value + its closest neighbour in the adjacent partition
//  - 3-value BVA: each boundary value + both its neighbours (neighbours outside the domain are infeasible)
// No React here.
import type { BaseFrame } from '../../core';

export type Variant = '2' | '3';
export interface Params {
  min: number;
  max: number;
  variant: Variant;
}
export const DEFAULT_PARAMS: Params = { min: 18, max: 60, variant: '3' };

export type PartId = 'Q' | 'P' | 'R';
export interface Partition {
  id: PartId;
  lo: number;
  /** null = unbounded */
  hi: number | null;
  valid: boolean;
  name: string;
}

export interface TestValue {
  v: number;
  part: PartId;
  by: 'EP' | 'BVA' | 'EP+BVA';
}

export interface Frame extends BaseFrame {
  /** partitions revealed so far */
  shown: PartId[];
  /** EP representatives shown */
  ep: number[];
  /** boundary values marked */
  boundaries: number[];
  /** BVA coverage items revealed so far */
  bva: number[];
  /** items added in this frame (to pulse) */
  fresh: number[];
  /** boundary being expanded this frame */
  focus: number | null;
  table: TestValue[] | null;
}

export function partitions(min: number, max: number): Partition[] {
  const out: Partition[] = [];
  if (min > 0) out.push({ id: 'Q', lo: 0, hi: min - 1, valid: false, name: 'too young (invalid)' });
  out.push({ id: 'P', lo: min, hi: max, valid: true, name: 'valid' });
  out.push({ id: 'R', lo: max + 1, hi: null, valid: false, name: 'too old (invalid)' });
  return out;
}

export function partOf(v: number, parts: Partition[]): PartId {
  return parts.find((p) => v >= p.lo && (p.hi === null || v <= p.hi))!.id;
}

/** boundary values: min and max of every partition (unbounded side has none) */
export function boundaryValues(parts: Partition[]): number[] {
  const s = new Set<number>();
  for (const p of parts) {
    s.add(p.lo);
    if (p.hi !== null) s.add(p.hi);
  }
  return [...s].sort((a, b) => a - b);
}

/** coverage items for one boundary value */
export function itemsFor(b: number, parts: Partition[], variant: Variant): number[] {
  const p = parts.find((x) => x.lo === b || x.hi === b)!;
  const isLo = p.lo === b;
  const isHi = p.hi === b;
  const out = [b];
  if (variant === '2') {
    // closest neighbour belonging to the adjacent partition (none at the outer domain edge)
    if (isLo && b - 1 >= 0) out.push(b - 1);
    if (isHi) out.push(b + 1);
  } else {
    if (b - 1 >= 0) out.push(b - 1);
    out.push(b + 1);
  }
  return out.sort((a, c) => a - c);
}

export function epReps(parts: Partition[]): number[] {
  return parts.map((p) => (p.hi === null ? p.lo + 14 : Math.floor((p.lo + p.hi) / 2)));
}

export function simulate({ min, max, variant }: Params): Frame[] {
  max = Math.max(max, min);
  const parts = partitions(min, max);
  const frames: Frame[] = [];
  let shown: PartId[] = [];
  let ep: number[] = [];
  let boundaries: number[] = [];
  let bva: number[] = [];
  const push = (caption: string, extra: Partial<Frame> = {}) =>
    frames.push({ shown: [...shown], ep: [...ep], boundaries: [...boundaries], bva: [...bva], fresh: [], focus: null, table: null, caption, ...extra });

  push(`Requirement: the age field accepts whole numbers from ${min} to ${max}. The input domain is every whole number 0 and up. First, split it into equivalence partitions: sets the system should treat the same way.`);
  for (const p of parts) {
    shown = [...shown, p.id];
    const range = p.hi === null ? `${p.lo} and up` : p.lo === p.hi ? `just ${p.lo}` : `${p.lo}–${p.hi}`;
    push(`Partition ${p.id}: ${range}, ${p.name}. ${p.valid ? 'Every value here should be accepted.' : 'Every value here should be rejected with the same error.'}`,
      p.id === 'R' ? { predict: `There are ${parts.length} partitions. How many test values does EP need for 100% coverage, and which would you pick?` } : {});
  }
  const reps = epReps(parts);
  parts.forEach((p, k) => {
    ep = [...ep, reps[k]];
    push(`EP picks one representative per partition: ${reps[k]} for ${p.id}. Any value in the partition is assumed to behave the same, so one is enough.`, { fresh: [reps[k]] });
  });
  push(`EP done: ${reps.length} values (${reps.join(', ')}) cover all ${parts.length} partitions = 100% EP coverage. Test invalid values one per test case so one error cannot mask another.`);

  const bvs = boundaryValues(parts);
  boundaries = bvs;
  push(`Defects cluster at the edges (>= coded as >). Boundary values are the min and max OF EACH PARTITION: ${bvs.join(', ')}. Partition R has no maximum, so it contributes only ${max + 1}.`, {
    predict: `With ${variant}-value BVA, how many distinct test values will these ${bvs.length} boundary values produce?`,
  });

  for (const b of bvs) {
    const items = itemsFor(b, parts, variant).filter((x) => x >= 0);
    const fresh = items.filter((x) => !bva.includes(x));
    bva = [...new Set([...bva, ...items])].sort((a, c) => a - c);
    const p = parts.find((x) => x.lo === b || x.hi === b)!;
    let why: string;
    if (variant === '2') {
      why = items.length === 1 ? `${b} is at the outer edge of the domain, so it has no neighbour in another partition: 1 item.` : `${b} plus its closest neighbour in the adjacent partition: {${items.join(', ')}}.`;
    } else {
      why = `${b} plus both neighbours: {${items.join(', ')}}${b === 0 ? ' (-1 is infeasible, so it is dropped)' : ''}.`;
    }
    push(`Boundary ${b} (${p.hi === b && p.lo === b ? 'only value' : p.lo === b ? 'min' : 'max'} of ${p.id}): ${why} ${fresh.length ? `New: ${fresh.join(', ')}.` : 'Nothing new: all already covered.'}`, { fresh, focus: b });
  }
  push(
    `${variant}-value BVA union: {${bva.join(', ')}} = ${bva.length} values. ${
      variant === '2'
        ? 'Note this is not 2 × borders: the neighbours ARE the other partitions\' boundary values.'
        : min + 1 <= max
          ? `The inside neighbours ${min + 1} and ${max - 1} catch e.g. "age == ${min}" coded instead of "age >= ${min}", which 2-value (${min - 1}, ${min}) misses. ISTQB expands every partition's boundaries, not just the valid one's.`
          : 'Every partition\'s boundary values are expanded, not just the valid partition\'s.'
    }`,
    { predict: 'Now merge EP and BVA. Which values does the final test set contain, and how many?' },
  );

  const all = new Map<number, TestValue>();
  for (const v of bva) all.set(v, { v, part: partOf(v, parts), by: 'BVA' });
  for (const v of reps) all.set(v, { v, part: partOf(v, parts), by: all.has(v) ? 'EP+BVA' : 'EP' });
  const table = [...all.values()].sort((a, b) => a.v - b.v);
  const valid = table.filter((t) => t.part === 'P').length;
  push(`Final test set: ${table.length} values (${reps.length} EP + ${bva.length} BVA${table.length < reps.length + bva.length ? ', minus overlap' : ''}). ${valid} should be accepted, ${table.length - valid} rejected.`, { table });
  return frames;
}
