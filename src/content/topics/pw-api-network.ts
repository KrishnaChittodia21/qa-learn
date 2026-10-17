import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-api-network',
  phase: 'pw-framework',
  order: 5,
  title: 'API Testing & Network Control in Playwright',
  subtitle:
    'Call APIs straight from your tests to check them and to set up data fast. Then control the browser\'s network: fake answers with page.route, wait for calls with waitForResponse, and replay saved traffic.',
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
    '`request` fixture = a ready-made API client (an APIRequestContext). It reads `baseURL`, `extraHTTPHeaders`, `httpCredentials` and `proxy` from `use` in the config. No browser needed.',
    '`page.request` / `context.request` share cookies with the browser. `playwright.request.newContext()` has its own cookies; call `dispose()` when done.',
    'Calls: `request.get/post/put/patch/delete/fetch(url, { data, params, headers, form, multipart })`. A `data` object is sent as JSON.',
    'Check: `await expect(res).toBeOK()` (any 2xx), `res.status()`, `await res.json()`, `res.headers()`. Use `toMatchObject` / `expect.any(Number)` to check part of a body.',
    'Restful Booker: `POST /auth` → `{ token }`. Write calls need `Cookie: token=<t>` or Basic auth. Create returns 200 + `bookingid`. DELETE returns **201**. Wrong login returns **200** with `reason`.',
    'Use the API to set up data and the UI to test the feature. Create data in a fixture, check it in the browser, delete it after `use()`.',
    '`page.route(glob, handler)` must be added **before** the request starts. The handler picks `fulfill` (fake answer), `abort` (network error), `continue` (send it, maybe changed) or `fallback` (next handler).',
    '`route.fetch()` + `route.fulfill({ response, json })` = edit a real response. The route added last runs first.',
    'Glob patterns: `*` = anything except `/`, `**` = anything. The pattern must match the **whole URL**. Use `**/api/booking*`, a RegExp or a function.',
    'Wait for a call: `const p = page.waitForResponse(...)` → do the action → `await p`. Never start waiting after the action.',
    '`page.routeFromHAR(file, { url, update })` replays saved traffic. `update: true` records it. Requests not in the file are aborted by default (`notFound`).',
    'Mocks prove how the UI reacts, not that the real system works. Keep a few real end-to-end tests and API tests against the real backend.',
  ],
  sections: [
    {
      heading: 'Why API and network control belong in a UI framework',
      body: `**Example:** \`await request.post('/booking', { data })\` → Playwright creates a booking through the API. No browser opens. It takes well under a second.

**Example:** \`await page.route('**/api/bookings', route => route.fulfill({ status: 500 }))\` → the browser gets a fake "server error". Now you can check the error banner.

Think of a tall building. You want to test one window on floor 20. You take the lift up, then check the window by hand. The API is the lift. The UI is the window.

Playwright gives you two tools next to the browser:
1. **\`request\`** — it calls APIs directly. Use it for API tests. Use it to create and delete test data quickly.
2. **\`page.route\`** — it watches the browser's network calls. It can block, change or fake them. Use it for cases the real server cannot give you easily, like a 500 error or an empty list.

| Goal | Tool | Speed |
|---|---|---|
| Check an endpoint's status and body | \`request\` fixture | ~100–500 ms per call |
| Create test data for a UI test | \`request\` in a fixture | much faster than the UI |
| Show the UI's error screen | \`page.route\` + \`route.fulfill({ status: 500 })\` | instant, same result every run |
| Wait until the UI's API call finishes | \`page.waitForResponse\` | as fast as the app |
| Replay saved traffic for demos | \`page.routeFromHAR\` | instant |

**In an interview, say:** "I use the API to set up data fast. I use the UI only for the feature I am testing. I fake network answers to reach states the real server cannot give me."

**Why testers care:** UI tests get faster and break less often. You can also test error screens that are hard to trigger for real.`,
      diagram: `   test code
   |-- request.post('/booking') ------------------> real API (no browser)
   |
   '-- page.goto('/admin') --> browser --> page.route? --+--> fulfill (fake)
                                         (interceptor)   +--> abort   (error)
                                                         +--> continue --> real API`,
      keyPoints: [
        '`request` calls APIs directly. `page.route` catches the browser\'s own requests.',
        'Creating data through the API removes slow UI steps that are not being tested.',
        'Faking answers lets you test states the real server cannot give on demand.',
      ],
      source: 'Playwright docs — API testing; Network',
    },
    {
      heading: 'The request fixture and APIRequestContext',
      body: `**Example:** \`const res = await request.get('/booking/1')\` → Playwright sends a GET request from your test code. No browser is used. You get back a response to check.

The \`request\` fixture is like Postman inside your tests. It uses the same \`expect\`, the same reports and the same CI job.

A **fixture** is something Playwright prepares for your test and cleans up after it. The \`request\` fixture is an **APIRequestContext**. That just means "an object that sends HTTP requests from Node, not from the page".

A **browser context** is like a fresh browser profile. It has its own cookies and storage.

There are three ways to get one:

| Way | Cookies | How long it lives | Use it for |
|---|---|---|---|
| \`request\` fixture | its own cookies | one test (closed for you) | API tests, setup inside a test |
| \`page.request\` / \`context.request\` | **shared with the browser** | as long as the browser context | API calls that need the browser's login cookies |
| \`playwright.request.newContext({...})\` | its own cookies | until you call \`dispose()\` | \`beforeAll\` setup, global setup, worker fixtures |

The \`request\` fixture reads settings from \`use\` in the config. The main ones are \`baseURL\`, \`extraHTTPHeaders\`, \`httpCredentials\`, \`proxy\` and \`ignoreHTTPSErrors\`. With \`baseURL\` set, you can write \`'/booking'\` instead of the full URL.

Options you will use most:
- \`data\` — an object. It is sent as JSON with \`Content-Type: application/json\`.
- \`params\` — the query string. \`{ firstname: 'Asha' }\` becomes \`?firstname=Asha\`.
- \`headers\` — headers for this one call. They are added to \`extraHTTPHeaders\`.
- \`form\` / \`multipart\` — form data and file uploads.
- \`failOnStatusCode: true\` — throw an error on any status that is not 2xx or 3xx.

**Watch out:** \`request.post\` does **not** fail on a 4xx or 5xx status by default. If you forget to assert, a 500 error passes quietly.

**Why testers care:** API tests live in the same project as UI tests. One report shows everything.`,
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
        'The `request` fixture uses `baseURL` and `extraHTTPHeaders` from the config.',
        '`page.request` shares cookies with the page. `newContext()` has its own cookies.',
        'A 4xx or 5xx status does not fail the test unless you assert it or set `failOnStatusCode`.',
      ],
      source: 'Playwright docs — API testing; APIRequestContext reference',
    },
    {
      heading: 'CRUD on Restful Booker with Playwright',
      body: `**Example:** \`await request.delete('/booking/5', { headers: { Cookie: 'token=abc' } })\` → Restful Booker deletes booking 5. It answers with status **201**, not 200.

CRUD means create, read, update and delete. A full CRUD test is the "hello world" of API automation.

Restful Booker is a practice API. It has some odd answers on purpose. So it teaches you to check what the API *really* does.

**Endpoints you need:**
| Call | Login needed | Success | Notes |
|---|---|---|---|
| \`POST /auth\` \`{ username, password }\` | no | 200 \`{ token }\` | wrong password → still **200** with \`{ reason: 'Bad credentials' }\` |
| \`POST /booking\` | no | **200** \`{ bookingid, booking }\` | not 201 |
| \`GET /booking/:id\` | no | 200 booking | 404 when missing |
| \`GET /booking?firstname=…\` | no | 200 \`[{ bookingid }]\` | filters the list |
| \`PUT /booking/:id\` | token cookie or Basic | 200 full booking | all fields required |
| \`PATCH /booking/:id\` | token cookie or Basic | 200 | change some fields |
| \`DELETE /booking/:id\` | token cookie or Basic | **201** | 403 without login |

The default admin login is \`admin\` / \`password123\`. Write calls need the token as a **cookie**: \`Cookie: token=<value>\`.

The test below runs the whole cycle in one test. Each part sits inside \`test.step\`. So the report shows which step broke.

Each run uses a new first name. So runs at the same time never clash.

**Why testers care:** you assert real behaviour, not what you guess. If the API returns 201 for delete, your test says 201.`,
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
        'Assert what the API really does: create = 200, delete = 201, wrong login = 200 with `reason`.',
        'Send the token as a cookie header for PUT, PATCH and DELETE.',
        'Use new data on every run so tests running together do not clash.',
      ],
      source: 'Restful Booker API docs; verified against the live API (Oct 2026)',
    },
    {
      heading: 'Asserting API responses',
      body: `**Example:** \`await expect(res).toBeOK()\` → passes for any 2xx status. If it fails, Playwright prints the response body, so you see why.

Check a response in this order:
1. The status and headers.
2. The shape — which fields exist and their types.
3. The values.

Then the first failure tells you what went wrong.

| What | How | Note |
|---|---|---|
| Any 2xx | \`await expect(res).toBeOK()\` | prints the body on failure |
| Exact status | \`expect(res.status()).toBe(201)\` | \`status()\` needs no \`await\` |
| Header | \`expect(res.headers()['content-type']).toContain('application/json')\` | header names are lower-case |
| Exact body | \`expect(await res.json()).toEqual({...})\` | breaks if the server adds a field |
| Part of the body | \`expect(body).toMatchObject({ firstname: 'Asha' })\` | ignores extra fields |
| Types | \`expect(body).toEqual({ bookingid: expect.any(Number), booking: expect.any(Object) })\` | checks the shape |
| Item in a list | \`expect(list).toContainEqual({ bookingid: id })\` | finds a matching item |
| Value that changes later | \`await expect.poll(async () => (await request.get(url)).status()).toBe(404)\` | retries until it matches |

\`res.json()\`, \`res.text()\` and \`res.body()\` return promises. Always \`await\` them.

\`res.ok()\` returns \`true\` or \`false\`. It is fine inside an \`if\`. As an assertion, its failure message is poor. Use \`toBeOK()\` instead.

**Schema checks** mean "all required fields exist, with the right types". Playwright has no built-in schema check. Teams add a library such as Ajv or Zod.

**Test the unhappy paths too.** No login → 403. Unknown id → 404. Bad body → an error code. On Restful Booker, a POST with missing fields returns **500**, not a clean 400. That is a real bug you would report.

**Why testers care:** good assertions give clear failure messages. You find the bug faster.`,
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
        'Use `toBeOK()` for any 2xx. It gives a helpful failure message.',
        'Use `toMatchObject` and `expect.any` to check a body without breaking on extra fields.',
        'Always test the failure cases too: 401, 403, 404 and bad input.',
      ],
      source: 'Playwright docs — APIResponse, APIResponseAssertions, GenericAssertions',
    },
    {
      heading: 'Tokens and auth reuse for API calls',
      body: `**Example:** \`extraHTTPHeaders: { Cookie: 'token=' + token }\` → every call from this API context sends the token. You log in once, not before every call.

Logging in for every API call is like showing your passport at every airport shop. Get the boarding pass (the token) once. Then show it where needed.

**Options, from simplest to most scalable:**
1. **Per test** — call \`/auth\` at the start of the test. This is fine for a few tests.
2. **Worker-scoped fixture** — a worker is one test process. This fixture logs in once per worker. Every test in that worker reuses the logged-in context. It is fast, and workers stay separate.
3. **Config headers** — some APIs use a fixed key or Bearer token. Put it in \`extraHTTPHeaders\` and read it from \`process.env\`.
4. **Share with the browser** — after a UI login, \`page.request\` and \`context.request\` send the browser's cookies for you. Or the other way: log in with an API context and call \`await apiContext.storageState({ path })\`. **storageState** is a saved file of cookies and local storage. Start browser contexts with it, and they begin logged in.

**Secrets:** never write passwords in the code. Read them from \`process.env\`. Locally, keep them in a \`.env\` file (loaded with dotenv) that Git ignores. In CI, use pipeline secrets.

**Watch out:** a worker can run for many minutes. If tokens expire fast, refresh the token in the fixture. Or get a new token per test.

**Why testers care:** one login per worker saves many API calls. Suites run faster, and secrets stay out of Git.`,
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
        'A worker-scoped fixture logs in once per worker. All tests in that worker reuse it.',
        '`context.request` shares the browser\'s cookies. `storageState` carries an API login into the browser.',
        'Passwords come from environment variables or CI secrets, never from the code.',
      ],
      source: 'Playwright docs — API testing (reuse authentication state); Fixtures (worker scope); Authentication',
    },
    {
      heading: 'API setup for UI tests',
      body: `**Example:** a fixture calls \`request.post('/booking')\` before the test and \`request.delete(...)\` after it → the UI test starts with a fresh booking. Nothing is left behind.

A UI test should only click through the part it is *about*. Everything before that is preparation. Preparation is fastest through the API.

**The pattern:**
1. **Arrange** with the API — create the data.
2. **Act and assert** in the UI — test the feature.
3. **Clean up** with the API — delete the data.

Put this in a fixture. The code after \`use()\` is the clean-up step, also called **teardown**. It runs even when the test fails.

Why it helps:
- **Speed** — one POST (~300 ms) replaces 20–30 seconds of form filling.
- **Stability** — fewer UI steps means fewer places to break. A failure points at the feature you are testing.
- **Isolation** — each test gets its own new record with a unique name. Nothing is shared.
- **Clean environments** — clean-up deletes what the test created. Shared staging does not fill up with junk.

**It works the other way too.** Do the action in the UI. Then check with the API that the server really saved it. For example, cancel a booking in the UI. Then \`GET /booking/:id\` should return 404. This catches "the UI said success, but nothing was saved" bugs.

**Watch out:** API setup skips the form's own checks. Keep at least one UI test that creates the record through the form.

**Why testers care:** tests run faster and fail only for real reasons. Test data never piles up.`,
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
        'Create data with the API, test in the UI, delete with the API.',
        'Clean-up code after `use()` in a fixture always runs, even when the test fails.',
        'Check UI actions with an API call to catch fake "success" messages.',
      ],
      source: 'Playwright docs — API testing (prepare server state, check postconditions); Fixtures',
    },
    {
      heading: 'Mocking the network with page.route',
      body: `**Example:** \`await page.route('**/api/fruits', route => route.fulfill({ json: [] }))\` → when the page asks for fruits, Playwright answers with an empty list. The real server is never called.

Faking the server's answer is called **mocking**. \`page.route\` is how Playwright does it.

Think of a receptionist between the browser and the internet. For each request that matches your pattern, the receptionist picks one action:
- **fulfill** — answer directly with a fake response.
- **abort** — refuse it, like a network error.
- **continue** — send it to the real server, maybe with changes.
- **fallback** — pass it to the next matching route.

**Rules that trip people up:**
- Add the route **before** the request happens. Usually that means before \`page.goto\`.
- The pattern must match the **whole URL**. This kind of pattern is called a **glob**.
- In a glob, \`*\` matches anything except \`/\`. \`**\` matches anything, including \`/\`. \`{a,b}\` means "a or b".
- So \`'**/api/booking'\` does not match \`/api/booking?page=2\`. Use \`'**/api/booking*'\` or a RegExp.
- If several routes match, the **one added last runs first**. It can call \`route.fallback()\` to pass to older ones.
- \`page.route\` covers one page. \`context.route\` covers every page in the browser context, popups too.
- Routes only see **browser** traffic. They do not catch calls from your \`request\` fixture.
- Some apps use a **service worker**, a background script that can answer requests itself. Routes cannot see those requests. Set \`serviceWorkers: 'block'\` in \`use\` if the app has one (for example, MSW).
- While routing is on, the browser's HTTP cache is off for that page.

| Handler call | What the app sees | Use it for |
|---|---|---|
| \`route.fulfill({ json })\` | a normal response you made up | empty lists, edge data, 500/503 pages |
| \`route.fulfill({ status: 500, body })\` | a server error | error banners, "try again" screens |
| \`route.abort()\` | a network failure (default code \`'failed'\`) | offline screens, blocking images or analytics |
| \`route.continue({ headers })\` | the real response | add a header, change the method or URL |
| \`route.fetch()\` + \`fulfill({ response, json })\` | the real response, edited | change one field (next section) |

**Why testers care:** you can test empty lists, errors and offline screens on demand. Every run gets the same answer.`,
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
        'Add the route before the request starts. The pattern must match the whole URL.',
        'fulfill = fake answer, abort = fail, continue = send to the server, fallback = pass to the next route.',
        'Routes do not see `request` fixture calls or service-worker traffic.',
      ],
      source: 'Playwright docs — Mock APIs; Network (glob patterns, service workers); Page.route reference',
    },
    {
      heading: 'Modifying real responses and requests',
      body: `**Example:** inside a route, \`const response = await route.fetch()\` gets the real answer. You add one fruit to its JSON. Then \`route.fulfill({ response, json })\` sends the edited answer to the page.

Sometimes you want real data with one small change. "Everything normal, but this user is premium." "Everything normal, but stock is 0." So you get the real response, edit it, and give it to the browser.

**Change a response:**
1. \`const response = await route.fetch()\` — sends the real request.
2. \`await response.json()\` — reads the body.
3. Change one field.
4. \`route.fulfill({ response, json })\` — sends it on.

The status and headers stay real. Only the body changes.

**Change a request:** \`route.continue({ headers, method, postData, url })\` sends a changed request. Common uses:
- Add a feature-flag header.
- Remove a header to test a fallback.
- Send the call to a staging host.

The browser controls some headers, like \`cookie\`, \`host\` and \`content-length\`. You cannot override them this way.

**Add a delay:** to test a loading spinner, wait a short time inside the handler. Then call \`continue\` or \`fulfill\`. A timer is fine here. You are pretending the server is slow. You are not waiting for your app.

**Remove routes:** \`page.unroute(pattern)\` or \`page.unrouteAll({ behavior: 'ignoreErrors' })\` removes handlers during a test. Routes also end when the page closes.

**Why testers care:** you test rare cases using real data. You do not need to hand-write a full fake response.`,
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
        '`route.fetch()` + `fulfill({ response, json })` changes the body of a real response.',
        '`route.continue({ headers, method, postData, url })` changes the request before it goes out.',
        'A delay inside a route handler fakes a slow server. It is not a hard wait in your test.',
      ],
      source: 'Playwright docs — Mock APIs (modify API responses); Network (modify requests)',
    },
    {
      heading: 'Waiting for network: waitForResponse and waitForRequest',
      body: `**Example:** \`const resPromise = page.waitForResponse('**/api/search')\` → then click Search → then \`await resPromise\`. You get the search response the click caused.

To catch a ball, put your hands up *before* it is thrown.

\`page.waitForResponse\` starts listening **when you call it**. It catches the first matching response after that. If the response already came, it waits for the next one. Often that means it waits until the timeout.

So always use this order:
1. Create the promise.
2. Do the action that starts the call.
3. \`await\` the promise.

The matcher can be a glob, a RegExp or a function. A function can check the method and status too. For example: \`(r) => r.url().includes('/api/booking') && r.request().method() === 'POST'\`. Then you do not catch an unrelated GET to the same URL.

\`page.waitForRequest\` works the same way for outgoing requests. Use it to check **what the UI sent**: \`(await reqPromise).postDataJSON()\`.

**When to use it:**
- To check the API call the UI made (its payload or status).
- When the UI shows no visible sign that it finished.

**When not to:** if something visible appears, like a toast or a new row, assert that instead. Use a **web-first assertion** — an \`expect\` on a locator that retries until it passes. It is closer to what the user sees.

You can also listen to all traffic with \`page.on('request' | 'response' | 'requestfailed', ...)\`. For example, fail the test if any \`/api/\` call returned a 5xx.

**Why testers care:** you can prove what the UI sent to the server. Tests never miss a fast response.`,
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
        'Start waiting → do the action → await. This is the only safe order.',
        'Use a function to match the method and status, not just the URL.',
        'If the UI shows a visible result, assert that instead.',
      ],
      source: 'Playwright docs — Network (waiting for responses, network events)',
    },
    {
      heading: 'HAR recording and replay',
      body: `**Example:** \`await page.routeFromHAR('hars/fruits.har', { url: '*/**/api/v1/fruits' })\` → the page's fruit API calls get answers from a saved file. The real server is not needed.

A **HAR file** (HTTP Archive) is a recording of network traffic. It is a JSON file listing requests and their responses. Record it once against the real server. Then replay it in every run. You get the same answers each time.

What Playwright can do with a HAR:
- **Record** — add \`update: true\`. The test runs against the real server and writes the file.
- **Replay** — use \`update: false\`. Matching requests get answers from the file.
- Matching uses the URL and method, and the body for POST.
- Requests not found in the file are **aborted** by default (\`notFound: 'abort'\`). With \`notFound: 'fallback'\` they go to the real network.
- **Record from the command line:** \`npx playwright open --save-har=example.har --save-har-glob="**/api/**" https://example.com\`.
- More options: \`updateContent: 'attach' | 'embed'\` and \`updateMode: 'minimal' | 'full'\`.

**Good for:**
- Big responses that are boring to write by hand.
- Demo or regression suites that must not depend on a shared staging database.
- Reproducing a customer's bug. They can save a HAR from DevTools → Network → "Save all as HAR".

**Watch out:** HAR files get old when the API changes. Then tests pass against yesterday's API. HARs can also hold tokens or personal data. Remove those, and record again on a schedule.

**Why testers care:** you get realistic fake answers with almost no work. Tests do not depend on a busy server.`,
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
        '`update: true` records a HAR file. `update: false` replays it.',
        'Requests missing from the file are aborted by default.',
        'Record HAR files again regularly, and remove secrets from them.',
      ],
      source: 'Playwright docs — Mock APIs (HAR); Page.routeFromHAR reference',
    },
    {
      heading: 'Choosing a strategy: real, mocked, or hybrid',
      body: `**Example:** you mock the bookings API with \`totalprice\`. The real backend renames it to \`total_price\`. Your mocked test stays green, but production breaks.

Mocks are like a flight simulator. They are great for practising engine failures you cannot safely cause in a real plane. But you still need real flights before you get a licence.

| Test type | Backend | Catches | Misses |
|---|---|---|---|
| Full end-to-end | real | integration bugs, config, data | rare states; can be slow and flaky |
| UI + mocked API | \`page.route\` / HAR | UI logic, error, empty and edge states | API changes, backend bugs |
| API tests | real (\`request\` fixture) | status codes, validation, auth, data | how the UI looks |
| Hybrid | real API setup + real UI, mock only third parties | most things, stable | payment provider etc. (tested separately) |

A **flaky test** sometimes passes and sometimes fails without any code change. Real backends make that more likely. Mocks make results the same every run.

**A good mix for a booking app:**
- A few **real end-to-end smoke tests** (login, create booking, cancel) on every deploy.
- **API tests** for every endpoint, for both success and failure cases.
- **Mocked UI tests** for error banners, empty states, slow responses and feature flags.
- Third-party services (payments, maps, analytics) **always mocked or blocked** in UI tests.

**Watch out for too much mocking.** Add API tests against the real service, or contract tests. Record HARs again from time to time.

**In an interview, say:** "I mock to reach rare states, not to avoid the backend. Each mocked UI case has a real API test that keeps the mock honest."

**Why testers care:** the right mix finds UI bugs and backend bugs. Mocks alone can hide a broken API.`,
      keyPoints: [
        'Mock to reach special states. Use the real backend to test that everything works together.',
        'Always mock or block third-party services in UI tests.',
        'Pair mocked UI tests with real API tests, so an API change is caught.',
      ],
      source: 'Playwright docs — Mock APIs; Best Practices (avoid testing third-party dependencies)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-api-network-cc-1',
      title: 'Replace slow UI setup with API setup and a network mock',
      context:
        'Your team\'s admin app (`baseURL` in the config) lists bookings from `GET /api/bookings`. It can cancel one with `DELETE /api/bookings/:id`. There is also a `POST /api/bookings` endpoint, with the same data as Restful Booker. The tests below take 70 seconds. They fail when staging is slow. The "error banner" test does not really check anything.',
      task: 'Rewrite both tests. Create and delete the data through the API. Make the cancel test check the server too. Make the error-banner test force a server error the same way on every run.',
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
        'The `request` fixture uses the same `baseURL` as the page. A fixture can create a booking with a unique name and delete it after `use()`.',
        'After you click Cancel in the UI, a `GET` for that id tells you if the server really removed it.',
        'For the banner, add a route for `**/api/bookings*` before you open the page. Make it fulfill with status 500.',
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
      explanation: `- **API setup in a fixture.** One POST replaces about 25 seconds of form filling. It also removes the fragile \`#fname\` and \`.btn-primary\` locators. The unique \`firstname\` stops tests running together from clashing. The clean-up after \`use()\` always deletes the record.
- **Role-based row locator.** It replaces the chained CSS and text selector. \`toHaveCount(0)\` retries until it passes, so no sleep and \`count()\` are needed.
- **Server check.** The GET returns 404. That proves the cancel was saved, not just hidden in the UI.
- **Error on demand.** \`page.route\` with \`fulfill({ status: 500 })\` gives the same failure every run. The old \`if (isVisible())\` test passed without checking anything.
- **No hard waits.** Every \`waitForTimeout\` is gone.
- **Keep form coverage.** Keep one separate UI test that creates a booking through the form.`,
      followUps: [
        {
          q: 'The route pattern is `**/api/bookings*`. Does it also catch the fixture\'s POST and DELETE?',
          a: 'No. `page.route` only catches requests made by the browser page. The `request` fixture sends HTTP from Node, with its own APIRequestContext. So setup and clean-up reach the real server, while the page sees fake 500 errors. That is exactly what you want here.',
        },
        {
          q: 'How would you test that the UI tries again after the error?',
          a: 'Count the calls inside the handler. Answer the first call with a 500. For the second call, use `route.continue()` or fulfill with data. Then click "Try again" and check that the list appears. You can also assert the call count, to prove exactly one retry happened.',
        },
      ],
    },
    {
      id: 'pw-api-network-cc-2',
      title: 'Harden a fragile Restful Booker API suite',
      context:
        'A junior engineer wrote these API tests. They pass on their machine on a good day. They fail at random when run in parallel. Once, they deleted a booking another team was using for a demo.',
      task: 'Find at least six bugs or bad habits. Rewrite the file so each test is independent, safe with secrets and correctly checked.',
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
        'What does `res.json()` return? What does Restful Booker really return for create and delete?',
        'What happens to `bookingId` when the tests run in different workers, or when "delete" runs alone?',
        'Where should passwords and the base URL live? How do you get a fresh token?',
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
      explanation: `**Bugs and bad habits fixed:**
1. **Missing \`await\` on \`res.json()\`.** It returns a promise, so \`bookingId\` was always \`undefined\`.
2. **Wrong status.** Create returns 200 on Restful Booker. The test expected 201, so it failed for the wrong reason.
3. **Shared variable and test order.** When run in parallel or alone, "delete" had no id. It then used **booking 1** — someone else's data. Now each test creates its own booking.
4. **Old token written in the code.** Tokens expire, and secrets do not belong in Git. Now a fresh token comes from login details in environment variables.
5. **Weak assertion.** \`res.ok()\` with \`toBeTruthy()\` gives a useless failure message. Now the tests check exact statuses and use \`toBeOK()\`.
6. **No check of the result.** Delete now checks that the booking is really gone (404).
7. **Base URL in the code.** It moved to the config project. You can change environments without editing tests.`,
      followUps: [
        {
          q: 'Getting a token in every delete test is wasteful. How would you scale this?',
          a: 'Move the login into a worker-scoped fixture. It logs in once per worker. It gives tests an APIRequestContext with the `Cookie: token=…` header already set in `extraHTTPHeaders`. Tests stay independent, but you log in once per worker, not once per test.',
        },
        {
          q: 'Restful Booker returns 200 for a wrong password. Is your check enough?',
          a: 'A status-only check would pass with a wrong password. So the helper also checks that the body has a token. In a real project, I would also report this as a bug. A failed login should return 401. Apps that rely on status codes will behave wrongly.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-api-network-iq-01',
      difficulty: 'medium',
      question: 'Why would you create test data through the API instead of the UI? Are there any downsides?',
      whatInterviewerLooksFor: [
        'Speed, stability and isolation reasons, with rough numbers',
        'Knows the fixture pattern with clean-up after use()',
        'Says the form itself still needs one UI test',
        'Mentions checking UI actions through the API',
      ],
      modelAnswer: `**A UI test should only test the feature it is about.** If I test "cancel a booking", the booking form is just preparation.

**Example:** a fixture calls \`request.post('/booking')\` → the test opens the admin page and cancels that booking → the fixture deletes it afterwards.

**Why API setup:**
- **Speed.** A \`POST /booking\` takes about 300 ms. Filling the form takes 20–30 seconds. Over 200 tests, that saves more than an hour of CI time.
- **Stability.** Every UI step can break, for example a slow screen or a changed locator. Fewer steps mean fewer false failures. A failure points at the feature I am testing.
- **Isolation.** Each test creates its own record with a unique name. Workers never fight over shared data.
- **Clean environments.** The fixture deletes the record after \`use()\`, even when the test fails.

**How:** a test fixture uses the \`request\` fixture, which has the same \`baseURL\` as the page. It creates the data, gives it to the test and deletes it afterwards. Login works the same way: log in once through the API and save \`storageState\`.

**Downsides and fixes:**
- The form is no longer used by every test. So I keep **one UI test** that creates a booking through the form.
- API data may skip UI checks. It could create states a real user cannot reach. So I use realistic data.
- It needs a usable API and test logins. I work with developers to get test endpoints or seed scripts.

I also use the API the other way. After a UI action, a \`GET\` confirms the server saved the change. That catches "the UI says success but nothing was saved" bugs.`,
      followUps: [
        {
          q: 'There is no API for creating users. What do you do?',
          a: 'In order of preference: ask developers for a test-only endpoint or seed script in non-production environments. Or seed the database through a fixture, carefully and with proper access. Or create users once through the UI in a setup project and reuse them with storageState. I would not create users through the UI in every test.',
        },
        {
          q: 'How do you make sure clean-up happens when a test fails halfway?',
          a: 'Put the create and delete steps in one fixture. The code after `await use(...)` runs whether the test passed or failed. This is more reliable than afterEach with shared variables. The test also lists the fixture it needs, so the link is easy to see.',
        },
      ],
      pitfalls: [
        'Saying "API setup is always better" without mentioning the form still needs a test.',
        'Creating data but never deleting it.',
        'Using the same record in every test.',
      ],
    },
    {
      id: 'pw-api-network-iq-02',
      difficulty: 'medium',
      question: 'Explain route.fulfill, route.abort, route.continue and route.fallback. Give a real use for each.',
      whatInterviewerLooksFor: [
        'Knows what each call does',
        'Gives a real testing example for each',
        'Knows the route added last runs first, and routes go before navigation',
        'Mentions route.fetch for editing a real response',
      ],
      modelAnswer: `All four are choices inside a \`page.route\` or \`context.route\` handler. They decide what happens to a caught **browser** request. Add the route before the request starts, usually before \`page.goto\`.

**Example:** \`page.route('**/api/items', r => r.fulfill({ json: [] }))\` → the page gets an empty list, and the server is never called.

- **\`route.fulfill(options)\`** — I answer the request myself. The server is never called. Options: \`status\`, \`headers\`, \`contentType\`, \`body\`, \`json\`, \`path\` (a file) or \`response\` (a real one to start from). *Use:* return \`[]\` to test the empty-list message. Or return \`status: 500\` to test the error banner.
- **\`route.abort(errorCode?)\`** — the request fails like a network error. The default code is \`'failed'\`. Others include \`'timedout'\` and \`'blockedbyclient'\`. *Use:* block images, fonts or analytics to speed tests up. Or test the "could not connect" screen.
- **\`route.continue(overrides?)\`** — the request goes to the real server. I can change \`headers\`, \`method\`, \`postData\` or \`url\`. *Use:* add a feature-flag header. Or wait a moment first, to see a spinner.
- **\`route.fallback(overrides?)\`** — pass the request to the next matching handler. The handler added **last runs first**. So a specific mock can handle \`POST\` and fall back to a general handler for the rest.

**Bonus:** \`route.fetch()\` sends the real request and returns the response. Then \`fulfill({ response, json })\` can change one field of real data.

Note: routes do not touch calls from the \`request\` fixture. Those go straight from Node.`,
      followUps: [
        {
          q: 'Your route never seems to run. What do you check?',
          a: 'First, was the route added before the request happened, before goto or the click? Second, does the glob match the full URL, query string included? Use `**/api/items*` or a RegExp. Third, is a service worker handling the request? Set `serviceWorkers: \'block\'`. Last, is the call made by the page? Routes never see request-fixture calls.',
        },
        {
          q: 'What is the difference between continue and fallback?',
          a: '`continue` sends the request to the network right away. It skips any other handlers. `fallback` gives it to the next (older) matching handler. That handler may fulfill, abort or continue it. Use fallback when you stack handlers, for example a test\'s own mock on top of a fixture\'s default mocks.',
        },
      ],
      pitfalls: [
        'Thinking routes also catch request-fixture calls.',
        'Adding the route after page.goto.',
        'Mixing up abort (a network error) with fulfill status 500 (a server error).',
      ],
    },
    {
      id: 'pw-api-network-iq-03',
      difficulty: 'easy',
      question: 'How would you test what the UI shows when the server returns a 500, or takes ten seconds to answer?',
      whatInterviewerLooksFor: [
        'Uses page.route instead of waiting for staging to break',
        'Knows fulfill with a status, and a delay inside the handler',
        'Checks what the user sees',
        'Thinks about "try again" and timeout screens',
      ],
      modelAnswer: `I would not wait for staging to break. I would **create those conditions** with \`page.route\`. Then they happen the same way on every run.

**A 500 error:**
1. Before opening the page, add \`page.route('**/api/bookings*', route => route.fulfill({ status: 500, json: { error: 'boom' } }))\`.
2. Open the page.
3. Check what the user sees: \`await expect(page.getByRole('alert')).toContainText('Something went wrong')\`. Check that a retry button is visible. Check that nothing crashed. I can listen to \`page.on('pageerror')\` for that.

**A slow answer:**
1. In the handler, \`await new Promise(r => setTimeout(r, 10_000))\`, then call \`route.continue()\` or \`fulfill\`.
2. Check that a loading spinner appears. Check that buttons are disabled, so users cannot submit twice. Then check that the data appears once the answer comes. If the app has its own timeout, check the timeout message.

**A network failure:** use \`route.abort('internetdisconnected')\` or \`'timedout'\` to test the offline message.

**Extras:** a handler can remember calls. The first call gets a 500, the second gets real data. That tests the "Try again" flow. I still keep one real-backend smoke test for the happy path. Mocks only prove how the UI reacts, not that the server works.`,
      followUps: [
        {
          q: 'Isn\'t the 10-second delay a hard wait? You said those are bad.',
          a: 'The delay is inside the fake server. It copies a slow environment. The test itself still waits with web-first assertions for things it can see. A hard wait is bad when the test sleeps and hopes the app is ready. I could also shorten it to 2 seconds, if that is long enough to see the spinner.',
        },
        {
          q: 'How do you check that the error did not cause an uncaught JavaScript error?',
          a: 'Collect errors with `page.on(\'pageerror\', e => errors.push(e))`. At the end, assert that `errors` is empty. You can also watch `console` messages of type error. That catches a page where the banner shows but the app is broken underneath.',
        },
      ],
      pitfalls: [
        'Waiting for a real outage, or asking developers to break staging.',
        'Using route.abort when you wanted a 500 response.',
        'Only checking that "no data" appears, not the exact error message.',
      ],
    },
    {
      id: 'pw-api-network-iq-04',
      difficulty: 'medium',
      question: 'Walk me through automating CRUD tests for the Restful Booker API in Playwright. What surprised you about the API?',
      whatInterviewerLooksFor: [
        'Right endpoints and login method (token cookie or Basic auth)',
        'Independent tests that create and delete their own data',
        'Checks real behaviour and spots odd answers',
        'Both success and failure cases',
      ],
      modelAnswer: `**Setup:** an \`api\` project in \`playwright.config.ts\`. It sets \`baseURL: 'https://restful-booker.herokuapp.com'\` and \`extraHTTPHeaders: { Accept: 'application/json' }\`. Login details come from environment variables.

**Flow:**
1. \`POST /auth\` with the admin login → \`{ token }\`. I check the token exists, not just the status.
2. \`POST /booking\` with firstname, lastname, totalprice, depositpaid, bookingdates and additionalneeds → \`{ bookingid, booking }\`. I check \`booking\` with \`toMatchObject\` and keep the id.
3. \`GET /booking/:id\` → the same data.
4. \`PUT\` (all fields) and \`PATCH\` (some fields) with \`Cookie: token=<token>\` → the fields are updated.
5. \`DELETE\` with the cookie → then \`GET\` returns 404.

**Example:** \`expect(del.status()).toBe(201)\` → I assert the real delete status, even though it is unusual.

Each test creates its own booking with a unique name. I wrap steps in \`test.step\`, so the report is easy to read. With many tests, I move the login into a worker fixture.

**Failure cases:** update or delete without a token → 403. Unknown id → 404. A filter like \`?firstname=\` returns the id I created.

**Surprises (I assert them and report them):**
- Create returns **200**, not 201.
- DELETE returns **201 Created**.
- A wrong password returns **200** with \`{ reason: 'Bad credentials' }\`. So a status-only check passes on a failed login.
- A POST with missing required fields returns **500**, not 400.
- Sending \`Accept: text/html\` gets **418 I'm a teapot**.

The point for the interviewer: I check what the API really does. I log odd behaviour as bugs. I do not quietly code around it.`,
      followUps: [
        {
          q: 'Your tests pass, but the public API is shared with thousands of users. Any concerns?',
          a: 'Yes. Other people\'s data can appear in list endpoints. The service also resets from time to time. So I never assume a list is empty or that id 1 exists. Every test creates and deletes its own booking, uses unique names and filters by its own id. For a real project, I would use a separate environment.',
        },
        {
          q: 'How would you check the full shape (schema) of a response?',
          a: 'Playwright has no schema assertion. I would add Ajv (JSON Schema) or Zod. I define the booking schema once and assert that `validate(body)` is true, with readable errors. For simple shape checks, `toMatchObject` with `expect.any(Number)` works without a library.',
        },
      ],
      pitfalls: [
        'Assuming normal REST status codes without checking.',
        'Hard-coding a booking id like 1.',
        'Putting the admin password straight into the test file.',
      ],
    },
    {
      id: 'pw-api-network-iq-05',
      difficulty: 'hard',
      question: 'Your test clicks Save and then waits for the API response. Sometimes it times out, even though the network log shows the response arrived. Why, and how do you fix it?',
      whatInterviewerLooksFor: [
        'Spots the race: the listener starts after the click',
        'Knows the "promise first" pattern',
        'Uses a function to match the exact call',
        'Thinks about checking the UI instead',
      ],
      modelAnswer: `**Cause:** the code probably looks like this:

\`await page.getByRole('button', { name: 'Save' }).click();\`
\`const res = await page.waitForResponse('**/api/profile');\`

\`waitForResponse\` only sees responses that arrive **after** you call it. When the server is fast, the response is done before the click finishes. Then the listener starts too late, and the wait runs until the timeout. On a slower environment it happens to work. That is why it fails only sometimes.

**Fix: start waiting, do the action, then await.**
\`const resPromise = page.waitForResponse(r => r.url().includes('/api/profile') && r.request().method() === 'PUT');\`
\`await page.getByRole('button', { name: 'Save' }).click();\`
\`const res = await resPromise;\`
\`await expect(res).toBeOK();\`

The **function** also stops you catching a different call to the same URL, such as a GET that reloads the profile.

**Even better:** if the UI shows a result, like a "Profile saved" message, assert it with \`toBeVisible()\`. Web-first assertions retry, and they match what the user sees. I keep \`waitForResponse\` for when I need the payload or status, or when nothing visible changes.

The same "promise first" rule works for \`waitForRequest\`, \`waitForEvent('download')\` and \`waitForEvent('popup')\`.`,
      followUps: [
        {
          q: 'Could you use Promise.all instead?',
          a: 'Yes: `const [res] = await Promise.all([page.waitForResponse(...), button.click()]);`. Both start together, so the listener exists before the click finishes. The "promise variable first" style does the same and is often easier to read. Both avoid the race.',
        },
        {
          q: 'What if the page sends two identical requests and you need the second one?',
          a: 'Use a function that tells them apart, by method, request body or query string. Or start the second wait after the first response is handled, but before the action that sends the second call. You can also count responses in a `page.on(\'response\')` listener.',
        },
      ],
      pitfalls: [
        'Making the timeout longer.',
        'Adding a waitForTimeout before the click.',
        'Matching only by URL when several calls share it.',
      ],
    },
    {
      id: 'pw-api-network-iq-06',
      difficulty: 'expert',
      question: 'Mocking makes UI tests fast and stable. How do you stop mocks from hiding real integration bugs?',
      context: 'The team now mocks every API call in UI tests. They are happy with a 100% green dashboard.',
      whatInterviewerLooksFor: [
        'Understands contract drift (the real API changes, the mock does not)',
        'Suggests layers: a few real end-to-end tests plus API or contract tests',
        'Keeps fake data close to real data (HAR, shared types, schema checks)',
        'Mocks third parties, but not the team\'s own key flows everywhere',
      ],
      modelAnswer: `A fully mocked suite only proves the UI reacts correctly **to the answers we imagined**.

**Example:** the backend renames \`totalprice\` to \`total_price\`. Every mocked test stays green, but production breaks. This is called **contract drift**: the real API changed, and the mock did not.

**What I would put in place:**
1. **Real-backend smoke tests.** A small set — login, create booking, pay, cancel. No mocks except third parties. Run them on every deploy. They catch wiring, config and contract problems.
2. **API tests against the real service**, using the \`request\` fixture. Cover every endpoint, success and failure. Add **schema checks** (Ajv or Zod) on the responses.
3. **Keep mocks honest:**
   - Build fake data from the same schema or types the API tests check. Then a schema change breaks the mocks too.
   - Prefer \`route.fetch()\` plus a small edit over a fully made-up body. You keep the real structure and change one field.
   - Record HAR files again on a schedule, for example a weekly job with \`update: true\`. Review the diff.
4. **Consumer-driven contract tests** (for example Pact), if frontend and backend are separate teams.
5. **Clear rules:** mock to reach states (errors, empty, slow, feature flags). Mock third parties (payments, maps, analytics). Do not mock your own happy path in every test.

Then the dashboard shows three layers: mocked UI behaviour, real API checks and real end-to-end smoke. Green on all three really means something.`,
      followUps: [
        {
          q: 'How would you spot drift between a HAR file and the live API automatically?',
          a: 'A scheduled job records the HAR again with `update: true` against staging. It commits the file to a branch, and the pull request diff shows changed fields. Or check both the HAR responses and the live responses against the same JSON schema. Then any mismatch fails one of them.',
        },
        {
          q: 'Which outside services would you always mock?',
          a: 'Services you do not own or control: payment gateways, SMS and email providers, maps, analytics, ads and social logins. They are slow and limited. Some cost money. Their failures say nothing about your app. Test those integrations separately in their sandbox environments.',
        },
      ],
      pitfalls: [
        'Calling mocked tests "end-to-end".',
        'Never recording HARs again or updating fake data.',
        'Mocking everything or nothing, with no plan.',
      ],
    },
    {
      id: 'pw-api-network-iq-07',
      difficulty: 'hard',
      question: 'How do you handle login tokens across hundreds of API tests, without slowing the suite or leaking secrets?',
      whatInterviewerLooksFor: [
        'Worker-scoped fixture or setup project',
        'Knows how extraHTTPHeaders and storageState work',
        'Secrets from environment variables or CI, in files Git ignores',
        'Handles token expiry and keeps tests independent',
      ],
      modelAnswer: `**Goal:** log in rarely, never commit secrets, and keep tests independent.

**Example:** with 4 workers, a worker-scoped login fixture logs in 4 times for the whole run, not hundreds of times.

**How it works:**
- A **worker-scoped fixture** calls \`POST /auth\` once per worker, using \`request.newContext()\`. A worker is one test process. The fixture then makes a logged-in APIRequestContext with \`extraHTTPHeaders\` — \`Authorization: Bearer …\` or \`Cookie: token=…\`. Every test in that worker gets it through \`use()\`. It is disposed at the end.
- For UI tests, a **setup project** logs in once (through the API is fastest). It saves \`storageState\` to \`playwright/.auth/user.json\`. **storageState** is a saved file of cookies and local storage. Browser projects list the setup project as a dependency and load that file. \`apiContext.storageState({ path })\` carries an API login into the browser.

**Secrets:**
- Login details come from \`process.env\`. Locally, a \`.env\` file loaded with dotenv and listed in \`.gitignore\`. In CI, secrets such as GitHub Actions \`secrets.BOOKER_PASS\`, passed in as environment variables.
- \`playwright/.auth\` is ignored by Git, because it holds live session cookies.
- Traces and HARs can hold tokens. Keep them stored only for a short time.

**Expiry and roles:**
- If tokens expire before a worker finishes, refresh inside the fixture. Or use per-test login for those tests.
- Each role (admin, guest) gets its own fixture or state file. A test says which role it needs.

**Isolation:** sharing a token is fine. Sharing *data* is not. Each test still creates its own records.`,
      followUps: [
        {
          q: 'Why not log in once in globalSetup and write the token to a file?',
          a: 'You can, and it means the fewest logins. But setup projects are now recommended over globalSetup. They appear in the report, get traces and can use fixtures. A token file must also be ignored by Git, and it may expire in long runs. A worker fixture is simpler when only API tests need the token.',
        },
        {
          q: 'A test must check that an expired token is rejected. How?',
          a: 'Do not use the shared fixture for it. Create a separate context with a wrong or expired token, or a token you cancel through a logout endpoint. Then assert 401 or 403. Keeping this out of the shared fixture stops it from breaking other tests.',
        },
      ],
      pitfalls: [
        'Writing tokens or passwords in test files.',
        'Logging in before every request.',
        'Committing the .auth folder or the .env file.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-api-network-drill-1',
      question:
        'For each case, pick `route.fulfill`, `route.abort`, `route.continue` (maybe with changes) or `route.fetch` + `fulfill`. Say why. (a) Show the "No bookings yet" empty state. (b) Test the offline banner. (c) Block Google Analytics and images to speed up tests. (d) Add the header `X-Feature-NewCheckout: on` to API calls. (e) Show one real product as out of stock, but keep the rest of the real catalogue. (f) See the loading skeleton for 2 seconds, still with real data.',
      assumptions: [
        'All calls come from the browser page, not the request fixture.',
        'Routes are added before the page opens.',
      ],
      steps: [
        { label: '(a) empty state', calc: 'fulfill({ json: [] }) — we need a specific body the real DB may not have.' },
        { label: '(b) offline banner', calc: 'abort(\'internetdisconnected\') — the app must see a network failure, not an HTTP response.' },
        { label: '(c) analytics/images', calc: 'abort() — never reach the network; less noise, faster runs.' },
        { label: '(d) feature header', calc: 'continue({ headers: { ...route.request().headers(), \'x-feature-newcheckout\': \'on\' } }) — real server, modified request.' },
        { label: '(e) one item out of stock', calc: 'fetch() → edit json[i].stock = 0 → fulfill({ response, json }) — real data, one field patched.' },
        { label: '(f) slow but real', calc: 'await a 2s timer inside the handler, then continue() — real response, simulated latency.' },
      ],
      answer: `Use **fulfill** when you need a made-up answer (a). Use **abort** for a network failure, or to block traffic (b, c). Use **continue** when the real server should answer, maybe with a changed request or a delay (d, f). Use **fetch + fulfill** for real data with a small edit (e).`,
      insight: 'Ask two questions. "Should the real server be called?" and "Do I change the request, the response, or neither?" The answers pick the method.',
      followUps: [
        {
          q: 'For (a), why not delete all bookings in staging to get the empty state?',
          a: 'It would destroy shared data and break other people\'s tests. It could never run in parallel. A mock gives the state at once, only for this page. Other tests still cover the real "list with data" case.',
        },
      ],
    },
    {
      id: 'pw-api-network-drill-2',
      question:
        'A UI suite has 120 tests. Each creates a booking through a form first (24 s on average). Then the real test steps run (12 s on average). It runs on 3 browser projects with 4 workers. How much time is saved if setup moves to an API call that takes 0.6 s?',
      assumptions: [
        'Test runs = 120 tests × 3 projects = 360.',
        'Work is shared evenly across 4 workers.',
        'Ignore worker start-up and report time.',
      ],
      steps: [
        { label: 'Before, per test', calc: '24 s setup + 12 s steps = 36 s' },
        { label: 'Before, total', calc: '360 × 36 s = 12,960 s of work ÷ 4 workers = 3,240 s ≈ 54 min' },
        { label: 'After, per test', calc: '0.6 s + 12 s = 12.6 s' },
        { label: 'After, total', calc: '360 × 12.6 s = 4,536 s ÷ 4 = 1,134 s ≈ 19 min' },
        { label: 'Saving', calc: '54 − 19 ≈ 35 min per run (~65%)' },
        { label: 'Bonus: flake exposure', calc: '~10 fewer UI steps per test × 360 runs = 3,600 fewer chances to flake per run' },
      ],
      answer: `About **54 min → 19 min**. That saves about **35 minutes (≈65%)** per run. There are also thousands fewer UI steps that could fail at random. Keep 1–2 tests that still use the booking form in the UI.`,
      insight: 'Setup is often most of a UI test\'s time. Moving it to the API is usually the biggest speed-up you can get — bigger than adding workers.',
      followUps: [
        {
          q: 'Would adding 4 more workers save a similar amount?',
          a: 'Only if the machine has enough CPU and memory. Doubling workers on a 4-CPU runner usually causes slowdowns and random failures, not half the time. Even with perfect scaling, 8 workers take the old suite from 54 to 27 min. That is still slower than API setup with 4 workers. And the two ideas can be combined.',
        },
      ],
    },
    {
      id: 'pw-api-network-drill-3',
      question:
        'Which URLs does each route pattern catch? Patterns: P1 `**/api/booking`, P2 `**/api/booking*`, P3 `**/api/*/items`, P4 `/\\/api\\/booking/` (RegExp). URLs: U1 `https://shop.test/api/booking`, U2 `https://shop.test/api/booking?page=2`, U3 `https://shop.test/api/booking/42`, U4 `https://shop.test/api/v2/cart/items`.',
      assumptions: [
        'Glob rules: `*` matches anything except `/`. `**` matches anything, including `/`. The glob must match the whole URL.',
        'A RegExp matches if it is found anywhere in the URL.',
      ],
      steps: [
        { label: 'P1 **/api/booking', calc: 'U1 ✓. U2 ✗ (extra "?page=2"). U3 ✗ (extra "/42"). U4 ✗.' },
        { label: 'P2 **/api/booking*', calc: 'U1 ✓, U2 ✓ ("?page=2" has no slash). U3 ✗ ("/42" contains a slash). U4 ✗.' },
        { label: 'P3 **/api/*/items', calc: 'Single * cannot span "v2/cart" (contains "/") → U4 ✗. Others ✗.' },
        { label: 'P4 RegExp /\\/api\\/booking/', calc: 'U1 ✓, U2 ✓, U3 ✓ (substring match). U4 ✗.' },
        { label: 'Fix for U4', calc: 'Use **/api/**/items or a RegExp like /\\/api\\/.*\\/items$/' },
      ],
      answer: `P1 → U1 only. P2 → U1, U2. P3 → none (a single \`*\` cannot cross \`/\`). P4 → U1, U2, U3. The most common bug is P1: people forget that the query string is part of the URL.`,
      insight: 'A glob must match the whole URL, and `*` stops at slashes. When unsure, use a RegExp or a function. Also add a quick check that the route really ran.',
      followUps: [
        {
          q: 'How can a test prove that your mock was really used?',
          a: 'Count calls in the handler (`let hits = 0; ... hits++`). At the end, assert `expect(hits).toBeGreaterThan(0)`. Or check for text that only the mock contains, like a fake product name the real backend does not have.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-api-network-mcq-01',
      difficulty: 'easy',
      question: 'A test logs in through the UI. Then it must call a protected endpoint as the same logged-in shopper. Which object sends the browser\'s login cookies automatically?',
      options: ['page.request', 'the request fixture', 'playwright.request.newContext()', 'Node\'s global fetch()'],
      correct: [0],
      explanation:
        '`page.request` (like `context.request`) uses the same cookies as the browser context. So the login cookie goes with every call. The `request` fixture and `newContext()` each have their own separate cookies. Plain `fetch()` knows nothing about the browser at all.',
      followUps: [
        {
          q: 'When is the separate request fixture the better choice?',
          a: 'For pure API tests, and for setup and clean-up that should not depend on any browser login. For example, creating a booking before the UI test starts, or checking that a call without login is rejected.',
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
        '`toBeOK()` is the response assertion for statuses 200–299. Its failure message includes the response details. `ok()` with `toBe(true)` works, but only says "expected true, received false". `status()` is truthy for 404 or 500 too. `toHaveStatus` is not a Playwright matcher.',
      followUps: [
        {
          q: 'How do you check for exactly 201?',
          a: 'expect(response.status()).toBe(201). `status()` is not async, so this call needs no await.',
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
        '`json()` is async. Without `await`, `body` is a Promise, so `bookingid` is undefined and the check fails in a confusing way. An object in `data` is turned into JSON for you. `post` does not throw on 4xx or 5xx by default. Relative URLs work when `baseURL` is set.',
      followUps: [
        {
          q: 'What else would you add to this test?',
          a: 'A status check (`expect(res.status()).toBe(200)` for Restful Booker, or `toBeOK()`). A `toMatchObject` on `body.booking`, to compare sent and saved data. And clean-up of the booking you created.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-04',
      difficulty: 'medium',
      question: 'On Restful Booker, which headers do PUT, PATCH and DELETE accept for login? Select ALL that apply.',
      options: [
        'Cookie: token=<token from POST /auth>',
        'Authorization: Basic <base64 of admin:password123>',
        'X-Api-Key: <token>',
        'Authorization: Bearer <token>',
      ],
      correct: [0, 1],
      explanation:
        'Restful Booker accepts the token as a cookie named `token`, or HTTP Basic auth with the admin login. It does not read an `X-Api-Key` header. A Bearer token is not its documented method either. Both of those return 403.',
      followUps: [
        {
          q: 'What status does DELETE return on success there?',
          a: '201, which is unusual (204 or 200 is more common). Assert the real value. Think about reporting it as an API design bug.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-05',
      difficulty: 'medium',
      question: 'A test needs the bookings page to show "No bookings yet". The real server always has data. What is the best approach?',
      options: [
        "Register page.route('**/api/bookings*', r => r.fulfill({ json: [] })) before page.goto",
        'Delete every booking in staging via the API before the test',
        "Call page.route after page.goto so the first load is real",
        "Use route.abort() so the list is empty",
      ],
      correct: [0],
      explanation:
        'Fulfilling with an empty array gives exactly this state, only for this page, before the request starts. Deleting shared staging data breaks other tests and parallel runs. Adding the route after goto misses the first request. Abort fakes a network error, which usually shows an error screen, not the empty state.',
      followUps: [
        {
          q: 'How would you prove the mock was used?',
          a: 'Count handler calls and assert at least one. Or check the empty-state text, which real data would never show. Both catch a route pattern that quietly matched nothing.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-06',
      difficulty: 'medium',
      question: 'On fast environments, the booking check below sometimes hits its timeout. What is the cause?',
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
        'Listeners only see responses after they start. A fast response can finish during the click, so the wait never ends. Globs, RegExps and functions are all accepted. `toBeOK()` works on page responses too. `click()` does not wait for the network to go quiet.',
      followUps: [
        {
          q: 'Rewrite it.',
          a: "const p = page.waitForResponse('**/api/booking'); await page.getByRole('button', { name: 'Book now' }).click(); await expect(await p).toBeOK(); — start listening first, click second.",
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-07',
      difficulty: 'hard',
      question: 'Which URLs will this handler catch? Select ALL that apply.',
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
        'The last `*` matches anything except `/`. So it covers nothing extra, a query string, and "-available". `/12` has a slash, so `*` cannot match it. "/api/room" is missing the "s" in "rooms". The leading `**` matches any host and path before it.',
      followUps: [
        {
          q: 'How would you also match /api/rooms/12?',
          a: 'Use `**/api/rooms**`, or add a second route `**/api/rooms/*`, or use a RegExp like `/\\/api\\/rooms/`. Be careful that a wide pattern does not catch other endpoints.',
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
        'Playwright runs matching handlers in reverse order of adding. So B, added last and more specific, handles /api/cart. If B called `route.fallback()`, A would get the request next. Handlers never run in parallel for one request. Overlapping patterns are allowed.',
      followUps: [
        {
          q: 'How does this help with shared fixtures?',
          a: 'A fixture can add default mocks. A test adds its own mock afterwards, and that one wins. The test\'s mock can call `fallback()` for cases it does not care about, so the defaults still apply.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-09',
      difficulty: 'medium',
      question: 'You want real product data, but with one product showing `stock: 0`. Which handler does that?',
      options: [
        'const response = await route.fetch(); const json = await response.json(); json[0].stock = 0; await route.fulfill({ response, json });',
        'await route.continue({ postData: JSON.stringify({ stock: 0 }) });',
        "await route.abort('failed');",
        'await route.fulfill({ json: { stock: 0 } });',
      ],
      correct: [0],
      explanation:
        '`route.fetch()` gets the real response. You change one field and fulfill with the original response plus the new JSON. `continue` with `postData` changes the request body sent to the server, not the response. `abort` fails the request. A hand-written `{ stock: 0 }` replaces the whole catalogue with one useless object.',
      followUps: [
        {
          q: 'What does passing `response` to fulfill keep?',
          a: 'The original status code and headers (content type, caching headers and so on). The page sees a realistic response. Only the body you gave changes.',
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
        'Routes cover only that page\'s browser traffic. Request-fixture calls go straight from Node. Service-worker traffic can be invisible to routes. A route added late misses requests already sent. Routes do not apply to other browser contexts. `context.route` covers popups in one context, not other contexts.',
      followUps: [
        {
          q: 'When would you use context.route instead?',
          a: 'When a test opens popups or new tabs (like a payment window) that make the same API calls. `context.route` applies to every page in that context, including pages opened later.',
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
        'The API reports a failed login with status 200 and a `reason` field. So a status-only test passes with a wrong password. You must check that the `token` field exists. It does not return 201 here. `status()` can be read. The token is in the JSON body.',
      followUps: [
        {
          q: 'Would you report this as a bug?',
          a: 'Yes, as an API design bug. A failed login should return 401, so apps and monitoring can spot it. Until it is fixed, the tests check the body directly.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-12',
      difficulty: 'medium',
      question: 'Which habits make API-based test setup reliable when tests run in parallel? Select ALL that apply.',
      options: [
        'Generate unique names (e.g. with Date.now() or workerIndex) for created records',
        'Delete created records in fixture teardown after `use()`',
        'Store the created id in a module-level variable for the next test',
        'Reuse booking id 1 because it always exists',
      ],
      correct: [0, 1],
      explanation:
        'Unique data stops workers from clashing. Fixture clean-up runs even when tests fail. A module-level id makes tests depend on order, so they break with parallel runs and retries. Assuming id 1 exists uses data you do not own on a shared API.',
      followUps: [
        {
          q: 'Why is a fixture better than afterEach for clean-up?',
          a: 'Setup and clean-up live together, and the test lists the fixture it needs. No shared variable between hooks can get out of sync. Only tests that use the fixture pay for it.',
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
        'Like `page.route`, HAR routing only affects requests sent after it is added. The catalog loaded during `goto`. Replay is the default (`update` is false). `page.routeFromHAR` exists next to the context version. `url` accepts a glob.',
      followUps: [
        {
          q: 'What happens to a request that matches the url pattern but is not in the HAR?',
          a: 'By default it is aborted (`notFound: \'abort\'`), so missing recordings are obvious. With `notFound: \'fallback\'` it goes to the next handler or the network.',
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
        '`page.request` and `context.request` use the browser context\'s cookies. `newContext()` is separate and needs `dispose()`. `storageState()` saves its cookies for `browser.newContext({ storageState })`. The `request` fixture has its own cookies. It does not share cookies with `page`.',
      followUps: [
        {
          q: 'Give a use for the shared cookies.',
          a: 'Log in through the UI. Then call a protected API with `page.request.get(...)` to check server data as the same user. You never handle tokens by hand.',
        },
      ],
    },
    {
      id: 'pw-api-network-mcq-15',
      difficulty: 'expert',
      question: 'A team mocks every API call in all 300 UI tests. Production broke when the backend renamed a JSON field, yet all tests stayed green. Which steps would have caught it? Select ALL that apply.',
      options: [
        'A small real-backend E2E smoke suite with no mocks of first-party APIs',
        'API tests with schema validation against the real service',
        'Raising the retry count on CI',
        'Periodically re-recording HAR files and reviewing the diff',
        'Increasing the expect timeout for mocked tests',
      ],
      correct: [0, 1, 3],
      explanation:
        'Real-backend smoke tests, API tests with schema checks and refreshed HARs all compare against the real API. So the rename would show up. Retries and timeouts change nothing. The fake responses never had the new field name, so the tests keep passing.',
      followUps: [
        {
          q: 'What is this kind of failure called?',
          a: 'Contract drift: the mock describes an API that no longer exists. Consumer-driven contract testing (for example Pact) is a formal way to prevent it between teams.',
        },
      ],
    },
  ],
};

export default topic;
