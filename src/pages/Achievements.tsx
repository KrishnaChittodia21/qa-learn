import { useState } from 'react';
import { Award } from 'lucide-react';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { ACHIEVEMENTS, ACHIEVEMENT_TOTAL, GROUPS, type Achievement } from '../content/achievements';
import { useAchievementEvaluations } from '../lib/achievements';
import { useProgress } from '../lib/progress';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'earned', label: 'Earned' },
  { id: 'locked', label: 'Locked' },
] as const;
type Filter = (typeof FILTERS)[number]['id'];

export default function AchievementsPage() {
  const p = useProgress();
  const evs = useAchievementEvaluations(p);
  const stored = p.achievements ?? {};
  const [filter, setFilter] = useState<Filter>('all');
  const earnedCount = ACHIEVEMENTS.filter((a) => stored[a.id]?.tier).length;
  const visible = (a: Achievement) => (filter === 'all' ? true : filter === 'earned' ? !!stored[a.id]?.tier : !stored[a.id]?.tier);

  return (
    <div className="page ach-page">
      <div className="ach-page-head">
        <div>
          <div className="eyebrow">Your record</div>
          <h1>Achievements</h1>
          <p className="lead">Badges for milestones along the way. Tiered badges climb from bronze to diamond as you keep going.</p>
        </div>
        <div className="ach-count" role="img" aria-label={`${earnedCount} of ${ACHIEVEMENT_TOTAL} achievements earned`}>
          <Award size={20} aria-hidden="true" className="card-icon" />
          <strong className="ach-count-value">
            {earnedCount}
            <span className="muted"> / {ACHIEVEMENT_TOTAL}</span>
          </strong>
          <span className="small muted">earned</span>
        </div>
      </div>

      <div className="row gap-s wrap ach-filter" role="group" aria-label="Show achievements">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`chip ${filter === f.id ? 'on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            {f.id === 'earned' && ` (${earnedCount})`}
            {f.id === 'locked' && ` (${ACHIEVEMENT_TOTAL - earnedCount})`}
          </button>
        ))}
      </div>

      {GROUPS.map((g) => {
        const list = ACHIEVEMENTS.filter((a) => a.group === g.id && visible(a));
        if (!list.length) return null;
        return (
          <section key={g.id} className="ach-group" aria-labelledby={`ach-g-${g.id}`}>
            <div className="dash-section-head">
              <h2 id={`ach-g-${g.id}`}>{g.title}</h2>
              <span className="small muted">{g.blurb}</span>
            </div>
            <ul className="ach-grid">
              {list.map((a) => (
                <AchievementCard key={a.id} achievement={a} stored={stored[a.id]} ev={evs[a.id]} />
              ))}
            </ul>
          </section>
        );
      })}
      {filter === 'earned' && earnedCount === 0 && (
        <div className="card info">No badges yet. Mark a Learn section as read, fix an Improve This exercise or pass an exam to earn your first one.</div>
      )}
      {filter === 'locked' && earnedCount === ACHIEVEMENT_TOTAL && <div className="card info">Every badge is unlocked. Ship it.</div>}
    </div>
  );
}
