/**
 * QA Learn's mark: a notebook page with a red margin rule, two ruled lines and a ticked check box —
 * a test case written down and passed. Drawn with currentColor (ink) + the margin token, so it follows the theme.
 * The same drawing is the favicon (public/favicon.svg).
 */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="27" height="27" rx="3" fill="var(--surface)" stroke="currentColor" strokeWidth="2" />
      <path d="M9 3v26" stroke="var(--margin-rule)" strokeWidth="1.6" />
      <path d="M13 11.5h12M13 17h12M13 22.5h7" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
      <path d="m14.5 15.5 3.2 3.2 6.8-7.4" fill="none" stroke="var(--good)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
