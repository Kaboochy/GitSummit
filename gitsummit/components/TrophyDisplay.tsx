"use client";

interface TrophyDisplayProps {
  gold: number;
  silver: number;
  bronze: number;
  size?: "small" | "medium" | "large";
}

export default function TrophyDisplay({
  gold,
  silver,
  bronze,
  size = "medium",
}: TrophyDisplayProps) {
  const sizeClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl",
  };

  const countSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <div className="flex gap-4 items-center">
      {/* Gold Trophy */}
      <div className="flex items-center gap-1">
        <span className={sizeClasses[size]}>🥇</span>
        <span className={`font-bold text-yellow-600 ${countSizeClasses[size]}`}>
          {gold}
        </span>
      </div>

      {/* Silver Trophy */}
      <div className="flex items-center gap-1">
        <span className={sizeClasses[size]}>🥈</span>
        <span className={`font-bold text-gray-500 ${countSizeClasses[size]}`}>
          {silver}
        </span>
      </div>

      {/* Bronze Trophy */}
      <div className="flex items-center gap-1">
        <span className={sizeClasses[size]}>🥉</span>
        <span className={`font-bold text-amber-700 ${countSizeClasses[size]}`}>
          {bronze}
        </span>
      </div>
    </div>
  );
}
