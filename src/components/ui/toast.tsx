"use client";

import { AnimatePresence, motion } from "framer-motion";

export type ToastKind = "success" | "error" | "info";

export function Toast({
  toasts,
  remove,
}: {
  toasts: { id: string; kind: ToastKind; message: string }[];
  remove: (id: string) => void;
}) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[1300] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg"
            role="status"
          >
            <span
              className={cn_dot(t.kind)}
              aria-hidden
            />
            <p className="text-sm font-medium text-ink-900">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className="ml-2 text-ink-400 transition-colors hover:text-ink-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function cn_dot(kind: ToastKind) {
  const map = {
    success: "bg-semantic-success",
    error: "bg-semantic-danger",
    info: "bg-brand-500",
  } as const;
  return `h-2 w-2 rounded-full ${map[kind]}`;
}

export const toastColor = { success: "bg-semantic-success", error: "bg-semantic-danger", info: "bg-brand-500" };