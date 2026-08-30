import { cn } from "@/lib/utils";

/**
 * The Pulse readout — the one signature element in the product.
 *
 * A score is drawn as a signal trace rather than a progress bar: fixed-height
 * ticks form a waveform, and the ticks up to the score are lit. It reads as an
 * instrument, which is what the score is: a confidence reading, not a total.
 */

// A fixed trace so the same score always draws the same shape.
const TRACE = [
  0.35, 0.55, 0.4, 0.7, 0.5, 0.85, 0.6, 0.45, 0.75, 1, 0.65, 0.5, 0.8, 0.55, 0.9, 0.45, 0.7, 0.5,
  0.85, 0.6, 0.4, 0.75, 0.5, 0.35,
];

function band(score: number) {
  if (score >= 75) return { label: "Strong signal", tone: "text-pos" };
  if (score >= 55) return { label: "Above your average", tone: "text-accent" };
  if (score >= 40) return { label: "Around your average", tone: "text-muted" };
  return { label: "Experimental", tone: "text-muted" };
}

export function ScoreMeter({
  score,
  size = "md",
  showLabel = true,
  className,
}: {
  score: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const lit = Math.round((clamped / 100) * TRACE.length);
  const { label, tone } = band(clamped);
  const height = size === "sm" ? 20 : 28;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="flex items-end gap-[3px]"
        style={{ height }}
        role="img"
        aria-label={`Predicted performance score ${clamped} out of 100. ${label}.`}
      >
        {TRACE.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-full transition-colors",
              i < lit ? "bg-accent" : "bg-line",
            )}
            style={{ height: `${Math.max(15, h * 100)}%` }}
          />
        ))}
      </div>
      <div className="leading-none">
        <span className={cn("font-mono text-lg font-semibold tabular-nums", tone)}>{clamped}</span>
        {showLabel && <span className="ml-1 font-mono text-[11px] text-muted">/100</span>}
      </div>
    </div>
  );
}

export function scoreBand(score: number) {
  return band(score).label;
}
