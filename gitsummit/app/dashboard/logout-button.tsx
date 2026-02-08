"use client";
import { supabaseBrowser } from "@/lib/supabase/client";
import WoodenSign from "@/components/WoodenSign";

export default function LogoutButton() {
  const logout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    location.href = "/login";
  };

  return (
    <button onClick={logout} className="w-full text-left">
      <WoodenSign size="small" variant="warning">
        <div className="flex items-center justify-between">
          <span>🚪 Logout</span>
          <span className="text-xs">→</span>
        </div>
      </WoodenSign>
    </button>
  );
}
