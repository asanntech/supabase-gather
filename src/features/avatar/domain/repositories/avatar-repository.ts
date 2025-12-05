import { AvatarType } from '../types'

/**
 * アバターリポジトリインターフェース
 * アバター情報の永続化に関する抽象化
 */
export interface AvatarRepository {
  /**
   * Googleユーザーのアバタータイプを更新
   * profiles.avatar_typeに保存
   */
  updateGoogleUserAvatar(userId: string, avatarType: AvatarType): Promise<void>

  /**
   * Googleユーザーのアバタータイプを取得
   */
  getGoogleUserAvatar(userId: string): Promise<AvatarType | null>

  /**
   * Presence データにアバタータイプを更新
   * ゲストユーザーのリアルタイム同期用
   */
  updatePresenceAvatar(
    roomId: string,
    userId: string,
    avatarType: AvatarType
  ): Promise<void>

  /**
   * メッセージにアバタータイプを保存
   * ゲストユーザーのメッセージ履歴用
   */
  saveMessageWithAvatar(
    roomId: string,
    userId: string,
    message: string,
    avatarType: AvatarType
  ): Promise<void>

  /**
   * ユーザーの現在のアバタータイプを取得
   * GoogleユーザーはプロフィールからFetchMacからゲストはPresenceから
   */
  getCurrentAvatar(
    userId: string,
    isGoogleUser: boolean
  ): Promise<AvatarType | null>
}
