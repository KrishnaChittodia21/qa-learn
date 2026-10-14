// Pure simulation of one user story through a two-week Scrum sprint from the tester's seat:
// Backlog → Refinement (three amigos, acceptance criteria) → In dev → In test → Done, with
// a defect loop back to development, the Definition of Done, and a go/no-go check of exit
// criteria at sprint end. Day accounting decides whether the story makes the sprint. No React here.
import type { BaseFrame } from '../../core';

export type Bug = 'none' | 'minor' | 'critical';
export interface Params {
  bug: Bug;
  /** acceptance criteria agreed in three amigos before the sprint */
  acFirst: boolean;
}
export const DEFAULT_PARAMS: Params = { bug: 'critical', acFirst: true };

export const COLS = ['Backlog', 'Refinement', 'In dev', 'In test', 'Done'] as const;
export const STORY = 'SHOP-412 Apply a coupon at checkout';
export const AC = ['Valid code takes 10% off', 'Expired code shows "Coupon expired"', 'Cart under 500: coupon refused', 'Only one coupon per order'];

export type Check = 'pending' | 'ok' | 'fail' | 'warn';
export interface Gate {
  label: string;
  state: Check;
}
export interface Frame extends BaseFrame {
  col: number;
  /** sprint day (0 = before the sprint, refinement) */
  day: number;
  /** the tester's current activities */
  tester: string[];
  ac: number;
  /** AC were invented by the dev during coding (no three amigos) */
  acGuessed: boolean;
  defect: { id: string; sev: string; state: string } | null;
  loop: boolean;
  rework: number;
  gate: Gate[];
  outcome: '' | 'Go' | 'Go with conditions' | 'No-go';
}

export function simulate(p: Params): Frame[] {
  const frames: Frame[] = [];
  let col = 0;
  let day = 0;
  let tester: string[] = [];
  let ac = 0;
  let defect: Frame['defect'] = null;
  let loop = false;
  let rework = 0;
  let gate: Gate[] = [];
  let outcome: Frame['outcome'] = '';
  const push = (caption: string, predict?: string) =>
    frames.push({ caption, predict, col, day, tester: [...tester], ac, acGuessed: !p.acFirst && ac > 0, defect: defect && { ...defect }, loop, rework, gate: gate.map((g) => ({ ...g })), outcome });

  tester = ['read the story', 'note testability questions'];
  push(`${STORY} sits in the Product Backlog, ordered by the Product Owner. The tester's work starts here, before any code: reading it and listing questions.`);

  col = 1;
  if (p.acFirst) {
    tester = ['three amigos: PO + dev + tester', 'turn rules into examples'];
    push('Refinement: three amigos. The PO explains the rule, the developer how to build it, the tester asks "what could go wrong?"', 'Why should the tester be in this meeting when there is nothing to test yet?');
    for (let k = 0; k < AC.length; k++) ac = k + 1;
    tester = ['AC written with a negative example', 'test data + env needs noted', 'estimate test effort'];
    push('The examples become 4 acceptance criteria, including negatives (expired code, cart under 500) and an edge (two coupons). The story now meets the team\'s Definition of Ready.');
  } else {
    tester = ['not invited', 'story says only "user can apply a coupon"'];
    push('Refinement is skipped to save time. The story goes into planning with one line, "user can apply a coupon", and no acceptance criteria.', 'With no agreed examples, who decides what "apply a coupon" means for an expired code or a second coupon?');
  }

  day = 1;
  tester = ['agree the Sprint Goal', 'add test tasks to the board', 'plan automation + exploratory'];
  push('Day 1, Sprint Planning: the story is pulled into the Sprint Backlog for the Sprint Goal "customers can use promo codes". Test tasks go on the board next to dev tasks.');

  col = 2;
  day = 2;
  tester = p.acFirst ? ['write Gherkin from the AC', 'prepare coupon test data', 'review unit tests'] : ['guess test ideas from the title', 'prepare some coupon data'];
  push(
    p.acFirst
      ? 'In dev, days 2–4: while the developer codes, the tester turns each AC into Gherkin scenarios, prepares data (valid, expired, used codes) and reviews unit tests.'
      : 'In dev, days 2–5: the developer decides the rules alone while coding. The tester prepares tests from guesses, because nothing is written down.',
  );
  day = p.acFirst ? 4 : 5;
  tester = ['contract-test the coupon API', 'pair with the developer'];
  push(`Day ${day}: the tester runs API checks against POST /cart/coupon before the UI exists, so the first UI build is not the first test.`);

  col = 3;
  day++;
  tester = p.acFirst ? ['verify each AC on staging', '30-min exploratory session'] : ['test against guessed rules', 'ask the PO what is expected'];
  push(
    p.acFirst
      ? `Day ${day}, In test: the story is deployed to the test environment. The tester verifies the acceptance criteria and runs a short exploratory session.`
      : `Day ${day}, In test: the story is deployed, but there are no acceptance criteria to verify against. The tester has to ask the PO what "correct" means.`,
  );

  if (!p.acFirst) {
    ac = AC.length;
    rework++;
    loop = true;
    col = 2;
    tester = ['raise the mismatch in the daily', 'PO now writes the AC'];
    push(
      'Mismatch: the developer allowed two coupons per order and showed a generic error for expired codes. The PO says both are wrong. The story goes back to In dev: rework that three amigos would have prevented.',
    );
    day += 2;
    col = 3;
    loop = false;
    tester = ['re-verify AC on the new build'];
    push(`Day ${day}: the reworked build is back In test, two days later than planned.`);
  }

  if (p.bug !== 'none') {
    const crit = p.bug === 'critical';
    defect = { id: 'BUG-913', sev: crit ? 'Critical' : 'Minor', state: 'New' };
    tester = ['reproduce + log with evidence', crit ? 'raise in the daily' : 'triage with the PO'];
    push(
      crit
        ? `BUG-913 (Critical): applying a coupon then changing quantity charges the full price. Logged with steps, data and the network response.`
        : 'BUG-913 (Minor): the "Coupon expired" message is cut off on small screens. Logged with a screenshot.',
      crit ? 'A critical defect is open on this story. Can the story move to Done?' : 'This bug is minor. Must it be fixed before the story is Done?',
    );
    if (crit) {
      col = 2;
      loop = true;
      defect = { ...defect, state: 'Assigned' };
      tester = ['test other stories meanwhile'];
      day++;
      push(`Day ${day}: no. Done means no open Critical/High defects, so the card loops back to In dev. The developer fixes it; the tester keeps testing other stories.`);
      col = 3;
      loop = false;
      day++;
      defect = { ...defect, state: 'Retest' };
      tester = ['confirmation test of BUG-913', 'regression of checkout'];
      push(`Day ${day}: the fix is In test. Confirmation testing re-runs the failed case; regression covers the checkout around the change.`);
      defect = { ...defect, state: day <= 9 ? 'Closed' : 'Retest' };
    } else {
      defect = { ...defect, state: 'Deferred' };
      tester = ['PO accepts the bug', 'note it as a known issue'];
      push('Triage: the PO accepts it for the next sprint. The DoD allows open Medium/Low bugs if they are logged, triaged and accepted, so the story can still be Done.');
    }
  } else {
    tester = ['all AC pass', 'exploratory notes linked'];
    push('No defects found: every acceptance criterion passes and the exploratory notes are linked to the story.');
  }

  const doneOk = day <= 9;
  if (doneOk) {
    col = 4;
    tester = ['tick the Definition of Done', 'automate the happy path'];
    push(`Day ${day}: Definition of Done checked: AC verified, regression green, no open Critical/High bugs, Playwright check added for the happy path. The story is Done.`);
  } else {
    tester = ['report: story not Done', 'PO decides: flag OFF or back to backlog'];
    push(`Day ${day}: the sprint is over and the fix is still being retested. The story is NOT Done, does not count toward velocity, and is not silently carried over: the PO decides.`);
  }

  day = Math.max(day, 9);
  tester = ['regression on the release candidate', 'prepare the test summary'];
  const critOpen = !doneOk && p.bug === 'critical';
  const labels = ['Acceptance criteria verified', 'Regression suite passed on the RC', 'No open Critical/High defects', 'Known issues accepted + in release notes', 'Rollback plan / feature flag ready'];
  const finals: Check[] = [doneOk ? 'ok' : 'fail', 'ok', critOpen ? 'fail' : 'ok', p.bug === 'minor' ? 'warn' : 'ok', 'ok'];
  gate = labels.map((label) => ({ label, state: 'pending' }));
  push(`Day ${day}: release validation on the release candidate. The go/no-go check compares the evidence against the exit criteria.`, 'Look at the story\'s path. Which exit criteria will pass, and what will the recommendation be?');
  gate = gate.map((g, k) => ({ ...g, state: k < 3 ? finals[k] : 'pending' }));
  push(`Exit criteria, part 1: ${gate.slice(0, 3).map((g) => `${g.label} ${g.state === 'ok' ? '✓' : '✗'}`).join('; ')}.`);
  gate = gate.map((g, k) => ({ ...g, state: finals[k] }));
  push(`Exit criteria, part 2: ${p.bug === 'minor' ? 'BUG-913 is open but accepted and listed in the release notes' : 'no known issues to list'}; rollback plan and feature flag are ready.`);

  day = 10;
  outcome = finals.includes('fail') ? 'No-go' : finals.includes('warn') ? 'Go with conditions' : 'Go';
  tester = ['recommend with evidence', 'the release owner decides'];
  push(
    outcome === 'Go'
      ? 'Day 10: QA recommends GO with evidence: what was tested, what was found, what risk remains. The Product Owner makes the call and the increment ships.'
      : outcome === 'Go with conditions'
        ? 'Day 10: GO WITH CONDITIONS: ship, with BUG-913 in the known-issues list and a fix planned next sprint. QA recommends; the PO decides.'
        : 'Day 10: NO-GO for this story: the coupon feature ships behind a feature flag set OFF (or goes back to the backlog). QA states the open critical clearly; the PO owns the decision.',
  );
  push(
    p.acFirst
      ? `Sprint review: the story ${doneOk ? 'is demoed' : 'is not demoed'}. ${rework === 0 ? 'Three amigos up front meant no rework loop for misunderstood rules.' : ''}`
      : `Retro: ${rework} rework loop and 2 lost days came from missing acceptance criteria. Action: three amigos for every story before planning.`,
  );
  return frames;
}
