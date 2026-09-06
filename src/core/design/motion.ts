export const motion = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    base: 0.28,
    slow: 0.42,
    slower: 0.6,
  },
  ease: {
    standard: [0.4, 0, 0.2, 1] as const,
    decelerate: [0.16, 1, 0.3, 1] as const,
    accelerate: [0.3, 0, 0.85, 0.4] as const,
    spring: { type: "spring", stiffness: 320, damping: 28, mass: 0.9 } as const,
  },
  yOffset: {
    soft: 8,
    base: 16,
    strong: 28,
  },
  scale: {
    hover: 1.015,
    active: 0.985,
  },
  stagger: {
    container: 0.03,
    section: 0.07,
  },
} as const;

export const prefersReducedMotion = "(prefers-reduced-motion: reduce)";
