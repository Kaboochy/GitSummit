"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Climber {
  user_id: string;
  github_username: string;
  github_avatar_url?: string;
  weekly_score: number;
  rank: number;
  is_current_user?: boolean;
}

interface MountainVisualizationProps {
  climbers: Climber[];
  type?: "global" | "friends";
}

export default function MountainVisualization({
  climbers,
  type = "global",
}: MountainVisualizationProps) {
  const router = useRouter();
  const [hoveredClimber, setHoveredClimber] = useState<string | null>(null);

  /**
   * Calculate climber position on mountain
   * Top 1st place is at ~85% height, last place at ~15% height
   */
  const getClimberPosition = (rank: number, totalClimbers: number) => {
    // Mountain climbing path (rough percentages from bottom to top)
    const minHeight = 15; // Bottom of mountain
    const maxHeight = 85; // Near summit

    // Calculate position based on rank (inverse - rank 1 is highest)
    const normalizedRank = (rank - 1) / Math.max(totalClimbers - 1, 1);
    const heightPercent = maxHeight - normalizedRank * (maxHeight - minHeight);

    // Add some horizontal variance for visual interest
    // Create a winding path effect
    const baseX = 50; // Center
    const pathVariance = Math.sin(normalizedRank * Math.PI * 2) * 15;
    const xPercent = baseX + pathVariance;

    return {
      top: `${100 - heightPercent}%`,
      left: `${xPercent}%`,
    };
  };

  const handleClimberClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className="relative w-full h-[600px] md:h-[800px] overflow-hidden rounded-lg">
      {/* Mountain Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/ElCapoochy.png')",
          imageRendering: "pixelated",
        }}
      />

      {/* Climbers */}
      {climbers.map((climber) => {
        const position = getClimberPosition(climber.rank, climbers.length);

        return (
          <div
            key={climber.user_id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={{
              top: position.top,
              left: position.left,
            }}
            onClick={() => handleClimberClick(climber.github_username)}
            onMouseEnter={() => setHoveredClimber(climber.user_id)}
            onMouseLeave={() => setHoveredClimber(null)}
          >
            {/* Username Label */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
              <div
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  climber.is_current_user
                    ? "bg-yellow-500 text-black"
                    : "bg-green-800 text-white"
                } ${
                  hoveredClimber === climber.user_id
                    ? "scale-110 shadow-lg"
                    : "scale-100"
                }`}
                style={{
                  fontFamily: "monospace",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                #{climber.rank} {climber.github_username}
              </div>
            </div>

            {/* Climber Sprite */}
            <div
              className="relative w-8 h-8 md:w-12 md:h-12"
              style={{
                imageRendering: "pixelated",
              }}
            >
              {/* Animated climber using sprite sheet */}
              <div
                className="climber-sprite"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: "url('/assets/climberSpriteSheet.png')",
                  backgroundSize: "400%", // 4 frames in sprite sheet
                  animation: "climb 1s steps(4) infinite",
                  imageRendering: "pixelated",
                }}
              />

              {/* Score Badge */}
              <div
                className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white"
                style={{
                  fontSize: "0.65rem",
                }}
              >
                {climber.weekly_score}
              </div>
            </div>

            {/* Hover Tooltip */}
            {hoveredClimber === climber.user_id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black bg-opacity-90 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-10">
                <div className="font-bold">{climber.github_username}</div>
                <div className="text-gray-300">Score: {climber.weekly_score}</div>
                <div className="text-gray-300">Rank: #{climber.rank}</div>
                <div className="text-gray-400 text-xs mt-1">Click to view profile</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Summit Trophy for #1 */}
      {climbers.length > 0 && (
        <div
          className="absolute transform -translate-x-1/2"
          style={{
            top: "8%",
            left: "50%",
          }}
        >
          <div className="text-4xl animate-bounce">🏆</div>
        </div>
      )}

      {/* Leaderboard Type Badge */}
      <div className="absolute top-4 left-4 bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-600">
        <div className="text-xs font-bold uppercase tracking-wider">
          {type === "global" ? "🌍 Global Summit" : "👥 Friends Summit"}
        </div>
      </div>

      {/* Style for climber animation */}
      <style jsx>{`
        @keyframes climb {
          from {
            background-position-x: 0%;
          }
          to {
            background-position-x: 100%;
          }
        }
      `}</style>
    </div>
  );
}
