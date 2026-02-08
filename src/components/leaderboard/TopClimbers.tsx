"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

interface LeaderboardUser {
  id: string;
  github_username: string;
  avatar_url: string;
  display_name: string;
  total_points: number;
  rank: number;
}

export function TopClimbers() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTop() {
      try {
        const res = await fetch("/api/leaderboard?limit=5");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Failed to fetch top climbers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTop();
  }, []);

  if (loading || users.length === 0) return null;

  return (
    <div className="mt-16 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Climbers
        </h2>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800"
          >
            <span className="w-6 text-center text-sm font-bold text-zinc-400">
              #{user.rank}
            </span>
            {user.avatar_url && (
              <Image
                src={user.avatar_url}
                alt={user.github_username}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="flex-1 truncate text-sm font-medium">
              {user.display_name || user.github_username}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {user.total_points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
