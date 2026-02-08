import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchCommitDetails } from "@/lib/github";
import { calculateCommitPoints, shouldCountCommit } from "@/lib/scoring";

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!);
  const digest = `sha256=${hmac.update(rawBody).digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

async function findOrCreateUser(supabase: any, githubUsername: string, githubId: number) {
  // Try to find existing user
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("github_username", githubUsername)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      github_id: githubId,
      github_username: githubUsername,
      lifetime_score: 0,
      weekly_score: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return newUser;
}

async function getTodayCommitCount(supabase: any, userId: string, date: string): Promise<number> {
  const { data } = await supabase
    .from("commits")
    .select("commit_id", { count: "exact" })
    .eq("user_id", userId)
    .gte("committed_at", `${date}T00:00:00Z`)
    .lt("committed_at", `${date}T23:59:59Z`)
    .order("committed_at", { ascending: true });

  return data?.length || 0;
}

async function updateDailySummary(
  supabase: any,
  userId: string,
  date: string,
  pointsEarned: number,
  wasCounted: boolean
) {
  const { data: existing } = await supabase
    .from("daily_commit_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (existing) {
    // Update existing summary
    await supabase
      .from("daily_commit_summaries")
      .update({
        total_commits: existing.total_commits + 1,
        counted_commits: existing.counted_commits + (wasCounted ? 1 : 0),
        points_earned: existing.points_earned + pointsEarned,
      })
      .eq("summary_id", existing.summary_id);
  } else {
    // Create new summary
    await supabase.from("daily_commit_summaries").insert({
      user_id: userId,
      date,
      total_commits: 1,
      counted_commits: wasCounted ? 1 : 0,
      points_earned: pointsEarned,
    });
  }
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
  const repoFullName = payload.repository?.full_name ?? "";
  const repoName = payload.repository?.name ?? "";
  const [owner, repo] = repoFullName.split("/");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get access token for this installation
  // In production, you'd generate a JWT and exchange it for an installation token
  // For now, we'll use a personal access token or stored token
  const accessToken = process.env.GITHUB_ACCESS_TOKEN || "";

  // Process each commit
  for (const commit of payload.commits || []) {
    try {
      const sha = commit.id;
      const authorLogin = commit.author?.username || commit.committer?.username || "unknown";
      const message = commit.message || "";
      const url = commit.url || "";
      const timestamp = commit.timestamp || new Date().toISOString();

      // Skip if no author
      if (authorLogin === "unknown") {
        console.log("Skipping commit with unknown author:", sha);
        continue;
      }

      // Fetch detailed commit info from GitHub to get additions/deletions
      const commitDetails = await fetchCommitDetails(owner, repo, sha, accessToken);

      if (!commitDetails) {
        console.error("Could not fetch commit details for:", sha);
        // Use default values if API call fails
        var additions = 10; // Default to small commit
        var deletions = 0;
      } else {
        var additions = commitDetails.stats?.additions || 0;
        var deletions = commitDetails.stats?.deletions || 0;
      }

      const totalChanges = additions + deletions;
      const points = calculateCommitPoints(additions, deletions);

      // Find or create user
      const user = await findOrCreateUser(
        supabase,
        authorLogin,
        commitDetails?.author?.id || Date.now() // Use GitHub ID if available
      );

      if (!user) {
        console.error("Could not create/find user:", authorLogin);
        continue;
      }

      // Get today's date in UTC
      const commitDate = new Date(timestamp);
      const dateString = commitDate.toISOString().split("T")[0]; // YYYY-MM-DD

      // Check how many commits they've made today (before this one)
      const todayCommitCount = await getTodayCommitCount(supabase, user.user_id, dateString);
      const dailyCommitNumber = todayCommitCount + 1;
      const counted = shouldCountCommit(dailyCommitNumber);
      const pointsAwarded = counted ? points : 0;

      // Store commit record
      const { error: commitError } = await supabase.from("commits").insert({
        user_id: user.user_id,
        sha,
        repo_name: repoName,
        repo_full_name: repoFullName,
        commit_message: message,
        commit_url: url,
        author_login: authorLogin,
        committed_at: timestamp,
        additions,
        deletions,
        total_changes: totalChanges,
        points_awarded: pointsAwarded,
        counted_for_score: counted,
        daily_commit_number: dailyCommitNumber,
      });

      if (commitError) {
        // Might be duplicate (sha is unique)
        console.log("Commit already exists or error:", commitError.message);
        continue;
      }

      // Update user scores if this commit counts
      if (counted) {
        await supabase
          .from("users")
          .update({
            lifetime_score: user.lifetime_score + pointsAwarded,
            weekly_score: user.weekly_score + pointsAwarded,
          })
          .eq("user_id", user.user_id);
      }

      // Update daily summary
      await updateDailySummary(supabase, user.user_id, dateString, pointsAwarded, counted);

      console.log(
        `Processed commit ${sha} by ${authorLogin}: ${pointsAwarded} points (${dailyCommitNumber}/5 today, counted: ${counted})`
      );
    } catch (error) {
      console.error("Error processing commit:", error);
      // Continue processing other commits
    }
  }

  return NextResponse.json({ ok: true });
}
