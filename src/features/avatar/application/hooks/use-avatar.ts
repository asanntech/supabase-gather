'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AvatarType } from '../../domain/types'
import { AvatarService } from '../../domain/services/avatar-service'
import { SupabaseAvatarRepository } from '@/infrastructure/api/avatar/supabase-avatar-repository'
import { useAuth } from '@/features/auth'

const avatarRepository = new SupabaseAvatarRepository()

/**
 * アバター管理用のReact Query hook
 */
export function useAvatar(userId?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const targetUserId = userId || user?.id
  const isGoogleUser = user?.provider === 'google'

  // 現在のアバタータイプを取得
  const {
    data: currentAvatar,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['avatar', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null
      return avatarRepository.getCurrentAvatar(targetUserId, isGoogleUser)
    },
    enabled: !!targetUserId,
  })

  // アバタータイプ更新のMutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarType: AvatarType) => {
      if (!targetUserId) {
        throw new Error('User ID is required')
      }

      // 妥当性チェック
      const validation = AvatarService.validateAvatarType(avatarType)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Googleユーザーの場合はプロフィールを更新
      if (isGoogleUser) {
        await avatarRepository.updateGoogleUserAvatar(targetUserId, avatarType)
      }
      // ゲストユーザーの場合は後でPresenceで更新される

      return avatarType
    },
    onSuccess: avatarType => {
      // キャッシュを更新
      queryClient.setQueryData(['avatar', targetUserId], avatarType)

      // 関連するクエリも無効化
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return {
    currentAvatar,
    isLoading,
    error,
    updateAvatar: updateAvatarMutation.mutate,
    isUpdating: updateAvatarMutation.isPending,
    updateError: updateAvatarMutation.error,
  }
}

/**
 * アバター表示情報を取得するhook
 */
export function useAvatarDisplayInfo() {
  return useQuery({
    queryKey: ['avatar-display-info'],
    queryFn: () => AvatarService.getAllAvatarDisplayInfo(),
    staleTime: Infinity, // 静的データなのでキャッシュを長期保持
  })
}

/**
 * アバタータイプの妥当性検証hook
 */
export function useAvatarValidation() {
  const validateAvatarType = (type: string) => {
    return AvatarService.validateAvatarType(type)
  }

  const generateRandomAvatar = () => {
    return AvatarService.generateRandomAvatarType()
  }

  return {
    validateAvatarType,
    generateRandomAvatar,
    availableTypes: AvatarService.getAllAvatarDisplayInfo(),
  }
}
