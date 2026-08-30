/**
 * Hand-maintained mirror of supabase/schema.sql.
 * Regenerate with:  supabase gen types typescript --project-id <id> > src/lib/types/database.ts
 */

export type Platform = "tiktok" | "instagram";
export type MainPlatform = "tiktok" | "instagram" | "both";
export type PlanTier = "free" | "creator_pro" | "agency";
export type RecommendationStatus = "new" | "posted" | "skipped";
export type FeedbackOutcome = "posted" | "skipped" | "successful" | "underperformed";
export type CompetitionLevel = "low" | "medium" | "high";

export type VideoFormat =
  | "talking_head"
  | "voiceover_broll"
  | "screen_recording"
  | "text_on_screen"
  | "skit"
  | "tutorial"
  | "vlog"
  | "interview"
  | "photo_carousel";

export interface UserRow {
  id: string;
  email: string;
  created_at: string;
}

export interface CreatorProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  niche: string;
  main_platform: MainPlatform;
  instagram_username: string | null;
  tiktok_username: string | null;
  audience_country: string | null;
  content_language: string;
  plan: PlanTier;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoRow {
  id: string;
  user_id: string;
  platform: Platform;
  title: string;
  hook: string;
  topic: string;
  format: VideoFormat;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  duration_seconds: number;
  posted_at: string;
  created_at: string;
  engagement_rate: number;
}

export interface RecommendationRow {
  id: string;
  user_id: string;
  hook: string;
  concept: string;
  suggested_duration_seconds: number;
  format: VideoFormat;
  cta: string;
  caption_idea: string;
  reasoning: string;
  predicted_score: number;
  status: RecommendationStatus;
  generated_for: string;
  model: string | null;
  created_at: string;
}

export interface RecommendationFeedbackRow {
  id: string;
  recommendation_id: string;
  user_id: string;
  outcome: FeedbackOutcome;
  note: string | null;
  actual_views: number | null;
  created_at: string;
}

export interface TrendRow {
  id: string;
  topic: string;
  format: VideoFormat;
  velocity_score: number;
  trend_age_days: number;
  competition_level: CompetitionLevel;
  niche: string | null;
  platform: Platform | null;
  angle_template: string;
  source: string;
  captured_at: string;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: Table<UserRow>;
      creator_profiles: Table<CreatorProfileRow>;
      videos: Table<VideoRow, Omit<VideoRow, "id" | "created_at" | "engagement_rate">>;
      recommendations: Table<RecommendationRow, Omit<RecommendationRow, "id" | "created_at">>;
      recommendation_feedback: Table<
        RecommendationFeedbackRow,
        Omit<RecommendationFeedbackRow, "id" | "created_at">
      >;
      trends: Table<TrendRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      platform: Platform;
      main_platform: MainPlatform;
      video_format: VideoFormat;
      plan_tier: PlanTier;
      recommendation_status: RecommendationStatus;
      feedback_outcome: FeedbackOutcome;
      competition_level: CompetitionLevel;
    };
    CompositeTypes: Record<string, never>;
  };
}
