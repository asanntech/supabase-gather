'use client'

import { AuthGuard, useAuth, UserAvatar } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'

function Dashboard() {
  const { user, signOut, isSigningOut, isGuest, isGoogle } = useAuth()

  if (!user) return null

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserAvatar user={user} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">ようこそ、{user.name}さん</h1>
            <p className="text-muted-foreground">
              {isGuest ? 'ゲストユーザー' : 'Googleアカウント'}
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={signOut} disabled={isSigningOut}>
          {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>ID:</strong> {user.id}
            </div>
            <div>
              <strong>名前:</strong> {user.name}
            </div>
            {user.provider === 'google' && 'email' in user && (
              <div>
                <strong>メール:</strong> {user.email}
              </div>
            )}
            {user.provider === 'guest' && 'avatarType' in user && (
              <div>
                <strong>アバター:</strong> {user.avatarType}
              </div>
            )}
            <div>
              <strong>種別:</strong> {user.provider}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>機能</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              認証システムが正常に動作しています。
              今後ここに追加機能が実装される予定です。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>認証ステータス</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isGoogle
                    ? 'bg-green-500'
                    : isGuest
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                }`}
              />
              <span className="text-sm">
                {isGoogle
                  ? '認証済み（Google）'
                  : isGuest
                    ? 'ゲストログイン'
                    : '未認証'}
              </span>
            </div>
          </CardContent>
        </Card>
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
