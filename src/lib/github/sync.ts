/**
 * Sync logic: polls GitHub for new push events on linked repos
 * and awards 1 point per push.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { pollRepoEvents } from "./client";
import { calculateAndAwardStreakBonus } from "@/lib/streaks/calculate";

interface SyncResult {
  repoName: string;
  newPushes: number;
  error?: string;
}

/**
 * Sync all linked repos for a specific user.
 * Returns a summary of what was synced.
 */
export async function syncUserRepos(userId: string): Promise<SyncResult[]> {
  const supabase = createAdminClient();
  const results: SyncResult[] = [];

  // 1. Get the user's access token
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("github_access_token")
    .eq("id", userId)
    .single();

  if (userError || !user?.github_access_token) {
    throw new Error("Could not find user or access token");
  }

  // 2. Get all linked repos for this user
  const { data: repos, error: repoError } = await supabase
    .from("repositories")
    .select("*")
    .eq("user_id", userId);

  if (repoError) {
    throw new Error(`Failed to fetch repos: ${repoError.message}`);
  }

  if (!repos || repos.length === 0) {
    return [];
  }

  // 3. Poll each repo for new push events
  for (const repo of repos) {
    try {
      const response = await pollRepoEvents(
        user.github_access_token,
        repo.repo_full_name,
        repo.last_etag
      );

      // null means 304 Not Modified - no new events
      if (!response) {
        results.push({ repoName: repo.repo_full_name, newPushes: 0 });
        continue;
      }

      let newPushCount = 0;

      // 4. Insert each push event (skip duplicates via unique constraint)
      for (const event of response.events) {
        const { error: insertError } = await supabase
          .from("push_events")
          .insert({
            user_id: userId,
            repository_id: repo.id,
            github_event_id: event.id,
            push_id: event.payload.push_id,
            ref: event.payload.ref,
            commit_count: event.payload.size,
            head_sha: event.payload.head,
            points_awarded: 1,
            event_created_at: event.created_at,
          })
          .select();

        // If no error, it's a new event (not a duplicate)
        if (!insertError) {
          newPushCount++;
        }
        // Duplicate key error (23505) is expected and fine - just skip
      }

      // 5. Update repo's last_etag and last_polled_at
      await supabase
        .from("repositories")
        .update({
          last_etag: response.etag,
          last_polled_at: new Date().toISOString(),
          poll_interval: response.pollInterval,
        })
        .eq("id", repo.id);

      // 6. Update user's total_points and calculate streak bonus
      if (newPushCount > 0) {
        // Calculate streak bonus (first push of day = +1, weekly/monthly milestones)
        await calculateAndAwardStreakBonus(userId);
      }

      results.push({
        repoName: repo.repo_full_name,
        newPushes: newPushCount,
      });
    } catch (err) {
      results.push({
        repoName: repo.repo_full_name,
        newPushes: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}
