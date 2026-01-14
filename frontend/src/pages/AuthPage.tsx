import { useState, useEffect } from 'react'
import { Login } from '../components/Auth/Login'
import { Register } from '../components/Auth/Register'

interface AuthPageProps {
  onSuccess?: () => void
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col">
      {/* Header */}
      <header className="bg-blue-950 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold">🏀 BasketSim</h1>
          <p className="text-blue-200 mt-2">Basketball Simulation Game</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {mode === 'login' ? (
          <Login
            onSuccess={onSuccess}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <Register
            onSuccess={onSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-blue-200 py-4 text-center text-sm">
        <p>BasketSim - Modern Basketball Simulation Game</p>
      </footer>
    </div>
  )
}
