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
    <div className="relative w-full border-4 border-stone-900 bg-green-700 p-5 shadow-lg dark:border-black dark:bg-green-800">
      <p
        className="mb-4 text-center font-bold text-white"
        style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}
      >
        Climbing Progress
      </p>

      {/* Mountain + Climber container */}
      <div className="relative mx-auto overflow-hidden border-4 border-stone-900 dark:border-black" style={{ width: 288, height: 288 }}>
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
        <p
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          {totalPoints}
        </p>
        <p className="text-sm text-white">
          {totalPoints === 1 ? "point" : "points"} earned
          {timesClimbed > 0 && (
            <span className="ml-1 font-bold" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}>
              · {timesClimbed} summit{timesClimbed !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
