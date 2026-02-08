/**
 * POST /api/groups/join
 * Join a group using an invite code.
 * Body: { inviteCode: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { inviteCode } = body;

  if (!inviteCode || inviteCode.trim().length === 0) {
    return NextResponse.json(
      { error: "Invite code is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Get user's internal ID
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", session.user.githubId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find the group by invite code
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .single();

  if (groupError || !group) {
    return NextResponse.json(
      { error: "Invalid invite code. Please check and try again." },
      { status: 404 }
    );
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You're already a member of this group!" },
      { status: 400 }
    );
  }

  // Join the group
  const { error: joinError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
  });

  if (joinError) {
    console.error("Failed to join group:", joinError);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    groupId: group.id,
    message: `You joined "${group.name}"!`,
  });
}
