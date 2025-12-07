-- Create performance optimization indexes for database queries

-- メッセージの時系列取得用（ルーム別）
-- 想定クエリ: SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50;
CREATE INDEX idx_messages_room_created
  ON messages(room_id, created_at DESC);

-- アバター位置の高速更新・取得用（ルーム別）
-- 想定クエリ: SELECT * FROM avatar_positions WHERE room_id = ?;
CREATE INDEX idx_avatar_positions_room
  ON avatar_positions(room_id);

-- メッセージのユーザー別検索用（Google ユーザーのみ）
-- 想定クエリ: SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC;
-- 部分インデックス: user_id IS NOT NULL (ゲストユーザーは対象外)
CREATE INDEX idx_messages_user_id
  ON messages(user_id) WHERE user_id IS NOT NULL;

-- アバター位置の更新時間検索用（リアルタイム同期用）
-- 想定クエリ: SELECT * FROM avatar_positions ORDER BY updated_at DESC;
CREATE INDEX idx_avatar_positions_updated
  ON avatar_positions(updated_at DESC);