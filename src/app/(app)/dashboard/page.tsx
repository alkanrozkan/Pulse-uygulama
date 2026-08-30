import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Sparkline } from "@/components/ui/sparkline";
import { EmptyState } from "@/components/ui/states";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FORMAT_LABELS } from "@/lib/labels";
import { compactNumber, fullNumber, percent, relativeDay, seconds } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const { videos, stats } = await getDashboardData(user.id);
  const recent = videos.slice(0, 6);

  if (!videos.length) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow={`Hi ${profile.display_name}`}
          title="Your account, once it has something to read"
          description="Pulse builds every number on this page from videos you log. Add three or four and the picture starts to form."
        />
        <EmptyState
          title="No videos logged yet"
          body="Add a handful of recent posts with their views and engagement. Pulse needs about eight before its patterns get confident."
          actionLabel="Log a video"
          actionHref="/videos"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Hi ${profile.display_name}`}
        title="Dashboard"
        description={`${videos.length} ${videos.length === 1 ? "video" : "videos"} analysed across ${profile.niche}.`}
        aside={
          <Link href="/today" className={buttonClasses({ size: "sm" })}>
            Today&rsquo;s ideas
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={compactNumber(stats.totalViews)} sub={`${fullNumber(stats.totalViews)} across all logged videos`} />
        <StatCard label="Average views" value={compactNumber(stats.avgViews)} sub={`Median ${compactNumber(stats.medianViews)}`} />
        <StatCard label="Engagement rate" value={percent(stats.engagementRate)} sub="Likes, comments, shares and saves per view" />
        <StatCard
          label="Last 7 days"
          value={compactNumber(stats.last7Views)}
          delta={stats.growthPct}
          sub={
            stats.growthPct === null
              ? "No prior week to compare against yet"
              : `vs ${compactNumber(stats.prev7Views)} the week before`
          }
        />
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Views by posting day</p>
            <p className="mt-1 text-sm text-muted">Last 14 days</p>
          </div>
          <Badge tone="outline">{stats.totalVideos} videos</Badge>
        </div>
        <div className="mt-5">
          <Sparkline values={stats.dailyViews.map((d) => d.views)} height={64} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Best performing format"
          value={<span className="font-display text-xl">{stats.bestFormat ?? "—"}</span>}
          sub={stats.bestFormat ? "Highest average views of any format you've used" : "Log more videos to find one"}
        />
        <StatCard
          label="Best performing hook style"
          value={<span className="font-display text-xl">{stats.bestHookStyle ?? "—"}</span>}
          sub={stats.bestHookStyle ? "Inferred from the opening line of each video" : "Log more videos to find one"}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent videos</h2>
          <Link href="/videos" className="text-sm text-accent underline-offset-4 hover:underline">
            All videos
          </Link>
        </div>

        <div className="card divide-y divide-line">
          {recent.map((video) => (
            <div key={video.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{video.title}</p>
                <p className="mt-1 truncate font-mono text-[11px] text-muted">
                  {FORMAT_LABELS[video.format]} · {seconds(video.duration_seconds)} ·{" "}
                  {relativeDay(video.posted_at)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {compactNumber(video.views)}
                </p>
                <p className="font-mono text-[11px] text-muted">
                  {Number(video.engagement_rate).toFixed(1)}% eng
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
