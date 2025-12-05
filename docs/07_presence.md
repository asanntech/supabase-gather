# 07. リアルタイム機能・同時接続制限

## 概要

Supabase Realtime Presenceを活用したリアルタイム機能と同時接続数制限の仕様。

## Presenceシステム

### 基本仕組み

- **Supabase Realtime Presence**を使用
- WebSocketベースのリアルタイム通信
- クライアント間での状態同期

### チャンネル設計

- **チャンネル名**：`room:{room_id}`
- **例**：`room:550e8400-e29b-41d4-a716-446655440000`
- ルームごとに独立したPresenceチャンネル

## 同時接続数制限（5人まで）

### 制限の仕組み

#### 入室前チェック

1. Presenceチャンネルに接続
2. 現在の`presenceState`を取得
3. 接続中クライアント数をカウント
4. 判定：
   - **5人未満**：入室許可
   - **5人以上**：「満員です（5/5）」表示

#### リアルタイム監視

- 他ユーザーの入退室を即座に検知
- UI表示の動的更新（人数表示等）
- 満員状態の自動解除

### 実装フロー

```typescript
// 擬似コード例
const checkRoomCapacity = async (roomId: string) => {
  const channel = supabase.channel(`room:${roomId}`)

  // Presenceに接続
  await channel.subscribe()

  // 現在の接続数取得
  const presenceState = channel.presenceState()
  const currentUsers = Object.keys(presenceState).length

  // 入室可否判定
  if (currentUsers >= 5) {
    return { canEnter: false, message: '満員です（5/5）' }
  }

  return { canEnter: true, currentUsers }
}
```

## Presenceデータ構造

### 送信データ

各クライアントが Presence に送信するデータ：

```typescript
interface PresenceData {
  user_type: 'google' | 'guest'
  user_id?: string // Googleユーザーのみ
  display_name: string
  avatar_type: string
  x: number // 座標X
  y: number // 座標Y
  last_seen: string // ISO timestamp
}
```

### 受信・処理

他ユーザーの情報をリアルタイムで受信・反映：

```typescript
channel
  .on('presence', { event: 'sync' }, () => {
    const presenceState = channel.presenceState()

    // 接続ユーザー一覧更新
    updateConnectedUsers(presenceState)

    // 2Dスペース上のアバター位置更新
    updateAvatarPositions(presenceState)

    // 人数表示更新
    updateUserCount(Object.keys(presenceState).length)
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    console.log('新しいユーザーが入室:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ leftPresences }) => {
    console.log('ユーザーが退室:', leftPresences)
  })
```

## リアルタイム機能詳細

### 1. アバター移動同期

- ユーザーがアバターを移動
- Presenceデータを更新
- 他ユーザー画面にリアルタイム反映

### 2. チャット機能

- **送信**：`messages`テーブルへINSERT
- **受信**：Supabase Realtimeの`postgres_changes`で監視
- リアルタイムでチャット表示更新

```typescript
// チャットのリアルタイム監視
supabase
  .channel('messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    payload => {
      addMessageToChat(payload.new)
    }
  )
  .subscribe()
```

### 3. 入退室通知

- Presenceの`join`/`leave`イベントを監視
- UI上で入退室を視覚的に表示
- 人数カウンターの即座更新

## 将来の厳密化オプション

### データベースベース管理

より厳密な人数制限が必要な場合：

```sql
-- 入室記録テーブル
CREATE TABLE room_members (
  room_id    uuid REFERENCES rooms(id),
  client_id  text,
  joined_at  timestamp DEFAULT NOW(),
  left_at    timestamp NULL,
  PRIMARY KEY (room_id, client_id)
);
```

- 入室時：`room_members`にINSERT
- 退室時：`left_at`を更新
- 人数制限：`COUNT(*) WHERE left_at IS NULL`で判定

### セッション管理

- セッションタイムアウト検知
- 異常切断時の自動退室処理
- 重複接続の防止

## パフォーマンス考慮

### 最適化ポイント

1. **Presence更新頻度**：移動時の更新間隔調整
2. **データサイズ**：必要最小限の情報のみ送信
3. **接続管理**：不要なチャンネルからの切断

### 監視項目

- 同時接続数
- メッセージ送信頻度
- Presence更新頻度
- エラー率・切断率
