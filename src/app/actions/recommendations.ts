"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const feedbackSchema = z.object({
  recommendation_id: z.string().uuid(),
  outcome: z.enum(["posted", "skipped", "successful", "underperformed"]),
  note: z.string().trim().max(500).optional().nullable(),
  actual_views: z.coerce.number().int().min(0).optional().nullable(),
});

export interface FeedbackState {
  error: string | null;
  success?: boolean;
}

/**
 * Records how a recommendation landed. `posted` and `skipped` also move the
 * recommendation's status; `successful` and `underperformed` are outcome-only
 * and are what the next generation reads to recalibrate its scoring.
 */
export async function recordFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const raw = Object.fromEntries(formData);
  const parsed = feedbackSchema.safeParse({
    ...raw,
    note: raw.note ? String(raw.note) : null,
    actual_views: raw.actual_views ? raw.actual_views : null,
  });

  if (!parsed.success) return { error: "That feedback couldn't be saved." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in again." };

  const { recommendation_id, outcome, note, actual_views } = parsed.data;

  const { error } = await supabase.from("recommendation_feedback").upsert(
    {
      recommendation_id,
      user_id: user.id,
      outcome,
      note: note ?? null,
      actual_views: actual_views ?? null,
    },
    { onConflict: "recommendation_id,outcome" },
  );

  if (error) return { error: error.message };

  if (outcome === "posted" || outcome === "skipped") {
    await supabase
      .from("recommendations")
      .update({ status: outcome })
      .eq("id", recommendation_id)
      .eq("user_id", user.id);
  }

  revalidatePath("/today");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
