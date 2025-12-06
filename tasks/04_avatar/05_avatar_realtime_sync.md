# 05. アバターリアルタイム同期

## 目的
Supabase Presenceを使用してアバター変更をリアルタイムで他ユーザーに反映する

## 実装内容

### 1. Presenceアバター管理
- `src/features/avatar/infrastructure/realtime/PresenceAvatarManager.ts` を作成
- Supabase Presence チャンネルでのアバター情報同期
- アバター変更時の Presence 更新

### 2. アバター位置管理統合
- `avatar_positions` テーブルとの連携
- 位置情報と合わせたアバター情報記録
- 2Dスペースでのアバター表示

### 3. リアルタイムアバターフック
- `src/features/avatar/ui/hooks/useRealtimeAvatars.ts` を作成
- ルーム内の全ユーザーのアバター状態監視
- Presenceイベントのリスニング

### 4. チャットアバター同期
- メッセージ送信時のアバター情報添付
- ゲストユーザーのメッセージ別アバター管理
- リアルタイムチャット表示の更新

### 5. アバター変更の最適化
- アバター変更時の効率的な更新処理
- 不要なリレンダリング防止
- Presence負荷軽減

### 6. エラーハンドリング
- Presence接続エラー時の fallback処理
- アバター同期失敗時のリトライ機能
- オフライン時のアバター状態管理

## 成果物
- リアルタイムアバター同期機能
- 2Dスペースでのアバター表示更新
- チャット内アバター表示
- 堅牢なエラーハンドリング

## 依存関係
- 01_avatar_domain_models.md（型定義）
- 04_avatar_persistence.md（データ管理）
- Supabase Realtime機能
- avatar_positions テーブル

## 完了基準
- アバター変更が他ユーザーにリアルタイム反映
- 2Dスペース・チャットでのアバター表示
- エラー時の適切な fallback動作