# Homepage & League System Implementation Plan

## Overview
Transform the homepage from showing fake statistics to an inspirational, problem-solving focused design that connects with potential players emotionally. Implement a dynamic league system with proper database integration and individual league landing pages.

## Phase 1: Homepage Redesign ✅ (Priority: High) - COMPLETED

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

## Phase 2: Admin League Management ✅ (Priority: High) - COMPLETED

### 2.1 League Model Enhancement
- [x] Add fields for league status: 'active', 'coming_soon', 'inactive'
- [x] Add waiting list count field
- [x] Add expected launch date
- [x] Add priority/order field for display

### 2.2 Admin Interface
- [x] Create league management page in admin
- [x] Allow creating new leagues with all statuses
- [x] Enable editing league details
- [ ] Add waiting list viewer
- [ ] Export waiting list functionality

## Phase 3: Individual League Pages (Priority: Medium) - PARTIALLY COMPLETE

### 3.1 League Page Template ✅
- [x] Create reusable league page component (`[locale]/[location]/liga/[season]/page.js`)
- [x] Support both active and coming soon states
- [x] Include league-specific information
- [ ] Add local testimonials/photos when available

### 3.2 Active League Pages (like Sotogrande) ✅
- [x] Show current season info
- [x] Display real player count
- [x] Link to registration (when open)
- [x] Show recent matches/results
- [x] Include league-specific rules

### 3.3 Coming Soon League Pages
- [ ] Create landing page for coming soon leagues (`[locale]/[location]/page.js`)
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
│   ├── LeaguePageTemplate.js ✅ (as [locale]/[location]/liga/[season]/page.js)
│   ├── ActiveLeagueContent.js ✅
│   ├── ComingSoonLeagueContent.js (pending)
│   └── WaitingListForm.js (pending)
└── admin/
    └── leagues/
        ├── LeagueManager.js ✅ (admin/leagues/page.js)
        ├── LeagueFormModal.js ✅
        └── WaitingListViewer.js (pending)
```

### API Routes
```
/api/leagues ✅
  GET - Public endpoint for all leagues (includes coming_soon)
  
/api/leagues/[slug] ✅
  GET - Public endpoint for single league (existing)
  
/api/leagues/[slug]/waiting-list
  POST - Join waiting list (pending)
  
/api/admin/leagues ✅
  GET, POST - Admin league management
  
/api/admin/leagues/[id] ✅
  PUT, DELETE - Admin league updates
  
/api/admin/leagues/[id]/waiting-list
  GET - View waiting list (pending)
```

### Database Updates ✅
```javascript
// League Model additions (COMPLETED)
{
  status: {
    type: String,
    enum: ['active', 'coming_soon', 'inactive'],
    default: 'active'
  },
  expectedLaunchDate: Date,
  waitingListCount: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  description: {
    es: String,
    en: String
  }
}

// New WaitingList Model (PENDING)
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

## Current Status Summary

### ✅ Completed:
1. **Homepage redesign** with emotional focus
2. **Dynamic league display** from database
3. **Admin league management** (create, edit, status management)
4. **League page for active leagues** (standings, schedule, results)
5. **Fixed issues**:
   - `refreshLeagues` function error
   - Active leagues now link to league page instead of registration

### 🚧 In Progress / Next Steps:
1. **Coming Soon League Landing Pages**: Need separate pages for leagues with `coming_soon` status
2. **Waiting List System**: Complete database model, API, and UI
3. **Admin Waiting List Viewer**: To see who's interested in new leagues

## How to Test Current Implementation

1. **Create Estepona as coming soon**:
   - Go to `/admin/leagues`
   - Click "+ Create League"
   - Name: "Estepona", Slug: "estepona", Status: "Coming Soon"
   - City: "Estepona", Region: "Málaga"
   - Set expected launch date
   
2. **Check homepage**:
   - New league appears in "Coming Soon" section
   - Active leagues (Sotogrande) show "Ver Liga" button
   - Coming soon leagues show "Lista de Espera" button

3. **Test league page**:
   - Click "Ver Liga" on Sotogrande
   - Should go to `/es/sotogrande/liga/verano2025`
   - See standings, schedule, and results

## Notes

- Active leagues direct to league page (`/[locale]/[location]/liga/[season]`)
- Coming soon leagues need landing pages (`/[locale]/[location]`)
- Registration only available when season status is `registration_open`
- Keep all components modular and reusable ✅
- Focus on authenticity over impressive numbers ✅