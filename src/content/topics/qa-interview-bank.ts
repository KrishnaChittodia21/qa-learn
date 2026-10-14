import type { Topic } from '../../types';

const topic: Topic = {
  id: 'qa-interview-bank',
  phase: 'interview',
  order: 2,
  title: 'Rapid-Fire Interview Bank: Manual, API, SQL, JavaScript & Playwright',
  subtitle:
    'The questions that keep coming up in 2025–2026 QA and SDET-1 loops, asked from fresh angles: one short refresher per concept cluster, then a big bank of interview questions, practice drills and timed MCQs that mix manual testing, HTTP, SQL, JavaScript, Playwright and CI.',
  estimatedMinutes: 110,
  sources: [
    'Glassdoor interview reports for Infosys QA / test engineer roles (2024–2026) as surfaced in search: manual vs automation, smoke vs sanity, defect life cycle, severity vs priority, API POST vs PATCH, handling dynamic web elements',
    'DEV Community (Shrinithi): "Playwright interview prep: the questions that actually matter in 2025" (flaky tests asked in nearly every interview, storage state, TypeScript basics, PUT vs PATCH)',
    'Testleaf blog: Top Playwright interview questions (2025/2026 editions) and Cognizant (CTS) interview guide',
    'Lemon.io: QA automation interview questions (auto-waiting, stable locators)',
    'Software Testing Help: Top SDET interview questions (updated 2025)',
    'Coursera: QA interview questions and how to answer them',
    'Playwright docs: Locators, Auto-waiting, Assertions (default expect timeout 5 s), Authentication (storageState, setup projects), Test retries, Trace viewer, Mocks (page.route)',
    'MDN Web Docs: HTTP request methods (safe, idempotent), HTTP response status codes (401 vs 403), Array.prototype.sort, Equality comparisons',
    'javascript.info: Event loop (microtasks and macrotasks), var vs let in loops',
    'SQLBolt and PostgreSQL docs: aggregate functions and NULL, GROUP BY / HAVING',
    'ISTQB CTFL v4.0 syllabus: confirmation testing vs regression testing, test levels',
  ],
  tags: ['interview', 'question-bank', 'rapid-fire', 'manual', 'api', 'sql', 'javascript', 'playwright', 'ci', 'revision'],
  cheatSheet: [
    'Smoke = "is the build alive?" (broad, shallow, new build). Sanity = "does this fix/area work?" (narrow, after a small change). Retest = re-run the failed case. Regression = check nothing else broke.',
    'Severity = impact on the system (QA judges). Priority = urgency to fix (business decides). Logo typo on the home page: low severity, high priority.',
    'POST creates (not idempotent). PUT replaces (idempotent). PATCH partially updates (not guaranteed idempotent). GET/HEAD are safe. 401 = who are you? 403 = I know you, still no.',
    '200 with {"error": …} in the body is a contract smell: assert status AND body, never status alone.',
    'SQL: COUNT(*) counts rows, COUNT(col) skips NULLs. WHERE filters rows before grouping, HAVING filters groups after. Order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
    'JS: "5" + 2 = "52", "5" - 2 = 3. [10, 1, 2].sort() → [1, 10, 2] (string sort; pass (a, b) => a - b). Use === by default.',
    'Event loop order: synchronous code → all microtasks (promise callbacks) → next macrotask (setTimeout). So 1, 4, 3, 2 for log/timeout/then/log.',
    'Playwright locator priority: getByRole → getByLabel/Placeholder/Text → getByTestId → CSS/XPath last. Locators are lazy and auto-wait.',
    'Web-first: await expect(locator).toBeVisible() retries (default 5 s). locator.isVisible() answers once, now, no retry: never use it as an assertion.',
    'Defaults to know: test timeout 30 s, expect timeout 5 s, retries 0 unless configured; trace: "on-first-retry" is the common CI setting.',
    'Flaky in CI only? Get the trace first, then suspect timing (waitForTimeout), shared test data, order dependence, environment speed, and parallel workers clashing.',
    'Do not know an answer? Say what you do know, reason aloud, and say how you would find out. Never bluff a tool you have not used.',
  ],
  sections: [
    {
      heading: 'How rapid-fire rounds work (and how to use this bank)',
      body: `**Intuition:** a rapid-fire round is a sampling exercise. The interviewer fires 10–20 short questions across areas to find where your knowledge is solid and where it is memorised. A one-line correct answer plus one concrete example beats a three-minute lecture.

Candidate reports for service companies (Infosys, Accenture, Cognizant and others on Glassdoor/AmbitionBox) describe a typical QA loop of a technical round mixing manual concepts, SDLC/STLC, API testing with Postman, Jira, and some automation, often with a short scenario or coding task. Product companies add a deeper automation or coding round.

**The 3-part answer that works for almost every short question:**

| Part | Example ("What is regression testing?") |
|---|---|
| 1. Crisp definition | "Re-running existing tests to check that a change hasn't broken something that used to work." |
| 2. Concrete example | "After we fixed the coupon rounding bug, I re-ran checkout, cart and order-history tests." |
| 3. Practical twist | "We automate the stable part of the regression suite so it runs on every pull request." |

**How this topic is organised:** one short refresher per cluster (manual, test design and defects, API, SQL, JavaScript, Playwright, CI and flaky tests), then the bank. Each concept is taught in depth in its own topic; here the angle is *speed and breadth*.

**Common mistake:** answering a definition question with only a definition. Interviewers move on mentally if there is no example from your own work.`,
      keyPoints: [
        'Definition + your example + practical twist, in under 45 seconds.',
        'Rapid-fire rounds sample breadth; depth comes in the follow-ups.',
        'Use this bank for spaced revision; each cluster has a deep-dive topic.',
      ],
      source: 'Glassdoor Infosys QA interview reports (2024–2026); Software Testing Help SDET interview guide',
    },
    {
      heading: 'Manual testing pairs that get confused',
      body: `**Intuition:** many "basic" questions are really "do you know the difference between these two?". Learn them as pairs, each with a one-line example.

| Pair | Short answer | One-line example |
|---|---|---|
| Verification vs validation | Are we building it right (reviews, specs) vs the right thing (user needs) | Reviewing the login spec vs a user trying to log in with SSO |
| Smoke vs sanity | Broad shallow check of a new build vs narrow check of one fixed area | 10 critical flows on every deploy vs only the coupon area after a coupon fix |
| Retesting vs regression | Re-run the failed case vs re-run related areas for side effects | Retest bug 482; then regress checkout and cart |
| Severity vs priority | Impact vs urgency | App crash on a rarely used admin report: high severity, lower priority |
| Test scenario vs test case | What to test (one line) vs how, with steps, data, expected result | "Verify coupon rules" vs "SAVE10 on 1,000 cart → total 900" |
| Positive vs negative | Valid input behaves vs invalid input is handled gracefully | Valid email registers; "neha@" shows a field error |
| Black vs white vs grey box | No code knowledge vs code-based vs some internal knowledge (DB, API) | Checking the DB row after a UI action is grey box |
| Functional vs non-functional | What it does vs how well (speed, security, usability) | Cart total is right vs cart loads in under 2 s |
| Bug vs defect vs failure | Mistake in code vs observed wrong behaviour when running it | Wrong rounding in code → wrong total on screen |

**In interviews, say this:** "Smoke tells me if the build is worth testing; sanity tells me if the specific fix is worth a full regression."

**Common mistake:** saying smoke and sanity are "the same" or swapping them. Some companies use the words differently, so add: "In my team we used them like this…"`,
      keyPoints: [
        'Learn confusable terms as pairs with one example each.',
        'Acknowledge that teams use smoke/sanity slightly differently, then state your usage.',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 1.2, 2.2.3 (confirmation vs regression testing)',
    },
    {
      heading: 'Test design, defects and process in one page',
      body: `**Intuition:** these questions check whether you can design tests *systematically* and run them inside a team process.

| Topic | 15-second answer |
|---|---|
| Equivalence partitioning | Split inputs into groups that behave the same; test one value per group (age 18–60: one valid, one below, one above) |
| Boundary value analysis | Bugs cluster at edges; test on and around each boundary (17, 18, 60, 61) |
| Decision table | One column per combination of conditions → one test per rule (member? coupon? → discount) |
| State transition | States + events; test valid and invalid transitions (order: placed → shipped; cannot go cancelled → shipped) |
| Error guessing | Experience-based: blank, zero, very long, special characters, double submit |
| Defect life cycle | New → Assigned → Open → Fixed → Retest → Closed, with Rejected, Duplicate, Deferred, Reopened branches |
| Good bug report | Title (what + where), environment, steps, test data, expected vs actual, evidence, severity |
| RTM | Table linking requirements ↔ test cases ↔ defects, to prove coverage |
| Entry / exit criteria | Conditions to start (build deployed, smoke passed) and to stop (P1 cases pass, no open critical bugs) |
| Agile QA | Three amigos, acceptance criteria, test within the sprint, Definition of Done includes testing |

**Worked mini-example (decision table for free shipping):**

| Rule | Prime member? | Cart ≥ 499? | Free shipping? |
|---|---|---|---|
| R1 | Yes | Yes | Yes |
| R2 | Yes | No | Yes |
| R3 | No | Yes | Yes |
| R4 | No | No | No |

Four rules → four tests, and R2 vs R4 is the pair most likely to be coded wrong.

**In interviews, say this:** "I pick the technique from the shape of the requirement: ranges → EP/BVA, combinations → decision table, workflows → state transition."`,
      keyPoints: [
        'Choose the technique from the shape of the requirement.',
        'A bug report needs expected vs actual, steps, data and evidence.',
        'Exit criteria are agreed conditions, not "when time runs out".',
      ],
      source: 'ISTQB CTFL v4.0 syllabus — 4.2 black-box test techniques; 5.5 defect management',
    },
    {
      heading: 'API refresher: methods, status codes, what to assert',
      body: `**Intuition:** an API test is a conversation check: did the server understand the request, reply with the right code, return the right data and change the right things?

| Method | Use | Safe? | Idempotent? |
|---|---|---|---|
| GET | Read | Yes | Yes |
| POST | Create / trigger an action | No | No |
| PUT | Replace the whole resource | No | Yes |
| PATCH | Change some fields | No | Not guaranteed |
| DELETE | Remove | No | Yes (the end state is the same) |

**Status codes you must explain in one line:** 200 OK, 201 Created, 204 No Content, 400 Bad Request (invalid input), **401 Unauthorized** (not authenticated: missing or bad token), **403 Forbidden** (authenticated but not allowed), 404 Not Found, 409 Conflict (duplicate), 422 Unprocessable (valid JSON, invalid business data, used by some APIs), 429 Too Many Requests, 500 Internal Server Error, 503 Service Unavailable.

**What to assert in every API test:** status code, response time (loose limit), headers that matter (\`Content-Type\`), body schema, key values, and side effects (a follow-up GET or a DB check).

**In interviews, say this:** "Status alone is not enough. I have seen APIs return 200 with an error message in the body, so I always assert the body too."`,
      code: [
        {
          language: 'javascript',
          title: 'Postman post-response script: status, time, body and chaining',
          code: `// Runs after POST /booking on Restful Booker
pm.test('status is 200', () => {
  pm.response.to.have.status(200);
});

pm.test('responds within 1500 ms', () => {
  pm.expect(pm.response.responseTime).to.be.below(1500);
});

const body = pm.response.json();

pm.test('booking id and echoed data are correct', () => {
  pm.expect(body.bookingid).to.be.a('number');
  pm.expect(body.booking.firstname).to.eql('Asha');
  pm.expect(body.booking.depositpaid).to.eql(true);
});

// Save the id so the next request (GET /booking/{{bookingId}}) can use it
pm.environment.set('bookingId', body.bookingid);`,
        },
      ],
      keyPoints: [
        'PUT is idempotent, POST is not, PATCH is not guaranteed.',
        '401 = not authenticated, 403 = authenticated but not permitted.',
        'Assert status, body, headers, time and side effects.',
      ],
      source: 'MDN — HTTP request methods and status codes; Postman Learning Center — writing tests',
    },
    {
      heading: 'SQL refresher: the queries testers are asked to write',
      body: `**Intuition:** testers use SQL to *verify* (did the UI action save the right data?) and to *find problems* (duplicates, orphans, NULLs). Interviews test exactly those.

**Five patterns that cover most QA SQL questions:**

| Need | Pattern |
|---|---|
| Count by status | \`SELECT status, COUNT(*) FROM orders GROUP BY status\` |
| Find duplicates | \`GROUP BY email HAVING COUNT(*) > 1\` |
| Rows with no match (orphans, customers without orders) | \`LEFT JOIN … WHERE right.id IS NULL\` |
| Nth highest | \`ORDER BY amount DESC\` with \`DISTINCT\` and \`LIMIT 1 OFFSET n-1\`, or a subquery with \`MAX\` |
| NULL checks | \`WHERE col IS NULL\` (never \`= NULL\`) |

**Logical order of execution:** FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. That is why you cannot use an aggregate in WHERE, and why a SELECT alias works in ORDER BY but not in WHERE.

**In interviews, say this:** "After a UI test creates an order, I query the orders and order_items tables to check the totals and status, and I run a duplicate check on the keys that should be unique."`,
      code: [
        {
          language: 'sql',
          title: 'Customers with no orders, and the second-highest order amount',
          code: `-- 1) Customers who never placed an order (LEFT JOIN + IS NULL)
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- 2) Second-highest DISTINCT order amount (ties do not count twice)
SELECT MAX(amount) AS second_highest
FROM orders
WHERE amount < (SELECT MAX(amount) FROM orders);

-- Same with LIMIT/OFFSET (MySQL and PostgreSQL)
SELECT DISTINCT amount
FROM orders
ORDER BY amount DESC
LIMIT 1 OFFSET 1;

-- 3) Emails registered more than once (should be unique)
SELECT email, COUNT(*) AS copies
FROM users
GROUP BY email
HAVING COUNT(*) > 1;`,
        },
      ],
      keyPoints: [
        'LEFT JOIN + IS NULL finds rows with no match.',
        'Use DISTINCT or MAX(...) < MAX(...) so ties do not break "second highest".',
        'HAVING filters groups; WHERE filters rows.',
      ],
      source: 'SQLBolt lessons on JOINs and aggregates; PostgreSQL docs — aggregate functions',
    },
    {
      heading: 'JavaScript refresher: the traps interviewers love',
      body: `**Intuition:** JavaScript questions in QA interviews are short "what does this print?" puzzles plus one small coding task. They test whether you *understand* the language your Playwright tests are written in.

| Trap | Why |
|---|---|
| \`"5" + 2\` → \`"52"\`, \`"5" - 2\` → \`3\` | \`+\` concatenates if either side is a string; \`-\` converts to numbers |
| \`[10, 1, 2].sort()\` → \`[1, 10, 2]\` | Default sort compares strings; use \`(a, b) => a - b\` |
| \`0.1 + 0.2 === 0.3\` → \`false\` | Floating-point; compare with a tolerance or round to cents |
| \`typeof null\` → \`"object"\` | Historical quirk |
| \`var\` in a loop with \`setTimeout\` prints the final value | One shared \`var\`; \`let\` creates a new binding per iteration |
| Forgetting \`await\` | The promise is not awaited; the next line runs too early, failures may be lost |
| \`const arr = [];\` then \`arr.push(1)\` works | \`const\` stops reassignment, not mutation |

**Coding tasks reported most often for QA/SDET-1:** reverse a string, check a palindrome, count character or word frequency, find duplicates in an array, second-largest number, check anagrams, FizzBuzz, remove duplicates. Interviewers often ask for two versions: with and without built-ins.`,
      code: [
        {
          language: 'javascript',
          title: 'Predict the output, then run it in Node',
          code: `console.log('5' + 2);              // → '52'
console.log('5' - 2);              // → 3
console.log([10, 1, 2].sort());    // → [1, 10, 2]
console.log([10, 1, 2].sort((a, b) => a - b)); // → [1, 2, 10]
console.log(null == undefined);    // → true
console.log(null === undefined);   // → false

// Event-loop order
console.log('A');
setTimeout(() => console.log('B'), 0);       // macrotask
Promise.resolve().then(() => console.log('C')); // microtask
console.log('D');
// → A, D, C, B

// Word frequency in 4 lines
const text = 'test the test plan before the test run';
const freq = {};
for (const word of text.split(' ')) freq[word] = (freq[word] ?? 0) + 1;
console.log(freq); // → { test: 3, the: 2, plan: 1, before: 1, run: 1 }`,
        },
      ],
      keyPoints: [
        'Know coercion with + and -, default sort, var vs let, and event-loop order.',
        'Expect one small coding task; prepare with and without built-ins.',
      ],
      source: 'MDN — Array.prototype.sort, Equality comparisons; javascript.info — Event loop',
    },
    {
      heading: 'Playwright refresher: locators, waiting, assertions',
      body: `**Intuition:** most Playwright interview questions boil down to three ideas: *find elements the way a user does*, *let Playwright wait for you*, and *assert with retrying expectations*.

| Question | Short answer |
|---|---|
| Why Playwright over Selenium? | Auto-waiting, web-first assertions, one API for Chromium/Firefox/WebKit, built-in runner with parallelism, traces, API testing and network mocking |
| Best locator? | \`getByRole\` with an accessible name; then label/placeholder/text; \`getByTestId\` for elements with no good role; CSS/XPath last |
| Dynamic IDs? | Do not use them. Use role + name, text, \`filter({ hasText })\`, or a stable \`data-testid\` agreed with developers |
| What is auto-waiting? | Before an action, Playwright checks the element is visible, stable, enabled, receives events (and editable for fill) |
| \`toBeVisible()\` vs \`isVisible()\` | The first retries until the timeout (default 5 s); the second returns true/false immediately |
| Skip login in every test? | Log in once in a setup project, save \`storageState\` to a file, reuse it in other projects |
| Mock an API? | \`page.route(url, route => route.fulfill({ json }))\` |
| Debug a CI failure? | Turn on \`trace: 'on-first-retry'\`, download the trace, open it in the trace viewer |`,
      code: [
        {
          language: 'typescript',
          title: 'A small, idiomatic SauceDemo test',
          code: `import { test, expect } from '@playwright/test';

test('standard user can add the backpack to the cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  // User-facing locators instead of #ids or XPath
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Login' }).click();

  // Web-first assertion: retries until it passes or 5 s pass
  await expect(page).toHaveURL(/inventory/);

  // Narrow to one product card, then click the button inside it
  const backpack = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});`,
        },
      ],
      keyPoints: [
        'User-facing locators and filter() beat brittle CSS/XPath.',
        'Every action and web-first assertion is awaited and auto-waits.',
        'isVisible() is a snapshot, not an assertion.',
      ],
      source: 'Playwright docs — Locators, Auto-waiting, Assertions, Authentication',
    },
    {
      heading: 'CI, Git and flaky tests in two minutes',
      body: `**Intuition:** automation interviews always end with "and how does this run every day?" and "what do you do when tests are flaky?".

**Git, the commands you will be asked about:** \`clone\`, \`status\`, \`add\`, \`commit\`, \`pull\`, \`push\`, \`branch\`/\`switch\`, \`merge\`, and a pull request for review. Secrets and \`node_modules\` go in \`.gitignore\`.

**CI pipeline for Playwright (GitHub Actions or Jenkins):** checkout → install Node and dependencies → \`npx playwright install --with-deps\` → \`npx playwright test\` → upload the HTML report and traces as artifacts. Use \`workers\`, \`fullyParallel\` and \`--shard\` to cut wall time.

**Flaky test checklist:**

| Symptom | Likely cause | Fix |
|---|---|---|
| Passes locally, times out in CI | Hard waits tuned to a fast laptop; slower CI machine | Remove \`waitForTimeout\`; use web-first assertions or wait for the response |
| Fails only when run with others | Shared test data or order dependence | Unique data per test; create and clean up via API |
| Fails randomly on "element not found" | Brittle locator or animations | Role/test-id locators; assert the state before acting |
| Fails at certain times of day | Dates, time zones, external services | Fix the clock in tests; mock third parties |

**Retries:** \`retries: 2\` in CI hides nothing if you *track* tests that pass only on retry. Playwright reports them as "flaky", so read that list instead of ignoring it.

**In interviews, say this:** "Retries are a seatbelt, not a fix. I use the trace from the first retry to find the cause."`,
      keyPoints: [
        'Pipeline: install → browsers → test → upload report and traces.',
        'Flaky causes: hard waits, shared data, brittle locators, time and third parties.',
        'Track flaky tests; never let retries hide them.',
      ],
      source: 'Playwright docs — Continuous Integration, Test retries, Trace viewer, Sharding',
    },
    {
      heading: 'Answering when you do not know (and not bluffing)',
      body: `**Intuition:** every candidate hits a question they cannot answer. Interviewers score *how* you handle it far more than the gap itself. A confident bluff that collapses on the first follow-up is the worst outcome.

**The honest-but-useful pattern:**

1. **Say what you do know** that is related. "I haven't used sharding in a real pipeline, but I know it splits the test files across machines."
2. **Reason aloud.** "So with 4 shards I'd expect roughly a quarter of the wall time, plus setup on each machine."
3. **Say how you would find out.** "I'd check the Playwright CI docs and try it on my practice repo with two shards first."

**Tool you have only practised, not used at work?** Say exactly that: "I've built a practice framework with Playwright and TypeScript on SauceDemo and Restful Booker. I haven't used it on a production project yet." Then show depth on what you did build.

| Weak | Strong |
|---|---|
| "Yes, I know sharding." (then cannot explain) | "I understand the idea and tried it once in my practice repo; here's what I saw." |
| Silence, then "I don't know." | "I'm not sure. My guess is X because Y. I'd verify by Z." |
| Inventing an API name | "I don't remember the exact method; the idea is to intercept the request and return fake JSON." |

**Common mistake:** listing every tool on the resume. Every line is an invitation for a follow-up question.`,
      keyPoints: [
        'Related knowledge → reasoning → how you would verify.',
        'Describe practice experience as practice; show depth there.',
        'Every tool on your resume must survive two follow-up questions.',
      ],
      source: 'Coursera — QA interview questions and how to answer them; DEV Community Playwright interview prep (2025)',
    },
  ],
  codeChallenges: [
    {
      id: 'qa-interview-bank-cc-1',
      title: 'Improve this: a SauceDemo test with every classic smell',
      context:
        'In a take-home or live-coding round you are shown this test and asked: "It passes on my machine but fails about one run in five in CI. Review it and fix it."',
      task: 'Find and fix the problems: anything that makes the test flaky, brittle, insecure or able to pass when the feature is broken. Keep the same scenario.',
      starter: {
        language: 'typescript',
        title: 'add-to-cart.spec.ts (before)',
        code: `import { test, expect } from '@playwright/test';

test('test1', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  page.locator('#login-button').click();

  // wait for the inventory page
  await page.waitForTimeout(3000);

  await page
    .locator('//*[@id="inventory_container"]/div/div[1]/div[2]/div[2]/button')
    .click();

  const visible = await page.locator('.shopping_cart_badge').isVisible();
  expect(visible).toBe(true);
  expect(await page.locator('.shopping_cart_badge').textContent()).toBe('1');
});`,
      },
      hints: [
        'Look at every line that returns a promise. Is each one awaited?',
        'Which lines guess at time or depend on the page structure staying exactly the same?',
        'Which assertions check the state once instead of retrying, and what is committed to the repo that should not be?',
      ],
      solution: {
        language: 'typescript',
        title: 'add-to-cart.spec.ts (after)',
        code: `import { test, expect } from '@playwright/test';

// Credentials come from the environment (.env locally, a CI secret in the pipeline)
const USER = process.env.SAUCE_USER ?? 'standard_user';
const PASSWORD = process.env.SAUCE_PASSWORD ?? '';

test('adding the backpack shows a cart badge of 1', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');

  await page.getByPlaceholder('Username').fill(USER);
  await page.getByPlaceholder('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click(); // now awaited

  // Replace the 3 s sleep with a condition that retries
  await expect(page).toHaveURL(/inventory/);

  // Find the product by what the user sees, not by its position in the DOM
  const backpack = page
    .locator('.inventory_item')
    .filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // Web-first assertion: waits and retries, fails with a clear message
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
});`,
      },
      explanation: `- **Missing \`await\` on the login click:** the test raced ahead; sometimes the click had not happened when the next line ran. This was the main CI flake.
- **\`waitForTimeout(3000)\`:** a guess. Too short on a slow CI runner, wasted time on a fast one. Replaced with \`expect(page).toHaveURL(...)\`, which waits only as long as needed.
- **Positional XPath:** breaks if a product is added or reordered, and clicks the wrong product silently. Replaced with a card filtered by product name and the button's role and name.
- **\`isVisible()\` + \`toBe(true)\`:** checks once with no retry. \`textContent()\` + \`toBe\` is the same problem. \`toHaveText\` retries up to the expect timeout.
- **Hard-coded password:** moved to an environment variable so secrets are not committed.
- **Test name \`test1\`:** renamed to describe the behaviour, so the report reads like a spec.
- **Extra assertion:** checking the button flips to "Remove" verifies the product card's state, not just the badge.`,
      followUps: [
        {
          q: 'Every test in the suite logs in like this. What would you change next?',
          a: 'Move login into a setup project that logs in once and saves storageState to a file, then make the other projects load that state via use.storageState. Tests start already logged in, the suite runs faster, and only one test exercises the login UI. Keep a dedicated login test for the login page itself.',
        },
        {
          q: 'Why not just add retries: 2 and keep the old test?',
          a: 'Retries would hide the missing await and the sleep, not fix them. The test would still be slow and still sometimes fail, and real bugs could be dismissed as "just flaky". I would keep retries in CI as a safety net, but track tests marked flaky and fix their root cause.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-cc-2',
      title: 'Improve this: a sort-check helper that can never fail',
      context:
        'A teammate wrote a helper for the Playwright test "Price (high to low) sorts correctly". The test has passed for months, even last week when the sort was visibly broken in production.',
      task: 'Explain why the helper always returns true, then rewrite it so it compares numbers correctly, does not mutate its input, and fails loudly on bad data.',
      starter: {
        language: 'javascript',
        title: 'isSortedDesc (before)',
        code: `// Input comes from: await page.locator('.inventory_item_price').allTextContents()
// e.g. ['$29.99', '$9.99', '$15.99']
function isSortedDesc(prices) {
  var expected = prices;   // "copy" of the list
  expected.sort();         // sort ascending
  expected.reverse();      // then flip it

  for (var i = 0; i < prices.length; i++) {
    if (prices[i] != expected[i]) {
      return false;
    }
  }
  return true;
}

console.log(isSortedDesc(['$29.99', '$9.99', '$15.99'])); // → true  (!!)`,
      },
      hints: [
        'Does `var expected = prices` create a new array? What does that mean for the comparison loop?',
        'What does sort() do with strings like "$9.99" and "$15.99"?',
        'How should the function behave if a price cannot be parsed?',
      ],
      solution: {
        language: 'javascript',
        title: 'isSortedDesc (after)',
        code: `// '$1,299.00' -> 1299
function toNumber(priceText) {
  return Number(priceText.replace(/[^0-9.]/g, ''));
}

function isSortedDesc(priceTexts) {
  const prices = priceTexts.map(toNumber); // new array; input untouched

  if (prices.length === 0 || prices.some(Number.isNaN)) {
    throw new Error('Cannot check sort order of: ' + JSON.stringify(priceTexts));
  }

  const expected = [...prices].sort((a, b) => b - a); // numeric, descending
  return prices.every((price, i) => price === expected[i]);
}

console.log(isSortedDesc(['$29.99', '$15.99', '$9.99'])); // → true
console.log(isSortedDesc(['$29.99', '$9.99', '$15.99'])); // → false
console.log(isSortedDesc(['$1,299.00', '$49.99']));       // → true`,
      },
      explanation: `- **Same reference:** \`var expected = prices\` copies the reference, not the array. Sorting \`expected\` sorts \`prices\` too, so the loop compares the array with itself and always returns true. A test that cannot fail is worse than no test.
- **String sort:** the default \`sort()\` compares text, so "$15.99" < "$29.99" < "$9.99". The fix converts to numbers and uses a comparator.
- **Mutation:** the original also reordered the caller's array. The fix uses \`map\` and spread, so the input is untouched.
- **Fail loudly:** an empty list or an unparseable price throws with the actual data, instead of quietly passing.
- **Modern JS:** \`const\`, \`===\`, \`every\`: shorter and no coercion surprises.
- **Lesson for interviews:** always check that a new assertion *fails* when the feature is broken (mutation-test your own tests).`,
      followUps: [
        {
          q: 'How would you prove the helper now catches a broken sort?',
          a: 'Feed it a known unsorted list (unit-test style) and confirm it returns false. Then, in Playwright, mock the products API with page.route to return prices in the wrong order and confirm the UI test fails. Seeing a test go red on purpose is the only proof it guards anything.',
        },
        {
          q: 'Could you avoid the helper entirely in Playwright?',
          a: 'Partly: get the texts with allTextContents(), compute the expected order with a numeric sort, and use expect(actual).toEqual(expected) so the report shows both arrays when it fails. But allTextContents does not retry, so first wait for a stable state, for example await expect(prices).toHaveCount(6) after choosing the sort option.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'qa-interview-bank-iq-01',
      difficulty: 'easy',
      question: 'Out of your current manual test cases, which would you automate first, and which would you never automate?',
      context: 'Glassdoor reports for Infosys QA interviews (2025) list "difference between manual and automation testing" among the questions; interviewers then push for practical judgement like this.',
      whatInterviewerLooksFor: [
        'Criteria for automation: repeated, stable, high-value, data-heavy',
        'Knows what humans do better: exploration, usability, one-off checks',
        'Mentions ROI and maintenance cost',
        'Concrete examples from a real app',
      ],
      modelAnswer: `**Short difference first:** manual testing is a person executing and judging the test; automation is a script executing it and checking predefined assertions. Automation is fast and repeatable; humans notice the unexpected.

**What I would automate first:**
- **Smoke and regression flows that run every build:** login, search, add to cart, checkout with a test card. They are run dozens of times a sprint.
- **Data-heavy rules:** coupon rules, tax calculation, form validation with 30 input combinations. Better as data-driven API tests.
- **Stable features:** areas whose UI is not changing next sprint, so scripts do not need rewriting weekly.
- **Cross-browser repeats:** the same flow on Chromium, Firefox and WebKit.

**What I would keep manual (or not automate yet):**
- **Exploratory testing** of a new feature, where the goal is learning and finding surprises.
- **Usability and look-and-feel:** "Is this error message understandable?"
- **One-off or rarely run checks:** a migration verified once.
- **Features still changing every sprint:** automate after the design settles.
- **Things that need a human or real hardware:** CAPTCHA, a physical card reader, a real camera.

**How I decide:** frequency × value ÷ cost of building and maintaining. If a 10-minute manual check runs once a quarter, automating it is not worth a day of work plus maintenance.

**Example:** on a SauceDemo practice project, I automated login, cart and checkout first (run every time), and kept the visual quirks of \`visual_user\` for manual exploration.`,
      followUps: [
        {
          q: 'Can automation replace manual testers?',
          a: 'No. Automation checks what we already know to check; it cannot ask new questions or judge usability. It frees testers from repetitive regression so they can spend time on exploration, risk analysis and new features. The best teams combine both.',
        },
        {
          q: 'What would you do with a test that is automated but fails every other week because the UI changes?',
          a: 'Look at why it breaks. If the locators are brittle, switch to role- or test-id-based locators and a page object so a change is fixed in one place. If the feature itself keeps changing, pause or delete the test until it settles, and cover it manually. A test that costs more than it saves should be fixed or removed.',
        },
      ],
      pitfalls: [
        '"Automate everything" with no mention of cost or maintenance',
        'Only theory, no concrete example',
        'Thinking CAPTCHA or usability are automation targets',
      ],
    },
    {
      id: 'qa-interview-bank-iq-02',
      difficulty: 'medium',
      question: 'A hotfix for a payment bug is going to production tonight. Which kinds of testing do you run, in what order, and why?',
      whatInterviewerLooksFor: [
        'Correct use of smoke, retest (confirmation), sanity and regression',
        'Sensible order with time constraints',
        'Risk-based selection of regression scope',
        'Post-release verification',
      ],
      modelAnswer: `**1. Smoke on the hotfix build (10–15 min).** Is the build deployable and alive? App loads, login works, main pages open, checkout reachable. If smoke fails, there is no point going further; send it back.

**2. Retest the bug (confirmation testing).** Run the exact steps from the bug report with the same data that failed, plus one or two variations (another card type, another amount). This answers "is it really fixed?".

**3. Sanity around the changed area.** Narrow and quick: other payment methods, decline handling, refund of a payment made after the fix, order confirmation email. Answers "did the fix break its neighbours?".

**4. Focused regression.** Not the full suite. I select by risk:
- tests that touch the changed code (ask the developer which files and services changed);
- the critical business path (browse → cart → pay → order history);
- areas with past bugs in payments.
Automated regression for checkout runs in parallel while I do steps 2–3 manually.

**5. After deploy: production smoke.** A quick check in production (or a canary) using a safe path, such as a real low-value transaction refunded afterwards if the team allows it, or checking monitoring dashboards for payment success rate.

**Communication:** a short note to the release channel: tested, results, what was not covered, risk, go/no-go recommendation.

**Why this order:** each step is a gate. Failing early saves time, and the riskiest checks happen before the widest ones.`,
      followUps: [
        {
          q: 'What is the difference between sanity and smoke in your answer?',
          a: 'Smoke is broad and shallow on a new build: is the whole application basically working? Sanity is narrow and a bit deeper on the changed area: does the fix and its immediate neighbourhood behave sensibly? Some teams use the words loosely, so I describe what I actually check rather than relying on the label.',
        },
        {
          q: 'The developer says the change is "just one line". Do you still regress?',
          a: 'Yes, but scaled to risk. One line in a payment calculation can affect every order. I ask what the line does and what calls it, then pick a small regression set around those callers. Size of the diff is not the same as size of the risk.',
        },
      ],
      pitfalls: [
        'Running the full regression suite with no time limit',
        'Confusing retesting with regression testing',
        'Forgetting any check after deployment',
      ],
    },
    {
      id: 'qa-interview-bank-iq-03',
      difficulty: 'medium',
      question: 'Explain POST, PUT and PATCH using a user-profile API, and tell me how you would test idempotency.',
      context: 'An Infosys interview report on Glassdoor (2026) mentions being asked the difference between POST and PATCH. Playwright and API prep write-ups from 2025 list PUT vs PATCH as a staple.',
      whatInterviewerLooksFor: [
        'Correct semantics: create, full replace, partial update',
        'Understands idempotency and safety',
        'A concrete test design, not just definitions',
        'Mentions that real APIs may deviate and the contract decides',
      ],
      modelAnswer: `**With a profile \`{ name, email, phone, city }\`:**

- **POST /users** creates a new user. Send it twice → two users (two ids). **Not idempotent.**
- **PUT /users/42** replaces the whole profile with the body. Send \`{ name, email, phone, city }\` twice → same final state. **Idempotent.** If you leave out \`phone\`, a strict PUT clears it, because PUT means "this is the full new version".
- **PATCH /users/42** changes only the fields you send, e.g. \`{ "city": "Pune" }\`. Not guaranteed idempotent: \`{ "op": "increment", "loginCount": 1 }\` style patches change state each time.

**Idempotent** means repeating the same request gives the same *server state* as sending it once (responses may differ, e.g. DELETE returns 204 then 404). **Safe** means it does not change state at all (GET, HEAD).

**How I test idempotency:**
1. Send \`PUT /users/42\` with body B; then \`GET /users/42\` → snapshot S1.
2. Send the identical PUT again; \`GET\` → S2. Assert S1 equals S2 (ignore \`updatedAt\` if it changes).
3. For POST, send twice and assert two different ids, or, if the API supports an **Idempotency-Key** header (common for payments), send the same key twice and assert only one resource is created.
4. PUT with a missing field → check it is cleared or rejected as documented.
5. PATCH with one field → check the other fields are untouched.

**Bug I would look for:** PATCH that silently resets unspecified fields to null (behaving like PUT), or PUT that creates duplicates.`,
      followUps: [
        {
          q: 'Is DELETE idempotent if the second call returns 404?',
          a: 'Yes. Idempotency is about the server state, not the response. After the first DELETE the resource is gone; after the second it is still gone. The status code differing (204 then 404) is fine and common. What would be a bug is the second DELETE removing something else.',
        },
        {
          q: 'Why do payment APIs care so much about idempotency keys?',
          a: 'A network timeout leaves the client unsure whether the charge happened, so it retries. Without a key, the retry can create a second charge. With the same key, the server recognises the retry and returns the original result. Tests should send the same key twice and confirm one charge.',
        },
      ],
      pitfalls: [
        'Saying PUT and PATCH are the same',
        'Defining idempotent as "returns the same response"',
        'No actual test steps',
      ],
    },
    {
      id: 'qa-interview-bank-iq-04',
      difficulty: 'medium',
      question: 'An API returns 200 OK, but the body is {"status": "error", "message": "invalid token"}. Is that a bug? How would you report it?',
      whatInterviewerLooksFor: [
        'Knows the expected status (401) and why codes matter to clients and monitoring',
        'Checks the API contract before declaring a bug',
        'Writes a clear, evidence-based report',
        'Adjusts automated assertions to check the body too',
      ],
      modelAnswer: `**My view:** usually yes. An invalid token should give **401 Unauthorized** (authentication failed). Returning 200 says "success" to everything that reads status codes: the frontend, retry logic, API gateways, monitoring dashboards and our own automated tests.

**But first I check the contract.** Some older or internal APIs deliberately use "200 + status field" envelopes. If the OpenAPI spec or team convention says so, it is a design decision to discuss, not a defect. If the spec says 401, it is a bug.

**Impact to mention:**
- The UI may treat it as success and show an empty screen instead of redirecting to login.
- Error-rate alerts based on 4xx/5xx will never fire, so outages hide.
- Tests asserting only \`status === 200\` will pass while the feature is broken.

**Bug report:**
- **Title:** GET /orders returns 200 instead of 401 when the token is invalid
- **Environment:** staging, build 2026.10.3
- **Steps:** send GET /orders with \`Authorization: Bearer invalid123\` (curl/Postman collection attached)
- **Expected:** 401 with an error body per the API spec section "Errors"
- **Actual:** 200 with \`{"status":"error","message":"invalid token"}\`
- **Evidence:** request/response from Postman console, spec link
- **Severity:** medium (no data leak, but breaks client handling and monitoring); **priority** per PO

**Fix in our tests:** assert the body or schema as well as the status, and add negative auth tests (no token, expired, wrong user) to the suite.`,
      followUps: [
        {
          q: 'What is the difference between 401 and 403?',
          a: '401 means the server does not know who you are: the token is missing, expired or invalid, so log in again. 403 means it knows who you are but you are not allowed, for example a normal user calling an admin endpoint. Logging in again will not fix a 403.',
        },
        {
          q: 'How would you catch this automatically in future?',
          a: 'Add negative auth tests for every protected endpoint: no token, expired token, another user\'s token, each asserting the exact status and error schema. Also validate every response body against the JSON schema, so an error envelope inside a 200 fails the schema check.',
        },
      ],
      pitfalls: [
        'Saying "200 means it worked, so no bug"',
        'Raising it without checking the spec or convention',
        'Not explaining the impact on clients and monitoring',
      ],
    },
    {
      id: 'qa-interview-bank-iq-05',
      difficulty: 'medium',
      question: 'Write SQL to find customers who have never placed an order, then the second-highest order amount. Explain your choices.',
      whatInterviewerLooksFor: [
        'Uses LEFT JOIN + IS NULL or NOT EXISTS correctly',
        'Handles ties and NULLs in "second highest"',
        'Explains why, not just writes',
        'Mentions how this helps in testing',
      ],
      modelAnswer: `**Tables:** \`customers(id, name)\`, \`orders(id, customer_id, amount)\`.

**1. Customers with no orders**

Option A, LEFT JOIN: keep every customer, attach orders if any, then keep only rows where no order matched.
\`SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;\`

Option B, NOT EXISTS: often clearer to read and safe with NULLs.
\`SELECT c.id, c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);\`

I avoid \`NOT IN (SELECT customer_id FROM orders)\` because if any \`customer_id\` is NULL, \`NOT IN\` returns no rows at all, a classic trap.

**2. Second-highest order amount**

\`SELECT MAX(amount) FROM orders WHERE amount < (SELECT MAX(amount) FROM orders);\`

This handles ties: if the top amount 5,000 appears twice, I still get the next *different* value. The alternative \`SELECT DISTINCT amount FROM orders ORDER BY amount DESC LIMIT 1 OFFSET 1;\` works too, but without \`DISTINCT\` it would return 5,000 again. In SQL Server you would use \`TOP\` or \`OFFSET … FETCH\` instead of \`LIMIT\`.

**NULLs:** \`MAX\` ignores NULL amounts, which is usually what we want; I would still check whether NULL amounts should even exist (a data-quality bug).

**Why testers care:** the first query finds orphans and inactive users for test data or data-migration checks; the second is a typical way to verify a "top orders" report against the database.`,
      followUps: [
        {
          q: 'How would you get the second-highest amount per customer?',
          a: 'Use a window function: DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rnk in a subquery or CTE, then filter rnk = 2. DENSE_RANK handles ties so equal amounts share a rank and the next distinct value is rank 2. Supported in MySQL 8+ and PostgreSQL.',
        },
        {
          q: 'Why exactly does NOT IN fail with a NULL?',
          a: 'NOT IN expands to "id <> a AND id <> b AND id <> NULL". Any comparison with NULL is UNKNOWN, so the whole condition can never be TRUE and no rows return. NOT EXISTS checks for existence of a row instead, so NULLs do not poison it.',
        },
      ],
      pitfalls: [
        'Using INNER JOIN, which drops exactly the customers we want',
        'ORDER BY ... LIMIT 1 OFFSET 1 without DISTINCT, which breaks on ties',
        'Writing WHERE amount = NULL',
      ],
    },
    {
      id: 'qa-interview-bank-iq-06',
      difficulty: 'medium',
      question: 'After placing an order in the UI, how would you verify it was saved correctly end to end?',
      whatInterviewerLooksFor: [
        'Checks UI, API and DB layers',
        'Knows which fields and tables to verify',
        'Considers side effects (stock, email, payment)',
        'Can automate the check',
      ],
      modelAnswer: `**Layer by layer, following the data:**

**1. UI:** confirmation page shows an order number, items, quantities, totals and delivery address; the order appears in "My orders" with status PLACED.

**2. Network/API:** in DevTools (or a Playwright \`waitForResponse\`) the create-order call returned 201/200 with the same order id; \`GET /orders/{id}\` returns matching items, prices, total and status.

**3. Database:** queries like
- \`SELECT status, total, customer_id FROM orders WHERE id = :id;\`
- \`SELECT sku, qty, unit_price FROM order_items WHERE order_id = :id;\`
and check: total = sum(qty × unit_price) − discount + tax + shipping; the correct customer; created time in UTC; no duplicate order rows for one click.

**4. Side effects:**
- stock decreased by the quantity ordered;
- payment record linked with the same amount;
- confirmation email/SMS queued once;
- coupon marked as used.

**5. Negative angle:** refresh the confirmation page or press Back and resubmit → still one order.

**Automation:** a Playwright test places the order through the UI, captures the order id from the response, then uses the \`request\` fixture to call the API (and, if allowed, a DB helper) to assert the stored data. Grey-box tests like this catch bugs that the UI alone hides, such as the UI showing the right total while the DB stores the pre-discount amount.`,
      followUps: [
        {
          q: 'You do not have DB access in this project. What then?',
          a: 'Verify through the API, which is often the better contract anyway: GET the order and related resources (payment, stock for the SKU). Ask for a read-only DB user or a test-support endpoint for critical checks. Document that DB-level verification is a gap and what risk it leaves.',
        },
        {
          q: 'How do you avoid hard-coding the order id in the test?',
          a: 'Capture it at runtime: wait for the create-order response with page.waitForResponse, parse the JSON for the id, or read it from the confirmation page. Then use it for the API checks. Each run creates its own order, so tests do not collide in parallel.',
        },
      ],
      pitfalls: [
        'Stopping at the confirmation message',
        'Not checking side effects such as stock and duplicate orders',
        'Hard-coding ids or expected totals from yesterday\'s data',
      ],
    },
    {
      id: 'qa-interview-bank-iq-07',
      difficulty: 'easy',
      question: 'Why does this loop print 3, 3, 3 instead of 0, 1, 2, and how do you fix it?',
      context: 'The interviewer shares: for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }',
      whatInterviewerLooksFor: [
        'Knows var is function-scoped and shared',
        'Knows setTimeout callbacks run later',
        'Fixes with let and explains per-iteration binding',
        'Relates to everyday code (async callbacks in tests)',
      ],
      modelAnswer: `**What happens:**
1. The loop runs to the end immediately. \`setTimeout\` only *schedules* the three callbacks for later.
2. \`var i\` is **function-scoped**: there is one \`i\` for the whole loop. When the loop ends, \`i\` is 3.
3. About 100 ms later the three callbacks run. Each one reads the *same* \`i\`, which is now 3 → prints 3, 3, 3.

**Fix 1 (modern):** use \`let\`.
\`for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }\` → 0, 1, 2.
\`let\` is block-scoped and the \`for\` loop creates a **new binding of \`i\` for each iteration**, so each callback closes over its own value.

**Fix 2 (older code):** pass the value in, e.g. \`setTimeout((n) => console.log(n), 100, i)\`, or wrap in a function that receives \`i\` as a parameter (an IIFE).

**Why it matters for testers:** the same idea appears when building test data in loops with async callbacks. It is also why I use \`const\` by default, \`let\` when I need to reassign, and never \`var\` in new code.

**Bonus point:** the order of output (after the loop, after all synchronous code) comes from the event loop: timers are macrotasks and run only once the call stack is empty.`,
      followUps: [
        {
          q: 'What is the difference between let and const?',
          a: 'Both are block-scoped and in the temporal dead zone before their declaration. let can be reassigned; const cannot. const does not freeze the value: const arr = [] still allows arr.push(1). Use const by default and let only for counters or values that change.',
        },
        {
          q: 'What does the temporal dead zone mean?',
          a: 'let and const are hoisted but not initialised, so using them before the declaration line throws a ReferenceError. var is hoisted and initialised to undefined, which hides bugs. The TDZ is one reason let/const are safer: a mistake fails loudly at the line that caused it instead of silently using undefined.',
        },
      ],
      pitfalls: [
        'Saying setTimeout with 100 ms "runs in order quickly" without explaining the shared variable',
        'Claiming const would fix it in a classic for loop (it would throw on i++)',
      ],
    },
    {
      id: 'qa-interview-bank-iq-08',
      difficulty: 'medium',
      question: 'Write a function that returns the most frequent word in a sentence, ignoring case and punctuation. Talk me through it.',
      whatInterviewerLooksFor: [
        'Clarifies ties, empty input and what counts as a word',
        'Uses an object/Map for counts, O(n)',
        'Normalises case and punctuation',
        'Tests own code with edge cases',
      ],
      modelAnswer: `**Clarify:** "If two words tie, which one? I'll return the first one to reach the top count. Empty string → \`null\`. Words are letters, digits and apostrophes."

**Approach (O(n) time, O(k) space for k distinct words):**
1. Lower-case the text.
2. Extract words with a regex: \`text.toLowerCase().match(/[a-z0-9']+/g)\`. \`match\` returns \`null\` if nothing matches, so default to \`[]\`.
3. Count with a \`Map\` (keeps insertion order, no prototype surprises).
4. Track the best word while counting, so ties keep the first winner.

**Code, described line by line:**
- \`const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];\`
- \`const counts = new Map(); let best = null; let bestCount = 0;\`
- \`for (const w of words) { const c = (counts.get(w) ?? 0) + 1; counts.set(w, c); if (c > bestCount) { best = w; bestCount = c; } }\`
- \`return best;\`

**My tests (said aloud):**
- \`"Test the test, then TEST again"\` → \`"test"\` (case and punctuation)
- \`""\` → \`null\`
- \`"a b"\` → \`"a"\` (tie, first wins)
- \`"don't stop, don't"\` → \`"don't"\` (apostrophe kept)

**Alternative:** \`reduce\` to build the counts, then \`Object.entries(...).sort((a, b) => b[1] - a[1])[0]\`. Shorter but O(n log n) due to the sort, and tie-breaking is less explicit.

**Why interviewers ask this:** it is the frequency-count pattern behind many test-data checks: duplicate emails in a CSV, most common error in logs.`,
      followUps: [
        {
          q: 'Your interviewer says "no regex". How do you split words?',
          a: 'Loop over characters, build the current word while the character is a letter or digit (compare with a-z/0-9 ranges after toLowerCase), and when you hit anything else, finish the word if it is non-empty. Remember to flush the last word after the loop. Same counting logic afterwards.',
        },
        {
          q: 'How would this pattern help in test automation?',
          a: 'Counting occurrences is how you check duplicates and distributions: duplicate product names on a listing page from allTextContents(), the frequency of error codes in an API log, or verifying a CSV export has no repeated ids. The Map-based counter is the reusable building block.',
        },
      ],
      pitfalls: [
        'Forgetting that match() returns null for no matches',
        'Not normalising case, so "Test" and "test" count separately',
        'Writing code silently with no tests or edge cases',
      ],
    },
    {
      id: 'qa-interview-bank-iq-09',
      difficulty: 'medium',
      question: 'Explain async/await to me as if I had only done manual testing. Why does every Playwright call need await?',
      whatInterviewerLooksFor: [
        'A clear plain-English analogy',
        'Correct promise basics',
        'Knows the consequence of a missing await in a test',
        'Mentions the floating-promise lint rule',
      ],
      modelAnswer: `**Analogy:** ordering at a café. You order (start an operation) and get a token (a **Promise**). You can wait at the counter until your coffee is ready (**await**), or walk away and do something else. If you walk away and then try to drink, there is nothing in your hand.

**In JavaScript:** anything slow, like a network call, a browser action or a file read, returns a Promise immediately. \`await\` pauses *this* async function until the Promise settles, then gives you the value or throws the error. Other work (the event loop) continues meanwhile.

**Why Playwright needs it:** every Playwright action talks to the browser over a connection, so \`page.click\`, \`locator.fill\` and \`expect(locator).toBeVisible()\` all return Promises.
- Without \`await\` on a click, the next line runs before the click happens → random failures (flaky tests).
- Without \`await\` on a web-first assertion, the test can **finish and pass** before the assertion even runs; the failure is lost or reported after the test ended. That is a test that cannot fail.

**Rules I follow:**
- \`await\` every Playwright action and every \`expect(locator)…\` assertion.
- Plain value assertions like \`expect(5).toBe(5)\` are synchronous and need no await.
- Enable the \`@typescript-eslint/no-floating-promises\` lint rule so a missing await is caught before the code is merged.

**Example:** \`await page.getByRole('button', { name: 'Login' }).click();\` then \`await expect(page).toHaveURL(/inventory/);\`.`,
      followUps: [
        {
          q: 'What happens if an awaited promise rejects?',
          a: 'await throws the rejection as an error at that line. In a Playwright test, an uncaught error fails the test with that message and stack trace, which is what we want. Use try/catch only when you can genuinely handle it, for example cleaning up, then rethrow.',
        },
        {
          q: 'When would you use Promise.all in a test?',
          a: 'When two things must start together, for example waiting for a response while clicking: const [response] = await Promise.all([page.waitForResponse(...), button.click()]). Starting the wait first avoids missing a fast response. Modern Playwright code often does const p = page.waitForResponse(...); await click; await p.',
        },
      ],
      pitfalls: [
        '"await makes the code synchronous" (it pauses only the current async function)',
        'Not knowing that a missing await on expect can make a test pass falsely',
      ],
    },
    {
      id: 'qa-interview-bank-iq-10',
      difficulty: 'medium',
      question: 'An element\'s id changes on every page load (id="btn-83920"). How do you locate it reliably in Playwright?',
      context: 'An Infosys interview report on Glassdoor (2026) mentions handling dynamic web elements; the same question is common in Selenium-era rounds and now asked about Playwright.',
      whatInterviewerLooksFor: [
        'Avoids the dynamic attribute entirely',
        'Prefers role, label and text locators; test ids as a contract',
        'Uses filter/chaining for repeated components',
        'Knows CSS/XPath partial matching only as a fallback',
      ],
      modelAnswer: `**Principle:** do not chase the changing attribute; locate the element by **what the user sees** or by a **stable contract**.

**In order of preference:**
1. **Role and accessible name:** \`page.getByRole('button', { name: 'Place order' })\`. Survives id changes, CSS refactors and layout changes.
2. **Label, placeholder or text:** \`page.getByLabel('Email')\`, \`page.getByText('Order placed')\`.
3. **Test id agreed with developers:** \`page.getByTestId('place-order')\` with \`data-testid\` (or a custom attribute set via \`testIdAttribute\` in the config). This is a contract the team keeps stable.
4. **Scope to a container when there are many similar elements:** \`page.getByRole('listitem').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button', { name: 'Add to cart' })\`.
5. **Last resort, partial attribute match:** CSS \`[id^="btn-"]\` or XPath \`contains(@id, 'btn-')\`. Brittle if several elements share the prefix, and strictness will complain when more than one matches.

**What about timing?** "Dynamic" sometimes means the element appears later. Playwright locators are lazy and actions auto-wait for the element to be visible, stable and enabled, so I do not add sleeps; I assert the state I need with \`await expect(locator).toBeVisible()\` if it matters.

**Strictness:** if a locator matches several elements, actions throw, which is good: it tells me my locator is ambiguous. I fix the locator rather than reaching for \`.first()\`.`,
      followUps: [
        {
          q: 'Why not just use .first() when there are two matches?',
          a: 'Because it hides ambiguity: if the page order changes, the test clicks the wrong element and may still pass. It is acceptable only when "the first" is genuinely what the user means, like the first search result. Otherwise narrow the locator with filter, a container or a more specific name.',
        },
        {
          q: 'Developers refuse to add test ids. What do you do?',
          a: 'Lean on accessible locators: getByRole with names, getByLabel. That has a bonus: if an element cannot be found by role and name, it is probably not accessible to screen-reader users either, which is a bug worth raising. Test ids are then needed only for the few elements with no accessible identity.',
        },
      ],
      pitfalls: [
        'Long absolute XPath copied from DevTools',
        'Adding waitForTimeout because "the element is dynamic"',
        'Using .first() or .nth() to silence strictness errors',
      ],
    },
    {
      id: 'qa-interview-bank-iq-11',
      difficulty: 'easy',
      question: 'Why would a team pick Playwright over Selenium today, and when might Selenium still be the better choice?',
      whatInterviewerLooksFor: [
        'Accurate Playwright strengths (auto-wait, web-first assertions, tooling)',
        'Fair view of Selenium strengths',
        'Decision based on context, not hype',
      ],
      modelAnswer: `**Where Playwright helps:**
- **Auto-waiting and web-first assertions:** actions wait for the element to be actionable and assertions retry, which removes most of the explicit-wait code that makes Selenium suites flaky.
- **One API for Chromium, Firefox and WebKit** (WebKit gives Safari-engine coverage on any OS).
- **Built-in test runner** (\`@playwright/test\`): fixtures, parallel workers, retries, projects, sharding, HTML report, no extra libraries to wire up.
- **Debugging tools:** trace viewer (DOM snapshots, network, console per step), UI mode, codegen, inspector.
- **Isolation:** each test gets a fresh browser context: like a new incognito profile, cheap and fast.
- **Network control and API testing:** \`page.route\` for mocking and the \`request\` fixture for API calls in the same framework.
- **Multiple tabs, iframes and downloads** are handled with straightforward APIs.

**Where Selenium may still win:**
- A large, working existing Selenium suite and a team skilled in it; rewriting has a cost.
- Need for real old browsers or specific vendor grids, or a language Playwright does not support (Playwright has JS/TS, Python, Java and .NET).
- Organisational standards built around WebDriver and Selenium Grid.

**My view:** for a new web project, Playwright gives a faster, more stable start. For an existing healthy Selenium suite, migrate gradually (new tests in Playwright) only if the flakiness or maintenance cost justifies it.`,
      followUps: [
        {
          q: 'What about Cypress?',
          a: 'Cypress has a great developer experience and runs inside the browser, but historically has limits with multiple tabs, multiple domains in one test and WebKit support (WebKit is experimental there). Playwright runs outside the browser over a protocol, which makes multi-tab and multi-origin flows simpler. Both are good choices; context decides, including the team\'s language skills and which browsers the product must support.',
        },
        {
          q: 'Does auto-waiting mean Playwright tests are never flaky?',
          a: 'No. Auto-waiting removes timing flakiness for actions on elements, but tests can still be flaky because of shared test data, order dependence, unstable environments, animations, third-party services or wrong assertions. Good design still matters: isolated data, stable locators and mocks for unreliable dependencies.',
        },
      ],
      pitfalls: [
        'Claiming Selenium is "dead" or "cannot do X" without evidence',
        'Listing features with no reason why they matter',
      ],
    },
    {
      id: 'qa-interview-bank-iq-12',
      difficulty: 'hard',
      question: 'Your Playwright suite passes locally but about 5% of tests fail in CI, always different ones. Walk me through how you investigate.',
      context: 'A 2025 DEV Community Playwright interview-prep write-up says flaky-test handling comes up in nearly every Playwright interview.',
      whatInterviewerLooksFor: [
        'Evidence first: traces, reports, history',
        'Systematic hypotheses (timing, data, isolation, environment, resources)',
        'Knows Playwright tools: trace on-first-retry, --repeat-each, workers',
        'Fixes root causes, uses retries responsibly',
      ],
      modelAnswer: `**1. Gather evidence, do not guess.**
- Enable \`trace: 'on-first-retry'\` and \`retries: 2\` in CI; upload the HTML report and traces as artifacts.
- Look at which tests are marked **flaky** (failed, then passed on retry) over several runs. "Always different ones" suggests a shared cause, not one bad test.

**2. Read the traces.** The trace viewer shows each action, DOM snapshot before/after, network calls and console errors. Typical findings: element covered by a spinner, a request still pending, a 500 from a test environment API, or data that another test changed.

**3. Check the usual suspects:**
- **Timing:** any \`waitForTimeout\`, \`isVisible()\` used as a check, or missing \`await\`. CI machines are slower, so hidden races appear there.
- **Shared data:** two workers editing the same user or cart. Fix with unique data per test (create via API, clean up after).
- **Order dependence:** a test relying on state from a previous test. Reproduce with \`--repeat-each=10\` and with \`--workers=1\` vs many.
- **Resources:** too many workers on a small CI runner → timeouts. Compare runs with \`workers: 2\` vs the default.
- **Environment:** slow or unstable test server, third-party services, time zone/locale differences (\`TZ\`, \`locale\` in config).

**4. Reproduce locally:** \`npx playwright test --repeat-each=20 --workers=4\` on the suspect files, ideally in the same Docker image CI uses.

**5. Fix and prevent:** replace sleeps with web-first assertions or \`waitForResponse\`, isolate data, mock unstable third parties with \`page.route\`, and add a lint rule for floating promises. Track the flaky list weekly; quarantine (with a ticket) only as a temporary step.`,
      followUps: [
        {
          q: 'Would you just increase timeouts?',
          a: 'Only if the evidence shows a genuinely slow but correct operation, such as a report taking 12 seconds, and then only for that assertion with a clear comment. Raising global timeouts hides real problems and makes failing runs slower. Most flakiness is a race or data problem, not a too-short timeout.',
        },
        {
          q: 'What does --repeat-each do and why is it useful?',
          a: 'It runs each selected test N times in one run. Flaky tests that fail 1 in 20 runs become visible quickly, and you can confirm a fix by running 50 repeats green. Combine it with different worker counts to expose isolation and shared-data issues.',
        },
      ],
      pitfalls: [
        '"I would add retries" as the whole answer',
        'Jumping to bigger timeouts without looking at a trace',
        'Not considering parallel workers sharing data',
      ],
    },
    {
      id: 'qa-interview-bank-iq-13',
      difficulty: 'medium',
      question: 'We have 300 UI tests and each one logs in through the login page. How would you speed this up safely?',
      whatInterviewerLooksFor: [
        'Knows storageState and setup projects',
        'Keeps login itself tested once',
        'Handles multiple roles and expiry',
        'Keeps secrets out of the repo',
      ],
      modelAnswer: `**Idea:** log in **once**, save the browser's authenticated state (cookies and local storage) to a file, and start every other test with that state.

**How in Playwright:**
1. Create \`auth.setup.ts\` with a setup test that logs in through the UI (or faster, through the login API) and calls \`page.context().storageState({ path: 'playwright/.auth/user.json' })\`.
2. In \`playwright.config.ts\`, add a **setup project** that matches \`*.setup.ts\`, and make the browser projects depend on it with \`dependencies: ['setup']\` and \`use: { storageState: 'playwright/.auth/user.json' }\`.
3. Tests now open already logged in. 300 logins become 1.

**Safety points:**
- Keep **one or more real login tests** (wrong password, lockout, logout) that do *not* use the saved state, so the login page itself stays covered. They can opt out with \`test.use({ storageState: { cookies: [], origins: [] } })\`.
- **Multiple roles:** one state file per role (\`admin.json\`, \`buyer.json\`) and choose per project or per test.
- **Secrets:** credentials from environment variables / CI secrets; add \`playwright/.auth\` to \`.gitignore\` because the file contains session tokens.
- **Expiry:** the setup project runs at the start of every run, so tokens are fresh. For very short sessions, refresh in a fixture.
- **Isolation:** if tests modify the user's server-side data (cart, settings), parallel tests sharing one account can still collide; use one account per worker for those.

**Result:** faster suite, fewer login-related flakes, and login behaviour still tested where it belongs.`,
      followUps: [
        {
          q: 'Why might logging in through the API be better in the setup step?',
          a: 'It is faster and does not depend on the login UI, so a cosmetic change to the login page cannot break all 300 tests. Use the request fixture or page.request to post credentials, then save the storage state. The UI login is still verified by its own dedicated tests.',
        },
        {
          q: 'Tests that use the same account fail when run in parallel. Why?',
          a: 'They share server-side state: one test empties the cart while another expects an item in it. storageState shares the session, not isolation of data. Use one account per worker (keyed by test.info().parallelIndex) or reset state through the API before each test.',
        },
      ],
      pitfalls: [
        'Committing the auth JSON file to Git',
        'Removing all UI login testing',
        'Assuming shared accounts are safe for parallel tests that change data',
      ],
    },
    {
      id: 'qa-interview-bank-iq-14',
      difficulty: 'hard',
      question: 'If you joined us and had to start a Playwright framework for our web app from zero, what would the first two weeks look like?',
      whatInterviewerLooksFor: [
        'Starts from risk and value, not tools',
        'Sensible structure: config, fixtures, page objects, data, CI',
        'Small vertical slice first, then expand',
        'Honest about own experience level',
      ],
      modelAnswer: `**Honest framing first:** "I have built this structure in a practice project; in a real team I would pair with a developer for the CI and environment parts."

**Days 1–3: understand and choose.**
- Talk to the PO and devs: top 10 business-critical flows, environments, test data options, how deployments work.
- Pick the first **3–5 smoke flows** (login, search, add to cart, checkout with a test card).
- Agree on locator strategy: roles and labels first, \`data-testid\` for the rest.

**Days 4–7: thin vertical slice.**
- \`npm init playwright@latest\` with TypeScript.
- \`playwright.config.ts\`: \`baseURL\` from env, projects for Chromium (+ WebKit later), \`retries\` 2 in CI and 0 locally, \`trace: 'on-first-retry'\`, HTML reporter.
- Folder structure: \`tests/\` (specs by feature), \`pages/\` (page objects), \`fixtures/\` (custom fixtures for page objects and test data), \`utils/\`, \`test-data/\`.
- Auth via a setup project + \`storageState\`.
- Write the 3–5 smoke tests end to end.

**Days 8–10: CI and data.**
- GitHub Actions (or Jenkins) job: install, install browsers, run, upload report and traces.
- Test data through API helpers (create a user/order per test, clean up), never shared mutable accounts.
- Tag tests (\`@smoke\`, \`@regression\`) to run subsets.

**Days 11–14: harden and share.**
- Run the suite 20× (\`--repeat-each\`) to flush out flakiness.
- Short README: how to run, how to add a test, conventions.
- Demo to the team; agree the next 20 tests by risk.

**What I would not do yet:** a heavy custom framework, Allure dashboards, visual testing everywhere. Get a small reliable suite running in CI first.`,
      followUps: [
        {
          q: 'Do assertions belong inside page objects?',
          a: 'Opinions differ. A common, readable approach: page objects expose actions and locators (and maybe small state checks), while the test makes the business assertions, so the test reads like a spec. Some teams add helper assertions like expectLoaded() inside the page object. Being consistent across the codebase matters more than the choice.',
        },
        {
          q: 'How would you show progress to the manager?',
          a: 'A simple weekly view: flows covered vs the agreed risk list, CI run time, pass rate and flaky count, and one example bug the suite caught. That ties automation to value instead of counting test cases, and it makes the next prioritisation conversation easy.',
        },
      ],
      pitfalls: [
        'Starting with a giant framework before one test runs in CI',
        'No plan for test data or authentication',
        'Overstating real-world experience with the tool',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'qa-interview-bank-drill-1',
      question:
        'Rapid classification: name the testing type for each situation. (1) New build deployed; you check that the app loads, login works and main pages open. (2) Bug 482 is fixed; you run its exact steps again. (3) After the fix, you re-run checkout, cart and order-history tests. (4) Only the coupon module changed; you quickly check coupons and the cart total. (5) A user tries the feature in the real business setting before sign-off. (6) You test with no script for 60 minutes using a charter.',
      assumptions: [
        'Use the most common industry meanings; note where teams differ',
        'One best label per situation',
      ],
      steps: [
        { label: '(1) Broad, shallow, new build', calc: 'Smoke testing (build verification)' },
        { label: '(2) Exact failed case again', calc: 'Retesting / confirmation testing' },
        { label: '(3) Related areas for side effects', calc: 'Regression testing' },
        { label: '(4) Narrow, changed area, quick', calc: 'Sanity testing' },
        { label: '(5) Real users, real setting, sign-off', calc: 'User acceptance testing (UAT)' },
        { label: '(6) Charter, learn and test at once', calc: 'Exploratory testing (session-based)' },
      ],
      answer: `1 → **Smoke**, 2 → **Retesting (confirmation)**, 3 → **Regression**, 4 → **Sanity**, 5 → **UAT**, 6 → **Exploratory (session-based)**.

The pairs to keep apart: smoke vs sanity (broad new build vs narrow changed area) and retest vs regression (same failed case vs everything around it).`,
      insight:
        'Interviewers fire these as a sequence; answering each with one label plus a 5-word reason ("narrow check of the changed area") sounds confident and precise.',
      followUps: [
        {
          q: 'Can a smoke suite be automated? Should it be?',
          a: 'Yes, and it usually should be: it runs on every build, it is small and stable, and it gates whether deeper testing is worth starting. Tag those tests @smoke and run them first in CI so a broken build fails within minutes.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-drill-2',
      question:
        'Five expressions, five traps that also bite test helpers. Without Node, write down the value of: `[3, 20, 100].sort()`, `typeof null`, `0.1 + 0.2 === 0.3`, `[] == false`, and the three values `null ?? "d"`, `0 || "f"`, `0 ?? "k"`.',
      assumptions: ['Node 20+ / any modern browser', 'Write values the way the Node REPL would show them'],
      steps: [
        { label: '[3, 20, 100].sort() with no comparator', calc: 'Compares as strings: "100" < "20" < "3" → [100, 20, 3]' },
        { label: 'typeof null', calc: 'Historical quirk → "object"' },
        { label: '0.1 + 0.2 === 0.3', calc: '0.1 + 0.2 = 0.30000000000000004 → false' },
        { label: '[] == false', calc: '[] → "" → 0; false → 0; 0 == 0 → true' },
        { label: '?? vs ||', calc: 'null ?? "d" → "d"; 0 || "f" → "f" (0 is falsy); 0 ?? "k" → 0 (0 is not null/undefined)' },
      ],
      answer: `\`[100, 20, 3]\` · \`'object'\` · \`false\` · \`true\` · \`'d'\`, \`'f'\`, \`0\``,
      insight:
        'Each line is a trap that also bites test code: string sorting of prices, float money totals, loose equality, and || replacing a legitimate 0 (quantity 0, price 0) with a default.',
      followUps: [
        {
          q: 'How would you compare money values safely in a test?',
          a: 'Work in integer minor units (paise or cents): parse "₹1,299.50" to 129950 and compare integers. Or round both sides to 2 decimals before comparing. Never compare floats from arithmetic with === directly.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-drill-3',
      question:
        'Trace this query on the table below and write the exact result. orders(id, customer, status, amount): (1, asha, DELIVERED, 500), (2, asha, CANCELLED, 300), (3, ravi, DELIVERED, 1200), (4, ravi, DELIVERED, 800), (5, neha, PLACED, NULL), (6, neha, DELIVERED, 400). Query: `SELECT customer, COUNT(*) AS orders, COUNT(amount) AS priced, SUM(amount) AS total FROM orders WHERE status <> \'CANCELLED\' GROUP BY customer HAVING SUM(amount) > 450 ORDER BY total DESC;`',
      assumptions: ['Standard SQL (MySQL or PostgreSQL)', 'Aggregates ignore NULL except COUNT(*)'],
      steps: [
        { label: 'FROM + WHERE', calc: 'Drop row 2 (CANCELLED) → rows 1, 3, 4, 5, 6 remain' },
        { label: 'GROUP BY customer', calc: 'asha: {1}; ravi: {3, 4}; neha: {5, 6}' },
        { label: 'Aggregates', calc: 'asha 1 / 1 / 500; ravi 2 / 2 / 2000; neha 2 / 1 / 400 (NULL ignored by COUNT(amount) and SUM)' },
        { label: 'HAVING SUM > 450', calc: 'ravi 2000 ✓, asha 500 ✓, neha 400 ✗' },
        { label: 'ORDER BY total DESC', calc: 'ravi, then asha' },
      ],
      answer: `| customer | orders | priced | total |
|---|---|---|---|
| ravi | 2 | 2 | 2000 |
| asha | 1 | 1 | 500 |`,
      insight:
        'COUNT(*) vs COUNT(col) is how you spot NULL data quality issues quickly (neha has 2 orders but only 1 priced), and WHERE vs HAVING decides whether a cancelled order affects a customer\'s total.',
      followUps: [
        {
          q: 'How would the result change if the WHERE line were removed?',
          a: 'asha would then include the cancelled 300: 2 orders, 2 priced, total 800, and would still pass HAVING. Ravi unchanged; neha still 400 and excluded. Result: ravi 2000, asha 800. This is exactly the kind of bug where a report forgets to exclude cancelled orders.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'qa-interview-bank-mcq-01',
      difficulty: 'easy',
      question: 'A new build lands on staging. Before deeper testing, you spend 10 minutes checking the app loads, users can log in and main pages open. What is this?',
      options: ['Smoke testing', 'Sanity testing', 'Regression testing', 'User acceptance testing'],
      correct: [0],
      explanation:
        'A broad, shallow check of a new build to decide if it is testable is smoke testing. Sanity is a narrow check of a specific changed area, regression re-runs existing tests for side effects, and UAT is done by users or business before sign-off.',
      followUps: [
        {
          q: 'What do you do if smoke fails?',
          a: 'Stop further testing, report the blocking issue immediately with evidence, and ask for a new build. Running hundreds of tests on a broken build only creates noise.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-02',
      difficulty: 'easy',
      question: 'The company name is misspelt in the home page header. Which classification is most typical?',
      options: [
        'Low severity, high priority',
        'High severity, low priority',
        'High severity, high priority',
        'Low severity, low priority',
      ],
      correct: [0],
      explanation:
        'Functionally nothing breaks, so severity is low, but it damages brand trust on the most visible page, so the business wants it fixed fast. High severity would mean a crash or data loss; low priority would suit a typo deep in a rarely visited help page.',
      followUps: [
        {
          q: 'Give an example of high severity, low priority.',
          a: 'A crash in an admin export used once a year by one internal user, with a manual workaround. The impact on that function is severe, but the urgency is low.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-03',
      difficulty: 'easy',
      question: 'Bug 482 is fixed. You run its exact steps again and it passes. What have you done, and what is still missing?',
      options: [
        'Retesting; regression around the change is still needed',
        'Regression; retesting is still needed',
        'Smoke testing; nothing else is needed',
        'Sanity testing; UAT is required next',
      ],
      correct: [0],
      explanation:
        'Running the failed case again confirms the fix (retesting, or confirmation testing). It does not show that the change broke nothing else; that is regression testing of related areas. Smoke and sanity describe different scopes.',
      followUps: [
        {
          q: 'How would you choose the regression scope?',
          a: 'Ask what code changed and what calls it, include the critical business flows that pass through that area, and add areas with a history of bugs. Automated regression can cover the broad part.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-04',
      difficulty: 'medium',
      question: 'A teammate filed this ticket during a regression cycle. Why will the developer most likely bounce it back?',
      code: {
        language: 'text',
        code: `Title: Checkout not working
Steps: Go to checkout and pay
Expected: Should work
Actual: Not working
Severity: Critical`,
      },
      options: [
        'No specific steps, data, environment or actual behaviour, so it cannot be reproduced',
        'Severity should always be left for the developer to set',
        'The title should be written in capital letters',
        'Bug reports should not contain an expected result',
      ],
      correct: [0],
      explanation:
        'A developer cannot reproduce "pay" without the product, payment method, card, environment and what actually happened (error text, screenshot, response). Testers normally propose severity, titles are not judged by capitals, and expected vs actual is the heart of a report.',
      followUps: [
        {
          q: 'Rewrite the title.',
          a: 'For example: "Checkout: paying with a saved Visa card shows \'Something went wrong\' and no order is created (staging, Chrome 129)."',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-05',
      difficulty: 'medium',
      question: 'A logged-in normal user calls DELETE /admin/users/7 with a valid token. What status code should a well-designed API return?',
      options: ['403 Forbidden', '401 Unauthorized', '404 Not Found, always', '200 OK with an error message'],
      correct: [0],
      explanation:
        'The user is authenticated (valid token) but not permitted, which is 403. 401 is for missing or invalid credentials. Some APIs deliberately return 404 to hide that a resource exists, but "always" is not the standard answer. 200 with an error body breaks clients and monitoring.',
      followUps: [
        {
          q: 'Which test would catch an API that returns 200 here and actually deletes the user?',
          a: 'A role-based negative test: call the admin endpoint with a normal user token and assert 403, then GET the user as admin to confirm it still exists. Always check the side effect, not just the status.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-06',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which statements about HTTP methods are correct?',
      options: [
        'Sending the same PUT request twice leaves the resource in the same state as sending it once',
        'POST is idempotent because it always returns 201',
        'GET should not change server state',
        'DELETE is idempotent even if the second call returns 404',
        'PATCH is always idempotent by definition',
      ],
      correct: [0, 2, 3],
      explanation:
        'PUT replaces the resource, so repeating it gives the same state; GET is a safe method; DELETE leaves the same end state even if the second response is 404. POST is not idempotent (each call may create a new resource), and PATCH is not guaranteed to be idempotent, for example with increment-style patches.',
      followUps: [
        {
          q: 'How would you test PUT idempotency?',
          a: 'Send the same PUT twice, GET after each, and compare the bodies (ignoring timestamps like updatedAt). Any difference, or a duplicate resource, is a bug.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-07',
      difficulty: 'medium',
      question: 'Which Postman test would catch this broken response?',
      code: {
        language: 'http',
        code: `HTTP/1.1 200 OK
Content-Type: application/json

{ "status": "error", "message": "invalid token", "data": null }`,
      },
      options: [
        'pm.expect(pm.response.json().data).to.be.an("object") alongside the status check',
        'pm.response.to.have.status(200)',
        'pm.expect(pm.response.responseTime).to.be.below(2000)',
        'pm.expect(pm.response.headers.get("Content-Type")).to.include("json")',
      ],
      correct: [0],
      explanation:
        'Only a body assertion notices that data is null and the call actually failed. The status check passes because the server wrongly returned 200, the response time is fine, and the content type really is JSON, so those three tests are all green on a broken response.',
      followUps: [
        {
          q: 'What is the most robust body check?',
          a: 'Validate the whole response against a JSON schema (required fields, types), for example with pm.response.to.have.jsonSchema(schema) in recent Postman versions or a schema validator in code. It catches missing and wrongly typed fields in one assertion.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-08',
      difficulty: 'medium',
      question: 'The payments table has 5 rows; 2 have amount = NULL. What does this query return?',
      code: {
        language: 'sql',
        code: `SELECT COUNT(*) AS all_rows, COUNT(amount) AS with_amount
FROM payments;`,
      },
      options: ['all_rows = 5, with_amount = 3', 'all_rows = 5, with_amount = 5', 'all_rows = 3, with_amount = 3', 'An error, because amount contains NULL'],
      correct: [0],
      explanation:
        'COUNT(*) counts rows regardless of values, while COUNT(column) counts only non-NULL values. Getting 5 for both is the common misconception, 3 for both forgets that COUNT(*) includes NULL rows, and NULLs never make aggregates throw.',
      followUps: [
        {
          q: 'How would you list the rows with missing amounts?',
          a: 'SELECT * FROM payments WHERE amount IS NULL; — never "= NULL", which is never true.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-09',
      difficulty: 'hard',
      question: 'Order amounts are 900, 900, 700 and 500. Which query correctly returns 700 as the second-highest amount?',
      code: {
        language: 'sql',
        code: `-- A
SELECT amount FROM orders ORDER BY amount DESC LIMIT 1 OFFSET 1;
-- B
SELECT MAX(amount) FROM orders WHERE amount < (SELECT MAX(amount) FROM orders);
-- C
SELECT MAX(amount) FROM orders WHERE amount <> 900 OR amount IS NULL;
-- D
SELECT MIN(amount) FROM orders ORDER BY amount DESC LIMIT 2;`,
      },
      options: ['B', 'A', 'C', 'D'],
      correct: [0],
      explanation:
        'B finds the largest value strictly below the maximum, so ties at the top do not matter and it returns 700. A returns 900 because the duplicate occupies the second position (it needs DISTINCT). C hard-codes 900, so it fails as soon as the data changes. D computes MIN over all rows (500) because LIMIT applies after the aggregate.',
      followUps: [
        {
          q: 'How would you fix A?',
          a: 'Add DISTINCT: SELECT DISTINCT amount FROM orders ORDER BY amount DESC LIMIT 1 OFFSET 1; Then the duplicate 900 collapses into one row and 700 is second.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-10',
      difficulty: 'medium',
      question: 'You need customers who placed more than 3 orders in 2025. Where does the "more than 3" condition go?',
      options: [
        'In HAVING COUNT(*) > 3, after GROUP BY customer_id, with the 2025 filter in WHERE',
        'In WHERE COUNT(*) > 3, before GROUP BY',
        'In ORDER BY COUNT(*) > 3',
        'In SELECT, as COUNT(*) > 3 AS many',
      ],
      correct: [0],
      explanation:
        'WHERE filters individual rows (the 2025 date range) before grouping; HAVING filters groups after aggregates exist. Aggregates are not allowed in WHERE, ORDER BY only sorts, and a boolean in SELECT does not filter rows.',
      followUps: [
        {
          q: 'Why can\'t WHERE use COUNT(*)?',
          a: 'Because of the logical processing order: WHERE runs before GROUP BY, so the counts do not exist yet. HAVING runs after grouping, when the aggregates are available.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-11',
      difficulty: 'easy',
      question: 'A quantity scraped from the cart page arrives as the string "5". What gets logged?',
      code: {
        language: 'javascript',
        code: `const qty = '5';
console.log(qty + 2, qty - 2);`,
      },
      options: ['52 3', '7 3', '7 "3"', '52 NaN'],
      correct: [0],
      explanation:
        'With +, if either side is a string, JavaScript concatenates, giving "52". The - operator only works on numbers, so "5" is converted and 5 - 2 = 3. "7" would need Number(qty) first, and NaN only appears when the string is not numeric.',
      followUps: [
        {
          q: 'How would you safely add quantities read from the UI?',
          a: 'Convert explicitly: Number(text) or parseInt(text, 10), check for NaN, then add. In Playwright, allTextContents() returns strings, so this conversion is needed before any arithmetic.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-12',
      difficulty: 'medium',
      question: 'A test reads prices from the page and checks "low to high" sorting like this. What is wrong?',
      code: {
        language: 'javascript',
        code: `const prices = [7.99, 15.99, 29.99, 9.99];
const expected = [...prices].sort();
console.log(expected); // ?`,
      },
      options: [
        'Default sort compares strings, so it prints [15.99, 29.99, 7.99, 9.99]',
        'Nothing; it prints [7.99, 9.99, 15.99, 29.99]',
        'It throws because sort() needs a comparator',
        'It mutates prices because spread does not copy',
      ],
      correct: [0],
      explanation:
        'Without a comparator, sort converts values to strings and compares them character by character, so "15.99" comes before "7.99". It does not throw; a comparator is optional. The spread does create a shallow copy, so prices is not mutated. Fix with sort((a, b) => a - b).',
      followUps: [
        {
          q: 'Why use [...prices] before sorting?',
          a: 'sort() mutates the array in place. Copying first keeps the original order intact so you can compare actual (as shown) against expected (sorted).',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-13',
      difficulty: 'hard',
      question: 'In what order are the letters printed?',
      code: {
        language: 'javascript',
        code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
queueMicrotask(() => console.log('D'));
console.log('E');`,
      },
      options: ['A E C D B', 'A B C D E', 'A E B C D', 'A C D E B'],
      correct: [0],
      explanation:
        'Synchronous logs run first (A, E). Then the microtask queue drains in order of queuing (C from the promise, D from queueMicrotask). Only then does the timer macrotask run (B), even with 0 ms. Thinking setTimeout 0 runs immediately, or that promises run before synchronous code, leads to the other options.',
      followUps: [
        {
          q: 'Why does this matter for Playwright tests?',
          a: 'It explains why un-awaited promises run "later" than the next line, and why a missing await lets the test continue before the browser action finishes. await yields until the promise settles, keeping steps in order.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-14',
      difficulty: 'medium',
      question: 'Which locator is the most resilient for a "Place order" button whose id changes on every load?',
      options: [
        "page.getByRole('button', { name: 'Place order' })",
        "page.locator('#btn-83920')",
        "page.locator('//div[3]/div[2]/button[1]')",
        "page.locator('button').nth(4)",
      ],
      correct: [0],
      explanation:
        'Role plus accessible name matches what users see and survives id and layout changes. The id changes every load, the positional XPath breaks when the structure shifts, and nth(4) silently clicks the wrong button if another button is added.',
      followUps: [
        {
          q: 'What if two "Place order" buttons exist (header and footer)?',
          a: 'Scope to a container: page.getByRole("contentinfo").getByRole("button", { name: "Place order" }) for the footer, or filter a region. Avoid .first() unless "first" is really what the user means.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-15',
      difficulty: 'hard',
      question: 'This sort check fails on some runs and passes on others. What is the most likely reason?',
      code: {
        language: 'typescript',
        code: `test('price low to high', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.locator('.product_sort_container').selectOption('lohi');
  const texts = await page.locator('.inventory_item_price').allTextContents();
  const prices = texts.map((t) => Number(t.replace('$', '')));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});`,
      },
      options: [
        'allTextContents() reads the list immediately without retrying, so it can read the old order before the re-render',
        'selectOption() cannot be used on a native <select> element',
        'Number() cannot parse prices with decimals',
        'toEqual compares arrays by reference, so it always fails',
      ],
      correct: [0],
      explanation:
        'Methods like allTextContents() return a snapshot at that moment with no auto-retry, so a fast read can capture the pre-sort order. selectOption is exactly for native selects, Number("7.99") parses decimals fine, and toEqual compares array contents deeply, not by reference.',
      followUps: [
        {
          q: 'How would you make it reliable?',
          a: 'Assert the expected order with a retrying assertion, e.g. await expect(page.locator(".inventory_item_price").first()).toHaveText("$7.99") before reading, or wrap the read-and-compare in expect.poll / expect(...).toPass so it retries until the list settles.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-16',
      difficulty: 'hard',
      question: 'What is the key difference between these two lines?',
      code: {
        language: 'typescript',
        code: `// Line 1
expect(await page.getByText('Order placed').isVisible()).toBe(true);
// Line 2
await expect(page.getByText('Order placed')).toBeVisible();`,
      },
      options: [
        'Line 2 retries until the text appears or the timeout passes; Line 1 checks once and fails if it is not there yet',
        'Line 1 is faster and equally reliable',
        'Line 2 checks only that the element exists in the DOM',
        'They are identical; Line 2 is just shorter',
      ],
      correct: [0],
      explanation:
        'isVisible() returns the visibility at that instant with no waiting, so a message that appears 200 ms later fails Line 1. The web-first assertion in Line 2 polls until it passes (default 5 s). Line 1 is not reliable, and toBeVisible checks visibility, not mere existence.',
      followUps: [
        {
          q: 'When is isVisible() legitimately useful?',
          a: 'For branching logic where either outcome is fine, for example closing an optional cookie banner if it is visible right now. Never as a pass/fail assertion.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-17',
      difficulty: 'medium',
      question: 'A long end-to-end flow has 9 web-first assertions, each passing after about 4 s on a slow staging server. The run fails with "Test timeout of 30000ms exceeded". Default config. What happened?',
      options: [
        'Each assertion stayed inside its 5 s expect timeout, but together they used up the 30 s budget for the whole test',
        'One assertion waited 30 s because the expect timeout defaults to 30 s',
        'Retries were 0, so Playwright stopped after the first slow assertion',
        'Web-first assertions do not retry, so the first slow one failed instantly',
      ],
      correct: [0],
      explanation:
        'The expect timeout (5 s by default) limits each assertion, while the test timeout (30 s by default) limits the entire test including hooks and every wait. Nine 4-second waits add up to 36 s. The expect default is not 30 s, retries re-run failed tests rather than shortening them, and web-first assertions do retry.',
      followUps: [
        {
          q: 'What would you change first?',
          a: 'Check whether the flow is too long for one test (split it, or set up state via API so the UI part is shorter). If the slowness is genuine and expected, mark it with test.slow() or set a larger timeout for that test only, with a comment explaining why.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-18',
      difficulty: 'hard',
      question: 'Select ALL that apply. The CI report lists 9 tests as "flaky" (failed, then passed on retry). Which responses remove a cause instead of hiding it?',
      options: [
        'Replace waitForTimeout calls with waits on the actual condition or network response',
        'Create unique test data per test through the API instead of sharing one account',
        'Raise retries from 2 to 5 so the pipeline goes green',
        'Mock the unstable third-party address-lookup service with page.route in UI tests',
        'Increase the global test timeout to 120 seconds',
      ],
      correct: [0, 1, 3],
      explanation:
        'Condition-based waits, isolated data and mocking an unreliable dependency each remove a real source of non-determinism. More retries and a huge global timeout only make the failures rarer or slower to surface, so real bugs can hide behind them.',
      followUps: [
        {
          q: 'Where would you still test the real address-lookup integration?',
          a: 'In a small number of contract or integration tests against its sandbox, run on a schedule, so a provider change is noticed without making every UI test depend on it.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-19',
      difficulty: 'expert',
      question: 'Select ALL that apply. Your config has a "setup" project that logs in and saves playwright/.auth/user.json, and a "chromium" project with dependencies: ["setup"] and storageState pointing to that file. Which statements are true?',
      options: [
        'The setup project runs before the chromium tests in each run',
        'Tests in the chromium project start with the saved cookies and local storage',
        'The auth file should be committed to Git so CI can reuse it',
        'A login-page test can opt out with an empty storageState',
        'storageState also isolates server-side data between parallel tests',
      ],
      correct: [0, 1, 3],
      explanation:
        'Project dependencies run setup first, and storageState loads the saved browser state; a test can override it with an empty state to test login itself. The file contains live session tokens, so it belongs in .gitignore, and it shares a session rather than isolating server-side data such as carts.',
      followUps: [
        {
          q: 'How would you handle admin and buyer roles?',
          a: 'Save two state files in setup (admin.json, buyer.json) and either create a project per role or call test.use({ storageState: "playwright/.auth/admin.json" }) in the admin spec files.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-20',
      difficulty: 'expert',
      question: 'What does this test verify, and what does it NOT verify?',
      code: {
        language: 'typescript',
        code: `test('shows empty state when there are no orders', async ({ page }) => {
  await page.route('**/api/orders*', (route) =>
    route.fulfill({ status: 200, json: { items: [], total: 0 } }),
  );
  await page.goto('/orders');
  await expect(page.getByText('You have no orders yet')).toBeVisible();
});`,
      },
      options: [
        'It verifies the UI handles an empty list; it does not verify the real API returns that shape',
        'It verifies the real orders API end to end',
        'It verifies the database has no orders',
        'It verifies nothing, because page.route only works for images',
      ],
      correct: [0],
      explanation:
        'page.route intercepts the request and fulfils it with fake JSON, so the test isolates the UI behaviour for an empty response. The real API and database are never called, so their behaviour needs separate API or contract tests. page.route works for any request, not just images.',
      followUps: [
        {
          q: 'Why mock here instead of using a real user with no orders?',
          a: 'The state is deterministic and fast, and it is easy to also mock error states (500, timeout) that are hard to create on a shared environment. Keep at least one unmocked end-to-end test so the real integration is still covered.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-21',
      difficulty: 'medium',
      question: 'Select ALL that apply. Which items belong in .gitignore for a Playwright project?',
      options: ['node_modules/', '.env with real credentials', 'playwright/.auth/', 'playwright.config.ts', 'tests/ folder'],
      correct: [0, 1, 2],
      explanation:
        'Dependencies are reinstalled from package-lock, secrets must never be committed, and saved auth state contains session tokens. The config and tests are the project itself and must be versioned.',
      followUps: [
        {
          q: 'You already committed .env with a password. Is deleting it in the next commit enough?',
          a: 'No. It remains in Git history. Rotate the password immediately, then remove it from history if required by policy, and add .env to .gitignore with a .env.example template.',
        },
      ],
    },
    {
      id: 'qa-interview-bank-mcq-22',
      difficulty: 'hard',
      question: 'Select ALL that apply. Which are good reasons to push a check DOWN from the UI to the API level?',
      options: [
        'It validates 40 combinations of a pricing rule',
        'It does not depend on how the page looks',
        'It is the only way to check that the button is visible',
        'It runs much faster and fails with clearer messages',
        'It removes the need for any UI tests',
      ],
      correct: [0, 1, 3],
      explanation:
        'Data-heavy business rules run faster and more stably at the API level and are not broken by UI changes, which is the test pyramid idea. Button visibility is a UI concern, and a few UI tests are still needed to check that the screen is wired to the API.',
      followUps: [
        {
          q: 'How many UI tests would you keep for the pricing feature?',
          a: 'One or two: the happy path showing the calculated price on screen, and perhaps one error display. All rule combinations go to data-driven API tests.',
        },
      ],
    },
  ],
};

export default topic;
