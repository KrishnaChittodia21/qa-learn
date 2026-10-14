import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-test-design',
  phase: 'manual-advanced',
  order: 1,
  title: 'Test Design Techniques',
  subtitle:
    'Equivalence partitioning, 2-value and 3-value boundary value analysis, decision tables, state transitions, use cases, pairwise and experience-based techniques: how to pick a small set of tests that still finds bugs.',
  estimatedMinutes: 110,
  sources: [
    'ISTQB CTFL v4.0 syllabus — Ch 4 Test Analysis and Design (4.2 black-box, 4.4 experience-based)',
    'ISTQB white paper — Boundary Value Analysis According to the ISTQB Foundation Level Syllabus (Hamburg & Roman, 2025)',
    "Lee Copeland — A Practitioner's Guide to Software Test Design (Ch 3–8)",
    'Glenford Myers — The Art of Software Testing (Ch 4 Test-Case Design)',
    'Microsoft PICT — github.com/microsoft/pict (model file and constraint syntax)',
    'Guru99 — Boundary Value Analysis & Equivalence Partitioning; Decision Table Testing; State Transition Testing',
    'Software Testing Help / GeeksforGeeks — Black-box test design techniques, pairwise testing',
    'Toptal — QA interview questions (two-digit integer EP/BVA exercise)',
    'Playwright docs — Parameterize tests',
    'ISTQB CTFL v3.1 syllabus — 4.2.5 Use Case Testing',
    'NIST — Combinatorial testing research (Kuhn et al.): interaction-fault studies',
  ],
  tags: ['test-design', 'equivalence-partitioning', 'boundary-value-analysis', 'decision-table', 'state-transition', 'pairwise', 'use-case', 'error-guessing', 'istqb'],
  cheatSheet: [
    'EP: split inputs into groups the system treats the same; one value per partition is enough. Coverage = partitions exercised / partitions identified.',
    'Test invalid partitions one at a time: two invalid values in one test can mask each other (the first error message hides the second defect).',
    'BVA works only on ordered partitions. Boundary values = min and max of each partition. Age 18–60 → boundaries 17|18 and 60|61.',
    '2-value BVA (ISTQB v4.0): boundary + nearest neighbour in the adjacent partition → age 18–60 gives {17, 18, 60, 61}.',
    '3-value BVA: boundary + both neighbours → {16, 17, 18, 19, 59, 60, 61, 62}. It catches "x <= 10" coded as "x == 10"; 2-value cannot.',
    'Decision table: n binary conditions → 2^n rules; one test per (feasible) rule. Collapse rules whose actions are identical with a "–" (don\'t care) entry.',
    'State transition coverage: all states < valid transitions (0-switch) < all transitions (also tries invalid ones). Test one invalid transition per test.',
    'Use-case testing: one test per flow — main success, each alternative, each exception (e.g. card declined at checkout).',
    'Pairwise: every pair of parameter values appears at least once. 3 browsers × 2 OS × 3 payments × 2 users = 36 combos → ~9 pairwise tests (lower bound 3 × 3).',
    'Experience-based: error guessing (fault attacks: empty, null, 0, very long, special chars, double-click), checklist-based, exploratory. Complement, never replace, the formal techniques.',
    'In interviews, name the technique, show the values, and justify the count: "6 tests: 4 boundaries + 2 invalid types".',
  ],
  sections: [
    {
      heading: 'Why test design techniques exist',
      body: `**Intuition:** you cannot taste every grain of rice to check if it is cooked; you taste a spoonful from the middle and one from the edge of the pot. Test design techniques are the rules for choosing *which* spoonfuls.

Exhaustive testing is impossible (ISTQB principle 2). A single "age" field that accepts integers up to 999 already has 1,000 inputs; add a country dropdown with 200 values and you have 200,000 combinations. Techniques let you pick a **small, justified** set of tests and say *why* they are enough.

ISTQB CTFL v4.0 groups techniques into three families:

| Family | Based on | Techniques in this topic | Typical coverage measure |
|---|---|---|---|
| **Black-box** (specification-based) | Requirements, user stories, specs | Equivalence partitioning, BVA, decision tables, state transition | Partitions / boundaries / rules / transitions exercised |
| **White-box** (structure-based) | Code structure | Statement and branch coverage | % statements / branches executed |
| **Experience-based** | Tester knowledge and past defects | Error guessing, checklist-based, exploratory | Hard to measure; checklist items or charters covered |

Use-case testing and pairwise (combinatorial) testing are also black-box techniques; v4.0 moved use-case testing out of the core list, but interviewers still ask about it, so it is covered here.

**Every technique follows the same three steps:**
1. **Analyse**: identify the *coverage items* (partitions, boundary values, rules, transitions).
2. **Design**: write one or more test cases that exercise each coverage item.
3. **Measure**: coverage = items exercised ÷ items identified × 100%.

**In interviews, say this:** "I do not pick test values at random. I name the technique, list the coverage items, and can tell you the coverage percentage my tests reach."`,
      keyPoints: [
        'Techniques turn "infinite inputs" into a small, defensible set of tests.',
        'Black-box = from the spec; white-box = from the code; experience-based = from the tester.',
        'Every technique defines its own coverage items, so coverage can be measured.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.1 Test Techniques Overview',
    },
    {
      heading: 'Equivalence Partitioning (EP)',
      body: `**Intuition:** if a lift works for a person weighing 70 kg, it almost certainly works for 71 kg. People in the same "weight band" get the same treatment, so testing one of them stands for the whole band.

**Definition:** Equivalence partitioning splits the input (or output) domain into **partitions** whose members the system is expected to process the same way. If one value in a partition reveals a defect, the others probably would too, so **one value per partition** is enough.

- **Valid partitions** contain values the system should accept.
- **Invalid partitions** contain values it should reject. Think wider than numbers: wrong type, empty, too long, special characters.
- **Coverage** = partitions exercised ÷ partitions identified. 100% EP coverage means every partition has at least one test.

**Worked example: Registration age field.** Requirement: *"Age must be a whole number from 18 to 60 inclusive."*

| # | Partition | Type | Representative value | Expected |
|---|---|---|---|---|
| P1 | Integers < 18 | Invalid | 10 | "You must be at least 18" |
| P2 | Integers 18–60 | Valid | 35 | Accepted |
| P3 | Integers > 60 | Invalid | 75 | "Maximum age is 60" |
| P4 | Non-numeric text | Invalid | "abc" | "Enter a number" |
| P5 | Decimal | Invalid | 25.5 | "Enter a whole number" |
| P6 | Empty | Invalid | (blank) | "Age is required" |

Six tests give 100% EP coverage. Testing 20, 30, 40 and 50 adds nothing: they are all in P2.

**The single-fault rule:** combine *valid* values freely, but test **each invalid partition on its own**. If a test enters age "abc" *and* an empty email, the form might report only the first error, hiding a defect in the second check (defect masking).

**Common mistake:** forgetting **output** partitions. A tax calculator might have income partitions of 0–2.5 lakh (0%), 2.5–5 lakh (5%) and so on; each tax slab is a partition even though the input field is one number.`,
      code: [
        {
          language: 'text',
          title: 'EP test cases for a 6–15 character username',
          code: `Requirement: Username must be 6-15 characters, letters and digits only.

Partitions (length)            Partitions (characters)
  L1 length 0-5    invalid       C1 letters+digits only   valid
  L2 length 6-15   valid         C2 contains space        invalid
  L3 length >= 16  invalid       C3 contains symbol (@#)  invalid

TC-01  "qa"                 L1        -> "Username too short"
TC-02  "tester01"           L2 + C1   -> accepted (covers 2 valid partitions)
TC-03  "averyveryverylongname" L3     -> "Username too long"
TC-04  "qa tester"          C2        -> "No spaces allowed"
TC-05  "qa@tester"          C3        -> "Only letters and digits"

5 tests = 100% EP coverage (6 partitions; valid ones combined in TC-02,
invalid ones isolated so one error cannot hide another).`,
        },
      ],
      keyPoints: [
        'One value per partition; more values in the same partition add cost, not coverage.',
        'Combine valid partitions; isolate invalid partitions (one per test).',
        'Partition outputs and data types too, not just numeric ranges.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.2.1 Equivalence Partitioning',
    },
    {
      heading: 'Boundary Value Analysis (BVA): 2-value and 3-value',
      body: `**Intuition:** developers rarely get the middle of a range wrong; they type \`>\` when they meant \`>=\`. Bugs live at the edges, so BVA tests the edges.

**Definition (ISTQB v4.0):** BVA exercises the **boundary values** of *ordered* equivalence partitions, meaning the minimum and maximum of each partition. It finds boundaries that were moved up or down by one, or left out entirely.

The v4.0 syllabus defines two variants:

| Variant | Coverage items per boundary value | Age 18–60 (integers) | Catches |
|---|---|---|---|
| **2-value BVA** | The boundary + its closest neighbour in the **adjacent** partition | 17, 18, 60, 61 | Off-by-one shifts (\`> 18\` instead of \`>= 18\`) |
| **3-value BVA** | The boundary + **both** neighbours | 16, 17, 18, 19, 59, 60, 61, 62 | Also faulty operators such as \`== 18\` instead of \`>= 18\` |

**Why 3-value is stronger:** suppose the rule "x <= 10" is coded as "x == 10". 2-value BVA tests 10 (passes) and 11 (correctly rejected), so the bug survives. 3-value BVA also tests 9, which the broken code wrongly rejects. This is the example ISTQB itself uses.

**Careful: both sides of a border are boundary values.** At the 17|18 border, 17 is the maximum of the "too young" partition and 18 is the minimum of the valid one. In 3-value BVA each of them brings its two neighbours, so the border yields four items: 16, 17, 18, 19. Many blogs say "3-value = 17, 18, 19"; that is the older textbook version. Follow the syllabus in a certification exam.

**What about the outer edge of the domain?** The values above only cover the two borders of the valid range. If the domain itself has a lower limit (age can't be negative, so the \`too young\` partition is 0–17), then 0 is also a boundary value: 2-value BVA adds **0**, and 3-value adds **0 and 1** (−1 is outside the domain, so it is infeasible). The animation below assumes this domain, which is why it shows these extra values. Many test designers also add a negative or non-numeric input as a separate invalid partition.

**Worked example: password length 8–64.**
- Partitions: 0–7 (too short), 8–64 (valid), 65+ (too long).
- 2-value: {0, 7, 8, 64, 65}. Note 0 (empty) is an *outer* boundary with no neighbour below.
- 3-value: {0, 1, 6, 7, 8, 9, 63, 64, 65, 66}.

**In interviews, say this:** "EP gives me one value from the middle of each partition; BVA adds the edges, where off-by-one mistakes hide. I use 2-value by default and 3-value for risky rules like money or eligibility."`,
      diagram: `  Age field: valid 18..60 (integers)

   invalid (too young)  |      valid       |  invalid (too old)
  ... 15  16  17        | 18  19 ... 59  60 | 61  62  63 ...
              ^^          ^^           ^^    ^^
  2-value:    17          18           60    61
  3-value: 16 17          18 19     59 60    61 62`,
      code: [
        {
          language: 'text',
          title: 'BVA test cases for the age field (2-value)',
          code: `Requirement REG-04: Age must be a whole number from 18 to 60 inclusive.

TC-ID   Input  Partition        Expected result
BVA-01  17     too young (max)  Error "You must be at least 18"
BVA-02  18     valid (min)      Accepted, user moves to step 2
BVA-03  60     valid (max)      Accepted, user moves to step 2
BVA-04  61     too old (min)    Error "Maximum age is 60"

Add for 3-value coverage:
BVA-05  16     too young        Error "You must be at least 18"
BVA-06  19     valid            Accepted
BVA-07  59     valid            Accepted
BVA-08  62     too old          Error "Maximum age is 60"

Plus EP for non-boundary invalid types: "abc", 25.5, blank.`,
        },
      ],
      keyPoints: [
        'BVA needs ordered partitions (numbers, lengths, dates, sizes), not unordered ones like "colour".',
        '2-value: boundary + neighbour across the border. 3-value: boundary + neighbours on both sides.',
        'Each border between two partitions has two boundary values, so 3-value BVA gives four items per border.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.2.2 Boundary Value Analysis; ISTQB BVA white paper (2025)',
    },
    {
      heading: 'BVA beyond integers: decimals, dates, lengths and open ends',
      body: `**Intuition:** "plus one" depends on what you count. For whole rupees the neighbour of 500 is 501; for paise it is 500.01; for dates it is tomorrow.

The **step size** (precision) of the data decides the neighbour:

| Data | Rule | Boundaries (2-value) | Note |
|---|---|---|---|
| Price with 2 decimals | Free shipping for orders >= 499.00 | 498.99, 499.00 | The step is 0.01, not 1 |
| Date | Coupon valid until 31-Mar-2026 | 31-Mar-2026, 01-Apr-2026 | Also check timezone: "until" in IST or UTC? |
| String length | Comment 1–280 chars | 0, 1, 280, 281 | Count emoji and multi-byte characters too |
| File size | Upload max 5 MB | 5 MB, 5 MB + 1 byte | Is 5 MB = 5,000,000 or 5,242,880 bytes? Ask. |
| Quantity in cart | 1–10 per item | 0, 1, 10, 11 | Also try the "+" button at 10 |
| Time slot | Booking 09:00–17:59 | 08:59, 09:00, 17:59, 18:00 | Step = 1 minute |

**Open (unbounded) partitions:** "age 61 and above" has a minimum (61) but no maximum, so it has only one boundary value. You may still add a *practical* maximum (field length, integer overflow such as 2147483647) as an error-guessing test, but that is not BVA proper.

**Outer boundaries:** a length can't be -1, so 0 has no lower neighbour. Do not invent infeasible coverage items.

**Questions to ask before deriving values** (interviewers love this):
- Inclusive or exclusive? "Between 18 and 60" is ambiguous.
- What precision? Integer, 2 decimals, seconds?
- Is the boundary on the input, or on a calculated output (for example, a total after discount)?

**Common mistake:** applying BVA to an unordered set ("payment method = Card / UPI / COD"). There is no "next to UPI"; use EP or a decision table instead.`,
      keyPoints: [
        'The neighbour of a boundary is boundary ± one step of the data precision.',
        'Clarify inclusive/exclusive, units and precision before writing values.',
        'Open partitions have one boundary; outer boundaries have no neighbour beyond the domain.',
      ],
      source: "Lee Copeland — A Practitioner's Guide to Software Test Design, Ch 4 Boundary Value Testing",
    },
    {
      heading: 'Decision table testing',
      body: `**Intuition:** when the answer depends on several yes/no questions *together* ("member? big order? coupon?"), a table of every combination stops you missing the one combination nobody thought about.

**Definition:** a decision table lists **conditions** (inputs) in the top half and **actions** (outputs) in the bottom half. Each **column is a rule**: one combination of condition values and the actions it should trigger. With *n* binary conditions there are **2^n** rules. Coverage = rules exercised ÷ feasible rules.

**Worked example: discount rules for an online shop.**
- Members get 10% off.
- Orders of ₹2,000 or more get free shipping.
- A valid coupon gives 15% off and **replaces** the member discount (no stacking).

3 conditions → 2^3 = 8 rules:

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|---|---|---|---|---|---|---|---|---|
| **C1** Member? | Y | Y | Y | Y | N | N | N | N |
| **C2** Order >= ₹2,000? | Y | Y | N | N | Y | Y | N | N |
| **C3** Valid coupon? | Y | N | Y | N | Y | N | Y | N |
| **A1** Discount | 15% | 10% | 15% | 10% | 15% | 0% | 15% | 0% |
| **A2** Free shipping | Yes | Yes | No | No | Yes | Yes | No | No |

Each column becomes one test case, for example R1: *member logs in, adds ₹2,500 of items, applies SAVE15 → 15% off, shipping ₹0, no extra 10%*. R1 is exactly where a "stacking" bug (25% off) would hide.

**Why interviewers like it:** writing the table **finds requirement gaps before any code exists**. While filling R1 you have to ask "can coupon and member discount stack?" If the spec does not say, that is a question for the product owner, not a guess.

**Infeasible rules:** some combinations cannot happen (for example "age < 18" and "age > 60" both true). Mark them infeasible and exclude them from the coverage count.`,
      code: [
        {
          language: 'text',
          title: 'Turning rules into test cases (R1, R2, R6)',
          code: `TC-DT-R1  Member + >= 2000 + valid coupon
  Pre:  logged in as member "priya@test.in"; cart empty
  Steps: add items worth 2,500; apply coupon SAVE15; go to payment
  Exp:  discount 375.00 (15%), member 10% NOT applied, shipping 0.00,
        total 2,125.00

TC-DT-R2  Member + >= 2000 + no coupon
  Steps: add items worth 2,500; go to payment
  Exp:  discount 250.00 (10%), shipping 0.00, total 2,250.00

TC-DT-R6  Guest + >= 2000 + no coupon
  Steps: as guest add items worth 2,000.00 exactly; go to payment
  Exp:  no discount, shipping 0.00 (2,000 is inclusive -> also a
        boundary test for the free-shipping rule)`,
        },
      ],
      keyPoints: [
        'Conditions on top, actions below, one column per rule, one test per rule.',
        '2^n grows fast: 4 conditions = 16 rules, 6 conditions = 64. Collapse or split the table.',
        'Filling the table exposes missing or contradictory requirements early.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.2.3 Decision Table Testing',
    },
    {
      heading: 'Collapsing a decision table',
      body: `**Intuition:** if the answer is the same whether a light switch is up or down, you do not need to test both positions; write "doesn't matter" and test once.

**Collapsing (minimising)** merges rules that lead to the **same actions** and differ in only one condition. The condition that does not matter becomes a **"–" (don't care)** entry.

In the discount table, when a valid coupon is applied the discount is always 15%, whatever the membership. Shipping depends only on order value. So:

| | R1+R5 | R3+R7 | R2 | R4 | R6 | R8 |
|---|---|---|---|---|---|---|
| Member? | – | – | Y | Y | N | N |
| Order >= ₹2,000? | Y | N | Y | N | Y | N |
| Valid coupon? | Y | Y | N | N | N | N |
| Discount | 15% | 15% | 10% | 10% | 0% | 0% |
| Free shipping | Yes | No | Yes | No | Yes | No |

8 rules → 6 rules, so 6 tests.

**Rules for safe collapsing:**
1. Merge only columns whose **actions are identical**.
2. They must differ in **exactly one** condition; that one becomes "–".
3. Repeat until nothing more merges.

**The risk (say this in interviews):** collapsing assumes the "don't care" condition truly does not matter. If the code *does* check membership when a coupon is present (the stacking bug), a collapsed table may test only the non-member side and miss it. For high-risk logic like money, keep the full table, or at least pick the "–" value that is most likely to expose the bug (here: **member = Y**, because that is where stacking could happen).

**Extended-entry tables:** conditions can have more than two values (customer tier = Gold / Silver / None). Then the rule count is the product of the value counts (3 × 2 × 2 = 12).`,
      keyPoints: [
        'Collapse only rules with identical actions that differ in exactly one condition.',
        '"–" means the condition should not affect the outcome; it is an assumption about the code.',
        'For risky rules, test the "–" value most likely to break the assumption.',
      ],
      source: "ISTQB CTFL v4.0 syllabus — 4.2.3; Lee Copeland — A Practitioner's Guide to Software Test Design, Ch 5 Decision Table Testing",
    },
    {
      heading: 'State transition testing',
      body: `**Intuition:** a traffic light does not care only about the button you press; it cares about what colour it shows *now*. When the same input gives different results depending on history, model the system as **states** and **transitions**.

**Vocabulary:**
- **State**: a condition the system is in (Waiting for PIN, Card blocked).
- **Event**: something that happens (PIN entered).
- **Guard**: a condition on the event ([PIN correct]).
- **Action**: what the system does on the transition (eject card).

**Worked example: ATM PIN entry.** Insert card, three attempts at the PIN, card retained after the third wrong PIN, cancel ejects the card.

| From state | Event [guard] | Action | To state |
|---|---|---|---|
| S0 Idle | Insert card | Ask for PIN | S1 Attempt 1 |
| S1 Attempt 1 | PIN [correct] | Show menu | S4 Access granted |
| S1 Attempt 1 | PIN [wrong] | "2 tries left" | S2 Attempt 2 |
| S2 Attempt 2 | PIN [correct] | Show menu | S4 |
| S2 Attempt 2 | PIN [wrong] | "1 try left" | S3 Attempt 3 |
| S3 Attempt 3 | PIN [correct] | Show menu | S4 |
| S3 Attempt 3 | PIN [wrong] | Retain card | S5 Card retained |
| S1, S2, S3 | Cancel | Eject card | S0 (3 transitions) |
| S4 Access granted | Finish | Eject card | S0 |

That is 6 states and 11 valid transitions.

**Coverage levels (weakest to strongest, ISTQB v4.0):**

| Criterion | Coverage items | Minimum for the ATM |
|---|---|---|
| **All states** | Every state visited | 2 tests (one path to S5, one to S4) |
| **Valid transitions (0-switch)** | Every valid transition fired | 11 transitions, fitted into a few test paths |
| **All transitions** | Valid transitions + every *invalid* one attempted | Also try e.g. "enter PIN" in S0 or S5 |

Full valid-transition coverage guarantees all-states coverage, and all-transitions guarantees both. Test **one invalid transition per test** so a failure points to one cause.

**Bugs this finds:** the counter not resetting after a correct PIN (a later wrong attempt goes straight to "1 try left"); cancel at attempt 3 not resetting attempts for the next session; card retained after the *second* wrong PIN (an off-by-one in the counter).`,
      diagram: `  [S0 Idle] -insert-> [S1 Try 1] -wrong-> [S2 Try 2] -wrong-> [S3 Try 3]
     ^   ^                |                   |                |      |
     |   |             correct             correct         correct  wrong
     |   |                v                   v                v      v
     |   +--finish-- [S4 Access granted] <----------- (any try) [S5 Retained]
     |
     +---- cancel from S1, S2 or S3: eject card`,
      keyPoints: [
        'Use it when behaviour depends on history: logins, carts, orders, workflows, wizards.',
        'Coverage ladder: all states < valid transitions (0-switch) < all transitions.',
        'Write the state table first; the diagram is for people, the table is for coverage.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.2.4 State Transition Testing',
    },
    {
      heading: 'Use-case testing: main, alternative and exception flows',
      body: `**Intuition:** a use case is a story of a user getting something done. You test the happy story once, then every way the story can branch or go wrong.

A use case has an **actor**, **preconditions**, a **main success scenario** (basic flow), **alternative flows** (different route, still success) and **exception flows** (failure handled gracefully). Use-case testing writes **at least one test per flow**. It finds integration and workflow bugs that field-level techniques like BVA miss.

**Worked example: SauceDemo checkout** (\`https://www.saucedemo.com\`).

| Flow | Path | Expected |
|---|---|---|
| **Main** | Login as standard_user → add backpack → cart → Checkout → first/last name + postal code → Continue → Finish | "Thank you for your order!", cart badge cleared |
| **Alt 1** | Remove an item from the cart before checkout | Totals recalculate; checkout still succeeds |
| **Alt 2** | Click "Continue Shopping" from the cart, add another item | Cart keeps both items |
| **Exc 1** | Leave First Name empty on step one | "Error: First Name is required"; stays on step one |
| **Exc 2** | Leave Postal Code empty | "Error: Postal Code is required" |
| **Exc 3** | Login as locked_out_user | "Epic sadface: Sorry, this user has been locked out." |
| **Exc 4** | Click Cancel on the overview page | Back to inventory; cart unchanged |

**Combining techniques:** inside the main flow, apply BVA to quantity or postal code length, and a decision table to the discount step. Use cases give the *journey*; the other techniques give the *values* at each step.

**Gherkin is a natural format** for use-case tests and becomes the bridge to automation later.`,
      code: [
        {
          language: 'gherkin',
          title: 'Checkout use case as Gherkin scenarios',
          code: `Feature: Checkout on SauceDemo

  Background:
    Given I am logged in as "standard_user"
    And my cart contains "Sauce Labs Backpack"

  Scenario: Main flow - successful order
    When I check out with first name "Asha", last name "Rao" and postal code "560001"
    And I finish the order
    Then I see "Thank you for your order!"
    And the cart badge is not shown

  Scenario Outline: Exception flow - required field missing
    When I check out with first name "<first>", last name "<last>" and postal code "<zip>"
    Then I see the error "<error>"
    And I stay on the "Checkout: Your Information" page

    Examples:
      | first | last | zip    | error                          |
      |       | Rao  | 560001 | Error: First Name is required  |
      | Asha  |      | 560001 | Error: Last Name is required   |
      | Asha  | Rao  |        | Error: Postal Code is required |`,
        },
      ],
      keyPoints: [
        'One test per flow: main, each alternative, each exception.',
        'Use cases test journeys and integration; combine with BVA/EP for the values inside them.',
        'Scenario Outline tables are a clean way to express exception flows.',
      ],
      source: "ISTQB CTFL v3.1 syllabus — 4.2.5 Use Case Testing; Lee Copeland — A Practitioner's Guide to Software Test Design, Ch 9",
    },
    {
      heading: 'Pairwise and combinatorial testing',
      body: `**Intuition:** most configuration bugs are caused by one setting, or by two settings clashing ("UPI fails only on Safari"). Very few need three specific settings at once. So instead of every combination, make sure **every pair** of values meets at least once.

**The maths:** a checkout must work across Browser (Chrome, Firefox, Safari) × OS (Windows, macOS) × Payment (Card, UPI, COD) × User (Guest, Registered).
- **Exhaustive:** 3 × 2 × 3 × 2 = **36** tests.
- **Pairwise:** at least 3 × 3 = 9 (the two largest parameters must meet in every pair), and a tool usually finds a set of about **9–10**.

Studies such as the NIST work on combinatorial testing found most field failures are triggered by one or two interacting factors, which is why pairwise gives good value. It is not a guarantee: a bug that needs three specific values can be missed. Increase the order (3-wise) for risky areas.

**Tools:** Microsoft **PICT** (free, command line), AllPairs, and pairwise features in test management tools. PICT also handles **constraints**, for example Safari exists only on macOS, so impossible combinations are never generated.

**Orthogonal arrays** are the older, more mathematical cousin: balanced tables where each pair appears the same number of times. Pairwise tools are the practical choice today.

**Where it fits:** configuration matrices (browser/OS/device), feature flags, form fields with many independent dropdowns, API query parameter combinations. **Where it does not:** dependent business rules; use a decision table, because every rule there matters, not just pairs.`,
      code: [
        {
          language: 'text',
          title: 'PICT model file (checkout.txt) with a constraint',
          code: `# Parameters: one per line, values comma-separated
Browser:  Chrome, Firefox, Safari
OS:       Windows, macOS
Payment:  Card, UPI, COD
User:     Guest, Registered

# Constraints end with a semicolon
IF [Browser] = "Safari" THEN [OS] = "macOS";
IF [User] = "Guest" THEN [Payment] <> "COD";

# Run:   pict checkout.txt          (pairwise, the default order 2)
#        pict checkout.txt /o:3     (all 3-way combinations)
# Output: a tab-separated table, one row per test case.
# 36 exhaustive combos -> about 9-10 rows that still cover
# every allowed pair of values at least once.`,
        },
      ],
      keyPoints: [
        'Pairwise: every pair of values appears in at least one test.',
        'Lower bound = product of the two largest parameter sizes.',
        'Use constraints for impossible combinations; raise to 3-wise for high-risk areas.',
      ],
      source: 'Microsoft PICT documentation (github.com/microsoft/pict); Software Testing Help — Pairwise Testing',
    },
    {
      heading: 'Experience-based techniques: error guessing and checklists',
      body: `**Intuition:** an experienced mechanic listens to an engine and checks the part that *usually* breaks. Error guessing is that instinct, written down.

**Error guessing** anticipates mistakes developers commonly make and the failures they cause. ISTQB v4.0 describes a methodical version called a **fault attack**: keep a list of likely errors, defects and failures, then design tests that attack each one.

**A starter fault-attack list for any form or API:**

| Attack | Example on SauceDemo / a booking API |
|---|---|
| Empty, whitespace-only, null | Postal code "   " passes as filled? |
| Very long input | 5,000-character first name |
| Special characters, Unicode, emoji | O'Brien, José, 名前, 😀 |
| Leading zeros, negative, zero | Quantity 0, -1, 007 |
| Double submit / double click | Click Finish twice → two orders? |
| Back button / refresh mid-flow | Refresh on the checkout overview page |
| Session expiry | Leave the cart open 30 min, then checkout |
| Concurrent edits | Same booking updated in two tabs |
| Injection strings | \`' OR 1=1 --\`, \`<script>\` in a name field |

**Checklist-based testing** uses a list of conditions to verify, built from experience, standards or past defects ("every form: tab order, required-field markers, error text near the field, labels read by a screen reader"). Checklists keep a team consistent; review them so they do not go stale.

**Exploratory testing** is the third experience-based technique (covered in its own topic).

**Interview angle:** experience-based techniques **complement** formal ones. Formal techniques give measurable coverage of the spec; error guessing covers what the spec forgot. Say both, and give a concrete past defect as an example.`,
      keyPoints: [
        'Error guessing becomes systematic as a fault attack with a written list.',
        'Checklists encode team experience; keep them short and current.',
        'Experience-based testing fills gaps the specification never mentioned.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.4.1 Error Guessing, 4.4.3 Checklist-Based Testing',
    },
    {
      heading: 'Choosing a technique, and carrying it into automation',
      body: `**Intuition:** each technique is a different lens. Pick the lens that matches the shape of the requirement.

| Requirement looks like… | Use | Coverage items |
|---|---|---|
| A range or a length ("1–10", "8–64 chars") | EP + BVA | Partitions + boundary values |
| A list of categories ("Gold/Silver/None") | EP | Partitions |
| Several conditions combining ("if member AND coupon…") | Decision table | Rules |
| Behaviour depending on history ("after 3 attempts…") | State transition | States / transitions |
| An end-to-end user journey | Use-case testing | Flows |
| Many independent settings | Pairwise | Value pairs |
| "What usually breaks here?" | Error guessing, checklists | Attacks / checklist items |

A real feature uses several. A login page has EP/BVA on password length, a state machine for lockout, and error guessing for SQL injection.

**From technique to Playwright:** the tables you design manually become **data** in a parameterised test. One test body, many rows, so adding a boundary is one line, and the test title tells you which partition failed. Playwright's docs recommend a plain \`for...of\` loop that declares one \`test()\` per row.`,
      code: [
        {
          language: 'typescript',
          title: 'BVA + EP table as a data-driven Playwright test',
          code: `import { test, expect } from '@playwright/test';

// Each row is one coverage item from the EP/BVA analysis of REG-04 (age 18-60).
const ageCases = [
  { input: '17', valid: false, why: 'BVA below min' },
  { input: '18', valid: true, why: 'BVA min' },
  { input: '60', valid: true, why: 'BVA max' },
  { input: '61', valid: false, why: 'BVA above max' },
  { input: 'abc', valid: false, why: 'EP non-numeric' },
  { input: '', valid: false, why: 'EP empty' },
];

for (const { input, valid, why } of ageCases) {
  // The title names the technique, so a failure report says what broke.
  test(\`age "\${input}" -> \${valid ? 'accepted' : 'rejected'} (\${why})\`, async ({ page }) => {
    await page.goto('/register'); // baseURL comes from playwright.config.ts
    await page.getByLabel('Age').fill(input);
    await page.getByRole('button', { name: 'Next' }).click();

    if (valid) {
      await expect(page.getByRole('heading', { name: 'Step 2' })).toBeVisible();
    } else {
      await expect(page.getByRole('alert')).toBeVisible();
    }
  });
}`,
        },
      ],
      keyPoints: [
        'Match the technique to the shape of the requirement; combine several per feature.',
        'Designed tables map directly to data rows in a parameterised automated test.',
        'Name each automated case after its coverage item so failures are self-explaining.',
      ],
      source: 'Playwright docs — Parameterize tests; ISTQB CTFL v4.0 — 4.1 Test Techniques Overview',
    },
  ],
  codeChallenges: [
    {
      id: 'mt-test-design-cc-1',
      title: 'Random values → EP + BVA test set for a quantity field',
      context:
        'A junior tester wrote these cases for the cart quantity field. Requirement CART-07: "Quantity must be a whole number from 1 to 10. Above 10, show: Max 10 per order."',
      task: 'Rewrite the test set so every value is justified by EP or 2-value BVA, invalid partitions are isolated, every case has a precondition and an exact expected result, and the coverage is stated.',
      starter: {
        language: 'text',
        title: 'Weak test cases',
        code: `TC1  Enter 2              -> works
TC2  Enter 5              -> works
TC3  Enter 7              -> works
TC4  Enter 20 and abc     -> error
TC5  Enter big number     -> should not work
TC6  Check quantity field -> ok`,
      },
      hints: [
        'List the partitions first: below range, in range, above range, and the non-numeric types. TC1–TC3 are all in the same partition.',
        'For 1–10 integers, 2-value BVA gives four values. Which ones?',
        'TC4 mixes two invalid partitions. What happens if the first error hides the second?',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite',
        code: `Requirement: CART-07 quantity 1-10 (integers)
Precondition (all): logged in as standard_user, product "Backpack"
                    open, quantity field shows 1

Partitions: P1 <1 (invalid)  P2 1-10 (valid)  P3 >10 (invalid)
            P4 non-numeric   P5 decimal       P6 empty
Boundaries (2-value): 0 | 1 ... 10 | 11

ID      Input  Covers     Expected result
QTY-01  0      P1, BVA    "Minimum quantity is 1"; Add disabled
QTY-02  1      P2, BVA    Added; cart badge shows 1
QTY-03  5      P2, EP     Added; cart badge shows 5
QTY-04  10     P2, BVA    Added; cart badge shows 10
QTY-05  11     P3, BVA    "Max 10 per order"; not added
QTY-06  abc    P4         "Enter a whole number"; not added
QTY-07  2.5    P5         "Enter a whole number"; not added
QTY-08  blank  P6         "Quantity is required"; not added

Coverage: EP 6/6 partitions, 2-value BVA 4/4 boundary values.
Extra (error guessing): -1, 007, paste "1e3", press "+" at 10.`,
      },
      explanation: `**What changed and why:**

- **Removed redundancy:** 2, 5 and 7 were all in the same valid partition. One middle value (5) is kept; the slots go to boundaries.
- **Added the boundaries** 0, 1, 10, 11, where off-by-one bugs actually hide. The old set never touched an edge.
- **Isolated invalid partitions:** "20 and abc" became separate cases, so one error message cannot mask another defect.
- **Exact expected results** (message text, cart badge, button state) instead of "works" or "error". A test with a vague expected result cannot fail.
- **Shared precondition and requirement ID** make the set repeatable and traceable.
- **Coverage stated** (EP 6/6, BVA 4/4), so a reviewer can see the set is complete.
- Error-guessing extras are labelled as such, separate from the formal coverage.`,
      followUps: [
        {
          q: 'What would 3-value BVA add to this set?',
          a: 'Each boundary value brings both neighbours. At the 0|1 border that is -1, 0, 1, 2; at the 10|11 border it is 9, 10, 11, 12. Compared with the 2-value set, the new items are -1, 2, 9 and 12. They catch faulty operators, for example a check written as "quantity == 10" instead of "<= 10", which 9 would expose.',
        },
        {
          q: 'The field is a dropdown with only 1–10 available. Do the invalid cases still matter?',
          a: 'Through the UI, mostly no: you cannot pick 11. But the server must still validate, because the request can be changed in DevTools or sent straight to the API. I would move the invalid cases to API tests (POST /cart with quantity 11, 0, "abc") and keep only the valid boundaries in the UI test.',
        },
      ],
    },
    {
      id: 'mt-test-design-cc-2',
      title: 'Ad-hoc login-lockout checks → a state transition test design',
      context:
        'Requirement AUTH-12: "After 3 consecutive wrong passwords the account is locked for 15 minutes. A correct password resets the counter. Locked accounts show: Account locked, try again later." A teammate submitted the checks below.',
      task: 'Replace the checks with a state table and a set of test cases that reaches 100% valid-transition coverage plus at least two invalid or tricky transitions. Each test case needs steps and expected results.',
      starter: {
        language: 'text',
        title: 'Weak checks',
        code: `1. Enter wrong password 3 times -> account locked
2. Enter correct password -> login works
3. Check lock message
4. Wait and try again`,
      },
      hints: [
        'Name the states: how many wrong attempts have been made so far, plus Locked and Logged in.',
        'The counter reset is a transition too: wrong, then correct, then wrong again. What should the counter be?',
        'Invalid or tricky transitions: a correct password while Locked; a login attempt at minute 14:59 and at 15:00.',
      ],
      solution: {
        language: 'text',
        title: 'Strong rewrite',
        code: `States: S0 no failures | S1 1 failure | S2 2 failures | L Locked
        | IN Logged in
Valid transitions:
  T1 S0 -wrong->   S1      T5 S1 -correct-> IN (counter reset)
  T2 S1 -wrong->   S2      T6 S2 -correct-> IN (counter reset)
  T3 S2 -wrong->   L       T7 L  -15 min->  S0
  T4 S0 -correct-> IN

ST-01 (T1,T2,T3) wrong x3 -> 3rd attempt shows "Account locked,
      try again later"; Log in button still visible
ST-02 (T4) correct password -> inventory page shown
ST-03 (T1,T5) wrong, correct -> logged in; log out; wrong x2 ->
      NOT locked (proves reset), 3rd wrong -> locked
ST-04 (T1,T2,T6) wrong x2, correct -> logged in; counter reset
ST-05 (T7) lock account; at 14:59 correct pwd -> still locked;
      at 15:00 correct pwd -> logged in (time boundary)
Invalid/tricky:
ST-06 Locked + correct password -> still "Account locked"
ST-07 Locked + password reset email -> clarify with PO (gap!)

Coverage: 7/7 valid transitions, 5/5 states, 2 invalid attempts.`,
      },
      explanation: `**Why the rewrite is stronger:**

- **Explicit states and transitions** make coverage measurable (7/7), instead of four loose checks with no notion of completeness.
- **Counter reset (ST-03, ST-04)** is the bug-rich area the weak set skipped: many implementations count total failures, not *consecutive* ones.
- **Invalid transition ST-06** checks that the correct password does *not* bypass the lock, which is a security defect if broken.
- **Time is a boundary too:** ST-05 applies BVA to the 15-minute unlock (14:59 vs 15:00). "Wait and try again" tested nothing specific.
- **ST-07 surfaced a requirement gap** (does a password reset unlock the account?), which is a valuable output of test design in itself.
- Each case has concrete steps and an exact expected message.`,
      followUps: [
        {
          q: 'How would you test the 15-minute wait without actually waiting 15 minutes?',
          a: 'Ask the developers for a test hook: a configurable lock duration in the test environment (for example 15 seconds), an admin API to move the lock expiry, or a database update to the locked_until timestamp. In Playwright I would use page.clock to control browser time only if the lock is checked in the browser; a server-side lock needs a server-side hook.',
        },
        {
          q: 'Does locking reveal whether a username exists?',
          a: 'It can. If a non-existent username never shows "Account locked" but a real one does, an attacker can enumerate accounts. I would add a test: three wrong passwords for an unknown username, then compare the messages and response times. The safe behaviour is an identical generic response in both cases.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'mt-test-design-iq-01',
      difficulty: 'easy',
      question: 'An age field on a signup form accepts 18 to 60. Which values would you test, and why those?',
      whatInterviewerLooksFor: [
        'Names EP and BVA, not just lists numbers',
        'Gives exact boundary values (17, 18, 60, 61) plus one mid value',
        'Covers non-numeric, decimal, empty and negative inputs as separate partitions',
        'Asks a clarifying question (inclusive? integer only?)',
      ],
      modelAnswer: `I would combine **equivalence partitioning** and **boundary value analysis**.

**1. Clarify first:** is 18–60 inclusive, and are only whole numbers allowed? I will assume inclusive integers.

**2. Partitions (EP):**
- Below 18: invalid
- 18–60: valid
- Above 60: invalid
- Non-numeric ("abc"), decimal (25.5), empty, negative (-5): each its own invalid partition

**3. Boundaries (2-value BVA):** 17 and 18 at the lower edge, 60 and 61 at the upper edge. Off-by-one mistakes such as \`> 18\` instead of \`>= 18\` live exactly there.

**4. Final set (about 9 tests):**

| Value | Why | Expected |
|---|---|---|
| 17 | below min | rejected with message |
| 18 | min | accepted |
| 35 | valid partition | accepted |
| 60 | max | accepted |
| 61 | above max | rejected |
| abc | non-numeric | rejected |
| 25.5 | decimal | rejected |
| blank | required | rejected |
| -5 | negative | rejected |

**5. Rules I follow:** one invalid value per test, so one error message cannot hide another bug, and an exact expected message for each case. If the rule were risky (for example legal eligibility), I would move to **3-value BVA** and add 16, 19, 59 and 62.

I would also check that the **server** enforces the range, since client-side validation can be bypassed by calling the API directly.`,
      followUps: [
        {
          q: 'Why not also test 20, 30, 40 and 50?',
          a: 'They are all in the same valid partition as 35, so the system should treat them identically. Each extra value costs execution and maintenance time without adding coverage. I would rather spend that effort on boundaries or on invalid types, where defects are more likely.',
        },
        {
          q: 'The requirement says "between 18 and 60". Does that change anything?',
          a: '"Between" is ambiguous: it may or may not include 18 and 60. I would ask the product owner and get the answer written into the acceptance criteria. The boundary values I test depend on it: inclusive means 18 is valid, exclusive means 18 is the invalid boundary and 19 the first valid one.',
        },
        {
          q: 'How would this change if the field were a date of birth instead of an age?',
          a: 'The boundary moves to calendar dates relative to today: someone turning 18 today, 18 tomorrow, and turning 61 today. I would also test leap-day birthdays (29 Feb), the timezone used for "today", and invalid dates such as 31/04. It becomes BVA on dates, plus EP on date formats.',
        },
      ],
      pitfalls: [
        'Listing values with no technique or justification ("I will test 1, 50, 100").',
        'Testing only valid values, or combining several invalid inputs in one test.',
        'Saying "test 17, 18, 19" without explaining which variant of BVA it is.',
        'Ignoring server-side validation.',
      ],
    },
    {
      id: 'mt-test-design-iq-02',
      difficulty: 'hard',
      question: 'What is the difference between 2-value and 3-value boundary value analysis, and when is the extra cost of 3-value worth it?',
      whatInterviewerLooksFor: [
        'Accurate ISTQB v4.0 definitions with concrete values',
        'Knows that both sides of a border are boundary values',
        'Can name a defect that only 3-value catches',
        'Risk-based reasoning for when to use it',
      ],
      modelAnswer: `**Definitions (ISTQB CTFL v4.0):**
- **2-value BVA:** for each boundary value, test the value and its closest neighbour in the **adjacent** partition.
- **3-value BVA:** for each boundary value, test the value and **both** of its neighbours.

**Example: password length 8–64.** Partitions are 0–7, 8–64 and 65+.
- 2-value: {0, 7, 8, 64, 65}. Five items, and 0 is an outer boundary with no lower neighbour.
- 3-value: {0, 1, 6, 7, 8, 9, 63, 64, 65, 66}. Ten items.

Note that 7 *and* 8 are both boundary values (the max of one partition and the min of the next), so 3-value gives **four** items per internal border, not three.

**What 3-value catches that 2-value misses:** a faulty relational operator. If "length <= 64" were coded as "length == 64", the 2-value tests 64 (passes) and 65 (rejected, as expected) both pass, so the bug survives. The 3-value test at 63 is wrongly rejected, which exposes it. 2-value is enough for the classic off-by-one where the boundary moved by one position.

**When it is worth it:**
- Money, eligibility, legal or safety thresholds (loan limits, age for alcohol or medicine dosage).
- Boundaries computed by code (totals after discount, date differences), where operator mistakes are more likely.
- When automation makes extra rows nearly free: in a data-driven Playwright or API test, three more rows cost almost nothing.

For low-risk UI fields under time pressure, 2-value plus EP is a sensible default. I state which variant I used in the test design, so coverage is clear.`,
      followUps: [
        {
          q: 'Many blogs say 3-value BVA for 1–10 is 0, 1, 2 and 9, 10, 11. Is that wrong?',
          a: 'It is an older, simplified convention that looks only at the valid partition\'s edges. Under ISTQB v4.0, 0 is also a boundary value (the max of the invalid partition below), so its neighbour -1 is included too, giving -1, 0, 1, 2 and 9, 10, 11, 12. For a certification exam follow the syllabus; at work, what matters is stating which convention you used.',
        },
        {
          q: 'Can you apply BVA to a dropdown of countries?',
          a: 'No. BVA requires ordered partitions, and a country list has no meaningful "next value". I would use equivalence partitioning instead, grouping countries by the behaviour they trigger (tax rules, currency, shipping zone) and testing one country per group, plus error guessing for unusual names.',
        },
      ],
      pitfalls: [
        'Claiming 3-value BVA is simply "three values per border".',
        'Not being able to name any defect type that 3-value finds and 2-value misses.',
        'Recommending 3-value everywhere without considering cost and risk.',
      ],
    },
    {
      id: 'mt-test-design-iq-03',
      difficulty: 'medium',
      question: 'A product owner gives you this rule: "Free delivery for Prime members, or for anyone ordering ₹499 or more, except for bulky items." How do you design the tests?',
      whatInterviewerLooksFor: [
        'Recognises combined conditions and reaches for a decision table',
        'Computes the number of rules correctly (2^3 = 8)',
        'Spots ambiguity in the requirement and asks about it',
        'Adds BVA on the ₹499 threshold',
      ],
      modelAnswer: `Several conditions combine to decide one outcome, so this is a **decision table** problem.

**Conditions:** C1 Prime member? C2 Order >= ₹499? C3 Bulky item in cart? **Action:** free delivery yes/no.

Three binary conditions → **2^3 = 8 rules**:

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|---|---|---|---|---|---|---|---|---|
| Prime | Y | Y | Y | Y | N | N | N | N |
| >= ₹499 | Y | Y | N | N | Y | Y | N | N |
| Bulky | Y | N | Y | N | Y | N | Y | N |
| Free delivery | No | Yes | No | Yes | No | Yes | No | No |

**Ambiguity I would raise before testing:** does "except for bulky items" apply to Prime members too? I read it as applying to everyone, but R1 and R3 depend on that answer. Also: does one bulky item cancel free delivery for the whole cart, or only for that item? Writing the table forced these questions, which is half the value of the technique.

**Collapsing:** whenever Bulky = Y the answer is No, so R1, R3, R5 and R7 collapse into a single "Bulky = Y, others –" rule. That gives 5 rules. Because "except" clauses are exactly where bugs hide, I would keep at least two bulky rules (Prime + bulky, and ₹499 + bulky).

**Add BVA on the threshold** for non-Prime, non-bulky orders: ₹498.99 (paid delivery) and ₹499.00 (free). Also check whether ₹499 is measured before or after discounts.

**Result:** about 7–9 test cases, each traceable to a rule, plus questions for the product owner.`,
      followUps: [
        {
          q: 'The PO adds a fourth condition: "first order is always free". What happens to your table?',
          a: 'The table doubles to 2^4 = 16 rules. I would check for collapsing first: if "first order" overrides everything, all 8 first-order rules become one rule with three don\'t-care entries, giving about 9 rules. I would confirm that override with the PO, since "always" may or may not beat the bulky exception.',
        },
        {
          q: 'How would you automate this decision table?',
          a: 'As a data-driven test: each rule becomes a row with the inputs (user type, cart value, bulky flag) and the expected delivery fee. Setup is faster through the API (create the user and cart), and the UI only checks the fee shown. If the rule is computed by a pricing API, most rows belong in API tests, with one or two UI tests.',
        },
      ],
      pitfalls: [
        'Writing a few happy-path cases without enumerating combinations.',
        'Getting the rule count wrong, or collapsing without explaining the risk.',
        'Silently assuming how the "except" clause works instead of asking.',
      ],
    },
    {
      id: 'mt-test-design-iq-04',
      difficulty: 'hard',
      question: 'Design tests for an ATM that retains the card after three wrong PIN attempts. Which technique and which coverage level would you aim for?',
      whatInterviewerLooksFor: [
        'Chooses state transition testing and explains why (behaviour depends on history)',
        'Lists states and transitions explicitly',
        'Knows the coverage ladder and picks a level based on risk',
        'Includes invalid transitions and counter-reset cases',
      ],
      modelAnswer: `The same event, "enter PIN", has different results depending on how many attempts were made before, so I would use **state transition testing**.

**States:** S0 Idle, S1 Attempt 1, S2 Attempt 2, S3 Attempt 3, S4 Access granted, S5 Card retained.

**Valid transitions (11):** insert card (S0→S1); correct PIN from S1, S2 and S3 (→S4); wrong PIN S1→S2, S2→S3, S3→S5; cancel from S1, S2 and S3 (→S0, eject card); finish from S4 (→S0).

**Coverage level:** this is a banking, security-relevant feature, so I would aim for **all transitions**: every valid transition, plus attempts at invalid ones. All-states coverage alone needs only two tests (wrong ×3, and correct first time) and would miss most bugs.

**Key test cases:**
1. Wrong, wrong, wrong → card retained; message shown; transaction logged.
2. Correct on the first try → menu.
3. Wrong, correct → menu (S2→S4).
4. Wrong, wrong, correct → menu (S3→S4): the attempt-3 edge.
5. Wrong, cancel → card ejected; insert again → counter is back at attempt 1 *if* the bank resets per session. Clarify: some banks count failures per card per day.
6. Cancel at attempt 3 → ejected, not retained.
7. Invalid: in S5, press keys or enter PIN → ignored, card not returned.
8. Invalid: in S0, enter digits without a card → nothing happens.

**Extra risk-based checks:** timeout at the PIN prompt, power loss at attempt 3, and whether the counter is stored on the card/host (so another ATM sees two prior failures).

Each invalid transition gets its own test, so a failure points to one cause.`,
      followUps: [
        {
          q: 'What is 1-switch coverage and when would you use it?',
          a: 'It covers every valid sequence of two consecutive transitions, for example "wrong then correct" or "wrong then cancel". It catches bugs that depend on the previous transition, such as a counter that resets wrongly after a cancel. It is an advanced-level criterion (ISTQB Advanced Test Analyst); I would use it for safety- or money-critical state machines.',
        },
        {
          q: 'How would you test this if you cannot use a real ATM?',
          a: 'Test the logic at the service layer: call the PIN-verification API with a test card, observing the attempt counter and card status in responses or in the database. Use a simulator for the hardware actions (eject, retain). Keep a small number of end-to-end tests on a lab ATM for the physical behaviour.',
        },
      ],
      pitfalls: [
        'Listing a few happy and unhappy cases with no states or coverage measure.',
        'Forgetting the counter reset after a successful or cancelled attempt.',
        'Never attempting invalid transitions.',
      ],
    },
    {
      id: 'mt-test-design-iq-05',
      difficulty: 'hard',
      question: 'You must test checkout on 4 browsers, 3 operating systems, 3 payment methods and 2 user types, with only one day. How do you choose the combinations?',
      whatInterviewerLooksFor: [
        'Calculates the exhaustive count (72) and shows why it is not feasible',
        'Proposes pairwise testing with a tool such as PICT',
        'Handles impossible combinations via constraints',
        'Adds risk-based extras and knows the limits of pairwise',
      ],
      modelAnswer: `**1. Size the problem.** 4 × 3 × 3 × 2 = **72** combinations. At roughly 15 minutes per checkout run that is 18 hours, more than the day I have.

**2. Remove impossible combinations.** Safari runs only on macOS; maybe Edge is only supported on Windows. These become **constraints**, not tests.

**3. Use pairwise (all-pairs) testing.** Most configuration defects come from a single factor or from two factors interacting ("UPI fails on Firefox"). Pairwise guarantees every *pair* of values appears in at least one test. The lower bound is 4 × 3 = 12 (the two largest parameters), and PICT typically produces about **12–14** tests.

PICT model:
- Browser: Chrome, Firefox, Safari, Edge
- OS: Windows, macOS, Android
- Payment: Card, UPI, COD
- User: Guest, Registered
- Constraint: IF [Browser] = "Safari" THEN [OS] = "macOS";

**4. Add risk-based rows.** Pairwise does not know the business. I would add:
- The top traffic combination from analytics (for example Chrome + Android + UPI + Registered), even if already covered.
- Any combination linked to a past production defect.

**5. Split the work.** Payment logic is browser-independent, so its deep testing happens once (API level). Browser/OS rows only check that the UI flow works end-to-end. A cloud grid (BrowserStack, LambdaTest) or Playwright projects can run the rows in parallel.

**Limits I would state:** pairwise can miss a bug that needs three specific values together. For the highest-risk area (payment × browser × OS) I could raise that slice to 3-wise.`,
      followUps: [
        {
          q: 'Why is the minimum number of pairwise tests 12 here?',
          a: 'Browser has 4 values and OS has 3, so there are 12 distinct Browser–OS pairs. Each test row contains exactly one Browser–OS pair, so you need at least 12 rows to include them all. The other parameters fit into those same rows. Constraints may change the count slightly, because some pairs become impossible.',
        },
        {
          q: 'When would pairwise be the wrong technique?',
          a: 'When the parameters are dependent business rules rather than independent settings. For example, a discount that depends on membership, cart value and coupon together: every combination has a specific expected result, so a decision table is correct. Pairwise assumes interactions above two factors are rare, which is false for business logic.',
        },
      ],
      pitfalls: [
        'Testing only Chrome on Windows and calling it done.',
        'Claiming pairwise "covers all bugs".',
        'Picking combinations by gut feel with no coverage argument.',
      ],
    },
    {
      id: 'mt-test-design-iq-06',
      difficulty: 'medium',
      question: 'What is error guessing? Some people say it is unscientific. How do you make it useful on a real project?',
      whatInterviewerLooksFor: [
        'Defines error guessing correctly (experience-based)',
        'Knows the fault attack idea from ISTQB v4.0',
        'Gives concrete attacks, ideally from a real past defect',
        'Positions it as a complement to formal techniques',
      ],
      modelAnswer: `**Error guessing** is an experience-based technique: I anticipate the mistakes developers are likely to make, and the failures those mistakes cause, then design tests aimed at them. It draws on how the application worked before, the kinds of mistakes this team makes, and failures seen in similar products.

**Making it systematic: fault attacks.** The ISTQB v4.0 syllabus describes a methodical approach: keep a **written list** of likely errors, defects and failures, then design a test for each one. My list for forms and APIs includes:
- Empty, whitespace-only and null input
- Very long input, Unicode, emoji, apostrophes (O'Brien)
- 0, negative numbers, leading zeros
- Double-clicking a submit button, browser back and refresh mid-flow
- Session expiry during a multi-step flow
- Two tabs editing the same record
- Injection strings in text fields

**Feeding the list:** every production bug and every escaped defect from a retrospective gets added. That way the list becomes the team's memory.

**Example:** on an e-commerce project, a double click on "Place order" created two orders, because the button was not disabled while the request was in flight. Since then "double submit" has been on every checklist I use, and it has found the same bug in two other forms.

**Positioning:** it is not a replacement for EP, BVA or decision tables. Those give measurable coverage of the specification; error guessing covers what the specification never mentioned. I run the formal tests first, then spend a fixed time-box on attacks. I record the attack list in the test plan, so the work is reviewable and not invisible "random testing".`,
      followUps: [
        {
          q: 'How is error guessing different from exploratory testing?',
          a: 'Error guessing designs specific tests from a list of anticipated mistakes; it can be prepared in advance and repeated. Exploratory testing designs, executes and learns at the same time, guided by a charter, with the next test shaped by what the last one revealed. Fault-attack ideas are often used inside exploratory sessions, but they are separate techniques in ISTQB.',
        },
        {
          q: 'How do you measure coverage for error guessing?',
          a: 'There is no formal coverage measure as with partitions or transitions, but you can track which attacks from the list were applied to which features. A simple matrix of features against attacks shows gaps, for example "session expiry not tried on checkout". That turns intuition into something a lead can review.',
        },
      ],
      pitfalls: [
        'Describing it as "random testing" with no structure.',
        'Claiming it can replace formal techniques.',
        'Giving no concrete examples of attacks.',
      ],
    },
    {
      id: 'mt-test-design-iq-07',
      difficulty: 'expert',
      question: 'You designed 40 test cases using EP, BVA and a decision table. How do you turn them into Playwright tests without 40 copy-pasted test bodies, and which ones should not be UI tests at all?',
      whatInterviewerLooksFor: [
        'Data-driven/parameterised tests with one row per coverage item',
        'Pushes most rule permutations down to the API layer',
        'Descriptive test titles that name the coverage item',
        'Thinks about data setup, maintenance and execution time',
      ],
      modelAnswer: `**1. Keep the design as data.** Each EP partition, boundary value or decision-table rule becomes a **row**: input values, expected outcome, and a label such as "BVA max" or "rule R3". The design table and the code then stay in sync, and adding a boundary is one line.

**2. One test body, many rows.** Playwright's recommended pattern is a \`for...of\` loop over the rows that declares one \`test()\` per row, with the row label in the title. A failure then reads "quantity 11 -> rejected (BVA above max)" and needs no investigation to understand. Each row is a separate test, so they run in parallel and retry individually.

**3. Push permutations down the pyramid.** Most of those 40 cases check **business rules**, not the UI. The discount table's 8 rules are best checked against the pricing API with the \`request\` fixture: milliseconds each, no browser, no flaky rendering. The UI keeps:
- one or two representative rules end-to-end (does the discount *display* correctly?),
- client-side validation boundaries (is the error message shown next to the field?).

A typical split for 40 cases: about 30 API or component-level checks, 6–8 UI tests.

**4. Fast, independent setup.** Create users, carts and coupons through the API in a fixture, not by clicking through the UI, so each row is independent and can run in any order.

**5. Keep traceability.** Tag tests with the requirement ID (\`@REG-04\`) and the technique in the title, so the report maps back to the manual design and the RTM.

**What I would not automate:** one-off error-guessing explorations and visual judgement calls. Those stay manual or exploratory.`,
      followUps: [
        {
          q: 'Should the data live in the test file or in a JSON/CSV file?',
          a: 'For small, stable tables (under about 15 rows), an array in the test file is easiest to read and review alongside the test. For large tables or ones maintained by non-coders, a JSON or CSV file imported at the top works better. Either way, keep the expected result next to the input in the same row.',
        },
        {
          q: 'Your 3-value BVA rows all fail at once after a release. What do you check first?',
          a: 'When every boundary row fails together, the cause is usually shared rather than a boundary bug: the error message text changed, the locator for the alert changed, or setup data failed. I would open one trace, compare the actual message with the expected one, and only then look at the business rule.',
        },
      ],
      pitfalls: [
        'Copy-pasting one test per value.',
        'Running every decision-table rule through the browser.',
        'Generic titles such as "test 1", "test 2" that hide which coverage item failed.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'mt-test-design-drill-1',
      question:
        'Derive EP partitions, 2-value BVA and 3-value BVA values for: "Comment length must be 10–500 characters; the field is required."',
      assumptions: [
        'Length is counted in characters; 10 and 500 are both valid (inclusive).',
        'An empty field (length 0) is the required-field error, not just "too short".',
        'Use the ISTQB v4.0 definitions of 2-value and 3-value BVA.',
      ],
      steps: [
        { label: 'Domain', calc: 'Lengths 0, 1, 2, 3, … (no negatives)' },
        { label: 'Partitions', calc: 'P0 = {0} empty (invalid) | P1 = 1–9 too short (invalid) | P2 = 10–500 valid | P3 = 501+ too long (invalid)' },
        { label: 'Boundary values', calc: 'P0: 0 | P1: 1 and 9 | P2: 10 and 500 | P3: 501 (open-ended, only a minimum)' },
        { label: '2-value BVA items', calc: '{0, 1, 9, 10, 500, 501} → 6 tests' },
        { label: '3-value BVA items', calc: 'Neighbours of each boundary: 0→{0,1}; 1→{0,1,2}; 9→{8,9,10}; 10→{9,10,11}; 500→{499,500,501}; 501→{500,501,502}. Union = {0,1,2,8,9,10,11,499,500,501,502} → 11 tests' },
        { label: 'EP extras', calc: 'One mid-value from P2, e.g. 200 characters; whitespace-only (10 spaces) as an error-guessing case' },
      ],
      answer: `**EP:** 4 partitions: empty (0), too short (1–9), valid (10–500), too long (501+). One value each, for example 0, 5, 200, 600.

**2-value BVA:** 0, 1, 9, 10, 500, 501 (6 values).

**3-value BVA:** 0, 1, 2, 8, 9, 10, 11, 499, 500, 501, 502 (11 values).

Expected results: 0 → "Comment is required"; 1–9 → "Minimum 10 characters"; 10–500 → posted; 501+ → "Maximum 500 characters" (or typing blocked at 500, so check both the counter and a paste of 501 characters).`,
      insight:
        'Because "empty" is its own partition (required), the lower range has two partitions with their own boundaries. Treating the field as just "<10 / 10–500 / >500" would miss the 0|1 boundary, where "required" and "too short" messages are often confused.',
      followUps: [
        {
          q: 'The field has maxlength="500" in HTML, so you cannot type 501 characters. Is the 501 test pointless?',
          a: 'Not pointless, just moved. In the UI, test that typing stops at 500 and that pasting 600 characters truncates or warns. Then send 501 characters directly to the API to prove the server enforces the rule, because maxlength is a browser hint that any client can bypass.',
        },
      ],
    },
    {
      id: 'mt-test-design-drill-2',
      question:
        'Fill the decision table for a loan pre-approval: "Approve if salary >= ₹30,000 AND credit score >= 700. If only one is met, send to manual review. If neither is met, reject. Existing customers with an active loan are always sent to manual review." Then collapse it.',
      assumptions: [
        'Conditions: C1 salary >= 30k, C2 score >= 700, C3 existing active loan. All Y/N.',
        'Actions: Approve, Manual review, Reject (exactly one per rule).',
        'The active-loan rule overrides the others.',
      ],
      steps: [
        { label: 'Count rules', calc: '3 binary conditions → 2^3 = 8 rules' },
        { label: 'C3 = Y (rules 1–4)', calc: 'Active loan overrides → Manual review for (Y,Y), (Y,N), (N,Y), (N,N) of salary/score' },
        { label: 'C3 = N, both met', calc: 'Salary Y, Score Y → Approve' },
        { label: 'C3 = N, one met', calc: '(Y,N) → Manual review; (N,Y) → Manual review' },
        { label: 'C3 = N, none met', calc: '(N,N) → Reject' },
        { label: 'Collapse', calc: 'Rules 1–4 have identical actions and differ only in C1/C2 → one rule: C3=Y, C1=–, C2=– → Manual review. Rules 6 and 7 differ in two conditions (Y,N vs N,Y) → cannot merge under the "differ in exactly one" rule.' },
        { label: 'Result', calc: '8 rules → 5 rules → 5 test cases' },
      ],
      answer: `| | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| Active loan | Y | N | N | N | N |
| Salary >= 30k | – | Y | Y | N | N |
| Score >= 700 | – | Y | N | Y | N |
| **Action** | Review | **Approve** | Review | Review | **Reject** |

5 test cases. Add BVA on both thresholds: salary 29,999 / 30,000 and score 699 / 700.`,
      insight:
        'The override condition collapses half the table, but that is also where a bug would hide (an active-loan customer with great numbers being auto-approved). For that collapsed rule, pick the "don\'t care" values that are most tempting for the code: salary Y and score Y.',
      followUps: [
        {
          q: 'How many tests would you run if the bank required full, uncollapsed coverage?',
          a: 'Eight, one per rule. Adding the threshold boundaries (salary 29,999/30,000, score 699/700) adds around four more, since some rows can carry boundary values at the same time. For example the "both met" rule can use exactly 30,000 and 700, which proves the inclusive boundaries and the rule in one test.',
        },
      ],
    },
    {
      id: 'mt-test-design-drill-3',
      question:
        'An order moves through states: Placed → Paid → Shipped → Delivered. From Placed or Paid it can be Cancelled. From Delivered it can be Returned. Count the states and valid transitions, then design the minimum tests for all-states and for valid-transition (0-switch) coverage.',
      assumptions: [
        'Each test starts from a new order in Placed.',
        'Cancelled and Returned are final states.',
        'A test is one path through the machine; it cannot jump between branches.',
      ],
      steps: [
        { label: 'States', calc: 'Placed, Paid, Shipped, Delivered, Cancelled, Returned → 6 states' },
        { label: 'Valid transitions', calc: 'Placed→Paid, Paid→Shipped, Shipped→Delivered, Placed→Cancelled, Paid→Cancelled, Delivered→Returned → 6 transitions' },
        { label: 'All states (min)', calc: 'Path A: Placed→Paid→Shipped→Delivered→Returned (5 states). Cancelled not reached → Path B: Placed→Cancelled. → 2 tests' },
        { label: 'Valid transitions (min)', calc: 'Path A covers 4 transitions. Missing: Placed→Cancelled, Paid→Cancelled. Each ends in a final state → 2 more paths: Placed→Cancelled; Placed→Paid→Cancelled → 3 tests' },
        { label: 'Invalid transitions to try', calc: 'Shipped→Cancelled, Delivered→Paid, Cancelled→Shipped, Placed→Delivered (one per test)' },
      ],
      answer: `**6 states, 6 valid transitions.**

- **All-states coverage:** 2 tests: (1) Placed → Paid → Shipped → Delivered → Returned; (2) Placed → Cancelled.
- **Valid-transition coverage:** 3 tests: (1) the full path to Returned; (2) Placed → Cancelled; (3) Placed → Paid → Cancelled.
- **All-transitions coverage** adds one test per invalid attempt, e.g. try to cancel a Shipped order (expected: blocked with a clear message), and try to return a Placed order.`,
      insight:
        'All-states coverage needed only 2 tests but missed the Paid → Cancelled transition, the one that triggers a refund and is most likely to have bugs. That is why valid-transition coverage is the usual minimum in practice.',
      followUps: [
        {
          q: 'Which invalid transition would you prioritise, and why?',
          a: 'Shipped → Cancelled. Customers try it often, and if the system allows it, it may refund money for goods already handed to the courier. It has a direct financial impact, so it gets tested first, along with checking the API rejects it as well as the UI hiding the Cancel button.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'mt-test-design-mcq-01',
      difficulty: 'easy',
      question: 'A discount field accepts whole numbers from 5 to 50 inclusive. Using 2-value BVA, which set of values should you test?',
      options: ['4, 5, 50, 51', '5, 6, 49, 50', '5, 27, 50', '0, 5, 50, 100'],
      correct: [0],
      explanation:
        '2-value BVA takes each boundary value and its closest neighbour in the adjacent partition: 4|5 at the lower edge and 50|51 at the upper edge. "5, 6, 49, 50" stays inside the valid partition and never tests rejection. "5, 27, 50" mixes EP and boundaries but misses the invalid side. 0 and 100 are arbitrary, not neighbours of any boundary.',
      followUps: [
        {
          q: 'What would 3-value BVA add?',
          a: 'Both neighbours of every boundary value: 3 and 6 around the 4|5 border, 49 and 52 around the 50|51 border. The full set becomes 3, 4, 5, 6, 49, 50, 51, 52, which catches faulty operators that 2-value misses.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-02',
      difficulty: 'easy',
      question: 'A tester checks the age values 20, 30, 40 and 50 for a field that accepts 18–60. What is the main problem with this test set?',
      options: [
        'All four values are in the same valid partition, so they add no extra coverage',
        'It uses too few values; at least ten mid-range values are needed',
        'The values should be chosen randomly to avoid tester bias',
        'Values divisible by ten are not allowed in boundary testing',
      ],
      correct: [0],
      explanation:
        'Equivalence partitioning says values in the same partition should behave the same, so four values from 18–60 give the same coverage as one. More mid-range values do not help; boundaries and invalid partitions are missing. Random selection does not fix the missing edges, and there is no rule against round numbers.',
      followUps: [
        {
          q: 'What minimal set would you replace it with?',
          a: 'One valid mid value (35), the boundaries 17, 18, 60, 61, and one value per invalid type: "abc", 25.5 and empty. That gives about 8 tests with full EP and 2-value BVA coverage.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-03',
      difficulty: 'easy',
      question: 'Which technique fits best when the system response depends on what happened earlier, such as an account locking after repeated failed logins?',
      options: ['State transition testing', 'Equivalence partitioning', 'Pairwise testing', 'Boundary value analysis'],
      correct: [0],
      explanation:
        'When the same input (a wrong password) produces different results depending on history, you model states and transitions. EP and BVA look at a single input value in isolation and cannot represent "the third failure". Pairwise is for combinations of independent settings, not sequences of events.',
      followUps: [
        {
          q: 'Which coverage level would you aim for on a login lockout?',
          a: 'At least valid-transition (0-switch) coverage, plus key invalid transitions such as entering the correct password while locked. All-states coverage alone could be reached with two tests and would miss the counter-reset logic.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-04',
      difficulty: 'medium',
      question: 'Read the requirement. Using 3-value BVA as defined in ISTQB CTFL v4.0, which values cover the LOWER border of the valid range?',
      code: {
        language: 'text',
        title: 'Requirement PWD-02',
        code: `Password length:
  0-7 characters    -> "Password too short"
  8-64 characters   -> accepted
  65+ characters    -> "Password too long"`,
      },
      options: ['6, 7, 8, 9', '7, 8, 9', '7, 8', '8, 9, 10'],
      correct: [0],
      explanation:
        'Both 7 (max of the "too short" partition) and 8 (min of the valid partition) are boundary values. 3-value BVA tests each boundary value and both its neighbours: 7 → 6, 7, 8 and 8 → 7, 8, 9, whose union is 6, 7, 8, 9. "7, 8, 9" is the older simplified convention, which forgets that 7 is itself a boundary. "7, 8" is 2-value BVA.',
      followUps: [
        {
          q: 'How many 3-value coverage items does the whole requirement have?',
          a: 'Lower outer boundary 0 gives 0 and 1 (no -1). Border 7|8 gives 6, 7, 8, 9. Border 64|65 gives 63, 64, 65, 66. The union is 10 items: 0, 1, 6, 7, 8, 9, 63, 64, 65, 66.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-05',
      difficulty: 'medium',
      question: 'The rule "x <= 10" was implemented as "x == 10". Which test value would expose the defect?',
      options: ['9', '10', '11', '100'],
      correct: [0],
      explanation:
        'With the bug, only exactly 10 is accepted. x = 9 should be accepted but is now rejected, revealing the fault. x = 10 passes in both versions, and 11 and 100 are rejected in both, so 2-value BVA (10 and 11) cannot see this bug. This is ISTQB\'s own argument for 3-value BVA.',
      followUps: [
        {
          q: 'Which BVA variant produces the value 9 here?',
          a: '3-value BVA. For boundary value 10 it tests 9, 10 and 11. 2-value BVA tests only 10 and its neighbour across the border, 11, and both behave correctly under the bug.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-06',
      difficulty: 'medium',
      question: 'A form has a required email field and an age field (18–60). A tester runs one test with email left empty AND age = 5, and sees only "Email is required". What is the risk of this test design?',
      options: [
        'The first error may mask a defect in the age validation, which was never actually observed',
        'Nothing; both invalid partitions are covered by one test, which is efficient',
        'The test should also include an invalid password to be complete',
        'Empty email is a valid partition, so the test is mislabelled',
      ],
      correct: [0],
      explanation:
        'When two invalid values are combined, the system may stop at the first error. The age check could be completely broken and this test would still pass. Invalid partitions should be tested one per test (the single-fault rule). Adding a third invalid value makes masking worse, not better.',
      followUps: [
        {
          q: 'Is it ever fine to combine values in one test?',
          a: 'Yes, for valid partitions. Combining a valid email, valid age and valid name in one test is efficient, because a passing result shows all of them are accepted. Only invalid values need isolating.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-07',
      difficulty: 'medium',
      question: 'How many rules does a full (uncollapsed) decision table need for these conditions?',
      code: {
        language: 'text',
        title: 'Insurance quote conditions',
        code: `C1 Driver age under 25?          Y / N
C2 Any claims in last 3 years?   Y / N
C3 Car type                      Hatchback / Sedan / SUV
C4 Annual mileage over 15,000 km? Y / N`,
      },
      options: ['24', '16', '12', '8'],
      correct: [0],
      explanation:
        'Rules = product of the number of values per condition: 2 × 2 × 3 × 2 = 24. 16 assumes every condition is binary (2^4), ignoring the three car types. 12 forgets one binary condition. 8 is 2^3 and drops the car type entirely.',
      followUps: [
        {
          q: 'How would you reduce 24 tests if time is short?',
          a: 'First collapse rules with identical outcomes using don\'t-care entries. If the premium depends on each factor independently rather than on specific combinations, I would confirm that with the business and then consider pairwise to cover all pairs in about 6 tests, while keeping the full table for the riskiest combinations.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL statements that are correct about equivalence partitioning.',
      options: [
        'One value per partition is enough to cover that partition',
        'Partitions can be defined for outputs, not only inputs',
        'Only numeric ranges can be partitioned',
        'Invalid partitions should be tested one at a time',
        'EP requires the partitions to be ordered',
      ],
      correct: [0, 1, 3],
      explanation:
        'EP assumes all members of a partition behave the same, so one value covers it; partitions can be defined on outputs (tax slabs) as well as inputs; invalid partitions are isolated to avoid masking. Non-numeric data (file types, user roles, countries) can be partitioned too. Ordering is a requirement of BVA, not of EP.',
      followUps: [
        {
          q: 'Give an example of a non-numeric partition.',
          a: 'File upload types: allowed (PDF, JPG, PNG) as one valid partition, disallowed (EXE, ZIP) as an invalid one, and a renamed file (virus.exe renamed to virus.pdf) as another invalid partition, because the content does not match the extension.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-09',
      difficulty: 'medium',
      question: 'Free shipping applies to orders of ₹499.00 or more. Prices have two decimal places. Which pair is the correct 2-value BVA for this threshold?',
      options: ['₹498.99 and ₹499.00', '₹498 and ₹499', '₹499.00 and ₹500.00', '₹499.00 and ₹499.01'],
      correct: [0],
      explanation:
        'The neighbour depends on the precision of the data. With paise, the value just below ₹499.00 is ₹498.99. ₹498 vs ₹499 uses a step of one rupee and misses a bug such as "> 498.5". ₹499.00 and ₹499.01 are both in the valid partition, so neither tests rejection. ₹500 is not adjacent to the boundary.',
      followUps: [
        {
          q: 'What else should you clarify about this threshold?',
          a: 'Whether ₹499 is measured before or after discounts and taxes, and whether it includes items that are already free. A coupon can move a ₹520 cart below the threshold, and that interaction is a common bug.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL pairs of rules that can be merged into one rule with a "–" (don\'t care) entry.',
      code: {
        language: 'text',
        title: 'Decision table (Card valid? / Sufficient balance? / OTP correct?)',
        code: `               R1   R2   R3   R4   R5   R6
Card valid      Y    Y    Y    Y    N    N
Balance OK      Y    Y    N    N    Y    N
OTP correct     Y    N    Y    N    -    -
---------------------------------------------
Action        Pay  Fail Fail Fail Rej  Rej`,
      },
      options: ['R5 and R6', 'R3 and R4', 'R1 and R2', 'R2 and R4'],
      correct: [0, 1, 3],
      explanation:
        'Merging needs identical actions and a difference in exactly one condition. R5/R6 (both Reject, differ only in balance) merge into "card N → Reject". R3/R4 (both Fail, differ only in OTP) merge into "card Y, balance N, OTP –". R2/R4 (both Fail, differ only in balance) also qualify on their own, though you would choose either R3/R4 or R2/R4, not both, since R4 can only be merged once. R1 and R2 have different actions (Pay vs Fail), so they cannot merge.',
      followUps: [
        {
          q: 'After collapsing, which "don\'t care" value would you choose for the "card N" test?',
          a: 'Balance OK and OTP correct, because that is the case where a bug ignoring card validity would let a payment through. Picking the most tempting value for the faulty code makes the collapsed test as strong as possible.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-11',
      difficulty: 'hard',
      question: 'An ATM has 6 states and 11 valid transitions. A tester runs two tests: (1) wrong PIN three times → card retained; (2) correct PIN first time → menu → finish. What coverage has been achieved?',
      options: [
        '100% all-states coverage, but not 100% valid-transition coverage',
        '100% valid-transition coverage',
        '100% all-transitions coverage',
        'Neither all-states nor valid-transition coverage is complete',
      ],
      correct: [0],
      explanation:
        'Test 1 visits Idle, Attempt 1, 2, 3 and Retained; test 2 visits Access granted. All 6 states are visited. But transitions such as "correct PIN at attempt 2" and "cancel at attempt 1" were never fired, so valid-transition coverage is incomplete. All-transitions also needs invalid attempts, which were not tried.',
      followUps: [
        {
          q: 'Which missing transition is the most important to add?',
          a: 'Correct PIN at attempt 3 (S3 → S4). It sits on the edge of the lockout rule: an off-by-one in the counter would retain the card even though the third PIN was correct, which is a serious customer-facing defect.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-12',
      difficulty: 'hard',
      question: 'A test matrix has Browser (Chrome, Firefox, Safari, Edge), Language (EN, HI, TA) and Theme (Light, Dark). What is the smallest possible number of pairwise tests?',
      options: ['12', '24', '9', '6'],
      correct: [0],
      explanation:
        'Every Browser–Language pair (4 × 3 = 12) must appear, and each test row holds exactly one such pair, so at least 12 rows are needed. Theme values can be spread across those rows. 24 is the exhaustive count (4 × 3 × 2). 9 and 6 are below the lower bound set by the two largest parameters.',
      followUps: [
        {
          q: 'When would you not trust pairwise for this matrix?',
          a: 'If there is evidence that a bug needs three factors together, for example right-to-left or Indic script rendering failing only in Dark theme on Safari. Then I would add that triple explicitly or run 3-wise on the risky slice.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL situations where boundary value analysis can be applied directly.',
      options: [
        'Upload size limit of 5 MB',
        'Booking slots between 09:00 and 18:00',
        'Payment method: Card, UPI or COD',
        'Coupon valid until 31 March',
        'User role: Admin, Editor or Viewer',
      ],
      correct: [0, 1, 3],
      explanation:
        'BVA needs ordered partitions. File size, time of day and dates are ordered, so they have meaningful neighbours (5 MB + 1 byte, 08:59, 1 April). Payment methods and user roles are unordered categories: there is no "value next to UPI". Use equivalence partitioning or a decision table for those.',
      followUps: [
        {
          q: 'What question would you ask about the 5 MB limit?',
          a: 'Is 5 MB 5,000,000 bytes or 5,242,880 (5 MiB)? The boundary test file must be exactly at the limit and one byte over, so the definition matters. I would also ask whether the limit is checked in the browser, on the server, or both.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-14',
      difficulty: 'expert',
      question: 'Select ALL test cases needed (alongside a normal valid login) to reach 100% valid-transition coverage of this lockout model.',
      code: {
        language: 'text',
        title: 'Lockout state table',
        code: `S0 (0 fails) --wrong-->   S1 (1 fail)
S1          --wrong-->   S2 (2 fails)
S2          --wrong-->   LOCKED
S0          --correct--> IN
S1          --correct--> IN   (counter reset)
S2          --correct--> IN   (counter reset)
LOCKED      --30 min-->  S0`,
      },
      options: [
        'wrong, wrong, wrong; then wait 30 minutes and log in',
        'wrong, correct',
        'wrong, wrong, correct',
        'correct while LOCKED',
        'correct, correct',
      ],
      correct: [0, 1, 2],
      explanation:
        'The valid login covers S0 → IN. "wrong ×3 then wait" fires S0→S1, S1→S2, S2→LOCKED and LOCKED→S0. "wrong, correct" fires S1→IN, and "wrong, wrong, correct" fires S2→IN. That covers all 7 valid transitions. "Correct while LOCKED" is an invalid transition, which matters for all-transitions coverage, not valid-transition coverage. "Correct, correct" repeats S0→IN.',
      followUps: [
        {
          q: 'Why is "correct while LOCKED" still worth running?',
          a: 'It is the most security-relevant invalid transition: if it succeeds, the lockout is useless against someone who guesses the password on the fourth try. It belongs in the all-transitions set and should be a separate test, so a failure points at one cause.',
        },
      ],
    },
    {
      id: 'mt-test-design-mcq-15',
      difficulty: 'expert',
      question: 'Your team has one sprint to test a new pricing engine with 5 interacting business rules, plus a UI that must work on 4 browsers and 3 screen sizes. Which test design plan is strongest?',
      options: [
        'Decision table for the pricing rules (mostly via API tests), pairwise for browser × screen size, BVA on price thresholds',
        'Pairwise for everything, because it gives the fewest tests across rules, browsers and screens',
        'Exhaustive UI testing of every rule on every browser and screen size to be safe',
        'Error guessing only, because formal techniques are too slow for one sprint',
      ],
      correct: [0],
      explanation:
        'Interacting business rules need a decision table, since every combination has a specific expected price, and API tests make those cheap. Independent environment factors suit pairwise. Thresholds need BVA. Pairwise on dependent rules would skip combinations that matter; exhaustive UI testing multiplies rules × browsers × screens unnecessarily; error guessing alone gives no measurable coverage.',
      followUps: [
        {
          q: 'Where would error guessing still fit in this plan?',
          a: 'As a time-boxed session after the formal tests: rounding at .005, negative prices from stacked discounts, currency switching mid-session, and very large quantities. These are the cases specifications usually forget.',
        },
      ],
    },
  ],
};

export default topic;
