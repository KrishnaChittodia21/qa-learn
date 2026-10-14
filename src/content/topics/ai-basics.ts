import type { Topic } from '../../types';

const topic: Topic = {
  id: 'ai-basics',
  phase: 'ai-testing',
  order: 1,
  title: 'AI Basics for Testers',
  subtitle:
    'What AI, generative AI and LLMs really are (in plain words), why they make things up, why the same prompt gives different answers, and how to write prompts that produce test work you can actually use, safely.',
  estimatedMinutes: 75,
  sources: [
    'ISTQB — Certified Tester Specialist Level: Testing with Generative AI (CT-GenAI) v1.1, certification overview page (istqb.org)',
    'ISTQB — Certified Tester AI Testing (CT-AI) v2.0, certification overview page (istqb.org)',
    'Anthropic — Prompt engineering overview and Prompting best practices (platform.claude.com docs)',
    'OpenAI — Prompt engineering guide (developers.openai.com): message roles, few-shot examples, output varies between runs',
    'Google — Gemini API: Prompt design strategies (ai.google.dev): constraints, response format, few-shot, context, temperature',
    'Playwright docs — Test Agents and Getting started with MCP (playwright.dev)',
    'Restful Booker API documentation (restful-booker.herokuapp.com/apidoc) — booking fields and DELETE response',
    'Playwright docs — Test timeouts (expect 5s, test 30s)',
  ],
  tags: ['ai', 'llm', 'generative-ai', 'prompt-engineering', 'hallucination', 'tokens', 'context-window', 'responsible-ai'],
  cheatSheet: [
    'AI ⊃ machine learning ⊃ generative AI ⊃ LLMs. An LLM (ChatGPT, Claude, Gemini, Copilot\'s models) is a text-prediction model trained on huge amounts of text.',
    'An LLM writes one token at a time, each time picking a likely next token. It predicts plausible text; it does not look facts up unless the product gives it a tool (web search, file upload).',
    'Training has a cut-off date: without tools the model does not know your app, your Jira, yesterday\'s Playwright release or your company rules.',
    'Hallucination = confident, fluent, wrong output (invented API fields, non-existent Playwright methods, made-up requirements). Treat every AI answer as a draft to verify.',
    'Verify against a source of truth: the requirement/Jira story, API docs or Swagger, playwright.dev, the running app, a quick test run.',
    'Token ≈ a word piece (rule of thumb ~4 characters of English). The context window = how many tokens the model can see at once (your prompt + files + chat history + its answer).',
    'Long chats and huge specs get truncated or "forgotten" in the middle: split work by feature, restate key rules, start a fresh chat for a new task.',
    'Non-deterministic: same prompt → different answers (sampling/temperature). Never assume a second run gives the same list; compare and merge.',
    'Good prompt = Role + Context + Task + Constraints + Output format + Examples. Then iterate: ask for what is missing, correct mistakes, narrow scope.',
    'Never paste customer data, real credentials, tokens, or confidential code into a public AI tool. Use your company\'s approved tool and follow the AI policy.',
    'You own the output: if an AI-written test case or script is wrong, it is your bug, not the AI\'s.',
    'Advanced, later: RAG, embeddings, agents and evaluation frameworks build on these same basics.',
  ],
  sections: [
    {
      heading: 'AI, generative AI and LLMs in plain words',
      body: `**Intuition:** think of a very well-read autocomplete. Your phone suggests the next word in a message; a large language model does the same thing, but it has read a huge slice of the internet, books and code, so its "suggestions" can be whole test plans.

The terms people mix up in interviews:

| Term | Plain meaning | Testing example |
|---|---|---|
| **AI (artificial intelligence)** | Any software that does something we would call "smart" | A spam filter, a chess engine, a chatbot |
| **Machine learning (ML)** | Software that learns patterns from examples instead of hand-written rules | A model that predicts which tests are likely to fail |
| **Generative AI** | ML that *creates* new content: text, images, code, audio | Writing test cases, generating test data, drafting a bug report |
| **LLM (large language model)** | A generative model for text (and code) | The model behind ChatGPT, Claude, Gemini, GitHub Copilot |

Two things matter most for a tester:

1. **You use AI as a tool** in your own work: drafting test cases, test data, scripts, summaries. (Topic 2 of this phase.)
2. **You test products that contain AI**, such as a support chatbot. (Topic 3 of this phase.)

ISTQB now has separate certifications for these two angles: *CT-GenAI* (testing **with** generative AI) and *CT-AI* (testing **AI-based systems**). You do not need either certificate for a junior role, but the split is a nice way to structure an interview answer.

**In interviews, say this:** "An LLM is a model trained on a lot of text to predict the next piece of text. That makes it great at drafting and summarising, but it doesn't *know* things the way a database does, so I always verify what it gives me."`,
      keyPoints: [
        'LLMs are a kind of generative AI, which is a kind of machine learning, which is a kind of AI.',
        'Testers meet AI in two ways: as a helper tool and as a feature under test.',
        'ISTQB CT-GenAI = testing with GenAI; CT-AI = testing AI-based systems.',
      ],
      source: 'ISTQB — CT-GenAI and CT-AI certification overview pages',
    },
    {
      heading: 'How an LLM generates text',
      body: `**Intuition:** a game of "finish the sentence", played one small piece at a time, extremely fast.

**The mechanics, without maths:**

1. **Training.** The model reads an enormous amount of text and learns which pieces of text tend to follow which. It ends with a **cut-off date**: anything that happened after it is unknown to the model.
2. **Your prompt is split into tokens** (word pieces, see the tokens section).
3. **Next-token prediction.** The model looks at all the tokens so far and produces a list of likely next tokens with probabilities. One is picked, appended, and the loop repeats until the answer is finished.
4. **No live lookup by default.** The model is not querying Jira, your app or playwright.dev while it writes. It only "sees" what is in the prompt plus what it absorbed in training. Some products add **tools** (web search, file upload, running code, browsing via Playwright MCP); then it can fetch real information, but only if that tool is actually used.

**Why this matters for testers**

- The model optimises for **plausible** text, not **true** text. A plausible-but-wrong Playwright method name looks exactly as confident as a real one.
- It does not know **your** system: your field names, your business rules, your test environment URL. If you don't give that context, it guesses from similar systems it has seen.
- It can be out of date: a library changed after the training cut-off and the model still suggests the old way.

**Common mistake:** asking "What does our checkout page do when the promo code expires?" The model has never seen your checkout page. It will still answer, by inventing something typical.`,
      diagram: `  Your prompt: "Write test cases for the SauceDemo login page"
        |
        v
  [split into tokens] -> Write | test | cases | for | the | Sauce | Demo ...
        |
        v
  +-----------------------------+      next-token guesses
  |  LLM (patterns learned from |  ->  "1." 41%   "Test" 22%   "Here" 18% ...
  |  training text, cut-off date)|
  +-----------------------------+
        |  pick one, append, repeat (hundreds of times)
        v
  "1. Valid login with standard_user ..."   <- plausible, not verified`,
      keyPoints: [
        'An LLM produces the next token again and again; the answer is a chain of likely guesses.',
        'Without tools it has no live knowledge of your app, your docs or recent releases.',
        'Plausible is not the same as correct: fluency is not evidence.',
      ],
      source: 'OpenAI / Anthropic / Google prompt-engineering guides (model behaviour overview); ISTQB CT-GenAI ch. 1 outline',
    },
    {
      heading: 'Non-determinism: same prompt, different answers',
      body: `**Intuition:** ask three colleagues to "list test ideas for a coupon field" and you get three overlapping-but-different lists. An LLM behaves like that even when you ask it the same thing twice.

**Why it happens:** at each step the model has several likely next tokens. The product usually **samples** among them instead of always taking the top one. A setting called **temperature** controls how adventurous that sampling is:

| Temperature | Behaviour | Good for |
|---|---|---|
| Low (close to 0) | Picks the most likely tokens; more repeatable, more "boring" | Converting a format, extracting fields, summarising a log |
| Higher | More variety and surprise | Brainstorming unusual test ideas, varied test data |

In chat apps you normally cannot change temperature, and some newer models do not expose it at all. Even at low temperature, answers are **not guaranteed** to be identical.

**What this means in daily work**

- Asking once and trusting the list is risky. Asking twice and **merging** the lists is a cheap way to find more ideas.
- A "fix" that worked once may not come back the same way next time; save the good output (in your test management tool or repo), don't rely on regenerating it.
- When you *test* an AI feature, you cannot assert one exact reply string. You check **rules** the reply must follow (covered in Topic 3).

**In interviews, say this:** "LLM output is non-deterministic, so I treat it as a draft. For brainstorming I run it more than once and merge; for anything that must be repeatable, like test data in a regression suite, I save the result instead of regenerating it."`,
      code: [
        {
          language: 'text',
          title: 'Same prompt, two runs (SauceDemo checkout form)',
          code: `Prompt (both runs): "List 5 negative test ideas for the SauceDemo
checkout form (First Name, Last Name, Postal Code)."

Run 1                                   Run 2
1. Leave First Name empty               1. Submit with all fields empty
2. Leave Last Name empty                2. Postal Code with letters "ABCDE"
3. Leave Postal Code empty              3. First Name of 300 characters
4. Postal Code with special chars       4. Only spaces in Last Name
5. Click Continue twice quickly         5. Emoji in First Name

Merged + reviewed by the tester:
- empty each field one at a time, and all empty    (both runs)
- whitespace-only values                            (run 2 only)
- very long input, emoji, special characters        (both, partly)
- double-click Continue                             (run 1 only)
- NOT suggested by either run: check the exact error text,
  and that the cart is unchanged after the error -> tester adds`,
        },
      ],
      keyPoints: [
        'Sampling + temperature make output vary run to run.',
        'Merge multiple runs for brainstorming; save outputs you want to reuse.',
        'For AI features under test, assert rules and properties, not exact strings.',
      ],
      source: 'Google — Gemini API prompt design strategies (temperature); OpenAI — Prompt engineering guide (output varies between runs)',
    },
    {
      heading: 'Context windows and tokens',
      body: `**Intuition:** the model has a desk of fixed size. Your prompt, any files you paste, the whole chat so far and the answer it is writing must all fit on that desk. When the desk is full, older papers fall off or get skimmed.

**Tokens.** Models don't read words; they read **tokens**, small chunks of text. A common rule of thumb for English is about 4 characters per token, so 100 tokens is roughly 75 words. Code, JSON and non-English text often use more tokens per word.

**Context window.** The maximum number of tokens the model can consider at once (input + output). Different models and plans have very different limits, and companies sometimes set lower limits on their internal tools.

**What goes wrong when you exceed it (or get close)**

- **Truncation:** the tool silently cuts part of your 80-page spec, and the test cases ignore the last chapters.
- **Forgetting earlier chat:** in a very long conversation the model "forgets" the rule you gave an hour ago ("use data-test attributes"), because that message dropped out or got less attention.
- **Lost in the middle:** even inside the limit, details buried in the middle of a long document get less attention than the start and end.

**How a tester works around it**

1. **Split work by feature:** one chat for "login", another for "checkout", instead of the whole SRS at once.
2. **Paste only what matters:** the user story + acceptance criteria + the relevant API schema, not the entire wiki.
3. **Restate key constraints** near the end of the prompt ("Remember: only role-based locators").
4. **Start a fresh chat** for a new task instead of continuing a 200-message thread.
5. **Ask for a checklist of what it used:** "List the acceptance criteria you covered" reveals what it skipped.`,
      code: [
        {
          language: 'text',
          title: 'Rough token budget for one prompt',
          code: `Item pasted into the prompt                 approx words   approx tokens
------------------------------------------  ------------   -------------
Role + task + constraints                   120            ~160
User story + 8 acceptance criteria          400            ~530
OpenAPI snippet for POST /booking (JSON)    600            ~1,000  (JSON is token-heavy)
Example of 2 test cases in our format       150            ~200
Space left for the answer (30 test cases)   2,200          ~3,000
------------------------------------------                 -------------
Total needed                                               ~4,900 tokens

Fine for most tools. Pasting the WHOLE 120-page spec instead
(~54,000 words ≈ 72,000 tokens) may exceed a limited internal tool
or get partly ignored, so split by feature.`,
        },
      ],
      keyPoints: [
        'Token ≈ 4 characters of English (rule of thumb); code and JSON cost more.',
        'Prompt + attachments + history + answer all share one context window.',
        'Split big specs by feature, paste only relevant parts, restate key rules.',
      ],
      source: 'OpenAI / Anthropic / Google prompt-engineering guides (long context, decomposing tasks)',
    },
    {
      heading: 'Hallucinations',
      body: `**Intuition:** a confident new joiner who never says "I don't know". Asked about a system they've never seen, they describe how it *probably* works, in perfect English.

**Definition:** a hallucination is output that sounds correct but is false or unsupported: an invented fact, field, method, requirement or source.

**Why it happens:** the model is predicting likely text. If your prompt asks about something it has no real information about, the most *likely-looking* continuation is still an answer, not "I don't know". Missing context, ambiguous questions and very niche or recent topics make it worse.

**Real testing examples you will meet**

| Where | What the AI said | Reality |
|---|---|---|
| API test cases for Restful Booker | "Assert the response field \`totalAmount\`" | The booking field is \`totalprice\` |
| Playwright script | \`await page.waitForElementVisible('#cart')\` | No such method; use \`await expect(locator).toBeVisible()\` |
| Playwright assertion | \`await expect(title).toBeDisplayed()\` | That is a WebdriverIO-style name; Playwright uses \`toBeVisible()\` |
| Test cases from a story | "Verify the account locks after 5 failed attempts" | The story never mentions locking: an **invented requirement** |
| Bug triage | "This error is caused by a known Chrome 118 bug" | Unverifiable; no link, no evidence |

**How to protect yourself**

- **Give context** (the real story, the real schema) so it has less to guess.
- **Ask it to cite** the line of the story or doc each test case comes from, and to say "not specified" when the source is silent.
- **Verify against a source of truth:** requirement, Swagger/OpenAPI, playwright.dev, the running app, or simply running the code.
- **Be extra careful** with exact numbers, method names, status codes, version-specific behaviour and anything "recent".

**In interviews, say this:** "I treat AI output like a junior colleague's draft: useful, but I verify every API name, field and requirement against the docs or the app before it goes into the suite."`,
      code: [
        {
          language: 'typescript',
          title: 'Hallucinated vs real Playwright (SauceDemo cart)',
          code: `import { test, expect } from '@playwright/test';

test('cart badge shows 1 item', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('button', { name: 'Add to cart' }).first().click();

  // AI suggestion (does NOT exist in Playwright):
  // await page.waitForElementVisible('.shopping_cart_badge');
  // const count = await page.locator('.shopping_cart_badge').getText();

  // Real, verified on playwright.dev: web-first assertion, auto-retries up to 5s
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});`,
        },
      ],
      keyPoints: [
        'Hallucinations are fluent and confident; confidence is not evidence.',
        'Typical in QA: invented fields, invented methods, invented requirements, invented causes.',
        'Give context, ask for citations / "not specified", and verify against a source of truth.',
      ],
      source: 'ISTQB CT-GenAI ch. 3 outline (hallucinations, reasoning errors, biases); Playwright docs — Assertions; Restful Booker API docs',
    },
    {
      heading: 'Prompt engineering for testers',
      body: `**Intuition:** briefing a contractor. "Test the login" gets you something random; a clear brief with background, scope, rules and the format you want gets you something you can use.

**Prompt engineering** is just writing clear instructions for the model and improving them based on what comes back. The big vendors' guides (OpenAI, Anthropic, Google) agree on the same core ideas. A handy checklist for testers is **R-C-T-C-O-E**:

| Part | What you write | Example for QA |
|---|---|---|
| **Role** | Who the model should act as | "You are a senior QA engineer for an e-commerce web app." |
| **Context** | The facts it can't know | The user story, acceptance criteria, field rules, environment |
| **Task** | Exactly what to produce | "Write functional test cases for the checkout information step." |
| **Constraints** | Rules and limits | "Only use behaviour stated in the story. Mark anything assumed as ASSUMPTION. Max 15 cases." |
| **Output format** | The shape you want back | "A markdown table: ID, Title, Preconditions, Steps, Test data, Expected result, Type (positive/negative/boundary)." |
| **Examples** | 1–2 samples of the style you want ("few-shot") | One test case written exactly in your team's format |

**Tips that help most in testing work**

- **Separate the material from the instructions** with clear labels or tags (for example \`<story> ... </story>\`), so the model doesn't confuse the spec text with your request.
- **Ask for coverage categories explicitly** (positive, negative, boundary, state, permissions), otherwise you mostly get happy paths.
- **Ask it to list open questions** about the requirement: that turns the AI into a requirement-review buddy.
- **Keep the examples consistent**: if your example uses "Expected result" with exact messages, the output tends to follow.

The full structured prompt is in the code snippet. Notice there is nothing clever in it: it is simply complete.`,
      code: [
        {
          language: 'text',
          title: 'A structured prompt (role, context, task, constraints, format, example)',
          code: `ROLE: You are a senior QA engineer testing an e-commerce web app.

CONTEXT:
<story>
As a shopper, I want to enter my details at checkout so that my order
can be delivered.
AC1: First Name, Last Name and Postal Code are required.
AC2: Missing field shows "Error: <Field> is required" above the form.
AC3: Continue goes to "Checkout: Overview" when all fields are filled.
AC4: Cancel returns to the cart with items unchanged.
</story>

TASK: Write functional test cases for this checkout step.

CONSTRAINTS:
- Cover positive, negative and boundary cases, plus state (cart after
  error/cancel). Use ONLY behaviour stated in the story.
- If something is not specified (e.g. max length), do not invent the
  rule: add it to an "Open questions" list instead.
- No real personal data; use obviously fake names.

OUTPUT FORMAT: markdown table with columns
ID | Title | Preconditions | Steps | Test data | Expected result | AC

EXAMPLE ROW:
TC-01 | Missing first name | Logged in, 1 item in cart, on step one |
1. Leave First Name empty 2. Fill others 3. Click Continue |
Last=Tester, Zip=12345 | "Error: First Name is required" shown,
still on step one | AC1, AC2`,
        },
      ],
      keyPoints: [
        'Role, Context, Task, Constraints, Output format, Examples.',
        'Ask explicitly for negative/boundary/state coverage and for open questions.',
        'Tell it not to invent rules; unknowns go to an Open questions list.',
      ],
      source: 'Anthropic — Prompting best practices; OpenAI — Prompt engineering guide; Google — Gemini prompt design strategies',
    },
    {
      heading: 'Iterating: the second prompt matters more than the first',
      body: `**Intuition:** the first answer is a first draft. Your follow-up messages are the review comments.

A realistic flow when generating test ideas for the **Restful Booker** \`POST /booking\` endpoint:

1. **First prompt** (structured, with the JSON schema pasted). You get 12 cases, mostly happy-path.
2. **Gap prompt:** "Which of these are boundary or negative cases? Add cases for: missing required fields, wrong types (string for totalprice), checkout before checkin, very large totalprice."
3. **Correction prompt:** "Case 7 asserts a field \`totalAmount\`; the schema has \`totalprice\`. Fix every case that uses an invented field, and list which ones you changed."
4. **Narrowing prompt:** "Return only the 8 highest-risk cases, with a one-line reason each."
5. **Format prompt:** "Now give them as rows I can paste into our test management CSV: ID,Title,Steps,Expected."

**Good iteration habits**

- Point at the **specific** problem ("case 7"), don't just say "be better".
- If a chat is going in circles, **start a fresh chat** with an improved first prompt; carrying a long confused history often makes it worse.
- Keep the prompts that worked in a shared team doc. A reusable prompt template is a real productivity win and a nice interview story.
- Know when to stop: if you spend 30 minutes coaxing the model, writing the 10 cases yourself may have been faster.

**Common mistake:** accepting the polished final format without re-checking content. A beautiful CSV can still contain a hallucinated field.`,
      code: [
        {
          language: 'text',
          title: 'Follow-up prompts that fix real problems',
          code: `# Gap prompt
Your list has 10 positive cases and 2 negative ones. Add:
- each required field missing (firstname, lastname, totalprice,
  depositpaid, bookingdates)
- wrong types: totalprice as "abc", depositpaid as "yes"
- checkout date before checkin date
For each new case, say "not specified in schema" if the expected
status code is not documented, instead of guessing one.

# Correction prompt
Cases 4 and 7 use "totalAmount" and "bookingId" inside the booking
object. The schema fields are "totalprice" and the top-level
"bookingid". Fix them and list the IDs you changed.

# Narrowing prompt
Pick the 8 highest-risk cases for a release smoke run and give one
line explaining the risk for each.`,
        },
      ],
      keyPoints: [
        'Use follow-ups to add missing coverage, correct errors and narrow scope.',
        'Be specific about what is wrong; restart the chat if it is going in circles.',
        'Save prompts that work as team templates.',
      ],
      source: 'Google — Gemini prompt design strategies (iterate, decompose); Anthropic — Prompting best practices; Restful Booker API docs',
    },
    {
      heading: 'Verifying AI output: where to check what',
      body: `**Intuition:** the AI is a fast drafter; you are the reviewer with access to the real system.

Before any AI output becomes a test case, a test script, a bug report or an answer to a developer, check each claim against the **right source of truth**:

| Claim type | Verify against | Quick check |
|---|---|---|
| Business rule / expected behaviour | Jira story, acceptance criteria, product owner | Does the story actually say it? If not, it's a question, not a test |
| API field names, status codes | Swagger/OpenAPI, API docs, a real request in Postman | Send the request; read the response |
| Playwright method or option | playwright.dev API reference | Search the method name; does it exist in your version? |
| Locator / selector | The running app, Playwright codegen or the Inspector "pick locator" | Does it match exactly one element? |
| Root cause of a failure | Trace, logs, reproduction | Can you reproduce it? Does the evidence point there? |
| "Fact" about a tool/version | Official release notes | Is there a link? Open it |

**A 60-second sanity routine for any AI-generated test artefact**

1. Does every expected result trace back to a requirement line? (Ask the AI to include the AC id; check a few.)
2. Are the names real? (fields, methods, URLs, error messages)
3. What's missing? (negative, boundary, state, permissions, non-functional)
4. Run it if it's code; open it if it's a link.

**In interviews, say this:** "AI saves me drafting time, and I spend part of that saved time verifying. Nothing goes into the suite or a bug report unless I've checked it against the requirement, the docs or the app."`,
      keyPoints: [
        'Each kind of claim has a natural source of truth: story, API docs, playwright.dev, the app, logs.',
        'Traceability (AC id per test case) makes verification fast.',
        'Running code and opening links are the cheapest verifications.',
      ],
      source: 'ISTQB CT-GenAI ch. 2 outline (evaluating GenAI results and refining prompts)',
    },
    {
      heading: 'Limits and responsible use',
      body: `**Intuition:** pasting into a public AI chat is like emailing a stranger. Once it's sent, you don't control where it goes.

**Never paste into a public or unapproved AI tool**

- **Customer data:** real names, emails, phone numbers, addresses, order histories, payment details, production database dumps, production logs with personal data.
- **Credentials and secrets:** passwords, API keys, tokens, \`.env\` files, \`storageState\` files with session cookies, connection strings.
- **Confidential code and documents:** proprietary source, unreleased product specs, security findings, client contracts.

**What to do instead**

- Use the **company-approved** tool and plan (business/enterprise plans usually come with admin controls and stricter data terms; consumer accounts may have different settings). If you don't know, ask: "Do we have an AI usage policy?" is a good question on day one.
- **Anonymise or mask** before pasting: replace \`priya.sharma@client.com\` with \`user1@example.test\`, strip tokens from logs, cut stack traces down to the relevant frames.
- **Describe, don't dump:** "a JSON response with an orders array of objects with id, status, total" is often enough.

**Other limits to keep in mind**

- **Accountability:** you own whatever you submit. "ChatGPT wrote it" is not an excuse for a wrong test or a leaked secret.
- **Bias and blind spots:** AI tends to suggest typical, happy-path, English-only, desktop-first ideas. Your domain knowledge fills the gaps.
- **Licensing and IP:** some companies restrict AI-generated code; follow the policy.
- **Cost and energy:** large models are expensive to run; ISTQB CT-GenAI even lists energy consumption as a risk to consider.

**Can AI replace testers?** It replaces some **typing**, not the **thinking**: choosing what is risky, knowing the domain, judging whether behaviour is acceptable, and being accountable.

Advanced, later: RAG (giving the model your own documents), embeddings, AI agents and evaluation frameworks build on everything in this topic.`,
      code: [
        {
          language: 'text',
          title: 'Masking a log before asking AI to explain it',
          code: `BEFORE (do NOT paste):
2026-03-02 10:14:07 ERROR PaymentService order=884213
  customer=priya.sharma@client.com card=4111********1111
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
  java.lang.NullPointerException: shippingAddress is null
    at com.client.checkout.PaymentService.charge(PaymentService.java:88)

AFTER (safe to ask about, if your policy allows the tool):
<timestamp> ERROR PaymentService order=<ORDER_ID>
  customer=<EMAIL> card=<MASKED>
  Authorization: <REMOVED>
  NullPointerException: shippingAddress is null
    at PaymentService.charge(PaymentService.java:88)

Prompt: "Explain in simple words what this error means and what test
data would reproduce it (e.g. a guest checkout with no address)."`,
        },
      ],
      keyPoints: [
        'No customer data, credentials or confidential code in public AI tools.',
        'Use the approved tool, mask data, describe instead of dumping.',
        'You are accountable for AI-assisted output; AI replaces typing, not judgement.',
      ],
      source: 'ISTQB CT-GenAI ch. 3 outline (data privacy and security risks, energy consumption, regulations)',
    },
  ],
  codeChallenges: [
    {
      id: 'ai-basics-cc-1',
      title: 'From a one-line prompt to a usable one',
      context:
        'A teammate typed this into the company AI tool and got 20 generic test cases for "a login page" that mention fields your app does not have (Remember me, CAPTCHA) and none of your real rules. The feature is the SauceDemo-style login: Username, Password, Login button, locked-out user message.',
      task: 'Rewrite the prompt so the output is specific to this login page, covers negative/boundary/security ideas, does not invent rules, and comes back in a format you can paste into your test management tool.',
      starter: {
        language: 'text',
        title: 'weak-prompt.txt',
        code: `write test cases for login page`,
      },
      hints: [
        'What can the model not know about this login page? Put that in the prompt as context.',
        'Name the coverage you want (negative, boundary, security, state), otherwise you get happy paths.',
        'Tell it what to do when the requirement is silent, and give one example row in your format.',
      ],
      solution: {
        language: 'text',
        title: 'strong-prompt.txt',
        code: `ROLE: You are a senior QA engineer writing manual test cases.

CONTEXT (the only source of truth; do not add features):
<feature>
Login page of a demo e-commerce site.
- Fields: Username (text), Password (masked), button "Login".
- Valid users: standard_user, problem_user, performance_glitch_user.
- locked_out_user shows: "Epic sadface: Sorry, this user has been
  locked out."
- Wrong credentials show: "Epic sadface: Username and password do
  not match any user in this service"
- Empty username shows: "Epic sadface: Username is required"
- Success goes to the inventory page titled "Products".
- No "Remember me", no CAPTCHA, no password reset on this page.
</feature>

TASK: Write test cases for this login page.

CONSTRAINTS:
- Include positive, negative, boundary (empty, whitespace, very long),
  security-minded (SQL-like text, password masked, back button after
  logout) and state cases (refresh, direct URL to inventory when
  logged out).
- Use only behaviour above. If an expected result is not specified,
  write "NOT SPECIFIED" and add the question to an "Open questions"
  list at the end. Do not invent messages or rules.
- Max 18 test cases. Use fake data only; passwords as <PASSWORD>.

OUTPUT FORMAT: markdown table
ID | Title | Preconditions | Steps | Test data | Expected result | Type

EXAMPLE ROW:
LG-01 | Locked-out user cannot log in | On login page |
1. Enter username 2. Enter password 3. Click Login |
locked_out_user / <PASSWORD> | Error "Epic sadface: Sorry, this user
has been locked out." shown; stays on login page | Negative`,
      },
      explanation: `**What changed and why:**

1. **Role** sets the expected quality and vocabulary (manual test cases, not code).
2. **Context** gives the real fields, users, messages and the success page, and explicitly lists what does *not* exist, which removes the "Remember me / CAPTCHA" hallucinations.
3. **Coverage categories** are named, so the output is not 18 happy paths.
4. **"NOT SPECIFIED" + Open questions** stops invented rules and turns gaps into questions for the product owner (for example: is there a max username length?).
5. **Limits and data rules** (max 18, fake data, \`<PASSWORD>\` placeholder) keep it reviewable and safe.
6. **Output format + example row** makes the answer paste-ready and consistent.

The strong prompt is longer, but it saves far more time than it costs: less cleanup, fewer invented cases.`,
      followUps: [
        {
          q: 'The model still adds a test for "account locks after 3 failed attempts". What do you do?',
          a: 'Check the source: the context says nothing about lockout after failures, so that case is an invented requirement. I remove it (or move it to Open questions as "Should repeated failures lock the account?"), and I reply to the model pointing at that specific row and repeating the rule "only behaviour in the feature block". If it keeps happening, I start a fresh chat with the improved prompt.',
        },
        {
          q: 'Would you reuse this prompt for another project?',
          a: 'Yes, as a template. The role, coverage list, NOT SPECIFIED rule and output format are generic, so I keep them and only swap the context block. Teams often keep a shared doc of prompt templates for test cases, bug reports and test data so everyone gets consistent output and the good wording is not lost.',
        },
      ],
    },
    {
      id: 'ai-basics-cc-2',
      title: 'Spot the hallucinations',
      context:
        'You asked an AI chat: "How should my Playwright test wait for a booking to be deleted in Restful Booker, and what should I assert?" The answer looks professional. Three statements in it are invented or wrong.',
      task: 'Find the three wrong statements, correct each one, and write down where you verified it (which doc page or which real request). Keep the statements that are correct.',
      starter: {
        language: 'text',
        title: 'ai-answer.txt',
        code: `AI answer:
1. Send DELETE https://restful-booker.herokuapp.com/booking/{id}
   with the header "Authorization: Bearer <token>" using the token
   from POST /auth.
2. A successful delete returns 204 No Content.
3. Afterwards, GET /booking/{id} should return 404 Not Found.
4. In Playwright, use page.waitForResponse() or, for the UI,
   await page.waitForElementVisible('#booking-deleted').
5. Playwright's expect() assertions retry for 30 seconds by default,
   so you never need to configure timeouts.
6. Use the request fixture for API calls so you don't need a browser.`,
      },
      hints: [
        'Open the Restful Booker API docs page for DeleteBooking: which auth header does it show, and which status code?',
        'Search playwright.dev for "waitForElementVisible". Then check the Test timeouts page for the default expect timeout.',
        'Statements 3, 6 and the waitForResponse part of 4 are fine; verify 3 with a real GET after deleting.',
      ],
      solution: {
        language: 'text',
        title: 'reviewed-answer.txt',
        code: `Reviewed answer (with verification):

1. WRONG auth header. Restful Booker's DELETE uses a cookie,
   "Cookie: token=<token>" (token from POST /auth), or Basic auth.
   A Bearer header is not what the docs show.
   Verified: restful-booker API docs, DeleteBooking + a real request.

2. WRONG status. DELETE /booking/{id} returns 201 Created (a known
   quirk of this practice API), not 204.
   Verified: API docs example response + real request in Postman.

3. OK. GET /booking/{id} after deleting returns 404 Not Found.
   Verified: ran it.

4. HALF WRONG. page.waitForResponse() exists. page.waitForElementVisible()
   does NOT exist in Playwright. For UI, use a web-first assertion:
   await expect(page.getByText('Booking deleted')).toBeVisible();
   Verified: playwright.dev API reference (no such method) + Assertions page.

5. WRONG default. expect() retries for 5 seconds by default; the test
   timeout is 30 seconds. Both are configurable in playwright.config.
   Verified: playwright.dev "Timeouts" page.

6. OK. The request fixture sends API calls without a browser page.
   Verified: playwright.dev "API testing".`,
      },
      explanation: `**The three hallucination types shown here are the most common in QA work:**

- **Invented API details** (statement 1 auth style, statement 2 status code): the model filled the gap with what is *typical* for REST APIs (Bearer, 204), not what *this* API does.
- **Invented framework method** (\`waitForElementVisible\`): it blends names from other tools.
- **Wrong numbers/defaults** (30s vs 5s): numbers are easy to get confidently wrong.

**The habit being trained:** for every claim, write *where* you verified it. "Looks right" is not a verification. The correct statements (3, 6, \`waitForResponse\`) stay, so you also avoid over-correcting good content.`,
      followUps: [
        {
          q: 'Why do you think the AI said 204 and Bearer?',
          a: 'Because those are the most common patterns across REST APIs it has seen during training. The model predicts the most plausible continuation, and for a generic DELETE that is 204 with a Bearer token. Restful Booker is a practice API with its own quirks (201 on delete, cookie token), and unless the docs are in the prompt the model has no reason to know them.',
        },
        {
          q: 'How could you have reduced these hallucinations in the first place?',
          a: 'Paste the relevant part of the API docs and mention the Playwright version, ask the model to cite which doc line each statement comes from, and to say "not sure" when it cannot cite one. Tools with web search or documentation access also help, but I would still verify, because the model can misread a source too.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'ai-basics-iq-1',
      difficulty: 'easy',
      question: 'In simple words, what is an LLM, and what does that mean for how you use it as a tester?',
      whatInterviewerLooksFor: [
        'Plain-English explanation without buzzwords',
        'Knows it predicts text and has no live knowledge by default',
        'Connects the mechanism to the need to verify',
        'Mentions a concrete testing use',
      ],
      modelAnswer: `**Short answer:** an LLM is a model trained on a huge amount of text that generates an answer by predicting the next piece of text, again and again.

**What follows from that for my work:**

- **It is great at drafting:** first versions of test scenarios from a user story, test data ideas, rewriting a messy bug report, explaining an unfamiliar error.
- **It doesn't know my system.** Unless I paste the story, the API schema or the error, it guesses from similar systems. So I always give context.
- **It can be confidently wrong** (hallucinations): invented fields, Playwright methods that don't exist, requirements nobody wrote. So I verify against the story, the docs or the app.
- **It's not repeatable:** the same prompt can give different lists. For brainstorming I run it twice and merge; anything I want to reuse I save.
- **It has a limited context window,** so for a large spec I split by feature.

**Example:** for the SauceDemo checkout story I paste the acceptance criteria, ask for positive/negative/boundary cases in our table format, then review: I usually add state cases (cart after cancel) and remove anything it invented.`,
      followUps: [
        {
          q: 'Does the model "look up" answers on the internet?',
          a: 'Not by default. The base model answers from patterns learned during training, which stops at a cut-off date. Some products add tools like web search or file reading; then it can fetch information, but only if the tool is actually used for that answer, and it can still misread what it fetched. So I check whether a source was used, and open it.',
        },
        {
          q: 'What is a training cut-off and why should a Playwright user care?',
          a: 'It is the date after which the model has seen no data. Playwright ships new versions often, so the model may not know new APIs or may suggest older patterns. When it suggests an API, I check playwright.dev for my installed version instead of trusting it.',
        },
      ],
      pitfalls: [
        'Describing it as a database or search engine that "knows" facts',
        'Using jargon (transformers, parameters) without connecting it to testing',
        'Not mentioning verification at all',
      ],
    },
    {
      id: 'ai-basics-iq-2',
      difficulty: 'medium',
      question: 'What is a hallucination? Give me an example you could hit in testing work and how you would catch it.',
      whatInterviewerLooksFor: [
        'Accurate definition (fluent but false/unsupported)',
        'A concrete QA example, not a generic one',
        'A verification method tied to a source of truth',
        'Prevention ideas (context, citations, "not specified")',
      ],
      modelAnswer: `**Definition:** output that sounds right but is false or not supported by any source: an invented fact, field, method or requirement.

**Why it happens:** the model generates the most plausible text. When it lacks real information, a plausible guess still comes out, in the same confident tone.

**Examples from testing work:**

- Generating API tests for Restful Booker, it asserts a field \`totalAmount\`; the real field is \`totalprice\`.
- In a Playwright script it writes \`page.waitForElementVisible()\`, which doesn't exist.
- From a user story it adds "account locks after 5 attempts" although the story says nothing about locking.

**How I catch them:**

1. **Traceability:** I ask for the acceptance-criteria id on every test case; anything with no source is either a question for the PO or gets deleted.
2. **Run the code:** a non-existent method fails immediately; TypeScript in the IDE often flags it before running.
3. **Check names against the source:** Swagger for fields, playwright.dev for methods.

**How I reduce them:** paste the real story/schema, tell the model to write "NOT SPECIFIED" instead of guessing, and keep prompts focused on one feature.`,
      followUps: [
        {
          q: 'Is an invented test case always bad? Sometimes it finds a real gap.',
          a: 'Good point: an invented rule can reveal a missing requirement. The key is not to treat it as an expected result. I turn it into a question for the product owner ("what should happen after 5 failed logins?"). If they confirm a rule, it becomes a real test case; if not, it is removed.',
        },
        {
          q: 'How would you catch a hallucinated locator?',
          a: 'Run it against the app or check it in the Playwright Inspector / codegen pick-locator tool. A wrong locator either matches nothing (the action times out) or matches several elements (strict mode violation). I would also prefer role-based locators, which I can verify by looking at the accessible name in the page.',
        },
      ],
      pitfalls: [
        'Saying "I just trust tools like Copilot because they are trained on code"',
        'Only a definition with no testing example',
        'Claiming better prompts eliminate hallucinations completely',
      ],
    },
    {
      id: 'ai-basics-iq-3',
      difficulty: 'easy',
      question: 'Can AI replace testers?',
      whatInterviewerLooksFor: [
        'A balanced answer, neither dismissive nor fearful',
        'Clear split between what AI speeds up and what needs human judgement',
        'Accountability and domain knowledge',
        'A personal example of using AI productively',
      ],
      modelAnswer: `**My view:** AI replaces a lot of **typing** and some **routine thinking**, not the tester's **judgement and accountability**.

**What AI already speeds up for me:**

- First drafts of test scenarios and test data from a story
- Boilerplate Playwright code and locator suggestions
- Rewriting bug reports clearly, summarising long logs

**What still needs a tester:**

- **Deciding what matters:** which risks to test first for this release, for these users.
- **Domain and context:** knowing that our payment provider times out at month-end, or that a regulator cares about a certain field.
- **Judging behaviour:** an AI can generate checks, but "is this acceptable for users?" is a human call, especially for usability, accessibility and ethics.
- **Verifying the AI itself:** someone has to catch the hallucinated requirement or the test with no assertion.
- **Accountability:** when a bug escapes, the team needs someone who owns the testing decisions.

**So the role shifts:** testers who use AI well do more exploratory and risk-based testing because drafting is faster. And products now *contain* AI (chatbots), which creates new testing work: hallucination checks, prompt injection, data leakage.

**Example:** I used AI to draft 25 checkout test cases in minutes; my review removed 3 invented rules and added 6 state and permission cases it missed. Both parts were needed.`,
      followUps: [
        {
          q: 'What new skills should a tester learn because of AI?',
          a: 'Writing clear prompts, reviewing AI output critically, basic knowledge of how LLMs fail (hallucinations, non-determinism, context limits), data-privacy awareness, and testing AI features themselves: checking answers against a source of truth, prompt injection basics and data leakage. Automation basics still matter, because AI-generated scripts need someone who can read and fix them.',
        },
        {
          q: 'Would you let AI decide which tests to skip in a release?',
          a: 'Not on its own. It can suggest a prioritisation if I give it the change list and risk areas, which is a useful second opinion. But the decision depends on context it does not fully have (business impact, past incidents, deadlines), and I am accountable for it, so I would review and own the final call with the team.',
        },
      ],
      pitfalls: [
        'Answering "No, AI is useless" (sounds out of touch)',
        'Answering "Yes, soon" without nuance',
        'No concrete example from your own work',
      ],
    },
    {
      id: 'ai-basics-iq-4',
      difficulty: 'medium',
      question: 'Walk me through how you would write a prompt to generate test cases for a new user story.',
      context: 'The interviewer gives you a short story: "As a guest, I can apply one promo code at checkout; valid codes reduce the total; expired codes show an error."',
      whatInterviewerLooksFor: [
        'A structure (role, context, task, constraints, format, examples)',
        'Asks for negative/boundary/state coverage explicitly',
        'Prevents invented rules',
        'Plans to iterate and review, not one-shot',
      ],
      modelAnswer: `I'd build it in parts and then iterate.

1. **Role:** "You are a senior QA engineer for an e-commerce web app."
2. **Context:** paste the story and acceptance criteria exactly, plus anything known: code format, case sensitivity, whether codes stack, sample codes from the test environment (fake ones).
3. **Task:** "Write functional test cases for applying a promo code at checkout."
4. **Constraints:**
   - cover positive, negative (expired, invalid, already used), boundary (code length, total becoming 0 or negative, expiry exactly today), state (code kept after page refresh? removed when cart empties?) and permissions (guest vs logged-in)
   - only behaviour stated in the story; unknown rules → "NOT SPECIFIED" + an Open questions list
   - maximum 20 cases, fake data only
5. **Output format:** table with ID, Title, Preconditions, Steps, Test data, Expected result, AC reference.
6. **Example:** one row in our team's style.

**Then I iterate:** ask "which AC has the fewest cases?", correct any invented messages, and ask for the open questions separately. I'd take those questions to the PO: "Can two codes be applied? Is the code case-insensitive? What happens at 23:59 on the expiry date?"

**Finally I review** the list myself before it goes into the test management tool, because the model tends to miss state and permission cases and may invent error texts.`,
      followUps: [
        {
          q: 'Why add an example row? Isn\'t the format description enough?',
          a: 'A description leaves room for interpretation (how detailed are steps, what counts as expected result). One example in exactly our style ("few-shot") shows the level of detail, the tone and the columns, and the output tends to follow it closely. I keep examples consistent with each other so the model does not mix styles.',
        },
        {
          q: 'What would you do if the output is mostly happy paths anyway?',
          a: 'Ask a targeted follow-up: "List which of these are negative or boundary; add at least 2 per acceptance criterion for invalid, expired and edge values." If it still under-delivers, I generate negatives in a separate prompt focused only on failure modes, then merge and dedupe myself.',
        },
      ],
      pitfalls: [
        'One-line prompt ("write test cases for promo code")',
        'Accepting the first output without review',
        'Not mentioning what to do when the story is silent',
      ],
    },
    {
      id: 'ai-basics-iq-5',
      difficulty: 'medium',
      question: 'You ran the same prompt twice and got two different lists of test cases. Is the tool broken? How do you work with this?',
      whatInterviewerLooksFor: [
        'Understands non-determinism (sampling, temperature)',
        'Turns it into an advantage for brainstorming',
        'Knows to save outputs that must be stable',
        'Links it to testing AI features',
      ],
      modelAnswer: `**Not broken; that's how LLMs work.** At each step the model has several likely next tokens and the product samples among them. A setting called **temperature** controls how much variety there is. Chat tools usually don't let me set it, and even low temperature doesn't guarantee identical answers.

**How I work with it:**

- **Brainstorming:** different runs are a feature. I run the prompt two or three times, merge the lists and dedupe. In practice each run surfaces a couple of ideas the other missed.
- **Things that must be stable:** test data for a regression suite, a prompt-generated script, a summary sent to stakeholders: I **save the output** (in the repo or the test tool) and review it once, rather than regenerating each time.
- **Precision tasks:** for format conversion or extracting fields from a log I give very precise instructions and an example, which reduces variation.

**Why it matters beyond my own use:** if our product has an AI feature, its answers will also vary. That means tests must check **rules** the answer must satisfy (mentions 30-day return window, no other customer's data, stays on topic), and I would run the same question several times to measure consistency rather than comparing one exact string.`,
      followUps: [
        {
          q: 'What is temperature in one sentence?',
          a: 'It is a setting that controls how random the choice of next token is: low temperature mostly picks the most likely tokens (more focused and repeatable), high temperature allows less likely tokens (more varied and creative). Many chat apps hide it, and some newer models do not expose it at all.',
        },
        {
          q: 'How would you decide how many times to run a prompt for brainstorming?',
          a: 'Pragmatically: run it until a new run adds almost nothing new. If the third run only repeats ideas from the first two, stop. For a small feature two runs plus my own review is usually enough; for a risky feature I might also change the angle of the prompt (security, accessibility) instead of just re-running.',
        },
      ],
      pitfalls: [
        'Thinking a "correct" prompt will always give the same answer',
        'Regenerating test data on each CI run',
        'Not connecting this to testing AI features',
      ],
    },
    {
      id: 'ai-basics-iq-6',
      difficulty: 'easy',
      question: 'What would you never paste into ChatGPT or a similar tool at work, and what do you do instead?',
      whatInterviewerLooksFor: [
        'Lists customer data, credentials, confidential code',
        'Knows about company AI policy and approved tools',
        'Practical masking/anonymising habits',
        'Ownership of output',
      ],
      modelAnswer: `**Never paste into a public or unapproved tool:**

- **Customer or personal data:** names, emails, phone numbers, addresses, orders, payment info, production DB extracts, production logs containing any of these.
- **Secrets:** passwords, API keys, bearer tokens, \`.env\` files, Playwright \`storageState\` files (they contain session cookies), connection strings.
- **Confidential material:** proprietary source code, unreleased specs, security vulnerabilities, client documents under NDA.

**What I do instead:**

1. **Check the policy first.** Many companies have an AI usage policy and an approved tool or plan with admin controls and stricter data terms. I use that one, not my personal account.
2. **Mask and minimise.** Replace emails with \`user1@example.test\`, remove tokens, keep only the relevant stack frames. Often a description ("a 500 error when shippingAddress is null") is enough.
3. **Use synthetic data:** if I need realistic test data, I ask AI to *generate* fake data, I don't feed it real data.
4. **Own the output.** Whatever I paste back into our code or Jira is my responsibility, so I review it.

**Example:** to understand a NullPointerException from production I pasted a masked, trimmed version of the stack trace with no customer fields, and asked what input could cause it. That gave me a reproduction idea without exposing any data.`,
      followUps: [
        {
          q: 'Your company has no AI policy yet. What do you do?',
          a: 'I would assume the strictest reasonable rules: no customer data, no secrets, no proprietary code in public tools, and I would ask my lead or security team whether there is an approved tool. Raising the question is helpful, not annoying; many teams wrote their first AI policy because someone asked.',
        },
        {
          q: 'Is it safe to paste code from our open-source test framework?',
          a: 'Code that is already public is lower risk, but I would still remove config files, environment URLs and any credentials or internal hostnames, and follow the policy, which may still restrict certain tools. "It is public" covers the code itself, not the secrets that might sit next to it.',
        },
      ],
      pitfalls: [
        'Saying "it\'s fine if I delete the chat afterwards"',
        'Forgetting that logs and storageState files contain sensitive data',
        'Not mentioning company policy',
      ],
    },
    {
      id: 'ai-basics-iq-7',
      difficulty: 'hard',
      question: 'You pasted a long requirements document into an AI tool and the test cases ignore everything after section 8. Why might that happen and how do you fix your approach?',
      whatInterviewerLooksFor: [
        'Understands tokens and the context window',
        'Knows truncation and lost-in-the-middle effects',
        'Proposes splitting and focused prompts',
        'Adds a verification step for coverage',
      ],
      modelAnswer: `**Likely causes:**

1. **Context window limit.** Everything (the document, my instructions, chat history and the answer) must fit in a fixed number of tokens. A long document may be **truncated** by the tool, silently, so the model never saw sections 9 onwards.
2. **Attention dilution.** Even when it fits, very long inputs make the model focus on some parts more than others; details in the middle or end can be under-used.
3. **Output limit.** The model may have run out of room for the *answer* and stopped after the first sections' test cases.
4. **Long chat history.** If this came after a long conversation, earlier messages also use up the window.

**How I would fix it:**

- **Split by feature or section.** One prompt per module (login, cart, checkout), each with only the relevant sections pasted.
- **Ask for a coverage map first:** "List every requirement ID you can see in this document." If REQ-9.x are missing, I know it didn't see them.
- **Ask for traceability:** each test case lists its requirement ID, then I compare against our RTM to find uncovered requirements.
- **Restate the key rules** at the end of each prompt and start fresh chats for new sections.
- **Merge and review** the per-section outputs myself.

**Rule of thumb:** about 4 characters of English per token, so a 120-page spec can be tens of thousands of tokens: big enough to cause trouble on limited internal tools.`,
      followUps: [
        {
          q: 'How would you know the tool truncated the input?',
          a: 'Ask the model to list the section headings or requirement IDs it received, or to quote the last paragraph it can see. If the list stops at section 8, the input was cut. Some tools also show a warning or a token counter. Coverage via traceability (requirement ID per test case) shows the same thing from the output side.',
        },
        {
          q: 'Is a model with a bigger context window the full solution?',
          a: 'It helps, but no. Even with a huge window, quality is better with focused input: the model pays more attention to a short relevant context, it is cheaper and faster, and reviewing a smaller output is easier for me. So I would still split by feature and verify coverage against the RTM.',
        },
      ],
      pitfalls: [
        'Blaming "AI is bad" without understanding limits',
        'Fix = paste the document again',
        'No step to check which requirements were covered',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'ai-basics-drill-1',
      question:
        'Your company\'s internal AI tool allows about 32,000 tokens per request (input + output). You want test cases for a 120-page requirements spec (~450 words per page). Estimate the size and plan how to split the work.',
      assumptions: [
        'Rule of thumb: 1 token ≈ 0.75 English words (≈ 4 characters)',
        'Your instructions + format example take ~600 tokens',
        'You want room for ~6,000 tokens of answer per request',
        'The spec has 6 features of roughly equal size',
      ],
      steps: [
        { label: 'Words in the spec', calc: '120 pages × 450 words = 54,000 words' },
        { label: 'Tokens in the spec', calc: '54,000 ÷ 0.75 ≈ 72,000 tokens' },
        { label: 'Budget per request for spec text', calc: '32,000 − 600 (instructions) − 6,000 (answer) ≈ 25,400 tokens' },
        { label: 'Minimum chunks', calc: '72,000 ÷ 25,400 ≈ 2.8 → at least 3 requests' },
        { label: 'Better split', calc: '6 features → 6 requests of ~12,000 tokens each, well inside the limit with room to spare' },
        { label: 'Coverage check', calc: 'Ask each run to list requirement IDs it used; compare with the RTM' },
      ],
      answer:
        'The spec is roughly **72,000 tokens**, more than twice the limit, so pasting it whole would be truncated. Mathematically 3 chunks fit, but splitting **by feature into 6 prompts** (~12k tokens each) gives focused context, smaller outputs to review and clean traceability per feature.',
      insight:
        'Fitting the limit is the minimum; focused prompts per feature give better coverage and are easier to verify. Always prove coverage with requirement IDs rather than trusting that the model "read everything".',
      followUps: [
        {
          q: 'A feature section references rules defined in a shared "Glossary and global rules" section. What do you do?',
          a: 'Paste the relevant global rules (or a short summary of them) into every feature prompt. That costs a few hundred tokens per request but prevents each chunk from inventing its own version of shared rules, such as password policy or currency formatting.',
        },
      ],
    },
    {
      id: 'ai-basics-drill-2',
      question:
        'Write a structured prompt asking an AI tool for API test cases for Restful Booker `POST /booking`. Label each of the six parts (role, context, task, constraints, output format, example).',
      assumptions: [
        'Request body fields: firstname, lastname, totalprice (number), depositpaid (boolean), bookingdates { checkin, checkout } (YYYY-MM-DD), additionalneeds (optional string)',
        'Successful response: 200 with { bookingid, booking }',
        'Validation rules for bad input are not documented',
        'You will review the output before using it',
      ],
      steps: [
        { label: 'Role', calc: '"You are a QA engineer testing a REST API with Postman and Playwright\'s request fixture."' },
        { label: 'Context', calc: 'Paste the field list and the documented 200 response shape inside <api> ... </api> tags' },
        { label: 'Task', calc: '"Write API test cases for creating a booking."' },
        { label: 'Constraints', calc: 'Positive, missing-field, wrong-type, boundary (totalprice 0, negative, very large), date logic (checkout before checkin); undocumented status → "NOT DOCUMENTED"; no invented fields; max 15 cases' },
        { label: 'Output format', calc: 'Table: ID | Title | Request body change | Expected status | Expected body checks | Notes' },
        { label: 'Example', calc: 'BK-01 | Valid booking | full valid body | 200 | bookingid is a number; booking.firstname equals sent value | -' },
      ],
      answer:
        'A complete prompt contains all six parts, keeps the API facts inside a clearly labelled context block, explicitly asks for negative/boundary/date cases, and tells the model to write **NOT DOCUMENTED** instead of inventing status codes for invalid input (Restful Booker does not document them, and its real behaviour is a good thing to discover by running requests).',
      insight:
        'The constraint "do not invent; mark NOT DOCUMENTED" is what turns a generic generator into a useful assistant. Undocumented behaviour becomes an exploratory test task, not a fake expected result.',
      followUps: [
        {
          q: 'Why paste the field list instead of saying "the Restful Booker API"?',
          a: 'The model may only vaguely remember this API (or confuse it with others) and invent fields like totalAmount. Pasting the exact field names gives it the source of truth, and it also makes my review faster because I can check every case against the same list.',
        },
      ],
    },
    {
      id: 'ai-basics-drill-3',
      question:
        'An AI tool gave you five statements while you were preparing a test. For each, decide: verify where, and how risky is it to trust without checking (low/medium/high)?',
      assumptions: [
        'S1: "Playwright\'s getByRole locates elements by ARIA role and accessible name."',
        'S2: "SauceDemo shows \'Epic sadface: Username is required\' when the username is empty."',
        'S3: "Restful Booker\'s GET /booking supports filtering by firstname and lastname query parameters."',
        'S4: "Our checkout should block orders over $10,000."',
        'S5: "This flaky failure is caused by a race condition in React 19\'s scheduler."',
      ],
      steps: [
        { label: 'S1', calc: 'Stable, well-known API fact → playwright.dev Locators page; risk LOW, still a 10-second check' },
        { label: 'S2', calc: 'Exact UI text → try it in the app; risk MEDIUM (exact wording matters in assertions)' },
        { label: 'S3', calc: 'API detail → Restful Booker API docs + one GET request; risk MEDIUM' },
        { label: 'S4', calc: 'Business rule about OUR system → only the story/PO can confirm; the model cannot know it; risk HIGH' },
        { label: 'S5', calc: 'Root-cause claim with no evidence → trace, logs, reproduction; risk HIGH' },
      ],
      answer:
        'Verify everything, but prioritise: **S4 and S5 are high risk** (claims about our own system and an unproven root cause; the model has no access to either), **S2 and S3 medium** (exact strings and API details are commonly hallucinated), **S1 low** (a stable documented fact, still quick to confirm).',
      insight:
        'The less the model can possibly know (your business rules, your production incident), the more likely the answer is a plausible invention. Generic, well-documented facts are safest; specific claims about your system are the most dangerous.',
      followUps: [
        {
          q: 'What do you do with S4 if the PO says "good idea, but it is not a requirement"?',
          a: 'It stays out of the test suite as an expected result. I might log it as an improvement suggestion if the PO wants, but tests must reflect agreed requirements. If I had automated an assertion for it, the test would fail on correct behaviour and create noise.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'ai-basics-mcq-01',
      difficulty: 'easy',
      question: 'Which description of how an LLM produces an answer is most accurate?',
      options: [
        'It repeatedly predicts a likely next token based on the text so far',
        'It searches a database of verified facts and returns the best match',
        'It runs your application to observe the real behaviour, then describes it',
        'It copies the most similar answer it saw during training, word for word',
      ],
      correct: [0],
      explanation:
        'An LLM generates text token by token, each time choosing a likely continuation. It does not query a fact database (so it can be wrong), it does not run your app unless a tool is added, and it does not simply copy stored answers; it generates new text from learned patterns.',
      followUps: [
        {
          q: 'So why are LLM answers often correct?',
          a: 'Because for common, well-documented topics the most likely continuation is usually the correct one: it has seen the right answer many times in training. Accuracy drops for niche, recent or system-specific questions, where the most likely text is just a plausible guess.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-02',
      difficulty: 'easy',
      question: 'You ask an AI chat: "What error does our checkout show when a promo code is expired?" and paste nothing else. What is the most likely outcome?',
      options: [
        'A plausible-sounding error message that may be invented',
        'The exact message from your app, because the model has seen most web apps',
        'An error, because the model refuses questions about specific apps',
        'A link to your app\'s source code where the message is defined',
      ],
      correct: [0],
      explanation:
        'Without context or tools the model cannot know your app, so it generates a typical-looking message: a hallucination risk. It has not seen your private app, it usually does not refuse such questions, and it cannot link to code it has no access to.',
      followUps: [
        {
          q: 'How would you rephrase the request to get something useful?',
          a: 'Paste the acceptance criteria or the screen text, and ask for test cases or a review rather than facts about the app. Or ask: "What questions should I ask the PO about expired promo codes?", which uses the model for thinking support instead of for facts it cannot know.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-03',
      difficulty: 'medium',
      question: 'An AI tool generated this Playwright code. Which line contains a hallucinated API?',
      code: {
        language: 'typescript',
        title: 'ai-generated.spec.ts',
        code: `import { test, expect } from '@playwright/test';

test('login works', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');                    // line A
  await page.getByPlaceholder('Username').fill('standard_user');    // line B
  await page.getByPlaceholder('Password').fill(process.env.PW!);    // line C
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('.title')).toBeDisplayed();             // line D
});`,
      },
      options: ['Line D', 'Line A', 'Line B', 'Line C'],
      correct: [0],
      explanation:
        '`toBeDisplayed()` is not a Playwright assertion (it resembles names from other tools); Playwright uses `toBeVisible()` or here `toHaveText(\'Products\')`. `page.goto`, `getByPlaceholder(...).fill` and reading a password from an environment variable are all real and reasonable.',
      followUps: [
        {
          q: 'How would you have found this quickly without reading docs?',
          a: 'TypeScript in the IDE underlines it because the method does not exist on the expect matcher type, and running the test fails immediately with "toBeDisplayed is not a function". Running AI-generated code once is the cheapest verification there is.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-04',
      difficulty: 'easy',
      question: 'Which of these is safe to paste into a public AI chat tool? Select ALL that apply.',
      options: [
        'A made-up user story you wrote for practice with SauceDemo',
        'A stack trace with emails and tokens replaced by placeholders, if your policy allows the tool',
        'Your team\'s .env file "just to explain one variable"',
        'A production database export of 50 customers to "generate similar data"',
        'A Playwright storageState JSON from the staging environment',
      ],
      correct: [0, 1],
      explanation:
        'Practice material and properly masked content (within policy) are acceptable. A `.env` file holds secrets; a production export contains real personal data; a `storageState` file contains live session cookies that can log someone in. For realistic data, ask AI to generate synthetic data instead.',
      followUps: [
        {
          q: 'Why is a staging storageState still sensitive?',
          a: 'It contains cookies and local storage that represent a logged-in session. Anyone with it can act as that user on staging, and staging often has real-looking data or shared credentials that also work elsewhere. Treat it like a password.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-05',
      difficulty: 'medium',
      question: 'Which parts of this prompt are missing if you want paste-ready, non-invented test cases? Select ALL that apply.',
      code: {
        language: 'text',
        title: 'prompt.txt',
        code: `You are a senior QA engineer.
Write test cases for the SauceDemo "sort products" dropdown
(Name A-Z, Name Z-A, Price low-high, Price high-low).`,
      },
      options: [
        'Output format (columns or structure you want back)',
        'Constraints such as "do not invent behaviour; mark unknowns"',
        'A role for the model',
        'Coverage expectations (negative, state, boundary)',
      ],
      correct: [0, 1, 3],
      explanation:
        'The prompt has a role and a short task with some context, but no output format, no rule about unknown behaviour and no coverage expectations, so you will likely get free-form happy paths. A role is already present ("You are a senior QA engineer").',
      followUps: [
        {
          q: 'What state or edge cases would you expect for sorting?',
          a: 'Sort persists or resets after visiting a product and coming back, after refresh, after adding to cart; ties in price (two items at 15.99); names with lowercase/uppercase or special characters; and that the cart contents are not affected by sorting. These are exactly what a minimal prompt tends to miss.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-06',
      difficulty: 'medium',
      question: 'You run the same brainstorming prompt three times and get three different lists of edge cases. What is the best reaction?',
      options: [
        'Merge and dedupe the lists, then review them against the requirement',
        'Report the tool as broken because results must be identical',
        'Keep only the first list, because later runs are less accurate',
        'Keep only ideas that appear in all three runs, since those are the verified ones',
      ],
      correct: [0],
      explanation:
        'Variation comes from sampling and is expected; for brainstorming it is useful, so merge and review. It is not a defect, the first run is not more accurate, and agreement between runs does not verify anything: three runs can repeat the same plausible mistake.',
      followUps: [
        {
          q: 'When would you not want this variation?',
          a: 'For stable artefacts: regression test data, a script committed to the repo, a summary sent to stakeholders. There I save one reviewed output instead of regenerating it, and for extraction tasks I use precise instructions and an example to reduce variation.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-07',
      difficulty: 'medium',
      question: 'In a very long chat, the AI starts using CSS selectors again even though you said "only role-based locators" 60 messages ago. What is the most likely reason?',
      options: [
        'The early instruction is far back in a long context and is getting dropped or under-weighted',
        'The model learned during your chat that CSS selectors are better',
        'Role-based locators were removed from recent Playwright versions',
        'The model deliberately ignores instructions after 50 messages',
      ],
      correct: [0],
      explanation:
        'Long conversations fill the context window; early messages may be truncated or get less attention. The model does not learn new preferences from your chat, role-based locators are still the recommended approach, and there is no fixed "50 message" rule. Fix: restate the constraint or start a fresh chat with a better first prompt.',
      followUps: [
        {
          q: 'What two habits prevent this?',
          a: 'Keep chats short and task-focused (new task, new chat), and put key constraints in every substantial prompt, ideally in a reusable template. For coding assistants, many tools also support project instruction files so rules are included automatically.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-08',
      difficulty: 'easy',
      question: 'Roughly how many tokens is 300 words of plain English, using the common rule of thumb?',
      options: ['About 400 tokens', 'About 30 tokens', 'About 300,000 tokens', 'About 75 tokens'],
      correct: [0],
      explanation:
        'The rule of thumb is about 0.75 words per token (≈ 4 characters), so 300 words ÷ 0.75 ≈ 400 tokens. 30 or 75 would mean many words per token, which is the wrong direction; 300,000 confuses tokens with characters by a huge factor.',
      followUps: [
        {
          q: 'Would 300 words of JSON cost the same?',
          a: 'Usually more. Braces, quotes, colons and long identifiers split into many tokens, so JSON, code and logs are token-heavy. That is one reason to paste only the relevant part of a schema or log instead of the whole thing.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-09',
      difficulty: 'medium',
      question: 'An AI-generated test case list for a password-reset story includes TC-04 below. The story does not mention expiry. What should you do with TC-04?',
      code: {
        language: 'text',
        title: 'Story + AI output (excerpt)',
        code: `Story: As a user, I can request a password reset link by email.
AC1: Entering a registered email sends a reset link.
AC2: Entering an unregistered email shows the same neutral message.
AC3: The link opens a form to set a new password.

AI output:
TC-01 Registered email receives a link            (AC1)
TC-02 Unregistered email shows neutral message    (AC2)
TC-03 Link opens the new-password form            (AC3)
TC-04 Reset link expires after 24 hours           (AC?)`,
      },
      options: [
        'Turn it into a question for the product owner; do not keep it as an expected result yet',
        'Keep it, because 24 hours is the industry standard',
        'Delete it and never mention it, since the AI invented it',
        'Automate it immediately so the developers notice the gap',
      ],
      correct: [0],
      explanation:
        'It is an invented requirement, but it points to a real gap (expiry is unspecified). The right move is to ask the PO. Keeping it as a test bakes in a guess; silently deleting loses a useful question; automating it creates a failing test for behaviour nobody agreed on.',
      followUps: [
        {
          q: 'How would you phrase the question to the PO?',
          a: 'Specific and testable: "The story does not define expiry for reset links. Should they expire? If yes, after how long, and what should the user see when opening an expired link?" Then I add the answer to the acceptance criteria so the test has a real source.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-10',
      difficulty: 'medium',
      question: 'Which claims from an AI answer most need checking against a source of truth before you use them in a test? Select ALL that apply.',
      options: [
        'The exact error message text your app shows for an invalid postal code',
        'The status code a specific API returns on delete',
        'A suggestion to "consider testing with an empty cart"',
        'The name of a Playwright assertion method',
      ],
      correct: [0, 1, 3],
      explanation:
        'Exact UI text, specific API behaviour and API method names are factual claims that go straight into assertions and are commonly hallucinated. A test idea like "try an empty cart" is a suggestion; it needs judgement about relevance, but there is no fact to verify, and if irrelevant it is simply dropped.',
      followUps: [
        {
          q: 'Where would you verify each one?',
          a: 'Error text: in the running app or the design/AC. API status code: the API docs and a real request. Playwright method: playwright.dev for my version, or just let TypeScript and a test run tell me.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-11',
      difficulty: 'hard',
      question: 'What does this follow-up prompt achieve that "make it better" would not?',
      code: {
        language: 'text',
        title: 'follow-up.txt',
        code: `Cases 3, 8 and 11 assert the field "totalAmount".
The schema field is "totalprice". Fix those cases.
Then list any other field names you used that are NOT in the
schema I pasted, and remove those cases.`,
      },
      options: [
        'It points at specific errors and makes the model self-check against the given schema',
        'It changes the model\'s training so it will not make this mistake again',
        'It guarantees the output now has no hallucinations',
        'It increases the context window so the schema fits better',
      ],
      correct: [0],
      explanation:
        'Specific, verifiable feedback ("cases 3, 8, 11", "only fields in the pasted schema") gives the model a concrete correction and a rule to check against. It does not retrain the model, it guarantees nothing (you still review), and prompts do not change the context window size.',
      followUps: [
        {
          q: 'After this follow-up, are you done?',
          a: 'No. The model may miss some or introduce new issues. I still scan the final list for field names against the schema myself, ideally quickly running a couple of the cases in Postman to check real responses.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-12',
      difficulty: 'hard',
      question: 'You paste an 8,000-line application log and ask "why did checkout fail?". The answer blames something unrelated. Which improvements are most likely to help? Select ALL that apply.',
      options: [
        'Trim to the time window and request ID around the failure, and mask personal data',
        'Tell it the symptom precisely (step, time, error shown) and ask for evidence lines',
        'Ask the same question again in the same chat until the answer changes',
        'Paste the log twice so the model pays more attention',
      ],
      correct: [0, 1],
      explanation:
        'Focused, relevant input and a precise question with a request for evidence reduce guessing and context dilution. Re-asking in the same long chat just samples another guess, and duplicating the log wastes context and makes the problem worse.',
      followUps: [
        {
          q: 'Why ask for "evidence lines"?',
          a: 'It forces the answer to point to specific log lines I can check. If the claimed cause has no supporting line, I know it is a guess. It turns a story into something verifiable.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-13',
      difficulty: 'easy',
      question: 'Who is responsible if an AI-generated test case with a wrong expected result is added to the suite and causes a missed bug?',
      options: [
        'The tester who reviewed and added it',
        'The AI vendor',
        'Nobody, since AI output is known to be unreliable',
        'The developer who implemented the feature',
      ],
      correct: [0],
      explanation:
        'Using AI does not transfer accountability: whoever submits the artefact owns it. Vendors explicitly do not take responsibility for your test decisions, "nobody" is not acceptable in a professional team, and the developer did not write the test case.',
      followUps: [
        {
          q: 'How does this change how you use AI day to day?',
          a: 'I budget time for review, I keep traceability so I can check each case against a requirement, and I never paste AI output straight into the suite or a bug report. The time saved on drafting is partly reinvested in verification.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-14',
      difficulty: 'hard',
      question: 'Which practices reduce hallucinations when generating API test cases? Select ALL that apply.',
      options: [
        'Paste the actual request/response schema into the prompt',
        'Instruct "if the docs do not say, write NOT DOCUMENTED instead of guessing"',
        'Ask for the expected status code of every case even when undocumented',
        'Ask the model to reference the schema field for each assertion',
        'Use a higher temperature so the answer is more creative',
      ],
      correct: [0, 1, 3],
      explanation:
        'Grounding in the real schema, permission to say "not documented", and per-assertion references all make invented details less likely and easier to spot. Demanding answers for undocumented behaviour pushes the model to guess, and higher temperature increases variety, not accuracy.',
      followUps: [
        {
          q: 'What do you do with the NOT DOCUMENTED cases?',
          a: 'They become exploratory API checks: I send the request, record actual behaviour, and ask the developer or PO whether that behaviour is intended. Once agreed, the expected result is documented and the case becomes a regression test.',
        },
      ],
    },
    {
      id: 'ai-basics-mcq-15',
      difficulty: 'medium',
      question: 'Which statement about ISTQB\'s AI-related certifications is correct?',
      options: [
        'CT-GenAI focuses on testing with generative AI; CT-AI focuses on testing AI-based systems',
        'CT-AI is required before you can use ChatGPT at work',
        'CT-GenAI teaches you to train your own LLM from scratch',
        'Both certifications replace the Foundation Level (CTFL)',
      ],
      correct: [0],
      explanation:
        'ISTQB positions CT-GenAI around using generative AI in testing (prompting, risks, adoption) and CT-AI around testing AI-based systems. No certification is required to use AI tools, CT-GenAI is not about training models from scratch, and both require CTFL as a prerequisite rather than replacing it.',
      followUps: [
        {
          q: 'Is a certification necessary for a junior QA role?',
          a: 'Usually not. Interviewers care more that you can explain how you use AI safely and critically with a real example. A certification can help structure your learning, but practical evidence (a prompt template, a reviewed test set) is more convincing.',
        },
      ],
    },
  ],
};

export default topic;
