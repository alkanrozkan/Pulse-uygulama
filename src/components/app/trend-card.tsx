import { Badge } from "@/components/ui/badge";
import { COMPETITION_LABELS, FORMAT_LABELS } from "@/lib/labels";
import type { Trend } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const COMPETITION_TONE = {
  low: "pos",
  medium: "neutral",
  high: "neg",
} as const;

/** Trend age matters as much as velocity: late entry is the usual failure mode. */
function ageNote(days: number): { label: string; tone: "pos" | "neutral" | "neg" } {
  if (days <= 7) return { label: "Early", tone: "pos" };
  if (days <= 14) return { label: "Mid-cycle", tone: "neutral" };
  return { label: "Late", tone: "neg" };
}

export function TrendCard({ trend }: { trend: Trend }) {
  const age = ageNote(trend.trendAgeDays);

  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-base font-semibold leading-snug">{trend.topic}</h3>
        <div className="shrink-0 text-right">
          <p className="font-mono text-xl font-semibold leading-none tabular-nums text-accent">
            {trend.velocityScore}
          </p>
          <p className="eyebrow mt-1">Velocity</p>
        </div>
      </div>

      {/* Velocity as a bar keeps the card scannable against its neighbours. */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-raised">
        <div className="h-full rounded-full bg-accent" style={{ width: `${trend.velocityScore}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="outline">{FORMAT_LABELS[trend.format]}</Badge>
        <Badge tone={COMPETITION_TONE[trend.competitionLevel]}>
          {COMPETITION_LABELS[trend.competitionLevel]}
        </Badge>
        <Badge tone={age.tone}>
          {age.label} · {trend.trendAgeDays}d
        </Badge>
      </div>

      <div className={cn("mt-5 border-l-2 border-accent/50 pl-4")}>
        <p className="eyebrow mb-1.5">Your angle</p>
        <p className="text-sm leading-relaxed">{trend.suggestedAngle}</p>
      </div>
    </article>
  );
}
