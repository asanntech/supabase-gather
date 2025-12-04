import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'
import { supabase } from '@/shared/config/supabase'
import { AppUser } from '@/features/auth/domain/types'
import {
  RoomPresenceRepository,
  RoomRepository,
} from '@/features/rooms/domain/repositories/room-repository'
import {
  RoomInfo,
  RoomEntryResult,
  RoomMember,
  PresenceEvent,
  PresenceState,
} from '@/features/rooms/domain/types'
import { Room, RoomPresence } from '@/features/rooms/domain/models/room'

/**
 * Supabase Realtime Presenceを使用したルームプレゼンス管理
 */
export class SupabaseRoomPresenceRepository implements RoomPresenceRepository {
  private channels: Map<string, RealtimeChannel> = new Map()

  async joinRoom(roomId: string, user: AppUser): Promise<RoomEntryResult> {
    try {
      // チャンネルに接続
      const channelName = `room:${roomId}`
      let channel = this.channels.get(channelName)

      if (!channel) {
        channel = supabase.channel(channelName, {
          config: {
            presence: {
              key: `user_${user.id}`,
            },
          },
        })
        this.channels.set(channelName, channel)
      }

      // まず現在の状態を確認
      const currentMembers = await this.getCurrentMembersFromChannel(channel)
      const room = Room.createMainRoom()

      // 人数制限チェック
      if (!room.canAccommodate(currentMembers.length)) {
        return {
          success: false,
          reason: 'room_full',
          message: `ルームが満員です (${currentMembers.length}/${room.maxOccupants})`,
        }
      }

      // 既に参加しているかチェック
      const isAlreadyInRoom = currentMembers.some(
        member => member.userId === user.id
      )
      if (isAlreadyInRoom) {
        return {
          success: false,
          reason: 'already_in_room',
          message: '既にルームに参加しています',
        }
      }

      // プレゼンスデータを作成
      const presence = new RoomPresence(roomId, user.id, user)
      const presenceData = presence.toPresenceData()

      // Presenceトラッキングを開始
      await new Promise<void>((resolve, reject) => {
        channel.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            try {
              const presenceStatus = await channel.track(presenceData)
              console.log('Presence tracking status:', presenceStatus)
              resolve()
            } catch (error) {
              reject(error)
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error('ルームへの接続に失敗しました'))
          }
        })

        // タイムアウト設定（5秒）
        setTimeout(() => {
          reject(new Error('接続タイムアウトしました'))
        }, 5000)
      })

      return { success: true }
    } catch (error) {
      console.error('Room join error:', error)
      return {
        success: false,
        reason: 'unknown_error',
        message: '予期しないエラーが発生しました',
      }
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    try {
      const channelName = `room:${roomId}`
      const channel = this.channels.get(channelName)

      if (channel) {
        await channel.untrack()
        await channel.unsubscribe()
        this.channels.delete(channelName)
      }
    } catch (error) {
      console.error('Room leave error:', error)
      // エラーが発生してもthrowしない（ベストエフォート）
    }
  }

  async getCurrentMembers(roomId: string): Promise<RoomMember[]> {
    const channelName = `room:${roomId}`
    const channel = this.channels.get(channelName)

    if (!channel) {
      return []
    }

    return this.getCurrentMembersFromChannel(channel)
  }

  private async getCurrentMembersFromChannel(
    channel: RealtimeChannel
  ): Promise<RoomMember[]> {
    try {
      const presenceState =
        channel.presenceState() as RealtimePresenceState<PresenceState>
      const members: RoomMember[] = []

      Object.entries(presenceState).forEach(([, presences]) => {
        // 最新のプレゼンスデータを使用（配列の最後の要素）
        const latestPresence = presences[presences.length - 1]
        if (latestPresence) {
          const roomPresence = RoomPresence.fromPresenceData(
            '',
            latestPresence as Record<string, unknown>
          )
          members.push({
            userId: roomPresence.userId,
            user: roomPresence.user,
            joinedAt: roomPresence.joinedAt,
          })
        }
      })

      return members
    } catch (error) {
      console.error('Error getting current members:', error)
      return []
    }
  }

  subscribeToPresenceChanges(
    roomId: string,
    onPresenceChange: (event: PresenceEvent) => void
  ): () => void {
    const channelName = `room:${roomId}`
    let channel = this.channels.get(channelName)

    if (!channel) {
      channel = supabase.channel(channelName)
      this.channels.set(channelName, channel)
    }

    // プレゼンス変更イベントをリスン
    channel
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: Record<string, unknown>) => {
          const roomPresence = RoomPresence.fromPresenceData(roomId, presence)
          onPresenceChange({
            type: 'join',
            roomId,
            userId: roomPresence.userId,
            user: roomPresence.user,
            timestamp: new Date(),
          })
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: Record<string, unknown>) => {
          const roomPresence = RoomPresence.fromPresenceData(roomId, presence)
          onPresenceChange({
            type: 'leave',
            roomId,
            userId: roomPresence.userId,
            user: roomPresence.user,
            timestamp: new Date(),
          })
        })
      })
      .subscribe()

    // クリーンアップ関数を返す
    return () => {
      channel?.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  disconnect(): void {
    this.channels.forEach(channel => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }
}

/**
 * MVP用のシンプルなルームリポジトリ実装
 */
export class SupabaseRoomRepository implements RoomRepository {
  async getRoomInfo(roomId: string): Promise<RoomInfo | null> {
    // MVP段階では main-room のみサポート
    if (roomId !== 'main-room') {
      return null
    }

    const room = Room.createMainRoom()
    const presenceRepo = new SupabaseRoomPresenceRepository()
    const currentMembers = await presenceRepo.getCurrentMembers(roomId)

    return {
      id: room.id,
      name: room.name,
      maxOccupants: room.maxOccupants,
      currentOccupants: currentMembers.length,
      description: room.description,
    }
  }
}
