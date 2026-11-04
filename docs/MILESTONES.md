# qa-learn · feature parity milestones

Plan for bringing qa-learn up to what system-design-learn (`../system-design-learn`, "SDL" below) already has:
Shorts, more achievements, more and interactive animations, profile, admin, sign-in with locked content, Save for
later, Guide Me tour, "read less, view more" and "learn more" sections, and a real test suite. **Security audit
and the release come last.** The site stays on GitHub Pages for now (no service deployment): the release is a static
build that works without the service (M12); deploying the service is under "Later".

**Approach:** copy what SDL already built instead of designing again, into **qa-learn's own service, database and
collections**. SDL is read-only reference: nothing in `../system-design-learn` (code, service, database, Atlas
project, Render or Vercel project, secrets, CI) is changed. Its code is copied into this repo, not imported from it.

## Where qa-learn is today

> This table is where qa-learn started when the plan was written. For what it has now, see
> "After M12 · browser-only round" below.

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
| No accounts, no service (2026-11-04) | Removed M1–M3 (service, database, sign-in, sync, profile, server grading) and dropped M9 Admin | One learner: everything runs in the browser and progress stays there. One build, `npm run build`, published to Pages. |
| Answers on the public site (2026-11-04) | Keep the repo public; the static Pages build ships every answer | One learner, self-study: answers are there to learn from, not to protect. The service build's answer split stays for if accounts ever return. |
| Backend | **Own service `qa-api`** in `api/` in this repo: Fastify + TypeScript, started as a copy of SDL's `api/src` | Fully separate from SDL; the copy starts with SDL's auth, rate limits, validation and audit fixes already in it |
| Database | **Own Atlas project and M0 cluster**, database `qa_learn` | No shared cluster, users, keys or quotas with SDL (an M0 is free per Atlas project) |
| Service hosting | **Not deployed for now: runs locally only.** When it is (see "Later"): own Render service under a separate Render account (or paid instance) | Render free gives ~750 h a month per account; SDL's always-on service already uses it, so a second always-on service on the same account runs out mid-month |
| Accounts | Separate users: a qa-learn account is not an SDL account | Own Better Auth collections in `qa_learn`; no SSO |
| Answers | Same build-time split as SDL M1 | Locked content means nothing if the answer is already in the bundle |
| Animation library | Keep `motion`; add GSAP only if a Short or step needs a timeline `motion` can't do | No second animation library for a few effects |
| Tests | `node --test` for logic (as SDL), Playwright for app journeys | Playwright is already installed, and it's a QA app: its own suite is a showcase |
| Hosting | **Stay on GitHub Pages** (decided 2026-11-04: no deployment yet). The Pages site gets a static build (M12) that works without the service; the service runs locally | GitHub Pages serves static files only: no service, no `/api/*` rewrite, no CSP headers. Moving to Vercel + Render is in "Later" |

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

> **Removed (2026-11-04).** qa-learn is browser-only for one learner: the service (`api/`), its database, sign-in,
> sync, profile and server grading were deleted. Save for later stayed and runs locally. The notes below are history.

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
database). Vite proxies `/api` → `localhost:3001`. Atlas, Render and the other accounts are set up only when the
service is deployed (see "Later").

### M2 · Sign-up, synced progress and locked content · 10–14 h

> **Removed (2026-11-04).** qa-learn is browser-only for one learner: the service (`api/`), its database, sign-in,
> sync, profile and server grading were deleted. Save for later stayed and runs locally. The notes below are history.

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
that isn't deployed (and won't be for now); M12's static Pages build fixes that. Left out on purpose: Google/GitHub sign-in (not needed), locking coding judge runs (they run
in the browser, locking protects nothing), the auth-event log and flagged-accounts list (moved to M9, where Admin reads
them).

### M3 · Profile and Save for later · 8–12 h

> **Removed (2026-11-04).** qa-learn is browser-only for one learner: the service (`api/`), its database, sign-in,
> sync, profile and server grading were deleted. Save for later stayed and runs locally. The notes below are history.

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

**As built:** `lib/guide.ts` (page guide and walkthrough state), `lib/pageGuides.ts` (a guide for every routed page,
"Show me" stops on Today, Topic, Exam, Coding problem, PW Lab step, Companies, Achievements, Saved and Profile, and a
menu walk), `components/PageGuide.tsx` (reuses the welcome tour's dialog; "Full course tour" opens the tour) and
`components/Walkthrough.tsx` (spotlight, ←/→, Esc, focus trap, stops not on screen skipped, docked callout on phones).
"Guide me" and `?` open the page's guide (the tour on pages without one); the first-visit tour carries on into the menu
walk. "Tour seen" stays in the browser only (`qa-learn-ui-v1`), not on the account: the app is used by one person for
now (decision 2026-11-04). Tests: app 56 (`tests/guides.test.ts`), e2e: first visit tour → walk, `?` → page guide →
Show me → ← → Esc, desktop and phone. Found on the way: the `?` key would have opened the guide of the first page visited
(stale closure), fixed.

### M5 · Achievements, second wave · 4–6 h

- New badges for the features above: first Short, Shorts streak, Saved and finished 10, first step lesson,
  Guide me completed, profile set up, coding problems by difficulty, PW Lab finished.
- Unlocks computed on the server from progress (SDL M4 rule), with `qa-api` importing qa-learn's own `src/content/achievements.ts` so app and service use one rule list.
- Port `CelebrationWatcher.tsx` so an unlock earned anywhere (including from another device) celebrates once.
- Locked logged out (rule above), with the badge grid shown blurred behind the prompt.

**Done when:** every new badge unlocks from a test fixture, server and app agree on the earned list, and an unlock
celebrates exactly once.

**As built (one learner, kept in this browser):**
- Badges are earned and celebrated signed out. Detection runs in the browser (`useAchievementDetection`, now
  always on) and the Achievements page is no longer behind the sign-up prompt. The service still uses the same
  catalogue (`src/content/achievements.ts`) when it's running.
- New: **Full Spectrum** (a solved coding problem at each difficulty) and **Backlog Burner** (saved items marked
  done: 1 / 10 / 25). Both have tests and are in the "finished the course" fixture.
- Waiting on data that progress doesn't record yet: first Short and Shorts streak (M7), PW Lab finished
  (results live in `judge-results.json`, not progress), Guide me completed (only a browser flag), profile set
  up (account-only).
- Celebrate-once was already in place: stored tiers are never celebrated again in a browser. Each browser
  celebrates a badge it hasn't shown yet, so a second device gets its own celebration.

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

**As built:**
- Duplicate page fixed: the route wrapper in `Layout.tsx` is a keyed `motion.div` without `AnimatePresence`
  (with no exit animation it only kept the old wrapper alive, rendering the new page twice). The fade-in is
  unchanged and only animates opacity and transform.
- Staggered entrances (`.rise` + `--i`, CSS) were already on every page; Saved and Profile now use them too.
  No GSAP port: the app already had CSS staggers, `motion` and `CountUp`.
- Coverage was already complete: all 35 topics have a widget, and every widget has its own controls.
  `tests/viz.test.ts` now guards that, and checks that each placement points at a real section heading.
- "Your turn" predict prompts already existed in every widget. Many sat one frame too early, so "See what
  happens" didn't show the answer. Fixed across 16 simulations, checked by stepping through every setting
  combination and pairing each question with the next frame's caption. No predict is on a last frame.
- Reduced motion: `MotionConfig reducedMotion="user"` drops the transform part of `motion` animations, and
  `base.css` cuts CSS animations to 0.01 ms.
- Not done: no new widgets (none were missing), and no 60 fps measurement on a real phone.

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

**As built (one learner, kept in this browser):**
- **Engine:** `ShortPlayer.tsx` is ported from SDL and trimmed to the 8 beats; its styles in `styles/shorts.css` use
  qa-learn's tokens. `lib/shorts.ts` has the beat timing, the length and "Short of the day". `ShortCard.tsx` is a
  simple poster card instead of SDL's `ShortThumb` (no glimpse animation). No daily unlock: every Short is open.
- **Content:** the Shorts live in `src/content/shorts.ts` (topic id + section heading), not on the topic
  sections, so the topic files and the answer-key split are untouched. 12 Shorts: Ariane 5, Knight Capital,
  Therac-25, Mars Climate Orbiter, CrowdStrike 2024, Heathrow T5, test pyramid, flaky triage, Playwright
  auto-wait, CI gates, boundary values, risk-based testing. Figures are the commonly reported ones, with the source
  named where it matters (SEC, Microsoft); disputed numbers are left out.
- **Validation:** `shortProblems()` is shared by `scripts/validate-shorts.mjs` (part of `npm run validate`) and
  `tests/shorts.test.ts`, which feeds it 8 kinds of malformed Short.
- **Progress:** a `short` op records the first watch (with its local day) and the first quiz result. It goes
  into `progress-ops.ts`, the service schema and the first-login import, so a signed-in sync still works.
  `short` is also a Saved kind; Saved has a Shorts filter and "Play all".
- **Where they show:** Shorts in the sidebar (Tools), "Short of the day" on Home (row 7 of the bento), a Shorts
  strip at the top of a topic's Learn tab, and "Watch the short" on the sections that have one. Page guides
  cover both new pages.
- **Badges (deferred from M5):** Opening Scene (first Short watched) and Daily Short (3 / 7 days in a row).
- **Phone fix:** `.main` is its own stacking context, so the full-screen player sat under the top bar and the dock;
  `.main` is now lifted while a Short is open.
- **Not done:** the second-device check (the service sync path has the op, but no e2e covers two browsers for
  Shorts), and SDL's ~30 other beat types.

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

**As built:**
- **Step lessons:** SDL's engine is ported as is (`components/steps/StepLesson.tsx`, `stage.ts`, `scenes.ts`, its
  types in `src/types.ts`) and so is its validator (`scripts/validate-steps.mjs`, also checks layout on both stage
  sizes). `styles/steps.css` maps SDL's tokens onto qa-learn's on the lesson's own elements.
- **Three lessons:** BVA (11 steps, 5 Your turns), locators (9 steps, including a click-the-diagram pick), SQL
  joins (10 steps). Every number matches the section's own text (3-value BVA = 8 values, FULL JOIN = 5 rows).
- **Read · Steps** shows only on sections that have steps; one choice for all of them, kept in `uiPrefs.lessonMode`.
  Finishing marks the section read and moves to the next one.
- **Weak areas:** a `steps` op stores the latest run's misses (app, service schema, first-login import);
  `weakTopics` lists them as `shakySteps`, and a clean run clears them. Weak areas itself is still sign-in only.
- **Read more / Read less:** sections over 2,000 characters (about a quarter) open clamped, with `aria-expanded` +
  `aria-controls`. The key points after each section act as the summary. Per visit, not remembered.
- **Learn more:** an optional `learnMore { body, links[] }` on a section, shown as a native `<details>`; written
  for the same three sections, with links reused from the roadmap's vetted resources. Rules in
  `content/sectionRules.ts`, used by `npm run validate` and `tests/sections.test.ts`.

### M9 · Admin · 5–8 h

> **Dropped (2026-11-04):** one learner and no accounts, so there is no one to administer.

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

**As built:**
- **CI:** `.github/workflows/test.yml` runs on every push and pull request. One job does lint, `npm run validate`,
  unit tests and the build (with its answers check); one runs the service tests against a `mongo:7` container;
  one runs Playwright e2e + axe against the same container. All its steps pass locally; the workflow itself has
  not run on GitHub yet.
- **Accessibility:** `e2e/a11y.spec.ts` (`@axe-core/playwright` 4.14.0) scans 20 pages in light and dark (desktop) and
  fails on serious or critical issues. It found and this milestone fixed:
  - **Accessible names that didn't match the visible text** (WCAG 2.5.3) on the rail, search, brand, bar-list
    rows, the stage chips on Contents, the Home badge link and the Shorts player buttons. The visible text is now
    the name; counts and extra context are screen-reader-only text. The icon-only rail (≤1200px) hides its words
    visually instead of with `display: none`.
  - **Low contrast** on breadcrumb segments (a rule meant for the "/" separators dimmed whole segments) and the
    Achievements note.
  - **Scrollable code blocks** couldn't be reached by keyboard (now `tabIndex=0`), and the code editor's textarea
    had no label (hidden `<label>` via `textareaId`).
- **Gaps filled:** a service test that the M7/M8 ops (`short`, `steps`, Saved `short`) sync, earn the Shorts badge
  on the server and refuse bad values; an e2e for the Shorts player's pause, speed and Back.
- Most of the plan's list already existed from M0–M8 (progress ops and import, saved cap, badges, streaks across
  DST, validators, the step and Shorts gating, Guide me, Read/Steps memory, account isolation, reveal caps).
- **Not done:** admin tests (M9 dropped).
- **Since then:** e2e runs against the built site (`npm run build` + `vite preview`, `playwright.config.ts`), and
  `e2e/a11y.spec.ts` axe-scans every page on the phone project as well as desktop.

### M11 · Security audit · 4–6 h

Same format as `../system-design-learn/docs/SECURITY-AUDIT.md`, written to `docs/SECURITY-AUDIT.md`. It audits what
is actually published (the static Pages site) and the service code as it runs locally; checks that only make sense on
a deployed service move to "Later".

- **Pages site:** no secrets in the bundle or git history; Markdown rendering without raw HTML; `localStorage`
  holding no tokens; Playground and judge code running only in the sandbox they already use; no sign-in or `/api`
  calls in the static build (M12). Note: the static build ships answers by design, so the repo being public (see
  "Now") is the only answer exposure to decide on.
- **Service build (local):** no answers, solutions or company answers in the service-mode `dist/` or `.map` files
  (bundle check); every locked feature refused by the service when signed out, not only hidden; cross-user reads
  refused (IDOR); admin routes re-check the role in the database.
- **Re-check SDL's findings in the copied code** that apply without a deployment: email bombing (SDL H2), reveal
  caps on submit (H3), progress import faking passes (M1), avatar and name validation (M3).
- **Dependencies:** `npm audit` for the app and `api/`, pinned versions, lockfile review.
- Fix Critical and High before M12; Medium and Low get an owner and a date.

**Done when:** `docs/SECURITY-AUDIT.md` lists every check with evidence, no Critical or High is open, and each
fix has a test.

**As built:** `docs/SECURITY-AUDIT.md`. SDL has no audit doc to copy, so it uses its own format: findings table,
then every check with evidence. Findings:
- **H1, fixed:** Vite dev-server advisories, upgraded to `vite@8.3.4` (pinned). CI runs `npm audit --audit-level=high` for
  the app and `api/`, so a new High fails the build.
- **M1, fixed:** `qa-api` listened on every interface, now `127.0.0.1` unless `HOST` is set (tested). The proxy and
  Playwright use `127.0.0.1`.
- **L1, open until M12:** no CSP on Pages.
- **L2, L3, accepted:** learner code in a same-origin worker; caret ranges pinned by the lockfile.

Everything else passed with an existing test as evidence. "No `/api` calls in the static build" waits for M12.

### M12 · GitHub Pages release (static build) · 6–9 h

The site stays on GitHub Pages (decision 2026-11-04). Pages serves static files only, so it can't run qa-api: since
M2 the app's exams, answers, sign-in, Saved and Profile need the service, and a plain Pages deploy of this branch would
show sign-up prompts that can't work. This milestone adds a build that works without it.

- **Two builds from one codebase:** `npm run build` (service mode, as now: answer-free, needs qa-api) and
  `npm run build:pages` (static mode, `VITE_SERVICE=off`): content keeps its answers, exams are graded in the browser,
  model answers, solutions, drill working and company answers show after an attempt with no wait, and progress stays in
  the browser, as before M2.
- **Static mode hides what needs the service:** sign-in, sign-up and the account control, Profile and feedback, the
  Admin page, and every "Sign up to …" prompt; account-only pages (Achievements, Weak areas, streak) open again. Save for
  later keeps working in the browser (the `saved` change already runs locally). No `/api` call is made.
- `.github/workflows/deploy.yml` builds with `build:pages` (base `./` stays); CI runs lint, the validators, unit tests and
  a static-mode e2e smoke before deploying.
- Tests: the static build makes no `/api` request, grades an exam in the browser, shows a model answer after an
  attempt, and contains no sign-in links; the service-mode e2e suite keeps running against the local service.

**Done when:** a push to `main` publishes the static build to GitHub Pages; on the live site a visitor can study, take
a graded exam and see answers with no service and no sign-in; the service mode still passes its own tests; and nothing
in SDL's projects or database changed.

> **Replaced (2026-11-04).** With the service removed there is one build: `npm run build` → `dist/`, which already
> works without a service. `build:pages`, `dist-pages/`, `mode.ts`, `playwright.pages.config.ts` and `e2e-pages/` were
> deleted. Today `deploy.yml` (on push to `main`, or by hand) runs lint, validate, unit tests and the e2e suite against
> the built site, then publishes `dist/`. The static checks (no `/api` call, an exam graded in the browser, a model
> answer after an attempt, learner code under the CSP) moved to `e2e/static.spec.ts`. The notes below are history.

**As built:**
- **The flag:** `src/lib/mode.ts` exports `SERVICE`, false when `VITE_SERVICE=off`. `npm run build:pages` builds `dist-pages/`
  in that mode: the answer split is skipped (content keeps its answers) and a `<meta>` CSP is added. `npm run build`
  is unchanged (answer-free, `check-bundle`).
- **Static mode:**
  - `refreshSession` never calls the service. `LockedPreview`, Save, Saved and Weak areas are open, and the streak
    and Saved count show.
  - The account control is hidden; `/profile`, `/login`, `/signup`, `/forgot` and `/reset` redirect home.
  - `useReveal` / `useCompanyAnswer` (picked once per build) return the content's answer after the attempt, with no
    wait.
  - Exams start, grade and lock in locally and record through `recordTest` / `recordAnswers`, as before M2.
- **Tests:** `playwright.pages.config.ts` + `e2e-pages/static.spec.ts` (`npm run test:pages`) build the static site
  and serve it with `vite preview`, with no service. On desktop and phone they check:
  - no `/api` request and no sign-in link;
  - an exam graded in the browser and recorded;
  - a model answer at once after an attempt;
  - learner code running under the CSP, with any CSP violation failing the test.
- **Deploy:** `deploy.yml` runs lint, validate, unit tests and `test:pages`, then publishes `dist-pages/`. `test.yml`
  also runs `test:pages` on every push.
- **Service mode:** unchanged; all its suites still pass.
- **Not verified:** the live site itself, which needs a push to `main`.

## After M12 · browser-only round (2026-11-04)

Requests made after the milestones, all browser-only (nothing in `../system-design-learn` or `../dsa-js` changed; both
were read as reference only).

- **Steps for every Syllabus section:** `src/lib/autoSteps.ts` builds a step lesson from a section's own text when it
  has no hand-written one (exam questions that map to the section become Your-turn steps; key points close it).
- **Picture-only step animations:** the stage shows icons only (81 Lucide icons copied into
  `src/components/steps/glyphs.ts`); the words stay in the numbered lines. Ten machines in `scenes.ts`, chosen per
  step by its words and kind and never repeating the last two: orbit, conveyor, dominoes, deal, constellation, tower,
  radar, balance, funnel, stamp. Icons draw themselves on; Pause freezes the looping motion too.
- **Coding visualiser:** the test runner traces the learner's own code on one visible test and plays it back: lit
  line, arrays as cells with index pointers, changed values, the return against the expected value, or the crash line.
  `src/lib/instrument.ts` (acorn 8.15.0, loaded only when a trace is asked for) adds a recorder call per statement;
  `src/lib/trace.ts` is the recorder that runs in the same sandboxed worker as the tests (`runCode.ts`);
  `src/components/TraceViewer.tsx` is the player. Hidden tests are never traced; a trace keeps at most 1,200 steps.
  `tests/trace.test.ts` traces every reference solution and checks it returns exactly what the original does.
- **Coding page:** problem, editor and test runner stacked in one column; the problem bank folds to a rail
  (`uiPrefs.codingBankCollapsed`); a taller editor; the progress strip moved off the problem page.
- **Pages:** Home split into Dashboard and Today; Today lost the self-ratings chart and Topics by status; Roadmap is
  "Plan your journey" (`StudyPlanner.tsx`, `lib/pace.ts`); Syllabus is one collapsed list, with the build matrix and
  summary on a new Build report page; Settings in tabs; a Guide me walk on every page; 24 Shorts with thumbnails and
  Day labels.
- **Look:** the scanline and grain texture now sits behind the content, so panels and the step stage are solid.
- **Not verified:** the live Pages site (needs a push to `main`); animation smoothness on a slow real phone.

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
| M11 · security audit | 4–6 |
| M12 · GitHub Pages release (static build) | 6–9 |
| **Total** | **~104–149** |

More Shorts and step-lesson sections after the first batch are ~20–30 min (Shorts) and ~40–60 min (steps) each,
not in the totals.

## Later: deploying the service (not planned yet)

Until this is done, accounts, synced progress, server grading, Saved sync, Profile and Admin work only with qa-api running
locally; the public site is the static Pages build (M12). When the service is deployed:

- Atlas project + M0 cluster (`qa_learn`), a transactional email sender, Cloudflare Turnstile, Render (own account), and
  a frontend host that can rewrite `/api/*` to the service for a first-party session cookie (Vercel; GitHub Pages can't).
- `vercel.json` (rewrite, security headers and CSP, immutable assets), `render.yaml` for qa-api (`/health`, secrets
  `sync: false`, `CORS_ORIGINS`, `TRUST_PROXY_HOPS`, `PROXY_SECRET`), two keep-awake pings.
- CI on `main`: service tests on a mongo container, the answer-free build and bundle check, answer-key sync into
  `qa_learn`, then the service and app deploys; production secrets in the `production` environment (SDL audit M7).
- Nightly encrypted `mongodump` with restore check, Sentry with no user data, uptime checks, `docs/DEPLOY.md`, a launch
  checklist and rollback.
- The deploy-only security checks: rate limits through the rewrite and against Render directly (SDL H1), CSP (M4),
  cookie flags on the live domain.

## Not included

A user list, banning or CSV export in Admin; SSO or shared accounts with SDL; moving content into the database;
any change to `../system-design-learn`. Fixes found later in SDL's service are copied over by hand, not shared.
