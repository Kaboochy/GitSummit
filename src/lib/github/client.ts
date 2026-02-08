/**
 * GitHub API client functions.
 * Uses the user's GitHub access token to call the GitHub REST API.
 */

const GITHUB_API = "https://api.github.com";

interface GitHubEventResponse {
  events: GitHubPushEvent[];
  etag: string | null;
  pollInterval: number;
}

export interface GitHubPushEvent {
  id: string;
  type: string;
  payload: {
    push_id: number;
    ref: string;
    size: number; // number of commits
    head: string; // head SHA
  };
  created_at: string;
}

/**
 * Poll a repo's push events from GitHub API.
 * Uses ETag for conditional requests (saves API quota).
 * Returns null if nothing changed (304 Not Modified).
 */
export async function pollRepoEvents(
  accessToken: string,
  repoFullName: string,
  lastEtag?: string | null
): Promise<GitHubEventResponse | null> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (lastEtag) {
    headers["If-None-Match"] = lastEtag;
  }

  const response = await fetch(
    `${GITHUB_API}/repos/${repoFullName}/events?per_page=100`,
    { headers }
  );

  // 304 = nothing changed since last ETag
  if (response.status === 304) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const allEvents = await response.json();

  // Filter to only PushEvent type
  const pushEvents = allEvents.filter(
    (e: { type: string }) => e.type === "PushEvent"
  );

  return {
    events: pushEvents,
    etag: response.headers.get("etag"),
    pollInterval: parseInt(
      response.headers.get("x-poll-interval") || "60",
      10
    ),
  };
}
