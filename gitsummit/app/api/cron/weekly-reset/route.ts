import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Weekly Reset Cron Job
 * Runs every Monday at 12:00 PM UTC
 *
 * To set up in Vercel:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-reset",
 *     "schedule": "0 12 * * 1"
 *   }]
 * }
 *
 * Or use a service like cron-job.org to call this endpoint weekly
 */

export async function GET(req: Request) {
  // Verify this is a cron request (Vercel sets this header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the request is from your cron service
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Calculate week date range
    const now = new Date();
    const weekEndDate = new Date(now);
    weekEndDate.setUTCHours(12, 0, 0, 0); // Set to noon UTC

    const weekStartDate = new Date(weekEndDate);
    weekStartDate.setDate(weekStartDate.getDate() - 7);

    const weekStartStr = weekStartDate.toISOString().split("T")[0];
    const weekEndStr = weekEndDate.toISOString().split("T")[0];

    console.log(`Weekly reset starting for week: ${weekStartStr} to ${weekEndStr}`);

    // Get all users with scores
    const { data: allUsers, error: usersError } = await supabase
      .from("users")
      .select("user_id, github_username, weekly_score")
      .gt("weekly_score", 0)
      .order("weekly_score", { ascending: false })
      .order("updated_at", { ascending: true });

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    if (!allUsers || allUsers.length === 0) {
      console.log("No users with scores this week");
      return NextResponse.json({ message: "No users to process" });
    }

    // === GLOBAL LEADERBOARD TROPHIES ===
    const topGlobal = allUsers.slice(0, 3);

    for (let i = 0; i < topGlobal.length; i++) {
      const user = topGlobal[i];
      const trophyType = i === 0 ? "gold" : i === 1 ? "silver" : "bronze";

      await supabase.from("trophies").insert({
        user_id: user.user_id,
        trophy_type: trophyType,
        leaderboard_type: "global",
        week_start_date: weekStartStr,
        week_end_date: weekEndStr,
        score: user.weekly_score,
        rank: i + 1,
      });

      console.log(
        `Awarded ${trophyType} trophy to ${user.github_username} (global rank ${i + 1})`
      );
    }

    // === FRIENDS LEADERBOARD TROPHIES ===
    // Get all friendships
    const { data: friendships } = await supabase.from("friendships").select("*");

    if (friendships) {
      // Group users by their friend networks
      const friendNetworks = new Map<string, Set<string>>();

      for (const friendship of friendships) {
        if (!friendNetworks.has(friendship.user_id)) {
          friendNetworks.set(friendship.user_id, new Set());
        }
        friendNetworks.get(friendship.user_id)!.add(friendship.friend_user_id);
      }

      // For each user, determine their friends leaderboard and award trophies
      for (const [userId, friendIds] of friendNetworks.entries()) {
        const friendIdsArray = Array.from(friendIds);
        friendIdsArray.push(userId); // Include the user themselves

        // Get friends leaderboard
        const friendsWithScores = allUsers.filter((u) =>
          friendIdsArray.includes(u.user_id)
        );

        const topFriends = friendsWithScores.slice(0, 3);

        for (let i = 0; i < topFriends.length; i++) {
          const friend = topFriends[i];
          const trophyType = i === 0 ? "gold" : i === 1 ? "silver" : "bronze";

          // Check if trophy already exists (to avoid duplicates)
          const { data: existing } = await supabase
            .from("trophies")
            .select("trophy_id")
            .eq("user_id", friend.user_id)
            .eq("leaderboard_type", "friends")
            .eq("week_start_date", weekStartStr)
            .single();

          if (!existing) {
            await supabase.from("trophies").insert({
              user_id: friend.user_id,
              trophy_type: trophyType,
              leaderboard_type: "friends",
              week_start_date: weekStartStr,
              week_end_date: weekEndStr,
              score: friend.weekly_score,
              rank: i + 1,
            });
          }
        }
      }
    }

    // === CREATE WEEKLY SNAPSHOTS ===
    const snapshots = allUsers.map((user, index) => ({
      user_id: user.user_id,
      week_start_date: weekStartStr,
      week_end_date: weekEndStr,
      weekly_score: user.weekly_score,
      global_rank: index + 1,
      commit_count: 0, // Can be calculated from commits table if needed
    }));

    await supabase.from("weekly_leaderboard_snapshots").insert(snapshots);

    // === RESET WEEKLY SCORES ===
    await supabase.from("users").update({ weekly_score: 0 }).neq("user_id", "");

    console.log(`Weekly reset complete! Processed ${allUsers.length} users.`);

    return NextResponse.json({
      success: true,
      message: `Weekly reset complete`,
      users_processed: allUsers.length,
      trophies_awarded: topGlobal.length,
      week: { start: weekStartStr, end: weekEndStr },
    });
  } catch (error: any) {
    console.error("Error in weekly reset:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST(req: Request) {
  return GET(req);
}
