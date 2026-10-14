import { Link } from 'react-router-dom';
import { CODING_PROBLEMS, TOPIC_BY_ID } from '../content';
import { PRIORITY, PROJECTS, RESOURCES, RESUME_TIP, ROADMAP } from '../content/roadmap';
import { useProgress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { Markdown, ProgressBar } from '../components/ui';

export default function RoadmapPage() {
  const p = useProgress();
  return (
    <div className="page">
      <div className="topic-head">
        <div className="eyebrow">Plan</div>
        <h1>12-week QA roadmap: manual testing → Playwright</h1>
        <p className="lead">
          Two weeks per block, each ending in a deliverable you can show. The dots fill in as you pass each block&apos;s topic
          exams.
        </p>
      </div>

      <div className="roadmap-weeks">
        {ROADMAP.map((w, i) => {
          const topics = w.topics.map((id) => TOPIC_BY_ID.get(id)).filter((t) => !!t);
          const passed = topics.filter((t) => topicStatus(p, t) === 'passed').length;
          const done = topics.length > 0 && passed === topics.length;
          return (
            <article key={w.weeks} className={`card roadmap-week ${done ? 'done' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="eyebrow">{w.weeks}</div>
              <h3>{w.title}</h3>
              <ul>
                {w.focus.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="roadmap-deliverable">
                📦 <strong>Deliverable:</strong> {w.deliverable}
              </div>
              {topics.length > 0 && (
                <>
                  <div className="topic-progress">
                    <ProgressBar value={(passed / topics.length) * 100} tone="good" />
                    <span className="small muted">
                      {passed}/{topics.length} exams passed
                    </span>
                  </div>
                  <div className="roadmap-links">
                    {topics.map((t) => (
                      <Link key={t.id} to={`/topic/${t.id}`} className="chip">
                        {topicStatus(p, t) === 'passed' ? '✓ ' : ''}
                        {t.title}
                      </Link>
                    ))}
                    {w.coding && (
                      <Link to="/coding" className="chip">
                        ⌨️ Coding practice ({Object.keys(p.code).length}/{CODING_PROBLEMS.length})
                      </Link>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <h2>Practice projects</h2>
      <p className="muted">
        For each project: write manual test cases, file bug reports, record execution results, then automate the same flows with
        Playwright.
      </p>
      <div className="resource-grid">
        {PROJECTS.map((pr) => (
          <article key={pr.name} className="card resource-card">
            <h4>
              <a href={pr.url} target="_blank" rel="noreferrer">
                {pr.name} ↗
              </a>
            </h4>
            <div className="muted small">{pr.kind}</div>
            <ul className="small">
              {pr.practise.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h2>Priority order</h2>
      <p className="muted">Short on time? Learn in this order.</p>
      <ol className="priority-list card">
        {PRIORITY.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>

      <div className="card info small">
        <Markdown>{`💼 **Resume tip.** ${RESUME_TIP}`}</Markdown>
      </div>

      <h2>Resources</h2>
      {RESOURCES.map((g) => (
        <section key={g.title}>
          <h3>{g.title}</h3>
          <div className="resource-grid">
            {g.items.map((r) => (
              <article key={r.url} className="card resource-card">
                <h4>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.name} ↗
                  </a>
                </h4>
                <p className="muted small">{r.what}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
