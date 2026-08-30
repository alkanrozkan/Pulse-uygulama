import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getTrends } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/trends — Viral Radar data, personalised to the caller's niche. */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const profile = await getProfile(user.id);
  const niche = request.nextUrl.searchParams.get("niche") ?? profile?.niche ?? "your niche";

  const trends = await getTrends(niche, profile?.main_platform ?? null);
  return NextResponse.json({ trends });
}
