import {
  type GuestUser,
  type CreateGuestUserInput,
  type UpdateGuestUserInput,
} from '../entities/GuestUser'

/**
 * GuestUserRepository インターフェース
 * - ゲストユーザーデータの永続化に関する契約
 * - セッション管理と組み合わせた操作
 * - 実装はインフラ層で行う
 */
export interface GuestUserRepository {
  // 基本CRUD操作
  /**
   * ゲストユーザーを作成する
   * @param guestUser 作成するゲストユーザーデータ
   * @returns 作成されたゲストユーザー
   */
  create(guestUser: CreateGuestUserInput): Promise<GuestUser>

  /**
   * IDでゲストユーザーを取得する
   * @param id ゲストユーザーID
   * @returns ゲストユーザー（存在しない場合はnull）
   */
  findById(id: string): Promise<GuestUser | null>

  /**
   * ゲストユーザーを更新する
   * @param id ゲストユーザーID
   * @param data 更新データ
   * @returns 更新されたゲストユーザー
   */
  update(id: string, data: UpdateGuestUserInput): Promise<GuestUser>

  /**
   * ゲストユーザーを削除する
   * @param id ゲストユーザーID
   */
  delete(id: string): Promise<void>

  // セッション関連のクエリ
  /**
   * セッションIDでゲストユーザーを取得する
   * @param sessionId セッションID
   * @returns ゲストユーザー（存在しない場合はnull）
   */
  findBySessionId(sessionId: string): Promise<GuestUser | null>

  /**
   * 名前でゲストユーザーを検索する
   * @param name ゲストユーザー名
   * @returns ゲストユーザー（存在しない場合はnull）
   */
  findByName(name: string): Promise<GuestUser | null>

  /**
   * アバタータイプでゲストユーザーを検索する
   * @param avatarType アバタータイプ
   * @returns ゲストユーザーリスト
   */
  findByAvatarType(avatarType: GuestUser['avatarType']): Promise<GuestUser[]>

  // セッション管理
  /**
   * セッションを無効化する
   * @param sessionId セッションID
   */
  invalidateSession(sessionId: string): Promise<void>

  /**
   * 期限切れのセッションをクリーンアップする
   * @param expiryThreshold 期限切れしきい値（秒）
   * @returns 削除されたゲストユーザー数
   */
  cleanupExpiredSessions(expiryThreshold: number): Promise<number>

  /**
   * アクティブなゲストユーザー数を取得する
   * @returns アクティブなゲストユーザー数
   */
  countActiveUsers(): Promise<number>

  /**
   * 利用可能なゲスト名を生成する
   * @returns 利用可能なゲスト名
   */
  generateAvailableGuestName(): Promise<string>

  // 検索・フィルタリング
  /**
   * すべてのゲストユーザーを取得する（ページネーション対応）
   * @param offset オフセット
   * @param limit リミット
   * @returns ゲストユーザーリスト
   */
  findAll(offset?: number, limit?: number): Promise<GuestUser[]>
}
