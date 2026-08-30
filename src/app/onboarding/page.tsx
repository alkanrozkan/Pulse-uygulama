import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data";
import { OnboardingForm } from "@/components/app/onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <div className="min-h-screen px-6 py-16">
      <OnboardingForm />
    </div>
  );
}
