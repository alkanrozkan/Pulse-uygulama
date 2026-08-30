import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getQuota } from "@/lib/data";
import { PageHeader } from "@/components/app/page-header";
import { PlanTable } from "@/components/app/plan-table";

export const metadata: Metadata = { title: "Plan & billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const quota = await getQuota(user.id, profile.plan);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plan &amp; billing"
        description={
          quota.limit === null
            ? "You have unlimited recommendations."
            : `${quota.used} of ${quota.limit} recommendations used this month. The counter resets on the 1st.`
        }
      />
      <PlanTable currentPlan={profile.plan} />
    </div>
  );
}
