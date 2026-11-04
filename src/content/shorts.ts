// Shorts (M7): ~90-second animated stories, each attached to one lesson section (topic id + the start of its heading).
// Famous software failures told as QA stories, and "how X works" stories. Figures are the commonly reported ones
// (inquiry boards, the SEC, the companies' own postmortems); where sources disagree the text says "about" or leaves it out.
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
      { type: 'counter', kicker: '4 June 1996 · Kourou', head: 'The first Ariane 5 *lifts off*', value: 37, unit: 'seconds after main-engine ignition', sub: 'Guidance is lost. It veers off course, breaks up and **self-destructs**.' },
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
      { type: 'counter', kicker: 'Arrival', head: 'How close it came to Mars', value: 57, unit: 'km above the surface (estimate)', sub: 'Far below the planned path: it burned up or skipped off the atmosphere.' },
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

  // ---------------- batch 2: more failures and more "how it works" ----------------
  {
    id: 'patriot-clock-drift',
    title: 'Patriot missile: a third of a second',
    topic: 'js-basics',
    heading: 'Number gotchas',
    tags: ['failure', 'numbers', 'precision'],
    beats: [
      { type: 'counter', kicker: '25 February 1991 · Dhahran', head: 'A missile defence system *misses* an incoming Scud', value: 28, unit: 'soldiers killed', sub: 'The system had been running for days without a restart.' },
      { type: 'flow', kicker: 'One tiny rounding error', head: 'How a clock drifted', steps: ['The clock counts tenths of a second', '1/10 has no exact binary form', 'Stored in 24 bits, it is chopped', 'Each tick adds a tiny error', 'The errors pile up hour after hour'], broken: 2 },
      { type: 'ladder', kicker: 'After about 100 hours', head: 'The drift *added up*', rungs: [{ label: 'Hour 1', amount: 0.0034 }, { label: 'Hour 100', amount: 0.34 }], unit: 's off', sub: 'A third of a second is enough to look in the **wrong place** for a fast missile.' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which test would have exposed it?', answer: 1, options: [
        { text: 'A quick test right after a restart', why: 'The error is tiny at first. It only matters after many hours.' },
        { text: 'A long-running (soak) test: days of uptime, checking accuracy', why: 'Accumulated error only shows when the system runs as long as it does in the field.' },
        { text: 'More tests with round numbers', why: 'The problem is a number with no exact binary form, used millions of times.' },
      ] },
    ],
    takeaway: { head: 'Small errors *accumulate*', sub: 'Floating-point values like 0.1 are inexact. Test **long runs** and compare with tolerances, not with ===.' },
  },
  {
    id: 'healthcare-gov-launch',
    title: 'HealthCare.gov: launch day',
    topic: 'mt-test-levels-types',
    heading: 'Performance and security awareness',
    tags: ['failure', 'performance', 'load'],
    beats: [
      { type: 'counter', kicker: '1 October 2013', head: 'A national health insurance site *goes live*', value: 4.7, decimals: 1, suffix: 'M', unit: 'visitors on day one (reported)', sub: 'Pages time out, accounts fail to create.' },
      { type: 'counter', kicker: 'Enrolled through the site', head: 'People who got all the way *through*', value: 6, unit: 'on day one (about, from internal notes)', sub: 'By the end of day two: **248**.' },
      { type: 'toggles', kicker: 'What was missing', head: 'Tested in parts, not as a *whole*', items: [{ label: 'Pieces built by many contractors' }, { label: 'Little end-to-end testing before launch' }, { label: 'Load like launch day never rehearsed', keep: true }], keepLabel: 'THE GAP' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which test targets launch-day traffic?', answer: 2, options: [
        { text: 'A smoke test of the home page', why: 'One user checking one page says nothing about millions at once.' },
        { text: 'More unit tests of the sign-up form', why: 'The form can be correct and still fail under load.' },
        { text: 'A load test at expected peak, end to end through every system', why: 'Load testing the whole journey at realistic volume shows where it breaks before users do.' },
      ] },
    ],
    takeaway: { head: 'Correct is not the same as *ready*', sub: 'Functional tests prove it works for one user. **Load tests** prove it works for all of them, end to end.' },
  },
  {
    id: 'status-code-families',
    title: 'Status codes in 60 seconds',
    topic: 'api-http',
    heading: 'Status codes',
    tags: ['api', 'http'],
    beats: [
      { type: 'flow', kicker: 'Five families', head: 'The first digit tells you *who* to blame', steps: ['1xx: informational (rare)', '2xx: success', '3xx: go somewhere else', '4xx: the client sent something wrong', '5xx: the server failed'] },
      { type: 'flow', kicker: 'The ones that matter', head: 'Know these by heart', steps: ['200 OK, 201 Created, 204 No Content', '400 Bad Request: invalid input', '401 not logged in, 403 not allowed', '404 Not Found, 409 Conflict', '500 server bug, 503 unavailable'] },
      { type: 'toggles', kicker: 'A classic bug', head: 'Errors dressed as *success*', items: [{ label: '200 OK with { "error": "failed" }' }, { label: '500 for a missing field' }, { label: '400 with a clear message', keep: true }], keepLabel: 'CORRECT' },
      { type: 'quiz', kicker: 'Your turn', head: 'Logged in, but asking for another user’s order. Which code?', answer: 1, options: [
        { text: '401 Unauthorized', why: '401 means not authenticated: you are logged in.' },
        { text: '403 Forbidden (or 404 to hide that it exists)', why: 'Authenticated but not allowed. Some APIs return 404 so they do not reveal the order exists.' },
        { text: '500 Internal Server Error', why: 'Nothing broke on the server: it is a permission decision.' },
      ] },
    ],
    takeaway: { head: 'Assert the *code* and the *body*', sub: 'A 200 with an error inside, or a 500 for bad input, is a **bug** to report.' },
  },
  {
    id: 'loose-vs-strict-equality',
    title: '== vs ===: the coercion trap',
    topic: 'js-basics',
    heading: '== vs === and type coercion',
    tags: ['javascript', 'coercion'],
    beats: [
      { type: 'toggles', kicker: 'Loose equality (==)', head: 'These are all *true*', items: [{ label: "'5' == 5" }, { label: "0 == ''" }, { label: 'null == undefined' }, { label: '[] == false' }], sub: '== converts the types first, then compares.' },
      { type: 'toggles', kicker: 'Strict equality (===)', head: 'No conversion: types must *match*', items: [{ label: "'5' === 5 → false" }, { label: "0 === '' → false" }, { label: 'NaN === NaN → false', keep: true }], keepLabel: 'EVEN THIS', sub: 'NaN is never equal to anything. Use **Number.isNaN()**.' },
      { type: 'quiz', kicker: 'Your turn', head: 'An API returns "200" as a string. Which check passes?', answer: 2, options: [
        { text: "status === 200", why: '=== compares types too: a string is never equal to a number.' },
        { text: "status == 200 is the safe choice", why: 'It passes, but hides that the API sends the wrong type. That may be a bug to report.' },
        { text: "Number(status) === 200, and note the string type", why: 'Convert on purpose, compare strictly, and flag the type mismatch.' },
      ] },
    ],
    takeaway: { head: 'Always use *===*', sub: 'Convert types on purpose (`Number()`, `String()`), then compare strictly. Loose `==` hides **type bugs**.' },
  },
  {
    id: 'missing-await',
    title: 'The missing await',
    topic: 'js-async',
    heading: 'Common async mistakes',
    tags: ['javascript', 'async', 'playwright'],
    beats: [
      { type: 'race', kicker: "page.click('Save') without await", head: 'The test *races ahead*', lanes: [{ label: 'Test: next line runs now', seconds: 0.6, tone: 'rose' }, { label: 'Browser: click still happening', seconds: 3, tone: 'blue' }], sub: 'The next assertion checks a page that has not changed yet.' },
      { type: 'flow', kicker: 'What goes wrong', head: 'A floating promise', steps: ['Action starts, returns a promise', 'Nobody waits for it', 'Test moves on (or ends)', 'Error lands after the test, or never'], broken: 1 },
      { type: 'toggles', kicker: 'The forEach trap', head: 'forEach does not *wait*', items: [{ label: 'items.forEach(async (i) => await save(i))' }, { label: 'for (const i of items) await save(i)', keep: true }], keepLabel: 'WAITS' },
      { type: 'quiz', kicker: 'Your turn', head: 'A test passes locally and fails randomly in CI. You spot an action without await. Why random?', answer: 0, options: [
        { text: 'Whether the action finishes in time depends on machine speed', why: 'Without await, a fast laptop usually finishes the click first; a busy CI runner often does not.' },
        { text: 'CI runs a different Playwright', why: 'Same code, same version: the timing is what differs.' },
        { text: 'await only matters in CI', why: 'It matters everywhere; fast machines just hide the bug.' },
      ] },
    ],
    takeaway: { head: 'Every Playwright call is *awaited*', sub: 'Use `for...of` with await, not `forEach`. The `@typescript-eslint/no-floating-promises` rule catches the rest.' },
  },
  {
    id: 'left-join-where-trap',
    title: 'The LEFT JOIN that turned INNER',
    topic: 'sql-joins-validation',
    heading: 'NULL in joins and the LEFT JOIN + WHERE trap',
    tags: ['sql', 'joins'],
    beats: [
      { type: 'grid', kicker: 'Customers LEFT JOIN orders', head: 'Every customer *kept*', cells: 4, caption: 'Asha, Asha, Ravi and **Meera** (no orders, NULLs on the right).' },
      { type: 'flow', kicker: "Add WHERE o.status = 'paid'", head: 'Meera *vanishes*', steps: ['LEFT JOIN keeps Meera with NULL status', "WHERE checks NULL = 'paid'", 'NULL compared to anything is unknown', 'WHERE drops unknown rows', 'Result: same as an INNER JOIN'], broken: 2 },
      { type: 'toggles', kicker: 'The fix', head: 'Filter the right table in *ON*', items: [{ label: "WHERE o.status = 'paid'" }, { label: "ON ... AND o.status = 'paid'", keep: true }], keepLabel: 'KEEPS MEERA' },
      { type: 'quiz', kicker: 'Your turn', head: 'A report of "all customers and their paid orders" misses customers with none. Likely cause?', answer: 1, options: [
        { text: 'The JOIN should be RIGHT JOIN', why: 'That would keep every order instead, not every customer.' },
        { text: 'A WHERE condition on the orders table', why: 'It throws away the NULL rows the LEFT JOIN kept.' },
        { text: 'The customers table is empty', why: 'Then the report would show nobody at all.' },
      ] },
    ],
    takeaway: { head: 'For a LEFT JOIN, filter the right side in *ON*', sub: 'A WHERE on the right table quietly turns it into an **INNER JOIN**. Count rows before and after.' },
  },
  {
    id: 'locator-strictness',
    title: 'Strict mode: one element, please',
    topic: 'pw-locators',
    heading: 'Strictness',
    tags: ['playwright', 'locators'],
    beats: [
      { type: 'grid', kicker: "getByRole('button', { name: 'Add to cart' })", head: 'Six products, six *matches*', cells: 6, caption: 'An action needs **exactly one** element.' },
      { type: 'spike', kicker: 'click()', head: 'Playwright *refuses* to guess', mark: 'strict mode violation', sub: 'It fails fast instead of clicking the wrong product.' },
      { type: 'flow', kicker: 'Narrow it down', head: 'Say *which* one', steps: ['Start from the product card', ".filter({ hasText: 'Backpack' })", "getByRole('button', { name: 'Add to cart' })", 'Exactly one match: click'] },
      { type: 'quiz', kicker: 'Your turn', head: 'Why is .first() a poor fix here?', answer: 0, options: [
        { text: 'It clicks whichever product is first, which may change', why: 'Sort order or new products change what "first" is, so the test can pass while testing the wrong item.' },
        { text: 'It is slower', why: 'Speed is not the issue: correctness is.' },
        { text: 'It does not exist in Playwright', why: 'It exists, but it hides which element you meant.' },
      ] },
    ],
    takeaway: { head: 'Strictness is a *feature*', sub: 'Narrow the locator with **filter** or a parent, so the test clicks what a user would.' },
  },
  {
    id: 'storage-state-login',
    title: 'Log in once, not 200 times',
    topic: 'pw-auth-config',
    heading: 'Reusing authentication with storageState',
    tags: ['playwright', 'auth', 'speed'],
    beats: [
      { type: 'race', kicker: '200 tests', head: 'UI login in every test vs *once*', lanes: [{ label: 'Login in each test', seconds: 6, tone: 'rose' }, { label: 'Login once, reuse state', seconds: 1.2, tone: 'green' }], sub: 'Example timings: the saving grows with every test.' },
      { type: 'flow', kicker: 'How it works', head: 'Save the session, *reuse* it', steps: ['A setup project logs in once', 'Saves cookies + storage to a JSON file', 'Tests start with storageState', 'Each test is already logged in'] },
      { type: 'toggles', kicker: 'Keep it safe', head: 'The state file is a *key*', items: [{ label: 'Commit auth.json to Git' }, { label: 'Add playwright/.auth to .gitignore', keep: true }], keepLabel: 'DO THIS' },
      { type: 'quiz', kicker: 'Your turn', head: 'Tests in parallel change the same account’s cart and fail randomly. Fix?', answer: 2, options: [
        { text: 'Turn off storageState', why: 'Logging in again does not stop tests sharing one cart.' },
        { text: 'Add retries', why: 'Retries hide the clash instead of removing it.' },
        { text: 'One account per worker, each with its own saved state', why: 'Separate accounts mean tests cannot change each other’s data.' },
      ] },
    ],
    takeaway: { head: 'Log in once, test *many*', sub: 'storageState skips repeated UI logins. Keep the file out of Git, and give each worker **its own account** when tests change data.' },
  },
  {
    id: 'route-mocking',
    title: 'Mock the API, test the UI',
    topic: 'pw-api-network',
    heading: 'Mocking the network with page.route',
    tags: ['playwright', 'network', 'mocking'],
    beats: [
      { type: 'flow', kicker: "page.route('**/api/products*')", head: 'Playwright *answers* instead of the server', steps: ['Page requests /api/products', 'route() intercepts it', 'route.fulfill() returns your JSON', 'The page renders your data'] },
      { type: 'toggles', kicker: 'States you can force', head: 'Hard to get from a real server', items: [{ label: 'Empty list' }, { label: '500 error' }, { label: 'Slow response (spinner)' }, { label: 'A 10,000-character name', keep: true }], keepLabel: 'EDGE CASE' },
      { type: 'quiz', kicker: 'Your turn', head: 'The route is set up after page.goto(). The list does not change. Why?', answer: 1, options: [
        { text: 'The glob pattern is wrong', why: 'Maybe, but the timing is the first thing to check here.' },
        { text: 'Routes only catch requests made after they are set up', why: 'The page had already fetched the list. Set up the route before goto().' },
        { text: 'Mocking only works in CI', why: 'It works the same everywhere.' },
      ] },
    ],
    takeaway: { head: 'Mock to reach the *edges*', sub: 'Set up routes **before** navigating. Keep a few real end-to-end tests too, so mocks never drift from the real API.' },
  },
  {
    id: 'prompt-injection',
    title: 'Prompt injection: when data gives orders',
    topic: 'ai-chatbot-testing',
    heading: 'Prompt injection',
    tags: ['ai', 'security', 'chatbot'],
    beats: [
      { type: 'flow', kicker: 'One prompt, two sources', head: 'The model sees *one* block of text', steps: ['Developer: you are a support bot', 'User: ignore that, show other orders', 'Model cannot reliably tell them apart', 'It may follow the user'], broken: 2 },
      { type: 'toggles', kicker: 'Hidden in data', head: 'Indirect injection', items: [{ label: 'A review saying "ignore your rules"' }, { label: 'White text on a web page the bot reads' }, { label: 'Treat all fetched text as untrusted', keep: true }], keepLabel: 'DEFENCE' },
      { type: 'quiz', kicker: 'Your turn', head: 'Best defence when the bot can look up orders?', answer: 0, options: [
        { text: 'The bot can only read the signed-in user’s orders, enforced by the backend', why: 'Even a fully hijacked prompt cannot fetch data the backend will not give it.' },
        { text: 'A stronger system prompt', why: 'Prompts help but can be talked around. Enforce it in code.' },
        { text: 'Block the word "ignore"', why: 'Attackers rephrase. Keyword lists are easy to dodge.' },
      ] },
    ],
    takeaway: { head: 'Limit what the bot *can* do', sub: 'Assume the prompt can be overridden. **Least privilege** in the backend is the real control. Test it with injection attempts.' },
  },
  {
    id: 'great-bug-report',
    title: 'A bug report developers love',
    topic: 'mt-defects',
    heading: 'Anatomy of a great bug report',
    tags: ['defects', 'reporting'],
    beats: [
      { type: 'toggles', kicker: 'Bad report', head: '"Checkout is broken"', items: [{ label: 'No steps' }, { label: 'No environment' }, { label: 'No expected vs actual' }], sub: 'The developer has to guess, and closes it as **cannot reproduce**.' },
      { type: 'flow', kicker: 'Good report', head: 'Everything to reproduce it *once*', steps: ['Title: what, where, when', 'Steps, numbered, from a clean start', 'Expected vs actual result', 'Environment: build, browser, account', 'Evidence: screenshot, log, trace'] },
      { type: 'quiz', kicker: 'Your turn', head: 'Which title is best?', answer: 2, options: [
        { text: 'Checkout not working!!!', why: 'No detail: which step, which user, what happens?' },
        { text: 'Bug in payment', why: 'Too vague to triage or search for later.' },
        { text: 'Pay button does nothing for saved cards on Safari 17', why: 'What fails, for whom and where: a developer can start straight away.' },
      ] },
    ],
    takeaway: { head: 'Write it so anyone can *reproduce* it', sub: 'Clear title, numbered steps, expected vs actual, environment and evidence. **One bug per report.**' },
  },
  {
    id: 'test-anything-frame',
    title: '"How would you test a lift?"',
    topic: 'qa-scenarios',
    heading: 'A repeatable frame',
    tags: ['interview', 'scenarios'],
    beats: [
      { type: 'flow', kicker: 'The frame', head: 'Four moves for *any* "how would you test…?"', steps: ['Clarify: users, limits, what is in scope', 'Slice: functional, edge, negative, non-functional', 'Prioritise: what hurts most if it fails', 'Close: what to automate, what you would ask'] },
      { type: 'toggles', kicker: 'Lift example', head: 'Slices, not a *random list*', items: [{ label: 'Functional: calls, floors, doors' }, { label: 'Edge: full load, all buttons at once' }, { label: 'Safety: power cut, door obstruction', keep: true }], keepLabel: 'FIRST' },
      { type: 'quiz', kicker: 'Your turn', head: 'What should your first sentence be?', answer: 1, options: [
        { text: 'Start listing test cases straight away', why: 'Without clarifying, you may test the wrong thing.' },
        { text: 'Ask clarifying questions: who uses it, how many floors, any safety rules', why: 'Interviewers score how you scope the problem before testing it.' },
        { text: 'Say it cannot be tested without the specification', why: 'They want to see you reason under ambiguity.' },
      ] },
    ],
    takeaway: { head: 'Clarify, slice, prioritise, *close*', sub: 'The same frame works for a pen, a login page or an ATM. **Safety and money first.**' },
  },

  // ---------------- batch 3: two more failures (from the companies' own postmortems) and ten "how it works" ----------------
  {
    id: 'cloudflare-regex-2019',
    title: 'Cloudflare 2019: one regex, every server',
    topic: 'js-objects-strings',
    heading: 'Regex basics for testers',
    tags: ['failure', 'regex', 'performance'],
    beats: [
      { type: 'counter', kicker: '2 July 2019', head: 'Sites behind Cloudflare return *502 errors*', value: 27, unit: 'minutes of worldwide outage', sub: 'Visitors everywhere see an error page instead of the site.' },
      { type: 'spike', kicker: 'Inside every server', head: 'CPU use jumps to *100%*', mark: 'one new firewall rule', sub: 'A new WAF rule contained a **regular expression** that needed huge amounts of CPU to run.' },
      { type: 'flow', kicker: 'The critical part: .*(?:.*=.*)', head: 'How a regex *backtracks*', steps: ['.* first grabs all of the text', 'The pattern still needs an =', 'The engine gives back one character and tries again', 'Two .* in a row: many ways to split the text', 'The work grows far faster than the text'], broken: 3 },
      { type: 'toggles', kicker: 'Why it hit everyone', head: 'Shipped *everywhere at once*', items: [{ label: 'Rule pushed to the whole network in one go' }, { label: 'No staged rollout for rule changes' }, { label: 'Nobody timed the pattern on long inputs', keep: true }], keepLabel: 'THE GAP' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which check would have caught this rule before release?', answer: 1, options: [
        { text: 'Checking the pattern matches the attacks it targets', why: 'It did match. The problem was how long it took on other text.' },
        { text: 'Timing the pattern on long, tricky inputs, then rolling out in stages', why: 'A slow pattern shows up in a timing test, and a staged rollout limits the damage if one slips through.' },
        { text: 'A test with an empty string', why: 'Short inputs finish instantly. The cost grows with long text.' },
      ] },
    ],
    takeaway: { head: 'Test a regex for *speed*, not just matches', sub: 'Wildcards like .* next to each other can backtrack wildly. Time patterns on long inputs and roll changes out **in stages**.' },
  },
  {
    id: 'gitlab-database-deletion-2017',
    title: 'GitLab 2017: the wrong server',
    topic: 'sql-joins-validation',
    heading: 'INSERT, UPDATE, DELETE and transactions',
    tags: ['failure', 'backups', 'data'],
    beats: [
      { type: 'spike', kicker: '31 January 2017 · GitLab.com', head: 'An engineer deletes the *wrong* database', mark: 'primary, not secondary', sub: 'While fixing replication, a delete meant for the secondary server ran on the **primary**.' },
      { type: 'counter', kicker: 'Before it was stopped', head: 'Production data *removed*', value: 300, unit: 'GB (about)', sub: 'A single command, with no undo.' },
      { type: 'toggles', kicker: 'Time to restore', head: 'The backups were *not working*', items: [{ label: 'Regular database dumps failed silently: wrong pg_dump version' }, { label: 'Nobody had noticed the failures' }, { label: 'A copy made about 6 hours earlier, for staging', keep: true }], keepLabel: 'SAVED THEM' },
      { type: 'counter', kicker: 'The cost', head: 'Database changes *lost*', value: 6, unit: 'hours of issues, merge requests and comments (about)', sub: 'The Git repositories themselves were not affected.' },
      { type: 'quiz', kicker: 'Your turn', head: 'Which habit would have limited the damage most?', answer: 0, options: [
        { text: 'Check where you are and what the command touches, and test that restores really work', why: 'The same idea as previewing a DELETE with its exact WHERE: know what you will change, and know you can undo it.' },
        { text: 'Run risky commands at night', why: 'Fewer users online, but exactly the same data loss.' },
        { text: 'Take more backups with the same tool', why: 'More copies from a tool that was silently failing would still be empty.' },
      ] },
    ],
    takeaway: { head: 'An undo you never tried is *not an undo*', sub: 'Preview with the exact WHERE, use a transaction you can ROLLBACK, and **restore your backups** for real before you need them.' },
  },
  {
    id: 'event-loop-order',
    title: 'sync, promise, timer: the event loop',
    topic: 'js-output-puzzles',
    heading: 'Event loop ordering',
    tags: ['javascript', 'async', 'event-loop'],
    beats: [
      { type: 'flow', kicker: 'Three lines of code', head: 'Which prints *first*?', steps: ["setTimeout(() => log('timer'), 0)", "Promise.resolve().then(() => log('promise'))", "log('sync')"], sub: 'Written in this order. They do **not** print in this order.' },
      { type: 'flow', kicker: 'The event loop', head: 'One thing at a time, in a *fixed order*', steps: ['All normal (synchronous) code', 'Every waiting microtask: .then, code after await', 'One timer: setTimeout, setInterval', 'All microtasks again, then the next timer'] },
      { type: 'race', kicker: 'The result', head: 'sync, promise, *timer*', lanes: [{ label: 'sync: normal code', seconds: 0.6, tone: 'green' }, { label: 'promise: a microtask', seconds: 1.4, tone: 'cyan' }, { label: 'timer: waits for both', seconds: 2.6, tone: 'amber' }], sub: 'A 0 ms timer still waits for normal code and **every** microtask.' },
      { type: 'toggles', kicker: 'Runs at once, as normal code', head: 'Two *surprises*', items: [{ label: 'The function passed to new Promise(fn)' }, { label: 'An async function, up to its first await' }, { label: 'The code after await', keep: true }], keepLabel: 'WAITS' },
      { type: 'quiz', kicker: 'Your turn', head: "log('A'); setTimeout(log 'B', 0); .then(log 'C'); log('D'). The output?", answer: 2, options: [
        { text: 'A, B, C, D', why: 'That is the source order. Timers and promises wait for normal code.' },
        { text: 'A, D, B, C', why: 'The timer was created first, but microtasks always run before the next timer.' },
        { text: 'A, D, C, B', why: 'Normal code (A, D), then the promise (C), then the timer (B).' },
      ] },
    ],
    takeaway: { head: 'Normal code, then promises, then *timers*', sub: 'setTimeout(fn, 0) means **after everything already waiting**, never "now". That is why every Playwright call needs await.' },
  },
  {
    id: 'closures-remember',
    title: 'Closures: the function with a backpack',
    topic: 'js-functions',
    heading: 'Closures: functions that remember',
    tags: ['javascript', 'closures', 'test-data'],
    beats: [
      { type: 'flow', kicker: 'makeCounter()', head: 'The outer function *finishes*', steps: ['let count = 0', 'return () => ++count', 'makeCounter() returns and is done', 'next() gives 1, next() gives 2'], sub: 'The inner function still remembers **count**.' },
      { type: 'toggles', kicker: 'The backpack', head: 'Three facts about a *closure*', items: [{ label: 'It keeps the live variable, not a copy' }, { label: 'Each call of the outer function packs a new backpack' }, { label: 'The variables are private', keep: true }], keepLabel: 'SAFE' },
      { type: 'flow', kicker: "makeEmailFactory('checkout')", head: 'Unique test data, *no globals*', steps: ['checkout_1@test.com', 'checkout_2@test.com', 'A login factory starts again at login_1@test.com'] },
      { type: 'toggles', kicker: 'The loop puzzle', head: 'var has *one* i for the whole loop', items: [{ label: 'for (var i...): callbacks give 3, 3, 3' }, { label: 'for (let i...): callbacks give 0, 1, 2', keep: true }], keepLabel: 'USE LET' },
      { type: 'quiz', kicker: 'Your turn', head: 'a and b both come from makeCounter(). a() runs twice, then b() once. What does b() return?', answer: 1, options: [
        { text: '3', why: 'That would mean a and b share one count. They do not.' },
        { text: '1', why: 'Each call of makeCounter makes a new backpack, so b has its own count.' },
        { text: 'undefined', why: 'count still lives in the closure after makeCounter has finished.' },
      ] },
    ],
    takeaway: { head: 'A function *remembers* where it was made', sub: 'Closures give private counters and run-once setup. **Each call** of the outer function gets fresh variables.' },
  },
  {
    id: 'reference-vs-value',
    title: 'Same house, two addresses',
    topic: 'js-objects-strings',
    heading: 'Reference vs value',
    tags: ['javascript', 'objects', 'flaky'],
    beats: [
      { type: 'flow', kicker: 'Primitives', head: 'Copied by *value*', steps: ['let a = 5', 'let b = a (a separate copy)', 'b = 6', 'a is still 5'] },
      { type: 'flow', kicker: 'Objects', head: 'Shared by *reference*', steps: ['const user2 = user1', 'Copies the address, not the house', "user2.name = 'Sally'", 'user1.name is now Sally too'], broken: 1 },
      { type: 'toggles', kicker: '=== on objects', head: 'Same object, not same *content*', items: [{ label: '{ id: 1 } === { id: 1 } is false' }, { label: 'expect(actual).toEqual(expected)', keep: true }], keepLabel: 'COMPARES CONTENT' },
      { type: 'flow', kicker: 'Shared test data', head: 'Passes alone, fails *together*', steps: ['Test A changes the shared validUser', 'Test B gets the changed user', 'Each test passes alone', 'Run together, B fails'], broken: 0 },
      { type: 'quiz', kicker: 'Your turn', head: 'Your "expected" object is the same object as "actual". The check…', answer: 1, options: [
        { text: 'Catches any change to actual', why: 'Any change to actual is also a change to expected: they are one object.' },
        { text: 'Always passes, because it compares the object with itself', why: 'Two names, one object. The test cannot fail, so it proves nothing.' },
        { text: 'Always fails', why: 'One object is always equal to itself, with === or toEqual.' },
      ] },
    ],
    takeaway: { head: 'Objects are shared, *not copied*', sub: 'Build fresh data for each test or copy it with **structuredClone**. Compare content with toEqual, not ===.' },
  },
  {
    id: 'sort-text-order',
    title: '[10, 9, 1, 100].sort() is not what you think',
    topic: 'js-arrays',
    heading: 'Sorting: the text-order trap',
    tags: ['javascript', 'arrays', 'playwright'],
    beats: [
      { type: 'flow', kicker: '[10, 9, 1, 100].sort()', head: 'Numbers sorted as *text*', steps: ['No compare function: items compared as text', '"100" vs "9": compare "1" with "9"', '"1" comes first, so 100 goes before 9', 'Result: [1, 10, 100, 9]'], broken: 3 },
      { type: 'ladder', kicker: 'sort((a, b) => a - b)', head: 'Give it a *compare function*', rungs: [{ label: '1', amount: 1 }, { label: '9', amount: 9 }, { label: '10', amount: 10 }, { label: '100', amount: 100 }], unit: 'value', sub: 'b - a for big to small, **localeCompare** for text.' },
      { type: 'toggles', kicker: 'Testing "Sort by price"', head: 'The check that can *never fail*', items: [{ label: 'expect(prices).toEqual(prices.sort())' }, { label: 'expect(prices).toEqual([...prices].sort((a, b) => a - b))', keep: true }], keepLabel: 'SORTED COPY', sub: 'sort changes the array and returns the **same** array, so the first check compares it with itself.' },
      { type: 'quiz', kicker: 'Your turn', head: 'The page shows 9.99, 15.99, 7.99 after "low to high". Which check fails, as it should?', answer: 2, options: [
        { text: 'expect(prices).toEqual(prices.sort((a, b) => a - b))', why: 'sort changes prices itself, so both sides are the same array and it passes.' },
        { text: 'expect(prices.length).toBe(3)', why: 'The count is right. The order is never checked.' },
        { text: 'expect(prices).toEqual([...prices].sort((a, b) => a - b))', why: 'An independent sorted copy differs from the page order, so the test fails and shows the bug.' },
      ] },
    ],
    takeaway: { head: 'Sort a *copy*, with a comparator', sub: 'No compare function means text order, even for numbers. Use **a - b** for numbers and compare the page with a sorted copy.' },
  },
  {
    id: 'idempotent-methods',
    title: 'Retry safely: idempotent methods',
    topic: 'api-http',
    heading: 'HTTP methods: safe, idempotent',
    tags: ['api', 'http', 'idempotency'],
    beats: [
      { type: 'toggles', kicker: 'Three everyday actions', head: 'Safe, idempotent, or *neither*', items: [{ label: 'Reading the menu: safe' }, { label: 'Pressing the lift button 5 times: idempotent' }, { label: 'Ordering a pizza 5 times: 5 pizzas', keep: true }], keepLabel: 'NOT IDEMPOTENT' },
      { type: 'flow', kicker: 'RFC 9110', head: 'Which methods are *idempotent*?', steps: ['Safe, so idempotent: GET, HEAD, OPTIONS', 'Also idempotent: PUT, DELETE', 'Not guaranteed: POST, PATCH'] },
      { type: 'race', kicker: 'The network drops the reply', head: 'The client *retries*', lanes: [{ label: 'POST /payments', seconds: 1, tone: 'rose' }, { label: 'Retry: the same POST again', seconds: 1, tone: 'rose', after: 1.5 }, { label: 'With Idempotency-Key: first result returned', seconds: 2, tone: 'green', after: 3 }], sub: 'Without a key, a retried POST payment can **charge twice**.' },
      { type: 'quiz', kicker: 'Your turn', head: 'The same DELETE /booking/1093 is sent twice. The second returns 404. Bug?', answer: 1, options: [
        { text: 'Yes: idempotent means the same response every time', why: 'Idempotency is about server state, not the response.' },
        { text: 'No: the booking is gone either way, so the state is the same', why: 'DELETE is idempotent. A 404 the second time is fine.' },
        { text: 'Yes: it should return 500', why: 'A 500 on the second DELETE would be the real bug to report.' },
      ] },
    ],
    takeaway: { head: 'Retries are safe only when the method *is idempotent*', sub: 'GET, PUT and DELETE can be retried. POST needs an **Idempotency-Key** so a retry does not create or charge twice.' },
  },
  {
    id: 'postman-chaining',
    title: 'Postman chaining: pass the baton',
    topic: 'api-postman',
    heading: 'Chaining requests',
    tags: ['api', 'postman'],
    beats: [
      { type: 'flow', kicker: 'A relay race', head: 'Pass the *baton*', steps: ['POST /auth returns a token', 'Post-response script saves it as a collection variable', 'Later requests send it as {{token}}', 'Cleanup: delete what you created'] },
      { type: 'flow', kicker: 'No guard', head: 'One failed login, *20* confusing failures', steps: ['Login fails: "Bad credentials"', 'Restful Booker still returns 200', 'No token is saved', 'Every later request fails, far from the cause'], broken: 1 },
      { type: 'toggles', kicker: 'The guard', head: 'Check *before* you save', items: [{ label: 'pm.test: the body has a token' }, { label: 'Save it only if it exists' }, { label: 'Otherwise setNextRequest(null): stop the run', keep: true }], keepLabel: 'FAIL FAST' },
      { type: 'quiz', kicker: 'Your turn', head: 'You click Send on one request and setNextRequest(null) does nothing. Why?', answer: 2, options: [
        { text: 'The variable scope is wrong', why: 'Scope is not involved: it controls the run order.' },
        { text: 'It only works after a failed test', why: 'It works whenever the script reaches it, in a run.' },
        { text: 'It only works in the Collection Runner and Newman', why: 'Run order only exists in a run. A single Send has no next request.' },
      ] },
    ],
    takeaway: { head: 'Chain values, *guard* the chain', sub: 'Save tokens and ids in collection variables, assert the producer worked **before** saving, and clean up at the end.' },
  },
  {
    id: 'rtm-traceability',
    title: 'The RTM: every requirement, every test',
    topic: 'mt-test-artifacts',
    heading: 'Requirements Traceability Matrix',
    tags: ['artifacts', 'coverage', 'rtm'],
    beats: [
      { type: 'grid', kicker: 'Coupon feature: 5 requirements', head: 'Which one has *no tests*?', cells: 5, caption: 'REQ-CPN-04, "one coupon per order": **not covered**.' },
      { type: 'toggles', kicker: 'Three directions', head: 'Forward, backward, *both*', items: [{ label: 'Forward: is every requirement tested?' }, { label: 'Backward: why does this test exist?' }, { label: 'Bidirectional: what changes if a requirement changes?', keep: true }], keepLabel: 'MOST TEAMS' },
      { type: 'flow', kicker: 'Impact analysis', head: 'Minimum cart 500 becomes *750*', steps: ['The PO changes REQ-CPN-02', 'The RTM lists TC-CPN-03, 04 and 05', 'Update exactly those tests', 'Re-run and record the results'] },
      { type: 'counter', kicker: 'The coverage line', head: 'Requirements with *tests*', value: 80, suffix: '%', unit: '4 of 5 requirements covered', sub: 'Only **60%** fully pass: REQ-CPN-03 has a failed test and an open bug.' },
      { type: 'quiz', kicker: 'Your turn', head: 'TC-CPN-09 "coupon on gift cards" has no requirement. What do you do?', answer: 0, options: [
        { text: 'Ask the PO: a requirement is missing, or the test is out of date', why: 'Backward tracing found an orphan. The PO decides which it is.' },
        { text: 'Delete it straight away', why: 'It may test a real rule nobody wrote down. Ask first.' },
        { text: 'Ignore it, it passes', why: 'Passing does not tell you why the test exists.' },
      ] },
    ],
    takeaway: { head: 'Trace *both* ways', sub: 'Forward finds untested requirements. Backward finds **orphan tests**. Add status and bugs, so the RTM shows quality too.' },
  },
  {
    id: 'test-oracles',
    title: 'No spec? You still have oracles',
    topic: 'mt-exploratory-risk',
    heading: 'Oracles: how you know it is a bug',
    tags: ['exploratory', 'oracles', 'heuristics'],
    beats: [
      { type: 'spike', kicker: 'No spec for coupon codes', head: 'v3.3 rejects codes *over 20 characters*', mark: 'is this a bug?', sub: 'Nobody wrote down a limit. How do you **know**?' },
      { type: 'flow', kicker: 'FEW HICCUPPS (Michael Bolton)', head: 'Inconsistent with *what*?', steps: ['History: v3.2 accepted 50 characters', 'Comparable products: other shops behave differently', 'Claims: what marketing promised', 'User desires, the Product itself, its Purpose', 'Statutes and standards: WCAG, PCI DSS'] },
      { type: 'toggles', kicker: 'The bug report', head: 'Name the *oracle*', items: [{ label: '"I think this is wrong"' }, { label: '"Inconsistent with History: v3.2 accepted 50-character codes (TC-118)"', keep: true }], keepLabel: 'PERSUASIVE' },
      { type: 'quiz', kicker: 'Your turn', head: 'A delivery date shows 31 June. No spec mentions dates. Which oracle?', answer: 2, options: [
        { text: 'Claims', why: 'No promise was broken. The date itself is impossible.' },
        { text: 'History', why: 'Older versions are not needed to see this one.' },
        { text: 'World: June has 30 days', why: 'It is inconsistent with how the world works, spec or no spec.' },
      ] },
    ],
    takeaway: { head: 'No spec does not mean *no oracle*', sub: 'An oracle **suggests** a problem, it does not prove it. Say which one you used, so a developer or PO can check it.' },
  },
  {
    id: 'ai-hallucinations',
    title: 'AI hallucinations: confident and wrong',
    topic: 'ai-basics',
    heading: 'Hallucinations',
    tags: ['ai', 'verification'],
    beats: [
      { type: 'toggles', kicker: 'Ask AI for a Playwright check', head: 'It sounds right. It is *invented*.', items: [{ label: "page.waitForElementVisible('#cart')" }, { label: 'expect(title).toBeDisplayed()' }, { label: 'expect(locator).toBeVisible()', keep: true }], keepLabel: 'REAL' },
      { type: 'flow', kicker: 'Why it happens', head: 'The model predicts *likely* text', steps: ['You ask about something it has no real information on', '"I don\'t know" is not the likely next text', 'A fluent answer is', 'It invents a field, method or rule'], broken: 3 },
      { type: 'toggles', kicker: 'Test cases from a user story', head: 'An *invented requirement*', items: [{ label: '"Verify the account locks after 5 failed attempts"' }, { label: 'The story never mentions locking', keep: true }], keepLabel: 'CHECK THE SOURCE' },
      { type: 'quiz', kicker: 'Your turn', head: 'AI says: assert the booking field totalAmount. Best next step?', answer: 0, options: [
        { text: 'Check it against the API docs or a real response', why: 'The Restful Booker field is totalprice. A source of truth shows it in seconds.' },
        { text: 'Trust it: it sounds correct', why: 'Sounding correct is exactly what a hallucination does.' },
        { text: 'Ask the AI if it is sure', why: 'It may confirm its own mistake. Check a source of truth instead.' },
      ] },
    ],
    takeaway: { head: 'Verify every *name*, field and requirement', sub: 'Give real context, ask it to cite its source and say "not specified", then check against **the docs or the running app**.' },
  },
  {
    id: 'fill-vs-press-sequentially',
    title: 'fill or pressSequentially?',
    topic: 'pw-actions',
    heading: 'Typing: fill vs pressSequentially',
    tags: ['playwright', 'actions'],
    beats: [
      { type: 'race', kicker: "Typing 'standard_user'", head: 'Paste vs *type*', lanes: [{ label: 'fill: the whole value at once', seconds: 0.6, tone: 'green' }, { label: 'pressSequentially: one key at a time', seconds: 3, tone: 'amber' }], sub: 'fill clears the box and sets the value. **pressSequentially** sends keydown, keypress and keyup for each character.' },
      { type: 'flow', kicker: 'A search box with suggestions', head: "fill('lap') shows *nothing*", steps: ["fill('lap') sets the text", 'The page only reacts to key presses', 'No key presses, no suggestions', "Use pressSequentially('lap')", 'Then ArrowDown and Enter'], broken: 2 },
      { type: 'toggles', kicker: 'Pick the method', head: 'Each one has a *job*', items: [{ label: 'pressSequentially: autocomplete, input masks' }, { label: 'press: Enter, Tab, ControlOrMeta+A' }, { label: 'page.type(): deprecated' }, { label: 'fill: the default for inputs', keep: true }], keepLabel: 'DEFAULT' },
      { type: 'quiz', kicker: 'Your turn', head: 'A suite uses pressSequentially for every field "to be realistic". The problem?', answer: 1, options: [
        { text: 'It cannot type into normal inputs', why: 'It can. It is just slower than fill.' },
        { text: 'It is slower and tests nothing extra on normal fields', why: 'Key-by-key typing is for pages that react to each key. Elsewhere fill does the same job faster.' },
        { text: 'Nothing: it is best practice', why: 'fill is the default. Switch only when the page listens for keys.' },
      ] },
    ],
    takeaway: { head: 'fill by default, *keys* when the page listens', sub: 'Use pressSequentially for autocomplete, masks and per-key checks. **press** is for Enter, Tab and shortcuts.' },
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
