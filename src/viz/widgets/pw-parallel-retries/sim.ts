// Pure simulation of Playwright Test scheduling: shards (machines) × workers, fullyParallel,
// and retries (playwright.dev/docs/test-parallel, /test-sharding, /test-retries).
// - Without fullyParallel a FILE is the unit: its tests run in order in one worker, and shards
//   split at file level. With fullyParallel each TEST is a unit, for workers and for shards.
// - Shard split: units are taken in order; shard i gets the units whose first test index falls in
//   its slice [from, to) of the test count (the same contiguous slicing Playwright uses).
// - A failure discards the worker; the retry and the rest of that unit go back to the front of
//   the queue and run in a fresh worker (startup cost).
// - Report: passed (first try), flaky (failed, then passed on a retry), failed (all attempts failed).
import { rng, type BaseFrame } from '../../core';

export interface Params {
  workers: number;
  shards: number;
  retries: number;
  fullyParallel: 'off' | 'on';
}
export const DEFAULT_PARAMS: Params = { workers: 2, shards: 1, retries: 1, fullyParallel: 'off' };

export interface TestDef {
  id: number;
  file: number;
  label: string;
  name: string;
  dur: number;
  kind: 'ok' | 'flaky' | 'broken';
}
export const FILES = ['auth.spec.ts', 'cart.spec.ts', 'checkout.spec.ts', 'search.spec.ts'];
const NAMES = [
  ['login works', 'bad password', 'logout'],
  ['add item', 'remove item', 'apply coupon', 'badge count'],
  ['guest checkout', 'pay with saved card', 'address form'],
  ['by name', 'no results'],
];
const PREFIX = ['au', 'ca', 'ch', 'se'];
export const WORKER_START = 0.6;

export const TESTS: TestDef[] = (() => {
  const r = rng(42);
  const out: TestDef[] = [];
  NAMES.forEach((names, file) =>
    names.forEach((name, j) => {
      const id = out.length;
      const kind = file === 1 && j === 2 ? 'flaky' : file === 2 && j === 1 ? 'broken' : 'ok';
      out.push({ id, file, label: `${PREFIX[file]}${j + 1}`, name: `${FILES[file].replace('.spec.ts', '')} › ${name}`, dur: Math.round((1 + r() * 3) * 10) / 10, kind });
    }),
  );
  return out;
})();

export interface Bar {
  shard: number;
  lane: number;
  start: number;
  end: number;
  /** test id, or -1 for a worker start-up block */
  test: number;
  attempt: number;
  ok: boolean;
  worker: number;
}
export type Verdict = 'passed' | 'flaky' | 'failed';
export interface Frame extends BaseFrame {
  now: number;
  /** test ids → verdict once final */
  verdicts: Record<number, Verdict>;
  done: boolean;
}
export interface Plan {
  bars: Bar[];
  shardOf: number[];
  shardEnd: number[];
  wall: number;
  serial: number;
  verdict: Record<number, Verdict>;
}

/** contiguous shard split by test count, over units (files or tests) */
export function shardUnits(units: number[][], shards: number): number[][][] {
  const total = units.reduce((a, u) => a + u.length, 0);
  const size = Math.floor(total / shards);
  const extra = total % shards;
  return Array.from({ length: shards }, (_, i) => {
    const from = size * i + Math.min(extra, i);
    const to = from + size + (i < extra ? 1 : 0);
    let cur = 0;
    const mine: number[][] = [];
    for (const u of units) {
      if (cur >= from && cur < to) mine.push(u);
      cur += u.length;
    }
    return mine;
  });
}

export function plan({ workers, shards, retries, fullyParallel }: Params): Plan {
  const units = fullyParallel === 'on' ? TESTS.map((t) => [t.id]) : FILES.map((_, f) => TESTS.filter((t) => t.file === f).map((t) => t.id));
  const split = shardUnits(units, shards);
  const shardOf: number[] = [];
  split.forEach((us, s) => us.forEach((u) => u.forEach((id) => (shardOf[id] = s))));
  const bars: Bar[] = [];
  const attempts: Record<number, boolean[]> = {};
  const shardEnd: number[] = [];
  let workerSeq = 0;
  split.forEach((us, s) => {
    const lanes = Array.from({ length: workers }, () => ({ free: 0, worker: -1 }));
    // queue entries become available at `avail` (a re-queued retry only after its worker died)
    const queue = us.map((u) => ({ unit: [...u], avail: 0 }));
    while (queue.length) {
      let li = 0;
      for (let i = 1; i < lanes.length; i++) if (lanes[i].free < lanes[li].free) li = i;
      let qi = queue.findIndex((q) => q.avail <= lanes[li].free);
      if (qi < 0) {
        qi = queue.reduce((b, q, i) => (q.avail < queue[b].avail ? i : b), 0);
        const av = queue[qi].avail;
        li = lanes.reduce((b, l, i) => (Math.max(l.free, av) < Math.max(lanes[b].free, av) ? i : b), 0);
      }
      const { unit, avail } = queue.splice(qi, 1)[0];
      const lane = lanes[li];
      let t = Math.max(lane.free, avail);
      if (lane.worker < 0) {
        lane.worker = ++workerSeq;
        bars.push({ shard: s, lane: li, start: t, end: t + WORKER_START, test: -1, attempt: 0, ok: true, worker: lane.worker });
        t += WORKER_START;
      }
      for (let j = 0; j < unit.length; j++) {
        const def = TESTS[unit[j]];
        const tries = (attempts[def.id] ??= []);
        const attempt = tries.length;
        const ok = def.kind === 'ok' || (def.kind === 'flaky' && attempt > 0);
        tries.push(ok);
        bars.push({ shard: s, lane: li, start: t, end: t + def.dur, test: def.id, attempt, ok, worker: lane.worker });
        t = Math.round((t + def.dur) * 10) / 10;
        if (!ok) {
          // worker is discarded; retry (if any left) + rest of the unit go to the front of the queue
          lane.worker = -1;
          const rest = unit.slice(j + 1);
          const again = attempt < retries ? [def.id, ...rest] : rest;
          if (again.length) queue.unshift({ unit: again, avail: t });
          break;
        }
      }
      lane.free = t;
    }
    shardEnd[s] = Math.max(0, ...lanes.map((l) => l.free));
  });
  const verdict: Record<number, Verdict> = {};
  for (const t of TESTS) {
    const a = attempts[t.id];
    verdict[t.id] = a[0] ? 'passed' : a[a.length - 1] ? 'flaky' : 'failed';
  }
  const serial = Math.round(TESTS.reduce((a, t) => a + t.dur, 0) * 10) / 10;
  return { bars, shardOf, shardEnd, wall: Math.max(...shardEnd), serial, verdict };
}

export function simulate(params: Params): Frame[] {
  const p = plan(params);
  const { workers, shards, retries, fullyParallel } = params;
  const unit = fullyParallel === 'on' ? 'test' : 'file';
  const ends = [...new Set(p.bars.filter((b) => b.test >= 0).map((b) => b.end))].sort((a, b) => a - b);
  const frames: Frame[] = [];
  const units = fullyParallel === 'on' ? TESTS.length : FILES.length;
  const shardCounts = Array.from({ length: shards }, (_, s) => p.shardOf.filter((x) => x === s).length);
  frames.push({
    now: 0,
    verdicts: {},
    done: false,
    caption: `${TESTS.length} tests in ${FILES.length} files. fullyParallel ${fullyParallel}: the unit of work is a ${unit}. ${shards > 1 ? `${shards} shards (machines) get ${shardCounts.join(' / ')} tests; ` : ''}${shards > 1 ? 'each machine runs' : 'the run uses'} ${workers} worker${workers > 1 ? 's' : ''}; retries: ${retries}.`,
    predict:
      shards > 1 && fullyParallel === 'off'
        ? 'Shards split whole files here. Will the machines finish at about the same time?'
        : `There are ${units} ${unit}s and ${workers} worker${workers > 1 ? 's' : ''}${shards > 1 ? ' per shard' : ''}. How many workers stay busy, and what dominates the wall time?`,
  });
  const verdicts: Record<number, Verdict> = {};
  let predictedFlaky = false;
  for (const t of ends) {
    const finished = p.bars.filter((b) => b.test >= 0 && b.end === t);
    const parts: string[] = [];
    let predict: string | undefined;
    for (const b of finished) {
      const def = TESTS[b.test];
      const where = `${shards > 1 ? `shard ${b.shard + 1}, ` : ''}worker #${b.worker}`;
      const lastAttempt = !p.bars.some((x) => x.test === b.test && x.attempt > b.attempt);
      if (b.ok) {
        parts.push(`${def.label} ${def.name} passes${b.attempt ? ` on retry #${b.attempt}` : ''} (${where}).`);
      } else {
        const rest = unit === 'file' && def.id !== TESTS.filter((x) => x.file === def.file).slice(-1)[0].id;
        const next = !lastAttempt ? '; a fresh worker retries it' + (rest ? ', then the rest of its file' : '') : (retries ? '; no retries left' : '') + (rest ? '; the rest of its file continues in a fresh worker' : '');
        parts.push(`${def.label} ${def.name} FAILS (attempt ${b.attempt + 1}, ${where}). The worker is discarded${next}.`);
        if (def.kind === 'flaky' && !predictedFlaky) {
          predict = retries ? 'If the retry passes, how will the report classify this test, and will CI go red?' : 'No retries are configured. How will this flaky test be reported?';
          predictedFlaky = true;
        }
      }
      if (lastAttempt) verdicts[b.test] = p.verdict[b.test];
    }
    frames.push({ now: t, verdicts: { ...verdicts }, done: false, caption: `${t.toFixed(1)} s: ${parts.join(' ')}`, predict });
  }
  frames[frames.length - 1].predict ??= 'All tests are done. What will the final report say, and will the run exit with code 0?';
  const v = Object.values(p.verdict);
  const n = (k: Verdict) => v.filter((x) => x === k).length;
  const speed = (p.serial / p.wall).toFixed(1);
  frames.push({
    now: p.wall,
    verdicts: { ...p.verdict },
    done: true,
    caption: `Report: ${n('passed')} passed, ${n('flaky')} flaky, ${n('failed')} failed. Wall time ${p.wall.toFixed(1)} s vs ${p.serial.toFixed(1)} s of test time run serially (${speed}×). ${n('failed') ? `Exit code 1: ${n('failed')} test${n('failed') > 1 ? 's' : ''} failed every attempt.` : 'Exit code 0.'}${n('flaky') ? ' Flaky tests do not fail the run by default, but they are a bug to fix, not to hide behind retries.' : ''}`,
  });
  return frames;
}
