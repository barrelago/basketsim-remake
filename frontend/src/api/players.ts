const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Player {
  id: number
  firstName: string
  lastName: string
  age: number
  position: string
  height: string
  weight: number
  speed: number
  strength: number
  shooting: number
  defense: number
  stamina: number
  salary: number
  overall: number
  status: string
}

export interface TeamRoster {
  id: number
  playerId: number
  position: string
  number: number
  player: Player
}

export const playerApi = {
  getAvailable: async (token: string): Promise<Player[]> => {
    const response = await fetch(`${API_URL}/api/players`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch players')
    return response.json()
  },

  getPlayer: async (id: number, token: string): Promise<Player> => {
    const response = await fetch(`${API_URL}/api/players/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch player')
    return response.json()
  },

  search: async (query: string, position?: string, token?: string): Promise<Player[]> => {
    const params = new URLSearchParams({ q: query })
    if (position) params.append('position', position)

    const response = await fetch(`${API_URL}/api/players/search?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error('Search failed')
    return response.json()
  },

  draftPlayer: async (
    playerId: number,
    position: string,
    number: number,
    token: string
  ): Promise<TeamRoster> => {
    const response = await fetch(`${API_URL}/api/players/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ playerId, position, number }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Draft failed')
    }
    return response.json()
  },

  releasePlayer: async (playerId: number, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/api/players/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ playerId }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Release failed')
    }
    return response.json()
  },

  getRoster: async (token: string): Promise<TeamRoster[]> => {
    const response = await fetch(`${API_URL}/api/players/me/roster`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch roster')
    return response.json()
  },
}