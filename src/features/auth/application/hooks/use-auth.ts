import { useEffect, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth-store'
import { SupabaseAuthRepository } from '@/infrastructure/api/auth/supabase-auth-repository'
import { GuestLoginInput } from '../../domain/types'

const authRepository = new SupabaseAuthRepository()

/**
 * 認証状態と操作を管理するhook
 */
export function useAuth() {
  const {
    user,
    status,
    isGuest,
    isGoogle,
    setUser,
    setStatus,
    setGuestUser,
    clearUser,
    initializeAuth,
  } = useAuthStore()

  // 認証状態の初期化
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: () => authRepository.getCurrentUser(),
    enabled: status === 'loading',
    retry: false,
  })

  // Googleログイン
  const googleLoginMutation = useMutation({
    mutationFn: () => authRepository.signInWithGoogle(),
    onSuccess: user => {
      setUser(user)
    },
    onError: error => {
      console.error('Googleログインエラー:', error)
    },
  })

  // ログアウト
  const logoutMutation = useMutation({
    mutationFn: () => authRepository.signOut(),
    onSuccess: () => {
      clearUser()
    },
    onError: error => {
      console.error('ログアウトエラー:', error)
    },
  })

  // 認証状態変更の監視
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (status === 'loading') {
      // 初期化時にゲストユーザーをチェック
      initializeAuth()

      // Supabaseの認証状態を監視
      unsubscribe = authRepository.onAuthStateChange(user => {
        if (user) {
          setUser(user)
        } else {
          // ユーザーがいない場合は未認証状態に
          setStatus('unauthenticated')
        }
      })
    }

    return () => {
      unsubscribe?.()
    }
  }, [status, setUser, setStatus, initializeAuth])

  // 初期ロード時の状態更新
  useEffect(() => {
    if (!isLoading && status === 'loading') {
      if (currentUser) {
        setUser(currentUser)
      } else {
        setStatus('unauthenticated')
      }
    }
  }, [currentUser, isLoading, status, setUser, setStatus])

  // ゲストログイン
  const signInAsGuest = useCallback(
    (input: GuestLoginInput) => {
      setGuestUser(input)
    },
    [setGuestUser]
  )

  // Googleログイン
  const signInWithGoogle = useCallback(() => {
    googleLoginMutation.mutate()
  }, [googleLoginMutation])

  // ログアウト
  const signOut = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  return {
    // State
    user,
    status,
    isLoading: status === 'loading' || isLoading,
    isAuthenticated: status === 'authenticated' || status === 'guest',
    isGuest,
    isGoogle,

    // Actions
    signInAsGuest,
    signInWithGoogle,
    signOut,

    // Loading states
    isSigningInWithGoogle: googleLoginMutation.isPending,
    isSigningOut: logoutMutation.isPending,
  }
}
