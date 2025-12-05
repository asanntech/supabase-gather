import { AvatarRepository } from '../../domain/repositories/avatar-repository'
import { AvatarService } from '../../domain/services/avatar-service'
import { AvatarType, UpdateAvatarInput, AvatarError } from '../../domain/types'

/**
 * アバターアプリケーションサービス
 * ユースケースの実装を提供
 */
export class AvatarApplicationService {
  constructor(private readonly avatarRepository: AvatarRepository) {}

  /**
   * ユーザーのアバタータイプを更新
   */
  async updateUserAvatar(input: UpdateAvatarInput): Promise<void> {
    try {
      // ビジネスルール検証
      const validation = AvatarService.validateAvatarType(input.avatarType)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Googleユーザーかどうかに応じて適切なリポジトリメソッドを呼び出し
      // 実際の実装では、ユーザータイプの判定ロジックが必要
      await this.avatarRepository.updateGoogleUserAvatar(
        input.userId,
        input.avatarType
      )
    } catch (error) {
      throw this.createAvatarError(
        'UPDATE_FAILED',
        `Failed to update avatar: ${error}`
      )
    }
  }

  /**
   * ユーザーの現在のアバタータイプを取得
   */
  async getUserAvatar(
    userId: string,
    isGoogleUser: boolean
  ): Promise<AvatarType | null> {
    try {
      return await this.avatarRepository.getCurrentAvatar(userId, isGoogleUser)
    } catch (error) {
      throw this.createAvatarError(
        'NOT_FOUND',
        `Failed to get avatar: ${error}`
      )
    }
  }

  /**
   * ルームのPresenceにアバター情報を更新
   */
  async updateRoomPresenceAvatar(
    roomId: string,
    userId: string,
    avatarType: AvatarType
  ): Promise<void> {
    try {
      const validation = AvatarService.validateAvatarType(avatarType)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      await this.avatarRepository.updatePresenceAvatar(
        roomId,
        userId,
        avatarType
      )
    } catch (error) {
      throw this.createAvatarError(
        'UPDATE_FAILED',
        `Failed to update presence avatar: ${error}`
      )
    }
  }

  /**
   * メッセージとともにアバター情報を保存
   */
  async saveMessageWithAvatar(
    roomId: string,
    userId: string,
    message: string,
    avatarType: AvatarType
  ): Promise<void> {
    try {
      const validation = AvatarService.validateAvatarType(avatarType)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      await this.avatarRepository.saveMessageWithAvatar(
        roomId,
        userId,
        message,
        avatarType
      )
    } catch (error) {
      throw this.createAvatarError(
        'UPDATE_FAILED',
        `Failed to save message with avatar: ${error}`
      )
    }
  }

  /**
   * アバターエラーを生成
   */
  private createAvatarError(
    code: AvatarError['code'],
    message: string
  ): AvatarError {
    return { code, message }
  }
}
