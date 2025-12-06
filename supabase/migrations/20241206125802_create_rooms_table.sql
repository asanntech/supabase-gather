-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all rooms
CREATE POLICY "Authenticated users can view all rooms"
  ON rooms FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert rooms (for now, no one can insert via RLS)
-- This ensures rooms are only created through migrations or admin panel
CREATE POLICY "No one can insert rooms via RLS"
  ON rooms FOR INSERT
  WITH CHECK (false);

-- Policy: Only admins can update rooms
CREATE POLICY "No one can update rooms via RLS"
  ON rooms FOR UPDATE
  USING (false);

-- Policy: Only admins can delete rooms
CREATE POLICY "No one can delete rooms via RLS"
  ON rooms FOR DELETE
  USING (false);

-- Create an index on name for potential future room lookups
CREATE INDEX idx_rooms_name ON rooms(name);