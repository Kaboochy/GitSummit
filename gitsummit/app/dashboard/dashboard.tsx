import { supabaseServer } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function Dashboard() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {data.user?.email}</p>
      <LogoutButton />
    </div>
  );
}
