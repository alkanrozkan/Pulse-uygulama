import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { buttonClasses } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" aria-label="Pulse home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#benefits" className="transition-colors hover:text-ink">
            Why it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-ink">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-ink">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden px-3 py-2 text-sm text-muted transition-colors hover:text-ink sm:block"
          >
            Sign in
          </Link>
          <Link href="/signup" className={buttonClasses({ size: "sm" })}>
            Analyze my content
          </Link>
        </div>
      </div>
    </header>
  );
}
