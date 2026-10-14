// Pure simulation of page.route (playwright.dev/docs/mock, /network, API Route):
// a route handler runs for every request whose WHOLE URL matches the glob (* = any chars except '/',
// ** = any chars including '/'). fulfill() answers without touching the network; abort() fails the
// request like a network error; continue() sends it on (optionally with changed headers) and the real
// response goes straight to the page; route.fetch() performs the request and hands the response back to the
// handler, which can patch it and fulfill({ response, json }). Routes only affect requests made after
// page.route() was registered.
import type { BaseFrame } from '../../core';

export type Handler = 'fulfill' | 'abort' | 'continue' | 'fetch';
export type UrlChoice = 'match' | 'nomatch';
export type Timing = 'before' | 'after';
export interface Params {
  handler: Handler;
  url: UrlChoice;
  timing: Timing;
}
export const PATTERN = '**/api/products*';
export const URLS: Record<UrlChoice, string> = {
  match: 'https://shop.test/api/products?cat=shoes',
  nomatch: 'https://shop.test/api/v2/products?cat=shoes',
};
export const HANDLER_CODE: Record<Handler, string[]> = {
  fulfill: ["route => route.fulfill({ json: [{ name: 'Mock shoe', price: 1 }] })"],
  abort: ['route => route.abort()   // network error'],
  continue: ["route => route.continue({ headers: { ...route.request().headers(), 'x-test': '1' } })"],
  fetch: ['async route => { const response = await route.fetch(); const json = await response.json();', '  json[0].price = 0; await route.fulfill({ response, json }); }'],
};
export const ASSERT: Record<Handler, string> = {
  fulfill: "await expect(page.getByText('Mock shoe')).toBeVisible();",
  abort: "await expect(page.getByText('Could not load products')).toBeVisible();",
  continue: "await expect(page.getByRole('listitem')).toHaveCount(3);",
  fetch: "await expect(page.getByText('Runner · FREE')).toBeVisible();",
};

export type Ui = 'blank' | 'loading' | 'mock' | 'error' | 'real' | 'patched';
export type At = 'page' | 'route' | 'server';
export interface Token {
  at: At;
  kind: 'req' | 'res';
  label: string;
  tone: 'accent' | 'good' | 'bad' | 'warn' | 'muted';
}
export interface Frame extends BaseFrame {
  routeOn: boolean;
  token: Token | null;
  match: 'idle' | 'match' | 'nomatch' | 'unrouted';
  handlerRan: boolean;
  serverHits: number;
  ui: Ui;
  line: number;
  status: 'running' | 'pass' | 'fail';
  header: boolean;
}

/** glob → RegExp per the docs: ** crosses '/', * does not, whole-URL match */
export function globToRegex(glob: string): RegExp {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*' && glob[i + 1] === '*') {
      re += '.*';
      i++;
    } else if (ch === '*') re += '[^/]*';
    else re += ch.replace(/[.+?^${}()|[\]\\/]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

export function codeLines({ handler, timing }: Params): string[] {
  const route = `await page.route('${PATTERN}', handler);`;
  const goto = "await page.goto('https://shop.test/shop');";
  return timing === 'before' ? [route, goto, ASSERT[handler]] : [goto, route, "await page.getByRole('button', { name: 'Refresh' }).click();", ASSERT[handler]];
}

export function simulate(p: Params): Frame[] {
  const { handler, url, timing } = p;
  const URL = URLS[url];
  const matches = globToRegex(PATTERN).test(URL);
  const frames: Frame[] = [];
  let s: Omit<Frame, 'caption' | 'predict'> = { routeOn: false, token: null, match: 'idle', handlerRan: false, serverHits: 0, ui: 'blank', line: -1, status: 'running', header: false };
  const push = (patch: Partial<Frame>, caption: string, predict?: string) => {
    s = { ...s, ...patch };
    frames.push({ ...s, caption, predict });
  };
  const L = codeLines(p);
  const lineOf = (needle: string) => L.findIndex((l) => l.includes(needle));
  const short = URL.replace('https://shop.test', '');
  let predictedHandler = false;

  push(
    {},
    `Pattern '${PATTERN}' must match the WHOLE URL: ** may span slashes, * may not. The app loads /shop, then fetches ${short}.`,
  );

  const docRequest = () => {
    push({ line: lineOf('goto'), token: { at: 'route', kind: 'req', label: 'GET /shop', tone: 'muted' }, match: s.routeOn ? 'nomatch' : 'unrouted' }, `goto(): the document request GET /shop ${s.routeOn ? `reaches the route layer; '${PATTERN}' does not match it, so it is not intercepted` : 'goes out; no route is registered yet'}.`);
    push({ token: { at: 'server', kind: 'req', label: 'GET /shop', tone: 'muted' } }, 'The real server receives the document request and returns the HTML.');
    push({ token: { at: 'page', kind: 'res', label: '200 HTML', tone: 'muted' }, ui: 'loading', match: 'idle' }, 'The page renders "Loading products…"; the load event fires and goto() resolves. The app script now calls fetch() for the product list.');
  };

  const apiRequest = (first: boolean) => {
    const routed = s.routeOn;
    push({ token: { at: 'page', kind: 'req', label: `GET ${short.slice(0, 22)}`, tone: 'accent' }, match: 'idle', handlerRan: false, header: false }, `The app sends GET ${short}.`);
    if (!routed) {
      push({ token: { at: 'route', kind: 'req', label: 'no route', tone: 'muted' }, match: 'unrouted' }, `No route is registered yet, so the request goes straight to the network${first && timing === 'after' ? ': the first request already went out' : ''}.`);
    } else {
      push(
        { token: { at: 'route', kind: 'req', label: matches ? 'matched' : 'no match', tone: matches ? 'accent' : 'warn' }, match: matches ? 'match' : 'nomatch' },
        matches
          ? `Glob check: ** matches "https://shop.test", /api/products is literal, * matches "?cat=shoes" (no slash). Match: the handler runs.`
          : `Glob check: after "/api/" the pattern needs "products", but the URL has "v2/products". * cannot cross "/", so no match: the handler never runs.`,
        `Does '${PATTERN}' match ${short}?`,
      );
    }
    const toServer = (label: string, header = false) => {
      push({ token: { at: 'server', kind: 'req', label, tone: header ? 'warn' : 'accent' }, serverHits: s.serverHits + 1, header }, `The real server receives the request${header ? ' with the extra x-test: 1 header' : ''} (server hits: ${s.serverHits + 1}).`);
    };
    if (!routed || !matches) {
      toServer(`GET ${short.slice(0, 18)}`);
      push(
        { token: { at: 'page', kind: 'res', label: '200 real JSON', tone: 'good' }, ui: 'real' },
        'The real response (Runner $80, Trail $95, Court $70) goes back to the page, which renders it.',
        routed && !matches && !predictedHandler ? `The test asserts: ${ASSERT[handler].replace('await ', '')} Will it pass?` : undefined,
      );
      return;
    }
    const hp: Record<Handler, string> = {
      fulfill: 'route.fulfill() is called. Will the real server see this request?',
      abort: 'route.abort() is called. What will the page show?',
      continue: 'route.continue() adds a header. Does the real response pass back through your handler?',
      fetch: 'route.fetch() is called. Where does the server response go first: to the page or to your handler?',
    };
    const pred = !predictedHandler ? hp[handler] : undefined;
    predictedHandler = true;
    if (handler === 'fulfill') {
      push({ token: { at: 'route', kind: 'res', label: 'mock 200', tone: 'good' }, handlerRan: true }, 'The handler calls route.fulfill({ json }). Playwright builds a 200 response right here; nothing is sent to the network.', pred);
      push({ token: { at: 'page', kind: 'res', label: 'mock JSON', tone: 'good' }, ui: 'mock' }, `The page receives the fake JSON and renders "Mock shoe $1". Server hits for the API stay at ${s.serverHits}.`);
    } else if (handler === 'abort') {
      push({ token: { at: 'route', kind: 'req', label: 'aborted ✗', tone: 'bad' }, handlerRan: true }, "The handler calls route.abort(): the request fails like a network error (error code 'failed'); it never reaches the server.", pred);
      push({ token: { at: 'page', kind: 'res', label: 'net::ERR_FAILED', tone: 'bad' }, ui: 'error' }, 'fetch() rejects with "Failed to fetch"; the app shows its error state: "Could not load products".');
    } else if (handler === 'continue') {
      push({ token: { at: 'route', kind: 'req', label: '+ x-test: 1', tone: 'warn' }, handlerRan: true, header: true }, 'The handler calls route.continue({ headers }): same URL, plus x-test: 1. (A cookie header here would be ignored in favour of the cookie store.)', pred);
      toServer('GET + x-test', true);
      push({ token: { at: 'page', kind: 'res', label: '200 real JSON', tone: 'good' }, ui: 'real' }, 'The real response goes straight back to the page; continue() gives the handler no chance to see or change it.');
    } else {
      push({ token: { at: 'route', kind: 'req', label: 'route.fetch()', tone: 'accent' }, handlerRan: true }, 'The handler calls route.fetch(): Playwright performs the real request on the handler\'s behalf and waits.', pred);
      toServer('GET (route.fetch)');
      push({ token: { at: 'route', kind: 'res', label: '200 → handler', tone: 'warn' } }, 'The real response comes back to the HANDLER, not the page: response.json() gives the 3 real products.');
      push({ token: { at: 'route', kind: 'res', label: 'price → 0', tone: 'warn' } }, 'The handler patches one field: json[0].price = 0. Everything else (status, headers, other items) stays real.');
      push({ token: { at: 'page', kind: 'res', label: 'patched JSON', tone: 'good' }, ui: 'patched' }, 'route.fulfill({ response, json }) sends the original response with the patched body. The page shows "Runner · FREE".');
    }
  };

  if (timing === 'before') {
    push({ line: 0, routeOn: true }, `page.route() registers the handler for '${PATTERN}' on this page before anything is requested.`);
    push({}, 'From now on every browser request from this page passes the route layer (routing also disables the HTTP cache). Calls made with the request fixture are not routed.');
    docRequest();
    apiRequest(true);
  } else {
    docRequest();
    apiRequest(true);
    push({ line: 1, routeOn: true, token: null, match: 'idle' }, `Only now is page.route() registered. The product list was already fetched from the real server.`, 'Does the product list on screen change now?');
    push({}, 'No. Routes are not retroactive: they only see requests made from now on. The page still shows the real data.');
    push({ line: 2, ui: s.ui, token: null }, 'The test clicks Refresh, so the app fetches the list again. This second request meets the route.');
    apiRequest(false);
  }

  const passes: Record<Handler, boolean> = {
    fulfill: s.ui === 'mock',
    abort: s.ui === 'error',
    continue: s.ui === 'real',
    fetch: s.ui === 'patched',
  };
  const ok = passes[handler];
  push(
    { line: L.length - 1, token: null, status: ok ? 'pass' : 'fail' },
    ok
      ? `${ASSERT[handler].replace('await ', '')} passes.${handler === 'continue' && !(matches && s.header) ? ' But the x-test header was never sent: the list is real either way, so this assertion cannot tell.' : ''}`
      : `${ASSERT[handler].replace('await ', '')} times out: the page shows ${s.ui === 'real' ? 'the real products' : s.ui} because the handler never ran for this URL.`,
  );
  const sum: string[] = [];
  sum.push(`API requests that reached the real server: ${s.serverHits}.`);
  if (!matches) sum.push(`Fix the pattern: '**/api/v2/products*', or a RegExp such as /\\/api\\/(v2\\/)?products/ to cover both.`);
  else if (timing === 'after') sum.push('Register routes before page.goto() so the very first request is caught.');
  else sum.push({ fulfill: 'fulfill = fake answer, server untouched.', abort: 'abort = simulate offline / blocked resources.', continue: 'continue = real round trip with edited request.', fetch: 'fetch + fulfill = real response with one field edited.' }[handler]);
  push({}, sum.join(' '));
  return frames;
}
