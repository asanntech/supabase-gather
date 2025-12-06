# 06b. 入室準備モーダル実装タスク

このディレクトリには、`docs/06b_room_entry_modal.md` の仕様書を Claude Code が最適に処理できるよう分割したタスクファイルが含まれています。

## タスク実行順序

以下の順序で実装を進めることを推奨します：

### 1. [01_modal_base_setup.md](./01_modal_base_setup.md)
- shadcn/ui Dialog コンポーネントのセットアップ
- モーダルの基本構造作成
- **所要時間**: 30-45分
- **依存関係**: なし

### 2. [02_avatar_selector_component.md](./02_avatar_selector_component.md)
- アバターセレクターコンポーネント実装
- 5色のSVGアバター表示・選択機能
- **所要時間**: 60-90分
- **依存関係**: 01完了後

### 3. [03_room_status_monitoring.md](./03_room_status_monitoring.md)
- Supabase Presence チャンネルによるルーム監視
- リアルタイム人数表示・状態管理
- **所要時間**: 90-120分
- **依存関係**: 01完了後

### 4. [04_form_input_validation.md](./04_form_input_validation.md)
- 表示名入力フォーム・バリデーション機能
- Google/ゲストユーザー対応
- **所要時間**: 75-90分
- **依存関係**: 01完了後

### 5. [05_business_logic_state_management.md](./05_business_logic_state_management.md)
- 入室・キャンセル処理のビジネスロジック
- 統合状態管理・ルート遷移
- **所要時間**: 120-150分
- **依存関係**: 02, 03, 04完了後

### 6. [06_error_handling.md](./06_error_handling.md)
- 包括的なエラーハンドリング
- 自動復旧・再試行機能
- **所要時間**: 90-120分
- **依存関係**: 05完了後

### 7. [07_figma_design_implementation.md](./07_figma_design_implementation.md)
- Figmaデザイン完全実装
- レスポンシブ対応・アクセシビリティ
- **所要時間**: 120-180分
- **依存関係**: 全タスク完了後

## 総所要時間

**合計**: 約8-12時間の実装時間

## 技術スタック

- **フレームワーク**: Next.js App Router + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **状態管理**: TanStack Query + React hooks
- **バックエンド**: Supabase (認証・DB・Presence)

## 実装後の確認項目

- [ ] 認証後にモーダルが正常に表示される
- [ ] 表示名・アバター設定が機能する
- [ ] リアルタイムでルーム人数が更新される
- [ ] 入室・キャンセル処理が正常に動作する
- [ ] エラー状態が適切に処理される
- [ ] Figmaデザインが完璧に再現されている
- [ ] レスポンシブデザインが全デバイスで動作する
- [ ] アクセシビリティ要件に準拠している

## 関連ドキュメント

- [元の仕様書](../../docs/06b_room_entry_modal.md)
- [プロジェクトのCLAUDE.md](../../CLAUDE.md)