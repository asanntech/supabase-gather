import { AppUser } from '@/features/auth/domain/types'
import { RoomInfo, RoomEntryResult, RoomMember, PresenceEvent } from '../types'

/**
 * ルーム関連のリポジトリインターfaces
 */
export interface RoomRepository {
  /**
   * ルーム情報を取得
   */
  getRoomInfo(roomId: string): Promise<RoomInfo | null>
}

/**
 * プレゼンス管理のリポジトリインターface
 */
export interface RoomPresenceRepository {
  /**
   * ルームに参加（プレゼンス開始）
   */
  joinRoom(roomId: string, user: AppUser): Promise<RoomEntryResult>

  /**
   * ルームから退室（プレゼンス終了）
   */
  leaveRoom(roomId: string): Promise<void>

  /**
   * 現在のルームメンバーを取得
   */
  getCurrentMembers(roomId: string): Promise<RoomMember[]>

  /**
   * プレゼンス変更イベントを監視
   */
  subscribeToPresenceChanges(
    roomId: string,
    onPresenceChange: (event: PresenceEvent) => void
  ): () => void

  /**
   * リアルタイム接続を切断
   */
  disconnect(): void
}
