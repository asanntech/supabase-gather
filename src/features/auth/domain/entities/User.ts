import { z } from 'zod'

/**
 * Entity: ユーザー
 * - 識別子(id)を持つドメインオブジェクト
 * - Value Object、ファクトリー、検証を統合
 */

// 基本スキーマ定義（Value Objectの機能も兼ねる）
export const UserSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  // Value Object相当: 名前の値制約
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  // Value Object相当: アバタータイプの列挙制約
  avatarType: z
    .enum(['blue', 'red', 'green'], {
      errorMap: () => ({ message: 'Avatar type must be blue, red, or green' }),
    })
    .default('blue'),
  // Value Object相当: ユーザータイプの列挙制約
  userType: z.enum(['google', 'guest'], {
    errorMap: () => ({ message: 'User type must be google or guest' }),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// TypeScriptの型をZodスキーマから生成
export type User = z.infer<typeof UserSchema>

// 入力データ用のスキーマ
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  userType: true, // userTypeは作成後変更不可
  createdAt: true,
  updatedAt: true,
}).partial()

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

/**
 * ファクトリー関数
 */
export const createUser = (
  input: CreateUserInput
): Omit<User, 'id' | 'createdAt' | 'updatedAt'> => {
  // 1. 入力データの検証とサニタイズ
  const validatedInput = CreateUserSchema.parse(input)

  // 2. エンティティ作成（IDと日時は外部で付与）
  const user = {
    ...validatedInput,
    id: 'temp-id', // 一時的なID（ビジネスルール検証のため）
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // 3. ビジネスルール検証
  validateUserBusinessRules(user)

  // 4. 一時的なフィールドを除いて返却
  return {
    name: validatedInput.name,
    avatarType: validatedInput.avatarType,
    userType: validatedInput.userType,
  }
}

export const updateUser = (
  current: User,
  updates: UpdateUserInput
): Omit<User, 'id' | 'createdAt' | 'updatedAt'> => {
  const validatedUpdates = UpdateUserSchema.parse(updates)

  // 更新後のユーザーデータを作成
  const updatedUser = {
    ...current,
    name: validatedUpdates.name ?? current.name,
    avatarType: validatedUpdates.avatarType ?? current.avatarType,
  }

  // ビジネスルール検証
  validateUserBusinessRules(updatedUser)

  return {
    name: updatedUser.name,
    avatarType: updatedUser.avatarType,
    userType: updatedUser.userType,
  }
}

/**
 * ビジネスルール検証
 */
export const validateUserBusinessRules = (user: User): boolean => {
  // 例：ゲストユーザーは特定の名前パターンを持つべき
  if (user.userType === 'guest' && !user.name.startsWith('Guest')) {
    throw new Error('Guest users must have names starting with "Guest"')
  }

  // 例：Googleユーザーは適切な名前長を持つべき
  if (user.userType === 'google' && user.name.length < 2) {
    throw new Error('Google users must have names with at least 2 characters')
  }

  return true
}

/**
 * ヘルパー関数
 */
export const isGuestUser = (user: User): boolean => {
  return user.userType === 'guest'
}

export const isGoogleUser = (user: User): boolean => {
  return user.userType === 'google'
}
