import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);

  const installationId = searchParams.get("installation_id");
  const state = searchParams.get("state"); // we used userId as state

  if (!installationId || !state) {
    return NextResponse.redirect(`${origin}/settings?error=missing_params`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from("github_installations").upsert({
    user_id: state,
    installation_id: Number(installationId),
  });

  return NextResponse.redirect(`${origin}/settings?connected=1`);
}
