// 認証関連の型定義
import { AvatarType } from '@/features/avatar/domain/types'

export type AuthProvider = 'google' | 'guest'

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'guest'
  | 'unauthenticated'

// Google認証ユーザー
export interface GoogleUser {
  id: string
  email: string
  name: string
  avatarType: AvatarType
  provider: 'google'
}

// ゲストユーザー
export interface GuestUser {
  id: string
  name: string
  avatarType: AvatarType
  provider: 'guest'
}

// 統一ユーザー型
export type AppUser = GoogleUser | GuestUser

// 認証コンテキストの状態
export interface AuthState {
  status: AuthStatus
  user: AppUser | null
  isGuest: boolean
  isGoogle: boolean
}

// 認証エラー
export interface AuthError {
  message: string
  code?: string
}

// ゲストログイン入力
export interface GuestLoginInput {
  name: string
  avatarType: AvatarType
}

// 認証イベント
export type AuthEvent =
  | { type: 'GOOGLE_LOGIN_START' }
  | { type: 'GOOGLE_LOGIN_SUCCESS'; user: GoogleUser }
  | { type: 'GOOGLE_LOGIN_ERROR'; error: AuthError }
  | { type: 'GUEST_LOGIN'; input: GuestLoginInput }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE'; user?: AppUser }
