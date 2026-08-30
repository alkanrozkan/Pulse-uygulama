import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getVideos } from "@/lib/data";
import { deleteVideo } from "@/app/actions/videos";
import { PageHeader } from "@/components/app/page-header";
import { VideoForm } from "@/components/app/video-form";
import { EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { FORMAT_LABELS, HOOK_STYLE_LABELS } from "@/lib/labels";
import { classifyHook } from "@/lib/analytics/classify";
import { compactNumber, seconds } from "@/lib/utils";

export const metadata: Metadata = { title: "Videos" };
export const dynamic = "force-dynamic";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const videos = await getVideos(user.id);
  const defaultPlatform = profile.main_platform === "instagram" ? "instagram" : "tiktok";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Videos"
        description="Everything Pulse learns from. Numbers come from your own analytics — nothing is estimated."
        aside={<Badge tone="outline">{videos.length} logged</Badge>}
      />

      {searchParams.welcome === "1" && (
        <p className="rounded-soft border border-accent/30 bg-accent/[0.07] px-4 py-3 text-sm">
          Profile saved. Log three or four recent videos and Today&rsquo;s ideas will have something
          real to work from.
        </p>
      )}

      <VideoForm defaultPlatform={defaultPlatform} />

      {videos.length === 0 ? (
        <EmptyState
          title="No videos yet"
          body="Start with your last five posts — a mix of one that did well and one that flopped teaches Pulse the most."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-line">
            {videos.map((video) => {
              const hookStyle = classifyHook(video.hook);
              return (
                <div key={video.id} className="flex flex-wrap items-start gap-4 p-4 sm:flex-nowrap">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{video.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      &ldquo;{video.hook}&rdquo;
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                      <span>{FORMAT_LABELS[video.format]}</span>
                      <span>·</span>
                      <span>{HOOK_STYLE_LABELS[hookStyle]}</span>
                      <span>·</span>
                      <span>{video.topic}</span>
                      <span>·</span>
                      <span>{seconds(video.duration_seconds)}</span>
                      <span>·</span>
                      <span>{video.posted_at.slice(0, 10)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-5">
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold tabular-nums">
                        {compactNumber(video.views)}
                      </p>
                      <p className="font-mono text-[11px] text-muted">views</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold tabular-nums">
                        {Number(video.engagement_rate).toFixed(1)}%
                      </p>
                      <p className="font-mono text-[11px] text-muted">eng</p>
                    </div>
                    <form action={deleteVideo}>
                      <input type="hidden" name="id" value={video.id} />
                      <button
                        type="submit"
                        className="rounded-soft px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition-colors hover:bg-neg/10 hover:text-neg"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
