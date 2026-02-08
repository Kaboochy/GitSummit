"use client";

/**
 * ClimberDisplay - Placeholder component for the team's sprite/climber visuals.
 *
 * Props passed in:
 * - totalPoints: the user's current point total
 * - maxPoints: the "summit" target (e.g., 100 or 1000)
 * - progressPercent: 0-100 how far up the mountain
 *
 * YOUR TEAM replaces the inside of this component with the actual
 * sprite animation. The functional data (points, progress) is
 * already calculated and passed in — just use it to position/animate
 * your climber sprite!
 */

interface ClimberDisplayProps {
  totalPoints: number;
  maxPoints: number;
  progressPercent: number;
}

export function ClimberDisplay({
  totalPoints,
  maxPoints,
  progressPercent,
}: ClimberDisplayProps) {
  return (
    <div className="relative w-full rounded-xl border border-zinc-200 bg-gradient-to-t from-green-100 via-green-50 to-blue-100 p-6 dark:border-zinc-700 dark:from-green-950 dark:via-zinc-900 dark:to-blue-950">
      {/* Mountain background placeholder */}
      <div className="flex flex-col items-center gap-4">
        {/* Progress label */}
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Climbing Progress
        </p>

        {/* Visual progress bar (placeholder for sprite) */}
        <div className="relative h-64 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          {/* Filled portion (grows from bottom) */}
          <div
            className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all duration-1000 ease-out"
            style={{ height: `${Math.min(progressPercent, 100)}%` }}
          />

          {/* Climber emoji placeholder — replace with your sprite! */}
          <div
            className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-1000 ease-out"
            style={{ bottom: `calc(${Math.min(progressPercent, 96)}% - 8px)` }}
          >
            🧗
          </div>
        </div>

        {/* Stats below the climber */}
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalPoints} / {maxPoints}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            points to summit
          </p>
        </div>

        {/* Team note */}
        <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
          🎨 Team: Replace this placeholder with your sprite animation!
        </p>
      </div>
    </div>
  );
}
