"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { ActivityFeed, type PushEvent } from "@/components/dashboard/ActivityFeed";
import { ClimberDisplay } from "@/components/game/ClimberDisplay";
import { Trophy, GitBranch, Star, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

// No points cap — climber loops the mountain every 50 points

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [totalPoints, setTotalPoints] = useState(0);
  const [repoCount, setRepoCount] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [recentEvents, setRecentEvents] = useState<PushEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setTotalPoints(data.totalPoints || 0);
        setRepoCount(data.repoCount || 0);
        setRank(data.rank || null);
        setRecentEvents(data.recentEvents || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, fetchStats, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) return null;


  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={session.user.avatarUrl || session.user.image || ""}
            alt={session.user.githubUsername || "User"}
            size={64}
          />
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, @{session.user.githubUsername}!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Push code, earn points, reach the summit.
            </p>
          </div>
        </div>

        {/* Sync button */}
        <SyncButton
          onSyncComplete={(data) => {
            setTotalPoints(data.totalPoints);
            fetchStats(); // refresh everything
          }}
        />
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Points</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalPoints}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Rank</p>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {rank ? `#${rank}` : "--"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Linked Repos
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold">{repoCount}</p>
            <Link
              href="/profile"
              className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <LinkIcon className="h-3 w-3" />
              Manage
            </Link>
          </div>
        </div>
      </div>

      {/* Climber + Activity side by side */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Climber Display */}
        <ClimberDisplay totalPoints={totalPoints} />

        {/* Activity Feed */}
        <ActivityFeed events={recentEvents} />
      </div>

      {/* Quick tip if no repos linked */}
      {repoCount === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-700 dark:bg-emerald-900/20">
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            Get started
          </p>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
            Head to your{" "}
            <Link href="/profile" className="underline font-medium">
              Profile
            </Link>{" "}
            to link a repo, then come back and hit &quot;Sync Now&quot; to earn
            points!
          </p>
        </div>
      )}
    </div>
  );
}
