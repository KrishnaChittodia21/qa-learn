// Pure simulation of a defect (bug) life cycle in a tracker such as Jira. A bug token moves
// between statuses; every transition names who acts (tester, lead/triage, developer).
// Severity (impact) and priority (urgency) are independent: priority drives deferral.
import type { BaseFrame } from '../../core';

export type Status =
  | 'New'
  | 'Assigned'
  | 'Open'
  | 'Fixed'
  | 'Retest'
  | 'Verified'
  | 'Closed'
  | 'Rejected'
  | 'Duplicate'
  | 'Deferred'
  | 'Not a bug'
  | 'Cannot reproduce'
  | 'Reopened';

export type Scenario = 'happy' | 'reopen' | 'duplicate' | 'deferred' | 'norepro';
export type BugKind = 's1p1' | 's2p3' | 's4p2';
export type Actor = 'tester' | 'lead' | 'developer' | 'PO';

export interface Params {
  scenario: Scenario;
  bug: BugKind;
}
export const DEFAULT_PARAMS: Params = { scenario: 'reopen', bug: 's1p1' };

export const BUGS: Record<BugKind, { title: string; severity: string; priority: string; note: string }> = {
  s1p1: { title: 'Checkout crashes on Pay', severity: 'S1 critical', priority: 'P1', note: 'high severity, high priority' },
  s2p3: { title: 'CSV export crashes for 10k+ rows', severity: 'S2 major', priority: 'P3', note: 'high severity, low priority (rare feature)' },
  s4p2: { title: 'Company name misspelt on home page', severity: 'S4 trivial', priority: 'P2', note: 'low severity, high priority (brand)' },
};

/** layout positions (viewBox 600 wide) */
export const NODES: Record<Status, { x: number; y: number }> = {
  New: { x: 40, y: 150 },
  Assigned: { x: 125, y: 150 },
  Open: { x: 210, y: 150 },
  Fixed: { x: 295, y: 150 },
  Retest: { x: 380, y: 150 },
  Verified: { x: 465, y: 150 },
  Closed: { x: 555, y: 150 },
  Duplicate: { x: 45, y: 60 },
  Rejected: { x: 145, y: 60 },
  Deferred: { x: 245, y: 60 },
  'Cannot reproduce': { x: 110, y: 240 },
  'Not a bug': { x: 245, y: 240 },
  Reopened: { x: 400, y: 240 },
};

export const EDGES: [Status, Status][] = [
  ['New', 'Assigned'],
  ['Assigned', 'Open'],
  ['Open', 'Fixed'],
  ['Fixed', 'Retest'],
  ['Retest', 'Verified'],
  ['Verified', 'Closed'],
  ['New', 'Duplicate'],
  ['New', 'Rejected'],
  ['New', 'Deferred'],
  ['Deferred', 'Assigned'],
  ['Open', 'Not a bug'],
  ['Open', 'Cannot reproduce'],
  ['Cannot reproduce', 'Assigned'],
  ['Retest', 'Reopened'],
  ['Reopened', 'Assigned'],
  ['Duplicate', 'Closed'],
  ['Rejected', 'Closed'],
  ['Not a bug', 'Closed'],
];

export interface Frame extends BaseFrame {
  status: Status;
  actor: Actor;
  /** statuses visited so far (path trail) */
  trail: Status[];
  assignee: string;
  /** short history lines for the ticket panel (latest last) */
  history: string[];
  /** fix attempts so far */
  attempt: number;
}

export function simulate({ scenario, bug }: Params): Frame[] {
  const b = BUGS[bug];
  const frames: Frame[] = [];
  const trail: Status[] = [];
  const history: string[] = [];
  let attempt = 0;
  const go = (status: Status, actor: Actor, assignee: string, log: string, caption: string, predict?: string) => {
    if (trail[trail.length - 1] !== status) trail.push(status);
    history.push(log);
    frames.push({ status, actor, assignee, caption, predict, trail: [...trail], history: [...history], attempt });
  };

  // a deferred P1 is refused: deferral is a priority decision
  const sc: Scenario = scenario === 'deferred' && b.priority === 'P1' ? 'happy' : scenario;

  go('New', 'tester', 'unassigned', `tester: logged "${b.title}"`,
    `Tester finds "${b.title}" and logs BUG-311 as New: title, steps to reproduce, expected vs actual, environment/build, screenshot/log, and severity ${b.severity}.`);
  go('New', 'tester', 'unassigned', 'tester: attached video + HAR log',
    'A good report is reproducible on its own: exact steps, test data, build number and evidence. Before saving, the tester searched for an existing ticket.');

  const triagePredict = 'At triage the lead decides what happens to a New bug. Which outcomes are possible besides "assign it"?';

  if (sc === 'duplicate') {
    go('New', 'lead', 'unassigned', 'lead: triage', 'Triage: the QA/dev lead reviews New bugs daily, checks validity, sets priority and looks for duplicates.', triagePredict);
    go('Duplicate', 'lead', 'unassigned', 'lead: duplicate of BUG-298',
      'The lead finds BUG-298 with the same root cause (another tester logged it on Monday). BUG-311 is marked Duplicate and linked to BUG-298.');
    go('Duplicate', 'tester', 'unassigned', 'tester: added extra steps to BUG-298',
      'The tester copies anything new (a second way to trigger it, the video) onto BUG-298 so no information is lost.');
    go('Closed', 'lead', '—', 'lead: closed as duplicate',
      'BUG-311 is Closed as a duplicate. Only one ticket is worked on, so developer effort and metrics are not double-counted.',
      'BUG-311 is closed, but the defect still exists. How will the tester know the scenario from BUG-311 is really fixed?');
    go('Assigned', 'lead', 'dev: Arjun', 'BUG-298: assigned to Arjun', 'Following the original: BUG-298 is Assigned to developer Arjun.');
    go('Open', 'developer', 'dev: Arjun', 'BUG-298: Arjun investigating', 'BUG-298 Open: Arjun reproduces it and finds the root cause.');
    go('Fixed', 'developer', 'dev: Arjun', 'BUG-298: fix in build 2.4.1', 'BUG-298 Fixed: the fix is code-reviewed and deployed to the test environment in build 2.4.1.');
    go('Retest', 'tester', 'qa: Priya', 'BUG-298: retest incl. BUG-311 steps',
      'BUG-298 Retest: the tester runs the confirmation test with the steps from BOTH tickets, plus regression around checkout.');
    go('Verified', 'tester', 'qa: Priya', 'BUG-298: verified', 'Both reproduction paths now pass: BUG-298 is Verified.');
    go('Closed', 'tester', '—', 'BUG-298: closed', 'BUG-298 Closed. The duplicate was never fixed separately; it rode along with the original.');
    return frames;
  }

  if (sc === 'deferred') {
    go('New', 'lead', 'unassigned', 'lead: triage', `Triage with the product owner: severity ${b.severity}, priority set to ${b.priority} (${b.note}). Release 2.4 ships Friday.`, triagePredict);
    go('Deferred', 'PO', 'backlog', 'PO: deferred to release 2.5',
      'Product owner and lead agree: the fix is not worth the risk this close to release. Status Deferred, fix version 2.5, and it goes into the release notes as a known issue.',
      'Deferred bugs stay in the tracker. Is a Deferred bug closed?');
    go('Deferred', 'lead', 'backlog', 'lead: listed in known issues',
      'No. Deferred means "valid, fix later". It stays open in the backlog and is counted in the release\'s open-defect report.');
    go('Assigned', 'lead', 'dev: Arjun', 'lead: assigned for 2.5', 'Release 2.5 planning: the bug is pulled into the sprint and Assigned to developer Arjun.');
  } else {
    go('New', 'lead', 'unassigned', 'lead: triage → valid', `Triage: the lead confirms it is valid and new, and sets priority ${b.priority} (${b.note}). Severity is impact; priority is urgency.`, triagePredict);
    if (scenario === 'deferred') go('New', 'PO', 'unassigned', 'PO: deferral refused (P1)', 'The PO asked to defer it, but a P1 cannot wait for the next release: deferral is a priority call, and this one blocks revenue.');
    go('Assigned', 'lead', 'dev: Arjun', 'lead: assigned to Arjun', 'The lead Assigns BUG-311 to developer Arjun, who owns the checkout module.');
  }
  go('Assigned', 'developer', 'dev: Arjun', 'Arjun: acknowledged', `Arjun acknowledges. Priority sets the timing: ${b.priority === 'P1' ? 'P1 means fix now, ahead of feature work' : b.priority === 'P2' ? 'P2 means fix this sprint' : 'P3 means fix when capacity allows'}.`);

  if (sc === 'norepro') {
    go('Open', 'developer', 'dev: Arjun', 'Arjun: investigating', 'Arjun moves it to Open and tries the steps on his machine and on the test environment.');
    go('Cannot reproduce', 'developer', 'qa: Priya', 'Arjun: cannot reproduce',
      'Everything works for Arjun. He sets Cannot reproduce and sends it back to the tester with what he tried (Chrome 129, user test01).',
      'The bug is real for the tester but not for the developer. What should the tester do: close it, or something else?');
    go('Cannot reproduce', 'tester', 'qa: Priya', 'Priya: added env details',
      'The tester re-runs it and compares: it only fails on Safari 17 with a saved card. She adds browser version, the test account, a console log and a video.');
    go('Assigned', 'tester', 'dev: Arjun', 'Priya: reassigned with details', 'Reassigned to Arjun with the missing conditions. A good bug report names the environment and data, not just the steps.');
  }

  const fixCycle = (n: number) => {
    attempt = n;
    go('Open', 'developer', 'dev: Arjun', `Arjun: working (attempt ${n})`, n === 1 ? 'Arjun moves BUG-311 to Open: he reproduces it and finds the root cause.' : 'Open again: Arjun looks at the failing path the tester described in the reopen comment.');
    go('Fixed', 'developer', 'qa: Priya', `Arjun: fixed in build 2.4.${n}`, `Fixed: code change reviewed and unit-tested, with root cause noted on the ticket. It goes back to the tester; a developer never closes their own bug.`);
    go('Fixed', 'tester', 'qa: Priya', `build 2.4.${n} deployed to QA`, `"Fixed" is not "done": the tester can only retest once build 2.4.${n} with the fix is deployed to the test environment and passes smoke.`);
    const failsNow = n === 1 && sc === 'reopen';
    go('Retest', 'tester', 'qa: Priya', `Priya: confirmation test on 2.4.${n}`,
      'Retest: the tester repeats the exact original steps on the new build (confirmation testing). They pass.',
      failsNow ? 'The original steps pass, but the tester also tries the same flow with a saved card. What if that still crashes?' : undefined);
    if (!failsNow) go('Retest', 'tester', 'qa: Priya', 'Priya: regression around checkout green', 'Then regression testing around the change (cart, payment, order history) to make sure the fix broke nothing nearby.');
  };

  if (sc === 'reopen') {
    fixCycle(1);
    go('Reopened', 'tester', 'dev: Arjun', 'Priya: reopened (saved-card path fails)',
      'The saved-card path still crashes, so the fix was incomplete. The tester sets Reopened with evidence. A different symptom would be a new bug; the same defect is reopened.');
    go('Assigned', 'lead', 'dev: Arjun', 'lead: reassigned', 'Reopened bugs go back to the same developer. Reopen counts are a quality metric the lead watches.');
    fixCycle(2);
  } else {
    fixCycle(1);
  }
  go('Verified', 'tester', 'qa: Priya', 'Priya: verified', 'Verified: the defect no longer reproduces and the regression around it is green.',
    sc === 'reopen' ? undefined : 'Verified. Who closes the ticket, and is anything left to check?');
  go('Closed', 'tester', '—', 'Priya: closed',
    `Closed by the tester (or lead) after verification${sc === 'deferred' ? ' in release 2.5' : ''}. Path: ${trail.concat('Closed').filter((s, i, a) => a.indexOf(s) === i).join(' → ')}.`);
  return frames;
}
