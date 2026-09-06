import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined, locale = "en-US") {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
}

export function generateInvoiceNumber(prefix = "INV", sequence = 1, year?: number) {
  const y = year ?? new Date().getFullYear();
  return `${prefix}-${y}-${String(sequence).padStart(4, "0")}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length - 1) + "…" : str;
}

export function initials(name?: string | null) {
  if (!name) return "GV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function absoluteUrl(path: string) {
  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? "http://localhost:3000";
  const normalized = base.startsWith("http") ? base : `https://${base}`;
  return `${normalized}${path.startsWith("/") ? path : `/${path}`}`;
}