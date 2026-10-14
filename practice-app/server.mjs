// QA Shop: a tiny practice web application for the Playwright Lab.
//
//   node practice-app/server.mjs                 → correct app on http://localhost:4400
//   PORT=4500 BUGS=some-id node practice-app/server.mjs
//
// No dependencies (node:http only). All data is in memory and deterministic.
// Each browser (Playwright browser context) gets its own session cookie, so its cart,
// promo code and checkout details never interfere with another test running in parallel.
//
// BUGS switches on deliberately seeded defects ("mutants") used by the judge
// (scripts/judge.mjs). Leave it empty when you explore or test the app.

import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 4400);
const BUGS = new Set(
  (process.env.BUGS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const bug = (id) => BUGS.has(id);
const PUBLIC_DIR = fileURLToPath(new URL('./public/', import.meta.url));

// ---------- data ----------
const USERS = {
  alice: { password: 'Secret123!', locked: false },
  bob: { password: 'Secret123!', locked: false },
  locked_user: { password: 'Secret123!', locked: true },
};

/** prices are stored in cents to avoid floating-point surprises */
const PRODUCTS = [
  { id: 1, name: 'Aero Backpack', price: 4999, category: 'Accessories' },
  { id: 2, name: 'Bolt T-Shirt', price: 1599, category: 'Clothing' },
  { id: 3, name: 'Classic Hoodie', price: 3950, category: 'Clothing' },
  { id: 4, name: 'Desk Lamp', price: 2400, category: 'Home' },
  { id: 5, name: 'Explorer Jacket', price: 12000, category: 'Clothing' },
  { id: 6, name: 'Fleece Beanie', price: 999, category: 'Accessories' },
  { id: 7, name: 'iPhone Case', price: 799, category: 'Electronics' },
  { id: 8, name: 'Noise-Cancelling Headphones', price: 19900, category: 'Electronics' },
  { id: 9, name: 'Water Bottle', price: 1250, category: 'Home' },
  { id: 10, name: 'Wireless Mouse', price: 2999, category: 'Electronics' },
  { id: 11, name: 'Sport Socks', price: 949, category: 'Clothing' },
  { id: 12, name: 'Canvas Tote', price: 1250, category: 'Accessories' },
];

const PROMOS = {
  SAVE10: { kind: 'percent', value: 10, minCents: 0, expired: false },
  FLAT20: { kind: 'fixed', value: 2000, minCents: 10000, expired: false },
  WELCOME5: { kind: 'percent', value: 5, minCents: 0, expired: true },
};

const TAX_RATE = 8; // percent
const MAX_QTY = 10;

// ---------- state ----------
/** @type {Map<string, {user: string|null, cart: Map<number, number>, promos: string[], details: object|null}>} */
const sessions = new Map();
/** API bearer tokens → username */
const tokens = new Map();
/** all orders (UI and API), keyed by id */
const orders = new Map();
let nextOrderNo = 100001;

const newSession = () => ({ user: null, cart: new Map(), promos: [], details: null });

// ---------- helpers ----------
const dollars = (cents) => Math.round(cents) / 100;
const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

function cartItems(cart) {
  return [...cart.entries()].map(([productId, quantity]) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    return { productId, name: p.name, price: dollars(p.price), quantity, lineTotal: dollars(p.price * quantity), _cents: p.price * quantity };
  });
}

function totals(items, promoCodes) {
  const subtotal = items.reduce((a, it) => a + it._cents, 0);
  let discount = 0;
  for (const code of promoCodes) {
    const promo = PROMOS[code.toUpperCase()] ?? PROMOS[code];
    if (!promo) continue;
    discount += promo.kind === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
  }
  discount = Math.min(discount, subtotal);
  const taxable = subtotal - discount;
  const taxBase = bug('total-tax-before-discount') ? subtotal : taxable;
  const rawTax = (taxBase * TAX_RATE) / 100;
  const tax = bug('total-rounding') ? Math.floor(rawTax) : Math.round(rawTax);
  return { subtotal, discount, tax, total: taxable + tax };
}

function publicItems(items) {
  return items.map(({ _cents, ...rest }) => rest);
}

function summary(s) {
  const items = cartItems(s.cart);
  const t = totals(items, s.promos);
  return {
    items: publicItems(items),
    count: items.reduce((a, it) => a + it.quantity, 0),
    promoCodes: s.promos,
    subtotal: dollars(t.subtotal),
    discount: dollars(t.discount),
    tax: dollars(t.tax),
    total: dollars(t.total),
    taxRate: TAX_RATE,
    details: s.details,
  };
}

function createOrder(owner, items, promoCodes, via) {
  const t = totals(items, promoCodes);
  const id = `QS-${nextOrderNo++}`;
  const order = {
    id,
    owner,
    via,
    status: 'placed',
    items: publicItems(items),
    promoCodes: [...promoCodes],
    subtotal: dollars(t.subtotal),
    discount: dollars(t.discount),
    tax: dollars(t.tax),
    total: dollars(t.total),
  };
  orders.set(id, order);
  return order;
}

/** shared by the UI login and the REST API login */
function checkCredentials(username, password) {
  const u = String(username ?? '').trim();
  const pw = String(password ?? '');
  if (!u) return { status: 400, error: 'Username is required' };
  if (!pw && !bug('login-empty-password')) return { status: 400, error: 'Password is required' };
  const name = u.toLowerCase();
  const user = USERS[name];
  const pwOk = user && (bug('login-password-case') ? user.password.toLowerCase() === pw.toLowerCase() : user.password === pw);
  const emptyPwBug = bug('login-empty-password') && user && !pw;
  if (!user || (!pwOk && !emptyPwBug)) return { status: 401, error: 'Invalid username or password' };
  if (user.locked && !bug('login-locked')) return { status: 403, error: 'Sorry, this account has been locked.' };
  return { status: 200, username: name };
}

function validateDetails(body) {
  const v = (k) => String(body?.[k] ?? '');
  const errors = {};
  const first = bug('checkout-whitespace-name') ? v('firstName') : v('firstName').trim();
  if (!first) errors.firstName = 'First name is required';
  if (!v('lastName').trim() && !bug('checkout-lastname-required')) errors.lastName = 'Last name is required';
  const email = v('email').trim();
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address';
  const phone = v('phone').trim();
  const digits = phone.replace(/ /g, '');
  if (!phone) errors.phone = 'Phone number is required';
  else if (!(bug('checkout-phone-length') ? /^\d{10,11}$/ : /^\d{10}$/).test(digits)) errors.phone = 'Enter a 10-digit phone number';
  const postcode = v('postcode').trim();
  if (!postcode) errors.postcode = 'Postcode is required';
  else if (!(bug('checkout-postcode-letters') ? /^[1-9][0-9a-z]{5}$/i : /^[1-9]\d{5}$/).test(postcode))
    errors.postcode = 'Enter a valid 6-digit postcode';
  return { errors, details: { firstName: first, lastName: v('lastName').trim(), email, phone, postcode } };
}

// ---------- http plumbing ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function send(res, status, body, headers = {}) {
  if (body === undefined || status === 204) {
    res.writeHead(status, headers);
    return res.end();
  }
  const text = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(text);
}
const err = (res, status, error) => send(res, status, { error });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('bad json'));
      }
    });
    req.on('error', reject);
  });
}

function getSession(req, res) {
  const m = /(?:^|;\s*)qs_sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  let sid = m?.[1];
  if (!sid || !sessions.has(sid)) {
    sid = randomBytes(12).toString('hex');
    sessions.set(sid, newSession());
    res.setHeader('Set-Cookie', `qs_sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return sessions.get(sid);
}

function bearerUser(req) {
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || '');
  return m ? tokens.get(m[1]) ?? null : null;
}

function redirect(res, to) {
  res.writeHead(302, { Location: to, 'Cache-Control': 'no-store' });
  res.end();
}

async function serveStatic(res, pathname) {
  const rel = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) return err(res, 404, 'Not found');
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><title>Not found</title><h1>Page not found</h1><p><a href="/">Back to QA Shop</a></p>');
  }
}

const PROTECTED_PAGES = new Set(['/inventory.html', '/cart.html', '/checkout.html', '/review.html', '/confirmation.html', '/receipt.html']);

// ---------- routes ----------
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;
  const s = getSession(req, res);

  // client-side bug switches (empty on the correct app)
  if (path === '/js/bugs.js') {
    res.writeHead(200, { 'Content-Type': TYPES['.js'], 'Cache-Control': 'no-store' });
    return res.end(`window.QS_BUGS = ${JSON.stringify([...BUGS])};\n`);
  }

  if (!path.startsWith('/api/')) {
    if (method !== 'GET' && method !== 'HEAD') return err(res, 405, 'Method not allowed');
    if (PROTECTED_PAGES.has(path) && !s.user) return redirect(res, '/');
    if (path === '/checkout.html' && s.cart.size === 0) return redirect(res, '/cart.html');
    if (path === '/review.html') {
      if (s.cart.size === 0) return redirect(res, '/cart.html');
      if (!s.details) return redirect(res, '/checkout.html');
    }
    return serveStatic(res, path);
  }

  let body = {};
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      body = await readBody(req);
    } catch {
      return err(res, 400, 'Request body must be valid JSON');
    }
    if (body === null || typeof body !== 'object' || Array.isArray(body)) return err(res, 400, 'Request body must be a JSON object');
  }

  // ----- misc -----
  if (path === '/api/health' && method === 'GET') return send(res, 200, { ok: true });
  if (path === '/api/test/reset' && method === 'POST') {
    Object.assign(s, newSession());
    return send(res, 204);
  }

  // ----- products (public) -----
  if (path === '/api/products' && method === 'GET') {
    const cat = url.searchParams.get('category');
    const list = PRODUCTS.filter((p) => !cat || p.category.toLowerCase() === cat.toLowerCase());
    return send(res, 200, list.map((p) => ({ ...p, price: dollars(p.price) })));
  }
  let m = /^\/api\/products\/([^/]+)$/.exec(path);
  if (m && method === 'GET') {
    const p = PRODUCTS.find((x) => String(x.id) === m[1]);
    if (!p) return bug('api-product-404') ? send(res, 200, { error: 'Product not found' }) : err(res, 404, 'Product not found');
    return send(res, 200, { ...p, price: dollars(p.price) });
  }

  // ----- UI session (cookie) -----
  if (path === '/api/session' && method === 'GET') return send(res, 200, { username: s.user });
  if (path === '/api/session/login' && method === 'POST') {
    const r = checkCredentials(body.username, body.password);
    if (r.status !== 200) return err(res, r.status, r.error);
    s.user = r.username;
    return send(res, 200, { username: r.username });
  }
  if (path === '/api/session/logout' && method === 'POST') {
    if (!bug('login-logout')) Object.assign(s, newSession());
    return send(res, 204);
  }

  // ----- REST API with bearer tokens -----
  if (path === '/api/login' && method === 'POST') {
    if (!body.username || !body.password) return err(res, 400, 'username and password are required');
    const r = checkCredentials(body.username, body.password);
    if (r.status !== 200) return err(res, r.status === 400 ? 400 : r.status, r.error);
    const token = randomBytes(16).toString('hex');
    tokens.set(token, r.username);
    return send(res, 200, { token, username: r.username });
  }
  if (path === '/api/orders') {
    const user = bearerUser(req);
    if (method === 'GET') {
      if (!user && !bug('api-no-token')) return err(res, 401, 'Authentication required');
      return send(res, 200, [...orders.values()].filter((o) => o.owner === user));
    }
    if (method === 'POST') {
      if (!user) return err(res, 401, 'Authentication required');
      const items = body.items;
      if (!Array.isArray(items) || items.length === 0) return err(res, 400, 'items must be a non-empty array');
      const cart = new Map();
      for (const it of items) {
        const p = PRODUCTS.find((x) => x.id === it?.productId);
        if (!p) return err(res, 400, `Unknown productId: ${JSON.stringify(it?.productId)}`);
        const q = it.quantity;
        const max = bug('api-qty-validation') ? 99 : MAX_QTY;
        if (!Number.isInteger(q) || q < 1 || q > max) return err(res, 400, `quantity must be a whole number from 1 to ${MAX_QTY}`);
        cart.set(p.id, (cart.get(p.id) ?? 0) + q);
      }
      const order = createOrder(user, cartItems(cart), [], 'api');
      return send(res, bug('api-create-status') ? 200 : 201, order, { Location: `/api/orders/${order.id}` });
    }
    return err(res, 405, 'Method not allowed');
  }
  m = /^\/api\/orders\/([^/]+)$/.exec(path);
  if (m) {
    const user = bearerUser(req);
    if (!user) return err(res, 401, 'Authentication required');
    const order = orders.get(decodeURIComponent(m[1]));
    if (method === 'GET') {
      if (!order || order.owner !== user) return err(res, 404, 'Order not found');
      return send(res, 200, order);
    }
    if (method === 'DELETE') {
      if (!order || (order.owner !== user && !bug('api-delete-other'))) return err(res, 404, 'Order not found');
      orders.delete(order.id);
      return send(res, 204);
    }
    return err(res, 405, 'Method not allowed');
  }

  // everything below needs a signed-in UI session
  if (!s.user) return err(res, 401, 'Please sign in first');

  // ----- cart -----
  if (path === '/api/cart' && method === 'GET') return send(res, 200, summary(s));
  if (path === '/api/cart' && method === 'DELETE') {
    s.cart.clear();
    s.promos = [];
    return send(res, 200, summary(s));
  }
  if (path === '/api/cart/items' && method === 'POST') {
    const p = PRODUCTS.find((x) => x.id === Number(body.productId));
    if (!p) return err(res, 404, 'Product not found');
    const add = body.quantity === undefined ? 1 : body.quantity;
    if (!Number.isInteger(add) || add < 1) return err(res, 400, 'Quantity must be between 1 and 10');
    const next = (s.cart.get(p.id) ?? 0) + add;
    if (next > MAX_QTY) return err(res, 400, `You can have at most ${MAX_QTY} of each product`);
    s.cart.set(p.id, next);
    return send(res, 200, summary(s));
  }
  m = /^\/api\/cart\/items\/(\d+)$/.exec(path);
  if (m) {
    const id = Number(m[1]);
    if (!s.cart.has(id)) return err(res, 404, 'That product is not in your cart');
    if (method === 'PUT') {
      const q = Number(body.quantity);
      const max = bug('cart-qty-upper') ? MAX_QTY + 1 : MAX_QTY;
      if (!Number.isInteger(q) || q < 1 || q > max) return err(res, 400, 'Quantity must be between 1 and 10');
      s.cart.set(id, q);
      return send(res, 200, summary(s));
    }
    if (method === 'DELETE') {
      s.cart.delete(id);
      if (s.cart.size === 0) s.promos = [];
      return send(res, 200, summary(s));
    }
  }

  // ----- checkout -----
  if (path === '/api/checkout/details' && method === 'POST') {
    if (s.cart.size === 0) return err(res, 400, 'Your cart is empty');
    const { errors, details } = validateDetails(body);
    if (Object.keys(errors).length) return send(res, 400, { error: 'Please fix the highlighted fields', errors });
    s.details = details;
    return send(res, 200, { details });
  }
  if (path === '/api/checkout/summary' && method === 'GET') return send(res, 200, summary(s));
  if (path === '/api/checkout/promo' && method === 'POST') {
    const raw = String(body.code ?? '').trim();
    if (!raw) return err(res, 400, 'Enter a promo code');
    const code = bug('promo-case') ? raw : raw.toUpperCase();
    const promo = Object.hasOwn(PROMOS, code) ? PROMOS[code] : undefined;
    if (!promo) return err(res, 400, 'Promo code is not valid');
    if (s.promos.length > 0 && !bug('promo-stack')) return err(res, 400, 'Only one promo code can be used per order');
    if (promo.expired && !bug('promo-expired')) return err(res, 400, 'This promo code has expired');
    const subtotal = cartItems(s.cart).reduce((a, it) => a + it._cents, 0);
    if (promo.minCents && !bug('promo-min-ignored')) {
      const ok = bug('promo-min-boundary') ? subtotal > promo.minCents : subtotal >= promo.minCents;
      if (!ok) return err(res, 400, `${code} needs an items subtotal of at least ${fmt(promo.minCents)}`);
    }
    s.promos.push(code);
    return send(res, 200, summary(s));
  }
  if (path === '/api/checkout/promo' && method === 'DELETE') {
    s.promos = [];
    return send(res, 200, summary(s));
  }
  if (path === '/api/checkout/place' && method === 'POST') {
    if (s.cart.size === 0) return err(res, 400, 'Your cart is empty');
    if (!s.details) return err(res, 400, 'Shipping details are missing');
    const order = createOrder(s.user, cartItems(s.cart), s.promos, 'ui');
    order.shipTo = s.details;
    if (!bug('order-cart-not-cleared')) {
      s.cart.clear();
      s.promos = [];
    }
    return send(res, 201, { orderId: order.id });
  }
  m = /^\/api\/my-orders\/([^/]+)$/.exec(path);
  if (m && method === 'GET') {
    const order = orders.get(decodeURIComponent(m[1]));
    if (!order || order.owner !== s.user) return err(res, 404, 'Order not found');
    return send(res, 200, order);
  }

  return err(res, 404, 'Not found');
}

const onRequest = (req, res) => {
  handle(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) err(res, 500, 'Internal server error');
    else res.end();
  });
};

// Listen on the IPv4 and the IPv6 loopback so "localhost" works whichever one it resolves to.
// (Loopback only: the practice app is never exposed to your network.)
const servers = [http.createServer(onRequest), http.createServer(onRequest)];
servers[0].on('error', (e) => {
  console.error(`Could not start QA Shop on port ${PORT}: ${e.message}`);
  process.exit(1);
});
servers[1].on('error', () => {}); // no IPv6 on this machine: IPv4 is enough
servers[0].listen(PORT, '127.0.0.1', () => {
  servers[1].listen(PORT, '::1');
  const label = BUGS.size ? ` (BUGS: ${[...BUGS].join(', ')})` : '';
  console.log(`QA Shop running at http://localhost:${PORT}${label}`);
});

const stop = () => {
  for (const srv of servers) {
    srv.closeAllConnections?.();
    srv.close();
  }
  setTimeout(() => process.exit(0), 50).unref();
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
