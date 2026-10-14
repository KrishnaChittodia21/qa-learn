import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-git-ci',
  phase: 'pw-framework',
  order: 6,
  title: 'Git, GitHub & CI for Playwright',
  subtitle:
    'From git basics and pull requests to a GitHub Actions pipeline with browsers, artifacts, retries, sharding with merged reports, Docker and Jenkins.',
  estimatedMinutes: 100,
  sources: [
    'Pro Git book (git-scm.com/book) — Ch 2 Git Basics, Ch 3 Branching',
    'Atlassian Git tutorials — Saving changes, Syncing, Merging vs Rebasing, .gitignore',
    'GitHub Docs & GitHub Skills — Pull requests, GitHub Actions workflow syntax, encrypted secrets, artifacts',
    'Playwright docs — Setting up CI (playwright.dev/docs/ci-intro) — generated GitHub Actions workflow',
    'Playwright docs — Continuous Integration (playwright.dev/docs/ci) — workers on CI, Docker container jobs, Jenkins',
    'Playwright docs — Sharding (playwright.dev/docs/test-sharding) — blob reporter and merge-reports',
    'Playwright docs — Parallelism (playwright.dev/docs/test-parallel)',
    'Playwright docs — Docker (playwright.dev/docs/docker)',
    'Playwright docs — Command line (playwright.dev/docs/test-cli) — --shard, --only-changed, --grep',
    'Playwright docs — Annotations (tags)',
  ],
  tags: ['git', 'github', 'pull-request', 'github-actions', 'ci', 'artifacts', 'sharding', 'workers', 'docker', 'jenkins', 'tags'],
  cheatSheet: [
    'Git flow: `git switch -c feat/x` → edit → `git add -p` → `git commit -m` → `git push -u origin feat/x` → open PR → review → merge → `git pull` on main.',
    '`git pull` = `git fetch` + merge (or rebase with `--rebase`); `git fetch` alone never touches your files.',
    '.gitignore for Playwright: `node_modules/`, `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`, `playwright/.auth/`, `.env`.',
    'Generated config is CI-aware: `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `workers: process.env.CI ? 1 : undefined`, `trace: \'on-first-retry\'`.',
    'Minimal GitHub Actions job: checkout → setup-node → `npm ci` → `npx playwright install --with-deps` → `npx playwright test` → upload `playwright-report/` with `if: \${{ !cancelled() }}`.',
    'Workers = parallel processes on ONE machine (default 50% of CPU cores); shards = splitting the suite across MACHINES with `--shard=i/n`.',
    '`fullyParallel: true` lets tests inside one file run in parallel and makes shards split per test (better balance) instead of per file.',
    'Shards: reporter `blob` on CI → upload each `blob-report/` as `blob-report-<i>` → final job downloads all → `npx playwright merge-reports --reporter html ./all-blob-reports`.',
    'Docker: `mcr.microsoft.com/playwright:v<same version as package.json>-noble`; run with `--init --ipc=host`; browsers are pre-installed.',
    'Selective runs: tags `{ tag: \'@smoke\' }` + `--grep @smoke`; `--grep-invert @slow`; `--only-changed=origin/main`; `--project=chromium`.',
    'Secrets: store in GitHub repository/environment secrets, expose as `env:` in the workflow, read with `process.env`; never commit `.env` or `.auth` files.',
  ],
  sections: [
    {
      heading: 'Git in ten minutes: the mental model',
      body: `**Intuition:** Git is a save-game system for a folder. You choose which changes go into the next save point (staging), create the save point (commit), and copy save points to and from a shared server (push/pull).

Four places your work can be:

| Place | What it holds | Moves there with |
|---|---|---|
| **Working directory** | files as you edit them | your editor |
| **Staging area (index)** | changes chosen for the next commit | \`git add\` |
| **Local repository** | commits on your machine | \`git commit\` |
| **Remote (GitHub)** | the shared copy | \`git push\` (and back with \`git fetch\`/\`git pull\`) |

A **commit** is a snapshot with an id (hash), an author, a message and a pointer to its parent. A **branch** is just a movable label pointing at a commit; \`main\` is the shared one, and your work happens on short-lived feature branches. \`HEAD\` is "where you are now".

**Why a tester must know Git:** your Playwright framework is code. It lives in a repository, is reviewed through pull requests, and every push triggers the CI pipeline. In interviews you will be asked for basic commands, merge conflicts, and how your tests run on a PR.`,
      diagram: `  working dir --git add--> staging --git commit--> local repo --git push--> remote
       ^                                              |   ^                   |
       '-------- git restore / git switch ------------'   '--- git fetch -----'
                                                       (git pull = fetch + merge)

  main:     A---B---C-----------G   (G = merge commit)
                     \\         /
  feat/x:             D---E---F     (your branch: new tests)`,
      keyPoints: [
        'Working dir → staging → local repo → remote.',
        'A branch is a pointer to a commit; work on short-lived branches.',
        'Every push/PR is what triggers your CI tests.',
      ],
      source: 'Pro Git — Ch 1.3 What is Git, Ch 3.1 Branches in a Nutshell; Atlassian Git tutorials',
    },
    {
      heading: 'Everyday Git commands for a test engineer',
      body: `**Intuition:** you need about fifteen commands for 95% of your work. Learn them by the task they solve, not alphabetically.

| Task | Command |
|---|---|
| Get the repo | \`git clone <url>\` |
| What changed? | \`git status\`, \`git diff\` (unstaged), \`git diff --staged\` |
| New branch | \`git switch -c feat/checkout-tests\` (older: \`git checkout -b\`) |
| Stage | \`git add tests/checkout.spec.ts\` or \`git add -p\` (pick hunks) |
| Commit | \`git commit -m "test: add checkout total tests"\` |
| History | \`git log --oneline --graph -10\` |
| Publish branch | \`git push -u origin feat/checkout-tests\` |
| Update from remote | \`git fetch\` then \`git pull\` (fetch + merge) or \`git pull --rebase\` |
| Undo unstaged edits | \`git restore <file>\` |
| Unstage | \`git restore --staged <file>\` |
| Park work | \`git stash\` / \`git stash pop\` |
| Undo a pushed commit safely | \`git revert <hash>\` (new commit that reverses it) |

**Commit hygiene:** small commits with clear messages ("test: cover coupon expiry boundary"), one topic per commit. Never commit generated folders (reports, results) or secrets.

**Common mistake:** \`git reset --hard\` or \`git push --force\` on a shared branch. Both rewrite or discard history. On shared branches prefer \`git revert\`; if you must force-push your own branch, use \`--force-with-lease\`.`,
      code: [
        {
          language: 'bash',
          title: 'Adding a new Playwright test, start to finish',
          code: `git switch main && git pull                 # start from the latest main
git switch -c test/cart-badge               # short-lived feature branch

# ... write tests/cart.spec.ts, run it locally ...
npx playwright test tests/cart.spec.ts

git status                                   # see what changed
git add tests/cart.spec.ts pages/CartPage.ts
git commit -m "test: cover cart badge count after add/remove"
git push -u origin test/cart-badge           # then open a PR on GitHub

# later, main moved on and you need its changes
git fetch origin
git rebase origin/main                       # or: git merge origin/main
git push --force-with-lease                  # only on YOUR branch after a rebase`,
        },
      ],
      keyPoints: [
        'status/diff before every commit.',
        'pull = fetch + merge; fetch alone is always safe.',
        'revert on shared history; --force-with-lease only on your own branch.',
      ],
      source: 'Pro Git — Ch 2 Git Basics; Atlassian — Saving changes, Syncing, Undoing changes',
    },
    {
      heading: 'Branches, merges and resolving conflicts',
      body: `**Intuition:** two people edited the same sentence in a shared document. Git can combine changes to *different* lines automatically, but for the *same* lines it asks a human to choose.

**Merge vs rebase:**
| | \`git merge origin/main\` | \`git rebase origin/main\` |
|---|---|---|
| History | keeps both lines + a merge commit | replays your commits on top of main: straight line |
| Safe on shared branches? | yes | only on your own branch (rewrites hashes) |
| Conflict resolution | once | possibly once per replayed commit |

**Resolving a conflict:**
1. Git stops and marks files as "both modified" in \`git status\`.
2. The file contains markers: \`<<<<<<< HEAD\` (your side), \`=======\`, \`>>>>>>> origin/main\` (their side).
3. Edit to the correct final content, keeping **both** intentions when they are compatible, and delete the markers.
4. **Run the affected tests** (a config conflict can silently break the whole suite).
5. \`git add <file>\` then \`git commit\` (merge) or \`git rebase --continue\` (rebase). \`git merge --abort\` / \`git rebase --abort\` returns to safety.

**Typical conflict in a test repo:** two people both changed \`playwright.config.ts\`: one added a \`firefox\` project, the other changed \`retries\`. The right answer keeps both changes.`,
      code: [
        {
          language: 'text',
          title: 'A conflict in playwright.config.ts and its resolution',
          code: `<<<<<<< HEAD
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
=======
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]],
>>>>>>> origin/main

--- resolved (agreed with the teammate: keep 2 retries, keep both new keys) ---
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]],`,
        },
      ],
      keyPoints: [
        'Merge preserves history; rebase rewrites your branch into a straight line.',
        'Resolve by intent, remove markers, run tests, then add + continue.',
        'Talk to the other author when the two intentions really disagree.',
      ],
      source: 'Pro Git — Ch 3.2 Basic Branching and Merging, Ch 3.6 Rebasing; Atlassian — Merging vs Rebasing',
    },
    {
      heading: '.gitignore for a Playwright project',
      body: `**Intuition:** commit the recipe, not the cake. Source code and config go into Git; anything generated by running the tests, or anything secret, stays out.

\`npm init playwright@latest\` already adds most of these. Make sure your repo ignores:

| Path | Why it must not be committed |
|---|---|
| \`node_modules/\` | huge, rebuilt by \`npm ci\` from \`package-lock.json\` |
| \`test-results/\` | per-run screenshots, videos, traces |
| \`playwright-report/\` | generated HTML report (upload as a CI artifact instead) |
| \`blob-report/\` | per-shard raw results |
| \`playwright/.cache/\` | component-testing build cache |
| \`playwright/.auth/\` | saved \`storageState\` files: **live session cookies** |
| \`.env\`, \`.env.*\` | credentials and URLs (commit a \`.env.example\` with placeholder values) |

**Do commit:** \`package.json\` **and** \`package-lock.json\` (so \`npm ci\` installs exact versions, including the exact Playwright version), \`playwright.config.ts\`, tests, page objects, fixtures, test data without secrets, and the workflow YAML.

**Already committed a secret?** Adding it to \`.gitignore\` later does not remove it from history. Rotate the secret immediately, then remove the file with \`git rm --cached .env\` and, if needed, clean history.`,
      code: [
        {
          language: 'text',
          title: '.gitignore',
          code: `# dependencies
node_modules/

# Playwright outputs
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/

# saved login state (contains session cookies)
/playwright/.auth/

# local secrets
.env
.env.*
!.env.example`,
        },
      ],
      keyPoints: [
        'Ignore generated output and secrets; commit lock files.',
        'storageState files are credentials.',
        'A leaked secret must be rotated, not just ignored.',
      ],
      source: 'Atlassian — .gitignore tutorial; Playwright docs — Authentication (ignore playwright/.auth)',
    },
    {
      heading: 'Pull requests and code review for test code',
      body: `**Intuition:** a pull request is a proposal: "here are my commits; please check them and merge them into main." It is where CI runs your tests and where teammates catch problems before they reach everyone.

**Typical PR flow on GitHub:**
1. Push your branch, open a PR against \`main\` with a clear title and description (what is covered, how to run, linked ticket).
2. The workflow triggered by \`pull_request\` runs the Playwright suite; results appear as checks on the PR.
3. Reviewers comment; you push fixes to the same branch (the PR updates automatically).
4. Once checks are green and reviews approved, the PR is merged (merge commit, squash, or rebase, per team policy).
5. **Branch protection** on \`main\` can require passing checks and at least one approval.

**What a good reviewer checks in test code:**
| Area | Look for |
|---|---|
| Reliability | no \`waitForTimeout\`, web-first assertions, no \`.only\` |
| Locators | role/label/test-id, not long CSS/XPath |
| Independence | own test data, no order dependence, cleanup |
| Readability | descriptive titles, \`test.step\`, page objects reused |
| Coverage | negative and edge cases, not just the happy path |
| Secrets | no credentials, tokens or real personal data |
| Speed | API setup instead of long UI setup |

**In interviews, say this:** "Test code gets the same review standard as product code; my PRs include evidence the new tests pass reliably, e.g. a run with --repeat-each."`,
      keyPoints: [
        'PRs = review + CI gate before merging into main.',
        'Branch protection enforces green checks and approvals.',
        'Review test code for flakiness, locators, independence and secrets.',
      ],
      source: 'GitHub Docs — About pull requests, protected branches; GitHub Skills — Review pull requests',
    },
    {
      heading: 'Making the config CI-aware with process.env.CI',
      body: `**Intuition:** your laptop and the CI runner want different things. Locally you want speed and a report that pops open; in CI you want stability, retries, evidence and machine-readable output. One config file, two behaviours, switched by an environment variable.

GitHub Actions, GitLab CI, Azure Pipelines and most CI systems set \`CI=true\` automatically, so \`process.env.CI\` is truthy there.

| Setting | Local | CI | Why |
|---|---|---|---|
| \`forbidOnly\` | false | **true** | a forgotten \`test.only\` must fail CI, not silently skip the suite |
| \`retries\` | 0 | 2 | absorb rare infra blips; produce flaky labels |
| \`workers\` | default (50% of cores) | 1 (docs' recommendation for stability) or a tuned number | shared runners have few cores |
| \`reporter\` | \`list\` + html | \`dot\`/\`github\` + html (\`open: 'never'\`) + junit/blob | humans vs machines |
| \`trace\` | as needed | \`on-first-retry\` | evidence for failures only |
| \`webServer.reuseExistingServer\` | true | false | CI must start a fresh app |

Environment URLs and credentials come from env vars as well (e.g. \`process.env.BASE_URL ?? 'http://localhost:3000'\`), set by the workflow from secrets.`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts (based on the generated file)',
          code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,           // fail CI if test.only was committed
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // raise once the suite is proven stable
  reporter: process.env.CI
    ? [['dot'], ['github'], ['html', { open: 'never' }]]
    : [['list'], ['html']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`,
        },
      ],
      keyPoints: [
        'CI systems set CI=true; branch config on it.',
        'forbidOnly + retries + trace on-first-retry are the CI essentials.',
        'URLs and secrets come from environment variables.',
      ],
      source: 'Playwright docs — Setting up CI; Continuous Integration (workers); Test configuration',
    },
    {
      heading: 'GitHub Actions: the Playwright workflow line by line',
      body: `**Intuition:** a workflow is a recipe that GitHub runs on a fresh virtual machine every time something happens (a push, a PR, a schedule). Because the machine starts empty, the recipe must install *everything*, including the browsers.

\`npm init playwright@latest\` can generate \`.github/workflows/playwright.yml\`. Key parts:

- **\`on:\`** triggers: \`push\` and \`pull_request\` to \`main\`/\`master\`. Add \`workflow_dispatch\` (manual button) and \`schedule\` (nightly cron) as needed.
- **\`runs-on: ubuntu-latest\`**: a GitHub-hosted Linux runner.
- **\`actions/checkout\`**: gets your code. **\`actions/setup-node\`** with \`node-version: lts/*\`.
- **\`npm ci\`**: clean install from \`package-lock.json\` (exact versions, fails if the lock file is out of sync).
- **\`npx playwright install --with-deps\`**: downloads the browsers matching *your* Playwright version **and** the Linux system libraries they need. Without it, tests fail with "Executable doesn't exist".
- **\`npx playwright test\`**: runs the suite; a non-zero exit code fails the job.
- **\`actions/upload-artifact\`** with \`if: \${{ !cancelled() }}\`: uploads \`playwright-report/\` **even when tests failed** (the default \`success()\` condition would skip it exactly when you need it). \`retention-days: 30\`.

**Secrets:** add them under *Settings → Secrets and variables → Actions*, then map them in the workflow: \`env: { BOOKER_PASS: \${{ secrets.BOOKER_PASS }} }\`. GitHub masks them in logs. Pull requests from forks do not receive secrets.

**Timeouts:** add \`timeout-minutes\` on the job and \`globalTimeout\` in the Playwright config so a hung run is stopped (the config timeout still lets reporters write the report).`,
      code: [
        {
          language: 'yaml',
          title: '.github/workflows/playwright.yml',
          code: `name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:            # manual "Run workflow" button
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    env:
      BASE_URL: \${{ vars.STAGING_URL }}
      BOOKER_USER: \${{ secrets.BOOKER_USER }}
      BOOKER_PASS: \${{ secrets.BOOKER_PASS }}
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm                  # reuse the npm download cache
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}      # upload even when tests fail
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30`,
        },
      ],
      keyPoints: [
        'Fresh runner every time: npm ci + playwright install --with-deps are mandatory.',
        'Upload the report with if: !cancelled() so failed runs keep their evidence.',
        'Secrets via repository secrets → env → process.env.',
      ],
      source: 'Playwright docs — Setting up CI (generated workflow); GitHub Docs — Workflow syntax, Using secrets, Storing workflow data as artifacts',
    },
    {
      heading: 'Artifacts: reports, traces and retention',
      body: `**Intuition:** the CI runner is destroyed when the job ends. Anything you did not upload as an artifact is gone, including the report you need to debug the failure.

**What to upload:**
| Artifact | Path | When |
|---|---|---|
| HTML report | \`playwright-report/\` | always (\`!cancelled()\`) |
| Raw results (traces, videos, screenshots) | \`test-results/\` | on failure, if the report does not already include them |
| JUnit XML | e.g. \`results/junit.xml\` | for CI test tabs / other tools |
| Blob reports | \`blob-report/\` | per shard, short retention (1 day), merged later |

The HTML report embeds attachments (screenshots, videos, trace files) from \`test-results\`, so downloading the report artifact, unzipping it and running \`npx playwright show-report <folder>\` gives you everything, traces included.

**Retention and size:** artifacts count toward storage limits. Keep blob reports for a day, merged reports for 14–30 days. Prefer \`trace: 'on-first-retry'\` and \`video: 'retain-on-failure'\` so green tests produce almost nothing.

**Names must be unique** within a run in \`upload-artifact@v4\`: with a matrix, include the matrix value in the name (\`blob-report-\${{ matrix.shardIndex }}\`), otherwise the second upload fails.

**Sensitive data:** traces contain network bodies and cookies, so treat artifacts as confidential; on public repos anyone can download them.`,
      code: [
        {
          language: 'yaml',
          title: 'Upload results only when something failed',
          code: `      - name: Run Playwright tests
        run: npx playwright test
      - name: Upload HTML report
        if: \${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
      - name: Upload raw test results on failure
        if: \${{ failure() }}
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7`,
        },
      ],
      keyPoints: [
        'No artifact = no evidence once the runner is gone.',
        'Unique artifact names per matrix job.',
        'Short retention for raw data; artifacts may contain secrets.',
      ],
      source: 'GitHub Docs — Storing workflow data as artifacts; Playwright docs — Setting up CI, Reporters (HTML)',
    },
    {
      heading: 'Parallelism, workers and sharding',
      body: `**Intuition:** workers are more cashiers in **one** shop; shards are opening **more shops**. Each shop (machine) runs its share of customers (tests), and each shop can have several cashiers (workers).

**Workers (one machine):** Playwright runs tests in parallel worker processes, each with its own browser. Default is **50% of logical CPU cores**; set \`workers\` in config or \`--workers\` / \`-j\`. Too many workers on a small runner causes CPU starvation and flaky timeouts.

**What runs in parallel:** by default, **files** run in parallel, but tests inside one file run in order in the same worker. \`fullyParallel: true\` (or \`test.describe.configure({ mode: 'parallel' })\`) lets individual tests spread across workers.

**Sharding (many machines):** \`npx playwright test --shard=2/4\` runs the second quarter of the suite. In CI, a **matrix** starts N jobs, each with its own shard index. With \`fullyParallel: true\`, shards split **per test** and are evenly balanced; without it they split **per file**, so one huge file can make one shard much slower.

**Merging results:** each shard only knows its own tests. Configure \`reporter: process.env.CI ? 'blob' : 'html'\`, upload each \`blob-report/\` as an artifact, then a final job downloads them all and runs \`npx playwright merge-reports --reporter html ./all-blob-reports\` to produce one HTML report.

| Knob | Scope | Speeds up by | Watch out for |
|---|---|---|---|
| \`workers\` | one machine | CPU cores | contention, shared data |
| \`fullyParallel\` | test granularity | balancing | tests must be independent |
| \`--shard\` | many machines | number of jobs | setup overhead per job, report merging |

**Wall time ≈ (tests × avg duration) ÷ (shards × workers) + per-job setup (install, browsers) + retries + merge job.**`,
      code: [
        {
          language: 'yaml',
          title: 'Four shards + one merged HTML report',
          code: `jobs:
  playwright-tests:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false                  # let every shard finish
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}
        with:
          name: blob-report-\${{ matrix.shardIndex }}
          path: blob-report
          retention-days: 1

  merge-reports:
    if: \${{ !cancelled() }}
    needs: [playwright-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: html-report--attempt-\${{ github.run_attempt }}
          path: playwright-report
          retention-days: 14`,
        },
      ],
      diagram: `            +-- shard 1/4: [w1][w2] --> blob-report-1 --+
  matrix ---+-- shard 2/4: [w1][w2] --> blob-report-2 --+--> merge-reports --> 1 HTML report
            +-- shard 3/4: [w1][w2] --> blob-report-3 --+
            +-- shard 4/4: [w1][w2] --> blob-report-4 --+
     (each shard = separate VM; each w = worker process with its own browser)`,
      keyPoints: [
        'Workers parallelise inside a machine; shards across machines.',
        'fullyParallel gives per-test parallelism and balanced shards.',
        'Shards need blob reports + merge-reports for one combined report.',
      ],
      source: 'Playwright docs — Parallelism; Sharding; Continuous Integration',
    },
    {
      heading: 'Running in Docker and on Jenkins',
      body: `**Intuition:** a Docker image is a pre-packed lunchbox: OS, Node, browsers and their system libraries, all at known versions. Every machine that opens it gets exactly the same environment, which removes a whole class of "works on my machine" failures.

**The official image:** \`mcr.microsoft.com/playwright:v1.64.0-noble\` (Ubuntu 24.04; \`-jammy\` = 22.04). Rules:
- **Pin the tag to the same version as \`@playwright/test\` in \`package.json\`.** A mismatch means Playwright looks for browser builds the image doesn't have.
- Run with \`--init\` (avoids zombie processes from PID 1) and \`--ipc=host\` (Chromium can run out of shared memory and crash without it).
- Browsers are pre-installed, so skip \`npx playwright install\`, but still run \`npm ci\`.
- The image runs as root by default, which is acceptable for testing your own app; for crawling untrusted sites use a non-root user and a seccomp profile.

**GitHub Actions container job:** add \`container: { image: mcr.microsoft.com/playwright:v1.64.0-noble, options: --user 1001 }\` to the job, then the steps are checkout, setup-node, \`npm ci\`, \`npx playwright test\`.

**Jenkins:** a declarative pipeline with a Docker agent using the same image; publish \`junit\` XML with the JUnit plugin and archive \`playwright-report\` (or use the HTML Publisher plugin). Jenkins does not set \`CI\` automatically in every setup, so set \`CI=true\` in \`environment\` if your config depends on it.`,
      code: [
        {
          language: 'text',
          title: 'Jenkinsfile (declarative, Docker agent)',
          code: `pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.64.0-noble'  // match package.json version
      args '--ipc=host --init'
    }
  }
  environment {
    CI = 'true'
    PLAYWRIGHT_JUNIT_OUTPUT_NAME = 'results/junit.xml' // where the junit reporter writes
    BOOKER_PASS = credentials('booker-pass')   // Jenkins credential id
  }
  stages {
    stage('Install') { steps { sh 'npm ci' } }
    stage('Test')    { steps { sh 'npx playwright test --reporter=junit,html' } }
  }
  post {
    always {
      junit 'results/junit.xml'                // publish results in the Jenkins UI
      archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
    }
  }
}`,
        },
      ],
      keyPoints: [
        'Image tag must equal the Playwright version in package.json.',
        '--ipc=host and --init for stable Chromium runs.',
        'Jenkins: Docker agent + junit publishing + archived HTML report.',
      ],
      source: 'Playwright docs — Docker; Continuous Integration (GitHub Actions container, Jenkins)',
    },
    {
      heading: 'Tags, selective runs and pipeline strategy',
      body: `**Intuition:** you don't run the full medical check-up every time someone sneezes. Fast checks on every PR, the full suite on a schedule or before release.

**Tagging tests:** \`test('checkout total', { tag: ['@smoke', '@checkout'] }, async ({ page }) => {...})\` or a tag in the title (\`'checkout total @smoke'\`). Run subsets with \`--grep\` / \`--grep-invert\` (regular expressions):
- \`npx playwright test --grep @smoke\`
- \`npx playwright test --grep "@smoke|@critical"\`
- \`npx playwright test --grep-invert @slow\`

**Other selectors:** \`--project=chromium\`, a folder or file path, \`--only-changed=origin/main\` (only test files changed vs that Git ref, plus files that import changed files), \`--last-failed\`.

**A typical pipeline:**
| Trigger | What runs | Target time |
|---|---|---|
| Every PR | lint + \`@smoke\` on chromium + changed tests | < 10 min |
| Merge to main | full suite, chromium, sharded | < 20 min |
| Nightly (\`schedule: cron\`) | full suite, all browsers, \`@quarantine\` included | can be longer |
| Before release / after deploy | smoke against the deployed environment | minutes |

**Failure handling:** \`--max-failures=10\` stops a disastrous run early (e.g. the environment is down), saving CI minutes. Notify the team (Slack/email) on main/nightly failures, not on every PR.`,
      code: [
        {
          language: 'yaml',
          title: 'PR smoke vs nightly full run in one workflow',
          code: `on:
  pull_request:
  schedule:
    - cron: '30 1 * * *'          # 01:30 UTC every night
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with: { fetch-depth: 0 }  # full history so --only-changed can diff
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: PR - smoke + changed tests
        if: github.event_name == 'pull_request'
        run: |
          npx playwright test --grep @smoke --project=chromium
          npx playwright test --only-changed=origin/\${{ github.base_ref }} --project=chromium
      - name: Nightly - everything
        if: github.event_name == 'schedule'
        run: npx playwright test`,
        },
      ],
      keyPoints: [
        'Tag with { tag: \'@smoke\' } and select with --grep / --grep-invert.',
        'Fast feedback on PRs, full coverage on main/nightly.',
        '--only-changed needs Git history (fetch-depth: 0).',
      ],
      source: 'Playwright docs — Annotations (tag tests); Command line; GitHub Docs — Events that trigger workflows (schedule)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-git-ci-cc-1',
      title: 'Fix the broken GitHub Actions workflow',
      context:
        'A teammate added this workflow. Every run fails with "browserType.launch: Executable doesn\'t exist", when tests do fail nobody can see a report, a forgotten `test.only` once made CI run a single test for a week, and flaky failures block every PR.',
      task: 'Rewrite the workflow (and the matching lines of `playwright.config.ts`) so CI installs what it needs, keeps evidence on failure, tolerates rare flakes while reporting them, and cannot be fooled by `test.only`.',
      starter: {
        language: 'yaml',
        code: `name: e2e
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 14
      - run: npm install
      - run: npx playwright test
        env:
          BOOKER_PASS: password123
      - uses: actions/upload-artifact@v4
        with:
          name: report
          path: playwright-report/

# playwright.config.ts (relevant part)
#   retries: 0,
#   workers: 8,
#   use: { trace: 'on' },`,
      },
      hints: [
        'A brand-new runner has Node and your code, but no browsers. Which command installs them plus their Linux dependencies?',
        'What is the default `if:` condition for a step, and what happens to the upload step when tests fail?',
        'Which config options handle `test.only`, retries and trace only on CI? Where should the password live?',
      ],
      solution: {
        language: 'yaml',
        code: `name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*           # Playwright needs a supported Node LTS
          cache: npm
      - run: npm ci                     # exact versions from package-lock.json
      - run: npx playwright install --with-deps   # browsers + OS libraries
      - run: npx playwright test
        env:
          BOOKER_PASS: \${{ secrets.BOOKER_PASS }} # from repository secrets
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}          # upload even when tests failed
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

# playwright.config.ts (relevant part)
#   forbidOnly: !!process.env.CI,
#   retries: process.env.CI ? 2 : 0,
#   workers: process.env.CI ? 1 : undefined,   // tune up later, e.g. 2 on a 4-vCPU runner
#   reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
#   use: { trace: 'on-first-retry' },`,
      },
      explanation: `**Fixes:**
- **Browsers installed:** \`npx playwright install --with-deps\` downloads the browser builds for the project's Playwright version and their system libraries. Missing it caused "Executable doesn't exist".
- **Node version:** Node 14 is long unsupported by current Playwright; \`lts/*\` picks the current LTS.
- **\`npm ci\` instead of \`npm install\`:** reproducible installs from the lock file; fails fast if \`package.json\` and the lock file disagree.
- **Report upload with \`if: \${{ !cancelled() }}\`:** the default condition is \`success()\`, so the upload was skipped exactly on failing runs. Retention set explicitly.
- **Secret moved out of the YAML** into GitHub secrets; the old password was committed in plain text and must be rotated.
- **Triggers:** PRs now run the suite too, not just pushes.
- **Config:** \`forbidOnly\` fails CI on a committed \`test.only\`; \`retries: 2\` on CI only absorbs rare flakes and labels them; \`trace: 'on-first-retry'\` replaces tracing every test; \`workers: 8\` on a small runner caused CPU starvation, so start at 1 and tune.
- **\`timeout-minutes\`** stops a hung job from burning CI minutes.`,
      followUps: [
        {
          q: 'How would you speed up the browser install step?',
          a: 'Options: use the official Docker image as a container job (browsers pre-installed), install only the browsers you test (`npx playwright install --with-deps chromium`), or cache `~/.cache/ms-playwright` keyed on the Playwright version (still run `install-deps` for system libraries). The Playwright docs note caching browsers often saves little versus download time, so measure first.',
        },
        {
          q: 'Why not keep `trace: \'on\'` for maximum evidence?',
          a: 'Recording a trace for every test slows the whole suite and creates large artifacts, yet green tests\' traces are almost never opened. With `on-first-retry` you get a trace for every failure that matters at nearly zero cost for passing tests.',
        },
      ],
    },
    {
      id: 'pw-git-ci-cc-2',
      title: 'Sharding that actually produces one report',
      context:
        'To cut a 40-minute run, someone split the suite into 3 shards. Now the second and third shards fail at the upload step, nobody gets a complete report, one failing shard cancels the others, and shard 1 takes 3× longer than shard 3.',
      task: 'Fix the workflow and config so shards are balanced, all of them finish, and a single merged HTML report is produced.',
      starter: {
        language: 'yaml',
        code: `jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=\${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

# playwright.config.ts
#   fullyParallel: false,
#   reporter: 'html',`,
      },
      hints: [
        'Artifact names must be unique within a run in upload-artifact v4. What changes per matrix job?',
        'An HTML report from one shard only contains that shard\'s tests. Which reporter is designed to be merged later?',
        'How are tests split among shards when `fullyParallel` is false? What does `fail-fast` do in a matrix?',
      ],
      solution: {
        language: 'yaml',
        code: `jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false                    # one red shard must not cancel the others
      matrix:
        shardIndex: [1, 2, 3]
        shardTotal: [3]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}
        with:
          name: blob-report-\${{ matrix.shardIndex }}   # unique per shard
          path: blob-report
          retention-days: 1

  merge-reports:
    if: \${{ !cancelled() }}
    needs: [e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: lts/* }
      - run: npm ci
      - uses: actions/download-artifact@v4
        with: { path: all-blob-reports, pattern: blob-report-*, merge-multiple: true }
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report, retention-days: 14 }

# playwright.config.ts
#   fullyParallel: true,                           // split per test -> balanced shards
#   reporter: process.env.CI ? 'blob' : 'html',`,
      },
      explanation: `**Fixes:**
- **Unique artifact names** (\`blob-report-<index>\`): with \`upload-artifact@v4\`, a second upload with the same name in one run fails, which is why shards 2 and 3 errored.
- **Blob reporter + merge job:** each shard writes a mergeable \`blob-report/\`; the \`merge-reports\` job downloads all of them (\`pattern\` + \`merge-multiple\`) and produces one HTML report covering the whole run.
- **\`fail-fast: false\`:** by default a failing matrix job cancels its siblings, so you lost the other shards' results.
- **\`fullyParallel: true\`:** without it, sharding happens per file, so a shard that gets a few huge spec files runs far longer. Per-test splitting evens shards out (tests must be independent).
- **\`if: \${{ !cancelled() }}\`** instead of \`always()\`: still uploads after failures but respects a manual cancel.
- **Explicit \`shardTotal\`** in the matrix avoids a hard-coded "3" drifting out of sync with the matrix.`,
      followUps: [
        {
          q: 'Each shard repeats npm ci and browser install. When does adding shards stop paying off?',
          a: 'When per-shard fixed cost (checkout, npm ci, browser install, often 1–3 minutes) is comparable to the test time per shard. For example, 12 minutes of tests across 6 shards is 2 minutes each plus ~2 minutes setup, so going to 12 shards barely helps while doubling runner usage. Use a Docker image or fewer, larger shards.',
        },
        {
          q: 'How would you also get a JUnit file for the whole run?',
          a: 'Merge into several formats at once: `npx playwright merge-reports --reporter=html,junit ./all-blob-reports` (JUnit output path configured via a merge config or the PLAYWRIGHT_JUNIT_OUTPUT_NAME env var), then upload or publish the XML in the merge job.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-git-ci-iq-01',
      difficulty: 'medium',
      question: 'Walk me through how you set up your Playwright tests to run on every pull request in GitHub Actions.',
      whatInterviewerLooksFor: [
        'Correct sequence of steps including browser install',
        'Artifact upload that survives failures',
        'CI-aware config (forbidOnly, retries, trace, workers)',
        'Secrets handling and branch protection',
      ],
      modelAnswer: `**Workflow file** in \`.github/workflows/playwright.yml\`, triggered on \`pull_request\` and \`push\` to main.

**Steps on \`ubuntu-latest\`:**
1. \`actions/checkout\` to get the code.
2. \`actions/setup-node\` with an LTS version and npm caching.
3. \`npm ci\` for exact dependency versions from the lock file.
4. \`npx playwright install --with-deps\` for browsers and their OS libraries (or run inside the official Playwright Docker image instead).
5. \`npx playwright test\`.
6. \`actions/upload-artifact\` for \`playwright-report/\` with \`if: \${{ !cancelled() }}\`, so failed runs keep the report, traces and screenshots.

**Config switches on \`process.env.CI\`:** \`forbidOnly\` so a committed \`test.only\` fails the build, \`retries: 2\` with \`trace: 'on-first-retry'\` so rare flakes don't block PRs but always leave a trace, a conservative worker count for the runner size, and reporters \`github\` (PR annotations) plus \`html\` with \`open: 'never'\`.

**Secrets:** test credentials and URLs live in GitHub secrets/variables, mapped into \`env\` and read via \`process.env\`. Nothing sensitive in the repo.

**Gate:** branch protection on \`main\` requires the Playwright check to pass before merge.

**As the suite grows:** tag \`@smoke\` tests for PRs and run the full suite on main and nightly, then shard with blob reports and a merge job when the run gets long.`,
      followUps: [
        {
          q: 'The job fails with "Executable doesn\'t exist at /home/runner/.cache/ms-playwright/...". Why?',
          a: 'Browsers were not installed on the runner, or were installed for a different Playwright version than the one in package-lock. Add `npx playwright install --with-deps` after `npm ci` (so it uses the project\'s version), or use the Docker image whose tag matches the installed @playwright/test version.',
        },
        {
          q: 'How do you see what failed after the run?',
          a: 'Download the playwright-report artifact from the run summary, unzip it and run `npx playwright show-report <folder>`. Each failed test has its error, screenshot, video and trace; I open the trace to see the DOM, network and timing of the failing step. The `github` reporter also annotates failures on the PR.',
        },
      ],
      pitfalls: [
        'Forgetting the browser install step.',
        'Uploading the report only on success.',
        'Hard-coding credentials in the YAML.',
      ],
    },
    {
      id: 'pw-git-ci-iq-02',
      difficulty: 'medium',
      question: 'Workers, fullyParallel and sharding all speed up a Playwright run. How do they differ, and how do you pick between them?',
      whatInterviewerLooksFor: [
        'Workers = processes on one machine; default 50% cores',
        'fullyParallel = test-level vs file-level parallelism',
        'Sharding = across machines, with merge-reports',
        'Trade-offs: CPU contention, setup overhead, independence',
      ],
      modelAnswer: `**Workers:** worker processes on **one machine**, each with its own browser. Playwright defaults to half the logical CPU cores; set \`workers\` in config or \`--workers=N\`. More workers help until the CPU is saturated, after which tests slow down and flake.

**fullyParallel:** controls the **granularity**. By default files are distributed across workers but tests inside a file run sequentially in one worker. With \`fullyParallel: true\`, individual tests from the same file can run in different workers at the same time. It requires independent tests (no shared state, no order dependence). It also changes sharding: shards are split per test instead of per file, giving much better balance.

**Sharding:** splits the suite across **several machines**: \`--shard=1/4\` … \`--shard=4/4\`, usually via a CI matrix. Each machine still uses its own workers. Because each shard has only part of the results, configure the \`blob\` reporter, upload each shard's blob report, and run \`npx playwright merge-reports\` in a final job.

**When:**
- Small suite: just workers on one runner.
- Suite slow and the runner is maxed out: add shards.
- Shards unbalanced (one finishes much later): enable \`fullyParallel\` or split big files.
- Each shard has fixed overhead (checkout, npm ci, browsers, 1–3 min), so very many tiny shards are wasteful.

**Rough math:** wall time ≈ total test time ÷ (shards × workers) + setup per shard + retries + merge.`,
      followUps: [
        {
          q: 'Why do the Playwright docs suggest workers: 1 on CI?',
          a: 'For stability and reproducibility on small shared runners: fewer CPU-starvation timeouts and no collisions between parallel tests. Once tests are proven independent and the runner has enough cores, you can raise workers, and use sharding to scale further.',
        },
        {
          q: 'Your tests share one admin account. What breaks when you enable fullyParallel?',
          a: 'Tests running at the same time change the same user\'s data: one empties the cart while another asserts its count, or a logout in one test invalidates another\'s session. Fix with per-worker accounts (testInfo.workerIndex), API-created unique data, and storageState per worker or role.',
        },
      ],
      pitfalls: [
        'Saying shards and workers are the same thing.',
        'Thinking more workers always means faster.',
        'Forgetting that shard reports need merging.',
      ],
    },
    {
      id: 'pw-git-ci-iq-03',
      difficulty: 'hard',
      question: 'Your Playwright pipeline takes 50 minutes. The team wants PR feedback in under 10. What would you do?',
      whatInterviewerLooksFor: [
        'Measures first (slowest tests, setup time, retries)',
        'Fixes test design before adding hardware',
        'Uses sharding/workers with numbers',
        'Splits PR vs nightly scope with tags',
      ],
      modelAnswer: `**1. Measure.** From the HTML/JSON report: total test time, the slowest files, retry count, and the fixed setup time (npm ci, browser install). Often 10% of tests take half the time, and retries of flaky tests add a lot.

**2. Make tests cheaper (biggest wins):**
- Replace UI setup with **API setup** and reuse login via **storageState**. Login and data setup through the UI is commonly the majority of runtime.
- Remove every \`waitForTimeout\`.
- Fix flaky tests so retries stop adding minutes.
- Block or mock third-party scripts with \`page.route\`.

**3. Parallelise properly:**
- \`fullyParallel: true\` once tests are independent.
- Workers matched to the runner's cores.
- **Shard** across e.g. 4 machines with blob reports and a merge job. 40 minutes of test time ÷ 4 shards ≈ 10 min, plus ~2 min setup.
- Use the Playwright Docker image (or install only the browsers needed) to cut setup.

**4. Run less on PRs:**
- PR: \`@smoke\` + \`--only-changed=origin/main\` on chromium only (often 5–8 minutes).
- Merge to main: full suite on chromium, sharded.
- Nightly: all browsers, including slow and quarantined tests.

**5. Fail fast:** \`--max-failures\` to stop when the environment is down instead of timing out 300 tests.

Then re-measure; I'd present before/after numbers rather than a feeling.`,
      followUps: [
        {
          q: 'Why not just run only chromium on PRs forever?',
          a: 'Cross-browser bugs (WebKit date pickers, Firefox layout) would only be found nightly, after merge. That is usually acceptable if nightly failures are triaged the next morning and cross-browser risky areas (CSS-heavy pages) are tagged to run on all browsers in PRs. It\'s a risk trade-off to agree with the team.',
        },
        {
          q: 'What does --only-changed miss?',
          a: 'It selects test files changed relative to a Git ref, plus test files that import changed files. It cannot know that a change in application code or a backend endpoint affects a test, since it looks at the test project\'s import graph. So it complements smoke tests on PRs; it doesn\'t replace the full run on main.',
        },
      ],
      pitfalls: [
        'Jumping straight to "add more machines".',
        'Deleting slow tests without checking coverage.',
        'Increasing workers on a 2-core runner.',
      ],
    },
    {
      id: 'pw-git-ci-iq-04',
      difficulty: 'easy',
      question: 'What is the difference between git merge and git rebase, and how do you resolve a merge conflict?',
      whatInterviewerLooksFor: [
        'Clear history difference (merge commit vs linear replay)',
        'Knows not to rebase shared branches',
        'Concrete conflict resolution steps including re-running tests',
        'Knows abort commands',
      ],
      modelAnswer: `**Merge** combines two branches by creating a **merge commit** with two parents. History stays exactly as it happened, and it's safe on shared branches.

**Rebase** takes my branch's commits and **replays them on top of** the target branch, giving a straight-line history. Because it creates new commit hashes, I only rebase **my own** feature branch, and push afterwards with \`--force-with-lease\`. Never rebase \`main\` or a branch others build on.

**Resolving a conflict (e.g. after \`git merge origin/main\`):**
1. \`git status\` lists files as "both modified".
2. In each file, find the markers: \`<<<<<<< HEAD\` (mine), \`=======\`, \`>>>>>>> origin/main\` (theirs).
3. Decide the correct result by **intent**: often both changes are needed (e.g. they added a firefox project, I changed retries, so keep both). If unclear, ask the other author.
4. Remove the markers, then **run the affected tests**. A conflict in \`playwright.config.ts\` or a page object can break many tests.
5. \`git add <file>\` → \`git commit\` (for a merge) or \`git rebase --continue\` (for a rebase).
6. If it goes wrong: \`git merge --abort\` or \`git rebase --abort\` returns to the state before.

**Prevent conflicts:** small PRs, merge or rebase from main often, and avoid long-lived branches.`,
      followUps: [
        {
          q: 'What is the difference between git fetch and git pull?',
          a: '`git fetch` downloads new commits and updates remote-tracking branches like origin/main, without touching your working files or current branch. `git pull` does a fetch and then merges (or rebases, with --rebase) into your current branch. Fetch first when you want to inspect incoming changes before integrating them.',
        },
        {
          q: 'You pushed a commit to main that broke CI. How do you undo it?',
          a: 'Use `git revert <hash>` to create a new commit that reverses it, and push that. It keeps history intact for everyone else. Avoid `git reset` plus force-push on a shared branch, because it rewrites history others may already have pulled.',
        },
      ],
      pitfalls: [
        'Saying rebase is always better.',
        'Resolving by blindly picking "mine" or "theirs".',
        'Not re-running tests after resolving.',
      ],
    },
    {
      id: 'pw-git-ci-iq-05',
      difficulty: 'medium',
      question: 'How do you manage credentials and environment URLs for your tests across local runs and CI?',
      whatInterviewerLooksFor: [
        'Env vars + dotenv locally, CI secrets in pipeline',
        '.gitignore for .env and .auth',
        'Different environments via config/env',
        'Awareness of leaks via logs, traces, forks',
      ],
      modelAnswer: `**Principle:** code reads configuration from environment variables; values come from different places per environment, and secrets never enter Git.

**Locally:** a \`.env\` file (git-ignored) loaded with \`dotenv\` at the top of \`playwright.config.ts\`; a committed \`.env.example\` lists the variable names with fake values so newcomers know what to set.

**In CI (GitHub Actions):** repository or environment **secrets** (passwords, tokens) and **variables** (URLs), mapped in the workflow: \`env: { BASE_URL: \${{ vars.STAGING_URL }}, BOOKER_PASS: \${{ secrets.BOOKER_PASS }} }\`. GitHub masks secret values in logs. Jenkins uses its credentials store with \`credentials('id')\`.

**Multiple environments:** \`baseURL: process.env.BASE_URL ?? 'http://localhost:3000'\`, or a \`TEST_ENV\` variable that picks \`.env.staging\` / \`.env.qa\`. GitHub "environments" can scope secrets per stage and require approvals for production.

**Things that leak secrets anyway:**
- \`console.log\` of tokens in tests;
- traces and HAR files (they record headers and bodies), so keep artifact retention short;
- \`playwright/.auth/*.json\` storageState files, so git-ignore them;
- pull requests from forks don't get secrets, by design, so plan for tests that need them to skip or run only on internal branches.

If a secret is ever committed, **rotate it** first, then clean it up; deleting the line doesn't remove it from history.`,
      followUps: [
        {
          q: 'Should tests run against production?',
          a: 'Only a small read-only or carefully designed smoke set with dedicated test accounts, flagged data that is cleaned up, and agreement from the team. Full regression with data creation belongs in test/staging environments.',
        },
        {
          q: 'How do you stop someone from accidentally committing .env?',
          a: 'It is in .gitignore from day one, there is a pre-commit hook or secret scanner (e.g. GitHub secret scanning/push protection), and code review checks for credentials. Education matters too: the .env.example pattern shows where values belong.',
        },
      ],
      pitfalls: [
        'Hard-coding passwords "because it\'s only a test account".',
        'Committing storageState files.',
        'Printing tokens in logs for debugging and leaving it.',
      ],
    },
    {
      id: 'pw-git-ci-iq-06',
      difficulty: 'hard',
      question: 'Why would you run Playwright tests inside the official Docker image, and what can go wrong?',
      whatInterviewerLooksFor: [
        'Reproducible environment argument',
        'Version pinning rule',
        '--ipc=host / --init flags',
        'Root/sandbox and image size considerations',
      ],
      modelAnswer: `**Why:** the image (\`mcr.microsoft.com/playwright:v<version>-noble\`) bundles the OS, Node, all three browsers and every system library they need. Every developer and every CI system that uses it gets an identical environment:
- no "browser missing" or "libXYZ not found" failures;
- no slow \`playwright install --with-deps\` step;
- the same fonts and rendering, which matters a lot for **screenshot comparisons** (\`toHaveScreenshot\`), where OS differences cause pixel diffs;
- easy reuse across GitHub Actions (\`container:\`), GitLab, Jenkins Docker agents and Azure.

**What can go wrong:**
- **Version mismatch:** the image tag must equal the \`@playwright/test\` version in the lock file. If you upgrade Playwright but not the image, it looks for browser builds that aren't there.
- **Chromium crashes / out of memory:** run with \`--ipc=host\` (Chromium uses shared memory) and \`--init\` to avoid zombie processes.
- **Root user:** the image runs as root by default, which disables the Chromium sandbox. That's acceptable for testing your own app, but not for crawling untrusted sites; then use a non-root user (\`pwuser\`) and the seccomp profile. In GitHub Actions container jobs, the docs use \`options: --user 1001\`.
- **Size:** the image is large; the first pull is slow unless cached on the runner.
- **Local apps:** inside a container, \`localhost\` is the container itself; to reach an app on the host you need host networking or the host's address.

I add a check in the upgrade checklist: bump \`@playwright/test\`, the Docker tag and the snapshot baselines together.`,
      followUps: [
        {
          q: 'Your screenshot tests pass on macOS but fail in CI. How does Docker help?',
          a: 'Screenshots depend on OS fonts, anti-aliasing and GPU settings, so baselines generated on macOS will differ from Linux CI. Generate and update baselines inside the same Docker image that CI uses (e.g. run `npx playwright test --update-snapshots` in the container), so both sides render identically.',
        },
        {
          q: 'Do you still need `npx playwright install` inside the image?',
          a: 'No; browsers for that version are pre-installed. You still need `npm ci` to install your project dependencies, including @playwright/test at the same version as the image.',
        },
      ],
      pitfalls: [
        'Using the `latest` tag and drifting from the project\'s version.',
        'Forgetting --ipc=host and blaming Playwright for random Chromium crashes.',
        'Thinking Docker makes flaky tests stable.',
      ],
    },
    {
      id: 'pw-git-ci-iq-07',
      difficulty: 'medium',
      question: 'How do you decide which tests run on each pull request and which run nightly? How do you implement it in Playwright?',
      whatInterviewerLooksFor: [
        'Risk- and time-based selection',
        'Tags with --grep / --grep-invert',
        'Projects and --only-changed',
        'Feedback loop for nightly failures',
      ],
      modelAnswer: `**Principle:** PRs need **fast, trustworthy** feedback on the most important risks; the full suite still runs often enough that nothing hides for long.

**Selection criteria:**
- **Business-critical flows** (login, search, add to cart, checkout, payment) → \`@smoke\`, run on every PR.
- **Tests related to the change** → \`--only-changed=origin/main\` picks test files changed in the PR and those importing changed files.
- **Long, cross-browser, visual and quarantined tests** → nightly.

**Implementation:**
- Tag tests: \`test('pay with saved card', { tag: ['@smoke', '@payments'] }, ...)\` or \`test.describe('Checkout', { tag: '@smoke' }, ...)\`.
- PR job: \`npx playwright test --grep @smoke --project=chromium\` plus the \`--only-changed\` run.
- Main: full suite on chromium, sharded.
- Nightly (\`schedule: cron\`): \`npx playwright test\` on all projects, including \`@quarantine\` and \`@slow\`.
- Exclusions: \`--grep-invert "@quarantine|@slow"\` on PRs.

**Feedback loop:** nightly failures post to the team channel, someone triages them first thing in the morning, and if a nightly-only bug escapes often, that test is promoted into \`@smoke\`.

**Keep the smoke set honest:** it should stay under ~10 minutes; if it grows, review it like a product backlog.`,
      followUps: [
        {
          q: 'A bug reached main because its test only ran nightly. What do you change?',
          a: 'Analyse why: was the area business-critical but untagged, or did the change touch shared code that --only-changed could not see? Then tag the test (or a lighter version of it) @smoke, or add a path-based rule in the workflow that runs the related folder when certain app directories change.',
        },
        {
          q: 'How do you tag a whole file or group?',
          a: 'Use `test.describe(\'Checkout\', { tag: \'@checkout\' }, () => { ... })`; all tests inside inherit the tag. Tags must start with @ and can be filtered with --grep, --grep-invert, or shown in the HTML report filters.',
        },
      ],
      pitfalls: [
        'Running the full multi-browser suite on every PR and accepting 60-minute waits.',
        'Running only smoke tests ever, never the full suite.',
        'No owner for nightly failures.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-git-ci-drill-1',
      question:
        'Estimate the wall-clock time of a CI run: 200 tests, 12 s average, `fullyParallel: true`, 4 workers per machine, 2 shards, about 10% of tests fail once and are retried (they pass on retry). Each shard job spends 2 minutes on checkout, `npm ci` and browser install, and the merge-reports job takes 1 minute.',
      assumptions: [
        'Runners have at least 4 vCPUs, so 4 workers run at full speed.',
        'fullyParallel splits tests evenly: 100 per shard, 25 per worker.',
        'A retry costs the test duration plus ~3 s for a new worker/browser.',
        'Shards run at the same time; the merge job starts after the slowest shard.',
      ],
      steps: [
        { label: 'Total test work', calc: '200 × 12 s = 2,400 s' },
        { label: 'Per shard', calc: '2,400 ÷ 2 = 1,200 s of work' },
        { label: 'Per worker (test time)', calc: '1,200 ÷ 4 = 300 s = 5 min' },
        { label: 'Retries per shard', calc: '10% of 100 = 10 retries × 15 s = 150 s ÷ 4 workers ≈ 38 s' },
        { label: 'Shard wall time', calc: '2 min setup + 5 min tests + ~0.6 min retries ≈ 7.6 min' },
        { label: 'Whole pipeline', calc: '7.6 min (slowest shard) + 1 min merge ≈ 8.6 min, call it 9 min' },
        { label: 'Comparison', calc: 'No sharding, 4 workers: 2 + 10 + 1.2 ≈ 13 min; 1 worker, no shards: 2 + 40 + 5 ≈ 47 min' },
      ],
      answer: `About **9 minutes** end to end. Test execution is only ~5 of those minutes per shard; fixed setup (2 min) and the merge job (1 min) are now a third of the total.`,
      insight: 'Once shards are in place, fixed costs dominate: more shards give diminishing returns. Cutting setup (Docker image, install only needed browsers) or fixing flaky retries can be worth as much as another shard.',
      followUps: [
        {
          q: 'What would 4 shards give?',
          a: '2,400 s ÷ 4 shards ÷ 4 workers = 150 s = 2.5 min of tests, about 0.3 min of retries, plus 2 min setup ≈ 4.8 min per shard, plus 1 min merge ≈ 6 min. Doubling the machines saved only ~3 minutes because setup and merge did not shrink.',
        },
      ],
    },
    {
      id: 'pw-git-ci-drill-2',
      question:
        'Your suite has 5 spec files with 60, 10, 10, 10 and 10 tests (all ~10 s each) and you run `--shard=1/2` and `--shard=2/2` with `fullyParallel: false`. Estimate the imbalance, then the result with `fullyParallel: true`.',
      assumptions: [
        'Without fullyParallel, a whole file is the smallest unit a shard can receive.',
        'Playwright tries to give shards equal test counts given that constraint.',
        '2 workers per shard; ignore setup time.',
      ],
      steps: [
        { label: 'Total', calc: '100 tests × 10 s = 1,000 s' },
        { label: 'Ideal per shard', calc: '50 tests = 500 s of work' },
        { label: 'File-level split', calc: 'Best possible: shard A = big file (60 tests), shard B = four small files (40 tests)' },
        { label: 'Shard A time', calc: '60 tests in ONE file run sequentially in one worker → 600 s (second worker idle)' },
        { label: 'Shard B time', calc: '4 files over 2 workers → 2 files each → 20 tests × 10 s = 200 s' },
        { label: 'fullyParallel: true', calc: '50 tests per shard, spread over 2 workers → 25 × 10 s = 250 s per shard' },
      ],
      answer: `With file-level sharding the run takes **~600 s** (one shard grinding through the 60-test file on a single worker while the other finishes in 200 s). With \`fullyParallel: true\`, each shard gets 50 tests split over both workers: **~250 s**, about 2.4× faster with the same machines.`,
      insight: 'Big spec files are the enemy of parallelism. Either enable fullyParallel (tests must be independent) or split large files.',
      followUps: [
        {
          q: 'Your tests in the big file depend on each other, so you cannot enable fullyParallel. What now?',
          a: 'Split the file into several smaller files by feature so the file-level split balances better, and work toward independence (API setup per test). Meanwhile, `test.describe.configure({ mode: \'parallel\' })` can be applied only to groups that are already independent.',
        },
      ],
    },
    {
      id: 'pw-git-ci-drill-3',
      question:
        'You are on branch `test/coupon` with two new commits. Your PR shows "This branch has conflicts that must be resolved" in `playwright.config.ts`, because `main` added a `webkit` project while you changed `retries`. Write the exact sequence of Git commands and actions to resolve it with a merge, and say what you check before pushing.',
      assumptions: [
        'Your working directory is clean.',
        'The remote is called origin; the team prefers merge commits over rebasing shared branches.',
        'Both changes should be kept.',
      ],
      steps: [
        { label: '1. Update remote refs', calc: 'git fetch origin' },
        { label: '2. Merge main into your branch', calc: 'git merge origin/main → "CONFLICT (content): Merge conflict in playwright.config.ts"' },
        { label: '3. Inspect', calc: 'git status → both modified: playwright.config.ts; open the file and find <<<<<<< / ======= / >>>>>>>' },
        { label: '4. Resolve by intent', calc: 'Keep your retries change AND main\'s new webkit project; delete all markers' },
        { label: '5. Verify', calc: 'npx playwright test --list (config loads, webkit project present) and run your coupon tests: npx playwright test tests/coupon.spec.ts' },
        { label: '6. Complete the merge', calc: 'git add playwright.config.ts && git commit (default merge message)' },
        { label: '7. Publish', calc: 'git push (no force needed: a merge only adds commits)' },
      ],
      answer: `\`git fetch origin\` → \`git merge origin/main\` → edit \`playwright.config.ts\` to keep both changes and remove markers → \`npx playwright test --list\` and run the affected tests → \`git add playwright.config.ts\` → \`git commit\` → \`git push\`. The PR updates and CI re-runs on the merged result.`,
      insight: 'A conflict in shared config is a test-infrastructure change: always prove the config still loads and the suite still lists every project before pushing.',
      followUps: [
        {
          q: 'How would the steps differ with a rebase?',
          a: 'Run `git rebase origin/main`; Git replays each of your commits and stops at the conflicting one. Resolve, `git add`, then `git rebase --continue` (repeat if more commits conflict). Because commit hashes change, push with `git push --force-with-lease`, which is only acceptable because the branch is yours.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-git-ci-mcq-01',
      difficulty: 'easy',
      question: 'You edited `tests/cart.spec.ts`. Which sequence publishes the change to your feature branch on GitHub?',
      options: [
        'git add tests/cart.spec.ts → git commit -m "test: cart badge" → git push',
        'git commit -m "test: cart badge" → git add tests/cart.spec.ts → git push',
        'git push → git add tests/cart.spec.ts → git commit -m "test: cart badge"',
        'git fetch → git commit -m "test: cart badge" → git pull',
      ],
      correct: [0],
      explanation:
        'Changes go working directory → staging (`add`) → local commit (`commit`) → remote (`push`). Committing before adding commits nothing new; pushing first sends nothing new; fetch and pull bring changes down, they do not publish yours.',
      followUps: [
        {
          q: 'What does `git add -p` do and why is it useful?',
          a: 'It lets you stage individual hunks interactively, so you can split unrelated edits (e.g. a test change and a debug console.log) into separate commits or leave the debug line out.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-02',
      difficulty: 'easy',
      question: 'Which folders or files should be listed in `.gitignore` for a Playwright project? Select ALL that apply.',
      options: ['playwright-report/', 'playwright/.auth/', 'package-lock.json', 'test-results/', 'playwright.config.ts'],
      correct: [0, 1, 3],
      explanation:
        'Reports and test-results are generated per run, and `.auth` holds storageState files with live session cookies. `package-lock.json` must be committed so `npm ci` installs exact versions (including Playwright), and the config file is source code.',
      followUps: [
        {
          q: 'Why does committing the lock file matter for Playwright specifically?',
          a: 'Browser builds are tied to the Playwright version. A lock file pins @playwright/test, so `npx playwright install` and the Docker image tag match what tests run with on every machine.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-03',
      difficulty: 'medium',
      question: 'The CI job fails at the first test with `browserType.launch: Executable doesn\'t exist`. Which step is missing?',
      code: {
        language: 'yaml',
        code: `steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-node@v6
    with: { node-version: lts/* }
  - run: npm ci
  - run: npx playwright test`,
      },
      options: [
        'npx playwright install --with-deps',
        'npm install -g playwright',
        'npx playwright codegen',
        'npx playwright show-report',
      ],
      correct: [0],
      explanation:
        'A fresh runner has no browser binaries; `npx playwright install --with-deps` downloads the builds for the project\'s Playwright version plus required OS libraries. A global install does not fetch matching browsers for the project, codegen is the recorder, and show-report only serves an existing report.',
      followUps: [
        {
          q: 'What does --with-deps add?',
          a: 'It also installs the operating-system packages the browsers depend on (fonts, graphics and media libraries) using the system package manager, which a minimal Linux runner may not have.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-04',
      difficulty: 'medium',
      question: 'Tests fail in CI, but no report artifact is available to download. What is the most likely cause?',
      code: {
        language: 'yaml',
        code: `  - run: npx playwright test
  - uses: actions/upload-artifact@v4
    with:
      name: playwright-report
      path: playwright-report/`,
      },
      options: [
        'Steps default to `if: success()`, so the upload is skipped after the test step fails',
        'upload-artifact cannot upload folders',
        'The HTML reporter is disabled on CI by default',
        'Artifacts are only kept for successful runs',
      ],
      correct: [0],
      explanation:
        'Without an `if:`, a step runs only when previous steps succeeded, so a failing test step skips the upload. Add `if: ${{ !cancelled() }}` (or `always()`). Folders upload fine, the HTML reporter is not disabled by CI, and artifacts from failed runs are kept.',
      followUps: [
        {
          q: 'Why do the docs use !cancelled() rather than always()?',
          a: '`!cancelled()` uploads after both success and failure but skips work when someone deliberately cancels the run, whereas `always()` would run even then.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-05',
      difficulty: 'medium',
      question: 'What does `forbidOnly: !!process.env.CI` protect against?',
      options: [
        'A committed `test.only` making CI silently run just one test and pass',
        'Running tests in parallel on CI',
        'Tests being retried on CI',
        'Developers running a single test locally',
      ],
      correct: [0],
      explanation:
        'With `forbidOnly` true on CI, any `test.only` or `describe.only` fails the run, so a debugging leftover cannot hide the rest of the suite. It has nothing to do with parallelism or retries, and locally (CI unset) `.only` still works for focused debugging.',
      followUps: [
        {
          q: 'What else would you add to catch it before CI?',
          a: 'A lint rule (e.g. eslint-plugin-playwright\'s no-focused-test) and code review checklists, so it is caught in the editor or PR before it ever reaches CI.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-06',
      difficulty: 'medium',
      question: 'Which statements about workers and sharding are correct? Select ALL that apply.',
      options: [
        'Workers are parallel processes on one machine; sharding splits the suite across machines',
        'By default Playwright uses about half of the logical CPU cores as workers',
        'Each shard automatically produces one combined HTML report for the whole suite',
        'Each worker has its own browser instance',
      ],
      correct: [0, 1, 3],
      explanation:
        'Workers run on one machine (default 50% of cores), each with its own browser, and shards spread work across machines. A shard only knows its own tests; a combined report requires the blob reporter and `merge-reports`.',
      followUps: [
        {
          q: 'Can you use both at once?',
          a: 'Yes, and it is normal: each shard machine runs its share with several workers. Wall time ≈ test work ÷ (shards × workers) plus per-shard setup.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-07',
      difficulty: 'hard',
      question: 'A suite has one spec file with 80 tests and five small files. With 4 shards, one shard takes far longer than the others. What is the best fix?',
      options: [
        'Enable `fullyParallel: true` so shards are split per test instead of per file',
        'Increase `retries` to 3',
        'Add `--max-failures=1`',
        'Use `workers: 1` on every shard',
      ],
      correct: [0],
      explanation:
        'Without fullyParallel, sharding works at file granularity, so the 80-test file lands entirely in one shard and runs in one worker. Per-test splitting balances the shards (tests must be independent). Retries, max-failures and fewer workers do not change the distribution and would only slow things down or stop early.',
      followUps: [
        {
          q: 'What must be true of the tests before you enable it?',
          a: 'They must be independent: no shared module state, no reliance on test order, and their own data, because tests from the same file may run at the same time on different workers or shards.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-08',
      difficulty: 'hard',
      question: 'In this sharded matrix, shards 2 and 3 fail at the upload step. Why?',
      code: {
        language: 'yaml',
        code: `strategy:
  matrix:
    shardIndex: [1, 2, 3]
steps:
  # ...
  - run: npx playwright test --shard=\${{ matrix.shardIndex }}/3
  - uses: actions/upload-artifact@v4
    if: \${{ !cancelled() }}
    with:
      name: blob-report
      path: blob-report`,
      },
      options: [
        'Artifact names must be unique within a run in upload-artifact v4; include the shard index in the name',
        'Blob reports cannot be uploaded as artifacts',
        'Matrix jobs cannot upload artifacts',
        'The path must be playwright-report',
      ],
      correct: [0],
      explanation:
        'With v4 artifacts are immutable and names must be unique per run, so the second and third uploads named `blob-report` conflict. Name them `blob-report-${{ matrix.shardIndex }}`. Blob reports are meant to be uploaded, matrix jobs can upload, and the blob reporter writes to `blob-report` by default.',
      followUps: [
        {
          q: 'How does the merge job collect them?',
          a: 'actions/download-artifact with `pattern: blob-report-*` and `merge-multiple: true` puts all shards\' files into one folder, then `npx playwright merge-reports --reporter html ./all-blob-reports` creates the combined report.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-09',
      difficulty: 'easy',
      question: 'Which `on:` block makes a GitHub Actions workflow run for pull requests and also every night at 01:30 UTC?',
      code: {
        language: 'yaml',
        code: `# A
on:
  pull_request:
  schedule:
    - cron: '30 1 * * *'
# B
on:
  pull_request:
  schedule:
    - cron: '1 30 * * *'
# C
on:
  pull_request:
  nightly: true
# D
on: [pull_request, cron]`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [0],
      explanation:
        'Cron fields are minute, hour, day-of-month, month, day-of-week, so `30 1 * * *` is 01:30 UTC daily; GitHub schedules run in UTC. B swaps minute and hour (hour 30 is invalid). `nightly` is not a workflow event, and `cron` is not an event name; schedules go under `schedule:`.',
      followUps: [
        {
          q: 'How would the nightly run differ from the PR run in the same workflow?',
          a: 'Use `if: github.event_name == \'schedule\'` on a step that runs the full suite on all projects, and `if: github.event_name == \'pull_request\'` on a step that runs only `--grep @smoke` on chromium.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-10',
      difficulty: 'medium',
      question: 'Your team uses `mcr.microsoft.com/playwright:v1.64.0-noble` in CI. Which situations will cause problems? Select ALL that apply.',
      options: [
        'package.json is upgraded to @playwright/test 1.65 but the image tag stays 1.64',
        'The container runs Chromium without `--ipc=host`',
        'The job runs `npm ci` before the tests',
        'Screenshot baselines were generated on a developer\'s Mac',
      ],
      correct: [0, 1, 3],
      explanation:
        'A version mismatch means Playwright looks for browser builds the image lacks; without `--ipc=host` Chromium can run out of shared memory and crash; and Mac-generated baselines differ from Linux rendering, so visual comparisons fail. Running `npm ci` is correct and still required to install project dependencies.',
      followUps: [
        {
          q: 'How do you generate baselines that match CI?',
          a: 'Run `npx playwright test --update-snapshots` inside the same Docker image (locally via docker run, or in a dedicated CI job), then commit the generated Linux baselines.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-11',
      difficulty: 'medium',
      question: 'What is the difference between `git fetch` and `git pull`?',
      options: [
        'fetch downloads remote commits without changing your branch; pull fetches and then merges (or rebases) into your branch',
        'fetch uploads your commits; pull downloads them',
        'They are aliases for the same command',
        'pull only works on the main branch',
      ],
      correct: [0],
      explanation:
        '`fetch` updates remote-tracking refs like origin/main and leaves your work untouched; `pull` integrates those changes into the current branch. Uploading is `push`, the commands are not aliases, and pull works on any branch with an upstream.',
      followUps: [
        {
          q: 'When would you prefer fetch?',
          a: 'When you want to review incoming changes first (`git log HEAD..origin/main`) or choose between merging and rebasing yourself, without risking an unexpected merge in the middle of your work.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-12',
      difficulty: 'hard',
      question: 'Which items does this generated-style config enable only on CI? Select ALL that apply.',
      code: {
        language: 'typescript',
        code: `export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: { trace: 'on-first-retry' },
});`,
      },
      options: [
        'Failing the run when test.only is present',
        'Two retries for failing tests',
        'Per-test parallelism within files',
        'Recording traces on the first retry',
      ],
      correct: [0, 1],
      explanation:
        'Only `forbidOnly` and `retries` depend on `process.env.CI` here (workers too, but that limits rather than enables). `fullyParallel` and `trace` are unconditional, although traces in practice only appear on CI because retries are 0 locally, so no first retry ever happens.',
      followUps: [
        {
          q: 'Locally a test fails. Will a trace be recorded?',
          a: 'No. Locally retries are 0, so there is no first retry and `on-first-retry` never triggers. Use `--trace on` for that run, or `retain-on-failure` locally if you want traces of local failures.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-13',
      difficulty: 'expert',
      question: 'Which steps belong in the final merge job of a sharded Playwright workflow? Select ALL that apply.',
      options: [
        'Download all `blob-report-*` artifacts into one folder',
        'Run `npx playwright merge-reports --reporter html ./all-blob-reports`',
        'Run `npx playwright test --shard=1/1` to re-execute failed tests',
        'Upload the resulting `playwright-report` as an artifact',
        'Run `npx playwright install --with-deps` for every browser',
      ],
      correct: [0, 1, 3],
      explanation:
        'The merge job only combines results: download the blobs, merge them into an HTML report, upload it. It does not re-run tests, so it needs `npm ci` for the Playwright CLI but no browser installation.',
      followUps: [
        {
          q: 'Why does the merge job use `if: ${{ !cancelled() }}`?',
          a: 'Because the report is most needed when some shards failed. Without it, `needs:` would skip the merge job whenever any shard job failed, leaving you with only raw blob artifacts.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-14',
      difficulty: 'expert',
      question: 'A pushed commit on shared `main` broke CI. Which is the safest way to undo it?',
      options: [
        'git revert <hash> and push the new commit',
        'git reset --hard HEAD~1 and git push --force',
        'Delete the main branch and recreate it',
        'git commit --amend and push',
      ],
      correct: [0],
      explanation:
        '`git revert` adds a new commit that reverses the change, keeping history consistent for everyone who already pulled. Resetting and force-pushing, amending, or recreating the branch all rewrite shared history and break other people\'s clones and open PRs.',
      followUps: [
        {
          q: 'When is force-pushing acceptable?',
          a: 'On your own feature branch after a rebase or amend, using `--force-with-lease` so you do not overwrite commits someone else pushed in the meantime. Protected branches like main should block force pushes entirely.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-15',
      difficulty: 'hard',
      question: 'A PR job should run fast. Which choices reduce PR feedback time without losing the full regression? Select ALL that apply.',
      options: [
        'Run `@smoke` tests on chromium in the PR job and the full suite on a nightly schedule',
        'Run test files changed in the PR with `--only-changed=origin/main`',
        'Set `trace: \'on\'` so failures are easier to debug',
        'Delete slow tests that rarely fail',
      ],
      correct: [0, 1],
      explanation:
        'Smoke on PRs plus a full nightly run, and running changed tests, shorten feedback while full coverage still runs regularly. Tracing every test makes runs slower, not faster, and deleting slow tests loses regression coverage.',
      followUps: [
        {
          q: 'What does --only-changed need in GitHub Actions?',
          a: 'Enough Git history to compare against the base ref, e.g. `actions/checkout` with `fetch-depth: 0`, because the default shallow clone has only the latest commit.',
        },
      ],
    },
  ],
};

export default topic;
