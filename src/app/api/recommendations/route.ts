import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildContentDNA } from "@/lib/analytics/dna";
import { computeStats, selectTrainingSet } from "@/lib/analytics/stats";
import { generateIdeas } from "@/lib/ai/openai";
import type { FeedbackSummary } from "@/lib/ai/prompt";
import { getProfile, getQuota, getTrends, getVideos } from "@/lib/data";
import { FORMAT_LABELS } from "@/lib/labels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/recommendations
 *
 * Assembles the creator profile, recent videos, top performers, Content DNA and
 * past recommendation feedback, sends them to the model, validates the JSON that
 * comes back, and persists the result.
 *
 * The OpenAI key is read from the server environment only — it never reaches the
 * browser and is never returned in a response.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to generate recommendations." }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Finish setting up your creator profile first." },
      { status: 409 },
    );
  }

  const quota = await getQuota(user.id, profile.plan);
  if (quota.exhausted) {
    return NextResponse.json(
      {
        error: `You've used all ${quota.limit} recommendations on the Free plan this month.`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 402 },
    );
  }

  try {
    const videos = await getVideos(user.id);
    const dna = buildContentDNA(videos);
    const stats = computeStats(videos);
    const { recent, top, worst } = selectTrainingSet(videos);
    const trends = await getTrends(profile.niche, profile.main_platform);

    // Past recommendations plus their outcomes: this is the feedback loop.
    const { data: pastFeedback } = await supabase
      .from("recommendation_feedback")
      .select("outcome, recommendations!inner(hook, format, predicted_score)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);

    const feedback: FeedbackSummary[] = (pastFeedback ?? []).flatMap((row) => {
      const rec = row.recommendations as unknown as
        | { hook: string; format: keyof typeof FORMAT_LABELS; predicted_score: number }
        | null;
      if (!rec) return [];
      return [
        {
          hook: rec.hook,
          format: FORMAT_LABELS[rec.format] ?? rec.format,
          predicted_score: rec.predicted_score,
          outcome: row.outcome as string,
        },
      ];
    });

    const { ideas, model, usedFallback } = await generateIdeas({
      profile,
      dna,
      recent,
      top,
      worst,
      feedback,
      trends,
      avgViews: stats.avgViews,
    });

    const today = new Date().toISOString().slice(0, 10);

    const { data: inserted, error } = await supabase
      .from("recommendations")
      .insert(
        ideas.map((idea) => ({
          user_id: user.id,
          hook: idea.hook,
          concept: idea.concept,
          suggested_duration_seconds: idea.suggested_duration_seconds,
          format: idea.format,
          cta: idea.cta,
          caption_idea: idea.caption_idea,
          reasoning: idea.reasoning,
          predicted_score: idea.predicted_score,
          status: "new" as const,
          generated_for: today,
          model,
        })),
      )
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      recommendations: inserted,
      usedFallback,
      sampleSize: dna.sampleSize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    console.error("[recommendations]", message);
    return NextResponse.json(
      { error: "Pulse couldn't generate ideas just now. Try again in a moment." },
      { status: 500 },
    );
  }
}
