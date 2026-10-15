import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, History, Sparkles, Target } from 'lucide-react';
import type { NextStepResult } from '../lib/nextStep';

/** Dashboard "Your next step": one big obvious action, plus revise / continue alternatives. */
export function NextStepCard({ step, resume }: { step: NextStepResult; resume?: { href: string; label: string } }) {
  return (
    <motion.section
      className="card next-step featured"
      aria-labelledby="next-step-title"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="next-step-main">
        <div className="eyebrow">
          <Sparkles size={14} aria-hidden="true" /> Your next step
        </div>
        <h2 id="next-step-title">{step.title}</h2>
        <p className="muted">{step.detail}</p>
        <div className="row gap-s wrap">
          <Link to={step.href} className="btn btn-primary btn-lg">
            {step.kind === 'start' ? 'Start learning' : 'Go'} <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {step.secondary && (
            <Link to={step.secondary.href} className="btn">
              <Target size={16} aria-hidden="true" /> or {step.secondary.title.charAt(0).toLowerCase() + step.secondary.title.slice(1)}
            </Link>
          )}
        </div>
      </div>
      {resume && (
        <Link to={resume.href} className="resume-link">
          <History size={16} aria-hidden="true" />
          <span>
            <span className="muted small">Continue where you left off</span>
            <strong>{resume.label}</strong>
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </motion.section>
  );
}
