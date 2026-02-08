"use client";

import { useEffect, useState, useRef } from "react";

/**
 * MountainClimbers - Renders multiple animated climbers on a mountain background
 * Each climber represents a user on the leaderboard, positioned based on their rank
 */

const FRAME_COUNT = 12;
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 64;
const SCALE = 2; // Smaller than ClimberDisplay to fit multiple climbers
const ANIMATION_SPEED_MS = 180;

interface LeaderboardUser {
  id: string;
  github_username: string;
  display_name: string;
  total_points: number;
  rank: number;
}

interface MountainClimbersProps {
  users: LeaderboardUser[];
}

export function MountainClimbers({ users }: MountainClimbersProps) {
  // Limit to top 12 climbers to avoid clutter
  const displayUsers = users.slice(0, 12);

  return (
    <div className="relative mb-8 w-full overflow-hidden rounded-2xl border-4 border-green-800 bg-gradient-to-b from-sky-400 via-sky-300 to-green-100 shadow-2xl dark:border-green-950 dark:from-sky-900 dark:via-sky-950 dark:to-green-950">
      {/* Mountain Background */}
      <div
        className="relative mx-auto"
        style={{
          width: "100%",
          height: 700,
          backgroundImage: "url(/sprites/ElCapoochy.png)",
          backgroundSize: "contain",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      >
        {/* Render each climber */}
        {displayUsers.map((user, index) => (
          <AnimatedClimber
            key={user.id}
            user={user}
            index={index}
            totalUsers={displayUsers.length}
          />
        ))}
      </div>
    </div>
  );
}

interface AnimatedClimberProps {
  user: LeaderboardUser;
  index: number;
  totalUsers: number;
}

function AnimatedClimber({ user, index, totalUsers }: AnimatedClimberProps) {
  const [frame, setFrame] = useState(0);
  const animating = useRef(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (animating.current) {
        setFrame((prev) => (prev + 1) % FRAME_COUNT);
      }
    }, ANIMATION_SPEED_MS);

    return () => clearInterval(interval);
  }, []);

  // Calculate vertical position based on rank
  // REVERSED: 1st place at summit (75% from bottom = high), lower ranks at base
  const getVerticalPosition = (rank: number) => {
    if (rank === 1) return 75; // Highest - at summit
    if (rank === 2) return 70;
    if (rank === 3) return 65;
    if (rank <= 6) return 60 - (rank - 4) * 5;
    if (rank <= 9) return 45 - (rank - 7) * 3;
    return Math.max(20, 35 - (rank - 10) * 2); // Lowest ranks at base
  };

  // Calculate horizontal position - spread climbers across the mountain
  // Use index to stagger positions and avoid overlap
  const getHorizontalPosition = (idx: number, total: number) => {
    // Distribute across 20-80% of width
    const positions = [30, 45, 60, 75, 25, 50, 70, 35, 65, 40, 55, 80];
    return positions[idx % positions.length];
  };

  const bottomPercent = getVerticalPosition(user.rank);
  const leftPercent = getHorizontalPosition(index, totalUsers);

  return (
    <div
      className="absolute"
      style={{
        bottom: `${bottomPercent}%`,
        left: `${leftPercent}%`,
        transform: "translateX(-50%)",
        zIndex: 100 - user.rank, // Higher ranks on top
      }}
    >
      {/* Username label */}
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-green-800 bg-gradient-to-r from-green-700 to-blue-700 px-3 py-1 text-center text-xs font-bold text-white shadow-xl"
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "0.5rem",
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        #{user.rank} {user.display_name || user.github_username}
      </div>

      {/* Animated climber sprite with unique color */}
      <div
        style={{
          width: FRAME_WIDTH * SCALE,
          height: FRAME_HEIGHT * SCALE,
          overflow: "hidden",
          imageRendering: "pixelated",
          filter: `hue-rotate(${(index * 40) % 360}deg) saturate(1.2)`,
        }}
      >
        <div
          style={{
            width: FRAME_COUNT * FRAME_WIDTH * SCALE,
            height: FRAME_HEIGHT * SCALE,
            backgroundImage: "url(/sprites/climberSpriteSheet.png)",
            backgroundSize: `${FRAME_COUNT * FRAME_WIDTH * SCALE}px ${FRAME_HEIGHT * SCALE}px`,
            backgroundRepeat: "no-repeat",
            transform: `translateX(-${frame * FRAME_WIDTH * SCALE}px)`,
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}
