import { useState, useEffect } from 'react'
import { teamApi } from '../api/teams'
import { useAuthStore } from '../stores/authStore'
import { COUNTRIES } from '../constants/countries'

export function TeamPage() {
  const token = useAuthStore((state) => state.token)
  const [myTeam, setMyTeam] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadTeam()
    } else {
      setPageLoading(false)
    }
  }, [token])

  const loadTeam = async () => {
    if (!token) return
    try {
      setPageLoading(true)
      const response = await teamApi.getMyTeam(token)
      if (response && response.id) {
        setMyTeam(response)
      } else {
        setMyTeam(null)
      }
    } catch (err) {
      setMyTeam(null)
    } finally {
      setPageLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!token || !name.trim() || !country.trim()) {
      setError('Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      setError('')
      const team = await teamApi.createTeam(name, country, token)
      if (team && team.id) {
        setMyTeam(team)
        setShowModal(false)
        setName('')
        setCountry('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating team')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <header className="bg-blue-950 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Your Team</h1>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        {myTeam ? (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-blue-900">{myTeam.name}</h2>
              <p className="text-gray-600">{myTeam.country}</p>
              <p className="text-2xl font-bold mt-4">Budget: ${(myTeam.budget / 1000).toFixed(0)}K</p>
              <p className="text-lg text-gray-700 mt-2">Record: {myTeam.wins}-{myTeam.losses}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-xl font-semibold text-blue-900">Team Roster</h3>
              </div>
              {Array.isArray(myTeam.roster) && myTeam.roster.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-6 py-3">#</th>
                        <th className="text-left px-6 py-3">Player</th>
                        <th className="text-left px-6 py-3">Pos</th>
                        <th className="text-left px-6 py-3">Age</th>
                        <th className="text-left px-6 py-3">Overall</th>
                        <th className="text-left px-6 py-3">Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTeam.roster.map((slot: any) => {
                        const player = slot.player
                        const name = player ? `${player.firstName} ${player.lastName}` : 'Unknown'
                        return (
                          <tr key={slot.id} className="border-t">
                            <td className="px-6 py-3">{slot.number}</td>
                            <td className="px-6 py-3 font-medium text-blue-900">{name}</td>
                            <td className="px-6 py-3">{slot.position}</td>
                            <td className="px-6 py-3">{player?.age ?? '-'}</td>
                            <td className="px-6 py-3">{player?.overall ?? '-'}</td>
                            <td className="px-6 py-3">
                              {player?.salary ? `$${Math.round(player.salary / 1000)}K` : '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-gray-600">No players on the roster yet.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">No Team Yet</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg"
            >
              Create Team
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">Create Team</h3>
              <input
                type="text"
                placeholder="Team Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
