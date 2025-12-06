# タスク: RLS・セキュリティ設定

## 概要

全テーブルにRow Level Security（RLS）を設定し、MVP段階のセキュリティポリシーを適用する。

## 前提条件

- 全テーブル（profiles, rooms, messages, avatar_positions）が作成済み

## 実装対象

### 1. RLS有効化

全テーブルでRLSを有効にする

### 2. MVPセキュリティポリシー

ゲスト対応のため「全ユーザー読み書き可能」ポリシーを設定

## 詳細仕様

### RLS有効化

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_positions ENABLE ROW LEVEL SECURITY;
```

### セキュリティポリシー（MVP用）

```sql
-- profilesテーブル
CREATE POLICY "Public read access on profiles"
ON profiles FOR SELECT USING (true);
CREATE POLICY "Public write access on profiles"
ON profiles FOR ALL USING (true);

-- roomsテーブル
CREATE POLICY "Public read access on rooms"
ON rooms FOR SELECT USING (true);

-- messagesテーブル
CREATE POLICY "Public read access on messages"
ON messages FOR SELECT USING (true);
CREATE POLICY "Public write access on messages"
ON messages FOR INSERT WITH CHECK (true);

-- avatar_positionsテーブル
CREATE POLICY "Public read access on avatar_positions"
ON avatar_positions FOR SELECT USING (true);
CREATE POLICY "Public write access on avatar_positions"
ON avatar_positions FOR ALL USING (true);
```

## 設計思想

### MVP段階の制約

- ゲストはSupabase Authを使わない
- ユーザーごとのRLS制限は不可能
- 「1つの公開ルーム」設計のため全ユーザー読み書きOK

### 将来の拡張性

- 厳密な制御が必要になった場合：
  - ゲスト機能をSupabase Auth匿名ログインに移行
  - ユーザーベースのRLS設定に変更可能

## 成果物

- RLS有効化SQL
- セキュリティポリシー設定SQL

## 検証方法

### Supabase Studio経由で確認

1. Supabase Studio にアクセス: http://127.0.0.1:54323
2. 左メニューから「Authentication」→「Policies」を選択
3. 各テーブルのRLS設定を確認:
   - 各テーブルでRLSが「Enabled」になっていること
   - 設定されたポリシーが表示されていること
4. 「SQL Editor」から以下のクエリでもポリシーを確認可能:
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

## セキュリティ注意事項

- MVP段階の制限を文書化
- 本番運用前のセキュリティレビュー必須
- 機能拡張時のセキュリティ影響評価
