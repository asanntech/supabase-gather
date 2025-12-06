# Task: ルーム状態監視機能実装

## 目標
Supabase Presence チャンネルを使用してリアルタイムでルームの人数と状態を監視する機能を実装する

## 実装内容

### 1. ルーム状態タイプ定義
**ファイル**: `src/features/rooms/types/room-status.ts`

```typescript
export type RoomStatusType = 'checking' | 'available' | 'full' | 'error'

export interface RoomStatus {
  status: RoomStatusType
  currentOccupancy: number
  maxOccupancy: number
  isConnecting: boolean
  error: string | null
  lastUpdated: Date
}

export interface RoomPresenceData {
  userId: string
  displayName: string
  avatarColor: string
  joinedAt: string
}
```

### 2. ルーム状態監視フック
**ファイル**: `src/features/rooms/hooks/use-room-status.ts`

```typescript
"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RoomStatus, RoomPresenceData } from '../types/room-status'

const MAX_ROOM_OCCUPANCY = 5

export function useRoomStatus() {
  const [roomStatus, setRoomStatus] = useState<RoomStatus>({
    status: 'checking',
    currentOccupancy: 0,
    maxOccupancy: MAX_ROOM_OCCUPANCY,
    isConnecting: true,
    error: null,
    lastUpdated: new Date()
  })

  const supabase = createClientComponentClient()

  const checkRoomStatus = useCallback(async () => {
    try {
      setRoomStatus(prev => ({ ...prev, isConnecting: true, error: null }))

      // Presence チャンネルに接続してルーム状態をチェック
      const channel = supabase.channel('room-main-room', {
        config: {
          presence: { key: 'room-check' }
        }
      })

      // 現在の人数を取得
      channel.on('presence', { event: 'sync' }, () => {
        const presences = channel.presenceState()
        const currentCount = Object.keys(presences).length

        setRoomStatus(prev => ({
          ...prev,
          currentOccupancy: currentCount,
          status: currentCount >= MAX_ROOM_OCCUPANCY ? 'full' : 'available',
          isConnecting: false,
          lastUpdated: new Date()
        }))
      })

      // エラーハンドリング
      channel.on('presence', { event: 'error' }, (error) => {
        setRoomStatus(prev => ({
          ...prev,
          status: 'error',
          isConnecting: false,
          error: 'ルームへの接続でエラーが発生しました',
          lastUpdated: new Date()
        }))
      })

      // チャンネル購読
      const subscription = await channel.subscribe()
      
      if (subscription === 'SUBSCRIBED') {
        // 一定時間後にタイムアウトチェック
        setTimeout(() => {
          if (roomStatus.isConnecting) {
            setRoomStatus(prev => ({
              ...prev,
              status: 'error',
              isConnecting: false,
              error: '接続がタイムアウトしました',
              lastUpdated: new Date()
            }))
          }
        }, 10000) // 10秒タイムアウト
      }

      return () => {
        channel.unsubscribe()
      }
    } catch (error) {
      setRoomStatus(prev => ({
        ...prev,
        status: 'error',
        isConnecting: false,
        error: 'ルーム状態の確認に失敗しました',
        lastUpdated: new Date()
      }))
    }
  }, [supabase])

  // 自動再試行機能
  const retryConnection = useCallback(() => {
    checkRoomStatus()
  }, [checkRoomStatus])

  useEffect(() => {
    checkRoomStatus()
  }, [checkRoomStatus])

  return {
    roomStatus,
    retryConnection,
    isRoomAvailable: roomStatus.status === 'available',
    isRoomFull: roomStatus.status === 'full',
    hasError: roomStatus.status === 'error'
  }
}
```

### 3. ルーム状態表示コンポーネント
**ファイル**: `src/features/rooms/ui/room-status-display.tsx`

```typescript
"use client"

import { AlertCircle, Users, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { RoomStatus } from '../types/room-status'

interface RoomStatusDisplayProps {
  roomStatus: RoomStatus
  onRetry?: () => void
}

export function RoomStatusDisplay({ roomStatus, onRetry }: RoomStatusDisplayProps) {
  const { status, currentOccupancy, maxOccupancy, isConnecting, error } = roomStatus

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Wifi className="w-4 h-4 animate-pulse" />
        <span className="text-sm">ルームに接続中...</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm underline hover:no-underline"
            >
              再試行
            </button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'full') {
    return (
      <Alert variant="destructive">
        <Users className="w-4 h-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>ルームが満員です</span>
            <Badge variant="destructive">
              {currentOccupancy} / {maxOccupancy} 人
            </Badge>
          </div>
          <p className="text-xs mt-1 text-gray-600">
            しばらくお待ちください。空きが出ると自動で入室可能になります。
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // available 状態
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-800">ルームに入室可能です</span>
      </div>
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {currentOccupancy} / {maxOccupancy} 人
      </Badge>
    </div>
  )
}
```

### 4. 必要なshadcn/uiコンポーネント追加
```bash
# Alert コンポーネント
npx shadcn@latest add alert

# Badge コンポーネント  
npx shadcn@latest add badge
```

## 検証項目
- [ ] Presence チャンネルに正常に接続される
- [ ] リアルタイムで人数が更新される
- [ ] 満員時に適切なメッセージが表示される
- [ ] 接続エラー時にエラーメッセージが表示される
- [ ] 再試行機能が正常に動作する
- [ ] タイムアウト処理が適切に動作する

## 関連ファイル
- `src/features/rooms/types/room-status.ts`
- `src/features/rooms/hooks/use-room-status.ts`
- `src/features/rooms/ui/room-status-display.tsx`
- `components/ui/alert.tsx` (shadcn/ui)
- `components/ui/badge.tsx` (shadcn/ui)

## 次のタスク
04_form_input_validation.md - フォーム入力とバリデーション実装