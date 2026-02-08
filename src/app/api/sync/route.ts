/**
 * POST /api/sync
 * Syncs push events for the logged-in user's linked repos.
 * Awards 1 point per new push event found.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncUserRepos } from "@/lib/github/sync";

export async function POST() {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get user's internal ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", session.user.githubId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const results = await syncUserRepos(user.id);

    const totalNewPushes = results.reduce((sum, r) => sum + r.newPushes, 0);

    // Get updated total points
    const { data: updatedUser } = await supabase
      .from("users")
      .select("total_points")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      results,
      totalNewPushes,
      totalPoints: updatedUser?.total_points || 0,
      message:
        totalNewPushes > 0
          ? `Found ${totalNewPushes} new push(es)! +${totalNewPushes} points!`
          : "All repos are up to date. No new pushes found.",
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { error: "Sync failed. Please try again." },
      { status: 500 }
    );
  }
}
