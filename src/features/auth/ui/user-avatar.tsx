'use client'

import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { AppUser } from '../domain/types'
import { AuthUser } from '../domain/models/auth-user'
import { AvatarService, AVATAR_TYPES } from '@/features/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: AppUser
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 48,
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const avatarType = AuthUser.getDisplayAvatar(user)

  // 全ユーザー（GoogleもGuest）でSVGアバターを使用
  if (avatarType && AVATAR_TYPES.includes(avatarType)) {
    const displayInfo = AvatarService.createDisplayInfo(avatarType)

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
        title={user.name}
      >
        <Image
          src={displayInfo.imagePath}
          alt={`${user.name}のアバター (${displayInfo.displayName})`}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="object-cover"
        />
      </div>
    )
  }

  // フォールバック（アバタータイプが無効な場合）
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
