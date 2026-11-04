// Study planner (pace calculator). Adapted from system-design-learn's src/pages/StudyPlan.tsx.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, Clock3, PartyPopper, Search, Target, Trash2 } from 'lucide-react';
import { Command } from 'cmdk';
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { PHASES, TOPICS } from '../content';
import { localDay, setStudyPlan, useProgress, type StudyPlan } from '../lib/progress';
import {
  addDays,
  computePace,
  courseLine,
  coveredMinutes,
  DAILY_MAX,
  DAILY_MIN,
  DAYS_PER_WEEK,
  fmtDay,
  hm,
  isStudyDay,
  joinGoal,
  newPlan,
  parseGoal,
  rebase,
  repace,
  stopName,
  withCatchUp,
  type Stop,
} from '../lib/pace';
import { CountUp } from './CountUp';

/** share of the snake a goal's line uses: the whole course fills it, smaller goals draw a shorter line (never a stub) */
const pathExtent = (goalMinutes: number, courseMinutes: number) => 0.3 + 0.7 * Math.min(1, goalMinutes / Math.max(1, courseMinutes));

const weekday = (day: string, long = false) =>
  new Date(`${day}T12:00`).toLocaleDateString('en-GB', long ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'short' });

/** a value that rolls like an odometer when it changes */
function Roll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`pl-roll ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{ y: '0.7em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-0.7em', opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** the same roll for a date label inside the map */
function RollSvg({ text, x, y, anchor }: { text: string; x: number; y: number; anchor: 'middle' | 'end' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <AnimatePresence initial={false}>
        <motion.text
          key={text}
          className="pl-st-date"
          textAnchor={anchor}
          initial={{ y: 7, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -7, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.text>
      </AnimatePresence>
    </g>
  );
}

// the metro line: a snake across three rows
const LINE = 'M 60 70 H 900 Q 950 70 950 120 V 170 Q 950 220 900 220 H 100 Q 50 220 50 270 V 320 Q 50 370 100 370 H 940';
const DRAW = 1.8;
const DRAW_EASE = [0.33, 1, 0.68, 1] as const;
// the line draws with (roughly) an ease-out cubic, so a stop at fraction f is reached at time 1 − (1 − f)^(1/3)
const reachedAt = (f: number) => (1 - Math.cbrt(1 - Math.min(1, f))) * DRAW;

type Geo = { at: (f: number) => { x: number; y: number } };

/** a marker that glides along the line (following its bends) to a fraction of it */
function useAlong(geo: Geo | null, frac: number, reduce: boolean | null): MotionValue<string> {
  const f = useMotionValue(0);
  useLayoutEffect(() => {
    const first = f.get() === 0;
    const c = animate(f, frac, reduce ? { duration: 0 } : { duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: first ? DRAW * 0.6 : 0 });
    return () => c.stop();
  }, [f, frac, reduce]);
  return useTransform(f, (v) => {
    const p = geo?.at(v) ?? { x: 60, y: 70 };
    return `translate(${p.x}px, ${p.y}px)`;
  });
}

interface MapProps {
  stops: Stop[];
  total: number;
  covered: number;
  expected: number;
  dates: (string | null)[];
  /** how much of the snake the goal's line uses (a smaller goal draws a shorter line) */
  extent: number;
  goal: boolean;
  showGap: boolean;
}

function MetroMap({ stops, total, covered, expected, dates, extent, goal, showGap }: MapProps) {
  const ref = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion();
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    setGeo({ at: (f) => el.getPointAtLength(Math.max(0, Math.min(1, f)) * len) });
  }, []);
  // everything is placed in goal minutes, then scaled onto the part of the snake the goal uses
  const you = (covered / total) * extent;
  const pacer = (expected / total) * extent;
  const youT = useAlong(geo, you, reduce);
  const pacerT = useAlong(geo, pacer, reduce);
  const gap = Math.max(0, pacer - you);

  return (
    <svg className="pl-map" viewBox="0 0 1000 440" role="img" aria-label={`Your path: a line with a stop for each of the ${stops.length} phases`}>
      <defs>
        <linearGradient id="pl-grad" x1="0" x2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--amber)" />
        </linearGradient>
      </defs>
      {/* geometry only (never drawn): stops and markers are placed along the full snake */}
      <path ref={ref} d={LINE} fill="none" stroke="none" />
      {/* the track ends where the goal ends, so unpicked phases leave no line behind */}
      <motion.path
        className="pl-track"
        d={LINE}
        initial={false}
        animate={{ pathLength: extent }}
        transition={{ duration: reduce ? 0 : 0.6, ease: DRAW_EASE }}
      />
      <motion.path
        className="pl-line"
        d={LINE}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: extent }}
        transition={{ duration: reduce ? 0 : DRAW, ease: DRAW_EASE }}
      />
      {you > 0.0005 && <path className="pl-done" d={LINE} pathLength={1} style={{ strokeDasharray: `${you} 2` }} />}
      {showGap && gap > 0.0005 && <path className="pl-gap" d={LINE} pathLength={1} style={{ strokeDasharray: `${gap} 2`, strokeDashoffset: -you }} />}
      <AnimatePresence initial={false}>
      {geo &&
        stops.map((s, i) => {
          const f = (s.end / total) * extent;
          const pt = geo.at(f);
          const below = i % 2 === 1;
          // stops on the right-hand bend carry their label to the left of the line
          const side = pt.x > 920 && pt.y > 72 && pt.y < 365;
          const nearTop = side && pt.y < 120;
          const anchor = side ? 'end' : 'middle';
          const x = side ? -18 : 0;
          const y1 = nearTop ? 26 : side ? -2 : below ? 30 : -18;
          const y2 = nearTop ? 40 : side ? 12 : below ? 44 : -32;
          const date = dates[i];
          const cls = `pl-st${date === null ? ' passed' : ''}${goal && i === stops.length - 1 ? ' goal' : ''}`;
          // stops glide to their new place when the goal changes; dropped phases shrink away, added ones pop in
          return (
            <motion.g
              key={s.id}
              className={cls}
              initial={reduce ? false : { x: pt.x, y: pt.y, opacity: 0, scale: 0.4 }}
              animate={{ x: pt.x, y: pt.y, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
              transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
            >
              <motion.circle
                className="pl-ring"
                r={9}
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16, delay: reduce ? 0 : reachedAt(f) }}
              />
              <text className="pl-st-name" x={x} y={y1} textAnchor={anchor}>
                {stopName(s)}
              </text>
              <RollSvg text={date === null ? 'done' : fmtDay(date)} x={x} y={y2} anchor={anchor} />
            </motion.g>
          );
        })}
      </AnimatePresence>
      <motion.g className="pl-pacer" style={{ transform: pacerT }}>
        <circle className="pl-pacer-ring" r={13} />
        <text className="pl-tag" y={-20} textAnchor="middle">
          PACER
        </text>
      </motion.g>
      <motion.g className="pl-you" style={{ transform: youT }}>
        <circle className="pl-you-glow" r={16} />
        <circle r={8} />
        <text className="pl-tag" y={30} textAnchor="middle">
          YOU
        </text>
      </motion.g>
    </svg>
  );
}

/** this week, Monday to Sunday: studied, missed, rest and planned days */
function Week({ plan, days, today }: { plan: StudyPlan; days: Set<string>; today: string }) {
  const monday = addDays(today, -((new Date(`${today}T12:00`).getDay() + 6) % 7));
  return (
    <ol className="pl-week" aria-label="This week">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(monday, i);
        const on = isStudyDay(d, plan.daysPerWeek);
        const studied = days.has(d);
        const state = studied ? 'studied' : d >= today ? (on ? 'planned' : 'rest') : on ? 'missed' : 'rest';
        return (
          <li key={d} className={`pl-day ${state}${d === today ? ' today' : ''}`}>
            <span className="pl-day-n">{d === today ? 'Today' : weekday(d)}</span>
            <span className="pl-day-bar" aria-hidden>
              <i style={{ transitionDelay: `${i * 60}ms` }} />
            </span>
            <span className="pl-day-m">{studied ? <Check size={13} aria-hidden /> : on ? `${plan.dailyMinutes}m` : 'rest'}</span>
            <span className="sr-only">{state}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Plan your journey (Roadmap): minutes a day, days a week and a goal date every phase; the pacer shows where the plan
 * expects you today. Adapted from system-design-learn's StudyPlan page. */
export function StudyPlanner() {
  const p = useProgress();
  const today = localDay();
  const course = useMemo(() => courseLine(TOPICS, PHASES), []);
  const covered = useMemo(() => coveredMinutes(p, TOPICS), [p]);
  const saved = p.studyPlan;
  // before a plan is saved the inputs edit a draft, so trying numbers doesn't create a plan
  const [draft, setDraft] = useState<StudyPlan>(() => saved ?? newPlan(covered, today));
  const plan = saved ?? draft;
  const pace = computePace(plan, covered, course, TOPICS, p, today);
  const activity = useMemo(() => new Set(p.activityDays ?? []), [p.activityDays]);

  // a new pace applies from today: the pacer keeps its position, so a gap stays until you catch up or move the date.
  // Only "Move my finish date" resets the gap.
  const change = (next: Partial<StudyPlan>, newPace: boolean) => {
    const merged = { ...plan, ...next };
    const final = newPace && saved ? repace(merged, pace.expected, today) : merged;
    if (saved) setStudyPlan(final);
    else setDraft(final);
  };

  const weekly = plan.dailyMinutes * plan.daysPerWeek;
  const left = pace.goal.remaining;
  const behind = !!saved && pace.state === 'behind';
  const warnOn = behind && !saved?.warningsOff;
  const goalSet = parseGoal(plan.goal)[0] !== 'all';
  const fill = ((plan.dailyMinutes - DAILY_MIN) / (DAILY_MAX - DAILY_MIN)) * 100;

  return (
    <div className="pl-page">
      <header className="pl-head">
        <span className="mlabel">Roadmap</span>
        <h1 className="h1">Plan your journey</h1>
        <p className="muted">
          Tell it how much time you have and it dates every phase. The pacer shows where your plan expects you to be today; if you fall behind, it tells you how to
          catch up.
        </p>
      </header>

      <section className="panel pl-calc" aria-label="Pace calculator">
        <div className="pl-inputs">
          <label className="pl-field">
            <span className="pl-k">Time I can study per day</span>
            <span className="pl-mins">
              <b className="num">{plan.dailyMinutes}</b> minutes
            </span>
            <input
              type="range"
              className="pl-range"
              min={DAILY_MIN}
              max={DAILY_MAX}
              step={5}
              value={plan.dailyMinutes}
              style={{ '--fill': `${fill}%` } as CSSProperties}
              onChange={(e) => change({ dailyMinutes: Number(e.target.value) }, true)}
            />
          </label>
          <div className="pl-field">
            <span className="pl-k" id="pl-days">
              Days per week
            </span>
            <div className="pl-chips" role="radiogroup" aria-labelledby="pl-days">
              {DAYS_PER_WEEK.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={plan.daysPerWeek === n}
                  className={`pl-chip${plan.daysPerWeek === n ? ' on' : ''}`}
                  onClick={() => change({ daysPerWeek: n }, true)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="pl-field">
            <span className="pl-k" id="pl-goal-k">
              Goal
            </span>
            <GoalPicker value={plan.goal} stops={course.stops} onChange={(goal) => change({ goal }, false)} />
          </div>
        </div>

        <div className="pl-result" aria-live="polite">
          <span className="pl-k">{pace.goal.label}</span>
          {pace.finish ? (
            <div className="pl-big">
              by <Roll text={fmtDay(pace.finish, true)} className="pl-big-date" />
            </div>
          ) : (
            <div className="pl-big">
              <PartyPopper size={26} aria-hidden /> Done
            </div>
          )}
          <p className="pl-sub">
            {plan.dailyMinutes} min a day, {plan.daysPerWeek} days a week. {hm(covered)} covered so far{saved ? `; plan started ${fmtDay(saved.startedAt)}` : ''}.
          </p>
          <div className="pl-stats">
            <div>
              <b className="num">
                <CountUp value={Math.ceil(left / weekly)} />
              </b>
              <span>weeks left</span>
            </div>
            <div>
              <b className="num">
                <CountUp value={Math.round(left / 60)} />
              </b>
              <span>hours to go</span>
            </div>
            <div>
              <b className="num">{hm(weekly)}</b>
              <span>per week</span>
            </div>
          </div>
          {!saved && (
            <button type="button" className="btn btn-primary pl-start" onClick={() => setStudyPlan(rebase({ ...plan, startedAt: today }, covered, today))}>
              Start this plan
            </button>
          )}
        </div>
      </section>

      {saved && (
        <AnimatePresence mode="wait" initial={false}>
          {warnOn ? (
            <motion.section key="warn" className="pl-warn" role="status" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <span className="pl-warn-ic" aria-hidden>
                <Clock3 size={18} />
              </span>
              <div>
                <h2 className="pl-warn-t">You&rsquo;re {hm(pace.gap)} behind the pacer</h2>
                <p>
                  {pace.lastActive ? `Last studied ${weekday(pace.lastActive, true)}` : 'No study recorded since the plan started'}
                  {pace.missedDays ? `, ${pace.missedDays} study day${pace.missedDays > 1 ? 's' : ''} missed since` : ''}.{' '}
                  {saved.catchUp
                    ? `You're catching up with +${saved.catchUp.extraMinutes} min a day until ${fmtDay(saved.catchUp.until)}.`
                    : pace.catchUpPerDay > 0
                      ? `To get back on pace, add ${pace.catchUpPerDay} min a day for the next 2 weeks (${plan.dailyMinutes + pace.catchUpPerDay} instead of ${plan.dailyMinutes}).`
                      : ''}
                  {pace.extraDays > 0 && pace.slowFinish
                    ? ` Or keep your pace and finish ${pace.extraDays} study day${pace.extraDays > 1 ? 's' : ''} later, on ${fmtDay(pace.slowFinish)}.`
                    : ''}
                </p>
                <div className="pl-warn-acts">
                  {!saved.catchUp && pace.catchUpPerDay > 0 && (
                    <button type="button" className="btn btn-primary" onClick={() => setStudyPlan(withCatchUp(saved, pace.catchUpPerDay, today))}>
                      Add {pace.catchUpPerDay} min/day for 2 weeks
                    </button>
                  )}
                  <button type="button" className="btn" onClick={() => setStudyPlan(rebase(saved, covered, today))}>
                    Move my finish date
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setStudyPlan({ ...saved, warningsOff: true })}>
                    Turn off timeline warnings
                  </button>
                </div>
              </div>
            </motion.section>
          ) : !behind ? (
            <motion.section key={`ok-${pace.state}`} className="pl-warn ok" role="status" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="pl-warn-ic" aria-hidden>
                <Check size={18} />
              </span>
              <div>
                <h2 className="pl-warn-t">
                  {pace.state === 'done' ? 'Goal reached' : pace.state === 'ahead' ? `You're ${hm(-pace.gap)} ahead of the pacer` : 'Right on pace'}
                </h2>
                <p>
                  {pace.state === 'done'
                    ? 'Pick a new goal above to keep going.'
                    : pace.state === 'ahead'
                      ? 'Nice. You could finish early, or keep this buffer for a busy week.'
                      : `Keep this rhythm and you'll arrive on the date above. ${pace.todayMinutes ? `Today: ${pace.todayMinutes} min.` : 'Today is a rest day.'}`}
                </p>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      )}

      {saved && (
        <div className="pl-switch-row">
          <label className="pl-switch">
            <input type="checkbox" role="switch" className="set-switch" checked={!saved.warningsOff} onChange={(e) => setStudyPlan({ ...saved, warningsOff: !e.target.checked })} />
            <span>{saved.warningsOff ? 'Behind-schedule warnings are off. The pacer still shows on the map.' : 'Behind-schedule warnings are on'}</span>
          </label>
          <button type="button" className="btn-ghost pl-remove" onClick={() => setStudyPlan(undefined)}>
            <Trash2 size={14} aria-hidden /> Remove plan
          </button>
        </div>
      )}

      <section className="panel pl-path" aria-labelledby="pl-path-t">
        <div className="pl-path-head">
          <h2 id="pl-path-t" className="p-title">
            Your path
          </h2>
          <ul className="pl-legend">
            <li>
              <i className="lg-done" />
              Covered
            </li>
            <li>
              <i className="lg-you" />
              You
            </li>
            {saved && (
              <li>
                <i className="lg-pacer" />
                Pacer (where the plan expects you)
              </li>
            )}
            {goalSet && (
              <li>
                <i className="lg-goal" />
                Goal
              </li>
            )}
          </ul>
        </div>
        <MetroMap
          stops={pace.line.stops}
          total={pace.line.total}
          covered={pace.line.you}
          expected={saved ? pace.line.pacer : pace.line.you}
          dates={pace.line.dates}
          extent={pathExtent(pace.line.total, course.total)}
          goal={goalSet}
          showGap={warnOn}
        />
        <ol className="pl-list">
          {pace.line.stops.map((s, i) => {
            const d = pace.line.dates[i];
            const here = d !== null && (i === 0 || pace.line.dates[i - 1] === null);
            const cls = `${d === null ? 'passed' : ''}${here ? ' here' : ''}${goalSet && i === pace.line.stops.length - 1 ? ' goal' : ''}`;
            return (
              <li key={s.id} className={cls}>
                <span className="pl-list-dot" aria-hidden />
                <span className="pl-list-name">
                  {stopName(s)}
                  {here && <span className="pl-list-you"> · you are here</span>}
                </span>
                <span className="pl-list-d mono">{d === null ? 'done' : fmtDay(d)}</span>
              </li>
            );
          })}
        </ol>
        {saved && (
          <>
            <h3 className="pl-k pl-week-k">This week</h3>
            <Week plan={saved} days={activity} today={today} />
          </>
        )}
        <p className="pl-note">
          Covered counts each topic&rsquo;s study time by how complete it is (sections read, practice and the exam). The pacer is what your plan expected by today.
          A new pace applies from today and keeps any gap; &ldquo;Move my finish date&rdquo; restarts the pacer from where you are, so earlier misses stop
          counting. <Link to="/contents">See every topic</Link>
        </p>
      </section>
    </div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** every pick in course order (phases, then each topic followed by its sections), so a goal reads the same way every time */
const PICK_ORDER = new Map<string, number>(
  [
    ...PHASES.map((ph) => `phase:${ph.id}`),
    ...TOPICS.flatMap((t) => [`topic:${t.id}`, ...t.sections.map((_, i) => `section:${t.id}:${i}`)]),
  ].map((k, i) => [k, i]),
);

/** what a pick is called, and what kind it is */
function describePick(key: string, stops: Stop[]): { name: string; kind: string } {
  const [kind, id, idx] = key.split(':');
  const t = TOPICS.find((x) => x.id === id);
  if (kind === 'phase') {
    const st = stops.find((x) => x.id === id);
    return { name: st?.title ?? id, kind: `Phase ${pad2(st?.number ?? 0)}` };
  }
  if (kind === 'section' && t) return { name: t.sections[Number(idx)]?.heading ?? '', kind: `Section ${Number(idx) + 1} · ${t.title}` };
  return { name: t?.title ?? id, kind: `Topic · ${PHASES.find((ph) => ph.id === t?.phase)?.title ?? ''}` };
}

/** The goal picker: pick any mix of phases, topics and single sections, in a searchable list in the app's style
 *  (a native <select> opens an OS menu that cannot be themed, and cannot multi-select). */
function GoalPicker({ value, stops, onChange }: { value: string; stops: Stop[]; onChange: (goal: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  // the tree starts collapsed: phase ids and topic ids that are open
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const searching = search.trim() !== '';
  const isOpen = (id: string) => searching || expanded.has(id);
  const flip = (id: string, to?: boolean) =>
    setExpanded((x) => {
      const n = new Set(x);
      if (to ?? !n.has(id)) n.add(id);
      else n.delete(id);
      return n;
    });
  const [hi, setHi] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // "Untick all" empties the list without saving an empty goal; the first tick saves, closing with nothing keeps the old goal
  const [cleared, setCleared] = useState(false);
  const parts = parseGoal(value);
  const isAll = parts[0] === 'all' && !cleared;
  const sel = new Set(isAll || cleared ? [] : parts);
  // what puts an item in the goal: itself, or the bigger pick it sits in ('all' > phase > topic)
  const phaseOn = (id: string) => isAll || sel.has(`phase:${id}`);
  const topicOn = (t: (typeof TOPICS)[number]) => phaseOn(t.phase) || sel.has(`topic:${t.id}`);
  const sectionOn = (t: (typeof TOPICS)[number], i: number) => topicOn(t) || sel.has(`section:${t.id}:${i}`);
  const via = (t?: (typeof TOPICS)[number]) => (isAll ? 'in course' : t && sel.has(`phase:${t.phase}`) ? 'in phase' : 'in topic');

  /** untick an item that is in the goal through a bigger pick: the bigger pick becomes everything else inside it */
  const untick = (key: string, next: Set<string>) => {
    const [kind, id, idx] = key.split(':');
    const t = TOPICS.find((x) => x.id === id);
    const phase = kind === 'phase' ? id : t?.phase;
    const keepPhases = () => PHASES.filter((ph) => ph.id !== phase && TOPICS.some((x) => x.phase === ph.id)).forEach((ph) => next.add(`phase:${ph.id}`));
    const keepTopics = () => TOPICS.filter((x) => x.phase === phase && x.id !== t?.id).forEach((x) => next.add(`topic:${x.id}`));
    const keepSections = () => t?.sections.forEach((_, i) => i !== Number(idx) && next.add(`section:${t.id}:${i}`));
    if (next.has(key)) return next.delete(key);
    if (kind === 'section' && t && next.has(`topic:${t.id}`)) return next.delete(`topic:${t.id}`), keepSections();
    if (kind !== 'phase' && phase && next.has(`phase:${phase}`)) {
      next.delete(`phase:${phase}`);
      keepTopics();
      if (kind === 'section') keepSections();
      return;
    }
    if (isAll) {
      keepPhases();
      if (kind !== 'phase') keepTopics();
      if (kind === 'section') keepSections();
    }
  };

  const toggle = (key: string) => {
    setCleared(false);
    if (key === 'all') return onChange('all');
    const next = new Set(sel);
    const [k0, id0, i0] = key.split(':');
    const t0 = TOPICS.find((x) => x.id === id0);
    const isOn = k0 === 'phase' ? phaseOn(id0) : k0 === 'topic' ? !!t0 && topicOn(t0) : !!t0 && sectionOn(t0, Number(i0));
    if (isOn) untick(key, next);
    else {
      next.add(key);
      const [kind, id] = key.split(':');
      // a bigger pick swallows the smaller picks inside it
      for (const k of [...next]) {
        const [kk, kid] = k.split(':');
        const t = TOPICS.find((x) => x.id === kid);
        if (kind === 'phase' && t && t.phase === id && (kk === 'topic' || kk === 'section')) next.delete(k);
        if (kind === 'topic' && kk === 'section' && kid === id) next.delete(k);
      }
    }
    onChange(joinGoal([...next].sort((a, b) => (PICK_ORDER.get(a) ?? 0) - (PICK_ORDER.get(b) ?? 0))));
  };

  // several picks read as topics (and loose sections); near-complete goals name what was left out
  const first = isAll || cleared ? null : describePick(parts[0], stops);
  const full = TOPICS.filter(topicOn);
  const nSec = parts.filter((k) => k.startsWith('section:')).length;
  const left = TOPICS.filter((t) => !topicOn(t));
  const label = cleared
    ? 'Nothing ticked yet'
    : isAll
    ? 'Whole course'
    : parts.length === 1
      ? first!.name
      : [full.length && `${full.length} of ${TOPICS.length} topics`, nSec && `${nSec} section${nSec === 1 ? '' : 's'}`].filter(Boolean).join(' + ');
  const sub = cleared
    ? 'Your goal stays as it was until you tick something'
    : isAll
    ? `${TOPICS.length} topics`
    : parts.length === 1
      ? first!.kind
      : full.length && left.length <= 3
        ? `Without ${left.map((t) => t.title).join(' · ')}`
        : parts.map((k) => describePick(k, stops).name).join(' · ');

  const show = () => {
    setHi(isAll ? 'all' : parts[0]);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    setSearch('');
    setCleared(false);
    if (refocus) trigger.current?.focus();
  };
  // click outside closes; the first pick starts in view
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    list.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
  const onBlur = (e: FocusEvent) => {
    if (open && !box.current?.contains(e.relatedTarget as Node)) close(false);
  };

  const row = (
    key: string,
    text: string,
    { on, implied, hint, badge, cls, expand }: { on: boolean; implied?: string; hint?: string; badge?: string; cls?: string; expand?: { id: string; what: string } },
  ) => (
    <Command.Item
      key={key}
      value={key}
      keywords={[text, hint ?? '']}
      onSelect={() => toggle(key)}
      className={`${cls ?? ''}${implied ? ' implied' : ''}`}
      aria-expanded={expand && !searching ? expanded.has(expand.id) : undefined}
    >
      {expand ? (
        <button
          type="button"
          className={`pl-exp${isOpen(expand.id) ? ' open' : ''}`}
          tabIndex={-1}
          aria-label={`${expanded.has(expand.id) ? 'Hide' : 'Show'} the ${expand.what} in ${text}`}
          disabled={searching}
          // opens the row without ticking it (the row itself ticks)
          onClick={(e) => {
            e.stopPropagation();
            flip(expand.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChevronDown size={15} aria-hidden />
        </button>
      ) : (
        cls !== undefined && <span className="pl-exp-gap" aria-hidden />
      )}
      <span className={`pl-check${on ? ' on' : ''}`} aria-hidden>
        {on && <Check size={12} strokeWidth={3} />}
      </span>
      {badge && (
        <span className="cmdk-ic pl-goal-num" aria-hidden>
          {badge}
        </span>
      )}
      <span className="cmdk-label">{text}</span>
      {/* while searching, where a row lives matters more than why it is ticked */}
      {(implied || hint) && <span className="cmdk-hint">{searching && hint ? hint : (implied ?? hint)}</span>}
      <span className="sr-only">{on ? ', in your goal' : ''}</span>
    </Command.Item>
  );

  return (
    <div className={`pl-goal${open ? ' open' : ''}`} ref={box} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        className="pl-goal-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="pl-goal-k pl-goal-v"
        onClick={() => (open ? close(false) : show())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            show();
          }
        }}
      >
        <span className="pl-goal-ic" aria-hidden>
          <Target size={17} />
        </span>
        <span className="pl-goal-t" id="pl-goal-v">
          <b>{label}</b>
          <small>{sub}</small>
        </span>
        <ChevronDown size={17} aria-hidden className="pl-goal-chev" />
      </button>
      {open && (
        <div className="pl-goal-pop">
          <Command
            label="Choose what to study"
            // plain "contains" matching: the default fuzzy match turns "cach" into "Capacity…"
            filter={(_, q, keywords) => (keywords?.join(' ').toLowerCase().includes(q.trim().toLowerCase()) ? 1 : 0)}
            value={hi}
            onValueChange={setHi}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                close();
              }
              // → opens and ← closes the highlighted phase or topic (← on a child closes its parent)
              if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !searching) {
                const [kind, id] = hi.split(':');
                const parent = kind === 'section' ? id : kind === 'topic' ? TOPICS.find((t) => t.id === id)?.phase : undefined;
                if (kind === 'phase' || kind === 'topic') {
                  if (e.key === 'ArrowRight' || expanded.has(id)) {
                    e.preventDefault();
                    flip(id, e.key === 'ArrowRight');
                    return;
                  }
                }
                if (e.key === 'ArrowLeft' && parent) {
                  e.preventDefault();
                  flip(parent, false);
                  setHi(kind === 'section' ? `topic:${id}` : `phase:${parent}`);
                }
              }
            }}
          >
            <div className="pl-goal-search">
              <Search size={15} aria-hidden />
              <Command.Input value={search} onValueChange={setSearch} placeholder="Search phases, topics and sections…" autoFocus />
            </div>
            <Command.List ref={list} aria-multiselectable="true">
              <Command.Empty>No phase, topic or section matches.</Command.Empty>
              <Command.Group heading="Everything">{row('all', 'Whole course', { on: isAll, hint: `${TOPICS.length} topics` })}</Command.Group>
              {/* one tree: phase ▸ its topics ▸ their sections (collapsed until opened; a search shows every match) */}
              <Command.Group heading="Phases, topics and sections">
                {stops.flatMap((x) => {
                  const topics = TOPICS.filter((t) => t.phase === x.id);
                  return [
                    row(`phase:${x.id}`, x.title, {
                      on: phaseOn(x.id),
                      implied: isAll ? 'in course' : undefined,
                      hint: `${topics.length} topics`,
                      badge: pad2(x.number),
                      cls: 'pl-goal-phase',
                      expand: { id: x.id, what: 'topics' },
                    }),
                    ...(isOpen(x.id)
                      ? topics.flatMap((t) => [
                          row(`topic:${t.id}`, t.title, {
                            on: topicOn(t),
                            implied: phaseOn(t.phase) ? via(t) : undefined,
                            hint: `${t.sections.length} sections`,
                            cls: 'pl-goal-topic',
                            expand: { id: t.id, what: 'sections' },
                          }),
                          ...(isOpen(t.id)
                            ? t.sections.map((sec, i) =>
                                row(`section:${t.id}:${i}`, sec.heading, {
                                  on: sectionOn(t, i),
                                  implied: topicOn(t) ? via(t) : undefined,
                                  // a search shows sections without their topic row, so say which topic they belong to
                                  hint: searching ? `Section ${i + 1} · ${t.title}` : `Section ${i + 1}`,
                                  cls: 'pl-goal-sec',
                                }),
                              )
                            : []),
                        ])
                      : []),
                  ];
                })}
              </Command.Group>
            </Command.List>
            <div className="pl-goal-foot">
              <span className="muted small">{cleared ? 'Nothing ticked yet: tick what you want to study' : isAll ? 'Whole course' : `${parts.length} picked`}</span>
              <span className="row gap-s">
                {!cleared && (
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setCleared(true)}>
                    Untick all
                  </button>
                )}
                <button type="button" className="btn btn-primary btn-sm" onClick={() => close()}>
                  Done
                </button>
              </span>
            </div>
          </Command>
        </div>
      )}
    </div>
  );
}
