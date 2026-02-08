"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { UserAvatar } from "@/components/auth/UserAvatar";
import {
  GitBranch,
  Link as LinkIcon,
  Unlink,
  Loader2,
  Search,
} from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  pushed_at: string | null;
}

interface LinkedRepo {
  id: string;
  github_repo_id: number;
  repo_name: string;
  repo_full_name: string;
  repo_url: string;
  language: string | null;
  linked_at: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [linkedRepos, setLinkedRepos] = useState<LinkedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchLinkedRepos = useCallback(async () => {
    try {
      const res = await fetch("/api/repos/linked");
      if (res.ok) {
        const data = await res.json();
        setLinkedRepos(data.repos || []);
      }
    } catch (err) {
      console.error("Failed to fetch linked repos:", err);
    }
  }, []);

  const fetchGithubRepos = useCallback(async () => {
    try {
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        setGithubRepos(data.repos || []);
      }
    } catch (err) {
      console.error("Failed to fetch GitHub repos:", err);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([fetchGithubRepos(), fetchLinkedRepos()]).finally(() =>
        setLoading(false)
      );
    }
  }, [status, fetchGithubRepos, fetchLinkedRepos]);

  async function linkRepo(repo: GitHubRepo) {
    setLinking(repo.id);
    setMessage(null);

    try {
      const res = await fetch("/api/repos/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          url: repo.html_url,
          isPrivate: repo.private,
          language: repo.language,
          description: repo.description,
        }),
      });

      if (res.ok) {
        setMessage({ text: `Linked ${repo.name}!`, type: "success" });
        await fetchLinkedRepos();
      } else {
        setMessage({ text: `Failed to link ${repo.name}`, type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setLinking(null);
    }
  }

  async function unlinkRepo(githubRepoId: number, repoName: string) {
    setLinking(githubRepoId);
    setMessage(null);

    try {
      const res = await fetch("/api/repos/link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: githubRepoId }),
      });

      if (res.ok) {
        setMessage({ text: `Unlinked ${repoName}`, type: "success" });
        await fetchLinkedRepos();
      } else {
        setMessage({ text: `Failed to unlink ${repoName}`, type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setLinking(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  const linkedRepoIds = new Set(linkedRepos.map((r) => r.github_repo_id));

  const filteredRepos = githubRepos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4">
        <UserAvatar
          src={session.user.avatarUrl || session.user.image || ""}
          alt={session.user.githubUsername || "User"}
          size={64}
        />
        <div>
          <h1 className="text-2xl font-bold">
            {session.user.name || session.user.githubUsername}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            @{session.user.githubUsername}
          </p>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Linked Repos */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-emerald-600" />
          Linked Repos ({linkedRepos.length})
        </h2>

        {linkedRepos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">
              No repos linked yet. Link repos below to start earning points!
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {linkedRepos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium">{repo.repo_full_name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {repo.language || "Unknown"} · Linked{" "}
                      {new Date(repo.linked_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    unlinkRepo(repo.github_repo_id, repo.repo_name)
                  }
                  disabled={linking === repo.github_repo_id}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  {linking === repo.github_repo_id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Unlink className="h-3 w-3" />
                  )}
                  Unlink
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available GitHub Repos */}
      <section>
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Your GitHub Repos
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search repos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {filteredRepos.map((repo) => {
              const isLinked = linkedRepoIds.has(repo.id);

              return (
                <div
                  key={repo.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    isLinked
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{repo.full_name}</p>
                      {repo.private && (
                        <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">
                      {repo.description || "No description"}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {repo.language || "Unknown language"}
                    </p>
                  </div>

                  {isLinked ? (
                    <span className="ml-3 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      ✓ Linked
                    </span>
                  ) : (
                    <button
                      onClick={() => linkRepo(repo)}
                      disabled={linking === repo.id}
                      className="ml-3 flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {linking === repo.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <LinkIcon className="h-3 w-3" />
                      )}
                      Link
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
