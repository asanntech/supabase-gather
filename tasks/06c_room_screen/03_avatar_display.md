# [06c_room_screen] 03_アバター表示

## タスク概要

2Dスペース内でのアバター表示機能を実装する。

## 実装内容

### 1. 2Dスペースコンポーネント

`src/features/room/ui/avatar-space.tsx`

- スペースサイズ: 800x600px
- シンプルなグリッド背景
- 境界線の設定

### 2. アバター描画

#### 自分のアバター

- 選択されたAvatarTypeに基づくSVG表示
- 初期位置の設定
- 表示名の表示

#### 他ユーザーのアバター

- Presence データからの参加者情報取得
- 各参加者のアバター描画
- リアルタイム更新対応

### 3. アバターコンポーネント

`src/features/room/ui/components/avatar.tsx`

- AvatarType に基づくSVG描画
- 表示名の表示
- 位置指定（x, y座標）
- アニメーション対応

### 4. スペース境界管理

- 移動可能範囲の定義
- 境界判定ロジック
- 他ユーザーとの重複回避（将来対応）

### 5. レスポンシブ対応

- モバイル表示時のサイズ調整
- タッチ操作への準備

## 技術仕様

### 座標系

- 左上を原点(0,0)とする
- x軸: 0 〜 800px
- y軸: 0 〜 600px

### アバターサイズ

- 48x48px（標準）
- 表示名: 12px font-size

## 成果物

- `src/features/room/ui/avatar-space.tsx`
- `src/features/room/ui/components/avatar.tsx`
- 静的なアバター表示機能

## 次のタスク

04_movement_controls.md - 移動操作機能の実装
