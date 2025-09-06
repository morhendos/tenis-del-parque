import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
    index: true
  },
  
  season: {
    type: String,
    required: true,
    index: true
  },
  
  round: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  
  players: {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    }
  },
  
  schedule: {
    proposedDates: [{
      type: Date
    }],
    confirmedDate: {
      type: Date
    },
    club: {
      type: String
    },
    court: {
      type: String
    },
    courtNumber: {
      type: String
    },
    time: {
      type: String
    },
    deadline: {
      type: Date
    }
  },
  
  result: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    score: {
      sets: [{
        player1: {
          type: Number,
          min: 0
        },
        player2: {
          type: Number,
          min: 0
        }
      }],
      retiredPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      walkover: {
        type: Boolean,
        default: false
      }
    },
    playedAt: {
      type: Date
    }
  },
  
  eloChanges: {
    player1: {
      before: Number,
      after: Number,
      change: Number
    },
    player2: {
      before: Number,
      after: Number,
      change: Number
    }
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled',
    required: true,
    index: true
  },
  
  wildCardUsed: {
    player1: {
      type: Boolean,
      default: false
    },
    player2: {
      type: Boolean,
      default: false
    }
  },
  
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
MatchSchema.index({ league: 1, season: 1, round: 1 });
MatchSchema.index({ 'players.player1': 1, status: 1 });
MatchSchema.index({ 'players.player2': 1, status: 1 });
MatchSchema.index({ status: 1, 'schedule.confirmedDate': 1 });

// Virtual for getting both players as array
MatchSchema.virtual('playersList').get(function() {
  return [this.players.player1, this.players.player2];
});

// Method to check if a player is in this match
MatchSchema.methods.hasPlayer = function(playerId) {
  return this.players.player1.equals(playerId) || 
         this.players.player2.equals(playerId);
};

// Method to get opponent for a given player
MatchSchema.methods.getOpponent = function(playerId) {
  if (this.players.player1.equals(playerId)) {
    return this.players.player2;
  } else if (this.players.player2.equals(playerId)) {
    return this.players.player1;
  }
  return null;
};

// Method to format score for display
MatchSchema.methods.getScoreDisplay = function() {
  if (!this.result || !this.result.score || !this.result.score.sets) {
    return '';
  }
  
  return this.result.score.sets
    .map(set => `${set.player1}-${set.player2}`)
    .join(', ');
};

// Method to calculate points for each player based on match result
MatchSchema.methods.calculatePoints = function() {
  if (!this.result || !this.result.winner || this.status !== 'completed') {
    return { player1: 0, player2: 0 };
  }

  // Special handling for walkovers - give winner 2 points, loser 0 points
  if (this.result.score.walkover) {
    const player1Won = this.result.winner.equals(this.players.player1);
    return {
      player1: player1Won ? 2 : 0,
      player2: player1Won ? 0 : 2
    };
  }

  let player1Sets = 0;
  let player2Sets = 0;

  if (this.result.score.sets && this.result.score.sets.length > 0) {
    // Count sets won by each player
    this.result.score.sets.forEach(set => {
      if (set.player1 > set.player2) {
        player1Sets++;
      } else {
        player2Sets++;
      }
    });
  }

  // Calculate points based on sets won for regular matches
  // Win 2-0: 3 points, Win 2-1: 2 points, Lose 1-2: 1 point, Lose 0-2: 0 points
  const getPoints = (setsWon, setsLost) => {
    if (setsWon === 2 && setsLost === 0) return 3;
    if (setsWon === 2 && setsLost === 1) return 2;
    if (setsWon === 1 && setsLost === 2) return 1;
    if (setsWon === 0 && setsLost === 2) return 0;
    return 0; // Default case
  };

  return {
    player1: getPoints(player1Sets, player2Sets),
    player2: getPoints(player2Sets, player1Sets)
  };
};

// Method to get points for a specific player
MatchSchema.methods.getPointsForPlayer = function(playerId) {
  const points = this.calculatePoints();
  
  if (this.players.player1.equals(playerId)) {
    return points.player1;
  } else if (this.players.player2.equals(playerId)) {
    return points.player2;
  }
  
  return 0;
};

// Static method to find matches for a player
MatchSchema.statics.findByPlayer = function(playerId, options = {}) {
  const query = {
    $or: [
      { 'players.player1': playerId },
      { 'players.player2': playerId }
    ]
  };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.league) {
    query.league = options.league;
  }
  
  if (options.season) {
    query.season = options.season;
  }
  
  return this.find(query)
    .populate('players.player1 players.player2')
    .sort({ 'schedule.confirmedDate': -1 });
};

// Static method to find matches for a round
MatchSchema.statics.findByRound = function(league, season, round) {
  return this.find({ league, season, round })
    .populate('players.player1 players.player2')
    .sort({ 'schedule.confirmedDate': 1 });
};

// Static method to calculate total points for a player
MatchSchema.statics.calculatePlayerPoints = async function(playerId, leagueId = null, season = null) {
  const query = {
    $or: [
      { 'players.player1': playerId },
      { 'players.player2': playerId }
    ],
    status: 'completed'
  };
  
  if (leagueId) query.league = leagueId;
  if (season) query.season = season;
  
  const matches = await this.find(query);
  
  return matches.reduce((totalPoints, match) => {
    return totalPoints + match.getPointsForPlayer(playerId);
  }, 0);
};

// Pre-save validation
MatchSchema.pre('save', function(next) {
  // Ensure players are different
  if (this.players.player1.equals(this.players.player1)) {
    next(new Error('A player cannot play against themselves'));
    return;
  }
  
  // Validate result if match is completed
  if (this.status === 'completed') {
    if (!this.result || !this.result.winner) {
      next(new Error('Completed matches must have a result with a winner'));
      return;
    }
    
    // Ensure winner is one of the players
    const winnerId = this.result.winner.toString();
    const player1Id = this.players.player1.toString();
    const player2Id = this.players.player2.toString();
    
    if (winnerId !== player1Id && winnerId !== player2Id) {
      next(new Error('Winner must be one of the match players'));
      return;
    }
  }
  
  next();
});

// Don't create the model if it already exists (for hot reloading in development)
const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

export default Match;