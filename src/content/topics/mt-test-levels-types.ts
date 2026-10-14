import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-test-levels-types',
  phase: 'manual-basics',
  order: 3,
  title: 'Test Levels & Test Types',
  subtitle:
    'Unit, integration (big-bang, top-down, bottom-up, stubs and drivers), system and acceptance testing; the test pyramid; functional vs non-functional; regression vs retesting; smoke vs sanity; black/white/grey box; cross-browser and mobile; usability, accessibility, performance and security awareness.',
  estimatedMinutes: 90,
  sources: [
    'ISTQB CTFL Syllabus v4.0.1 (2024) — 2.2 Test Levels and Test Types, 2.2.3 Confirmation and Regression Testing, 5.1.6 Test Pyramid',
    'ISTQB Glossary — smoke test (synonyms: confidence test, sanity test, intake test)',
    'ISO/IEC 25010 product quality model (as summarised in CTFL v4.0 §2.2.2)',
    'Mike Cohn — Succeeding with Agile (2009), the original test pyramid',
    'Software Testing Help — Smoke testing vs sanity testing',
    'Guru99 — Integration testing (big bang, top-down, bottom-up, stubs and drivers)',
    'BrowserStack guides — Emulators vs simulators vs real devices',
    'W3C — WCAG 2.2 (contrast minimum 1.4.3, keyboard 2.1.1, target size 2.5.8)',
    'OWASP Top 10 (2021) — awareness for testers',
    'Testleaf / Kiran Academy 2025–2026 manual testing interview lists and AmbitionBox fresher questions (smoke, sanity, regression recur)',
  ],
  tags: ['test-levels', 'integration', 'stubs', 'drivers', 'uat', 'test-pyramid', 'regression', 'smoke', 'sanity', 'black-box', 'cross-browser', 'accessibility'],
  cheatSheet: [
    'ISTQB levels: component (unit) → component integration → system → system integration → acceptance (UAT, operational, contractual, regulatory, alpha, beta).',
    'Integration strategies: big-bang (all at once, hard to localise defects), top-down (needs STUBS for lower modules), bottom-up (needs DRIVERS to call lower modules), sandwich = both.',
    'Stub = fake CALLED module that returns canned answers; driver = fake CALLER that invokes the module under test.',
    'Alpha = acceptance by users/testers at the developer\'s site; beta = real users in their own environment before general release.',
    'Test pyramid: many fast isolated unit tests, fewer service/API tests, few slow end-to-end UI tests; the inverted "ice-cream cone" is the anti-pattern.',
    'Functional = WHAT the system does; non-functional = HOW WELL (performance, usability, security, compatibility, reliability, maintainability, portability, safety).',
    'Retesting (confirmation) = rerun the failed case to confirm a fix; regression = check that the change broke nothing else; select regression scope via impact analysis + risk.',
    'Smoke = broad, shallow build verification on every new build ("can we test it?"); sanity = narrow, deeper check around a change or fix ("does this fix make sense?"). ISTQB glossary lists sanity as a smoke synonym; know both views.',
    'Black-box = from specs, no code knowledge; white-box = from code/structure; grey-box = specs plus partial internal knowledge (DB, APIs, logs).',
    'Cross-browser/mobile: pick browsers/devices from real traffic analytics; emulators for speed, real devices (BrowserStack/LambdaTest) for final validation.',
    'Accessibility quick checks: keyboard-only navigation, visible focus, labels, alt text, contrast ≥ 4.5:1 for normal text (WCAG 2.2 AA).',
  ],
  sections: [
    {
      heading: 'Test levels: from a single unit to user acceptance',
      body: `**Intuition:** building a car. You test each bolt and spark plug (unit), then the engine assembled from them (integration), then the whole car on a track (system), then the car connected to the charging network and the app (system integration), then a customer test-drives it (acceptance).

**Test levels** are groups of test activities organised around a stage of the product, each with its own objectives, test basis, typical defects and owners.

| Level | Test object | Test basis | Typical defects | Usually done by |
|---|---|---|---|---|
| **Component (unit)** | One function, class or module in isolation | Detailed design, code | Wrong calculation, bad branch logic | Developers (unit frameworks, TDD) |
| **Component integration** | Interfaces between components | Architecture, interface specs | Wrong data passed, mismatched formats, call order | Developers / SDETs |
| **System** | The whole application end to end | System requirements, user stories | Wrong end-to-end behaviour, non-functional problems | Independent QA team |
| **System integration** | The system plus external systems (payment gateway, SMS, ERP) | Interface contracts, APIs | Timeouts, auth failures, contract mismatches | QA with integration environment |
| **Acceptance** | The system in a realistic context | Business requirements, user needs, contracts, regulations | Does not fit the business process | Users, PO, customer (QA supports) |

**Worked example: an ATM**

- Unit: the function that checks "amount is a multiple of 100".
- Component integration: the withdrawal module correctly calls the balance module.
- System: card in → PIN → withdraw 2,000 → cash out → receipt, plus a timeout case.
- System integration: the ATM talks to the core banking system and the SMS gateway.
- Acceptance: bank operations staff run day-in-the-life scenarios, including cash reconciliation.

**Remember:** in sequential models, the exit criteria of one level are often the entry criteria of the next. Test *types* (functional, non-functional, black-box, white-box) can be applied at **every** level.`,
      diagram: `  ACCEPTANCE           user/business: "does it meet our needs?"
       ^
  SYSTEM INTEGRATION   app <-> payment gateway, SMS, ERP
       ^
  SYSTEM               whole app, end to end (functional + non-functional)
       ^
  COMPONENT INTEGR.    module A <-> module B interfaces
       ^
  COMPONENT (UNIT)     one function / class in isolation`,
      keyPoints: [
        'Five ISTQB levels; each has its own objective, basis and owner.',
        'Levels describe WHERE in the build-up you test; types describe WHAT quality you test.',
        'Every test type can appear at every level.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.1 Test Levels',
    },
    {
      heading: 'Integration testing: big-bang, top-down, bottom-up, stubs and drivers',
      body: `**Intuition:** if you wire every appliance in a new house at once and the fuse blows, you do not know which one caused it (big-bang). If you plug them in one at a time, you do.

| Strategy | How it works | Needs | Pros | Cons |
|---|---|---|---|---|
| **Big-bang** | Integrate all modules at once, then test | Everything finished | Simple to organise | Defects hard to localise; testing starts late |
| **Top-down** | Start from the top (UI/controller) and add lower modules step by step | **Stubs** for missing lower modules | Early skeleton of the user flow; major design flaws found early | Lower-level logic tested late; many stubs |
| **Bottom-up** | Start from low-level modules (DB access, calculations) and move up | **Drivers** to call the modules | Core logic tested early; no stubs needed | No visible product until late |
| **Sandwich / hybrid** | Top-down and bottom-up meet in the middle | Both | Parallel work | More coordination |

**Stub vs driver:**

- **Stub:** a fake **called** module. It receives the call and returns a canned answer. Example: the checkout UI is ready but the real payment service is not, so a payment stub always returns "APPROVED, txn 123" (or "DECLINED" for a specific card).
- **Driver:** a fake **caller**. It invokes the module under test because the real caller does not exist yet. Example: the tax-calculation module is finished but the cart UI is not, so a small script (or Postman collection) calls the tax API with test carts and checks responses.

**Modern equivalents you will meet in automation:** mocks and fakes in unit tests, service virtualisation, Postman mock servers, and Playwright's network routing to fake an API response. Same idea: replace the missing or unreliable neighbour so you can test what you have.`,
      diagram: `   TOP-DOWN (stubs)                    BOTTOM-UP (drivers)

   [ Checkout UI ]  <- real            [ DRIVER: test script ] <- fake caller
         |                                     |
   [ Order service ] <- real            [ Tax module ] <- real, under test
         |                                     |
   [ STUB: Payment ] <- fake,           [ DB access ]  <- real
     returns "APPROVED"`,
      code: [
        {
          language: 'text',
          title: 'Integration test cases using a payment stub (system not yet integrated)',
          code: `Interface: Order service -> Payment service (stubbed)
Stub rules: card ending 0000 -> APPROVED; 0002 -> DECLINED; 0005 -> 10 s delay

IT-PAY-01  Approved payment
  Input : order 1,499.00, card ****0000
  Expect: order status PAID; stub received amount=149900 (paise), currency=INR
IT-PAY-02  Declined payment
  Input : card ****0002
  Expect: order status PAYMENT_FAILED; user sees "Payment declined"; no stock reserved
IT-PAY-03  Payment timeout
  Input : card ****0005 (stub waits 10 s; client timeout 8 s)
  Expect: order status PAYMENT_PENDING; retry job scheduled; no double charge
IT-PAY-04  Contract check
  Expect: request JSON has fields orderId, amount (integer), currency (ISO 4217)`,
        },
      ],
      keyPoints: [
        'Top-down needs stubs; bottom-up needs drivers.',
        'Big-bang delays testing and makes defects hard to localise.',
        'Stubs let you test error paths (declines, timeouts) that real services rarely produce on demand.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.1 (component integration depends on bottom-up/top-down/big-bang), 1.4.3 (stubs, drivers, service virtualisation); Guru99 — Integration testing',
    },
    {
      heading: 'System testing and acceptance testing (UAT, alpha, beta)',
      body: `**Intuition:** system testing is the chef tasting the full meal against the recipe; acceptance testing is the customer eating it and deciding whether to pay.

**System testing** checks the complete, integrated product against system requirements: end-to-end functional flows **and** non-functional qualities (performance, usability, compatibility). It is usually done by an independent QA team in an environment close to production.

**Acceptance testing** focuses on **validation** and readiness for deployment. Forms named by the ISTQB:

| Form | Who | Question | Example |
|---|---|---|---|
| **User acceptance testing (UAT)** | Intended business users | Does it support our real work? | Store managers process a day's returns in the new returns screen |
| **Operational acceptance testing (OAT)** | Ops / admins | Can we run and support it? | Backups, restore, failover, monitoring alerts, patching |
| **Contractual acceptance** | Customer per contract | Does it meet agreed criteria? | Vendor delivers a portal; acceptance criteria listed in the contract |
| **Regulatory acceptance** | Against laws/standards | Is it compliant? | Banking app meets RBI or accessibility regulations |
| **Alpha testing** | Users or independent testers **at the developer's site** | Early feedback in a controlled setting | Internal staff use the new app version for two weeks |
| **Beta testing** | Real users **in their own environment** | Does it work in the wild? | TestFlight / Play Console beta to 2,000 customers |

**QA's role in UAT:** prepare the environment and data, help write UAT scenarios from business processes, train users, triage their reports (bug vs change request vs training issue), and track sign-off.

**Common mistake:** treating UAT as "QA runs the regression suite again". UAT must be driven by business users and their real scenarios, otherwise it is just more system testing.`,
      keyPoints: [
        'System testing = verification of the whole product against its spec, functional and non-functional.',
        'Acceptance = validation of fitness for use; ideally done by the intended users.',
        'Alpha = at developer site; beta = users\' own environment.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.1 System testing and Acceptance testing',
    },
    {
      heading: 'The test pyramid',
      body: `**Intuition:** a building needs a wide, solid foundation and a small roof. Lots of cheap, fast tests at the bottom; a few expensive, slow ones at the top.

Mike Cohn's original pyramid (2009) had three layers: **unit**, **service**, **UI**. The ISTQB v4.0 describes it as: the higher the layer, the lower the isolation and granularity and the slower the test, so you need many small tests at the bottom and few large end-to-end tests at the top.

| Layer | Speed | Example on SauceDemo-like shop | Who writes |
|---|---|---|---|
| Unit (component) | Milliseconds | "calculateTax(29.99) returns 2.40" | Developers |
| Service / API / integration | Tens to hundreds of ms | POST /cart adds item; GET /cart total correct | Developers, SDETs, QA with Postman/Playwright request |
| UI end-to-end | Seconds each | Login → add backpack → checkout → "Thank you for your order!" | QA / SDETs with Playwright |
| (On top) Manual exploratory | Human time | Charters on new features, usability | QA |

**The anti-pattern: the "ice-cream cone".** Mostly manual and UI tests, few unit tests. Symptoms: slow, flaky suites, long feedback, bugs found late. Teams moving from manual to automation often start here by automating every manual case through the UI.

**What this means for you as a new Playwright engineer:**

- Automate the **critical user journeys** end to end (login, checkout), not every validation message.
- Push rule-heavy checks (coupon maths, tax rounding) **down** to API or unit tests where they are faster and more stable.
- Use API calls to **set up** data for UI tests instead of clicking through setup screens.

The pyramid is a guideline, not a law; some products (UI-heavy, little logic) reasonably look more like a "trophy". The point is cost-effective feedback.`,
      diagram: `                 /\\
                /  \\        few   E2E UI tests (Playwright)   slow, brittle
               /____\\
              /      \\      some  API / service tests          medium
             /________\\
            /          \\    many  unit tests                   fast, isolated
           /____________\\

   Anti-pattern "ice-cream cone":  big manual + UI top, tiny unit base`,
      keyPoints: [
        'Many fast unit tests, fewer API tests, few E2E UI tests.',
        'Avoid automating every manual case through the UI (ice-cream cone).',
        'Push business-rule checks down the pyramid; keep E2E for critical journeys.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 5.1.6 Test Pyramid; Mike Cohn — Succeeding with Agile (2009)',
    },
    {
      heading: 'Functional vs non-functional testing',
      body: `**Intuition:** functional testing asks "does the lift go to floor 5 when I press 5?"; non-functional asks "how fast, how safely, how reliably, and can a wheelchair user reach the button?".

| | Functional | Non-functional |
|---|---|---|
| Question | **What** does the system do? | **How well** does it do it? |
| Basis | Requirements, user stories, business rules | Quality characteristics, SLAs, standards |
| Example (SauceDemo) | Adding a backpack shows badge "1" | Inventory page loads in under 2 s on 4G; works on Safari; usable by keyboard |
| Techniques | EP, BVA, decision tables, state transition | Load tools, accessibility checkers, security scanners, usability sessions |

**ISO/IEC 25010 non-functional characteristics** (as listed in CTFL v4.0): performance efficiency, compatibility, usability (interaction capability), reliability, security, maintainability, portability (flexibility), safety.

Key points from the syllabus:

- Many non-functional tests **reuse functional tests** while checking a constraint (e.g. "checkout completes **within 3 seconds**").
- **Late discovery** of non-functional defects (e.g. the system cannot handle sale-day traffic) can threaten the whole project, so start early where possible.
- Some need special environments (performance lab, usability lab, device farm).

**Interview tip:** when asked to test anything (a pen, a lift, a login page), split your answer into functional and non-functional. It instantly shows structure.`,
      keyPoints: [
        'Functional = behaviour; non-functional = quality attributes.',
        'Know the eight ISO 25010 characteristics by name.',
        'Non-functional checks often ride on functional flows with an added constraint.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.2 Test Types; ISO/IEC 25010',
    },
    {
      heading: 'Regression testing vs retesting (confirmation testing)',
      body: `**Intuition:** your plumber fixes the kitchen tap. **Retesting:** turn on the kitchen tap; does it still leak? **Regression testing:** check the bathroom shower and the washing machine too, because the plumber touched the shared pipe.

| | Retesting (confirmation testing) | Regression testing |
|---|---|---|
| Purpose | Confirm a **specific defect** is fixed | Confirm a **change** did not break anything that worked before |
| Which tests | The failed test(s) that found the defect (plus new tests for the fix) | Previously passing tests around and beyond the change |
| Planned in advance? | No, triggered by a fix | Yes, a maintained suite selected per change |
| Automation | Usually manual first | Prime candidate for automation (runs every release) |
| Order | Retest first, then regression | After the fix is confirmed |

**Selecting regression scope** (you rarely have time for everything):

1. **Retest all:** run the full suite. Safest, slowest; fine when automated and cheap.
2. **Selection by impact analysis:** ask what changed (code, config, shared components, data) and test those areas plus their dependants. The ISTQB recommends impact analysis first.
3. **Prioritisation by risk:** P1 business-critical flows, high-usage features, historical defect clusters, recently changed areas first.
4. **Hybrid (most common):** always-run core (smoke + P1 journeys) + impact-selected cases + a slice of rotating lower-priority cases.

**Worked example: hotfix on coupon rounding.** Change: discount rounding in the pricing service. Retest: BUG-881's case (SAVE10 on 999.99). Regression: all coupon cases, checkout totals, order confirmation email totals, invoice PDF, refunds (they reuse pricing), plus the smoke suite. Skip: login, profile, product search, as they do not touch pricing.

Regression can also be about the **environment** (OS update, browser version, database upgrade) with no code change at all.`,
      code: [
        {
          language: 'text',
          title: 'Regression selection worksheet for hotfix 3.2.1 (pricing rounding)',
          code: `CHANGE: PricingService.roundDiscount() now rounds half-up to 2 decimals
CALLERS (from dev + code search): cart total, checkout overview, invoice PDF,
                                  refund calculator, order email template

STEP 1  Retest   TC-CPN-14 (BUG-881: SAVE10 on 999.99 -> 899.99)       1 case
STEP 2  Always   Smoke suite                                           12 cases
STEP 3  Impact   Coupon cases (14) + overview totals (8) + invoice (3)
                 + refunds (5) + order email (2)                       32 cases
STEP 4  Risk     Payment P1 journeys touching totals                    4 cases
SKIPPED          Login, profile, search, sorting (no dependency)  ~120 cases

TOTAL 49 cases (~4 h manual; 12 smoke + 18 already automated run in CI)
Residual risk noted in release ticket: reports module uses its own rounding`,
        },
      ],
      keyPoints: [
        'Retesting = the fixed defect; regression = everything the change might affect.',
        'Use impact analysis + risk to select regression scope; keep a fixed core.',
        'Regression suites grow every release, so they are the first thing to automate.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.3 Confirmation Testing and Regression Testing; regression test selection literature (Rothermel & Harrold: retest-all vs selective)',
    },
    {
      heading: 'Smoke vs sanity testing',
      body: `**Intuition:** **smoke** is switching on a newly delivered TV and flicking through a few channels to see it is not dead on arrival. **Sanity** is, after the repairman fixed the HDMI port, checking that HDMI and the things around it really work now.

The term "smoke test" comes from hardware: power it on and see if smoke comes out.

| | Smoke testing | Sanity testing |
|---|---|---|
| Question | Is this build stable enough to test at all? | Does this specific change/fix behave sensibly, so deeper testing is worthwhile? |
| When | Every new build, before any other testing | After a minor change or bug fix on a relatively stable build |
| Breadth / depth | **Broad and shallow**: touches all critical areas | **Narrow and deeper**: focuses on the changed area |
| Scripted? | Usually scripted, ideally automated in CI | Often unscripted or a short checklist |
| Relation | Also called build verification test (BVT) | Often described as a quick subset of regression |
| Outcome if it fails | **Reject the build**; no further testing | Stop and send the change back before full regression |

**SauceDemo smoke suite (10–15 min, or 1–2 min automated):** site loads; standard_user can log in; inventory shows 6 products; add to cart updates the badge; cart page lists the item; checkout info → overview → finish shows "Thank you for your order!"; logout works.

**Sanity example:** a fix changes the "Price (low to high)" sort. Sanity: check that sort option, the other three sort options, and that adding a sorted item to the cart still works. If any fails, send it back immediately rather than starting a full regression.

**Terminology warning (great interview point):** companies use these words inconsistently, and the **ISTQB glossary actually lists "sanity test" as a synonym of smoke test**. Say: "In my team, smoke meant build acceptance across all critical features and sanity meant a focused check after a fix," and then describe what you actually did. Interviewers reward clarity over dogma.`,
      keyPoints: [
        'Smoke = broad, shallow, every build, decides whether to accept the build.',
        'Sanity = narrow, focused on a change, decides whether deeper testing is worthwhile.',
        'Definitions vary; ISTQB treats them as synonyms. Explain your team\'s usage.',
      ],
      source: 'ISTQB Glossary — smoke test; Software Testing Help — Smoke vs sanity testing; AmbitionBox / Testleaf 2025 interview question lists',
    },
    {
      heading: 'Positive vs negative testing',
      body: `**Intuition:** positive testing checks that the door opens with the right key; negative testing checks that it stays locked with the wrong key, a bent key, or a hairpin.

| | Positive testing | Negative testing |
|---|---|---|
| Input | Valid data, expected user behaviour | Invalid, unexpected, malicious or missing data |
| Goal | The system does what it should | The system handles bad input gracefully: clear error, no crash, no data corruption, no security hole |
| Proportion | Fewer cases | Often more cases, because there are many ways to be wrong |

**Worked example: coupon field (valid codes are uppercase letters and digits, 4–12 characters, case-insensitive).**`,
      code: [
        {
          language: 'text',
          title: 'Coupon field: positive and negative cases',
          code: `POSITIVE
P1  SAVE10 on 1,000 cart                 -> 10% off, total 900.00
P2  save10 (lower case)                  -> accepted (case-insensitive rule)
P3  " SAVE10 " (spaces around)           -> trimmed and accepted
P4  Remove applied coupon                -> total back to 1,000.00

NEGATIVE
N1  Empty field, click Apply             -> "Enter a coupon code"; Apply disabled or no-op
N2  UNKNOWN99                            -> "Coupon not found"; total unchanged
N3  Expired OLD20                        -> "Coupon expired on 31 Jan 2025"
N4  13 characters ABCDEFGHIJKLM          -> rejected or truncated per spec (BVA 12/13)
N5  SAVE10' OR '1'='1                    -> treated as plain text, "not found"; no 500 error
N6  <script>alert(1)</script>            -> shown escaped, never executed
N7  Apply SAVE10 twice quickly           -> discount applied once only
N8  10 wrong codes in a minute           -> rate-limited / captcha (if specified)`,
        },
      ],
      keyPoints: [
        'Negative testing protects users, data and security, not just error messages.',
        'Expected result of a negative test is graceful handling, never "it fails".',
        'Combine with EP/BVA (covered in Test Design) to choose values systematically.',
      ],
      source: 'Glenford Myers — The Art of Software Testing, Ch 2 (test invalid and unexpected inputs as well as valid ones)',
    },
    {
      heading: 'Black-box, white-box and grey-box testing',
      body: `**Intuition:** black-box is judging a vending machine only by pressing buttons; white-box is opening the panel and checking every wire; grey-box is pressing buttons while also watching the machine's display log.

| | Black-box | White-box | Grey-box |
|---|---|---|---|
| Based on | Specifications, requirements, behaviour | Internal structure: code, branches, architecture, data flows | Specs **plus** partial internal knowledge |
| Knowledge of code | None needed | Required | Some: DB schema, API contracts, logs, architecture |
| Typical techniques | EP, BVA, decision tables, state transition, use cases | Statement and branch coverage, code reviews | API + DB checks, log inspection, targeted tests from architecture |
| Typical level | System, acceptance | Unit, component integration | Integration, system, API |
| Who | Testers, users | Developers, SDETs | QA engineers with technical skills |

**Worked example: ATM withdrawal of 2,000.**

- **Black-box:** insert card, PIN, withdraw 2,000 → 2,000 dispensed, balance reduced by 2,000, receipt printed.
- **White-box:** ensure tests execute both branches of "if (amount > dailyRemaining)" and the exception path when the cash cassette is empty.
- **Grey-box:** after the withdrawal, query the transactions table to verify one debit row, correct amount and status; check the log shows no retry; call the balance API directly.

Most real QA work in product companies is **grey-box**: you test through the UI like a user, but you also use SQL, API calls and logs to confirm what really happened. That is exactly the skill set the API, SQL and Playwright phases of this course build.`,
      keyPoints: [
        'Black-box from specs; white-box from code structure; grey-box mixes both.',
        'White-box coverage (statement/branch) mostly lives at unit level.',
        'Checking DB/API/logs behind a UI action is grey-box testing.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.2 (black-box and white-box test types), 4.2–4.3',
    },
    {
      heading: 'Cross-browser, mobile and responsive testing',
      body: `**Intuition:** your website is a play performed in many theatres (Chrome, Safari, Firefox, Android, iPhone). The script is the same, but the stage sizes, lighting and acoustics differ.

**Choosing what to cover:** you cannot test every browser × OS × device. Use **real traffic analytics** (e.g. Google Analytics) and business priorities. Typically cover the browsers/devices that make up ~90–95% of users, plus anything contractually required.

| Option | What it is | Good for | Limits |
|---|---|---|---|
| **Browser dev tools device mode / Playwright device emulation** | Desktop browser pretends to be a phone (viewport, user agent, touch) | Fast responsive layout checks, CI | Not a real mobile browser engine or hardware |
| **Emulator** (Android) / **Simulator** (iOS) | Virtual device on your machine | Functional app testing, debugging, CI | No real battery, sensors, network quirks, interrupts; performance differs |
| **Real devices** (own lab) | Physical phones/tablets | Final validation, gestures, camera, performance | Costly to buy and keep updated |
| **Cloud device farms** (BrowserStack, LambdaTest, Sauce Labs) | Remote real devices and browser/OS combos | Wide coverage without owning hardware; parallel runs | Subscription cost; some latency |

**Responsive testing checklist:** common breakpoints (e.g. 360, 768, 1024, 1440 px wide), portrait/landscape, no horizontal scrolling, readable text without zoom, tappable targets, menus collapse into a hamburger and still work, images scale, forms usable with the on-screen keyboard.

**Typical cross-browser defects:** date pickers behaving differently in Safari, CSS layout breaks, unsupported JavaScript APIs, autofill differences, file upload differences on iOS, fonts and rendering.

**Automation note:** Playwright runs the same tests on Chromium, Firefox and WebKit and can emulate devices, which is excellent for regression; still keep a short **real-device** pass for release-critical mobile flows, as BrowserStack and others recommend.`,
      keyPoints: [
        'Pick the matrix from analytics, not from "all browsers".',
        'Emulators/simulators for speed; real devices for final validation.',
        'Responsive testing = breakpoints, orientation, touch, on-screen keyboard.',
      ],
      source: 'BrowserStack guides — Emulator vs simulator vs real devices; Playwright docs — Emulation (devices)',
    },
    {
      heading: 'Usability and accessibility basics',
      body: `**Intuition:** usability is "can people use it easily?"; accessibility is "can **everyone** use it, including people who are blind, deaf, have motor impairments, or use a keyboard only?".

**Usability heuristics a manual tester can check quickly** (inspired by Nielsen's heuristics): clear feedback after every action, consistent wording and layout, error messages that say what went wrong and how to fix it, easy undo (remove from cart), no unnecessary fields, sensible defaults.

**Accessibility (WCAG 2.2, POUR principles):** content must be **P**erceivable, **O**perable, **U**nderstandable and **R**obust. Many countries and contracts require WCAG 2.x Level AA.

| Quick manual check | How | WCAG reference (AA) |
|---|---|---|
| Keyboard only | Unplug the mouse: Tab through login and checkout; every control reachable, logical order, no keyboard trap | 2.1.1 Keyboard, 2.1.2 No Keyboard Trap |
| Visible focus | You can always see which element is focused | 2.4.7 Focus Visible |
| Labels | Every input has a visible label announced by screen readers (not just placeholder text) | 1.3.1, 3.3.2 Labels or Instructions |
| Alt text | Product images have meaningful alt text; decorative images empty alt | 1.1.1 Non-text Content |
| Contrast | Normal text at least 4.5:1, large text 3:1 | 1.4.3 Contrast (Minimum) |
| Errors | Error messages identify the field in text, not colour alone | 3.3.1 Error Identification, 1.4.1 Use of Color |
| Target size | Click/tap targets at least 24 by 24 CSS px (or enough spacing) | 2.5.8 Target Size (Minimum), new in 2.2 |
| Zoom | Page usable at 200% zoom | 1.4.4 Resize Text |

**Tools:** browser accessibility tree, Lighthouse, axe DevTools, screen readers (NVDA on Windows, VoiceOver on macOS/iOS, TalkBack on Android). Automation tools like axe catch only a portion of issues; keyboard and screen-reader checks by a human are still essential.

**Bonus for automation:** Playwright's recommended locators (getByRole, getByLabel) only work well when the page is accessible, so accessible pages are also easier to automate.`,
      keyPoints: [
        'Usability = ease of use; accessibility = usable by people with disabilities.',
        'Keyboard-only and contrast checks need no tools and find many issues.',
        'WCAG 2.2 AA is the common target; automated scanners find only part of the problems.',
      ],
      source: 'W3C — WCAG 2.2 (success criteria 1.1.1, 1.4.3, 2.1.1, 2.4.7, 2.5.8, 3.3.1); ISTQB CTFL v4.0.1 — 2.2.2 (usability as a non-functional characteristic)',
    },
    {
      heading: 'Performance and security awareness for QA',
      body: `**Intuition:** a shop that works for one customer may collapse on sale day (performance), and a shop with a perfect checkout may still leave the back door unlocked (security). Manual testers are not expected to be specialists, but they are expected to **notice**, **ask** and **run basic checks**.

**Performance test types:**

| Type | Question | Example |
|---|---|---|
| Load | Does it meet targets at expected peak load? | 2,000 concurrent shoppers, p95 page load under 2 s |
| Stress | Where does it break, and how does it fail? | Ramp to 10,000 users until errors appear; does it recover? |
| Spike | Can it handle a sudden jump? | Flash sale at 12:00 multiplies traffic by 10 in a minute |
| Soak / endurance | Does it degrade over time? | 8 hours at normal load; memory leaks, slow-down |
| Volume | Large data amounts? | Order history with 50,000 orders per customer |
| Scalability | Does adding resources help linearly? | 2 servers vs 4 servers throughput |

Tools: JMeter, k6, Gatling, Locust; browser dev tools and Lighthouse for page-level speed. **What a manual QA can do:** note slow pages with timings, check the network tab for huge images or repeated calls, check behaviour with a throttled connection (Slow 4G), and raise performance requirements in refinement ("how fast is fast enough?").

**Security awareness (inspired by the OWASP Top 10; Broken Access Control ranked #1 in the 2021 edition):**

- **Access control:** change an order ID in the URL (/orders/1001 → /orders/1002). Can you see someone else's order? Can a normal user open admin pages?
- **Injection and XSS:** enter characters such as a single quote, or a script tag, into inputs; the app should treat them as text.
- **Authentication and sessions:** logout then press Back; does the session end? Is there rate-limiting on login? Are passwords masked and never in URLs?
- **Sensitive data:** no card numbers, tokens or passwords in logs, URLs, error pages or local storage; HTTPS everywhere.
- **Error handling:** errors do not reveal stack traces or SQL.

Report suspected security issues privately to the right owner, not in public channels. Deep penetration testing is a specialist activity, but these checks catch real bugs.`,
      keyPoints: [
        'Know load vs stress vs spike vs soak with an example each.',
        'Manual QA adds value by measuring, throttling and asking for numeric performance requirements.',
        'Basic security checks: access control via URL/IDs, injection/XSS input, session handling, data exposure.',
      ],
      source: 'ISTQB CTFL v4.0.1 — 2.2.2 (performance efficiency and security as quality characteristics); OWASP Top 10 (2021)',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-test-levels-types-cc-1',
      title: 'Turn "run full regression" into an impact-based hotfix test plan',
      context: `A hotfix changes how shipping cost is calculated for orders above 1,000. Release is in 3 hours. The current plan from the team lead is below, and the full regression takes 2 days manually.`,
      task: `Rewrite the plan so it fits in the 3-hour window: separate retesting from regression, select regression scope using impact analysis and risk, state what is skipped and the residual risk, and define who decides go/no-go.`,
      starter: {
        language: 'text',
        title: 'Weak hotfix test plan',
        code: `Hotfix 4.1.1 - shipping cost
- Test the fix.
- Do full regression of the application.
- If time is less, do some regression.
- Release when testing is done.`,
      },
      hints: [
        'What exactly did the fix touch, and which features call that code? Ask the developer for the change list.',
        'What is the minimum that must always run, regardless of the change?',
        'What will you deliberately not test, and who must know about it?',
      ],
      solution: {
        language: 'text',
        title: 'Impact-based hotfix plan (3-hour window)',
        code: `HOTFIX 4.1.1 - ShippingCalculator: free shipping threshold > 1,000 (was >= 1,000)
Inputs: dev change list (1 file, 1 config key), callers found by code search:
        cart summary, checkout overview, order confirmation, invoice PDF

00:00-00:20  RETEST (confirmation)
  BUG-1203 original steps: cart 1,000.00 -> shipping 50.00 (now charged)
  New boundary checks: 999.99 -> 50.00 | 1,000.00 -> 50.00 | 1,000.01 -> 0.00
00:20-00:35  SMOKE (always): automated smoke suite in CI (12 cases) + manual login/checkout
00:35-02:00  IMPACT-BASED REGRESSION (22 cases)
  Cart + checkout totals with shipping (8) | coupon + shipping combos (6)
  Order confirmation + email totals (4)    | invoice PDF shipping line (2)
  Mobile web checkout on iPhone/Safari (2)
02:00-02:30  RISK SLICE: payment P1 journeys (UPI, card) end to end (4)
02:30-03:00  Report + go/no-go

NOT TESTED (no dependency on ShippingCalculator): login, search, profile,
  wishlist, reviews (~180 cases). Residual risk: LOW.
UNKNOWN: returns module may read shipping config -> dev confirmed it does not.
GO/NO-GO: QA reports results + residual risk; PO decides.`,
      },
      explanation: `**What improved:**

- **Retesting vs regression separated:** the fix is confirmed first, including the exact boundary that changed (>= became >), because boundary changes are where off-by-one defects hide.
- **Impact analysis:** scope comes from the actual change list and its callers, not from guesswork; this is what the ISTQB recommends before regression.
- **Fixed core:** the smoke suite always runs, mostly automated, so it costs minutes.
- **Risk slice:** payment journeys are business-critical even if not directly changed.
- **Explicit exclusions and residual risk:** "do some regression" becomes a list of what is skipped and why, so the PO makes an informed go/no-go.
- **Time-boxed:** each block has a time, so you know at 01:30 whether you are on track.`,
      followUps: [
        {
          q: 'At 01:45 you find a defect in the invoice PDF shipping line. What now?',
          a: 'Log it immediately with evidence, assess severity (wrong amount on a legal document is likely Major or Critical), and tell the PO and developer right away rather than at 03:00. Options: fix and retest the PDF only (15 to 20 minutes), release with a known issue if invoices can be corrected later, or delay. The decision belongs to the PO, informed by my risk assessment.',
        },
        {
          q: 'How would automation change this plan next time?',
          a: 'If the checkout and totals regression were automated in Playwright and tagged by feature, the impact-based selection could run in CI in minutes, perhaps across three browsers in parallel. Manual time would then go to exploratory testing around the changed boundary and the PDF, which machines check poorly.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-cc-2',
      title: 'Rebuild a weak smoke checklist into a real build-verification suite',
      context: `Builds arrive on the QA environment several times a day. Testers often spend an hour before discovering a build is broken. The current "smoke test" document is below.`,
      task: `Rewrite it into a smoke suite for SauceDemo that is broad and shallow, takes about 10 minutes manually (or 2 minutes automated), has clear pass/fail expectations, and states the rule for accepting or rejecting the build.`,
      starter: {
        language: 'text',
        title: 'Weak smoke checklist',
        code: `Smoke test:
- Check login
- Check all products, sorting, filters and prices
- Check cart
- Check checkout with all error messages
- Check the UI looks ok
Do it when you have time.`,
      },
      hints: [
        'Smoke is broad and shallow: one meaningful check per critical area. Which items here are too deep?',
        'Each step needs an observable expected result.',
        'When must it run, and what happens if one step fails?',
      ],
      solution: {
        language: 'text',
        title: 'Build verification (smoke) suite: SauceDemo',
        code: `SMOKE SUITE SM-01  (target: 10 min manual / ~2 min automated in CI)
Runs: on EVERY new build deployed to QA, before any other testing.

ID     Area        Step                                         Expected
SM-01  Availability Open https://www.saucedemo.com              Login form visible, no console errors
SM-02  Login        standard_user / secret_sauce                /inventory.html, heading "Products"
SM-03  Catalogue    View inventory                              6 products with names and prices
SM-04  Cart         Add "Sauce Labs Backpack"                    Cart badge shows 1
SM-05  Cart         Open cart                                   Backpack listed, price $29.99
SM-06  Checkout     Checkout, enter Asha / Rao / 560001, Continue Overview shows Total $32.39
SM-07  Checkout     Finish                                      "Thank you for your order!"
SM-08  Session      Menu > Logout                               Back on login page
SM-09  Negative     locked_out_user / secret_sauce              Lock-out error shown (auth works)

DEEPER CHECKS MOVED OUT: sorting, all error messages, prices of every
product, visual review -> regression / feature suites.

RULE: any SM failure = build REJECTED. Raise a Blocker with the failing
SM id, build number and screenshot; notify dev channel; no further
testing on this build. Resume when a new build passes all 9 steps.`,
      },
      explanation: `**Key fixes:**

- **Broad and shallow:** one check per critical area (availability, login, catalogue, cart, checkout, session). Sorting, every error message and visual review were moved to regression, because they made the "smoke" test deep and slow.
- **Observable expectations:** URLs, exact texts, prices and totals replace "check login" and "looks ok".
- **Timing and trigger:** runs on every new build first, not "when you have time".
- **Explicit acceptance rule:** any failure rejects the build, with a defined way to report and resume. This is what saves the hour wasted on broken builds.
- **Includes one negative check:** SM-09 proves authentication is actually enforcing rules, not just letting everyone in.
- **Automation-ready:** a small, stable, high-value suite like this is the first thing to automate in Playwright and run on each deploy.`,
      followUps: [
        {
          q: 'A developer asks you to "skip smoke this time, it is a tiny CSS change". Do you agree?',
          a: 'If the smoke suite is automated and takes two minutes, there is no reason to skip it, so I would run it anyway. If it is manual, I might agree to a reduced sanity check for the touched pages, but CSS changes can hide buttons or break layouts site-wide, so at minimum login and checkout should be checked. Skipping should be a conscious, recorded decision.',
        },
        {
          q: 'How is this smoke suite different from a sanity test after a sorting fix?',
          a: 'Smoke is broad: it touches every critical area shallowly to decide whether the build is testable at all. A sanity test after a sorting fix is narrow: it checks the four sort options and items next to them (e.g. adding a sorted item to the cart) in more depth, to decide whether the fix is good enough to proceed to regression.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-test-levels-types-iq-01',
      difficulty: 'easy',
      question: 'A new build lands on QA at 10 a.m. and a separate fix for the price sort arrives at 3 p.m. Which of these is a smoke test and which is a sanity test, and what exactly would you run for each on SauceDemo?',
      context: 'Smoke vs sanity is among the most repeated manual-testing questions in AmbitionBox and Testleaf 2025 lists; this version checks whether you can apply it.',
      whatInterviewerLooksFor: [
        'Smoke = broad and shallow build acceptance; sanity = narrow check around a change',
        'Concrete steps for each, not definitions only',
        'Knows what happens when each fails',
        'Acknowledges terminology varies (ISTQB treats them as synonyms)',
      ],
      modelAnswer: `**10 a.m. new build → smoke test (build verification).** Goal: is this build stable enough to test? Broad and shallow, every critical area once:

1. Site loads; login as standard_user works and lands on Products.
2. Inventory shows 6 products.
3. Add backpack → badge 1 → cart lists it.
4. Checkout with valid details → overview → Finish → "Thank you for your order!".
5. Logout works; locked_out_user still gets the lock-out error.

About 10 minutes manually, or a couple of minutes if automated in CI. **If any step fails, I reject the build** with a Blocker and do not start other testing.

**3 p.m. sort fix → sanity test.** Goal: does this fix behave sensibly before I invest in regression? Narrow and a bit deeper:

1. "Price (low to high)": Onesie $7.99 first, Fleece Jacket $49.99 last, every price ≥ the previous.
2. The other three sort options still work.
3. Add an item after sorting → cart badge and cart contents correct.
4. Refresh the page: does the chosen sort persist or reset (per the requirement)?

If sanity fails, the fix goes back immediately. If it passes, I run regression around inventory and cart.

**Terminology note:** some teams and the ISTQB glossary use "sanity" as a synonym for smoke. I explain what I ran rather than argue about labels.`,
      followUps: [
        {
          q: 'Should the smoke suite be automated? Who should run it?',
          a: 'Yes, it is the ideal first automation target: small, stable, run on every build. In a CI pipeline it should run automatically after each deployment to QA, so nobody has to remember. Developers can run it before handing over too. Manual smoke is acceptable while automation is being built, but it costs tester time on every build.',
        },
        {
          q: 'Is sanity testing documented?',
          a: 'Often it is lighter than other testing, a short checklist or unscripted, because it is fast and focused. I still record what I checked and the result in the ticket (for example, "sanity on build 412: 4 sort options OK, cart OK"), so the decision to proceed to regression is traceable.',
        },
      ],
      pitfalls: [
        'Reciting definitions with no concrete steps',
        'Making smoke deep (testing every error message)',
        'Insisting there is one universally correct definition',
      ],
    },
    {
      id: 'mt-test-levels-types-iq-02',
      difficulty: 'medium',
      question: 'Explain retesting versus regression testing, and tell me how you decide the regression scope when a developer fixes a rounding bug in the cart total two days before release.',
      whatInterviewerLooksFor: [
        'Retesting = confirm the specific fix; regression = side effects of the change',
        'Order: retest first, then regression',
        'Uses impact analysis and risk to choose scope',
        'States exclusions and residual risk',
      ],
      modelAnswer: `**Definitions.**

- **Retesting (confirmation testing):** rerun the test(s) that failed because of the defect to confirm it is fixed. Here: the cart with 3 × 333.33 that showed 999.98 instead of 999.99.
- **Regression testing:** check that the change did not break anything that previously worked, in the same area or elsewhere.

**Order:** retest first (no point regressing a fix that does not work), then regression.

**Choosing regression scope (impact analysis + risk):**

1. **Ask what changed:** the developer's change list and which components call the rounding function: cart, checkout overview, invoice, order email, refunds, maybe reports.
2. **Always-run core:** smoke suite + P1 checkout journeys.
3. **Impact-selected:** all total-related cases: coupons, tax, shipping, multi-quantity items, currencies if any, invoice and email totals, refunds.
4. **Boundaries:** values that round differently (x.xx5), large carts, zero.
5. **Skip with reason:** login, search, profile, which do not touch pricing.
6. **Report residual risk:** e.g. "Reports module has its own rounding, not retested."

With two days left I would also run any automated regression fully in CI (it is cheap) and spend manual time exploring around money calculations, where defects cluster.`,
      followUps: [
        {
          q: 'What if the developer cannot tell you everything the change affects?',
          a: 'Combine sources: search the code or ask for a quick dependency check, look at the RTM for requirements touching totals, check defect history for related modules, and widen the regression slice for high-risk money flows. When uncertainty remains, I state it as residual risk in the report rather than pretending the scope is complete.',
        },
        {
          q: 'Can regression testing be needed without any code change?',
          a: 'Yes. Environment changes can break working software: a browser auto-update, an OS patch, a database version upgrade, a new third-party API version, or a configuration change. The ISTQB notes regression testing can relate to the environment, not just the test object.',
        },
      ],
      pitfalls: [
        'Using "retesting" and "regression" interchangeably',
        'Always proposing full regression regardless of time',
        'Choosing scope by gut feeling without impact analysis',
      ],
    },
    {
      id: 'mt-test-levels-types-iq-03',
      difficulty: 'medium',
      question: 'The checkout UI is ready but the payment service it calls is still being built, and the tax module is ready but nothing calls it yet. How would you integration-test both, and what are stubs and drivers in this situation?',
      whatInterviewerLooksFor: [
        'Stub = fake called module (payment); driver = fake caller (tax)',
        'Links stubs to top-down and drivers to bottom-up',
        'Uses stubs to test error paths (decline, timeout)',
        'Knows modern equivalents (mocks, mock servers, route interception)',
      ],
      modelAnswer: `**Checkout UI → payment service (missing): use a STUB.** A stub replaces the **called** module. It accepts the payment request and returns canned answers, which is typical of **top-down** integration.

- Card ending 0000 → APPROVED; 0002 → DECLINED; 0005 → waits 10 s (timeout).
- Tests: order becomes PAID on approval; on decline, the user sees "Payment declined" and no stock is reserved; on timeout, the order is PENDING and the user is not charged twice; request body matches the contract (amount as integer, currency code).
- Bonus: stubs make it easy to test failure paths that a real payment sandbox rarely produces on demand.

**Tax module (no caller yet): use a DRIVER.** A driver replaces the **caller**: a script, Postman collection or test harness that calls the tax API directly with prepared carts and checks the responses, typical of **bottom-up** integration.

- Inputs: 29.99 → 2.40 at 8%; zero cart; very large cart; item exempt from tax.

**Later:** when the real payment service arrives, I rerun the same cases against it (system integration testing) and keep the stub for fast, deterministic tests in CI.

**Modern names:** mocks/fakes in unit tests, mock servers in Postman, service virtualisation, and Playwright's page.route to fulfil a network request with a fake response.`,
      followUps: [
        {
          q: 'What is the risk of testing only against stubs?',
          a: 'The stub reflects your assumptions about the real service. If the real API returns a different field name, a new status, or slower responses, stub-based tests still pass. That is why you also need contract tests and a system integration test against the real service or its sandbox before release.',
        },
        {
          q: 'Why is big-bang integration considered risky?',
          a: 'All modules are combined at once, so testing starts late and, when something fails, the defect could be in any interface, making it slow to localise. Incremental strategies (top-down, bottom-up) add one piece at a time, so a new failure points to the newly added interface.',
        },
      ],
      pitfalls: [
        'Swapping stubs and drivers',
        'Saying "wait until everything is ready" (big-bang by default)',
        'Not using the stub to test failure paths',
      ],
    },
    {
      id: 'mt-test-levels-types-iq-04',
      difficulty: 'hard',
      question: 'Your manager wants all 600 manual regression test cases converted to Playwright UI tests this quarter. Using the test pyramid, what would you propose instead?',
      whatInterviewerLooksFor: [
        'Explains the pyramid and the ice-cream cone anti-pattern',
        'Prioritises critical journeys for E2E UI',
        'Pushes rule checks down to API/unit',
        'Proposes a realistic, value-first plan',
      ],
      modelAnswer: `**Respect the goal, challenge the method.** The goal (fast, reliable regression) is right. Converting all 600 cases into UI tests would create an **ice-cream cone**: a slow, flaky suite that is expensive to maintain.

**What the pyramid suggests:** many fast unit tests at the base, a layer of API/service tests, and a small number of end-to-end UI tests on top.

**My proposal:**

1. **Triage the 600 cases** into buckets:
   - Critical user journeys (login, search, add to cart, checkout, payment) → **E2E UI in Playwright** (perhaps 40–60 tests).
   - Business rules and validation (coupon maths, tax, shipping thresholds, error codes) → **API tests** (Playwright request fixture or Postman), far faster and more stable; some can go to developers as unit tests.
   - Visual/usability/rare cases → stay **manual** or become exploratory charters.
   - Obsolete or duplicate cases → **retire**.
2. **Order by value:** smoke suite first (runs on every build), then P1 journeys, then API rule coverage.
3. **Design for stability:** API calls for setup data, resilient locators, independent tests.
4. **Measure:** runtime, flakiness rate, defects caught by automation, and manual hours saved per release.

**Outcome for the quarter:** perhaps 50 UI + 200 API tests covering the same risks as the 600 manual cases, running in about 10–15 minutes in CI instead of days, with manual effort shifted to exploration.`,
      followUps: [
        {
          q: 'Why are UI tests slower and flakier than API tests?',
          a: 'They drive a real browser through rendering, network calls, animations and timing, so there are more moving parts and more chances for timing issues or environment noise. API tests skip rendering entirely and check business logic directly, which typically takes milliseconds per request and has far fewer sources of nondeterminism.',
        },
        {
          q: 'Is the pyramid always right?',
          a: 'It is a guideline. A UI-heavy app with little backend logic may need relatively more component and UI tests (some call it the testing trophy). The principle that survives is: get most feedback from the cheapest, fastest, most reliable tests, and reserve slow end-to-end tests for what only they can prove.',
        },
      ],
      pitfalls: [
        'Agreeing to automate every manual case through the UI',
        'Rejecting automation without an alternative plan',
        'Ignoring maintenance cost and flakiness',
      ],
    },
    {
      id: 'mt-test-levels-types-iq-05',
      difficulty: 'medium',
      question: 'Who performs alpha testing, beta testing and UAT on a mobile banking app release, and what is QA\'s role in each?',
      whatInterviewerLooksFor: [
        'Alpha at developer site; beta in users\' environment; UAT by business users',
        'Mentions operational/regulatory acceptance for banking',
        'QA as facilitator: environment, data, triage, sign-off tracking',
        'Distinguishes acceptance from more system testing',
      ],
      modelAnswer: `**Alpha testing:** internal users (staff, sometimes independent testers) use the app **at the developer's organisation** in a controlled environment. For a banking app: employees use a pre-release build on test accounts for two weeks. **QA role:** prepare builds and accounts, give a feedback channel, triage reports into defects vs suggestions.

**Beta testing:** a limited group of **real customers in their own environment** (their phones, networks, habits) via TestFlight or the Play Console testing tracks, before general release. **QA role:** define what to watch (crash rates, failed logins, app-store feedback), reproduce reported issues on similar devices, decide with the PO whether beta findings block release.

**UAT (user acceptance testing):** business users (operations, branch staff, product owners) check the app supports real processes: open a deposit, pay a bill, raise a dispute, against business requirements. **QA role:** prepare a production-like environment and masked data, help write UAT scenarios from business processes, train users, triage feedback (bug vs change request vs training gap), track sign-off.

**Also relevant in banking:**

- **Operational acceptance:** backup/restore, monitoring, failover, patching.
- **Regulatory acceptance:** compliance with central bank rules, accessibility and data protection.

**Key point:** acceptance testing is mainly **validation**, so it must be driven by users and business scenarios; it should not be QA rerunning the system test suite.`,
      followUps: [
        {
          q: 'UAT users report 30 issues, most of which are "it should work differently". How do you handle that?',
          a: 'Triage with the PO: true defects (behaviour differs from agreed requirements) go to the bug backlog with severity; requests for different behaviour become change requests prioritised against the release; misunderstandings become training or documentation updates. Many such reports at UAT suggest validation happened too late, so I would push for earlier demos and prototype reviews next time.',
        },
        {
          q: 'How is beta testing different from a canary release?',
          a: 'Beta users opt in to a pre-release build and know they may hit issues; the goal is feedback. A canary release sends the real production release to a small percentage of normal users and watches metrics, rolling back if errors rise. Beta is a testing activity before release; canary is a cautious deployment strategy.',
        },
      ],
      pitfalls: [
        'Swapping alpha and beta locations',
        'Saying QA performs UAT alone',
        'Forgetting operational and regulatory acceptance in a banking context',
      ],
    },
    {
      id: 'mt-test-levels-types-iq-06',
      difficulty: 'hard',
      question: 'You have one day and no device lab to check a responsive e-commerce site before a sale. How do you decide which browsers and devices to cover, and when would emulators be insufficient?',
      whatInterviewerLooksFor: [
        'Uses analytics to choose a matrix',
        'Knows emulator/simulator vs real-device trade-offs',
        'Mentions cloud device farms',
        'Prioritises flows and responsive checks realistically',
      ],
      modelAnswer: `**1. Choose the matrix from data, not guesses.** Pull the last 90 days of analytics: browser, OS and device share. Example result: Chrome Android 48%, Safari iOS 27%, Chrome desktop 15%, Safari macOS 4%, Edge 3%, Firefox 2%. Covering the top four gives ~94% of users.

**2. Choose what to test on each.** Not every case everywhere. Critical journeys (home → search → product → add to cart → checkout → payment) on all chosen combos; full functional coverage only on the top one or two.

**3. Pick the tools:**

- **Browser device mode / Playwright device emulation** for fast responsive layout checks at breakpoints (360, 390, 768, 1024, 1440) and orientation. Cheap, good for layout, but it is still a desktop engine.
- **Cloud real devices** (BrowserStack or LambdaTest trial/subscription) for iPhone Safari and a mid-range Android Chrome: payment pages, on-screen keyboard behaviour, autofill, date pickers, file upload, real touch.

**4. Where emulators fall short:** real Safari on iOS behaviour (WebKit on desktop is close but not identical), performance on low-end hardware, network switching, memory pressure, payment app hand-offs (UPI intent, 3-D Secure pop-ups), camera, biometrics and interruptions such as calls and notifications.

**5. Responsive checklist:** no horizontal scroll, readable text, tappable targets, sticky cart button not covering content, menus usable, forms usable with the keyboard open.

**Report:** the matrix covered, the share of users it represents, and what was not covered.`,
      followUps: [
        {
          q: 'Is testing on WebKit in Playwright the same as testing Safari on an iPhone?',
          a: 'No. Playwright\'s WebKit build is close to Safari\'s engine and catches many WebKit-specific issues, and device emulation sets viewport, user agent and touch. But it is not the actual iOS Safari app on real hardware, so OS-level behaviours such as the keyboard, payment hand-offs and performance still need a real-device check for release-critical flows.',
        },
        {
          q: 'How often should the browser/device matrix be reviewed?',
          a: 'Regularly, for example every quarter or before major releases, because traffic shifts (new iOS versions, new popular phones) and browsers update every few weeks. Tie the review to analytics so the matrix follows real users, and keep a rule like "cover browsers representing 95% of sessions plus any contractual requirement".',
        },
      ],
      pitfalls: [
        'Claiming you will test "all browsers and devices"',
        'Treating emulation as equal to real devices',
        'No data behind the device choice',
      ],
    },
    {
      id: 'mt-test-levels-types-iq-07',
      difficulty: 'expert',
      question: 'You are the only manual QA on a team with no performance, security or accessibility specialists. What non-functional checks do you build into your normal testing of a new checkout flow, and how do you report them?',
      whatInterviewerLooksFor: [
        'Knows ISO 25010 categories and picks relevant ones',
        'Concrete, low-cost checks per category',
        'Escalates specialist needs appropriately',
        'Turns observations into measurable requirements',
      ],
      modelAnswer: `**Principle:** I cannot replace specialists, but I can make non-functional risk visible early with cheap checks, and ask for numeric requirements.

**Performance efficiency**
- Time key steps with dev tools (network tab): checkout overview and payment response; note p95 over a few runs.
- Throttle to Slow 4G and CPU 4× slowdown: spinners present, no double-submit, nothing times out silently.
- Watch for huge images or repeated API calls. Raise the question: "What is the target for checkout under sale load?" and suggest a load test before the sale.

**Security (OWASP-aware)**
- Change the order ID in the URL: can I see another user's order? (access control)
- Inputs with quotes or script tags are treated as text; errors do not reveal stack traces.
- Logout then Back: session gone? Card data never in URL, logs or local storage; HTTPS everywhere.

**Usability and accessibility**
- Keyboard-only checkout, visible focus, labels on every field, errors announced in text, contrast check, zoom 200%.

**Compatibility / portability**
- Top browsers from analytics and one real iPhone and Android device.

**Reliability**
- Refresh mid-checkout, double-click Pay, lose network during payment: no duplicate orders, clear recovery.

**Reporting:** non-functional findings go into Jira like any defect, with numbers (e.g. "overview takes 6.2 s on Slow 4G, 3 runs"). Security findings go privately to the tech lead. In the test summary I add a "non-functional coverage and gaps" section recommending specialist load and penetration tests where risk is high.`,
      followUps: [
        {
          q: 'The developer says "6 seconds on Slow 4G is fine, nobody has Slow 4G". How do you respond?',
          a: 'I bring data instead of opinion: analytics for mobile network share and devices, and the business target if one exists. If no target exists, that is the real gap, so I ask the PO to set one (for example "p95 under 3 s on 4G"). Then the 6 seconds is either a defect against that target or an accepted risk, decided by the PO, not argued between us.',
        },
        {
          q: 'What is the difference between load and stress testing, in one example?',
          a: 'Load testing checks behaviour at the expected peak, e.g. 2,000 concurrent shoppers on sale day must see checkout in under 2 seconds. Stress testing pushes beyond that, e.g. ramping to 10,000 users, to find the breaking point and verify the system fails gracefully and recovers rather than corrupting orders.',
        },
      ],
      pitfalls: [
        'Saying non-functional testing is "not my job"',
        'Vague observations without numbers',
        'Posting suspected security holes in public channels',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-test-levels-types-drill-1',
      question: 'Classify each test by LEVEL (component, component integration, system, system integration, acceptance) and by TYPE (functional / non-functional; black-box / white-box): (a) developer checks calculateTax(29.99) returns 2.40; (b) order service sends the correct JSON to a payment stub; (c) tester completes SauceDemo checkout on Safari and measures overview load time; (d) shop calls the real courier API to create a shipment; (e) store managers process a day of returns in the new screen; (f) developer ensures both branches of "if (qty > stock)" are executed.',
      assumptions: [
        'Levels per ISTQB v4.0 (five levels).',
        'A test can have more than one type (e.g. functional and black-box).',
      ],
      steps: [
        { label: '(a)', calc: 'Component (unit); functional; black-box against the function\'s spec (expected 2.40)' },
        { label: '(b)', calc: 'Component integration (interface between order and payment modules, stubbed); functional' },
        { label: '(c)', calc: 'System; functional (checkout completes) + non-functional (performance timing, compatibility on Safari); black-box' },
        { label: '(d)', calc: 'System integration (our system ↔ external courier service); functional' },
        { label: '(e)', calc: 'Acceptance (UAT by business users); functional validation; black-box' },
        { label: '(f)', calc: 'Component (unit); white-box (branch coverage)' },
      ],
      answer: '(a) component, functional; (b) component integration, functional; (c) system, functional + non-functional; (d) system integration, functional; (e) acceptance/UAT, functional validation; (f) component, white-box.',
      insight: 'Levels and types are two independent axes: one test can sit at the system level and still be both functional and non-functional. Interviewers check whether you keep the axes separate.',
      followUps: [
        {
          q: 'Which of these would you automate first, and where in the pyramid does it sit?',
          a: '(a) and (f) are unit tests developers automate at the base of the pyramid. For QA, (b) and (d) are API-level checks that are fast and stable to automate. (c) is a valuable but slower end-to-end UI test, so it is worth automating for the checkout journey only. (e) stays manual by nature because it is about business users validating fitness for use.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-drill-2',
      question: 'A change modifies the shared DiscountService. You have 4 hours of manual testing time. From the inventory below, choose the regression scope and show the time maths: smoke 12 cases × 5 min; coupon 20 × 8 min; checkout totals 15 × 6 min; refunds (call DiscountService) 10 × 9 min; loyalty points (call DiscountService) 8 × 7 min; login/profile/search 90 × 4 min; retest of the original bug 1 × 10 min.',
      assumptions: [
        'Login/profile/search do not depend on DiscountService.',
        'Keep 20 minutes for reporting.',
        'Smoke and retest are mandatory.',
      ],
      steps: [
        { label: 'Mandatory', calc: 'Retest 10 min + smoke 12 × 5 = 60 min → 70 min' },
        { label: 'Impact: coupon', calc: '20 × 8 = 160 min (running total 230 min)' },
        { label: 'Impact: checkout totals', calc: '15 × 6 = 90 min (running total 320 min) → already over 240 − 20 = 220 min budget' },
        { label: 'Prioritise', calc: 'Budget 220 min − 70 mandatory = 150 min for impacted areas' },
        { label: 'Pick by risk', calc: 'P1 coupon 10 × 8 = 80; checkout totals P1 6 × 6 = 36; refunds P1 2 × 9 = 18; loyalty P1 2 × 7 = 14 → 148 min' },
        { label: 'Skip', calc: 'Login/profile/search (no dependency, 360 min); P2/P3 cases of impacted areas (~252 min) → residual risk' },
      ],
      answer: 'Run: retest + smoke (70 min) + P1 slices of coupon (10), checkout totals (6), refunds (2) and loyalty (2) (148 min) = 218 min, plus 20 min reporting ≈ 4 h. Skip login/profile/search entirely (no dependency) and defer P2/P3 impacted cases, listing them as residual risk.',
      insight: 'Even a precise impact analysis (all 53 impacted cases need 396 min) can exceed the window. Risk-based prioritisation inside the impacted set is what makes the plan fit, and the skipped part must be reported, not hidden.',
      followUps: [
        {
          q: 'How would automation change these numbers?',
          a: 'If the 53 impacted cases and the smoke suite were automated as API and UI tests, they might run in 10 to 15 minutes in CI, so the full impacted scope fits easily and the 4 manual hours go to exploratory testing around discount edge cases. This is the business case for automating regression first.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-drill-3',
      question: 'Analytics for the last 90 days: Chrome Android 46%, Safari iOS 29%, Chrome Windows 13%, Safari macOS 5%, Edge Windows 3%, Samsung Internet 2%, Firefox 1.5%, other 0.5%. Build the smallest browser matrix covering at least 90% of sessions, then decide which combos need real devices and which can use emulation.',
      assumptions: [
        'Each listed share is mutually exclusive.',
        'Checkout includes UPI app hand-off on Android and Apple Pay on iOS.',
        'A cloud real-device service is available for mobile.',
      ],
      steps: [
        { label: 'Sort by share', calc: '46, 29, 13, 5, 3, 2, 1.5, 0.5' },
        { label: 'Cumulative', calc: '46 → 75 → 88 → 93 (stop: ≥ 90%)' },
        { label: 'Matrix', calc: 'Chrome Android, Safari iOS, Chrome Windows, Safari macOS = 93%' },
        { label: 'Real devices', calc: 'Chrome Android + Safari iOS (75%): payment hand-offs, keyboard, touch → real devices via cloud' },
        { label: 'Desktop', calc: 'Chrome Windows, Safari macOS: real desktop browsers (Playwright Chromium/WebKit for regression)' },
        { label: 'Emulation', calc: 'Responsive breakpoints for all layouts via device emulation; Edge (Chromium-based) gets a light smoke' },
      ],
      answer: 'Four combos cover 93%: Chrome Android and Safari iOS on real devices (payment hand-offs and real mobile browsers), Chrome Windows and Safari macOS as real desktop browsers. Use emulation for breakpoint checks, and run a short smoke on Edge since it is cheap. Report that ~7% (Edge, Samsung Internet, Firefox, other) is lightly or not covered.',
      insight: 'A data-driven matrix turns "test on all devices" into a defensible, finite plan, and states exactly which users carry residual risk.',
      followUps: [
        {
          q: 'Samsung Internet is only 2%, but the business says it is their highest-value segment. What changes?',
          a: 'Coverage decisions are risk-based, not purely share-based. If those users spend the most, the impact of a failure is high, so I would add Samsung Internet on a real Samsung device for the critical journeys even though it pushes the matrix to five combos. Share tells you likelihood; business value tells you impact.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-test-levels-types-mcq-01',
      difficulty: 'easy',
      question: 'Build 512 arrives on the QA environment. Before anything else, you check that login, product listing, add to cart and checkout basically work. What is this?',
      options: ['Sanity testing of a bug fix', 'Smoke testing (build verification)', 'Full regression testing', 'User acceptance testing'],
      correct: [1],
      explanation: `A broad, shallow pass over critical areas on a new build, deciding whether the build is testable, is smoke (build verification) testing. Sanity focuses narrowly on a specific change or fix. Full regression is far larger, and UAT is performed by business users to validate fitness for use.`,
      followUps: [
        {
          q: 'What do you do if the add-to-cart step fails?',
          a: 'Reject the build: log a Blocker with the failing smoke step, build number and evidence, notify the developers, and stop further testing on that build, because most other tests depend on the cart. Testing resumes on a new build that passes the full smoke suite.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-02',
      difficulty: 'easy',
      question: 'The top-level checkout screen is ready, but the payment module it calls is not. What do you need to integration-test the checkout screen?',
      code: {
        language: 'text',
        title: 'Module status',
        code: `Checkout UI      [READY]   calls ->  Order service
Order service    [READY]   calls ->  Payment service
Payment service  [NOT BUILT - due in 3 weeks]
Goal: test Checkout UI + Order service together now`,
      },
      options: ['A driver', 'A stub', 'A beta tester', 'A load generator'],
      correct: [1],
      explanation: `A stub stands in for a missing CALLED module and returns canned responses, which is what top-down integration needs here. A driver is the opposite: a fake caller used when the module under test has no caller yet (bottom-up). Beta testers and load generators are unrelated to replacing a missing module.`,
      followUps: [
        {
          q: 'What responses would you program into the payment stub?',
          a: 'At least approved, declined, and a slow response or timeout, ideally keyed by card number or amount so each test is deterministic. Possibly also a malformed response and a server error, to check the checkout handles them gracefully without double charging or losing the order.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-03',
      difficulty: 'easy',
      question: 'A defect where entering "2" in quantity charges for 3 items is fixed. You rerun the exact steps from the bug report and it now charges for 2. What did you just do?',
      options: ['Regression testing', 'Retesting (confirmation testing)', 'Smoke testing', 'Exploratory testing'],
      correct: [1],
      explanation: `Re-executing the steps that exposed a specific defect to confirm the fix is retesting, which the ISTQB calls confirmation testing. Regression testing would come next to check the change broke nothing else. Smoke testing checks a build's basic stability, and exploratory testing is unscripted learning and test design.`,
      followUps: [
        {
          q: 'What regression would you run after this fix?',
          a: 'Cases around quantity and pricing: quantity boundaries (1, max allowed, max + 1), updating quantity in the cart, totals with coupons, tax and shipping, order confirmation and invoice totals, plus the smoke suite. Unrelated areas like login or profile can be skipped if impact analysis confirms no dependency.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-04',
      difficulty: 'medium',
      question: 'Which pair correctly matches the integration strategy to the test double it typically needs?',
      options: [
        'Top-down → drivers; bottom-up → stubs',
        'Top-down → stubs; bottom-up → drivers',
        'Big-bang → stubs and drivers for every module',
        'Bottom-up → no test doubles at all',
      ],
      correct: [1],
      explanation: `Top-down starts from the upper modules, so missing lower modules are replaced by stubs; bottom-up starts from the lower modules, so drivers call them in place of the missing upper layers. Option A swaps them. Big-bang waits for everything, so it needs few doubles; bottom-up still needs drivers.`,
      followUps: [
        {
          q: 'Which strategy would you choose if the core calculation engine is the highest risk?',
          a: 'Bottom-up, or a sandwich approach that starts with the engine, because it lets you test the risky calculation logic first through drivers, with plenty of boundary data, long before the UI exists. Defects in the core would otherwise surface late through the UI, where they are harder to isolate.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-05',
      difficulty: 'medium',
      question: 'Select ALL that are non-functional tests of the SauceDemo checkout.',
      options: [
        'Checkout overview loads in under 2 seconds on a 4G connection',
        'Clicking Finish shows "Thank you for your order!"',
        'The checkout form can be completed using only the keyboard',
        'Checkout works the same on Safari and Firefox',
        'Leaving the postal code empty shows "Error: Postal Code is required"',
      ],
      correct: [0, 2, 3],
      explanation: `Response time (performance efficiency), keyboard-only operation (usability/accessibility) and behaviour across browsers (compatibility) are non-functional characteristics from ISO 25010. The confirmation message and the required-field validation describe what the system does, so they are functional tests.`,
      followUps: [
        {
          q: 'How can a functional test be turned into a non-functional one?',
          a: 'Keep the same flow and add a quality constraint: run the checkout and also measure the time to the overview page, or run it with a screen reader, or on a slow network, or across browsers. The ISTQB notes many non-functional tests are derived from functional ones in exactly this way.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-06',
      difficulty: 'medium',
      question: 'Read the test notes below. Which kind of testing is this?',
      code: {
        language: 'text',
        title: 'Test notes',
        code: `1. Place order via UI as standard_user (1 backpack)
2. SELECT status, total FROM orders WHERE user_id = 42
   ORDER BY created_at DESC LIMIT 1;  -> PAID, 32.39
3. GET /api/orders/latest -> 200, total 32.39
4. Check app log: one "payment.captured" event, no retries`,
      },
      options: ['Black-box testing', 'White-box testing', 'Grey-box testing', 'Acceptance testing'],
      correct: [2],
      explanation: `The tester drives the UI like a user (black-box) but also uses partial internal knowledge (database tables, API endpoints, logs) to verify the outcome, which is grey-box testing. White-box would derive tests from code structure such as branches. Acceptance testing is about users validating business fitness.`,
      followUps: [
        {
          q: 'What extra defects can step 2 to 4 catch that the UI alone would miss?',
          a: 'A UI showing "Thank you" while the order is saved with the wrong status or total, duplicate orders or double payment captures, an API returning stale data, or silent retries in the payment integration. The UI can look perfect while the data behind it is wrong.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-07',
      difficulty: 'medium',
      question: 'Select ALL statements that correctly describe the test pyramid.',
      options: [
        'Lower layers contain many small, fast, isolated tests',
        'End-to-end UI tests should be the largest group because they are closest to the user',
        'Higher layers have lower isolation and longer execution time',
        'The number and names of layers can vary between models',
        'Manual tests form the base of the pyramid',
      ],
      correct: [0, 2, 3],
      explanation: `The pyramid puts many fast, isolated tests at the base and fewer, slower, less isolated end-to-end tests at the top; layer names vary (Cohn's unit/service/UI, or unit/integration/E2E). Making UI tests the largest group is the ice-cream cone anti-pattern, and manual tests are not the base.`,
      followUps: [
        {
          q: 'A team has 400 UI tests and 20 unit tests. What problems do you expect?',
          a: 'Slow feedback (the suite may take an hour or more), frequent flaky failures, expensive maintenance when the UI changes, and failures that are hard to diagnose because each test covers so much. Business rules are also tested indirectly and expensively. The fix is to push rule checks down to API and unit tests and keep UI tests for critical journeys.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-08',
      difficulty: 'medium',
      question: 'A bank invites 2,000 real customers to install a pre-release version of its app from the Play Store testing track and report issues from their own phones. What is this?',
      options: ['Alpha testing', 'Beta testing', 'Operational acceptance testing', 'System integration testing'],
      correct: [1],
      explanation: `Beta testing is done by real users in their own environments before general release. Alpha testing happens at the developer's site with internal or invited users in a controlled setting. Operational acceptance focuses on backup, recovery and supportability; system integration tests interfaces with other systems.`,
      followUps: [
        {
          q: 'What can beta testing reveal that in-house testing rarely does?',
          a: 'Problems tied to real-world variety: unusual devices and OS versions, poor networks, other installed apps, real usage patterns, battery and memory pressure, regional settings, and accessibility settings. It also surfaces usability confusion from people who did not build or test the product.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-09',
      difficulty: 'hard',
      question: 'Select ALL items that should normally be included in regression after a fix to the shared PricingService rounding logic.',
      options: [
        'The smoke suite',
        'Coupon and checkout total test cases',
        'Invoice PDF and order email totals that use PricingService',
        'Password reset flow that never calls PricingService',
        'Retesting the original rounding defect afterwards, once regression passes',
      ],
      correct: [0, 1, 2],
      explanation: `Regression scope = fixed core (smoke) plus areas impacted by the change (coupon and totals, invoices and emails using the same service). Password reset has no dependency, so impact analysis excludes it. Retesting the original defect is needed, but it comes FIRST, before regression, not afterwards.`,
      followUps: [
        {
          q: 'How do you find out which features use PricingService if there is no documentation?',
          a: 'Ask the developer to search the code for callers, check architecture or API diagrams, look at the RTM and requirement links for pricing rules, review past defects in pricing, and, if needed, grey-box observation such as watching which API calls a page makes in the browser network tab.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-10',
      difficulty: 'hard',
      question: 'Which statement about emulators, simulators and real devices is MOST accurate?',
      options: [
        'Emulators reproduce real hardware fully, so real devices are unnecessary',
        'Virtual devices are fast for functional and CI testing, but cannot reliably reproduce battery, sensors, interruptions and real-network behaviour',
        'Real devices are always cheaper than cloud services',
        'Responsive testing in browser dev tools is equivalent to testing on an iPhone',
      ],
      correct: [1],
      explanation: `Emulators and simulators are excellent for fast functional checks and CI, but they do not faithfully reproduce battery drain, sensors, incoming calls, gestures or real network behaviour, so final validation of critical flows uses real devices. Real labs are costly to maintain, and dev-tools device mode is still a desktop engine.`,
      followUps: [
        {
          q: 'Give one mobile bug you would expect only on a real device.',
          a: 'A payment flow that breaks when the app switches to a UPI or banking app and back, losing the session; or the on-screen keyboard covering the Pay button on a small iPhone; or the app crashing when a phone call interrupts the 3-D Secure step. These depend on real OS behaviour that emulation rarely reproduces.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-11',
      difficulty: 'hard',
      question: 'Read the test run log. What is the correct next action?',
      code: {
        language: 'text',
        title: 'Smoke run on build 3.4.0-b17',
        code: `SM-01 Site loads                      PASS
SM-02 Login standard_user             PASS
SM-03 Inventory shows 6 products      PASS
SM-04 Add backpack -> badge 1         FAIL (badge not shown, no error)
SM-05 Cart lists item                 BLOCKED
SM-06 Checkout overview total         BLOCKED`,
      },
      options: [
        'Continue with full regression and log SM-04 as a Minor defect',
        'Reject the build, raise a Blocker with evidence, and wait for a build that passes smoke',
        'Skip SM-04 and run sanity tests on sorting instead',
        'Mark the build accepted because 3 of 6 smoke steps passed',
      ],
      correct: [1],
      explanation: `A smoke failure in a critical path (add to cart, which blocks cart and checkout) means the build is not testable, so it is rejected with a Blocker and evidence. Continuing regression wastes effort on a broken build, sorting is unrelated, and smoke is pass/fail per build, not a percentage.`,
      followUps: [
        {
          q: 'What evidence would you attach to the Blocker?',
          a: 'Build number and environment, the exact steps and user, expected vs actual (badge not shown, cart empty), a screenshot or short video, browser console errors and failing network requests (e.g. a 500 from the cart API), and the time it happened. That lets developers start debugging immediately.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-12',
      difficulty: 'medium',
      question: 'Select ALL quick accessibility checks a manual tester can do on a login form without special tools.',
      options: [
        'Complete login using only the Tab, Shift+Tab and Enter keys',
        'Confirm a visible focus indicator on each control',
        'Check the error message identifies the problem in text, not only with red colour',
        'Run a 1,000-user load test on the login API',
        'Verify the password is visible in the URL after submit',
      ],
      correct: [0, 1, 2],
      explanation: `Keyboard-only operation, visible focus and errors not conveyed by colour alone are core WCAG checks any tester can do by hand. A load test is a performance activity, and a password in the URL is a security defect to report, not an accessibility check you aim to "verify".`,
      followUps: [
        {
          q: 'Why is a placeholder alone not an adequate label for an input?',
          a: 'Placeholder text disappears when the user starts typing, often has low contrast, and is not reliably announced as a label by all screen readers. Users with memory or cognitive impairments lose the context. A visible label linked to the input works for everyone and also makes getByLabel locators possible in Playwright.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-13',
      difficulty: 'hard',
      question: 'An interviewer says, "Sanity testing and smoke testing are the same thing." What is the BEST response?',
      options: [
        'Disagree firmly: they are always completely different and the ISTQB says so',
        'Agree, because there is no practical difference anywhere',
        'Note the ISTQB glossary does treat sanity as a synonym of smoke, then explain how your team used each term in practice',
        'Say sanity testing is just another name for regression testing',
      ],
      correct: [2],
      explanation: `The ISTQB glossary lists sanity test as a synonym of smoke test, while many companies use "sanity" for a narrow check after a change. The best answer shows you know both views and explains your actual practice. Option A is factually wrong about the ISTQB, B ignores real-world usage, and D confuses sanity with regression.`,
      followUps: [
        {
          q: 'Describe how you used the two terms in your last team.',
          a: 'For example: "Smoke meant our 12-case build verification suite run on every deployment, mostly automated; if it failed we rejected the build. Sanity meant a short focused check by the tester after a bug fix or config change, covering the fix and its immediate neighbours, before starting regression."',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-14',
      difficulty: 'expert',
      question: 'Select ALL tests that belong at the API/service layer rather than as end-to-end UI tests in a healthy pyramid for a coupon feature.',
      options: [
        'Each of the 12 coupon rule combinations (percent/fixed × min-cart × expiry)',
        'One journey: login, add item, apply SAVE10, complete checkout',
        'Rejection of malformed coupon codes with the correct error code',
        'Rounding of discounts for 30 boundary cart values',
        'Visual check that the coupon banner fits on a 360 px screen',
      ],
      correct: [0, 2, 3],
      explanation: `Rule combinations, error codes and many rounding boundaries are business logic best checked quickly and reliably through the API (or unit tests). The single end-to-end journey belongs in the UI layer to prove the pieces work together, and the 360 px layout check needs a rendered UI (manual or visual comparison).`,
      followUps: [
        {
          q: 'How many UI tests would you keep for the coupon feature, and which?',
          a: 'Very few, perhaps two or three: one happy-path journey applying a coupon through checkout, one showing an error message to the user for an invalid code, and maybe removing a coupon. They prove the UI is wired to the API correctly; the dozens of rule combinations are already covered faster below.',
        },
      ],
    },
    {
      id: 'mt-test-levels-types-mcq-15',
      difficulty: 'expert',
      question: 'Which security observation from manual testing should be treated as the MOST severe?',
      code: {
        language: 'text',
        title: 'Observations on the order history page',
        code: `A. Error page shows "Something went wrong" with a support ID
B. Changing /orders/1001 to /orders/1002 shows another
   customer's name, address and items
C. Order list loads in 2.8 s on Slow 4G
D. Search box trims leading spaces from input`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [1],
      explanation: `B is broken access control (an insecure direct object reference) exposing other customers' personal data, the top category in the OWASP Top 10 2021 and a likely legal breach. A is good practice (no stack trace leaked), C is a performance observation, and D is normal input handling.`,
      followUps: [
        {
          q: 'How should you report finding B?',
          a: 'Privately and fast: a restricted Jira ticket or direct message to the tech lead or security contact, with minimal reproduction steps and without copying real customer data into the ticket. Mark it Critical, avoid public channels, and stop exploring further personal data beyond what is needed to prove the issue.',
        },
      ],
    },
  ],
};

export default topic;
