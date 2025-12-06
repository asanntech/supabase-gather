# 04. アバターデータ永続化

## 目的

Googleユーザーとゲストユーザーでのアバター情報の永続化を実装する

## 実装内容

### 1. リポジトリインターフェース

- `src/features/avatar/domain/repositories/AvatarRepository.ts` を作成
- アバター保存・取得・更新のインターフェース定義
- ユーザータイプ別の処理を抽象化

### 2. Supabaseアバターリポジトリ

- `src/features/avatar/infrastructure/repositories/SupabaseAvatarRepository.ts` を作成
- profiles テーブルでの avatar_type 管理
- Supabase クライアント統合

### 3. ローカルアバターリポジトリ

- `src/features/avatar/infrastructure/repositories/LocalAvatarRepository.ts` を作成
- ゲストユーザーの一時的アバター管理
- セッションストレージ利用

### 4. アバター永続化サービス

- `src/features/avatar/application/services/AvatarPersistenceService.ts` を作成
- ユーザータイプに応じた適切なリポジトリ選択
- 認証状態との統合

### 5. TanStack Query統合

- `src/features/avatar/application/queries/avatarQueries.ts` を作成
- アバター取得・更新のクエリ定義
- キャッシュ戦略の実装

### 6. アバター管理フック

- `src/features/avatar/ui/hooks/useAvatar.ts` を作成
- 現在のユーザーのアバター状態管理
- アバター変更の楽観的更新

## 成果物

- Googleユーザーのアバター永続化
- ゲストユーザーの一時アバター管理
- 統一されたアバターデータアクセス
- リアクティブなアバター状態管理

## 依存関係

- 01_avatar_domain_models.md（ドメイン定義）
- データベーススキーマ（profiles.avatar_type）
- 認証システム

## 次のタスク

- リアルタイムアバター同期（05_avatar_realtime_sync.md）
