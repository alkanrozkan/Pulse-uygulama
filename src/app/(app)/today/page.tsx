import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getQuota, getTodayRecommendations, getVideos } from "@/lib/data";
import { TodayBoard } from "@/components/app/today-board";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const [recommendations, videos, quota] = await Promise.all([
    getTodayRecommendations(user.id),
    getVideos(user.id),
    getQuota(user.id, profile.plan),
  ]);

  const today = new Date().toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={today}
        title="What should I post today?"
        description={`Three videos, chosen from the ${videos.length} ${
          videos.length === 1 ? "video" : "videos"
        } you've logged. Every idea says which of your own numbers it's built on.`}
        aside={
          quota.limit !== null ? (
            <Badge tone={quota.exhausted ? "neg" : "outline"}>
              {quota.used}/{quota.limit} this month
            </Badge>
          ) : (
            <Badge tone="accent">Daily ideas</Badge>
          )
        }
      />

      <TodayBoard initial={recommendations} quota={quota} videoCount={videos.length} />
    </div>
  );
}
