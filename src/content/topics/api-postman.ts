import type { Topic } from '../../types';

const topic: Topic = {
  id: 'api-postman',
  phase: 'api-sql',
  order: 2,
  title: 'API Testing with Postman & Newman',
  subtitle:
    'Collections, environments and variable scopes, pm.* scripts and assertions, chaining tokens and ids, data-driven runs, Newman in CI, mock servers and a full Restful Booker CRUD walkthrough.',
  estimatedMinutes: 100,
  sources: [
    'Postman Learning Center — Store and reuse values using variables (scopes and precedence)',
    'Postman Learning Center — Write scripts / Test scripts (pre-request and post-response)',
    'Postman Learning Center — pm.response and pm.execution sandbox reference (jsonSchema uses Ajv 6.12.5)',
    'Postman Learning Center — Run collections with data files; Newman command options',
    'Postman Learning Center — Set up mock servers',
    'newman-reporter-htmlextra README (Danny Dainton)',
    'Chai.js — BDD assertion style (used by pm.expect)',
    'Restful Booker API docs — restful-booker.herokuapp.com/apidoc',
    'Testleaf blog — API Testing Interview Questions 2025',
    'softwaretestpilot.com — Postman interview questions',
  ],
  tags: ['postman', 'newman', 'api-testing', 'variables', 'pm-test', 'chaining', 'data-driven', 'mock-server', 'ci'],
  cheatSheet: [
    'Workspace → collection → folders → requests (+ saved examples). Scripts and auth can live on the collection, folder or request.',
    'Variable scopes, broadest → narrowest: global, collection, environment, data (iteration file), local. Narrowest wins on a name clash.',
    'Set/get: pm.environment.set/get, pm.collectionVariables.set/get, pm.globals.set/get, pm.iterationData.get, pm.variables.get (resolves through every scope).',
    'Script order per request: collection pre-request → folder pre-request → request pre-request → SEND → collection post-response → folder post-response → request post-response.',
    'Assertions: pm.test("name", () => { pm.response.to.have.status(200); pm.expect(json.x).to.eql(y); }). Parse JSON inside the test so a bad body fails one test, not the whole script.',
    'Schema: pm.response.to.have.jsonSchema(schema). Postman uses Ajv 6, so write draft-07 schemas. tv4 is legacy.',
    'Chaining: login post-response saves the token, create saves the id, later requests use {{token}} / {{bookingId}}. Clear variables at the end of the run.',
    'Data-driven: Collection Runner + CSV/JSON file; each row = one iteration; columns become {{vars}} and pm.iterationData.get("col").',
    'pm.execution.setNextRequest("name") / setNextRequest(null) only work in a collection run; pm.execution.skipRequest() works only in pre-request.',
    'Newman: newman run collection.json -e env.json -d data.csv -r cli,junit,htmlextra. Exits non-zero when any test fails, so CI goes red.',
    'Mock server: built from saved examples; pick one with x-mock-response-name / x-mock-response-code headers; private mocks need x-api-key.',
    'Restful Booker: POST /auth → token; PUT/PATCH/DELETE need Cookie: token=… or Basic YWRtaW46cGFzc3dvcmQxMjM=; create returns 200, delete returns 201.',
  ],
  sections: [
    {
      heading: 'Postman building blocks: workspaces, collections, requests, examples',
      body: `**Intuition:** Postman is a notebook for API calls. A **collection** is one notebook per API or feature, **folders** are chapters, each **request** is a page, and **saved examples** are photocopies of real answers you keep for reference (and for mocking).

| Building block | What it holds | Tester tip |
|---|---|---|
| **Workspace** | Collections, environments, mocks for a team | Use a team workspace so tests are shared and reviewed, not on one laptop |
| **Collection** | Requests + collection-level auth, variables, scripts | Put shared auth and common checks here once |
| **Folder** | Group of requests (e.g. "Booking CRUD", "Negative") | Folders can be run on their own (\`--folder\` in Newman) |
| **Request** | Method, URL, params, headers, body, scripts | Name it like a test: "PUT booking — no token → 403" |
| **Example** | A saved request/response pair | Documents the contract; feeds mock servers |
| **Environment** | A named set of variables (QA, staging) | Switch target servers without editing requests |

**Request tabs you use daily:** *Params* (query), *Authorization* (inherit from parent, Basic, Bearer, API key, OAuth 2.0), *Headers*, *Body* (raw JSON, form-data for uploads, x-www-form-urlencoded), *Scripts* (Pre-request and Post-response), and *Settings*.

**Collaboration and history:** collections can be forked and merged (like Git branches), and exported as \`collection.json\` (format v2.1) for version control and Newman. The **Console** (View → Show Postman Console) shows the raw request actually sent, with variables resolved and headers included. It is your first debugging tool.

**Common mistake:** one giant collection with 300 unnamed requests and hard-coded URLs. Structure by feature, use variables, and name every request after what it proves.`,
      diagram: `Workspace "Hotel QA"
 ├─ Collection "Restful Booker"      (auth: inherit, vars, scripts)
 │   ├─ Folder "00 Setup"            POST /auth
 │   ├─ Folder "01 CRUD happy path"  POST, GET, PUT, PATCH, DELETE
 │   └─ Folder "02 Negative"         no token, bad id, bad types
 ├─ Environment "RB - public"        baseUrl, username, password
 └─ Mock server "RB mock"            serves saved examples`,
      keyPoints: [
        'Collection > folder > request; auth and scripts can be inherited from parents.',
        'Saved examples document the contract and power mock servers.',
        'Use the Postman Console to see exactly what was sent.',
      ],
      source: 'Postman Learning Center — Collections, Requests, Postman Console',
    },
    {
      heading: 'Environments and variable scopes',
      body: `**Intuition:** variables are labelled jars. A jar on your own desk (local) beats one in the team kitchen (global) if both have the same label. Postman always uses the **closest** jar.

**Scopes, broadest to narrowest:**

| Scope | Lives in | Typical content | Set from a script |
|---|---|---|---|
| Global | Whole workspace | Rarely needed; quick experiments | \`pm.globals.set('k', v)\` |
| Collection | One collection | API version, ids created during a run | \`pm.collectionVariables.set('k', v)\` |
| Environment | Selected environment | \`baseUrl\`, credentials per env | \`pm.environment.set('k', v)\` |
| Data | CSV/JSON row in a run | Test inputs per iteration | read-only: \`pm.iterationData.get('k')\` |
| Local | Current request / run only | Temporary values in scripts | \`pm.variables.set('k', v)\` |

**Precedence:** when the same name exists in several scopes, the **narrowest wins**: local > data > environment > collection > global. \`pm.variables.get('k')\` returns the value that would win, which is what \`{{k}}\` resolves to.

**Shared vs local values:** each variable has a value that syncs to the Postman cloud for teammates (historically called *initial value*) and a value that stays on your machine (*current value*). Put real passwords and tokens only in the local/current value, or mark the variable as **secret** or use Postman Vault, so they aren't synced or exported.

**Worked example:** \`baseUrl\` is \`https://prod.example.com\` as a global, and \`https://restful-booker.herokuapp.com\` in the *RB - public* environment. With that environment selected, \`{{baseUrl}}\` resolves to Restful Booker. Switch to *No environment* and the same request suddenly hits production. That's why risky values should never be global.`,
      code: [
        {
          language: 'javascript',
          title: 'Setting and reading each scope (post-response script)',
          code: `// Environment: per-target values (QA vs staging)
pm.environment.set('baseUrl', 'https://restful-booker.herokuapp.com');

// Collection: values produced during the run and shared by its requests
const json = pm.response.json();
pm.collectionVariables.set('bookingId', json.bookingid);

// Local: only for this request's scripts
pm.variables.set('startedAt', Date.now());

// Data: values from the current CSV/JSON row (collection runs only)
const expectedStatus = Number(pm.iterationData.get('expectedStatus'));

// Resolve like {{name}} would: narrowest scope wins
console.log(pm.variables.get('baseUrl'));
// → https://restful-booker.herokuapp.com

// Resolve placeholders inside any string
console.log(pm.variables.replaceIn('{{baseUrl}}/booking/{{bookingId}}'));
// → https://restful-booker.herokuapp.com/booking/1093

// Clean up so the next run starts fresh
pm.collectionVariables.unset('bookingId');`,
        },
      ],
      keyPoints: [
        'Narrowest scope wins: local > data > environment > collection > global.',
        'Environment = where you test; collection = values the run creates; data = inputs per iteration.',
        'Secrets stay in local/current values, secret type, or Vault; never in shared values.',
      ],
      source: 'Postman Learning Center — Store and reuse values using variables',
    },
    {
      heading: 'Pre-request and post-response scripts: when each runs',
      body: `**Intuition:** a pre-request script is packing your bag before leaving (fresh token, timestamp, random email). A post-response script is unpacking and checking nothing is broken (assertions, saving values for the next trip).

Postman runs JavaScript in a sandbox with the \`pm\` object. Scripts can be attached at **three levels**, and run in this order for every request:`,
      diagram: `            BEFORE SEND                         AFTER RESPONSE
  collection pre-request              collection post-response
          |                                   |
  folder pre-request                  folder post-response
          |                                   |
  request pre-request                 request post-response
          |                                   ^
          +------------> HTTP request ------>-+`,
      code: [
        {
          language: 'javascript',
          title: 'Typical pre-request script: unique test data',
          code: `// Unique data avoids "already exists" clashes between runs
const stamp = Date.now();
pm.variables.set('firstname', 'Auto' + stamp);

// Dates relative to today keep tests valid forever
const day = 24 * 60 * 60 * 1000;
const toISODate = (ms) => new Date(ms).toISOString().slice(0, 10);
pm.variables.set('checkin', toISODate(stamp + 7 * day));
pm.variables.set('checkout', toISODate(stamp + 10 * day));

// Skip this request in a run if setup did not produce a token
if (!pm.collectionVariables.get('token')) {
  console.warn('No token yet, skipping ' + pm.info.requestName);
  pm.execution.skipRequest(); // pre-request only
}`,
        },
      ],
      keyPoints: [
        'Pre-request: prepare data, auth, timestamps. Post-response: assert and save values.',
        'Collection-level scripts run for every request: perfect for shared checks.',
        'pm.execution.skipRequest() exists only in pre-request scripts.',
      ],
      source: 'Postman Learning Center — Write scripts; pm.execution reference',
    },
    {
      heading: 'Writing assertions with pm.test and pm.expect',
      body: `**Intuition:** \`pm.test\` is a labelled checkbox in the results; \`pm.expect\` is the actual check inside it. If any check in the box fails, that box is red, and the other boxes still run.

**Patterns you'll use daily:**

| Check | Code |
|---|---|
| Status | \`pm.response.to.have.status(200)\` or \`pm.expect(pm.response.code).to.be.oneOf([200, 204])\` |
| Header | \`pm.response.to.have.header('Content-Type')\` and \`pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json')\` |
| Body field | \`pm.expect(json.booking.firstname).to.eql('Sally')\` |
| Type | \`pm.expect(json.bookingid).to.be.a('number')\` |
| Property exists | \`pm.expect(json).to.have.property('token')\` |
| Array | \`pm.expect(list).to.be.an('array').that.is.not.empty\` |
| Time | \`pm.expect(pm.response.responseTime).to.be.below(800)\` |

**\`eql\` vs \`equal\`:** \`equal\` is strict identity (\`===\`), fine for strings and numbers but fails for two separate objects with the same content. \`eql\` compares deeply. Use \`eql\` for objects and arrays.

**Golden rules:**
1. Parse the body **inside** a \`pm.test\`; if the server returns HTML, only that test fails instead of the whole script crashing.
2. Compare against **what you sent**, not hard-coded literals scattered around.
3. One behaviour per test name, written as a sentence: "status is 200", "booking echoes request body".
4. Avoid the legacy syntax (\`tests['x'] = …\`, \`responseBody\`, \`postman.setEnvironmentVariable\`). It still runs, but it's deprecated.`,
      code: [
        {
          language: 'javascript',
          title: 'Post-response tests for GET /booking/:id',
          code: `pm.test('status is 200', () => {
  pm.response.to.have.status(200);
});

pm.test('response is JSON', () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

pm.test('booking has the fields and types we rely on', () => {
  const b = pm.response.json(); // parsed inside the test on purpose
  pm.expect(b.firstname).to.be.a('string').and.not.empty;
  pm.expect(b.totalprice).to.be.a('number').and.to.be.at.least(0);
  pm.expect(b.depositpaid).to.be.a('boolean');
  pm.expect(b.bookingdates).to.have.all.keys('checkin', 'checkout');
});

pm.test('checkout is after checkin', () => {
  const { checkin, checkout } = pm.response.json().bookingdates;
  pm.expect(new Date(checkout).getTime()).to.be.above(new Date(checkin).getTime());
});

pm.test('responds within 800 ms', () => {
  pm.expect(pm.response.responseTime).to.be.below(800);
});`,
        },
      ],
      keyPoints: [
        'pm.test groups checks; a failing pm.expect fails only its own test.',
        'Use eql for deep comparison of objects/arrays; equal is strict ===.',
        'Parse JSON inside the test; avoid legacy tests[] / responseBody syntax.',
      ],
      source: 'Postman Learning Center — Test scripts; Chai.js BDD API',
    },
    {
      heading: 'JSON Schema validation and reusable checks',
      body: `**Intuition:** value assertions check that the pizza has cheese; the schema checks that it's a pizza. In Postman one line validates the whole shape.

\`pm.response.to.have.jsonSchema(schema)\` validates the body with **Ajv 6.12.5**, so write schemas in **draft-07** style (the \`2020-12\` keywords aren't understood by that version). The older \`tv4.validate\` is legacy; don't learn it now.

**Make it reusable:** store the schema once (in a collection variable or in the collection-level script) instead of copy-pasting it into 20 requests. A common trick is to keep shared helper code in the **collection pre-request script** and expose it through \`pm.collectionVariables\` as a JSON string, or simply define schemas in the collection post-response script and decide per request name which one applies. Postman also supports **package library** scripts for reuse in team plans.

**Collection-level safety net:** some checks belong on *every* request. Put them in the collection's post-response script:
- no 5xx responses,
- response time under a generous ceiling,
- JSON responses actually declare \`Content-Type: application/json\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Schema test for POST /booking (draft-07 for Ajv 6)',
          code: `const bookingSchema = {
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: { type: 'integer' },
    booking: {
      type: 'object',
      required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
      additionalProperties: false,
      properties: {
        firstname: { type: 'string', minLength: 1 },
        lastname: { type: 'string', minLength: 1 },
        totalprice: { type: 'integer', minimum: 0 },
        depositpaid: { type: 'boolean' },
        bookingdates: {
          type: 'object',
          required: ['checkin', 'checkout'],
          properties: {
            checkin: { type: 'string', pattern: '^\\\\d{4}-\\\\d{2}-\\\\d{2}$' },
            checkout: { type: 'string', pattern: '^\\\\d{4}-\\\\d{2}-\\\\d{2}$' },
          },
        },
        additionalneeds: { type: 'string' },
      },
    },
  },
};

pm.test('create-booking response matches schema', () => {
  pm.response.to.have.jsonSchema(bookingSchema);
});`,
        },
        {
          language: 'javascript',
          title: 'Collection-level post-response safety net',
          code: `// Runs after EVERY request in the collection
pm.test('[global] no server error', () => {
  pm.expect(pm.response.code, 'status for ' + pm.info.requestName).to.be.below(500);
});

pm.test('[global] response time under 3 s', () => {
  pm.expect(pm.response.responseTime).to.be.below(3000);
});`,
        },
      ],
      keyPoints: [
        'pm.response.to.have.jsonSchema uses Ajv 6: use draft-07 keywords.',
        'Define shared checks once at collection level.',
        'Schema + value assertions together; neither alone is enough.',
      ],
      source: 'Postman Learning Center — pm.response reference (jsonSchema, Ajv 6.12.5); json-schema.org draft-07',
    },
    {
      heading: 'Chaining requests: passing a token and an id',
      body: `**Intuition:** a relay race. The login request hands a baton (token) to the next runner; the create request hands over another baton (the new id). Nobody copy-pastes values by hand.

**The pattern:**
1. **Producer** request saves a value in its post-response script (\`pm.collectionVariables.set('token', …)\`).
2. **Consumer** requests reference it as \`{{token}}\` in a header, URL or body.
3. **Guard**: assert the producer succeeded *before* saving, so a failed login doesn't silently cascade into 20 confusing failures.
4. **Cleanup**: unset or delete what you created at the end.

**Where to store chained values:** collection variables are a good default: they travel with the collection, don't pollute the shared environment, and Newman can export them. Use the environment when the value is really per-environment.

**Auto-auth alternative:** instead of a separate login request, a **collection-level pre-request script** can call the auth endpoint with \`pm.sendRequest\` and refresh the token only when it's missing or old. Every request then works on its own, even when run individually.

**Order control in a run:** requests run top to bottom. \`pm.execution.setNextRequest('Request name')\` jumps to another request and \`pm.execution.setNextRequest(null)\` stops the run. Both work **only in the Collection Runner/Newman**, not when you click Send.`,
      code: [
        {
          language: 'javascript',
          title: 'POST /auth (post-response): produce the token',
          code: `pm.test('auth returns 200', () => {
  pm.response.to.have.status(200);
});

const body = pm.response.json();

// Restful Booker returns 200 + {"reason":"Bad credentials"} on failure,
// so the status alone is not enough: check the token exists.
pm.test('auth returned a token', () => {
  pm.expect(body, JSON.stringify(body)).to.have.property('token');
});

if (body.token) {
  pm.collectionVariables.set('token', body.token);
} else {
  pm.collectionVariables.unset('token');
  pm.execution.setNextRequest(null); // stop the run: nothing else can pass
}`,
        },
        {
          language: 'http',
          title: 'Consumer: PUT uses both chained values',
          code: `PUT {{baseUrl}}/booking/{{bookingId}}
Content-Type: application/json
Accept: application/json
Cookie: token={{token}}

{
  "firstname": "{{firstname}}",
  "lastname": "Brown",
  "totalprice": 150,
  "depositpaid": true,
  "bookingdates": { "checkin": "{{checkin}}", "checkout": "{{checkout}}" },
  "additionalneeds": "Late checkout"
}`,
        },
        {
          language: 'javascript',
          title: 'Collection pre-request: auto-auth with pm.sendRequest',
          code: `const TEN_MIN = 10 * 60 * 1000;
const token = pm.collectionVariables.get('token');
const fetchedAt = Number(pm.collectionVariables.get('tokenFetchedAt') || 0);

if (!token || Date.now() - fetchedAt > TEN_MIN) {
  pm.sendRequest(
    {
      url: pm.environment.get('baseUrl') + '/auth',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: {
        mode: 'raw',
        raw: JSON.stringify({
          username: pm.environment.get('username'),
          password: pm.environment.get('password'),
        }),
      },
    },
    (err, res) => {
      if (err || !res.json().token) {
        console.error('Auth failed', err || res.text());
        return;
      }
      pm.collectionVariables.set('token', res.json().token);
      pm.collectionVariables.set('tokenFetchedAt', String(Date.now()));
    },
  );
}`,
        },
      ],
      keyPoints: [
        'Producer saves (after asserting success), consumer uses {{var}}.',
        'Restful Booker returns 200 on bad credentials: check the token field, not just the status.',
        'setNextRequest works only in collection runs; null stops the run.',
        'Collection-level auto-auth makes each request runnable on its own.',
      ],
      source: 'Postman Learning Center — Variables; pm.execution reference; Send requests with pm.sendRequest; Restful Booker API docs (CreateToken)',
    },
    {
      heading: 'Restful Booker CRUD walkthrough',
      body: `**Goal:** a self-contained collection that creates, reads, updates, partially updates and deletes a booking, proves each step, and leaves no data behind.

**Environment "RB - public":** \`baseUrl = https://restful-booker.herokuapp.com\`, \`username = admin\`, \`password = password123\` (public demo credentials; still keep real credentials out of shared values).

| # | Request | Key headers | Expected | Saves / checks |
|---|---|---|---|---|
| 0 | \`GET /ping\` | none | 201 | API is up |
| 1 | \`POST /auth\` | Content-Type | 200 + token | saves \`token\` |
| 2 | \`POST /booking\` | Content-Type, Accept | 200 (not 201) | saves \`bookingId\`; echo + schema |
| 3 | \`GET /booking/{{bookingId}}\` | Accept | 200 | equals what was sent |
| 4 | \`PUT /booking/{{bookingId}}\` | Cookie: token | 200 | all fields replaced |
| 5 | \`PATCH /booking/{{bookingId}}\` | Basic auth | 200 | only totalprice changed |
| 6 | \`DELETE /booking/{{bookingId}}\` | Cookie: token | 201 | (RB quirk) |
| 7 | \`GET /booking/{{bookingId}}\` | Accept | 404 | really gone; unset vars |

**Things the walkthrough teaches:**
- Restful Booker is a **shared public sandbox** that is reset periodically. Never assume an id like 1 exists; create your own data.
- Its deviations (200 for create, 201 for delete, 403 for missing token, 200 for bad credentials) are perfect for practising "is this the contract or a bug?" conversations.
- Request 5 uses **Basic auth** (Authorization tab → Basic Auth → admin / password123, which Postman turns into \`Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=\`) to show both auth options work.`,
      code: [
        {
          language: 'javascript',
          title: '2. POST /booking: post-response',
          code: `// The body we sent, with {{variables}} resolved
const sent = JSON.parse(pm.variables.replaceIn(pm.request.body.raw));

pm.test('create returns 200 (Restful Booker contract)', () => {
  pm.response.to.have.status(200);
});

pm.test('booking echoes the request body', () => {
  const res = pm.response.json();
  pm.expect(res.bookingid).to.be.a('number');
  pm.expect(res.booking).to.eql(sent); // deep compare
  pm.collectionVariables.set('bookingId', res.bookingid);
  pm.collectionVariables.set('sentBooking', JSON.stringify(sent));
});`,
        },
        {
          language: 'javascript',
          title: '5. PATCH and 7. final GET: post-response',
          code: `// ---- 5. PATCH { "totalprice": 175 } ----
pm.test('PATCH changes only totalprice', () => {
  const before = JSON.parse(pm.collectionVariables.get('sentBooking'));
  const after = pm.response.json();
  pm.expect(after.totalprice).to.eql(175);
  // every other field is untouched
  delete before.totalprice;
  delete after.totalprice;
  pm.expect(after).to.eql(before);
});

// ---- 7. GET after DELETE ----
pm.test('deleted booking is gone', () => {
  pm.response.to.have.status(404);
});
pm.collectionVariables.unset('bookingId');
pm.collectionVariables.unset('sentBooking');`,
        },
      ],
      keyPoints: [
        'Create your own data; the public sandbox is shared and reset.',
        'Compare responses with the request you sent (replaceIn + JSON.parse).',
        'PATCH test: changed field updated AND all others untouched.',
        'Finish with a GET that proves the delete, then unset variables.',
      ],
      source: 'Restful Booker API docs (CreateToken, CreateBooking, UpdateBooking, PartialUpdateBooking, DeleteBooking, HealthCheck)',
    },
    {
      heading: 'Data-driven runs with CSV and JSON files',
      body: `**Intuition:** one recipe, many ingredient lists. You write the request and tests once; a data file supplies a new set of inputs and expected results for each **iteration**.

**How it works:**
- In the **Collection Runner** (or Newman \`-d\`), attach a CSV or JSON file.
- Each **row** (CSV) or **object** (JSON array) is one iteration of the whole selected collection/folder.
- Column names become variables: use \`{{firstname}}\` in the request and \`pm.iterationData.get('firstname')\` in scripts.
- Data scope is narrower than environment, so a column named \`baseUrl\` **overrides** the environment's \`baseUrl\`. Avoid name clashes.

**CSV vs JSON:**

| | CSV | JSON |
|---|---|---|
| Easy to edit in Excel / Sheets | Yes | No |
| Types | Everything arrives as a **string** | Real numbers, booleans, nested objects |
| Nested data | Hard | Natural |
| Typical use | Many simple rows | Complex bodies, arrays |

**Tip:** for numeric/boolean fields in a raw JSON body, leave the placeholder **unquoted**: \`"totalprice": {{totalprice}}\`. Quoted, it becomes the string \`"111"\`. For a negative row testing a string price, put the quotes in the data instead.

**Include the expectation in the data** (an \`expectedStatus\` column), so positive and negative rows share one request and one test.`,
      code: [
        {
          language: 'text',
          title: 'booking-data.csv',
          code: `case,firstname,lastname,totalprice,depositpaid,checkin,checkout,expectedStatus
valid-basic,Sally,Brown,111,true,2026-01-01,2026-01-05,200
valid-zero-price,Ravi,Kumar,0,false,2026-02-10,2026-02-11,200
valid-unicode,Zoë,Li,250,true,2026-03-01,2026-03-04,200
missing-firstname,,Brown,111,true,2026-01-01,2026-01-05,400
string-price,Sally,Brown,"""abc""",true,2026-01-01,2026-01-05,400
checkout-before-checkin,Sally,Brown,111,true,2026-01-05,2026-01-01,400`,
        },
        {
          language: 'javascript',
          title: 'Post-response test driven by the row',
          code: `const row = pm.iterationData.toObject(); // whole current row
const expected = Number(row.expectedStatus); // CSV values are strings

pm.test('[' + row.case + '] status is ' + expected, () => {
  pm.response.to.have.status(expected);
});

if (expected === 200) {
  pm.test('[' + row.case + '] echoes firstname', () => {
    pm.expect(pm.response.json().booking.firstname).to.eql(row.firstname);
  });
} else {
  pm.test('[' + row.case + '] error does not leak a stack trace', () => {
    pm.expect(pm.response.text()).to.not.match(/at .+\\(.+:\\d+:\\d+\\)/);
  });
}

console.log('iteration', pm.info.iteration + 1, 'of', pm.info.iterationCount);`,
        },
      ],
      keyPoints: [
        'One row = one iteration of the selected requests.',
        'CSV gives strings; convert with Number() / === "true".',
        'Put expectedStatus in the data so positive and negative rows share one test.',
        'Data variables override environment variables with the same name.',
      ],
      source: 'Postman Learning Center — Run collections using imported data; pm.iterationData reference',
    },
    {
      heading: 'Newman and running collections in CI',
      body: `**Intuition:** the Collection Runner is you pressing "Run" on your laptop. **Newman** is a robot that presses "Run" from the command line, on any machine, every time someone pushes code.

**Newman** is Postman's open-source CLI runner (an npm package). It runs an exported collection JSON (or a URL), with an environment file and an optional data file, and **exits with a non-zero code if any test fails**, so the CI job turns red. Postman also offers the **Postman CLI** (\`postman collection run <id>\`), which runs collections straight from your workspace and reports back to Postman. Newman is the long-standing, fully offline option most interviewers ask about.

| Option | Meaning |
|---|---|
| \`-e env.json\` | Environment file |
| \`-d data.csv\` | Iteration data (CSV/JSON) |
| \`-n 3\` | Number of iterations |
| \`--folder "Negative"\` | Run one folder only |
| \`--env-var "password=..."\` | Inject a value (e.g. from a CI secret) |
| \`-r cli,junit,htmlextra\` | Reporters (htmlextra is an extra npm package) |
| \`--reporter-junit-export out.xml\` | JUnit XML for CI dashboards |
| \`--bail\` | Stop on the first failure |
| \`--timeout-request 10000\` | Fail a request after 10 s |
| \`--delay-request 200\` | Pause between requests (be kind to shared sandboxes) |

**Good CI hygiene:** commit the collection and a *template* environment (no secrets); inject secrets with \`--env-var\` from the CI secret store; publish the JUnit and HTML reports as build artifacts.`,
      code: [
        {
          language: 'bash',
          title: 'Run locally',
          code: `npm install --save-dev newman newman-reporter-htmlextra

npx newman run postman/restful-booker.postman_collection.json \\
  -e postman/rb-public.postman_environment.json \\
  -d postman/booking-data.csv \\
  --env-var "password=$RB_PASSWORD" \\
  -r cli,junit,htmlextra \\
  --reporter-junit-export reports/newman-junit.xml \\
  --reporter-htmlextra-export reports/newman.html \\
  --timeout-request 10000

echo "exit code: $?"   # 0 = all tests passed, 1 = something failed`,
        },
        {
          language: 'yaml',
          title: '.github/workflows/api-tests.yml',
          code: `name: API tests
on: [push, pull_request]

jobs:
  newman:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Run Postman collection
        run: >
          npx newman run postman/restful-booker.postman_collection.json
          -e postman/rb-public.postman_environment.json
          --env-var "password=\${{ secrets.RB_PASSWORD }}"
          -r cli,junit,htmlextra
          --reporter-junit-export reports/newman-junit.xml
          --reporter-htmlextra-export reports/newman.html
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: newman-reports
          path: reports/`,
        },
      ],
      keyPoints: [
        'Newman exits non-zero on any failed test: that is what fails the build.',
        'Inject secrets with --env-var from CI secrets; never commit them.',
        'Publish JUnit + HTML reports with if: always() so failures are inspectable.',
      ],
      source: 'Postman Learning Center — Newman command options; newman-reporter-htmlextra README',
    },
    {
      heading: 'Mock servers and contract testing awareness',
      body: `**Intuition:** a mock server is a cardboard cut-out of the real API. It can't cook, but it answers in exactly the shape you agreed, so the frontend team and testers can start before the backend exists.

**Postman mock servers:**
- Built from a collection's **saved examples**. Each example = a request + the response to return.
- Postman matches the incoming method and path to an example. By default body and headers are ignored for matching; matching on them can be switched on.
- Choose a specific example with headers: \`x-mock-response-name: Booking not found\` or \`x-mock-response-code: 404\`.
- **Private** mocks require your Postman API key in \`x-api-key\`.
- Uses: frontend development before backend is ready, reproducing rare errors (500, 429, timeouts) that are hard to trigger on a real server, and demoing a contract.

**Contract testing (awareness level):** a *contract* is the agreed request/response shape between a consumer (e.g. the web app) and a provider (the API).
- **Schema/spec-based:** validate real responses against the OpenAPI definition or JSON Schema (what your \`jsonSchema\` tests do).
- **Consumer-driven (e.g. Pact):** each consumer records the interactions it relies on; the provider's build verifies it still satisfies them. It catches "the backend renamed a field and the mobile app broke" **before** deployment.

**Caution:** mocks drift. If the real API changes and the examples don't, tests against the mock stay green while production breaks. Keep examples updated from real responses, and always run the same suite against the real API too.`,
      code: [
        {
          language: 'http',
          title: 'Asking a Postman mock for a specific saved example',
          code: `### Default match: method + path -> the 200 example
GET https://<mock-id>.mock.pstmn.io/booking/1093
Accept: application/json

### Force the error example by name
GET https://<mock-id>.mock.pstmn.io/booking/1093
Accept: application/json
x-mock-response-name: Booking not found

### Or by status code (if several examples share the path)
GET https://<mock-id>.mock.pstmn.io/booking/1093
x-mock-response-code: 500

### Private mock: add your Postman API key
GET https://<mock-id>.mock.pstmn.io/booking/1093
x-api-key: {{postmanApiKey}}`,
        },
      ],
      keyPoints: [
        'Mocks are built from saved examples; select one with x-mock-response-name/code.',
        'Great for frontend-first work and hard-to-trigger errors.',
        'Contract tests catch breaking changes between consumer and provider before release.',
        'Mocks drift: keep examples synced with real responses.',
      ],
      source: 'Postman Learning Center — Set up mock servers; Pact docs — Introduction (consumer-driven contracts)',
    },
    {
      heading: 'Basic performance checks and Postman\'s limits',
      body: `**Intuition:** Postman can tell you "this request took 2 seconds"; it is a stopwatch, not a stress-testing rig.

**What you can do in Postman:**
- Assert \`pm.response.responseTime\` per request against an agreed budget (and be generous on shared test servers: one slow call shouldn't fail a build).
- Run a collection for many iterations and look at average times in the run results.
- The Collection Runner's **performance** mode can simulate a number of virtual users over a duration (with ramp-up) and chart response times and error rates. It's useful for a quick sanity check.

**When to reach for something else:**

| Need | Better tool |
|---|---|
| Thousands of virtual users, realistic load profiles | k6, JMeter, Gatling, Locust |
| API tests living in the same repo as code, reviewed in PRs, mixed with UI flows | Code-based frameworks (Playwright's request fixture, REST Assured, Supertest) |
| Complex logic, loops, shared libraries | Code-based frameworks |
| Fast exploration, manual API checks, sharing examples with devs | Postman |

**Interview angle:** many teams use **both**: Postman for exploration, documentation and quick regression in Newman; a code framework for the long-term automated suite. Saying "I explore in Postman, then automate the stable cases in code" sounds mature.

**Response-time assertions that don't flake:**
- Assert a percentile over several runs, not one call.
- Use environment-specific budgets (\`{{maxMs}}\`).
- Separate "functional" and "performance" folders so slowness on a shared box doesn't hide functional failures.`,
      code: [
        {
          language: 'javascript',
          title: 'Budget from the environment + simple running average',
          code: `const budget = Number(pm.environment.get('maxMs') || 1000);
const t = pm.response.responseTime;

pm.test('within ' + budget + ' ms budget', () => {
  pm.expect(t).to.be.below(budget);
});

// keep a running list of timings for this request across iterations
const key = 'times_' + pm.info.requestName;
const times = JSON.parse(pm.collectionVariables.get(key) || '[]');
times.push(t);
pm.collectionVariables.set(key, JSON.stringify(times));

const sorted = [...times].sort((a, b) => a - b);
const p90 = sorted[Math.ceil(sorted.length * 0.9) - 1];
console.log(pm.info.requestName, 'n=' + times.length, 'p90=' + p90 + 'ms');
// → GET booking n=20 p90=412ms`,
        },
      ],
      keyPoints: [
        'Postman checks response time; it is not a load-testing tool.',
        'Budgets per environment, percentiles over several calls.',
        'Explore in Postman, automate stable cases in code: a common, mature answer.',
      ],
      source: 'Postman Learning Center — Collection Runner performance testing; k6 docs — Load testing types',
    },
  ],
  codeChallenges: [
    {
      id: 'api-postman-cc-1',
      title: 'Harden a fragile Postman test script',
      context:
        'This post-response script is on the "Create booking" request of a Restful Booker collection. It passes on the tester\'s laptop, but in Newman a server hiccup returned an HTML error page and the whole run produced a confusing "script error" with every downstream request failing.',
      task: 'Rewrite the script so it uses modern pm.* syntax, fails clearly and in isolation, checks the response against what was actually sent, validates the schema, and only saves the booking id when creation really succeeded.',
      starter: {
        language: 'javascript',
        title: 'Weak script',
        code: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

var data = JSON.parse(responseBody);

tests["has name"] = data.booking.firstname == "Sally";
tests["price ok"] = data.booking.totalprice == "111";

postman.setEnvironmentVariable("id", data.bookingid);

pm.test("fast", function () {
    pm.expect(pm.response.responseTime).to.be.below(10000);
});`,
      },
      hints: [
        'What happens to the rest of the script when JSON.parse throws on an HTML body?',
        'Why does "price ok" pass when the API returns the string "111"? Which comparison is used?',
        'Hard-coded "Sally" only works for one data row. Where can you read what you actually sent?',
      ],
      solution: {
        language: 'javascript',
        title: 'Robust script',
        code: `// What we sent, with {{variables}} resolved, as the source of truth
const sent = JSON.parse(pm.variables.replaceIn(pm.request.body.raw));
let res = null;

pm.test('status is 200 (Restful Booker create contract)', () => {
  pm.response.to.have.status(200);
});

pm.test('response is valid JSON', () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
  res = pm.response.json(); // throws only inside this test
});

pm.test('booking echoes every field that was sent', () => {
  pm.expect(res, 'no JSON body').to.be.an('object');
  pm.expect(res.bookingid).to.be.a('number');
  pm.expect(res.booking).to.eql(sent); // strict types, deep compare
});

pm.test('matches booking schema', () => {
  pm.response.to.have.jsonSchema(JSON.parse(pm.collectionVariables.get('bookingSchema')));
});

pm.test('within response-time budget', () => {
  pm.expect(pm.response.responseTime).to.be.below(Number(pm.environment.get('maxMs') || 1500));
});

// Only hand the id to later requests if creation really worked
if (res && typeof res.bookingid === 'number') {
  pm.collectionVariables.set('bookingId', res.bookingid);
} else {
  pm.collectionVariables.unset('bookingId');
  console.error('Create failed:', pm.response.code, pm.response.text().slice(0, 200));
}`,
      },
      explanation: `**Fixes:**
- **Parse inside a test:** \`JSON.parse(responseBody)\` at top level crashed the script on an HTML body, so no later test ran and the id was never set. Now only "response is valid JSON" fails, with a clear name.
- **Modern syntax:** \`tests[...]\`, \`responseBody\` and \`postman.setEnvironmentVariable\` are legacy; replaced by \`pm.test\`, \`pm.response.json()\`, \`pm.collectionVariables.set\`.
- **Loose equality bug:** \`== "111"\` passed even when the API returned a string. \`eql\` on the whole object compares types strictly.
- **Compare with what was sent:** works for every data-driven row instead of only "Sally".
- **Schema check** catches renamed or extra fields; the schema lives once in a collection variable.
- **Meaningful time budget** from the environment instead of a 10-second "always passes" limit.
- **Guarded chaining:** the id is saved only on real success and unset otherwise, so downstream failures are honest, and it lives in collection scope rather than polluting the shared environment.`,
      followUps: [
        {
          q: 'Why put the booking id in a collection variable instead of the environment?',
          a: 'The id is data produced by this run of this collection, not a property of the QA environment. Collection scope keeps the shared environment clean, avoids two collections overwriting each other\'s "id", and makes the value obvious to anyone reading the collection. Environment variables are for things that change per target server, like baseUrl and credentials.',
        },
        {
          q: 'pm.request.body.raw contains {{firstname}}. Why does the comparison still work?',
          a: 'pm.variables.replaceIn() resolves every {{placeholder}} using the same scope precedence Postman used when sending, so you get the exact JSON that went over the wire. Without it, JSON.parse would see "{{firstname}}" literally (and fail outright for unquoted numeric placeholders).',
        },
      ],
    },
    {
      id: 'api-postman-cc-2',
      title: 'From a hard-coded collection to a self-contained, chained one',
      context:
        'A collection handed over by a previous tester works "only on Monday mornings". The notes below describe how it is built. Today every PUT and DELETE fails with 403, and GET returns 404.',
      task: 'Redesign the collection so it can run any time, on any machine and in Newman: no pasted tokens or ids, correct order, cleanup, and one place for auth.',
      starter: {
        language: 'text',
        title: 'Current collection (as documented)',
        code: `Collection: Booker Tests (no environment)
1. GET  https://restful-booker.herokuapp.com/booking/1
2. PUT  https://restful-booker.herokuapp.com/booking/1
        Header  Cookie: token=4f1a2b3c9d8e7f6
3. PATCH https://restful-booker.herokuapp.com/booking/1
        Header  Cookie: token=4f1a2b3c9d8e7f6
4. DELETE https://restful-booker.herokuapp.com/booking/1
        Header  Cookie: token=4f1a2b3c9d8e7f6
Tests: only "status is 200" on each request.
Note: "Get a new token in the morning and paste it into 3 places."`,
      },
      hints: [
        'Three problems: the token is pasted, the booking id assumes shared data exists, and the host is hard-coded.',
        'Which request should produce each value, and which scope should hold it?',
        'Where can you put the token logic once so every request benefits?',
      ],
      solution: {
        language: 'javascript',
        title: 'Collection pre-request script + structure',
        code: `// STRUCTURE (each request URL uses {{baseUrl}}):
// 01 POST /booking           -> saves bookingId (post-response)
// 02 GET  /booking/{{bookingId}}
// 03 PUT  /booking/{{bookingId}}   Cookie: token={{token}}
// 04 PATCH /booking/{{bookingId}}  Cookie: token={{token}}
// 05 DELETE /booking/{{bookingId}} Cookie: token={{token}} -> 201
// 06 GET  /booking/{{bookingId}}   -> 404, then unset bookingId
// Environment "RB": baseUrl, username, password (secret type)

// ---- Collection-level PRE-REQUEST script: auth in one place ----
const MAX_AGE = 10 * 60 * 1000;
const age = Date.now() - Number(pm.collectionVariables.get('tokenAt') || 0);

if (!pm.collectionVariables.get('token') || age > MAX_AGE) {
  pm.sendRequest(
    {
      url: pm.environment.get('baseUrl') + '/auth',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: {
        mode: 'raw',
        raw: JSON.stringify({
          username: pm.environment.get('username'),
          password: pm.environment.get('password'),
        }),
      },
    },
    (err, res) => {
      const token = !err && res.code === 200 ? res.json().token : undefined;
      if (!token) {
        console.error('Auth failed: ' + (err || res.text()));
        return;
      }
      pm.collectionVariables.set('token', token);
      pm.collectionVariables.set('tokenAt', String(Date.now()));
    },
  );
}`,
      },
      explanation: `**What changed:**
- **No pasted token:** a collection-level pre-request script fetches a token when it's missing or older than 10 minutes. Every request, even one run alone with Send, is authenticated.
- **Own data, not booking 1:** Restful Booker is a shared, periodically reset sandbox; someone else can delete booking 1 at any time (today's 404). Request 01 creates a booking and saves its id; all others use \`{{bookingId}}\`.
- **Cleanup:** DELETE plus a final GET expecting 404, then \`unset\`, so runs don't accumulate data.
- **Environment:** \`{{baseUrl}}\` and credentials in an environment (password as a secret/local value) so the same collection runs against another server and in Newman with \`--env-var\`.
- **Real assertions:** each request should also check body values and schema, not only "status is 200" (see challenge 1).
- **The 403 explained:** the pasted token had expired or been invalidated; Restful Booker answers 403 rather than 401 in that case.`,
      followUps: [
        {
          q: 'Why check res.code and the token field instead of just res.json().token?',
          a: 'Restful Booker answers bad credentials with HTTP 200 and {"reason": "Bad credentials"}, and a network error or HTML error page would make res.json() throw. Checking both the code and the presence of the token means we only store a real token and log a clear reason otherwise, instead of saving "undefined" and getting confusing 403s later.',
        },
        {
          q: 'Two testers run this collection at the same time. Any problem?',
          a: 'Not with this design: each run creates its own booking and keeps its id and token in its own collection variables (local values on each machine or in each Newman process). The old design shared booking 1, so one tester\'s DELETE broke the other\'s run. Unique data per run is what makes parallel runs safe.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'api-postman-iq-01',
      difficulty: 'medium',
      question: 'How do you pass the token from a login request to the requests that follow it in Postman?',
      whatInterviewerLooksFor: [
        'Uses a post-response script to extract and save the token',
        'References it with {{variable}} in headers/auth',
        'Picks a sensible scope and guards against failed login',
        'Knows the collection-level auto-auth alternative',
      ],
      modelAnswer: `**Basic chaining**
1. In the login request's **post-response script**, assert it succeeded, then save the token:
   \`pm.collectionVariables.set('token', pm.response.json().token)\`.
2. In later requests, use \`{{token}}\`: in the **Authorization tab** (Bearer Token → \`{{token}}\`), in a header (\`Cookie: token={{token}}\` for Restful Booker), or set auth once on the collection and let requests **inherit** it.
3. The same pattern carries ids: the create request saves \`bookingId\`; GET/PUT/DELETE use \`/booking/{{bookingId}}\`.

**Making it robust**
- **Guard:** only save if the token exists. Restful Booker returns 200 with \`{"reason":"Bad credentials"}\` on a wrong password, so a status-only check would save \`undefined\`. On failure I call \`pm.execution.setNextRequest(null)\` to stop the run instead of producing 20 misleading failures.
- **Scope:** collection variables for values produced by the run; environment for per-server values such as \`baseUrl\` and usernames.
- **Auto-auth:** better still, a **collection-level pre-request script** uses \`pm.sendRequest\` to log in when the token is missing or old. Then each request works on its own, in any order, in the runner and in Newman.
- **Secrets:** the password lives in a secret/local value or comes from CI via \`newman --env-var\`, never in a shared value.`,
      followUps: [
        {
          q: 'The token expires after 15 minutes and your run takes 40. What do you do?',
          a: 'Store the time the token was fetched next to it, and in the collection pre-request script refresh it when it is older than, say, 12 minutes. If the API offers a refresh token, call the refresh endpoint instead of a full login. As a safety net, a request that receives 401 can log it clearly so the cause is obvious in the report.',
        },
        {
          q: 'Where would you NOT store the token, and why?',
          a: 'Not in globals (visible to every collection in the workspace and easily left behind), and not in the shared/initial value of an environment (synced to the cloud and exported with the file). Collection variables or local values are cleared or kept per run; Postman Vault or secret-type variables are the right home for long-lived credentials.',
        },
      ],
      pitfalls: [
        'Copy-pasting the token manually into each request',
        'Saving the token without checking the login actually succeeded',
        'Storing secrets in globals or shared environment values',
      ],
    },
    {
      id: 'api-postman-iq-02',
      difficulty: 'medium',
      question: 'Explain Postman variable scopes. If the same variable exists in several scopes, which value is used?',
      whatInterviewerLooksFor: [
        'Names all five scopes',
        'Correct precedence (narrowest wins)',
        'Practical guidance on what goes where',
        'Awareness of shared vs local values and secrets',
      ],
      modelAnswer: `**Five scopes, broadest to narrowest:**

| Scope | What I put there |
|---|---|
| **Global** | Almost nothing; maybe a quick experiment |
| **Collection** | Values the collection owns or produces: API version, \`bookingId\`, \`token\` during a run |
| **Environment** | Per-target values: \`baseUrl\`, usernames, per-environment timeouts |
| **Data** | Columns of the CSV/JSON file in a data-driven run |
| **Local** | Temporary values set with \`pm.variables.set\` inside scripts |

**Precedence:** the **narrowest** wins: local > data > environment > collection > global. So a CSV column called \`baseUrl\` silently overrides the environment's \`baseUrl\`; that's a classic "why is it calling the wrong server?" bug.

\`{{name}}\` in a request, and \`pm.variables.get('name')\` in a script, both return the winning value. To read a specific scope, use \`pm.environment.get\`, \`pm.collectionVariables.get\` and so on.

**Shared vs local values:** each variable has a value synced to the team (historically the *initial value*) and one that stays on my machine (the *current value*). Real credentials go only in the local value, a secret-type variable or Vault.

**Example:** \`baseUrl\` global = production, environment "QA" = qa.example.com. With QA selected, requests go to QA; with no environment selected they'd go to production. That's why I never keep risky values as globals.`,
      followUps: [
        {
          q: 'A teammate imports your collection and every request fails with "getaddrinfo ENOTFOUND {{baseUrl}}". Why?',
          a: 'The variable is unresolved, so the literal text {{baseUrl}} is used as the host. Most likely they have no environment selected, or the environment they imported only has my value in the local/current field, which is not exported or synced. Fix: share an environment with shared values for non-secret settings and tell them to select it.',
        },
        {
          q: 'How do you see which value a variable actually resolved to?',
          a: 'Hover over {{variable}} in the request to see its value and scope, open the Postman Console to see the final URL and headers that were sent, or log pm.variables.get("name") in a script. The Console is the most reliable because it shows exactly what went over the wire.',
        },
      ],
      pitfalls: [
        'Getting precedence backwards ("global overrides everything")',
        'Putting everything in globals',
        'Not knowing that data-file columns override environment values',
      ],
    },
    {
      id: 'api-postman-iq-03',
      difficulty: 'medium',
      question: 'How would you run your Postman collection automatically in a CI pipeline?',
      whatInterviewerLooksFor: [
        'Knows Newman (and/or Postman CLI)',
        'Exports collection/environment, handles secrets',
        'Understands exit codes failing the build',
        'Publishes reports as artifacts',
      ],
      modelAnswer: `1. **Export** the collection (v2.1 JSON) and a template environment into the repo, e.g. \`postman/\`. No secrets in the files.
2. **Install Newman** as a dev dependency: \`npm i -D newman newman-reporter-htmlextra\`.
3. **Run** in the pipeline:
   \`npx newman run postman/booker.postman_collection.json -e postman/qa.postman_environment.json --env-var "password=$RB_PASSWORD" -r cli,junit,htmlextra --reporter-junit-export reports/junit.xml --reporter-htmlextra-export reports/newman.html\`
4. **Secrets** come from the CI secret store via \`--env-var\`.
5. **Exit code:** Newman exits non-zero when any assertion fails, so the job fails. No extra scripting needed.
6. **Reports:** upload JUnit XML (for the CI test tab) and the HTML report as artifacts with \`if: always()\` so they're there when it fails.
7. **Triggers:** on every pull request for a smoke folder (\`--folder Smoke\`), nightly for the full regression with data files.

**Alternative:** the **Postman CLI** (\`postman login --with-api-key …\` then \`postman collection run <collection-id>\`) runs the collection directly from the workspace, so there's no export step, and sends results back to Postman.

**Gotchas I've learned:** use \`--delay-request\` or smaller data files on shared sandboxes like Restful Booker; make the collection create and clean its own data, because CI runs can overlap.`,
      followUps: [
        {
          q: 'How do you keep the exported collection in the repo in sync with the Postman workspace?',
          a: 'Agree on one source of truth. Either edit in Postman and re-export as part of the pull request (reviewed like code), or use the Postman CLI or API to run the workspace version directly. Postman\'s Git integration and the Postman API can also automate exports. The risk to avoid is CI quietly running a stale copy.',
        },
        {
          q: 'The Newman run fails in CI but passes on your machine. First things to check?',
          a: 'Environment differences: is the right environment file used, are all variables present (local values do not export), are secrets injected, is the CI runner able to reach the host (VPN, firewall), and is the data different (shared sandbox reset, ids missing). Then read the failing request in the htmlextra report or rerun with --verbose to see the actual request and response.',
        },
      ],
      pitfalls: [
        'Committing passwords inside the environment JSON',
        'Not knowing how a failed test fails the build (exit code)',
        'No reports archived, so failures can\'t be investigated',
      ],
    },
    {
      id: 'api-postman-iq-04',
      difficulty: 'medium',
      question: 'How do you do data-driven testing in Postman? Walk me through an example.',
      whatInterviewerLooksFor: [
        'Collection Runner / Newman with CSV or JSON',
        'Uses {{column}} and pm.iterationData',
        'Includes expected results in the data for negative rows',
        'Knows CSV string typing and scope override gotchas',
      ],
      modelAnswer: `**Mechanics:** I write one request with placeholders and one generic set of tests, then attach a CSV or JSON file in the **Collection Runner** (or \`newman run … -d data.csv\`). Each row is an **iteration**: the selected requests run once per row, with column values available as \`{{column}}\` and \`pm.iterationData.get('column')\`.

**Example: Restful Booker create booking**
- Body: \`{ "firstname": "{{firstname}}", "lastname": "{{lastname}}", "totalprice": {{totalprice}}, "depositpaid": {{depositpaid}}, "bookingdates": { "checkin": "{{checkin}}", "checkout": "{{checkout}}" } }\`. Numbers and booleans are deliberately unquoted.
- CSV columns: \`case, firstname, lastname, totalprice, depositpaid, checkin, checkout, expectedStatus\`.
- Rows: three valid (normal, zero price, unicode name) and three invalid (missing firstname, string price, checkout before checkin).
- Test: \`pm.response.to.have.status(Number(pm.iterationData.get('expectedStatus')))\`, plus echo checks for 200 rows and a "no stack trace" check for error rows. Each test name includes the \`case\` column so the report reads clearly.

**Gotchas**
- CSV values are **strings**; convert with \`Number()\` or compare to \`'true'\`.
- A column with the same name as an environment variable **overrides** it (data scope is narrower).
- Use JSON data when rows need nested objects or arrays.
- Keep data files in version control next to the collection.`,
      followUps: [
        {
          q: 'Your data file has 50 rows but only 3 requests should repeat per row; the login should happen once. How?',
          a: 'Put login in the collection pre-request script with a "only if token missing" check, so it runs once and is reused. Or put the data-driven requests in their own folder and run that folder only (--folder in Newman) with auth handled at collection level. Another option is pm.execution.setNextRequest to skip the login request after the first iteration.',
        },
        {
          q: 'How would you report which rows failed?',
          a: 'Include the case column in each pm.test name, for example "[string-price] status is 400". The Runner and Newman reports then show exactly which row failed. The htmlextra reporter also separates iterations, so you can open the failing iteration and see its request and response.',
        },
      ],
      pitfalls: [
        'Quoting numeric placeholders so every price becomes a string',
        'Hard-coding expected values instead of putting them in the data',
        'Only testing valid rows in a data file',
      ],
    },
    {
      id: 'api-postman-iq-05',
      difficulty: 'hard',
      question: 'Every request in your collection passes when you click Send one by one, but several fail when you run the whole collection in the Runner. How do you debug it?',
      whatInterviewerLooksFor: [
        'Thinks about order and state dependencies between requests',
        'Checks variable scope/precedence and data-file overrides',
        'Uses the Console and run results to see actual requests',
        'Mentions timing, rate limits and shared data',
      ],
      modelAnswer: `When Send works but the run fails, the difference is **state and order**, not the requests themselves. I go through it methodically:

1. **Look at the first failure only.** Later failures are often a cascade (no token → everything 403).
2. **Open the Postman Console** and compare the actual URL/headers/body of the failing request in the run with what Send produced. Unresolved \`{{var}}\` or a different id stands out quickly.
3. **Order and hidden dependencies:** when I clicked Send I had manually run login earlier, so \`token\` was already set. In the run, maybe the login request is in a folder that wasn't selected, or comes after the requests that need it.
4. **Variable scope:** the run uses a data file whose column overrides an environment variable; or a script writes to \`pm.environment\` while the request reads a collection variable with the same name.
5. **Flow control:** a \`pm.execution.setNextRequest\` jumps or loops in ways that don't happen with Send.
6. **Data/state:** a DELETE earlier in the run removes the booking a later request expects; or created data collides (duplicate email) because names aren't unique per iteration.
7. **Timing:** the run fires requests faster; the server may rate-limit (429) or need a moment for async processing. Try a delay to confirm, then fix properly (poll or wait for state).

**Fix pattern:** make each request's prerequisites explicit (auto-auth at collection level, create-own-data), name variables uniquely, and clean up at the end.`,
      followUps: [
        {
          q: 'The run is fine with a 500 ms delay but fails without it. Is the delay the fix?',
          a: 'Only as a diagnosis. It tells me there is a timing dependency: maybe an asynchronous job, eventual consistency, or rate limiting. The real fix is to check the condition: poll the status endpoint with a limited retry loop, or respect Retry-After on 429. A fixed delay slows every run and will still fail on a slow day.',
        },
        {
          q: 'How do you make the collection order-independent?',
          a: 'Give each request (or each folder) what it needs: authentication in the collection pre-request script, test data created in the folder that uses it, unique names per run, and cleanup at the end. Then running a single folder or a single request with Send behaves the same as the full run.',
        },
      ],
      pitfalls: [
        'Adding random delays until it goes green',
        'Looking at the last failure instead of the first',
        'Assuming the Runner uses different script semantics than Send (except setNextRequest)',
      ],
    },
    {
      id: 'api-postman-iq-06',
      difficulty: 'hard',
      question: 'What is a Postman mock server, and when would you use one as a tester? How is that different from contract testing?',
      whatInterviewerLooksFor: [
        'Knows mocks are built from saved examples',
        'Concrete use cases (frontend-first, error simulation)',
        'Knows how to choose examples (x-mock-response-name/code)',
        'Distinguishes mocking from contract verification and mentions drift',
      ],
      modelAnswer: `**Mock server:** a URL Postman hosts that answers with the **saved examples** in a collection. Each example is a request plus the response to return. Postman matches method and path (optionally body/headers) to pick one. I can force a specific example with \`x-mock-response-name\` or \`x-mock-response-code\`, and private mocks need \`x-api-key\`.

**When I use one**
- **Backend isn't ready:** the team agrees the contract as examples; frontend and I start building and testing against the mock.
- **Hard-to-reproduce responses:** 500, 503, 429 with Retry-After, an empty list, a huge list. I point the app at the mock to see how the UI handles them.
- **Unstable third parties:** a payment or SMS provider sandbox that's slow or rate-limited.
- **Demos and documentation:** examples double as living docs.

**Contract testing is different.** A mock *pretends* to be the provider. Contract testing *verifies* that the real provider still honours what consumers depend on:
- **Spec-based:** validate real responses against the OpenAPI/JSON Schema (my \`jsonSchema\` tests).
- **Consumer-driven (Pact):** consumers publish the interactions they rely on; the provider's pipeline replays them and fails if a field was renamed.

**The danger with mocks is drift:** if the real API changes and the examples don't, mock-based tests stay green while production breaks. Contract tests are the guard against that, so the two are complementary.`,
      followUps: [
        {
          q: 'How do you keep mock examples from drifting?',
          a: 'Save examples from real responses rather than writing them by hand, review them when the API changes, and run the same schema tests against both the mock and the real API. If the schema test fails against the real API but passes on the mock, the mock is out of date. Generating mocks from the OpenAPI spec keeps them tied to one source of truth.',
        },
        {
          q: 'How would you test the UI\'s handling of a 503 from the booking API using a mock?',
          a: 'Add a saved example for GET /booking with status 503 and a Retry-After header, point the app\'s API base URL at the mock, and send x-mock-response-code: 503 (or name the example). Then verify the UI shows a friendly retry message, does not spin forever, and recovers once the normal example is served again.',
        },
      ],
      pitfalls: [
        'Thinking a mock server tests the real API',
        'Not knowing mocks are driven by saved examples',
        'Never revisiting examples after the API changes',
      ],
    },
    {
      id: 'api-postman-iq-07',
      difficulty: 'expert',
      question: 'When would you keep API tests in Postman, and when would you move them into a code-based framework?',
      context: 'The team has 400 Postman requests across 12 collections, run nightly with Newman. A new SDET lead suggests rewriting everything in code.',
      whatInterviewerLooksFor: [
        'Balanced view, not tool fanaticism',
        'Criteria: maintainability, reuse, review, CI, mixing with UI tests',
        'Incremental migration plan rather than big-bang rewrite',
        'Keeps Postman for exploration and documentation',
      ],
      modelAnswer: `**Postman is strong for:** exploring a new API, reproducing bugs and sharing them with developers (one-click request), living documentation with examples, mock servers, and quick regression through Newman. Non-programmers on the team can contribute.

**A code framework is strong for:** large suites with shared helpers (auth, builders, data factories), proper code review in pull requests, version control diffs that are readable (collection JSON diffs are not), typed models, complex logic and loops, running API and UI tests together (e.g. create data via API, verify in UI), and parallel execution.

**Signals it's time to move (some) tests:**
- The same script logic is copy-pasted across hundreds of requests.
- Merge conflicts on collection JSON, no meaningful reviews.
- Tests need to set up data for UI tests or share fixtures with them.
- Debugging failures is slow because logic is spread across collection, folder and request scripts.

**My recommendation for this team:** not a big-bang rewrite. Keep the Newman suite running as the safety net. Move the **highest-value, most-maintained** flows (auth, booking CRUD, critical negative cases) into code first, run both side by side for a sprint or two, then retire the duplicates. Keep Postman for exploration, bug reproduction, mocks and documentation. Measure: run time, flakiness, time-to-fix a broken test.`,
      followUps: [
        {
          q: 'What would you migrate first and why?',
          a: 'The flows that change most often and break most: authentication and the core CRUD of the main business object. They give the biggest maintenance win and become reusable helpers (login, create booking) for every later test, including UI tests that need API setup. Rarely touched, stable requests can stay in Newman until last.',
        },
        {
          q: 'Is it bad that non-programmers can no longer edit tests after the move?',
          a: 'It is a real cost. Mitigate it with readable helpers and data-driven tables that anyone can edit, pairing sessions, and keeping Postman for exploratory and manual API work where they stay fully productive. The goal is a maintainable regression suite, not excluding people.',
        },
      ],
      pitfalls: [
        'Dismissing Postman as "not real automation"',
        'Proposing a full rewrite with no transition plan',
        'Ignoring the team\'s current skills and the working Newman safety net',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'api-postman-drill-1',
      question:
        'Chain four Restful Booker requests so they run anywhere with no manual copy-paste: (1) get a token, (2) create a booking, (3) update it, (4) delete it and prove it is gone. For each, state which variable it reads, which it writes (and in which scope), and the key assertion.',
      assumptions: [
        'Environment "RB" holds baseUrl, username, password.',
        'POST /auth → 200 { token } (or 200 { reason } on bad credentials).',
        'POST /booking → 200 { bookingid, booking }.',
        'PUT needs Cookie: token=…; DELETE returns 201; GET of a deleted id returns 404.',
      ],
      steps: [
        { label: '1. POST {{baseUrl}}/auth', calc: 'Reads: baseUrl, username, password (environment). Asserts 200 AND body has token. Writes: pm.collectionVariables.set("token", json.token); if missing → setNextRequest(null).' },
        { label: '2. POST {{baseUrl}}/booking', calc: 'Reads: baseUrl; body built from local vars set in pre-request (unique firstname, future dates). Asserts 200, numeric bookingid, booking eql sent. Writes: bookingId (collection).' },
        { label: '3. PUT {{baseUrl}}/booking/{{bookingId}}', calc: 'Reads: bookingId, token (header Cookie: token={{token}}). Asserts 200 and every field equals the new body. Writes nothing.' },
        { label: '4a. DELETE {{baseUrl}}/booking/{{bookingId}}', calc: 'Reads: bookingId, token. Asserts 201 (Restful Booker contract).' },
        { label: '4b. GET {{baseUrl}}/booking/{{bookingId}}', calc: 'Asserts 404. Then pm.collectionVariables.unset("bookingId") (and token if you want a clean next run).' },
      ],
      answer: `| Request | Reads | Writes (scope) | Key assertion |
|---|---|---|---|
| POST /auth | baseUrl, username, password | token (collection) | 200 **and** token present |
| POST /booking | baseUrl, local test data | bookingId (collection) | booking eql sent |
| PUT /booking/{{bookingId}} | bookingId, token | none | updated fields returned |
| DELETE + GET | bookingId, token | unset bookingId | 201, then 404 |`,
      insight:
        'Every value has exactly one producer and is read by name everywhere else. Guarding the producer (no token → stop the run) turns a 20-failure cascade into one clear failure.',
      followUps: [
        {
          q: 'How would you make request 3 runnable on its own with Send?',
          a: 'Move the auth into a collection-level pre-request script that fetches a token when none exists, and give request 3 a pre-request script that creates a booking (pm.sendRequest) if bookingId is empty. Then it no longer depends on requests 1 and 2 having run first, at the cost of a little extra setup time.',
        },
      ],
    },
    {
      id: 'api-postman-drill-2',
      question:
        'The variable `baseUrl` is defined in several scopes. For each of four situations, work out which URL `{{baseUrl}}/booking` resolves to.',
      assumptions: [
        'Global baseUrl = https://prod.example.com',
        'Collection variable baseUrl = https://staging.example.com',
        'Environment "QA" baseUrl = https://qa.example.com',
        'Precedence: local > data > environment > collection > global.',
        'Case A: environment QA selected, no data file. Case B: no environment selected. Case C: QA selected and the CSV has a column baseUrl = https://restful-booker.herokuapp.com. Case D: QA selected and the pre-request script runs pm.variables.set("baseUrl", "http://localhost:3001").',
      ],
      steps: [
        { label: 'Case A', calc: 'Candidates: environment (qa), collection (staging), global (prod). Environment is narrowest → https://qa.example.com/booking.' },
        { label: 'Case B', calc: 'No environment. Candidates: collection (staging), global (prod). Collection is narrower → https://staging.example.com/booking.' },
        { label: 'Case C', calc: 'Data scope beats environment → https://restful-booker.herokuapp.com/booking (often a surprise!).' },
        { label: 'Case D', calc: 'Local scope beats everything → http://localhost:3001/booking for this request only.' },
      ],
      answer: `A → **qa.example.com**, B → **staging.example.com**, C → **restful-booker.herokuapp.com** (data overrides environment), D → **localhost:3001** (local overrides all).`,
      insight:
        'The global "prod" value is only reached if nothing narrower exists, which is exactly when someone forgets to select an environment. Keep risky values out of global scope, and avoid data-file columns that share names with environment variables.',
      followUps: [
        {
          q: 'How would you protect against accidentally running destructive tests against production?',
          a: 'Never store a production URL in global or collection scope. Add a collection pre-request guard: if pm.variables.get("baseUrl") contains "prod", log an error and call pm.execution.skipRequest() for any non-GET request. In CI, pass the environment explicitly and keep production credentials out of the test environment entirely.',
        },
      ],
    },
    {
      id: 'api-postman-drill-3',
      question:
        'Plan a data-driven run: a folder with 3 requests (POST /booking, GET /booking/{{bookingId}}, DELETE /booking/{{bookingId}}) runs with a CSV of 6 rows, 3 valid and 3 invalid (expected 400). Work out how many HTTP requests are sent, how many bookings should be left over, and how the scripts must behave for invalid rows.',
      assumptions: [
        'Auth is handled by a collection pre-request script that calls /auth only when no token exists (one extra call for the whole run).',
        'For invalid rows, POST should fail with 400 and no booking is created.',
        'Invalid rows should not send GET/DELETE with a stale id from a previous row.',
        'Newman runs with -d bookings.csv and no --bail.',
      ],
      steps: [
        { label: 'Naive count', calc: '6 rows × 3 requests = 18 requests + 1 auth = 19 HTTP calls.' },
        { label: 'The stale-id trap', calc: 'Row 4 (invalid) POST fails, but bookingId still holds row 3\'s id. GET/DELETE would hit an already-deleted booking → false failures (404s) or, worse, delete someone else\'s data.' },
        { label: 'Fix in scripts', calc: 'POST post-response: when no bookingid comes back, unset bookingId. (Do not use setNextRequest(null): it would end the whole run, not just this row.) GET and DELETE pre-request: if bookingId is empty → pm.execution.skipRequest().' },
        { label: 'Corrected count', calc: 'Valid rows: 3 × 3 = 9. Invalid rows: 3 × 1 POST = 3 (GET/DELETE skipped). Plus 1 auth = 13 HTTP calls.' },
        { label: 'Leftover bookings', calc: 'Each valid row deletes its own booking; invalid rows create none → 0 left over. If the API wrongly accepted an invalid row (200), that booking would also be deleted only if bookingId is saved: save it whenever a bookingid comes back, regardless of expectation.' },
      ],
      answer: `**13 HTTP calls** (1 auth + 9 for valid rows + 3 POSTs for invalid rows), **0 bookings left over**. POST post-response: assert status = expectedStatus; save \`bookingId\` whenever the response contains one, otherwise unset it. GET/DELETE pre-request: \`if (!pm.collectionVariables.get('bookingId')) pm.execution.skipRequest();\`.`,
      insight:
        'In data-driven runs, variables leak between iterations. Every iteration must reset what it produced, or the next row silently reuses the previous row\'s id. Skipping dependent requests keeps the report honest and the counts predictable.',
      followUps: [
        {
          q: 'Why save bookingId even for a row expected to fail?',
          a: 'If the API has a bug and accepts the invalid row, a booking is created. The status assertion will fail (good, that is the bug report), but saving the returned id lets the DELETE clean it up, so the bug does not also leave junk data in a shared environment.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'api-postman-mcq-01',
      difficulty: 'easy',
      question: '`baseUrl` exists as a global (production URL) and in the selected "QA" environment (QA URL). Which URL does `{{baseUrl}}` use when you click Send?',
      options: [
        'The production URL, because globals apply everywhere',
        'The QA URL, because the environment scope is narrower than global',
        'Whichever variable was created most recently',
        'Postman shows an error because the name is ambiguous',
      ],
      correct: [1],
      explanation:
        'Postman resolves a name to the narrowest scope that defines it: local > data > environment > collection > global. Environment beats global, so the QA URL is used. Creation time is irrelevant, and duplicates across scopes are allowed by design, not an error.',
      followUps: [
        {
          q: 'What happens if you deselect the environment?',
          a: 'Then the global is the only candidate (unless a collection variable exists), so the same request now goes to production. That is why risky values like a production URL should not live in global scope.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-02',
      difficulty: 'easy',
      question: 'Each request needs a fresh timestamp and a unique email in its body. Where should the code that generates them go?',
      options: [
        'The post-response script of the same request',
        'The pre-request script (of the request, folder or collection)',
        'The Params tab',
        'A saved example on the request',
      ],
      correct: [1],
      explanation:
        'Pre-request scripts run before the request is sent, so values they set with pm.variables.set can be used as {{placeholders}} in that request. A post-response script runs after the request has already gone. Params only hold query parameters, and saved examples document responses (and feed mocks), not dynamic values.',
      followUps: [
        {
          q: 'Postman also has dynamic variables like {{$randomEmail}}. When would you still write a script?',
          a: 'When you need to reuse the same generated value later (for example assert the response echoes it, or log in with it), or need a specific pattern such as "qa+<timestamp>@company.com". A dynamic variable gives a new value each time it is used, so you cannot compare against it afterwards unless you store it.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-03',
      difficulty: 'easy',
      question: 'This test is on the Restful Booker "Create booking" request and fails although the booking was created. Why?',
      code: {
        language: 'javascript',
        code: `pm.test('booking created', () => {
  pm.response.to.have.status(201);
});`,
      },
      options: [
        'pm.response.to.have.status only accepts strings like "Created"',
        'Restful Booker returns 200 for a successful create, not 201',
        'The test must be in the pre-request script',
        'Arrow functions are not supported in Postman scripts',
      ],
      correct: [1],
      explanation:
        'Restful Booker documents and returns 200 OK for POST /booking. Many REST APIs use 201, but tests must follow the actual contract (and you can raise the deviation separately). to.have.status accepts a number, assertions belong in post-response scripts, and arrow functions work fine in the sandbox.',
      followUps: [
        {
          q: 'How do you decide whether to change the test or raise a bug?',
          a: 'Check the documented contract. If the docs say 200, align the test and optionally suggest 201 as an improvement. If the docs say 201 and the API returns 200, it is a bug. Never silently change the expectation just to make the test green.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-04',
      difficulty: 'medium',
      question: 'The server returns an HTML error page instead of JSON. What happens when this post-response script runs?',
      code: {
        language: 'javascript',
        code: `const data = pm.response.json();

pm.test('status is 200', () => {
  pm.response.to.have.status(200);
});

pm.test('has bookingid', () => {
  pm.expect(data).to.have.property('bookingid');
});

pm.collectionVariables.set('bookingId', data.bookingid);`,
      },
      options: [
        'Both tests fail with clear messages, and bookingId is set to undefined',
        'The first line throws, the script stops, no tests are reported for this request, and a script error is shown',
        'pm.response.json() returns an empty object, so only "has bookingid" fails',
        'Postman automatically converts HTML to JSON, so the tests pass',
      ],
      correct: [1],
      explanation:
        'pm.response.json() throws on a body that is not valid JSON. Because the call is at the top level rather than inside a pm.test, the exception aborts the whole script before any test is registered, and Postman reports a script error. Moving the parse inside a pm.test makes only that test fail while the status test still reports.',
      followUps: [
        {
          q: 'Rewrite the first lines so the status test always reports.',
          a: 'Put the status test first and parse inside a test: pm.test("body is JSON", () => { data = pm.response.json(); }) with let data declared above. Then guard the variable set: only call pm.collectionVariables.set if data && data.bookingid exist, and unset it otherwise.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-05',
      difficulty: 'medium',
      question: 'Select ALL calls that store the login token so that LATER requests in the same collection run can use it as `{{token}}`.',
      options: [
        "pm.environment.set('token', json.token)",
        "pm.collectionVariables.set('token', json.token)",
        "pm.globals.set('token', json.token)",
        "pm.response.headers.add({ key: 'token', value: json.token })",
        "pm.request.headers.add({ key: 'token', value: json.token }) in the post-response script",
      ],
      correct: [0, 1, 2],
      explanation:
        'Environment, collection and global variables all persist across requests, so all three work (globals are the least advisable because they leak into every collection). Adding a header to the response object changes nothing for later requests, and modifying pm.request after the response has arrived affects only the request already sent.',
      followUps: [
        {
          q: 'Which of the three would you choose and why?',
          a: 'Collection variables: the token is produced by and only relevant to this collection\'s run. Environment would also work but mixes run-time data into per-server settings, and globals are visible to every collection in the workspace, making accidental reuse and leaks more likely.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-06',
      difficulty: 'medium',
      question: 'A folder with 4 requests is run in the Collection Runner with this CSV file. How many requests are sent?',
      code: {
        language: 'text',
        code: `firstname,lastname,totalprice,expectedStatus
Sally,Brown,111,200
Ravi,Kumar,0,200
,Brown,111,400
Ana,Silva,abc,400
Li,Wei,-5,400`,
      },
      options: ['4', '5', '20', '24'],
      correct: [2],
      explanation:
        'The header line defines variable names; it is not an iteration. Five data rows mean five iterations, and each iteration runs all 4 requests in the folder: 5 × 4 = 20. Counting the header as a row gives 24, and 4 or 5 forget that every request repeats per row.',
      followUps: [
        {
          q: 'Row 4 sends "abc" as totalprice. How must the body placeholder be written for this to test a string price?',
          a: 'If the body is "totalprice": {{totalprice}} (unquoted), row 4 produces invalid JSON (totalprice: abc), which tests malformed JSON rather than a wrong type. To test a string price, write the value with quotes in the data ("abc" escaped in CSV) or use a JSON data file where the value is the string "abc".',
        },
      ],
    },
    {
      id: 'api-postman-mcq-07',
      difficulty: 'medium',
      question: 'A request\'s post-response script calls `pm.execution.setNextRequest(\'Get booking\')`. You click **Send** on that request in the normal request tab. What happens?',
      options: [
        'Postman immediately sends the "Get booking" request next',
        'Nothing extra: setNextRequest only takes effect during a collection run',
        'The script fails with a TypeError',
        'The current request is sent again in a loop',
      ],
      correct: [1],
      explanation:
        'setNextRequest controls the order of a collection run (Runner, Newman, Postman CLI) and is documented to have no effect with Send. It does not throw; the call is simply ignored outside a run. It never repeats the current request unless, in a run, you pass its own name.',
      followUps: [
        {
          q: 'How do you stop a collection run early from a script?',
          a: 'Call pm.execution.setNextRequest(null). The current request finishes, and the run ends instead of continuing to the next request. A typical use is stopping after a failed login, so the report shows one real failure instead of many cascading ones.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL statements about Newman that are true.',
      options: [
        'It exits with a non-zero code when any test fails, which fails a CI job',
        'The -d option supplies a CSV or JSON iteration data file',
        'It needs the Postman desktop app installed and open on the CI machine',
        'The junit reporter can export XML that CI servers display as test results',
        'It can only run collections by their cloud ID, not exported JSON files',
      ],
      correct: [0, 1, 3],
      explanation:
        'Newman is a standalone Node.js CLI: it runs exported collection files (or URLs) with -e for environments and -d for data, and fails the process with a non-zero exit code on test failures. The junit reporter produces XML for CI dashboards. It does not need the desktop app, and running by cloud ID is a feature of the separate Postman CLI.',
      followUps: [
        {
          q: 'How do you pass a secret password to Newman without committing it?',
          a: 'Store it in the CI secret store and inject it at run time with --env-var "password=$RB_PASSWORD". The committed environment file only contains a placeholder or nothing for that key, so the secret never appears in the repository.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-09',
      difficulty: 'medium',
      question: 'A response-time assertion of `below(200)` fails randomly in about 1 of 10 nightly runs against the shared QA server. What is the best change?',
      options: [
        'Delete the assertion because timing tests are always flaky',
        'Raise it to 60,000 ms so it never fails',
        'Use an environment-specific, agreed budget and judge performance on a percentile over several calls, keeping functional tests separate',
        'Add pm.execution.setNextRequest to retry the request until it is under 200 ms',
      ],
      correct: [2],
      explanation:
        'A single call on a shared server is noisy, so a strict per-call threshold creates false alarms. A budget agreed per environment and evaluated over several samples catches real regressions without flakiness. Deleting the check or setting an absurd limit hides real problems, and retrying until it is fast just cherry-picks results.',
      followUps: [
        {
          q: 'Where would you get the right budget from?',
          a: 'From a non-functional requirement or SLA (for example p95 below 500 ms in staging). If none exists, measure a baseline over several days, propose a budget with some headroom, and agree it with the team so a failure means something.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-10',
      difficulty: 'hard',
      question: 'Why does this assertion fail even though the UI shows the price as 111?',
      code: {
        language: 'javascript',
        code: `// Response body: { "booking": { "totalprice": 111, ... } }
pm.test('price matches', () => {
  const b = pm.response.json().booking;
  pm.expect(b.totalprice).to.eql(pm.iterationData.get('totalprice'));
});
// CSV row: Sally,Brown,111,true`,
      },
      options: [
        'eql cannot compare numbers',
        'CSV data values are strings, so the test compares the number 111 with the string "111"',
        'pm.iterationData is only available in pre-request scripts',
        'The response must be parsed with JSON.parse(responseBody) first',
      ],
      correct: [1],
      explanation:
        'Values read from a CSV data file are strings, and eql compares types strictly, so 111 and "111" differ. Convert with Number(pm.iterationData.get("totalprice")), or use a JSON data file with real numbers. eql works fine for numbers, iterationData is available in post-response scripts, and pm.response.json() is the modern parsing API.',
      followUps: [
        {
          q: 'Would using == instead fix it? Is that a good idea?',
          a: 'Loose equality would make 111 == "111" true, but it would also hide a real bug where the API returns "111" as a string. Keep the strict comparison and convert the expected value explicitly, so the type of the API response is still verified.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-11',
      difficulty: 'hard',
      question: 'Your mock server has two saved examples for `GET /booking/1093`: "Booking found" (200) and "Booking not found" (404). How do you make the mock return the 404 example?',
      options: [
        'Append ?status=404 to the URL',
        'Send the header x-mock-response-name: Booking not found (or x-mock-response-code: 404)',
        'Delete the 200 example; mocks cannot choose between examples',
        'Set pm.response.code = 404 in a pre-request script',
      ],
      correct: [1],
      explanation:
        'Postman mock servers let the caller choose an example with the x-mock-response-name or x-mock-response-code request header. A query string is just part of the URL used for matching, not a selector. Deleting examples is unnecessary, and pm.response does not exist (and is read-only) before a response arrives.',
      followUps: [
        {
          q: 'What does a private mock server additionally require?',
          a: 'A valid Postman API key in the x-api-key header. Without it the mock rejects the call, which protects unreleased contracts from being called by anyone who finds the URL.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-12',
      difficulty: 'hard',
      question: 'Select ALL plausible reasons why a collection passes request-by-request with Send but fails in the Collection Runner.',
      options: [
        'The run only selected a folder that does not contain the login request, so {{token}} is empty',
        'A CSV column has the same name as an environment variable and overrides it during the run',
        'An earlier request in the run deletes data that a later request expects to exist',
        'The Collection Runner does not execute post-response scripts',
        'pm.test assertions are ignored outside the Send button',
      ],
      correct: [0, 1, 2],
      explanation:
        'Runs expose hidden dependencies: missing setup requests, data-scope overrides (data beats environment), and state changed by earlier requests. When you click Send manually you often have leftover variables from earlier clicks. The Runner does run pre-request and post-response scripts and reports pm.test results; that is its whole purpose.',
      followUps: [
        {
          q: 'What is your first debugging step?',
          a: 'Open the Postman Console, rerun, and look at the first failing request: compare the resolved URL, headers and body with what Send produced. Unresolved {{variables}} or a different id usually point straight at the cause, and later failures are often just a cascade.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-13',
      difficulty: 'expert',
      question: 'What does the `console.log` print the very first time this collection-level pre-request script runs (no token saved yet)?',
      code: {
        language: 'javascript',
        code: `pm.sendRequest({
  url: pm.environment.get('baseUrl') + '/auth',
  method: 'POST',
  header: { 'Content-Type': 'application/json' },
  body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'password123' }) },
}, (err, res) => {
  pm.collectionVariables.set('token', res.json().token);
});

console.log('token is', pm.collectionVariables.get('token'));`,
      },
      options: [
        'token is <the new token>, because pm.sendRequest blocks until the response arrives',
        'token is undefined, because the callback runs later; the log line executes before the response',
        'Nothing; pm.sendRequest is not allowed in pre-request scripts',
        'An error, because collection variables cannot be read in pre-request scripts',
      ],
      correct: [1],
      explanation:
        'pm.sendRequest is asynchronous: it starts the call and returns immediately, and the callback runs when the response arrives. The console.log after it runs first and sees no token yet. Postman does wait for pending callbacks before sending the main request, so {{token}} in that request can still resolve. sendRequest and reading collection variables are both allowed in pre-request scripts.',
      followUps: [
        {
          q: 'How would you log the token correctly?',
          a: 'Move the log inside the callback, after pm.collectionVariables.set. Any logic that depends on the token, such as setting a header with pm.request.headers.upsert, must also live inside the callback (or use the promise-based await form where your Postman version supports it).',
        },
      ],
    },
    {
      id: 'api-postman-mcq-14',
      difficulty: 'expert',
      question: 'This schema test passes even when the API returns `{}`. Why?',
      code: {
        language: 'javascript',
        code: `const schema = {
  type: 'object',
  properties: {
    bookingid: { type: 'integer' },
    booking: { type: 'object' },
  },
};

pm.test('matches schema', () => {
  pm.response.to.have.jsonSchema(schema);
});`,
      },
      options: [
        'jsonSchema only checks the Content-Type header',
        'No required array: listed properties are optional, so an empty object is valid',
        'Postman needs the schema as a string, so the check is silently skipped',
        'Ajv in Postman only validates arrays, not objects',
      ],
      correct: [1],
      explanation:
        'In JSON Schema, properties only describe fields when they are present; without required: ["bookingid", "booking"] an empty object satisfies the schema. Adding required (and additionalProperties: false where appropriate) fixes it. jsonSchema validates the body with Ajv and accepts a schema object, and it validates objects just fine.',
      followUps: [
        {
          q: 'Which JSON Schema draft should you target in Postman, and why?',
          a: 'Draft-07. Postman validates with Ajv 6.12.5, which supports up to draft-07, so newer 2019-09/2020-12 keywords such as $defs semantics or unevaluatedProperties are not understood and may be ignored, giving false passes.',
        },
      ],
    },
    {
      id: 'api-postman-mcq-15',
      difficulty: 'easy',
      question: 'You want every request in the collection to fail if the server returns any 5xx status. Where is the best place to put that one check?',
      options: [
        'Copy the test into every request\'s post-response script',
        'In the collection-level post-response script',
        'In the collection-level pre-request script',
        'In the environment file',
      ],
      correct: [1],
      explanation:
        'Collection-level post-response scripts run after every request in the collection, so one test covers all of them and stays consistent. Copy-pasting creates hundreds of duplicates that drift. A pre-request script runs before there is a response, and environment files hold variables, not scripts.',
      followUps: [
        {
          q: 'How do you make the failure message say which request failed?',
          a: 'Include pm.info.requestName in the test name or in the assertion message, for example pm.expect(pm.response.code, pm.info.requestName).to.be.below(500). The report then shows the request name next to the failure instead of a generic "no server error" line.',
        },
      ],
    },
  ],
};

export default topic;
