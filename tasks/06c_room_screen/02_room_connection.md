# [06c_room_screen] 02\_ルーム接続機能

## タスク概要

Presence チャンネルを使用したルーム接続管理機能を実装する。

## 実装内容

### 1. ルーム状態管理

`src/features/room/application/hooks/use-room.ts`

```typescript
type RoomState = {
  roomId: string
  roomName: string
  participants: Participant[]
  currentUser: {
    clientId: string
    position: { x: number; y: number }
    displayName: string
    avatarType: AvatarType
  }
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  error: string | null
}
```

### 2. Presence チャンネル接続

- ルームID に基づいたチャンネル作成
- 認証状態の確認
- 接続・切断・再接続の処理
- エラーハンドリング

### 3. 参加者情報管理

- 新規参加者の検出
- 参加者退室の検出
- 参加者リストの同期

### 4. 接続状態表示

`src/features/room/ui/room-header.tsx`

- 接続状態インジケーター
- 参加人数の表示
- ルーム名の表示

### 5. エラーハンドリング

- 初回接続失敗: 再試行ボタン
- 途中切断: 自動再接続試行
- 認証エラー: トップページリダイレクト

## 依存関係

- 認証機能（user-type, user-id, display-name）
- avatar-type の取得

## 成果物

- `src/features/room/application/hooks/use-room.ts`
- `src/features/room/ui/room-header.tsx`
- Presence チャンネル接続機能

## 次のタスク

03_avatar_display.md - アバター表示機能の実装
