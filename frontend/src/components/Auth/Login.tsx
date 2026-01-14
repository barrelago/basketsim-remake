import { useState } from 'react'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'

interface LoginProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const result = await authApi.login(email, password)
    setAuth(result.user, result.token)
    // Force a small delay then reload to ensure state is saved
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Sign In</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
