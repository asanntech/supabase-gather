import { UserProfile, CreateProfileInput, UpdateProfileInput } from '../types'

/**
 * プロフィールリポジトリインターフェース
 */
export interface IProfileRepository {
  /**
   * ユーザーIDでプロフィールを取得
   */
  getByUserId(userId: string): Promise<UserProfile | null>

  /**
   * プロフィールを作成
   */
  create(input: CreateProfileInput): Promise<UserProfile>

  /**
   * プロフィールを更新
   */
  update(userId: string, input: UpdateProfileInput): Promise<UserProfile>

  /**
   * プロフィールを削除
   */
  delete(userId: string): Promise<void>
}
