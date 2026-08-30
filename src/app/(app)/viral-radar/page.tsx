import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getTrends } from "@/lib/data";
import { PageHeader } from "@/components/app/page-header";
import { TrendCard } from "@/components/app/trend-card";
import { EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Viral Radar" };
export const dynamic = "force-dynamic";

export default async function ViralRadarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const trends = await getTrends(profile.niche, profile.main_platform);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Viral Radar"
        description={`Formats picking up speed right now, each rewritten as an angle for ${profile.niche}. Velocity is how fast the format is accelerating; age is how long the window has been open.`}
        aside={<Badge tone="outline">{trends.length} moving</Badge>}
      />

      <p className="rounded-soft border border-line bg-raised px-4 py-3 text-xs text-muted">
        Radar data is seeded for this release. The provider interface in{" "}
        <code className="font-mono">src/lib/trends/provider.ts</code> is where a live trends API
        plugs in — nothing on this page changes when it does.
      </p>

      {trends.length === 0 ? (
        <EmptyState
          title="The radar is quiet"
          body="No trends are being tracked yet. Run supabase/seed_trends.sql to populate the table."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}
