import { create } from 'zustand'
import {
  AppUser,
  AuthState,
  AuthStatus,
  GuestLoginInput,
} from '../../domain/types'
import { AuthUser } from '../../domain/models/auth-user'

interface AuthStore extends AuthState {
  setUser: (user: AppUser | null) => void
  setStatus: (status: AuthStatus) => void
  setGuestUser: (input: GuestLoginInput) => void
  clearUser: () => void
  initializeAuth: () => void
}

const initialState: AuthState = {
  status: 'unauthenticated',
  user: null,
  isGuest: false,
  isGoogle: false,
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setUser: (user: AppUser | null) => {
    if (user) {
      set({
        user,
        status: user.provider === 'guest' ? 'guest' : 'authenticated',
        isGuest: user.provider === 'guest',
        isGoogle: user.provider === 'google',
      })
    } else {
      set({
        user: null,
        status: 'unauthenticated',
        isGuest: false,
        isGoogle: false,
      })
    }
  },

  setStatus: (status: AuthStatus) => {
    set({ status })
  },

  setGuestUser: (input: GuestLoginInput) => {
    const guestUser = AuthUser.createGuest(input)
    get().setUser(guestUser)
  },

  clearUser: () => {
    set({
      user: null,
      status: 'unauthenticated',
      isGuest: false,
      isGoogle: false,
    })
  },

  initializeAuth: () => {
    set({ status: 'unauthenticated' })
  },
}))
