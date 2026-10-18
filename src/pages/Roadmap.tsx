import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Code2, FlaskConical, Package } from 'lucide-react';
import { CODING_PROBLEMS, TOPIC_BY_ID } from '../content';
import { PRIORITY, PROJECTS, RESOURCES, RESUME_TIP, ROADMAP } from '../content/roadmap';
import { useProgress } from '../lib/progress';
import { topicStatus, type TopicStatus } from '../lib/stats';
import { Markdown } from '../components/ui';

const noopSubscribe = () => () => {};
const getSlot = () => document.getElementById('console-slot');

function ConsoleSlot({ children }: { children: ReactNode }) {
  // read after commit: on first load the shell's slot mounts in the same commit as the page
  const el = useSyncExternalStore(noopSubscribe, getSlot, () => null);
  return el ? createPortal(children, el) : null;
}

const pad = (n: number) => String(n).padStart(2, '0');
const MARK: Record<TopicStatus, string> = { passed: '✓', 'in-progress': '◆', new: '○' };
const MARK_LABEL: Record<TopicStatus, string> = { passed: 'exam passed', 'in-progress': 'in progress', new: 'not started' };
type BlockState = 'done' | 'now' | 'queued';

export default function RoadmapPage() {
  const p = useProgress();
  const solved = Object.keys(p.code).length;

  const blocks = ROADMAP.map((w, i) => {
    const topics = w.topics.map((id) => TOPIC_BY_ID.get(id)).filter((t) => !!t);
    const statuses = topics.map((t) => topicStatus(p, t));
    const passed = statuses.filter((s) => s === 'passed').length;
    const started = statuses.some((s) => s !== 'new');
    return { w, i, topics, statuses, passed, started, done: topics.length > 0 && passed === topics.length };
  });
  const nowIdx = blocks.findIndex((b) => !b.done);
  const state = (i: number): BlockState => (blocks[i].done ? 'done' : i === nowIdx ? 'now' : 'queued');
  const totalTopics = blocks.reduce((a, b) => a + b.topics.length, 0);
  const totalPassed = blocks.reduce((a, b) => a + b.passed, 0);
  const doneBlocks = blocks.filter((b) => b.done).length;
  const cur = nowIdx >= 0 ? blocks[nowIdx] : undefined;
  const nextTopic = cur?.topics.find((_, k) => cur.statuses[k] !== 'passed');

  return (
    <div className="page rm-page">
      <ConsoleSlot>
        <span className="rm-slot">
          {doneBlocks}/{ROADMAP.length} blocks · {totalPassed}/{totalTopics} exams
        </span>
      </ConsoleSlot>

      <div className="rm-bento">
        <section className="panel cut-lg rm-hero rise" style={{ '--i': 0 } as CSSProperties}>
          <div className="rm-hero-top">
            <span className="chip holo">Test plan</span>
            <span className="mlabel">
              <b>{ROADMAP.length}</b> blocks · <b>{ROADMAP.length * 2}</b> weeks
            </span>
          </div>
          <h1 className="rm-h1">
            Roadmap
            <span className="rm-h1-sub">
              <span className="outline">Manual</span> → Playwright
            </span>
          </h1>
          <p className="lede">
            Two weeks per block, each ending in a <b>deliverable</b> you can show. A block turns green when you pass the exams of
            every topic in it.
          </p>
          {cur && (
            <div className="rm-cta">
              <button type="button" className="btn btn-holo" onClick={() => jump(`rm-w${cur.i + 1}`)}>
                {cur.w.weeks}: {cur.w.title}{' '}
                <span className="arr">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </button>
              {nextTopic && (
                <Link to={`/topic/${nextTopic.id}`} className="rm-next">
                  <span className="mlabel">next exam</span>
                  <span>{nextTopic.title}</span>
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="panel flat rm-read rise" style={{ '--i': 1 } as CSSProperties} aria-label="Roadmap progress">
          <div className="ch">
            <div className="mlabel">
              <span>Blocks green</span>
            </div>
            <div className="readout">
              <span className="num">
                {doneBlocks}
                <small>/{ROADMAP.length}</small>
              </span>
            </div>
            <span className="seg" style={{ '--n': ROADMAP.length * 2, '--v': doneBlocks * 2, '--gap': '3px' } as CSSProperties} aria-hidden="true" />
            <p className="foot">
              week <b>{cur ? cur.i * 2 + 1 : ROADMAP.length * 2}</b> of {ROADMAP.length * 2}
            </p>
          </div>
          <div className="ch">
            <div className="mlabel">
              <span>Exams passed</span>
            </div>
            <div className="readout">
              <span className="num">
                {totalPassed}
                <small>/{totalTopics}</small>
              </span>
            </div>
            <span className="seg" style={{ '--n': totalTopics, '--v': totalPassed, '--gap': '2px', '--g': 'var(--mint)' } as CSSProperties} aria-hidden="true" />
            <p className="foot">topic exams on the plan</p>
          </div>
          <div className="ch">
            <div className="mlabel">
              <span>Coding</span>
            </div>
            <div className="readout">
              <span className="num">
                {solved}
                <small>/{CODING_PROBLEMS.length}</small>
              </span>
            </div>
            <span
              className="seg"
              style={{ '--n': 24, '--v': Math.round((solved / Math.max(1, CODING_PROBLEMS.length)) * 24), '--g': 'var(--iris)' } as CSSProperties}
              aria-hidden="true"
            />
            <p className="foot">
              <Link to="/coding">problems solved</Link>
            </p>
          </div>
        </section>

        <nav className="panel rm-pipe rise" style={{ '--i': 2 } as CSSProperties} aria-label="Roadmap stages">
          <div className="p-head">
            <span className="mlabel">
              Pipeline <b>· {ROADMAP.length} stages</b>
            </span>
            <span className="mlabel">{cur ? `stage ${pad(cur.i + 1)} running` : 'all green'}</span>
          </div>
          <ol className="rm-stages">
            {blocks.map((b) => {
              const st = state(b.i);
              return (
                <li key={b.w.weeks} className={st}>
                  <button type="button" onClick={() => jump(`rm-w${b.i + 1}`)} aria-current={st === 'now' ? 'step' : undefined}>
                    <span className="rm-ln">
                      <span className={`node ${st === 'done' ? 'pass' : st === 'now' ? 'now' : b.started ? 'flaky' : 'queued'}`} aria-hidden="true" />
                      {b.i < blocks.length - 1 && <span className={`flow ${st === 'done' ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    </span>
                    <span className="mlabel">
                      Stage {pad(b.i + 1)} · <b>{b.w.weeks.replace('Weeks ', 'W')}</b>
                    </span>
                    <span className="t">{b.w.title}</span>
                    <span className="n">
                      {b.passed}/{b.topics.length}
                      <span className="sr-only"> exams passed, {st === 'done' ? 'complete' : st === 'now' ? 'current stage' : 'queued'}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="rm-blocks">
        {blocks.map((b) => {
          const st = state(b.i);
          return (
            <article
              key={b.w.weeks}
              id={`rm-w${b.i + 1}`}
              className={`panel rm-block ${st} ${st === 'now' ? 'foil' : 'hov'} rise`}
              style={{ '--i': 3 + b.i } as CSSProperties}
              aria-labelledby={`rm-w${b.i + 1}-t`}
            >
              <div className="rm-b-top">
                <span className="mlabel">
                  Stage <b>{pad(b.i + 1)}</b> · {b.w.weeks}
                </span>
                {st === 'done' ? <span className="chip pass">green</span> : st === 'now' ? <span className="chip run">running</span> : <span className="chip skip">queued</span>}
              </div>
              <h2 id={`rm-w${b.i + 1}-t`} className="rm-b-title">
                {b.w.title}
              </h2>
              <ul className="rm-focus">
                {b.w.focus.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="rm-deliv">
                <span className="mlabel">
                  <Package size={13} aria-hidden="true" /> Deliverable
                </span>
                {b.w.deliverable}
              </div>
              {b.topics.length > 0 && (
                <div className="rm-b-foot">
                  <div className="rm-meter">
                    <span
                      className="seg thin"
                      style={{ '--n': b.topics.length, '--v': b.passed, '--g': 'var(--pass)', '--gap': '3px' } as CSSProperties}
                      aria-hidden="true"
                    />
                    <span className="mlabel">
                      <b>
                        {b.passed}/{b.topics.length}
                      </b>{' '}
                      exams passed
                    </span>
                  </div>
                  <div className="rm-links">
                    {b.topics.map((t, k) => (
                      <Link key={t.id} to={`/topic/${t.id}`} className={`rm-topic ${b.statuses[k]}`}>
                        <span className="m" role="img" aria-label={MARK_LABEL[b.statuses[k]]}>
                          {MARK[b.statuses[k]]}
                        </span>
                        {t.title}
                      </Link>
                    ))}
                    {b.w.pwLab && (
                      <Link to="/pw-lab" className="rm-topic tool">
                        <FlaskConical size={13} aria-hidden="true" /> Playwright Lab (Judge)
                      </Link>
                    )}
                    {b.w.coding && (
                      <Link to="/coding" className="rm-topic tool">
                        <Code2 size={13} aria-hidden="true" /> Coding practice ({solved}/{CODING_PROBLEMS.length})
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="rm-bento rm-lower">
        <section className="panel rm-projects" aria-labelledby="rm-proj-h">
          <div className="p-head">
            <h2 id="rm-proj-h" className="p-title">
              Practice projects
            </h2>
            <span className="mlabel">{PROJECTS.length} targets</span>
          </div>
          <p className="rm-intro">
            For each project: write manual test cases, file bug reports, record execution results, then automate the same flows with
            Playwright.
          </p>
          <div className="rm-proj-grid">
            {PROJECTS.map((pr, i) => (
              <article key={pr.name} className="rm-proj">
                <div className="rm-proj-h">
                  <span className="coord">T{pad(i + 1)}</span>
                  <span className="mlabel">{pr.kind}</span>
                </div>
                <h3>
                  <a href={pr.url} target="_blank" rel="noreferrer">
                    {pr.name} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </h3>
                <ul>
                  {pr.practise.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel rm-priority" aria-labelledby="rm-prio-h">
          <div className="p-head">
            <h2 id="rm-prio-h" className="p-title">
              Priority order
            </h2>
            <span className="mlabel">short on time?</span>
          </div>
          <ol className="rm-prio">
            {PRIORITY.map((x, i) => (
              <li key={x}>
                <span className="ix">{pad(i + 1)}</span>
                <span>{x}</span>
              </li>
            ))}
          </ol>
          <div className="rm-tip">
            <span className="mlabel">Resume tip</span>
            <Markdown>{RESUME_TIP}</Markdown>
          </div>
        </section>
      </div>

      <div className="rm-res-head">
        <h2 className="h3">Resources</h2>
        <span className="mlabel">{RESOURCES.reduce((a, g) => a + g.items.length, 0)} links</span>
      </div>
      <div className="rm-res">
        {RESOURCES.map((g) => (
          <section key={g.title} className="panel rm-res-g" aria-label={g.title}>
            <div className="p-head">
              <span className="mlabel">
                <b>{g.title}</b>
              </span>
              <span className="mlabel">{g.items.length}</span>
            </div>
            <ul>
              {g.items.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.name} <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                  <p>{r.what}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/** in-page jump that doesn't fight the hash router */
function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
