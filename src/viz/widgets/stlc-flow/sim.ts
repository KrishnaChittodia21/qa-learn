// Pure simulation of the Software Testing Life Cycle (STLC): a token walks the six phases,
// checking each phase's entry criteria, doing its activities, meeting exit criteria and
// producing a deliverable. Defects found in execution loop back through development for a
// fix, then confirmation testing (retest) and regression testing. No React here.
import type { BaseFrame } from '../../core';

export type Defect = 'none' | 'minor' | 'blocker';
export type YesNo = 'yes' | 'no';

export interface Params {
  defect: Defect;
  envReady: YesNo;
  vmodel: YesNo;
}
export const DEFAULT_PARAMS: Params = { defect: 'blocker', envReady: 'yes', vmodel: 'yes' };

export interface Phase {
  name: string;
  short: string;
  entry: string;
  activities: string;
  exit: string;
  deliverable: string;
  /** V-model pairs (0 = requirements↔acceptance … 3 = detailed design↔component) this phase works on */
  v: number[];
}

export const PHASES: Phase[] = [
  {
    name: 'Requirement analysis',
    short: 'Req. analysis',
    entry: 'Requirements (SRS / user stories) and acceptance criteria available',
    activities: 'Review requirements for testability, clarify gaps with BA/PO, list test conditions, check automation feasibility',
    exit: 'Open questions resolved; requirement traceability matrix (RTM) drafted',
    deliverable: 'RTM + automation feasibility note',
    v: [0, 1],
  },
  {
    name: 'Test planning',
    short: 'Planning',
    entry: 'Analysed requirements and RTM',
    activities: 'Decide scope, approach, test levels and types, estimates, schedule, roles, tools and risks; define entry/exit criteria',
    exit: 'Test plan and effort estimate reviewed and approved',
    deliverable: 'Test plan + estimate',
    v: [0, 1, 2, 3],
  },
  {
    name: 'Test case development',
    short: 'Test design',
    entry: 'Approved test plan; requirements baselined',
    activities: 'Design test cases (EP, BVA, decision tables), prepare test data and automation scripts, peer-review them',
    exit: 'Test cases and data reviewed and signed off; RTM updated',
    deliverable: 'Test cases, test data, scripts',
    v: [1, 2],
  },
  {
    name: 'Environment setup',
    short: 'Env. setup',
    entry: 'Environment spec in the plan; test data ready (often runs in parallel with test design)',
    activities: 'Provision servers, DB, configs and accounts; deploy the build; run a smoke check of the environment',
    exit: 'Environment ready and smoke check passed',
    deliverable: 'Ready test environment',
    v: [],
  },
  {
    name: 'Test execution',
    short: 'Execution',
    entry: 'Signed-off test cases, ready environment, a testable build that passed smoke',
    activities: 'Run tests, compare actual vs expected, log defects, retest fixes, run regression, update RTM',
    exit: 'Planned tests run; no open blocker/critical defects; coverage target met',
    deliverable: 'Execution report + defect reports',
    v: [2, 1, 0],
  },
  {
    name: 'Test closure',
    short: 'Closure',
    entry: 'Execution exit criteria met',
    activities: 'Check exit criteria, write test summary report, hold lessons learned, archive testware',
    exit: 'Test summary report signed off by stakeholders',
    deliverable: 'Test summary (closure) report',
    v: [],
  },
];

/** V-model: development phase on the left arm ↔ test level on the right arm */
export const VPAIRS: [string, string][] = [
  ['Requirements', 'Acceptance testing'],
  ['System spec', 'System testing'],
  ['Architecture', 'Integration testing'],
  ['Detailed design', 'Component testing'],
];

export type Step = 'start' | 'entry' | 'work' | 'blocked' | 'defect' | 'dev' | 'retest' | 'done';
export type Check = 'pending' | 'ok' | 'fail';

export interface Frame extends BaseFrame {
  /** phase index the token is at; -1 before start; 'dev' when the build is back with developers */
  at: number | 'dev';
  step: Step;
  entry: Check;
  exit: Check;
  /** completed phases */
  done: number[];
  deliverables: string[];
  /** highlighted V-model pairs and which arm (left = design basis, right = level being executed) */
  vHi: number[];
  vArm: 'left' | 'right' | 'both' | 'none';
  /** defect status shown in the execution badge */
  bug?: string;
  /** loop arrow execution → dev → execution highlighted */
  loop: boolean;
}

export function simulate(p: Params): Frame[] {
  const frames: Frame[] = [];
  const done: number[] = [];
  const deliverables: string[] = [];
  const v = p.vmodel === 'yes';
  const push = (f: Omit<Frame, 'done' | 'deliverables' | 'loop' | 'vHi' | 'vArm'> & Partial<Pick<Frame, 'loop' | 'vHi' | 'vArm'>>) =>
    frames.push({ loop: false, vHi: [], vArm: 'none', ...f, done: [...done], deliverables: [...deliverables] });

  push({
    at: -1,
    step: 'start',
    entry: 'pending',
    exit: 'pending',
    caption:
      'The STLC runs alongside development: six phases, each with entry criteria (when it may start), activities, exit criteria (when it is done) and a deliverable.' +
      (v ? ' On the right, the V-model pairs every development phase with the test level it feeds.' : ''),
  });

  const plainPhase = (i: number, vNote: string, predict?: string) => {
    const ph = PHASES[i];
    push({ at: i, step: 'entry', entry: 'ok', exit: 'pending', caption: `${ph.name}: entry criteria met (${ph.entry.toLowerCase()}).`, vHi: v ? ph.v : [], vArm: v ? 'left' : 'none' });
    done.push(i);
    deliverables.push(ph.deliverable);
    push({
      at: i,
      step: 'work',
      entry: 'ok',
      exit: 'ok',
      caption: `${ph.name}: ${ph.activities.charAt(0).toLowerCase() + ph.activities.slice(1)}. Exit met → deliverable: ${ph.deliverable}.${v && vNote ? ' ' + vNote : ''}`,
      vHi: v ? ph.v : [],
      vArm: v ? 'left' : 'none',
      predict,
    });
  };

  plainPhase(0, 'Acceptance and system tests can be designed now, long before code exists: that is the point of the V-model.');
  plainPhase(1, 'The plan says which test levels (component → acceptance) run, who owns each and their entry/exit criteria.');
  plainPhase(2, 'System and integration test cases are derived from the specs and design on the left arm.');

  // environment setup
  const env = PHASES[3];
  push({ at: 3, step: 'entry', entry: 'ok', exit: 'pending', caption: `Environment setup: ${env.activities.charAt(0).toLowerCase() + env.activities.slice(1)}.` });
  const envPredict =
    'Test cases are signed off and the build has arrived. What decides whether test execution may start right now?';
  if (p.envReady === 'yes') {
    done.push(3);
    deliverables.push(env.deliverable);
    push({ at: 3, step: 'work', entry: 'ok', exit: 'ok', caption: 'Environment smoke check passes: URLs respond, test accounts log in, test data is loaded. Exit criteria met.', predict: envPredict });
  } else {
    push({ at: 3, step: 'work', entry: 'ok', exit: 'fail', caption: 'Environment smoke check FAILS: the payment sandbox is not configured and test data is missing. Exit criteria not met.', predict: envPredict });
    push({
      at: 4,
      step: 'blocked',
      entry: 'fail',
      exit: 'pending',
      caption: 'Execution is BLOCKED: its entry criteria require a ready environment. Testers log an environment issue and report the schedule risk instead of testing on a broken setup (results would be false failures).',
    });
    push({ at: 3, step: 'entry', entry: 'ok', exit: 'pending', caption: 'Back in environment setup: the ops/DevOps team fixes the config and reloads test data.' });
    done.push(3);
    deliverables.push(env.deliverable);
    push({ at: 3, step: 'work', entry: 'ok', exit: 'ok', caption: 'Environment smoke check re-run: passes. Exit criteria met, but the blocked days are lost from the execution window.' });
  }

  // execution
  const ex = PHASES[4];
  push({ at: 4, step: 'entry', entry: 'ok', exit: 'pending', caption: `Test execution: entry criteria met (${ex.entry.toLowerCase()}). Build 1.0 is installed.` });
  if (v) {
    push({ at: 4, step: 'work', entry: 'ok', exit: 'pending', caption: 'V-model, right arm, bottom up: developers\' component tests are already green; testers start integration testing of the modules and their interfaces.', vHi: [3, 2], vArm: 'right' });
  }
  const rerun = 'Re-run the failed tests on the new build (confirmation testing) and run regression on the areas around the change.';
  if (p.defect === 'none') {
    push({ at: 4, step: 'work', entry: 'ok', exit: 'pending', caption: 'All planned test cases run and pass on build 1.0. The RTM shows every requirement covered.', vHi: v ? [1] : [], vArm: v ? 'right' : 'none' });
    if (v) push({ at: 4, step: 'work', entry: 'ok', exit: 'pending', caption: 'Acceptance testing (UAT): users validate against the requirements from the top of the left arm. All accepted.', vHi: [0], vArm: 'right' });
    push({
      at: 4,
      step: 'work',
      entry: 'ok',
      exit: 'pending',
      caption: 'The last test case has passed.',
      predict: 'Every test passed. Can the team jump straight to closure, or is something checked first?',
    });
  } else {
    const blocker = p.defect === 'blocker';
    const bug = blocker ? 'BUG-42 blocker: checkout crashes on submit' : 'BUG-42 minor: misaligned label on receipt';
    push({
      at: 4,
      step: 'defect',
      entry: 'ok',
      exit: 'pending',
      bug: `${bug} (New)`,
      caption: blocker
        ? 'System testing finds BUG-42: checkout crashes. Every checkout-dependent test is now blocked, so the suspension criterion in the plan is met and execution is paused.'
        : 'System testing finds BUG-42: a misaligned label (low severity). It is logged with steps, evidence and severity; execution continues with the other tests.',
      vHi: v ? [1] : [],
      vArm: v ? 'right' : 'none',
      predict: blocker
        ? 'A blocker stops the checkout tests. Where does the token go next, and what must come back before testing resumes?'
        : 'This defect is minor. Does execution stop while it is fixed?',
    });
    if (!blocker) {
      push({ at: 4, step: 'work', entry: 'ok', exit: 'pending', bug: `${bug} (Assigned)`, caption: 'Execution carries on: the remaining test cases run while the developer fixes BUG-42 in parallel.' });
    }
    push({
      at: 'dev',
      step: 'dev',
      entry: 'ok',
      exit: 'pending',
      loop: true,
      bug: `${bug} (Fixed)`,
      caption: blocker
        ? 'The loop back: the defect goes to development. The developer reproduces, fixes, unit-tests and ships build 1.1. Testers keep working on unaffected areas if any.'
        : 'The fix goes into build 1.1 with other changes. A minor defect does not need an emergency build; it rides the next planned one.',
    });
    push({ at: 4, step: 'retest', entry: 'ok', exit: 'pending', loop: true, bug: `${bug} (Retest)`, caption: `Build 1.1 arrives and passes smoke. ${rerun}` });
    push({
      at: 4,
      step: 'retest',
      entry: 'ok',
      exit: 'pending',
      bug: `${bug} (Closed)`,
      caption: 'Confirmation test passes, so BUG-42 is verified and closed. Regression shows the fix broke nothing else.' + (blocker ? ' The blocked checkout tests now run to the end.' : ''),
    });
    if (v) push({ at: 4, step: 'work', entry: 'ok', exit: 'pending', caption: 'Acceptance testing (UAT) on build 1.1: users validate the system against the original requirements. Accepted.', vHi: [0], vArm: 'right' });
    push({
      at: 4,
      step: 'work',
      entry: 'ok',
      exit: 'pending',
      bug: `${bug} (Closed)`,
      caption: 'All planned tests have now run on the final build.',
      predict: 'Is "all tests have run" enough to leave execution?',
    });
  }
  done.push(4);
  deliverables.push(ex.deliverable);
  push({
    at: 4,
    step: 'work',
    entry: 'ok',
    exit: 'ok',
    caption: `Exit criteria checked, not assumed: ${ex.exit.toLowerCase()}.${p.defect !== 'none' ? ' BUG-42 is closed, so nothing critical is open.' : ''} Deliverable: ${ex.deliverable}.`,
  });

  // closure
  const cl = PHASES[5];
  push({ at: 5, step: 'entry', entry: 'ok', exit: 'pending', caption: `Test closure: entry met (${cl.entry.toLowerCase()}).` });
  done.push(5);
  deliverables.push(cl.deliverable);
  push({
    at: 5,
    step: 'done',
    entry: 'ok',
    exit: 'ok',
    caption: `Closure: ${cl.activities.charAt(0).toLowerCase() + cl.activities.slice(1)}. ${
      p.defect === 'blocker' ? 'Lessons learned: the checkout blocker cost a build cycle; add an API test earlier.' : p.envReady === 'no' ? 'Lessons learned: environment readiness slipped; add an env checklist to planning.' : 'Testware is archived for the next release.'
    }`,
  });
  return frames;
}
