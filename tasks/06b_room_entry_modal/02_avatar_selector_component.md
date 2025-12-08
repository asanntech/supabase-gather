# [06b_room_entry_modal] 02\_アバターセレクターコンポーネント実装

## 目標

5色のSVGアバターを選択できるコンポーネントを作成し、選択状態とプレビュー表示を実装する

## 実装内容

### 1. アバタータイプ定義

**ファイル**: `src/features/avatar/types/avatar.ts`

```typescript
export const AVATAR_COLORS = [
  'blue',
  'purple',
  'cyan',
  'indigo',
  'green',
] as const
export type AvatarType = (typeof AVATAR_COLORS)[number]

export interface AvatarConfig {
  color: AvatarType
  bgColor: string
  accentColor: string
}

export const AVATAR_CONFIGS: Record<AvatarType, AvatarConfig> = {
  blue: { color: 'blue', bgColor: '#3B82F6', accentColor: '#1E40AF' },
  purple: { color: 'purple', bgColor: '#8B5CF6', accentColor: '#7C3AED' },
  cyan: { color: 'cyan', bgColor: '#06B6D4', accentColor: '#0891B2' },
  indigo: { color: 'indigo', bgColor: '#6366F1', accentColor: '#4F46E5' },
  green: { color: 'green', bgColor: '#10B981', accentColor: '#059669' },
}
```

### 2. アバターアイコンコンポーネント

**ファイル**: `src/features/avatar/ui/avatar-icon.tsx`

```typescript
import { AvatarConfig } from '../types/avatar'

interface AvatarIconProps {
  config: AvatarConfig
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarIcon({ config, size = 'md', className = '' }: AvatarIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 48 48" className="w-full h-full">
        {/* シンプルな人型SVGアバター */}
        <circle cx="24" cy="24" r="24" fill={config.bgColor} />
        <circle cx="24" cy="20" r="8" fill="white" opacity="0.9" />
        <path
          d="M12 44c0-8 5.5-12 12-12s12 4 12 12"
          fill="white"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
```

### 3. アバターセレクターコンポーネント

**ファイル**: `src/features/avatar/ui/avatar-selector.tsx`

```typescript
"use client"

import { useState } from 'react'
import { AvatarIcon } from './avatar-icon'
import { AVATAR_COLORS, AVATAR_CONFIGS, type AvatarType } from '../types/avatar'

interface AvatarSelectorProps {
  selectedAvatar?: AvatarType
  onAvatarSelect: (avatar: AvatarType) => void
  className?: string
}

export function AvatarSelector({
  selectedAvatar = 'blue',
  onAvatarSelect,
  className = ''
}: AvatarSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* プレビュー表示 */}
      <div className="flex justify-center">
        <div className="text-center space-y-2">
          <AvatarIcon
            config={AVATAR_CONFIGS[selectedAvatar]}
            size="lg"
          />
          <p className="text-sm text-gray-600">プレビュー</p>
        </div>
      </div>

      {/* アバター選択 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">アバターを選択</label>
        <div className="flex gap-3 justify-center flex-wrap">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onAvatarSelect(color)}
              className={`
                p-2 rounded-lg border-2 transition-all duration-200
                hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  selectedAvatar === color
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <AvatarIcon
                config={AVATAR_CONFIGS[color]}
                size="md"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 4. アバター管理フック

**ファイル**: `src/features/avatar/hooks/use-avatar.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { AvatarType } from '../types/avatar'

interface UseAvatarReturn {
  selectedAvatar: AvatarType
  setSelectedAvatar: (avatar: AvatarType) => void
  resetAvatar: () => void
}

export function useAvatar(initialAvatar: AvatarType = 'blue'): UseAvatarReturn {
  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarType>(initialAvatar)

  const resetAvatar = useCallback(() => {
    setSelectedAvatar('blue')
  }, [])

  return {
    selectedAvatar,
    setSelectedAvatar,
    resetAvatar,
  }
}
```

## 検証項目

- [ ] 5色のアバターが正常に表示される
- [ ] クリックで選択状態が変わる
- [ ] 選択されたアバターがハイライトされる
- [ ] プレビューが選択に応じて更新される
- [ ] レスポンシブデザインが適用される
- [ ] キーボードナビゲーションが機能する

## 関連ファイル

- `src/features/avatar/types/avatar.ts`
- `src/features/avatar/ui/avatar-icon.tsx`
- `src/features/avatar/ui/avatar-selector.tsx`
- `src/features/avatar/hooks/use-avatar.ts`

## 次のタスク

03_room_status_monitoring.md - ルーム状態監視機能の実装
