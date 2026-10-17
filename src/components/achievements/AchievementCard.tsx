import Badge from './Badge';
import { TIER_LABEL, tierRank, type Achievement, type AchievementEvaluation, type StoredAchievement } from '../../content/achievements';
import { badgeLabel, formatEarnedDate } from '../../lib/achievements';

/** Progress toward a badge's next step: the app's .pbar, exposed as a labelled progressbar. */
export function AchMeter({ value, max, label }: { value: number; max: number; label: string }) {
  const v = Math.min(value, max);
  return (
    <div className="pbar ach-meter" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={v} aria-label={label}>
      <div className="pbar-fill" style={{ width: `${max ? (v / max) * 100 : 0}%` }} />
    </div>
  );
}

/** One badge card: art, name, tier ladder, progress toward the next tier, earned date. */
export function AchievementCard({ achievement: a, stored, ev }: { achievement: Achievement; stored?: StoredAchievement; ev: AchievementEvaluation }) {
  const earned = !!stored?.tier;
  const label = badgeLabel(a, stored, ev);
  const nextText = ev.next ? `${Math.min(ev.value, ev.next.goal)} / ${ev.next.goal} ${a.unit}` : null;
  const ladder = ev.tiers.filter((t) => t.tier !== 'standard');
  return (
    <li>
      <article className={`ach-card ${earned ? 'is-earned' : 'is-locked'}`} tabIndex={0} role="group" aria-label={label} aria-disabled={earned ? undefined : 'true'}>
        <Badge art={a.art} tier={stored?.tier ?? 'standard'} locked={!earned} size="md" />
        <div className="ach-card-body">
          <h3 className="ach-card-name">{a.name}</h3>
          <p className="ach-card-desc">{earned ? a.description : ev.requirement}</p>
          {ladder.length > 0 && (
            <ol className="ach-ladder" aria-label="Tiers">
              {ladder.map((t) => {
                const got = !!stored?.tier && tierRank(stored.tier) >= tierRank(t.tier);
                const when = got ? stored?.tiers?.[t.tier] : undefined;
                return (
                  <li key={t.tier} className={`ach-step tier-${t.tier} ${got ? 'got' : ''}`} title={`${TIER_LABEL[t.tier]}: ${t.goal}${when ? ` · earned ${formatEarnedDate(when)}` : ''}`}>
                    <span className="sr-only">{`${TIER_LABEL[t.tier]} at ${t.goal}${got ? ', earned' : ''}`}</span>
                    <span aria-hidden="true">{t.goal}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {nextText && ev.next && (
            <div className="ach-progress">
              <AchMeter
                value={ev.value}
                max={ev.next.goal}
                label={`${a.name}: ${nextText}${TIER_LABEL[ev.next.tier] ? ` toward ${TIER_LABEL[ev.next.tier]}` : ''}`}
              />
              <span className="small muted ach-num">{nextText}</span>
            </div>
          )}
          {earned && stored && (
            <p className="ach-card-meta small">
              {TIER_LABEL[stored.tier] && <span className={`ach-tier-pill tier-${stored.tier}`}>{TIER_LABEL[stored.tier]}</span>}
              <span className="muted">Earned {formatEarnedDate(stored.earnedAt)}</span>
              {!ev.next && ladder.length > 0 && <span className="muted">· top tier</span>}
            </p>
          )}
        </div>
      </article>
    </li>
  );
}
