"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  Mail,
  LifeBuoy,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/core/lib/utils";
import { GenvouchMark } from "@/components/brand/GenvouchMark";
import { Avatar } from "@/components/ui/avatar";

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
      { href: "/dashboard/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/team", label: "Team", icon: Mail },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/audit", label: "Audit log", icon: ShieldCheck },
    ],
  },
];

export type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  orgName?: string | null;
};

export function SideNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-surface-subtle lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <GenvouchMark className="h-8 w-8" gradientId="sidenav-g" />
        <div className="leading-none">
          <p className="font-display text-sm font-bold tracking-tight text-ink-900">GENVOUCH</p>
          <p className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Invoice Studio
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-ink-900 text-white shadow-sm"
                          : "text-ink-600 hover:bg-white hover:text-ink-900 hover:shadow-sm"
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <Avatar name={user.name} image={user.image} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{user.name ?? "You"}</p>
            <p className="flex items-center gap-1 truncate text-xs text-ink-400">
              <Building2 className="h-3 w-3" />
              {user.orgName ?? "Workspace"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-1">
          <Link
            href="/dashboard/settings"
            className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Help"
          >
            <LifeBuoy className="h-4 w-4" />
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="gv-focus-ring rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-semantic-danger"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}