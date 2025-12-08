import { z } from 'zod'

/**
 * Entity: プロファイル
 * - 識別子(id)を持つドメインオブジェクト
 * - データベースのprofilesテーブルに対応
 * - Value Object、ファクトリー、検証を統合
 */

// 基本スキーマ定義（Value Objectの機能も兼ねる）
export const ProfileSchema = z.object({
  id: z.string().uuid('Invalid profile ID format'),
  // Value Object相当: 名前の値制約
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .trim(),
  // Value Object相当: アバタータイプの列挙制約
  avatarType: z.enum(['blue', 'red', 'green'], {
    errorMap: () => ({ message: 'Avatar type must be blue, red, or green' }),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScriptの型をZodスキーマから生成
export type Profile = z.infer<typeof ProfileSchema>

// 入力データ用のスキーマ
export const CreateProfileSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateProfileSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial()

export type CreateProfileInput = z.infer<typeof CreateProfileSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

/**
 * ファクトリー関数
 */
export const createProfile = (
  input: CreateProfileInput
): Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> => {
  // 1. 入力データの検証とサニタイズ
  const validatedInput = CreateProfileSchema.parse(input)

  // 2. エンティティ作成（IDと日時は外部で付与）
  const profile = {
    ...validatedInput,
    id: 'temp-id', // 一時的なID（ビジネスルール検証のため）
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // 3. ビジネスルール検証
  validateProfileBusinessRules(profile)

  // 4. 一時的なフィールドを除いて返却
  return {
    name: validatedInput.name,
    avatarType: validatedInput.avatarType,
  }
}

export const updateProfile = (
  current: Profile,
  updates: UpdateProfileInput
): Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> => {
  const validatedUpdates = UpdateProfileSchema.parse(updates)

  // 更新後のプロファイルデータを作成
  const updatedProfile = {
    ...current,
    name: validatedUpdates.name ?? current.name,
    avatarType: validatedUpdates.avatarType ?? current.avatarType,
    updatedAt: new Date(),
  }

  // ビジネスルール検証
  validateProfileBusinessRules(updatedProfile)

  return {
    name: updatedProfile.name,
    avatarType: updatedProfile.avatarType,
  }
}

/**
 * ビジネスルール検証
 */
export const validateProfileBusinessRules = (profile: Profile): boolean => {
  // 例：プロファイル名は予約語を使用できない
  const reservedNames = ['admin', 'system', 'root', 'moderator']
  if (reservedNames.includes(profile.name.toLowerCase())) {
    throw new Error(`Profile name cannot be a reserved word: ${profile.name}`)
  }

  // 例：作成日時と更新日時の整合性チェック
  if (profile.createdAt > profile.updatedAt) {
    throw new Error('Profile created date cannot be later than updated date')
  }

  return true
}

/**
 * ヘルパー関数
 */
export const isProfileRecent = (
  profile: Profile,
  daysThreshold: number = 7
): boolean => {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)
  return profile.createdAt > thresholdDate
}

export const isProfileUpdated = (profile: Profile): boolean => {
  return profile.createdAt.getTime() !== profile.updatedAt.getTime()
}
