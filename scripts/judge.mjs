#!/usr/bin/env node
// Playwright Lab judge: grades the learner's Playwright tests by MUTATION TESTING.
//
//   npm run judge                       grade practice/tests (all steps that have tagged tests)
//   npm run judge -- --step step4       grade one step
//   npm run judge -- --reference        run the hidden reference suite (self-check: must be 100%)
//   options: --concurrency N (parallel runs, default 4), --workers N (Playwright workers per run, default 2)
//
// For every step with tests tagged @stepN:
//   1. start the correct QA Shop on a free port and run the step's tests twice (--repeat-each 2):
//      every test must pass both times (a test that passes only sometimes is flaky);
//   2. for each hidden bug (mutant) of that step, start QA Shop with BUGS=<id> and run the same tests:
//      the bug is "caught" when at least one test fails;
//   3. run static quality checks on the test code (hard waits, missing awaits, brittle locators…).
// Results go to public/judge-results.json (shown on the Playwright Lab page) and to the terminal.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { cpus, tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SERVER = join(ROOT, 'practice-app', 'server.mjs');
const PW_CLI = join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
const LEARNER_CONFIG = join(ROOT, 'practice', 'playwright.config.ts');
const REFERENCE_CONFIG = join(ROOT, 'judge', 'reference', 'playwright.config.ts');
const MUTANTS = JSON.parse(readFileSync(join(ROOT, 'judge', 'mutants.json'), 'utf8')).mutants;
const RESULTS_FILE = join(ROOT, 'public', 'judge-results.json');

// ---------- options ----------
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
};
const REFERENCE = argv.includes('--reference');
const ONLY_STEP = typeof opt('--step') === 'string' ? opt('--step') : undefined;
const CONCURRENCY = Math.max(1, Number(opt('--concurrency')) || Math.min(4, Math.max(1, Math.floor(cpus().length / 2))));
const WORKERS = Math.max(1, Number(opt('--workers')) || 2);
const CONFIG = REFERENCE ? REFERENCE_CONFIG : LEARNER_CONFIG;
const RUN_TIMEOUT_MS = 6 * 60 * 1000;

const STEPS = [...new Set(MUTANTS.map((m) => m.step))].sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
if (ONLY_STEP && !STEPS.includes(ONLY_STEP)) fail(`Unknown step "${ONLY_STEP}". Use one of: ${STEPS.join(', ')}`);
if (!existsSync(PW_CLI)) fail('@playwright/test is not installed. Run: npm install && npx playwright install chromium');

// ---------- child process bookkeeping ----------
const children = new Set();
function killAll() {
  for (const c of children) {
    try {
      c.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  }
}
process.on('exit', killAll);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    killAll();
    process.exit(130);
  });
}

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(2);
}

const stripAnsi = (s) => String(s ?? '').replace(/\u001b\[[0-9;]*m/g, '');

function freePort() {
  return new Promise((res, rej) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', rej);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

async function startServer(bugs) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const port = await freePort();
    const child = spawn(process.execPath, [SERVER], {
      env: { ...process.env, PORT: String(port), BUGS: bugs.join(',') },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.add(child);
    let exited = false;
    child.on('exit', () => {
      exited = true;
      children.delete(child);
    });
    child.stdout.resume();
    child.stderr.resume();
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && !exited) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/api/health`);
        if (r.ok) return { port, stop: () => stopChild(child) };
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 60));
    }
    await stopChild(child); // port clash or crash: try another port
  }
  throw new Error('Could not start the practice app (practice-app/server.mjs)');
}

function stopChild(child) {
  return new Promise((res) => {
    if (child.exitCode !== null || child.signalCode !== null) return res();
    const t = setTimeout(() => child.kill('SIGKILL'), 3000);
    child.once('exit', () => {
      clearTimeout(t);
      res();
    });
    child.kill('SIGTERM');
  });
}

function runPlaywright(args, env = {}) {
  return new Promise((res) => {
    const child = spawn(process.execPath, [PW_CLI, ...args], {
      cwd: ROOT,
      env: { ...process.env, FORCE_COLOR: '0', CI: '', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    children.add(child);
    let out = '';
    let errOut = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (errOut += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), RUN_TIMEOUT_MS);
    child.on('exit', (code) => {
      clearTimeout(timer);
      children.delete(child);
      res({ code, out, err: errOut });
    });
  });
}

const stepGrep = (step) => `@${step}(?![0-9])`;

// ---------- listing tests ----------
function walkSuites(suites, parents, visit) {
  for (const s of suites ?? []) {
    const path = s.title && !s.title.endsWith('.ts') && !s.title.endsWith('.js') ? [...parents, s.title] : parents;
    for (const spec of s.specs ?? []) visit(spec, path);
    walkSuites(s.suites, path, visit);
  }
}

async function listTests() {
  const r = await runPlaywright(['test', '--config', CONFIG, '--list', '--reporter=json']);
  let report;
  try {
    report = JSON.parse(r.out.slice(r.out.indexOf('{')));
  } catch {
    fail(`Could not list the tests.\n${stripAnsi(r.err || r.out).slice(0, 2000)}`);
  }
  const loadErrors = (report.errors ?? []).map((e) => stripAnsi(e.message).split('\n').slice(0, 4).join('\n'));
  const tests = [];
  walkSuites(report.suites, [], (spec, path) => {
    const tags = new Set([...(spec.tags ?? []).map((t) => (t.startsWith('@') ? t : `@${t}`))]);
    for (const m of spec.title.matchAll(/@step\d+/g)) tags.add(m[0]);
    tests.push({
      title: [...path, spec.title].join(' › '),
      file: join(report.config?.rootDir ?? dirname(CONFIG), spec.file),
      line: spec.line,
      column: spec.column,
      tags: [...tags],
    });
  });
  return { tests, loadErrors };
}

// ---------- running a step ----------
function parseReport(file) {
  if (!existsSync(file)) return null;
  const report = JSON.parse(readFileSync(file, 'utf8'));
  const byTitle = new Map();
  walkSuites(report.suites, [], (spec, path) => {
    const title = [...path, spec.title].join(' › ');
    const entry = byTitle.get(title) ?? { title, statuses: [], error: '' };
    for (const t of spec.tests ?? []) {
      for (const result of t.results ?? []) {
        if (result.status === 'skipped') continue;
        entry.statuses.push(result.status);
        if (result.status !== 'passed' && !entry.error) {
          const msg = stripAnsi(result.error?.message ?? result.errors?.[0]?.message ?? result.status);
          entry.error =
            msg
              .split('\n')
              .map((l) => l.trim())
              .filter((l) => l && !l.startsWith('Call log') && !l.startsWith('-'))
              .slice(0, 3)
              .join(' · ') || result.status;
        }
      }
    }
    byTitle.set(title, entry);
  });
  const errors = (report.errors ?? []).map((e) => stripAnsi(e.message).split('\n')[0]);
  return { tests: [...byTitle.values()], errors };
}

async function runStepTests(step, bugs, { repeatEach, maxFailures, outputDir, trace }) {
  const server = await startServer(bugs);
  const tmp = mkdtempSync(join(tmpdir(), 'qa-judge-'));
  const jsonFile = join(tmp, 'report.json');
  try {
    const args = ['test', '--config', CONFIG, '--grep', stepGrep(step), '--reporter=json', '--workers', String(WORKERS), '--retries', '0'];
    args.push('--repeat-each', String(repeatEach), '--output', outputDir ?? join(tmp, 'out'));
    if (!trace) args.push('--trace', 'off');
    if (maxFailures) args.push('--max-failures', String(maxFailures));
    const r = await runPlaywright(args, {
      PRACTICE_URL: `http://localhost:${server.port}`,
      PLAYWRIGHT_JSON_OUTPUT_FILE: jsonFile,
      PLAYWRIGHT_JSON_OUTPUT_NAME: jsonFile,
    });
    const parsed = parseReport(jsonFile);
    if (!parsed) return { tests: [], errors: [stripAnsi(r.err || r.out).split('\n').filter(Boolean).slice(0, 3).join(' ') || 'Playwright produced no report'] };
    return parsed;
  } finally {
    await server.stop();
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------- static quality checks ----------
/** Blanks out comments (keeps strings) so TODO comments never trigger a warning. */
function stripComments(src) {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '/' && n === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && n === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) out += src[i++] === '\n' ? '\n' : ' ';
      i++;
    } else if (c === "'" || c === '"' || c === '`') {
      out += c;
      i++;
      while (i < src.length && src[i] !== c) {
        if (src[i] === '\\') out += src[i++];
        out += src[i++];
      }
      out += c;
    } else out += c;
  }
  return out;
}

/** Text of the test(...) call that starts at line/column (1-based), by matching parentheses. */
function extractCall(code, line, column) {
  const lines = code.split('\n');
  let start = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) start += lines[i].length + 1;
  start += Math.max(0, column - 1);
  const open = code.indexOf('(', start);
  if (open === -1) return '';
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === "'" || c === '"' || c === '`') {
      i++;
      while (i < code.length && code[i] !== c) i += code[i] === '\\' ? 2 : 1;
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return code.slice(start, i + 1);
  }
  return code.slice(start);
}

const ASYNC_MATCHERS =
  'toBeVisible|toBeHidden|toHaveText|toContainText|toHaveValue|toHaveValues|toHaveURL|toHaveTitle|toHaveCount|toBeEnabled|toBeDisabled|toBeChecked|toHaveAttribute|toHaveClass|toBeAttached|toBeEmpty|toBeFocused|toBeEditable|toBeInViewport|toHaveCSS|toHaveId|toHaveJSProperty|toHaveScreenshot|toBeOK|toHaveAccessibleName|toHaveRole|toPass';
const UNAWAITED_EXPECT = new RegExp(`^expect(?:\\.soft)?\\(.*\\)\\s*\\.(?:not\\s*\\.)?(?:${ASYNC_MATCHERS})\\b`);
const UNAWAITED_CALL = /^(page|request|context|browser)\.(?!on\b|once\b|off\b|url\b|viewportSize\b|removeListener\b|addListener\b)[\w$]+/;

function readCode(file, fileCache) {
  if (!fileCache.has(file)) {
    try {
      fileCache.set(file, stripComments(readFileSync(file, 'utf8')));
    } catch {
      fileCache.set(file, '');
    }
  }
  return fileCache.get(file);
}

/** Heuristic checks on a piece of test code. Returns plain messages. */
function checkCode(code, { needsAssertion }) {
  const w = [];
  if (/\bwaitForTimeout\s*\(/.test(code)) w.push('uses waitForTimeout (a hard wait). Wait for a condition with a web-first assertion instead.');
  if (/\bpage\.\$\$?\s*\(|\.\$\$?eval\s*\(/.test(code)) w.push('uses page.$ / $$ / $eval (ElementHandles). Use locators such as getByRole, getByLabel or getByTestId.');
  if (/\bwaitForSelector\s*\(/.test(code)) w.push('uses waitForSelector. Locators and web-first assertions already wait.');
  if (/locator\(\s*['"`](?:xpath=|\/\/|\(\/\/|\.\/\/)/.test(code)) w.push('uses an XPath locator. Prefer role, label or test-id locators; XPath breaks when the layout changes.');
  for (const m of code.matchAll(/locator\(\s*(['"`])([^'"`]+)\1/g)) {
    const sel = m[2];
    if (sel.split(/\s*>\s*|\s+/).filter(Boolean).length >= 4 || /:nth-(child|of-type)/.test(sel)) {
      w.push(`uses a long or positional CSS selector ("${sel}"). Prefer user-facing locators.`);
      break;
    }
  }
  if (/(['"`])https?:\/\/(localhost|127\.0\.0\.1)/.test(code)) w.push('hard-codes a localhost URL. Use relative URLs (page.goto("/cart.html")) so baseURL is used.');
  if (/\btest\.only\s*\(|\bdescribe\.only\s*\(/.test(code)) w.push('contains .only, which would skip every other test.');
  if (needsAssertion && !/\bexpect\s*(\.\w+\s*)?\(/.test(code)) w.push('has no expect() assertion, so it can only fail if an action throws.');
  let prev = '';
  for (const raw of code.split('\n')) {
    const l = raw.trim();
    if (!l) continue;
    const continuation = /[[(,=&|?:]$/.test(prev) || /\b(return|await|yield)$/.test(prev);
    if (!continuation && (UNAWAITED_EXPECT.test(l) || (UNAWAITED_CALL.test(l) && !/,\s*$/.test(l)))) {
      w.push(`possible missing await: "${l.slice(0, 70)}"`);
    }
    prev = l;
  }
  return w;
}

function qualityWarnings(stepTests, fileCache) {
  const out = [];
  const files = new Map();
  for (const test of stepTests) {
    const code = readCode(test.file, fileCache);
    const call = extractCall(code, test.line, test.column);
    if (!call) continue;
    const msgs = checkCode(call, { needsAssertion: true });
    for (const m of msgs) out.push(`${test.title}: ${m}`);
    const seen = files.get(test.file) ?? new Set();
    msgs.forEach((m) => seen.add(m));
    files.set(test.file, seen);
  }
  // file-level pass: catches problems in hooks (beforeEach…) and helpers in the same file
  for (const [file, seen] of files) {
    for (const m of checkCode(readCode(file, fileCache), { needsAssertion: false })) {
      if (!seen.has(m)) out.push(`${relative(ROOT, file)} (hooks/helpers): ${m}`);
    }
  }
  return [...new Set(out)].slice(0, 20);
}

// ---------- main ----------
async function loadTitles() {
  try {
    const mod = await import(join(ROOT, 'src', 'content', 'pwlab.ts'));
    const steps = mod.PW_LAB_STEPS ?? [];
    for (const s of steps) {
      const n = MUTANTS.filter((m) => m.step === s.id).length;
      if (n !== s.hiddenBugs) console.warn(`⚠ ${s.id}: pwlab.ts says ${s.hiddenBugs} hidden bugs but judge/mutants.json has ${n}`);
    }
    return Object.fromEntries(steps.map((s) => [s.id, s.title]));
  } catch {
    return {}; // Node without TypeScript stripping: fall back to step ids
  }
}

async function main() {
  const started = Date.now();
  const titles = await loadTitles();
  console.log(`\nPlaywright Lab judge · ${REFERENCE ? 'REFERENCE self-check (hidden suite)' : 'your tests in practice/tests'}`);
  console.log(`concurrency ${CONCURRENCY} × ${WORKERS} workers\n`);

  const { tests, loadErrors } = await listTests();
  if (loadErrors.length) console.log(`⚠ Some test files could not be loaded:\n${loadErrors.join('\n')}\n`);
  const steps = ONLY_STEP ? [ONLY_STEP] : STEPS;
  const fileCache = new Map();

  const results = {};
  for (const step of steps) {
    const stepTests = tests.filter((t) => t.tags.includes(`@${step}`));
    const mutants = MUTANTS.filter((m) => m.step === step);
    results[step] = {
      id: step,
      title: titles[step] ?? step,
      status: stepTests.length ? 'pending' : 'no-tests',
      testsFound: stepTests.length,
      tests: stepTests.map((t) => t.title),
      passedOnCorrect: null,
      flaky: false,
      flakyTests: [],
      failingTests: [],
      mutantsCaught: 0,
      mutantsTotal: mutants.length,
      caught: [],
      missedHints: [],
      warnings: qualityWarnings(stepTests, fileCache),
      durationMs: 0,
    };
  }
  const untagged = tests.filter((t) => !t.tags.some((tag) => /^@step\d+$/.test(tag)));

  // 1. correct app, every step with tests, repeat-each 2
  const active = steps.filter((s) => results[s].testsFound > 0);
  process.stdout.write(`Correct app: running ${active.length} step(s)… `);
  await pool(active, CONCURRENCY, async (step) => {
    const t0 = Date.now();
    const outputDir = REFERENCE ? undefined : join(ROOT, 'practice', 'test-results', `judge-${step}`);
    const run = await runStepTests(step, [], { repeatEach: 2, outputDir, trace: !REFERENCE });
    const r = results[step];
    r.durationMs += Date.now() - t0;
    if (run.errors.length && !run.tests.length) {
      r.status = 'error';
      r.passedOnCorrect = false;
      r.failingTests = run.errors.map((e) => ({ title: '(test run error)', error: e }));
      return;
    }
    for (const t of run.tests) {
      const passes = t.statuses.filter((s) => s === 'passed').length;
      if (passes === t.statuses.length) continue;
      if (passes > 0) r.flakyTests.push(t.title);
      else r.failingTests.push({ title: t.title, error: t.error });
    }
    r.flaky = r.flakyTests.length > 0;
    r.passedOnCorrect = r.failingTests.length === 0 && !r.flaky && run.errors.length === 0;
    if (run.errors.length) r.failingTests.push(...run.errors.map((e) => ({ title: '(test run error)', error: e })));
    r.status = r.failingTests.length ? 'fails-on-correct' : r.flaky ? 'flaky' : 'scored';
    process.stdout.write('.');
  });
  console.log(' done');

  // 2. mutants, only for steps whose tests pass reliably on the correct app
  const jobs = MUTANTS.filter((m) => results[m.step]?.status === 'scored');
  process.stdout.write(`Hidden bugs: running ${jobs.length} mutant run(s)… `);
  const outcomes = await pool(jobs, CONCURRENCY, async (m) => {
    const t0 = Date.now();
    const run = await runStepTests(m.step, [m.id], { repeatEach: 1, maxFailures: 1, trace: false });
    results[m.step].durationMs += Date.now() - t0;
    const failedTests = run.tests.filter((t) => t.statuses.some((s) => s !== 'passed')).map((t) => t.title);
    process.stdout.write(failedTests.length ? '✓' : '·');
    return { m, caughtBy: failedTests };
  });
  console.log(' done\n');
  for (const { m, caughtBy } of outcomes) {
    const r = results[m.step];
    if (caughtBy.length) {
      r.mutantsCaught++;
      r.caught.push({ id: m.id, description: m.description, caughtBy });
    } else r.missedHints.push(m.hint);
  }
  for (const step of steps) {
    const r = results[step];
    if (r.status !== 'scored') r.missedHints = [];
  }

  // 3. summary
  const all = Object.values(results);
  const totalMutants = MUTANTS.filter((m) => steps.includes(m.step)).length;
  const caught = all.reduce((a, r) => a + r.mutantsCaught, 0);
  const output = {
    generatedAt: new Date().toISOString(),
    mode: REFERENCE ? 'reference' : 'learner',
    durationMs: Date.now() - started,
    overall: {
      score: totalMutants ? Math.round((caught / totalMutants) * 100) : 0,
      mutantsCaught: caught,
      mutantsTotal: totalMutants,
      stepsWithTests: all.filter((r) => r.testsFound > 0).length,
      stepsComplete: all.filter((r) => r.status === 'scored' && r.mutantsCaught === r.mutantsTotal).length,
      stepsTotal: all.length,
    },
    untaggedTests: untagged.map((t) => t.title),
    loadErrors,
    steps: results,
  };

  printSummary(output);
  if (!REFERENCE) {
    writeFileSync(RESULTS_FILE, `${JSON.stringify(output, null, 2)}\n`);
    console.log(`Results written to ${relative(ROOT, RESULTS_FILE)}: open the Playwright Lab page in the app and press Refresh.\n`);
  } else {
    const perfect = all.every((r) => r.status === 'scored' && r.mutantsCaught === r.mutantsTotal && !r.flaky);
    console.log(perfect ? '✔ Reference suite: every step passes on the correct app and catches every hidden bug.\n' : '✖ Reference suite is NOT perfect: fix the mutants or the reference tests.\n');
    process.exitCode = perfect ? 0 : 1;
  }
}

function printSummary(o) {
  const STATUS = {
    'no-tests': 'no tests yet',
    'fails-on-correct': '✖ fails on correct app',
    flaky: '✖ flaky',
    error: '✖ run error',
    scored: '✔ passes',
  };
  const rows = Object.values(o.steps).map((r) => [
    r.id,
    r.title.length > 28 ? `${r.title.slice(0, 27)}…` : r.title,
    String(r.testsFound),
    STATUS[r.status] ?? r.status,
    r.status === 'scored' ? `${r.mutantsCaught}/${r.mutantsTotal}` : `–/${r.mutantsTotal}`,
    String(r.warnings.length),
    `${(r.durationMs / 1000).toFixed(1)}s`,
  ]);
  const head = ['Step', 'Feature', 'Tests', 'Correct app', 'Bugs caught', 'Warnings', 'Time'];
  const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const fmt = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ');
  console.log(fmt(head));
  console.log(widths.map((w) => '─'.repeat(w)).join('  '));
  for (const r of rows) console.log(fmt(r));
  console.log(
    `\nScore: ${o.overall.mutantsCaught}/${o.overall.mutantsTotal} hidden bugs caught (${o.overall.score}%) · ` +
      `${o.overall.stepsComplete}/${o.overall.stepsTotal} steps complete · ${(o.durationMs / 1000).toFixed(1)}s\n`,
  );
  for (const r of Object.values(o.steps)) {
    const lines = [];
    for (const f of r.failingTests) lines.push(`  ✖ fails on the correct app: ${f.title}\n      ${f.error}`);
    for (const t of r.flakyTests) lines.push(`  ✖ flaky (passed once, failed once): ${t}`);
    for (const c of r.caught) lines.push(`  ✔ caught: ${c.description}`);
    for (const h of r.missedHints) lines.push(`  · missed a bug. Hint: ${h}`);
    for (const w of r.warnings) lines.push(`  ⚠ ${w}`);
    if (lines.length) console.log(`${r.id} · ${r.title}\n${lines.join('\n')}\n`);
  }
  if (o.untaggedTests.length) console.log(`⚠ ${o.untaggedTests.length} test(s) have no @stepN tag and were not graded: ${o.untaggedTests.join('; ')}\n`);
}

main().catch((e) => {
  killAll();
  console.error(e);
  process.exit(1);
});
