import type { CompanyQuestion } from '../../types';

const DESHAW = {
  name: 'GeeksforGeeks: D.E. Shaw Interview Experience for SDET',
  url: 'https://www.geeksforgeeks.org/interview-experiences/d-e-shaw-interview-experience-for-sdet/',
  year: 2024,
};
const TBO = {
  name: 'GeeksforGeeks: TBO.com Interview Experience SDET',
  url: 'https://www.geeksforgeeks.org/tbo-com-interview-experience-sdet/',
  year: 2024,
};
const LUCIDITY = {
  name: 'GeeksforGeeks: Lucidity Interview Experience for SDET',
  url: 'https://www.geeksforgeeks.org/interview-experiences/lucidity-interview-experience-for-software-development-engineer-in-test-sdet/',
  year: 2024,
};
const CAPGEMINI = {
  name: 'GeeksforGeeks: Capgemini Interview Experience For Automation Engineer',
  url: 'https://www.geeksforgeeks.org/capgemini-interview-experience-for-automation-engineer/',
  year: 2024,
};
const SERVICENOW = {
  name: 'LeetCode Discuss: ServiceNow SDET Interview Experience',
  url: 'https://leetcode.com/discuss/post/6396630/',
  year: 2025,
};
const ZEPTO = {
  name: 'LeetCode Discuss: ZEPTO | SDET2 | Interview Experience',
  url: 'https://leetcode.com/discuss/post/6026438/',
  year: 2024,
};
const ZUORA = {
  name: 'LeetCode Discuss: Zuora Interview Experience (Senior SDET, 7 YoE)',
  url: 'https://leetcode.com/discuss/post/8337142/',
  year: 2026,
};
const GHL = {
  name: 'LeetCode Discuss: GoHighLevel Interview Experience (Lead SDET, 7 YoE)',
  url: 'https://leetcode.com/discuss/post/8346427/',
  year: 2026,
};
const KPMG = {
  name: 'LinkedIn post: KPMG Playwright Interview Experience (SDET / QA Automation, L1)',
  url: 'https://www.linkedin.com/posts/chitra-malode-1150bb174_kpmg-playwright-interview-experience-sdet-activity-7494973834220019713-2G_Q',
  year: 2026,
};
const FIVETRAN = {
  name: 'LeetCode Discuss: Fivetran | Senior SDET | Bangalore',
  url: 'https://leetcode.com/discuss/post/6260025/',
  year: 2025,
};
const IMPELSYS = {
  name: 'Medium (Nikhil N V): Interview questions asked to me in Impelsys for Senior Test Automation Engineer / SDET role',
  url: 'https://medium.com/@nikhilntv/interview-questions-asked-to-me-in-impelsys-for-senior-test-automation-engineer-sdet-role-a8becf9f6888',
  year: 2021,
};
const CITI = {
  name: 'LeetCode Discuss: Citi bank Sr QA Automation engineer (AVP) Interview Experience',
  url: 'https://leetcode.com/discuss/post/6118261/',
  year: 2024,
};
const AMAZON = {
  name: 'LeetCode Discuss: AMAZON QAE, Hyderabad interview July 2024',
  url: 'https://leetcode.com/discuss/post/5573766/',
  year: 2024,
};
const AIRBUS = {
  name: 'LeetCode Discuss: Interview Experience Airbus - Software Test Engineer Intern (Automation)',
  url: 'https://leetcode.com/discuss/post/6894957/',
  year: 2025,
};

export const QUESTIONS: CompanyQuestion[] = [
  // ---------------- D.E. Shaw ----------------
  {
    id: 'co-automation-de-shaw-1',
    company: 'D.E. Shaw',
    area: 'automation',
    role: 'SDET',
    round: 'Technical rounds',
    difficulty: 'medium',
    question: 'Cypress, Playwright or Selenium: which would you pick for a new UI automation project, and why?',
    answer: `Answer with criteria, not loyalty:

| Criterion | Selenium | Cypress | Playwright |
|---|---|---|---|
| Languages | Java, Python, C#, JS, Ruby | JS/TS only | TS/JS, Python, Java, .NET |
| Browsers | All incl. real Safari, legacy | Chromium, Firefox, limited WebKit | Chromium, Firefox, WebKit |
| Waiting | Manual explicit waits | Automatic retry | Auto-wait + web-first assertions |
| Multi-tab / multi-origin / iframes | Yes, verbose | Restricted | Native |
| Parallelism | Grid / TestNG | Paid dashboard or CI splitting | Built-in workers + sharding |
| Network mocking, API testing | External tools | Yes | Yes (\`page.route\`, \`request\`) |

**My default for a new web project is Playwright**: less flakiness from auto-waiting, isolated contexts per test, free parallelism, traces for debugging, and API + UI in one runner. **Selenium** still wins when the team's stack is Java-only with a big existing suite, when you need real Safari/IE-mode or a vendor grid, or Appium for mobile. **Cypress** is pleasant for front-end developers testing a single-origin app in JS.

Close with the deciding factors in context: team language skills, browsers the business must support, existing investment, and CI budget.`,
    followUps: [
      {
        q: 'What would you lose moving a Selenium suite to Playwright?',
        a: 'Real-browser-vendor coverage (Playwright uses patched builds, though branded Chrome/Edge channels are available), some grid/cloud integrations, and the rewrite effort; you gain speed and stability.',
      },
    ],
    topic: 'pw-setup',
    source: DESHAW,
  },
  {
    id: 'co-automation-de-shaw-2',
    company: 'D.E. Shaw',
    area: 'automation',
    role: 'SDET',
    round: 'Technical rounds',
    difficulty: 'hard',
    question:
      'A page shows a list of items that must follow certain rules (e.g. sorted, filtered, no duplicates). How would you verify it through both UI and API automation?',
    answer: `Split it into **source of truth** (API) and **presentation** (UI), then compare.

1. **API check** — call the endpoint with the \`request\` fixture and assert the rules on the raw data: count, sort order, filter condition, uniqueness, schema.
2. **UI check** — read the rendered list and assert the same rules on what the user sees.
3. **Consistency** — the UI list should equal the API list (same items, same order), which catches mapping/rendering bugs.

    import { test, expect } from '@playwright/test';

    test('products are sorted by price and match the API', async ({ page, request }) => {
      const res = await request.get('/api/products?sort=price');
      expect(res.ok()).toBeTruthy();
      const api: { name: string; price: number }[] = (await res.json()).items;
      const prices = api.map((p) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
      expect(new Set(api.map((p) => p.name)).size).toBe(api.length);

      await page.goto('/products?sort=price');
      const names = page.getByTestId('product-name');
      await expect(names).toHaveCount(api.length);
      await expect(names).toHaveText(api.map((p) => p.name)); // order matters
    });

Mention pagination (compare page by page), data stability (seed known data or mock with \`page.route\` for UI-only rules), and edge cases: empty list, one item, ties in sort keys.`,
    followUps: [
      {
        q: 'Why use toHaveText with an array instead of looping over elements?',
        a: 'It is a web-first assertion: it retries until the whole list matches (count and order), so it tolerates late rendering and gives a clear diff when it fails.',
      },
    ],
    topic: 'pw-api-network',
    source: DESHAW,
  },
  {
    id: 'co-automation-de-shaw-3',
    company: 'D.E. Shaw',
    area: 'automation',
    role: 'SDET',
    round: 'Technical rounds',
    difficulty: 'medium',
    question: 'How do you handle iframes whose attributes keep changing (dynamic frames)?',
    answer: `In Selenium you must \`switchTo().frame(...)\` and back, and a re-rendered frame causes stale references. Playwright avoids switching: a **FrameLocator** is resolved lazily every time you use it, so a frame that reloads or changes is found again automatically.

Pick a stable way to identify the frame instead of the changing id/name:

    // by a stable attribute or partial src
    const payment = page.frameLocator('iframe[src*="/payment"]');
    // or by its accessible title
    const editor = page.locator('iframe[title="Rich text editor"]').contentFrame();

    await payment.getByLabel('Card number').fill('4111111111111111');
    await expect(payment.getByText('Card accepted')).toBeVisible();

    // nested frames chain naturally
    const inner = page.frameLocator('#outer').frameLocator('iframe.inner');

Tips: if the id is generated (\`frame-8731\`), match a stable prefix (\`iframe[id^="frame-"]\`) or the \`title\`; if several match, narrow with \`.first()\` / \`.nth()\` or by a parent region; and assert on content inside the frame rather than waiting for the frame element itself.`,
    followUps: [
      {
        q: 'What is the difference between frameLocator() and page.frame()?',
        a: 'frameLocator() is a lazy locator that re-resolves and auto-waits; page.frame({ name/url }) returns a Frame object snapshot that can become detached if the iframe reloads.',
      },
    ],
    topic: 'pw-actions',
    source: DESHAW,
  },

  // ---------------- TBO.com ----------------
  {
    id: 'co-automation-tbo-com-1',
    company: 'TBO.com',
    area: 'automation',
    role: 'SDET',
    round: 'Round 2 (automation and SQL)',
    difficulty: 'medium',
    question:
      'Write custom XPaths for elements on a given page that need axes such as child and ancestor, not simple attribute matches.',
    answer: `Know the axes, then explain when you would avoid them.

    //table//td[text()='Alice']/following-sibling::td[2]       (cell two columns right)
    //span[text()='Price']/ancestor::div[@class='card']         (card containing a label)
    //div[@id='cart']/child::ul/child::li[last()]               (last item)
    //label[normalize-space()='Email']/following::input[1]      (input after a label)
    //button[contains(@class,'add')][ancestor::li[.//h3[text()='Backpack']]]

Other axes: \`parent::\`, \`preceding-sibling::\`, \`descendant::\`, \`self::\`.

In **Playwright** the same intent is usually clearer without XPath, by filtering and chaining locators:

    const row = page.getByRole('row', { name: /Alice/ });
    await row.getByRole('cell').nth(2).click();

    const card = page.getByTestId('product-card').filter({ hasText: 'Backpack' });
    await card.getByRole('button', { name: 'Add to cart' }).click();

    // XPath is still allowed when needed
    page.locator('xpath=//span[text()="Price"]/ancestor::div[@class="card"]');

The interview point: XPath axes solve "find relative to a stable anchor", but role/text locators with \`filter({ has, hasText })\` express the same thing and survive layout changes better.`,
    followUps: [
      {
        q: 'Does Playwright XPath pierce shadow DOM?',
        a: 'No. CSS and role/text locators pierce open shadow roots by default; XPath does not, which is another reason to prefer them.',
      },
    ],
    topic: 'pw-locators',
    source: TBO,
  },

  // ---------------- Lucidity ----------------
  {
    id: 'co-automation-lucidity-1',
    company: 'Lucidity',
    area: 'automation',
    role: 'SDET',
    round: 'Round 1 (technical coding and automation)',
    difficulty: 'medium',
    question: 'Describe the test automation framework you work with in detail.',
    answer: `Use a fixed structure so the answer is complete in about two minutes:

1. **Purpose and scope** — what it tests (web UI, APIs), how many tests, who runs it.
2. **Stack** — Playwright Test + TypeScript, Node, GitHub Actions/Jenkins, reporters (HTML/JUnit/Allure).
3. **Layers** — specs → page/component objects → fixtures (auth, data, page objects) → API helpers → config/env.
4. **Data** — builders creating unique data via API, cleanup in fixture teardown, secrets from env vars.
5. **Auth** — setup project saving \`storageState\` per role.
6. **Execution** — projects per browser, tags like \`@smoke\`/\`@regression\` with \`--grep\`, parallel workers and sharding in CI, retries only in CI.
7. **Reporting & debugging** — traces on first retry, screenshots/videos on failure, results posted to the team channel.
8. **Your contribution and a result** — e.g. "moved login to storageState and cut suite time from 40 to 12 minutes; flaky rate under 1%."

    tests/  pages/  fixtures/  api/  data/  playwright.config.ts  .github/workflows/e2e.yml

Interviewers judge ownership, so say what **you** designed or improved and one trade-off you made.`,
    followUps: [
      {
        q: 'What would you change in your framework if you started again?',
        a: 'Give one honest example, such as moving data setup from UI to API, replacing static JSON with builders, or adding lint rules against hard waits.',
      },
    ],
    topic: 'pw-pom-data',
    source: LUCIDITY,
  },

  // ---------------- Capgemini ----------------
  {
    id: 'co-automation-capgemini-1',
    company: 'Capgemini',
    area: 'automation',
    role: 'Automation Engineer',
    round: 'Managerial and HR round',
    difficulty: 'medium',
    question:
      'Your current framework cannot automate a particular test case. Do you automate it with a different tool or keep it manual?',
    answer: `There is no single right answer; show a decision process.

1. **Why can't it be automated?** A real tool limit (desktop dialog, hardware, CAPTCHA, OTP to a phone) or just missing support in our framework (file download, new tab, iframe, API stub) that we can add.
2. **Value** — how often it runs, business risk, how long it takes manually, whether it is in the regression path.
3. **Cost** — effort to extend the framework vs. bringing in another tool (licences, skills, CI integration, two code bases to maintain).
4. **Alternatives** — test it at a lower level (API or component test), stub the hard part (e.g. mock OTP service, test-only bypass), or split: automate the 90% and keep a short manual check.

Typical outcome: extend the existing framework if feasible (Playwright already covers tabs, downloads, iframes, network mocking); keep it **manual with a checklist** if it is rare and low risk; adopt a second tool only for a whole class of tests (e.g. Appium for native mobile), not for one case. Document the decision in the test plan so coverage gaps are visible.`,
    followUps: [
      {
        q: 'How would you automate a flow with an OTP sent by SMS?',
        a: 'Ask for a test hook: a fixed OTP in test environments, an API to read the latest OTP, or a mocked SMS provider. Never automate reading a real phone in CI.',
      },
    ],
    topic: 'qa-interview-bank',
    source: CAPGEMINI,
  },
  {
    id: 'co-automation-capgemini-2',
    company: 'Capgemini',
    area: 'automation',
    role: 'Automation Engineer',
    round: 'Technical round 2',
    difficulty: 'medium',
    question: 'Which test cases did you automate, what challenges did you face, and how did you solve them?',
    answer: `Structure: **selection → challenge → fix → result**.

**Selection**: stable, high-value, repeatable cases — smoke, regression of core flows (login, search, checkout), data-driven validations and API checks. Not automated: one-off, highly visual or rapidly changing features.

**Challenges with concrete fixes** (pick two you really faced):
- *Flaky timing* → removed fixed sleeps; used Playwright auto-waiting and web-first assertions like \`await expect(locator).toBeVisible()\`.
- *Brittle locators* → moved to \`getByRole\`/\`getByTestId\` and agreed \`data-testid\` attributes with developers.
- *Slow login in every test* → setup project saving \`storageState\`.
- *Test data collisions in parallel runs* → API-created unique data per test with cleanup in fixtures.
- *Unstable third-party service* → mocked it with \`page.route\`.
- *Hard-to-debug CI failures* → traces on first retry and artifacts uploaded.

**Result**: quantify — "regression went from two days manual to 25 minutes in CI; false failures dropped from ~10% to under 1%."`,
    followUps: [
      {
        q: 'How did you decide what not to automate?',
        a: 'Low-frequency, low-risk, or unstable-UI cases, and anything where the check is subjective (look and feel) or the cost of maintenance exceeds the time saved.',
      },
    ],
    topic: 'pw-debug-flaky',
    source: CAPGEMINI,
  },

  // ---------------- ServiceNow ----------------
  {
    id: 'co-automation-servicenow-1',
    company: 'ServiceNow',
    area: 'automation',
    role: 'SDET',
    round: 'Round 1 (DSA and in-depth Selenium)',
    difficulty: 'medium',
    question: 'Explain the different types of waits in detail and when you would use each.',
    answer: `**Selenium vocabulary** (what they expect you to know):
- *Implicit wait* — global polling for element lookup; simple but hides slowness and mixes badly with explicit waits.
- *Explicit wait* — \`WebDriverWait\` + \`ExpectedConditions\` for a specific condition (visible, clickable). The recommended default.
- *Fluent wait* — explicit wait with custom polling interval and ignored exceptions.
- *Thread.sleep* — fixed delay; avoid.

**Playwright equivalent** (how you would do it today):
- **Actionability auto-wait**: \`click()\`, \`fill()\` wait until the element is attached, visible, stable, enabled and receives events.
- **Web-first assertions** retry until true or timeout:

    await expect(page.getByRole('alert')).toHaveText('Saved');
    await expect(page.getByTestId('spinner')).toBeHidden();

- **Event waits** when the trigger is not in the DOM:

    const resp = page.waitForResponse((r) => r.url().includes('/api/orders') && r.ok());
    await page.getByRole('button', { name: 'Place order' }).click();
    await resp;

- \`page.waitForURL()\`, \`locator.waitFor()\` for specific states; timeouts via \`actionTimeout\`, \`expect.timeout\`.
- \`page.waitForTimeout()\` only for debugging — never in committed tests.`,
    followUps: [
      {
        q: 'Why is mixing implicit and explicit waits in Selenium a problem?',
        a: 'The timeouts can stack and produce unpredictable wait times, because an explicit wait polls findElement, which itself waits for the implicit timeout.',
      },
    ],
    topic: 'pw-assertions-waiting',
    source: SERVICENOW,
  },
  {
    id: 'co-automation-servicenow-2',
    company: 'ServiceNow',
    area: 'automation',
    role: 'SDET',
    round: 'Round 2 (DSA and Selenium in depth)',
    difficulty: 'medium',
    question: 'The dropdown on the page is not a <select> element. How do you interact with it?',
    answer: `Selenium's \`Select\` class only works on native \`<select>\`. A custom dropdown (div/ul, React-Select, MUI) is just elements, so you **click to open, then click the option**, like a user.

In Playwright:

    // native <select>
    await page.getByLabel('Country').selectOption('India');

    // custom dropdown / combobox
    await page.getByRole('combobox', { name: 'Country' }).click();
    await page.getByRole('option', { name: 'India' }).click();
    await expect(page.getByRole('combobox', { name: 'Country' })).toHaveText(/India/);

    // searchable (type-ahead) dropdown
    await page.getByRole('combobox', { name: 'City' }).fill('Bang');
    await page.getByRole('option', { name: 'Bengaluru' }).click();

If the widget has poor accessibility roles, fall back to \`getByTestId\` or text within the opened list container. Watch for: options rendered in a portal at the end of \`<body>\` (so don't scope to the dropdown's parent), virtualised long lists (type to filter instead of scrolling), and keyboard support (\`press('ArrowDown')\`, \`press('Enter')\`) as a separate test.`,
    followUps: [
      {
        q: 'How would you verify all available options?',
        a: 'Open the list and assert await expect(page.getByRole("option")).toHaveText([...expected]) — a retrying assertion on the whole list.',
      },
    ],
    topic: 'pw-actions',
    source: SERVICENOW,
  },
  {
    id: 'co-automation-servicenow-3',
    company: 'ServiceNow',
    area: 'automation',
    role: 'SDET',
    round: 'Round 2 (DSA and Selenium in depth)',
    difficulty: 'medium',
    question: 'How do you re-run only the failed tests, without relying on TestNG\'s testng-failed.xml?',
    answer: `In TestNG the alternatives are an \`IRetryAnalyzer\` (attached via an annotation transformer/listener) for in-run retries, or reading results and building a new suite.

In **Playwright** this is built in:

- **In-run retries**: \`retries: 2\` in config (or \`--retries=2\`). Tests that pass on retry are marked **flaky** in the report, so they are not hidden.
- **Re-run only last failures**: \`npx playwright test --last-failed\` uses the \`.last-run.json\` from the previous run.
- **Targeted reruns**: \`--grep\`, a file path with line number (\`tests/cart.spec.ts:42\`), or \`--project\`.

    // playwright.config.ts
    export default defineConfig({
      retries: process.env.CI ? 2 : 0,
      use: { trace: 'on-first-retry' }, // capture a trace when a retry happens
    });

    // a test that must never be retried
    test.describe.configure({ retries: 0 });

Good practice: retries are a safety net for CI noise, not a fix. Track flaky tests from the report, quarantine with \`test.fixme\` and a ticket, and fix the root cause.`,
    followUps: [
      {
        q: 'Why is "retry until green" dangerous?',
        a: 'It hides real intermittent product bugs (race conditions) and lets flakiness grow. Always look at tests reported as flaky and fix or quarantine them.',
      },
    ],
    topic: 'pw-debug-flaky',
    source: SERVICENOW,
  },
  {
    id: 'co-automation-servicenow-4',
    company: 'ServiceNow',
    area: 'automation',
    role: 'SDET',
    round: 'Round 3 (hiring manager)',
    difficulty: 'medium',
    question: 'What do your current test suites look like, how do you execute them, and how do you analyse the results?',
    answer: `Describe the **pipeline**, not just the code:

- **Suites**: smoke (~5 min, on every PR), regression (full, nightly and before release), API suite, plus a few cross-browser projects. Selected with tags: \`npx playwright test --grep @smoke\`.
- **Execution**: GitHub Actions/Jenkins runs in a Playwright Docker image, \`workers\` per machine plus \`--shard=i/n\` across machines; environment chosen via \`BASE_URL\`.
- **Artifacts**: HTML report, JUnit XML for the CI test tab, traces on first retry, screenshots/videos on failure.
- **Analysis routine**:
  1. Separate *failed* from *flaky* (passed on retry).
  2. Open the trace: DOM snapshot, network and console at the failing step.
  3. Classify: product bug (raise defect with trace), test bug (fix), environment/data (fix env or data setup).
  4. Track trends: top flaky tests, duration, pass rate per suite.

    - name: Run e2e
      run: npx playwright test --grep @regression --shard=\${{ matrix.shard }}/4

End with a metric you own (e.g. "triage done before stand-up; flaky rate kept under 2%").`,
    followUps: [
      {
        q: 'How do you share results with non-technical stakeholders?',
        a: 'A short summary (pass/fail/flaky counts, new defects, blockers) posted to the team channel by a custom reporter or CI step, with a link to the HTML report.',
      },
    ],
    topic: 'pw-git-ci',
    source: SERVICENOW,
  },

  // ---------------- Zepto ----------------
  {
    id: 'co-automation-zepto-1',
    company: 'Zepto',
    area: 'automation',
    role: 'SDET-2',
    round: 'Technical round 2 (internal)',
    difficulty: 'hard',
    question:
      'A developer adds a new field to an existing API payload and your regression suite starts failing. How do you change the framework so it supports both the old and new versions?',
    answer: `First decide if the failure is **correct**: an additive, optional field should not break consumers. If tests fail, the tests are probably too strict (exact-match on the whole body, or a closed schema).

Framework changes:

1. **Assert contracts, not snapshots** — validate required fields and types and allow extra properties (JSON Schema with \`additionalProperties: true\`, or \`toMatchObject\`).

    const body = await res.json();
    expect(body).toMatchObject({ id: expect.any(String), status: 'CREATED' }); // extra fields OK

2. **Request builders with defaults** — payloads built by a builder; the new field is added in one place, optional by default.
3. **Version as data, not if-else everywhere** — keep \`apiVersion\` in config/env and resolve version-specific schemas or builders through a small map:

    const schemas = { v1: orderSchemaV1, v2: orderSchemaV2 };
    const schema = schemas[process.env.API_VERSION ?? 'v2'];

4. **Run both** — a CI matrix or Playwright projects (\`{ name: 'api-v1', use: { extraHTTPHeaders: { 'Accept-Version': 'v1' } } }\`) while both versions are live.
5. **Contract tests** (e.g. Pact) so breaking changes are caught before regression.

Add new tests for the new field itself; the old tests should keep passing untouched.`,
    followUps: [
      {
        q: 'When should the suite fail on a payload change?',
        a: 'When a required field is removed or renamed, a type changes, or semantics change — those are breaking changes and need a version bump or coordination.',
      },
    ],
    topic: 'pw-api-network',
    source: ZEPTO,
  },
  {
    id: 'co-automation-zepto-2',
    company: 'Zepto',
    area: 'automation',
    role: 'SDET-2',
    round: 'Technical round 2 (internal)',
    difficulty: 'medium',
    question: 'How would you set up Jenkins on the cloud to run your automation?',
    answer: `Outline it end to end:

1. **Host** — a VM (EC2/GCE/Azure VM) or Kubernetes (Helm chart) running the official \`jenkins/jenkins:lts\` image with a persistent volume for \`JENKINS_HOME\`; HTTPS behind a load balancer; admin via SSO.
2. **Agents** — keep the controller light; run builds on agents (EC2/Kubernetes plugin spins up pods on demand). For Playwright, use the \`mcr.microsoft.com/playwright\` image so browsers and OS deps are present.
3. **Credentials** — Jenkins credentials store (or a cloud secrets manager) for env URLs, test users and tokens; never in the repo.
4. **Pipeline as code** — a \`Jenkinsfile\` in the repo:

    pipeline {
      agent { docker { image 'mcr.microsoft.com/playwright:v1.50.0-noble' } }
      environment { BASE_URL = credentials('staging-url') }
      stages {
        stage('Install') { steps { sh 'npm ci' } }
        stage('Test') { steps { sh 'npx playwright test --reporter=junit,html' } }
      }
      post {
        always {
          junit 'results.xml'
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }

5. **Triggers** — webhook on PRs (smoke), cron for nightly regression, parameters for env/tags.
6. **Notifications** — Slack/email on failure with a report link.`,
    followUps: [
      {
        q: 'How do you run tests in parallel across Jenkins agents?',
        a: 'Use a parallel stage or matrix that runs npx playwright test --shard=i/N on N agents, then merge the blob reports in a final stage.',
      },
    ],
    topic: 'pw-git-ci',
    source: ZEPTO,
  },

  // ---------------- Zuora ----------------
  {
    id: 'co-automation-zuora-1',
    company: 'Zuora',
    area: 'automation',
    role: 'Senior SDET',
    round: 'Round 1 (technical + coding)',
    difficulty: 'medium',
    question: 'Playwright vs Selenium: what are the differences, advantages and the right use cases for each?',
    answer: `**Architecture**: Selenium sends each command over HTTP (W3C WebDriver) to a browser-specific driver; Playwright keeps one persistent connection and controls browsers through their debugging protocols, receiving events (network, DOM, console).

**What that gives Playwright**: auto-waiting and web-first assertions (fewer flaky waits), isolated \`BrowserContext\` per test, built-in runner with parallelism, retries, sharding, fixtures and HTML report, network interception (\`page.route\`), API testing (\`request\`), traces/codegen/UI mode, easy multi-tab, iframes and multiple users.

**Where Selenium is stronger**: widest language and browser-vendor coverage (real Safari, older browsers), mature grid/cloud ecosystem, Appium for mobile, huge community and existing enterprise suites in Java + TestNG.

**Use cases**:
- New web app, TS/JS or Python team, need speed and stability → Playwright.
- Large existing Java/Selenium investment, vendor grid, mobile with Appium, or strict real-browser requirements → stay on Selenium (maybe adopt Playwright for new modules).

    // Playwright: no explicit wait needed
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('alert')).toHaveText('Saved');`,
    followUps: [
      {
        q: 'Does Selenium 4 close the gap?',
        a: 'Partly: relative locators, CDP/BiDi access and better grid. But auto-waiting, the integrated runner and tracing are still things you assemble yourself.',
      },
    ],
    topic: 'pw-setup',
    source: ZUORA,
  },
  {
    id: 'co-automation-zuora-2',
    company: 'Zuora',
    area: 'automation',
    role: 'Senior SDET',
    round: 'Round 2 (automation and CI/CD discussion)',
    difficulty: 'medium',
    question: 'Which Jenkins job parameters and options do you use for your automation jobs, and why?',
    answer: `Parameters make one job serve many runs:

- **Choice** \`ENV\` (dev/qa/staging) → sets \`BASE_URL\`.
- **Choice/String** \`SUITE\` or \`TAGS\` (\`@smoke\`, \`@regression\`) → passed to \`--grep\`.
- **Choice** \`BROWSER\` / project → \`--project=chromium\`.
- **String** \`BRANCH\` → which code to check out.
- **String** \`WORKERS\`, \`SHARDS\`; **Boolean** \`HEADED\`/\`DEBUG\`, \`UPDATE_SNAPSHOTS\`.

    pipeline {
      agent any
      parameters {
        choice(name: 'ENV', choices: ['qa', 'staging'], description: 'Target environment')
        string(name: 'TAGS', defaultValue: '@smoke')
        choice(name: 'PROJECT', choices: ['chromium', 'firefox', 'webkit'])
      }
      stages {
        stage('Test') {
          steps { sh "BASE_URL=https://\${params.ENV}.example.com npx playwright test --grep '\${params.TAGS}' --project=\${params.PROJECT}" }
        }
      }
    }

Other options worth naming: build triggers (SCM webhook, cron \`H 2 * * *\`), \`timeout\` and \`retry\` wrappers, \`disableConcurrentBuilds\`, build discarder (keep last N), credentials binding for secrets, \`post { always { junit ...; archiveArtifacts ... } }\` and notifications.`,
    followUps: [
      {
        q: 'How do you trigger the regression job after a deployment?',
        a: 'Have the deploy pipeline call build job: "e2e-regression", parameters: [...] (or a webhook/upstream trigger) with ENV set to the environment just deployed.',
      },
    ],
    topic: 'pw-git-ci',
    source: ZUORA,
  },
  {
    id: 'co-automation-zuora-3',
    company: 'Zuora',
    area: 'automation',
    role: 'Senior SDET',
    round: 'Round 2 (automation and CI/CD discussion)',
    difficulty: 'hard',
    question: 'How would you automate a payment flow, and how would you design a framework specifically for payment automation?',
    answer: `**Principles**: never hit real money; separate what you own from the payment provider; make every run idempotent and traceable.

**Layers of tests**
1. **API/contract tests** for your payment service: create invoice → payment intent → capture/refund; status codes, amounts, currency rounding, idempotency keys, retries.
2. **UI E2E** on a few critical journeys using the provider's **sandbox** and official test cards (success, decline, insufficient funds, 3-D Secure challenge).
3. **Webhook tests**: post signed sandbox events (or replay) to your endpoint; assert state changes and duplicate-event handling.
4. **Mocked UI tests** for edge cases that are hard to trigger in sandbox, via \`page.route\`.

    test('declined card shows a retry message', async ({ page }) => {
      await page.route('**/api/payments', (r) => r.fulfill({ status: 402, json: { code: 'card_declined' } }));
      await page.goto('/checkout');
      await page.getByRole('button', { name: 'Pay' }).click();
      await expect(page.getByRole('alert')).toHaveText(/declined/i);
    });

**Framework design**: fixtures that create a customer/invoice via API and clean up; a test-card catalogue as typed data; provider iframes handled with \`frameLocator\`; secrets from vault; reconciliation checks (ledger/DB vs provider); unique idempotency keys per test; tags to keep live-sandbox tests out of PR runs; full traces for audit.`,
    followUps: [
      {
        q: 'Which negative scenarios are must-haves?',
        a: 'Decline, timeout after charge (no double charge on retry), duplicate webhook, partial refund, currency/rounding, expired card, and 3-D Secure failure or abandonment.',
      },
    ],
    topic: 'pw-pom-data',
    source: ZUORA,
  },

  // ---------------- GoHighLevel ----------------
  {
    id: 'co-automation-gohighlevel-1',
    company: 'GoHighLevel',
    area: 'automation',
    role: 'Lead SDET',
    round: 'Technical round 3',
    difficulty: 'hard',
    question: 'How do you handle flaky tests in a large automation suite?',
    answer: `Treat flakiness as a **process**, not one-off fixes.

**Detect** — retries in CI (\`retries: 2\`) so Playwright labels tests *flaky*; track a flaky leaderboard over runs; \`--repeat-each=20\` locally to reproduce.

**Diagnose** with the trace (\`trace: 'on-first-retry'\`): DOM snapshot, network and console at the failing step. Common causes:
- timing: hard waits, assertions on non-retrying values → use web-first assertions;
- shared state/data between parallel tests → unique data per test, isolated contexts;
- order dependence → each test sets up its own state;
- unstable locators → \`getByRole\`/\`getByTestId\`;
- environment and third parties → mock with \`page.route\`, health checks;
- animations → \`toBeVisible\` waits for stability; disable animations in test builds.

    // bad
    const text = await page.locator('.status').textContent();
    expect(text).toBe('Done');
    // good: retries until true
    await expect(page.getByTestId('status')).toHaveText('Done');

**Govern** — quarantine with \`test.fixme()\` + ticket and an owner, SLA to fix, never allow silent retry-to-green, lint against \`waitForTimeout\`. Report the flaky rate as a team metric.`,
    followUps: [
      {
        q: 'How do you prove a fix worked?',
        a: 'Re-run the test many times (--repeat-each=50, ideally in CI-like conditions with the same workers) and watch it stay off the flaky list for several days.',
      },
    ],
    topic: 'pw-debug-flaky',
    source: GHL,
  },
  {
    id: 'co-automation-gohighlevel-2',
    company: 'GoHighLevel',
    area: 'automation',
    role: 'Lead SDET',
    round: 'Managerial round (QA Director + Senior Manager)',
    difficulty: 'medium',
    question: 'Explain your CI/CD experience and how you implemented GitLab CI for automation in your organisation.',
    answer: `Describe stages, triggers, artifacts and feedback.

    # .gitlab-ci.yml
    stages: [install, test, report]

    e2e:
      stage: test
      image: mcr.microsoft.com/playwright:v1.50.0-noble
      parallel: 4
      script:
        - npm ci
        - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL --reporter=blob
      artifacts:
        when: always
        paths: [blob-report]
        expire_in: 7 days
      rules:
        - if: $CI_PIPELINE_SOURCE == "merge_request_event"
        - if: $CI_PIPELINE_SOURCE == "schedule"

    report:
      stage: report
      when: always
      script: [npx playwright merge-reports --reporter html,junit ./blob-report]
      artifacts: { when: always, paths: [playwright-report], reports: { junit: results.xml } }

Talking points: smoke on every merge request, full regression on a schedule and after deploy; secrets as masked CI/CD variables; Docker image pinned to the Playwright version; \`parallel\` + sharding to keep feedback under ~10 minutes; JUnit report so failures show in the MR widget; Slack notification. **GitHub Actions comparison** (often asked next): \`jobs\`/\`matrix\` instead of \`stages\`/\`parallel\`, \`actions/upload-artifact\` instead of \`artifacts:\`, secrets in repo/environment settings — concepts map one-to-one.`,
    followUps: [
      {
        q: 'Which deployment strategies have you tested against, and how does that affect E2E runs?',
        a: 'Blue-green and canary: run smoke against the new (green/canary) target before switching traffic, and keep a quick post-switch smoke to allow fast rollback.',
      },
    ],
    topic: 'pw-git-ci',
    source: GHL,
  },
  {
    id: 'co-automation-gohighlevel-3',
    company: 'GoHighLevel',
    area: 'automation',
    role: 'Lead SDET',
    round: 'Technical round 2 (framework and leadership)',
    difficulty: 'medium',
    question: 'Compare Selenium and Playwright, and explain how element handling strategies differ between them.',
    answer: `**Element handling** is where the difference shows most:

- **Selenium** finds a \`WebElement\` immediately and holds a reference. If the DOM re-renders you get \`StaleElementReferenceException\`; if it is not ready, \`NoSuchElement\` or \`ElementNotInteractable\` — so you add \`WebDriverWait\` everywhere and often a PageFactory.
- **Playwright** uses **locators**: a description of how to find the element, resolved **at action time**, every time. Actions auto-wait for actionability (visible, stable, enabled, receiving events), and locators are **strict** — if two elements match, it fails instead of clicking the wrong one.

    const save = page.getByRole('button', { name: 'Save' });   // nothing is queried yet
    await save.click();                                         // resolve + wait + click
    await expect(save).toBeDisabled();                          // resolve again, retry assertion

Preferred locator order in Playwright: \`getByRole\` → \`getByLabel\`/\`getByPlaceholder\`/\`getByText\` → \`getByTestId\` → CSS → XPath. Lists are handled with \`filter({ hasText, has })\` and \`nth()\`, not index-based XPath.

Broader comparison: protocol (HTTP WebDriver vs persistent connection), built-in runner/parallelism/tracing in Playwright, wider language/browser/grid ecosystem in Selenium.`,
    followUps: [
      {
        q: 'What does "strict" mean for Playwright locators?',
        a: 'An action or assertion on a locator that matches more than one element throws, forcing you to make the locator unique (or use first()/nth() explicitly).',
      },
    ],
    topic: 'pw-locators',
    source: GHL,
  },

  // ---------------- KPMG ----------------
  {
    id: 'co-automation-kpmg-1',
    company: 'KPMG',
    area: 'automation',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'medium',
    question: 'Which CI/CD tools have you used, and how did you integrate your automation framework with them?',
    answer: `Name the tool, then walk the integration steps — they are the same in Jenkins, GitHub Actions, GitLab CI or Azure DevOps:

1. **Trigger** — on pull request (smoke), on merge/deploy (regression), nightly schedule.
2. **Environment** — Playwright Docker image or \`npx playwright install --with-deps\`; \`npm ci\` for reproducible installs.
3. **Config by env vars** — \`BASE_URL\`, credentials from the CI secret store; \`process.env.CI\` turns on retries and \`forbidOnly\`.
4. **Run** — \`npx playwright test --grep @smoke\`, parallel workers and sharding across machines.
5. **Publish** — JUnit XML to the CI test tab, HTML report + traces as artifacts (uploaded even on failure).
6. **Gate & notify** — failing smoke blocks the merge; Slack/Teams message with the report link.

    # .github/workflows/e2e.yml
    on: [pull_request]
    jobs:
      e2e:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: 20 }
          - run: npm ci && npx playwright install --with-deps
          - run: npx playwright test --grep @smoke
            env: { BASE_URL: \${{ vars.STAGING_URL }} }
          - uses: actions/upload-artifact@v4
            if: always()
            with: { name: report, path: playwright-report }`,
    followUps: [
      {
        q: 'Why upload artifacts with if: always()?',
        a: 'Because the report and traces matter most when the test step fails; without always() the upload step is skipped after a failure.',
      },
    ],
    topic: 'pw-git-ci',
    source: KPMG,
  },
  {
    id: 'co-automation-kpmg-2',
    company: 'KPMG',
    area: 'automation',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'medium',
    question: 'How do you handle test data in your automation framework?',
    answer: `Aim for data that is **independent, unique, created on demand and cleaned up**.

- **Static reference data** (countries, product types) in typed JSON/TS files.
- **Dynamic data via builders/factories** with sensible defaults and overrides, plus unique values (timestamp, \`crypto.randomUUID()\`, worker index) so parallel tests never collide.
- **Create through the API, not the UI**, inside fixtures that also delete the data.
- **Data-driven tests** by looping over an array to generate tests.
- **Environment-specific values and secrets** in env vars / \`.env\` (not committed), loaded in \`playwright.config.ts\`.

    // fixtures.ts
    export const test = base.extend<{ product: { id: string; name: string } }>({
      product: async ({ request }, use) => {
        const name = 'Test product ' + crypto.randomUUID().slice(0, 8);
        const res = await request.post('/api/products', { data: { name, price: 10 } });
        const product = await res.json();
        await use(product);
        await request.delete('/api/products/' + product.id);
      },
    });

    // data-driven
    for (const c of [{ user: 'locked_out_user', msg: /locked out/ }, { user: 'bad', msg: /do not match/ }]) {
      test('login error for ' + c.user, async ({ page }) => { /* ... */ });
    }

Avoid: tests depending on data created by earlier tests, and shared accounts mutated by many workers.`,
    followUps: [
      {
        q: 'Where would you keep test users for different roles?',
        a: 'Credentials in CI secrets/env vars; a setup project logs each role in once and saves storageState files that tests select with test.use({ storageState }).',
      },
    ],
    topic: 'pw-pom-data',
    source: KPMG,
  },

  // ---------------- Fivetran ----------------
  {
    id: 'co-automation-fivetran-1',
    company: 'Fivetran',
    area: 'automation',
    role: 'Senior SDET',
    round: 'Round 3 (technical)',
    difficulty: 'hard',
    question: 'How do you handle API authentication inside an automation framework?',
    answer: `Authenticate **once**, reuse the token, keep secrets out of code, and refresh when needed.

- **Where secrets live**: CI secret store / vault → env vars; never in the repo or reports.
- **How to obtain**: call the auth endpoint (OAuth client-credentials, login API) in a worker-scoped fixture or setup project; cache the token for the worker.
- **How to attach**: \`extraHTTPHeaders\` on a dedicated \`APIRequestContext\`, or cookies via \`storageState\` for session auth.
- **Expiry**: read \`expires_in\`; refresh proactively or retry once on 401.
- **Roles**: one context per role (admin, viewer) to test authorisation, plus negative tests (no token, expired token, wrong scope → 401/403).

    import { test as base, request, type APIRequestContext } from '@playwright/test';

    export const test = base.extend<{}, { api: APIRequestContext }>({
      api: [async ({}, use) => {
        const auth = await request.newContext({ baseURL: process.env.API_URL });
        const res = await auth.post('/oauth/token', {
          form: { grant_type: 'client_credentials', client_id: process.env.CLIENT_ID!, client_secret: process.env.CLIENT_SECRET! },
        });
        const { access_token } = await res.json();
        const api = await request.newContext({
          baseURL: process.env.API_URL,
          extraHTTPHeaders: { Authorization: 'Bearer ' + access_token },
        });
        await use(api);
        await api.dispose();
        await auth.dispose();
      }, { scope: 'worker' }],
    });

Also mask tokens in logs and traces.`,
    followUps: [
      {
        q: 'How do you share auth between UI and API tests?',
        a: 'Log in once in a setup project, save storageState, and create both browser contexts and request contexts from that file so cookies are shared.',
      },
    ],
    topic: 'pw-auth-config',
    source: FIVETRAN,
  },
  {
    id: 'co-automation-fivetran-2',
    company: 'Fivetran',
    area: 'automation',
    role: 'Senior SDET',
    round: 'Round 3 (technical)',
    difficulty: 'hard',
    question: 'How would you enhance an existing framework to support parallel testing?',
    answer: `Parallel is easy to switch on and hard to make reliable. Steps:

1. **Audit shared state** — static/global variables, singletons holding the driver/page, shared files, shared accounts and data, tests that rely on order.
2. **Make each test independent** — its own browser context (Playwright does this by default), its own data created via API with unique values, cleanup in fixture teardown.
3. **Per-worker resources** — worker-scoped fixtures for accounts/tokens; use \`testInfo.parallelIndex\` to pick account N from a pool.
4. **Turn it on gradually** — \`fullyParallel: true\`, raise \`workers\`; mark genuinely sequential flows with \`test.describe.configure({ mode: 'serial' })\`.
5. **Scale out** — \`--shard=i/n\` on several CI machines, blob reports merged at the end.
6. **Verify** — run with \`--repeat-each\` and high worker counts to flush out collisions; watch the flaky list.

    // playwright.config.ts
    export default defineConfig({ fullyParallel: true, workers: process.env.CI ? '50%' : undefined });

    // per-worker account
    const user = accounts[test.info().parallelIndex % accounts.length];

In Selenium/TestNG the same audit applies, plus \`ThreadLocal<WebDriver>\` and \`parallel="methods"\` — Playwright removes the thread-safety part because each worker is a separate process.`,
    followUps: [
      {
        q: 'Why are Playwright workers processes rather than threads?',
        a: 'Process isolation means no shared memory between tests, so static state cannot leak across parallel tests; each worker has its own browser.',
      },
    ],
    topic: 'pw-hooks-fixtures',
    source: FIVETRAN,
  },

  // ---------------- Impelsys ----------------
  {
    id: 'co-automation-impelsys-1',
    company: 'Impelsys',
    area: 'automation',
    role: 'Senior Test Automation Engineer / SDET',
    round: 'First round',
    difficulty: 'medium',
    question:
      'Some elements on a page work in a few runs and fail in others. What is the likely reason, and how do you handle it?',
    answer: `Intermittent failures on the same element almost always mean **the test is racing the page**:

- the element is not rendered yet, still animating, or covered by a spinner/overlay;
- the DOM re-renders after data loads, so an earlier reference is stale;
- the locator matches different elements depending on load order;
- data or environment differs between runs.

**Handling (Playwright)**:
- rely on auto-waiting actions and **web-first assertions** instead of sleeps or one-time reads;
- wait for the real signal — the API response or the spinner disappearing;
- use unique, semantic locators (strict mode tells you when they are ambiguous);
- reproduce with \`--repeat-each\` and inspect the trace.

    const loaded = page.waitForResponse((r) => r.url().includes('/api/items') && r.ok());
    await page.goto('/items');
    await loaded;
    await expect(page.getByTestId('spinner')).toBeHidden();
    await page.getByRole('button', { name: 'Add item' }).click();

Selenium equivalent: explicit \`WebDriverWait\` with \`elementToBeClickable\`, re-locating elements after re-render, and waiting for overlays to vanish.`,
    followUps: [
      {
        q: 'Is increasing the timeout a fix?',
        a: 'Rarely. It hides slowness and makes failures slower. Wait for the right condition instead; raise a timeout only for a known slow operation, locally.',
      },
    ],
    topic: 'pw-debug-flaky',
    source: IMPELSYS,
  },
  {
    id: 'co-automation-impelsys-2',
    company: 'Impelsys',
    area: 'automation',
    role: 'Senior Test Automation Engineer / SDET',
    round: 'First round',
    difficulty: 'medium',
    question: 'How many kinds of locators exist, why is ID usually preferred, and which is better: XPath or CSS?',
    answer: `**Selenium's 8 locators**: id, name, className, tagName, linkText, partialLinkText, cssSelector, xpath.

**Why ID**: unique per page (by spec), fast lookup, short and readable — *if* it is stable. Generated IDs (\`input-4821\`) are worse than useless.

**XPath vs CSS**:
- CSS: faster in most browsers, shorter, works through shadow DOM in Playwright; cannot select by text or walk up to a parent.
- XPath: can match text and traverse in any direction (\`ancestor::\`, \`following-sibling::\`), but is longer and more brittle when tied to structure.
- Rule: CSS for attribute matches, XPath only for relationships CSS cannot express.

**Playwright's answer** goes further — prefer locators that describe what the user sees, which survive refactors:

    page.getByRole('button', { name: 'Submit' });
    page.getByLabel('Email');
    page.getByText('Order placed');
    page.getByTestId('cart-count');           // agreed test id
    page.locator('#email');                   // CSS when needed
    page.locator('xpath=//td[.="Alice"]/..'); // XPath as last resort

And ask developers for \`data-testid\` where there is no accessible name.`,
    followUps: [
      {
        q: 'Why is getByRole recommended first in Playwright?',
        a: 'It matches how users and assistive tech perceive the page, ignores styling/structure changes, and failing to find an element by role can reveal an accessibility bug.',
      },
    ],
    topic: 'pw-locators',
    source: IMPELSYS,
  },
  {
    id: 'co-automation-impelsys-3',
    company: 'Impelsys',
    area: 'automation',
    role: 'Senior Test Automation Engineer / SDET',
    round: 'First round',
    difficulty: 'medium',
    question: 'Some elements on the page are dynamic (changing IDs, text or position). How do you locate and handle them?',
    answer: `Anchor on what **does not change** and wait for the state you need.

1. **Stable attributes**: role + accessible name, label, placeholder, \`data-testid\`; avoid generated IDs and index-based paths.
2. **Partial matches** when part of a value is stable: \`[id^="order-"]\`, \`[class*="price"]\`, regex names \`getByRole('row', { name: /Order #\\d+/ })\`.
3. **Relative to a stable anchor**: find the card/row by its text, then the element inside it.
4. **Dynamic text/values**: assert with regex or extract and compare, not exact strings.
5. **Timing**: auto-waiting actions and retrying assertions handle elements that appear/disappear.

    const row = page.getByRole('row').filter({ hasText: 'Alice' });
    await row.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByTestId('order-id')).toHaveText(/^ORD-\\d{6}$/);

    const card = page.getByTestId('product-card').filter({ has: page.getByRole('heading', { name: 'Backpack' }) });
    await card.getByRole('button', { name: /add to cart/i }).click();

If nothing stable exists, that is a testability issue — ask for test IDs instead of building fragile XPath.`,
    followUps: [
      {
        q: 'How do you click the third item of a list that keeps reordering?',
        a: 'Do not use the index; identify the item by its content (filter hasText/has) so the test picks the same logical item regardless of order.',
      },
    ],
    topic: 'pw-locators',
    source: IMPELSYS,
  },

  // ---------------- Citi ----------------
  {
    id: 'co-automation-citi-1',
    company: 'Citi',
    area: 'automation',
    role: 'Sr QA Automation Engineer (AVP)',
    round: 'Round 2 (face to face)',
    difficulty: 'hard',
    question: 'How would you approach creating an automation framework from scratch, and how would you maintain it over time?',
    answer: `**Creation**
1. **Understand needs**: app type (web/API/mobile), team language, browsers, CI, regulatory/audit needs (traces, evidence).
2. **Pick the stack** with a short proof of concept: e.g. Playwright Test + TypeScript, API via the \`request\` fixture, HTML/JUnit reporting.
3. **Skeleton**: \`tests/\`, \`pages/\`, \`fixtures/\`, \`api/\`, \`data/\`, \`playwright.config.ts\` with env-driven \`baseURL\`, auth setup project with \`storageState\`, lint + Prettier + type checks.
4. **First slice**: automate 5–10 smoke tests end to end, wire into CI on pull requests, publish reports — prove value early.
5. **Document conventions**: locator priority, no hard waits, one assertion focus per test, naming, tagging.

**Maintenance**
- Code review for test code like product code; shared helpers owned by the team.
- Flaky-test process: retries only in CI, quarantine with tickets, weekly review of the flaky list.
- Keep dependencies current (Playwright upgrades monthly, pinned Docker image).
- Remove obsolete tests; measure suite time and parallelise/shard.
- Testability asks to developers (\`data-testid\`, test APIs, seed endpoints).
- Metrics: pass rate, flaky rate, duration, defects caught.`,
    followUps: [
      {
        q: 'How do you get developers to contribute to the framework?',
        a: 'Keep it in the same repo and language as the app, make tests easy to run locally, review together, and have PR checks run the relevant tests.',
      },
    ],
    topic: 'pw-pom-data',
    source: CITI,
  },

  // ---------------- Amazon ----------------
  {
    id: 'co-automation-amazon-1',
    company: 'Amazon',
    area: 'automation',
    role: 'QAE-1',
    round: '2nd round',
    difficulty: 'easy',
    question: 'Write an automation script for a login page.',
    answer: `Show positive and negative cases, stable locators and real assertions, not just clicks.

    import { test, expect } from '@playwright/test';

    test.describe('login', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');
      });

      test('valid credentials open the inventory', async ({ page }) => {
        await page.getByPlaceholder('Username').fill('standard_user');
        await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD ?? 'secret_sauce');
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).toHaveURL(/inventory/);
        await expect(page.getByText('Products')).toBeVisible();
      });

      const negatives = [
        { user: 'standard_user', pass: 'wrong', error: /do not match/ },
        { user: 'locked_out_user', pass: 'secret_sauce', error: /locked out/ },
        { user: '', pass: '', error: /Username is required/ },
      ];
      for (const n of negatives) {
        test('shows an error for "' + n.user + '"', async ({ page }) => {
          await page.getByPlaceholder('Username').fill(n.user);
          await page.getByPlaceholder('Password').fill(n.pass);
          await page.getByRole('button', { name: 'Login' }).click();
          await expect(page.locator('[data-test="error"]')).toHaveText(n.error);
        });
      }
    });

Mention what you would add in a real framework: a \`LoginPage\` object, credentials from env vars, and saving \`storageState\` so other tests skip the UI login.`,
    followUps: [
      {
        q: 'Which login cases would you not automate in the UI?',
        a: 'Most validation permutations and lockout thresholds belong in API/unit tests; keep a few UI cases for the user-visible flow and messages.',
      },
    ],
    topic: 'pw-actions',
    source: AMAZON,
  },

  // ---------------- Airbus ----------------
  {
    id: 'co-automation-airbus-1',
    company: 'Airbus',
    area: 'automation',
    role: 'Software Test Engineer Intern (Automation)',
    round: 'Round 1 (technical)',
    difficulty: 'easy',
    question: 'How do you handle lag and dynamic elements, and what is the difference between implicit and explicit waits?',
    answer: `**Implicit wait** (Selenium): one global timeout applied to every \`findElement\`; it only waits for *presence* in the DOM, not for visibility or clickability.

**Explicit wait**: waits for a *specific condition* on a specific element, e.g. \`wait.until(ExpectedConditions.elementToBeClickable(btn))\`. Preferred, because the condition matches what you are about to do. Do not mix the two.

**Handling lag in Playwright** — most of this is built in:
- actions auto-wait until the element is attached, visible, stable, enabled and not covered;
- assertions retry until they pass or time out;
- for background work, wait for the network response or the loader to disappear.

    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByTestId('loader')).toBeHidden();
    await expect(page.getByRole('listitem')).toHaveCount(10);

Timeouts are configurable (\`actionTimeout\`, \`navigationTimeout\`, \`expect.timeout\`). Never use \`page.waitForTimeout(3000)\` as a fix: it is slow when the app is fast and still fails when the app is slower.`,
    followUps: [
      {
        q: 'What does Playwright check before clicking?',
        a: 'That the element is attached, visible, stable (not animating), enabled, and receives events (not covered by another element); it scrolls it into view too.',
      },
    ],
    topic: 'pw-assertions-waiting',
    source: AIRBUS,
  },
];
