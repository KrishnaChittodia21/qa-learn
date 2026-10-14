# Content Authoring Guide (for topic writers)

This is a QA-engineer interview-prep app. The learner is a **manual tester moving into automation**: comfortable with
testing ideas, new to JavaScript and Playwright, preparing for QA / SDET-1 / automation interviews (India and global
product companies and service companies). Teach **simply first, then deep**. Assume no programming background in the
JavaScript phase; assume the JavaScript phase is done by the Playwright phases.

Every topic file is a TypeScript module that default-exports a `Topic` (see `src/types.ts`; it is the contract; read it first).

## File format

Path: `src/content/topics/<topic-id>.ts`

```ts
import type { Topic } from '../../types';

const topic: Topic = {
  id: 'mt-test-design',
  phase: 'manual-advanced',
  order: 1,
  title: '...',
  // ...
};

export default topic;
```

- Use template literals for multi-line strings (markdown bodies, code). **Escape every backtick inside a template literal as \` and every `${` as `\${`.** This matters a lot for JavaScript/Playwright code that uses template strings: write `\`Hello \${name}\`` inside the outer template literal.
- Markdown fields: GFM supported (tables, bold, lists, inline code with escaped backticks). **No fenced code blocks inside markdown**; put code in `code: CodeSnippet[]`.
- ASCII diagrams go in `diagram` (monospace). Keep them ≤ 80 columns.
- IDs must be unique app-wide: prefix every id with the topic id, e.g. `mt-test-design-mcq-07`, `mt-test-design-iq-03`, `mt-test-design-drill-2`, `mt-test-design-cc-1`.
- Only erasable TypeScript in topic files (they are imported by Node with type stripping): no enums, no namespaces.

## Required volume per topic (minimum, enforced by the validator)

| Field | Count | Notes |
|---|---|---|
| sections | 8–12 | Teach simply first, then go deep. Most sections have a code snippet, a table, or a diagram. |
| cheatSheet | 8–12 | One-line, dense, revision-ready bullets. |
| codeChallenges | 2 | "Improve this": see below. |
| interviewQuestions | 7 | Real interview style, with 2–4 follow-ups and 2–4 pitfalls each. |
| envelopeQuestions | 3 | Shown in the UI as **Practice Drills** (worked exercises). See below. |
| test (MCQ) | 15 | Timed exam questions. |

## Teaching sections: "simple and fast, then deep"

- Open each section with a 1–2 sentence plain-English intuition (an everyday analogy is welcome), then the precise
  definition/mechanics, then a worked example, then "in interviews, say this" or "common mistake".
- Use comparison tables where ideas are commonly confused (verification vs validation, smoke vs sanity, severity vs
  priority, `==` vs `===`, `let` vs `const` vs `var`, `page.waitForTimeout` vs web-first assertions, `toBeVisible` vs `isVisible`).
- **Worked examples are mandatory** for manual topics: a real feature (login page, e-commerce checkout like SauceDemo,
  a booking API like Restful Booker, an ATM, a coupon field) with actual test cases / tables / bug reports.
- Code:
  - JavaScript phase: modern JavaScript (ES2022+), runnable in Node. Show the **output** as comments (`// → [2, 4, 6]`).
  - Playwright phases: TypeScript using `@playwright/test` exactly as the official docs do (current APIs:
    `getByRole`, `getByLabel`, `getByTestId`, web-first `expect(locator)...`, fixtures, `test.step`, `storageState`,
    `request` fixture, `page.route`). Prefer realistic targets: `https://www.saucedemo.com`,
    `https://the-internet.herokuapp.com`, `https://restful-booker.herokuapp.com`, `https://demo.playwright.dev/todomvc`.
    Keep types light so a JavaScript learner can read it. Never use deprecated APIs (`page.$`, `page.waitForSelector` as
    a default habit, `elementHandle` actions, `page.type`) except to show why they are discouraged.
  - API/SQL: `http` request examples (`language: 'http'`), JSON, Postman test scripts (`pm.test`, `pm.expect`,
    `pm.environment.set`), SQL (standard; mention MySQL/PostgreSQL differences only where they matter).
  - Manual: test cases, bug reports, test-plan excerpts, RTM tables as `language: 'text'` snippets or markdown tables,
    Gherkin (`language: 'gherkin'`) for BDD acceptance criteria.
  - 8–45 lines per snippet. Comment the non-obvious lines. No pseudo-code that wouldn't run.
- `source` on a section cites where the idea comes from, e.g. `"ISTQB CTFL v4.0 syllabus — 4.2.2 Boundary Value Analysis"`,
  `"Playwright docs — Auto-waiting (actionability)"`, `"javascript.info — Array methods"`, `"Lee Copeland — A Practitioner's Guide to Software Test Design, Ch 4"`,
  `"James Bach & Michael Bolton — Rapid Software Testing"`, `"Elisabeth Hendrickson — Explore It!"`, `"Lisa Crispin & Janet Gregory — Agile Testing"`,
  `"Kyle Simpson — You Don't Know JS Yet"`, `"Marijn Haverbeke — Eloquent JavaScript"`, `"Debbie O'Brien / Playwright team"`,
  `"Butch Mayhew — Playwright blog"`, `"Glenford Myers — The Art of Software Testing"`. Cite only what you actually used.

## Research (MANDATORY)

Load `WebSearch` / `WebFetch` via ToolSearch. Research each topic before writing:
official docs (playwright.dev, MDN, javascript.info, ISTQB CTFL v4.0 syllabus PDF, Postman Learning Center, SQLBolt),
famous authors/teachers (above), Ministry of Testing, Test Automation University, Guru99, Software Testing Help,
GeeksforGeeks, and real interview reports (Glassdoor, AmbitionBox, LeetCode Discuss, Reddit r/QualityAssurance,
r/softwaretesting, Medium interview write-ups from 2024–2026). **Rewrite everything in your own words. Never paste text.**
Verify every API name and behaviour against the official docs (e.g. Playwright's actionability checks, default timeouts
— `expect` 5s, test 30s — `retries`, `fullyParallel`, `trace: 'on-first-retry'`). List the sites you used in the topic's `sources`.

Only when a source clearly reports a question at a named company, put that in the interview question's `context`, e.g.
`'Reported in Infosys QA interviews on AmbitionBox (2025). …'`. **Never invent attributions.**

## Question quality bar: practical, not trivia

Audience is junior-to-mid QA. Calibrate difficulty honestly: `easy` (warm-up), `medium` (typical interview),
`hard` (strong candidate), `expert` (SDET-level).

### MCQs (test)
- Prefer **scenario, "which test catches this bug", "what does this code print / do", "why is this test flaky",
  "which locator is best"** questions over pure definitions. At most 3 definition-style questions per topic.
- Mix: ~3 `easy`, ~6 `medium`, ~4 `hard`, ~2 `expert`. At least 4 use `code` (code to reason about; for manual topics a
  test case, a bug report, a requirement or a table as `language: 'text'`), at least 3 are multi-select (`correct` has
  2–3 indexes; phrase with "Select ALL that apply").
- 4 options (5 allowed for multi-select). Distractors must be plausible to a beginner (common misconceptions).
  Similar option lengths; no "all/none of the above".
- `explanation`: why the right answer is right AND why each tempting distractor is wrong (2–5 sentences, ≥ 80 chars).
- `followUps`: 1–2 per MCQ: the interviewer's next probe on that exact question.

### Interview questions
- Phrase them as a real QA interviewer would ("You found a bug the developer can't reproduce. What do you do?",
  "Write test cases for a login page", "Your Playwright test passes locally but fails in CI. Walk me through it.",
  "Reverse an array without using reverse()").
- `whatInterviewerLooksFor`: 3–5 signals.
- `modelAnswer`: structured markdown, 150–400 words (≥ 400 characters), concrete examples.
- `followUps`: 2–4 `{ q, a }` with answers of 40–150 words.
- `pitfalls`: 2–4 things weak candidates say.

### Practice Drills (`envelopeQuestions`)
Worked exercises the learner attempts in a text box, then reveals step by step:
- Manual: "Derive BVA and EP test values for…", "Fill this decision table…", "Write 8 test scenarios for…",
  "Classify severity/priority for these 5 bugs…", "Draft the RTM for these 4 requirements…".
- JS: "Predict the output of this snippet line by line…", "Trace this reduce() step by step…".
- Playwright/CI: "200 tests, 12s avg, 4 workers, 2 shards, 10% retried — estimate wall time", "Pick the right locator for
  each of these 5 elements", "Order these hook logs".
- `question` (may include a short inline snippet using inline code), `assumptions` = the givens, `steps` = `{ label, calc }`
  showing the working, `answer` (markdown), `insight` = the takeaway, `followUps` ≥ 1.

### Code challenges ("Improve this")
- JS/Playwright: starter has realistic bugs/smells (missing `await`, `waitForTimeout`, brittle CSS/XPath locators,
  `isVisible()` used as an assertion, shared state between tests, hard-coded credentials, mutation bugs in arrays,
  `==` coercion bug, unhandled promise rejection). `task` states the goal without the answer, 2–3 progressive `hints`,
  complete `solution`, `explanation` lists each fix, `followUps` 2.
- Manual topics: the starter is a **weak artifact** (`language: 'text'`): a vague bug report, test cases missing
  preconditions/expected results, a test plan without scope/exit criteria, a one-line exploratory charter. The solution
  is the strong rewrite.

## Validation (MANDATORY before you finish)

1. Type-check your files:
   `npx tsc --ignoreConfig --noEmit --strict --skipLibCheck --target es2022 --module esnext --moduleResolution bundler --verbatimModuleSyntax src/content/topics/<id>.ts`
2. Structure check: `node scripts/validate-content.mjs <id> [<id> ...]`
3. Uniqueness: `node scripts/find-similar.mjs "<draft text>"` for doubtful drafts (similarity ≥ 0.4 → rewrite).
Fix everything until both pass.

---

## JavaScript coding problems (`src/content/coding/<category>.ts`)

Each file exports `export const PROBLEMS: CodingProblem[] = [...]` (see `CodingProblem` in `src/types.ts`).
The learner writes the function in the browser; the app runs `tests` against it (deep equality on the return value).

- `fnName` must match the function in `starter` and `solution`. `starter` is `function name(args) {\n  // your code\n}`.
- Plain JavaScript only (no imports, no DOM, no Node APIs). For `async` problems the function returns a Promise; the
  runner awaits it. Arguments and expected values must be JSON-serialisable.
- 6–10 tests per problem, including edge cases (empty array, one element, negatives, duplicates), 2–4 marked `hidden: true`.
- `prompt` has the statement, 2 examples, and constraints. `explanation` covers the approach, time/space complexity, one
  alternative (e.g. "with built-ins" vs "without built-ins", since interviewers often ask for both), and what to say aloud.
- `askedIn` only when a real source reports it (Glassdoor/AmbitionBox/LeetCode Discuss/Medium). Never invent.
- IDs: `code-<category>-<slug>`.
- Verify: `node scripts/validate-coding.mjs` runs every `solution` against its tests; it must pass.

---

## Interactive visualisations (src/viz/widgets/<id>/): rules for visualisation writers

Study the reference **src/viz/widgets/circuit-breaker/** and the framework **src/viz/core.tsx** first. Learning goal:
*segmenting + interactivity + prediction*. The learner steps through states at their own pace (or presses play to watch
it animate), changes the inputs, and predicts before revealing.

Files per visualisation:
- `meta.ts`: `export const meta: VizMeta` with `id`, `title`, `blurb`, and `placements: [{ topic, heading }]`. `heading`
  is a **prefix of an existing section heading** in that topic. Place each visualisation in 1–3 sections.
- `sim.ts`: a **pure, deterministic** `simulate(params) => Frame[]`. Frames extend `BaseFrame` (`caption`, optional
  `predict`). Use `rng(seed)` from core for any randomness. No React in this file.
- `index.tsx`: `export default function …Viz()` using `useSimulation(simulate, params)`, `useFrames(frames)`,
  `VizFrame`, `Slider` and `Choice` from `../../core`. Renders the current frame as inline SVG with `className="viz-svg"`
  and a `viewBox` about 600 wide (height 220–360).

Quality bar:
- **Technically correct**: semantics must match the real behaviour (e.g. the JS event loop drains *all* microtasks before
  the next macrotask; Playwright's actionability checks are visible, stable, receives events, enabled, editable per action).
- **Frames**: 12–40 per run, each with a precise 1–2 sentence caption. ≥ 2 `predict` prompts at the "aha" moments.
- **Parameters**: 2–4 meaningful ones (sliders or choices) that change the outcome.
- **Styling**: only the CSS variables (`var(--good)`, `--bad`, `--warn`, `--accent`, `--muted`, `--border`,
  `--surface-2`, `--text`, `--text-2`, plus matching `*-soft`) and existing classes (`viz-svg`, `viz-label`,
  `viz-edge`, `viz-node`, `viz-node-label`, `viz-dot`, `viz-outage`, `viz-key`). Must look right in light and dark.
  Do not edit `src/index.css` or `src/viz/core.tsx`.
- **Motion**: CSS transitions on SVG attributes/transforms (moving tokens, filling bars, colour changes) so stepping
  feels animated. `.viz` disables them under reduced motion. No JS animation loops.
- **Accessibility**: the SVG gets `role="img"` and an `aria-label` summarising the current state.

Verify: test `sim.ts` with Node in your scratchpad, then `npx tsc -p tsconfig.app.json --noEmit` and `npm run -s build`.

---

## Auto-judged JavaScript labs (codeChallenges in JavaScript topics)

In `js-*` topics every code challenge is auto-judged: add `fnName` (the function the learner fixes) and `tests`
(`CodingTest[]`: `{ args, expected, hidden? }`, JSON-serialisable, 5–8 tests, 1–3 hidden) to the `CodeChallenge`.
The app runs the learner's edited starter in the browser against the tests. Rules:
- `starter.code` and `solution.code` both define `function <fnName>(...)` (a plain function declaration; helper
  functions and constants alongside it are fine). No imports, DOM or Node APIs. Async labs return a Promise.
- The buggy starter must **fail at least one test** (that test is what catches the bug) and the solution must pass all.
- Tests target the bug the lab is about, plus normal cases and edge cases.
- `node scripts/validate-content.mjs <id>` enforces both rules.
