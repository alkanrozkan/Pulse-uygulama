import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getQuota } from "@/lib/data";
import { getPlan } from "@/lib/plans";
import { PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/app/profile-form";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const plan = getPlan(profile.plan);
  const quota = await getQuota(user.id, profile.plan);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Everything here feeds the prompt behind your recommendations."
        aside={<Badge tone="accent">{plan.name}</Badge>}
      />

      <ProfileForm profile={profile} />

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="eyebrow mb-2">Current plan</p>
          <p className="font-display text-lg font-semibold">{plan.name}</p>
          <p className="mt-1 text-sm text-muted">
            {quota.limit === null
              ? "Unlimited recommendations."
              : `${quota.used} of ${quota.limit} recommendations used this month.`}
          </p>
        </div>
        <Link href="/billing" className={buttonClasses({ variant: "secondary", size: "sm" })}>
          Manage plan
        </Link>
      </section>

      <section className="card p-5">
        <p className="eyebrow mb-2">Account</p>
        <p className="font-mono text-sm">{user.email}</p>
        <form action="/auth/sign-out" method="post" className="mt-4">
          <button
            type="submit"
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}
