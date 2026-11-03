// Shorts (M7): ~90-second animated stories, each attached to one lesson section (topic id + the start of its heading).
// Six famous software failures told as QA stories, and six "how X works". Figures are the commonly reported ones
// (inquiry boards, the SEC, CrowdStrike's own review); where sources disagree the text says "about" or leaves it out.
// Checked by scripts/validate-shorts.mjs (npm run validate) and tests/shorts.test.ts.
import type { Short } from '../types';

export const SHORTS_DATA: Short[] = [
  // ---------------- famous failures ----------------
  {
    id: 'ariane-5-overflow',
    title: 'Ariane 5: 37 seconds',
    topic: 'mt-fundamentals',
    heading: 'Error, defect, failure and root cause',
    tags: ['failure', 'reuse', 'boundaries'],
    beats: [
      { type: 'counter', kicker: '4 June 1996 · Kourou', head: 'The first Ariane 5 *lifts off*', value: 37, unit: 'seconds of flight', sub: 'Then it veers off course, breaks up and **self-destructs**.' },
      { type: 'spike', kicker: 'Inside the guidance computer', head: 'A *horizontal velocity* value grows', mark: 'too big for 16 bits', sub: 'A 64-bit float is converted to a **16-bit signed integer** (max 32,767). The conversion overflows.' },
      { type: 'flow', kicker: 'One unhandled error', head: 'How a number became a crash', steps: ['Overflow in the inertial reference system', 'Backup unit fails the same way', 'Diagnostic data read as flight data', 'Nozzles swing hard over', 'Rocket breaks up'], broken: 0 },
      { type: 'toggles', kicker: 'Why nobody caught it', head: 'The code came from *Ariane 4*', items: [{ label: 'Same software, reused' }, { label: 'Ariane 5 flies faster sideways' }, { label: 'Flight profile never re-tested', keep: true }], keepLabel: 'THE GAP', sub: 'On Ariane 4 the value could never get that big, so the check was left out.' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which test would most likely have caught it?', answer: 1, options: [
        { text: 'More unit tests of the conversion routine', why: 'The routine did what it was written to do. The inputs were the problem.' },
        { text: 'Testing with Ariane 5 flight data at its real boundaries', why: 'The defect only shows with Ariane 5 values, past the old 16-bit boundary.' },
        { text: 'A longer launch countdown', why: 'Nothing on the ground exercised the in-flight value.' },
      ] },
    ],
    takeaway: { head: 'Reused code needs *new* tests', sub: 'An error (a wrong assumption) caused a defect (no overflow check) that became a **failure** in flight. Re-test reused code at the new system’s boundaries.' },
  },
  {
    id: 'knight-capital-deploy',
    title: 'Knight Capital: 45 minutes',
    topic: 'mt-agile-release',
    heading: 'Release validation and the go/no-go decision',
    tags: ['failure', 'deployment', 'release'],
    beats: [
      { type: 'counter', kicker: '1 August 2012 · New York', head: 'A trading firm *goes live* with new code', value: 45, unit: 'minutes of runaway trading', sub: 'Millions of unintended orders before anyone stops it.' },
      { type: 'grid', kicker: 'The deploy', head: 'Eight servers. *Seven* got the new code.', cells: 8, caption: 'One server was missed by the **manual** deployment.' },
      { type: 'flow', kicker: 'A reused flag', head: 'The old code wakes up', steps: ['New code reuses an old flag', 'Flag is switched on', 'Seven servers: new feature', 'One server: dead "Power Peg" code runs', 'Orders flood the market'], broken: 3 },
      { type: 'counter', kicker: 'The bill', head: 'Losses reported by the *SEC*', value: 460, suffix: 'M', unit: 'US dollars', sub: 'The firm needed a rescue and was taken over within months.' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which release check targets this failure?', answer: 2, options: [
        { text: 'A bigger regression suite on a test server', why: 'Tests passed on correct builds. The live fleet was not all on that build.' },
        { text: 'Faster rollback scripts only', why: 'Helpful, but the bad state should not have reached production.' },
        { text: 'Verify every production server runs the same version before go-live', why: 'A deployment check across all eight servers would have shown the missing one.' },
      ] },
    ],
    takeaway: { head: 'Validate the *release*, not just the build', sub: 'Go/no-go includes **how** code reaches production: every server, every flag, and dead code removed.' },
  },
  {
    id: 'therac-25-race',
    title: 'Therac-25: a race in the treatment room',
    topic: 'mt-defects',
    heading: 'Root cause analysis (RCA) basics',
    tags: ['failure', 'safety', 'rca'],
    beats: [
      { type: 'counter', kicker: '1985 – 1987', head: 'A radiation therapy machine gives *massive overdoses*', value: 6, unit: 'known accidents', sub: 'Several patients died. Others were badly injured.' },
      { type: 'toggles', kicker: 'What changed from older models', head: 'Safety moved into *software*', items: [{ label: 'Hardware interlocks removed' }, { label: 'Software reused from older machines' }, { label: 'Software must keep patients safe', keep: true }], keepLabel: 'ALONE' },
      { type: 'race', kicker: 'The race condition', head: 'A fast operator *beats* the software', lanes: [{ label: 'Operator edits the mode', seconds: 1.5, tone: 'amber' }, { label: 'Machine finishes set-up', seconds: 4, tone: 'blue' }], sub: 'Quick edits were not picked up while set-up ran, so the beam fired in the **wrong configuration**.' },
      { type: 'flow', kicker: 'Why it kept happening', head: 'The root causes, not the symptom', steps: ['"Malfunction 54" told operators nothing', 'Operators could just press P to proceed', 'Early reports were not reproduced', 'No independent review of the code'], broken: 2 },
      { type: 'quiz', kicker: 'Your turn', head: 'An RCA for Therac-25 should end with…', answer: 0, options: [
        { text: 'Fixes to process and design: interlocks, clear errors, independent review', why: 'RCA keeps asking why until it reaches causes that would stop the whole class of failure.' },
        { text: '"Operator error: typed too fast"', why: 'That stops at the symptom. A safe system must survive fast typing.' },
        { text: 'A patch for the one race found', why: 'Needed, but other causes (removed interlocks, vague errors) would remain.' },
      ] },
    ],
    takeaway: { head: 'Ask *why* until it hurts', sub: 'Root cause analysis looks past the bug to the **process** that let it ship and kept it hidden.' },
  },
  {
    id: 'mars-climate-orbiter-units',
    title: 'Mars Climate Orbiter: the wrong units',
    topic: 'mt-test-levels-types',
    heading: 'Integration testing',
    tags: ['failure', 'integration', 'contracts'],
    beats: [
      { type: 'spike', kicker: '23 September 1999', head: 'A Mars probe goes *silent*', mark: 'lost on arrival', sub: 'It reaches Mars and is never heard from again.' },
      { type: 'flow', kicker: 'Two teams, one interface', head: 'The numbers crossed a *boundary*', steps: ['Ground software reports thruster impulse', 'In pound-force seconds', 'Navigation software expects newton-seconds', 'Every value is about 4.45× too small', 'Trajectory drifts for months'], broken: 2 },
      { type: 'ladder', kicker: 'Planned vs actual', head: 'How close it came to Mars', rungs: [{ label: 'Planned', amount: 150 }, { label: 'Actual (estimate)', amount: 57 }], unit: 'km', sub: 'Far too low: it burned up or skipped off the atmosphere.' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which test level is built to catch this?', answer: 1, options: [
        { text: 'Unit testing of each program', why: 'Each program was right in its own units. The mismatch only exists between them.' },
        { text: 'Integration testing of the interface between them', why: 'Integration tests check that what one side sends is what the other side expects, units included.' },
        { text: 'Usability testing', why: 'No user interface was involved in the mistake.' },
      ] },
    ],
    takeaway: { head: 'Bugs live *between* components', sub: 'Integration testing checks the **contract**: format, units, meaning. Each part can pass alone and still fail together.' },
  },
  {
    id: 'crowdstrike-2024-update',
    title: 'CrowdStrike 2024: one file, every machine',
    topic: 'mt-agile-release',
    heading: 'Testing in production',
    tags: ['failure', 'canary', 'rollout'],
    beats: [
      { type: 'counter', kicker: '19 July 2024', head: 'Windows machines *blue-screen* worldwide', value: 8.5, decimals: 1, suffix: 'M', unit: 'devices (Microsoft’s estimate)', sub: 'Airlines, hospitals and banks stop.' },
      { type: 'flow', kicker: 'What was shipped', head: 'Not new code: a *content update*', steps: ['A new detection template expects 21 inputs', 'The sensor supplies only 20', 'The content validator misses it', 'Update goes to every machine at once', 'Out-of-bounds read crashes Windows'], broken: 2 },
      { type: 'race', kicker: 'Fast push, slow fix', head: 'Shipping vs recovering', lanes: [{ label: 'Push the update', seconds: 1, tone: 'rose' }, { label: 'Revert it', seconds: 3, tone: 'amber', after: 0.5 }, { label: 'Fix each crashed PC by hand', seconds: 8, tone: 'blue', after: 1 }], sub: 'The bad file was pulled in **about 78 minutes**, but crashed machines needed manual repair.' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which practice limits the blast radius?', answer: 2, options: [
        { text: 'Testing only in a staging environment', why: 'Staging had passed checks before. Production variety still surprised it.' },
        { text: 'Shipping updates less often', why: 'Slower, but one bad update would still hit everyone.' },
        { text: 'A canary rollout: a small group first, watch, then widen', why: 'A crash in the first small ring stops the rollout before it reaches millions.' },
      ] },
    ],
    takeaway: { head: 'Roll out like you *expect* to be wrong', sub: 'Canaries, staged rings and monitoring turn a global outage into a **small** incident. CrowdStrike added staged rollouts afterwards.' },
  },
  {
    id: 'heathrow-t5-baggage',
    title: 'Heathrow T5: the bags that didn’t fly',
    topic: 'mt-test-levels-types',
    heading: 'System testing and acceptance testing',
    tags: ['failure', 'system-testing', 'uat'],
    beats: [
      { type: 'spike', kicker: '27 March 2008 · London', head: 'Terminal 5 opens and baggage *jams*', mark: 'opening day', sub: 'Flights leave without bags. Hundreds are cancelled in the days after.' },
      { type: 'toggles', kicker: 'What went wrong together', head: 'Not one bug: a *system*', items: [{ label: 'Trials cut short by building delays' }, { label: 'Staff unfamiliar with the systems' }, { label: 'A test-only software filter left on', keep: true }], keepLabel: 'FROM TESTING', sub: 'The filter stopped messages about bags reaching the live system.' },
      { type: 'flow', kicker: 'Opening day', head: 'Small faults, one chain', steps: ['Staff struggle to get in and badge on', 'Bags back up at reclaim and loading', 'System messages filtered out', 'Bags miss flights', 'Flights cancelled to recover'], broken: 2 },
      { type: 'quiz', kicker: 'Your turn', head: 'What would full end-to-end trials have added?', answer: 0, options: [
        { text: 'Real staff, real volumes and the live configuration, together', why: 'System and acceptance testing check the whole thing as it will run, people included.' },
        { text: 'More unit tests of the conveyor software', why: 'Parts worked. The failures came from how they ran together on the day.' },
        { text: 'A faster opening ceremony', why: 'The problem started after the doors opened.' },
      ] },
    ],
    takeaway: { head: 'Test the system you’ll *run*', sub: 'System and acceptance testing use real config, real people and real load, and **remove test-only settings** before go-live.' },
  },

  // ---------------- how X works ----------------
  {
    id: 'test-pyramid',
    title: 'The test pyramid in 90 seconds',
    topic: 'mt-test-levels-types',
    heading: 'The test pyramid',
    tags: ['strategy', 'automation'],
    beats: [
      { type: 'ladder', kicker: 'A healthy suite', head: 'Many *small*, few *big*', rungs: [{ label: 'Unit', amount: 700 }, { label: 'Integration / API', amount: 200 }, { label: 'UI end to end', amount: 40 }], unit: 'tests', sub: 'Example numbers: the **shape** matters, not the count.' },
      { type: 'race', kicker: 'Why the shape', head: 'Feedback *speed*', lanes: [{ label: 'Unit test', seconds: 0.6, tone: 'green' }, { label: 'API test', seconds: 1.6, tone: 'cyan' }, { label: 'UI test', seconds: 5, tone: 'amber' }], sub: 'Lower tests run in milliseconds and point at the broken line. UI tests are slower and flakier.' },
      { type: 'toggles', kicker: 'The ice-cream cone', head: 'The *upside-down* pyramid', items: [{ label: 'Mostly manual and UI tests' }, { label: 'Few unit tests' }, { label: 'Slow, flaky pipeline', keep: true }], keepLabel: 'RESULT' },
      { type: 'quiz', kicker: 'Your turn', head: 'A price rounding rule is wrong. Where is the best test?', answer: 0, options: [
        { text: 'A unit test of the rounding function', why: 'Pure logic: fastest to run and points straight at the bug.' },
        { text: 'A UI test that buys a product', why: 'It would catch it, slowly, and fail for many other reasons too.' },
        { text: 'Manual exploratory testing only', why: 'Good for finding it once, not for keeping it fixed.' },
      ] },
    ],
    takeaway: { head: 'Test each thing at the *lowest* level that can catch it', sub: 'Keep UI tests for **user journeys**. Push logic checks down to unit and API tests.' },
  },
  {
    id: 'flaky-test-triage',
    title: 'Passes locally, fails in CI',
    topic: 'pw-debug-flaky',
    heading: 'A triage playbook',
    tags: ['flaky', 'playwright', 'ci'],
    beats: [
      { type: 'grid', kicker: 'The symptom', head: 'Same test, same code, *different* results', cells: 20, caption: 'Run it 20 times: a flaky test fails **some** of them.' },
      { type: 'flow', kicker: 'The playbook', head: 'Triage in order', steps: ['Open the trace from the failed CI run', 'Reproduce: --repeat-each=20', 'Find the cause: timing, data, order or environment', 'Fix the cause, not the symptom', 'Prove it: repeat again, all green'] },
      { type: 'toggles', kicker: 'Fixes that are not fixes', head: 'Switch these *off*', items: [{ label: 'waitForTimeout(3000)' }, { label: 'Retries hiding a real failure' }, { label: 'Web-first assertions that wait', keep: true }], keepLabel: 'KEEP' },
      { type: 'quiz', kicker: 'Your turn', head: 'A test fails only when run with others. Likely cause?', answer: 1, options: [
        { text: 'The browser is too slow', why: 'Speed would make it fail alone too.' },
        { text: 'Shared state: tests depend on data another test changes', why: 'Order- and parallel-dependent failures usually mean tests are not isolated.' },
        { text: 'The locator is wrong', why: 'A wrong locator fails every time, alone or not.' },
      ] },
    ],
    takeaway: { head: 'Flaky is a *bug*, not bad luck', sub: 'Trace it, reproduce it with **--repeat-each**, fix the cause and prove the fix.' },
  },
  {
    id: 'playwright-auto-wait',
    title: 'Why Playwright rarely needs sleep()',
    topic: 'pw-assertions-waiting',
    heading: 'Auto-waiting and actionability checks',
    tags: ['playwright', 'waiting'],
    beats: [
      { type: 'flow', kicker: 'await page.getByRole(\'button\').click()', head: 'Before every click, Playwright *checks*', steps: ['Resolves to exactly one element', 'Visible', 'Stable (not animating)', 'Receives events (not covered)', 'Enabled', 'Then it clicks'] },
      { type: 'race', kicker: 'Fixed sleep vs auto-wait', head: 'Waiting *just long enough*', lanes: [{ label: 'sleep(3000): always 3 s', seconds: 3, tone: 'rose' }, { label: 'Auto-wait: ready at 0.8 s', seconds: 0.8, tone: 'green' }], sub: 'A sleep is too long when the app is fast and **too short** when CI is slow.' },
      { type: 'counter', kicker: 'If it never gets ready', head: 'The action fails after its *timeout*', value: 30, unit: 'seconds: the default test timeout', sub: 'Actions themselves have no timeout by default: the test timeout is the limit.' },
      { type: 'quiz', kicker: 'Your turn', head: 'A spinner covers the button. What does click() do?', answer: 2, options: [
        { text: 'Clicks the spinner instead', why: 'The "receives events" check sees the overlay and keeps waiting.' },
        { text: 'Fails immediately', why: 'It retries until the check passes or time runs out.' },
        { text: 'Waits until the spinner is gone, then clicks', why: 'Actionability checks retry until the button is the one that would receive the click.' },
      ] },
    ],
    takeaway: { head: 'Wait for a *state*, never for a time', sub: 'Actions auto-wait and web-first assertions retry. **No fixed sleeps.**' },
  },
  {
    id: 'ci-quality-gates',
    title: 'CI gates: what stops a bad merge',
    topic: 'pw-git-ci',
    heading: 'Tags, selective runs and pipeline strategy',
    tags: ['ci', 'pipeline'],
    beats: [
      { type: 'flow', kicker: 'One pull request', head: 'Every gate must be *green*', steps: ['Lint and type-check', 'Unit tests', 'API tests', 'Smoke UI tests (@smoke)', 'Review approved', 'Merge'], broken: 3 },
      { type: 'race', kicker: 'Order matters', head: 'Fail *fast*, fail cheap', lanes: [{ label: 'Lint: seconds', seconds: 0.5, tone: 'green' }, { label: 'Unit: a minute', seconds: 1.2, tone: 'cyan' }, { label: 'Full UI regression: nightly', seconds: 5, tone: 'blue' }], sub: 'Cheap checks first, so a typo never waits behind a 40-minute suite.' },
      { type: 'toggles', kicker: 'On every PR vs nightly', head: 'Pick what *runs when*', items: [{ label: 'Full cross-browser regression' }, { label: 'Slow visual checks' }, { label: '@smoke on every PR', keep: true }], keepLabel: 'ALWAYS' },
      { type: 'quiz', kicker: 'Your turn', head: 'The smoke gate fails on a PR. What should happen?', answer: 0, options: [
        { text: 'The merge is blocked until it is fixed or proven flaky and quarantined', why: 'A gate that can be ignored is not a gate.' },
        { text: 'Merge anyway and fix it tomorrow', why: 'Main is now red for everyone.' },
        { text: 'Re-run until it passes', why: 'That hides a real failure or a flaky test.' },
      ] },
    ],
    takeaway: { head: 'Gates turn quality into a *rule*', sub: 'Fast checks on every PR, the slow full suite on a schedule, and **red means stop**.' },
  },
  {
    id: 'boundary-values',
    title: 'Where the bugs hide: boundaries',
    topic: 'mt-test-design',
    heading: 'Boundary Value Analysis (BVA)',
    tags: ['test-design', 'bva'],
    beats: [
      { type: 'grid', kicker: 'Age field: 18 to 60 allowed', head: 'You can’t test *every* value', cells: 48, caption: 'Equivalence partitioning: **one** value per group stands for the rest.' },
      { type: 'flow', kicker: '2-value BVA', head: 'Test each *edge* and its neighbour', steps: ['17 → rejected', '18 → accepted', '60 → accepted', '61 → rejected'] },
      { type: 'toggles', kicker: 'Why edges', head: 'Developers write *comparisons*', items: [{ label: 'age > 18 instead of age >= 18' }, { label: 'age < 60 instead of age <= 60' }, { label: 'Only an edge value catches these', keep: true }], keepLabel: 'BVA' },
      { type: 'quiz', kicker: 'Your turn', head: 'Code says age > 18. Which test catches it?', answer: 1, options: [
        { text: 'Age 30', why: '30 is accepted either way.' },
        { text: 'Age 18', why: 'Expected accepted, but > 18 rejects it: the off-by-one shows.' },
        { text: 'Age 17', why: '17 is rejected either way.' },
      ] },
    ],
    takeaway: { head: 'Bugs cluster at the *edges*', sub: 'Partition the inputs, then test **on and next to** every boundary.' },
  },
  {
    id: 'risk-based-testing',
    title: 'Risk-based testing: test what hurts first',
    topic: 'mt-exploratory-risk',
    heading: 'Risk-based testing',
    tags: ['risk', 'prioritisation'],
    beats: [
      { type: 'counter', kicker: 'Release in two days', head: 'More tests than *time*', value: 240, unit: 'test cases, 60 hours of work', sub: 'You have 16 hours. What runs?' },
      { type: 'ladder', kicker: 'Risk = likelihood × impact (1–5 each)', head: 'Score each area', rungs: [{ label: 'Payment', amount: 20 }, { label: 'Checkout', amount: 16 }, { label: 'Search', amount: 9 }, { label: 'Profile photo', amount: 4 }], unit: 'risk' },
      { type: 'toggles', kicker: 'The plan', head: 'Go *deep* where it hurts', items: [{ label: 'Profile photo: quick smoke only' }, { label: 'Search: main paths' }, { label: 'Payment and checkout: full depth', keep: true }], keepLabel: 'FIRST' },
      { type: 'quiz', kicker: 'Your turn', head: 'A rarely used admin report can corrupt billing data. Its risk is…', answer: 2, options: [
        { text: 'Low: few people use it', why: 'Low likelihood, but the impact is severe.' },
        { text: 'Not worth testing', why: 'Billing corruption is exactly what risk-based testing protects.' },
        { text: 'Significant: high impact keeps it near the top', why: 'Risk weighs impact too. A rare path that damages money still ranks high.' },
      ] },
    ],
    takeaway: { head: 'Spend time where *failure costs most*', sub: 'Score likelihood × impact, test high risk first and **say out loud** what you did not test.' },
  },
];

const BEAT_TYPES = new Set(['counter', 'spike', 'race', 'grid', 'ladder', 'toggles', 'flow', 'quiz']);
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

/** What is wrong with these Shorts (empty when fine). `headings`: topic id → its section headings. */
export function shortProblems(shorts: Short[], headings: Map<string, string[]>): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  for (const s of shorts) {
    const at = `short ${s.id || '(no id)'}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id ?? '')) out.push(`${at}: id must be kebab-case`);
    if (ids.has(s.id)) out.push(`${at}: duplicate id`);
    ids.add(s.id);
    if (!s.title?.trim()) out.push(`${at}: no title`);
    if (!s.takeaway?.head?.trim() || !s.takeaway?.sub?.trim()) out.push(`${at}: no takeaway`);
    const hs = headings.get(s.topic);
    if (!hs) out.push(`${at}: unknown topic ${s.topic}`);
    else if (!s.heading?.trim() || !hs.some((h) => h.startsWith(s.heading))) out.push(`${at}: no section in ${s.topic} starts with "${s.heading}"`);
    if (!Array.isArray(s.beats) || s.beats.length < 3) out.push(`${at}: needs at least 3 beats`);
    const beats = s.beats ?? [];
    if (beats.filter((b) => b.type === 'quiz').length !== 1) out.push(`${at}: needs exactly one quiz`);
    beats.forEach((b, i) => {
      const bt = `${at} beat ${i + 1}`;
      if (!BEAT_TYPES.has(b.type)) return void out.push(`${bt}: unknown beat type "${b.type}"`);
      if (!b.kicker?.trim()) out.push(`${bt}: no kicker`);
      switch (b.type) {
        case 'counter': if (!num(b.value) || !b.unit) out.push(`${bt}: counter needs a number and a unit`); break;
        case 'race': if (!b.lanes?.length || b.lanes.some((l) => !num(l.seconds) || l.seconds <= 0)) out.push(`${bt}: race lanes need seconds > 0`); break;
        case 'grid': if (!num(b.cells) || b.cells < 1 || b.cells > 120) out.push(`${bt}: grid needs 1–120 cells`); break;
        case 'ladder': if (!b.rungs?.length || b.rungs.some((r) => !num(r.amount) || r.amount < 0)) out.push(`${bt}: ladder rungs need amounts`); break;
        case 'toggles': if (!b.items?.length) out.push(`${bt}: toggles need items`); break;
        case 'flow': if (!b.steps?.length || (b.broken !== undefined && !(b.broken >= 0 && b.broken < b.steps.length))) out.push(`${bt}: flow needs steps (and broken inside them)`); break;
        case 'spike': if (!b.mark) out.push(`${bt}: spike needs a mark`); break;
        case 'quiz':
          if (!b.options || b.options.length < 2 || b.options.some((o) => !o.text?.trim() || !o.why?.trim())) out.push(`${bt}: quiz needs 2+ options, each with text and why`);
          else if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer >= b.options.length) out.push(`${bt}: quiz answer must point at an option`);
          break;
      }
    });
  }
  return out;
}
