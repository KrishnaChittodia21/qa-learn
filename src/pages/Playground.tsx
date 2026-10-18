import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { CodeEditor } from '../components/ui';
import { runScript, type ScriptResult } from '../lib/runScript';
import { loadPlayground, savePlayground, type Snippet } from '../lib/playground';

const EXAMPLES: { name: string; code: string }[] = [
  {
    name: 'Array methods',
    code: `const prices = ['$29.99', '$9.99', '$15.99'];

const numbers = prices.map((p) => Number(p.replace('$', '')));
console.log(numbers);

const cheap = numbers.filter((n) => n < 20);
console.log(cheap);

const total = numbers.reduce((sum, n) => sum + n, 0);
console.log(total.toFixed(2));

// sort() compares strings by default: predict this before running!
console.log([10, 9, 1, 2].sort());
console.log([10, 9, 1, 2].sort((a, b) => a - b));`,
  },
  {
    name: 'Remove duplicates',
    code: `const ids = [3, 1, 3, 2, 1, 5];

// 1. with a Set
console.log([...new Set(ids)]);

// 2. without built-ins (what interviewers often ask for)
function unique(arr) {
  const seen = {};
  const out = [];
  for (const x of arr) {
    if (!seen[x]) {
      seen[x] = true;
      out.push(x);
    }
  }
  return out;
}
console.log(unique(ids));`,
  },
  {
    name: 'Event loop order',
    code: `console.log('1: sync');
setTimeout(() => console.log('2: timeout'), 0);
Promise.resolve().then(() => console.log('3: microtask'));
(async () => {
  console.log('4: async start');
  await null;
  console.log('5: after await');
})();
console.log('6: sync end');
// Predict the order before you press Run.`,
  },
  {
    name: 'async / await',
    code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchUser(id) {
  await wait(100);
  if (id < 0) throw new Error('Invalid id ' + id);
  return { id, name: 'user' + id };
}

console.time('sequential');
const a = await fetchUser(1);
const b = await fetchUser(2);
console.timeEnd('sequential');

console.time('parallel');
const [c, d] = await Promise.all([fetchUser(3), fetchUser(4)]);
console.timeEnd('parallel');
console.log(a, b, c, d);

try {
  await fetchUser(-1);
} catch (err) {
  console.error('Caught:', err.message);
}`,
  },
  {
    name: 'Closures & var vs let',
    code: `for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log('var', i), 0);
}
for (let j = 1; j <= 3; j++) {
  setTimeout(() => console.log('let', j), 0);
}

function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
console.log(next(), next(), next());`,
  },
  {
    name: 'Class (Page Object style)',
    code: `class LoginPage {
  constructor(baseUrl) {
    this.url = baseUrl + '/login';
    this.attempts = 0;
  }
  login(user, pass) {
    this.attempts++;
    return user === 'standard_user' && pass === 'secret_sauce' ? 'inventory' : 'error';
  }
}

const page = new LoginPage('https://www.saucedemo.com');
console.log(page.login('standard_user', 'wrong'));
console.log(page.login('standard_user', 'secret_sauce'));
console.log(page);`,
  },
];

export default function PlaygroundPage() {
  const [state, setState] = useState(loadPlayground);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const active = state.snippets.find((s) => s.id === state.active) ?? state.snippets[0];
  const runRef = useRef<() => void>(() => {});

  useEffect(() => savePlayground(state), [state]);

  const update = (patch: Partial<Snippet>) =>
    setState((s) => ({ ...s, snippets: s.snippets.map((x) => (x.id === active.id ? { ...x, ...patch } : x)) }));

  const addSnippet = (name: string, code: string) => {
    const id = `s${Date.now().toString(36)}`;
    setState((s) => ({ active: id, snippets: [...s.snippets, { id, name, code }] }));
    setResult(null);
  };

  const remove = () => {
    if (state.snippets.length === 1) {
      update({ code: '' });
      return;
    }
    setState((s) => {
      const snippets = s.snippets.filter((x) => x.id !== active.id);
      return { active: snippets[0].id, snippets };
    });
    setResult(null);
  };

  const run = async () => {
    setBusy(true);
    setResult(await runScript(active.code));
    setBusy(false);
  };
  // keep the keyboard shortcut pointed at the latest run (current snippet)
  useEffect(() => {
    runRef.current = run;
  });

  // Ctrl/Cmd + Enter runs the code from anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // uncaught errors / timeouts only (console.error output is just printed in red)
  const errors = !result ? 0 : result.error ? 1 : result.lines.filter((l) => l.kind === 'error' && l.text.startsWith('Uncaught')).length;
  const file = active.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'snippet';
  const lines = active.code.split('\n').length;

  return (
    <div className="page pg-page">
      <div className="pg-bento">
        <section className="panel cut-lg pg-hero rise" style={{ '--i': 0 } as CSSProperties}>
          <div>
            <span className="chip holo">Sandbox</span>
            <h1>
              JavaScript <span className="outline">playground</span>
            </h1>
            <p className="lede">
              Write any JavaScript, press <b>Run</b> and see the console output, printed the way Node prints it. Top-level{' '}
              <code className="inline-code">await</code>, timers and promises work. Your snippets are saved in this browser.
            </p>
          </div>
          <div className="pg-hero-stats">
            <div className="readout">
              <span className="mlabel">Snippets</span>
              <span className="num">{state.snippets.length}</span>
            </div>
            <div className="readout">
              <span className="mlabel">Last run</span>
              <span className="num">
                {result && !result.timedOut ? result.ms : '—'}
                <small>ms</small>
              </span>
            </div>
          </div>
        </section>

        <div className="panel flat pg-tabs rise" style={{ '--i': 1 } as CSSProperties} role="group" aria-label="Snippets">
          {state.snippets.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`chip ${s.id === active.id ? 'on' : ''}`}
              aria-pressed={s.id === active.id}
              onClick={() => {
                setState((x) => ({ ...x, active: s.id }));
                setResult(null);
                setRenaming(false);
              }}
            >
              <span>{s.name}</span>
            </button>
          ))}
          <button type="button" className="chip" onClick={() => addSnippet(`Snippet ${state.snippets.length + 1}`, '')}>
            <Plus size={13} aria-hidden="true" /> New
          </button>
          <select
            className="pg-examples"
            value=""
            onChange={(e) => {
              const ex = EXAMPLES.find((x) => x.name === e.target.value);
              if (ex) addSnippet(ex.name, ex.code);
            }}
            aria-label="Open an example"
          >
            <option value="">Open an example…</option>
            {EXAMPLES.map((ex) => (
              <option key={ex.name} value={ex.name}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        <section className="panel cx-ed pg-editor" data-theme="dark" aria-label="Editor">
          <div className="cx-ed-tabs">
            <span className="on">
              {renaming ? (
                <input
                  className="pg-name"
                  autoFocus
                  value={active.name}
                  onChange={(e) => update({ name: e.target.value })}
                  onBlur={() => setRenaming(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
                  aria-label="Snippet name"
                />
              ) : (
                <button type="button" className="pg-name-btn" onClick={() => setRenaming(true)} title="Rename">
                  <span>{file}.js</span>
                  <Pencil size={12} aria-hidden="true" />
                </button>
              )}
            </span>
            <span className="rt cx-hide-s">saved locally</span>
            <button type="button" className="cx-reset" onClick={remove}>
              <Trash2 size={13} aria-hidden="true" /> {state.snippets.length === 1 ? 'Clear' : 'Delete'}
            </button>
          </div>
          <div className="cx-ed-wrap" data-theme="dark">
            <div className="cx-gutter" aria-hidden="true">
              {Array.from({ length: lines }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <div className="cx-ed-main">
              <CodeEditor value={active.code} onChange={(code) => update({ code })} language="javascript" />
            </div>
          </div>
          <div className="cx-ed-act">
            <button className="btn btn-holo" type="button" disabled={busy} onClick={run}>
              <Play size={15} aria-hidden="true" /> {busy ? 'Running…' : 'Run'}
            </button>
            <span className="sp" />
            <span className="pg-kbd">
              <kbd>Ctrl/⌘</kbd> + <kbd>Enter</kbd>
            </span>
          </div>
          <div className="cx-ed-status">
            {busy ? (
              <span className="run">● running</span>
            ) : !result ? (
              <span>ready</span>
            ) : errors ? (
              <span className="e">✗ {errors} error{errors === 1 ? '' : 's'}</span>
            ) : (
              <span className="ok">✓ ran clean</span>
            )}
            <span>{lines} lines</span>
            <span className="sp" />
            <span className="ok">◆ sandbox · 5s limit</span>
          </div>
        </section>

        <section className="panel tr-panel pg-output" data-theme="dark" aria-label="Console output">
          <div className="tr-head">
            <span className="tr-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="tr-ttl">console</span>
            {busy ? (
              <span className="chip run">running</span>
            ) : !result ? (
              <span className="chip skip">idle</span>
            ) : result.timedOut ? (
              <span className="chip flaky">timed out</span>
            ) : errors ? (
              <span className="chip fail glitch" data-text={`${errors} error${errors === 1 ? '' : 's'}`}>
                {errors} error{errors === 1 ? '' : 's'}
              </span>
            ) : (
              <span className="chip pass">{result.ms} ms</span>
            )}
          </div>
          <div className="tr-body runner" aria-live="polite">
            <div className="tr-cmd">
              <span>$</span> node {file}.js
            </div>
            {!result && (
              <div className="tr-info">
                Output appears here. Try an example from the menu above.
                <span className="caret" aria-hidden="true" />
              </div>
            )}
            {result && (
              <pre className="console-out pg-console" data-theme="dark">
                {result.lines.map((l, i) => (
                  <div key={i} className={`pg-line pg-${l.kind}`}>
                    {l.text}
                  </div>
                ))}
                {result.error && !result.lines.some((l) => l.text.startsWith('Uncaught')) && (
                  <div className="pg-line pg-error">
                    {result.timedOut ? '⏱ ' : 'Uncaught '}
                    {result.error.message}
                    {result.error.line ? `  (line ${result.error.line})` : ''}
                  </div>
                )}
                {!result.lines.length && !result.error && <div className="pg-line pg-muted">(no output)</div>}
              </pre>
            )}
          </div>
          <p className="pg-foot">
            Runs in your browser, like Node without <code>require</code>, <code>fs</code> or <code>import</code>. Stops after 5 s.
          </p>
        </section>
      </div>
    </div>
  );
}
