import { z } from 'zod'
import { AvatarTypeSchema } from './User'

/**
 * Entity: ゲストユーザー
 * - 一時的なセッションベースのユーザー
 * - サインアップ不要で使用可能
 * - Value Object、ファクトリー、検証を統合
 */

// 基本スキーマ定義
export const GuestUserSchema = z.object({
  id: z.string().uuid(),
  // Value Object相当: 表示名の値制約
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  avatarType: AvatarTypeSchema,
  // セッションID（必須）
  sessionId: z.string().min(1, 'Session ID is required'),
  // 作成日時（セッションのタイムアウト管理用）
  createdAt: z.date(),
  // 最終アクティビティ日時
  lastActiveAt: z.date(),
})

// TypeScriptの型をZodスキーマから生成
export type GuestUser = z.infer<typeof GuestUserSchema>

// 入力データ用のスキーマ
export const CreateGuestUserSchema = GuestUserSchema.omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
})

export const UpdateGuestUserSchema = GuestUserSchema.omit({
  id: true,
  sessionId: true, // sessionId は変更不可
  createdAt: true,
})
  .partial()
  .extend({
    // 最終アクティビティ日時は自動更新
    lastActiveAt: z.date().optional(),
  })

export type CreateGuestUserInput = z.infer<typeof CreateGuestUserSchema>
export type UpdateGuestUserInput = z.infer<typeof UpdateGuestUserSchema>

/**
 * ファクトリー関数
 */
export const createGuestUser = (input: CreateGuestUserInput): GuestUser => {
  // 1. 入力データの検証とサニタイズ
  const validatedInput = CreateGuestUserSchema.parse(input)

  // 2. エンティティ作成
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    ...validatedInput,
    createdAt: now,
    lastActiveAt: now,
  }
}

export const updateGuestUser = (
  current: GuestUser,
  updates: UpdateGuestUserInput
): GuestUser => {
  const validatedUpdates = UpdateGuestUserSchema.parse(updates)

  return {
    ...current,
    ...validatedUpdates,
    lastActiveAt: updates.lastActiveAt || new Date(),
  }
}

/**
 * ビジネスルール検証
 */
export const validateGuestUserBusinessRules = (
  guestUser: GuestUser
): boolean => {
  // セッションの有効期限チェック（24時間）
  const sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const now = new Date()
  const timeDiff = now.getTime() - guestUser.lastActiveAt.getTime()

  if (timeDiff > sessionTimeout) {
    throw new Error('Guest session has expired')
  }

  return true
}

// カスタム検証スキーマ
export const GuestUserWithBusinessRulesSchema = GuestUserSchema.refine(
  validateGuestUserBusinessRules,
  {
    message: 'Guest user business rule validation failed',
  }
)

/**
 * ドメイン固有のヘルパー関数
 */
export const isSessionExpired = (guestUser: GuestUser): boolean => {
  const sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
  const now = new Date()
  const timeDiff = now.getTime() - guestUser.lastActiveAt.getTime()

  return timeDiff > sessionTimeout
}

export const updateLastActive = (guestUser: GuestUser): GuestUser => {
  return updateGuestUser(guestUser, { lastActiveAt: new Date() })
}

export const getGuestDisplayName = (guestUser: GuestUser): string => {
  return guestUser.name || 'Guest User'
}

export const getSessionRemainingTime = (guestUser: GuestUser): number => {
  const sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
  const now = new Date()
  const timeDiff = now.getTime() - guestUser.lastActiveAt.getTime()

  return Math.max(0, sessionTimeout - timeDiff)
}
