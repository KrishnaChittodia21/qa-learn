import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CODING_PROBLEMS } from '../content';
import type { CodingProblem } from '../types';
import { setDraft, setFlag, useProgress } from '../lib/progress';
import { celebrate } from '../lib/celebrate';
import { Lightbulb } from 'lucide-react';
import { TestRunner } from '../components/TestRunner';
import { Badge, CodeBlock, CodeEditor, DifficultyBadge, FollowUps, Markdown, ProgressBar, Reveal } from '../components/ui';

const CATEGORIES: { id: CodingProblem['category']; label: string }[] = [
  { id: 'arrays', label: 'Arrays' },
  { id: 'strings', label: 'Strings' },
  { id: 'objects', label: 'Objects' },
  { id: 'logic', label: 'Logic & numbers' },
  { id: 'async', label: 'Async & promises' },
  { id: 'qa-utils', label: 'QA utilities' },
];

export function CodingListPage() {
  const p = useProgress();
  const [cat, setCat] = useState<'all' | CodingProblem['category']>('all');
  const [hideSolved, setHideSolved] = useState(false);
  const solved = CODING_PROBLEMS.filter((q) => p.code[q.id]).length;
  const list = CODING_PROBLEMS.filter((q) => (cat === 'all' || q.category === cat) && !(hideSolved && p.code[q.id]));

  return (
    <div className="page">
      <div className="topic-head">
        <div className="eyebrow">Practice</div>
        <h1>JavaScript coding practice</h1>
        <p className="lead">
          The array, string and object problems that QA automation and SDET interviews ask. Write the function in the editor, run
          the visible tests, then submit to run the hidden ones too. Your code runs in your browser.
        </p>
        <div className="topic-progress">
          <ProgressBar value={(solved / Math.max(1, CODING_PROBLEMS.length)) * 100} tone="good" />
          <span className="small muted">
            {solved}/{CODING_PROBLEMS.length} solved
          </span>
        </div>
      </div>

      <div className="row wrap gap-s coding-filters">
        <button type="button" className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
          All ({CODING_PROBLEMS.length})
        </button>
        {CATEGORIES.map((c) => {
          const n = CODING_PROBLEMS.filter((q) => q.category === c.id).length;
          if (!n) return null;
          return (
            <button key={c.id} type="button" className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              {c.label} ({n})
            </button>
          );
        })}
        <label className="small muted hide-solved">
          <input type="checkbox" checked={hideSolved} onChange={(e) => setHideSolved(e.target.checked)} /> Hide solved
        </label>
      </div>

      {!CODING_PROBLEMS.length && <p className="muted">Problems are still being written. Check back soon.</p>}
      <div className="card-grid">
        {list.map((q) => (
          <Link key={q.id} to={`/coding/${q.id}`} className={`topic-card coding-card cat-${q.category} ${p.code[q.id] ? 'st-passed' : ''}`}>
            <div className="topic-card-top">
              <span className={`dot dot-${p.code[q.id] ? 'passed' : 'new'}`} />
              <DifficultyBadge d={q.difficulty} />
            </div>
            <h3>{q.title}</h3>
            <p className="muted small">
              {CATEGORIES.find((c) => c.id === q.category)?.label} · {q.tests.length} tests
              {p.code[q.id] ? ' · ✓ solved' : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CodingProblemPage() {
  const { pid = '' } = useParams();
  const idx = CODING_PROBLEMS.findIndex((q) => q.id === pid);
  const q = CODING_PROBLEMS[idx];
  if (!q) {
    return (
      <div className="page">
        <h1>Problem not found</h1>
        <Link to="/coding">← All problems</Link>
      </div>
    );
  }
  // keyed so that switching problems resets editor state, results and hints
  return <ProblemView key={q.id} q={q} prev={CODING_PROBLEMS[idx - 1]} next={CODING_PROBLEMS[idx + 1]} />;
}

function ProblemView({ q, prev, next }: { q: CodingProblem; prev?: CodingProblem; next?: CodingProblem }) {
  const p = useProgress();
  const draftKey = `code:${q.id}`;
  const code = p.drafts[draftKey] ?? q.starter;
  const [hints, setHints] = useState(0);
  // bumping the key clears the previous results after a reset
  const [runKey, setRunKey] = useState(0);
  const solved = !!p.code[q.id];

  return (
    <div className="page">
      <Link to="/coding" className="muted small">
        ← All problems
      </Link>
      <div className="topic-head">
        <div className="row wrap gap-s">
          <DifficultyBadge d={q.difficulty} />
          <Badge tone="tag">{q.category}</Badge>
          {solved && <Badge tone="good">✓ Solved</Badge>}
        </div>
        <h1>{q.title}</h1>
        {q.askedIn && <p className="muted small">📌 {q.askedIn}</p>}
      </div>

      <div className="coding-grid">
        <section className="card coding-prompt">
          <Markdown>{q.prompt}</Markdown>
          <div className="label">Example tests</div>
          <ul className="coding-examples">
            {q.tests
              .filter((t) => !t.hidden)
              .slice(0, 3)
              .map((t, i) => (
                <li key={i}>
                  <code>
                    {q.fnName}({t.args.map((a) => JSON.stringify(a)).join(', ')}) → {JSON.stringify(t.expected)}
                  </code>
                </li>
              ))}
          </ul>
          <div className="row gap-s wrap">
            {hints < q.hints.length && (
              <button className="btn-ghost" type="button" onClick={() => setHints((h) => h + 1)}>
                <Lightbulb size={15} aria-hidden="true" /> Hint {hints + 1}/{q.hints.length}
              </button>
            )}
          </div>
          {hints > 0 && (
            <ol className="hints">
              {q.hints.slice(0, hints).map((h) => (
                <li key={h}>
                  <Markdown>{h}</Markdown>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="coding-work">
          <CodeEditor value={code} onChange={(v) => setDraft(draftKey, v)} language="javascript" />
          <TestRunner
            key={runKey}
            code={code}
            fnName={q.fnName}
            tests={q.tests}
            onAllPassed={() => {
              setFlag('code', q.id, true);
              celebrate('Problem solved!', `${q.title}: all ${q.tests.length} tests pass.`);
            }}
            extraActions={
              <button
                className="btn-ghost"
                type="button"
                onClick={() => {
                  setDraft(draftKey, q.starter);
                  setRunKey((k) => k + 1);
                }}
              >
                Reset code
              </button>
            }
          />
        </section>
      </div>

      <Reveal label="Reference solution & explanation">
        <CodeBlock snippet={{ language: 'javascript', title: 'Solution', code: q.solution }} />
        <Markdown>{q.explanation}</Markdown>
        <FollowUps items={q.followUps} />
      </Reveal>

      <div className="pager">
        {prev ? <Link to={`/coding/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next ? <Link to={`/coding/${next.id}`}>{next.title} →</Link> : <Link to="/coding">All problems</Link>}
      </div>
    </div>
  );
}
