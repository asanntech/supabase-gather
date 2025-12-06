# タスク: データベース基盤スキーマ作成

## 概要

プロジェクト全体で使用する基本テーブル（profiles, rooms）のスキーマを作成する。

## 実装対象

### 1. profilesテーブル

Googleユーザーのプロフィール情報管理

### 2. roomsテーブル

ルーム管理（MVP: 1ルーム固定、将来: マルチルーム対応）

## 詳細仕様

### profilesテーブル

```sql
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  avatar_type  text NOT NULL DEFAULT 'blue',
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**設計意図:**

- `auth.users.id`と1:1対応
- Googleユーザーのみ使用（ゲスト未使用）
- アバター選択・名前をユーザーが設定可能

### roomsテーブル

```sql
CREATE TABLE rooms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  created_at   timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**設計意図:**

- 将来のマルチルーム対応準備
- MVP段階では1レコード固定使用

### 初期データ投入

```sql
INSERT INTO rooms (name, description) VALUES
('main-room', 'メインルーム - みんなで集まりましょう');
```

## 成果物

- マイグレーションSQL（CREATE TABLE）
- 初期データ投入SQL
- テーブル作成確認

## 検証方法

### Supabase Studio経由で確認

1. Supabase Studio にアクセス: http://127.0.0.1:54323
2. 左メニューから「Table Editor」を選択
3. 以下を確認:
   - `profiles` テーブルが作成されていること
   - `rooms` テーブルが作成されていること
   - `rooms` テーブルに初期データ（main-room）が存在すること

## 次のタスクへの準備

- messagesテーブル、avatar_positionsテーブルの前提条件完了
