/**
 * GET /api/groups/[id]
 * Returns group details + members with their points (group leaderboard).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: groupId } = await params;
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

  // Get group details
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json(
      { error: "You are not a member of this group" },
      { status: 403 }
    );
  }

  // Get all members with their user data, sorted by points
  const { data: members } = await supabase
    .from("group_members")
    .select(`
      role,
      joined_at,
      users (
        id,
        github_username,
        avatar_url,
        display_name,
        total_points
      )
    `)
    .eq("group_id", groupId);

  // Format and sort by points
  const sortedMembers = (members || [])
    .map((m) => {
      const memberUser = m.users as unknown as {
        id: string;
        github_username: string;
        avatar_url: string;
        display_name: string;
        total_points: number;
      };
      return {
        ...memberUser,
        role: m.role,
        joined_at: m.joined_at,
      };
    })
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .map((m, index) => ({ ...m, rank: index + 1 }));

  return NextResponse.json({
    group,
    members: sortedMembers,
    currentUserRole: membership.role,
  });
}

/**
 * DELETE /api/groups/[id]
 * Leave a group (or delete it if you're the owner and last member).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: groupId } = await params;
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

  // Remove user from group
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to leave group" },
      { status: 500 }
    );
  }

  // Check if group has any members left
  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);

  // If no members left, delete the group
  if (count === 0) {
    await supabase.from("groups").delete().eq("id", groupId);
  }

  return NextResponse.json({ message: "Left group successfully" });
}
