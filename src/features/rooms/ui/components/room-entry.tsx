'use client'

import { useEffect } from 'react'
import { AppUser } from '@/features/auth/domain/types'
import { UserAvatar } from '@/features/auth/ui/components/user-avatar'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/alert'
import { Separator } from '@/shared/ui/separator'
import { useRoom } from '../../application/hooks/use-room'
import { useRoomPresence } from '../../application/hooks/use-room-presence'
import {
  Users,
  UserMinus,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface RoomEntryProps {
  roomId: string
  user: AppUser
}

/**
 * ログイン後自動入室コンポーネント
 */
export function RoomEntry({ roomId, user }: RoomEntryProps) {
  const {
    roomInfo,
    isLoading: roomLoading,
    joinRoom,
    leaveRoom,
    isJoining,
    isLeaving,
    joinError,
  } = useRoom(roomId)

  const {
    currentMembers,
    memberCount,
    isUserInRoom,
    presenceEvents,
    clearPresenceEvents,
  } = useRoomPresence(roomId)

  const isCurrentUserInRoom = isUserInRoom(user.id)

  // 自動入室ロジック
  useEffect(() => {
    if (roomInfo && !isCurrentUserInRoom && !isJoining && !joinError) {
      joinRoom(user)
    }
  }, [roomInfo, isCurrentUserInRoom, isJoining, joinError, joinRoom, user])

  const handleLeaveRoom = () => {
    leaveRoom()
  }

  if (roomLoading || isJoining) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <p className="font-medium">
              {roomLoading ? 'ルーム情報を読み込み中...' : 'ルームに参加中...'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              しばらくお待ちください
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!roomInfo) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ルームが見つかりません</AlertTitle>
            <AlertDescription>
              指定されたルームは存在しないか、アクセスできません。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (joinError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>入室に失敗しました</AlertTitle>
            <AlertDescription>{joinError.message}</AlertDescription>
          </Alert>
          <Button
            onClick={() => joinRoom(user)}
            className="w-full mt-4"
            disabled={isJoining}
          >
            再試行
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isCurrentUserInRoom) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">ルームに接続中...</span>
        </CardContent>
      </Card>
    )
  }

  // ルーム参加中の表示
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ルーム情報カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span className="text-xl">{roomInfo.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">参加中</span>
            </div>
          </CardTitle>
          {roomInfo.description && (
            <p className="text-muted-foreground">{roomInfo.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>ルームに参加中です</AlertTitle>
            <AlertDescription>
              ようこそ！他のメンバーとコミュニケーションを楽しみましょう。
            </AlertDescription>
          </Alert>

          <Separator />

          {/* 退室ボタン */}
          <Button
            variant="outline"
            onClick={handleLeaveRoom}
            disabled={isLeaving}
            className="w-full"
          >
            {isLeaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                退室中...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                ルームから退室
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* メンバー一覧カード */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>メンバー ({memberCount}人)</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {currentMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              他のメンバーはいません
            </p>
          ) : (
            <div className="space-y-3">
              {currentMembers.map(member => {
                const isCurrentUser = member.userId === user.id
                const joinTime = new Date(member.joinedAt).toLocaleTimeString(
                  'ja-JP',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )

                return (
                  <div
                    key={member.userId}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isCurrentUser
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <UserAvatar user={member.user} size="sm" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.user.name}
                        {isCurrentUser && (
                          <span className="text-blue-600 ml-1">(あなた)</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{joinTime}に参加</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-muted-foreground">
                        オンライン
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* アクティビティログカード */}
      {presenceEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>最近のアクティビティ</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {presenceEvents.slice(-5).map((event, index) => {
                const eventTime = new Date(event.timestamp).toLocaleTimeString(
                  'ja-JP',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }
                )

                return (
                  <div
                    key={`${event.userId}-${event.timestamp.getTime()}-${index}`}
                    className="flex items-center space-x-2 text-sm p-2 rounded bg-gray-50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        event.type === 'join' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium">{event.user.name}</span>
                    <span className="text-muted-foreground">
                      が{event.type === 'join' ? '参加' : '退室'}しました
                    </span>
                    <span className="text-muted-foreground ml-auto">
                      {eventTime}
                    </span>
                  </div>
                )
              })}
            </div>

            {presenceEvents.length > 5 && (
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPresenceEvents}
                  className="w-full"
                >
                  ログをクリア
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
