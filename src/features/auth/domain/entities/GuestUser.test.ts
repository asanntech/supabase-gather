import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import {
  type GuestUser,
  type CreateGuestUserInput,
  type UpdateGuestUserInput,
  createGuestUser,
  updateGuestUser,
  createDefaultGuestUser,
  validateGuestUserBusinessRules,
  isValidSessionId,
  isDefaultGuestName,
} from './GuestUser'

describe('GuestUser Entity', () => {
  const validGuestUser: GuestUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'ゲスト',
    avatarType: 'blue',
    sessionId: 'session_1234567890',
  }

  const customGuestUser: GuestUser = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'カスタムゲスト',
    avatarType: 'red',
    sessionId: 'custom_session_1234567890',
  }

  describe('Factory Functions', () => {
    describe('createGuestUser', () => {
      it('should create guest user with provided values', () => {
        const input: CreateGuestUserInput = {
          name: 'カスタムゲスト',
          avatarType: 'red',
          sessionId: 'session_1234567890',
        }
        const result = createGuestUser(input)
        expect(result).toEqual({
          name: 'カスタムゲスト',
          avatarType: 'red',
          sessionId: 'session_1234567890',
        })
      })

      it('should create guest user with defaults', () => {
        const input: CreateGuestUserInput = {
          sessionId: 'session_1234567890',
        }
        const result = createGuestUser(input)
        expect(result).toEqual({
          name: 'ゲスト',
          avatarType: 'blue',
          sessionId: 'session_1234567890',
        })
      })

      it('should throw error for invalid sessionId', () => {
        const input: CreateGuestUserInput = {
          sessionId: 'short',
        }
        expect(() => createGuestUser(input)).toThrow(
          'Session ID must be at least 10 characters long'
        )
      })

      it('should throw error for invalid input', () => {
        const invalidInput = {
          name: '',
          sessionId: 'session_1234567890',
        } as CreateGuestUserInput
        expect(() => createGuestUser(invalidInput)).toThrow(ZodError)
      })
    })

    describe('createDefaultGuestUser', () => {
      it('should create default guest user', () => {
        const sessionId = 'default_session_1234567890'
        const result = createDefaultGuestUser(sessionId)
        expect(result).toEqual({
          name: 'ゲスト',
          avatarType: 'blue',
          sessionId,
        })
      })
    })

    describe('updateGuestUser', () => {
      it('should update guest user fields', () => {
        const updates: UpdateGuestUserInput = {
          name: 'Updated Guest',
          avatarType: 'green',
        }
        const result = updateGuestUser(validGuestUser, updates)
        expect(result).toEqual({
          name: 'Updated Guest',
          avatarType: 'green',
        })
      })

      it('should throw error for invalid update', () => {
        const updates: UpdateGuestUserInput = {
          name: 'a'.repeat(51),
        }
        expect(() => updateGuestUser(validGuestUser, updates)).toThrow(ZodError)
      })
    })
  })

  describe('Business Rules Validation', () => {
    it('should pass for valid guest user', () => {
      const result = validateGuestUserBusinessRules(validGuestUser)
      expect(result).toBe(true)
    })

    it('should enforce sessionId length requirement', () => {
      const invalidGuestUser = { ...validGuestUser, sessionId: 'short123' }
      expect(() => validateGuestUserBusinessRules(invalidGuestUser)).toThrow(
        'Session ID must be at least 10 characters long'
      )
    })

    it('should enforce name length requirements', () => {
      const emptyNameUser = { ...validGuestUser, name: '' }
      const longNameUser = { ...validGuestUser, name: 'a'.repeat(51) }
      
      expect(() => validateGuestUserBusinessRules(emptyNameUser)).toThrow(
        'Guest user name must be between 1 and 50 characters'
      )
      expect(() => validateGuestUserBusinessRules(longNameUser)).toThrow(
        'Guest user name must be between 1 and 50 characters'
      )
    })
  })

  describe('Helper Functions', () => {
    it('should validate sessionId correctly', () => {
      expect(isValidSessionId('session_1234567890')).toBe(true)
      expect(isValidSessionId('short123')).toBe(false)
      expect(isValidSessionId('a'.repeat(256))).toBe(false)
      expect(isValidSessionId('1234567890')).toBe(true) // exactly 10 chars
    })

    it('should identify default guest names', () => {
      expect(isDefaultGuestName(validGuestUser)).toBe(true)
      expect(isDefaultGuestName(customGuestUser)).toBe(false)
    })
  })
})