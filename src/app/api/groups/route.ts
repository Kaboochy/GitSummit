/**
 * GET /api/groups - List groups the user belongs to
 * POST /api/groups - Create a new group
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInviteCode } from "@/lib/utils/invite-code";

export async function GET() {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

  // Get all groups the user belongs to, with member count
  const { data: memberships, error } = await supabase
    .from("group_members")
    .select(`
      role,
      joined_at,
      groups (
        id,
        name,
        description,
        invite_code,
        created_at
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }

  // Format the response
  const groups = await Promise.all(
    (memberships || []).map(async (m) => {
      const group = m.groups as unknown as {
        id: string;
        name: string;
        description: string;
        invite_code: string;
        created_at: string;
      };

      // Get member count for each group
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);

      return {
        ...group,
        role: m.role,
        memberCount: count || 0,
      };
    })
  );

  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.githubId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Group name is required" },
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

  // Generate a unique invite code
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("groups")
      .select("id")
      .eq("invite_code", inviteCode)
      .single();

    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      invite_code: inviteCode,
      created_by: user.id,
    })
    .select()
    .single();

  if (groupError) {
    console.error("Failed to create group:", groupError);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }

  // Add creator as owner
  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });

  return NextResponse.json({
    group,
    message: `Group "${name}" created! Share code: ${inviteCode}`,
  });
}
