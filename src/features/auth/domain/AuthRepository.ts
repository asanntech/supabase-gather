import type { User } from './User'
import type { GuestUser } from './GuestUser'

/**
 * Repository Interface: 認証リポジトリ
 * - 認証関連の機能を提供
 * - Google認証とゲスト認証の両方をサポート
 * - ドメイン層で定義、インフラ層で実装
 */

// 認証エラー型
export type AuthError = {
  code: string
  message: string
  details?: unknown
}

// 認証状態
export type AuthState = {
  user: User | null
  loading: boolean
  error: AuthError | null
}

export interface AuthRepository {
  // Google認証
  signInWithGoogle(): Promise<User>

  // ゲスト認証
  createGuestSession(name: string, avatarType?: string): Promise<GuestUser>
  updateGuestSession(
    sessionId: string,
    updates: { name?: string; avatarType?: string }
  ): Promise<GuestUser>

  // 共通認証機能
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
  getCurrentGuestUser(): Promise<GuestUser | null>

  // 状態管理
  onAuthStateChange(callback: (user: User | null) => void): () => void
  onGuestStateChange(
    callback: (guestUser: GuestUser | null) => void
  ): () => void

  // セッション管理
  refreshSession(): Promise<void>
  isSessionValid(): Promise<boolean>

  // ユーザー情報取得
  getUserProfile(userId: string): Promise<User | null>
  updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'avatarType'>>
  ): Promise<User>

  // アカウント管理
  deleteAccount(): Promise<void>
}
