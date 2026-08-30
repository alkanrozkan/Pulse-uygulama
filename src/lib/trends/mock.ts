import type { CompetitionLevel, Platform, VideoFormat } from "@/lib/types/database";

export interface MockTrend {
  topic: string;
  format: VideoFormat;
  velocityScore: number;
  trendAgeDays: number;
  competitionLevel: CompetitionLevel;
  niche: string | null;
  platform: Platform | null;
  angleTemplate: string;
}

/**
 * Mirrors supabase/seed_trends.sql. Used when the `trends` table is empty so the
 * Viral Radar is never a blank screen in development.
 */
export const MOCK_TRENDS: MockTrend[] = [
  {
    topic: "Day-in-the-life speedruns under 20s",
    format: "voiceover_broll",
    velocityScore: 92,
    trendAgeDays: 4,
    competitionLevel: "medium",
    niche: "lifestyle",
    platform: "tiktok",
    angleTemplate: "Compress a full working day in {niche} into 18 seconds, one cut per hour.",
  },
  {
    topic: '"I was wrong about..." reversal openers',
    format: "talking_head",
    velocityScore: 88,
    trendAgeDays: 9,
    competitionLevel: "low",
    niche: null,
    platform: "tiktok",
    angleTemplate: "Name a belief you held about {niche} for years, then show what changed your mind.",
  },
  {
    topic: "Silent screen-record tutorials with text captions",
    format: "screen_recording",
    velocityScore: 85,
    trendAgeDays: 6,
    competitionLevel: "medium",
    niche: "tech",
    platform: "instagram",
    angleTemplate: "Record the exact {niche} workflow you use daily with no voiceover — captions only.",
  },
  {
    topic: "Before/after with the process hidden",
    format: "text_on_screen",
    velocityScore: 81,
    trendAgeDays: 12,
    competitionLevel: "high",
    niche: null,
    platform: "instagram",
    angleTemplate:
      "Show the finished {niche} result first, then rewind through the three steps that got you there.",
  },
  {
    topic: "Price-breakdown receipts",
    format: "talking_head",
    velocityScore: 78,
    trendAgeDays: 3,
    competitionLevel: "low",
    niche: "finance",
    platform: "tiktok",
    angleTemplate: "Break down what one {niche} project actually cost you, line by line.",
  },
  {
    topic: "Reading my own old content and rating it",
    format: "talking_head",
    velocityScore: 74,
    trendAgeDays: 15,
    competitionLevel: "medium",
    niche: null,
    platform: "tiktok",
    angleTemplate: "React to your worst-performing {niche} post and diagnose why it flopped.",
  },
  {
    topic: "60-second myth teardowns",
    format: "voiceover_broll",
    velocityScore: 71,
    trendAgeDays: 8,
    competitionLevel: "high",
    niche: "education",
    platform: "instagram",
    angleTemplate: "Take the most repeated piece of {niche} advice and show the data against it.",
  },
  {
    topic: "POV: the thing nobody warns you about",
    format: "skit",
    velocityScore: 69,
    trendAgeDays: 21,
    competitionLevel: "high",
    niche: null,
    platform: "tiktok",
    angleTemplate: "Act out the unglamorous part of {niche} that only insiders know.",
  },
  {
    topic: "Tool stack tours, one tool per cut",
    format: "screen_recording",
    velocityScore: 66,
    trendAgeDays: 11,
    competitionLevel: "medium",
    niche: "tech",
    platform: "instagram",
    angleTemplate: "Show the five tools you actually open every day for {niche}, five seconds each.",
  },
  {
    topic: "Photo carousels with a text hook on slide one",
    format: "photo_carousel",
    velocityScore: 63,
    trendAgeDays: 18,
    competitionLevel: "low",
    niche: null,
    platform: "instagram",
    angleTemplate: "Turn your best-performing {niche} video script into a seven-slide carousel.",
  },
];
