# PWA Screenshots & Dashboard Improvements Plan

## Goal
Create professional PWA screenshots using demo data to enhance the app install experience.

---

## Phase 1: Create Demo League & Players

### 1.1 Seed Demo Data Script
Create a script that:
- Uses an existing unpopulated league (e.g., "Liga Gold - Sotogrande")
- Creates 8-10 demo players with realistic Spanish names
- Creates demo match results with varied scores
- Sets up the "demo player" we'll use for screenshots

**Demo Players (fake names):**
| Name | ELO | Role |
|------|-----|------|
| Carlos Martínez | 1247 | Main demo player (screenshots) |
| Ana García | 1312 | |
| Pablo Ruiz | 1189 | |
| María López | 1276 | |
| Javier Torres | 1154 | |
| Elena Sánchez | 1298 | |
| Diego Fernández | 1221 | |
| Lucía Moreno | 1165 | |

**Demo Match Results for Carlos:**
- vs Ana García: 4-6, 6-4, 6-3 (W)
- vs Pablo Ruiz: 6-2, 6-4 (W)
- vs María López: 3-6, 4-6 (L)
- vs Javier Torres: 6-1, 6-2 (W)
- vs Elena Sánchez: 6-7, 7-5, 4-6 (L)

This gives Carlos: 60% win rate, interesting match history, mid-table standing.

### 1.2 Script Location
`scripts/seedDemoData.js`

---

## Phase 2: Dashboard Improvements

### Current Issues (to discuss)
- [ ] What specifically is wrong with current dashboard?
- [ ] Layout issues?
- [ ] Missing information?
- [ ] Visual design?
- [ ] Mobile responsiveness?

### Potential Improvements
- [ ] Better stats cards layout
- [ ] Cleaner match history display
- [ ] More prominent ELO display
- [ ] Improved mobile experience
- [ ] Trophy/achievements visibility

**Need input:** What changes does Tom want to see?

---

## Phase 3: Take Screenshots

### Screenshots Needed
| File | Size | Content |
|------|------|---------|
| `mobile-dashboard.png` | 390×844 | Player dashboard (Carlos logged in) |
| `mobile-matches.png` | 390×844 | Match list or upcoming matches |
| `desktop-home.png` | 1280×720 | Dashboard on desktop |

### Process
1. Log in as demo player (Carlos Martínez)
2. Chrome DevTools → Device Toolbar
3. Set correct dimensions
4. Cmd+Shift+P → "Capture screenshot"
5. Save to `public/screenshots/`

---

## Phase 4: Update Manifest

Add screenshots back to `public/manifest.json`:

```json
"screenshots": [
  {
    "src": "/screenshots/mobile-dashboard.png",
    "sizes": "390x844",
    "type": "image/png",
    "form_factor": "narrow",
    "label": "Panel del jugador - Tus partidos y estadísticas"
  },
  {
    "src": "/screenshots/mobile-matches.png",
    "sizes": "390x844",
    "type": "image/png",
    "form_factor": "narrow",
    "label": "Tus partidos - Resultados y próximos encuentros"
  },
  {
    "src": "/screenshots/desktop-home.png",
    "sizes": "1280x720",
    "type": "image/png",
    "form_factor": "wide",
    "label": "Vista de escritorio - Tu liga de tenis"
  }
]
```

---

## Order of Execution

1. ✅ **[Script]** Create `seedDemoData.js` - seed demo league & players
2. ✅ **[Discussion]** Review current dashboard, list specific improvements  
3. ✅ **[Code]** Implement dashboard improvements
   - Created `NextMatchCard.js` - hero section for next match
   - Created `SeasonSummary.js` - compact stats with ELO sparkline
   - Created `RecentResults.js` - last 3 matches
   - Created `OpenRankCard.js` - compact gamification element
   - Updated `usePlayerDashboard.js` - added ELO history fetch
   - Removed: StatsCards, TrophyRoom, MultiLeagueCard, QuickActions
4. **[Manual]** Take screenshots using demo account
5. **[Code]** Add screenshots to manifest

---

## Files to Reference

- Dashboard: `app/[locale]/player/dashboard/page.js`
- Dashboard components: `components/player/`
- Manifest: `public/manifest.json`
- Existing seed scripts: `scripts/seedLeagues.js`, `scripts/createTestData.js`

---

## Demo Account Credentials
To be created by script:
- Email: `demo@tenisdp.es`
- Password: `demo123456`
- Player: Carlos Martínez

This account can also be used for:
- Marketing materials
- Demo videos
- Documentation
- Partner presentations
