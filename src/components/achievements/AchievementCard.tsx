import type { CSSProperties } from 'react';
import Badge from './Badge';
import { cardState, tierName } from './achState';
import { TIER_LABEL, tierRank, type Achievement, type AchievementEvaluation, type StoredAchievement } from '../../content/achievements';
import { badgeLabel, formatEarnedDate } from '../../lib/achievements';

/** Progress toward a badge's next step: a segmented meter (.seg), exposed as a labelled progressbar. */
export function AchMeter({ value, max, label }: { value: number; max: number; label: string }) {
  const v = Math.min(value, max);
  const n = Math.max(1, Math.min(max, 40));
  return (
    <div
      className="seg ach-meter"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={v}
      aria-label={label}
      style={{ '--n': n, '--v': max ? (v / max) * n : 0 } as CSSProperties}
    />
  );
}

/** "EARNED 12 OCT" */
const shortDate = (ts?: number) => (ts ? new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : '');


/** Tier ladder (bronze → diamond) with each tier's goal; reached tiers lit, the next one ringed. */
export function TierLadder({ ev, stored }: { ev: AchievementEvaluation; stored?: StoredAchievement }) {
  const steps = ev.tiers.filter((t) => t.tier !== 'standard');
  if (!steps.length) return null;
  return (
    <ol className="ladder" aria-label="Tiers">
      {steps.map((t) => {
        const got = !!stored?.tier && tierRank(stored.tier) >= tierRank(t.tier);
        const nx = !got && ev.next?.tier === t.tier;
        const when = got ? stored?.tiers?.[t.tier] : undefined;
        return (
          <li key={t.tier} className={`${t.tier} ${got ? 'got' : ''} ${nx ? 'nx' : ''}`} title={`${TIER_LABEL[t.tier]}: ${t.goal}${when ? ` · earned ${formatEarnedDate(when)}` : ''}`}>
            <i aria-hidden="true" />
            <b>{t.goal}</b>
            <small>
              {TIER_LABEL[t.tier]}
              <span className="sr-only">{got ? ', earned' : nx ? ', next' : ''}</span>
            </small>
          </li>
        );
      })}
    </ol>
  );
}

/** One badge card: medallion, code, name, tier pill + date, description / requirement, ladder, progress. */
export function AchievementCard({
  achievement: a,
  stored,
  ev,
  code,
  span = 's3',
  index = 0,
}: {
  achievement: Achievement;
  stored?: StoredAchievement;
  ev: AchievementEvaluation;
  /** "B·05 · G02" */
  code?: string;
  span?: 's3' | 's4' | 's6';
  index?: number;
}) {
  const state = cardState(stored, ev);
  const earned = state === 'earned';
  const label = badgeLabel(a, stored, ev);
  const nextText = ev.next ? `${Math.min(ev.value, ev.next.goal)} / ${ev.next.goal} ${a.unit}` : null;
  const tiered = ev.tiers.some((t) => t.tier !== 'standard');
  return (
    <li className={`ach-li ${span}`} data-state={state}>
      <article
        className={`panel hov ach-card ${state} rise`}
        style={{ '--i': Math.min(index, 8) } as CSSProperties}
        tabIndex={0}
        role="group"
        aria-label={label}
      >
        <div className="ac-top">
          <Badge art={a.art} tier={stored?.tier ?? 'standard'} locked={!earned} size="md" />
          <div className="ac-id">
            {code && <span className="coord">{code}</span>}
            <h3 className="ac-name">{a.name}</h3>
            <div className="ac-meta">
              {earned && stored ? (
                <>
                  <span className={`tpill ${stored.tier === 'standard' ? '' : stored.tier}`}>{tierName(stored.tier)}</span>
                  <span className="coord">EARNED {shortDate(stored.earnedAt)}</span>
                </>
              ) : state === 'prog' ? (
                <span className="chip run">In progress</span>
              ) : (
                <span className="tpill locked">Locked</span>
              )}
            </div>
          </div>
        </div>
        {earned ? (
          <p className="ac-desc">{a.description}</p>
        ) : (
          <p className="ac-desc req">
            <span className="mlabel">Requirement</span>
            {ev.requirement}
          </p>
        )}
        {tiered && <TierLadder ev={ev} stored={stored} />}
        {nextText && ev.next ? (
          <div className="ac-meter">
            <AchMeter
              value={ev.value}
              max={ev.next.goal}
              label={`${a.name}: ${nextText}${TIER_LABEL[ev.next.tier] ? ` toward ${TIER_LABEL[ev.next.tier]}` : ''}`}
            />
            <span className="ac-num">
              <b>{Math.min(ev.value, ev.next.goal)}</b> / {ev.next.goal} {a.unit}
              {TIER_LABEL[ev.next.tier] && <span className="to"> → {TIER_LABEL[ev.next.tier]}</span>}
            </span>
          </div>
        ) : (
          earned && (
            <div className="ac-done">
              <span className="t-pass">✓ PASS</span>
              <span className="ink3">
                {ev.value} {a.unit}
                {tiered ? ' · top tier' : ''}
              </span>
            </div>
          )
        )}
      </article>
    </li>
  );
}
