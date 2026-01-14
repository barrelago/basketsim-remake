import { useState, useEffect } from 'react'
import { playerApi, Player } from '../api/players'
import { useAuthStore } from '../stores/authStore'
import { usePlayerStore } from '../stores/playerStore'
import { PlayerCard } from '../components/Player/PlayerCard'
import { DraftModal } from '../components/Player/DraftModal'

export function PlayersPage() {
  const token = useAuthStore((state) => state.token)
  const availablePlayers = usePlayerStore((state) => state.availablePlayers)
  const roster = usePlayerStore((state) => state.roster)
  const setAvailablePlayers = usePlayerStore((state) => state.setAvailablePlayers)
  const addToRoster = usePlayerStore((state) => state.addToRoster)
  const setLoading = usePlayerStore((state) => state.setLoading)
  const setError = usePlayerStore((state) => state.setError)

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [draftingPlayer, setDraftingPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPosition, setFilterPosition] = useState('')

  const positions = ['PG', 'SG', 'SF', 'PF', 'C']

  useEffect(() => {
    if (!token) return
    fetchPlayers()
  }, [token])

  const fetchPlayers = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const players = await playerApi.getAvailable(token)
      setAvailablePlayers(players)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDraftConfirm = async (position: string, number: number) => {
    if (!token || !draftingPlayer) return
    try {
      setLoading(true)
      const rosterEntry = await playerApi.draftPlayer(draftingPlayer.id, position, number, token)
      addToRoster(rosterEntry)
      setDraftingPlayer(null)
      setSelectedPlayer(null)
      // Refresh available players
      fetchPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft failed')
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = availablePlayers.filter((player) => {
    const matchesSearch = 
      player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = !filterPosition || player.position === filterPosition
    return matchesSearch && matchesPosition
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Header */}
      <header className="bg-blue-950 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Players</h1>
          <p className="text-blue-200 mt-2">Available: {filteredPlayers.length} | Drafted: {roster.length}</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto py-12 px-4">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Player</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={fetchPlayers}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Player Grid */}
        {isLoading ? (
          <div className="text-center text-white">Loading players...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onSelect={setSelectedPlayer}
                onDraft={setDraftingPlayer}
                showDraftButton={true}
              />
            ))}
          </div>
        )}

        {filteredPlayers.length === 0 && !isLoading && (
          <div className="text-center text-white">
            <p className="text-xl">No players found</p>
          </div>
        )}
      </main>

      {/* Draft Modal */}
      {draftingPlayer && (
        <DraftModal
          player={draftingPlayer}
          onConfirm={handleDraftConfirm}
          onCancel={() => setDraftingPlayer(null)}
        />
      )}

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  {selectedPlayer.firstName} {selectedPlayer.lastName}
                </h2>
                <p className="text-gray-600">Age {selectedPlayer.age}</p>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2">
                <p className="text-gray-600">Position</p>
                <p className="font-semibold">{selectedPlayer.position}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="text-gray-600">Height</p>
                <p className="font-semibold">{selectedPlayer.height}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="text-gray-600">Weight</p>
                <p className="font-semibold">{selectedPlayer.weight} lbs</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="text-gray-600">Overall</p>
                <p className="font-bold text-lg text-blue-600">{selectedPlayer.overall}</p>
              </div>
              <div className="grid grid-cols-2">
                <p className="text-gray-600">Salary</p>
                <p className="font-semibold">${(selectedPlayer.salary / 1000).toFixed(0)}K/yr</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setDraftingPlayer(selectedPlayer)
                  setSelectedPlayer(null)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Draft This Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
