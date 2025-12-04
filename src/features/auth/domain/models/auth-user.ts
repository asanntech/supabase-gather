import { v4 as uuidv4 } from 'uuid'
import { AppUser, GoogleUser, GuestUser, GuestLoginInput } from '../types'

/**
 * 認証ユーザーのドメインモデル
 */
export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly provider: 'google' | 'guest',
    public readonly name: string,
    public readonly email?: string,
    public readonly avatarUrl?: string,
    public readonly avatarType?: string
  ) {}

  static fromSupabaseUser(user: any): GoogleUser {
    return {
      id: user.id,
      email: user.email!,
      name:
        user.user_metadata.name || user.user_metadata.full_name || user.email!,
      avatarUrl: user.user_metadata.avatar_url,
      provider: 'google',
    }
  }

  static createGuest(input: GuestLoginInput): GuestUser {
    return {
      id: uuidv4(),
      name: input.name.trim(),
      avatarType: input.avatarType,
      provider: 'guest',
    }
  }

  static isGoogle(user: AppUser): user is GoogleUser {
    return user.provider === 'google'
  }

  static isGuest(user: AppUser): user is GuestUser {
    return user.provider === 'guest'
  }

  /**
   * ユーザーの表示用アバターを取得
   */
  static getDisplayAvatar(user: AppUser): string | null {
    if (this.isGoogle(user)) {
      return user.avatarUrl || null
    }
    return user.avatarType
  }

  /**
   * ユーザーが有効か検証
   */
  static isValid(user: AppUser): boolean {
    if (!user.id || !user.name.trim()) {
      return false
    }

    if (this.isGoogle(user)) {
      return !!user.email
    }

    if (this.isGuest(user)) {
      return !!user.avatarType
    }

    return false
  }

  /**
   * ユーザーの一意キーを生成
   */
  static getUserKey(user: AppUser): string {
    return `${user.provider}:${user.id}`
  }
}
