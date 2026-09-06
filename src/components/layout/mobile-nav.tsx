"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  Menu,
  X,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/core/lib/utils";
import { GenvouchMark } from "@/components/brand/GenvouchMark";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { motion as motionTokens } from "@/core/design";

export function MobileNav({ user }: { user: { name?: string | null; email?: string | null; orgName?: string | null } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/team", label: "Team", icon: ShieldCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="gv-focus-ring rounded-lg p-2 text-ink-700 transition-colors hover:bg-ink-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <GenvouchMark className="h-7 w-7" gradientId="mobilenav-g" />
          <span className="font-display text-sm font-bold tracking-tight text-ink-900">GENVOUCH</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard/invoices/new" aria-label="New invoice">
            <Button size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="gv-focus-ring hidden rounded-full"
          >
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[1100] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface-subtle shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: motionTokens.ease.standard }}
              aria-label="Mobile navigation"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <div className="flex items-center gap-2.5">
                  <GenvouchMark className="h-8 w-8" gradientId="mobilenav-g2" />
                  <div className="leading-none">
                    <p className="font-display text-sm font-bold tracking-tight text-ink-900">GENVOUCH</p>
                    <p className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-ink-400">Invoice Studio</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="gv-focus-ring rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-ink-900 text-white"
                            : "text-ink-600 hover:bg-white hover:text-ink-900"
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px]" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-border p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{user.name ?? "You"}</p>
                    <p className="truncate text-xs text-ink-400">{user.email ?? user.orgName}</p>
                  </div>
                </div>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-ink-600">
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </form>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}