import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-exploratory-risk',
  phase: 'manual-advanced',
  order: 3,
  title: 'Exploratory Testing & Risk-Based Testing',
  subtitle:
    'Charters, session-based test management, SFDIPOT and FEW HICCUPPS heuristics, Whittaker tours, and how to rank risks by likelihood × impact so you test the right things first when time runs out.',
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
    'Exploratory testing = simultaneous learning, test design and test execution, steered by what you just observed. It is structured (charter, timebox, notes, debrief), not random.',
    'Ad hoc = unplanned and usually undocumented; monkey = random input (dumb or smart); exploratory = purposeful, chartered, time-boxed and reported.',
    'Hendrickson charter: Explore <target> with <resources> to discover <information>. One charter ≈ one session (Jon Bach: normal ≈ 90 min, short ≈ 45, long ≈ 2 h).',
    'SBTM session sheet: charter, tester, start + duration, % on charter vs opportunity, TBS split (Test design/execution, Bug investigation, Setup), notes, bugs, issues, data files. Debrief with PROOF: Past, Results, Obstacles, Outlook, Feelings.',
    'SFDIPOT (product factors): Structure, Function, Data, Interfaces, Platform, Operations, Time. Use it to generate test ideas and spot coverage gaps.',
    'Quick idea heuristics: CRUD (create/read/update/delete), Goldilocks (too small / too big / just right), Zero-One-Many, Beginning-Middle-End, interrupt it, undo it, repeat it, do it in parallel.',
    'Oracle = how you recognise a problem. FEW HICCUPPS: Familiarity (with known problems), Explainability, World, History, Image, Comparable products, Claims, User desires, Product (self-consistency), Purpose, Statutes/standards.',
    'Whittaker tours: Money (what marketing sells), Landmark (hop between key features), Intellectual (hardest inputs), FedEx (follow data end to end), Garbage Collector (visit every screen methodically), Saboteur (break resources), Bad Neighbourhood (bug-dense areas).',
    'Risk level = likelihood × impact (e.g. 1–5 each → score 1–25). Higher score → test earlier, deeper, with more techniques and more people.',
    'Product risk = the software may be wrong (double charge, data loss). Project risk = the project may slip (late build, no test env, sick tester). Testing mitigates product risk; managers mitigate project risk.',
    'Short on time? Rank by risk, test the money paths and recent changes first, do a smoke pass, then explore the top-risk areas, and report what you did NOT test as residual risk.',
    'Interview line: "Scripted tests check what we already know; exploratory testing finds what we did not think to ask. I use both, and risk decides the mix."',
  ],
  sections: [
    {
      heading: 'What exploratory testing really is',
      body: `**Intuition:** scripted testing is following a recipe. Exploratory testing is a chef tasting the dish while cooking and changing the next step based on the taste. Both are disciplined; only one adapts as it learns.

**Definition.** ISTQB CTFL v4.0 (4.4.2) describes exploratory testing as tests being *simultaneously designed, executed and evaluated while the tester learns about the test object*: what you observe on this step decides your next step. It sits with the experience-based techniques and is most useful when specifications are few or inadequate, when there is significant time pressure, or to complement more formal techniques. ISTQB also notes it can be structured with session-based testing (time box, charter, debrief, session sheets). Bach and Bolton go further in *Exploratory Testing 3.0*: in Rapid Software Testing **all** testing is exploratory, and scripting is a set of controls you apply to it in varying degrees (a "formality continuum"), not a separate kind of testing.

| Aspect | Scripted testing | Exploratory testing | Ad hoc testing |
|---|---|---|---|
| Test design | Written before execution | Designed while executing | None, or only in the head |
| Guidance | Step-by-step test case | Charter + heuristics + timebox | Whatever comes to mind |
| Documentation | Pass/fail per step | Session notes, bugs, questions, coverage | Usually only bugs |
| Strong at | Regression, compliance, repeatability | New features, unclear specs, finding surprises | Quick sanity poke |
| Weak at | Finding unexpected problems | Exact repeatability | Accountability and coverage |
| Automatable? | Yes (good Playwright candidates) | No; but its findings become checks | No |

**Worked example.** Feature: "Apply coupon at checkout" on SauceDemo-style shop. A scripted case says: enter SAVE10, click Apply, expect total reduced by 10%. While exploring you notice the discount is recalculated when you change quantity... so you try: apply coupon, remove the only discounted item, re-add it. The total is now discounted twice. No script asked that question; your observation did.

**In interviews, say this:** "Exploratory testing is not random clicking. I run it as time-boxed sessions with a charter, take notes, log bugs and questions, and debrief. It complements scripted and automated checks; it does not replace them."`,
      keyPoints: [
        'Learning, design and execution happen together and feed each other.',
        'Structure comes from charter, timebox, heuristics, notes and debrief.',
        'Exploration finds new information; scripts and automation confirm known expectations.',
      ],
      source: 'James Bach & Michael Bolton — Exploratory Testing 3.0 (satisfice.com); ISTQB CTFL v4.0 — 4.4.2 Exploratory Testing',
    },
    {
      heading: 'Writing test charters',
      body: `**Intuition:** a charter is a mission statement for one exploring trip. It tells you where to go and what to look for, without telling you every step.

**Hendrickson template (Explore It!):**

> **Explore** <target: a feature, area, requirement, flow>
> **with** <resources: tools, data, techniques, personas, configurations>
> **to discover** <information: what kind of problems or knowledge you want>

A good charter is **narrow enough to finish in one session** (typically about 90 minutes) and **wide enough to allow surprises**. Too broad ("Explore the app") gives no focus; too narrow ("Click Apply with SAVE10") is a test case, not a charter.

| Charter quality | Example | Problem |
|---|---|---|
| Too broad | Explore checkout | No target risk, no resources, cannot be "done" |
| Too narrow | Enter SAVE10 and verify 10% off | That is a scripted check |
| Good | Explore coupon application with expired, stacked and case-varied codes to discover pricing and validation errors | Clear target, resources, information |

**Where charters come from:** risk lists, new user stories, recent bug clusters, support tickets, ideas you parked during another session ("opportunity" notes), and the SFDIPOT heuristic in the next sections.

**Common mistake:** writing one giant charter for a whole release. Break it into a charter **backlog**, rank it by risk, and pull the top charters first.`,
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
      body: `**Intuition:** managers like numbers; explorers like freedom. SBTM, developed by James and Jonathan Bach and described in Jon Bach's 2000 STQE article, gives both: freedom inside a session, accountability around it.

**The unit of work is a session:** an uninterrupted, chartered block of testing. In Jon Bach's team a normal session was about ninety minutes, a short one closer to 45 minutes and a long one closer to two hours, and a tester completed about three sessions on a typical day. Each session produces a **session sheet**, and is closed by a short **debrief** with a lead.

**Session sheet fields**
- Charter, tester, date, start time, duration
- **Charter vs opportunity** split: how much time was on-mission vs following a valuable side-path
- **TBS metrics**: % time on **T**est design and execution, **B**ug investigation and reporting, **S**ession setup (env, data, tools)
- Test notes (what you did, what you covered), bugs (with IDs), issues (questions, blockers, risks), data files used

**Debrief with PROOF:** **P**ast (what happened), **R**esults (what you found), **O**bstacles (what got in the way), **O**utlook (what still needs doing), **F**eelings (how confident are you?).

**Reading the metrics:** high Setup % means the environment is hurting you (raise it as a project risk). High Bug % means the area is buggy (more sessions here). Low "on charter" % means the charter was wrong or the product surprised you; both are useful signals.`,
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
      body: `**Intuition:** when you "don't know what to test next", you need a checklist of *places to look*, not a list of test cases. SFDIPOT ("San Francisco Depot") is that list from James Bach's Heuristic Test Strategy Model. Older material says SFDPOT; the current model added **Interfaces**.

| Factor | Ask yourself | Coupon-at-checkout ideas |
|---|---|---|
| **S**tructure | What is it made of? Code, files, services, DB tables | Which service owns the discount? Is it cached in the cart service? |
| **F**unction | What does it do? Every feature and error path | Apply, replace, remove a coupon; error messages for invalid codes |
| **D**ata | What does it process? Inputs, outputs, stored state | Empty, 1 char, 50 chars, emoji, lowercase, leading space, SQL-like text |
| **I**nterfaces | How does it connect? UI, API, imports/exports | Same coupon via API vs UI; response codes; order export to ERP |
| **P**latform | What does it depend on? Browser, OS, device, 3rd party | Safari vs Chrome, mobile keyboard, payment gateway sandbox |
| **O**perations | How will it be used? Users, environments, patterns | Shopper with 50 items, returning user, two tabs open, slow 3G |
| **T**ime | How does time affect it? Timeouts, dates, concurrency | Coupon expiring at midnight, timezone, session timeout mid-checkout |

**How to use it in a session:** spend 5 minutes writing two or three ideas per factor, circle the risky ones, and turn them into charters. After testing, run through it again as a **coverage check**: "Did we touch Platform at all?"

**In interviews, say this:** "When I get a feature with weak requirements I use SFDIPOT to make sure my ideas cover structure, functions, data, interfaces, platforms, operations and time, not just the happy path."`,
      keyPoints: [
        'SFDIPOT = Structure, Function, Data, Interfaces, Platform, Operations, Time.',
        'It generates ideas and also exposes coverage gaps afterwards.',
        'Time and Operations are the factors juniors most often forget.',
      ],
      source: 'James Bach — Heuristic Test Strategy Model (satisfice.com)',
    },
    {
      heading: 'Quick heuristics: CRUD, Goldilocks, Zero-One-Many and friends',
      body: `**Intuition:** heuristics are rules of thumb: fast, usually helpful, sometimes wrong. Experienced testers carry a pocketful of them. Elisabeth Hendrickson's *Test Heuristics Cheat Sheet* collects many; these are the ones interviewers expect you to name.

| Heuristic | Idea | Worked example (profile / address book) |
|---|---|---|
| **CRUD** | For every data entity, Create, Read, Update, Delete it, then check every place it appears | Add address, view it at checkout, edit it, delete it while it is the default |
| **Goldilocks** | Too small, too big, just right | Name of 0 chars, 1 char, 255 chars, 10,000 chars |
| **Zero, One, Many** | Collections behave differently at 0, 1 and many | Cart with 0 items (checkout disabled?), 1 item, 100 items (pagination?) |
| **Beginning, Middle, End** | Position matters | Delete the first, middle and last address in the list |
| **Some, None, All** | Selection sets | Select none / some / all orders for bulk export |
| **Interruptions** | Stop it half way | Refresh, back button, network off, close tab during payment |
| **Undo / Repeat** | Reverse or repeat an action | Double-click Pay; remove then re-add an item; browser back after order |
| **Follow the data** | Trace a value end to end | Address typed in UI → API payload → DB → invoice PDF → email |

**Common mistake:** listing heuristics like trivia. In an interview, always pair the name with a concrete test idea for the feature in front of you: "Zero-One-Many on the cart: what does checkout do with an empty cart?"

**Link to automation:** many heuristic ideas become parameterised Playwright tests later (Goldilocks lengths, Zero-One-Many cart sizes). Exploration finds the interesting values; automation keeps checking them.`,
      keyPoints: [
        'Heuristics are fallible shortcuts for generating ideas, not guarantees.',
        'Always attach a heuristic to a concrete idea for the feature at hand.',
        'Interruptions, undo and repeat find many real-world state bugs.',
      ],
      source: 'Elisabeth Hendrickson — Explore It! and Test Heuristics Cheat Sheet',
    },
    {
      heading: 'Oracles: how you know it is a bug (FEW HICCUPPS)',
      body: `**Intuition:** an oracle is how you decide "this looks wrong". With a spec the oracle is the spec; without one you still have plenty of oracles. Bolton stresses that an oracle **suggests** a problem; it does not prove one, so you investigate and explain.

Michael Bolton's **FEW HICCUPPS** consistency heuristics (developsense.com): we suspect a problem when the product is *inconsistent* with most of these, or *consistent* with patterns of familiar problems.

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

**Writing the bug report:** name the oracle in your report: "Inconsistent with History: v3.2 accepted 50-character codes (see TC-118)." It turns "I think this is wrong" into an argument a developer or PO can evaluate.

**In interviews, say this:** "No spec does not mean no oracle. I compare with the product's own behaviour, previous versions, competitors, claims, user expectations and standards, and I state which one I used."`,
      keyPoints: [
        'An oracle is a way to recognise a problem; it is fallible.',
        'Naming the oracle makes your bug report persuasive.',
        'Specs are only one oracle among many.',
      ],
      source: 'Michael Bolton — FEW HICCUPPS (developsense.com, 2012)',
    },
    {
      heading: "Whittaker's tours",
      body: `**Intuition:** James Whittaker compares exploring software to being a tourist in a city. Different tours take you through different districts, and each tour tends to find a different class of bugs. Tours are a fun way to vary your sessions so you do not always walk the same streets.

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

**Worked example (food-delivery app):** a **FedEx** tour follows a delivery address from sign-up → saved addresses → checkout → order confirmation email → rider app. A **Saboteur** tour turns on airplane mode right after tapping "Place order" and checks whether the order was created once, twice or not at all.

**Interview tip:** you do not need all 20-plus tours. Know 4–5 well with a bug class each, and connect them to charters: "Explore checkout using the Saboteur tour to discover network-failure handling."`,
      keyPoints: [
        'Tours give each session a different viewpoint.',
        'Money, Landmark, FedEx, Saboteur and Bad Neighbourhood are the most quoted.',
        'A tour plugs into the "with <resources>" slot of a charter.',
      ],
      source: 'James Whittaker — Exploratory Software Testing (2009), via the Software Testing Help tours summary',
    },
    {
      heading: 'Ad hoc, monkey and gorilla testing compared',
      body: `**Intuition:** these are the "less structured cousins" of exploratory testing. Interviewers ask about them mainly to see whether you know the difference.

| Type | What it is | When it helps | Main limitation |
|---|---|---|---|
| **Ad hoc** | Informal testing with no plan or documentation, often from experience | 10-minute check of a hot-fix | No record of coverage; hard to repeat |
| **Monkey (dumb)** | Random inputs with no knowledge of the app | Crash and robustness hunting | Finds few logic bugs; hard to reproduce |
| **Monkey (smart)** | Random inputs guided by a model of valid actions | Long-run stability, mobile apps (e.g. Android's UI/Application Exerciser Monkey) | Needs a model and logging to be useful |
| **Gorilla** | Hammering one module repeatedly, deliberately | Robustness of a single critical function | Narrow by design |
| **Exploratory** | Chartered, time-boxed, heuristic-driven, documented | New features, unclear specs, finding unknowns | Needs skilled testers and debriefs |

**Reproducibility tip:** whenever you do anything random, log the seed, the inputs and the time. A crash you cannot reproduce is a rumour.

**Error guessing** (anticipating likely mistakes, e.g. divide by zero, empty strings) is a separate experience-based technique covered in the test-design topic; in exploratory sessions it is one of your resources.

**In interviews, say this:** "Ad hoc testing is unplanned and undocumented. Exploratory testing is planned at the level of a mission, and documented through session notes, so the team knows what was covered."`,
      keyPoints: [
        'Ad hoc ≠ exploratory: the difference is charter, timebox and notes.',
        'Monkey testing is random input; log seeds to reproduce.',
        'Gorilla testing hammers one module repeatedly.',
      ],
      source: 'ISTQB CTFL v4.0 — 4.4 Experience-based test techniques',
    },
    {
      heading: 'Risk-based testing: likelihood × impact',
      body: `**Intuition:** you cannot test everything, so test where failure is both *likely* and *painful*. A smoke detector goes in the kitchen before the cupboard.

**ISTQB CTFL v4.0 (5.2) vocabulary**
- **Risk** (5.2.1): a potential event, hazard, threat or situation whose occurrence causes an adverse effect.
- **Risk level** = **risk likelihood** (probability it happens) combined with **risk impact** (harm if it happens). The **quantitative** approach multiplies them (here 1–5 × 1–5); the **qualitative** approach reads the level from a risk matrix.
- **Product risk** (5.2.2): tied to product quality characteristics: missing or wrong functionality, incorrect calculations, runtime errors, slow response, poor user experience, security vulnerabilities.
- **Project risk** (5.2.2): tied to managing the project: organisational (late deliveries, bad estimates), people (skills, staff shortage), technical (scope creep, poor tools), supplier (third-party failure).
- **Risk management** = risk analysis (identification + assessment, 5.2.3) and risk control (mitigation + monitoring, 5.2.4). Response options include mitigation by testing, acceptance, transfer or a contingency plan.

**Where likelihood comes from:** new or complex code, many changes, new team or technology, historical bug density, many integrations. **Where impact comes from:** money, legal/compliance, safety, data loss, number of users affected, reputation.

**How testing responds to risk level (risk → test approach):**

| Risk level | Score (1–25) | Test approach |
|---|---|---|
| High | 15–25 | Test first; formal techniques (BVA, decision tables) + exploratory sessions; review by 2 testers; automate in regression |
| Medium | 8–14 | Scripted key paths + one exploratory session |
| Low | 1–7 | Smoke-level check or test only if time allows; accept residual risk |

**Common mistake:** treating risk as a one-time spreadsheet. Risk is monitored: new bugs, new changes and new information move items up or down every sprint.`,
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
      body: `**Scenario.** A release of a SauceDemo-like shop contains: new coupon engine, redesigned product listing, new "save for later", payment provider SDK upgrade, footer link changes, and a new sort-by-price option. The team has 3 testers × 2 days.

**Step 1: identify risks** with the team (dev, PO, tester), using the change list, past bugs and SFDIPOT.
**Step 2: score** likelihood and impact 1–5 independently, then discuss differences (they reveal hidden knowledge).
**Step 3: rank and map** to an approach and an effort share.
**Step 4: report** residual risk: what is untested or lightly tested and why.

Notice the payment SDK upgrade: it is a "small" code change but impact 5 (money, every customer). Change size is not risk.`,
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
      body: `**Intuition:** when a two-week test plan meets a two-day deadline, you do not test faster, you test *smarter* and you are honest about what was skipped.

**A repeatable 6-step answer (works in interviews and in real life):**
1. **Clarify** the release goal, the deadline, and who decides go/no-go.
2. **Rank by risk**: business-critical flows (login, search, add to cart, pay), recently changed code, historically buggy areas, integrations.
3. **Smoke first** (30–60 min): is the build even testable? If not, stop and escalate.
4. **Deep test the top risks** with a mix of scripted checks and exploratory sessions; lean on existing automation for regression.
5. **Time-box the rest** with quick tours (garbage collector, landmark) and checklists.
6. **Report** coverage and **residual risk** in plain language so the business can make an informed decision.

| Weak response | Strong response |
|---|---|
| "I will work overtime and test everything" | "We can cover the 8 highest risks deeply; here is what remains untested" |
| "I will skip testing low-priority bugs" | "Low-risk areas get a 15-minute tour; we accept that residual risk" |
| "Testing will decide whether to release" | "Testing provides information; the PO/release manager decides" |

**Communication template:** "With 2 days we will cover R1–R4 deeply (≈ 80% of business risk), smoke R5–R6. Not covered: older browsers, real iOS devices. Recommend a canary/feature flag for the coupon engine."`,
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
- **Charter vs opportunity and TBS percentages** let the lead see that 30% went to bug investigation, a sign the area is buggy, and 15% to setup, a project risk to raise.
- **Covered / Not covered** lists turn "looks ok mostly" into explicit coverage and explicit gaps.
- **Bugs with IDs and severity**, and **questions** (like case sensitivity) with the oracle hint ("competitors accept lowercase") make the findings actionable.
- **Debrief confidence** tells the PO whether more testing is needed before approval.`,
      followUps: [
        {
          q: 'Your manager says session sheets are too much paperwork. How do you respond?',
          a: 'I would agree to keep it lean but not drop it. The sheet takes about five minutes and answers the questions the manager will ask anyway: what was covered, what was not, which bugs, how confident are we. I would offer a template with pre-filled fields and short bullet notes, and show how the TBS numbers helped us spot a broken staging environment last sprint. If needed, we can record notes in the Jira ticket itself rather than a separate document.',
        },
        {
          q: 'How would you turn BUG-812 into something the automation suite keeps checking?',
          a: 'After the fix I would write a Playwright regression test for the exact sequence: log in, add an item, apply the coupon, remove the item, re-add it, and assert the order total with a web-first expect on the total locator. I would add a parameterised case for two or three item counts. The exploratory session found the bug once; the automated check makes sure it never silently returns in later releases.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-cc-2',
      title: 'From "everything is high priority" to a real risk assessment',
      context:
        'The release has five changes and testers have three days. The test plan section on risk was written as below. The release manager says it does not help her decide anything.',
      task: 'Rewrite the risk section so it ranks the changes, shows how each score was derived, maps each risk to a test approach and effort, separates project risks, and states residual risk.',
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
          a: 'That is new impact information, so I would update the score rather than argue. If dark mode is the launch headline, the reputational impact of a broken look rises, maybe to 4, giving 16. I would then rebalance: add a Money-tour session on the marketed screens and cross-browser checks, and take that time from lower-risk areas, telling the PO explicitly what we trade off. Risk scores are a shared judgement, not a tester-only decision.',
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
      modelAnswer: `**Definition.** Exploratory testing is testing where learning about the product, designing tests and running them happen at the same time; each observation shapes the next test. It is still disciplined: I work from a **charter** ("Explore checkout with expired and stacked coupons to discover pricing errors"), in a **time-boxed session** (about 90 minutes is typical), I keep **notes**, and I **debrief** with my lead.

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
          a: 'Not really. You do not write step-by-step cases in advance, but you still have a mission (the charter), heuristics for ideas, oracles to judge results, and you document what you did. The test design happens in your head during execution and is captured in session notes. Calling it "no test cases" makes it sound unplanned, which is exactly what interviewers want you to avoid.',
        },
        {
          q: 'When would you NOT rely on exploratory testing?',
          a: 'When exact repeatability is required, for example regulatory evidence that a specific set of steps was executed, or a large regression suite that must run every build. Those need scripted, ideally automated, checks. Exploration also struggles if testers are completely new to the domain with no time to learn; then pairing them with a domain expert or giving richer charters helps.',
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
          a: 'It is a good start but not enough. Normal user paths find usability and happy-path issues, but the expensive bugs often hide in data extremes, concurrency, permissions and failures. I would cover the typical user journey first, then add sessions for edge data, error handling and security-related checks such as other tenants\' data in the result, and tell the PO which risks I am covering beyond "like a user".',
        },
        {
          q: 'How do you report a bug when there is no requirement to point to?',
          a: 'I name the oracle. For example: "Inconsistent with the product: the single-user form rejects duplicate emails, but bulk upload creates duplicates" or "Inconsistent with user expectations and comparable products." I add steps, evidence and the impact. That turns opinion into an argument, and if the behaviour turns out to be intended, the outcome is a clarified requirement, which is still valuable.',
        },
        {
          q: 'How long would you explore before you stop?',
          a: 'I time-box by risk. For a high-risk admin feature I might plan three or four 90-minute sessions, then stop when the charters are done, new sessions stop finding new kinds of problems, and my lead and I are comfortable with the remaining risk. I report what I did not cover so stopping is a visible decision, not a silent one.',
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

**How it drives decisions:** if the payment area shows 40% bug investigation, it needs more sessions; if setup is 30% everywhere, staging is a project risk to escalate. That is more informative than "120 of 150 test cases passed", which says nothing about what the cases looked for.`,
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
        'A close cousin, "How do you prioritize testing tasks in a fast-paced environment?", is reported in the managerial round of an Infosys Quality Engineering Analyst interview experience on GeeksforGeeks (2025).',
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
          a: 'A healthy Playwright regression suite that runs in about 20 minutes on CI covers the stable, known behaviour, so the human time goes to new and risky changes. If the suite is flaky or slow, I would run only the smoke and critical-path tags, review failures quickly, and not let flaky results consume the two days.',
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
          a: 'All else equal I usually take the higher-impact one first, because impact is harder to recover from than likelihood, and severe failures in production cost more. But I would also look at testability and dependencies: if the 4×3 item blocks other testing or a fix is still pending, order may change. The score is a guide for discussion, not a formula that replaces judgement.',
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
          a: 'I ask who designed it and whether the design considered the case I found. If my oracle is a claim, a standard or user impact, I explain that and bring the product owner in, because "as designed" is a product decision, not a technical one. If the PO accepts the behaviour, I close it as "as designed", note it, and maybe suggest updating help text so users are not surprised.',
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
      modelAnswer: `**Checking vs testing.** Bach and Bolton ("Testing and Checking Refined") distinguish **checking**, the mechanistic process of verifying propositions about the product (which machines do well), from **testing**, evaluating a product by learning about it through experiencing, exploring and experimenting (which needs human judgement). A Playwright suite is a powerful checking machine; it only finds problems its assertions anticipated.

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

**Tools help exploration too:** Playwright codegen and trace viewer to record what happened, page.route to simulate a failing API (Saboteur tour), Postman for API probing, browser devtools network throttling.`,
      followUps: [
        {
          q: 'How would you use Playwright itself during an exploratory session?',
          a: 'I can script the boring setup, for example log in through the API, seed a cart with 50 items, then hand over to a headed browser with page.pause() and explore from there. I can mock an API failure with page.route to explore error handling, and turn on tracing so I have a full timeline of what I did when I find a bug. The tool handles setup and evidence; I do the thinking.',
        },
        {
          q: 'A manager says "we have 95% automation coverage, we no longer need exploratory testing". Your reply?',
          a: 'Coverage of what? Automation coverage usually means coverage of known requirements or code lines. It cannot tell us about problems nobody thought of: odd data, new user behaviour, integration surprises. I would point to bugs found in production or in recent exploratory sessions that the suite missed, and propose a small, risk-based exploratory budget per sprint, for example two sessions per new feature.',
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
        'Build a risk matrix and allocate effort. You have 2 testers × 1 day (16 hours). Score each item, rank it, and allocate hours: (A) new UPI payment option, (B) wishlist share link, (C) product image zoom, (D) GST invoice calculation change, (E) login page copy change, (F) order history pagination.',
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
          a: 'That is a project risk materialising. I would start on D (GST) and F immediately, escalate the sandbox outage to the dev lead or vendor contact, and prepare UPI test data and charters meanwhile. If the sandbox stays down, I would flag A as untested in the report and recommend shipping UPI behind a feature flag rather than letting the whole release wait silently.',
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
          a: 'A charter that states the mission, a time-boxed session, heuristics for generating ideas, oracles for recognising problems, session notes as evidence, and a debrief with the lead. Together these make it planned at the level of goals while staying flexible in the steps.',
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
          a: 'It is tested first and deepest: formal techniques such as decision tables and BVA on amounts, at least one exploratory session focused on retries and network drops, an idempotency check on the API, review by a second tester, and inclusion in the automated regression suite.',
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
          a: 'As a project risk with an owner and mitigation: daily environment health checks, an escalation path after a set downtime, maybe a backup environment or containerised setup, and tracking setup time in session sheets so its effect on coverage is visible in reports.',
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
        'With 55% of the time on setup, only about 30 minutes of actual testing happened, so "no bugs" is weak evidence. The sandbox outage is a project risk to escalate. The tester stayed on charter (90%), so rewriting the charter is not the issue, and a low bug-investigation share simply reflects that no bugs were found.',
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
        'While exploring, you see dates shown as 04/11/2025 on the order list but Nov 4, 2025 on the order details page, and 11/04/2025 in the invoice. Which oracle from FEW HICCUPPS are you mainly using?',
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
          a: 'Truncated or re-encoded fields (a long street name cut at 30 characters on the courier label), lost Unicode characters, fields mapped to the wrong place in an export, or edits that update one copy of the data but not another, such as a changed address that never reaches an existing order.',
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
          a: 'A returning customer who keeps checkout open in two tabs, changes the cart in one and pays in the other; or a shopper on a slow mobile connection during a sale with heavy traffic. Operations ideas come from realistic usage patterns rather than from the feature list.',
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
        'The retry logic change touches money, has a P1 history (high likelihood and impact) and can cause double callbacks, so after a quick smoke it gets the deepest testing. The banner is visible but low impact. A 6-hour suite cannot finish in 3 hours and would not focus on the risky change. Listing order says nothing about risk.',
      followUps: [
        {
          q: 'How would you test the retry change in 2 hours?',
          a: 'Check the callback paths: success, a single 504 then success, repeated 504s, a late duplicate callback, and confirm the order is paid exactly once and the customer is charged once. A Saboteur-style session with mocked gateway responses helps, plus a look at logs for duplicate processing. Then a quick check that the button rename did not break the checkout flow or automation locators.',
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
        'Exploration shines when information is missing or changing (new features), when you need to learn fast (incident investigation) and when time is short and adaptability matters. A regulatory audit that demands identical repeated steps needs scripted, documented tests. A nightly run of 600 stable checks is exactly what automation is for.',
      followUps: [
        {
          q: 'How would you explore during a production incident?',
          a: 'Start from the symptoms and logs, form a hypothesis, try to reproduce it in a safe environment with similar data and configuration, vary one factor at a time (user type, browser, timing, data size), and record everything. Each result narrows the search, which is exactly the learn-design-execute loop of exploratory testing.',
        },
      ],
    },
    {
      id: 'mt-exploratory-risk-mcq-11',
      difficulty: 'hard',
      question:
        'A team runs a tool that sends thousands of random taps and text inputs to their Android app overnight, with no knowledge of the screens, and logs crashes with the random seed. What is this best called?',
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
          a: 'Giving the tool a model of the app, such as which screens exist and which actions are valid on each, and possibly weighting actions by importance. It then produces realistic sequences and reaches deeper screens instead of tapping randomly on the first page, which finds more meaningful state bugs.',
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
        'Fixed bugs that would be costly to reintroduce, stable business rules (total calculation for several item counts) and boundary rules (quantity 0 rejected, 1–99 accepted) are repeatable and checkable by assertions, so they are ideal for automation. The tone of an error message needs human judgement. A one-off environment slowness investigation is not a repeatable product check.',
      followUps: [
        {
          q: 'How would you structure the quantity rule as a Playwright test?',
          a: 'As a parameterised test: loop over an array of cases such as 0 (expect error), 1 and 99 (expect accepted) and 100 (expect error), create one test per value with a descriptive title, fill the quantity field using getByLabel and assert with web-first expectations on the error message or cart total. Exploration found the interesting values; the data-driven test keeps checking them.',
        },
      ],
    },
  ],
};

export default topic;
