import type { VideoFormat } from "@/lib/types/database";
import { reliable } from "@/lib/analytics/dna";
import { FORMAT_LABELS } from "@/lib/labels";
import type { PromptInput } from "./prompt";
import type { Idea } from "./schema";

/**
 * Deterministic generator used when OPENAI_API_KEY is absent.
 *
 * It is not a stand-in for the model — it just recombines the creator's own
 * strongest patterns so the full flow (generate, review, mark posted, feed back)
 * can be exercised without an API key. Scores stay conservative on purpose.
 */
export function fallbackIdeas(input: PromptInput): Idea[] {
  const { dna, profile, top, trends } = input;

  const bestFormat = (reliable(dna.formats)[0]?.key as VideoFormat) ?? "talking_head";
  const secondFormat = (reliable(dna.formats)[1]?.key as VideoFormat) ?? "voiceover_broll";
  const bestDuration = reliable(dna.durations)[0]?.key ?? "30-60";
  const bestTopic = reliable(dna.topics)[0]?.label ?? profile.niche;
  const bestHookStyle = reliable(dna.hookStyles)[0]?.label ?? "Direct address";
  const anchor = top[0];
  const trend = trends[0];

  const duration = durationFromBand(bestDuration);

  return [
    {
      hook: `The ${profile.niche} advice I'd give myself a year ago`,
      concept: `Open on your face, no intro. Name the one thing you got wrong about ${bestTopic}, then give the three-step correction — one cut per step. Close on the result you got after changing it.`,
      suggested_duration_seconds: duration,
      format: bestFormat,
      cta: "Comment the mistake you're still making and I'll answer it",
      caption_idea: `Took me a year to figure this out about ${bestTopic}. Save it so you don't have to.`,
      reasoning: `${FORMAT_LABELS[bestFormat]} is your strongest format and ${bestHookStyle.toLowerCase()} hooks lead your top videos. This keeps both and changes only the topic angle.`,
      predicted_score: 62,
    },
    {
      hook: anchor
        ? `You asked about "${truncate(anchor.topic, 40)}" — here's the full answer`
        : `Nobody explains ${bestTopic} properly, so here it is`,
      concept: anchor
        ? `Follow up your best-performing video directly. Reference it in the first two seconds, then go one level deeper than you did the first time: the part you cut for length.`
        : `Break ${bestTopic} into the three things that actually matter, one shot each, with the answer on screen as text.`,
      suggested_duration_seconds: Math.round(duration * 1.2),
      format: secondFormat,
      cta: "Follow for the second half tomorrow",
      caption_idea: anchor
        ? `Part two, because the comments asked. ${truncate(anchor.title, 60)}`
        : `The version of this I wish someone had shown me.`,
      reasoning: anchor
        ? `"${truncate(anchor.title, 50)}" is your top video at ${anchor.views.toLocaleString()} views. Sequels to a proven video reuse an audience that already opted in.`
        : `You have no clear top performer yet, so this is a baseline test of ${FORMAT_LABELS[secondFormat]} against your average.`,
      predicted_score: anchor ? 58 : 48,
    },
    {
      hook: trend ? trend.suggestedAngle : `Three ${profile.niche} rules I break on purpose`,
      concept: trend
        ? `${trend.topic}, applied to ${bestTopic}. Keep your usual pacing — the trend supplies the structure, not the voice.`
        : `List three conventions in ${profile.niche} you ignore, and show the evidence for each. One cut per rule, text label on screen.`,
      suggested_duration_seconds: Math.max(15, Math.round(duration * 0.7)),
      format: "text_on_screen",
      cta: "Which one do you disagree with?",
      caption_idea: `Not advice, just what's worked for me in ${bestTopic}.`,
      reasoning: trend
        ? `${trend.topic} is at velocity ${trend.velocityScore}/100 with ${trend.competitionLevel} competition and is only ${trend.trendAgeDays} days old — early enough to enter.`
        : `Your ${bestDuration}s band performs best, so this is deliberately shorter to test whether the ceiling is lower than you assume.`,
      predicted_score: 51,
    },
  ];
}

function durationFromBand(band: string): number {
  switch (band) {
    case "0-15":
      return 14;
    case "15-30":
      return 25;
    case "30-60":
      return 45;
    case "60-120":
      return 90;
    case "120+":
      return 150;
    default:
      return 40;
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
