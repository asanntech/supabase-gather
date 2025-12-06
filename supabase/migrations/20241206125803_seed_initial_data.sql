-- Insert initial room data
INSERT INTO rooms (name, description) VALUES
  ('main-room', 'メインルーム - みんなで集まりましょう')
ON CONFLICT (id) DO NOTHING;