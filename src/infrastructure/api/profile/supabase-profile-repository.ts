import { supabase } from '@/shared/config/supabase'
import {
  UserProfile,
  CreateProfileInput,
  UpdateProfileInput,
} from '@/features/profile/domain/types'
import { IProfileRepository } from '@/features/profile/domain/repositories/profile-repository'

/**
 * Supabaseを使ったプロフィールリポジトリ実装
 */
export class SupabaseProfileRepository implements IProfileRepository {
  private readonly tableName = 'profiles'

  async getByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // レコードが見つからない
          return null
        }
        throw error
      }

      return this.mapToProfile(data)
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
      throw new Error(`プロフィールの取得に失敗しました`)
    }
  }

  async create(input: CreateProfileInput): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: input.userId,
          name: input.name,
          avatar_type: input.avatarType,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.mapToProfile(data)
    } catch (error) {
      console.error('プロフィール作成エラー:', error)
      throw new Error(`プロフィールの作成に失敗しました`)
    }
  }

  async update(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    try {
      const updateData: Record<string, string> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.avatarType !== undefined)
        updateData.avatar_type = input.avatarType

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.mapToProfile(data)
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      throw new Error(`プロフィールの更新に失敗しました`)
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('プロフィール削除エラー:', error)
      throw new Error(`プロフィールの削除に失敗しました`)
    }
  }

  private mapToProfile(data: Record<string, unknown>): UserProfile {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      name: data.name as string,
      avatarType: data.avatar_type as string,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    }
  }
}
