const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface AuthResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
    role: string
  }
}

export const authApi = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }
    return response.json()
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }
    return response.json()
  },

  getCurrentUser: async (token: string) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to get current user')
    return response.json()
  },
}
