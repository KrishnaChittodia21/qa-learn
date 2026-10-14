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
    'Scenario = WHAT to test (one line, "verify checkout with valid details"); test case = HOW (preconditions, steps, data, expected result); script = executable/automated version.',
    'Core test case fields: ID, title, requirement link, preconditions, test data, steps, expected result per step, priority, type; actual result + status at execution.',
    'A good test case is atomic (one objective), independent, repeatable, has ONE clear expected result per check, and is understandable by a new joiner.',
    'Test data: prepare it up front, cover boundaries and invalid classes, never use real PII unmasked; prefer synthetic or masked data; reset state between runs.',
    'Test suite = a named collection of cases run together (smoke, regression, feature, sprint); suites get re-planned, not copied blindly.',
    'IEEE 829 test plan: identifier, introduction, test items, features to / not to be tested, approach, pass/fail criteria, suspension/resumption, deliverables, tasks, environment, responsibilities, staffing, schedule, risks, approvals.',
    'Test strategy = organisation/product-level, long-lived "how we test"; test plan = project/release-level "what, when, who, with what" that applies the strategy.',
    'RTM: forward (requirement → tests, finds untested requirements), backward (test → requirement, finds orphan/gold-plated tests), bidirectional (both; supports impact analysis).',
    'Review test cases with a checklist: traceable, correct expected results, preconditions, data, negative and boundary coverage, no duplicates.',
    'Tools: Jira + Xray (Test, Precondition, Test Set, Test Plan, Test Execution issue types), Zephyr Scale (cases, cycles, plans), TestRail (suites/sections, runs, milestones).',
  ],
  sections: [
    {
      heading: 'Test scenario vs test case vs test script',
      body: `**Intuition:** a scenario is the chapter title ("Pay for an order"), a test case is the recipe with exact quantities and steps, and a test script is the recipe turned into a machine that cooks it for you.

| Artifact | Answers | Level of detail | Example (SauceDemo) |
|---|---|---|---|
| **Test scenario** (test condition) | *What* should we test? | One line, high level | Verify a user can complete checkout with valid details |
| **Test case** | *How* exactly do we test it, and what should happen? | Preconditions, data, steps, expected results | TC-CHK-004: logged in as standard_user, backpack in cart, enter "Asha / Rao / 560001", Continue, Finish → "Thank you for your order!" |
| **Test script / procedure** | In what order do we execute (often automated)? | Step sequence or code | A Playwright spec or a manual procedure chaining TC-CHK-001..006 |

One scenario usually expands into **several** test cases (positive, negative, boundary). The ISTQB vocabulary is slightly different: *test conditions* come from **test analysis** (what), *test cases* from **test design** (how), and *test procedures/scripts* from **test implementation**.

**When to use which:**

- Early, under time pressure, or in exploratory-heavy teams: scenarios plus charters.
- For regulated, high-risk or handed-over work: detailed test cases.
- For anything run every sprint: automate into scripts (your Playwright future).

**Interview tip:** when asked "write test cases for X", start by listing **scenarios** out loud (shows coverage thinking), then detail two or three into full test cases (shows rigour).`,
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
        'Scenario = what; case = how + expected result; script = executable sequence.',
        'One scenario → many test cases.',
        'Interviewers like scenario lists first, then a few detailed cases.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 test analysis/design/implementation; Guru99 — Test scenario vs test case',
    },
    {
      heading: 'Anatomy of a great test case',
      body: `**Intuition:** write every test case as if you will be on leave tomorrow and a new joiner must run it without asking you a single question.

| Field | Purpose | Weak | Strong |
|---|---|---|---|
| **ID** | Unique reference for RTM, defects, automation | 1 | TC-LOGIN-003 |
| **Title** | Intent in one line | Login test | Locked-out user sees lock-out error and stays on login page |
| **Requirement / story** | Traceability | — | REQ-AUTH-02 / SHOP-118 |
| **Preconditions** | State before step 1 | — | On https://www.saucedemo.com, logged out, cookies cleared |
| **Test data** | Exact values | valid user | Username locked_out_user, password secret_sauce |
| **Steps** | Numbered, one action each | Login and check | 1. Enter username 2. Enter password 3. Click Login |
| **Expected result** | Observable, specific outcome | Error shown | Red banner "Epic sadface: Sorry, this user has been locked out."; URL unchanged |
| **Priority / type** | Selection for smoke/regression | — | P1, Functional, Negative |
| **Actual result / status** | Filled at execution | — | Pass / Fail (defect id) / Blocked (reason) |
| **Author, date, version** | Ownership and history | — | Priya, 2026-10-14, v2 |

**Qualities to aim for:**

- **Atomic:** one objective per case; if the title contains "and", consider splitting.
- **Independent:** does not rely on another case having run first (or states it in preconditions).
- **Repeatable:** same data and state give the same result; include cleanup if state changes.
- **Specific expected result:** exact text, value or state. Myers stressed long ago that a necessary part of every test case is the definition of the expected output; without it, testers "see what they want to see".
- **Traceable and prioritised:** links to a requirement and has a priority for suite selection.

**Common mistake:** "Expected: should work properly." A failing system can also "work" in someone's opinion.`,
      keyPoints: [
        'Preconditions + exact data + specific expected result = a repeatable test.',
        'Atomic and independent cases are easier to automate later.',
        'Every expected result must be observable and unambiguous.',
      ],
      source: 'Glenford Myers — The Art of Software Testing, Ch 2 (expected output principle); Guru99 — How to write test cases; ISTQB CTFL v4.0.1 — 1.4.3 Testware',
    },
    {
      heading: 'Worked example: SauceDemo login test cases',
      body: `**Feature:** SauceDemo login (https://www.saucedemo.com). All accepted users share the password **secret_sauce**: standard_user, locked_out_user, problem_user, performance_glitch_user, error_user, visual_user. A successful login lands on **/inventory.html** with the heading **Products**.

**Scenarios first:** valid login; invalid password; unknown user; empty fields; locked-out user; case sensitivity; slow user; logout and back button; keyboard (Enter) submit; error banner can be dismissed.

Below are six full test cases written with the template from the previous section. Note how each expected result quotes exact text or a URL, so a tester (or a future Playwright assertion) can decide pass/fail without debate.`,
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
        'Positive and negative cases, each with a priority and requirement link.',
        'Post-conditions keep cases independent (log out after a successful login).',
      ],
      source: 'Sauce Labs — SauceDemo demo site (users and error messages observed on www.saucedemo.com)',
    },
    {
      heading: 'Test data: preparation, masking, synthetic and boundary data',
      body: `**Intuition:** test data is the ingredient list. The best recipe fails if you only ever cook with the same three ingredients, or if you steal ingredients from a customer's fridge.

**Kinds of test data you need for any feature:**

| Kind | Purpose | Coupon field example |
|---|---|---|
| Valid / happy path | Prove the main flow works | SAVE10 on a 1,000 cart |
| Invalid classes | Prove validation and errors | Unknown code, expired, already used, wrong case |
| Boundary values | Catch off-by-one bugs | Cart at 499, 500, 501 when minimum is 500 |
| Special / edge | Robustness | Leading/trailing spaces, emoji, 255 characters, SQL-like text |
| State-dependent | Lifecycle rules | Coupon used once already; coupon that expires at midnight |
| Volume | Performance awareness | 50 items in cart; 10,000 coupons in DB |

**Where data comes from:**

- **Synthetic (generated):** created by scripts or libraries (later: Faker in your Playwright framework). Safe, unlimited, but may miss real-world weirdness.
- **Masked / anonymised production copy:** realistic distributions, but personal fields (names, phones, emails, card numbers, Aadhaar/SSN) must be **masked or tokenised** first. Privacy laws such as GDPR and India's DPDP Act 2023 make careless use of real customer data a serious issue.
- **Hand-crafted:** small, precise sets for boundaries and specific rules.

**Preparation checklist:** list data needs during test design (ISTQB "test data requirements"), create it during implementation, document where it lives, make it **unique per run** where tests create records, and plan **cleanup/reset** so the next run starts clean.

**Common mistake:** every tester sharing one account ("test1"), so one person's cart changes break another's test. Give each tester or automated worker its own data.`,
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
        'Plan data per equivalence class and boundary, not just happy path.',
        'Never use unmasked production PII; prefer synthetic or masked data.',
        'Isolate data per tester/worker and plan cleanup.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 test design (test data requirements) and implementation; Guru99 — Test data generation',
    },
    {
      heading: 'Test suites: organising cases for execution',
      body: `**Intuition:** a test suite is a playlist: the same songs (test cases) can appear in several playlists depending on the occasion.

A **test suite** is a named collection of test cases (or procedures) executed together. Typical suites:

| Suite | Contents | When run | SauceDemo size (example) |
|---|---|---|---|
| **Smoke** | Critical path, one case per major feature | Every new build | 10–15 cases: login, add to cart, checkout complete, logout |
| **Feature / sprint** | All cases for new stories | When stories are ready | e.g. 42 cases for coupons |
| **Regression** | Previously passing cases for existing behaviour, prioritised | Before release, after significant change | 150–300 cases |
| **Sanity** | Narrow checks around a fix or change | After a hotfix | 5–10 cases |
| **Browser/device** | Subset rerun per platform | Per release | P1 cases on Safari, Firefox, mobile |

**Organising tips:**

- Group by **feature/module** in the repository (Login, Inventory, Cart, Checkout), then **tag** cases (smoke, regression, P1) so suites are filtered views, not copies. Copies drift apart.
- Order cases inside a suite to respect data flow but keep each case **independent**.
- Review suites every few sprints: remove obsolete cases, add one for every escaped defect.

This maps directly to Playwright later: folders by feature, **tags** like @smoke, and running a subset with a grep filter.`,
      keyPoints: [
        'Suites are selections for a purpose; the same case can belong to several suites.',
        'Use tags/filters instead of duplicating cases.',
        'Maintain suites; add cases for escaped defects.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 test implementation (test procedures assembled into test suites); TestRail documentation — suites and sections',
    },
    {
      heading: 'The test plan (IEEE 829 and ISO/IEC/IEEE 29119-3)',
      body: `**Intuition:** a test plan is the trip itinerary: where we are going (scope), what we skip, how we travel (approach), who drives, when we leave and arrive, and what we do if it rains (risks).

**IEEE 829-1998** (the classic outline many companies still copy) has 16 sections:

| # | Section | # | Section |
|---|---|---|---|
| 1 | Test plan identifier | 9 | Test deliverables |
| 2 | Introduction (scope, references) | 10 | Testing tasks |
| 3 | Test items (what build/versions) | 11 | Environmental needs |
| 4 | Features to be tested | 12 | Responsibilities |
| 5 | Features not to be tested (and why) | 13 | Staffing and training needs |
| 6 | Approach | 14 | Schedule |
| 7 | Item pass/fail criteria | 15 | Risks and contingencies |
| 8 | Suspension criteria and resumption requirements | 16 | Approvals |

IEEE 829 has been superseded by **ISO/IEC/IEEE 29119-3**, and the ISTQB v4.0 lists typical plan content as: context (scope, objectives, test basis), assumptions and constraints, stakeholders, communication, risk register, test approach (levels, types, techniques, deliverables, entry/exit criteria, independence, metrics, data and environment needs), budget and schedule.

**Why "features not to be tested" matters:** stating exclusions (and why) is how you avoid "why did QA not test this?" after release. It turns a silent gap into an agreed risk.

**Agile reality:** many teams keep a one- or two-page release test plan in Confluence plus a long-lived test strategy. The headings still matter; the length does not.`,
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
        'Know the IEEE 829 headings; know that ISO 29119-3 replaced it.',
        'Out-of-scope items and suspension criteria are what interviewers probe.',
        'In Agile, keep the plan short but keep the decisions.',
      ],
      source: 'IEEE 829-1998 test plan outline; ISO/IEC/IEEE 29119-3; ISTQB CTFL v4.0.1 — 5.1.1 Purpose and Content of a Test Plan',
    },
    {
      heading: 'Test strategy vs test plan',
      body: `**Intuition:** the strategy is the company's travel policy ("always book refundable fares, economy under 6 hours"); the plan is this specific trip's itinerary that follows the policy.

| | Test strategy | Test plan |
|---|---|---|
| Level | Organisation, product or programme | Project, release or test level |
| Lifetime | Long-lived, changes rarely | Per release/project, updated often |
| Answers | *How do we generally test here?* | *What, when, who, with what, for this release?* |
| Typical content | Test levels and types used, automation approach and tools, environments policy, defect management process, metrics, standards, risk approach | Scope in/out, schedule, resources, specific environments, entry/exit criteria, risks for this release, deliverables |
| Owner | QA manager / test architect | Test lead / QA for the project |
| Example statement | "All P1 flows are automated with Playwright and run on every merge" | "Coupon feature regression runs 16–17 Oct on Chrome/Safari by Priya and Arjun" |

Some organisations also have a **test policy** above the strategy (why we test, quality goals), and in small Agile teams the strategy and plan are sometimes merged into one page. Say that honestly in an interview; the distinction is about *scope and lifetime*, not about document names.

**Common mistake:** "the test plan is created first and the strategy is part of it". In the ISTQB view the plan *applies* (or explains deviations from) the existing strategy. Where a plan contains an "approach" section, that is the project-specific slice of the strategy.`,
      keyPoints: [
        'Strategy = general, long-lived; plan = specific, per release.',
        'The plan follows the strategy or documents why it deviates.',
        'Small teams may merge them; the distinction is scope and lifetime.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 5.1.1 (plan adheres to test policy and strategy); Software Testing Help — Test plan vs test strategy',
    },
    {
      heading: 'Requirements Traceability Matrix (RTM)',
      body: `**Intuition:** an RTM is a two-way address book between requirements and tests. Pick a requirement and you can find every test that covers it; pick a test and you can find why it exists.

**Definition.** A Requirements Traceability Matrix maps each requirement (test basis) to its test conditions, test cases, execution results and defects. The ISTQB says traceability supports coverage evaluation, impact analysis of changes, audits, and clear progress reporting.

| Type | Direction | Question it answers | Catches |
|---|---|---|---|
| **Forward** | Requirement → test cases | Is every requirement tested? | Untested requirements (coverage gaps) |
| **Backward** | Test case → requirement | Why does this test exist? | Orphan tests, gold-plating, tests for removed features |
| **Bidirectional** | Both | What is affected if REQ-X changes? Which requirement does this failure put at risk? | Both gaps, plus enables **impact analysis** |

In practice almost everyone maintains a **bidirectional** RTM, often generated automatically by Jira + Xray or TestRail rather than hand-built in Excel.

**Worked example (coupon feature).** Read the matrix below and look for problems before reading the notes underneath it.

**What the RTM tells us:**

- **REQ-CPN-04 has no tests:** a forward-traceability gap. The "one coupon per order" rule is untested.
- **TC-CPN-09 has no requirement:** a backward-traceability finding. Either a requirement is missing (ask the PO) or the test is obsolete.
- **REQ-CPN-03 is at risk:** one of its tests failed with an open defect, so the requirement is not yet satisfied, even though other tests passed.
- If the PO changes REQ-CPN-02 ("minimum cart 500 becomes 750"), the RTM instantly shows TC-CPN-03, 04 and 05 need updating: impact analysis.`,
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
        'Bidirectional RTM enables impact analysis when requirements change.',
        'Include status and defects so the RTM shows coverage AND quality.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.4 Traceability between the Test Basis and Testware; QA Touch, aqua cloud, BirdEatsBug — RTM types and templates',
    },
    {
      heading: 'Reviewing test cases',
      body: `**Intuition:** test cases are code for humans. Like code, they have bugs, and a second pair of eyes catches what the author cannot see.

A test case review is **static testing of testware**. It is usually a peer review (informal or walkthrough) and sometimes includes the BA or developer to confirm expected results.

**Review checklist:**

| Check | Question to ask |
|---|---|
| Traceability | Is every case linked to a requirement? Is every requirement covered? |
| Correctness | Is the expected result actually what the requirement says (not what the current build does)? |
| Completeness | Are negative, boundary and error cases present, not just happy paths? |
| Clarity | Could a new joiner run it without asking? Exact data and messages? |
| Preconditions | Is the starting state defined (logged in? cart empty? feature flag on?) |
| Independence | Does it secretly depend on a previous case? |
| Atomicity | One objective per case; no 25-step monsters testing five things |
| Duplication | Is the same check repeated in several cases or suites? |
| Priority | Are P1s really the critical, high-risk paths? |
| Automation fit | Is it stable and repetitive enough to automate later? |

**Process tip:** log review comments in the tool (Xray/TestRail comments or a review sheet) with an ID and status, and agree that cases are **baselined** only after comments are resolved. This becomes an entry criterion for execution.`,
      keyPoints: [
        'Reviewing testware is static testing; test cases contain defects too.',
        'Check expected results against requirements, not against the current build.',
        'Track comments to closure before baselining.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 3.1.1 Work Products Examinable by Static Testing (includes testware), 3.2.4 Review Types',
    },
    {
      heading: 'Test management tools: Jira + Xray/Zephyr and TestRail',
      body: `**Intuition:** test management tools are the filing cabinet and dashboard for all the artifacts above, linked to the place where developers already work (Jira).

| Tool | Model | Key objects | Good to know |
|---|---|---|---|
| **Xray** (Jira app) | Tests are Jira issues | Test, Precondition, Test Set, Test Plan, Test Execution; Test Runs inside executions | Built-in traceability report from stories to tests to defects; can import JUnit/Playwright results via API/CI |
| **Zephyr Scale** (Jira app) | Test library inside Jira | Test cases (folders), test cycles, test plans | Versioned test cases, reusable steps, coverage on stories |
| **TestRail** (standalone, integrates with Jira) | Separate tool linked to Jira | Projects, suites/sections, test cases, test runs, test plans, milestones | Strong reporting; result upload via API from automation |
| Spreadsheets | Manual | Rows and tabs | Fine for tiny teams; traceability and history break down quickly |

**Typical flow in Jira + Xray:** story SHOP-412 → tests created and linked (coverage) → grouped in a Test Plan for release 3.2 → Test Execution per build/environment → failures create linked Bugs → the story's coverage panel shows covered/failing/not run.

**Bridge to automation:** once you write Playwright tests, put the test case ID in the test title or an annotation (e.g. "TC-LOGIN-003 locked user sees error"), export JUnit XML from CI, and import it into Xray or TestRail so manual and automated results share one dashboard and one RTM.`,
      keyPoints: [
        'Xray models tests as Jira issues; Zephyr Scale and TestRail use their own libraries.',
        'Linking stories → tests → executions → bugs gives a live RTM.',
        'Automated results can be imported (JUnit XML/API) to keep one source of truth.',
      ],
      source: 'Xray documentation (Atlassian Marketplace); Zephyr Scale documentation; TestRail user guide',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-test-artifacts-cc-1',
      title: 'Rewrite a weak SauceDemo checkout test case',
      context: `A junior tester wrote this test case for the checkout information step on SauceDemo. In review, nobody could agree whether it passed or failed on the last build.`,
      task: `Rewrite it into well-formed test cases that a new joiner could execute without questions. Split it if it tests more than one objective, and give each case preconditions, exact data, numbered steps and specific expected results.`,
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
        'How many different objectives are hidden in "with details and without details"?',
        'Which user, which product, which exact field values? What page are you on before step 1?',
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
      explanation: `**Fixes applied:**

- **Split into atomic cases:** the original mixed a happy path and at least two negative paths; one "Fail" would not tell you which part broke.
- **Preconditions:** user, starting page and cart contents are defined, so the result is repeatable.
- **Exact test data:** names, postal code and one known product make totals predictable.
- **Specific expected results:** URLs, exact error texts and the price breakdown (item $29.99 + 8% tax $2.40 = $32.39) replace "should work properly".
- **Traceability and priority per case:** each links to a requirement and has its own priority (the happy path is P1).
- **Post-condition:** returning home keeps the next case independent.
- **Automation-ready:** each step has one action and one observable check, which maps one-to-one to Playwright actions and web-first assertions later.`,
      followUps: [
        {
          q: 'How would you cover the last-name-missing case without writing yet another nearly identical case?',
          a: 'Use a data-driven case: one test case "Required field missing shows error" with a data table of rows (first missing, last missing, zip missing, all missing) and the expected message per row. Test management tools support parameters or datasets, and in Playwright the same table becomes a loop generating one test per row.',
        },
        {
          q: 'Is the tax value a good thing to hard-code in the expected result?',
          a: 'For this demo, yes, because the tax rate is fixed and the exact number catches rounding bugs. In a real shop with tax rules that change by region or date, reference the rule and the input ("8% of item total, rounded half-up to 2 decimals") and keep the computed value in the test data sheet so a rule change updates one place.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-cc-2',
      title: 'Strengthen a one-paragraph test plan',
      context: `Your manager forwarded the "test plan" for a mobile-web coupon release and asked you to make it fit for sign-off by the PO and engineering manager.`,
      task: `Rewrite it into a concise test plan that states scope in and out, approach, environments, entry/exit and suspension criteria, deliverables, schedule, responsibilities and risks with mitigations. Keep it to one screen.`,
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
        '"Completely" and "all devices" are impossible promises. What will you actually cover and what will you not?',
        'What must be true to start, to pause, and to finish? Make each measurable.',
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
      explanation: `**Why this version is sign-off ready:**

- **Honest scope:** "completely on all devices" becomes explicit in/out lists, with exclusions justified, which the IEEE 829 "features not to be tested" section exists for.
- **Approach tied to risk:** effort and techniques are proportional to impact; automation scope is stated.
- **Measurable criteria:** entry, suspension/resumption and exit replace "when the feature is stable".
- **Environments justified by data:** two real devices chosen from traffic share rather than "all devices".
- **Responsibilities and turnaround times:** "done by the QA team" becomes who does what, including developer and PO commitments.
- **Real risks with mitigations and dates:** "Risks: none" is never true; listing them early lets the PO act.`,
      followUps: [
        {
          q: 'The PO asks why you are not testing the coupon admin console. What do you say?',
          a: 'It is out of scope because the admin console ships next release and this release only consumes coupons created by a seed script. The risk is low for 3.3 because no admin UI changes are deployed. I will include it in the next plan, and if the PO wants it now, we can add it with an estimated two extra days of testing.',
        },
        {
          q: 'How would you keep this plan useful during the release rather than writing it once and forgetting it?',
          a: 'Treat it as a living document: update scope and risks when stories change, track progress against the schedule in the daily status note, revisit entry/exit criteria at the go/no-go meeting, and record deviations (for example a waived criterion) with who approved them. The summary report then compares actual results against the plan.',
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
        'Lists core fields (ID, title, requirement, preconditions, data, steps, expected, priority, status)',
        'Explains why preconditions and expected results matter',
        'Gives exact expected text, not "should work"',
        'Mentions atomic, independent, repeatable',
      ],
      modelAnswer: `**Fields I always include:** ID, title, linked requirement/story, preconditions, test data, numbered steps, expected result per step, priority and type (positive/negative). At execution time: actual result, status (pass/fail/blocked), defect link, build and environment.

**What juniors get wrong most:** the **expected result**. "Login should work" or "error should come" cannot be judged objectively. Second place: missing **preconditions** (which user, which page, logged in or not).

**Example:**

- **ID/Title:** TC-LOGIN-003, "Locked-out user sees lock-out error and stays on login page"
- **Requirement:** REQ-AUTH-03
- **Preconditions:** browser at saucedemo.com, logged out
- **Data:** locked_out_user / secret_sauce
- **Steps:** 1. Enter username 2. Enter password 3. Click Login
- **Expected:** banner "Epic sadface: Sorry, this user has been locked out."; URL remains the login page; no inventory shown
- **Priority/type:** P1, negative

**Principles behind it:** one objective per case (atomic), no hidden dependency on other cases (independent), same data and state give the same result (repeatable). Written this way, the case is also ready to be automated: each step becomes an action and each expected result becomes an assertion.`,
      followUps: [
        {
          q: 'How detailed should test steps be? Isn\'t this slow to write?',
          a: 'Detail should match risk and audience. For critical, regulated or outsourced execution I write full steps. For a mature team testing a low-risk UI tweak, a scenario with clear expected results is enough. A good compromise is detailed expected results with concise steps, because the expected result is what decides pass or fail.',
        },
        {
          q: 'What is the difference between preconditions and test data?',
          a: 'Preconditions describe the system state before step 1, such as logged out, cart containing one backpack, or feature flag enabled. Test data are the input values used during the steps, such as the username, password or coupon code. Mixing them makes cases hard to reuse with different data sets.',
        },
      ],
      pitfalls: [
        'Expected results like "works fine" or "error shown"',
        'No preconditions or test data',
        'One giant case testing many objectives',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-02',
      difficulty: 'easy',
      question: 'For a coupon field on a checkout page, show me the difference between a test scenario, a test case and a test script.',
      whatInterviewerLooksFor: [
        'Scenario = what (one line), case = how with expected result, script = executable',
        'One scenario expands into many cases',
        'Uses the coupon example concretely',
        'Knows when scenarios are enough',
      ],
      modelAnswer: `**Test scenario (what to test):** one-line conditions derived from the requirement, for example:

- Apply a valid percentage coupon
- Apply an expired coupon
- Apply a coupon below the minimum cart value
- Apply a coupon with different letter case or extra spaces
- Remove an applied coupon

**Test case (how, with exact expectations):** one scenario becomes several precise cases. For "below minimum cart value":

- TC-CPN-03: cart 499, code MIN500 → message "Add 1 more to use this coupon", total unchanged
- TC-CPN-04: cart 500 → 5% discount applied, total 475
- TC-CPN-05: cart 501 → total 475.95

Each has preconditions (logged in, cart built with known items), data and expected results.

**Test script (executable sequence):** the cases above as an automated test, e.g. a Playwright spec that builds the cart, fills the coupon field, clicks Apply and asserts the total text, or a manual procedure that runs the three in a fixed order.

**When I use which:** scenarios for fast coverage thinking and in exploratory-heavy sprints; detailed cases for high-risk rules like money calculations; scripts for anything repeated every release, because regression is the best candidate for automation.`,
      followUps: [
        {
          q: 'Can a test scenario be executed directly?',
          a: 'Yes, by an experienced tester, often in an exploratory style, because the scenario says what to test and the tester decides the details on the fly. The risk is inconsistency: two testers may pick different data and get different results, so for critical or regulated areas I convert scenarios into explicit cases.',
        },
        {
          q: 'Where do test conditions in ISTQB terms fit in this picture?',
          a: 'ISTQB test conditions are the output of test analysis, the "what to test", which is essentially what most companies call scenarios. Test design turns conditions into test cases, and test implementation organises them into procedures, scripts and suites.',
        },
      ],
      pitfalls: [
        'Saying scenario and test case are the same thing',
        'Scenarios that already contain detailed steps and data',
        'No concrete example',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-03',
      difficulty: 'medium',
      question: 'Halfway through the sprint, the PO changes the minimum cart value for coupons from 500 to 750. How do your RTM and test artifacts help you react, and what exactly do you update?',
      whatInterviewerLooksFor: [
        'Uses bidirectional traceability for impact analysis',
        'Updates cases, data, and automation, not just one document',
        'Communicates impact on estimates and regression',
        'Keeps history/versioning',
      ],
      modelAnswer: `**Step 1: impact analysis from the RTM.** I open the requirement (REQ-CPN-02, minimum cart value) and follow forward traceability: TC-CPN-03, 04 and 05 (boundaries 499/500/501), plus any end-to-end cases that use MIN500, and the test data row D-05. Backward links from failed tests and open defects tell me whether any existing defect is now invalid.

**Step 2: update artifacts.**

- **Requirement link:** confirm the change is recorded in the story (new AC text, inclusive or exclusive?).
- **Test cases:** new boundaries 749 / 750 / 751; update expected totals; version the cases (v2) rather than overwriting history.
- **Test data:** update D-05 and the cart-building data that reaches exactly 750.
- **Automation:** if the Playwright tests read the minimum from a data file, one change updates them; if it is hard-coded, fix it and note the smell.
- **Regression scope:** checkout totals and any marketing banner that says "orders above 500".

**Step 3: communicate.** Tell the team the estimate impact (e.g. half a day) and whether already-executed results are now invalid and need re-execution.

**Why this matters:** without traceability I would grep through spreadsheets and probably miss the banner text or a data row. The RTM turns "what does this change break?" into a lookup.`,
      followUps: [
        {
          q: 'What if your project has no RTM at all?',
          a: 'I would build a lightweight one starting with the highest-risk features: a sheet or Jira links mapping stories to test cases. Most test management tools generate it if tests are linked to stories, so the real habit is simply "always link". Even partial traceability for payment and login gives most of the benefit.',
        },
        {
          q: 'How do you show requirement coverage to a manager in one number, and what is wrong with that number?',
          a: 'Percentage of requirements with at least one linked test (or with all linked tests passing). The weakness is that one trivial test can mark a complex requirement as "covered". So I pair it with risk: high-risk requirements must have tests for each rule and boundary, and I list known gaps explicitly.',
        },
      ],
      pitfalls: [
        'Only updating the test case and forgetting data and automation',
        'Overwriting cases with no version history',
        'Not telling anyone about re-execution impact',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-04',
      difficulty: 'medium',
      question: 'What is the difference between a test strategy and a test plan in your organisation, and who writes each? Be honest if your team merges them.',
      context: 'Glassdoor manual-tester interview reports frequently list "test strategy vs test plan" as a basic question.',
      whatInterviewerLooksFor: [
        'Strategy = long-lived, organisation/product level; plan = release/project specific',
        'Concrete content examples for each',
        'Knows the plan applies the strategy',
        'Honest about real-world practice',
      ],
      modelAnswer: `**Test strategy:** the long-lived "how we test here" for a product or organisation. Owned by a QA manager or test architect. Examples of content: which test levels we use and who owns them (developers: unit; QA: system and regression; business: UAT), automation approach (Playwright for UI, API tests in CI, smoke on every merge), environments policy, defect severity definitions and workflow, metrics we report, risk approach.

**Test plan:** a specific project or release document that applies the strategy. Owned by a test lead or the QA on that project. Content: scope in/out, schedule, people, specific environments and devices, entry/exit and suspension criteria, deliverables, risks for this release.

| | Strategy | Plan |
|---|---|---|
| Changes | Rarely | Each release |
| Scope | Product/organisation | Release/feature |
| Example | "P1 flows are automated and gate merges" | "Coupon regression on Chrome/Safari, 15–16 Oct" |

**Honest note:** in my last team (a 6-person Scrum team), the strategy was a two-page Confluence page and each release had a half-page plan section in the release ticket. In smaller startups they are often merged. What matters is that the decisions exist: scope, approach, criteria, risks.

**Order:** strategy first, then plans that follow it or document deviations.`,
      followUps: [
        {
          q: 'What is a test policy, and how is it different from a strategy?',
          a: 'A test policy is the highest-level statement of why the organisation tests and what quality goals it holds, for example "no release with known Critical defects; customer data never used unmasked in testing". The strategy then explains how testing is generally done to meet that policy, and plans apply the strategy to individual projects.',
        },
        {
          q: 'Which section of a test plan do you think is most often skipped and most often regretted?',
          a: 'Features not to be tested, together with risks and contingencies. Teams skip them because they feel negative, but they are exactly what protects everyone after release: an agreed exclusion with a reason turns "QA missed it" into a known, accepted risk.',
        },
      ],
      pitfalls: [
        'Saying they are the same with no nuance',
        'Claiming the plan comes first and contains the strategy',
        'Pretending your Agile team has heavy IEEE documents when it does not',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-05',
      difficulty: 'hard',
      question: 'A developer gives you a database dump from production to use as test data for a bug in the loyalty-points screen. What do you do?',
      whatInterviewerLooksFor: [
        'Recognises privacy/legal risk of unmasked PII',
        'Knows masking, anonymisation and synthetic alternatives',
        'Still solves the bug investigation pragmatically',
        'Follows/creates a data handling process',
      ],
      modelAnswer: `**First, stop and check before using it.** A raw production dump almost certainly contains personal data: names, phone numbers, emails, addresses, maybe payment tokens. Copying it to a QA environment that has weaker access control can breach company policy and laws such as GDPR or India's DPDP Act 2023. So I do not load it as-is, and I tell the developer why politely.

**Then solve the real problem: reproducing the bug.**

1. **Understand what makes the data special.** For a loyalty-points bug it is probably the shape: a customer with points expiring today, a negative adjustment, 5,000+ transactions, a specific tier.
2. **Options, in order of preference:**
   - **Synthetic data** that recreates that shape (script or SQL insert), stored as a reusable dataset for regression.
   - **Masked/anonymised copy** produced by the approved masking process (names, emails, phones replaced consistently; IDs tokenised; dates shifted), if realistic volume matters.
   - **Production read access under supervision** by the people allowed to see it, only for diagnosis, not testing.
3. **Record the dataset** in the test data sheet, link it to the defect, and add a regression test case using it.

**Process improvement:** if this keeps happening, propose a standard masked snapshot refreshed monthly, and a rule in the test strategy: "No unmasked production PII outside production."`,
      followUps: [
        {
          q: 'What is the difference between masking and synthetic data?',
          a: 'Masking starts from real data and replaces or scrambles sensitive fields while keeping realistic structure and relationships. Synthetic data is generated from scratch by rules or tools, so it contains no real person at all. Masked data is more realistic for volume and odd combinations; synthetic data is safer and easier to create on demand for specific cases.',
        },
        {
          q: 'How do you keep masked data consistent across tables?',
          a: 'Use deterministic masking: the same original value always maps to the same masked value, so a customer ID or email masked in the orders table still matches the customers table. Random per-row masking breaks joins and makes the data useless for end-to-end tests.',
        },
      ],
      pitfalls: [
        'Using the dump directly because "it is only QA"',
        'Refusing without offering an alternative to reproduce the bug',
        'Not knowing what masking or synthetic data means',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-06',
      difficulty: 'medium',
      question: 'You have been asked to review 40 test cases a teammate wrote for the SauceDemo cart before they are baselined. What do you look for, and how do you give the feedback?',
      whatInterviewerLooksFor: [
        'A concrete checklist (traceability, expected results, negatives, preconditions, independence)',
        'Verifies expected results against requirements, not current behaviour',
        'Constructive, tracked feedback',
        'Thinks about automation readiness',
      ],
      modelAnswer: `**Preparation:** I read the cart stories and acceptance criteria first, so I judge cases against the requirement, not against how the current build behaves.

**Checklist I apply:**

1. **Traceability:** each case links to a story; each cart requirement (add, remove, badge count, persistence after logout, continue shopping, checkout button) has at least one case.
2. **Expected results:** specific and correct, e.g. "badge shows 2" not "badge updates". I check them against the AC.
3. **Negative and edge coverage:** removing the last item hides the badge; adding all 6 products; cart after logout/login; checkout with an empty cart (should it be allowed?).
4. **Preconditions and data:** which user, cart initial state.
5. **Independence and atomicity:** no case relying on the previous one's cart; no 20-step cases testing everything.
6. **Duplicates:** same check written three times in different words.
7. **Priority sanity:** P1s are the critical path.
8. **Automation fit:** stable steps with clear checks.

**Giving feedback:** comments in the tool, numbered, each with the case ID, the issue, and a suggestion ("TC-CART-012: expected 'cart updated' → specify badge count and item row removed"). I separate **must-fix** (wrong expected result, missing requirement) from **suggestions** (wording). A quick 15-minute walkthrough for the big items avoids long comment threads. Cases are baselined once must-fix items are closed.

**Bonus:** I note patterns (e.g. "negative cases missing in general") to share in the team checklist, which improves the process, not just these 40 cases.`,
      followUps: [
        {
          q: 'You find that 10 of the 40 cases have expected results copied from the current build. Why is that a problem?',
          a: 'Then the tests confirm whatever the software does, including its bugs. If the build shows the badge count wrong, the case would "pass" while the requirement fails. Expected results must come from the test basis (requirements, ACs, an oracle like a pricing rule), and where the requirement is unclear the right move is a question to the PO, not copying the screen.',
        },
        {
          q: 'How long should a review like this take, and how do you stop it becoming a bottleneck?',
          a: 'Roughly one to two hours for 40 cases, depending on complexity. To avoid a bottleneck, review in small batches as cases are written, use a shared checklist so authors self-review first, and time-box the walkthrough. Reviewing high-risk cases deeply and low-risk ones quickly is also legitimate.',
        },
      ],
      pitfalls: [
        'Only checking spelling and formatting',
        'Validating expected results against the build instead of the requirement',
        'Untracked verbal feedback with no follow-up',
      ],
    },
    {
      id: 'mt-test-artifacts-iq-07',
      difficulty: 'hard',
      question: 'Your team is starting Playwright automation. Should you keep maintaining the manual test cases in Xray or TestRail once a case is automated? Explain how you would connect the two.',
      whatInterviewerLooksFor: [
        'Avoids duplication while keeping traceability',
        'Knows how to link automated tests to case IDs and import results',
        'Distinguishes what stays manual (exploratory, usability)',
        'Practical migration plan',
      ],
      modelAnswer: `**Short answer:** keep one source of truth for *traceability and reporting*, but do not maintain two detailed copies of the same steps.

**How I would connect them:**

1. **Mark the case as automated** in the tool (a field or label such as "automation status: automated") and keep its ID, title, requirement link and expected behaviour. The detailed manual steps can be trimmed, since the spec file is now the procedure.
2. **Reference the ID in the Playwright test**, for example in the title ("TC-LOGIN-003 locked user sees error") or as an annotation, so anyone can jump from a failing CI test to the requirement.
3. **Import results:** CI produces JUnit XML (Playwright has a JUnit reporter), and Xray or TestRail import it via API so each run creates a Test Execution or Test Run. The RTM then shows manual and automated results together.
4. **Keep manual what should be manual:** exploratory charters, usability, one-off checks, visual judgement. They stay as manual cases or charters in the same tool.

**Migration plan:** automate the smoke and highest-value regression first, link as you go, and review weekly that new cases are either automated, intentionally manual, or candidates.

**Why it matters:** managers still ask "is REQ-AUTH-03 tested on this build?". If automation lives only in Git and manual results only in Xray, nobody can answer quickly.`,
      followUps: [
        {
          q: 'An automated test fails in CI. Where should the defect be logged and linked?',
          a: 'First triage: is it a product bug, a test bug or an environment problem? For a product bug, log it in Jira with the CI run link, trace, screenshot and the test case ID, and link it to the imported Test Execution so the RTM shows the requirement as failing. Test or environment issues go to the automation backlog instead, so they do not inflate product defect counts.',
        },
        {
          q: 'Which test cases would you NOT automate?',
          a: 'Cases that run rarely, change constantly, need human judgement (look and feel, usability), are hard to make deterministic (third-party CAPTCHAs, physical devices), or cost more to automate and maintain than to run manually. Exploratory testing by definition stays human.',
        },
      ],
      pitfalls: [
        'Maintaining full manual steps and code in parallel forever',
        'Abandoning the test management tool so traceability disappears',
        'Saying everything should be automated',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-test-artifacts-drill-1',
      question: 'Build the forward and backward traceability for these 4 SauceDemo requirements and 7 test cases, then list every gap. Requirements: R1 user can log in with valid credentials; R2 locked-out user cannot log in; R3 cart badge shows the number of items; R4 user can sort products by price low→high. Tests: T1 valid login standard_user; T2 login with Enter key; T3 locked_out_user error; T4 badge shows 1 after adding backpack; T5 badge hidden after removing last item; T6 product images load for problem_user; T7 sort Name Z→A.',
      assumptions: [
        'A test covers a requirement only if it checks that requirement\'s rule.',
        'Forward = requirement → tests; backward = test → requirement.',
      ],
      steps: [
        { label: 'Forward R1', calc: 'T1, T2 → covered' },
        { label: 'Forward R2', calc: 'T3 → covered' },
        { label: 'Forward R3', calc: 'T4, T5 → covered' },
        { label: 'Forward R4', calc: 'No test sorts by price low→high (T7 sorts by name) → GAP' },
        { label: 'Backward T6', calc: 'Product images for problem_user → no requirement → orphan (missing requirement or obsolete test?)' },
        { label: 'Backward T7', calc: 'Sort Name Z→A → no matching requirement (R4 is price) → orphan / missing requirement' },
        { label: 'Coverage', calc: '3 of 4 requirements covered = 75%' },
      ],
      answer: 'Forward gaps: R4 (price sort) has no test. Backward findings: T6 and T7 trace to no requirement. Coverage 3/4 = 75%. Actions: write a price-sort test for R4; ask the PO whether name sorting and image loading are real requirements to add (or whether T6/T7 are obsolete).',
      insight: 'A test that looks related (T7 sorts products) can still miss the requirement (price, not name). Traceability forces you to check the rule, not the feature area.',
      followUps: [
        {
          q: 'R3 is "covered" by two tests. Is it fully covered?',
          a: 'Not necessarily. T4 and T5 check 1 item and 0 items, but not several items, adding all six products, or whether the badge persists after logout/login. Coverage by link count is a minimum; real coverage depends on the rule\'s partitions and boundaries, which is why high-risk requirements need a deeper look than "has a test".',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-drill-2',
      question: 'Estimate the manual effort for system-testing the coupon feature: you have 5 scenarios that expand into 42 test cases, 2 testers, and a regression suite of 54 cases. Plan writing, review, data setup, one execution cycle, one retest/regression cycle, and reporting, then say whether 8 working days is enough.',
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
      answer: 'About 34 hours of hands-on work against roughly 112 available hours, so 8 days is comfortably enough for one cycle. The slack (~78 h) should go to exploratory charters on the discount maths, cross-browser runs and a buffer for a second build.',
      insight: 'Breaking effort into per-artifact rates makes estimates defensible and shows where time really goes (writing cases is ~40% of hands-on effort here, a strong argument for reusing and automating cases).',
      followUps: [
        {
          q: 'The PO cuts the window to 3 days. What do you drop or change first?',
          a: 'Capacity becomes 2 × 3 × 7 = 42 h, still above 34 h, but with no buffer. I would write high-risk cases in full and low-risk ones as scenarios (saves writing time), run regression on the P1 subset first, and agree with the PO which browsers to defer. I would also flag that a second build with fixes would not fit.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-drill-3',
      question: 'Review this test case and list every defect in it, then give the corrected version: "TC-12 | Title: Sorting | Pre: none | Steps: 1. Login 2. Sort products 3. Check | Expected: Products sorted | Priority: — | Req: —".',
      assumptions: [
        'Target is SauceDemo inventory sorting (Name A→Z, Name Z→A, Price low→high, Price high→low).',
        'Products include Sauce Labs Onesie ($7.99, cheapest) and Sauce Labs Fleece Jacket ($49.99, most expensive).',
      ],
      steps: [
        { label: 'Title', calc: 'Vague; does not say which sort option → name the objective' },
        { label: 'Preconditions', calc: '"none" is false: needs logged-in user on /inventory.html' },
        { label: 'Data', calc: 'Missing user/credentials and which sort option' },
        { label: 'Steps', calc: '"Sort products" and "Check" are not actionable; specify dropdown and option' },
        { label: 'Expected', calc: '"Products sorted" is not checkable; state first/last item and ordering rule' },
        { label: 'Priority & requirement', calc: 'Missing → cannot select into suites or trace' },
        { label: 'Atomicity', calc: 'Four sort options hidden in one case → one case per option (or data-driven)' },
      ],
      answer: `Corrected: **TC-INV-012 Price (low to high) sorts cheapest first** | Req: REQ-INV-04 | P2 | Pre: logged in as standard_user, on /inventory.html | Steps: 1. Open sort dropdown 2. Select "Price (low to high)" | Expected: first item "Sauce Labs Onesie" $7.99, last item "Sauce Labs Fleece Jacket" $49.99, each price ≥ the previous one. Repeat as a data-driven case for the other three options.`,
      insight: 'Seven defects in a five-line test case is normal for unreviewed testware, which is exactly why test case reviews are part of static testing.',
      followUps: [
        {
          q: 'Why check "each price ≥ the previous one" and not just the first and last items?',
          a: 'First and last could be correct while the middle is wrong, for example two items swapped because prices were compared as text ("15.99" vs "9.99"). Checking the whole order is the real rule. In Playwright later, you collect all prices into an array and compare it with a sorted copy.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-test-artifacts-mcq-01',
      difficulty: 'easy',
      question: 'Which of these is a test SCENARIO rather than a detailed test case?',
      options: [
        'Verify a user can complete checkout with valid shipping details',
        'Login as standard_user, add backpack, enter "Asha/Rao/560001", Finish; expect "Thank you for your order!"',
        'Enter MIN500 on a 499 cart; expect "Add 1 more to use this coupon"',
        'Leave postal code empty, click Continue; expect "Error: Postal Code is required"',
      ],
      correct: [0],
      explanation: `A scenario is a one-line statement of WHAT to test, without exact data, steps or expected values. The other three options include specific data, steps and exact expected results, which makes them test cases. Scenarios are later expanded into several such cases.`,
      followUps: [
        {
          q: 'Expand that scenario into three test cases, briefly.',
          a: 'One: valid details with one item completes the order and shows the thank-you page. Two: valid details with all six items shows the correct item total, tax and total on the overview. Three: postal code with letters and spaces (e.g. "SW1A 1AA") is accepted if the requirement allows international formats.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-02',
      difficulty: 'easy',
      question: 'Which expected result is the BEST written?',
      options: [
        'Login should work properly',
        'User is logged in successfully and everything looks fine',
        'URL ends with /inventory.html and the heading "Products" is visible',
        'No errors should come after login',
      ],
      correct: [2],
      explanation: `A good expected result is specific and observable, so two testers would always agree on pass or fail. Option C names an exact URL and visible text. The others are subjective ("properly", "looks fine") or only negative ("no errors"), which a broken page showing nothing could also satisfy.`,
      followUps: [
        {
          q: 'How would this expected result translate into automation later?',
          a: 'Directly into web-first assertions: one checking the page URL matches /inventory.html and one checking the heading with text "Products" is visible. Specific manual expected results become reliable automated assertions with almost no rework.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-03',
      difficulty: 'easy',
      question: 'Which type of traceability helps you find test cases that no longer belong to any requirement?',
      options: ['Forward traceability', 'Backward traceability', 'Horizontal traceability', 'Vertical code coverage'],
      correct: [1],
      explanation: `Backward traceability goes from a test case back to its requirement, so it exposes orphan tests (for removed features or gold-plating). Forward traceability (requirement → tests) instead finds untested requirements. "Horizontal traceability" and code coverage are unrelated terms here and are distractors for beginners.`,
      followUps: [
        {
          q: 'You find 12 orphan tests. Do you delete them?',
          a: 'Not immediately. For each, ask whether a requirement is missing (implicit behaviour users rely on, such as password masking) or whether the feature was removed. Add the requirement where behaviour is still wanted, retire tests for removed features, and record the decision so the suite stays lean but nothing important is silently dropped.',
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
      explanation: `REQ-03 has no linked test, so it is an untested requirement (forward gap), and TC-09 maps to no requirement (backward finding). Coverage is 2 of 3 requirements. REQ-02 has a test, but it fails with an open defect, so it is not satisfied. TC-09 cannot prove REQ-03 since they are not linked.`,
      followUps: [
        {
          q: 'How would you report this RTM to the PO in two lines?',
          a: '"2 of 3 requirements tested (67%); REQ-01 passing, REQ-02 failing due to BUG-17 (Major, fix due Thursday), REQ-03 not yet tested, cases being written today. One extra test (TC-09) needs a requirement decision from you." Short, numeric and with an action for the reader.',
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
      explanation: `IEEE 829 test plans include features not to be tested, suspension/resumption requirements, and risks and contingencies (along with test items, approach, pass/fail criteria, deliverables, schedule and approvals). Root cause analysis belongs to defect management after incidents, and unit test code is a development artifact, not a plan section.`,
      followUps: [
        {
          q: 'What is the purpose of suspension criteria? Give one example.',
          a: 'They define when to pause testing because continuing would waste effort or give unreliable results, and resumption requirements say what must happen to restart. Example: suspend if the login service is down for over 2 hours or a Blocker prevents over 30% of cases; resume when a new build passes the smoke suite.',
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
      explanation: `A test strategy describes the general, relatively stable approach to testing for an organisation or product, while a test plan applies that approach to a specific project or release with scope, schedule, resources and criteria. Option A reverses their lifetimes. Plans do not simply list test cases, and while small teams may merge the documents, the concepts differ.`,
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
      explanation: `The case mixes adding, removing, checkout and session persistence (not atomic), "Cart works" cannot be judged objectively, and there is no starting state or data (which user, which items). It actually has too FEW expected results, not too many, and it links to no requirement at all rather than too many.`,
      followUps: [
        {
          q: 'Which single case would you extract first from it and why?',
          a: 'Cart persistence after logout and login, because it is the least obvious behaviour, often missed in development, and easy to state precisely: "Add backpack, log out, log in as the same user; badge shows 1 and the backpack is in /cart.html." The add/remove behaviours deserve their own simple cases too.',
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
      explanation: `Isolated data per tester or worker avoids interference, boundary and invalid values find defects that happy-path data cannot, and cleanup keeps runs repeatable. Unmasked production copies risk privacy breaches, and a single shared account causes tests to break each other's state.`,
      followUps: [
        {
          q: 'Why does isolated data matter even more once tests run in parallel in Playwright?',
          a: 'Parallel workers run at the same time; if two tests use the same account, one may empty the cart while the other asserts on it, producing random failures (flakiness). Unique data per test or worker makes each test independent, which is the foundation for running safely with multiple workers.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-09',
      difficulty: 'hard',
      question: 'The PO changes REQ-CPN-02 (minimum cart value). Which artifact most directly tells you which test cases, data and defects are affected?',
      options: [
        'The test summary report from last release',
        'A bidirectional requirements traceability matrix',
        'The test strategy document',
        'The defect life cycle diagram',
      ],
      correct: [1],
      explanation: `A bidirectional RTM links each requirement to its tests, results and defects, so following REQ-CPN-02 gives the impacted cases and defects instantly: impact analysis. Last release's summary report is historical, the strategy is too general, and the defect life cycle only describes defect states.`,
      followUps: [
        {
          q: 'What else besides test cases might need updating after this change?',
          a: 'Test data rows that build carts at the old boundary, automated tests that hard-code the old value, documentation or UI text mentioning the threshold, and the estimate for the sprint. Defects raised against the old rule may also need re-evaluation or closure as "no longer valid".',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-10',
      difficulty: 'hard',
      question: 'Read this test plan excerpt. Which missing section creates the biggest risk of a post-release blame game?',
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
      explanation: `Without stating what is out of scope (for example Firefox, native apps, payment gateway internals) and why, any defect found there after release looks like a QA miss. Explicit exclusions turn gaps into agreed risks. An identifier, glossary or approvals layout are useful housekeeping but do not prevent that dispute.`,
      followUps: [
        {
          q: 'What other important element is missing from this excerpt?',
          a: 'Risks and contingencies, entry criteria and suspension/resumption criteria are absent, along with responsibilities. For example, there is no plan if the environment is down for a day or if a tester is on leave, and no rule for when a broken build should be rejected.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-11',
      difficulty: 'hard',
      question: 'In Jira with the Xray app, which object records that a set of tests was run against a specific build and environment, with per-test results?',
      options: ['Test Set', 'Test Plan', 'Test Execution', 'Precondition'],
      correct: [2],
      explanation: `In Xray a Test Execution holds the test runs (per-test results) for a particular build/environment. A Test Set is just a grouping of tests, a Test Plan tracks which tests are planned for a release and aggregates executions, and a Precondition is a reusable starting state linked to tests.`,
      followUps: [
        {
          q: 'How would automated Playwright results end up in Xray?',
          a: 'Configure Playwright\'s JUnit reporter in CI, then call Xray\'s import API (or use a CI plugin) to upload the XML, which creates or updates a Test Execution. If test titles or annotations carry the Xray test keys, results map to the existing tests and coverage updates automatically.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-12',
      difficulty: 'medium',
      question: 'A teammate wrote expected results by copying what the current build displays. Why is this a problem during test case review?',
      options: [
        'It makes test cases too long to read',
        'Tests will then confirm existing bugs instead of the requirement',
        'Test management tools cannot store copied text',
        'It violates the IEEE 829 formatting rules',
      ],
      correct: [1],
      explanation: `Expected results must come from the test basis (requirements, acceptance criteria or another oracle). Copying current behaviour bakes any existing defect into the expected result, so the test passes on wrong behaviour. Length, tool storage and formatting standards are irrelevant to that core problem.`,
      followUps: [
        {
          q: 'The requirement is silent about the expected behaviour. What do you write?',
          a: 'I do not guess or copy. I raise a question to the PO or BA, mark the case as "expected result pending clarification", and, if I must run it, record the observed behaviour as an observation rather than a pass. The answer then updates both the requirement and the test case.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL characteristics of a well-written test case.',
      options: [
        'Has a single clear objective',
        'Can be run without depending on another case having run first',
        'Uses words like "should work properly" so it stays flexible',
        'States exact test data and preconditions',
        'Combines happy path and all negatives to save time',
      ],
      correct: [0, 1, 3],
      explanation: `Good test cases are atomic, independent and repeatable, with exact data and preconditions. Vague words make pass/fail subjective rather than "flexible", and combining happy and negative paths makes a failure ambiguous and the case hard to maintain or automate.`,
      followUps: [
        {
          q: 'When is it acceptable for one case to depend on another?',
          a: 'In an explicitly ordered end-to-end procedure (e.g. create booking, then cancel it), as long as the dependency is documented in preconditions and the suite runs them in order. Even then, it is better to create the needed state directly (via API or seeded data) so each case can run alone.',
        },
      ],
    },
    {
      id: 'mt-test-artifacts-mcq-14',
      difficulty: 'expert',
      question: 'Your manager reports "requirement coverage 100%" from the RTM, yet a serious coupon-stacking bug escaped. Which explanation is MOST likely?',
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
      explanation: `TC-CPN-11 applies a single coupon and never tries a second one, so the stacking rule was never exercised even though the requirement shows as "covered". Link-based coverage counts links, not rule coverage. The tool math is fine, stacking is easy to test manually, and the requirement is clearly in scope.`,
      followUps: [
        {
          q: 'How do you prevent this kind of false coverage?',
          a: 'Review traceability links during test case review ("does this test actually check the rule?"), break complex requirements into individual testable conditions in the RTM, and for high-risk requirements require at least one test per rule and boundary. Escaped defects should always trigger a check of why the linked tests missed them.',
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
      explanation: `One action plus one observable result maps directly to an action plus a web-first assertion; stable IDs let automated results link back to the RTM; separated data enables data-driven tests. Vague visual judgement cannot be asserted, and hidden ordering dependencies break when tests run in parallel.`,
      followUps: [
        {
          q: 'What would you do with a case that genuinely needs "looks right" judgement?',
          a: 'Either keep it manual (usability, visual polish) or turn it into something checkable: specific elements visible, a layout breakpoint behaviour, or a screenshot comparison against an approved baseline, which Playwright supports with visual comparisons. The key is defining an objective oracle.',
        },
      ],
    },
  ],
};

export default topic;
