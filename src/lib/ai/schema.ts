import { z } from "zod";

const FORMATS = [
  "talking_head",
  "voiceover_broll",
  "screen_recording",
  "text_on_screen",
  "skit",
  "tutorial",
  "vlog",
  "interview",
  "photo_carousel",
] as const;

export const ideaSchema = z.object({
  hook: z.string().min(8).max(200),
  concept: z.string().min(20).max(900),
  suggested_duration_seconds: z.number().int().min(5).max(600),
  format: z.enum(FORMATS),
  cta: z.string().min(3).max(200),
  caption_idea: z.string().min(5).max(500),
  reasoning: z.string().min(20).max(700),
  predicted_score: z.number().int().min(0).max(100),
});

export const ideaBatchSchema = z.object({
  ideas: z.array(ideaSchema).min(1).max(5),
});

export type Idea = z.infer<typeof ideaSchema>;

/** The JSON Schema handed to the model so it returns exactly this shape. */
export const IDEA_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ideas"],
  properties: {
    ideas: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "hook",
          "concept",
          "suggested_duration_seconds",
          "format",
          "cta",
          "caption_idea",
          "reasoning",
          "predicted_score",
        ],
        properties: {
          hook: { type: "string", description: "The first line said or shown on screen." },
          concept: { type: "string", description: "The video, described shot by shot." },
          suggested_duration_seconds: { type: "integer" },
          format: { type: "string", enum: [...FORMATS] },
          cta: { type: "string" },
          caption_idea: { type: "string" },
          reasoning: {
            type: "string",
            description: "Why this fits THIS creator, citing their own numbers.",
          },
          predicted_score: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
    },
  },
} as const;
