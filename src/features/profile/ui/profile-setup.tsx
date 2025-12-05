'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AvatarSelector } from '@/features/auth/ui/avatar-selector'
import { useAuth } from '@/features/auth/application/hooks/use-auth'
import { useProfile } from '../application/hooks/use-profile'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/ui/alert'

interface ProfileSetupProps {
  onComplete?: () => void
}

/**
 * Googleユーザーの初回ログイン時にプロフィールを設定するコンポーネント
 */
export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, isGoogle } = useAuth()
  const { initializeProfile, isCreating, createError } = useProfile()

  const [form, setForm] = useState({
    name: user?.name || '',
    avatarType: '',
  })
  const [errors, setErrors] = useState<string[]>([])

  if (!isGoogle || !user) {
    return null
  }

  const handleSubmit = () => {
    const newErrors: string[] = []

    if (!form.name.trim()) {
      newErrors.push('名前を入力してください')
    }

    if (!form.avatarType) {
      newErrors.push('アバターを選択してください')
    }

    setErrors(newErrors)

    if (newErrors.length === 0) {
      initializeProfile({
        userId: user.id,
        name: form.name.trim(),
        avatarType: form.avatarType,
      })
      onComplete?.()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
            プロフィール設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Googleアカウントでのログインが完了しました。
            <br />
            プロフィールを設定してください。
          </p>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                プロフィールの作成に失敗しました。もう一度お試しください。
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="profile-name">名前</Label>
            <Input
              id="profile-name"
              type="text"
              placeholder="表示される名前を入力"
              value={form.name}
              onChange={e => {
                setForm(prev => ({ ...prev, name: e.target.value }))
                setErrors([])
              }}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label>アバター</Label>
            <AvatarSelector
              value={form.avatarType}
              onChange={(avatarType: string) => {
                setForm(prev => ({ ...prev, avatarType }))
                setErrors([])
              }}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? '作成中...' : 'プロフィールを作成'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
