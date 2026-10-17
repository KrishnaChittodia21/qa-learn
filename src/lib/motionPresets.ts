// Shared motion presets (motion/react). MotionConfig reducedMotion="user" in App.tsx turns the
// transform parts off for people who ask the OS for less motion; opacity still fades.

/** Scroll reveal: a block springs up into place the first time it enters the viewport. */
export const reveal = {
  initial: { opacity: 0, y: 36, rotate: -0.6 },
  whileInView: { opacity: 1, y: 0, rotate: 0 },
  viewport: { once: true, margin: '0px 0px -60px 0px' },
  transition: { type: 'spring', stiffness: 260, damping: 24, opacity: { duration: 0.25 } },
} as const;

/** A quick bouncy spring for pops (badges, stickers, toasts). */
export const pop = { type: 'spring', stiffness: 420, damping: 18 } as const;
