"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </button>
  );
}
