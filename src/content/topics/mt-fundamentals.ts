import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-fundamentals',
  phase: 'manual-basics',
  order: 1,
  title: 'Testing Fundamentals: Principles, SDLC & STLC',
  subtitle:
    'Why we test, the seven ISTQB principles, error vs defect vs failure, SDLC models, the STLC with entry and exit criteria, verification vs validation, QA vs QC, static testing, shift-left and the QA role.',
  estimatedMinutes: 80,
  sources: [
    'ISTQB CTFL Syllabus v4.0.1 (2024) — Ch 1 Fundamentals of Testing, Ch 2.1 SDLC, Ch 3 Static Testing, Ch 5.1 Test Planning',
    'Glenford Myers — The Art of Software Testing (3rd ed), Ch 1–2 psychology and principles of testing',
    'Barry Boehm — Software Engineering Economics (1981), cost-of-change curve',
    'Guru99 — Software Testing Life Cycle (STLC) phases, entry/exit criteria',
    'Software Testing Help — SDLC models and STLC tutorials',
    'ISO/IEC 20246 — Work product reviews (as summarised in CTFL v4.0 §3.2)',
    'Glassdoor & Testleaf 2025 manual testing interview question lists (STLC, V&V, QA vs QC recur constantly)',
  ],
  tags: ['istqb', 'principles', 'sdlc', 'stlc', 'v-model', 'verification', 'validation', 'qa-vs-qc', 'static-testing', 'shift-left'],
  cheatSheet: [
    'Testing = checking software to find bugs and reduce risk. It can show bugs exist; it can never prove there are none.',
    'Seven principles: presence not absence · exhaustive testing impossible · early testing saves money · defects cluster · tests wear out (old name "pesticide paradox") · context dependent · absence-of-defects fallacy.',
    'Error (human mistake) → defect/bug (flaw in code or a document) → failure (wrong behaviour you see while it runs). Root cause = why the mistake happened.',
    'Waterfall = one step after another, testing late. V-model = each build step has a matching test level. Agile = short sprints, testing every sprint. Spiral = loops driven by risk.',
    'STLC: Requirement analysis → Test planning → Test case development → Environment setup → Test execution → Test closure. Each phase has entry criteria, exit criteria and deliverables.',
    'Verification = "are we building the product right?" (vs the spec: reviews, spec tests). Validation = "are we building the right product?" (vs user need: UAT, demos).',
    'QA = improves the process, prevents bugs. QC = checks the product, finds bugs. Testing = the main QC activity.',
    'Static testing = checking without running code (reviews, static analysis). Dynamic testing = running the software and watching for failures.',
    'Review types, least to most formal: informal → walkthrough (led by author) → technical review (led by moderator) → inspection (formal, metrics, exit criteria).',
    'Shift-left = start testing work earlier (review stories, tests before code, CI). A requirement bug costs far less to fix than the same bug in production.',
  ],
  sections: [
    {
      heading: 'What testing is and why it matters',
      body: `**Testing** means checking software to find bugs and to judge its quality before users see it.

**Why it matters:** a bug found by a tester is cheap to fix. The same bug found by a customer costs money and trust.

**Example:** on SauceDemo, log in as **problem_user** and click "Add to cart" on the backpack. The cart badge stays empty. You found a real bug before a shopper did. That is testing doing its job.

Glenford Myers put it simply: a good test is one that **finds a bug**. A test that finds nothing new teaches you less.

**What testing is for** (the goals change with the project):

| Goal | SauceDemo example |
|---|---|
| Find bugs | Add-to-cart does nothing for problem_user |
| Check the requirements are met | Checkout total = item total + tax |
| Build confidence to release | All key flows pass on Chrome, Safari and Firefox |
| Reduce risk | Login and payment get the deepest tests, because failures there lose money |
| Meet laws or standards | Accessibility checks for a government client |
| Give information to the team | "3 open Major bugs in checkout; we recommend no-go" |

**Testing vs debugging.** Testing finds the problem. **Debugging** is the developer's job: find the cause in the code and fix it. After the fix, the tester does two things:

- **Confirmation testing** (re-testing): run the failed test again. Is the bug gone?
- **Regression testing**: re-run old tests near the change. Did the fix break anything else?

**Example:** the developer fixes Add-to-cart. You re-run that test and it passes (confirmation). Then you check that Remove and Checkout still work (regression).

**In an interview, say:** "Testing gives the team information about quality and risk, so they can decide to release. We find bugs, but we can never prove the software has zero bugs."`,
      keyPoints: [
        'Testing finds bugs and reports quality; debugging (by developers) fixes them.',
        'After every fix: confirmation testing (is it fixed?) and regression testing (did anything else break?).',
        'Goals depend on the project: a banking app and a game prototype are tested differently.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.1 What is Testing?, 1.1.2 Testing and Debugging; Glenford Myers — The Art of Software Testing, Ch 2',
    },
    {
      heading: 'Error, defect, failure and root cause',
      body: `These four words describe one chain. A person makes a mistake, the mistake goes into the product, and the product then behaves wrongly.

- **Error** = a human mistake (wrong thinking).
- **Defect** (also called bug or fault) = a flaw in a work product: code, a requirement, a test case.
- **Failure** = the system does something wrong while it runs. This is what users see.
- **Root cause** = the real reason the person made the error.

**Why it matters:** fixing the defect fixes one bug. Fixing the root cause stops the same kind of bug from coming back.

**Example (ATM daily limit of 20,000):**

| Term | ATM example |
|---|---|
| **Error** | The developer thinks the limit is per withdrawal, not per day |
| **Defect** | The code checks each withdrawal against 20,000 but never adds up the day's total |
| **Failure** | A customer withdraws 20,000 three times in one day |
| **Root cause** | The requirement said "limit of 20,000" without "per day", and nobody reviewed it |

**Four facts interviewers like:**

- A defect **may never cause a failure** if that code never runs. *Example:* a leap-year bug only shows on 29 February.
- A failure can happen **with no code defect**. *Example:* an expired SSL certificate or a wrong server setting (the environment).
- Defects live in **documents too**. *Example:* a test case that expects the wrong result is a defect in testware.
- **Root cause analysis** (for example, asking "why?" five times, the "5 whys") stops the whole *type* of defect, not just this one.

**Common mistake:** calling everything a "bug". In an interview, use the chain: "My review found a *defect* in the requirement. In production it would have caused a *failure*."`,
      diagram: `   human               work product            running system
 +---------+  makes  +---------------+  may   +-----------------+
 |  ERROR  | ------> |    DEFECT     | -----> |     FAILURE     |
 | mistake |         | bug / fault   | cause  | visible, wrong  |
 +---------+         +---------------+        +-----------------+
      ^                                               |
      |            ROOT CAUSE ANALYSIS (5 whys)       |
      +-----------------------------------------------+
   time pressure, unclear spec, missing review, fatigue`,
      keyPoints: [
        'Error → defect → failure; not every defect produces a failure.',
        'The environment (server, certificate, clock) can cause a failure with no code defect.',
        'Root cause analysis fixes the process, so the same kind of defect does not repeat.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.2.3 Errors, Defects, Failures, and Root Causes',
    },
    {
      heading: 'The seven testing principles',
      body: `The **seven testing principles** are basic truths from the ISTQB syllabus. They explain why you cannot test everything, why you start early, and why a bug-free product can still fail.

**Why it matters:** you use them to defend your decisions. *Example:* "We test checkout deepest because defects cluster there."

**Name change:** ISTQB v4.0 renamed two principles. The **pesticide paradox** is now **"tests wear out"**. The **absence-of-errors fallacy** is now the **absence-of-defects fallacy**. Interviewers still use the old names, so know both.

**Example for each principle:**

| # | Principle | Plain meaning | Example |
|---|---|---|---|
| 1 | Testing shows the presence, not the absence, of defects | Passing tests lower risk; they never prove "no bugs" | 200 checkout tests pass, yet a rounding bug appears for a cart of 7 items |
| 2 | Exhaustive testing is impossible | There are too many inputs and paths to test all | A 10-character coupon field with 62 possible characters has 62^10 values; use EP, BVA and risk instead |
| 3 | Early testing saves time and money | Bugs found early do not spread into later work | Reviewing the coupon story asks "before or after tax?" before any code is written |
| 4 | Defects cluster together | A few modules hold most of the bugs | Most bugs in the last 3 releases came from checkout and the promo engine |
| 5 | Tests wear out | Running the same tests again finds fewer new bugs | Your suite always uses standard_user; add problem_user and new data |
| 6 | Testing is context dependent | No single approach fits every product | A pacemaker needs formal, documented testing; a startup landing page needs quick exploratory checks |
| 7 | Absence-of-defects fallacy | A bug-free system can still fail its users | A checkout with zero bugs but 14 form fields still loses customers |

**Tricky point:** principle 5 says repeated tests find fewer *new* bugs. But repeated tests are still useful for **automated regression**, where the goal is to catch something that used to work and is now broken.

**In an interview, say:** "Testing can show bugs are present, never that they are absent. So we test by risk, start early, and keep refreshing our tests."`,
      keyPoints: [
        'Use the principles to justify decisions: why you prioritise, why you start early, why you change test data.',
        'Know both old and new names for principles 5 and 7.',
        'Principle 4 (defects cluster) feeds risk-based testing: test the hot spots deeper.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.3 Testing Principles (citing Buxton 1970, Manna 1978, Boehm 1981, Enders 1975, Beizer 1990, Kaner 2011)',
    },
    {
      heading: 'SDLC models and where testing fits',
      body: `The **SDLC** (Software Development Life Cycle) is the step-by-step plan a team follows to build software. The model decides *when* testers start and *how much* they document.

**Why it matters:** interviewers ask "which model did your project use, and when did you test?"

| Model | Shape | When testing happens | Problem for QA |
|---|---|---|---|
| **Waterfall** | One step after another: requirements → design → code → test → deploy | Only after all coding is done | Bugs are found late and cost more |
| **V-model** | Like Waterfall, but each build step has a matching test level | Test *design* starts early; test *execution* after code | Rigid; working software comes late |
| **Iterative / Incremental** | Build in small slices | Every slice is reviewed and tested | Regression work grows with each slice |
| **Agile (Scrum/Kanban)** | Short sprints, frequent releases | All the time, inside the sprint | Light documents; needs automated regression |
| **Spiral** | Repeated loops: plan → risk analysis → build → evaluate | Every loop, focused on the biggest risks | Complex and costly to run |

**Example (the same coupon feature in two models):**

- **Waterfall:** the tester first sees the coupon screen in month 4. A "before or after tax?" question costs weeks of rework.
- **Scrum:** the tester asks that question in refinement on day 1. The fix is one sentence in the story.

**Good practices in every model** (ISTQB): every build activity has a matching test activity. Each test level has its own goal. Test analysis starts during the matching build phase. Testers review drafts as soon as they exist.

**In an interview, say:** "We worked in two-week Scrum sprints. I reviewed stories in refinement, wrote test cases while developers coded, tested each story as soon as it reached QA, and ran regression before release." Then name your tools.`,
      diagram: `                  V-MODEL (verification left, validation right)

 Business requirements ------------------------------- Acceptance testing
     \\                                                     /
   System requirements -------------------------- System testing
         \\                                             /
       Architecture / design ---------------- Integration testing
             \\                                     /
           Detailed design ------------ Component (unit) testing
                 \\                         /
                       ---- CODING ----
  test PLANNING and DESIGN for each level starts on the left side`,
      keyPoints: [
        'The SDLC model changes test timing, how much you document, how much you automate, and the tester role.',
        'V-model = Waterfall with a test level matched to every development phase.',
        'Agile needs light documents plus automated regression, because every sprint changes the product.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.1 Testing in the Context of an SDLC; Software Testing Help — SDLC models tutorial',
    },
    {
      heading: 'STLC: the six phases with entry and exit criteria',
      body: `The **STLC** (Software Testing Life Cycle) is the set of steps testers follow: understand, plan, write tests, prepare, run, and report.

**Why it matters:** "Explain the STLC" is one of the most common manual-testing interview questions.

| Phase | Entry criteria (can we start?) | Main work | Exit criteria (are we done?) | Deliverables |
|---|---|---|---|---|
| 1. Requirement analysis | Stories available; PO or BA can answer questions | Find testable requirements, ask questions, note what to automate | Questions answered | Query log, first RTM |
| 2. Test planning | Requirements analysed | Decide scope, approach, effort, schedule, tools, risks | Plan approved | Test plan, estimate |
| 3. Test case development | Plan approved; requirements stable | Write and peer-review test cases and test data | Cases reviewed; data ready | Test cases, test data, updated RTM |
| 4. Environment setup | Build available | Set up servers, URLs, accounts; run a smoke test | Smoke test passed | Ready environment |
| 5. Test execution | Cases ready; build stable | Run tests, log bugs, retest fixes, run regression | All planned tests run; no open Critical bug | Results, bug reports, updated RTM |
| 6. Test closure | Execution finished | Write summary, collect metrics, lessons learned, archive tests | Report signed off | Test summary report |

**Entry and exit criteria.** **Entry criteria** are the conditions to *start* (for example, a build that passed smoke). **Exit criteria** define *done* (for example, 0 open Critical bugs). In Agile they are called the **Definition of Ready** and the **Definition of Done**. Running out of time can also end testing, but only if the stakeholders openly **accept the remaining risk**.

Phases can overlap. *Example:* environment setup can run at the same time as test case development.

**ISTQB names** for the same work: test planning, monitoring and control, analysis, design, implementation, execution, completion. Mention this mapping and you sound senior.

**Example (coupon feature):** see the criteria below. Every line can be checked with a number or a yes/no. That is what "measurable" means.

**Common mistake:** listing six phase names with no entry criteria, exit criteria or deliverables.`,
      code: [
        {
          language: 'text',
          title: 'Entry and exit criteria for system testing of the "Apply coupon" feature',
          code: `FEATURE: Apply coupon code on checkout (story SHOP-412)

ENTRY CRITERIA (system test execution may start when)
  E1  Build 2.14.0 deployed to QA env and smoke suite (12 cases) passed 100%
  E2  Acceptance criteria for SHOP-412 reviewed and signed off by PO
  E3  Test data loaded: 6 coupons (valid, expired, used-up, min-cart,
      percentage, fixed-amount) and 3 test accounts
  E4  42 test cases written, peer-reviewed and linked to SHOP-412 in Xray

EXIT CRITERIA (system testing is complete when)
  X1  100% of planned test cases executed (pass, fail or blocked with reason)
  X2  >= 95% pass rate; every failure has a linked defect
  X3  0 open Blocker/Critical defects; Major defects have an agreed fix
      date or a PO-approved deferral
  X4  Regression suite for checkout (60 cases) passed on Chrome + Safari
  X5  Test summary report shared with PO and dev lead

SUSPEND testing if: QA env down > 2 h, or > 30% of cases blocked`,
        },
      ],
      diagram: `  REQUIREMENT     TEST        TEST CASE     ENVIRONMENT     TEST        TEST
   ANALYSIS  ---> PLANNING -> DEVELOPMENT -> SETUP -------> EXECUTION -> CLOSURE
      |              |            |              |              |           |
   RTM draft     test plan    cases + data   smoke passed   defects,    summary
   queries       estimates    reviewed       env ready      logs, RTM   report
                                                                ^
                                        retest + regression ----+ (loops per build)`,
      keyPoints: [
        'Six phases; each has entry criteria, main work, exit criteria and deliverables.',
        'Criteria must be measurable ("0 open Critical bugs"), not vague ("quality is good").',
        'Environment setup can run in parallel with test case development.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 Test Activities and Tasks, 5.1.3 Entry Criteria and Exit Criteria; Guru99 — Software Testing Life Cycle',
    },
    {
      heading: 'Verification vs validation',
      body: `- **Verification** asks: "Are we building the product **right**?" It checks the product against its **specification** (the written requirements).
- **Validation** asks: "Are we building the **right** product?" It checks the product against the **user's real need**.

(These two phrases come from Barry Boehm. Interviewers expect them word for word.)

**Why it matters:** a product can match the spec perfectly and still be useless to users.

**Example (you order a blue shirt, size M):** Verification: is it blue, size M, stitched as ordered? Validation: does it fit you, and do you like wearing it? It can pass the first and fail the second.

**Example (coupon field):** the spec says "a coupon gives 10% off the cart".

- **Verification:** you apply SAVE10 to a 1,000 cart. The total is 900. Test passes.
- **Validation:** in UAT, the marketing team says "sale items must not get the coupon". The spec never said that. The feature was built *right*, but it is not yet the *right* feature.

This is the **absence-of-defects fallacy** in real life.

| | Verification | Validation |
|---|---|---|
| Compared against | Requirements, design, standards | User needs, business goals |
| Typical activities | Reviews, inspections, spec-based system tests | UAT, beta testing, usability sessions, demos |
| Needs running code? | Not always (reviews are static) | Usually yes (or a prototype) |
| Who leads | QA, developers, BAs | Users, customers, PO (QA supports) |
| V-model side | Left side | Right side, especially acceptance |

**In an interview, say:** "Verification checks we built it as specified. Validation checks it solves the user's problem. We need both." Then give your own example.

**Common mistake:** "verification is static, validation is dynamic". That is only a rough rule. You can verify by running spec-based tests, and validate with a paper prototype.`,
      keyPoints: [
        'Verification = matches the specification; validation = fits the user\'s real purpose.',
        'You need both: passing every spec-based test does not mean users are happy.',
        'Always give a concrete example; definitions alone sound memorised.',
      ],
      source: 'Barry Boehm — Software Engineering Economics (1981); ISTQB CTFL v4.0.1 — 1.3 principle 7, 2.2.1 Acceptance testing',
    },
    {
      heading: 'QA vs QC vs testing',
      body: `- **QA (Quality Assurance)** = improving the **process** so fewer bugs are made. It **prevents**.
- **QC (Quality Control)** = checking the **product** to find bugs. It **detects**.
- **Testing** = the main QC activity: running or examining the product to find bugs.

**Why it matters:** a common interview trap is "QA team owns quality". In fact, QA is **everyone's** job.

**Example (restaurant):** QA is writing hygiene rules and training cooks. QC is tasting each dish before it leaves the kitchen. Testing is the actual tasting.

**Example (software team):**

| Activity | QA or QC? | Why |
|---|---|---|
| Defining the Definition of Done | QA | Changes the process |
| A rule that every test case gets a peer review | QA | Changes the process |
| A retrospective that improves the review checklist | QA | Changes the process |
| Running the regression suite on a release build | QC | Checks the product |
| Logging a bug for a broken "Continue" button | QC | Checks the product |

**How they connect:** testing is the biggest part of QC. QC results feed QA. *Example:* testing finds many boundary bugs, so the team adds "are limits inclusive?" to the story checklist (a QA change).

Many companies call testers "QA engineers", even though most daily work is QC. Be ready to explain this.

**In an interview, say:** "QA prevents, QC detects. In my team, QA was our Definition of Done and review checklist. QC was my test execution and bug reports. Bug trends from QC fed back into QA in retrospectives."`,
      keyPoints: [
        'QA = process and prevention; QC = product and detection; testing is part of QC.',
        'Test results serve both: QC uses them to fix bugs, QA uses them to improve the process.',
        'Quality is the whole team\'s job.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.2.2 Testing and Quality Assurance (QA)',
    },
    {
      heading: 'Static vs dynamic testing and reviews',
      body: `- **Static testing** = checking work products **without running the code**: reading requirements, designs, code or test cases (reviews), or using tools like linters (static analysis).
- **Dynamic testing** = **running** the software and watching what it does.

**Why it matters:** static testing finds the **defect** directly, often before code exists. Dynamic testing shows you the **failure**, and a developer must then debug to find the defect.

**Example:** a recipe says "bake at 900°C". Reading it and spotting the mistake is static. Baking the cake and watching it burn is dynamic.

| | Static testing | Dynamic testing |
|---|---|---|
| Runs the code? | No | Yes |
| What it checks | Requirements, stories, designs, code, test cases | The running software |
| Finds | Defects directly (unclear text, missing rules, unused code) | Failures |
| When | From day one, before code exists | Once a build exists |
| Techniques | Reviews, static analysis (linters, SAST tools) | EP, BVA, exploratory, automation |

**Review types** (least to most formal):

| Type | Led by | Formality | Main purpose |
|---|---|---|---|
| Informal review | Anyone (buddy check) | No set process, no written output | Spot problems quickly |
| Walkthrough | The **author** | Low to medium | Teach, agree, find problems |
| Technical review | A **moderator**; technical peers review | Medium | Agree on and decide technical problems |
| Inspection | A trained **moderator**; set roles, checklists, metrics | Highest; entry and exit criteria | Find the most problems; collect metrics to improve the process |

**Review roles:** manager, author, moderator (facilitator), scribe (note-taker), reviewer, review leader. **Review process:** planning → initiation → individual review → communication and analysis → fixing and reporting.

**Example:** the review below was done on a coupon story *before any code existed*. Each finding is a defect found by static testing.

**In an interview, say:** "Static testing finds defects without running code, like reviewing stories in refinement. It is the cheapest place to find a bug."`,
      code: [
        {
          language: 'text',
          title: 'Static testing: review findings on user story SHOP-412 (coupon)',
          code: `STORY: "As a shopper I can enter a coupon code at checkout to get a discount."
AC1: A valid coupon reduces the total.
AC2: An invalid coupon shows an error.

REVIEW FINDINGS (raised in refinement, before development)
 #  Type           Finding                                          Question to PO
 1  Ambiguity      "reduces the total" - by what?                  % or fixed amount? Before or after tax/shipping?
 2  Missing rule   No expiry behaviour                              What message for an expired coupon?
 3  Missing rule   Stacking not defined                             Can two coupons apply together?
 4  Incomplete     "invalid" covers 4 different cases               Separate messages for unknown/expired/used/min-cart?
 5  Boundary       Minimum cart value not stated                    Is the minimum inclusive (>= 500) or exclusive?
 6  Testability    No limit on attempts                             Lock after N wrong codes (brute force)?
 7  Consistency    Case sensitivity unknown                         Is "save10" the same as "SAVE10"?

OUTCOME: PO updated ACs (now 9), dev estimate rose 3 -> 5 points,
         ~7 defects prevented before a single line of code.`,
        },
      ],
      keyPoints: [
        'Static testing finds defects directly and cheaply, including in documents.',
        'Walkthrough = led by the author; inspection = most formal, led by a moderator, uses metrics.',
        'Testers add the most value in refinement by asking "how will we know it works?"',
      ],
      source: 'ISTQB CTFL v4.0.1 — 3.1 Static Testing Basics, 3.2.2–3.2.4 Review process, roles and types',
    },
    {
      heading: 'Cost of defects and shift-left',
      body: `The **cost of a defect** grows the later you find it. More work has been built on top of it, and more people get involved.

**Why it matters:** this is the business reason for testing early.

**Example (coupon rule "before or after tax?"):**

| Found in | What fixing involves | Relative cost (illustration only) |
|---|---|---|
| Requirements review | Edit one sentence in the story | 1x |
| Design / code review | Change the design or a few lines | ~5x |
| System testing | Debug, fix, rebuild, retest, regression | ~10x |
| Production | Incident, hotfix, fix wrong orders, customer support, lost trust | ~30–100x+ |

A popular rule of thumb (from Barry Boehm's work, 1981) is about **1 : 10 : 100** for requirements : testing : production. The exact numbers vary by project. Present them as an *illustration*, not a law.

**Shift-left** = doing testing work **earlier**. ISTQB lists these practices:

- Testers review stories and specs (static testing).
- Write test cases or automated tests **before** the code (TDD, BDD).
- Use **CI/CD**, so automated checks run on every commit.
- Run **static analysis** before dynamic testing.
- Start **non-functional** tests early. *Example:* check one API's speed at component level.

**Example:** every Playwright test you add to CI is shift-left. It runs minutes after a developer pushes code, not days later in a manual regression cycle.

Shift-left does **not** mean "stop testing later". Watching production and exploring the live system is called **shift-right**. It adds to shift-left; it does not replace it.

**In an interview, say:** "A requirement bug costs one sentence to fix in refinement, but a hotfix in production. So I review stories early and push checks into CI."`,
      keyPoints: [
        'Later = costlier: more rework, more people, more customer impact.',
        'Shift-left practices: story reviews, tests before code, CI, static analysis, early non-functional tests.',
        'Quote cost numbers as an illustration; interviewers dislike made-up precision.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.3 principle 3, 2.1.5 Shift Left; Barry Boehm — Software Engineering Economics (1981)',
    },
    {
      heading: 'The role of a QA engineer (manual to automation)',
      body: `A **QA engineer** checks that the product works and speaks up for the user. They keep asking: "What could go wrong?" and "How will a real customer use this?"

**Why it matters:** interviewers want to hear that you add value through the whole sprint, not only in "the test phase".

**Example (what you do and when):**

| When | What you do |
|---|---|
| Refinement / planning | Review stories, clarify acceptance criteria, estimate test effort, flag risks |
| During development | Write test cases and data, prepare environments, pair with developers, write automated checks |
| Story ready for test | Run tests, explore, raise clear bug reports, retest fixes |
| Before release | Regression, smoke test on staging, give go/no-go input with evidence |
| After release | Smoke test in production, track escaped bugs, suggest improvements |

**Independence of testing.** A tester who did not write the code makes different assumptions, so they find different bugs. (Myers also said programmers should not be the only testers of their own code.) *Example:* the developer tests the coupon with "SAVE10"; you try "save10", an expired code, and an empty cart.

The risk: too much independence isolates testers. Developers start to think quality is "someone else's job". Good teams mix: developers own unit tests, QA owns system-level risk and the test strategy, and everyone owns quality.

**Skills interviewers check for a manual → automation profile:**

- Test design (EP, BVA, decision tables) and clear bug reports.
- Domain knowledge and risk-based priorities.
- API testing (Postman) and basic SQL for data checks.
- JavaScript/TypeScript, Playwright, Git and CI basics.
- Explaining risk calmly to non-testers.

**In an interview, say:** "My manual background helps my automation. I know *what* is worth automating and which checks actually catch bugs."`,
      keyPoints: [
        'QA engineers add value from refinement to production, not only in "the test phase".',
        'Independent testers find different bugs, but independence must not become isolation.',
        'Present manual experience as test-design strength when moving to automation.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.5 Roles in Testing, 1.5 Essential Skills and Good Practices; Glenford Myers — The Art of Software Testing, Ch 2 testing principles',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-fundamentals-cc-1',
      title: 'Rewrite vague exit criteria into measurable ones',
      context: `Your lead asks you to fix the exit criteria in the system test plan for the SauceDemo checkout release. The text was copied from an old project. Nobody can tell when testing is actually "done".`,
      task: `Rewrite the exit criteria so anyone can look at the test dashboard and say yes or no: is testing complete? Also add rules for when to pause testing (suspension) and when to restart it (resumption). Keep it realistic for a two-week release.`,
      starter: {
        language: 'text',
        title: 'Weak exit criteria',
        code: `EXIT CRITERIA - Checkout release
- Testing should be completed.
- Most of the bugs should be fixed.
- The application should be stable.
- QA team is satisfied with the quality.
- Regression done if time permits.`,
      },
      hints: [
        'Replace every vague word ("most", "stable", "satisfied") with a number or a yes/no check.',
        'Cover three things: what was run (coverage), which bugs are open (by severity), and the evidence (reports, sign-off).',
        'What if time runs out before the criteria are met? Who accepts the risk?',
      ],
      solution: {
        language: 'text',
        title: 'Measurable exit criteria',
        code: `EXIT CRITERIA - SauceDemo checkout release 3.2 (system test level)

Coverage
  X1  100% of the 86 planned test cases executed; status is Pass, Fail
      (with defect id) or Blocked (with reason) - none "Not run"
  X2  Every requirement CHK-01..CHK-14 in the RTM has >= 1 executed test
  X3  Checkout regression suite (54 cases) passed on Chrome, Firefox, Safari

Defects
  X4  0 open Blocker or Critical defects
  X5  Open Major defects <= 2, each with PO-approved deferral in Jira
  X6  All fixed defects confirmation-tested and closed

Quality signal
  X7  Pass rate >= 95% on the final build (3.2.0-rc4)
  X8  Smoke suite (15 cases) passed on staging after final deploy

Reporting
  X9  Test summary report published and reviewed by PO and dev lead

If time runs out: QA lists unmet criteria + residual risks in the summary;
the PO decides go/no-go and records the accepted risk in the release ticket.

SUSPENSION: stop execution if QA env is down > 2 h or a Blocker prevents
> 30% of cases. RESUMPTION: new build passes the smoke suite.`,
      },
      explanation: `**What changed and why:**

- **"Testing should be completed" → X1/X2:** "complete" now means every case has a status, and every requirement in the RTM has a test.
- **"Most bugs fixed" → X4–X6:** limits by severity. A Major bug can stay open only if the PO approves it in writing.
- **"Stable" / "satisfied" → X7/X8:** a pass rate on a named build, plus a smoke run after the final deploy. Evidence replaces feelings.
- **"Regression if time permits" → X3:** regression is required, with a named suite and named browsers.
- **Reporting (X9) and risk acceptance:** ISTQB says running out of time can end testing only if stakeholders accept the risk. The rewrite says this openly.
- **Suspension and resumption rules** stop the team wasting a day on a broken build.`,
      followUps: [
        {
          q: 'The PO says "we release Friday no matter what". Are your exit criteria pointless then?',
          a: 'No. Exit criteria give information; they are not a veto. If X4 fails on Friday, the summary lists exactly which criteria are unmet and the risk (for example, one open Critical bug in coupon maths). The PO can still release, but now it is an informed, written decision, and the team can plan a hotfix or a feature flag.',
        },
        {
          q: 'How do these exit criteria change in a Scrum team with no separate test phase?',
          a: 'They become part of each story\'s Definition of Done: ACs tested, no open Critical bugs, automated checks added, regression green in CI. A short release checklist sits on top. The idea stays the same (clear, agreed rules for "done"), but you check it for every story, not once at the end.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-cc-2',
      title: 'Turn a weak requirement review into useful static-testing feedback',
      context: `You must review the ATM cash-withdrawal requirement before development starts. A colleague already left a review comment. The BA says it is not useful.`,
      task: `Rewrite the review as specific findings the BA can act on. For each finding, give its type, the risk, and a question or fix. This is static testing: no code exists yet.`,
      starter: {
        language: 'text',
        title: 'Weak review comment',
        code: `REQ-ATM-07: The customer can withdraw cash. Amount must be valid.
The daily limit is 20000. Show error if something goes wrong.

Reviewer comment:
"Requirement looks OK but needs more detail. Please check error
handling. Also test properly."`,
      },
      hints: [
        'What is a "valid amount"? Think of note sizes, the minimum, the maximum and the balance.',
        'Is the 20,000 limit per withdrawal, per day, per card or per account? Is exactly 20,000 allowed?',
        'List each error case separately and ask what the user should see.',
      ],
      solution: {
        language: 'text',
        title: 'Actionable review findings',
        code: `REVIEW OF REQ-ATM-07 (Cash withdrawal) - reviewer: QA, date: 2026-10-14

 ID  Category      Finding                                   Risk if unanswered / proposed fix
 F1  Ambiguity     "valid amount" undefined                  Define: multiple of 100, min 100, max 10,000 per txn?
 F2  Ambiguity     Limit 20,000 - per txn, day or account?   Daily per card is assumed by users; state it + reset time (00:00 local?)
 F3  Boundary      Is exactly 20,000 allowed?                Write "up to and including 20,000" to avoid off-by-one
 F4  Missing rule  Insufficient balance not covered          Message + no cash dispensed + no debit
 F5  Missing rule  ATM has too few notes of a denomination   Offer nearest possible amount or alternate notes?
 F6  Missing rule  Cash not taken within N seconds           Retract cash? Reverse the debit? (money-loss risk)
 F7  Missing rule  Network drop after debit, before dispense Must auto-reverse; define timeout + reconciliation
 F8  Vague         "Show error if something goes wrong"      List each error with its exact message and code
 F9  Testability   No receipt/SMS rule                       Is an SMS required for every withdrawal? Content?

Summary: 9 findings (2 ambiguity, 1 boundary, 4 missing rules, 1 vague,
1 testability). Recommend the requirement is NOT ready for development
until F1, F2, F6 and F7 (money-impacting) are answered.`,
      },
      explanation: `**Why the rewrite works:**

- **Specific:** each finding quotes the exact words it is about, so the BA can fix that sentence.
- **Classified:** ambiguity, missing rule, boundary or testability shows *what kind* of defect it is. This also feeds review metrics (a QA activity).
- **Risk first:** findings that can lose money (F6, F7) block the story from being "ready".
- **Suggests answers:** every finding gives a likely answer or a clear question, not just a complaint.
- **Boundaries early:** F3 prevents the classic off-by-one bug before code exists. That is the cheapest time to fix it (early testing principle).
- **"Test properly" removed:** it was about the reviewer, not the requirement, and gave nothing to act on.`,
      followUps: [
        {
          q: 'Which review type would you use for a money-critical requirement like this, and why?',
          a: 'A technical review or a light inspection. A moderator runs it, reviewers prepare alone with a checklist (limits, errors, reversals, audit), findings are logged and tracked until closed, and there is an exit rule: all money-related findings resolved. An informal buddy check is too weak when customer money is at risk.',
        },
        {
          q: 'How would you measure whether reviews like this are worth the time?',
          a: 'Compare bugs found in review with bugs found later for the same features. Track review hours and production bugs caused by unclear requirements. If one hour of review finds 9 issues that would each cost hours of debugging and retesting later, the value is clear. Share it in the retrospective so the process improves (QA).',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-fundamentals-iq-01',
      difficulty: 'easy',
      question: 'Walk me through the STLC as you followed it on your last project. What had to be true before each phase started?',
      context: 'Very common opener in manual and SDET-1 interviews; candidates on Glassdoor and Testleaf 2025 lists report STLC as a near-certain question.',
      whatInterviewerLooksFor: [
        'Names the six phases in order without hesitation',
        'Mentions entry criteria, exit criteria and deliverables, not just phase names',
        'Uses a real project and real tools (Jira, Xray/TestRail)',
        'Knows that phases overlap and repeat in Agile',
      ],
      modelAnswer: `**Structure:** each phase → what I produced → how it looked in our sprints.

1. **Requirement analysis.** Start: stories are ready. I read the acceptance criteria, sent questions to the PO, and marked what was testable and what to automate. Output: question log and a first RTM.
2. **Test planning.** My lead wrote the plan; I gave estimates and risks. Output: test plan with scope, approach, environments, entry and exit criteria.
3. **Test case development.** Start: scope approved. I wrote cases in Xray, got them peer-reviewed, and prepared data, e.g. valid, expired and used-up coupons. Output: reviewed cases linked to stories.
4. **Environment setup.** Start: build on the QA server. I ran our 12-case smoke suite. If smoke failed, the build went back. We never ran tests on a broken build.
5. **Test execution.** Start: smoke passed, cases ready. I ran tests, logged bugs with steps and screenshots, retested fixes and ran regression. Output: results, bugs, updated RTM.
6. **Test closure.** Start: exit criteria checked. I wrote the summary (run, passed, failed, open bugs by severity, risks) and we noted lessons learned.

**Reality:** in Scrum these phases happen *per story* and overlap. I analysed sprint N+1 stories while testing sprint N. Our exit criteria were the Definition of Done.`,
      followUps: [
        {
          q: 'What do you do if the smoke test fails in environment setup?',
          a: 'I stop and send the build back to development with the failing smoke cases and evidence. Running a full cycle on a broken build wastes time and gives misleading results. Meanwhile I do work that does not need the build: test design, test data, automation scripts. Testing restarts when a new build passes smoke.',
        },
        {
          q: 'Which STLC phase can run in parallel with another?',
          a: 'Environment setup can run at the same time as test case development, because both only need the approved plan. In Agile, requirement analysis for the next sprint overlaps test execution of the current one. The phases are a logical order, not a strict calendar.',
        },
        {
          q: 'How is the ISTQB test process different from these six phases?',
          a: 'ISTQB names planning, monitoring and control, analysis, design, implementation, execution and completion. Analysis is "what to test", design is "how to test", and implementation prepares the testware and environment. Monitoring and control runs the whole time. It is the same work, split differently, and it repeats.',
        },
      ],
      pitfalls: [
        'Listing phase names with no entry/exit criteria or deliverables',
        'Mixing up the STLC with the SDLC or the defect life cycle',
        'Saying phases are strictly one after another, even in Agile',
      ],
    },
    {
      id: 'mt-fundamentals-iq-02',
      difficulty: 'medium',
      question: 'Explain verification and validation using a feature you tested. Which one caught a problem the other missed?',
      whatInterviewerLooksFor: [
        'Correct Boehm definitions (built right vs right product)',
        'A real feature example, not abstract words',
        'Understands that passing verification can still fail validation',
        'Knows typical activities for each (reviews vs UAT/demos)',
      ],
      modelAnswer: `**Definitions.** Verification asks *"are we building the product right?"*: does it match the spec? Validation asks *"are we building the right product?"*: does it solve the user's real need?

**My example: a coupon field at checkout.**

- **Verification:** I reviewed the story and found that "reduces the total" did not say percentage or fixed amount (static verification). Later I ran spec-based tests: SAVE10 on a 1,000 cart gives 900; an expired coupon shows "Coupon expired"; the 500 minimum cart is inclusive. All passed.
- **Validation:** in the sprint demo, the marketing manager applied a coupon to a sale item and said, "Sale items must be excluded, or we lose margin." The spec never said that. The feature was built *right*, but it was not yet the *right* feature.

**What I learned:** verification protects us from building the spec wrongly. Validation protects us from building the wrong spec. That is the absence-of-defects fallacy. Now I ask in refinement, "who will use this, and what do they expect?"

**Rule of thumb:** verification = reviews plus spec-based tests by the team. Validation = UAT, demos and beta feedback from real users.`,
      followUps: [
        {
          q: 'Is UAT verification or validation?',
          a: 'Mainly validation. Real users check that the system supports their actual work in a realistic setting. They may also spot spec mismatches (verification), but the goal of UAT is "is it fit for use and ready to deploy?". That is why ISTQB places acceptance testing under validation.',
        },
        {
          q: 'Can a static review be validation?',
          a: 'Yes. Showing a stakeholder a wireframe and asking "is this what you need?" is validation without running code. "Verification is static, validation is dynamic" is only a shortcut. What matters is what you compare against: the spec (verification) or the user need (validation).',
        },
      ],
      pitfalls: [
        'Swapping the two definitions',
        'Saying "verification is done by QA, validation by developers"',
        'No real example, only memorised phrases',
      ],
    },
    {
      id: 'mt-fundamentals-iq-03',
      difficulty: 'medium',
      question: 'A developer says in the release meeting: "All 300 test cases passed, so this build is bug-free and we can stop testing." How do you respond?',
      whatInterviewerLooksFor: [
        'Uses testing principles (presence not absence, exhaustive impossible, tests wear out, absence-of-defects fallacy)',
        'Stays respectful and uses data, not emotion',
        'Proposes clear next steps or a risk statement',
        'Separates "ready to release" from "bug-free"',
      ],
      modelAnswer: `**Tone first:** agree with the good news, then correct the conclusion. "That is a strong signal for release. I would just call it *low known risk*, not *bug-free*."

**Why, using the principles:**

1. **Testing shows presence, not absence.** 300 passes prove those 300 checks work. They say nothing about untested paths.
2. **Exhaustive testing is impossible.** Did we test a cart with 50 items? A coupon on a sale item?
3. **Tests wear out.** If these are the same 300 cases with the same users for six releases, they catch regressions well but rarely find new bugs in the new promo engine.
4. **Absence-of-defects fallacy.** Zero bugs does not mean users get what they need.

**What I would propose:**

- Show **coverage** from the RTM: what was tested and what was not.
- Run a short **exploratory session** on the changed areas, where bugs cluster.
- Write the **remaining risks** in the summary and let the PO decide go/no-go.

**Close:** "So yes, release is reasonable if the exit criteria are met. Let's say *no known critical bugs*, not *bug-free*."`,
      followUps: [
        {
          q: 'What would make you NOT agree to release even with 100% pass?',
          a: 'If the passing suite does not cover the changed, high-risk area (for example, the new payment integration has no tests yet). If the tests ran on the wrong build or environment. Or if an exit criterion like "no open Critical bugs" fails because exploratory testing found one. A pass rate means only as much as the coverage behind it.',
        },
        {
          q: 'How do you stop tests from "wearing out" in practice?',
          a: 'Change the test data (on SauceDemo use problem_user or error_user, other coupons, other locales). Add a new case for every bug that escaped to production. Run exploratory sessions on changed areas each sprint. Review the suite now and then, and remove cases that never fail and cover no real risk.',
        },
      ],
      pitfalls: [
        'Agreeing that 100% pass means no bugs',
        'Arguing emotionally instead of showing coverage and risk',
        'Blocking the release without offering options',
      ],
    },
    {
      id: 'mt-fundamentals-iq-04',
      difficulty: 'easy',
      question: 'Using an ATM withdrawal as the example, explain the difference between an error, a defect, a failure and a root cause.',
      whatInterviewerLooksFor: [
        'Correct chain: error → defect → failure',
        'Knows not every defect causes a failure',
        'Mentions root cause and why it matters',
        'Uses the ATM example all the way through',
      ],
      modelAnswer: `**The chain:** a person makes an **error**. It creates a **defect** in the code or a document. When that code runs, the defect may cause a **failure**. The **root cause** is why the error happened.

**ATM example (limit 20,000 per day):**

- **Error:** the developer thought the limit was *per withdrawal*.
- **Defect:** the code checks each withdrawal against 20,000 but never adds up the day's total.
- **Failure:** a customer withdraws 20,000 three times in one day. This is what a tester or customer sees.
- **Root cause:** the requirement said "limit is 20,000" with no "per day", and QA never reviewed the story. Fixing the code fixes this bug. Fixing the root cause (a story template that forces the limit's time period, plus QA review in refinement) prevents the next one.

**Extra points:**

- A defect can stay silent. If the bank network checks the daily limit separately, this defect may never cause a failure.
- A failure can happen with no code defect. *Example:* the ATM clock is set wrong, so the "day" resets at the wrong time (environment).
- Test cases can have defects too. If my test expects 25,000 to be allowed, that is a defect in testware.`,
      followUps: [
        {
          q: 'Where do you record each of these in practice?',
          a: 'The failure I see goes into a Jira bug report with steps, expected vs actual, and evidence. The developer finds the defect while debugging. The root cause goes in the bug\'s resolution fields, or in a root-cause analysis for serious production issues. Repeated root causes are discussed in retrospectives.',
        },
        {
          q: 'Give an example of a defect that would not cause a failure for months.',
          a: 'A date bug that only fires on 29 February. A rounding error that only shows for a rarely used currency. A typo in an error handler that only runs when a third-party service is down. The defect exists from day one; the failure waits for the right condition.',
        },
      ],
      pitfalls: [
        'Treating the words as the same thing',
        'Saying every failure comes from a code defect',
        'Forgetting the root cause, or mixing it up with the defect',
      ],
    },
    {
      id: 'mt-fundamentals-iq-05',
      difficulty: 'medium',
      question: 'Your new team works in two-week Scrum sprints and says "we do not have an STLC or a test phase here". How does testing fit into their SDLC, and what would you change?',
      whatInterviewerLooksFor: [
        'Knows STLC activities still happen, just per story',
        'Knows Agile uses light documents and automated regression',
        'Mentions DoR/DoD as entry/exit criteria',
        'Suggests practical changes, not a return to Waterfall',
      ],
      modelAnswer: `**Agree, then correct.** There is no separate test *phase*, but every STLC *activity* still happens, for each story, all the time.

| STLC activity | Where it happens in Scrum |
|---|---|
| Requirement analysis | Backlog refinement, three amigos (PO, dev, QA) |
| Test planning | Sprint planning: test tasks per story; a light test strategy per release |
| Test design | While developers code: scenarios, Gherkin acceptance tests, automation |
| Environment setup | CI deploys each merge to a QA environment |
| Execution | Story testing right after merge, CI checks, exploratory sessions |
| Closure | Sprint review/demo, release notes, retrospective |

Entry and exit criteria become the **Definition of Ready** (story has testable ACs, designs, data) and the **Definition of Done** (ACs tested, no open Critical bugs, automated checks added, regression green).

**What I would change if needed:**

1. Join refinement and ask for examples in the ACs (shift-left).
2. Put "automated regression passes" in the DoD. Otherwise regression work piles up every sprint.
3. Avoid the **mini-waterfall**: all testing on day 9. Split stories smaller and test each slice once merged.
4. Keep just enough documents: a strategy page, test cases for risky flows, and charters for exploration.`,
      followUps: [
        {
          q: 'What is a "mini-waterfall" sprint and why is it a problem?',
          a: 'Developers code for most of the sprint and hand everything to QA in the last two days. Testing becomes a bottleneck, bugs are found too late to fix in the sprint, and stories spill over. The fix: smaller stories, earlier hand-offs, developers testing too, and automation running in CI on every merge.',
        },
        {
          q: 'Do you still write test cases in Agile?',
          a: 'Yes, but in proportion to risk. Risky or regulated flows (payment, login) get detailed cases or automated tests. A small UI change may only need its acceptance criteria plus an exploratory charter. Automated tests are test cases you can run, so moving to Playwright often replaces written regression cases.',
        },
      ],
      pitfalls: [
        'Saying Agile has no testing process at all',
        'Trying to force heavy Waterfall documents',
        'Forgetting regression automation in a model that changes every sprint',
      ],
    },
    {
      id: 'mt-fundamentals-iq-06',
      difficulty: 'hard',
      question: 'The build for a new loan-application feature will reach QA in three weeks, but the requirements are ready today. What do you do in those three weeks?',
      whatInterviewerLooksFor: [
        'Uses static testing and shift-left, not "wait for the build"',
        'Gives clear outputs: review findings, test design, data, automation skeleton',
        'Knows review types and how to run one',
        'Manages risk and speaks up early',
      ],
      modelAnswer: `**Principle:** early testing saves time and money. These three weeks are the most valuable testing time I will get.

**Week 1: review the requirements (static testing)**

- Check the rules (eligibility, income limits, document upload, decision messages) for unclear text, missing rules and boundaries. *Example:* "age 21–60": inclusive? Age on which date?
- Run a short **walkthrough** with the BA, then log findings in Jira so they are tracked until closed.
- Draft the **RTM**, so every requirement will get a test.

**Week 2: test analysis and design**

- List test conditions and risks. Credit decision logic is high risk; the help page is low.
- Design cases with EP, BVA and decision tables. Write Gherkin scenarios with the PO.
- Plan test data: applicants at each boundary, each document type and size, masked realistic data.

**Week 3: prepare to run**

- Request the environment, accounts and a credit-bureau stub.
- Write Postman API checks against the agreed contract or a mock.
- Build Playwright skeletons from the wireframes, so automation is ready when the UI arrives.
- Agree entry criteria (smoke suite, test data loaded).

**Communication:** "3 open questions on eligibility could change scope; we need answers by Friday."

**Result:** I start testing on day one of the build, and many bugs are never coded at all.`,
      followUps: [
        {
          q: 'The BA says your review comments are "just testing nitpicks". How do you handle it?',
          a: 'I sort the findings: must-answer (money, compliance, unclear rules that change the logic) and nice-to-have (wording). For each critical one I show the real failure it could cause, e.g. a 60-year-old applicant rejected if the boundary is exclusive. When findings are framed as business risk, not criticism of the BA, the debate usually ends.',
        },
        {
          q: 'How would you test before the UI exists?',
          a: 'Test lower down. Review the API contracts. Test the API with Postman or Playwright\'s request fixture as soon as an endpoint exists. Use mocks or stubs for missing services. Check the business rules with decision tables. The UI is the last layer, so most of the logic can be tested earlier.',
        },
      ],
      pitfalls: [
        '"I would wait for the build" or "I would do regression on other modules" only',
        'Reviewing without logging or tracking the findings',
        'Ignoring test data and environment preparation',
      ],
    },
    {
      id: 'mt-fundamentals-iq-07',
      difficulty: 'medium',
      question: 'Your manager says "the QA team owns quality, so production bugs are QA\'s fault." Do you agree? Use the difference between QA, QC and testing.',
      whatInterviewerLooksFor: [
        'Correct QA (process, prevents) vs QC (product, detects) difference',
        'Quality is the whole team\'s job',
        'Owns testing gaps without blaming others',
        'Suggests process improvements',
      ],
      modelAnswer: `**Partly.** I own the quality of *my testing*. But quality itself comes from the whole team.

**The difference:**

- **QA (quality assurance)** improves the process to prevent bugs: Definition of Done, review practices, coding standards, test strategy, retrospectives. ISTQB says QA is *everyone's* job.
- **QC (quality control)** checks the product to find bugs.
- **Testing** is the main form of QC.

So most "QA teams" actually do QC (testing). Real QA needs developers, the PO, DevOps and testers together.

**What I do after a production bug:**

1. **Own my part.** Was there a test gap? Was it in the RTM? Did we skip a browser? I add a regression test for it, ideally automated.
2. **Find the root cause, without blame.** Maybe the requirement was unclear, the code was not reviewed, or the test environment differed from production.
3. **Improve the process (QA).** *Example:* add "QA reviews stories in refinement" to the Definition of Ready, or add contract tests for a third-party API.

**Sound bite:** "Testers cannot test quality into a product. We give information about quality; the whole team builds it."`,
      followUps: [
        {
          q: 'Give one QA (process) improvement you introduced or would introduce.',
          a: 'A short story checklist for refinement: are limits inclusive or exclusive? Are error messages written down? What about empty, very long and special-character inputs? Which user roles can do this? It takes five minutes per story and prevents a whole type of unclear-requirement bug before any code is written.',
        },
        {
          q: 'What metric would show whether quality is improving?',
          a: 'Defect leakage: bugs found in production divided by all bugs for the release, tracked over several releases, plus the severity of those escaped bugs. If leakage falls while releases stay as frequent, the process is catching more problems earlier, which is the real goal of QA.',
        },
      ],
      pitfalls: [
        'Taking all the blame, or refusing all responsibility',
        'Saying QA and QC are the same thing',
        'No concrete improvement suggested',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-fundamentals-drill-1',
      question: 'Label each item as an error, a defect, a failure or a root cause (all from one SauceDemo-like shop): (a) the cart badge shows 3 after removing one of 3 items; (b) the "removeFromCart" function forgets to reduce the counter; (c) the developer assumed the server recalculates the counter; (d) the API contract never said who owns the counter; (e) a test case expects "badge hidden" when 1 item remains.',
      assumptions: [
        'Error = human mistake; defect = flaw in a work product; failure = wrong behaviour seen while running; root cause = the real reason for the error.',
        'Work products include code AND test cases.',
      ],
      steps: [
        { label: '(a) badge shows 3', calc: 'Wrong behaviour seen while the app runs → FAILURE.' },
        { label: '(b) function never reduces the counter', calc: 'Flaw in the code → DEFECT (it causes failure a).' },
        { label: '(c) developer assumed the server recalculates', calc: 'Human mistake in thinking → ERROR.' },
        { label: '(d) contract never said who owns the counter', calc: 'Why the developer made that mistake → ROOT CAUSE (fix the API documentation and review process).' },
        { label: '(e) test expects badge hidden with 1 item', calc: 'Wrong expected result in a test case (it should show 1) → DEFECT in testware.' },
      ],
      answer: '(a) failure, (b) defect, (c) error, (d) root cause, (e) defect (in the test case, not the product).',
      insight: 'The chain is error → defect → failure, with the root cause behind the error. Test cases can have defects too, so reviewing them is real testing work.',
      followUps: [
        {
          q: 'Which of these would a static review find, and which only dynamic testing?',
          a: 'A code review could find (b), and a test case review could find (e). A review of the API contract could expose (d). Item (a), the failure, is only seen when the software runs (dynamic testing). That is the key difference: static testing finds defects, dynamic testing shows failures.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-drill-2',
      question: 'It is Monday of release week for the coupon feature. Look at the status board below. For each of six activities, decide if it can start or finish today, and name the entry or exit criterion that decides it: (1) start system test execution, (2) mark test case development complete, (3) start regression, (4) close the test cycle, (5) start environment setup, (6) begin writing the closure report.',
      assumptions: [
        'Board: build 2.14.0 deployed; smoke 11 of 12 passed (failing case: "apply valid coupon" returns 500 error).',
        '42 test cases written; 38 peer-reviewed; 4 awaiting review.',
        'Test data for expired and used-up coupons not yet loaded.',
        'Exit criteria for the cycle: 100% executed, 0 open Critical, summary report reviewed.',
        'Entry for execution: smoke 100% pass, reviewed cases, test data loaded.',
      ],
      steps: [
        { label: '(1) Start execution?', calc: 'Smoke 11/12 is not 100%, the failing case is the core feature, and data is missing → NO. Reject the build and raise a Blocker.' },
        { label: '(2) Test case development complete?', calc: 'Only 38/42 reviewed and data not loaded → NO. Finish 4 reviews and load data today.' },
        { label: '(3) Start regression?', calc: 'Regression needs a stable build; smoke failed → NO (results would be noise).' },
        { label: '(4) Close test cycle?', calc: '0% executed and a Blocker is open → NO; exit criteria are far from met.' },
        { label: '(5) Environment setup?', calc: 'Already done (build deployed), but the environment is not "ready" until smoke passes → in progress, waiting for the fix.' },
        { label: '(6) Closure report?', calc: 'You can draft the template and risk section now, but cannot finish it without results → draft only.' },
      ],
      answer: `Only preparation work happens today: finish the 4 reviews, load the missing coupon data, raise the smoke failure as a Blocker and reject build 2.14.0. Execution, regression and closure wait for a build that passes smoke 100%. Send the PO a risk note: "Test execution starts late by at least the fix time; Friday release at risk."`,
      insight: 'Entry criteria stop the team wasting effort on a broken build. Reporting the delay on Monday (not Thursday) is what makes you valuable.',
      followUps: [
        {
          q: 'The dev lead asks you to "just start testing the other 41 cases anyway". Do you?',
          a: 'It depends. If the 500 error affects only coupon application, and some cases do not need it (e.g. page layout, the message for an empty coupon field), I can run those to gain information and label the results as provisional on build 2.14.0. Anything that applies a coupon stays blocked. I also record that the entry criterion was waived, and by whom.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-drill-3',
      question: 'Last release had 40 defects: 4 found in requirement review, 6 in code review, 20 in system testing and 10 in production. Fix costs are 1 hour (requirements), 3 hours (code review), 8 hours (system test) and 40 hours (production). Work out the total fix effort. Then estimate the saving if better story reviews move 5 of the production defects to requirement review.',
      assumptions: [
        'Fix cost per defect: requirements 1 h, code review 3 h, system test 8 h, production 40 h (illustration, not universal).',
        'Better reviews add 6 hours of extra review effort per release.',
        'Everything else stays the same.',
      ],
      steps: [
        { label: 'Current effort', calc: '4×1 + 6×3 + 20×8 + 10×40 = 4 + 18 + 160 + 400 = 582 hours' },
        { label: 'After shift-left', calc: 'Requirements 9×1 = 9; code review 18; system test 160; production 5×40 = 200 → 387 hours' },
        { label: 'Add review cost', calc: '387 + 6 = 393 hours' },
        { label: 'Saving', calc: '582 − 393 = 189 hours ≈ 32% less fix effort' },
        { label: 'Share of effort from production', calc: 'Before: 400/582 ≈ 69% of all effort came from 25% of the defects' },
      ],
      answer: 'Total effort today is 582 hours. Moving 5 production defects to requirement review (plus 6 h of extra review) brings it to about 393 hours. That saves ~189 hours (~32%) per release.',
      insight: 'A quarter of the defects (the production ones) used ~69% of the effort. That is the business case for shift-left: a few hours of early review save weeks of late fixing.',
      followUps: [
        {
          q: 'A manager questions your 40-hour production cost. How do you defend it?',
          a: 'Break it down: handling the support ticket, reproducing with production data, a hotfix branch, code review, emergency regression, deployment approvals, data-fix scripts and customer messages. Each step may be small, but many people are involved. Even better, measure the last few real production incidents and replace my example numbers with the team\'s own data.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-fundamentals-mcq-01',
      difficulty: 'easy',
      question: 'A tester runs 500 test cases on the SauceDemo checkout and all pass. Which conclusion is most accurate?',
      options: [
        'The checkout contains no defects',
        'The tested conditions work; untested defects may still exist',
        'Exhaustive testing of checkout has been achieved',
        'No further testing is ever needed on checkout',
      ],
      correct: [1],
      explanation: `Principle 1: testing shows that defects are present, never that they are absent. Passing tests lower the chance of hidden bugs, but cannot prove there are none. 500 cases is still a sample, so it is not exhaustive (principle 2). Future changes will still need regression testing.`,
      followUps: [
        {
          q: 'How would you write the result in a test summary report?',
          a: 'For example: "All 500 planned cases passed on build 3.2.0-rc4, covering requirements CHK-01 to CHK-14. No known open Critical or Major bugs. Remaining risks: not tested on Edge; coupon + sale-item combination not covered." It reports evidence and gaps, never "bug-free".',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-02',
      difficulty: 'easy',
      question: 'Your regression suite has run unchanged for a year, with the same users and data. It almost never finds new bugs, but users keep reporting issues. Which principle is this?',
      options: ['Defects cluster together', 'Tests wear out (pesticide paradox)', 'Testing is context dependent', 'Absence-of-defects fallacy'],
      correct: [1],
      explanation: `Running the same tests again and again finds fewer and fewer new bugs. That is "tests wear out" (old name: pesticide paradox). The fix is to change the data and add new tests. Defect clustering is about *where* bugs gather. The absence-of-defects fallacy is about a bug-free product that still fails user needs.`,
      followUps: [
        {
          q: 'Name two concrete ways to refresh that suite on SauceDemo.',
          a: 'Run key flows with other users such as problem_user, performance_glitch_user and error_user, and vary the cart (one item, all six items, remove-then-add). Also add a test for every production bug, and run a short exploratory session on recently changed pages each sprint.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-03',
      difficulty: 'easy',
      question: 'Which pair correctly matches the question each activity answers?',
      options: [
        'Verification: "Are we building the right product?" — Validation: "Are we building the product right?"',
        'Verification: "Are we building the product right?" — Validation: "Are we building the right product?"',
        'Verification: "Is the code fast enough?" — Validation: "Is the code secure enough?"',
        'Verification: "Did users accept it?" — Validation: "Did reviewers approve it?"',
      ],
      correct: [1],
      explanation: `Boehm's definitions: verification checks the product matches the spec (built right). Validation checks it meets the user's real need (right product). Option A swaps them, a very common interview slip. Options C and D talk about speed, security or approvals, which is not the verification/validation difference.`,
      followUps: [
        {
          q: 'Name one verification activity and one validation activity from your last sprint.',
          a: 'Verification: reviewing a story\'s acceptance criteria and running spec-based test cases for the coupon rules. Validation: the sprint demo where the PO and a marketing user tried the coupon flow and confirmed it matched how campaigns really work (or said it did not).',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-04',
      difficulty: 'medium',
      question: 'Read the incident note below. Which option labels the items correctly?',
      code: {
        language: 'text',
        title: 'Incident INC-2291 (ATM)',
        code: `1. Customer withdrew 20,000 three times on 12 Oct (limit is 20,000/day).
2. Code checks each amount <= 20000 but never sums today's withdrawals.
3. Developer believed the limit was per transaction.
4. Requirement text: "Withdrawal limit is 20,000" (no time period).`,
      },
      options: [
        '1 = defect, 2 = failure, 3 = root cause, 4 = error',
        '1 = failure, 2 = defect, 3 = error, 4 = root cause',
        '1 = error, 2 = defect, 3 = failure, 4 = root cause',
        '1 = failure, 2 = error, 3 = defect, 4 = root cause',
      ],
      correct: [1],
      explanation: `Line 1 is what was seen while the system ran (failure). Line 2 is the flaw in the code (defect). Line 3 is the human mistake (error). Line 4, the unclear requirement, explains why the mistake happened (root cause). Option D swaps error and defect: the defect is in the code, the error is in the person's thinking.`,
      followUps: [
        {
          q: 'What would a root-cause fix look like here, beyond patching the code?',
          a: 'Change the requirement template so every limit must state its time period, scope and whether the edge value is included. Add QA review of stories in refinement. Add a regression test with several withdrawals that together pass the daily limit. This stops the whole type of "unclear limit" bug, not just this one.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-05',
      difficulty: 'medium',
      question: 'In the V-model, which test level is designed at the same time as the "system requirements specification" phase?',
      options: ['Component (unit) testing', 'Integration testing', 'System testing', 'Acceptance testing'],
      correct: [2],
      explanation: `The V-model pairs each build phase (left) with a test level (right): business requirements ↔ acceptance, system requirements ↔ system testing, architecture ↔ integration, detailed design ↔ component testing. Acceptance pairs with business requirements, not the system spec. Unit and integration pair with design phases.`,
      followUps: [
        {
          q: 'What is the main benefit of designing system tests during the requirements phase?',
          a: 'Writing tests forces testers to read the requirements carefully, so unclear or missing rules are found before coding (early testing). It also links each requirement to its tests from the start, and the cases are ready to run as soon as the system is built.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-06',
      difficulty: 'medium',
      question: 'Select ALL that are typical ENTRY criteria for starting system test execution.',
      options: [
        'The smoke test on the deployed build has passed',
        'Test cases are reviewed and test data is loaded',
        'There are zero open Critical defects',
        'The test environment is available and configured',
        'The test summary report has been signed off',
      ],
      correct: [0, 1, 3],
      explanation: `Entry criteria are conditions to *start*: a build that passed smoke, reviewed test cases and data, and a working environment. "Zero open Critical defects" and "summary report signed off" are exit criteria (conditions to *finish*). You can only judge them after running the tests.`,
      followUps: [
        {
          q: 'Who decides whether to waive (skip) an entry criterion?',
          a: 'Usually the test lead or manager, together with the PO or project manager, because skipping a criterion moves risk. Write down what was skipped, why, and who agreed. Then, if results look unreliable later, everyone knows the context.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-07',
      difficulty: 'medium',
      question: 'A team built exactly what the spec says, with zero open defects. But customers abandon the new 14-field checkout form. Which principle does this show?',
      options: ['Exhaustive testing is impossible', 'Early testing saves time and money', 'Absence-of-defects fallacy', 'Defects cluster together'],
      correct: [2],
      explanation: `The absence-of-defects fallacy: a system can match its spec and have no known bugs, yet still fail users or business goals. So validation is needed as well as verification. The other options are about test coverage, timing of testing, and where bugs gather, which do not explain this case.`,
      followUps: [
        {
          q: 'Which testing activity could have caught this before release?',
          a: 'Validation activities: usability testing with real users on a prototype, a demo to the PO and stakeholders, beta testing with a small user group, or comparing the form with competitor checkouts. Data from a limited rollout (canary or A/B test) would also show people abandoning the form early.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL statements that correctly describe static testing.',
      options: [
        'It can find defects in requirements before any code exists',
        'It finds defects directly, without needing to observe a failure',
        'It requires the application to be deployed to a test environment',
        'Reviews and static analysis tools are both forms of static testing',
        'It can only be performed by developers on source code',
      ],
      correct: [0, 1, 3],
      explanation: `Static testing checks work products (requirements, designs, code, test cases) without running them. So it works before code exists and finds defects directly. Reviews and static analysis (linters, SAST) are its two main forms. It needs no deployment, and anyone (BA, tester, PO) can review documents, not only developers.`,
      followUps: [
        {
          q: 'Give an example of a defect static testing finds easily but dynamic testing struggles with.',
          a: 'An unclear requirement ("coupon reduces the total") or a missing rule (nothing about expiry). Dynamic tests are written from the requirement, so they copy its gaps. In code: unreachable code, a variable that is never used, or breaking the coding standard.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-09',
      difficulty: 'hard',
      question: 'Which review type is described below?',
      code: {
        language: 'text',
        title: 'Review notes',
        code: `- Led by a trained moderator (not the author)
- Reviewers prepare individually using a checklist
- Defined roles: moderator, author, scribe, reviewers
- Entry and exit criteria; metrics collected (defects/page, effort)
- Results used to improve the development process`,
      },
      options: ['Informal review', 'Walkthrough', 'Technical review', 'Inspection'],
      correct: [3],
      explanation: `An inspection is the most formal review: a trained moderator, set roles, solo preparation with checklists, entry and exit criteria, and metrics used to improve the process. A walkthrough is led by the author. A technical review is led by a moderator but aims at agreement on technical issues, without the full metrics process. An informal review has no set process.`,
      followUps: [
        {
          q: 'Why is the author not the moderator in an inspection?',
          a: 'Authors naturally defend their work and may steer talk away from weak spots. A neutral moderator keeps the meeting on finding problems, manages time, and makes it safe for reviewers to speak. In a walkthrough the author leads on purpose, because one goal there is to teach the audience.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-10',
      difficulty: 'hard',
      question: 'Your team keeps finding unclear requirements during system testing, which costs days of rework each sprint. Which change is the best example of shift-left?',
      options: [
        'Add two more days of regression testing before each release',
        'Have QA review stories and write acceptance examples during refinement',
        'Increase production monitoring and alerting',
        'Ask developers to fix defects faster after they are reported',
      ],
      correct: [1],
      explanation: `Shift-left moves testing work earlier. Reviewing stories and writing acceptance examples in refinement finds unclear rules before any code exists. More regression days and faster fixing still act late. Production monitoring is shift-right: useful, but it catches problems after release.`,
      followUps: [
        {
          q: 'Does shift-left mean less testing at the end?',
          a: 'No. ISTQB clearly says shift-left does not mean skipping later testing. You still need system, regression and acceptance testing. Shift-left just means fewer and cheaper bugs reach those stages, so later testing confirms quality instead of finding basic misunderstandings.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-11',
      difficulty: 'medium',
      question: 'Select ALL activities that are mainly Quality Assurance (improving the process, preventing bugs) rather than Quality Control.',
      options: [
        'Defining a Definition of Done that every story must meet',
        'Executing the regression suite on the release candidate',
        'Holding a retrospective to improve the review checklist',
        'Logging a defect for a broken "Continue" button',
        'Introducing a mandatory peer review of test cases',
      ],
      correct: [0, 2, 4],
      explanation: `QA sets and improves the process so good products follow: a Definition of Done, a retrospective that improves the checklist, and a required review step all change the process. Running regression and logging a bug for a broken button check the product itself, which is quality control (testing).`,
      followUps: [
        {
          q: 'How do QC results feed back into QA?',
          a: 'Bug data from testing (where bugs gather, which root causes repeat, how many reached production) is studied in retrospectives and root-cause sessions. The team then changes the process, e.g. adds a checklist item "is the limit inclusive?". QC finds bugs in the product; QA uses that data to fix the process.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-12',
      difficulty: 'hard',
      question: 'Which SDLC model fits the project below best?',
      code: {
        language: 'text',
        title: 'Project brief',
        code: `- Large, novel satellite ground-control system
- Requirements are uncertain and high risk
- Each cycle: set objectives, analyse and reduce top risks
  (often with prototypes), build, then evaluate with customer
- Budget allows heavy upfront risk analysis`,
      },
      options: ['Waterfall', 'V-model', 'Spiral', 'Kanban'],
      correct: [2],
      explanation: `The Spiral model repeats loops of planning, risk analysis (often with prototypes), building and evaluation. That suits large, risky projects with unclear requirements. Waterfall and V-model expect stable requirements at the start. Kanban is an Agile flow method for continuous work, with no built-in risk-analysis loops.`,
      followUps: [
        {
          q: 'How is the tester role different in Spiral compared with Waterfall?',
          a: 'In Spiral, testers evaluate prototypes and builds in every loop and help judge the risks that drive the next loop, so testing is continuous and risk-focused. In Waterfall, testers mostly review documents early and then run tests in one late phase, after all the code is done.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL deliverables produced in the Test Closure phase of the STLC.',
      options: [
        'Test summary / completion report',
        'Documented lessons learned and improvement actions',
        'Baselined test cases and test data',
        'Archived testware for reuse in future releases',
        'Initial requirement query log',
      ],
      correct: [0, 1, 3],
      explanation: `Closure produces the summary (completion) report, lessons learned, and archived testware (plus change requests for bugs still open). Baselined test cases and data come from test case development. The requirement query log comes from requirement analysis, long before closure.`,
      followUps: [
        {
          q: 'What goes into a good test summary report?',
          a: 'What was tested and not tested, the build and environment, the numbers (planned, run, passed, failed, blocked), open bugs by severity, exit-criteria status, remaining risks, and a clear recommendation (go / go with risks / no-go). A non-tester should understand it in two minutes.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-14',
      difficulty: 'expert',
      question: 'Over the last 3 releases, 70% of production bugs came from the promo engine and payment modules, which are 15% of the code. You have 5 days to test release 4. What is the BEST plan?',
      options: [
        'Split the 5 days evenly across all modules so coverage is fair',
        'Weight test design and exploration toward promo and payment, keep a lighter regression elsewhere',
        'Test only promo and payment, skipping everything else',
        'Rerun last release\'s full regression suite unchanged',
      ],
      correct: [1],
      explanation: `Defects cluster (principle 4), so put more effort where bugs have gathered before (risk-based testing). Keep a lighter regression elsewhere, because other areas still carry some risk. An even split ignores the data. Testing only the hot spots drops all other coverage. Rerunning an unchanged suite ignores "tests wear out".`,
      followUps: [
        {
          q: 'How would you justify light testing of the profile page to the PO?',
          a: 'Show the data: past bug counts per module, what changed in this release, and the business impact if each area fails. Then state the remaining risk clearly ("profile gets smoke + 10 regression cases only; small change, zero bugs in 3 releases") and ask the PO to accept it. Risk decisions must be visible, not silent.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-15',
      difficulty: 'expert',
      question: 'Which exit criterion below is the WEAKEST (hardest to measure)?',
      code: {
        language: 'text',
        title: 'Exit criteria draft',
        code: `A. 100% of planned test cases executed with a recorded status
B. 0 open Blocker/Critical defects on build 3.2.0-rc4
C. The application should be stable and of good quality
D. Every requirement in the RTM has at least one passed test`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [2],
      explanation: `Criterion C uses opinion words ("stable", "good quality"). Two people could judge it differently, so nobody can prove it is met. A, B and D can be checked in the test tool, the bug tracker and the RTM. Good exit criteria use numbers or yes/no checks backed by evidence.`,
      followUps: [
        {
          q: 'Rewrite criterion C so it becomes measurable.',
          a: 'For example: "The 15-case smoke suite passes 100% on staging after the final deploy, no crash or 5xx error is seen in the final regression run, and the pass rate on build 3.2.0-rc4 is at least 95%." Each part can be checked against a report.',
        },
      ],
    },
  ],
};

export default topic;
