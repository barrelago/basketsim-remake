import { create } from 'zustand'
import type { Player, TeamRoster } from '../api/players'

interface PlayerState {
  availablePlayers: Player[]
  roster: TeamRoster[]
  selectedPlayer: Player | null
  isLoading: boolean
  error: string | null
  
  setAvailablePlayers: (players: Player[]) => void
  setRoster: (roster: TeamRoster[]) => void
  setSelectedPlayer: (player: Player | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  removeFromRoster: (playerId: number) => void
  addToRoster: (roster: TeamRoster) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  availablePlayers: [],
  roster: [],
  selectedPlayer: null,
  isLoading: false,
  error: null,

  setAvailablePlayers: (players) => set({ availablePlayers: players }),
  setRoster: (roster) => set({ roster }),
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  removeFromRoster: (playerId) =>
    set((state) => ({
      roster: state.roster.filter((r) => r.playerId !== playerId),
      availablePlayers: [...state.availablePlayers, ...state.roster.filter((r) => r.playerId === playerId).map((r) => r.player)],
    })),

  addToRoster: (newRoster) =>
    set((state) => ({
      roster: [...state.roster, newRoster],
      availablePlayers: state.availablePlayers.filter((p) => p.id !== newRoster.playerId),
    })),
}))
