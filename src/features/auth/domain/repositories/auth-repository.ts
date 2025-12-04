import { AppUser, GoogleUser } from '../types'

/**
 * 認証リポジトリインターフェース
 */
export interface IAuthRepository {
  /**
   * 現在の認証状態を取得
   */
  getCurrentUser(): Promise<AppUser | null>

  /**
   * Googleログインを実行
   */
  signInWithGoogle(): Promise<GoogleUser>

  /**
   * ログアウトを実行
   */
  signOut(): Promise<void>

  /**
   * 認証状態の変更を監視
   */
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void
}
