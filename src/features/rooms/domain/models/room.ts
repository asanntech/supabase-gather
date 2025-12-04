import { AppUser } from '@/features/auth/domain/types'

/**
 * ルームのドメインモデル
 */
export class Room {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly maxOccupants: number = 5,
    public readonly description?: string
  ) {}

  /**
   * MVP用の固定メインルームを作成
   */
  static createMainRoom(): Room {
    return new Room(
      'main-room',
      'メインルーム',
      5,
      'みんなで集まることができるメインルームです'
    )
  }

  /**
   * ルームが満室かどうかを判定
   */
  canAccommodate(currentOccupants: number): boolean {
    return currentOccupants < this.maxOccupants
  }

  /**
   * ルームの現在の利用状況を取得
   */
  getOccupancyStatus(currentOccupants: number): {
    current: number
    max: number
    isFull: boolean
    percentage: number
  } {
    return {
      current: currentOccupants,
      max: this.maxOccupants,
      isFull: currentOccupants >= this.maxOccupants,
      percentage: Math.round((currentOccupants / this.maxOccupants) * 100),
    }
  }
}

/**
 * ルーム内のプレゼンス情報
 */
export class RoomPresence {
  constructor(
    public readonly roomId: string,
    public readonly userId: string,
    public readonly user: AppUser,
    public readonly joinedAt: Date = new Date()
  ) {}

  /**
   * プレゼンスキーを生成（Supabase Presenceで使用）
   */
  getPresenceKey(): string {
    return `user_${this.userId}`
  }

  /**
   * プレゼンスデータを生成（Supabase Presenceで使用）
   */
  toPresenceData(): Record<string, string | Record<string, string | null>> {
    return {
      user_id: this.userId,
      user_name: this.user.name,
      user_avatar: this.user.avatarType,
      joined_at: this.joinedAt.toISOString(),
    }
  }

  /**
   * プレゼンスデータからRoomPresenceインスタンスを作成
   */
  static fromPresenceData(
    roomId: string,
    presenceData: Record<string, unknown>
  ): RoomPresence {
    const user: AppUser = this.reconstructUserFromPresence(presenceData)
    const joinedAt = presenceData.joined_at
      ? new Date(presenceData.joined_at as string)
      : new Date()

    return new RoomPresence(
      roomId,
      presenceData.user_id as string,
      user,
      joinedAt
    )
  }

  private static reconstructUserFromPresence(
    presenceData: Record<string, unknown>
  ): AppUser {
    const avatar =
      (presenceData.user_avatar as Record<string, string | null>) || {}

    const avatarType = avatar.value || 'default'

    // presenceDataからproviderを判断する必要があるが、ここではavatarTypeのみで統一
    // 実際のprovider判断ロジックは必要に応じて追加
    if (presenceData.user_email) {
      return {
        id: presenceData.user_id as string,
        name: presenceData.user_name as string,
        provider: 'google',
        email: presenceData.user_email as string,
        avatarType,
      }
    } else {
      return {
        id: presenceData.user_id as string,
        name: presenceData.user_name as string,
        provider: 'guest',
        avatarType,
      }
    }
  }
}
