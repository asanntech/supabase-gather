import { type User } from '../entities/User'

/**
 * AuthRepository インターフェース
 * - 認証に関する操作の契約
 * - 実装はインフラ層で行う
 */
export interface AuthRepository {
  // Google認証
  /**
   * Googleアカウントでサインインする
   * @returns サインインしたユーザー
   */
  signInWithGoogle(): Promise<User>

  // 一般的な認証操作
  /**
   * サインアウトする
   */
  signOut(): Promise<void>

  /**
   * 現在のユーザーを取得する
   * @returns 現在のユーザー（未認証の場合はnull）
   */
  getCurrentUser(): Promise<User | null>

  /**
   * 認証状態の変更を監視する
   * @param callback 認証状態変更時のコールバック
   * @returns サブスクリプションの解除関数
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void

  // セッション管理
  /**
   * セッションを更新する
   * @returns 更新後のユーザー
   */
  refreshSession(): Promise<User | null>

  /**
   * セッションの有効性を確認する
   * @returns セッションが有効かどうか
   */
  isSessionValid(): Promise<boolean>

  // ゲストユーザー関連
  /**
   * ゲストユーザーとしてサインインする
   * @param sessionId セッションID
   * @param name ゲストユーザー名
   * @param avatarType アバタータイプ
   * @returns サインインしたゲストユーザー
   */
  signInAsGuest(
    sessionId: string,
    name: string,
    avatarType: User['avatarType']
  ): Promise<User>

  /**
   * ゲストセッションを終了する
   * @param sessionId セッションID
   */
  endGuestSession(sessionId: string): Promise<void>
}
