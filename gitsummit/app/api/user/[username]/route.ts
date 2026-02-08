import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const username = params.username;

  // Get user profile
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("github_username", username)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get trophies
  const { data: trophies } = await supabase
    .from("trophies")
    .select("*")
    .eq("user_id", user.user_id)
    .order("created_at", { ascending: false });

  // Get trophy counts
  const goldCount = trophies?.filter((t) => t.trophy_type === "gold").length || 0;
  const silverCount = trophies?.filter((t) => t.trophy_type === "silver").length || 0;
  const bronzeCount = trophies?.filter((t) => t.trophy_type === "bronze").length || 0;

  // Get recent commits
  const { data: recentCommits } = await supabase
    .from("commits")
    .select("*")
    .eq("user_id", user.user_id)
    .order("committed_at", { ascending: false })
    .limit(10);

  // Get weekly rank
  const { data: allUsers } = await supabase
    .from("users")
    .select("user_id, weekly_score")
    .order("weekly_score", { ascending: false });

  const weeklyRank =
    allUsers?.findIndex((u) => u.user_id === user.user_id) + 1 || null;

  return NextResponse.json({
    user: {
      ...user,
      weekly_rank: weeklyRank,
    },
    trophies: {
      gold: goldCount,
      silver: silverCount,
      bronze: bronzeCount,
      total: goldCount + silverCount + bronzeCount,
      recent: trophies?.slice(0, 5) || [],
    },
    recent_commits: recentCommits || [],
  });
}
