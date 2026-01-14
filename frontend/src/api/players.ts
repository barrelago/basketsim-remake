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

const getAvailable = (token: string) => {
  const url = `${API_URL}/api/players`
  const opts = { headers: { Authorization: `Bearer ${token}` } }
  return fetch(url, opts).then(r => r.json())
}

const getRoster = (token: string) => {
  const url = `${API_URL}/api/players/me/roster`
  const opts = { headers: { Authorization: `Bearer ${token}` } }
  return fetch(url, opts).then(r => r.json())
}

const draftPlayer = (playerId: number, position: string, number: number, token: string) => {
  const url = `${API_URL}/api/players/draft`
  const opts = { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
    body: JSON.stringify({ playerId, position, number }) 
  }
  return fetch(url, opts).then(r => r.json())
}

const releasePlayer = (playerId: number, token: string) => {
  const url = `${API_URL}/api/players/release`
  const opts = { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
    body: JSON.stringify({ playerId }) 
  }
  return fetch(url, opts).then(r => r.json())
}

export const playerApi = {
  getAvailable,
  getRoster,
  draftPlayer,
  releasePlayer,
}
