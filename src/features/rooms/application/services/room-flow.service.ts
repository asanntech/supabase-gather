/**
 * ルームフロー管理サービス
 * ユーザーフローのオーケストレーションを担当
 */

import { AppUser } from '@/features/auth/domain/types'
import { EntrySetupData } from '../../domain/types/entry'

export class RoomFlowService {
  private static readonly ROOM_FLOW_STATE_KEY = 'room-flow-state'

  /**
   * フロー状態の保存
   */
  static saveFlowState(state: {
    step: 'landing' | 'entry-setup' | 'room'
    roomId?: string
    entryData?: EntrySetupData
  }) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.ROOM_FLOW_STATE_KEY, JSON.stringify(state))
    }
  }

  /**
   * フロー状態の取得
   */
  static getFlowState() {
    if (typeof window === 'undefined') return null

    const stored = sessionStorage.getItem(this.ROOM_FLOW_STATE_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  /**
   * フロー状態のクリア
   */
  static clearFlowState() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.ROOM_FLOW_STATE_KEY)
    }
  }

  /**
   * 認証後の遷移先を決定
   */
  static determinePostAuthDestination(user: AppUser, targetRoomId?: string) {
    // 認証後は必ず入室準備モーダルを表示
    this.saveFlowState({
      step: 'entry-setup',
      roomId: targetRoomId || 'main-room',
    })

    return {
      showEntrySetup: true,
      roomId: targetRoomId || 'main-room',
    }
  }

  /**
   * 入室準備完了後の処理
   */
  static handleEntrySetupComplete(entryData: EntrySetupData, roomId: string) {
    this.saveFlowState({
      step: 'room',
      roomId,
      entryData,
    })
  }

  /**
   * エラーリカバリー
   */
  static handleConnectionError(error: Error, currentStep: string) {
    console.error('Connection error:', error)

    if (currentStep === 'room') {
      // ルーム内でエラーが発生した場合は再接続を試みる
      return { action: 'retry', delay: 3000 }
    } else {
      // その他の場合はトップページに戻る
      this.clearFlowState()
      return { action: 'redirect', destination: '/' }
    }
  }
}
