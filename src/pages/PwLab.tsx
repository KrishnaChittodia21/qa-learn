import { useCallback, useEffect, useState, type CSSProperties, type ReactNode, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, RefreshCw } from 'lucide-react';
import { PW_LAB_ABOUT, PW_LAB_APP_URL, PW_LAB_STEPS, type PwLabStep } from '../content/pwlab';
import { CodeBlock, Markdown } from '../components/ui';
import { celebrate } from '../lib/celebrate';
import { getUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

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
type Judge = { load: Load; refresh: () => Promise<void> };

function useJudgeResults(): Judge {
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
const TOTAL_BUGS = PW_LAB_STEPS.reduce((a, s) => a + s.hiddenBugs, 0);
const pad = (n: number) => String(n).padStart(2, '0');
const judgeCmd = (id?: string) => (id ? `npm run judge -- --step ${id}` : 'npm run judge');

type Tone = 'done' | 'part' | 'bad' | 'none';
function stepTone(r?: StepResult): Tone {
  if (!r || r.status === 'no-tests') return 'none';
  if (r.status !== 'scored') return 'bad';
  return r.mutantsTotal > 0 && r.mutantsCaught === r.mutantsTotal ? 'done' : 'part';
}
const caughtOf = (r?: StepResult) => (r?.status === 'scored' ? r.mutantsCaught : 0);

/** the step the learner should work on next: the first one whose bugs are not all caught */
function currentStep(data?: JudgeResults) {
  return PW_LAB_STEPS.find((s) => stepTone(data?.steps[s.id]) !== 'done') ?? PW_LAB_STEPS[PW_LAB_STEPS.length - 1];
}

/** numbered acceptance criteria from a step spec (first line of each item, markdown kept) */
function criteria(spec: string) {
  return spec
    .split('\n')
    .map((l) => /^\d+\.\s+(.*)$/.exec(l)?.[1])
    .filter((x): x is string => !!x);
}

const noopSubscribe = () => () => {};
const getSlot = () => document.getElementById('console-slot');

function ConsoleSlot({ children }: { children: ReactNode }) {
  // read after commit: on first load the shell's slot mounts in the same commit as the page
  const el = useSyncExternalStore(noopSubscribe, getSlot, () => null);
  return el ? createPortal(children, el) : null;
}

function CopyCmd({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="lab-cmd">
      <code>
        <span>$</span> {cmd}
      </code>
      <button
        type="button"
        className="icon-btn"
        aria-label={copied ? 'Copied' : `Copy “${cmd}”`}
        title="Copy command"
        onClick={() => {
          void navigator.clipboard?.writeText(cmd).then(
            () => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            },
            () => {},
          );
        }}
      >
        {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      </button>
    </span>
  );
}

function RefreshBar({ load, refresh }: Judge) {
  return (
    <div className="lab-refresh">
      <button type="button" className="btn btn-sm" onClick={() => void refresh()} disabled={load.state === 'loading'}>
        <RefreshCw size={14} aria-hidden="true" /> Refresh results
      </button>
      <span className="mlabel">
        {load.state === 'loading' && 'Loading…'}
        {load.state === 'missing' && 'No results yet'}
        {load.state === 'ok' && (
          <>
            Judged <b>{new Date(load.data.generatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</b> ·{' '}
            {(load.data.durationMs / 1000).toFixed(0)}s{load.data.mode === 'reference' ? ' · reference suite' : ''}
          </>
        )}
      </span>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="lab-empty">
      <span className="chip skip">no judge results</span>
      <p>
        Run <code className="inline-code">npm run judge</code> in the project folder, then press Refresh. The judge runs on your
        machine: it does not work on a deployed static copy of this site.
      </p>
    </div>
  );
}

// ---------- shared instruments ----------
/** one row of bug cells per step, linking to the step */
function HuntRows({ data, current }: { data?: JudgeResults; current: PwLabStep }) {
  return (
    <ol className="lab-hm" aria-label="Bugs caught per step">
      {PW_LAB_STEPS.map((s, i) => {
        const r = data?.steps[s.id];
        const tone = stepTone(r);
        const c = caughtOf(r);
        return (
          <li key={s.id} className={`${tone} ${s.id === current.id ? 'cur' : ''}`}>
            <Link to={`/pw-lab/${s.id}`} aria-current={s.id === current.id ? 'step' : undefined}>
              <span className="lab-tg">@s{i + 1}</span>
              <span className="nm">{s.title}</span>
              <span className="cells" aria-hidden="true">
                {Array.from({ length: s.hiddenBugs }, (_, k) => (
                  <i key={k} className={k < c ? 'c' : tone === 'part' ? 'm' : tone === 'bad' ? 'b' : ''} />
                ))}
              </span>
              <span className="ct">
                {c}/{s.hiddenBugs}
                <span className="sr-only"> caught{r ? `, ${STATUS_LABEL[r.status]}` : ''}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** caught / total + one row of cells per step (the bug-hunt heat map) */
function BugHunt({ judge, current, className = '' }: { judge: Judge; current: PwLabStep; className?: string }) {
  const data = judge.load.state === 'ok' ? judge.load.data : undefined;
  const caught = data ? data.overall.mutantsCaught : 0;
  const total = data?.overall.mutantsTotal || TOTAL_BUGS;
  return (
    <section className={`panel lab-hunt rise ${className}`} style={{ '--i': 1 } as CSSProperties} aria-label="Bug hunt">
      <div className="p-head">
        <span className="mlabel">
          Bug hunt <b>· QA Shop</b>
        </span>
        {judge.load.state === 'loading' ? <span className="chip run">loading</span> : data ? <span className="chip holo">judged</span> : <span className="chip skip">not judged</span>}
      </div>
      <div className="lab-hunt-read">
        <span className="numeral">
          {data ? caught : '—'}
          <small>/{total}</small>
        </span>
        <span className="side">
          <b>hidden bugs caught</b>
          {data ? ` · ${data.overall.score}%` : ''}
          <br />
          {data
            ? `${data.overall.stepsComplete} of ${data.overall.stepsTotal} steps complete · ${data.overall.stepsWithTests} with tests`
            : `${PW_LAB_STEPS.length} steps · run the judge to score them`}
        </span>
      </div>
      <span className="seg tall lab-hunt-seg" style={{ '--n': total, '--v': caught, '--g': 'var(--mint)', '--gap': '3px' } as CSSProperties} aria-hidden="true" />

      <HuntRows data={data} current={current} />
      <div className="lab-key" aria-hidden="true">
        <span>
          <i className="c" /> caught
        </span>
        <span>
          <i className="m" /> missed
        </span>
        <span>
          <i className="b" /> not scored
        </span>
        <span>
          <i /> hidden
        </span>
      </div>
      <RefreshBar {...judge} />
    </section>
  );
}

/** vertical rail of the real lab steps */
function StepRail({ data, current, className = '' }: { data?: JudgeResults; current: PwLabStep; className?: string }) {
  return (
    <nav className={`panel lab-steps rise ${className}`} style={{ '--i': 3 } as CSSProperties} aria-label="Lab steps">
      <div className="p-head">
        <span className="mlabel">
          Steps <b>· {PW_LAB_STEPS.length}</b>
        </span>
        <span className="mlabel">{TOTAL_BUGS} bugs</span>
      </div>
      <ol className="lab-sr">
        {PW_LAB_STEPS.map((s, i) => {
          const r = data?.steps[s.id];
          const tone = stepTone(r);
          const c = caughtOf(r);
          const now = s.id === current.id;
          const node = tone === 'done' ? 'pass' : tone === 'part' ? 'flaky' : tone === 'bad' ? 'fail' : now ? 'now' : 'queued';
          return (
            <li key={s.id} className={`${tone} ${now ? 'now' : ''}`}>
              <Link to={`/pw-lab/${s.id}`} aria-current={now ? 'step' : undefined}>
                <span className={`node ${node}`} aria-hidden="true" />
                <span className="lab-tg">
                  <span>{s.tag}</span>
                  <span>{tone === 'none' ? `${s.hiddenBugs} bugs` : tone === 'bad' ? 'fix tests' : `${c}/${s.hiddenBugs}`}</span>
                </span>
                <span className="tt">
                  {pad(i + 1)} · {s.title}
                </span>
                <span className="cells" aria-hidden="true">
                  {Array.from({ length: s.hiddenBugs }, (_, k) => (
                    <i key={k} className={k < c ? 'c' : tone === 'part' ? 'm' : ''} />
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Mission({ s, n, eyebrow, children }: { s: PwLabStep; n: number; eyebrow: string; children?: ReactNode }) {
  const acs = criteria(s.spec);
  const shown = acs.slice(0, 4);
  return (
    <section className="panel cut-lg foil lab-mission rise" style={{ '--i': 0 } as CSSProperties} aria-labelledby="lab-mission-title">
      <span className="lab-ghost" aria-hidden="true">
        {n}
      </span>
      <div className="lab-m-top">
        <span className="chip holo">{eyebrow}</span>
        <span className="tag">{s.tag}</span>
        <span className="mlabel">
          Step <b>{n}</b> of {PW_LAB_STEPS.length}
        </span>
        <span className="coord">{s.hiddenBugs} HIDDEN BUGS</span>
      </div>
      <h1 id="lab-mission-title" className="lab-m-title">
        <span className="holo-text">{s.title}</span>
      </h1>
      <p className="lab-m-sub">{s.summary}</p>
      <p className="lab-m-where">
        <span className="mlabel">Where</span> <code>{s.where}</code>
      </p>
      {shown.length > 0 && (
        <div className="lab-rules">
          {shown.map((a, i) => (
            <div key={i} className="lab-rule">
              <span className="ix">AC{i + 1}</span>
              <div className="d">
                <Markdown>{a}</Markdown>
              </div>
            </div>
          ))}
        </div>
      )}
      {acs.length > shown.length && <p className="lab-more mlabel">+{acs.length - shown.length} more acceptance criteria in the spec</p>}
      {children}
    </section>
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
- **Score** = hidden bugs caught out of ${TOTAL_BUGS}. Happy-path tests alone catch very few: think about boundaries, negative cases, state and combinations.
- **Quality warnings** flag habits interviewers dislike: \`waitForTimeout\`, \`page.$\`, \`waitForSelector\`, XPath or long CSS chains, tests without \`expect\`, missing \`await\`, hard-coded \`localhost\` URLs.
- It's a learning tool: the answers are in the \`judge/\` folder, but reading them first defeats the purpose.
`;

export function PwLabOverviewPage() {
  const judge = useJudgeResults();
  const { load } = judge;
  const data = load.state === 'ok' ? load.data : undefined;
  const cur = currentStep(data);
  const curN = PW_LAB_STEPS.indexOf(cur) + 1;

  return (
    <div className="page lab-page">
      <ConsoleSlot>
        <span className="lab-slot">
          judge · {data ? `${data.overall.mutantsCaught}/${data.overall.mutantsTotal} caught` : 'no results'}
        </span>
      </ConsoleSlot>
      <div className="lab-bento lab-over">
        <Mission s={cur} n={curN} eyebrow="Current mission">
          <p className="lab-intro">
            Write real Playwright tests for <b>QA Shop</b>, a small web app with hidden, deliberately seeded bugs. Each step gives you
            a feature spec: you brainstorm the scenarios, write the tests, and an automatic judge checks whether your tests would have
            caught the bugs.
          </p>
          <div className="lab-cta">
            <Link to={`/pw-lab/${cur.id}`} className="btn btn-holo">
              Open step {curN} · {cur.tag}{' '}
              <span className="arr">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
            <CopyCmd cmd={judgeCmd(cur.id)} />
          </div>
        </Mission>

        <BugHunt judge={judge} current={cur} />

        {data && (data.loadErrors.length > 0 || data.untaggedTests.length > 0) && (
          <section className="panel flat lab-alerts" aria-label="Judge warnings">
            {data.loadErrors.length > 0 && (
              <>
                <span className="chip fail">load errors · {data.loadErrors.length}</span>
                <p>Some test files could not be loaded:</p>
                <pre className="console-out" data-theme="dark">
                  {data.loadErrors.join('\n\n')}
                </pre>
              </>
            )}
            {data.untaggedTests.length > 0 && (
              <p className="lab-warn-l">
                <span className="m">!</span>
                <span>
                  {data.untaggedTests.length} test(s) have no <code className="inline-code">@stepN</code> tag and were not graded:{' '}
                  {data.untaggedTests.join('; ')}
                </span>
              </p>
            )}
          </section>
        )}
        {load.state === 'missing' && (
          <section className="panel flat lab-alerts" aria-label="Judge results">
            <EmptyResults />
          </section>
        )}

        <section className="panel lab-setup rise" style={{ '--i': 2 } as CSSProperties}>
          <div className="p-head">
            <h2 className="p-title">Set up and run</h2>
            <span className="mlabel">6 stages</span>
          </div>
          <div className="lab-md lab-pipe">
            <Markdown>{SETUP}</Markdown>
          </div>
        </section>

        <section className="panel lab-scoring rise" style={{ '--i': 3 } as CSSProperties}>
          <div className="p-head">
            <h2 className="p-title">How scoring works</h2>
            <span className="mlabel">{TOTAL_BUGS} mutants</span>
          </div>
          <div className="lab-md lab-dia">
            <Markdown>{SCORING}</Markdown>
          </div>
        </section>

        <StepRail data={data} current={cur} />

        <section className="panel lab-about rise" style={{ '--i': 4 } as CSSProperties}>
          <div className="p-head">
            <h2 className="p-title">About QA Shop</h2>
            <span className="mlabel">{PW_LAB_APP_URL.replace('http://', '')}</span>
          </div>
          <div className="lab-md">
            <Markdown>{PW_LAB_ABOUT}</Markdown>
          </div>
        </section>
      </div>
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
      <div className="page lab-page">
        <section className="panel lab-empty">
          <span className="chip fail">404 · step not found</span>
          <h1 className="h2">Step not found</h1>
          <Link to="/pw-lab" className="btn">
            <ArrowLeft size={16} aria-hidden="true" /> Playwright Lab
          </Link>
        </section>
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

/** the judge's run for one step as a pipeline: two runs on the correct app, then one per hidden bug */
function JudgePipe({ s, r }: { s: PwLabStep; r?: StepResult }) {
  const st = r?.status ?? 'no-tests';
  const has = st !== 'no-tests';
  const correct: string[] = !has
    ? ['queued', 'queued']
    : st === 'flaky'
      ? ['pass', 'flaky']
      : st === 'scored' || r?.passedOnCorrect
        ? ['pass', 'pass']
        : ['fail', 'queued'];
  const scored = st === 'scored';
  const caught = caughtOf(r);
  const nodes = [
    ...correct.map((c, i) => ({ c, l: `run ${i + 1}` })),
    ...Array.from({ length: s.hiddenBugs }, (_, i) => ({ c: !scored ? 'queued' : i < caught ? 'pass' : 'fail', l: `M${i + 1}` })),
  ];
  return (
    <div className="lab-jp">
      <div className="lab-jp-l">
        <span className="mlabel">
          Judge <b>· {s.tag}</b>
        </span>
        <span className="mlabel">{scored ? `${caught} of ${s.hiddenBugs} caught` : has ? 'not scored' : 'not run'}</span>
      </div>
      <ol className="lab-jp-row">
        {nodes.map((x, i) => (
          <li key={x.l} className={x.c}>
            <span className="lab-st">
              <span className={`node ${x.c}`} aria-hidden="true" />
              {i < nodes.length - 1 && <span className={`flow ${x.c === 'pass' ? 'lit' : 'dash'}`} aria-hidden="true" />}
            </span>
            <span className="lb">
              {x.l}
              <span className="sr-only">: {x.c === 'pass' ? (i < 2 ? 'passed on the correct app' : 'caught') : x.c === 'fail' ? (i < 2 ? 'failed on the correct app' : 'missed') : x.c === 'flaky' ? 'flaky' : 'not run'}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StepView({ s, n, prev, next }: { s: PwLabStep; n: number; prev?: PwLabStep; next?: PwLabStep }) {
  const judge = useJudgeResults();
  const { load } = judge;
  const data = load.state === 'ok' ? load.data : undefined;
  const r = data?.steps[s.id];
  const allCaught = r?.status === 'scored' && r.mutantsTotal > 0 && r.mutantsCaught === r.mutantsTotal;

  // celebrate the first time a step's results show every hidden bug caught
  useEffect(() => {
    if (!allCaught) return;
    const seen = getUiPrefs().celebratedPwSteps;
    if (seen.includes(s.id)) return;
    saveUiPrefs({ celebratedPwSteps: [...seen, s.id] });
    celebrate('Every bug caught!', `${s.title}: your tests catch all ${r?.mutantsTotal} hidden bugs.`);
  }, [allCaught, s.id, s.title, r?.mutantsTotal]);

  return (
    <div className="page lab-page">
      <ConsoleSlot>
        <span className="lab-slot">
          {s.tag} · {r?.status === 'scored' ? `${r.mutantsCaught}/${r.mutantsTotal} caught` : r ? STATUS_LABEL[r.status] : 'not judged'}
        </span>
      </ConsoleSlot>
      <div className="lab-bento lab-step">
        <Mission s={s} n={n} eyebrow={`Playwright Lab · step ${n}`}>
          <div className="lab-cta">
            <button type="button" className="btn btn-holo" onClick={() => void judge.refresh()} disabled={load.state === 'loading'}>
              <RefreshCw size={15} aria-hidden="true" /> Refresh results
            </button>
            <CopyCmd cmd={judgeCmd(s.id)} />
          </div>
        </Mission>

        <section className="panel lab-hunt lab-hunt-step rise" style={{ '--i': 1 } as CSSProperties} aria-label="This step's bug hunt">
          <div className="p-head">
            <span className="mlabel">
              Bug hunt <b>· {s.tag}</b>
            </span>
            {load.state === 'loading' ? (
              <span className="chip run">loading</span>
            ) : !r || r.status === 'no-tests' ? (
              <span className="chip skip">no tests</span>
            ) : r.status !== 'scored' ? (
              <span className="chip fail glitch" data-text="not scored">
                not scored
              </span>
            ) : allCaught ? (
              <span className="chip pass">all caught</span>
            ) : (
              <span className="chip flaky">{r.mutantsTotal - r.mutantsCaught} hiding</span>
            )}
          </div>
          <div className="lab-hunt-read">
            <span className="numeral">
              {r?.status === 'scored' ? r.mutantsCaught : '—'}
              <small>/{s.hiddenBugs}</small>
            </span>
            <span className="side">
              <b>hidden bugs caught</b>
              <br />
              {r && r.status !== 'no-tests'
                ? `${r.testsFound} ${r.testsFound === 1 ? 'test' : 'tests'} · run twice · ${(r.durationMs / 1000).toFixed(1)}s`
                : 'no tests tagged for this step yet'}
            </span>
          </div>
          <span
            className="seg tall lab-hunt-seg"
            style={{ '--n': s.hiddenBugs, '--v': caughtOf(r), '--g': 'var(--mint)', '--gap': '4px' } as CSSProperties}
            aria-hidden="true"
          />
          <JudgePipe s={s} r={r} />
          <div className="lab-all">
            <div className="mlabel">
              All steps <b>· {data ? `${data.overall.mutantsCaught}/${data.overall.mutantsTotal}` : `—/${TOTAL_BUGS}`} caught</b>
            </div>
            <HuntRows data={data} current={s} />
          </div>
          <RefreshBar {...judge} />
        </section>

        <section className="panel lab-spec rise" style={{ '--i': 2 } as CSSProperties} aria-labelledby="lab-spec-h">
          <div className="lab-tv-h">
            <h2 id="lab-spec-h" className="lab-tv-title">
              Spec
            </h2>
            <span className="lab-crumb">
              qa-shop <span>›</span> {s.where}
            </span>
            <span className="sp" />
            <span className="tag">{s.tag}</span>
            <span className="chip flaky">{s.hiddenBugs} hidden bugs</span>
          </div>
          <div className="ruler lab-tv-ruler" aria-hidden="true" />
          <div className="lab-md lab-spec-md">
            <Markdown>{s.spec}</Markdown>
          </div>
        </section>

        <StepRail data={data} current={s} />

        <section className="panel lab-brain rise" style={{ '--i': 4 } as CSSProperties} aria-labelledby="lab-brain-h">
          <div className="p-head">
            <h2 id="lab-brain-h" className="p-title">
              Brainstorm before you code
            </h2>
            <span className="mlabel">{s.prompts.length} prompts</span>
          </div>
          <ol className="lab-q">
            {s.prompts.map((p, i) => (
              <li key={p}>
                <span className="ix">Q{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
          <p className="lab-note">
            Write your scenarios down first (as you would for manual test cases), then automate the ones that check a rule from the
            spec. Every test needs the tag <code className="inline-code">{s.tag}</code>.
          </p>
          <CodeBlock snippet={{ language: 'typescript', title: `practice/tests/${s.id}.spec.ts`, code: tagExample(s) }} />
        </section>

        <section className="panel lab-report rise" style={{ '--i': 5 } as CSSProperties} aria-labelledby="lab-report-h">
          <div className="p-head">
            <h2 id="lab-report-h" className="p-title">
              Judge report
            </h2>
            <span className="mlabel">latest run</span>
          </div>
          {load.state === 'loading' && <p className="lab-note">Loading results…</p>}
          {load.state === 'missing' && <EmptyResults />}
          {r && <StepResultView r={r} />}
          <div className="lab-rp-foot">
            <span className="mlabel">Grade only this step</span>
            <CopyCmd cmd={judgeCmd(s.id)} />
          </div>
        </section>

        <nav className="panel flat lab-pager" aria-label="Step navigation">
          {prev ? (
            <Link to={`/pw-lab/${prev.id}`}>
              <span className="mlabel">← {prev.tag}</span>
              <span className="t">{prev.title}</span>
            </Link>
          ) : (
            <Link to="/pw-lab">
              <span className="mlabel">← Lab</span>
              <span className="t">Overview</span>
            </Link>
          )}
          {next ? (
            <Link to={`/pw-lab/${next.id}`} className="nx">
              <span className="mlabel">{next.tag} →</span>
              <span className="t">{next.title}</span>
            </Link>
          ) : (
            <Link to="/pw-lab" className="nx">
              <span className="mlabel">Lab →</span>
              <span className="t">Overview</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}

function StepResultView({ r }: { r: StepResult }) {
  if (r.status === 'no-tests') {
    return (
      <div className="lab-verdict none">
        <span className="ic" aria-hidden="true">
          <i>–</i>
        </span>
        <div>
          <b>No tests tagged for this step yet.</b>
          <span>Tag every test for this step, then run the judge.</span>
        </div>
      </div>
    );
  }
  const passes = r.status === 'scored';
  const allCaught = passes && r.mutantsCaught === r.mutantsTotal;
  return (
    <div className="lab-result">
      <div className={`lab-verdict ${allCaught ? 'pass' : passes ? 'part' : 'fail'}`}>
        <span className="ic" aria-hidden="true">
          <i>{passes ? '✓' : '✗'}</i>
        </span>
        <div>
          <b>
            {STATUS_LABEL[r.status]}
            {passes && ` · ${r.mutantsCaught}/${r.mutantsTotal} caught`}
          </b>
          <span>
            {r.testsFound} {r.testsFound === 1 ? 'test' : 'tests'}, run twice.
            {!passes && ' Hidden bugs are only tried once every test passes reliably on the correct app.'}
          </span>
        </div>
      </div>

      {r.failingTests.length > 0 && (
        <div className="lab-rp-sec">
          <div className="mlabel">
            <span>Failing on the correct app</span>
            <span>{r.failingTests.length}</span>
          </div>
          <div className="runner lab-runner" data-theme="dark">
            {r.failingTests.map((f) => (
              <div key={f.title} className="lab-fail">
                <div className="rl fail">
                  <span className="m">✗</span>
                  <span className="tx">{f.title}</span>
                  <span className="d" />
                </div>
                <pre className="lab-trace">{f.error}</pre>
              </div>
            ))}
          </div>
          <p className="lab-note">
            Traces are kept in <code className="inline-code">practice/test-results/judge-{r.id}/</code>. Open one with{' '}
            <code className="inline-code">npx playwright show-trace &lt;path&gt;/trace.zip</code>.
          </p>
        </div>
      )}

      {r.flakyTests.length > 0 && (
        <div className="lab-rp-sec">
          <div className="mlabel">
            <span>Flaky · passed once, failed once</span>
            <span>{r.flakyTests.length}</span>
          </div>
          <div className="runner lab-runner" data-theme="dark">
            {r.flakyTests.map((t) => (
              <div key={t} className="rl flaky">
                <span className="m">~</span>
                <span className="tx">
                  <em>flaky</em> {t}
                </span>
                <span className="d" />
              </div>
            ))}
          </div>
          <p className="lab-note">Usually a missing await, a hard wait, or a test that depends on another test's data.</p>
        </div>
      )}

      {r.caught.length > 0 && (
        <div className="lab-rp-sec">
          <div className="mlabel">
            <span>Bugs your tests caught</span>
            <span className="t-pass">{r.caught.length}</span>
          </div>
          <div className="lab-caught">
            {r.caught.map((c) => (
              <div key={c.id}>
                <span className="m">✓</span>
                <span>
                  {c.description}
                  {c.caughtBy?.length ? <span className="s"> caught by “{c.caughtBy[0]}”</span> : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.missedHints.length > 0 && (
        <div className="lab-rp-sec">
          <div className="mlabel">
            <span>Bugs still hiding · hints</span>
            <span className="t-fail">{r.missedHints.length}</span>
          </div>
          <div className="lab-hints">
            {r.missedHints.map((h, i) => (
              <span key={`${h}-${i}`} className="lab-hint">
                <i aria-hidden="true" />
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {r.warnings.length > 0 && (
        <div className="lab-rp-sec">
          <div className="mlabel">
            <span>Quality warnings</span>
            <span className="t-flaky">{r.warnings.length}</span>
          </div>
          <div className="lab-warns">
            {r.warnings.map((w) => (
              <p key={w} className="lab-warn-l">
                <span className="m">!</span>
                <span>{w}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <details className="lab-tests">
        <summary>
          <span className="mlabel">Tests found for this step</span> <span className="mlabel">{r.tests.length}</span>
        </summary>
        <ul>
          {r.tests.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
