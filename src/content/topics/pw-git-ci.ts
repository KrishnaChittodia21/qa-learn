import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-git-ci',
  phase: 'pw-framework',
  order: 6,
  title: 'Git, GitHub & CI for Playwright',
  subtitle:
    'From Git basics and pull requests to a GitHub Actions pipeline: installing browsers, saving reports, retries, splitting tests across machines with one merged report, Docker and Jenkins.',
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
    'Git flow: `git switch -c feat/x` → edit → `git add -p` → `git commit -m` → `git push -u origin feat/x` → open a PR → review → merge → `git pull` on main.',
    '`git pull` = `git fetch` + merge (or rebase with `--rebase`). `git fetch` alone never changes your files.',
    '.gitignore for Playwright: `node_modules/`, `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`, `playwright/.auth/`, `.env`.',
    'The generated config changes on CI: `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `workers: process.env.CI ? 1 : undefined`, `trace: \'on-first-retry\'`.',
    'Smallest GitHub Actions job: checkout → setup-node → `npm ci` → `npx playwright install --with-deps` → `npx playwright test` → upload `playwright-report/` with `if: ${{ !cancelled() }}`.',
    'Workers = test processes running at the same time on ONE machine (default: 50% of CPU cores). Shards = splitting the suite across MACHINES with `--shard=i/n`.',
    '`fullyParallel: true` lets tests inside one file run at the same time. It also makes shards split per test (better balance), not per file.',
    'Shards: `blob` reporter on CI → upload each `blob-report/` as `blob-report-<i>` → a final job downloads all → `npx playwright merge-reports --reporter html ./all-blob-reports`.',
    'Docker: `mcr.microsoft.com/playwright:v<same version as package.json>-noble`. Run with `--init --ipc=host`. Browsers are already installed.',
    'Pick tests: tags `{ tag: \'@smoke\' }` + `--grep @smoke`; `--grep-invert @slow`; `--only-changed=origin/main`; `--project=chromium`.',
    'Secrets: store them as GitHub repository or environment secrets. Pass them as `env:` in the workflow. Read them with `process.env`. Never commit `.env` or `.auth` files.',
  ],
  sections: [
    {
      heading: 'Git in ten minutes: the mental model',
      body: `**Example:** \`git add login.spec.ts\` → \`git commit -m "test: add login test"\` → \`git push\` → your new test is saved and sent to GitHub. The team can now see it.

Git is like a save-game system for a folder. You pick which changes go into the next save point. That step is called **staging**. Then you create the save point. That is a **commit**. Then you copy save points to and from a shared server. That is **push** and **pull**.

Your work can be in four places:

| Place | What it holds | Gets there with |
|---|---|---|
| **Working directory** | files as you edit them | your editor |
| **Staging area (index)** | changes picked for the next commit | \`git add\` |
| **Local repository** | commits on your machine | \`git commit\` |
| **Remote (GitHub)** | the shared copy | \`git push\` (and back with \`git fetch\` / \`git pull\`) |

A **commit** is a snapshot. It has an id (called a hash), an author, a message and a link to the commit before it.

A **branch** is a movable label that points at a commit. \`main\` is the shared branch. You do your work on short-lived feature branches.

\`HEAD\` means "where you are now".

Your Playwright framework is code. It lives in a repository. Teammates review it through pull requests. Every push starts the CI pipeline. Interviews ask about basic commands, merge conflicts and how your tests run on a pull request.

**Why testers care:** without Git, you cannot share tests, get them reviewed or run them in CI.`,
      diagram: `  working dir --git add--> staging --git commit--> local repo --git push--> remote
       ^                                              |   ^                   |
       '-------- git restore / git switch ------------'   '--- git fetch -----'
                                                       (git pull = fetch + merge)

  main:     A---B---C-----------G   (G = merge commit)
                     \\         /
  feat/x:             D---E---F     (your branch: new tests)`,
      keyPoints: [
        'Working directory → staging → local repo → remote.',
        'A branch is a label pointing at a commit. Work on short-lived branches.',
        'Every push or PR starts your CI tests.',
      ],
      source: 'Pro Git — Ch 1.3 What is Git, Ch 3.1 Branches in a Nutshell; Atlassian Git tutorials',
    },
    {
      heading: 'Everyday Git commands for a test engineer',
      body: `**Example:** \`git status\` → Git lists the files you changed and which ones are staged. Run it before every commit.

About fifteen commands cover 95% of daily work. Learn them by the job they do.

| Task | Command |
|---|---|
| Get the repo | \`git clone <url>\` |
| What changed? | \`git status\`, \`git diff\` (not staged), \`git diff --staged\` |
| New branch | \`git switch -c feat/checkout-tests\` (older: \`git checkout -b\`) |
| Stage | \`git add tests/checkout.spec.ts\` or \`git add -p\` (pick parts of a file) |
| Commit | \`git commit -m "test: add checkout total tests"\` |
| History | \`git log --oneline --graph -10\` |
| Send the branch to GitHub | \`git push -u origin feat/checkout-tests\` |
| Get updates | \`git fetch\`, then \`git pull\` (fetch + merge) or \`git pull --rebase\` |
| Undo edits not yet staged | \`git restore <file>\` |
| Unstage | \`git restore --staged <file>\` |
| Put work aside | \`git stash\` / \`git stash pop\` |
| Undo a pushed commit safely | \`git revert <hash>\` (a new commit that reverses it) |

**Good commits:** keep them small. Write a clear message, like "test: cover coupon expiry boundary". One topic per commit. Never commit generated folders (reports, results) or secrets.

**Watch out:** \`git reset --hard\` and \`git push --force\` on a shared branch. Both rewrite or throw away history. On shared branches, use \`git revert\`. If you must force-push your own branch, use \`--force-with-lease\`. It refuses to overwrite work you have not seen.

**Why testers care:** these commands are enough to add, update and fix tests safely every day.`,
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
        'Run status and diff before every commit.',
        'pull = fetch + merge. fetch alone is always safe.',
        'Use revert on shared history. Use --force-with-lease only on your own branch.',
      ],
      source: 'Pro Git — Ch 2 Git Basics; Atlassian — Saving changes, Syncing, Undoing changes',
    },
    {
      heading: 'Branches, merges and resolving conflicts',
      body: `**Example:** you and a teammate both change the \`retries\` line in \`playwright.config.ts\`. Git cannot choose, so it stops and asks you. This is a **merge conflict**.

Think of two people editing the same sentence in a shared document. Git joins changes to *different* lines by itself. For the *same* lines, a human must choose.

**Merge vs rebase:**
| | \`git merge origin/main\` | \`git rebase origin/main\` |
|---|---|---|
| History | keeps both lines of work + a merge commit | moves your commits on top of main, in a straight line |
| Safe on shared branches? | yes | only on your own branch (it changes commit ids) |
| Fixing conflicts | once | maybe once per moved commit |

**Fixing a conflict:**
1. Git stops. \`git status\` shows the file as "both modified".
2. The file has markers: \`<<<<<<< HEAD\` (your side), \`=======\`, \`>>>>>>> origin/main\` (their side).
3. Edit the file to the correct final text. Keep **both** changes when they fit together. Delete the markers.
4. **Run the affected tests.** A config conflict can quietly break the whole suite.
5. Run \`git add <file>\`. Then run \`git commit\` (for a merge) or \`git rebase --continue\` (for a rebase).
6. To give up and go back, use \`git merge --abort\` or \`git rebase --abort\`.

**A typical conflict in a test repo:** two people changed \`playwright.config.ts\`. One added a \`firefox\` project. The other changed \`retries\`. The right answer keeps both changes.

**Why testers care:** config files change often. A badly fixed conflict can turn off retries or whole browsers without anyone noticing.`,
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
        'Merge keeps history as it happened. Rebase moves your commits into a straight line.',
        'Fix by meaning, remove the markers, run the tests, then add and continue.',
        'Talk to the other author when the two changes really disagree.',
      ],
      source: 'Pro Git — Ch 3.2 Basic Branching and Merging, Ch 3.6 Rebasing; Atlassian — Merging vs Rebasing',
    },
    {
      heading: '.gitignore for a Playwright project',
      body: `**Example:** a \`.gitignore\` line \`playwright-report/\` → Git never adds the HTML report folder to a commit.

Commit the recipe, not the cake. Source code and config go into Git. Anything made by running the tests stays out. Anything secret stays out too.

\`npm init playwright@latest\` already adds most of these. Make sure your repo ignores:

| Path | Why it must not be committed |
|---|---|
| \`node_modules/\` | huge; \`npm ci\` rebuilds it from \`package-lock.json\` |
| \`test-results/\` | screenshots, videos and traces (step-by-step test recordings) from each run |
| \`playwright-report/\` | the generated HTML report (upload it from CI instead) |
| \`blob-report/\` | raw results from each shard (one machine's part of a split run) |
| \`playwright/.cache/\` | build cache for component testing |
| \`playwright/.auth/\` | saved \`storageState\` files: **live login cookies** |
| \`.env\`, \`.env.*\` | passwords and URLs (commit a \`.env.example\` with fake values) |

**storageState** is a saved file of cookies and local storage, so tests start already logged in. That makes it as secret as a password.

**Do commit:**
- \`package.json\` **and** \`package-lock.json\`. Then \`npm ci\` installs the exact same versions, including Playwright.
- \`playwright.config.ts\`, tests, page objects and fixtures.
- Test data without secrets.
- The workflow YAML file.

**Watch out:** you already committed a secret? Adding it to \`.gitignore\` later does not remove it from history. Change (rotate) the secret right away. Then remove the file with \`git rm --cached .env\`. Clean the history if needed.

**Why testers care:** the repo stays small, and passwords and login cookies never leak.`,
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
        'Ignore generated output and secrets. Commit the lock file.',
        'storageState files are login details. Keep them out of Git.',
        'A leaked secret must be changed, not just ignored.',
      ],
      source: 'Atlassian — .gitignore tutorial; Playwright docs — Authentication (ignore playwright/.auth)',
    },
    {
      heading: 'Pull requests and code review for test code',
      body: `**Example:** you push \`test/cart-badge\` and open a pull request → GitHub runs your Playwright tests → a teammate reviews → the branch is merged into \`main\`.

A **pull request** (PR) is a proposal. It says: "Here are my commits. Please check them and merge them into main." CI runs your tests there. Teammates catch problems before they reach everyone.

**A typical PR flow on GitHub:**
1. Push your branch. Open a PR against \`main\`. Give it a clear title and description: what it covers, how to run it, the linked ticket.
2. The workflow for \`pull_request\` runs the Playwright suite. Results show as checks on the PR.
3. Reviewers comment. You push fixes to the same branch, and the PR updates by itself.
4. When checks are green and reviewers approve, the PR is merged. Teams pick merge commit, squash or rebase.
5. **Branch protection** on \`main\` can require passing checks and at least one approval.

**What a good reviewer checks in test code:**
| Area | Look for |
|---|---|
| Reliability | no \`waitForTimeout\`, web-first assertions, no \`.only\` |
| Locators | role, label or test id — not long CSS or XPath |
| Independence | own test data, no order dependence, clean-up |
| Readability | clear titles, \`test.step\`, reused page objects |
| Coverage | negative and edge cases, not just the happy path |
| Secrets | no passwords, tokens or real personal data |
| Speed | API setup instead of long UI setup |

A **web-first assertion** is an \`expect\` on a locator that keeps retrying until it passes or times out.

**In an interview, say:** "Test code gets the same review as product code. My PRs show the new tests pass reliably, for example with a \`--repeat-each\` run."

**Why testers care:** review and CI checks stop flaky or broken tests before they reach \`main\`.`,
      keyPoints: [
        'A PR = review + CI check before merging into main.',
        'Branch protection requires green checks and approvals.',
        'Review test code for flaky waits, locators, independence and secrets.',
      ],
      source: 'GitHub Docs — About pull requests, protected branches; GitHub Skills — Review pull requests',
    },
    {
      heading: 'Making the config CI-aware with process.env.CI',
      body: `**Example:** \`retries: process.env.CI ? 2 : 0\` → on CI, a failed test gets 2 more tries. On your laptop, it gets none.

Your laptop and the CI machine need different things. Locally you want speed and a report that opens by itself. In CI you want stability, retries, evidence and output that tools can read. So you keep one config file, with two behaviours. An environment variable switches between them.

GitHub Actions, GitLab CI, Azure Pipelines and most CI systems set \`CI=true\` by themselves. So \`process.env.CI\` is true there.

| Setting | Local | CI | Why |
|---|---|---|---|
| \`forbidOnly\` | false | **true** | a forgotten \`test.only\` must fail CI, not quietly skip the rest |
| \`retries\` | 0 | 2 | get past rare machine hiccups; mark flaky tests |
| \`workers\` | default (50% of CPU cores) | 1 (the docs' advice for stability) or a tuned number | shared CI machines have few cores |
| \`reporter\` | \`list\` + html | \`dot\` / \`github\` + html (\`open: 'never'\`) + junit / blob | for people vs for tools |
| \`trace\` | as needed | \`on-first-retry\` | evidence only for failures |
| \`webServer.reuseExistingServer\` | true | false | CI must start a fresh app |

A **flaky test** sometimes passes and sometimes fails without any code change. With retries, Playwright marks a test "flaky" when it fails first and then passes.

A **trace** is a recording of the test: each step, screenshots, network calls and console logs. You open it in the trace viewer.

URLs and passwords also come from environment variables. For example: \`process.env.BASE_URL ?? 'http://localhost:3000'\`. The workflow sets them from secrets.

**Why testers care:** the same tests run well in both places. A forgotten \`test.only\` can never fool CI.`,
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
        'CI systems set CI=true. Switch config settings on it.',
        'forbidOnly + retries + trace on-first-retry are the CI basics.',
        'URLs and secrets come from environment variables.',
      ],
      source: 'Playwright docs — Setting up CI; Continuous Integration (workers); Test configuration',
    },
    {
      heading: 'GitHub Actions: the Playwright workflow line by line',
      body: `**Example:** you push to \`main\` → GitHub starts a fresh Linux machine → it installs Node, your packages and the browsers → it runs \`npx playwright test\`.

A **workflow** is a recipe GitHub runs on a fresh virtual machine. It runs every time something happens: a push, a pull request or a schedule. The machine starts empty. So the recipe must install *everything*, browsers included.

\`npm init playwright@latest\` can create \`.github/workflows/playwright.yml\` for you. The key parts:

- **\`on:\`** — what starts it: \`push\` and \`pull_request\` to \`main\` / \`master\`. Add \`workflow_dispatch\` (a manual button) and \`schedule\` (a nightly timer) if needed.
- **\`runs-on: ubuntu-latest\`** — a Linux machine hosted by GitHub. It is called a **runner**.
- **\`actions/checkout\`** — gets your code. **\`actions/setup-node\`** with \`node-version: lts/*\` installs Node.
- **\`npm ci\`** — a clean install from \`package-lock.json\`. It uses exact versions. It fails if the lock file does not match.
- **\`npx playwright install --with-deps\`** — downloads the browsers for *your* Playwright version, **and** the Linux libraries they need. Without it, tests fail with "Executable doesn't exist".
- **\`npx playwright test\`** — runs the suite. If any test fails, the job fails.
- **\`actions/upload-artifact\`** with \`if: \${{ !cancelled() }}\` — uploads \`playwright-report/\` **even when tests failed**. The default condition is \`success()\`. It would skip the upload exactly when you need it. \`retention-days: 30\` keeps it for 30 days.

**Secrets:** add them under *Settings → Secrets and variables → Actions*. Then pass them in the workflow: \`env: { BOOKER_PASS: \${{ secrets.BOOKER_PASS }} }\`. GitHub hides them in logs. Pull requests from forks do not get secrets.

**Timeouts:** set \`timeout-minutes\` on the job. Set \`globalTimeout\` in the Playwright config. Then a stuck run is stopped. The config timeout still lets the reporters write the report.

**Why testers care:** every push is tested the same way, on a clean machine, with a report you can download.`,
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
        'A fresh machine every time: npm ci and playwright install --with-deps are required.',
        'Upload the report with if: !cancelled(), so failed runs keep their evidence.',
        'Secrets go from repository secrets → env → process.env.',
      ],
      source: 'Playwright docs — Setting up CI (generated workflow); GitHub Docs — Workflow syntax, Using secrets, Storing workflow data as artifacts',
    },
    {
      heading: 'Artifacts: reports, traces and retention',
      body: `**Example:** \`actions/upload-artifact\` with \`path: playwright-report/\` → after the job, a zip of the HTML report appears on the run's page. You download it to debug.

An **artifact** is a file a CI job saves before the machine is deleted. The CI machine is thrown away when the job ends. Anything you did not upload is gone, including the report you need.

**What to upload:**
| Artifact | Path | When |
|---|---|---|
| HTML report | \`playwright-report/\` | always (\`!cancelled()\`) |
| Raw results (traces, videos, screenshots) | \`test-results/\` | on failure, if the report does not already have them |
| JUnit XML | e.g. \`results/junit.xml\` | for CI test tabs and other tools |
| Blob reports (raw results made to be merged) | \`blob-report/\` | one per shard, kept 1 day, merged later |

The HTML report includes the screenshots, videos and trace files from \`test-results\`. So you download the report artifact and unzip it. Then run \`npx playwright show-report <folder>\`. You get everything, traces included.

**Storage and size:** artifacts use storage space, which has limits. Keep blob reports for a day. Keep merged reports for 14–30 days. Use \`trace: 'on-first-retry'\` and \`video: 'retain-on-failure'\`. Then passing tests save almost nothing.

**Names must be unique** in one run with \`upload-artifact@v4\`. With a matrix, put the matrix value in the name, like \`blob-report-\${{ matrix.shardIndex }}\`. Otherwise the second upload fails.

**Watch out:** traces hold network data and cookies. Treat artifacts as private. On public repos, anyone can download them.

**Why testers care:** when a CI test fails, the report and trace show exactly what happened.`,
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
        'No artifact = no evidence once the CI machine is gone.',
        'Give each matrix job a unique artifact name.',
        'Keep raw data for a short time. Artifacts may contain secrets.',
      ],
      source: 'GitHub Docs — Storing workflow data as artifacts; Playwright docs — Setting up CI, Reporters (HTML)',
    },
    {
      heading: 'Parallelism, workers and sharding',
      body: `**Example:** \`npx playwright test --shard=2/4\` → this machine runs only the second quarter of the tests. Three other machines run the rest at the same time.

Think of a shop. **Workers** are more cashiers in **one** shop. **Shards** are **more shops**. Each shop (machine) serves its share of customers (tests). Each shop can have several cashiers (workers).

**Workers (one machine):** a worker is a separate process with its own browser. Playwright runs tests in several workers at the same time. The default is **50% of the CPU cores**. Set \`workers\` in the config, or use \`--workers\` / \`-j\`. Too many workers on a small machine overload the CPU. Then tests time out at random.

**What runs at the same time:** by default, **files** run at the same time. Tests inside one file run in order, in the same worker. \`fullyParallel: true\` (or \`test.describe.configure({ mode: 'parallel' })\`) lets single tests spread across workers.

**Sharding (many machines):** sharding splits the suite across machines. In CI, a **matrix** starts N jobs. Each job gets its own shard number. With \`fullyParallel: true\`, shards split **per test**, so they are well balanced. Without it, they split **per file**. Then one huge file can make one shard much slower.

**Merging results:** each shard only knows its own tests. So:
1. Set \`reporter: process.env.CI ? 'blob' : 'html'\`. A **blob report** is a raw results file made to be merged later.
2. Upload each \`blob-report/\` as an artifact.
3. A final job downloads them all.
4. It runs \`npx playwright merge-reports --reporter html ./all-blob-reports\`. That makes one HTML report.

| Setting | Works on | Speeds up by | Watch out for |
|---|---|---|---|
| \`workers\` | one machine | CPU cores | overloaded CPU, shared data |
| \`fullyParallel\` | single tests | better balance | tests must be independent |
| \`--shard\` | many machines | number of jobs | setup time per job, merging reports |

**Total time ≈ (tests × average test time) ÷ (shards × workers) + setup per job (install, browsers) + retries + merge job.**

**Why testers care:** a 40-minute suite can finish in about 10 minutes, with one report for the whole run.`,
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
        'Workers run tests at the same time on one machine. Shards spread them across machines.',
        'fullyParallel runs single tests at the same time and balances shards.',
        'Shards need blob reports + merge-reports to make one combined report.',
      ],
      source: 'Playwright docs — Parallelism; Sharding; Continuous Integration',
    },
    {
      heading: 'Running in Docker and on Jenkins',
      body: `**Example:** \`docker run --rm --init --ipc=host mcr.microsoft.com/playwright:v1.64.0-noble\` → you get Linux, Node and all browsers at fixed versions. Every machine gets the same setup.

A Docker image is like a packed lunchbox. It holds the OS, Node, browsers and their system libraries, all at known versions. Every machine that opens it gets the same environment. That removes most "works on my machine" failures.

**The official image:** \`mcr.microsoft.com/playwright:v1.64.0-noble\`. "noble" is Ubuntu 24.04, and \`-jammy\` is 22.04. Rules:
- **Use the same version tag as \`@playwright/test\` in \`package.json\`.** If they differ, Playwright looks for browsers the image does not have.
- Run with \`--init\`. It stops leftover "zombie" processes.
- Run with \`--ipc=host\`. Without it, Chromium can run out of shared memory and crash.
- Browsers are already installed. Skip \`npx playwright install\`, but still run \`npm ci\`.
- The image runs as root by default. That is fine for testing your own app. For visiting untrusted sites, use a non-root user and a seccomp profile.

**GitHub Actions container job:** add \`container: { image: mcr.microsoft.com/playwright:v1.64.0-noble, options: --user 1001 }\` to the job. Then the steps are checkout, setup-node, \`npm ci\` and \`npx playwright test\`.

**Jenkins:** use a declarative pipeline with a Docker agent and the same image. Publish the \`junit\` XML with the JUnit plugin. Archive \`playwright-report\`, or use the HTML Publisher plugin.

**Watch out:** Jenkins does not always set \`CI\` by itself. Set \`CI=true\` in \`environment\` if your config depends on it.

**Why testers care:** tests behave the same on your laptop, GitHub and Jenkins. Fewer surprises.`,
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
        'The image tag must match the Playwright version in package.json.',
        'Use --ipc=host and --init so Chromium runs stably.',
        'Jenkins: Docker agent + JUnit results + saved HTML report.',
      ],
      source: 'Playwright docs — Docker; Continuous Integration (GitHub Actions container, Jenkins)',
    },
    {
      heading: 'Tags, selective runs and pipeline strategy',
      body: `**Example:** \`npx playwright test --grep @smoke\` → only tests tagged \`@smoke\` run. It takes minutes, not the full hour.

You do not get a full medical check-up every time someone sneezes. Run fast checks on every PR. Run the full suite on a schedule or before a release.

**Tagging tests:** write \`test('checkout total', { tag: ['@smoke', '@checkout'] }, async ({ page }) => {...})\`. Or put the tag in the title: \`'checkout total @smoke'\`. Run groups with \`--grep\` and \`--grep-invert\`. They take regular expressions:
- \`npx playwright test --grep @smoke\`
- \`npx playwright test --grep "@smoke|@critical"\`
- \`npx playwright test --grep-invert @slow\`

**Other ways to pick tests:**
- \`--project=chromium\`.
- A folder or file path.
- \`--only-changed=origin/main\` — only test files changed since that Git ref, plus files that import changed files.
- \`--last-failed\`.

**A typical pipeline:**
| When | What runs | Target time |
|---|---|---|
| Every PR | lint + \`@smoke\` on chromium + changed tests | < 10 min |
| Merge to main | full suite, chromium, sharded | < 20 min |
| Nightly (\`schedule: cron\`) | full suite, all browsers, \`@quarantine\` included | can be longer |
| Before release / after deploy | smoke tests against the deployed site | minutes |

**When many tests fail:** \`--max-failures=10\` stops a hopeless run early, for example when the environment is down. This saves CI minutes. Alert the team (Slack or email) when main or nightly runs fail, not on every PR.

**Why testers care:** developers get fast feedback on PRs. The full suite still runs often enough to catch everything.`,
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
        'Tag with { tag: \'@smoke\' } and pick tests with --grep / --grep-invert.',
        'Fast feedback on PRs. Full coverage on main and nightly.',
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
        'A teammate added this workflow. Every run fails with "browserType.launch: Executable doesn\'t exist". When tests do fail, nobody can see a report. A forgotten `test.only` once made CI run a single test for a week. Flaky failures block every PR.',
      task: 'Rewrite the workflow and the matching lines of `playwright.config.ts`. CI must install what it needs and keep evidence on failure. It must get past rare flaky failures but still report them. A `test.only` must not fool it.',
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
        'A brand-new CI machine has Node and your code, but no browsers. Which command installs them plus their Linux libraries?',
        'What is the default `if:` condition for a step? What happens to the upload step when tests fail?',
        'Which config options handle `test.only`, retries and traces only on CI? Where should the password live?',
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
- **Browsers installed.** \`npx playwright install --with-deps\` downloads the browsers for the project's Playwright version and their system libraries. Without it, you get "Executable doesn't exist".
- **Node version.** Current Playwright does not support Node 14. \`lts/*\` picks the current long-term-support version.
- **\`npm ci\`, not \`npm install\`.** It installs the exact versions from the lock file. It fails fast if \`package.json\` and the lock file disagree.
- **Report upload with \`if: \${{ !cancelled() }}\`.** The default condition is \`success()\`. So the upload was skipped exactly on failing runs. The retention time is now set clearly.
- **Secret moved out of the YAML** into GitHub secrets. The old password was committed in plain text, so it must be changed.
- **Triggers.** PRs now run the suite too, not just pushes.
- **Config.** \`forbidOnly\` fails CI if \`test.only\` was committed. \`retries: 2\` on CI only gets past rare flaky failures and marks them. \`trace: 'on-first-retry'\` replaces tracing every test. \`workers: 8\` overloaded the small CPU, so start at 1 and tune.
- **\`timeout-minutes\`** stops a stuck job from wasting CI minutes.`,
      followUps: [
        {
          q: 'How would you speed up the browser install step?',
          a: 'Use the official Docker image as a container job, with browsers already installed. Or install only the browsers you test: `npx playwright install --with-deps chromium`. Or cache `~/.cache/ms-playwright`, keyed on the Playwright version, and still run `install-deps` for system libraries. The Playwright docs say caching browsers often saves little time, so measure first.',
        },
        {
          q: 'Why not keep `trace: \'on\'` for the most evidence?',
          a: 'Recording a trace for every test slows the whole suite and makes big artifacts. But people almost never open traces of passing tests. With `on-first-retry` you get a trace for every failure that matters, at almost no cost for passing tests.',
        },
      ],
    },
    {
      id: 'pw-git-ci-cc-2',
      title: 'Sharding that actually produces one report',
      context:
        'To cut a 40-minute run, someone split the suite into 3 shards. Now shards 2 and 3 fail at the upload step. Nobody gets a full report. One failing shard cancels the others. Shard 1 takes 3× longer than shard 3.',
      task: 'Fix the workflow and config. Shards must be balanced, all of them must finish, and one merged HTML report must be made.',
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
        'In upload-artifact v4, artifact names must be unique in one run. What changes for each matrix job?',
        'An HTML report from one shard only has that shard\'s tests. Which reporter is made to be merged later?',
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
- **Unique artifact names** (\`blob-report-<index>\`). With \`upload-artifact@v4\`, a second upload with the same name in one run fails. That is why shards 2 and 3 failed.
- **Blob reporter + merge job.** Each shard writes a \`blob-report/\` that can be merged. The \`merge-reports\` job downloads all of them (\`pattern\` + \`merge-multiple\`). It makes one HTML report for the whole run.
- **\`fail-fast: false\`.** By default, a failing matrix job cancels the others. So you lost the other shards' results.
- **\`fullyParallel: true\`.** Without it, shards split per file. A shard that gets a few huge files runs much longer. Splitting per test evens the shards out. The tests must be independent.
- **\`if: \${{ !cancelled() }}\`** instead of \`always()\`. It still uploads after failures, but it respects a manual cancel.
- **\`shardTotal\` in the matrix.** It stops a hard-coded "3" from getting out of sync with the matrix.`,
      followUps: [
        {
          q: 'Each shard repeats npm ci and the browser install. When does adding shards stop helping?',
          a: 'When the fixed cost per shard (checkout, npm ci, browser install — often 1–3 minutes) is close to the test time per shard. For example, 12 minutes of tests on 6 shards is 2 minutes each, plus about 2 minutes of setup. Going to 12 shards barely helps, but it doubles machine use. Use a Docker image, or fewer, larger shards.',
        },
        {
          q: 'How would you also get a JUnit file for the whole run?',
          a: 'Merge into several formats at once: `npx playwright merge-reports --reporter=html,junit ./all-blob-reports`. Set the JUnit output path with a merge config or the PLAYWRIGHT_JUNIT_OUTPUT_NAME environment variable. Then upload or publish the XML in the merge job.',
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
        'Right order of steps, including the browser install',
        'A report upload that still happens when tests fail',
        'Config that changes on CI (forbidOnly, retries, trace, workers)',
        'Handling secrets, and branch protection',
      ],
      modelAnswer: `**Example:** \`npx playwright install --with-deps\` → the CI machine downloads the browsers and the Linux libraries they need. Without this step, every test fails at launch.

**Workflow file:** \`.github/workflows/playwright.yml\`. It runs on \`pull_request\` and on \`push\` to main.

**Steps on \`ubuntu-latest\`:**
1. \`actions/checkout\` gets the code.
2. \`actions/setup-node\` installs an LTS Node version, with npm caching.
3. \`npm ci\` installs exact versions from the lock file.
4. \`npx playwright install --with-deps\` installs browsers and their OS libraries. (Or run inside the official Playwright Docker image instead.)
5. \`npx playwright test\` runs the tests.
6. \`actions/upload-artifact\` uploads \`playwright-report/\` with \`if: \${{ !cancelled() }}\`. So failed runs keep the report, traces and screenshots.

**Config switches on \`process.env.CI\`:**
- \`forbidOnly\`, so a committed \`test.only\` fails the build.
- \`retries: 2\` with \`trace: 'on-first-retry'\`. Rare flaky failures do not block PRs, but they always leave a trace.
- A small worker count that fits the machine.
- The \`github\` reporter (notes on the PR) plus \`html\` with \`open: 'never'\`.

**Secrets:** test logins and URLs live in GitHub secrets and variables. The workflow passes them into \`env\`. Tests read them with \`process.env\`. Nothing secret is in the repo.

**Gate:** branch protection on \`main\` requires the Playwright check to pass before merging.

**As the suite grows:** tag \`@smoke\` tests for PRs. Run the full suite on main and nightly. When runs get long, add shards with blob reports and a merge job.`,
      followUps: [
        {
          q: 'The job fails with "Executable doesn\'t exist at /home/runner/.cache/ms-playwright/...". Why?',
          a: 'The browsers were not installed on the CI machine. Or they were installed for a different Playwright version than the one in package-lock. Add `npx playwright install --with-deps` after `npm ci`, so it uses the project\'s version. Or use the Docker image whose tag matches the installed @playwright/test version.',
        },
        {
          q: 'How do you see what failed after the run?',
          a: 'Download the playwright-report artifact from the run summary. Unzip it and run `npx playwright show-report <folder>`. Each failed test has its error, screenshot, video and trace. I open the trace to see the page, network calls and timing of the failing step. The `github` reporter also marks failures on the PR.',
        },
      ],
      pitfalls: [
        'Forgetting the browser install step.',
        'Uploading the report only when tests pass.',
        'Writing passwords in the YAML file.',
      ],
    },
    {
      id: 'pw-git-ci-iq-02',
      difficulty: 'medium',
      question: 'Workers, fullyParallel and sharding all make a Playwright run faster. How are they different, and how do you choose?',
      whatInterviewerLooksFor: [
        'Workers = processes on one machine; default 50% of CPU cores',
        'fullyParallel = single tests run at the same time, not just files',
        'Sharding = split across machines, with merge-reports',
        'Trade-offs: overloaded CPU, setup time, test independence',
      ],
      modelAnswer: `**Example:** \`npx playwright test --shard=1/4 --workers=2\` → this machine runs a quarter of the suite, two tests at a time.

**Workers:** separate processes on **one machine**. Each has its own browser. Playwright uses half the CPU cores by default. Set \`workers\` in the config or use \`--workers=N\`. More workers help until the CPU is full. After that, tests slow down and fail at random.

**fullyParallel:** decides **what** is spread out. By default, files are shared across workers. But tests inside one file run one after another in one worker. With \`fullyParallel: true\`, tests from the same file can run at the same time in different workers. The tests must be independent: no shared state and no fixed order. It also changes sharding. Shards split per test instead of per file, so they are much better balanced.

**Sharding:** splits the suite across **several machines**: \`--shard=1/4\` … \`--shard=4/4\`, usually with a CI matrix. Each machine still uses its own workers. Each shard has only part of the results. So use the \`blob\` reporter, upload each shard's blob report and run \`npx playwright merge-reports\` in a final job.

**When to use what:**
- Small suite: just workers on one machine.
- Slow suite and the machine is maxed out: add shards.
- One shard finishes much later: turn on \`fullyParallel\` or split big files.
- Each shard has a fixed setup cost (checkout, npm ci, browsers: 1–3 min). So many tiny shards waste time.

**Rough math:** total time ≈ total test time ÷ (shards × workers) + setup per shard + retries + merge.`,
      followUps: [
        {
          q: 'Why do the Playwright docs suggest workers: 1 on CI?',
          a: 'For stability and repeatable results on small shared CI machines. You get fewer timeouts from an overloaded CPU, and parallel tests cannot clash. Once tests are proven independent and the machine has enough cores, raise the workers. Use sharding to scale further.',
        },
        {
          q: 'Your tests share one admin account. What breaks when you turn on fullyParallel?',
          a: 'Tests running at the same time change the same user\'s data. One empties the cart while another checks its count. Or a logout in one test ends another test\'s session. Fix it with one account per worker (testInfo.workerIndex), unique data made through the API, and storageState per worker or role.',
        },
      ],
      pitfalls: [
        'Saying shards and workers are the same thing.',
        'Thinking more workers always means faster.',
        'Forgetting that shard reports must be merged.',
      ],
    },
    {
      id: 'pw-git-ci-iq-03',
      difficulty: 'hard',
      question: 'Your Playwright pipeline takes 50 minutes. The team wants PR feedback in under 10. What would you do?',
      whatInterviewerLooksFor: [
        'Measures first (slowest tests, setup time, retries)',
        'Fixes test design before adding machines',
        'Uses sharding and workers, with numbers',
        'Splits what runs on PRs and nightly, using tags',
      ],
      modelAnswer: `**Example:** 40 minutes of test time ÷ 4 shards ≈ 10 minutes, plus about 2 minutes of setup per shard.

**1. Measure.** From the HTML or JSON report, find the total test time, the slowest files, the retry count and the fixed setup time (npm ci, browser install). Often 10% of tests take half the time. Retries of flaky tests also add a lot.

**2. Make tests cheaper (biggest wins):**
- Replace UI setup with **API setup**. Reuse login with **storageState**. UI login and data setup are often most of the run time.
- Remove every \`waitForTimeout\`.
- Fix flaky tests, so retries stop adding minutes.
- Block or mock third-party scripts with \`page.route\`.

**3. Run more at the same time:**
- \`fullyParallel: true\`, once tests are independent.
- Workers that match the machine's cores.
- **Shard** across, say, 4 machines, with blob reports and a merge job.
- Use the Playwright Docker image, or install only the needed browsers, to cut setup.

**4. Run less on PRs:**
- PR: \`@smoke\` + \`--only-changed=origin/main\`, on chromium only (often 5–8 minutes).
- Merge to main: full suite on chromium, sharded.
- Nightly: all browsers, including slow and quarantined tests.

**5. Stop early:** \`--max-failures\` stops the run when the environment is down. Otherwise 300 tests each wait for their timeout.

Then measure again. I would show before and after numbers, not a feeling.`,
      followUps: [
        {
          q: 'Why not just run only chromium on PRs forever?',
          a: 'Cross-browser bugs, like WebKit date pickers or Firefox layout, would only be found nightly, after the merge. That is usually fine if someone checks nightly failures the next morning. Risky cross-browser areas (CSS-heavy pages) can be tagged to run on all browsers in PRs. It is a risk trade-off to agree with the team.',
        },
        {
          q: 'What does --only-changed miss?',
          a: 'It picks test files changed since a Git ref, plus test files that import changed files. It looks only at the test project\'s imports. So it cannot know that a change in app code or a backend endpoint affects a test. It adds to smoke tests on PRs. It does not replace the full run on main.',
        },
      ],
      pitfalls: [
        'Jumping straight to "add more machines".',
        'Deleting slow tests without checking what they cover.',
        'Adding workers on a 2-core machine.',
      ],
    },
    {
      id: 'pw-git-ci-iq-04',
      difficulty: 'easy',
      question: 'What is the difference between git merge and git rebase? How do you fix a merge conflict?',
      whatInterviewerLooksFor: [
        'Clear history difference (merge commit vs straight line)',
        'Knows not to rebase shared branches',
        'Real steps to fix a conflict, including running tests again',
        'Knows the abort commands',
      ],
      modelAnswer: `**Merge** joins two branches by making a **merge commit** with two parents. History stays exactly as it happened. It is safe on shared branches.

**Rebase** takes my branch's commits and **replays them on top of** the target branch. History becomes a straight line. It makes new commit ids. So I only rebase **my own** feature branch, and push afterwards with \`--force-with-lease\`. I never rebase \`main\` or a branch others build on.

**Example:** \`git merge origin/main\` → Git says "CONFLICT in playwright.config.ts" → I fix the file, run the tests, then \`git add\` and \`git commit\`.

**Fixing a conflict (for example after \`git merge origin/main\`):**
1. \`git status\` shows files as "both modified".
2. In each file, find the markers: \`<<<<<<< HEAD\` (mine), \`=======\`, \`>>>>>>> origin/main\` (theirs).
3. Decide the right result by **meaning**. Often both changes are needed. For example, they added a firefox project and I changed retries, so I keep both. If it is unclear, I ask the other author.
4. Remove the markers. Then **run the affected tests**. A conflict in \`playwright.config.ts\` or a page object can break many tests.
5. \`git add <file>\` → \`git commit\` (for a merge) or \`git rebase --continue\` (for a rebase).
6. If it goes wrong, \`git merge --abort\` or \`git rebase --abort\` goes back to the state before.

**Prevent conflicts:** keep PRs small, bring in main often and avoid long-lived branches.`,
      followUps: [
        {
          q: 'What is the difference between git fetch and git pull?',
          a: '`git fetch` downloads new commits and updates remote branches like origin/main. It does not touch your files or your current branch. `git pull` does a fetch and then merges (or rebases, with --rebase) into your current branch. Fetch first when you want to look at incoming changes before you bring them in.',
        },
        {
          q: 'You pushed a commit to main that broke CI. How do you undo it?',
          a: 'Use `git revert <hash>`. It makes a new commit that reverses the change. Push that. History stays the same for everyone else. Do not reset and force-push a shared branch. That rewrites history that others may already have pulled.',
        },
      ],
      pitfalls: [
        'Saying rebase is always better.',
        'Fixing conflicts by blindly picking "mine" or "theirs".',
        'Not running the tests again after fixing.',
      ],
    },
    {
      id: 'pw-git-ci-iq-05',
      difficulty: 'medium',
      question: 'How do you manage passwords and environment URLs for your tests, both locally and in CI?',
      whatInterviewerLooksFor: [
        'Environment variables + dotenv locally, CI secrets in the pipeline',
        '.gitignore for .env and .auth',
        'Different environments through config and environment variables',
        'Knows secrets can leak through logs, traces and forks',
      ],
      modelAnswer: `**Principle:** the code reads settings from environment variables. The values come from different places in each environment. Secrets never go into Git.

**Example:** \`baseURL: process.env.BASE_URL ?? 'http://localhost:3000'\` → locally the tests use localhost. In CI, the workflow sets \`BASE_URL\` to staging.

**Locally:** a \`.env\` file, ignored by Git, loaded with \`dotenv\` at the top of \`playwright.config.ts\`. A committed \`.env.example\` lists the variable names with fake values. Then new team members know what to set.

**In CI (GitHub Actions):** repository or environment **secrets** (passwords, tokens) and **variables** (URLs). The workflow passes them in: \`env: { BASE_URL: \${{ vars.STAGING_URL }}, BOOKER_PASS: \${{ secrets.BOOKER_PASS }} }\`. GitHub hides secret values in logs. Jenkins uses its credentials store with \`credentials('id')\`.

**Several environments:** use \`BASE_URL\` as above. Or use a \`TEST_ENV\` variable that picks \`.env.staging\` or \`.env.qa\`. GitHub "environments" can limit secrets to one stage and require approval for production.

**Things that still leak secrets:**
- \`console.log\` of tokens in tests.
- Traces and HAR files, which record headers and bodies. Keep artifacts for a short time.
- \`playwright/.auth/*.json\` storageState files. Git must ignore them.
- Pull requests from forks get no secrets, on purpose. Tests that need secrets must skip there, or run only on internal branches.

If a secret is ever committed, **change it (rotate it)** first. Then clean up. Deleting the line does not remove it from history.`,
      followUps: [
        {
          q: 'Should tests run against production?',
          a: 'Only a small smoke set that is read-only or carefully designed. It needs special test accounts, marked data that gets cleaned up, and the team\'s agreement. Full regression suites with data changes belong in test environments.',
        },
        {
          q: 'How do you stop someone from committing .env by mistake?',
          a: 'Put it in .gitignore from day one. Add a pre-commit hook or a secret scanner, like GitHub secret scanning and push protection. Code review also checks for passwords. Teaching helps too: the .env.example file shows where values belong.',
        },
      ],
      pitfalls: [
        'Writing passwords in code "because it\'s only a test account".',
        'Committing storageState files.',
        'Printing tokens in logs for debugging and leaving them there.',
      ],
    },
    {
      id: 'pw-git-ci-iq-06',
      difficulty: 'hard',
      question: 'Why would you run Playwright tests inside the official Docker image? What can go wrong?',
      whatInterviewerLooksFor: [
        'Same environment everywhere',
        'Image version must match the Playwright version',
        'The --ipc=host and --init flags',
        'Root user, sandbox and image size',
      ],
      modelAnswer: `**Example:** \`container: { image: mcr.microsoft.com/playwright:v1.64.0-noble }\` in a GitHub Actions job → the tests run with Linux, Node and all browsers already installed.

**Why:** the image (\`mcr.microsoft.com/playwright:v<version>-noble\`) holds the OS, Node, all three browsers and every system library they need. Every developer and every CI system that uses it gets the same environment:
- No "browser missing" or "libXYZ not found" failures.
- No slow \`playwright install --with-deps\` step.
- The same fonts and rendering. This matters a lot for **screenshot comparisons** (\`toHaveScreenshot\`). Different operating systems give different pixels.
- Easy reuse in GitHub Actions (\`container:\`), GitLab, Jenkins Docker agents and Azure.

**What can go wrong:**
- **Version mismatch.** The image tag must equal the \`@playwright/test\` version in the lock file. If you upgrade Playwright but not the image, it looks for browsers that are not there.
- **Chromium crashes or runs out of memory.** Run with \`--ipc=host\`, because Chromium uses shared memory. Add \`--init\` to avoid leftover "zombie" processes.
- **Root user.** The image runs as root by default. That turns off the Chromium sandbox. It is fine for testing your own app, but not for visiting untrusted sites. Then use a non-root user (\`pwuser\`) and the seccomp profile. In GitHub Actions container jobs, the docs use \`options: --user 1001\`.
- **Size.** The image is large. The first download is slow unless the machine has it cached.
- **Local apps.** Inside a container, \`localhost\` is the container itself. To reach an app on the host, you need host networking or the host's address.

I add one rule to the upgrade checklist: update \`@playwright/test\`, the Docker tag and the screenshot baselines together.`,
      followUps: [
        {
          q: 'Your screenshot tests pass on macOS but fail in CI. How does Docker help?',
          a: 'Screenshots depend on OS fonts, smoothing and GPU settings. So baselines made on macOS differ from Linux CI. Make and update baselines inside the same Docker image CI uses. For example, run `npx playwright test --update-snapshots` in the container. Then both sides draw the page the same way.',
        },
        {
          q: 'Do you still need `npx playwright install` inside the image?',
          a: 'No. Browsers for that version are already installed. You still need `npm ci` to install your project\'s packages, including @playwright/test at the same version as the image.',
        },
      ],
      pitfalls: [
        'Using the `latest` tag and drifting away from the project\'s version.',
        'Forgetting --ipc=host and blaming Playwright for random Chromium crashes.',
        'Thinking Docker fixes flaky tests.',
      ],
    },
    {
      id: 'pw-git-ci-iq-07',
      difficulty: 'medium',
      question: 'Some tests should run on every PR and others only at night. How do you choose, and how do you set that up in Playwright?',
      whatInterviewerLooksFor: [
        'Picks tests by risk and time',
        'Tags with --grep / --grep-invert',
        'Projects and --only-changed',
        'Someone follows up on nightly failures',
      ],
      modelAnswer: `**Principle:** PRs need **fast, trustworthy** feedback on the biggest risks. The full suite still runs often enough that nothing stays hidden for long.

**Example:** \`npx playwright test --grep @smoke --project=chromium\` → only smoke tests run, in one browser, in a few minutes.

**How to choose:**
- **Business-critical flows** (login, search, add to cart, checkout, payment) → tag \`@smoke\`. Run on every PR.
- **Tests linked to the change** → \`--only-changed=origin/main\` picks test files changed in the PR, plus files that import changed files.
- **Long, cross-browser, visual and quarantined tests** → nightly.

**How to set it up:**
- Tag tests: \`test('pay with saved card', { tag: ['@smoke', '@payments'] }, ...)\` or \`test.describe('Checkout', { tag: '@smoke' }, ...)\`.
- PR job: \`npx playwright test --grep @smoke --project=chromium\`, plus the \`--only-changed\` run.
- Main: full suite on chromium, sharded.
- Nightly (\`schedule: cron\`): \`npx playwright test\` on all projects, including \`@quarantine\` and \`@slow\`.
- Leave some out: \`--grep-invert "@quarantine|@slow"\` on PRs.

**Follow-up:** nightly failures post to the team channel. Someone checks them first thing in the morning. If a bug often slips past to nightly, move that test into \`@smoke\`.

**Keep the smoke set small:** it should stay under about 10 minutes. If it grows, review it like a product backlog.`,
      followUps: [
        {
          q: 'A bug reached main because its test only ran nightly. What do you change?',
          a: 'Find out why. Was the area business-critical but not tagged? Or did the change touch shared code that --only-changed could not see? Then tag the test (or a lighter version of it) @smoke. Or add a rule in the workflow that runs a test folder when certain app folders change.',
        },
        {
          q: 'How do you tag a whole file or group?',
          a: 'Use `test.describe(\'Checkout\', { tag: \'@checkout\' }, () => { ... })`. Every test inside gets the tag. Tags must start with @. You can filter them with --grep and --grep-invert, or in the HTML report filters.',
        },
      ],
      pitfalls: [
        'Running the full multi-browser suite on every PR and accepting 60-minute waits.',
        'Only ever running smoke tests, never the full suite.',
        'Nobody owns the nightly failures.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-git-ci-drill-1',
      question:
        'Estimate how long a CI run takes from start to finish. 200 tests, 12 s each on average. `fullyParallel: true`, 4 workers per machine, 2 shards. About 10% of tests fail once and pass on retry. Each shard job spends 2 minutes on checkout, `npm ci` and browser install. The merge-reports job takes 1 minute.',
      assumptions: [
        'Each machine has at least 4 CPUs, so 4 workers run at full speed.',
        'fullyParallel splits tests evenly: 100 per shard, 25 per worker.',
        'A retry costs the test time plus about 3 s for a new worker and browser.',
        'Shards run at the same time. The merge job starts after the slowest shard.',
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
      answer: `About **9 minutes** from start to finish. Running tests takes only about 5 of those minutes per shard. Fixed setup (2 min) and the merge job (1 min) are now a third of the total.`,
      insight: 'Once you have shards, fixed costs take over, so more shards help less and less. Cutting setup (Docker image, only the needed browsers) or fixing flaky retries can help as much as another shard.',
      followUps: [
        {
          q: 'What would 4 shards give?',
          a: '2,400 s ÷ 4 shards ÷ 4 workers = 150 s = 2.5 min of tests. Add about 0.3 min of retries and 2 min of setup ≈ 4.8 min per shard. Add 1 min to merge ≈ 6 min. Doubling the machines saved only about 3 minutes, because setup and merge did not get shorter.',
        },
      ],
    },
    {
      id: 'pw-git-ci-drill-2',
      question:
        'Your suite has 5 spec files with 60, 10, 10, 10 and 10 tests, each about 10 s. You run `--shard=1/2` and `--shard=2/2` with `fullyParallel: false`. Estimate how uneven the shards are. Then estimate the result with `fullyParallel: true`.',
      assumptions: [
        'Without fullyParallel, a whole file is the smallest piece a shard can get.',
        'Playwright tries to give each shard the same number of tests, within that limit.',
        '2 workers per shard. Ignore setup time.',
      ],
      steps: [
        { label: 'Total', calc: '100 tests × 10 s = 1,000 s' },
        { label: 'Ideal per shard', calc: '50 tests = 500 s of work' },
        { label: 'File-level split', calc: 'Best possible: shard A = big file (60 tests), shard B = four small files (40 tests)' },
        { label: 'Shard A time', calc: '60 tests in ONE file run sequentially in one worker → 600 s (second worker idle)' },
        { label: 'Shard B time', calc: '4 files over 2 workers → 2 files each → 20 tests × 10 s = 200 s' },
        { label: 'fullyParallel: true', calc: '50 tests per shard, spread over 2 workers → 25 × 10 s = 250 s per shard' },
      ],
      answer: `With file-level sharding, the run takes **~600 s**. One shard works through the 60-test file on a single worker. The other finishes in 200 s. With \`fullyParallel: true\`, each shard gets 50 tests spread over both workers: **~250 s**. That is about 2.4× faster on the same machines.`,
      insight: 'Big spec files block parallel runs. Either turn on fullyParallel (tests must be independent) or split large files.',
      followUps: [
        {
          q: 'The tests in the big file depend on each other, so you cannot turn on fullyParallel. What now?',
          a: 'Split the file into several smaller files by feature, so the file-level split is more even. Work toward independence, for example with API setup per test. Meanwhile, use `test.describe.configure({ mode: \'parallel\' })` only on groups that are already independent.',
        },
      ],
    },
    {
      id: 'pw-git-ci-drill-3',
      question:
        'You are on branch `test/coupon` with two new commits. Your PR says "This branch has conflicts that must be resolved" in `playwright.config.ts`. `main` added a `webkit` project, and you changed `retries`. Write the exact Git commands and actions to fix it with a merge. Say what you check before pushing.',
      assumptions: [
        'You have no uncommitted changes.',
        'The remote is called origin. The team prefers merge commits over rebasing shared branches.',
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
      answer: `\`git fetch origin\` → \`git merge origin/main\` → edit \`playwright.config.ts\` to keep both changes and remove the markers → \`npx playwright test --list\` and run the affected tests → \`git add playwright.config.ts\` → \`git commit\` → \`git push\`. The PR updates, and CI runs again on the merged result.`,
      insight: 'A conflict in shared config changes the test setup. Before pushing, always prove the config still loads and the suite still lists every project.',
      followUps: [
        {
          q: 'How would the steps differ with a rebase?',
          a: 'Run `git rebase origin/main`. Git replays each of your commits and stops at the one with the conflict. Fix it, run `git add`, then `git rebase --continue`. Repeat if more commits conflict. Commit ids change, so push with `--force-with-lease`. That is only OK because the branch is yours.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-git-ci-mcq-01',
      difficulty: 'easy',
      question: 'You edited `tests/cart.spec.ts`. Which order of commands sends the change to your feature branch on GitHub?',
      options: [
        'git add tests/cart.spec.ts → git commit -m "test: cart badge" → git push',
        'git commit -m "test: cart badge" → git add tests/cart.spec.ts → git push',
        'git push → git add tests/cart.spec.ts → git commit -m "test: cart badge"',
        'git fetch → git commit -m "test: cart badge" → git pull',
      ],
      correct: [0],
      explanation:
        'Changes move from the working directory → staging (`add`) → a local commit (`commit`) → the remote (`push`). Committing before adding commits nothing new. Pushing first sends nothing new. Fetch and pull bring changes down. They do not send yours up.',
      followUps: [
        {
          q: 'What does `git add -p` do, and why is it useful?',
          a: 'It lets you stage parts of a file, one piece at a time. So you can split unrelated edits into separate commits. For example, keep a test change and leave out a debug console.log.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-02',
      difficulty: 'easy',
      question: 'Which of these paths should Git ignore in a Playwright repo? Select ALL that apply.',
      options: ['playwright-report/', 'playwright/.auth/', 'package-lock.json', 'test-results/', 'playwright.config.ts'],
      correct: [0, 1, 3],
      explanation:
        'Reports and test-results are made fresh on each run. `.auth` holds storageState files with live login cookies. `package-lock.json` must be committed, so `npm ci` installs exact versions, Playwright included. The config file is source code, so it is committed too.',
      followUps: [
        {
          q: 'Why does committing the lock file matter for Playwright in particular?',
          a: 'Browser builds are tied to the Playwright version. The lock file fixes the @playwright/test version. So `npx playwright install` and the Docker image tag match what the tests run with, on every machine.',
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
        'A fresh CI machine has no browsers. `npx playwright install --with-deps` downloads the browsers for the project\'s Playwright version, plus the OS libraries they need. A global install does not fetch matching browsers for the project. codegen is the test recorder. show-report only opens an existing report.',
      followUps: [
        {
          q: 'What does --with-deps add?',
          a: 'It also installs the operating-system packages the browsers need, like fonts, graphics and media libraries. It uses the system package manager. A minimal Linux machine may not have these.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-04',
      difficulty: 'medium',
      question: 'Tests fail in CI, but there is no report to download. What is the most likely cause?',
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
        'Without an `if:`, a step runs only when the earlier steps passed. So a failing test step skips the upload. Add `if: ${{ !cancelled() }}` (or `always()`). Folders upload fine. CI does not turn off the HTML reporter. Artifacts from failed runs are kept.',
      followUps: [
        {
          q: 'Why do the docs use !cancelled() and not always()?',
          a: '`!cancelled()` uploads after both success and failure. But it skips the work when someone cancels the run on purpose. `always()` would run even then.',
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
        'With `forbidOnly` true on CI, any `test.only` or `describe.only` fails the run. So a leftover from debugging cannot hide the rest of the suite. It has nothing to do with parallel runs or retries. Locally, CI is not set, so `.only` still works for debugging one test.',
      followUps: [
        {
          q: 'What else would you add to catch it before CI?',
          a: 'A lint rule, like no-focused-test from eslint-plugin-playwright, and a code review checklist. Then it is caught in the editor or the PR, before it ever reaches CI.',
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
        'Workers run on one machine (default: 50% of cores), each with its own browser. Shards spread the work across machines. A shard only knows its own tests. One combined report needs the blob reporter and `merge-reports`.',
      followUps: [
        {
          q: 'Can you use both at once?',
          a: 'Yes, and it is normal. Each shard machine runs its share with several workers. Total time ≈ test work ÷ (shards × workers), plus setup per shard.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-07',
      difficulty: 'hard',
      question: 'A suite has one spec file with 80 tests and five small files. With 4 shards, one shard takes much longer than the others. What is the best fix?',
      options: [
        'Enable `fullyParallel: true` so shards are split per test instead of per file',
        'Increase `retries` to 3',
        'Add `--max-failures=1`',
        'Use `workers: 1` on every shard',
      ],
      correct: [0],
      explanation:
        'Without fullyParallel, shards split by file. So the 80-test file goes to one shard and runs in one worker. Splitting per test balances the shards, but the tests must be independent. Retries, max-failures and fewer workers do not change how tests are split. They only slow things down or stop early.',
      followUps: [
        {
          q: 'What must be true of the tests before you turn it on?',
          a: 'They must be independent: no shared module state, no fixed test order, and their own data. Tests from the same file may run at the same time on different workers or shards.',
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
        'In v4, artifacts cannot be changed and names must be unique in each run. So the second and third uploads named `blob-report` clash. Name them `blob-report-${{ matrix.shardIndex }}`. Blob reports are meant to be uploaded. Matrix jobs can upload. The blob reporter writes to `blob-report` by default.',
      followUps: [
        {
          q: 'How does the merge job collect them?',
          a: 'actions/download-artifact with `pattern: blob-report-*` and `merge-multiple: true` puts all shards\' files into one folder. Then `npx playwright merge-reports --reporter html ./all-blob-reports` makes the combined report.',
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
        'Cron fields are minute, hour, day of month, month, day of week. So `30 1 * * *` means 01:30 UTC every day. GitHub schedules use UTC. B swaps minute and hour, and hour 30 does not exist. `nightly` is not a workflow event. `cron` is not an event name either. Schedules go under `schedule:`.',
      followUps: [
        {
          q: 'How would the nightly run differ from the PR run in the same workflow?',
          a: 'Use `if: github.event_name == \'schedule\'` on a step that runs the full suite on all projects. Use `if: github.event_name == \'pull_request\'` on a step that runs only `--grep @smoke` on chromium.',
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
        'A version mismatch means Playwright looks for browsers the image does not have. Without `--ipc=host`, Chromium can run out of shared memory and crash. Baselines made on a Mac differ from Linux rendering, so screenshot comparisons fail. Running `npm ci` is correct. It is still needed to install the project\'s packages.',
      followUps: [
        {
          q: 'How do you make screenshot baselines that match CI?',
          a: 'Run `npx playwright test --update-snapshots` inside the same Docker image, either locally with docker run or in a special CI job. Then commit the new Linux baselines.',
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
        '`fetch` updates remote branches like origin/main and leaves your work alone. `pull` brings those changes into your current branch. Uploading is `push`. The two commands are not the same. pull works on any branch that has an upstream.',
      followUps: [
        {
          q: 'When would you use fetch instead?',
          a: 'When you want to look at incoming changes first (`git log HEAD..origin/main`). Or when you want to choose between merge and rebase yourself, without a surprise merge in the middle of your work.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-12',
      difficulty: 'hard',
      question: 'Which settings in this config are turned on only on CI? Select ALL that apply.',
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
        'Only `forbidOnly` and `retries` depend on `process.env.CI` here. Workers do too, but that limits something rather than turning it on. `fullyParallel` and `trace` apply everywhere. In practice, traces only appear on CI. Locally retries are 0, so a first retry never happens.',
      followUps: [
        {
          q: 'Locally a test fails. Will a trace be recorded?',
          a: 'No. Locally retries are 0, so there is no first retry, and `on-first-retry` never runs. Use `--trace on` for that run. Or use `retain-on-failure` locally if you want traces of local failures.',
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
        'The merge job only combines results. It downloads the blobs, merges them into an HTML report and uploads it. It does not run tests again. So it needs `npm ci` for the Playwright command line, but no browser install.',
      followUps: [
        {
          q: 'Why does the merge job use `if: ${{ !cancelled() }}`?',
          a: 'Because you need the report most when some shards failed. Without it, `needs:` would skip the merge job whenever any shard failed. Then you would have only raw blob artifacts.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-14',
      difficulty: 'expert',
      question: 'A pushed commit on shared `main` broke CI. What is the safest way to undo it?',
      options: [
        'git revert <hash> and push the new commit',
        'git reset --hard HEAD~1 and git push --force',
        'Delete the main branch and recreate it',
        'git commit --amend and push',
      ],
      correct: [0],
      explanation:
        '`git revert` adds a new commit that reverses the change. History stays the same for everyone who already pulled. Resetting with a force push, amending, or recreating the branch all rewrite shared history. That breaks other people\'s copies and open PRs.',
      followUps: [
        {
          q: 'When is force-pushing OK?',
          a: 'On your own feature branch after a rebase or amend. Use `--force-with-lease`, so you do not overwrite commits someone else pushed meanwhile. Protected branches like main should block force pushes completely.',
        },
      ],
    },
    {
      id: 'pw-git-ci-mcq-15',
      difficulty: 'hard',
      question: 'A PR job should run fast. Which choices cut PR feedback time without losing the full regression? Select ALL that apply.',
      options: [
        'Run `@smoke` tests on chromium in the PR job and the full suite on a nightly schedule',
        'Run test files changed in the PR with `--only-changed=origin/main`',
        'Set `trace: \'on\'` so failures are easier to debug',
        'Delete slow tests that rarely fail',
      ],
      correct: [0, 1],
      explanation:
        'Smoke tests on PRs plus a full nightly run, and running changed tests, give faster feedback. Full coverage still runs regularly. Tracing every test makes runs slower, not faster. Deleting slow tests loses regression coverage.',
      followUps: [
        {
          q: 'What does --only-changed need in GitHub Actions?',
          a: 'Enough Git history to compare with the base branch. For example, `actions/checkout` with `fetch-depth: 0`. The default shallow clone has only the latest commit.',
        },
      ],
    },
  ],
};

export default topic;
