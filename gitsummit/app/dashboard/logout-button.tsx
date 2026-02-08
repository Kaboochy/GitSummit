"use client";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LogoutButton() {
  const logout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    location.href = "/login";
  };

  return <button onClick={logout}>Logout</button>;
}
