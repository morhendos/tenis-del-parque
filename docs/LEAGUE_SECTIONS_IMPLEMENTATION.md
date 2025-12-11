# League Sections Implementation Plan

## Overview
Reorganize the player hub "My Leagues" section to separate leagues into clear categories: Active, Upcoming, and Past. This improves UX by highlighting what's most relevant and keeping the interface clean on mobile.

## Current State
- All leagues displayed in a flat list with tabs
- No visual distinction between active, upcoming, or completed leagues
- Users can't quickly see which leagues need attention

## Target State
- Collapsible sections: Active (expanded), Upcoming (expanded), Past (collapsed)
- Visual hierarchy with distinct styling per category
- Mobile-optimized with smooth animations
- Empty states for each section

---

## Implementation Checklist

### Phase 1: Data Categorization Logic
- [x] Create helper function to categorize leagues by status
  - Active: `status === 'active'` OR in playoff phases
  - Upcoming: `status === 'registration_open'` OR `status === 'coming_soon'`
  - Past: `status === 'completed'` OR `status === 'archived'`
- [x] Handle edge cases (leagues with no status, null values)
- [x] Sort within categories (Active by most recent activity, Upcoming by start date, Past by end date descending)

### Phase 2: Collapsible Section Component
- [x] Create `LeagueSection` component with:
  - Header with icon, title, count badge
  - Expand/collapse toggle with chevron animation
  - Smooth height animation for content
  - Different default states (Active/Upcoming expanded, Past collapsed)
- [x] Mobile-friendly touch targets (min 44px)
- [ ] Accessible: proper ARIA attributes for expand/collapse

### Phase 3: League Card Variants
- [x] **Active League Card** (green gradient header)
  - Show current phase (Regular Season / Playoffs)
  - Stats: matches played, wins, points
  - Prominent "View Standings" and "View Playoffs" buttons
  - If in playoffs, show playoff badge/indicator
  
- [x] **Upcoming League Card** (purple/blue gradient header)
  - Show registration status badge
  - Display start date
  - "Register Now" CTA if registration open
  - "Coming Soon" indicator with expected date if not open yet
  
- [x] **Past League Card** (muted gray styling)
  - Show final position/placement
  - Display any trophies/achievements earned
  - "View History" button (less prominent)
  - Compact design to save space

### Phase 4: Empty States
- [x] Active section empty: "No active leagues. Join one below!"
- [x] Upcoming section empty: "No upcoming leagues at the moment."
- [x] Past section empty: "You haven't completed any leagues yet."
- [x] All sections empty: Special state with CTA to explore leagues

### Phase 5: Mobile Optimization
- [ ] Reduce padding in collapsed state
- [ ] Ensure cards are touch-friendly
- [ ] Test horizontal scroll if needed for multiple cards
- [ ] Verify animations are smooth (60fps)
- [ ] Test on various screen sizes

### Phase 6: Integration & Polish
- [x] Update `MultiLeagueCard.js` with new structure
- [x] Ensure league selector (if multiple in same category) still works
- [x] Add subtle animations for section expand/collapse
- [ ] Test with real data (multiple leagues across categories)
- [ ] Verify links/navigation work correctly

---

## Component Structure

```
MultiLeagueCard/
├── LeagueSection (collapsible wrapper)
│   ├── SectionHeader (icon, title, count, chevron)
│   └── SectionContent (animated container)
│       └── LeagueCard variants:
│           ├── ActiveLeagueCard
│           ├── UpcomingLeagueCard
│           └── PastLeagueCard
└── EmptyState (per section)
```

---

## Visual Design Notes

### Section Headers
| Section | Icon | Color | Default State |
|---------|------|-------|---------------|
| Active | 🎾 (tennis ball SVG) | Green gradient | Expanded |
| Upcoming | 📅 (calendar SVG) | Purple gradient | Expanded |
| Past | 📚 (archive SVG) | Gray | Collapsed |

### Card Styling
- **Active**: `bg-gradient-to-r from-green-500 to-emerald-600` header
- **Upcoming**: `bg-gradient-to-r from-parque-purple to-purple-700` header  
- **Past**: `bg-gray-100` with `text-gray-600` header

---

## Files to Modify/Create

1. `components/player/MultiLeagueCard.js` - Main refactor
2. `components/player/LeagueSection.js` - New collapsible component (optional, could be inline)
3. `lib/utils/leagueUtils.js` - Add categorization helper (optional)

---

## Testing Scenarios

- [ ] Player with 1 active league only
- [ ] Player with multiple active leagues
- [ ] Player with active + upcoming leagues
- [ ] Player with active + past leagues
- [ ] Player with all three categories
- [ ] Player with no leagues at all
- [ ] Player with only past leagues
- [ ] League transitioning from active to completed

---

## Estimated Time
- Phase 1: 15 min
- Phase 2: 30 min
- Phase 3: 45 min
- Phase 4: 15 min
- Phase 5: 20 min
- Phase 6: 15 min

**Total: ~2.5 hours**
