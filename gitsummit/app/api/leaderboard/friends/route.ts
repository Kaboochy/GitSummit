import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  // Get current user
  const userSupabase = await supabaseServer();
  const { data: userData } = await userSupabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the user's GitSummit user record
  const { data: currentUser } = await supabase
    .from("users")
    .select("user_id, github_username")
    .eq("user_id", userData.user.id)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get user's friends (mutual followers)
  const { data: friendships } = await supabase
    .from("friendships")
    .select("friend_user_id")
    .eq("user_id", currentUser.user_id);

  const friendIds = friendships?.map((f) => f.friend_user_id) || [];

  // Include the current user in the leaderboard
  const userIdsToInclude = [currentUser.user_id, ...friendIds];

  if (userIdsToInclude.length === 0) {
    return NextResponse.json({ leaderboard: [] });
  }

  // Get leaderboard for friends + current user
  const { data, error } = await supabase
    .from("users")
    .select("user_id, github_username, github_avatar_url, weekly_score, lifetime_score")
    .in("user_id", userIdsToInclude)
    .order("weekly_score", { ascending: false })
    .order("updated_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add rank to each user
  const leaderboard = data.map((user, index) => ({
    ...user,
    rank: index + 1,
    is_current_user: user.user_id === currentUser.user_id,
  }));

  return NextResponse.json({ leaderboard, current_user: currentUser });
}
