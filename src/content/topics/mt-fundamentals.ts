import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-fundamentals',
  phase: 'manual-basics',
  order: 1,
  title: 'Testing Fundamentals: Principles, SDLC & STLC',
  subtitle:
    'Why we test, the seven ISTQB principles, error vs defect vs failure, SDLC models, the STLC with entry/exit criteria, verification vs validation, QA vs QC, static testing, shift-left and the QA role.',
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
    'Testing = evaluating a product to find defects and reduce risk; it can show defects are present, never prove they are absent.',
    'Seven principles (CTFL v4.0): presence not absence · exhaustive testing impossible · early testing saves money · defects cluster · tests wear out (old "pesticide paradox") · context dependent · absence-of-defects fallacy.',
    'Error (human mistake) → defect/bug (flaw in a work product) → failure (visible wrong behaviour at runtime); root cause = why the error happened.',
    'Waterfall = sequential, testing late; V-model = each dev phase paired with a test level, test design starts early; Agile = short iterations, testing every sprint; Spiral = risk-driven loops.',
    'STLC: Requirement analysis → Test planning → Test case development → Environment setup → Test execution → Test closure; each phase has entry criteria, exit criteria and deliverables.',
    'Verification = "are we building the product right?" (vs spec; reviews, static); Validation = "are we building the right product?" (vs user need; UAT, demos).',
    'QA = process-oriented, preventive; QC = product-oriented, detective; testing = the main QC activity.',
    'Static testing examines work products without running code (reviews, static analysis); dynamic testing executes the software and observes failures.',
    'Review types from least to most formal: informal → walkthrough (author-led) → technical review (moderator-led) → inspection (formal, metrics, exit criteria).',
    'Shift-left = start testing activities earlier (review stories, write tests before code, CI); a requirements defect costs far less to fix than the same defect found in production.',
  ],
  sections: [
    {
      heading: 'Why testing matters (and what testing actually is)',
      body: `**Intuition:** you proofread an email before sending it to your boss, not because you think it is bad, but because a typo costs more once it is out. Testing is proofreading for software, done systematically.

**Definition.** The ISTQB defines testing as a set of activities to discover defects and evaluate the quality of software work products. Glenford Myers put the mindset bluntly in *The Art of Software Testing*: testing is executing a program **with the intent of finding errors**. A test that finds nothing new is not "successful" in Myers' view; a test that exposes a hidden problem is.

**Typical test objectives** (they change with context):

| Objective | Everyday example on SauceDemo |
|---|---|
| Find defects and failures | Add-to-cart button does nothing for **problem_user** |
| Check requirements are met | Checkout total = item total + tax |
| Build confidence for a release decision | All critical flows pass on Chrome, Safari and Firefox |
| Reduce risk | Payment and login are tested deepest because failures there cost money |
| Comply with contracts, laws or standards | Accessibility checks for a government client |
| Give stakeholders information | "3 open Major defects in checkout; recommend no-go" |

**Testing vs debugging.** Testing *triggers* a failure (or finds a defect directly in a review). Debugging is the developer's activity of reproducing, diagnosing and fixing the cause. After the fix, the tester runs **confirmation testing** (does the original failure still happen?) and **regression testing** (did the fix break anything else?).

**In interviews, say this:** "Testing is about providing information on quality and risk so the team can make a release decision. Finding defects is the main way we do that, but we can never prove the software is defect-free."`,
      keyPoints: [
        'Testing finds defects and reports quality; debugging (by developers) removes them.',
        'Confirmation testing and regression testing follow every fix.',
        'Objectives depend on context: a banking app and a game prototype are tested differently.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.1 What is Testing?, 1.1.2 Testing and Debugging; Glenford Myers — The Art of Software Testing, Ch 2',
    },
    {
      heading: 'Error, defect, failure and root cause',
      body: `**Intuition:** a chef misreads a recipe (error), so the written recipe card now says "2 cups salt" (defect), and a customer spits out the soup (failure). The root cause is the smudged, handwritten recipe.

| Term | Who / where | Synonyms | ATM example |
|---|---|---|---|
| **Error** | A human mistake | Mistake | Developer thinks daily limit is checked per transaction, not per day |
| **Defect** | A flaw in a work product (code, requirement, test case, build script) | Bug, fault | The code compares each withdrawal against 20,000 but never sums the day's withdrawals |
| **Failure** | The system does something wrong while running | Incident (in production) | A customer withdraws 20,000 three times in one day |
| **Root cause** | The fundamental reason the error was made | — | The requirement said "limit of 20,000" without "per day"; no review caught it |

Key facts from the syllabus:

- A defect **may never cause a failure** if that code path is never executed (e.g. a bug in leap-year logic only fires on 29 February).
- Failures can also come from the **environment** (a misconfigured server, an expired certificate, radiation corrupting firmware) with no code defect at all.
- Defects live in **documents too**: a wrong expected result in a test case is a defect in testware.
- **Root cause analysis** (e.g. "5 whys") aims to stop the *class* of defect from recurring, not just this one instance.

**Common mistake:** saying "bug" for everything. In an interview, use the precise chain: "My review found a *defect* in the requirement; in production it would have caused a *failure*."`,
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
        'Environment conditions can cause failures without a code defect.',
        'Root cause analysis fixes the process so the defect class does not repeat.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.2.3 Errors, Defects, Failures, and Root Causes',
    },
    {
      heading: 'The seven testing principles',
      body: `**Intuition:** these are the "laws of physics" of testing: they explain why you can never test everything, why you start early, and why a bug-free product can still flop.

CTFL v4.0 renamed two of them: the **pesticide paradox** is now **"tests wear out"**, and the **absence-of-errors fallacy** is now the **absence-of-defects fallacy**. Interviewers still use the old names, so know both.

| # | Principle | What it means | SauceDemo / real example |
|---|---|---|---|
| 1 | Testing shows the presence, not the absence, of defects | Passing tests lower risk; they never prove correctness | 200 checkout tests pass, yet a rounding bug appears for a cart of 7 items |
| 2 | Exhaustive testing is impossible | Too many input/path/environment combinations | A 10-character coupon field over 62 symbols has 62^10 values; use EP/BVA and risk |
| 3 | Early testing saves time and money | Defects removed early do not spread into later work products | Reviewing the story "coupon applies to cart" catches "before or after tax?" before coding |
| 4 | Defects cluster together | A few modules hold most defects (Pareto) | Most escaped bugs in the last 3 releases came from the checkout and promo engine |
| 5 | Tests wear out | Repeating the same tests finds fewer new bugs | Your regression suite always uses **standard_user**; vary data and add new tests |
| 6 | Testing is context dependent | No single approach fits every product | A pacemaker needs formal, documented testing; a startup landing page needs fast exploratory checks |
| 7 | Absence-of-defects fallacy | A defect-free system can still fail users | A perfectly working checkout that asks for 14 fields loses customers; validation matters |

**Exam/interview nuance:** principle 5 says repetition *loses power to find new bugs*, but repetition is still valuable for **automated regression**, where the goal is to detect that something that used to work has broken.`,
      keyPoints: [
        'Use the principles to justify decisions: why you prioritise, why you start early, why you rotate test data.',
        'Know both old and new names for principles 5 and 7.',
        'Principle 4 (clustering) feeds risk-based testing: test hot spots deeper.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.3 Testing Principles (citing Buxton 1970, Manna 1978, Boehm 1981, Enders 1975, Beizer 1990, Kaner 2011)',
    },
    {
      heading: 'SDLC models and where testing fits',
      body: `**Intuition:** the SDLC (Software Development Life Cycle) is the recipe a team follows to build software. The recipe decides *when* testers get involved and *how much* documentation they write.

| Model | Shape | When testing happens | Strengths | Weaknesses for QA |
|---|---|---|---|---|
| **Waterfall** | Sequential: requirements → design → code → test → deploy | After coding is "finished" | Clear phases, heavy documentation | Defects found late and expensive; little room for change |
| **V-model** | Sequential, but each dev phase is paired with a test level | Test *design* starts alongside each dev phase; execution after code | Early test planning, clear traceability | Still rigid; working software appears late |
| **Iterative / Incremental** | Build in slices; each increment adds features | Every increment gets static + dynamic testing | Early feedback, risk spread out | Growing regression burden every increment |
| **Agile (Scrum/Kanban)** | Short sprints, continuous delivery | Continuously, inside the sprint, by the whole team | Fast feedback, change welcome | Light documentation; needs automation for regression |
| **Spiral** | Repeated risk-driven loops: plan → risk analysis → build → evaluate | Each loop, focused on the highest risks | Good for large, risky systems | Complex and costly to manage |

**Good practices in every model** (CTFL 2.1.2): every development activity has a matching test activity; each test level has distinct objectives; test analysis for a level starts during the matching development phase; testers review drafts as soon as they exist.

**In interviews, say this:** "In my last project we worked in two-week Scrum sprints. I reviewed stories during refinement, wrote test cases while developers coded, tested stories as soon as they reached QA, and ran regression before the sprint release." Then name the tools you used.`,
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
        'The SDLC choice changes test timing, documentation depth, automation level and the tester role.',
        'V-model = Waterfall with a test level mapped to every development phase.',
        'Agile relies on lightweight docs plus automated regression because every sprint changes the product.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.1 Testing in the Context of an SDLC; Software Testing Help — SDLC models tutorial',
    },
    {
      heading: 'STLC: the six phases with entry criteria, exit criteria and deliverables',
      body: `**Intuition:** if the SDLC is building the house, the STLC (Software Testing Life Cycle) is the inspector's own checklist: read the blueprints, plan the inspection, write the checks, prepare the tools, inspect, hand over the report.

The classic interview version has six phases. (The ISTQB names the same work as *test planning, monitoring & control, analysis, design, implementation, execution, completion*; mention that mapping and you sound senior.)

| Phase | Entry criteria (can we start?) | Key activities | Exit criteria (are we done?) | Deliverables |
|---|---|---|---|---|
| 1. Requirement analysis | Requirements/user stories available; access to BA/PO | Identify testable requirements, ask clarifying questions, note automation candidates | Questions answered; testable requirements listed | Requirement query log, initial RTM, automation feasibility notes |
| 2. Test planning | Requirements analysed | Scope, approach, estimates, schedule, roles, tools, risks, entry/exit criteria | Plan reviewed and approved | Test plan, effort estimate |
| 3. Test case development | Approved plan; stable requirements | Write and peer-review scenarios, test cases, test data; automation scripts | Cases reviewed and baselined; data ready | Test cases, test data, updated RTM |
| 4. Test environment setup | Environment needs known; build available | Set up servers, URLs, accounts, devices; run a smoke test | Environment works; smoke test passed | Ready environment, smoke results |
| 5. Test execution | Cases ready; build deployed; environment stable | Execute, log results, raise defects, retest fixes, run regression | Planned tests executed; no open Critical/Blocker; agreed pass rate | Execution log, defect reports, updated RTM |
| 6. Test closure | Execution finished; exit criteria evaluated | Summary report, metrics, lessons learned, archive testware | Report signed off | Test summary/closure report, lessons learned |

**Entry vs exit criteria.** Entry criteria are the preconditions for starting an activity (people, environment, test data, a build that passed smoke). Exit criteria define "done" (coverage reached, no open critical defects, all planned tests executed). In Agile these become the **Definition of Ready** and **Definition of Done**. Running out of time can also end testing, but only if stakeholders **accept the remaining risk** explicitly.

**Worked example (coupon feature):** see the entry/exit criteria snippet below. Notice that every criterion is *measurable*.`,
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
        'Six phases; each has entry criteria, activities, exit criteria and deliverables.',
        'Criteria must be measurable ("0 open Critical defects"), not vague ("testing is good").',
        'Environment setup can run in parallel with test case development.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.1 Test Activities and Tasks, 5.1.3 Entry Criteria and Exit Criteria; Guru99 — Software Testing Life Cycle',
    },
    {
      heading: 'Verification vs validation',
      body: `**Intuition:** you order a blue shirt in size M. **Verification:** is it blue, size M, stitched as the order says? **Validation:** does it actually fit you and do you like wearing it? A shirt can pass verification and still fail validation.

Barry Boehm's famous phrasing:

- **Verification:** "Are we building the product **right**?" Checks the work product against its **specification**.
- **Validation:** "Are we building the **right** product?" Checks the product against the **user's real needs** in its intended environment.

| Aspect | Verification | Validation |
|---|---|---|
| Question | Built according to spec? | Solves the user's actual problem? |
| Compared against | Requirements, design, standards | User needs, business goals |
| Typical activities | Reviews, walkthroughs, inspections, static analysis, most system testing against requirements | UAT, beta testing, usability sessions, demos to the PO |
| Needs running code? | Not always (reviews are static) | Usually yes (or a prototype) |
| Who leads | QA, developers, BAs | End users, customers, PO, with QA support |
| V-model side | Left side (and spec-based tests) | Right side, especially acceptance |

**Worked example: the coupon field.** The spec says "a coupon gives 10% off the cart". Verification: a test applies SAVE10 to a 1,000 cart and checks the total is 900. It passes. Validation: in a UAT session the marketing team realise customers expect the discount *before* shipping is added and that coupons should not stack with sale prices. The feature matches the spec but not the business need. This is exactly the **absence-of-defects fallacy**.

**Common mistake:** saying "verification is static and validation is dynamic". Mostly true as a rule of thumb, but you can verify with dynamic tests against a spec and validate with a paper prototype.`,
      keyPoints: [
        'Verification = conformance to specification; validation = fitness for the user\'s purpose.',
        'You need both: passing every spec-based test does not guarantee users are happy.',
        'Give a concrete example when asked; definitions alone sound memorised.',
      ],
      source: 'Barry Boehm — Software Engineering Economics (1981); ISTQB CTFL v4.0.1 — 1.3 principle 7, 2.2.1 Acceptance testing',
    },
    {
      heading: 'QA vs QC vs testing',
      body: `**Intuition:** in a restaurant, **QA** is writing the hygiene rules and training the cooks; **QC** is tasting each dish before it leaves the kitchen; **testing** is the actual tasting.

| | Quality Assurance (QA) | Quality Control (QC) | Testing |
|---|---|---|---|
| Focus | **Process** | **Product** | Product |
| Nature | Preventive | Detective / corrective | Detective |
| Goal | Make good outcomes likely (a good process gives a good product) | Find defects in what was built | Execute or examine the product to find defects |
| Examples | Defining a Definition of Done, code review policy, test case templates, retrospectives, training | Test execution, inspections of deliverables, release checks | Running test cases, exploratory sessions, API checks |
| Who | Everyone on the project | Mostly testers and reviewers | Testers (and developers for unit tests) |

**Relationship:** testing is the biggest part of QC; QC is one input to QA (test results tell QA whether the process works). The ISTQB stresses that QA is **everyone's responsibility**, not just the "QA team". Many companies still call testers "QA engineers", so be ready to explain that your job title is broader than your daily activity.

**In interviews, say this:** "QA prevents, QC detects. In my team, QA was our Definition of Done and the review checklist; QC was my test execution and defect reporting. Defect trends from QC fed back into QA in retrospectives."`,
      keyPoints: [
        'QA = process and prevention; QC = product and detection; testing ⊂ QC.',
        'Test results serve both: QC uses them to fix defects, QA uses them to improve the process.',
        'Quality is a whole-team responsibility.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.2.2 Testing and Quality Assurance (QA)',
    },
    {
      heading: 'Static vs dynamic testing and reviews',
      body: `**Intuition:** static testing is reading the cake recipe and noticing it says "bake at 900°C"; dynamic testing is baking the cake and watching it burn. Static finds the **defect** directly; dynamic shows you the **failure**.

| | Static testing | Dynamic testing |
|---|---|---|
| Runs the code? | No | Yes |
| What it examines | Requirements, user stories, designs, code, test cases, contracts | The running software |
| Finds | Defects directly (ambiguity, missing cases, coding-standard violations, unreachable code) | Failures, which developers then debug to find the defect |
| When | From day one, before code exists | Once a build exists |
| Techniques | Reviews, static analysis (linters, SAST tools) | Test techniques (EP, BVA, exploratory, automation) |

**Review types** (least to most formal):

| Type | Led by | Formality | Main purpose |
|---|---|---|---|
| Informal review | Anyone (pair, buddy check) | No defined process or documented output | Quickly detect anomalies |
| Walkthrough | The **author** | Low to medium | Educate, build consensus, find anomalies |
| Technical review | A **moderator**; technical peers review | Medium | Reach consensus and decide on technical problems |
| Inspection | A trained **moderator**; roles, checklists, metrics | Highest; defined entry/exit criteria | Find the maximum number of anomalies, collect metrics for process improvement |

**Review roles:** manager, author, moderator (facilitator), scribe (recorder), reviewer, review leader. **Review process:** planning → initiation → individual review → communication & analysis → fixing & reporting.

**Worked example:** the review comments below were raised on a coupon story *before any code existed*. Each one is a defect found statically.`,
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
        'Walkthrough = author-led; inspection = most formal, moderator-led, metric-driven.',
        'Testers add the most value in refinement by asking "how will we know it works?"',
      ],
      source: 'ISTQB CTFL v4.0.1 — 3.1 Static Testing Basics, 3.2.2–3.2.4 Review process, roles and types',
    },
    {
      heading: 'Cost of defects and shift-left',
      body: `**Intuition:** fixing a typo in a blueprint costs an eraser; fixing the same mistake after the wall is built costs a demolition crew.

**The cost-of-change idea** (Boehm 1981 and many later studies): the later a defect is found, the more it costs, because more work has been built on top of it and more people are involved (support tickets, hotfix, redeploy, reputation). A widely quoted rule of thumb is roughly **1 : 10 : 100** for requirements : testing : production. The exact multipliers are debated and vary by project, so present them as an *illustration*, not a law.

| Found in | What fixing involves | Relative cost (illustrative) |
|---|---|---|
| Requirements review | Edit a sentence | 1x |
| Design / code review | Change design or a few lines | ~5x |
| System testing | Debug, fix, rebuild, retest, regression | ~10x |
| Production | Incident, hotfix, data repair, customer support, lost trust | ~30–100x+ |

**Shift-left** = moving testing activities earlier. Practices named in CTFL v4.0:

- Testers review specifications and stories (static testing).
- Write test cases (or automated tests, TDD/BDD) **before** the code.
- Use **CI/CD** so automated checks run on every commit.
- Run **static analysis** before dynamic testing.
- Start **non-functional** testing (e.g. performance of an API) at component level when possible.

Shift-left does **not** mean "stop testing later". Production monitoring and exploratory testing on the integrated system are sometimes called **shift-right** and complement it.

**For your automation journey:** every Playwright test you add to CI is a shift-left move: the check runs minutes after a developer pushes code instead of days later in a manual regression cycle.`,
      keyPoints: [
        'Later = costlier: more rework, more people, more customer impact.',
        'Shift-left practices: story reviews, tests-first, CI, static analysis, early non-functional tests.',
        'Quote cost multipliers as illustrative; interviewers dislike made-up precision.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.3 principle 3, 2.1.5 Shift Left; Barry Boehm — Software Engineering Economics (1981)',
    },
    {
      heading: 'The role of a QA engineer (manual to automation)',
      body: `**Intuition:** a QA engineer is the team's professional sceptic and the user's representative: the person who asks "what could go wrong?" and "how would a real customer use this?".

**What a QA engineer does across the cycle:**

| When | Activity |
|---|---|
| Refinement / planning | Review stories, clarify acceptance criteria, estimate test effort, flag risks |
| During development | Write test cases and data, prepare environments, pair with developers, write automated checks |
| Story ready for test | Execute tests, explore, raise clear defect reports, retest fixes |
| Before release | Regression, smoke on staging, go/no-go input with evidence |
| After release | Smoke in production, monitor escaped defects, retrospective improvements |

**Independence of testing** (CTFL 1.5.3): testers who did not write the code notice different defects because they have different assumptions (Myers also advised that programmers should avoid being the only testers of their own program). The drawback: too much independence isolates testers and makes developers feel quality is "someone else's job". Modern teams mix: developers own unit tests, QA owns system-level risk and the test strategy, and everyone owns quality.

**Skills interviewers probe for a manual → automation profile:**

- Test design (EP, BVA, decision tables) and clear defect reports.
- Domain understanding and risk-based prioritisation.
- API testing (Postman), basic SQL for data checks.
- JavaScript/TypeScript and Playwright for automation, Git and CI basics.
- Communication: explaining risk to non-testers without drama.

**In interviews, say this:** "My manual background is my advantage in automation: I know *what* is worth automating and which assertions actually catch bugs."`,
      keyPoints: [
        'QA engineers add value from refinement to production, not just in "the test phase".',
        'Independence finds different defects but must not become isolation.',
        'Frame manual experience as test-design strength when moving to automation.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 1.4.5 Roles in Testing, 1.5 Essential Skills and Good Practices; Glenford Myers — The Art of Software Testing, Ch 2 testing principles',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-fundamentals-cc-1',
      title: 'Rewrite vague exit criteria into measurable ones',
      context: `Your lead asks you to fix the exit criteria section of the system test plan for the SauceDemo checkout release. The current text was copied from an old project and nobody can tell when testing is actually "done".`,
      task: `Rewrite the exit criteria (and add the missing suspension/resumption rules) so that any stakeholder could look at the test dashboard and say objectively whether testing is complete. Keep it realistic for a two-week release.`,
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
        'Replace every adjective ("most", "stable", "satisfied") with a number or a yes/no check.',
        'Think about coverage (what was executed), defects (by severity), and evidence (reports, sign-off).',
        'What happens if time runs out before the criteria are met? Who accepts the risk?',
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

- **"Testing should be completed" → X1/X2:** defines complete as *executed with a status*, and ties coverage to requirements through the RTM.
- **"Most bugs fixed" → X4–X6:** severity-based thresholds; Major defects can stay open only with an explicit, recorded PO decision.
- **"Stable" / "satisfied" → X7/X8:** a pass rate on a named build plus a smoke run after the final deploy; feelings are replaced by evidence.
- **"Regression if time permits" → X3:** regression is mandatory and scoped (which suite, which browsers).
- **Reporting (X9) and risk acceptance:** the CTFL notes that running out of time can end testing only when stakeholders accept the risk; the rewrite makes that explicit.
- **Suspension/resumption rules** prevent wasting a day testing on a broken build.`,
      followUps: [
        {
          q: 'The PO says "we release Friday no matter what". Are your exit criteria pointless then?',
          a: 'No. Exit criteria are an information tool, not a veto. If Friday arrives and X4 fails, the summary report lists exactly which criteria are unmet and what the risk is (e.g. one open Critical in coupon calculation). The PO can still release, but now it is an informed, documented decision, and the team can plan a hotfix or a feature flag.',
        },
        {
          q: 'How do these exit criteria change in a Scrum team with no separate test phase?',
          a: 'They become part of the Definition of Done for each story (ACs tested, no open Critical defects, automated checks added, regression green in CI) plus a lighter release-level checklist. The idea is the same: objective, agreed conditions for "done", but checked continuously per story instead of once at the end.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-cc-2',
      title: 'Turn a weak requirement review into actionable static-testing feedback',
      context: `You were asked to review the ATM cash-withdrawal requirement before development starts. A colleague already left a review comment, and the BA says it is not useful.`,
      task: `Rewrite the review as a set of specific findings a BA can act on. Classify each finding, explain the risk, and propose a question or fix. This is static testing: no code exists yet.`,
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
        'What does "valid amount" mean? Think of note denominations, minimum and maximum, and balance.',
        'Is the 20,000 limit per transaction, per day, per card or per account? Inclusive?',
        'List each error situation separately and ask what the user should see.',
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

- **Specific and located:** each finding quotes the exact phrase it is about, so the BA can edit the sentence directly.
- **Classified:** ambiguity / missing rule / boundary / testability tells the team *what kind* of defect each one is, which helps review metrics (a QA activity).
- **Risk-driven:** findings that can lose money (F6, F7) are flagged as blockers for Definition of Ready.
- **Proposes, not just complains:** every finding offers a likely answer or a precise question.
- **Boundary thinking early:** F3 prevents the classic off-by-one defect before code exists, which is the cheapest moment to fix it (early testing principle).
- **"Test properly" removed:** that sentence was about the reviewer, not the work product, and gave nothing actionable.`,
      followUps: [
        {
          q: 'Which review type would you use for a money-critical requirement like this, and why?',
          a: 'A technical review or a lightweight inspection: a moderator runs it, reviewers prepare individually with a checklist (limits, errors, reversals, audit), findings are logged and tracked to closure, and exit criteria are defined (all money-impacting findings resolved). An informal buddy check is too weak for something that can lose customer money.',
        },
        {
          q: 'How would you measure whether reviews like this are worth the time?',
          a: 'Track defects found in review vs defects found later for the same features, review effort in hours, and escaped defects linked to unclear requirements. If reviews find, say, 9 issues in 1 hour that would each have cost hours of debugging and retesting later, the ROI is obvious. Present it in the retrospective so it improves the process (QA).',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-fundamentals-iq-01',
      difficulty: 'easy',
      question: 'Walk me through the STLC as you actually followed it on your last project, including what had to be true before each phase started.',
      context: 'Very common opener in manual and SDET-1 interviews; candidates on Glassdoor and Testleaf 2025 lists report STLC as a near-certain question.',
      whatInterviewerLooksFor: [
        'Names the six phases in order without hesitation',
        'Mentions entry/exit criteria and deliverables, not just phase names',
        'Grounds it in a real project and tools (Jira, Xray/TestRail)',
        'Knows that phases overlap and loop in Agile',
      ],
      modelAnswer: `**Structure:** phases → what I produced → how it looked in our sprints.

1. **Requirement analysis.** Entry: stories available. I reviewed acceptance criteria, logged questions for the PO, and marked which requirements were testable and which were automation candidates. Output: query log and a first RTM.
2. **Test planning.** For each release my lead wrote the plan; I contributed estimates and risks. Output: test plan with scope, approach, environments, entry/exit criteria.
3. **Test case development.** Entry: approved scope. I wrote scenarios and detailed cases in Xray, got them peer-reviewed, and prepared test data (e.g. coupons that are valid, expired, used-up). Output: baselined cases linked to stories.
4. **Environment setup.** Entry: build on QA env. DevOps deployed; I ran the 12-case smoke suite. If smoke failed, the build went back (no execution on a broken build).
5. **Test execution.** Entry: smoke passed, cases ready. Executed, logged defects with steps and evidence, retested fixes, ran regression. Output: execution status, defects, updated RTM.
6. **Test closure.** Entry: exit criteria evaluated. I prepared the summary report (executed/passed/failed, open defects by severity, risks) and we captured lessons learned.

**Reality check:** in Scrum these phases happen *per story* and overlap: I analysed sprint N+1 stories while executing sprint N. Exit criteria showed up as our Definition of Done.`,
      followUps: [
        {
          q: 'What do you do if the smoke test fails in environment setup?',
          a: 'I stop and reject the build back to development with the failing smoke cases and evidence, because executing a full cycle on an unstable build wastes effort and produces misleading results. Meanwhile I continue work that does not need the build: test design, data preparation, automation scripts. Testing resumes when a new build passes smoke.',
        },
        {
          q: 'Which STLC phase can run in parallel with another?',
          a: 'Test environment setup can run in parallel with test case development, since both only need the approved plan. In Agile, requirement analysis for the next sprint overlaps execution of the current one. The phases are a logical order of concerns, not a strict calendar sequence.',
        },
        {
          q: 'How is the ISTQB test process different from these six phases?',
          a: 'ISTQB names planning, monitoring and control, analysis, design, implementation, execution and completion. Analysis is "what to test", design is "how to test", implementation prepares testware and environment. Monitoring and control runs throughout. It is the same work, sliced differently, and explicitly iterative.',
        },
      ],
      pitfalls: [
        'Listing phase names with no entry/exit criteria or deliverables',
        'Confusing STLC with SDLC or with the defect life cycle',
        'Claiming phases are strictly sequential even in Agile',
      ],
    },
    {
      id: 'mt-fundamentals-iq-02',
      difficulty: 'medium',
      question: 'Explain verification and validation using a feature you have actually tested, and tell me which activity on your team caught a problem the other one missed.',
      whatInterviewerLooksFor: [
        'Correct Boehm definitions (built right vs right product)',
        'A concrete feature example, not abstract words',
        'Understands that passing verification can still fail validation',
        'Knows typical activities for each (reviews vs UAT/demos)',
      ],
      modelAnswer: `**Definitions.** Verification asks *"are we building the product right?"*: does the work product match its specification? Validation asks *"are we building the right product?"*: does it solve the user's real need?

**My example: a coupon field at checkout.**

- **Verification** activities: I reviewed the story and found that "reduces the total" did not say percentage or fixed amount (static verification). Later I executed spec-based tests: SAVE10 on a 1,000 cart gives 900; expired coupon shows "Coupon expired"; minimum cart 500 is inclusive. All passed.
- **Validation** activity: during the sprint demo, the marketing manager applied a coupon to a sale item and said, "Sale items should be excluded, otherwise we lose margin." Nothing in the spec said so. The feature was built *right* but was not the *right* feature yet.

**What it taught me:** verification protects us from building the spec wrongly; validation protects us from building the wrong spec. That is ISTQB's absence-of-defects fallacy in practice. Since then I ask in refinement, "who will use this and what do they expect?" and suggest a quick PO walk-through before the story is closed.

**Rule of thumb:** verification is usually static plus spec-based testing done by the team; validation is usually UAT, demos and beta feedback with real users.`,
      followUps: [
        {
          q: 'Is UAT verification or validation?',
          a: 'Primarily validation, because real users check that the system supports their business process in a realistic environment. Users may also notice spec deviations (verification), but the purpose of UAT is fitness for use and readiness for deployment, which is why the ISTQB places acceptance testing under validation.',
        },
        {
          q: 'Can a static review be validation?',
          a: 'Yes. Walking a stakeholder through a wireframe or prototype and asking "is this what you need?" is validation without running code. The split "verification is static, validation is dynamic" is a simplification; what defines them is what you compare against: the spec or the user need.',
        },
      ],
      pitfalls: [
        'Swapping the two definitions',
        'Saying "verification is done by QA, validation by developers"',
        'No concrete example, only memorised phrases',
      ],
    },
    {
      id: 'mt-fundamentals-iq-03',
      difficulty: 'medium',
      question: 'A developer tells the release meeting: "All 300 test cases passed, so this build is bug-free and we can stop testing." How do you respond?',
      whatInterviewerLooksFor: [
        'Uses testing principles (presence not absence, exhaustive impossible, tests wear out, absence-of-defects fallacy)',
        'Stays respectful and data-driven, not defensive',
        'Proposes concrete next steps or a risk statement',
        'Distinguishes "release-ready" from "bug-free"',
      ],
      modelAnswer: `**Tone first:** agree with the good news, then correct the conclusion. "That is a strong signal and it supports releasing; I would just phrase it as *low known risk*, not *bug-free*."

**Why, using the principles:**

1. **Testing shows presence, not absence.** 300 passing cases tell us those 300 conditions work; they say nothing about untested paths.
2. **Exhaustive testing is impossible.** Our 300 cases sample inputs, browsers and data. For example, did we test a cart with 50 items, or a coupon on a sale item?
3. **Tests wear out.** If these are the same 300 cases we have run for six releases with the same users, they are good at catching regressions but poor at finding new bugs in the new promo engine.
4. **Absence-of-defects fallacy.** Even with zero defects, the feature can still fail users if it does not match their need.

**What I would actually propose:**

- Report **coverage**: which requirements and risks were tested, which were not (RTM).
- A short **exploratory session** on the changed areas (where defects cluster).
- State **residual risks** in the summary and let the PO decide go/no-go.

**Close:** "So yes, release is reasonable if exit criteria are met, but let's say *no known critical defects* rather than *bug-free*."`,
      followUps: [
        {
          q: 'What would make you NOT agree to release even with 100% pass?',
          a: 'If the passing suite does not cover the changed, high-risk area (for example the new payment integration has no tests yet), if the tests ran on the wrong build or environment, or if exit criteria like "no open Critical defects" are unmet from other sources such as exploratory testing. A pass rate is only as meaningful as the coverage behind it.',
        },
        {
          q: 'How do you counter "tests wear out" in practice?',
          a: 'Rotate and vary test data (different users like problem_user or error_user on SauceDemo, different coupons, locales), add new cases for every escaped defect, run exploratory charters on changed areas each sprint, and review the suite periodically to remove cases that never fail and never cover risk.',
        },
      ],
      pitfalls: [
        'Agreeing that 100% pass means no defects',
        'Arguing emotionally instead of citing coverage and risk',
        'Blocking the release without offering options',
      ],
    },
    {
      id: 'mt-fundamentals-iq-04',
      difficulty: 'easy',
      question: 'Using an ATM withdrawal as the example, explain the difference between an error, a defect, a failure and a root cause.',
      whatInterviewerLooksFor: [
        'Correct causal chain error → defect → failure',
        'Knows not every defect causes a failure',
        'Mentions root cause and why it matters',
        'Uses the domain example consistently',
      ],
      modelAnswer: `**The chain:** a person makes an **error**, which creates a **defect** in a work product, which may cause a **failure** when executed. The **root cause** is why the error happened.

**ATM example:**

- **Error:** the developer misunderstood the rule and believed the 20,000 limit applies *per transaction*.
- **Defect:** the code checks each withdrawal against 20,000 but never adds up the day's total.
- **Failure:** a customer withdraws 20,000 three times in one day, and the bank's daily limit is breached. That is what a tester or customer observes.
- **Root cause:** the requirement just said "limit is 20,000" without "per day", and the story was never reviewed by QA. Fixing the code fixes this defect; fixing the *root cause* (requirement template with mandatory scope for limits, plus QA review in refinement) prevents the next one.

**Extra points:**

- A defect can sit silently: if the ATM network has a separate daily-limit check upstream, the defect may never produce a failure.
- A failure can happen with no code defect, e.g. the ATM's clock is misconfigured so the "day" resets at the wrong time (environment).
- Defects also live in test cases: if my expected result says 25,000 is allowed, that is a defect in testware.`,
      followUps: [
        {
          q: 'Where do you report each of these in practice?',
          a: 'Failures I observe go into a defect report in Jira with steps, expected vs actual, and evidence. The developer identifies the defect while debugging. The root cause is usually captured in the defect\'s resolution fields or in a root-cause analysis for serious or production issues, and recurring root causes are discussed in retrospectives.',
        },
        {
          q: 'Give an example of a defect that would not cause a failure for months.',
          a: 'A date bug that only triggers on 29 February, a currency rounding error that only shows for a rarely used currency, or an error handler with a typo that only runs when a third-party service is down. The defect exists from day one; the failure waits for the triggering condition.',
        },
      ],
      pitfalls: [
        'Treating the three words as synonyms',
        'Saying a failure is always caused by a code defect',
        'Forgetting the root cause or confusing it with the defect',
      ],
    },
    {
      id: 'mt-fundamentals-iq-05',
      difficulty: 'medium',
      question: 'Your new team works in two-week Scrum sprints and says "we do not have an STLC or a test phase here". How does testing fit into their SDLC, and what would you change?',
      whatInterviewerLooksFor: [
        'Understands STLC activities still exist, compressed per story',
        'Knows Agile relies on light docs and automated regression',
        'Mentions DoR/DoD as entry/exit criteria',
        'Suggests practical improvements, not a waterfall rollback',
      ],
      modelAnswer: `**Agree with the spirit, correct the letter.** There is no separate test *phase*, but every STLC *activity* still happens, just per story and continuously.

| STLC activity | Where it lives in Scrum |
|---|---|
| Requirement analysis | Backlog refinement, three amigos (PO, dev, QA) |
| Test planning | Sprint planning: test tasks and estimates per story; a lightweight test strategy per release |
| Test design | While developers code: scenarios, acceptance tests in Gherkin, automation scripts |
| Environment setup | CI pipeline deploys each merge to a QA environment |
| Execution | Story testing as soon as it is merged, automated checks in CI, exploratory sessions |
| Closure | Sprint review/demo, release notes, retrospective |

Entry/exit criteria become the **Definition of Ready** (story has testable ACs, designs, data) and the **Definition of Done** (ACs tested, no open Critical defects, automated checks added, regression green).

**What I would change if things were weak:**

1. Join refinement and ask for examples in ACs (shift-left).
2. Make "automated regression passing" part of the DoD, otherwise regression debt grows every sprint (iterative models need extensive regression, as CTFL notes).
3. Avoid the **mini-waterfall** trap: testing everything on day 9. Split stories smaller and test as soon as each slice is merged.
4. Keep just enough documentation: a test strategy page, test cases for high-risk flows, charters for exploration.`,
      followUps: [
        {
          q: 'What is a "mini-waterfall" sprint and why is it a problem?',
          a: 'It is when developers code for most of the sprint and hand everything to QA in the last two days. Testing becomes a bottleneck, defects are found too late to fix inside the sprint, and stories spill over. The fix is smaller stories, earlier hand-offs, developers testing too, and automation running in CI on every merge.',
        },
        {
          q: 'Do you still write test cases in Agile?',
          a: 'Yes, but proportionate to risk. High-risk and regulated flows (payment, login) get detailed cases or automated tests; low-risk UI tweaks may be covered by acceptance criteria plus an exploratory charter. Automated tests are themselves executable test cases, so moving to Playwright often replaces written regression cases.',
        },
      ],
      pitfalls: [
        'Saying Agile has no testing process at all',
        'Trying to impose heavy waterfall documentation',
        'Forgetting regression automation in an iterative model',
      ],
    },
    {
      id: 'mt-fundamentals-iq-06',
      difficulty: 'hard',
      question: 'The build for a new loan-application feature will not reach QA for three weeks, but the requirements are ready today. What do you do in those three weeks?',
      whatInterviewerLooksFor: [
        'Uses static testing and shift-left, not "wait for the build"',
        'Concrete outputs: review findings, test design, data, automation skeleton',
        'Knows review types and how to run one',
        'Manages risk and communicates early',
      ],
      modelAnswer: `**Principle:** early testing saves time and money, so the three weeks are the most valuable testing time I will get.

**Week 1: static testing of the requirements**

- Review the stories and rules (eligibility, income thresholds, document upload, decision messages) for ambiguity, missing rules and boundaries, e.g. "age 21–60": inclusive? Which date is age calculated from?
- Run a short **walkthrough** with the BA, then log findings in Jira so they are tracked to closure.
- Draft the **RTM** so every requirement has an owner and later a test.

**Week 2: test analysis and design**

- Identify test conditions and risks (credit decision logic is high risk; the help page is low).
- Design cases with EP/BVA and decision tables for eligibility rules; write Gherkin scenarios with the PO as acceptance criteria.
- Define test data needs: applicants at each boundary, documents of each type and size, masked realistic data.

**Week 3: implementation and environment**

- Request environment, accounts and third-party sandbox (credit bureau stub).
- Write API checks in Postman against the agreed contract or mock.
- Prepare Playwright test skeletons and page objects from the wireframes, so automation is ready the day the UI arrives.
- Agree entry criteria for execution (smoke suite, test data loaded).

**Communication:** share a short risk note: "3 open questions on eligibility could change scope; answers needed by Friday."

Result: when the build lands, I start execution on day one instead of day five, and many defects never get coded at all.`,
      followUps: [
        {
          q: 'The BA says your review comments are "just testing nitpicks". How do you handle it?',
          a: 'Prioritise and quantify. I separate findings into must-answer (money, compliance, ambiguous rules that change logic) and nice-to-have (wording). For the critical ones I show the concrete failure each could cause, e.g. a 60-year-old applicant being rejected if the boundary is exclusive. Framing findings as risk to the business, not criticism of the BA, usually ends the debate.',
        },
        {
          q: 'How would you test before the UI exists?',
          a: 'Test at lower levels and with doubles: review API contracts, test the API with Postman or the Playwright request fixture as soon as an endpoint exists, use mocks or stubs for missing services, and validate business rules with decision tables. The UI is the last layer, so most logic can be checked earlier.',
        },
      ],
      pitfalls: [
        '"I would wait for the build" or "I would do regression on other modules" only',
        'Doing reviews without logging or tracking findings',
        'Ignoring test data and environment preparation',
      ],
    },
    {
      id: 'mt-fundamentals-iq-07',
      difficulty: 'medium',
      question: 'Your manager says "the QA team owns quality, so production bugs are QA\'s fault." Do you agree? Use the difference between QA, QC and testing in your answer.',
      whatInterviewerLooksFor: [
        'Correct QA (process, preventive) vs QC (product, detective) distinction',
        'Quality is a whole-team responsibility',
        'Takes ownership of testing gaps without blame games',
        'Suggests process improvements',
      ],
      modelAnswer: `**Partly.** I own the quality of *my testing*, but quality itself is a whole-team outcome.

**The distinction:**

- **QA (quality assurance)** is process-focused and preventive: definitions of done, review practices, coding standards, test strategy, retrospectives. The ISTQB says QA is the responsibility of *everyone* on the project.
- **QC (quality control)** is product-focused and detective: inspecting and testing what was built.
- **Testing** is the main form of QC: running or examining the product to find defects.

So a "QA team" in most companies mainly performs QC (testing), while true QA needs developers, PO, DevOps and testers together.

**How I would respond to a production bug:**

1. **Own my part:** was there a test gap? Was it in the RTM? Did we skip a browser? I add a regression test (ideally automated) for it.
2. **Do a blameless root-cause analysis:** maybe the requirement was ambiguous, the code was not reviewed, or the environment differed from production.
3. **Improve the process (QA):** e.g. add "QA reviews stories in refinement" to the DoR, or contract tests for the third-party API.

**Sound bite:** "Testers can't test quality into a product. We provide information about quality; the whole team builds it."`,
      followUps: [
        {
          q: 'Give one QA (process) improvement you introduced or would introduce.',
          a: 'A short review checklist for user stories used during refinement: are boundaries inclusive or exclusive, are error messages specified, what about empty, very long and special-character inputs, and which roles can do this. It costs five minutes per story and prevents a whole class of ambiguity defects before code is written.',
        },
        {
          q: 'What metric would show whether quality is improving?',
          a: 'Defect leakage (escaped defects found in production divided by total defects for the release) trended over releases, alongside the severity of escaped defects. A falling leakage rate with stable release frequency shows the process is catching more issues earlier, which is the real goal of QA.',
        },
      ],
      pitfalls: [
        'Fully accepting blame or fully rejecting responsibility',
        'Saying QA and QC are the same thing',
        'No concrete improvement suggested',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-fundamentals-drill-1',
      question: 'Classify each item as an error, a defect, a failure or a root cause (all from one SauceDemo-like shop): (a) the cart badge shows 3 after removing one of 3 items; (b) the "removeFromCart" function forgets to decrement the counter; (c) the developer assumed the counter is recalculated by the server; (d) the API contract never documented who owns the counter; (e) a test case expects "badge hidden" when 1 item remains.',
      assumptions: [
        'Error = human mistake; defect = flaw in a work product; failure = observed wrong behaviour at runtime; root cause = underlying reason the error occurred.',
        'Work products include code AND test cases.',
      ],
      steps: [
        { label: '(a) badge shows 3', calc: 'Observed wrong behaviour while running the app → FAILURE.' },
        { label: '(b) function never decrements', calc: 'Flaw in the code → DEFECT (the cause of failure a).' },
        { label: '(c) developer assumed server recalculates', calc: 'Human mistake in thinking → ERROR.' },
        { label: '(d) contract never documented ownership', calc: 'Why the developer made that mistake → ROOT CAUSE (fix the API documentation/review process).' },
        { label: '(e) test expects badge hidden with 1 item', calc: 'Wrong expected result in testware (should show 1) → DEFECT in a test case.' },
      ],
      answer: '(a) failure, (b) defect, (c) error, (d) root cause, (e) defect (in the test case, not the product).',
      insight: 'The chain is error → defect → failure, with root cause behind the error. Defects also live in testware, so reviewing test cases is real testing work.',
      followUps: [
        {
          q: 'Which of these would a static review find, and which only dynamic testing?',
          a: 'A code review could find (b) directly and a test case review could find (e); a review of the API contract could expose (d). Item (a), the failure itself, is only seen when the software runs (dynamic testing). That is the core static vs dynamic difference: static finds defects, dynamic reveals failures.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-drill-2',
      question: 'It is Monday of release week for the coupon feature. Given the status board below, decide for each of the six activities whether it can start/finish today, citing the entry or exit criterion that decides it: (1) start system test execution, (2) mark test case development complete, (3) start regression, (4) close test cycle, (5) start environment setup, (6) begin writing the closure report.',
      assumptions: [
        'Board: build 2.14.0 deployed; smoke 11 of 12 passed (failing case: "apply valid coupon" returns 500 error).',
        '42 test cases written; 38 peer-reviewed; 4 awaiting review.',
        'Test data for expired and used-up coupons not yet loaded.',
        'Exit criteria for the cycle: 100% executed, 0 open Critical, summary report reviewed.',
        'Entry for execution: smoke 100% pass, reviewed cases, test data loaded.',
      ],
      steps: [
        { label: '(1) Start execution?', calc: 'Smoke 11/12 ≠ 100%, the failing case is the core feature, data missing → NO. Reject build, raise a Blocker.' },
        { label: '(2) Test case development complete?', calc: '38/42 reviewed and data not loaded → NO. Finish 4 reviews + load data today.' },
        { label: '(3) Start regression?', calc: 'Regression needs a stable build; smoke failed → NO (would produce noise).' },
        { label: '(4) Close test cycle?', calc: '0% executed, Blocker open → NO; exit criteria far from met.' },
        { label: '(5) Environment setup?', calc: 'Already done (build deployed), but the env is not "ready" until smoke passes → in progress, waiting on fix.' },
        { label: '(6) Closure report?', calc: 'Can draft the template and risk section early, but cannot finalise without execution results → draft only.' },
      ],
      answer: `Only preparation work proceeds today: finish the 4 reviews, load the missing coupon data, raise the smoke failure as a Blocker and reject build 2.14.0. Execution, regression and closure wait for a build that passes smoke 100%. Send the PO a risk note: "Execution start slips by at least the fix time; Friday release at risk."`,
      insight: 'Entry criteria protect the team from wasting effort on a broken build; reporting the slip on Monday (not Thursday) is what makes you valuable.',
      followUps: [
        {
          q: 'The dev lead asks you to "just start testing the other 41 cases anyway". Do you?',
          a: 'It depends on independence: if the 500 error is isolated to coupon application and the other cases do not depend on it (e.g. UI layout, validation messages for empty input), I can run those to gain information, clearly labelled as provisional on build 2.14.0. Anything that applies a coupon is blocked. I would still record that the entry criterion was waived and by whom.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-drill-3',
      question: 'Last release, 40 defects were found: 4 in requirement review, 6 in code review, 20 in system testing and 10 in production. Using illustrative fix costs of 1 hour (requirements), 3 hours (code review), 8 hours (system test) and 40 hours (production), compute the total fix effort, then estimate the saving if better story reviews move 5 of the production defects to requirement review.',
      assumptions: [
        'Fix cost per defect: requirements 1 h, code review 3 h, system test 8 h, production 40 h (illustrative, not universal).',
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
      answer: 'Total effort is 582 hours today. Moving 5 production defects into requirement review (plus 6 h extra review) brings it to about 393 hours, saving ~189 hours (~32%) per release.',
      insight: 'A quarter of the defects (those found in production) consumed ~69% of the effort. That is the business case for shift-left: a few hours of earlier reviewing buys back weeks of late fixing.',
      followUps: [
        {
          q: 'A manager challenges your 40-hour production cost. How do you defend the estimate?',
          a: 'Break it down: support ticket handling, reproducing with production data, hotfix branch, code review, emergency regression, deployment approvals, data correction scripts and customer communication. Even if each step is small, the people involved multiply. Better still, measure the last few real production incidents and replace my illustrative numbers with the team\'s own data.',
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
      explanation: `Principle 1: testing shows the presence of defects, not their absence. Passing tests reduce the probability of undiscovered defects but cannot prove there are none. 500 cases is still a sample, so it is not exhaustive (principle 2), and future changes will need regression testing.`,
      followUps: [
        {
          q: 'How would you phrase the result in a test summary report?',
          a: 'Something like: "All 500 planned cases passed on build 3.2.0-rc4, covering requirements CHK-01 to CHK-14; no known open Critical or Major defects; residual risks: not tested on Edge, coupon + sale-item combination not covered." It reports evidence and gaps, never "bug-free".',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-02',
      difficulty: 'easy',
      question: 'Your regression suite has run unchanged for a year with the same users and data and now almost never finds new bugs, even though users keep reporting issues. Which principle describes this?',
      options: ['Defects cluster together', 'Tests wear out (pesticide paradox)', 'Testing is context dependent', 'Absence-of-defects fallacy'],
      correct: [1],
      explanation: `Repeating identical tests makes them progressively less effective at finding new defects: the "tests wear out" principle (formerly the pesticide paradox). The fix is to vary data and add new tests. Defect clustering is about where bugs concentrate, and the absence-of-defects fallacy is about a defect-free product failing user needs.`,
      followUps: [
        {
          q: 'Name two concrete ways to refresh that suite on SauceDemo.',
          a: 'Run key flows with other users such as problem_user, performance_glitch_user and error_user, and vary carts (single item, all six items, remove-then-add). Also add a test for every production bug reported, and run a short exploratory charter on recently changed pages each sprint.',
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
      explanation: `Boehm's definitions: verification checks conformance to the specification (built right); validation checks fitness for the user's real need (right product). Option A swaps them, a very common interview slip. Options C and D describe specific quality attributes or approvals, not the verification/validation distinction.`,
      followUps: [
        {
          q: 'Name one verification activity and one validation activity from your last sprint.',
          a: 'Verification: reviewing a story\'s acceptance criteria and executing spec-based test cases for the coupon rules. Validation: the sprint demo where the PO and a marketing user tried the coupon flow and confirmed it matched how campaigns actually work, or flagged that it did not.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-04',
      difficulty: 'medium',
      question: 'Read the incident note below. Which statement correctly labels the items?',
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
      explanation: `Line 1 is what was observed at runtime (failure). Line 2 is the flaw in the code (defect). Line 3 is the human mistake (error). Line 4, the ambiguous requirement, explains why the error happened (root cause). Option D mixes up error and defect: the defect lives in the work product, the error in the person's understanding.`,
      followUps: [
        {
          q: 'What would a root-cause fix look like here, beyond patching the code?',
          a: 'Update the requirement template so any limit must state its period, scope and inclusivity; add QA review of stories during refinement; and add a regression test that performs several withdrawals summing past the daily limit. These stop the whole class of "unscoped limit" defects, not just this one.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-05',
      difficulty: 'medium',
      question: 'In the V-model, which test level is designed in parallel with the "system requirements specification" phase?',
      options: ['Component (unit) testing', 'Integration testing', 'System testing', 'Acceptance testing'],
      correct: [2],
      explanation: `The V-model pairs each left-side development phase with a right-side test level: business requirements ↔ acceptance, system requirements ↔ system testing, architecture ↔ integration, detailed design ↔ component testing. Acceptance is paired with business/user requirements, not the system spec; unit and integration pair with design phases.`,
      followUps: [
        {
          q: 'What is the main advantage of designing system tests during the requirements phase?',
          a: 'Writing tests forces testers to read requirements precisely, so ambiguities and missing rules are found before coding (early testing). It also creates traceability from each requirement to its tests from the start, and the cases are ready to run as soon as the system is integrated.',
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
      explanation: `Entry criteria are preconditions to start: a build that passes smoke, reviewed testware and data, and a working environment. "Zero open Critical defects" and "summary report signed off" are exit criteria (conditions to finish), because you can only judge them after executing tests.`,
      followUps: [
        {
          q: 'Who decides whether to waive an entry criterion?',
          a: 'Usually the test lead or manager together with the PO or project manager, since waiving shifts risk. The waiver should be recorded (what was waived, why, and by whom) so that if results are unreliable later, everyone knows the context.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-07',
      difficulty: 'medium',
      question: 'A team built exactly what the specification says, with zero open defects, but customers abandon the new 14-field checkout form. Which principle does this illustrate?',
      options: ['Exhaustive testing is impossible', 'Early testing saves time and money', 'Absence-of-defects fallacy', 'Defects cluster together'],
      correct: [2],
      explanation: `The absence-of-defects fallacy says a system can meet its specification and have no known defects yet still fail to meet user needs or business goals; validation is required alongside verification. It is not about exhaustive coverage, the timing of testing, or where defects concentrate.`,
      followUps: [
        {
          q: 'Which testing activity could have caught this before release?',
          a: 'Validation activities: usability testing with real users on a prototype, a PO/stakeholder demo, beta testing with a small user group, or comparing the form against competitor checkouts. Analytics from a limited rollout (canary or A/B test) would also reveal abandonment early.',
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
      explanation: `Static testing examines work products (requirements, designs, code, test cases) without executing them, so it works before code exists and finds defects directly. Reviews and static analysis (linters, SAST) are its two main forms. It needs no deployment, and anyone (BA, tester, PO) can review documents, not just developers.`,
      followUps: [
        {
          q: 'Give an example of a defect that static testing finds easily but dynamic testing struggles with.',
          a: 'An ambiguous requirement ("coupon reduces the total") or a missing rule (no expiry behaviour). Dynamic tests are derived from the requirement, so they inherit its gaps. Code-level examples include unreachable code, a variable that is never used, or violations of coding standards.',
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
      explanation: `Inspection is the most formal review type: a trained moderator, defined roles, individual preparation with checklists, entry/exit criteria and metrics used for process improvement. A walkthrough is led by the author. A technical review is moderator-led but focuses on consensus and technical decisions without the full metric-driven process. An informal review has no defined process.`,
      followUps: [
        {
          q: 'Why is the author not the moderator in an inspection?',
          a: 'The author is naturally defensive and may steer discussion away from weaknesses; a neutral moderator keeps the meeting focused on finding anomalies, manages time, and creates a safe environment where reviewers can speak freely. In a walkthrough the author leads deliberately, because the goal there includes educating the audience.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-10',
      difficulty: 'hard',
      question: 'Your team keeps finding requirement ambiguities during system testing, costing days of rework each sprint. Which change is the best example of shift-left?',
      options: [
        'Add two more days of regression testing before each release',
        'Have QA review stories and write acceptance examples during refinement',
        'Increase production monitoring and alerting',
        'Ask developers to fix defects faster after they are reported',
      ],
      correct: [1],
      explanation: `Shift-left moves testing activities earlier in the lifecycle; reviewing stories and writing acceptance examples during refinement finds ambiguities before code exists. More regression time and faster fixing still act late. Production monitoring is a shift-right practice: valuable, but it catches problems after release.`,
      followUps: [
        {
          q: 'Does shift-left mean less testing at the end?',
          a: 'No. The CTFL explicitly says shift-left does not mean neglecting later testing. You still need system, regression and acceptance testing; shift-left simply ensures fewer, cheaper defects reach those stages, so later testing confirms quality instead of discovering basic misunderstandings.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-11',
      difficulty: 'medium',
      question: 'Select ALL activities that are primarily Quality Assurance (process-oriented, preventive) rather than Quality Control.',
      options: [
        'Defining a Definition of Done that every story must meet',
        'Executing the regression suite on the release candidate',
        'Holding a retrospective to improve the review checklist',
        'Logging a defect for a broken "Continue" button',
        'Introducing a mandatory peer review of test cases',
      ],
      correct: [0, 2, 4],
      explanation: `QA improves and defines processes so good products result: a Definition of Done, retrospectives that improve practices, and a mandated review step are all process measures. Executing regression and logging a defect for a broken button examine the product itself, which is quality control (testing).`,
      followUps: [
        {
          q: 'How do QC results feed back into QA?',
          a: 'Defect data from testing (where defects cluster, which root causes repeat, how many escaped to production) is analysed in retrospectives and RCA sessions; the team then changes the process, for example adding a checklist item for boundary inclusivity. QC finds defects in the product; QA uses that data to fix the process.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-12',
      difficulty: 'hard',
      question: 'Which SDLC model fits the situation below best?',
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
      explanation: `The Spiral model is organised around repeated loops of planning, risk analysis (often prototyping), engineering and evaluation, which suits large, high-risk projects with uncertain requirements. Waterfall and V-model assume stable requirements up front. Kanban is a flow-based Agile method for continuous work items, without explicit risk-analysis loops.`,
      followUps: [
        {
          q: 'How does the tester role differ in Spiral compared with Waterfall?',
          a: 'In Spiral, testers evaluate prototypes and increments in every loop and help assess the risks that drive the next loop, so testing is continuous and risk-focused. In Waterfall, testers mostly review documents early and execute tests in one late phase after all code is complete.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL deliverables that are produced in the Test Closure phase of the STLC.',
      options: [
        'Test summary / completion report',
        'Documented lessons learned and improvement actions',
        'Baselined test cases and test data',
        'Archived testware for reuse in future releases',
        'Initial requirement query log',
      ],
      correct: [0, 1, 3],
      explanation: `Closure produces the summary/completion report, lessons learned, and archived testware (plus change requests for unresolved defects). Baselined test cases and data come out of test case development, and the requirement query log is produced in requirement analysis, long before closure.`,
      followUps: [
        {
          q: 'What goes into a good test summary report?',
          a: 'Scope tested and not tested, build/environment, execution numbers (planned, executed, passed, failed, blocked), open defects by severity, exit-criteria status, residual risks, and a clear recommendation (go / go with risks / no-go). It should be readable by a non-tester in two minutes.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-14',
      difficulty: 'expert',
      question: 'Analytics show 70% of the last 3 releases\' production defects came from the promo engine and payment modules, which are 15% of the codebase. You have 5 days to test release 4. What is the BEST plan?',
      options: [
        'Split the 5 days evenly across all modules so coverage is fair',
        'Weight test design and exploration toward promo and payment, keep a lighter regression elsewhere',
        'Test only promo and payment, skipping everything else',
        'Rerun last release\'s full regression suite unchanged',
      ],
      correct: [1],
      explanation: `Defect clustering (principle 4) is an input to risk-based testing: spend more effort where defects historically concentrate, while keeping lighter regression elsewhere because other areas still carry some risk. Even splitting ignores the evidence; testing only hot spots drops all other coverage; rerunning an unchanged suite ignores "tests wear out".`,
      followUps: [
        {
          q: 'How would you justify skipping deep testing of the profile page to the PO?',
          a: 'Show the data: historic defect counts per module, what changed in this release, and the business impact if each area fails. Then state the residual risk explicitly ("profile gets smoke + 10 regression cases only; low change, zero defects in 3 releases") and ask the PO to accept it. Risk-based choices must be visible, not silent.',
        },
      ],
    },
    {
      id: 'mt-fundamentals-mcq-15',
      difficulty: 'expert',
      question: 'Which exit criterion below is the WEAKEST (least objectively measurable)?',
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
      explanation: `Criterion C uses subjective words ("stable", "good quality") that two people could judge differently, so nobody can objectively say it is met. A, B and D are measurable from the test management tool, defect tracker and RTM. Good exit criteria use numbers or yes/no checks tied to evidence.`,
      followUps: [
        {
          q: 'Rewrite criterion C so it becomes measurable.',
          a: 'For example: "Smoke suite of 15 cases passes 100% on staging after the final deploy, no crash or 5xx error observed during the final regression run, and pass rate on build 3.2.0-rc4 is at least 95%." Each part can be checked against a report.',
        },
      ],
    },
  ],
};

export default topic;
