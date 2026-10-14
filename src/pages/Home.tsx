import { Link } from 'react-router-dom';
import { CODING_PROBLEMS, PHASES, TOPICS } from '../content';
import { useProgress } from '../lib/progress';
import { topicCompletion, topicStatus } from '../lib/stats';
import { ProgressBar } from '../components/ui';
import { weakTopics } from '../lib/weak';

export default function Home() {
  const p = useProgress();
  const passed = TOPICS.filter((t) => topicStatus(p, t) === 'passed').length;
  const totalMcq = TOPICS.reduce((a, t) => a + t.test.length, 0);
  const totalIq = TOPICS.reduce((a, t) => a + t.interviewQuestions.length, 0);
  const totalBoe = TOPICS.reduce((a, t) => a + t.envelopeQuestions.length, 0);
  const totalCc = TOPICS.reduce((a, t) => a + t.codeChallenges.length, 0);
  const practicedIq = Object.keys(p.iq).length;
  const next = TOPICS.find((t) => topicStatus(p, t) !== 'passed');
  const weak = weakTopics(p, TOPICS);
  const readiness = TOPICS.length
    ? Math.round(TOPICS.reduce((a, t) => a + topicCompletion(p, t), 0) / TOPICS.length)
    : 0;

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Your QA engineer roadmap</h1>
          <p className="lead">
            {TOPICS.length} topics across {PHASES.length} phases: manual testing, API &amp; SQL, JavaScript, Playwright and
            interview prep. Built from the ISTQB syllabus, the Playwright docs, javascript.info and well-known testing authors.
            Learn each topic with animations, improve weak tests and buggy code, practise interview questions and drills, then
            pass the timed exam.
          </p>
          {next && (
            <Link to={`/topic/${next.id}`} className="btn btn-primary">
              {topicStatus(p, next) === 'new' ? 'Start' : 'Continue'}: {next.title} →
            </Link>
          )}
        </div>
        <div className="stat-grid">
          <Stat label="Exams passed" value={`${passed}/${TOPICS.length}`} />
          <Stat label="Readiness" value={`${readiness}%`} />
          <Stat label="Interview Qs practised" value={`${practicedIq}/${totalIq}`} />
          <Stat label="Question bank" value={`${totalMcq + totalIq + totalBoe}`} hint={`${totalMcq} MCQ · ${totalBoe} drills · ${totalCc} labs · ${CODING_PROBLEMS.length} coding`} />
        </div>
      </section>

      {weak.length > 0 && (
        <section className="card weak-card">
          <div className="row between wrap">
            <h2>Focus next: your weakest areas</h2>
            <Link to="/weak-areas">Full analysis →</Link>
          </div>
          <ul className="weak-sections">
            {weak.slice(0, 4).map((w) => (
              <li key={w.topic.id}>
                <span className="weak-count">{w.attempts ? `${w.last}%` : `${w.wrong.length} wrong`}</span>
                <span className="weak-heading">
                  {w.topic.title}
                  {w.sections[0] && <span className="muted small"> · weakest: {w.sections[0].heading}</span>}
                </span>
                <Link
                  to={w.sections[0] ? `/topic/${w.topic.id}?tab=learn&s=${w.sections[0].index}` : `/topic/${w.topic.id}`}
                  className="small"
                >
                  Revise →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {PHASES.map((ph) => {
        const topics = TOPICS.filter((t) => t.phase === ph.id);
        if (!topics.length) return null;
        const phPassed = topics.filter((t) => topicStatus(p, t) === 'passed').length;
        return (
          <section key={ph.id} className="phase">
            <div className="phase-head">
              <div>
                <div className="eyebrow">Phase {ph.number}</div>
                <h2>{ph.title}</h2>
                <p className="muted">{ph.blurb}</p>
              </div>
              <div className="phase-meter">
                <span className="muted">
                  {phPassed}/{topics.length} passed
                </span>
                <ProgressBar value={(phPassed / topics.length) * 100} tone="good" />
              </div>
            </div>
            <div className="card-grid">
              {topics.map((t) => {
                const st = topicStatus(p, t);
                const rec = p.tests[t.id];
                return (
                  <Link key={t.id} to={`/topic/${t.id}`} className={`topic-card st-${st}`}>
                    <div className="topic-card-top">
                      <span className={`dot dot-${st}`} />
                      <span className="muted small">{t.estimatedMinutes} min</span>
                    </div>
                    <h3>{t.title}</h3>
                    <p className="muted small">{t.subtitle}</p>
                    <div className="topic-card-foot">
                      <ProgressBar value={topicCompletion(p, t)} />
                      <span className="small">
                        {st === 'passed' ? `✓ Passed · best ${rec?.best}%` : rec ? `Best ${rec.best}%` : `${t.test.length}-question exam`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="phase">
        <div className="phase-head">
          <div>
            <div className="eyebrow">Practice</div>
            <h2>Hands-on practice</h2>
            <p className="muted">Run real JavaScript in the browser, and follow the 12-week plan with portfolio projects.</p>
          </div>
        </div>
        <div className="card-grid">
          <Link to="/coding" className="topic-card">
            <h3>⌨️ JavaScript coding practice</h3>
            <p className="muted small">
              {CODING_PROBLEMS.length} array, string, object and async problems asked in QA/SDET interviews. Write the function,
              run the tests, compare with the reference solution.
            </p>
            <div className="topic-card-foot">
              <ProgressBar value={(Object.keys(p.code).length / Math.max(1, CODING_PROBLEMS.length)) * 100} />
              <span className="small">
                {Object.keys(p.code).length}/{CODING_PROBLEMS.length} solved
              </span>
            </div>
          </Link>
          <Link to="/roadmap" className="topic-card">
            <h3>🗺️ 12-week roadmap &amp; projects</h3>
            <p className="muted small">
              Week-by-week plan with deliverables, practice sites (SauceDemo, The Internet, Restful Booker) and the best free
              resources.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
