import { AvatarRepository } from '@/features/avatar/domain/repositories/avatar-repository'
import { AvatarType } from '@/features/avatar/domain/types'
import { supabase } from '@/shared/config/supabase'

/**
 * Supabase を使用したアバターリポジトリ実装
 */
export class SupabaseAvatarRepository implements AvatarRepository {
  /**
   * Googleユーザーのアバタータイプを更新
   * profiles.avatar_typeに保存
   */
  async updateGoogleUserAvatar(
    userId: string,
    avatarType: AvatarType
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_type: avatarType })
      .eq('id', userId)

    if (error) {
      throw new Error(
        `Failed to update avatar for user ${userId}: ${error.message}`
      )
    }
  }

  /**
   * Googleユーザーのアバタータイプを取得
   */
  async getGoogleUserAvatar(userId: string): Promise<AvatarType | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_type')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合はnullを返す
        return null
      }
      throw new Error(
        `Failed to get avatar for user ${userId}: ${error.message}`
      )
    }

    return data?.avatar_type || null
  }

  /**
   * Presence データにアバタータイプを更新
   * ゲストユーザーのリアルタイム同期用
   */
  async updatePresenceAvatar(
    roomId: string,
    userId: string,
    avatarType: AvatarType
  ): Promise<void> {
    const channel = supabase.channel(`room_${roomId}`)

    // Presenceにアバター情報を送信
    const response = await channel.track({
      user_id: userId,
      avatar_type: avatarType,
      online_at: new Date().toISOString(),
    })

    // track()は成功時にはresponseが返るが、エラー時は例外を投げる
    if (response === 'error') {
      throw new Error(`Failed to update presence avatar for user ${userId}`)
    }
  }

  /**
   * メッセージにアバタータイプを保存
   * ゲストユーザーのメッセージ履歴用
   */
  async saveMessageWithAvatar(
    roomId: string,
    userId: string,
    message: string,
    avatarType: AvatarType
  ): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: userId,
      content: message,
      avatar_type: avatarType,
      created_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Failed to save message with avatar: ${error.message}`)
    }
  }

  /**
   * ユーザーの現在のアバタータイプを取得
   * GoogleユーザーはプロフィールからFetchMacからゲストはPresenceから
   */
  async getCurrentAvatar(
    userId: string,
    isGoogleUser: boolean
  ): Promise<AvatarType | null> {
    if (isGoogleUser) {
      return this.getGoogleUserAvatar(userId)
    }

    // ゲストユーザーの場合、最新のPresenceまたはメッセージから取得

    // 最近のメッセージからアバタータイプを取得（簡易実装）
    const { data, error } = await supabase
      .from('messages')
      .select('avatar_type')
      .eq('user_id', userId)
      .not('avatar_type', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // メッセージが見つからない場合はnullを返す
        return null
      }
      throw new Error(
        `Failed to get guest avatar for user ${userId}: ${error.message}`
      )
    }

    return data?.avatar_type || null
  }
}
