"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Trophy,
  Crown,
  Copy,
  Check,
  ArrowLeft,
  LogOut,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface GroupMember {
  id: string;
  github_username: string;
  avatar_url: string;
  display_name: string;
  total_points: number;
  role: string;
  rank: number;
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
}

export default function GroupDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load group");
        return;
      }

      setGroup(data.group);
      setMembers(data.members || []);
      setCurrentUserRole(data.currentUserRole);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroup();
    }
  }, [status, fetchGroup]);

  function copyInviteCode() {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function leaveGroup() {
    if (!confirm("Are you sure you want to leave this group?")) return;

    setLeaving(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/groups");
      }
    } catch {
      setError("Failed to leave group");
    } finally {
      setLeaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link
          href="/groups"
          className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to groups
        </Link>
      </div>
    );
  }

  if (!group || !session) return null;

  // Top 3 for podium
  const top3 = members.slice(0, 3);
  const rest = members.slice(3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/groups"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" /> All Groups
      </Link>

      {/* Group header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-emerald-600" />
            {group.name}
          </h1>
          {group.description && (
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {group.description}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {members.length} member{members.length !== 1 ? "s" : ""} · Created{" "}
            {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Invite code */}
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <span className="font-mono tracking-widest">
              {group.invite_code}
            </span>
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-400" />
            )}
          </button>

          {/* Leave button */}
          <button
            onClick={leaveGroup}
            disabled={leaving}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {leaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Leave
          </button>
        </div>
      </div>

      {/* Group Leaderboard */}
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Group Leaderboard
      </h2>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="mb-6 flex items-end justify-center gap-4">
          {top3[1] && <MiniPodium member={top3[1]} place={2} currentUsername={session.user.githubUsername} />}
          {top3[0] && <MiniPodium member={top3[0]} place={1} currentUsername={session.user.githubUsername} />}
          {top3[2] && <MiniPodium member={top3[2]} place={3} currentUsername={session.user.githubUsername} />}
        </div>
      )}

      {/* Rest of members */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {rest.map((member) => {
            const isCurrentUser =
              session.user.githubUsername === member.github_username;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-4 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800 ${
                  isCurrentUser ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                }`}
              >
                <span className="w-8 text-center text-sm font-bold text-zinc-400">
                  #{member.rank}
                </span>
                {member.avatar_url && (
                  <Image
                    src={member.avatar_url}
                    alt={member.github_username}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex items-center gap-1">
                    {member.display_name || member.github_username}
                    {member.role === "owner" && (
                      <Crown className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                    {isCurrentUser && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    @{member.github_username}
                  </p>
                </div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {member.total_points || 0}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {members.length <= 1 && (
        <div className="mt-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-700 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Share the invite code{" "}
            <span className="font-mono font-bold">{group.invite_code}</span>{" "}
            with friends to start competing!
          </p>
        </div>
      )}
    </div>
  );
}

/** Mini podium card for group leaderboard */
function MiniPodium({
  member,
  place,
  currentUsername,
}: {
  member: GroupMember;
  place: 1 | 2 | 3;
  currentUsername: string;
}) {
  const heights = { 1: "h-24", 2: "h-18", 3: "h-14" };
  const colors = {
    1: "from-yellow-400 to-yellow-500",
    2: "from-zinc-300 to-zinc-400",
    3: "from-amber-600 to-amber-700",
  };
  const sizes = { 1: 56, 2: 48, 3: 48 };
  const isCurrentUser = currentUsername === member.github_username;

  return (
    <div className="flex flex-col items-center">
      {member.avatar_url && (
        <Image
          src={member.avatar_url}
          alt={member.github_username}
          width={sizes[place]}
          height={sizes[place]}
          className={`rounded-full border-2 ${
            place === 1
              ? "border-yellow-400"
              : place === 2
              ? "border-zinc-300"
              : "border-amber-600"
          }`}
        />
      )}
      <p className="mt-1 text-xs font-semibold truncate max-w-[80px]">
        {member.display_name || member.github_username}
        {isCurrentUser && (
          <span className="text-emerald-500"> (You)</span>
        )}
      </p>
      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
        {member.total_points || 0}
      </p>
      <div
        className={`${heights[place]} w-16 rounded-t-lg bg-gradient-to-t ${colors[place]} mt-1 flex items-center justify-center`}
      >
        <span className="text-xl font-black text-white">#{place}</span>
      </div>
    </div>
  );
}
