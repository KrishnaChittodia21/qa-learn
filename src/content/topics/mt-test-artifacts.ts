import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-test-artifacts',
  phase: 'manual-basics',
  order: 2,
  title: 'Test Artifacts: Cases, Data, Plans & the RTM',
  subtitle:
    'Scenario vs case vs script, writing test cases that anyone can run, test data, suites, IEEE 829 / ISO 29119-3 test plans, strategy vs plan, the Requirements Traceability Matrix, reviews and tools like Jira + Xray and TestRail.',
  estimatedMinutes: 85,
  sources: [
    'ISTQB CTFL Syllabus v4.0.1 (2024) — 1.4.3 Testware, 1.4.4 Traceability, 5.1.1 Test Plan content',
    'IEEE 829-1998 Standard for Software Test Documentation (test plan outline) and ISO/IEC/IEEE 29119-3:2021 test documentation',
    'Guru99 — Test case writing, test scenario, RTM and test plan tutorials',
    'Software Testing Help — Test plan vs test strategy; how to write test cases',
    'QA Touch, aqua cloud and BirdEatsBug blogs — Requirements Traceability Matrix types and templates',
    'Sauce Labs — SauceDemo (www.saucedemo.com) demo application, accepted users and error messages',
    'Atlassian Marketplace docs — Xray and Zephyr Scale test management; TestRail documentation',
    'Glassdoor 2025 manual QA interview reports (RTM and test-plan fields asked even on Agile projects)',
  ],
  tags: ['test-case', 'test-scenario', 'test-data', 'test-plan', 'test-strategy', 'rtm', 'traceability', 'xray', 'testrail'],
  cheatSheet: [
    'Scenario = WHAT to test, in one line ("check checkout with valid details"). Test case = HOW (preconditions, steps, data, expected result). Script = the runnable, often automated, version.',
    'Main test case fields: ID, title, requirement link, preconditions, test data, steps, expected result per step, priority, type. When run: actual result + status.',
    'A good test case has one goal (atomic), runs on its own (independent), gives the same result every time (repeatable), and has ONE exact expected result per check.',
    'Test data: prepare it early, include boundaries and invalid values, never use real customer data (PII) unmasked; prefer synthetic or masked data; reset between runs.',
    'Test suite = a named group of cases run together (smoke, regression, feature, sprint). Build suites with tags, not copies.',
    'IEEE 829 test plan: identifier, introduction, test items, features to / not to be tested, approach, pass/fail criteria, suspension/resumption, deliverables, tasks, environment, responsibilities, staffing, schedule, risks, approvals.',
    'Test strategy = long-lived "how we test here" for the company or product. Test plan = "what, when, who, with what" for one release; it follows the strategy.',
    'RTM: forward (requirement → tests; finds untested requirements), backward (test → requirement; finds orphan tests), bidirectional (both; allows impact analysis).',
    'Review test cases with a checklist: linked to a requirement, correct expected results, preconditions, data, negative and boundary cases, no duplicates.',
    'Tools: Jira + Xray (Test, Precondition, Test Set, Test Plan, Test Execution), Zephyr Scale (cases, cycles, plans), TestRail (suites/sections, runs, milestones).',
  ],
  sections: [
    {
      heading: 'Test scenario vs test case vs test script',
      body: `- A **test scenario** says *what* to test, in one line.
- A **test case** says *how* to test it: preconditions, data, steps and the expected result.
- A **test script** (or test procedure) is the order to run cases in, often as automated code.

**Why it matters:** interviewers ask this almost every time, and one scenario usually becomes **several** test cases (positive, negative, boundary).

**Example (SauceDemo checkout):**

| Artifact | Example |
|---|---|
| **Scenario** | Check a user can complete checkout with valid details |
| **Test case** | TC-CHK-004: logged in as standard_user, backpack in cart, enter "Asha / Rao / 560001", click Continue, then Finish → page shows "Thank you for your order!" |
| **Script** | A Playwright spec, or a manual procedure that runs TC-CHK-001 to 006 in order |

**ISTQB words:** a scenario is a **test condition** (from test analysis: *what*). A test case comes from **test design** (*how*). A procedure or script comes from **test implementation**.

**When to use which:**

- Little time, or a team that explores a lot: scenarios plus charters.
- Regulated, high-risk, or handed-over work: detailed test cases.
- Anything you run every sprint: automate it as a script.

**In an interview, say:** when asked "write test cases for X", first list **scenarios** out loud (shows coverage). Then write two or three as full test cases (shows detail).`,
      diagram: `  REQUIREMENT  CHK-02 "User can pay for items in cart"
        |
        +-- SCENARIO  Checkout with valid details           (what)
        |      +-- TC-CHK-004  all fields valid -> order complete   (how)
        |      +-- TC-CHK-005  zip with spaces/letters -> accepted?
        +-- SCENARIO  Checkout with missing details
        |      +-- TC-CHK-006  empty first name -> error message
        |      +-- TC-CHK-007  empty postal code -> error message
        +-- SCRIPT    checkout.spec.ts runs 004, 006, 007 in CI    (automated)`,
      keyPoints: [
        'Scenario = what; case = how + expected result; script = the order to run, often automated.',
        'One scenario → many test cases.',
        'Interviewers like a scenario list first, then a few detailed cases.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 test analysis/design/implementation; Guru99 — Test scenario vs test case',
    },
    {
      heading: 'Anatomy of a great test case',
      body: `A **good test case** is one a new joiner can run without asking you a single question, and get the same result.

**Why it matters:** if two testers can disagree on pass or fail, the test case is broken.

**Example (weak vs strong):**

| Field | Purpose | Weak | Strong |
|---|---|---|---|
| **ID** | Unique reference for RTM, bugs, automation | 1 | TC-LOGIN-003 |
| **Title** | The goal in one line | Login test | Locked-out user sees lock-out error and stays on login page |
| **Requirement / story** | Traceability (link to the requirement) | — | REQ-AUTH-02 / SHOP-118 |
| **Preconditions** | The state before step 1 | — | On https://www.saucedemo.com, logged out, cookies cleared |
| **Test data** | Exact values | valid user | Username locked_out_user, password secret_sauce |
| **Steps** | Numbered, one action each | Login and check | 1. Enter username 2. Enter password 3. Click Login |
| **Expected result** | Exact, visible outcome | Error shown | Red banner "Epic sadface: Sorry, this user has been locked out."; URL unchanged |
| **Priority / type** | Picks it for smoke or regression | — | P1, Functional, Negative |
| **Actual result / status** | Filled in when you run it | — | Pass / Fail (bug id) / Blocked (reason) |
| **Author, date, version** | Owner and history | — | Priya, 2026-10-14, v2 |

**Qualities to aim for:**

- **Atomic:** one goal per case. If the title has "and", think about splitting it.
- **Independent:** does not need another case to run first (or says so in preconditions).
- **Repeatable:** same data and state give the same result. Clean up if the test changes data.
- **Exact expected result:** exact text, value or state. Myers said every test case must define the expected output, or testers "see what they want to see".
- **Traceable and prioritised:** linked to a requirement, with a priority.

**Common mistake:** "Expected: should work properly." Someone can call a broken screen "working" too.`,
      keyPoints: [
        'Preconditions + exact data + exact expected result = a repeatable test.',
        'Atomic, independent cases are easier to automate later.',
        'Every expected result must be visible and have only one meaning.',
      ],
      source: 'Glenford Myers — The Art of Software Testing, Ch 2 (expected output principle); Guru99 — How to write test cases; ISTQB CTFL v4.0.1 — 1.4.3 Testware',
    },
    {
      heading: 'Worked example: SauceDemo login test cases',
      body: `**Example feature:** SauceDemo login (https://www.saucedemo.com). Every accepted user has the password **secret_sauce**: standard_user, locked_out_user, problem_user, performance_glitch_user, error_user, visual_user. A good login opens **/inventory.html** with the heading **Products**.

**Why it matters:** "write test cases for a login page" is the most common practical interview task.

**Step 1, list scenarios:**

- Valid login; wrong password; unknown user; empty fields.
- Locked-out user; upper/lower case; slow user.
- Logout and the Back button; submit with the Enter key; close the error banner.

**Step 2, write full cases.** Below are six, using the template from the previous section. Each expected result quotes exact text or a URL. So a tester, or a future Playwright check, can decide pass or fail without debate.`,
      code: [
        {
          language: 'text',
          title: 'SauceDemo login: detailed test cases (REQ-AUTH-01..04)',
          code: `Common preconditions: browser at https://www.saucedemo.com, logged out.

ID           Title / data                                   Expected result
TC-LOGIN-001 Valid login: standard_user / secret_sauce      URL ends /inventory.html; heading "Products";
  (P1, Pos)  Steps: enter user, enter pwd, click Login      cart icon visible; 6 products listed
TC-LOGIN-002 Wrong password: standard_user / Secret_Sauce   Error "Epic sadface: Username and password do
  (P1, Neg)  (case changed)                                 not match any user in this service"; stays on /
TC-LOGIN-003 Locked user: locked_out_user / secret_sauce    Error "Epic sadface: Sorry, this user has been
  (P1, Neg)                                                 locked out."; no session created
TC-LOGIN-004 Empty username, password secret_sauce          Error "Epic sadface: Username is required";
  (P2, Neg)                                                 username field and icon highlighted red
TC-LOGIN-005 Username standard_user, empty password         Error "Epic sadface: Password is required"
  (P2, Neg)
TC-LOGIN-006 Submit with Enter key: type valid creds,       Same as TC-LOGIN-001 (keyboard users can log in)
  (P3, Pos)  press Enter in password field

Post-condition for 001/006: click menu > Logout to reset state.
Traceability: 001,006 -> REQ-AUTH-01 | 002,004,005 -> REQ-AUTH-02 (validation)
              003 -> REQ-AUTH-03 (lock-out)`,
        },
      ],
      keyPoints: [
        'Quote exact messages and URLs in expected results.',
        'Write positive and negative cases, each with a priority and a requirement link.',
        'Post-conditions keep cases independent (log out after a successful login).',
      ],
      source: 'Sauce Labs — SauceDemo demo site (users and error messages observed on www.saucedemo.com)',
    },
    {
      heading: 'Test data: preparation, masking, synthetic and boundary data',
      body: `**Test data** is the input values and records you need to run your tests: users, products, coupons, carts.

**Why it matters:** if you always use the same few values, you miss bugs. If you use real customer data, you break privacy law.

**Example (coupon field, minimum cart 500):**

| Kind | Purpose | Coupon example |
|---|---|---|
| Valid (happy path) | Show the main flow works | SAVE10 on a 1,000 cart |
| Invalid | Show errors work | Unknown code, expired, already used |
| Boundary | Catch off-by-one bugs | Cart at 499, 500, 501 |
| Special / edge | Robustness | Spaces around the code, emoji, 255 characters, SQL-like text |
| State-based | Rules that change over time | Coupon used once already; coupon that expires at midnight |
| Volume | Performance awareness | 50 items in the cart; 10,000 coupons in the database |

**Where test data comes from:**

- **Synthetic** (made up by scripts or tools like Faker): safe and unlimited, but may miss real-world oddities.
- **Masked copy of production:** realistic, but personal fields (names, phones, emails, card numbers, Aadhaar/SSN) must be **masked** (hidden or replaced) first. Laws like GDPR and India's DPDP Act 2023 punish careless use of real customer data.
- **Hand-made:** small, exact sets for boundaries and special rules.

**How to prepare it:** list data needs while designing tests (ISTQB calls these "test data requirements"). Create the data before running. Write down where it lives. Make it **unique per run** when tests create records. Plan a **reset**, so the next run starts clean.

**Common mistake:** all testers share one account ("test1"). One person's cart change breaks another person's test. Give each tester (or automated worker) their own data.`,
      code: [
        {
          language: 'text',
          title: 'Test data sheet for the coupon feature (SHOP-412)',
          code: `ID    Coupon      Type     Value  Min cart  Valid until   Uses left  Purpose
D-01  SAVE10      percent  10%    500       2027-12-31    unlimited  happy path
D-02  FLAT100     fixed    100    1000      2027-12-31    unlimited  fixed amount
D-03  OLD20       percent  20%    0         2025-01-31    unlimited  expired
D-04  ONCE50      fixed    50     0         2027-12-31    0          used up
D-05  MIN500      percent  5%     500       2027-12-31    unlimited  boundary: 499/500/501
D-06  save10      -        -      -         -             -          case sensitivity check
D-07  " SAVE10 "  -        -      -         -             -          whitespace trimming

Accounts: qa_coupon_01..05 (one per tester), carts reset nightly by job RESET-CARTS
PII rule: no real customer emails/phones; use @example.test domain`,
        },
      ],
      keyPoints: [
        'Plan data for each valid and invalid group and each boundary, not just the happy path.',
        'Never use unmasked real customer data (PII); prefer synthetic or masked data.',
        'Give each tester or worker their own data, and plan a reset.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 test design (test data requirements) and implementation; Guru99 — Test data generation',
    },
    {
      heading: 'Test suites: organising cases for execution',
      body: `A **test suite** is a named group of test cases that you run together for one purpose.

**Why it matters:** you never run every test every time. Suites let you pick the right set for the moment.

**Example:** a suite is like a music playlist. The same song (test case) can be in several playlists. *Example:* TC-LOGIN-001 sits in both the smoke suite and the regression suite.

| Suite | What is in it | When you run it | SauceDemo example |
|---|---|---|---|
| **Smoke** | The critical path, one case per main feature | Every new build | 10–15 cases: login, add to cart, checkout, logout |
| **Feature / sprint** | All cases for the new stories | When stories are ready | 42 cases for coupons |
| **Regression** | Old cases for existing features, by priority | Before release, after big changes | 150–300 cases |
| **Sanity** | A few checks around one fix | After a hotfix | 5–10 cases |
| **Browser / device** | A subset run on each platform | Each release | P1 cases on Safari, Firefox, mobile |

**How to organise:**

- Group cases by **feature** (Login, Inventory, Cart, Checkout). Then **tag** them (smoke, regression, P1). A suite becomes a filter on tags, not a copy. Copies drift apart over time.
- Keep each case **independent**, even inside a suite.
- Review suites every few sprints. Remove old cases. Add one case for every bug that escaped to production.

**Example (Playwright later):** folders by feature, tags like @smoke, and run only those tests with a grep filter.`,
      keyPoints: [
        'A suite is a selection for a purpose; one case can be in several suites.',
        'Use tags and filters instead of copying cases.',
        'Maintain suites; add a case for every escaped bug.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 test implementation (test procedures assembled into test suites); TestRail documentation — suites and sections',
    },
    {
      heading: 'The test plan (IEEE 829 and ISO/IEC/IEEE 29119-3)',
      body: `A **test plan** is a document that says what you will test, what you will skip, how, who, when, and what could go wrong.

**Why it matters:** it gets everyone to agree on scope *before* testing starts. Interviewers ask about its sections.

**IEEE 829-1998** is the classic outline. Many companies still copy its 16 sections:

| # | Section | # | Section |
|---|---|---|---|
| 1 | Test plan identifier | 9 | Test deliverables |
| 2 | Introduction (scope, references) | 10 | Testing tasks |
| 3 | Test items (which build or version) | 11 | Environmental needs |
| 4 | Features to be tested | 12 | Responsibilities |
| 5 | Features not to be tested (and why) | 13 | Staffing and training needs |
| 6 | Approach | 14 | Schedule |
| 7 | Item pass/fail criteria | 15 | Risks and contingencies |
| 8 | Suspension criteria and resumption requirements | 16 | Approvals |

IEEE 829 was replaced by **ISO/IEC/IEEE 29119-3**. ISTQB v4.0 lists typical plan content:

- Context: scope, objectives, test basis.
- Assumptions and constraints; stakeholders; communication.
- Risk register.
- Test approach: levels, types, techniques, deliverables, entry/exit criteria, independence, metrics, data and environment needs.
- Budget and schedule.

**Why "features not to be tested" matters.** Writing down what you skip, and why, prevents "why did QA not test this?" after release. A silent gap becomes an agreed risk. *Example:* "Payment gateway internals: out of scope, vendor-certified."

**Example:** see the plan excerpt below for a SauceDemo checkout release.

**In Agile:** many teams keep a one- or two-page release plan in Confluence, plus a long-lived test strategy. The headings still matter; the length does not.`,
      code: [
        {
          language: 'text',
          title: 'Test plan excerpt: SauceDemo checkout release 3.2',
          code: `TEST PLAN TP-CHK-3.2   v1.1   Owner: QA lead   Approvers: PO, Eng manager

1. SCOPE / ITEMS     Web shop build 3.2.x on QA + staging; checkout, cart, coupons
2. IN SCOPE          Cart add/remove, checkout info validation, overview totals
                     (item total + 8% tax), order completion, coupon (SHOP-412)
3. OUT OF SCOPE      Payment gateway internals (vendor-certified), native apps,
                     load testing (separate perf plan TP-PERF-07)
4. APPROACH          Risk-based: coupon + totals = high (EP, BVA, decision table);
                     exploratory charters 2 x 90 min; regression 54 cases;
                     automation: smoke + checkout regression in Playwright CI
5. ENVIRONMENTS      Chrome, Firefox, Safari latest; iPhone 15 + Pixel 8 (cloud)
6. ENTRY / EXIT      Entry: smoke 100%, data D-01..D-07 loaded
                     Exit : 100% executed, 0 open Blocker/Critical, RTM complete
7. SUSPEND / RESUME  Suspend if env down > 2h or > 30% blocked; resume on green smoke
8. DELIVERABLES      Test cases (Xray), defect reports, daily status, summary report
9. SCHEDULE          Design 6-8 Oct; execution 9-15 Oct; regression 16-17 Oct
10. RISKS            Tax rule change pending legal (mitigation: parametrised data);
                     1 tester on leave 13 Oct (mitigation: dev pairs on regression)`,
        },
      ],
      keyPoints: [
        'Know the IEEE 829 headings, and that ISO 29119-3 replaced it.',
        'Interviewers probe out-of-scope items and suspension criteria.',
        'In Agile, keep the plan short but keep the decisions.',
      ],
      source: 'IEEE 829-1998 test plan outline; ISO/IEC/IEEE 29119-3; ISTQB CTFL v4.0.1 — 5.1.1 Purpose and Content of a Test Plan',
    },
    {
      heading: 'Test strategy vs test plan',
      body: `- A **test strategy** says *how we usually test* in this company or product. It is general and lasts a long time.
- A **test plan** says *what, when, who and with what* for **one** project or release. It follows the strategy.

**Why it matters:** "strategy vs plan" is a standard interview question, and people often mix them up.

**Example (travel):** the strategy is the company travel policy: "always book refundable fares; economy if under 6 hours". The plan is one trip's itinerary that follows the policy.

**Example (software):**

| | Test strategy | Test plan |
|---|---|---|
| Level | Company, product or programme | Project, release or test level |
| Lifetime | Long; changes rarely | One release; updated often |
| Answers | *How do we test here in general?* | *What, when, who, with what, for this release?* |
| Typical content | Test levels and types, automation approach and tools, environment policy, defect process, metrics, risk approach | Scope in/out, schedule, people, environments, entry/exit criteria, risks for this release, deliverables |
| Owner | QA manager / test architect | Test lead / QA on the project |
| Sample line | "All P1 flows are automated with Playwright and run on every merge" | "Coupon regression runs 16–17 Oct on Chrome and Safari, by Priya and Arjun" |

Some companies also have a **test policy** above the strategy (why we test, quality goals). Small Agile teams sometimes merge strategy and plan into one page. Say so honestly: the difference is *scope and lifetime*, not the document name.

**In an interview, say:** "The strategy is the long-term 'how we test'. The plan applies it to one release: scope, dates, people, criteria."

**Common mistake:** "the plan comes first and contains the strategy". In ISTQB's view, the plan *follows* the existing strategy, or explains why it differs. A plan's "approach" section is the project-specific slice of the strategy.`,
      keyPoints: [
        'Strategy = general and long-lived; plan = specific, per release.',
        'The plan follows the strategy, or writes down why it differs.',
        'Small teams may merge them; the difference is scope and lifetime.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 5.1.1 (plan adheres to test policy and strategy); Software Testing Help — Test plan vs test strategy',
    },
    {
      heading: 'Requirements Traceability Matrix (RTM)',
      body: `A **Requirements Traceability Matrix (RTM)** is a table that links each requirement to its test cases, their results, and any bugs.

**Why it matters:** it shows if every requirement is tested (**coverage**), and what to retest when a requirement changes (**impact analysis**). ISTQB also lists audits and clear progress reports.

**Three types:**

| Type | Direction | Question it answers | Finds |
|---|---|---|---|
| **Forward** | Requirement → tests | Is every requirement tested? | Untested requirements (gaps) |
| **Backward** | Test → requirement | Why does this test exist? | **Orphan tests** (no requirement), extra features nobody asked for ("gold-plating"), tests for removed features |
| **Bidirectional** | Both ways | What is affected if REQ-X changes? | Both of the above, plus **impact analysis** |

Most teams keep a **bidirectional** RTM. Tools like Jira + Xray or TestRail usually build it for you, instead of a hand-made Excel sheet.

**Example (coupon feature):** look at the matrix below and find the problems before reading on.

- **REQ-CPN-04 has no tests.** Forward gap: the "one coupon per order" rule is untested.
- **TC-CPN-09 has no requirement.** Backward finding: either a requirement is missing (ask the PO) or the test is out of date.
- **REQ-CPN-03 is at risk.** One of its tests failed and the bug is open, so the requirement is not met, even though another test passed.
- **Impact analysis:** if the PO changes REQ-CPN-02 ("minimum cart 500 becomes 750"), the RTM shows at once that TC-CPN-03, 04 and 05 need updating.

**In an interview, say:** "Forward traceability finds untested requirements. Backward finds tests with no reason to exist. We kept a bidirectional RTM in Xray, so when a requirement changed I knew exactly which tests to update."`,
      code: [
        {
          language: 'text',
          title: 'Bidirectional RTM: coupon feature (SHOP-412)',
          code: `REQ ID      Requirement (short)                 Test cases             Status          Defects
REQ-CPN-01  Valid coupon applies % or fixed off TC-CPN-01, TC-CPN-02   Pass, Pass      -
REQ-CPN-02  Min cart value 500 (inclusive)      TC-CPN-03, 04, 05      Pass, Pass, Pass -
REQ-CPN-03  Expired/used coupon shows error     TC-CPN-06, TC-CPN-07   Pass, FAIL      BUG-881 (Major)
REQ-CPN-04  Only one coupon per order           -                      NOT COVERED     -
REQ-CPN-05  Code is case-insensitive, trimmed   TC-CPN-08              Pass            -
(none)      ?                                   TC-CPN-09 "coupon on   Pass            -
                                                gift cards"

Coverage: 4/5 requirements covered (80%); 3/5 fully passing (60%)
Actions : write tests for REQ-CPN-04; ask PO about TC-CPN-09; track BUG-881`,
        },
      ],
      diagram: `   FORWARD  (are all requirements tested?)
   REQ-CPN-01 ---> TC-CPN-01, TC-CPN-02 ---> results ---> defects
   REQ-CPN-04 ---> (nothing)  <== GAP

   BACKWARD (does every test have a reason?)
   TC-CPN-09 ---> (no requirement) <== ORPHAN

   BIDIRECTIONAL = both arrows -> impact analysis when REQ-CPN-02 changes`,
      keyPoints: [
        'Forward finds untested requirements; backward finds orphan tests.',
        'A bidirectional RTM allows impact analysis when requirements change.',
        'Include status and bugs, so the RTM shows coverage AND quality.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.4 Traceability between the Test Basis and Testware; QA Touch, aqua cloud, BirdEatsBug — RTM types and templates',
    },
    {
      heading: 'Reviewing test cases',
      body: `A **test case review** means another person reads your test cases to find mistakes before you run them. It is **static testing of testware** (test documents).

**Why it matters:** test cases have bugs too. A wrong expected result can make a real bug "pass".

**Example:** the story says "minimum cart is 500, inclusive". A test case expects a cart of exactly 500 to be **rejected**. The reviewer catches it. Without the review, the tester would log a false bug, or worse, pass a broken build that rejects 500.

Usually a peer review (informal or a walkthrough). Sometimes the BA or developer joins to confirm expected results.

**Review checklist:**

| Check | Question to ask |
|---|---|
| Traceability | Is every case linked to a requirement? Is every requirement covered? |
| Correctness | Does the expected result match the requirement (not what the current build does)? |
| Completeness | Are negative, boundary and error cases there, not just happy paths? |
| Clarity | Could a new joiner run it without asking? Exact data and messages? |
| Preconditions | Is the starting state clear (logged in? cart empty? feature flag on?) |
| Independence | Does it secretly need a previous case to run first? |
| Atomicity | One goal per case; no 25-step monsters testing five things |
| Duplication | Is the same check repeated in several cases or suites? |
| Priority | Are the P1 cases really the critical, high-risk paths? |
| Automation fit | Is it stable and repetitive enough to automate later? |

**Process:** log review comments in the tool (Xray/TestRail comments or a review sheet), each with an ID and status. Cases are **baselined** (frozen as the approved version) only after all comments are fixed. This becomes an entry criterion for test execution.

**Common mistake:** writing the expected result from what the app does today, not from the requirement.`,
      keyPoints: [
        'Reviewing testware is static testing; test cases contain defects too.',
        'Check expected results against the requirement, not against the current build.',
        'Track comments until closed, then baseline the cases.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 3.1.1 Work Products Examinable by Static Testing (includes testware), 3.2.4 Review Types',
    },
    {
      heading: 'Test management tools: Jira + Xray/Zephyr and TestRail',
      body: `A **test management tool** stores your test cases, test runs, results and links to bugs, all in one place. Most link to Jira, where developers already work.

**Why it matters:** it builds the RTM and the test dashboard for you. Interviewers ask "which tool did you use?"

| Tool | How it works | Key objects | Good to know |
|---|---|---|---|
| **Xray** (Jira app) | Tests are Jira issues | Test, Precondition, Test Set, Test Plan, Test Execution; Test Runs inside executions | Built-in traceability report: story → tests → bugs; can import JUnit/Playwright results from CI |
| **Zephyr Scale** (Jira app) | Test library inside Jira | Test cases (folders), test cycles, test plans | Versioned test cases, reusable steps, coverage on stories |
| **TestRail** (separate tool, links to Jira) | Its own app | Projects, suites/sections, test cases, test runs, test plans, milestones | Strong reports; automation can upload results through the API |
| Spreadsheets | Manual | Rows and tabs | Fine for tiny teams; links and history break quickly |

**Example (flow in Jira + Xray):**

1. Story SHOP-412 (coupon) is created.
2. You create tests and link them to the story (coverage).
3. You group them in a Test Plan for release 3.2.
4. You create a Test Execution for each build or environment, and run the tests.
5. A failed test creates a linked Bug.
6. The story's coverage panel shows: covered, failing, or not run.

**Example (bridge to automation):** put the test case ID in the Playwright test title, e.g. "TC-LOGIN-003 locked user sees error". Export JUnit XML from CI and import it into Xray or TestRail. Now manual and automated results share one dashboard and one RTM.

**In an interview, say:** "We used Jira with Xray. Tests were linked to stories, executions were per build, and failed runs created linked bugs, so the RTM was always up to date."`,
      keyPoints: [
        'Xray stores tests as Jira issues; Zephyr Scale and TestRail use their own test libraries.',
        'Linking stories → tests → executions → bugs gives a live RTM.',
        'Automated results can be imported (JUnit XML or API), so there is one source of truth.',
      ],
      source: 'Xray documentation (Atlassian Marketplace); Zephyr Scale documentation; TestRail user guide',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-test-artifacts-cc-1',
      title: 'Rewrite a weak SauceDemo checkout test case',
      context: `A junior tester wrote this test case for the SauceDemo checkout information step. In review, nobody could agree if it passed or failed on the last build.`,
      task: `Rewrite it into clear test cases that a new joiner can run without questions. Split it if it tests more than one goal. Give each case preconditions, exact data, numbered steps and exact expected results.`,
      starter: {
        language: 'text',
        title: 'Weak test case',
        code: `TC: Checkout
Steps: Login, add products, do checkout with details and without
details, check everything works.
Expected: Checkout should work properly and errors should come.
Priority: High`,
      },
      hints: [
        'How many different goals are hidden in "with details and without details"?',
        'Which user, which product, which exact field values? Which page are you on before step 1?',
        'What exactly appears on screen when a field is missing? What does the overview page show for one backpack?',
      ],
      solution: {
        language: 'text',
        title: 'Strong, atomic test cases',
        code: `Requirement: REQ-CHK-02 (checkout info), REQ-CHK-03 (overview totals)
Common preconditions: logged in at https://www.saucedemo.com as
standard_user / secret_sauce; cart empty; "Sauce Labs Backpack" ($29.99)
added; on /cart.html.

TC-CHK-004  Complete checkout with valid details      P1  Positive
 1. Click "Checkout"                 -> /checkout-step-one.html shown
 2. First "Asha", Last "Rao",
    Zip "560001"; click "Continue"   -> /checkout-step-two.html shown
 3. Check summary                    -> Item total: $29.99, Tax: $2.40,
                                        Total: $32.39
 4. Click "Finish"                   -> "Thank you for your order!";
                                        cart badge no longer shown
Post: click "Back Home"

TC-CHK-006  First name missing                        P2  Negative
 1. Click "Checkout"
 2. Leave First empty; Last "Rao"; Zip "560001"; Continue
    -> Error "Error: First Name is required"; stays on step one

TC-CHK-007  Postal code missing                       P2  Negative
 1. Click "Checkout"
 2. First "Asha"; Last "Rao"; Zip empty; Continue
    -> Error "Error: Postal Code is required"; stays on step one`,
      },
      explanation: `**What was fixed:**

- **Split into atomic cases:** the original mixed one happy path and at least two negative paths. One "Fail" would not tell you which part broke.
- **Preconditions:** the user, the start page and the cart are defined, so the result repeats.
- **Exact test data:** fixed names, postal code and one known product make the totals predictable.
- **Exact expected results:** URLs, exact error texts and the price breakdown (item $29.99 + 8% tax $2.40 = $32.39) replace "should work properly".
- **Traceability and priority per case:** each links to a requirement and has its own priority (the happy path is P1).
- **Post-condition:** going back home keeps the next case independent.
- **Ready to automate:** each step has one action and one visible check. Later, that maps one-to-one to Playwright actions and assertions.`,
      followUps: [
        {
          q: 'How would you cover "last name missing" without writing yet another near-identical case?',
          a: 'Use one data-driven case: "Required field missing shows error", with a table of rows (first missing, last missing, zip missing, all missing) and the expected message for each row. Test management tools support parameters or datasets. In Playwright, the same table becomes a loop that creates one test per row.',
        },
        {
          q: 'Is it a good idea to hard-code the tax value in the expected result?',
          a: 'For this demo, yes. The tax rate is fixed, and the exact number catches rounding bugs. In a real shop where tax changes by region or date, write the rule ("8% of item total, rounded half-up to 2 decimals") and keep the computed value in the test data sheet, so a rule change updates one place.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-cc-2',
      title: 'Strengthen a one-paragraph test plan',
      context: `Your manager sent you the "test plan" for a mobile-web coupon release. You must make it good enough for the PO and engineering manager to sign off.`,
      task: `Rewrite it as a short test plan with: scope in and out, approach, environments, entry, exit and suspension criteria, deliverables, schedule, who does what, and risks with mitigations. Keep it to one screen.`,
      starter: {
        language: 'text',
        title: 'Weak test plan',
        code: `Test Plan - Coupon release
We will test the coupon feature completely on all devices and
browsers. Testing will be done by the QA team. All bugs will be
logged in Jira. Testing will finish when the feature is stable.
Risks: none.`,
      },
      hints: [
        '"Completely" and "all devices" are impossible promises. What will you actually cover, and what not?',
        'What must be true to start, to pause, and to finish? Make each one measurable.',
        'Is "Risks: none" ever true? Think about people, environments, third parties and unclear requirements.',
      ],
      solution: {
        language: 'text',
        title: 'Sign-off ready test plan',
        code: `TEST PLAN TP-CPN-1.0  | Release 3.3 coupon (SHOP-412) | Owner: QA (Priya)
Approvers: PO (Meera), Eng manager (Karan) | Status: Draft for approval

SCOPE IN   Apply/remove coupon on cart + checkout overview; rules REQ-CPN-01..05
           (percent/fixed, min cart 500, expiry, single use, case/trim)
SCOPE OUT  Coupon admin console (next release); native apps; load testing
           (perf team, TP-PERF-09); payment gateway internals (vendor-tested)
APPROACH   Risk-based. High: discount maths + rules (EP, BVA, decision table,
           42 cases). Medium: UI messages. 2 exploratory charters x 60 min.
           Regression: checkout suite 54 cases. Automate smoke + rule cases
           in Playwright CI.
ENVIRONS   QA + staging; Chrome, Safari, Firefox (latest); iPhone 15/Safari,
           Pixel 8/Chrome via cloud devices (top 2 = 71% of mobile traffic)
DATA       Coupons D-01..D-07, accounts qa_coupon_01..05, no real PII
ENTRY      Build deployed, smoke 100%, ACs signed off, data loaded
SUSPEND    QA env down > 2 h or Blocker blocks > 30% cases; RESUME on green smoke
EXIT       100% executed; 0 open Blocker/Critical; Majors deferred only with PO
           approval; RTM shows every REQ-CPN covered; summary report reviewed
DELIVER    Test cases + executions (Xray), defects (Jira), daily status note,
           summary report
SCHEDULE   Design 6-8 Oct | Execution 9-14 Oct | Regression 15-16 Oct
RACI       QA: design/execute/report | Dev: unit tests, fixes in 24 h for
           Critical | PO: AC questions within 1 day, go/no-go
RISKS      1. Tax-before/after-discount rule unconfirmed -> answer by 7 Oct
           2. Staging shared with another team -> booked slots 15-16 Oct
           3. One tester on leave 13 Oct -> dev pairs on regression`,
      },
      explanation: `**Why this version is ready for sign-off:**

- **Honest scope:** "completely on all devices" becomes clear in and out lists, with reasons for each exclusion. That is exactly what the IEEE 829 "features not to be tested" section is for.
- **Approach based on risk:** effort and techniques match the impact; the automation scope is stated.
- **Measurable criteria:** entry, suspension/resumption and exit rules replace "when the feature is stable".
- **Devices chosen by data:** two real devices picked by traffic share, not "all devices".
- **Who does what, and how fast:** "done by the QA team" becomes named duties, including developer and PO commitments.
- **Real risks, with fixes and dates:** "Risks: none" is never true. Listing risks early lets the PO act.`,
      followUps: [
        {
          q: 'The PO asks why you are not testing the coupon admin console. What do you say?',
          a: 'It is out of scope because the admin console ships next release. This release only uses coupons created by a seed script, and no admin UI changes are deployed, so the risk is low for 3.3. I will add it to the next plan. If the PO wants it now, we can add it, with about two extra days of testing.',
        },
        {
          q: 'How do you keep this plan useful during the release, instead of writing it once and forgetting it?',
          a: 'Treat it as a living document. Update scope and risks when stories change. Track progress against the schedule in the daily status note. Recheck entry and exit criteria at the go/no-go meeting. Record any change (for example a skipped criterion) and who approved it. The summary report then compares real results with the plan.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-test-artifacts-iq-01',
      difficulty: 'easy',
      question: 'What fields do you put in a test case, and which one do junior testers most often get wrong? Show me with a SauceDemo login example.',
      whatInterviewerLooksFor: [
        'Lists the main fields (ID, title, requirement, preconditions, data, steps, expected, priority, status)',
        'Explains why preconditions and expected results matter',
        'Gives exact expected text, not "should work"',
        'Mentions atomic, independent, repeatable',
      ],
      modelAnswer: `**Fields I always include:** ID, title, linked requirement or story, preconditions, test data, numbered steps, expected result per step, priority and type (positive/negative). When I run it: actual result, status (pass/fail/blocked), bug link, build and environment.

**What juniors get wrong most:** the **expected result**. "Login should work" or "error should come" cannot be judged. Second: missing **preconditions** (which user, which page, logged in or not).

**Example:**

- **ID/Title:** TC-LOGIN-003, "Locked-out user sees lock-out error and stays on login page"
- **Requirement:** REQ-AUTH-03
- **Preconditions:** browser at saucedemo.com, logged out
- **Data:** locked_out_user / secret_sauce
- **Steps:** 1. Enter username 2. Enter password 3. Click Login
- **Expected:** banner "Epic sadface: Sorry, this user has been locked out."; URL stays on the login page; no products shown
- **Priority/type:** P1, negative

**Rules behind it:** one goal per case (atomic), no hidden need for another case to run first (independent), same data gives the same result (repeatable). Written like this, the case is also ready to automate: each step becomes an action, and each expected result becomes an assertion.`,
      followUps: [
        {
          q: 'How detailed should test steps be? Isn\'t this slow to write?',
          a: 'Match the detail to the risk and the reader. For critical, regulated or outsourced work I write full steps. For an experienced team testing a small, low-risk UI change, a scenario with clear expected results is enough. A good middle way: short steps but exact expected results, because the expected result decides pass or fail.',
        },
        {
          q: 'What is the difference between preconditions and test data?',
          a: 'Preconditions are the system state before step 1: logged out, one backpack in the cart, a feature flag switched on. Test data are the values you type or use during the steps: username, password, coupon code. Mixing them makes it hard to reuse the case with other data.',
        },
      ],
      pitfalls: [
        'Expected results like "works fine" or "error shown"',
        'No preconditions or test data',
        'One giant case testing many goals',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-02',
      difficulty: 'easy',
      question: 'For a coupon field on a checkout page, show me the difference between a test scenario, a test case and a test script.',
      whatInterviewerLooksFor: [
        'Scenario = what (one line), case = how with expected result, script = runnable',
        'One scenario becomes many cases',
        'Uses the coupon example concretely',
        'Knows when scenarios are enough',
      ],
      modelAnswer: `**Test scenario (what to test):** one line each, taken from the requirement:

- Apply a valid percentage coupon
- Apply an expired coupon
- Apply a coupon below the minimum cart value
- Apply a coupon in a different letter case or with extra spaces
- Remove an applied coupon

**Test case (how, with exact results):** one scenario becomes several exact cases. For "below minimum cart value":

- TC-CPN-03: cart 499, code MIN500 → message "Add 1 more to use this coupon", total unchanged
- TC-CPN-04: cart 500 → 5% discount applied, total 475
- TC-CPN-05: cart 501 → total 475.95

Each case has preconditions (logged in, cart built from known items), data and expected results.

**Test script (runnable order):** the same cases as an automated test. *Example:* a Playwright spec that builds the cart, types the coupon, clicks Apply and checks the total text. Or a manual procedure that runs the three cases in a fixed order.

**When I use which:** scenarios to think about coverage fast, and in teams that explore a lot. Detailed cases for high-risk rules like money. Scripts for anything repeated every release, because regression is the best thing to automate.`,
      followUps: [
        {
          q: 'Can a test scenario be run directly?',
          a: 'Yes, by an experienced tester, often in an exploratory way. The scenario says what to test, and the tester picks the details on the spot. The risk is inconsistency: two testers may pick different data and get different results. So for critical or regulated areas, I turn scenarios into exact cases.',
        },
        {
          q: 'Where do ISTQB "test conditions" fit in this picture?',
          a: 'ISTQB test conditions come out of test analysis: the "what to test". That is basically what most companies call scenarios. Test design turns conditions into test cases. Test implementation arranges them into procedures, scripts and suites.',
        },
      ],
      pitfalls: [
        'Saying a scenario and a test case are the same thing',
        'Scenarios that already contain detailed steps and data',
        'No concrete example',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-03',
      difficulty: 'medium',
      question: 'Halfway through the sprint, the PO changes the coupon minimum cart value from 500 to 750. How do your RTM and test artifacts help you react, and what exactly do you update?',
      whatInterviewerLooksFor: [
        'Uses bidirectional traceability for impact analysis',
        'Updates cases, data and automation, not just one document',
        'Tells the team the impact on estimates and regression',
        'Keeps history (versions)',
      ],
      modelAnswer: `**Step 1: find the impact with the RTM.** I open the requirement (REQ-CPN-02, minimum cart value) and follow its links forward: TC-CPN-03, 04 and 05 (boundaries 499/500/501), any end-to-end cases that use MIN500, and test data row D-05. Backward links from failed tests and open bugs show me if any existing bug is now invalid.

**Step 2: update the artifacts.**

- **Requirement:** check the story records the change (new AC text; is 750 inclusive?).
- **Test cases:** new boundaries 749 / 750 / 751; new expected totals. Save as version 2; do not overwrite history.
- **Test data:** update D-05, and the cart data that adds up to exactly 750.
- **Automation:** if Playwright reads the minimum from a data file, one change updates it. If it is hard-coded, fix it and note the problem.
- **Regression scope:** checkout totals, and any banner that says "orders above 500".

**Step 3: tell the team.** Share the estimate impact (e.g. half a day) and whether tests already run must be run again.

**Why it matters:** without traceability I would search through sheets and probably miss the banner text or a data row. The RTM turns "what does this change break?" into a quick lookup.`,
      followUps: [
        {
          q: 'What if your project has no RTM at all?',
          a: 'I would start a simple one with the highest-risk features first: a sheet, or Jira links from stories to test cases. Most test tools build the RTM for you if tests are linked to stories, so the real habit is "always link". Even partial traceability for payment and login gives most of the benefit.',
        },
        {
          q: 'How do you show requirement coverage to a manager as one number, and what is wrong with that number?',
          a: 'The percentage of requirements with at least one linked test (or with all linked tests passing). The weakness: one trivial test can mark a complex requirement as "covered". So I add risk: high-risk requirements must have a test for each rule and boundary, and I list known gaps openly.',
        },
      ],
      pitfalls: [
        'Updating only the test case and forgetting data and automation',
        'Overwriting cases with no version history',
        'Not telling anyone that tests must be run again',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-04',
      difficulty: 'medium',
      question: 'What is the difference between a test strategy and a test plan in your company, and who writes each? Be honest if your team merges them.',
      context: 'Glassdoor manual-tester interview reports frequently list "test strategy vs test plan" as a basic question.',
      whatInterviewerLooksFor: [
        'Strategy = long-lived, company/product level; plan = for one release or project',
        'Concrete content examples for each',
        'Knows the plan follows the strategy',
        'Honest about real-world practice',
      ],
      modelAnswer: `**Test strategy:** the long-term "how we test here" for a product or company. A QA manager or test architect owns it. Typical content: which test levels we use and who owns them (developers: unit; QA: system and regression; business: UAT), the automation approach (Playwright for UI, API tests in CI, smoke on every merge), environment rules, bug severity definitions and workflow, metrics, and how we handle risk.

**Test plan:** a document for one project or release that applies the strategy. A test lead or the project QA owns it. Content: scope in and out, schedule, people, environments and devices, entry, exit and suspension criteria, deliverables, and risks for this release.

| | Strategy | Plan |
|---|---|---|
| Changes | Rarely | Every release |
| Scope | Product / company | Release / feature |
| Example | "P1 flows are automated and must pass before merge" | "Coupon regression on Chrome/Safari, 15–16 Oct" |

**Honest note:** in my last team (6 people, Scrum), the strategy was a two-page Confluence page. Each release had a half-page plan in the release ticket. Small startups often merge them. What matters is that the decisions exist: scope, approach, criteria, risks.

**Order:** strategy first. Plans follow it, or write down why they differ.`,
      followUps: [
        {
          q: 'What is a test policy, and how is it different from a strategy?',
          a: 'A test policy is the top-level statement of why the company tests and what quality goals it has, e.g. "no release with known Critical bugs; never use unmasked customer data in testing". The strategy then explains how testing is usually done to meet that policy, and each plan applies the strategy to one project.',
        },
        {
          q: 'Which test plan section is most often skipped, and most often regretted?',
          a: 'Features not to be tested, together with risks and contingencies. Teams skip them because they feel negative. But they protect everyone after release: an agreed exclusion with a reason turns "QA missed it" into a known, accepted risk.',
        },
      ],
      pitfalls: [
        'Saying they are the same, with no detail',
        'Claiming the plan comes first and contains the strategy',
        'Pretending your Agile team has heavy IEEE documents when it does not',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-05',
      difficulty: 'hard',
      question: 'A developer gives you a production database dump to use as test data for a bug in the loyalty-points screen. What do you do?',
      whatInterviewerLooksFor: [
        'Sees the privacy and legal risk of unmasked personal data (PII)',
        'Knows masking, anonymisation and synthetic data',
        'Still helps reproduce the bug in a practical way',
        'Follows or creates a data-handling process',
      ],
      modelAnswer: `**First, stop and check.** A raw production dump almost surely has personal data: names, phones, emails, addresses, maybe payment tokens. Copying it to a QA server with weaker access control can break company policy and laws like GDPR or India's DPDP Act 2023. So I do not load it as it is, and I politely tell the developer why.

**Then solve the real problem: reproduce the bug.**

1. **Find what makes the data special.** For a loyalty-points bug it is probably the *shape*: a customer whose points expire today, a negative adjustment, 5,000+ transactions, a certain tier.
2. **Options, best first:**
   - **Synthetic data** that recreates that shape (a script or SQL insert), saved as a reusable dataset for regression.
   - A **masked copy** from the approved masking process (names, emails, phones replaced the same way everywhere; IDs tokenised; dates shifted), if realistic volume matters.
   - **Supervised production read access** by people allowed to see it, only to diagnose, not to test.
3. **Record the dataset** in the test data sheet, link it to the bug, and add a regression test case that uses it.

**Process fix:** if this keeps happening, propose a standard masked snapshot refreshed monthly, and a rule in the test strategy: "No unmasked production PII outside production."`,
      followUps: [
        {
          q: 'What is the difference between masking and synthetic data?',
          a: 'Masking starts from real data and replaces or scrambles the sensitive fields, but keeps the realistic structure and links. Synthetic data is made from scratch by rules or tools, so it contains no real person. Masked data is more realistic for volume and odd combinations; synthetic data is safer and easy to create for specific cases.',
        },
        {
          q: 'How do you keep masked data consistent across tables?',
          a: 'Use deterministic masking: the same original value always becomes the same masked value. So a customer ID or email masked in the orders table still matches the customers table. Random masking per row breaks those links and makes the data useless for end-to-end tests.',
        },
      ],
      pitfalls: [
        'Using the dump directly because "it is only QA"',
        'Refusing without offering another way to reproduce the bug',
        'Not knowing what masking or synthetic data means',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-06',
      difficulty: 'medium',
      question: 'You must review 40 test cases a teammate wrote for the SauceDemo cart before they are baselined. What do you look for, and how do you give feedback?',
      whatInterviewerLooksFor: [
        'A concrete checklist (traceability, expected results, negatives, preconditions, independence)',
        'Checks expected results against requirements, not current behaviour',
        'Kind, tracked feedback',
        'Thinks about automation readiness',
      ],
      modelAnswer: `**Prepare:** I read the cart stories and acceptance criteria first. Then I judge cases against the requirement, not against what today's build does.

**My checklist:**

1. **Traceability:** each case links to a story. Each cart requirement (add, remove, badge count, cart kept after logout, continue shopping, checkout button) has at least one case.
2. **Expected results:** exact and correct, e.g. "badge shows 2", not "badge updates". I check them against the AC.
3. **Negative and edge cases:** removing the last item hides the badge; adding all 6 products; cart after logout and login; checkout with an empty cart (allowed or not?).
4. **Preconditions and data:** which user, what is in the cart at the start.
5. **Independence and atomicity:** no case relies on the previous case's cart; no 20-step cases testing everything.
6. **Duplicates:** the same check written three times in different words.
7. **Priority:** P1s are really the critical path.
8. **Automation fit:** stable steps with clear checks.

**Feedback:** numbered comments in the tool, each with the case ID, the issue and a fix. *Example:* "TC-CART-012: expected 'cart updated' → state the badge count and that the item row is removed". I separate **must-fix** (wrong expected result, missing requirement) from **suggestions** (wording). A 15-minute walkthrough handles the big items. Cases are baselined once must-fix items are closed.

**Bonus:** I note patterns (e.g. "negative cases often missing") for the team checklist, so the process improves, not just these 40 cases.`,
      followUps: [
        {
          q: 'You find that 10 of the 40 cases copy their expected results from the current build. Why is that a problem?',
          a: 'Then the tests confirm whatever the software does, bugs included. If the build shows the wrong badge count, the case "passes" while the requirement fails. Expected results must come from the test basis (requirements, ACs, or a rule like a pricing formula). If the requirement is unclear, ask the PO; do not copy the screen.',
        },
        {
          q: 'How long should a review like this take, and how do you stop it becoming a bottleneck?',
          a: 'About one to two hours for 40 cases, depending on complexity. To avoid a bottleneck: review small batches as cases are written, use a shared checklist so authors check their own work first, and time-box the walkthrough. Reviewing high-risk cases deeply and low-risk ones quickly is fine too.',
        },
      ],
      pitfalls: [
        'Only checking spelling and formatting',
        'Checking expected results against the build instead of the requirement',
        'Spoken feedback with no tracking or follow-up',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-07',
      difficulty: 'hard',
      question: 'Your team is starting Playwright automation. Once a case is automated, should you keep maintaining the manual test case in Xray or TestRail? How would you connect the two?',
      whatInterviewerLooksFor: [
        'Avoids duplicate work but keeps traceability',
        'Knows how to link automated tests to case IDs and import results',
        'Knows what stays manual (exploratory, usability)',
        'Gives a practical migration plan',
      ],
      modelAnswer: `**Short answer:** keep one source of truth for *traceability and reporting*, but do not maintain two detailed copies of the same steps.

**How I connect them:**

1. **Mark the case as automated** in the tool (a field or label like "automation status: automated"). Keep its ID, title, requirement link and expected behaviour. The detailed manual steps can be cut, because the spec file is now the procedure.
2. **Put the ID in the Playwright test**, e.g. in the title ("TC-LOGIN-003 locked user sees error") or as an annotation. Anyone can then jump from a failing CI test to the requirement.
3. **Import results:** CI produces JUnit XML (Playwright has a JUnit reporter). Xray or TestRail imports it through the API, so each run becomes a Test Execution or Test Run. The RTM then shows manual and automated results together.
4. **Keep manual what should be manual:** exploratory charters, usability, one-off checks, visual judgement. They stay as manual cases or charters in the same tool.

**Migration plan:** automate smoke and the most valuable regression first, and link as you go. Each week, check that every new case is automated, intentionally manual, or a candidate.

**Why it matters:** managers still ask "is REQ-AUTH-03 tested on this build?". If automation lives only in Git and manual results only in Xray, nobody can answer quickly.`,
      followUps: [
        {
          q: 'An automated test fails in CI. Where should the bug be logged and linked?',
          a: 'First triage: is it a product bug, a test bug or an environment problem? For a product bug, log it in Jira with the CI run link, trace, screenshot and test case ID, and link it to the imported Test Execution, so the RTM shows the requirement failing. Test or environment problems go to the automation backlog, so they do not inflate product bug counts.',
        },
        {
          q: 'Which test cases would you NOT automate?',
          a: 'Cases that run rarely, change all the time, need human judgement (look and feel, usability), are hard to make stable (third-party CAPTCHAs, physical devices), or cost more to automate and maintain than to run by hand. Exploratory testing stays human by definition.',
        },
      ],
      pitfalls: [
        'Maintaining full manual steps and code side by side forever',
        'Dropping the test management tool, so traceability disappears',
        'Saying everything should be automated',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-test-artifacts-drill-1',
      question: 'Build forward and backward traceability for these 4 SauceDemo requirements and 7 test cases, then list every gap. Requirements: R1 user can log in with valid credentials; R2 locked-out user cannot log in; R3 cart badge shows the number of items; R4 user can sort products by price low→high. Tests: T1 valid login standard_user; T2 login with Enter key; T3 locked_out_user error; T4 badge shows 1 after adding backpack; T5 badge hidden after removing last item; T6 product images load for problem_user; T7 sort Name Z→A.',
      assumptions: [
        'A test covers a requirement only if it checks that requirement\'s rule.',
        'Forward = requirement → tests; backward = test → requirement.',
      ],
      steps: [
        { label: 'Forward R1', calc: 'T1, T2 → covered' },
        { label: 'Forward R2', calc: 'T3 → covered' },
        { label: 'Forward R3', calc: 'T4, T5 → covered' },
        { label: 'Forward R4', calc: 'No test sorts by price low→high (T7 sorts by name) → GAP' },
        { label: 'Backward T6', calc: 'Product images for problem_user → no requirement → orphan (missing requirement, or old test?)' },
        { label: 'Backward T7', calc: 'Sort Name Z→A → no matching requirement (R4 is about price) → orphan / missing requirement' },
        { label: 'Coverage', calc: '3 of 4 requirements covered = 75%' },
      ],
      answer: 'Forward gap: R4 (price sort) has no test. Backward findings: T6 and T7 link to no requirement. Coverage 3/4 = 75%. Actions: write a price-sort test for R4; ask the PO if name sorting and image loading are real requirements to add (or if T6/T7 are out of date).',
      insight: 'A test that looks related (T7 sorts products) can still miss the requirement (price, not name). Traceability forces you to check the rule, not just the feature area.',
      followUps: [
        {
          q: 'R3 is "covered" by two tests. Is it fully covered?',
          a: 'Not necessarily. T4 and T5 check 1 item and 0 items, but not several items, all six products, or whether the badge stays after logout and login. Counting links gives a minimum only. Real coverage depends on the rule\'s groups and boundaries, so high-risk requirements need a deeper look than "has a test".',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-drill-2',
      question: 'Estimate the manual effort to system-test the coupon feature: 5 scenarios that become 42 test cases, 2 testers, and a regression suite of 54 cases. Plan writing, review, data setup, one execution cycle, one retest/regression cycle and reporting. Is 8 working days enough?',
      assumptions: [
        'Writing: 20 min per case; review: 5 min per case.',
        'Data setup: 3 hours once.',
        'Execution: 10 min per new case; regression: 6 min per case.',
        'Expect 15% of new cases to fail and need a retest at 10 min each.',
        'Reporting and meetings: 1 hour per tester per day.',
        'Each tester has 8 hours/day.',
      ],
      steps: [
        { label: 'Writing', calc: '42 × 20 min = 840 min = 14 h' },
        { label: 'Review', calc: '42 × 5 min = 210 min = 3.5 h' },
        { label: 'Data setup', calc: '3 h' },
        { label: 'Execution (new cases)', calc: '42 × 10 min = 420 min = 7 h' },
        { label: 'Retest failures', calc: '15% × 42 ≈ 6 cases × 10 min = 1 h' },
        { label: 'Regression', calc: '54 × 6 min = 324 min = 5.4 h' },
        { label: 'Hands-on total', calc: '14 + 3.5 + 3 + 7 + 1 + 5.4 = 33.9 h' },
        { label: 'Capacity', calc: '2 testers × 8 days × (8 − 1 h overhead) = 112 h' },
      ],
      answer: 'About 34 hours of hands-on work against about 112 available hours, so 8 days is plenty for one cycle. Use the spare ~78 h for exploratory sessions on the discount maths, cross-browser runs and a buffer for a second build.',
      insight: 'Splitting effort into a rate per artifact makes the estimate easy to defend, and shows where time really goes. Here, writing cases is ~40% of hands-on effort: a strong reason to reuse and automate cases.',
      followUps: [
        {
          q: 'The PO cuts the window to 3 days. What do you drop or change first?',
          a: 'Capacity becomes 2 × 3 × 7 = 42 h. That is still above 34 h, but with no buffer. I would write high-risk cases in full and low-risk ones as scenarios (less writing time), run the P1 regression subset first, and agree with the PO which browsers to postpone. I would also warn that a second build with fixes would not fit.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-drill-3',
      question: 'Review this test case, list every defect in it, then write the corrected version: "TC-12 | Title: Sorting | Pre: none | Steps: 1. Login 2. Sort products 3. Check | Expected: Products sorted | Priority: — | Req: —".',
      assumptions: [
        'Target is SauceDemo inventory sorting (Name A→Z, Name Z→A, Price low→high, Price high→low).',
        'Products include Sauce Labs Onesie ($7.99, cheapest) and Sauce Labs Fleece Jacket ($49.99, most expensive).',
      ],
      steps: [
        { label: 'Title', calc: 'Vague; does not say which sort option → name the goal' },
        { label: 'Preconditions', calc: '"none" is wrong: it needs a logged-in user on /inventory.html' },
        { label: 'Data', calc: 'Missing user/password and which sort option' },
        { label: 'Steps', calc: '"Sort products" and "Check" are not clear actions; name the dropdown and the option' },
        { label: 'Expected', calc: '"Products sorted" cannot be checked; state the first and last item and the order rule' },
        { label: 'Priority & requirement', calc: 'Missing → cannot pick it for suites or trace it' },
        { label: 'Atomicity', calc: 'Four sort options hidden in one case → one case per option (or data-driven)' },
      ],
      answer: `Corrected: **TC-INV-012 Price (low to high) sorts cheapest first** | Req: REQ-INV-04 | P2 | Pre: logged in as standard_user, on /inventory.html | Steps: 1. Open sort dropdown 2. Select "Price (low to high)" | Expected: first item "Sauce Labs Onesie" $7.99, last item "Sauce Labs Fleece Jacket" $49.99, each price ≥ the previous one. Repeat as a data-driven case for the other three options.`,
      insight: 'Seven defects in a five-line test case is normal for testware nobody reviewed. That is exactly why test case reviews are part of static testing.',
      followUps: [
        {
          q: 'Why check "each price ≥ the previous one", not just the first and last items?',
          a: 'The first and last can be right while the middle is wrong, e.g. two items swapped because prices were compared as text ("15.99" vs "9.99"). Checking the whole order is the real rule. In Playwright later, you collect all prices into an array and compare it with a sorted copy.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-test-artifacts-mcq-01',
      difficulty: 'easy',
      question: 'Which of these is a test SCENARIO, not a detailed test case?',
      options: [
        'Verify a user can complete checkout with valid shipping details',
        'Login as standard_user, add backpack, enter "Asha/Rao/560001", Finish; expect "Thank you for your order!"',
        'Enter MIN500 on a 499 cart; expect "Add 1 more to use this coupon"',
        'Leave postal code empty, click Continue; expect "Error: Postal Code is required"',
      ],
      correct: [0],
      explanation: `A scenario is one line saying WHAT to test, with no exact data, steps or expected values. The other three options have specific data, steps and exact expected results, so they are test cases. Later, a scenario is expanded into several such cases.`,
      followUps: [
        {
          q: 'Expand that scenario into three test cases, briefly.',
          a: 'One: valid details with one item completes the order and shows the thank-you page. Two: valid details with all six items shows the right item total, tax and total on the overview. Three: a postal code with letters and spaces (e.g. "SW1A 1AA") is accepted, if the requirement allows international formats.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-02',
      difficulty: 'easy',
      question: 'Which expected result is written BEST?',
      options: [
        'Login should work properly',
        'User is logged in successfully and everything looks fine',
        'URL ends with /inventory.html and the heading "Products" is visible',
        'No errors should come after login',
      ],
      correct: [2],
      explanation: `A good expected result is exact and visible, so two testers always agree on pass or fail. Option C names an exact URL and visible text. The others are opinions ("properly", "looks fine") or only negative ("no errors"). A broken blank page with no errors would also "pass" those.`,
      followUps: [
        {
          q: 'How would this expected result turn into automation later?',
          a: 'Directly into web-first assertions: one checks the page URL matches /inventory.html, and one checks the "Products" heading is visible. Exact manual expected results become reliable automated assertions with almost no extra work.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-03',
      difficulty: 'easy',
      question: 'Which type of traceability helps you find test cases that no longer belong to any requirement?',
      options: ['Forward traceability', 'Backward traceability', 'Horizontal traceability', 'Vertical code coverage'],
      correct: [1],
      explanation: `Backward traceability goes from a test case back to its requirement, so it finds orphan tests (for removed features, or extras nobody asked for). Forward traceability (requirement → tests) finds untested requirements instead. "Horizontal traceability" and code coverage are not the answer here; they are distractors.`,
      followUps: [
        {
          q: 'You find 12 orphan tests. Do you delete them?',
          a: 'Not at once. For each one, ask: is a requirement missing (behaviour users rely on, like password masking), or was the feature removed? Add the requirement where the behaviour is still wanted, retire tests for removed features, and record the decision. The suite stays lean and nothing important is silently dropped.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-04',
      difficulty: 'medium',
      question: 'Look at this RTM extract. Which conclusion is correct?',
      code: {
        language: 'text',
        title: 'RTM extract',
        code: `REQ      Tests              Status
REQ-01   TC-01, TC-02       Pass, Pass
REQ-02   TC-03              Fail (BUG-17 open)
REQ-03   -                  -
(none)   TC-09              Pass`,
      },
      options: [
        'Requirement coverage is 100% because every row has a status',
        'REQ-03 is a coverage gap and TC-09 is an orphan test',
        'REQ-02 is satisfied because it has a test',
        'TC-09 proves REQ-03 is implemented',
      ],
      correct: [1],
      explanation: `REQ-03 has no linked test, so it is untested (forward gap). TC-09 links to no requirement (backward finding). Coverage is 2 of 3 requirements. REQ-02 has a test, but it fails with an open bug, so it is not met. TC-09 cannot prove REQ-03, because they are not linked.`,
      followUps: [
        {
          q: 'How would you report this RTM to the PO in two lines?',
          a: '"2 of 3 requirements tested (67%). REQ-01 passing; REQ-02 failing due to BUG-17 (Major, fix due Thursday); REQ-03 not yet tested, cases being written today. One extra test (TC-09) needs a requirement decision from you." Short, with numbers, and with an action for the reader.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-05',
      difficulty: 'medium',
      question: 'Select ALL sections that belong to an IEEE 829 test plan.',
      options: [
        'Features not to be tested',
        'Suspension criteria and resumption requirements',
        'Root cause analysis of production incidents',
        'Risks and contingencies',
        'Unit test source code',
      ],
      correct: [0, 1, 3],
      explanation: `An IEEE 829 test plan includes features not to be tested, suspension/resumption requirements, and risks and contingencies (plus test items, approach, pass/fail criteria, deliverables, schedule and approvals). Root cause analysis belongs to defect management after incidents. Unit test code is a development artifact, not a plan section.`,
      followUps: [
        {
          q: 'What are suspension criteria for? Give one example.',
          a: 'They say when to pause testing, because going on would waste effort or give unreliable results. Resumption requirements say what must happen to restart. Example: suspend if the login service is down for over 2 hours, or a Blocker stops over 30% of cases; resume when a new build passes the smoke suite.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-06',
      difficulty: 'medium',
      question: 'Which statement best describes the difference between a test strategy and a test plan?',
      options: [
        'The strategy is written per sprint; the plan is written once for the whole company',
        'The strategy is a long-lived, general approach; the plan applies it to a specific project or release',
        'The plan lists test cases; the strategy lists defects',
        'They are identical documents with different names',
      ],
      correct: [1],
      explanation: `A test strategy is the general, stable approach to testing for a company or product. A test plan applies it to one project or release, with scope, schedule, people and criteria. Option A swaps their lifetimes. Plans do not just list test cases. Small teams may merge the documents, but the ideas are different.`,
      followUps: [
        {
          q: 'Give one statement that belongs in the strategy and one in the plan.',
          a: 'Strategy: "All P1 user journeys are automated with Playwright and must pass in CI before merge." Plan: "Release 3.3 coupon regression runs 15–16 Oct on Chrome and Safari by Priya and Arjun; payment gateway internals are out of scope."',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-07',
      difficulty: 'medium',
      question: 'Select ALL problems in this test case.',
      code: {
        language: 'text',
        title: 'TC-CART-03',
        code: `Title: Cart test
Preconditions: -
Steps: 1. Add items 2. Remove items 3. Checkout 4. Logout and login
Expected: Cart works`,
      },
      options: [
        'It is not atomic: several objectives in one case',
        'The expected result is not observable or specific',
        'Preconditions and test data are missing',
        'It has too many expected results',
        'It is linked to too many requirements',
      ],
      correct: [0, 1, 2],
      explanation: `The case mixes adding, removing, checkout and staying logged in (not atomic). "Cart works" cannot be judged. There is no starting state or data (which user, which items). It has too FEW expected results, not too many. And it links to no requirement at all, not too many.`,
      followUps: [
        {
          q: 'Which single case would you pull out of it first, and why?',
          a: 'Cart kept after logout and login. It is the least obvious behaviour, often missed by developers, and easy to state exactly: "Add backpack, log out, log in as the same user; badge shows 1 and the backpack is in /cart.html." Add and remove deserve their own simple cases too.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL good practices for test data in a shared QA environment.',
      options: [
        'Give each tester or automated worker its own accounts or records',
        'Load an unmasked production copy for realism',
        'Include boundary and invalid values, not just happy-path data',
        'Plan cleanup or reset so the next run starts from a known state',
        'Reuse one "test1" account for everyone to save setup time',
      ],
      correct: [0, 2, 3],
      explanation: `Separate data per tester or worker stops tests interfering. Boundary and invalid values find bugs that happy-path data cannot. Cleanup keeps runs repeatable. Unmasked production copies risk privacy breaches. One shared account makes tests break each other's state.`,
      followUps: [
        {
          q: 'Why does separate data matter even more when Playwright tests run in parallel?',
          a: 'Parallel workers run at the same time. If two tests use the same account, one may empty the cart while the other checks it, causing random failures (flakiness). Unique data per test or worker makes each test independent, which is the basis for running safely with many workers.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-09',
      difficulty: 'hard',
      question: 'The PO changes REQ-CPN-02 (minimum cart value). Which artifact tells you most directly which test cases, data and bugs are affected?',
      options: [
        'The test summary report from last release',
        'A bidirectional requirements traceability matrix',
        'The test strategy document',
        'The defect life cycle diagram',
      ],
      correct: [1],
      explanation: `A bidirectional RTM links each requirement to its tests, results and bugs. Following REQ-CPN-02 gives the affected cases and bugs at once: that is impact analysis. Last release's summary report is history, the strategy is too general, and the defect life cycle only shows bug states.`,
      followUps: [
        {
          q: 'Besides test cases, what else might need updating after this change?',
          a: 'Test data rows that build carts at the old boundary, automated tests that hard-code the old value, documents or UI text that mention the limit, and the sprint estimate. Bugs raised against the old rule may also need rechecking, or closing as "no longer valid".',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-10',
      difficulty: 'hard',
      question: 'Read this test plan excerpt. Which missing section creates the biggest risk of blame after release?',
      code: {
        language: 'text',
        title: 'Test plan TP-12 (excerpt)',
        code: `Scope: Checkout, cart, coupons
Approach: risk-based, 60 cases + 2 exploratory sessions
Environments: Chrome, Safari
Schedule: 9-15 Oct
Exit: 0 open Critical; 100% executed`,
      },
      options: [
        'Features not to be tested (with reasons)',
        'Test plan identifier',
        'Glossary of terms',
        'Approvals page layout',
      ],
      correct: [0],
      explanation: `If the plan does not say what is out of scope (e.g. Firefox, native apps, payment gateway internals) and why, any bug found there after release looks like a QA miss. Written exclusions turn gaps into agreed risks. An identifier, glossary or approvals layout are useful housekeeping, but they do not prevent that argument.`,
      followUps: [
        {
          q: 'What other important part is missing from this excerpt?',
          a: 'Risks and contingencies, entry criteria, suspension/resumption criteria, and responsibilities. For example, there is no plan if the environment is down for a day or a tester is on leave, and no rule for when to reject a broken build.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-11',
      difficulty: 'hard',
      question: 'In Jira with Xray, which object records that a set of tests was run on a specific build and environment, with a result for each test?',
      options: ['Test Set', 'Test Plan', 'Test Execution', 'Precondition'],
      correct: [2],
      explanation: `In Xray, a Test Execution holds the test runs (a result per test) for one build or environment. A Test Set is only a group of tests. A Test Plan tracks which tests are planned for a release and collects executions. A Precondition is a reusable starting state linked to tests.`,
      followUps: [
        {
          q: 'How would automated Playwright results get into Xray?',
          a: 'Turn on Playwright\'s JUnit reporter in CI, then call Xray\'s import API (or use a CI plugin) to upload the XML. This creates or updates a Test Execution. If test titles or annotations include the Xray test keys, results map to the existing tests and coverage updates automatically.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-12',
      difficulty: 'medium',
      question: 'A teammate wrote expected results by copying what the current build shows. Why is this a problem in test case review?',
      options: [
        'It makes test cases too long to read',
        'Tests will then confirm existing bugs instead of the requirement',
        'Test management tools cannot store copied text',
        'It violates the IEEE 829 formatting rules',
      ],
      correct: [1],
      explanation: `Expected results must come from the test basis (requirements, acceptance criteria or another trusted source). Copying today's behaviour builds any existing bug into the expected result, so the test passes on wrong behaviour. Length, tool storage and formatting rules have nothing to do with this core problem.`,
      followUps: [
        {
          q: 'The requirement says nothing about the expected behaviour. What do you write?',
          a: 'I do not guess or copy. I ask the PO or BA, mark the case "expected result pending clarification", and if I must run it, I record what I saw as an observation, not a pass. The answer then updates both the requirement and the test case.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL features of a well-written test case.',
      options: [
        'Has a single clear objective',
        'Can be run without depending on another case having run first',
        'Uses words like "should work properly" so it stays flexible',
        'States exact test data and preconditions',
        'Combines happy path and all negatives to save time',
      ],
      correct: [0, 1, 3],
      explanation: `Good test cases are atomic, independent and repeatable, with exact data and preconditions. Vague words make pass/fail a matter of opinion; they do not make a case "flexible". Mixing happy and negative paths makes a failure unclear, and the case hard to maintain or automate.`,
      followUps: [
        {
          q: 'When is it OK for one case to depend on another?',
          a: 'In a clearly ordered end-to-end procedure (e.g. create a booking, then cancel it), if the dependency is written in the preconditions and the suite runs them in order. Even then, it is better to create the needed state directly (through an API or seeded data), so each case can run alone.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-14',
      difficulty: 'expert',
      question: 'Your manager reports "requirement coverage 100%" from the RTM, yet a serious coupon-stacking bug reached production. Which explanation is MOST likely?',
      code: {
        language: 'text',
        title: 'RTM row',
        code: `REQ-CPN-04  "Only one coupon per order; second coupon
             replaces the first, never stacks"
Tests:      TC-CPN-11  "Apply SAVE10 -> discount shown"   Pass`,
      },
      options: [
        'The RTM tool calculated the percentage incorrectly',
        'The linked test does not exercise the rule; link-based coverage hid the gap',
        'Coupon stacking cannot be tested manually',
        'The requirement was out of scope, so coverage is still valid',
      ],
      correct: [1],
      explanation: `TC-CPN-11 applies one coupon and never tries a second, so the stacking rule was never tested, even though the requirement shows as "covered". Link-based coverage counts links, not rules. The tool maths is fine, stacking is easy to test by hand, and the requirement is clearly in scope.`,
      followUps: [
        {
          q: 'How do you prevent this kind of false coverage?',
          a: 'Check the links in test case review ("does this test really check the rule?"). Split complex requirements into separate testable conditions in the RTM. For high-risk requirements, require at least one test per rule and boundary. And every escaped bug should trigger a check of why the linked tests missed it.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL changes that make test artifacts easier to automate later with Playwright.',
      options: [
        'Each step has one action and one observable expected result',
        'Test case IDs are stable and can be referenced from test titles',
        'Test data is kept in a separate data sheet rather than buried in step text',
        'Steps say "check the page looks right"',
        'Cases rely on the order in which a tester happens to run them',
      ],
      correct: [0, 1, 2],
      explanation: `One action plus one visible result maps straight to an action plus a web-first assertion. Stable IDs let automated results link back to the RTM. Separate data allows data-driven tests. "Looks right" cannot be asserted, and hidden order dependencies break when tests run in parallel.`,
      followUps: [
        {
          q: 'What would you do with a case that really needs "looks right" judgement?',
          a: 'Either keep it manual (usability, visual polish) or make it checkable: specific elements visible, a layout change at a breakpoint, or a screenshot compared with an approved baseline, which Playwright supports with visual comparisons. The key is a clear, objective pass/fail rule.',
        },
      ],
    },
  ],
};

export default topic;
