import { ArrowUpRight } from 'lucide-react';
import { PRIORITY, PROJECTS, RESOURCES, RESUME_TIP } from '../content/roadmap';
import { StudyPlanner } from '../components/StudyPlanner';
import { Markdown } from '../components/ui';

const pad = (n: number) => String(n).padStart(2, '0');

/** Roadmap: plan your journey (pace and dates for every phase), then practice projects, priorities and resources. */
export default function RoadmapPage() {
  return (
    <div className="page rm-page">
      {/* the journey planner: replaces the week-by-week list, which repeated the Syllabus */}
      <StudyPlanner />

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
