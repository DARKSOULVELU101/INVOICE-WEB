import type { Config } from "tailwindcss";
import { colors } from "./src/core/design/colors";
import { typography } from "./src/core/design/typography";
import { radius } from "./src/core/design/radius";
import { shadows } from "./src/core/design/shadows";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ...colors,
        brand: colors.brand,
        ink: colors.ink,
        surface: colors.surface,
        accent: colors.accent,
        semantic: colors.semantic,
        text: colors.text,
        border: { ...colors.border, DEFAULT: colors.border.DEFAULT },
        overlay: colors.overlay,
      },
      fontFamily: {
        sans: ["var(--font-kateru)", ...typography.fontFamily.sans],
        display: ["var(--font-asfar)", ...typography.fontFamily.display],
        mono: [...typography.fontFamily.mono],
      },
      borderRadius: radius,
      boxShadow: shadows,
      backgroundImage: {
        "brand-gradient": colors.gradient.brand,
        "brand-soft": colors.gradient.brandSoft,
        shimmer: colors.gradient.shimmer,
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16,1,0.3,1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};
export default config;
