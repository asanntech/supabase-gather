/**
 * 入室準備関連の型定義
 */

import { AppUser } from '@/features/auth/domain/types'
import { AvatarType } from '@/features/avatar/domain/types'

/**
 * 入室準備の状態
 */
export interface EntrySetupState {
  displayName: string
  avatarType: string | null
  isReady: boolean
}

/**
 * 入室準備の完了データ
 */
export interface EntrySetupData {
  displayName: string
  avatarType: AvatarType
}

/**
 * 入室準備モーダルのプロパティ
 */
export interface EntrySetupModalProps {
  user: AppUser
  roomInfo: {
    id: string
    name: string
    currentOccupants: number
    maxOccupants: number
  }
  onConfirm: (data: EntrySetupData) => void
  onCancel: () => void
}
