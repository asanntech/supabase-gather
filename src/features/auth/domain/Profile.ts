import { z } from 'zod'
import { AvatarTypeSchema } from './User'

/**
 * Entity: プロフィール
 * - 認証されたユーザーの追加プロフィール情報
 * - User エンティティとは独立したライフサイクル
 * - Value Object、ファクトリー、検証を統合
 */

// 基本スキーマ定義
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  // ユーザーIDとの関連
  userId: z.string().uuid(),
  // Value Object相当: 表示名の値制約
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or less')
    .trim(),
  // Value Object相当: 生名（オプショナル）
  realName: z
    .string()
    .max(100, 'Real name must be 100 characters or less')
    .trim()
    .optional(),
  avatarType: AvatarTypeSchema,
  // プロフィール画像URL（オプショナル）
  avatarUrl: z.string().url().optional(),
  // 自己紹介文
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
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
  userId: true, // userId は変更不可
  createdAt: true,
  updatedAt: true,
}).partial()

export type CreateProfileInput = z.infer<typeof CreateProfileSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

/**
 * ファクトリー関数
 */
export const createProfile = (input: CreateProfileInput): Profile => {
  // 1. 入力データの検証とサニタイズ
  const validatedInput = CreateProfileSchema.parse(input)

  // 2. エンティティ作成
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    ...validatedInput,
    createdAt: now,
    updatedAt: now,
  }
}

export const updateProfile = (
  current: Profile,
  updates: UpdateProfileInput
): Profile => {
  const validatedUpdates = UpdateProfileSchema.parse(updates)

  return {
    ...current,
    ...validatedUpdates,
    updatedAt: new Date(),
  }
}

/**
 * ビジネスルール検証
 */
export const validateProfileBusinessRules = (profile: Profile): boolean => {
  // 表示名に不適切な文字が含まれていないかチェック
  const inappropriateWords = ['admin', 'moderator', 'system']
  const lowerDisplayName = profile.displayName.toLowerCase()

  if (inappropriateWords.some(word => lowerDisplayName.includes(word))) {
    throw new Error('Display name cannot contain reserved words')
  }

  return true
}

// カスタム検証スキーマ
export const ProfileWithBusinessRulesSchema = ProfileSchema.refine(
  validateProfileBusinessRules,
  {
    message: 'Profile business rule validation failed',
  }
)

/**
 * ドメイン固有のヘルパー関数
 */
export const getProfileDisplayName = (profile: Profile): string => {
  return profile.displayName || 'Anonymous'
}

export const hasCustomAvatar = (profile: Profile): boolean => {
  return !!profile.avatarUrl
}

export const getProfileSummary = (profile: Profile): string => {
  const name = getProfileDisplayName(profile)
  const bio = profile.bio ? ` - ${profile.bio}` : ''
  return `${name}${bio}`
}
