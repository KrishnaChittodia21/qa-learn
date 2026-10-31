// Account-only features seen while logged out. Adapted from system-design-learn's src/components/LockedPreview.tsx.
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useSession } from '../lib/session';

/** The "sign up to unlock" prompt: a banner above a page, or (`compact`) a panel centred on a card. */
export function LockedBanner({ feature, why, compact = false }: { feature: string; why: string; compact?: boolean }) {
  const session = useSession();
  const { pathname, search } = useLocation();
  if (session.status !== 'out') return null;
  const next = encodeURIComponent(pathname + search);
  return (
    <div className={compact ? 'locked-overlay' : 'locked-banner panel flat'} role="note" aria-label={`${feature} is locked`}>
      <span className="locked-ic" aria-hidden="true">
        <Lock size={compact ? 18 : 20} />
      </span>
      <div className="locked-copy">
        <strong>Sign up to unlock {feature}</strong>
        <p>{why}</p>
      </div>
      <div className="locked-acts">
        <Link className="btn btn-primary btn-sm" to={`/signup?next=${next}`}>
          Create an account
        </Link>
        <Link className="btn-ghost btn-sm" to={`/login?next=${next}`}>
          Sign in
        </Link>
      </div>
    </div>
  );
}

/**
 * The real section stays visible but dimmed and fully disabled (`inert`: no clicks, typing or focus), with a
 * "sign up to unlock" prompt. A page gets the prompt as a banner above it; a card (`compact`) gets it centred on top.
 */
export function LockedPreview({ feature, why, compact = false, children }: { feature: string; why: string; compact?: boolean; children: ReactNode }) {
  const session = useSession();
  if (session.status === 'in') return <>{children}</>;
  const prompt = <LockedBanner feature={feature} why={why} compact={compact} />;
  return (
    <div className={`locked-preview ${compact ? 'compact' : ''}`}>
      {!compact && prompt}
      {/* inert: nothing inside can be clicked, typed into or tabbed to; aria-hidden so screen readers skip the preview */}
      <div className="locked-content" inert aria-hidden="true">
        {children}
      </div>
      {compact && prompt}
    </div>
  );
}
