import Link from "next/link";
import { Mountain } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <Mountain className="h-16 w-16 text-zinc-300 dark:text-zinc-600" />
      <h1 className="mt-4 text-4xl font-bold">404</h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        This page doesn&apos;t exist. Maybe the trail ended here?
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
