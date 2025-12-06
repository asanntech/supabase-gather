# 02. 入室前チェック・同時接続数制限実装

## 目的

Supabase Realtime Presenceを使用してルームの同時接続数（最大5人）を制限する機能を実装する。

## 成果物

- `src/features/presence/infrastructure/capacityService.ts`
- `src/features/presence/application/useRoomCapacity.ts`
- `src/features/presence/domain/capacityRepository.ts`

## 実装内容

### 1. 容量チェックサービス

```typescript
// capacityService.ts
class CapacityService {
  private readonly MAX_CAPACITY = 5

  async checkRoomCapacity(roomId: string): Promise<RoomCapacityResult> {
    const channel = supabase.channel(`room:${roomId}`)

    // Presenceに接続
    await channel.subscribe()

    // 現在の接続数取得
    const presenceState = channel.presenceState()
    const currentUsers = Object.keys(presenceState).length

    // 入室可否判定
    if (currentUsers >= this.MAX_CAPACITY) {
      return {
        canEnter: false,
        currentUsers,
        maxCapacity: this.MAX_CAPACITY,
        message: `満員です（${currentUsers}/${this.MAX_CAPACITY}）`,
      }
    }

    return {
      canEnter: true,
      currentUsers,
      maxCapacity: this.MAX_CAPACITY,
    }
  }
}
```

### 2. Reactフック

```typescript
// useRoomCapacity.ts
export const useRoomCapacity = (roomId: string) => {
  const [capacityResult, setCapacityResult] =
    useState<RoomCapacityResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkCapacity = useCallback(async () => {
    setIsChecking(true)
    try {
      const result = await capacityService.checkRoomCapacity(roomId)
      setCapacityResult(result)
    } catch (error) {
      console.error('容量チェックエラー:', error)
    } finally {
      setIsChecking(false)
    }
  }, [roomId])

  return {
    capacityResult,
    isChecking,
    checkCapacity,
    canEnter: capacityResult?.canEnter ?? false,
  }
}
```

### 3. リアルタイム監視

- Presenceの`sync`, `join`, `leave`イベントを監視
- 他ユーザーの入退室をリアルタイムで検知
- 満員状態の自動解除

```typescript
// リアルタイム監視の実装例
channel.on('presence', { event: 'sync' }, () => {
  const presenceState = channel.presenceState()
  const currentUsers = Object.keys(presenceState).length

  // UI更新：人数表示の更新
  updateUserCount(currentUsers)

  // 満員状態の解除判定
  if (currentUsers < MAX_CAPACITY && wasFullBefore) {
    setRoomStatus('available')
  }
})
```

## 実装手順

1. **ドメイン層の定義**
   - `RoomCapacityResult`インターフェース
   - 容量チェックのリポジトリインターフェース

2. **インフラストラクチャ層**
   - Supabase Realtime Presenceとの統合
   - 容量チェックロジックの実装

3. **アプリケーション層**
   - 容量チェックのユースケース
   - Reactフックの実装

4. **プレゼンテーション層**
   - 満員時のUI表示
   - リアルタイム人数表示

## 受け入れ条件

- [ ] 5人までの同時接続制限が正常に動作する
- [ ] 満員時に適切なメッセージが表示される
- [ ] 他ユーザーの入退室がリアルタイムで反映される
- [ ] 人数表示が動的に更新される
- [ ] エラーハンドリングが適切に実装されている
- [ ] TypeScript型安全性が保たれている

## テストケース

- [ ] ルーム入室時の容量チェック
- [ ] 満員時の入室拒否
- [ ] 退室時の容量解放
- [ ] 異常切断時の状態更新
- [ ] 複数ユーザー同時アクセス

## 注意事項

- Presenceチャンネル名は`room:{room_id}`形式を使用
- 接続失敗時の適切なクリーンアップ処理
- WebSocket切断時の状態復旧
- 同時接続による競合状態の考慮

## 関連ファイル

- `src/features/presence/domain/types.ts`
- `src/features/room/hooks/useRoomEntry.ts`
