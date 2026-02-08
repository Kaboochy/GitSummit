"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NationalParkLayout from "@/components/NationalParkLayout";
import WoodenSign from "@/components/WoodenSign";
import TrophyDisplay from "@/components/TrophyDisplay";

interface UserProfile {
  user_id: string;
  github_username: string;
  github_avatar_url?: string;
  github_profile_url?: string;
  lifetime_score: number;
  weekly_score: number;
  weekly_rank?: number;
  created_at: string;
}

interface Trophies {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  recent: any[];
}

interface Commit {
  commit_id: string;
  sha: string;
  repo_name: string;
  commit_message: string;
  commit_url: string;
  points_awarded: number;
  committed_at: string;
  additions: number;
  deletions: number;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trophies, setTrophies] = useState<Trophies | null>(null);
  const [recentCommits, setRecentCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${username}`);
      const data = await response.json();

      if (response.status === 404) {
        setError("User not found");
      } else if (data.error) {
        setError(data.error);
      } else {
        setProfile(data.user);
        setTrophies(data.trophies);
        setRecentCommits(data.recent_commits);
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <NationalParkLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4 animate-bounce">⛰️</div>
          <p className="text-green-900 font-bold font-mono">Loading profile...</p>
        </div>
      </NationalParkLayout>
    );
  }

  if (error || !profile) {
    return (
      <NationalParkLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <WoodenSign variant="warning">⚠️ {error || "Profile not found"}</WoodenSign>
        </div>
      </NationalParkLayout>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <NationalParkLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-900 shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            {profile.github_avatar_url && (
              <img
                src={profile.github_avatar_url}
                alt={profile.github_username}
                className="w-32 h-32 rounded-full border-4 border-green-600 shadow-lg"
              />
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-green-900 font-mono mb-2">
                {profile.github_username}
              </h1>

              {profile.github_profile_url && (
                <a
                  href={profile.github_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                >
                  View on GitHub →
                </a>
              )}

              <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-blue-100 px-4 py-2 rounded-lg border-2 border-blue-600">
                  <div className="text-xs text-blue-800 font-bold uppercase">
                    Weekly Score
                  </div>
                  <div className="text-2xl font-bold text-blue-900 font-mono">
                    {profile.weekly_score}
                  </div>
                </div>

                <div className="bg-purple-100 px-4 py-2 rounded-lg border-2 border-purple-600">
                  <div className="text-xs text-purple-800 font-bold uppercase">
                    Lifetime Score
                  </div>
                  <div className="text-2xl font-bold text-purple-900 font-mono">
                    {profile.lifetime_score}
                  </div>
                </div>

                {profile.weekly_rank && (
                  <div className="bg-yellow-100 px-4 py-2 rounded-lg border-2 border-yellow-600">
                    <div className="text-xs text-yellow-800 font-bold uppercase">
                      Weekly Rank
                    </div>
                    <div className="text-2xl font-bold text-yellow-900 font-mono">
                      #{profile.weekly_rank}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-sm mt-4 font-mono">
                🏔️ Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Trophy Case */}
        {trophies && trophies.total > 0 && (
          <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-amber-600 shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900 font-mono">
                🏆 Trophy Case
              </h2>
              <div className="bg-amber-200 px-3 py-1 rounded-full border-2 border-amber-600">
                <span className="font-bold text-amber-900 font-mono">
                  {trophies.total} Total
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

            {/* Recent Trophies */}
            {trophies.recent.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-amber-300">
                <h3 className="text-sm font-bold text-amber-800 uppercase mb-3">
                  Recent Wins
                </h3>
                <div className="space-y-2">
                  {trophies.recent.map((trophy: any) => (
                    <div
                      key={trophy.trophy_id}
                      className="flex items-center justify-between bg-amber-50 px-4 py-2 rounded border border-amber-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {trophy.trophy_type === "gold"
                            ? "🥇"
                            : trophy.trophy_type === "silver"
                            ? "🥈"
                            : "🥉"}
                        </span>
                        <span className="font-mono text-sm">
                          {trophy.leaderboard_type === "global"
                            ? "🌍 Global"
                            : "👥 Friends"}{" "}
                          - Week of{" "}
                          {new Date(trophy.week_start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-sm text-amber-900">
                        {trophy.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Commits */}
        <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-900 shadow-2xl overflow-hidden">
          <div className="bg-green-900 px-6 py-4 border-b-4 border-green-950">
            <h2 className="text-amber-400 font-bold text-xl font-mono">
              📝 Recent Commits
            </h2>
          </div>

          {recentCommits.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p className="font-mono">No commits yet this week</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-green-200">
              {recentCommits.map((commit) => (
                <div
                  key={commit.commit_id}
                  className="p-4 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <a
                        href={commit.commit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono text-sm font-bold"
                      >
                        {commit.repo_name}
                      </a>
                      <p className="text-gray-800 mt-1 font-mono text-sm">
                        {commit.commit_message.split("\n")[0].slice(0, 80)}
                        {commit.commit_message.length > 80 && "..."}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 font-mono">
                        <span>
                          {new Date(commit.committed_at).toLocaleDateString()}
                        </span>
                        <span>+{commit.additions}</span>
                        <span>-{commit.deletions}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold font-mono text-sm">
                        +{commit.points_awarded}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Weekly Score"
            value={profile.weekly_score}
            emoji="📈"
          />
          <StatCard
            label="Lifetime Score"
            value={profile.lifetime_score}
            emoji="⭐"
          />
          <StatCard label="Gold Trophies" value={trophies?.gold || 0} emoji="🥇" />
          <StatCard
            label="Total Trophies"
            value={trophies?.total || 0}
            emoji="🏆"
          />
        </div>
      </div>
    </NationalParkLayout>
  );
}

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-700 p-4 text-center">
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-2xl font-bold text-green-900 font-mono">{value}</div>
      <div className="text-xs text-gray-600 font-mono uppercase">{label}</div>
    </div>
  );
}
