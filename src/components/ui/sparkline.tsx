import { cn } from "@/lib/utils";

/** 14-day view trace. Inline SVG so it inherits theme colours and adds no deps. */
export function Sparkline({
  values,
  className,
  height = 40,
}: {
  values: number[];
  className?: string;
  height?: number;
}) {
  if (values.length < 2) {
    return <div className={cn("h-10 rounded bg-raised", className)} aria-hidden />;
  }

  const width = 240;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);

  const points = values.map((v, i) => [i * step, height - (v / max) * (height - 4) - 2] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label="Views over the last 14 days"
    >
      <path d={area} className="fill-accent/10" />
      <path
        d={line}
        fill="none"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
