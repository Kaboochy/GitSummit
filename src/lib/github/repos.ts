/**
 * Functions for listing user's GitHub repositories.
 */

const GITHUB_API = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  pushed_at: string | null;
}

/**
 * List all repos the authenticated user has access to.
 * Fetches up to 100 repos sorted by most recently pushed.
 */
export async function listUserRepos(
  accessToken: string
): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${GITHUB_API}/user/repos?per_page=100&sort=pushed&direction=desc&type=all`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
