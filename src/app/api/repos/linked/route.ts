/**
 * GET /api/repos/linked
 * Returns the user's linked repos from Supabase.
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

  // Get user's internal ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", session.user.githubId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch linked repos
  const { data: repos, error: repoError } = await supabase
    .from("repositories")
    .select("*")
    .eq("user_id", user.id)
    .order("linked_at", { ascending: false });

  if (repoError) {
    console.error("Failed to fetch linked repos:", repoError);
    return NextResponse.json(
      { error: "Failed to fetch linked repos" },
      { status: 500 }
    );
  }

  return NextResponse.json({ repos: repos || [] });
}
