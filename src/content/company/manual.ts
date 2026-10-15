import type { CompanyQuestion } from '../../types';

// Company-reported manual-testing questions. Every entry cites a page that was opened and that
// ties the question to the company. AmbitionBox pages are company + role question lists posted by
// candidates; the year is the year the candidate posted the report.

const AB = (company: string, role: string) => `https://www.ambitionbox.com/interviews/${company}-interview-questions/${role}`;

export const QUESTIONS: CompanyQuestion[] = [
  {
    id: 'co-manual-amazon-1',
    company: 'Amazon',
    area: 'manual',
    role: 'Quality Assurance Engineer (off-campus)',
    round: 'Technical interview 1',
    difficulty: 'easy',
    question: 'How is regression testing different from sanity testing?',
    answer: `**Regression testing** checks that a change has not broken anything that already worked. It is **broad**: it re-runs existing tests across the affected area, and often the whole product, and it is usually automated and planned into every release.

**Sanity testing** is a **narrow, quick check** on one build. It confirms that a specific fix or small change works well enough to be worth deeper testing. It is usually unscripted and takes minutes.

| | Sanity | Regression |
|---|---|---|
| Scope | One fixed area | Everything the change could touch |
| Depth | Shallow | Deep |
| When | Right after a fix or minor build | Before every release, after any change |
| Scripted? | Usually not | Usually scripted or automated |

**Example (Amazon cart):** a developer fixes a bug where the cart badge showed the wrong count. *Sanity:* add two items and check that the badge says 2. *Regression:* re-run the cart, checkout, coupon, wishlist and order-history suites, because the cart service is shared by all of them.`,
    followUps: [
      {
        q: 'Is sanity testing a subset of regression testing?',
        a: 'Many teams describe it that way: sanity is a small, focused slice of regression run on one area to decide whether the build is worth testing fully. The full regression pass comes after.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (Off-Campus) 2024',
      url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-off-campus-2024/',
      year: 2024,
    },
  },
  {
    id: 'co-manual-amazon-2',
    company: 'Amazon',
    area: 'manual',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Round 1 (technical)',
    difficulty: 'easy',
    question: 'Walk me through the phases of the Software Testing Life Cycle (STLC).',
    answer: `STLC is the sequence of testing activities, each with entry and exit criteria:

1. **Requirement analysis.** Read the requirements, find what is testable, raise questions, start the traceability matrix.
2. **Test planning.** Scope, approach, effort, schedule, environments, roles, risks, entry and exit criteria (the test plan).
3. **Test case development.** Write scenarios, test cases and test data, and get them reviewed.
4. **Test environment setup.** Prepare the build, servers, devices, accounts and data, and run a smoke test to confirm the environment is usable.
5. **Test execution.** Run the cases, log defects, retest fixes, run regression.
6. **Test closure.** Check the exit criteria, write the summary report (coverage, pass rate, open defects), hold a lessons-learned review.

**Example:** for a new "Buy Now" button, analysis finds an unclear rule ("Is Buy Now shown for out-of-stock items?"). Planning puts payments in scope. Design writes about 30 cases. Setup creates test cards. Execution logs 4 bugs. Closure reports that 29 of 30 passed and 1 low-severity bug was deferred.`,
    followUps: [
      {
        q: 'How is STLC related to SDLC?',
        a: 'STLC runs inside the SDLC. Testing starts in parallel with requirements, not after coding. Requirement analysis in STLC lines up with the requirements phase of the SDLC, and execution lines up with the build and integration phases.',
      },
    ],
    topic: 'mt-fundamentals',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (On-Campus)',
      url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-on-campus/',
      year: 2022,
    },
  },
  {
    id: 'co-manual-amazon-3',
    company: 'Amazon',
    area: 'manual',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Round 1 (technical)',
    difficulty: 'easy',
    question: 'Describe the life cycle of a defect, from when it is found to when it is closed.',
    answer: `A typical defect life cycle in a tracker like Jira:

1. **New.** The tester logs it with steps, expected vs actual result, evidence, severity and environment.
2. **Assigned / Open.** The lead or triage meeting accepts it and gives it to a developer.
3. **Fixed.** The developer fixes it and links the build.
4. **Ready for retest → Retest.** The tester re-runs the exact steps on the new build.
5. **Verified → Closed** if it passes, or **Reopened** if it still fails (back to the developer).

Side exits: **Rejected / Not a bug**, **Duplicate**, **Deferred** (valid, but planned for a later release), **Cannot reproduce**.

**Example:** "Coupon SAVE10 applied twice when Apply is double-clicked". Logged as New with a screen recording. Assigned to the checkout developer and fixed by disabling the button. The tester retests, double-clicks again and also runs nearby regression (other coupons, removing a coupon). It passes and is closed.`,
    followUps: [
      {
        q: 'What do you do when a developer marks your bug "Not a bug"?',
        a: 'Re-check the requirement or acceptance criteria, add evidence, and discuss it with the developer. If you still disagree, take it to the product owner or triage instead of arguing in comments.',
      },
    ],
    topic: 'mt-defects',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (On-Campus)',
      url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-on-campus/',
      year: 2022,
    },
  },
  {
    id: 'co-manual-amazon-4',
    company: 'Amazon',
    area: 'manual',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Round 1 (technical)',
    difficulty: 'easy',
    question: 'What is the difference between a test scenario and a test case?',
    answer: `A **test scenario** is a one-line statement of *what* to test: a user goal or feature condition. A **test case** says *how* to test it: preconditions, exact steps, test data, and the expected result.

One scenario usually expands into several test cases.

**Example scenario:** "Verify a user can log in to Amazon."

Test cases from it:
- TC1: registered email + correct password → home page with "Hello, <name>".
- TC2: correct email + wrong password → "Your password is incorrect", still on the login page.
- TC3: unregistered email → "We cannot find an account with that email address".
- TC4: empty fields → validation messages, no request sent.
- TC5: five wrong passwords → captcha shown.

Scenarios are good for coverage planning and quick reviews with product owners. Test cases are needed for repeatable execution, handover and automation.`,
    followUps: [
      {
        q: 'Where do test scenarios usually come from?',
        a: 'From requirements, user stories and their acceptance criteria, use cases, and risk analysis. Each acceptance criterion usually gives at least one scenario.',
      },
    ],
    topic: 'mt-test-artifacts',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Quality Assurance Engineer (On-Campus)',
      url: 'https://www.geeksforgeeks.org/amazon-interview-experience-for-quality-assurance-engineer-on-campus/',
      year: 2022,
    },
  },
  {
    id: 'co-manual-amazon-5',
    company: 'Amazon',
    area: 'manual',
    role: 'Quality Assurance Engineer (on-campus)',
    round: 'Technical interview 2',
    difficulty: 'easy',
    question: 'Explain functional versus non-functional testing, with an example of each.',
    answer: `**Functional testing** checks *what* the system does against its requirements: inputs, outputs, business rules. **Non-functional testing** checks *how well* it does it: performance, load, security, usability, accessibility, compatibility, reliability.

**Example on Prime Video:**
- *Functional:* searching "Reacher" returns the show; pressing Play starts episode 1; "Continue watching" resumes at the saved timestamp; a kids profile cannot open 18+ titles.
- *Non-functional:* playback starts within 2 s on a 10 Mbps connection; the app handles 1 million concurrent streams on a premiere night; video quality drops gracefully on a slow network instead of freezing; subtitles are readable with a screen reader; the stream URL cannot be reused after logout.

A feature can pass every functional test and still fail users, for example search that is correct but takes 8 seconds. That is why both are planned.`,
    followUps: [
      {
        q: 'Is usability testing functional or non-functional?',
        a: 'Non-functional. It measures how easy and pleasant the product is to use, not whether a feature produces the right output.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: {
      name: 'GeeksforGeeks — Amazon QAE On-Campus Placement Interview Experience',
      url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-qae-on-campus-placement-interview-experience/',
      year: 2025,
    },
  },
  {
    id: 'co-manual-amazon-6',
    company: 'Amazon',
    area: 'manual',
    role: 'SDET',
    round: 'QA interview',
    difficulty: 'easy',
    question: 'What is the difference between positive and negative test cases?',
    answer: `**Positive test cases** use valid input and the expected flow, and check that the system does what it should. **Negative test cases** use invalid, unexpected or boundary-breaking input, and check that the system rejects it safely: a clear error, no crash, no data corruption, no security hole.

**Example: ATM cash withdrawal**
- Positive: valid card, correct PIN, amount 2,000 that is within balance and daily limit → cash dispensed, balance reduced, receipt printed.
- Negative: wrong PIN three times → card blocked. Amount 2,050 when the ATM holds only 500-rupee notes → "Enter amount in multiples of 500". Amount above balance → "Insufficient funds" and no debit. Network drop after the debit but before dispensing → automatic reversal.

A good suite has more negative than positive cases, because most real bugs hide in error handling.`,
    followUps: [
      {
        q: 'How do you find good negative cases quickly?',
        a: 'Use boundary values and invalid equivalence classes for each field, then add interruptions (network loss, timeout, back button, double submit) and permission cases (wrong user role).',
      },
    ],
    topic: 'mt-test-design',
    source: {
      name: 'GeeksforGeeks — Amazon Interview Experience for Software Development Engineer in Test (SDET)',
      url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-software-development-engineer-in-test-sdet/',
      year: 2024,
    },
  },
  {
    id: 'co-manual-tech-mahindra-1',
    company: 'Tech Mahindra',
    area: 'manual',
    role: 'Manual Test Engineer',
    difficulty: 'medium',
    question: 'Explain severity and priority, and give an example of a bug that is high severity but low priority.',
    answer: `**Severity** is the technical impact of the defect on the system (set by QA). **Priority** is how urgently it must be fixed (set by the product owner or lead, based on business need). They are independent.

**High severity, low priority:** the app crashes when an admin exports a report from a legacy screen used by two people once a quarter, and a CSV workaround exists. The crash is severe, but nobody needs it fixed this sprint.

**Low severity, high priority:** the company name is misspelled on the home page banner the day before launch. Nothing breaks, but it must be fixed now.

**High / high:** payment fails for all UPI users. **Low / low:** a tooltip has a spare space on a settings page.

In an interview, say who sets each field and give one example per combination. That shows you understand the difference, not just the definitions.`,
    followUps: [
      {
        q: 'Who has the final say on priority?',
        a: 'The product owner or business stakeholder, usually in triage. QA proposes a priority with evidence of user impact, but the business decides the fix order.',
      },
    ],
    topic: 'mt-defects',
    source: { name: 'AmbitionBox — Tech Mahindra Manual Test Engineer interview questions', url: AB('tech-mahindra', 'manual-test-engineer'), year: 2025 },
  },
  {
    id: 'co-manual-tech-mahindra-2',
    company: 'Tech Mahindra',
    area: 'manual',
    role: 'Manual Test Engineer',
    difficulty: 'medium',
    question: 'What is the pesticide paradox in testing?',
    answer: `The **pesticide paradox** is one of the seven testing principles (ISTQB): if you run the same tests again and again, they eventually stop finding new defects, just as insects become resistant to the same pesticide. The code they cover becomes "clean" for those exact inputs, while bugs survive elsewhere.

**How to counter it:**
- Review and update test cases every release; add cases for new features and for every escaped defect.
- Vary the test data (new boundaries, unusual characters, other locales).
- Add exploratory sessions and charters next to scripted regression.
- Use defect and coverage data to find areas that the suite never touches.

**Example:** a login regression suite had passed for six months. An exploratory session that pasted an email with a trailing space found that such users could never log in. A new case was added, so the suite "learned".

Note: the pesticide paradox does not mean regression suites are useless. Regression still protects existing behaviour. It means they are not enough on their own to find *new* bugs.`,
    followUps: [
      {
        q: 'Name two other testing principles.',
        a: 'Exhaustive testing is impossible, and defects cluster together: a small number of modules usually contain most of the defects. Others: early testing saves money, and testing is context dependent.',
      },
    ],
    topic: 'mt-fundamentals',
    source: { name: 'AmbitionBox — Tech Mahindra Manual Test Engineer interview questions', url: AB('tech-mahindra', 'manual-test-engineer'), year: 2025 },
  },
  {
    id: 'co-manual-tech-mahindra-3',
    company: 'Tech Mahindra',
    area: 'manual',
    role: 'Manual Test Engineer',
    difficulty: 'medium',
    question: 'How is load testing different from stress testing?',
    answer: `Both are performance tests. They answer different questions.

- **Load testing** checks behaviour at the **expected** load, for example the 5,000 concurrent users the business forecasts for a sale. Goal: response times and error rates stay within the SLA (say p95 < 2 s, errors < 0.1%).
- **Stress testing** pushes **beyond** the expected load, for example ramping to 20,000 users or cutting memory, until the system breaks. Goal: find the breaking point and check that it fails gracefully (queues, "please retry" pages, no data loss) and recovers when the load drops.

**Example (ticket booking):** load test 3,000 users booking for 30 minutes: p95 1.4 s, fine. Stress test ramped to 12,000: at 9,000 the payment service timed out, but bookings stayed consistent and the site recovered in 2 minutes. That is an acceptable failure mode, and the team now knows the capacity limit.

Related types: **spike** (sudden jump), **soak/endurance** (normal load for many hours, to catch memory leaks).`,
    followUps: [
      {
        q: 'Which tools have you used for these?',
        a: 'JMeter, k6, Gatling or LoadRunner generate the load; Grafana, Dynatrace or AppDynamics show server metrics so you can see where the bottleneck is.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: { name: 'AmbitionBox — Tech Mahindra Manual Test Engineer interview questions', url: AB('tech-mahindra', 'manual-test-engineer'), year: 2025 },
  },
  {
    id: 'co-manual-hcltech-1',
    company: 'HCLTech',
    area: 'manual',
    role: 'Manual Test Engineer',
    round: 'One-on-one',
    difficulty: 'medium',
    question: 'What is defect masking?',
    answer: `**Defect masking** happens when one defect hides another, so the second defect cannot be seen until the first is fixed.

**Example:** on a checkout page, the "Apply coupon" button throws an error for every coupon (defect A). Because no coupon is ever applied, nobody notices that the discount is calculated on the price *before* tax instead of after (defect B). When A is fixed, B appears.

Why it matters:
- After a fix, **retest plus nearby regression** is essential, because fixing one bug can reveal others.
- Metrics after a big fix can look worse for a while; that is masking being removed, not quality getting worse.

Do not confuse it with **latent defects**: a latent defect exists but has not been triggered, because the condition never happened (for example a bug that only shows in a leap year). A masked defect is hidden by another defect.`,
    followUps: [
      {
        q: 'How do you reduce the risk of masked defects reaching production?',
        a: 'Fix blocking defects early, run regression on the area after each fix, and design independent test cases so that one failure does not stop the remaining checks from running.',
      },
    ],
    topic: 'mt-defects',
    source: { name: 'AmbitionBox — HCLTech Manual Test Engineer interview questions', url: AB('hcltech', 'manual-test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-deloitte-1',
    company: 'Deloitte',
    area: 'manual',
    role: 'QA Engineer',
    difficulty: 'hard',
    question: 'You found a bug during functional testing, but it does not reproduce in end-to-end testing. How do you raise it?',
    answer: `Still log it. A bug that appears only in one environment is real information, but the report has to make the difference visible.

1. **Capture evidence from the functional run:** build number, environment, test data, timestamps, screenshots or video, console/network logs (HAR), server log IDs.
2. **Compare the environments:** build or config versions, feature flags, stubs or mocks (functional tests often mock a downstream service that is real in E2E), data, user role, browser, timing.
3. **Try to narrow it down:** re-run in the functional environment; try the E2E environment with the same data.
4. **Raise it** with a clear title such as "Order total wrong when tax-service stub returns 0 — functional env only", list both environments, mark it *reproducible in env X only*, and set severity on the impact if it reached production.
5. **Discuss it in triage or with the developer.** Often the cause is a stub that does not match the real contract, which is itself a defect in the test setup or a hidden risk in production.

Never close a bug as "cannot reproduce" just because one environment is clean.`,
    followUps: [
      {
        q: 'What if after investigation it really is only a test-environment problem?',
        a: 'Then re-classify it as an environment or test-data issue, fix the setup (for example update the stub), and record the cause so the same false failure does not cost time again.',
      },
    ],
    topic: 'mt-defects',
    source: { name: 'AmbitionBox — Deloitte QA Engineer interview questions', url: AB('deloitte', 'qa-engineer'), year: 2026 },
  },
  {
    id: 'co-manual-epam-systems-1',
    company: 'EPAM Systems',
    area: 'manual',
    role: 'Senior Test Engineer',
    round: 'Technical',
    difficulty: 'medium',
    question: 'What is the difference between a test plan and a test strategy?',
    answer: `A **test strategy** is the high-level, long-lived approach to testing, often for the whole organisation or programme: test levels and types, automation approach, tools, environments policy, defect process, metrics. It rarely changes.

A **test plan** is project- or release-specific and says how that strategy will be applied *this time*: scope in and out, features to test, schedule, people, environments, entry and exit criteria, risks and mitigations, deliverables.

| | Strategy | Plan |
|---|---|---|
| Level | Organisation / programme | Project / release |
| Answers | *How do we test, in general?* | *What, when and who, for this release?* |
| Changes | Rarely | Every release |

**Example:** the strategy says "all APIs get contract tests in CI and UI regression runs nightly in Playwright". The plan for release 4.2 says "test the new refund flow from 3 to 14 March; 2 testers; refunds over 50,000 out of scope; exit when no open critical defects and 95% of cases passed".`,
    followUps: [
      {
        q: 'Which standard describes a test plan template?',
        a: 'IEEE 829 (now replaced by ISO/IEC/IEEE 29119-3) defines sections such as test items, features to be tested, approach, pass/fail criteria, suspension criteria, deliverables, schedule and risks.',
      },
    ],
    topic: 'mt-test-artifacts',
    source: { name: 'AmbitionBox — EPAM Systems Senior Test Engineer interview questions', url: AB('epam-systems', 'senior-test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-paytm-1',
    company: 'Paytm',
    area: 'manual',
    role: 'QA Engineer',
    round: 'Technical round 1',
    difficulty: 'easy',
    question: 'What is the difference between retesting and regression testing?',
    answer: `**Retesting** (confirmation testing) re-runs the **exact failed test** on a new build to confirm that a specific defect is fixed. It is planned, it targets one bug, and it cannot be skipped.

**Regression testing** re-runs **tests that previously passed** to check that the fix, or any other change, did not break something else. It is broad and a good candidate for automation.

| | Retesting | Regression |
|---|---|---|
| Target | Known failed cases | Previously passed cases |
| Purpose | Is the bug fixed? | Did the change break anything else? |
| Defect link | Tied to a defect ID | Not tied to a specific defect |
| Automation | Rarely worth it | Usually automated |

**Example (Paytm wallet):** bug "Add Money fails for amounts with paise (e.g. 100.50)". *Retest:* add 100.50 on the fixed build and check the balance. *Regression:* also run add-money by UPI and card, wallet-to-bank transfer, passbook entries and cashback, because the amount-parsing code is shared.`,
    followUps: [
      {
        q: 'Which comes first after a fix lands?',
        a: 'Retesting first: there is no point running a wide regression pass on a build where the fix itself does not work. Then regression around the changed area.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: { name: 'AmbitionBox — Paytm QA Engineer interview questions', url: AB('paytm', 'qa-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-amazon-7',
    company: 'Amazon',
    area: 'manual',
    role: 'Test Engineer',
    round: 'One-on-one',
    difficulty: 'medium',
    question: 'What is exploratory testing, and how do you do it well?',
    answer: `**Exploratory testing** is simultaneous learning, test design and execution: the tester decides the next test based on what the last one revealed, instead of following a pre-written script. It is not random clicking; it is structured by **charters** and **time-boxes**.

**How to do it well (session-based test management):**
1. **Charter:** "Explore the *Subscribe & Save* flow with changing delivery addresses to find pricing and scheduling issues."
2. **Time-box:** 60–90 minutes, no interruptions.
3. **Use heuristics:** boundaries, interruptions (back button, network loss), CRUD on each object, different user roles, unusual data (emoji, very long names), timezones.
4. **Take notes as you go:** what you covered, questions, bugs, ideas for later.
5. **Debrief:** share findings with the lead, log bugs, turn valuable paths into scripted or automated regression cases.

**Example:** a charter on Subscribe & Save found that changing the delivery address to another pin code kept the old delivery date even though that pin code had no slot that day. No scripted case covered it.

Best used for new features, unclear requirements, and after scripted tests pass.`,
    followUps: [
      {
        q: 'How is exploratory testing different from ad hoc testing?',
        a: 'Ad hoc testing is informal and undocumented, with no plan. Exploratory testing has a charter, a time-box, notes and a debrief, so its coverage can be reported and repeated.',
      },
    ],
    topic: 'mt-exploratory-risk',
    source: { name: 'AmbitionBox — Amazon Test Engineer interview questions', url: AB('amazon', 'test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-accenture-1',
    company: 'Accenture',
    area: 'manual',
    role: 'Test Analyst',
    difficulty: 'easy',
    question: 'In which testing phase is the traceability matrix prepared?',
    answer: `The **Requirements Traceability Matrix (RTM)** is **started in the requirement analysis phase** of the STLC, when each requirement gets an ID, and it is **filled in during test case design**, when each test case is mapped to the requirement it covers. It is then **updated during execution** with results and defect IDs, and used at **test closure** to prove coverage.

**Example RTM row:**

| Req ID | Requirement | Test cases | Status | Defects |
|---|---|---|---|---|
| REQ-12 | User can reset password by email | TC-40, TC-41, TC-42 | 2 pass, 1 fail | BUG-311 |

**Why it matters:**
- **Forward traceability** (requirement → tests) shows nothing was left untested.
- **Backward traceability** (test → requirement) shows no test exists without a reason.
- When a requirement changes, the RTM tells you exactly which tests to update and re-run.`,
    followUps: [
      {
        q: 'What is bidirectional traceability?',
        a: 'Tracing in both directions: from each requirement to its test cases and defects, and from each test case or defect back to its requirement. It supports both coverage reporting and impact analysis.',
      },
    ],
    topic: 'mt-test-artifacts',
    source: { name: 'AmbitionBox — Accenture Test Analyst interview questions', url: AB('accenture', 'test-analyst'), year: 2025 },
  },
  {
    id: 'co-manual-accenture-2',
    company: 'Accenture',
    area: 'manual',
    role: 'Quality Analyst',
    round: 'Technical',
    difficulty: 'medium',
    question: 'What is a product backlog, and what happens in a defect triage meeting?',
    answer: `**Product backlog:** the ordered list of everything the product might need: user stories, bugs, technical tasks, spikes. The **product owner** owns it and orders it by value and risk. Items near the top are refined (clear acceptance criteria, estimates) so they are ready for sprint planning. Bugs that are not fixed immediately go into the backlog too.

**Defect triage:** a regular meeting (often daily near a release) where the **QA lead, dev lead and product owner** go through new and disputed defects and decide for each one:
- Is it valid, a duplicate, or not a bug?
- **Severity** (impact) and **priority** (urgency).
- **Owner** and **target release or sprint**, or defer it to the backlog.
- Is more information needed from the reporter?

**Example:** in triage before a release, "PDF invoice shows the wrong GST rate for Kerala" is confirmed as high severity and high priority, and assigned to the billing developer for this release. "Footer link colour is wrong in dark mode" is low/low and moved to the backlog.

QA's job in triage: come with clear reproduction steps and evidence, and explain the user impact.`,
    followUps: [
      {
        q: 'Who should attend defect triage?',
        a: 'At minimum the product owner (business priority), a developer lead (effort and root cause) and the QA lead (impact and reproduction). Others join when their area is affected.',
      },
    ],
    topic: 'mt-agile-release',
    source: { name: 'AmbitionBox — Accenture Quality Analyst interview questions', url: AB('accenture', 'quality-analyst'), year: 2024 },
  },
  {
    id: 'co-manual-infosys-1',
    company: 'Infosys',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'What is the difference between smoke testing and sanity testing?',
    answer: `**Smoke testing** is a **wide and shallow** check on a new build: do the most important functions work at all, so that the build is stable enough to test? It covers the whole application at surface level and is often automated and run in CI on every build.

**Sanity testing** is a **narrow and deeper** check on a specific area after a fix or small change: does this part behave sensibly now? It is usually quick and unscripted.

| | Smoke | Sanity |
|---|---|---|
| Scope | Whole app, critical paths | One feature or fix |
| Question | Is the build testable? | Is this change reasonable? |
| Build | Every new build | Relatively stable build after a change |

**Example (banking app):** *Smoke:* login works, the dashboard loads, a fund transfer can be started, a statement opens. If login fails, the build is rejected. *Sanity:* after a fix to the beneficiary-name validation, add beneficiaries with valid and invalid names and check related screens.`,
    followUps: [
      {
        q: 'What happens if a smoke test fails?',
        a: 'The build is rejected and sent back to development; detailed testing does not start, because results on an unstable build would waste time.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: { name: 'AmbitionBox — Infosys Test Engineer interview questions', url: AB('infosys', 'test-engineer'), year: 2025 },
  },
  {
    id: 'co-manual-infosys-2',
    company: 'Infosys',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'What is the purpose of a sprint retrospective meeting?',
    answer: `The **sprint retrospective** happens at the end of each sprint, after the review. The whole Scrum team inspects **how they worked**, not what they built, and agrees a few concrete improvements for the next sprint.

Typical format: *What went well? What did not go well? What will we change?* Each improvement gets an owner, and the next retro checks whether it happened.

**What QA brings:**
- Data: defects found late, escaped defects, flaky tests, blocked days waiting for builds or environments.
- Process ideas: three amigos on stories before coding, earlier test data, a definition of done that includes automated tests.

**Example:** in one retro, QA showed that 6 of 9 bugs that sprint came from unclear acceptance criteria. The team agreed to hold a 15-minute three amigos session for every story. The next sprint, only 2 such bugs appeared.

The retro must be a safe space: it is about the process, not about blaming people.`,
    followUps: [
      {
        q: 'How is the sprint review different from the retrospective?',
        a: 'The review inspects the product increment with stakeholders and adapts the backlog. The retrospective inspects the team\'s way of working and produces process improvements.',
      },
    ],
    topic: 'mt-agile-release',
    source: { name: 'AmbitionBox — Infosys Test Engineer interview questions', url: AB('infosys', 'test-engineer'), year: 2025 },
  },
  {
    id: 'co-manual-infosys-3',
    company: 'Infosys',
    area: 'manual',
    role: 'Quality Engineering Analyst',
    round: 'Technical',
    difficulty: 'medium',
    question: 'Describe a complex bug you found and how you reported it.',
    answer: `Use a real example and show **how you investigated**, not just that you found it. Structure: context, symptom, investigation, report, outcome.

**Example answer:**
- *Context:* an insurance portal where agents could edit a quote in two browser tabs.
- *Symptom:* sometimes the premium on the final PDF did not match the screen.
- *Investigation:* I could not reproduce it at first. Comparing the network calls (HAR files) showed that the second tab saved the quote with a **stale version number**, and the server accepted it without an optimistic-lock check. It only happened if the tabs were saved within about 30 seconds of each other.
- *Report:* title "Quote premium overwritten by stale data when saved from two tabs (no version check)". Exact steps with timing, expected vs actual, both HAR files, a screen recording, DB rows before and after, severity **critical** (wrong financial document), environment and build.
- *Outcome:* the developer reproduced it in 5 minutes from my report. They added a version check and a "this quote was changed elsewhere" message, and I added a regression case for concurrent edits.

The point to land: a good bug report lets the developer reproduce the bug without talking to you.`,
    followUps: [
      {
        q: 'What makes a bug title good?',
        a: 'It says what fails, where and under which condition, so that someone scanning the list understands it without opening the ticket — for example "Checkout: total ignores coupon when the cart contains a gift card".',
      },
    ],
    topic: 'mt-defects',
    source: {
      name: 'GeeksforGeeks — Quality Engineering Analyst Interview Experience at Infosys',
      url: 'https://www.geeksforgeeks.org/interview-experiences/quality-engineering-analyst-interview-experience-at-infosys/',
      year: 2025,
    },
  },
  {
    id: 'co-manual-wipro-1',
    company: 'Wipro',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'What is ad hoc testing? Describe it briefly.',
    answer: `**Ad hoc testing** is informal testing without planning, documentation or test cases. The tester uses knowledge of the system and intuition to try to break it, often with random or unusual inputs. Its aim is to find defects that formal cases miss.

**Types often mentioned:**
- **Buddy testing:** a developer and a tester test a module together right after it is built.
- **Pair testing:** two testers share one machine and swap ideas.
- **Monkey testing:** random inputs and actions, with no knowledge of the system.

**Example:** after the scripted cases for a leave-application form passed, a tester pasted 5,000 characters into the "reason" field and pressed Submit twice quickly. The result was two duplicate leave requests and a database error. No test case covered it.

**Limits:** it is hard to repeat and its coverage cannot be measured, so findings should be turned into proper test cases. When you want a structured version, use **exploratory testing** with charters and notes.`,
    followUps: [
      {
        q: 'When should ad hoc testing not be used?',
        a: 'As the only testing, or in regulated projects that need documented evidence. It is a supplement after planned tests, not a replacement.',
      },
    ],
    topic: 'mt-exploratory-risk',
    source: { name: 'AmbitionBox — Wipro Test Engineer interview questions', url: AB('wipro', 'test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-wipro-2',
    company: 'Wipro',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'Explain the difference between white box and black box testing.',
    answer: `**Black box testing** tests the system through its inputs and outputs, with **no knowledge of the code**. Test design comes from requirements: equivalence partitioning, boundary values, decision tables, state transitions, use cases. Usually done by testers at system and acceptance level.

**White box testing** tests with **knowledge of the internal code and structure**. Tests are designed to exercise statements, branches, conditions and paths, and are measured by code coverage. Usually done by developers at unit level.

**Grey box** mixes both: for example a tester who checks the database tables after a UI action, or knows the API contract behind a screen.

**Example (discount rule: 10% off for orders of 1,000 or more):**
- *Black box:* test 999, 1,000 and 1,001 and check the totals.
- *White box:* the code is "if (total > 1000)". Branch analysis shows that 1,000 takes the wrong branch. That is an off-by-one bug, and a black box boundary test of exactly 1,000 also finds it.`,
    followUps: [
      {
        q: 'What is statement coverage vs branch coverage?',
        a: 'Statement coverage measures the percentage of code lines executed; branch coverage measures the percentage of decision outcomes (true and false) executed. 100% branch coverage implies 100% statement coverage, not the other way round.',
      },
    ],
    topic: 'mt-fundamentals',
    source: { name: 'AmbitionBox — Wipro Test Engineer interview questions', url: AB('wipro', 'test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-tech-mahindra-4',
    company: 'Tech Mahindra',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'How does ad hoc testing differ from monkey testing?',
    answer: `Both are unscripted, but they differ in **who tests and how much knowledge is used**.

- **Ad hoc testing:** an informed tester who **knows the application** deliberately tries likely weak spots: odd inputs, unusual flows, error handling. The tests are random in order but chosen on purpose.
- **Monkey testing:** **random inputs and actions with no knowledge** of the application, like a monkey on the keyboard. It is often automated (for example Android's adb shell monkey tool sends random taps and swipes) and looks for crashes, freezes and memory problems.

**Example (food-delivery app):**
- *Ad hoc:* knowing that the cart is stored on the server, the tester adds items on the phone, logs in on the web and removes an item there, then places the order on the phone. A stale cart is found.
- *Monkey:* the adb monkey tool sends 50,000 random events. The app crashes on the order-tracking map after a fast rotate-and-back sequence.

"Smart monkey" testing adds some knowledge of valid states; "dumb monkey" has none.`,
    followUps: [
      {
        q: 'Which one is better at finding crashes?',
        a: 'Monkey testing, run automatically for a long time, is very good at finding crashes and memory leaks. Ad hoc testing is better at finding logic and business-rule bugs.',
      },
    ],
    topic: 'mt-exploratory-risk',
    source: { name: 'AmbitionBox — Tech Mahindra Test Engineer interview questions', url: AB('tech-mahindra', 'test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-ltimindtree-1',
    company: 'LTIMindtree',
    area: 'manual',
    role: 'Test Engineer',
    round: 'One-on-one',
    difficulty: 'easy',
    question: 'What is an RTM, and what is a test scenario?',
    answer: `**RTM (Requirements Traceability Matrix):** a table that maps every requirement to the test cases that cover it, and usually to their execution status and defects. It proves coverage ("every requirement has at least one test") and supports impact analysis ("REQ-7 changed, so re-run TC-21 to TC-25").

**Test scenario:** a one-line description of a functionality to verify, taken from a requirement or user story. It says *what* to test, not *how*. Each scenario is expanded into detailed test cases.

**Example together:**
- Requirement REQ-7: "A user can transfer money to a saved beneficiary up to the daily limit of 1,00,000."
- Scenarios: "Verify transfer within limit", "Verify transfer above daily limit is blocked", "Verify transfer to a new beneficiary is blocked during the cooling period".
- RTM row: REQ-7 → TC-21 … TC-25 → 4 passed, 1 failed → BUG-88.

Interview tip: mention that the RTM is maintained throughout the STLC, from requirement analysis to closure.`,
    followUps: [
      {
        q: 'What tool would you use to keep an RTM?',
        a: 'A spreadsheet works for small projects; in practice teams use Jira with Xray or Zephyr, TestRail, or Azure Test Plans, where tests are linked to stories and the coverage report is built in.',
      },
    ],
    topic: 'mt-test-artifacts',
    source: { name: 'AmbitionBox — LTIMindtree Test Engineer interview questions', url: AB('ltimindtree', 'test-engineer'), year: 2023 },
  },
  {
    id: 'co-manual-tcs-1',
    company: 'TCS',
    area: 'manual',
    role: 'Manual Test Engineer',
    difficulty: 'easy',
    question: 'What is non-functional testing? Give examples of its types.',
    answer: `**Non-functional testing** checks **how well** the system works rather than **what** it does: speed, capacity, security, usability, reliability, compatibility. These are often called "quality attributes" or "-ilities".

**Main types with examples (a railway booking site):**
- **Performance / load:** 10,000 users searching trains at 10:00 for Tatkal; p95 response under 3 s.
- **Stress:** ramp to 50,000 users to find the breaking point and check graceful failure.
- **Security:** a user cannot view another user's PNR by changing the ID in the URL; passwords stored hashed.
- **Usability:** a first-time user can book a ticket in under 5 minutes without help.
- **Accessibility:** forms work with a screen reader and keyboard only (WCAG).
- **Compatibility:** works on Chrome, Safari and Firefox, and on Android and iOS at common screen sizes.
- **Reliability / recovery:** if the payment gateway times out, the booking is not lost and the money is refunded.

Non-functional requirements should be **measurable** ("under 3 seconds"), otherwise they cannot be tested.`,
    followUps: [
      {
        q: 'Can non-functional tests be done manually?',
        a: 'Some can — usability, accessibility checks and basic compatibility. Load, stress and soak testing need tools such as JMeter or k6 to generate traffic.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: { name: 'AmbitionBox — TCS Manual Test Engineer interview questions', url: AB('tcs', 'manual-test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-capgemini-1',
    company: 'Capgemini',
    area: 'manual',
    role: 'Quality Analyst',
    difficulty: 'easy',
    question: 'What is the difference between a bug and a defect?',
    answer: `In everyday work the words are often used interchangeably, but the ISTQB terminology makes a distinction worth knowing:

- **Error (mistake):** a human action that produces a wrong result, for example a developer misreads the requirement.
- **Defect (fault, bug):** the flaw in the work product that results, for example the wrong condition in the code or a wrong requirement.
- **Failure:** what is observed when the defect is executed: the system behaves differently from what is expected.

Common industry usage: **"bug"** is the informal name a tester uses when the software misbehaves; **"defect"** is the formal term, often for a deviation from requirements that has been accepted in the tracker. Some teams also use "defect" for issues found by the client or in UAT.

**Example:** the requirement says GST is 18%. The developer types 0.08 (*error*), so the code contains the wrong rate (*defect/bug*), and the invoice shows a lower tax total (*failure*).

In an interview, give the error → defect → failure chain; it shows you know the formal model and not just synonyms.`,
    followUps: [
      {
        q: 'Can a defect exist without causing a failure?',
        a: 'Yes. If the faulty code is never executed, or the triggering condition never occurs, the defect stays latent and no failure is observed.',
      },
    ],
    topic: 'mt-defects',
    source: { name: 'AmbitionBox — Capgemini Quality Analyst interview questions', url: AB('capgemini', 'quality-analyst'), year: 2021 },
  },
  {
    id: 'co-manual-qualtech-edge-1',
    company: 'Qualtech Edge',
    area: 'manual',
    role: 'Testing Engineer',
    round: 'Technical interview',
    difficulty: 'medium',
    question: 'What are the different forms of boundary value analysis?',
    answer: `**Boundary value analysis (BVA)** tests the values at and around the edges of an input range, because off-by-one mistakes cluster there. It is used together with equivalence partitioning.

**Two-value (standard) BVA:** for each boundary, test the boundary value and the value just outside it. For an age field that accepts 18–60: **17, 18, 60, 61**.

**Three-value BVA:** test the boundary and the values on both sides of it: **17, 18, 19** and **59, 60, 61**. This catches more mistakes (for example "<" coded instead of "<=").

**Robust BVA:** also includes invalid values beyond the range (17, 61, and sometimes extremes such as 0, -1 or a 10-digit number).

**Worst-case BVA:** for several inputs, combine boundary values of all of them at the same time (5ⁿ combinations) instead of varying one input at a time; used for high-risk calculations.

**Example (loan EMI: amount 10,000–5,00,000, tenure 6–60 months):** standard BVA gives 9,999 / 10,000 / 5,00,000 / 5,00,001 and 5 / 6 / 60 / 61. Worst case adds combinations such as 10,000 at 60 months and 5,00,000 at 6 months.`,
    followUps: [
      {
        q: 'Does BVA work for non-numeric inputs?',
        a: 'Yes, for anything ordered or sized: string length (0, 1, max, max+1 characters), dates (first and last day of a range), file size limits, list sizes.',
      },
    ],
    topic: 'mt-test-design',
    source: {
      name: 'GeeksforGeeks — Qualtech Edge Interview Experience for Testing Engineer 2023',
      url: 'https://www.geeksforgeeks.org/interview-experiences/qualtech-edge-interview-experience-for-testing-engineer-2023/',
      year: 2023,
    },
  },
  {
    id: 'co-manual-qualtech-edge-2',
    company: 'Qualtech Edge',
    area: 'manual',
    role: 'Testing Engineer',
    round: 'Technical interview',
    difficulty: 'medium',
    question: 'How do you keep test cases maintained and up to date over time?',
    answer: `Test cases decay as the product changes. Keeping them useful takes a routine, not a one-off clean-up.

1. **Link tests to requirements or stories** (RTM, Jira links). When a story changes, the linked cases are flagged for review.
2. **Review in every sprint or release:** update changed steps, retire cases for removed features, merge duplicates.
3. **Add a case for every escaped defect** so the same bug cannot slip through twice.
4. **Write maintainable cases:** one objective per case, preconditions separate from steps, reusable shared steps (for example "Log in as an admin"), test data kept apart from steps.
5. **Use a test management tool** (TestRail, Zephyr, Xray) with versioning and owners per module.
6. **Prune by data:** cases that have not found a bug in a year and cover low-risk areas can move to a lower-priority regression tier.

**Example:** after a login redesign, 40 cases referenced the old "Sign in" button. Because they used a shared step "Log in as <role>", one update fixed all 40.`,
    followUps: [
      {
        q: 'How do you decide which cases go into the regression suite?',
        a: 'Pick by risk: critical business flows, areas with frequent changes, areas with past defects, and integrations. Low-risk, stable cases can run less often.',
      },
    ],
    topic: 'mt-test-artifacts',
    source: {
      name: 'GeeksforGeeks — Qualtech Edge Interview Experience for Testing Engineer 2023',
      url: 'https://www.geeksforgeeks.org/interview-experiences/qualtech-edge-interview-experience-for-testing-engineer-2023/',
      year: 2023,
    },
  },
  {
    id: 'co-manual-wtw-1',
    company: 'WTW',
    area: 'manual',
    role: 'Analyst — Software Quality Assurance & Testing',
    round: 'Panel interview',
    difficulty: 'easy',
    question: 'What is the difference between quality assurance and testing?',
    answer: `**Quality assurance (QA)** is **process-oriented and preventive**: it makes sure the way software is built leads to quality. Examples: defining standards, code and requirement reviews, a definition of done, test strategy, process audits, retrospectives. It covers the whole SDLC.

**Testing** (part of **quality control**) is **product-oriented and detective**: it executes the software to find defects and to give information about its quality. Examples: running test cases, exploratory sessions, automated suites.

| | QA | Testing (QC) |
|---|---|---|
| Focus | Process | Product |
| Goal | Prevent defects | Find defects |
| When | Throughout the SDLC | Once there is something to test |
| Who | Whole team, QA leads | Testers, developers |

**Example:** a team keeps shipping bugs from unclear stories. *Testing* finds those bugs after coding. *QA* changes the process: stories need acceptance criteria and a three amigos review before development, so fewer of those bugs are created.

So QA ⊃ QC ⊃ testing: testing is one activity inside quality control, which is part of quality assurance.`,
    followUps: [
      {
        q: 'Is a tester only doing QC then?',
        a: 'Not in modern teams. Testers do QC but also QA work: reviewing requirements early, suggesting process changes, and improving the definition of done.',
      },
    ],
    topic: 'mt-fundamentals',
    source: {
      name: 'GeeksforGeeks — WTW Interview Experience (Analyst, Software Quality Assurance & Testing, full time)',
      url: 'https://www.geeksforgeeks.org/interview-experiences/wtw-interview-experience-analyst-software-quality-assurance-testing-role-full-time/',
      year: 2024,
    },
  },
  {
    id: 'co-manual-wtw-2',
    company: 'WTW',
    area: 'manual',
    role: 'Analyst — Software Quality Assurance & Testing',
    round: 'Panel interview',
    difficulty: 'medium',
    question: 'Where does test data come from? Name the main sources.',
    answer: `Main sources of test data, with their trade-offs:

1. **Created by hand** from test design (boundaries, equivalence classes). Precise, but slow to produce in volume.
2. **Generated by scripts or tools** (Faker, SQL scripts, API calls in setup). Fast and repeatable; good for volume and performance tests.
3. **Copied from production and masked/anonymised.** Realistic, but must follow privacy rules (GDPR, DPDP Act): mask names, emails, card numbers and PAN before use.
4. **Synthetic data that mirrors production distributions.** Realistic without personal data.
5. **Fixtures and seed data** checked into the repo and loaded before each run, so automated tests are independent.
6. **Third-party sandbox data:** for example payment gateway test cards, or a provider's sandbox accounts.

**Example (insurance policy portal):** boundary ages (17, 18, 65, 66) are created by hand; 50,000 policies for a load test are generated; a masked production extract is used to find odd real-world addresses; the payment gateway's test cards are used for premium payment.

Also say how data is **reset** between runs, so tests do not depend on each other.`,
    followUps: [
      {
        q: 'Why not just use production data as it is?',
        a: 'It contains personal and financial information, so using it unmasked breaks privacy law and security policy. It can also trigger real emails or payments if integrations are live.',
      },
    ],
    topic: 'mt-test-design',
    source: {
      name: 'GeeksforGeeks — WTW Interview Experience (Analyst, Software Quality Assurance & Testing, full time)',
      url: 'https://www.geeksforgeeks.org/interview-experiences/wtw-interview-experience-analyst-software-quality-assurance-testing-role-full-time/',
      year: 2024,
    },
  },
  {
    id: 'co-manual-to-the-new-1',
    company: 'To The New',
    area: 'manual',
    role: 'Quality Engineer',
    round: 'Technical interview',
    difficulty: 'easy',
    question: 'What is the role of QA, and in which SDLC phase should QA get involved?',
    answer: `**QA should get involved from the requirements phase**, not after coding. This is the "early testing" or **shift-left** principle: a defect found in a requirement costs minutes to fix, the same defect found in production can cost days.

**What QA does in each phase:**
- **Requirements:** review stories for ambiguity and testability, ask "what happens if…?", help write acceptance criteria.
- **Design:** review designs and API contracts for testability; plan test data and environments; start the test plan.
- **Development:** write test cases and automation in parallel; test early builds and APIs.
- **Testing:** execute, log defects, regression, report status.
- **Deployment:** smoke test in production, support UAT, check release notes.
- **Maintenance:** analyse escaped defects, add regression cases, monitor production.

**Example:** in a story review, QA asked "What happens to the reward points if an order is partly refunded?". Nobody had decided, so the rule was defined before coding instead of becoming a production bug.

The role of QA is to give the team fast, honest information about quality and risk at every stage, not just to "find bugs at the end".`,
    followUps: [
      {
        q: 'What is shift-right testing?',
        a: 'Testing and monitoring in or near production: feature flags, canary releases, A/B tests, synthetic monitoring and analysing real user errors. It complements shift-left rather than replacing it.',
      },
    ],
    topic: 'mt-fundamentals',
    source: {
      name: 'GeeksforGeeks — To The New Interview Experience for Quality Engineer',
      url: 'https://www.geeksforgeeks.org/interview-experiences/to-the-new-interview-experience-for-quality-engineer/',
      year: 2023,
    },
  },
  {
    id: 'co-manual-oracle-1',
    company: 'Oracle',
    area: 'manual',
    role: 'QA Engineer',
    difficulty: 'medium',
    question: 'How do you manage critical test cases?',
    answer: `"Critical" test cases are the ones whose failure would block a release: core business flows, money, security, legal or data-integrity checks. Managing them well means **identifying, protecting and running them first**.

1. **Identify by risk:** likelihood × impact for each feature. Payment, login, data saving and compliance rules usually come out on top.
2. **Tag them** (priority P1 / "critical" label in TestRail, Xray or Zephyr) so they can be filtered into a suite.
3. **Run them first** in every cycle and as the core of smoke and regression; automate them where stable.
4. **Review them often:** keep steps and data current; a stale critical case is worse than none.
5. **Make them gate the release:** exit criteria such as "100% of critical cases pass, no open critical defects".
6. **Trace them** to requirements so coverage of high-risk areas can be shown.
7. **Report them separately** in status reports, so stakeholders see their status at a glance.

**Example:** for a banking release, 35 of 600 cases were tagged critical (fund transfer, OTP, statement totals). They were automated and ran on every build; the release was held for one day when 1 of the 35 failed on interest calculation.`,
    followUps: [
      {
        q: 'What do you do if there is no time to run everything?',
        a: 'Run all critical cases first, then high-priority cases for the changed areas, and report clearly which lower-priority cases were not run and what risk that leaves.',
      },
    ],
    topic: 'mt-exploratory-risk',
    source: { name: 'AmbitionBox — Oracle QA Engineer interview questions', url: AB('oracle', 'qa-engineer'), year: 2026 },
  },
  {
    id: 'co-manual-sap-1',
    company: 'SAP',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'What are the types of functional testing?',
    answer: `Functional testing checks that features behave as required. Its main types are usually grouped by **level** and by **purpose**:

**By level:**
- **Unit testing:** individual functions or classes (developers).
- **Integration testing:** modules or services working together (for example order service + payment service).
- **System testing:** the complete application end to end against requirements.
- **User acceptance testing (UAT):** business users confirm it meets their needs; includes alpha and beta testing.

**By purpose:**
- **Smoke testing:** is the build stable enough to test?
- **Sanity testing:** does a specific fix or change work?
- **Regression testing:** did changes break existing features?
- **Retesting:** is a specific defect fixed?
- **End-to-end testing:** complete business flows across systems.
- **Exploratory / ad hoc testing:** unscripted investigation.

**Example (SAP-style procure-to-pay):** unit test the tax calculation; integration test purchase order → goods receipt; system test the whole flow; UAT by the finance team; smoke on each transport to QA; regression after a support pack.`,
    followUps: [
      {
        q: 'Is UAT always done by the testing team?',
        a: 'No. UAT is done by business users or the client, sometimes supported by QA who prepare data and scenarios. Its purpose is business acceptance, not defect hunting.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: { name: 'AmbitionBox — SAP Test Engineer interview questions', url: AB('sap', 'test-engineer'), year: 2022 },
  },
  {
    id: 'co-manual-ibm-1',
    company: 'IBM',
    area: 'manual',
    role: 'Test Engineer',
    round: 'Technical',
    difficulty: 'easy',
    question: 'How does testing fit into Scrum? Describe the testing process in an agile team.',
    answer: `In Scrum, testing is **part of every sprint**, not a phase at the end. The tester is a member of the development team.

**Through the sprint:**
- **Backlog refinement:** QA questions stories and helps write testable acceptance criteria (often in Given/When/Then form).
- **Sprint planning:** testing effort is included in each story's estimate; the definition of done includes "tested and automated where sensible".
- **During the sprint:** test cases and automation are written in parallel with development; stories are tested as soon as they are ready, often with API tests before the UI exists; defects are fixed inside the sprint.
- **Daily stand-up:** QA raises blockers (environment down, story not testable).
- **Sprint review:** the tested increment is demonstrated.
- **Retrospective:** QA brings data such as escaped defects or late-delivered stories.

Regression is kept up by automation in CI, plus a short hardening or exploratory session before a release.

**Example:** a story "user can download invoice as PDF" was tested via the API on day 3, the UI on day 5, the automated check added on day 6, and it was demonstrated in the review on day 10.`,
    followUps: [
      {
        q: 'What are the agile testing quadrants?',
        a: 'Brian Marick\'s model: Q1 technology-facing tests that support the team (unit), Q2 business-facing tests that support the team (functional, story tests), Q3 business-facing tests that critique the product (exploratory, UAT), Q4 technology-facing tests that critique it (performance, security).',
      },
    ],
    topic: 'mt-agile-release',
    source: { name: 'AmbitionBox — IBM Test Engineer interview questions', url: AB('ibm', 'test-engineer'), year: 2024 },
  },
  {
    id: 'co-manual-adobe-1',
    company: 'Adobe',
    area: 'manual',
    role: 'Software Engineer',
    round: 'Technical round 4',
    difficulty: 'medium',
    question: 'Explain severity versus priority, then classify a few given bugs by both.',
    answer: `**Severity** = how badly the defect affects the system (technical impact, usually set by QA). **Priority** = how soon it must be fixed (business urgency, usually set by the product owner). They are independent.

A practical way to classify: decide severity from **impact** (crash or data loss → critical; feature broken with no workaround → major; workaround exists → minor; visual only → trivial). Then decide priority from **who is affected, how often, and the business cost**.

**Example classification (a PDF editor):**

| Bug | Severity | Priority |
|---|---|---|
| Saving a file corrupts it | Critical | High |
| App crashes when importing a 1997 file format that almost nobody uses | Critical | Low |
| Product name misspelled on the splash screen at launch | Trivial | High |
| Tooltip slightly misaligned in a rarely opened dialog | Trivial | Low |
| Undo does not work after rotating a page; Ctrl+Z on the toolbar works | Minor | Medium |

Always explain your reasoning; interviewers care more about the *why* than the label.`,
    followUps: [
      {
        q: 'Can priority change while severity stays the same?',
        a: 'Yes. A medium-severity bug can become high priority when a major customer reports it or a release date comes close; the technical impact has not changed, the business urgency has.',
      },
    ],
    topic: 'mt-defects',
    source: {
      name: 'GeeksforGeeks — Adobe Interview Experience | Set 41 (Software Engineer)',
      url: 'https://www.geeksforgeeks.org/adobe-interview-experience-set-41-software-engineer/',
      year: 2016,
    },
  },
  {
    id: 'co-manual-focus-edumatics-1',
    company: 'Focus Edumatics',
    area: 'manual',
    role: 'QA Engineering',
    round: 'Round 2',
    difficulty: 'easy',
    question: 'What is integration testing?',
    answer: `**Integration testing** checks that separately built modules or services **work together correctly**: the data passed between them, the interface contracts, and the combined behaviour. It comes after unit testing and before system testing.

**Approaches:**
- **Big bang:** integrate everything at once and test. Simple, but failures are hard to locate.
- **Top-down:** start from top modules and use **stubs** for lower modules not ready yet.
- **Bottom-up:** start from low-level modules and use **drivers** to call them.
- **Sandwich / hybrid:** a mix of both.
- In microservices: **contract tests** (for example Pact) plus integration tests against real dependencies in a test environment.

**Example (e-learning platform):** the quiz module sends a score to the progress module, which updates the certificate module. Integration tests check that a score of 80 is stored as 80 (not 0.8), that the certificate is issued once the pass mark is reached, and what happens if the progress service is down (the score should be queued, not lost).

Typical bugs found: wrong field formats, units or encodings, timeouts, missing error handling between services.`,
    followUps: [
      {
        q: 'What is the difference between a stub and a driver?',
        a: 'A stub replaces a called (lower-level) module and returns canned responses; a driver replaces a calling (higher-level) module and invokes the module under test.',
      },
    ],
    topic: 'mt-test-levels-types',
    source: {
      name: 'GeeksforGeeks — Focus Edumatics QA Engineering Interview Experience 2023',
      url: 'https://www.geeksforgeeks.org/focus-edumatics-qa-engineering-interview-experience-2023/',
      year: 2023,
    },
  },
];
