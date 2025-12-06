# 04. 移動操作機能

## タスク概要

マウスとキーボードによるアバター移動操作を実装する。

## 実装内容

### 1. マウス操作

#### クリック移動

- スペース内クリックでの目標位置設定
- クリック座標の取得・変換
- 境界判定
- スムーズなアニメーション移動

#### 移動アニメーション

- CSS Transitions使用
- transform プロパティでの移動
- ease-out イージング
- 移動時間: 300ms

### 2. キーボード操作

#### WASD / 矢印キー

- W/↑: 上移動
- A/←: 左移動
- S/↓: 下移動
- D/→: 右移動

#### 連続移動

- キー押下中の連続移動
- requestAnimationFrame での滑らかな移動
- キー離脱時の停止

### 3. 移動ロジック

#### 境界判定

```typescript
const clampPosition = (x: number, y: number) => ({
  x: Math.max(24, Math.min(776, x)), // アバター半径考慮
  y: Math.max(24, Math.min(576, y)),
})
```

#### 移動速度

- マウス移動: アニメーション遷移
- キーボード移動: 5px/frame

### 4. 状態管理

#### 位置状態

```typescript
type Position = {
  x: number
  y: number
}

type MovementState = {
  currentPosition: Position
  targetPosition: Position
  isMoving: boolean
  movementType: 'mouse' | 'keyboard' | 'idle'
}
```

### 5. イベントハンドリング

- マウスクリックイベント
- キーボード押下・離脱イベント
- フォーカス管理
- イベントリスナーのクリーンアップ

## 技術仕様

### 移動制限

- スペース境界内での移動
- アバターサイズを考慮した余白
- 他ユーザーとの衝突回避（将来実装）

### パフォーマンス

- デバウンス処理（位置更新の頻度制限）
- 不要な再レンダリングの防止

## 成果物

- アバター移動操作機能
- マウス・キーボード両対応
- スムーズなアニメーション

## 次のタスク

05_position_sync.md - リアルタイム位置同期の実装
