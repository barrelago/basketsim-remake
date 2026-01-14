import { create } from 'zustand'

export interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, error: null })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  setError: (error) => set({ error }),

  setLoading: (isLoading) => set({ isLoading }),

  loadFromStorage: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ token, user })
      } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },
}))
