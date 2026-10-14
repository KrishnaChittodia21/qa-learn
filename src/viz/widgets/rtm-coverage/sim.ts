// Pure simulation of a bidirectional Requirements Traceability Matrix (RTM) for the coupon
// feature in the mt-test-artifacts topic. Rows = requirements, columns = test cases. Frames
// show test design filling the matrix, forward (req → tests) and backward (test → req)
// tracing, execution status roll-up, and change-request impact analysis. No React here.
import type { BaseFrame } from '../../core';

export type Scenario = 'writing' | 'execution' | 'change';
export type Trace = 'both' | 'forward' | 'backward';
export interface Params {
  scenario: Scenario;
  trace: Trace;
}
export const DEFAULT_PARAMS: Params = { scenario: 'execution', trace: 'both' };

export type TcStatus = 'none' | 'notrun' | 'pass' | 'fail' | 'blocked';
export type ReqStatus = 'gap' | 'notrun' | 'partial' | 'pass' | 'risk' | 'blocked';

export const REQS = [
  { id: 'REQ-CPN-01', text: 'Valid coupon applies % or fixed off' },
  { id: 'REQ-CPN-02', text: 'Min cart value 500 (inclusive)' },
  { id: 'REQ-CPN-03', text: 'Expired/used coupon shows error' },
  { id: 'REQ-CPN-04', text: 'Only one coupon per order' },
  { id: 'REQ-CPN-05', text: 'Code is case-insensitive, trimmed' },
];
export const REQ02_CHANGED = 'Min cart value 750 (inclusive)';

/** test case → requirement row (null = orphan). TC-10 is only written in the "writing" scenario. */
export const TCS: { id: string; req: number | null; title: string }[] = [
  { id: 'TC-01', req: 0, title: '10% coupon on a 1,000 cart' },
  { id: 'TC-02', req: 0, title: 'fixed 100 off a 1,200 cart' },
  { id: 'TC-03', req: 1, title: 'cart 499: rejected' },
  { id: 'TC-04', req: 1, title: 'cart 500: accepted' },
  { id: 'TC-05', req: 1, title: 'cart 501: accepted' },
  { id: 'TC-06', req: 2, title: 'expired coupon: error' },
  { id: 'TC-07', req: 2, title: 'already-used coupon: error' },
  { id: 'TC-08', req: 4, title: '" save10 " is accepted' },
  { id: 'TC-09', req: null, title: 'coupon on gift cards' },
  { id: 'TC-10', req: 3, title: 'second coupon is refused' },
];

export interface Frame extends BaseFrame {
  /** status per TCS index; 'none' = not written yet (column hidden) */
  tc: TcStatus[];
  /** TC indexes flagged as impacted by a change request */
  impacted: number[];
  /** highlighted row (forward trace) and/or column (backward trace) */
  row: number | null;
  cols: number[];
  dir: 'fwd' | 'bwd' | null;
  reqStatus: ReqStatus[];
  /** rows / columns found as problems so far */
  gaps: number[];
  orphans: number[];
  changed: boolean;
  bug: string | null;
  covered: number;
  passing: number;
}

export function rollup(tc: TcStatus[], r: number): ReqStatus {
  const s = TCS.map((t, i) => (t.req === r ? tc[i] : 'none')).filter((x) => x !== 'none');
  if (s.length === 0) return 'gap';
  if (s.includes('fail')) return 'risk';
  if (s.includes('blocked')) return 'blocked';
  if (s.every((x) => x === 'pass')) return 'pass';
  if (s.every((x) => x === 'notrun')) return 'notrun';
  return 'partial';
}

export function simulate(p: Params): Frame[] {
  const frames: Frame[] = [];
  const fwd = p.trace !== 'backward';
  const bwd = p.trace !== 'forward';
  let tc: TcStatus[] = TCS.map(() => 'none');
  let impacted: number[] = [];
  let gaps: number[] = [];
  let orphans: number[] = [];
  let changed = false;
  let bug: string | null = null;

  const push = (caption: string, o: { row?: number | null; cols?: number[]; dir?: 'fwd' | 'bwd' | null; predict?: string } = {}) => {
    const reqStatus = REQS.map((_, r) => rollup(tc, r));
    frames.push({
      caption,
      predict: o.predict,
      tc: [...tc],
      impacted: [...impacted],
      row: o.row ?? null,
      cols: o.cols ?? [],
      dir: o.dir ?? null,
      reqStatus,
      gaps: [...gaps],
      orphans: [...orphans],
      changed,
      bug,
      covered: reqStatus.filter((s) => s !== 'gap').length,
      passing: reqStatus.filter((s) => s === 'pass').length,
    });
  };
  const testsOf = (r: number) => TCS.flatMap((t, i) => (t.req === r && tc[i] !== 'none' ? [i] : []));
  const designAll = () => {
    tc = TCS.map((_, i) => (i < 9 ? 'notrun' : 'none'));
  };

  if (p.scenario === 'writing') {
    push('Test analysis starts from the test basis: five coupon requirements (SHOP-412) become the rows of the RTM. No test cases exist yet, so every row is uncovered.');
    const groups: [number, number[], string][] = [
      [0, [0, 1], 'REQ-CPN-01 gets TC-01 (percentage coupon) and TC-02 (fixed amount off). Each test case records the requirement it was derived from.'],
      [1, [2, 3, 4], 'REQ-CPN-02 is a boundary rule, so BVA gives three cases: 499 rejected, 500 accepted, 501 accepted.'],
      [2, [5, 6], 'REQ-CPN-03 gets an expired-coupon case and an already-used-coupon case.'],
      [4, [7], 'REQ-CPN-05 gets TC-08: a lowercase code with spaces around it must still apply.'],
    ];
    for (const [r, list, cap] of groups) {
      for (const i of list) tc[i] = 'notrun';
      push(cap, { row: r, cols: list, dir: 'fwd' });
    }
    tc[8] = 'notrun';
    push('A tester also writes TC-09 "coupon on gift cards" from memory of an old release. It is not linked to any requirement.', {
      cols: [8],
      predict: 'Nine test cases are written. Which problems is this matrix hiding, and which trace direction finds each one?',
    });
    if (fwd) {
      push('Forward trace, row by row: REQ-CPN-01, 02 and 03 each reach at least one test case.', { row: 0, cols: testsOf(0), dir: 'fwd' });
      gaps = [3];
      push('Forward trace reaches REQ-CPN-04 "only one coupon per order" and finds nothing. That empty row is a coverage gap: the rule would ship untested.', { row: 3, dir: 'fwd' });
    } else {
      push('Forward trace is switched off, so nobody reads the matrix row by row. The empty REQ-CPN-04 row is not noticed.');
    }
    if (bwd) {
      push('Backward trace, column by column: TC-01 to TC-08 each point back to a requirement, so each has a reason to exist.', { cols: [0, 1, 2, 3, 4, 5, 6, 7], dir: 'bwd' });
      orphans = [8];
      push('Backward trace from TC-09 finds no requirement: an orphan test. Either a requirement is missing (ask the PO) or the test is obsolete.', { cols: [8], dir: 'bwd' });
    } else {
      push('Backward trace is switched off, so nobody asks "why does this test exist?". TC-09 stays in the suite with no requirement behind it.');
    }
    push(`Coverage so far: ${frames[frames.length - 1].covered}/5 requirements have at least one test.`, {
      predict: 'What is the cheapest action that raises requirement coverage to 100%?',
    });
    if (fwd) {
      tc[9] = 'notrun';
      gaps = [];
      push('Write TC-10 "second coupon is refused" for REQ-CPN-04. The gap row now has a test: coverage 5/5 (100%).', { row: 3, cols: [9], dir: 'fwd' });
    } else {
      push('Without the forward trace the gap was never found, so coverage stays 4/5 and the one-coupon rule goes untested into execution.');
    }
    push(
      `Design done. ${fwd ? 'Forward trace found the gap.' : 'The gap was missed.'} ${bwd ? 'Backward trace flagged TC-09 for the PO.' : 'The orphan was missed.'} A bidirectional RTM catches both, which is why teams keep both directions.`,
    );
    return frames;
  }

  // execution and change scenarios start from the designed matrix of the topic (TC-01…TC-09)
  designAll();

  if (p.scenario === 'execution') {
    push('Execution starts. The RTM has nine designed test cases, all "not run". The matrix will now show coverage AND quality.');
    const run = (i: number, s: TcStatus, cap: string, predict?: string) => {
      tc[i] = s;
      const r = TCS[i].req;
      push(cap, { row: fwd && r !== null ? r : null, cols: [i], dir: fwd ? 'fwd' : 'bwd', predict });
    };
    run(0, 'pass', 'TC-01 passes: 10% off a 1,000 cart gives 900.');
    run(1, 'pass', 'TC-02 passes. Both tests for REQ-CPN-01 are green, so the requirement rolls up to PASS.');
    run(2, 'pass', 'TC-03 passes: a 499 cart is rejected.');
    run(3, 'pass', 'TC-04 passes: 500 is accepted (the boundary is inclusive).');
    run(4, 'blocked', 'TC-05 is BLOCKED: the staging cart service is down, so the test cannot run. Blocked is not failed; it is logged with the reason.');
    run(5, 'pass', 'TC-06 passes: the expired coupon shows the right error.');
    bug = 'BUG-881 (Major) open on TC-07';
    run(
      6,
      'fail',
      'TC-07 FAILS: an already-used coupon is accepted again. BUG-881 (Major) is logged and linked to TC-07 in the RTM.',
      'TC-07 failed but TC-06 passed. What is the status of REQ-CPN-03 now?',
    );
    if (bwd) push('Backward trace from the failure: TC-07 → REQ-CPN-03. One red test is enough, so REQ-CPN-03 is AT RISK, even though half of its tests passed.', { row: 2, cols: [6], dir: 'bwd' });
    else push('Without backward links, the failed TC-07 is just a red cell. The roll-up still marks REQ-CPN-03 at risk, but nobody can say from the test which rule it endangers.', { cols: [6] });
    run(7, 'pass', 'TC-08 passes: " save10 " applies after trimming and case folding.');
    if (bwd) orphans = [8];
    run(8, 'pass', bwd ? 'TC-09 passes, but it traces to no requirement, so this green result proves nothing the business asked for.' : 'TC-09 passes and is counted as progress, though it traces to no requirement.');
    run(4, 'pass', 'The cart service is back. TC-05 runs and passes, so REQ-CPN-02 rolls up to PASS.');
    push('Every test that exists has now run: 8 passed, 1 failed.', {
      predict: 'Requirement coverage and requirement pass rate are different numbers. What are they here?',
    });
    if (fwd) gaps = [3];
    if (fwd) push('Forward check: REQ-CPN-04 still has no tests. It is not "passed", it is NOT COVERED: a gap no green cell can hide.', { row: 3, dir: 'fwd' });
    else push('Forward check is off, so REQ-CPN-04 has no tests and nobody notices: the report counts 8/9 tests passed and looks healthy.');
    push('Report from the RTM: coverage 4/5 requirements (80%); fully passing 3/5 (60%). Actions: write tests for REQ-CPN-04, ask the PO about TC-09, track BUG-881.');
    return frames;
  }

  // change request: start from the executed state in the topic
  tc = ['pass', 'pass', 'pass', 'pass', 'pass', 'pass', 'fail', 'pass', 'pass', 'none'];
  gaps = fwd ? [3] : [];
  orphans = bwd ? [8] : [];
  bug = 'BUG-881 (Major) open on TC-07';
  push('Mid-release state: 8 tests passed, TC-07 failed with BUG-881, REQ-CPN-04 has no tests.');
  changed = true;
  push('Change request from the PO: the minimum cart value for coupons rises from 500 to 750.', {
    row: 1,
    predict: 'Which test cases must be updated and re-run because of this change?',
  });
  if (fwd) {
    impacted = [2, 3, 4];
    push('Impact analysis with the forward trace: REQ-CPN-02 → TC-03, TC-04, TC-05. Three tests are impacted; everything else is untouched.', { row: 1, cols: [2, 3, 4], dir: 'fwd' });
  } else {
    push('With only backward links, impact analysis means opening every test and tracing it back: TC-01, TC-02…', { cols: [0, 1, 2, 3], dir: 'bwd' });
    impacted = [2, 3, 4];
    push('…TC-09. Nine tests checked to find the same three impacted tests (TC-03, 04, 05). It works, but it is slow on a real suite of hundreds.', { cols: [4, 5, 6, 7, 8], dir: 'bwd' });
  }
  if (bwd) push('Backward check of the impacted tests: TC-03, 04 and 05 trace back only to REQ-CPN-02, so no other requirement inherits the change.', { row: 1, cols: [2, 3, 4], dir: 'bwd' });
  else push('Without backward links nobody can confirm that TC-03, 04 and 05 serve only REQ-CPN-02; a shared test could silently break another rule.', { cols: [2, 3, 4] });
  push(
    bwd
      ? 'What about TC-09 (gift cards)? It traces to no requirement, so impact analysis cannot say whether the new 750 rule applies to it. Orphans are blind spots for change.'
      : 'TC-09 (gift cards) uses a 600 cart. Is it affected by the 750 rule? Without a requirement link nobody can tell.',
    { cols: [8], dir: bwd ? 'bwd' : null },
  );
  tc[2] = 'notrun';
  tc[3] = 'notrun';
  tc[4] = 'notrun';
  push('The old results no longer prove the new rule, so the impacted tests are reset to "not run".', {
    row: 1,
    cols: [2, 3, 4],
    predict: 'REQ-CPN-02 was green a minute ago. What is its status before the tests are re-run?',
  });
  push('REQ-CPN-02 drops from PASS to NOT RUN. Tests are rewritten with the new boundary: 749 rejected, 750 accepted, 751 accepted.', { row: 1, cols: [2, 3, 4], dir: 'fwd' });
  for (const [i, cap] of [
    [2, 'TC-03 re-run: a 749 cart is rejected. Pass.'],
    [3, 'TC-04 re-run: exactly 750 is accepted. Pass.'],
    [4, 'TC-05 re-run: 751 is accepted. Pass.'],
  ] as [number, string][]) {
    tc[i] = 'pass';
    impacted = impacted.filter((x) => x !== i);
    push(cap, { row: 1, cols: [i], dir: 'fwd' });
  }
  push('Regression around the change: TC-01 and TC-02 use carts above 750, so they still pass unchanged.', { row: 0, cols: [0, 1], dir: 'fwd' });
  push('The change cost 3 rewritten tests, not a full re-test. REQ-CPN-02 is green against the NEW rule; BUG-881 and the REQ-CPN-04 gap are still open.');
  return frames;
}
