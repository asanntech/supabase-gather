import type { Profile, CreateProfileInput, UpdateProfileInput } from './Profile'

/**
 * Repository Interface: プロフィールリポジトリ
 * - プロフィールデータの永続化インターフェース
 * - ドメイン層で定義、インフラ層で実装
 */
export interface ProfileRepository {
  // 基本CRUD
  create(profile: CreateProfileInput): Promise<Profile>
  findById(id: string): Promise<Profile | null>
  findByUserId(userId: string): Promise<Profile | null>
  update(id: string, data: UpdateProfileInput): Promise<Profile>
  delete(id: string): Promise<void>

  // ドメイン固有のクエリ
  findByDisplayName(displayName: string): Promise<Profile[]>
  findActiveProfiles(): Promise<Profile[]>

  // 検索関連
  searchByDisplayName(query: string): Promise<Profile[]>
  findRecentlyUpdatedProfiles(limit?: number): Promise<Profile[]>
}
