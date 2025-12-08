# [06b_room_entry_modal] 04\_フォーム入力とバリデーション実装

## 目標

表示名入力フィールドと包括的なバリデーション機能を実装し、Googleユーザーとゲストユーザーで異なる動作を提供する

## 実装内容

### 1. バリデーションルール定義

**ファイル**: `src/features/room-entry/types/validation.ts`

```typescript
export interface ValidationRule {
  message: string
  validate: (value: string) => boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const DISPLAY_NAME_RULES: ValidationRule[] = [
  {
    message: '表示名を入力してください',
    validate: (value: string) => value.trim().length > 0,
  },
  {
    message: '20文字以内で入力してください',
    validate: (value: string) => value.length <= 20,
  },
  {
    message: '1文字以上入力してください',
    validate: (value: string) => value.trim().length >= 1,
  },
  {
    message: '特殊文字は使用できません',
    validate: (value: string) =>
      /^[a-zA-Z0-9あ-んァ-ヶー一-龯\s]+$/.test(value),
  },
]

export function validateDisplayName(displayName: string): ValidationResult {
  const errors: string[] = []

  for (const rule of DISPLAY_NAME_RULES) {
    if (!rule.validate(displayName)) {
      errors.push(rule.message)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
```

### 2. フォーム状態管理フック

**ファイル**: `src/features/room-entry/hooks/use-room-entry-form.ts`

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/shared/hooks/use-auth'
import { validateDisplayName, ValidationResult } from '../types/validation'
import { AvatarType } from '@/features/avatar/types/avatar'

interface RoomEntryFormData {
  displayName: string
  selectedAvatar: AvatarType
}

interface FormValidation {
  displayName: ValidationResult
  isFormValid: boolean
}

export function useRoomEntryForm() {
  const { user } = useAuth()

  // 初期値設定（Googleユーザーの場合はprofiles.nameを使用）
  const [formData, setFormData] = useState<RoomEntryFormData>({
    displayName: '',
    selectedAvatar: 'blue',
  })

  const [validation, setValidation] = useState<FormValidation>({
    displayName: { isValid: true, errors: [] },
    isFormValid: false,
  })

  const [touched, setTouched] = useState({
    displayName: false,
  })

  // Googleユーザーの初期値設定
  useEffect(() => {
    if (user) {
      // TODO: profiles テーブルから名前を取得
      // const profileName = await getProfileName(user.id)
      const profileName =
        user.user_metadata?.full_name || user.email?.split('@')[0] || ''

      setFormData(prev => ({
        ...prev,
        displayName: profileName,
      }))
    } else {
      // ゲストユーザーの場合はランダム名
      const randomGuest = `ゲスト${Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, '0')}`
      setFormData(prev => ({
        ...prev,
        displayName: randomGuest,
      }))
    }
  }, [user])

  // リアルタイムバリデーション
  const validateForm = useCallback(() => {
    const displayNameValidation = validateDisplayName(formData.displayName)

    const newValidation = {
      displayName: displayNameValidation,
      isFormValid: displayNameValidation.isValid,
    }

    setValidation(newValidation)
    return newValidation
  }, [formData.displayName])

  useEffect(() => {
    validateForm()
  }, [validateForm])

  // フィールド更新関数
  const updateDisplayName = useCallback(
    (value: string) => {
      setFormData(prev => ({ ...prev, displayName: value }))
      if (touched.displayName) {
        validateForm()
      }
    },
    [touched.displayName, validateForm]
  )

  const updateSelectedAvatar = useCallback((avatar: AvatarType) => {
    setFormData(prev => ({ ...prev, selectedAvatar: avatar }))
  }, [])

  // フィールドのフォーカス離脱ハンドラー
  const handleDisplayNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, displayName: true }))
    validateForm()
  }, [validateForm])

  // フォームリセット
  const resetForm = useCallback(() => {
    setFormData({
      displayName: '',
      selectedAvatar: 'blue',
    })
    setTouched({
      displayName: false,
    })
    setValidation({
      displayName: { isValid: true, errors: [] },
      isFormValid: false,
    })
  }, [])

  return {
    formData,
    validation,
    touched,
    updateDisplayName,
    updateSelectedAvatar,
    handleDisplayNameBlur,
    validateForm,
    resetForm,
  }
}
```

### 3. 表示名入力コンポーネント

**ファイル**: `src/features/room-entry/ui/display-name-input.tsx`

```typescript
"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, User } from 'lucide-react'

interface DisplayNameInputProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors: string[]
  touched: boolean
  isGuestUser: boolean
  className?: string
}

export function DisplayNameInput({
  value,
  onChange,
  onBlur,
  errors,
  touched,
  isGuestUser,
  className = ''
}: DisplayNameInputProps) {
  const hasErrors = touched && errors.length > 0

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="displayName" className="text-sm font-medium">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          表示名 {!isGuestUser && <span className="text-xs text-gray-500">(編集可能)</span>}
        </div>
      </Label>

      <div className="space-y-1">
        <Input
          id="displayName"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={isGuestUser ? "表示名を入力してください" : ""}
          className={`
            ${hasErrors ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
          `}
          maxLength={20}
        />

        {/* 文字数カウンター */}
        <div className="flex justify-between text-xs">
          <div className="space-y-1">
            {hasErrors && (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className={`${value.length > 15 ? 'text-orange-600' : 'text-gray-500'}`}>
            {value.length} / 20
          </span>
        </div>
      </div>
    </div>
  )
}
```

### 4. 必要なshadcn/uiコンポーネント追加

```bash
# Input コンポーネント
npx shadcn@latest add input

# Label コンポーネント
npx shadcn@latest add label
```

## 検証項目

- [ ] Googleユーザーの場合、プロフィール名が初期値として設定される
- [ ] ゲストユーザーの場合、ランダムなゲスト名が初期値として設定される
- [ ] リアルタイムバリデーションが動作する
- [ ] フィールドを離れた時にエラーが表示される
- [ ] 文字数制限が適切に働く
- [ ] 特殊文字バリデーションが働く
- [ ] フォームの有効性が正しく判定される

## 関連ファイル

- `src/features/room-entry/types/validation.ts`
- `src/features/room-entry/hooks/use-room-entry-form.ts`
- `src/features/room-entry/ui/display-name-input.tsx`
- `components/ui/input.tsx` (shadcn/ui)
- `components/ui/label.tsx` (shadcn/ui)

## 次のタスク

05_business_logic_state_management.md - ビジネスロジックと状態管理実装
