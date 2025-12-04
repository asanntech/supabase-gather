'use client'

import { useCallback, useMemo } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { AuthUser } from '../../domain/models/auth-user'
import { GuestLoginInput } from '../../domain/types'

/**
 * 認証関連の状態とアクションを提供するhook
 */
export function useAuth() {
  const store = useAuthStore()

  const signInAsGuest = useCallback(
    (input: GuestLoginInput) => {
      store.setGuestUser(input)
    },
    [store]
  )

  const signInWithGoogle = useCallback(() => {
    // Google認証の実装は後で追加
    console.warn('Google認証は実装中です')
  }, [])

  const signOut = useCallback(() => {
    store.clearUser()
  }, [store])

  const computedState = useMemo(
    () => ({
      isAuthenticated: !!store.user,
      isLoading: store.status === 'loading',
      isGuest: store.user ? AuthUser.isGuest(store.user) : false,
      isGoogle: store.user ? AuthUser.isGoogle(store.user) : false,
    }),
    [store.user, store.status]
  )

  return {
    // State
    user: store.user,
    isLoading: computedState.isLoading,
    isAuthenticated: computedState.isAuthenticated,
    isGuest: computedState.isGuest,
    isGoogle: computedState.isGoogle,
    isSigningOut: false, // TODO: 実装
    isSigningInWithGoogle: false, // TODO: 実装

    // Actions
    signInAsGuest,
    signInWithGoogle,
    signOut,
  }
}
