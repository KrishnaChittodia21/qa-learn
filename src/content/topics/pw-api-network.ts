import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-api-network',
  phase: 'pw-framework',
  order: 5,
  title: 'API Testing & Network Control in Playwright',
  subtitle:
    'Use the request fixture to test APIs and set up data fast, then take control of the browser\'s network with page.route, waitForResponse and HAR replay.',
  estimatedMinutes: 95,
  sources: [
    'Playwright docs — API testing (playwright.dev/docs/api-testing)',
    'Playwright docs — Mock APIs (playwright.dev/docs/mock)',
    'Playwright docs — Network (playwright.dev/docs/network)',
    'Playwright docs — APIRequestContext, APIResponse, Route, APIResponseAssertions (API reference)',
    'Playwright docs — Authentication (playwright.dev/docs/auth)',
    'Restful Booker API docs (restful-booker.herokuapp.com/apidoc) and live behaviour checked with curl',
    'Debbie O\'Brien / Playwright team — API mocking demo (demo.playwright.dev/api-mocking)',
    'Playwright interview question roundups 2025 (InterviewBit, bug0 knowledge base, DEV Community)',
  ],
  tags: ['api-testing', 'request-fixture', 'APIRequestContext', 'restful-booker', 'page.route', 'mocking', 'waitForResponse', 'har', 'test-data'],
  cheatSheet: [
    '`request` fixture = an APIRequestContext that reads `baseURL`, `extraHTTPHeaders`, `httpCredentials` and `proxy` from config `use`. No browser needed.',
    '`page.request` / `context.request` share cookies with the browser context; `playwright.request.newContext()` is isolated and must be `dispose()`d.',
    'Calls: `request.get/post/put/patch/delete/fetch(url, { data, params, headers, form, multipart })`; `data` objects are sent as JSON.',
    'Assert: `await expect(res).toBeOK()` (2xx), `res.status()`, `await res.json()`, `res.headers()`; use `toMatchObject` / `expect.any(Number)` for partial bodies.',
    'Restful Booker: `POST /auth` → `{ token }`; write calls need `Cookie: token=<t>` or Basic auth; create returns 200 + `bookingid`; DELETE returns **201**; bad login returns **200** with `reason`.',
    'API for setup, UI for the behaviour under test: create data via API in a fixture, assert in the browser, clean up via API after `use()`.',
    '`page.route(glob, handler)` must be registered **before** the request fires; handlers choose `fulfill` (fake response), `abort` (network error), `continue` (send, maybe modified), `fallback` (next handler).',
    '`route.fetch()` + `route.fulfill({ response, json })` = patch a real response. Last-registered matching route runs first.',
    'Globs: `*` = no slash, `**` = anything, pattern must match the **whole URL**; use `**/api/booking*` style or a RegExp/predicate.',
    'Wait for a call: `const p = page.waitForResponse(...)` → trigger → `await p`. Never start waiting after the trigger.',
    '`page.routeFromHAR(file, { url, update })` replays recorded traffic; `update: true` records it; unmatched requests abort by default (`notFound`).',
    'Mocks prove UI behaviour, not integration. Keep at least a few un-mocked end-to-end tests plus API/contract tests against the real backend.',
  ],
  sections: [
    {
      heading: 'Why API and network control belong in a UI framework',
      body: `**Intuition:** clicking through five screens to create a booking just so you can test the "cancel" button is like walking up 20 floors to check one window. Take the lift (the API) to the right floor, then test the window by hand (the UI).

Playwright gives you two superpowers next to the browser:
1. **An HTTP client** (\`request\`) to call APIs directly: for API tests, and for fast, reliable setup/teardown of UI tests.
2. **Network interception** (\`page.route\`) to watch, block, change or fake any request the *browser* makes: for edge cases the real backend cannot easily produce (500 errors, empty lists, slow responses).

| Goal | Tool | Typical speed |
|---|---|---|
| Verify an endpoint's contract/status/body | \`request\` fixture | ~100–500 ms per call |
| Create test data for a UI test | \`request\` in a fixture | much faster than UI setup |
| Show the UI's error state | \`page.route\` + \`route.fulfill({ status: 500 })\` | instant, deterministic |
| Wait until the UI's call finished | \`page.waitForResponse\` | as fast as the app |
| Freeze a complex backend for demos/regression | \`page.routeFromHAR\` | instant |

**In interviews, say this:** "I use the API to put the system in a known state quickly and the UI only for the behaviour I'm actually testing; I mock the network to reach states the real backend can't reliably give me."`,
      diagram: `   test code
   |-- request.post('/booking') ------------------> real API (no browser)
   |
   '-- page.goto('/admin') --> browser --> page.route? --+--> fulfill (fake)
                                         (interceptor)   +--> abort   (error)
                                                         +--> continue --> real API`,
      keyPoints: [
        'request = direct HTTP client; page.route = interceptor for browser traffic.',
        'API setup removes slow, flaky UI steps that are not under test.',
        'Mocking reaches states the real backend cannot produce on demand.',
      ],
      source: 'Playwright docs — API testing; Network',
    },
    {
      heading: 'The request fixture and APIRequestContext',
      body: `**Intuition:** \`request\` is Postman inside your test runner: same assertions library, same reports, same CI job.

An **APIRequestContext** sends HTTP requests from Node (not from the page). There are three ways to get one:

| Way | Cookies | Lifetime | Use for |
|---|---|---|---|
| \`request\` fixture | its own jar | one test (auto-disposed) | API tests, setup in a test |
| \`page.request\` / \`context.request\` | **shared with the browser context** | the context | API calls that must reuse the browser's login cookies (and vice versa) |
| \`playwright.request.newContext({...})\` | isolated jar | until you \`dispose()\` | \`beforeAll\` setup, global setup, worker fixtures |

The \`request\` fixture reads config from \`use\`: \`baseURL\` (so you can call \`'/booking'\`), \`extraHTTPHeaders\` (e.g. \`Accept\`, an auth header), \`httpCredentials\`, \`proxy\`, \`ignoreHTTPSErrors\`.

Request options you will use most:
- \`data\`: object → sent as JSON with \`Content-Type: application/json\`.
- \`params\`: query string, e.g. \`{ firstname: 'Asha' }\` → \`?firstname=Asha\`.
- \`headers\`: per-call headers (merged with \`extraHTTPHeaders\`).
- \`form\` / \`multipart\`: form-encoded and file uploads.
- \`failOnStatusCode: true\`: throw automatically on non-2xx/3xx.

**Common mistake:** forgetting that \`request.post\` does **not** throw on 4xx/5xx by default. Without an assertion, a 500 passes silently.`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts: an API project for Restful Booker',
          code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'api',
      testMatch: /.*\\.api\\.spec\\.ts/,
      use: {
        baseURL: 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: {
          // Restful Booker answers 418 if Accept is not JSON-compatible
          Accept: 'application/json',
        },
      },
    },
    { name: 'chromium', testIgnore: /.*\\.api\\.spec\\.ts/, use: { browserName: 'chromium' } },
  ],
});`,
        },
      ],
      keyPoints: [
        'request fixture inherits baseURL and extraHTTPHeaders from config.',
        'page.request shares cookies with the page; newContext is isolated.',
        'Non-2xx responses do not throw unless you assert or set failOnStatusCode.',
      ],
      source: 'Playwright docs — API testing; APIRequestContext reference',
    },
    {
      heading: 'CRUD on Restful Booker with Playwright',
      body: `**Intuition:** a full create → read → update → delete cycle is the "hello world" of API automation. Restful Booker is a deliberately quirky practice API, so it also teaches you to assert what the API *really* does.

**Endpoints you need:**
| Call | Auth | Success | Notes |
|---|---|---|---|
| \`POST /auth\` \`{ username, password }\` | none | 200 \`{ token }\` | wrong password → **200** \`{ reason: 'Bad credentials' }\` (quirk) |
| \`POST /booking\` | none | **200** \`{ bookingid, booking }\` | not 201 |
| \`GET /booking/:id\` | none | 200 booking | 404 when missing |
| \`GET /booking?firstname=…\` | none | 200 \`[{ bookingid }]\` | filters |
| \`PUT /booking/:id\` | token cookie or Basic | 200 full booking | all fields required |
| \`PATCH /booking/:id\` | token cookie or Basic | 200 | partial update |
| \`DELETE /booking/:id\` | token cookie or Basic | **201** | 403 without auth |

Default admin credentials are \`admin\` / \`password123\`. Write calls take the token as a **cookie**: \`Cookie: token=<value>\`.

**Worked example:** the test below performs the whole lifecycle in one test, using \`test.step\` so the report shows which step broke. Each run uses a unique first name, so parallel runs never collide.`,
      code: [
        {
          language: 'typescript',
          title: 'tests/booking.api.spec.ts',
          code: `import { test, expect } from '@playwright/test';

test('booking lifecycle: create, read, update, delete', async ({ request }) => {
  const firstname = \`Asha\${Date.now()}\`; // unique per run
  let token = '';
  let id = 0;

  await test.step('get a token', async () => {
    const res = await request.post('/auth', {
      data: { username: process.env.BOOKER_USER, password: process.env.BOOKER_PASS },
    });
    await expect(res).toBeOK();
    token = (await res.json()).token;
    expect(token, 'login returned a token').toBeTruthy(); // bad creds still give 200
  });

  await test.step('create', async () => {
    const res = await request.post('/booking', {
      data: {
        firstname, lastname: 'Rao', totalprice: 150, depositpaid: true,
        bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' },
        additionalneeds: 'Breakfast',
      },
    });
    await expect(res).toBeOK();
    const body = await res.json();
    expect(body.booking).toMatchObject({ firstname, totalprice: 150 });
    id = body.bookingid;
  });

  await test.step('partial update', async () => {
    const res = await request.patch(\`/booking/\${id}\`, {
      headers: { Cookie: \`token=\${token}\` },
      data: { totalprice: 175 },
    });
    expect((await res.json()).totalprice).toBe(175);
  });

  await test.step('delete and verify', async () => {
    const del = await request.delete(\`/booking/\${id}\`, { headers: { Cookie: \`token=\${token}\` } });
    expect(del.status()).toBe(201); // Restful Booker quirk
    expect((await request.get(\`/booking/\${id}\`)).status()).toBe(404);
  });
});`,
        },
      ],
      keyPoints: [
        'Assert actual behaviour: create = 200, delete = 201, bad login = 200 with reason.',
        'Token goes in a cookie header for PUT/PATCH/DELETE.',
        'Unique data per run keeps parallel tests independent.',
      ],
      source: 'Restful Booker API docs; verified against the live API (Oct 2026)',
    },
    {
      heading: 'Asserting API responses',
      body: `**Intuition:** a good API assertion checks the envelope (status, headers), the shape (fields and types) and the meaning (values), in that order, so the first failure tells you what went wrong.

| What | How | Note |
|---|---|---|
| Any 2xx | \`await expect(res).toBeOK()\` | prints the response body on failure |
| Exact status | \`expect(res.status()).toBe(201)\` | \`status()\` is synchronous |
| Header | \`expect(res.headers()['content-type']).toContain('application/json')\` | header names are lower-case |
| Exact body | \`expect(await res.json()).toEqual({...})\` | brittle if server adds fields |
| Partial body | \`expect(body).toMatchObject({ firstname: 'Asha' })\` | ignores extra fields |
| Types | \`expect(body).toEqual({ bookingid: expect.any(Number), booking: expect.any(Object) })\` | shape check |
| Array content | \`expect(list).toContainEqual({ bookingid: id })\` | element match |
| Eventual value | \`await expect.poll(async () => (await request.get(url)).status()).toBe(404)\` | async backends |

\`res.json()\`, \`res.text()\` and \`res.body()\` return promises: always \`await\` them. \`res.ok()\` returns a boolean, which is fine for \`if\` logic but gives a poor message as an assertion; prefer \`toBeOK()\`.

**For schema validation** (all required fields, types, formats), teams add a JSON-schema library such as Ajv or a Zod schema; Playwright itself has no built-in schema assertion.

**Negative tests matter as much as positive ones:** missing auth → 403, unknown id → 404, invalid body → error code. On Restful Booker, a POST with missing fields returns **500** rather than a clean 400: a real finding you would report.`,
      code: [
        {
          language: 'typescript',
          title: 'Negative API checks on Restful Booker',
          code: `import { test, expect } from '@playwright/test';

test('update without a token is forbidden', async ({ request }) => {
  const res = await request.put('/booking/1', {
    data: { firstname: 'Hacker' },          // no Cookie / Authorization header
  });
  expect(res.status()).toBe(403);
});

test('unknown booking returns 404', async ({ request }) => {
  const res = await request.get('/booking/999999999');
  expect(res.status()).toBe(404);
});

test('wrong password does not issue a token', async ({ request }) => {
  const res = await request.post('/auth', { data: { username: 'admin', password: 'nope' } });
  const body = await res.json();
  expect(body).toEqual({ reason: 'Bad credentials' }); // status is 200 here!
  expect(body).not.toHaveProperty('token');
});`,
        },
      ],
      keyPoints: [
        'toBeOK() for 2xx with a helpful failure message.',
        'toMatchObject + expect.any for resilient body checks.',
        'Always test the unhappy paths: 401/403/404/validation.',
      ],
      source: 'Playwright docs — APIResponse, APIResponseAssertions, GenericAssertions',
    },
    {
      heading: 'Tokens and auth reuse for API calls',
      body: `**Intuition:** logging in for every single API call is like showing your passport at every shop in the airport. Get the boarding pass (token) once, then show it where needed.

**Options, from simplest to most scalable:**
1. **Per test:** call \`/auth\` at the start (fine for a handful of tests).
2. **Worker-scoped fixture:** log in once per worker and hand an authenticated context to every test in that worker. Fast and still isolated per worker.
3. **Config headers:** if the API uses a static key/Bearer token from a secret, put it in \`extraHTTPHeaders\` read from \`process.env\`.
4. **Shared with the browser:** call \`page.request\` or \`context.request\` after a UI login, and the browser's cookies are sent automatically. Or log in through an API context and save \`await apiContext.storageState({ path })\`, then start browser contexts with that \`storageState\`.

**Secrets:** never hard-code credentials. Read them from \`process.env\` (a local \`.env\` file via dotenv that is git-ignored; CI secrets in the pipeline).

**Token expiry:** a worker can live for many minutes; if tokens expire quickly, refresh in the fixture or create one per test.`,
      code: [
        {
          language: 'typescript',
          title: 'fixtures.ts: one authenticated API context per worker',
          code: `import { test as base, request, type APIRequestContext } from '@playwright/test';

type Workers = { bookerApi: APIRequestContext };

export const test = base.extend<{}, Workers>({
  bookerApi: [async ({}, use) => {
    const anon = await request.newContext({ baseURL: 'https://restful-booker.herokuapp.com' });
    const auth = await anon.post('/auth', {
      data: { username: process.env.BOOKER_USER, password: process.env.BOOKER_PASS },
    });
    const { token } = await auth.json();
    await anon.dispose();

    // every call from this context carries the token cookie and JSON headers
    const api = await request.newContext({
      baseURL: 'https://restful-booker.herokuapp.com',
      extraHTTPHeaders: { Cookie: \`token=\${token}\`, Accept: 'application/json' },
    });
    await use(api);
    await api.dispose(); // teardown after the worker finishes
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';`,
        },
      ],
      keyPoints: [
        'Worker-scoped fixture = one login per worker, reused by all its tests.',
        'context.request shares cookies with the browser; storageState bridges API → UI.',
        'Credentials come from env vars / CI secrets, never from source.',
      ],
      source: 'Playwright docs — API testing (reuse authentication state); Fixtures (worker scope); Authentication',
    },
    {
      heading: 'API setup for UI tests',
      body: `**Intuition:** the UI test should only click through the part of the journey it is *about*. Everything before that is scaffolding, and scaffolding goes up fastest via the API.

**Pattern: Arrange via API, Act + Assert via UI, Clean up via API.** Wrap it in a test-scoped fixture so setup and teardown are always paired, even when the test fails.

Why it matters:
- **Speed:** one POST (~300 ms) replaces 20–30 s of form filling.
- **Stability:** fewer UI steps = fewer places to flake, and failures point at the feature under test.
- **Isolation:** each test gets its own fresh record with a unique name; nothing is shared.
- **Clean environments:** teardown deletes what the test created, so shared staging does not fill up with junk.

**Also the other way round:** do the action in the UI, then **verify with the API** that the backend really stored it (e.g. after cancelling in the UI, \`GET /booking/:id\` returns 404). That catches "UI says success but nothing was saved" bugs.

**Watch out:** API setup skips the UI validation of the data you inserted. Keep at least one UI test that creates the record through the form, so the form itself stays covered.`,
      code: [
        {
          language: 'typescript',
          title: 'A booking fixture: created via API, removed after the test',
          code: `import { test as base, expect } from '@playwright/test';

type Booking = { id: number; firstname: string };

export const test = base.extend<{ booking: Booking }>({
  booking: async ({ request }, use) => {
    const firstname = \`UI\${Date.now()}\`;
    const res = await request.post('https://restful-booker.herokuapp.com/booking', {
      data: {
        firstname, lastname: 'Tester', totalprice: 99, depositpaid: false,
        bookingdates: { checkin: '2026-12-01', checkout: '2026-12-02' },
      },
    });
    await expect(res).toBeOK();
    const id = (await res.json()).bookingid;

    await use({ id, firstname }); // the test runs here

    // teardown runs even if the test failed
    await request.delete(\`https://restful-booker.herokuapp.com/booking/\${id}\`, {
      headers: { Authorization: \`Basic \${btoa(\`\${process.env.BOOKER_USER}:\${process.env.BOOKER_PASS}\`)}\` },
    });
  },
});

// usage: test('admin sees the booking', async ({ page, booking }) => { ... booking.firstname ... });`,
        },
      ],
      keyPoints: [
        'Arrange via API, act/assert via UI, clean up via API.',
        'Fixture teardown after use() always runs.',
        'Verify UI actions through the API to catch fake successes.',
      ],
      source: 'Playwright docs — API testing (prepare server state, check postconditions); Fixtures',
    },
    {
      heading: 'Mocking the network with page.route',
      body: `**Intuition:** \`page.route\` puts a receptionist between the browser and the internet. For every request matching your pattern, the receptionist can answer directly (**fulfill**), refuse it (**abort**), forward it, maybe with changes (**continue**), or pass it to the next receptionist (**fallback**).

**Rules that trip people up:**
- Register the route **before** the request happens (usually before \`page.goto\`).
- The pattern must match the **whole URL**: \`*\` does not cross \`/\`, \`**\` does, \`{a,b}\` lists options. \`'**/api/booking'\` will not match \`/api/booking?page=2\`; use \`'**/api/booking*'\` or a RegExp.
- If several routes match, the **last registered runs first**; it can call \`route.fallback()\` to hand over to earlier ones.
- \`page.route\` covers one page; \`context.route\` covers all pages in the context, including popups.
- Routing only sees **browser** traffic: it does not intercept your \`request\` fixture calls.
- Requests handled by a **service worker** are invisible to routing; set \`serviceWorkers: 'block'\` in \`use\` if the app registers one (e.g. MSW).
- Enabling routing disables the browser HTTP cache for that page.

| Handler call | What the app sees | Use it for |
|---|---|---|
| \`route.fulfill({ json })\` | a normal response you made up | empty lists, edge data, 500/503 pages |
| \`route.fulfill({ status: 500, body })\` | server error | error banners, retry UI |
| \`route.abort()\` | network failure (default code \`'failed'\`) | offline handling, block images/analytics |
| \`route.continue({ headers })\` | the real response | add a header, change method/URL |
| \`route.fetch()\` + \`fulfill({ response, json })\` | the real response, edited | one field changed (see next section) |`,
      code: [
        {
          language: 'typescript',
          title: 'Three UI states the real backend rarely gives you',
          code: `import { test, expect } from '@playwright/test';

const FRUITS = '*/**/api/v1/fruits';

test('shows the list from a mocked API', async ({ page }) => {
  await page.route(FRUITS, (route) => route.fulfill({ json: [{ name: 'Mango', id: 1 }] }));
  await page.goto('https://demo.playwright.dev/api-mocking');
  await expect(page.getByText('Mango')).toBeVisible();
});

test('handles an empty list', async ({ page }) => {
  await page.route(FRUITS, (route) => route.fulfill({ json: [] }));
  await page.goto('https://demo.playwright.dev/api-mocking');
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('page still loads when analytics and images are blocked', async ({ page }) => {
  // abort = network error; speeds tests up and removes third-party noise
  await page.route(/\\.(png|jpe?g|svg)$/, (route) => route.abort());
  await page.route('**/*analytics*/**', (route) => route.abort('blockedbyclient'));
  await page.goto('https://www.saucedemo.com');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});`,
        },
      ],
      diagram: `  browser request: GET https://demo.playwright.dev/api/v1/fruits
        |
        v
  routes checked newest -> oldest:  route #2 (**/api/**)  route #1 (**/*)
        |
        +-- fulfill  -> fake response, server never called
        +-- abort    -> request fails like a network error
        +-- continue -> goes to the real server (optionally modified)
        '-- fallback -> try the next (older) matching route`,
      keyPoints: [
        'Register before the request; patterns match the whole URL.',
        'fulfill fakes, abort fails, continue forwards, fallback delegates.',
        'Routing does not see request-fixture calls or service-worker traffic.',
      ],
      source: 'Playwright docs — Mock APIs; Network (glob patterns, service workers); Page.route reference',
    },
    {
      heading: 'Modifying real responses and requests',
      body: `**Intuition:** sometimes you want the real data with one detail changed: "everything as normal, but this user is a premium member" or "the stock count is 0". Fetch the real response, edit it, hand it to the browser.

**Response patching:** inside the handler, \`const response = await route.fetch()\` performs the real request, \`await response.json()\` reads it, you change a field and call \`route.fulfill({ response, json })\`. Status and headers stay real; only the body changes.

**Request modification:** \`route.continue({ headers, method, postData, url })\` sends a changed request. Typical uses: add a feature-flag header, strip a header to test a fallback, redirect to a staging host. Some headers (\`cookie\`, \`host\`, \`content-length\`) are controlled by the browser and cannot be overridden this way.

**Delays:** to test loading spinners, await a short timer inside the handler before \`continue\`/\`fulfill\`. This is the one place a timer is fine: you are simulating a slow server, not waiting for your app.

**Clean-up:** \`page.unroute(pattern)\` or \`page.unrouteAll({ behavior: 'ignoreErrors' })\` removes handlers mid-test (routes die with the page anyway).`,
      code: [
        {
          language: 'typescript',
          title: 'Patch a real response and simulate a slow server',
          code: `import { test, expect } from '@playwright/test';

test('adds a fruit to the real list', async ({ page }) => {
  await page.route('*/**/api/v1/fruits', async (route) => {
    const response = await route.fetch();        // real server call
    const json = await response.json();
    json.push({ name: 'Loquat', id: 100 });      // edit only what we need
    await route.fulfill({ response, json });     // real status + headers, patched body
  });
  await page.goto('https://demo.playwright.dev/api-mocking');
  await expect(page.getByText('Loquat', { exact: true })).toBeVisible();
});

test('spinner shows while the API is slow', async ({ page }) => {
  await page.route('**/api/bookings*', async (route) => {
    await new Promise((r) => setTimeout(r, 2_000)); // simulated latency
    await route.continue();
  });
  await page.goto('/admin/bookings');
  await expect(page.getByRole('progressbar')).toBeVisible();
  await expect(page.getByRole('progressbar')).toBeHidden({ timeout: 10_000 });
});`,
        },
      ],
      keyPoints: [
        'route.fetch() + fulfill({ response, json }) patches the body of a real response.',
        'route.continue({ headers, method, postData, url }) modifies the outgoing request.',
        'A delay inside a handler simulates a slow server; it is not a hard wait in the test.',
      ],
      source: 'Playwright docs — Mock APIs (modify API responses); Network (modify requests)',
    },
    {
      heading: 'Waiting for network: waitForResponse and waitForRequest',
      body: `**Intuition:** if you want to catch a ball, put your hands up *before* it is thrown.

\`page.waitForResponse(urlOrPredicate)\` returns a promise that resolves with the first matching \`Response\` **from the moment you call it**. If the response already happened, it waits for the next one, often forever (until the timeout). So:

1. create the promise,
2. perform the action that triggers the call,
3. \`await\` the promise.

The matcher can be a glob, a RegExp, or a predicate: \`(r) => r.url().includes('/api/booking') && r.request().method() === 'POST'\`. A predicate lets you match method and status and avoid catching an unrelated GET to the same URL.

\`page.waitForRequest\` works the same for outgoing requests, useful to assert **what the UI sent**: \`(await reqPromise).postDataJSON()\`.

**When to use it:** to assert the API call the UI made (payload, status), or when the UI gives no visible signal. **When not to:** if a visible result exists (a toast, a row), assert that with a web-first assertion; it is closer to what the user sees.

\`page.on('request' | 'response' | 'requestfailed', ...)\` lets you log or collect all traffic, e.g. fail the test if any \`/api/\` call returned 5xx.`,
      code: [
        {
          language: 'typescript',
          title: 'Assert both the request payload and the response',
          code: `import { test, expect } from '@playwright/test';

test('search sends the right query and renders results', async ({ page }) => {
  await page.goto('/bookings');

  const reqPromise = page.waitForRequest(
    (r) => r.url().includes('/api/bookings/search') && r.method() === 'POST',
  );
  const resPromise = page.waitForResponse(
    (r) => r.url().includes('/api/bookings/search') && r.status() === 200,
  );

  await page.getByLabel('Guest name').fill('Asha');
  await page.getByRole('button', { name: 'Search' }).click(); // trigger AFTER registering

  const req = await reqPromise;
  expect(req.postDataJSON()).toMatchObject({ firstname: 'Asha' });
  await resPromise;
  await expect(page.getByRole('row', { name: /Asha/ })).toBeVisible();
});`,
        },
      ],
      keyPoints: [
        'Register → trigger → await: the only safe order.',
        'Use predicates to match method/status, not just URL.',
        'Prefer a visible UI assertion when one exists.',
      ],
      source: 'Playwright docs — Network (waiting for responses, network events)',
    },
    {
      heading: 'HAR recording and replay',
      body: `**Intuition:** a HAR file is a tape recording of network traffic. Record it once against the real backend, then play the tape in every test run: same answers, no backend needed.

**HAR** (HTTP Archive) is a JSON format listing requests and responses. Playwright can:
- **Record** while testing: \`await page.routeFromHAR('hars/fruits.har', { url: '*/**/api/v1/fruits', update: true })\` runs against the real server and writes the HAR.
- **Replay**: the same call with \`update: false\` serves matching requests from the file. Matching uses URL and method (and POST body); unmatched requests are **aborted** by default (\`notFound: 'abort'\`), or sent to the network with \`notFound: 'fallback'\`.
- **Record from the CLI**: \`npx playwright open --save-har=example.har --save-har-glob="**/api/**" https://example.com\`.
- Extra options: \`updateContent: 'attach' | 'embed'\` and \`updateMode: 'minimal' | 'full'\`.

**Good for:** complex responses that are tedious to hand-write, demo/regression suites that must not depend on a shared staging DB, and reproducing a customer bug from a HAR captured in their browser (DevTools → Network → Save all as HAR).

**Risks:** HARs go stale when the API changes (tests pass against yesterday's contract) and can contain tokens/personal data, so scrub them and re-record on a schedule.`,
      code: [
        {
          language: 'typescript',
          title: 'Record once, replay forever (until you re-record)',
          code: `import { test, expect } from '@playwright/test';

// set RECORD_HAR=1 to refresh the tape against the real server
const update = !!process.env.RECORD_HAR;

test('fruit list from a recorded HAR', async ({ page }) => {
  await page.routeFromHAR('./hars/fruits.har', {
    url: '*/**/api/v1/fruits', // only API calls come from the tape
    update,
    notFound: 'abort',         // unmatched API calls fail loudly
  });
  await page.goto('https://demo.playwright.dev/api-mocking');
  await expect(page.getByText('Strawberry')).toBeVisible();
});`,
        },
      ],
      keyPoints: [
        'update: true records; update: false replays.',
        'Unmatched requests abort by default.',
        'Re-record regularly and scrub secrets from HARs.',
      ],
      source: 'Playwright docs — Mock APIs (HAR); Page.routeFromHAR reference',
    },
    {
      heading: 'Choosing a strategy: real, mocked, or hybrid',
      body: `**Intuition:** mocks are a flight simulator. Great for practising engine failures you could never safely trigger in a real plane, but you still need real flights before you get a licence.

| Test type | Backend | Catches | Misses |
|---|---|---|---|
| Full E2E | real | integration bugs, config, data | rare states; can be slow and flaky |
| UI + mocked API | \`page.route\`/HAR | UI logic, error/empty/edge states | API contract drift, backend bugs |
| API tests | real (request fixture) | status codes, validation, auth, data | UI rendering |
| Hybrid | real API setup + real UI, mock only 3rd parties | most things, stable | payment provider etc. (covered separately) |

**A sensible mix for a booking app:**
- a handful of **un-mocked smoke E2E** tests (login, create booking, cancel) on every deploy;
- **API tests** for every endpoint's happy and unhappy paths;
- **mocked UI tests** for error banners, empty states, slow responses, feature-flag variants;
- third-party services (payments, maps, analytics) **always mocked or aborted** in UI tests.

**Over-mocking warning:** if the backend renames \`totalprice\` to \`total_price\`, every mocked test stays green while production breaks. Counter it with API tests against the real service (or contract tests) and periodic HAR re-recording.

**In interviews, say this:** "I mock to reach states, not to avoid the backend. Every mocked UI behaviour has a matching real API test that keeps the mock honest."`,
      keyPoints: [
        'Mock for states, use the real backend for integration.',
        'Always mock/abort third parties in UI tests.',
        'Pair mocked UI tests with real API tests to catch contract drift.',
      ],
      source: 'Playwright docs — Mock APIs; Best Practices (avoid testing third-party dependencies)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-api-network-cc-1',
      title: 'Replace slow UI setup with API setup and a network mock',
      context:
        'Your team\'s admin app (`baseURL` in config) lists bookings from `GET /api/bookings` and can cancel one with `DELETE /api/bookings/:id`; the backend has the same data model as Restful Booker and a `POST /api/bookings` endpoint. The suite below takes 70 s, fails when staging is slow, and the "error banner" test cannot really check anything.',
      task: 'Rewrite both tests so data is created and removed via the API, the cancel test verifies the backend too, and the error-banner test forces a server error deterministically.',
      starter: {
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test';

test('cancel a booking', async ({ page }) => {
  // setup through the UI (about 25 seconds)
  await page.goto('/admin/bookings/new');
  await page.locator('#fname').fill('Asha');
  await page.locator('#lname').fill('Rao');
  await page.locator('#price').fill('150');
  await page.locator('#checkin').fill('2026-11-01');
  await page.locator('#checkout').fill('2026-11-03');
  await page.locator('button.btn-primary').click();
  await page.waitForTimeout(3000);

  await page.goto('/admin/bookings');
  await page.locator('tr:has-text("Asha") >> text=Cancel').click();
  await page.waitForTimeout(2000);
  expect(await page.locator('tr:has-text("Asha")').count()).toBe(0);
});

test('shows an error banner when the API fails', async ({ page }) => {
  await page.goto('/admin/bookings');
  // hope staging is down?
  if (await page.getByRole('alert').isVisible()) {
    await expect(page.getByRole('alert')).toContainText('try again');
  }
});`,
      },
      hints: [
        'The `request` fixture shares `baseURL` with the page; a fixture can create a booking with a unique name and delete it after `use()`.',
        'After clicking Cancel in the UI, a `GET` for that id tells you whether the backend really removed it.',
        'For the banner, register a route for `**/api/bookings*` that fulfills with status 500 before navigating.',
      ],
      solution: {
        language: 'typescript',
        code: `import { test as base, expect } from '@playwright/test';

type Booking = { id: number; firstname: string };

const test = base.extend<{ booking: Booking }>({
  booking: async ({ request }, use) => {
    const firstname = \`Asha\${Date.now()}\`;
    const res = await request.post('/api/bookings', {
      data: {
        firstname, lastname: 'Rao', totalprice: 150, depositpaid: true,
        bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' },
      },
    });
    await expect(res).toBeOK();
    const id: number = (await res.json()).bookingid;
    await use({ id, firstname });
    await request.delete(\`/api/bookings/\${id}\`); // no-op if the test already cancelled it
  },
});

test('cancel a booking', async ({ page, request, booking }) => {
  await page.goto('/admin/bookings');
  const row = page.getByRole('row', { name: new RegExp(booking.firstname) });
  await row.getByRole('button', { name: 'Cancel' }).click();

  await expect(row).toHaveCount(0);                                      // UI updated
  expect((await request.get(\`/api/bookings/\${booking.id}\`)).status()).toBe(404); // backend too
});

test('shows an error banner when the API fails', async ({ page }) => {
  await page.route('**/api/bookings*', (route) =>
    route.fulfill({ status: 500, json: { error: 'Internal Server Error' } }),
  );
  await page.goto('/admin/bookings');
  await expect(page.getByRole('alert')).toContainText('try again');
});`,
      },
      explanation: `**Fixes:**
- **API setup in a fixture:** one POST replaces ~25 s of form filling and the brittle \`#fname\`/\`.btn-primary\` locators. The unique \`firstname\` keeps parallel runs from colliding, and teardown after \`use()\` always deletes the record.
- **Role-based row locator** replaces the chained CSS/text selector; \`toHaveCount(0)\` retries instead of a sleep plus \`count()\`.
- **Backend verification:** the GET returning 404 proves the cancel was persisted, not just hidden in the UI.
- **Deterministic error state:** \`page.route\` + \`fulfill({ status: 500 })\` produces the failure every time. The old \`if (isVisible())\` test passed without checking anything.
- **Hard waits removed** everywhere.
- The form itself still needs coverage: keep one separate UI test that creates a booking through the form.`,
      followUps: [
        {
          q: 'The route pattern is `**/api/bookings*`. Would it also intercept the fixture\'s POST and DELETE?',
          a: 'No. `page.route` only intercepts requests made by the browser page. The `request` fixture sends HTTP from Node through its own APIRequestContext, so setup and teardown hit the real backend even while the page sees mocked 500s. That separation is exactly what you want here.',
        },
        {
          q: 'How would you test that the UI retries after the error?',
          a: 'Make the handler stateful: count calls, fulfill the first with 500 and call `route.continue()` (or fulfill with data) for the second. Then click "Try again" and assert the list appears. You can also assert the call count to prove exactly one retry happened.',
        },
      ],
    },
    {
      id: 'pw-api-network-cc-2',
      title: 'Harden a fragile Restful Booker API suite',
      context:
        'A junior engineer wrote these API tests. They pass on their machine on a good day, fail randomly in parallel, and once deleted a booking another team was using for a demo.',
      task: 'Find the bugs and smells (at least six) and rewrite the file as independent, secure, correctly-asserted tests.',
      starter: {
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test';

const BASE = 'https://restful-booker.herokuapp.com';
const TOKEN = 'abc123def456';           // copied from Postman last week
let bookingId: number;

test('create booking', async ({ request }) => {
  const res = await request.post(BASE + '/booking', {
    data: { firstname: 'John', lastname: 'Smith', totalprice: 100, depositpaid: true,
      bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' } },
  });
  expect(res.status()).toBe(201);
  bookingId = res.json().bookingid;
});

test('delete booking', async ({ request }) => {
  const res = await request.delete(BASE + '/booking/' + (bookingId ?? 1), {
    headers: { Cookie: 'token=' + TOKEN },
  });
  expect(res.ok()).toBeTruthy();
});`,
      },
      hints: [
        'What does `res.json()` return, and what does Restful Booker really return for create and delete?',
        'What happens to `bookingId` when the tests run in different workers, or when "delete" runs alone?',
        'Where should credentials and the base URL live, and how do you get a fresh token?',
      ],
      solution: {
        language: 'typescript',
        code: `import { test, expect, type APIRequestContext } from '@playwright/test';
// baseURL + Accept header come from the "api" project in playwright.config.ts

async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', {
    data: { username: process.env.BOOKER_USER, password: process.env.BOOKER_PASS },
  });
  await expect(res).toBeOK();
  const { token } = await res.json();
  expect(token, 'credentials accepted').toBeTruthy();
  return token;
}

async function createBooking(request: APIRequestContext) {
  const firstname = \`John\${Date.now()}\`;
  const res = await request.post('/booking', {
    data: { firstname, lastname: 'Smith', totalprice: 100, depositpaid: true,
      bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' } },
  });
  expect(res.status()).toBe(200); // Restful Booker returns 200, not 201
  const body = await res.json();
  expect(body).toMatchObject({ bookingid: expect.any(Number), booking: { firstname } });
  return body.bookingid as number;
}

test('create booking returns the stored data', async ({ request }) => {
  const id = await createBooking(request);
  const get = await request.get(\`/booking/\${id}\`);
  await expect(get).toBeOK();
});

test('delete booking removes it', async ({ request }) => {
  const id = await createBooking(request);           // own data, never id 1
  const token = await getToken(request);
  const del = await request.delete(\`/booking/\${id}\`, { headers: { Cookie: \`token=\${token}\` } });
  expect(del.status()).toBe(201);                    // documented quirk
  expect((await request.get(\`/booking/\${id}\`)).status()).toBe(404);
});`,
      },
      explanation: `**Bugs and smells fixed:**
1. **Missing \`await\` on \`res.json()\`**: it returns a promise, so \`bookingId\` was always \`undefined\`.
2. **Wrong expected status:** create returns 200 on Restful Booker; the test asserted 201 and failed for the wrong reason.
3. **Shared module variable + order dependence:** in parallel or alone, "delete" had no id and fell back to **booking 1**: someone else's data. Each test now creates its own booking.
4. **Hard-coded, stale token** in source: tokens expire and secrets don't belong in git. A fresh token is fetched with credentials from env vars.
5. **Weak assertion:** \`res.ok()\` + \`toBeTruthy()\` gives a useless failure message; now exact statuses and \`toBeOK()\`.
6. **No verification of the effect:** delete now checks the booking is really gone (404).
7. **Hard-coded base URL:** moved to the config project so environments can change without editing tests.`,
      followUps: [
        {
          q: 'Fetching a token in every delete test is wasteful. How would you scale this?',
          a: 'Move token creation into a worker-scoped fixture that logs in once per worker and exposes an APIRequestContext with the `Cookie: token=…` header pre-set via `extraHTTPHeaders`. Tests stay independent, but there is one login per worker instead of per test.',
        },
        {
          q: 'Restful Booker returns 200 for a wrong password. Is your assertion enough?',
          a: 'Checking only status would pass on bad credentials, so the helper also asserts the body contains a token. In a real project I would also raise this as a defect: authentication failures should return 401, and clients relying on status codes will misbehave.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-api-network-iq-01',
      difficulty: 'medium',
      question: 'Why would you create test data through the API instead of the UI in a Playwright suite? Are there downsides?',
      whatInterviewerLooksFor: [
        'Speed, stability and isolation arguments with numbers',
        'Knows the fixture pattern with teardown',
        'Acknowledges the form still needs UI coverage',
        'Mentions verifying UI actions through the API',
      ],
      modelAnswer: `**The UI test should only exercise the behaviour it is about.** If I am testing "cancel a booking", the booking form is scaffolding.

**Why API setup:**
- **Speed:** a \`POST /booking\` takes ~300 ms; filling the form takes 20–30 s. Across 200 tests that's over an hour of CI time saved.
- **Stability:** every UI step is a chance to flake (slow render, changed locator). Fewer steps → fewer false failures, and a failure points at the feature under test.
- **Isolation:** each test creates its own record with a unique name, so parallel workers never fight over shared data.
- **Clean environments:** a fixture deletes the record after \`use()\`, even when the test fails.

**How:** a test-scoped fixture using the \`request\` fixture (same \`baseURL\` as the page) that creates data, hands it to the test and deletes it afterwards. Login state works the same way: log in via API once and save \`storageState\`.

**Downsides and mitigations:**
- The form itself is no longer exercised by every test → keep **one dedicated UI test** that creates a booking through the form.
- API-inserted data may skip UI validation and create states a user could never reach → use realistic payloads.
- It requires a usable API and test credentials → work with developers to expose test endpoints or seed scripts.

I also use the API in the other direction: after a UI action, a \`GET\` confirms the backend persisted the change, catching "UI shows success but nothing saved" bugs.`,
      followUps: [
        {
          q: 'There is no public API for creating users. What do you do?',
          a: 'Options in order of preference: ask developers for a test-only endpoint or seed script available in non-prod environments; use a database seed through a fixture (with care and proper access); or create users once through the UI in a setup project and reuse them via storageState. I would avoid creating users through the UI in every test.',
        },
        {
          q: 'How do you make sure teardown happens when a test fails halfway?',
          a: 'Put creation and deletion in a fixture: code after `await use(...)` runs whether the test passed or failed. That is more reliable than afterEach with shared variables, and the dependency is visible in the test signature.',
        },
      ],
      pitfalls: [
        'Saying "API setup is always better" without mentioning form coverage.',
        'Creating data but never cleaning it up.',
        'Using the same record for every test.',
      ],
    },
    {
      id: 'pw-api-network-iq-02',
      difficulty: 'medium',
      question: 'Explain route.fulfill, route.abort, route.continue and route.fallback. Give a real use for each.',
      whatInterviewerLooksFor: [
        'Correct semantics for each call',
        'Concrete testing scenarios',
        'Knows ordering (last registered first) and registering before navigation',
        'Mentions route.fetch for patching',
      ],
      modelAnswer: `All four are ways a \`page.route\` / \`context.route\` handler decides what happens to an intercepted **browser** request. The handler must be registered before the request fires, usually before \`page.goto\`.

- **\`route.fulfill(options)\`**: answer it myself; the server is never called. Options: \`status\`, \`headers\`, \`contentType\`, \`body\`, \`json\`, \`path\` (file), or \`response\` (a real one to base it on). *Use:* return \`[]\` to test the empty-state message, or \`status: 500\` to test the error banner.
- **\`route.abort(errorCode?)\`**: fail the request like a network error (default \`'failed'\`; others like \`'timedout'\`, \`'blockedbyclient'\`). *Use:* block images/fonts/analytics to speed tests up, or test the offline / "could not connect" UI.
- **\`route.continue(overrides?)\`**: send it to the real server, optionally with changed \`headers\`, \`method\`, \`postData\` or \`url\`. *Use:* add a feature-flag header, or delay before continuing to see a spinner.
- **\`route.fallback(overrides?)\`**: pass to the next matching handler. Handlers run **last-registered first**, so a specific mock can handle \`POST\` and fall back to a general handler for everything else.

Bonus: **\`route.fetch()\`** performs the real request and returns the response, so \`fulfill({ response, json })\` can patch one field of real data.

Note: routing does not touch calls made by the \`request\` fixture; those go straight from Node.`,
      followUps: [
        {
          q: 'Your route never seems to fire. What do you check?',
          a: 'First, was it registered before the request happened (before goto or the click)? Second, does the glob match the full URL, including query strings (use `**/api/items*` or a RegExp)? Third, is a service worker handling the request (set `serviceWorkers: \'block\'`)? Finally, is the call made by the page and not by the request fixture, which routing never sees.',
        },
        {
          q: 'What is the difference between continue and fallback?',
          a: '`continue` sends the request to the network immediately, skipping any other handlers. `fallback` hands it to the next (older) matching handler, which may fulfill, abort or continue it. Use fallback when layering handlers, e.g. a test-specific override on top of a fixture\'s default mocks.',
        },
      ],
      pitfalls: [
        'Thinking route also intercepts request-fixture calls.',
        'Registering the route after page.goto.',
        'Confusing abort (network error) with fulfill status 500 (server error).',
      ],
    },
    {
      id: 'pw-api-network-iq-03',
      difficulty: 'easy',
      question: 'How would you test what the UI shows when the backend returns a 500 or takes ten seconds to respond?',
      whatInterviewerLooksFor: [
        'Uses page.route instead of waiting for staging to break',
        'Knows fulfill with status and delay in the handler',
        'Asserts user-visible behaviour',
        'Considers retry/timeout UI paths',
      ],
      modelAnswer: `I wouldn't wait for staging to break; I'd **create those conditions** with network interception so they're deterministic.

**500 error:**
1. Before navigating, register \`page.route('**/api/bookings*', route => route.fulfill({ status: 500, json: { error: 'boom' } }))\`.
2. Open the page.
3. Assert the user-facing result: \`await expect(page.getByRole('alert')).toContainText('Something went wrong')\`, a retry button is visible, and nothing crashes (I can also listen to \`page.on('pageerror')\`).

**Slow response:**
1. In the handler, \`await new Promise(r => setTimeout(r, 10_000))\` then \`route.continue()\` or \`fulfill\`.
2. Assert the loading state appears (spinner/skeleton), buttons are disabled to prevent double-submit, then that the data appears once the response comes. If the app has its own client timeout, assert the timeout message.

**Network failure:** \`route.abort('internetdisconnected')\` or \`'timedout'\` to test offline messaging.

**Extras:** a stateful handler (first call 500, second call real) tests the "Try again" flow. And I'd still have a real-backend smoke test for the happy path, because mocks only prove the UI's reaction, not that the server is healthy.`,
      followUps: [
        {
          q: 'Isn\'t the 10-second delay a hard wait, which you said is bad?',
          a: 'The delay is inside the fake server, simulating the system under test\'s environment; the test itself still waits with web-first assertions for observable states. A hard wait is bad when the test sleeps hoping the app is ready. Here, I could also shorten it to 2 seconds as long as it is long enough to observe the spinner.',
        },
        {
          q: 'How do you check that the error didn\'t throw an uncaught JavaScript exception?',
          a: 'Collect errors with `page.on(\'pageerror\', e => errors.push(e))` and assert `errors` is empty at the end, and optionally watch `console` messages of type error. That catches the case where the banner shows but the app is broken underneath.',
        },
      ],
      pitfalls: [
        'Waiting for a real outage or asking devs to break staging.',
        'Using route.abort when a 500 response was intended.',
        'Only asserting that "no data" appears instead of the specific error message.',
      ],
    },
    {
      id: 'pw-api-network-iq-04',
      difficulty: 'medium',
      question: 'Walk me through automating CRUD tests for the Restful Booker API in Playwright. What surprised you about the API?',
      whatInterviewerLooksFor: [
        'Correct endpoints and auth mechanism (token cookie / Basic)',
        'Independent tests with own data and cleanup',
        'Asserts real behaviour, notices quirks',
        'Positive and negative cases',
      ],
      modelAnswer: `**Setup:** an \`api\` project in \`playwright.config.ts\` with \`baseURL: 'https://restful-booker.herokuapp.com'\` and \`extraHTTPHeaders: { Accept: 'application/json' }\`. Credentials come from env vars.

**Flow:**
1. \`POST /auth\` with admin credentials → \`{ token }\`. I assert the token exists, not just the status.
2. \`POST /booking\` with firstname, lastname, totalprice, depositpaid, bookingdates and additionalneeds → \`{ bookingid, booking }\`. I check \`booking\` with \`toMatchObject\` and keep the id.
3. \`GET /booking/:id\` → same data.
4. \`PUT\` (full) and \`PATCH\` (partial) with \`Cookie: token=<token>\` → updated fields.
5. \`DELETE\` with the cookie → then \`GET\` returns 404.

Each test creates its own booking with a unique name, and I wrap steps in \`test.step\` so the report is readable. Token creation moves into a worker fixture once there are many tests.

**Negative cases:** update/delete without a token → 403; unknown id → 404; filters (\`?firstname=\`) return the created id.

**Surprises (quirks I assert and report):**
- Create returns **200**, not 201.
- DELETE returns **201 Created**.
- A wrong password returns **200** with \`{ reason: 'Bad credentials' }\`, so status-only checks pass on a failed login.
- A POST with missing required fields returns **500** instead of 400.
- Sending \`Accept: text/html\` gets **418 I'm a teapot**.

The point for an interviewer: I assert what the API actually does, and I log non-standard behaviour as defects rather than silently coding around it.`,
      followUps: [
        {
          q: 'Your tests pass but you notice the public API is shared with thousands of users. Any concerns?',
          a: 'Yes: data from other people can appear in list endpoints and the service resets periodically, so I never assume a list is empty or that id 1 exists. Every test creates and deletes its own booking, uses unique names, and filters by my own id. For a real project I would run against a dedicated environment.',
        },
        {
          q: 'How would you validate the full response schema?',
          a: 'Playwright has no schema assertion, so I would add Ajv (JSON Schema) or Zod, define the booking schema once, and assert `validate(body)` is true with readable errors. `toMatchObject` with `expect.any(Number)` covers simple shape checks without a library.',
        },
      ],
      pitfalls: [
        'Assuming standard REST status codes without checking.',
        'Hard-coding a booking id like 1.',
        'Putting the admin password directly in the test file.',
      ],
    },
    {
      id: 'pw-api-network-iq-05',
      difficulty: 'hard',
      question: 'Your test clicks Save and then waits for the API response, but it sometimes times out even though the network log shows the response arrived. Explain and fix.',
      whatInterviewerLooksFor: [
        'Identifies the race (listener created after the trigger)',
        'Knows the promise-first pattern',
        'Uses predicates to match the exact call',
        'Considers asserting the UI instead',
      ],
      modelAnswer: `**Cause:** the code is probably:

\`await page.getByRole('button', { name: 'Save' }).click();\`
\`const res = await page.waitForResponse('**/api/profile');\`

\`waitForResponse\` only sees responses that arrive **after** it is called. When the backend is fast, the response is already complete by the time the click resolves and the listener is attached, so the wait hangs until the timeout. On a slower environment it happens to work, which is why it's intermittent.

**Fix: register, trigger, await.**
\`const resPromise = page.waitForResponse(r => r.url().includes('/api/profile') && r.request().method() === 'PUT');\`
\`await page.getByRole('button', { name: 'Save' }).click();\`
\`const res = await resPromise;\`
\`await expect(res).toBeOK();\`

The **predicate** also guards against catching a different call to the same URL (e.g. a GET that refreshes the profile).

**Better still:** if the UI shows a result ("Profile saved" toast), assert that with \`toBeVisible()\`; web-first assertions retry and reflect what the user sees. I keep \`waitForResponse\` for when I need the payload or status, or when there is no visible signal.

The same "promise first" rule applies to \`waitForRequest\`, \`waitForEvent('download')\` and \`waitForEvent('popup')\`.`,
      followUps: [
        {
          q: 'Could you use Promise.all instead?',
          a: 'Yes: `const [res] = await Promise.all([page.waitForResponse(...), button.click()]);` starts both at once, so the listener is registered synchronously before the click resolves. The "promise variable first" style is equivalent and often easier for readers; both avoid the race.',
        },
        {
          q: 'What if two identical requests are fired and you need the second?',
          a: 'Use a predicate that distinguishes them (method, post body, query params), or register the wait after the first response has been consumed but before the action that triggers the second. Counting responses in a `page.on(\'response\')` listener is another option.',
        },
      ],
      pitfalls: [
        'Increasing the timeout.',
        'Adding a waitForTimeout before the click.',
        'Matching only by URL when several calls share it.',
      ],
    },
    {
      id: 'pw-api-network-iq-06',
      difficulty: 'expert',
      question: 'Mocking makes UI tests fast and stable, but how do you stop mocks from hiding real integration bugs?',
      context: 'The team has started mocking every API call in UI tests and is happy with a 100% green dashboard.',
      whatInterviewerLooksFor: [
        'Understands contract drift',
        'Proposes a layered strategy (real E2E smoke + API/contract tests)',
        'Keeps mock data close to reality (HAR, shared fixtures, schema validation)',
        'Mocks third parties but not your own critical paths everywhere',
      ],
      modelAnswer: `A 100% mocked suite only proves the UI reacts correctly **to the responses we imagined**. If the backend renames \`totalprice\` to \`total_price\`, every mocked test stays green while production breaks. That's contract drift.

**What I would put in place:**
1. **Real-backend smoke E2E**: a small set (login, create booking, pay, cancel) with no mocks except third parties, run on every deploy. These catch wiring, config and contract issues.
2. **API tests against the real service** using the \`request\` fixture: every endpoint, positive and negative, plus **schema validation** (Ajv/Zod) of the responses.
3. **Keep mocks honest:**
   - Generate mock payloads from the same schema or types the API tests validate, so a schema change breaks the mocks too.
   - Prefer \`route.fetch()\` + patch over fully invented bodies where possible: real structure, one changed field.
   - Re-record HAR files on a schedule (e.g. weekly job with \`update: true\`) and review the diff.
4. **Consumer-driven contract tests** (e.g. Pact) if frontend and backend are separate teams.
5. **Scope rules:** mock to reach states (errors, empty, slow, flags) and to remove third parties (payments, maps, analytics). Do not mock your own happy path in every test.

The dashboard should then show three layers: mocked UI behaviour, real API correctness, and a real end-to-end smoke. Green on all three is meaningful.`,
      followUps: [
        {
          q: 'How would you detect drift automatically between a HAR and the live API?',
          a: 'A scheduled job re-records the HAR with `update: true` against staging and commits it to a branch; a diff in the PR shows changed fields. Alternatively, validate both the HAR responses and live responses against the same JSON schema in tests, so any mismatch fails one of them.',
        },
        {
          q: 'Which external dependencies would you always mock?',
          a: 'Services you don\'t own and can\'t control: payment gateways, SMS/email providers, maps, analytics, ads, social logins. They are slow, rate-limited, may charge money, and failures there say nothing about your app. Their integration is tested separately with their sandbox environments.',
        },
      ],
      pitfalls: [
        'Claiming mocked tests are "end-to-end".',
        'Never re-recording HARs or updating mock data.',
        'Mocking everything or nothing, with no strategy.',
      ],
    },
    {
      id: 'pw-api-network-iq-07',
      difficulty: 'hard',
      question: 'How do you handle authentication tokens across hundreds of API tests without slowing down the suite or leaking secrets?',
      whatInterviewerLooksFor: [
        'Worker-scoped fixture or setup project',
        'extraHTTPHeaders / storageState mechanics',
        'Secrets from env/CI, git-ignored files',
        'Handles expiry and isolation',
      ],
      modelAnswer: `**Goal:** log in rarely, never commit secrets, and keep tests independent.

**Mechanics:**
- A **worker-scoped fixture** calls \`POST /auth\` once per worker using \`request.newContext()\`, then creates an authenticated APIRequestContext with \`extraHTTPHeaders\` (\`Authorization: Bearer …\` or \`Cookie: token=…\`). Every test in that worker receives it via \`use()\`, and it is disposed at the end.
- With 4 workers, that is 4 logins for the whole run instead of hundreds.
- For UI tests, a **setup project** logs in (via API is fastest) and saves \`storageState\` to \`playwright/.auth/user.json\`; browser projects declare it as a dependency and load that state. \`apiContext.storageState({ path })\` bridges an API login to the browser.

**Secrets:**
- Credentials come from \`process.env\`: a local \`.env\` loaded with dotenv and listed in \`.gitignore\`, and CI secrets (e.g. GitHub Actions \`secrets.BOOKER_PASS\`) injected as env vars.
- \`playwright/.auth\` is git-ignored because it contains live session cookies.
- Traces and HARs can contain tokens; keep artifact retention short.

**Expiry and roles:**
- If tokens live shorter than a worker, refresh inside the fixture (check expiry, re-login) or use test-scoped auth for those tests.
- Different roles (admin, guest) get separate fixtures/state files, so a test declares the role it needs.

**Isolation:** sharing a token is fine; sharing *data* is not. Each test still creates its own records.`,
      followUps: [
        {
          q: 'Why not log in once in globalSetup and write the token to a file?',
          a: 'You can, and it is the fewest logins. But setup projects are now recommended over globalSetup because they appear in the report, get traces, and can use fixtures. A token file also needs to be git-ignored and may expire in long runs. A worker fixture is simpler when only API tests need the token.',
        },
        {
          q: 'A test needs to verify that an expired token is rejected. How?',
          a: 'Don\'t use the shared fixture for it. Create a dedicated context with a deliberately invalid or expired token (or a token you revoke via a logout endpoint) and assert 401/403. Keeping this out of the shared fixture prevents breaking other tests.',
        },
      ],
      pitfalls: [
        'Hard-coding tokens or passwords in test files.',
        'Logging in before every request.',
        'Committing the .auth folder or .env file.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-api-network-drill-1',
      question:
        'For each scenario, choose `route.fulfill`, `route.abort`, `route.continue` (possibly modified) or `route.fetch` + `fulfill`, and say why: (a) show the "No bookings yet" empty state; (b) test the offline banner; (c) block Google Analytics and images to speed up tests; (d) add header `X-Feature-NewCheckout: on` to API calls; (e) make one real product appear out of stock while keeping the rest of the real catalogue; (f) see the loading skeleton for 2 seconds while still using real data.',
      assumptions: [
        'All calls are made by the browser page (not the request fixture).',
        'Routes are registered before navigation.',
      ],
      steps: [
        { label: '(a) empty state', calc: 'fulfill({ json: [] }) — we need a specific body the real DB may not have.' },
        { label: '(b) offline banner', calc: 'abort(\'internetdisconnected\') — the app must see a network failure, not an HTTP response.' },
        { label: '(c) analytics/images', calc: 'abort() — never reach the network; less noise, faster runs.' },
        { label: '(d) feature header', calc: 'continue({ headers: { ...route.request().headers(), \'x-feature-newcheckout\': \'on\' } }) — real server, modified request.' },
        { label: '(e) one item out of stock', calc: 'fetch() → edit json[i].stock = 0 → fulfill({ response, json }) — real data, one field patched.' },
        { label: '(f) slow but real', calc: 'await a 2s timer inside the handler, then continue() — real response, simulated latency.' },
      ],
      answer: `**fulfill** when you need a made-up response (a), **abort** when you need a network failure or want to block traffic (b, c), **continue** when the real server should answer, optionally with a modified request or added delay (d, f), and **fetch + fulfill** when you want real data with a small patch (e).`,
      insight: 'Ask two questions: "Should the real server be called?" and "Do I need to change the request, the response, or neither?" The answer picks the method.',
      followUps: [
        {
          q: 'For (a), why not test the empty state by deleting all bookings in staging?',
          a: 'It would destroy shared data, break other people\'s tests and be impossible to run in parallel. A mock produces the state instantly and only for this page, and the real "list with data" path is still covered by other tests.',
        },
      ],
    },
    {
      id: 'pw-api-network-drill-2',
      question:
        'A UI suite has 120 tests that each create a booking through a form (avg 24 s of setup) before the real test steps (avg 12 s). It runs on 3 browser projects with 4 workers. Estimate the wall-clock saving if setup moves to an API call that takes 0.6 s.',
      assumptions: [
        'Test executions = 120 tests × 3 projects = 360.',
        'Work spreads evenly across 4 workers.',
        'Ignore worker startup and report generation.',
      ],
      steps: [
        { label: 'Before, per test', calc: '24 s setup + 12 s steps = 36 s' },
        { label: 'Before, total', calc: '360 × 36 s = 12,960 s of work ÷ 4 workers = 3,240 s ≈ 54 min' },
        { label: 'After, per test', calc: '0.6 s + 12 s = 12.6 s' },
        { label: 'After, total', calc: '360 × 12.6 s = 4,536 s ÷ 4 = 1,134 s ≈ 19 min' },
        { label: 'Saving', calc: '54 − 19 ≈ 35 min per run (~65%)' },
        { label: 'Bonus: flake exposure', calc: '~10 fewer UI steps per test × 360 runs = 3,600 fewer chances to flake per run' },
      ],
      answer: `Roughly **54 min → 19 min**, saving about **35 minutes (≈65%)** per run, plus thousands fewer UI interactions that could flake. Keep 1–2 tests that still exercise the booking form through the UI.`,
      insight: 'Setup is often the majority of UI-test time. Moving it to the API is usually the single biggest speed-up available, bigger than adding workers.',
      followUps: [
        {
          q: 'Would adding 4 more workers give a similar saving?',
          a: 'Only if the machine has the CPU and memory: doubling workers on a 4-vCPU runner usually adds contention and flakiness rather than halving time. Even with ideal scaling, 8 workers take the old suite from 54 to 27 min, still slower than API setup at 4 workers, and the two improvements combine.',
        },
      ],
    },
    {
      id: 'pw-api-network-drill-3',
      question:
        'Which of these URLs does each route pattern intercept? Patterns: P1 `**/api/booking`, P2 `**/api/booking*`, P3 `**/api/*/items`, P4 `/\\/api\\/booking/` (RegExp). URLs: U1 `https://shop.test/api/booking`, U2 `https://shop.test/api/booking?page=2`, U3 `https://shop.test/api/booking/42`, U4 `https://shop.test/api/v2/cart/items`.',
      assumptions: [
        'Glob rules: `*` matches any characters except `/`; `**` matches any characters including `/`; the glob must match the whole URL.',
        'A RegExp matches if it is found anywhere in the URL.',
      ],
      steps: [
        { label: 'P1 **/api/booking', calc: 'U1 ✓. U2 ✗ (extra "?page=2"). U3 ✗ (extra "/42"). U4 ✗.' },
        { label: 'P2 **/api/booking*', calc: 'U1 ✓, U2 ✓ ("?page=2" has no slash). U3 ✗ ("/42" contains a slash). U4 ✗.' },
        { label: 'P3 **/api/*/items', calc: 'Single * cannot span "v2/cart" (contains "/") → U4 ✗. Others ✗.' },
        { label: 'P4 RegExp /\\/api\\/booking/', calc: 'U1 ✓, U2 ✓, U3 ✓ (substring match). U4 ✗.' },
        { label: 'Fix for U4', calc: 'Use **/api/**/items or a RegExp like /\\/api\\/.*\\/items$/' },
      ],
      answer: `P1 → U1 only. P2 → U1, U2. P3 → none (single \`*\` does not cross \`/\`). P4 → U1, U2, U3. The most common bug is P1: forgetting that query strings are part of the URL.`,
      insight: 'Globs must match the entire URL; `*` stops at slashes. When in doubt, use a RegExp or a predicate function and add a quick assertion that the route actually fired.',
      followUps: [
        {
          q: 'How can you confirm in a test that your mock was actually used?',
          a: 'Count calls in the handler (`let hits = 0; ... hits++`) and assert `expect(hits).toBeGreaterThan(0)` at the end, or assert on UI text that only the mock data contains, like a fake product name that does not exist in the real backend.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-api-network-mcq-01',
      difficulty: 'easy',
      question: 'A spec signs in through the UI and must then call a protected endpoint as that same signed-in shopper. Which object sends the browser session cookies automatically?',
      options: ['page.request', 'the request fixture', 'playwright.request.newContext()', 'Node\'s global fetch()'],
      correct: [0],
      explanation:
        '`page.request` (like `context.request`) shares the cookie jar of the browser context, so the login cookie goes with every call. The `request` fixture and `newContext()` each have their own isolated cookie jar, and plain `fetch()` knows nothing about the browser at all.',
      followUps: [
        {
          q: 'When is the isolated request fixture the better choice?',
          a: 'For pure API tests and for setup/teardown that should not depend on any browser session, e.g. creating a booking before the UI test starts or testing that an unauthenticated call is rejected.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-02',
      difficulty: 'easy',
      question: 'Which assertion passes for any 2xx status and prints the response details when it fails?',
      options: [
        'await expect(response).toBeOK()',
        'expect(response.ok()).toBe(true)',
        'expect(response.status()).toBeTruthy()',
        'await expect(response).toHaveStatus(200)',
      ],
      correct: [0],
      explanation:
        '`toBeOK()` is the APIResponse web assertion for the 200–299 range and includes response info in the failure message. `ok()` + `toBe(true)` works but only says "expected true, received false". `status()` is truthy for 404 or 500 too. `toHaveStatus` is not a Playwright matcher.',
      followUps: [
        {
          q: 'How do you check for exactly 201?',
          a: 'expect(response.status()).toBe(201). `status()` is synchronous, so no await is needed for that call.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-03',
      difficulty: 'medium',
      question: 'What is wrong with this Restful Booker test?',
      code: {
        language: 'typescript',
        code: `test('create booking', async ({ request }) => {
  const res = await request.post('/booking', { data: newBooking });
  const body = res.json();
  expect(body.bookingid).toBeGreaterThan(0);
});`,
      },
      options: [
        '`res.json()` returns a promise, so `body.bookingid` is undefined',
        '`data` must be a JSON string, not an object',
        '`request.post` throws for non-2xx so the status check is missing',
        'Relative URLs are not allowed with the request fixture',
      ],
      correct: [0],
      explanation:
        '`json()` is async; without `await`, `body` is a Promise and `bookingid` is undefined, so the assertion fails confusingly. An object in `data` is serialized to JSON automatically. `post` does not throw on 4xx/5xx by default. Relative URLs work when `baseURL` is set.',
      followUps: [
        {
          q: 'What else would you add to this test?',
          a: 'A status check (`expect(res.status()).toBe(200)` for Restful Booker, or `toBeOK()`), a `toMatchObject` on `body.booking` to compare sent and stored data, and cleanup of the created booking.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-04',
      difficulty: 'medium',
      question: 'On Restful Booker, which header do PUT, PATCH and DELETE accept as authentication? Select ALL that apply.',
      options: [
        'Cookie: token=<token from POST /auth>',
        'Authorization: Basic <base64 of admin:password123>',
        'X-Api-Key: <token>',
        'Authorization: Bearer <token>',
      ],
      correct: [0, 1],
      explanation:
        'Restful Booker accepts the token as a cookie named `token` or HTTP Basic auth with the admin credentials. It does not read an `X-Api-Key` header, and a Bearer token is not its documented scheme, so both of those return 403.',
      followUps: [
        {
          q: 'What status does DELETE return on success there?',
          a: '201, which is unusual (204 or 200 would be typical). Assert the real value and consider raising it as an API-design defect.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-05',
      difficulty: 'medium',
      question: 'A test needs the bookings page to show "No bookings yet". The real backend always has data. What is the best approach?',
      options: [
        "Register page.route('**/api/bookings*', r => r.fulfill({ json: [] })) before page.goto",
        'Delete every booking in staging via the API before the test',
        "Call page.route after page.goto so the first load is real",
        "Use route.abort() so the list is empty",
      ],
      correct: [0],
      explanation:
        'Fulfilling with an empty array produces the exact state, only for this page, before the request fires. Deleting shared staging data breaks other tests and parallel runs. Registering after goto misses the initial request. Aborting simulates a network error, which typically shows an error state, not the empty state.',
      followUps: [
        {
          q: 'How would you prove the mock was used?',
          a: 'Count handler calls and assert at least one, or assert the empty-state text, which would not appear with real data. Both catch a route pattern that silently matched nothing.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-06',
      difficulty: 'medium',
      question: 'On fast environments the booking confirmation check below intermittently hits its timeout. What is the cause?',
      code: {
        language: 'typescript',
        code: `await page.getByRole('button', { name: 'Book now' }).click();
const res = await page.waitForResponse('**/api/booking');
await expect(res).toBeOK();`,
      },
      options: [
        'The response may have already arrived before waitForResponse started listening',
        'waitForResponse does not accept glob patterns',
        'toBeOK() cannot be used on browser responses',
        'click() waits for all network requests to finish first',
      ],
      correct: [0],
      explanation:
        'Listeners only see responses after they are created; a fast response can complete during the click, so the wait never resolves. Globs, RegExps and predicates are all accepted, and `toBeOK()` works on page responses too. `click()` does not wait for network idle.',
      followUps: [
        {
          q: 'Rewrite it.',
          a: "const p = page.waitForResponse('**/api/booking'); await page.getByRole('button', { name: 'Book now' }).click(); await expect(await p).toBeOK(); — listener first, trigger second.",
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-07',
      difficulty: 'hard',
      question: 'Which URLs will this handler intercept? Select ALL that apply.',
      code: {
        language: 'typescript',
        code: `await page.route('**/api/rooms*', (route) =>
  route.fulfill({ json: [] }),
);`,
      },
      options: [
        'https://hotel.test/api/rooms',
        'https://hotel.test/api/rooms?checkin=2026-11-01',
        'https://hotel.test/api/rooms/12',
        'https://hotel.test/v1/api/rooms-available',
        'https://hotel.test/api/room',
      ],
      correct: [0, 1, 3],
      explanation:
        'The trailing `*` matches any characters except `/`, so it covers no suffix, a query string, and "-available". `/12` contains a slash, so `*` cannot match it. "/api/room" lacks the "s" required by the literal "rooms". The leading `**` matches any host and path prefix.',
      followUps: [
        {
          q: 'How would you also match /api/rooms/12?',
          a: 'Use `**/api/rooms**` or add a second route `**/api/rooms/*`, or switch to a RegExp like `/\\/api\\/rooms/`. Be careful a broad pattern does not catch unrelated endpoints.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-08',
      difficulty: 'hard',
      question: 'Two routes match the same request. Which handler runs first?',
      code: {
        language: 'typescript',
        code: `await page.route('**/api/**', (route) => route.continue());          // A
await page.route('**/api/cart', (route) => route.fulfill({ json: { items: [] } })); // B
await page.goto('/cart');`,
      },
      options: [
        'B runs first, because the most recently registered matching route takes priority',
        'A runs first, because routes run in registration order',
        'Both run in parallel and the faster one wins',
        'Neither; overlapping routes throw an error',
      ],
      correct: [0],
      explanation:
        'Playwright runs matching handlers in reverse registration order, so the last-registered (more specific) mock B handles /api/cart. If B called `route.fallback()`, A would then get the request. Handlers never run in parallel for one request, and overlapping patterns are allowed.',
      followUps: [
        {
          q: 'How does this help with shared fixtures?',
          a: 'A fixture can register default mocks; a test registers its own override afterwards, which wins. The override can `fallback()` for cases it does not care about, so defaults still apply.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-09',
      difficulty: 'medium',
      question: 'You want real product data but with one product showing `stock: 0`. Which handler does that?',
      options: [
        'const response = await route.fetch(); const json = await response.json(); json[0].stock = 0; await route.fulfill({ response, json });',
        'await route.continue({ postData: JSON.stringify({ stock: 0 }) });',
        "await route.abort('failed');",
        'await route.fulfill({ json: { stock: 0 } });',
      ],
      correct: [0],
      explanation:
        '`route.fetch()` gets the real response; you patch one field and fulfill with the original response plus the new JSON. `continue` with `postData` changes the request body sent to the server, not the response. `abort` fails the request. A hand-written `{ stock: 0 }` replaces the whole catalogue with one meaningless object.',
      followUps: [
        {
          q: 'What does passing `response` to fulfill preserve?',
          a: 'The original status code and headers (content type, caching headers, etc.), so the page sees a realistic response while only the body you provided changes.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-10',
      difficulty: 'hard',
      question: 'Which statements about `page.route` are true? Select ALL that apply.',
      options: [
        'It does not intercept calls made through the `request` fixture',
        'Requests handled by a service worker may bypass it unless `serviceWorkers: \'block\'` is set',
        'It must be registered before the request it should intercept is sent',
        'It automatically applies to every new page opened in other browser contexts',
      ],
      correct: [0, 1, 2],
      explanation:
        'Routing covers browser traffic of that page only: request-fixture calls go directly from Node, service-worker traffic can be invisible to it, and late registration misses requests already sent. It does not apply to other contexts; `context.route` covers popups within one context, not other contexts.',
      followUps: [
        {
          q: 'When would you prefer context.route?',
          a: 'When a test opens popups or new tabs (e.g. a payment window) that make the same API calls; `context.route` applies to every page in that context, including ones opened later.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-11',
      difficulty: 'easy',
      question: 'Your Restful Booker login test checks only `expect(res.status()).toBe(200)` on `POST /auth`. Why is that not enough?',
      options: [
        'Restful Booker returns 200 with `{ reason: "Bad credentials" }` even when the password is wrong',
        'POST /auth always returns 201',
        'Status codes cannot be read from Playwright API responses',
        'The token is returned in a response header, not in the body',
      ],
      correct: [0],
      explanation:
        'The API reports a failed login with status 200 and a `reason` field, so a status-only test passes with bad credentials; you must assert the `token` field exists. It does not return 201 here, `status()` is readable, and the token is in the JSON body.',
      followUps: [
        {
          q: 'Would you report this as a bug?',
          a: 'Yes, as an API design defect: failed authentication should return 401 so clients and monitoring can detect it. Until fixed, the tests assert the body explicitly.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-12',
      difficulty: 'medium',
      question: 'Which practices make API-based test setup reliable in a parallel suite? Select ALL that apply.',
      options: [
        'Generate unique names (e.g. with Date.now() or workerIndex) for created records',
        'Delete created records in fixture teardown after `use()`',
        'Store the created id in a module-level variable for the next test',
        'Reuse booking id 1 because it always exists',
      ],
      correct: [0, 1],
      explanation:
        'Unique data prevents collisions between workers and fixture teardown runs even when tests fail. Module-level ids create order dependence and break under parallelism and retries, and assuming id 1 exists uses data you do not own on a shared API.',
      followUps: [
        {
          q: 'Why is the fixture better than afterEach for cleanup?',
          a: 'Setup and teardown live together and the test declares the dependency in its signature; there is no shared variable between hooks to get out of sync, and only tests that use the fixture pay for it.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-13',
      difficulty: 'hard',
      question: 'After this test, the page shows real data instead of the recorded HAR data. What is the most likely reason?',
      code: {
        language: 'typescript',
        code: `test('catalog from HAR', async ({ page }) => {
  await page.goto('/catalog');
  await page.routeFromHAR('hars/catalog.har', { url: '**/api/products*' });
  await expect(page.getByText('HAR-only product')).toBeVisible();
});`,
      },
      options: [
        'routeFromHAR was called after page.goto, so the products request had already been sent',
        'routeFromHAR only works with update: true',
        'HAR files can only be replayed with context.routeFromHAR',
        'The url option must be a RegExp',
      ],
      correct: [0],
      explanation:
        'Like `page.route`, HAR routing only affects requests sent after it is registered; the catalog loaded during `goto`. Replay is the default (`update` false), `page.routeFromHAR` exists alongside the context version, and `url` accepts a glob.',
      followUps: [
        {
          q: 'What happens to a request that matches the url pattern but is not in the HAR?',
          a: 'By default it is aborted (`notFound: \'abort\'`), which makes missing recordings obvious. With `notFound: \'fallback\'` it goes to the next handler or the network.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-14',
      difficulty: 'expert',
      question: 'Which statements about request contexts and cookies are correct? Select ALL that apply.',
      options: [
        '`page.request` shares the cookie jar with the page\'s browser context',
        'A context from `playwright.request.newContext()` is isolated and should be disposed when done',
        '`apiContext.storageState({ path })` can save an API login for browser contexts to reuse',
        'The `request` fixture automatically shares cookies with `page`',
      ],
      correct: [0, 1, 2],
      explanation:
        '`page.request`/`context.request` use the browser context\'s cookies, `newContext()` is independent and needs `dispose()`, and `storageState()` exports its cookies for `browser.newContext({ storageState })`. The `request` fixture has its own cookie jar; it does not share cookies with `page`.',
      followUps: [
        {
          q: 'Give a use of the shared jar.',
          a: 'Log in through the UI, then call a protected API with `page.request.get(...)` to verify server state as the same user, without handling tokens manually.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-15',
      difficulty: 'expert',
      question: 'A team mocks every API call in all 300 UI tests. Production broke when the backend renamed a JSON field, yet all tests stayed green. Which measures would have caught it? Select ALL that apply.',
      options: [
        'A small real-backend E2E smoke suite with no mocks of first-party APIs',
        'API tests with schema validation against the real service',
        'Raising the retry count on CI',
        'Periodically re-recording HAR files and reviewing the diff',
        'Increasing the expect timeout for mocked tests',
      ],
      correct: [0, 1, 3],
      explanation:
        'Real-backend smoke tests, schema-validated API tests and refreshed HARs all compare against the actual contract, so the rename would surface. Retries and timeouts change nothing when the mocked responses never reflect the new field name; the tests would keep passing.',
      followUps: [
        {
          q: 'What is this failure mode called?',
          a: 'Contract drift: the mock describes an API that no longer exists. Consumer-driven contract testing (e.g. Pact) is another formal way to prevent it between teams.',
        },
      ],
    },
  ],
};

export default topic;
