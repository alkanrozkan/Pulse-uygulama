import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "pos" | "neg" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "bg-raised text-muted",
  accent: "bg-accent/12 text-accent",
  pos: "bg-pos/12 text-pos",
  neg: "bg-neg/12 text-neg",
  outline: "border border-line text-muted",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em]",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
