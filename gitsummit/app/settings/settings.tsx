"use client";

import { supabaseBrowser } from "@/lib/supabase/client";

export default function SettingsPage() {
  const connect = async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;

    if (!userId) {
      location.href = "/login";
      return;
    }

    // state links the GitHub install back to THIS user
    const url =
      `${process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL}` +
      `?state=${encodeURIComponent(userId)}`;

    location.href = url;
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Settings</h1>
      <button onClick={connect}>Connect GitHub App</button>
    </div>
  );
}
