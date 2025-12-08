import { z } from 'zod'

/**
 * Entity: ゲストユーザー
 * - 識別子(id)を持つドメインオブジェクト
 * - セッション管理のためのゲストユーザー専用エンティティ
 * - Value Object、ファクトリー、検証を統合
 */

// 基本スキーマ定義（Value Objectの機能も兼ねる）
export const GuestUserSchema = z.object({
  id: z.string().uuid('Invalid guest user ID format'),
  // Value Object相当: 名前の値制約（ゲストユーザー専用）
  name: z
    .string()
    .min(1, 'Guest name is required')
    .max(50, 'Guest name must be 50 characters or less')
    .trim()
    .default('ゲスト'),
  // Value Object相当: アバタータイプの列挙制約
  avatarType: z
    .enum(['blue', 'red', 'green'], {
      errorMap: () => ({ message: 'Avatar type must be blue, red, or green' }),
    })
    .default('blue'),
  // Value Object相当: セッションIDの制約
  sessionId: z
    .string()
    .min(1, 'Session ID is required')
    .max(255, 'Session ID must be 255 characters or less'),
})

// TypeScriptの型をZodスキーマから生成
export type GuestUser = z.infer<typeof GuestUserSchema>

// 入力データ用のスキーマ
export const CreateGuestUserSchema = GuestUserSchema.omit({
  id: true,
}).partial({
  name: true,
  avatarType: true,
})

export const UpdateGuestUserSchema = GuestUserSchema.omit({
  id: true,
  sessionId: true, // セッションIDは作成後変更不可
}).partial()

export type CreateGuestUserInput = z.infer<typeof CreateGuestUserSchema>
export type UpdateGuestUserInput = z.infer<typeof UpdateGuestUserSchema>

/**
 * ファクトリー関数
 */
export const createGuestUser = (
  input: CreateGuestUserInput
): Omit<GuestUser, 'id'> => {
  // 1. 入力データの検証とサニタイズ
  const validatedInput = CreateGuestUserSchema.parse(input)

  // 2. デフォルト値を設定してエンティティ作成
  const guestUserData = {
    name: validatedInput.name ?? 'ゲスト',
    avatarType: validatedInput.avatarType ?? ('blue' as const),
    sessionId: validatedInput.sessionId,
  }

  // 3. 一時的なIDを付けてビジネスルール検証
  const guestUser = {
    ...guestUserData,
    id: 'temp-id', // 一時的なID（ビジネスルール検証のため）
  }

  // 4. ビジネスルール検証
  validateGuestUserBusinessRules(guestUser)

  // 5. 検証済みデータを返却
  return guestUserData
}

export const updateGuestUser = (
  current: GuestUser,
  updates: UpdateGuestUserInput
): Omit<GuestUser, 'id' | 'sessionId'> => {
  const validatedUpdates = UpdateGuestUserSchema.parse(updates)

  // 更新後のゲストユーザーデータを作成
  const updatedGuestUser = {
    ...current,
    name: validatedUpdates.name ?? current.name,
    avatarType: validatedUpdates.avatarType ?? current.avatarType,
  }

  // ビジネスルール検証
  validateGuestUserBusinessRules(updatedGuestUser)

  return {
    name: updatedGuestUser.name,
    avatarType: updatedGuestUser.avatarType,
  }
}

/**
 * ファクトリー関数（デフォルト生成版）
 */
export const createDefaultGuestUser = (
  sessionId: string
): Omit<GuestUser, 'id'> => {
  return createGuestUser({
    sessionId,
    // nameとavatarTypeはデフォルト値が使用される
  })
}

/**
 * ビジネスルール検証
 */
export const validateGuestUserBusinessRules = (
  guestUser: GuestUser
): boolean => {
  // セッションIDの形式チェック
  if (guestUser.sessionId.length < 10) {
    throw new Error('Session ID must be at least 10 characters long')
  }

  // 名前の長さチェック（既にZodで検証されているが、念のため）
  if (guestUser.name.length === 0 || guestUser.name.length > 50) {
    throw new Error('Guest user name must be between 1 and 50 characters')
  }

  return true
}

/**
 * ヘルパー関数
 */
export const isValidSessionId = (sessionId: string): boolean => {
  return sessionId.length >= 10 && sessionId.length <= 255
}

export const isDefaultGuestName = (guestUser: GuestUser): boolean => {
  return guestUser.name === 'ゲスト'
}
