'use client'

import { cn } from '@/lib/utils'

interface AvatarSelectorProps {
  value: string
  onChange: (avatarType: string) => void
  className?: string
}

// サンプルアバタータイプ（実装時にはより多くのアバターを追加）
const avatarTypes = [
  { id: 'cat', emoji: '🐱', label: '猫' },
  { id: 'dog', emoji: '🐶', label: '犬' },
  { id: 'rabbit', emoji: '🐰', label: 'うさぎ' },
  { id: 'bear', emoji: '🐻', label: 'くま' },
  { id: 'panda', emoji: '🐼', label: 'パンダ' },
  { id: 'fox', emoji: '🦊', label: 'きつね' },
  { id: 'koala', emoji: '🐨', label: 'コアラ' },
  { id: 'pig', emoji: '🐷', label: 'ぶた' },
]

export function AvatarSelector({
  value,
  onChange,
  className,
}: AvatarSelectorProps) {
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {avatarTypes.map(avatar => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
          className={cn(
            'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-accent',
            value === avatar.id
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div className="text-2xl mb-1">{avatar.emoji}</div>
          <div className="text-xs text-center">{avatar.label}</div>
        </button>
      ))}
    </div>
  )
}
