/**
 * GET /api/stats
 * Returns the user's stats: total points, repo count, recent push events.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get user's internal ID, total points, and streaks
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, total_points, current_streak, longest_streak")
    .eq("github_id", session.user.githubId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get repo count
  const { count: repoCount } = await supabase
    .from("repositories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get recent push events (last 20)
  const { data: recentEvents } = await supabase
    .from("push_events")
    .select(
      `
      id,
      ref,
      commit_count,
      points_awarded,
      event_created_at,
      repositories (
        repo_name,
        repo_full_name
      )
    `
    )
    .eq("user_id", user.id)
    .order("event_created_at", { ascending: false })
    .limit(20);

  // Get rank (count users with more points)
  const { count: usersAbove } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gt("total_points", user.total_points || 0);

  const rank = (usersAbove || 0) + 1;

  return NextResponse.json({
    totalPoints: user.total_points || 0,
    currentStreak: user.current_streak || 0,
    longestStreak: user.longest_streak || 0,
    repoCount: repoCount || 0,
    rank,
    recentEvents: recentEvents || [],
  });
}
