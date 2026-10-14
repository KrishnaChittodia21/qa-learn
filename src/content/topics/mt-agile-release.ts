import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-agile-release',
  phase: 'manual-advanced',
  order: 4,
  title: 'Agile Testing, Release & Reporting',
  subtitle:
    'How a QA engineer works inside Scrum and Kanban: quadrants, three amigos, DoR/DoD, Gherkin acceptance criteria, triage, go/no-go, testing in production, and the reports that let a team decide to ship.',
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
    'Agile Manifesto: individuals & interactions > processes & tools; working software > comprehensive docs; customer collaboration > contract negotiation; responding to change > following a plan (the right side still has value).',
    'Scrum Guide 2020: 3 accountabilities (Product Owner, Scrum Master, Developers — testers ARE Developers), 5 events (Sprint ≤ 1 month, Planning ≤ 8h, Daily 15 min, Review ≤ 4h, Retro ≤ 3h for a 1-month sprint), 3 artifacts + commitments (Product Backlog → Product Goal, Sprint Backlog → Sprint Goal, Increment → Definition of Done).',
    'Definition of Ready is a team practice, NOT part of the Scrum Guide; Definition of Done IS (the Increment\'s commitment).',
    'Quadrants (Marick → Crispin/Gregory): Q1 technology-facing, support team (unit/component); Q2 business-facing, support team (functional, story, examples, prototypes); Q3 business-facing, critique product (exploratory, usability, UAT); Q4 technology-facing, critique product (performance, security, reliability). Quadrants ≠ order.',
    'Three amigos = business (PO/BA) + development + testing discuss a story BEFORE coding to agree examples; output = acceptance criteria, questions, split stories.',
    'Good AC are testable, specific, cover happy + negative + edge rules; Gherkin: Feature / Rule / Scenario / Given (context) When (one action) Then (observable outcome) / Scenario Outline + Examples.',
    'Go/no-go is a team/business decision informed by QA evidence: exit criteria met? open blockers/criticals? residual risk known? rollback/feature flag ready? — QA advises, the product owner/release manager decides.',
    'Testing in production: smoke after deploy, canary (small % of traffic, watch error rate/latency, then widen or roll back), feature flags (release, experiment, ops, permissioning toggles), synthetic monitoring + alerts.',
    'Test progress (execution) report = during testing: planned vs executed vs passed/failed/blocked, defects open by severity, blockers, risks. Test completion (summary/closure) report = at the end: scope, results vs exit criteria, deviations, residual risks, recommendation, lessons learned.',
    'Useful QA metrics trend over time and drive a decision (escaped defects, pass rate per build, blocked tests, cycle time); vanity metrics (test case count, bugs per tester) get gamed.',
    'Kanban: visualise the flow, limit WIP per column, manage flow; cycle time = start → done, lead time = commitment point → done (Kanban Guide); a "Testing" column piling up means swarm on testing, not pull more dev work.',
  ],
  sections: [
    {
      heading: 'Agile in one page: the manifesto and what it means for testers',
      body: `**Intuition:** waterfall is like building a whole house and then inviting the inspector. Agile invites the inspector into every room as it is built, and lets the owner change their mind about the kitchen before the tiles go in.

The **Agile Manifesto (2001)** has four value statements. Each one says "we value the left side more", not "we throw away the right side":

| We value… | …over | What it means for QA |
|---|---|---|
| Individuals and interactions | Processes and tools | Talk to the developer before filing a 2-page ticket; a 5-minute chat often resolves it. |
| Working software | Comprehensive documentation | Lightweight test notes, checklists and automated checks instead of 300-page test plans. |
| Customer collaboration | Contract negotiation | Clarify acceptance criteria with the Product Owner instead of arguing about the spec. |
| Responding to change | Following a plan | Expect stories to change mid-sprint; keep tests easy to update (small, focused, automated where stable). |

A few of the **12 principles** matter most for testers: deliver working software frequently (weeks, not months), welcome changing requirements, business people and developers work together daily, continuous attention to technical excellence, and reflect regularly to improve (retrospectives).

**The whole-team approach** (Crispin & Gregory; also in ISTQB CTFL v4.0) means quality is everyone's job. The tester is not a gatekeeper at the end; they are a quality coach who helps the team build it right from the first conversation. In practice that means: testers join refinement, pair with developers, review unit tests, write acceptance tests early, and developers also test.

**Common mistake:** "Agile means no documentation." Wrong: it means *just enough* documentation that is still useful. A tester in Scrum still writes test notes, bug reports, a test strategy and release reports; they are just shorter and living.

**In interviews, say this:** "In Agile, testing is an activity the whole team does continuously, not a phase after development. My job is to shorten the feedback loop: ask the questions early, turn examples into tests, and give the team fast, honest information."`,
      keyPoints: [
        'The manifesto says "more than", not "instead of".',
        'Whole-team approach: quality is shared; the tester is a coach and investigator, not a gate.',
        'Testing is continuous inside the sprint, not a separate phase after it.',
      ],
      source: 'Agile Manifesto (agilemanifesto.org); Lisa Crispin & Janet Gregory — Agile Testing; ISTQB CTFL v4.0 — 1.5.2 Whole team approach',
    },
    {
      heading: 'Agile Testing Quadrants',
      body: `**Intuition:** the quadrants are a map of *kinds* of testing so the team does not forget a whole region. Think of a city map split into four districts: you would not plan a tour that only visits one.

Brian Marick drew the original matrix; Lisa Crispin and Janet Gregory adapted it (with his permission) into the quadrants at the heart of *Agile Testing*. Crispin calls it "merely a taxonomy" for planning, with no hard rules about what goes where. Two axes:

- **Horizontal:** does the test **support the team** (guide development, written before/while coding) or **critique the product** (evaluate the finished thing)?
- **Vertical:** is it **business-facing** (in the customer's language) or **technology-facing** (in the developer's language)?

| Quadrant | Facing / purpose | Examples | Usually |
|---|---|---|---|
| **Q1** | Technology-facing, supports the team | Unit tests, component tests, TDD | Automated |
| **Q2** | Business-facing, supports the team | Functional/story tests, examples, BDD scenarios, prototypes, API tests | Automated + manual |
| **Q3** | Business-facing, critiques the product | Exploratory testing, usability, UAT, demos, alpha/beta | Manual |
| **Q4** | Technology-facing, critiques the product | Performance, load, security, reliability, compatibility | Tools |

**Worked example: "Apply coupon at checkout" story on SauceDemo-like shop**

- Q1: developer unit-tests the discount calculation (10% of 59.99 = 6.00 rounded).
- Q2: three-amigos examples become Gherkin scenarios (valid code, expired code, code below minimum basket) and an API test for POST /cart/coupon.
- Q3: tester runs a 60-minute exploratory session on coupon + currency + back button; PO reviews it in the sprint review.
- Q4: perf check that the coupon endpoint holds at 200 requests/second during a sale; security check that codes cannot be brute-forced.

**Note:** ISTQB CTFL v4.0 (5.1.7) places smoke tests together with non-functional tests in Q4 and lists API testing in Q2.

**Common mistake:** reading the quadrants as an order (Q1 first, Q4 last). Crispin writes that the numbering "does NOT imply any order"; a team might do Q4 load tests in sprint 1 if performance is the biggest risk.

**In interviews, say this:** "I use the quadrants as a checklist during planning: for this story, which quadrants matter, and who covers each? It stops us from shipping something with great unit tests but no usability or performance thought."`,
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
      body: `**Intuition:** Scrum is a short repeating loop: pick a small goal, build and test it, show it, improve how you work, repeat. Every loop produces something that could be released.

**Scrum Guide 2020 essentials**

| Thing | What it is | Where QA shows up |
|---|---|---|
| **Product Owner** | Owns the Product Backlog and its order; maximises value | Ask them for priorities, clarify AC, agree severity of business bugs |
| **Scrum Master** | Coaches Scrum, removes impediments | Raise blockers (no test environment, no test data) |
| **Developers** | Everyone who builds the Increment, **including testers** | You commit to the Sprint Goal with the team |
| **Sprint** | Fixed length, one month or less (2 weeks is common) | Testing happens inside it, not after |
| **Sprint Planning** | Timeboxed to max 8h for a 1-month sprint | Size testing effort into story points, flag test-env needs |
| **Daily Scrum** | 15 minutes, for Developers | Say what is blocked for testing, which stories are ready for test |
| **Sprint Review** | Max 4h; inspect the Increment with stakeholders | Demo works on a real environment; capture feedback |
| **Sprint Retrospective** | Max 3h; improve how the team works | Bring data: escaped bugs, late handovers, flaky tests |
| **Product Backlog → Product Goal** | Ordered list of work | Refinement: add testability questions |
| **Sprint Backlog → Sprint Goal** | Why + what + plan for this sprint | Testing tasks live here too |
| **Increment → Definition of Done** | Usable, Done work | DoD includes the testing that must be finished |

Backlog refinement is an ongoing activity, not a formal Scrum event. **Definition of Ready is not in the Scrum Guide**; many teams use one anyway (see next section).

The 2020 guide replaced "Development Team" with **Developers** and stopped talking about roles in favour of **accountabilities**. There is no "QA role" in Scrum, which is exactly why a tester must actively join every event.

**Common mistake:** "QA tests in the next sprint." That is a mini-waterfall: the Increment is not Done when the sprint ends, defects come back a sprint late, and velocity is fiction. If testing cannot finish, the story is not Done.

**In interviews, say this:** "In Scrum I'm one of the Developers. In planning I size testing, in the daily I surface what's blocking test, in review I help show a working increment, and in retro I bring data about quality."`,
      keyPoints: [
        'Scrum Guide 2020: accountabilities = Product Owner, Scrum Master, Developers.',
        'Timeboxes for a one-month sprint: Planning 8h, Daily 15 min, Review 4h, Retro 3h (shorter sprints usually shorter).',
        'Commitments: Product Goal, Sprint Goal, Definition of Done.',
      ],
      source: 'Ken Schwaber & Jeff Sutherland — The Scrum Guide (2020)',
    },
    {
      heading: 'Three amigos, Definition of Ready and Definition of Done',
      body: `**Intuition:** before a builder starts, the client, builder and inspector stand in the empty room and agree what "finished" will look like. That 20-minute talk prevents a week of rework.

**Three amigos** (name popularised by George Dinwiddie) is a short meeting per story with three perspectives:

- **Business** (PO/BA): what problem are we solving, what is the rule?
- **Development**: how could we build it, what is hard or risky?
- **Testing**: what could go wrong, what about this edge case, how will we know it works?

The output is concrete **examples** that become acceptance criteria, a list of open questions, and sometimes a decision to split the story. This is "specification by example": examples remove ambiguity faster than abstract rules.

**Definition of Ready (DoR)** is a team-made checklist for when a story may enter a sprint. **Definition of Done (DoD)** is the quality bar every Increment must meet. Do not confuse them:

| | Definition of Ready | Definition of Done |
|---|---|---|
| Answers | Can we start this story? | Can we call this work finished? |
| In Scrum Guide 2020? | No (optional team practice) | Yes (commitment of the Increment) |
| Applies to | Each backlog item before planning | Every Increment / every item |
| QA items | AC written and testable, test data known, dependencies identified, designs attached | AC verified, regression run, no open critical/high bugs, automated checks added, code reviewed, deployed to staging |
| Risk if abused | Becomes a stage gate ("waterfall in disguise") | Becomes "done-ish" if testing is optional |

**Acceptance criteria vs DoD:** AC are specific to one story ("expired coupon shows message X"). DoD is generic and applies to all stories ("all AC verified; no open high bugs; automated tests in pipeline").

**Common mistake:** writing the DoD as a wish list nobody checks. A DoD is only real if a story that fails it goes back to In Progress.

**In interviews, say this:** "I push for testing to be in the DoD, so a story with unverified AC or an open high-severity bug simply isn't Done, regardless of the date."`,
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
      body: `**Intuition:** "users can apply a coupon" is a wish; "a cart of 59.99 with code SAVE10 shows a total of 53.99" is a test. Gherkin is a structured way to write those examples so business people can read them and tools like Cucumber or Playwright-BDD can run them.

**Good acceptance criteria are:** testable (an observable outcome), specific (actual values), complete enough (happy path, at least one negative and the main edge rules), independent of UI implementation where possible, and agreed with the PO.

Two common formats:

- **Rule-based / checklist:** "Coupon must be applied before payment; only one coupon per order; expired coupons are rejected with message X."
- **Scenario-based (Gherkin):** Given / When / Then examples.

**Gherkin keywords** (Cucumber reference): Feature, Rule, Background, Scenario (or Example), Given (context), When (the action, ideally one), Then (expected outcome), And/But, Scenario Outline with Examples table for data variations.

**Writing rules that interviewers check**

- One behaviour per scenario; one When. The Cucumber reference suggests keeping each example to about 3–5 steps.
- Declarative, not imperative: "When she applies coupon SAVE10", not "When she clicks the #coupon input and types…".
- Then must be **observable** by a user or an API client.
- Use Scenario Outline for the same rule with different data (boundary values!).

**BDD is a collaboration practice first, an automation tool second.** If nobody talks and the tester just writes Gherkin alone after coding, you get the cost of BDD with none of the benefit.

**In interviews, say this:** "BDD starts in the three-amigos conversation; Gherkin is just the record of the examples we agreed. I keep scenarios declarative so they survive UI changes."`,
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
      body: `**Intuition:** in a good sprint, testing looks like a steady drumbeat, not a cliff on the last two days.

**A typical two-week sprint for a QA engineer**

| When | QA activities |
|---|---|
| Before the sprint (refinement) | Three amigos, ask testability questions, draft AC, estimate test effort, spot test-data/env needs |
| Day 1 (planning) | Agree Sprint Goal; add test tasks to the board; plan which stories need automation, exploratory, perf |
| Days 2–4 | Write test ideas/charters and Gherkin; prepare data; pair with devs; review unit tests; automate API checks against the contract |
| Days 3–8 | Test each story as soon as it is deployed to the test env (small stories → early handovers); log bugs, retest fixes, re-run affected regression |
| Days 7–9 | Automate stable happy paths (Playwright); exploratory sessions on integrated features; triage defects with PO |
| Day 9 | Regression on the release candidate (automated suite + targeted manual) |
| Day 10 | Sprint review demo; retro with quality data; progress/summary report if the sprint ships |

**How to avoid the "everything lands on day 9" cliff**

- Split stories so the first one is testable by day 3.
- Use WIP limits: devs help test or fix instead of starting new stories.
- Test on feature branches / preview environments; contract-test APIs before the UI exists.
- Developers own Q1 tests; testers do not re-test what unit tests already cover.

**When a story fails testing near the end:** do not silently carry it over. Raise it in the daily, let the PO decide: fix now, ship behind a feature flag (OFF), or move it back to the backlog. It does not count toward velocity.

**In interviews, say this:** "I start testing on day one, with questions and examples, and I aim to test each story within a day of it being ready, so the last days are for regression and exploration, not first-time testing."`,
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
      body: `**Intuition:** triage is the hospital emergency desk for bugs: decide quickly who needs attention now, who can wait, and who does not need treatment at all.

**Who attends:** Product Owner (decides business priority), a developer or tech lead (effort, root area, risk of fix), a tester (evidence, severity, reproduction), sometimes support or the release manager near a release.

**Cadence:** in Scrum many teams triage new bugs daily for 10–15 minutes right after the daily; release-time triage can be twice a day. Kanban teams triage continuously as bugs enter the board.

**For each bug the meeting decides**

1. Is it valid? (not a duplicate, not "works as designed", reproducible)
2. Severity (impact, set mainly by QA) and priority (urgency, set mainly by the PO) — see mt-defects for the full model.
3. Action: fix in this sprint, put in backlog, defer to a named release, accept as known issue (with release note), or close.
4. Owner and target date.
5. Release impact: is it a **release blocker**?

**Good triage hygiene:** come prepared (bug has steps, evidence, environment, build), timebox each bug (2 minutes; longer discussions go offline), record the decision in the ticket, and review the "deferred" list before each release so it does not rot.

**Common mistake:** the tester arguing priority for 20 minutes. QA's job is to make impact clear with evidence ("affects all users paying by UPI, 12% of orders"); the PO owns the business call.

**In interviews, say this:** "In triage I present the impact with facts, propose a severity, and let the Product Owner set priority. If I disagree, I add data (affected users, workaround, frequency), not volume."`,
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
      body: `**Intuition:** go/no-go is the pilot's pre-flight checklist. Nobody guarantees a perfect flight, but nobody takes off with a known engine fault either.

**Release validation** is the testing done on the release candidate (RC), on an environment as close to production as possible:

1. **Build verification / smoke** on the RC: the build deploys and the critical paths open.
2. **Regression**: automated suite plus targeted manual checks for changed and risky areas.
3. **Release-specific checks**: data migrations, config and feature-flag states, integrations (payment gateway sandbox, email), upgrade path for mobile apps.
4. **Non-functional checks that the release touches**: a quick performance baseline, security scan results.
5. **Bug fix verification** for everything marked "fixed in this release".

**Go/no-go meeting inputs**

| Input | Question it answers |
|---|---|
| Exit criteria from the test plan | Did we do what we said we would (coverage, pass rate)? |
| Open defects by severity | Are there blockers or criticals? Are the open highs accepted with workarounds? |
| Residual risk | What did we NOT test and why? |
| Rollback / roll-forward plan | If it goes wrong, how fast can we undo it? Is the feature behind a flag? |
| Operational readiness | Monitoring, alerts, on-call, support briefed, release notes |

**Who decides?** The release owner (often the Product Owner or a release manager) makes the call. QA provides a **recommendation backed by evidence**, never a silent "pass" and never a solo veto.

**Possible outcomes:** Go; Go with conditions (e.g. feature X stays flag-OFF, known issue in release notes, hotfix in 48h); No-go (with what must change to become Go).

**In interviews, say this:** "I don't sign off on 'bug-free', I sign off on 'here is what we tested, what we found, what risk remains, and my recommendation'. The business decides with that information."`,
      keyPoints: [
        'Release validation = smoke + regression + release-specific + fix verification on the RC.',
        'Go/no-go inputs: exit criteria, open defects, residual risk, rollback plan, operational readiness.',
        'QA recommends with evidence; the release owner decides; "Go with conditions" is common.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.1.3 Entry and exit criteria, 5.3 Test monitoring, control and completion',
    },
    {
      heading: 'Testing in production: smoke, canary, feature flags and monitoring',
      body: `**Intuition:** staging is a dress rehearsal; production is opening night. Some problems (real data, real traffic, real third-party behaviour) only appear on opening night, so modern teams test there too, carefully.

**Production smoke test:** a few minutes of checks right after deployment, using safe test accounts: home page loads, login with a test user, search returns results, add to cart, payment page renders (often stopping before real payment or using a 1-rupee internal product). Automated Playwright smoke suites tagged @prod-smoke are common.

**Canary release** (Danilo Sato, martinfowler.com): deploy the new version to a small subset of servers/users first (say 5%), compare error rates, latency and business metrics against the old version, then widen gradually (5% → 25% → 100%) or roll back quickly. Named after the canary in a coal mine.

**Blue-green deployment:** two identical environments; switch traffic from blue (old) to green (new); switching back is the rollback.

**Feature flags / toggles** (Pete Hodgson, martinfowler.com) separate *deploy* from *release*: code is in production but the feature is OFF until someone flips it. Four categories:

| Toggle type | Purpose | Lifetime |
|---|---|---|
| Release toggle | Hide unfinished or risky features | Short (days–weeks) |
| Experiment toggle | A/B tests | Hours–weeks |
| Ops toggle | Kill switch for a costly or risky feature | Short, some long-lived |
| Permissioning toggle | Feature only for premium/beta/internal users | Long |

**What flags mean for QA:** test both states (ON and OFF) of every flag that ships; test the flip itself (no restart needed? cache?); do not try every combination: Hodgson suggests testing the configuration expected in production with the new release toggles ON, the fallback with them OFF, and optionally all toggles ON; remove old flags (flag debt). In Playwright, tests often set the flag via an API or cookie before the scenario.

**Monitoring and observability as testing:** dashboards for error rate, latency, conversion; alerts; synthetic monitors (scripted user journeys every few minutes); log searches after a release. A tester who reads dashboards after release catches issues before customers report them.

**Common mistake:** "testing in prod" as an excuse to skip testing before prod. It is an *additional* safety net, for what staging cannot simulate.`,
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
      body: `**Intuition:** an execution (progress) report is the live score during the match; a summary (completion) report is the match report written after the final whistle, with the result and what it means.

ISTQB CTFL v4.0 (5.3.2) names two report types:

| | Test progress report (execution / status) | Test completion report (summary / closure) |
|---|---|---|
| When | Regularly during testing (daily, per build) | When a test level, sprint or release finishes |
| Audience | Team, PO, scrum master | PO, release owner, stakeholders, auditors |
| Content | Period covered; progress vs plan (planned/executed/passed/failed/blocked); open defects by severity; impediments and workarounds; new/changed risks; plan for next period | Summary of what was tested (scope, builds, environments); results vs exit criteria; deviations from the plan; defects found and still open; residual/unmitigated risks; quality evaluation; recommendation; lessons learned |
| Purpose | Control: steer the testing now | Decide + learn: ship or not, improve next time |

In Agile teams, progress reporting is often the board, burn-down and pipeline dashboard rather than a document; the completion report may be a short page in Confluence attached to the release.

**What makes a report good:** numbers *with interpretation* ("pass rate 94%: the 6% failing are all in the new refunds flow"), clear statement of what was **not** tested, residual risk in business language, and an explicit recommendation.

**Common mistake:** a report that is only a table of numbers ("Executed 412, passed 389") with no conclusion. Stakeholders cannot decide from raw counts.`,
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
      body: `**Intuition:** a metric is a flashlight: point it at a decision you need to make. If no decision changes based on the number, it is decoration, and people will game it.

ISTQB v4.0 groups test metrics as: project progress, test progress, product quality, defect, risk, coverage and cost metrics. In Agile teams the most useful are:

| Metric | Why it helps | Watch out |
|---|---|---|
| Test execution progress (executed / planned, pass / fail / blocked) | Shows if testing will finish in time | 100% executed ≠ well tested |
| Requirements / AC coverage | Which stories have verified AC | Coverage of what was written, not what was missed |
| Open defects by severity, trend over builds | Readiness for release | A falling count can mean less testing |
| Escaped defects (found in prod) per release | The real outcome of testing | Needs honest production bug tagging |
| Automated suite pass rate + flaky rate | Pipeline trust | A 99% pass rate with 5% flaky retries hides problems |
| Cycle time for stories, time in "Testing" column | Flow problems, test bottlenecks | Not a tester performance score |
| Mean time to detect / restore (with ops) | How fast we catch and fix prod issues | Needs monitoring in place |

Detailed defect formulas (defect density, DRE, leakage, reopen rate) are covered in the Defects topic; here the point is choosing metrics for a sprint or release decision.

**Vanity / harmful metrics:** number of test cases written, bugs logged per tester (encourages splitting one bug into five), "100% automation" (some things should be explored by humans), velocity used to compare teams.

**In interviews, say this:** "I pick a small set of metrics tied to decisions: execution progress and blocked tests to steer the sprint, open criticals and escaped defects to judge release quality, and flaky rate to judge whether we can trust the pipeline. I always show trends, not single numbers."`,
      keyPoints: [
        'Tie every metric to a decision; show trends, not snapshots.',
        'Escaped defects measure outcome; test-case counts measure activity.',
        'Never use QA metrics to rank individual testers.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.3.1 Metrics used in testing',
    },
    {
      heading: 'Kanban for testers',
      body: `**Intuition:** Kanban is a supermarket checkout rule: only so many trolleys at each till. If the "Testing" till is full, people further back stop piling in and help clear it.

**Kanban practices** (the Kanban Guide lists six general practices): visualise the work, **limit work in progress (WIP)**, manage flow, make policies explicit (e.g. "Ready for test" means deployed to QA env with notes), implement feedback loops, and improve collaboratively / evolve experimentally. No fixed sprints: work is pulled when capacity frees up; releases can be continuous or on a cadence.

**Flow metrics**

- **Lead time:** from the commitment point (the team agrees to do it) to completion; the Kanban Guide's core flow metric.
- **Delivery rate (throughput):** items completed per unit of time.
- **Cycle time:** from work started to done.
- **Cumulative flow diagram:** widening band in a column = a bottleneck.

| | Scrum | Kanban |
|---|---|---|
| Cadence | Fixed sprints (≤ 1 month) | Continuous flow |
| Commitment | Sprint Goal and forecast | WIP limits and service levels |
| Roles | PO, SM, Developers | None required |
| Change mid-cycle | Avoid changing the Sprint Goal | New items can be pulled any time |
| QA signal | Carry-over and burn-down | Cards piling in "Testing", rising cycle time |

**Worked example:** board WIP limits: Dev 4, Ready for test 2, Testing 3. Testing holds 3 cards and Ready for test holds 2: Dev is blocked from moving more cards forward, so a developer pairs with QA to test a card or fixes a bug. That is the point: WIP limits expose the bottleneck and make the team swarm.

**In interviews, say this:** "In Kanban I watch the Testing column and cycle time. If work queues in testing, the fix is team-wide: smaller cards, devs testing, more automation; not me working weekends."`,
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
          a: 'Keep the first line short but honest: "Go with conditions: refunds behind flag OFF, one High bug retest pending". A one-line summary is fine; a misleading one is not, because if refunds fail in production the report is the record of what QA knew. I would offer to present the conditions in 60 seconds at the go/no-go meeting so management gets the headline without losing the risk.',
        },
        {
          q: 'Who should sign the release if QA recommends "No-go" but the business wants to ship?',
          a: 'The release owner (PO or release manager) owns the decision and its risk. QA makes sure the risk is written down clearly, proposes mitigations (feature flag, canary, extra monitoring, hotfix plan) and records that the business accepted the residual risk. That is not a failure of QA; it is the business making an informed trade-off, which is exactly what the report is for.',
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
          a: 'Usually not as-is. If the rule is unknown, the developer will guess and QA will test a different guess. Options: the PO gets the answer from finance before planning, the team splits the story (fee without coupons now, coupon interaction next), or the story enters with an explicit spike. Whatever we pick, the open question must be visible, not buried.',
        },
        {
          q: 'How would you automate the Scenario Outline?',
          a: 'Ideally at the API or unit level: call the pricing/fee endpoint with the three subtotals and assert the fee, which is fast and stable. Then one Playwright UI test checks that the checkout page displays whatever fee the API returns, plus the "Add X more" message. Running all boundary rows through the UI would be slow and add little extra confidence.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-agile-release-iq-1',
      difficulty: 'easy',
      question: 'What is the role of a QA engineer in a Scrum team? Walk me through what you do in each Scrum event.',
      whatInterviewerLooksFor: [
        'Knows testers are part of the Developers, not a separate phase',
        'Concrete activities per event, not just event names',
        'Mentions refinement / three amigos and shift-left',
        'Understands the Definition of Done',
      ],
      modelAnswer: `In Scrum there is no separate "QA role": I am one of the **Developers** and share the Sprint Goal. My job is to give the team fast, honest information about quality, starting before code is written.

**Refinement (ongoing):** I join three-amigos conversations, ask "what happens if…" questions, help turn rules into examples and acceptance criteria, and flag stories that are not testable yet (no test data, unknown rule).

**Sprint Planning:** I help size testing effort, make sure test tasks (automation, exploratory sessions, environment setup) are in the Sprint Backlog, and point out risky stories that need early delivery.

**During the sprint:** I write test ideas and Gherkin scenarios early, test each story as soon as it is deployed, log and retest bugs, automate stable flows with Playwright, and run exploratory sessions on integrated features.

**Daily Scrum (15 min):** I say which stories are ready for test, what is blocked (environment down, data missing) and which bugs threaten the Sprint Goal.

**Sprint Review:** I help demo a working increment on a real environment and capture stakeholder feedback as new backlog items.

**Retrospective:** I bring data: escaped defects, stories that arrived for testing on day 9, flaky tests, and suggest one improvement.

Throughout, I care about the **Definition of Done**: a story with unverified AC or open high-severity bugs is not Done, even if the code is merged.`,
      followUps: [
        {
          q: 'What if the developers finish coding on the last day and there is no time to test?',
          a: 'The story is not Done, so it does not count and goes back to the backlog or next sprint, with the PO deciding. Then in the retro we fix the root cause: smaller stories, dev-QA pairing, WIP limits, testing on preview environments. I would not cut testing silently or work late every sprint, because that hides the problem instead of solving it.',
        },
        {
          q: 'Is a tester the "quality owner" in Scrum?',
          a: 'No. The whole team owns quality; the Definition of Done is a team commitment. The tester brings testing skills, risk thinking and an independent viewpoint, and often coaches others on testing, but developers also write unit tests, review each other and fix their bugs. If only one person "owns" quality, everyone else stops caring about it.',
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
        'Correct axes (business vs technology facing; support team vs critique product)',
        'Correct examples in each quadrant',
        'Knows the quadrants are not a sequence',
        'Applies them to a concrete feature',
      ],
      modelAnswer: `The quadrants (Brian Marick's idea, popularised by Lisa Crispin and Janet Gregory) classify tests on two axes: **business-facing vs technology-facing**, and **supporting the team** (guiding development) vs **critiquing the product** (evaluating what was built).

- **Q1** technology-facing, supports the team: unit and component tests, mostly automated by developers.
- **Q2** business-facing, supports the team: functional/story tests, examples, BDD scenarios, API tests, prototypes.
- **Q3** business-facing, critiques the product: exploratory testing, usability, UAT, demos.
- **Q4** technology-facing, critiques the product: performance, load, security, reliability.

They are a **coverage checklist, not an order**. For "refund to wallet":

- **Q1:** unit tests for the refund amount calculation (full, partial, with coupon), currency rounding, idempotency key handling.
- **Q2:** Gherkin examples agreed with the PO: refund to wallet within 5 minutes, partial refund for one item, refund rejected after 30 days; API tests for POST /refunds and GET /wallet/balance; contract test with the payment service.
- **Q3:** exploratory sessions: refund then cancel order, two refunds in parallel tabs, refund while wallet is frozen, how support agents see it; PO demo in review.
- **Q4:** security (can a user refund someone else's order by changing the order id? authorization), reliability (payment service timeout, retry without double credit), a quick load check before a sale.

Using the quadrants in planning made us notice Q4 early: a double credit under retries is a real money-loss risk, so the idempotency tests were planned in sprint 1, not left to the end.`,
      followUps: [
        {
          q: 'Which quadrants should be automated?',
          a: 'Q1 almost entirely, and most of Q2 for regression (API and key UI flows). Q3 is human by nature: exploration, usability judgement, UAT. Q4 uses tools (k6, JMeter, ZAP) but needs human analysis of the results. Crispin and Gregory label Q1 "automated", Q2 "automated and manual", Q3 "manual" and Q4 "tools". Automation decisions are still per test, based on value and stability.',
        },
        {
          q: 'Where does ISTQB put the quadrants?',
          a: 'ISTQB CTFL v4.0 covers them in chapter 5 (test management, section 5.1.7) as a model to group test levels and types so that all needed test types are considered in Agile planning. It uses the same axes: business vs technology facing, and support the team vs critique the product.',
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
        'Clear distinction of scope: per story vs every increment',
        'Knows DoD is in the Scrum Guide and DoR is not',
        'Concrete QA-relevant examples',
        'Understands what happens when DoD is not met',
      ],
      modelAnswer: `They answer three different questions.

| | Answers | Scope | Example |
|---|---|---|---|
| **Definition of Ready** | Can we start this story? | Every story, before planning | "AC written with a negative example; test data identified; designs attached; dependencies known" |
| **Acceptance criteria** | What must this story do? | One specific story | "Given subtotal 498.99, delivery fee is 40.00; at 499.00 it is free" |
| **Definition of Done** | Is this work really finished? | Every item / the Increment | "Code reviewed; AC verified on staging; regression green; no open Critical/High bugs; automated checks added; release notes updated" |

Two important facts:

1. **DoD is part of the Scrum Guide 2020**: it is the commitment for the Increment. If an item does not meet the DoD, it cannot be released or shown as Done in the review; it goes back to the Product Backlog.
2. **DoR is not in the Scrum Guide.** It is a useful team practice, but if it is used as a rigid gate ("we won't touch it until a 20-point checklist is perfect") it becomes waterfall in disguise. I prefer a light DoR.

AC can pass while DoD fails: the coupon story meets all its AC, but no regression was run or a High bug is open in a related flow, so it is not Done.

As a QA, I make sure testing activities are explicit in the DoD, because "tested" written vaguely tends to shrink under deadline pressure.`,
      followUps: [
        {
          q: 'Who creates the Definition of Done?',
          a: 'Per the Scrum Guide, if the organisation has a DoD standard, all teams follow it as a minimum; otherwise the Scrum Team creates one appropriate for the product. In practice the Developers, PO and Scrum Master agree it together and review it in retrospectives. QA should push for concrete, checkable testing items in it.',
        },
        {
          q: 'A story meets its AC but you found an unrelated Medium bug elsewhere. Is the story Done?',
          a: 'Usually yes for that story, if the DoD says "no open Critical/High bugs linked to the story" and the Medium bug is in another area. I would log the bug, take it to triage and let the PO prioritise it. If the bug was caused by this story (a regression), then it is linked and the story should not be Done until it is triaged and accepted or fixed.',
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
      question: 'It is the day of the release. You still have one High-severity bug open and 15% of regression not executed. Do you give the go-ahead?',
      whatInterviewerLooksFor: [
        'Does not answer with a blind yes or no',
        'Gathers facts: impact of the bug, which tests are pending, risk',
        'Offers mitigations (flags, canary, rollback, workaround)',
        'Understands QA recommends and the business decides',
        'Communicates clearly and documents the decision',
      ],
      modelAnswer: `I would not answer "yes" or "no" by reflex. I would give the release owner a **recommendation backed by facts** within the hour.

**1. Understand the High bug**
- Which users and flows does it affect, how often, is there a workaround? A High bug in a rarely used admin export is different from one in checkout.
- Can the feature be turned off with a feature flag, or is the fix small and verifiable today?

**2. Understand the untested 15%**
- Which areas? If it is low-risk, unchanged modules covered by stable automation in earlier builds, the risk is small. If it includes payment or the changed module, the risk is high.
- Can I prioritise: run the riskiest pending tests in the next 2–3 hours, and maybe a quick exploratory pass on the changed area?

**3. Mitigations**
- Ship with the affected feature flagged OFF.
- Canary rollout (5% first) with clear rollback triggers; prod smoke test right after deploy.
- Known issue in release notes and support briefed.
- Hotfix plan with date.

**4. Recommendation and communication**
For example: "Go with conditions: coupon v2 stays flag-OFF because of BUG-311; remaining tests are in unchanged reporting modules last passed on rc1; canary with rollback if 5xx > 0.5%." Or "No-go: the High bug double-charges cards and has no workaround; fix ETA 4h, retest 1h, re-plan for tomorrow."

The **release owner (PO/release manager) decides**. I make sure the residual risk is written down in the test summary report so the decision is informed and traceable.`,
      followUps: [
        {
          q: 'The manager says "we release anyway" and the bug causes an incident. Whose fault is it?',
          a: 'Blame is less useful than learning. If the risk was clearly documented and the business accepted it, QA did its job. In the post-incident review, I would focus on why we got to release day with a High bug open: late handover, missing automation, too-big stories. I would also check whether my communication of impact was clear enough, because a vague risk statement makes it easy to override.',
        },
        {
          q: 'What if there were no feature flag and no rollback plan?',
          a: 'Then the risk of going ahead is much higher, because any problem becomes a forward-fix under pressure. I would state that clearly in the recommendation and lean towards No-go for anything affecting money or data. I would also raise "every risky change needs a rollback path or a flag" as a DoD or release-checklist improvement in the retro.',
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
      question: 'What do you include in a test summary report, and how is it different from a daily test execution report?',
      whatInterviewerLooksFor: [
        'Distinguishes progress (during) from completion (end) reports',
        'Lists contents: scope, results vs exit criteria, defects, deviations, residual risk, recommendation, lessons',
        'Knows the audience differs',
        'Values interpretation over raw numbers',
      ],
      modelAnswer: `ISTQB CTFL v4.0 calls them the **test progress report** and the **test completion report**.

**Daily execution / progress report** (during testing, for the team and PO, to steer):
- Period and build tested.
- Progress against plan: planned, executed, passed, failed, blocked.
- Open defects by severity and their trend.
- Blockers and impediments (environment down, data missing) with owners.
- New or changed risks, and what is planned for the next period.

**Test summary / completion report** (at the end of a sprint, test level or release, for stakeholders, to decide and learn):
- **Scope**: what was tested and not tested, builds, environments, devices.
- **Results vs exit criteria**: e.g. 97% executed vs 95% target (met); 1 open High vs target 0 (not met).
- **Defects**: found, fixed, still open with status and accepted known issues.
- **Deviations** from the plan (skipped tests, changed scope, why).
- **Residual risks** in business language: "partial refunds untested; risk of wrong refund amounts".
- **Quality evaluation and recommendation**: Go / Go with conditions / No-go.
- **Lessons learned** for the retrospective.

The key difference is purpose: the progress report helps us *control* testing now; the completion report helps someone *decide* and helps the team *improve*. Both should interpret the numbers. "302 passed" is data; "pass rate 96%, all failures in the new refunds flow, which is behind a flag" is information someone can act on.

In Agile teams much of the progress report is the board and pipeline dashboard; I still write a short completion page for releases because it records what we knew when we shipped.`,
      followUps: [
        {
          q: 'Which tool would you use to produce these reports?',
          a: 'Whatever the team already uses: Jira dashboards with Xray or Zephyr for execution counts, TestRail run reports, the Playwright HTML report or Allure for automation results, and a short Confluence page for the summary. The tool matters less than the content; I usually add a few written sentences of interpretation, because auto-generated charts never say what the risk is.',
        },
        {
          q: 'How often do you send a progress report?',
          a: 'It depends on the phase. During a normal sprint, the board and daily Scrum are often enough, with a short written update only if stakeholders outside the team need it. During release hardening I send a daily (sometimes twice-daily) status with blockers and risks, so nobody is surprised at the go/no-go meeting.',
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
        'Understands deploy vs release separation',
        'Tests both flag states and the flip',
        'Knows canary mechanics and metrics-based rollback',
        'Mentions flag debt and combinations',
        'Sees production monitoring as part of testing',
      ],
      modelAnswer: `**Feature flags** separate *deploying* code from *releasing* a feature (Pete Hodgson's article on martinfowler.com describes release, experiment, ops and permissioning toggles). That changes testing in several ways:

- **Test both states.** Every flag that ships needs the OFF path (existing behaviour must be unchanged, a regression risk) and the ON path (new feature).
- **Test the flip.** Turning the flag on or off in a running system: does the UI update without a restart, what about users mid-checkout, cached pages, mobile apps that cache config?
- **Targeting rules.** Permissioning flags ("only beta users", "only India"): test included and excluded users and the boundary of rules.
- **Combinations.** Two flags touching checkout can interact; test the likely combinations, not all 2^n.
- **Flag debt.** Old flags must be removed; removing a flag is itself a change to regression-test.
- **Automation.** Playwright tests set the flag state explicitly (API call, cookie, header) so tests are deterministic.

**Canary releases** (Danilo Sato, martinfowler.com) send a small slice of traffic to the new version first:

- Before the canary: normal pre-prod testing; canary is an extra net, not a replacement.
- During: prod smoke test on the canary, compare canary vs baseline metrics (5xx rate, p95 latency, conversion, payment success), with **predefined rollback thresholds**.
- Then widen 5% → 25% → 100%, or roll back.

**What I'd do differently as a tester:** agree flag states for each environment in the test plan, add rows for "flag OFF" in regression, write prod smoke tests that are safe (test accounts, no real payments), and watch dashboards and the support queue during rollout. Production monitoring becomes part of my test oracles.`,
      followUps: [
        {
          q: 'What is the difference between a canary release and an A/B test?',
          a: 'A canary is a risk-reduction technique: a small share of traffic gets the new version to detect technical or business problems before everyone does, and the goal is to roll out to 100% or roll back. An A/B test (experiment toggle) splits users on purpose to compare two variants statistically and choose the better one. Both route a fraction of users, but they answer different questions.',
        },
        {
          q: 'How do you write a production smoke test safely?',
          a: 'Use dedicated test accounts that are flagged internally, avoid irreversible actions (no real payments; use a zero-value internal product or stop at the payment page), never touch real customer data, keep it short (a few critical journeys), make it idempotent and clean up, and tag it (for example @prod-smoke) so it runs after each deploy and from synthetic monitoring.',
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
        'Suggests concrete fixes: smaller cards, swarming, automation, shift-left',
      ],
      modelAnswer: `A queue in Testing is a **flow problem for the whole team**, and Kanban is designed to make it visible.

**1. Look at the data.** Cycle time per column, the cumulative flow diagram (a widening Testing band), and why cards wait: environment not ready, unclear AC, bugs ping-ponging, big cards that take days to test.

**2. Use WIP limits properly.** If Testing has a limit of 3 and it is full, developers should not push more cards; they **swarm**: pair-test, fix bugs on cards in testing, write automation, or prepare test data. Starting new dev work only makes the queue longer and cycle time worse.

**3. Fix the causes**
- **Smaller cards**: a card that takes 30 minutes to test moves; a card that takes 3 days blocks.
- **Shift left**: three amigos before coding, so fewer bugs reach Testing and fewer cards bounce back.
- **Developers test too**: unit and API tests in the DoD; devs run the happy path before moving a card.
- **Automate regression** so each card does not need a full manual rerun.
- **Explicit policies**: "Ready for test" means deployed to QA env with notes and test data.
- **Environment**: if testers wait for deployments, fix the pipeline.

**4. Review in the next improvement meeting** with the before/after cycle time.

What I would not do is quietly work overtime to clear the column: that hides the bottleneck and it comes back next week.`,
      followUps: [
        {
          q: 'What is the difference between lead time and cycle time?',
          a: 'The Kanban Guide defines lead time from the commitment point (the team agrees to do the item) until it is completed; it is close to what the customer feels. Some teams measure from when the request is first made. Cycle time is measured from when work actually starts until it is done; it shows how efficient the team is once it picks something up. A long lead time with short cycle time means items wait a long time before anyone starts.',
        },
        {
          q: 'Would you rather work in Scrum or Kanban as a tester?',
          a: 'Both work if the team collaborates. Scrum gives a rhythm with planning, reviews and a Sprint Goal, which helps for product development with stakeholders. Kanban suits continuous flow such as support, maintenance or teams releasing many times a day. As a tester I care more about early involvement, small work items and a real DoD than about the framework name.',
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
        'Go/no-go from a report. Release 5.0 of a banking web app. Exit criteria: ≥ 95% planned tests executed, ≥ 95% pass rate of executed, 0 open Critical, 0 open High without an approved workaround, all P1 stories AC verified. Given the numbers below, decide Go / Go with conditions / No-go and justify.',
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
        'Exit criteria are inputs, not the decision. The same numbers can lead to Go or No-go depending on what mitigation (feature flag, rollback) exists, which is why QA should know the release mechanics.',
      followUps: [
        {
          q: 'What if the 8 blocked tests were all in the statement module?',
          a: 'Then the statement module (where H1 already lives) has a coverage gap as well as a known bug. I would push to unblock or run them before go/no-go, or at least state "statement module: 8 tests blocked plus H1 open" as residual risk, and suggest the PO checks whether statements are critical this release (month-end volume).',
        },
      ],
    },
    {
      id: 'mt-agile-release-drill-2',
      question:
        'Plan QA across a 2-week sprint (10 working days). Team: 4 developers, 1 QA (you). Sprint backlog: 5 stories (S1 login with OTP 5 pts, S2 profile photo upload 3 pts, S3 order history filters 3 pts, S4 refund status page 5 pts, S5 copy changes 1 pt). Lay out what you do each day and how you avoid the end-of-sprint testing cliff.',
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
        'Sequencing is the main tool a single QA has: ask for the riskiest stories first and in slices, so that defects come back while there is still sprint left to fix them.',
      followUps: [
        {
          q: 'Developers say they cannot split S4. What then?',
          a: 'Suggest technical slices that are still testable: the refund status API first (you can test it with Postman or Playwright request), then the UI. Meanwhile, pair with a developer on unit-test review and prepare test data so testing is fast when it lands. If S4 still arrives on day 8, make the risk visible early instead of absorbing it silently.',
        },
      ],
    },
    {
      id: 'mt-agile-release-drill-3',
      question:
        'Compute the execution report metrics and write the 3-line interpretation. Day 6 of release testing: planned 250 tests; 210 executed (190 passed, 14 failed, 6 blocked); 40 not run. Of the 14 failed, 9 are in the new "Wishlist" module. Open defects: 0 Critical, 2 High (both Wishlist), 5 Medium, 6 Low. Yesterday: 170 executed, 160 passed, 3 High open.',
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
        'Raw totals hide where the problem is. Splitting failures by area turns a vague "pass rate dropped" into a clear decision: the release is fine, one flagged feature is not.',
      followUps: [
        {
          q: 'Should the 6 blocked tests count as executed?',
          a: 'Teams differ, so state your rule in the report. ISTQB-style progress reports show blocked separately from passed and failed. I count them as "attempted but not completed": they are not evidence of quality, so they must not raise the pass rate, and they should appear with the reason and owner of the blocker.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-agile-release-mcq-01',
      difficulty: 'easy',
      question: 'According to the Scrum Guide 2020, which accountability does a tester in a Scrum team belong to?',
      options: ['Product Owner', 'Scrum Master', 'Developers', 'A separate QA role defined by the guide'],
      correct: [2],
      explanation:
        'The Scrum Guide 2020 defines three accountabilities: Product Owner, Scrum Master and Developers. Anyone who helps create the Increment, including testers, is one of the Developers. The guide defines no separate QA role; the Product Owner owns backlog value and the Scrum Master coaches the framework.',
      followUps: [
        {
          q: 'Why does it matter that there is no separate QA role?',
          a: 'Because quality becomes a shared commitment through the Definition of Done. The tester still brings testing expertise, but the team as a whole owns whether the Increment is Done, so testing cannot be treated as someone else\'s phase after development.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-02',
      difficulty: 'easy',
      question: 'Which of these is part of the Scrum Guide 2020 as the commitment for the Increment?',
      options: ['Definition of Ready', 'Definition of Done', 'Acceptance criteria', 'Test completion report'],
      correct: [1],
      explanation:
        'Each Scrum artifact has a commitment: Product Goal (Product Backlog), Sprint Goal (Sprint Backlog) and Definition of Done (Increment). Definition of Ready is a popular team practice but is not in the Scrum Guide. Acceptance criteria are per story, and test reports are not Scrum artifacts.',
      followUps: [
        {
          q: 'What happens to a backlog item that does not meet the Definition of Done at the end of the sprint?',
          a: 'It cannot be released or presented as Done in the Sprint Review. It returns to the Product Backlog for future consideration, and the PO decides when to continue it. It also does not count toward what the team delivered.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-03',
      difficulty: 'medium',
      question: 'In which Agile Testing Quadrant does an exploratory testing session on a new checkout belong?',
      options: [
        'Q1: technology-facing, supports the team',
        'Q2: business-facing, supports the team',
        'Q3: business-facing, critiques the product',
        'Q4: technology-facing, critiques the product',
      ],
      correct: [2],
      explanation:
        'Exploratory testing evaluates the built product from a user/business perspective, so it is Q3, alongside usability testing and UAT. Q2 holds story tests and examples that guide development, Q1 unit tests, and Q4 performance and security testing. Beginners often pick Q2 because exploratory is "functional", but it critiques rather than guides.',
      followUps: [
        {
          q: 'Give one Q4 test for the same checkout.',
          a: 'A load test showing the checkout API keeps p95 latency under 1 second at 200 requests per second during a sale, or a security test checking that a user cannot change the order id in the request to pay for or view another user\'s order.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-04',
      difficulty: 'medium',
      question: 'Select ALL statements about the Agile Testing Quadrants that are correct.',
      options: [
        'They must be executed in order: Q1, then Q2, then Q3, then Q4',
        'One axis separates business-facing from technology-facing tests',
        'Q1 tests such as unit tests are usually automated',
        'Performance and security testing sit in Q4',
        'Exploratory testing belongs in Q1 because it is done early',
      ],
      correct: [1, 2, 3],
      explanation:
        'The quadrants use two axes (business vs technology facing; support the team vs critique the product). Q1 unit/component tests are mostly automated, and Q4 contains performance, security and other "-ility" testing. The quadrants are explicitly not a sequence, and exploratory testing is Q3, not Q1.',
      followUps: [
        {
          q: 'How would you use the quadrants in sprint planning?',
          a: 'As a checklist per story or feature: which quadrants matter, what test in each, and who does it. It makes gaps visible, for example a feature with good unit and story tests but no thought about performance or usability.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-05',
      difficulty: 'medium',
      question: 'Review these acceptance criteria. Which one is the most testable?',
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
        'C states a specific rule (30 minutes), a boundary (30:01) and an observable outcome (exact message and an offer of a new link), so a tester can pass or fail it unambiguously. A, B and D use subjective words ("fast", "correctly", "good experience") that two people would test differently.',
      followUps: [
        {
          q: 'What question would you ask the PO about C?',
          a: 'Boundary and edge questions: is exactly 30:00 still valid; does sending a new link invalidate the old one; can a link be used twice; what time source is used (server time) so timezone or clock changes do not break the rule.',
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
        'The scenario is a recorded script: CSS selectors and clicks in the steps make it brittle and unreadable for the business, and it has many actions instead of one behaviour. A declarative version would be "Given I am signed in with a backpack in my cart / When I start checkout / Then I am asked for my delivery details". URLs are allowed, Then can check text, and Background is optional.',
      followUps: [
        {
          q: 'Where should the selectors live if this is automated with Playwright?',
          a: 'In the step definitions or, better, in page objects that the step definitions call, using user-facing locators such as getByRole and getByLabel. The feature file then describes behaviour only and does not change when the UI markup changes.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-07',
      difficulty: 'hard',
      question: 'Which Gherkin construct best covers the delivery-fee rule "orders of 499.00 or more ship free" with boundary data?',
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
        'A Scenario Outline runs once per row in its Examples table, substituting <subtotal> and <fee>, which is ideal for boundary values of one rule. Background holds common Given steps and has no Examples. "Data" and "Table" are not Gherkin keywords, although data tables can be attached to individual steps.',
      followUps: [
        {
          q: 'Which extra row would you add, and why?',
          a: '499.01 (just above the boundary), to complete the three-value boundary set, and possibly a case where a coupon moves the subtotal from above to below 499.00, because the order of calculation (discount before or after the threshold check) is a common source of bugs.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL items that belong in a test completion (summary) report rather than only in a daily progress report.',
      options: [
        'Lessons learned for the next release',
        'Residual risks and areas not tested',
        'The final recommendation (Go / Go with conditions / No-go) against exit criteria',
        'Today\'s blocker: staging was down from 10:00 to 12:00',
        'Plan for testing tomorrow',
      ],
      correct: [0, 1, 2],
      explanation:
        'ISTQB CTFL v4.0 describes the completion report as summarising testing at the end, including results against exit criteria, residual risks, deviations and lessons learned, plus an evaluation for the decision. A specific daily blocker and "tomorrow\'s plan" are progress-report content used to steer testing while it runs.',
      followUps: [
        {
          q: 'Who is the audience of each report?',
          a: 'The progress report is mainly for the team, PO and Scrum Master who steer the work day to day. The completion report is for the release owner, stakeholders and sometimes auditors who need to decide and to know later what the team knew when it shipped.',
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
        'Only one criterion fails, and the bug lives in a module that can stay switched off with a flag, so the exposure in production is removed. "Go with conditions" captures that. An automatic No-go treats exit criteria as the decision instead of an input; an unconditional Go ignores the High bug; waiting for every Medium/Low bug is not a realistic bar.',
      followUps: [
        {
          q: 'What if reports_v2 had no flag?',
          a: 'Then customers would hit the corruption bug, and the decision depends on exposure: how many users export more than 10,000 rows, and is there a workaround (CSV export)? I would lean towards No-go or a quick fix plus retest, and make the residual risk explicit if the business still chooses to ship.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-10',
      difficulty: 'medium',
      question: 'A new search feature is shipped behind a release toggle. Select ALL tests a tester should plan.',
      options: [
        'Regression of the old search with the toggle OFF',
        'The new search with the toggle ON',
        'Switching the toggle at runtime (users mid-session, caching)',
        'Nothing with the toggle OFF, because the old code did not change',
      ],
      correct: [0, 1, 2],
      explanation:
        'Shipping code behind a flag still changes the codebase, so the OFF path needs regression (the new code may leak into it). The ON path is the feature itself, and the flip is a behaviour change at runtime that can break caches or sessions. "Nothing OFF" is the classic mistake: deploy changed the code even if release did not.',
      followUps: [
        {
          q: 'What is "flag debt"?',
          a: 'Old toggles that are never removed. They multiply code paths and test combinations, confuse people about what is live, and can be flipped by accident. Release toggles should be removed soon after full rollout, and that removal should be tested like any other change.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-11',
      difficulty: 'hard',
      question: 'During a canary release at 5% traffic, which observation should trigger a rollback according to a typical canary plan?',
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
        'B breaches the business trigger: orders per minute dropped 14%, more than the 10% limit, even though errors and latency look acceptable. That is exactly the kind of silent failure (for example, a broken button) that canaries catch by watching business metrics. A, C and D stay inside all three thresholds.',
      followUps: [
        {
          q: 'Why compare against a baseline instead of fixed numbers only?',
          a: 'Because traffic and behaviour vary by time of day and season. Comparing the canary with the old version running at the same time removes most of that noise; a drop that appears only on the canary points to the release rather than to normal variation.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-12',
      difficulty: 'easy',
      question: 'Which group attends a "three amigos" session?',
      options: [
        'Business (PO/BA), development and testing perspectives',
        'Scrum Master, Product Owner and the customer',
        'Three testers who review each other\'s test cases',
        'Developer, DBA and DevOps engineer',
      ],
      correct: [0],
      explanation:
        'Three amigos brings together business, development and testing perspectives to discuss a story before coding, agree examples and surface questions. It is about perspectives, not job titles or a fixed head-count; it is not a peer review among testers and not an infrastructure meeting.',
      followUps: [
        {
          q: 'What does a good three-amigos session produce?',
          a: 'Concrete examples that become acceptance criteria (often Gherkin), a list of open questions with owners, assumptions made explicit, and sometimes a decision to split the story or add a spike. If it produces nothing written, the knowledge is lost by the time testing starts.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-13',
      difficulty: 'expert',
      question: 'Select ALL that are good QA metrics to bring to a release retrospective, as opposed to vanity metrics.',
      options: [
        'Defects that escaped to production per release, with the area they came from',
        'Number of test cases written by each tester',
        'Average time a story waited in the "Testing" column',
        'Flaky-test rate of the automated pipeline over the last 4 weeks',
        'Number of bugs logged per tester to rank the team',
      ],
      correct: [0, 2, 3],
      explanation:
        'Escaped defects measure the outcome of testing, time-in-testing reveals flow bottlenecks, and flaky rate tells the team whether the pipeline can be trusted; each drives a decision. Counting test cases or bugs per person measures activity and invites gaming (splitting one bug into five), and using them to rank people destroys collaboration.',
      followUps: [
        {
          q: 'Escaped defects went up this release. What do you do with that number?',
          a: 'Break them down by area, type and root cause: were they in untested scope, missed scenarios, environment differences or late changes? Then pick one or two improvements, such as an extra exploratory session for risky modules or a missing integration test, and track the trend over the next releases.',
        },
      ],
    },
    {
      id: 'mt-agile-release-mcq-14',
      difficulty: 'hard',
      question: 'A Kanban board has WIP limits Dev 4, Ready for test 2, Testing 3. Testing has 3 cards, Ready for test has 2, and a developer just finished a card. What should happen?',
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
        'Ready for test is at its limit, so C8 cannot move. Kanban\'s pull system says the free developer should swarm on the bottleneck: pair-test, fix defects on cards in Testing, or automate checks. Breaking the limit or starting new work grows the queue and cycle time; permanently raising limits hides the bottleneck instead of fixing it.',
      followUps: [
        {
          q: 'This happens every week. What longer-term changes would you suggest?',
          a: 'Smaller cards that are quicker to test, three amigos before development so fewer cards bounce back with bugs, developers running agreed checks before moving cards, more regression automation, and a stable test environment. Track cycle time and the cumulative flow diagram to see whether the Testing band narrows.',
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
        'Thin slices create early handovers, three amigos reduces rework and bug ping-pong, and API/contract tests let testing start before the UI exists. Testing last sprint\'s work and "testing sprints" are mini-waterfall: the Increment is not Done when the sprint ends and feedback arrives late.',
      followUps: [
        {
          q: 'A manager suggests "QA lags one sprint behind development". How do you respond?',
          a: 'Explain the cost: stories are reported Done when they are not, defects come back to developers who have moved on, and velocity becomes misleading. Offer alternatives with a trial period: thinner stories, WIP limits, devs owning unit and API tests, and testing on preview environments. Measure carry-over and escaped defects before and after.',
        },
      ],
    },
  ],
};

export default topic;
