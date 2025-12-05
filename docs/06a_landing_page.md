# 06a. ランディングページ実装

## 概要

アプリの最初のエントリーポイントとなるランディングページ（`/`）の実装。
シンプルでわかりやすいUIで認証オプションを提供する。

## 画面仕様

### ルート

- **パス**: `/`
- **コンポーネント**: `src/app/page.tsx`

### 機能要件

#### 1. ヘッダー情報

- **アプリ名**: 「Supabase Gather」を大きく表示
- **説明文**: 「バーチャルオフィスでチームとつながろう」（1〜2行）
- **ブランディング**: シンプルで親しみやすいデザイン

#### 2. 認証オプション

**Google認証ボタン**
- ボタンテキスト: 「Googleでログインして入室する」
- Googleアイコン付き
- プライマリーボタンとして目立たせる

**ゲスト認証ボタン**
- ボタンテキスト: 「ゲストとして入室する」
- セカンダリーボタンとして配置
- 手軽さを強調

#### 3. 状態管理

- 認証処理中はローディング表示
- 認証完了後は入室準備モーダルを表示
- エラー時は適切なエラーメッセージ

### デザイン仕様

#### Figmaデザイン準拠

以下のデザインを完全に再現する：
https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-2&t=h312ToASd1B6kW07-0

#### レイアウト構成

- **中央寄せレイアウト**
- **レスポンシブデザイン**（モバイル対応）
- **shadcn/ui コンポーネント**使用
- **Tailwind CSS**でスタイリング

## 技術実装

### 必要なコンポーネント

#### 1. ランディングページ本体

```typescript
// src/app/page.tsx
export default function HomePage() {
  // 認証状態管理
  // 入室準備モーダルの表示制御
  // 認証ハンドラー実装
}
```

#### 2. 認証ボタンコンポーネント

```typescript
// src/shared/ui/auth-button
// Google認証ボタン
// ゲスト認証ボタン
// ローディング状態対応
```

#### 3. 入室準備モーダル（後で実装）

```typescript
// src/features/room-entry/ui/room-entry-modal
// 表示名設定
// アバター選択
// 入室アクション
```

### 状態管理設計

#### 認証状態

- Zustand (`useAuthStore`) を使用
- 認証完了時に入室準備モーダルを表示
- Google/ゲストの認証フローを統一

#### ページ状態

```typescript
type PageState = {
  isAuthenticating: boolean
  showRoomEntryModal: boolean
  authError: string | null
}
```

### ユーザーフロー

#### Google認証フロー

1. 「Googleでログイン」ボタンクリック
2. `signInWithGoogle()` 実行
3. ローディング表示
4. 認証成功 → 入室準備モーダル表示
5. 認証失敗 → エラーメッセージ表示

#### ゲスト認証フロー

1. 「ゲストとして入室」ボタンクリック
2. `signInAsGuest()` 実行
3. 即座に入室準備モーダル表示

## エラーハンドリング

### 認証エラー

- Google認証失敗時の適切なメッセージ
- ネットワークエラー時の再試行オプション
- ユーザーフレンドリーなエラー表示

### UX改善

- ボタンの無効化でダブルクリック防止
- 適切なローディングアニメーション
- スムーズな画面遷移

## 実装順序

1. **基本レイアウト作成**：shadcn/uiコンポーネントでUI構築
2. **認証ボタン実装**：Google/ゲスト認証の基本機能
3. **状態管理連携**：useAuthStoreとの統合
4. **モーダル表示制御**：認証後の入室準備モーダル表示
5. **エラーハンドリング**：各種エラー状態の処理
6. **デザイン調整**：Figmaデザインとの完全一致

## 関連ファイル

- `src/app/page.tsx` - メインページ
- `src/features/auth/application/hooks/use-auth.ts` - 認証フック
- `src/features/auth/application/stores/auth-store.ts` - 認証状態管理
- `src/shared/ui/button/` - ボタンコンポーネント
- `src/shared/ui/loading-spinner/` - ローディング表示