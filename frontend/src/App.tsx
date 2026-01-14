// src/App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AuthPage } from './pages/AuthPage'
import { PlayersPage } from './pages/PlayersPage'
import './App.css'

function Navigation() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <header className="bg-blue-950 text-white py-4 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <h1 className="text-3xl font-bold">🏀 BasketSim</h1>
        </div>
        
        {user && (
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-blue-200 hover:text-white transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/players')}
              className="text-blue-200 hover:text-white transition"
            >
              Players
            </button>
            
            <div className="flex items-center gap-4 border-l border-blue-700 pl-8">
              <div className="text-right text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-blue-300">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <Navigation />

      <main className="container mx-auto py-12 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h2>
          <p className="text-blue-200">Manage your basketball team and compete in the league</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Browse Players Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Browse Players</h3>
            <p className="text-gray-600 mb-4">Scout and draft talented players for your team.</p>
            <button
              onClick={() => navigate('/players')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Go to Players
            </button>
          </div>

          {/* Create Team Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Create Team</h3>
            <p className="text-gray-600 mb-4">Set up your basketball team with a unique name.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              Create Team (Coming Soon)
            </button>
          </div>

          {/* Manage Finances Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Manage Finances</h3>
            <p className="text-gray-600 mb-4">Monitor your budget and player contracts.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              View Budget (Coming Soon)
            </button>
          </div>

          {/* Play Matches Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Play Matches</h3>
            <p className="text-gray-600 mb-4">Compete against other teams in the league.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              Schedule Match (Coming Soon)
            </button>
          </div>

          {/* League Standings Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">League Standings</h3>
            <p className="text-gray-600 mb-4">Check current rankings and statistics.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              View League (Coming Soon)
            </button>
          </div>

          {/* Your Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Your Profile</h3>
            <p className="text-gray-600 mb-4">Manage your profile and settings.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              View Profile (Coming Soon)
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-blue-950 text-blue-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>BasketSim - Modern Basketball Simulation Game</p>
        </div>
      </footer>
    </div>
  )
}

function AppContent() {
  const user = useAuthStore((state) => state.user)
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadFromStorage()
    setMounted(true)
  }, [loadFromStorage])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏀</div>
          <p className="text-white text-2xl font-bold">BasketSim</p>
          <p className="text-blue-200 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthPage onSuccess={() => {}} />} />
      <Route path="/" element={user ? <Dashboard /> : <AuthPage onSuccess={() => {}} />} />
      <Route path="/players" element={user ? <PlayersPage /> : <AuthPage onSuccess={() => {}} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App