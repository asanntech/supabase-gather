# [06c_room_screen] 05\_リアルタイム位置同期

## タスク概要

Presence チャンネルを使用してアバター位置をリアルタイムで同期する。

## 実装内容

### 1. Presence データ構造

```typescript
type PresenceData = {
  user_type: 'google' | 'guest'
  user_id: string | null
  display_name: string
  avatar_type: AvatarType
  position: { x: number; y: number }
  last_seen: string
}
```

### 2. 位置更新送信

#### デバウンス処理

- 位置変更から200ms後に送信
- 頻繁な更新を抑制
- バッチ処理での効率化

#### 差分更新

- 前回送信位置との比較
- 5px以上の変化で送信
- 不要な通信の削減

### 3. 位置更新受信

#### Presenceイベント処理

- sync: 全参加者の位置更新
- join: 新規参加者の位置設定
- leave: 参加者の削除

#### 参加者状態管理

```typescript
type Participant = {
  clientId: string
  user_type: 'google' | 'guest'
  user_id: string | null
  display_name: string
  avatar_type: AvatarType
  position: { x: number; y: number }
  lastSeen: Date
}
```

### 4. アバター同期表示

#### 他ユーザーアバター更新

- Presence データからのアバター描画
- 位置変化のスムーズなアニメーション
- 表示名・アバタータイプの反映

#### 自分のアバター

- ローカル状態での即座更新
- Presenceエコーバックの無視
- 同期ずれの修正機能

### 5. エラー処理

#### 同期エラー

- 位置更新失敗の検出
- 自動再同期の実行
- エラー通知の表示

#### ネットワーク復旧

- 再接続時の位置復元
- 状態の整合性確認

## 技術仕様

### 更新頻度

- 送信間隔: 最大200ms
- 移動閾値: 5px
- タイムアウト: 10秒

### パフォーマンス最適化

- メモリ使用量の管理
- 古い状態の自動削除
- バックグラウンドでの同期

## 成果物

- リアルタイム位置同期機能
- 他ユーザーアバターの表示
- ネットワークエラー処理

## 次のタスク

06_chat_basic.md - チャット基本機能の実装
