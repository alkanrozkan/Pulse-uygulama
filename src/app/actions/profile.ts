"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Add the name you go by."),
  niche: z.string().trim().min(2, "Describe your niche in a few words."),
  main_platform: z.enum(["tiktok", "instagram", "both"]),
  instagram_username: z.string().trim().max(60).optional().nullable(),
  tiktok_username: z.string().trim().max(60).optional().nullable(),
  audience_country: z.string().trim().max(60).optional().nullable(),
  content_language: z.string().trim().min(2).max(40),
});

export interface ProfileState {
  error: string | null;
  success?: boolean;
}

function parse(formData: FormData) {
  const clean = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value.length ? value.replace(/^@/, "") : null;
  };

  return profileSchema.safeParse({
    display_name: String(formData.get("display_name") ?? ""),
    niche: String(formData.get("niche") ?? ""),
    main_platform: String(formData.get("main_platform") ?? "tiktok"),
    instagram_username: clean("instagram_username"),
    tiktok_username: clean("tiktok_username"),
    audience_country: clean("audience_country"),
    content_language: String(formData.get("content_language") ?? "en"),
  });
}

async function upsert(formData: FormData, completeOnboarding: boolean) {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Sign in again." };

  const { error } = await supabase.from("creator_profiles").upsert(
    {
      user_id: user.id,
      ...parsed.data,
      ...(completeOnboarding ? { onboarding_completed: true } : {}),
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function completeOnboarding(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const result = await upsert(formData, true);
  if (result.error) return result;

  revalidatePath("/", "layout");
  redirect("/videos?welcome=1");
}

export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const result = await upsert(formData, false);
  if (result.error) return result;

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
