"use client";

import { Flame, Award, TrendingUp } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-orange-500";
    if (streak >= 7) return "text-yellow-500";
    return "text-green-600";
  };

  const getStreakGlow = (streak: number) => {
    if (streak >= 30) return "drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]";
    if (streak >= 7) return "drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]";
    return "drop-shadow-[0_0_10px_rgba(22,163,74,0.6)]";
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Current Streak */}
      <div
        className="group relative overflow-hidden rounded-xl border-4 border-green-800 bg-gradient-to-br from-green-700 via-green-800 to-blue-800 p-6 shadow-2xl transition-all hover:scale-105 hover:shadow-green-500/50 dark:border-green-900 dark:from-green-900 dark:to-blue-950"
        style={{ backdropFilter: "blur(10px)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-100">Current Streak</p>
            <p
              className={`mt-2 text-5xl font-bold ${getStreakColor(currentStreak)} transition-all group-hover:scale-110`}
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {currentStreak}
            </p>
            <p className="mt-1 text-xs text-green-200">
              {currentStreak === 1 ? "day" : "days"} in a row
            </p>
          </div>
          <Flame
            className={`h-12 w-12 ${getStreakColor(currentStreak)} ${getStreakGlow(currentStreak)} transition-all group-hover:scale-125 group-hover:rotate-12`}
          />
        </div>

        {/* Streak milestones indicator */}
        <div className="mt-4 flex gap-1">
          {[7, 30, 90, 365].map((milestone) => (
            <div
              key={milestone}
              className={`h-2 flex-1 rounded-full ${
                currentStreak >= milestone
                  ? "bg-yellow-400"
                  : "bg-green-900/30"
              }`}
              title={`${milestone} days`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-green-200">
          {currentStreak < 7 && `${7 - currentStreak} days to +5 bonus`}
          {currentStreak >= 7 && currentStreak < 30 && `${30 - currentStreak} days to +10 bonus`}
          {currentStreak >= 30 && currentStreak < 90 && `${90 - currentStreak} days to +20 bonus`}
          {currentStreak >= 90 && currentStreak < 365 && `${365 - currentStreak} days to +50 bonus!`}
          {currentStreak >= 365 && "Max streak achieved! 🏆"}
        </p>
      </div>

      {/* Longest Streak */}
      <div
        className="group relative overflow-hidden rounded-xl border-4 border-blue-800 bg-gradient-to-br from-blue-700 via-blue-800 to-teal-800 p-6 shadow-2xl transition-all hover:scale-105 hover:shadow-blue-500/50 dark:border-blue-900 dark:from-blue-900 dark:to-teal-950"
        style={{ backdropFilter: "blur(10px)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">Longest Streak</p>
            <p
              className="mt-2 text-5xl font-bold text-yellow-400 transition-all group-hover:scale-110"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {longestStreak}
            </p>
            <p className="mt-1 text-xs text-blue-200">personal record</p>
          </div>
          <Award
            className="h-12 w-12 text-yellow-400 transition-all group-hover:scale-125 group-hover:rotate-12"
            style={{ filter: "drop-shadow(0 0 15px rgba(250, 204, 21, 0.6))" }}
          />
        </div>

        {currentStreak === longestStreak && currentStreak > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-900/50 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <p className="text-xs font-medium text-green-300">
              You're on a record streak!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
