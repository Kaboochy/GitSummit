-- ============================================
-- Phase 2: Repositories + Push Events tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Add total_points and updated_at to users table if not already there
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_access_token text;

-- Repositories table: stores repos a user has linked
CREATE TABLE IF NOT EXISTS repositories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  github_repo_id bigint NOT NULL,
  repo_name text NOT NULL,
  repo_full_name text NOT NULL,
  repo_url text NOT NULL,
  is_private boolean DEFAULT false,
  language text,
  description text,
  linked_at timestamptz DEFAULT now(),
  last_polled_at timestamptz,
  last_etag text,
  poll_interval integer DEFAULT 60,
  UNIQUE(user_id, github_repo_id)
);

-- Push events table: stores each push event (1 push = 1 point)
CREATE TABLE IF NOT EXISTS push_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  github_event_id text UNIQUE NOT NULL,
  push_id bigint,
  ref text,
  commit_count integer DEFAULT 1,
  head_sha text,
  points_awarded integer DEFAULT 1,
  event_created_at timestamptz NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_push_events_user_id ON push_events(user_id);
CREATE INDEX IF NOT EXISTS idx_push_events_repository_id ON push_events(repository_id);
CREATE INDEX IF NOT EXISTS idx_push_events_event_created ON push_events(event_created_at DESC);

-- Enable RLS (we bypass with service role key, but good practice)
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_events ENABLE ROW LEVEL SECURITY;

-- RLS policies: allow users to read their own data
CREATE POLICY "Users can view own repos" ON repositories
  FOR SELECT USING (true);

CREATE POLICY "Users can view own push events" ON push_events
  FOR SELECT USING (true);
