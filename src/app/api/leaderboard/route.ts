/**
 * GET /api/leaderboard
 * Returns all users ranked by total_points (descending).
 * Optional query param: ?limit=10 (default 50)
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const supabase = createAdminClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, github_username, avatar_url, display_name, total_points")
    .order("total_points", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }

  // Add rank numbers
  const ranked = (users || []).map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  return NextResponse.json({ leaderboard: ranked });
}
