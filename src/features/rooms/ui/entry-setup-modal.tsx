'use client'

import React, { useState, useEffect } from 'react'
import { EntrySetupModalProps, EntrySetupState } from '../domain/types/entry'
import { AvatarType } from '@/features/avatar/domain/types'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AvatarSelector } from '@/features/auth/ui/avatar-selector'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { AlertCircle, Users } from 'lucide-react'

/**
 * 入室準備モーダル
 * 認証後、ルーム入室前に毎回表示される
 */
export function EntrySetupModal({
  user,
  roomInfo,
  onConfirm,
  onCancel,
}: EntrySetupModalProps) {
  const [setupState, setSetupState] = useState<EntrySetupState>({
    displayName: user.name || '',
    avatarType: user.avatarType || null,
    isReady: false,
  })

  const isRoomFull = roomInfo.currentOccupants >= roomInfo.maxOccupants
  const canEnter =
    !isRoomFull && setupState.displayName.trim() && setupState.avatarType

  useEffect(() => {
    // 初期値の設定
    setSetupState({
      displayName:
        user.name ||
        (user.provider === 'google' && user.email
          ? 'ゲスト' + user.email.slice(0, 4)
          : 'ゲスト'),
      avatarType: user.avatarType || null,
      isReady: false,
    })
  }, [user])

  const handleConfirm = () => {
    if (canEnter && setupState.avatarType) {
      onConfirm({
        displayName: setupState.displayName.trim(),
        avatarType: setupState.avatarType as AvatarType,
      })
    }
  }

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e: Event) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>入室準備</DialogTitle>
          <DialogDescription>
            表示名とアバターを設定してください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ルーム情報 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{roomInfo.name}</span>
            </div>
            <span
              className={`text-sm font-medium ${isRoomFull ? 'text-red-600' : 'text-gray-600'}`}
            >
              {roomInfo.currentOccupants} / {roomInfo.maxOccupants}
            </span>
          </div>

          {/* 満員警告 */}
          {isRoomFull && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ルームが満員です。空きが出るまでお待ちください。
              </AlertDescription>
            </Alert>
          )}

          {/* 表示名入力 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              value={setupState.displayName}
              onChange={e =>
                setSetupState(prev => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              placeholder="表示名を入力"
              disabled={isRoomFull}
              maxLength={20}
            />
            <p className="text-xs text-gray-500">
              ルーム内で表示される名前です（最大20文字）
            </p>
          </div>

          {/* アバター選択 */}
          <div className="space-y-2">
            <Label>アバター</Label>
            <AvatarSelector
              value={(setupState.avatarType || '') as AvatarType | ''}
              onChange={(type: AvatarType) =>
                setSetupState(prev => ({
                  ...prev,
                  avatarType: type,
                }))
              }
              className={isRoomFull ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={!canEnter}>
            入室する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
