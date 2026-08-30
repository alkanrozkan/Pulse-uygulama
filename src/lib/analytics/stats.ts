import type { VideoRow } from "@/lib/types/database";
import type { AccountStats } from "@/lib/types/domain";
import { buildContentDNA, reliable } from "./dna";
import { isoDate } from "@/lib/utils";

const DAY = 86_400_000;

export function computeStats(videos: VideoRow[]): AccountStats {
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalEngagements = videos.reduce(
    (sum, v) => sum + v.likes + v.comments + v.shares + v.saves,
    0,
  );

  const now = Date.now();
  const inWindow = (v: VideoRow, fromDaysAgo: number, toDaysAgo: number) => {
    const t = new Date(v.posted_at).getTime();
    return t > now - fromDaysAgo * DAY && t <= now - toDaysAgo * DAY;
  };

  const last7 = videos.filter((v) => inWindow(v, 7, 0));
  const prev7 = videos.filter((v) => inWindow(v, 14, 7));
  const last7Views = last7.reduce((s, v) => s + v.views, 0);
  const prev7Views = prev7.reduce((s, v) => s + v.views, 0);

  const dna = buildContentDNA(videos);
  const bestFormat = reliable(dna.formats)[0]?.label ?? dna.formats[0]?.label ?? null;
  const bestHookStyle = reliable(dna.hookStyles)[0]?.label ?? dna.hookStyles[0]?.label ?? null;

  return {
    totalVideos: videos.length,
    totalViews,
    avgViews: videos.length ? totalViews / videos.length : 0,
    medianViews: median(videos.map((v) => v.views)),
    engagementRate: totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0,
    bestFormat,
    bestHookStyle,
    last7Views,
    prev7Views,
    growthPct: prev7Views > 0 ? ((last7Views - prev7Views) / prev7Views) * 100 : null,
    dailyViews: dailySeries(videos, 14),
  };
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Views attributed to the day each video was posted, oldest first. */
function dailySeries(videos: VideoRow[], days: number) {
  const buckets = new Map<string, number>();
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY);
    buckets.set(isoDate(d), 0);
  }

  for (const video of videos) {
    const key = isoDate(new Date(video.posted_at));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + video.views);
  }

  return Array.from(buckets.entries()).map(([date, views]) => ({ date, views }));
}

/** The videos the model should learn from most: recent, and top by views. */
export function selectTrainingSet(videos: VideoRow[]) {
  const byDate = [...videos].sort(
    (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime(),
  );
  const byViews = [...videos].sort((a, b) => b.views - a.views);

  return {
    recent: byDate.slice(0, 12),
    top: byViews.slice(0, 8),
    worst: byViews.slice(-4).reverse(),
  };
}
