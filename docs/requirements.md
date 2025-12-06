# Supabase Gather - 要件定義書

## プロジェクト概要

**Gather風バーチャルオフィスアプリ**

- Next.js + Supabase構成
- 最大5人同時接続の2Dスペース
- Google認証 + ゲスト認証対応

## 1. 認証システム要件

### 認証方式

- **Google OAuth2.0**: Supabase Authベース、永続ユーザー管理
- **ゲストログイン**: 一時的、セッション終了で消失

## 2. ルーム要件

- **1ルーム固定**: MVPでは "main-room" のみ
- **同時接続制限**: 最大5人（Presence管理）
- **将来拡張**: マルチルーム対応可能な設計

## 3. アバター要件

- **ドット絵**: 32x32ピクセル、色違いバリエーション
- **識別方式**: `avatar_type` 文字列（例: "blue", "purple"）
- **永続化**: Googleユーザーは保存、ゲストは一時的

## 4. 画面フロー要件

### 基本フロー

1. **ランディング** (`/`) → 認証選択
2. **入室準備モーダル** → 名前・アバター設定
3. **ルーム画面** (`/room/:room_id`) → メイン機能

### UI参考

- ランディング: [Figma](https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-2&t=h312ToASd1B6kW07-0)
- モーダル: [Figma](https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-59&t=h312ToASd1B6kW07-0)
- ルーム: [Figma](https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-162&t=h312ToASd1B6kW07-0)

## 5. データベース要件

### 主要テーブル

- **profiles**: Googleユーザーのみ（名前・アバター永続化）
- **rooms**: ルーム管理（MVP: 1件固定、将来: 多対応）
- **messages**: チャット（ゲスト: user_id=null）
- **avatar_positions**: アバター座標（Presence連携）

詳細設計は `02_database.md` を参照

## 6. 技術制約・注意事項

### セキュリティ制約

- **ゲストRLS制限**: ユーザー単位制御不可
- **MVP対応**: 全ユーザー読み書き可能な公開設計

### 将来拡張性

- **マルチルーム**: テーブル設計で対応済み
- **ゲスト機能**: 匿名ログインへの移行可能

## 7. 実装優先順位

1. **データベース設計** - 全機能の基盤
2. **認証システム** - Google + ゲスト
3. **ルーム機能** - 接続制限・管理
4. **UI実装** - ランディング → モーダル → ルーム
5. **リアルタイム機能** - Presence・チャット

詳細タスクは `docs/README.md` の実行順序を参照
