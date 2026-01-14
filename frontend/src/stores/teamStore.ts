import { create } from 'zustand'
import type { Team } from '../api/teams'

interface TeamState {
  myTeam: Team | null
  allTeams: Team[]
  isLoading: boolean
  error: string | null

  setMyTeam: (team: Team | null) => void
  setAllTeams: (teams: Team[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTeamStore = create<TeamState>((set) => ({
  myTeam: null,
  allTeams: [],
  isLoading: false,
  error: null,

  setMyTeam: (team) => set({ myTeam: team }),
  setAllTeams: (teams) => set({ allTeams: teams }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
