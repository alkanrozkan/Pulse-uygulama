"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

const count = z.coerce.number().int().min(0).max(1_000_000_000);

const videoSchema = z.object({
  platform: z.enum(["tiktok", "instagram"]),
  title: z.string().trim().min(1, "Give the video a title so you can recognise it."),
  hook: z.string().trim().min(3, "Write the first line exactly as it appears."),
  topic: z.string().trim().min(2, "Add a topic — this is how Pulse groups your videos."),
  format: z.enum(FORMATS),
  views: count,
  likes: count,
  comments: count,
  shares: count,
  saves: count,
  duration_seconds: z.coerce.number().int().min(1, "Duration must be at least 1 second.").max(3600),
  posted_at: z.string().min(1, "Pick the date this went live."),
});

export interface VideoState {
  error: string | null;
  success?: boolean;
}

export async function addVideo(_prev: VideoState, formData: FormData): Promise<VideoState> {
  const parsed = videoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in again." };

  const { posted_at, ...rest } = parsed.data;

  const { error } = await supabase.from("videos").insert({
    user_id: user.id,
    ...rest,
    posted_at: new Date(posted_at).toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/videos");
  revalidatePath("/dashboard");
  revalidatePath("/content-dna");
  return { error: null, success: true };
}

export async function deleteVideo(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("videos").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/videos");
  revalidatePath("/dashboard");
  revalidatePath("/content-dna");
}
