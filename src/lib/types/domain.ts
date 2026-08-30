import type {
  CompetitionLevel,
  Platform,
  RecommendationRow,
  VideoFormat,
  VideoRow,
} from "./database";

/** Hook styles are inferred from the hook text, not entered by the creator. */
export type HookStyle =
  | "question"
  | "bold_claim"
  | "warning"
  | "listicle"
  | "pov"
  | "story"
  | "curiosity_gap"
  | "direct_address"
  | "result_first";

/** Narrative shape, inferred the same way. */
export type Structure = "storytelling" | "listicle" | "pov" | "explainer";

/** Whether the creator is on camera. Derived from format. */
export type Presence = "face" | "screen" | "mixed";

export interface Bucket {
  key: string;
  label: string;
  videos: number;
  avgViews: number;
  avgEngagement: number;
  /** 0–100, relative to the creator's own best bucket. */
  index: number;
}

export interface ContentDNA {
  sampleSize: number;
  hookStyles: Bucket[];
  topics: Bucket[];
  durations: Bucket[];
  formats: Bucket[];
  postingHours: Bucket[];
  presence: Bucket[];
  structures: Bucket[];
  /** Short, human-readable takeaways used in the UI and in the AI prompt. */
  signals: string[];
}

export interface AccountStats {
  totalVideos: number;
  totalViews: number;
  avgViews: number;
  medianViews: number;
  engagementRate: number;
  bestFormat: string | null;
  bestHookStyle: string | null;
  last7Views: number;
  prev7Views: number;
  growthPct: number | null;
  /** Views per day for the last 14 days, oldest first — feeds the sparkline. */
  dailyViews: { date: string; views: number }[];
}

export interface Trend {
  id: string;
  topic: string;
  format: VideoFormat;
  velocityScore: number;
  trendAgeDays: number;
  competitionLevel: CompetitionLevel;
  niche: string | null;
  platform: Platform | null;
  suggestedAngle: string;
}

export type RecommendationWithFeedback = RecommendationRow & {
  recommendation_feedback: { outcome: string; created_at: string }[];
};

export type { VideoRow, RecommendationRow };
