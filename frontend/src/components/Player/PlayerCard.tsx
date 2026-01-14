import { Player } from '../../api/players'

interface PlayerCardProps {
  player: Player
  onSelect?: (player: Player) => void
  onDraft?: (player: Player) => void
  showDraftButton?: boolean
}

export function PlayerCard({ player, onSelect, onDraft, showDraftButton = false }: PlayerCardProps) {
  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'PG': 'bg-blue-100 text-blue-800',
      'SG': 'bg-green-100 text-green-800',
      'SF': 'bg-yellow-100 text-yellow-800',
      'PF': 'bg-orange-100 text-orange-800',
      'C': 'bg-red-100 text-red-800',
    }
    return colors[position] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div
      onClick={() => onSelect?.(player)}
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-blue-900">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-gray-600 text-sm">Age {player.age}</p>
        </div>
        <div className="text-right">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPositionColor(player.position)}`}>
            {player.position}
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{player.overall}</p>
          <p className="text-xs text-gray-500">Overall</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Height</p>
          <p className="font-semibold">{player.height}</p>
        </div>
        <div>
          <p className="text-gray-600">Weight</p>
          <p className="font-semibold">{player.weight} lbs</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded">
          <p className="text-xs text-gray-600">Speed</p>
          <p className="font-bold text-blue-600">{player.speed}</p>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <p className="text-xs text-gray-600">Shooting</p>
          <p className="font-bold text-green-600">{player.shooting}</p>
        </div>
        <div className="bg-orange-50 p-2 rounded">
          <p className="text-xs text-gray-600">Defense</p>
          <p className="font-bold text-orange-600">{player.defense}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-600">Annual Salary</p>
          <p className="font-bold text-lg">${(player.salary / 1000).toFixed(0)}K</p>
        </div>
        {showDraftButton && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDraft?.(player)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Draft
          </button>
        )}
      </div>
    </div>
  )
}
