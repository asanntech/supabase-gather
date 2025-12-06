# 02. アバターアセットセットアップ

## 目的
アバター画像ファイルの配置とアセット管理システムを構築する

## 実装内容

### 1. アセットディレクトリ構造
```
public/
  avatars/
    blue.svg
    purple.svg
    cyan.svg
    indigo.svg
    green.svg
```

### 2. SVGアバターアセット作成
- 32x32ピクセルのドット絵スタイルSVGファイルを作成
- 各色バリエーション（blue, purple, cyan, indigo, green）
- 統一されたデザインスタイル

### 3. アセット管理ユーティリティ
- `src/shared/utils/avatarUtils.ts` を作成
- アバター画像パス生成関数：
  ```typescript
  export const getAvatarImagePath = (avatarType: AvatarColor) => 
    `/avatars/${avatarType}.svg`
  ```

### 4. アセットプリロード機能
- 初期ロード時の全アバター画像プリロード
- パフォーマンス最適化

## 成果物
- 5色のアバターSVGファイル
- アセット管理ユーティリティ
- 画像パス生成の標準化

## 依存関係
- 01_avatar_domain_models.md（AvatarColor型）

## 次のタスク
- アバター選択UI実装（03_avatar_selection_ui.md）