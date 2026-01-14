const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const teamApi = {
  createTeam: (name: string, country: string, token: string) => {
    return fetch(`${API_URL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, country }),
    }).then(r => r.json())
  },

  getMyTeam: (token: string) => {
    return fetch(`${API_URL}/api/teams/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
  },

  updateTeam: (name: string, country: string, token: string) => {
    return fetch(`${API_URL}/api/teams/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, country }),
    }).then(r => r.json())
  },

  deleteTeam: (token: string) => {
    return fetch(`${API_URL}/api/teams/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
  },

  getAllTeams: () => {
    return fetch(`${API_URL}/api/teams`).then(r => r.json())
  },
}
