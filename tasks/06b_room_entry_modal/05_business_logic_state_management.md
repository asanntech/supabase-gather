# Task: ビジネスロジックと状態管理実装

## 目標

ルーム入室とキャンセルのビジネスロジック、データ保存、ルート遷移機能を実装し、統合的な状態管理を提供する

## 実装内容

### 1. 入室処理ビジネスロジック

**ファイル**: `src/features/room-entry/services/room-entry-service.ts`

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AvatarType } from '@/features/avatar/types/avatar'

export interface RoomEntryData {
  displayName: string
  avatarColor: AvatarType
  userId: string
  isGuest: boolean
}

export interface RoomEntryResult {
  success: boolean
  error?: string
  userData?: RoomEntryData
}

export class RoomEntryService {
  private supabase = createClientComponentClient()

  async enterRoom(
    displayName: string,
    avatarColor: AvatarType
  ): Promise<RoomEntryResult> {
    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser()

      if (authError) {
        throw new Error('認証情報の取得に失敗しました')
      }

      const roomEntryData: RoomEntryData = {
        displayName: displayName.trim(),
        avatarColor,
        userId: user?.id || `guest-${Date.now()}`,
        isGuest: !user,
      }

      // Googleユーザーの場合: profilesテーブルを更新
      if (user) {
        const { error: profileError } = await this.supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: displayName.trim(),
            avatar_color: avatarColor,
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('Profile update error:', profileError)
          // プロフィール更新エラーでも入室は続行
        }
      }

      // ローカルストレージにデータ保存（ゲストユーザー用）
      if (!user) {
        localStorage.setItem(
          'guestUserData',
          JSON.stringify({
            displayName: roomEntryData.displayName,
            avatarColor: roomEntryData.avatarColor,
            userId: roomEntryData.userId,
            createdAt: new Date().toISOString(),
          })
        )
      }

      return {
        success: true,
        userData: roomEntryData,
      }
    } catch (error) {
      console.error('Room entry error:', error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '入室処理でエラーが発生しました',
      }
    }
  }

  async cancelEntry(): Promise<void> {
    try {
      // ローカルストレージをクリア
      localStorage.removeItem('guestUserData')

      // 認証状態をクリア
      await this.supabase.auth.signOut()
    } catch (error) {
      console.error('Cancel entry error:', error)
      // エラーが発生してもキャンセルは続行
    }
  }

  // Presenceチャンネルに参加
  async joinPresenceChannel(userData: RoomEntryData) {
    const channel = this.supabase.channel('room-main-room')

    const presenceData = {
      userId: userData.userId,
      displayName: userData.displayName,
      avatarColor: userData.avatarColor,
      joinedAt: new Date().toISOString(),
      isGuest: userData.isGuest,
    }

    return channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track(presenceData)
      }
    })
  }
}
```

### 2. 統合状態管理フック

**ファイル**: `src/features/room-entry/hooks/use-room-entry.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRoomEntryForm } from './use-room-entry-form'
import { useRoomStatus } from '@/features/rooms/hooks/use-room-status'
import { useAvatar } from '@/features/avatar/hooks/use-avatar'
import { RoomEntryService } from '../services/room-entry-service'

export interface RoomEntryState {
  isProcessing: boolean
  error: string | null
  step: 'form' | 'joining' | 'success' | 'error'
}

export function useRoomEntry() {
  const router = useRouter()
  const roomEntryService = new RoomEntryService()

  const [state, setState] = useState<RoomEntryState>({
    isProcessing: false,
    error: null,
    step: 'form',
  })

  // 子フックの統合
  const form = useRoomEntryForm()
  const roomStatus = useRoomStatus()
  const avatar = useAvatar()

  // 入室処理
  const handleEnterRoom = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        step: 'joining',
      }))

      // バリデーション確認
      const validation = form.validateForm()
      if (!validation.isFormValid) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: 'フォームに入力エラーがあります',
          step: 'form',
        }))
        return
      }

      // ルーム状態確認
      if (!roomStatus.isRoomAvailable) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: 'ルームが利用できません',
          step: 'form',
        }))
        return
      }

      // 入室処理実行
      const result = await roomEntryService.enterRoom(
        form.formData.displayName,
        form.formData.selectedAvatar
      )

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: result.error || '入室処理に失敗しました',
          step: 'error',
        }))
        return
      }

      // Presenceチャンネルに参加
      if (result.userData) {
        await roomEntryService.joinPresenceChannel(result.userData)
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        step: 'success',
      }))

      // ルーム画面に遷移
      setTimeout(() => {
        router.push('/room/main-room')
      }, 1000) // 1秒の成功表示後に遷移
    } catch (error) {
      console.error('Enter room error:', error)
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: '予期しないエラーが発生しました',
        step: 'error',
      }))
    }
  }, [form, roomStatus, roomEntryService, router])

  // キャンセル処理
  const handleCancel = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }))

      await roomEntryService.cancelEntry()
      form.resetForm()

      // トップページに遷移
      router.push('/')
    } catch (error) {
      console.error('Cancel error:', error)
      // エラーが発生してもトップページに遷移
      router.push('/')
    }
  }, [roomEntryService, form, router])

  // エラー状態リセット
  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      step: 'form',
    }))
  }, [])

  // 入室ボタンの有効性判定
  const canEnterRoom =
    !state.isProcessing &&
    form.validation.isFormValid &&
    roomStatus.isRoomAvailable &&
    !roomStatus.roomStatus.isConnecting

  return {
    // 状態
    state,
    form,
    roomStatus,
    avatar,

    // 動作
    handleEnterRoom,
    handleCancel,
    resetError,

    // 計算値
    canEnterRoom,
    isLoading: state.isProcessing || roomStatus.roomStatus.isConnecting,
  }
}
```

### 3. アクションボタンコンポーネント

**ファイル**: `src/features/room-entry/ui/room-entry-actions.tsx`

```typescript
"use client"

import { Button } from '@/components/ui/button'
import { Loader2, LogIn, X } from 'lucide-react'

interface RoomEntryActionsProps {
  canEnterRoom: boolean
  isLoading: boolean
  onEnterRoom: () => void
  onCancel: () => void
  className?: string
}

export function RoomEntryActions({
  canEnterRoom,
  isLoading,
  onEnterRoom,
  onCancel,
  className = ''
}: RoomEntryActionsProps) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1"
      >
        <X className="w-4 h-4 mr-2" />
        キャンセル
      </Button>

      <Button
        onClick={onEnterRoom}
        disabled={!canEnterRoom || isLoading}
        className="flex-1"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            入室中...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            ルームに入る
          </>
        )}
      </Button>
    </div>
  )
}
```

### 4. 必要なshadcn/uiコンポーネント追加

```bash
# Button コンポーネント
npx shadcn@latest add button
```

## 検証項目

- [ ] フォームバリデーション完了後に入室処理が実行される
- [ ] Googleユーザーの場合profilesテーブルが更新される
- [ ] ゲストユーザーの場合ローカルストレージに保存される
- [ ] Presenceチャンネルに正常に参加される
- [ ] 成功時にルーム画面に遷移する
- [ ] キャンセル時に認証状態がクリアされる
- [ ] エラー時に適切なメッセージが表示される
- [ ] ローディング状態が適切に管理される

## 関連ファイル

- `src/features/room-entry/services/room-entry-service.ts`
- `src/features/room-entry/hooks/use-room-entry.ts`
- `src/features/room-entry/ui/room-entry-actions.tsx`
- `components/ui/button.tsx` (shadcn/ui)

## 次のタスク

06_error_handling.md - エラーハンドリングと自動復旧機能実装
