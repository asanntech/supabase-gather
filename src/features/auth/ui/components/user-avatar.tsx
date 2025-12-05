'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { AppUser } from '../../domain/types'
import { AuthUser } from '../../domain/models/auth-user'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: AppUser
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// アバタータイプから絵文字へのマッピング
const avatarEmojiMap: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  bear: '🐻',
  panda: '🐼',
  fox: '🦊',
  koala: '🐨',
  pig: '🐷',
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const avatarDisplay = AuthUser.getDisplayAvatar(user)

  // Googleユーザーの場合は画像を使用
  if (AuthUser.isGoogle(user) && avatarDisplay) {
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={avatarDisplay} alt={user.name} />
        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    )
  }

  // ゲストユーザーの場合は絵文字を使用
  if (AuthUser.isGuest(user) && avatarDisplay) {
    const emoji = avatarEmojiMap[avatarDisplay] || '👤'
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-2xl',
          sizeClasses[size],
          className
        )}
        title={user.name}
      >
        {emoji}
      </div>
    )
  }

  // フォールバック
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
