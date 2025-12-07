# [07_presence] 03_リアルタイムアバター移動同期

## 目的

Supabase Realtime Presenceを使用してユーザーのアバター移動をリアルタイムで同期する機能を実装する。

## 成果物

- `src/features/presence/infrastructure/presenceService.ts`
- `src/features/presence/application/usePresenceSync.ts`
- `src/features/presence/hooks/useAvatarMovement.ts`

## 実装内容

### 1. Presenceサービス

```typescript
// presenceService.ts
class PresenceService {
  private channel: RealtimeChannel | null = null

  async joinRoom(roomId: string, userData: PresenceData): Promise<void> {
    this.channel = supabase.channel(`room:${roomId}`)

    await this.channel
      .on('presence', { event: 'sync' }, this.handlePresenceSync)
      .on('presence', { event: 'join' }, this.handleUserJoin)
      .on('presence', { event: 'leave' }, this.handleUserLeave)
      .subscribe()

    // 自分のPresence情報を送信
    await this.channel.track(userData)
  }

  async updatePosition(x: number, y: number): Promise<void> {
    if (!this.channel) return

    const currentPresence = this.channel.presenceState()
    const myClientId = this.channel.socket.ref

    if (currentPresence[myClientId]) {
      const updatedData = {
        ...currentPresence[myClientId][0],
        x,
        y,
        last_seen: new Date().toISOString(),
      }

      await this.channel.track(updatedData)
    }
  }
}
```

### 2. アバター移動フック

```typescript
// useAvatarMovement.ts
export const useAvatarMovement = (roomId: string) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [otherUsers, setOtherUsers] = useState<Record<string, PresenceData>>({})
  const presenceService = useRef<PresenceService>(new PresenceService())

  // 位置更新（スロットリング付き）
  const updatePosition = useMemo(
    () =>
      throttle(async (x: number, y: number) => {
        setPosition({ x, y })
        await presenceService.current.updatePosition(x, y)
      }, 100), // 100ms間隔でスロットリング
    []
  )

  // マウス移動ハンドラー
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      updatePosition(x, y)
    },
    [updatePosition]
  )

  return {
    position,
    otherUsers,
    handleMouseMove,
    joinRoom: presenceService.current.joinRoom,
    leaveRoom: presenceService.current.leaveRoom,
  }
}
```

### 3. Presenceイベントハンドラー

```typescript
// Presence同期処理
const handlePresenceSync = () => {
  const presenceState = channel.presenceState()
  const myClientId = channel.socket.ref

  // 他ユーザーの情報を抽出（自分以外）
  const otherUsers = Object.entries(presenceState)
    .filter(([clientId]) => clientId !== myClientId)
    .reduce(
      (acc, [clientId, presences]) => {
        acc[clientId] = presences[0] // 最新のPresenceデータを使用
        return acc
      },
      {} as Record<string, PresenceData>
    )

  setOtherUsers(otherUsers)
  updateAvatarPositions(otherUsers)
}

// ユーザー入室処理
const handleUserJoin = ({ newPresences }: { newPresences: PresenceData[] }) => {
  console.log('新しいユーザーが入室:', newPresences)
  // 入室通知UIの表示
  showJoinNotification(newPresences[0].display_name)
}

// ユーザー退室処理
const handleUserLeave = ({
  leftPresences,
}: {
  leftPresences: PresenceData[]
}) => {
  console.log('ユーザーが退室:', leftPresences)
  // 退室通知UIの表示
  showLeaveNotification(leftPresences[0].display_name)
}
```

### 4. 2Dキャンバス連携

```typescript
// アバター描画更新
const updateAvatarPositions = (users: Record<string, PresenceData>) => {
  // キャンバスをクリア
  context.clearRect(0, 0, canvas.width, canvas.height)

  // 各ユーザーのアバターを描画
  Object.values(users).forEach(userData => {
    drawAvatar(
      context,
      userData.x,
      userData.y,
      userData.avatar_type,
      userData.display_name
    )
  })

  // 自分のアバターも描画
  drawAvatar(context, position.x, position.y, myAvatarType, myDisplayName)
}
```

## 最適化・パフォーマンス

### 1. 更新頻度制限

- **スロットリング**: 100ms間隔でPosition更新を制限
- **デバウンス**: 連続移動時の不要な更新を抑制
- **差分更新**: 位置が変わった場合のみPresence更新

### 2. データサイズ最適化

```typescript
// 最小限のデータのみ送信
interface OptimizedPresenceData {
  x: number
  y: number
  last_seen: string
  // display_nameやavatar_typeは初回のみ送信
}
```

### 3. 描画最適化

- **requestAnimationFrame**: 滑らかな描画更新
- **差分描画**: 変更された部分のみ再描画
- **オフスクリーンキャンバス**: バックグラウンド描画

## 実装手順

1. **Presenceサービス基盤**
   - チャンネル接続・切断
   - イベントハンドラー登録

2. **位置同期ロジック**
   - Position更新の実装
   - スロットリング機能

3. **UI連携**
   - マウス移動イベント
   - キャンバス描画更新

4. **通知機能**
   - 入退室通知
   - エラー処理

## 受け入れ条件

- [ ] ユーザーの移動がリアルタイムで他ユーザーに反映される
- [ ] 100ms間隔のスロットリングが正常に動作する
- [ ] 入退室時の通知が表示される
- [ ] 異常切断時の適切なクリーンアップ
- [ ] アバター描画がスムーズに更新される
- [ ] メモリリークが発生しない

## テストケース

- [ ] 複数ユーザー同時移動
- [ ] 高頻度位置更新
- [ ] ネットワーク切断・再接続
- [ ] ブラウザタブ切り替え
- [ ] 長時間接続維持

## 注意事項

- WebSocket接続の状態管理
- メモリリークの防止（イベントリスナー解除）
- モバイルデバイスでのタッチイベント対応
- ネットワーク遅延時の処理

## 関連ファイル

- `src/features/presence/domain/types.ts`
- `src/features/avatar/components/AvatarCanvas.tsx`
- `src/features/room/hooks/useRoom.ts`
