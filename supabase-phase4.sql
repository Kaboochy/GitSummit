-- ============================================
-- Phase 4: Groups + Group Members tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Groups table: private competition groups
CREATE TABLE IF NOT EXISTS groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Group members table: who belongs to which group
CREATE TABLE IF NOT EXISTS group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Anyone can view groups" ON groups;
DROP POLICY IF EXISTS "Anyone can view group members" ON group_members;

CREATE POLICY "Anyone can view groups" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view group members" ON group_members
  FOR SELECT USING (true);
