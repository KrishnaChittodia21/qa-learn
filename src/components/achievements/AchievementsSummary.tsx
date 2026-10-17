import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import Badge from './Badge';
import { AchMeter } from './AchievementCard';
import { ACHIEVEMENT_TOTAL, closestNext, earnedList, TIER_LABEL } from '../../content/achievements';
import { badgeLabel, formatEarnedDate, useAchievementEvaluations } from '../../lib/achievements';
import type { Progress } from '../../lib/progress';

const SHOW = 8;

/** Dashboard section: most recent badges, x / total earned, and the closest next badge. */
export function AchievementsSummary({ p }: { p: Progress }) {
  const evs = useAchievementEvaluations(p);
  const earned = earnedList(p.achievements);
  const next = closestNext(evs);
  const nextText = next ? `${Math.min(next.ev.value, next.ev.next.goal)} / ${next.ev.next.goal} ${next.achievement.unit}` : '';
  const nextStored = next ? p.achievements?.[next.achievement.id] : undefined;

  return (
    <section className="dash-section" aria-labelledby="dash-ach">
      <div className="dash-section-head">
        <h2 id="dash-ach">Achievements</h2>
        <Link to="/achievements" className="small">
          All achievements →
        </Link>
      </div>
      <div className="card ach-summary">
        <div className="ach-summary-earned">
          <div className="ach-summary-head">
            <Award size={18} aria-hidden="true" className="card-icon" />
            <strong>
              {earned.length} / {ACHIEVEMENT_TOTAL}
            </strong>
            <span className="muted small">earned</span>
          </div>
          {earned.length ? (
            <ul className="ach-mini-grid" aria-label="Most recent achievements">
              {earned.slice(0, SHOW).map((e) => (
                <li key={e.id} title={`${e.achievement.name}${TIER_LABEL[e.tier] ? ` · ${TIER_LABEL[e.tier]}` : ''} · ${formatEarnedDate(e.earnedAt)}`}>
                  <Link to="/achievements" className="ach-mini" aria-label={badgeLabel(e.achievement, e)}>
                    <Badge art={e.achievement.art} tier={e.tier} size="sm" />
                    <span className="ach-mini-name" aria-hidden="true">
                      {e.achievement.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted ach-empty">
              No badges yet; every test log starts empty. Mark a Learn section as read, fix an Improve This exercise or pass an exam to
              earn your first one. Bronze, silver, gold and diamond tiers follow as you keep going.
            </p>
          )}
          {earned.length > SHOW && <p className="small muted">+{earned.length - SHOW} more on the Achievements page.</p>}
        </div>

        {next && (
          <div className="ach-summary-next">
            <span className="eyebrow">Closest next badge</span>
            <div className="ach-next">
              <Badge
                art={next.achievement.art}
                tier={nextStored?.tier ?? 'standard'}
                locked={!nextStored?.tier}
                size="md"
                label={badgeLabel(next.achievement, nextStored, next.ev)}
              />
              <div className="ach-next-body">
                <strong>
                  {next.achievement.name}
                  {TIER_LABEL[next.ev.next.tier] && <span className={`ach-tier-pill tier-${next.ev.next.tier}`}>{TIER_LABEL[next.ev.next.tier]}</span>}
                </strong>
                <span className="small muted">{next.ev.requirement}</span>
                <AchMeter value={next.ev.value} max={next.ev.next.goal} label={`${next.achievement.name}: ${nextText}`} />
                <span className="small ach-num">{nextText}</span>
              </div>
            </div>
            <Link to="/achievements" className="btn btn-sm">
              View all achievements <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
