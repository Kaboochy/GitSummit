"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { ActivityFeed, type PushEvent } from "@/components/dashboard/ActivityFeed";
import { ClimberDisplay } from "@/components/game/ClimberDisplay";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { Trophy, GitBranch, Star, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

// No points cap — climber loops the mountain every 50 points

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
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
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);
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
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: "url(/sprites/ElCapoochyBannerLow.png)",
          imageRendering: "pixelated",
          filter: "brightness(1.1) contrast(1.05)",
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-green-900/30 dark:from-sky-950/30 dark:via-transparent dark:to-green-950/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={session.user.avatarUrl || session.user.image || ""}
            alt={session.user.githubUsername || "User"}
            size={64}
          />
          <div>
            <h1
              className="text-2xl font-bold text-white drop-shadow-lg"
              style={{
                fontFamily: "var(--font-pixel)",
                textShadow: "0 2px 6px rgba(0,0,0,0.8)",
              }}
            >
              Welcome back, @{session.user.githubUsername}!
            </h1>
            <p
              className="text-white drop-shadow-lg"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.7)" }}
            >
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

      {/* Streak Display */}
      <div className="mt-8">
        <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="border-4 border-stone-900 bg-green-700 p-6 shadow-lg dark:border-black dark:bg-green-800">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-300" />
            <p
              className="text-white"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
            >
              Points
            </p>
          </div>
          <p
            className="mt-2 text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {totalPoints}
          </p>
        </div>

        <div className="border-4 border-stone-900 bg-blue-700 p-6 shadow-lg dark:border-black dark:bg-blue-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <p
              className="text-white"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
            >
              Rank
            </p>
          </div>
          <p
            className="mt-2 text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {rank ? `#${rank}` : "--"}
          </p>
        </div>

        <div className="border-4 border-stone-900 bg-teal-700 p-6 shadow-lg dark:border-black dark:bg-teal-800">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-yellow-300" />
            <p
              className="text-white"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
            >
              Linked Repos
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {repoCount}
            </p>
            <Link
              href="/profile"
              className="flex items-center gap-1 border-2 border-stone-900 bg-stone-800 px-2 py-1 text-white transition-colors hover:bg-stone-700"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
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
        <div className="mt-6 border-4 border-dashed border-green-800 bg-green-600 p-6 text-center shadow-lg dark:border-green-900 dark:bg-green-800">
          <p
            className="font-bold text-white"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "0.875rem" }}
          >
            Get started
          </p>
          <p className="mt-2 text-sm text-white">
            Head to your{" "}
            <Link
              href="/profile"
              className="font-bold underline"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              Profile
            </Link>{" "}
            to link a repo, then come back and hit &quot;Sync Now&quot; to earn
            points!
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
