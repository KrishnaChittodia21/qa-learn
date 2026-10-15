import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-agile-release',
  phase: 'manual-advanced',
  order: 4,
  title: 'Agile Testing, Release & Reporting',
  subtitle:
    'How a tester works in Scrum and Kanban: quadrants, three amigos, DoR/DoD, Gherkin, bug triage, go/no-go, testing in production, and release reports.',
  estimatedMinutes: 85,
  sources: [
    'Agile Manifesto (agilemanifesto.org) — 4 values and 12 principles',
    'Ken Schwaber & Jeff Sutherland — The Scrum Guide (November 2020)',
    'Lisa Crispin — Using the Agile Testing Quadrants (lisacrispin.com, 2011): origin with Brian Marick, numbering does not imply order',
    'agiletester.ca (Janet Gregory & Lisa Crispin) — Agile Testing book page and quadrants posts',
    'ISTQB CTFL v4.0.1 syllabus (istqb.org) — 1.5.2 Whole team approach, 4.5 Collaboration-based test approaches, 5.1.2 Tester\'s contribution to iteration and release planning, 5.1.3 Entry and exit criteria, 5.1.7 Testing quadrants, 5.3 Test monitoring, test control and test completion, 5.5 Defect management',
    'Pete Hodgson — Feature Toggles (aka Feature Flags), martinfowler.com',
    'Danilo Sato — CanaryRelease (martinfowler.com, 2014); Martin Fowler — BlueGreenDeployment (martinfowler.com)',
    'George Dinwiddie — InfoQ interview on the Three Amigos (business, programmers, testers)',
    'Cucumber docs — Gherkin reference (Feature, Rule, Scenario, Given/When/Then, Scenario Outline, Examples)',
    'The Kanban Guide (Kanban University) — general practices, WIP limits, lead time, delivery rate, cumulative flow',
    'GeeksforGeeks — Quality Engineering Analyst interview experience at Infosys (2025)',
  ],
  tags: [
    'agile',
    'scrum',
    'testing-quadrants',
    'three-amigos',
    'definition-of-done',
    'gherkin',
    'go-no-go',
    'feature-flags',
    'canary',
    'test-summary-report',
    'kanban',
  ],
  cheatSheet: [
    'Agile Manifesto: individuals & interactions > processes & tools; working software > big documents; customer collaboration > contract negotiation; responding to change > following a plan. The right side still has value.',
    'Scrum Guide 2020: 3 accountabilities (Product Owner, Scrum Master, Developers; testers ARE Developers). 5 events: Sprint ≤ 1 month, Planning ≤ 8h, Daily 15 min, Review ≤ 4h, Retro ≤ 3h (for a 1-month sprint).',
    'Scrum artifacts + commitments: Product Backlog → Product Goal, Sprint Backlog → Sprint Goal, Increment → Definition of Done.',
    'Definition of Ready is a team practice, NOT in the Scrum Guide. Definition of Done IS in it (the Increment\'s commitment).',
    'Quadrants (Marick → Crispin/Gregory): Q1 tech-facing, supports team (unit, component); Q2 business-facing, supports team (story tests, examples, API); Q3 business-facing, critiques product (exploratory, usability, UAT); Q4 tech-facing, critiques product (performance, security). Numbers are NOT an order.',
    'Three amigos = business (PO/BA) + development + testing talk about one story BEFORE coding. Output: examples → acceptance criteria, open questions, maybe a split story.',
    'Good AC: testable, specific values, happy + negative + edge cases. Gherkin: Given (context) / When (one action) / Then (visible result); Scenario Outline + Examples for data.',
    'Go/no-go: QA recommends with evidence; the PO or release manager decides. Check: exit criteria, open Critical/High bugs, untested risk, rollback or feature flag ready.',
    'Testing in production: smoke after deploy, canary (5% of traffic first, watch errors and latency, then widen or roll back), feature flags (release, experiment, ops, permissioning), monitoring.',
    'Progress (execution) report = during testing: planned / executed / passed / failed / blocked, open bugs, blockers. Completion (summary) report = at the end: scope, results vs exit criteria, risks left, recommendation, lessons.',
    'Good metrics drive a decision and show a trend (escaped defects, pass rate per build, blocked tests, cycle time). Vanity metrics (test case count, bugs per tester) get gamed.',
    'Kanban: visualise work, limit WIP per column, manage flow. Lead time = commitment point → done (Kanban Guide); cycle time = start → done. A full "Testing" column means the team swarms to help test.',
  ],
  sections: [
    {
      heading: 'Agile in one page: the manifesto and what it means for testers',
      body: `**Agile** means building software in small pieces, testing each piece while it is built, and changing the plan when you learn something new.

The **Agile Manifesto (2001)** has four values. Each one says "we value the left side **more**". It does not say "throw away the right side".

| We value… | …more than | What it means for a tester |
|---|---|---|
| Individuals and interactions | Processes and tools | A 5-minute chat with the developer often solves what a 2-page ticket would not. |
| Working software | Comprehensive documentation | Short test notes, checklists and automated checks, not a 300-page test plan. |
| Customer collaboration | Contract negotiation | Agree acceptance criteria with the Product Owner; don't argue about the spec. |
| Responding to change | Following a plan | Stories change mid-sprint, so keep tests small and easy to update. |

Five of the **12 principles** matter most for testers:

- Deliver working software often (weeks, not months).
- Welcome changing requirements.
- Business people and developers work together daily.
- Keep attention on technical quality.
- Reflect and improve regularly (the retrospective).

**Whole-team approach** means quality is everyone's job, not only the tester's. ISTQB CTFL v4.0 uses this term too.

*Example:* the developer writes unit tests for the coupon code. The tester joins refinement, pairs with the developer and reviews those unit tests. Nobody waits for a "QA phase" at the end.

**In an interview, say:** "In Agile the whole team tests all the time, not in a phase after coding. My job is fast feedback: ask questions early, turn examples into tests, and report honestly."

**Common mistake:** "Agile means no documentation." Wrong. It means just enough useful documentation. You still write bug reports, test notes and release reports. They are just short.`,
      keyPoints: [
        'The manifesto says "more than", not "instead of".',
        'Whole-team approach: quality is shared; the tester is a coach and investigator, not a gate.',
        'Testing is continuous inside the sprint, not a separate phase after it.',
      ],
      source: 'Agile Manifesto (agilemanifesto.org); Lisa Crispin & Janet Gregory — Agile Testing; ISTQB CTFL v4.0 — 1.5.2 Whole team approach',
    },
    {
      heading: 'Agile Testing Quadrants',
      body: `**Agile Testing Quadrants** are a map of four kinds of testing. The team uses the map so it does not forget a whole kind of testing, such as performance.

Brian Marick drew the first version. Lisa Crispin and Janet Gregory made it popular in their book *Agile Testing*. The map has two axes:

- **Business-facing vs technology-facing:** is the test written in the customer's words or in the developer's words?
- **Supports the team vs critiques the product:** does the test guide the coding (written before or during it), or judge the finished product?

| Quadrant | Axes | Examples | Usually |
|---|---|---|---|
| **Q1** | Technology-facing, supports the team | Unit tests, component tests, TDD | Automated |
| **Q2** | Business-facing, supports the team | Story tests, examples, BDD scenarios, prototypes, API tests | Automated + manual |
| **Q3** | Business-facing, critiques the product | Exploratory testing, usability, UAT, demos, alpha/beta | Manual |
| **Q4** | Technology-facing, critiques the product | Performance, load, security, reliability, compatibility | Tools |

**Example:** the story "Apply coupon at checkout" on a SauceDemo-like shop.

- **Q1:** the developer unit-tests the maths: 10% of 59.99 = 6.00 (rounded).
- **Q2:** the agreed examples become Gherkin scenarios: valid code, expired code, basket below the minimum. Plus an API test for POST /cart/coupon.
- **Q3:** the tester explores for 60 minutes: coupon + currency change + back button. The PO tries it in the sprint review.
- **Q4:** a load test checks the coupon API at 200 requests per second. A security test checks that codes cannot be guessed by brute force.

**Note:** ISTQB CTFL v4.0 (5.1.7) puts smoke tests in Q4, together with non-functional tests. It puts API testing in Q2.

**In an interview, say:** "I use the quadrants as a checklist in planning. For each story I ask: which quadrants matter, and who covers each one?"

**Common mistake:** reading the numbers as an order (Q1 first, Q4 last). Crispin writes that the numbering "does NOT imply any order". If performance is the biggest risk, do the Q4 load test in sprint 1.`,
      diagram: `                 BUSINESS-FACING
          +--------------------+--------------------+
          | Q2  (auto+manual)  | Q3  (manual)       |
 SUPPORT  | story tests, BDD,  | exploratory, UAT,  | CRITIQUE
 THE TEAM | examples, API      | usability, demos   | THE
          +--------------------+--------------------+ PRODUCT
          | Q1  (automated)    | Q4  (tools)        |
          | unit, component,   | performance, load, |
          | TDD                | security, -ilities |
          +--------------------+--------------------+
                 TECHNOLOGY-FACING`,
      keyPoints: [
        'Two axes: business vs technology facing; supporting the team vs critiquing the product.',
        'Quadrants are a coverage map, not a sequence.',
        'ISTQB CTFL v4.0 section 5.1.7 covers the quadrants.',
      ],
      source: 'Lisa Crispin — Using the Agile Testing Quadrants (lisacrispin.com); ISTQB CTFL v4.0 — 5.1.7 Testing Quadrants',
    },
    {
      heading: 'Scrum roles, events and artifacts for QA',
      body: `**Scrum** is a way of working in short, fixed cycles called **Sprints**. In each Sprint the team picks a goal, builds and tests it, shows it, and improves how it works.

The Scrum Guide 2020 facts (interviewers expect them exact):

| Thing | What it is | What the tester does |
|---|---|---|
| **Product Owner** | Owns the Product Backlog and its order; maximises value | Ask for priorities; clarify AC; agree how bad business bugs are |
| **Scrum Master** | Coaches the team in Scrum; removes blockers | Raise blockers (no test environment, no test data) |
| **Developers** | Everyone who builds the Increment, **including testers** | Commit to the Sprint Goal with the team |
| **Sprint** | Fixed length, one month or less (2 weeks is common) | Test inside the Sprint, not after it |
| **Sprint Planning** | Max 8h for a 1-month sprint | Size the testing work; flag test-environment needs |
| **Daily Scrum** | 15 minutes, for the Developers | Say what is ready for test and what is blocked |
| **Sprint Review** | Max 4h for a 1-month sprint; show the Increment to stakeholders | Demo on a real environment; note feedback |
| **Sprint Retrospective** | Max 3h for a 1-month sprint; improve how the team works | Bring data: escaped bugs, late handovers, flaky tests |
| **Product Backlog → Product Goal** | Ordered list of all work | In refinement, ask "how will we test this?" |
| **Sprint Backlog → Sprint Goal** | Why, what and how for this Sprint | Test tasks go here too |
| **Increment → Definition of Done** | Finished, usable work | The DoD lists the testing that must be finished |

Backlog refinement is ongoing work, not a formal Scrum event. **Definition of Ready is not in the Scrum Guide.**

The 2020 guide replaced "Development Team" with **Developers**. It talks about **accountabilities**, not roles. There is no "QA role", so a tester is one of the Developers.

**Example:** one 2-week sprint for a food-delivery app.

- Day 1, Sprint Planning: "The OTP story needs a test SIM. Let's ask for it today."
- Every day, Daily Scrum: "Story 3 is ready for test. Story 4 is blocked: the test server is down."
- Day 10, Sprint Review: the tester helps demo order tracking on staging.
- Day 10, Retrospective: "4 bugs escaped to production, all in payments. Let's add an exploratory session for payments."

**In an interview, say:** "In Scrum I am one of the Developers. In planning I size testing. In the Daily Scrum I raise test blockers. In the review I help show working software. In the retro I bring quality data."

**Common mistake:** "QA tests in the next sprint." That is a mini-waterfall. The work is not Done when the sprint ends, and bugs come back a sprint late. If testing is not finished, the story is not Done.`,
      keyPoints: [
        'Scrum Guide 2020: accountabilities = Product Owner, Scrum Master, Developers.',
        'Timeboxes for a one-month sprint: Planning 8h, Daily 15 min, Review 4h, Retro 3h (shorter sprints usually shorter).',
        'Commitments: Product Goal, Sprint Goal, Definition of Done.',
      ],
      source: 'Ken Schwaber & Jeff Sutherland — The Scrum Guide (2020)',
    },
    {
      heading: 'Three amigos, Definition of Ready and Definition of Done',
      body: `**Three amigos** is a short meeting about one story, before coding starts. Three viewpoints join (George Dinwiddie made the name popular):

- **Business** (PO or BA): what problem do we solve? What is the rule?
- **Development:** how will we build it? What is hard?
- **Testing:** what can go wrong? How will we know it works?

The output is concrete **examples** that become acceptance criteria, a list of open questions, and sometimes a decision to split the story. This is called **specification by example**: examples remove confusion faster than abstract rules.

**Example:** story "free delivery above 499". The tester asks: "Is exactly 499.00 free?" The PO says yes. The developer asks: "Is it checked before or after the coupon?" The PO says after. Two bugs are prevented before any code exists.

**Definition of Ready (DoR)** is a team checklist: is this story ready to enter a sprint? **Definition of Done (DoD)** is the quality bar every finished piece of work must meet.

| | Definition of Ready | Definition of Done |
|---|---|---|
| Question | Can we start this story? | Can we call this work finished? |
| In Scrum Guide 2020? | No (optional team practice) | Yes (commitment of the Increment) |
| Applies to | Each backlog item, before planning | Every Increment / every item |
| Tester's items | AC written and testable, test data known, dependencies known, designs attached | AC checked, regression run, no open Critical/High bugs, automated checks added, code reviewed, deployed to staging |
| Danger if misused | Becomes a hard gate ("waterfall in disguise") | Becomes "done-ish" if testing is optional |

**Acceptance criteria (AC) vs DoD:** AC belong to one story ("an expired coupon shows 'This coupon has expired'"). The DoD applies to every story ("all AC checked; no open High bugs; automated tests in the pipeline").

**In an interview, say:** "I make sure testing is written into the DoD. Then a story with unchecked AC or an open High bug is simply not Done, whatever the date."

**Common mistake:** a DoD that nobody checks. A DoD is real only if a story that fails it goes back to In Progress.`,
      code: [
        {
          language: 'text',
          title: 'A realistic QA-friendly Definition of Done',
          code: `DEFINITION OF DONE  (Team Phoenix, web checkout)
A backlog item is Done only when ALL of these are true:

[ ] Code merged to main through a reviewed pull request
[ ] Unit tests added/updated; pipeline green
[ ] Every acceptance criterion verified on the staging environment
[ ] Exploratory session (min. 30 min) done for user-facing changes;
    notes linked to the story
[ ] Automated regression (smoke + affected areas) passed on staging
[ ] No open Critical or High defects linked to the story
    (Medium/Low: logged, triaged and accepted by the Product Owner)
[ ] New Playwright/API checks added for the main happy path
[ ] Accessibility quick check: keyboard navigation + labels
[ ] Feature flag created if the change is risky (default OFF in prod)
[ ] Release notes / help text updated if user-visible

Definition of Ready (team practice, not Scrum Guide):
[ ] AC written with at least one negative example
[ ] Test data and test environment needs identified
[ ] Dependencies (API, other team) known; designs attached`,
        },
      ],
      keyPoints: [
        'Three amigos = business + dev + test agreeing examples before coding.',
        'DoR = ready to start (team practice); DoD = really finished (Scrum commitment).',
        'AC are per story; DoD applies to every story.',
      ],
      source: 'George Dinwiddie — InfoQ interview on the Three Amigos; Scrum Guide 2020 — Definition of Done; ISTQB CTFL v4.0 — 4.5 Collaboration-based test approaches',
    },
    {
      heading: 'Acceptance criteria and BDD with Gherkin',
      body: `**Acceptance criteria (AC)** are the conditions a story must meet before the PO accepts it. Good AC give a clear pass or fail.

*Example:* "Users can apply a coupon" is a wish. "A cart of 59.99 with code SAVE10 shows a total of 53.99" is a test.

Good AC are:

- **Testable:** you can see the result.
- **Specific:** real values, not "fast" or "works correctly".
- **Complete enough:** the happy path, at least one negative case, and the main edge rules.
- **Not tied to the UI** where possible.
- **Agreed** with the PO.

**BDD (Behaviour-Driven Development)** means the team first agrees examples of behaviour, then writes them in **Gherkin**. Gherkin is a plain-English format that business people can read and tools like Cucumber or Playwright-BDD can run.

**Gherkin keywords** (Cucumber reference): Feature, Rule, Background, Scenario (or Example), Given (starting context), When (the action, ideally one), Then (expected result), And/But, and Scenario Outline with an Examples table for different data.

**Rules interviewers check**

- One behaviour and one When per scenario. Cucumber suggests about 3–5 steps per example.
- Declarative, not imperative: "When she applies coupon SAVE10", not "When she clicks #coupon and types…".
- Then must be something a user or an API client can **see**.
- Use Scenario Outline for one rule with different data (great for boundary values).

**BDD is a collaboration practice first, an automation tool second.**

**In an interview, say:** "BDD starts in the three-amigos talk. Gherkin is just the record of the examples we agreed. I keep steps declarative so they survive UI changes."

**Common mistake:** the tester writes Gherkin alone, after coding. Then the team pays the cost of BDD and gets none of the benefit, because nobody talked.`,
      code: [
        {
          language: 'gherkin',
          title: 'Coupon story: AC as Gherkin',
          code: `Feature: Apply a coupon at checkout
  As a shopper I want to use a promo code so that I pay less

  Background:
    Given I am signed in as "standard_user"
    And my cart contains "Sauce Labs Backpack" priced 29.99
    And my cart contains "Sauce Labs Fleece Jacket" priced 49.99

  Rule: A valid coupon reduces the item total by its percentage

    Scenario: Valid 10% coupon
      When I apply coupon "SAVE10"
      Then the discount line shows "-8.00"
      And the item total shows "71.98"

  Rule: Invalid coupons are rejected without changing the total

    Scenario Outline: Coupon is rejected
      When I apply coupon "<code>"
      Then I see the message "<message>"
      And the item total shows "79.98"

      Examples:
        | code      | message                          |
        | EXPIRED24 | This coupon has expired          |
        | save10x   | Coupon code not recognised       |
        | MIN100    | Minimum basket of 100.00 needed  |`,
        },
      ],
      keyPoints: [
        'AC: testable, specific, include negatives; agreed with the PO.',
        'Gherkin: Given context, When one action, Then observable outcome.',
        'Scenario Outline + Examples is ideal for boundary and equivalence data.',
      ],
      source: 'Cucumber docs — Gherkin reference',
    },
    {
      heading: 'The sprint testing workflow, day by day',
      body: `**Sprint testing workflow** = what the tester does on each day of a sprint. The goal is steady testing every day, not a pile of testing on the last two days.

*Example:* in a 2-week sprint, story S1 (login with OTP) reaches the test server on day 3. The tester tests it on days 3–4, and the developer fixes the bugs on day 5. Story S4 arrives on day 5. By day 9 only regression is left.

**A typical 2-week sprint for a tester**

| When | What the tester does |
|---|---|
| Before the sprint (refinement) | Three amigos; ask "how do we test this?"; draft AC; estimate test effort; list test-data and environment needs |
| Day 1 (planning) | Agree the Sprint Goal; add test tasks to the board; decide what needs automation, exploratory or performance testing |
| Days 2–4 | Write test ideas and Gherkin; prepare data; pair with developers; review unit tests; write API checks |
| Days 3–8 | Test each story as soon as it is deployed; log bugs; retest fixes; re-run the affected regression |
| Days 7–9 | Automate stable happy paths (Playwright); exploratory sessions on joined-up features; triage bugs with the PO |
| Day 9 | Regression on the release candidate (automated suite + targeted manual checks) |
| Day 10 | Sprint review demo; retro with quality data; report if the sprint ships |

**How to avoid the "everything lands on day 9" problem**

- Split stories so the first one is testable by day 3.
- Use **WIP limits** (a maximum number of items in progress). Developers then help test or fix bugs instead of starting new stories.
- Test on feature branches or preview environments. Test APIs before the UI exists.
- Developers own the unit tests (Q1). Testers do not re-test what unit tests already cover.

**If a story fails testing near the end,** raise it in the Daily Scrum. The PO decides: fix now, ship behind a feature flag set to OFF, or move it back to the backlog. It does not count toward velocity.

**In an interview, say:** "I start on day one with questions and examples. I test each story within a day of it being ready. So the last days are for regression and exploring, not first-time testing."`,
      diagram: `  Bad: mini-waterfall inside the sprint
  Dev  ##########################..
  Test ......................######   <- cliff, carry-over

  Good: continuous flow of small stories
  Dev  ####  ####  ####  ####  ...
  Test   ##    ##    ##    ##  ##RR   (RR = regression + review)`,
      keyPoints: [
        'Testing starts at refinement, not when the code is "ready".',
        'Small stories + WIP limits prevent the end-of-sprint test cliff.',
        'A story that fails testing is not Done; the PO decides fix, flag or move back.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.1.2 Tester\'s contribution to iteration and release planning; The Kanban Guide — WIP limits',
    },
    {
      heading: 'Defect triage meetings',
      body: `**Defect triage** is a short meeting where the team decides what to do with each new bug. Think of a hospital emergency desk: who needs help now, who can wait, and who needs nothing.

**Who attends:** the Product Owner sets business priority. A developer or tech lead judges effort and risk of the fix. A tester brings evidence, severity and steps. Near a release, support or the release manager may join.

**How often:** many Scrum teams triage new bugs daily, for 10–15 minutes after the Daily Scrum. Near a release, twice a day. Kanban teams triage as bugs arrive.

**For each bug, the meeting decides:**

1. Is it valid? (Not a duplicate, not "works as designed", can be reproduced.)
2. **Severity** (how badly it hurts the app; set mainly by QA) and **priority** (how soon to fix it; set mainly by the PO). See mt-defects for the full model.
3. Action: fix this sprint, put in the backlog, defer to a named release, accept as a known issue (with a release note), or close.
4. Owner and target date.
5. Is it a **release blocker**?

**Example:** look at the triage log below. BUG-311 (coupon applied twice on double-click) loses money, so it is High, P1 and a release blocker. BUG-318 (footer link gives 404) is Low severity, but it is a 5-minute fix, so it is fixed this sprint anyway.

**Good habits:** come prepared (steps, evidence, environment, build). Give each bug about 2 minutes; long talks go offline. Write the decision in the ticket. Review the "deferred" list before each release.

**In an interview, say:** "In triage I show the impact with facts, suggest a severity, and let the Product Owner set the priority. If I disagree, I add data (users affected, workaround, how often), not volume."

**Common mistake:** the tester arguing about priority for 20 minutes. Show the impact with facts instead ("affects all UPI payments, 12% of orders"). The PO makes the business call.`,
      code: [
        {
          language: 'text',
          title: 'Triage log excerpt (release 4.2, Thursday)',
          code: `TRIAGE 2026-10-08  attendees: PO (Asha), Tech lead (Ravi), QA (you)

BUG-311 Coupon accepted twice when double-clicking Apply
  Sev: High   Pri: P1   Decision: FIX THIS SPRINT, owner Ravi
  Release blocker: YES (money loss)

BUG-318 Footer link "Careers" opens 404
  Sev: Low    Pri: P2   Decision: FIX THIS SPRINT (5-min fix)
  Release blocker: NO

BUG-320 Order history slow (>4s) for users with 500+ orders
  Sev: Medium Pri: P3   Decision: DEFER to 4.3, perf story created
  Release blocker: NO  Known issue noted in release notes

BUG-322 "Pay" button misaligned on Safari 15 (iPhone SE)
  Sev: Low    Pri: P3   Decision: BACKLOG; 0.4% of traffic

BUG-325 Can't reproduce: cart empties after login
  Decision: NEEDS INFO - QA to attach HAR + trace, retry on staging-2`,
        },
      ],
      keyPoints: [
        'PO owns priority; QA brings evidence and proposes severity.',
        'Every bug leaves triage with a decision, owner and release impact.',
        'Timebox each item; review the deferred list before every release.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.5 Defect management',
    },
    {
      heading: 'Release validation and the go/no-go decision',
      body: `**Release validation** is the testing done on the **release candidate (RC)**, the build you plan to ship. Run it on an environment as close to production as possible:

1. **Smoke check:** the build deploys and the main pages open.
2. **Regression:** the automated suite plus manual checks on changed and risky areas.
3. **Release-specific checks:** data migrations, config and feature-flag settings, integrations (payment sandbox, email), the mobile app upgrade path.
4. **Non-functional checks** the release touches: a quick performance baseline, security scan results.
5. **Fix checks:** retest every bug marked "fixed in this release".

**Go/no-go** is the meeting where the team decides to ship or not. It is like a pilot's pre-flight checklist. No flight is perfect, but nobody takes off with a known engine fault.

| Input | Question it answers |
|---|---|
| Exit criteria from the test plan | Did we do what we planned (coverage, pass rate)? |
| Open bugs by severity | Any blockers or Criticals? Are open Highs accepted with workarounds? |
| Risk left over | What did we NOT test, and why? |
| Rollback plan | If it goes wrong, how fast can we undo it? Is the feature behind a flag? |
| Ready to operate | Monitoring, alerts, on-call, support briefed, release notes |

**Who decides?** The release owner (often the PO or a release manager). QA gives a **recommendation backed by evidence**. QA never gives a silent "pass" and never blocks alone.

**Three possible outcomes:**

- **Go.**
- **Go with conditions.** For example: feature X stays flag-OFF, the known issue is in the release notes, a hotfix comes in 48h.
- **No-go.** Say what must change to become Go.

**Example:** release 4.2 has a 97% pass rate, but one High bug is open in the new refunds feature. Refunds are behind a feature flag. QA recommends: "Go with conditions: the refunds flag stays OFF, the bug goes in the release notes, and we canary at 5% with rollback if errors rise." The PO agrees and ships.

**In an interview, say:** "I don't sign off 'bug-free'. I sign off: here is what we tested, what we found, what risk remains, and my recommendation. The business decides."`,
      keyPoints: [
        'Release validation = smoke + regression + release-specific + fix verification on the RC.',
        'Go/no-go inputs: exit criteria, open defects, residual risk, rollback plan, operational readiness.',
        'QA recommends with evidence; the release owner decides; "Go with conditions" is common.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.1.3 Entry and exit criteria, 5.3 Test monitoring, control and completion',
    },
    {
      heading: 'Testing in production: smoke, canary, feature flags and monitoring',
      body: `**Testing in production** means careful checks on the live system after a release. Some problems only appear with real data, real traffic and real third-party services. It is an *extra* safety net, never a replacement for testing before release.

**Production smoke test:** a few minutes of checks right after deploy, using safe test accounts.

*Example:* on a shop, the home page loads → log in as a test user → search "backpack" shows results → add to cart → the payment page opens. Stop before a real payment, or buy a 1-rupee internal product. Teams often tag these Playwright tests @prod-smoke.

**Canary release** (Danilo Sato, martinfowler.com): give the new version to a small group first, say 5% of users. Compare its error rate, speed and business numbers with the old version. Then widen it (5% → 25% → 100%) or roll back fast. The name comes from the canary in a coal mine.

*Example:* at 5%, orders per minute drop by 14% on the new version. The rollback rule says "more than 10%", so you roll back before 95% of users ever see the problem.

**Blue-green deployment:** keep two identical environments. Switch traffic from blue (old) to green (new). Switching back is the rollback.

**Feature flags** (also called toggles; Pete Hodgson, martinfowler.com) separate *deploy* from *release*. The code is in production, but the feature stays OFF until someone switches it on. There are four types:

| Toggle type | Purpose | How long it lives |
|---|---|---|
| Release toggle | Hide unfinished or risky features | Short (days–weeks) |
| Experiment toggle | A/B tests | Hours–weeks |
| Ops toggle | Kill switch for a costly or risky feature | Short; some long-lived |
| Permissioning toggle | Feature only for premium, beta or internal users | Long |

**What flags mean for testers:**

- Test both states, ON and OFF, of every flag that ships.
- Test the switch itself. Does it work without a restart? What about cached pages?
- Don't test every combination. Hodgson suggests: the production setup with the new release toggles ON, the fallback with them OFF, and optionally all toggles ON.
- Remove old flags, or they become "flag debt".
- In Playwright, set the flag through an API call or cookie before the test.

**Monitoring as testing:** dashboards (errors, speed, orders), alerts, **synthetic monitors** (scripted user journeys that run every few minutes) and log searches. A tester who watches them after a release finds problems before customers do.

**Common mistake:** using "we test in prod" as an excuse to skip testing before prod.`,
      code: [
        {
          language: 'text',
          title: 'Canary rollout plan with go/rollback rules',
          code: `RELEASE 4.2 CANARY PLAN (checkout service)
Flag: new_coupon_engine  default OFF in prod

Step 1  Deploy 4.2 to 5% of pods        watch 30 min
Step 2  Run @prod-smoke (Playwright, test account qa_prod_01)
Step 3  Compare canary vs baseline:
        - HTTP 5xx rate        rollback if > 0.5% or 2x baseline
        - p95 checkout latency rollback if > 1.2 s
        - orders/min           rollback if drops > 10%
Step 4  25% -> watch 1 h -> 100%
Step 5  Flip new_coupon_engine ON for internal users only
Step 6  Exploratory session in prod with internal account (30 min)
Step 7  Flag ON for 10% customers -> 50% -> 100% over 2 days

Rollback: route 100% to 4.1 pods (< 5 min) / flag OFF (< 1 min)
Owner on call: Ravi (dev), you (QA) watching dashboard + support queue`,
        },
      ],
      keyPoints: [
        'Prod smoke uses safe test accounts and avoids real money and real customer data.',
        'Canary = small % first, compare metrics, widen or roll back.',
        'Feature flags decouple deploy from release; test both states and remove stale flags.',
      ],
      source: 'Pete Hodgson — Feature Toggles (martinfowler.com); Danilo Sato — CanaryRelease and BlueGreenDeployment (martinfowler.com)',
    },
    {
      heading: 'Test execution reports vs test summary (completion) reports',
      body: `ISTQB CTFL v4.0 (5.3.2) names two kinds of test report:

- **Test progress report** (also called execution or status report): sent during testing, to steer the work. Like the live score during a cricket match.
- **Test completion report** (also called summary or closure report): written at the end, to help people decide and learn. Like the match report after the last ball.

| | Test progress report | Test completion report |
|---|---|---|
| When | Regularly during testing (daily, per build) | When a test level, sprint or release finishes |
| Who reads it | Team, PO, Scrum Master | PO, release owner, stakeholders, auditors |
| What is in it | Period covered; progress vs plan (planned / executed / passed / failed / blocked); open bugs by severity; blockers and workarounds; new risks; plan for the next period | What was tested (scope, builds, environments); results vs exit criteria; changes from the plan; bugs found and still open; risks left; quality evaluation; recommendation; lessons learned |
| Purpose | Control: steer the testing now | Decide and learn: ship or not, improve next time |

In Agile teams the progress report is often just the board, the burn-down chart and the pipeline dashboard. The completion report may be a short Confluence page for the release.

**A good report** gives numbers *with meaning*, says what was **not** tested, explains the risk in business words, and ends with a clear recommendation.

**Example:**

- Weak: "Executed 412, passed 389."
- Strong: "Pass rate 94%. All failures are in the new refunds flow. Refunds to UPI were not tested because the sandbox was down. Recommend: ship with refunds behind a flag set to OFF."

**In an interview, say:** "The progress report helps us steer testing now. The completion report helps someone decide to ship, and helps the team improve."

**Common mistake:** a table of numbers with no conclusion. Stakeholders cannot decide from raw counts.`,
      code: [
        {
          language: 'text',
          title: 'Daily test execution report (sprint 18, day 8)',
          code: `TEST EXECUTION REPORT  Sprint 18  Day 8   Build 4.2.0-rc2  (staging)

Progress        Planned  Executed  Passed  Failed  Blocked
Stories (6)        86       74       66      5       3
Regression        240      240      236      4       0
TOTAL             326      314      302      9       3
Execution 96%  |  Pass rate of executed 96%

Open defects:  Critical 0 | High 1 (BUG-311) | Medium 3 | Low 4
Blockers:      3 refund tests blocked: payment sandbox down since
               10:00 (vendor ticket #8812), ETA tomorrow 09:00
Risks:         Refund flow (story CHK-77) only 40% tested; if sandbox
               is not back by noon tomorrow it will miss the sprint
Next 24h:      Retest BUG-311 fix; finish refunds; exploratory on
               coupon + currency switch; regression rerun on rc3
Need from PO:  Decision: ship CHK-77 behind flag OFF if not finished?`,
        },
      ],
      keyPoints: [
        'Progress report = during testing, for steering; completion report = at the end, for decisions and lessons.',
        'Always include blockers, risks and what was not tested.',
        'Numbers need an interpretation and a recommendation.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.3.1 Metrics used in testing, 5.3.2 Purpose, content and audience for test reports; ISO/IEC/IEEE 29119-3 (test status and completion reports)',
    },
    {
      heading: 'QA metrics that help (and those that hurt)',
      body: `A **QA metric** is a number that helps the team make a decision. If no decision changes because of the number, it is decoration, and people will game it.

ISTQB v4.0 groups test metrics into: project progress, test progress, product quality, defect, risk, coverage and cost metrics. The most useful in Agile teams:

| Metric | Why it helps | Watch out |
|---|---|---|
| Test execution progress (executed / planned; pass / fail / blocked) | Shows if testing will finish in time | 100% executed ≠ well tested |
| Requirements / AC coverage | Shows which stories have checked AC | Covers what was written, not what was missed |
| Open bugs by severity, trend over builds | Readiness for release | A falling count can mean less testing |
| Escaped defects (found in production) per release | The real result of testing | Needs honest tagging of production bugs |
| Automated suite pass rate + flaky rate | Can we trust the pipeline? | 99% pass with 5% flaky retries hides problems |
| Cycle time; time in the "Testing" column | Shows flow problems and test bottlenecks | Not a score for the tester |
| Mean time to detect / restore (with ops) | How fast we catch and fix production issues | Needs monitoring in place |

Detailed formulas (defect density, DRE, leakage, reopen rate) are in the Defects topic. Here the point is choosing metrics for a sprint or release decision.

**Example:** "5 escaped defects this release, 4 of them in payments" leads to a decision: add an exploratory session on payments next sprint. "We wrote 1,200 test cases" leads to no decision at all.

**Vanity (harmful) metrics:**

- Number of test cases written.
- Bugs logged per tester (people split one bug into five).
- "100% automation" (some things need human exploration).
- Velocity used to compare teams.

**In an interview, say:** "I pick a few metrics tied to decisions. Execution progress and blocked tests steer the sprint. Open Criticals and escaped defects judge release quality. Flaky rate tells us if we can trust the pipeline. I always show trends, not single numbers."`,
      keyPoints: [
        'Tie every metric to a decision; show trends, not snapshots.',
        'Escaped defects measure outcome; test-case counts measure activity.',
        'Never use QA metrics to rank individual testers.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.3.1 Metrics used in testing',
    },
    {
      heading: 'Kanban for testers',
      body: `**Kanban** is a way of working without fixed sprints. Work items (cards) move across a board, and each column has a limit.

**Kanban practices** (the Kanban Guide lists six general practices):

1. Visualise the work on a board.
2. **Limit work in progress (WIP):** set a maximum number of cards per column.
3. Manage the flow.
4. Make rules explicit, e.g. "Ready for test" means "deployed to the QA server, with notes".
5. Use feedback loops.
6. Improve together through small experiments.

There are no sprints. Work is pulled when someone has free capacity. Releases can be continuous or on a schedule.

**Flow metrics**

- **Lead time:** from the commitment point (the team agrees to do the item) until it is done. This is the Kanban Guide's main flow metric.
- **Delivery rate (throughput):** items finished per unit of time, e.g. per week.
- **Cycle time:** from the moment work starts until it is done.
- **Cumulative flow diagram:** a chart of cards per column over time. A band that keeps getting wider shows a bottleneck.

*Example:* the team commits to a card on Monday. Work starts on Wednesday. It is done on Friday. Lead time = 4 days (Monday → Friday). Cycle time = 2 days (Wednesday → Friday).

| | Scrum | Kanban |
|---|---|---|
| Rhythm | Fixed sprints (≤ 1 month) | Continuous flow |
| Commitment | Sprint Goal and forecast | WIP limits and service levels |
| Roles | PO, SM, Developers | None required |
| Change mid-cycle | Avoid changing the Sprint Goal | New items can be pulled any time |
| Warning sign for QA | Carry-over and burn-down | Cards piling in "Testing"; rising cycle time |

**Example:** WIP limits are Dev 4, Ready for test 2, Testing 3. Testing holds 3 cards and Ready for test holds 2. Both are full, so a developer cannot move a finished card forward. Instead, the developer pairs with QA to test a card, or fixes a bug. The WIP limit exposed the bottleneck and made the team **swarm** (work together on it).

**In an interview, say:** "In Kanban I watch the Testing column and the cycle time. If work queues in Testing, the fix is team-wide: smaller cards, developers testing, more automation. Not me working weekends."`,
      diagram: `  Backlog | Ready(5) | Dev(4) | Ready for test(2) | Testing(3) | Done
  --------+----------+--------+-------------------+------------+-----
  [ ][ ]  | [ ][ ]   | [ ][ ] | [X][X]  FULL      | [X][X][X]  | [ ]
  [ ][ ]  |          | [ ]    |                   |   FULL     | [ ]
                          |
               dev cannot push -> pairs with QA (swarm)`,
      keyPoints: [
        'Kanban: visualise, limit WIP, manage flow, explicit policies, improve.',
        'Lead time = commitment point to done (Kanban Guide); cycle time is commonly used for start to done.',
        'A full Testing column is a team problem; swarm instead of pulling new work.',
      ],
      source: 'The Kanban Guide (Kanban University), based on David J. Anderson — Kanban (2010)',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-agile-release-cc-1',
      title: 'From "looks good to me" sign-off to a real test summary report',
      context:
        'Release 4.2 of an e-commerce web app (coupon engine, refunds, Safari fixes) is going to the go/no-go meeting tomorrow. Your lead asked you to send the QA sign-off. This is the draft you wrote at 11 pm.',
      task:
        'Rewrite the email into a test summary (completion) report that a Product Owner could use to make a go/no-go decision. Keep it to one screen. Invent plausible numbers consistent with the draft.',
      starter: {
        language: 'text',
        title: 'Weak sign-off email',
        code: `Subject: QA signoff

Hi all,

Testing for the release is done. We executed most of the test
cases and almost everything passed. There are a few bugs still
open but nothing major I think. Refunds were not fully tested
because the sandbox was down but it should be fine since the
devs tested it.

QA gives the go ahead.

Thanks,
QA`,
      },
      hints: [
        'Which release, build and environments? What exactly was in scope and out of scope?',
        'Replace "most" and "almost everything" with numbers compared to the exit criteria from the test plan.',
        'Name open defects and the untested refund area as residual risks, and make the recommendation conditional on mitigations (flag, rollback, monitoring).',
      ],
      solution: {
        language: 'text',
        title: 'Test summary report (one screen)',
        code: `TEST SUMMARY REPORT  Release 4.2  (build 4.2.0-rc3)   2026-10-09
Prepared by: QA (you)   For: go/no-go 2026-10-10

1. SCOPE
In: coupon engine (CHK-71..75), refunds (CHK-77), Safari fixes,
    full regression. Env: staging-1 (prod-like data), Chrome 129,
    Safari 17/iOS 17, Android Chrome.
Out: load testing (not changed), Firefox (0.6% traffic).

2. RESULTS vs EXIT CRITERIA
Executed 318/326 (97.5%)  target >= 95%            MET
Passed 309/318 (97.2%)    target >= 95%            MET
Critical/High open: 0/1   target 0 Critical/0 High NOT MET (1 High)
All story AC verified: 5 of 6 stories (CHK-77 refunds partial)

3. OPEN DEFECTS
BUG-311 High  Double-click on Apply can apply coupon twice.
        Fix merged in rc3, retest done on Chrome, Safari pending.
3 Medium / 4 Low: triaged, accepted by PO, listed in release notes.

4. NOT TESTED / RESIDUAL RISK
Refunds: 8 of 20 cases blocked (payment sandbox outage). Partial
refunds and refunds to UPI untested. Risk: wrong refund amounts.

5. RECOMMENDATION:  GO WITH CONDITIONS
a) Ship refunds (CHK-77) behind flag refunds_v2 = OFF
b) Close BUG-311 Safari retest before deploy (ETA 10:00)
c) Canary 5% with rollback if 5xx > 0.5%; prod smoke after deploy
d) Finish refund tests when sandbox returns; flag ON in 4.2.1

6. LESSONS: book payment sandbox backup env for future releases.`,
      },
      explanation: `**What changed and why**

- **Identifies the release, build, date and audience**: "the release" could be any build; the decision needs the exact RC.
- **Scope in and out**: "testing is done" hides what was never in scope (load, Firefox). Stakeholders need to know.
- **Numbers against exit criteria**: "most" and "almost everything" become 97.5% and 97.2%, each compared to the agreed target, and the one unmet criterion is called out honestly.
- **Open defects named with status**, not "nothing major I think". The High bug has a fix and a pending retest.
- **Residual risk in business terms**: "devs tested it" is not evidence; the report says what was not tested and what could go wrong (wrong refund amounts).
- **Recommendation with conditions**: QA advises "Go with conditions" (feature flag, canary, rollback trigger) instead of an unconditional go. The PO/release owner still decides.
- **Lessons learned**: the completion report feeds the next retrospective.`,
      followUps: [
        {
          q: 'The PO says "just put PASS, the management only reads the first line". What do you do?',
          a: 'Keep the first line short but honest: "Go with conditions: refunds behind a flag set to OFF; one High bug retest pending." A one-line summary is fine; a misleading one is not. If refunds fail in production, the report is the record of what QA knew. I would offer to explain the conditions in 60 seconds at the go/no-go meeting.',
        },
        {
          q: 'Who should sign the release if QA recommends "No-go" but the business wants to ship?',
          a: 'The release owner (PO or release manager) owns the decision and its risk. QA makes sure the risk is written down clearly, suggests ways to reduce it (feature flag, canary, extra monitoring, hotfix plan) and records that the business accepted the remaining risk. That is not a QA failure; it is an informed business trade-off.',
        },
      ],
    },
    {
      id: 'mt-agile-release-cc-2',
      title: 'Turn a vague user story into testable acceptance criteria',
      context:
        'This story arrived in refinement for a food-delivery app. The developer wants to start tomorrow. You are in the three-amigos session with the PO and the developer.',
      task:
        'Rewrite the story so it is ready for the sprint: a clear user story, explicit business rules, Gherkin acceptance criteria covering happy, negative and boundary cases, and the questions you asked the PO. Keep scenarios declarative.',
      starter: {
        language: 'text',
        title: 'Weak story',
        code: `STORY FD-210: Delivery fee

The delivery fee should be calculated properly. Orders above a
certain amount get free delivery. Show the fee on the checkout
page. It should work fast and be user friendly.

AC:
- fee is correct
- free delivery works
- UI looks good`,
      },
      hints: [
        'What are the actual numbers? Ask the PO for the threshold, the fee and whether the boundary amount itself qualifies.',
        'What is the amount compared against: subtotal before or after discounts? With or without taxes?',
        'Use a Scenario Outline with Examples around the boundary, and add a rule for what the user sees when the fee changes.',
      ],
      solution: {
        language: 'gherkin',
        title: 'Story FD-210 after three amigos',
        code: `# Questions asked in three amigos (answers from PO, Asha):
# Q1 Threshold? 499.00 INR. Is 499.00 free? YES (>= 499.00)
# Q2 Compared against? Item subtotal AFTER coupon, BEFORE taxes
# Q3 Fee below threshold? Flat 40.00 INR
# Q4 Fee change when cart edited on checkout? Recalculated live
# "Fast" moved to NFR: fee shown < 1 s after cart change (p95)

Feature: Delivery fee at checkout
  As a customer I want to see the delivery fee before I pay
  so that I know the final amount and can reach free delivery

  Rule: Subtotal after discount of 499.00 or more is free

    Scenario Outline: Fee depends on the subtotal after discount
      Given my item subtotal after discount is <subtotal>
      When I open the checkout page
      Then the delivery fee shows "<fee>"

      Examples:
        | subtotal | fee   |
        | 498.99   | 40.00 |
        | 499.00   | FREE  |
        | 499.01   | FREE  |

  Rule: A coupon can take the order below the threshold

    Scenario: Coupon reduces subtotal below 499.00
      Given my item subtotal is 520.00
      When I apply a coupon worth 50.00
      Then the delivery fee shows "40.00"
      And I see "Add 29.00 more for free delivery"`,
      },
      explanation: `**What changed and why**

- **Vague words replaced by numbers**: "certain amount", "properly", "fast" and "user friendly" cannot be tested. The three-amigos questions turned them into 499.00, 40.00, "after coupon, before taxes" and a measurable performance NFR.
- **Boundary decided explicitly**: whether 499.00 itself is free is the classic off-by-one bug; the PO answered it and the Examples table tests 498.99 / 499.00 / 499.01.
- **Business rules as Gherkin Rule blocks**, each with scenarios, so the PO can read and confirm them.
- **Negative/interaction case**: the coupon pushing the subtotal below the threshold is where real bugs hide (calculation order).
- **Declarative steps**: no selectors or clicks, so the scenarios survive UI redesigns and can be automated later with Playwright.
- **"UI looks good" removed** from AC: visual expectations belong to designs linked from the story and to the DoD (accessibility check), not to an untestable AC line.`,
      followUps: [
        {
          q: 'The PO does not know the answer to Q2 (before or after coupon). Should the story still enter the sprint?',
          a: 'Usually not as it is. If the rule is unknown, the developer will guess and QA will test a different guess. Options: the PO gets the answer from finance before planning; the team splits the story (fee without coupons now, coupons next); or the story enters with an explicit spike. Either way, the open question must be visible.',
        },
        {
          q: 'How would you automate the Scenario Outline?',
          a: 'Best at the API or unit level: call the fee endpoint with the three subtotals and check the fee. That is fast and stable. Then one Playwright UI test checks that checkout shows whatever fee the API returns, plus the "Add X more" message. Running every boundary row through the UI would be slow and add little.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-agile-release-iq-1',
      difficulty: 'easy',
      question: 'What does a QA engineer do in a Scrum team? Walk me through what you do in each Scrum event.',
      whatInterviewerLooksFor: [
        'Knows testers are Developers in Scrum, not a separate phase',
        'Says what they actually do in each event, not just the names',
        'Mentions refinement / three amigos and testing early',
        'Understands the Definition of Done',
      ],
      modelAnswer: `In Scrum there is no "QA role". I am one of the **Developers** and I share the Sprint Goal. My job is fast, honest feedback about quality, starting before any code is written.

- **Refinement:** in three amigos I ask "what if…" questions. Example: "Is exactly 499.00 free delivery?" I turn the answers into acceptance criteria.
- **Sprint Planning:** I size the testing work and add test tasks (automation, exploratory sessions, test data) to the Sprint Backlog.
- **Daily Scrum (15 min):** "Story 3 is ready for test. Story 4 is blocked: the test server is down."
- **During the sprint:** I test each story as soon as it is deployed, log and retest bugs, and automate stable flows.
- **Sprint Review:** I help demo the working Increment on staging.
- **Retrospective:** I bring data, e.g. "4 bugs escaped, all in payments."

A story with unchecked AC or an open High bug is not Done, even if the code is merged.`,
      followUps: [
        {
          q: 'What if the developers finish coding on the last day and there is no time to test?',
          a: 'Then the story is not Done. It does not count, and the PO decides whether it goes back to the backlog or into the next sprint. In the retro we fix the cause: smaller stories, dev-QA pairing, WIP limits, preview environments. I would not cut testing silently or work late every sprint, because that hides the problem.',
        },
        {
          q: 'Is a tester the "quality owner" in Scrum?',
          a: 'No. The whole team owns quality, and the Definition of Done is a team commitment. The tester brings testing skills, risk thinking and a fresh view, and often coaches others. But developers also write unit tests, review code and fix their bugs. If one person "owns" quality, everyone else stops caring.',
        },
      ],
      pitfalls: [
        'Describing testing as a phase that starts after development is complete',
        'Listing Scrum events without saying what the tester actually does in each',
        'Calling QA the gatekeeper who alone approves releases',
      ],
    },
    {
      id: 'mt-agile-release-iq-2',
      difficulty: 'medium',
      question: 'Explain the Agile Testing Quadrants. How would you use them for a new "refund to wallet" feature?',
      whatInterviewerLooksFor: [
        'Correct axes (business vs technology facing; supports the team vs critiques the product)',
        'Correct examples in each quadrant',
        'Knows the quadrants are not an order',
        'Applies them to the feature',
      ],
      modelAnswer: `The quadrants (Brian Marick's idea, made popular by Lisa Crispin and Janet Gregory) sort tests on two axes: **business-facing vs technology-facing**, and **supports the team** (guides coding) vs **critiques the product** (judges what was built).

- **Q1** (tech, supports): unit and component tests.
- **Q2** (business, supports): story tests, examples, BDD, API tests.
- **Q3** (business, critiques): exploratory, usability, UAT.
- **Q4** (tech, critiques): performance, load, security.

They are a **checklist, not an order**. For "refund to wallet":

- **Q1:** unit tests for the amount: full, partial, with a coupon.
- **Q2:** Gherkin examples: refund reaches the wallet within 5 minutes; refund rejected after 30 days. API test for POST /refunds.
- **Q3:** explore: refund then cancel, two refunds from two tabs.
- **Q4:** security: can I refund someone else's order by changing the order id? Reliability: a payment timeout plus retry must not credit twice.

That double-credit risk is why we planned Q4 tests in sprint 1.`,
      followUps: [
        {
          q: 'Which quadrants should be automated?',
          a: 'Q1 almost fully, and most of Q2 for regression (API and key UI flows). Q3 is human work: exploring, judging usability, UAT. Q4 uses tools (k6, JMeter, ZAP) but a human must read the results. Crispin and Gregory label Q1 "automated", Q2 "automated and manual", Q3 "manual" and Q4 "tools". Each test is still decided on its own value.',
        },
        {
          q: 'Where does ISTQB put the quadrants?',
          a: 'ISTQB CTFL v4.0 covers them in chapter 5 (test management), section 5.1.7. They group test levels and types so that Agile planning considers every needed kind of test. The axes are the same: business vs technology facing, and supports the team vs critiques the product.',
        },
      ],
      pitfalls: [
        'Saying Q1 must be done first and Q4 last',
        'Swapping the axes or putting exploratory testing in Q1',
        'Giving only definitions without applying them to the feature',
      ],
    },
    {
      id: 'mt-agile-release-iq-3',
      difficulty: 'medium',
      question: 'What is the difference between Definition of Ready, Definition of Done and acceptance criteria? Give an example of each.',
      whatInterviewerLooksFor: [
        'Clear scope: one story vs every story',
        'Knows DoD is in the Scrum Guide and DoR is not',
        'Concrete examples a tester would use',
        'Knows what happens when the DoD is not met',
      ],
      modelAnswer: `They answer three different questions.

| | Question | Example |
|---|---|---|
| **Definition of Ready** | Can we start this story? | "AC written with a negative example; test data known; designs attached" |
| **Acceptance criteria** | What must this one story do? | "Subtotal 498.99 → fee 40.00; 499.00 → free delivery" |
| **Definition of Done** | Is this work really finished? (every story) | "Code reviewed; AC checked on staging; regression green; no open Critical/High bugs" |

Two key facts:

1. **The DoD is in the Scrum Guide 2020.** It is the Increment's commitment. An item that fails it cannot be released or shown as Done; it goes back to the Product Backlog.
2. **The DoR is not in the Scrum Guide.** It is a team practice. If it becomes a rigid gate, it is waterfall in disguise.

AC can pass while the DoD fails. Example: the coupon story meets all its AC, but regression was never run, so it is not Done.`,
      followUps: [
        {
          q: 'Who creates the Definition of Done?',
          a: 'The Scrum Guide says: if the organisation has a DoD standard, every team follows it as a minimum. If not, the Scrum Team creates one that fits the product. In practice the Developers, PO and Scrum Master agree it and review it in retros. QA should push for concrete, checkable testing items in it.',
        },
        {
          q: 'A story meets its AC but you found an unrelated Medium bug elsewhere. Is the story Done?',
          a: 'Usually yes, if the DoD says "no open Critical/High bugs linked to the story" and the Medium bug is in another area. I log the bug and take it to triage. But if this story caused the bug (a regression), it is linked, and the story is not Done until the bug is fixed or accepted.',
        },
      ],
      pitfalls: [
        'Saying DoR and DoD are both mandatory Scrum Guide artifacts',
        'Treating AC and DoD as the same thing',
        'Not knowing what happens to an item that fails the DoD',
      ],
    },
    {
      id: 'mt-agile-release-iq-4',
      difficulty: 'hard',
      question: 'It is release day. One High-severity bug is still open and 15% of regression has not run. Do you give the go-ahead?',
      whatInterviewerLooksFor: [
        'Does not answer with a blind yes or no',
        'Gathers facts: what the bug affects, which tests are pending',
        'Offers ways to reduce risk (flags, canary, rollback, workaround)',
        'Knows QA recommends and the business decides',
        'Communicates clearly and writes the decision down',
      ],
      modelAnswer: `I don't answer "yes" or "no" by reflex. Within the hour I give the release owner a **recommendation backed by facts**.

**1. The High bug:** who does it hit, how often, is there a workaround? A High bug in a rarely used admin export is very different from one in checkout. Can a feature flag turn it off?

**2. The missing 15%:** which areas? Unchanged modules that passed on the last build = small risk. Payments or the changed module = big risk. I run the riskiest pending tests first, in the next 2–3 hours.

**3. Ways to reduce risk:** feature flag OFF; canary at 5% with rollback rules; prod smoke test; known issue in release notes; a hotfix date.

**Example:** "Go with conditions: coupon v2 stays flag-OFF because of BUG-311; the untested 15% is the unchanged reports module; canary with rollback if errors pass 0.5%." Or: "No-go: the bug double-charges cards and has no workaround."

The **PO or release manager decides**. I write the remaining risk in the test summary report.`,
      followUps: [
        {
          q: 'The manager says "we release anyway" and the bug causes an incident. Whose fault is it?',
          a: 'Blame helps less than learning. If the risk was written down clearly and the business accepted it, QA did its job. In the incident review I would ask why we reached release day with a High bug open: late handover, missing automation, stories too big. I would also check whether my risk statement was clear enough, because a vague warning is easy to ignore.',
        },
        {
          q: 'What if there were no feature flag and no rollback plan?',
          a: 'Then going ahead is much riskier, because any problem must be fixed forward under pressure. I would say so clearly and lean towards No-go for anything touching money or data. In the retro I would propose "every risky change needs a rollback path or a flag" as a DoD or release-checklist item.',
        },
      ],
      pitfalls: [
        'Saying "QA never releases with open bugs" (zero bugs is not a realistic exit criterion)',
        'Saying "yes, the manager decides anyway" without giving information',
        'Not asking which tests were skipped or what the bug actually affects',
      ],
    },
    {
      id: 'mt-agile-release-iq-5',
      difficulty: 'medium',
      question: 'What goes into a test summary report, and how is it different from a daily test execution report?',
      whatInterviewerLooksFor: [
        'Separates the progress report (during) from the completion report (end)',
        'Lists contents: scope, results vs exit criteria, bugs, deviations, remaining risk, recommendation, lessons',
        'Knows the readers are different',
        'Explains the numbers instead of only listing them',
      ],
      modelAnswer: `ISTQB CTFL v4.0 calls them the **test progress report** and the **test completion report**.

**Daily progress (execution) report:** sent during testing, to the team and PO, to steer the work. It has: build tested; planned / executed / passed / failed / blocked; open bugs by severity; blockers with owners; new risks; tomorrow's plan.

**Summary (completion) report:** written at the end of a sprint, test level or release, for the people who decide. It has:

- **Scope:** what was and was not tested.
- **Results vs exit criteria:** e.g. 97% executed vs a 95% target (met); 1 open High vs a target of 0 (not met).
- **Bugs** still open, and changes from the plan.
- **Remaining risk:** "partial refunds untested; refund amounts could be wrong."
- **Recommendation:** Go / Go with conditions / No-go.
- **Lessons learned.**

Both must explain the numbers. "302 passed" is data. "96% pass rate; every failure is in the new refunds flow, which is behind a flag" is something a PO can act on.`,
      followUps: [
        {
          q: 'Which tool would you use to produce these reports?',
          a: 'Whatever the team already uses: Jira dashboards with Xray or Zephyr for counts, TestRail run reports, the Playwright HTML report or Allure for automation, and a short Confluence page for the summary. The tool matters less than the content. I always add a few written sentences, because charts never say what the risk is.',
        },
        {
          q: 'How often do you send a progress report?',
          a: 'It depends on the phase. In a normal sprint the board and the Daily Scrum are usually enough, plus a short written update if people outside the team need it. During release testing I send a daily (sometimes twice-daily) status with blockers and risks, so nobody is surprised at go/no-go.',
        },
      ],
      pitfalls: [
        'Listing only numbers (executed, passed, failed) with no conclusion',
        'Leaving out what was not tested',
        'Treating the two reports as the same document',
      ],
    },
    {
      id: 'mt-agile-release-iq-6',
      difficulty: 'hard',
      question: 'How do feature flags and canary releases change the way you test? What would you test differently?',
      whatInterviewerLooksFor: [
        'Knows that deploy and release become separate',
        'Tests both flag states and the switch itself',
        'Knows how a canary works and rolls back on metrics',
        'Mentions flag debt and combinations',
        'Sees production monitoring as part of testing',
      ],
      modelAnswer: `**Feature flags** separate *deploying* code from *releasing* a feature (Pete Hodgson, martinfowler.com: release, experiment, ops and permissioning toggles). So I test differently:

- **Both states.** OFF: the old behaviour must not change (regression). ON: the new feature works.
- **The switch.** Flip it while the app runs. Example: a user is mid-checkout when "new_coupon_engine" turns ON. Does the cart break? Do cached pages update?
- **Targeting.** "Beta users only": test a beta user and a normal user.
- **Combinations.** Test the likely ones, not all 2^n.
- **Flag debt.** Removing an old flag is a change too, so regression-test it.

**Canary releases** (Danilo Sato, martinfowler.com) send a small slice of traffic to the new version first. Test normally before it; the canary is an extra net. During it, run a safe prod smoke test and compare canary vs old version with **rollback rules fixed in advance**. Example: "roll back if 5xx errors pass 0.5% or orders drop more than 10%." Then widen 5% → 25% → 100%.

Dashboards become part of my test oracle.`,
      followUps: [
        {
          q: 'What is the difference between a canary release and an A/B test?',
          a: 'A canary reduces risk: a small share of traffic gets the new version so problems show up before everyone sees them. The goal is to roll out to 100% or roll back. An A/B test (experiment toggle) splits users on purpose to compare two versions and pick the better one. Both send a fraction of users somewhere, but they answer different questions.',
        },
        {
          q: 'How do you write a production smoke test safely?',
          a: 'Use dedicated test accounts marked as internal. Avoid actions you cannot undo: no real payments, use a zero-value internal product or stop at the payment page. Never touch real customer data. Keep it short (a few key journeys), clean up after itself, and tag it (e.g. @prod-smoke) so it runs after each deploy and from synthetic monitoring.',
        },
      ],
      pitfalls: [
        'Testing only the flag ON state',
        'Treating canary as a substitute for testing before production',
        'No defined metrics or thresholds for rollback',
      ],
    },
    {
      id: 'mt-agile-release-iq-7',
      difficulty: 'medium',
      question: 'Your team works in Kanban, and cards keep piling up in the "Testing" column. What do you do?',
      whatInterviewerLooksFor: [
        'Knows WIP limits and pull-based flow',
        'Treats it as a team bottleneck, not a personal workload issue',
        'Uses data (cycle time, cumulative flow)',
        'Suggests concrete fixes: smaller cards, swarming, automation, testing earlier',
      ],
      modelAnswer: `A queue in Testing is a **flow problem for the whole team**. Kanban is built to make it visible.

**1. Look at the data.** Cycle time per column, and the cumulative flow diagram (is the Testing band getting wider?). Then ask why cards wait: no test environment, unclear AC, bugs bouncing back, huge cards.

**2. Respect the WIP limits.** If Testing has a limit of 3 and it is full, developers stop pushing cards. They **swarm**: pair-test, fix bugs on cards in Testing, write automation. Example: a developer finishes card C8 but Ready for test is full, so she helps test C5 instead of starting C11.

**3. Fix the causes.**
- Smaller cards: 30 minutes of testing moves; 3 days blocks.
- Three amigos before coding, so fewer cards bounce back.
- Developers run the happy path before moving a card.
- Automate regression.
- Clear rule: "Ready for test" = deployed, with notes and test data.

**4. Check the result** at the next improvement meeting, using cycle time before and after.

I would not quietly work overtime. That hides the bottleneck, and it returns next week.`,
      followUps: [
        {
          q: 'What is the difference between lead time and cycle time?',
          a: 'The Kanban Guide defines lead time from the commitment point (the team agrees to do the item) until it is done; it is close to what the customer feels. Some teams measure from when the request is first made. Cycle time runs from when work actually starts until done. Example: committed Monday, started Wednesday, done Friday = lead time 4 days, cycle time 2 days. Long lead time with short cycle time means items wait before anyone starts.',
        },
        {
          q: 'Would you rather work in Scrum or Kanban as a tester?',
          a: 'Both work if the team collaborates. Scrum gives a rhythm (planning, reviews, a Sprint Goal), which suits product development with stakeholders. Kanban suits continuous work like support, maintenance or teams releasing many times a day. As a tester I care more about early involvement, small work items and a real DoD than the framework name.',
        },
      ],
      pitfalls: [
        'Saying "I would work longer hours to clear the backlog"',
        'Asking for more testers as the only solution',
        'Not mentioning WIP limits in a Kanban answer',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-agile-release-drill-1',
      question:
        'Go/no-go from a report. Release 5.0 of a banking web app. Exit criteria: ≥ 95% of planned tests executed, ≥ 95% pass rate of executed, 0 open Critical, 0 open High without an approved workaround, AC checked for all P1 stories. Using the numbers below, decide: Go, Go with conditions, or No-go. Explain why.',
      assumptions: [
        'Planned 480 tests; executed 462; passed 441; failed 13; blocked 8 (the remaining 10 not run)',
        'Open: 0 Critical; 2 High: H1 = statement PDF has wrong date format for one locale (workaround: CSV export); H2 = fund transfer to new payee fails when OTP is re-sent twice',
        'All 6 P1 stories AC verified except "Add payee" (fund transfer)',
        'The "Add payee" feature is behind flag new_payee_flow; the old flow still works',
        'Canary deployment and 10-minute rollback are available',
      ],
      steps: [
        { label: 'Execution rate', calc: '462 / 480 = 96.25% ≥ 95% → MET' },
        { label: 'Pass rate of executed', calc: '441 / 462 = 95.45% ≥ 95% → MET (blocked are executed-but-not-completed: 13 failed + 8 blocked = 21; 441 + 21 = 462)' },
        { label: 'Critical', calc: '0 open → MET' },
        { label: 'High H1', calc: 'Has an approved workaround (CSV export), low exposure (one locale) → acceptable if PO approves and release notes mention it' },
        { label: 'High H2', calc: 'No workaround in the NEW payee flow, money-movement feature → NOT acceptable for the new flow' },
        { label: 'P1 AC', calc: '5 of 6 verified; "Add payee" not verified → NOT MET for that story' },
        { label: 'Mitigation', calc: 'Flag new_payee_flow = OFF keeps the old, working payee flow; H2 and the unverified story are then not exposed to customers' },
      ],
      answer: `**Go with conditions.**

1. new_payee_flow stays **OFF** in production (H2 and the unverified P1 story are then not reachable).
2. H1 accepted by the PO as a known issue with the CSV workaround in the release notes.
3. Canary 5% with rollback triggers; prod smoke on login, balance, statement, transfer to existing payee.
4. Finish the 10 unexecuted + 8 blocked tests; turn the flag on in 5.0.1 after H2 is fixed and retested.

Without the flag, the answer would be **No-go**: a High bug in money transfer without workaround plus an unverified P1 story fails two exit criteria.`,
      insight:
        'Exit criteria are inputs, not the decision. The same numbers can mean Go or No-go, depending on whether a feature flag or rollback exists. That is why a tester must know how the release works.',
      followUps: [
        {
          q: 'What if the 8 blocked tests were all in the statement module?',
          a: 'Then the statement module (where H1 already lives) has a coverage gap as well as a known bug. I would push to unblock and run them before go/no-go. If not possible, I would list "statement module: 8 tests blocked plus H1 open" as remaining risk, and ask the PO whether statements are critical this release (month-end volume).',
        },
      ],
    },
    {
      id: 'mt-agile-release-drill-2',
      question:
        'Plan QA across a 2-week sprint (10 working days). Team: 4 developers and 1 QA (you). Sprint backlog: S1 login with OTP (5 pts), S2 profile photo upload (3 pts), S3 order history filters (3 pts), S4 refund status page (5 pts), S5 copy changes (1 pt). Say what you do each day, and how you avoid the end-of-sprint testing pile-up.',
      assumptions: [
        'QA capacity ≈ 6 focused hours/day → about 60 hours in the sprint',
        'Automated regression takes 40 minutes in CI; manual regression checklist takes 6 hours',
        'S1 and S4 are the riskiest (security, money); S5 is trivial',
        'Developers can deliver a testable slice of a story within 2–3 days if asked',
      ],
      steps: [
        { label: 'Before/day 1', calc: 'Refinement + planning: three amigos for S1 and S4; ask devs to deliver S1 first slice by day 3 and S4 by day 5; S5 can be tested on day 2' },
        { label: 'Budget hours', calc: 'S1 12h, S4 12h, S2 6h, S3 6h, S5 1h = 37h; regression 6h + automation 10h + triage/meetings 7h = 60h' },
        { label: 'Days 2–3', calc: 'Write Gherkin/test ideas for all; prepare OTP and refund test data; test S5; API tests for S1 OTP endpoint' },
        { label: 'Days 3–6', calc: 'Test S1 (incl. OTP expiry, resend, lockout) then S2 (file types/sizes) as each lands; retest fixes' },
        { label: 'Days 5–8', calc: 'Test S4 and S3; exploratory session on S1+S4 together; automate S1 login + S4 happy path in Playwright' },
        { label: 'Day 9', calc: 'Regression: automated suite (40 min) + targeted manual on login, orders, refunds; final retests' },
        { label: 'Day 10', calc: 'Review demo, retro data (handover dates, bugs per story), short completion report' },
      ],
      answer: `A plan where risky stories (S1, S4) are delivered and tested **early in thin slices**, trivial ones fill gaps, automation is written while stories are fresh, and day 9 is reserved for regression rather than first-time testing. Total ~60 QA hours: ~37h story testing, ~10h automation, ~6h regression, ~7h meetings and triage. If S4 slips past day 7, raise it in the daily and ask the PO whether to ship it behind a flag or move it out.`,
      insight:
        'Order of work is the main tool a single tester has. Ask for the riskiest stories first and in small slices, so bugs come back while there is still sprint time to fix them.',
      followUps: [
        {
          q: 'Developers say they cannot split S4. What then?',
          a: 'Suggest technical slices that are still testable: the refund status API first (test it with Postman or a Playwright request), then the UI. Meanwhile, review unit tests with a developer and prepare test data, so testing is fast when it lands. If S4 still arrives on day 8, raise the risk early instead of absorbing it silently.',
        },
      ],
    },
    {
      id: 'mt-agile-release-drill-3',
      question:
        'Work out the execution report numbers and write a 3-line interpretation. Day 6 of release testing: 250 tests planned; 210 executed (190 passed, 14 failed, 6 blocked); 40 not run. 9 of the 14 failures are in the new "Wishlist" module. Open bugs: 0 Critical, 2 High (both Wishlist), 5 Medium, 6 Low. Yesterday: 170 executed, 160 passed, 3 High open.',
      assumptions: [
        'Blocked tests were started but could not complete (env issue: wishlist service in staging restarts every ~20 min)',
        'Testing window ends on day 8; daily capacity ≈ 40 tests',
        'Wishlist is a new feature behind flag wishlist_v1',
      ],
      steps: [
        { label: 'Execution progress', calc: '210 / 250 = 84% (yesterday 170 / 250 = 68% → +40 today)' },
        { label: 'Pass rate (of executed)', calc: '190 / 210 = 90.5% (yesterday 160 / 170 = 94.1%)' },
        { label: 'Failures by area', calc: '9 / 14 = 64% of failures in Wishlist' },
        { label: 'Remaining work', calc: '40 not run + 6 blocked + retests ≈ 50+ tests; capacity 2 days × 40 = 80 → feasible only if staging is stable' },
        { label: 'Defect trend', calc: 'High: 3 → 2 (one fixed); both remaining Highs in Wishlist' },
      ],
      answer: `**Metrics:** execution 84% (+16 points since yesterday), pass rate 90.5% (down from 94.1%), 64% of failures in Wishlist, 2 High open (both Wishlist), 6 blocked by the staging wishlist service restarts.

**Interpretation (3 lines):**
1. Outside Wishlist the build is healthy: 5 failures in about 180 tests.
2. Wishlist is the risk: 9 failures, 2 High, and an unstable staging service; the pass-rate drop is all there.
3. Remaining tests fit in 2 days only if staging is fixed today; otherwise recommend releasing with wishlist_v1 OFF.`,
      insight:
        'Totals hide where the problem is. Splitting failures by area turns "the pass rate dropped" into a clear decision: the release is fine; one flagged feature is not.',
      followUps: [
        {
          q: 'Should the 6 blocked tests count as executed?',
          a: 'Teams differ, so state your rule in the report. ISTQB-style progress reports show blocked separately from passed and failed. I count them as "attempted but not completed": they prove nothing about quality, so they must not raise the pass rate. List them with the reason and the owner of the blocker.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-agile-release-mcq-01',
      difficulty: 'easy',
      question: 'In the Scrum Guide 2020, which accountability does a tester belong to?',
      options: ['Product Owner', 'Scrum Master', 'Developers', 'A separate QA role defined by the guide'],
      correct: [2],
      explanation:
        'The Scrum Guide 2020 has three accountabilities: Product Owner, Scrum Master and Developers. Everyone who builds the Increment, testers included, is a Developer. There is no separate QA role. The Product Owner owns the backlog and its value; the Scrum Master coaches the team in Scrum.',
      followUps: [
        {
          q: 'Why does it matter that there is no separate QA role?',
          a: 'Because quality becomes a shared commitment through the Definition of Done. The tester still brings testing skills, but the whole team owns whether the Increment is Done. So testing cannot be "someone else\'s phase" after development.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-02',
      difficulty: 'easy',
      question: 'Which item is in the Scrum Guide 2020 as the commitment for the Increment?',
      options: ['Definition of Ready', 'Definition of Done', 'Acceptance criteria', 'Test completion report'],
      correct: [1],
      explanation:
        'Each Scrum artifact has a commitment: Product Backlog → Product Goal, Sprint Backlog → Sprint Goal, Increment → Definition of Done. Definition of Ready is a popular team practice but is not in the Scrum Guide. Acceptance criteria belong to one story, and test reports are not Scrum artifacts.',
      followUps: [
        {
          q: 'What happens to a backlog item that does not meet the Definition of Done at the end of the sprint?',
          a: 'It cannot be released or shown as Done in the Sprint Review. It goes back to the Product Backlog, and the PO decides when to continue it. It also does not count toward what the team delivered.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-03',
      difficulty: 'medium',
      question: 'An exploratory testing session on a new checkout belongs in which Agile Testing Quadrant?',
      options: [
        'Q1: technology-facing, supports the team',
        'Q2: business-facing, supports the team',
        'Q3: business-facing, critiques the product',
        'Q4: technology-facing, critiques the product',
      ],
      correct: [2],
      explanation:
        'Exploratory testing judges the built product from the user\'s side, so it is Q3, with usability testing and UAT. Q2 holds story tests and examples that guide coding; Q1 holds unit tests; Q4 holds performance and security. Many people pick Q2 because exploratory testing is "functional", but it critiques the product rather than guiding the coding.',
      followUps: [
        {
          q: 'Give one Q4 test for the same checkout.',
          a: 'A load test showing the checkout API keeps p95 latency under 1 second at 200 requests per second during a sale. Or a security test: a user changes the order id in the request and must not be able to pay for or see another user\'s order.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-04',
      difficulty: 'medium',
      question: 'Select ALL correct statements about the Agile Testing Quadrants.',
      options: [
        'They must be executed in order: Q1, then Q2, then Q3, then Q4',
        'One axis separates business-facing from technology-facing tests',
        'Q1 tests such as unit tests are usually automated',
        'Performance and security testing sit in Q4',
        'Exploratory testing belongs in Q1 because it is done early',
      ],
      correct: [1, 2, 3],
      explanation:
        'The quadrants have two axes: business vs technology facing, and supports the team vs critiques the product. Q1 unit and component tests are mostly automated. Q4 holds performance, security and other "-ility" tests. The quadrants are NOT an order, and exploratory testing is Q3, not Q1.',
      followUps: [
        {
          q: 'How would you use the quadrants in sprint planning?',
          a: 'As a checklist for each story: which quadrants matter, what test goes in each, and who does it. Example: a feature with good unit and story tests but no thought about performance or usability shows a clear gap.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-05',
      difficulty: 'medium',
      question: 'Look at these acceptance criteria. Which one is the most testable?',
      code: {
        language: 'text',
        title: 'Story: password reset',
        code: `A) The reset flow should be fast and secure.
B) The reset link works correctly.
C) A reset link expires 30 minutes after it is sent; opening it
   at 30:01 shows "This link has expired" and offers a new link.
D) Users should have a good experience when resetting passwords.`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [2],
      explanation:
        'C gives an exact rule (30 minutes), a boundary (30:01) and a visible result (the exact message and a new-link offer). Any tester gets the same pass or fail. A, B and D use vague words ("fast", "correctly", "good experience") that two people would test in two different ways.',
      followUps: [
        {
          q: 'What question would you ask the PO about C?',
          a: 'Boundary and edge questions: is exactly 30:00 still valid? Does sending a new link cancel the old one? Can a link be used twice? Which clock is used (server time), so time zones or clock changes do not break the rule?',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-06',
      difficulty: 'medium',
      question: 'What is the main problem with this Gherkin scenario?',
      code: {
        language: 'gherkin',
        code: `Scenario: Add item and checkout
  Given I open "https://www.saucedemo.com"
  When I type "standard_user" into "#user-name"
  And I type "secret_sauce" into "#password"
  And I click "#login-button"
  And I click "#add-to-cart-sauce-labs-backpack"
  And I click ".shopping_cart_link"
  And I click "#checkout"
  Then I should see "Checkout: Your Information"`,
      },
      options: [
        'It is imperative: it describes UI clicks and selectors instead of behaviour, and has many When steps',
        'Gherkin does not allow URLs inside steps',
        'Then steps must always check a number, not text',
        'Background is mandatory when there is more than one Given',
      ],
      correct: [0],
      explanation:
        'The scenario reads like a recorded script. CSS selectors and clicks make it fragile and hard for business people to read, and it has many actions instead of one behaviour. A declarative version: "Given I am signed in with a backpack in my cart / When I start checkout / Then I am asked for my delivery details". URLs are allowed, Then can check text, and Background is optional.',
      followUps: [
        {
          q: 'Where should the selectors live if this is automated with Playwright?',
          a: 'In the step definitions, or better in page objects that the steps call, using user-facing locators such as getByRole and getByLabel. The feature file then describes behaviour only, and it does not change when the HTML changes.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-07',
      difficulty: 'hard',
      question: 'Which Gherkin keywords best cover the rule "orders of 499.00 or more ship free" with boundary data?',
      code: {
        language: 'gherkin',
        code: `Rule: Orders of 499.00 or more ship free
  ??? Delivery fee by subtotal
    Given my subtotal is <subtotal>
    When I open checkout
    Then the delivery fee is "<fee>"
    ???:
      | subtotal | fee   |
      | 498.99   | 40.00 |
      | 499.00   | FREE  |`,
      },
      options: [
        'Scenario Outline … Examples',
        'Background … Examples',
        'Scenario … Data',
        'Feature … Table',
      ],
      correct: [0],
      explanation:
        'A Scenario Outline runs once for each row of its Examples table, filling in <subtotal> and <fee>. That is ideal for boundary values of one rule. Background only holds shared Given steps and has no Examples. "Data" and "Table" are not Gherkin keywords (though a single step can have a data table).',
      followUps: [
        {
          q: 'Which extra row would you add, and why?',
          a: '499.01, just above the boundary, to complete the three-value boundary set. Also a case where a coupon moves the subtotal from above 499.00 to below it, because the order of calculation (discount before or after the check) is a common source of bugs.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL items that belong in a test completion (summary) report, not only in a daily progress report.',
      options: [
        'Lessons learned for the next release',
        'Residual risks and areas not tested',
        'The final recommendation (Go / Go with conditions / No-go) against exit criteria',
        'Today\'s blocker: staging was down from 10:00 to 12:00',
        'Plan for testing tomorrow',
      ],
      correct: [0, 1, 2],
      explanation:
        'ISTQB CTFL v4.0 says the completion report sums up testing at the end: results against exit criteria, remaining risks, changes from the plan, lessons learned and an evaluation for the decision. One day\'s blocker and "tomorrow\'s plan" are progress-report content, used to steer testing while it runs.',
      followUps: [
        {
          q: 'Who is the audience of each report?',
          a: 'The progress report is mainly for the team, PO and Scrum Master, who steer the daily work. The completion report is for the release owner, stakeholders and sometimes auditors, who must decide and later need to know what the team knew when it shipped.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-09',
      difficulty: 'hard',
      question: 'Based on this execution report, what is the best recommendation?',
      code: {
        language: 'text',
        code: `Exit criteria: >=95% executed, >=95% pass, 0 Critical, 0 High
Executed 392/400 (98%)   Passed 380/392 (96.9%)
Open: Critical 0 | High 1 | Medium 4 | Low 9
High BUG-88: "Export to Excel" in the new Reports module
             corrupts files over 10,000 rows.
Reports module is behind flag reports_v2 (prod default OFF).
Rollback < 10 min. Monitoring and canary available.`,
      },
      options: [
        'Go with conditions: keep reports_v2 OFF, document BUG-88, canary + prod smoke',
        'No-go: an exit criterion (0 High) is not met, so release is impossible',
        'Go with no conditions: execution and pass rates exceed 95%',
        'Postpone until all Medium and Low bugs are fixed too',
      ],
      correct: [0],
      explanation:
        'Only one criterion fails (0 High), and that bug lives in a module that can stay OFF behind a flag, so customers never reach it. "Go with conditions" says exactly that. An automatic No-go treats exit criteria as the decision instead of an input. An unconditional Go ignores the High bug. Waiting for every Medium/Low bug is not a realistic bar.',
      followUps: [
        {
          q: 'What if reports_v2 had no flag?',
          a: 'Then customers would hit the corruption bug. The decision depends on exposure: how many users export more than 10,000 rows, and is there a workaround such as CSV export? I would lean to No-go or a quick fix plus retest, and write down the risk if the business still ships.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-10',
      difficulty: 'medium',
      question: 'A new search feature ships behind a release toggle. Select ALL tests the tester should plan.',
      options: [
        'Regression of the old search with the toggle OFF',
        'The new search with the toggle ON',
        'Switching the toggle at runtime (users mid-session, caching)',
        'Nothing with the toggle OFF, because the old code did not change',
      ],
      correct: [0, 1, 2],
      explanation:
        'Shipping code behind a flag still changes the code, so the OFF path needs regression: the new code may leak into the old search. The ON path is the feature itself. Flipping the toggle at runtime can break sessions or caches. "Nothing with the toggle OFF" is the classic mistake: the deploy changed the code even though the release did not.',
      followUps: [
        {
          q: 'What is "flag debt"?',
          a: 'Old toggles that are never removed. They add code paths and test combinations, confuse people about what is live, and can be flipped by accident. Remove release toggles soon after full rollout, and test that removal like any other change.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-11',
      difficulty: 'hard',
      question: 'During a canary release at 5% traffic, which observation should trigger a rollback under this plan?',
      code: {
        language: 'text',
        code: `Rollback triggers: 5xx > 0.5% OR p95 latency > 1.2 s
                   OR orders/min drop > 10% vs baseline
Observed after 30 min (canary vs baseline):
  A) 5xx 0.2% vs 0.2%      p95 0.9 s vs 0.8 s   orders/min -2%
  B) 5xx 0.3% vs 0.2%      p95 1.0 s vs 0.9 s   orders/min -14%
  C) 5xx 0.1% vs 0.2%      p95 1.1 s vs 1.1 s   orders/min +1%
  D) 5xx 0.4% vs 0.3%      p95 1.1 s vs 1.0 s   orders/min -5%`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [1],
      explanation:
        'B breaks the business rule: orders per minute dropped 14%, more than the 10% limit, even though errors and speed look fine. Canaries watch business numbers to catch exactly this kind of silent failure, such as a broken Pay button. A, C and D stay inside all three limits.',
      followUps: [
        {
          q: 'Why compare against a baseline instead of fixed numbers only?',
          a: 'Because traffic changes by time of day and season. Comparing the canary with the old version running at the same moment removes most of that noise. A drop that appears only on the canary points to the release, not to normal ups and downs.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-12',
      difficulty: 'easy',
      question: 'Who joins a "three amigos" session?',
      options: [
        'Business (PO/BA), development and testing perspectives',
        'Scrum Master, Product Owner and the customer',
        'Three testers who review each other\'s test cases',
        'Developer, DBA and DevOps engineer',
      ],
      correct: [0],
      explanation:
        'Three amigos brings together three viewpoints, business, development and testing, to discuss a story before coding, agree examples and raise questions. It is about viewpoints, not job titles or an exact head-count. It is not a peer review among testers, and not an infrastructure meeting.',
      followUps: [
        {
          q: 'What does a good three-amigos session produce?',
          a: 'Concrete examples that become acceptance criteria (often in Gherkin), open questions with owners, assumptions written down, and sometimes a decision to split the story. If nothing is written down, the knowledge is lost by the time testing starts.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-13',
      difficulty: 'expert',
      question: 'Select ALL good QA metrics to bring to a release retrospective (not vanity metrics).',
      options: [
        'Defects that escaped to production per release, with the area they came from',
        'Number of test cases written by each tester',
        'Average time a story waited in the "Testing" column',
        'Flaky-test rate of the automated pipeline over the last 4 weeks',
        'Number of bugs logged per tester to rank the team',
      ],
      correct: [0, 2, 3],
      explanation:
        'Escaped defects show the real result of testing. Time waiting in "Testing" shows a flow bottleneck. Flaky rate shows whether the pipeline can be trusted. Each one leads to a decision. Counting test cases or bugs per person only measures activity, invites gaming (one bug split into five), and ranking people with it destroys teamwork.',
      followUps: [
        {
          q: 'Escaped defects went up this release. What do you do with that number?',
          a: 'Break them down by area, type and root cause: untested scope, missed scenarios, environment differences or late changes? Then pick one or two fixes, such as an extra exploratory session on a risky module or a missing integration test, and track the trend over the next releases.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-14',
      difficulty: 'hard',
      question: 'A Kanban board has WIP limits Dev 4, Ready for test 2, Testing 3. Testing has 3 cards, Ready for test has 2, and a developer just finished card C8. What should happen?',
      code: {
        language: 'text',
        code: `| Dev (4)      | Ready for test (2) | Testing (3)    | Done |
| [C9]  [C10]  | [C6] [C7]          | [C3][C4][C5]   | [C1] |
| [C8 - done!] |                    |                |      |`,
      },
      options: [
        'The developer keeps C8 in Dev and helps clear Testing (pair-test, fix bugs), instead of pulling a new card',
        'Move C8 to Ready for test anyway; WIP limits are guidelines',
        'The developer pulls a new card from the backlog to stay busy',
        'Raise the Testing WIP limit to 5 permanently',
      ],
      correct: [0],
      explanation:
        'Ready for test is at its limit, so C8 cannot move. In Kanban\'s pull system the free developer swarms on the bottleneck: pair-test, fix bugs on cards in Testing, or automate checks. Breaking the limit or starting new work makes the queue and cycle time worse. Raising the limit for good hides the bottleneck instead of fixing it.',
      followUps: [
        {
          q: 'This happens every week. What longer-term changes would you suggest?',
          a: 'Smaller cards that are quicker to test; three amigos before coding so fewer cards bounce back with bugs; developers running agreed checks before moving a card; more regression automation; a stable test environment. Track cycle time and the cumulative flow diagram to see if the Testing band gets narrower.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL practices that reduce the "everything arrives for testing on the last day of the sprint" problem.',
      options: [
        'Splitting stories into thin, independently testable slices',
        'Testing the previous sprint\'s stories in the current sprint',
        'Agreeing acceptance examples in three amigos before coding',
        'Contract/API tests that start before the UI is ready',
        'Adding a separate "testing sprint" every third sprint',
      ],
      correct: [0, 2, 3],
      explanation:
        'Thin slices give early handovers. Three amigos cuts rework and bug ping-pong. API and contract tests let testing start before the UI exists. Testing last sprint\'s work, or a "testing sprint", is mini-waterfall: the Increment is not Done at sprint end, and feedback arrives late.',
      followUps: [
        {
          q: 'A manager suggests "QA lags one sprint behind development". How do you respond?',
          a: 'Explain the cost: stories are called Done when they are not, bugs return to developers who have moved on, and velocity becomes misleading. Offer a trial instead: thinner stories, WIP limits, developers owning unit and API tests, testing on preview environments. Measure carry-over and escaped defects before and after.',
        },
      ],
    },
  ],
};

export default topic;
