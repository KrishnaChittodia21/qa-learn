# QA Learn: Manual Testing, JavaScript & Playwright

A React app for preparing for QA / automation interviews topic by topic: manual testing, API testing and SQL, the
JavaScript you need for Playwright, Playwright from first test to CI, and interview prep. Built the same way as
`system-design-learn`.

Content was researched from the ISTQB CTFL v4.0 syllabus, the Playwright docs, javascript.info and MDN, the Postman
Learning Center, SQLBolt, well-known testing authors (Bach & Bolton, Hendrickson, Crispin & Gregory, Myers, Copeland),
and real interview reports. Each topic lists its sources.

## Run

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # static build in dist/ (hash routing, works on any static host)
    npm run validate   # checks every topic and coding problem against the content rules

## What's inside

- **7 phases:** Manual Testing Foundations → Test Design, Defects & Agile → API Testing & SQL → JavaScript for Testers →
  Playwright Fundamentals → Playwright Framework & CI → QA Interview Prep.
- **Every topic has:**
  - Learn: 8–12 sections with examples, code and diagrams, plus **animated, step-through visualisations** (STLC, defect
    life cycle, BVA/EP, decision tables, build gates, the JS event loop, array methods, references vs copies, HTTP
    request/response, SQL joins, Playwright auto-waiting, locator resolution, hook/fixture order, workers/shards/retries)
  - Improve This: fix a weak bug report / test case, or buggy JavaScript / a flaky Playwright test, with hints and a reference solution
  - 7+ interview questions: draft your answer, then reveal the model answer, follow-ups and pitfalls, and rate yourself
  - Practice drills: worked exercises revealed step by step (derive BVA values, predict JS output, estimate suite run time…)
  - A cheat sheet
  - A 15-question timed exam with shuffled questions and multi-select questions
- **JavaScript coding practice:** array, string, object, logic, async and QA-utility problems. You write the function in the
  browser, the app runs visible and hidden tests in a Web Worker, then you compare with the reference solution.
- **12-week roadmap:** week-by-week plan with deliverables, practice sites (SauceDemo, The Internet, Restful Booker…),
  priority order and resources.
- **Weak areas:** tracks wrong answers and points you to the section to revise.

Progress is saved in your browser's localStorage. You can reset it in Settings.

## Playwright Lab (judge)

A hands-on lab where you write **real Playwright tests** for **QA Shop**, a small practice web app (`practice-app/`),
and an automatic judge grades them. Open **Practice → Playwright Lab (Judge)** in the app (`#/pw-lab`) for the specs.

Setup (Node 22.18 or newer):

    npm install
    npx playwright install chromium     # once
    npm run practice-app                # QA Shop on http://localhost:4400 (explore it by hand first)
    npm run practice:test               # run your tests in practice/tests against that running app
    npm run judge                       # grade your tests (starts its own app servers)
    npm run judge -- --step step4       # grade one step
    npm run judge -- --reference        # self-check: the hidden reference suite must score 100%

- Write tests in `practice/tests/*.spec.ts` and tag each with its step: `test('…', { tag: '@step3' }, async ({ page }) => {…})`.
  Use relative URLs (`page.goto('/cart.html')`); the judge sets `baseURL` through `PRACTICE_URL`.
- **How scoring works (mutation testing).** Each of the 8 steps has 4–5 hidden, deliberately seeded bugs (34 in total),
  switched on with `BUGS=<id> node practice-app/server.mjs`. For each step that has tagged tests, the judge:
  1. runs the step's tests twice against the correct app: they must all pass both times (otherwise the step is reported as
     failing or flaky and isn't scored);
  2. runs them once against each bug of that step: the bug is **caught** if at least one test fails;
  3. flags quality issues (`waitForTimeout`, `page.$`, `waitForSelector`, XPath or long CSS chains, no `expect`, missing
     `await`, hard-coded `localhost` URLs).
- Results go to `public/judge-results.json` (git-ignored), which the Lab page reads (press **Refresh results**). Caught bugs
  are revealed; missed ones show only a hint category. The judge runs locally, so it does not work on a deployed static build.
- It's a learning tool, not an exam: the bug list (`judge/mutants.json`) and a reference suite (`judge/reference/`) are in the
  repo, so a determined learner could read the answers. Don't, until you've tried.

## Adding content

Topic files live in `src/content/topics/*.ts`, coding problems in `src/content/coding/*.ts`, animations in
`src/viz/widgets/<id>/`. All must match `src/types.ts`. See `CONTENT_GUIDE.md` for the rules, then run `npm run validate`.
