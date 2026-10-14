// Pure simulation of how one UI change ripples through a suite with and without a Page Object Model
// (playwright.dev/docs/pom: page objects "simplify maintenance" by keeping selectors in one place).
// Six spec files log in. Without POM each spec holds its own copy of the login locators/steps; with POM
// every spec calls loginPage.login(), and LoginPage owns the locators. The change breaks the same tests in
// both cases; what differs is how many places must be edited to fix them.
import type { BaseFrame } from '../../core';

export type Pom = 'off' | 'on';
export type Change = 'rename' | 'id' | 'mfa';
export interface Params {
  pom: Pom;
  change: Change;
}
export const SPECS = ['login.spec.ts', 'cart.spec.ts', 'checkout.spec.ts', 'inventory.spec.ts', 'sort.spec.ts', 'logout.spec.ts'];
export type SpecState = 'pass' | 'fail' | 'idle' | 'edited';

export interface ChangeInfo {
  title: string;
  /** locator/step that breaks, before and after the fix */
  before: string;
  after: string;
  /** which of the three login locators breaks (-1 = the flow itself) */
  broken: number;
  error: string;
  linesPerEdit: number;
  dom: { userId: string; button: string; mfa: boolean };
}
export const CHANGES: Record<Change, ChangeInfo> = {
  rename: {
    title: "the Login button is renamed to 'Sign in'",
    before: "getByRole('button', { name: 'Login' })",
    after: "getByRole('button', { name: 'Sign in' })",
    broken: 2,
    error: "Test timeout of 30000ms exceeded. waiting for getByRole('button', { name: 'Login' })",
    linesPerEdit: 1,
    dom: { userId: 'user-name', button: 'Sign in', mfa: false },
  },
  id: {
    title: 'the username input id changes from user-name to username',
    before: "locator('#user-name')",
    after: "getByPlaceholder('Username')",
    broken: 0,
    error: "Test timeout of 30000ms exceeded. waiting for locator('#user-name')",
    linesPerEdit: 1,
    dom: { userId: 'username', button: 'Login', mfa: false },
  },
  mfa: {
    title: 'a new MFA step asks for a one-time code after Login',
    before: '(no OTP step)',
    after: "getByLabel('One-time code').fill(otp) + Verify",
    broken: -1,
    error: 'timed out waiting for /inventory.html: the app stopped on /mfa (Enter one-time code)',
    linesPerEdit: 2,
    dom: { userId: 'user-name', button: 'Login', mfa: true },
  },
};
export const LOCATORS = ["locator('#user-name')", "locator('#password')", "getByRole('button', { name: 'Login' })"];

export interface Frame extends BaseFrame {
  specs: SpecState[];
  /** per spec (no POM) or per page object (POM): selector copy is fixed */
  fixedSpecs: boolean[];
  poFixed: boolean;
  uiChanged: boolean;
  edits: number;
  lines: number;
  /** spec index being run/edited, 6 = the page object, -1 none */
  focus: number;
  pencil: number;
  error: string | null;
}

export function simulate({ pom, change }: Params): Frame[] {
  const c = CHANGES[change];
  const on = pom === 'on';
  const frames: Frame[] = [];
  let s: Omit<Frame, 'caption' | 'predict'> = {
    specs: SPECS.map(() => 'pass'),
    fixedSpecs: SPECS.map(() => false),
    poFixed: false,
    uiChanged: false,
    edits: 0,
    lines: 0,
    focus: -1,
    pencil: -1,
    error: null,
  };
  const push = (patch: Partial<Frame>, caption: string, predict?: string) => {
    s = { ...s, focus: -1, pencil: -1, ...patch };
    frames.push({ ...s, specs: [...s.specs], fixedSpecs: [...s.fixedSpecs], caption, predict });
  };

  push(
    {},
    on
      ? 'With POM: every spec calls loginPage.login(user, pass). The three login locators live once, in LoginPage.ts. All 6 specs pass.'
      : 'Without POM: each of the 6 specs fills #user-name and #password and clicks the Login button itself. All 6 specs pass.',
  );
  push(
    {},
    on
      ? 'Layers: spec → LoginPage.login() → 3 locators → DOM. Specs say WHAT to do; only LoginPage knows HOW to find the elements.'
      : `Layers: spec → its own locators → DOM. The same 3 selectors are copied into 6 files: ${6 * 3} selector copies to keep in sync.`,
  );
  push(
    { uiChanged: true, specs: SPECS.map(() => 'idle') },
    `A developer ships a UI change: ${c.title}. Nothing in the test code changed yet.`,
    'The next CI run executes all 6 specs. How many fail?',
  );
  for (let k = 0; k < 6; k++) {
    const specs = [...s.specs];
    specs[k] = 'fail';
    push(
      { specs, focus: k, error: c.error },
      k === 0
        ? `${SPECS[k]} fails: ${c.error}${on ? ' (stack trace points into LoginPage.login(), LoginPage.ts:14)' : ` (at the login lines of ${SPECS[k]})`}.`
        : `${SPECS[k]} fails with the same error${on ? ', again inside LoginPage.login()' : `, at its own copy of the login lines`}.`,
      k === 5 ? `All 6 are red${on ? ' in both designs: POM does not prevent the break' : ''}. How many places must you edit to make them green again?` : undefined,
    );
  }

  if (!on) {
    for (let k = 0; k < 6; k++) {
      const fixedSpecs = [...s.fixedSpecs];
      fixedSpecs[k] = true;
      const specs = [...s.specs];
      specs[k] = 'edited';
      push(
        { fixedSpecs, specs, pencil: k, focus: k, edits: s.edits + 1, lines: s.lines + c.linesPerEdit },
        `Edit ${k + 1}/6: open ${SPECS[k]} and change ${c.before} → ${c.after}${c.linesPerEdit > 1 ? ` (${c.linesPerEdit} new lines)` : ''}.${k === 0 ? ' The other 5 files are still broken.' : ''}`,
        k === 0 ? 'One file fixed. Does the fix in login.spec.ts help the other 5 specs?' : undefined,
      );
    }
    push({ specs: SPECS.map(() => 'pass'), error: null }, `Re-run: all 6 green, after ${s.edits} edits in ${s.edits} files (${s.lines} lines). Miss one file and that spec stays red.`);
  } else {
    push(
      { poFixed: true, pencil: 6, focus: 6, edits: 1, lines: c.linesPerEdit, specs: SPECS.map(() => 'idle') },
      `One edit, in LoginPage.ts: ${c.after}${c.broken === -1 ? ' inside login()' : ` for the ${['username', 'password', 'login button'][c.broken]} locator`}. No spec file is touched.`,
      'You changed only LoginPage.ts. After a re-run, how many specs are green?',
    );
    for (let k = 0; k < 6; k += 2) {
      const specs = [...s.specs];
      specs[k] = 'pass';
      specs[k + 1] = 'pass';
      push({ specs, focus: k, error: k === 4 ? null : s.error }, `Re-run: ${SPECS[k]} and ${SPECS[k + 1]} pass: they call loginPage.login(), which now uses the fixed ${c.broken === -1 ? 'flow' : 'locator'}.`);
    }
  }
  push(
    {},
    on
      ? `Result: 6 broken specs, 1 edit (${s.lines} line${s.lines > 1 ? 's' : ''}) in 1 file. That is the maintenance argument for POM: selectors and flows change in one place.`
      : `Result: 6 broken specs, ${s.edits} edits (${s.lines} lines) across 6 files. With 40 specs it would be 40 edits. Toggle POM on to compare.`,
  );
  return frames;
}
