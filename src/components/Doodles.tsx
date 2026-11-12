import { useId, type CSSProperties, type ReactNode } from 'react';

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

export type BugMood = 'happy' | 'thinking' | 'sleepy' | 'party';

const EYES: Record<BugMood, ReactNode> = {
  happy: (
    <>
      <g className="blink">
        <circle cx="51" cy="44" r="6" fill="#fff" />
        <circle cx="69" cy="44" r="6" fill="#fff" />
        <circle cx="52" cy="45" r="3.2" fill="#0b1020" />
        <circle cx="70" cy="45" r="3.2" fill="#0b1020" />
      </g>
      <path d="M54 53q6 5 12 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  ),
  thinking: (
    <>
      <circle cx="51" cy="44" r="6" fill="#fff" />
      <circle cx="69" cy="44" r="6" fill="#fff" />
      <circle cx="53.5" cy="41.5" r="3" fill="#0b1020" />
      <circle cx="71.5" cy="41.5" r="3" fill="#0b1020" />
      <path d="M56 55h8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <g fill="var(--cyan)">
        <circle cx="92" cy="22" r="2.5" />
        <circle cx="99" cy="13" r="3.5" />
        <text x="102" y="8" fontSize="18" fontWeight="700">?</text>
      </g>
    </>
  ),
  party: (
    <>
      <path d="M46 45q5-6 10 0M64 45q5-6 10 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M53 51h14q-1 8-7 8t-7-8z" fill="#fff" />
      <path d="M18 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--lime)" />
      <path d="M100 46l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="var(--cyan)" />
      <circle cx="96" cy="24" r="2.5" fill="var(--iris)" />
    </>
  ),
  sleepy: (
    <>
      <path d="M46 45q5 4 10 0M64 45q5 4 10 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="55" r="2.6" fill="#fff" />
      <text x="86" y="26" fontSize="11" fill="var(--ink-3)">z</text>
      <text x="94" y="15" fontSize="15" fill="var(--ink-3)">Z</text>
    </>
  ),
};

/**
 * Bugsy: the app's mascot, a round debugging beetle in the Spectral colours (from the Nebula Lab design,
 * design-v2). Moods: happy, thinking, sleepy, party. Decorative: the words around it carry the meaning.
 */
export function BugBuddy({ size = 160, mood = 'happy', className = '' }: { size?: number; mood?: BugMood; className?: string }) {
  const g = useId(); // a unique gradient id per drawing: several Bugsys can share a page
  return (
    <svg className={`doodle bug-buddy bugsy bugsy-${mood} ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eeab0" />
          <stop offset=".55" stopColor="#4cc9f0" />
          <stop offset="1" stopColor="#8b7cf6" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="110" rx="30" ry="4" fill="currentColor" opacity=".12" />
      <g className="bob">
        <g stroke="#2a3358" strokeWidth="3.2" strokeLinecap="round" fill="none">
          <path d={mood === 'party' ? 'M30 66 18 50M90 66l12-16' : 'M30 70 19 66M90 70l11-4'} />
          <path d="M32 84 21 92M88 84l11 8M42 98l-6 9M78 98l6 9" />
          <path d="M52 27q-4-12-12-15M68 27q4-12 12-15" />
        </g>
        <circle cx="40" cy="12" r="3.6" fill="var(--lime)" />
        <circle cx="80" cy="12" r="3.6" fill="var(--iris)" />
        <ellipse cx="60" cy="78" rx="33" ry="28" fill={`url(#${g})`} />
        <path d="M60 54v51" stroke="#0b1020" strokeOpacity=".35" strokeWidth="2" />
        <circle cx="45" cy="76" r="4" fill="#0b1020" opacity=".18" />
        <circle cx="76" cy="86" r="5" fill="#0b1020" opacity=".18" />
        <circle cx="73" cy="68" r="3" fill="#0b1020" opacity=".18" />
        <path d="M36 64q10-14 24-14" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="46" r="20" fill="#1b2244" />
        <circle cx="60" cy="46" r="20" fill="none" stroke="#fff" strokeOpacity=".12" />
        <circle cx="45" cy="53" r="3" fill="#fb7185" opacity=".55" />
        <circle cx="75" cy="53" r="3" fill="#fb7185" opacity=".55" />
        {EYES[mood]}
      </g>
    </svg>
  );
}
export { BugBuddy as Bugsy };

/** "Bugsy's tip": a small card with the thinking mascot and one practical hint. */
export function BugsyTip({ children, mood = 'thinking', className = '' }: { children: ReactNode; mood?: BugMood; className?: string }) {
  return (
    <p className={`bugsy-tip ${className}`}>
      <BugBuddy size={44} mood={mood} />
      <span>
        <b>Bugsy&rsquo;s tip:</b> {children}
      </span>
    </p>
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
  mood?: BugMood;
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
