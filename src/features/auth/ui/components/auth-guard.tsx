'use client'

import { ReactNode } from 'react'
import { useAuth } from '../hooks/use-auth'
import { LoginForm } from './login-form'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 認証が必要なページで使用するコンポーネント
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        {fallback || <LoginForm />}
      </div>
    )
  }

  return <>{children}</>
}
