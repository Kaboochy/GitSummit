"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NationalParkLayout from "@/components/NationalParkLayout";
import MountainVisualization from "@/components/MountainVisualization";
import WoodenSign from "@/components/WoodenSign";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Climber {
  user_id: string;
  github_username: string;
  github_avatar_url?: string;
  weekly_score: number;
  lifetime_score: number;
  rank: number;
  is_current_user?: boolean;
}

export default function FriendsLeaderboardPage() {
  const router = useRouter();
  const [climbers, setClimbers] = useState<Climber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    fetchLeaderboard();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard/friends");
      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (data.error) {
        setError(data.error);
      } else {
        setClimbers(data.leaderboard);
        setCurrentUser(data.current_user);
      }
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NationalParkLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <WoodenSign size="large" variant="secondary">
              👥 Friends Summit Leaderboard
            </WoodenSign>
          </div>
          <p className="text-green-900 font-bold text-lg font-mono">
            Compete with your GitHub mutual followers
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">⛰️</div>
            <p className="text-green-900 font-bold font-mono">
              Loading your friends...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <WoodenSign variant="warning">⚠️ {error}</WoodenSign>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && !error && (
          <>
            {climbers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👥</div>
                <div className="max-w-lg mx-auto">
                  <WoodenSign>
                    <div className="space-y-2">
                      <p>No friends found!</p>
                      <p className="text-sm">
                        Follow developers on GitHub and have them follow you back to see
                        them here.
                      </p>
                    </div>
                  </WoodenSign>
                </div>
              </div>
            ) : (
              <>
                {/* Mountain Visualization */}
                <div className="mb-8">
                  <MountainVisualization climbers={climbers} type="friends" />
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white/90 backdrop-blur rounded-lg border-4 border-green-900 shadow-2xl overflow-hidden">
                  <div className="bg-green-900 px-6 py-4 border-b-4 border-green-950">
                    <h2 className="text-amber-400 font-bold text-xl font-mono">
                      📊 Detailed Rankings
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-green-800 text-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left font-mono">Rank</th>
                          <th className="px-6 py-3 text-left font-mono">Climber</th>
                          <th className="px-6 py-3 text-right font-mono">
                            Weekly Score
                          </th>
                          <th className="px-6 py-3 text-right font-mono">
                            Lifetime Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {climbers.map((climber) => (
                          <tr
                            key={climber.user_id}
                            className={`border-t-2 border-green-200 hover:bg-green-50 transition-colors cursor-pointer ${
                              climber.is_current_user ? "bg-yellow-50" : ""
                            }`}
                            onClick={() =>
                              (window.location.href = `/profile/${climber.github_username}`)
                            }
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg font-mono">
                                  #{climber.rank}
                                </span>
                                {climber.rank === 1 && <span>🥇</span>}
                                {climber.rank === 2 && <span>🥈</span>}
                                {climber.rank === 3 && <span>🥉</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {climber.github_avatar_url && (
                                  <img
                                    src={climber.github_avatar_url}
                                    alt={climber.github_username}
                                    className="w-10 h-10 rounded-full border-2 border-green-600"
                                  />
                                )}
                                <div>
                                  <span className="font-bold text-green-900 font-mono">
                                    {climber.github_username}
                                  </span>
                                  {climber.is_current_user && (
                                    <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full font-bold font-mono">
                                {climber.weekly_score}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-gray-700 font-mono">
                                {climber.lifetime_score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-amber-100 border-4 border-amber-600 rounded-lg p-6">
                  <p className="text-amber-900 font-bold font-mono text-center">
                    ℹ️ Top 3 friends win trophies every Monday at 12:00 PM UTC!
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </NationalParkLayout>
  );
}
