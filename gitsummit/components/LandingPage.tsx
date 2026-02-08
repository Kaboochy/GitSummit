"use client";

import { useRouter } from "next/navigation";
import WoodenSign from "./WoodenSign";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();

  const handleSignIn = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(to bottom, #87CEEB 0%, #98D8C8 50%, #7FA876 100%)",
      }}
    >
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {/* Logo */}
        <div className="text-8xl mb-6 animate-bounce">⛰️</div>

        {/* Title */}
        <h1
          className="text-6xl md:text-8xl font-bold text-green-900 mb-4 text-center"
          style={{
            fontFamily: "monospace",
            textShadow:
              "4px 4px 0px rgba(255,255,255,0.3), 6px 6px 0px rgba(0,0,0,0.2)",
          }}
        >
          GitSummit
        </h1>

        {/* Tagline */}
        <p
          className="text-2xl md:text-3xl text-amber-900 font-bold mb-8 text-center"
          style={{
            fontFamily: "monospace",
            textShadow: "2px 2px 0px rgba(255,255,255,0.5)",
          }}
        >
          Climb with every commit 🧗
        </p>

        {/* Description */}
        <div className="max-w-2xl bg-white/90 backdrop-blur rounded-lg p-8 mb-8 border-4 border-green-900 shadow-2xl">
          <div className="space-y-4 text-green-950">
            <p className="text-lg leading-relaxed">
              <strong className="text-green-800">Turn your GitHub commits into an epic
              climbing adventure!</strong> 🏔️
            </p>

            <p className="text-base leading-relaxed">
              GitSummit tracks your commits and places you on a mountain with your
              friends and developers worldwide. The more quality code you commit, the
              higher you climb!
            </p>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl mb-2">💪</div>
                <p className="font-bold text-sm">Earn 1-5 Points</p>
                <p className="text-xs text-gray-700">Based on commit size</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-bold text-sm">Win Trophies</p>
                <p className="text-xs text-gray-700">Weekly leaderboard rewards</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🧗</div>
                <p className="font-bold text-sm">Climb Together</p>
                <p className="text-xs text-gray-700">Compete with friends</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-green-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                ✨ <strong>Max 25 points per day</strong> (5 commits) to encourage
                quality over spam
                <br />
                📅 <strong>Weekly resets</strong> every Monday at noon UTC
                <br />
                🎖️ <strong>Lifetime points</strong> and trophy collection on your
                profile
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSignIn}
          className="transform hover:scale-105 transition-all duration-200"
        >
          <WoodenSign size="large">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <span>Start Climbing with GitHub</span>
            </div>
          </WoodenSign>
        </button>

        <p className="text-sm text-green-800 mt-4 font-mono">
          Free forever • No credit card required
        </p>
      </div>

      {/* Mountain Preview */}
      <div className="bg-green-950/30 backdrop-blur py-16 px-4 border-t-4 border-green-900">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-bold text-amber-400 text-center mb-8"
            style={{
              fontFamily: "monospace",
              textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
            }}
          >
            Watch yourself climb El Capoochy! 🗻
          </h2>

          <div className="relative bg-white/10 rounded-lg p-4 border-4 border-amber-600">
            <div
              className="w-full h-64 bg-cover bg-center rounded"
              style={{
                backgroundImage: "url('/assets/ElCapoochy.png')",
                imageRendering: "pixelated",
              }}
            >
              {/* Sample climber preview */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm mb-2">
                    #1 You
                  </div>
                  <div
                    className="w-12 h-12"
                    style={{
                      backgroundImage: "url('/assets/climberSpriteSheet.png')",
                      backgroundSize: "400%",
                      imageRendering: "pixelated",
                      animation: "climb 1s steps(4) infinite",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-white mt-6 text-sm font-mono">
            Your rank determines your position on the mountain!
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-green-900 py-16 px-4 border-t-4 border-green-950">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-amber-400 text-center mb-12"
            style={{
              fontFamily: "monospace",
              textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
            }}
          >
            Why developers love GitSummit
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              emoji="📊"
              title="Track Progress"
              description="Visualize your coding consistency with gamified stats"
            />
            <FeatureCard
              emoji="🎯"
              title="Stay Motivated"
              description="Daily goals and weekly competitions keep you coding"
            />
            <FeatureCard
              emoji="👥"
              title="Friends Compete"
              description="Challenge mutual GitHub followers on your own leaderboard"
            />
            <FeatureCard
              emoji="🌍"
              title="Global Rankings"
              description="See how you rank against developers worldwide"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-950 text-green-200 py-8 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-mono">🏔️ GitSummit - Climb with every commit</p>
          <p className="text-xs text-green-400 mt-2">
            Made with ❤️ for developers who love to code
          </p>
        </div>
      </footer>

      {/* Animation */}
      <style jsx>{`
        @keyframes climb {
          from {
            background-position-x: 0%;
          }
          to {
            background-position-x: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-green-800 border-4 border-green-950 rounded-lg p-6 text-center hover:transform hover:scale-105 transition-all">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-amber-400 font-bold text-lg mb-2 font-mono">{title}</h3>
      <p className="text-green-200 text-sm">{description}</p>
    </div>
  );
}
