import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-defects',
  phase: 'manual-advanced',
  order: 2,
  title: 'Defect Management & Bug Reporting',
  subtitle:
    'The bug life cycle, clear bug reports, severity vs priority, can\'t-reproduce bugs, triage, root cause analysis, defect metrics (DRE, leakage, density) and Jira.',
  estimatedMinutes: 95,
  sources: [
    'ISTQB CTFL v4.0 syllabus — 5.5 Defect Management',
    'ISTQB Glossary — defect, failure, severity, priority, root cause',
    'Guru99 — Defect Life Cycle; Bug Report template',
    'Software Testing Help — How to write a good bug report; Severity vs Priority',
    'GeeksforGeeks — Defect management process; Defect metrics',
    'Atlassian docs — Jira workflows, resolutions and JQL',
    'Testsigma blog — Defect Removal Efficiency',
    'vskills — Software testing metrics (defect leakage, review efficiency)',
    'softwaretestpilot.com — Severity vs Priority matrix and examples',
    'Cem Kaner, James Bach & Bret Pettichord — Lessons Learned in Software Testing (Ch 4 Bug Advocacy)',
    'Playwright docs — Trace viewer (attaching evidence to bug reports)',
  ],
  tags: ['defect-life-cycle', 'bug-report', 'severity', 'priority', 'triage', 'root-cause-analysis', 'dre', 'defect-leakage', 'jira', 'metrics'],
  cheatSheet: [
    'Life cycle: New → Assigned → Open → Fixed → Ready for retest → Retest → Verified → Closed; side exits: Rejected, Duplicate, Deferred, Not a bug; failed retest → Reopened.',
    'Good bug report: one bug, a specific title (what + where + when), env/build, preconditions, numbered steps, expected vs actual, evidence, severity, priority.',
    'Title formula: "[Area] What fails when doing what": "Checkout: Finish button does nothing for problem_user after entering postal code".',
    'Severity = how badly it hurts (set by QA). Priority = how soon to fix (set by PO/lead). They are independent.',
    'High sev/low pri: crash in a rarely used legacy export with a workaround. Low sev/high pri: brand name misspelled on the home page before launch.',
    'Can\'t reproduce? Compare env, build, data, user role, browser, timing. Attach video/HAR/console/trace. Pair with the developer. Never just close it.',
    'Triage decides: valid? duplicate? severity, priority, owner, target release. Based on: business impact, users hit, workaround, fix risk, report quality.',
    'RCA (5 whys): ask "why?" until you reach a process or design cause, never a person. Types: requirement, design, code, data, environment, test gap.',
    'DRE = pre-release defects ÷ (pre-release + post-release) × 100. 180 in QA + 20 in prod → 90%.',
    'Leakage = defects escaping a phase ÷ defects caught in that phase × 100 (state your formula). Density = defects ÷ size (per KLOC/module).',
    'Reopen rate = reopened ÷ fixed × 100. A high rate means weak fixes or weak bug reports, not "lazy developers".',
    'Jira: severity is usually a custom field; Priority (Highest…Lowest) and Resolution (Done, Won\'t Do, Duplicate, Cannot Reproduce) are built in.',
  ],
  sections: [
    {
      heading: 'Why defect management matters',
      body: `**Defect management** means recording each bug, tracking it, and following it until it is closed.

Why it matters: finding a bug is only half the job. If nobody understands, owns or can repeat the bug, it never gets fixed.

ISTQB v4.0 gives defect management three goals:
- Give developers enough detail to **reproduce and fix** the bug.
- Give managers data to **judge quality and risk**.
- Give the team ideas to **improve the process** (why do these bugs keep coming?).

Not every reported problem is a real bug. It can be a **false positive** (a test or environment problem), a change request, or correct but surprising behaviour. That is why the life cycle has states like *Rejected* and *Not a bug*.

**Four words interviewers mix up:**

| Term | Plain meaning | Example (free shipping from ₹2,000) |
|---|---|---|
| **Error (mistake)** | A person does something wrong | Developer types \`>\` instead of \`>=\` |
| **Defect (bug, fault)** | The wrong thing left in the code or document | The line \`total > 2000\` in the shipping code |
| **Failure** | What the user sees when the defect runs | A ₹2,000 order is charged shipping |
| **Incident / anomaly** | Any odd result, before anyone checks it | Ticket: "Shipping charged on a ₹2,000 order" |

**Example:** you place a ₹2,000 order and see a ₹40 shipping fee. That is the **failure**. You report it. The developer finds the **defect** (\`>\` instead of \`>=\`). Root cause analysis asks why the **error** happened.

**In an interview, say:** "A bug report is a product of my testing, like a test case. A developer should reproduce it in five minutes without asking me anything."`,
      keyPoints: [
        'Defect management = record, classify, track, resolve, learn.',
        'Not every reported anomaly is a defect: false positives and change requests exist.',
        'Testers observe failures; developers fix defects; RCA explains the errors.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 5.5 Defect Management',
    },
    {
      heading: 'Defect life cycle',
      body: `**Intuition:** a bug is like a parcel with a courier. Each scan (status) shows where it is and who holds it.

The **defect life cycle** (bug life cycle) is the list of statuses a bug moves through, from "found" to "closed". Names change by tool and team. The standard flow is:

| Status | Who moves it there | Meaning |
|---|---|---|
| **New** | Tester | Logged, not yet reviewed |
| **Assigned** | Lead / triage | Accepted as valid and given to a developer |
| **Open / In progress** | Developer | Being analysed and fixed |
| **Fixed** | Developer | Code change made, unit-tested, merged |
| **Ready for retest (Pending retest)** | Developer / build | Fix deployed to the test environment |
| **Retest** | Tester | Tester is re-running the failing steps |
| **Verified** | Tester | The fix works in the stated build |
| **Closed** | Tester / lead | Done, including a regression check around the fix |
| **Reopened** | Tester | Retest failed, or the bug came back later |

**Side exits from New/Assigned:** Rejected, Duplicate, Deferred, Not a bug (next section).

**Example:** on SauceDemo, the cart badge still shows "1" after you remove the last item.
1. You log BUG-210 → **New**.
2. Triage accepts it and gives it to Sana → **Assigned**.
3. Sana fixes it in build 3.4.2 → **Fixed** → **Ready for retest**.
4. You remove the last item on build 3.4.2. The badge disappears → **Verified**.
5. You also check add/remove for 3 items (regression) → **Closed**.
6. If the badge still showed "1" in step 4 → **Reopened**.

**Two rules interviewers check:**
1. **Only the tester (or reporter) verifies and closes.** If developers close their own fixes, nobody checks them.
2. **Retesting is not regression testing.** **Retesting** means re-running the exact failing steps on the fixed build. **Regression testing** means checking that the fix did not break anything nearby. Do both before closing.

**Reopen or new bug?** Reopen when the *same* steps still fail. If those steps pass but you see a *different* failure, log a **new** bug and link it.

**Common mistake:** reopening one ticket for every new problem in the area. Soon one ticket tracks three bugs.`,
      diagram: `                 +-----------+-- Rejected / Not a bug
                 |           +-- Duplicate (link to original)
                 |           +-- Deferred (next release)
  [New] --triage-+
                 v
            [Assigned] --> [Open] --> [Fixed] --> [Ready for retest]
                              ^                          |
                              |                       [Retest]
                              |                     pass /  \\ fail
                          [Reopened] <-----------------+   [Verified]
                              ^                                  |
                              +------ bug returns later ----- [Closed]`,
      keyPoints: [
        'Core path: New → Assigned → Open → Fixed → Retest → Verified → Closed.',
        'The reporter verifies and closes; developers do not close their own fixes.',
        'Same failure → Reopen; different failure → new linked bug.',
      ],
      source: 'Guru99 — Defect/Bug Life Cycle; ISTQB CTFL v4.0 — 5.5',
    },
    {
      heading: 'Rejected, duplicate, deferred and reopened: the side exits',
      body: `**Side exits** are statuses that take a bug off the normal path to "Fixed". Each one needs a clear reason written in the ticket.

| Status | When it is used | What a good QA does |
|---|---|---|
| **Rejected / Not a bug** | Works as designed, user error, environment fault, or misread requirement | Re-read the requirement. Still disagree? Quote the acceptance criterion and ask the PO to decide |
| **Duplicate** | The same problem is already logged | Search before logging. If your evidence is better, add it to the original and link |
| **Deferred / Postponed** | Valid, but the fix moves to a later release (low priority, risky fix, code freeze) | Check it has a target release and is listed in known issues |
| **Cannot reproduce** | The developer cannot see the failure | Add more evidence (see "Bugs the developer cannot reproduce"). Never let it close silently |
| **Reopened** | The fix failed retest, or the bug came back later | Add the build number, new evidence and *what is still wrong* |
| **Won't fix** | The business accepts the behaviour for good | Record the decision and who made it |

**Example:** you log "Login page logo is blurry on Safari". The search shows BUG-88 "Logo blurry on Mac Safari" from last week. Your ticket becomes a **Duplicate**. You add your screenshot to BUG-88 and link the two.

**Rejected or Deferred?** Rejected = "not a bug". Deferred = "a real bug, fixed later".

**Watch your rejected-bug rate.** Many rejections point to unclear reports, an unstable test environment, or vague requirements.

**Common mistake:** arguing in comments for days. Escalate once, with evidence and the requirement. Then let triage decide. Your job is to make the risk visible, not to win.`,
      code: [
        {
          language: 'text',
          title: 'A professional response to a rejected bug',
          code: `BUG-1432  [Checkout] Order total ignores the member discount
Status: Rejected by dev ("works as designed")

QA comment:
Thanks for checking. I re-read the story before replying.
- Story SHOP-210, acceptance criterion 3:
  "Members get 10% off the item subtotal at checkout."
- Build 2.14.0 on QA env, user member01@test.in (Gold member)
- Subtotal 1,000.00 -> expected discount 100.00, actual 0.00
  (screenshot + HAR attached; the /api/cart response has
  "memberDiscount": 0)

If the rule changed after the story was written, could the PO
(@Meera) confirm, and we will update AC-3 and the test case?
Moving this to the triage agenda for Thursday so it gets a
decision either way.`,
        },
      ],
      keyPoints: [
        'Every side exit needs a reason recorded in the ticket.',
        'Search for duplicates before logging; add better evidence to the original.',
        'Disagreements go to the PO or triage with the requirement quoted, not to a comment war.',
      ],
      source: 'Guru99 — Defect Life Cycle; Kaner, Bach & Pettichord — Lessons Learned in Software Testing, Bug Advocacy',
    },
    {
      heading: 'Anatomy of a great bug report',
      body: `**A good bug report** lets a developer who has never seen the screen repeat the bug in five minutes, without messaging you.

**Fields to fill:**

| Field | Good example | Why it matters |
|---|---|---|
| **ID / Title** | "Inventory: all product images show the same dog photo for problem_user" | Easy to search; says what, where, when |
| **Environment** | QA env, build 3.4.1, Chrome 129, Windows 11 | Many bugs happen only in one setup |
| **Preconditions** | Logged in as problem_user; cart empty | Same starting point for the developer |
| **Steps to reproduce** | Numbered, one action per step, exact data | Anyone can repeat it |
| **Expected result** | From the requirement, with the source | Shows *why* it is a bug |
| **Actual result** | Exactly what happened, with message text | No guessing |
| **Evidence** | Screenshot, video, console log, HAR file | Proof and clues |
| **Severity / Priority** | Major / P2, with a one-line reason | Helps triage |
| **Frequency** | 5/5 tries, or 2/10 (intermittent) | Shows how often it fails |
| **Links** | Story, test case, related bugs | Traceability |

**Title formula:** [Area] + what fails + when.

**Example:** a weak and a strong title for the same bug.
- Weak: "Images broken!!!"
- Strong: "Inventory: all 6 products show the same dog image for problem_user"
The strong title tells the area, the failure and the condition. Anyone searching "dog image" finds it. The full report is in the code box below.

**Rules of thumb:**
- **One bug per report.** Three problems in one ticket get one fixed and the ticket closed.
- **Facts, not feelings.** Write "Button does nothing", not "dev broke the button again!!!".
- **Fewest steps.** Remove every step that is not needed. Three steps beat fifteen.
- **Add a workaround** if you found one. It can change the priority.
- **Check the latest build** and search for duplicates before logging.

**Common mistake:** writing "Expected: it should work". Write the real value and its source, e.g. "Expected: total ₹1,770 (story SHOP-55)".`,
      code: [
        {
          language: 'text',
          title: 'Bug report: SauceDemo inventory images (problem_user)',
          code: `ID:        SD-101
Title:     Inventory: all 6 products show the same dog image when
           logged in as problem_user
Env:       https://www.saucedemo.com, Chrome 129, Windows 11
Severity:  Major - wrong product imagery misleads buyers
Priority:  P2 - fix before release; no data loss, purchase works
Frequency: 5/5

Preconditions: browser cache cleared; not logged in

Steps:
  1. Open https://www.saucedemo.com
  2. Log in with problem_user / secret_sauce
  3. Look at the product images on the Products page

Expected: each product shows its own image (same as standard_user,
          e.g. the backpack shows a backpack)
Actual:   all 6 products show an identical image of a dog; the image
          src is the same file for every item

Evidence: screenshot-sd101.png (problem_user vs standard_user side by
          side), console log has no errors
Notes:    standard_user is not affected -> user-specific data issue`,
        },
      ],
      keyPoints: [
        'Title = area + what fails + under which condition.',
        'Expected result must cite a source (requirement, previous behaviour, another user).',
        'One bug per report, minimal steps, exact data, evidence attached.',
      ],
      source: 'Software Testing Help — How to Write a Good Bug Report; Guru99 — Bug Report template',
    },
    {
      heading: 'Severity vs priority',
      body: `**Severity** = how badly the bug hurts the app or the user. **Priority** = how soon it must be fixed.

**Example:** on SauceDemo, the Checkout button does nothing. No one can buy → **Critical severity, P1**. The button says "Ad to cart" instead of "Add to cart" → **Trivial severity**.

| | **Severity** | **Priority** |
|---|---|---|
| Question | How much does this damage the system or user? | How soon must it be fixed? |
| Based on | Technical/functional impact | Business value, deadlines, customer visibility, risk |
| Usually set by | Tester (QA) | Product owner / project manager / triage |
| Typical scale | Critical (Blocker), Major, Minor, Trivial | P1 (Urgent/Highest) … P4 (Low) |
| Changes when | Rarely; impact is a fact | Often; deadlines and business context change |

**The four combinations (classic interview question):**

| | **High priority** | **Low priority** |
|---|---|---|
| **High severity** | Payment fails for every card at checkout. Revenue stops. | Old admin export crashes above 10,000 rows. Used twice a year; exporting by month works |
| **Low severity** | Company name misspelled on the home page the day before a launch | Typo in the FAQ page footer |

**Why they differ:** severity looks at the *system*. Priority looks at the *business*. A crash used by two staff members can wait. A typo every customer sees on launch day cannot.

**Severity levels:**
- **Critical / Blocker:** crash, data loss, security hole, or main flow blocked with no workaround.
- **Major:** an important feature is wrong, but a workaround exists or only some users are hit.
- **Minor:** small impact, an edge case, or a confusing message.
- **Trivial / Cosmetic:** alignment, colour or a typo. Nothing stops working.

**In an interview, say:** "I set severity from the impact I saw. Priority is a business decision. I suggest one, but the PO owns it."

**Common mistake:** marking every bug Critical. The team soon ignores your ratings.`,
      diagram: `                 PRIORITY (business urgency) -->
                 Low                          High
             +---------------------------+---------------------------+
   High      | Rare-path crash with a    | Checkout payment fails    |
   SEVERITY  | workaround (legacy export)| for all cards             |
   (impact)  +---------------------------+---------------------------+
   Low       | Typo in FAQ footer        | Brand name misspelled on  |
             |                           | home page before launch   |
             +---------------------------+---------------------------+`,
      keyPoints: [
        'Severity = impact (QA); priority = urgency (PO/triage).',
        'They are independent: all four combinations happen in real projects.',
        'Priority changes with business context; severity rarely does.',
      ],
      source: 'ISTQB Glossary — severity, priority; softwaretestpilot.com — Severity vs Priority matrix',
    },
    {
      heading: 'Reproducible reports and evidence',
      body: `**A reproducible report** is one where anyone who follows your steps sees the same bug. **Evidence** is the proof you attach: screenshots, videos, logs.

Why it matters: "I saw it happen" is not enough. Evidence also gives the developer clues.

**Evidence to attach, and when:**

| Evidence | Best for | Tip |
|---|---|---|
| **Screenshot** (marked up) | Layout bugs, error messages | Circle the problem; show the URL bar |
| **Screen recording** | Multi-step flows, timing, flicker | Under one minute; start from a clean state |
| **Browser console log** | JavaScript errors | Paste the red error lines as text |
| **HAR / Network tab** | Wrong API data, 4xx/5xx errors, slow calls | Note the URL, status code and response |
| **Server logs / correlation ID** | Backend errors | Quote the request ID shown on the error |
| **Playwright trace** | Bugs from automated tests | Open \`trace.zip\` with \`npx playwright show-trace\` to see each step |
| **Test data** | Bugs that need certain data | Order ID, user ID, exact input values |

**Make it reproducible:**
1. **Repeat it yourself** at least twice. If it fails only sometimes, write the rate (3/10).
2. **Change one thing at a time:** another user, browser, incognito window, environment.
3. **Cut the steps.** Remove steps one by one until the bug disappears. The last step you removed matters.
4. **Write exact data.** "Enter a long name" is vague. "Enter 256 'a' characters" is exact.
5. **Check the API** in DevTools → Network.

**Example:** the cart page shows total ₹1,500, but it should be ₹1,770 (with 18% GST). You open DevTools → Network → the cart request.
- API says \`"total": 1500\` → the server calculated it wrong → **backend bug**.
- API says \`"total": 1770\`, page shows ₹1,500 → the page shows the wrong value → **frontend bug**.
One line in your report ("API returns 1770, page shows 1500") saves the team hours.

**Common mistake:** attaching a 10-minute video with no steps. Evidence supports the written steps. It does not replace them.`,
      keyPoints: [
        'Reproduce twice, isolate variables, minimise steps, record exact data.',
        'Use DevTools Network to say whether it is a frontend or backend bug.',
        'Attach evidence that matches the bug type; quote error text as text.',
      ],
      source: 'Software Testing Help — How to Write a Good Bug Report; Playwright docs — Trace viewer',
    },
    {
      heading: 'Bugs the developer cannot reproduce',
      body: `**"Cannot reproduce"** means the developer follows your steps and does not see the bug. Usually one condition is different between your setup and theirs.

**Intuition:** a car that makes a noise only on cold mornings will be quiet at the garage at noon.

**Check these differences:**

| Area | Questions |
|---|---|
| **Environment** | Same environment (QA, dev, staging)? Same build? Same feature flags? |
| **Data** | Same user, role, account state, cart contents? |
| **Client** | Browser and version, device, screen size, language, timezone |
| **Network** | Slow connection, VPN, region, CDN cache |
| **Timing** | Double click? Session about to expire? Only after midnight? |
| **State** | Old cookies, cache, local storage, leftovers from an earlier step |

**Example:** you see "Payment failed" on the QA environment. The developer tries on the dev environment and it works. You compare: your test user has an **expired saved card**; theirs has a new one. With the same user, the developer sees the bug at once. The fix: add "user with expired saved card" to the preconditions.

**What to do, in order:**
1. **Repeat it** on the current build, then in a clean (incognito) browser.
2. **Add evidence:** video, HAR file, console errors, exact time, request ID. The time lets the developer search server logs.
3. **Narrow it down:** try other users, browsers, environments. Write down which ones fail.
4. **Pair with the developer.** Show it on your screen. Ten minutes together beats ten comments.
5. **If it fails only sometimes:** write the rate and conditions, label it "needs info", and ask for extra logging.
6. **Only then** agree to "Cannot reproduce", with the conditions written down. Then it can be reopened if it comes back.

**In an interview, say:** "I treat it as a joint investigation. I look for the difference, add evidence, and pair with the developer."

**Common mistake:** saying "I would close it" or "I would insist it's a bug". Both skip the investigation.`,
      keyPoints: [
        '"Cannot reproduce" means a hidden difference: environment, data, client, network, timing or state.',
        'Collect timestamps and correlation IDs so developers can search server logs.',
        'Pair with the developer before agreeing to close it.',
      ],
      source: 'Kaner, Bach & Pettichord — Lessons Learned in Software Testing, Ch 4 Bug Advocacy',
    },
    {
      heading: 'Defect triage',
      body: `**Defect triage** is a regular meeting where the team decides what happens to each new or disputed bug. It is daily near a release, otherwise once or twice a week.

**Intuition:** a hospital emergency room does not treat patients in arrival order. A triage nurse decides who goes first.

**Who attends:** QA lead or tester, development lead, product owner (PO). Sometimes support or a business analyst.

**For each bug, triage decides:**
1. **Valid?** Bug, duplicate, not a bug, or change request.
2. **Severity** confirmed and **priority** set.
3. **Owner:** which developer or team.
4. **Target:** this sprint, next release, or backlog.

**What drives the decision:** how many users are hit, business impact, any workaround, how risky the fix is, the release date, and report quality.

**Example:** two days before release, two bugs come up.
- "UPI payment times out on Android" → 40% of orders use UPI, no workaround → **P1, fix now**.
- "Admin CSV export crashes above 10k rows" → 2 staff users, export by month works → **Deferred** to next release, added to known issues.
See the full meeting notes below.

**QA's role in triage:**
- Present each bug in 30 seconds: what fails, who is hit, workaround, evidence.
- Bring **data**. "Fails for all UPI payments, 40% of orders" beats "this is serious".
- Accept the business decision, but make sure the **risk is recorded**.

**Output:** updated tickets and a short summary, e.g. "12 triaged: 2 P1, 5 P2, 3 deferred, 2 rejected". Near a release, triage also feeds the go/no-go decision.`,
      code: [
        {
          language: 'text',
          title: 'Triage meeting notes (release 3.4)',
          code: `Defect triage - Tue 10:00 - Release 3.4 (code freeze Fri)
Attendees: QA lead (Ravi), Dev lead (Sana), PO (Meera)

BUG-511  UPI payment times out after 30 s on Android Chrome
         Sev Critical | Pri P1 | Owner: payments team | Fix in 3.4
         Reason: 40% of orders use UPI; no workaround on mobile
BUG-514  Invoice PDF shows the old logo
         Sev Trivial  | Pri P2 | Owner: Arjun | Fix in 3.4
         Reason: customer-facing document; 1-line asset change
BUG-498  Admin CSV export crashes above 10k rows
         Sev Major    | Pri P3 | Deferred to 3.5
         Reason: 2 internal users; workaround = export per month.
         Added to release notes "known issues".
BUG-520  Search ignores accents (cafe vs café)
         -> Change request, moved to backlog (not in requirements)
BUG-521  Duplicate of BUG-488 -> closed, evidence copied to 488

Summary: 5 triaged - 2 fix now, 1 deferred, 1 CR, 1 duplicate`,
        },
      ],
      keyPoints: [
        'Triage = validity, severity, priority, owner, target release.',
        'QA brings impact data and evidence; the PO owns the business decision.',
        'Deferred bugs must stay visible (known issues, release notes).',
      ],
      source: 'GeeksforGeeks — Defect management process; ISTQB CTFL v4.0 — 5.5',
    },
    {
      heading: 'Root cause analysis (RCA) basics',
      body: `**Root cause analysis (RCA)** asks two questions: why was the bug put in, and why did testing miss it? The goal is to stop the whole type of bug, not just this one.

**Intuition:** mopping the floor fixes today's puddle. Fixing the leaking pipe stops tomorrow's. RCA looks for the pipe.

ISTQB lists process improvement as one purpose of defect reports. RCA is how you do it.

**The 5 whys:** keep asking "why?" until you reach a cause the team can change. Usually it is a process, design or communication gap. Stop at a fixable cause, never at a person.

**Example: customers were charged twice for one order.**
1. *Why?* Two orders were created for one checkout.
2. *Why?* The "Place order" request was sent twice.
3. *Why?* Users double-clicked, and the button stayed active during the request.
4. *Why was that possible?* The API had no **idempotency** check (a rule that a repeated request has no extra effect).
5. *Why wasn't it caught?* No "double submit" test in our checklist, and no acceptance criterion about it.

**Root causes:** no idempotency (design gap) + no double-submit test (test gap).
**Actions:** idempotency key on the order API; disable the button while submitting; add "double submit" to the QA checklist for payment stories.

**Group root causes into types** to spot trends: requirement, design, code, configuration/environment, data, test gap. If 40% of escapes are "unclear requirement", the fix is better three-amigos sessions, not more regression tests.

A **fishbone (Ishikawa) diagram** sorts possible causes into groups (people, process, tools, environment, requirements). It helps a team brainstorm.

**Common mistake:** writing "Developer X made a mistake" as the root cause. Anyone can make that mistake. Ask what let it reach production.`,
      keyPoints: [
        'RCA asks two questions: why was it introduced, and why did it escape?',
        '5 whys: stop at a cause the team can change, never at a person.',
        'Classify root causes to see trends and choose process fixes.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.5 Defect Management; ISTQB Glossary — root cause analysis',
    },
    {
      heading: 'Defect metrics: density, leakage, DRE, reopen rate',
      body: `**Defect metrics** are numbers that show how buggy the product is and how well testing catches bugs. **KLOC** means a thousand lines of code.

| Metric | Formula | What it tells you |
|---|---|---|
| **Defect density** | Defects ÷ size (KLOC, or per module/story) | Which modules are bug-prone |
| **Defect Removal Efficiency (DRE)** | Found before release ÷ (before + after release) × 100 | How much we catch before customers do |
| **Defect leakage** | Found in a later phase ÷ found in the earlier phase × 100 | How many bugs slip past a stage |
| **Reopen rate** | Reopened ÷ fixed × 100 | Quality of fixes and bug reports |
| **Rejection rate** | Rejected ÷ reported × 100 | Report quality, clear requirements, stable environment |
| **Defect age / MTTR** | Average of (closed date − opened date) | How fast bugs get fixed |

**Example (release 3.4):** QA found 180 bugs. UAT found 15. Production found 5 in the first 30 days. Total = 200.
- **DRE** = (180 + 15) ÷ 200 × 100 = **97.5%**
- **Leakage QA → UAT** = 15 ÷ 180 × 100 = **8.3%**
- **Leakage to production** = 5 ÷ 195 × 100 ≈ **2.6%**
- The release changed 40 KLOC, so **density** = 200 ÷ 40 = **5 defects per KLOC**

**Formulas vary.** Some teams compute leakage as escaped ÷ total (5 ÷ 200 = 2.5%). Always **say your formula and time window** ("production bugs in the first 30 days"). DRE means nothing until that window has closed.

**Read metrics with care.** **Goodhart's law:** when a number becomes a target, it stops being a good measure.
- Counting bugs per tester rewards splitting one bug into five.
- A low bug count can mean good quality *or* weak testing. Check leakage too.
- Weigh by severity. Five trivial escapes are not the same as one critical one.

**In an interview, say:** "I use metrics to improve the process, never to rank testers."`,
      code: [
        {
          language: 'text',
          title: 'Release quality summary (excerpt)',
          code: `Release 3.4 - Defect metrics (production window: 30 days)

Found in        Critical  Major  Minor  Trivial  Total
QA (system)          6      52     88      34     180
UAT                  0       5      8       2      15
Production           1       2      2       0       5
--------------------------------------------------------
Total                7      59     98      36     200

DRE (pre-release)            195 / 200       = 97.5 %
Leakage QA -> UAT             15 / 180       =  8.3 %
Leakage to production          5 / 195       =  2.6 %
Critical leaked to prod        1 / 7         = 14.3 %  <- RCA needed
Reopen rate                   12 / 160 fixed =  7.5 %
Density (40 KLOC changed)    200 / 40        =  5.0 per KLOC
Top module by density: Payments (11.2 per KLOC)`,
        },
      ],
      keyPoints: [
        'DRE = before ÷ (before + after) × 100; needs a post-release window.',
        'Always state the leakage formula and time window you used.',
        'Use metrics to improve the process, never to rank individual testers.',
      ],
      source: 'Testsigma — Defect Removal Efficiency; vskills — Software Testing Metrics; GeeksforGeeks — Defect metrics',
    },
    {
      heading: 'Jira workflow for bugs',
      body: `A **Jira workflow** is the set of statuses (columns) a bug moves through, and the rules for moving it.

**Building blocks:**
- **Issue type:** Bug (others: Story, Task, Epic, Sub-task). Some teams log sprint bugs as sub-tasks of the story.
- **Workflow:** statuses + transitions (moves between them). A common bug flow: *To Do → In Progress → In Review → Ready for QA → Done*, with *Reopened* going back to In Progress. Each project can change it.
- **Priority** (built in): Highest, High, Medium, Low, Lowest.
- **Severity is not built in.** Teams add it as a custom field.
- **Resolution** (built in): set when the bug is closed, e.g. Done, Won't Do, Duplicate, Cannot Reproduce.
- **Useful fields:** Affects Version, Fix Version, Environment, Components, Labels (\`regression\`, \`prod-escape\`), links (*blocks*, *is duplicated by*, *relates to*).
- **Test add-ons** like Xray or Zephyr link test runs to bugs. A failed test can create a bug with the steps filled in.

**Example:** the team moves 15 bugs to **Done**, but the move does not set a **Resolution**. The dashboard filter \`resolution = Unresolved\` still counts all 15 as open. The board shows 25 open; the dashboard shows 40. Fix: make the Done transition set a resolution.

**JQL** (Jira Query Language) builds the filters QA uses every day. See the examples below.

**Common mistake:** thinking "status = Done" means "resolved". In Jira they are separate fields.`,
      code: [
        {
          language: 'text',
          title: 'Everyday JQL for QA',
          code: `-- My bugs waiting for retest
project = SHOP AND issuetype = Bug AND status = "Ready for QA"
  AND reporter = currentUser()

-- Open high-priority bugs for the release, newest first
project = SHOP AND issuetype = Bug AND resolution = Unresolved
  AND priority in (Highest, High) AND fixVersion = "3.4"
  ORDER BY created DESC

-- Bugs reopened this month (fix quality signal)
project = SHOP AND issuetype = Bug
  AND status CHANGED TO "Reopened" DURING (startOfMonth(), now())

-- Production escapes in the last 30 days (leakage input)
project = SHOP AND issuetype = Bug AND labels = prod-escape
  AND created >= -30d

-- Possible duplicates before logging a new bug
project = SHOP AND issuetype = Bug AND text ~ "upi timeout"`,
        },
      ],
      keyPoints: [
        'Priority and Resolution are built into Jira; severity is usually a custom field.',
        'Closed statuses need a resolution, or filters treat the bug as unresolved.',
        'Saved JQL filters drive QA dashboards: retest queue, reopened bugs, escapes.',
      ],
      source: 'Atlassian docs — Jira workflows, resolutions and JQL (CHANGED, DURING, text ~)',
    },
    {
      heading: 'Communicating with developers',
      body: `**Intuition:** you and the developer are on the same side, against the bug. A bug report is a message to a colleague, not a verdict.

**Habits that build trust:**
- **Ask before you log** when unsure. "Is this expected?" in the team chat can save a rejected bug.
- **Describe the behaviour, not the person.** "Checkout fails for UPI on Android", not "your code broke checkout".
- **Be honest about certainty.** "Fails 3/10 times; no pattern found yet."
- **Share your analysis.** "The API returns the right total, but the page shows the old one. Looks like a frontend cache issue."
- **Reply fast** to questions on your bugs. A bug waiting on QA is QA's delay.
- **Retest quickly** when a fix lands, and say thanks.
- **Escalate once, with evidence.** Take disagreements to the PO or triage, with the requirement quoted.

**Bug advocacy** (Kaner, Bach & Pettichord) means your report must *sell* the fix. Show the worst realistic result, how many users it hits, and how easy it is to hit.

**Example:** the same bug, written two ways.
- "Button glitch on checkout" → gets deferred.
- "Double click on Place order charges the customer twice" → gets fixed today.

**Common mistakes:** sarcasm in tickets, copying managers on every bug, reopening without new information, and logging a "bug" the story already answers.`,
      keyPoints: [
        'Same team, common enemy: describe behaviour, not people.',
        'Add analysis (API vs UI) and honest frequency to your reports.',
        'Bug advocacy: state the realistic worst-case impact so the fix gets prioritised.',
      ],
      source: 'Kaner, Bach & Pettichord — Lessons Learned in Software Testing, Ch 4 Bug Advocacy',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-defects-cc-1',
      title: 'Vague bug report → a report a developer can reproduce in 5 minutes',
      context:
        'A tester logged this while testing checkout on https://www.saucedemo.com. The developer replied "Which user? Which step? Can\'t reproduce" and moved it to Need Info.',
      task: 'Rewrite the report. Give it a specific title, environment and preconditions. Add short numbered steps with exact data, expected vs actual with the message text, evidence, frequency, and severity and priority with reasons.',
      starter: {
        language: 'text',
        title: 'Weak bug report',
        code: `Title: Checkout broken!!!

Checkout is not working, I tried many times and it fails.
Please fix ASAP, this is very urgent.

Severity: Critical
Priority: Critical
Attachment: none`,
      },
      hints: [
        'Which user account did you use? SauceDemo has several test users that behave differently. Try standard_user to compare.',
        'Name the exact step and field where it fails, and copy the exact error text shown.',
        'Is checkout broken for everyone (critical) or for one test user only? Let that drive severity and priority.',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite',
        code: `ID:        SD-117
Title:     Checkout step one: Last Name cannot be entered for
           problem_user, so "Continue" shows "Last Name is required"
Env:       https://www.saucedemo.com | Chrome 129 | Windows 11
Severity:  Major - checkout blocked for this user type; other
           users (standard_user) can check out
Priority:  P2 - fix before release; not affecting all customers
Frequency: 5/5 attempts (also reproduced in Firefox 131)

Preconditions: logged out; cart empty

Steps:
  1. Log in as problem_user / secret_sauce
  2. Add "Sauce Labs Backpack" to the cart
  3. Open the cart and click "Checkout"
  4. Type First Name "Asha", Last Name "Rao", Postal Code "560001"
  5. Click "Continue"

Expected: all three fields keep the typed values and the
          "Checkout: Overview" page opens (as for standard_user)
Actual:   the Last Name field stays empty after typing "Rao";
          clicking Continue shows "Error: Last Name is required"

Evidence: checkout-lastname.mp4 (25 s), screenshot with the error,
          console log: no errors
Notes:    standard_user completes the same steps -> account-specific`,
      },
      explanation: `**What changed and why:**

- **Specific, searchable title** (area + failure + condition) instead of "Checkout broken!!!". Duplicates are now easy to find.
- **Environment and preconditions** let anyone start from the same state.
- **Minimal numbered steps with exact data** (user, product, field values). "Tried many times" became a reproducible script.
- **Expected vs actual** with the exact error text and a reference (standard_user behaves correctly). This proves it is a bug and narrows the cause to account-specific behaviour.
- **Honest severity/priority with reasons:** it blocks one user type, not all checkouts, so Major/P2 rather than Critical/Critical. Over-rating every bug teaches the team to ignore your ratings.
- **Evidence and frequency** (5/5, two browsers) prevent the "can't reproduce" round trip.
- **Tone:** facts only. No capitals, no "ASAP".`,
      followUps: [
        {
          q: 'Who should set the priority on this bug, and can it change?',
          a: 'I suggest P2 with a reason, but the product owner or triage owns priority, because it depends on business needs. It can change. If many real customers hit the issue, or a demo depends on it, the PO may raise it to P1. The severity stays Major.',
        },
        {
          q: 'How would you confirm whether this is a frontend or backend problem?',
          a: 'Open DevTools while typing in Last Name. If the field never updates its value and no request is sent, it is frontend input handling. If the field shows the value but the request sent on Continue drops it, it is a request-building bug. If the API rejects a correct value, it is backend. I would note the finding in the report.',
        },
      ],
    },
    {
      id: 'mt-defects-cc-2',
      title: '"Still failing" reopen comment → a reopen note that moves the bug forward',
      context:
        'BUG-742 "Coupon SAVE15 not applied to sale items" was marked Fixed in build 2.9.3. The tester retested and reopened it with the comment below. The developer replied "Works for me" and asked for details.',
      task: 'Rewrite the reopen comment. The developer should see what you retested, what now works, and what still fails. Also say whether this is the same bug or a new one.',
      starter: {
        language: 'text',
        title: 'Weak reopen comment',
        code: `Reopened. Still failing. Please check again.`,
      },
      hints: [
        'State the build and environment you retested on. Was the fix even deployed there?',
        'Separate what now works from what still fails; maybe only part of the fix works.',
        'If the remaining failure has different steps or a different cause, should it be this ticket or a new linked one?',
      ],
      solution: {
        language: 'text',
        title: 'Strong reopen note',
        code: `Retested on QA env, build 2.9.3 (confirmed in footer + /version),
Chrome 129, user member01@test.in, cart cleared before each run.

PASS  Single sale item (Backpack, sale price 1,200.00)
      -> SAVE15 gives 180.00 off. Original steps now pass.
FAIL  Sale item + non-sale item in the same cart
      (Backpack 1,200.00 + Bike Light 800.00)
      Expected: 15% off both = 300.00 (story SHOP-188, AC-2)
      Actual:   180.00 off - the coupon applies only to the
                sale item; /api/cart/apply-coupon returns
                "eligibleItems": ["backpack"]
      3/3 attempts. HAR + screenshot attached.

Reopening because AC-2 (mixed carts) was part of the original
bug's scope. If you prefer to track mixed carts separately,
I can log a new bug and link it as "relates to" BUG-742, and we
can close this one as fixed for single items.`,
      },
      explanation: `**Why this reopen works:**

- **Build verified:** many "still failing" reopens are retests on a build without the fix. Naming the build and how it was checked removes that doubt.
- **Pass and fail separated:** the developer learns that the fix *partly* works, which narrows the investigation to mixed carts.
- **Exact data, expected vs actual, requirement reference** and the API response point straight at the eligibility logic.
- **Same bug or new bug, said openly:** the note offers to split the ticket, so one ticket = one failure. It also credits the part of the fix that works.
- **Evidence and frequency** (HAR, 3/3) prevent another "works for me".`,
      followUps: [
        {
          q: 'When is reopening the wrong choice?',
          a: 'When the original steps now pass and you have found a different failure, even in the same area. Then the original bug is fixed and should be verified and closed, and the new failure gets its own ticket linked with "relates to". Reopening for unrelated problems hides progress and breaks the reopen-rate metric.',
        },
        {
          q: 'The bug has been reopened three times. What do you do differently?',
          a: 'Stop the back-and-forth and pair with the developer. Reproduce it together. Write every case that must pass into the ticket as acceptance checks. Ask for a unit or API test that covers them. Three reopens is also an RCA signal: unclear requirements, or different test data each time.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-defects-iq-01',
      difficulty: 'easy',
      question: 'Walk me through the life of a bug, from the moment you find it until it is closed. Include what happens when things do not go smoothly.',
      whatInterviewerLooksFor: [
        'Knows the main statuses in the right order',
        'Covers the side exits: rejected, duplicate, deferred, reopened',
        'Says who moves the bug at each step',
        'Distinguishes retesting from regression testing before closing',
      ],
      modelAnswer: `**Before logging:** I reproduce the failure at least twice, check it on the latest build, and search the tracker for duplicates.

**Main path:**
1. **New:** I log it with title, environment, steps, expected vs actual, evidence, and severity.
2. **Assigned:** in triage the lead or PO confirms it is valid, sets priority and assigns a developer.
3. **Open / In progress:** the developer investigates and fixes it.
4. **Fixed → Ready for retest:** the fix is merged and deployed to the QA environment, with the build number on the ticket.
5. **Retest:** I run the exact failing steps on that build.
6. **Verified → Closed:** if it passes, I run a quick regression around the change, then close it. For example, if the coupon logic was fixed, I also try other coupon types.

**When things do not go smoothly:**
- **Rejected / Not a bug:** I re-read the requirement. If I still disagree, I quote the acceptance criterion and ask the PO to decide.
- **Duplicate:** linked to the original, adding any extra evidence I had.
- **Deferred:** valid but moved to a later release; I make sure it appears in known issues.
- **Cannot reproduce:** I add evidence (video, HAR, timestamps) and pair with the developer before agreeing to close.
- **Reopened:** the retest fails. I note the build, what still fails and fresh evidence. If the original steps pass but I find a *different* failure, I log a new bug and link it instead of reopening.

**Who closes:** the tester who verified it, not the developer who fixed it, so there is an independent check. Tool names vary (Jira often uses *Ready for QA* and *Done* with a resolution), but the flow is the same.`,
      followUps: [
        {
          q: 'What is the difference between Deferred and Rejected?',
          a: 'Rejected means the team decided it is not a defect: works as designed, user error, or an environment problem. Deferred means it is a real defect, but the fix moves to a later release. Reasons: low priority, a risky fix, or a code freeze. A deferred bug stays open and is listed in the release notes.',
        },
        {
          q: 'Should a developer ever close a bug?',
          a: 'Generally no. The developer marks it fixed; the reporter or QA verifies and closes it. That keeps an independent check on the fix. Some teams allow exceptions, such as a developer closing a bug they reported, or auto-closing duplicates. Still, someone other than the fixer should verify.',
        },
        {
          q: 'How many times can a bug be reopened before you escalate?',
          a: 'There is no fixed rule, but a second reopen is my signal to change approach: pair with the developer, write the exact acceptance checks into the ticket, and confirm we are testing the same build and data. Repeated reopens usually mean an unclear requirement or an incomplete fix, which triage should know about.',
        },
      ],
      pitfalls: [
        'Listing statuses with no explanation of who moves them or why.',
        'Saying the developer closes the bug after fixing it.',
        'Forgetting regression testing around the fix before closing.',
      ],
    },
    {
      id: 'mt-defects-iq-02',
      difficulty: 'medium',
      question: 'Explain severity and priority. Give a real example of a high-severity, low-priority bug and a low-severity, high-priority bug.',
      context:
        'This is one of the most frequently repeated manual-testing interview questions; interviewers expect concrete examples, not definitions alone.',
      whatInterviewerLooksFor: [
        'Clear definitions: impact vs urgency',
        'Knows who usually sets each',
        'Convincing examples for both unusual combinations, with the reasoning',
        'Understands that priority can change while severity stays',
      ],
      modelAnswer: `**Severity** is the impact of the defect on the system or user: how badly it breaks things. QA usually sets it from what was observed. Typical levels: Critical (Blocker), Major, Minor, Trivial.

**Priority** is how urgently it should be fixed, based on business needs: customer visibility, deadlines, number of users affected, workaround. The PO or triage owns it, often on a P1–P4 scale.

They are independent, so all four combinations exist:

| | High priority | Low priority |
|---|---|---|
| **High severity** | Payment fails for every card at checkout | Crash in a legacy admin report used twice a year, with a workaround |
| **Low severity** | Brand name misspelled on the home page before a launch | Typo in the FAQ footer |

**High severity, low priority:** the admin CSV export crashes when a file has more than 10,000 rows. A crash is severe. But only two internal users run it at quarter end, and exporting month by month works around it. So it is deferred to the next release and listed as a known issue.

**Low severity, high priority:** the company name is misspelled in the home-page banner the day before a marketing campaign. Nothing is functionally broken, so severity is trivial. But every visitor sees it and it damages the brand, so it is fixed today.

**How I handle it in practice:** I set severity with a one-line justification and *suggest* a priority. If the PO lowers the priority of something I rated Critical, I make sure the impact and workaround are written down. Severity rarely changes; priority changes with business context, for example when a big client complains about the "low priority" export.`,
      followUps: [
        {
          q: 'Who decides when QA and the PO disagree about priority?',
          a: 'The PO, because priority is a business decision about time and value. QA\'s responsibility is to make the impact clear with data: how many users, which flows, any workaround, the worst realistic consequence. If I believe the risk is being underestimated, I raise it once in triage with evidence and make sure the decision is recorded.',
        },
        {
          q: 'Is a security vulnerability that nobody has exploited yet high or low priority?',
          a: 'Usually high, even without exploitation, because the impact if exploited (data leak, legal exposure) is severe and attackers move fast once something is known. Priority still depends on exposure. A flaw on a public login page is P1. A flaw in an internal tool behind a VPN may come a little later, but still with a deadline.',
        },
      ],
      pitfalls: [
        'Treating severity and priority as the same scale.',
        'Giving examples without explaining why priority differs from severity.',
        'Claiming the tester alone decides priority.',
      ],
    },
    {
      id: 'mt-defects-iq-03',
      difficulty: 'medium',
      question: 'You logged a bug, and the developer says "Cannot reproduce, works on my machine." What do you do next?',
      whatInterviewerLooksFor: [
        'Treats it as a joint investigation, not a fight',
        'Systematically compares environment, data, client, timing and state',
        'Collects better evidence (video, HAR, logs, timestamps)',
        'Knows when "cannot reproduce" is an acceptable resolution',
      ],
      modelAnswer: `"Works on my machine" means something differs between my setup and the developer's, so I look for that difference.

**1. Re-check my own reproduction.** Same steps on the current build, then in a clean browser profile or incognito. If I can no longer reproduce it, I say so honestly.

**2. Compare the conditions.**
- **Environment and build:** QA vs dev environment, build number, feature flags, config.
- **Data:** the user, role, account state, cart contents. Many bugs need specific data, for example a user with an expired card on file.
- **Client:** browser and version, device, screen size, language, timezone, extensions.
- **Timing:** double clicks, slow network, session close to expiry, race conditions.

**3. Add evidence.** A screen recording, console errors as text, and a HAR file of the failing request. I add exact times and any request ID shown on the error, so the developer can search server logs. For an automated run, the Playwright trace shows each step.

**4. Pair.** I ask for ten minutes: I reproduce it while the developer watches on my machine or over screen-share. This resolves most cases faster than more comments.

**5. If it fails only sometimes:** I record the rate (for example 3 out of 20) and the conditions. I label it "needs info" and ask for extra logging around the suspected area.

**6. Close only with notes.** If neither of us can reproduce it, we resolve it as "Cannot reproduce". All conditions are written down. Then it can be reopened fast if it shows up again, for example in production monitoring.`,
      followUps: [
        {
          q: 'The bug only happens in production, never in QA. How do you investigate?',
          a: 'Look for production-only differences: real data volumes, third-party integrations in live mode, CDN caching, configuration and feature flags, traffic levels. Use production logs and monitoring (error tracking, request IDs) rather than trying to reproduce blindly. If safe, reproduce with a test account in production, or copy anonymised production data into staging.',
        },
        {
          q: 'How would you report an intermittent bug so it is still taken seriously?',
          a: 'State the rate honestly (3/20). List when it happened and when it did not. Attach evidence from a failing run and describe the user impact. An occasional bug in payments or saving data can be worse than a constant one, so the impact matters more than the rate.',
        },
      ],
      pitfalls: [
        'Closing the bug immediately, or insisting it is a bug without new evidence.',
        'Not checking whether the developer used the same build, data or environment.',
        'Escalating to managers before trying to reproduce together.',
      ],
    },
    {
      id: 'mt-defects-iq-04',
      difficulty: 'medium',
      question: 'Write a bug report, out loud, for this: on SauceDemo, problem_user sees the same image for every product. Then tell me what severity and priority you would give it.',
      whatInterviewerLooksFor: [
        'A specific, searchable title',
        'Environment, preconditions, numbered steps with exact data',
        'Expected result backed by a reference (standard_user, design)',
        'Justified severity and priority, not "critical" by default',
      ],
      modelAnswer: `**Title:** Inventory: all 6 products show the same dog image when logged in as problem_user

**Environment:** https://www.saucedemo.com, Chrome 129, Windows 11. (On a real project I would add the build number.)

**Preconditions:** logged out.

**Steps:**
1. Open https://www.saucedemo.com
2. Log in with problem_user / secret_sauce
3. Look at the product images on the Products page

**Expected:** each product shows its own image, the same as for standard_user (the backpack shows a backpack, the bike light shows a bike light).

**Actual:** every product shows an identical image of a dog. Inspecting the elements shows the same image source on all six.

**Evidence:** a side-by-side screenshot of problem_user and standard_user, and the image URLs copied from DevTools.

**Frequency:** 5/5; also happens in Firefox.

**Analysis note:** standard_user is fine, so the problem is tied to this account's data or configuration, not to the page template.

**Severity: Major.** Shoppers cannot see what they are buying, which can lead to wrong purchases and returns. Prices, add-to-cart and checkout still work, so it is not Critical.

**Priority: P2** (my suggestion). Fix it before release, but it does not block revenue for most users. If this hit a real customer group, say all users in one region, I would argue for P1. Every product page would look broken to them.

I would also check the product detail page and the cart. If they show the wrong image too, the bug is in the data, not the list view. I would add that to the report.`,
      followUps: [
        {
          q: 'Would you attach a video for this bug?',
          a: 'Not necessary. It is a static visual bug, so an annotated screenshot comparing the two users proves it in one glance. Videos are most useful for multi-step flows, timing issues or flicker. Attaching only what helps keeps the report quick to read.',
        },
        {
          q: 'How would you catch this kind of bug in Playwright automation?',
          a: 'Two options. First, collect the image src values (locator.evaluateAll or getAttribute) and check with a Set that they are all different. Second, use a visual comparison with toHaveScreenshot on the inventory list. The src check is cheaper and less flaky. The screenshot check catches more kinds of visual breakage.',
        },
      ],
      pitfalls: [
        'Rating every visual bug as Trivial, or every bug as Critical.',
        'Steps like "log in and check images" without exact data.',
        'No reference for the expected result.',
      ],
    },
    {
      id: 'mt-defects-iq-05',
      difficulty: 'hard',
      question: 'A bug escaped to production: customers were charged twice for one order. As the QA engineer on that feature, what do you do in the first hour, and what do you do afterwards?',
      whatInterviewerLooksFor: [
        'Immediate focus on impact and containment, not blame',
        'A reproduction and a high-quality report',
        'Structured RCA: why introduced and why it escaped',
        'Concrete preventive actions in tests and process',
      ],
      modelAnswer: `**First hour: contain and inform.**
1. **Confirm it and size the impact:** reproduce it in staging if possible. With support or engineering, find how many orders are hit (orders with the same cart and user, seconds apart).
2. **Log a P1 bug** with precise steps, evidence and affected order IDs, and join the incident channel.
3. **Help with containment:** for example, verify a hotfix that disables the button during submit, or a feature flag that routes payments differently. Retest the hotfix quickly but carefully, with regression around payment.

**After the incident: root cause analysis (blameless).** Two questions: why was the defect introduced, and why did testing not catch it?

Using 5 whys:
- Duplicate orders → the request was sent twice → users double-clicked an active button → the API had no idempotency check → no requirement or test covered double submit.

**Root causes:** a design gap (no idempotency key) and a test gap (double submit was not in our checklist or acceptance criteria).

**Preventive actions:**
- Idempotency key on the order API; button disabled while submitting.
- An API test that sends the same order twice and expects one order; a UI test that double-clicks Place order.
- Add "double submit / retry" to the QA checklist and to the acceptance criteria template for payment stories.
- Label the bug \`prod-escape\` so it counts in leakage metrics and appears in the release retrospective.

**What I would not do:** blame the developer, or promise "this will never happen again". I would say which class of bug we now test for, and how.`,
      followUps: [
        {
          q: 'Your manager asks why QA missed it. How do you answer?',
          a: 'Factually: our test cases covered single successful and failed payments, but not repeated submissions, and the acceptance criteria did not mention it. Then I would present the fixes: new API and UI tests, the checklist item, and the AC template change. Owning the test gap without blaming individuals is what managers want to hear.',
        },
        {
          q: 'Which metric would this incident affect, and how?',
          a: 'It is a production escape, so it increases defect leakage and lowers DRE for the release. Because it is a critical-severity escape, I would also report it separately (critical escapes count), since averaging it with minor defects would hide its importance.',
        },
      ],
      pitfalls: [
        'Starting with blame ("the developer did not handle it").',
        'Stopping RCA at "a test was missing" without asking why.',
        'Proposing only "more manual regression" as the fix.',
      ],
    },
    {
      id: 'mt-defects-iq-06',
      difficulty: 'medium',
      question: 'The developer rejected your bug as "works as designed", but you believe users will be confused. How do you handle it?',
      whatInterviewerLooksFor: [
        'Checks the requirement before arguing',
        'Separates "defect against spec" from "usability concern / change request"',
        'Escalates to the right person (PO) with evidence',
        'Stays professional and accepts the final decision',
      ],
      modelAnswer: `**1. Re-read the source of truth.** I check the story, acceptance criteria, designs and any later decisions in comments. Two outcomes:

- **The spec says what I expected:** then it is a defect. I reply politely with the exact acceptance criterion quoted, the build, data and evidence, and ask the PO to confirm if the developer still disagrees.
- **The implementation matches the spec, but I think the spec is wrong for users:** then it is not a defect against the requirement. It is a **usability concern or change request**, and the decision belongs to the PO, not to me or the developer.

**2. Make the user impact concrete.** For example: "After applying a coupon the total updates, but the message says 'Coupon invalid' for 2 seconds first. In a quick test, 3 of 5 colleagues tried applying the coupon again." Evidence beats opinion.

**3. Take it to the right forum.** Add it to the triage agenda or tag the PO with a short summary, and propose options: change now, log a change request for the backlog, or accept as is.

**4. Accept and record the decision.** If the PO accepts the current behaviour, the ticket closes as "Won't Do" or becomes a backlog improvement. The reason is written down. I update my test cases to match.

**What I avoid:** long comment wars, reopening without new information, and taking it personally. My job is to make the risk visible so the right person can decide.`,
      followUps: [
        {
          q: 'How do you avoid these disagreements in the first place?',
          a: 'By joining before development. In refinement or three-amigos sessions I ask about edge cases and messages, and get the answers written into the acceptance criteria. Then there is less room for "works as designed" fights later. Usability concerns also come up while they are still cheap to change.',
        },
        {
          q: 'What if the PO is unavailable and the release is tomorrow?',
          a: 'I would raise it with whoever owns the release decision, such as the release manager or engineering lead. I state the user impact and the options, and make sure the decision is recorded. If it is truly minor, listing it as a known issue and fixing it next sprint is fine.',
        },
      ],
      pitfalls: [
        'Arguing from personal opinion without checking the requirement.',
        'Reopening the bug repeatedly without new information.',
        'Escalating to managers before talking to the PO.',
      ],
    },
    {
      id: 'mt-defects-iq-07',
      difficulty: 'expert',
      question: 'How would you measure whether our testing is effective? Which defect metrics would you use, and how can they mislead?',
      whatInterviewerLooksFor: [
        'Knows DRE, leakage, density and reopen rate with correct formulas',
        'Uses severity weighting and time windows',
        'Understands how metrics can be gamed or misread',
        'Connects metrics to concrete process decisions',
      ],
      modelAnswer: `I would use a small set of metrics, each tied to a decision.

**1. Defect Removal Efficiency (DRE)** = defects found before release ÷ (before + after release) × 100, using a fixed post-release window such as 30 days. Example: 195 found in QA and UAT, 5 in production → 97.5%. It answers "how much do we catch before customers do?"

**2. Leakage per stage**, for example QA → UAT and QA → production, **weighted by severity**. One critical escape matters more than ten cosmetic ones, so I report critical escapes separately.

**3. Defect density by module** (defects per KLOC or per story point). It shows hotspots: if Payments has 11 defects per KLOC and everything else has 3, that is where regression and code review should go.

**4. Reopen rate** = reopened ÷ fixed. A high rate points to rushed fixes, unclear reports or missing unit tests.

**5. RCA categories of escapes:** requirement, design, code, environment, test gap. This tells us *what kind* of improvement to make.

**How they mislead:**
- **Goodhart's law:** if "bugs found per tester" becomes a target, people split bugs and stop pairing with developers.
- **A low defect count is ambiguous:** it may mean good quality or weak testing. Always read it together with leakage.
- **DRE is late:** it is known only weeks after release. So I pair it with early signals, such as requirement coverage and automated-test pass trends.
- **Different formulas:** leakage can be calculated against QA defects or against total defects. I always state the formula and window so numbers are comparable across releases.

**The point** is trends and decisions: "critical escapes went from 3 to 1 after we added API contract tests". Metrics should never be used to rank individual testers.`,
      followUps: [
        {
          q: 'Our DRE is 99% but customers keep complaining. How is that possible?',
          a: 'Several ways. Production bugs may not be logged (support tickets never become bugs). The window may be too short. Complaints may be about usability or speed that nobody counts as defects. Or the few escapes are severe. I would match support tickets to the bug tracker, weigh escapes by severity, and read the complaints.',
        },
        {
          q: 'How would you collect these metrics in Jira?',
          a: 'Add a "Found in" field (QA, UAT, Production) or a prod-escape label. Use Affects Version and Fix Version for releases, and make the severity field mandatory. Saved JQL filters then feed the dashboard: counts by phase for leakage and DRE, by component for density, and "status changed to Reopened" for reopen rate.',
        },
      ],
      pitfalls: [
        'Using bug count per tester as a performance measure.',
        'Quoting formulas without a time window or severity weighting.',
        'Treating a low defect count as proof of quality.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-defects-drill-1',
      question:
        'An e-commerce app has a big sale in one week. Give severity (Critical/Major/Minor/Trivial) and priority (P1–P4) for five bugs. (a) UPI payment times out for all users. (b) The "Contact us" footer has a misaligned icon. (c) The admin GST report crashes for date ranges over one year; finance uses it once a year, and monthly export works. (d) The home-page sale banner says "50% of" instead of "50% off". (e) After logout and login, the wishlist count shows 0 until the page is refreshed.',
      assumptions: [
        'Severity = impact on the system or user; priority = urgency given the upcoming sale.',
        'About 40% of orders are paid by UPI.',
        'Scales: P1 fix now, P2 this release, P3 next release, P4 when convenient.',
      ],
      steps: [
        { label: '(a) UPI timeout', calc: 'Core payment path fails for 40% of orders, no workaround for UPI users → Critical / P1' },
        { label: '(b) Footer icon', calc: 'Cosmetic, low-traffic page → Trivial / P4' },
        { label: '(c) GST report crash', calc: 'A crash is high impact, but rare use and a workaround exists → Major / P3 (deferred, known issue)' },
        { label: '(d) Banner typo', calc: 'No functional impact → Trivial, but highly visible to every visitor during the sale → P1 or P2' },
        { label: '(e) Wishlist count', calc: 'Wrong data shown, self-corrects on refresh, no data loss → Minor / P3' },
      ],
      answer: `| Bug | Severity | Priority | Why |
|---|---|---|---|
| (a) UPI timeout | Critical | P1 | Revenue blocked for a large share of users, no workaround |
| (b) Footer icon | Trivial | P4 | Cosmetic, rarely seen |
| (c) GST report crash | Major | P3 | Severe but rare, workaround exists |
| (d) "50% of" banner | Trivial | P1/P2 | Every visitor sees it during the sale; brand impact |
| (e) Wishlist count | Minor | P3 | Wrong count, fixes itself on refresh |`,
      insight:
        'Bugs (c) and (d) are the interview gold: high severity with low priority, and low severity with high priority. The context ("one week before a sale") changed the priorities but not the severities.',
      followUps: [
        {
          q: 'Finance says the GST report is due next week. Does anything change?',
          a: 'The priority of (c) rises, maybe to P2 or P1. The deadline is now close, and merging monthly exports by hand is risky for a tax filing. The severity stays Major. Priority follows business context; severity follows impact.',
        },
      ],
    },
    {
      id: 'mt-defects-drill-2',
      question:
        'Release 5.0 data: QA found 240 defects, UAT found 24, production found 16 in the first 30 days. The release changed 64 KLOC. Of 200 defects fixed, 18 were reopened. Calculate DRE, leakage QA → UAT, leakage to production, defect density, and reopen rate.',
      assumptions: [
        'DRE counts QA + UAT as pre-release.',
        'Leakage QA → UAT = UAT defects ÷ QA defects.',
        'Leakage to production = production defects ÷ all pre-release defects.',
        'Density uses total defects (all phases) per KLOC changed.',
      ],
      steps: [
        { label: 'Totals', calc: 'Pre-release = 240 + 24 = 264; all = 264 + 16 = 280' },
        { label: 'DRE', calc: '264 ÷ 280 × 100 = 94.3%' },
        { label: 'Leakage QA → UAT', calc: '24 ÷ 240 × 100 = 10.0%' },
        { label: 'Leakage to production', calc: '16 ÷ 264 × 100 = 6.1% (or 16 ÷ 280 = 5.7% if your team divides by the total)' },
        { label: 'Density', calc: '280 ÷ 64 = 4.4 defects per KLOC' },
        { label: 'Reopen rate', calc: '18 ÷ 200 × 100 = 9.0%' },
      ],
      answer: `- **DRE:** 94.3%
- **Leakage QA → UAT:** 10.0%
- **Leakage to production:** about 6.1% (5.7% with the total as denominator)
- **Defect density:** 4.4 per KLOC
- **Reopen rate:** 9.0%

Compared with release 3.4 (DRE 97.5%, production leakage 2.6%), this release let more defects escape. Next step: break the 16 production defects down by severity and RCA category.`,
      insight:
        'Numbers help only when you compare releases and split by severity and root cause. "DRE fell from 97.5% to 94.3%" starts a talk. "8 of the 16 escapes were requirement gaps in the new loyalty module" tells you what to fix.',
      followUps: [
        {
          q: 'Production found 16 defects, but 10 were trivial UI issues. How do you report this fairly?',
          a: 'Report the raw DRE, then a severity-weighted view: for example "critical/major escapes: 2 of 16". Also check whether those trivial issues were known and deferred, since deferred known issues are a conscious business decision rather than escapes. Transparency about the formula keeps the metric trustworthy.',
        },
      ],
    },
    {
      id: 'mt-defects-drill-3',
      question:
        'Production incident: some customers see a delivery date one day early at checkout. Facts: the server calculates dates in UTC. India users ordering between 00:00 and 05:30 IST are affected. The feature was tested only in office hours. The story said "show delivery date" with no timezone rule. Run a 5-whys RCA and suggest actions.',
      assumptions: [
        'Blameless RCA: stop at causes the team can change.',
        'Look for both "why introduced" and "why not caught".',
        'Classify each root cause (requirement, design, code, data, environment, test gap).',
      ],
      steps: [
        { label: 'Why 1', calc: 'Wrong date shown → the server computed the date using the UTC calendar day, not the customer\'s local day' },
        { label: 'Why 2', calc: 'Between 00:00 and 05:30 IST it is still the previous day in UTC → off by one day' },
        { label: 'Why 3', calc: 'The code used server time because no timezone rule was specified (story: "show delivery date")' },
        { label: 'Why 4 (escape)', calc: 'Tests ran only during office hours, when IST and UTC share the same date, and no test controlled the clock' },
        { label: 'Why 5 (process)', calc: 'Our story template and test checklist have no item for timezone/date boundaries' },
        { label: 'Classify', calc: 'Requirement gap (no timezone rule) + test gap (no time-boundary tests); code followed the incomplete spec' },
      ],
      answer: `**Root causes:** (1) requirement gap: the story did not define which timezone the date is calculated in; (2) test gap: no boundary tests on time of day / date change.

**Actions:**
- Fix: calculate the delivery date in the customer's timezone (or the warehouse's, as the PO decides), and document the rule in the story.
- Tests: BVA on time of day (23:59, 00:00, 05:29, 05:30, 05:31 IST) using a controllable clock (server test hook; in Playwright, page.clock for browser-side dates).
- Process: add "timezone and date-boundary rules" to the acceptance criteria template and the QA checklist.
- Metrics: label the bug prod-escape, RCA category "requirement gap".`,
      insight:
        'It looked like a code bug. The 5 whys found a missing requirement, and a test that always ran at the same time of day, so it never hit the boundary. Time is an input too, and BVA applies to it.',
      followUps: [
        {
          q: 'Why is "the developer forgot about timezones" not an acceptable root cause?',
          a: 'It blames a person and suggests no systemic fix; the next developer could make the same mistake. The process allowed a date feature to be specified, built and tested without a timezone rule or a time-boundary test. Fixing the template, checklist and test approach prevents the whole class of bug.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-defects-mcq-01',
      difficulty: 'easy',
      question: 'You retest a fixed bug on the new build and the exact same steps still fail. What should you do?',
      options: [
        'Reopen the bug with the build number and fresh evidence',
        'Log a new bug and close the old one',
        'Mark it Deferred until the next release',
        'Close it, since the developer has already worked on it',
      ],
      correct: [0],
      explanation:
        'If the same steps fail after a fix, the original defect is not fixed. So you reopen it with the build number and new evidence. A new bug would split one failure across two tickets. Deferring is a triage decision about scheduling, not a retest outcome. Closing a failing bug hides a known defect.',
      followUps: [
        {
          q: 'When would a new bug be the right choice instead?',
          a: 'When the original steps now pass but you find a different failure, even in the same area. Then you verify and close the original, log the new failure separately, and link them with "relates to".',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-02',
      difficulty: 'easy',
      question: 'The company logo on the home page is the old version, the day before a big rebranding launch. How would you classify it?',
      options: ['Low severity, high priority', 'High severity, high priority', 'High severity, low priority', 'Low severity, low priority'],
      correct: [0],
      explanation:
        'Nothing functional is broken, so the impact on the system is low (low severity). But the logo is seen by every visitor during a launch, so the business needs it fixed immediately (high priority). Treating it as high severity confuses visibility with impact; low priority ignores the business deadline.',
      followUps: [
        {
          q: 'Would the classification change one month after launch?',
          a: 'The severity stays low. The priority may still be fairly high because it is customer-facing branding, but without the launch deadline it might move from P1 to P2. Priority follows business context.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-03',
      difficulty: 'easy',
      question: 'Which bug report title is the most useful?',
      options: [
        'Cart: item count badge stays at 1 after removing the last item (standard_user)',
        'Cart is broken, please fix urgently',
        'Bug found in cart module during regression',
        'Issue with badge',
      ],
      correct: [0],
      explanation:
        'A good title says where (Cart), what fails (badge stays at 1) and when (after removing the last item, for this user). You can search it and understand it without opening the ticket. The others are vague, emotional, or describe the activity instead of the failure.',
      followUps: [
        {
          q: 'Why does the title matter so much?',
          a: 'Titles are what people see in triage lists, search results and duplicate checks. A specific title prevents duplicate reports and lets a lead estimate impact without opening the ticket.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-04',
      difficulty: 'medium',
      question: 'What is the biggest problem with this bug report?',
      code: {
        language: 'text',
        title: 'BUG-301',
        code: `Title: Login, search and checkout issues
Env:   QA, Chrome
Steps: 1. Login with valid user - slow (8 s)
       2. Search "shoes" - no results
       3. Checkout - total is wrong
Expected: everything works
Actual:   see above`,
      },
      options: [
        'It combines three separate problems in one report and has no specific expected results',
        'It is missing the developer\'s name',
        'It should be split into exactly two reports: functional and performance',
        'The environment should not be mentioned in a bug report',
      ],
      correct: [0],
      explanation:
        'Three separate failures (slow login, empty search, wrong total) sit in one ticket. They cannot be fixed, verified or closed one by one. "Everything works" is not a measurable expected result. The developer is assigned during triage, not by the reporter. Splitting into two reports still mixes problems, and the environment is a required field.',
      followUps: [
        {
          q: 'How would you write the expected result for the checkout total?',
          a: 'With exact numbers and a source: "Subtotal 1,500.00 + tax 270.00 (18% GST per story SHOP-55) = total 1,770.00; actual total shown: 1,500.00." A precise expected result lets the developer see the difference immediately.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-05',
      difficulty: 'medium',
      question: 'Calculate the Defect Removal Efficiency for this release.',
      code: {
        language: 'text',
        title: 'Release 2.1 defect counts',
        code: `Found during system testing:   150
Found during UAT:               30
Found in production (60 days):  20`,
      },
      options: ['90%', '83.3%', '75%', '86.7%'],
      correct: [0],
      explanation:
        'DRE = pre-release defects ÷ all defects × 100 = (150 + 30) ÷ 200 × 100 = 90%. 83.3% wrongly treats UAT defects as escapes (150 ÷ 180). 75% divides system-test defects by the total (150 ÷ 200), ignoring UAT. 86.7% is 1 − 20 ÷ 150, mixing denominators.',
      followUps: [
        {
          q: 'What is the leakage to production by the "escaped ÷ caught before release" formula?',
          a: '20 ÷ 180 × 100 ≈ 11.1%. With the total as the denominator it is 20 ÷ 200 = 10%. State which formula you use so numbers stay comparable between releases.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-06',
      difficulty: 'medium',
      question: 'A payment-failure ticket you filed comes back labelled "Need info: no repro on dev env". Select ALL appropriate actions.',
      options: [
        'Confirm the build, environment and test data match on both sides',
        'Attach a screen recording, console errors and the failing request (HAR) with timestamps',
        'Offer to reproduce it together over a screen-share',
        'Close the bug immediately to keep the backlog clean',
        'Raise its severity to Critical so it gets attention',
      ],
      correct: [0, 1, 2],
      explanation:
        '"Cannot reproduce" usually means some condition differs, so you compare build, environment and data, add evidence the developer can investigate, and pair to reproduce. Closing it hides a possibly real defect. Inflating severity to get attention damages trust in your ratings and does not help anyone reproduce it.',
      followUps: [
        {
          q: 'Why are timestamps so useful in the report?',
          a: 'They let the developer find the matching entries in server logs and monitoring tools. Combined with a request or correlation ID from the error, a timestamp often leads straight to the exception that caused the failure.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-07',
      difficulty: 'medium',
      question: 'During triage, a valid bug is accepted but the team decides to fix it in the next release because of the code freeze. Which status fits?',
      options: ['Deferred', 'Rejected', 'Duplicate', 'Not a bug'],
      correct: [0],
      explanation:
        'Deferred (Postponed) is for valid defects whose fix is scheduled for a later release. Rejected and Not a bug mean the team decided it is not a defect at all. Duplicate means the same problem is already logged.',
      followUps: [
        {
          q: 'What should QA make sure of when a bug is deferred?',
          a: 'That it has a target release or a place in the backlog. Also that the risk is visible, for example in the release notes or known-issues list, so support is not surprised.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL statements that are correct about severity and priority.',
      options: [
        'Severity describes the impact of a defect; priority describes the urgency of fixing it',
        'Priority is usually set by the product owner or during triage',
        'A crash is always top priority',
        'The priority of a defect can change without its severity changing',
        'Severity and priority must always have the same level',
      ],
      correct: [0, 1, 3],
      explanation:
        'Severity is about impact; priority is about urgency. The PO or triage usually owns priority. Priority moves with business context (a deadline, a big client) while the impact stays the same. A crash in a rarely used tool with a workaround can be low priority. The two scales are independent.',
      followUps: [
        {
          q: 'Give an example of priority changing while severity stays the same.',
          a: 'A Major bug in the annual tax report starts as P3 because nobody uses the report for months. Two weeks before the filing deadline, the PO raises it to P1. The impact is unchanged; the business urgency is not.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-09',
      difficulty: 'medium',
      question: 'Which piece of evidence best tells you whether a wrong price on the cart page is a frontend or a backend bug?',
      options: [
        'The network response of the cart API, compared with what the page displays',
        'A full-page screenshot of the cart',
        'The CPU usage of the browser while the cart loads',
        'A second screenshot taken in another browser',
      ],
      correct: [0],
      explanation:
        'If the API response already has the wrong price, the backend is wrong. If the API is right but the page shows something else, the frontend is wrong. Screenshots prove the symptom but not where it comes from. CPU usage has nothing to do with a calculation error.',
      followUps: [
        {
          q: 'How do you capture that evidence?',
          a: 'Open DevTools → Network and filter for the cart request. Copy the response JSON (or export a HAR). Quote the field in the bug, for example "API returns total 1,770.00, page shows 1,500.00".',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL valid conclusions from these metrics.',
      code: {
        language: 'text',
        title: 'Quarter metrics by module',
        code: `Module     KLOC  Defects  Reopened  Fixed  Prod escapes
Payments     8      88       14       80          4
Catalog     20      60        3       58          0
Profile     12      24        1       24          1`,
      },
      options: [
        'Payments has the highest defect density (11 per KLOC)',
        'Payments has the highest reopen rate (17.5%)',
        'Catalog has the worst code quality because it has the most code',
        'Profile has no quality problems because it has the fewest defects',
        'Catalog\'s density is 3 per KLOC',
      ],
      correct: [0, 1, 4],
      explanation:
        'Density: Payments 88 ÷ 8 = 11, Catalog 60 ÷ 20 = 3, Profile 24 ÷ 12 = 2. Reopen rate: Payments 14 ÷ 80 = 17.5%, far higher than Catalog (about 5%) or Profile (about 4%). More code does not mean worse quality, which is why we normalise by KLOC. A low count does not prove quality: Profile still had a production escape.',
      followUps: [
        {
          q: 'What actions would these numbers suggest for Payments?',
          a: 'Spend more regression and exploratory time on Payments. Add API tests for its rules. Run an RCA on the 4 production escapes. Find out why 17.5% of fixes are reopened: unclear requirements, missing unit tests, or rushed fixes. Review this with the developers, not as blame.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-11',
      difficulty: 'hard',
      question: 'A team rewards testers by number of bugs logged. Select ALL likely side effects.',
      options: [
        'One root problem gets split into many small bug reports',
        'Testers avoid pairing with developers to fix issues informally',
        'Defect leakage to production automatically decreases',
        'Developer–tester relationships become more adversarial',
        'Severity ratings become more accurate',
      ],
      correct: [0, 1, 3],
      explanation:
        'When a count becomes a target, people optimise the count (Goodhart\'s law): bugs get split, quick conversations that fix issues without a ticket disappear, and developers start seeing testers as opponents. Nothing in the incentive improves what escapes to production, and severity accuracy tends to get worse, not better.',
      followUps: [
        {
          q: 'What would you measure instead to reflect a tester\'s contribution?',
          a: 'Team-level outcomes such as leakage and critical escapes, plus qualitative signals: clarity of bug reports (low rejection and reopen rates), early involvement in refinement, and risk coverage. Individual bug counts are a poor proxy for value.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-12',
      difficulty: 'hard',
      question: 'Which 5-whys conclusion is a proper root cause?',
      code: {
        language: 'text',
        title: 'Incident: coupon applied twice at checkout',
        code: `Why 1: Discount was applied twice -> two apply-coupon calls
Why 2: Two calls -> user pressed Enter and clicked Apply
Why 3: Both handlers call the API; no guard against repeats
Why 4: API accepts the same coupon twice for one cart
Why 5: ?`,
      },
      options: [
        'No requirement or test covered repeated or concurrent coupon submissions, and the API has no idempotency rule',
        'The developer was careless and should be more careful',
        'The user should not press Enter and click at the same time',
        'QA did not do enough regression testing in general',
      ],
      correct: [0],
      explanation:
        'A useful root cause points to a process or design gap the team can fix: missing acceptance criteria and tests for repeated submissions, plus a missing server-side rule. Blaming a careless developer or the user changes nothing systemic. "Not enough regression" is too vague to act on.',
      followUps: [
        {
          q: 'Which tests would you add after this RCA?',
          a: 'An API test that applies the same coupon twice to one cart and expects the second call to be rejected or ignored. A UI test that presses Enter and clicks Apply together, and checks the discount appears once. Then add "repeat submission" to the checklist for every form that changes data.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-13',
      difficulty: 'hard',
      question: 'Your Jira dashboard shows 40 "unresolved" bugs, but the board shows only 25 open. Bugs moved to the Done status are still counted. What is the most likely cause?',
      options: [
        'The workflow transition to Done does not set a Resolution, so filters using resolution = Unresolved still match those bugs',
        'Jira only counts bugs with Highest priority as resolved',
        'The board and the dashboard are using different time zones',
        'Closed bugs must be deleted before Jira stops counting them',
      ],
      correct: [0],
      explanation:
        'In Jira, Status and Resolution are separate fields. If the move to Done does not set a Resolution (Done, Won\'t Do, Duplicate, Cannot Reproduce), the issue stays "Unresolved" in JQL filters and gadgets. Priority does not affect resolution, time zones do not change counts like this, and deleting issues destroys history.',
      followUps: [
        {
          q: 'How would you find the affected bugs with JQL?',
          a: 'Something like: project = SHOP AND issuetype = Bug AND status = Done AND resolution = Unresolved. Then fix the workflow (add a resolution screen or post-function on the Done transition) and bulk-edit the existing issues.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-14',
      difficulty: 'expert',
      question: 'Select ALL statements that are true about this retest situation.',
      code: {
        language: 'text',
        title: 'BUG-742 history',
        code: `Bug:     Coupon SAVE15 not applied to sale items
Fixed in build 2.9.3
Retest on QA env, footer shows build 2.9.2
  - single sale item: coupon NOT applied (same as before)
  - other coupons: not tested`,
      },
      options: [
        'The retest is not valid, because the fix is not deployed on the build tested',
        'The bug should be reopened right away as the fix clearly failed',
        'After retesting on 2.9.3, regression around other coupon types is still needed before closing',
        'The developer should close the bug since the fix was merged',
        'Checking the build number before retesting would have avoided this confusion',
      ],
      correct: [0, 2, 4],
      explanation:
        'The fix is in 2.9.3 but the environment runs 2.9.2, so the failure proves nothing about the fix, and reopening would be a false alarm. Checking the build before retesting prevents this common mistake. Once retested on the right build, the tester should also regression-test related coupon behaviour before closing. Developers mark bugs fixed; the tester verifies and closes.',
      followUps: [
        {
          q: 'How can a team stop retests on the wrong build from happening?',
          a: 'Show the build number in the app (footer or a /version endpoint). Let CI post the deployed build on the Jira ticket. Move a bug to "Ready for QA" only when the fix is really on the QA environment, ideally automatically from the deploy pipeline.',
        },
      ],
    },
    {
      id: 'mt-defects-mcq-15',
      difficulty: 'expert',
      question: 'Release A: DRE 98%, but 2 of its 4 production escapes were Critical. Release B: DRE 93%, and all 12 escapes were Trivial UI issues. Which conclusion is best supported?',
      options: [
        'DRE alone cannot rank the releases; Release A had the more serious escapes, so severity-weighted leakage should be reported alongside DRE',
        'Release A was tested better because its DRE is higher',
        'Release B was tested better because it had no Critical bugs in testing',
        'Both releases had equally effective testing because the DRE values are above 90%',
      ],
      correct: [0],
      explanation:
        'DRE counts every defect equally, so a release with a higher DRE can still have let through the most damaging bugs. Release A\'s two Critical escapes likely caused more customer harm than twelve trivial UI issues. The claim about Release B\'s testing-phase bugs is not in the data, and a 90% threshold says nothing about severity.',
      followUps: [
        {
          q: 'How would you present this to management?',
          a: 'Show DRE plus escapes by severity for both releases, then the RCA categories of the Critical escapes in Release A and the actions taken. The message is "fewer escapes is good, but we must stop the critical ones", backed by a specific improvement plan.',
        },
      ],
    },
  ],
};

export default topic;
