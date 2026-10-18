import { useId } from 'react';

/**
 * QA.learn "Spectral Lab" mark: a beam enters a prism and leaves as a spectrum (every check splits
 * into lime → mint → cyan → lilac). The incoming beam uses currentColor, so it follows the ink of
 * whatever it sits on. public/favicon.svg is the same drawing.
 */
export function BrandMark({ size = 34 }: { size?: number }) {
  const id = `bm-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C8FF3D" />
          <stop offset=".35" stopColor="#3DFFC2" />
          <stop offset=".65" stopColor="#3DD9FF" />
          <stop offset="1" stopColor="#E08BFF" />
        </linearGradient>
      </defs>
      <path d="M1 19.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      <path d="M15 4 26 26H4z" fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 4v22" stroke={`url(#${id})`} strokeWidth="1" opacity=".55" />
      <path d="M20.5 16.5 33 12M21.3 18.2 33 17.5M22 20 33 23" strokeWidth="1.6" strokeLinecap="round" fill="none" stroke={`url(#${id})`} />
    </svg>
  );
}

/** "QA.learn" word mark (the dot carries the spectrum) with the optional SPECTRAL LAB sub-label. */
export function BrandName({ sub = true }: { sub?: boolean }) {
  return (
    <span className="brand-text">
      <span className="brand-name">
        QA<i>.</i>learn
      </span>
      {sub && <span className="brand-sub">SPECTRAL LAB</span>}
    </span>
  );
}
