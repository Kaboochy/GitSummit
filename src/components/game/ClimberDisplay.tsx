"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * ClimberDisplay - Renders an animated climber ascending the mountain
 * based on the user's point total. No upper limit on points.
 *
 * The climber sprite sheet has 12 frames (32x64 each, 384x64 total).
 * The climber's vertical position scales with points — every 10 points
 * moves the climber higher, and they loop back to the base after reaching the top.
 */

const FRAME_COUNT = 12;
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 64;
const SCALE = 3;
const ANIMATION_SPEED_MS = 180;

// Every 50 points = one full climb up the mountain
const POINTS_PER_CLIMB = 50;

interface ClimberDisplayProps {
  totalPoints: number;
}

export function ClimberDisplay({ totalPoints }: ClimberDisplayProps) {
  const [frame, setFrame] = useState(0);
  const animating = useRef(false);

  useEffect(() => {
    if (totalPoints <= 0) {
      animating.current = false;
      return;
    }

    animating.current = true;
    const interval = setInterval(() => {
      if (animating.current) {
        setFrame((prev) => (prev + 1) % FRAME_COUNT);
      }
    }, ANIMATION_SPEED_MS);

    return () => clearInterval(interval);
  }, [totalPoints]);

  // Calculate climb progress as a loop (0-100%)
  const climbProgress = (totalPoints % POINTS_PER_CLIMB) / POINTS_PER_CLIMB * 100;
  const timesClimbed = Math.floor(totalPoints / POINTS_PER_CLIMB);

  // Climber vertical position: bottom 5% to top 60% of the container
  const climberBottom = 5 + (climbProgress * 0.55);

  return (
    <div className="relative w-full rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Climbing Progress
      </p>

      {/* Mountain + Climber container */}
      <div className="relative mx-auto overflow-hidden rounded-lg" style={{ width: 288, height: 288 }}>
        {/* Mountain background */}
        <Image
          src="/sprites/ElCapoochy.png"
          alt="Mountain"
          width={288}
          height={288}
          className="block"
          style={{ imageRendering: "pixelated" }}
          priority
        />

        {/* Animated climber sprite — fixed position, no jitter */}
        <div
          className="absolute"
          style={{
            width: FRAME_WIDTH * SCALE,
            height: FRAME_HEIGHT * SCALE,
            left: "50%",
            marginLeft: -(FRAME_WIDTH * SCALE) / 2,
            bottom: `${climberBottom}%`,
            overflow: "hidden",
            imageRendering: "pixelated",
            transition: "bottom 0.8s ease-out",
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

      {/* Points counter — no cap */}
      <div className="mt-4 text-center">
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          {totalPoints}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {totalPoints === 1 ? "point" : "points"} earned
          {timesClimbed > 0 && (
            <span className="ml-1 text-emerald-500">
              &middot; {timesClimbed} summit{timesClimbed !== 1 ? "s" : ""} reached
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
