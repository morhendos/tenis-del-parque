# Homepage & League System Implementation Plan

## Overview
Transform the homepage from showing fake statistics to an inspirational, problem-solving focused design that connects with potential players emotionally. Implement a dynamic league system with proper database integration and individual league landing pages.

## Phase 1: Homepage Redesign ✅ (Priority: High)

### 1.1 New Hero Section
- [x] Replace fake statistics with emotional value proposition
- [x] Focus on solving the problem: "Finding tennis partners at your level is hard"
- [x] Highlight the joy and community aspects
- [x] Use real testimonials if available
- [x] Keep it authentic and relatable

### 1.2 Dynamic League Display
- [x] Fetch leagues from database instead of hardcoded data
- [x] Show actual Sotogrande league as "active"
- [x] Display other leagues based on database status
- [x] Remove fake player counts
- [x] Add "Join Waiting List" for coming soon leagues

### 1.3 Problem-Solution Section
- [x] Create new section explaining the problem we solve
- [x] Show the journey: Problem → Solution → Happy Players
- [x] Use icons and visuals to make it scannable
- [x] Include emotional benefits (confidence, community, fun)

## Phase 2: Admin League Management (Priority: High)

### 2.1 League Model Enhancement
- [ ] Add fields for league status: 'active', 'coming_soon', 'planning'
- [ ] Add waiting list count field
- [ ] Add expected launch date
- [ ] Add priority/order field for display

### 2.2 Admin Interface
- [ ] Create league management page in admin
- [ ] Allow creating new leagues with all statuses
- [ ] Enable editing league details
- [ ] Add waiting list viewer
- [ ] Export waiting list functionality

## Phase 3: Individual League Pages (Priority: Medium)

### 3.1 League Page Template
- [ ] Create reusable league page component
- [ ] Support both active and coming soon states
- [ ] Include league-specific information
- [ ] Add local testimonials/photos when available

### 3.2 Active League Pages (like Sotogrande)
- [ ] Show current season info
- [ ] Display real player count
- [ ] Link to registration
- [ ] Show recent matches/results
- [ ] Include league-specific rules

### 3.3 Coming Soon League Pages
- [ ] Explain why we're coming to this city
- [ ] Show expected launch timeline
- [ ] Waiting list signup form
- [ ] Display current interest level
- [ ] FAQ specific to new leagues

## Phase 4: Waiting List System (Priority: Medium)

### 4.1 Database Schema
- [ ] Create WaitingList model
- [ ] Store: email, name, phone, city, signup date
- [ ] Add preferences (level, availability)
- [ ] Include marketing consent

### 4.2 Waiting List API
- [ ] POST endpoint for signups
- [ ] GET endpoint for admin viewing
- [ ] Email notification system
- [ ] Duplicate prevention

### 4.3 UI Components
- [ ] Create waiting list form component
- [ ] Success/confirmation messages
- [ ] Progress indicator (X people interested)
- [ ] Social proof elements

## Phase 5: Enhanced Features (Priority: Low)

### 5.1 Social Proof
- [ ] Real testimonials carousel
- [ ] Player success stories
- [ ] Community photos
- [ ] Match highlights

### 5.2 City-Specific Content
- [ ] Local tennis court information
- [ ] City-specific benefits
- [ ] Local partner/sponsor logos
- [ ] Regional pricing if applicable

## Technical Architecture

### Component Structure
```
components/
├── home/
│   ├── EmotionalHeroSection.js ✅
│   ├── ProblemSection.js ✅
│   ├── SolutionSection.js ✅
│   ├── LeagueGrid.js (dynamic from DB) ✅
│   ├── TestimonialsSection.js (real testimonials) ✅
│   └── CTASection.js (clear next steps) ✅
├── leagues/
│   ├── LeaguePageTemplate.js
│   ├── ActiveLeagueContent.js
│   ├── ComingSoonLeagueContent.js
│   └── WaitingListForm.js
└── admin/
    └── leagues/
        ├── LeagueManager.js
        ├── LeagueForm.js
        └── WaitingListViewer.js
```

### API Routes
```
/api/leagues ✅
  GET - Public endpoint for all leagues
  
/api/leagues/[slug]
  GET - Public endpoint for single league
  
/api/leagues/[slug]/waiting-list
  POST - Join waiting list
  
/api/admin/leagues
  GET, POST - Admin league management
  
/api/admin/leagues/[id]
  PUT, DELETE - Admin league updates
  
/api/admin/leagues/[id]/waiting-list
  GET - View waiting list
```

### Database Updates
```javascript
// League Model additions
{
  status: {
    type: String,
    enum: ['active', 'coming_soon', 'planning', 'inactive'],
    default: 'planning'
  },
  expectedLaunchDate: Date,
  waitingListCount: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  heroImage: String,
  cityDescription: {
    es: String,
    en: String
  }
}

// New WaitingList Model
{
  league: { type: ObjectId, ref: 'League' },
  email: { type: String, required: true },
  name: String,
  phone: String,
  preferredLevel: String,
  availability: [String],
  marketingConsent: Boolean,
  signupDate: { type: Date, default: Date.now },
  source: String // 'homepage', 'league_page', etc.
}
```

## Implementation Order

1. **Week 1**: Homepage redesign with emotional focus ✅
2. **Week 1-2**: Dynamic league display from database ✅
3. **Week 2**: Basic admin league management
4. **Week 3**: Individual league pages (template + Sotogrande)
5. **Week 3-4**: Waiting list system
6. **Week 4+**: Enhanced features and polish

## Success Metrics

- [x] Homepage clearly communicates the problem we solve
- [x] Visitors understand the emotional benefits
- [x] League information is always accurate (from DB)
- [ ] Easy for admins to manage leagues
- [ ] Smooth waiting list signup process
- [ ] Each league has its own compelling page

## Notes

- Start with Estepona as the first "coming soon" league
- Keep all components modular and reusable ✅
- Ensure mobile-first design throughout
- Use real data wherever possible ✅
- Focus on authenticity over impressive numbers ✅