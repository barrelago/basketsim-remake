import { useState } from 'react'
import { Player } from '../../api/players'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']
const JERSEY_NUMBERS = Array.from({ length: 99 }, (_, i) => i + 1)

interface DraftModalProps {
  player: Player
  onConfirm: (position: string, number: number) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DraftModal({ player, onConfirm, onCancel, isLoading }: DraftModalProps) {
  const [position, setPosition] = useState(player.position)
  const [number, setNumber] = useState(0)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!position || number === 0) {
      setError('Please select position and jersey number')
      return
    }
    try {
      await onConfirm(position, number)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft failed')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Draft Player</h2>
        <p className="text-gray-600 mb-6">
          {player.firstName} {player.lastName} - Overall {player.overall}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jersey Number</label>
            <select
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Select number...</option>
              {JERSEY_NUMBERS.map((num) => (
                <option key={num} value={num}>
                  #{num}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-900">
              Annual Salary: <span className="font-bold">${(player.salary / 1000).toFixed(0)}K</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
            >
              {isLoading ? 'Drafting...' : 'Confirm Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
