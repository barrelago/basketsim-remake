import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import matchesApi from '../api/matches'

export function MatchesPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all'|'scheduled'|'played'>('all')
  const [typeFilter, setTypeFilter] = useState<'all'|'league'|'friendly'>('all')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    matchesApi.fetchAll(token, { page, pageSize, status: statusFilter, type: typeFilter })
      .then((res) => {
        setMatches(res.data ?? res)
        setTotal(res.total ?? 0)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token, page, pageSize, statusFilter, typeFilter])

  const onSimulate = async (id: number) => {
    try {
      await matchesApi.simulate(token, id)
      // refresh
      const data = await matchesApi.fetchAll(token)
      setMatches(data)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (!user) return <div className="p-8">Please log in to see matches.</div>

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Matches</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label>Page:</label>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded">Prev</button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded">Next</button>

        <label className="ml-4">Page size:</label>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="p-1 border rounded">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>

        <label className="ml-4">Status:</label>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1) }} className="p-1 border rounded">
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="played">Played</option>
        </select>

        <label className="ml-4">Type:</label>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1) }} className="p-1 border rounded">
          <option value="all">All</option>
          <option value="league">League</option>
          <option value="friendly">Friendly</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4">
        {matches.map((m: any) => (
          <div key={m.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{m.homeTeam?.name ?? m.homeTeamId} vs {m.awayTeam?.name ?? m.awayTeamId}</div>
              <div className="text-sm text-gray-600">{m.playedAt ? new Date(m.playedAt).toLocaleString() : 'TBD'} • {m.type}</div>
              <div className="text-sm">Status: {m.status} • Score: {m.homeScore} - {m.awayScore}</div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {user.role === 'admin' && m.status === 'scheduled' && (
                <button onClick={() => onSimulate(m.id)} className="bg-yellow-500 px-3 py-1 rounded">Simulate now</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatchesPage
