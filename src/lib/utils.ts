import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compactNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) < 1000) return String(Math.round(n));
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function fullNumber(n: number): string {
  return new Intl.NumberFormat("en").format(Math.round(n));
}

export function percent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function signedPercent(n: number, digits = 1): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

export function seconds(n: number): string {
  if (n < 60) return `${n}s`;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function relativeDay(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function titleCase(s: string): string {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
