# Task: エラーハンドリングと自動復旧機能実装

## 目標
包括的なエラーハンドリング、自動復旧機能、ユーザーフレンドリーなエラー表示を実装する

## 実装内容

### 1. エラータイプ定義
**ファイル**: `src/features/room-entry/types/errors.ts`

```typescript
export enum RoomEntryErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ROOM_FULL = 'ROOM_FULL',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PROFILE_UPDATE_ERROR = 'PROFILE_UPDATE_ERROR',
  PRESENCE_ERROR = 'PRESENCE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface RoomEntryError {
  type: RoomEntryErrorType
  message: string
  userMessage: string
  canRetry: boolean
  autoRetryCount?: number
  originalError?: Error
}

export const ERROR_CONFIGS: Record<RoomEntryErrorType, Partial<RoomEntryError>> = {
  [RoomEntryErrorType.VALIDATION_ERROR]: {
    canRetry: false,
    userMessage: '入力内容に問題があります。修正してから再試行してください'
  },
  [RoomEntryErrorType.ROOM_FULL]: {
    canRetry: true,
    userMessage: 'ルームが満員です。しばらくお待ちください'
  },
  [RoomEntryErrorType.CONNECTION_ERROR]: {
    canRetry: true,
    userMessage: 'ルームに接続できません。しばらくしてから再試行してください'
  },
  [RoomEntryErrorType.TIMEOUT_ERROR]: {
    canRetry: true,
    userMessage: '接続がタイムアウトしました。ネットワーク接続を確認してください'
  },
  [RoomEntryErrorType.AUTH_ERROR]: {
    canRetry: false,
    userMessage: '認証に問題が発生しました。再度ログインしてください'
  },
  [RoomEntryErrorType.PROFILE_UPDATE_ERROR]: {
    canRetry: true,
    userMessage: 'プロフィールの更新に失敗しましたが、入室は可能です'
  },
  [RoomEntryErrorType.PRESENCE_ERROR]: {
    canRetry: true,
    userMessage: 'ルーム状態の確認でエラーが発生しました'
  },
  [RoomEntryErrorType.UNKNOWN_ERROR]: {
    canRetry: true,
    userMessage: '予期しないエラーが発生しました。再試行してください'
  }
}
```

### 2. エラーハンドリングサービス
**ファイル**: `src/features/room-entry/services/error-handler-service.ts`

```typescript
import { RoomEntryError, RoomEntryErrorType, ERROR_CONFIGS } from '../types/errors'

export class ErrorHandlerService {
  private maxRetryAttempts = 3
  private retryDelay = 1000 // 1秒

  createError(
    type: RoomEntryErrorType,
    message: string,
    originalError?: Error
  ): RoomEntryError {
    const config = ERROR_CONFIGS[type]
    
    return {
      type,
      message,
      userMessage: config.userMessage || message,
      canRetry: config.canRetry || false,
      autoRetryCount: 0,
      originalError
    }
  }

  shouldAutoRetry(error: RoomEntryError): boolean {
    return (
      error.canRetry &&
      (error.autoRetryCount || 0) < this.maxRetryAttempts &&
      error.type !== RoomEntryErrorType.VALIDATION_ERROR
    )
  }

  async handleErrorWithRetry<T>(
    operation: () => Promise<T>,
    errorType: RoomEntryErrorType,
    operationName: string
  ): Promise<T> {
    let lastError: RoomEntryError | null = null
    let retryCount = 0

    while (retryCount <= this.maxRetryAttempts) {
      try {
        return await operation()
      } catch (error) {
        lastError = this.createError(
          errorType,
          `${operationName}でエラーが発生しました: ${error}`,
          error instanceof Error ? error : undefined
        )
        
        lastError.autoRetryCount = retryCount

        if (retryCount < this.maxRetryAttempts && lastError.canRetry) {
          console.warn(`Retrying ${operationName} (attempt ${retryCount + 1}/${this.maxRetryAttempts})`)
          await this.delay(this.retryDelay * Math.pow(2, retryCount)) // 指数バックオフ
          retryCount++
          continue
        }

        break
      }
    }

    throw lastError
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // エラーをログに記録
  logError(error: RoomEntryError, context?: Record<string, any>): void {
    console.error('RoomEntry Error:', {
      type: error.type,
      message: error.message,
      userMessage: error.userMessage,
      retryCount: error.autoRetryCount,
      context,
      originalError: error.originalError
    })

    // 本番環境では外部サービス（Sentry等）にも送信
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // TODO: 外部エラートラッキングサービス統合
    }
  }
}
```

### 3. エラー表示コンポーネント
**ファイル**: `src/features/room-entry/ui/error-display.tsx`

```typescript
"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { RoomEntryError } from '../types/errors'

interface ErrorDisplayProps {
  error: RoomEntryError
  onRetry?: () => void
  onDismiss?: () => void
  isRetrying?: boolean
  className?: string
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = ''
}: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'ROOM_FULL':
        return '👥'
      case 'CONNECTION_ERROR':
      case 'TIMEOUT_ERROR':
        return '🔌'
      case 'AUTH_ERROR':
        return '🔐'
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getAlertVariant = () => {
    switch (error.type) {
      case 'ROOM_FULL':
        return 'default' as const
      case 'PROFILE_UPDATE_ERROR':
        return 'default' as const
      default:
        return 'destructive' as const
    }
  }

  return (
    <Alert variant={getAlertVariant()} className={className}>
      {typeof getErrorIcon() === 'string' ? (
        <span className="text-lg">{getErrorIcon()}</span>
      ) : (
        getErrorIcon()
      )}
      
      <AlertDescription className="space-y-3">
        <div className="space-y-1">
          <p className="font-medium">{error.userMessage}</p>
          
          {error.autoRetryCount && error.autoRetryCount > 0 && (
            <p className="text-xs text-gray-600">
              自動再試行: {error.autoRetryCount} / 3 回
            </p>
          )}
        </div>

        {(error.canRetry || onDismiss) && (
          <div className="flex gap-2">
            {error.canRetry && onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={isRetrying}
                className="text-xs"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    再試行中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    再試行
                  </>
                )}
              </Button>
            )}
            
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                閉じる
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
```

### 4. 自動復旧監視フック
**ファイル**: `src/features/room-entry/hooks/use-auto-recovery.ts`

```typescript
"use client"

import { useState, useEffect, useCallback } from 'react'
import { ErrorHandlerService } from '../services/error-handler-service'
import { RoomEntryError } from '../types/errors'

interface AutoRecoveryState {
  isMonitoring: boolean
  recoveryAttempts: number
  lastRecoveryTime: Date | null
}

export function useAutoRecovery() {
  const [state, setState] = useState<AutoRecoveryState>({
    isMonitoring: false,
    recoveryAttempts: 0,
    lastRecoveryTime: null
  })

  const errorHandler = new ErrorHandlerService()

  // 満員状態の自動監視
  const startRoomMonitoring = useCallback(() => {
    setState(prev => ({ ...prev, isMonitoring: true }))

    const checkInterval = setInterval(() => {
      // ルーム状態をチェック（useRoomStatusから取得）
      // 空きが出た場合は自動で入室ボタンを有効化
    }, 5000) // 5秒ごとにチェック

    return () => {
      clearInterval(checkInterval)
      setState(prev => ({ ...prev, isMonitoring: false }))
    }
  }, [])

  // ネットワーク接続状態の監視
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored')
      // 接続復旧時に自動で状態をリフレッシュ
    }

    const handleOffline = () => {
      console.log('Network connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const attemptAutoRecovery = useCallback(async (
    error: RoomEntryError,
    recoveryAction: () => Promise<void>
  ) => {
    if (!errorHandler.shouldAutoRetry(error)) {
      return false
    }

    try {
      setState(prev => ({
        ...prev,
        recoveryAttempts: prev.recoveryAttempts + 1,
        lastRecoveryTime: new Date()
      }))

      await recoveryAction()
      return true
    } catch (recoveryError) {
      console.error('Auto recovery failed:', recoveryError)
      return false
    }
  }, [errorHandler])

  return {
    state,
    startRoomMonitoring,
    attemptAutoRecovery
  }
}
```

## 検証項目
- [ ] 各エラータイプに対して適切なメッセージが表示される
- [ ] 自動再試行が正しい回数と間隔で実行される
- [ ] 満員状態の自動監視が機能する
- [ ] ネットワーク接続復旧時の自動復旧が動作する
- [ ] エラーログが適切に記録される
- [ ] ユーザーが手動で再試行できる
- [ ] 復旧不可能なエラーでは再試行ボタンが無効化される

## 関連ファイル
- `src/features/room-entry/types/errors.ts`
- `src/features/room-entry/services/error-handler-service.ts`
- `src/features/room-entry/ui/error-display.tsx`
- `src/features/room-entry/hooks/use-auto-recovery.ts`

## 次のタスク
07_figma_design_implementation.md - Figmaデザイン完全実装