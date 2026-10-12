// Tab configuration for the league page
export const LEAGUE_TABS = {
  STANDINGS: 'standings',
  MATCHES: 'matches',
  COMMUNITY: 'community',
  PLAYOFFS: 'playoffs'
}

// Function to generate tabs based on language
export const getLeagueTabs = (language) => [
  { 
    id: LEAGUE_TABS.STANDINGS, 
    label: language === 'es' ? 'Clasificación' : 'Standings'
  },
  { 
    id: LEAGUE_TABS.MATCHES, 
    label: language === 'es' ? 'Partidos' : 'Matches'
  },
  {
    id: LEAGUE_TABS.COMMUNITY,
    label: language === 'es' ? 'Comunidad' : 'Community'
  },
  { 
    id: LEAGUE_TABS.PLAYOFFS, 
    label: language === 'es' ? 'Playoffs' : 'Playoffs'
  }
]

// Default values
export const DEFAULT_TOTAL_ROUNDS = 8
