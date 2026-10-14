import type { Topic } from '../../types';

const topic: Topic = {
  id: 'api-http',
  phase: 'api-sql',
  order: 1,
  title: 'HTTP & REST API Fundamentals for Testers',
  subtitle:
    'How clients talk to servers: methods, status codes, headers, params, JSON, JSON Schema, authentication, cookies, and a repeatable way to design positive, negative and security tests for any endpoint.',
  estimatedMinutes: 90,
  sources: [
    'MDN Web Docs — HTTP request methods (safe / idempotent / cacheable table)',
    'MDN Web Docs — HTTP response status codes; HTTP headers; HTTP cookies',
    'RFC 9110 — HTTP Semantics (sections 9 Methods, 15 Status Codes)',
    'RFC 6585 — Additional HTTP Status Codes (429 Too Many Requests)',
    'RFC 7519 — JSON Web Token (JWT)',
    'json-schema.org — Getting started / Understanding JSON Schema',
    'OWASP API Security Top 10 — 2023 edition',
    'Restful Booker API docs — restful-booker.herokuapp.com/apidoc',
    'Software Testing Help — API Testing Interview Questions',
    'Indeed Career Guide — API Testing Interview Questions (with sample answers)',
    'Testleaf blog — API Testing Interview Questions 2025',
  ],
  tags: ['http', 'rest', 'api-testing', 'status-codes', 'idempotency', 'headers', 'json-schema', 'auth', 'jwt', 'owasp-api'],
  cheatSheet: [
    'Request = method + URL (path + query) + headers + optional body; response = status line + headers + optional body. Test all three parts of the response, not just the status.',
    'Safe = no state change (GET, HEAD, OPTIONS). Idempotent = repeating gives the same server state (GET, PUT, DELETE + safe ones). POST and PATCH are neither safe nor guaranteed idempotent.',
    'PUT replaces the whole resource (send every field); PATCH changes only the fields you send; POST creates (or triggers an action) and usually returns 201 + Location.',
    '2xx success (200 OK, 201 Created, 204 No Content) · 3xx redirect (301, 302, 304) · 4xx client fault (400, 401, 403, 404, 405, 409, 415, 422, 429) · 5xx server fault (500, 502, 503, 504).',
    '401 = "who are you?" (missing/invalid/expired credentials); 403 = "I know you, but no" (authenticated, not permitted). A 500 for bad user input is always a bug.',
    'Path param identifies a resource (/booking/42); query param filters/sorts/pages a collection (/booking?firstname=Sally). An empty filter result is 200 + [], not 404.',
    'Headers testers check: Content-Type (what the body is), Accept (what the client wants), Authorization, Location (after 201), Retry-After (429/503), Cache-Control, Set-Cookie flags (HttpOnly, Secure, SameSite).',
    'JSON Schema validates the shape: type, required, properties, additionalProperties: false, enum, format, minimum. It catches renamed/missing/extra fields that value checks miss.',
    'Auth types: Basic (base64 user:pass, not encryption), API key (header), Bearer token / JWT (header.payload.signature, base64url, readable by anyone), OAuth 2.0 (delegated access, scopes).',
    'Negative tests: missing/extra/wrong-type fields, boundaries, invalid JSON, wrong Content-Type, wrong method (405), no/expired/other-user token, non-existent ids, duplicates (409), huge payloads, rate limits (429).',
    'OWASP API #1 is BOLA: user A reading /orders/{id} of user B. Always test object ids with a second user\'s token.',
    'REST = resources + HTTP verbs + JSON; SOAP = XML envelope + WSDL contract, usually POST; GraphQL = one endpoint, client picks fields, errors often arrive with HTTP 200.',
  ],
  sections: [
    {
      heading: 'Client, server and REST in one picture',
      body: `**Intuition:** a restaurant. You (the **client**) never walk into the kitchen. You give the waiter an order in an agreed format, the kitchen (the **server**) prepares it, and the waiter brings back a plate plus a short note ("served", "sold out", "you're not on the guest list"). An **API** is that menu-and-waiter contract.

**Precisely:** a web API is a set of URLs a program can call over **HTTP**. The client sends a *request*; the server returns a *response*. HTTP is **stateless**: every request must carry everything the server needs (credentials, ids, data). The server does not "remember" the previous request unless you send a cookie or token.

**REST** (Representational State Transfer, Roy Fielding, 2000) is a *style* for designing such APIs:

| REST idea | What it means | Restful Booker example |
|---|---|---|
| Resources have URLs | Nouns, not verbs | \`/booking\`, \`/booking/42\` |
| HTTP methods are the verbs | GET reads, POST creates, PUT/PATCH update, DELETE removes | \`DELETE /booking/42\` |
| Representations | The same resource can be sent as JSON or XML | \`Accept: application/json\` |
| Stateless | Each call carries its own auth | \`Cookie: token=...\` on every PUT |
| Uniform status codes | Outcome is in the status line | \`404\` when booking 42 is gone |

**Why testers care:** UI tests go through many layers; an API test talks to the business logic directly. That makes API tests **faster, less flaky and earlier** (you can test before the UI exists). In the test pyramid, API/integration tests sit in the middle and usually outnumber UI tests.

**In interviews, say this:** "An API is a contract between client and server. I test that the contract holds: the right status, headers, body shape and values, the right side-effects in the system, and correct failures for bad input and bad users."`,
      diagram: `  CLIENT (browser, mobile app, Postman, Playwright)
    |
    |  request:  PUT /booking/42  + headers + JSON body
    v
 +--------------------- network (HTTPS) ---------------------+
    |
    v
  SERVER: router -> auth check -> validation -> logic -> DB
    |
    |  response: 200 OK + headers + JSON body
    v
  CLIENT checks: status? headers? body shape? values? state?`,
      keyPoints: [
        'HTTP is stateless: auth travels with every request.',
        'REST = resources (nouns) + HTTP methods (verbs) + status codes.',
        'API tests are faster and less brittle than UI tests and can start before the UI exists.',
      ],
      source: 'Roy Fielding — Architectural Styles (REST dissertation, Ch 5); MDN — An overview of HTTP',
    },
    {
      heading: 'Anatomy of a request and a response',
      body: `**Intuition:** a parcel. The **address** (method + URL) says where and what to do, the **label** (headers) says how to handle it, and the **contents** (body) is the actual data.

A request has four parts:

1. **Method**: GET, POST, PUT, PATCH, DELETE…
2. **URL**: scheme + host + path + optional query string, e.g. \`https://restful-booker.herokuapp.com/booking?firstname=Sally\`.
3. **Headers**: key-value metadata (\`Content-Type\`, \`Accept\`, \`Authorization\`).
4. **Body** (optional): usually JSON for POST/PUT/PATCH; GET normally has none.

A response has three parts: **status line** (version + code + reason), **headers**, and an optional **body**.

Below is a real exchange with Restful Booker. Notice the quirk: this API returns **200** for a create, while most REST APIs return **201 Created** with a \`Location\` header. Spotting deviations like this, and asking whether they are intentional, is exactly what an API tester does.

**Common mistake:** checking only \`status === 200\`. A response can be 200 and still carry the wrong data, the wrong \`Content-Type\`, or leak an internal field.`,
      code: [
        {
          language: 'http',
          title: 'Create a booking (request)',
          code: `POST /booking HTTP/1.1
Host: restful-booker.herokuapp.com
Content-Type: application/json
Accept: application/json

{
  "firstname": "Sally",
  "lastname": "Brown",
  "totalprice": 111,
  "depositpaid": true,
  "bookingdates": { "checkin": "2026-01-01", "checkout": "2026-01-05" },
  "additionalneeds": "Breakfast"
}`,
        },
        {
          language: 'http',
          title: 'Response (what to verify, line by line)',
          code: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 195
Date: Wed, 14 Oct 2026 09:30:00 GMT

{
  "bookingid": 1093,
  "booking": {
    "firstname": "Sally",
    "lastname": "Brown",
    "totalprice": 111,
    "depositpaid": true,
    "bookingdates": { "checkin": "2026-01-01", "checkout": "2026-01-05" },
    "additionalneeds": "Breakfast"
  }
}`,
        },
      ],
      keyPoints: [
        'Verify status, headers, body shape, body values, and the side-effect (GET it back).',
        'Content-Type describes the body being sent; Accept describes what the client wants back.',
        'Note API quirks (200 instead of 201) and ask whether the contract says so.',
      ],
      source: 'MDN — HTTP messages; Restful Booker API docs (CreateBooking)',
    },
    {
      heading: 'HTTP methods: safe, idempotent and what each one should do',
      body: `**Intuition:** pressing a lift button five times still calls the lift once (idempotent). Ordering a pizza five times gets you five pizzas (not idempotent). Reading the menu changes nothing at all (safe).

**Definitions (RFC 9110):**
- **Safe**: the client is not asking for any state change. GET, HEAD, OPTIONS, TRACE.
- **Idempotent**: sending the same request once or N times leaves the server in the **same state**. All safe methods plus **PUT** and **DELETE**. The *response* may differ (the second DELETE may return 404), but the state does not.
- **POST** and **PATCH** are **not guaranteed** idempotent. Two identical POSTs normally create two records.

| Method | Purpose | Safe | Idempotent | Typical success | Typical tester checks |
|---|---|---|---|---|---|
| GET | Read a resource or a list | Yes | Yes | 200 | Data matches DB; filters, paging, sorting; 404 for missing id |
| POST | Create / trigger an action | No | No | 201 + Location (Restful Booker: 200) | Required fields, duplicates (409), ids are new, retries don't double-charge |
| PUT | Replace the whole resource | No | Yes | 200 or 204 | Missing fields are rejected or nulled (per contract); same PUT twice = same state |
| PATCH | Change some fields | No | No (often is in practice) | 200 or 204 | Only sent fields change; others untouched |
| DELETE | Remove | No | Yes | 204 or 200 (Restful Booker: 201) | Later GET returns 404; second DELETE does not error with 500 |
| HEAD | Headers of a GET, no body | Yes | Yes | 200 | Same headers as GET |
| OPTIONS | What methods are allowed (also CORS preflight) | Yes | Yes | 204 / 200 | \`Allow\` header lists methods |

**Why idempotency matters to testers:** networks fail. Clients and gateways *retry*. Retrying an idempotent call is harmless; retrying a POST payment can charge twice. That is why payment APIs accept an \`Idempotency-Key\` header: the server remembers the key and returns the first result for duplicates.

**Common mistake:** "PATCH is idempotent like PUT." Setting \`totalprice\` to 150 is idempotent; a PATCH that says "add 10 to totalprice" (or JSON Patch \`add\` to an array) is not. Answer "not guaranteed, depends on the operation".

**Wrong method test:** sending \`DELETE /booking\` (the collection) should give **405 Method Not Allowed** with an \`Allow\` header, never 500.`,
      code: [
        {
          language: 'http',
          title: 'PUT replaces, PATCH changes part (Restful Booker)',
          code: `### PUT: every field must be sent, the resource is replaced
PUT /booking/1093 HTTP/1.1
Host: restful-booker.herokuapp.com
Content-Type: application/json
Accept: application/json
Cookie: token=abc123

{ "firstname": "Sally", "lastname": "Brown", "totalprice": 150,
  "depositpaid": true,
  "bookingdates": { "checkin": "2026-01-01", "checkout": "2026-01-05" },
  "additionalneeds": "Breakfast" }

### PATCH: only the fields you send are changed
PATCH /booking/1093 HTTP/1.1
Host: restful-booker.herokuapp.com
Content-Type: application/json
Accept: application/json
Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=

{ "totalprice": 175 }`,
        },
      ],
      keyPoints: [
        'Safe ⊂ idempotent: every safe method is idempotent, not vice versa.',
        'Idempotency is about server state, not the response body/status.',
        'Retries of POST need an Idempotency-Key (or equivalent) to be safe.',
      ],
      source: 'RFC 9110 §9.2 Common Method Properties; MDN — HTTP request methods',
    },
    {
      heading: 'Status codes: the five families and the ones that matter',
      body: `**Intuition:** the status code is the waiter's one-word summary. The first digit tells you *whose fault* it is: **4xx = the client's**, **5xx = the server's**.

| Code | Name | Use it when… | Example test |
|---|---|---|---|
| 200 | OK | Successful GET/PUT/PATCH with a body | GET /booking/1093 |
| 201 | Created | POST created a resource; send \`Location\` | POST /users |
| 204 | No Content | Success, nothing to return | DELETE /users/7 |
| 301 / 302 | Moved / Found | Redirects | Old URL → new URL |
| 304 | Not Modified | Client cache still valid (\`If-None-Match\`) | GET with ETag |
| 400 | Bad Request | Malformed JSON, wrong types, failed validation | \`"totalprice": "abc"\` |
| 401 | Unauthorized | No / invalid / expired credentials | Missing token |
| 403 | Forbidden | Authenticated but not allowed | Viewer tries DELETE |
| 404 | Not Found | Resource doesn't exist (or hidden on purpose) | GET /booking/999999 |
| 405 | Method Not Allowed | Method not supported on this URL | DELETE /booking |
| 409 | Conflict | Duplicate / state conflict | Register an existing email |
| 415 | Unsupported Media Type | Body format not accepted | \`Content-Type: text/plain\` |
| 422 | Unprocessable Content | Syntax fine, business rule fails | checkout before checkin |
| 429 | Too Many Requests | Rate limit hit; send \`Retry-After\` | 101st call in a minute |
| 500 | Internal Server Error | Unhandled exception: **always a bug** | Missing field crashes server |
| 502 / 503 / 504 | Bad Gateway / Unavailable / Gateway Timeout | Upstream broken, overloaded, or slow | Dependency down |

**400 vs 422:** both are acceptable for validation errors; teams pick one. What matters is **consistency** and a helpful error body (which field, why).

**Restful Booker quirks worth knowing** (it is a practice API, deliberately imperfect): create returns 200, DELETE returns 201, a PUT without a token returns 403 rather than 401, and \`POST /auth\` with wrong credentials returns **200** with \`{"reason": "Bad credentials"}\`. In a real product you would raise each of these as a contract question or bug.

**In interviews, say this:** "A 4xx is the API correctly rejecting bad input; a 5xx caused by my input is a defect, because the server should have validated and returned a 4xx."`,
      diagram: `   1xx  informational   (100 Continue, 101 Switching Protocols)
   2xx  it worked       200 OK | 201 Created | 204 No Content
   3xx  go elsewhere    301 | 302 | 304 Not Modified
   4xx  YOU got it wrong 400 | 401 | 403 | 404 | 405 | 409 | 422 | 429
   5xx  WE got it wrong  500 | 502 | 503 | 504`,
      keyPoints: [
        '4xx = client fault, 5xx = server fault; a 5xx from bad input is a bug.',
        '201 should come with a Location header; 204 must have no body.',
        'Empty search results = 200 with [], not 404.',
        'A 200 with an error message in the body breaks clients and monitoring.',
      ],
      source: 'RFC 9110 §15 Status Codes; RFC 6585 §4 (429); MDN — HTTP response status codes',
    },
    {
      heading: 'Headers testers actually check',
      body: `**Intuition:** headers are the label on the parcel: "fragile", "this way up", "signature required". The server and client both read them before touching the contents.

| Header | Direction | What to test |
|---|---|---|
| \`Content-Type\` | both | Response says \`application/json\` when the body is JSON; sending \`text/plain\` to a JSON endpoint → 415 or 400, not 500 |
| \`Accept\` | request | Asking for \`application/xml\` returns XML (if supported) or 406 |
| \`Authorization\` | request | \`Basic …\`, \`Bearer …\`; missing/garbled → 401 |
| \`Location\` | response | Present after 201 and points to the new resource |
| \`Retry-After\` | response | Present on 429 / 503 so clients know when to retry |
| \`Cache-Control\` / \`ETag\` | response | Private data marked \`no-store\`; ETag changes when data changes |
| \`Set-Cookie\` | response | Session cookies have \`HttpOnly\`, \`Secure\`, sensible \`SameSite\` |
| \`Access-Control-Allow-Origin\` | response | CORS: not \`*\` for authenticated APIs |
| \`X-Request-Id\` / \`traceparent\` | both | Present so you can attach it to a bug and devs can find the log |
| \`Server\`, \`X-Powered-By\` | response | Should not leak exact framework versions |

**Worked example: a security-minded header check on a login response.** The cookie below is fine: \`HttpOnly\` stops JavaScript (and XSS) from reading it, \`Secure\` keeps it on HTTPS, \`SameSite=Lax\` reduces CSRF risk. The \`X-Powered-By\` header is a minor finding (information disclosure).

**Tip:** header names are **case-insensitive** (\`content-type\` = \`Content-Type\`). Assertions should not fail because of capitalisation.`,
      code: [
        {
          language: 'http',
          title: 'Reading a response like a tester',
          code: `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/users/8812
Set-Cookie: sid=9f2c...; Path=/; HttpOnly; Secure; SameSite=Lax
Cache-Control: no-store
X-Request-Id: 4b7d1e0a-62c1-4c4e-9d0b-0c6f5a0f2e11
X-Powered-By: Express 4.17.1

{ "id": 8812, "email": "asha@example.com", "role": "viewer" }

# Checks:
# 1. 201 + Location points at /api/users/8812         -> OK
# 2. Content-Type is JSON and body parses             -> OK
# 3. Cookie has HttpOnly + Secure + SameSite          -> OK
# 4. No password / passwordHash in the body           -> OK
# 5. X-Powered-By leaks framework + version           -> raise (low)`,
        },
      ],
      keyPoints: [
        'Content-Type = what this body is; Accept = what I want back.',
        'Location after 201, Retry-After after 429/503.',
        'Cookie flags HttpOnly/Secure/SameSite are a quick security win.',
        'Header names are case-insensitive.',
      ],
      source: 'MDN — HTTP headers reference; MDN — Using HTTP cookies',
    },
    {
      heading: 'Path params, query params and request bodies',
      body: `**Intuition:** the **path** is the house address (which thing), the **query** is "show me only the red ones, sorted by price" (how to filter a list), and the **body** is the parcel you are delivering.

| Part | Example | Used for | Tester's negative ideas |
|---|---|---|---|
| Path param | \`/booking/1093\` | Identify **one** resource | Non-existent id, id of another user, \`0\`, \`-1\`, \`abc\`, very long id |
| Query param | \`/booking?firstname=Sally&checkin=2026-01-01\` | Filter, sort, page, search | Unknown param ignored?, wrong date format, empty value, SQL/script characters, \`page=-1\`, \`limit=100000\` |
| Body | JSON object | Data to create/update | Missing / extra / null fields, wrong types, boundaries, invalid JSON |
| Header | \`Authorization\`, \`Accept\` | Metadata, auth | Missing, malformed, other user's token |

**Rules worth knowing:**
- A filter that matches nothing returns **200 with an empty list**. A missing *path* resource returns **404**.
- Query values must be **URL-encoded**: a space is \`%20\` (or \`+\` in forms), \`&\` inside a value is \`%26\`. A name like "O'Brien & Sons" is a good encoding test.
- **Do not put secrets in query strings**: URLs end up in server logs, browser history and proxies.
- Pagination: check first page, last page, page beyond the end, page size limits, and that items do not repeat or vanish between pages.

**Worked example (Restful Booker):** \`GET /booking?firstname=Sally&lastname=Brown\` returns \`[{"bookingid": 1093}, …]\`. Your checks: every returned id, fetched with \`GET /booking/:id\`, really has firstname Sally; a name that doesn't exist returns \`[]\` with 200; a bad date like \`checkin=31-12-2026\` is either rejected with 400 or ignored, **consistently and as documented**.`,
      code: [
        {
          language: 'http',
          title: 'Path vs query in practice',
          code: `### Path parameter: ONE booking
GET /booking/1093 HTTP/1.1
Host: restful-booker.herokuapp.com
Accept: application/json

### Query parameters: FILTER the list
GET /booking?firstname=Sally&lastname=Brown HTTP/1.1
Host: restful-booker.herokuapp.com

### Encoded query value (space and ampersand)
GET /booking?lastname=O%27Brien%20%26%20Sons HTTP/1.1
Host: restful-booker.herokuapp.com

### Expected:
# 1st -> 200 + one booking object
# 2nd -> 200 + [ { "bookingid": ... }, ... ] or [] if no match
# 3rd -> 200 + [] (no such name) and definitely not 500`,
        },
      ],
      keyPoints: [
        'Path identifies, query filters; no match on a filter is 200 + [].',
        'Encode query values; test special characters.',
        'Secrets never go in the URL.',
      ],
      source: 'MDN — What is a URL; Restful Booker API docs (GetBookingIds)',
    },
    {
      heading: 'JSON and JSON Schema validation',
      body: `**Intuition:** checking values is like checking that the pizza has cheese. Checking the **schema** is checking that it is a pizza at all: round, has a base, has toppings, no shoe inside.

**JSON in 30 seconds:** objects \`{}\`, arrays \`[]\`, strings in **double quotes**, numbers, \`true\`/\`false\`, \`null\`. No comments, no trailing commas, no single quotes. \`"111"\` (string) is not \`111\` (number), a classic contract bug.

**JSON Schema** is a JSON document that describes the allowed shape of another JSON document. Key keywords:

| Keyword | Meaning |
|---|---|
| \`type\` | object, array, string, number, integer, boolean, null |
| \`properties\` | Schemas for each named field |
| \`required\` | Fields that must be present |
| \`additionalProperties: false\` | Reject unknown fields (catches leaks like \`passwordHash\`) |
| \`enum\` | Allowed values, e.g. \`["PENDING", "PAID"]\` |
| \`minimum\` / \`maximum\`, \`minLength\` / \`maxLength\` | Ranges |
| \`format\` | \`date\`, \`email\`, \`uuid\` (validators may need format support switched on) |
| \`items\` | Schema for each array element |

**Why use it:** one schema assertion catches a renamed field, a type change, a missing field or an extra field in **every** response, which ten individual value assertions might miss. It is also the base of **contract testing** (the provider promises a schema; consumers rely on it).

**Common mistake:** a schema with no \`required\` list passes an **empty object** \`{}\`. Properties are optional by default.`,
      code: [
        {
          language: 'json',
          title: 'Schema for GET /booking/:id (Restful Booker)',
          code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["firstname", "lastname", "totalprice", "depositpaid", "bookingdates"],
  "additionalProperties": false,
  "properties": {
    "firstname":   { "type": "string", "minLength": 1 },
    "lastname":    { "type": "string", "minLength": 1 },
    "totalprice":  { "type": "integer", "minimum": 0 },
    "depositpaid": { "type": "boolean" },
    "bookingdates": {
      "type": "object",
      "required": ["checkin", "checkout"],
      "additionalProperties": false,
      "properties": {
        "checkin":  { "type": "string", "format": "date" },
        "checkout": { "type": "string", "format": "date" }
      }
    },
    "additionalneeds": { "type": "string" }
  }
}`,
        },
      ],
      keyPoints: [
        'Properties are optional unless listed in required.',
        'additionalProperties: false catches unexpected or leaked fields.',
        'Schema checks shape; you still need value checks for business rules.',
      ],
      source: 'json-schema.org — Understanding JSON Schema (object, required, additionalProperties)',
    },
    {
      heading: 'Authentication and authorization: Basic, API key, Bearer/JWT, OAuth 2.0',
      body: `**Intuition:** **authentication** is the security guard checking your ID at the door (*who are you?*). **Authorization** is the guard checking whether your badge opens *this* room (*what may you do?*).

| Scheme | How it travels | Tester notes |
|---|---|---|
| **Basic** | \`Authorization: Basic base64(user:pass)\` | Base64 is **encoding, not encryption**; only safe over HTTPS. Restful Booker accepts \`admin:password123\` this way |
| **API key** | Header such as \`x-api-key: …\` (avoid query string) | Identifies an app, not a user; test revoked/rotated keys |
| **Session cookie** | \`Cookie: sid=…\` set after login | Restful Booker uses \`Cookie: token=…\` from \`POST /auth\` |
| **Bearer token / JWT** | \`Authorization: Bearer eyJ…\` | Test expired, tampered, wrong-audience, missing tokens |
| **OAuth 2.0** | Client gets an access token from an auth server (authorization code + PKCE, client credentials) | Test scopes: a \`read\`-only token must not write |

**401 vs 403:**
- **401 Unauthorized** really means *unauthenticated*: no token, a bad token, an expired token. The server should send \`WWW-Authenticate\`.
- **403 Forbidden**: the token is valid, but this user/role may not do this.
- Some APIs return **404** instead of 403 for other people's objects so they don't reveal that the object exists. That's acceptable if it's consistent.

**JWT anatomy:** \`header.payload.signature\`, each part **base64url**-encoded. The payload (claims like \`sub\`, \`role\`, \`exp\`) is **readable by anyone**; the signature only proves it wasn't changed. So: never put secrets in a JWT, and test that a modified payload, an \`alg: none\` token, or an expired \`exp\` gets **401**.`,
      code: [
        {
          language: 'javascript',
          title: 'Decode a JWT payload in Node (no secret needed: that is the point)',
          code: `// A JWT is three base64url parts joined by dots.
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiI0MiIsInJvbGUiOiJ2aWV3ZXIiLCJleHAiOjE4MDAwMDAwMDB9' +
  '.c2lnbmF0dXJl';

const [header, payload] = token.split('.');

// base64url -> text -> object (Node 16+ supports 'base64url')
const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

console.log(decode(header));
// → { alg: 'HS256', typ: 'JWT' }
console.log(decode(payload));
// → { sub: '42', role: 'viewer', exp: 1800000000 }

// exp is seconds since 1970; compare with "now"
const expired = decode(payload).exp * 1000 < Date.now();
console.log(expired); // → false (until 2027-01-15)

// Test idea: change "viewer" to "admin" in the payload, keep the old
// signature, send it -> the server MUST answer 401, never 200.`,
        },
        {
          language: 'http',
          title: 'Get a Restful Booker token, then use it',
          code: `POST /auth HTTP/1.1
Host: restful-booker.herokuapp.com
Content-Type: application/json

{ "username": "admin", "password": "password123" }

### -> 200 { "token": "abc123" }

DELETE /booking/1093 HTTP/1.1
Host: restful-booker.herokuapp.com
Cookie: token=abc123

### -> 201 Created (Restful Booker's choice; most APIs use 204)`,
        },
      ],
      keyPoints: [
        'Authentication = who you are (401); authorization = what you may do (403).',
        'Basic and JWT payloads are encoded, not encrypted.',
        'Test tokens that are missing, malformed, expired, tampered, and belong to another user.',
      ],
      source: 'RFC 9110 §15.5.2 (401) & §15.5.4 (403); RFC 7519 JWT; Restful Booker API docs (CreateToken, UpdateBooking)',
    },
    {
      heading: 'Cookies, sessions and tokens',
      body: `**Intuition:** a **session cookie** is a cloakroom ticket: the server keeps your coat (session data) and gives you a numbered ticket. A **token like a JWT** is more like a signed passport: everything is written on it, and the server just checks the signature.

| | Server-side session + cookie | Stateless token (JWT) |
|---|---|---|
| Where state lives | Server (memory/Redis/DB) | Inside the token |
| How client sends it | Browser auto-sends \`Cookie\` | Client adds \`Authorization: Bearer\` |
| Logout | Delete server session: instant | Token valid until \`exp\` unless a deny-list exists |
| Main risks | CSRF (cookie auto-sent), session fixation | Token theft via XSS if stored in localStorage; long expiry |

**What to test:**
1. After **logout**, replay the old cookie/token: it must be rejected (401). This bug is common with JWTs.
2. After **password change**, old sessions should be invalidated (per policy).
3. **Session timeout**: idle for the configured time, then call the API → 401.
4. A new session id is issued after login (prevents session fixation).
5. Cookie flags: \`HttpOnly\`, \`Secure\`, \`SameSite\`, sensible \`Expires/Max-Age\`.
6. Two browsers / two devices: does one logout affect the other, as specified?

**In interviews, say this:** "Cookies are a transport; sessions and JWTs are strategies. I test the lifecycle: issue, use, expire, revoke, and replay after revoke."`,
      code: [
        {
          language: 'http',
          title: 'Replay-after-logout test',
          code: `### 1. Login: server sets a session cookie
POST /api/login HTTP/1.1
Content-Type: application/json

{ "email": "asha@example.com", "password": "S3cure!pass" }

### <- 200, Set-Cookie: sid=7a1f...; HttpOnly; Secure; SameSite=Lax

### 2. Logout
POST /api/logout HTTP/1.1
Cookie: sid=7a1f...

### <- 204 No Content

### 3. Replay the OLD cookie
GET /api/profile HTTP/1.1
Cookie: sid=7a1f...

### Expected: 401 Unauthorized
### Bug if:   200 with the profile (session not invalidated)`,
        },
      ],
      keyPoints: [
        'Test the whole lifecycle: issue, use, expire, revoke, replay.',
        'JWT logout needs a deny-list or short expiry; test the replay.',
        'Session id should change after login.',
      ],
      source: 'MDN — Using HTTP cookies; OWASP Session Management Cheat Sheet',
    },
    {
      heading: 'REST vs SOAP vs GraphQL (what changes for the tester)',
      body: `**Intuition:** REST is a menu with many dishes at fixed counters; **SOAP** is a formal written order form in triplicate; **GraphQL** is one counter where you write exactly which ingredients you want.

| | REST | SOAP | GraphQL |
|---|---|---|---|
| Endpoints | Many URLs (\`/booking/1\`) | One URL per service | Usually one URL (\`/graphql\`) |
| Format | Usually JSON | XML envelope only | JSON |
| Contract | OpenAPI (optional) | WSDL (strict) | Schema (SDL, introspection) |
| Methods | GET/POST/PUT/PATCH/DELETE | Almost always POST | POST (queries sometimes GET) |
| Errors | HTTP status codes | \`<soap:Fault>\` (often HTTP 500) | \`errors\` array, **often with HTTP 200** |
| Typical tools | Postman, Playwright request, REST Assured | SoapUI, Postman | Postman, Insomnia, Playwright |

**What changes in your tests:**
- **SOAP:** validate XML against the WSDL/XSD; check \`Fault\` codes and messages; XPath assertions.
- **GraphQL:** don't rely on the status code. Assert the \`errors\` array is absent and \`data\` is shaped as asked. Extra GraphQL risks: deeply nested queries (denial of service), introspection enabled in production, and field-level authorization (can a viewer request \`salary\`?).
- **REST:** most of this topic.`,
      code: [
        {
          language: 'json',
          title: 'GraphQL: HTTP 200 but the request failed',
          code: `{
  "data": { "booking": null },
  "errors": [
    {
      "message": "Not authorised to view booking 1093",
      "path": ["booking"],
      "extensions": { "code": "FORBIDDEN" }
    }
  ]
}`,
        },
      ],
      keyPoints: [
        'SOAP = XML + WSDL + Fault; GraphQL = one endpoint, errors array, often HTTP 200.',
        'For GraphQL, assert on errors/data, not only on status.',
      ],
      source: 'graphql.org — Learn: Response format; W3C SOAP 1.2 Part 1 (Fault)',
    },
    {
      heading: 'What to test in an API: a positive, negative and security checklist',
      body: `**Intuition:** treat every endpoint like a form with no UI protecting it. The UI may stop you typing letters into a price box; the API won't, unless the developer wrote validation.

**A repeatable checklist (use it for any endpoint):**

| Area | Checks |
|---|---|
| **Positive / happy path** | Valid request → right status, body, headers; side-effect visible (GET it back, check DB) |
| **Field validation** | Missing required, null, empty string, wrong type, too long, boundaries (0, -1, max), invalid formats (date, email), extra unknown fields |
| **Payload** | Invalid JSON, empty body, wrong \`Content-Type\`, very large body (413) |
| **Resource state** | Non-existent id (404), already deleted, duplicate create (409), concurrent updates |
| **Auth** | No token, expired, tampered, another user's token on your object (BOLA), low-privilege role on admin action (BFLA) |
| **Method & URL** | Wrong method (405), trailing slash, case of path |
| **Business rules** | checkout after checkin, price ≥ 0, cannot cancel a completed order |
| **Non-functional** | Response time within SLA, rate limit (429 + Retry-After), no stack traces or internal fields in errors |

**OWASP API Security Top 10 (2023) for testers, the ones you can test without being a pentester:**

| # | Risk | Simple test |
|---|---|---|
| API1 | Broken Object Level Authorization (BOLA) | User A requests user B's \`/orders/1002\` → must be 403/404 |
| API2 | Broken Authentication | Expired/tampered token accepted? Brute-force not rate-limited? |
| API3 | Broken Object Property Level Authorization | Response exposes \`isAdmin\`; or PATCH \`{"role":"admin"}\` is accepted (mass assignment) |
| API4 | Unrestricted Resource Consumption | \`limit=100000\`, huge uploads, no rate limit |
| API5 | Broken Function Level Authorization | Viewer can call \`DELETE /admin/users/7\` |
| API8 | Security Misconfiguration | Stack traces, verbose errors, \`CORS: *\` on private API |

**Worked example:** the code below is a compact positive/negative plan for \`PUT /booking/:id\`.`,
      code: [
        {
          language: 'text',
          title: 'Test ideas for PUT /booking/:id (Restful Booker)',
          code: `ID   Type      Request                                   Expected
P1   positive  valid token + full valid body               200, body echoes update; GET shows it
P2   positive  Basic auth instead of cookie token          200
P3   idempot.  same PUT twice                              200 both; state identical
N1   auth      no Cookie / no Authorization                401 (RB returns 403: raise it)
N2   auth      token=garbage                               401/403, never 200
N3   resource  id 99999999 (doesn't exist)                 404 (or 405 per RB), never 500
N4   body      totalprice missing                          400, field named in error
N5   body      totalprice = "abc"                          400
N6   body      totalprice = -1                             400/422 (business rule)
N7   body      checkout before checkin                     422/400
N8   body      invalid JSON (trailing comma)               400
N9   header    Content-Type: text/plain                    415/400
N10  security  extra field "isAdmin": true                 ignored, not stored
N11  security  error bodies contain no stack trace         true for every N case`,
        },
      ],
      keyPoints: [
        'Positive, validation, state, auth, method, business rules, non-functional: in that order.',
        'BOLA is the #1 API risk: always try a second user\'s token.',
        'Every negative case must end in a clean 4xx with a helpful message, never a 5xx.',
      ],
      source: 'OWASP API Security Top 10 — 2023; Restful Booker API docs; Software Testing Help — API Testing',
    },
  ],
  codeChallenges: [
    {
      id: 'api-http-cc-1',
      title: 'From a thin checklist to a real test suite for POST /booking',
      context:
        'A teammate wrote the API test checklist below for Restful Booker\'s create-booking endpoint and marked the story "API tested". The lead asks you to review it before sign-off.',
      task: 'Rewrite the checklist into a structured suite with IDs, preconditions, exact request variations, and expected status + body + side-effect. Cover positive, validation, payload, auth/security and non-functional cases.',
      starter: {
        language: 'text',
        title: 'Weak checklist',
        code: `POST /booking tests
- create booking works
- check status 200
- try wrong data
- check response time is ok
- security tested`,
      },
      hints: [
        'Every item should be verifiable by someone else: which input exactly, which status exactly, which fields checked?',
        'Group the cases: happy path, each required field missing, wrong types, boundaries, payload format, headers, security, performance.',
        'A create is not proven until you GET the new resource back and compare.',
      ],
      solution: {
        language: 'text',
        title: 'Structured suite',
        code: `Endpoint: POST https://restful-booker.herokuapp.com/booking
Precondition: API reachable (GET /ping -> 201). Headers unless noted:
Content-Type: application/json, Accept: application/json
Base body B = {firstname:"Sally", lastname:"Brown", totalprice:111,
 depositpaid:true, bookingdates:{checkin:"2026-01-01",
 checkout:"2026-01-05"}, additionalneeds:"Breakfast"}

POSITIVE
P1 Send B -> 200 (RB contract; 201 elsewhere); bookingid is a number;
   booking equals B field by field; Content-Type is JSON
P2 GET /booking/{bookingid} -> 200 and equals B (side-effect proven)
P3 Send B without additionalneeds (optional) -> 200
P4 Send B twice -> two DIFFERENT bookingids (POST not idempotent)
P5 Response matches the booking JSON Schema (required + types)

VALIDATION (expect 400 with a message naming the field; never 500)
V1 each required field missing, one at a time (5 cases)
V2 totalprice "abc" / 12.5 / -1 / 0 / 2147483648
V3 depositpaid "yes" instead of boolean
V4 checkin "31-12-2026" (wrong format); checkout < checkin
V5 firstname "" and 1,000-char string; unicode "Zoë 李"

PAYLOAD / HEADERS
H1 invalid JSON (trailing comma) -> 400
H2 empty body -> 400
H3 Content-Type: text/plain -> 415/400
H4 Accept: application/xml -> XML body (documented) or 406

SECURITY
S1 extra field "bookingid": 1 -> ignored, server assigns its own id
S2 firstname "<script>alert(1)</script>" -> stored as text; not executed
   when viewed in any UI
S3 error responses contain no stack trace / framework versions

NON-FUNCTIONAL
F1 p95 response time < 800 ms over 20 calls (agree SLA first)

Known RB deviations to log as questions: 200 not 201; missing fields
have been seen to return 500 instead of 400.`,
      },
      explanation: `**What changed and why:**
- **Exact inputs and outputs:** "try wrong data" became 15+ concrete variations, each with an expected status and message. Anyone can now execute or automate them.
- **Side-effect check (P2):** a 200 only proves the server *answered*; a GET proves it *stored* the right data.
- **Idempotency (P4):** documents that two POSTs make two bookings, which is the expected REST behaviour and a regression guard.
- **Schema (P5):** catches renamed/missing fields across every case.
- **Security and headers:** mass assignment (S1), stored XSS (S2), information leakage (S3), content negotiation (H3/H4).
- **"Response time ok" → a number:** F1 states an SLA and how it is measured.
- **Known deviations:** recorded as questions rather than silently accepted.`,
      followUps: [
        {
          q: 'Which of these cases would you automate first, and why?',
          a: 'P1, P2 and P5 first: they form the smoke check that the endpoint works and the contract holds, and they run on every build. Next the validation cases V1–V4 as a data-driven test, because they are many near-identical requests where automation pays off quickly. Security cases like S2 need a UI check too, so I would pair them with a UI test later.',
        },
        {
          q: 'The developer says "a 500 for a missing field is fine, the client never sends that". How do you respond?',
          a: 'The API is public to any client, including scripts and attackers, so the UI\'s validation is not a guarantee. A 500 hides the real reason from the caller, pollutes error dashboards and may leak a stack trace. The fix is cheap: validate and return 400 naming the field. I would log it as a bug with medium severity and attach the exact request.',
        },
      ],
    },
    {
      id: 'api-http-cc-2',
      title: 'Tighten a JSON Schema that lets bugs through',
      context:
        'Your team validates the "get user" response with the schema below. Last sprint a release renamed `email` to `emailAddress`, returned `id` as a string, and started exposing `passwordHash`. The schema check stayed green every time.',
      task: 'Rewrite the schema so each of those three regressions would fail the check, and add sensible constraints for role and createdAt.',
      starter: {
        language: 'json',
        title: 'Loose schema',
        code: `{
  "type": "object",
  "properties": {
    "id": {},
    "email": { "type": "string" },
    "role": { "type": "string" },
    "createdAt": { "type": "string" }
  }
}`,
      },
      hints: [
        'Without a required list, a response missing every field still passes.',
        'An empty schema {} for id accepts any type at all.',
        'What keyword rejects fields you did not list?',
      ],
      solution: {
        language: 'json',
        title: 'Strict schema',
        code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "required": ["id", "email", "role", "createdAt"],
  "additionalProperties": false,
  "properties": {
    "id":        { "type": "integer", "minimum": 1 },
    "email":     { "type": "string", "format": "email", "maxLength": 254 },
    "role":      { "type": "string", "enum": ["viewer", "editor", "admin"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "displayName": { "type": ["string", "null"], "maxLength": 100 }
  }
}`,
      },
      explanation: `**Fixes, one per regression:**
- **Renamed field:** \`required\` now lists \`email\`, so a response with \`emailAddress\` but no \`email\` fails. \`additionalProperties: false\` also flags \`emailAddress\` as unknown.
- **Type change:** \`id\` is now \`integer\` with \`minimum: 1\`; \`"42"\` fails.
- **Leaked field:** \`additionalProperties: false\` rejects \`passwordHash\` (and any future surprise field).
- **Extras:** \`role\` is an \`enum\`, so a typo like \`"admn"\` or a new undocumented role is caught; \`createdAt\` uses \`date-time\`; an optional nullable field shows how to allow \`null\` on purpose.
- **Caveat:** \`format\` is only enforced if the validator has format checking enabled. Know your tool.`,
      followUps: [
        {
          q: 'Isn\'t additionalProperties: false too strict? The API may add fields later.',
          a: 'It is a trade-off. For our own API, failing on new fields is useful: a new field should be a conscious contract change, and the schema update is one line. For a third-party API we consume, adding fields is usually non-breaking, so I would allow extras there and only assert on what we use. The key is to decide per contract, not by accident.',
        },
        {
          q: 'Does a passing schema check mean the response is correct?',
          a: 'No. The schema proves the shape: fields exist with the right types and ranges. It cannot prove that id 42 is the right user, that the email matches what was saved, or that the role is correct for this account. I always pair schema validation with value assertions against the request or the database.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'api-http-iq-01',
      difficulty: 'medium',
      question: 'Explain the difference between POST, PUT and PATCH. Which of them are idempotent, and why should a tester care?',
      whatInterviewerLooksFor: [
        'Correct semantics: create vs full replace vs partial update',
        'Precise idempotency definition (same server state, not same response)',
        'Knows PATCH is not guaranteed idempotent',
        'Connects idempotency to retries and duplicate-charge bugs',
      ],
      modelAnswer: `**Semantics**
- **POST** creates a new resource under a collection (or triggers an action). Two identical POSTs normally create two records. Success is usually **201 Created** with a \`Location\` header.
- **PUT** replaces the resource at a known URL with the full representation you send. Missing fields are either rejected or reset, depending on the contract.
- **PATCH** applies a partial change: send only \`{ "totalprice": 175 }\`.

**Idempotency** means sending the same request once or many times leaves the server in the same *state*. PUT and DELETE are idempotent: the second identical PUT changes nothing more, and the second DELETE leaves the resource still deleted (even if it now answers 404). POST is not. PATCH is *not guaranteed*: "set price to 175" is idempotent, but "append item" or "increment by 10" isn't.

**Why a tester cares**
1. **Retries happen**: mobile networks drop, gateways retry. I test that a retried POST payment doesn't charge twice, typically via an \`Idempotency-Key\` header.
2. **Test design:** for PUT I send the same request twice and assert identical state; for POST I assert two distinct ids, plus duplicate detection (409) where the business needs uniqueness.
3. **PUT completeness:** I send a PUT with a field missing and check the contract: is it 400, or is the field nulled?
4. **PATCH isolation:** after patching one field, I GET the resource and verify every *other* field is unchanged.

On Restful Booker, PUT /booking/:id requires every field, while PATCH accepts any subset, so it's a good place to show both.`,
      followUps: [
        {
          q: 'If DELETE is idempotent, why does the second DELETE return 404?',
          a: 'Idempotency is about server state, not the response. After the first DELETE the booking is gone; after the second it is still gone, so the state is the same. The status can differ (204 then 404), and both are acceptable. What would be a bug is a 500 on the second call, or the second call deleting something else.',
        },
        {
          q: 'How would you test that a payment POST is safe to retry?',
          a: 'Send the POST with an Idempotency-Key, simulate a lost response (or just resend the identical request with the same key), and assert the second call returns the original result, not a new charge. Then check the database or payment list shows exactly one charge. Also test the same key with a different body: it should be rejected (often 409 or 422).',
        },
        {
          q: 'Can a GET ever change state?',
          a: 'It shouldn\'t: GET is defined as safe. If a GET like /unsubscribe?id=5 changes data, link prefetchers, crawlers and browser preloading can trigger it by accident. I would raise it as a design bug. Side effects such as logging or view counters are tolerated because they are not the client asking for a change.',
        },
      ],
      pitfalls: [
        'Saying idempotent means "returns the same response every time"',
        'Claiming PATCH is always idempotent',
        'Saying PUT and POST are interchangeable "it\'s just convention"',
      ],
    },
    {
      id: 'api-http-iq-02',
      difficulty: 'medium',
      question: 'What is the difference between 401 and 403? Give one test case for each on a real API.',
      whatInterviewerLooksFor: [
        'Authentication vs authorization distinction',
        'Concrete test cases with setup',
        'Awareness of 404-instead-of-403 hiding',
        'Flags inconsistent APIs as bugs or contract questions',
      ],
      modelAnswer: `**401 Unauthorized** is really *unauthenticated*: the server doesn't know who you are. No credentials, a malformed token, an expired token, or a token with a bad signature. The response should include a \`WWW-Authenticate\` header telling the client how to authenticate.

**403 Forbidden**: the server knows exactly who you are, and you're not allowed. Your token is valid, but your role or ownership doesn't permit the action.

**Test cases**

| Case | Setup | Request | Expected |
|---|---|---|---|
| 401: no token | none | \`DELETE /booking/1093\` with no Cookie/Authorization | 401 |
| 401: expired token | token with past \`exp\` | \`GET /api/profile\` | 401 |
| 403: wrong role | log in as *viewer* | \`DELETE /api/users/7\` | 403 |
| 403/404: someone else's object | user A's token | \`GET /api/orders/{B's order}\` | 403 or 404, never 200 |

**Nuances I mention**
- Some teams deliberately return **404** for other users' resources so attackers can't discover ids. That's fine if it's consistent and documented.
- **Restful Booker** returns 403 for a PUT without a token; strictly that should be 401. On a real project I'd raise it as a contract question.
- After logout or password change, replaying the old token must give 401.

The most valuable of these is the cross-user test: it's the OWASP API #1 risk (BOLA) and UI testing rarely catches it because the UI never shows you another user's id.`,
      followUps: [
        {
          q: 'A viewer calls an admin endpoint and gets 401. Is that a bug?',
          a: 'Strictly yes: the viewer is authenticated, so the correct answer is 403. In practice I would log it as a low-severity contract bug, because client apps branch on these codes: a 401 often triggers "log the user out and show login", which is a bad experience for a logged-in viewer who just lacks permission.',
        },
        {
          q: 'How do you test authorization across many endpoints efficiently?',
          a: 'Build a role-by-endpoint matrix: rows are endpoints plus methods, columns are roles (anonymous, viewer, editor, admin, other-tenant user), cells are expected statuses. Then run it data-driven, the same request with each role\'s token, in Postman\'s collection runner or an automated suite. It turns authorization into a table that product owners can review.',
        },
      ],
      pitfalls: [
        'Swapping the meanings ("403 is wrong password")',
        'Only testing with no token, never with another valid user\'s token',
        'Treating any 4xx as "passes the negative test" without checking which one',
      ],
    },
    {
      id: 'api-http-iq-03',
      difficulty: 'medium',
      question: 'The API returned 200 OK. What else do you verify before you call the test passed?',
      whatInterviewerLooksFor: [
        'Goes beyond status: headers, schema, values, side-effects',
        'Mentions database or follow-up GET verification',
        'Mentions response time and sensitive data leakage',
        'Structured, layered answer',
      ],
      modelAnswer: `A 200 only tells me the server didn't fail outright. I check in layers:

1. **Status is the *right* 2xx**: a create should be 201 (unless the contract says otherwise), a delete with no body 204.
2. **Headers**: \`Content-Type: application/json\`; \`Location\` after a create; cache headers on private data; no \`X-Powered-By\` version leaks.
3. **Body shape**: validate against the JSON Schema (required fields, types, no unexpected fields).
4. **Body values**: echo the request fields back (firstname = "Sally"); computed fields are right (total = price × nights); dates in the agreed format and timezone.
5. **No error hidden in a 200**: bodies like \`{"success": false}\` or \`{"reason": "Bad credentials"}\` with status 200 are a contract bug (Restful Booker does this on \`/auth\`).
6. **Side-effects**: GET the resource back, or query the DB, to prove it was stored. For a DELETE, a later GET returns 404. If an email or event should fire, check that too.
7. **Sensitive data**: no password hashes, internal ids or other users' data.
8. **Performance**: response time inside the agreed SLA.

**Example:** creating a booking on Restful Booker. I assert 200 (their contract), a numeric \`bookingid\`, echoed fields, schema match, and then \`GET /booking/{id}\` returns the same data. Only then is it a pass.`,
      followUps: [
        {
          q: 'How do you verify the side-effect if you have no database access?',
          a: 'Use the API itself: GET the resource by id, search for it with a list endpoint, or check a downstream API or UI that reads the same data. For async effects (emails, events) use a test inbox service or an admin/audit endpoint. If none exist, I would ask for a test hook or read-only DB access, because otherwise the test proves only half the behaviour.',
        },
        {
          q: 'Response time is 2 seconds on the test server. Is that a bug?',
          a: 'Only against an agreed target. I would ask for the SLA (for example p95 below 500 ms), measure several calls rather than one, and note the environment, since test servers are often smaller. If it is consistently far above target, or much slower than the last release, I raise it with the numbers and the request id.',
        },
      ],
      pitfalls: [
        'Stopping at "status is 200"',
        'Checking values but never checking the data was really persisted',
        'Ignoring headers entirely',
      ],
    },
    {
      id: 'api-http-iq-04',
      difficulty: 'medium',
      question: 'The checkout page shows the wrong total. How do you work out whether the bug is in the frontend or the API?',
      context: 'You have browser DevTools and Postman, but no access to the source code.',
      whatInterviewerLooksFor: [
        'Uses the browser Network tab to inspect the real request and response',
        'Reproduces the call independently in Postman',
        'Compares request inputs, response data and rendered value',
        'Writes a bug report with request/response evidence and the right owner',
      ],
      modelAnswer: `I isolate the layer by looking at the data at each boundary.

1. **Open DevTools → Network**, filter by Fetch/XHR, reproduce, and find the call that returns the cart or price (e.g. \`GET /api/cart\`).
2. **Inspect the request**: are the right item ids, quantities and coupon sent? If the *request* is wrong (quantity 1 instead of 2), the frontend built it badly: frontend bug.
3. **Inspect the response**: is \`total\` correct for those inputs? If the API returns 1,180 when the maths says 1,080, the API is wrong: backend bug.
4. **Compare with the screen**: if the API returns 1,080 but the page shows 1,180, the frontend is mis-rendering (rounding, currency formatting, adding tax twice).
5. **Reproduce in Postman** ("Copy as cURL" then import) to confirm the API behaviour without the browser, and to try variations (no coupon, two items).
6. **Report** with the request, the response body, the expected calculation, the \`X-Request-Id\` if present, and which layer is at fault. That routes the bug to the right team on day one.

| Request correct? | Response correct? | Screen correct? | Owner |
|---|---|---|---|
| No | n/a | No | Frontend (request building) |
| Yes | No | No | Backend / API |
| Yes | Yes | No | Frontend (rendering) |`,
      followUps: [
        {
          q: 'The response looks right in DevTools but the page is still wrong only for some users. What next?',
          a: 'Look for what differs between users: locale and currency formatting, cached responses (check Cache-Control and whether a CDN serves a stale copy), feature flags, A/B experiments, browser versions. Ask an affected user for a HAR file or screenshots of the Network tab, and compare their response with mine.',
        },
        {
          q: 'Why include X-Request-Id in the bug report?',
          a: 'It lets a developer find the exact server log lines and trace for that one call, across all services it touched, instead of guessing by timestamp. It turns "I saw a wrong total yesterday" into a single searchable id, which shortens debugging a lot, especially for intermittent issues.',
        },
      ],
      pitfalls: [
        'Assigning the bug to frontend or backend by guesswork',
        'Not checking the request payload, only the response',
        'Reporting without the actual request/response evidence',
      ],
    },
    {
      id: 'api-http-iq-05',
      difficulty: 'easy',
      question: 'You send a string in a numeric field and the API answers 500 Internal Server Error. Is this a bug? How would you report it?',
      whatInterviewerLooksFor: [
        'Knows 5xx from client input is a defect',
        'Names the expected response (400/422 + message)',
        'Writes a reproducible API bug report',
        'Considers security impact of error details',
      ],
      modelAnswer: `**Yes, it's a bug.** A 5xx means the server failed. Bad input is the *client's* mistake, and a well-built API validates it and answers **400 Bad Request** (or 422) with a message that names the field. The 500 shows the input reached code that wasn't expecting it.

**Why it matters**
- Clients can't tell "you sent bad data" from "we're down", so apps show the wrong message and may retry pointlessly.
- 500s pollute monitoring and can trigger alerts.
- The error body often contains a **stack trace**, which leaks framework, file paths, sometimes SQL: an OWASP "security misconfiguration" finding.
- It hints the input isn't validated, so other injection-style inputs deserve a look.

**Bug report**
- **Title:** POST /booking returns 500 when totalprice is a string
- **Environment:** QA, build 2026.10.3
- **Request:** method, URL, headers, the exact body \`{..., "totalprice": "abc"}\`
- **Actual:** 500, body excerpt (redact secrets), response time, \`X-Request-Id\`
- **Expected:** 400 with \`{"field": "totalprice", "message": "must be a number"}\`
- **Severity:** medium (no data corruption, but wrong contract and possible info leak); higher if a stack trace is exposed
- **Attachment:** cURL command or Postman request so the developer can replay it in one click`,
      followUps: [
        {
          q: 'What other inputs would you try once you see this?',
          a: 'Other wrong types for the same field (boolean, array, object, null), boundaries like -1, 0 and very large numbers, the same mistake in every other numeric field, and a quick look at strings with quotes or special characters in text fields, since missing validation in one place often means missing validation elsewhere.',
        },
        {
          q: 'The developer marks it "won\'t fix: the UI never sends strings". Your response?',
          a: 'I explain that the API is callable by anything (scripts, mobile versions, attackers), so the UI is not a security or validation boundary. I show the stack-trace exposure if there is one, and suggest the fix is small (schema validation middleware). If they still decline, I document the risk and let the product owner decide on priority.',
        },
      ],
      pitfalls: [
        'Saying "it is a 5xx so it is the server team\'s problem, not a test failure"',
        'Accepting any error as a pass for a negative test',
        'Reporting without the exact request body',
      ],
    },
    {
      id: 'api-http-iq-06',
      difficulty: 'hard',
      question: 'Your app uses JWT bearer tokens. What would you test around them?',
      whatInterviewerLooksFor: [
        'Knows JWT structure and that the payload is readable',
        'Lists negative token tests (expired, tampered, alg none, wrong audience)',
        'Tests logout/revocation and storage',
        'Considers authorization claims (role escalation)',
      ],
      modelAnswer: `**What a JWT is:** \`header.payload.signature\`, each part base64url-encoded. The payload holds claims like \`sub\` (user), \`role\`, \`exp\` (expiry), \`aud\` (intended API). It's **signed, not encrypted**: anyone can decode it, but changing it breaks the signature.

**My test list**

| # | Test | Expected |
|---|---|---|
| 1 | Valid token | 200 |
| 2 | No \`Authorization\` header | 401 |
| 3 | \`Bearer\` + garbage | 401 |
| 4 | Expired token (\`exp\` in the past) | 401 |
| 5 | Payload changed (\`role: viewer\` → \`admin\`), old signature | 401 |
| 6 | Header changed to \`alg: none\`, signature removed | 401 |
| 7 | Token issued for another service (\`aud\` mismatch) | 401 |
| 8 | Valid viewer token on admin endpoint | 403 |
| 9 | User A's token on user B's resource | 403/404 |
| 10 | Replay after logout / password change | 401 (if revocation is promised) |
| 11 | Decode the payload | No secrets, no PII beyond what's needed |
| 12 | Expiry length | Short access token + refresh flow; refresh token can't be used as access token |

**Where it's stored:** in the browser, check whether it's in \`localStorage\` (readable by any XSS) or an \`HttpOnly\` cookie.

I'd run 2–9 as a data-driven test with a table of tokens and expected statuses, so it runs on every build.`,
      followUps: [
        {
          q: 'How do you get an expired token to test with?',
          a: 'Ask developers for a test-only way: a short expiry setting in QA (for example 60 seconds), a test endpoint that issues tokens with a chosen exp, or a signing key for the QA environment so tests can mint tokens. As a fallback, save a real token and reuse it after it expires. Never weaken production config for this.',
        },
        {
          q: 'Logout works in the UI but the old JWT still returns 200. Bug or design?',
          a: 'It depends on the requirement. Stateless JWTs stay valid until exp unless the server keeps a deny-list. If the requirement or security policy says logout must end access, it is a bug. If not, I would flag the risk (a stolen token stays useful until expiry) and recommend short-lived access tokens, then let security or product decide.',
        },
      ],
      pitfalls: [
        'Believing the JWT payload is encrypted or secret',
        'Testing only the happy path and "no token"',
        'Forgetting authorization (role/ownership) tests once authentication works',
      ],
    },
    {
      id: 'api-http-iq-07',
      difficulty: 'medium',
      question: 'Compare REST, SOAP and GraphQL from a tester\'s point of view. What do you do differently for each?',
      whatInterviewerLooksFor: [
        'Accurate structural differences (endpoints, format, contract)',
        'Knows GraphQL often returns 200 with errors',
        'Mentions contract validation per style (OpenAPI, WSDL/XSD, GraphQL schema)',
        'GraphQL-specific risks (query depth, introspection, field auth)',
      ],
      modelAnswer: `| | REST | SOAP | GraphQL |
|---|---|---|---|
| Shape | Many resource URLs + HTTP verbs | One endpoint, XML envelope, operations in the body | One endpoint, client asks for exact fields |
| Contract | OpenAPI/Swagger | WSDL + XSD | Schema (SDL) |
| Errors | HTTP status codes | \`<soap:Fault>\` | \`errors\` array, frequently with HTTP 200 |

**REST testing:** methods and status codes per endpoint, JSON Schema/OpenAPI validation, CRUD flows, auth per verb, paging/filtering.

**SOAP testing:** build the XML envelope (SoapUI or Postman), validate against the XSD, assert with XPath, test Fault codes and messages for bad input, check WS-Security headers if used. Status codes matter less; the Fault content matters more.

**GraphQL testing:**
- Never trust the status alone: assert \`errors\` is absent and \`data\` has the requested shape.
- Field-level authorization: can a normal user query \`user { salary }\`?
- Abuse: deeply nested or very large queries should be limited (depth/complexity limits, timeouts).
- Introspection should usually be off in production.
- Over/under-fetching isn't a bug class here, but nullability is: a non-null field returning null bubbles up and nulls the parent.

In all three I still apply the same thinking: positive, negative, auth, contract, performance.`,
      followUps: [
        {
          q: 'Why might a GraphQL API return HTTP 200 for a failed request?',
          a: 'A single GraphQL request can ask for several fields, and some may succeed while others fail. So the transport says "your HTTP request was processed" with 200, and the per-field problems go in the errors array next to partial data. Many servers only use 4xx/5xx for problems like malformed requests or auth failure on the whole request.',
        },
        {
          q: 'Which one have you tested, and with what tool?',
          a: 'Answer honestly from experience. A good shape: "Mostly REST in Postman: collections per feature, environment variables, test scripts for status, schema and values, and Newman in CI. I have explored GraphQL with Postman\'s GraphQL request type on a public API and know to assert on the errors array." Avoid claiming SOAP depth you do not have.',
        },
      ],
      pitfalls: [
        'Saying "GraphQL is just REST with one endpoint" and testing status codes only',
        'Claiming SOAP is obsolete and not worth testing (many banks/insurers still use it)',
        'Confusing SOAP (protocol) with REST (architectural style) as equivalent things',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'api-http-drill-1',
      question:
        'Choose the most appropriate status code for each of six situations on a booking API, and say what else the response should contain.',
      assumptions: [
        'S1: a new booking is created successfully.',
        'S2: GET /booking/abc123 for an id that never existed.',
        'S3: request body has "totalprice": "cheap".',
        'S4: valid token, but the user\'s role is "viewer" and they call DELETE /booking/7.',
        'S5: the same client sent 120 requests in one minute; the limit is 100.',
        'S6: a booking was successfully deleted and there is nothing to return.',
      ],
      steps: [
        { label: 'S1: create', calc: 'A resource was created → 201 Created + Location: /booking/{id} + the new booking in the body (Restful Booker uses 200; note it).' },
        { label: 'S2: missing resource', calc: 'Resource does not exist → 404 Not Found with a short JSON error. Not 400 (request is well-formed) and not 200 with null.' },
        { label: 'S3: wrong type', calc: 'Client sent invalid data → 400 Bad Request (or 422 if the team uses it) with a body naming totalprice and the rule. Never 500.' },
        { label: 'S4: role not allowed', calc: 'Authenticated but not permitted → 403 Forbidden. 401 would wrongly tell the client to log in again.' },
        { label: 'S5: rate limit', calc: 'Too many requests → 429 Too Many Requests + Retry-After header (seconds or date).' },
        { label: 'S6: deleted, no body', calc: '204 No Content with an empty body (200 with a confirmation body is also acceptable if documented).' },
      ],
      answer: `| Scenario | Code | Must also include |
|---|---|---|
| S1 create | **201** | \`Location\` header, created resource |
| S2 unknown id | **404** | Small error body |
| S3 wrong type | **400** / 422 | Field name + reason |
| S4 role | **403** | Error body, no data |
| S5 rate limit | **429** | \`Retry-After\` |
| S6 delete | **204** | Empty body |`,
      insight:
        'Each code tells the client what to do next: retry later (429), log in (401), stop trying (403), fix the input (400), follow the Location (201). A wrong code makes the client do the wrong thing, which is why status mismatches are real bugs.',
      followUps: [
        {
          q: 'What if S2 used an id that belongs to another user instead of one that never existed?',
          a: 'Then it is an authorization case: 403 Forbidden, or 404 if the API deliberately hides the existence of other users\' objects. Both are defensible; returning 200 with that user\'s booking is the serious BOLA bug. Whatever the choice, it must be consistent across endpoints.',
        },
      ],
    },
    {
      id: 'api-http-drill-2',
      question:
        'Design at least 10 negative tests for `PATCH /booking/:id` on Restful Booker, grouped by category, each with the expected outcome.',
      assumptions: [
        'Valid auth is either `Cookie: token=<token from POST /auth>` or `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`.',
        'Booking 1093 exists; booking 99999999 does not.',
        'PATCH accepts any subset of firstname, lastname, totalprice, depositpaid, bookingdates, additionalneeds.',
        'Where Restful Booker deviates from REST norms, state the ideal and note the deviation.',
      ],
      steps: [
        { label: '1. Auth (3)', calc: 'No auth header → ideal 401 (RB: 403). token=garbage → 401/403. Expired/old token after reset → 401/403.' },
        { label: '2. Resource (2)', calc: 'PATCH /booking/99999999 → 404 (RB has returned 405). PATCH /booking/abc → 404/400, never 500.' },
        { label: '3. Types (3)', calc: 'totalprice "abc" → 400. depositpaid "yes" → 400. bookingdates "2026-01-01" (string, not object) → 400.' },
        { label: '4. Business rules (2)', calc: 'checkout earlier than existing checkin → 400/422. totalprice -50 → 400/422.' },
        { label: '5. Payload/headers (2)', calc: 'Invalid JSON (trailing comma) → 400. Content-Type: text/plain → 415/400.' },
        { label: '6. Security (2)', calc: 'Body {"bookingid": 1} → ignored; id unchanged. firstname "<img src=x onerror=alert(1)>" → stored as plain text, escaped wherever displayed.' },
        { label: '7. After every negative case', calc: 'GET /booking/1093 → unchanged data: a rejected PATCH must not partially apply.' },
      ],
      answer: `14 negative tests across **auth (3), resource (2), types (3), business rules (2), payload/headers (2), security (2)**, plus a **state check after each**: the booking must be unchanged when the PATCH is rejected. Expected codes are 401/403/404/400/415/422; any **5xx** or any **partial update** is a bug.`,
      insight:
        'The most overlooked negative assertion is the after-state: a validation error that still saved half the fields is worse than a 500. Always GET the resource after a rejected write.',
      followUps: [
        {
          q: 'How would you turn these 14 cases into an efficient automated test?',
          a: 'Put them in a data table with columns: name, headers, path id, body, expected status, expected message fragment. Run one request template over every row (a Postman collection-runner CSV or a parameterised test in code), and after each row GET booking 1093 and compare with a snapshot taken at the start.',
        },
      ],
    },
    {
      id: 'api-http-drill-3',
      question:
        'Predict the final server state and each response status for this sequence against an empty `/users` collection: POST A, POST A, PUT /users/1 (full body B), PUT /users/1 (same B), PATCH /users/1 {"loginCount": "+1"} twice, DELETE /users/1 twice.',
      assumptions: [
        'POST /users creates a new user with an auto-incremented id; email must be unique, duplicates get 409.',
        'Body A has email a@x.com; body B has email b@x.com.',
        'The PATCH operation means "increment loginCount by 1", starting from 0.',
        'DELETE returns 204, and 404 if the user is already gone.',
      ],
      steps: [
        { label: 'POST A (1st)', calc: '201, user id 1 created with a@x.com. Users: {1}.' },
        { label: 'POST A (2nd)', calc: 'Same unique email → 409 Conflict. Without the uniqueness rule it would be 201 with id 2: POST is not idempotent.' },
        { label: 'PUT /users/1 with B (twice)', calc: '200, then 200. User 1 now equals B. The second call changes nothing more → idempotent.' },
        { label: 'PATCH increment (twice)', calc: '200, loginCount 0 → 1; 200, 1 → 2. State changed twice → this PATCH is NOT idempotent.' },
        { label: 'DELETE /users/1 (twice)', calc: '204, then 404. State after both: user 1 absent → idempotent even though the status differs.' },
      ],
      answer: `Statuses: **201, 409, 200, 200, 200, 200, 204, 404**. Final state: **no users**. The POST pair is protected only by the uniqueness rule; PUT and DELETE are idempotent by definition; the increment-style PATCH is not.`,
      insight:
        'Idempotency is about the state after N calls, not identical responses. The useful test is: send twice, compare state. Increment-style PATCH and plain POST are the operations that need protection against client retries.',
      followUps: [
        {
          q: 'What would change if the second POST A timed out on the client side but actually succeeded on the server?',
          a: 'The client does not know it succeeded, so it retries. With the unique email the retry gets 409, which the client might wrongly show as an error. With an Idempotency-Key the server would return the original 201 response instead. Without either, you would get a duplicate user. This is exactly the scenario to test for payments and orders.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'api-http-mcq-01',
      difficulty: 'easy',
      question: 'You need to change only the `totalprice` of an existing booking and leave every other field as it is. Which method fits best?',
      options: ['GET', 'POST', 'PUT', 'PATCH'],
      correct: [3],
      explanation:
        'PATCH applies a partial modification: send just the field you want changed. PUT replaces the whole resource, so you would have to send every field (and omitting one may null it). POST creates a new resource, and GET only reads.',
      followUps: [
        {
          q: 'What would you verify after the PATCH succeeds?',
          a: 'GET the booking and check totalprice has the new value AND every other field (names, dates, depositpaid, additionalneeds) is exactly as before. The classic PATCH bug is silently resetting fields that were not sent, which only a full comparison catches.',
        },
      ],
    },
    {
      id: 'api-http-mcq-02',
      difficulty: 'easy',
      question: 'Your test sends a request body with a missing closing brace (malformed JSON). What should a well-behaved API return?',
      options: ['200 OK with an error message in the body', '400 Bad Request', '404 Not Found', '500 Internal Server Error'],
      correct: [1],
      explanation:
        'Malformed syntax is a client error, so 400 Bad Request is correct, ideally with a message saying the JSON could not be parsed. A 500 means the server crashed on input it should have rejected, which is a bug. A 200 with an error body hides the failure from clients and monitoring, and 404 is about a missing resource, not a bad body.',
      followUps: [
        {
          q: 'Name two other payload-level negative tests besides malformed JSON.',
          a: 'An empty body on an endpoint that requires one, and a correct JSON body sent with the wrong Content-Type such as text/plain (expect 415 or 400). An oversized payload (expect 413) and a JSON array where an object is expected are also good candidates.',
        },
      ],
    },
    {
      id: 'api-http-mcq-03',
      difficulty: 'easy',
      question: 'What does this response tell the client?',
      code: {
        language: 'http',
        code: `HTTP/1.1 201 Created
Location: /api/orders/5521
Content-Type: application/json

{ "id": 5521, "status": "PENDING" }`,
      },
      options: [
        'The order already existed and was returned unchanged',
        'A new order was created and can be fetched at /api/orders/5521',
        'The request was accepted but will be processed later, with no resource yet',
        'The client must redirect the user to /api/orders/5521 in the browser',
      ],
      correct: [1],
      explanation:
        '201 Created means a new resource exists now, and Location gives its URL. "Accepted but processed later" describes 202 Accepted. Returning an existing record would normally be 200 (or 409 if it was a duplicate attempt). Location on a 201 is a pointer to the resource, not a browser redirect like 301/302.',
      followUps: [
        {
          q: 'How would you test the Location header?',
          a: 'Assert it is present, then send a GET to that exact URL (with the same auth) and check you receive 200 and the same id and fields as the create response. Also check it is not an absolute URL pointing at an internal hostname.',
        },
      ],
    },
    {
      id: 'api-http-mcq-04',
      difficulty: 'medium',
      question: 'Select ALL the HTTP methods that are idempotent by definition (RFC 9110).',
      options: ['GET', 'PUT', 'DELETE', 'POST', 'PATCH'],
      correct: [0, 1, 2],
      explanation:
        'GET, PUT and DELETE are defined as idempotent: repeating them leaves the server in the same state. POST typically creates a new record each time. PATCH is not guaranteed to be idempotent because a patch can describe a relative change (append, increment), even though many simple "set field" patches happen to behave idempotently.',
      followUps: [
        {
          q: 'Give an example PATCH body that is idempotent and one that is not.',
          a: 'Idempotent: {"totalprice": 175}, because setting a value twice leaves it at 175. Not idempotent: a JSON Patch operation [{"op": "add", "path": "/tags/-", "value": "vip"}], which appends "vip" again on each call, or a custom {"loginCount": "+1"} increment.',
        },
      ],
    },
    {
      id: 'api-http-mcq-05',
      difficulty: 'medium',
      question: 'A user with a valid token and role "viewer" calls an admin-only endpoint. Which response is correct?',
      code: {
        language: 'http',
        code: `DELETE /api/users/7 HTTP/1.1
Authorization: Bearer <valid token, role = viewer>

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer`,
      },
      options: [
        'Correct: 401 is the standard code for any permission problem',
        'Incorrect: it should be 403, because the user is authenticated but not allowed',
        'Incorrect: it should be 404, because viewers cannot see users',
        'Incorrect: it should be 400, because the request is invalid for this role',
      ],
      correct: [1],
      explanation:
        '401 means the server could not authenticate the caller (no, bad or expired credentials). Here the token is valid, so the caller is known; the problem is permission, which is 403. 404 is only acceptable as a deliberate "hide existence" policy applied consistently, and 400 is for malformed input, not authorization.',
      followUps: [
        {
          q: 'Why does the difference matter to a client app?',
          a: 'Clients react differently: on 401 they usually drop the session and send the user to the login screen; on 403 they show "you don\'t have permission". Returning 401 here would log a valid viewer out every time they hit an admin button, which is a real user-facing defect.',
        },
      ],
    },
    {
      id: 'api-http-mcq-06',
      difficulty: 'medium',
      question: '`GET /booking?firstname=Zebedee` matches no bookings. What is the best-designed response?',
      options: ['404 Not Found', '200 OK with an empty array []', '204 No Content', '400 Bad Request'],
      correct: [1],
      explanation:
        'The collection /booking exists; the filter simply matched nothing, so 200 with [] is correct and easy for clients to handle. 404 would imply the endpoint or resource does not exist. 204 forces clients to special-case a missing body, and 400 says the query was invalid, which it was not.',
      followUps: [
        {
          q: 'When would 404 be right for a GET?',
          a: 'When a path parameter identifies a single resource that does not exist, such as GET /booking/99999999. Path = "this specific thing", so missing means 404. Query = "filter this list", so no matches means an empty list.',
        },
      ],
    },
    {
      id: 'api-http-mcq-07',
      difficulty: 'medium',
      question: 'Given this schema, which response body PASSES validation?',
      code: {
        language: 'json',
        code: `{
  "type": "object",
  "required": ["id", "status"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "integer" },
    "status": { "type": "string", "enum": ["PENDING", "PAID"] },
    "note": { "type": "string" }
  }
}`,
      },
      options: [
        '{ "id": "17", "status": "PAID" }',
        '{ "id": 17, "status": "PAID", "note": "gift" }',
        '{ "id": 17, "status": "paid" }',
        '{ "id": 17, "status": "PAID", "internalCost": 4 }',
      ],
      correct: [1],
      explanation:
        'Option 2 has both required fields with the right types and an allowed optional field. "17" is a string, not an integer. "paid" is not in the case-sensitive enum. internalCost is rejected by additionalProperties: false, which is exactly how a schema catches leaked internal fields.',
      followUps: [
        {
          q: 'Would {"id": 17, "status": "PAID"} pass, and what does that tell you about "note"?',
          a: 'Yes. note is defined in properties but not in required, so it is optional: it is type-checked when present and ignored when absent. If the contract says note must always be present, you have to add it to required.',
        },
      ],
    },
    {
      id: 'api-http-mcq-08',
      difficulty: 'medium',
      question: 'A payment API returns `HTTP 200` with body `{"success": false, "error": "Card declined"}`. What is the main problem from a testing point of view?',
      options: [
        'Nothing: the body clearly explains the error',
        'The status code says success, so clients, gateways and monitoring treat a failure as success',
        'The response should be 500 because the payment failed',
        'The body should be XML for payment errors',
      ],
      correct: [1],
      explanation:
        'Status codes are the contract that generic tooling reads. With 200, retries, error-rate dashboards, alerts and many client libraries all treat it as success. A declined card is a business rejection, usually 402 or 422 (per the contract), not 500, because the server did not fail. The format of the body is not the issue.',
      followUps: [
        {
          q: 'How would you write the test so it catches this pattern?',
          a: 'Assert both layers: the status code expected by the contract (e.g. 422) and the body fields. A test that checks only body.success would pass on the buggy API. Adding a schema per status (success schema for 2xx, error schema for 4xx) makes the mismatch obvious.',
        },
      ],
    },
    {
      id: 'api-http-mcq-09',
      difficulty: 'medium',
      question: 'Select ALL that are negative tests for `POST /booking` on Restful Booker.',
      options: [
        'Send the body without the required lastname field',
        'Send "totalprice": "abc"',
        'Send a valid body that includes the optional additionalneeds field',
        'Send checkout earlier than checkin',
        'Send a valid body and then GET the new booking by id',
      ],
      correct: [0, 1, 3],
      explanation:
        'Missing a required field, wrong type, and an impossible date range all feed invalid input and expect a rejection, so they are negative tests. Sending a valid body with an optional field and reading the created booking back are positive checks of correct behaviour. Negative does not mean "a test that fails"; it means invalid input whose rejection you verify.',
      followUps: [
        {
          q: 'What should every negative test assert besides the status code?',
          a: 'A useful error body (which field, what rule), no stack trace or internal details, and no side-effect: the invalid booking must not have been created. For updates, GET the resource and confirm nothing changed.',
        },
      ],
    },
    {
      id: 'api-http-mcq-10',
      difficulty: 'hard',
      question: 'Starting with no orders, this sequence runs. How many orders exist at the end, and what is order 1\'s quantity?',
      code: {
        language: 'http',
        code: `POST  /orders        { "sku": "PEN", "qty": 1 }   -> 201 (id 1)
POST  /orders        { "sku": "PEN", "qty": 1 }   -> 201 (id 2)
PUT   /orders/1      { "sku": "PEN", "qty": 5 }   -> 200
PUT   /orders/1      { "sku": "PEN", "qty": 5 }   -> 200
DELETE /orders/2                                  -> 204
DELETE /orders/2                                  -> 404`,
      },
      options: [
        '1 order; order 1 has qty 5',
        '1 order; order 1 has qty 10',
        '2 orders; order 1 has qty 5',
        '0 orders; the second DELETE removed order 1',
      ],
      correct: [0],
      explanation:
        'The two POSTs created orders 1 and 2 (POST is not idempotent). Both PUTs set order 1 to the same full representation, so qty is 5, not 10 (PUT replaces, it does not add). Order 2 was deleted by the first DELETE; the second DELETE only reports 404 and touches nothing else. One order remains.',
      followUps: [
        {
          q: 'The second DELETE returned 404. Is that a failed test?',
          a: 'No, provided the contract allows it. The state is unchanged (order 2 still gone), so DELETE remains idempotent. Some APIs return 204 both times. What I would flag is a 500, or a second DELETE that affected another order.',
        },
      ],
    },
    {
      id: 'api-http-mcq-11',
      difficulty: 'hard',
      question: 'Your rate-limit test sends 101 requests in a minute to an API limited to 100. What should the 101st response look like?',
      options: [
        '503 Service Unavailable, because the server is overloaded',
        '429 Too Many Requests with a Retry-After header',
        '403 Forbidden until the user logs in again',
        '400 Bad Request with "limit exceeded" in the body',
      ],
      correct: [1],
      explanation:
        '429 (RFC 6585) is specifically for a client exceeding a rate limit, and Retry-After tells it when to try again. 503 describes the server as a whole being unavailable, not one client\'s quota. 403 suggests a permission problem that logging in would not fix, and 400 says the request itself was malformed.',
      followUps: [
        {
          q: 'What else would you test around rate limiting?',
          a: 'That the counter resets after the window, that limits are per user/key and not global (user B is unaffected by A), that the login endpoint is limited to slow brute force, and that headers like RateLimit-Remaining (if documented) count down correctly. Run these against a dedicated environment to avoid blocking teammates.',
        },
      ],
    },
    {
      id: 'api-http-mcq-12',
      difficulty: 'hard',
      question: 'Select ALL statements about JSON Web Tokens that are true.',
      options: [
        'The payload is encrypted, so it is a safe place for secrets',
        'Anyone holding the token can decode and read its claims',
        'Changing the role claim without re-signing should make the server reject the token with 401',
        'The server should reject tokens whose exp time has passed',
        'A JWT can only be sent in a cookie, never in a header',
      ],
      correct: [1, 2, 3],
      explanation:
        'A standard JWT is base64url-encoded and signed, not encrypted: anyone can read the claims, so secrets must never go there. The signature makes tampering detectable, so an edited role must be rejected. Expired tokens must be refused. JWTs are commonly sent as Authorization: Bearer headers, and cookies are also possible.',
      followUps: [
        {
          q: 'How would you run the "tampered role" test in practice?',
          a: 'Decode the payload, change "role":"viewer" to "admin", base64url-encode it again, and rebuild header.newPayload.oldSignature. Send it to an admin endpoint. Expected 401. If you get 200, the server is not verifying signatures: a critical security bug.',
        },
      ],
    },
    {
      id: 'api-http-mcq-13',
      difficulty: 'hard',
      question: 'Which issue does this error response reveal, beyond the wrong status code?',
      code: {
        language: 'http',
        code: `POST /api/login HTTP/1.1
Content-Type: application/json

{ "email": "a@x.com'", "password": "x" }

HTTP/1.1 500 Internal Server Error
Content-Type: text/html
X-Powered-By: Express 4.17.1

<pre>QueryFailedError: syntax error at or near "'"
    at PostgresQueryRunner.query (/app/node_modules/typeorm/...)</pre>`,
      },
      options: [
        'Only a cosmetic problem: the error should be JSON instead of HTML',
        'Information disclosure plus a likely SQL injection risk, because user input reaches the query unescaped',
        'A performance problem, because errors should be cached',
        'A CORS misconfiguration, because the Content-Type is wrong',
      ],
      correct: [1],
      explanation:
        'A single quote broke the SQL statement, which strongly suggests input is concatenated into the query (SQL injection risk), and the response leaks the database engine, ORM, file paths and framework version (security misconfiguration). The HTML format is a smaller issue. Caching and CORS have nothing to do with this response.',
      followUps: [
        {
          q: 'What should you do next as a QA engineer?',
          a: 'Report it immediately as a high-severity security bug with the exact request and response, and stop probing further on shared environments unless security testing is in scope. Suggest parameterised queries and a generic error handler that returns a JSON 400/401 without internals. Let the security team do deeper exploitation testing.',
        },
      ],
    },
    {
      id: 'api-http-mcq-14',
      difficulty: 'expert',
      question: 'User A runs the request below. Order 1002 belongs to user B. Which OWASP API risk is this, and what should the response be?',
      code: {
        language: 'http',
        code: `GET /api/orders/1002 HTTP/1.1
Authorization: Bearer <valid token for user A>

HTTP/1.1 200 OK
Content-Type: application/json

{ "id": 1002, "owner": "userB", "address": "12 Park St", "total": 4999 }`,
      },
      options: [
        'Broken Authentication; the response should be 401',
        'Broken Object Level Authorization (BOLA); the response should be 403 or 404',
        'Unrestricted Resource Consumption; the response should be 429',
        'No issue: A has a valid token, so 200 is correct',
      ],
      correct: [1],
      explanation:
        'Authentication worked (A is who they say), but the server never checked that A owns order 1002: that is BOLA, OWASP API #1 (2023). Correct behaviour is 403, or 404 if the API hides other users\' objects. 401 would mean A is not authenticated, which is false. Rate limiting is unrelated to accessing someone else\'s data.',
      followUps: [
        {
          q: 'Why does UI testing usually miss BOLA?',
          a: 'The UI only shows you links to your own objects, so you never request someone else\'s id. You need to change the id in the API call directly, ideally with two test accounts: create an object as B, then request, update and delete it with A\'s token.',
        },
      ],
    },
    {
      id: 'api-http-mcq-15',
      difficulty: 'expert',
      question: 'A mobile app\'s `POST /payments` times out on a flaky network, and the app automatically retries. Some customers are charged twice. Which design change best fixes this, and what would you test?',
      options: [
        'Change POST to GET so the request becomes safe to repeat',
        'Have the client send an Idempotency-Key header; the server stores it and returns the original result for repeats',
        'Increase the client timeout from 10s to 60s so retries never happen',
        'Return 500 for every second request within 5 seconds',
      ],
      correct: [1],
      explanation:
        'An idempotency key makes a non-idempotent POST safe to retry: the server recognises the duplicate and replays the first response without charging again. GET must not change state, so using it for payments is wrong. A longer timeout only reduces how often it happens. Rejecting quick repeats with 500 breaks legitimate payments and returns the wrong status class.',
      followUps: [
        {
          q: 'List three test cases for the idempotency-key behaviour.',
          a: 'Same key and same body twice gives one charge and identical responses. Same key with a different body is rejected (409/422) rather than silently charging a different amount. Different keys with the same body create two charges, since the client meant two payments. Also check how long keys are remembered.',
        },
      ],
    },
  ],
};

export default topic;
