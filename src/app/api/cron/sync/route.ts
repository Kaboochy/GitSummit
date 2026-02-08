/**
 * GET /api/cron/sync
 * Called by Vercel Cron (or manually) to sync ALL users' repos.
 * Protected by CRON_SECRET to prevent unauthorized access.
 *
 * This runs every 15 minutes on Vercel to automatically award
 * points for new pushes — users don't have to click Sync manually.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncUserRepos } from "@/lib/github/sync";

export async function GET(request: NextRequest) {
  // Verify the cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all users who have at least one linked repo
  const { data: usersWithRepos, error } = await supabase
    .from("repositories")
    .select("user_id")
    .limit(500);

  if (error) {
    console.error("Cron: Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }

  // Deduplicate user IDs
  const uniqueUserIds = [
    ...new Set(usersWithRepos?.map((r) => r.user_id) || []),
  ];

  console.log(`Cron: Syncing ${uniqueUserIds.length} user(s)...`);

  const results = [];

  for (const userId of uniqueUserIds) {
    try {
      const syncResults = await syncUserRepos(userId);
      const totalNew = syncResults.reduce((sum, r) => sum + r.newPushes, 0);
      results.push({ userId, totalNew, success: true });

      if (totalNew > 0) {
        console.log(`Cron: User ${userId} got ${totalNew} new push(es)`);
      }
    } catch (err) {
      console.error(`Cron: Failed to sync user ${userId}:`, err);
      results.push({ userId, totalNew: 0, success: false });
    }
  }

  const totalNewPushes = results.reduce((sum, r) => sum + r.totalNew, 0);

  return NextResponse.json({
    message: `Synced ${uniqueUserIds.length} user(s). ${totalNewPushes} new push(es) found.`,
    usersProcessed: uniqueUserIds.length,
    totalNewPushes,
  });
}
