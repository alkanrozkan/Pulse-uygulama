import type { ReactNode } from "react";
import { cn, signedPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  delta,
  children,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  delta?: number | null;
  children?: ReactNode;
  className?: string;
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);

  return (
    <div className={cn("card p-5", className)}>
      <p className="eyebrow">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-[28px] font-semibold leading-none tabular-nums">{value}</span>
        {hasDelta && (
          <span
            className={cn(
              "font-mono text-xs font-medium tabular-nums",
              delta! >= 0 ? "text-pos" : "text-neg",
            )}
          >
            {signedPercent(delta!, 0)}
          </span>
        )}
      </div>
      {sub && <p className="mt-2 text-xs text-muted">{sub}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
