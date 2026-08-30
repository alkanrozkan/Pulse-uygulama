import type { VideoFormat } from "@/lib/types/database";
import type { HookStyle, Presence, Structure } from "@/lib/types/domain";

/**
 * Creators type a hook in their own words — they should not have to also pick a
 * taxonomy from a dropdown. These classifiers read the hook and title and infer
 * the shape, so Content DNA works from the data already collected.
 *
 * Order matters: the first matching rule wins, most specific first.
 */

const HOOK_RULES: { style: HookStyle; test: RegExp }[] = [
  { style: "pov", test: /\b(pov|point of view|imagine you)\b/i },
  { style: "listicle", test: /(^|\s)(\d+|three|four|five|seven|ten)\s+(ways?|things?|reasons?|steps?|mistakes?|tips?|rules?|signs?)/i },
  { style: "warning", test: /\b(stop|don'?t|never|avoid|warning|mistake|before you|you'?re losing|red flag)\b/i },
  { style: "result_first", test: /\b(i (made|grew|hit|got|went from)|from \d|\d+[km]?\s*(views|followers|subs|\$))/i },
  { style: "question", test: /\?\s*$|^(why|how|what|when|which|who|do you|did you|are you|ever wonder)\b/i },
  { style: "bold_claim", test: /\b(nobody|everyone|no one|the only|the best|the real reason|actually|truth about|is dead|changed everything)\b/i },
  { style: "story", test: /\b(last (week|year|night|month)|when i|the day i|two years ago|i used to|so i)\b/i },
  { style: "curiosity_gap", test: /\b(here'?s (why|what|how)|this is (why|what|how)|watch (this|until)|wait for it|nobody tells you)\b/i },
  { style: "direct_address", test: /\b(if you'?re|you need|you should|for anyone|listen)\b/i },
];

export function classifyHook(hook: string): HookStyle {
  const text = hook.trim();
  for (const rule of HOOK_RULES) {
    if (rule.test.test(text)) return rule.style;
  }
  return "direct_address";
}

const STRUCTURE_RULES: { structure: Structure; test: RegExp }[] = [
  { structure: "pov", test: /\b(pov|point of view)\b/i },
  { structure: "listicle", test: /(^|\s)(\d+|three|four|five|seven|ten)\s+(ways?|things?|reasons?|steps?|mistakes?|tips?|rules?|signs?|tools?)/i },
  { structure: "storytelling", test: /\b(story|when i|the day i|last (week|year|night)|i used to|how i (went|got|built|lost))\b/i },
];

export function classifyStructure(hook: string, title: string): Structure {
  const text = `${hook} ${title}`;
  for (const rule of STRUCTURE_RULES) {
    if (rule.test.test(text)) return rule.structure;
  }
  return "explainer";
}

const PRESENCE_BY_FORMAT: Record<VideoFormat, Presence> = {
  talking_head: "face",
  skit: "face",
  vlog: "face",
  interview: "face",
  tutorial: "face",
  screen_recording: "screen",
  text_on_screen: "screen",
  voiceover_broll: "mixed",
  photo_carousel: "mixed",
};

export function classifyPresence(format: VideoFormat): Presence {
  return PRESENCE_BY_FORMAT[format] ?? "mixed";
}

export const DURATION_BANDS = [
  { key: "0-15", label: "Under 15s", min: 0, max: 15 },
  { key: "15-30", label: "15–30s", min: 15, max: 30 },
  { key: "30-60", label: "30–60s", min: 30, max: 60 },
  { key: "60-120", label: "1–2 min", min: 60, max: 120 },
  { key: "120+", label: "Over 2 min", min: 120, max: Number.POSITIVE_INFINITY },
] as const;

export function classifyDuration(durationSeconds: number): (typeof DURATION_BANDS)[number] {
  return (
    DURATION_BANDS.find((b) => durationSeconds >= b.min && durationSeconds < b.max) ??
    DURATION_BANDS[DURATION_BANDS.length - 1]
  );
}

export const HOUR_BANDS = [
  { key: "early", label: "5–9am", min: 5, max: 9 },
  { key: "morning", label: "9am–12pm", min: 9, max: 12 },
  { key: "afternoon", label: "12–5pm", min: 12, max: 17 },
  { key: "evening", label: "5–9pm", min: 17, max: 21 },
  { key: "night", label: "9pm–1am", min: 21, max: 25 },
  { key: "late", label: "1–5am", min: 1, max: 5 },
] as const;

export function classifyHour(hour: number): (typeof HOUR_BANDS)[number] {
  const normalised = hour === 0 ? 24 : hour;
  return HOUR_BANDS.find((b) => normalised >= b.min && normalised < b.max) ?? HOUR_BANDS[4];
}
