// Pure simulation of the official auth recipe (playwright.dev/docs/auth, /test-projects#dependencies):
// a `setup` project (testMatch /.*\.setup\.ts/) logs in through the UI once, waits for proof of login and
// writes page.context().storageState({ path: 'playwright/.auth/user.json' }). Testing projects declare
// dependencies: ['setup'] and use.storageState, so every test gets a NEW context preloaded with those
// cookies/localStorage. Multiple roles: one file per role, chosen per file with test.use({ storageState }).
// Expiry: "you need to delete the stored state when it expires"; with --no-deps (or UI mode, where setup does
// not run by default) a stale file is reused and every test lands on /login.
import type { BaseFrame } from '../../core';

export type Toggle = 'off' | 'on';
export interface Params {
  tests: number;
  roles: number;
  expire: Toggle;
}
export const LOGIN_S = 2;
export const BODY_S = 1;

export type TState = 'idle' | 'pass' | 'fail';
export type FileState = 'none' | 'fresh' | 'stale';
export interface Frame extends BaseFrame {
  phase: 'config' | 'skip' | 'setup' | 'saved' | 'tests' | 'done';
  files: FileState[];
  setupActive: number; // role index being logged in, -1 none
  tests: TState[];
  /** total seconds spent so far by each approach */
  uiTime: number;
  ssTime: number;
  ssWasted: number;
  uiLogins: number;
  ssLogins: number;
  /** a file token travels to the tests */
  token: boolean;
  url: string;
}

export const roleOf = (k: number, n: number, roles: number) => (roles === 2 && k < Math.ceil(n / 2) ? 1 : 0);
export const FILES = ['user.json', 'admin.json'];

export function simulate({ tests: N, roles, expire }: Params): Frame[] {
  const frames: Frame[] = [];
  const stale = expire === 'on';
  let s: Omit<Frame, 'caption' | 'predict'> = {
    phase: 'config',
    files: FILES.map((_, r) => (r < roles ? (stale ? 'stale' : 'none') : 'none')),
    setupActive: -1,
    tests: Array.from({ length: N }, () => 'idle'),
    uiTime: 0,
    ssTime: 0,
    ssWasted: 0,
    uiLogins: 0,
    ssLogins: 0,
    token: false,
    url: '',
  };
  const push = (patch: Partial<Frame>, caption: string, predict?: string) => {
    s = { ...s, token: false, setupActive: -1, ...patch };
    frames.push({ ...s, files: [...s.files], tests: [...s.tests], caption, predict });
  };
  const roleNames = roles === 2 ? 'admin.json and user.json' : 'user.json';
  const span = (a: number, b: number) => (a === b ? `Test ${a}` : `Tests ${a}–${b}`);

  push(
    {},
    `Config: a 'setup' project matches *.setup.ts; the 'chromium' project has dependencies: ['setup'] and use.storageState = 'playwright/.auth/user.json'${roles === 2 ? '; admin specs override it with test.use({ storageState: \'playwright/.auth/admin.json\' })' : ''}. ${N} tests.`,
  );

  const setup = (rerun: boolean) => {
    push({ phase: 'setup', url: '/' }, `${rerun ? 'Plain `npx playwright test`: ' : ''}the setup project runs FIRST because chromium depends on it. Its tests are ordinary tests, so they appear in the report and trace.`);
    for (let r = roles - 1; r >= 0; r--) {
      const who = r === 1 ? 'admin' : 'standard user';
      push(
        { phase: 'setup', setupActive: r, ssTime: s.ssTime + LOGIN_S, ssLogins: s.ssLogins + 1, url: '/inventory.html' },
        `auth.setup.ts logs in as ${who} through the UI (${LOGIN_S} s) and waits for proof of login (URL /inventory.html, "Products" visible) before saving.`,
      );
      const files = [...s.files];
      files[r] = 'fresh';
      push(
        { phase: 'saved', files, url: '' },
        `page.context().storageState({ path: 'playwright/.auth/${FILES[r]}' }) writes the cookies and localStorage of that logged-in context to JSON. (Gitignore playwright/.auth: it holds live session cookies.)`,
      );
    }
    push(
      { phase: 'saved' },
      `What was saved: { cookies: [{ name: 'session-username', … }], origins: [{ origin, localStorage: [...] }] }. sessionStorage is NOT included.`,
      `Setup passed. The ${N} tests now start. How many of them type a password?`,
    );
  };

  // test batches
  const B = Math.min(N, 8);
  const bounds = Array.from({ length: B + 1 }, (_, b) => Math.round((b * N) / B));
  const runBatches = (ok: boolean, maxBatches = B) => {
    for (let b = 0; b < maxBatches; b++) {
      const tests = [...s.tests];
      const n = bounds[b + 1] - bounds[b];
      for (let k = bounds[b]; k < bounds[b + 1]; k++) tests[k] = ok ? 'pass' : 'fail';
      const done = bounds[b + 1];
      const patch: Partial<Frame> = {
        phase: 'tests',
        tests,
        token: true,
        uiTime: ok ? done * (LOGIN_S + BODY_S) : s.uiTime,
        uiLogins: ok ? done : s.uiLogins,
        ssTime: s.ssTime + (ok ? n * BODY_S : 0),
        ssWasted: s.ssWasted + (ok ? 0 : n * BODY_S),
        url: ok ? '/inventory.html' : '/login',
      };
      let caption: string;
      let predict: string | undefined;
      if (!ok) {
        caption =
          b === 0
            ? `${span(bounds[b] + 1, done)}: each new context is preloaded with the stale JSON. The server no longer accepts that session, redirects to /login, and expect(page).toHaveURL(/inventory/) fails.`
            : `${span(bounds[b] + 1, done)}: same file, same expired cookie, same redirect to /login. Retries would load the same stale file and fail again.`;
        if (b === 0) predict = 'Would adding retries: 2 make these tests pass?';
      } else if (b === 0) {
        caption = `${span(bounds[b] + 1, done)}: Playwright creates a NEW context per test, preloaded from ${roles === 2 ? 'admin.json or user.json (whichever its file\'s test.use names)' : 'user.json'}; page.goto('/inventory.html') opens logged in. No password typed. The UI-login approach pays ${LOGIN_S} s per test instead.`;
      } else {
        caption = `${span(bounds[b] + 1, done)} pass, each in its own fresh context${roles === 2 ? ' (admin specs load admin.json, the rest user.json)' : ''}. Logins so far: ${s.ssLogins} with storageState vs ${done} with UI login per test.`;
        if (b === Math.floor(B / 2)) predict = `With ${N} tests, how many seconds does UI-login-per-test spend just logging in?`;
      }
      push(patch, caption, predict);
    }
  };

  if (stale) {
    push(
      { phase: 'skip' },
      `You run \`npx playwright test --no-deps\` (or use UI mode, where the setup project does not run by default). Setup is skipped, so the ${roleNames} saved days ago ${roles === 2 ? 'are' : 'is'} reused.`,
      'The file still exists and still contains a cookie. Will the tests start logged in?',
    );
    runBatches(false, Math.min(2, B));
    const tests = s.tests.map(() => 'fail' as TState);
    push(
      { phase: 'tests', tests, ssWasted: s.ssWasted + (N - bounds[Math.min(2, B)]) * BODY_S },
      `The whole run is red: ${N} failed, all redirected to /login. The docs: "you need to delete the stored state when it expires". The fix is to refresh the file, not to retry.`,
    );
    push({ tests: s.tests.map(() => 'idle'), files: s.files.map((f) => (f === 'stale' ? 'none' : f)) }, `Delete the stale ${roleNames} and run again with dependencies, so the setup project logs in and writes a fresh file.`);
    setup(true);
  } else {
    setup(false);
  }
  runBatches(true);
  push(
    {},
    `Login-form tests are the exception: they opt out with test.use({ storageState: { cookies: [], origins: [] } }) and start logged out, so the login UI is still tested.`,
  );
  const saved = s.uiTime - s.ssTime;
  push(
    { phase: 'done' },
    `Done: ${N} tests. UI login per test: ${s.uiLogins} logins, ${s.uiTime} s. storageState: ${s.ssLogins} login${s.ssLogins > 1 ? 's' : ''}, ${s.ssTime} s (${saved} s saved). Every test still had its own isolated context.`,
  );
  return frames;
}
