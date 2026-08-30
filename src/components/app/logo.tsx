import { cn } from "@/lib/utils";

/** The wordmark carries a miniature of the same trace used by the score meter. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent" aria-hidden>
        <path
          d="M1 12h4l2.5-8 4 16 3-11 2.5 3H23"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[17px] font-bold tracking-[-0.03em]">Pulse</span>
    </span>
  );
}
