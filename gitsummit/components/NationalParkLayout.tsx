"use client";

import { useRouter } from "next/navigation";
import WoodenSign from "./WoodenSign";

interface NationalParkLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function NationalParkLayout({
  children,
  showNav = true,
}: NationalParkLayoutProps) {
  const router = useRouter();

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom, #87CEEB 0%, #98D8C8 50%, #7FA876 100%)",
      }}
    >
      {/* Navigation */}
      {showNav && (
        <nav className="bg-green-900 border-b-4 border-green-950 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-3 hover:scale-105 transition-transform"
              >
                <div className="text-4xl">⛰️</div>
                <div>
                  <h1
                    className="text-2xl font-bold text-amber-400"
                    style={{
                      fontFamily: "monospace",
                      textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
                    }}
                  >
                    GitSummit
                  </h1>
                  <p className="text-xs text-green-200 uppercase tracking-wider">
                    Climb with every commit
                  </p>
                </div>
              </button>

              {/* Navigation Links */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/leaderboard/global")}
                  className="text-white hover:text-amber-400 transition-colors"
                >
                  <WoodenSign size="small">🌍 Global</WoodenSign>
                </button>
                <button
                  onClick={() => router.push("/leaderboard/friends")}
                  className="text-white hover:text-amber-400 transition-colors"
                >
                  <WoodenSign size="small" variant="secondary">
                    👥 Friends
                  </WoodenSign>
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-white hover:text-amber-400 transition-colors"
                >
                  <WoodenSign size="small" variant="secondary">
                    📊 Dashboard
                  </WoodenSign>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="relative">
        {/* Pine trees decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="text-6xl absolute top-10 left-10">🌲</div>
          <div className="text-6xl absolute top-32 right-20">🌲</div>
          <div className="text-6xl absolute bottom-40 left-32">🌲</div>
          <div className="text-6xl absolute bottom-20 right-40">🌲</div>
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-green-950 text-green-200 py-6 mt-20 border-t-4 border-green-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-mono">
            🏔️ GitSummit - Climb with every commit
          </p>
          <p className="text-xs text-green-400 mt-2">
            Weekly reset: Every Monday at 12:00 PM UTC
          </p>
        </div>
      </footer>
    </div>
  );
}
