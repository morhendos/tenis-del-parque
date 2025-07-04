export const mockData = {
  standings: [
    { position: 1, name: 'Rafael M.', points: 21, played: 7, wins: 7, losses: 0, sets: '14-2', winRate: '100%', avgGamesWon: 6.2, form: 'WWWWW' },
    { position: 2, name: 'Carlos S.', points: 17, played: 7, wins: 6, losses: 1, sets: '12-4', winRate: '86%', avgGamesWon: 5.8, form: 'WWWLW' },
    { position: 3, name: 'Ana G.', points: 13, played: 7, wins: 5, losses: 2, sets: '11-6', winRate: '71%', avgGamesWon: 5.5, form: 'WLWWL' },
    { position: 4, name: 'James W.', points: 11, played: 7, wins: 4, losses: 3, sets: '9-8', winRate: '57%', avgGamesWon: 5.2, form: 'LWLWW' },
    { position: 5, name: 'María L.', points: 8, played: 7, wins: 3, losses: 4, sets: '8-9', winRate: '43%', avgGamesWon: 4.8, form: 'WLLWL' },
    { position: 6, name: 'David K.', points: 5, played: 7, wins: 2, losses: 5, sets: '5-11', winRate: '29%', avgGamesWon: 4.5, form: 'LLLWL' },
    { position: 7, name: 'Sophie B.', points: 2, played: 7, wins: 1, losses: 6, sets: '3-12', winRate: '14%', avgGamesWon: 4.2, form: 'LLLLL' },
    { position: 8, name: 'Tom H.', points: 0, played: 7, wins: 0, losses: 7, sets: '2-14', winRate: '0%', avgGamesWon: 3.8, form: 'LLLLL' }
  ],
  rankings: [
    { position: 1, name: 'Rafael M.', elo: 1487, trend: 'up', change: '+23', peakElo: 1487, matches: 45, titles: 3 },
    { position: 2, name: 'Carlos S.', elo: 1452, trend: 'up', change: '+15', peakElo: 1465, matches: 42, titles: 2 },
    { position: 3, name: 'Ana G.', elo: 1398, trend: 'down', change: '-8', peakElo: 1420, matches: 38, titles: 1 },
    { position: 4, name: 'James W.', elo: 1345, trend: 'up', change: '+12', peakElo: 1345, matches: 40, titles: 1 },
    { position: 5, name: 'María L.', elo: 1289, trend: 'same', change: '0', peakElo: 1310, matches: 35, titles: 0 },
    { position: 6, name: 'David K.', elo: 1234, trend: 'down', change: '-18', peakElo: 1280, matches: 33, titles: 0 },
    { position: 7, name: 'Sophie B.', elo: 1198, trend: 'up', change: '+5', peakElo: 1220, matches: 30, titles: 0 },
    { position: 8, name: 'Tom H.', elo: 1145, trend: 'down', change: '-22', peakElo: 1200, matches: 28, titles: 0 }
  ],
  results: [
    { id: 1, player1: 'Rafael M.', player2: 'Carlos S.', score: '6-4, 7-5', date: '22 Jun', court: 'Club Sotogrande', duration: '1h 45m', aces: { p1: 8, p2: 6 }, winners: { p1: 24, p2: 18 } },
    { id: 2, player1: 'Ana G.', player2: 'María L.', score: '6-3, 2-6, 10-8', date: '21 Jun', court: 'La Reserva', duration: '2h 10m', aces: { p1: 4, p2: 5 }, winners: { p1: 20, p2: 22 } },
    { id: 3, player1: 'James W.', player2: 'David K.', score: '6-2, 6-3', date: '20 Jun', court: 'Real Club Valderrama', duration: '1h 15m', aces: { p1: 10, p2: 3 }, winners: { p1: 28, p2: 15 } },
    { id: 4, player1: 'Sophie B.', player2: 'Tom H.', score: '4-6, 6-4, 10-7', date: '19 Jun', court: 'Club Sotogrande', duration: '2h 30m', aces: { p1: 2, p2: 3 }, winners: { p1: 18, p2: 16 } }
  ],
  upcoming: [
    { player1: 'Rafael M.', player2: 'Ana G.', round: 8, deadline: '29 Jun', headToHead: '2-0', lastMeeting: '15 May' },
    { player1: 'Carlos S.', player2: 'James W.', round: 8, deadline: '29 Jun', headToHead: '1-1', lastMeeting: '8 Jun' },
    { player1: 'María L.', player2: 'David K.', round: 8, deadline: '29 Jun', headToHead: '3-2', lastMeeting: '1 Jun' },
    { player1: 'Sophie B.', player2: 'Tom H.', round: 8, deadline: '29 Jun', headToHead: '0-1', lastMeeting: '25 May' }
  ],
  statistics: {
    topAces: [
      { name: 'James W.', total: 68 },
      { name: 'Rafael M.', total: 56 },
      { name: 'Carlos S.', total: 48 }
    ],
    longestMatches: [
      { players: 'Sophie B. vs Tom H.', duration: '2h 30m' },
      { players: 'Ana G. vs María L.', duration: '2h 10m' },
      { players: 'Rafael M. vs Carlos S.', duration: '1h 45m' }
    ],
    winStreaks: [
      { name: 'Rafael M.', streak: 7 },
      { name: 'Carlos S.', streak: 4 },
      { name: 'James W.', streak: 2 }
    ]
  },
  bracket: [
    { round: 'Cuartos', matches: [
      { p1: 'Rafael M.', p2: 'Tom H.', winner: 'Rafael M.' },
      { p1: 'Carlos S.', p2: 'Sophie B.', winner: 'Carlos S.' },
      { p1: 'Ana G.', p2: 'David K.', winner: 'Ana G.' },
      { p1: 'James W.', p2: 'María L.', winner: 'James W.' }
    ]},
    { round: 'Semifinales', matches: [
      { p1: 'Rafael M.', p2: 'James W.', winner: 'Rafael M.' },
      { p1: 'Carlos S.', p2: 'Ana G.', winner: 'Carlos S.' }
    ]},
    { round: 'Final', matches: [
      { p1: 'Rafael M.', p2: 'Carlos S.', winner: null }
    ]}
  ]
} 