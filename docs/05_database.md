# 05. データベース設計（全テーブル定義）

## 概要

Supabase Gatherで使用する全テーブルの詳細定義と設計思想。

## テーブル一覧

### 1. profiles（Googleユーザー管理）

```sql
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  avatar_type  text NOT NULL DEFAULT 'blue',
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 設計思想

- `auth.users.id`と1:1で対応
- Googleユーザーのプロフィール情報を保存
- ゲストユーザーには使用しない

#### カラム詳細

- `id`：Supabase Authのユーザーidと一致
- `name`：ユーザーが設定する表示名（Google名は使わない）
- `avatar_type`：選択したアバターの色（`blue`, `purple`等）
- `created_at`：プロフィール作成日時

### 2. rooms（ルーム管理）

```sql
CREATE TABLE rooms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 設計思想

- 将来のマルチルーム対応を見据えた設計
- MVP段階では1レコードのみ使用

#### カラム詳細

- `id`：ルームの一意識別子
- `name`：ルーム名（例：「メインルーム」）
- `description`：ルームの説明（省略可能）
- `created_at`：ルーム作成日時

#### 初期データ

```sql
INSERT INTO rooms (name, description) VALUES
('main-room', 'メインルーム - みんなで集まりましょう');
```

### 3. messages（チャットメッセージ）

```sql
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
```

#### 設計思想

- Google・ゲスト両ユーザーのメッセージを統一管理
- ゲストは`user_id = NULL`で保存
- 表示名・アバターは投稿時点の情報を保存

#### カラム詳細

- `room_id`：投稿先ルーム
- `user_type`：ユーザー種別（`google` | `guest`）
- `user_id`：Googleユーザーの場合のみ設定
- `display_name`：投稿時の表示名
- `avatar_type`：投稿時のアバター種別
- `content`：メッセージ本文
- `created_at`：投稿日時

### 4. avatar_positions（アバター位置）

```sql
CREATE TABLE avatar_positions (
  room_id      uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  client_id    text NOT NULL,
  x            integer NOT NULL DEFAULT 0,
  y            integer NOT NULL DEFAULT 0,
  avatar_type  text NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (room_id, client_id)
);
```

#### 設計思想

- アバターの位置情報を永続化
- リアルタイム同期用のベースデータとして活用

#### カラム詳細

- `client_id`：クライアント識別子（Google/ゲスト共通）
- `x`, `y`：2Dスペース上の座標
- `avatar_type`：現在のアバター種別
- `updated_at`：最終更新日時

#### client_idの決定方法

- **Googleユーザー**：`auth.user().id`を使用
- **ゲストユーザー**：フロント側で生成したUUIDを使用

## RLS（Row Level Security）設定

### 基本方針

- MVP段階では「全ユーザー読み書き可能」
- ゲストユーザーがSupabase Authを使わないため

### 設定例

```sql
-- 全テーブルでAnonymous読み書き許可
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_positions ENABLE ROW LEVEL SECURITY;

-- 簡易的なRLSポリシー（MVP用）
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public write access" ON profiles FOR ALL USING (true);

CREATE POLICY "Public read access" ON messages FOR SELECT USING (true);
CREATE POLICY "Public write access" ON messages FOR INSERT WITH CHECK (true);

-- 他テーブルも同様
```

## インデックス設計

### パフォーマンス対策

```sql
-- メッセージの時系列取得用
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);

-- アバター位置の高速更新用
CREATE INDEX idx_avatar_positions_room ON avatar_positions(room_id);

-- プロフィール検索用
CREATE INDEX idx_profiles_name ON profiles(name);
```

## 移行・拡張性

### 将来の機能拡張

- DM機能：`direct_messages`テーブル追加
- ルーム権限：`room_permissions`テーブル追加
- ユーザー関係：`friendships`テーブル追加

### ゲスト機能の移行

- ゲスト廃止時：`user_type = 'guest'`のレコード削除
- 匿名ログイン移行時：`user_type`を`anonymous`に変更
