'use client'

import { useEffect } from 'react'
import { useAuthStore } from '../application/stores/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * 認証状態を初期化するプロバイダー
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore(state => state.initializeAuth)

  useEffect(() => {
    // アプリ起動時に認証状態を初期化
    initializeAuth()
  }, [initializeAuth])

  return <>{children}</>
}