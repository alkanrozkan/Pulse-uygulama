import type { Trend } from "@/lib/types/domain";
import type { TrendRow } from "@/lib/types/database";
import { MOCK_TRENDS } from "./mock";

/**
 * Everything the Viral Radar needs from a trend source.
 *
 * The MVP reads seeded rows from Supabase and falls back to MOCK_TRENDS. To go
 * live, write a class that satisfies this interface (call the TikTok Creative
 * Center API, an internal scraper, whatever) and swap it into getTrendProvider.
 * Nothing in the UI needs to change.
 */
export interface TrendProvider {
  readonly name: string;
  fetchTrends(params: { niche?: string | null; platform?: string | null; limit?: number }): Promise<Trend[]>;
}

export function rowToTrend(row: TrendRow, niche: string): Trend {
  return {
    id: row.id,
    topic: row.topic,
    format: row.format,
    velocityScore: row.velocity_score,
    trendAgeDays: row.trend_age_days,
    competitionLevel: row.competition_level,
    niche: row.niche,
    platform: row.platform,
    suggestedAngle: personalise(row.angle_template, niche),
  };
}

/** Angle templates carry a {niche} slot so the radar reads as advice, not a feed. */
export function personalise(template: string, niche: string): string {
  return template.replace(/\{niche\}/g, niche || "your niche");
}

class MockTrendProvider implements TrendProvider {
  readonly name = "mock";

  async fetchTrends({
    niche,
    limit = 10,
  }: {
    niche?: string | null;
    platform?: string | null;
    limit?: number;
  }): Promise<Trend[]> {
    const resolvedNiche = niche ?? "your niche";
    return MOCK_TRENDS.map((t, i) => ({
      ...t,
      id: `mock-${i}`,
      suggestedAngle: personalise(t.angleTemplate, resolvedNiche),
    }))
      .sort((a, b) => b.velocityScore - a.velocityScore)
      .slice(0, limit);
  }
}

export function getTrendProvider(): TrendProvider {
  // Swap this for a live provider when a real trends API is connected.
  return new MockTrendProvider();
}
