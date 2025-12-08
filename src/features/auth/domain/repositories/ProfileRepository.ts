import {
  type Profile,
  type CreateProfileInput,
  type UpdateProfileInput,
} from '../entities/Profile'

/**
 * ProfileRepository インターフェース
 * - プロファイルデータの永続化に関する契約
 * - 実装はインフラ層で行う
 */
export interface ProfileRepository {
  // 基本CRUD操作
  /**
   * プロファイルを作成する
   * @param profile 作成するプロファイルデータ
   * @returns 作成されたプロファイル
   */
  create(profile: CreateProfileInput): Promise<Profile>

  /**
   * IDでプロファイルを取得する
   * @param id プロファイルID
   * @returns プロファイル（存在しない場合はnull）
   */
  findById(id: string): Promise<Profile | null>

  /**
   * プロファイルを更新する
   * @param id プロファイルID
   * @param data 更新データ
   * @returns 更新されたプロファイル
   */
  update(id: string, data: UpdateProfileInput): Promise<Profile>

  /**
   * プロファイルを削除する
   * @param id プロファイルID
   */
  delete(id: string): Promise<void>

  // ドメイン固有のクエリ
  /**
   * 名前でプロファイルを検索する
   * @param name プロファイル名
   * @returns プロファイル（存在しない場合はnull）
   */
  findByName(name: string): Promise<Profile | null>

  /**
   * アバタータイプでプロファイルを検索する
   * @param avatarType アバタータイプ
   * @returns プロファイルリスト
   */
  findByAvatarType(avatarType: Profile['avatarType']): Promise<Profile[]>

  /**
   * 最近作成されたプロファイルを取得する
   * @param days 日数（デフォルト: 7日）
   * @returns プロファイルリスト
   */
  findRecentProfiles(days?: number): Promise<Profile[]>

  /**
   * すべてのプロファイルを取得する（ページネーション対応）
   * @param offset オフセット
   * @param limit リミット
   * @returns プロファイルリスト
   */
  findAll(offset?: number, limit?: number): Promise<Profile[]>

  /**
   * プロファイルの総数を取得する
   * @returns プロファイル数
   */
  count(): Promise<number>
}
