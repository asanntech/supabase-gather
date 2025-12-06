-- Create messages table for Google and guest users
CREATE TABLE messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_type     text NOT NULL CHECK (user_type IN ('google', 'guest')),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name  text NOT NULL,
  avatar_type   text NOT NULL,
  content       text NOT NULL,
  created_at    timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create avatar_positions table for real-time position synchronization
CREATE TABLE avatar_positions (
  room_id      uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  client_id    text NOT NULL,
  x            integer NOT NULL DEFAULT 0,
  y            integer NOT NULL DEFAULT 0,
  avatar_type  text NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (room_id, client_id)
);

-- Add RLS (Row Level Security) policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all messages
CREATE POLICY "Users can view all messages"
  ON messages FOR SELECT
  USING (true);

-- Policy: Users can insert messages
CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- Add RLS (Row Level Security) policies for avatar_positions  
ALTER TABLE avatar_positions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all avatar positions
CREATE POLICY "Users can view all avatar positions"
  ON avatar_positions FOR SELECT
  USING (true);

-- Policy: Users can update avatar positions
CREATE POLICY "Users can update avatar positions"
  ON avatar_positions FOR ALL
  USING (true);

-- Add trigger to automatically update updated_at timestamp for avatar_positions
CREATE TRIGGER update_avatar_positions_updated_at 
  BEFORE UPDATE ON avatar_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();