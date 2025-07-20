// Add import for ScoringSystem component at the top
import ScoringSystem from '@/components/league/ScoringSystem'

// Find the standings section (around line 460) and update it like this:
// This is the updated activeTab === 'standings' section

{activeTab === 'standings' && (
  <div className="max-w-[1400px] mx-auto">
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-parque-purple mb-4 md:mb-6">
        {language === 'es' ? 'Clasificación General' : 'League Standings'}
      </h2>
      
      {standings && standings.unifiedStandings ? (
        <div>
          <StandingsTable 
            players={standings.unifiedStandings} 
            language={language}
            unified={true}
          />
          
          {/* Add the Scoring System component here */}
          <ScoringSystem 
            language={language}
            totalPlayers={standings.totalPlayers}
            currentRound={standings.currentRound}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🏆</span>
          <p>
            {language === 'es' 
              ? 'La clasificación se mostrará una vez que comiencen los partidos.'
              : 'Standings will be displayed once matches begin.'}
          </p>
        </div>
      )}
    </div>
  </div>
)}