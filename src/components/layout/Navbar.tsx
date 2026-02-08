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
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Mountain className="h-6 w-6 text-emerald-600" />
          <span>GitCompete</span>
        </Link>

        {/* Nav links + auth */}
        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Leaderboard
              </Link>
              <Link
                href="/groups"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Groups
              </Link>
              <Link
                href="/profile"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
