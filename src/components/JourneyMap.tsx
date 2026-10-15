import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PHASES, TOPICS } from '../content';
import { useProgress } from '../lib/progress';
import { topicCompletion, topicStatus } from '../lib/stats';
import { ProgressRing } from './ProgressRing';

/** The phases as connected nodes along a path that fills as phases are completed. */
export function JourneyMap() {
  const p = useProgress();
  const nav = useNavigate();
  const phases = PHASES.map((ph) => {
    const topics = TOPICS.filter((t) => t.phase === ph.id);
    const passed = topics.filter((t) => topicStatus(p, t) === 'passed').length;
    const pct = topics.length ? topics.reduce((a, t) => a + topicCompletion(p, t), 0) / topics.length : 0;
    return { ph, topics: topics.length, passed, pct, done: topics.length > 0 && passed === topics.length };
  });
  const current = phases.findIndex((x) => !x.done);
  return (
    <section className="card journey" aria-labelledby="journey-title">
      <h2 id="journey-title">Your journey</h2>
      <ol className="journey-path">
        {phases.map((x, i) => (
          <li key={x.ph.id} className={`journey-node ${x.done ? 'done' : ''} ${i === current ? 'current' : ''}`}>
            {i > 0 && (
              <span className="journey-link" aria-hidden="true">
                <motion.span
                  className="journey-link-fill"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: phases[i - 1].done ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * i, ease: 'easeOut' }}
                />
              </span>
            )}
            <button
              type="button"
              className="journey-btn"
              onClick={() => nav(`/contents#phase-${x.ph.id}`)}
              aria-label={`Phase ${x.ph.number}: ${x.ph.title}, ${x.passed} of ${x.topics} topics passed. Open it in Contents`}
            >
              <ProgressRing value={x.pct} size={46} stroke={4} tone={x.done ? 'good' : 'accent'} showValue={false}>
                {x.ph.number}
              </ProgressRing>
              <span className="journey-label">{x.ph.title}</span>
              <span className="journey-meta muted">
                {x.passed}/{x.topics}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
