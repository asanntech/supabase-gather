import { useEffect, useState, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PresenceEvent } from '../../domain/types'
import { SupabaseRoomPresenceRepository } from '@/infrastructure/api/rooms/supabase-room-presence-repository'

const presenceRepository = new SupabaseRoomPresenceRepository()

/**
 * ルームのプレゼンス状態をリアルタイム監視するhook
 */
export function useRoomPresence(roomId: string) {
  const queryClient = useQueryClient()
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([])
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // 現在のメンバー一覧を取得
  const { data: currentMembers = [], isLoading } = useQuery({
    queryKey: ['room', 'members', roomId],
    queryFn: () => presenceRepository.getCurrentMembers(roomId),
    refetchInterval: 5000, // 5秒間隔で更新
    retry: 3,
  })

  // プレゼンス変更イベントのハンドラ
  const handlePresenceChange = useCallback(
    (event: PresenceEvent) => {
      console.log('Presence event:', event)

      // イベント履歴に追加（最新10件まで保持）
      setPresenceEvents(prev => [event, ...prev.slice(0, 9)])

      // メンバー一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['room', 'members', roomId] })
      queryClient.invalidateQueries({ queryKey: ['room', 'info', roomId] })
    },
    [roomId, queryClient]
  )

  // リアルタイムプレゼンス監視の設定
  useEffect(() => {
    if (!roomId) return

    console.log(`Setting up presence subscription for room: ${roomId}`)

    const unsubscribe = presenceRepository.subscribeToPresenceChanges(
      roomId,
      handlePresenceChange
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      console.log(`Cleaning up presence subscription for room: ${roomId}`)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [roomId, handlePresenceChange])

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const clearPresenceEvents = useCallback(() => {
    setPresenceEvents([])
  }, [])

  return {
    // Data
    currentMembers,
    presenceEvents,
    memberCount: currentMembers.length,

    // Status
    isLoading,

    // Actions
    clearPresenceEvents,

    // Helpers
    isUserInRoom: useCallback(
      (userId: string) => {
        return currentMembers.some(member => member.userId === userId)
      },
      [currentMembers]
    ),

    getMemberByUserId: useCallback(
      (userId: string) => {
        return currentMembers.find(member => member.userId === userId)
      },
      [currentMembers]
    ),
  }
}
