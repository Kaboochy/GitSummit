-- Add streak tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_push_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster streak queries
CREATE INDEX IF NOT EXISTS idx_users_last_push_date ON users(last_push_date);

-- Create a streaks_log table to track bonus points from streaks
CREATE TABLE IF NOT EXISTS streaks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak_day INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL,
  milestone_type VARCHAR(20), -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streaks_log_user_id ON streaks_log(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_log_created_at ON streaks_log(created_at DESC);

-- RLS Policies for streaks_log
ALTER TABLE streaks_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streak logs"
  ON streaks_log
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE streaks_log IS 'Tracks bonus points awarded from daily push streaks';
COMMENT ON COLUMN users.current_streak IS 'Current consecutive days with at least one push';
COMMENT ON COLUMN users.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN users.last_push_date IS 'Date of the last push (used for streak calculation)';
