import { GenvouchMark } from "@/components/brand/GenvouchMark";

export const AUTH_LAYOUT_CARDS = {
  slogan: "The modern way to get paid.",
  subtitle:
    "Build trust with premium invoices, secure sharing, and effortless follow-ups — all in one operating system.",
};

export function AuthShell({ children, mode }: { children: React.ReactNode; mode: "login" | "register" }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/4 h-[420px] w-[420px] rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-accent-600/20 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <GenvouchMark className="h-10 w-10" gradientId="auth-mark-g" />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              GENVOUCH
              <span className="ml-2 align-middle text-[0.55rem] font-medium uppercase tracking-[0.18em] text-white/50">
                Invoice Studio
              </span>
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white">
              {AUTH_LAYOUT_CARDS.slogan}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{AUTH_LAYOUT_CARDS.subtitle}</p>

            <div className="mt-10 space-y-3">
              {["Print-ready branded invoices", "Secure public links with signed tokens", "Server-side email, protected credentials", "Full audit trail on every action"].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/25 text-brand-300">
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                      <path d="M3 8.5 6.2 11.5 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">
            Powered by GENVOUCH TECHNOLOGIES PVT · © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-white px-6 py-10 sm:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] lg:hidden">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <GenvouchMark className="h-9 w-9" gradientId="auth-mark-mobile-g" />
            <span className="font-display text-base font-bold tracking-tight text-ink-900">GENVOUCH</span>
          </div>
          {children}
          <p className="mt-8 text-center text-xs leading-relaxed text-ink-400">
            Protected by encryption and signed tokens.
            <br />
            Powered by <span className="font-semibold text-ink-600">GENVOUCH TECHNOLOGIES PVT</span>
          </p>
        </div>
      </div>
    </div>
  );
}