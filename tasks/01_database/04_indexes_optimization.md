# タスク: インデックス・パフォーマンス最適化

## 概要

データベースのパフォーマンス向上のためのインデックスを作成し、最適化を実施する。

## 前提条件

- 全テーブル・RLS設定が完了済み

## 実装対象

### 1. 基本インデックス作成

頻繁なクエリパターンに対応したインデックス

### 2. パフォーマンス最適化

クエリ実行計画の確認と調整

## 詳細仕様

### パフォーマンス対策インデックス

```sql
-- メッセージの時系列取得用（ルーム別）
CREATE INDEX idx_messages_room_created
ON messages(room_id, created_at DESC);

-- アバター位置の高速更新・取得用
CREATE INDEX idx_avatar_positions_room
ON avatar_positions(room_id);

-- プロフィール検索用（名前検索）
CREATE INDEX idx_profiles_name
ON profiles(name);

-- メッセージのユーザー別検索用（Google ユーザー）
CREATE INDEX idx_messages_user_id
ON messages(user_id) WHERE user_id IS NOT NULL;

-- アバター位置の更新時間検索用
CREATE INDEX idx_avatar_positions_updated
ON avatar_positions(updated_at DESC);
```

### 想定クエリパターン

1. **チャット履歴取得**: ルーム別・時系列順
2. **アバター位置取得**: ルーム内の全アバター
3. **ユーザー検索**: 名前による部分一致
4. **メッセージ履歴**: ユーザー別の投稿履歴
5. **リアルタイム更新**: 最新のアバター位置

## パフォーマンス検証

### クエリ例とEXPLAIN実行

```sql
-- メッセージ取得のパフォーマンス確認
EXPLAIN ANALYZE
SELECT * FROM messages
WHERE room_id = '[room-uuid]'
ORDER BY created_at DESC
LIMIT 50;

-- アバター位置取得のパフォーマンス確認
EXPLAIN ANALYZE
SELECT * FROM avatar_positions
WHERE room_id = '[room-uuid]';
```

## 成果物

- インデックス作成SQL
- パフォーマンステスト結果
- クエリ実行計画の最適化確認

## 検証方法

### Supabase Studio経由で確認

1. Supabase Studio にアクセス: http://127.0.0.1:54323
2. 左メニューから「SQL Editor」を選択
3. 以下のクエリでインデックス一覧を確認:
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
   ORDER BY tablename, indexname;
   ```
4. パフォーマンステストの実行:
   - SQL Editor で `EXPLAIN ANALYZE` を付けたクエリを実行
   - 実行計画と実行時間を確認

## 将来の最適化ポイント

- メッセージ件数増加時のパーティショニング検討
- 全文検索インデックス（メッセージ内容検索用）
- 接続パフォーマンス監視・調整
