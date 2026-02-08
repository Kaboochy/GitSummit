/**
 * Streak calculation and bonus points logic
 * - First push of the day: +1 bonus point
 * - 7 day streak: +5 bonus points
 * - 30 day streak: +10 bonus points
 * - 90 day streak: +20 bonus points
 * - 365 day streak: +50 bonus points
 */

import { createAdminClient } from "@/lib/supabase/admin";

interface StreakResult {
  bonusPoints: number;
  currentStreak: number;
  isNewStreakDay: boolean;
  milestoneReached?: string;
}

export async function calculateAndAwardStreakBonus(
  userId: string
): Promise<StreakResult> {
  const supabase = createAdminClient();

  // Get user's current streak data
  const { data: user, error } = await supabase
    .from("users")
    .select("current_streak, longest_streak, last_push_date")
    .eq("id", userId)
    .single();

  if (error || !user) {
    console.error("Failed to fetch user streak data:", error);
    return { bonusPoints: 0, currentStreak: 0, isNewStreakDay: false };
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const lastPushDate = user.last_push_date;

  // If already pushed today, no bonus
  if (lastPushDate === today) {
    return {
      bonusPoints: 0,
      currentStreak: user.current_streak || 0,
      isNewStreakDay: false,
    };
  }

  // Calculate new streak
  let newStreak = 1; // Default to 1 for first push or broken streak
  let bonusPoints = 1; // Base bonus for first push of the day

  if (lastPushDate) {
    const lastDate = new Date(lastPushDate + "T00:00:00Z");
    const todayDate = new Date(today + "T00:00:00Z");
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day - increment streak from current value
      const currentStreak = user.current_streak || 0;
      newStreak = currentStreak + 1;
    } else if (diffDays > 1) {
      // Streak broken - reset to 1
      newStreak = 1;
    }
  } else {
    // First push ever - explicitly set to 1
    newStreak = 1;
  }

  // Check for milestone bonuses
  let milestone: string | undefined;
  if (newStreak === 7) {
    bonusPoints += 5;
    milestone = "weekly";
  } else if (newStreak === 30) {
    bonusPoints += 10;
    milestone = "monthly";
  } else if (newStreak === 90) {
    bonusPoints += 20;
    milestone = "quarterly";
  } else if (newStreak === 365) {
    bonusPoints += 50;
    milestone = "yearly";
  }

  // Update user's streak data
  const newLongestStreak = Math.max(newStreak, user.longest_streak || 0);

  await supabase
    .from("users")
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_push_date: today,
      streak_updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Log the streak bonus
  if (bonusPoints > 0) {
    await supabase.from("streaks_log").insert({
      user_id: userId,
      streak_day: newStreak,
      bonus_points: bonusPoints,
      milestone_type: milestone || "daily",
    });

    // Award bonus points to total_points
    const { data: totalData } = await supabase
      .from("push_events")
      .select("points_awarded")
      .eq("user_id", userId);

    const totalPushPoints = totalData
      ? totalData.reduce((sum, e) => sum + (e.points_awarded || 0), 0)
      : 0;

    // Get total streak bonuses
    const { data: streakData } = await supabase
      .from("streaks_log")
      .select("bonus_points")
      .eq("user_id", userId);

    const totalStreakBonus = streakData
      ? streakData.reduce((sum, s) => sum + (s.bonus_points || 0), 0)
      : 0;

    await supabase
      .from("users")
      .update({
        total_points: totalPushPoints + totalStreakBonus,
      })
      .eq("id", userId);
  }

  return {
    bonusPoints,
    currentStreak: newStreak,
    isNewStreakDay: true,
    milestoneReached: milestone,
  };
}
