"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Trophy, Medal, Award, Loader2, ArrowLeft } from "lucide-react";
import { MountainClimbers } from "@/components/leaderboard/MountainClimbers";
import Link from "next/link";

interface LeaderboardUser {
  id: string;
  github_username: string;
  avatar_url: string;
  display_name: string;
  total_points: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Split top 3 and the rest
  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="relative min-h-screen">
      {/* Background Image - Full opacity mountain */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/sprites/ElCapoochyBannerHigh.png)",
          imageRendering: "pixelated",
          filter: "brightness(1.15) contrast(1.1)",
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-sky-300/20 via-transparent to-green-900/30 dark:from-sky-950/30 dark:via-transparent dark:to-green-950/50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 border-4 border-stone-900 bg-stone-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-stone-700 dark:border-black dark:bg-stone-900"
        style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-yellow-400 drop-shadow-lg" style={{ filter: "drop-shadow(0 0 15px rgba(251, 191, 36, 0.8))" }} />
        <h1
          className="mt-3 text-4xl font-bold text-white drop-shadow-2xl"
          style={{
            fontFamily: "var(--font-pixel)",
            textShadow: "0 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(91,163,208,0.4)"
          }}
        >
          Summit Leaderboard
        </h1>
        <p className="mt-2 text-lg font-medium text-white drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
          Top climbers conquering the mountain
        </p>
      </div>

      {/* Mountain Climbers Visualization */}
      {users.length > 0 && <MountainClimbers users={users} />}

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="mb-8 flex items-end justify-center gap-4">
          {/* 2nd place */}
          {top3[1] && (
            <PodiumCard user={top3[1]} place={2} />
          )}
          {/* 1st place */}
          {top3[0] && (
            <PodiumCard user={top3[0]} place={1} />
          )}
          {/* 3rd place */}
          {top3[2] && (
            <PodiumCard user={top3[2]} place={3} />
          )}
        </div>
      )}

      {/* Empty state */}
      {users.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            No climbers yet!
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            Sign in, link a repo, and start pushing code to claim the #1 spot.
          </p>
        </div>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {rest.map((user) => {
            const isCurrentUser =
              session?.user?.githubUsername === user.github_username;

            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800 ${
                  isCurrentUser
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }`}
              >
                {/* Rank */}
                <span className="w-8 text-center text-sm font-bold text-zinc-400 dark:text-zinc-500">
                  #{user.rank}
                </span>

                {/* Avatar */}
                {user.avatar_url && (
                  <Image
                    src={user.avatar_url}
                    alt={user.github_username}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.display_name || user.github_username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    @{user.github_username}
                  </p>
                </div>

                {/* Points */}
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {user.total_points}
                </span>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

/** Podium card for top 3 users */
function PodiumCard({
  user,
  place,
}: {
  user: LeaderboardUser;
  place: 1 | 2 | 3;
}) {
  const heights = { 1: "h-36", 2: "h-28", 3: "h-24" };
  const colors = {
    1: "from-yellow-400 to-yellow-500",
    2: "from-zinc-300 to-zinc-400",
    3: "from-amber-600 to-amber-700",
  };
  const icons = {
    1: <Trophy className="h-6 w-6 text-yellow-500" />,
    2: <Medal className="h-5 w-5 text-zinc-400" />,
    3: <Award className="h-5 w-5 text-amber-600" />,
  };
  const sizes = { 1: 72, 2: 56, 3: 56 };

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className="mb-2">{icons[place]}</div>

      {/* Avatar */}
      {user.avatar_url && (
        <Image
          src={user.avatar_url}
          alt={user.github_username}
          width={sizes[place]}
          height={sizes[place]}
          className={`rounded-full border-2 ${
            place === 1 ? "border-yellow-400" : place === 2 ? "border-zinc-300" : "border-amber-600"
          }`}
        />
      )}

      {/* Name + Points */}
      <p className="mt-2 text-sm font-semibold truncate max-w-[100px]">
        {user.display_name || user.github_username}
      </p>
      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
        {user.total_points}
      </p>

      {/* Podium bar */}
      <div
        className={`${heights[place]} w-20 rounded-t-lg bg-gradient-to-t ${colors[place]} mt-2 flex items-center justify-center`}
      >
        <span className="text-2xl font-black text-white">#{place}</span>
      </div>
    </div>
  );
}
