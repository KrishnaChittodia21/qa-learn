// The build matrix on the Dashboard (#/): every topic as a job in a CI build, by track and stage.
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PHASES, TOPICS } from '../content';
import type { Topic } from '../types';
import { useProgress, type Progress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { useUiPrefs } from '../lib/uiPrefs';

/* ------------------------------------------------------------------ model */

/** a topic's state in the build: passed (first time / on retry), exam failed, running (current), started, queued */
type JobState = 'pass' | 'flaky' | 'fail' | 'run' | 'part' | 'queued';
type TrackId = 'T1' | 'T2' | 'T3' | 'T4';

const STATE_LABEL: Record<JobState, string> = {
  pass: 'passed',
  flaky: 'passed on retry',
  fail: 'exam failed',
  run: 'running',
  part: 'in progress',
  queued: 'queued',
};

const TRACKS: { id: TrackId; name: string; color: string }[] = [
  { id: 'T1', name: 'Manual & API', color: 'var(--lime)' },
  { id: 'T2', name: 'JavaScript', color: 'var(--mint)' },
  { id: 'T3', name: 'Playwright', color: 'var(--cyan)' },
  { id: 'T4', name: 'AI & Interview', color: 'var(--iris)' },
];
/** tracks group the phases: P1–3 manual & API, P4 JavaScript, P5–6 Playwright, P7–8 AI & interview */
const trackOf = (phaseNumber: number): TrackId => (phaseNumber <= 3 ? 'T1' : phaseNumber === 4 ? 'T2' : phaseNumber <= 6 ? 'T3' : 'T4');

const pad2 = (n: number) => String(n).padStart(2, '0');
/** "Arrays: Methods, Sorting…" → "Arrays", "Playwright Setup, Architecture…" → "Playwright Setup" (job tile name) */
const shortName = (t: Topic) => t.title.split(':')[0].split(',')[0].trim();
const isGreen = (s: JobState) => s === 'pass' || s === 'flaky';

interface Job {
  topic: Topic;
  code: string;
  phaseNumber: number;
  track: TrackId;
  state: JobState;
  read: number;
  total: number;
  best?: number;
  /** first section not yet read (or -1) */
  nextSection: number;
}

/** read indexes that still exist */
const readSet = (p: Progress, t: Topic) => new Set((p.sections[t.id] ?? []).filter((i) => i >= 0 && i < t.sections.length));

const ORDERED = PHASES.flatMap((ph) => TOPICS.filter((t) => t.phase === ph.id).sort((a, b) => a.order - b.order));

/** The topic being worked on: the last studied topic (started, exam not yet taken), else the first such topic. */
function runningTopic(p: Progress, lastStudy: string): string | null {
  const m = /^\/topic\/([^/?#]+)/.exec(lastStudy);
  const last = m && TOPICS.find((t) => t.id === m[1]);
  const ok = (t: Topic) => !p.tests[t.id] && topicStatus(p, t) === 'in-progress';
  if (last && ok(last)) return last.id;
  return ORDERED.find(ok)?.id ?? null;
}

function buildJobs(p: Progress, lastStudy: string): Job[] {
  const run = runningTopic(p, lastStudy);
  return PHASES.flatMap((ph) =>
    ORDERED.filter((t) => t.phase === ph.id).map((t, i) => {
      const rec = p.tests[t.id];
      const read = readSet(p, t);
      let state: JobState;
      if (rec?.passedAt) state = rec.history?.some((h) => h.at < rec.passedAt!) ? 'flaky' : 'pass';
      else if (rec) state = 'fail';
      else if (t.id === run) state = 'run';
      else state = topicStatus(p, t) === 'in-progress' ? 'part' : 'queued';
      return {
        topic: t,
        code: `${pad2(ph.number)}.${i + 1}`,
        phaseNumber: ph.number,
        track: trackOf(ph.number),
        state,
        read: read.size,
        total: t.sections.length,
        best: rec?.best,
        nextSection: t.sections.findIndex((_, s) => !read.has(s)),
      };
    }),
  );
}

type StageState = 'pass' | 'fail' | 'run' | 'part' | 'queued';
function stageState(jobs: Job[]): StageState {
  if (jobs.every((j) => isGreen(j.state))) return 'pass';
  if (jobs.some((j) => j.state === 'fail')) return 'fail';
  if (jobs.some((j) => j.state === 'run')) return 'run';
  if (jobs.some((j) => j.state !== 'queued')) return 'part';
  return 'queued';
}
/* ------------------------------------------------------------------ matrix */

/**
 * The build matrix on the Dashboard: every topic as a cell, by track and stage. A cell opens its topic; a stage
 * opens the stage's first topic. Its styles live under .syl-page (syllabus.css), hence the wrapper.
 */
export function BuildMatrix() {
  const p = useProgress();
  const ui = useUiPrefs();
  const nav = useNavigate();
  const jobs = useMemo(() => buildJobs(p, ui.lastStudyLocation), [p, ui.lastStudyLocation]);
  const running = jobs.find((j) => j.state === 'run');
  const runPhase = running ? PHASES.find((ph) => ph.id === running.topic.phase) : undefined;
  return (
    <div className="syl-page dash-matrix">
      <section className="panel notch b-matrix rise" aria-labelledby="mx-t">
        <div className="p-head">
          <h2 className="p-title" id="mx-t">
            Build matrix
          </h2>
          <span className="mlabel">
            {TRACKS.length} tracks × {PHASES.length} stages · <b>{TOPICS.length} jobs</b>
          </span>
          {runPhase && <span className="chip run">Stage {pad2(runPhase.number)} running</span>}
        </div>
        <Matrix
          jobs={jobs}
          shown={null}
          passMark={p.settings.passMark}
          onJump={(phaseId) => nav(`/topic/${ORDERED.find((t) => t.phase === phaseId)?.id}`)}
          onOpenJob={(topicId) => nav(`/topic/${topicId}`)}
        />
        <div className="mx-legend">
          <span>
            <i className="k pass" /> Passed
          </span>
          <span>
            <i className="k flaky" /> Passed on retry
          </span>
          <span>
            <i className="k fail" /> Exam failed
          </span>
          <span>
            <i className="k run" /> Running
          </span>
          <span>
            <i className="k part" /> In progress
          </span>
          <span>
            <i className="k" /> Queued
          </span>
          <span className="sep" aria-hidden="true" />
          <span>
            <i className="w" /> Handoff · stage green
          </span>
          <span>
            <i className="w dash" /> Waiting
          </span>
          <span className="mx-hint">Score = best exam % · bar = sections read</span>
        </div>
      </section>
    </div>
  );
}

function Matrix({
  jobs,
  shown,
  passMark,
  onJump,
  onOpenJob,
}: {
  jobs: Job[];
  shown: Set<string> | null;
  passMark: number;
  onJump: (phaseId: string) => void;
  onOpenJob: (topicId: string, phaseId: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scanH, setScanH] = useState(600);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setScanH(Math.max(200, el.offsetHeight - 80)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stages = PHASES.map((ph) => {
    const list = jobs.filter((j) => j.topic.phase === ph.id);
    return { ph, list, state: stageState(list), track: trackOf(ph.number) };
  });

  return (
    <div className="mx-wrap" ref={wrapRef}>
      <div className="mx-grid">
        <div className="mx-corner" aria-hidden="true">
          <span className="mlabel">Track</span>
          <span className="mx-slash" />
          <span className="mlabel">Stage</span>
        </div>
        {stages.map(({ ph, list, state }) => {
          const done = list.filter((j) => isGreen(j.state)).length;
          return (
            <button
              key={ph.id}
              type="button"
              className={`mx-stage ${state}`}
              onClick={() => onJump(ph.id)}
            >
              <span className="no">STAGE {pad2(ph.number)}</span>
              <span className="tt">{ph.title}</span>
              <span
                className="seg thin"
                style={
                  {
                    '--n': list.length,
                    '--v': done,
                    '--g': state === 'run' ? 'var(--run)' : state === 'queued' ? 'var(--skip)' : 'var(--pass)',
                  } as CSSProperties
                }
              />
              <span className="ct" aria-hidden="true">
                {done}/{list.length}
              </span>
              <span className="sr-only">
                , {done} of {list.length} passed. Jump to its report
              </span>
            </button>
          );
        })}

        {TRACKS.map((tr, ti) => {
          const trJobs = jobs.filter((j) => j.track === tr.id);
          const trDone = trJobs.filter((j) => isGreen(j.state)).length;
          return (
            <div
              key={tr.id}
              className="mx-row"
              role="group"
              aria-label={`Track ${tr.id}: ${tr.name}, ${trDone} of ${trJobs.length} jobs green`}
              style={{ '--lc': tr.color } as CSSProperties}
            >
              <div className="mx-lane" aria-hidden="true">
                <span className="lk">
                  <i />
                  {tr.id}
                </span>
                <span className="ln">{tr.name}</span>
                <span className="lv">
                  {trDone}
                  <small>/{trJobs.length}</small>
                </span>
                <span
                  className="seg thin"
                  style={
                    {
                      '--n': trJobs.length,
                      '--v': trDone,
                      '--g': 'var(--lc)',
                    } as CSSProperties
                  }
                />
              </div>
              {stages.map(({ ph, list, state, track }, si) => {
                if (track !== tr.id) return <div key={ph.id} className="mx-cell off" aria-hidden="true" />;
                const prev = stages[si - 1];
                const next = stages[si + 1];
                const firstOfTrack = !prev || prev.track !== tr.id;
                const sameNext = !!next && next.track === tr.id;
                const handoffDown = !!next && next.track !== tr.id && ti < TRACKS.length - 1;
                const litIn = !!prev && prev.state === 'pass';
                const litOut = state === 'pass';
                return (
                  <div key={ph.id} className={`mx-cell on ${state}`}>
                    <span className="mx-cell-h" aria-hidden="true">
                      Stage {pad2(ph.number)} · {ph.title}
                    </span>
                    {prev && firstOfTrack && <span className={`wire v drop ${litIn ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    {prev && <span className={`wire h in ${litIn ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    {sameNext && <span className={`wire h out ${litOut ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    {handoffDown && <span className={`wire v exit ${litOut ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    <ul className="jobs" aria-label={`Stage ${ph.number}`}>
                      {list.map((j) => {
                        const dim = shown !== null && !shown.has(j.topic.id);
                        const label = `${j.code} ${j.topic.title}: ${STATE_LABEL[j.state]}${j.best !== undefined ? `, best ${j.best}% (pass ${passMark}%)` : ''}, ${j.read} of ${j.total} sections read`;
                        return (
                          <li key={j.topic.id} className="jw">
                            <Link
                              className={`job ${j.state}${dim ? ' dim' : ''}`}
                              to={`/topic/${j.topic.id}`}
                              title={label}
                              aria-label={label}
                              tabIndex={dim ? -1 : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                onOpenJob(j.topic.id, j.topic.phase);
                              }}
                            >
                              <span className="l1">
                                <i className="dm" />
                                <b>{j.code}</b>
                                <em>{j.best !== undefined ? `${j.best}%` : j.read ? `${j.read}/${j.total}` : '··'}</em>
                              </span>
                              <span className="nm">{shortName(j.topic)}</span>
                              {!isGreen(j.state) && j.read > 0 && (
                                <span
                                  className="pg"
                                  style={
                                    {
                                      '--v': (j.read / Math.max(1, j.total)) * 100,
                                    } as CSSProperties
                                  }
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <span className="scan" aria-hidden="true" style={{ '--scan-h': `${scanH}px` } as CSSProperties} />
    </div>
  );
}
