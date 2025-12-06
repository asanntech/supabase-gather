# タスク: メッセージ系テーブル作成

## 概要
チャット機能とアバター位置管理のためのテーブルを作成する。

## 前提条件
- profilesテーブル、roomsテーブルが作成済み

## 実装対象
### 1. messagesテーブル
Google・ゲスト両ユーザーのメッセージ統一管理

### 2. avatar_positionsテーブル
アバター位置の永続化・リアルタイム同期用

## 詳細仕様

### messagesテーブル
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

**設計意図:**
- Google・ゲスト両対応（`user_id`でNULL許可）
- 投稿時点の表示名・アバターを保存
- ゲストは`user_id = NULL`で識別

### avatar_positionsテーブル
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

**設計意図:**
- `client_id`: Googleユーザー=auth.user().id、ゲスト=生成UUID
- 2Dスペース座標の永続化
- Realtime同期のベースデータ

## 成果物
- マイグレーションSQL（CREATE TABLE）
- テーブル作成確認

## 検証方法
- テーブル作成確認: `\d messages`, `\d avatar_positions`
- 外部キー制約確認: 参照整合性テスト

## 次のタスクへの準備
- 全テーブル準備完了、RLS設定の前提条件満了