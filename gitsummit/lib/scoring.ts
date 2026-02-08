// GitSummit Scoring System
// 1-5 points per commit based on size
// Max 5 commits per day count toward score

/**
 * Calculate points for a commit based on total changes (additions + deletions)
 *
 * Scoring tiers:
 * - 1-10 changes: 1 point (tiny tweak)
 * - 11-50 changes: 2 points (small change)
 * - 51-150 changes: 3 points (medium change)
 * - 151-300 changes: 4 points (large change)
 * - 301+ changes: 5 points (major change)
 */
export function calculateCommitPoints(additions: number, deletions: number): number {
  const totalChanges = additions + deletions;

  if (totalChanges <= 10) return 1;
  if (totalChanges <= 50) return 2;
  if (totalChanges <= 150) return 3;
  if (totalChanges <= 300) return 4;
  return 5;
}

/**
 * Maximum commits per day that count toward score
 */
export const MAX_DAILY_COMMITS = 5;

/**
 * Maximum points possible per day
 */
export const MAX_DAILY_POINTS = 25; // 5 commits × 5 points

/**
 * Check if a commit should count toward the user's score
 */
export function shouldCountCommit(dailyCommitNumber: number): boolean {
  return dailyCommitNumber <= MAX_DAILY_COMMITS;
}
