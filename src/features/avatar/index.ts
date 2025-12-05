// Avatar feature exports

// Domain
export type {
  AvatarType,
  AvatarConfig,
  AvatarDisplayInfo,
  AvatarChangeEvent,
  UpdateAvatarInput,
  AvatarError,
} from './domain/types'
export { AVATAR_TYPES } from './domain/types'
export { AvatarTypeVO } from './domain/value-objects/avatar-type'
export { AvatarService } from './domain/services/avatar-service'
export type { AvatarRepository } from './domain/repositories/avatar-repository'

// Application
export {
  useAvatar,
  useAvatarDisplayInfo,
  useAvatarValidation,
} from './application/hooks/use-avatar'
export { AvatarApplicationService } from './application/services/avatar-application-service'

// Infrastructure
export { SupabaseAvatarRepository } from '../../infrastructure/api/avatar/supabase-avatar-repository'
