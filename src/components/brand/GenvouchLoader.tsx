"use client";

import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { colors, motion as motionTokens, zIndex } from "@/core/design";

const GENVOUCH = "GENVOUCH".split("");
const SUBTITLE = "POWERED BY GENVOUCH TECHNOLOGIES PVT";

export function GenvouchLoader({ minDisplayMs = 2400 }: { minDisplayMs?: number }) {
  const [phase, setPhase] = useState<"mark" | "wordmark" | "subtitle" | "exit" | "done">("mark");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (t: number, fn: () => void) => timers.push(setTimeout(fn, t));

    schedule(200, () => setPhase("wordmark")); // G logo path animates first ~200ms
    schedule(1450, () => setPhase("subtitle"));
    schedule(motionTokens.duration.slower * 1000 + 2200, () => setPhase("exit"));
    schedule(minDisplayMs + 380, () => setHidden(true));

    return () => timers.forEach(clearTimeout);
  }, [minDisplayMs]);

  return (
    <AnimatePresence onExitComplete={() => setHidden(true)}>
      {!hidden && (
        <motion.div
          key="genvouch-loader"
          aria-hidden="true"
          className="fixed inset-0 z-[1400] flex flex-col items-center justify-center bg-white"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
        >
          {/* Persistent subtle brand backdrop */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: colors.gradient.brandSoft,
                filter: "blur(70px)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: motionTokens.duration.slower, ease: motionTokens.ease.decelerate }}
            />
          </div>

          <div className="relative flex flex-col items-center">
            {/* Animated G mark */}
            <div className="relative mb-8">
              <motion.svg
                viewBox="0 0 48 48"
                width={88}
                height={88}
                initial={{ scale: 0.85, opacity: 0, rotate: -6 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  duration: motionTokens.duration.slower,
                  ease: motionTokens.ease.decelerate,
                }}
              >
                <defs>
                  <linearGradient id="loader-grad" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#39489D" />
                    <stop offset="0.55" stopColor="#7E6AC6" />
                    <stop offset="1" stopColor="#AEC0E8" />
                  </linearGradient>
                </defs>
                <motion.rect
                  width="48"
                  height="48"
                  rx="12"
                  stroke="url(#loader-grad)"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </motion.svg>
              {/* The G glyph with staggered path reveal */}
              <motion.svg
                viewBox="0 0 48 48"
                width={88}
                height={88}
                className="absolute inset-0"
              >
                <defs>
                  <linearGradient id="loader-grad-glyph" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#39489D" />
                    <stop offset="0.55" stopColor="#7E6AC6" />
                    <stop offset="1" stopColor="#AEC0E8" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M13 34V14h3.2l8.1 12V14h3.4v20h-3.2l-8.1-12v12H13Z"
                  fill="none"
                  stroke="url(#loader-grad-glyph)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
                />
                <motion.path
                  d="M33 34V18.5H28V15h13v3.5H36.2V34H33Z"
                  fill="none"
                  stroke="url(#loader-grad-glyph)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.32 }}
                />
              </motion.svg>
            </div>

            {/* GENVOUCH letter by letter */}
            <AnimatePresence>
              {phase !== "mark" && (
                <motion.div
                  key="wordmark"
                  className="flex overflow-hidden font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl"
                >
                  {GENVOUCH.map((letter, i) => (
                    <motion.span
                      key={`w-${i}`}
                      initial={{ opacity: 0, y: 22, rotateX: 50 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                      transition={{
                        duration: 0.45,
                        delay: i * 0.06,
                        ease: motionTokens.ease.decelerate,
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* INVOICE STUDIO */}
            <AnimatePresence>
              {phase !== "mark" && (
                <motion.span
                  key="studio"
                  className="mt-3 font-medium uppercase tracking-[0.42em] text-ink-500"
                  initial={{ opacity: 0, letterSpacing: "0.1em" }}
                  animate={{ opacity: 1, letterSpacing: "0.42em" }}
                  transition={{ duration: motionTokens.duration.slower, ease: motionTokens.ease.decelerate }}
                >
                  Invoice Studio
                </motion.span>
              )}
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence>
              {phase === "subtitle" || phase === "exit" ? (
                <motion.p
                  key="subtitle"
                  className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.standard }}
                >
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand-500" />
                  {SUBTITLE}
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent-400" />
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Gradient shimmer sweep */}
          <motion.div
            className="shimmer-sweep pointer-events-none absolute inset-x-0 top-0 h-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "subtitle" ? 1 : 0.7 }}
            transition={{ duration: motionTokens.duration.base }}
          />
          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-brand-600 via-accent-400 to-accent-200"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: minDisplayMs / 1000 - 0.4, ease: [0.65, 0, 0.35, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}