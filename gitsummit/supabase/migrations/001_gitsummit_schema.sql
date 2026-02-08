-- GitSummit Database Schema
-- Enhanced schema with trophies, weekly scoring, and commit tracking

-- ============================================
-- USERS TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE NOT NULL,
  github_username VARCHAR(100) UNIQUE NOT NULL,
  github_email VARCHAR(255),
  github_avatar_url TEXT,
  github_profile_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  reminder_time TIME DEFAULT '09:00:00',
  lifetime_score INT DEFAULT 0,
  weekly_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TROPHIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trophies (
  trophy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  trophy_type VARCHAR(20) NOT NULL CHECK (trophy_type IN ('gold', 'silver', 'bronze')),
  leaderboard_type VARCHAR(20) NOT NULL CHECK (leaderboard_type IN ('global', 'friends')),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  score INT NOT NULL,
  rank INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, leaderboard_type, week_start_date)
);

-- Index for efficient trophy queries
CREATE INDEX idx_trophies_user ON trophies(user_id);
CREATE INDEX idx_trophies_week ON trophies(week_start_date, week_end_date);

-- ============================================
-- COMMITS TABLE (Detailed tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS commits (
  commit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  sha VARCHAR(40) UNIQUE NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  repo_full_name VARCHAR(255) NOT NULL,
  commit_message TEXT,
  commit_url TEXT,
  author_login VARCHAR(100),
  committed_at TIMESTAMP NOT NULL,

  -- Scoring fields
  additions INT DEFAULT 0,
  deletions INT DEFAULT 0,
  total_changes INT DEFAULT 0,
  points_awarded INT DEFAULT 0,
  counted_for_score BOOLEAN DEFAULT false,
  daily_commit_number INT DEFAULT 0, -- Which commit of the day (1-5, only first 5 count)

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient commit queries
CREATE INDEX idx_commits_user ON commits(user_id);
CREATE INDEX idx_commits_date ON commits(committed_at);
CREATE INDEX idx_commits_user_date ON commits(user_id, committed_at);
CREATE INDEX idx_commits_counted ON commits(counted_for_score);

-- ============================================
-- GITHUB INSTALLATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS github_installations (
  installation_id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  access_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_installations_user ON github_installations(user_id);

-- ============================================
-- WEEKLY LEADERBOARD SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_leaderboard_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  weekly_score INT NOT NULL,
  global_rank INT,
  friends_rank INT,
  commit_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start_date)
);

CREATE INDEX idx_weekly_snapshots_week ON weekly_leaderboard_snapshots(week_start_date, week_end_date);
CREATE INDEX idx_weekly_snapshots_user ON weekly_leaderboard_snapshots(user_id);

-- ============================================
-- FRIENDSHIPS TABLE (Mutual GitHub followers)
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  friend_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, friend_user_id),
  CHECK (user_id != friend_user_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_user_id);

-- ============================================
-- DAILY COMMIT SUMMARIES
-- ============================================
CREATE TABLE IF NOT EXISTS daily_commit_summaries (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_commits INT DEFAULT 0,
  counted_commits INT DEFAULT 0, -- How many actually counted (max 5)
  points_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_summaries_user ON daily_commit_summaries(user_id);
CREATE INDEX idx_daily_summaries_date ON daily_commit_summaries(date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER github_installations_updated_at BEFORE UPDATE ON github_installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- View for current week's global leaderboard
CREATE OR REPLACE VIEW current_week_global_leaderboard AS
SELECT
  u.user_id,
  u.github_username,
  u.github_avatar_url,
  u.weekly_score,
  ROW_NUMBER() OVER (ORDER BY u.weekly_score DESC, u.updated_at ASC) as rank
FROM users u
WHERE u.weekly_score > 0
ORDER BY rank;

-- View for user profiles with trophy counts
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  u.user_id,
  u.github_username,
  u.github_avatar_url,
  u.github_profile_url,
  u.lifetime_score,
  u.weekly_score,
  u.created_at,
  COUNT(DISTINCT CASE WHEN t.trophy_type = 'gold' THEN t.trophy_id END) as gold_trophies,
  COUNT(DISTINCT CASE WHEN t.trophy_type = 'silver' THEN t.trophy_id END) as silver_trophies,
  COUNT(DISTINCT CASE WHEN t.trophy_type = 'bronze' THEN t.trophy_id END) as bronze_trophies,
  COUNT(DISTINCT t.trophy_id) as total_trophies
FROM users u
LEFT JOIN trophies t ON u.user_id = t.user_id
GROUP BY u.user_id;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_commit_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles (for leaderboards)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Users can only update their own data
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = user_id);

-- Commits are viewable by everyone (for leaderboards)
CREATE POLICY "Commits are viewable by everyone" ON commits
  FOR SELECT USING (true);

-- Trophies are viewable by everyone
CREATE POLICY "Trophies are viewable by everyone" ON trophies
  FOR SELECT USING (true);

-- Friendships are viewable by involved users
CREATE POLICY "Friendships viewable by involved users" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

-- Daily summaries are viewable by everyone
CREATE POLICY "Daily summaries viewable by everyone" ON daily_commit_summaries
  FOR SELECT USING (true);

-- Weekly snapshots are viewable by everyone
CREATE POLICY "Weekly snapshots viewable by everyone" ON weekly_leaderboard_snapshots
  FOR SELECT USING (true);

-- Service role can do anything (for webhook and cron jobs)
CREATE POLICY "Service role has full access to users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to commits" ON commits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to trophies" ON trophies
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to installations" ON github_installations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to friendships" ON friendships
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to daily summaries" ON daily_commit_summaries
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to weekly snapshots" ON weekly_leaderboard_snapshots
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
