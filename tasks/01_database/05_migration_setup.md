# タスク: マイグレーション統合・セットアップ完了

## 概要
全てのデータベース設定を統合したマイグレーションファイルを作成し、セットアップを完了する。

## 前提条件
- 全テーブル作成・RLS・インデックス設定内容の確認済み

## 実装対象
### 1. 統合マイグレーションファイル作成
全ての設定を1つのマイグレーションファイルに統合

### 2. セットアップ検証
データベース構造の完全性確認

### 3. ドキュメント整備
実装済み構造の文書化

## 統合マイグレーション

### ファイル: `supabase/migrations/001_initial_schema.sql`
```sql
-- ================================
-- Supabase Gather: 初期スキーマ作成
-- ================================

-- 1. テーブル作成
-- 1-1. プロフィールテーブル（Googleユーザー用）
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  avatar_type  text NOT NULL DEFAULT 'blue',
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1-2. ルームテーブル（将来のマルチルーム対応）
CREATE TABLE rooms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1-3. メッセージテーブル（Google・ゲスト共通）
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

-- 1-4. アバター位置テーブル（リアルタイム同期用）
CREATE TABLE avatar_positions (
  room_id      uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  client_id    text NOT NULL,
  x            integer NOT NULL DEFAULT 0,
  y            integer NOT NULL DEFAULT 0,
  avatar_type  text NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (room_id, client_id)
);

-- 2. 初期データ投入
INSERT INTO rooms (name, description) VALUES
('main-room', 'メインルーム - みんなで集まりましょう');

-- 3. RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_positions ENABLE ROW LEVEL SECURITY;

-- 4. セキュリティポリシー（MVP用：全ユーザー読み書き可能）
-- profiles
CREATE POLICY "Public read access on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public write access on profiles" ON profiles FOR ALL USING (true);

-- rooms
CREATE POLICY "Public read access on rooms" ON rooms FOR SELECT USING (true);

-- messages
CREATE POLICY "Public read access on messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Public write access on messages" ON messages FOR INSERT WITH CHECK (true);

-- avatar_positions
CREATE POLICY "Public read access on avatar_positions" ON avatar_positions FOR SELECT USING (true);
CREATE POLICY "Public write access on avatar_positions" ON avatar_positions FOR ALL USING (true);

-- 5. updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. パフォーマンス最適化インデックス
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_avatar_positions_room ON avatar_positions(room_id);
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_messages_user_id ON messages(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_avatar_positions_updated ON avatar_positions(updated_at DESC);
```

## セットアップ検証

### 検証スクリプト
```sql
-- テーブル存在確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'rooms', 'messages', 'avatar_positions');

-- 初期データ確認
SELECT id, name, description FROM rooms;

-- RLS状態確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- インデックス確認
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
```

## 成果物
- 統合マイグレーションファイル
- セットアップ検証スクリプト
- データベース構造ドキュメント

## 最終確認項目
- [ ] 全テーブルが作成されている
- [ ] 外部キー制約が正しく設定されている
- [ ] RLSが有効になっている
- [ ] 必要なインデックスが作成されている
- [ ] 初期データが投入されている

## 次のフェーズへの準備
データベース基盤完了により、認証システム実装の準備が整いました。