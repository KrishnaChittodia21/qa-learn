import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Command,
  Keyboard,
  LayoutGrid,
  ListTree,
  PanelLeft,
  RotateCcw,
  Save,
  Smartphone,
  X,
} from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { useProgress } from '../lib/progress';
import { nextStep } from '../lib/nextStep';
import { TAB_META, type TabId } from '../lib/studyLoop';
import { useFocusTrap } from '../lib/useFocusTrap';

const LOOP: TabId[] = ['learn', 'code', 'interview', 'envelope', 'exam', 'company'];
const STEP_TITLES = ['What this is', 'The study loop', 'Finding your way', 'Your progress', 'Start here'];
const RAIL = ['Today', 'Syllabus', 'Coding', 'Playwright Lab', 'Roadmap', 'Weak areas', 'Achievements'];
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Welcome tour: shown once on first visit, re-opened from "Guide me" in the rail / More sheet or the "?" key. */
export default function WelcomeTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const nav = useNavigate();
  const p = useProgress();
  const next = nextStep(p, TOPICS, { companyTotal: COMPANY_QUESTIONS.length, codingTotal: CODING_PROBLEMS.length });
  const close = useCallback(() => onClose(), [onClose]);
  useFocusTrap(ref, true, close);
  // keep focus inside the dialog when the focused button disappears between steps
  useEffect(() => {
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) el.focus();
  }, [step]);

  const go = (to: number) => {
    if (to < 0 || to >= STEP_TITLES.length) return;
    setDir(to > step ? 1 : -1);
    setStep(to);
  };
  const finish = (href: string) => {
    onClose();
    nav(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') go(step + 1);
    if (e.key === 'ArrowLeft') go(step - 1);
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        ref={ref}
        className="panel cut-lg modal tour"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 0.32, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="tour-head">
          <span className="mlabel">
            <b>Guide</b> · {pad2(step + 1)}/{pad2(STEP_TITLES.length)} · {STEP_TITLES[step]}
          </span>
          <button type="button" className="icon-btn" aria-label="Close the guide" onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="tour-spectrum" aria-hidden="true">
          <i style={{ '--v': ((step + 1) / STEP_TITLES.length) * 100 } as CSSProperties} />
        </div>
        <div className="tour-body" aria-live="polite">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 14 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -14 * dir }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {step === 0 && (
                <>
                  <h2 id="tour-title" className="h2">
                    Welcome to the <span className="holo-text">lab.</span>
                  </h2>
                  <p className="tour-lede">
                    A guided path from zero to a job-ready QA engineer: {TOPICS.length} topics in {PHASES.length} stages, each with lessons,
                    hands-on labs, interview practice and a timed exam. Every topic is a job in the build; pass its exam and it turns green.
                  </p>
                  <ol className="tour-stages">
                    {PHASES.map((ph) => (
                      <li key={ph.id}>
                        <span className="coord">STAGE {pad2(ph.number)}</span>
                        <span>{ph.title}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {step === 1 && (
                <>
                  <h2 id="tour-title" className="h2">
                    Every topic, the same loop
                  </h2>
                  <p className="tour-lede">Follow the study path at the top of each topic, left to right.</p>
                  <ol className="tour-loop">
                    {LOOP.map((id, i) => {
                      const m = TAB_META[id];
                      const Icon = m.icon;
                      return (
                        <li key={id}>
                          <span className="node queued" aria-hidden="true">
                            <span className="tl-n">{i + 1}</span>
                          </span>
                          <Icon size={16} aria-hidden="true" className="tl-icon" />
                          <span>
                            <strong>
                              {m.label}
                              {id === 'company' && <span className="ink3"> (when the topic has them)</span>}
                            </strong>
                            <span className="ink3"> {m.why}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 id="tour-title" className="h2">
                    Where things are
                  </h2>
                  <ul className="tour-where">
                    <li>
                      <PanelLeft size={18} aria-hidden="true" />
                      <span>
                        <strong>The left rail</strong> holds the numbered pages{' '}
                        <span className="tour-rail">
                          {RAIL.map((r, i) => (
                            <span key={r}>
                              <i>{pad2(i + 1)}</i> {r}
                            </span>
                          ))}
                        </span>
                        and a <strong>Tools</strong> group below them: Playground, Company Qs, Settings and Guide me.
                      </span>
                    </li>
                    <li>
                      <Command size={18} aria-hidden="true" />
                      <span>
                        <strong>Search</strong>: press <kbd className="kbd">⌘</kbd> <kbd className="kbd">K</kbd> (or <kbd className="kbd">Ctrl</kbd>{' '}
                        <kbd className="kbd">K</kbd>) anywhere to jump to a page, topic, section or question. On the Syllabus,{' '}
                        <kbd className="kbd">/</kbd> jumps straight to its filter.
                      </span>
                    </li>
                    <li>
                      <ListTree size={18} aria-hidden="true" />
                      <span>
                        <strong>Console strip</strong>: the mono bar at the top of every page shows where you are. Its{' '}
                        <strong>syllabus index</strong> button (right end) opens every topic by stage, with its status.
                      </span>
                    </li>
                    <li>
                      <CircleHelp size={18} aria-hidden="true" />
                      <span>
                        <strong>Guide</strong>: press <kbd className="kbd">?</kbd> or <strong>Guide me</strong> in the rail to see this tour again.
                      </span>
                    </li>
                    <li>
                      <Smartphone size={18} aria-hidden="true" />
                      <span>
                        <strong>On a phone</strong>, a bottom dock holds Today, Syllabus, Coding and Lab; <LayoutGrid size={13} aria-hidden="true" className="inl" />{' '}
                        <strong>More</strong> opens a sheet with everything else, the syllabus index and the theme switch.
                      </span>
                    </li>
                  </ul>
                </>
              )}
              {step === 3 && (
                <>
                  <h2 id="tour-title" className="h2">
                    Your progress saves itself
                  </h2>
                  <ul className="tour-where">
                    <li>
                      <Save size={18} aria-hidden="true" />
                      <span>
                        Read markers, lab drafts, ratings and exam scores are saved automatically <strong>in this browser</strong>. No account
                        needed.
                      </span>
                    </li>
                    <li>
                      <RotateCcw size={18} aria-hidden="true" />
                      <span>
                        They reset if you clear this site&apos;s data, use a private window or another browser, or press{' '}
                        <strong>Reset all progress</strong> in Settings.
                      </span>
                    </li>
                    <li>
                      <Keyboard size={18} aria-hidden="true" />
                      <span>
                        Arrow keys move through this guide; <kbd className="kbd">Esc</kbd> closes it.
                      </span>
                    </li>
                  </ul>
                </>
              )}
              {step === 4 && (
                <>
                  <h2 id="tour-title" className="h2">
                    Ready? First run.
                  </h2>
                  <p className="tour-lede">Here&apos;s your next job in the queue:</p>
                  <div className="tour-next">
                    <span className="node now" aria-hidden="true" />
                    <span>
                      <strong>{next.title}</strong>
                      <span className="ink3">{next.detail}</span>
                    </span>
                  </div>
                  <div className="tour-cta">
                    <button type="button" className="btn btn-holo" data-autofocus onClick={() => finish(next.href)}>
                      {next.kind === 'start' ? 'Start learning' : 'Go to my next step'}
                      <span className="arr">
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </button>
                    <button type="button" className="btn btn-line" onClick={() => finish('/contents')}>
                      <ListTree size={16} aria-hidden="true" /> Open the Syllabus
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="tour-foot">
          <button type="button" className="btn-ghost tour-later" onClick={onClose}>
            Maybe later
          </button>
          <div className="tour-dots" role="group" aria-label="Tour steps">
            {STEP_TITLES.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`tour-dot ${i === step ? 'on' : i < step ? 'done' : ''}`}
                aria-label={`Step ${i + 1}: ${t}`}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className="tour-nav">
            <button type="button" className="icon-btn" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Back">
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            {step < STEP_TITLES.length - 1 ? (
              <button type="button" className="btn btn-sm" onClick={() => go(step + 1)} data-autofocus={step === 0 ? true : undefined}>
                Next <ArrowRight size={15} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="btn btn-sm" onClick={onClose}>
                All done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
