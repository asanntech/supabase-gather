import { z } from 'zod'

/**
 * Entity: ユーザー
 * - 認証系の中核エンティティ
 * - Googleユーザーとゲストユーザーの両方を統合管理
 * - Value Object、ファクトリー、検証を統合
 */

// Value Object相当: アバタータイプの列挙制約
export const AvatarTypeSchema = z
  .enum(['blue', 'red', 'green', 'yellow', 'purple'])
  .default('blue')

// Value Object相当: ユーザータイプの列挙制約
export const UserTypeSchema = z.enum(['google', 'guest'])

// 基本スキーマ定義
export const UserSchema = z.object({
  id: z.string().uuid(),
  // Value Object相当: 名前の値制約
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  // Value Object相当: メールアドレス（Googleユーザーの場合は必須）
  email: z.string().email('Invalid email format').toLowerCase().optional(),
  avatarType: AvatarTypeSchema,
  userType: UserTypeSchema,
  // セッションID（ゲストユーザーの場合のみ）
  sessionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScriptの型をZodスキーマから生成
export type User = z.infer<typeof UserSchema>
export type AvatarType = z.infer<typeof AvatarTypeSchema>
export type UserType = z.infer<typeof UserTypeSchema>

// 入力データ用のスキーマ
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userType: true, // ユーザータイプは変更不可
}).partial()

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

/**
 * ファクトリー関数
 */
export const createUser = (input: CreateUserInput): User => {
  // 1. 入力データの検証とサニタイズ
  const validatedInput = CreateUserSchema.parse(input)

  // 2. エンティティ作成
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    ...validatedInput,
    createdAt: now,
    updatedAt: now,
  }
}

export const updateUser = (current: User, updates: UpdateUserInput): User => {
  const validatedUpdates = UpdateUserSchema.parse(updates)

  return {
    ...current,
    ...validatedUpdates,
    updatedAt: new Date(),
  }
}

/**
 * ビジネスルール検証
 */
export const validateUserBusinessRules = (user: User): boolean => {
  // Googleユーザーはemailが必須
  if (user.userType === 'google' && !user.email) {
    throw new Error('Google users must have an email address')
  }

  // ゲストユーザーはsessionIdが必須
  if (user.userType === 'guest' && !user.sessionId) {
    throw new Error('Guest users must have a session ID')
  }

  // GoogleユーザーはsessionIdを持てない
  if (user.userType === 'google' && user.sessionId) {
    throw new Error('Google users cannot have a session ID')
  }

  return true
}

// カスタム検証スキーマ
export const UserWithBusinessRulesSchema = UserSchema.refine(
  validateUserBusinessRules,
  {
    message: 'User business rule validation failed',
  }
)

/**
 * ドメイン固有のヘルパー関数
 */
export const isGoogleUser = (user: User): boolean => {
  return user.userType === 'google'
}

export const isGuestUser = (user: User): boolean => {
  return user.userType === 'guest'
}

export const getUserDisplayName = (user: User): string => {
  return user.name || 'Anonymous User'
}
