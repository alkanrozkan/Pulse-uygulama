import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildContentDNA } from "@/lib/analytics/dna";
import { computeStats } from "@/lib/analytics/stats";
import { getTrendProvider, rowToTrend } from "@/lib/trends/provider";
import { getPlan } from "@/lib/plans";
import type {
  CreatorProfileRow,
  RecommendationRow,
  TrendRow,
  VideoRow,
} from "@/lib/types/database";
import type { RecommendationWithFeedback, Trend } from "@/lib/types/domain";

export async function getProfile(userId: string): Promise<CreatorProfileRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function getVideos(userId: string): Promise<VideoRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", userId)
    .order("posted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecommendations(
  userId: string,
  limit = 30,
): Promise<RecommendationWithFeedback[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recommendations")
    .select("*, recommendation_feedback(outcome, created_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RecommendationWithFeedback[];
}

/** Recommendations generated today, which is what the Today page shows. */
export async function getTodayRecommendations(
  userId: string,
): Promise<RecommendationWithFeedback[]> {
  const all = await getRecommendations(userId, 30);
  const today = new Date().toISOString().slice(0, 10);
  return all.filter((r) => r.generated_for === today);
}

export async function getTrends(niche: string, platform?: string | null): Promise<Trend[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("trends")
    .select("*")
    .order("velocity_score", { ascending: false })
    .limit(12);

  const rows = (data ?? []) as TrendRow[];
  if (rows.length) return rows.map((row) => rowToTrend(row, niche));

  // Table not seeded yet — fall back to the bundled mock set.
  return getTrendProvider().fetchTrends({ niche, platform, limit: 12 });
}

export interface Quota {
  used: number;
  limit: number | null;
  remaining: number | null;
  exhausted: boolean;
}

/** How many generations the user has left this calendar month. */
export async function getQuota(userId: string, plan: CreatorProfileRow["plan"]): Promise<Quota> {
  const limit = getPlan(plan).monthlyRecommendations;
  if (limit === null) return { used: 0, limit: null, remaining: null, exhausted: false };

  const supabase = createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("recommendations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart.toISOString());

  const used = count ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used), exhausted: used >= limit };
}

/** Everything the dashboard needs, in one round of queries. */
export async function getDashboardData(userId: string) {
  const videos = await getVideos(userId);
  return { videos, stats: computeStats(videos), dna: buildContentDNA(videos) };
}

export type { RecommendationRow };
