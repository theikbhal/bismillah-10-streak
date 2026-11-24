CREATE TABLE IF NOT EXISTS streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin TEXT,
  total_days INTEGER DEFAULT 0
);
