"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface SyncResult {
  repoName: string;
  newPushes: number;
  error?: string;
}

interface SyncResponse {
  results: SyncResult[];
  totalNewPushes: number;
  totalPoints: number;
  message: string;
}

interface SyncButtonProps {
  onSyncComplete?: (data: SyncResponse) => void;
}

export function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const data: SyncResponse = await response.json();

      if (!response.ok) {
        setMessage("Sync failed. Please try again.");
        return;
      }

      setMessage(data.message);
      onSyncComplete?.(data);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync Now"}
      </button>

      {message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      )}
    </div>
  );
}
