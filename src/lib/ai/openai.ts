import "server-only";
import OpenAI from "openai";
import { IDEA_JSON_SCHEMA, ideaBatchSchema, type Idea } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt, type PromptInput } from "./prompt";
import { fallbackIdeas } from "./fallback";

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export interface GenerationResult {
  ideas: Idea[];
  model: string;
  /** True when no API key was configured and the local generator ran instead. */
  usedFallback: boolean;
}

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export async function generateIdeas(input: PromptInput): Promise<GenerationResult> {
  const openai = getClient();

  // No key configured: run the rules-based generator so the product still works
  // end to end in local development. See src/lib/ai/fallback.ts.
  if (!openai) {
    return { ideas: fallbackIdeas(input), model: "pulse-rules-v1", usedFallback: true };
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    temperature: 0.8,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pulse_recommendations",
        strict: true,
        schema: IDEA_JSON_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("The model returned an empty response.");

  const parsed = ideaBatchSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`The model returned an unexpected shape: ${parsed.error.message}`);
  }

  return { ideas: parsed.data.ideas.slice(0, 3), model: AI_MODEL, usedFallback: false };
}
