"use client";

import { motion } from "framer-motion";
import { cn } from "@/core/lib/utils";
import { motion as motionTokens, typography } from "@/core/design";

export function GenvouchLogo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { mark: "h-7 w-7", text: "text-base", studio: "text-[0.55rem]" },
    md: { mark: "h-9 w-9", text: "text-xl", studio: "text-[0.6rem]" },
    lg: { mark: "h-12 w-12", text: "text-3xl", studio: "text-[0.7rem]" },
  }[size];

  return (
    <motion.div
      className={cn("flex items-center gap-3 select-none", className)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.decelerate }}
    >
      <GenvouchBlinkMark className={dims.mark} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-tight text-ink-900",
              dims.text
            )}
          >
            GENVOUCH
          </span>
          <span
            className={cn(
              "mt-1 font-medium uppercase tracking-[0.18em] text-ink-400",
              dims.studio
            )}
          >
            Invoice Studio
          </span>
        </div>
      )}
    </motion.div>
  );
}

function GenvouchBlinkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={cn(className)}>
      <defs>
        <linearGradient id="gv-logo-g" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#1F41F5" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      <rect
        width="48"
        height="48"
        rx="12"
        className="fill-white stroke-[url(#gv-logo-g)]"
        strokeWidth="1.5"
      />
      <path
        d="M13 34V14h3.2l8.1 12V14h3.4v20h-3.2l-8.1-12v12H13Z"
        fill="url(#gv-logo-g)"
      />
      <path
        d="M33 34V18.5H28V15h13v3.5H36.2V34H33Z"
        fill="url(#gv-logo-g)"
        opacity="0.92"
      />
    </svg>
  );
}