/**
 * Auth Domain Layer - Unified Exports
 *
 * このファイルはauth featureのドメイン層の統一エクスポートポイントです。
 * 他の層（use-cases, ui, infrastructure）からドメインオブジェクトを
 * インポートする際はこのファイルを経由してください。
 */

// Entities
export * from './entities/User'
export * from './entities/Profile'
export * from './entities/GuestUser'

// Repository Interfaces
export * from './repositories/AuthRepository'
export * from './repositories/ProfileRepository'
export * from './repositories/GuestUserRepository'

// Re-export types for convenience
export type {
  // User types
  User,
  CreateUserInput,
  UpdateUserInput,
} from './entities/User'

export type {
  // Profile types
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
} from './entities/Profile'

export type {
  // GuestUser types
  GuestUser,
  CreateGuestUserInput,
  UpdateGuestUserInput,
} from './entities/GuestUser'

export type {
  // Repository interfaces
  AuthRepository,
} from './repositories/AuthRepository'

export type {
  ProfileRepository,
} from './repositories/ProfileRepository'

export type {
  GuestUserRepository,
} from './repositories/GuestUserRepository'
