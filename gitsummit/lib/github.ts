// GitHub API utilities for GitSummit

export interface CommitDetails {
  sha: string;
  message: string;
  author: {
    login: string;
    avatar_url: string;
  };
  commit: {
    author: {
      date: string;
    };
  };
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  html_url: string;
}

/**
 * Fetch detailed commit information from GitHub API
 * Requires installation access token
 */
export async function fetchCommitDetails(
  owner: string,
  repo: string,
  sha: string,
  accessToken: string
): Promise<CommitDetails | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitSummit",
        },
      }
    );

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching commit details:", error);
    return null;
  }
}

/**
 * Get GitHub App installation access token
 * This requires the GitHub App private key and installation ID
 */
export async function getInstallationAccessToken(
  installationId: number
): Promise<string | null> {
  // For now, we'll use a stored token from the database
  // In production, you'd generate a JWT and exchange it for an installation token
  // See: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app

  // This is a simplified version - you should implement proper JWT generation
  // and token exchange in production
  return process.env.GITHUB_ACCESS_TOKEN || null;
}

/**
 * Fetch user's mutual followers (friends) from GitHub
 */
export async function fetchMutualFollowers(
  username: string,
  accessToken: string
): Promise<string[]> {
  try {
    // Fetch followers
    const followersResponse = await fetch(
      `https://api.github.com/users/${username}/followers?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitSummit",
        },
      }
    );

    if (!followersResponse.ok) return [];
    const followers = await followersResponse.json();
    const followerLogins = new Set(followers.map((f: any) => f.login));

    // Fetch following
    const followingResponse = await fetch(
      `https://api.github.com/users/${username}/following?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "GitSummit",
        },
      }
    );

    if (!followingResponse.ok) return [];
    const following = await followingResponse.json();

    // Find mutual followers
    const mutualFollowers = following
      .filter((f: any) => followerLogins.has(f.login))
      .map((f: any) => f.login);

    return mutualFollowers;
  } catch (error) {
    console.error("Error fetching mutual followers:", error);
    return [];
  }
}

/**
 * Fetch user details from GitHub
 */
export async function fetchGitHubUser(username: string, accessToken: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitSummit",
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    return null;
  }
}
