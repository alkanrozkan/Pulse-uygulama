import type { VideoRow } from "@/lib/types/database";
import type { Bucket, ContentDNA } from "@/lib/types/domain";
import { FORMAT_LABELS, HOOK_STYLE_LABELS, PRESENCE_LABELS, STRUCTURE_LABELS } from "@/lib/labels";
import {
  classifyDuration,
  classifyHook,
  classifyHour,
  classifyPresence,
  classifyStructure,
} from "./classify";

/** A bucket needs at least this many videos before we call it a pattern. */
export const MIN_BUCKET_SIZE = 2;
/** Below this many videos the DNA is shown, but flagged as thin. */
export const MIN_SAMPLE_FOR_CONFIDENCE = 8;

interface Accumulator {
  label: string;
  views: number[];
  engagement: number[];
}

function bucketise(
  videos: VideoRow[],
  keyOf: (v: VideoRow) => { key: string; label: string },
): Bucket[] {
  const map = new Map<string, Accumulator>();

  for (const video of videos) {
    const { key, label } = keyOf(video);
    const entry = map.get(key) ?? { label, views: [], engagement: [] };
    entry.views.push(video.views);
    entry.engagement.push(Number(video.engagement_rate) || 0);
    map.set(key, entry);
  }

  const rows = Array.from(map.entries()).map(([key, entry]) => ({
    key,
    label: entry.label,
    videos: entry.views.length,
    avgViews: mean(entry.views),
    avgEngagement: mean(entry.engagement),
    index: 0,
  }));

  // Index each bucket against the strongest bucket that clears the size floor.
  const eligible = rows.filter((r) => r.videos >= MIN_BUCKET_SIZE);
  const ceiling = Math.max(...(eligible.length ? eligible : rows).map((r) => r.avgViews), 1);

  for (const row of rows) {
    row.index = Math.round(Math.min(100, (row.avgViews / ceiling) * 100));
  }

  return rows.sort((a, b) => b.avgViews - a.avgViews);
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Buckets with enough videos to be worth acting on. */
export function reliable(buckets: Bucket[]): Bucket[] {
  return buckets.filter((b) => b.videos >= MIN_BUCKET_SIZE);
}

function topOf(buckets: Bucket[]): Bucket | null {
  return reliable(buckets)[0] ?? buckets[0] ?? null;
}

export function buildContentDNA(videos: VideoRow[]): ContentDNA {
  const hookStyles = bucketise(videos, (v) => {
    const style = classifyHook(v.hook);
    return { key: style, label: HOOK_STYLE_LABELS[style] };
  });

  const topics = bucketise(videos, (v) => {
    const key = v.topic.trim().toLowerCase();
    return { key, label: v.topic.trim() };
  });

  const durations = bucketise(videos, (v) => {
    const band = classifyDuration(v.duration_seconds);
    return { key: band.key, label: band.label };
  });

  const formats = bucketise(videos, (v) => ({
    key: v.format,
    label: FORMAT_LABELS[v.format],
  }));

  const postingHours = bucketise(videos, (v) => {
    const band = classifyHour(new Date(v.posted_at).getHours());
    return { key: band.key, label: band.label };
  });

  const presence = bucketise(videos, (v) => {
    const p = classifyPresence(v.format);
    return { key: p, label: PRESENCE_LABELS[p] };
  });

  const structures = bucketise(videos, (v) => {
    const s = classifyStructure(v.hook, v.title);
    return { key: s, label: STRUCTURE_LABELS[s] };
  });

  const dna: ContentDNA = {
    sampleSize: videos.length,
    hookStyles,
    topics,
    durations,
    formats,
    postingHours,
    presence,
    structures,
    signals: [],
  };

  dna.signals = buildSignals(dna, videos);
  return dna;
}

/**
 * Plain-language takeaways. These are shown in the UI and passed to the model,
 * so the model reasons over the same summary the creator can see.
 */
function buildSignals(dna: ContentDNA, videos: VideoRow[]): string[] {
  const signals: string[] = [];
  const avg = mean(videos.map((v) => v.views));
  if (!videos.length) return signals;

  const hook = topOf(dna.hookStyles);
  if (hook && hook.videos >= MIN_BUCKET_SIZE) {
    signals.push(
      `${hook.label} hooks average ${Math.round(hook.avgViews).toLocaleString()} views across ${hook.videos} videos${
        avg > 0 ? ` (${lift(hook.avgViews, avg)} vs your account average)` : ""
      }.`,
    );
  }

  const format = topOf(dna.formats);
  if (format && format.videos >= MIN_BUCKET_SIZE) {
    signals.push(`${format.label} is the strongest format, ${lift(format.avgViews, avg)} vs average.`);
  }

  const duration = topOf(dna.durations);
  if (duration && duration.videos >= MIN_BUCKET_SIZE) {
    signals.push(`${duration.label} videos outperform every other length band.`);
  }

  const hour = topOf(dna.postingHours);
  if (hour && hour.videos >= MIN_BUCKET_SIZE) {
    signals.push(`Posts published ${hour.label} do best.`);
  }

  const bestPresence = topOf(dna.presence);
  const worstPresence = reliable(dna.presence).at(-1);
  if (bestPresence && worstPresence && bestPresence.key !== worstPresence.key) {
    signals.push(
      `${bestPresence.label} beats ${worstPresence.label.toLowerCase()} by ${ratio(bestPresence.avgViews, worstPresence.avgViews)}.`,
    );
  }

  const structure = topOf(dna.structures);
  if (structure && structure.videos >= MIN_BUCKET_SIZE) {
    signals.push(`${structure.label} framing carries your best-performing videos.`);
  }

  const topic = topOf(dna.topics);
  if (topic && topic.videos >= MIN_BUCKET_SIZE) {
    signals.push(`"${topic.label}" is the topic your audience returns for.`);
  }

  return signals;
}

function lift(value: number, baseline: number): string {
  if (baseline <= 0) return "—";
  const pct = ((value - baseline) / baseline) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

function ratio(a: number, b: number): string {
  if (b <= 0) return "a wide margin";
  return `${(a / b).toFixed(1)}x`;
}
