// The guide for the page you are on (M4), opened from "Guide me" or "?". Adapted from system-design-learn's PageGuide.
import { useRef } from 'react';
import { motion } from 'motion/react';
import { MousePointerClick, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useFocusTrap } from '../lib/useFocusTrap';
import { closePageGuide, startWalk } from '../lib/guide';
import { guideFor } from '../lib/pageGuides';
import { BugBuddy } from './Doodles';

export default function PageGuide({ onFullTour }: { onFullTour: () => void }) {
  const { pathname } = useLocation();
  const guide = guideFor(pathname);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, closePageGuide);
  if (!guide) return null;
  // "Show me" only when something it points at is on screen
  const walk = guide.walk?.some((st) => document.querySelector(st.target)) ? guide.walk : undefined;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closePageGuide()}>
      <motion.div
        ref={ref}
        className="panel cut-lg modal tour page-guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="tour-head">
          <span className="mlabel">
            <b>Guide</b> · this page
          </span>
          <button type="button" className="icon-btn" aria-label="Close the guide" onClick={closePageGuide}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="tour-body">
          <div className="bugsy-hello">
            <BugBuddy size={56} mood="happy" />
            <h2 id="pg-title" className="h2">
              {guide.title}
            </h2>
          </div>
          <p className="tour-lede">{guide.intro}</p>
          <dl className="pg-items">
            {guide.items.map(([term, what]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="tour-foot">
          <button type="button" className="btn-ghost btn-sm" onClick={onFullTour}>
            Full course tour
          </button>
          <div className="pg-acts">
            {walk && (
              <button type="button" className="btn btn-holo btn-sm" data-autofocus onClick={() => startWalk(walk)}>
                <MousePointerClick size={15} aria-hidden="true" /> Show me
              </button>
            )}
            <button type="button" className="btn btn-sm" data-autofocus={walk ? undefined : true} onClick={closePageGuide}>
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
