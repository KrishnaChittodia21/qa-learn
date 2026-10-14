// Pure simulation of request/response flows against Restful Booker
// (https://restful-booker.herokuapp.com/apidoc/index.html). Status codes were checked against the
// live API in Oct 2026: POST /auth 200 (also 200 + {"reason":"Bad credentials"} on a wrong
// password), POST /booking 200, GET 200 / 404, PUT and DELETE without a token 403 "Forbidden",
// DELETE with a token 201 "Created", malformed JSON 400, valid JSON missing fields 500.
import type { BaseFrame } from '../../core';

export type ScenarioId = 'chain' | 'create' | 'update' | 'delete' | 'errors';
export type Lane = 'client' | 'server' | 'db';

export interface Params {
  scenario: ScenarioId;
  auth: boolean;
}

export interface Card {
  kind: 'request' | 'response';
  lines: string[];
}

export interface Done {
  label: string;
  status: number;
}

export interface HttpFrame extends BaseFrame {
  packet: Lane;
  dir: 'req' | 'res' | 'none';
  /** packet text */
  tag: string;
  status?: number;
  card?: Card;
  vars: { token?: string; bookingid?: string };
  /** variable set in this frame */
  fresh?: 'token' | 'bookingid';
  history: Done[];
}

const TOKEN = 'abc123';
const ID = '1042';
const BOOKING = '{"firstname":"Jim","lastname":"Brown","totalprice":111,"depositpaid":true,"bookingdates":{…},"additionalneeds":"Breakfast"}';
const JSON_H = ['Content-Type: application/json', 'Accept: application/json'];

export const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

interface Call {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** path as written in Postman, with {{variables}} */
  path: string;
  headers: string[];
  body?: string;
  /** what the server does when the request arrives */
  server: string;
  /** datastore operation (omitted when the server rejects first) */
  db?: string;
  status: number;
  resBody: string;
  /** caption for the response */
  verdict: string;
  /** post-response script: save a variable */
  save?: { name: 'token' | 'bookingid'; value: string; script: string };
  /** commentary shown after the response (non-standard behaviour, test ideas) */
  note?: string;
  ask?: string;
  why: string;
}

const auth = (ask?: string): Call => ({
  method: 'POST',
  path: '/auth',
  headers: ['Content-Type: application/json'],
  body: '{"username":"admin","password":"password123"}',
  why: 'POST /auth sends credentials in the body to create a session token.',
  server: 'Express parses the JSON body and checks the credentials.',
  db: 'credentials valid → new token stored',
  status: 200,
  resBody: `{"token":"${TOKEN}"}`,
  verdict: '200 OK with the token in the JSON body.',
  save: { name: 'token', value: TOKEN, script: 'pm.environment.set("token", pm.response.json().token);' },
  ask,
});

const create = (ask?: string): Call => ({
  method: 'POST',
  path: '/booking',
  headers: JSON_H,
  body: BOOKING,
  why: 'POST /booking creates a new resource. It is not idempotent: sending it twice creates two bookings.',
  server: 'Body parsed and the booking fields validated; the server assigns a new id.',
  db: `INSERT booking → id ${ID}`,
  status: 200,
  resBody: `{"bookingid":${ID},"booking":{…}}`,
  verdict: `200 OK with "bookingid": ${ID}. Strict REST would answer 201 Created plus a Location header; Restful Booker returns 200.`,
  save: { name: 'bookingid', value: ID, script: 'pm.environment.set("bookingid", pm.response.json().bookingid);' },
  ask,
});

const get = (after: 'created' | 'deleted' | 'kept' | 'missing', ask?: string): Call => ({
  method: 'GET',
  path: after === 'missing' ? '/booking/999999' : '/booking/{{bookingid}}',
  headers: ['Accept: application/json'],
  why: after === 'missing' ? 'Negative test: GET an id that was never created.' : `GET is safe and idempotent: it reads booking {{bookingid}} → ${ID} without changing anything.`,
  server: `Route /booking/:id matched with id = ${after === 'missing' ? '999999' : ID}.`,
  db: after === 'deleted' ? `SELECT booking ${ID} → no row` : after === 'missing' ? 'SELECT booking 999999 → no row' : `SELECT booking ${ID} → found`,
  status: after === 'deleted' || after === 'missing' ? 404 : 200,
  resBody: after === 'deleted' || after === 'missing' ? 'Not Found' : BOOKING,
  verdict:
    after === 'missing'
      ? '404 Not Found: the URL is well-formed but no such resource exists. 404 is about the resource, 400 about the request itself.'
      : after === 'deleted'
      ? '404 Not Found: the booking is gone, so the DELETE really worked. Always verify a delete with a follow-up GET.'
      : after === 'kept'
        ? '200 OK: the booking still exists because the DELETE was rejected.'
        : '200 OK with the booking JSON. Assert the body matches what was POSTed, not just the status.',
  ask,
});

const put = (withAuth: boolean, ask?: string): Call => ({
  method: 'PUT',
  path: '/booking/{{bookingid}}',
  headers: withAuth ? [...JSON_H, 'Cookie: token={{token}}'] : JSON_H,
  body: BOOKING.replace('"Jim"', '"James"'),
  why: 'PUT replaces the whole booking (send every field; PATCH is for partial updates). It is idempotent: repeating it leaves the same state.',
  server: withAuth ? `Cookie token=${TOKEN} is valid, so the update is allowed.` : 'No Cookie or Authorization header: the auth check fails before any data is touched.',
  db: withAuth ? `UPDATE booking ${ID} SET firstname = "James"` : undefined,
  status: withAuth ? 200 : 403,
  resBody: withAuth ? BOOKING.replace('"Jim"', '"James"') : 'Forbidden',
  verdict: withAuth ? '200 OK with the updated booking.' : '403 Forbidden.',
  note: withAuth ? undefined : 'Good REST practice: 401 Unauthorized when credentials are missing, 403 Forbidden when they are valid but not allowed. Restful Booker sends 403 for both; worth raising in a bug report.',
  ask,
});

const del = (withAuth: boolean, ask?: string): Call => ({
  method: 'DELETE',
  path: '/booking/{{bookingid}}',
  headers: withAuth ? ['Cookie: token={{token}}'] : [],
  why: 'DELETE removes the booking. It is idempotent in effect: deleting twice leaves it deleted (the second call may return 404).',
  server: withAuth ? `Cookie token=${TOKEN} is valid.` : 'No token: rejected before the datastore is touched.',
  db: withAuth ? `DELETE booking ${ID}` : undefined,
  status: withAuth ? 201 : 403,
  resBody: withAuth ? 'Created' : 'Forbidden',
  verdict: withAuth ? '201 Created, with body "Created".' : '403 Forbidden: nothing was deleted.',
  note: withAuth
    ? 'Non-standard! 201 means a resource was CREATED. A delete should return 204 No Content (or 200 with a body). A classic interview bug: the docs document 201, so the test must assert the documented code and the defect is filed separately.'
    : undefined,
  ask,
});

const SCEN: Record<ScenarioId, { label: string; calls: (a: boolean) => Call[]; intro: string }> = {
  chain: {
    label: 'full CRUD chain',
    intro: 'A Postman collection run: each request reuses values saved by earlier ones ({{token}}, {{bookingid}}).',
    calls: (a) => [auth(), create(), get('created'), put(a, a ? undefined : 'This PUT has no token header. What status comes back?'), del(a, 'What status code will Restful Booker return for this DELETE?'), get(a ? 'deleted' : 'kept', 'GET the same id again. What status now?')],
  },
  create: {
    label: 'POST then GET',
    intro: 'Create a booking, save its id, read it back, then ask for an id that does not exist.',
    calls: () => [create('What status code do you expect for a successful create?'), get('created', 'GET /booking/{{bookingid}}: which id is actually requested?'), get('missing')],
  },
  update: {
    label: 'PUT with/without token',
    intro: 'Updating needs authentication: a token from POST /auth sent as Cookie: token=…',
    calls: (a) => [auth('Log in as admin. What status do you expect, and where will the token be?'), create(), put(a, a ? 'The Cookie header carries the saved token. What status comes back?' : 'This PUT carries no token. What status comes back?')],
  },
  delete: {
    label: 'DELETE then GET',
    intro: 'Delete a booking and verify it is really gone.',
    calls: (a) => [auth(), del(a, 'What status code will a successful DELETE return here?'), get(a ? 'deleted' : 'kept', 'GET the deleted id. What status now?')],
  },
  errors: {
    label: 'bad input (400 vs 500)',
    intro: 'Negative tests: what does the API do with broken input? Client mistakes should be 4xx, never 5xx.',
    calls: () => [
      {
        method: 'POST',
        path: '/booking',
        headers: JSON_H,
        body: '{"firstname": "Jim",',
        why: 'Malformed JSON: the body is cut off mid-object.',
        server: 'The JSON body parser throws before the route handler runs.',
        status: 400,
        resBody: 'Bad Request',
        verdict: '400 Bad Request: correct, the client sent unparseable JSON.',
        ask: 'The body is not valid JSON. Which status class do you expect: 4xx or 5xx?',
      },
      {
        method: 'POST',
        path: '/booking',
        headers: JSON_H,
        body: '{"firstname":"Jim"}',
        why: 'Valid JSON but required fields (lastname, totalprice, bookingdates…) are missing.',
        server: 'The handler assumes every field exists and crashes reading the missing ones.',
        status: 500,
        resBody: 'Internal Server Error',
        verdict: '500 Internal Server Error.',
        note: 'A bug: missing fields are a client error, so good practice is 400 (or 422) with a message naming the fields. A 5xx for bad input means validation is missing on the server.',
        ask: 'Now the JSON is valid but most fields are missing. What does Restful Booker return?',
      },
      {
        method: 'POST',
        path: '/auth',
        headers: ['Content-Type: application/json'],
        body: '{"username":"admin","password":"wrong"}',
        why: 'Wrong password.',
        server: 'Credentials checked: they do not match.',
        status: 200,
        resBody: '{"reason":"Bad credentials"}',
        verdict: '200 OK with {"reason":"Bad credentials"} and no token.',
        note: 'Another bug: failed login should be 401 Unauthorized. A test that only checks "status is 200" would pass here, so also assert that the token exists.',
      },
    ],
  },
};

export const SCENARIO_LABEL = Object.fromEntries(Object.entries(SCEN).map(([k, v]) => [k, v.label])) as Record<ScenarioId, string>;

const resolve = (p: string) => p.replace('{{bookingid}}', ID).replace('{{token}}', TOKEN);

export function simulate({ scenario, auth: withAuth }: Params): HttpFrame[] {
  const sc = SCEN[scenario];
  const calls = sc.calls(withAuth);
  const frames: HttpFrame[] = [];
  // scenarios that start mid-chain inherit earlier saved variables
  const vars: HttpFrame['vars'] = scenario === 'delete' ? { bookingid: ID } : {};
  const history: Done[] = [];
  const push = (f: Omit<HttpFrame, 'vars' | 'history'>) => frames.push({ ...f, vars: { ...vars }, history: [...history] });

  push({
    packet: 'client',
    dir: 'none',
    tag: '',
    caption: `${sc.intro}${scenario === 'delete' ? ` bookingid ${ID} was saved by an earlier POST.` : ''} Auth header ${withAuth ? 'ON' : 'OFF'} for PUT/DELETE.`,
  });

  for (const c of calls) {
    const line = `${c.method} ${resolve(c.path)} HTTP/1.1`;
    const reqLines = [line, ...c.headers.map(resolve), ...(c.body ? ['', c.body] : [])];
    const tag = `${c.method} ${c.path.replace('/{{bookingid}}', '/{id}')}`;
    const usesVar = c.path.includes('{{') || c.headers.some((h) => h.includes('{{'));
    push({
      packet: 'client',
      dir: 'req',
      tag,
      card: { kind: 'request', lines: reqLines },
      caption: `${c.why}${usesVar ? ` Postman substitutes {{…}} from saved variables before sending.` : ''}`,
      predict: c.ask,
    });
    push({ packet: 'server', dir: 'req', tag, card: { kind: 'request', lines: reqLines }, caption: `Request line, headers and body travel to the server. ${c.server}` });
    if (c.db) push({ packet: 'db', dir: 'req', tag, card: { kind: 'request', lines: reqLines }, caption: `Datastore: ${c.db}.` });
    const resLines = [`HTTP/1.1 ${c.status} ${STATUS_TEXT[c.status]}`, `Content-Type: ${c.resBody.startsWith('{') ? 'application/json' : 'text/plain'}; charset=utf-8`, '', c.resBody];
    history.push({ label: tag, status: c.status });
    push({
      packet: 'client',
      dir: 'res',
      tag: `${c.status} ${STATUS_TEXT[c.status]}`,
      status: c.status,
      card: { kind: 'response', lines: resLines },
      caption: `${c.verdict} ${c.status < 300 ? '2xx = success.' : c.status < 500 ? '4xx = the client sent something wrong.' : '5xx = the server failed.'}`,
    });
    if (c.save) {
      vars[c.save.name] = c.save.value;
      push({
        packet: 'client',
        dir: 'none',
        tag: '',
        status: c.status,
        card: { kind: 'response', lines: ['// Tests / post-response script', `pm.test("status ${c.status}", () => pm.response.to.have.status(${c.status}));`, c.save.script] },
        fresh: c.save.name,
        caption: `The post-response script saves ${c.save.name} = ${c.save.value}, so later requests can use {{${c.save.name}}} instead of a hard-coded value.`,
      });
    }
    if (c.note) push({ packet: 'client', dir: 'none', tag: '', status: c.status, card: { kind: 'response', lines: resLines }, caption: c.note });
  }
  const bugs = calls.filter((c) => c.note).length;
  push({
    packet: 'client',
    dir: 'none',
    tag: '',
    caption: `Run finished: ${history.map((h) => `${h.label} → ${h.status}`).join(', ')}.${bugs ? ' Spot the non-standard codes: they are great talking points in an API-testing interview.' : ''}`,
  });
  return frames;
}
