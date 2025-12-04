import { AppUser } from '@/features/auth/domain/types'

/**
 * ルーム関連の基本型定義
 */

export interface RoomInfo {
  id: string
  name: string
  maxOccupants: number
  currentOccupants: number
  description?: string
}

export interface RoomMember {
  userId: string
  user: AppUser
  joinedAt: Date
}

export interface RoomOccupancy {
  current: number
  max: number
  isFull: boolean
  percentage: number
}

/**
 * ルーム入退室の結果型
 */
export type RoomEntryResult =
  | { success: true }
  | {
      success: false
      reason: 'room_full' | 'already_in_room' | 'unknown_error'
      message: string
    }

/**
 * プレゼンス変更イベント
 */
export interface PresenceEvent {
  type: 'join' | 'leave'
  roomId: string
  userId: string
  user: AppUser
  timestamp: Date
}

/**
 * プレゼンス状態
 */
export interface PresenceState {
  [userId: string]: {
    user_id: string
    user_name: string
    user_avatar: {
      type: 'url' | 'avatar_type' | 'none'
      value: string | null
    }
    joined_at: string
  }
}
