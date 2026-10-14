// Pure simulation of one `npx playwright test` run (playwright.dev/docs/browser-contexts, /test-parallel, /test-cli).
// The runner reads the config, starts N worker processes; each worker launches ONE browser (worker-scoped
// `browser` fixture) and reuses it for every test it runs. Every test gets a brand-new BrowserContext
// (test-scoped `context` fixture: empty cookies/storage) and a Page; the context is closed after the test.
// Files are the unit of distribution (fullyParallel off): a free worker takes the next whole file.
import type { BaseFrame } from '../../core';

export type Toggle = 'off' | 'on';
export type Mode = 'headless' | 'headed';
export interface Params {
  workers: number;
  twoUsers: Toggle;
  mode: Mode;
}

export interface Ctx {
  label: string;
  /** session cookie in this context's own jar */
  cookie: string | null;
}
export interface Worker {
  id: number;
  spawned: boolean;
  browser: boolean;
  file: string | null;
  test: string | null;
  contexts: Ctx[];
  wire: 'none' | 'down' | 'up';
  cmd: string;
  ran: number;
}
export interface Frame extends BaseFrame {
  stage: 'cli' | 'config' | 'spawn' | 'launch' | 'run' | 'collect' | 'report';
  workers: Worker[];
  passed: number;
  total: number;
  report: boolean;
}

interface TestDef {
  file: string;
  title: string;
  ctx: { label: string; cookie: string | null }[];
  down: string;
  up: string;
  result: string;
}

export function suite(twoUsers: Toggle): { file: string; tests: TestDef[] }[] {
  const std = 'session-username=standard_user';
  return [
    {
      file: 'login.spec.ts',
      tests: [
        { file: 'login.spec.ts', title: 'valid login', ctx: [{ label: 'context', cookie: std }], down: "goto('/') · fill · click Login", up: '→ /inventory.html, cookie set', result: 'the app sets a session cookie in this context only' },
        { file: 'login.spec.ts', title: 'locked-out user', ctx: [{ label: 'context', cookie: null }], down: 'fill locked_out_user · click Login', up: '← error banner, no cookie', result: 'the error banner appears and no cookie is stored' },
      ],
    },
    {
      file: 'cart.spec.ts',
      tests: [{ file: 'cart.spec.ts', title: 'add to cart', ctx: [{ label: 'context', cookie: std }], down: 'login · click Add to cart', up: '← badge shows 1, cookie set', result: 'the cart badge shows 1' }],
    },
    {
      file: 'chat.spec.ts',
      tests: [
        twoUsers === 'on'
          ? {
              file: 'chat.spec.ts',
              title: 'buyer ↔ seller chat',
              ctx: [
                { label: 'buyer ctx', cookie: 'user=buyer' },
                { label: 'seller ctx', cookie: 'user=seller' },
              ],
              down: 'pageA: login buyer · pageB: login seller',
              up: '← two separate cookies',
              result: 'buyer and seller each get their own cookie; neither context can see the other',
            }
          : { file: 'chat.spec.ts', title: 'chat page loads', ctx: [{ label: 'context', cookie: std }], down: "login · goto('/chat')", up: '← chat visible, cookie set', result: 'the chat page renders' },
      ],
    },
  ];
}

/** greedy file → worker assignment: the least-loaded worker takes the next file */
export function assign(W: number, twoUsers: Toggle): TestDef[][] {
  const q: TestDef[][] = Array.from({ length: W }, () => []);
  for (const f of suite(twoUsers)) {
    let best = 0;
    for (let k = 1; k < W; k++) if (q[k].length < q[best].length) best = k;
    q[best].push(...f.tests);
  }
  return q;
}

export function simulate({ workers: W, twoUsers, mode }: Params): Frame[] {
  const queues = assign(W, twoUsers);
  const total = queues.reduce((s, q) => s + q.length, 0);
  const rounds = Math.max(...queues.map((q) => q.length));
  const frames: Frame[] = [];
  let workers: Worker[] = Array.from({ length: W }, (_, k) => ({ id: k + 1, spawned: false, browser: false, file: null, test: null, contexts: [], wire: 'none', cmd: '', ran: 0 }));
  let passed = 0;
  const push = (stage: Frame['stage'], caption: string, predict?: string, report = false) =>
    frames.push({ stage, workers: workers.map((w) => ({ ...w, contexts: w.contexts.map((c) => ({ ...c })) })), passed, total, report, caption, predict });

  push('cli', `You type \`npx playwright test\`${mode === 'headed' ? ' --headed' : ''}. The Node.js test runner starts; no browser exists yet.`);
  push(
    'config',
    `The runner reads playwright.config.ts: testDir, workers: ${W}, projects: [chromium], reporter: 'html', headless: ${mode === 'headless'}. It finds ${total} tests in 3 files.`,
    `${total} tests, ${W} worker${W > 1 ? 's' : ''}. How many browsers will Playwright launch: ${total}, ${W}, or 1?`,
  );
  workers = workers.map((w) => ({ ...w, spawned: true }));
  push('spawn', `The runner starts ${W} worker process${W > 1 ? 'es' : ''} (separate OS processes). Each takes a whole file at a time: ${queues.map((q, k) => `worker ${k + 1} → ${[...new Set(q.map((t) => t.file))].join(', ')}`).join('; ')}.`);
  workers = workers.map((w) => ({ ...w, browser: true }));
  push(
    'launch',
    `Each worker launches ONE Chromium (the worker-scoped \`browser\` fixture) and keeps a connection to it open: ${W} browser${W > 1 ? 's' : ''} in total. ${
      mode === 'headless' ? 'Headless: same engine, no window is drawn (the default, fastest).' : 'Headed: each browser opens a visible window; handy for debugging, slower on CI.'
    }`,
  );

  for (let r = 0; r < rounds; r++) {
    const active = queues.map((q, k) => (q[r] ? k : -1)).filter((k) => k >= 0);
    const tests = active.map((k) => queues[k][r]);
    const two = tests.find((t) => t.ctx.length > 1);
    const names = tests.map((t, j) => `worker ${active[j] + 1}: "${t.title}"`).join(', ');
    workers = workers.map((w, k) => {
      const t = queues[k][r];
      if (!t) return { ...w, test: null, file: null, contexts: [], wire: 'none', cmd: '' };
      return { ...w, file: t.file, test: t.title, contexts: t.ctx.map((c) => ({ label: c.label, cookie: null })), wire: 'none', cmd: '' };
    });
    push(
      'run',
      `${active.length > 1 ? 'In parallel, ' : ''}${names}. ${
        two
          ? 'The chat test asks only for `browser`, so it calls browser.newContext() twice: two empty cookie jars in the same browser, each with its own page. '
          : ''
      }${r > 0 ? 'Same browser as before, but a brand-new context with an EMPTY cookie jar.' : 'Every test gets a fresh BrowserContext (empty cookies/storage) and a Page in it.'}`,
    );
    workers = workers.map((w, k) => (queues[k][r] ? { ...w, wire: 'down', cmd: queues[k][r].down } : w));
    push(
      'run',
      `The test code (in the worker) sends each action over the wire as a protocol message; the browser performs it: ${tests.map((t) => t.down).join('; ')}.`,
      two ? 'The buyer logs in inside the buyer context. Will the seller page, in the same browser, see the buyer\'s cookie?' : undefined,
    );
    workers = workers.map((w, k) => {
      const t = queues[k][r];
      return t ? { ...w, wire: 'up', cmd: t.up, contexts: t.ctx.map((c) => ({ ...c })) } : w;
    });
    push('run', `Results come back over the same connection: ${tests.map((t) => t.result).join('; ')}. Cookies live in the context, not the browser.`);
    passed += active.length;
    workers = workers.map((w, k) => (queues[k][r] ? { ...w, contexts: [], wire: 'none', cmd: '', ran: w.ran + 1, test: `${queues[k][r].title} ✓` } : w));
    const nextRound = r + 1 < rounds;
    push(
      'run',
      `Test${active.length > 1 ? 's' : ''} passed. ${two ? (active.length > 1 ? 'The fixture closes each default context; the chat test closes the two it created itself.' : 'The chat test closes the two contexts it created itself.') : 'The `context` fixture closes the context.'} Their cookies are thrown away; the browser stays up for the next test.`,
      r === 0 && nextRound
        ? `Worker 1 now runs "${queues[0][1]?.title ?? queues.find((q) => q[1])![1].title}" in the same browser that just logged someone in. Will that test start logged in?`
        : undefined,
    );
  }

  workers = workers.map((w) => ({ ...w, browser: false, test: null, file: null }));
  push('collect', `All files done. Workers close their browsers and exit; each worker had already streamed its results to the runner process.`);
  push('report', `The html reporter writes playwright-report/index.html: ${passed}/${total} passed. Open it with \`npx playwright show-report\`.`, undefined, true);
  push(
    'report',
    `Summary: ${W} worker${W > 1 ? 's' : ''} → ${W} browser${W > 1 ? 's' : ''}, ${total} tests → ${total + (twoUsers === 'on' ? 1 : 0)} contexts, wall time ≈ ${rounds} test-length${rounds > 1 ? 's' : ''}. Isolation comes from a new context per test, not from cleanup code.`,
    undefined,
    true,
  );
  return frames;
}
