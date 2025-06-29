# Match Management Feature - Implementation Guide

## 🚀 Getting Started

This branch implements the match management system for the tennis league. Follow this guide to implement the feature step by step.

## 📋 Task Checklist

### Week 1: Core Match Management

#### Day 1-2: Database Setup
- [ ] Create `lib/models/Match.js` with the schema
- [ ] Update `lib/models/Player.js` to add matchHistory field
- [ ] Create database migration script if needed
- [ ] Test models with sample data

#### Day 3-4: Admin Match List UI
- [ ] Create `app/admin/matches/page.js` 
- [ ] Create `components/admin/matches/MatchList.js`
- [ ] Create `components/admin/matches/MatchFilters.js`
- [ ] Implement search and filtering functionality

#### Day 5: API Endpoints
- [ ] Create `app/api/admin/matches/route.js` (GET, POST)
- [ ] Create `app/api/admin/matches/[id]/route.js` (GET, PATCH, DELETE)
- [ ] Add authentication middleware
- [ ] Test all endpoints

### Week 2: Swiss Pairing System

#### Day 1-2: Swiss Algorithm
- [ ] Create `lib/utils/swissPairing.js`
- [ ] Implement pairing logic with tests
- [ ] Handle edge cases (byes, odd players)

#### Day 3-4: Round Generation UI
- [ ] Create round generation component
- [ ] Add preview functionality
- [ ] Create `app/api/admin/matches/generate-round/route.js`

### Week 3: Results & ELO

#### Day 1-2: Result Entry
- [ ] Create match detail page
- [ ] Build result entry form
- [ ] Add validation

#### Day 3-4: ELO System
- [ ] Create `lib/utils/eloCalculator.js`
- [ ] Implement rating updates
- [ ] Create `app/api/admin/matches/[id]/result/route.js`

### Week 4: Player Features

#### Day 1-2: Public Pages
- [ ] Create `app/matches/page.js`
- [ ] Create `app/player/[id]/page.js`

#### Day 3-4: Polish & Testing
- [ ] Add loading states
- [ ] Error handling
- [ ] Final testing

## 🛠️ Development Commands

```bash
# Switch to feature branch
git checkout feature/match-management

# Install dependencies (if any new ones)
npm install

# Run development server
npm run dev

# Run tests (when implemented)
npm test
```

## 📁 File Structure to Create

```
app/
├── admin/
│   └── matches/
│       ├── page.js              # Match list page
│       └── [id]/
│           └── page.js          # Match detail/edit page
├── api/
│   └── admin/
│       └── matches/
│           ├── route.js         # List/Create matches
│           ├── [id]/
│           │   └── route.js     # Get/Update/Delete match
│           ├── generate-round/
│           │   └── route.js     # Generate Swiss rounds
│           └── [id]/
│               └── result/
│                   └── route.js # Submit match result
├── matches/
│   └── page.js                  # Public matches page
└── player/
    └── [id]/
        └── page.js              # Player profile page

components/
└── admin/
    └── matches/
        ├── MatchList.js         # Match list component
        ├── MatchFilters.js      # Filter controls
        ├── MatchForm.js         # Create/Edit form
        ├── ResultEntry.js       # Result entry form
        └── RoundGenerator.js    # Swiss round generator

lib/
├── models/
│   └── Match.js                 # Match model
├── utils/
│   ├── swissPairing.js         # Swiss pairing algorithm
│   └── eloCalculator.js        # ELO calculation
└── content/
    └── matchContent.js         # Multilingual content
```

## 🎨 UI Components Needed

1. **MatchCard** - Display match info in list
2. **MatchForm** - Create/edit matches
3. **ResultEntry** - Score input form
4. **PlayerSelector** - Dropdown with search
5. **RoundGenerator** - Swiss pairing interface
6. **MatchScheduler** - Date/time picker

## 🔗 Integration Points

1. **Player Management** - Fetch players for selection
2. **League System** - Filter by league/season
3. **Admin Auth** - Protect all admin routes
4. **Notification System** - Future integration

## 📝 Notes

- Keep the Swiss pairing algorithm flexible for future tournament formats
- ELO calculations should be reversible in case of data entry errors
- Consider mobile UX for result entry (admins might update from courtside)
- Plan for concurrent match updates (multiple admins)

## 🧪 Testing Checklist

- [ ] Swiss pairing generates valid matchups
- [ ] ELO updates correctly for all result types
- [ ] Match status transitions work properly
- [ ] Player stats update after results
- [ ] Search and filters work correctly
- [ ] API endpoints handle errors gracefully

## 🚢 Deployment Checklist

- [ ] Update environment variables if needed
- [ ] Run database migrations
- [ ] Test on staging environment
- [ ] Update documentation
- [ ] Create PR with detailed description

## 💡 Quick Start Example

```javascript
// Example: Creating a match via API
const match = {
  league: "leagueId",
  season: "summer-2025",
  round: 1,
  players: {
    player1: "player1Id",
    player2: "player2Id"
  },
  schedule: {
    confirmedDate: "2025-07-15T10:00:00Z",
    court: "Court 1"
  },
  status: "scheduled"
};

// POST to /api/admin/matches
```

Good luck with the implementation! 🎾
