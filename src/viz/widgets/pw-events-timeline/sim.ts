// Pure simulation of test code vs browser events (playwright.dev/docs/dialogs, /events, /pages, /downloads).
// Dialogs: with no 'dialog' listener Playwright auto-dismisses (alert OK, confirm Cancel, prompt null).
// With a listener, the listener MUST accept() or dismiss(), otherwise the action stalls (the page is frozen
// inside confirm()). page.on stays registered. waitForEvent only sees events fired AFTER it was called, so
// the promise must be created before the click (no await) and awaited after it.
import type { BaseFrame } from '../../core';

export type Scenario = 'dialog-before' | 'dialog-after' | 'dialog-noop' | 'popup-before' | 'popup-after' | 'download';
export type Timing = 'sync' | 'delayed';
export interface Params {
  scenario: Scenario;
  timing: Timing;
}

export type Tone = 'good' | 'bad' | 'warn' | 'accent' | 'muted';
export interface Marker {
  t: number;
  lane: 'test' | 'browser';
  label: string;
  tone: Tone;
}
export type Target = 'handler' | 'auto' | 'missed';
export interface Frame extends BaseFrame {
  t: number;
  line: number;
  listeners: number;
  waiting: string | null;
  page: 'loading' | 'ready' | 'dialog';
  click: 'idle' | 'running' | 'done' | 'stalled';
  result: string;
  tabs: number;
  download: 'none' | 'temp' | 'saved' | 'deleted';
  token: Target | null;
  status: 'running' | 'pass' | 'fail';
  markers: Marker[];
}

export const CODE: Record<Scenario, string[]> = {
  'dialog-before': [
    "await page.goto('/javascript_alerts');",
    "page.on('dialog', d => d.accept());",
    "await page.getByRole('button', { name: 'Click for JS Confirm' }).click();",
    "await expect(page.locator('#result')).toHaveText('You clicked: Ok');",
  ],
  'dialog-after': [
    "await page.goto('/javascript_alerts');",
    "await page.getByRole('button', { name: 'Click for JS Confirm' }).click();",
    "page.on('dialog', d => d.accept());          // registered after the click",
    "await expect(page.locator('#result')).toHaveText('You clicked: Ok');",
  ],
  'dialog-noop': [
    "await page.goto('/javascript_alerts');",
    "page.on('dialog', d => console.log(d.message()));   // never accepts",
    "await page.getByRole('button', { name: 'Click for JS Confirm' }).click();",
    "await expect(page.locator('#result')).toHaveText('You clicked: Ok');",
  ],
  'popup-before': [
    "await page.goto('/windows');",
    "const popupPromise = page.waitForEvent('popup');   // no await",
    "await page.getByRole('link', { name: 'Click Here' }).click();",
    'const popup = await popupPromise;',
    "await expect(popup).toHaveTitle('New Window');",
  ],
  'popup-after': [
    "await page.goto('/windows');",
    "await page.getByRole('link', { name: 'Click Here' }).click();",
    "const popup = await page.waitForEvent('popup');   // started too late?",
    "await expect(popup).toHaveTitle('New Window');",
  ],
  download: [
    "await page.goto('/download');",
    "const downloadPromise = page.waitForEvent('download');   // no await",
    "await page.getByRole('link', { name: 'some-file.txt' }).click();",
    'const download = await downloadPromise;',
    'await download.saveAs(testInfo.outputPath(download.suggestedFilename()));',
  ],
};

export const EXPECT_TIMEOUT = 5000;
export const TEST_TIMEOUT = 30000;

export function simulate({ scenario: sc, timing }: Params): Frame[] {
  const frames: Frame[] = [];
  const delayed = timing === 'delayed';
  const A = delayed ? 465 : 165; // when the app opens the dialog / tab / download
  let s: Omit<Frame, 'caption' | 'predict'> = {
    t: 0,
    line: 0,
    listeners: 0,
    waiting: null,
    page: 'loading',
    click: 'idle',
    result: '',
    tabs: 1,
    download: 'none',
    token: null,
    status: 'running',
    markers: [],
  };
  const step = (t: number, patch: Partial<Frame>, caption: string, mark?: Omit<Marker, 't'>, predict?: string) => {
    s = { ...s, token: null, ...patch, t, markers: mark ? [...s.markers, { ...mark, t }] : s.markers };
    frames.push({ ...s, caption, predict });
  };
  const isDialog = sc.startsWith('dialog');
  const kind = sc === 'download' ? 'download' : isDialog ? 'dialog' : 'popup';
  const appAct = isDialog ? "the app's onclick calls confirm('I am a JS Confirm')" : kind === 'popup' ? 'the app opens /windows/new in a new tab' : 'the server answers with Content-Disposition: attachment, so the browser starts a download';

  const appLater = isDialog
    ? "the app's onclick only schedules confirm() for 300 ms later (setTimeout)"
    : kind === 'popup'
      ? 'the app schedules window.open() for 300 ms later (setTimeout)'
      : 'the app requests the file 300 ms later (setTimeout)';
  step(0, { line: -1 }, `Two timelines: your test code runs in Node (top lane), the page runs in the browser (bottom lane). Playwright delivers a browser event only to listeners or waiters that exist at the moment it fires.`);
  step(0, { line: 0 }, `goto() starts; the browser requests and renders the page.`, { lane: 'test', label: 'goto', tone: 'accent' });
  step(120, { page: 'ready' }, `120 ms: the load event fires and goto() resolves.`, { lane: 'browser', label: 'load', tone: 'muted' });

  // --- arm listener / waiter, then click ---
  const armsFirst = sc === 'dialog-before' || sc === 'dialog-noop' || sc === 'popup-before' || sc === 'download';
  if (armsFirst) {
    if (isDialog)
      step(130, { line: 1, listeners: 1 }, `130 ms: page.on('dialog', …) is synchronous: the listener is active immediately${sc === 'dialog-noop' ? ', but this one only logs the message' : ''}.`, { lane: 'test', label: 'on(dialog)', tone: 'accent' });
    else
      step(130, { line: 1, waiting: kind }, `130 ms: waitForEvent('${kind}') starts listening and returns a promise. No await, so the test moves straight on to the click.`, { lane: 'test', label: `wait(${kind})`, tone: 'accent' });
  }
  const clickLine = armsFirst ? 2 : 1;
  const p1: Record<Scenario, string> = {
    'dialog-before': 'The button calls confirm(). A listener that accepts is registered. What will #result say?',
    'dialog-after': `No dialog listener exists yet, and confirm() will open ${delayed ? '300 ms after the click' : 'during the click'}. Who answers it?`,
    'dialog-noop': 'The listener only logs the message; it never calls accept() or dismiss(). Does the click finish?',
    'popup-before': 'The popup waiter was armed before the click. Will popupPromise receive the new tab?',
    'popup-after': `Nobody is waiting for a popup yet, and the tab opens ${delayed ? '300 ms after the click' : 'during the click'}. Will line 2 catch it?`,
    download: 'The download waiter is armed. After the click, where is the downloaded file?',
  };
  step(140, { line: clickLine, click: 'running' }, `140 ms: click() runs its actionability checks (visible, stable, receives events, enabled): all pass.`, { lane: 'test', label: 'click', tone: 'accent' }, p1[sc]);
  step(160, {}, `160 ms: the mouse click is dispatched; ${delayed ? appLater : appAct}.`, { lane: 'browser', label: 'mousedown/up', tone: 'muted' });

  const after = () => {
    // click returns, then (if not armed first) the late registration
    step(
      180,
      { click: 'done' },
      `180 ms: click() resolves.${delayed ? ` Nothing has opened yet; the app is still waiting on its timer.` : ''}`,
      { lane: 'test', label: 'click ✓', tone: 'good' },
      !delayed && armsFirst && !isDialog ? `The ${kind} event fired at 170 ms, before anyone wrote await ${kind}Promise. Is it lost?` : undefined,
    );
    if (!armsFirst) {
      if (isDialog)
        step(190, { line: 2, listeners: 1 }, `190 ms: only now is page.on('dialog') registered${delayed ? '; the confirm has not opened yet' : ', but the confirm is already gone'}.`, { lane: 'test', label: 'on(dialog)', tone: delayed ? 'warn' : 'bad' });
      else
        step(190, { line: 2, waiting: 'popup' }, `190 ms: waitForEvent('popup') starts now. It only sees popups that open from this moment on.`, { lane: 'test', label: 'wait(popup)', tone: delayed ? 'warn' : 'bad' }, delayed ? undefined : 'The tab already opened at 170 ms. What is this waitForEvent waiting for?');
    }
  };

  // ---------- DIALOG ----------
  if (isDialog) {
    const handled = sc !== 'dialog-after' || delayed; // a listener exists when the dialog opens
    const accepts = sc !== 'dialog-noop';
    const expectLine = 3;
    const openDialog = () => {
      step(A, { page: 'dialog' }, `${A} ms: confirm() opens a modal dialog. The page's JavaScript is frozen until someone presses OK or Cancel.`, { lane: 'browser', label: 'dialog', tone: 'warn' });
      if (!handled) {
        step(A + 1, { token: 'auto' }, `${A + 1} ms: 'dialog' event with ZERO listeners, so Playwright auto-dismisses it (Cancel for a confirm).`, { lane: 'browser', label: 'auto-dismiss', tone: 'bad' });
        step(A + 5, { page: 'ready', result: 'You clicked: Cancel' }, `${A + 5} ms: confirm() returns false; the app writes "You clicked: Cancel".`);
        return;
      }
      if (sc === 'dialog-before') frames[frames.length - 1].predict = 'The page is frozen inside confirm(). Does Playwright auto-dismiss it this time?';
      step(A + 1, { token: 'handler' }, `${A + 1} ms: 'dialog' event: a listener exists, so Playwright does NOT auto-dismiss; it hands the Dialog to your handler.`, { lane: 'test', label: 'handler', tone: 'accent' });
      if (accepts) {
        step(A + 5, { page: 'ready', result: 'You clicked: Ok' }, `${A + 5} ms: the handler calls d.accept(); confirm() returns true and the app writes "You clicked: Ok".`, { lane: 'test', label: 'accept()', tone: 'good' });
      } else {
        step(A + 3, {}, `${A + 3} ms: the handler logs "I am a JS Confirm" and returns. The dialog is still open; nothing will ever close it.`, { lane: 'test', label: 'log only', tone: 'bad' });
      }
    };
    if (!delayed) {
      openDialog();
      if (sc === 'dialog-noop') {
        step(1000, { click: 'stalled' }, `1 s: click() is still waiting for the page, which is stuck inside confirm(). "Your action will stall."`, undefined, 'Nothing else in the test can run. How does this test end?');
        step(TEST_TIMEOUT, { status: 'fail' }, `30 s: "Test timeout of 30000ms exceeded" while running locator.click(). Fix: the handler must call d.accept() or d.dismiss().`, { lane: 'test', label: 'timeout', tone: 'bad' });
      } else {
        after();
        step(200, { line: expectLine }, `200 ms: toHaveText() reads #result: "${s.result}".${s.result === 'You clicked: Ok' ? '' : ' Not "You clicked: Ok", so it keeps retrying.'}`, { lane: 'test', label: 'expect', tone: 'accent' }, sc === 'dialog-after' ? 'The listener now exists. Will #result ever change to "You clicked: Ok"?' : undefined);
      }
    } else {
      after();
      step(200, { line: expectLine }, `200 ms: toHaveText() starts retrying: #result is still empty.`, { lane: 'test', label: 'expect…', tone: 'accent' }, sc === 'dialog-after' ? 'The listener was registered at 190 ms and the confirm opens at 465 ms. Accepted or auto-dismissed?' : undefined);
      openDialog();
      if (sc === 'dialog-noop') {
        step(1000, {}, `1 s: the dialog is still open, the app is frozen inside confirm(), and #result never changes.`, undefined, 'Will the assertion recover?');
      }
    }
    // outcome
    if (sc !== 'dialog-noop' || delayed) {
      const ok = s.result === 'You clicked: Ok';
      if (ok) step(s.t + 15, { status: 'pass', line: expectLine }, `${s.t + 15} ms: the next retry sees "You clicked: Ok"; the assertion passes.`, { lane: 'test', label: 'pass', tone: 'good' });
      else
        step(200 + EXPECT_TIMEOUT, { status: 'fail', line: expectLine }, `${(200 + EXPECT_TIMEOUT) / 1000} s: the expect timeout (5 s) hits: expected "You clicked: Ok", received "${s.result || '(empty)'}".`, { lane: 'test', label: 'fail', tone: 'bad' });
    }
    const summary: Record<string, string> = {
      'dialog-before': 'Rule: register the dialog handler BEFORE the action that opens the dialog, and make it accept() or dismiss(). (page.once handles just the next dialog.)',
      'dialog-after': delayed
        ? 'Passed only because the app waited 300 ms. Make the app react synchronously (Timing: immediately) and the same test fails: a flaky ordering bug.'
        : 'With no listener the confirm was auto-dismissed during the click. A handler registered later never sees it. Register it before the click.',
      'dialog-noop': 'A listener that never calls accept()/dismiss() leaves the dialog open, so the test hangs instead of failing fast. Always resolve the dialog.',
    };
    step(s.t, {}, summary[sc]);
  }

  // ---------- POPUP / DOWNLOAD ----------
  else {
    const fire = (t: number) => {
      const caught = s.waiting === kind;
      const what = kind === 'popup' ? 'a new tab opens and the \'popup\' event fires' : "the browser starts the download and the 'download' event fires";
      step(
        t,
        { tabs: kind === 'popup' ? 2 : 1, download: kind === 'download' ? 'temp' : s.download, token: caught ? 'handler' : 'missed', waiting: caught ? null : s.waiting },
        `${t} ms: ${what}. ${caught ? 'The waiter was listening, so its promise resolves with the new ' + (kind === 'popup' ? 'Page.' : 'Download.') : 'Nobody is waiting yet: the event is gone (the tab exists, but no promise will ever receive it).'}`,
        { lane: 'browser', label: kind, tone: caught ? 'good' : 'bad' },
      );
      return caught;
    };
    let caught: boolean;
    if (!delayed) {
      caught = fire(170);
      after();
    } else {
      after();
      if (armsFirst) step(190, { line: 3 }, `190 ms: await ${kind}Promise: still pending, the test waits here.`, { lane: 'test', label: 'await', tone: 'accent' }, kind === 'popup' ? 'The tab opens at 465 ms. Does the pending promise get it?' : undefined);
      caught = fire(A);
    }
    if (kind === 'popup') {
      if (caught) {
        const L = armsFirst ? 3 : 2;
        if (!delayed && armsFirst) step(190, { line: 3 }, `190 ms: await popupPromise returns at once: the promise already resolved at 170 ms.`, { lane: 'test', label: 'popup ✓', tone: 'good' });
        step(s.t + 20, { line: L + 1 }, `${s.t + 20} ms: toHaveTitle('New Window') on the popup. It is still loading; the web-first assertion retries.`, { lane: 'test', label: 'expect', tone: 'accent' }, armsFirst ? undefined : 'This test is about to pass. Is it a correct test?');
        step(s.t + 200, { status: 'pass' }, `${s.t + 200} ms: the popup finishes loading with title "New Window"; the assertion passes.`, { lane: 'browser', label: 'load', tone: 'good' });
        step(s.t, {}, 'Both tabs live in the same BrowserContext (same cookies). context.pages() now has 2 pages; the original page is untouched.');
        step(
          s.t,
          {},
          armsFirst
            ? 'Rule: create the waitForEvent promise BEFORE the click (no await), await it AFTER. Promise.all([page.waitForEvent(\'popup\'), click]) is equivalent.'
            : 'Passed only because the tab opened 300 ms late. With an instant popup (Timing: immediately) the event fires before line 2 and the test times out: flaky.',
        );
      } else {
        step(1000, {}, `1 s: waitForEvent('popup') is still waiting for a SECOND popup that will never come.`, undefined, 'How does this end?');
        step(2000, {}, `2 s: context.pages() would list 2 pages: the tab is open and loaded. Only the EVENT was missed; waitForEvent never replays past events.`);
        step(TEST_TIMEOUT, { status: 'fail' }, `30 s: "Test timeout of 30000ms exceeded" while waiting for event "popup". The tab was open the whole time.`, { lane: 'test', label: 'timeout', tone: 'bad' });
        step(s.t, {}, 'Fix: const popupPromise = page.waitForEvent(\'popup\') BEFORE the click, then await popupPromise after it.');
      }
    } else {
      if (!delayed) step(190, { line: 3 }, `190 ms: await downloadPromise returns the Download at once (it resolved at 170 ms).`, { lane: 'test', label: 'download ✓', tone: 'good' });
      else step(A + 5, {}, `${A + 5} ms: await downloadPromise resolves with the Download.`, { lane: 'test', label: 'download ✓', tone: 'good' });
      step(s.t + 10, { line: 4 }, `${s.t + 10} ms: suggestedFilename() is "some-file.txt" (from the server). The bytes sit in a temporary folder owned by the context.`);
      step(s.t + 40, { line: 4, download: 'saved' }, `${s.t + 40} ms: saveAs() copies the file to test-results/…/some-file.txt; now you can read it with fs and assert on it.`, { lane: 'test', label: 'saveAs', tone: 'good' }, 'The test ends now. What happens to the temporary file when the context closes?');
      step(s.t + 60, { download: 'deleted', status: 'pass' }, `${s.t + 60} ms: test ends; the context closes and its temporary downloads are deleted. Only the saveAs() copy survives.`, { lane: 'browser', label: 'ctx closed', tone: 'muted' });
      step(s.t, {}, "Rule: start waitForEvent('download') before the click, await it after, and saveAs() before the context closes.");
    }
  }
  return frames;
}
