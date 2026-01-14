interface TeamInfoProps {
  team: any
}

export function TeamInfo({ team }: TeamInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-blue-900">{team.name}</h2>
          <p className="text-gray-600 mt-1">{team.country}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Record</p>
          <p className="text-2xl font-bold text-blue-600">{team.wins}-{team.losses}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-l-4 border-blue-600 pl-4">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Budget</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">${(team.budget / 1000).toFixed(0)}K</p>
        </div>
        <div className="border-l-4 border-green-600 pl-4">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Wins</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{team.wins}</p>
        </div>
        <div className="border-l-4 border-red-600 pl-4">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">Losses</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{team.losses}</p>
        </div>
      </div>
    </div>
  )
}