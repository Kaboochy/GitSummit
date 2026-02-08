import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");

  // Get global leaderboard based on weekly scores
  const { data, error } = await supabase
    .from("users")
    .select("user_id, github_username, github_avatar_url, weekly_score, lifetime_score")
    .gt("weekly_score", 0)
    .order("weekly_score", { ascending: false })
    .order("updated_at", { ascending: true }) // Tiebreaker: who got there first
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add rank to each user
  const leaderboard = data.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  return NextResponse.json({ leaderboard });
}
