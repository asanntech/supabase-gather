# Task: Figmaデザイン完全実装

## 目標

Figmaデザイン（https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-59）を完全に再現し、レスポンシブ対応を含む最終的なUI調整を行う

## 実装内容

### 1. 最終統合モーダルコンポーネント

**ファイル**: `src/features/room-entry/ui/room-entry-modal.tsx` (最終版)

```typescript
"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRoomEntry } from '../hooks/use-room-entry'
import { AvatarSelector } from '@/features/avatar/ui/avatar-selector'
import { DisplayNameInput } from './display-name-input'
import { RoomStatusDisplay } from '@/features/rooms/ui/room-status-display'
import { RoomEntryActions } from './room-entry-actions'
import { ErrorDisplay } from './error-display'

interface RoomEntryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RoomEntryModal({ isOpen, onOpenChange }: RoomEntryModalProps) {
  const {
    state,
    form,
    roomStatus,
    handleEnterRoom,
    handleCancel,
    resetError,
    canEnterRoom,
    isLoading
  } = useRoomEntry()

  // キャンセル時にモーダルも閉じる
  const handleCancelAndClose = () => {
    handleCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-md max-w-[95vw] w-full
          p-0 gap-0 bg-white
          [&>button]:hidden
        "
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* ヘッダー - Figmaデザイン準拠 */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              ルームに入る
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              表示名とアバターを設定してください
            </p>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-6 py-6 space-y-6">
          {/* エラー表示 */}
          {state.error && (
            <ErrorDisplay
              error={{
                type: 'UNKNOWN_ERROR' as any,
                message: state.error,
                userMessage: state.error,
                canRetry: true
              }}
              onRetry={resetError}
              onDismiss={resetError}
            />
          )}

          {/* 表示名入力 */}
          <DisplayNameInput
            value={form.formData.displayName}
            onChange={form.updateDisplayName}
            onBlur={form.handleDisplayNameBlur}
            errors={form.validation.displayName.errors}
            touched={form.touched.displayName}
            isGuestUser={!form.user}
          />

          {/* アバター選択 */}
          <AvatarSelector
            selectedAvatar={form.formData.selectedAvatar}
            onAvatarSelect={form.updateSelectedAvatar}
          />

          {/* ルーム状態表示 */}
          <RoomStatusDisplay
            roomStatus={roomStatus.roomStatus}
            onRetry={roomStatus.retryConnection}
          />
        </div>

        {/* フッター - アクションボタン */}
        <div className="px-6 py-4 border-t border-gray-100">
          <RoomEntryActions
            canEnterRoom={canEnterRoom}
            isLoading={isLoading}
            onEnterRoom={handleEnterRoom}
            onCancel={handleCancelAndClose}
          />
        </div>

        {/* 成功状態のオーバーレイ */}
        {state.step === 'success' && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">入室完了！</h3>
                <p className="text-sm text-gray-600">ルームに移動しています...</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### 2. レスポンシブスタイリング調整

**ファイル**: `src/features/room-entry/ui/responsive-styles.css`

```css
/* モバイル専用調整 */
@media (max-width: 640px) {
  /* モーダルのフルスクリーン化 */
  .room-entry-modal {
    max-width: 100vw !important;
    max-height: 100vh !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  /* アバターセレクターの縦並び */
  .avatar-selector-mobile {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }

  .avatar-selector-mobile .avatar-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 1rem !important;
  }

  /* ボタンのスタック表示 */
  .room-entry-actions-mobile {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }

  .room-entry-actions-mobile button {
    width: 100% !important;
  }
}

/* タブレット調整 */
@media (min-width: 641px) and (max-width: 1024px) {
  .room-entry-modal {
    max-width: 28rem !important;
  }
}
```

### 3. Figmaデザイン準拠のスタイル定数

**ファイル**: `src/features/room-entry/constants/design-tokens.ts`

```typescript
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      600: '#4b5563',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      600: '#16a34a',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      600: '#dc2626',
    },
  },
  spacing: {
    modal: {
      padding: '1.5rem',
      gap: '1.5rem',
    },
    section: {
      gap: '1rem',
    },
  },
  borderRadius: {
    modal: '0.75rem',
    button: '0.5rem',
    input: '0.375rem',
  },
  shadows: {
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    button: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
} as const

// Figma準拠のサイズ設定
export const MODAL_DIMENSIONS = {
  desktop: {
    width: '28rem', // 448px
    maxHeight: '80vh',
  },
  mobile: {
    width: '100vw',
    height: '100vh',
  },
} as const
```

### 4. アクセシビリティ強化

**ファイル**: `src/features/room-entry/ui/accessibility-enhancements.tsx`

```typescript
// アクセシビリティ対応のユーティリティ
export const A11Y_LABELS = {
  modal: {
    'aria-label': 'ルーム入室設定',
    role: 'dialog',
    'aria-modal': 'true',
  },
  displayNameInput: {
    'aria-label': '表示名を入力',
    'aria-required': 'true',
  },
  avatarSelector: {
    role: 'radiogroup',
    'aria-label': 'アバターを選択',
  },
  enterButton: {
    'aria-label': 'ルームに入室する',
  },
  cancelButton: {
    'aria-label': 'キャンセルしてトップページに戻る',
  },
} as const

// フォーカス管理
export function useFocusManagement() {
  const focusFirstInput = useCallback(() => {
    const firstInput = document.querySelector(
      '[data-focus-first]'
    ) as HTMLElement
    firstInput?.focus()
  }, [])

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      // タブキーによるフォーカストラップ実装
      const focusableElements = document.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      // フォーカス制御ロジック
    }
  }, [])

  return { focusFirstInput, trapFocus }
}
```

### 5. 最終的な統合テスト用のストーリーブック設定

**ファイル**: `src/features/room-entry/ui/room-entry-modal.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { RoomEntryModal } from './room-entry-modal'

const meta: Meta<typeof RoomEntryModal> = {
  title: 'Features/RoomEntry/RoomEntryModal',
  component: RoomEntryModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof RoomEntryModal>

export const Default: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => {},
  },
}

export const WithError: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => {},
  },
  // エラー状態のモック実装
}

export const RoomFull: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => {},
  },
  // 満員状態のモック実装
}

export const Mobile: Story = {
  args: {
    isOpen: true,
    onOpenChange: () => {},
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
```

## 検証項目

- [ ] Figmaデザインとピクセル完璧な一致
- [ ] デスクトップでの適切なモーダルサイズ
- [ ] モバイルでのフルスクリーン表示
- [ ] アバターセレクターのレスポンシブレイアウト
- [ ] 適切なフォントサイズとスペーシング
- [ ] アクセシビリティ要件への準拠
- [ ] キーボードナビゲーションの完全サポート
- [ ] スクリーンリーダー対応
- [ ] フォーカス管理とタブオーダー

## 関連ファイル

- `src/features/room-entry/ui/room-entry-modal.tsx` (最終版)
- `src/features/room-entry/ui/responsive-styles.css`
- `src/features/room-entry/constants/design-tokens.ts`
- `src/features/room-entry/ui/accessibility-enhancements.tsx`
- `src/features/room-entry/ui/room-entry-modal.stories.tsx`

## 完了確認事項

- [ ] 全ての個別コンポーネントが統合されている
- [ ] Figmaデザインが完璧に再現されている
- [ ] レスポンシブデザインが全デバイスで動作する
- [ ] エラーハンドリングが適切に動作する
- [ ] アクセシビリティガイドラインに準拠している
- [ ] パフォーマンスが最適化されている
