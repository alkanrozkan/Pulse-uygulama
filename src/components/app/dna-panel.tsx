import { Badge } from "@/components/ui/badge";
import { MIN_BUCKET_SIZE } from "@/lib/analytics/dna";
import type { Bucket } from "@/lib/types/domain";
import { cn, compactNumber } from "@/lib/utils";

/**
 * One dimension of the Content DNA. Rows are indexed against the creator's own
 * best bucket, so the bar answers "compared with the rest of my account".
 */
export function DnaPanel({
  title,
  description,
  buckets,
  emptyLabel = "Not enough videos yet",
}: {
  title: string;
  description: string;
  buckets: Bucket[];
  emptyLabel?: string;
}) {
  const rows = buckets.slice(0, 6);

  return (
    <section className="card p-5">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      <p className="mb-5 text-xs text-muted">{description}</p>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3.5">
          {rows.map((bucket) => {
            const thin = bucket.videos < MIN_BUCKET_SIZE;
            return (
              <li key={bucket.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className={cn("truncate text-sm", thin && "text-muted")}>
                    {bucket.label}
                    {thin && <span className="ml-2 font-mono text-[10px] text-muted">n=1</span>}
                  </span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                    {compactNumber(bucket.avgViews)} avg
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
                  <div
                    className={cn("h-full rounded-full", thin ? "bg-muted/40" : "bg-accent")}
                    style={{ width: `${Math.max(3, bucket.index)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function SignalList({ signals }: { signals: string[] }) {
  if (!signals.length) return null;

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">What the data says</h2>
        <Badge tone="accent">{signals.length} signals</Badge>
      </div>
      <ul className="space-y-3">
        {signals.map((signal, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {signal}
          </li>
        ))}
      </ul>
    </section>
  );
}
