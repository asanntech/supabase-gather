# 03. アバター選択UI実装

## 目的

アバター選択インターフェースを実装し、ユーザーが直感的にアバターを選択できるようにする

## 実装内容

### 1. アバター選択コンポーネント

- `src/features/avatar/ui/components/AvatarSelector.tsx` を作成
- 5つのアバターカラーを横並び表示
- 選択状態の視覚的フィードバック
- shadcn/ui の Button, Card コンポーネントを活用

### 2. アバタープレビューコンポーネント

- `src/features/avatar/ui/components/AvatarPreview.tsx` を作成
- 選択したアバターのプレビュー表示
- アニメーション効果（hover, selection）

### 3. 入室準備モーダル統合

- ルート `/` での認証後モーダル内にアバター選択を配置
- Figma デザイン仕様に準拠
- モーダル内フォーム要素として統合

### 4. アバター表示コンポーネント

- `src/features/avatar/ui/components/Avatar.tsx` を作成
- チャット、2Dスペース、その他箇所で再利用可能
- サイズバリエーション対応

### 5. カスタムフック

- `src/features/avatar/ui/hooks/useAvatarSelection.ts` を作成
- アバター選択状態管理
- 選択変更時のコールバック処理

## 成果物

- 再利用可能なアバター選択UI
- レスポンシブ対応
- アクセシビリティ対応
- shadcn/ui との統合

## 依存関係

- 01_avatar_domain_models.md（型定義）
- 02_avatar_assets_setup.md（アセット）

## 次のタスク

- アバターデータ永続化（04_avatar_persistence.md）
