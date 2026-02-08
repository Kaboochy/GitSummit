import { Mountain, Github, Trophy, Users } from "lucide-react";
import { SignInButton } from "@/components/auth/SignInButton";
import { TopClimbers } from "@/components/leaderboard/TopClimbers";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: "url(/sprites/ElCapoochyBannerLow.png)",
          imageRendering: "pixelated",
          filter: "brightness(1.1) contrast(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/30 via-transparent to-green-900/40 dark:from-sky-900/40 dark:via-transparent dark:to-green-950/60" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-6 text-center">
        <Mountain className="h-20 w-20 text-white drop-shadow-lg" style={{ filter: "drop-shadow(0 0 20px rgba(91, 163, 208, 0.6))" }} />
        <h1
          className="text-5xl font-bold tracking-tight sm:text-6xl text-white drop-shadow-2xl"
          style={{
            fontFamily: "var(--font-pixel)",
            textShadow: "0 4px 12px rgba(0,0,0,0.5), 0 0 40px rgba(91,163,208,0.3)"
          }}
        >
          Code More. Climb Higher.
        </h1>
        <p className="max-w-md text-xl font-medium text-white drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
          Every push to GitHub earns you points. Build streaks and summit the leaderboard.
        </p>
        <SignInButton />
      </div>

      {/* Feature cards */}
      <div className="mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
        <div
          className="group flex flex-col items-center gap-3 rounded-xl border-4 border-green-800 bg-gradient-to-br from-green-700 via-green-800 to-green-900 p-6 text-center shadow-2xl transition-all hover:scale-105 hover:shadow-green-500/50 dark:border-green-900 dark:from-green-900 dark:to-green-950"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <Github className="h-10 w-10 text-blue-200 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}>Link Your Repos</h3>
          <p className="text-sm text-green-100">
            Track repositories. Every push earns points and builds your streak.
          </p>
        </div>
        <div
          className="group flex flex-col items-center gap-3 rounded-xl border-4 border-blue-700 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 text-center shadow-2xl transition-all hover:scale-105 hover:shadow-blue-500/50 dark:border-blue-900 dark:from-blue-900 dark:to-blue-950"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <Trophy className="h-10 w-10 text-yellow-300 transition-transform group-hover:scale-110 group-hover:rotate-12" />
          <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}>Climb the Summit</h3>
          <p className="text-sm text-blue-100">
            Watch your climber ascend the mountain as you rank higher.
          </p>
        </div>
        <div
          className="group flex flex-col items-center gap-3 rounded-xl border-4 border-teal-700 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-6 text-center shadow-2xl transition-all hover:scale-105 hover:shadow-teal-500/50 dark:border-teal-900 dark:from-teal-900 dark:to-teal-950"
          style={{ backdropFilter: "blur(10px)" }}
        >
          <Users className="h-10 w-10 text-green-200 transition-transform group-hover:scale-110" />
          <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}>Join Climbing Gyms</h3>
          <p className="text-sm text-teal-100">
            Create gyms and compete with your climbing crew.
          </p>
        </div>
      </div>

      {/* Top Climbers Preview */}
      <TopClimbers />
      </div>
    </div>
  );
}
