import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!);
  const digest = `sha256=${hmac.update(rawBody).digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  const payload = JSON.parse(rawBody);

  if (event !== "push") {
    return NextResponse.json({ ok: true }); // ignore other events for now
  }

  const installationId = payload.installation?.id ?? null;
  const repoFullName = payload.repository?.full_name ?? null;

  const commits = (payload.commits ?? []).map((c: any) => ({
    installation_id: installationId,
    repo_full_name: repoFullName,
    sha: c.id,
    author_login: c.author?.username ?? c.author?.name ?? null,
    message: c.message ?? null,
    url: c.url ?? null,
    timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : null,
  }));

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (commits.length) {
    await supabase.from("github_commits").upsert(commits, { onConflict: "sha" });
  }

  return NextResponse.json({ ok: true });
}
