-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  avatar_type  text NOT NULL DEFAULT 'blue',
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create an index on avatar_type for potential future filtering
CREATE INDEX idx_profiles_avatar_type ON profiles(avatar_type);

-- Add a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();