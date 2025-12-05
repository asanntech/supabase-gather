import { AvatarTypeVO } from '../value-objects/avatar-type'
import { AvatarDisplayInfo, AvatarChangeEvent, AvatarType } from '../types'

/**
 * アバタードメインサービス
 * アバターに関するビジネスロジックを集約
 */
export class AvatarService {
  /**
   * アバタータイプから表示情報を生成
   */
  static createDisplayInfo(avatarType: AvatarType): AvatarDisplayInfo {
    const typeVO = AvatarTypeVO.create(avatarType)
    const config = typeVO.getConfig()

    return {
      type: avatarType,
      imagePath: typeVO.getImagePath(),
      displayName: config.displayName,
      color: config.color,
    }
  }

  /**
   * 利用可能なすべてのアバター表示情報を取得
   */
  static getAllAvatarDisplayInfo(): AvatarDisplayInfo[] {
    return AvatarTypeVO.getAllTypes().map(type => this.createDisplayInfo(type))
  }

  /**
   * アバター変更イベントを作成
   */
  static createChangeEvent(
    userId: string,
    previousType: AvatarType,
    newType: AvatarType
  ): AvatarChangeEvent {
    return {
      userId,
      previousType,
      newType,
      timestamp: new Date(),
    }
  }

  /**
   * ユーザーがアバタータイプを変更可能かチェック
   */
  static canChangeAvatar(
    currentType: AvatarType,
    newType: AvatarType
  ): boolean {
    // 基本的に常に変更可能
    // 将来的に制限ルールがあれば追加
    return AvatarTypeVO.isValid(newType) && currentType !== newType
  }

  /**
   * アバタータイプの妥当性を検証
   */
  static validateAvatarType(type: string): {
    isValid: boolean
    error?: string
  } {
    if (!type || typeof type !== 'string') {
      return {
        isValid: false,
        error: 'Avatar type must be a non-empty string',
      }
    }

    if (!AvatarTypeVO.isValid(type)) {
      return {
        isValid: false,
        error: `Invalid avatar type: ${type}. Must be one of: ${AvatarTypeVO.getAllTypes().join(', ')}`,
      }
    }

    return { isValid: true }
  }

  /**
   * ランダムなアバタータイプを生成
   */
  static generateRandomAvatarType(): AvatarType {
    const types = AvatarTypeVO.getAllTypes()
    const randomIndex = Math.floor(Math.random() * types.length)
    return types[randomIndex]
  }
}
