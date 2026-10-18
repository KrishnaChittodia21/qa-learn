import type { CSSProperties, ReactNode } from 'react';

/**
 * Hand-drawn decorations for the "sunny sticker lab" look. All are decorative (aria-hidden) and
 * paint with theme tokens: --outline for the ink outline, the --pop-* fills for colour, so they follow
 * light/dark and the accent setting. Shapes are simple inline SVG: no image requests.
 */

/** A four-point sparkle; position it with `style` (absolute) inside a positioned parent. */
export function Sparkle({ size = 22, color = 'var(--pop-sun)', className = '', style }: { size?: number; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`doodle sparkle ${className}`} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 1.5c.9 5.6 2.9 7.6 8.5 8.5c-5.6.9-7.6 2.9-8.5 8.5c-.9-5.6-2.9-7.6-8.5-8.5c5.6-.9 7.6-2.9 8.5-8.5Z"
        fill={color}
        stroke="var(--outline)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        transform="translate(0 2)"
      />
    </svg>
  );
}

/**
 * Bug Buddy: a friendly ladybird-ish bug under a magnifying glass, the app's mascot for
 * "finding bugs is fun". Used on the fresh-start dashboard and in empty states.
 */
export function BugBuddy({ size = 160, mood = 'happy', className = '' }: { size?: number; mood?: 'happy' | 'sleepy' | 'party'; className?: string }) {
  const mouth =
    mood === 'sleepy' ? 'M53 74q5 2 10 0' : mood === 'party' ? 'M50 70q8 12 16 0Z' : 'M51 71q7 8 14 0';
  return (
    <svg className={`doodle bug-buddy ${className}`} width={size} height={size} viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      {/* backdrop blob */}
      <path d="M28 52c8-30 52-42 82-28s40 50 24 78s-60 42-88 28S20 82 28 52Z" fill="var(--tint-sky)" />
      {/* handle of the magnifier */}
      <path d="m112 112 26 26" stroke="var(--outline)" strokeWidth="14" strokeLinecap="round" />
      <path d="m112 112 26 26" stroke="var(--pop-tangerine)" strokeWidth="8" strokeLinecap="round" />
      {/* lens */}
      <circle cx="78" cy="78" r="46" fill="var(--surface)" stroke="var(--outline)" strokeWidth="4" />
      <path d="M50 58a34 34 0 0 1 22-14" stroke="var(--pop-sky)" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* bug: antennae, body, shell, spots */}
      <path d="M50 46q-6-10-14-10M66 44q4-11 13-12" stroke="var(--outline)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="36" r="4" fill="var(--pop-pink)" stroke="var(--outline)" strokeWidth="2.5" />
      <circle cx="79" cy="32" r="4" fill="var(--pop-pink)" stroke="var(--outline)" strokeWidth="2.5" />
      <ellipse cx="58" cy="76" rx="26" ry="28" fill="var(--pop-mint)" stroke="var(--outline)" strokeWidth="3.5" />
      <circle cx="58" cy="54" r="16" fill="var(--pop-sun)" stroke="var(--outline)" strokeWidth="3.5" />
      {mood === 'sleepy' ? (
        <path d="M48 53h7M61 53h7" stroke="var(--outline)" strokeWidth="2.5" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="52" cy="53" r="2.6" fill="var(--outline)" />
          <circle cx="64" cy="53" r="2.6" fill="var(--outline)" />
        </>
      )}
      <path d={mouth} stroke="var(--outline)" strokeWidth="2.5" strokeLinecap="round" fill={mood === 'party' ? 'var(--pop-pink)' : 'none'} />
      <path d="M58 70v32" stroke="var(--outline)" strokeWidth="2.5" />
      <circle cx="47" cy="82" r="4" fill="var(--outline)" />
      <circle cx="69" cy="80" r="4" fill="var(--outline)" />
      <circle cx="49" cy="96" r="3" fill="var(--outline)" />
      <circle cx="68" cy="95" r="3" fill="var(--outline)" />
      {/* a tick, because the bug is caught */}
      <path d="m96 70 8 8 16-18" stroke="var(--good)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/**
 * Friendly empty state: an illustration, a warm heading, a line of help and an optional next step.
 * `compact` drops the illustration size for use inside chart cards.
 */
export function EmptyState({
  title,
  children,
  action,
  mood = 'happy',
  compact = false,
  className = '',
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  mood?: 'happy' | 'sleepy' | 'party';
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''} ${className}`}>
      <BugBuddy size={compact ? 84 : 150} mood={mood} />
      <div className="empty-state-body">
        <p className="empty-state-title">{title}</p>
        {children && <div className="empty-state-text">{children}</div>}
        {action && <div className="empty-state-action">{action}</div>}
      </div>
    </div>
  );
}
