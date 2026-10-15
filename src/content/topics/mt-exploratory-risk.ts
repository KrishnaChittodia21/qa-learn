import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-exploratory-risk',
  phase: 'manual-advanced',
  order: 3,
  title: 'Exploratory Testing & Risk-Based Testing',
  subtitle:
    'Charters, session-based test management, SFDIPOT, FEW HICCUPPS, Whittaker tours, and ranking risks by likelihood × impact so you test the right things first.',
  estimatedMinutes: 90,
  sources: [
    'James Bach & Michael Bolton — Exploratory Testing 3.0 and Testing and Checking Refined (satisfice.com blog)',
    'James Bach — Heuristic Test Strategy Model v6.3 (satisfice.com): SFDIPOT product factors',
    'Jonathan Bach — Session-Based Test Management, STQE magazine (Nov 2000): sessions, session sheet, TBS metrics, PROOF debrief',
    'Michael Bolton — FEW HICCUPPS (developsense.com blog, 2012)',
    'Xray blog — How to use test charters for effective exploratory testing (template adapted from Hendrickson and Pyhäjärvi)',
    'Elisabeth Hendrickson — Explore It! (Pragmatic Bookshelf, 2013), charter structure via the O\'Reilly book summary and ISTQB references',
    'Software Testing Help — Exploratory testing tours (summary of James Whittaker, Exploratory Software Testing, 2009)',
    'ISTQB CTFL v4.0.1 syllabus (istqb.org) — 4.4.2 Exploratory Testing, 5.2 Risk Management (5.2.1–5.2.4), 5.3.2 test reports',
    'GeeksforGeeks — Quality Engineering Analyst interview experience at Infosys (2025)',
  ],
  tags: ['exploratory-testing', 'charters', 'sbtm', 'heuristics', 'sfdipot', 'oracles', 'few-hiccupps', 'tours', 'risk-based-testing', 'risk-matrix', 'prioritisation'],
  cheatSheet: [
    'Exploratory testing = learning, test design and test execution at the same time, steered by what you just saw. It has structure (charter, timebox, notes, debrief); it is not random.',
    'Ad hoc = unplanned, usually no notes. Monkey = random input (dumb or smart). Exploratory = has a charter, a time box and a report.',
    'Hendrickson charter: Explore <target> with <resources> to discover <information>. One charter ≈ one session (Jon Bach: normal ≈ 90 min, short ≈ 45, long ≈ 2 h).',
    'SBTM session sheet: charter, tester, start + duration, % on charter vs opportunity, TBS split (Test design/execution, Bug investigation, Setup), notes, bugs, issues, data files. Debrief with PROOF: Past, Results, Obstacles, Outlook, Feelings.',
    'SFDIPOT (product factors): Structure, Function, Data, Interfaces, Platform, Operations, Time. Use it to generate test ideas and spot coverage gaps.',
    'Quick idea heuristics: CRUD (create/read/update/delete), Goldilocks (too small / too big / just right), Zero-One-Many, Beginning-Middle-End, interrupt it, undo it, repeat it, do it in parallel.',
    'Oracle = how you recognise a problem. FEW HICCUPPS: Familiarity (with known problems), Explainability, World, History, Image, Comparable products, Claims, User desires, Product (self-consistency), Purpose, Statutes/standards.',
    'Whittaker tours: Money (what marketing sells), Landmark (hop between key features), Intellectual (hardest inputs), FedEx (follow data end to end). Also Garbage Collector (visit every screen), Saboteur (take away resources), Bad Neighbourhood (buggy areas).',
    'Risk level = likelihood × impact (e.g. 1–5 each → score 1–25). Higher score → test earlier, deeper, with more techniques and more people.',
    'Product risk = the software may be wrong (double charge, data loss). Project risk = the project may slip (late build, no test env, sick tester). Testing reduces product risk; managers handle project risk.',
    'Short on time? Smoke test, then rank by risk. Test money paths and recent changes first, then explore top-risk areas. Report what you did NOT test as residual risk.',
    'Interview line: "Scripted tests check what we already know; exploratory testing finds what we did not think to ask. I use both, and risk decides the mix."',
  ],
  sections: [
    {
      heading: 'What exploratory testing really is',
      body: `**Exploratory testing** means you design, run and judge tests at the same time, while you learn the app. What you see now decides your next test.

**Intuition:** scripted testing is following a recipe. Exploratory testing is a chef who tastes while cooking and changes the next step.

**The ISTQB view (CTFL v4.0, 4.4.2):** tests are *designed, executed and evaluated at the same time, while the tester learns about the test object*. It is an experience-based technique. It helps most when:
- specs are few or weak;
- time is short;
- you want to add to formal techniques.
ISTQB adds that you can structure it with session-based testing (time box, charter, debrief, session sheet).

**Bach and Bolton** (*Exploratory Testing 3.0*) go further. In Rapid Software Testing, **all** testing is exploratory. Scripting is a set of controls you add in different amounts (a "formality continuum"), not a separate kind of testing.

| Aspect | Scripted testing | Exploratory testing | Ad hoc testing |
|---|---|---|---|
| Test design | Written before running | Designed while running | None, or only in the head |
| Guidance | Step-by-step test case | Charter + heuristics + timebox | Whatever comes to mind |
| Records | Pass/fail per step | Session notes, bugs, questions, coverage | Usually only bugs |
| Strong at | Regression, compliance, repeating | New features, unclear specs, surprises | Quick poke |
| Weak at | Finding the unexpected | Exact repeating | Coverage and accountability |
| Automatable? | Yes (good Playwright candidates) | No, but its findings become checks | No |

**Example:** feature "Apply coupon at checkout".
- The scripted case: enter SAVE10, click Apply, expect total −10%. It passes.
- While exploring, you notice the discount changes when quantity changes. So you try: apply the coupon, remove the item, add it back.
- Result: the discount is applied **twice**. No script asked that question. Your observation did.

**In an interview, say:** "Exploratory testing is not random clicking. I run time-boxed sessions with a charter, take notes, log bugs and debrief. It adds to scripted and automated checks; it does not replace them."`,
      keyPoints: [
        'Learning, design and execution happen together and feed each other.',
        'Structure comes from charter, timebox, heuristics, notes and debrief.',
        'Exploration finds new information; scripts and automation confirm known expectations.',
      ],
      source: 'James Bach & Michael Bolton — Exploratory Testing 3.0 (satisfice.com); ISTQB CTFL v4.0 — 4.4.2 Exploratory Testing',
    },
    {
      heading: 'Writing test charters',
      body: `A **test charter** is a one-line mission for one exploring session. It says where to go and what to look for, but not every step.

**Hendrickson template (Explore It!):**

> **Explore** <target: a feature, area or flow>
> **with** <resources: tools, data, techniques, personas>
> **to discover** <information: what kind of problems you want to find>

A good charter is **small enough to finish in one session** (about 90 minutes) and **wide enough to allow surprises**.

**Example:** three charters for a coupon feature.

| Charter quality | Example | Problem |
|---|---|---|
| Too broad | Explore checkout | No target risk, no resources, never "done" |
| Too narrow | Enter SAVE10 and verify 10% off | That is a test case, not a charter |
| Good | Explore coupon application with expired, stacked and lowercase codes to discover pricing and validation errors | Clear target, resources and goal |

**Where charters come from:** risk lists, new user stories, recent bug clusters, support tickets, ideas you parked in another session ("opportunity" notes), and SFDIPOT (later section).

**Common mistake:** one giant charter for a whole release. Split it into a charter **backlog**, rank it by risk, and start from the top (see the backlog below).`,
      code: [
        {
          language: 'text',
          title: 'A charter backlog for a coupon feature (ranked by risk)',
          code: `CHARTER BACKLOG — Checkout coupons (sprint 14)

#1  Explore coupon application
    with expired, future-dated, lowercase and stacked codes
    to discover pricing and validation errors.            Risk: HIGH

#2  Explore order total recalculation
    with quantity changes, item removal and re-adding after a coupon
    to discover double or lost discounts.                 Risk: HIGH

#3  Explore the coupon API (POST /cart/coupon)
    with Postman: replayed requests, missing auth, huge payloads
    to discover server-side validation gaps.              Risk: MEDIUM

#4  Explore coupon UI on mobile Safari and Android Chrome
    with zoom 200% and a screen reader
    to discover layout and accessibility problems.        Risk: MEDIUM

#5  Explore coupon messages and copy
    with the marketing spec and the UK/US locales
    to discover inconsistent or misleading text.          Risk: LOW`,
        },
      ],
      keyPoints: [
        'Explore <target> with <resources> to discover <information>.',
        'One charter ≈ one session; keep a ranked charter backlog.',
        'New ideas found mid-session become new charters, not detours.',
      ],
      source: 'Elisabeth Hendrickson — Explore It! (2013); Xray blog — test charters template',
    },
    {
      heading: 'Session-based test management (SBTM)',
      body: `**Session-based test management (SBTM)** runs exploratory testing in fixed, chartered time blocks called **sessions**, each with notes and a short review. James and Jonathan Bach created it; Jon Bach described it in a 2000 STQE article.

Why it matters: testers keep their freedom inside a session. Managers get numbers around it.

**A session** is one uninterrupted block of testing on one charter. In Jon Bach's team:
- A **normal** session ≈ **90 minutes**.
- A **short** session ≈ **45 minutes**.
- A **long** session ≈ **2 hours** (120 minutes).
- A tester did about **three sessions** on a typical day.
Each session ends with a **session sheet** and a short **debrief** with a lead.

**Session sheet fields**
- Charter, tester, date, start time, duration.
- **Charter vs opportunity:** time on the mission vs time on a useful side-path.
- **TBS metrics:** % of time on **T**est design and execution, **B**ug investigation and reporting, **S**ession setup (env, data, tools).
- Test notes, bugs (with IDs), issues (questions, blockers, risks), data files used.

**Debrief with PROOF:**
- **P**ast: what happened?
- **R**esults: what did you find?
- **O**bstacles: what got in the way?
- **O**utlook: what is left to do?
- **F**eelings: how confident are you?

**Example:** a 90-minute session on coupon totals (full sheet below).
TBS = Test 60%, Bug 30%, Setup 10%. Bug 30% is high, so the area is buggy: plan more sessions there.

**Reading the metrics:** high Setup % = environment trouble (raise a project risk). High Bug % = buggy area. Low "on charter" % = the charter was wrong or the product surprised you. All are useful signals.`,
      diagram: `  charter backlog          session (90 min, one charter)          debrief
 +----------------+      +--------------------------------+     +-----------+
 | #1 coupons HIGH|----->| setup | test & explore | bugs  |---->|  PROOF     |
 | #2 totals HIGH |      |  10%  |      65%       |  25%  |     | Past       |
 | #3 API    MED  |      +--------------------------------+     | Results    |
 | ...            |<-----  new charter ideas ("opportunity")    | Obstacles  |
 +----------------+                                             | Outlook    |
          ^                                                     | Feelings   |
          +------------------ re-rank by risk ------------------+-----------+`,
      code: [
        {
          language: 'text',
          title: 'A completed SBTM session sheet',
          code: `SESSION: ET-2025-11-04-AR-02
CHARTER: Explore order total recalculation with quantity changes,
         item removal and re-adding after a coupon to discover
         double or lost discounts.
TESTER: A. Rao        START: 14:00     DURATION: normal (90 min)
CHARTER vs OPPORTUNITY: 80 / 20
TASK BREAKDOWN (TBS): Test 60% | Bug investigation 30% | Setup 10%
DATA FILES: coupons_test.csv (SAVE10, EXP2024, FREESHIP)

TEST NOTES
- Applied SAVE10 to 1, 2 and 5 items; total correct each time.
- Changed qty 2 -> 0 -> 2 via stepper: discount kept, correct.
- Removed item, re-added from inventory: discount applied TWICE.
- Opportunity: coupon survives logout/login? (yes, by design?)

BUGS
- BUG-812 Discount applied twice after remove + re-add (High)

ISSUES / QUESTIONS
- Should a coupon persist across sessions? Ask PO.
- Staging tax service down 14:40-14:50 (setup time).`,
        },
      ],
      keyPoints: [
        'Session = one charter, one timebox, one sheet, one debrief.',
        'TBS and charter/opportunity percentages turn exploration into reportable data.',
        'PROOF keeps debriefs short and focused.',
      ],
      source: 'Jonathan Bach — Session-Based Test Management (STQE, Nov 2000); ISTQB CTFL v4.0 — 4.4.2',
    },
    {
      heading: 'SFDIPOT: product factors for test ideas',
      body: `**SFDIPOT** ("San Francisco Depot") is a checklist of seven *places to look* for test ideas. It comes from James Bach's Heuristic Test Strategy Model. Older material says SFDPOT; the current model added **Interfaces**.

Why it matters: when you "don't know what to test next", it stops you testing only the happy path.

**Example:** SFDIPOT ideas for "apply a coupon at checkout".

| Factor | Ask yourself | Coupon-at-checkout ideas |
|---|---|---|
| **S**tructure | What is it made of? Code, files, services, DB tables | Which service owns the discount? Is it cached in the cart service? |
| **F**unction | What does it do? Every feature and error path | Apply, replace, remove a coupon; error messages for invalid codes |
| **D**ata | What does it process? Inputs, outputs, stored state | Empty, 1 char, 50 chars, emoji, lowercase, leading space, SQL-like text |
| **I**nterfaces | How does it connect? UI, API, imports/exports | Same coupon via API vs UI; response codes; order export to ERP |
| **P**latform | What does it depend on? Browser, OS, device, 3rd party | Safari vs Chrome, mobile keyboard, payment gateway sandbox |
| **O**perations | How will it be used? Users, environments, patterns | Shopper with 50 items, returning user, two tabs open, slow 3G |
| **T**ime | How does time affect it? Timeouts, dates, concurrency | Coupon expiring at midnight, timezone, session timeout mid-checkout |

**How to use it:**
1. Spend 5 minutes writing two or three ideas per factor.
2. Circle the risky ones and turn them into charters.
3. After testing, go through it again as a **coverage check**: "Did we touch Platform at all?"

**In an interview, say:** "With weak requirements, I use SFDIPOT. It makes my ideas cover structure, function, data, interfaces, platform, operations and time, not just the happy path."

**Common mistake:** forgetting Time and Operations. Coupons that expire at midnight are a classic bug.`,
      keyPoints: [
        'SFDIPOT = Structure, Function, Data, Interfaces, Platform, Operations, Time.',
        'It generates ideas and also exposes coverage gaps afterwards.',
        'Time and Operations are the factors juniors most often forget.',
      ],
      source: 'James Bach — Heuristic Test Strategy Model (satisfice.com)',
    },
    {
      heading: 'Quick heuristics: CRUD, Goldilocks, Zero-One-Many and friends',
      body: `A **heuristic** is a rule of thumb: fast, usually helpful, sometimes wrong. Elisabeth Hendrickson's *Test Heuristics Cheat Sheet* lists many. These are the ones interviewers expect you to name.

| Heuristic | Idea | Example (profile / address book / cart) |
|---|---|---|
| **CRUD** | Create, Read, Update, Delete each item, then check everywhere it appears | Add an address, see it at checkout, edit it, delete it while it is the default |
| **Goldilocks** | Too small, too big, just right | Name of 0, 1, 255 and 10,000 characters |
| **Zero, One, Many** | Lists behave differently at 0, 1 and many | Cart with 0 items (checkout disabled?), 1 item, 100 items (paging?) |
| **Beginning, Middle, End** | Position matters | Delete the first, middle and last address |
| **Some, None, All** | Selections | Select none / some / all orders for export |
| **Interruptions** | Stop it half way | Refresh, back button, network off, close tab during payment |
| **Undo / Repeat** | Reverse or repeat an action | Double-click Pay; remove and re-add an item; back after ordering |
| **Follow the data** | Trace one value end to end | Address typed in UI → API → DB → invoice PDF → email |

**Example:** Zero-One-Many on SauceDemo's cart.
- **0 items:** click Checkout. Does it let you pay for nothing? (A real bug in many shops.)
- **1 item:** normal flow works.
- **6 items** (all products): does the total add up, does the page scroll?

**In an interview, say:** "Zero-One-Many on the cart: what does checkout do with an empty cart?" Always pair the name with a real test idea.

**Link to automation:** good values found while exploring (Goldilocks lengths, cart sizes) later become parameterised Playwright tests.

**Common mistake:** listing heuristic names like trivia, with no test idea.`,
      keyPoints: [
        'Heuristics are fallible shortcuts for generating ideas, not guarantees.',
        'Always attach a heuristic to a concrete idea for the feature at hand.',
        'Interruptions, undo and repeat find many real-world state bugs.',
      ],
      source: 'Elisabeth Hendrickson — Explore It! and Test Heuristics Cheat Sheet',
    },
    {
      heading: 'Oracles: how you know it is a bug (FEW HICCUPPS)',
      body: `An **oracle** is any way you decide "this looks wrong". With a spec, the spec is one oracle. Without a spec, you still have many others. An oracle **suggests** a problem; it does not prove it (Bolton). So you investigate and explain.

**FEW HICCUPPS** is Michael Bolton's list of consistency oracles (developsense.com). You suspect a bug when the product is *inconsistent* with one of these, or *consistent* with a familiar problem.

**Example:** there is no spec for coupon codes. In v3.2, 50-character codes worked. In v3.3, codes over 20 characters are rejected. Oracle used: **History**. Your report says: "Inconsistent with History: v3.2 accepted 50-character codes (see TC-118)."

| Letter | Oracle | Example inconsistency you could report |
|---|---|---|
| F | **Familiarity** (with known problems) | Looks like the classic double-submit bug we had on the old payment page |
| E | **Explainability** | You cannot explain why the total is £0.01 higher than the sum |
| W | **World** | Delivery date shows 31 June |
| H | **History** | Last release allowed 50-char coupon codes; now 20 are rejected |
| I | **Image** | Error text "U R WRONG, try again!!" does not fit a bank brand |
| C | **Comparable products** | Every major shop keeps the cart after login; ours empties it |
| C | **Claims** | Marketing page says "free returns"; checkout charges a returns fee |
| U | **User desires** | Pressing Enter in the coupon box submits the whole order |
| P | **Product** (itself) | Dates are DD/MM on one screen, MM/DD on another |
| P | **Purpose** | A "quick reorder" button needs 6 clicks |
| S | **Statutes and standards** | Missing alt text breaks WCAG; card data in logs breaks PCI DSS |

**Name the oracle in your bug report.** It turns "I think this is wrong" into an argument a developer or PO can check.

**In an interview, say:** "No spec does not mean no oracle. I compare with the product itself, older versions, competitors, claims, user needs and standards. I say which one I used."

**Common mistake:** closing a bug as "no spec, so not a bug". The spec is only one oracle.`,
      keyPoints: [
        'An oracle is a way to recognise a problem; it is fallible.',
        'Naming the oracle makes your bug report persuasive.',
        'Specs are only one oracle among many.',
      ],
      source: 'Michael Bolton — FEW HICCUPPS (developsense.com, 2012)',
    },
    {
      heading: "Whittaker's tours",
      body: `**Tours** are themes for an exploring session. James Whittaker compares testing to being a tourist in a city. Each tour visits a different "district" and tends to find a different type of bug. Tours stop you walking the same streets every session.

| Tour (district) | How you explore | Typical bugs found |
|---|---|---|
| **Guidebook** (business) | Follow the user manual / help text exactly | Docs that no longer match behaviour |
| **Money** (business) | Exercise the features marketing and sales promise | Broken headline features, demo-killers |
| **Landmark** (business) | Pick key features and hop between them in different orders | Order-dependent state bugs |
| **Intellectual** (business) | Ask the hardest questions: max inputs, complex combos | Validation, overflow, performance |
| **FedEx** (business) | Follow one piece of data through every place it travels | Data lost or mangled between screens/services |
| **Garbage Collector** (business) | Visit every screen/menu item methodically, briefly | Dead links, missing pages, crashes on open |
| **Bad Neighbourhood** (historical) | Go where bugs clustered before | Regressions in fragile code |
| **Saboteur** (seedy) | Take away resources: network, disk, permissions | Poor error handling, hangs, data loss |
| **Antisocial** (seedy) | Do the opposite of what is expected: cancel, wrong inputs | Unhandled flows |
| **Couch Potato** (hotel) | Do as little as possible: accept every default, skip optional fields | Bad defaults, empty-field crashes |

**Example (food-delivery app):**
- **FedEx** tour: follow one delivery address from sign-up → saved addresses → checkout → confirmation email → rider app. Is it the same everywhere?
- **Saboteur** tour: turn on airplane mode right after tapping "Place order". Was the order created once, twice or not at all?

**In an interview, say:** "Explore checkout using the Saboteur tour to discover network-failure handling." A tour fits the "with" part of a charter.

**Tip:** you do not need all 20-plus tours. Know 4–5 well, each with the bug type it finds.`,
      keyPoints: [
        'Tours give each session a different viewpoint.',
        'Money, Landmark, FedEx, Saboteur and Bad Neighbourhood are the most quoted.',
        'A tour plugs into the "with <resources>" slot of a charter.',
      ],
      source: 'James Whittaker — Exploratory Software Testing (2009), via the Software Testing Help tours summary',
    },
    {
      heading: 'Ad hoc, monkey and gorilla testing compared',
      body: `These are the less structured cousins of exploratory testing. Interviewers ask about them to see if you know the difference.

| Type | What it is | When it helps | Main limitation |
|---|---|---|---|
| **Ad hoc** | Informal testing, no plan, no notes | 10-minute check of a hot-fix | No record of coverage; hard to repeat |
| **Monkey (dumb)** | Random inputs, no knowledge of the app | Hunting crashes | Few logic bugs; hard to reproduce |
| **Monkey (smart)** | Random inputs guided by a model of valid actions | Long-run stability, mobile apps (e.g. Android's UI/Application Exerciser Monkey) | Needs a model and logging |
| **Gorilla** | Hitting one module again and again, on purpose | Toughness of one critical function | Narrow by design |
| **Exploratory** | Charter, time box, heuristics, notes | New features, unclear specs, unknowns | Needs skilled testers and debriefs |

**Example:** the login page of a banking app.
- **Ad hoc:** you try a few wrong passwords for 5 minutes. No notes.
- **Monkey:** a tool taps random spots and types random text for an hour. It finds a crash on a 5,000-character username.
- **Gorilla:** you hit Login 200 times with the same wrong password. Does the account lock? Does the server slow down?
- **Exploratory:** "Explore login with wrong, locked and expired accounts to discover security and message problems." 90 minutes, with a session sheet.

**Tip:** when you test randomly, log the seed, inputs and time. A crash you cannot reproduce is a rumour.

**Error guessing** (guessing likely mistakes, e.g. divide by zero, empty strings) is a separate experience-based technique. In exploratory sessions it is one of your resources.

**In an interview, say:** "Ad hoc testing is unplanned and has no notes. Exploratory testing has a mission and session notes, so the team knows what was covered."`,
      keyPoints: [
        'Ad hoc ≠ exploratory: the difference is charter, timebox and notes.',
        'Monkey testing is random input; log seeds to reproduce.',
        'Gorilla testing hammers one module repeatedly.',
      ],
      source: 'ISTQB CTFL v4.0 — 4.4 Experience-based test techniques',
    },
    {
      heading: 'Risk-based testing: likelihood × impact',
      body: `**Risk-based testing** means you test first and deepest where failure is both *likely* and *painful*. You cannot test everything, so risk decides the order.

**Intuition:** a smoke detector goes in the kitchen before the cupboard.

**ISTQB CTFL v4.0 (5.2) words, in plain English**
- **Risk** (5.2.1): a potential event, hazard, threat or situation whose occurrence causes an adverse effect. Plain: something bad that *might* happen.
- **Risk level** = **risk likelihood** (how probable it is) combined with **risk impact** (how much harm it does). The **quantitative** way multiplies them (here 1–5 × 1–5). The **qualitative** way reads the level from a risk matrix.
- **Product risk** (5.2.2): the *software* may be bad. Missing or wrong functions, wrong calculations, runtime errors, slow response, poor user experience, security holes.
- **Project risk** (5.2.2): the *project* may go wrong. Organisational (late deliveries, bad estimates), people (skills, too few staff), technical (scope creep, poor tools), supplier (a third party fails).
- **Risk management** = risk analysis (identify + assess, 5.2.3) and risk control (mitigate + monitor, 5.2.4). Responses: mitigate by testing, accept, transfer, or have a contingency plan.

**Likelihood goes up with:** new or complex code, many changes, a new team or technology, a buggy history, many integrations.
**Impact goes up with:** money, legal rules, safety, data loss, number of users hit, reputation.

**Example:** two changes in a shop release, scored 1–5.
- Payment SDK upgrade: likelihood 3, impact 5 → **3 × 5 = 15 → High**. Test first, test deep.
- Footer link change: likelihood 2, impact 1 → **2 × 1 = 2 → Low**. A quick check is enough.

**How testing responds to the risk level:**

| Risk level | Score (1–25) | Test approach |
|---|---|---|
| High | 15–25 | Test first; formal techniques (BVA, decision tables) + exploratory sessions; review by 2 testers; automate in regression |
| Medium | 8–14 | Scripted key paths + one exploratory session |
| Low | 1–7 | Smoke-level check or test only if time allows; accept residual risk |

**In an interview, say:** "Risk level is likelihood times impact. It decides what I test first, how deep, and with which techniques."

**Common mistake:** treating risk as a one-time spreadsheet. New bugs, changes and information move items up or down every sprint.`,
      diagram: `            IMPACT -->
            1 minor   2       3       4       5 critical
 L   5    |   5   |  10   |  15   |  20   |  25   |
 I   4    |   4   |   8   |  12   |  16   |  20   |
 K   3    |   3   |   6   |   9   |  12   |  15   |
 E   2    |   2   |   4   |   6   |   8   |  10   |
 L   1    |   1   |   2   |   3   |   4   |   5   |
 Y        low 1-7       medium 8-14       high 15-25
          (smoke)   (key paths + 1 session)  (test first, deep)`,
      keyPoints: [
        'Risk level = likelihood × impact.',
        'Product risk is about quality; project risk is about delivery.',
        'Risk level decides order, depth and technique of testing, and is re-assessed continuously.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 5.2 Risk Management (5.2.1–5.2.4)',
    },
    {
      heading: 'Worked example: risk register for an e-commerce release',
      body: `A **risk register** is a table of risks, each with a likelihood, an impact, a score and a test approach.

**Example scenario:** a SauceDemo-like shop release has six changes: a new coupon engine, a redesigned product list, "save for later", a payment SDK upgrade, footer link changes, and sort-by-price. The team has 3 testers for 2 days.

**Step 1: find risks** with the team (dev, PO, tester). Use the change list, past bugs and SFDIPOT.
**Step 2: score** likelihood and impact 1–5, each person on their own first. Then discuss differences. They show hidden knowledge.
**Step 3: rank** and give each risk an approach and a share of effort.
**Step 4: report residual risk** (the risk left after testing): what was not tested, or tested lightly, and why.

**Look at the payment SDK upgrade.** It is a "small" code change, but impact is 5 (money, every customer). Small change does not mean low risk.

The full register is in the box below.`,
      code: [
        {
          language: 'text',
          title: 'Risk register (likelihood × impact, ranked)',
          code: `ID  Item / risk                          L  I  Score  Level  Approach                         Effort
R1  Payment SDK upgrade: double charge   3  5   15    HIGH   Scripted payment matrix + saboteur  25%
    or failed capture                                         session + automate happy path
R2  Coupon engine: wrong discount        4  4   16    HIGH   Decision table + 2 ET sessions      25%
    (stacking, expiry, rounding)                              (charters #1, #2)
R3  Sort by price: wrong order           3  3    9    MED    BVA on prices, 1 ET session          15%
    (decimals, currency, ties)
R4  Save for later: item lost on login   3  3    9    MED    CRUD + login/logout exploration      15%
R5  Product listing redesign: layout     4  2    8    MED    Cross-browser pass (Chromium,        15%
    breaks on mobile                                          WebKit, Firefox), visual check
R6  Footer links change                  2  1    2    LOW    Garbage-collector tour, 15 min        5%
---------------------------------------------------------------------------------------------
Project risks (not tested; owned by QA lead / PM):
P1  Payment sandbox unstable (L4 I4)  -> request vendor contact, book sandbox slot
P2  One tester on leave day 2 (L3 I3) -> pair dev on R5 cross-browser pass
Residual risk to report: R6 only link-checked; R5 not run on real iOS devices.`,
        },
      ],
      keyPoints: [
        'Score independently, then discuss disagreements.',
        'Small change ≠ low risk: a payment SDK bump can be the top risk.',
        'Always list project risks separately and state residual risk.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.2.3 Product Risk Analysis, 5.2.4 Product Risk Control',
    },
    {
      heading: 'Prioritising under time pressure',
      body: `When a two-week test plan meets a two-day deadline, you do not test faster. You test the riskiest things first, and you say clearly what you skipped.

**A 6-step answer (for interviews and real life):**
1. **Clarify** the release goal, the deadline, and who decides go/no-go.
2. **Rank by risk:** money flows (login, search, add to cart, pay), recent changes, buggy areas, integrations.
3. **Smoke test first** (30–60 min): can the build be tested at all? If not, stop and escalate.
4. **Test the top risks deeply** with scripted checks and exploratory sessions. Use existing automation for regression.
5. **Time-box the rest** with quick tours (garbage collector, landmark) and checklists.
6. **Report** what you covered and the **residual risk** (what is left untested), in plain words, so the business can decide.

**Example:** release tomorrow, 1 tester, 1 day, food-delivery app.
- 9:00 smoke: login, search, add to cart, pay. All OK.
- 10:00–15:00: deep test the new UPI payment and the changed coupon logic.
- 15:00–16:30: 15-minute tours of profile, ratings and help pages.
- 17:00 report: "Payment and coupons tested deeply. Not tested: old Android versions. Suggest a feature flag for coupons."

| Weak response | Strong response |
|---|---|
| "I will work overtime and test everything" | "We can cover the 8 highest risks deeply; here is what remains untested" |
| "I will skip testing low-priority bugs" | "Low-risk areas get a 15-minute tour; we accept that residual risk" |
| "Testing will decide whether to release" | "Testing provides information; the PO/release manager decides" |

**Message template:** "With 2 days we will cover R1–R4 deeply (≈ 80% of business risk) and smoke R5–R6. Not covered: older browsers, real iOS devices. We suggest a canary release or feature flag for the coupon engine."

**Common mistake:** skipping areas silently. Always list what you did not test.`,
      keyPoints: [
        'Smoke first, then top risks, then time-boxed tours.',
        'Make the trade-off visible; never silently skip.',
        'Testers inform the release decision; they rarely own it.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.2.4 Product Risk Control, 5.3 Test monitoring, test control and test completion',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-exploratory-risk-cc-1',
      title: 'From a one-line charter to a real session',
      context:
        'Your lead asks for the exploratory testing evidence from yesterday. All you logged in the tracker was the line below. The PO wants to know what was covered before approving the coupon feature.',
      task: 'Rewrite this into a proper charter plus a session sheet that a lead could debrief and a PO could trust. Use the Explore / with / to discover template and SBTM fields.',
      starter: {
        language: 'text',
        title: 'Weak artifact',
        code: `Charter: test coupons
Result: tested, found some bugs, looks ok mostly
Time: afternoon`,
      },
      hints: [
        'What is the target, what resources/techniques did you use, and what kind of information were you after?',
        'A lead reading this needs duration, the split of time, what was covered, what was not, and bug IDs.',
        'Add the questions you could not answer and the obstacles that cost you time; they are part of the result.',
      ],
      solution: {
        language: 'text',
        title: 'Strong artifact: charter + session sheet',
        code: `CHARTER
Explore coupon application at checkout
with expired, future-dated, lowercase, whitespace-padded and stacked codes
(test data: coupons_test.csv; Goldilocks + Undo/Repeat heuristics)
to discover pricing errors and weak validation messages.

SESSION SHEET
ID: ET-COUPON-03    Tester: P. Raghav    Date: 2025-11-04
Start: 14:00        Duration: 90 min (normal)
Charter / opportunity: 75% / 25%
TBS: Test 55% | Bug investigation 30% | Setup 15%
Build: web 4.18.2 on staging; Chrome 129 desktop, Safari iOS 17

COVERED
- Valid code SAVE10 on 1, 3, 20 items: totals correct.
- Expired EXP2024: rejected with clear message (ok).
- Lowercase save10: rejected (Q1 below), " SAVE10 " with spaces: rejected.
- Two codes stacked: second replaces first (ok per AC-4).
- Apply, remove item, re-add: discount applied twice (BUG-812).

NOT COVERED (next charters)
- Coupon via API without UI; coupon + gift card combination.

BUGS
- BUG-812 Discount doubled after remove + re-add (Severity High)
- BUG-815 Whitespace around code not trimmed (Severity Low)

ISSUES / QUESTIONS
- Q1: Should codes be case-insensitive? Competitors accept lowercase.
- Staging tax service down 15:05-15:15 (counted as setup).

DEBRIEF (PROOF) — confidence: medium; pricing logic needs 1 more session.`,
      },
      explanation: `**What changed and why:**
- **Charter follows Explore / with / to discover**: target (coupon application), resources (specific code types, data file, heuristics), information (pricing errors, validation).
- **SBTM metadata** (tester, start, duration, build, platforms) makes the session reproducible and auditable.
- **Charter vs opportunity and TBS percentages** show the lead that 30% went to bug investigation (a buggy area) and 15% to setup (a project risk to raise).
- **Covered / Not covered** lists turn "looks ok mostly" into explicit coverage and explicit gaps.
- **Bugs with IDs and severity**, and **questions** (like case sensitivity) with the oracle hint ("competitors accept lowercase") make the findings actionable.
- **Debrief confidence** tells the PO whether more testing is needed before approval.`,
      followUps: [
        {
          q: 'Your manager says session sheets are too much paperwork. How do you respond?',
          a: 'I would agree to keep it lean but not drop it. The sheet takes about five minutes and answers the questions the manager will ask anyway: what was covered, what was not, which bugs, how confident are we. I would offer a template with pre-filled fields and short bullet notes. I would also show how the TBS numbers helped us spot a broken staging environment last sprint. If needed, notes can go in the Jira ticket instead of a separate document.',
        },
        {
          q: 'How would you turn BUG-812 into something the automation suite keeps checking?',
          a: 'After the fix I would write a Playwright regression test for the exact steps. Log in, add an item, apply the coupon, remove the item, add it again. Then assert the order total with a web-first expect. I would add a parameterised case for two or three item counts. The exploratory session found the bug once; the automated check makes sure it never silently returns in later releases.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-cc-2',
      title: 'From "everything is high priority" to a real risk assessment',
      context:
        'The release has five changes and testers have three days. The test plan section on risk was written as below. The release manager says it does not help her decide anything.',
      task: 'Rewrite the risk section. Rank the changes and show how each score was worked out. Give each risk a test approach and effort. Keep project risks separate, and state the residual risk.',
      starter: {
        language: 'text',
        title: 'Weak artifact',
        code: `RISKS
All features are high priority and must be fully tested.
Risk: environment may be unstable.
Mitigation: test carefully and report bugs.

Features: login with OTP, invoice PDF download, dark mode,
profile photo upload, admin user export (CSV).`,
      },
      hints: [
        'Score each feature for likelihood and impact on a 1–5 scale and multiply. What makes OTP login likely to fail? What makes CSV export high impact?',
        'Map score bands to a test approach (techniques, sessions, automation) and to a share of the 3 days.',
        'Environment instability is a project risk. Who owns it and what is the mitigation? What will you not test?',
      ],
      solution: {
        language: 'text',
        title: 'Strong artifact: ranked risk register',
        code: `PRODUCT RISKS (L = likelihood, I = impact, 1-5; score = L x I)
ID  Feature / failure mode                     L  I  Score  Why
R1  OTP login: OTP not delivered/expired,      4  5   20    new SMS vendor; blocks all users
    brute force not rate-limited
R2  Admin CSV export: leaks other tenants'     3  5   15    security/privacy, GDPR impact
    data, formula injection (=cmd)
R3  Invoice PDF: wrong totals/tax rounding     3  4   12    finance + customer trust
R4  Profile photo upload: large/invalid files  3  3    9    new storage path, moderate impact
R5  Dark mode: unreadable text/contrast        4  2    8    cosmetic, accessibility concern

TEST APPROACH AND EFFORT (3 testers x 3 days = 9 tester-days)
R1  State-transition tests (sent/expired/locked) + 2 ET sessions
    (Saboteur: SMS delay, network off) + automate happy path   3.0 days
R2  Permission matrix (role x tenant) + CSV injection checks
    + security review with dev                                 2.0 days
R3  Decision table for tax rules + BVA on rounding             1.5 days
R4  Goldilocks file sizes, types, EXIF, slow network          1.0 day
R5  Contrast check (WCAG 2.2 AA) on 10 key screens + tour      0.5 day
Buffer for retests and regression                              1.0 day

PROJECT RISKS (owner: QA lead)
P1  Staging unstable (L4 I3): daily health check, escalate after 30 min
    downtime, log setup time in session sheets.
P2  SMS vendor sandbox limits (L3 I4): request higher quota by Day 1.

RESIDUAL RISK AT EXIT
- Dark mode verified on Chrome/Safari only; not on Android WebView.
- Photo upload not tested above 25 MB (limit claimed in spec).
Exit rule: no open High-severity defects on R1-R3.`,
      },
      explanation: `**What changed and why:**
- **Explicit scores with reasons** replace "everything is high". The release manager can disagree with a number, which is a useful conversation; she cannot argue with "test carefully".
- **Ranking drives effort**: 5 of 9 tester-days go to the top two risks.
- **Each risk gets techniques that match the failure mode**: state transitions for OTP, permission matrix for multi-tenant export, decision tables for tax.
- **Project risks are separated** and have owners and concrete mitigations, instead of "test carefully".
- **Residual risk and an exit rule** make the go/no-go conversation honest and fast.`,
      followUps: [
        {
          q: 'The PO says dark mode is the headline feature for marketing, so it must be HIGH. How do you handle it?',
          a: 'That is new impact information, so I would update the score rather than argue. If dark mode is the launch headline, the reputational impact of a broken look rises, maybe to 4, giving 16. I would then rebalance. Add a Money-tour session on the marketed screens and cross-browser checks. Take that time from lower-risk areas, and tell the PO clearly what we trade off. Risk scores are a shared judgement, not a tester-only decision.',
        },
        {
          q: 'Why separate product risks from project risks in the plan?',
          a: 'Because they have different owners and different responses. Product risks are mitigated by testing: more techniques, more sessions, more automation. Project risks such as an unstable environment or a vendor delay are mitigated by management actions: escalation, booking resources, changing the schedule. Mixing them hides who must act. ISTQB v4.0 makes the same split in 5.2.1.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-exploratory-risk-iq-01',
      difficulty: 'easy',
      question: 'What is exploratory testing, and how is it different from ad hoc testing?',
      whatInterviewerLooksFor: [
        'Defines it as simultaneous learning, test design and execution',
        'Explains the structure: charter, timebox, notes, debrief',
        'Clearly separates it from random or undocumented testing',
        'Gives a real example of a bug found by exploring',
      ],
      modelAnswer: `**Definition.** In exploratory testing, I learn the product, design tests and run them at the same time. Each result shapes my next test. It is still disciplined:
- I work from a **charter**: "Explore checkout with expired and stacked coupons to discover pricing errors".
- I test in a **time-boxed session**, usually about 90 minutes.
- I keep **notes** and **debrief** with my lead.

**Difference from ad hoc testing:**

| | Exploratory | Ad hoc |
|---|---|---|
| Mission | Charter tied to a risk | None |
| Time | Time-boxed session | Whenever |
| Evidence | Session sheet: covered, not covered, bugs, questions | Usually just bugs |
| Repeatability of findings | High (notes, data files) | Low |

**Example.** Exploring a coupon feature, I noticed totals were recalculated on quantity change. I tried remove-and-re-add and found the discount applied twice. No scripted case covered it because nobody had imagined it.

**Where it fits.** I use it for new features, unclear requirements, after big refactors and when time is short. Scripted and automated tests then cover the known, repeatable expectations, including checks for the bugs exploration found.`,
      followUps: [
        {
          q: 'Is exploratory testing the same as "testing without test cases"?',
          a: 'Not really. You do not write step-by-step cases in advance. But you still have a mission (the charter), heuristics for ideas and oracles to judge results. And you write down what you did. The test design happens in your head during execution and is captured in session notes. Calling it "no test cases" makes it sound unplanned, which is exactly what interviewers want you to avoid.',
        },
        {
          q: 'When would you NOT rely on exploratory testing?',
          a: 'When exact repeating is required. Examples: proof for a regulator that set steps were run, or a big regression suite that runs every build. Those need scripted, ideally automated, checks. Exploration is also weak when testers are new to the domain with no time to learn. Then pair them with a domain expert or give richer charters.',
        },
      ],
      pitfalls: [
        'Describing it as "random clicking" or "monkey testing".',
        'Saying it needs no documentation at all.',
        'Claiming it replaces scripted or automated testing.',
      ],
    },
    {
      id: 'mt-exploratory-risk-iq-02',
      difficulty: 'medium',
      question: 'You get a new feature with no requirements document and the developer is busy. How do you test it?',
      context: 'A common scenario question in QA rounds at service and product companies; this version uses a "bulk upload users via CSV" admin feature.',
      whatInterviewerLooksFor: [
        'Uses other sources of information (oracles) instead of waiting',
        'Structures exploration with charters and a heuristic such as SFDIPOT',
        'Captures questions and assumptions and gets them confirmed',
        'Produces artifacts (notes, bugs, test ideas) that others can review',
      ],
      modelAnswer: `**1. Gather information fast (15–30 min).** Read the user story or ticket, UI text, API docs or Swagger, previous versions, similar features (e.g. single-user creation form), support tickets, and talk to the PO for five minutes. Every one of these is an **oracle**.

**2. Build a quick model.** For "bulk upload users via CSV" I sketch: upload → parse → validate rows → create users → report results. Then I use **SFDIPOT** to list ideas:
- **Data**: empty file, header only, 1 row, 10,000 rows, duplicate emails, Unicode names, wrong delimiter, Excel formula cells.
- **Function**: partial failures; does row 5 failing stop rows 6–100?
- **Interfaces**: same rules as the single-user API?
- **Time**: two admins uploading at once; session timeout during a large upload.
- **Platform**: file picker on Safari; Windows vs Mac line endings.

**3. Write charters and run sessions,** e.g. "Explore CSV upload with malformed and huge files to discover validation and partial-failure problems."

**4. Log questions as well as bugs.** "Should duplicates be skipped or rejected?" goes to the PO with my assumption stated. Behaviour that is inconsistent with the single-user form or with competitors gets reported naming that oracle.

**5. Share and convert.** Session notes and a list of discovered rules become acceptance criteria and, later, automated checks.`,
      followUps: [
        {
          q: 'The PO says "just test it like a user would". Is that enough?',
          a: 'It is a good start but not enough. Normal user paths find usability and happy-path issues, but the expensive bugs often hide in data extremes, concurrency, permissions and failures. I would cover the normal user journey first. Then I add sessions for edge data, error handling and security checks, such as other tenants\' data showing up. I tell the PO which risks I cover beyond "like a user".',
        },
        {
          q: 'How do you report a bug when there is no requirement to point to?',
          a: 'I name the oracle. For example: "Inconsistent with the product. The single-user form rejects duplicate emails, but bulk upload creates duplicates." Or: "Inconsistent with user desires and comparable products." I add steps, evidence and the impact. That turns opinion into an argument, and if the behaviour turns out to be intended, the outcome is a clarified requirement, which is still valuable.',
        },
        {
          q: 'How long would you explore before you stop?',
          a: 'I time-box by risk. For a high-risk admin feature I might plan three or four 90-minute sessions. I stop when the charters are done, new sessions stop finding new kinds of problems, and my lead and I accept the remaining risk. I report what I did not cover, so stopping is a visible decision.',
        },
      ],
      pitfalls: [
        'Refusing to test until requirements are written.',
        'Only testing the happy path.',
        'Making assumptions silently instead of recording and confirming them.',
      ],
    },
    {
      id: 'mt-exploratory-risk-iq-03',
      difficulty: 'medium',
      question: 'Your manager says exploratory testing cannot be measured or tracked. How do you make it accountable?',
      whatInterviewerLooksFor: [
        'Knows session-based test management by name',
        'Lists session sheet fields and the TBS metrics',
        'Mentions the debrief (PROOF) and coverage reporting',
        'Explains how the metrics drive decisions',
      ],
      modelAnswer: `I would use **Session-Based Test Management (SBTM)**, created by Jonathan and James Bach.

**Unit of work: the session.** One charter, uninterrupted, about 90 minutes (short ≈ 45, long ≈ 2 hours). Charters come from a risk-ranked **charter backlog**, so the manager can see what is planned, in progress and done.

**Session sheet** for every session:
- charter, tester, start time, duration, build and platforms
- **charter vs opportunity** percentage
- **TBS** split: test design and execution, bug investigation and reporting, setup
- notes on what was covered, bugs with IDs, issues and questions, data files

**Debrief (PROOF):** Past, Results, Obstacles, Outlook, Feelings, about 10–15 minutes with the lead.

**What the manager gets each day:**
- sessions completed per area versus planned (coverage by risk area)
- bugs found per session and per area
- setup % trend (environment health)
- open questions blocking progress

**How it drives decisions:** if payments show 40% bug investigation, the area needs more sessions. If setup is 30% everywhere, staging is a project risk to escalate. That says more than "120 of 150 test cases passed", which hides what the cases looked for.`,
      followUps: [
        {
          q: 'What does a high "opportunity" percentage tell you?',
          a: 'It means the tester spent a lot of the session outside the charter. That may be good: they found something important and followed it. It may also mean the charter was poorly scoped or the area is so unstable that you cannot stay on mission. In the debrief I ask which one it was, and usually the opportunity work becomes a new charter in the backlog.',
        },
        {
          q: 'Can you compare testers using session metrics?',
          a: 'I would avoid it. Bug counts per session depend on the area, the build quality and the charter, not just on skill. Using the numbers to rank people pushes testers to log trivial bugs and avoid hard areas. The metrics are meant to steer the testing effort and expose obstacles, not to rate individuals.',
        },
      ],
      pitfalls: [
        'Saying exploratory testing is inherently unmeasurable.',
        'Only counting bugs as the measure of success.',
        'Forgetting the debrief, which is where most learning is shared.',
      ],
    },
    {
      id: 'mt-exploratory-risk-iq-04',
      difficulty: 'hard',
      question: 'The release is in 2 days but the planned testing needs 2 weeks. What do you do?',
      context:
        'A close version, "How do you prioritize testing tasks in a fast-paced environment?", was asked in the managerial round of an Infosys Quality Engineering Analyst interview (GeeksforGeeks, 2025).',
      whatInterviewerLooksFor: [
        'Stays calm and does not promise to "test everything"',
        'Prioritises by risk with concrete criteria',
        'Uses smoke tests, automation and exploratory sessions efficiently',
        'Makes residual risk visible and lets the business decide',
        'Suggests mitigations such as feature flags or phased rollout',
      ],
      modelAnswer: `**1. Clarify.** What exactly ships? Is the date fixed by a contract or a campaign? Who makes the go/no-go call? Can risky parts go behind a feature flag?

**2. Rank by risk (1 hour with dev + PO).** Score likelihood × impact for each change. Top of the list is usually: money paths (checkout, payment), login/auth, data integrity, recently changed or complex code, and areas with a bug history.

**3. Smoke the build first.** If login or checkout is broken, stop and escalate immediately; there is no point testing deeper.

**4. Spend the time where risk lives.**
- Day 1: run the automated regression suite in parallel, deep scripted + exploratory sessions on the top 3 risks.
- Day 2: next risks, retests of fixes, quick tours (Landmark, Garbage Collector) over low-risk areas.

**5. Make the trade-off visible.** I would send a short note on day 1: "We will cover risks R1–R6 (about 80% of business risk). Not covered: legacy reports, IE-mode, real iOS devices."

**6. Recommend mitigations.** Feature flag the new coupon engine, canary release to 5% of users, extra monitoring on payment errors, and a rollback plan.

**7. Final report.** What was tested, open defects by severity, residual risks and my recommendation. The release decision belongs to the product owner or release manager; my job is to make it an informed one.`,
      followUps: [
        {
          q: 'The manager asks you to sign off that "everything is tested". What do you say?',
          a: 'I would politely decline that wording because it would be untrue and would hide risk. I would offer to sign a statement of what was tested, the results, open defects and the untested areas with their risk level. I would explain that this protects the business: if something fails in an untested area, everyone knew it was a conscious trade-off, and we can watch it closely in production.',
        },
        {
          q: 'How does automation change your answer?',
          a: 'A healthy Playwright regression suite runs in about 20 minutes on CI and covers the stable, known behaviour. So human time goes to new and risky changes. If the suite is flaky or slow, I run only the smoke and critical-path tags. I review failures quickly and do not let flaky results eat the two days.',
        },
      ],
      pitfalls: [
        'Promising to test everything by working nights.',
        'Silently skipping areas without telling anyone.',
        'Claiming that QA alone decides the release.',
      ],
    },
    {
      id: 'mt-exploratory-risk-iq-05',
      difficulty: 'medium',
      question: 'How do you do risk-based testing? Walk me through it for an e-commerce checkout.',
      whatInterviewerLooksFor: [
        'Defines risk level as likelihood × impact',
        'Distinguishes product risk from project risk',
        'Shows a concrete mini risk register with scores',
        'Maps risk levels to test depth and order',
        'Treats risk as continuously re-assessed',
      ],
      modelAnswer: `**Concept.** Risk level = **likelihood** that something fails × **impact** if it does. I score both 1–5 so the level is 1–25. Following ISTQB, I separate **product risks** (the software may be wrong) from **project risks** (the project may slip, e.g. no stable test environment).

**For checkout, a quick register with dev and PO:**

| Risk | L | I | Score |
|---|---|---|---|
| Payment captured twice on retry/double click | 3 | 5 | 15 |
| Coupon/tax rounding gives wrong total | 4 | 4 | 16 |
| Address validation blocks valid postcodes | 3 | 3 | 9 |
| Order confirmation email delayed | 2 | 3 | 6 |
| Footer link typo on checkout page | 2 | 1 | 2 |

**Mapping score to approach:**
- **15–25 (high):** first, deepest. Decision tables for coupon/tax combinations, BVA on amounts, Saboteur session (network drop after Pay), idempotency checks on the payment API, automate in regression.
- **8–14 (medium):** key scripted paths plus one exploratory session.
- **1–7 (low):** smoke check or a quick tour if time allows.

**Monitoring.** After each test cycle I update scores: a cluster of new bugs raises likelihood; a fix with solid automated checks lowers it. In the final report I show coverage per risk and the residual risk left, which feeds the go/no-go discussion.`,
      followUps: [
        {
          q: 'Who should decide likelihood and impact scores?',
          a: 'Not the tester alone. Developers know where the code is new or fragile, which drives likelihood. The product owner and business know the cost of failure, which drives impact. I facilitate: everyone scores independently, then we discuss big differences because they usually reveal knowledge someone else lacks. The result is a shared, defensible ranking.',
        },
        {
          q: 'Two risks both score 12, one is 3×4 and one is 4×3. Which first?',
          a: 'All else equal, I take the higher-impact one first. Severe failures in production are harder to recover from and cost more. But I also look at testability and dependencies. If the 4×3 item blocks other testing, or a fix is still pending, the order may change. The score is a guide for discussion, not a formula that replaces judgement.',
        },
      ],
      pitfalls: [
        'Defining risk only as "important features".',
        'Scoring alone without developers or product.',
        'Treating the risk list as fixed after the first day.',
      ],
    },
    {
      id: 'mt-exploratory-risk-iq-06',
      difficulty: 'hard',
      question: 'Without a specification, how do you decide whether something you observe is a bug?',
      whatInterviewerLooksFor: [
        'Understands the concept of a test oracle',
        'Can name several oracles (FEW HICCUPPS or similar) with examples',
        'Knows oracles are fallible and reports with reasoning',
        'Involves stakeholders when the expected behaviour is unclear',
      ],
      modelAnswer: `I use **oracles**, ways of recognising a problem. A spec is only one. Michael Bolton's **FEW HICCUPPS** list helps me check consistency with:

- **Familiarity**: it looks like a bug pattern we have seen (double submit, timezone shift).
- **Explainability**: I cannot explain the behaviour (total off by 1 cent).
- **World**: it contradicts how the world works (31 June).
- **History**: previous version behaved differently.
- **Image**: it damages the brand (rude error messages).
- **Comparable products**: competitors do it differently in a way users expect.
- **Claims**: docs, marketing, help text or the PO said otherwise.
- **User desires**: a reasonable user would want something else.
- **Product**: inconsistent with itself (date formats differ between screens).
- **Purpose**: it does not serve the feature's purpose well.
- **Statutes and standards**: WCAG, GDPR, PCI DSS, platform guidelines.

**Example.** On a booking site, check-out date can be before check-in date. No spec mentions it, but World and Purpose oracles both say it is wrong.

**How I report.** Oracles suggest a problem rather than prove it, so I give evidence, the oracle I used and the impact: "Inconsistent with History: v3.2 rejected this." If it might be intended, I raise it as a question to the PO instead of a defect. Either way, the team learns something.`,
      followUps: [
        {
          q: 'What do you do if the developer says "it is working as designed"?',
          a: 'I ask who designed it and whether the design considered my case. If my oracle is a claim, a standard or user impact, I explain it and bring in the product owner. "As designed" is a product decision, not a technical one. If the PO accepts the behaviour, I close it as "as designed" and note it. I may suggest updating the help text so users are not surprised.',
        },
        {
          q: 'Can an automated test have an oracle problem?',
          a: 'Yes. An automated check only knows the oracle someone coded into its assertions. If the expected value is wrong or too weak, such as asserting only that a page loaded, the test passes while the product is broken. That is why exploration is still needed: humans notice inconsistencies that no assertion was written for.',
        },
      ],
      pitfalls: [
        'Saying "if there is no requirement, it is not a bug".',
        'Treating personal preference as a defect without an oracle.',
        'Arguing with developers instead of escalating to the product owner.',
      ],
    },
    {
      id: 'mt-exploratory-risk-iq-07',
      difficulty: 'expert',
      question: 'You are moving into Playwright automation. Where does exploratory testing fit once you have a good automated suite?',
      whatInterviewerLooksFor: [
        'Understands checking vs testing (Bach/Bolton)',
        'Explains a feedback loop between exploration and automation',
        'Gives criteria for what to automate from exploratory findings',
        'Knows tooling can support exploration (traces, API clients, mocks)',
      ],
      modelAnswer: `**Checking vs testing.** Bach and Bolton ("Testing and Checking Refined") separate two ideas.
- **Checking** is the mechanistic process of verifying propositions about the product. Machines do this well.
- **Testing** is evaluating a product by learning about it through experiencing, exploring and experimenting. It needs human judgement.
A Playwright suite is a strong checking machine. It only finds problems its assertions expected.

**The loop I use:**
1. **Explore** a new or risky feature with charters.
2. **Promote** findings: bugs that matter, business rules discovered, high-value happy paths become Playwright tests (often parameterised: Goldilocks lengths, Zero-One-Many cart sizes).
3. **Automation frees time**: regression runs on CI, so humans explore new risk instead of repeating old scripts.
4. **Failures and flaky areas** become new charters ("Explore checkout under slow network to discover why the test is flaky").

**What to automate from exploration:**
- stable, repeatable, high-impact behaviour
- bugs that would be costly if they returned
- checks run often (every build)

**What not to automate:** one-off investigations, rapidly changing UI, things needing human judgement (look-and-feel, confusing copy).

**Tools help exploration too:**
- Playwright codegen and trace viewer record what happened.
- page.route fakes a failing API (Saboteur tour).
- Postman probes the API; DevTools throttling slows the network.`,
      followUps: [
        {
          q: 'How would you use Playwright itself during an exploratory session?',
          a: 'I script the boring setup: log in through the API and fill a cart with 50 items. Then page.pause() hands me a headed browser to explore. I can fake an API failure with page.route to explore error handling. Tracing gives me a full timeline of what I did when I find a bug. The tool handles setup and evidence; I do the thinking.',
        },
        {
          q: 'A manager says "we have 95% automation coverage, we no longer need exploratory testing". Your reply?',
          a: 'Coverage of what? Automation coverage usually means coverage of known requirements or code lines. It cannot tell us about problems nobody thought of: odd data, new user behaviour, integration surprises. I would show bugs from production or recent exploratory sessions that the suite missed. Then I would propose a small, risk-based exploratory budget per sprint, for example two sessions per new feature.',
        },
      ],
      pitfalls: [
        'Saying exploratory testing becomes unnecessary once automation exists.',
        'Trying to automate every exploratory idea.',
        'Not knowing the checking vs testing distinction.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-exploratory-risk-drill-1',
      question:
        'Build a risk matrix and share out effort. You have 2 testers × 1 day (16 hours). Score each item, rank it, and give it hours. Items: (A) new UPI payment option, (B) wishlist share link, (C) product image zoom, (D) GST invoice calculation change, (E) login page text change, (F) order history pagination.',
      assumptions: [
        'A: new integration with a payment provider; likelihood 4, impact 5.',
        'B: small new feature, low usage; likelihood 3, impact 2.',
        'C: UI library upgrade; likelihood 3, impact 2.',
        'D: tax rule change, legal impact; likelihood 3, impact 5.',
        'E: text-only change; likelihood 1, impact 2.',
        'F: query rewrite, users with 100+ orders; likelihood 3, impact 3.',
        'Bands: high 15–25, medium 8–14, low 1–7. Keep 2 hours buffer for retests.',
      ],
      steps: [
        { label: 'Compute scores', calc: 'A 4×5 = 20, D 3×5 = 15, F 3×3 = 9, B 3×2 = 6, C 3×2 = 6, E 1×2 = 2' },
        { label: 'Assign bands', calc: 'High: A (20), D (15). Medium: F (9). Low: B (6), C (6), E (2).' },
        { label: 'Available effort', calc: '16 h − 2 h buffer = 14 h to allocate' },
        { label: 'Allocate by weight', calc: 'Total score 20+15+9+6+6+2 = 58. Proportional: A 4.8 h, D 3.6 h, F 2.2 h, B 1.4 h, C 1.4 h, E 0.5 h → round with judgement' },
        { label: 'Adjust with judgement', calc: 'A 5 h, D 4 h, F 2 h, B 1 h, C 1.5 h (two browsers), E 0.5 h = 14 h' },
        { label: 'Choose approach', calc: 'A: payment matrix + Saboteur session; D: decision table on GST slabs + BVA on amounts; F: Zero-One-Many (0, 1, 10, 101 orders); B/C/E: quick tours' },
      ],
      answer: `**Ranking:** A (20) > D (15) > F (9) > B = C (6) > E (2).

**Plan for 14 hours + 2 hours buffer:**
| Item | Score | Hours | Approach |
|---|---|---|---|
| A UPI payment | 20 | 5 | Success, failure, timeout, pending callbacks; network-drop session; refund path |
| D GST invoice | 15 | 4 | Decision table for slabs × states; BVA at slab edges; rounding |
| F Order pagination | 9 | 2 | 0, 1, page-size, page-size + 1 orders; sort stability |
| C Image zoom | 6 | 1.5 | Chromium + WebKit, touch zoom |
| B Wishlist share | 6 | 1 | Share link logged out, expired, other user |
| E Login copy | 2 | 0.5 | Read-through, spelling, i18n |

Residual risk to report: B and C only lightly tested; no real-device run for C.`,
      insight:
        'Proportional allocation is a starting point; judgement (testability, platform spread, dependencies) adjusts it. The two high risks take 9 of 14 hours, and low-risk items still get a quick look so nothing is silently skipped.',
      followUps: [
        {
          q: 'The UPI sandbox is down for the first 3 hours. What changes?',
          a: 'That is a project risk coming true. I start on D (GST) and F at once. I escalate the sandbox outage to the dev lead or vendor contact, and prepare UPI test data and charters meanwhile. If the sandbox stays down, I flag A as untested in the report. I recommend shipping UPI behind a feature flag, instead of letting the whole release wait silently.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-drill-2',
      question:
        'Write three charters for a "Book a table" feature of a restaurant app (choose date, time, party size 1–12, special requests, confirmation SMS). Use SFDIPOT to pick angles, and estimate how many 90-minute sessions you need.',
      assumptions: [
        'Party size 1–12; bookings allowed up to 30 days ahead; slots every 30 minutes, 12:00–22:00.',
        'Confirmation SMS sent via a third-party provider.',
        'Web and Android app share one booking API.',
        'You have one day (about 4 sessions max) for this feature.',
      ],
      steps: [
        { label: 'SFDIPOT scan', calc: 'Data: party size 0/1/12/13, request text 0/500/emoji. Time: today past slots, day 30 vs 31, timezone, DST. Interfaces: web vs app vs API. Platform: Android keyboard, SMS provider. Operations: two users booking last table. Function: modify/cancel.' },
        { label: 'Pick the top 3 angles by risk', calc: 'Time-based slot logic (likely + impact: wrong booking), concurrency on last table (impact: double booking), SMS/confirmation failure (impact: no-shows/complaints)' },
        { label: 'Charter 1', calc: 'Explore slot selection with past times today, day 30/31, DST change date and a different device timezone to discover booking-time errors.' },
        { label: 'Charter 2', calc: 'Explore booking the last available table with two devices and the API at the same time to discover double bookings and stale availability.' },
        { label: 'Charter 3', calc: 'Explore booking confirmation with SMS provider delays/failures (mocked) and edited bookings to discover missing, duplicate or wrong confirmations.' },
        { label: 'Estimate sessions', calc: 'C1 = 1 session, C2 = 1 session (needs setup), C3 = 1 session; 4th session reserved for opportunity charters (party size/requests Goldilocks).' },
      ],
      answer: `Three charters, each one 90-minute session, plus one reserve session:
1. **Explore slot selection** with past times, the 30-day edge, DST dates and device timezones **to discover** wrong or impossible bookings.
2. **Explore the last available table** with two devices and the API concurrently **to discover** double bookings and stale availability.
3. **Explore booking confirmation** with delayed or failing SMS (mocked provider) and edited bookings **to discover** missing, duplicate or incorrect confirmations.
4. Reserve: Goldilocks on party size (0, 1, 12, 13) and special-requests text, generated from opportunities found in sessions 1–3.`,
      insight:
        'SFDIPOT pushed the charters toward Time, Operations and Platform, the areas most often forgotten, rather than three variations of the happy path.',
      followUps: [
        {
          q: 'Why not write one charter "Explore table booking" for the whole day?',
          a: 'A one-day charter has no focus and cannot be debriefed meaningfully; at the end you would not know whether time zones or concurrency were covered. Smaller charters give clear coverage reporting, let you reprioritise between sessions, and make it obvious which risk areas got attention and which did not.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-drill-3',
      question:
        'Read four SBTM session sheets for the "Payments" area and decide where the next sessions should go. Compute the average TBS split, bugs per session and on-charter time, then recommend.',
      assumptions: [
        'S1 card payments: T 70%, B 20%, S 10%, on-charter 90%, bugs 1.',
        'S2 wallet payments: T 40%, B 50%, S 10%, on-charter 60%, bugs 4.',
        'S3 refunds: T 45%, B 15%, S 40%, on-charter 85%, bugs 1 (sandbox down 35 min).',
        'S4 invoices: T 75%, B 15%, S 10%, on-charter 95%, bugs 0.',
        'All sessions were 90 minutes.',
      ],
      steps: [
        { label: 'Average TBS', calc: 'T (70+40+45+75)/4 = 57.5%; B (20+50+15+15)/4 = 25%; S (10+10+40+10)/4 = 17.5%' },
        { label: 'Bugs per session', calc: '(1+4+1+0)/4 = 1.5 overall; wallet is 4, far above the rest' },
        { label: 'On-charter time', calc: '(90+60+85+95)/4 = 82.5%; wallet only 60% → the area kept pulling the tester off-mission' },
        { label: 'Read the signals', calc: 'Wallet: high B% + many bugs + low on-charter = buggy, unstable area. Refunds: high S% = environment problem, not product evidence. Invoices: clean, low risk now.' },
        { label: 'Decide', calc: 'Next: 2 more wallet sessions (one on the opportunity paths), escalate refunds sandbox as a project risk and re-run refunds, no more invoice sessions this cycle.' },
      ],
      answer: `**Numbers:** average TBS ≈ 57.5% test / 25% bug / 17.5% setup; 1.5 bugs per session; 82.5% on charter.

**Recommendation:**
- **Wallet payments**: highest risk signal (4 bugs, 50% bug investigation, 60% on charter). Schedule 2 more sessions and add the side-paths as new charters.
- **Refunds**: 40% setup means we barely tested; this is a **project risk** (unstable sandbox). Escalate, then repeat the session; do not report refunds as "tested ok".
- **Card payments**: one more short regression-oriented session after wallet fixes land.
- **Invoices**: no new sessions; low residual risk.`,
      insight:
        'SBTM numbers are steering signals, not grades. A clean session with 40% setup is weak evidence; a messy session with many bugs tells you where to dig next.',
      followUps: [
        {
          q: 'The refund session found only 1 bug. Can you say refunds are low risk?',
          a: 'No. With 40% of the session lost to setup, only about 50 minutes of real testing happened, so there is little evidence either way. Low bug count from little testing is absence of evidence, not evidence of quality. I would report refunds as insufficiently tested and re-run the session once the sandbox is stable.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-exploratory-risk-mcq-01',
      difficulty: 'easy',
      question: 'Which description best matches exploratory testing as taught by Bach and Bolton?',
      options: [
        'Simultaneous learning, test design and test execution, guided by a mission',
        'Random clicking through the application to see whether anything crashes',
        'Executing pre-written test cases in a different order each time',
        'Testing done by end users before release without any testers',
      ],
      correct: [0],
      explanation:
        'Exploratory testing interleaves learning, designing and executing tests, with each result shaping the next test, normally under a charter. Random clicking is monkey testing. Running pre-written cases in a new order is still scripted testing. End-user testing before release is beta/UAT, not exploratory testing.',
      followUps: [
        {
          q: 'What gives exploratory testing its structure?',
          a: 'A charter with the mission, a time-boxed session, heuristics for ideas, oracles to spot problems, session notes as evidence, and a debrief with the lead. Together they make the goals planned while the steps stay flexible.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-02',
      difficulty: 'easy',
      question: 'Which of these is a well-formed exploratory test charter in the Hendrickson style?',
      options: [
        'Explore the password reset flow with expired, reused and tampered reset links to discover security and validation problems',
        'Test the password reset page thoroughly and report all bugs found before Friday',
        'Click "Forgot password", enter a valid email, and verify that the email arrives in 60 seconds',
        'Explore the whole application with any data to discover every possible defect',
      ],
      correct: [0],
      explanation:
        'Option A has a target (password reset), resources (expired, reused, tampered links) and the information sought (security and validation problems). Option B is a vague instruction with no resources or focus. Option C is a scripted test case, too narrow to be a charter. Option D is far too broad to finish or debrief in one session.',
      followUps: [
        {
          q: 'How long should one charter take?',
          a: 'Roughly one session; Jon Bach describes normal sessions of about 90 minutes, short ones near 45 and long ones near two hours. If you cannot imagine finishing it in a session, split it; if it takes five minutes, it is probably a test case, not a charter.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-03',
      difficulty: 'easy',
      question: 'Using the scoring rule below, what is the risk level of "card payment double-charged on retry"?',
      code: {
        language: 'text',
        title: 'Risk scoring rule',
        code: `Likelihood: 1 (rare) .. 5 (almost certain)
Impact:     1 (cosmetic) .. 5 (critical: money, legal, data)
Risk score = Likelihood x Impact
Bands: LOW 1-7 | MEDIUM 8-14 | HIGH 15-25

Item: Card payment double-charged on retry
Likelihood: 3      Impact: 5`,
      },
      options: ['15, HIGH', '8, MEDIUM', '12, MEDIUM', '20, HIGH'],
      correct: [0],
      explanation:
        'Likelihood 3 × impact 5 = 15, which falls in the HIGH band (15–25). 8 is what you get by adding instead of multiplying, a common slip. 12 and 20 come from misreading one of the two values (3×4 or 4×5).',
      followUps: [
        {
          q: 'What does a HIGH score change about how you test this item?',
          a: 'It is tested first and deepest. Use formal techniques such as decision tables and BVA on amounts. Run at least one exploratory session on retries and network drops. Check the API is idempotent (a retry does not charge twice). Get a second tester to review, and add it to the automated regression suite.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-04',
      difficulty: 'medium',
      question: 'Select ALL that apply: which of these are PRODUCT risks (rather than project risks)?',
      options: [
        'The invoice PDF may round tax incorrectly',
        'The staging environment may be unavailable for three days',
        'The search page may take over 5 seconds with 10,000 products',
        'The only performance tester may leave mid-release',
        'Users may be able to see another tenant\'s orders',
      ],
      correct: [0, 2, 4],
      explanation:
        'Product risks concern the quality of the software itself: wrong tax rounding (functional), slow search (performance) and seeing another tenant\'s data (security). An unavailable staging environment and a team member leaving are project risks: they threaten schedule and delivery, not the product\'s behaviour directly, and are handled by management actions rather than more test cases.',
      followUps: [
        {
          q: 'How do you handle the staging-environment risk?',
          a: 'As a project risk with an owner and a plan. Run daily environment health checks and escalate after a set downtime. Consider a backup or containerised environment. Track setup time in session sheets, so its effect on coverage shows in reports.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-05',
      difficulty: 'medium',
      question: 'Based on this session sheet, what is the most reasonable reading?',
      code: {
        language: 'text',
        title: 'SBTM session sheet (excerpt)',
        code: `CHARTER: Explore refund requests with partial and full refunds
         to discover wrong amounts and status errors
DURATION: 90 min
CHARTER / OPPORTUNITY: 90 / 10
TBS: Test 35% | Bug investigation 10% | Setup 55%
BUGS: none
ISSUES: payment sandbox returned 502 for ~45 min; test users
        had to be recreated twice`,
      },
      options: [
        'Refunds were barely tested; the environment is a project risk and the session should be repeated',
        'Refunds look stable because no bugs were found in a 90-minute session',
        'The tester went off-mission, so the charter must be rewritten',
        'The bug investigation share is too low, so the tester missed bugs',
      ],
      correct: [0],
      explanation:
        'With 55% of the time on setup, only about 30 minutes of actual testing happened, so "no bugs" is weak evidence. The sandbox outage is a project risk to escalate. The tester stayed on charter (90%), so the charter is not the issue. A low bug-investigation share just reflects that no bugs were found.',
      followUps: [
        {
          q: 'How would you report refunds in the daily status?',
          a: 'As "insufficiently tested: environment blocked 45 minutes, session to be repeated", not as "passed". I would add the sandbox outage to the project risk log with an owner, so the release manager sees why refunds coverage is low.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-06',
      difficulty: 'medium',
      question:
        'While exploring, you see the same date shown three ways: 04/11/2025 on the order list, Nov 4, 2025 on the order details page, and 11/04/2025 on the invoice. Which FEW HICCUPPS oracle are you mainly using?',
      options: [
        'Product: the product should be consistent with itself',
        'History: the product should match earlier versions',
        'Statutes: the product should follow legal standards',
        'Claims: the product should match marketing statements',
      ],
      correct: [0],
      explanation:
        'The inconsistency is between different parts of the same product, so the Product (self-consistency) oracle applies. History would compare with a previous release, which you have not done here. Statutes would need a law or standard requiring a format. Claims would need a document or statement promising a format.',
      followUps: [
        {
          q: 'How would you phrase this in a bug report title?',
          a: 'Something like "Order date format inconsistent across order list, details and invoice (DD/MM vs MM/DD vs text)". In the body I would name the oracle and note the impact: users in different locales can misread 04/11 as 11 April, which can cause wrong delivery expectations or disputes.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-07',
      difficulty: 'medium',
      question:
        'A tester follows one customer\'s delivery address from sign-up, through saved addresses and checkout, to the confirmation email and the courier label. Which Whittaker tour is this?',
      options: ['FedEx tour', 'Money tour', 'Garbage Collector tour', 'Couch Potato tour'],
      correct: [0],
      explanation:
        'The FedEx tour follows a piece of data through every place it travels, looking for data that gets lost or mangled. The Money tour targets features promoted by marketing. The Garbage Collector tour visits every screen methodically. The Couch Potato tour does as little as possible, accepting defaults.',
      followUps: [
        {
          q: 'What bugs is a FedEx tour likely to find?',
          a: 'Cut or garbled fields, e.g. a long street name cut at 30 characters on the courier label. Lost Unicode characters. Fields mapped to the wrong place in an export. Or an edit that updates one copy of the data but not another, such as a changed address that never reaches an existing order.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-08',
      difficulty: 'medium',
      question:
        'Using SFDIPOT, a tester lists "Safari on iOS 17, Chrome on Android, payment gateway sandbox, the browser\'s autofill". Which product factor are these ideas mainly about?',
      options: ['Platform', 'Interfaces', 'Operations', 'Structure'],
      correct: [0],
      explanation:
        'Platform covers what the product depends on but does not control: browsers, operating systems, devices and third-party services. Interfaces is about how the product exchanges data (UI, APIs, files). Operations is about how it is used (users, environments, usage patterns). Structure is about what the product is built from (code, services, files).',
      followUps: [
        {
          q: 'Give an Operations idea for the same checkout.',
          a: 'A returning customer opens checkout in two tabs, changes the cart in one and pays in the other. Or a shopper on a slow mobile connection during a busy sale. Operations ideas come from real usage patterns, not from the feature list.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-09',
      difficulty: 'medium',
      question:
        'You have 3 hours before a hot-fix release. Given the change list below, what should you test first?',
      code: {
        language: 'text',
        title: 'Hot-fix 4.18.3 change list',
        code: `1. Fix: promo banner overlaps header on small screens
2. Fix: payment callback retried on 504 (changed retry logic)
3. Copy: "Checkout" button renamed to "Proceed to checkout"
4. Fix: typo in Terms page
Known history: payment callbacks caused 2 P1 incidents last quarter`,
      },
      options: [
        'Smoke the build, then deep-test the payment callback retry change',
        'Start with the banner because it is visible to every user',
        'Run the full 6-hour regression suite and stop wherever it reaches',
        'Test the four changes in the order they are listed',
      ],
      correct: [0],
      explanation:
        'The retry logic change touches money and has a P1 history (high likelihood and impact). It can cause double callbacks. So after a quick smoke it gets the deepest testing. The banner is visible but low impact. A 6-hour suite cannot finish in 3 hours and would not focus on the risky change. Listing order says nothing about risk.',
      followUps: [
        {
          q: 'How would you test the retry change in 2 hours?',
          a: 'Check the callback paths: success, one 504 then success, repeated 504s, and a late duplicate callback. Confirm the order is paid exactly once and the customer is charged once. A Saboteur-style session with mocked gateway responses helps, plus a look at logs for duplicate processing. Then a quick check that the button rename did not break the checkout flow or automation locators.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL that apply: in which situations is exploratory testing especially valuable compared with scripted testing?',
      options: [
        'A new feature with incomplete or changing requirements',
        'A regulatory audit that needs proof the same 40 steps were executed identically',
        'Investigating a production incident whose cause is unknown',
        'The nightly regression run of 600 stable checks',
        'A short timebox where you must find the most important problems fast',
      ],
      correct: [0, 2, 4],
      explanation:
        'Exploration is strongest when information is missing or changing (new features), when you must learn fast (an incident), and when time is short. A regulatory audit that demands identical repeated steps needs scripted, documented tests. A nightly run of 600 stable checks is exactly what automation is for.',
      followUps: [
        {
          q: 'How would you explore during a production incident?',
          a: 'Start from the symptoms and logs and form a guess. Try to reproduce it in a safe environment with similar data and settings. Change one factor at a time (user type, browser, timing, data size) and record everything. Each result narrows the search. That is the learn-design-execute loop of exploratory testing.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-11',
      difficulty: 'hard',
      question:
        'A team runs a tool overnight that sends thousands of random taps and text inputs to their Android app. The tool knows nothing about the screens. It logs crashes with the random seed. What is this best called?',
      options: [
        'Dumb monkey testing',
        'Exploratory testing',
        'Gorilla testing',
        'Ad hoc testing',
      ],
      correct: [0],
      explanation:
        'Random inputs with no model of the application are dumb monkey testing; logging the seed is what makes crashes reproducible. It is not exploratory because nobody is learning and adapting with a charter. Gorilla testing repeatedly hammers one chosen module. Ad hoc testing is informal manual testing by a person, not an automated random generator.',
      followUps: [
        {
          q: 'What would make it a "smart" monkey?',
          a: 'Give the tool a model of the app: which screens exist and which actions are valid on each. You can also weight actions by importance. It then makes realistic sequences and reaches deeper screens, instead of tapping randomly on the first page. That finds more meaningful state bugs.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-12',
      difficulty: 'hard',
      question: 'Two risks tie on score. Which should normally be tested first, and why?',
      code: {
        language: 'text',
        title: 'Excerpt from a risk register',
        code: `R7  Loyalty points sometimes not credited     L5 x I2 = 10
    (points show next day; support can add)
R8  Bank transfer refunds to wrong account      L2 x I5 = 10
    (rare edge case when user edits bank details)`,
      },
      options: [
        'R8, because its impact is severe and hard to reverse even though it is rare',
        'R7, because it happens more often so users will notice it first',
        'Either; equal scores mean equal priority and the order does not matter',
        'Neither; tied medium risks should be left until all high risks are retested twice',
      ],
      correct: [0],
      explanation:
        'Scores are a guide, not the full story. R8 sends money to the wrong account, which is severe, costly and difficult to undo, while R7 has a cheap workaround. When scores tie, testers typically favour the higher-impact risk. Treating equal scores as equal ignores reversibility. Postponing all medium risks until high ones are retested twice is not a standard rule.',
      followUps: [
        {
          q: 'Should the scoring scheme be changed after this discussion?',
          a: 'Possibly. Some teams weight impact more heavily, for example score = likelihood × impact², or add a "detectability" or "reversibility" factor as in FMEA. The aim is that the numbers reflect what the business actually fears; if people keep overriding the order, the formula is missing something.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL that apply: which topics belong in an SBTM debrief using the PROOF structure?',
      options: [
        'What happened during the session and what was covered',
        'Obstacles such as environment downtime or missing test data',
        'The tester\'s personal ranking compared with other testers',
        'What still needs testing and the tester\'s confidence in the area',
        'A rewrite of every finding as a step-by-step scripted test case',
      ],
      correct: [0, 1, 3],
      explanation:
        'PROOF covers Past (what happened), Results (findings), Obstacles (what got in the way), Outlook (what remains) and Feelings (confidence). Ranking testers against each other is not part of a debrief and misuses session metrics. Converting every finding into a scripted case is not required; only valuable findings are later promoted to scripted or automated checks.',
      followUps: [
        {
          q: 'How long should a debrief take and why does it matter?',
          a: 'Usually 10 to 15 minutes. It is where the lead learns what the session really covered, spots weak evidence (for example high setup time), and decides the next charters. Without debriefs, session sheets become paperwork that nobody acts on.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-14',
      difficulty: 'expert',
      question:
        'Given the status below, which statement is the most professional to put in the release report?',
      code: {
        language: 'text',
        title: 'End-of-cycle status',
        code: `High risks R1 (payment), R2 (coupons): tested deeply, 0 open High bugs
Medium risk R3 (sorting): 1 session, 1 open Medium bug (ties order)
Medium risk R4 (save for later): NOT tested (sandbox blocked)
Low risks R5-R6: smoke only
Automated regression: 412 passed, 3 failed (known flaky, rerun passed)`,
      },
      options: [
        'Top risks R1–R2 pass with no open High bugs; R3 has one open Medium bug; R4 is untested due to the sandbox; R5–R6 smoke only. Residual risk: R4. Recommend release with R4 behind a flag or tested before go-live.',
        'All testing is complete and the release is approved by QA.',
        'Testing failed because R4 could not be tested and 3 automated tests failed; release must be blocked.',
        '412 of 415 automated tests passed (99.3%), so quality is high and the release is safe.',
      ],
      correct: [0],
      explanation:
        'The first option reports coverage per risk, open defects, untested areas with the reason, residual risk and a recommendation, leaving the decision to stakeholders. "All testing complete" is false because R4 was not tested. Blocking the release ignores that top risks are clean and the flaky failures passed on rerun. A pass percentage hides that R4 was never tested and says nothing about risk.',
      followUps: [
        {
          q: 'Why should the 3 flaky failures still be mentioned?',
          a: 'Because flaky tests erode trust in the suite and can hide real failures. I would list them with ticket numbers for investigation, note that reruns passed, and say whether they touch any of the high-risk areas. Hiding them would make the report look cleaner than the evidence supports.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-15',
      difficulty: 'expert',
      question:
        'Select ALL that apply: after an exploratory session on checkout, which findings are good candidates to become automated Playwright regression tests?',
      options: [
        'The discount was applied twice after removing and re-adding an item (now fixed)',
        'The error message tone on the coupon field felt unfriendly',
        'Order total must equal sum of items minus coupon plus tax, across 1, 2 and 20 items',
        'A one-off investigation of why staging was slow on Tuesday afternoon',
        'Checkout must reject a quantity of 0 and accept 1 to 99',
      ],
      correct: [0, 2, 4],
      explanation:
        'Three findings suit automation, because assertions can check them every time: a fixed bug that would be costly to bring back, a stable business rule (the total for several item counts), and a boundary rule (quantity 0 rejected, 1–99 accepted). The tone of an error message needs human judgement. A one-off environment slowness investigation is not a repeatable product check.',
      followUps: [
        {
          q: 'How would you structure the quantity rule as a Playwright test?',
          a: 'As a parameterised test. Loop over cases: 0 (expect error), 1 and 99 (expect accepted), 100 (expect error). Create one test per value with a clear title. Fill the quantity field with getByLabel and assert with web-first expectations on the error message or cart total. Exploration found the interesting values; the data-driven test keeps checking them.',
        },
      ],
    },
  ],
};

export default topic;
