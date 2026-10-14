import type { Topic } from '../../types';

const topic: Topic = {
  id: 'ai-daily-qa',
  phase: 'ai-testing',
  order: 2,
  title: 'Using AI in Daily QA Work',
  subtitle:
    'Use AI to draft test cases, test data, bug reports and Playwright code, then review it like a strong tester: what AI misses, what it invents, and a checklist for AI-written scripts.',
  estimatedMinutes: 90,
  sources: [
    'ISTQB — Certified Tester Specialist Level: Testing with Generative AI (CT-GenAI) v1.1, certification overview page (istqb.org)',
    'GitHub Docs — What is GitHub Copilot? (assistive and agentic features, plans, organisation policies)',
    'Playwright docs — Test Agents (planner, generator, healer; npx playwright init-agents), Getting started with MCP, Release notes (agents since v1.56)',
    'Playwright docs — Locators, Assertions, Best Practices (role-based locators, web-first assertions, avoid waitForTimeout)',
    'Anthropic — Prompting best practices; OpenAI — Prompt engineering guide; Google — Gemini prompt design strategies',
    'SauceDemo (www.saucedemo.com) and Restful Booker (restful-booker.herokuapp.com) — behaviour checked by hand',
  ],
  tags: ['ai', 'test-case-generation', 'test-data', 'bug-reports', 'copilot', 'playwright', 'code-review', 'chatgpt', 'claude', 'gemini'],
  cheatSheet: [
    'Workflow: give AI the real story/AC → ask for categorised cases → REVIEW → add what is missing → remove what is invented → store in your test tool.',
    'AI usually over-produces happy paths and under-covers: negative, boundary, state (refresh, back, re-login), permissions/roles, non-functional (a11y, performance, security).',
    'Review questions: traceable to an AC? exact texts real? duplicates? missing categories? testable expected results? data safe?',
    'Test data: ask for synthetic data with edge cases (long, unicode, apostrophes, whitespace, boundaries). Never feed real customer data in; use reserved domains like example.com / .test.',
    'Bug reports: AI is good at structure and clarity; it must not add facts (severity, root cause, environment) you did not give it.',
    'Logs/stack traces: mask secrets and personal data, trim to the relevant window, ask for evidence lines, then reproduce.',
    'AI-written Playwright: check for waitForTimeout, CSS/XPath instead of getByRole/getByLabel, missing assertions, missing await, hard-coded credentials/URLs, invented APIs, shared state.',
    'Explaining a failure: give the exact error, the code, what you expected and what you tried. Ask for 2–3 likely causes ranked, then verify with the trace.',
    'Tools (as of 2026): chat assistants (ChatGPT, Claude, Gemini) for thinking and drafting; GitHub Copilot inside the IDE for code. Use the company-approved plan.',
    'Playwright now ships Test Agents (planner, generator, healer) and Playwright MCP: advanced, later; the same review rules apply to their output.',
    'Keep your skills: write the first ideas yourself, then use AI to find gaps, not the other way round.',
  ],
  sections: [
    {
      heading: 'Where AI fits in a tester\'s day',
      body: `**Intuition:** AI is a fast, tireless junior colleague who has read every testing blog but has never seen your product. Great at first drafts, bad at knowing your rules.

| Task | How AI helps | Main risk | Your job |
|---|---|---|---|
| Test scenarios / cases from a story | Drafts 20 ideas in a minute | Happy-path bias, invented rules | Review, add missing categories, trace to AC |
| Test data | Realistic fake names, addresses, edge strings | Real data leaking in or out; invalid formats | Use synthetic data only; check formats |
| Bug reports | Turns rough notes into clear steps/expected/actual | Adds facts you never observed | Keep only what you saw |
| Logs / stack traces | Summarises, explains unfamiliar errors | Secrets in logs; confident wrong cause | Mask, trim, verify by reproducing |
| Playwright code | Boilerplate, locators, refactors | Flaky patterns, invented APIs, no assertions | Review with a checklist, run it |
| Learning | Explains concepts, quizzes you | Outdated or wrong details | Cross-check with official docs |

**What surveys and community threads keep reporting:** testers mostly use AI for generating test cases and scripts, analysing logs and prioritising what to test first. They also warn that answers vary and need checking. That matches this whole topic: **draft with AI, decide as a tester.**

**In interviews, say this:** "I use AI as a drafting and thinking partner: scenarios from stories, test data, clearer bug reports, explaining errors, and boilerplate Playwright code. Every output goes through my review before it's used, and I never paste customer data or secrets."`,
      keyPoints: [
        'AI is strongest at drafting and summarising, weakest at knowing your product.',
        'Every task has a typical risk; the review step targets that risk.',
        'Interview answer: concrete uses + review + data safety.',
      ],
      source: 'ISTQB CT-GenAI ch. 1–3 outline',
    },
    {
      heading: 'Generating test cases with AI',
      body: `**Intuition:** you are the test lead giving a brief; the AI is the writer. A good brief gives a good first draft.

**A practical 5-step workflow**

1. **Think first (2 minutes).** Jot down your own top risks for the story. This keeps your judgement in charge and gives you something to compare with.
2. **Prompt with the real story.** Paste the user story and acceptance criteria, state what doesn't exist, and ask for categories: positive, negative, boundary, state, permissions, non-functional ideas.
3. **Ask for traceability and open questions.** Each case cites its AC; unknowns go to an "Open questions" list, not into expected results.
4. **Review** (next section): remove invented rules, add missing categories, fix vague expected results.
5. **Store and own it.** Put the reviewed cases in your test management tool (Jira/Xray, TestRail, Zephyr, a spreadsheet). The AI chat is not your test repository.

**Worked example: SauceDemo-style checkout, step one**

The story: logged-in user with items in the cart enters First Name, Last Name, Zip/Postal Code; all required; error messages like "Error: First Name is required"; Continue leads to the overview; Cancel goes back to the cart.

A typical first AI draft gives ~10 cases: fill all fields, leave each one empty, special characters, long names. Useful, but notice what's **not** there: what happens to the cart after Cancel, whether entered data survives going back, whether the user can reach the page with an empty cart or when logged out, keyboard-only use, and whether the error clears after fixing the field. You add those in review.

**Tip:** ask for **scenarios first** (one line each), review them, and only then ask for full step-by-step cases for the ones you keep. Reviewing 15 one-liners is much faster than reviewing 15 full test cases.`,
      code: [
        {
          language: 'text',
          title: 'Prompt: scenarios first, details later',
          code: `ROLE: Senior QA engineer for an e-commerce web app.

<story>
Checkout step one (logged-in user, at least 1 item in cart).
Fields: First Name, Last Name, Zip/Postal Code (all required).
Missing field -> "Error: <Field> is required" above the form.
Continue -> "Checkout: Overview" page. Cancel -> back to cart.
</story>

TASK: List test SCENARIOS (one line each), grouped under:
Positive | Negative | Boundary | State/navigation | Permissions |
Non-functional ideas (accessibility, security, performance).

RULES:
- Cite the story line for each scenario, or write "NOT IN STORY".
- Do not invent error texts or limits; add unknowns to
  "Open questions".
- Max 25 scenarios. No step-by-step yet.`,
        },
      ],
      keyPoints: [
        'Think of your own risks first, then compare with the AI list.',
        'Ask for categories, traceability and open questions.',
        'Scenarios first, full cases later: faster review.',
      ],
      source: 'Anthropic / OpenAI / Google prompting guides; ISTQB CT-GenAI ch. 2 outline',
    },
    {
      heading: 'Reviewing AI output: what it typically misses',
      body: `**Intuition:** AI writes like someone who read the story once, quickly. It covers what the story *says*; it rarely asks what the story *doesn't* say.

**The five gaps to look for every time**

| Gap | Why AI misses it | SauceDemo / QA Shop example |
|---|---|---|
| **Negative** | Stories describe success; the model follows the text | Postal code with letters, only spaces, pasted emoji |
| **Boundary** | Limits are usually not written down, so it can't know them | 1-char name, 255-char name, quantity 0 / max |
| **State & navigation** | Requires imagining a sequence of actions over time | Refresh on overview, browser Back after Finish, cart after Cancel, two tabs |
| **Permissions / roles** | The model doesn't know your user types | Logged-out user opens /checkout-step-one.html directly; locked_out_user; admin vs customer |
| **Non-functional** | Not mentioned in functional stories | Keyboard-only, screen-reader labels, error announced, slow network, double-click Finish |

**Also check for these problems**

- **Invented rules or texts:** "max 50 characters", "Error: Invalid postal code": is that in the story? If not → Open questions.
- **Vague expected results:** "should work correctly", "an error is shown" → which error, where, and what stays unchanged?
- **Duplicates in disguise:** "empty first name" and "first name not provided" are the same case.
- **Untestable cases:** "system should be secure" → turn into concrete checks or remove.
- **Wrong test data:** real-looking emails on real domains, dates in the wrong format.

**Interview gold:** quantify your review. "The AI gave 18 cases; I removed 3 duplicates and 2 invented rules, and added 7 cases for state, permissions and accessibility." That shows you used AI *and* added value.`,
      code: [
        {
          language: 'text',
          title: 'Review notes on an AI draft (checkout step one)',
          code: `AI draft (excerpt)                          Review decision
-----------------------------------------   -------------------------------
TC1 Fill all fields, click Continue          KEEP (add: lands on Overview,
                                               items/prices unchanged)
TC2 Leave First Name empty                   KEEP (exact error text, AC2)
TC3 First name not provided                  DELETE (duplicate of TC2)
TC4 Postal code must be 5 digits             QUESTION (not in story)
TC5 Names should work correctly              REWRITE (vague expected result)
TC6 Special characters in Last Name          KEEP (expected: NOT SPECIFIED
                                               -> Open question)
ADDED by tester:
TC7 Cancel -> cart shows the same items      (state)
TC8 Open step one URL when logged out        (permissions)
TC9 Fix the missing field -> error clears    (state)
TC10 Complete form using keyboard only       (accessibility)
TC11 Double-click Continue / Finish          (robustness)`,
        },
      ],
      keyPoints: [
        'Check for the five gaps: negative, boundary, state, permissions, non-functional.',
        'Remove invented rules, rewrite vague expected results, merge duplicates.',
        'Quantify your review in interviews.',
      ],
      source: 'ISTQB CT-GenAI ch. 2.3 outline (evaluating GenAI results); SauceDemo behaviour checked by hand',
    },
    {
      heading: 'Test data with AI',
      body: `**Intuition:** AI is an excellent fake-data factory, as long as nothing real goes in and you check what comes out.

**Good uses**

- **Realistic synthetic users** for a signup or checkout form: names from many cultures, addresses in the right country format, phone numbers in valid formats.
- **Edge-case strings:** apostrophes (O'Brien), hyphens, accents (José), non-Latin scripts, emoji, leading/trailing spaces, 1 character, 255+ characters, HTML-like text (\`<b>hi</b>\`), SQL-like text.
- **Boundary values** when you give it the rules: "age must be 18–120" → 17, 18, 19, 119, 120, 121.
- **Structured data:** JSON bodies for Restful Booker \`POST /booking\` with valid and invalid variants, or CSV rows for a data-driven Playwright test.

**Rules that keep you safe**

1. **Never paste real customer data** to get "similar" data. Describe the shape instead ("emails, Indian mobile numbers, PIN codes").
2. **Use reserved domains and obviously fake values:** \`example.com\`, \`.test\` emails, test card numbers published by your payment provider for sandbox use.
3. **Check formats and validity yourself:** AI often produces dates like 2026-02-30 or postal codes in the wrong format, which can be useful as negative data only if you label them.
4. **Save the generated data** in your repo or test tool so the suite is repeatable. Don't regenerate it every run: output varies.
5. **Label each row with its purpose** ("valid", "boundary-max", "invalid-format") so expected results are clear.

**Common mistake:** "Here are 20 rows of production orders, make more like these." That's a data leak, even if the tool is good at it.`,
      code: [
        {
          language: 'json',
          title: 'AI-generated, tester-reviewed booking data (Restful Booker)',
          code: `[
  {
    "purpose": "valid-basic",
    "firstname": "Asha", "lastname": "Verma", "totalprice": 150,
    "depositpaid": true,
    "bookingdates": { "checkin": "2026-05-01", "checkout": "2026-05-03" }
  },
  {
    "purpose": "valid-apostrophe-and-accent",
    "firstname": "José", "lastname": "O'Brien", "totalprice": 99,
    "depositpaid": false,
    "bookingdates": { "checkin": "2026-06-10", "checkout": "2026-06-11" },
    "additionalneeds": "Late check-in"
  },
  {
    "purpose": "boundary-zero-price",
    "firstname": "Test", "lastname": "Zero", "totalprice": 0,
    "depositpaid": false,
    "bookingdates": { "checkin": "2026-07-01", "checkout": "2026-07-02" }
  },
  {
    "purpose": "invalid-checkout-before-checkin (expected: NOT DOCUMENTED)",
    "firstname": "Date", "lastname": "Swap", "totalprice": 120,
    "depositpaid": true,
    "bookingdates": { "checkin": "2026-08-05", "checkout": "2026-08-01" }
  }
]`,
        },
      ],
      keyPoints: [
        'Ask for synthetic data with explicit edge cases and boundaries.',
        'Nothing real goes in; reserved domains and sandbox values come out.',
        'Label rows by purpose and save them for repeatable runs.',
      ],
      source: 'ISTQB CT-GenAI ch. 3 outline (data privacy and security risks); Restful Booker API checked with real requests',
    },
    {
      heading: 'Better bug reports and log summaries with AI',
      body: `**Intuition:** AI is a good editor. It can turn your rushed notes into a clear report, but it must not become a co-author who adds things you never saw.

**Bug reports: what to ask**

- "Rewrite these notes as a bug report with Title, Environment, Preconditions, Steps, Expected, Actual, Evidence. **Use only the facts in my notes; write UNKNOWN for anything missing.**"
- "Suggest a clearer one-line title (under 80 characters) that says what is broken and where."
- "What information is missing for a developer to reproduce this?": a great self-check.

**What to watch out for**

- **Invented facts:** a severity, a root cause ("caused by a race condition"), a browser version or a step you did not do.
- **Softened wording:** "the total might not update in some cases" when you saw it fail 5/5 times.
- **Sensitive data:** logs, screenshots and HAR files may contain tokens or customer data; mask before pasting.

**Logs and stack traces**

1. **Trim:** the error, ~20 lines before it, the request ID, the first frames of your own code.
2. **Mask:** emails, tokens, cookies, card numbers, internal hostnames if your policy requires.
3. **Ask with evidence:** "Explain this error in simple words. Which lines support your explanation? What input might reproduce it?"
4. **Reproduce** before you put a cause in a bug report. An AI explanation is a hypothesis, not a finding.`,
      code: [
        {
          language: 'text',
          title: 'Rough notes → AI rewrite (reviewed)',
          code: `MY NOTES:
qa shop, chrome, staging. added 2x backpack, applied SAVE10 on cart,
went to checkout, back to cart, discount gone but total still shows
discounted price?? 5/5 times. screenshot attached

AI REWRITE (after my review: removed "Severity: Critical" and
"likely caching issue" that the AI added on its own)

Title: Cart shows discounted total after promo code disappears on
       returning from checkout
Environment: QA Shop staging, Chrome (version: UNKNOWN - to add)
Preconditions: Logged in; cart empty
Steps:
 1. Add "Backpack" to the cart twice (quantity 2)
 2. In the cart, apply promo code SAVE10
 3. Click Checkout
 4. Return to the cart
Expected: Promo code and discounted total are both still shown
          (or both removed): they must be consistent
Actual:   Promo code is no longer shown, but the total still
          includes the discount
Frequency: 5/5
Evidence: screenshot attached`,
        },
      ],
      keyPoints: [
        'Tell AI to use only your facts and mark unknowns.',
        'Delete invented severity, root cause or environment details.',
        'For logs: trim, mask, ask for evidence, then reproduce.',
      ],
      source: 'ISTQB CT-GenAI ch. 2 outline (prompt engineering for testing tasks)',
    },
    {
      heading: 'AI-generated Playwright scripts: a review checklist',
      body: `**Intuition:** AI-written test code usually *runs* the first time. That's exactly why it's dangerous: a test that runs is not the same as a test that checks something reliably.

**The checklist (memorise these 8)**

| # | Smell in AI code | Why it hurts | Fix |
|---|---|---|---|
| 1 | \`page.waitForTimeout(3000)\` | Slow and still flaky | Web-first assertion: \`await expect(locator).toBeVisible()\` |
| 2 | CSS/XPath chains (\`div > div:nth-child(3) button\`, \`//div[2]/button\`) | Breaks on any layout change | \`getByRole\`, \`getByLabel\`, \`getByPlaceholder\`, \`getByTestId\` |
| 3 | No assertions (only clicks) | Test passes even if the feature is broken | Assert the outcome: URL, text, count |
| 4 | Missing \`await\` | Steps race; failures get lost | \`await\` every action and every \`expect\` |
| 5 | Hard-coded credentials / URLs | Secrets in git; can't switch env | \`process.env\`, \`baseURL\` in config |
| 6 | Invented APIs (\`waitForElementVisible\`, \`toBeDisplayed\`, \`getText()\`) | Doesn't compile or fails at runtime | Check playwright.dev; use real API |
| 7 | \`isVisible()\` used as an assertion | Returns immediately, no retry | \`await expect(locator).toBeVisible()\` |
| 8 | Tests depending on each other / shared state | Order-dependent, fails in parallel | Each test sets up its own data |

**How to review fast:** read only the assertions first. If there are none, or they assert something trivial ("page has a title"), the test is not testing the feature. Then scan for the other smells. Finally, **run it** (and run it again with \`--repeat-each=3\` if you suspect flakiness).

**Prompt tip:** put your team rules in the prompt or in your coding assistant's instruction file: "Use only getByRole/getByLabel/getByTestId; no waitForTimeout; every test ends with an assertion on the outcome; credentials from process.env."`,
      code: [
        {
          language: 'typescript',
          title: 'As generated by AI (do not use)',
          code: `import { test, expect } from '@playwright/test';

test('checkout', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');            // hard-coded secret
  await page.click('//*[@id="login-button"]');             // XPath
  await page.waitForTimeout(3000);                          // hard wait
  page.click('.inventory_item:nth-child(1) button');        // missing await
  await page.click('.shopping_cart_link');
  await page.click('#checkout');
  await page.fill('#first-name', 'John');
  await page.fill('#last-name', 'Doe');
  await page.fill('#postal-code', '12345');
  await page.click('#continue');
  await page.click('#finish');
  // no assertion: passes even if the order never completes
});`,
        },
        {
          language: 'typescript',
          title: 'After review',
          code: `import { test, expect } from '@playwright/test';

test('user can complete checkout for one item', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);

  await page.locator('.inventory_item')
    .filter({ hasText: 'Sauce Labs Backpack' })
    .getByRole('button', { name: 'Add to cart' })
    .click();
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  await page.locator('.shopping_cart_link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('First Name').fill('Test');
  await page.getByPlaceholder('Last Name').fill('User');
  await page.getByPlaceholder('Zip/Postal Code').fill('12345');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
});`,
        },
      ],
      keyPoints: [
        'Read the assertions first: no meaningful assertion = no test.',
        'Hunt for waitForTimeout, CSS/XPath, missing await, secrets, invented APIs.',
        'Run it, and repeat it, before trusting it.',
      ],
      source: 'Playwright docs — Best Practices, Locators, Assertions; SauceDemo checked by hand',
    },
    {
      heading: 'Asking AI to explain a failing test',
      body: `**Intuition:** asking "why does my test fail?" with no details is like calling a doctor and saying "I feel bad". Give symptoms, history and what you already tried.

**A good "explain this failure" prompt contains**

1. **The exact error message** (copy it, don't paraphrase), plus the line it points to.
2. **The relevant code**, not the whole repo: the test and any page object it uses.
3. **What you expected and what you saw**, ideally from the trace viewer or screenshot.
4. **Where it fails:** locally, in CI, only in one browser, only sometimes?
5. **What you already tried.**
6. **The ask:** "List the 3 most likely causes, ranked, and how I can confirm each one."

**Example: a classic beginner failure.** The test clicks \`getByRole('button', { name: 'Add to cart' })\` on the SauceDemo inventory page and fails with a **strict mode violation** because the locator matches 6 buttons. A good AI answer explains strict mode, suggests filtering by the product card (\`.filter({ hasText: 'Sauce Labs Backpack' })\`), and maybe mentions \`.first()\` as a weaker option. Your job: confirm in the error output that it indeed "resolved to 6 elements", choose the filtered version, and re-run.

**Things AI cannot see** (so you must check them): the actual DOM at failure time, the CI environment, network timing, test data on the shared environment. The **trace** shows those; AI explains the error text.`,
      code: [
        {
          language: 'text',
          title: 'Prompt for explaining a failure',
          code: `I'm a beginner with Playwright Test (TypeScript).

ERROR (exact):
Error: locator.click: Error: strict mode violation:
getByRole('button', { name: 'Add to cart' }) resolved to 6 elements

CODE:
await page.getByRole('button', { name: 'Add to cart' }).click();

CONTEXT: SauceDemo inventory page lists 6 products, each with an
"Add to cart" button. I want to add only "Sauce Labs Backpack".
Fails every time, locally and in CI.
TRIED: adding waitForTimeout(2000) - no change.

ASK: Explain the error in simple words, give 2-3 ways to fix it
ranked from most to least robust, and tell me how to confirm the
fix works.`,
        },
      ],
      keyPoints: [
        'Give exact error, relevant code, expected vs actual, where it fails, what you tried.',
        'Ask for ranked causes and how to confirm each.',
        'The trace shows what AI cannot see; verify there.',
      ],
      source: 'Playwright docs — Locators (strictness, filter), Trace viewer',
    },
    {
      heading: 'AI tools for testers compared (as of 2026)',
      body: `**Intuition:** chat assistants are for *thinking and writing*; IDE assistants are for *code where you type it*. Most testers use one of each, whichever their company approves.

| Tool | Where you use it | Typical QA use | Privacy / enterprise notes |
|---|---|---|---|
| **ChatGPT** (OpenAI) | Web, desktop and mobile chat apps | Brainstorm scenarios, rewrite bug reports, explain errors, generate test data | Business/enterprise plans add admin controls and stricter data terms; personal accounts have different settings |
| **Claude** (Anthropic) | Web/desktop chat; Claude Code in the terminal/IDE | Reviewing long specs and test plans, writing and refactoring test code | Team/enterprise plans with admin controls; check which plan your company uses |
| **Gemini** (Google) | Web chat; built into Google Workspace (Docs, Gmail, Drive); Gemini Code Assist in IDEs | Summarising docs and email threads, drafting test cases from a Google Doc spec | Workspace admin settings apply in company accounts |
| **GitHub Copilot** (GitHub) | Inside the IDE (e.g. VS Code, JetBrains) and on github.com | Autocomplete Playwright code, chat about the open file, agent mode for multi-file edits, PR review | Organisation admins control access and feature policies, can exclude files, and see audit logs |

**How to choose (in practice, your company chooses)**

- Writing or fixing **test code** all day → an IDE assistant (Copilot, or Claude Code / Gemini Code Assist) saves the most time because it sees your files.
- Working on **requirements, test design, reports** → a chat assistant with a good prompt template.
- All four are capable; differences change every few months, so don't memorise feature lists or prices. In interviews, talk about **how** you use a tool and **how you verify** its output.

**Playwright's own AI features (advanced, later).** Playwright now ships **Test Agents** (a *planner*, a *generator* and a *healer*, set up with \`npx playwright init-agents\`, added in v1.56) and **Playwright MCP**, which lets AI assistants drive a browser through the page's accessibility tree. Same rule: review what they produce.`,
      keyPoints: [
        'Chat assistants for thinking/writing; IDE assistants for code.',
        'Use the company-approved plan; enterprise plans add admin and data controls.',
        'Playwright Test Agents and MCP exist: advanced, later.',
      ],
      source: 'GitHub Docs — What is GitHub Copilot?; Playwright docs — Test Agents, Getting started with MCP, Release notes',
    },
    {
      heading: 'Making AI a habit without losing your skills',
      body: `**Intuition:** a calculator is great, but you still need to know whether the answer *looks* right. Same with AI.

**Team practices that work**

- **Prompt templates** in a shared doc: "test scenarios from a story", "bug report from notes", "test data for a form", "review this Playwright test against our rules".
- **Instruction files for coding assistants** with your conventions (locator strategy, no hard waits, fixtures, folder structure), so every suggestion starts closer to your standards.
- **Code review stays the same:** AI-written tests go through the same pull-request review as human-written ones. Some teams mark AI-assisted PRs to review them a bit more carefully.
- **Measure, don't assume:** compare time to write a test suite, number of review comments, and escaped bugs before and after. If AI output needs heavy rework, adjust the prompts or the use case.

**Protect your own skills (especially as a beginner)**

- Write your **own** first five test ideas before asking AI; then ask "what did I miss?". You learn faster and you keep judgement.
- When AI fixes your code, make sure you can **explain the fix**. If you can't, ask it to explain, then check the docs.
- In interviews you'll write code and test cases **without** AI. Practise both ways.

**When not to use AI**

- Anything involving real customer data or secrets in a non-approved tool.
- When the task is faster to do yourself (a two-line locator change).
- When you can't verify the output (an unfamiliar domain with no source of truth): there, ask a human expert.`,
      keyPoints: [
        'Shared prompt templates and assistant instruction files raise output quality.',
        'Same code review for AI-written tests; measure the benefit.',
        'Think first, then ask AI for gaps; keep practising without it.',
      ],
      source: 'GitHub Docs — Copilot customisations (instructions, reusable prompts); ISTQB CT-GenAI ch. 5 outline (adoption, managing change)',
    },
  ],
  codeChallenges: [
    {
      id: 'ai-daily-qa-cc-1',
      title: 'Critique an AI-generated checkout test list',
      context:
        'You asked an AI tool for test cases for a SauceDemo-like checkout (cart → your information → overview → finish). It returned the list below. Your lead wants a reviewed version before it goes into the test management tool.',
      task: 'Review the AI list: mark what to keep, merge, rewrite or question, and add the missing coverage (negative, boundary, state, permissions, non-functional). Produce a strong reviewed list with clear expected results.',
      starter: {
        language: 'text',
        title: 'ai-checkout-cases.txt',
        code: `AI-generated test cases: Checkout

1. Verify user can checkout successfully.
2. Verify checkout works with valid data.
3. Verify first name field.
4. Verify last name field.
5. Verify postal code accepts only 6 digits.
6. Verify total price is correct.
7. Verify finish button works.
8. Verify user gets confirmation email after order.
9. Verify page loads fast.`,
      },
      hints: [
        'Which cases are duplicates, and which expected results are too vague to pass or fail?',
        'Which "rules" are not in SauceDemo at all (check the real app: does it validate postal code length, does it send email)?',
        'Walk through the flow with a twist: Cancel, Back, refresh, logged out, empty cart, double-click. What would you test?',
      ],
      solution: {
        language: 'text',
        title: 'reviewed-checkout-cases.txt',
        code: `Review of AI list
- 1 + 2 + 7: MERGE into CO-01 (one end-to-end happy path)
- 3, 4: REWRITE as concrete negative cases (CO-02..CO-04)
- 5: QUESTION - app has no documented postal-code format rule;
     do not assert "6 digits". Added to Open questions.
- 6: REWRITE with exact calculation (CO-05)
- 8: DELETE - no email feature in this app (invented)
- 9: REWRITE as measurable or move to performance testing

Reviewed cases (expected results are specific)
CO-01 Happy path: 2 items -> info (Test/User/12345) -> Continue ->
      Finish. Expect "Thank you for your order!", cart badge gone.
CO-02 Empty First Name -> "Error: First Name is required", stays
      on step one, other fields keep their values.
CO-03 Empty Last Name -> "Error: Last Name is required".
CO-04 Empty Postal Code -> "Error: Postal Code is required".
CO-05 Overview totals: Item total = sum of item prices; Tax shown;
      Total = Item total + Tax (2 decimals). Use 2 items with
      different prices.
CO-06 Whitespace-only First Name "   " -> observe; expected
      NOT SPECIFIED -> Open question.
CO-07 Boundary: 1-char and 255-char names -> observe, record.
CO-08 State: Cancel on step one -> back to cart, same items/qty.
CO-09 State: Cancel on overview -> back to inventory, cart intact.
CO-10 State: browser Back after Finish -> no duplicate order,
      cart still empty.
CO-11 State: fix missing field after error -> error clears,
      Continue works.
CO-12 Permissions: open /checkout-step-one.html when logged out ->
      redirected to login with an error.
CO-13 Edge: checkout with empty cart -> observe; Open question.
CO-14 Robustness: double-click Finish -> one confirmation only.
CO-15 Accessibility: complete the form with keyboard only; fields
      have accessible names; error is perceivable.

Open questions for PO: postal code format? empty-cart checkout
allowed? whitespace names valid? performance target for checkout?`,
      },
      explanation: `**What the review fixed:**

- **Duplicates merged** (1, 2, 7 all mean "happy path works").
- **Vague expected results rewritten** ("verify first name field" can't pass or fail; "Error: First Name is required, stays on step one" can).
- **Invented requirements removed or turned into questions:** a 6-digit postal-code rule and a confirmation email do not exist in the app. Asserting them would create false failures.
- **Missing categories added:** state/navigation (Cancel, Back, fix-the-error), permissions (logged-out direct URL), edge (empty cart, whitespace, long names), robustness (double-click) and accessibility.
- **Non-functional made measurable:** "loads fast" becomes a question about a target, or moves to a performance activity.

Numbers for an interview: 9 AI cases → 1 deleted, 3 merged, 4 rewritten, 1 turned into a question, and 9 new cases added.`,
      followUps: [
        {
          q: 'How would you prompt the AI to get closer to your reviewed list next time?',
          a: 'Paste the actual flow and messages, list what the app does NOT have (no email, no postal-code rule), require categories including state, permissions and accessibility, require specific expected results with exact texts, and ask for an Open questions list instead of invented rules. Then I would still review, but with much less rework.',
        },
        {
          q: 'Which of these would you automate first?',
          a: 'CO-01 (happy path) as a smoke test, CO-02..CO-04 as a data-driven validation test, CO-05 for price calculation, and CO-08/CO-12 because state and permission regressions are easy to miss manually. Accessibility checks can start with an automated scan plus a manual keyboard pass.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-cc-2',
      title: 'Fix the AI-written cart total helper',
      context:
        'Your Playwright test reads cart rows from a QA Shop page and calls a helper to compute the expected order summary, then compares it with what the overview page shows. The helper was written by an AI assistant and "looks fine". The test keeps failing or passing for the wrong reasons.',
      task: 'Fix `calculateCartTotal(items, promo)` so it follows the spec. `items` is an array of `{ name, price, qty }` where `price` is page text like `\'$29.99\'` or `\'$1,299.00\'`. Spec: subtotal = sum of price × qty; promo `SAVE10` gives 10% off the subtotal and must be matched ignoring case and surrounding spaces (any other code gives no discount); tax = 8% of (subtotal − discount); total = subtotal − discount + tax. Round **each** of subtotal, discount, tax and total to 2 decimals (cents) as you compute them. Return `{ subtotal, discount, tax, total }`. Empty cart → all zeros. Press Run to check.',
      starter: {
        language: 'javascript',
        title: 'cartTotal.js (AI-generated)',
        code: `// Generated by an AI assistant: "computes the order summary"
function calculateCartTotal(items, promo) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += parseFloat(item.price.replace('$', ''));
  }
  const discount = promo === 'SAVE10' ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;
  return { subtotal, discount, tax, total };
}

// calculateCartTotal([{ name: 'Backpack', price: '$29.99', qty: 1 },
//                     { name: 'Bike Light', price: '$9.99', qty: 1 }], '')
// → { subtotal: 39.98, discount: 0, tax: 3.1984, total: 43.178399999999996 }`,
      },
      hints: [
        'Look at the example output: what does the page show for tax and total, and what does the helper return? Floating-point maths needs rounding to cents.',
        'Read the spec again for qty and the promo rule. Does the loop use qty? What happens with "save10" or " SAVE10 "?',
        'What does parseFloat("1,299.00") return? Strip both "$" and "," before converting, and prefer Number() so bad text gives NaN instead of a partial number.',
      ],
      solution: {
        language: 'javascript',
        title: 'cartTotal.js (reviewed)',
        code: `function toCents(n) {
  return Math.round(n * 100) / 100;          // 3.1984 → 3.2
}

function parsePrice(text) {
  const n = Number(String(text).replace(/[$,\\s]/g, ''));   // '$1,299.00' → 1299
  if (Number.isNaN(n)) throw new Error('Not a price: "' + text + '"');
  return n;
}

function calculateCartTotal(items, promo) {
  const rawSubtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.price) * (item.qty ?? 1),
    0,
  );
  const subtotal = toCents(rawSubtotal);
  const code = (promo ?? '').trim().toUpperCase();          // ' save10 ' → 'SAVE10'
  const discount = code === 'SAVE10' ? toCents(subtotal * 0.1) : 0;
  const tax = toCents((subtotal - discount) * 0.08);
  const total = toCents(subtotal - discount + tax);
  return { subtotal, discount, tax, total };
}

// calculateCartTotal([{ name: 'Bolt T-Shirt', price: '$15.99', qty: 3 }], '')
// → { subtotal: 47.97, discount: 0, tax: 3.84, total: 51.81 }`,
      },
      explanation: `**The AI bugs, one by one:**

1. **Quantity ignored.** The loop adds each price once, so 3 × $15.99 is counted as $15.99. AI code often handles the "obvious" field and forgets the rest of the spec.
2. **Case- and whitespace-sensitive promo.** \`promo === 'SAVE10'\` fails for "save10" and " SAVE10 ". Normalise with \`trim().toUpperCase()\`.
3. **No rounding.** \`0.1\`, \`0.08\` and decimal prices give floating-point tails like \`43.178399999999996\`, which never equals the page's \`$43.18\`. Round to cents at each step, as the spec says (that's also how most shops compute it).
4. **Thousands separator.** \`parseFloat('1,299.00')\` returns \`1\`: it stops at the comma without an error. Strip \`$\` and \`,\` and use \`Number()\`, which returns \`NaN\` for leftovers, and throw on \`NaN\`.

**Lesson:** the AI helper looked tidy and worked for a single cheap item. Only tests with quantities, promo variants, larger prices and exact cents exposed it. Review AI code against the *spec*, not against "does it run".`,
      fnName: 'calculateCartTotal',
      tests: [
        { args: [[{ name: 'Backpack', price: '$29.99', qty: 1 }, { name: 'Bike Light', price: '$9.99', qty: 1 }], ''], expected: { subtotal: 39.98, discount: 0, tax: 3.2, total: 43.18 } },
        { args: [[{ name: 'Bolt T-Shirt', price: '$15.99', qty: 3 }], ''], expected: { subtotal: 47.97, discount: 0, tax: 3.84, total: 51.81 } },
        { args: [[{ name: 'Backpack', price: '$29.99', qty: 1 }, { name: 'Fleece Jacket', price: '$49.99', qty: 1 }], 'SAVE10'], expected: { subtotal: 79.98, discount: 8, tax: 5.76, total: 77.74 } },
        { args: [[{ name: 'Fleece Jacket', price: '$49.99', qty: 2 }], 'save10'], expected: { subtotal: 99.98, discount: 10, tax: 7.2, total: 97.18 } },
        { args: [[], 'SAVE10'], expected: { subtotal: 0, discount: 0, tax: 0, total: 0 } },
        { args: [[{ name: 'Backpack', price: '$29.99', qty: 2 }], 'SAVE50'], expected: { subtotal: 59.98, discount: 0, tax: 4.8, total: 64.78 } },
        { args: [[{ name: 'Onesie', price: '$7.99', qty: 1 }], ' SAVE10 '], expected: { subtotal: 7.99, discount: 0.8, tax: 0.58, total: 7.77 }, hidden: true },
        { args: [[{ name: 'Laptop', price: '$1,299.00', qty: 1 }], ''], expected: { subtotal: 1299, discount: 0, tax: 103.92, total: 1402.92 }, hidden: true },
      ],
      followUps: [
        {
          q: 'Should a test compute the expected total with the same logic as the app?',
          a: 'Be careful: if the helper copies the app\'s formula, a wrong formula passes in both places. It is better to have a few cases with hand-calculated expected values from the spec (like these tests), and use a helper only for generated or dynamic data. The helper itself also needs tests, which is what this lab is.',
        },
        {
          q: 'How would you ask an AI assistant to write this helper so it has fewer bugs?',
          a: 'Paste the full spec (qty, promo rules, rounding per step, price formats like "$1,299.00"), ask for the function plus a list of edge cases it handled, and ask it to write unit tests with hand-computed values. Then I run the tests and read the code against the spec anyway, because the AI can write tests that agree with its own bug.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'ai-daily-qa-iq-1',
      difficulty: 'easy',
      question: 'How do you use AI in your testing?',
      whatInterviewerLooksFor: [
        'Concrete, specific uses (not "I use ChatGPT for everything")',
        'A review/verification step for each use',
        'Data privacy awareness',
        'A measurable example of value added',
      ],
      modelAnswer: `I use it as a **drafting and thinking partner**, never as the final decision-maker.

**Where it helps me most:**

1. **Test design:** I paste the user story and acceptance criteria and ask for scenarios grouped by positive, negative, boundary, state and permissions, with an "Open questions" list. I write my own top risks first, then compare.
2. **Test data:** synthetic data with edge cases (apostrophes, unicode, long strings, boundaries) for forms and API bodies, saved in the repo so runs are repeatable.
3. **Bug reports:** I paste my rough notes and ask for a clean structure, telling it to use only my facts and mark unknowns.
4. **Automation:** boilerplate Playwright code and locator ideas from an IDE assistant, then I review it against a checklist: role-based locators, no hard waits, real assertions, \`await\` everywhere, no hard-coded credentials.
5. **Debugging:** explaining an unfamiliar error or stack trace, after masking secrets, then I confirm in the trace.

**What I never do:** paste customer data, credentials or confidential code into a non-approved tool; commit AI output without review.

**Example:** for a checkout story the AI gave 18 cases in a minute. My review removed 2 invented rules (an email confirmation that doesn't exist) and 3 duplicates, and added 6 cases for Cancel/Back state, logged-out access and keyboard use. Drafting took 10 minutes instead of an hour, and the review is what made it good.`,
      followUps: [
        {
          q: 'Which tool do you use and why?',
          a: 'Whatever my company approves; I care more about the process than the brand. Typically a chat assistant (ChatGPT, Claude or Gemini) for test design and writing, and GitHub Copilot or a similar IDE assistant for code because it sees the files I am editing. I use the business plan the company provides, not a personal account, for anything work-related.',
        },
        {
          q: 'Has AI ever given you something wrong that you caught?',
          a: 'Yes, often small things: a Playwright assertion named toBeDisplayed that does not exist, an API field name that was not in the schema, a test case asserting a 6-digit postal code rule that was not in the story. I caught them by running the code, checking the schema, and tracing each case to an acceptance criterion.',
        },
      ],
      pitfalls: [
        'Vague: "I use ChatGPT to write test cases" with no review step',
        'Admitting you paste production data or logs unmasked',
        'Overclaiming: "AI writes all my automation"',
      ],
    },
    {
      id: 'ai-daily-qa-iq-2',
      difficulty: 'medium',
      question: 'What do you check before using AI-generated test cases?',
      whatInterviewerLooksFor: [
        'A structured review checklist',
        'Knows the typical AI gaps (negative, boundary, state, permissions, non-functional)',
        'Catches invented requirements and vague expected results',
        'Traceability to requirements',
      ],
      modelAnswer: `I review them like a colleague's draft, with a checklist:

1. **Traceability:** does every case map to an acceptance criterion? Anything that doesn't is either an invented rule (delete) or a real gap (turn into a question for the PO).
2. **Correct facts:** exact error texts, field names, URLs and limits match the story, the design or the running app, not "typical" values the AI guessed.
3. **Testable expected results:** "should work correctly" gets rewritten into something that can pass or fail: which message, where, what else stays unchanged.
4. **Coverage gaps:** AI tends to over-produce happy paths. I specifically check for:
   - **negative** (invalid, empty, wrong format)
   - **boundary** (min/max, 0, just above/below)
   - **state** (refresh, back button, cancel, session timeout, two tabs)
   - **permissions** (logged out, other roles, other users' data)
   - **non-functional** (keyboard/screen reader, double-submit, slow network)
5. **Duplicates:** merge cases that differ only in wording.
6. **Data safety:** test data is synthetic, no real emails or card numbers.
7. **Priority:** I mark which ones go into smoke/regression and which are one-time exploratory checks.

Only after that do the cases go into our test management tool, with me as the owner.`,
      followUps: [
        {
          q: 'How long does this review take compared to writing cases yourself?',
          a: 'For a typical story, drafting with AI plus review is usually faster than writing from scratch, maybe half the time, but the review is not optional. If the AI output needs heavy rework (wrong domain, many invented rules), I improve the prompt or write the cases myself; AI is only worth it when the review is lighter than the writing.',
        },
        {
          q: 'Why are state and permission cases so often missing?',
          a: 'Because they are rarely written in the story. The model mostly transforms the text it is given, and stories describe the happy flow of one user. State and permission bugs come from sequences (back, refresh, cancel) and from other users or roles, which require imagining the system over time, exactly where tester thinking adds value.',
        },
      ],
      pitfalls: [
        'Only checking spelling/format',
        'Keeping invented rules because they "sound reasonable"',
        'No mention of traceability or missing categories',
      ],
    },
    {
      id: 'ai-daily-qa-iq-3',
      difficulty: 'medium',
      question: 'A teammate opens a pull request with Playwright tests generated by Copilot. What do you look for in the review?',
      whatInterviewerLooksFor: [
        'Knows the common AI code smells',
        'Checks assertions first',
        'Mentions running/repeating the tests',
        'Constructive team approach (rules in instructions, templates)',
      ],
      modelAnswer: `The same review as any test code, with extra attention to patterns AI tends to produce.

**First pass: does it actually test something?**
- I read the **assertions** first. A test that only clicks through a flow passes even when the feature is broken. I expect \`await expect(...)\` on the real outcome: URL, confirmation text, cart count, API response.

**Second pass: the AI smell checklist**
- **Hard waits:** \`waitForTimeout\` → replace with web-first assertions.
- **Brittle locators:** long CSS chains, \`nth-child\`, XPath → \`getByRole\`, \`getByLabel\`, \`getByPlaceholder\`, \`getByTestId\`.
- **Missing \`await\`** on actions or \`expect\`.
- **Hard-coded credentials and URLs** → \`process.env\` and \`baseURL\` in config.
- **Invented APIs** (\`toBeDisplayed\`, \`getText\`, \`waitForElementVisible\`).
- **\`isVisible()\` used as an assertion**, \`if\` branches around elements.
- **Shared state:** tests relying on a previous test's data or order.

**Third pass: run it**
- Run locally, then with \`--repeat-each\` to catch flakiness, and check it fails when it should (break the expected text and see it go red).

**Then fix the cause:** I'd suggest adding our conventions to the Copilot instructions file so future suggestions follow our locator and waiting rules.`,
      followUps: [
        {
          q: 'How do you check that a test can actually fail?',
          a: 'Temporarily break the expectation (assert a wrong text or count) or point it at a scenario where the feature is broken, and confirm it goes red with a useful message. A test that stays green when the expected value is wrong is not checking anything. This "make it fail once" habit is especially useful for AI-written tests.',
        },
        {
          q: 'Would you reject a PR just because it was AI-generated?',
          a: 'No. The origin does not matter; the quality does. I review AI-generated code with the same standards, perhaps a bit more carefully because it can look polished while having subtle issues. If it meets the standards, it gets approved like any other PR.',
        },
      ],
      pitfalls: [
        'Approving because "it passes"',
        'Not reading the assertions',
        'Refusing AI code on principle instead of reviewing it',
      ],
    },
    {
      id: 'ai-daily-qa-iq-4',
      difficulty: 'medium',
      question: 'How would you use AI to generate test data for a signup form, safely?',
      context: 'Form fields: full name, email, mobile number, date of birth (18+ only), password (8–64 chars).',
      whatInterviewerLooksFor: [
        'Synthetic data only, no real data in',
        'Explicit edge cases and boundaries',
        'Validates the generated data',
        'Saves data for repeatability',
      ],
      modelAnswer: `**Prompt:** I'd describe the fields and rules, not paste real users: "Generate synthetic signup test data as JSON. Include valid rows and labelled invalid rows. Use only example.com or .test email domains. Cover: names with apostrophes, hyphens, accents and non-Latin scripts; very short and very long names; emails with plus-addressing and subdomains; invalid emails; mobile numbers in valid and invalid formats; DOB exactly 18 today, one day short of 18, very old; passwords of 7, 8, 64 and 65 characters."

**What I check in the output:**
- **Labels:** every row has a purpose ("boundary-dob-18-today") so the expected result is obvious.
- **Correctness:** AI often gets date arithmetic wrong (the "18 today" row must be computed from the run date, so I'd rather compute DOB in code relative to today than hard-code it).
- **Formats:** phone and postal formats really match our rules.
- **Safety:** no real-looking emails on real domains, no real people.

**Then:** store it as a JSON/CSV fixture in the repo and drive a data-driven Playwright test from it. I don't regenerate data each run, because AI output varies and tests must be repeatable.

**Never:** paste production user records "to make similar ones". That's a data leak regardless of how good the tool is.`,
      followUps: [
        {
          q: 'Why compute the date-of-birth boundaries in code instead of using AI-generated dates?',
          a: 'Because the boundary depends on today\'s date. A hard-coded "turns 18 today" date is only correct on one day, and the test becomes wrong tomorrow. Calculating the date in the test (today minus 18 years, and minus 18 years plus one day) keeps the boundary correct forever. AI is also unreliable at date arithmetic.',
        },
        {
          q: 'Are AI-generated names "safe" if they might match a real person?',
          a: 'A random realistic name matching a real person is not a privacy problem by itself, because no real personal record is attached. The risk is real combinations (name + real email + real phone). Using reserved email domains, fake phone ranges and clearly synthetic data avoids that, and some teams add a prefix like "QA-" to names for easy cleanup.',
        },
      ],
      pitfalls: [
        'Pasting real customer rows as examples',
        'Trusting AI date calculations for age boundaries',
        'Regenerating data on every CI run',
      ],
    },
    {
      id: 'ai-daily-qa-iq-5',
      difficulty: 'medium',
      question: 'Your Playwright test fails with an error you don\'t understand. How would you use AI to help, and what would you check yourself?',
      whatInterviewerLooksFor: [
        'Gives AI precise inputs (exact error, code, context, attempts)',
        'Asks for ranked hypotheses with ways to confirm',
        'Uses the trace viewer / reproduction to verify',
        'Masks secrets',
      ],
      modelAnswer: `**First, my own 2-minute look:** read the error line and open the **trace** (or screenshot/video) to see what the page looked like at failure time. Often that already answers it.

**If I'm still stuck, I ask AI with complete information:**
- the **exact** error message and the line it points to
- the test code and the page object it uses (not the whole repo)
- expected vs actual behaviour, and where it fails (local/CI, which browser, always or sometimes)
- what I've already tried
- the ask: "Explain in simple words, list the 3 most likely causes ranked, and how I can confirm each."

**Example:** \`strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements\` on SauceDemo. AI explains that the locator matches every product's button and suggests filtering by the product card. I confirm the count in the error output, apply \`.filter({ hasText: 'Sauce Labs Backpack' })\`, and re-run.

**What I check myself:** things AI can't see: the DOM at failure time (trace), CI-specific differences (environment variables, base URL, slower machines), shared test data, and the Playwright version. I also make sure the "fix" doesn't just hide the problem (for example, adding \`waitForTimeout\` or \`.first()\` everywhere).

**Safety:** no tokens, cookies or customer data in what I paste.`,
      followUps: [
        {
          q: 'The AI suggests adding waitForTimeout(5000). What do you say?',
          a: 'I would not accept that. A hard wait slows the suite and only hides a timing issue, which comes back on a slower CI machine. I would look for the real condition to wait for and use a web-first assertion like await expect(locator).toBeVisible() or toHaveText, which retries automatically, or wait for the relevant network response.',
        },
        {
          q: 'It only fails in CI. Can AI help there?',
          a: 'It can suggest typical CI causes: different base URL or environment variables, headless rendering differences, slower machines exposing race conditions, parallel tests sharing data. But I verify with the CI artifacts: the trace with trace: \'on-first-retry\', screenshots, logs. The AI provides a checklist; the evidence comes from the run.',
        },
      ],
      pitfalls: [
        'Paraphrasing the error instead of copying it exactly',
        'Accepting a waitForTimeout or .first() "fix" without understanding',
        'Never opening the trace',
      ],
    },
    {
      id: 'ai-daily-qa-iq-6',
      difficulty: 'easy',
      question: 'Which AI tools have you used for QA work, and how do they compare?',
      whatInterviewerLooksFor: [
        'Distinguishes chat assistants from IDE assistants',
        'Talks about use cases, not brand loyalty',
        'Mentions enterprise/privacy considerations',
        'Avoids made-up feature or pricing claims',
      ],
      modelAnswer: `I think of them in two groups.

**Chat assistants: ChatGPT, Claude, Gemini**
- Best for **thinking and writing**: test scenarios from a story, reviewing a test plan, rewriting a bug report, explaining an error, generating synthetic test data.
- All three are capable; in my experience the difference matters less than the **prompt and context** I give. Gemini is convenient when the spec lives in Google Docs because it's built into Workspace; Claude and ChatGPT are good for long documents and code explanations.

**IDE assistants: GitHub Copilot (and similar)**
- Best for **writing code where it lives**: autocomplete for Playwright steps, chat about the open file, refactoring a page object, multi-file edits in agent mode.
- It sees my project files, so suggestions follow the existing style more closely, but it also copies bad patterns that are already in the codebase.

**What matters more than the brand:**
- Using the **company-approved plan** (business/enterprise plans give admin control over data and features).
- A **review step** for everything it produces.
- Shared **prompt templates** and assistant instruction files so the team gets consistent output.

I don't try to memorise feature lists or prices; they change every few months.`,
      followUps: [
        {
          q: 'Have you used any AI features built into Playwright itself?',
          a: 'I know Playwright now has Test Agents (planner, generator and healer, set up with npx playwright init-agents) and Playwright MCP, which lets an AI assistant control a browser using the page\'s accessibility tree. I see these as the next step after mastering the basics; the same review rules apply to whatever they generate.',
        },
        {
          q: 'What does "agent mode" mean in an IDE assistant?',
          a: 'Instead of suggesting one snippet, the assistant takes a goal ("add a test for the login error") and works through several steps: reading files, editing multiple files, running commands, then presenting the changes for my approval. It saves time but produces bigger changes, so reviewing the diff carefully is even more important.',
        },
      ],
      pitfalls: [
        'Quoting specific prices or model versions that may be outdated',
        '"Tool X is the best, the others are useless"',
        'Mentioning a personal account for company work',
      ],
    },
    {
      id: 'ai-daily-qa-iq-7',
      difficulty: 'hard',
      question: 'Your manager wants the team to "use AI to double test productivity". How would you introduce it and how would you know if it is working?',
      whatInterviewerLooksFor: [
        'Starts with policy and an approved tool',
        'Picks specific, low-risk use cases first',
        'Defines measurable outcomes (not just "feels faster")',
        'Watches for quality risks (escaped bugs, flaky AI tests)',
      ],
      modelAnswer: `**1. Guardrails first**
- Confirm the company AI policy and an approved tool/plan. Agree on what never goes in: customer data, secrets, confidential code.

**2. Start small with clear use cases**
- Test scenario drafts from stories, bug-report clean-up, synthetic test data, Playwright boilerplate with review.
- Create **shared prompt templates** and an **instruction file** for the coding assistant with our conventions (role-based locators, no hard waits, assertions required).

**3. Keep quality gates unchanged**
- AI-written tests go through the same PR review. Test cases still need traceability to requirements.

**4. Measure for a few sprints, before vs after**
- Time from story "ready" to test cases reviewed
- Time to automate a typical test
- Review comments per AI-assisted PR (rework)
- Flaky test rate of new tests
- Escaped defects in areas where AI drafted the tests

**5. Adjust**
- If rework is high in some area, improve the prompts or stop using AI there. If a use case clearly saves time with stable quality, make it standard.

**Expectations:** "double" is unlikely across the board. Drafting gets much faster; review, exploratory testing and debugging don't shrink as much. I'd report honest numbers and let the data decide.`,
      followUps: [
        {
          q: 'What is a warning sign that AI is hurting quality?',
          a: 'Rising flaky-test rate in newly added tests, more escaped bugs in features where test cases were AI-drafted, PRs with many review comments about the same smells (hard waits, missing assertions), or test cases full of invented rules. Any of these means the review step is being skipped or the prompts need work.',
        },
        {
          q: 'How do you keep junior testers learning when AI writes the first draft?',
          a: 'Ask them to write their own top risks before prompting, then compare with the AI output, and to explain every AI-suggested fix in their own words during review. Pairing on reviews of AI output is a great teaching tool, because spotting what the AI missed is exactly the skill we want them to build.',
        },
      ],
      pitfalls: [
        'Rolling out without checking the AI policy',
        'Measuring only "number of test cases generated"',
        'Removing review steps to "save time"',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'ai-daily-qa-drill-1',
      question:
        'An AI tool returned 12 test cases for the SauceDemo login page. Classify them, count what is missing per category, and estimate the reviewed total. Cases: valid login ×3 (standard_user, problem_user, performance_glitch_user), wrong password, empty username, empty password, empty both, locked_out_user, "Remember me keeps me logged in", "password must be 8+ chars", "login is fast", "SQL injection in username".',
      assumptions: [
        'Target categories: positive, negative, boundary, state/navigation, permissions, non-functional',
        'SauceDemo has no "Remember me" and no password-length rule on the login page',
        'You want at least 2 cases in each category that applies',
      ],
      steps: [
        { label: 'Positive', calc: '3 valid logins → keep 1 as main + data-drive the other users: 3 (OK)' },
        { label: 'Negative', calc: 'wrong password, empty username, empty password, empty both, locked_out_user, SQL-like input → 6 (OK)' },
        { label: 'Invented', calc: '"Remember me" and "8+ chars" → 2 to delete (or Open questions)' },
        { label: 'Vague', calc: '"login is fast" → rewrite with a measurable target or move to performance: 1 to rewrite' },
        { label: 'Boundary missing', calc: 'very long username, whitespace-only/leading spaces → add 2' },
        { label: 'State missing', calc: 'Back button after logout, refresh after login, error clears when typing → add 3' },
        { label: 'Permissions missing', calc: 'open /inventory.html while logged out → add 1 (+1 for direct cart URL) = 2' },
        { label: 'Non-functional missing', calc: 'password masked, keyboard-only login (Enter submits) → add 2' },
        { label: 'Total', calc: '12 − 2 deleted = 10 kept (1 rewritten) + 9 added = 19 reviewed cases' },
      ],
      answer:
        'Of 12 AI cases, **10 are usable** (1 needs rewriting), **2 are invented**. **9 cases are missing**: 2 boundary, 3 state, 2 permissions, 2 non-functional. The reviewed set has about **19 cases**, so the AI covered roughly half of what a good tester would test, mostly the positive/negative half.',
      insight:
        'AI is strong on the categories the story text describes (valid/invalid input) and weak on sequences, roles and quality attributes. Counting gaps per category turns a vague "AI missed stuff" into a clear interview story.',
      followUps: [
        {
          q: 'Which missing case is the highest risk and why?',
          a: 'The permissions case (opening /inventory.html while logged out), because an access-control bug exposes pages to unauthenticated users, which is a security issue. State issues like Back after logout are also important for the same reason: they can show a logged-in page to the next person on a shared computer.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-drill-2',
      question:
        'Review this AI-generated Playwright test against the 8-point checklist and count the issues: `test(\'add to cart\', async ({ page }) => { await page.goto(\'https://www.saucedemo.com\'); await page.fill(\'#user-name\', \'standard_user\'); await page.fill(\'#password\', \'secret_sauce\'); await page.click(\'#login-button\'); await page.waitForTimeout(2000); page.click(\'//div[@class="inventory_list"]/div[1]//button\'); const visible = await page.locator(\'.shopping_cart_badge\').isVisible(); console.log(visible); });`',
      assumptions: [
        'Checklist: hard waits, brittle CSS/XPath, missing assertions, missing await, hard-coded credentials/URLs, invented APIs, isVisible as assertion, shared state',
        'page.fill and page.click exist but locator-based actions are the recommended style',
      ],
      steps: [
        { label: 'Hard wait', calc: 'waitForTimeout(2000) → 1 issue' },
        { label: 'Brittle locators', calc: 'positional XPath div[1]//button (and id-based CSS instead of user-facing locators) → 1 issue' },
        { label: 'Missing await', calc: 'page.click(...) on the XPath line has no await → 1 issue' },
        { label: 'Hard-coded secrets/URL', calc: 'password literal and full URL instead of env + baseURL → 1 issue' },
        { label: 'isVisible as check + no assertion', calc: 'isVisible() result only logged; nothing can fail → 2 issues (no real assertion; isVisible does not retry)' },
        { label: 'Invented APIs / shared state', calc: 'none here → 0' },
        { label: 'Total', calc: '6 issues across 5 checklist items' },
      ],
      answer:
        '**6 issues**: hard wait, brittle positional XPath, missing `await`, hard-coded password/URL, `isVisible()` used instead of a web-first assertion, and **no assertion at all** (the test passes even if nothing is added to the cart). Fixed core: `await expect(page.locator(\'.shopping_cart_badge\')).toHaveText(\'1\')` after clicking the product\'s "Add to cart" button found via `filter({ hasText })` + `getByRole`.',
      insight:
        'The most dangerous issue is the quiet one: a test without a real assertion is green forever. Always read assertions first when reviewing AI code.',
      followUps: [
        {
          q: 'Why is the missing await especially bad here?',
          a: 'The click starts but the test does not wait for it, so the next line may read the badge before the click happens, and if the click fails its error may surface late or not at all. Combined with no assertion, the test passes regardless. Linters like the no-floating-promises rule catch missing awaits automatically.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-drill-3',
      question:
        'Plan an AI-assisted test data set for the QA Shop "shipping address" form (name, street, city, postal code, phone). Decide how many rows per purpose, which rows AI should generate and which you compute yourself, and how you keep it safe.',
      assumptions: [
        'Rules: all fields required; name 2–60 chars; postal code 6 digits (India format); phone 10 digits starting 6–9',
        'You want a data-driven Playwright test with one row per purpose',
        'No real customer data may be used',
      ],
      steps: [
        { label: 'Valid rows', calc: 'typical address, name with apostrophe/accent, long-but-valid street, non-Latin name → 4 (AI can generate)' },
        { label: 'Boundary rows', calc: 'name 1, 2, 60, 61 chars → 4 (compute in code with "a".repeat(n) for exact lengths)' },
        { label: 'Postal/phone format rows', calc: '5 and 7 digits, letters, phone starting 5, phone 9/11 digits → 6 (AI drafts, you verify each against the rule)' },
        { label: 'Required-field rows', calc: 'each field empty → 5 (simple, write yourself)' },
        { label: 'Robustness rows', calc: 'whitespace-only, leading/trailing spaces, HTML-like text, emoji → 4' },
        { label: 'Total', calc: '4 + 4 + 6 + 5 + 4 = 23 rows, each labelled with purpose and expected outcome' },
        { label: 'Safety', calc: 'describe the format only; obviously fake names/streets; phone numbers not belonging to real people where possible; store as fixture in repo' },
      ],
      answer:
        'About **23 labelled rows**: AI is useful for the **realistic and tricky-string rows** (valid variety, robustness), while **exact boundaries** are safer computed in code (`\'a\'.repeat(60)`) and **required-field rows** are trivial to write yourself. Every AI row is checked against the rule before it is saved as a fixture.',
      insight:
        'Use AI where variety and realism matter, and code where precision matters. Labelling each row with its purpose is what makes the expected results unambiguous.',
      followUps: [
        {
          q: 'An AI-generated "valid" postal code is 5 digits. What do you do?',
          a: 'It is invalid under our rule, so I move it to the invalid-format group with the right label (or delete it if I already have that case). This is exactly why I verify every generated row against the rule; AI often mixes formats from different countries.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'ai-daily-qa-mcq-01',
      difficulty: 'easy',
      question: 'Which categories are AI-generated test case lists most likely to under-cover? Select ALL that apply.',
      options: [
        'State and navigation (Back, refresh, Cancel, re-login)',
        'Permissions and roles (logged out, other users)',
        'The main happy path described in the story',
        'Non-functional checks (keyboard use, double-submit, performance)',
      ],
      correct: [0, 1, 3],
      explanation:
        'Models largely transform the story text, which usually describes one user\'s successful flow, so happy paths are well covered. State sequences, other roles and quality attributes are rarely written in the story, so they are commonly missing and need the tester\'s review.',
      followUps: [
        {
          q: 'How could you prompt for those categories explicitly?',
          a: 'Ask for scenarios grouped under named headings (Positive, Negative, Boundary, State/navigation, Permissions, Non-functional) with a minimum per heading. Even then, review, because the model may fill a heading with weak or invented ideas just to satisfy the format.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-02',
      difficulty: 'easy',
      question: 'What is the most serious problem with this AI-generated test?',
      code: {
        language: 'typescript',
        title: 'ai-cart.spec.ts',
        code: `test('add backpack to cart', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.locator('.inventory_item')
    .filter({ hasText: 'Sauce Labs Backpack' })
    .getByRole('button', { name: 'Add to cart' })
    .click();
  await page.locator('.shopping_cart_link').click();
});`,
      },
      options: [
        'It has no assertion, so it passes even if the item is never added',
        'filter({ hasText }) is not a real Playwright method',
        'page.goto must always use a full URL',
        'getByRole cannot be chained after a locator',
      ],
      correct: [0],
      explanation:
        'The test only performs actions; nothing checks the cart badge or the cart contents, so a broken add-to-cart feature still passes. `filter({ hasText })` and chaining `getByRole` on a locator are real APIs, and a relative URL is fine when `baseURL` is configured.',
      followUps: [
        {
          q: 'Which assertions would you add?',
          a: 'After adding: await expect(page.locator(\'.shopping_cart_badge\')).toHaveText(\'1\'). After opening the cart: await expect(page.locator(\'.cart_item\')).toHaveCount(1) and toContainText(\'Sauce Labs Backpack\'). That checks both the badge and the cart content.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-03',
      difficulty: 'medium',
      question: 'Review this AI-generated snippet. Which problems are present? Select ALL that apply.',
      code: {
        language: 'typescript',
        title: 'ai-login.spec.ts',
        code: `test('login', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.locator('//input[@id="user-name"]').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});`,
      },
      options: [
        'Missing await on the click',
        'Hard-coded password in the test',
        'XPath locator where a user-facing locator would do',
        'toHaveURL does not accept a regular expression',
        'There is no assertion in the test',
      ],
      correct: [0, 1, 2],
      explanation:
        'The click is not awaited, the password is in source code instead of an environment variable, and the XPath could be `getByPlaceholder(\'Username\')`. `toHaveURL` does accept a RegExp, and there is an assertion (`toHaveURL`), so those two options are wrong.',
      followUps: [
        {
          q: 'Why might this test still pass despite the missing await?',
          a: 'toHaveURL retries for up to 5 seconds, and the un-awaited click usually completes in that time, so the race is often won. That is exactly why it is dangerous: it passes most of the time and fails occasionally, especially on slower CI machines.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-04',
      difficulty: 'medium',
      question: 'You asked AI to clean up your bug notes. Which part of its output should you remove before filing?',
      code: {
        language: 'text',
        title: 'ai-bug-report.txt',
        code: `Title: Discount disappears from cart after returning from checkout
Steps: 1) Add 2 items 2) Apply SAVE10 3) Checkout 4) Back to cart
Expected: Discount still applied
Actual: Discount removed; total unchanged
Root cause: Session cache invalidated by checkout service
Severity: Critical`,
      },
      options: [
        'The root cause and severity lines that you did not provide',
        'The numbered steps',
        'The Expected and Actual lines',
        'The title, because AI titles are always too long',
      ],
      correct: [0],
      explanation:
        'The root cause is an unverified guess and severity is a judgement you or the team must make; the AI added both. The steps, expected and actual came from your notes and are useful structure. The title here is clear and specific, so there is no reason to remove it.',
      followUps: [
        {
          q: 'How do you stop the AI from adding facts next time?',
          a: 'Tell it explicitly: "Use only facts from my notes; write UNKNOWN for missing fields; do not guess root cause or severity." Then still read the output line by line, because it may slip in assumptions anyway.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-05',
      difficulty: 'easy',
      question: 'You want suggestions as you type Playwright code inside VS Code, using the files in your project. Which kind of tool fits best?',
      options: [
        'An IDE assistant such as GitHub Copilot',
        'A general chat app in a browser tab, pasting one file at a time',
        'A spreadsheet with a list of locator examples',
        'An image-generation model',
      ],
      correct: [0],
      explanation:
        'IDE assistants work where you type and can use your open files and project context, which suits code completion and refactoring. A chat app works but needs manual copy-paste and has less project context; a spreadsheet is not an assistant; image models do not write code.',
      followUps: [
        {
          q: 'What is a downside of the IDE assistant seeing your codebase?',
          a: 'It tends to copy existing patterns, including bad ones: if the project already has waitForTimeout or XPath locators, suggestions will repeat them. An instruction file with team conventions, plus review, counters that.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-06',
      difficulty: 'medium',
      question: 'Which information should you include when asking AI to explain a failing Playwright test? Select ALL that apply.',
      options: [
        'The exact error message and the failing line',
        'Whether it fails locally, in CI, or only sometimes',
        'What you have already tried',
        'The storageState file so it can log in and check',
      ],
      correct: [0, 1, 2],
      explanation:
        'Exact error text, where and how often it fails, and what you tried let the model give targeted hypotheses. A storageState file contains session cookies, so it is a secret: never paste it, and the model could not use it to "log in" anyway.',
      followUps: [
        {
          q: 'What can the trace show that AI cannot know from your prompt?',
          a: 'The real DOM snapshot at each step, network requests and responses, console errors, timing, and what was on screen when the action failed. The trace is the evidence; the AI explanation is a hypothesis to check against it.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-07',
      difficulty: 'medium',
      question: 'An AI-written helper parses prices from page text. What does it return for `[\'$29.99\', \'$1,299.00\']`?',
      code: {
        language: 'javascript',
        title: 'parsePrices.js',
        code: `function parsePrices(texts) {
  return texts.map((t) => parseFloat(t.replace('$', '')));
}

console.log(parsePrices(['$29.99', '$1,299.00']));`,
      },
      options: ['[29.99, 1]', '[29.99, 1299]', '[NaN, NaN]', '[29.99, NaN]'],
      correct: [0],
      explanation:
        'After removing "$", `parseFloat(\'1,299.00\')` reads digits until the comma and returns 1, silently. 1299 would need the comma removed too; NaN would only happen if the string started with a non-numeric character, which "$" removal prevented. Silent partial parsing is a classic AI-helper bug.',
      followUps: [
        {
          q: 'How would you make the parsing fail loudly instead?',
          a: 'Remove "$" and "," with a regex, convert with Number(), which returns NaN for any leftover junk, and throw an error with the original text if the result is NaN. A loud failure is much better than a wrong number flowing into an assertion.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-08',
      difficulty: 'medium',
      question: 'AI suggests this locator for the "Add to cart" button of the Backpack on SauceDemo. What is the best replacement?',
      code: {
        language: 'typescript',
        title: 'ai-suggestion.ts',
        code: `await page.locator('div.inventory_list > div:nth-child(1) > div.pricebar > button').click();`,
      },
      options: [
        "page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button', { name: 'Add to cart' })",
        "page.locator('div:nth-child(1) button')",
        "page.getByRole('button', { name: 'Add to cart' })",
        "page.locator('//div[1]/div[2]/div[2]/button')",
      ],
      correct: [0],
      explanation:
        'Filtering the product card by its visible name and then finding the button by role is readable and survives layout changes and re-sorting. The shorter nth-child and positional XPath are still position-based, and plain getByRole matches six "Add to cart" buttons, causing a strict mode violation.',
      followUps: [
        {
          q: 'Why is a position-based locator risky on a product list?',
          a: 'The order of products can change (sorting, new products, A/B tests), so "first item" may become a different product. The test then clicks the wrong item, and may even pass while testing the wrong thing. Locating by visible product name ties the test to what the user actually sees.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-09',
      difficulty: 'medium',
      question: 'Which practices make AI-generated test data safe and useful? Select ALL that apply.',
      options: [
        'Describe the data format instead of pasting real records',
        'Use reserved domains like example.com for emails',
        'Regenerate fresh data with AI on every CI run for variety',
        'Label each row with its purpose (valid, boundary, invalid-format)',
      ],
      correct: [0, 1, 3],
      explanation:
        'Describing formats avoids leaking real data, reserved domains avoid emailing real people, and labelled rows make expected results clear. Regenerating with AI on each run makes the suite non-repeatable because output varies; generate once, review, and save the data as a fixture.',
      followUps: [
        {
          q: 'When would random data per run be acceptable?',
          a: 'When you deliberately want variety and the expected result does not depend on the exact values, for example unique emails to avoid "already registered" collisions. Then generate it in code (e.g. a timestamp suffix), log the values used, and keep the boundary and invalid cases fixed.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-10',
      difficulty: 'hard',
      question: 'Why can a missing `await` before `expect(...)` make an AI-generated test unreliable?',
      code: {
        language: 'typescript',
        title: 'ai-finish.spec.ts',
        code: `await page.getByRole('button', { name: 'Finish' }).click();
expect(page.getByRole('heading', { name: 'Thank you for your order!' }))
  .toBeVisible();
// end of test`,
      },
      options: [
        'The assertion runs in the background; the test can finish before it completes, so a failure may be missed or reported confusingly',
        'Without await, toBeVisible checks only once and then always passes',
        'Playwright converts it to a soft assertion automatically',
        'Nothing changes; expect is synchronous for locators',
      ],
      correct: [0],
      explanation:
        'Locator assertions are asynchronous and retry; without await the test does not wait for the result and may end before the assertion settles, hiding or misplacing failures. It does not "always pass", it is not converted to a soft assertion, and locator expects are not synchronous.',
      followUps: [
        {
          q: 'How can you catch this automatically?',
          a: 'Use TypeScript with a lint rule such as @typescript-eslint/no-floating-promises (and Playwright\'s ESLint plugin rules about missing awaits). They flag un-awaited promises in review before the test ever runs.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-11',
      difficulty: 'medium',
      question: 'Your company provides an enterprise AI assistant, but your personal account on another tool gives "better answers". What should you do for work tasks?',
      options: [
        'Use the company-approved tool and raise the quality concern through the proper channel',
        'Use the personal account but delete the chat afterwards',
        'Use the personal account only for code, since code is not personal data',
        'Use whichever tool gives better answers; results are what matter',
      ],
      correct: [0],
      explanation:
        'Approved tools come with agreed data terms and admin controls. Deleting chats afterwards does not undo data sharing, company code is confidential even if it is not personal data, and "results matter" does not override policy and data protection.',
      followUps: [
        {
          q: 'How would you raise the concern constructively?',
          a: 'Collect a few concrete examples where the approved tool performed poorly (with non-sensitive prompts), share them with the lead or the team that owns AI tooling, and suggest a trial of the alternative under a proper business agreement. That turns a complaint into data for a decision.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-12',
      difficulty: 'hard',
      question: 'You ask AI to summarise a 3,000-line application log to find why checkout failed. Which steps make the result trustworthy? Select ALL that apply.',
      options: [
        'Trim to the failing request ID and time window, and mask tokens and emails',
        'Ask the AI to quote the log lines that support its explanation',
        'Reproduce the failure using the suggested cause before reporting it',
        'Accept the explanation if the AI says it is "highly confident"',
      ],
      correct: [0, 1, 2],
      explanation:
        'Focused, masked input reduces noise and risk; quoted evidence lines make the explanation checkable; reproduction turns a hypothesis into a finding. The model\'s stated confidence is just more generated text and does not measure correctness.',
      followUps: [
        {
          q: 'The AI quotes a log line that is not in your log. What does that tell you?',
          a: 'It hallucinated evidence, so the whole explanation is unreliable. I would discard it, re-ask with a smaller, clearly delimited log excerpt, or simply search the log myself for the error and request ID. Always check quoted lines actually exist.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-13',
      difficulty: 'easy',
      question: 'What are Playwright Test Agents?',
      options: [
        'Built-in AI agent definitions (planner, generator, healer) that can plan, write and repair Playwright tests',
        'Background browser processes that run tests in parallel',
        'A paid cloud service required to run Playwright in CI',
        'Another name for Playwright\'s worker fixtures',
      ],
      correct: [0],
      explanation:
        'Playwright Test Agents (added in v1.56, set up with npx playwright init-agents) are a planner that explores and writes a test plan, a generator that turns it into tests, and a healer that tries to fix failing tests. Workers and fixtures are unrelated concepts, and Playwright does not require a paid service.',
      followUps: [
        {
          q: 'Would you trust a test repaired by the healer without review?',
          a: 'No. A healer can make a test pass by changing a locator or expectation, which is correct if the UI changed intentionally but wrong if the app has a bug. Every healed change needs a human to confirm that the new behaviour is the intended one.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-14',
      difficulty: 'medium',
      question: 'An AI-generated test case list for the Restful Booker API is below. Which case is invented and should be removed or turned into a question?',
      code: {
        language: 'text',
        title: 'ai-api-cases.txt',
        code: `API-01 POST /booking with valid body -> 200, response has bookingid
API-02 GET /booking/{id} returns the same firstname and lastname
API-03 DELETE /booking/{id} with token cookie -> then GET returns 404
API-04 POST /booking sends a confirmation SMS to the guest's phone`,
      },
      options: ['API-04', 'API-01', 'API-02', 'API-03'],
      correct: [0],
      explanation:
        'The booking body has no phone field and the API documents no SMS notification, so API-04 is an invented requirement. The other three match real, checkable behaviour: create returns bookingid, GET returns the stored names, and a deleted booking returns 404 afterwards.',
      followUps: [
        {
          q: 'What important negative case is missing from this list?',
          a: 'DELETE (or PUT) without a token, or with an invalid token, should be rejected (in Restful Booker it returns 403 Forbidden). Authorisation checks on modifying endpoints are a classic gap in AI-generated API cases.',
        },
      ],
    },
    {
      id: 'ai-daily-qa-mcq-15',
      difficulty: 'hard',
      question: 'Which measures best show whether AI is really helping your test team? Select ALL that apply.',
      options: [
        'Time from story ready to reviewed test cases, before and after',
        'Rework: review comments or fixes needed on AI-assisted test code',
        'Escaped defects in areas where tests were AI-drafted',
        'The number of test cases the AI generated per week',
      ],
      correct: [0, 1, 2],
      explanation:
        'Speed to a reviewed result, rework, and escaped defects measure both productivity and quality. Raw counts of generated test cases reward volume, and AI can produce many duplicate or invented cases, so that number can rise while quality falls.',
      followUps: [
        {
          q: 'What would you do if speed improved but escaped defects rose?',
          a: 'Treat it as a quality problem: look at which kinds of bugs escaped (often state, permissions or edge cases AI misses), tighten the review checklist and prompts for those categories, and possibly stop using AI for that area until the trend reverses. Speed is not a win if bugs reach users.',
        },
      ],
    },
  ],
};

export default topic;
