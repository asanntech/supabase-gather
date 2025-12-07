# [07_presence] 01_Presenceタイプ定義・インターフェース

## 目的

Supabase Realtime Presenceで使用するデータ構造とTypeScriptインターフェースの定義を行う。

## 成果物

- `src/features/presence/domain/types.ts`
- `src/features/presence/domain/interfaces.ts`

## 実装内容

### 1. PresenceDataインターフェース

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

### 2. Presenceイベント型定義

```typescript
type PresenceEvent = 'sync' | 'join' | 'leave'

interface PresenceEventPayload {
  event: PresenceEvent
  newPresences?: PresenceData[]
  leftPresences?: PresenceData[]
}
```

### 3. ルームPresence管理型

```typescript
interface RoomPresenceState {
  [clientId: string]: PresenceData[]
}

interface RoomCapacityResult {
  canEnter: boolean
  currentUsers: number
  maxCapacity: number
  message?: string
}
```

### 4. Presenceチャンネル型

```typescript
interface PresenceChannel {
  roomId: string
  channelName: string
  isSubscribed: boolean
  presenceState: RoomPresenceState
}
```

## 受け入れ条件

- [ ] PresenceDataインターフェースが仕様通り定義されている
- [ ] イベント型とペイロード型が適切に型付けされている
- [ ] RoomPresenceStateが他ユーザー情報の型安全な管理を提供している
- [ ] RoomCapacityResultが入室可否判定の明確な結果を表現している
- [ ] TypeScriptコンパイルエラーが発生しない

## 注意事項

- `user_id`はGoogleユーザーのみ必須、ゲストユーザーは`undefined`
- `last_seen`は ISO 8601 形式のタイムスタンプ文字列
- 座標`x`, `y`は2Dキャンバス上の絶対位置を想定
- `avatar_type`は後続のアバター機能と連携する識別子

## 関連ファイル

- `src/features/auth/domain/types.ts` (認証情報との連携)
- `src/features/room/domain/types.ts` (ルーム情報との連携)
