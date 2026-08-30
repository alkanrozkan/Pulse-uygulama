import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data";
import { Nav } from "@/components/app/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_completed) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-paper">
      <Nav email={user.email ?? ""} />
      <main className="px-4 pb-20 pt-6 md:ml-60 md:px-8 md:pt-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
