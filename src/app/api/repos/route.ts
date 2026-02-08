/**
 * GET /api/repos
 * Returns the user's GitHub repos (from GitHub API)
 * so they can pick which ones to link.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUserRepos } from "@/lib/github/repos";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const repos = await listUserRepos(session.accessToken);

    // Return a clean list of repos
    const cleanRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
    }));

    return NextResponse.json({ repos: cleanRepos });
  } catch (error) {
    console.error("Failed to fetch repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repos from GitHub" },
      { status: 500 }
    );
  }
}
