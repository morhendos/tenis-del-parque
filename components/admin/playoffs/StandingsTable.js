'use client'

export default function StandingsTable({ 
  standings, 
  playoffsInitialized, 
  numberOfGroups 
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {playoffsInitialized ? 'Qualification Position' : 'Position'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Player
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Points {playoffsInitialized && '(at qualification)'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Matches
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {playoffsInitialized ? 'Playoff Seed' : 'Playoff Group'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((standing, index) => (
            <tr key={standing.player._id} className={index === 7 ? 'border-b-2 border-purple-500' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {standing.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {standing.player.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {standing.stats.totalPoints}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {standing.stats.matchesPlayed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {playoffsInitialized ? (
                  standing.seed && (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      standing.group === 'A' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {standing.group === 'A' ? 'Group A' : 'Group B'} - Seed {standing.seed}
                    </span>
                  )
                ) : (
                  <>
                    {index < 8 && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Group A
                      </span>
                    )}
                    {index >= 8 && index < 16 && numberOfGroups === 2 && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Group B
                      </span>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

