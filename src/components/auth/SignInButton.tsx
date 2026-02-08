"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-3 rounded-xl border-4 border-green-900 bg-gradient-to-r from-green-600 via-green-700 to-blue-700 px-8 py-4 text-base font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-green-500/50 dark:border-green-950 dark:from-green-800 dark:to-blue-900"
      style={{ animation: "climb 2s ease-in-out infinite" }}
    >
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </button>
  );
}
