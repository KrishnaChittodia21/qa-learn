import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Compass,
  FlaskConical,
  Keyboard,
  ListTree,
  Menu,
  RotateCcw,
  Save,
  Search,
  Target,
  X,
} from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { useProgress } from '../lib/progress';
import { nextStep } from '../lib/nextStep';
import { TAB_META, type TabId } from '../lib/studyLoop';
import { useFocusTrap } from '../lib/useFocusTrap';

const LOOP: TabId[] = ['learn', 'code', 'interview', 'envelope', 'exam', 'company'];
const STEP_TITLES = ['What this is', 'The study loop', 'Finding your way', 'Your progress', 'Start here'];

/** Welcome tour: shown once on first visit, re-opened from the Guide button or the "?" key. */
export default function WelcomeTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
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
        className="modal tour"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="tour-head">
          <span className="eyebrow">
            <Compass size={14} aria-hidden="true" /> Guide · {step + 1}/{STEP_TITLES.length}
          </span>
          <button type="button" className="btn-ghost icon-btn" aria-label="Close the guide" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="tour-body" aria-live="polite">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {step === 0 && (
                <>
                  <h2 id="tour-title">Welcome to QA Learn</h2>
                  <p>
                    A guided path from zero to a job-ready QA engineer: {TOPICS.length} topics in {PHASES.length} phases, each with
                    lessons, hands-on labs, interview practice and a timed exam.
                  </p>
                  <ol className="tour-phases">
                    {PHASES.map((ph, i) => (
                      <motion.li
                        key={ph.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.2 }}
                      >
                        <span className="tour-phase-num">{String(ph.number).padStart(2, '0')}</span>
                        <span>{ph.title}</span>
                      </motion.li>
                    ))}
                  </ol>
                </>
              )}
              {step === 1 && (
                <>
                  <h2 id="tour-title">Every topic follows the same loop</h2>
                  <p className="muted">Follow the Study path at the top of each topic, left to right.</p>
                  <ol className="tour-loop">
                    {LOOP.map((id, i) => {
                      const m = TAB_META[id];
                      const Icon = m.icon;
                      return (
                        <motion.li
                          key={id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 * i, duration: 0.22, ease: 'easeOut' }}
                        >
                          <span className="tour-loop-icon">
                            <Icon size={18} aria-hidden="true" />
                          </span>
                          <span>
                            <strong>
                              {m.label}
                              {id === 'company' && <span className="muted small"> (when the topic has them)</span>}
                            </strong>
                            <span className="muted small"> {m.why}</span>
                          </span>
                        </motion.li>
                      );
                    })}
                  </ol>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 id="tour-title">Where things are</h2>
                  <ul className="tour-where">
                    <li>
                      <Menu size={18} aria-hidden="true" />
                      <span>
                        <strong>Top bar &amp; syllabus</strong>: the main pages sit along the top. Beside each lesson, the syllabus lists every topic by phase with a tick box for its status (hide it with the menu button; on small screens both live in the menu).
                      </span>
                    </li>
                    <li>
                      <ListTree size={18} aria-hidden="true" />
                      <span>
                        <strong>Contents</strong>: everything in the course on one page, searchable, down to each section.
                      </span>
                    </li>
                    <li>
                      <Search size={18} aria-hidden="true" />
                      <span>
                        <strong>Search</strong>: press <kbd>⌘</kbd> <kbd>K</kbd> (or <kbd>Ctrl</kbd> <kbd>K</kbd>) to jump to any page,
                        topic, section or question.
                      </span>
                    </li>
                    <li>
                      <Target size={18} aria-hidden="true" />
                      <span>
                        <strong>Weak Areas</strong>: the sections behind the questions you missed, so you revise what matters.
                      </span>
                    </li>
                    <li>
                      <FlaskConical size={18} aria-hidden="true" />
                      <span>
                        <strong>Practice</strong>: JS coding problems, the JS Playground and the Playwright Lab.
                      </span>
                    </li>
                    <li>
                      <Building2 size={18} aria-hidden="true" />
                      <span>
                        <strong>Company Questions</strong>: {COMPANY_QUESTIONS.length} questions reported at named companies.
                      </span>
                    </li>
                  </ul>
                </>
              )}
              {step === 3 && (
                <>
                  <h2 id="tour-title">Your progress saves itself</h2>
                  <ul className="tour-where">
                    <li>
                      <Save size={18} aria-hidden="true" />
                      <span>
                        Read markers, lab drafts, ratings and exam scores are saved automatically <strong>in this browser</strong>. No
                        account needed.
                      </span>
                    </li>
                    <li>
                      <RotateCcw size={18} aria-hidden="true" />
                      <span>
                        They reset if you clear this site&apos;s data, use a private window or another browser, or press{' '}
                        <strong>Reset progress</strong> in Settings.
                      </span>
                    </li>
                    <li>
                      <Keyboard size={18} aria-hidden="true" />
                      <span>
                        Press <kbd>?</kbd> any time (or the <strong>Guide</strong> button) to see this tour again.
                      </span>
                    </li>
                  </ul>
                </>
              )}
              {step === 4 && (
                <>
                  <h2 id="tour-title">Start here</h2>
                  <p>Your next step:</p>
                  <div className="tour-next">
                    <strong>{next.title}</strong>
                    <span className="muted small">{next.detail}</span>
                  </div>
                  <div className="row gap-s wrap">
                    <button type="button" className="btn btn-primary" data-autofocus onClick={() => finish(next.href)}>
                      {next.kind === 'start' ? 'Start learning' : 'Go to my next step'} <ArrowRight size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn" onClick={() => finish('/contents')}>
                      <ListTree size={16} aria-hidden="true" /> Show me the Contents
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="tour-foot">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Skip
          </button>
          <div className="tour-dots" role="group" aria-label="Tour steps">
            {STEP_TITLES.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`tour-dot ${i === step ? 'on' : ''}`}
                aria-label={`Step ${i + 1}: ${t}`}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className="row gap-s">
            <button type="button" className="btn" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Back">
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            {step < STEP_TITLES.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => go(step + 1)} data-autofocus={step === 0 ? true : undefined}>
                Next <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="btn" onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
