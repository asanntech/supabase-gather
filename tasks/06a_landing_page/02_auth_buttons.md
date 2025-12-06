# 02. 認証ボタン実装

## 目的

Google認証とゲスト認証のボタンコンポーネントを実装する

## 実装内容

### 1. Google認証ボタンコンポーネント

- `src/shared/ui/components/GoogleAuthButton.tsx` を作成
- ボタンテキスト: 「Googleでログインして入室する」
- Google アイコン統合
- プライマリーボタンスタイル（目立つデザイン）

### 2. ゲスト認証ボタンコンポーネント

- `src/shared/ui/components/GuestAuthButton.tsx` を作成
- ボタンテキスト: 「ゲストとして入室する」
- セカンダリーボタンスタイル
- 手軽さを強調するデザイン

### 3. 認証ボタンコンテナ

- `src/shared/ui/components/AuthButtonGroup.tsx` を作成
- 2つのボタンを適切にレイアウト
- レスポンシブ対応（縦並び ↔ 横並び）

### 4. ボタン状態管理

```typescript
interface AuthButtonProps {
  isLoading: boolean
  disabled: boolean
  onClick: () => void
}
```

### 5. shadcn/ui Button 統合

- shadcn/ui の Button コンポーネントをベースに使用
- variant プロパティで primary/secondary 区別
- size プロパティでサイズ調整

### 6. アイコン統合

- Google アイコンの適切な表示
- react-icons または Lucide icons 使用
- アイコンとテキストの適切なスペーシング

### 7. ローディング状態

- ボタンクリック時のローディングスピナー表示
- ボタンの無効化
- 視覚的フィードバック

## 成果物

- 再利用可能な認証ボタンコンポーネント
- 適切なローディング状態表示
- Google/ゲスト認証の明確な区別
- レスポンシブ対応

## 依存関係

- 01_landing_page_layout.md（基本レイアウト）
- shadcn/ui Button コンポーネント
- アイコンライブラリ

## 次のタスク

- 認証状態管理統合（03_auth_state_integration.md）
