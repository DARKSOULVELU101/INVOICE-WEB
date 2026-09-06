export const typography = {
  fontFamily: {
    sans: ["Inter Variable", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
    display: ["Space Grotesk Variable", "Space Grotesk", "Inter", "sans-serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  sizes: {
    xs: ["0.75rem", "1.125rem"],
    sm: ["0.875rem", "1.375rem"],
    base: ["0.9375rem", "1.5rem"],
    lg: ["1.0625rem", "1.75rem"],
    xl: ["1.25rem", "1.875rem"],
    "2xl": ["1.5rem", "2.125rem"],
    "3xl": ["1.875rem", "2.5rem"],
    "4xl": ["2.375rem", "3rem"],
    "5xl": ["3.25rem", "3.75rem"],
    "6xl": ["4rem", "1"],
  } as const,
  letterSpacing: {
    tightest: "-0.025em",
    tight: "-0.018em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.12em",
  },
} as const;
