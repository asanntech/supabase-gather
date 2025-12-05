'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { useAuth } from '../application/hooks/use-auth'
import { AvatarSelector } from './avatar-selector'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/ui/alert'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signInAsGuest, signInWithGoogle, isSigningInWithGoogle } = useAuth()

  const [guestForm, setGuestForm] = useState({
    name: '',
    avatarType: '',
  })
  const [errors, setErrors] = useState<string[]>([])

  const handleGuestLogin = () => {
    const newErrors: string[] = []

    if (!guestForm.name.trim()) {
      newErrors.push('名前を入力してください')
    }

    if (!guestForm.avatarType) {
      newErrors.push('アバターを選択してください')
    }

    setErrors(newErrors)

    if (newErrors.length === 0) {
      signInAsGuest({
        name: guestForm.name.trim(),
        avatarType: guestForm.avatarType,
      })
      onSuccess?.()
    }
  }

  const handleGoogleLogin = () => {
    signInWithGoogle()
    onSuccess?.()
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Googleログイン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">アカウントでログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleLogin}
            disabled={isSigningInWithGoogle}
            className="w-full"
            variant="outline"
          >
            {isSigningInWithGoogle ? 'ログイン中...' : 'Googleでログイン'}
          </Button>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            または
          </span>
        </div>
      </div>

      {/* ゲストログイン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">ゲストとして参加</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="guest-name">名前</Label>
            <Input
              id="guest-name"
              type="text"
              placeholder="あなたの名前を入力"
              value={guestForm.name}
              onChange={e => {
                setGuestForm(prev => ({ ...prev, name: e.target.value }))
                setErrors([])
              }}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label>アバター</Label>
            <AvatarSelector
              value={guestForm.avatarType}
              onChange={avatarType => {
                setGuestForm(prev => ({ ...prev, avatarType }))
                setErrors([])
              }}
            />
          </div>

          <Button onClick={handleGuestLogin} className="w-full">
            ゲストとして参加
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
