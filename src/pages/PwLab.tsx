import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PW_LAB_ABOUT, PW_LAB_APP_URL, PW_LAB_STEPS, type PwLabStep } from '../content/pwlab';
import { Badge, CodeBlock, Markdown, ProgressBar } from '../components/ui';

// ---------- judge results (written by `npm run judge` to public/judge-results.json) ----------
interface StepResult {
  id: string;
  title: string;
  status: 'no-tests' | 'fails-on-correct' | 'flaky' | 'error' | 'scored';
  testsFound: number;
  tests: string[];
  passedOnCorrect: boolean | null;
  flaky: boolean;
  flakyTests: string[];
  failingTests: { title: string; error: string }[];
  mutantsCaught: number;
  mutantsTotal: number;
  caught: { id: string; description: string; caughtBy?: string[] }[];
  missedHints: string[];
  warnings: string[];
  durationMs: number;
}

interface JudgeResults {
  generatedAt: string;
  mode: 'learner' | 'reference';
  durationMs: number;
  overall: { score: number; mutantsCaught: number; mutantsTotal: number; stepsWithTests: number; stepsComplete: number; stepsTotal: number };
  untaggedTests: string[];
  loadErrors: string[];
  steps: Record<string, StepResult>;
}

type Load = { state: 'loading' } | { state: 'missing' } | { state: 'ok'; data: JudgeResults };

function useJudgeResults() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const refresh = useCallback(async () => {
    setLoad({ state: 'loading' });
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}judge-results.json?t=${Date.now()}`, { cache: 'no-store' });
      // the dev server answers unknown paths with index.html, so check that it really is JSON
      if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) throw new Error('missing');
      const data = (await res.json()) as JudgeResults;
      if (!data?.steps) throw new Error('bad file');
      setLoad({ state: 'ok', data });
    } catch {
      setLoad({ state: 'missing' });
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { load, refresh };
}

const STATUS_LABEL: Record<StepResult['status'], string> = {
  'no-tests': 'No tests yet',
  'fails-on-correct': 'Tests fail on the correct app',
  flaky: 'Flaky tests',
  error: 'Test run error',
  scored: 'Passes on the correct app',
};

function stepTone(r?: StepResult): 'good' | 'warn' | undefined {
  if (!r || r.status === 'no-tests') return undefined;
  if (r.status === 'scored' && r.mutantsCaught === r.mutantsTotal) return 'good';
  return 'warn';
}

function StepStatusLine({ r }: { r?: StepResult }) {
  if (!r || r.status === 'no-tests') return <span className="small muted">No tests yet</span>;
  if (r.status !== 'scored') return <span className="small warn">✖ {STATUS_LABEL[r.status]}</span>;
  return (
    <span className="small">
      {r.mutantsCaught === r.mutantsTotal ? '✓ ' : ''}
      {r.mutantsCaught}/{r.mutantsTotal} hidden bugs caught
    </span>
  );
}

function RefreshBar({ load, refresh }: ReturnType<typeof useJudgeResults>) {
  return (
    <div className="row wrap gap-s pwlab-refresh">
      <button type="button" className="btn" onClick={() => void refresh()} disabled={load.state === 'loading'}>
        ↻ Refresh results
      </button>
      <span className="small muted">
        {load.state === 'loading' && 'Loading…'}
        {load.state === 'missing' && 'No results yet.'}
        {load.state === 'ok' &&
          `Last judged ${new Date(load.data.generatedAt).toLocaleString()} · ${(load.data.durationMs / 1000).toFixed(0)}s${
            load.data.mode === 'reference' ? ' · reference suite' : ''
          }`}
      </span>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="card coding-result">
      <strong>No judge results yet.</strong>
      <p className="small muted">
        Run <code className="inline-code">npm run judge</code> in the project folder, then press Refresh. The judge runs on your
        machine: it does not work on a deployed static copy of this site.
      </p>
    </div>
  );
}

// ---------- overview ----------
const SETUP = `
1. **Node.js 22.18 or newer** (\`node -v\`).
2. In the project folder: \`npm install\`, then \`npx playwright install chromium\` (once).
3. Start the practice app with \`npm run practice-app\` and explore it at ${PW_LAB_APP_URL}. Explore before you automate: try the features by hand, as a tester would.
4. Read a step's spec below, brainstorm scenarios, and write tests in \`practice/tests/*.spec.ts\`. Tag every test with its step, e.g. \`{ tag: '@step3' }\`.
5. Run your tests while you write them: \`npm run practice:test\` (needs the app from step 3 running; add \`-- --ui\` for UI mode).
6. Grade them: \`npm run judge\` (or \`npm run judge -- --step step3\`). The judge starts its own copies of the app, so step 3 isn't needed. Then press **Refresh results** here.
`;

const SCORING = `
- **Hidden bugs.** Every step has 4–5 deliberately seeded bugs (mutants), each one breaking a rule in the spec. You are not told what they are.
- **Your tests must pass on the correct app first.** The judge runs each step's tests twice against the correct app. A failure, or a test that passes only once (flaky), means the step is not scored until you fix it.
- **Then each bug is switched on, one at a time.** A bug is **caught** when at least one of your tests for that step fails. Caught bugs are revealed; for missed ones you get a hint category ("Boundary values", "State after reload"…).
- **Score** = hidden bugs caught out of ${PW_LAB_STEPS.reduce((a, s) => a + s.hiddenBugs, 0)}. Happy-path tests alone catch very few: think about boundaries, negative cases, state and combinations.
- **Quality warnings** flag habits interviewers dislike: \`waitForTimeout\`, \`page.$\`, \`waitForSelector\`, XPath or long CSS chains, tests without \`expect\`, missing \`await\`, hard-coded \`localhost\` URLs.
- It's a learning tool: the answers are in the \`judge/\` folder, but reading them first defeats the purpose.
`;

export function PwLabOverviewPage() {
  const judge = useJudgeResults();
  const { load } = judge;
  const data = load.state === 'ok' ? load.data : undefined;

  return (
    <div className="page">
      <div className="topic-head">
        <div className="eyebrow">Practice</div>
        <h1>Playwright Lab (Judge)</h1>
        <p className="lead">
          Write real Playwright tests for <strong>QA Shop</strong>, a small web app with hidden, deliberately seeded bugs. Each step
          gives you a feature spec. You brainstorm the scenarios, write the tests, and an automatic judge checks whether your tests
          would have caught the bugs.
        </p>
        <RefreshBar {...judge} />
      </div>

      {data ? (
        <section className="card pwlab-score">
          <div className="row between wrap">
            <div>
              <div className="label">Overall</div>
              <div className="pwlab-big">
                {data.overall.mutantsCaught}/{data.overall.mutantsTotal} hidden bugs caught
              </div>
              <div className="small muted">
                {data.overall.score}% · {data.overall.stepsComplete}/{data.overall.stepsTotal} steps complete ·{' '}
                {data.overall.stepsWithTests} with tests
              </div>
            </div>
          </div>
          <ProgressBar value={data.overall.score} tone="good" />
          {data.loadErrors.length > 0 && (
            <>
              <p className="warn small">Some test files could not be loaded:</p>
              <pre className="console-out">{data.loadErrors.join('\n\n')}</pre>
            </>
          )}
          {data.untaggedTests.length > 0 && (
            <p className="small warn">
              {data.untaggedTests.length} test(s) have no <code className="inline-code">@stepN</code> tag and were not graded:{' '}
              {data.untaggedTests.join('; ')}
            </p>
          )}
        </section>
      ) : (
        load.state === 'missing' && <EmptyResults />
      )}

      <h2>Steps</h2>
      <div className="card-grid">
        {PW_LAB_STEPS.map((s, i) => {
          const r = data?.steps[s.id];
          const tone = stepTone(r);
          return (
            <Link key={s.id} to={`/pw-lab/${s.id}`} className={`topic-card ${tone === 'good' ? 'st-passed' : ''}`}>
              <div className="topic-card-top">
                <span className={`dot dot-${tone === 'good' ? 'passed' : r && r.status !== 'no-tests' ? 'in-progress' : 'new'}`} />
                <span className="badge badge-tag">{s.tag}</span>
              </div>
              <h3>
                {i + 1}. {s.title}
              </h3>
              <p className="muted small">{s.summary}</p>
              <div className="topic-card-foot">
                <ProgressBar value={r && r.status === 'scored' ? (r.mutantsCaught / r.mutantsTotal) * 100 : 0} tone={tone} />
                <StepStatusLine r={r} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="two-col pwlab-cols">
        <section className="card">
          <h2>Set up and run</h2>
          <Markdown>{SETUP}</Markdown>
        </section>
        <section className="card">
          <h2>How scoring works</h2>
          <Markdown>{SCORING}</Markdown>
        </section>
      </div>

      <section className="card">
        <h2>About QA Shop</h2>
        <Markdown>{PW_LAB_ABOUT}</Markdown>
      </section>
    </div>
  );
}

// ---------- step page ----------
export function PwLabStepPage() {
  const { step = '' } = useParams();
  const idx = PW_LAB_STEPS.findIndex((s) => s.id === step);
  const s = PW_LAB_STEPS[idx];
  if (!s) {
    return (
      <div className="page">
        <h1>Step not found</h1>
        <Link to="/pw-lab">← Playwright Lab</Link>
      </div>
    );
  }
  return <StepView key={s.id} s={s} n={idx + 1} prev={PW_LAB_STEPS[idx - 1]} next={PW_LAB_STEPS[idx + 1]} />;
}

function tagExample(s: PwLabStep) {
  const usesRequest = s.id === 'step8';
  return `import { test, expect } from '@playwright/test';

test.describe('${s.title}', { tag: '${s.tag}' }, () => {
  test('describe the scenario you are checking', async ({ ${usesRequest ? 'request' : 'page'} }) => {
${
  usesRequest
    ? `    const res = await request.get('/api/products');
    expect(res.status()).toBe(200);`
    : `    await page.goto('/');            // relative URL: the judge sets baseURL
    // arrange → act → assert with web-first assertions
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();`
}
  });
});`;
}

function StepView({ s, n, prev, next }: { s: PwLabStep; n: number; prev?: PwLabStep; next?: PwLabStep }) {
  const judge = useJudgeResults();
  const { load } = judge;
  const r = load.state === 'ok' ? load.data.steps[s.id] : undefined;

  return (
    <div className="page">
      <Link to="/pw-lab" className="muted small">
        ← Playwright Lab
      </Link>
      <div className="topic-head">
        <div className="eyebrow">Playwright Lab · Step {n}</div>
        <h1>{s.title}</h1>
        <div className="row wrap gap-s">
          <Badge tone="tag">{s.tag}</Badge>
          <Badge tone="warn">{s.hiddenBugs} hidden bugs</Badge>
          <span className="small muted">Where: {s.where}</span>
        </div>
      </div>

      <section className="card">
        <h2>Spec</h2>
        <Markdown>{s.spec}</Markdown>
      </section>

      <section className="card">
        <h2>Brainstorm before you code</h2>
        <ul>
          {s.prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="small muted">
          Write your scenarios down first (as you would for manual test cases), then automate the ones that check a rule from the
          spec. Every test needs the tag <code className="inline-code">{s.tag}</code>.
        </p>
        <CodeBlock snippet={{ language: 'typescript', title: `practice/tests/${s.id}.spec.ts`, code: tagExample(s) }} />
      </section>

      <section className="card">
        <div className="row between wrap">
          <h2>Latest result</h2>
          <RefreshBar {...judge} />
        </div>
        {load.state === 'missing' && <EmptyResults />}
        {r && <StepResultView r={r} />}
        <p className="small muted">
          Grade only this step: <code className="inline-code">npm run judge -- --step {s.id}</code>
        </p>
      </section>

      <div className="pager">
        {prev ? <Link to={`/pw-lab/${prev.id}`}>← {prev.title}</Link> : <Link to="/pw-lab">Overview</Link>}
        {next ? <Link to={`/pw-lab/${next.id}`}>{next.title} →</Link> : <Link to="/pw-lab">Overview</Link>}
      </div>
    </div>
  );
}

function StepResultView({ r }: { r: StepResult }) {
  if (r.status === 'no-tests') {
    return (
      <div className="card coding-result">
        <strong>No tests tagged for this step yet.</strong>
      </div>
    );
  }
  const passes = r.status === 'scored';
  const allCaught = passes && r.mutantsCaught === r.mutantsTotal;
  return (
    <div className="pwlab-result">
      <div className={`card coding-result ${passes ? 'good' : 'bad'}`}>
        <div>
          {passes ? '✓' : '✗'} {STATUS_LABEL[r.status]} ({r.testsFound} {r.testsFound === 1 ? 'test' : 'tests'}, run twice)
        </div>
        {passes ? (
          <div className="pwlab-big">
            {r.mutantsCaught}/{r.mutantsTotal} hidden bugs caught{allCaught ? ' 🎉' : ''}
          </div>
        ) : (
          <div className="small muted">Hidden bugs are only tried once every test passes reliably on the correct app.</div>
        )}
        {passes && <ProgressBar value={(r.mutantsCaught / r.mutantsTotal) * 100} tone={allCaught ? 'good' : 'warn'} />}
      </div>

      {r.failingTests.length > 0 && (
        <>
          <div className="label">Failing on the correct app</div>
          <ul className="test-results">
            {r.failingTests.map((f) => (
              <li key={f.title} className="fail">
                <span>✗</span>
                <span>
                  <strong>{f.title}</strong>
                  <br />
                  <code className="small">{f.error}</code>
                </span>
              </li>
            ))}
          </ul>
          <p className="small muted">
            Traces are kept in <code className="inline-code">practice/test-results/judge-{r.id}/</code>. Open one with{' '}
            <code className="inline-code">npx playwright show-trace &lt;path&gt;/trace.zip</code>.
          </p>
        </>
      )}

      {r.flakyTests.length > 0 && (
        <>
          <div className="label">Flaky (passed once, failed once)</div>
          <ul className="test-results">
            {r.flakyTests.map((t) => (
              <li key={t} className="fail">
                <span>~</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="small muted">Usually a missing await, a hard wait, or a test that depends on another test's data.</p>
        </>
      )}

      {r.caught.length > 0 && (
        <>
          <div className="label">Bugs your tests caught</div>
          <ul className="test-results">
            {r.caught.map((c) => (
              <li key={c.id} className="pass">
                <span>✓</span>
                <span>
                  {c.description}
                  {c.caughtBy?.length ? <span className="small muted"> · caught by “{c.caughtBy[0]}”</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {r.missedHints.length > 0 && (
        <>
          <div className="label">Bugs still hiding: hints</div>
          <div className="row wrap gap-s">
            {r.missedHints.map((h, i) => (
              <span key={`${h}-${i}`} className="chip">
                {h}
              </span>
            ))}
          </div>
        </>
      )}

      {r.warnings.length > 0 && (
        <>
          <div className="label">Quality warnings</div>
          <ul className="pwlab-warnings small">
            {r.warnings.map((w) => (
              <li key={w}>⚠ {w}</li>
            ))}
          </ul>
        </>
      )}

      <details className="small">
        <summary>Tests found for this step ({r.tests.length})</summary>
        <ul>
          {r.tests.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
