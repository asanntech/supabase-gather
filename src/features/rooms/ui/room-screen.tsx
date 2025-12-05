'use client'

import React, { useState } from 'react'
import { AppUser } from '@/features/auth/domain/types'
import { TwoDSpace } from './two-d-space'
import { RoomChat } from './room-chat'
import { EntrySetupModal } from './entry-setup-modal'
import { EntrySetupData } from '../domain/types/entry'
import { useRoom } from '../application/hooks/use-room'
import { useRoomPresence } from '../application/hooks/use-room-presence'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'
import { Alert } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

interface RoomScreenProps {
  roomId: string
  user: AppUser
}

/**
 * ルーム画面メインコンポーネント
 * 入室準備モーダル → 2Dスペース + チャット
 */
export function RoomScreen({ roomId, user }: RoomScreenProps) {
  const [showEntrySetup, setShowEntrySetup] = useState(true)
  const [entryData, setEntryData] = useState<EntrySetupData | null>(null)

  const {
    roomInfo,
    isLoading,
    joinRoom,
    leaveRoom,
    isJoining,
    isLeaving,
    joinError,
  } = useRoom(roomId)

  const { currentMembers, memberCount, isUserInRoom } = useRoomPresence(roomId)

  const isCurrentUserInRoom = isUserInRoom(user.id)

  // 入室準備完了後の処理
  const handleEntryConfirm = async (data: EntrySetupData) => {
    setEntryData(data)
    setShowEntrySetup(false)

    // ユーザー情報を更新して入室
    const updatedUser: AppUser =
      user.provider === 'google'
        ? {
            ...user,
            name: data.displayName,
            avatarType: data.avatarType,
          }
        : {
            ...user,
            name: data.displayName,
            avatarType: data.avatarType,
          }

    await joinRoom(updatedUser)
  }

  const handleEntryCancel = () => {
    // キャンセル時はトップページに戻る
    window.location.href = '/'
  }

  // エラー時の再試行
  const handleRetry = () => {
    setShowEntrySetup(true)
    setEntryData(null)
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">ルーム情報を読み込み中...</p>
          </div>
        </Card>
      </div>
    )
  }

  // ルームが見つからない
  if (!roomInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-2">
              <h3 className="font-semibold">ルームが見つかりません</h3>
              <p className="text-sm mt-1">
                指定されたルームは存在しないか、アクセスできません。
              </p>
            </div>
          </Alert>
          <Button
            className="w-full mt-4"
            onClick={() => (window.location.href = '/')}
          >
            トップページに戻る
          </Button>
        </Card>
      </div>
    )
  }

  // 入室準備モーダル表示
  if (showEntrySetup && !isCurrentUserInRoom) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EntrySetupModal
          user={user}
          roomInfo={{
            id: roomInfo.id,
            name: roomInfo.name,
            currentOccupants: memberCount,
            maxOccupants: roomInfo.maxOccupants,
          }}
          onConfirm={handleEntryConfirm}
          onCancel={handleEntryCancel}
        />
      </div>
    )
  }

  // 入室処理中
  if (isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">ルームに入室中...</p>
          </div>
        </Card>
      </div>
    )
  }

  // 入室エラー
  if (joinError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-2">
              <h3 className="font-semibold">入室に失敗しました</h3>
              <p className="text-sm mt-1">{joinError.message}</p>
            </div>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleEntryCancel}
            >
              キャンセル
            </Button>
            <Button className="flex-1" onClick={handleRetry}>
              再試行
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // メインルーム画面
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{roomInfo.name}</h1>
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                memberCount >= roomInfo.maxOccupants
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span>
                {memberCount} / {roomInfo.maxOccupants}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => leaveRoom()}
            disabled={isLeaving}
          >
            {isLeaving ? '退室中...' : '退室'}
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex">
        {/* 左側：2Dスペース */}
        <div className="flex-1 p-4">
          <TwoDSpace
            currentUser={
              entryData
                ? user.provider === 'google'
                  ? {
                      ...user,
                      name: entryData.displayName,
                      avatarType: entryData.avatarType,
                    }
                  : {
                      ...user,
                      name: entryData.displayName,
                      avatarType: entryData.avatarType,
                    }
                : user
            }
            members={currentMembers}
          />
        </div>

        {/* 右側：チャット */}
        <div className="w-96 bg-white border-l">
          <RoomChat
            currentUser={
              entryData ? { ...user, name: entryData.displayName } : user
            }
          />
        </div>
      </div>
    </div>
  )
}
