// プロフィール関連の型定義

export interface UserProfile {
  id: string
  userId: string // auth.users.id
  name: string
  avatarType: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProfileInput {
  userId: string
  name: string
  avatarType: string
}

export interface UpdateProfileInput {
  name?: string
  avatarType?: string
}
