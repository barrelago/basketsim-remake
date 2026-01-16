const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const matchesApi = {
  fetchAll: async (
    token: string | null,
    opts?: { page?: number; pageSize?: number; status?: string; type?: string; startDate?: string; country?: string }
  ) => {
    const params = new URLSearchParams()
    if (opts?.page) params.set('page', String(opts.page))
    if (opts?.pageSize) params.set('pageSize', String(opts.pageSize))
    if (opts?.status) params.set('status', opts.status)
    if (opts?.type) params.set('type', opts.type)
    if (opts?.startDate) params.set('startDate', opts.startDate)
    if (opts?.country) params.set('country', opts.country)

    const url = `${API_URL}/api/matches${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!response.ok) throw new Error('Failed to fetch matches')
    return response.json()
  },

  simulate: async (token: string | null, matchId: number) => {
    const response = await fetch(`${API_URL}/api/matches/${matchId}/simulate`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to simulate match')
    }
    return response.json()
  },

  schedule: async (token: string | null, startDate?: string, includeFriendlies?: boolean) => {
    const response = await fetch(`${API_URL}/api/matches/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ startDate, includeFriendlies }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to schedule matches')
    }
    return response.json()
  },

  reschedule: async (token: string | null, startDate?: string, includeFriendlies?: boolean) => {
    const response = await fetch(`${API_URL}/api/matches/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ startDate, includeFriendlies }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to reschedule matches')
    }
    return response.json()
  },
}

export default matchesApi
