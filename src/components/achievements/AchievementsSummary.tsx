import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Badge from './Badge';
import { ACHIEVEMENT_TOTAL, closestNext, earnedList, TIER_LABEL } from '../../content/achievements';
import { badgeLabel, formatEarnedDate, useAchievementEvaluations } from '../../lib/achievements';
import type { Progress } from '../../lib/progress';

const SHOW = 8;
/** phones show a single row */
const SHOW_PHONE = 5;

const shortDate = (ts: number) => {
  const d = new Date(ts);
  if (d.toDateString() === new Date().toDateString()) return 'Today';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

/**
 * Today screen: the trophy shelf (most recent badges, x / total earned, tier steps) and the closest
 * next badge, as two bento panels (.b-shelf, .b-anext — laid out by today.css). On phones the
 * closest-next row folds into the shelf panel (Mobile.html screen 02).
 */
export function AchievementsSummary({ p }: { p: Progress }) {
  const evs = useAchievementEvaluations(p);
  const earned = earnedList(p.achievements);
  const next = closestNext(evs);
  const nextText = next ? `${Math.min(next.ev.value, next.ev.next.goal)} / ${next.ev.next.goal} ${next.achievement.unit}` : '';
  const nextStored = next ? p.achievements?.[next.achievement.id] : undefined;
  const nextPct = next ? Math.round(next.ev.fraction * 100) : 0;
  const ladder = next ? next.ev.tiers.filter((t) => t.tier !== 'standard') : [];
  // segmented meters read badly past ~40 segments, so long goals are drawn on a 40-step scale
  const segN = next ? Math.min(next.ev.next.goal, 40) : 1;

  const evList = Object.values(evs);
  const stepsGot = evList.reduce((n, e) => n + e.tiers.filter((t) => t.reached).length, 0);
  const stepsAll = evList.reduce((n, e) => n + e.tiers.length, 0);
  const golds = earned.filter((e) => e.tier === 'gold' || e.tier === 'diamond').length;

  return (
    <>
      <section className="panel hov b-shelf rise" style={{ '--i': 11 } as CSSProperties} aria-labelledby="shelf-t">
        <div className="p-head">
          <span className="mlabel" id="shelf-t">
            Trophy shelf<span className="hide-m"> · achievements</span>
            <span className="only-m">
              {' '}
              · <b>
                {earned.length}/{ACHIEVEMENT_TOTAL}
              </b>
            </span>
          </span>
          <Link className="mlabel p-link" to="/achievements">
            <span className="hide-m">All achievements</span>
            <span className="only-m">All</span> ↗
          </Link>
        </div>
        <div className="shelf-top hide-m">
          <b>{earned.length}</b>
          <span className="ink3">/ {ACHIEVEMENT_TOTAL} earned</span>
          <div
            className="seg thin"
            style={{ '--n': ACHIEVEMENT_TOTAL, '--v': earned.length } as CSSProperties}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={ACHIEVEMENT_TOTAL}
            aria-valuenow={earned.length}
            aria-label={`${earned.length} of ${ACHIEVEMENT_TOTAL} achievements earned`}
          />
        </div>
        {earned.length ? (
          <ul className="shelf" aria-label="Most recent achievements">
            {earned.slice(0, SHOW).map((e, i) => (
              <li key={e.id} className={i >= SHOW_PHONE ? 'hide-m' : undefined}>
                <Link
                  to="/achievements"
                  aria-label={badgeLabel(e.achievement, e)}
                  title={`${e.achievement.name}${TIER_LABEL[e.tier] ? ` · ${TIER_LABEL[e.tier]}` : ''} · ${formatEarnedDate(e.earnedAt)}`}
                >
                  <Badge art={e.achievement.art} tier={e.tier} size="sm" />
                  <span className="nm" aria-hidden="true">
                    {e.achievement.name}
                  </span>
                  <span className="dt" aria-hidden="true">
                    {shortDate(e.earnedAt)}
                  </span>
                </Link>
              </li>
            ))}
            {earned.length > SHOW_PHONE && (
              <li className="only-m shelf-more mono" aria-hidden="true">
                +{earned.length - SHOW_PHONE}
              </li>
            )}
          </ul>
        ) : (
          <p className="shelf-empty">
            No badges yet; every test log starts empty. Mark a Learn section as read, fix an Improve This exercise or pass an exam to earn
            your first one. Bronze, silver, gold and diamond tiers follow as you keep going.
          </p>
        )}
        {next && (
          <Link className="ma-next only-m" to="/achievements" aria-label={`Closest next badge: ${next.achievement.name}, ${nextText}`}>
            <Badge art={next.achievement.art} tier={nextStored?.tier ?? 'standard'} locked={!nextStored?.tier} size="sm" />
            <span>
              <b>
                {next.achievement.name}
                {TIER_LABEL[next.ev.next.tier] && ` → ${TIER_LABEL[next.ev.next.tier]}`}
              </b>
              <span className="mono">{nextText}</span>
            </span>
            <span className="seg thin" style={{ '--n': segN, '--v': next.ev.fraction * segN } as CSSProperties} />
          </Link>
        )}
        <div className="shelf-foot hide-m">
          <span className="mlabel">{earned.length > SHOW ? `+${earned.length - SHOW} more on the Achievements page` : 'Latest first'}</span>
          <span className="mlabel">
            <b>
              {stepsGot} / {stepsAll}
            </b>{' '}
            tier steps · <b>{golds}</b> gold+
          </span>
        </div>
      </section>

      {next && (
        <section className="panel b-anext rise" style={{ '--i': 12 } as CSSProperties} aria-labelledby="anext-t">
          <div className="p-head">
            <span className="mlabel">Closest next badge</span>
            <span className="chip run">{nextPct}%</span>
          </div>
          <div className="anx">
            <Badge
              art={next.achievement.art}
              tier={nextStored?.tier ?? 'standard'}
              locked={!nextStored?.tier}
              size="md"
              label={badgeLabel(next.achievement, nextStored, next.ev)}
            />
            <div className="anx-b">
              <h3 id="anext-t">
                {next.achievement.name}
                {TIER_LABEL[next.ev.next.tier] && <span className={`tpill ${next.ev.next.tier}`}>{TIER_LABEL[next.ev.next.tier]}</span>}
              </h3>
              <p>{next.ev.requirement}</p>
              <div
                className="seg"
                style={{ '--n': segN, '--v': next.ev.fraction * segN, '--gap': '3px' } as CSSProperties}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={next.ev.next.goal}
                aria-valuenow={Math.min(next.ev.value, next.ev.next.goal)}
                aria-label={`${next.achievement.name}: ${nextText}`}
              />
              <span className="anx-n">
                <b>{Math.min(next.ev.value, next.ev.next.goal)}</b> / {next.ev.next.goal} {next.achievement.unit}
              </span>
            </div>
          </div>
          {ladder.length > 1 && (
            <ol className="ladder" aria-label="Tier ladder">
              {ladder.map((t) => (
                <li key={t.tier} className={`${t.tier} ${t.reached ? 'got' : t.tier === next.ev.next.tier ? 'nx' : ''}`}>
                  <i />
                  <b>{t.goal}</b>
                  <small>{TIER_LABEL[t.tier]}</small>
                </li>
              ))}
            </ol>
          )}
          <Link className="next-link" to="/achievements">
            <span>
              <span className="t">View all achievements</span>
              <span className="s">
                <span className="t-cyan">▸ next</span> · {next.ev.requirement.charAt(0).toLowerCase() + next.ev.requirement.slice(1)}
              </span>
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
    </>
  );
}
