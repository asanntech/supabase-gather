import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SupabaseProfileRepository } from '@/infrastructure/api/profile/supabase-profile-repository'
import { CreateProfileInput, UpdateProfileInput } from '../../domain/types'
import { useAuth } from '@/features/auth/application/hooks/use-auth'

const profileRepository = new SupabaseProfileRepository()

/**
 * プロフィール管理hook
 */
export function useProfile() {
  const { user, isGoogle } = useAuth()
  const queryClient = useQueryClient()

  const userId = isGoogle && user ? user.id : null

  // プロフィール取得
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileRepository.getByUserId(userId!),
    enabled: !!userId,
    retry: false,
  })

  // プロフィール作成
  const createProfileMutation = useMutation({
    mutationFn: (input: CreateProfileInput) => profileRepository.create(input),
    onSuccess: newProfile => {
      queryClient.setQueryData(['profile', userId], newProfile)
    },
    onError: error => {
      console.error('プロフィール作成エラー:', error)
    },
  })

  // プロフィール更新
  const updateProfileMutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => {
      if (!userId) throw new Error('ユーザーIDがありません')
      return profileRepository.update(userId, input)
    },
    onSuccess: updatedProfile => {
      queryClient.setQueryData(['profile', userId], updatedProfile)
    },
    onError: error => {
      console.error('プロフィール更新エラー:', error)
    },
  })

  // プロフィール初期化（Googleユーザー初回ログイン時）
  const initializeProfile = (input: CreateProfileInput) => {
    if (!userId) {
      throw new Error('ユーザーIDがありません')
    }
    createProfileMutation.mutate(input)
  }

  // プロフィール更新
  const updateProfile = (input: UpdateProfileInput) => {
    updateProfileMutation.mutate(input)
  }

  return {
    // State
    profile,
    isLoading,
    error,
    hasProfile: !!profile,

    // Actions
    initializeProfile,
    updateProfile,

    // Loading states
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,

    // Errors
    createError: createProfileMutation.error,
    updateError: updateProfileMutation.error,
  }
}
