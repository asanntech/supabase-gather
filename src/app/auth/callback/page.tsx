'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/shared/config/supabase'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

/**
 * Google OAuthコールバックページ
 */
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLのハッシュフラグメントからセッションを取得
        const { error } = await supabase.auth.getSession()

        if (error) {
          console.error('認証コールバックエラー:', error)
          // エラー時はログインページへリダイレクト
          router.push('/?error=auth_failed')
          return
        }

        // 成功時はメインページへリダイレクト
        router.push('/')
      } catch (error) {
        console.error('認証処理エラー:', error)
        router.push('/?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">認証処理中...</p>
      </div>
    </div>
  )
}
