"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users, Crown, Copy, Check, Loader2 } from "lucide-react";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
  role: string;
  memberCount: number;
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status, fetchGroups]);

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to view climbing gyms.</p>
      </div>
    );
  }

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
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="flex items-center gap-2 font-bold text-white drop-shadow-lg"
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "1.5rem",
              textShadow: "0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            <Users className="h-7 w-7 text-yellow-300" />
            Climbing Gyms
          </h1>
          <p
            className="mt-2 text-white drop-shadow-lg"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.7)" }}
          >
            Create or join climbing gyms to compete with friends!
          </p>
        </div>

      {/* Create + Join side by side */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
            Create a Climbing Gym
          </h2>
          <CreateGroupForm onCreated={() => fetchGroups()} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wide dark:text-zinc-400">
            Join a Climbing Gym
          </h2>
          <JoinGroupForm onJoined={() => fetchGroups()} />
        </div>
      </div>

      {/* Group list */}
      <h2 className="mb-4 text-lg font-semibold">Your Climbing Gyms</h2>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <Users className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            You&apos;re not in any climbing gyms yet. Create one or join with an invite
            code!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{group.name}</p>
                    {group.role === "owner" && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {group.description}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Invite code */}
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs tracking-widest dark:bg-zinc-800">
                  {group.invite_code}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    copyInviteCode(group.invite_code);
                  }}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  title="Copy invite code"
                >
                  {copiedCode === group.invite_code ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
