/**
 * ACHIEVEMENTS & TROPHY ROOM SERVICE
 * 
 * Calculates player achievements from league data:
 * - Trophies (Champion, Runner-up, Semi-finalist)
 * - Season placements
 * - Special badges (Founding Member, Iron Will, Rising Star, Giant Slayer)
 */

/**
 * Achievement type definitions
 */
export const ACHIEVEMENT_TYPES = {
  // Trophies
  CHAMPION: {
    id: 'champion',
    type: 'trophy',
    tier: 'gold',
    icon: 'trophy',
    names: {
      es: 'Campeón',
      en: 'Champion'
    },
    descriptions: {
      es: 'Ganador del torneo de playoffs',
      en: 'Playoff tournament winner'
    }
  },
  RUNNER_UP: {
    id: 'runner_up',
    type: 'trophy',
    tier: 'silver',
    icon: 'medal',
    names: {
      es: 'Subcampeón',
      en: 'Runner-up'
    },
    descriptions: {
      es: 'Finalista del torneo',
      en: 'Tournament finalist'
    }
  },
  SEMIFINALIST: {
    id: 'semifinalist',
    type: 'trophy',
    tier: 'bronze',
    icon: 'medal',
    names: {
      es: 'Semifinalista',
      en: 'Semi-finalist'
    },
    descriptions: {
      es: 'Llegó a las semifinales',
      en: 'Reached the semifinals'
    }
  },
  THIRD_PLACE: {
    id: 'third_place',
    type: 'trophy',
    tier: 'bronze',
    icon: 'medal',
    names: {
      es: '3er Puesto',
      en: '3rd Place'
    },
    descriptions: {
      es: 'Ganador del partido por el tercer puesto',
      en: 'Winner of the 3rd place match'
    }
  },
  FOURTH_PLACE: {
    id: 'fourth_place',
    type: 'badge',
    tier: 'standard',
    icon: 'award',
    names: {
      es: '4to Puesto',
      en: '4th Place'
    },
    descriptions: {
      es: 'Cuarto lugar en playoffs',
      en: 'Fourth place in playoffs'
    }
  },
  PLAYOFF_QUALIFIER: {
    id: 'playoff_qualifier',
    type: 'badge',
    tier: 'standard',
    icon: 'star',
    names: {
      es: 'Clasificado Playoffs',
      en: 'Playoff Qualifier'
    },
    descriptions: {
      es: 'Clasificó para los playoffs',
      en: 'Qualified for playoffs'
    }
  },
  
  // Special badges
  FOUNDING_MEMBER: {
    id: 'founding_member',
    type: 'badge',
    tier: 'special',
    icon: 'badge',
    names: {
      es: 'Miembro Fundador',
      en: 'Founding Member'
    },
    descriptions: {
      es: 'Participó en la temporada inaugural',
      en: 'Participated in the inaugural season'
    }
  },
  IRON_WILL: {
    id: 'iron_will',
    type: 'badge',
    tier: 'special',
    icon: 'shield',
    names: {
      es: 'Voluntad de Hierro',
      en: 'Iron Will'
    },
    descriptions: {
      es: 'Jugó todos los partidos programados',
      en: 'Played all scheduled matches'
    }
  },
  RISING_STAR: {
    id: 'rising_star',
    type: 'badge',
    tier: 'special',
    icon: 'trending-up',
    names: {
      es: 'Estrella Emergente',
      en: 'Rising Star'
    },
    descriptions: {
      es: 'Mayor ganancia de ELO en la temporada',
      en: 'Highest ELO gain in the season'
    }
  },
  GIANT_SLAYER: {
    id: 'giant_slayer',
    type: 'badge',
    tier: 'special',
    icon: 'zap',
    names: {
      es: 'Cazagigantes',
      en: 'Giant Slayer'
    },
    descriptions: {
      es: 'Venció a un rival con ELO superior',
      en: 'Defeated a higher-ranked opponent'
    }
  }
}

/**
 * Get playoff trophy achievements for a player in a league
 */
export function getPlayoffTrophies(league, playerId) {
  const achievements = []
  const playerIdStr = playerId.toString()
  
  if (!league?.playoffConfig?.bracket?.groupA) {
    return achievements
  }
  
  const bracket = league.playoffConfig.bracket.groupA
  
  // Check if Champion
  const finalWinner = bracket.final?.winner?._id?.toString() || bracket.final?.winner?.toString()
  if (finalWinner === playerIdStr) {
    achievements.push({
      ...ACHIEVEMENT_TYPES.CHAMPION,
      leagueId: league._id,
      leagueName: league.name,
      seasonYear: league.season?.year,
      seasonType: league.season?.type,
      earnedAt: bracket.final?.completedAt || league.updatedAt
    })
  }
  
  // Check if Runner-up (lost in final)
  if (bracket.final?.matchId && finalWinner && finalWinner !== playerIdStr) {
    const sfWinners = bracket.semifinals?.map(sf => 
      sf.winner?._id?.toString() || sf.winner?.toString()
    ).filter(Boolean) || []
    if (sfWinners.includes(playerIdStr)) {
      achievements.push({
        ...ACHIEVEMENT_TYPES.RUNNER_UP,
        leagueId: league._id,
        leagueName: league.name,
        seasonYear: league.season?.year,
        seasonType: league.season?.type,
        earnedAt: bracket.final?.completedAt || league.updatedAt
      })
    }
  }
  
  // Check if 3rd Place (won the 3rd place match)
  const thirdPlaceWinner = bracket.thirdPlace?.winner?._id?.toString() || bracket.thirdPlace?.winner?.toString()
  if (thirdPlaceWinner === playerIdStr) {
    achievements.push({
      ...ACHIEVEMENT_TYPES.THIRD_PLACE,
      leagueId: league._id,
      leagueName: league.name,
      seasonYear: league.season?.year,
      seasonType: league.season?.type,
      earnedAt: bracket.thirdPlace?.completedAt || league.updatedAt
    })
  }
  
  // Check if 4th Place (lost the 3rd place match) - only if 3rd place match was played
  if (thirdPlaceWinner && thirdPlaceWinner !== playerIdStr) {
    // Check if player was in the 3rd place match (lost a semifinal)
    const sfWinners = bracket.semifinals?.map(sf => 
      sf.winner?._id?.toString() || sf.winner?.toString()
    ).filter(Boolean) || []
    const qfWinners = bracket.quarterfinals?.map(qf => 
      qf.winner?._id?.toString() || qf.winner?.toString()
    ).filter(Boolean) || []
    
    // Player reached semis (won QF) but didn't win semis = was in 3rd place match
    if (qfWinners.includes(playerIdStr) && !sfWinners.includes(playerIdStr)) {
      achievements.push({
        ...ACHIEVEMENT_TYPES.FOURTH_PLACE,
        leagueId: league._id,
        leagueName: league.name,
        seasonYear: league.season?.year,
        seasonType: league.season?.type,
        earnedAt: bracket.thirdPlace?.completedAt || league.updatedAt
      })
    }
  }
  
  // Check if Semi-finalist (lost in semifinals, but NO 3rd place match played yet)
  // This is a fallback for when playoffs are still ongoing
  if (!thirdPlaceWinner && bracket.semifinals && bracket.quarterfinals) {
    const sfWinners = bracket.semifinals.map(sf => 
      sf.winner?._id?.toString() || sf.winner?.toString()
    ).filter(Boolean)
    const qfWinners = bracket.quarterfinals.map(qf => 
      qf.winner?._id?.toString() || qf.winner?.toString()
    ).filter(Boolean)
    
    if (qfWinners.includes(playerIdStr) && !sfWinners.includes(playerIdStr)) {
      achievements.push({
        ...ACHIEVEMENT_TYPES.SEMIFINALIST,
        leagueId: league._id,
        leagueName: league.name,
        seasonYear: league.season?.year,
        seasonType: league.season?.type,
        earnedAt: league.updatedAt
      })
    }
  }
  
  // Check if Playoff Qualifier (but no other trophy)
  if (achievements.length === 0) {
    const qualifiedPlayers = league.playoffConfig.qualifiedPlayers?.groupA || []
    const isQualified = qualifiedPlayers.some(qp => 
      (qp.player?.toString() || qp.player?._id?.toString()) === playerIdStr
    )
    
    if (isQualified) {
      achievements.push({
        ...ACHIEVEMENT_TYPES.PLAYOFF_QUALIFIER,
        leagueId: league._id,
        leagueName: league.name,
        seasonYear: league.season?.year,
        seasonType: league.season?.type,
        earnedAt: league.playoffConfig?.playoffStartDate || league.updatedAt
      })
    }
  }
  
  return achievements
}

/**
 * Get season placement for a player
 */
export function getSeasonPlacement(league, playerId, standings = null) {
  const playerIdStr = playerId.toString()
  
  const qualifiedPlayers = [
    ...(league.playoffConfig?.qualifiedPlayers?.groupA || []),
    ...(league.playoffConfig?.qualifiedPlayers?.groupB || [])
  ]
  
  const qualifiedEntry = qualifiedPlayers.find(qp => 
    (qp.player?.toString() || qp.player?._id?.toString()) === playerIdStr
  )
  
  if (qualifiedEntry && qualifiedEntry.regularSeasonPosition) {
    return {
      position: qualifiedEntry.regularSeasonPosition,
      seed: qualifiedEntry.seed,
      leagueId: league._id,
      leagueName: league.name,
      seasonYear: league.season?.year,
      seasonType: league.season?.type,
      totalPlayers: league.stats?.registeredPlayers || qualifiedPlayers.length
    }
  }
  
  if (standings) {
    const standing = standings.find(s => 
      (s.player?._id?.toString() || s.player?.toString()) === playerIdStr
    )
    if (standing) {
      return {
        position: standing.position,
        leagueId: league._id,
        leagueName: league.name,
        seasonYear: league.season?.year,
        seasonType: league.season?.type,
        totalPlayers: standings.length
      }
    }
  }
  
  return null
}

/**
 * Check if player is a founding member
 */
export function getFoundingMemberBadge(league, player) {
  const isInaugural = league.season?.year === 2025 && 
                      (league.season?.type === 'summer' || league.season?.type === 'annual')
  const isFirstSeason = !league.parentLeague
  
  if (isInaugural || isFirstSeason) {
    const registration = player.registrations?.find(reg => 
      reg.league?.toString() === league._id.toString()
    )
    
    if (registration && ['confirmed', 'active'].includes(registration.status)) {
      return {
        ...ACHIEVEMENT_TYPES.FOUNDING_MEMBER,
        leagueId: league._id,
        leagueName: league.name,
        seasonYear: league.season?.year,
        seasonType: league.season?.type,
        cityName: league.location?.city,
        earnedAt: registration.registeredAt
      }
    }
  }
  
  return null
}

/**
 * Check if player has Iron Will (played all scheduled matches)
 */
export function getIronWillBadge(registration, league) {
  if (!registration?.stats) return null
  
  const totalRounds = league.config?.roundsPerSeason || 8
  const matchesPlayed = registration.stats.matchesPlayed || 0
  
  if (matchesPlayed >= totalRounds) {
    return {
      ...ACHIEVEMENT_TYPES.IRON_WILL,
      leagueId: league._id,
      leagueName: league.name,
      seasonYear: league.season?.year,
      seasonType: league.season?.type,
      matchesPlayed
    }
  }
  
  return null
}

/**
 * Check if player beat a higher-ranked opponent (Giant Slayer)
 */
export function getGiantSlayerBadge(matchHistory, league) {
  if (!matchHistory || matchHistory.length === 0) return null
  
  const upsets = matchHistory.filter(match => 
    match.result === 'won' && match.eloChange > 15
  )
  
  if (upsets.length > 0) {
    return {
      ...ACHIEVEMENT_TYPES.GIANT_SLAYER,
      leagueId: league._id,
      leagueName: league.name,
      seasonYear: league.season?.year,
      seasonType: league.season?.type,
      upsetCount: upsets.length,
      biggestUpset: Math.max(...upsets.map(u => u.eloChange))
    }
  }
  
  return null
}

/**
 * Calculate all achievements for a player
 */
export function calculatePlayerAchievements(player, leagues, options = {}) {
  const achievements = {
    trophies: [],
    seasonPlacements: [],
    badges: [],
    summary: {
      totalTrophies: 0,
      goldTrophies: 0,
      silverTrophies: 0,
      bronzeTrophies: 0,
      totalBadges: 0,
      seasonsPlayed: 0
    }
  }
  
  const playerId = player._id.toString()
  
  for (const league of leagues) {
    // Get playoff trophies
    const trophies = getPlayoffTrophies(league, playerId)
    achievements.trophies.push(...trophies)
    
    // Get season placement
    const placement = getSeasonPlacement(league, playerId, options.standings?.[league._id])
    if (placement) {
      achievements.seasonPlacements.push(placement)
    }
    
    // Get registration for this league
    const registration = player.registrations?.find(reg => 
      reg.league?.toString() === league._id.toString()
    )
    
    // Check for special badges
    const foundingMember = getFoundingMemberBadge(league, player)
    if (foundingMember) {
      const exists = achievements.badges.find(b => 
        b.id === 'founding_member' && 
        b.leagueId?.toString() === league._id.toString()
      )
      if (!exists) {
        achievements.badges.push(foundingMember)
      }
    }
    
    const ironWill = getIronWillBadge(registration, league)
    if (ironWill) {
      achievements.badges.push(ironWill)
    }
    
    const giantSlayer = getGiantSlayerBadge(registration?.matchHistory, league)
    if (giantSlayer) {
      achievements.badges.push(giantSlayer)
    }
  }
  
  // Calculate summary
  achievements.summary.totalTrophies = achievements.trophies.length
  achievements.summary.goldTrophies = achievements.trophies.filter(t => t.tier === 'gold').length
  achievements.summary.silverTrophies = achievements.trophies.filter(t => t.tier === 'silver').length
  achievements.summary.bronzeTrophies = achievements.trophies.filter(t => t.tier === 'bronze').length
  achievements.summary.totalBadges = achievements.badges.length
  achievements.summary.seasonsPlayed = achievements.seasonPlacements.length
  
  // Sort trophies by tier (gold first)
  achievements.trophies.sort((a, b) => {
    const tierOrder = { gold: 0, silver: 1, bronze: 2, standard: 3 }
    if (tierOrder[a.tier] !== tierOrder[b.tier]) {
      return tierOrder[a.tier] - tierOrder[b.tier]
    }
    return new Date(b.earnedAt) - new Date(a.earnedAt)
  })
  
  // Sort season placements by year (most recent first)
  achievements.seasonPlacements.sort((a, b) => {
    if (a.seasonYear !== b.seasonYear) return b.seasonYear - a.seasonYear
    return 0
  })
  
  return achievements
}

/**
 * Format season name for display
 */
export function formatSeasonName(year, type, language = 'es') {
  const seasonNames = {
    es: {
      spring: 'Primavera',
      summer: 'Verano',
      autumn: 'Otoño',
      winter: 'Invierno',
      annual: 'Temporada'
    },
    en: {
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn',
      winter: 'Winter',
      annual: 'Season'
    }
  }
  
  const seasonName = seasonNames[language]?.[type] || type
  return `${seasonName} ${year}`
}

/**
 * Get position suffix (1st, 2nd, 3rd, etc.)
 */
export function getPositionSuffix(position, language = 'es') {
  if (language === 'es') {
    return `${position}º`
  }
  
  if (position % 100 >= 11 && position % 100 <= 13) {
    return `${position}th`
  }
  
  switch (position % 10) {
    case 1: return `${position}st`
    case 2: return `${position}nd`
    case 3: return `${position}rd`
    default: return `${position}th`
  }
}
