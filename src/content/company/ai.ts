import type { CompanyQuestion } from '../../types';

const GHL = {
  name: 'LeetCode Discuss: GoHighLevel Interview Experience (Lead SDET, 7 YoE)',
  url: 'https://leetcode.com/discuss/post/8346427/',
  year: 2026,
};
const EQUALL = {
  name: 'LeetCode Discuss: Equall (LTCV Credit) Interview Experience (SDET 3, Founding QA)',
  url: 'https://leetcode.com/discuss/post/8337525/',
  year: 2026,
};
const QUANTUM = {
  name: 'LeetCode Discuss: Quantum Capital AI Labs Interview Experience (Founding QA, 7 YoE)',
  url: 'https://leetcode.com/discuss/post/8337180/',
  year: 2026,
};

export const QUESTIONS: CompanyQuestion[] = [
  // ---------------- GoHighLevel ----------------
  {
    id: 'co-ai-gohighlevel-1',
    company: 'GoHighLevel',
    area: 'ai',
    role: 'Lead SDET',
    round: 'Technical round 2 (framework and leadership)',
    difficulty: 'medium',
    question: 'How do you use AI in your engineering workflow, and how do you validate code that an AI tool generated?',
    answer: `**Where AI helps** (be specific): drafting test scenarios from a story, scaffolding page objects and fixtures, converting manual cases to Playwright code, writing test data builders, explaining a failing trace or stack trace, and reviewing a diff for missing cases.

**Validating AI-generated test code** — treat it as a junior colleague's PR:
1. **Read every line**; reject what you cannot explain.
2. **Run it**, and also **make it fail**: break the app behaviour (or the expected value) and confirm the test goes red. Generated tests often assert nothing meaningful.
3. **Check framework conventions**: \`getByRole\`/\`getByTestId\` locators, web-first \`expect\`, no \`waitForTimeout\`, existing fixtures and page objects reused, no hard-coded secrets or URLs.
4. **Check for hallucinations**: invented APIs, options or selectors that do not exist in the app.
5. **Stability**: \`--repeat-each=10\` and run in CI before merging.
6. **Data and privacy**: never paste credentials, customer data or proprietary code into tools not approved by the company.

    // AI draft often looks like this — reject it:
    await page.waitForTimeout(3000);
    expect(await page.locator('.msg').isVisible()).toBe(true);
    // Accept this:
    await expect(page.getByRole('status')).toHaveText('Saved');

Measure the gain honestly (time saved, review rework) rather than claiming a fixed percentage.`,
    followUps: [
      {
        q: 'How do you stop a team from merging low-quality AI tests?',
        a: 'Same gates as human code: PR review, lint rules (no hard waits, no .only), mandatory CI run, and a checklist item "test was seen failing for the right reason".',
      },
    ],
    topic: 'ai-daily-qa',
    source: GHL,
  },
  {
    id: 'co-ai-gohighlevel-2',
    company: 'GoHighLevel',
    area: 'ai',
    role: 'Lead SDET',
    round: 'Technical round 3 (advanced automation and leadership)',
    difficulty: 'hard',
    question: 'What is MCP, and how is it relevant to test automation?',
    answer: `**MCP (Model Context Protocol)** is an open protocol that lets an AI assistant/agent call external **tools** and read **resources** through a standard interface. An *MCP server* exposes capabilities (e.g. "navigate", "click", "query Jira", "run SQL"); an *MCP client* inside the AI app (IDE assistant, chat agent) discovers and calls them. It replaces one-off plugins with one protocol.

**Relevance to testing**
- **Playwright MCP** server exposes browser actions to an agent using the page's **accessibility snapshot** (roles and names) rather than screenshots, so an agent can explore a page, reproduce a bug from steps, or draft a Playwright test using \`getByRole\`-style locators.
- MCP servers for Jira/GitHub/DB let an agent read a story, look at the PR diff and check data while proposing tests.
- Useful for exploratory assistance, quick reproductions and test drafting.

**Cautions a lead should raise**
- Agent output is non-deterministic; the committed artefact must still be a normal, reviewed Playwright test that runs in CI without the AI.
- Security: MCP servers can act with real credentials — least privilege, test environments only, watch for prompt injection from page content.
- Cost and speed: agent-driven runs are slow and expensive compared with scripted tests.`,
    followUps: [
      {
        q: 'Would you run your regression suite through an AI agent via MCP?',
        a: 'No. Regression needs deterministic, fast, repeatable checks; use the agent to explore and draft, then commit plain Playwright tests.',
      },
    ],
    topic: 'ai-basics',
    source: GHL,
  },

  // ---------------- Equall ----------------
  {
    id: 'co-ai-equall-1',
    company: 'Equall',
    area: 'ai',
    role: 'SDET 3 (Founding QA)',
    round: 'Round 1 (Engineering Head discussion)',
    difficulty: 'medium',
    question: 'What do you understand by auto-healing in test automation, and would you rely on it?',
    answer: `**Auto-healing** means the tool notices that a locator no longer matches (e.g. an ID changed) and finds the "same" element using other signals — remaining attributes, text, position, DOM similarity or an ML model — then continues the test and usually suggests an updated locator. Several commercial tools and AI add-ons offer it; agent-based tools can also re-plan a step from an accessibility snapshot.

**Benefits**: fewer red builds from cosmetic UI changes, less locator maintenance.

**Risks**:
- It can **heal into the wrong element** and turn a real bug into a pass (e.g. a button moved or relabelled because of a product defect).
- Hidden changes: the suite passes but nobody reviewed what changed.
- Non-determinism and vendor lock-in.

**My stance**: reduce the need for healing first — resilient locators (\`getByRole\`, \`getByLabel\`, \`getByTestId\`) and agreed test IDs make most breakages disappear. If we use healing, it must be **report-only or review-gated**: healed steps are flagged in the report, the suggested locator goes through a PR, and healing is never allowed on assertions.

    // resilient by design — survives class/ID refactors
    await page.getByRole('button', { name: 'Place order' }).click();`,
    followUps: [
      {
        q: 'How would you detect that a heal was wrong?',
        a: 'Strong assertions after the action (URL, confirmation text, API state) will fail if the wrong element was used; plus a review of every healed step in the report.',
      },
    ],
    topic: 'ai-daily-qa',
    source: EQUALL,
  },
  {
    id: 'co-ai-equall-2',
    company: 'Equall',
    area: 'ai',
    role: 'SDET 3 (Founding QA)',
    round: 'Round 1 (Engineering Head discussion)',
    difficulty: 'easy',
    question: 'Which AI-assisted coding tools have you used, and how do they fit into your automation work?',
    answer: `Name the tools you have really used (e.g. GitHub Copilot, Cursor, Claude Code, ChatGPT) and show a **controlled workflow**:

1. **Context first** — give the tool your conventions: an example spec, the page object pattern, fixtures, locator rules. Output quality depends on this.
2. **Small, reviewable steps** — "generate the page object for this form", "add negative cases", not "write my framework".
3. **Typical uses** — scaffolding specs and page objects, test data builders, converting Selenium code to Playwright, regex/JSON-path helpers, CI YAML, explaining errors and traces, summarising a failing run.
4. **Verification** — run every generated test, watch it fail for the right reason, check for invented APIs, lint and type-check.
5. **Guardrails** — company-approved tools only, no secrets or customer data in prompts, generated code reviewed like any PR.

    // Prompt idea: "Using our LoginPage and the 'test' from fixtures.ts,
    // write 3 negative login tests for SauceDemo with getByRole/getByPlaceholder
    // and web-first expect; no waitForTimeout."

A good closing line: AI speeds up typing and first drafts; test design, risk judgement and review stay with the engineer.`,
    followUps: [
      {
        q: 'Where does AI help least in testing?',
        a: 'Deciding what matters to test (risk, business rules, domain edge cases) and judging whether a result is actually correct; those still need human context.',
      },
    ],
    topic: 'ai-daily-qa',
    source: EQUALL,
  },

  // ---------------- Quantum Capital AI Labs ----------------
  {
    id: 'co-ai-quantum-capital-ai-labs-1',
    company: 'Quantum Capital AI Labs',
    area: 'ai',
    role: 'QA / Automation Engineer (Founding QA)',
    round: 'Round 1 (exploratory discussion with Product Head)',
    difficulty: 'medium',
    question: 'How would you approach testing an internal ChatGPT-like product, and what scenarios would you cover?',
    answer: `Start with **scope and risk**: who uses it, what data it can see, what it must never do. Then cover layers:

**Functional / answer quality**
- Correct, relevant answers for a curated **golden set** of real questions; follows instructions and format.
- Multi-turn context: remembers earlier turns, handles corrections, new chat resets context.
- Grounding: says "I don't know" instead of inventing company facts.

**Safety and security**
- Prompt injection and jailbreak attempts; refusal of disallowed content.
- **Data access**: user A cannot get user B's or restricted documents; no secrets or PII leakage.

**Robustness**: typos, other languages, very long inputs, empty input, emojis, code blocks.

**Non-functional**: latency (time to first token), streaming, timeouts and error messages, rate limits, cost per query, load.

**UI/UX**: streaming display, stop/regenerate, copy, feedback buttons, history, accessibility.

**Automation approach**
- Deterministic parts (UI, auth, API contract, streaming) with Playwright.
- Answers checked by **properties**, not exact text: contains key facts, cites a source, matches schema, plus an LLM-as-judge or human review for a sample.

    await page.getByRole('textbox', { name: 'Message' }).fill('What is our leave policy?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByTestId('answer').last()).toContainText(/leave/i, { timeout: 30_000 });`,
    followUps: [
      {
        q: 'How do you handle the fact that answers differ between runs?',
        a: 'Assert on properties and rubrics instead of exact text, run each prompt several times, and track pass rates over the golden set rather than single results.',
      },
    ],
    topic: 'ai-chatbot-testing',
    source: QUANTUM,
  },
  {
    id: 'co-ai-quantum-capital-ai-labs-2',
    company: 'Quantum Capital AI Labs',
    area: 'ai',
    role: 'QA / Automation Engineer (Founding QA)',
    round: 'Round 2 (technical, with an AI Engineer)',
    difficulty: 'hard',
    question: 'How would you test a RAG (Retrieval-Augmented Generation) system?',
    answer: `A RAG system = **retrieve** relevant chunks from a knowledge base, then **generate** an answer from them. Test the two halves separately and then together.

**1. Ingestion** — documents parsed correctly (tables, PDFs), chunking sensible, metadata and permissions preserved, updates/deletions reflected in the index.

**2. Retrieval** — for a labelled question set, does the top-k contain the right chunks? Measure recall@k / precision@k / MRR; test synonyms, typos, multiple languages, and questions with no answer in the corpus.

**3. Generation** — on the retrieved context:
- **Faithfulness/groundedness**: every claim supported by the context (no hallucination).
- **Answer relevance and completeness**.
- **Citations** point to the right sources.
- Refuses or says "not found" when context lacks the answer.

**4. End to end** — golden Q&A set with expected facts; tools like Ragas/DeepEval or an LLM-as-judge with a rubric, calibrated against human ratings.

**5. Security and access** — users only retrieve documents they are allowed to see; prompt injection hidden inside documents; PII handling.

**6. Non-functional** — latency split (retrieval vs generation), cost, behaviour at scale, regression runs whenever the model, prompt, embeddings or chunking change.`,
    followUps: [
      {
        q: 'An answer is wrong. How do you find out whether retrieval or generation failed?',
        a: 'Inspect the retrieved chunks for that query: if the right chunk is missing, it is a retrieval/indexing problem; if it is present but the answer ignores or contradicts it, it is generation/prompting.',
      },
    ],
    topic: 'ai-chatbot-testing',
    source: QUANTUM,
  },
  {
    id: 'co-ai-quantum-capital-ai-labs-3',
    company: 'Quantum Capital AI Labs',
    area: 'ai',
    role: 'QA / Automation Engineer (Founding QA)',
    round: 'Round 2 (technical, with an AI Engineer)',
    difficulty: 'medium',
    question: 'What are the key validation points for an LLM-based application, and how do you evaluate response quality and accuracy?',
    answer: `**Validation points**
- **Correctness** of facts against a source of truth.
- **Relevance** to the question and **completeness**.
- **Groundedness** — no hallucinated facts, numbers, links or citations.
- **Instruction and format compliance** — JSON schema, length, tone, language.
- **Safety** — toxic/biased content, refusals where required, prompt-injection resistance, no PII or secret leakage.
- **Consistency** — similar questions give compatible answers; behaviour stable across runs.
- **Non-functional** — latency, cost/tokens, error handling, rate limits.

**How to evaluate**
1. **Golden dataset**: real, labelled prompts with expected facts/behaviour, including edge and adversarial cases.
2. **Deterministic checks first**: schema validation, required keywords/entities, regex, forbidden content, length.
3. **Semantic checks**: embedding similarity to a reference answer.
4. **LLM-as-judge** with a clear rubric (score 1–5 on correctness, groundedness), validated against human ratings on a sample.
5. **Human review** for high-risk domains and to calibrate the judges.
6. **Run repeatedly** (temperature effects) and track pass rate per category over time; rerun on every model/prompt change.
7. **Production signals**: thumbs up/down, escalation rate, flagged answers feeding back into the dataset.`,
    followUps: [
      {
        q: 'What is the weakness of LLM-as-judge?',
        a: 'The judge can be biased (prefers longer or its own style), inconsistent and also hallucinate; calibrate it against human labels and keep deterministic checks where possible.',
      },
    ],
    topic: 'ai-chatbot-testing',
    source: QUANTUM,
  },
  {
    id: 'co-ai-quantum-capital-ai-labs-4',
    company: 'Quantum Capital AI Labs',
    area: 'ai',
    role: 'QA / Automation Engineer (Founding QA)',
    round: 'Round 2 (technical, with an AI Engineer)',
    difficulty: 'medium',
    question: 'What challenges make AI-powered systems harder to test than traditional software?',
    answer: `1. **Non-determinism** — the same input can give different outputs (sampling, model updates). Exact-match assertions break; you need property checks, rubrics and repeated runs.
2. **No single correct answer** — many valid phrasings; "expected result" becomes a set of criteria.
3. **Huge input space** — free text, many languages, adversarial prompts; you cannot enumerate cases, so risk-based sampling and golden sets matter.
4. **Hallucinations** — confident, plausible but false output that a simple check will not catch.
5. **Hidden dependencies and drift** — model version, prompt, embeddings, retrieved data and third-party APIs all change behaviour; regression must re-run on each change, and production needs monitoring.
6. **Safety and security** — prompt injection, data leakage, bias and toxicity are new failure classes.
7. **Evaluation cost** — LLM-as-judge and human review cost time and money; tests are slower.
8. **Explainability** — hard to tell *why* an answer was wrong, so debugging needs logs of prompts, context and model parameters.

**Mitigations**: pin model versions in tests, log full prompts/context, keep deterministic layers (UI, API, auth) under normal Playwright automation, and build a growing evaluation dataset from production failures.`,
    followUps: [
      {
        q: 'Which parts of an AI product can still be tested deterministically?',
        a: 'UI flows, authentication and permissions, API contracts and schemas, streaming and error handling, rate limits, and any guardrail or post-processing code around the model.',
      },
    ],
    topic: 'ai-basics',
    source: QUANTUM,
  },
];
