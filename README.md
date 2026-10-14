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

## Adding content

Topic files live in `src/content/topics/*.ts`, coding problems in `src/content/coding/*.ts`, animations in
`src/viz/widgets/<id>/`. All must match `src/types.ts`. See `CONTENT_GUIDE.md` for the rules, then run `npm run validate`.
