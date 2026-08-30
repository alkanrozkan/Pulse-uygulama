import { Badge } from "@/components/ui/badge";
import { ScoreMeter } from "@/components/ui/score-meter";

/**
 * A real recommendation, rendered with the product's own components rather than
 * a screenshot. It stays sharp at every size and can never drift from the app.
 */
export function TodayPreview() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <span className="eyebrow">Today · idea 1 of 3</span>
        <Badge tone="outline">Talking head</Badge>
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="font-display text-lg leading-snug sm:text-xl">
          &ldquo;I stopped doing the thing every barista told me to do&rdquo;
        </h3>
        <div className="shrink-0">
          <ScoreMeter score={83} />
        </div>
      </div>

      <div className="hairline" />

      <div className="space-y-4 p-5">
        <div>
          <p className="eyebrow mb-1.5">The video</p>
          <p className="text-sm leading-relaxed text-ink/90">
            Open mid-pour, no intro. Name the technique, show the side-by-side result, then the
            30-second correction. End on the cup.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Meta label="Length" value="34s" />
          <Meta label="Format" value="Talking head" />
          <Meta label="CTA" value="Comment your ratio" />
        </div>

        <div className="border-l-2 border-accent/50 pl-4">
          <p className="eyebrow mb-1.5">Why this, for you</p>
          <p className="text-sm leading-relaxed text-muted">
            Your contrarian hooks average 41k views against an account average of 12k, and your
            30–60s band outperforms everything shorter.
          </p>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
