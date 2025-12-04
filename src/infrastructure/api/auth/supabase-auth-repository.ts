import { supabase } from '@/shared/config/supabase'
import { AppUser, GoogleUser } from '@/features/auth/domain/types'
import { AuthUser } from '@/features/auth/domain/models/auth-user'
import { IAuthRepository } from '@/features/auth/domain/repositories/auth-repository'

/**
 * Supabaseを使った認証リポジトリ実装
 */
export class SupabaseAuthRepository implements IAuthRepository {
  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      return AuthUser.fromSupabaseUser(user)
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  async signInWithGoogle(): Promise<GoogleUser> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw new Error(`Googleログインに失敗しました: ${error.message}`)
      }

      // OAuthはリダイレクトで処理されるため、ここではユーザー情報を返せない
      // 実際のユーザー情報は onAuthStateChange で取得される
      throw new Error('リダイレクト中...')
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(`ログアウトに失敗しました: ${error.message}`)
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認証状態変更:', event)

      if (session?.user) {
        try {
          const appUser = AuthUser.fromSupabaseUser(session.user)
          callback(appUser)
        } catch (error) {
          console.error('ユーザー情報の変換に失敗:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }
}
