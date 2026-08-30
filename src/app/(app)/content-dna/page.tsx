import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getProfile } from "@/lib/data";
import { MIN_SAMPLE_FOR_CONFIDENCE } from "@/lib/analytics/dna";
import { PageHeader } from "@/components/app/page-header";
import { DnaPanel, SignalList } from "@/components/app/dna-panel";
import { EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Content DNA" };
export const dynamic = "force-dynamic";

export default async function ContentDnaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const { videos, dna } = await getDashboardData(user.id);

  if (!videos.length) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Content DNA"
          description="The patterns underneath your account: which hooks, lengths, formats and posting windows actually move your numbers."
        />
        <EmptyState
          title="Nothing to analyse yet"
          body="Content DNA is built entirely from videos you log. Add a few and every panel below fills in."
          actionLabel="Log a video"
          actionHref="/videos"
        />
      </div>
    );
  }

  const thin = videos.length < MIN_SAMPLE_FOR_CONFIDENCE;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content DNA"
        description="Every bar is indexed against your own best-performing bucket, not an industry benchmark."
        aside={
          <Badge tone={thin ? "neutral" : "accent"}>
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </Badge>
        }
      />

      {thin && (
        <p className="rounded-soft border border-line bg-raised px-4 py-3 text-sm text-muted">
          Below {MIN_SAMPLE_FOR_CONFIDENCE} videos these patterns are directional rather than
          reliable. Buckets with a single video are greyed out.
        </p>
      )}

      <SignalList signals={dna.signals} />

      <div className="grid gap-4 md:grid-cols-2">
        <DnaPanel
          title="Hook styles"
          description="Inferred from the opening line you entered for each video."
          buckets={dna.hookStyles}
        />
        <DnaPanel
          title="Topics"
          description="Grouped by the topic label you gave each video."
          buckets={dna.topics}
        />
        <DnaPanel
          title="Video length"
          description="Average views by duration band."
          buckets={dna.durations}
        />
        <DnaPanel
          title="Formats"
          description="How each production style performs for you."
          buckets={dna.formats}
        />
        <DnaPanel
          title="Posting windows"
          description="Based on the local time each video went live."
          buckets={dna.postingHours}
        />
        <DnaPanel
          title="On camera vs screen"
          description="Whether your audience responds to your face or to the work."
          buckets={dna.presence}
        />
        <DnaPanel
          title="Narrative structure"
          description="Storytelling, listicle, POV or straight explainer."
          buckets={dna.structures}
        />
      </div>
    </div>
  );
}
