import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { fetchMutualFollowers } from "@/lib/github";

/**
 * Sync friends (mutual GitHub followers) for a user
 * Can be called manually or by a cron job
 */
export async function POST(req: Request) {
  try {
    // Get current user
    const userSupabase = await supabaseServer();
    const { data: userData } = await userSupabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's GitSummit profile
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Get GitHub access token
    // In production, this would be stored securely or obtained via OAuth
    const accessToken = process.env.GITHUB_ACCESS_TOKEN || "";

    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub access token not configured" },
        { status: 500 }
      );
    }

    // Fetch mutual followers from GitHub
    const mutualFollowerUsernames = await fetchMutualFollowers(
      userProfile.github_username,
      accessToken
    );

    // Find or create GitSummit users for each mutual follower
    const friendUserIds: string[] = [];

    for (const username of mutualFollowerUsernames) {
      // Check if user exists in GitSummit
      let { data: friendUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("github_username", username)
        .single();

      // If friend exists in GitSummit, add to friends list
      if (friendUser) {
        friendUserIds.push(friendUser.user_id);
      }
    }

    // Delete old friendships
    await supabase
      .from("friendships")
      .delete()
      .eq("user_id", userProfile.user_id);

    // Insert new friendships
    if (friendUserIds.length > 0) {
      const friendships = friendUserIds.map((friendId) => ({
        user_id: userProfile.user_id,
        friend_user_id: friendId,
      }));

      await supabase.from("friendships").insert(friendships);
    }

    return NextResponse.json({
      success: true,
      friends_count: friendUserIds.length,
      friends: friendUserIds,
    });
  } catch (error: any) {
    console.error("Error syncing friends:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also support GET for easier testing
export async function GET(req: Request) {
  return POST(req);
}
