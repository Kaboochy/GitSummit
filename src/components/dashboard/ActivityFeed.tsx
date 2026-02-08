"use client";

import { GitBranch } from "lucide-react";

export interface PushEvent {
  id: string;
  ref: string;
  commit_count: number;
  points_awarded: number;
  event_created_at: string;
  repositories: {
    repo_name: string;
    repo_full_name: string;
  };
}

interface ActivityFeedProps {
  events: PushEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const recentEvents = events.slice(0, 5);

  if (recentEvents.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">
          No push events yet. Link a repo and hit &quot;Sync Now&quot; to start
          earning points!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {recentEvents.map((event) => (
          <li key={event.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <GitBranch className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Pushed to{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {event.repositories?.repo_name || "unknown"}
                </span>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {event.commit_count} commit{event.commit_count !== 1 ? "s" : ""}{" "}
                · {formatTimeAgo(event.event_created_at)}
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              +{event.points_awarded}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
