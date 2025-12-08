import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import {
  type Profile,
  type CreateProfileInput,
  type UpdateProfileInput,
  createProfile,
  updateProfile,
  validateProfileBusinessRules,
  isProfileRecent,
  isProfileUpdated,
} from './Profile'

describe('Profile Entity', () => {
  const baseDate = new Date('2024-01-01T00:00:00.000Z')
  const laterDate = new Date('2024-01-02T00:00:00.000Z')

  const validProfile: Profile = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    avatarType: 'blue',
    createdAt: baseDate,
    updatedAt: baseDate,
  }

  describe('Factory Functions', () => {
    describe('createProfile', () => {
      it('should create valid profile', () => {
        const input: CreateProfileInput = {
          name: 'John Doe',
          avatarType: 'blue',
        }
        const result = createProfile(input)
        expect(result).toEqual({
          name: 'John Doe',
          avatarType: 'blue',
        })
      })

      it('should throw error for reserved names', () => {
        const input: CreateProfileInput = {
          name: 'admin',
          avatarType: 'blue',
        }
        expect(() => createProfile(input)).toThrow(
          'Profile name cannot be a reserved word: admin'
        )
      })

      it('should throw error for invalid input', () => {
        const invalidInput = {
          name: '',
          avatarType: 'blue',
        } as CreateProfileInput
        expect(() => createProfile(invalidInput)).toThrow(ZodError)
      })
    })

    describe('updateProfile', () => {
      it('should update profile fields', () => {
        const updates: UpdateProfileInput = {
          name: 'Updated Name',
          avatarType: 'green',
        }
        const result = updateProfile(validProfile, updates)
        expect(result).toEqual({
          name: 'Updated Name',
          avatarType: 'green',
        })
      })

      it('should validate reserved names in update', () => {
        const updates: UpdateProfileInput = {
          name: 'system',
        }
        expect(() => updateProfile(validProfile, updates)).toThrow(
          'Profile name cannot be a reserved word: system'
        )
      })
    })
  })

  describe('Business Rules Validation', () => {
    it('should pass for valid profile', () => {
      const result = validateProfileBusinessRules(validProfile)
      expect(result).toBe(true)
    })

    it('should enforce reserved name restrictions', () => {
      const reservedNames = ['admin', 'system', 'root', 'moderator']
      reservedNames.forEach(reservedName => {
        const invalidProfile = { ...validProfile, name: reservedName }
        expect(() => validateProfileBusinessRules(invalidProfile)).toThrow(
          `Profile name cannot be a reserved word: ${reservedName}`
        )
      })
    })

    it('should enforce date consistency', () => {
      const invalidProfile = {
        ...validProfile,
        createdAt: laterDate,
        updatedAt: baseDate,
      }
      expect(() => validateProfileBusinessRules(invalidProfile)).toThrow(
        'Profile created date cannot be later than updated date'
      )
    })
  })

  describe('Helper Functions', () => {
    it('should correctly identify recent profiles', () => {
      const recentProfile = { ...validProfile, createdAt: new Date() }
      const oldProfile = { ...validProfile, createdAt: new Date('2020-01-01') }
      
      expect(isProfileRecent(recentProfile, 7)).toBe(true)
      expect(isProfileRecent(oldProfile, 7)).toBe(false)
    })

    it('should correctly identify updated profiles', () => {
      const unchangedProfile = { ...validProfile, createdAt: baseDate, updatedAt: baseDate }
      const updatedProfile = { ...validProfile, createdAt: baseDate, updatedAt: laterDate }
      
      expect(isProfileUpdated(unchangedProfile)).toBe(false)
      expect(isProfileUpdated(updatedProfile)).toBe(true)
    })
  })
})