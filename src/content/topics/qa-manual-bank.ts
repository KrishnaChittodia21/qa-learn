import type { Topic } from '../../types';

const topic: Topic = {
  id: 'qa-manual-bank',
  phase: 'interview',
  order: 0,
  title: 'Manual Testing Interview Bank',
  subtitle:
    'The most-asked manual testing questions in one place, with quick but strong answers: confusing pairs per cluster, 46 interview questions, drills and a timed test, each linked back to the full lesson.',
  estimatedMinutes: 120,
  sources: [
    'GeeksforGeeks: Manual Testing Interview Questions (freshers, intermediate and experienced sets)',
    'InterviewBit: Manual Testing Interview Questions (freshers, experienced and scenario-based sets)',
    'Guru99: Software Testing Interview Questions (STLC vs SDLC, RTM, test plan contents, exit criteria, when to stop testing, developer rejects a bug)',
    'testRigor blog: Manual QA interview questions (prioritising with limited time, testing a new feature, working with developers on defects)',
    'This app’s manual testing lessons (mt-fundamentals, mt-test-artifacts, mt-test-levels-types, mt-test-design, mt-defects, mt-exploratory-risk, mt-agile-release), which cite the ISTQB CTFL v4.0 syllabus and the other primary sources',
  ],
  tags: ['interview', 'manual-testing', 'question-bank', 'revision', 'stlc', 'test-design', 'defects', 'agile'],
  cheatSheet: [
    'Answer shape: definition in one line → example from your project → why it matters. Under 45 seconds, then stop and let them probe.',
    'STLC: requirement analysis → test planning → test case design → environment setup → execution → closure. Each phase has entry criteria, exit criteria and a deliverable.',
    'Verification = are we building it right (reviews, no running code). Validation = are we building the right thing (running it against user needs).',
    'Scenario = what to test (one line). Case = how (preconditions, steps, data, expected result). RTM = requirement ↔ test case ↔ defect, both directions.',
    'Smoke = is this new build stable enough to test (broad, shallow). Sanity = does this one fix/area work (narrow). Retest = the failed case again. Regression = did anything else break.',
    'BVA for 8–16 characters: 7, 8, 16, 17 (2-value); add 9 and 15 for 3-value. EP: <8, 8–16, >16, plus empty and wrong type.',
    'Decision table when outputs depend on combinations of conditions; state transition when behaviour depends on history (3 wrong OTPs → locked).',
    'Severity = impact (QA proposes). Priority = urgency (PO/business decides). Priority can change with the calendar; severity changes only if the impact does.',
    'Bug life cycle: New → Assigned → Open → Fixed → Retest → Closed, with side exits Rejected, Duplicate, Deferred, Not reproducible, Reopened.',
    'A bug report needs: title (what + where), environment/build, preconditions, numbered steps, expected vs actual, evidence, severity. Missing steps or build = bounced back.',
    'Short on time? Rank by risk (likelihood × impact), test the money/data/security paths first, write down what you skipped and tell the team.',
    'Don’t know? Say what you do know, reason from it aloud, say how you would find out. Never bluff a term or a tool.',
  ],
  sections: [
    {
      heading: 'How to use this bank the night before',
      body: `**Intuition:** the night before an interview you do not need new knowledge, you need fast recall of the classic pairs and a ready example for each. This bank is the revision layer over the seven manual testing lessons.

Across the popular question lists (GeeksforGeeks, InterviewBit, Guru99, testRigor) the same clusters come up again and again: STLC and principles, test cases and the RTM, smoke/sanity/regression/retesting, BVA/EP, the bug life cycle, severity vs priority, and "what would you do if…" scenarios about deadlines and developers.

| Step | Time | What you do |
|---|---|---|
| 1 | 15 min | Read the 8 cluster tables below out loud. Each row is one classic question. |
| 2 | 30 min | Open the Interview tab. Answer 10 questions aloud before revealing the model answer. |
| 3 | 15 min | Do the 3 drills (severity/priority, BVA in 60 s, broken test case). |
| 4 | 20 min | Take the timed test. Every wrong answer: follow its 📚 link to the full lesson. |
| 5 | 5 min | Read the cheat sheet. Sleep. |

**Common mistake:** memorising definitions word for word. Interviewers almost always follow up with "give me an example from your project". Prepare the example, not the wording.

📚 Full lessons: [Testing fundamentals](#/topic/mt-fundamentals?tab=learn&s=0) · [Defect life cycle](#/topic/mt-defects?tab=learn&s=1)`,
      keyPoints: [
        'This topic is for recall; depth lives in the linked lessons.',
        'Prepare one real example per cluster before you prepare wording.',
        'Every answer, question and MCQ here ends with a link to the lesson that teaches it.',
      ],
      source: 'GeeksforGeeks, InterviewBit, Guru99 and testRigor manual testing question lists (clusters compared)',
    },
    {
      heading: 'Cluster 1: Fundamentals and the STLC',
      body: `**Intuition:** these are the warm-up questions. They are easy to answer badly (a textbook recital) and easy to answer well (one line plus one example from your work).

| Classic question | Quick, strong answer |
|---|---|
| SDLC vs STLC | SDLC is how the whole product is built; STLC is the testing slice inside it, from requirement analysis to test closure. |
| STLC phases | Requirement analysis → test planning → test design → environment setup → execution → closure. |
| Verification vs validation | Reviewing the spec/design (no execution) vs running the product against real user needs. |
| QA vs QC vs testing | QA improves the process (prevent); QC checks the product (detect); testing is the main QC activity. |
| Error → defect → failure | A person's mistake → the wrong code or document it produces → the wrong behaviour users see when it runs. |
| Static vs dynamic | Reviewing documents/code without running it vs executing the software. |
| Pesticide paradox | Running the same tests repeatedly stops finding new bugs; refresh data and add new tests. |
| Exhaustive testing | Impossible; we use risk and test design techniques to choose a small, strong set. |
| When to stop testing | When exit criteria are met (planned tests run, no open critical/high bugs, agreed pass rate) or time runs out and the risk is accepted by the business. |

**In interviews, say this:** "Testing reduces the risk of failure; it can show defects are present but never prove there are none."

📚 Full lesson: [The seven testing principles](#/topic/mt-fundamentals?tab=learn&s=2) · [STLC phases with entry and exit criteria](#/topic/mt-fundamentals?tab=learn&s=4) · [Verification vs validation](#/topic/mt-fundamentals?tab=learn&s=5) · [QA vs QC vs testing](#/topic/mt-fundamentals?tab=learn&s=6) · [Static vs dynamic testing](#/topic/mt-fundamentals?tab=learn&s=7)`,
      keyPoints: [
        'Six STLC phases, each with entry criteria, exit criteria and a deliverable.',
        'Principles are a vocabulary for pushing back: "absence of errors fallacy", "defects cluster", "pesticide paradox".',
        'Stopping is a risk decision tied to exit criteria, not a feeling.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus (via the mt-fundamentals lesson); Guru99 question list',
    },
    {
      heading: 'Cluster 2: Test artifacts (cases, plan, strategy, RTM)',
      body: `**Intuition:** artifacts are how testing becomes visible to other people. Interviewers check that you know what each one is *for*, not just what fields it has.

| Pair / question | Quick answer |
|---|---|
| Test scenario vs test case | Scenario: one line of *what* ("verify password reset by email"). Case: *how* (ID, preconditions, steps, test data, expected result). |
| Test case vs test script | A script is a test case written to be executed by a tool (automation code). |
| Test plan vs test strategy | Plan: this release/project (scope, schedule, people, entry/exit, risks). Strategy: the organisation's or programme's general approach (levels, types, tools, environments). |
| RTM | Maps each requirement to test cases (and defects). Forward: is every requirement tested? Backward: does every test trace to a requirement? |
| Entry vs exit criteria | What must be true before an activity starts (build deployed, smoke passed) vs before you call it done (95% executed, no open criticals). |
| Test data | Realistic, masked, boundary-rich data prepared in advance; never raw production personal data. |
| Test suite | A group of cases run together (smoke suite, regression suite, coupon suite). |

**Must-have test case fields:** ID, title, preconditions, steps, test data, expected result, priority, linked requirement. The field juniors forget most: a *specific* expected result.

📚 Full lesson: [Scenario vs case vs script](#/topic/mt-test-artifacts?tab=learn&s=0) · [Anatomy of a great test case](#/topic/mt-test-artifacts?tab=learn&s=1) · [The test plan](#/topic/mt-test-artifacts?tab=learn&s=5) · [Strategy vs plan](#/topic/mt-test-artifacts?tab=learn&s=6) · [RTM](#/topic/mt-test-artifacts?tab=learn&s=7)`,
      keyPoints: [
        'Expected result must be observable and specific, never "should work".',
        'RTM answers "is this requirement tested and is it passing?" in seconds.',
        'Plan is project-specific; strategy is the reusable approach.',
      ],
      source: 'IEEE 829 / ISO/IEC/IEEE 29119-3 (via the mt-test-artifacts lesson); Guru99 and InterviewBit question lists',
    },
    {
      heading: 'Cluster 3: Levels and types (smoke, sanity, regression, retesting, UAT)',
      body: `**Intuition:** this is the single most-asked cluster. Most questions are "difference between X and Y". Learn the pairs with one example each.

| Pair | X | Y |
|---|---|---|
| Smoke vs sanity | New build, broad and shallow: is it stable enough to test at all? | After a small fix or change, narrow and deeper: does this area work? |
| Retesting vs regression | Re-run the exact failed case to confirm the fix | Re-run related, unchanged areas to confirm nothing else broke |
| Alpha vs beta | Users/internal staff test at the developer's site before release | Real users test in their own environment before full release |
| System vs UAT | QA checks the integrated system against requirements | Business users confirm it supports their real work; they sign off |
| Functional vs non-functional | What it does (correct total, correct email) | How well (speed, security, usability, accessibility) |
| Positive vs negative | Valid input behaves as expected | Invalid input is rejected gracefully |
| Black vs white box (grey in between) | Black: no knowledge of internals | White: based on code structure. Grey: partial knowledge (DB, API, logs) |
| Stub vs driver | Fake *called* module (top-down) | Fake *calling* module (bottom-up) |

**Levels in order:** unit (component) → integration → system → acceptance.

**In interviews, say this:** "Retesting is planned for a specific bug and is mandatory; regression is about side effects and its scope is decided by risk and impact analysis."

📚 Full lesson: [Test levels](#/topic/mt-test-levels-types?tab=learn&s=0) · [Stubs and drivers](#/topic/mt-test-levels-types?tab=learn&s=1) · [UAT, alpha, beta](#/topic/mt-test-levels-types?tab=learn&s=2) · [Regression vs retesting](#/topic/mt-test-levels-types?tab=learn&s=5) · [Smoke vs sanity](#/topic/mt-test-levels-types?tab=learn&s=6) · [Black, white, grey box](#/topic/mt-test-levels-types?tab=learn&s=8)`,
      keyPoints: [
        'Smoke gates the build; sanity gates a fix.',
        'Retest the bug, then regress around it.',
        'UAT is owned and signed off by the business, not QA.',
      ],
      source: 'ISTQB CTFL v4.0 (via the mt-test-levels-types lesson); GeeksforGeeks and InterviewBit question lists',
    },
    {
      heading: 'Cluster 4: Test design techniques',
      body: `**Intuition:** these questions check that you choose test values on purpose, not at random. Expect a field ("age 18–60", "password 8–16 chars") and 30 seconds to answer.

| Technique | Use it when | Example |
|---|---|---|
| Equivalence partitioning | Inputs fall into groups the system treats the same | Age: <18, 18–60, >60, non-numeric |
| Boundary value analysis | Ranges, limits, lengths, dates | 2-value: 17, 18, 60, 61. 3-value adds 19 and 59 |
| Decision table | Output depends on combinations of conditions | Coupon valid × cart ≥ ₹500 × first order → discount? |
| State transition | Behaviour depends on what happened before | OTP: 3 wrong codes → locked; expired after 5 min |
| Use-case testing | End-to-end user flows with alternatives and exceptions | Checkout: main flow, card declined, session timeout |
| Pairwise | Too many combinations of settings | 4 browsers × 3 OS × 3 payments → about 12 pairs, not 36 |
| Error guessing | Experience says where bugs hide | Blank, spaces only, emoji, double-click submit, back button |

**Quick formula:** n independent yes/no conditions give 2ⁿ decision table rules (3 conditions → 8).

📚 Full lesson: [Equivalence partitioning](#/topic/mt-test-design?tab=learn&s=1) · [BVA 2-value and 3-value](#/topic/mt-test-design?tab=learn&s=2) · [Decision tables](#/topic/mt-test-design?tab=learn&s=4) · [State transition](#/topic/mt-test-design?tab=learn&s=6) · [Pairwise](#/topic/mt-test-design?tab=learn&s=8) · [Error guessing](#/topic/mt-test-design?tab=learn&s=9)`,
      keyPoints: [
        'Always say the technique name AND the values; never just "I would test valid and invalid".',
        'BVA values come in pairs around each edge: just inside, just outside.',
        'Pick the technique from the shape of the rule: range → BVA, combinations → decision table, history → state transition.',
      ],
      source: 'Lee Copeland, A Practitioner’s Guide to Software Test Design, and ISTQB CTFL v4.0 (via the mt-test-design lesson)',
    },
    {
      heading: 'Cluster 5: Defects (life cycle, severity and priority, reporting)',
      body: `**Intuition:** almost every manual interview has at least one defect question, and most include a scenario ("the developer rejects your bug…"). They test clarity and professionalism, not just terms.

| Question | Quick answer |
|---|---|
| Bug life cycle | New → Assigned → Open → Fixed → Retest → Verified/Closed; side exits Rejected, Duplicate, Deferred, Not reproducible; Reopened if the retest fails |
| Severity vs priority | Severity: how bad the impact is (QA proposes). Priority: how soon to fix (PO decides) |
| High severity, low priority | Crash in a yearly report used by one admin, with a workaround |
| Low severity, high priority | Wrong brand name or price label on the home page the day of a sale |
| Must-have bug fields | Title, build/environment, preconditions, steps, expected, actual, evidence, severity |
| Defect leakage | Bugs found after release ÷ bugs found in total for that release |
| Triage | PO, dev lead and QA review new bugs: valid? severity/priority? which release? who owns it? |
| Developer says "not a bug" | Re-check the requirement, reproduce with evidence, discuss calmly, and let the PO decide if it is still disputed |

**In interviews, say this:** "I report facts, not blame: exact steps, build, expected versus actual, and evidence. If we disagree, the requirement or the product owner decides."

📚 Full lesson: [Defect life cycle](#/topic/mt-defects?tab=learn&s=1) · [Rejected, duplicate, deferred, reopened](#/topic/mt-defects?tab=learn&s=2) · [Anatomy of a bug report](#/topic/mt-defects?tab=learn&s=3) · [Severity vs priority](#/topic/mt-defects?tab=learn&s=4) · [Cannot reproduce](#/topic/mt-defects?tab=learn&s=6) · [Triage](#/topic/mt-defects?tab=learn&s=7) · [Defect metrics](#/topic/mt-defects?tab=learn&s=9)`,
      keyPoints: [
        'Severity is about impact; priority is about the calendar and the business.',
        'A report without build and steps will bounce.',
        'Disagreements go to the requirement or the PO, not to a Jira comment war.',
      ],
      source: 'mt-defects lesson; GeeksforGeeks (bug life cycle, critical bug, triage) and Guru99 (developer rejects a bug)',
    },
    {
      heading: 'Cluster 6: Exploratory and risk-based testing',
      body: `**Intuition:** these questions check judgement under pressure. The interviewer wants to hear that you prioritise by risk and that exploration is planned, not random clicking.

| Term | Quick answer |
|---|---|
| Exploratory testing | Simultaneous learning, test design and execution, guided by a charter and time-boxed |
| Ad hoc testing | Informal, unplanned, no charter or notes |
| Monkey testing | Random inputs, often automated, to see if the app crashes |
| Charter | "Explore <area> with <resources> to discover <information>" |
| SBTM | Exploratory sessions of 60–90 minutes with a charter and a debrief sheet |
| Risk | Likelihood × impact; test the highest first |
| Oracle | How you decide something is wrong without a spec (comparable products, history, user expectations, claims) |

**The time-pressure script (2 hours, 2 days, any deadline):** list the changed and high-risk areas → rank by likelihood × impact → smoke the build → test the money, data and security paths first → explore the riskiest change with a charter → write down what was *not* tested and tell the team before the go/no-go.

📚 Full lesson: [What exploratory testing really is](#/topic/mt-exploratory-risk?tab=learn&s=0) · [Charters](#/topic/mt-exploratory-risk?tab=learn&s=1) · [Oracles](#/topic/mt-exploratory-risk?tab=learn&s=5) · [Ad hoc, monkey, gorilla](#/topic/mt-exploratory-risk?tab=learn&s=7) · [Risk-based testing](#/topic/mt-exploratory-risk?tab=learn&s=8) · [Prioritising under time pressure](#/topic/mt-exploratory-risk?tab=learn&s=10)`,
      keyPoints: [
        'Exploratory has a charter, a time-box and notes; ad hoc has none.',
        'Risk = likelihood × impact, always said with an example.',
        'Under time pressure, the untested list is a deliverable.',
      ],
      source: 'Elisabeth Hendrickson, Explore It!, James Bach and Michael Bolton, Rapid Software Testing (via the mt-exploratory-risk lesson); testRigor list',
    },
    {
      heading: 'Cluster 7: Agile and release',
      body: `**Intuition:** most teams hiring QA work in Scrum or Kanban, so interviewers check that you test *during* the sprint, not after it, and that you can talk about release decisions.

| Question | Quick answer |
|---|---|
| QA in Scrum | Joins refinement (testability, acceptance criteria), planning (test effort), daily stand-up (blockers), review (demo), retro (process fixes) |
| Acceptance criteria vs DoD | AC: conditions for *this* story. DoD: the team's checklist for *every* story (tested, reviewed, no open high bugs) |
| Definition of Ready | A story is clear, estimated and testable before the sprint starts |
| Three amigos | BA/PO + dev + QA agree examples before coding |
| Shift-left | Test early: review stories, write cases before code lands |
| Go/no-go | QA presents evidence (executed, pass rate, open bugs, risks); the business owner decides |
| Test summary report | End of cycle: scope, results, open defects, risks, recommendation |
| Agile vs Waterfall testing | Continuous, every sprint, whole team owns quality vs a separate phase after development |

**In interviews, say this:** "QA does not 'own' quality alone; I make the risk visible early so the team can act on it."

📚 Full lesson: [Scrum roles and events for QA](#/topic/mt-agile-release?tab=learn&s=2) · [DoR, DoD, three amigos](#/topic/mt-agile-release?tab=learn&s=3) · [Acceptance criteria and BDD](#/topic/mt-agile-release?tab=learn&s=4) · [Sprint testing workflow](#/topic/mt-agile-release?tab=learn&s=5) · [Go/no-go](#/topic/mt-agile-release?tab=learn&s=7) · [Test reports](#/topic/mt-agile-release?tab=learn&s=9)`,
      keyPoints: [
        'AC are per story; DoD is for every story.',
        'QA informs the release decision; the business makes it.',
        'Test inside the sprint: cases ready before the code lands.',
      ],
      source: 'Lisa Crispin and Janet Gregory, Agile Testing; Scrum Guide (via the mt-agile-release lesson)',
    },
    {
      heading: 'How to answer in the interview',
      body: `**Intuition:** a good answer sounds like someone who has done the work. A fixed structure makes that easy even when you are nervous.

| Step | What you say | Example: "What is regression testing?" |
|---|---|---|
| 1. Definition | One sentence, plain words | "Re-running tests on unchanged areas to catch side effects of a change." |
| 2. Example from your project | Real feature, real decision | "When we changed the tax rounding, I re-ran cart, checkout, invoice PDF and refund cases." |
| 3. Why it matters | Risk, cost, users | "A rounding change can break invoices that nobody touched; that's where the bug was." |

**Scenario questions** ("what would you do if…"): clarify the situation → say your first action → say who you involve → say how you close it (evidence, note, follow-up).

**When you don't know:**
1. Say so honestly: "I haven't used that term at work."
2. Reason from what you do know: "If it's about X, I would expect…"
3. Say how you would find out: "I'd check the ISTQB glossary or ask the team lead."

**Avoid:** reciting textbook definitions without examples, saying "I test everything", blaming developers, bluffing a tool you have never used, and talking for three minutes without pausing.

📚 Full lesson: [Answering when you do not know](#/topic/qa-interview-bank?tab=learn&s=8) · [STAR for testers](#/topic/qa-behavioral?tab=learn&s=1) · [The role of a QA engineer](#/topic/mt-fundamentals?tab=learn&s=9)`,
      keyPoints: [
        'Definition → your example → why it matters.',
        'For scenarios: clarify, act, involve, close.',
        'Honest "I don’t know, but here is how I’d reason" beats a bluff every time.',
      ],
      source: 'Interview guidance compiled from testRigor and InterviewBit scenario sections, and this app’s qa-behavioral topic',
    },
  ],
  interviewQuestions: [
    {
      id: 'qa-manual-bank-iq-01',
      difficulty: 'easy',
      question: 'If testing can never prove a product is bug-free, why should a company pay testers at all? Answer in under a minute.',
      whatInterviewerLooksFor: [
        'Knows the principle "testing shows the presence of defects, not their absence"',
        'Frames testing as reducing risk and giving information for decisions',
        'Gives a concrete example of cost avoided',
      ],
      modelAnswer: `**One line:** testing doesn't prove there are no bugs; it reduces the *risk* of a bad release and gives the team facts to decide whether to ship.

**Why it is worth paying for:**
- **Cost of late defects:** a wrong rounding rule found while reviewing the story costs a comment; found in production it costs refunds, support calls and trust.
- **Information:** a test summary ("98% passed, one high bug open in refunds") lets the product owner make an informed go/no-go call instead of guessing.
- **Confidence for change:** a regression suite lets developers change code without fear.

**Example:** on a checkout project, reviewing the coupon story before coding exposed that "10% off above ₹500" didn't say whether ₹500 itself qualified. One question saved a production bug on the busiest coupon.

**Close with the principle:** "Exhaustive testing is impossible, so we test by risk; the absence of found bugs doesn't mean the product is useful, which is why we also validate against user needs."

📚 Full lesson: [The seven testing principles](#/topic/mt-fundamentals?tab=learn&s=2)`,
      followUps: [
        { q: 'Name the seven testing principles quickly.', a: 'Testing shows the presence of defects, not their absence; exhaustive testing is impossible; early testing saves time and money; defects cluster together; tests wear out (pesticide paradox); testing is context dependent; and the absence-of-errors fallacy: a bug-free product can still be the wrong product for its users.' },
        { q: 'What is the absence-of-errors fallacy, with an example?', a: 'Finding and fixing many bugs does not make a product successful if it does not meet user needs. Example: a perfectly working report screen that shows totals by week when the finance team needs them by month. Every test passes, yet the product fails its users, which is why validation matters as much as verification.' },
      ],
      pitfalls: [
        'Saying "testers find all the bugs" or promising zero defects',
        'Giving the principle as a quote with no example of cost or risk avoided',
      ],
    },
    {
      id: 'qa-manual-bank-iq-02',
      difficulty: 'easy',
      question: 'Name the STLC phases in order and the one deliverable that comes out of each.',
      whatInterviewerLooksFor: [
        'All six phases in the right order',
        'A real deliverable per phase, not just the phase name',
        'Awareness that phases overlap in Agile',
      ],
      modelAnswer: `| Phase | Main deliverable |
|---|---|
| 1. Requirement analysis | List of testable requirements and questions (and an initial RTM) |
| 2. Test planning | Test plan: scope, approach, schedule, roles, entry/exit criteria, risks |
| 3. Test case design | Test scenarios, test cases, test data, updated RTM |
| 4. Test environment setup | Ready environment plus a passed smoke test |
| 5. Test execution | Execution results, defect reports, daily status |
| 6. Test closure | Test summary report, metrics, lessons learned |

**Make it real:** "On my last project, requirement analysis produced a list of 14 questions for the BA. Two of them changed the acceptance criteria before any code was written."

**Agile note:** in Scrum the same activities happen every sprint in a small loop: analyse the story in refinement, design cases while the developer codes, execute when the build lands, and close with the sprint report.

📚 Full lesson: [STLC: the six phases with entry and exit criteria](#/topic/mt-fundamentals?tab=learn&s=4)`,
      followUps: [
        { q: 'What is an entry criterion for test execution?', a: 'Examples: the build is deployed to the QA environment, the smoke test passed, test cases are reviewed and approved, and test data is ready. If the smoke test fails, execution should not start; the build goes back to development so the team does not waste a day on a broken build.' },
        { q: 'Which STLC phase do testers skip most often, and why does it hurt?', a: 'Test closure. Teams move straight to the next release without recording what was not tested, which defects were deferred and what went wrong. The next release then repeats the same mistakes, and nobody can show the history of a known risk when a production bug appears.' },
      ],
      pitfalls: [
        'Mixing SDLC phases (design, coding, deployment) into the STLC list',
        'Listing phases with no deliverables or entry/exit criteria',
      ],
    },
    {
      id: 'qa-manual-bank-iq-03',
      difficulty: 'medium',
      question: 'What is the pesticide paradox, and what did you change when your regression pack stopped finding bugs?',
      whatInterviewerLooksFor: [
        'Correct definition in plain words',
        'Concrete actions: new data, new cases, exploratory sessions, review against production bugs',
        'Understanding that a stable pack still has value as a safety net',
      ],
      modelAnswer: `**Definition:** if you run the same tests with the same data again and again, they stop finding new bugs, the way insects become resistant to the same pesticide. The pack still proves old behaviour works, but it no longer *discovers* anything.

**What I changed (example):** our 180-case checkout regression pack had found nothing in four sprints, yet two production bugs came from checkout.
1. **Mapped production bugs to the pack:** both were with saved cards plus a coupon, a combination we never ran.
2. **Varied data:** new users, international addresses, maximum cart size, boundary amounts.
3. **Added cases** from recent bugs and changed areas, and **retired** duplicates.
4. **Booked a 60-minute exploratory session** per sprint on the riskiest change.

**Result:** the next cycle found three defects, one of them high severity.

**Balance:** I don't throw the old pack away; it is the safety net. I keep it and keep it fresh.

📚 Full lesson: [The seven testing principles](#/topic/mt-fundamentals?tab=learn&s=2)`,
      followUps: [
        { q: 'How often should a regression suite be reviewed?', a: 'At least once per release, and whenever a production bug escapes. A good trigger list: a feature changed, a bug leaked, a case has not failed in many cycles and duplicates another, or the data has gone stale. Reviews should both add and remove cases so the suite does not only grow.' },
        { q: 'Does automation solve the pesticide paradox?', a: 'No. Automation runs the same checks faster, so it can make the paradox worse if nobody adds new scenarios. It frees time, though, and that time should go into exploratory testing and new test ideas, which is where new bugs are found.' },
      ],
      pitfalls: [
        'Concluding the product is bug-free because the pack passes',
        'Defining the paradox but giving no action you took',
      ],
    },
    {
      id: 'qa-manual-bank-iq-04',
      difficulty: 'easy',
      question: 'How are SDLC and STLC related, and when does a tester first get involved on a Waterfall project compared with a Scrum team?',
      whatInterviewerLooksFor: [
        'STLC is part of the SDLC, not a separate process',
        'Testing starts at requirements in both models',
        'Clear contrast between phase-based and sprint-based work',
      ],
      modelAnswer: `**Relationship:** the SDLC is the whole life of the product (requirements, design, build, test, deploy, maintain). The STLC is the testing slice inside it, with its own phases from requirement analysis to closure.

**Waterfall / V-model:** testers should join at the **requirements phase**, reviewing the SRS and writing the acceptance and system test plans while design happens. Execution waits until development is complete, so testing is one long phase near the end. The risk: late feedback and a squeezed test window.

**Scrum:** the tester joins at **backlog refinement**, before the sprint, asking questions and shaping acceptance criteria. Inside the sprint the STLC repeats in miniature for each story: analyse, design cases while the developer codes, test as soon as the story is deployed, regress before the sprint ends.

**Example:** "On our Scrum team I reviewed the 'saved addresses' story in refinement and asked what happens with more than 10 addresses. That became an acceptance criterion before any code existed."

**Key point:** in both models, the earlier testing starts, the cheaper the bugs are.

📚 Full lesson: [SDLC models and where testing fits](#/topic/mt-fundamentals?tab=learn&s=3)`,
      followUps: [
        { q: 'What is the V-model?', a: 'A Waterfall variant where every development phase has a matching test level: requirements pair with acceptance testing, system design with system testing, architecture with integration testing and module design with unit testing. Test design for each level starts when its matching development phase happens, which pushes testing earlier.' },
        { q: 'What is shift-left testing?', a: 'Moving testing activities earlier: reviewing requirements, writing acceptance criteria and test cases before code, running unit and API tests in the pipeline. The aim is to find defects when they are cheap to fix, instead of discovering them in system testing or production.' },
      ],
      pitfalls: [
        'Saying testers only join "after development" in Waterfall',
        'Treating the STLC as a process unrelated to the SDLC',
      ],
    },
    {
      id: 'qa-manual-bank-iq-05',
      difficulty: 'medium',
      question: 'When do you stop testing? In theory a tester could keep going forever.',
      whatInterviewerLooksFor: [
        'Exit criteria agreed in advance',
        'Risk-based reasoning, not "when all bugs are found"',
        'The business decides to accept remaining risk; QA informs it',
      ],
      modelAnswer: `**Short answer:** I stop when the **exit criteria** agreed in the test plan are met, or when time runs out and the business **knowingly accepts** the remaining risk.

**Typical exit criteria:**
- All planned high-priority cases executed (for example ≥ 95% of all cases)
- Pass rate at or above the agreed level
- No open critical or high defects; medium ones reviewed and deferred with PO approval
- Requirement coverage confirmed in the RTM
- Defect discovery rate dropping over the last cycles

**When time runs out first:** I don't just stop silently. I report what was tested, what was not, and the risk of the gaps. Example: "Refunds to wallet were not regressed. Risk: medium, because the shared payment module changed." The product owner decides.

**Signals it is *not* time to stop:** new defects still being found at a high rate in one module, or a critical area with no coverage.

**Principle behind it:** exhaustive testing is impossible, so "done" is a risk decision, not the moment all bugs are gone.

📚 Full lesson: [STLC: entry and exit criteria](#/topic/mt-fundamentals?tab=learn&s=4)`,
      followUps: [
        { q: 'Who decides that testing is finished?', a: 'QA recommends, based on evidence against the exit criteria; the product owner or release manager decides, because accepting residual risk is a business decision. QA should state clearly when it does not recommend release, and the decision and its reason should be recorded.' },
        { q: 'Can 100% test coverage be achieved?', a: 'Requirement coverage can reach 100% in the sense that every requirement has at least one test. Coverage of every input combination, path and environment cannot, because the numbers explode. So we aim for full requirement coverage and risk-based depth.' },
      ],
      pitfalls: [
        'Saying "when no bugs are left"',
        'Saying "when the deadline comes" without mentioning the risk report',
      ],
    },
    {
      id: 'qa-manual-bank-iq-06',
      difficulty: 'medium',
      question: 'A brand-new screen changes layout every sprint. Would you test it manually or automate it now, and why?',
      whatInterviewerLooksFor: [
        'Chooses manual/exploratory testing for unstable UI',
        'Knows what makes a good automation candidate',
        'Suggests automating below the UI where it is stable',
      ],
      modelAnswer: `**Manual first, for now.** UI automation pays off when the feature is **stable, repeated often and high value**. A screen that changes every sprint would break the scripts every sprint, so maintenance would cost more than the tests save.

**What I would do:**
1. **Exploratory and scripted manual testing** of the new screen, focused on behaviour and usability, which a human judges better anyway.
2. **Automate what is already stable below the UI:** the API that saves the form, validation rules, calculations.
3. **Mark candidate cases** in the test management tool ("automate when the layout freezes") so the plan is visible.
4. **Automate the UI** once the design is signed off, starting with the smoke path.

**Good automation candidates:** regression flows run every release, data-driven checks (many inputs, same steps), cross-browser repetition.

**Better left manual:** usability, look and feel, one-off checks, exploratory testing, features still changing.

📚 Full lesson: [The role of a QA engineer (manual to automation)](#/topic/mt-fundamentals?tab=learn&s=9)`,
      followUps: [
        { q: 'Can automation replace manual testing?', a: 'No. Automation is excellent at repeating known checks quickly; it cannot judge usability, notice something odd that nobody scripted, or explore a new feature. Teams with strong automation still use manual exploratory testing for new and risky changes.' },
        { q: 'How would you convince a manager to delay UI automation of this screen?', a: 'Show the cost: if the layout changes each sprint, every locator and flow may break, so each sprint we pay to rebuild scripts. Propose automating the stable API and rules now and the UI after the design freeze, with a date. That is a plan, not a refusal.' },
      ],
      pitfalls: [
        'Saying "automate everything" or "manual is always better"',
        'Ignoring automation below the UI layer',
      ],
    },
    {
      id: 'qa-manual-bank-iq-07',
      difficulty: 'easy',
      question: 'Give me one defect you could realistically only catch by reviewing a document rather than running the app. What kind of testing is that?',
      whatInterviewerLooksFor: [
        'Names static testing (reviews, walkthroughs, inspections)',
        'A believable example of a requirement or design defect',
        'Links it to cost and shift-left',
      ],
      modelAnswer: `**Kind of testing:** static testing, finding defects without executing code, through reviews, walkthroughs and inspections of requirements, designs, test cases or code.

**Example:** a story for a loyalty programme said "points expire after 12 months" and another story said "points never expire for Gold members", but neither said what happens when a member drops from Gold to Silver. No running app would show this; there was nothing to run yet. In the refinement review I asked the question, the PO decided "expiry starts from the downgrade date", and it became an acceptance criterion.

**Why it matters:** fixing that ambiguity cost one conversation. Found in production, it would have meant wrongly expired points, customer complaints and a data fix.

**Other static finds:** contradictory rules, missing error messages, untestable wording ("should be fast"), missing boundaries ("minimum order ₹500": is ₹500 included?).

**Dynamic testing** is the opposite: running the software and comparing actual to expected results. Both are needed.

📚 Full lesson: [Static vs dynamic testing and reviews](#/topic/mt-fundamentals?tab=learn&s=7)`,
      followUps: [
        { q: 'What types of review do you know?', a: 'Informal review (a colleague reads it), walkthrough (the author leads the group through it), technical review (peers check technical content), and inspection (the most formal: defined roles such as moderator and scribe, entry and exit criteria, and metrics).' },
        { q: 'Is static testing verification or validation?', a: 'Verification: it checks that the work products are correct and consistent, without running the software. Validation needs the product to be exercised against real user needs, which is dynamic.' },
      ],
      pitfalls: [
        'Thinking testing only starts when a build exists',
        'Giving a defect that would obviously show up when running the app',
      ],
    },
    {
      id: 'qa-manual-bank-iq-08',
      difficulty: 'easy',
      question: 'Error, bug, defect, failure: explain the chain using an online train-ticket booking that charges the wrong fare.',
      whatInterviewerLooksFor: [
        'Correct order: human error → defect in code/document → failure when executed',
        'Knows bug and defect are used as synonyms in practice',
        'Mentions root cause',
      ],
      modelAnswer: `**The chain:**
1. **Error (mistake):** a human action. The developer misread the fare rule and thought the senior-citizen discount applied to the base fare *plus* the reservation charge.
2. **Defect (bug, fault):** the result in the code: the discount formula includes the reservation charge. It sits there silently until that code runs.
3. **Failure:** what a user sees when the defective code runs: a 60-year-old passenger is charged ₹40 less than the correct fare.
4. **Root cause:** *why* the error happened: the fare rule document was ambiguous, and nobody reviewed it with an example.

**Bug vs defect:** in daily work they mean the same thing; testers usually say "bug", and ISTQB uses "defect".

**Notes:**
- A defect may never cause a failure if that code path never runs (for example, a broken rule for a ticket class that is no longer sold).
- A failure can also come from the environment (wrong config), not a code defect.

**Why the distinction matters:** fixing the defect fixes this fare; fixing the root cause (worked examples in fare rules) prevents the next one.

📚 Full lesson: [Error, defect, failure and root cause](#/topic/mt-fundamentals?tab=learn&s=1)`,
      followUps: [
        { q: 'What is a latent defect?', a: 'A defect that exists in released software but has not caused a failure yet, because the triggering conditions have not occurred. Example: a date calculation that breaks only on 29 February, or a report that fails only when a year has 53 weeks.' },
        { q: 'Can every failure be traced to a code defect?', a: 'No. Failures can come from the environment (wrong configuration, expired certificate, a third-party outage), from data, or from hardware. That is why a good bug report includes environment details and why root cause analysis looks beyond the code.' },
      ],
      pitfalls: [
        'Reversing the order (failure causes a defect)',
        'Claiming bug, defect and failure are all exactly the same thing',
      ],
    },
    {
      id: 'qa-manual-bank-iq-09',
      difficulty: 'easy',
      question: 'Write test cases for a forgot-password feature. Start with the five you would run first.',
      whatInterviewerLooksFor: [
        'Prioritises: happy path, security, token expiry/reuse',
        'Test cases with preconditions and specific expected results',
        'Asks clarifying questions (link validity, rate limit, message wording)',
      ],
      modelAnswer: `**Clarify first (10 seconds):** "How long is the reset link valid? Is there a rate limit? What message shows for an unregistered email?" I'll assume 30 minutes, 3 requests per hour, and the same neutral message for every email.

| # | Test case | Expected result |
|---|---|---|
| 1 | Registered email → open link → set a valid new password → log in with it | Login succeeds with the new password; the old one fails |
| 2 | Unregistered email | The same neutral message ("If an account exists, we've sent a link"); no email sent; no hint that the account doesn't exist |
| 3 | Use the link a second time after a successful reset | "Link already used / expired"; the password does not change again |
| 4 | Open the link after 31 minutes | Expired message with an option to request a new link |
| 5 | Request two links, use the older one | Older link rejected; only the latest works |

**Next ones:** new password breaks the policy, new = old password, 4th request within an hour (rate limit), email case-insensitivity (Asha@x.com), existing sessions logged out after reset, link not leaking in the URL to third parties.

📚 Full lesson: [Anatomy of a great test case](#/topic/mt-test-artifacts?tab=learn&s=1)`,
      followUps: [
        { q: 'Why should the message be the same for registered and unregistered emails?', a: 'A different message lets an attacker enumerate which emails have accounts, which helps phishing and credential-stuffing attacks. Using a neutral message for every input is a standard security practice, so testing it is a security check a manual tester can do without tools.' },
        { q: 'How would you test the email part if you cannot access real inboxes?', a: 'Use a test mail catcher the team provides (such as a fake SMTP inbox in the QA environment) or disposable test addresses, check the email content, sender, link domain and expiry, and confirm the link token in the database or logs when allowed. Ask development for a test hook if none exists.' },
      ],
      pitfalls: [
        'Listing only "valid email" and "invalid email"',
        'Forgetting link expiry, reuse and old sessions',
      ],
    },
    {
      id: 'qa-manual-bank-iq-10',
      difficulty: 'medium',
      question: 'A teammate\'s test case says only "Check login works". Rewrite it the way you would want it in our test management tool.',
      whatInterviewerLooksFor: [
        'Splits a vague case into atomic, independent cases',
        'Adds preconditions, test data, steps and a specific expected result',
        'Links to a requirement and sets priority',
      ],
      modelAnswer: `**Problem:** "Check login works" has no data, no steps and no expected result, so two testers would run two different tests and both could mark it Pass.

**Rewrite (one atomic case; others split out):**
- **ID / title:** TC-LOGIN-001: Registered user logs in with valid email and password
- **Requirement:** REQ-AUTH-01 · **Priority:** High · **Type:** Positive, functional
- **Preconditions:** user asha.qa@example.com exists and is active; user is logged out; QA build 4.2.1 on Chrome 128
- **Test data:** email asha.qa@example.com, password Test@1234
- **Steps:** 1. Open /login. 2. Enter the email. 3. Enter the password. 4. Click "Log in".
- **Expected result:** the dashboard opens within 3 seconds; the header shows "Hi, Asha"; refreshing keeps the user logged in.

**Then add separate cases** for wrong password, unregistered email, empty fields, locked account, and "Remember me", each with its own expected message.

**Rules I follow:** one objective per case, specific data, observable expected result, independent of other cases.

📚 Full lesson: [Anatomy of a great test case](#/topic/mt-test-artifacts?tab=learn&s=1)`,
      followUps: [
        { q: 'How do you give this feedback to the teammate without upsetting them?', a: 'Review the case, not the person: comment on the specific gaps ("no expected result, so we cannot tell pass from fail"), show one rewritten example, and agree a shared template or checklist for the team. Praise what is good, such as the coverage idea, so the review feels useful rather than critical.' },
        { q: 'Should test cases be very detailed or high-level?', a: 'It depends on who runs them and how often. New team members, outsourced execution and compliance need detail. A stable team on a fast product can use lighter cases or checklists. The non-negotiable parts are clear data and a specific expected result.' },
      ],
      pitfalls: [
        'Expected result written as "login should work"',
        'Cramming many checks into one case so one failure blocks the rest',
      ],
    },
    {
      id: 'qa-manual-bank-iq-11',
      difficulty: 'medium',
      question: 'What goes into a test plan, and which section do teams skip that later hurts them?',
      whatInterviewerLooksFor: [
        'Key sections: scope in/out, approach, environments, schedule, roles, entry/exit, risks, deliverables',
        'Picks a skipped section and explains the consequence',
        'Distinguishes plan from strategy',
      ],
      modelAnswer: `**Main sections (IEEE 829 style, trimmed for real teams):**
- Objective and **scope**: features in scope *and out of scope*
- **Approach**: levels and types, techniques, manual vs automated
- Test items, environments, test data
- **Entry and exit criteria**, suspension and resumption criteria
- Schedule, effort estimate, roles and responsibilities
- **Risks and mitigations**, assumptions and dependencies
- Deliverables: cases, reports, RTM; tools (Jira, TestRail/Xray)

**The section teams skip: "out of scope".** If the plan doesn't say "the old Android 9 app is not tested in this release", everyone *assumes* it is. When a bug appears there, QA is blamed and nobody can show the decision.

**Second most skipped: risks.** "Payment sandbox unavailable until day 6" is a risk; writing it down early lets the manager fix it before it costs three days.

**Plan vs strategy:** the plan is for *this* release; the strategy is the general approach across projects.

📚 Full lesson: [The test plan](#/topic/mt-test-artifacts?tab=learn&s=5)`,
      followUps: [
        { q: 'What are suspension and resumption criteria?', a: 'Suspension criteria say when to pause testing, for example the smoke test fails or a blocker stops more than 30% of cases. Resumption criteria say what must happen before restarting, such as a new build that passes smoke. They stop the team wasting days on a broken build.' },
        { q: 'Do Agile teams write test plans?', a: 'Usually a lighter one: a one-page release or feature test plan, or a test approach page in Confluence, covering scope, risks, environments and exit criteria. The details live in stories and acceptance criteria. The thinking still happens; the document is smaller.' },
      ],
      pitfalls: [
        'Listing sections like a memorised template with no example',
        'Confusing the test plan with a list of test cases',
      ],
    },
    {
      id: 'qa-manual-bank-iq-12',
      difficulty: 'easy',
      question: 'Two days before release, a stakeholder asks whether requirement REQ-14 is covered and passing. Which artifact answers in 30 seconds, and how do you keep it accurate?',
      whatInterviewerLooksFor: [
        'Names the RTM',
        'Explains forward and backward traceability',
        'Practical upkeep: linking in the tool, updates on change',
      ],
      modelAnswer: `**Artifact:** the **Requirements Traceability Matrix (RTM)**. It links each requirement to its test cases, their latest execution status, and any defects.

| Req | Test cases | Last run | Defects |
|---|---|---|---|
| REQ-14 Refund to wallet | TC-31, TC-32, TC-33 | 2 pass, 1 fail | BUG-208 (High, open) |

So the answer is: "Covered by three cases; one failing because of BUG-208, which is open."

**Two directions:**
- **Forward:** requirement → tests. Finds requirements with no tests.
- **Backward:** test → requirement. Finds tests for removed or invented requirements.

**Keeping it accurate:**
- Link in the tool rather than a spreadsheet: Jira stories linked to Xray/Zephyr tests and bugs, so status updates automatically.
- Update links when a story changes in refinement.
- Check for unlinked requirements before each test cycle and before sign-off.

📚 Full lesson: [Requirements Traceability Matrix (RTM)](#/topic/mt-test-artifacts?tab=learn&s=7)`,
      followUps: [
        { q: 'When is the RTM created?', a: 'It starts during requirement analysis (listing the requirements), is filled in during test design (linking cases), and is updated during execution (status and defects). It is used again at closure to prove coverage. It is a living document, not something built at the end.' },
        { q: 'What is bidirectional traceability useful for during a change request?', a: 'When a requirement changes, forward links show exactly which test cases need updating and re-running, and which defects may be affected. Backward links show tests that no longer trace to a requirement, so they can be updated or retired.' },
      ],
      pitfalls: [
        'Calling the RTM a "list of test cases"',
        'Building it once and never updating it',
      ],
    },
    {
      id: 'qa-manual-bank-iq-13',
      difficulty: 'medium',
      question: 'The only requirement you have is a Figma mockup and a two-line Jira story. How do you write test cases from that?',
      whatInterviewerLooksFor: [
        'Asks questions rather than assuming',
        'Extracts rules from the design (fields, states, messages)',
        'Uses oracles: similar features, standards, the PO',
      ],
      modelAnswer: `**1. Extract what the mockup *does* tell me:** every field, button, label, default value, empty state and error state drawn. Each becomes a test idea.

**2. List questions and get them answered before writing cases:** field limits, mandatory fields, what happens on error, roles, mobile layout. I take them to refinement or a quick three-amigos call and record the answers as acceptance criteria in the story, so they're not lost in chat.

**3. Use other oracles where nothing is written:** similar screens in our product (consistency), platform conventions, accessibility basics, the previous version.

**4. Write scenarios first, then cases:** start with high-level scenarios (create, edit, validation, permissions, empty state), apply EP/BVA once limits are known, then detailed cases for the high-risk ones.

**5. Add an exploratory charter** for the parts still unclear, and log open questions as risks.

**Example:** a "Add delivery note" mockup showed a text box but no limit. My question led to "max 200 characters, emoji allowed", which gave me BVA cases at 199, 200 and 201.

📚 Full lesson: [Test scenario vs test case vs test script](#/topic/mt-test-artifacts?tab=learn&s=0)`,
      followUps: [
        { q: 'What if the PO is unavailable and the sprint has started?', a: 'Write down my assumptions explicitly in the story ("assuming max 200 characters"), test against them, and flag them as open risks in stand-up. Ask the developer what they implemented. Never silently assume; a visible assumption can be corrected cheaply.' },
        { q: 'How do you test the visual side against Figma?', a: 'Compare spacing, fonts, colours and states with the design at the agreed screen sizes, check text overflow with long values, and check hover, focus and disabled states. Report differences with side-by-side screenshots. Where the team has it, visual regression tooling can automate stable screens later.' },
      ],
      pitfalls: [
        'Saying "I cannot test without a full SRS"',
        'Writing cases from personal assumptions without recording them',
      ],
    },
    {
      id: 'qa-manual-bank-iq-14',
      difficulty: 'medium',
      question: 'How many test cases do you write in a day, and how do you estimate effort for writing and executing them?',
      whatInterviewerLooksFor: [
        'An honest, realistic range with context (complexity matters)',
        'An estimation method (breakdown, historical data, buffer)',
        'Includes non-execution time: data, environments, retests',
      ],
      modelAnswer: `**Honest number with context:** "For medium-complexity cases with full steps and data, about 25–40 a day. For complex end-to-end flows, maybe 10–15. The number depends on the detail level our team uses, so I estimate from scenarios, not from a fixed rate."

**How I estimate (work breakdown + history):**
1. Break the feature into scenarios (say 8) and expand each into cases (say 45 in total).
2. Use our past averages: writing about 10 minutes per case, executing about 6 minutes per case.
3. Add the hidden work: test data and environment setup, defect reporting, **retesting and regression** (often 30–40% on top), reviews.
4. Add a buffer for risk (unstable builds, unclear requirements), usually 15–20%.

**Example:** 45 cases → about 7.5 h to write, 4.5 h for one execution cycle, plus 2 h data, 3 h retest/regression → about 17 h, plus 20% buffer ≈ 2.5 days.

**Say this:** "I track actuals against estimates each sprint so the next estimate is better."

📚 Full lesson: [The test plan (estimation and schedule)](#/topic/mt-test-artifacts?tab=learn&s=5)`,
      followUps: [
        { q: 'Your estimate is 5 days but the manager gives you 3. What do you do?', a: 'Show the breakdown and offer options instead of just agreeing: test the high-risk scenarios fully and the low-risk ones lightly, get help from another tester, reduce scope, or accept documented risks. Then make clear in writing which parts will have less coverage, so the decision is shared.' },
        { q: 'Is "number of test cases written per day" a good productivity metric?', a: 'Not on its own. It rewards many shallow or duplicated cases. Better signals are requirement coverage, defects found per area (especially before release), defect leakage and the quality of reviews. I mention the number when asked but explain it depends on detail level.' },
      ],
      pitfalls: [
        'Claiming an unrealistic number like 150 detailed cases a day',
        'Estimating only execution and forgetting retests and data setup',
      ],
    },
    {
      id: 'qa-manual-bank-iq-15',
      difficulty: 'easy',
      question: 'What are entry and exit criteria? Give me real examples from a sprint or release you tested.',
      whatInterviewerLooksFor: [
        'Clear definitions',
        'Measurable examples for both',
        'What happens when criteria are not met',
      ],
      modelAnswer: `**Entry criteria:** conditions that must be true *before* a test activity starts, so we don't waste effort.
**Exit criteria:** conditions that must be true *before* we call the activity finished.

**Examples for system test execution on a release:**

| Entry | Exit |
|---|---|
| Build deployed to QA with release notes | ≥ 95% of planned cases executed |
| Smoke suite passed | 100% of high-priority cases passed |
| Test cases reviewed and linked to stories | No open Critical/High defects |
| Test data and accounts ready | Open Medium/Low defects reviewed and deferred by the PO |
| Blocking bugs from last cycle fixed | Test summary report shared |

**Sprint-level version:** a story's entry criterion is the Definition of Ready (clear acceptance criteria); its exit criterion is the Definition of Done (tested, no open high bugs, regression passed).

**When not met:** if the smoke test fails, the build goes back; we don't start. If exit criteria aren't met on release day, I report the gap and the PO decides whether to accept the risk.

📚 Full lesson: [STLC: entry and exit criteria](#/topic/mt-fundamentals?tab=learn&s=4)`,
      followUps: [
        { q: 'Who defines exit criteria?', a: 'They are proposed by the test lead in the test plan and agreed with the product owner, development lead and sometimes the release manager, before testing starts. Agreeing them early stops the "is it good enough?" argument on release day.' },
        { q: 'Give an example of a bad exit criterion.', a: '"Testing is complete when the product is stable" or "no bugs remaining". Neither is measurable. A good one is countable: "all P1 cases passed, no open Critical or High defects, at least 95% of planned cases executed".' },
      ],
      pitfalls: [
        'Vague criteria like "build is good"',
        'Forgetting that criteria not met should trigger a decision, not silence',
      ],
    },
    {
      id: 'qa-manual-bank-iq-16',
      difficulty: 'easy',
      question: 'You receive a new build of a food-delivery app on Friday evening and a separate fix for the tip calculation on Monday. Where do smoke and sanity fit?',
      whatInterviewerLooksFor: [
        'Smoke on Friday (new build, broad, shallow)',
        'Sanity on Monday (narrow, the fixed area and neighbours)',
        'Knows what happens when each fails',
      ],
      modelAnswer: `**Friday: smoke test on the new build.** Broad and shallow, about 15–20 minutes: app installs and opens, login works, restaurants load, add to cart, checkout reaches the payment screen, order history opens. Question answered: *is this build stable enough to test?* If login is broken, I reject the build immediately so nobody wastes the weekend.

**Monday: sanity test on the tip fix.** Narrow and a bit deeper: tip options (0, ₹10, ₹20, custom), the total updates correctly, the tip shows on the receipt, and the closely related payment summary still adds up. Question answered: *does this fix work, and is the area sane enough for full regression?*

| | Smoke | Sanity |
|---|---|---|
| Trigger | New build | Small change or fix |
| Width | Wide | Narrow |
| Depth | Shallow | Deeper in one area |
| Scripted? | Usually a fixed suite | Often unscripted/quick |

**After sanity:** retest the original tip bug, then regression on checkout and payments.

📚 Full lesson: [Smoke vs sanity testing](#/topic/mt-test-levels-types?tab=learn&s=6)`,
      followUps: [
        { q: 'Is a sanity test a subset of regression?', a: 'It is often described that way: a quick, narrow regression check of the changed area before deciding whether full regression is worth running. Teams use the terms loosely, so in an interview I define how I use them and give the example rather than argue about labels.' },
        { q: 'Should the smoke suite be automated?', a: 'Yes, ideally. It runs on every build, its flows are stable, and it gates the rest of testing, which makes it the classic first automation candidate. Many teams run it in the CI pipeline right after deployment.' },
      ],
      pitfalls: [
        'Swapping the two terms',
        'Running the full regression pack and calling it a smoke test',
      ],
    },
    {
      id: 'qa-manual-bank-iq-17',
      difficulty: 'medium',
      question: 'Can you do regression without retesting, or retesting without regression? Give an example of each.',
      whatInterviewerLooksFor: [
        'Precise definitions of both',
        'Valid examples of each alone',
        'Knows the usual order: retest then regress',
      ],
      modelAnswer: `**Definitions:** *retesting* (confirmation testing) re-runs the exact case that failed, to confirm a specific fix. *Regression testing* re-runs tests on areas that were working, to catch side effects of any change.

**Regression without retesting:** a new feature or a library upgrade with no bug fix involved. Example: the team upgrades the payment SDK. There is no failed case to retest, but I regress checkout, refunds and saved cards because the change could break them.

**Retesting without regression:** possible but risky; acceptable only when the fix is truly isolated. Example: a typo in a static help page text was fixed. I retest that page; regression is not needed because no logic changed.

**Usual case, both:** a fix for the cart-total rounding bug. Retest the failed case first (if it fails, it's reopened and regression would be wasted), then regress cart, checkout, invoices and refunds, all of which use the same total.

| | Retesting | Regression |
|---|---|---|
| Purpose | Confirm one fix | Catch side effects |
| Cases | The failed ones | Previously passed ones |
| Planned? | Specific bug | Scoped by impact and risk |

📚 Full lesson: [Regression testing vs retesting](#/topic/mt-test-levels-types?tab=learn&s=5)`,
      followUps: [
        { q: 'How do you decide regression scope?', a: 'Impact analysis: ask the developer what code changed and which modules share it, check the RTM and past defects for that area, then pick high-risk and high-usage flows near the change plus a standard core regression set. Time available decides how deep to go.' },
        { q: 'Which of the two is a better automation candidate?', a: 'Regression. It is repeated every release with the same steps, so automation pays back quickly. Retesting is specific to one bug and usually done once, although the retest case is often added to the regression suite afterwards so the bug cannot quietly return.' },
      ],
      pitfalls: [
        'Saying retesting and regression are the same',
        'Running regression before confirming the fix itself works',
      ],
    },
    {
      id: 'qa-manual-bank-iq-18',
      difficulty: 'easy',
      question: 'What is UAT, who signs it off, and why can\'t your system testing replace it?',
      whatInterviewerLooksFor: [
        'UAT is done by business users/customers against real workflows',
        'Business owner signs off, not QA',
        'System testing checks requirements; UAT checks fitness for real use',
      ],
      modelAnswer: `**UAT (user acceptance testing):** the last test level, where real business users or customer representatives check that the system supports their actual work, in a production-like environment, before go-live.

**Who signs off:** the business owner or customer (for example the finance head for a billing module). QA usually supports UAT by preparing the environment and data, helping users write scenarios, and triaging the issues they raise, but QA does not sign it off.

**Why system testing can't replace it:**
- System testing checks the product against the **written requirements**. UAT checks it against **real needs**, and requirements can be wrong or incomplete.
- Users know workflows we don't: month-end closing, real data volumes, the order in which they actually do things.
- It's a contractual or business acceptance step.

**Example:** our system tests passed for an invoice export, but in UAT the accountant found the CSV columns weren't in the order their accounting software imports. Requirement met, need not met.

**Related:** alpha testing (internal users, our site) and beta testing (real users, their environment) are forms of acceptance testing.

📚 Full lesson: [System testing and acceptance testing (UAT, alpha, beta)](#/topic/mt-test-levels-types?tab=learn&s=2)`,
      followUps: [
        { q: 'What is the difference between alpha and beta testing?', a: 'Alpha testing is done by internal staff or selected users at the developer’s site, in a controlled environment, before the product goes outside. Beta testing is done by real users in their own environment, with a limited release, to get feedback on real-world use before the full launch.' },
        { q: 'What do you do if UAT finds many bugs that system testing missed?', a: 'Analyse them, not just fix them: were they requirement gaps, missing scenarios, or environment and data differences? Feed the answers back: involve business users earlier (reviews, three amigos), use realistic data, and add the scenarios to the regression suite.' },
      ],
      pitfalls: [
        'Saying QA performs and signs off UAT',
        'Describing UAT as "the same as system testing but later"',
      ],
    },
    {
      id: 'qa-manual-bank-iq-19',
      difficulty: 'medium',
      question: 'What are stubs and drivers? Explain with a signup page whose backend email service is not ready.',
      whatInterviewerLooksFor: [
        'Stub = replaces a called module; driver = replaces a calling module',
        'Links stubs to top-down and drivers to bottom-up integration',
        'Practical example',
      ],
      modelAnswer: `**Stub:** a dummy version of a module that is **called** by the module under test. It returns fixed responses so testing can go on.
**Driver:** a dummy **caller** that invokes the module under test, feeding it inputs, when the real caller doesn't exist yet.

**Signup example:**
- The signup page and its service are ready, but the **email service** they call isn't. Developers plug in a **stub** email service that always replies "sent" (or "failed" when I need the error path). I can test signup, validation and the "check your inbox" screen now, including what happens when sending fails.
- Opposite situation: the email service is ready but no UI calls it. A **driver**, such as a small test script or a Postman request, calls it with different inputs so we can test it alone.

**Integration approaches:**
- **Top-down:** start from the UI, replace lower modules with **stubs**.
- **Bottom-up:** start from the lowest modules, use **drivers** to call them.
- **Big bang:** integrate everything at once; quick to start, hard to locate failures.

**Note:** stubs are tested against an assumption, so retest with the real service once it's ready.

📚 Full lesson: [Integration testing: stubs and drivers](#/topic/mt-test-levels-types?tab=learn&s=1)`,
      followUps: [
        { q: 'What is the difference between a stub and a mock?', a: 'Both are test doubles. A stub just returns canned answers so the test can proceed. A mock also records how it was called and lets the test verify that, for example that the email service was called once with the right address. In manual conversations the terms are often used loosely.' },
        { q: 'Which integration approach finds interface defects earliest?', a: 'Incremental approaches (top-down or bottom-up) find them earlier and make them easier to locate, because each new connection is tested as it is added. Big bang integrates everything at once, so when something fails it is hard to tell which interface caused it.' },
      ],
      pitfalls: [
        'Mixing up which one is the caller',
        'Not mentioning that stubbed behaviour must be retested with the real service',
      ],
    },
    {
      id: 'qa-manual-bank-iq-20',
      difficulty: 'easy',
      question: 'After submitting a registration form, you check the users table in the database. Is that black-box, white-box or grey-box testing?',
      whatInterviewerLooksFor: [
        'Answers grey-box with a reason',
        'Clear definitions of all three',
        'Knows why the database check adds value',
      ],
      modelAnswer: `**Grey-box.** I'm testing through the UI like a user (black-box), but I use some knowledge of the internals, the database table, to design and verify the test. I'm not reading or testing the code itself.

| Type | Knowledge used | Who usually | Example |
|---|---|---|---|
| Black-box | Requirements only, no internals | QA | Register and check the success message |
| White-box | Code structure, paths, branches | Developers | Unit test covering both branches of the age check |
| Grey-box | Partial internals: DB, API, logs | QA | Register, then confirm the row has the right email, a hashed password and status "PENDING" |

**Why the DB check matters:** the UI can show "Registration successful" while the backend saved the email in the wrong case, stored the password in plain text, or created two rows on a double click. None of those show on screen.

**Black-box techniques** I'd use on the form: EP and BVA for field lengths, decision tables for rules.

📚 Full lesson: [Black-box, white-box and grey-box testing](#/topic/mt-test-levels-types?tab=learn&s=8)`,
      followUps: [
        { q: 'What SQL would you run to verify the registration?', a: 'Something like SELECT email, status, created_at FROM users WHERE email = \'asha.qa@example.com\'; then check one row exists, the email is stored as entered (or normalised as agreed), the status is the expected initial value, and the password column holds a hash rather than plain text.' },
        { q: 'Name two white-box coverage measures.', a: 'Statement coverage (every line executed at least once) and branch or decision coverage (every true and false outcome of each decision executed). Branch coverage is stronger: 100% branch coverage implies 100% statement coverage, but not the other way round.' },
      ],
      pitfalls: [
        'Calling it white-box because a database is involved',
        'Not explaining what extra bugs the database check finds',
      ],
    },
    {
      id: 'qa-manual-bank-iq-21',
      difficulty: 'medium',
      question: 'Is end-to-end testing the same as system testing? Explain with an order that goes from the website to the warehouse.',
      whatInterviewerLooksFor: [
        'System testing = the complete system against its requirements',
        'End-to-end = full business flow across systems, as a user would',
        'Concrete example crossing system boundaries',
      ],
      modelAnswer: `**Not quite; they overlap.**

**System testing** checks one complete, integrated system against its requirements: the e-commerce web app as a whole (search, cart, checkout, account), often with external systems stubbed.

**End-to-end testing** follows a **real business flow from start to finish across every system involved**, as the user and business experience it.

**Order example:**
1. Customer places an order on the website (web app)
2. Payment gateway charges the card (third party)
3. The order appears in the warehouse management system with the right items and address
4. Stock is reduced in inventory
5. The courier label is created; the customer gets a confirmation email and SMS
6. The status "Shipped" shows on the website

System testing of the web app could pass even if step 3 never happens. End-to-end testing catches that the warehouse received the wrong quantity because of a field mapping bug between two systems.

**Practical note:** E2E tests are slow and fragile, so keep a few critical journeys end to end and test details lower down (system, API).

📚 Full lesson: [Test levels: from a single unit to user acceptance](#/topic/mt-test-levels-types?tab=learn&s=0)`,
      followUps: [
        { q: 'What is system integration testing?', a: 'Testing the interfaces between our system and other systems, such as the payment gateway, warehouse or SMS provider: correct data formats, error handling, timeouts and retries. End-to-end testing uses those integrations in full flows; SIT focuses on each connection.' },
        { q: 'Why not test everything end to end?', a: 'E2E tests need every system and realistic data available, take long to run, and fail for reasons unrelated to the change (a slow third party, shared data). Finding a bug through them is also slower to diagnose. The test pyramid puts most checks at lower levels and keeps a thin E2E layer.' },
      ],
      pitfalls: [
        'Saying they are identical',
        'Describing E2E as just "testing every screen"',
      ],
    },
    {
      id: 'qa-manual-bank-iq-22',
      difficulty: 'easy',
      question: 'Give me three non-functional bugs a manual tester can find without any special tool.',
      whatInterviewerLooksFor: [
        'Knows functional vs non-functional',
        'Realistic, tool-free examples across performance, usability, accessibility, security',
        'How to report them measurably',
      ],
      modelAnswer: `**Functional** = what the system does; **non-functional** = how well it does it (speed, usability, accessibility, security, compatibility).

**Three tool-free finds:**
1. **Accessibility (keyboard):** I put the mouse away and tab through checkout. Focus disappears after the address field and the "Place order" button can't be reached by keyboard. Report: steps, which element, expected behaviour (visible focus, all controls reachable).
2. **Usability / error handling:** a wrong card number clears *all* the payment fields and shows "Error 400". Expected: keep the entered data, highlight the field, show a human message.
3. **Security basics:** after logging out, pressing the browser Back button shows the account page with the user's address, or changing order ID 1052 to 1053 in the URL shows another customer's order.

**Also possible without tools:** stopwatch-timed page loads on a throttled network (browser dev tools are free), layout on small screens, behaviour with very long names.

**Reporting tip:** make it measurable: "search results take 8–9 s on 3 runs" beats "search is slow".

📚 Full lesson: [Functional vs non-functional testing](#/topic/mt-test-levels-types?tab=learn&s=4)`,
      followUps: [
        { q: 'What is the difference between load and stress testing?', a: 'Load testing checks behaviour at the expected number of users or transactions, for example 2,000 concurrent shoppers on sale day. Stress testing pushes beyond that until the system breaks, to see how it fails and recovers. Both need tools such as JMeter or k6, unlike the manual checks above.' },
        { q: 'Is the URL order-ID issue functional or non-functional?', a: 'It is a security defect (broken access control), which is usually classed as non-functional, although it is also a failure of a functional rule ("users see only their own orders"). Either way it is high severity and should be reported immediately and privately, not in a public channel.' },
      ],
      pitfalls: [
        'Thinking non-functional testing always needs specialist tools',
        'Reporting "slow" or "ugly" without measurement or expected result',
      ],
    },
    {
      id: 'qa-manual-bank-iq-23',
      difficulty: 'easy',
      question: 'A password must be 8 to 16 characters. Give me the boundary values and the equivalence classes in 30 seconds.',
      whatInterviewerLooksFor: [
        'Correct 2-value BVA: 7, 8, 16, 17',
        'Valid and invalid partitions, including empty',
        'Speed and a sentence on why boundaries matter',
      ],
      modelAnswer: `**Equivalence classes (length):**
- Invalid: fewer than 8 (e.g. 4 characters)
- Valid: 8 to 16 (e.g. 12 characters)
- Invalid: more than 16 (e.g. 20 characters)
- Plus special invalid inputs: empty, spaces only

**Boundary values:**
- **2-value BVA:** 7, 8, 16, 17
- **3-value BVA:** 7, 8, 9 and 15, 16, 17

**So my minimum set:** empty, 7, 8, 12, 16, 17 characters. Six tests cover every partition and both edges.

**Why boundaries:** developers often write "> 8" when they mean "≥ 8", so 8 is rejected wrongly. Only a test at exactly 8 catches it.

**Then I'd ask:** are there composition rules (upper case, digit, special character)? Those are separate conditions, better handled with a small decision table, and I'd keep the length at a valid value while testing each rule so one failure doesn't hide another.

📚 Full lesson: [Boundary Value Analysis (BVA): 2-value and 3-value](#/topic/mt-test-design?tab=learn&s=2)`,
      followUps: [
        { q: 'If the developer coded "length < 16" instead of "length <= 16", which test catches it?', a: 'The test with exactly 16 characters. It should be accepted but will be rejected. A 12-character test passes either way, which is why a value in the middle of the partition is not enough.' },
        { q: 'How do you test a 16-character limit if the field silently cuts input at 16?', a: 'Type or paste 17 characters and check what was actually stored: does the field show 16, is the user told, and does the saved password match what they think they typed? Silent truncation of a password is itself a usability bug worth reporting.' },
      ],
      pitfalls: [
        'Giving only 8 and 16 without the outside values',
        'Forgetting empty input',
      ],
    },
    {
      id: 'qa-manual-bank-iq-24',
      difficulty: 'medium',
      question: 'Why do bugs cluster at boundaries? Describe an off-by-one bug you would expect on a date-range filter.',
      whatInterviewerLooksFor: [
        'Explains off-by-one errors and comparison operators',
        'Date-specific boundaries: inclusive end date, time of day, time zones',
        'Proposes concrete test values',
      ],
      modelAnswer: `**Why boundaries:** rules are coded with comparisons (<, <=, >, >=), and the gap between "less than" and "less than or equal" is one character. Requirements are also vague about whether edges are included ("orders from 1 to 31 March"). So the edge is where a developer's assumption most often differs from the business intent.

**Date-range example:** "Show orders from 1 March to 31 March."
- **Expected off-by-one bug:** the query uses "date < 31 March 00:00", so orders placed *on* 31 March (for example at 14:20) are missing. The end date is compared as midnight at the start of the day.
- **Time-zone variant:** an order at 00:30 IST on 1 April is stored as 31 March in UTC and appears in March.

**Test values:**
- Orders at 1 March 00:00 and 28 February 23:59
- Orders at 31 March 23:59 and 1 April 00:00
- Same start and end date (one-day range)
- End date before start date (should be rejected)
- Month lengths and leap years (29 February 2028)

📚 Full lesson: [BVA beyond integers: decimals, dates, lengths and open ends](#/topic/mt-test-design?tab=learn&s=3)`,
      followUps: [
        { q: 'How do you test the time-zone part manually?', a: 'Create orders near midnight, check the timestamp stored (UTC or local) in the database or API, change the user or browser time zone if the app supports it, and compare what the filter returns with what the customer expects to see in their local day. Ask the team which time zone is the business rule.' },
        { q: 'What boundaries exist for a decimal amount like ₹499.99?', a: 'Use the smallest step the system supports: if prices have two decimals, the values around ₹500 are 499.99 and 500.00 (and 500.01 for 3-value). Also check rounding: does 499.995 round up into a different category?' },
      ],
      pitfalls: [
        'Testing only dates in the middle of the range',
        'Ignoring time of day and time zones for date fields',
      ],
    },
    {
      id: 'qa-manual-bank-iq-25',
      difficulty: 'medium',
      question: 'When would you use a decision table instead of boundary values? Use a coupon rule as your example.',
      whatInterviewerLooksFor: [
        'BVA for ranges of one input; decision tables for combinations of conditions',
        'Builds the table correctly (2^n rules)',
        'Uses both techniques together',
      ],
      modelAnswer: `**Rule of thumb:** BVA when one input has a **range**; a decision table when the result depends on a **combination of conditions**.

**Coupon rule:** "WELCOME100 gives ₹100 off if it is the customer's first order AND the cart is at least ₹999. It can't be combined with a sale item."

Three yes/no conditions → 2³ = 8 rules:

| Rule | First order | Cart ≥ ₹999 | Sale item in cart | Result |
|---|---|---|---|---|
| 1 | Y | Y | N | ₹100 off |
| 2 | Y | Y | Y | Rejected: sale item |
| 3 | Y | N | N | Rejected: minimum cart |
| 4 | Y | N | Y | Rejected (which message first?) |
| 5–8 | N | any | any | Rejected: not first order |

Rows 5–8 collapse into one because "not first order" decides the outcome alone, so about 5 tests instead of 8. Rule 4 also exposes a **requirement question**: which error message wins when two conditions fail?

**Then BVA inside the table:** for "cart ≥ ₹999", test ₹998 and ₹999 within rules 1 and 3.

📚 Full lesson: [Decision table testing](#/topic/mt-test-design?tab=learn&s=4)`,
      followUps: [
        { q: 'How many rules does a full table with 4 yes/no conditions have?', a: 'Sixteen (2 to the power 4). That is why collapsing matters: when one condition alone decides the outcome, the other conditions become "don’t care" for those rows, and the merged rows reduce the number of tests while keeping every distinct outcome covered.' },
        { q: 'What if a condition has three values, like membership None, Silver or Gold?', a: 'Multiply the number of values: 3 membership values × 2 × 2 for two yes/no conditions gives 12 rules. It is still a decision table, just with a multi-valued condition. If the numbers explode, pairwise testing can pick a smaller set of combinations.' },
      ],
      pitfalls: [
        'Testing only the happy combination',
        'Missing that two simultaneous failures need a defined message',
      ],
    },
    {
      id: 'qa-manual-bank-iq-26',
      difficulty: 'medium',
      question: 'Which test design technique fits an OTP screen that locks after 3 wrong codes and expires after 5 minutes?',
      whatInterviewerLooksFor: [
        'State transition testing, with states and events named',
        'Tests invalid transitions, not just the valid path',
        'Adds BVA on the time and attempt limits',
      ],
      modelAnswer: `**State transition testing**, because the right behaviour depends on *what happened before* (how many wrong codes, how much time passed), not just the current input.

**States:** OTP sent → 1 wrong → 2 wrong → Locked · plus Expired and Verified.
**Events:** correct code, wrong code, 5 minutes pass, resend.

**Tests covering every valid transition:**
1. Sent → correct code → Verified
2. Sent → wrong → wrong → correct → Verified (the counter doesn't lock early)
3. Sent → wrong ×3 → Locked
4. Sent → wait 5 min → Expired; correct code now rejected

**Invalid transitions (where bugs hide):**
- Correct code entered while Locked: must still be rejected
- Resend while Locked: allowed or not? (ask)
- Does Resend reset the wrong-attempt counter? (a classic bypass)
- Old OTP used after a resend

**Add BVA:** attempts 2 and 3; time 4:59 and 5:01.

📚 Full lesson: [State transition testing](#/topic/mt-test-design?tab=learn&s=6)`,
      followUps: [
        { q: 'What coverage level would you aim for?', a: 'At least every valid transition once (0-switch coverage), plus the important invalid transitions such as entering the correct code while locked. For security-sensitive flows, add sequences of two transitions, such as wrong code followed by resend, because that is where counter-reset bypasses appear.' },
        { q: 'Why is "resend resets the counter" a security problem?', a: 'An attacker could guess two codes, request a resend, guess two more, and repeat without ever being locked, which removes the protection the lock was meant to give. The fix is usually a total attempt limit per session or account, independent of resends.' },
      ],
      pitfalls: [
        'Testing only correct and wrong codes with no state history',
        'Ignoring transitions that should be impossible',
      ],
    },
    {
      id: 'qa-manual-bank-iq-27',
      difficulty: 'medium',
      question: 'Which test design techniques do you actually use day to day, and which finds the most bugs for you?',
      whatInterviewerLooksFor: [
        'Honest, specific usage rather than a textbook list',
        'Matches technique to the kind of rule',
        'Values experience-based techniques alongside formal ones',
      ],
      modelAnswer: `**Honest answer with examples:**
- **EP + BVA, almost every story:** any field with a limit (quantity 1–10, name up to 50 characters, amount ranges). Quick and reliable.
- **Decision tables, when rules combine:** discounts, eligibility, shipping charges. They also surface missing rules in the requirement.
- **State transition, for workflows:** order status, account lock, subscription renewal.
- **Error guessing and checklists, on every feature:** blank fields, spaces, emoji, double-click submit, browser back, session timeout, two tabs.
- **Pairwise,** occasionally for browser/device/payment combinations.

**Which finds the most bugs for me:** error guessing guided by our past defect history: double-submission and back-button bugs came up three releases in a row in our app. **Decision tables find the most *important* ones,** because they expose rules nobody thought through before coding.

**How I'd sum it up:** "I choose the technique from the shape of the rule: a range gets BVA, a combination gets a decision table, a history gets state transition, and I always finish with error guessing."

📚 Full lesson: [Choosing a technique](#/topic/mt-test-design?tab=learn&s=10)`,
      followUps: [
        { q: 'What is error guessing, and how do you make it systematic?', a: 'Designing tests from experience of where bugs usually hide. To make it systematic, keep a team checklist built from past production defects and common failures (empty input, special characters, concurrency, timeouts) and review it in retros, so it grows with real data instead of staying in one person’s head.' },
        { q: 'What is use-case testing?', a: 'Designing tests from a use case’s main success flow, alternative flows and exception flows. For checkout: main flow pays by card; alternatives use UPI or wallet; exceptions include declined card, session timeout and an item going out of stock mid-checkout. It is good for end-to-end business coverage.' },
      ],
      pitfalls: [
        'Listing every technique ever named without saying when you use it',
        'Claiming to use only "positive and negative testing"',
      ],
    },
    {
      id: 'qa-manual-bank-iq-28',
      difficulty: 'easy',
      question: 'How would you test a field that accepts only a 10-digit Indian mobile number?',
      whatInterviewerLooksFor: [
        'Clarifying questions (prefix +91, starting digit, spaces)',
        'EP and BVA on length plus format checks',
        'Functional follow-through (OTP, uniqueness, storage)',
      ],
      modelAnswer: `**Clarify:** Is +91 or a leading 0 allowed? Must it start with 6–9 (valid Indian mobile ranges)? Are spaces or dashes accepted and stripped? Must it be unique per account?

**Length (EP + BVA):** 9 digits (reject), 10 digits (accept), 11 digits (reject), empty (required message).

**Format:**
- Starts with 9, 8, 7, 6 → accept; starts with 5 or 0 → reject (if that rule is confirmed)
- Letters ("98765abcde"), special characters, spaces in the middle, emoji → rejected or stripped as specified
- Pasting "+91 98765 43210" → handled as agreed
- All zeros or repeated digits (0000000000)

**Behaviour:**
- Error message is specific and appears at the right time (on blur or submit)
- Mobile keypad shows digits only on phones
- Number already registered → correct message
- OTP sent to the number; stored in a consistent format in the DB (for example without spaces, with country code)

**Priority if short on time:** 10 valid, 9, 11, letters, starting digit, duplicate.

📚 Full lesson: [Equivalence Partitioning (EP)](#/topic/mt-test-design?tab=learn&s=1)`,
      followUps: [
        { q: 'The field accepts 11 digits but saves only the first 10. Is that a bug?', a: 'Yes, unless the requirement says to truncate. The user typed a different number than the one saved, so OTPs and calls will go to the wrong person. Report it with the input, the stored value and the expected behaviour (reject with a message). Severity is high because it silently corrupts contact data.' },
        { q: 'Why test what is stored in the database, not just the screen?', a: 'Because the same number saved in different formats (+919876543210, 9876543210, 98765 43210) breaks duplicate checks, search and SMS sending later. A grey-box check of the stored format catches data-quality bugs that the UI hides.' },
      ],
      pitfalls: [
        'Testing only "valid number" and "invalid number"',
        'Not asking about country code and formatting rules',
      ],
    },
    {
      id: 'qa-manual-bank-iq-29',
      difficulty: 'medium',
      question: 'Who sets severity and who sets priority on your team, and can priority change while severity stays the same? Give a release-week example.',
      whatInterviewerLooksFor: [
        'QA proposes severity; PO/business owns priority',
        'Priority depends on time and business context; severity on impact',
        'A believable example of priority moving',
      ],
      modelAnswer: `**Who sets what:**
- **Severity** (impact on the system or user): QA proposes it when logging the bug, because we see the technical impact. Leads can adjust it in triage.
- **Priority** (how soon to fix): the product owner decides, often in triage with the dev lead, because it depends on business plans, deadlines and customers.

**Yes, priority changes while severity stays the same.** Severity changes only if the *impact* changes; priority follows the calendar and business.

**Release-week example:** the "Export to PDF" button on the yearly tax statement crashes the page.
- In **June**: severity **High** (a feature fails completely), priority **Low**: almost nobody downloads tax statements in June, and a workaround (email from support) exists. Deferred.
- In **the last week of July**, when tax filing is due: the same bug, still severity **High**, now priority **P1**: thousands of users need the statement this week.

**Classic pair to also mention:** low severity, high priority: a wrong discount percentage on the homepage banner on sale day.

📚 Full lesson: [Severity vs priority](#/topic/mt-defects?tab=learn&s=4)`,
      followUps: [
        { q: 'Give a high-severity, low-priority example that is not about timing.', a: 'The app crashes when a user enters 500 items in a single wish list, which almost nobody does and which has no data loss. The crash is severe, but the tiny number of affected users and the easy workaround make it a low priority compared with other work.' },
        { q: 'You set severity Critical but the PO sets priority Low. What do you do?', a: 'Make sure the PO understands the impact: who is affected, data loss or money involved, any workaround. If they still choose Low with full information, that is their call; I record the decision and the reason in the ticket. If I believe there is a real risk to customers, I escalate once, calmly, through the lead.' },
      ],
      pitfalls: [
        'Saying QA decides priority',
        'Claiming severity and priority always move together',
      ],
    },
    {
      id: 'qa-manual-bank-iq-30',
      difficulty: 'medium',
      question: 'A developer marks your bug "Not a bug" in Jira with no comment, the night before the sprint demo. What exactly do you do?',
      whatInterviewerLooksFor: [
        'Calm, evidence-based first step',
        'Checks the requirement and own assumptions',
        'Escalates to the PO for a decision rather than arguing',
      ],
      modelAnswer: `**1. Check myself first (10 minutes):** re-read the story and acceptance criteria, reproduce on the latest build, and make sure my expected result comes from the requirement, not my opinion. If I was wrong, I add a comment saying so and close it. That honesty builds trust.

**2. If I still think it's a bug, talk, don't type:** message or call the developer: "Can you help me understand why this isn't a bug? AC 3 says the discount shows on the order summary." Often it's a misunderstanding: different build, different data, or a rule they knew and I didn't.

**3. Make the evidence complete:** steps, build, data, screenshot/video, the exact AC line.

**4. If we still disagree, the requirement owner decides:** tag the PO in the ticket with a short neutral summary of both views. Because the demo is tomorrow, I ask for a quick decision: fix now, demo with a known issue, or accept the behaviour and update the story.

**5. Record the outcome** in the ticket so the reasoning isn't lost.

**Never:** reopen it again and again without new information, or complain in the team channel.

📚 Full lesson: [Rejected, duplicate, deferred and reopened](#/topic/mt-defects?tab=learn&s=2)`,
      followUps: [
        { q: 'What if the requirement is silent on this behaviour?', a: 'Then it is a requirement gap, not a pure bug or non-bug. I log it as a question for the PO, explain the user impact, and suggest an acceptance criterion. If the PO wants the change, it becomes a story or an improvement ticket rather than a defect against the developer.' },
        { q: 'How do you keep a good relationship with developers after disputes like this?', a: 'Report facts, not blame; give reproducible evidence; admit when I am wrong; thank them for quick fixes; and pair with them on tricky reproduction. Over time, developers trust well-written bugs, and disputes become rare because the evidence speaks.' },
      ],
      pitfalls: [
        'Reopening immediately without checking the requirement',
        'Escalating to the manager as the first step or arguing in public channels',
      ],
    },
    {
      id: 'qa-manual-bank-iq-31',
      difficulty: 'easy',
      question: 'Draw the bug life cycle on the whiteboard. Where do Duplicate, Deferred and Rejected branch off, and who moves each state?',
      whatInterviewerLooksFor: [
        'Main path in the right order',
        'Correct branch points for side exits',
        'Ownership of each transition',
      ],
      modelAnswer: `**Main path (owner in brackets):**
New (tester logs) → Assigned (lead/triage) → Open / In progress (developer) → Fixed (developer) → Retest / Ready for QA (build deployed) → Verified → Closed (tester).

**Side exits, mostly from New or Assigned during triage:**
- **Duplicate:** the same issue already exists; linked to the original and closed (lead or tester).
- **Rejected / Not a bug:** works as designed or invalid (developer or lead, ideally confirmed by the PO).
- **Deferred / Postponed:** valid, but fixed in a later release (PO decides).
- **Cannot reproduce / Need more info:** goes back to the tester for details.

**Loop:** from Retest, if the fix fails → **Reopened** (tester) → back to the developer.

**Whiteboard tip:** draw the main path as a straight line, the side exits branching down from triage, and the Reopened arrow looping back from Retest. Say "names vary by Jira workflow; the idea is the same".

**Example:** "BUG-341 was reopened twice because the fix worked for card payments but not UPI. I added the UPI steps the second time."

📚 Full lesson: [Defect life cycle](#/topic/mt-defects?tab=learn&s=1)`,
      followUps: [
        { q: 'Can a closed bug be reopened?', a: 'In many workflows, yes, if the same issue reappears in a later build. Some teams prefer a new bug linked to the old one after a release, so metrics stay clean. Either way, link them so the history and the regression gap are visible.' },
        { q: 'What is the difference between Deferred and Rejected?', a: 'Deferred means it is a valid bug that the business has chosen to fix later, usually because of low priority or risk of a late change. Rejected means it is not considered a bug at all (works as designed, invalid, or a misunderstanding). Deferred bugs should appear in the release notes or known-issues list.' },
      ],
      pitfalls: [
        'Putting Closed right after Fixed without a retest',
        'Saying the tester can defer a bug',
      ],
    },
    {
      id: 'qa-manual-bank-iq-32',
      difficulty: 'medium',
      question: 'Which fields must every bug report have, and which missing field gets a report bounced back fastest?',
      whatInterviewerLooksFor: [
        'Complete core fields',
        'Recognises steps/environment as the most common bounce reason',
        'Writes clear titles',
      ],
      modelAnswer: `**Core fields:**
- **Title:** what is wrong + where + when. "Checkout: total ignores coupon when quantity is changed after applying it"
- **Environment:** build/version, environment (QA/staging), browser/device/OS, user role
- **Preconditions and test data:** account, cart contents, coupon code
- **Steps to reproduce:** numbered, minimal, one action per step
- **Expected result** (with the requirement reference) and **actual result**
- **Evidence:** screenshot, screen recording, console/network log, request ID
- **Severity** (and suggested priority), **frequency** (always / 3 of 10), component, linked story

**Bounced back fastest: missing steps or build/environment.** If the developer can't reproduce, the bug sits in "Cannot reproduce" for days. Second place: an expected result that is opinion ("should be better") rather than a rule.

**Good habit:** before submitting, follow my own steps on a clean session. If I can't reproduce from the report alone, nobody else can.

📚 Full lesson: [Anatomy of a great bug report](#/topic/mt-defects?tab=learn&s=3)`,
      followUps: [
        { q: 'One bug or several if you find three problems on one page?', a: 'Several, one per issue, so each can be prioritised, assigned, fixed and retested independently. A combined ticket gets half-fixed and stuck. Link them to each other or to the story so the relationship is clear.' },
        { q: 'What makes a bug title strong?', a: 'It says what is wrong, where, and under which condition, in under about 15 words, so a lead can triage from the list view. "Checkout: total ignores coupon after quantity change" works; "Checkout issue" or "Bug in coupon" forces everyone to open the ticket.' },
      ],
      pitfalls: [
        'Vague titles like "Not working"',
        'No build or environment information',
      ],
    },
    {
      id: 'qa-manual-bank-iq-33',
      difficulty: 'medium',
      question: 'You hit a bug that happens only about once in ten attempts. How do you investigate and report it?',
      whatInterviewerLooksFor: [
        'Systematic variation to find the trigger',
        'Captures evidence the moment it happens',
        'Reports it honestly with frequency, not as "random"',
      ],
      modelAnswer: `**Investigate before reporting (time-boxed, say 30–45 minutes):**
1. **Capture it when it happens:** keep screen recording and the browser dev tools (network + console) open, note the exact time so developers can find it in server logs.
2. **Look for the pattern by changing one thing at a time:** speed (double-click vs single), network (throttled), data (specific products, account), browser, time of day, how long the session has been open, parallel tabs.
3. **Common triggers:** double submission, race conditions between two API calls, caching, a specific server in a load-balanced pool, session expiry.

**Report it even if I can't pin it down:**
- Title includes "intermittent"
- **Frequency:** "3 of 10 attempts on QA build 5.1.2, Chrome"
- Steps used, what I varied, what made no difference
- Evidence: video of a failing run, timestamps, request IDs, HAR file
- Severity by *impact when it happens* (a double charge 1 in 10 times is still critical)

**Then pair with the developer** to reproduce with logging on.

📚 Full lesson: [Reproducible reports and evidence](#/topic/mt-defects?tab=learn&s=5)`,
      followUps: [
        { q: 'The developer closes it as "cannot reproduce". Next step?', a: 'Share the timestamps and request IDs so they can check server logs for my failed run, offer to reproduce together on a call, and compare environments (build, data, configuration). If it stays rare and low impact, agree to keep it open with a "monitor" label rather than silently closing it.' },
        { q: 'Would you lower severity because it is intermittent?', a: 'No. Severity is about the impact when it happens. Frequency affects priority and the risk discussion, so I state both: "Critical severity (double charge), occurs about 1 in 10 attempts". The business can then weigh it properly.' },
      ],
      pitfalls: [
        'Not reporting it because it cannot be reproduced every time',
        'Reporting "sometimes fails" with no frequency or evidence',
      ],
    },
    {
      id: 'qa-manual-bank-iq-34',
      difficulty: 'medium',
      question: 'What is defect leakage, and what would you do on your team to reduce it?',
      whatInterviewerLooksFor: [
        'Correct formula and meaning',
        'Root-cause view of escaped bugs',
        'Concrete process improvements',
      ],
      modelAnswer: `**Definition:** the share of defects that escaped a test phase and were found later (in UAT or production).

**Formula (one common version):** defects found after release ÷ (defects found in testing + defects found after release) × 100.
Example: 90 found in QA, 10 in production → 10 ÷ 100 = **10% leakage**. The related **DRE** (defect removal efficiency) is 90%.

**How I would reduce it:**
1. **Analyse each escaped bug:** why was it missed? Missing requirement, no test case, test existed but wasn't run, environment difference, or data difference.
2. **Fix the cause, not just the bug:** add the scenario to regression, update the test design checklist, get production-like test data, align environments.
3. **Shift left:** three-amigos reviews to catch unclear requirements before coding.
4. **Risk-based regression:** more depth where leakage clusters (it usually does: payments, integrations).
5. **Track it per release** and discuss it in retros, never to blame individuals.

**Example:** two escaped bugs came from mobile Safari only; we added Safari to the smoke run and leakage there stopped.

📚 Full lesson: [Defect metrics: density, leakage, DRE, reopen rate](#/topic/mt-defects?tab=learn&s=9)`,
      followUps: [
        { q: 'What is the difference between bug leakage and bug release?', a: 'Bug leakage is a defect the testing missed and that was found later by users or UAT. Bug release is a known defect that the team knowingly shipped, usually low priority and listed in the release notes as a known issue. One is a testing gap; the other is a business decision.' },
        { q: 'How can leakage numbers mislead?', a: 'A release with few changes will naturally have low leakage; a team that logs minor production issues diligently may look worse than one that ignores them; and counting without severity hides the one critical escape among many trivial ones. Always read it with severity and context.' },
      ],
      pitfalls: [
        'Using the metric to blame individual testers',
        'Knowing the formula but no improvement actions',
      ],
    },
    {
      id: 'qa-manual-bank-iq-35',
      difficulty: 'medium',
      question: 'You find a critical bug two hours before the release. What do you do?',
      whatInterviewerLooksFor: [
        'Immediate, factual communication to the right people',
        'Gives decision-makers options and impact',
        'Does not decide alone or hide it',
      ],
      modelAnswer: `**1. Confirm quickly (5–10 minutes):** reproduce once more on the release candidate build, confirm it isn't a test-environment or data problem, and capture evidence.

**2. Log it and tell people immediately, not at the end of the day:** a Jira bug with full details, plus a direct message or call to the QA lead, dev lead and product owner: "Critical: orders with UPI payment are created twice on RC build 7.3.0. Steps and video in BUG-512."

**3. Give the information needed for a decision:**
- Impact: who is affected, how many, money or data involved
- Scope: one payment method, or all?
- Workarounds: disable UPI with a feature flag? Roll back the change?
- Fix estimate from the developer, and what retest and regression it would need

**4. The decision belongs to the business:** delay, release with the feature switched off, or (rarely) release with a documented known issue.

**5. If fixed:** retest the bug, run a focused regression on payments and smoke, then sign off with a clear note of what was and wasn't re-tested.

📚 Full lesson: [Release validation and the go/no-go decision](#/topic/mt-agile-release?tab=learn&s=7)`,
      followUps: [
        { q: 'The manager says "release anyway". What do you do?', a: 'Make sure the risk is clearly written down: the bug, the impact, and that QA recommends not releasing. If the business still decides to go, that is their call; I record it, suggest mitigations (feature flag off, monitoring, support team briefed) and test the fix as soon as it arrives.' },
        { q: 'Why was this not found earlier, and does that matter now?', a: 'It matters, but after the release decision, not during it. In the retrospective I would look at why the scenario was missed (no UPI case, late code change, environment difference) and add the check to the regression suite. Right now the priority is a clear decision.' },
      ],
      pitfalls: [
        'Staying silent or logging it quietly and waiting',
        'Claiming QA alone can block or approve the release',
      ],
    },
    {
      id: 'qa-manual-bank-iq-36',
      difficulty: 'easy',
      question: 'What is a defect triage meeting, who attends, and what do you bring to it?',
      whatInterviewerLooksFor: [
        'Purpose: validate, prioritise and assign defects',
        'Right attendees',
        'QA preparation: clear reports, impact, reproduction',
      ],
      modelAnswer: `**Purpose:** a short, regular meeting (daily in release week, otherwise once or twice a week) where new and disputed bugs are reviewed to decide: is it valid, how severe, how urgent, which release, and who owns it.

**Who attends:** product owner (priority), dev lead (effort, ownership), QA lead or tester (impact, reproduction), sometimes support or the release manager.

**Outcomes per bug:** accept and assign, set priority and target release, mark duplicate, reject with reason, defer with PO approval, or ask for more information.

**What I bring:**
- New bugs already complete (steps, build, evidence) so time isn't spent decoding them
- **Impact in business terms:** "affects every UPI payment" rather than "API returns 500"
- My proposed severity and a suggested priority with a reason
- Duplicates and links already checked
- For release week: open bugs against exit criteria ("2 High open; exit criteria say zero")

**After the meeting:** update tickets with the decisions so the reasoning is recorded.

📚 Full lesson: [Defect triage](#/topic/mt-defects?tab=learn&s=7)`,
      followUps: [
        { q: 'A triage meeting keeps running over an hour. How would you improve it?', a: 'Pre-triage asynchronously: QA checks completeness and duplicates before the meeting, the PO pre-sets obvious priorities, and the meeting only discusses disputed or high-impact bugs, with a time box per bug. Bugs needing investigation get an owner and leave the meeting.' },
        { q: 'What is defect cascading?', a: 'When one defect causes other defects downstream, for example a wrong tax calculation that also breaks the invoice, the refund amount and the accounting export. In triage, recognising cascading helps fix the root defect first and avoid many separate tickets for the same cause.' },
      ],
      pitfalls: [
        'Describing triage as just "assigning bugs to developers"',
        'Coming with incomplete reports and arguing severity without impact',
      ],
    },
    {
      id: 'qa-manual-bank-iq-37',
      difficulty: 'medium',
      question: 'You have 2 hours to test a release. How do you decide what to test?',
      whatInterviewerLooksFor: [
        'Risk-based selection: changes, critical paths, history',
        'A time plan',
        'Communicates what was not tested',
      ],
      modelAnswer: `**1. Five minutes to get facts:** what changed in this release (release notes, tickets, developer), which areas are business-critical, and where bugs came from recently.

**2. Rank by risk (likelihood × impact):**
- High: changed code in critical flows (payments, login, data saving)
- Medium: critical flows not changed but sharing code with the change
- Low: cosmetic and rarely used areas

**3. Time plan:**
| Time | Activity |
|---|---|
| 0:00–0:15 | Smoke on the build: login, core journey, payment reaches confirmation |
| 0:15–1:15 | Deep testing of the changed features and their bug fixes (retests) |
| 1:15–1:45 | Focused regression on neighbouring high-risk flows |
| 1:45–2:00 | Short exploratory pass on the riskiest change; write the summary |

**4. Report honestly:** "Tested: X, Y, Z. Not tested: refunds and admin reports. Risk: low, unchanged this release." The PO decides with that information.

**If automation exists,** I'd run it in parallel to cover breadth while I go deep manually.

📚 Full lesson: [Prioritising under time pressure](#/topic/mt-exploratory-risk?tab=learn&s=10)`,
      followUps: [
        { q: 'How would the plan change if you had only 30 minutes?', a: 'Smoke the build (10 minutes), retest the critical fixes and the single riskiest change (15 minutes), and write the not-tested list (5 minutes). Coverage would be thin, so the risk statement becomes even more important, and I would ask whether automated regression can run alongside.' },
        { q: 'What do you do if the smoke test fails 10 minutes in?', a: 'Stop and report immediately: the build is not testable, so the other 110 minutes would be wasted. Give the evidence to the dev lead and PO, and the release either waits for a fixed build or is rolled back. A failed smoke is a decision point, not a bug to note at the end.' },
      ],
      pitfalls: [
        'Trying to run the whole regression suite quickly',
        'Not telling anyone what was skipped',
      ],
    },
    {
      id: 'qa-manual-bank-iq-38',
      difficulty: 'medium',
      question: 'Tell me about a bug you found through exploratory testing that no written test case would have caught.',
      whatInterviewerLooksFor: [
        'A real, specific story (STAR-like)',
        'Shows the thinking that led to the bug',
        'What changed afterwards (case added, checklist)',
      ],
      modelAnswer: `**Shape the answer like this (example story):**

**Situation:** a "split the bill" feature in a restaurant-booking app. All 32 scripted cases passed.

**What I explored:** I wrote a 45-minute charter: "Explore bill splitting with unusual group actions to discover money mismatches." I asked myself what real groups do: people leave, join late, change their minds.

**The bug:** if one diner was removed from the group *after* the split was calculated, their share disappeared instead of being redistributed. The bill total shown to the others was ₹480 less than the restaurant's bill. No case covered "remove a person after splitting" because the requirement never mentioned it.

**Result:** reported as High severity (money mismatch with the restaurant). The PO added a rule: recalculate on any change. I added three cases to the regression suite and "change the group after calculation" to our team's error-guessing checklist.

**Why this answer works:** it shows exploration is planned (charter, time box), driven by user behaviour, and that its findings feed back into scripted tests.

📚 Full lesson: [What exploratory testing really is](#/topic/mt-exploratory-risk?tab=learn&s=0)`,
      followUps: [
        { q: 'How do you document an exploratory session?', a: 'A session sheet: charter, start time and duration, areas covered, test ideas tried, bugs found, questions raised, and the percentage of time spent testing versus investigating or setting up. It makes the work reviewable and lets the lead see coverage across sessions.' },
        { q: 'How did you decide where to explore?', a: 'From risk and change: new features, complex rules involving money, areas with past bugs, and gaps where the requirements were thin. Heuristics such as CRUD, zero-one-many and interruptions (back button, network loss, two tabs) give concrete ideas once the area is chosen.' },
      ],
      pitfalls: [
        'A vague story without the bug, the impact or the outcome',
        'Describing exploration as random clicking',
      ],
    },
    {
      id: 'qa-manual-bank-iq-39',
      difficulty: 'medium',
      question: 'How would you score risk for a banking app\'s fund-transfer feature, and how does that score change what you test?',
      whatInterviewerLooksFor: [
        'Risk = likelihood × impact with a simple scale',
        'Scores concrete sub-areas, not the whole feature as one',
        'Maps score to test depth',
      ],
      modelAnswer: `**Method:** break the feature into sub-areas, score each on **likelihood** of failure (1–3: new code, complexity, past bugs) and **impact** if it fails (1–3: money, data, users, regulation), multiply.

| Sub-area | Likelihood | Impact | Score |
|---|---|---|---|
| Transfer amount and balance update | 2 (changed logic) | 3 (money) | **6** |
| Daily limit check | 3 (new rule) | 3 | **9** |
| Beneficiary add with OTP | 2 | 3 (fraud) | **6** |
| Transaction history display | 1 | 2 | 2 |
| Download statement PDF | 1 | 1 | 1 |

**How it changes testing:**
- **9:** full EP/BVA on the limit (limit − 1, limit, limit + 1, multiple transfers adding up to the limit), negative and concurrency tests, done first, reviewed by a second tester.
- **6:** thorough scripted cases plus an exploratory session.
- **1–2:** a quick check or regression only.

**Also:** re-score when things change (a late code change raises likelihood) and show the matrix in the test plan so the PO agrees with the priorities.

📚 Full lesson: [Risk-based testing: likelihood × impact](#/topic/mt-exploratory-risk?tab=learn&s=8)`,
      followUps: [
        { q: 'Who should provide the impact scores?', a: 'The business side (PO, domain experts, support) knows the impact on customers, money and regulation; developers and testers know the likelihood (complexity, new code, past defects). Scoring together in a short session gives a matrix everyone trusts.' },
        { q: 'What is the difference between product risk and project risk?', a: 'Product risk is the chance the software itself fails (wrong balance, failed transfer). Project risk threatens the project’s ability to deliver (late test environment, a key tester on leave, unclear requirements). Both go in the test plan; product risks drive test depth, project risks drive mitigations.' },
      ],
      pitfalls: [
        'Scoring the whole feature as one item',
        'Scoring risk but not changing test depth because of it',
      ],
    },
    {
      id: 'qa-manual-bank-iq-40',
      difficulty: 'easy',
      question: 'A teammate says "I clicked around randomly for an hour, so I did exploratory testing." Is that right? What would make it count?',
      whatInterviewerLooksFor: [
        'Distinguishes exploratory from ad hoc and monkey testing',
        'Names the structure: charter, time box, notes, debrief',
        'Tactful framing',
      ],
      modelAnswer: `**Not quite; that was ad hoc testing.** It can find bugs, but nobody can tell what was covered, and it can't be repeated or reviewed.

**Exploratory testing** is simultaneous learning, test design and execution, *with direction*:
- **Charter:** "Explore the address book with long and international addresses to discover saving and display problems"
- **Time box:** 60–90 minutes, uninterrupted
- **Notes:** what was tried, bugs, questions, ideas for later
- **Debrief:** a short review with the lead: what was covered, what remains

| | Exploratory | Ad hoc | Monkey |
|---|---|---|---|
| Plan | Charter and time box | None | None |
| Uses product knowledge | Yes, heavily | Some | No (random input) |
| Documented | Session notes | Rarely | Logs only |
| Typical goal | Learn and find important bugs | Quick informal check | Crash/robustness |

**Tactful reply to the teammate:** "Nice, did you find anything? Let's write a charter for the next hour so we can show what you covered."

📚 Full lesson: [Ad hoc, monkey and gorilla testing compared](#/topic/mt-exploratory-risk?tab=learn&s=7)`,
      followUps: [
        { q: 'What is gorilla testing?', a: 'Testing one module or function very heavily and repeatedly, often with many inputs, to check its robustness. Unlike monkey testing, which spreads random input across the app, gorilla testing hammers one area that is known to be important or fragile.' },
        { q: 'Write a charter for a coupon field in 20 seconds.', a: 'Explore the checkout coupon field with expired, stacked, case-varied and boundary-amount coupons to discover wrong discounts and misleading messages. Time box 60 minutes. That gives the target, the resources or variations, and the information we want.' },
      ],
      pitfalls: [
        'Calling exploratory testing "testing without test cases" and stopping there',
        'Dismissing ad hoc testing as useless',
      ],
    },
    {
      id: 'qa-manual-bank-iq-41',
      difficulty: 'medium',
      question: 'Developers finish most stories on day 9 of a 10-day sprint. How do you still test properly inside the sprint?',
      whatInterviewerLooksFor: [
        'Identifies the mini-waterfall problem',
        'Concrete fixes: smaller stories, early builds, test prep, WIP limits',
        'Raises it in the retro as a team problem',
      ],
      modelAnswer: `**Name the problem:** it's a mini-waterfall inside the sprint. Testing gets one day, so either quality drops or stories spill over.

**What I do myself:**
- Days 1–3: test cases and data ready for every story, so testing starts the hour a build lands.
- Test early pieces: API endpoints before the UI, feature-flagged partial builds, developer branches on a test environment.
- Pair with developers on unit test ideas and quick desk checks before they hand over.

**What I propose to the team (in the retrospective, with data):**
- **Smaller stories** that finish on days 3–6 instead of one big story at the end.
- **Stop starting, start finishing:** limit work in progress so developers finish one story before picking up the next.
- Make "tested" part of the **Definition of Done**, so an untested story doesn't count.
- Automate the smoke and regression checks so day 10 is for new stories, not repetitive checks.

**Evidence that helps:** "Last 3 sprints, 70% of stories reached QA on day 9 and 4 spilled over."

📚 Full lesson: [The sprint testing workflow, day by day](#/topic/mt-agile-release?tab=learn&s=5)`,
      followUps: [
        { q: 'A story reaches you on day 10 with no time left. Do you mark it done?', a: 'No. If it is not tested to the Definition of Done, it is not done. I tell the team and the PO, and the story either moves to the next sprint or, if the PO accepts a risk-based quick check for a small change, that decision is recorded. Quietly passing it hides the real problem.' },
        { q: 'What can QA do in the first two days of a sprint?', a: 'Clarify acceptance criteria, write test cases and data, set up environments and accounts, plan regression, review designs, and help developers with test ideas. Being idle until code arrives is a sign the team treats testing as a phase rather than a continuous activity.' },
      ],
      pitfalls: [
        'Accepting the squeeze silently every sprint',
        'Blaming developers instead of proposing process changes',
      ],
    },
    {
      id: 'qa-manual-bank-iq-42',
      difficulty: 'medium',
      question: 'A story arrives in refinement with the acceptance criterion "search should be fast". What do you say in that meeting?',
      whatInterviewerLooksFor: [
        'Recognises an untestable criterion',
        'Turns it into measurable, agreed criteria',
        'Uses examples (three amigos / Given-When-Then)',
      ],
      modelAnswer: `**Point it out politely:** "'Fast' means different things to each of us, so we can't pass or fail it. Can we put a number on it?"

**Questions I ask:**
- Fast for whom and under what conditions? Typical user on 4G, or office network?
- How many products in the catalogue, and how many users searching at the same time?
- Measured where: time until results are visible, or the API response time?
- What's acceptable today? Do we have a current baseline?

**Rewritten criteria (example):**
- Given a catalogue of 50,000 products, when a user searches a common term on a 4G connection, then the first results are visible within 2 seconds for 95% of searches.
- Typing shows suggestions within 300 ms after the user stops typing.
- Under 200 concurrent searches, response time stays under 3 seconds.

**Also:** agree how it will be tested (a performance tool for load, a manual check with throttling for the single-user case) and add it to the Definition of Ready check: every criterion must be testable.

📚 Full lesson: [Acceptance criteria and BDD with Gherkin](#/topic/mt-agile-release?tab=learn&s=4)`,
      followUps: [
        { q: 'What makes an acceptance criterion testable?', a: 'It describes observable behaviour with a clear pass or fail, uses concrete values or examples, and is about one behaviour. "Shows an error" is weak; "shows ‘Enter a valid email’ under the field and keeps the other values" is testable. Given-When-Then helps because it forces context, action and outcome.' },
        { q: 'Who writes acceptance criteria?', a: 'The product owner owns them, but they work best when written together with the developer and tester in refinement or a three-amigos session. The tester’s role is to add edge cases and make sure each criterion can actually be tested.' },
      ],
      pitfalls: [
        'Accepting the vague criterion and testing by gut feel',
        'Inventing a number without getting the PO to agree',
      ],
    },
    {
      id: 'qa-manual-bank-iq-43',
      difficulty: 'medium',
      question: 'Who decides go or no-go for a release, and what does your QA sign-off email actually contain?',
      whatInterviewerLooksFor: [
        'Business owns the decision; QA provides evidence and a recommendation',
        'Concrete content: scope, results, open defects, risks, not tested',
        'Clear recommendation with conditions',
      ],
      modelAnswer: `**Decision:** the product owner or release manager decides; QA provides the evidence and a clear recommendation. QA "signs off" on what was tested, not on the business risk.

**My sign-off email (short and scannable):**
- **Release / build:** v5.4.0, RC build 512, tested on staging, 10–14 March
- **Scope tested:** 6 stories (list), regression of checkout, payments, account
- **Results:** 412 cases planned, 405 executed (98%), 399 passed; automated regression green
- **Open defects:** 0 Critical, 0 High, 3 Medium (deferred by PO: BUG-611, 614, 620), 5 Low
- **Not tested / limits:** iOS 15 (no device), refund-to-bank (sandbox down; covered by API tests only)
- **Risks:** medium on refunds because of the sandbox gap
- **Recommendation:** **Go**, with the condition that refunds are monitored for the first 24 hours
- Links: test summary report, Jira filter

**Why it works:** anyone can read the facts in 30 seconds, and the gaps are written down before release, not explained after an incident.

📚 Full lesson: [Release validation and the go/no-go decision](#/topic/mt-agile-release?tab=learn&s=7)`,
      followUps: [
        { q: 'What is the difference between a test execution report and a test summary report?', a: 'An execution report is a progress snapshot during testing (daily or per cycle: executed, passed, failed, blocked, new bugs). The summary (completion) report comes at the end: scope, final results, open defects, deviations, risks and a recommendation. One tracks progress; the other supports the release decision.' },
        { q: 'Would you ever recommend No-go with zero open critical bugs?', a: 'Yes, if a critical area was not tested at all (environment down, late change) or exit criteria for coverage were not met. Unknown risk can be as serious as a known bug. I would say exactly what is untested and what it would take to close the gap.' },
      ],
      pitfalls: [
        'Saying "QA decides the release"',
        'A sign-off that hides untested areas',
      ],
    },
    {
      id: 'qa-manual-bank-iq-44',
      difficulty: 'easy',
      question: 'How does testing differ in practice between an Agile team and a Waterfall project, from the tester\'s seat?',
      whatInterviewerLooksFor: [
        'Timing, documentation and collaboration differences',
        'Whole-team quality in Agile',
        'Balanced view: both need planning and regression',
      ],
      modelAnswer: `| Aspect | Waterfall | Agile (Scrum) |
|---|---|---|
| When testing happens | A phase after development | Continuously, every sprint |
| Requirements | Detailed SRS, signed off up front | User stories + acceptance criteria, refined just in time |
| Documentation | Formal test plan, full test case sets | Lighter: test approach page, cases or checklists per story |
| Feedback | Late, often weeks after coding | Within days, sometimes hours |
| Collaboration | Handoffs between separate teams | Tester inside the team; three amigos, stand-ups |
| Regression | Big cycles before release | Every sprint, so automation becomes essential |
| Who owns quality | Mainly the QA team | The whole team; QA leads the testing |

**From my seat in Agile:** I spend more time talking (refinement, pairing with developers), I test in small pieces as stories land, and I have to manage regression continuously, which is why I'm moving into automation.

**What stays the same:** risk-based thinking, test design techniques, clear bug reports, and entry/exit criteria (they just become DoR and DoD).

📚 Full lesson: [Agile in one page](#/topic/mt-agile-release?tab=learn&s=0)`,
      followUps: [
        { q: 'What are the Agile Testing Quadrants?', a: 'A model by Brian Marick, popularised by Lisa Crispin and Janet Gregory, that sorts tests by whether they support the team or critique the product, and whether they are business- or technology-facing: Q1 unit/component tests, Q2 functional and story tests, Q3 exploratory and usability, Q4 performance and security. It helps make sure no kind of testing is forgotten.' },
        { q: 'Is documentation unimportant in Agile?', a: 'No. The manifesto values working software more than comprehensive documentation, not instead of it. Testers still keep test cases for regression and compliance, bug reports and a test approach; they just avoid documents nobody reads.' },
      ],
      pitfalls: [
        'Saying Agile has no planning or documentation',
        'Describing Waterfall testing only negatively with no trade-offs',
      ],
    },
    {
      id: 'qa-manual-bank-iq-45',
      difficulty: 'medium',
      question: 'Walk me through how you test a new feature from requirement to release.',
      whatInterviewerLooksFor: [
        'End-to-end process in the right order',
        'Concrete artifacts and decisions at each step',
        'A real feature as the thread through the answer',
      ],
      modelAnswer: `**Use one real feature as the thread.** Example: "save card for future payments".

1. **Requirement analysis:** read the story, ask questions in refinement (how many cards? expiry handling? which payment types? PCI rules?), make acceptance criteria testable.
2. **Plan:** scope in and out, risks (payments = high), environments (payment sandbox), data (test cards), time estimate.
3. **Design:** scenarios first, then test cases using EP/BVA (card number lengths, expiry month boundaries) and a decision table (save checkbox × payment success × card type). Link them to the story (RTM).
4. **Prepare:** test accounts, sandbox cards, an environment with the build; smoke when the build lands.
5. **Execute:** run cases, explore with a charter ("saved cards across devices and logout"), log bugs with evidence, retest fixes.
6. **Regression:** checkout, refunds and wallet, which share the payment module.
7. **Report and sign-off:** results, open bugs, untested areas, recommendation.
8. **After release:** production smoke, watch logs and support tickets; feed anything missed back into regression.

**Close with:** "Then I look at which checks are stable enough to automate."

📚 Full lesson: [STLC: the six phases](#/topic/mt-fundamentals?tab=learn&s=4)`,
      followUps: [
        { q: 'Which step do you think adds the most value?', a: 'Requirement analysis. Questions asked before coding prevent defects rather than finding them, and they cost minutes. In the saved-card example, asking about expired cards added an acceptance criterion that would otherwise have become a production bug.' },
        { q: 'What do you do after the release?', a: 'Run a quick production smoke check if allowed, watch error dashboards and support tickets for the feature, join any incident review, and add escaped scenarios to the regression suite. Testing does not end at the release; it shifts to monitoring.' },
      ],
      pitfalls: [
        'Starting at "I execute the test cases"',
        'A generic STLC recital without a real feature',
      ],
    },
    {
      id: 'qa-manual-bank-iq-46',
      difficulty: 'easy',
      question: 'What does a normal working day look like for you as a manual tester?',
      whatInterviewerLooksFor: [
        'Realistic mix of activities, not only execution',
        'Collaboration with developers and PO',
        'Signs of ownership and improvement',
      ],
      modelAnswer: `**A typical day in a Scrum team (adapt to your real one):**

| Time | What I do |
|---|---|
| 9:30 | Check overnight automation results and new builds; smoke the latest QA build |
| 10:00 | Daily stand-up: what I tested, what's blocked ("waiting for sandbox access"), bugs that need attention |
| 10:15–13:00 | Test stories that reached QA: execute cases, explore edge cases, log bugs with evidence |
| 14:00 | Retest fixed bugs; quick chats with developers to reproduce tricky issues |
| 15:00 | Refinement or three-amigos session for next sprint's stories: questions and acceptance criteria |
| 16:00 | Write or update test cases and data for upcoming stories; update the RTM |
| 17:00 | Update Jira statuses, share a short status note if it's release week |

**Point to make:** execution is only part of the job. Asking questions early, writing clear bugs and keeping the team informed are just as important.

**Bonus line if true:** "I spend about an hour a day learning Playwright and automating our smoke cases."

📚 Full lesson: [The role of a QA engineer](#/topic/mt-fundamentals?tab=learn&s=9)`,
      followUps: [
        { q: 'Which tools do you use daily?', a: 'Name only the ones you have used: for example Jira for stories and bugs, Xray or TestRail for test cases, Confluence for test plans, Chrome DevTools for network and console checks, Postman for quick API checks, and Slack or Teams for communication. Then give one example of how you used one of them.' },
        { q: 'What do you do when you are blocked by a broken environment?', a: 'Report it quickly in stand-up or the team channel with details, then switch to unblocked work: write cases for upcoming stories, review requirements, prepare data or do API-level checks if they work. Keep the blocked time visible so the team sees the cost.' },
      ],
      pitfalls: [
        'Describing the day as only "executing test cases"',
        'Naming tools you have not used',
      ],
    },
  ],
  test: [
    {
      id: 'qa-manual-bank-mcq-01',
      difficulty: 'easy',
      question: 'A reviewer rejects this test case before execution. What is the most important thing missing?',
      code: {
        language: 'text',
        title: 'TC-COUPON-07',
        code: `ID:            TC-COUPON-07
Title:         Apply SAVE10 coupon at checkout
Requirement:   REQ-CPN-02
Preconditions: Logged-in user, cart total = Rs 1,200
Test data:     Coupon code SAVE10
Steps:         1. Open the cart
               2. Enter SAVE10 in the coupon field
               3. Click "Apply"
Expected:      Coupon should work properly
Priority:      High`,
      },
      options: [
        'A specific, observable expected result (for example "Discount Rs 120 shown; total Rs 1,080")',
        'The tester’s name and the execution date',
        'A screenshot of the checkout page',
        'A separate step for logging in',
      ],
      correct: [0],
      explanation:
        '"Should work properly" cannot be judged pass or fail, so two testers could reach different verdicts. A good expected result names the exact discount and total. Tester name and date belong to the execution record, not the case design; screenshots are evidence collected at run time; login is already covered by the precondition.',
      followUps: [
        { q: 'What else would you add to this test case?', a: 'Linked negative cases (expired coupon, cart below the minimum, coupon already used), and maybe the build or environment if the team records it per case. The core fix, though, is the expected result: exact discount, new total, and the message shown.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-02',
      difficulty: 'easy',
      question: 'The developer replies "Which build? I can’t reproduce" to this bug. Which addition would have prevented that reply?',
      code: {
        language: 'text',
        title: 'BUG-733',
        code: `Title:    Order history shows wrong delivery date
Steps:    1. Log in as a customer with past orders
          2. Open "My orders"
Expected: Delivery date matches the confirmation email
Actual:   Delivery date is one day earlier than the email
Severity: Major`,
      },
      options: [
        'Environment details: build number, environment, browser/device, and the test account and order ID used',
        'A higher severity so the developer takes it seriously',
        'A suggested code fix for the date calculation',
        'The name of the developer who wrote the feature',
      ],
      correct: [0],
      explanation:
        'Without the build, environment and specific data (account, order ID), the developer cannot reproduce the exact conditions, and date bugs often depend on data and time zone. Raising severity does not help reproduction; code fixes are the developer’s job; naming the author adds blame, not information.',
      followUps: [
        { q: 'What extra evidence would help for a date bug specifically?', a: 'The order ID and the stored timestamp, the user’s time zone, the time the order was placed, and a screenshot of both the email and the order history. Date bugs are often time-zone or midnight-boundary issues, so exact times matter.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-03',
      difficulty: 'easy',
      question: 'Using 2-value boundary value analysis, which set of order values tests this rule best?',
      code: {
        language: 'text',
        title: 'Requirement',
        code: `REQ-SHIP-04: Free shipping applies to orders from Rs 1,000
to Rs 5,000 inclusive. Outside that range, standard
shipping of Rs 49 is charged.`,
      },
      options: ['999, 1000, 5000, 5001', '1000, 3000, 5000', '500, 2500, 7500', '1000, 1001, 4999, 5000'],
      correct: [0],
      explanation:
        'Two-value BVA tests each boundary and its nearest neighbour outside the range: 999/1000 at the bottom and 5000/5001 at the top. 1000, 3000, 5000 misses the outside values that catch "<" vs "<=" mistakes; 500/2500/7500 are equivalence class values far from the edges; 1001 and 4999 are 3-value additions but without 999 and 5001 nothing tests the outside.',
      followUps: [
        { q: 'What would 3-value BVA add?', a: 'The values just inside each boundary: 1001 and 4999, giving 999, 1000, 1001, 4999, 5000, 5001. It is worth the extra cases when an off-by-one in either direction would be costly, such as money rules.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-04',
      difficulty: 'medium',
      question: 'Two days before release you look at this traceability extract. What does it tell you?',
      code: {
        language: 'text',
        title: 'RTM extract',
        code: `Req      Description                 Test cases      Status
REQ-21   Add item to wishlist        TC-101, TC-102  Pass, Pass
REQ-22   Share wishlist by link      TC-103          Fail (BUG-88)
REQ-23   Wishlist limit 50 items     -               -
REQ-24   Remove item from wishlist   TC-104          Not run`,
      },
      options: [
        'REQ-23 has no test coverage, REQ-22 is failing with an open bug, and REQ-24 is untested so far',
        'All requirements are covered because every row has a description',
        'Only REQ-22 is a concern; missing cases for REQ-23 are fine if the others pass',
        'The RTM is only useful at the end of testing, so it tells us nothing yet',
      ],
      correct: [0],
      explanation:
        'Forward traceability exposes REQ-23 with no test cases (a coverage gap, and a boundary rule that needs BVA), REQ-22 failing with BUG-88, and REQ-24 not yet executed. A description is not coverage, a missing requirement test is never automatically fine, and the RTM is most valuable during testing, not just at the end.',
      followUps: [
        { q: 'What would you do first with this information?', a: 'Write and run cases for REQ-23 (49, 50 and 51 items), execute TC-104, and check BUG-88’s status with the developer. Then report the coverage status to the PO so the release decision uses real data.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-05',
      difficulty: 'medium',
      question: 'A loan pre-check depends on age, income and past defaults. Before merging any rows, how many combinations must your table list?',
      code: {
        language: 'text',
        title: 'Loan pre-check',
        code: `Conditions (each Yes/No):
C1  Applicant is 21 or older
C2  Monthly income >= Rs 30,000
C3  Has an existing loan default
Action: Approve / Refer / Reject`,
      },
      options: ['8', '6', '3', '9'],
      correct: [0],
      explanation:
        'Three independent yes/no conditions give 2 × 2 × 2 = 8 combinations. Six would come from adding instead of multiplying (2 + 2 + 2), 3 is just the number of conditions, and 9 would be 3 × 3, as if each condition had three values.',
      followUps: [
        { q: 'How could the table be collapsed?', a: 'If "has an existing default" means Reject regardless of age and income, the four rows with C3 = Yes merge into one rule with the other conditions marked "don’t care", reducing 8 rules to 5 while keeping every outcome covered.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-06',
      difficulty: 'easy',
      question: 'A new build is deployed to QA at 9 a.m. Your first check finds that the login page returns a server error for every user. What is the right next step?',
      options: [
        'Stop, report that the smoke test failed, and send the build back; detailed testing waits for a working build',
        'Continue with the regression suite on the screens that do not need login',
        'Log one bug and keep testing other features around it for the rest of the day',
        'Wait until the afternoon in case the error clears by itself',
      ],
      correct: [0],
      explanation:
        'A failing smoke test means the build is not testable, so the entry criterion for execution is not met; the fast, correct move is to stop and report. Testing around a broken login wastes time on a build that will be replaced, and waiting silently delays the fix.',
      followUps: [
        { q: 'What goes in that report?', a: 'Build number, time, the failing step, the error (screenshot, network response and request ID), whether all users are affected, and a clear statement that QA has suspended testing until a new build passes smoke.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-07',
      difficulty: 'medium',
      question: 'The retest of a coupon-rounding bug passes. The developer mentions the fix also changed the shared price-formatting utility. What should you do next?',
      options: [
        'Run a focused regression on every screen that formats prices (cart, checkout, invoices, order history), then close the bug',
        'Close the bug: the retest passed, so the job is done',
        'Reopen the bug because the fix touched other code',
        'Ask the developer to revert the utility change before you test anything else',
      ],
      correct: [0],
      explanation:
        'The retest confirms the fix itself; the change to a shared utility creates side-effect risk, so impact-based regression of every price display is needed. Closing immediately ignores that risk, reopening is wrong because the fix works, and asking for a revert is not the tester’s call when nothing has failed.',
      followUps: [
        { q: 'How do you find every screen using that utility?', a: 'Ask the developer for the usages (a code search takes them seconds), check the RTM and past bugs for price-display areas, and include outputs outside the UI such as emails and PDF invoices, which often use the same formatter.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL that apply. In which situations should a tester move a bug to Reopened?',
      options: [
        'The fix is deployed, and the original steps still produce the bug',
        'The original steps now pass, but a different, unrelated bug appears on another screen',
        'The fix works for card payments but the same defect still occurs for UPI, which the bug report covered',
        'The developer marked it Fixed, but the fix is not yet in the build deployed to QA',
        'A bug closed last sprint reappears with exactly the same steps and the team’s workflow reopens closed bugs',
      ],
      correct: [0, 2, 4],
      explanation:
        'Reopen when the reported defect still occurs: original steps fail, part of the reported scope still fails, or (where the workflow allows) the same bug returns. An unrelated new bug gets its own ticket. If the fix is not in the deployed build, the retest has not really happened yet, so you wait for the right build instead of reopening.',
      followUps: [
        { q: 'What should the reopen comment say?', a: 'The build tested, the exact steps and data used, what still fails, and new evidence. For example: "Retested on build 7.4.2: card payment fixed; UPI still double-charges (video attached)". It avoids a back-and-forth and shows exactly what is left.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-09',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which are well-written exit criteria for system testing of a release?',
      options: [
        'At least 95% of planned test cases executed',
        'No open Critical or High severity defects',
        'The testers feel the product is stable',
        'All open Medium defects reviewed and deferred with product owner approval',
        'Testing has been going on for two weeks',
      ],
      correct: [0, 1, 3],
      explanation:
        'Good exit criteria are measurable and tied to quality: execution percentage, no open Critical/High defects, and an explicit decision on the remaining ones. "Feel stable" is subjective, and elapsed time says nothing about coverage or quality.',
      followUps: [
        { q: 'What happens if the release date arrives and one criterion is not met?', a: 'QA reports exactly which criterion is not met and the risk; the product owner decides whether to delay, reduce scope or accept the risk, and the decision is recorded. Exit criteria guide the decision; they do not make it automatically.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-10',
      difficulty: 'easy',
      question: 'Select ALL that apply. Which of these are non-functional checks?',
      options: [
        'The product search page shows results within 2 seconds on a 4G connection',
        'Applying coupon SAVE10 reduces a Rs 1,000 cart to Rs 900',
        'Every checkout control can be reached and used with the keyboard alone',
        'After logout, the browser Back button does not reveal the account page',
        'An order confirmation email is sent after payment',
      ],
      correct: [0, 2, 3],
      explanation:
        'Response time (performance), keyboard access (accessibility) and session protection (security) describe how well the system behaves, so they are non-functional. The coupon calculation and the confirmation email are about what the system does, so they are functional.',
      followUps: [
        { q: 'Which of these can a manual tester check without special tools?', a: 'All three non-functional ones at a basic level: time the search with the browser’s network throttling, tab through checkout without a mouse, and log out then press Back. Deeper load or security testing needs tools and specialists.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-11',
      difficulty: 'medium',
      question: 'An OTP lockout story says resending a code keeps the wrong-attempt count. Which single check is most likely to catch a broken implementation?',
      code: {
        language: 'text',
        title: 'Requirement',
        code: `REQ-OTP-03: After 3 consecutive wrong OTPs the account is
locked for 30 minutes. Requesting a new OTP does not reset
the wrong-attempt count.`,
      },
      options: [
        'Enter 2 wrong OTPs, request a new OTP, enter 1 more wrong OTP, and check the account is locked',
        'Enter the correct OTP on the first attempt and check login succeeds',
        'Enter 3 wrong OTPs and check the account is locked',
        'Request 5 new OTPs in a row and check each one arrives',
      ],
      correct: [0],
      explanation:
        'The risky part of the rule is that a resend must not reset the counter, and only a sequence mixing wrong attempts and a resend tests it. That is state transition thinking. The correct-OTP and three-wrong tests cover the obvious paths and would pass even if resend wrongly reset the counter; checking that OTPs arrive does not test the lock.',
      followUps: [
        { q: 'Which technique is this, and what else would you test?', a: 'State transition testing. I would also test the correct OTP entered while locked (must be rejected), the lock expiring at 29:59 versus 30:00, and whether an old OTP still works after a resend.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-12',
      difficulty: 'easy',
      question: 'Your 200-case regression pack has passed cleanly for five releases in a row, yet three bugs reached production in that area. Which principle best explains this?',
      options: [
        'Pesticide paradox: repeating the same tests stops finding new defects',
        'Defect clustering: most defects are in a few modules',
        'Exhaustive testing is impossible',
        'Early testing saves time and money',
      ],
      correct: [0],
      explanation:
        'A pack that keeps passing while bugs escape is the classic pesticide paradox: the tests and data no longer exercise where new bugs are. Defect clustering explains where bugs concentrate, not why the pack misses them; the other two are true but do not explain this pattern.',
      followUps: [
        { q: 'What would you change in the pack?', a: 'Map the three escaped bugs to missing scenarios, add those cases, vary the test data, retire duplicates, and schedule exploratory sessions on the area. Then review the pack every release instead of only adding to it.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-13',
      difficulty: 'medium',
      question: 'Which activity is verification rather than validation?',
      options: [
        'Reviewing the refund story and spotting that the acceptance criteria contradict the design mockup',
        'Shop staff trying the new refund screen during UAT to see if it fits their process',
        'A beta user reporting that the refund flow is confusing',
        'Watching real customers complete a refund in a usability session',
      ],
      correct: [0],
      explanation:
        'Verification checks that work products are consistent and correct ("are we building it right?"), often by review without running code, so the story review is verification. The other three put the product in front of real users to see if it meets their needs, which is validation.',
      followUps: [
        { q: 'Which one finds problems more cheaply?', a: 'Usually the review, because nothing has been built yet; fixing a contradiction in a story costs a conversation. Validation finds problems that no document review can, such as a confusing flow, so both are needed.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-14',
      difficulty: 'easy',
      question: 'Who normally performs and signs off user acceptance testing for a new payroll module?',
      options: [
        'The HR and payroll business users, with the business owner signing off',
        'The QA team, because they wrote the system test cases',
        'The developers who built the module',
        'The release manager alone',
      ],
      correct: [0],
      explanation:
        'UAT confirms the system supports the real business process, so the people who run payroll test it and the business owner accepts it. QA usually supports UAT but does not sign it off; developers and the release manager do not represent the users’ needs.',
      followUps: [
        { q: 'What does QA do during UAT then?', a: 'Prepare the environment and realistic data, help users turn their processes into scenarios, reproduce and log the issues they find, triage with the team, and retest fixes. QA is the support crew, not the judge.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-15',
      difficulty: 'medium',
      question: 'For release 3.2, QA found 180 defects and customers reported 20 more in the first month. What is the defect leakage?',
      options: ['10%', '11%', '20%', '90%'],
      correct: [0],
      explanation:
        'Leakage = escaped defects ÷ total defects = 20 ÷ (180 + 20) = 10%. 11% comes from dividing by 180 only, 20% treats the raw count as a percentage, and 90% is the defect removal efficiency (the share caught before release), not the leakage.',
      followUps: [
        { q: 'Is 10% good or bad?', a: 'It depends on severity and context. Ten percent of trivial cosmetic issues is very different from two escaped payment bugs among them. I would break the 20 down by severity and root cause before judging, and compare with previous releases.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-16',
      difficulty: 'medium',
      question: 'Which is the strongest exploratory testing charter?',
      options: [
        'Explore the gift-card checkout with partial balances, expired cards and currency changes to discover wrong totals and misleading messages (60 min)',
        'Test gift cards',
        'Click around the checkout and see if anything breaks',
        'Execute TC-201 to TC-230 for gift cards',
      ],
      correct: [0],
      explanation:
        'A good charter names the target, the resources or variations to use, the information sought, and a time box. "Test gift cards" and "click around" give no direction, and running scripted cases is not exploratory testing at all.',
      followUps: [
        { q: 'What do you produce at the end of the session?', a: 'Session notes: what was covered, test ideas tried, bugs and questions found, and what still needs exploring, plus a short debrief with the lead so the next charter can target the gaps.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-17',
      difficulty: 'medium',
      question: 'Using likelihood × impact (each 1–3), which area should be tested first?',
      code: {
        language: 'text',
        title: 'Risk register',
        code: `Area                      Likelihood  Impact
A  New EMI payment option      3          3
B  Profile photo upload        2          1
C  Unchanged order history     1          2
D  Updated tax on invoices     2          3`,
      },
      options: ['A (score 9)', 'D (score 6)', 'C (score 2)', 'B (score 2)'],
      correct: [0],
      explanation:
        'A scores 3 × 3 = 9, the highest: new code and money involved. D (6) comes next and deserves strong coverage too. B and C score 2 each and can get lighter checks or regression only.',
      followUps: [
        { q: 'D has the same impact as A. Why is it second?', a: 'Its likelihood is lower: tax logic was updated, not built from scratch, so fewer things are new. If the developer said the tax change was large or rushed, I would raise its likelihood and re-rank.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-18',
      difficulty: 'medium',
      question: 'Which item is part of the Definition of Done rather than a story’s acceptance criteria?',
      options: [
        'Code reviewed, tested, and no open High defects, for every story the team delivers',
        'The user can filter orders by the last 30 days',
        'An error message appears if the date range is longer than one year',
        'Exported CSV includes order ID, date and total columns',
      ],
      correct: [0],
      explanation:
        'The Definition of Done is the team-wide quality checklist that applies to every story. The other three describe the behaviour of one specific story, so they are acceptance criteria.',
      followUps: [
        { q: 'What is the Definition of Ready, then?', a: 'The checklist a story must meet before the team commits to it in a sprint: clear acceptance criteria, testable, estimated, dependencies known, designs available. It stops half-defined stories entering the sprint.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-19',
      difficulty: 'medium',
      question: 'On release day, one Critical bug is open in the new "pay later" feature. The rest of the release is green. Which response from QA is most professional?',
      options: [
        'Report the bug, its impact and options (delay, release with pay later switched off, fix and focused retest), recommend not shipping pay later as is, and let the product owner decide',
        'Approve the release because everything else passed',
        'Block the release on your own authority without discussing it',
        'Keep quiet and add the bug to the known-issues list after release',
      ],
      correct: [0],
      explanation:
        'QA’s role is to make the risk visible with a clear recommendation and options; the business owner decides. Approving ignores a critical risk, blocking alone overreaches QA’s authority, and hiding it is the worst outcome for users and trust.',
      followUps: [
        { q: 'Why mention a feature flag as an option?', a: 'It lets the team ship the rest of the release safely while the risky feature stays off, then turn it on once fixed and retested. It turns a yes/no decision into a choice with less risk.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-20',
      difficulty: 'easy',
      question: 'After creating an account in the UI, you query the database to confirm the password is stored as a hash. What kind of testing is this?',
      options: ['Grey-box testing', 'White-box testing', 'Black-box testing', 'Monkey testing'],
      correct: [0],
      explanation:
        'You test through the UI but use partial knowledge of the internals (the users table) to check the outcome, which is grey-box. White-box would mean testing the code’s structure, black-box would use only the UI and requirements, and monkey testing is random input.',
      followUps: [
        { q: 'What bug could this catch that a pure UI test could not?', a: 'Passwords stored in plain text, emails saved with different capitalisation, duplicate rows from a double click, or the wrong account status. All of these look fine on screen but cause security or data problems later.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-21',
      difficulty: 'easy',
      question: 'An interviewer asks "What is regression testing?" Which answer will make the best impression?',
      options: [
        '"Re-running tests on areas that were working to catch side effects of a change. When we changed GST rounding, I re-ran cart, invoice and refund cases and found a wrong refund total."',
        '"Regression testing is a type of software testing that ensures that previously developed and tested software still performs after a change."',
        '"It is when we test everything again after every change."',
        '"It is the same as retesting, basically checking bugs again."',
      ],
      correct: [0],
      explanation:
        'The best answer gives a crisp definition, a concrete example from real work and a result. The textbook sentence is correct but sounds memorised, "test everything" shows no risk judgement, and confusing it with retesting is a factual error.',
      followUps: [
        { q: 'What would you say if you had no real project example?', a: 'Use a practice project honestly: "On my practice project with SauceDemo, after changing the sort feature I re-ran the cart and checkout cases." Never invent workplace experience; a clear practice example is still concrete.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-22',
      difficulty: 'medium',
      question: 'You are about to log a bug and find an open ticket describing the same issue with fewer details. What should you do?',
      options: [
        'Add your extra details and evidence to the existing ticket as a comment instead of creating a new one',
        'Log a new, better ticket and ignore the old one',
        'Do nothing, because it is already reported',
        'Close the old ticket and create yours',
      ],
      correct: [0],
      explanation:
        'Enriching the existing ticket keeps one source of truth and helps the developer reproduce it. A second ticket would be marked Duplicate and splits the information; doing nothing wastes your evidence; closing someone else’s ticket loses its history.',
      followUps: [
        { q: 'What if your issue looks similar but has a different trigger?', a: 'Then it may be a separate defect. Log it separately and link it to the existing one ("related to BUG-412") so triage can decide whether they share a root cause.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-23',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which bugs are typically high severity but low priority?',
      options: [
        'The app crashes when an admin exports a yearly audit report that is used once a year, with a manual workaround, in March',
        'The company name is misspelt on the login page on launch day',
        'Data loss when a user attaches more than 500 files to one support ticket, which no user has ever done',
        'Checkout fails for all card payments',
      ],
      correct: [0, 2],
      explanation:
        'The audit export and the 500-attachment crash have severe impact when they occur, but they are rare, have workarounds or affect almost nobody right now, so they can wait. The misspelt name is low severity, high priority, and failing card payments is high severity and high priority.',
      followUps: [
        { q: 'When would the audit export bug become high priority?', a: 'As the yearly audit date approaches, when the admin actually needs it. Priority follows the business calendar, so the same bug can move from P4 to P1 without its severity changing.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-24',
      difficulty: 'easy',
      question: 'Your lead asks for one executable wallet-payment check she can hand to a new joiner tomorrow. Which item qualifies?',
      options: [
        'Precondition: user with Rs 0 wallet balance. Steps: choose "Pay with wallet" on a Rs 250 order. Expected: "Insufficient balance" message and the card option stays available.',
        'Verify wallet payment',
        'Check payment options at checkout',
        'Test refunds to wallet',
      ],
      correct: [0],
      explanation:
        'A test case has preconditions, data, steps and a specific expected result. The other three are one-line scenarios: they say what to test, but not how or what result counts as a pass.',
      followUps: [
        { q: 'How many test cases might come from "Verify wallet payment"?', a: 'Several: sufficient balance, exactly enough, insufficient, zero balance, wallet plus card split, wallet disabled, refund to wallet. One scenario usually expands into 5–15 cases depending on the rules.' },
      ],
    },
    {
      id: 'qa-manual-bank-mcq-25',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which INVALID equivalence partitions need a representative test for this quantity field?',
      code: {
        language: 'text',
        title: 'Requirement',
        code: `Quantity field on the product page:
- Whole numbers from 1 to 10 are accepted
- Field is mandatory`,
      },
      options: [
        'A valid whole number between 1 and 10 (e.g. 5)',
        'A whole number below 1 (e.g. 0 or -2)',
        'A whole number above 10 (e.g. 11 or 50)',
        'Non-numeric or decimal input (e.g. "abc" or 2.5) and an empty field',
        'Every value from 1 to 10, one test each',
      ],
      correct: [1, 2, 3],
      explanation:
        'The invalid classes are below range, above range, and wrong type or empty (text, decimals, nothing in a mandatory field); each needs one representative. A value from 1 to 10 is the valid partition, not an invalid one. Testing every value from 1 to 10 adds nothing, because the system treats them all the same; that is exactly what EP avoids.',
      followUps: [
        { q: 'Which boundary values would you add?', a: '0, 1, 10 and 11 for 2-value BVA (adding 2 and 9 for 3-value). Together with one value per partition and the empty field, that is a small, strong set.' },
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'qa-manual-bank-drill-1',
      question:
        'Rapid triage, 90 seconds: a grocery-delivery app goes live on Saturday for a festival sale. Give each of these six bugs a severity (Critical/Major/Minor/Trivial) and a priority (P1–P4): (a) the sale banner says 50% off but items show 40% off; (b) the app crashes when a user uploads a profile photo larger than 20 MB; (c) Place Order charges UPI payments twice; (d) the Help page has a misaligned icon; (e) the delivery slot picker shows Sunday slots as unavailable even though they are open; (f) the yearly GST summary export for admins fails, and the finance team can generate it manually.',
      assumptions: [
        'Launch is Saturday; most traffic is mobile shoppers during the sale',
        'Severity = impact on the user or system; priority = how urgently the business needs the fix',
        'The GST summary is next needed at the financial year end, months away',
        'Large profile photos are rare; most users never upload one',
      ],
      steps: [
        { label: '(c) Double UPI charge', calc: 'Money taken twice from real customers: Critical severity. Affects the core flow on sale day: P1. Release blocker.' },
        { label: '(a) Banner 50% vs actual 40%', calc: 'Functionally a display/pricing mismatch: Major (misleading price claim, possible legal/consumer issue). Visible to everyone on launch day: P1.' },
        { label: '(e) Sunday slots wrongly unavailable', calc: 'Users cannot book a valid slot, which loses orders: Major. Sale weekend includes Sunday: P1 or P2 (P1 if Sunday is a big sale day).' },
        { label: '(b) Crash on >20 MB photo', calc: 'A crash is severe: Major (or Critical if data is lost). Rare action, unrelated to the sale: P3.' },
        { label: '(f) GST export fails', calc: 'Feature fails completely: Major. Workaround exists and it is not needed for months: P4 (or P3).' },
        { label: '(d) Misaligned Help icon', calc: 'Cosmetic: Trivial. Low visibility: P4.' },
      ],
      answer: `| Bug | Severity | Priority |
|---|---|---|
| (c) Double UPI charge | Critical | P1 |
| (a) Banner 50% vs 40% | Major | P1 |
| (e) Sunday slots unavailable | Major | P1–P2 |
| (b) Crash on large photo | Major | P3 |
| (f) GST export fails | Major | P4 |
| (d) Misaligned icon | Trivial | P4 |

Reasonable teams may differ by one level; what matters is the **reason** you give for each.

📚 Full lesson: [Severity vs priority](#/topic/mt-defects?tab=learn&s=4)`,
      insight:
        'Severity comes from the bug; priority comes from the calendar and the business. (b) and (f) are as severe as (e) but far less urgent, and (a) is not a crash at all yet still needs fixing before launch.',
      followUps: [
        { q: 'The PO says the banner bug (a) is fine because users pay less than they would at 50%. How do you respond?', a: 'Users actually pay more than the banner promised (40% off instead of 50%), which is misleading advertising and will cause complaints, refunds and possibly consumer-law trouble. Point that out with screenshots. If the PO still disagrees, the decision is theirs, recorded in the ticket.' },
      ],
    },
    {
      id: 'qa-manual-bank-drill-2',
      question:
        'Sixty-second test design: a movie-ticket app lets a user book 1 to 8 seats per booking, and the seat count is a whole number chosen in a text box. List the equivalence partitions, the 2-value BVA values, and the 3-value BVA values, then give the smallest set of tests that covers all of them.',
      assumptions: [
        'Valid range is 1–8 inclusive',
        'The field is mandatory and accepts typed input',
        'Decimals and text are invalid',
      ],
      steps: [
        { label: 'Partitions', calc: 'Invalid below (≤ 0), valid 1–8, invalid above (≥ 9), invalid type (text, decimal), empty.' },
        { label: '2-value BVA', calc: 'Lower edge: 0 and 1. Upper edge: 8 and 9. → 0, 1, 8, 9.' },
        { label: '3-value BVA', calc: 'Add the neighbours inside: 2 and 7. → 0, 1, 2, 7, 8, 9.' },
        { label: 'Merge', calc: 'Boundary values already represent the below, valid and above partitions; add one valid middle value (4), one invalid type (2.5 or "two"), and empty.' },
      ],
      answer: `**Minimal 2-value set (7 tests):** 0, 1, 4, 8, 9, "2.5", empty.
**3-value set (9 tests):** 0, 1, 2, 4, 7, 8, 9, "2.5", empty.

Expected: 1–8 accepted and the price updates; 0, 9, decimals and text rejected with a clear message; empty shows a "required" message.

📚 Full lesson: [Boundary Value Analysis](#/topic/mt-test-design?tab=learn&s=2)`,
      insight:
        'Say the technique names and the values together. Boundary values double as partition representatives, so the full set stays small.',
      followUps: [
        { q: 'The app sells 8 seats but only 5 are left in the row. What new boundary appears?', a: 'Availability becomes a second limit: the effective maximum is the smaller of 8 and the seats left. Test 5 (accepted) and 6 (rejected with a "only 5 seats left" message), and what happens if another user takes a seat while you are choosing.' },
      ],
    },
    {
      id: 'qa-manual-bank-drill-3',
      question:
        'Whiteboard check: name everything missing or wrong in this test case for a bank\'s change-mobile-number feature, then rewrite it. "TC-55 | Change number | Steps: go to profile, change number, save | Expected: works | Status: Pass".',
      assumptions: [
        'Changing the mobile number requires an OTP sent to the OLD number',
        'The new number must be a valid 10-digit Indian mobile number not used by another account',
        'The team uses Jira with Xray for test cases',
      ],
      steps: [
        { label: 'Traceability', calc: 'No requirement link and no priority, so coverage and risk are invisible.' },
        { label: 'Preconditions and data', calc: 'Which user? Which old and new numbers? Is the user logged in? Missing.' },
        { label: 'Steps', calc: 'Vague and skip the OTP step, which is the security-critical part.' },
        { label: 'Expected result', calc: '"Works" is not observable; no message, no data check, no OTP behaviour.' },
        { label: 'Status in the design', calc: 'Execution status belongs to a test run, not the case definition; "Pass" with no build or date proves nothing.' },
      ],
      answer: `**Rewritten:**
- **TC-PROFILE-055:** Registered user changes mobile number with a valid OTP sent to the old number
- **Requirement:** REQ-PRF-09 · **Priority:** High (security)
- **Preconditions:** user ravi.qa logged in; current number 9876543210; new number 9123456780 not used by any account
- **Steps:** 1. Profile → Mobile number → Edit. 2. Enter 9123456780. 3. Tap "Send OTP". 4. Enter the OTP received on 9876543210. 5. Tap "Save".
- **Expected:** "Mobile number updated" message; profile shows 9123456780; next login OTP goes to the new number; a security alert SMS/email goes to the old number.

**Split out:** wrong OTP, OTP sent to the new number instead of the old (security bug), number already in use, 9/11 digits.

📚 Full lesson: [Anatomy of a great test case](#/topic/mt-test-artifacts?tab=learn&s=1)`,
      insight:
        'Most weak test cases fail on the same three things: no data, vague steps that skip the risky step, and an expected result nobody can verify.',
      followUps: [
        { q: 'Why does it matter that the OTP goes to the OLD number?', a: 'It proves the person changing the number owns the account. If the OTP went to the new number, an attacker with a stolen session could move the account to their own phone and take over all future OTPs. It is the security heart of the feature, so it deserves its own negative test.' },
      ],
    },
  ],
  codeChallenges: [
    {
      id: 'qa-manual-bank-cc-1',
      title: 'Turn a rambling "explain the defect life cycle" answer into a crisp one',
      context:
        'A candidate was asked "Explain the defect life cycle" in a first technical round. This is a transcript of the answer. The interviewer moved on quickly and the feedback said "not structured".',
      task:
        'Rewrite the answer so it can be spoken in about 60 seconds: a clear main path, the side exits, who moves the bug, and one real example. Keep it honest and specific.',
      starter: {
        language: 'text',
        title: 'Weak answer (transcript)',
        code: `So basically the defect life cycle is, like, the life of the defect.
When we find a bug we raise it in Jira, then it goes to the developer
and he fixes it, and then it comes back to us, and we test it, and
if it is working we close it, otherwise we reopen it. There are also
some other statuses like deferred, duplicate, rejected, etc. Every
company has different statuses actually. In my project also we used
Jira and we had many statuses. Developer sometimes rejects the bug
also, then we have to discuss. Basically it depends on the project.
Severity and priority are also there, which we set while raising.
So that is the defect life cycle.`,
      },
      hints: [
        'Open with a one-line definition, then give the main path in order, naming who moves each state.',
        'Group the side exits (duplicate, rejected, deferred, cannot reproduce) and say when each happens.',
        'Close with a short real example and stop; leave severity/priority for a follow-up.',
      ],
      solution: {
        language: 'text',
        title: 'Strong answer (about 60 seconds)',
        code: `Definition (1 line):
"It's the set of states a bug goes through from being reported
to being closed, so everyone knows who owns it next."

Main path (who moves it):
New (I log it) -> Assigned (lead/triage) -> Open / In progress (dev)
-> Fixed (dev) -> Ready for retest (fix deployed to QA)
-> Verified / Closed (I retest and close).
If my retest fails -> Reopened -> back to the developer.

Side exits, usually decided in triage:
- Duplicate: already reported; linked to the original.
- Rejected / Not a bug: works as designed (PO confirms).
- Deferred: valid but fixed in a later release (PO decides).
- Cannot reproduce / Need info: back to me for more detail.

Example:
"On our checkout project, BUG-341 (double UPI charge) was reopened
once: the fix worked for cards but not UPI. I added UPI steps and a
video, it was fixed next build, and I added the case to regression."

Close:
"Status names differ by Jira workflow, but the flow is the same."`,
      },
      explanation: `**What changed and why it works:**
- **One-line definition first** instead of "basically the life of the defect" (circular).
- **Ordered main path with owners:** shows you understand responsibility, not just status names.
- **Side exits grouped with their trigger and decision-maker**, instead of "deferred, duplicate, rejected, etc."
- **A specific example** (bug ID, what failed, what you did) proves real experience.
- **"Depends on the project" moved to the end** as a closing caveat, not used as the answer.
- **Severity/priority removed:** unrelated to the question; wait for the follow-up.

📚 Full lesson: [Defect life cycle](#/topic/mt-defects?tab=learn&s=1)`,
      followUps: [
        { q: 'The interviewer interrupts: "Who can move a bug to Deferred?" What do you say?', a: 'The product owner, usually in triage with the dev lead, because deferring is a business decision to accept the bug for now. QA can propose it with the impact, but should not defer bugs on its own. Deferred bugs should appear in the release notes or known-issues list.' },
        { q: 'Why does the ordered structure matter so much in a short answer?', a: 'Interviewers score clarity as much as knowledge. A sequence with owners is easy to follow and shows you have worked inside the process. A list of status names with "etc." sounds memorised, and the interviewer cannot tell whether you understand the flow.' },
      ],
    },
    {
      id: 'qa-manual-bank-cc-2',
      title: 'Rewrite a whiteboard bug report into one a developer can act on',
      context:
        'In an interview exercise, the candidate was shown a food-delivery app where applying the coupon FEAST20 and then removing an item left the 20% discount calculated on the old cart total. They wrote this report on the whiteboard in two minutes.',
      task:
        'Rewrite the report so a developer could reproduce it without asking a single question, and give a justified severity and priority. Keep it short enough for a whiteboard.',
      starter: {
        language: 'text',
        title: 'Weak bug report',
        code: `Title: Coupon not working

Description: Coupon is giving wrong discount sometimes. Please
check and fix ASAP. It is very urgent.

Severity: Critical
Priority: High`,
      },
      hints: [
        'A strong title says what is wrong, where, and under which condition.',
        'Write numbered steps with exact data (cart items, prices, coupon) and separate expected from actual with numbers.',
        'Justify severity by impact; "urgent" is a priority argument, not a description.',
      ],
      solution: {
        language: 'text',
        title: 'Strong bug report',
        code: `Title: Checkout: FEAST20 discount not recalculated after an
       item is removed from the cart

Environment: QA, build 6.8.1, Android 14 app (Pixel 7); also
             seen on Chrome 128 web
Preconditions: Logged-in user; FEAST20 = 20% off, min cart Rs 300
Steps:
 1. Add Paneer Tikka (Rs 300) and Biryani (Rs 250) -> cart Rs 550
 2. Apply coupon FEAST20 -> discount shows Rs 110
 3. Remove Biryani from the cart
 4. View the bill summary
Expected: Discount recalculates to Rs 60 (20% of Rs 300);
          total payable Rs 240 (+ taxes as usual)
Actual:   Discount stays Rs 110; total payable Rs 190
Frequency: 5/5 attempts
Evidence: screen recording, bill summary screenshots
Severity: Major - wrong amount charged; the business loses
          money on every such order (no crash, no data loss)
Priority (suggested): P1 - coupon campaign starts Friday
Related: REQ-CPN-11 (discount recalculates on cart change)`,
      },
      explanation: `**Fixes:**
- **Title:** "Coupon not working" → what, where and the trigger condition, so triage can understand it from the list view.
- **Environment and build** added: the most common reason a report bounces.
- **Exact data and numbered steps:** item names, prices, coupon rules.
- **Expected vs actual with numbers**, tied to a requirement instead of "wrong discount".
- **"Sometimes" replaced with a frequency** (5/5), which proves it is reproducible.
- **Severity justified by impact** (wrong charge, revenue loss) instead of an emotional "Critical/ASAP"; priority suggested with a business reason, leaving the final call to the PO.

📚 Full lesson: [Anatomy of a great bug report](#/topic/mt-defects?tab=learn&s=3)`,
      followUps: [
        { q: 'Why Major and not Critical?', a: 'Nothing crashes, no data is lost and checkout still completes; the impact is a wrong amount on a specific path. Some teams would call any money error Critical, which is a defensible choice if you explain it. What matters is that severity is argued from impact, not from how urgent the tester feels.' },
        { q: 'What related tests would you run after the fix?', a: 'Remove an item so the cart drops below the Rs 300 minimum (the coupon should be removed with a message), increase quantity after applying, remove the last item, apply then re-add, and check the final invoice and refund amounts use the recalculated discount.' },
      ],
    },
  ],
};

export default topic;
