// User エンティティ
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
  AvatarType,
  UserType,
} from './User'
export {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  AvatarTypeSchema,
  UserTypeSchema,
  UserWithBusinessRulesSchema,
  createUser,
  updateUser,
  validateUserBusinessRules,
  isGoogleUser,
  isGuestUser,
  getUserDisplayName,
} from './User'

// Profile エンティティ
export type { Profile, CreateProfileInput, UpdateProfileInput } from './Profile'
export {
  ProfileSchema,
  CreateProfileSchema,
  UpdateProfileSchema,
  ProfileWithBusinessRulesSchema,
  createProfile,
  updateProfile,
  validateProfileBusinessRules,
  getProfileDisplayName,
  hasCustomAvatar,
  getProfileSummary,
} from './Profile'

// GuestUser エンティティ
export type {
  GuestUser,
  CreateGuestUserInput,
  UpdateGuestUserInput,
} from './GuestUser'
export {
  GuestUserSchema,
  CreateGuestUserSchema,
  UpdateGuestUserSchema,
  GuestUserWithBusinessRulesSchema,
  createGuestUser,
  updateGuestUser,
  validateGuestUserBusinessRules,
  isSessionExpired,
  updateLastActive,
  getGuestDisplayName,
  getSessionRemainingTime,
} from './GuestUser'

// Repository インターフェース
export type { ProfileRepository } from './ProfileRepository'
export type { AuthRepository, AuthError, AuthState } from './AuthRepository'
