/**
 * QA Learn's mark: a test case written down and passed — two short lines and a big check on a
 * sticker tile. The tile is painted by CSS (.brand-mark: --accent-fill, an ink outline, a hard
 * offset shadow and a little tilt) and the strokes use currentColor (ink), so it follows the theme
 * and the colour setting. The favicon (public/favicon.svg) is the same drawing in the default Bubblegum.
 */
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M8 10.5h10M8 16h5M8 21.5h4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="m15.4 18 3.6 3.6 7.2-8.2" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
