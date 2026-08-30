import type { CompetitionLevel, MainPlatform, PlanTier, VideoFormat } from "@/lib/types/database";
import type { HookStyle, Presence, Structure } from "@/lib/types/domain";

export const FORMAT_LABELS: Record<VideoFormat, string> = {
  talking_head: "Talking head",
  voiceover_broll: "Voiceover + b-roll",
  screen_recording: "Screen recording",
  text_on_screen: "Text on screen",
  skit: "Skit",
  tutorial: "Tutorial",
  vlog: "Vlog",
  interview: "Interview",
  photo_carousel: "Photo carousel",
};

export const FORMAT_OPTIONS = Object.entries(FORMAT_LABELS).map(([value, label]) => ({
  value: value as VideoFormat,
  label,
}));

export const HOOK_STYLE_LABELS: Record<HookStyle, string> = {
  question: "Question",
  bold_claim: "Bold claim",
  warning: "Warning",
  listicle: "Numbered list",
  pov: "POV",
  story: "Story opener",
  curiosity_gap: "Curiosity gap",
  direct_address: "Direct address",
  result_first: "Result first",
};

export const STRUCTURE_LABELS: Record<Structure, string> = {
  storytelling: "Storytelling",
  listicle: "Listicle",
  pov: "POV",
  explainer: "Explainer",
};

export const PRESENCE_LABELS: Record<Presence, string> = {
  face: "On camera",
  screen: "Screen recording",
  mixed: "Mixed / b-roll",
};

export const PLATFORM_LABELS: Record<MainPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  both: "Both",
};

export const COMPETITION_LABELS: Record<CompetitionLevel, string> = {
  low: "Low competition",
  medium: "Medium competition",
  high: "Crowded",
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  creator_pro: "Creator Pro",
  agency: "Agency",
};
