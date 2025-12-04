'use client'

import { AuthGuard, useAuth, UserAvatar } from '@/features/auth'
import { RoomEntry } from '@/features/rooms'
import { Button } from '@/shared/ui/button'

function Dashboard() {
  const { user, signOut, isSigningOut, isGuest } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserAvatar user={user} size="md" />
              <div>
                <h1 className="text-lg font-semibold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {isGuest ? 'ゲストユーザー' : 'Googleアカウント'}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={signOut} disabled={isSigningOut}>
              {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <RoomEntry roomId="main-room" user={user} />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
