"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Mountain } from "lucide-react";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { UserAvatar } from "@/components/auth/UserAvatar";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="relative z-50 border-b-4 border-stone-900 bg-stone-800 dark:border-black dark:bg-stone-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.875rem" }}>
          <Mountain className="h-6 w-6 text-white" />
          <span>GitSummit</span>
        </Link>

        {/* Nav links + auth */}
        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-bold text-white transition-colors hover:text-yellow-300"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-bold text-white transition-colors hover:text-yellow-300"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
              >
                Leaderboard
              </Link>
              <Link
                href="/groups"
                className="text-sm font-bold text-white transition-colors hover:text-yellow-300"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
              >
                Climbing Gyms
              </Link>
              <Link
                href="/profile"
                className="text-sm font-bold text-white transition-colors hover:text-yellow-300"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
              >
                Profile
              </Link>
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={session.user.avatarUrl || session.user.image || ""}
                  alt={session.user.githubUsername || session.user.name || "User"}
                />
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/leaderboard"
                className="text-sm font-bold text-white transition-colors hover:text-yellow-300"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
              >
                Leaderboard
              </Link>
              <SignInButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
