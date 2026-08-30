"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Dna,
  LayoutDashboard,
  Radar,
  Menu,
  Film,
  User,
  X,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Compass },
  { href: "/content-dna", label: "Content DNA", icon: Dna },
  { href: "/viral-radar", label: "Viral Radar", icon: Radar },
  { href: "/videos", label: "Videos", icon: Film },
  { href: "/profile", label: "Profile", icon: User },
];

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" aria-label="Pulse home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-soft border border-line text-muted"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {open && (
        <nav className="border-b border-line bg-surface px-3 py-2 md:hidden">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm",
                isActive(href) ? "bg-accent/10 text-accent" : "text-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      )}

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <Link href="/dashboard" className="px-2" aria-label="Pulse home">
          <Logo />
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm transition-colors",
                isActive(href)
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-muted hover:bg-raised hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <p className="truncate px-2 font-mono text-[11px] text-muted" title={email}>
            {email}
          </p>
          <div className="flex items-center gap-2 px-1">
            <ThemeToggle />
            <Link
              href="/billing"
              className="flex-1 rounded-soft border border-line px-3 py-2 text-center text-xs text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              Plan &amp; billing
            </Link>
          </div>
          <form action="/auth/sign-out" method="post" className="px-1">
            <button
              type="submit"
              className="w-full rounded-soft px-3 py-2 text-left text-xs text-muted transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
