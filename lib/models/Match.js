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

// Pre-save validation
MatchSchema.pre('save', function(next) {
  // Ensure players are different
  if (this.players.player1.equals(this.players.player2)) {
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
