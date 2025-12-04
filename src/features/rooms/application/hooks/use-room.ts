import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppUser } from '@/features/auth/domain/types'
import {
  SupabaseRoomRepository,
  SupabaseRoomPresenceRepository,
} from '@/infrastructure/api/rooms/supabase-room-presence-repository'

const roomRepository = new SupabaseRoomRepository()
const presenceRepository = new SupabaseRoomPresenceRepository()

/**
 * ルーム情報と操作を管理するhook
 */
export function useRoom(roomId: string) {
  const queryClient = useQueryClient()

  // ルーム情報を取得
  const {
    data: roomInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['room', 'info', roomId],
    queryFn: () => roomRepository.getRoomInfo(roomId),
    refetchInterval: 5000, // 5秒間隔で更新
    retry: 3,
  })

  // ルーム参加
  const joinMutation = useMutation({
    mutationFn: async (user: AppUser) => {
      const result = await presenceRepository.joinRoom(roomId, user)
      if (!result.success) {
        throw new Error(result.message)
      }
      return result
    },
    onSuccess: () => {
      // ルーム情報を再取得
      queryClient.invalidateQueries({ queryKey: ['room', 'info', roomId] })
    },
    onError: error => {
      console.error('Room join error:', error)
    },
  })

  // ルーム退室
  const leaveMutation = useMutation({
    mutationFn: async () => {
      await presenceRepository.leaveRoom(roomId)
    },
    onSuccess: () => {
      // ルーム情報を再取得
      queryClient.invalidateQueries({ queryKey: ['room', 'info', roomId] })
    },
    onError: error => {
      console.error('Room leave error:', error)
    },
  })

  const joinRoom = useCallback(
    (user: AppUser) => {
      joinMutation.mutate(user)
    },
    [joinMutation]
  )

  const leaveRoom = useCallback(() => {
    leaveMutation.mutate()
  }, [leaveMutation])

  return {
    // Data
    roomInfo,
    isLoading,
    error,

    // Actions
    joinRoom,
    leaveRoom,

    // Status
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
    joinError: joinMutation.error,
    leaveError: leaveMutation.error,
  }
}
