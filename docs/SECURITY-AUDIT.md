# qa-learn security audit (M11)

**Date:** 2026-11-04 · **Branch:** `feat/newV2` · **Scope:** what is actually published (the static GitHub Pages
site) and the `qa-api` service as it runs locally for one learner. Checks that only make sense on a deployed service
are listed under **Later**.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| H1 | High | Vite 8.3.1 dev server: six advisories (cross-origin script execution through custom middleware, files outside `server.fs.allow`, `launch-editor` command injection). Dev only, never in the published site. | **Fixed:** pinned `vite@8.3.4`; CI now runs `npm audit --audit-level=high` for the app and `api/`. |
| M1 | Medium | `qa-api` listened on `0.0.0.0`, so anyone on the same network (café, office Wi-Fi) could reach the local service and its sign-up / sign-in routes. | **Fixed:** listens on `127.0.0.1` unless `HOST` is set; the Vite proxy and Playwright use `127.0.0.1`. Test: `api/test/app.test.ts` "defaults". |
| L1 | Low | The Pages site sends no Content-Security-Policy (GitHub Pages can't set headers; a `<meta>` CSP must allow the blob workers, inline styles from `motion` and the fonts). | Open. **Owner:** repo owner, with M12. **By:** the M12 release. |
| L2 | Low | Learner code (Playground, coding problems) runs in a same-origin Web Worker, so it could call `fetch` with the learner's own cookies. It is only ever the learner's own code, so this is self-XSS at most. | Accepted. Revisit if code is ever shared between learners (an opaque-origin sandboxed iframe would close it). |
| L3 | Low | 14 app and 2 service dependencies use `^` ranges in `package.json`. | Accepted: `package-lock.json` pins them and CI installs with `npm ci`; new direct dependencies are pinned exactly (`@axe-core/playwright`, `vite`). Review at M12. |

No Critical findings. No High open.

## Checks and evidence

### Published site (GitHub Pages)

| Check | Result | Evidence |
|---|---|---|
| No secrets in the build | Pass | `dist/` has no `mongodb://`, `BETTER_AUTH_SECRET`, `cloudinary://`, `api_secret` or `PROXY_SECRET`; no `.map` files (`check-bundle` fails the build on maps). |
| No secrets in git | Pass | Only `api/.env.example` is tracked. `git log --all -p` hits: a `CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>` placeholder in a comment and `sk-live9F3kQ7xT2mB8vL4p` in a coding exercise's test data (fake, by design: the exercise detects secrets in logs). |
| Markdown renders no raw HTML | Pass | `react-markdown` without `rehype-raw`; its default URL transform drops `javascript:` links. The one `dangerouslySetInnerHTML` (`components/ui.tsx`, code blocks) gets Prism output, which escapes the source, or `escapeHtml` for unknown languages. |
| External links | Pass | Every `target="_blank"` in the app has `rel="noreferrer"`. |
| `localStorage` holds no tokens | Pass | Keys: `qa-learn-progress-v1`, `qa-learn-account-v1:<userId>` (progress + queued changes), `qa-learn-ui-v1`, `qa-learn-playground-v1`. The session is an httpOnly cookie set by the service; no token is stored or readable by script. |
| Learner code runs sandboxed | Pass (see L2) | `lib/runCode.ts` and `lib/runScript.ts` run code in a Web Worker from a blob URL: no DOM, no `localStorage`, killed after 4–5 s. |
| Static build makes no sign-in or `/api` calls | **Pending M12** | The `VITE_SERVICE=off` build doesn't exist yet; M12's done-when includes it. |
| Answers in the static build | Decision, not a bug | By design for M12 (local grading). The answer split only matters while the service grades; the repo being public is the only answer exposure to decide on. |

### Service (local)

| Check | Result | Evidence |
|---|---|---|
| No answers in the service-mode bundle | Pass | `npm run build` → `check-bundle`: "no answers (5547 probes over 44 files)". |
| Locked features refused when signed out, not just hidden | Pass | Every route except `/health` and Better Auth's own has `preHandler: requireUser/requireFreshUser/requireAdmin` (import uses `onRequest`, before the body is read). Tests: "logged out: exams, reveals and company answers are refused", "logged out: progress and /api/me are refused". |
| Cross-user reads and writes (IDOR) | Pass | Progress is keyed by the session's user id, never a client-sent id. Tests: "one account can never read or change another's progress", "another account cannot touch the exam", reveal tokens "work once and for its owner only". |
| Admin routes re-check the role | Pass | `requireAdmin` loads the user with the cookie cache off (`disableCookieCache`), so a removed role takes effect at once. Test: "sign up → verify → log in → admin guard → reset → log out". (Admin UI itself is skipped, M9.) |
| SDL H2, email bombing | Pass | Per-address (3/hour) and daily email caps; throwaway domains refused. Tests: "one address gets at most 3 emails an hour", "once the day's emails run out…", "throwaway inboxes…". |
| SDL H3, reveal caps on submit | Pass | Test: "past the daily cap: no more answers, no new exams, only the score, and the account is flagged". |
| SDL M1, import faking passes | Pass | `mergeImport` never takes `passedAt` or badges. Tests: "import never takes an exam pass or a badge from the browser" (app) and "first-login import merges once, without exam passes…" (service). |
| SDL M3, avatar and name validation | Pass | Tests: "a built-in avatar or initials; any other picture URL is refused…", "the name: 1 to 60 characters, not blank…". |
| New ops from M7/M8 validated | Pass | `short` and `steps` ops have strict schemas (enum events, integer bounds, no extra keys). Test: "Shorts and step lessons sync… bad values are refused". |
| Sign-in brute force, cookies, CORS | Pass | Tests: per-IP sign-in limits (spoofed `X-Forwarded-For` ignored), per-account lockout, Secure/HttpOnly/SameSite=Lax cookies on https, CORS limited to the app origin. |

### Dependencies

| Check | Result | Evidence |
|---|---|---|
| `npm audit` (app) | Pass after H1 | 1 high (vite) → 0 after `vite@8.3.4`. |
| `npm audit` (`api/`) | Pass | 0 vulnerabilities. |
| Lockfiles | Pass | Both committed; CI uses `npm ci`. See L3 for ranges. |

## Later (only on a deployed service)

TLS and HSTS at the host, `PROXY_SECRET` between the frontend host and the service, Turnstile in production,
real SMTP sender reputation, MongoDB Atlas network rules and backups, log retention, and a re-run of this audit
against the deployed URL. Production config already refuses to start without https, email, CAPTCHA or a proxy
secret (test: "production refuses to start without…").
