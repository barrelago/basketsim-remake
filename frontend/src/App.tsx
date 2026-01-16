// src/App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Header } from './components/Header'
import { AuthPage } from './pages/AuthPage'
import { TeamPage } from './pages/TeamPage'
import { PlayersPage } from './pages/PlayersPage'
import AdminPage from './pages/AdminPage'
import MatchesPage from './pages/MatchesPage'
import { teamApi } from './api/teams'
import './App.css'



function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [standings, setStandings] = useState<Record<string, any[]>>({})
  const [standingsLoading, setStandingsLoading] = useState(false)
  const [standingsError, setStandingsError] = useState('')

  useEffect(() => {
    let active = true
    setStandingsLoading(true)
    setStandingsError('')

    teamApi
      .getAllTeams()
      .then((teams: any[]) => {
        if (!active) return
        const grouped = teams.reduce((acc: Record<string, any[]>, team) => {
          const key = team.country || 'Unknown'
          ;(acc[key] ||= []).push(team)
          return acc
        }, {})

        Object.keys(grouped).forEach((country) => {
          grouped[country].sort((a: any, b: any) => {
            if (b.wins !== a.wins) return b.wins - a.wins
            if (a.losses !== b.losses) return a.losses - b.losses
            return String(a.name).localeCompare(String(b.name))
          })
        })

        setStandings(grouped)
      })
      .catch(() => {
        if (!active) return
        setStandingsError('Failed to load standings.')
      })
      .finally(() => {
        if (!active) return
        setStandingsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Navigation moved to app-level layout so it appears on all authenticated routes */}
      <main className="container mx-auto py-12 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h2>
          <p className="text-blue-200">Manage your basketball team and compete in the league</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Manage Team</h3>
            <p className="text-gray-600 mb-4">Create and manage your basketball team.</p>
            <button
              onClick={() => navigate('/team')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Go to Team
            </button>
          </div>

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

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Play Matches</h3>
            <p className="text-gray-600 mb-4">Compete against other teams in the league.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              Schedule Match (Coming Soon)
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Manage Finances</h3>
            <p className="text-gray-600 mb-4">Monitor your budget and player contracts.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              View Budget (Coming Soon)
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">League Standings</h3>
            <p className="text-gray-600 mb-4">Check current rankings and statistics.</p>
            <button
              onClick={() => document.getElementById('league-standings')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              View League
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Your Profile</h3>
            <p className="text-gray-600 mb-4">Manage your profile and settings.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              View Profile (Coming Soon)
            </button>
          </div>
        </div>
        <section id="league-standings" className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">League Standings</h3>
            <span className="text-blue-200 text-sm">Grouped by country</span>
          </div>

          {standingsLoading ? (
            <div className="text-blue-100">Loading standings...</div>
          ) : standingsError ? (
            <div className="text-red-200">{standingsError}</div>
          ) : Object.keys(standings).length === 0 ? (
            <div className="text-blue-100">No leagues available yet.</div>
          ) : (
            <div className="grid gap-6">
              {Object.entries(standings).map(([country, teams]) => (
                <div key={country} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <div className="font-semibold text-blue-900">{country} League</div>
                    <div className="text-sm text-gray-600">{teams.length} teams</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-white text-gray-500">
                        <tr className="border-b">
                          <th className="text-left px-4 py-2">#</th>
                          <th className="text-left px-4 py-2">Team</th>
                          <th className="text-left px-4 py-2">Type</th>
                          <th className="text-left px-4 py-2">W</th>
                          <th className="text-left px-4 py-2">L</th>
                          <th className="text-left px-4 py-2">PCT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team: any, index: number) => {
                          const games = (team.wins ?? 0) + (team.losses ?? 0)
                          const pct = games > 0 ? (team.wins / games).toFixed(3) : '0.000'
                          const isBot = !team.userId
                          return (
                            <tr key={team.id} className="border-t">
                              <td className="px-4 py-2">{index + 1}</td>
                              <td className="px-4 py-2 font-medium text-blue-900">{team.name}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${isBot ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                                  {isBot ? 'Bot' : 'User'}
                                </span>
                              </td>
                              <td className="px-4 py-2">{team.wins ?? 0}</td>
                              <td className="px-4 py-2">{team.losses ?? 0}</td>
                              <td className="px-4 py-2">{pct}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
  const [authCheck, setAuthCheck] = useState(0)

  useEffect(() => {
    loadFromStorage()
    setMounted(true)
  }, [loadFromStorage, authCheck])

  const handleLoginSuccess = () => {
    loadFromStorage()
    setAuthCheck(prev => prev + 1)
  }

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
    <>
      {user && <Header />}

      <Routes>
      <Route path="/login" element={<AuthPage onSuccess={handleLoginSuccess} />} />
      <Route path="/" element={user ? <Dashboard /> : <AuthPage onSuccess={handleLoginSuccess} />} />
      <Route path="/team" element={user ? <TeamPage /> : <AuthPage onSuccess={handleLoginSuccess} />} />
      <Route path="/players" element={user ? <PlayersPage /> : <AuthPage onSuccess={handleLoginSuccess} />} />
      <Route path="/admin" element={user ? <AdminPage /> : <AuthPage onSuccess={handleLoginSuccess} />} />
      <Route path="/matches" element={user ? <MatchesPage /> : <AuthPage onSuccess={handleLoginSuccess} />} />
    </Routes>
    </>
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
