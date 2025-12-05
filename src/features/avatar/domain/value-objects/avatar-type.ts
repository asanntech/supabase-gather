import { AvatarType, AVATAR_TYPES, AvatarConfig } from '../types'

/**
 * アバタータイプ値オブジェクト
 * アバターの種類を表現し、検証とビジネスルールを含む
 */
export class AvatarTypeVO {
  private constructor(private readonly _value: AvatarType) {}

  /**
   * 有効なアバタータイプから値オブジェクトを作成
   */
  static create(type: string): AvatarTypeVO {
    if (!this.isValid(type)) {
      throw new Error(
        `Invalid avatar type: ${type}. Must be one of: ${AVATAR_TYPES.join(', ')}`
      )
    }
    return new AvatarTypeVO(type as AvatarType)
  }

  /**
   * デフォルトのアバタータイプを作成
   */
  static createDefault(): AvatarTypeVO {
    return new AvatarTypeVO('blue')
  }

  /**
   * アバタータイプが有効かチェック
   */
  static isValid(type: string): type is AvatarType {
    return AVATAR_TYPES.includes(type as AvatarType)
  }

  /**
   * すべての利用可能なアバタータイプを取得
   */
  static getAllTypes(): readonly AvatarType[] {
    return AVATAR_TYPES
  }

  /**
   * アバタータイプの設定を取得
   */
  getConfig(): AvatarConfig {
    const configs: Record<AvatarType, AvatarConfig> = {
      blue: { type: 'blue', displayName: '青', color: '#2563eb' },
      purple: { type: 'purple', displayName: '紫', color: '#9333ea' },
      cyan: { type: 'cyan', displayName: 'シアン', color: '#0891b2' },
      indigo: { type: 'indigo', displayName: 'インディゴ', color: '#4338ca' },
      green: { type: 'green', displayName: '緑', color: '#059669' },
    }
    return configs[this._value]
  }

  /**
   * 画像パスを取得
   */
  getImagePath(): string {
    return `/avatars/${this._value}.svg`
  }

  /**
   * 値を取得
   */
  get value(): AvatarType {
    return this._value
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this._value
  }

  /**
   * 等価性チェック
   */
  equals(other: AvatarTypeVO): boolean {
    return this._value === other._value
  }
}
