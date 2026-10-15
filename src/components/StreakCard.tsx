import { Flame } from 'lucide-react';
import { lastSevenDays, studyStreak } from '../lib/streak';

/** Consecutive study days plus a 7-day dot strip. */
export function StreakCard({ days }: { days?: string[] }) {
  const streak = studyStreak(days);
  const week = lastSevenDays(days);
  const active = week.filter((d) => d.active).length;
  return (
    <section className="card streak-card" aria-label="Study streak">
      <div className="streak-top">
        <Flame size={28} aria-hidden="true" className={`streak-flame ${streak ? 'lit' : ''}`} />
        <div>
          <div className="streak-count">
            {streak} day{streak === 1 ? '' : 's'}
          </div>
          <div className="muted small">{streak ? 'study streak, keep it going' : 'Study today to start a streak'}</div>
        </div>
      </div>
      <ol className="streak-days" aria-label={`Studied on ${active} of the last 7 days`}>
        {week.map((d) => (
          <li key={d.day} className={`${d.active ? 'on' : ''} ${d.today ? 'today' : ''}`} title={d.day}>
            <span className="streak-dot" aria-hidden="true" />
            <span className="streak-label" aria-hidden="true">
              {d.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
