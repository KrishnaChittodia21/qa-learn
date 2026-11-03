# qa-learn · feature parity milestones

Plan for bringing qa-learn up to what system-design-learn (`../system-design-learn`, "SDL" below) already has:
Shorts, more achievements, more and interactive animations, profile, admin, sign-in with locked content, Save for
later, Guide Me tour, "read less, view more" and "learn more" sections, and a real test suite. **Security audit
and deployment come last.**

**Approach:** copy what SDL already built instead of designing again, into **qa-learn's own service, database and
collections**. SDL is read-only reference: nothing in `../system-design-learn` (code, service, database, Atlas
project, Render or Vercel project, secrets, CI) is changed. Its code is copied into this repo, not imported from it.

## Where qa-learn is today

| Area | qa-learn now | SDL has (port from) |
|---|---|---|
| Hosting | GitHub Pages (`.github/workflows/deploy.yml`, `base: './'`) | Vercel app + Render service, `/api/*` rewrite (`vercel.json`, `render.yaml`) |
| Accounts | none; progress in `localStorage` (`qa-learn-progress-v1`, `src/lib/progress.ts`) | Better Auth, `src/lib/session.ts`, `src/lib/api.ts`, `src/pages/Auth.tsx`, synced progress (`src/lib/progress-ops.ts`) |
| Answers | MCQ `correct[]` and interview `answer` ship in the bundle (`src/types.ts`) | answer-key split at build time, graded and revealed by the service |
| Achievements | 29 in `src/content/achievements.ts` (21 + 8 phase graduates), celebration, summary | computed on the server, `CelebrationWatcher.tsx` |
| Tour | `WelcomeTour.tsx` only | `lib/guide.ts`, `PageGuide.tsx`, `Walkthrough.tsx`, `lib/pageGuides.ts` ("Guide me" per page, "Show me" walkthroughs) |
| Animations | `motion`, 33 viz widgets in `src/viz/widgets`, `lib/motionPresets.ts` | `RouteMotion.tsx`, `usePageMotion.ts`, GSAP, step lessons |
| Shorts | none | `ShortPlayer.tsx`, `ShortThumb.tsx`, `lib/shorts.ts`, `pages/Shorts.tsx`, `pages/Short.tsx` |
| Saved | none | `SaveButton.tsx`, `pages/Saved.tsx`, `saved[]` in progress |
| Profile / Admin | Settings page only | `pages/Profile.tsx`, `pages/Admin.tsx`, `api/src/admin.ts` |
| Locks | none | `LockedPreview.tsx` (`LockedBanner`, compact overlay) |
| Tests | `practice/` Playwright specs (learner exercises, not app tests); no `npm test` | `tests/*.test.ts` on `node --test`, `api/test/*` |

## Decisions

| Area | Choice | Why |
|---|---|---|
| Backend | **Own service `qa-api`** in `api/` in this repo: Fastify + TypeScript, started as a copy of SDL's `api/src` | Fully separate from SDL; the copy starts with SDL's auth, rate limits, validation and audit fixes already in it |
| Database | **Own Atlas project and M0 cluster**, database `qa_learn` | No shared cluster, users, keys or quotas with SDL (an M0 is free per Atlas project) |
| Service hosting | **Own Render service** under a separate Render account (or paid instance) | Render free gives ~750 h a month per account; SDL's always-on service already uses it, so a second always-on service on the same account runs out mid-month |
| Accounts | Separate users: a qa-learn account is not an SDL account | Own Better Auth collections in `qa_learn`; no SSO |
| Answers | Same build-time split as SDL M1 | Locked content means nothing if the answer is already in the bundle |
| Animation library | Keep `motion`; add GSAP only if a Short or step needs a timeline `motion` can't do | No second animation library for a few effects |
| Tests | `node --test` for logic (as SDL), Playwright for app journeys | Playwright is already installed, and it's a QA app: its own suite is a showcase |
| Hosting | Move to **Vercel** in the last milestone | GitHub Pages can't rewrite `/api/*` (needed for a first-party session cookie) or set CSP headers |

**Product rules (same as SDL, QA content names):**

- **Open without an account:** Learn sections, viz animations, step lessons, Shorts (one more unlocked each day you
  sign in, as SDL), Roadmap, Playground, PW Lab overview.
- **Locked until sign-up** (`LockedBanner` with a blurred preview, never a hidden page): topic exams and their
  answers, interview model answers, company questions, coding-problem solutions and judge runs, Achievements,
  Streak, Study activity, Saved sync, Weak areas.
- Scores, achievements and unlocks are computed on the server.
- Everything that works logged out keeps working from `localStorage` and is imported once on first login.

## Collections (database `qa_learn`)

Same shapes as SDL's, without any `app` field: everything in this database belongs to qa-learn.

| Collection | Purpose |
|---|---|
| `users` | email, name, `avatarUrl`, `role: 'user' \| 'admin'`, `prefs { theme, accent, tourSeen }`, `lastActiveAt`, `createdAt` |
| `session`, `account`, `verification` | Better Auth (managed by the library, expired rows auto-deleted) |
| `progress` | one per user (unique `userId`): per-topic `{ status, bestScore, sectionsRead[] }`, coding results, PW Lab steps, `shortsWatched`, `stepMisses`, `saved[]` (max 500), `achievements[]`, `activityDays[]`, `version` |
| `answer_keys` | one per question id with `topicId`: MCQ `correct[]`, explanation, interview model answer, follow-ups, `contentHash` |
| `coding_solutions` | reference solutions and hidden judge cases per coding problem |
| `company_questions` | company track, served only once unlocked |
| `exam_sessions` | server-timed exams (TTL 24 h) |
| `exam_daily` | per-day exam counters for Admin (TTL 90 days) |
| `feedback` | `{ userId, type, page, message, status, createdAt }`; users create, admins read |

## Milestones

Each milestone ships something testable on its own and adds its own tests (M0 sets that up).

### Now · before M0 · 15 min

- Check whether `KrishnaChittodia21/qa-learn` is public (GitHub Pages on a free plan needs a public repo). If it is,
  every MCQ answer and interview answer is already public in the repo and the deployed bundle. Make it private
  before M1 and treat today's answers as exposed: add or reword questions over time.

### M0 · Test harness · 2–3 h

- `npm test` → `node --no-warnings --test 'tests/*.test.ts'` (SDL's setup, no new dependency).
- First tests for logic that exists today: `lib/progress.ts` (load/save/migrate), `lib/streak.ts`,
  `lib/achievements.ts` unlock rules, `lib/weak.ts`, `lib/nextStep.ts`.
- `test:e2e` → a Playwright config for the app itself (separate from `practice/playwright.config.ts`), one smoke
  journey: Home → topic → read a section → exam.

**Done when:** `npm test` and `npm run test:e2e` pass locally and every later milestone adds to them.

**As built:** `npm test` runs `tests/*.test.ts` (40 tests: progress store, streaks, badges, weak areas, next step),
loading source through Vite's `runnerImport` (`tests/helpers.ts`, with an in-memory `localStorage`). `npm run
test:e2e` uses the root `playwright.config.ts` (`e2e/`, desktop + Pixel 7, starts Vite on 5179); `e2e/smoke.spec.ts`
covers Home → first lesson → tick a section (survives reload) → mark all read → exam → result, closing badge
celebrations as they appear. Found on the way: the duplicate page during route changes (fixed in M6).

### M1 · Own service, database and answer-key split · 12–18 h

- **Accounts:** a new Atlas project + M0 cluster (database `qa_learn`, an app user with read/write on `qa_learn`
  only, a read-only backup user), Render account, Turnstile site, email sender. `.env.example`, no secrets in git.
- **Service:** copy SDL's `api/` into `api/` here and rename to `qa-api`: `config.ts` (checked env, `MONGODB_DB=qa_learn`),
  `app.ts` (error format, schema rule, helmet, CORS for the qa-learn origin only, rate limits), `server.ts`, health
  check, index creation for the collections above. Drop SDL-only parts (`enrolledApps`, learner count, study plan).
- **Answer-key split:** build step that splits `src/content` into public content and the answer key (adapted from
  SDL's `scripts/content-split.ts` and `scripts/check-bundle.mjs`), covering MCQ `correct[]`, interview `answer`,
  company answers and coding reference solutions + hidden judge cases. `cd api && npm run sync:answers` upserts
  into `qa_learn` by content hash (refuses to delete more than 10% without `--allow-delete`).
- Vite dev proxy `/api` → `localhost:3001` (not 3000, so both apps can run side by side locally).

**Done when:** `qa-api` runs locally against `qa_learn` with health, validation and rate limits; the built bundle
has no answers (`.map` files included); `qa_learn` holds the answer key; `git status` in `../system-design-learn`
is unchanged.

**As built:** `scripts/content-split.ts` splits topics (MCQ `correct`/`explanation`/`followUps`; interview looks-for,
model answer, follow-ups, pitfalls; lab `solution`/`explanation`/`followUps`; drill assumptions, steps, answer,
insight, follow-ups), coding problems (`solution`, `explanation`, `followUps`) and company questions (`answer`,
`followUps`); the UI keeps `multi`, `assumptionCount` and `stepCount` hints. `npm run build:split` builds with the split
(`ANSWER_SPLIT=1`, Vite plugin in `vite.config.ts`) into `dist-split/` and runs `scripts/check-bundle.mjs`: 0 answers
over 5,547 probes (today's normal `dist/` fails it with 5,549). The normal build keeps answers until M2 switches the
app to the service, so the split build doesn't run as an app yet. Coding and lab tests (hidden ones included) stay
public because the judge runs in the browser; moving them needs server-side judging in a sandbox. Service: `api/`
(`qa-api`, Fastify 5): `config.ts` (checked env, `qa_learn`, port 3001; production needs https and `PROXY_SECRET`),
`app.ts` (error format, schema rule, helmet, CORS, 120/min per IP, `/health` with its own bucket, `x-qa-proxy`
check), `server.ts`, `sync-answer-keys.ts` (`npm run sync:answers`: 1,059 answer keys, 83 coding solutions, 200
company answers; hash-skipped, all sets checked before any write, >10% deletes refused without `--allow-delete`).
Tests: `cd api && TEST_MONGODB_URI=mongodb://127.0.0.1:27017 npm test` (15; the sync tests use a throwaway
database). Vite proxies `/api` → `localhost:3001`. Atlas, Render and the other accounts are set up before M12.

### M2 · Sign-up, synced progress and locked content · 10–14 h

- **Service:** Better Auth on `qa_learn` (copied from SDL's `auth.ts`, `auth-events.ts`, `email-check.ts`, `mail.ts`),
  per-IP limits on sign-in/sign-up/reset, `requireUser` / `requireAdmin`; progress routes (`progress.ts`: batched
  `PATCH /api/progress`, versioned, first-login import); grade and reveal routes (`practice.ts`: exams, interview
  reveals, coding solutions, company track, daily caps, flagged accounts).
- **App:** port `session.ts`, `api.ts`, `Auth.tsx`, `SignInCard.tsx`, `PasswordField.tsx`, `emailHint.ts`: sign up
  (with Turnstile), verify, log in, reset, log out.
- Replace the `localStorage` store with the synced store from SDL (`progress-ops.ts`, batched `PATCH /progress`
  every ~30 s and on page close, local cache, first-login import of `qa-learn-progress-v1`).
- Exams, interview reveals, company questions and coding solutions use those grade and reveal routes.
- `LockedPreview.tsx` on every locked area in the product rules above, with a `?next=` return to where the user was.

**Done when:** a logged-out visitor can read every Learn section but sees the sign-up prompt on each locked area;
after sign-up, local progress is imported once and shows on a second device; no answer reaches the browser
before an attempt.

**As built:** service: `api/src/auth.ts` (Better Auth on `qa_learn`: email + password, verification, reset, delete
account clearing `progress`/`exam_sessions`/`feedback`, `role` not settable), `mail.ts` (log-only without SMTP),
`email-check.ts` (throwaway and no-mail domains refused), sign-in limits in `app.ts` (per IP per route, 10 wrong
passwords per account → Turnstile or a 15-minute lock); `progress.ts` (one doc per user, batched versioned
`PATCH /api/progress`, resend dedupe, one-time import that never takes a pass or a badge, badges earned on the server
in the learner's time zone, `GET /api/me`); `practice.ts` (topic exams from the whole pool, drills of answered
questions, interview-mode locks, deadline + 60 s, reveals for interview/drill/lab/coding after 20 s and a 20-character
attempt with one-use signed tokens, company answers for any signed-in learner, 300/account and 600/IP answers a day
with flagging). Shared rules: `src/lib/progress-ops.ts`. App: `lib/api.ts`, `lib/session.ts`, synced `lib/progress.ts`
(30 s batches, flush on hide/close and before any exam start or reveal, conflict replay), `lib/answers.ts` +
`RevealButton`, `pages/Auth.tsx` (login, signup, forgot, reset), account control in the rail and phone bar,
`LockedPreview` on Achievements, Weak areas and Home's study activity, `SignInCard` on exams and the mistakes drill;
streak and badge celebrations only signed in. Answer fields are optional in `src/types.ts` (the type checker found
every screen that read one). The answer-free build is now the default (`npm run build` runs the bundle check; dev
too). Tests: app 50, service 43, e2e 4 (`e2e/account.spec.ts`: signed-out tick imported, server-graded exam, second
browser; the service runs on `qa_learn_e2e` and the tests read confirm links from `e2e/.api.log`). Bugs found by the
e2e run and fixed: sign-in navigated twice (pulled the learner back), and an exam start raced the queued "mark all as
read". **Do not merge to `main` before M12**: the Pages deploy would ship an app whose exams and answers need a service
that isn't deployed yet. Left out on purpose: Google/GitHub sign-in (not needed), locking coding judge runs (they run
in the browser, locking protects nothing), the auth-event log and flagged-accounts list (moved to M9, where Admin reads
them).

### M3 · Profile and Save for later · 8–12 h

- **Service:** `account.ts` copied (avatar upload to its own Cloudinary folder `qa-avatars/<userId>`, feedback,
  delete-account hook clearing this user's rows in `qa_learn`).
- **Profile** (port `Profile.tsx`, `Avatar.tsx`, `lib/avatar-presets.ts`): avatar, name, theme/accent (moved from
  Settings), change and reset password, delete account, "Suggest content / report a bug" feedback form.
- **Save for later** (port `SaveButton.tsx`, `Saved.tsx`): ☆ on topics, Learn sections, interview questions,
  company questions, coding problems, PW Lab steps, and Shorts (M7). Saved page with filters (All · Lessons ·
  Shorts · Questions · Coding), newest/oldest, Mark done, Remove, Clear done, count badge in the top bar.
  Works logged out, syncs after login; items whose content was removed are hidden.

**Done when:** an avatar change shows everywhere; an item saved on one device opens the right section on another
and can be marked done or removed; feedback is stored and only admins can read it.

**As built:** service `api/src/account.ts` (built-in avatars `preset:<id>` from `src/lib/avatar-presets.ts`; signed
Cloudinary upload into `qa-avatars/<userId>` only with `CLOUDINARY_URL`; any other picture URL refused; feedback 5 an
hour per account, own list, admin read and reply; account deletion removes the uploaded picture) and `PATCH /api/me`
(name 1–60 characters, `prefs.tourSeen` for M4). Save for later is a `saved` change in `progress-ops.ts` (topic, section,
interview, drill, company, coding, PW Lab step; deduplicated, 500 max, unknown content refused, not study, kept by Reset,
imported once), so it syncs like the rest of progress. App: `SaveButton` (☆ on the topic header, every section, interview
and drill cards, company cards, coding problems, PW Lab steps; signed out it explains it needs an account), `pages/Saved.tsx`
(filters, newest/oldest, Done list, Back to list, Clear done, gone content hidden, count on the Saved menu link),
`pages/Profile.tsx` (avatar picker, name, password, feedback with replies, delete account, Sign out; exam and appearance
settings stay on Settings; photo upload shows only with `VITE_AVATAR_UPLOADS=1`), `components/Avatar.tsx` (SDL's drawings,
copied). The account control shows the avatar and opens Profile, on phones too. Tests: app 53, service 47 (4 new in
`api/test/account.test.ts`), e2e account journey extended (save → Saved → done, rename, avatar, feedback). Found on the way:
a name change wiped its own "Saved." note (form keyed on the name, also in SDL), and phones had no way to reach Profile.

### M4 · Guide Me tour · 5–7 h

- Replace the single `WelcomeTour.tsx` flow with SDL's guide system: `lib/guide.ts` state, `PageGuide.tsx` (a
  "Guide me" button on every page), `Walkthrough.tsx` spotlight ("Show me" stops), `lib/pageGuides.ts` with one
  guide per qa-learn page (Home, Contents, Topic, Exam, Coding, PW Lab, Playground, Companies, Weak areas,
  Achievements, Saved, Shorts, Profile).
- First visit: the tour opens once and continues into the walkthrough. `tourSeen` is local when logged out and
  `prefs.tourSeen` on the account after login (copied up on first login so it never shows twice).
- Keyboard: Esc closes, ←/→ moves, focus trapped (`useFocusTrap.ts` already exists).

**Done when:** a new visitor gets the tour once on any device; every page has a working Guide me; the walkthrough
skips stops whose element isn't on screen.

### M5 · Achievements, second wave · 4–6 h

- New badges for the features above: first Short, Shorts streak, Saved and finished 10, first step lesson,
  Guide me completed, profile set up, coding problems by difficulty, PW Lab finished.
- Unlocks computed on the server from progress (SDL M4 rule), with `qa-api` importing qa-learn's own `src/content/achievements.ts` so app and service use one rule list.
- Port `CelebrationWatcher.tsx` so an unlock earned anywhere (including from another device) celebrates once.
- Locked logged out (rule above), with the badge grid shown blurred behind the prompt.

**Done when:** every new badge unlocks from a test fixture, server and app agree on the earned list, and an unlock
celebrates exactly once.

### M6 · More animations and interactive animations · 10–14 h

- **App motion:** port `RouteMotion.tsx` and `usePageMotion.ts` (page transitions, staggered card entrances,
  counters with `CountUp`), all using `lib/motionPresets.ts`. Reduced motion jumps instead of moving.
- **Fix (found in M0):** `Layout.tsx` wraps `<Outlet />` in `AnimatePresence` keyed by path, so during a route
  change the outgoing wrapper renders the *new* page as well: two copies on screen for a moment and the new page's
  effects run twice. Freeze each wrapper's outlet (`useOutlet()` captured once) or use SDL's `RouteMotion.tsx`.
- **Viz coverage:** list sections with no widget (`vizForSection` in `src/viz`) and add widgets where motion
  teaches something text can't: test pyramid, defect life cycle, flaky-test retries, CI pipeline stages, SQL join
  sets, HTTP request/response, async event loop. Every widget gets a "Your turn" control (predict, toggle,
  drag) as the existing `bva-ep` and `js-coercion` widgets do.
- Every widget control has a keyboard/button equivalent and an `aria-live` result.

**Done when:** each phase has at least one interactive widget per topic, page transitions run at 60 fps on a
mid-range phone (no layout properties animated), and reduced motion has no movement anywhere.

### M7 · Shorts · 14–20 h

- **Engine:** port `ShortPlayer.tsx`, `ShortThumb.tsx`, `lib/shorts.ts`, the beat kit (`counter`, `spike`, `race`,
  `grid`, `ladder`, `toggles`, `flow`, `quiz`), `pages/Shorts.tsx` and `pages/Short.tsx`.
- **Content:** optional `short: { title, beats[] }` on a section; `npm run validate` checks beat types, exactly one
  `quiz` with a valid answer, numbers present.
- **First batch, 12 Shorts**, each fact-checked against its lesson: famous software failures as QA stories
  (Ariane 5 overflow, Knight Capital deploy, Therac-25, Mars Climate Orbiter units, CrowdStrike 2024 update,
  Heathrow T5 baggage) and "how X works" (test pyramid, flaky test triage, Playwright auto-wait, CI gates,
  boundary values, risk-based testing).
- **Where they show:** "Short of the day" on Home, a Shorts strip on topic pages, "▶ Watch the short" on a
  section that has one, a Shorts link in the sidebar.
- Watched state and quiz answers in progress; ☆ Save in the player; Saved → Shorts "Play all".

**Done when:** the 12 Shorts play end to end on desktop and phone, watched state survives reload and a second
device, and `npm run validate` rejects a malformed Short.

### M8 · Read less, view more · Learn more · 10–14 h, then ~40–60 min per section

- **Read less, view more** (SDL M11, step lessons): a `Read · Steps` switch on sections that have steps. Steps are
  8–14 small animated steps (Watch + Your turn: choose, order, pick a number, drag a slider, click the diagram;
  hint after a miss, "Show me the answer" after two). The choice is remembered in `uiPrefs`. Finishing the steps
  marks the section read. Design reference: `../system-design-learn/design/step-lessons/`.
- **Collapsed long sections:** sections over a length threshold show a summary and a "Read more / Read less"
  toggle (state per section, keyboard-accessible, `aria-expanded`).
- **Learn more:** an expandable panel at the end of a section with the deeper material that today interrupts the
  main text (edge cases, "in real projects", interview follow-ups) plus the section's links from the existing
  `Resource` content. Optional `learnMore` field on a section, checked by `npm run validate`.
- First conversions: one section each from Manual Testing (test design: BVA/EP), Playwright (locators) and SQL
  (joins).

**Done when:** the three sections work in Read and Steps on desktop and phone, the switch is remembered, Your-turn
misses feed Weak areas, and a malformed step or `learnMore` fails validation.

### M9 · Admin · 5–8 h

- `GET /api/admin/stats` on `qa-api` (SDL's `admin.ts` as the starting point), read from `qa_learn` only: users, activity,
  sections read, exams passed, coding problems solved, Shorts watched, feedback, flagged accounts, 30-day sign-ups.
- Port `pages/Admin.tsx` and `styles/admin.css` with the existing `src/components/charts` (`StatTile`, columns,
  bar rows). Admin tab rendered only for `role: "admin"`; the route refuses everyone else.
- Feedback list with status (waiting, replied, closed).

**Done when:** an admin sees every number matching the database; a normal user sees no tab and gets "Admins only"
on the page and 403 from the route.

### M10 · Test cases · 8–12 h

Fill the gaps left by M0–M9 so the audit starts from a green, broad suite.

- **Unit (`npm test`):** progress ops and import merge, saved dedupe/cap, achievements unlocks, streak across time
  zones, Shorts player timing/Back/pause/speed/quiz gating, step player gating, Read/Steps memory, validators
  reject malformed Shorts, steps and `learnMore`.
- **Service (`cd api && npm test`, against a local mongod database `qa_learn_test`):** auth flows and limits,
  one user can't read or write another's progress, answer key and coding solutions never returned before an
  attempt, reveal caps, versioned progress conflicts, import, admin 403/200 and stats, account deletion.
- **E2E (`npm run test:e2e`, Playwright):** sign up → verify → import local progress; locked areas logged out;
  save → Saved → done; Guide me and walkthrough; watch a Short; Steps on a section; admin vs non-admin; phone
  viewport for each. Run against `vite preview` plus a local service.
- **Accessibility:** `@axe-core/playwright` on every page in light and dark.
- CI runs lint, validators, unit, service and e2e on every push.

**Done when:** all suites pass in CI, every milestone's "Done when" has at least one test that would fail if it
broke, and axe reports no serious or critical issues.

### M11 · Security audit · 5–8 h

Same format as `../system-design-learn/docs/SECURITY-AUDIT.md`, written to `docs/SECURITY-AUDIT.md`.

- **Bundle:** no answers, solutions or company answers in `dist/` or `.map` files (bundle check), no secrets in
  the bundle or git history.
- **Access:** every locked feature refused by the service when logged out, not only hidden; cross-user reads
  refused (IDOR); admin routes re-check the role in the database; the Atlas app user can reach `qa_learn` only.
- **Re-check SDL's findings in the copied code:** rate limits through the `/api` rewrite and against Render
  directly (SDL H1), email bombing (H2), reveal caps on submit (H3), progress import faking passes (M1), avatar
  and name validation (M3), CSP (M4).
- **App:** CSP and security headers in `vercel.json`, Markdown rendering without raw HTML, `localStorage` holding
  no tokens, Playground and judge code running only in the sandbox they already use.
- **Dependencies:** `npm audit`, pinned versions, lockfile review.
- Fix Critical and High before M12; Medium and Low get an owner and a date.

**Done when:** `docs/SECURITY-AUDIT.md` lists every check with evidence, no Critical or High is open, and each
fix has a test.

### M12 · Deployment · 4–6 h

- Move from GitHub Pages to **Vercel**: `vercel.json` with `/api/*` → the Render service, security headers and CSP
  from M11, immutable asset caching; `base` back to `/`. Remove `.github/workflows/deploy.yml` once Vercel is live.
- `qa-api` on its own Render service (`render.yaml` in this repo, `/health`, secrets `sync: false`), `CORS_ORIGINS`
  = the qa-learn Vercel URL, `TRUST_PROXY_HOPS` set for the Vercel → Render hop; two keep-awake pings.
- CI on `main` (`.github/workflows/ci.yml`, modelled on SDL's): lint, validators, unit, service tests on a mongo
  container, answer-free build and bundle check, then answer-key sync into `qa_learn`, Render deploy hook and
  Vercel deploy. Production secrets in the `production` environment, not repository scope (SDL audit M7).
- Nightly `mongodump` of `qa_learn` with the read-only user, restore-checked into a throwaway mongo, stored privately
  (encrypted, SDL audit M6).
- Sentry (no user data), uptime checks on the app and the service.
- `docs/DEPLOY.md` (step-by-step account setup for qa-learn's own Atlas, Render, Vercel, Turnstile, email, Sentry)
  and a launch checklist with rollback (Vercel instant rollback, Render previous deploy, answer key re-sync from the
  previous commit).

**Done when:** a push to `main` deploys the app and `qa-api` with no answers in the bundle, sign-up and sync work on
the live URL against `qa_learn`, a backup restores, a rollback has been tried once, and nothing in SDL's projects
or database changed.

## Order and estimates

```
Now → M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12
```

M0 is first so every milestone adds tests as it goes. M1–M2 come before the features because Save, Profile,
Admin and synced achievements all need accounts. M6–M8 are frontend only and could move earlier if you want visible
progress sooner; they only need M2 for syncing their progress.

| Milestones | Hours |
|---|---|
| M0 · test harness | 2–3 |
| M1–M2 · own service + database, answer-key split, sign-up, synced progress, locked content | 26–36 |
| M3–M5 · profile, Save for later, Guide Me, achievements | 17–25 |
| M6–M8 · animations, Shorts, read less / view more / learn more | 34–48 |
| M9 · admin | 5–8 |
| M10 · test cases | 10–14 |
| M11 · security audit | 5–8 |
| M12 · deployment | 6–9 |
| **Total** | **~105–151** |

More Shorts and step-lesson sections after the first batch are ~20–30 min (Shorts) and ~40–60 min (steps) each,
not in the totals.

## Not included

A user list, banning or CSV export in Admin; SSO or shared accounts with SDL; moving content into the database;
any change to `../system-design-learn`. Fixes found later in SDL's service are copied over by hand, not shared.
