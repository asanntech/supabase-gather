import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import {
  type User,
  type CreateUserInput,
  type UpdateUserInput,
  createUser,
  updateUser,
  validateUserBusinessRules,
  isGuestUser,
  isGoogleUser,
} from './User'

describe('User Entity', () => {
  const validGoogleUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    avatarType: 'blue',
    userType: 'google',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  }

  const validGuestUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Guest_123',
    avatarType: 'red',
    userType: 'guest',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  }

  describe('Factory Functions', () => {
    describe('createUser', () => {
      it('should create valid google user', () => {
        const input: CreateUserInput = {
          name: 'John Doe',
          avatarType: 'blue',
          userType: 'google',
        }
        const result = createUser(input)
        expect(result).toEqual({
          name: 'John Doe',
          avatarType: 'blue',
          userType: 'google',
        })
      })

      it('should create valid guest user', () => {
        const input: CreateUserInput = {
          name: 'Guest_123',
          avatarType: 'red',
          userType: 'guest',
        }
        const result = createUser(input)
        expect(result).toEqual({
          name: 'Guest_123',
          avatarType: 'red',
          userType: 'guest',
        })
      })

      it('should throw error for invalid business rules', () => {
        const input: CreateUserInput = {
          name: 'Bad Guest',
          avatarType: 'blue',
          userType: 'guest',
        }
        expect(() => createUser(input)).toThrow(
          'Guest users must have names starting with "Guest"'
        )
      })

      it('should throw error for invalid input', () => {
        const invalidInput = {
          name: '',
          avatarType: 'blue',
          userType: 'google',
        } as CreateUserInput
        expect(() => createUser(invalidInput)).toThrow(ZodError)
      })
    })

    describe('updateUser', () => {
      it('should update user fields', () => {
        const updates: UpdateUserInput = {
          name: 'Updated Name',
          avatarType: 'green',
        }
        const result = updateUser(validGoogleUser, updates)
        expect(result).toEqual({
          name: 'Updated Name',
          avatarType: 'green',
          userType: 'google',
        })
      })

      it('should validate business rules after update', () => {
        const updates: UpdateUserInput = {
          name: 'x',
        }
        expect(() => updateUser(validGoogleUser, updates)).toThrow(
          'Google users must have names with at least 2 characters'
        )
      })
    })
  })

  describe('Business Rules Validation', () => {
    it('should pass for valid users', () => {
      expect(validateUserBusinessRules(validGoogleUser)).toBe(true)
      expect(validateUserBusinessRules(validGuestUser)).toBe(true)
    })

    it('should enforce guest user name prefix', () => {
      const invalidGuestUser = { ...validGuestUser, name: 'NotAGuest' }
      expect(() => validateUserBusinessRules(invalidGuestUser)).toThrow(
        'Guest users must have names starting with "Guest"'
      )
    })

    it('should enforce google user name length', () => {
      const invalidGoogleUser = { ...validGoogleUser, name: 'x' }
      expect(() => validateUserBusinessRules(invalidGoogleUser)).toThrow(
        'Google users must have names with at least 2 characters'
      )
    })
  })

  describe('Helper Functions', () => {
    it('should correctly identify user types', () => {
      expect(isGuestUser(validGuestUser)).toBe(true)
      expect(isGuestUser(validGoogleUser)).toBe(false)
      expect(isGoogleUser(validGoogleUser)).toBe(true)
      expect(isGoogleUser(validGuestUser)).toBe(false)
    })
  })
})