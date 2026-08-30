"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { RecommendationCard } from "./recommendation-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { ErrorNote, Skeleton } from "@/components/ui/states";
import type { RecommendationWithFeedback } from "@/lib/types/domain";
import type { Quota } from "@/lib/data";

export function TodayBoard({
  initial,
  quota,
  videoCount,
}: {
  initial: RecommendationWithFeedback[];
  quota: Quota;
  videoCount: number;
}) {
  const router = useRouter();
  const [recommendations, setRecommendations] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const hasIdeas = recommendations.length > 0;

  async function generate() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/recommendations", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Pulse couldn't generate ideas just now.");
        return;
      }

      setRecommendations(payload.recommendations ?? []);
      if (payload.usedFallback) {
        setNotice(
          "Generated with the built-in rules engine — add OPENAI_API_KEY to switch on the model.",
        );
      }
      router.refresh();
    } catch {
      setError("Couldn't reach Pulse. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const quotaExhausted = quota.exhausted;

  return (
    <div className="space-y-6">
      {notice && (
        <p className="rounded-soft border border-line bg-raised px-4 py-3 text-sm text-muted">
          {notice}
        </p>
      )}
      {error && <ErrorNote message={error} onRetry={generate} />}

      {loading && <LoadingIdeas />}

      {!loading && !hasIdeas && (
        <div className="card px-6 py-14 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl font-semibold">Nothing generated for today yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {videoCount === 0
              ? "Pulse works from your own performance data. Log a few videos first and the ideas will be grounded in what already works for you."
              : quotaExhausted
                ? `You've used all ${quota.limit} recommendations on the Free plan this month. Creator Pro generates a fresh set every day.`
                : `Pulse will read your ${videoCount} logged ${videoCount === 1 ? "video" : "videos"} and propose three things to make.`}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {videoCount === 0 ? (
              <Link href="/videos" className={buttonClasses({ size: "lg" })}>
                Log your first video
              </Link>
            ) : quotaExhausted ? (
              <Link href="/billing" className={buttonClasses({ size: "lg" })}>
                See Creator Pro
              </Link>
            ) : (
              <Button size="lg" onClick={generate} loading={loading}>
                Generate today&rsquo;s ideas
              </Button>
            )}
          </div>
        </div>
      )}

      {!loading && hasIdeas && (
        <>
          <div className="space-y-5">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.id} recommendation={rec} index={i} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-dashed border-line px-5 py-4">
            <p className="text-sm text-muted">
              {quotaExhausted
                ? "No generations left this month on the Free plan."
                : "Want a different angle? Generating again replaces today's set."}
            </p>
            {quotaExhausted ? (
              <Link href="/billing" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                Upgrade
              </Link>
            ) : (
              <Button variant="secondary" size="sm" onClick={generate} loading={loading}>
                Generate again
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LoadingIdeas() {
  return (
    <div className="space-y-5" aria-live="polite" aria-busy="true">
      <p className="text-sm text-muted">Reading your last videos and scoring the patterns…</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-4/5" />
            </div>
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
