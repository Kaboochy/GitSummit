"use client";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const signIn = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>
      <button onClick={signIn}>Continue with GitHub</button>
    </div>
  );
}
