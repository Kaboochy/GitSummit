"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";

interface JoinGroupFormProps {
  onJoined?: (groupId: string) => void;
}

export function JoinGroupForm({ onJoined }: JoinGroupFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join group");
        return;
      }

      setSuccess(data.message);
      setCode("");
      onJoined?.(data.groupId);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="invite-code" className="block text-sm font-medium mb-1">
          Invite Code
        </label>
        <input
          id="invite-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={6}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm uppercase tracking-widest text-center font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        Join Climbing Gym
      </button>
    </form>
  );
}
