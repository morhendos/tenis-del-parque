// Tab configuration for the league page
export const LEAGUE_TABS = {
  STANDINGS: 'standings',
  SCHEDULE: 'schedule',
  RESULTS: 'results',
  PLAYOFFS: 'playoffs'  // Added playoffs tab
}

// Function to generate tabs based on language
export const getLeagueTabs = (language) => [
  { 
    id: LEAGUE_TABS.STANDINGS, 
    label: language === 'es' ? 'Clasificación' : 'Standings', 
    icon: '📊' 
  },
  { 
    id: LEAGUE_TABS.SCHEDULE, 
    label: language === 'es' ? 'Calendario' : 'Schedule', 
    icon: '📅' 
  },
  { 
    id: LEAGUE_TABS.RESULTS, 
    label: language === 'es' ? 'Resultados' : 'Results', 
    icon: '🏆' 
  },
  { 
    id: LEAGUE_TABS.PLAYOFFS, 
    label: language === 'es' ? 'Playoffs' : 'Playoffs', 
    icon: '🏅' 
  }
]

// Default values
export const DEFAULT_TOTAL_ROUNDS = 8