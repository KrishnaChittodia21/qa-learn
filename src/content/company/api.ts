import type { CompanyQuestion } from '../../types';

// Company-reported API-testing interview questions. Every entry links to a page that was opened
// and that reports the question at that company (see CONTENT_GUIDE.md, "Company-reported interview questions").

const GFG_TTN = 'https://www.geeksforgeeks.org/interview-experiences/to-the-new-interview-experience-for-quality-engineer/';
const GFG_PAYTM_QA =
  'https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-quality-assurance-engineer-on-campus-2022/';
const GFG_COUPA = 'https://www.geeksforgeeks.org/interview-experiences/coupa-software-interview-experience-sdet-role-full-time/';
const GFG_COMMVAULT = 'https://www.geeksforgeeks.org/interview-experiences/commvault-interview-experience-for-sdet/';
const GFG_AMAZON_SDET = 'https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-432-sdet-off-campus/';
const GFG_GREY_ORANGE = 'https://www.geeksforgeeks.org/interview-experiences/grey-orange-interview-experience-for-sdet-on-campus/';
const LC_AMAZON_QAE = 'https://leetcode.com/discuss/post/5573766/';
const LC_SWIGGY = 'https://leetcode.com/discuss/interview-experience/5235311/Swiggy-or-SDET-or-Remote-or-May-2024-Offer/';
const LC_CASHFREE = 'https://leetcode.com/discuss/post/2514357/';
const LC_EQ = 'https://leetcode.com/discuss/post/4366315/';
const LC_ZEPTO = 'https://leetcode.com/discuss/post/6026438/';
const MD_EPAM = 'https://medium.com/@ArpitChoubey9/epam-anywhere-interview-questions-for-sdet-role-a149e02c112d';
const MD_IRIS =
  'https://medium.com/@ArpitChoubey9/iris-software-interview-questions-for-experience-qa-automation-testing-role-daa32076d622';
const MD_INFOSYS = 'https://medium.com/@ArpitChoubey9/infosys-interview-questions-for-automation-testing-selenium-java-e8b98308eaed';

export const QUESTIONS: CompanyQuestion[] = [
  {
    id: 'co-api-to-the-new-1',
    company: 'To The New',
    area: 'api',
    role: 'Quality Engineer',
    round: 'Interview round (round 3)',
    difficulty: 'easy',
    question: 'What is an API, and have you ever tested one using Postman? Walk me through how you did it.',
    answer: `An **API** (Application Programming Interface) is a contract that lets one program ask another for data or actions without knowing its internals. For web apps this is usually a REST/HTTP API: a client sends a **method** (GET, POST, PUT, PATCH, DELETE) to a **URL**, with headers and an optional JSON body, and gets back a **status code**, headers and a body.

How I test one in Postman:
1. Create a request (e.g. \`POST /api/users\`) with headers (\`Content-Type: application/json\`, \`Authorization: Bearer <token>\`) and a body.
2. Keep the base URL and token in **environment variables** (\`{{baseUrl}}\`) so the same collection runs on dev and staging.
3. Add assertions in the **Tests** tab:

    pm.test('created', () => pm.response.to.have.status(201));
    const body = pm.response.json();
    pm.test('has id', () => pm.expect(body.id).to.be.a('number'));
    pm.environment.set('userId', body.id);

4. Cover negatives: missing field → 400, no token → 401, unknown id → 404, duplicate → 409.
5. Chain requests (create → get → delete) through saved variables and run the collection with the Collection Runner or Newman in CI.`,
    followUps: [
      {
        q: 'Why test at the API layer when the UI is already tested?',
        a: 'API tests are faster, less flaky and pinpoint the failing service. They also cover rules and error paths the UI hides, such as validation, auth and bad payloads.',
      },
    ],
    topic: 'api-postman',
    source: { name: 'GeeksforGeeks — To The New interview experience for Quality Engineer', url: GFG_TTN, year: 2023 },
  },
  {
    id: 'co-api-paytm-1',
    company: 'Paytm',
    area: 'api',
    role: 'Quality Assurance Engineer',
    round: 'Interview round 1',
    difficulty: 'easy',
    question: 'What is Postman and what do you use it for?',
    answer: `**Postman** is a client for building, sending and automating HTTP requests. Testers use it to:

- **Explore an API** by sending GET/POST/PUT/PATCH/DELETE requests with headers, query params, auth and JSON bodies, then inspecting the status code, headers, body and response time.
- **Assert** behaviour with JavaScript in the Tests tab (\`pm.response.to.have.status(200)\`, JSON field checks, schema validation).
- **Organise** requests in **collections** and keep URLs and tokens in **environments** (dev, QA, prod) and variables.
- **Chain** calls: a pre-request script logs in and stores the token, and later requests reuse \`{{token}}\`.
- **Run** a whole collection with data files (CSV/JSON) in the Collection Runner, or headless in CI with **Newman**.
- **Mock servers, monitors and docs**: stub an API before it exists, schedule health checks and publish documentation.

In short, it covers manual API exploration and gives you a quick path to a regression suite.`,
    followUps: [
      {
        q: 'How do you run a Postman collection in a CI pipeline?',
        a: 'Export the collection and environment (or use the Postman API), then run newman run collection.json -e qa.json --reporters cli,junit. Publish the JUnit report and let a non-zero exit code fail the build.',
      },
    ],
    topic: 'api-postman',
    source: { name: 'GeeksforGeeks — Paytm interview experience for QA Engineer (on-campus)', url: GFG_PAYTM_QA, year: 2021 },
  },
  {
    id: 'co-api-paytm-2',
    company: 'Paytm',
    area: 'api',
    role: 'Quality Assurance Engineer',
    round: 'Interview round 1',
    difficulty: 'easy',
    question: 'What is a web service, and how is it related to an API?',
    answer: `An **API** is any defined interface one piece of software exposes to another. It could be a library's functions, an OS call or an HTTP endpoint.

A **web service** is an API that is reached **over a network using web protocols** (HTTP/HTTPS) and exchanges data in a standard format such as JSON or XML. So every web service is an API, but not every API is a web service (a Java library's methods are an API with no network involved).

The two common styles:
- **SOAP**: XML envelopes, a strict WSDL contract, usually POST, built-in WS-Security. Often found in banking and legacy enterprise systems.
- **REST**: resources addressed by URLs, HTTP methods as verbs, usually JSON, stateless, and status codes carry the result.

As a tester I check the contract (fields, types, required values), status codes, error messages, auth, and response time for each operation.`,
    followUps: [
      {
        q: 'What does "stateless" mean for a REST service?',
        a: 'Each request carries everything the server needs, such as the auth token and parameters. The server keeps no client session between calls, which makes requests independent, cacheable and easy to scale.',
      },
    ],
    topic: 'api-http',
    source: { name: 'GeeksforGeeks — Paytm interview experience for QA Engineer (on-campus)', url: GFG_PAYTM_QA, year: 2021 },
  },
  {
    id: 'co-api-coupa-software-1',
    company: 'Coupa Software',
    area: 'api',
    role: 'SDET',
    round: '2nd round',
    difficulty: 'medium',
    question: 'What is the difference between PUT and PATCH in a REST API?',
    answer: `- **PUT** replaces the **whole resource** at a URL with the body you send. Fields you leave out are reset or removed (by the spec). It is **idempotent**: sending the same PUT twice leaves the same state. Typical responses: **200 OK** or **204 No Content**, and **201 Created** if PUT is allowed to create.
- **PATCH** applies a **partial update**: only the fields in the body change (\`{"email": "new@x.com"}\`). It is *not guaranteed* idempotent. An operation like "increment stock by 1" changes the state every time. Typical responses: **200** with the updated resource, or **204**.

How I test the difference:

    PUT   /users/7  {"name":"Asha","email":"a@x.com","phone":"999"}  -> 200
    PATCH /users/7  {"email":"b@x.com"}                              -> 200
    GET   /users/7  -> name and phone unchanged, email = b@x.com

Also check: PUT with missing required fields → **400**, unknown id → **404** (or 201 if upsert), stale version → **409/412**, and that sending a PUT twice gives an identical GET.`,
    followUps: [
      {
        q: 'Which HTTP methods are idempotent?',
        a: 'GET, HEAD, OPTIONS, PUT and DELETE are idempotent: repeating them leaves the server in the same state. POST is not, and PATCH is only idempotent if the API designs it that way.',
      },
    ],
    topic: 'api-http',
    source: { name: 'GeeksforGeeks — Coupa Software interview experience (SDET, full-time)', url: GFG_COUPA, year: 2024 },
  },
  {
    id: 'co-api-coupa-software-2',
    company: 'Coupa Software',
    area: 'api',
    role: 'SDET',
    round: '2nd round',
    difficulty: 'easy',
    question: 'Explain the difference between GET and POST requests.',
    answer: `| | GET | POST |
|---|---|---|
| Purpose | Read a resource | Create a resource or trigger processing |
| Data | Query string (\`?page=2\`), no body by convention | Request body (JSON, form data, files) |
| Safe / idempotent | Safe and idempotent | Neither: two POSTs can create two records |
| Caching / bookmarking | Cacheable, can be bookmarked, stays in history | Not cached by default |
| Typical status | **200 OK**, 304 Not Modified, 404 | **201 Created** + \`Location\` header, 200/202, 400/409/422 |

Security note: GET parameters end up in logs, browser history and proxies, so never put passwords or tokens in a query string. A POST body is not encrypted on its own either; only **HTTPS** protects both.

Tests I would write: GET returns the same data on repeat and never changes state; POST with a valid body returns 201 and the record is then readable with GET; a duplicate POST is handled (409 or an idempotency key); invalid body → 400/422.`,
    followUps: [
      {
        q: 'Can a GET request have a body?',
        a: 'HTTP does not forbid it, but the body has no defined meaning for GET. Many servers, proxies and clients drop or reject it, so APIs should use query parameters or a POST search endpoint instead.',
      },
    ],
    topic: 'api-http',
    source: { name: 'GeeksforGeeks — Coupa Software interview experience (SDET, full-time)', url: GFG_COUPA, year: 2024 },
  },
  {
    id: 'co-api-commvault-1',
    company: 'CommVault',
    area: 'api',
    role: 'SDET',
    round: 'Third technical round',
    difficulty: 'medium',
    question: 'What is the difference between HTTP and HTTPS, and how does HTTPS work?',
    answer: `**HTTP** sends requests and responses as plain text (default port **80**). Anyone on the path can read or alter them.

**HTTPS** is HTTP over **TLS** (default port **443**), which adds:
- **Encryption**, so traffic can't be read.
- **Integrity**, so tampering is detected.
- **Authentication**, so the server proves its identity with a certificate signed by a trusted CA.

How the connection is set up (TLS 1.3, simplified):
1. The client sends a **ClientHello** with supported ciphers and a key share.
2. The server replies with its key share and **certificate**. The client checks the chain, expiry and that the hostname matches.
3. Both sides derive the same **symmetric session key** (ECDHE). The asymmetric crypto is used only for the handshake.
4. HTTP requests then flow encrypted with that symmetric key.

What I test: HTTP redirects to HTTPS (301/308); the **HSTS** header is set; there is no mixed content; invalid or expired certificates are rejected by clients; cookies carry the \`Secure\` flag.`,
    followUps: [
      {
        q: 'Why is symmetric encryption used after the handshake?',
        a: 'Symmetric ciphers like AES are far faster than public-key crypto. The handshake only uses asymmetric keys to agree on a shared secret safely, then switches to the faster symmetric key for the actual traffic.',
      },
    ],
    topic: 'api-http',
    source: { name: 'GeeksforGeeks — CommVault interview experience for SDET', url: GFG_COMMVAULT, year: 2020 },
  },
  {
    id: 'co-api-amazon-1',
    company: 'Amazon',
    area: 'api',
    role: 'SDET',
    round: 'Round 3 (Software Development Manager)',
    difficulty: 'medium',
    question: 'Pick an API from one of your own projects and explain how you would test it.',
    answer: `Use a concrete endpoint, e.g. \`POST /orders\` (creates an order), and go layer by layer:

1. **Contract**: the request and response match the spec/OpenAPI. Check required fields, types and enums, and validate the response against the JSON schema.
2. **Happy path**: valid body → **201 Created**, a \`Location\` header, and the order is readable with \`GET /orders/{id}\`. Totals are correct and the DB row was written.
3. **Validation**: missing or extra fields, wrong types, negative quantity, empty cart → **400/422** with a clear error body.
4. **Auth**: no token → **401**; another user's token → **403** (or 404); expired token → 401.
5. **State and business rules**: out-of-stock item → **409**. Duplicate submit with the same idempotency key → one order only.
6. **Boundaries**: max items, large payloads (**413**), Unicode in names, pagination limits on list endpoints.
7. **Resilience**: downstream payment failure → correct rollback/compensation; a timeout returns **503/504**, not a 500 stack trace.
8. **Non-functional**: latency under load (p95), rate limiting (**429**), and no sensitive data in responses or logs.

Then automate the stable cases in CI with data setup and cleanup through the API itself.`,
    followUps: [
      {
        q: 'How do you keep API tests independent of each other?',
        a: 'Each test creates its own data (via API or a seeded fixture), uses unique IDs, and cleans up after itself. No test relies on another test having run first, so they can run in parallel and in any order.',
      },
    ],
    topic: 'api-http',
    source: { name: 'GeeksforGeeks — Amazon interview experience Set 432 (SDET off-campus)', url: GFG_AMAZON_SDET, year: 2018 },
  },
  {
    id: 'co-api-amazon-2',
    company: 'Amazon',
    area: 'api',
    role: 'QAE-1',
    round: '1st round',
    difficulty: 'easy',
    question: 'Which HTTP status codes do you check when testing APIs, and what does each one mean?',
    answer: `Status classes: **1xx** informational, **2xx** success, **3xx** redirection, **4xx** client error, **5xx** server error.

The ones I assert most:
- **200 OK**: successful GET/PUT/PATCH with a body. **201 Created**: POST created a resource (expect a \`Location\` header). **202 Accepted**: queued for async processing. **204 No Content**: success with an empty body (often DELETE).
- **301/302/308**: redirects. **304 Not Modified**: the cached copy is still valid.
- **400 Bad Request**: malformed or invalid input. **401 Unauthorized**: missing or invalid credentials. **403 Forbidden**: authenticated but not allowed. **404 Not Found**. **405 Method Not Allowed**. **409 Conflict**: duplicate or version clash. **415 Unsupported Media Type**. **422 Unprocessable Entity**: valid JSON that breaks business rules. **429 Too Many Requests**: rate limited.
- **500 Internal Server Error**: an unhandled bug. **502 Bad Gateway** / **503 Service Unavailable** / **504 Gateway Timeout**: infrastructure or downstream problems.

Testing tip: assert the **exact** code, not just "not 500". Check the error body too (a code and message, no stack trace).`,
    followUps: [
      {
        q: 'What is the difference between 401 and 403?',
        a: '401 means the server could not authenticate you (no token, or an invalid or expired one), so logging in again may help. 403 means it knows who you are, but you lack permission for this resource, so re-authenticating will not help.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — Amazon QAE, Hyderabad interview (July 2024)', url: LC_AMAZON_QAE, year: 2024 },
  },
  {
    id: 'co-api-amazon-3',
    company: 'Amazon',
    area: 'api',
    role: 'QAE-1',
    round: '1st round',
    difficulty: 'medium',
    question: 'Design a REST API that fetches data, for example a list of orders, and explain your design choices.',
    answer: `Example: fetch a customer's orders.

    GET /v1/customers/{customerId}/orders?status=SHIPPED&from=2024-01-01&limit=20&cursor=abc
    Authorization: Bearer <token>

    200 OK
    { "items": [ { "orderId": "o-91", "status": "SHIPPED", "total": 1499.0, "currency": "INR", "createdAt": "2024-06-01T10:00:00Z" } ],
      "nextCursor": "def", "limit": 20 }

Design choices:
- **Nouns and hierarchy** in the path, the **GET** verb, and **versioning** (\`/v1\`).
- **Filtering, sorting and pagination** through query params. Use cursor pagination for large or changing lists and set a max \`limit\`.
- **Status codes**: 200 (an empty list is still 200), 400 for bad params, 401/403 for auth, 404 for an unknown customer, 429 when rate limited.
- **Consistent error body**: \`{ "code": "INVALID_DATE", "message": "..." }\`.
- **Caching** with \`ETag\` / \`Cache-Control\` → 304 Not Modified.
- **Security**: a customer can only read their own orders, so object-level authorization is required.

As a QAE I would then list tests for each of these: pagination edges, filter combinations, auth matrix, schema, and latency.`,
    followUps: [
      {
        q: 'Offset or cursor pagination — which would you choose and why?',
        a: 'Offset (page/limit) is simple but slow for deep pages and skips or duplicates rows when data changes between calls. A cursor (keyset) stays stable and fast for large live data, so it suits order lists better.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — Amazon QAE, Hyderabad interview (July 2024)', url: LC_AMAZON_QAE, year: 2024 },
  },
  {
    id: 'co-api-swiggy-1',
    company: 'Swiggy',
    area: 'api',
    role: 'SDET',
    round: 'Round 1: Technical',
    difficulty: 'medium',
    question: 'How do you test an API? Explain your approach from start to finish.',
    answer: `My checklist, in order:

1. **Understand the contract**: read the spec/OpenAPI and note each endpoint's method, URL, params, auth, request and response schema, and documented errors.
2. **Positive tests**: valid requests return the right **status** (200/201/204), body values, headers (\`Content-Type\`) and schema. The side effect is visible through a follow-up GET or a DB check.
3. **Negative tests**: missing, invalid or extra fields, wrong types and boundary values → **400/422**. Wrong method → **405**. Unknown id → **404**.
4. **Auth and security**: no token → **401**; another user's resource → **403/404**; expired token; injection strings; no secrets in responses.
5. **Business flows**: chain calls, e.g. add to cart → apply coupon → place order → cancel, and check the state at every step.
6. **Idempotency and concurrency**: retries do not double-charge; two parallel updates are handled (409 or a last-write rule).
7. **Non-functional**: response time, rate limits (**429**), large payloads, pagination.
8. **Automate** stable checks (Postman/Newman, RestAssured or Playwright \`request\`) with test data created and cleaned up via the API, run in CI on every build.`,
    followUps: [
      {
        q: 'What is contract testing and when would you use it?',
        a: 'Contract testing checks that a provider still meets what each consumer expects (for example with Pact or OpenAPI schema checks). It catches breaking changes between microservices early, without a full end-to-end environment.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — Swiggy | SDET | Remote | May 2024 [Offer]', url: LC_SWIGGY, year: 2024 },
  },
  {
    id: 'co-api-epam-anywhere-1',
    company: 'EPAM Anywhere',
    area: 'api',
    role: 'SDET',
    difficulty: 'easy',
    question: 'What types of web services are there, and how does SOAP differ from REST?',
    answer: `The two main types are **SOAP** and **REST** web services. GraphQL and gRPC are newer API styles.

| | SOAP | REST |
|---|---|---|
| Nature | A protocol with strict rules | An architectural style |
| Format | **XML** only (an envelope with header and body) | Usually **JSON**; XML, text etc. also possible |
| Contract | **WSDL** describes every operation | OpenAPI/Swagger (optional) |
| Transport | Mostly HTTP POST (can use SMTP, JMS) | HTTP methods GET/POST/PUT/PATCH/DELETE |
| Errors | A SOAP **Fault** element (often with HTTP 500) | HTTP **status codes** (400, 404, 500…) |
| Security | WS-Security built in | HTTPS + OAuth2/JWT |
| State / caching | Can be stateful; not cacheable | Stateless; GETs are cacheable |

When to use: SOAP for strict enterprise contracts and transactions (banking, payments). REST for lightweight web and mobile APIs. In testing, SOAP checks are XPath assertions on XML, while REST checks are JSON-path assertions plus status codes.`,
    followUps: [
      {
        q: 'Which tools would you use to test a SOAP service?',
        a: 'SoapUI or ReadyAPI import the WSDL and generate requests. Postman can also send raw XML envelopes with a text/xml content type, and RestAssured can post XML and assert with XPath.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — EPAM Anywhere interview questions for SDET role (Arpit Choubey)', url: MD_EPAM, year: 2024 },
  },
  {
    id: 'co-api-epam-anywhere-2',
    company: 'EPAM Anywhere',
    area: 'api',
    role: 'SDET',
    difficulty: 'easy',
    question: 'Explain the main REST methods — GET, PUT, POST, DELETE and PATCH — with an example of each.',
    answer: `Using a \`/books\` resource:

    GET    /books/42            -> 200 + book JSON (404 if missing)      read
    POST   /books   {title,...} -> 201 + Location: /books/43              create
    PUT    /books/42 {full obj} -> 200/204 (replaces the whole book)      full update
    PATCH  /books/42 {price:10} -> 200/204 (changes only price)           partial update
    DELETE /books/42            -> 204 (then GET -> 404)                  delete

Key properties:
- **Safe** (does not change data): GET (also HEAD, OPTIONS).
- **Idempotent** (repeating has the same effect): GET, PUT, DELETE. **Not idempotent**: POST, and PATCH unless designed that way.
- These map to **CRUD**: Create = POST, Read = GET, Update = PUT/PATCH, Delete = DELETE.

Tests for each: correct status, body and schema; the follow-up GET reflects the change; method not allowed → **405**; invalid body → **400**; repeating PUT/DELETE gives the same final state (a second DELETE often returns 404 but changes nothing).`,
    followUps: [
      {
        q: 'What are HEAD and OPTIONS used for?',
        a: 'HEAD returns only the headers of a GET (to check existence, size or caching). OPTIONS lists the allowed methods and is what browsers send as the CORS preflight before cross-origin requests.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — EPAM Anywhere interview questions for SDET role (Arpit Choubey)', url: MD_EPAM, year: 2024 },
  },
  {
    id: 'co-api-iris-software-1',
    company: 'IRIS Software',
    area: 'api',
    role: 'QA Automation (experienced)',
    round: 'L1 round',
    difficulty: 'easy',
    question: 'Describe the HTTP request methods GET, POST, PUT and PATCH, and when you would use each one.',
    answer: `- **GET**: read data without side effects, e.g. \`GET /accounts/12\` → **200** with the account, or **404**. Use it for lookups, lists and searches with query params. It is cacheable.
- **POST**: create a new resource or trigger an action whose result the server decides, e.g. \`POST /accounts\` → **201 Created** + \`Location\`. Also used for non-idempotent actions like "submit payment" or "send OTP".
- **PUT**: replace a resource completely at a known URL, e.g. \`PUT /accounts/12\` with the full object → **200/204**. Idempotent, so it is safe to retry.
- **PATCH**: change a few fields, e.g. \`PATCH /accounts/12 {"phone":"..."}\` → **200/204**. Saves bandwidth and avoids overwriting fields you did not send.

Decision rule: reading → GET; new item → POST; you have the full object → PUT; you change one or two fields → PATCH.

What I verify for each: status code, response schema, the persisted change (a follow-up GET), and that unsupported methods return **405 Method Not Allowed**.`,
    followUps: [
      {
        q: 'If a client retries a timed-out POST payment, what can go wrong and how is it prevented?',
        a: 'The retry may create a duplicate charge, because POST is not idempotent. APIs prevent this with an Idempotency-Key header: the server stores the first result and returns it for any repeat with the same key.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — IRIS Software interview questions for experienced QA automation role (Arpit Choubey)', url: MD_IRIS, year: 2025 },
  },
  {
    id: 'co-api-iris-software-2',
    company: 'IRIS Software',
    area: 'api',
    role: 'QA Automation (experienced)',
    round: 'L1 round',
    difficulty: 'easy',
    question: 'What do the HTTP status codes 404, 501 and 503 indicate?',
    answer: `- **404 Not Found** (client error): the server is up, but nothing exists at that URL or with that id, e.g. \`GET /users/99999\`. It can also be returned on purpose to hide a resource the caller may not access. As a tester, check it is returned for unknown ids, not a 200 with an empty body or a 500.
- **501 Not Implemented** (server error): the server does not support the **method/functionality** at all, e.g. a server that has not implemented PATCH. Compare with **405 Method Not Allowed**: the server knows the method, but this resource does not allow it.
- **503 Service Unavailable** (server error): the server is temporarily unable to handle the request because of overload, maintenance, or a dependency being down. It should be temporary and may include a \`Retry-After\` header.

Testing angle: 4xx means the client must change the request. 5xx means the server side must be fixed or recover. For 503, check that clients retry with backoff and that health checks or circuit breakers behave correctly.`,
    followUps: [
      {
        q: 'How is 502 Bad Gateway different from 503 and 504?',
        a: '502: a proxy or gateway got an invalid response from the upstream server. 503: the service is up but temporarily refusing work. 504: the gateway timed out waiting for the upstream to respond.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — IRIS Software interview questions for experienced QA automation role (Arpit Choubey)', url: MD_IRIS, year: 2025 },
  },
  {
    id: 'co-api-iris-software-3',
    company: 'IRIS Software',
    area: 'api',
    role: 'QA Automation (experienced)',
    round: 'L1 round',
    difficulty: 'medium',
    question: 'What is API chaining, and where would you use it in testing?',
    answer: `**API chaining** means using data from one response as input to the next request, so you can test a real workflow instead of isolated calls.

Example (e-commerce):
1. \`POST /auth/login\` → save \`token\`
2. \`POST /cart/items\` with \`Authorization: Bearer {{token}}\` → save \`cartId\`
3. \`POST /orders {cartId}\` → **201**, save \`orderId\`
4. \`GET /orders/{{orderId}}\` → status \`PLACED\`
5. \`DELETE /orders/{{orderId}}\` → **204**, then GET → \`CANCELLED\` or 404

In Postman:

    // Tests tab of the login request
    pm.environment.set('token', pm.response.json().accessToken);

In code (Playwright request / RestAssured) you store the value in a variable and pass it on.

Use it for **end-to-end business flows**, **auth** (token reuse), **test-data setup and cleanup**, and **state transitions**. Assert at each step and stop the chain early if a step fails, so the report shows the real cause instead of a string of later failures.`,
    followUps: [
      {
        q: 'What is the downside of long chained tests?',
        a: 'One early failure masks everything after it, debugging is slower, and the tests cannot run in parallel easily. Keep chains short and cover single endpoints in separate isolated tests.',
      },
    ],
    topic: 'api-postman',
    source: { name: 'Medium — IRIS Software interview questions for experienced QA automation role (Arpit Choubey)', url: MD_IRIS, year: 2025 },
  },
  {
    id: 'co-api-infosys-1',
    company: 'Infosys',
    area: 'api',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'easy',
    question: 'Explain CRUD operations and map each one to an HTTP method, with examples.',
    answer: `**CRUD** = Create, Read, Update, Delete, the four basic operations on stored data. In REST each maps to an HTTP method:

    Create  POST   /employees          {"name":"Ravi"}  -> 201 Created, Location: /employees/15
    Read    GET    /employees/15                         -> 200 OK  (GET /employees -> list)
    Update  PUT    /employees/15       {full object}     -> 200 / 204
            PATCH  /employees/15       {"dept":"QA"}     -> 200 / 204
    Delete  DELETE /employees/15                         -> 204 No Content (then GET -> 404)

They line up with SQL too: INSERT, SELECT, UPDATE, DELETE.

A full CRUD test in one flow: create → read back and compare fields → update → read and verify only the intended fields changed → delete → read returns **404**. Add negatives at each step: invalid body (400), unknown id (404), unauthorized user (401/403), duplicate create (409).`,
    followUps: [
      {
        q: 'How do you verify that the data was really persisted, not just echoed back?',
        a: 'Do a separate GET (ideally on a fresh connection) or query the database directly after the write, and compare it with what was sent, instead of trusting the POST/PUT response body.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
  {
    id: 'co-api-infosys-2',
    company: 'Infosys',
    area: 'api',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'medium',
    question: 'What does HTTP status 429 mean, and how would you test an API for it?',
    answer: `**429 Too Many Requests** means the client went over a **rate limit** (e.g. 100 requests per minute per API key or IP). Good APIs add a **\`Retry-After\`** header and often \`X-RateLimit-Limit / -Remaining / -Reset\`.

How I test it:
1. Read the documented limit and window.
2. Send requests up to the limit → all **2xx**, and \`Remaining\` counts down correctly.
3. Send one more → **429**, with a clear error body and a \`Retry-After\` value.
4. Wait for the window to reset → requests succeed again.
5. Check the limit's scope: per user/key/IP/endpoint, and that one tenant hitting the limit does not block another.
6. Check that the client or SDK retries with **exponential backoff** and respects \`Retry-After\` instead of hammering the API.

Tools: a loop in a Postman pre-request script or Newman with iterations, k6/JMeter for concurrency, or a small script:

    for (let i = 0; i < 105; i++) codes.push((await request.get('/api/items')).status());
    expect(codes.slice(0, 100).every(c => c === 200)).toBe(true);
    expect(codes.at(-1)).toBe(429);`,
    followUps: [
      {
        q: 'Is 429 a client or a server error, and should it be retried?',
        a: 'It is a 4xx client error, because the caller sent too many requests. It is retryable, but only after the Retry-After delay or with backoff. Retrying immediately just keeps getting 429.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
  {
    id: 'co-api-infosys-3',
    company: 'Infosys',
    area: 'api',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'medium',
    question: 'What is OAuth 2.0, and what is a Bearer token?',
    answer: `**OAuth 2.0** is an **authorization framework**. It lets a client app get limited access to a user's resources on another server without seeing the user's password.

Roles: **resource owner** (the user), **client** (the app), **authorization server** (issues tokens), **resource server** (the API).

Common flows (grants):
- **Authorization Code + PKCE**: web and mobile apps. The user logs in at the auth server, the app gets a code and swaps it for tokens.
- **Client Credentials**: machine-to-machine, with no user involved.
- (Implicit and password grants are deprecated.)

The result is an **access token** (short-lived, often a JWT) plus an optional **refresh token**.

A **Bearer token** is a token sent in the header like this:

    Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

"Bearer" means *whoever holds it can use it*, so it must only travel over HTTPS and be kept out of logs and URLs.

Tests: no token → **401**; expired or tampered token → 401; valid token without the needed **scope/role** → **403**; refresh flow issues a new token; logout or revocation invalidates it.`,
    followUps: [
      {
        q: 'In automation, how do you handle tokens that expire during a long test run?',
        a: 'Fetch the token once in a setup or fixture with the client-credentials or login call, cache it with its expiry time, and refresh it automatically when it is close to expiring or after a 401. Never hard-code tokens.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
  {
    id: 'co-api-infosys-4',
    company: 'Infosys',
    area: 'api',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'medium',
    question: 'Explain what a JWT is and how it is structured.',
    answer: `A **JWT (JSON Web Token)** is a compact, URL-safe token that carries **claims** about a user and is **signed** so the server can verify that nobody changed it.

Structure: three Base64URL parts joined by dots, \`header.payload.signature\`:
- **Header**: algorithm and type, e.g. \`{"alg":"RS256","typ":"JWT"}\`
- **Payload**: claims, e.g. \`sub\` (user id), \`exp\` (expiry), \`iat\`, \`iss\`, \`aud\`, \`roles\`/\`scope\`
- **Signature**: a sign-over of header + payload with a secret (HS256) or a private key (RS256)

The payload is **encoded, not encrypted**: anyone can decode it, so it must never contain passwords or PII.

Security tests I run:
- Change one character in the payload → **401** (signature check fails).
- Expired \`exp\` → 401. Wrong \`aud\`/\`iss\` → 401.
- Header \`alg: none\` or an HS/RS algorithm swap → rejected.
- A role claim edited client-side does not grant access.
- The token is not stored where XSS can read it (prefer httpOnly cookies, or keep it short-lived).`,
    followUps: [
      {
        q: 'Why is logout hard with JWTs, and how is it handled?',
        a: 'A JWT stays valid until it expires because the server does not store it. Teams use short access-token lifetimes with refresh tokens, plus a deny-list or token versioning to revoke tokens early.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
  {
    id: 'co-api-infosys-5',
    company: 'Infosys',
    area: 'api',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'medium',
    question: 'Can the POST method be used to update an existing resource?',
    answer: `**Technically yes**: HTTP does not stop a server from updating data on POST, and some APIs do it (e.g. \`POST /users/7/update\`, RPC-style or SOAP-style services, or endpoints that "create or update"). But it is **not the REST convention**:

- **PUT** (full replace) and **PATCH** (partial change) are the standard update methods. PUT is **idempotent**, so clients, proxies and retry logic can safely repeat it.
- **POST is not idempotent**: a retried POST may apply the update twice (e.g. "add 100 to the balance"), and caches and tooling treat it as a create.
- POST is fine for **actions** that don't map to a field change, e.g. \`POST /orders/9/cancel\`, or when the update needs a body that intermediaries strip from other methods.

Testing angle: if an API does update via POST, check what happens when the request is repeated (is a duplicate prevented?), the response code (200 rather than 201), and that the documentation states it clearly.`,
    followUps: [
      {
        q: 'What status code should a successful update return?',
        a: '200 OK if the response includes the updated representation, or 204 No Content if it returns no body. 201 is only for when a new resource was created, for example a PUT that upserts.',
      },
    ],
    topic: 'api-http',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
  {
    id: 'co-api-infosys-6',
    company: 'Infosys',
    area: 'api',
    role: 'Automation Testing (Selenium + Java)',
    difficulty: 'medium',
    question: 'If the Postman console already shows request logs, why would a team also use Kibana?',
    answer: `They look at **different sides** of the system:

- **Postman console** shows only the **client side of your own requests**: the exact URL, headers, body sent and the raw response. It is local, short-lived and covers one tester's session. It is great for debugging *what I sent*.
- **Kibana** (on Elasticsearch, part of the ELK stack) shows **server-side logs from every service and every user**, collected centrally and kept over time. With it you can:
  - follow one request through many microservices with a **correlation/trace id**;
  - see the **stack trace** behind a 500 the client only saw as "Internal Server Error";
  - find errors and slow requests across environments by time range, service or status code;
  - build dashboards and alerts (error rate, latency, 5xx spikes);
  - investigate issues you did not trigger yourself (production incidents, CI runs).

In practice: reproduce in Postman, copy the request or correlation id from the response headers, and search for it in Kibana to find the root cause.`,
    followUps: [
      {
        q: 'What would you put in a bug report for a failing API call?',
        a: 'The method, URL, headers (with secrets masked), request body, expected and actual status and body, environment, timestamp, and the correlation or trace id. Also the matching server log excerpt from Kibana and a cURL to reproduce it.',
      },
    ],
    topic: 'api-postman',
    source: { name: 'Medium — Infosys interview questions for automation testing (Selenium, Java) (Arpit Choubey)', url: MD_INFOSYS, year: 2024 },
  },
  {
    id: 'co-api-cashfree-1',
    company: 'CashFree',
    area: 'api',
    role: 'SDET',
    round: 'Round 3',
    difficulty: 'medium',
    question: 'Why do we use HTTP, and how is a WebSocket different from HTTP?',
    answer: `**HTTP** is the stateless **request/response** protocol of the web. The client asks, the server answers, and that exchange is done. Methods, status codes, headers and caching make it simple, scalable and supported everywhere, which is why REST APIs, browsers and CDNs are built on it.

**WebSocket** starts as an HTTP request with \`Upgrade: websocket\` (the server replies **101 Switching Protocols**) and then keeps **one long-lived, full-duplex TCP connection** open. **Either side can push messages at any time** with very little overhead per message.

| | HTTP | WebSocket |
|---|---|---|
| Pattern | Client pulls (request → response) | Two-way push |
| Connection | Short-lived, or reused for requests | Persistent |
| Overhead | Headers on every request | Small frames after the handshake |
| Use for | CRUD APIs, pages, files | Chat, live order or payment status, tickers, games |

Testing WebSockets: check the handshake and auth, message order and format, reconnect after the network drops, heartbeats (ping/pong), behaviour under many connections, and that no messages are lost or duplicated.`,
    followUps: [
      {
        q: 'What alternatives exist for real-time updates without WebSockets?',
        a: 'Short polling (repeated GETs), long polling (the server holds the request until data arrives), and Server-Sent Events (a one-way server-to-client stream over HTTP). Webhooks cover server-to-server notifications.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — CashFree SDET role interview', url: LC_CASHFREE, year: 2022 },
  },
  {
    id: 'co-api-eq-technologic-1',
    company: 'eQ Technologic',
    area: 'api',
    role: 'QA Engineer',
    round: 'Round 2: Technical interview',
    difficulty: 'easy',
    question: 'Break down a URL such as http://vishal.com/books/book?categories=novel — what is each part?',
    answer: `    http://vishal.com/books/book?categories=novel
    \\__/   \\________/\\_________/ \\______________/
    scheme   host       path        query string

- **Scheme / protocol**: \`http\`, i.e. how to talk to the server. Here it is unencrypted. \`https\` would use TLS, and the default port is 80 for http and 443 for https.
- **Host / domain**: \`vishal.com\`. DNS resolves it to an IP address. An explicit port could follow (\`:8080\`).
- **Path**: \`/books/book\`, which identifies the resource on the server (in REST, the collection or item).
- **Query string**: starts after \`?\`. \`categories=novel\` is a **key=value parameter** that filters or modifies the request. More parameters are joined with \`&\`, and special characters are percent-encoded (space → \`%20\`).
- Not present here: a **fragment** (\`#section\`), which stays in the browser and is never sent to the server.

As a tester I would try: an unknown category (empty list, or 400?), an empty value, repeated keys, encoded and special characters, very long values, injection strings, case sensitivity, and whether the http version redirects to https.`,
    followUps: [
      {
        q: 'What is the difference between a path parameter and a query parameter?',
        a: 'A path parameter identifies a specific resource (/books/42). A query parameter filters, sorts or paginates (/books?category=novel&page=2) and is usually optional.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — eQ Technologic on-campus 2023, QA Engineer', url: LC_EQ, year: 2023 },
  },
  {
    id: 'co-api-eq-technologic-2',
    company: 'eQ Technologic',
    area: 'api',
    role: 'QA Engineer',
    round: 'Round 2: Technical interview',
    difficulty: 'easy',
    question: 'What is HTTP? (Explain the protocol itself, not just how it differs from HTTPS.)',
    answer: `**HTTP (HyperText Transfer Protocol)** is the application-layer protocol browsers and API clients use to talk to web servers. It is:

- **Request/response**: the client sends a request, the server sends back exactly one response.
- **Stateless**: each request stands alone. State is added with cookies, sessions or tokens.
- **Text-based messages** (HTTP/1.1) over TCP. HTTP/2 adds binary framing and multiplexing, and HTTP/3 runs over QUIC/UDP.

A request has a **method** (GET, POST, PUT, PATCH, DELETE…), a **URL/path**, **headers** (Host, Content-Type, Authorization, Cookie) and an optional **body**:

    POST /api/login HTTP/1.1
    Host: example.com
    Content-Type: application/json

    {"user":"qa","pass":"..."}

A response has a **status code** (200, 404, 500…), **headers** (Content-Type, Set-Cookie, Cache-Control) and a **body** (HTML, JSON, files).

In DevTools → Network you can inspect every one of these fields, which is the first place to look when a page or API call fails.`,
    followUps: [
      {
        q: 'If a URL loads a blank page, what would you check?',
        a: 'Check the Network tab for the status code and failed JS/CSS requests, the Console for JavaScript errors, the response body and Content-Type, redirects, CORS or CSP errors, and whether the API calls that render the page returned data.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — eQ Technologic on-campus 2023, QA Engineer', url: LC_EQ, year: 2023 },
  },
  {
    id: 'co-api-zepto-1',
    company: 'Zepto',
    area: 'api',
    role: 'SDET2',
    round: 'First round (bar-raiser)',
    difficulty: 'medium',
    question: 'Using RestAssured, write code that calls an API, verifies the status code and extracts a value from the JSON response body.',
    answer: `RestAssured (Java) with given / when / then:

    Response res = given()
            .baseUri("https://api.example.com")
            .header("Authorization", "Bearer " + token)
            .queryParam("city", "Mumbai")
        .when()
            .get("/v1/stores")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("stores.size()", greaterThan(0))
            .extract().response();

    String firstStoreId = res.jsonPath().getString("stores[0].id");
    int total = res.path("total");

Key points:
- \`statusCode(200)\` fails the test with a clear message on any other code.
- \`body("path", matcher)\` uses **GPath** (JSONPath-like) with Hamcrest matchers.
- \`extract()\` gives you the value so you can **chain** it into the next request (e.g. \`GET /v1/stores/{id}\`).

The same in Playwright (JS/TS):

    const res = await request.get('/v1/stores', { params: { city: 'Mumbai' } });
    expect(res.status()).toBe(200);
    const { stores } = await res.json();
    const firstStoreId = stores[0].id;`,
    followUps: [
      {
        q: 'How would you validate the whole response structure rather than single fields?',
        a: 'Use JSON schema validation, e.g. RestAssured body(matchesJsonSchemaInClasspath("stores.json")) or Ajv in JS. It checks every required field, type and format in one assertion and catches contract drift.',
      },
    ],
    topic: 'api-http',
    source: { name: 'LeetCode Discuss — ZEPTO | SDET2 | Interview Experience', url: LC_ZEPTO, year: 2024 },
  },
  {
    id: 'co-api-grey-orange-1',
    company: 'Grey Orange',
    area: 'api',
    role: 'SDET',
    round: 'Round 2',
    difficulty: 'medium',
    question: 'Write code that makes a GET call and a POST call to an API and checks the responses.',
    answer: `In JavaScript (Node 18+ has a built-in \`fetch\`):

    const BASE = 'https://api.example.com';

    // GET
    const getRes = await fetch(BASE + '/users/1', { headers: { Accept: 'application/json' } });
    if (getRes.status !== 200) throw new Error('GET failed: ' + getRes.status);
    const user = await getRes.json();
    console.assert(user.id === 1, 'wrong user');

    // POST
    const postRes = await fetch(BASE + '/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Asha', job: 'QA' }),
    });
    if (postRes.status !== 201) throw new Error('POST failed: ' + postRes.status);
    const created = await postRes.json();
    console.assert(created.name === 'Asha' && created.id, 'bad body');

Points to mention:
- GET has no body. POST sends JSON with a \`Content-Type\` header and should return **201** (and often a \`Location\` header).
- \`fetch\` does **not** reject on 4xx/5xx, so check \`res.status\` / \`res.ok\` yourself.
- These calls are asynchronous, which is why we \`await\` them.
- In a real framework I would use Playwright's \`request\` fixture or RestAssured, with a base URL, auth and assertions from the test runner.`,
    followUps: [
      {
        q: 'Why does fetch not throw on a 404 or 500 response?',
        a: 'fetch only rejects on network failures (DNS, connection refused, CORS, abort). Any HTTP response, including 4xx or 5xx, is a successful round trip, so the caller must check response.ok or response.status.',
      },
    ],
    topic: 'api-http',
    source: { name: 'GeeksforGeeks — Grey Orange interview experience for SDET (on-campus)', url: GFG_GREY_ORANGE, year: 2023 },
  },
];
