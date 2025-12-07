-- Configure Row Level Security (RLS) for all tables
-- MVP stage: Public read/write access for guest user support

-- Enable RLS on all tables (some may already be enabled from previous migrations)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_positions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all rooms" ON rooms;
DROP POLICY IF EXISTS "No one can insert rooms via RLS" ON rooms;
DROP POLICY IF EXISTS "No one can update rooms via RLS" ON rooms;
DROP POLICY IF EXISTS "No one can delete rooms via RLS" ON rooms;
DROP POLICY IF EXISTS "Users can view all messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view all avatar positions" ON avatar_positions;
DROP POLICY IF EXISTS "Users can update avatar positions" ON avatar_positions;

-- profiles table policies (MVP: Public read/write for guest support)
CREATE POLICY "Public read access on profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Public write access on profiles"
  ON profiles FOR ALL
  USING (true);

-- rooms table policies (MVP: Public read, restrict write operations)
CREATE POLICY "Public read access on rooms"
  ON rooms FOR SELECT
  USING (true);

-- Restrict room modifications (only through migrations/admin)
CREATE POLICY "No one can insert rooms via RLS"
  ON rooms FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No one can update rooms via RLS"
  ON rooms FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete rooms via RLS"
  ON rooms FOR DELETE
  USING (false);

-- messages table policies (MVP: Public read/write for guest support)
CREATE POLICY "Public read access on messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Public write access on messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- avatar_positions table policies (MVP: Public read/write for real-time updates)
CREATE POLICY "Public read access on avatar_positions"
  ON avatar_positions FOR SELECT
  USING (true);

CREATE POLICY "Public write access on avatar_positions"
  ON avatar_positions FOR ALL
  USING (true);