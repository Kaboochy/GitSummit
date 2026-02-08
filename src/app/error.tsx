"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <h2 className="mt-4 text-xl font-bold">Something went wrong!</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t worry, your points are safe.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      >
        Try Again
      </button>
    </div>
  );
}
