import type { Topic } from '../../types';

const topic: Topic = {
  id: 'qa-scenarios',
  phase: 'interview',
  order: 1,
  title: '"How Would You Test…?" Scenario Questions',
  subtitle:
    'A repeatable way to answer open-ended test questions: clarify, map users and risks, slice into functional and non-functional, cover positive/negative/edge, prioritise, and close with what you would automate. Worked through a pen, login page, ATM, elevator, checkout and payment gateway, search, file upload, an API endpoint and a mobile app.',
  estimatedMinutes: 85,
  sources: [
    'Ministry of Testing Club: "How would test an elevator?" discussion thread (clarify requirements first, model interactions, accessibility, failure states)',
    'Software Testing Help: How to Write Test Cases for ATM Machine (sample scenarios; interviewer checks approach, not completeness)',
    'Software Testing Help: Payment Gateway Testing Guide with Sample Test Cases',
    'Art of Testing: Payment gateway testing test cases',
    'Tutorialspoint: Payment Gateway Testing with Example Test Cases',
    'Stripe docs: Testing (test card numbers such as 4242 4242 4242 4242 and decline cards) and Payment gateway testing guide',
    'WonderProxy blog: How to test file uploads',
    'Medium (Sujit K P): Effective test cases for a file upload feature',
    'James Bach & Michael Bolton — Rapid Software Testing (SFDPOT product coverage heuristic)',
    'Elisabeth Hendrickson — Explore It! (variables, data and interruption heuristics)',
    'OWASP Authentication Cheat Sheet (generic error messages, lockout and rate limiting)',
    'ISTQB CTFL v4.0 syllabus — 5.1.5 risk-based testing and test prioritisation',
    'Restful Booker API docs (restful-booker.herokuapp.com/apidoc)',
    'AmbitionBox interview-question listings (lift / elevator test-case answers; Accenture QA payment scenario reports, 2024) as surfaced in search results',
  ],
  tags: ['scenario', 'how-would-you-test', 'test-design', 'interview', 'risk', 'login', 'atm', 'elevator', 'payment', 'api', 'mobile'],
  cheatSheet: [
    'Never start listing cases in the first 10 seconds. Ask 2–4 clarifying questions (who uses it, what must never go wrong, platforms, constraints), then state your assumptions aloud.',
    'Frame: Clarify → Users & risks → Functional (positive, negative, edge) → Non-functional (performance, security, usability, accessibility, compatibility) → Prioritise → Automate/close.',
    'SFDPOT (Structure, Function, Data, Platform, Operations, Time) is a fast checklist when your mind goes blank on any object or feature.',
    'Physical object (pen, chair): treat it like a product — requirements, users, function, durability, safety, packaging. Interviewers grade structure, not the number of cases.',
    'Login: valid/invalid combos, generic error text, lockout and rate limit, session/logout/back button, password masking, SSO/2FA, SQL-injection-style input, keyboard and screen reader.',
    'ATM/payment: every money flow needs a "what if it fails halfway?" case — dispense failure, timeout after debit, duplicate submit, refund/reversal, reconciliation.',
    'Elevator: clarify scope (control software vs mechanics), then safety (doors, overload, emergency), scheduling (who gets served first), accessibility, power failure, maintenance mode.',
    'API endpoint: contract (status, schema, headers), validation (missing/extra/wrong-type fields), auth (none/expired/other user), idempotency, pagination/limits, error format, DB side effects.',
    'Mobile: interruptions (call, notification, background), network switch/offline, permissions denied, rotation, low battery/storage, app upgrade with existing data, OS versions.',
    'Time-boxed answer: name 3 P1 scenarios first (money, data loss, security, the main happy path), then widen. Say what you would NOT test and why — that is risk-based thinking.',
    'Close with: "I would automate the stable P1 happy paths and API checks, and keep exploratory sessions for UX and edge cases." That shows you know where automation fits.',
  ],
  sections: [
    {
      heading: 'Why interviewers ask "how would you test…?"',
      body: `**Intuition:** the interviewer is not checking whether you know elevators or pens. They are watching *how you think when nobody gives you a requirements document*, which is most days in a real QA job.

Scenario questions show up in almost every QA and SDET-1 loop, at service companies (as a quick manual round) and at product companies (often as a whiteboard or shared-doc exercise). Answer guides and forum threads agree on one thing: the interviewer is scoring **approach and coverage of major areas**, not a complete list.

| What they write down | Strong signal | Weak signal |
|---|---|---|
| Clarifying | Asks who the users are, what "done" means, which platforms | Starts typing cases at once |
| Structure | Groups ideas: functional, negative, non-functional, integrations | Random list of 30 cases |
| Risk sense | Names what hurts most (money, data, safety) and starts there | Treats "button colour" and "double charge" as equal |
| Depth | Can go 2–3 levels deep on one area when probed | Only one-line titles |
| Communication | Thinks aloud, states assumptions, checks time | Silent for two minutes, then a dump |
| Realism | Knows what can be automated and what needs a human | "I will automate everything" |

**In interviews, say this:** "Before I list tests, can I ask a few questions about who uses it and what matters most?" That one sentence already puts you ahead of most candidates.

**Common mistake:** trying to sound complete. A list of 40 cases with no priorities reads as "cannot decide what matters". Twelve well-chosen, grouped cases with a clear P1 set read as "ready for a real sprint".`,
      keyPoints: [
        'Scenario questions test approach, structure and risk sense; there is no single right list.',
        'Asking clarifying questions is part of the answer, not a delay.',
        'Prioritised and grouped beats long and flat.',
      ],
      source: 'Ministry of Testing Club elevator thread; Software Testing Help ATM test cases article',
    },
    {
      heading: 'A repeatable frame: clarify, slice, prioritise, close',
      body: `**Intuition:** like a doctor's checklist, a fixed frame stops you missing whole categories when you are nervous. Use the same six steps for a pen, a payment gateway or an API.

1. **Clarify** (30–60 s). Who uses it? What is it for? Which platforms or environments? Any constraints (limits, regulations, integrations)? If the interviewer says "assume whatever you like", **say your assumptions aloud**.
2. **Users and risks.** List user types (new, returning, admin, guest, a user with a disability, an attacker) and the worst things that could happen (lose money, leak data, injure someone, block the main flow).
3. **Functional.** Happy path first, then **negative** (invalid input, wrong state, missing permissions) and **edge** (boundaries, empty, maximum, concurrency, interruption).
4. **Non-functional.** Performance/load, security, usability, accessibility, compatibility (browser, device, OS), reliability/recovery, localisation.
5. **Prioritise.** Mark P1 (must test before release), P2, P3. Use likelihood × impact.
6. **Close.** Name test data and environment needs, what you would automate, and what you would explore manually.

**A blank-mind rescue: SFDPOT.** From Bach and Bolton's Rapid Software Testing: **S**tructure (what is it made of), **F**unction (what it does), **D**ata (what it processes), **P**latform (what it depends on), **O**perations (how people actually use it), **T**ime (timing, timeouts, concurrency, dates). Running through six words takes 20 seconds and always produces ideas.

**In interviews, say this:** "I will split this into functional, negative and edge, then non-functional, and finish with what I would test first if I only had an hour."`,
      diagram: `  CLARIFY ──► USERS & RISKS ──► FUNCTIONAL ──► NON-FUNCTIONAL ──► PRIORITISE ──► CLOSE
  questions    who / what hurts   +ve -ve edge   perf sec a11y       P1 P2 P3        automate?
  assumptions                                     compat reliab.     likelihood x    data, env
                                                                     impact          explore`,
      keyPoints: [
        'Same six steps for every scenario question.',
        'SFDPOT is the fallback when ideas dry up.',
        'Always end with priorities and an automation view.',
      ],
      source: 'James Bach & Michael Bolton — Rapid Software Testing (SFDPOT); ISTQB CTFL v4.0 — 5.1.5 risk-based testing',
    },
    {
      heading: 'Everyday objects: pen, chair, water bottle',
      body: `**Intuition:** an object question is a product question in disguise. A pen has *requirements* (it writes), *users* (a student, a signing manager, an astronaut), *environments* (cold, wet, aeroplane cabin) and *risks* (leaks on a shirt, a cap a child can swallow).

**Clarify first:** "Is it a ballpoint, gel or fountain pen? Who is the target user? Is there a spec, for example writing length or a safety standard?"

| Area | Example tests for a ballpoint pen |
|---|---|
| Functional | Writes a continuous line when the tip touches paper; click mechanism extends and retracts; ink colour matches the label |
| Negative | Writing on glossy paper, wet paper, upside down (ink starvation); pressing the clicker 10,000 times |
| Boundary / capacity | How many metres of line until the ink runs out versus the claimed length |
| Durability | Drop from desk height onto tile; leave in a car at 50°C; cap clips survive 500 open/close cycles |
| Safety | Cap has an air hole (choking safety); ink is non-toxic; no sharp edges |
| Usability | Grip comfort in a 30-minute writing session; left-handed smudge; visible ink level |
| Compatibility | Works on different paper types, on cheque paper, on forms meant for carbon copies |
| Packaging / labelling | Barcode scans; ink colour and brand print do not rub off |

**Chair, quickly:** load (max rated weight plus a margin), stability on tilt, wheels lock on a slope, height lever under load, fabric fire rating, assembly instructions are followable, armrest pinch points.

**In interviews, say this:** "If this were software, the clicker would be my state machine (extended/retracted) and the ink would be my capacity boundary."

**Common mistake:** listing only the happy path ("it writes, it writes blue, it writes on paper"). Interviewers ask object questions specifically to see if you think about misuse, environment and safety.`,
      code: [
        {
          language: 'text',
          title: 'Sample structured answer card: pen (60–90 seconds spoken)',
          code: `CLARIFY:     ballpoint, retractable, for office use, claimed 1.5 km of writing
ASSUMPTIONS: no formal spec beyond the packaging claims

P1  writes a smooth line on standard A4 the moment it touches paper
P1  ink does not leak in a shirt pocket at 40°C for 8 hours
P1  cap/clicker parts are too large to be a choking hazard (or cap is vented)
P2  click mechanism survives 10,000 cycles without jamming
P2  writing length is within 10% of the 1.5 km claim
P2  survives a 1 m drop onto tile and still writes
P3  comfortable grip for left- and right-handed users
P3  printed brand and colour code do not rub off after a week of use

WOULD AUTOMATE (if this were a factory line): click-cycle and line-length rigs
WOULD DO MANUALLY: comfort, smudge and look-and-feel`,
        },
      ],
      keyPoints: [
        'Objects have requirements, users, environments and risks like software.',
        'Include safety, durability, misuse and packaging, not just "it writes".',
      ],
      source: 'Ministry of Testing Club elevator thread (pen and vending machine suggested as alternative prompts)',
    },
    {
      heading: 'Login page: going beyond valid and invalid',
      body: `**Intuition:** every candidate says "valid username and valid password". You stand out by covering *security*, *session* and *accessibility*, the parts real login bugs come from.

**Clarify:** "Username or email? Is there 'Remember me', SSO (Google/Microsoft) or OTP/2FA? What is the lockout policy? Web only or also mobile?"

| Group | Scenarios |
|---|---|
| Functional positive | Valid login lands on the right page for each role; Enter key submits; "Remember me" survives a browser restart |
| Functional negative | Wrong password, unknown user, empty fields, only spaces, a locked or deactivated user (e.g. SauceDemo's \`locked_out_user\` shows a specific error) |
| Edge | Leading/trailing spaces in the email, uppercase email, maximum length, unicode names, paste into the password field |
| Security | Error message does not reveal which field was wrong (OWASP recommends a generic message); lockout or rate limit after N failures; password masked and not in the URL or logs; HTTPS only; injection-style input (\`' OR 1=1 --\`) rejected safely; session cookie is HttpOnly and Secure |
| Session | Logout invalidates the session (Back button does not show the dashboard); session expires after inactivity; login in two browsers; password change logs out other sessions |
| Usability & a11y | Labels linked to inputs; tab order; error read by a screen reader; show/hide password toggle; caps-lock hint |
| Non-functional | Login API under 100 concurrent logins; response time target; works on the supported browsers |

**In interviews, say this:** "My P1s are: valid login per role, wrong-password handling with a generic message, lockout, and logout really ending the session. Those are the ones that become incidents."

**Common mistake:** writing "verify login with invalid data" as one case. Invalid *what*? Each invalid class (wrong password, unknown user, blank, locked user) is a separate case with a separate expected result.`,
      code: [
        {
          language: 'text',
          title: 'Five login cases with precise expected results',
          code: `ID      Title                                   Expected result
LG-01   Valid standard user, correct password   Lands on /inventory; session cookie set
LG-02   Valid user, wrong password              Generic "Username and password do not
                                                match" message; no hint which is wrong
LG-03   5 wrong passwords within 10 minutes     6th attempt blocked / CAPTCHA shown;
                                                audit log entry created
LG-04   Log out, then press browser Back        Login page shown; protected page not
                                                rendered from cache; API returns 401
LG-05   Submit using only the keyboard          Tab reaches both fields and the button
                                                in order; Enter submits; focus moves
                                                to the error message on failure`,
        },
      ],
      keyPoints: [
        'Split "invalid data" into separate classes with separate expected results.',
        'Security and session cases are where login P1 bugs hide.',
        'Generic error text and lockout are OWASP recommendations, not personal taste.',
      ],
      source: 'OWASP Authentication Cheat Sheet; saucedemo.com test users',
    },
    {
      heading: 'ATM: money flows and "what if it fails halfway?"',
      body: `**Intuition:** an ATM is a small state machine wrapped around a bank account. The scariest bugs are not on the screen; they are when the account is debited but the cash never comes out.

**Clarify:** "Which operations: withdrawal, balance, mini statement, PIN change, deposit? Same bank and other banks' cards? What are the limits and note denominations?"

| Group | Scenarios |
|---|---|
| Card & PIN | Valid card prompts for PIN; wrong PIN shows an error; 3 wrong PINs block or retain the card; expired / blocked / damaged card rejected; card inserted the wrong way |
| Withdrawal | Amount in valid multiples is dispensed; amount not a multiple of available notes rejected; above balance, per-transaction limit or daily limit rejected; machine low on a denomination offers an alternative |
| Failure mid-flow | Power cut after debit and before dispense → automatic reversal; cash not taken within N seconds is retracted and the account is credited back; network timeout to the bank |
| Session | Card returned before cash (prevents forgetting the card); timeout returns to the start screen; only one transaction per session if that is the rule |
| Receipts & messages | Receipt shows masked card number and correct balance; language selection changes every message; SMS alert matches the amount |
| Security | PIN not visible on screen; keypad shield; skimming detection (out of scope for software testers, but worth naming) |
| Accessibility | Audio jack guidance, braille keypad, screen contrast |

**State model to mention:** Idle → Card inserted → PIN verified → Option selected → Amount entered → Authorised → Cash dispensed → Card/receipt returned → Idle. Each arrow has a failure branch (wrong PIN, declined, timeout, power loss).

**In interviews, say this:** "For every step that changes money, I test the failure right after it: debit succeeded but dispense failed, and I check the reversal and the account statement."`,
      diagram: `  IDLE ─card─► CARD_IN ─PIN ok─► MENU ─amount─► AUTHORISED ─► DISPENSE ─► DONE
               │ bad card       │ 3 bad PINs           │ declined       │ jam/timeout
               ▼                ▼                       ▼                ▼
             EJECT           RETAIN CARD           MESSAGE+EJECT    REVERSE DEBIT`,
      keyPoints: [
        'Treat the ATM as a state machine; test the failure branch from each state.',
        'Debit-without-dispense and retracted-cash reversal are P1.',
        'Limits (per transaction, daily, balance, denomination) are boundary tests.',
      ],
      source: 'Software Testing Help: Test Cases for ATM Machine',
    },
    {
      heading: 'Elevator: clarify scope, then safety and scheduling',
      body: `**Intuition:** "test an elevator" is deliberately huge. The Ministry of Testing discussion on this exact question converges on one opening move: ask *what the elevator needs to do* and *which part you are testing*, because mechanical safety certification is a specialist job.

**Clarify:** "Am I testing the control software, the whole lift, or the user experience? How many floors and cars? Any keycard floors, VIP/fire-service mode, weight limit?"

| Group | Scenarios |
|---|---|
| Core function | Call from each floor (up/down buttons); select a floor inside; stops at the right floor and levels with it; display and chime show the correct floor |
| Doors | Do not open between floors; reopen when the beam/sensor is blocked; door-open button holds the door; car does not move while doors are open |
| Scheduling | Several calls at once are served in a sensible order (no floor starved); same-direction pickups; two cars do not both answer one call |
| Load | At rated load it moves; above it, an overload alarm sounds and it refuses to move |
| Emergency | Alarm/intercom button connects; power failure moves the car to the nearest floor or holds safely; fire mode returns to the ground floor |
| Access | Keycard-only floors cannot be selected without a card |
| Accessibility | Braille on buttons, audible floor announcements, door timing long enough for a wheelchair, buttons at reachable height |
| Maintenance | Maintenance mode disables calls; service counter and fault logs are recorded |

**In interviews, say this:** "Passenger safety is P1: doors never open between floors, overload stops the car, and the emergency call works during a power cut. Then scheduling fairness, then comfort."

**Common mistake:** only testing buttons. Strong answers include *people* (wheelchair users, a crowd at 9 a.m.) and *failure states that don't endanger anyone*, points the forum moderators specifically said they listen for.`,
      keyPoints: [
        'Scope the system under test before listing cases.',
        'Safety, then scheduling, then comfort and accessibility.',
        'Include rush-hour traffic patterns and failure states.',
      ],
      source: 'Ministry of Testing Club: "How would test an elevator?"; AmbitionBox lift test-case listings',
    },
    {
      heading: 'Checkout and payment gateway',
      body: `**Intuition:** checkout is where the business makes money, so it gets the deepest testing. A payment gateway adds a third party (bank, card network, UPI app) that can be slow, decline or time out.

**Clarify:** "Which methods: cards, UPI, wallets, net banking, cash on delivery? Which gateway (Stripe, Razorpay…)? Do we test in the gateway's sandbox? Coupons, taxes, multiple currencies?"

| Group | Scenarios |
|---|---|
| Cart → order | Price, tax, shipping and discount total correctly; changing quantity updates totals; out-of-stock item blocked at payment time, not only at add-to-cart |
| Payment success | Sandbox success card (Stripe uses 4242 4242 4242 4242) creates exactly one paid order and one confirmation email |
| Declines | Declined, insufficient funds, expired card, wrong CVV, 3-D Secure failed or abandoned; the user sees a clear message and can retry |
| Duplicate & timing | Double-click on Pay; browser Back after paying; refresh on the processing page; gateway timeout then late success webhook → still exactly one order |
| Refunds | Full and partial refund; refund after a coupon; refund appears in the gateway dashboard and in our DB |
| Security | Card number never stored or logged in full; payment page on HTTPS; amount cannot be changed in the request (tamper the price in the API) |
| Reconciliation | Daily report: every captured payment has an order and vice versa |
| Non-functional | Sale-day load; gateway latency; mobile layout of the payment form |

**In interviews, say this:** "The two bugs I fear most here are charging twice and charging without creating an order, so idempotency and webhook handling are my P1s."

**Common mistake:** testing only the UI. Many payment bugs live in the *webhook* (the gateway's server-to-server callback) and the *reconciliation*, which you check through API and DB queries.`,
      code: [
        {
          language: 'gherkin',
          title: 'Acceptance scenario for the gateway-timeout case',
          code: `Feature: Card payment at checkout

  Scenario: Gateway confirms late after the shopper saw a timeout
    Given a cart with 1 item costing 499.00 INR
    And the payment gateway sandbox delays its response by 40 seconds
    When the shopper pays with a valid test card
    Then the shopper sees "We are confirming your payment"
    And no second charge is possible from the retry button
    When the gateway sends the "payment succeeded" webhook
    Then exactly one order exists with status "PAID"
    And exactly one confirmation email is sent`,
        },
      ],
      keyPoints: [
        'P1: no double charge, no charge without an order, correct totals.',
        'Use the gateway sandbox and its documented test cards.',
        'Check webhooks, refunds and reconciliation, not just the success page.',
      ],
      source: 'Stripe docs — Testing (test cards); Software Testing Help & Art of Testing — payment gateway test cases; Tutorialspoint — payment gateway testing',
    },
    {
      heading: 'Search box and file upload',
      body: `**Intuition:** both look like one input field, but each hides a whole pipeline: search has indexing, ranking and filters; upload has validation, storage, scanning and permissions.

**Search (e-commerce product search):**

| Group | Scenarios |
|---|---|
| Matching | Exact name; partial word; case-insensitive; plural/singular; common misspelling ("iphne"); synonyms if supported |
| Empty / no results | Blank search, only spaces, a term with no matches shows a helpful empty state |
| Special input | Very long strings, emoji, \`%\`, \`_\`, quotes, \`<script>\` (must be shown as text, never executed) |
| Results | Sorting and filters combine correctly; pagination has no duplicates or gaps; count matches the list |
| Freshness | A newly added product appears after the index refresh; a deleted product disappears |
| Performance | Autocomplete responds as you type without flooding the API (debounce) |

**File upload (profile picture or document):**

| Group | Scenarios |
|---|---|
| Valid | Each allowed type (JPG, PNG, PDF); a file just under the size limit |
| Boundaries | Exactly at the limit; 1 KB over; a zero-byte file |
| Invalid | Disallowed extension; a renamed file (\`.exe\` renamed to \`.jpg\`, so the server must check content, not only the name); corrupted image |
| Names | Spaces, unicode, very long names, two uploads with the same name |
| Interruptions | Network drop mid-upload; cancel; refresh during upload; retry |
| Security & storage | Malware scan if required; uploaded file is not publicly reachable unless intended; another user cannot fetch it by guessing the URL |
| UX | Progress indicator, drag and drop, clear error text, preview |

**In interviews, say this:** "For upload I test the server, not just the picker: the browser's accept filter is a convenience, so I send a wrong type straight to the API too."`,
      keyPoints: [
        'Search: matching rules, empty states, special characters, filters and freshness.',
        'Upload: type and size boundaries, content-vs-extension checks, interruptions, access control.',
        'Client-side checks are UX; the server must enforce the rules.',
      ],
      source: 'WonderProxy — How to test file uploads; Medium (Sujit K P) — Effective test cases for file upload',
    },
    {
      heading: 'Testing an API endpoint',
      body: `**Intuition:** an endpoint is a contract: "send me this, I promise to send back that". Test the promise from every side: right input, wrong input, wrong person, twice in a row, and what changed in the database.

**Worked example:** \`POST /booking\` on Restful Booker creates a booking from a JSON body (\`firstname\`, \`lastname\`, \`totalprice\`, \`depositpaid\`, \`bookingdates\`, \`additionalneeds\`).

| Group | Checks |
|---|---|
| Contract | Status code, \`Content-Type\` header, response schema (field names and types), the returned \`bookingid\` |
| Validation | Each required field missing; wrong types (\`"totalprice": "abc"\`); negative price; check-out before check-in; extra unknown fields |
| Auth | Endpoints that change data (PUT/PATCH/DELETE) without a token, with an expired token, with another user's token |
| Idempotency & concurrency | POST twice creates two bookings (expected for POST); PUT twice gives the same final state; two updates at the same moment |
| Side effects | \`GET /booking/{id}\` returns what was sent; DB row matches; list endpoints include it |
| Errors | Error responses have a consistent format and never leak stack traces |
| Non-functional | Response time for a typical payload; rate limit behaviour |

**A real quirk worth mentioning:** Restful Booker's create call answers **200**, not the conventional **201 Created**. Whether that is a bug depends on the documented contract. That is exactly the kind of judgement interviewers want to hear: "I would check the API spec before raising it."`,
      code: [
        {
          language: 'http',
          title: 'Happy path, then one negative case per class',
          code: `POST https://restful-booker.herokuapp.com/booking
Content-Type: application/json
Accept: application/json

{
  "firstname": "Asha",
  "lastname": "Rao",
  "totalprice": 4500,
  "depositpaid": true,
  "bookingdates": { "checkin": "2026-11-02", "checkout": "2026-11-05" },
  "additionalneeds": "Breakfast"
}

### Negative ideas (one change each, everything else valid):
### - remove "firstname"                       -> expect 4xx, not 500
### - "totalprice": "abc"                       -> expect 4xx with a clear message
### - checkout earlier than checkin             -> expect validation error
### - PUT /booking/{id} without the token       -> expect 403 on this API
### - same POST twice                           -> two different bookingids`,
        },
      ],
      keyPoints: [
        'Contract, validation, auth, idempotency, side effects, errors, performance.',
        'Change one thing per negative test so the failure points to one cause.',
        'Check the spec before calling a status-code choice a bug.',
      ],
      source: 'Restful Booker API docs; Postman Learning Center — writing tests',
    },
    {
      heading: 'Mobile app: interruptions, networks and permissions',
      body: `**Intuition:** a phone is a hostile place for an app. Calls arrive, the train enters a tunnel, the battery saver kills background work, and the user denies the camera permission. Mobile scenario answers are judged on whether you think about *the device's life around the app*.

**Example: "How would you test a food-delivery app's order flow?"**

| Group | Scenarios |
|---|---|
| Core flow | Browse, add to cart, apply coupon, pay, track order, rate |
| Interruptions | Incoming call during payment; app sent to background and resumed; notification tapped mid-checkout; screen locked |
| Network | Switch Wi-Fi → mobile data during payment; airplane mode then back; very slow 2G-like network; request retried without double ordering |
| Permissions | Location denied (manual address entry still works); notifications denied (status still visible in app); permission revoked in settings while running |
| Device | Small and large screens, rotation, dark mode, font size at 200%, low battery and battery saver, low storage |
| OS & versions | Oldest supported Android/iOS; app upgrade keeps login and saved addresses; fresh install vs upgrade |
| Gestures & a11y | Back gesture/button behaviour, TalkBack/VoiceOver labels, touch target size |
| Push & deep links | Order-status push opens the right screen; deep link when logged out |

**Emulators vs real devices:** emulators are cheap and fast for layout and logic; real devices (or a device cloud) are needed for camera, GPS drift, real network, battery and OEM-specific behaviour.

**In interviews, say this:** "My P1 on mobile is: payment survives an interruption without a double charge, and the order is still trackable after the app is killed and reopened."`,
      keyPoints: [
        'Interruptions, network changes and permissions are mobile-specific risk areas.',
        'Test upgrade paths, not just fresh installs.',
        'Emulators for breadth, real devices for hardware and network realism.',
      ],
      source: 'Elisabeth Hendrickson — Explore It! (interruptions and variables heuristics)',
    },
    {
      heading: 'Writing cases under time pressure',
      body: `**Intuition:** in an interview (and on release day) you never have time for everything. The skill being tested is **choosing**.

**A 10-minute plan for "write test cases for X" in a live round:**

| Minute | Do this |
|---|---|
| 0–1 | Ask 2–3 clarifying questions; write assumptions at the top |
| 1–2 | Write group headings: Positive, Negative, Edge, Non-functional |
| 2–6 | Fill 2–4 cases per group as **titles with expected results**, not full templates |
| 6–8 | Mark P1/P2/P3; star the 3–5 you would run first |
| 8–10 | Add one line each on test data, environment and what you would automate |

**Prioritising with likelihood × impact:**

| | Low impact | High impact |
|---|---|---|
| **High likelihood** | P2: new UI text, layout on common screens | **P1**: main happy path, recently changed code, money/data paths |
| **Low likelihood** | P3: rare browser cosmetic issues | P2: rare but severe (data loss on power cut, security hole) |

**Tips that save time:**
- Use **one line per case**: "Wrong CVV → decline message, no order created". Expected result is never optional.
- Combine data with a table instead of repeating cases (BVA values in one row).
- Say what you are **leaving out**: "I am not covering localisation because you said English-only."

**In interviews, say this:** "If we only had 30 minutes before release, I would run these five, and here is the risk we would be accepting by skipping the rest."`,
      keyPoints: [
        'Titles plus expected results first; full templates only if asked.',
        'Prioritise with likelihood × impact and state the accepted risk.',
        'Naming what you skip is a strength, not a gap.',
      ],
      source: 'ISTQB CTFL v4.0 — 5.2 risk management (risk level = likelihood × impact)',
    },
  ],
  codeChallenges: [
    {
      id: 'qa-scenarios-cc-1',
      title: 'Improve this: a flat, unprioritised answer to "test a coupon field"',
      context:
        'In a live round the interviewer asked: "Our checkout has a coupon code field. You have five minutes. How would you test it?" The candidate typed the list below into the shared doc.',
      task: 'Rewrite the answer so it starts with clarifying questions and assumptions, groups cases, gives every case an expected result, covers business rules and abuse, and marks priorities.',
      starter: {
        language: 'text',
        title: 'Weak answer (as typed)',
        code: `1. enter valid coupon
2. enter invalid coupon
3. enter blank
4. check coupon works
5. check UI of coupon field
6. enter special characters
7. check with different browsers
8. check coupon is applied
9. check performance`,
      },
      hints: [
        'What would you need to know before testing? Think about rules: expiry, minimum order value, one per user, stacking.',
        'Cases 1, 4 and 8 are the same idea with no expected result. What exactly should change on screen and in the order?',
        'What could a dishonest user try, and what happens when the cart changes after the coupon is applied?',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite',
        code: `CLARIFYING QUESTIONS
- Rules: % or flat amount? minimum cart value? expiry? one use per user?
- Can coupons stack? Are some products excluded?
ASSUMPTIONS (if no answer): SAVE10 = 10% off, min cart 500, max discount 200,
  one use per account, expires 31-Dec, not stackable

POSITIVE
P1 SAVE10 on a 1000 cart -> discount 100, total 900, order stores coupon id
P1 SAVE10 on a 3000 cart -> discount capped at 200, total 2800
P2 lower-case "save10" accepted if codes are case-insensitive (confirm rule)

NEGATIVE
P1 Expired code -> "This coupon has expired", total unchanged
P1 Cart 499 (just below min) -> "Add 1 more to use this coupon"
P1 Second use by the same account -> rejected with a clear message
P2 Unknown code / blank / spaces only -> validation message, no API error
P2 Code with <script> or ' OR 1=1 -> treated as plain text, rejected

EDGE / STATE
P1 Apply coupon, then remove items so cart < 500 -> coupon removed, total recalculated
P2 Apply coupon in two tabs and pay in both -> only one order gets the discount
P2 Coupon + excluded product -> discount only on eligible lines

NON-FUNCTIONAL
P3 Apply response < 1 s; field labelled for screen readers; error text announced
P3 Brute-force guessing of codes is rate-limited

AUTOMATE: P1 rules as API tests (fast, data-driven); 1 UI happy path in Playwright
EXPLORE: copy-paste behaviour, mobile keyboard, messages wording`,
      },
      explanation: `- **Clarifying questions and assumptions** turn a vague prompt into testable rules; the interviewer sees you would not guess silently in a real sprint.
- **Duplicates removed:** "valid coupon", "coupon works" and "coupon applied" became precise cases with numbers, so a reader knows when the test passes.
- **Business rules as boundaries:** the minimum cart value and maximum discount are boundary tests (499 vs 500, cap at 200).
- **State changes and abuse** (removing items after applying, two tabs, reuse, brute force) are where real coupon bugs and revenue loss come from.
- **Priorities and an automation line** show risk thinking and an understanding of where Playwright and API tests fit.`,
      followUps: [
        {
          q: 'Which of these would you run first if you only had ten minutes?',
          a: 'The P1 money rules: a normal discount, the cap, the minimum-cart boundary, expiry, single use, and removing items after applying. Those are the cases where a bug either loses revenue or blocks a paying customer. UI wording and performance can wait for the next pass.',
        },
        {
          q: 'How would you automate the data-heavy rules without writing twenty UI tests?',
          a: 'Drive them through the cart/coupon API with a data table (cart value, code, expected discount, expected message) and loop over it in one parameterised test. Keep a single Playwright UI test for the happy path so the screen wiring is covered. API tests run in milliseconds and fail with clear messages, so the suite stays fast and stable.',
        },
      ],
    },
    {
      id: 'qa-scenarios-cc-2',
      title: 'Improve this: file-upload test cases with no preconditions or expected results',
      context:
        'A teammate drafted test cases for a "Upload resume" feature on a job portal (PDF or DOCX, max 5 MB). The lead rejected them in review. You are asked to fix them before the sprint demo.',
      task: 'Rewrite the cases so each has an ID, preconditions, exact test data, steps and an expected result, and so the set covers boundaries, invalid content, interruptions and access control.',
      starter: {
        language: 'text',
        title: 'Weak draft',
        code: `TC1 Upload file - should work
TC2 Upload big file - error
TC3 Upload wrong file - error
TC4 Upload again
TC5 Check resume is saved`,
      },
      hints: [
        '"Big" and "wrong" are not test data. Which exact sizes sit on each side of 5 MB? Which wrong types matter most?',
        'What must be true before the test starts (logged in? existing resume?) and what should the user and the system show afterwards?',
        'Who else could reach the uploaded file? What if the connection drops at 60%?',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite (titles, data and expected results)',
        code: `Precondition for all: candidate "asha.qa@test.io" logged in, profile page open,
no resume uploaded yet (unless stated)

UP-01 Valid PDF 1 MB          -> progress bar, "Resume uploaded", file name shown,
                                 GET /me/resume returns the same file (checksum match)
UP-02 Valid DOCX 4.99 MB      -> uploaded successfully (just under limit)
UP-03 PDF exactly 5.00 MB     -> uploaded successfully (limit is inclusive: confirm)
UP-04 PDF 5.01 MB             -> "File must be 5 MB or smaller"; nothing stored
UP-05 0-byte PDF              -> "File is empty"; nothing stored
UP-06 resume.exe renamed .pdf -> rejected by server content check, not just extension
UP-07 Password-protected PDF  -> rule confirmed with PO (accept or clear message)
UP-08 File name with spaces & unicode "Asha Rao CV – 2026.pdf" -> stored, shown intact
UP-09 Existing resume, upload new one -> replaces old; old one no longer downloadable
UP-10 Network drops at ~60%   -> clear error, retry works, no half file stored
UP-11 Logged in as another candidate, request first user's resume URL
                              -> 403/404; file never served to the wrong user
UP-12 Keyboard only: choose file, upload, hear status with a screen reader
                              -> all steps reachable; status announced`,
      },
      explanation: `- **Preconditions** make each case repeatable by anyone.
- **Exact data** (4.99, 5.00, 5.01 MB, 0 bytes) turns "big file" into boundary value analysis, and UP-03 flags the inclusive/exclusive question for the product owner.
- **Content vs extension (UP-06)** catches a security gap that a picker-only check misses.
- **Interruptions and replacement (UP-09, UP-10)** test the storage pipeline, not just the button.
- **Access control (UP-11)** catches a data leak between users, which would be a severity-1 bug on a job portal.
- **Expected results everywhere**: every case says what the user sees *and* what the system stores.`,
      followUps: [
        {
          q: 'Which of these would you automate with Playwright, and how would you avoid storing big binary fixtures in the repo?',
          a: 'Automate UP-01, UP-04, UP-05 and UP-09 through the UI with setInputFiles, and UP-06 and UP-11 through the API with the request fixture. Generate files at test time (for example a Buffer of the exact size passed to setInputFiles as name, mimeType and buffer) instead of committing 5 MB fixtures, so the repo stays small and sizes are precise.',
        },
        {
          q: 'The product owner says 5 MB means 5,000,000 bytes, but the developer used 5 × 1024 × 1024. What do you do?',
          a: 'That is a requirements ambiguity, so raise it before it becomes a bug argument. Show both numbers, the boundary files that behave differently (5,000,001 to 5,242,880 bytes) and ask the PO to choose. Then update the acceptance criteria and the error message so they match, and add both boundary values to the test set.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'qa-scenarios-iq-01',
      difficulty: 'easy',
      question: 'How would you test a pen? Walk me through your thinking, not just a list.',
      context: 'A warm-up classic in fresher and junior QA rounds. The interviewer is timing how long you take before asking a question.',
      whatInterviewerLooksFor: [
        'Asks what kind of pen and who it is for before listing tests',
        'Groups ideas (functional, negative, durability, safety, usability)',
        'Includes misuse and environment, not only "it writes"',
        'Prioritises and connects the object to software thinking',
      ],
      modelAnswer: `**Clarify (10 seconds):** "Is it a ballpoint, gel or fountain pen? Office use, children, or something special like writing upside down? Is there a spec, for example claimed writing length?" If they say "you decide": *a retractable ballpoint for office use, claimed 1.5 km of writing.*

**Then group the tests:**

- **Functional:** writes a continuous line as soon as it touches paper; clicker extends and retracts every time; ink colour matches the label.
- **Negative / misuse:** glossy or damp paper; writing upside down; pressing the clicker thousands of times; leaving it uncapped for a day.
- **Boundary / capacity:** measure the length of line until ink runs out against the 1.5 km claim.
- **Durability & environment:** drop from desk height; leave in a hot car; take on a flight (pressure change → leaks?).
- **Safety:** non-toxic ink; vented cap or parts too big to swallow; no sharp edges.
- **Usability:** grip comfort over 30 minutes, left-handed smudging.
- **Packaging/labelling:** printed brand does not rub off; barcode scans.

**Prioritise:** P1 is "writes reliably and does not leak", because that is why anyone buys it, and safety for any product a child might pick up. P2 is durability and capacity. P3 is comfort and looks.

**Connect it to software:** the clicker is a two-state machine, the ink is a capacity boundary, and the hot car is an environment/compatibility test. "If this were an app, I would automate the repetitive checks (the 10,000 clicks) and keep the comfort and look-and-feel for a human."`,
      followUps: [
        {
          q: 'What if I tell you the pen is for astronauts?',
          a: 'The context changes the priorities completely. Writing without gravity, in a vacuum or at very low temperature becomes P1, and so does outgassing or flammability in a pure-oxygen cabin. Clip strength matters because a floating pen is a hazard. I would ask for the environmental spec and redo the risk ranking. This shows that requirements drive tests.',
        },
        {
          q: 'How many test cases would you write?',
          a: 'I would not aim for a number. I would cover each risk area with the smallest set that gives confidence, about 10–15 here, and add more only where risk is high. If you need a count for planning, I would estimate by area and say which ones I would skip under time pressure.',
        },
      ],
      pitfalls: [
        'Listing 20 happy-path cases ("writes blue", "writes on paper") with no structure',
        'Never asking what kind of pen or who uses it',
        'Forgetting safety and misuse entirely',
      ],
    },
    {
      id: 'qa-scenarios-iq-02',
      difficulty: 'medium',
      question: 'Our web app has an email + password login with "Remember me" and a lockout after 5 failed attempts. What would you test first, and why?',
      whatInterviewerLooksFor: [
        'Prioritises security and session behaviour, not just valid/invalid',
        'Separates each invalid class with its own expected result',
        'Mentions generic error messages and lockout boundaries (4th, 5th, 6th attempt)',
        'Thinks about logout, back button and multiple sessions',
        'Knows what to automate',
      ],
      modelAnswer: `**First, two questions:** "How long does the lockout last and how is it unlocked? Is 'Remember me' a long-lived cookie or a refresh token, and for how many days?"

**My first five (P1), in order:**

1. **Valid login per role** lands on the right page, and the session cookie is \`Secure\` and \`HttpOnly\`.
2. **Wrong password** shows a *generic* message ("email or password is incorrect"). It must not reveal whether the email exists, which OWASP recommends to prevent account enumeration.
3. **Lockout boundary:** attempts 4 and 5 fail normally, the 5th triggers the lock, the 6th with the *correct* password is still refused, and after the lock period it works again. Also check that the counter resets after a successful login.
4. **Logout really ends the session:** after logout, Back does not show the dashboard and the old session cookie gets 401 from the API.
5. **Remember me:** survives a browser restart; *not* ticked means the session ends with the browser; changing the password invalidates remembered sessions on other devices.

**Then P2:** leading/trailing spaces and upper-case email, empty fields, very long input, injection-style strings handled safely, password masked and never in URLs or logs, rate limit per IP as well as per account.

**Then P3:** keyboard-only use, screen-reader announcement of errors, caps-lock hint, layout on mobile browsers.

**Why this order:** login bugs that reach production are usually security or session bugs, and they affect every user. Cosmetic issues rarely become incidents.

**Automation:** cases 1–5 as Playwright tests (use \`storageState\` elsewhere so only these tests go through the UI login), lockout counting via the API to keep it fast and avoid locking shared accounts.`,
      followUps: [
        {
          q: 'The lockout test locks your shared QA account and breaks everyone else\'s tests. How do you avoid that?',
          a: 'Create a fresh user per test run through an API or seed script, and use it only for the lockout test. Clean it up afterwards. Never run destructive or state-changing tests against a shared account. In Playwright this fits naturally in a fixture that creates and deletes the user, so other tests are untouched.',
        },
        {
          q: 'Would you report it as a bug if the error says "Email not registered"?',
          a: 'Yes, as a security issue (user enumeration), but I would frame it with evidence and the OWASP guidance rather than opinion. Severity depends on context: on a banking app it is high, on an internal tool it may be lower. Some products deliberately accept the risk for usability, so the PO and security team decide; my job is to make the risk visible.',
        },
      ],
      pitfalls: [
        '"Valid login, invalid login, blank fields" and nothing on security or sessions',
        'Testing only 5 failed attempts but not the 4th and 6th (missing the boundary)',
        'Planning to automate lockout against a shared test account',
      ],
    },
    {
      id: 'qa-scenarios-iq-03',
      difficulty: 'medium',
      question: 'How would you test cash withdrawal on an ATM? Assume I am the bank and I care most about money accuracy.',
      context: 'A classic in service-company manual rounds; answer guides note that the interviewer checks your approach and coverage of major functions, since you have no SRS.',
      whatInterviewerLooksFor: [
        'Models the flow as states with failure branches',
        'Tests limits as boundaries (balance, per-transaction, daily, denominations)',
        'Covers debit-without-dispense and retracted cash',
        'Checks evidence beyond the screen (statement, SMS, reconciliation)',
      ],
      modelAnswer: `**Clarify:** "Which denominations does the machine hold? Per-transaction and daily limits? Our bank's cards only, or others too? Is there a fee for other banks?" Assume: notes of 100, 200 and 500; 10,000 per transaction; 25,000 per day.

**Flow as states:** card → PIN → menu → amount → authorise → dispense → return card and receipt. I test the happy path once, then the failure branch at each step.

**Amount rules (boundaries):**
- 100 (minimum) succeeds; 50 or 150 rejected ("enter a multiple of 100").
- 10,000 succeeds; 10,100 rejected for the per-transaction limit.
- Two withdrawals adding up to 25,000 succeed; one more of 100 the same day is rejected.
- Amount above the balance is rejected with no debit.
- Machine out of 500s: 1,500 is given as 200s and 100s, or a clear message, per the rule.

**Money accuracy under failure (P1):**
- Debit approved, then the dispenser jams → automatic reversal; the statement shows debit and credit or no debit at all.
- Cash presented but not taken within the timeout → retracted and credited back.
- Network timeout after authorisation → no double debit when the customer retries.
- Power cut mid-transaction → consistent state after restart.

**Evidence:** I check the account balance and mini-statement, the SMS alert, the machine's journal log, and the end-of-day reconciliation between cash counted and transactions.

**Other areas, briefly:** wrong PIN 3 times, expired card, card return before cash, receipts mask the card number, language choice, accessibility (audio guidance).

**Priority:** money accuracy under failure first, then limits, then messages and usability.`,
      followUps: [
        {
          q: 'You cannot cut power to a real ATM in a test lab. How would you test the reversal?',
          a: 'Use a simulator or a test harness for the dispenser and the host link, and inject the fault: make the dispense command return an error after authorisation. Then verify the reversal message reaches the host and the account. In software terms this is fault injection with stubs, the same idea as mocking a failing payment gateway in Playwright with page.route.',
        },
        {
          q: 'Which of these would you hand to automation?',
          a: 'The rules engine checks: amount multiples, limits, balance checks and reversals, driven by data at the API or service level, where they run fast. Hardware behaviour (card reader, dispenser timing) and usability stay in a lab with a person, maybe with simulators. Automation is for repeatable logic; physical interaction needs a human.',
        },
      ],
      pitfalls: [
        'Only screen-level cases ("enter amount, click OK, cash comes")',
        'No failure-after-debit scenarios, which are the real money risk',
        'Testing limits with random values instead of on and around the boundaries',
      ],
    },
    {
      id: 'qa-scenarios-iq-04',
      difficulty: 'medium',
      question: 'How would you test an elevator in a 20-floor office building?',
      whatInterviewerLooksFor: [
        'Scopes the system under test (control software vs mechanics) before listing',
        'Puts passenger safety first',
        'Thinks about scheduling under real traffic (rush hour, many calls)',
        'Includes accessibility and failure states',
      ],
      modelAnswer: `**Scope first:** "Am I testing the controller software, the full product, or the passenger experience? How many cars? Keycard floors? Fire-service mode?" Mechanical certification (cables, brakes) is for specialist engineers, so I will say that and focus on control behaviour and the user experience. Assume 4 cars, 20 floors, keycard access to floors 18–20.

**P1: safety**
- The car never moves with doors open; doors never open between floors.
- Door sensor reopens the doors when something blocks them.
- Over the rated load, an alarm sounds and the car does not move.
- Alarm/intercom works, including during a power failure; on power loss the car goes to the nearest floor and opens, or holds safely.
- Fire mode sends cars to the ground floor and ignores calls.

**P2: core function and scheduling**
- Calls from every floor in both directions; the right car arrives and stops level with the floor.
- 9 a.m. rush: many up-calls from the lobby are shared across cars; a call on floor 12 is not starved for minutes.
- Two cars do not both answer the same call; same-direction pickups happen on the way.
- Keycard floors cannot be chosen without a valid card.

**P3: experience and accessibility**
- Floor display and chime are correct; braille and audio announcements; door open time is long enough for a wheelchair; buttons reachable from a seated position.

**Operations:** maintenance mode, fault logs, service counters, behaviour after the system restarts.

**How I would test scheduling:** with a simulator that replays traffic patterns (morning, lunch, evening) and measures waiting times, because you cannot reproduce rush hour with real people every build.`,
      followUps: [
        {
          q: 'What does "fair" scheduling mean, and how would you measure it?',
          a: 'Clarify the goal with the product owner: average wait time, maximum wait time, or energy use. They can conflict. I would measure the average and the 95th-percentile wait per floor in simulated traffic, and set an upper bound so no floor waits too long. Then I would check that optimising the average does not starve the top floors.',
        },
        {
          q: 'Which state transitions would you draw for a single car?',
          a: 'Idle, doors opening, doors open, doors closing, moving up, moving down, stopped at floor, out of service, emergency. Key invalid transitions to test: moving while doors are open or opening, and opening while moving. A state transition table makes these "should never happen" pairs explicit, so each one gets a test.',
        },
      ],
      pitfalls: [
        'Starting with button colours and display fonts',
        'Claiming to test brake cables and motors as a software tester',
        'Ignoring people: crowds, wheelchair users, people holding the door',
      ],
    },
    {
      id: 'qa-scenarios-iq-05',
      difficulty: 'hard',
      question: 'We are integrating a new payment gateway into checkout next sprint. How would you test it?',
      context: 'Payment-scenario questions are reported for Accenture QA roles on AmbitionBox (2024). Product companies ask the same with deeper follow-ups on webhooks and refunds.',
      whatInterviewerLooksFor: [
        'Uses the gateway sandbox and documented test cards',
        'Puts double charge and charge-without-order at the top',
        'Covers webhooks, timeouts, refunds and reconciliation',
        'Mentions security (no card data stored or logged, price tampering)',
        'Plans API/DB checks, not only UI',
      ],
      modelAnswer: `**Clarify:** "Which methods (cards, UPI, wallets)? Do we capture immediately or authorise first and capture on shipping? Which currencies? Does the gateway call us back by webhook?"

**Environment:** the gateway's **sandbox** with its documented test cards and test UPI IDs. For example, Stripe's 4242 4242 4242 4242 succeeds and 4000 0000 0000 0002 is declined. Never real cards.

**P1: money correctness**
- Success: exactly one paid order, one charge, one email; the order amount equals the gateway amount.
- **Double submit:** double-click Pay, refresh the processing page, Back then Pay again → one charge.
- **Timeout then late success:** the user sees "confirming"; the webhook arrives later; the order becomes PAID without a second charge.
- **Charge without order:** the gateway succeeds but our order service fails → refund or recovery job, with an alert.
- **Price tampering:** change the amount in the request → server recalculates and rejects.

**P2: failures and flows**
- Declined, insufficient funds, expired card, wrong CVV, 3-D Secure failed/abandoned, UPI request expired, user closes the gateway window.
- Full and partial refunds, refund after a coupon, refund status shown to the user.
- Webhook security: signature verified, replayed or duplicate webhooks ignored.

**P3:** mobile layout, accessibility of the payment form, multiple currencies and rounding, load on a sale day.

**Security:** card numbers never stored or logged by us, HTTPS everywhere, the gateway's hosted fields or SDK used as intended.

**Evidence:** UI, API responses, our DB (orders, payments), the gateway dashboard, and a daily **reconciliation** query that pairs captured payments with orders.

**Automation:** Playwright UI tests for success and decline with sandbox cards; API tests for webhook handling with signed sample payloads; a reconciliation SQL check in CI.`,
      followUps: [
        {
          q: 'How would you test the webhook if the sandbox cannot reach your local machine?',
          a: 'Use the gateway\'s CLI or a tunnelling tool to forward sandbox events to the test environment, or post signed sample payloads directly to our webhook endpoint from an API test. I would test valid signatures, invalid signatures (rejected), duplicate events (handled once) and events arriving out of order.',
        },
        {
          q: 'What is the difference between authorisation and capture, and why does it matter for testing?',
          a: 'Authorisation reserves the money on the card; capture actually takes it, often later, for example when the item ships. Tests must cover capture after authorisation, an authorisation that expires uncaptured, partial capture when one item is out of stock, and cancelling an authorisation. Bugs here show up as customers seeing holds on their money with no order.',
        },
      ],
      pitfalls: [
        'Testing only success and decline on the UI',
        'Suggesting real cards or production for testing',
        'Never mentioning idempotency, webhooks or reconciliation',
      ],
    },
    {
      id: 'qa-scenarios-iq-06',
      difficulty: 'medium',
      question: 'Here is GET /api/orders?status=&page=&size= which lists a user\'s orders. Without seeing the code, what would you test?',
      whatInterviewerLooksFor: [
        'Covers contract, parameters, auth, pagination and data correctness',
        'Tests boundaries on page and size',
        'Checks one user cannot see another user\'s orders',
        'Compares API output with the database',
      ],
      modelAnswer: `**Clarify:** "What are the allowed statuses? Default and maximum page size? Is page 0- or 1-based? Sort order?" Assume statuses PLACED/SHIPPED/DELIVERED/CANCELLED, default size 20, max 100, 1-based pages, newest first.

**Contract:** 200 with \`application/json\`; schema has \`items\`, \`page\`, \`size\`, \`total\`; each item has the documented fields and types; dates in one format.

**Filtering:** each valid status returns only that status; no status returns all; an unknown status (\`status=LOST\`) gives 400 with a clear message rather than everything or a 500; case sensitivity is defined.

**Pagination boundaries:**
- size 1, 20, 100 work; size 0, 101, -1, \`abc\` are rejected or clamped as documented.
- Page 1 and the last page; a page beyond the last returns an empty list, not an error.
- Walking all pages gives \`total\` items with **no duplicates or gaps**, even while new orders are created in between.

**Auth and data isolation (P1):**
- No token → 401; expired token → 401; user A's token never returns user B's orders, even with tricks like \`userId=\` added to the query.

**Correctness against the DB:** for a seeded user, the API's count per status equals a SQL \`COUNT(*) ... GROUP BY status\`, and the sort order matches \`created_at DESC\`.

**Non-functional:** response time with a user who has 5,000 orders; consistent error format; no stack traces in errors.

**Automation:** this is ideal for API automation (Postman/Newman or Playwright's \`request\` fixture), driven by a data table of parameter combinations.`,
      followUps: [
        {
          q: 'Pagination shows the same order on page 1 and page 2. What could cause that, and how would you prove it?',
          a: 'Usually an unstable sort: sorting only by created_at when two orders share the same timestamp, or new rows inserted between page requests with offset-based paging. I would seed orders with identical timestamps and page through them, then repeat while inserting new orders. The fix is a tie-breaker (created_at, id) or cursor-based pagination.',
        },
        {
          q: 'Which status code would you expect for size=101?',
          a: 'It depends on the documented contract. A 400 with a message like "size must be ≤ 100" is the clearest. Some APIs silently clamp to 100, which is acceptable if documented and the response reports size=100. What is never acceptable is a 500 or returning 101 items. If the spec is silent, I raise it as a question first.',
        },
      ],
      pitfalls: [
        'Only checking that the call returns 200',
        'No authorisation test across two users',
        'Ignoring pagination consistency and boundaries',
      ],
    },
    {
      id: 'qa-scenarios-iq-07',
      difficulty: 'hard',
      question: 'How would you test the order-tracking flow of a food-delivery mobile app?',
      whatInterviewerLooksFor: [
        'Mobile-specific risks: interruptions, network changes, background/kill, permissions',
        'Real-time updates and push notifications',
        'Device and OS coverage strategy (emulators vs real devices)',
        'Prioritisation around payment and order state integrity',
      ],
      modelAnswer: `**Clarify:** "Android and iOS? Native or hybrid? Does tracking use live GPS from the rider and push notifications? Which OS versions are supported?"

**Core flow:** order placed → restaurant accepts → preparing → rider assigned → picked up → on the way (live map) → delivered → rate. Each status change appears in the app, in the push notification and in order history in the same order.

**P1**
- Status is never lost or out of order: kill the app during "preparing", reopen during "on the way" → current status shown.
- Network switch (Wi-Fi to mobile data), tunnel or airplane mode → app reconnects and catches up without duplicating the order.
- Push notification for each key status opens the right order screen, including from a cold start and when logged out (asks for login, then deep-links).
- Cancel window: cancelling before acceptance refunds; after pickup, the button is hidden or explains why.

**P2**
- Location permission denied: tracking map shows the rider and ETA text without the user's location; no crash.
- Notifications disabled: in-app status still updates.
- Interruptions: incoming call, screen lock, low-battery saver during tracking.
- Rider GPS jumps or stops: map does not teleport wildly, ETA updates sensibly.

**P3**
- Rotation, dark mode, large fonts, small screens, TalkBack/VoiceOver labels for status, map and buttons.

**Coverage strategy:** a matrix of the top devices by our analytics (for example 6 Android, 3 iOS), oldest and newest supported OS, run on a device cloud. Emulators for daily checks, real devices for GPS, push, battery and network behaviour.

**Upgrade path:** install the old version, place an order, upgrade during tracking → tracking continues.`,
      followUps: [
        {
          q: 'How do you simulate a moving rider without going outside?',
          a: 'Use mock locations: Android emulators and iOS simulators can replay a GPS route (a GPX file), and the backend team can expose a test endpoint that replays a rider path. That makes the route deterministic, so you can assert on ETA changes and map updates. Real-device field tests are still worth a quick pass before release.',
        },
        {
          q: 'How would you pick which devices to test on?',
          a: 'Start from production analytics: the devices and OS versions covering most of our users, plus the oldest supported OS and one low-end device with little memory. Add any device with a known history of issues. Rotate lower-share devices across releases. This is risk-based coverage rather than "test everything".',
        },
      ],
      pitfalls: [
        'Describing only web-like functional cases',
        'Never mentioning killing/backgrounding the app or network changes',
        'Saying "test on all devices" with no selection strategy',
      ],
    },
    {
      id: 'qa-scenarios-iq-08',
      difficulty: 'hard',
      question: 'I give you 15 minutes to test our product search before it goes live. What exactly do you do?',
      whatInterviewerLooksFor: [
        'Time-boxing and explicit prioritisation',
        'Picks high-impact checks first (correct results, empty state, no errors, security of input)',
        'States what will be skipped and the risk accepted',
        'Communicates findings in a release-friendly way',
      ],
      modelAnswer: `**Minute 0–1, scope and assumptions:** "Is this a new search engine or a UI change? What changed in this release?" Fifteen minutes means I test **what changed and what hurts most**, not everything.

**Minutes 1–9, P1 checks (about 1 minute each):**
1. Search a best-selling product by exact name → it appears near the top.
2. Partial word and different case ("iph", "IPHONE") → sensible results.
3. A term with no matches → friendly empty state, no error page.
4. Blank and spaces-only search → no crash, sensible behaviour.
5. Special characters and \`<script>alert(1)</script>\` → shown as text, not executed; no 500.
6. Apply the most-used filter and sort (price low → high) → order is correct on page 1 and 2.
7. Open a result → product page and price match the listing.
8. Same three searches on mobile web.

**Minutes 9–12, quick exploratory pass:** misspellings, very long input, fast typing with autocomplete (one request per keystroke? debounced?), Back button keeps the query and filters.

**Minutes 12–15, report:** one message to the release channel:
- **Tested:** the eight checks above on Chrome desktop and Android Chrome.
- **Found:** e.g. "sort by price puts 1,000 before 200 on page 2 (string sort)", with screenshot and steps.
- **Not tested:** Safari, synonyms, performance under load, relevance quality beyond top results.
- **My view:** go / no-go and why.

**Why this order:** correct results and no crashes affect every user and revenue directly; relevance tuning and rare inputs are lower risk for one release.`,
      followUps: [
        {
          q: 'You find a medium bug at minute 10. Do you stop and write a full bug report?',
          a: 'No. I note it in one line with a screenshot and keep testing until minute 12, because one more P1 check is worth more than a polished report. In the final message I flag it with clear steps and my view on whether it should block release. The full Jira ticket can follow straight after the go/no-go decision.',
        },
        {
          q: 'Who makes the go/no-go decision?',
          a: 'Usually the product owner or release manager, with input from engineering and QA. My job is to give clear information: what I tested, what I found, what I did not cover, and the risk. I give a recommendation but I do not pretend to own the business decision. Owning that boundary clearly builds trust.',
        },
      ],
      pitfalls: [
        'Trying to cover everything and finishing nothing',
        'Not stating what was skipped',
        'Reporting "search looks fine" with no evidence',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'qa-scenarios-drill-1',
      question:
        'ATM withdrawal rules: amounts must be multiples of 100, minimum 100, maximum 10,000 per transaction, and the account has a balance of 7,350. List the test amounts you would use (BVA + EP) and the expected outcome for each.',
      assumptions: [
        'Notes available: 100, 200, 500 (enough of each)',
        'Valid amount = multiple of 100 AND 100 ≤ amount ≤ 10,000 AND amount ≤ balance',
        'Balance 7,350 is below the transaction limit, so the balance is the effective upper bound',
      ],
      steps: [
        { label: 'Partitions for "multiple of 100"', calc: 'Valid: 100, 200, …; invalid: 50, 150, 7,349' },
        { label: 'Lower boundary (2-value BVA)', calc: '0 (reject: below min), 100 (accept: min)' },
        { label: 'Effective upper bound', calc: 'min(10,000 limit, 7,350 balance) = 7,350 → largest multiple of 100 ≤ 7,350 = 7,300' },
        { label: 'Upper boundary values', calc: '7,300 (accept), 7,400 (reject: insufficient balance)' },
        { label: 'Transaction limit still matters', calc: 'Use a second account with balance 20,000: 10,000 accept, 10,100 reject (limit)' },
        { label: 'Invalid-format classes', calc: '150 (not a multiple), -100 (negative), blank (no amount)' },
      ],
      answer: `| Amount | Account | Expected |
|---|---|---|
| 0 | 7,350 | Rejected: below minimum |
| 100 | 7,350 | Dispensed; balance 7,250 |
| 150 | 7,350 | Rejected: must be a multiple of 100 |
| 7,300 | 7,350 | Dispensed; balance 50 |
| 7,400 | 7,350 | Rejected: insufficient funds; **no debit** |
| 10,000 | 20,000 | Dispensed |
| 10,100 | 20,000 | Rejected: per-transaction limit |
| -100 / blank | 7,350 | Input refused at the keypad/screen |`,
      insight:
        'When two limits apply (balance and transaction limit), the effective boundary is the smaller one, so you need two accounts to test both. Interviewers love candidates who notice that one boundary can hide another.',
      followUps: [
        {
          q: 'How does a daily limit of 25,000 change your values?',
          a: 'Add a cumulative boundary: on a rich account, withdraw 10,000 + 10,000 + 5,000 (accept, total exactly 25,000), then 100 more (reject: daily limit). Also test the reset: the same 100 succeeds after midnight in the bank\'s timezone, which is a classic date/time edge.',
        },
      ],
    },
    {
      id: 'qa-scenarios-drill-2',
      question:
        'Release is in 30 minutes. You have these 10 checkout scenarios and time for about 5. Pick and order them, and say what risk you accept: (a) pay with saved card, (b) apply expired coupon, (c) change delivery address, (d) double-click Pay, (e) gift-wrap option, (f) declined card message, (g) guest checkout, (h) order confirmation email, (i) checkout on Safari, (j) tax for a different state.',
      assumptions: [
        'This release changed the payment step and the coupon service',
        'About 60% of orders use saved cards; guest checkout is 15%; Safari is 12% of traffic',
        'Gift wrap is used by under 1% of orders',
      ],
      steps: [
        { label: 'Score impact', calc: 'Money/charge bugs (a, d, f) = high; coupon (b) = changed code; email (h) = medium; e = low' },
        { label: 'Score likelihood', calc: 'Changed areas: payment (a, d, f) and coupon (b) are most likely to break' },
        { label: 'Rank by likelihood × impact', calc: 'd (double charge) > a (main path) > f (decline) > b (changed coupon) > g (15% of orders)' },
        { label: 'Leave out and state risk', calc: 'c, e, h, i, j: unchanged areas or low traffic; note Safari 12% as the biggest accepted risk' },
      ],
      answer: `**Run, in order:** (a) saved-card payment → (d) double-click Pay → (f) declined card → (b) expired coupon → (g) guest checkout.

**Accepted risk (say it aloud):** Safari-specific payment issues (12% of traffic), the email and tax calculations (unchanged this release, covered by yesterday's regression), and gift wrap (under 1%). If anything in the top five fails, I recommend no-go.`,
      insight:
        'Prioritisation is likelihood × impact anchored to what changed. Saying the accepted risk out loud turns "I didn\'t test it" into a business decision someone else can sign off.',
      followUps: [
        {
          q: 'The product owner insists on Safari. What do you drop?',
          a: 'Swap guest checkout (g) for Safari saved-card payment, since guest checkout code did not change and Safari covers more traffic (12% vs 15% but higher change risk on the payment step). Tell the PO explicitly that guest checkout is now untested this release, so the trade-off is shared and recorded.',
        },
      ],
    },
    {
      id: 'qa-scenarios-drill-3',
      question:
        'For POST /users with body { "email": string (required, valid format, unique), "age": integer (required, 18–60), "plan": "free" | "pro" (optional, default "free") }, derive a minimal set of negative API tests where each test changes exactly one thing.',
      assumptions: [
        'Baseline valid body: { "email": "neha@test.io", "age": 30, "plan": "pro" }',
        'Validation errors should return 400 with a field-level message; duplicates 409',
        'Unknown extra fields are rejected (strict schema)',
      ],
      steps: [
        { label: 'Required fields', calc: 'Remove email → 400; remove age → 400' },
        { label: 'Type errors', calc: 'age "thirty" → 400; email 123 → 400; plan true → 400' },
        { label: 'Format / enum', calc: 'email "neha@" → 400; plan "gold" → 400' },
        { label: 'Boundaries on age', calc: '17 → 400; 18 → 201; 60 → 201; 61 → 400' },
        { label: 'Business rule', calc: 'Same email twice → second call 409' },
        { label: 'Defaults & extras', calc: 'Omit plan → 201 with plan "free"; add "role": "admin" → 400 (no privilege injection)' },
      ],
      answer: `About **14 tests**: 2 missing-field, 3 wrong-type, 2 format/enum, 4 age boundary (17, 18, 60, 61), 1 duplicate (409), 1 default value, 1 unexpected field. Each changes one thing from the valid baseline, so a failure points to exactly one rule. The \`"role": "admin"\` case is the security-minded one: it checks the API does not accept fields that grant privileges (mass assignment).`,
      insight:
        'One-change-per-test makes negative API tests self-diagnosing, and turning the schema into a checklist (required, type, format, range, uniqueness, defaults, extras) makes the set repeatable for any endpoint.',
      followUps: [
        {
          q: 'How would you run these 14 cases without writing 14 separate tests?',
          a: 'Put them in a data table (field change, expected status, expected message) and loop: in Playwright, a for...of over the array creating one test per row with the request fixture; in Postman, a CSV/JSON data file with the Collection Runner or Newman. Each row still reports separately, so failures stay readable.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'qa-scenarios-mcq-01',
      difficulty: 'easy',
      question: 'An interviewer asks "How would you test a vending machine?" What is the best first move?',
      options: [
        'Ask what the machine sells, which payment types it takes and who uses it, then state assumptions',
        'Start listing positive test cases quickly to show speed',
        'Say you cannot test it without a requirements document',
        'Begin with performance testing because machines are used heavily',
      ],
      correct: [0],
      explanation:
        'Clarifying questions plus stated assumptions are part of the answer: they show you scope before testing. Listing cases immediately looks unstructured, refusing without an SRS misses the point of the exercise, and jumping to performance ignores the core function and risks.',
      followUps: [
        {
          q: 'The interviewer says "assume whatever you like". Now what?',
          a: 'Say your assumptions aloud, for example "a snack machine taking coins, cards and UPI, used in an office", write them at the top, and refer back to them. That keeps the answer testable and lets the interviewer correct you early.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-02',
      difficulty: 'easy',
      question: 'Which login test is most likely to catch a real security problem?',
      options: [
        'Wrong password shows an error that does not reveal whether the email exists',
        'The login button is blue and aligned with the fields',
        'A valid username and password reach the home page',
        'The page title says "Login"',
      ],
      correct: [0],
      explanation:
        'A message such as "email not registered" lets an attacker enumerate valid accounts, which OWASP recommends preventing with a generic message. Colour and title checks are cosmetic, and the valid-login case is a functional happy path, not a security check.',
      followUps: [
        {
          q: 'What other login check prevents brute-force attacks?',
          a: 'Lockout or rate limiting after a number of failed attempts (per account and per IP), possibly with CAPTCHA. Test the boundary: attempt N-1, N and N+1, and the unlock behaviour.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-03',
      difficulty: 'easy',
      question: 'What does the "T" in the SFDPOT heuristic remind you to test?',
      options: [
        'Time: timeouts, dates, sequences, concurrency and how things change over time',
        'Text: labels, spelling and translations',
        'Tools: which automation tool to use',
        'Traceability: linking tests to requirements',
      ],
      correct: [0],
      explanation:
        'SFDPOT is Structure, Function, Data, Platform, Operations, Time. Time covers timeouts, date boundaries, race conditions and long-running use. Text, tools and traceability are useful ideas but are not what the letter stands for in Bach and Bolton\'s heuristic.',
      followUps: [
        {
          q: 'Give one Time-based test for a hotel booking site.',
          a: 'Book a stay across a daylight-saving change or New Year, or hold a room for 15 minutes and check it is released when the hold expires. Both are classic time bugs.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-04',
      difficulty: 'medium',
      question: 'A candidate wrote these test cases for a coupon field. What is the most important weakness?',
      code: {
        language: 'text',
        code: `TC1  Enter valid coupon
TC2  Enter invalid coupon
TC3  Check coupon works properly
TC4  Check discount is correct`,
      },
      options: [
        'No test data or expected results, so nobody can tell when a case passes',
        'There should be exactly 10 test cases for a coupon field',
        'The IDs should start at TC0',
        'Coupon fields should only be tested with automation',
      ],
      correct: [0],
      explanation:
        '"Valid", "invalid" and "works properly" are not testable without exact codes, cart values and expected totals or messages. There is no correct fixed count, ID numbering is irrelevant, and coupons need both manual exploration and automation.',
      followUps: [
        {
          q: 'Rewrite TC4 so it is testable.',
          a: 'For example: "Cart 1,000, apply SAVE10 (10% off, max 200) → discount line shows 100, total 900, and the order record stores coupon SAVE10."',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-05',
      difficulty: 'medium',
      question: 'For an ATM, which scenario is MOST important to test from a money-accuracy point of view?',
      options: [
        'Account is debited but the dispenser jams, and the system must reverse the debit',
        'The welcome screen shows the bank logo',
        'Receipts print in the chosen language',
        'Buttons beep when pressed',
      ],
      correct: [0],
      explanation:
        'Debit-without-dispense directly loses customer money and creates disputes, so the reversal path is P1. Logo, language on receipts and beeps matter for experience but rarely cause financial loss.',
      followUps: [
        {
          q: 'How would you verify the reversal happened?',
          a: 'Check the account balance and mini-statement (debit and matching credit, or no debit), the SMS alert, the ATM journal, and the host transaction log; then confirm the end-of-day reconciliation balances.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-06',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which are good clarifying questions before testing an elevator?',
      options: [
        'Am I testing the control software, the mechanics or the passenger experience?',
        'How many floors and cars, and are any floors restricted by keycard?',
        'What colour should the buttons be?',
        'Is there a fire-service or emergency mode I need to cover?',
        'Can I skip safety testing to save time?',
      ],
      correct: [0, 1, 3],
      explanation:
        'Scope, configuration and special modes change what you test and in what order. Button colour is a detail you can test later, not a scoping question. Skipping safety is the opposite of risk-based thinking for a product that carries people.',
      followUps: [
        {
          q: 'If the interviewer says "the control software only", what drops out of scope?',
          a: 'Mechanical certification (cables, brakes, motors) and physical durability. You still test what the software controls: door logic, scheduling, overload response, emergency modes and displays, usually with a simulator.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-07',
      difficulty: 'medium',
      question: 'The resume-upload limit is 5 MB. Which set of file sizes gives the best boundary coverage?',
      options: [
        '0 bytes, 4.99 MB, 5.00 MB, 5.01 MB',
        '1 MB, 2 MB, 3 MB, 4 MB',
        '10 MB and 100 MB only',
        'Any single valid file, because size checks are done by the browser',
      ],
      correct: [0],
      explanation:
        'Values just under, on and just over the limit find off-by-one and unit (1000 vs 1024) mistakes, and the zero-byte file covers the lower edge. Values in the middle of the valid range rarely find bugs, huge files skip the boundary, and browser checks can be bypassed, so the server must be tested.',
      followUps: [
        {
          q: 'How would you send a 6 MB file if the browser picker blocks it?',
          a: 'Call the upload API directly (Postman or Playwright\'s request fixture), or remove the client restriction in DevTools. The server-side rule is the real control, so it must reject the file on its own.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-08',
      difficulty: 'medium',
      question: 'Which bug would a test of "rename malware.exe to cv.pdf and upload it" catch?',
      options: [
        'The server trusts the file extension instead of checking the real content type',
        'The upload progress bar is too slow',
        'The file name is shown with the wrong font',
        'The 5 MB size limit is off by one byte',
      ],
      correct: [0],
      explanation:
        'Renaming changes only the extension, so the test reveals whether validation inspects the actual content (magic bytes / MIME sniffing). It says nothing about progress speed, fonts or size boundaries, which need their own tests.',
      followUps: [
        {
          q: 'What severity would you give it on a job portal where recruiters download CVs?',
          a: 'High or critical: it is a path to delivering malware to recruiters\' machines. I would report it with evidence and involve the security team.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-09',
      difficulty: 'medium',
      question: 'Which of these checks exercises a risk that exists on phones but not in a desktop browser?',
      options: [
        'Kill the app while the order is "preparing", reopen it later and check the current status',
        'Verify the restaurant list shows names and ratings',
        'Verify the total price includes taxes',
        'Verify a wrong password shows an error',
      ],
      correct: [0],
      explanation:
        'App kill/resume is a mobile lifecycle risk that web-style functional tests miss. Listing, totals and login errors matter on every platform, so they are not mobile-specific.',
      followUps: [
        {
          q: 'Name two other mobile lifecycle interruptions.',
          a: 'An incoming call during payment and switching from Wi-Fi to mobile data (or entering airplane mode) mid-flow. Also notifications tapped while on another screen and battery-saver killing background work.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-10',
      difficulty: 'hard',
      question: 'Read the scenario. Which statement about the expected result is correct?',
      code: {
        language: 'text',
        code: `Checkout: shopper clicks "Pay 499" twice within 300 ms.
Gateway sandbox: both requests reach our payment service.
Our service sends an idempotency key = cart id + attempt number.
Attempt number increments on every click.`,
      },
      options: [
        'This design can create two charges, because each click gets a different idempotency key',
        'Two charges are impossible because the gateway always blocks duplicates',
        'Only one charge happens because the second click is always ignored by the browser',
        'The test is invalid because double-clicks cannot happen on real devices',
      ],
      correct: [0],
      explanation:
        'An idempotency key only protects against duplicates if the retry reuses the same key; incrementing it per click makes the requests look different, so two charges can be created. Gateways do not magically detect duplicates without a stable key, browsers do not reliably ignore a fast second click, and double-clicks are common on slow networks.',
      followUps: [
        {
          q: 'What should the key be based on instead?',
          a: 'Something stable for one logical payment, for example the order or checkout session id, generated once and reused for every retry. The UI should also disable the button after the first click as a second layer.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-11',
      difficulty: 'hard',
      question: 'Select ALL that apply. Which checks belong in a test plan for a new payment gateway integration?',
      options: [
        'Webhook signature verification and handling duplicate webhooks',
        'Refunds (full and partial) visible in both our DB and the gateway dashboard',
        'Testing with real customer cards in production to be sure',
        'Daily reconciliation of captured payments against orders',
        'Skipping declines because the gateway handles them',
      ],
      correct: [0, 1, 3],
      explanation:
        'Webhooks, refunds and reconciliation are where integration bugs hide, so they belong in the plan. Real customer cards in production are unsafe and unnecessary when a sandbox with test cards exists. Declines must be tested because our app must show the right message and not create an order.',
      followUps: [
        {
          q: 'Why do duplicate webhooks happen at all?',
          a: 'Gateways retry webhooks when they do not get a timely 2xx response, so the same event can arrive more than once. The handler must be idempotent, typically by storing processed event ids.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-12',
      difficulty: 'hard',
      question: 'An orders API returns the same order on page 1 and page 2. Which test design would most reliably reproduce it?',
      options: [
        'Seed several orders with identical created_at timestamps, then page through with a small page size',
        'Call page 1 one hundred times in a row',
        'Increase the page size to 100 so everything fits on one page',
        'Test only in the UI because APIs do not have pagination bugs',
      ],
      correct: [0],
      explanation:
        'Duplicate or missing rows across pages usually come from an unstable sort when the sort key ties; seeding ties with a small page size exposes it deterministically. Repeating page 1 does not cross a page boundary, a big page hides the bug instead of finding it, and the API is exactly where pagination logic lives.',
      followUps: [
        {
          q: 'What fix would you suggest in the bug report?',
          a: 'Add a unique tie-breaker to the ORDER BY (for example created_at DESC, id DESC) or move to cursor-based pagination. Suggestions are optional, but the evidence (seed data and the two responses) is essential.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL that apply. You have 15 minutes before a search release. Which belong in your first checks?',
      options: [
        'Exact search for a best-selling product returns it near the top',
        'A no-results term shows a friendly empty state, not an error',
        'Script-like input is displayed as text and not executed',
        'Measuring relevance for 500 different queries',
        'Testing on every browser version released in the last five years',
      ],
      correct: [0, 1, 2],
      explanation:
        'Core results, the empty state and safe handling of special input are fast, high-impact checks. Measuring relevance at scale and full browser sweeps are valuable but impossible in 15 minutes; mention them as accepted risk.',
      followUps: [
        {
          q: 'How would you report what you did not test?',
          a: 'In the release note: "Not tested: Safari, relevance beyond top results, performance under load." Naming gaps lets the decision-maker accept or reduce the risk consciously.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-14',
      difficulty: 'expert',
      question: 'Look at the requirement. Which test case exposes the ambiguity that most needs a product decision?',
      code: {
        language: 'text',
        code: `REQ-17  A discount of 10% applies to orders above 1,000.
        Maximum discount is 150.
        The discount is calculated before tax.`,
      },
      options: [
        'An order of exactly 1,000 (is "above" exclusive or inclusive?)',
        'An order of 5,000 (discount capped at 150)',
        'An order of 500 (no discount)',
        'An order of 1,200 (discount 120)',
      ],
      correct: [0],
      explanation:
        'At exactly 1,000 the words "above 1,000" could mean > or ≥, and developers and testers may assume differently, so it needs a PO decision. The other values have clear expected results from the text: 5,000 hits the cap, 500 gets nothing, 1,200 gets 120.',
      followUps: [
        {
          q: 'How would you record the answer?',
          a: 'Update the acceptance criteria (e.g. "orders of 1,000 or more") in the story, add the boundary case to the test set, and mention it in refinement so the developer codes the same rule.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL that apply. For POST /users, which negative tests change exactly one thing from a valid baseline body?',
      code: {
        language: 'json',
        code: `{ "email": "neha@test.io", "age": 30, "plan": "pro" }`,
      },
      options: [
        '{ "email": "neha@test.io", "age": 17, "plan": "pro" }',
        '{ "email": "neha@", "age": 17, "plan": "gold" }',
        '{ "age": 30, "plan": "pro" }',
        '{ "email": "neha@test.io", "age": 30, "plan": "pro", "role": "admin" }',
      ],
      correct: [0, 2, 3],
      explanation:
        'Age 17, a missing email, and an extra "role" field each alter a single thing, so a failure points to one rule. The second option changes three fields at once; if it returns 400 you do not know which validation fired, and a missing rule could be masked by another one.',
      followUps: [
        {
          q: 'Why is the "role": "admin" case worth adding?',
          a: 'It checks for mass assignment: if the API blindly saves extra fields, a user could grant themselves admin rights at sign-up. It is a cheap test for a serious security bug.',
        },
      ],
    },
    {
      id: 'qa-scenarios-mcq-16',
      difficulty: 'hard',
      question: 'Your "how would you test" answer ends with an automation note. Which note shows the best judgement?',
      options: [
        'Automate stable P1 flows and API rules; keep exploratory sessions for usability and new edge cases',
        'Automate every case so manual testing is no longer needed',
        'Automate nothing until the product is completely finished',
        'Automate only the UI, because API tests do not catch real bugs',
      ],
      correct: [0],
      explanation:
        'Good teams automate repeatable, high-value checks (often at the API level, where they are fast) and keep human exploration for what scripts cannot judge. "Automate everything" ignores maintenance cost and usability, "nothing until finished" wastes regression time, and API tests catch many real logic bugs faster than UI tests.',
      followUps: [
        {
          q: 'Which one coupon test would you keep at the UI level?',
          a: 'The happy path: apply a valid code and see the discount and total update, so the wiring between the screen and the API is covered once. All rule variations go to API tests.',
        },
      ],
    },
  ],
};

export default topic;
