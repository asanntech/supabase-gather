// アバター関連の型定義

/**
 * 利用可能なアバタータイプ（ドキュメント仕様）
 */
export const AVATAR_TYPES = [
  'blue',
  'purple',
  'cyan',
  'indigo',
  'green',
] as const

/**
 * アバタータイプの型
 */
export type AvatarType = (typeof AVATAR_TYPES)[number]

/**
 * アバター設定
 */
export interface AvatarConfig {
  readonly type: AvatarType
  readonly displayName: string
  readonly color: string
}

/**
 * アバターの表示情報
 */
export interface AvatarDisplayInfo {
  readonly type: AvatarType
  readonly imagePath: string
  readonly displayName: string
  readonly color: string
}

/**
 * アバター変更イベント
 */
export interface AvatarChangeEvent {
  readonly userId: string
  readonly previousType: AvatarType
  readonly newType: AvatarType
  readonly timestamp: Date
}

/**
 * アバター設定の更新入力
 */
export interface UpdateAvatarInput {
  readonly userId: string
  readonly avatarType: AvatarType
}

/**
 * アバター設定エラー
 */
export interface AvatarError {
  readonly message: string
  readonly code: 'INVALID_TYPE' | 'UPDATE_FAILED' | 'NOT_FOUND'
}
