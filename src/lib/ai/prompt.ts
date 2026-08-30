import type { CreatorProfileRow, VideoRow } from "@/lib/types/database";
import type { ContentDNA, Trend } from "@/lib/types/domain";
import { FORMAT_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import { reliable } from "@/lib/analytics/dna";

export interface FeedbackSummary {
  hook: string;
  format: string;
  predicted_score: number;
  outcome: string;
}

export interface PromptInput {
  profile: CreatorProfileRow;
  dna: ContentDNA;
  recent: VideoRow[];
  top: VideoRow[];
  worst: VideoRow[];
  feedback: FeedbackSummary[];
  trends: Trend[];
  avgViews: number;
}

export const SYSTEM_PROMPT = `You are Pulse, a content strategist who has read every video a specific creator has published and nothing else.

Your job: propose exactly 3 videos this creator should make next.

Rules:
- Every idea must be traceable to a number in the data you were given. If you cannot point to evidence, do not propose it.
- The "reasoning" field must cite the creator's own numbers (a format, hook style, duration band, or a specific past video). Never write generic advice like "short videos perform well" — say why it is true for THIS account.
- Vary the 3 ideas: do not propose three versions of the same video. At most two may share a format.
- The hook is the literal first line, written as the creator would say it. Not a description of a hook.
- The concept is a shot-by-shot outline the creator could film today without further thinking.
- predicted_score is 0-100 and expresses your confidence that this beats the creator's average views. Calibrate it: 50 means "about average". Reserve 85+ for ideas that repeat a pattern with a strong, well-evidenced track record. If the sample size is small, keep scores in the 40-70 band and say so in the reasoning.
- Write in the creator's content language and for their audience country.
- Never invent metrics the creator did not report.

Return JSON only, matching the provided schema.`;

export function buildUserPrompt(input: PromptInput): string {
  const { profile, dna, recent, top, worst, feedback, trends, avgViews } = input;

  const lines: string[] = [];

  lines.push("## Creator");
  lines.push(`Name: ${profile.display_name}`);
  lines.push(`Niche: ${profile.niche}`);
  lines.push(`Main platform: ${PLATFORM_LABELS[profile.main_platform]}`);
  lines.push(`Audience country: ${profile.audience_country ?? "not specified"}`);
  lines.push(`Content language: ${profile.content_language}`);
  lines.push(`Account average views: ${Math.round(avgViews).toLocaleString()}`);
  lines.push(`Videos analysed: ${dna.sampleSize}`);
  lines.push("");

  lines.push("## Content DNA");
  if (dna.sampleSize === 0) {
    lines.push("No history yet. Propose starter ideas for the niche and keep predicted scores near 50.");
  } else {
    if (dna.signals.length) {
      lines.push("Signals:");
      for (const signal of dna.signals) lines.push(`- ${signal}`);
    }
    lines.push(bucketTable("Hook styles", dna.hookStyles));
    lines.push(bucketTable("Formats", dna.formats));
    lines.push(bucketTable("Durations", dna.durations));
    lines.push(bucketTable("Topics", dna.topics));
    lines.push(bucketTable("Posting windows", dna.postingHours));
    lines.push(bucketTable("On camera vs screen", dna.presence));
    lines.push(bucketTable("Narrative structure", dna.structures));
  }
  lines.push("");

  if (top.length) {
    lines.push("## Top performing videos");
    for (const v of top) lines.push(videoLine(v));
    lines.push("");
  }

  if (recent.length) {
    lines.push("## Most recent videos");
    for (const v of recent) lines.push(videoLine(v));
    lines.push("");
  }

  if (worst.length) {
    lines.push("## Weakest videos (avoid repeating these patterns)");
    for (const v of worst) lines.push(videoLine(v));
    lines.push("");
  }

  if (feedback.length) {
    lines.push("## How past Pulse recommendations landed");
    lines.push("Use this to correct your own calibration.");
    for (const f of feedback) {
      lines.push(
        `- [${f.outcome}] predicted ${f.predicted_score} | ${f.format} | hook: "${truncate(f.hook, 90)}"`,
      );
    }
    lines.push("");
  }

  if (trends.length) {
    lines.push("## Trends currently moving (optional inspiration)");
    lines.push("Only use a trend if it fits a pattern that already works for this creator.");
    for (const t of trends.slice(0, 5)) {
      lines.push(
        `- ${t.topic} | ${FORMAT_LABELS[t.format]} | velocity ${t.velocityScore}/100 | ${t.trendAgeDays}d old | ${t.competitionLevel} competition`,
      );
    }
    lines.push("");
  }

  lines.push("Propose the 3 videos now.");
  return lines.join("\n");
}

function bucketTable(title: string, buckets: ReturnType<typeof reliable>): string {
  const rows = buckets.slice(0, 6);
  if (!rows.length) return "";
  const body = rows
    .map(
      (b) =>
        `  ${b.label}: ${Math.round(b.avgViews).toLocaleString()} avg views, ${b.avgEngagement.toFixed(1)}% engagement, n=${b.videos}`,
    )
    .join("\n");
  return `${title}:\n${body}`;
}

function videoLine(v: VideoRow): string {
  return `- "${truncate(v.title, 70)}" | hook: "${truncate(v.hook, 90)}" | ${FORMAT_LABELS[v.format]} | ${v.duration_seconds}s | ${v.views.toLocaleString()} views | ${Number(v.engagement_rate).toFixed(1)}% eng | ${v.posted_at.slice(0, 10)}`;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
