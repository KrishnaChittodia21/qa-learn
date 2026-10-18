import { useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { EmptyState } from '../components/Doodles';
import Badge from '../components/achievements/Badge';
import { cardState, tierName, type CardState } from '../components/achievements/achState';
import { AchievementCard, AchMeter, TierLadder } from '../components/achievements/AchievementCard';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_TOTAL,
  closestNext,
  earnedList,
  GROUPS,
  TIER_LABEL,
  TIERS,
  tierRank,
  type Achievement,
  type AchievementEvaluation,
  type EarnedTier,
} from '../content/achievements';
import { badgeLabel, useAchievementEvaluations } from '../lib/achievements';
import { useProgress } from '../lib/progress';
import { PHASES } from '../content';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'earned', label: 'Earned' },
  { id: 'prog', label: 'In progress' },
  { id: 'locked', label: 'Locked' },
] as const;
type Filter = (typeof FILTERS)[number]['id'];

const pad2 = (n: number) => String(n).padStart(2, '0');
const isPhase = (a: Achievement) => a.id.startsWith('phase-');
const isTiered = (ev: AchievementEvaluation) => ev.tiers.some((t) => t.tier !== 'standard');
/** "TODAY 09:31" / "17 OCT" */
function when(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return `TODAY · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
}

export default function AchievementsPage() {
  const p = useProgress();
  const evs = useAchievementEvaluations(p);
  const stored = useMemo(() => p.achievements ?? {}, [p.achievements]);
  const [filter, setFilter] = useState<Filter>('all');

  const state = (a: Achievement): CardState => cardState(stored[a.id], evs[a.id]);
  const counts = useMemo(() => {
    const c = { earned: 0, prog: 0, locked: 0 };
    ACHIEVEMENTS.forEach((a) => c[cardState(stored[a.id], evs[a.id])]++);
    return c;
  }, [stored, evs]);
  const visible = (a: Achievement) => filter === 'all' || state(a) === filter;

  const earned = earnedList(stored);
  const latest = earned[0];
  const next = closestNext(evs);
  const runners = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => evs[a.id]?.next && a.id !== next?.achievement.id && evs[a.id].value > 0)
        .sort((x, y) => evs[y.id].fraction - evs[x.id].fraction)
        .slice(0, 3),
    [evs, next],
  );

  // tier census: single-step badges certified, then how many tiered badges reached each tier
  const census = useMemo(() => {
    const single = ACHIEVEMENTS.filter((a) => !isTiered(evs[a.id]));
    const tiered = ACHIEVEMENTS.filter((a) => isTiered(evs[a.id]));
    const rows: { tier: EarnedTier; got: number; of: number }[] = [
      { tier: 'standard', got: single.filter((a) => stored[a.id]?.tier).length, of: single.length },
      ...TIERS.map((t) => {
        const has = tiered.filter((a) => evs[a.id].tiers.some((s) => s.tier === t));
        return { tier: t as EarnedTier, got: has.filter((a) => stored[a.id]?.tier && tierRank(stored[a.id].tier) >= tierRank(t)).length, of: has.length };
      }),
    ];
    let steps = 0;
    let stepsOf = 0;
    ACHIEVEMENTS.forEach((a) => {
      stepsOf += evs[a.id].tiers.length;
      steps += evs[a.id].tiers.filter((s) => s.reached).length;
    });
    return { rows, steps, stepsOf };
  }, [evs, stored]);

  const consoleSlot = document.getElementById('console-slot');
  const nextStored = next ? stored[next.achievement.id] : undefined;
  const nextPct = next ? Math.round(next.ev.fraction * 100) : 0;
  const groupEarned = (gid: string) => ACHIEVEMENTS.filter((a) => a.group === gid && stored[a.id]?.tier).length;
  const groupTotal = (gid: string) => ACHIEVEMENTS.filter((a) => a.group === gid).length;
  const jump = (gid: string) =>
    document.getElementById(`g-${gid}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

  return (
    <div className="page ach-page">
      {consoleSlot &&
        createPortal(
          <span className="ach-slot">
            {earned.length} / {ACHIEVEMENT_TOTAL} certified
          </span>,
          consoleSlot,
        )}

      <div className="ach-bento">
        {/* ---------- header ---------- */}
        <section className="panel cut-lg b-head rise" style={{ '--i': 1 } as CSSProperties} aria-labelledby="ach-t">
          <svg className="ghost-hex" viewBox="0 0 100 115.47" aria-hidden="true">
            <polygon points="50,1 99,29.5 99,86 50,114.5 1,86 1,29.5" />
            <polygon points="50,18 84,38 84,77.5 50,97.5 16,77.5 16,38" />
            <path d="M50 1V18M99 29.5 84 38M99 86 84 77.5M50 114.5V97.5M1 86 16 77.5M1 29.5 16 38" />
          </svg>
          <div className="hd-top">
            <span className="chip holo">Trophy shelf</span>
            <span className="mlabel">
              <b>{ACHIEVEMENT_TOTAL} badges</b> · {GROUPS.length} groups · {TIERS.length} tiers
            </span>
            <span className="coord">CERT LOG · B·01–B·{pad2(ACHIEVEMENT_TOTAL)}</span>
          </div>
          <h1 id="ach-t">
            <span className="display holo-text">Achievements</span>
            <span className="sub">
              <span className="outline">Certified</span> by the lab.
            </span>
          </h1>
          <p className="lede">
            Shiny badges for the milestones along the way. Tiered ones climb from <b>bronze</b> all the way to <b>diamond</b> as you keep going,
            and an earned tier is never taken back.
          </p>
          <div className="hd-read">
            <div className="readout">
              <span className="mlabel">Earned</span>
              <div className="num">
                {earned.length}
                <small>/{ACHIEVEMENT_TOTAL}</small>
              </div>
              <AchMeter value={earned.length} max={ACHIEVEMENT_TOTAL} label={`${earned.length} of ${ACHIEVEMENT_TOTAL} achievements earned`} />
            </div>
            <div className="readout">
              <span className="mlabel">Tier steps</span>
              <div className="num">
                {census.steps}
                <small>/{census.stepsOf}</small>
              </div>
              <AchMeter value={census.steps} max={census.stepsOf} label={`${census.steps} of ${census.stepsOf} tier steps reached`} />
            </div>
            <div>
              <span className="mlabel">Latest unlock</span>
              {latest ? (
                <div className="lt">
                  <Badge art={latest.achievement.art} tier={latest.tier} size="sm" />
                  <span>
                    <b>
                      {latest.achievement.name}
                      {TIER_LABEL[latest.tier] ? ` · ${TIER_LABEL[latest.tier]}` : ''}
                    </b>
                    <span className="coord">
                      {when(latest.earnedAt)} · {evs[latest.id]?.value ?? 0} {latest.achievement.unit}
                    </span>
                  </span>
                </div>
              ) : (
                <p className="lt-none">Nothing yet. Every test log starts empty.</p>
              )}
            </div>
          </div>
        </section>

        {/* ---------- closest next (the one foil card) ---------- */}
        {next ? (
          <section className="panel foil cut-lg b-next rise" style={{ '--i': 2 } as CSSProperties} aria-labelledby="nx-t">
            <div className="p-head">
              <span className="mlabel">Closest next badge</span>
              <span className="chip run">{nextPct}% there</span>
            </div>
            <div className="nx-hero">
              <Badge
                art={next.achievement.art}
                tier={nextStored?.tier ?? 'standard'}
                locked={!nextStored?.tier}
                size="lg"
                label={badgeLabel(next.achievement, nextStored, next.ev)}
              />
              {next.ev.next.tier !== 'standard' && (
                <>
                  <span className="arrow" aria-hidden="true" />
                  <span className="nx-ghost" aria-hidden="true">
                    <Badge art={next.achievement.art} tier={next.ev.next.tier} size="md" />
                  </span>
                </>
              )}
            </div>
            <h2 className="h3" id="nx-t">
              {next.achievement.name}
            </h2>
            <p className="req">{next.ev.requirement}</p>
            <div className="nx-num">
              <b>{Math.min(next.ev.value, next.ev.next.goal)}</b>
              <span>
                / {next.ev.next.goal} {next.achievement.unit}
                {TIER_LABEL[next.ev.next.tier] ? ` → ${TIER_LABEL[next.ev.next.tier]}` : ''}
              </span>
            </div>
            <AchMeter value={next.ev.value} max={next.ev.next.goal} label={`${next.achievement.name}: ${next.ev.value} of ${next.ev.next.goal} ${next.achievement.unit}`} />
            <TierLadder ev={next.ev} stored={nextStored} />
            <p className="nx-tip">
              <b>
                {next.ev.next.goal - Math.min(next.ev.value, next.ev.next.goal)} more {next.achievement.unit}
              </b>{' '}
              to {TIER_LABEL[next.ev.next.tier] ? `reach ${TIER_LABEL[next.ev.next.tier]}` : 'earn it'}.
            </p>
            {runners.length > 0 && (
              <>
                <span className="mlabel rn-head">Also within reach</span>
                <ul className="runners">
                  {runners.map((a) => {
                    const ev = evs[a.id];
                    const s = stored[a.id];
                    return (
                      <li key={a.id}>
                        <Badge art={a.art} tier={s?.tier ?? 'standard'} locked={!s?.tier} size="xs" />
                        <span className="rn-n">{a.name}</span>
                        <span className="rn-v mono">
                          {ev.value}/{ev.next!.goal}
                          {TIER_LABEL[ev.next!.tier] ? ` → ${TIER_LABEL[ev.next!.tier]}` : ''}
                        </span>
                        <AchMeter value={ev.value} max={ev.next!.goal} label={`${a.name}: ${ev.value} of ${ev.next!.goal}`} />
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        ) : (
          <section className="panel foil cut-lg b-next rise" style={{ '--i': 2 } as CSSProperties} aria-label="Every badge earned">
            <div className="p-head">
              <span className="mlabel">Closest next badge</span>
              <span className="chip pass">Maxed</span>
            </div>
            <h2 className="h3">Every tier certified.</h2>
            <p className="req">Nothing left to unlock. Ship it!</p>
          </section>
        )}

        {/* ---------- tier census ---------- */}
        <section className="panel flat b-census rise" style={{ '--i': 3 } as CSSProperties} aria-label="Tier census">
          {census.rows.map((r) => (
            <div key={r.tier} className={`cs ${r.tier}`}>
              <Badge art="badge-check" tier={r.tier} locked={r.got === 0} size="sm" />
              <div className="cs-b">
                <span className="mlabel">{tierName(r.tier)}</span>
                <div className="num">
                  {r.got}
                  <small>/{r.of}</small>
                </div>
                <div
                  className="seg thin"
                  role="presentation"
                  style={{ '--n': Math.max(1, r.of), '--v': r.got, '--g': r.tier === 'standard' ? 'var(--tier-cert)' : r.tier === 'diamond' ? 'var(--holo-lin)' : `var(--tier-${r.tier})` } as CSSProperties}
                />
              </div>
            </div>
          ))}
        </section>

        {/* ---------- recently unlocked ---------- */}
        <section className="panel b-recent rise" style={{ '--i': 4 } as CSSProperties} aria-labelledby="rc-t">
          <div className="p-head">
            <h2 className="p-title" id="rc-t">
              Recently unlocked
            </h2>
            <span className="mlabel rc-sub">release log · newest first</span>
            <span className="mlabel">
              <b>{earned.length}</b> earned
            </span>
          </div>
          {earned.length ? (
            <ol className="rc-list">
              {earned.slice(0, 6).map((e, i) => (
                <li key={e.id} className={`rc ${i === 0 ? 'new' : ''}`}>
                  <div className="rc-node">
                    <span className={`node ${i === 0 ? 'now' : 'pass'}`} aria-hidden="true" />
                    <span className="coord">{when(e.earnedAt)}</span>
                  </div>
                  <Badge art={e.achievement.art} tier={e.tier} size="md" />
                  <b>{e.achievement.name}</b>
                  <span className={`tpill ${e.tier === 'standard' ? '' : e.tier}`}>{tierName(e.tier)}</span>
                  <span className="rc-g mono">
                    {evs[e.id]?.value ?? 0} {e.achievement.unit}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rc-empty">
              No badges yet; every test log starts empty. Mark a Learn section as read, fix an Improve This exercise or pass an exam to earn
              your first one.
            </p>
          )}
        </section>

        {/* ---------- rules ---------- */}
        <section className="panel b-rules rise" style={{ '--i': 5 } as CSSProperties} aria-labelledby="ru-t">
          <div className="p-head">
            <span className="mlabel" id="ru-t">
              How tiers work
            </span>
          </div>
          <ol className="rules">
            <li>
              <span className="mono">T1</span>
              <span>
                <b>Bronze → Silver → Gold → Diamond.</b> Each step is a goal; diamond is usually &ldquo;all of it&rdquo;.
              </span>
            </li>
            <li>
              <span className="mono">T2</span>
              <span>
                <b>Single-step badges</b> are certified once, with no tiers.
              </span>
            </li>
            <li>
              <span className="mono">T3</span>
              <span>
                <b>Never revoked.</b> A jump from nothing to gold unlocks every tier on the way.
              </span>
            </li>
          </ol>
        </section>
      </div>

      {/* ---------- filters ---------- */}
      <div className="ach-filters" role="toolbar" aria-label="Show achievements">
        <span className="mlabel">Show</span>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="fchip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} <span className="mono">{f.id === 'all' ? ACHIEVEMENT_TOTAL : counts[f.id]}</span>
          </button>
        ))}
        <span className="coord note">IN PROGRESS = STARTED, NOT YET EARNED</span>
        <span className="brk" aria-hidden="true" />
        <span className="mlabel">Jump to</span>
        {GROUPS.map((g) => (
          <button key={g.id} type="button" className="fchip g" onClick={() => jump(g.id)}>
            {g.title}
            <span className="mono">
              {groupEarned(g.id)}/{groupTotal(g.id)}
            </span>
          </button>
        ))}
      </div>

      {GROUPS.map((g, gi) => {
        const all = ACHIEVEMENTS.filter((a) => a.group === g.id);
        const list = all.filter(visible);
        if (!list.length) return null;
        const phases = list.filter(isPhase);
        const cards = list.filter((a) => !isPhase(a));
        const got = all.filter((a) => stored[a.id]?.tier).length;
        return (
          <section key={g.id} className="ach-group" id={`g-${g.id}`} aria-labelledby={`g-${g.id}-t`}>
            <header className="g-head">
              <span className="g-no">GROUP {pad2(gi + 1)}</span>
              <h2 className="h3" id={`g-${g.id}-t`}>
                {g.title}
              </h2>
              <p>{g.blurb}</p>
              <span className="g-cnt">
                <b>{got}</b> / {all.length} earned
              </span>
              <div className="seg thin g-seg" style={{ '--n': all.length, '--v': got } as CSSProperties} />
            </header>
            <ul className="agrid">
              {cards.map((a, i) => {
                const ev = evs[a.id];
                return (
                  <AchievementCard
                    key={a.id}
                    achievement={a}
                    stored={stored[a.id]}
                    ev={ev}
                    index={i}
                    code={`B·${pad2(ACHIEVEMENTS.indexOf(a) + 1)} · G${pad2(gi + 1)}`}
                    span={isTiered(ev) ? 's4' : 's3'}
                  />
                );
              })}
              {phases.length > 0 && (
                <li className={`ach-li s8 ach-phases-li ${cards.length ? 'side' : ''}`}>
                  <section className="panel ach-phases" aria-labelledby={`ph-${g.id}`}>
                    <div className="p-head">
                      <h3 className="p-title" id={`ph-${g.id}`}>
                        Phase graduates
                      </h3>
                      <span className="mlabel">Pass every topic exam in a phase</span>
                      <span className="mlabel">
                        <b>{phases.filter((a) => stored[a.id]?.tier).length}</b> / {phases.length} certified
                      </span>
                    </div>
                    <ul className="ph-grid">
                      {phases.map((a) => {
                        const ev = evs[a.id];
                        const s = stored[a.id];
                        const st = state(a);
                        const goal = ev.next?.goal ?? ev.tiers[ev.tiers.length - 1]?.goal ?? 1;
                        return (
                          <li key={a.id} className={`ph ${st}`} tabIndex={0} aria-label={badgeLabel(a, s, ev)}>
                            <Badge art={a.art} tier={s?.tier ?? 'standard'} locked={!s?.tier} size="sm" />
                            <span className="ph-b">
                              <span className="coord">B·{pad2(ACHIEVEMENTS.indexOf(a) + 1)}</span>
                              <b>{a.name}</b>
                              <span className="ph-t" title={a.description}>
                                {PHASES.find((ph) => `phase-${ph.id}` === a.id)?.title ?? a.description}
                              </span>
                              <span className="seg thin" style={{ '--n': goal, '--v': Math.min(ev.value, goal), '--g': s?.tier ? 'var(--pass)' : 'var(--iris)' } as CSSProperties} />
                              <span className={`ph-s mono ${s?.tier ? 't-pass' : ''}`}>
                                {s?.tier ? 'PASS' : st === 'prog' ? 'RUNNING' : 'QUEUED'} {Math.min(ev.value, goal)}/{goal}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </li>
              )}
            </ul>
          </section>
        );
      })}
      {filter === 'earned' && counts.earned === 0 && (
        <EmptyState title="Your shelf is waiting" mood="sleepy">
          Mark a Learn section as read, fix an Improve This exercise or pass an exam to earn your very first badge.
        </EmptyState>
      )}
      {filter === 'prog' && counts.prog === 0 && (
        <EmptyState title="Nothing in progress" mood="sleepy">
          Every started badge is already earned. Start something new!
        </EmptyState>
      )}
      {filter === 'locked' && counts.locked === 0 && <EmptyState title="Every badge started. Ship it!" mood="party" />}
    </div>
  );
}
