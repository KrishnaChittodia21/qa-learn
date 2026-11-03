import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { TOPIC_BY_ID } from '../content';
import type { CompanyQuestion } from '../types';
import { AREA_LABEL } from '../lib/companyAreas';
import { useCompanyAnswer } from '../lib/answers';
import { setFlag, useProgress } from '../lib/progress';
import { FollowUps, Markdown } from './ui';
import { SaveButton } from './SaveButton';

/** One company-reported question: try it, reveal our answer (from qa-api, for a signed-in learner), check the source. */
export function CompanyCard({ q, showTopic = true }: { q: CompanyQuestion; showTopic?: boolean }) {
  const p = useProgress();
  const { pathname, search } = useLocation();
  const strong = useCompanyAnswer(q.id);
  const done = !!p.company[q.id];
  const topic = q.topic ? TOPIC_BY_ID.get(q.topic) : undefined;
  const meta = [q.role, q.round].filter(Boolean).join(' · ');
  return (
    <article className={`panel hov company-q ${done ? 'done' : ''}`}>
      <div className="company-q-meta">
        <span className="company-name">{q.company}</span>
        <span className="tag">{AREA_LABEL[q.area]}</span>
        <span className={`chip lvl lvl-${q.difficulty}`}>{q.difficulty}</span>
        {meta && <span className="mlabel company-q-round">{meta}</span>}
        {done && <span className="chip pass company-q-done">✓ Practised</span>}
        <SaveButton kind="company" id={q.id} compact />
      </div>
      <h3 className="company-q-text">{q.question}</h3>
      {strong.answer ? (
        <div className="company-q-answer">
          <Markdown>{strong.answer.answer}</Markdown>
          <FollowUps items={strong.answer.followUps} />
        </div>
      ) : strong.status === 'out' ? (
        <Link className="btn btn-line btn-sm" to={`/signup?next=${encodeURIComponent(pathname + search)}`}>
          <Lock size={14} aria-hidden="true" /> Sign up to see a strong answer
        </Link>
      ) : (
        strong.status === 'in' && (
          <div className="reveal-gate">
            <button className="btn btn-line btn-sm" type="button" disabled={strong.busy} onClick={() => void strong.load()}>
              {strong.busy ? 'Loading…' : 'Show a strong answer'}
            </button>
            {strong.error && (
              <p className="auth-err" role="alert">
                {strong.error}
              </p>
            )}
          </div>
        )
      )}
      <div className="company-q-foot">
        <span className="company-q-src">
          <span className="mlabel">Reported</span>{' '}
          {/* sources are external pages, opened in a new tab */}
          <a href={q.source.url} target="_blank" rel="noreferrer">
            {q.source.name} ↗
          </a>{' '}
          <span className="mono ink3">{q.source.year}</span>
        </span>
        <span className="company-q-act">
          {showTopic && topic && (
            <Link to={`/topic/${topic.id}`} className="company-q-learn">
              Learn it: {topic.title} →
            </Link>
          )}
          <button
            type="button"
            className={`btn btn-xs ${done ? 'btn-ghost' : 'btn-line'}`}
            aria-pressed={done}
            onClick={() => setFlag('company', q.id, !done)}
          >
            {done ? 'Undo practised' : 'Mark practised'}
          </button>
        </span>
      </div>
    </article>
  );
}
