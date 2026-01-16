import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { matchesApi } from '../api/matches'
import { teamApi } from '../api/teams'

export function AdminPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const [startDate, setStartDate] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [countries, setCountries] = useState<string[]>([])
  const [includeFriendlies, setIncludeFriendlies] = useState(false)
  const [matches, setMatches] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return <div className="p-8">Not authenticated</div>

  useEffect(() => {
    let active = true
    teamApi
      .getAllTeams()
      .then((teams: any[]) => {
        if (!active) return
        const list = Array.from(new Set(teams.map((t) => t.country).filter(Boolean)))
        list.sort((a, b) => String(a).localeCompare(String(b)))
        setCountries(list)
      })
      .catch(() => {
        if (!active) return
        setCountries([])
      })
    return () => {
      active = false
    }
  }, [])

  const doSchedule = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const normalizedStartDate = startDate ? `${startDate}T00:00:00.000Z` : undefined
      const res = await matchesApi.schedule(token, normalizedStartDate, includeFriendlies)
      const createdCount = Array.isArray(res) ? res.length : res?.created ?? 0
      setMessage(`Scheduled ${createdCount} matches.`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const doReschedule = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const normalizedStartDate = startDate ? `${startDate}T00:00:00.000Z` : undefined
      const res = await matchesApi.reschedule(token, normalizedStartDate, includeFriendlies)
      const createdCount = res?.created ?? (Array.isArray(res) ? res.length : 0)
      setMessage(`Rescheduled ${createdCount} matches.`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const doShowMatches = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const normalizedStartDate = startDate ? `${startDate}T00:00:00.000Z` : undefined
      const res = await matchesApi.fetchAll(token, {
        page: 1,
        pageSize: 100,
        startDate: normalizedStartDate,
        country: countryFilter !== 'all' ? countryFilter : undefined,
      })
      const data = Array.isArray(res?.data) ? res.data : []
      setMatches(data)
      setMessage(`Showing ${data.length} matches.`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Admin — Match Scheduler</h2>

      <div className="mb-4">
        <label className="block mb-1">Start date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-4">
        <label className="block mb-1">League (country)</label>
        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full p-2 border rounded">
          <option value="all">All leagues</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeFriendlies} onChange={(e) => setIncludeFriendlies(e.target.checked)} />
          <span>Include friendlies between countries</span>
        </label>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={doSchedule} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">Schedule (no delete)</button>
        <button onClick={doReschedule} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded">Reschedule (delete & create)</button>
        <button onClick={doShowMatches} disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded">Show matches</button>
      </div>

      {message ? <div className="mb-4 text-green-700">{message}</div> : null}
      {error ? <div className="mb-4 text-red-600">{error}</div> : null}

      <div className="bg-white rounded-lg shadow border">
        <div className="px-4 py-3 border-b font-semibold">Matches</div>
        {matches.length === 0 ? (
          <div className="p-4 text-gray-600">No matches to display.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Home</th>
                  <th className="text-left px-4 py-2">Away</th>
                  <th className="text-left px-4 py-2">Type</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m: any) => {
                  const dateSource = m.playedAt || m.createdAt
                  const dateLabel = dateSource ? new Date(dateSource).toLocaleDateString() : '-'
                  const homeName = m.homeTeam?.name || `#${m.homeTeamId}`
                  const awayName = m.awayTeam?.name || `#${m.awayTeamId}`
                  const scoreLabel = m.status === 'played' ? `${m.homeScore}-${m.awayScore}` : '—'
                  return (
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-2">{dateLabel}</td>
                      <td className="px-4 py-2 font-medium">{homeName}</td>
                      <td className="px-4 py-2 font-medium">{awayName}</td>
                      <td className="px-4 py-2 capitalize">{m.type}</td>
                      <td className="px-4 py-2 capitalize">{m.status}</td>
                      <td className="px-4 py-2">{scoreLabel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
