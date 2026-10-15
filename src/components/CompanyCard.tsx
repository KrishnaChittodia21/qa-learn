import { Link } from 'react-router-dom';
import { TOPIC_BY_ID } from '../content';
import type { CompanyQuestion } from '../types';
import { AREA_LABEL } from '../lib/companyAreas';
import { setFlag, useProgress } from '../lib/progress';
import { Badge, DifficultyBadge, FollowUps, Markdown, Reveal } from './ui';


/** One company-reported question: try it, reveal our answer, check the source. */
export function CompanyCard({ q, showTopic = true }: { q: CompanyQuestion; showTopic?: boolean }) {
  const p = useProgress();
  const done = !!p.company[q.id];
  const topic = q.topic ? TOPIC_BY_ID.get(q.topic) : undefined;
  return (
    <article className={`card company-q ${done ? 'done' : ''}`}>
      <div className="row wrap gap-s company-q-meta">
        <span className="company-name">{q.company}</span>
        <Badge tone="tag">{AREA_LABEL[q.area]}</Badge>
        <DifficultyBadge d={q.difficulty} />
        {(q.role || q.round) && <span className="small muted">{[q.role, q.round].filter(Boolean).join(' · ')}</span>}
      </div>
      <h3 className="company-q-text">{q.question}</h3>
      <Reveal label="Show a strong answer">
        <Markdown>{q.answer}</Markdown>
        <FollowUps items={q.followUps} />
      </Reveal>
      <div className="row between wrap company-q-foot">
        <span className="small muted">
          Reported: {/* sources are external pages, opened in a new tab */}
          <a href={q.source.url} target="_blank" rel="noreferrer">
            {q.source.name} ↗
          </a>{' '}
          ({q.source.year})
        </span>
        <span className="row gap-s">
          {showTopic && topic && (
            <Link to={`/topic/${topic.id}`} className="small">
              Learn it: {topic.title} →
            </Link>
          )}
          <button type="button" className={`btn-ghost btn-xs ${done ? 'on' : ''}`} onClick={() => setFlag('company', q.id, !done)}>
            {done ? '✓ Practised' : 'Mark practised'}
          </button>
        </span>
      </div>
    </article>
  );
}
