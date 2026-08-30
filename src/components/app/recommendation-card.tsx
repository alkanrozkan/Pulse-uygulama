"use client";

import * as React from "react";
import { Clock, Megaphone, Video } from "lucide-react";
import { recordFeedback } from "@/app/actions/recommendations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/field";
import { ScoreMeter, scoreBand } from "@/components/ui/score-meter";
import { FORMAT_LABELS } from "@/lib/labels";
import type { RecommendationWithFeedback } from "@/lib/types/domain";
import { cn, seconds } from "@/lib/utils";

type Outcome = "posted" | "skipped" | "successful" | "underperformed";

export function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: RecommendationWithFeedback;
  index: number;
}) {
  const initial = new Set(recommendation.recommendation_feedback?.map((f) => f.outcome) ?? []);
  const [outcomes, setOutcomes] = React.useState<Set<string>>(initial);
  const [pending, setPending] = React.useState<Outcome | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [actualViews, setActualViews] = React.useState("");

  const posted = outcomes.has("posted");
  const skipped = outcomes.has("skipped");
  const rated = outcomes.has("successful") || outcomes.has("underperformed");

  async function submit(outcome: Outcome) {
    setPending(outcome);
    setError(null);

    const formData = new FormData();
    formData.set("recommendation_id", recommendation.id);
    formData.set("outcome", outcome);
    if ((outcome === "successful" || outcome === "underperformed") && actualViews) {
      formData.set("actual_views", actualViews);
    }

    const result = await recordFeedback({ error: null }, formData);
    setPending(null);

    if (result.error) {
      setError(result.error);
      return;
    }
    setOutcomes((prev) => new Set(prev).add(outcome));
  }

  return (
    <article
      className={cn(
        "card animate-fade-up overflow-hidden",
        skipped && "opacity-60",
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="eyebrow">Idea {index + 1}</span>
            <Badge tone="outline">{FORMAT_LABELS[recommendation.format]}</Badge>
            {posted && <Badge tone="pos">Posted</Badge>}
            {skipped && <Badge tone="neutral">Skipped</Badge>}
          </div>

          {/* The hook is the product. It gets the largest type on the page. */}
          <h3 className="font-display text-xl leading-snug sm:text-[22px]">
            &ldquo;{recommendation.hook}&rdquo;
          </h3>
        </div>

        <div className="shrink-0 sm:text-right">
          <ScoreMeter score={recommendation.predicted_score} />
          <p className="mt-1.5 text-xs text-muted sm:text-right">
            {scoreBand(recommendation.predicted_score)}
          </p>
        </div>
      </div>

      <div className="hairline" />

      <div className="space-y-5 p-5">
        <section>
          <p className="eyebrow mb-2">The video</p>
          <p className="text-sm leading-relaxed text-ink/90">{recommendation.concept}</p>
        </section>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Meta icon={<Clock className="h-3.5 w-3.5" />} label="Length">
            {seconds(recommendation.suggested_duration_seconds)}
          </Meta>
          <Meta icon={<Video className="h-3.5 w-3.5" />} label="Format">
            {FORMAT_LABELS[recommendation.format]}
          </Meta>
          <Meta icon={<Megaphone className="h-3.5 w-3.5" />} label="Call to action">
            {recommendation.cta}
          </Meta>
        </dl>

        <section className="rounded-soft bg-raised p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="eyebrow">Caption</p>
            <CopyButton value={recommendation.caption_idea} label="Copy caption" />
          </div>
          <p className="text-sm leading-relaxed">{recommendation.caption_idea}</p>
        </section>

        <section className="border-l-2 border-accent/50 pl-4">
          <p className="eyebrow mb-1.5">Why this, for you</p>
          <p className="text-sm leading-relaxed text-muted">{recommendation.reasoning}</p>
        </section>
      </div>

      <footer className="border-t border-line bg-raised/40 p-4">
        {error && <p className="mb-3 text-sm text-neg">{error}</p>}

        {!posted && !skipped && (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" loading={pending === "posted"} onClick={() => submit("posted")}>
              I posted this
            </Button>
            <Button
              size="sm"
              variant="ghost"
              loading={pending === "skipped"}
              onClick={() => submit("skipped")}
            >
              Skip
            </Button>
            <p className="ml-auto text-xs text-muted">Your answer shapes tomorrow&rsquo;s ideas.</p>
          </div>
        )}

        {posted && !rated && (
          <div className="space-y-3">
            <p className="text-sm font-medium">How did it do against your average?</p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={actualViews}
                onChange={(e) => setActualViews(e.target.value)}
                placeholder="Views so far (optional)"
                className="h-9 w-full max-w-[200px] text-sm"
                aria-label="Views so far"
              />
              <Button
                size="sm"
                loading={pending === "successful"}
                onClick={() => submit("successful")}
              >
                Beat my average
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={pending === "underperformed"}
                onClick={() => submit("underperformed")}
              >
                Underperformed
              </Button>
            </div>
          </div>
        )}

        {rated && (
          <p className="text-sm text-muted">
            Logged as{" "}
            <span className={outcomes.has("successful") ? "text-pos" : "text-neg"}>
              {outcomes.has("successful") ? "above average" : "below average"}
            </span>
            . Pulse will weight this pattern accordingly.
          </p>
        )}

        {skipped && <p className="text-sm text-muted">Skipped. Pulse will propose fewer like this.</p>}
      </footer>
    </article>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="eyebrow mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
