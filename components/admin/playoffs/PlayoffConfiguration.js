'use client'

export default function PlayoffConfiguration({ 
  numberOfGroups,
  setNumberOfGroups,
  eligiblePlayerCount,
  onUpdateConfig,
  onInitializePlayoffs
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Playoff Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Playoff Groups
          </label>
          <select
            value={numberOfGroups}
            onChange={(e) => setNumberOfGroups(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            disabled={eligiblePlayerCount < 16 && numberOfGroups === 2}
          >
            <option value={1}>1 Group (Group A only - Top 8)</option>
            <option value={2} disabled={eligiblePlayerCount < 16}>
              2 Groups (Group A: Top 8, Group B: 9-16) {eligiblePlayerCount < 16 && '(Need 16+ players)'}
            </option>
          </select>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={onUpdateConfig}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            disabled={eligiblePlayerCount < 8}
          >
            Save Configuration
          </button>
          
          <button
            onClick={() => onInitializePlayoffs(false)}
            className={`px-4 py-2 rounded text-white ${
              eligiblePlayerCount >= 8 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={eligiblePlayerCount < 8}
          >
            Initialize Playoffs {eligiblePlayerCount < 8 && `(Need ${8 - eligiblePlayerCount} more players)`}
          </button>
        </div>
      </div>
    </div>
  )
}

