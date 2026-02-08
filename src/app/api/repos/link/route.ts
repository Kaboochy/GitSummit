/**
 * POST /api/repos/link
 * Links a GitHub repo to the user's account.
 * Body: { repoId, name, fullName, url, isPrivate, language, description }
 *
 * DELETE /api/repos/link
 * Unlinks a repo.
 * Body: { repoId }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { repoId, name, fullName, url, isPrivate, language, description } =
    body;

  if (!repoId || !fullName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Get the user's internal ID from their github_id
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", session.user.githubId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Insert the repo (upsert to handle re-linking)
  const { data: repo, error: repoError } = await supabase
    .from("repositories")
    .upsert(
      {
        user_id: user.id,
        github_repo_id: repoId,
        repo_name: name,
        repo_full_name: fullName,
        repo_url: url,
        is_private: isPrivate || false,
        language: language || null,
        description: description || null,
      },
      { onConflict: "user_id,github_repo_id" }
    )
    .select()
    .single();

  if (repoError) {
    console.error("Failed to link repo:", repoError);
    return NextResponse.json(
      { error: "Failed to link repo" },
      { status: 500 }
    );
  }

  return NextResponse.json({ repo, message: "Repo linked successfully!" });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { repoId } = body;

  if (!repoId) {
    return NextResponse.json(
      { error: "Missing repoId" },
      { status: 400 }
    );
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

  // Delete the repo link
  const { error: deleteError } = await supabase
    .from("repositories")
    .delete()
    .eq("user_id", user.id)
    .eq("github_repo_id", repoId);

  if (deleteError) {
    console.error("Failed to unlink repo:", deleteError);
    return NextResponse.json(
      { error: "Failed to unlink repo" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Repo unlinked successfully!" });
}
