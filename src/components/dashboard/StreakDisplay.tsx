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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Current Streak */}
      <div
        className="border-4 border-stone-900 bg-green-700 p-6 shadow-lg dark:border-black dark:bg-green-900"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}>
              Current Streak
            </p>
            <p
              className={`mt-2 text-5xl font-bold ${getStreakColor(currentStreak)}`}
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {currentStreak}
            </p>
            <p className="mt-1 text-xs text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}>
              {currentStreak === 1 ? "day" : "days"} in a row
            </p>
          </div>
          <Flame
            className={`h-12 w-12 ${getStreakColor(currentStreak)}`}
          />
        </div>

        {/* Streak milestones indicator */}
        <div className="mt-4 flex gap-1">
          {[7, 30, 90, 365].map((milestone) => (
            <div
              key={milestone}
              className={`h-2 flex-1 ${
                currentStreak >= milestone
                  ? "bg-yellow-400"
                  : "bg-green-900"
              }`}
              title={`${milestone} days`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}>
          {currentStreak < 7 && `${7 - currentStreak} days to +5 bonus`}
          {currentStreak >= 7 && currentStreak < 30 && `${30 - currentStreak} days to +10 bonus`}
          {currentStreak >= 30 && currentStreak < 90 && `${90 - currentStreak} days to +20 bonus`}
          {currentStreak >= 90 && currentStreak < 365 && `${365 - currentStreak} days to +50 bonus!`}
          {currentStreak >= 365 && "Max streak achieved!"}
        </p>
      </div>

      {/* Longest Streak */}
      <div
        className="border-4 border-stone-900 bg-blue-700 p-6 shadow-lg dark:border-black dark:bg-blue-900"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}>
              Longest Streak
            </p>
            <p
              className="mt-2 text-5xl font-bold text-yellow-400"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {longestStreak}
            </p>
            <p className="mt-1 text-xs text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}>
              personal record
            </p>
          </div>
          <Award
            className="h-12 w-12 text-yellow-400"
          />
        </div>

        {currentStreak === longestStreak && currentStreak > 0 && (
          <div className="mt-4 flex items-center gap-2 border-2 border-white bg-blue-800 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <p className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}>
              Record streak!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
