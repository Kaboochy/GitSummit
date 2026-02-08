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
  const recentEvents = events.slice(0, 6);

  if (recentEvents.length === 0) {
    return (
      <div className="border-4 border-stone-900 bg-blue-700 p-6 text-center shadow-lg dark:border-black dark:bg-blue-800">
        <p className="text-white">
          No push events yet. Link a repo and hit &quot;Sync Now&quot; to start
          earning points!
        </p>
      </div>
    );
  }

  return (
    <div className="border-4 border-stone-900 bg-blue-700 shadow-lg dark:border-black dark:bg-blue-800">
      <div className="border-b-4 border-stone-900 px-4 py-3 dark:border-black">
        <h3
          className="font-bold text-white"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}
        >
          Recent Activity
        </h3>
      </div>
      <ul className="divide-y-4 divide-stone-900 dark:divide-black">
        {recentEvents.map((event) => (
          <li key={event.id} className="flex items-center gap-3 px-4 py-3 bg-blue-600 dark:bg-blue-900">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-stone-900 bg-green-600 dark:border-black dark:bg-green-700">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                Pushed to{" "}
                <span
                  className="font-bold text-yellow-300"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: "0.625rem" }}
                >
                  {event.repositories?.repo_name || "unknown"}
                </span>
              </p>
              <p className="text-xs text-blue-200">
                {event.commit_count} commit{event.commit_count !== 1 ? "s" : ""}{" "}
                · {formatTimeAgo(event.event_created_at)}
              </p>
            </div>
            <span
              className="font-bold text-yellow-300"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.75rem" }}
            >
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
