// Pure simulation of Playwright Test hook and fixture order across workers.
// Rules (playwright.dev/docs/test-fixtures "Execution order", /test-retries, /api/class-test):
// - fixtures are lazy: set up right before the first hook/test that needs them; test-scoped
//   fixtures needed by beforeEach are set up before it, fixtures only the test needs come after it;
//   teardown is the reverse, after afterEach.
// - worker-scoped fixtures live until the worker process shuts down.
// - beforeAll/afterAll run once per worker for the group of tests that worker runs; in parallel
//   mode each test is its own group, so it runs all relevant hooks.
// - after any test failure the worker is discarded (afterAll still runs) and a NEW worker runs
//   the remaining tests, re-running worker fixtures and beforeAll.
// - serial mode: a failure skips all subsequent tests in the group.
import type { BaseFrame } from '../../core';

export type Mode = 'default' | 'parallel' | 'serial';
export interface Params {
  workers: number;
  fail: 'no' | 'yes';
  mode: Mode;
}
export const DEFAULT_PARAMS: Params = { workers: 2, fail: 'yes', mode: 'default' };

export type Kind = 'worker' | 'wfix' | 'tfix' | 'hook' | 'pass' | 'fail' | 'skip';
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
export const FIXTURES = ['account', 'browser', 'page', 'todoPage'] as const;
export type Fixture = (typeof FIXTURES)[number];
export const FIXTURE_SCOPE: Record<Fixture, 'worker' | 'test'> = { account: 'worker', browser: 'worker', page: 'test', todoPage: 'test' };
const TEST_DUR = [4, 2, 3];

export interface LogLine {
  id: number;
  slot: number;
  t: number;
  text: string;
  /** compact label for the log lane */
  short: string;
  kind: Kind;
}
export interface SlotState {
  worker: number | null;
  alive: Fixture[];
  /** worker processes started in this slot so far */
  started: number;
}
export interface Frame extends BaseFrame {
  lines: LogLine[];
  current: number | null;
  tests: { status: TestStatus; worker: number | null }[];
  slots: SlotState[];
  now: number;
  beforeAllRuns: number;
}

interface Effect {
  worker?: number | null;
  add?: Fixture[];
  remove?: Fixture[];
  test?: { k: number; status: TestStatus; worker: number };
  beforeAll?: boolean;
}
interface Ev extends LogLine, Effect {
  seq: number;
}

export function simulate({ workers, fail, mode }: Params): Frame[] {
  const failK = fail === 'yes' ? 1 : -1;
  const evs: Ev[] = [];
  let seq = 0;
  const slots = Array.from({ length: workers }, () => ({ worker: null as number | null, freeAt: 0, alive: new Set<Fixture>() }));
  let workerCount = 0;
  const emit = (slot: number, t: number, text: string, kind: Kind, eff: Effect = {}) => evs.push({ id: seq, seq: seq++, slot, t, text, short: shorten(text), kind, ...eff });

  // a queue of groups; default and serial: the whole describe is one group; parallel: one test per group
  const queue: { tests: number[]; avail: number }[] = mode === 'parallel' ? [0, 1, 2].map((k) => ({ tests: [k], avail: 0 })) : [{ tests: [0, 1, 2], avail: 0 }];

  while (queue.length) {
    const g = queue.shift()!;
    // pick the slot that can start earliest; prefer one with a live worker, then the lower index
    let si = 0;
    for (let i = 1; i < slots.length; i++) {
      const a = Math.max(slots[i].freeAt, g.avail);
      const b = Math.max(slots[si].freeAt, g.avail);
      if (a < b || (a === b && slots[i].worker !== null && slots[si].worker === null)) si = i;
    }
    const s = slots[si];
    let t = Math.max(s.freeAt, g.avail);
    const step = (text: string, kind: Kind, dur = 1, eff: Effect = {}) => {
      emit(si, t, text, kind, eff);
      t += dur;
    };
    if (s.worker === null) {
      s.worker = ++workerCount;
      step(`worker #${s.worker} starts (new process)`, 'worker', 1, { worker: s.worker });
    }
    const w = s.worker;
    if (!s.alive.has('account')) {
      s.alive.add('account');
      step('⚙ account setup (worker scope, needed by beforeAll)', 'wfix', 1, { add: ['account'] });
    }
    step('beforeAll({ account })', 'hook', 1, { beforeAll: true });
    let failed = false;
    for (let j = 0; j < g.tests.length; j++) {
      const k = g.tests[j];
      if (failed && mode === 'serial') {
        step(`⤼ test ${k + 1} skipped (serial: an earlier test failed)`, 'skip', 1, { test: { k, status: 'skipped', worker: w } });
        continue;
      }
      if (!s.alive.has('browser')) {
        s.alive.add('browser');
        step('⚙ browser setup (worker scope, lazily, for the first page)', 'wfix', 1, { add: ['browser'] });
      }
      step('⚙ page setup (test scope, needed by beforeEach)', 'tfix', 1, { add: ['page'], test: { k, status: 'running', worker: w } });
      step('beforeEach({ page })', 'hook');
      step('⚙ todoPage setup (test scope, only the test needs it)', 'tfix', 1, { add: ['todoPage'] });
      const bad = k === failK;
      step(bad ? `✗ test ${k + 1} FAILS` : `✓ test ${k + 1} passes`, bad ? 'fail' : 'pass', TEST_DUR[k], { test: { k, status: bad ? 'failed' : 'passed', worker: w } });
      step('afterEach({ page })', 'hook');
      step('⚙ teardown todoPage, then page (reverse order)', 'tfix', 1, { remove: ['todoPage', 'page'] });
      if (bad) {
        failed = true;
        if (mode !== 'serial' && j < g.tests.length - 1) {
          // remaining tests go back to the queue for a fresh worker
          queue.unshift({ tests: g.tests.slice(j + 1), avail: t + 2 });
          break;
        }
      }
    }
    step('afterAll()', 'hook');
    if (failed) {
      step(`worker #${w} is discarded after the failure: browser, account torn down`, 'worker', 1, { worker: null, remove: ['browser', 'account'] });
      s.worker = null;
      s.alive.clear();
    }
    s.freeAt = t;
  }
  const end = Math.max(...slots.map((s) => s.freeAt));
  slots.forEach((s, i) => {
    if (s.worker !== null) emit(i, end, `end of run: worker #${s.worker} shuts down, browser and account torn down`, 'worker', { worker: null, remove: ['browser', 'account'] });
  });

  evs.sort((a, b) => a.t - b.t || a.slot - b.slot || a.seq - b.seq);

  // replay into frames
  const st = {
    lines: [] as LogLine[],
    tests: [0, 1, 2].map(() => ({ status: 'pending' as TestStatus, worker: null as number | null })),
    slots: Array.from({ length: workers }, () => ({ worker: null as number | null, alive: [] as Fixture[], started: 0 })),
    beforeAllRuns: 0,
  };
  const snap = (now: number, current: number | null, caption: string, predict?: string): Frame => ({
    lines: [...st.lines],
    current,
    tests: st.tests.map((x) => ({ ...x })),
    slots: st.slots.map((x) => ({ ...x, alive: [...x.alive] })),
    now,
    beforeAllRuns: st.beforeAllRuns,
    caption,
    predict,
  });
  const intro: Record<Mode, string> = {
    default: `Default mode: the tests of a file run in order in ONE worker${workers > 1 ? ', so the second worker has nothing to do' : ''}.`,
    parallel: `Parallel mode: each test is its own unit and may land on any of the ${workers} worker${workers > 1 ? 's' : ''}; each one runs all relevant hooks.`,
    serial: 'Serial mode: the tests run in order in one worker as a single unit; a failure skips everything after it.',
  };
  const frames: Frame[] = [
    snap(
      0,
      null,
      `${intro[mode]} Fixtures: account and browser are worker-scoped; page and the custom todoPage are test-scoped.`,
      mode === 'parallel' ? 'How many times will beforeAll run for these 3 tests?' : failK >= 0 ? 'Test 2 will fail. What happens to the worker, and to test 3?' : 'In what order do beforeAll, beforeEach and the fixtures run?',
    ),
  ];
  let predictedFail = false;
  let predictedTeardown = false;
  for (const e of evs) {
    const sl = st.slots[e.slot];
    if (e.worker !== undefined) {
      if (e.worker !== null) sl.started++;
      sl.worker = e.worker;
    }
    if (e.add) sl.alive = [...sl.alive, ...e.add.filter((f) => !sl.alive.includes(f))];
    if (e.remove) sl.alive = sl.alive.filter((f) => !e.remove!.includes(f));
    if (e.test) st.tests[e.test.k] = { status: e.test.status, worker: e.test.worker };
    if (e.beforeAll) st.beforeAllRuns++;
    st.lines.push({ id: e.id, slot: e.slot, t: e.t, text: e.text, short: e.short, kind: e.kind });
    let caption = `t=${e.t} · slot ${e.slot + 1}: ${e.text}. ${explain(e, mode)}`;
    let predict: string | undefined;
    if (e.kind === 'fail' && !predictedFail) {
      predict = mode === 'serial' ? 'Test 3 is next in this serial group. Will it run?' : 'After afterEach and afterAll, will this same worker go on to run test 3?';
      predictedFail = true;
    }
    if (e.kind === 'tfix' && e.remove && !predictedTeardown && !predict) {
      predict = 'page and todoPage are gone. Which fixtures will the next test in this worker reuse?';
      predictedTeardown = true;
    }
    caption = caption.replace(/\.\s*\./g, '.').trim();
    frames.push(snap(e.t, e.id, caption, predict));
  }
  const counts = { passed: 0, failed: 0, skipped: 0 };
  st.tests.forEach((x) => {
    if (x.status === 'passed') counts.passed++;
    else if (x.status === 'failed') counts.failed++;
    else if (x.status === 'skipped') counts.skipped++;
  });
  frames.push(
    snap(
      end + 1,
      null,
      `Done: ${counts.passed} passed, ${counts.failed} failed, ${counts.skipped} skipped. ${workerCount} worker process${workerCount > 1 ? 'es' : ''} started, beforeAll ran ${st.beforeAllRuns}×. Worker-scoped fixtures were set up once per worker; test-scoped ones once per test.`,
    ),
  );
  return frames;
}

function shorten(text: string): string {
  const m = text.match(/^(⚙ \w+) setup \((\w+) scope/);
  if (m) return `${m[1]} setup [${m[2]}]`;
  if (text.startsWith('⚙ teardown')) return '⚙ teardown todoPage, page';
  if (text.includes('discarded')) return `■ ${text.match(/worker #\d+/)![0]} discarded`;
  if (text.startsWith('end of run')) return `■ ${text.match(/worker #\d+/)![0]} shuts down`;
  if (text.includes('starts')) return `▶ ${text.match(/worker #\d+/)![0]} starts`;
  if (text.includes('skipped')) return text.replace(/ \(.*\)/, '');
  return text.replace('({ account })', '').replace('({ page })', '').replace('()', '');
}

function explain(e: Ev, mode: Mode): string {
  if (e.kind === 'worker' && e.worker) return 'Each worker is a separate OS process with its own browser.';
  if (e.kind === 'worker') return 'Worker-scoped fixtures are torn down only when the worker process stops.';
  if (e.text.startsWith('⚙ account')) return 'beforeAll can only use worker-scoped fixtures, so account is created now.';
  if (e.text.startsWith('beforeAll')) return mode === 'parallel' ? 'In parallel mode it runs for every test the worker picks up.' : 'Runs once per worker before its tests.';
  if (e.text.startsWith('⚙ browser')) return 'Nothing needed a browser until page did.';
  if (e.text.startsWith('⚙ page')) return 'beforeEach asks for page, so page is set up before the hook.';
  if (e.text.startsWith('⚙ todoPage')) return 'Fixtures used only by the test body are set up after beforeEach.';
  if (e.kind === 'fail') return 'afterEach still runs, then fixtures are torn down.';
  if (e.text.startsWith('afterEach')) return 'Runs even when the test failed.';
  if (e.kind === 'tfix') return 'Test-scoped fixtures never outlive their test.';
  if (e.text.startsWith('afterAll')) return 'Runs once the worker has finished its group, even after a failure.';
  return '';
}
