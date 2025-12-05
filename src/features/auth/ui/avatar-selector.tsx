'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { AvatarType, useAvatarDisplayInfo } from '@/features/avatar'

interface AvatarSelectorProps {
  value: AvatarType | ''
  onChange: (avatarType: AvatarType) => void
  className?: string
}

export function AvatarSelector({
  value,
  onChange,
  className,
}: AvatarSelectorProps) {
  const { data: avatarDisplayInfo, isLoading } = useAvatarDisplayInfo()

  if (isLoading || !avatarDisplayInfo) {
    return (
      <div className={cn('flex gap-3 flex-wrap', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="w-16 h-16 rounded-lg border-2 border-border bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3 flex-wrap', className)}>
      {avatarDisplayInfo.map(avatar => (
        <button
          key={avatar.type}
          type="button"
          onClick={() => onChange(avatar.type)}
          className={cn(
            'flex items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105 w-16 h-16',
            value === avatar.type
              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50 bg-muted/50'
          )}
          title={`アバター：${avatar.displayName}`}
        >
          <Image
            src={avatar.imagePath}
            alt={`${avatar.displayName}のアバター`}
            width={40}
            height={40}
            className="object-cover"
          />
        </button>
      ))}
    </div>
  )
}
