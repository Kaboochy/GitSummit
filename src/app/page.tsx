import { Mountain, Github, Trophy, Users } from "lucide-react";
import { SignInButton } from "@/components/auth/SignInButton";
import { TopClimbers } from "@/components/leaderboard/TopClimbers";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-6 text-center">
        <Mountain className="h-16 w-16 text-emerald-600" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Code More. Climb Higher.
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Every push to GitHub earns you a point. Compete with friends and climb
          the leaderboard.
        </p>
        <SignInButton />
      </div>

      {/* Feature cards */}
      <div className="mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
          <Github className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
          <h3 className="font-semibold">Link Your Repos</h3>
          <p className="text-sm text-zinc-500">
            Choose which repositories to track. Every push earns a point.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
          <Trophy className="h-8 w-8 text-emerald-600" />
          <h3 className="font-semibold">Climb the Leaderboard</h3>
          <p className="text-sm text-zinc-500">
            See how you rank against everyone. Your climber ascends as you code.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
          <Users className="h-8 w-8 text-blue-600" />
          <h3 className="font-semibold">Compete with Friends</h3>
          <p className="text-sm text-zinc-500">
            Create groups and challenge your friends to code more.
          </p>
        </div>
      </div>

      {/* Top Climbers Preview */}
      <TopClimbers />
    </div>
  );
}
