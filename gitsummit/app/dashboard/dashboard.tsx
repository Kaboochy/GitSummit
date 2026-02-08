"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import NationalParkLayout from "@/components/NationalParkLayout";
import WoodenSign from "@/components/WoodenSign";
import TrophyDisplay from "@/components/TrophyDisplay";
import LogoutButton from "./logout-button";

interface UserStats {
  github_username: string;
  github_avatar_url?: string;
  weekly_score: number;
  lifetime_score: number;
  weekly_rank?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [trophies, setTrophies] = useState({ gold: 0, silver: 0, bronze: 0 });
  const [loading, setLoading] = useState(true);
  const [syncingFriends, setSyncingFriends] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = supabaseBrowser();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      // Get user profile from GitSummit database
      const response = await fetch(
        `/api/user/${userData.user.user_metadata?.user_name || "unknown"}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          github_username: data.user.github_username,
          github_avatar_url: data.user.github_avatar_url,
          weekly_score: data.user.weekly_score,
          lifetime_score: data.user.lifetime_score,
          weekly_rank: data.user.weekly_rank,
        });
        setTrophies({
          gold: data.trophies.gold,
          silver: data.trophies.silver,
          bronze: data.trophies.bronze,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFriends = async () => {
    setSyncingFriends(true);
    try {
      const response = await fetch("/api/friends/sync", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        alert(`✅ Synced ${data.friends_count} friends from GitHub!`);
      } else {
        alert("❌ Failed to sync friends: " + data.error);
      }
    } catch (error) {
      alert("❌ Error syncing friends");
    } finally {
      setSyncingFriends(false);
    }
  };

  if (loading) {
    return (
      <NationalParkLayout>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4 animate-bounce">⛰️</div>
          <p className="text-green-900 font-bold font-mono">Loading your summit...</p>
        </div>
      </NationalParkLayout>
    );
  }

  return (
    <NationalParkLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="inline-block">
            <WoodenSign size="large">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏔️</span>
                <div>
                  <div className="text-sm opacity-75">Welcome to</div>
                  <div className="text-2xl">Your Summit Dashboard</div>
                </div>
              </div>
            </WoodenSign>
          </div>
        </div>

        {/* User Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Weekly Score"
            value={stats?.weekly_score || 0}
            emoji="📈"
            color="blue"
          />
          <StatCard
            label="Lifetime Score"
            value={stats?.lifetime_score || 0}
            emoji="⭐"
            color="purple"
          />
          <StatCard
            label="Weekly Rank"
            value={stats?.weekly_rank ? `#${stats.weekly_rank}` : "-"}
            emoji="🏆"
            color="yellow"
          />
          <StatCard
            label="Daily Limit"
            value="5 commits"
            emoji="🎯"
            color="green"
          />
        </div>

        {/* Trophy Display */}
        <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-amber-600 shadow-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-amber-900 font-mono">
              🏆 Your Trophies
            </h2>
            <div className="bg-amber-200 px-3 py-1 rounded-full border-2 border-amber-600">
              <span className="font-bold text-amber-900 font-mono">
                {trophies.gold + trophies.silver + trophies.bronze} Total
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <TrophyDisplay
              gold={trophies.gold}
              silver={trophies.silver}
              bronze={trophies.bronze}
              size="large"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push("/leaderboard/global")}
            className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-700 p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-2">🌍</div>
            <div className="font-bold text-green-900 font-mono">Global Leaderboard</div>
            <div className="text-sm text-gray-600 mt-1">
              See where you rank worldwide
            </div>
          </button>

          <button
            onClick={() => router.push("/leaderboard/friends")}
            className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-700 p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-2">👥</div>
            <div className="font-bold text-green-900 font-mono">Friends Leaderboard</div>
            <div className="text-sm text-gray-600 mt-1">
              Compete with mutual followers
            </div>
          </button>

          <button
            onClick={() =>
              stats?.github_username &&
              router.push(`/profile/${stats.github_username}`)
            }
            className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-700 p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-2">👤</div>
            <div className="font-bold text-green-900 font-mono">Your Profile</div>
            <div className="text-sm text-gray-600 mt-1">
              View your stats and trophies
            </div>
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-900 shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-900 font-mono mb-4">
            📚 How GitSummit Works
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <InfoItem
                emoji="💪"
                title="Earn Points"
                description="Commits are scored 1-5 points based on size (additions + deletions)"
              />
              <InfoItem
                emoji="🎯"
                title="Daily Cap"
                description="Only your first 5 commits each day count (max 25 points/day)"
              />
              <InfoItem
                emoji="📅"
                title="Weekly Reset"
                description="Leaderboards reset every Monday at 12:00 PM UTC"
              />
            </div>
            <div className="space-y-3">
              <InfoItem
                emoji="🏆"
                title="Win Trophies"
                description="Top 3 on each leaderboard get gold, silver, or bronze trophies"
              />
              <InfoItem
                emoji="⭐"
                title="Lifetime Points"
                description="Your all-time score is saved and displayed on your profile"
              />
              <InfoItem
                emoji="🧗"
                title="Climb Higher"
                description="Your rank determines your position on the mountain!"
              />
            </div>
          </div>
        </div>

        {/* Settings & Actions */}
        <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-900 shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-green-900 font-mono mb-4">
            ⚙️ Settings & Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/settings")}
              className="w-full text-left"
            >
              <WoodenSign size="small">
                <div className="flex items-center justify-between">
                  <span>🔗 Connect GitHub App</span>
                  <span className="text-xs">→</span>
                </div>
              </WoodenSign>
            </button>

            <button onClick={handleSyncFriends} disabled={syncingFriends}>
              <WoodenSign size="small" variant="secondary">
                <div className="flex items-center justify-between">
                  <span>
                    {syncingFriends ? "Syncing..." : "🔄 Sync GitHub Friends"}
                  </span>
                  <span className="text-xs">→</span>
                </div>
              </WoodenSign>
            </button>

            <LogoutButton />
          </div>
        </div>
      </div>
    </NationalParkLayout>
  );
}

function StatCard({
  label,
  value,
  emoji,
  color,
}: {
  label: string;
  value: number | string;
  emoji: string;
  color: "blue" | "purple" | "yellow" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-100 border-blue-600 text-blue-900",
    purple: "bg-purple-100 border-purple-600 text-purple-900",
    yellow: "bg-yellow-100 border-yellow-600 text-yellow-900",
    green: "bg-green-100 border-green-600 text-green-900",
  };

  return (
    <div
      className={`${colorClasses[color]} rounded-lg border-4 p-6 text-center shadow-lg`}
    >
      <div className="text-4xl mb-2">{emoji}</div>
      <div className="text-3xl font-bold font-mono">{value}</div>
      <div className="text-xs uppercase font-mono mt-1 opacity-75">{label}</div>
    </div>
  );
}

function InfoItem({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-2xl flex-shrink-0">{emoji}</div>
      <div>
        <div className="font-bold text-green-900 font-mono text-sm">{title}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </div>
  );
}
