import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  // If authenticated, go to dashboard
  if (data.user) {
    redirect("/dashboard");
  }

  // Otherwise show landing page
  return <LandingPage />;
}
