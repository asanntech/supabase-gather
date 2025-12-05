'use client'

import { useAuth } from '@/features/auth'
import { RoomScreen } from '@/features/rooms/ui/room-screen'
import { LandingPage } from '@/features/rooms/ui/landing-page'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'

export default function Home() {
  const { isLoading, isAuthenticated, user } = useAuth()

  // 認証チェック中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 未認証の場合はランディングページを表示
  if (!isAuthenticated || !user) {
    return <LandingPage />
  }

  // 認証済みの場合はルーム画面を表示（入室準備モーダルが自動的に表示される）
  return <RoomScreen roomId="main-room" user={user} />
}
