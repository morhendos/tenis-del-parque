# 🎾 SEO Clubs Directory - Implementation TODO

## 🎯 Mission
Build a comprehensive tennis club directory to drive organic traffic and convert tennis players into league participants. This directory will cover multiple Spanish cities with both Spanish and English versions.

## ✅ Phase 0 - Foundation (COMPLETED)
- [x] Implement locale-based routing (/es/, /en/)
- [x] Update middleware for language detection
- [x] Create language switcher component
- [x] Update existing pages to support locales
- [x] Prepare multi-league homepage
- [x] Create dynamic city-based signup pages
- [x] Implement comprehensive SEO metadata structure
- [x] Add Organization schema
- [x] Implement hreflang tags

## ✅ Current Sprint - UI Improvements (COMPLETED)
- [x] **Improve Leagues Page**
  - [x] Create reusable LeagueCard component
  - [x] Use consistent league cards across homepage and leagues page
  - [x] Ensure responsive design
  - [x] Add proper loading states

## 📋 Phase 1 - Database & Models (Week 1) - IN PROGRESS
- [x] **Create Club Model**
  - [x] Define schema with multilingual support
  - [x] Fields: name, slug, description (es/en), address, coordinates
  - [x] Court details: surfaces, number of courts, amenities
  - [x] Contact info: phone, email, website
  - [x] Operating hours, pricing info
  - [x] Tags: indoor, lighting, padel, parking, etc.

- [x] **Admin Interface for Clubs**
  - [x] CRUD operations for clubs
  - [ ] Bulk import functionality
  - [ ] Image upload for club photos
  - [ ] Preview functionality
  - [x] Basic table view with filtering by city
  - [x] Stats summary
  - [ ] Club form modal (placeholder created)

- [x] **Data Collection & Import**
  - [x] Sample data for Málaga tennis clubs (2 clubs)
  - [x] Sample data for Marbella tennis clubs (2 clubs)
  - [x] Sample data for Estepona tennis clubs (2 clubs)
  - [x] Create seed script
  - [ ] Research and add more clubs (30+ for Málaga, 20+ for Marbella, 10+ for Estepona)
  - [ ] Set up proper database indexes (basic indexes created)

## 📋 Phase 2 - Club Directory Pages (Week 1-2) - NEXT PRIORITY
- [ ] **Main Clubs Landing Page** (`/[locale]/clubs`)
  - [ ] Hero section with value proposition
  - [ ] City selector with club counts
  - [ ] SEO-optimized intro content
  - [ ] Featured clubs section

- [ ] **City Directory Pages** (`/[locale]/clubs/[city]`)
  - [ ] City-specific hero with local imagery
  - [ ] Filter system (by amenities, surface, etc.)
  - [ ] Interactive map view option
  - [ ] List/grid view toggle
  - [ ] Pagination or infinite scroll
  - [ ] City-specific SEO content (300+ words)

- [ ] **Individual Club Pages** (`/[locale]/clubs/[city]/[club]`)
  - [ ] Club header with photos
  - [ ] Detailed information sections
  - [ ] Google Maps integration
  - [ ] Court availability info
  - [ ] CTA: "Find tennis partners here →"
  - [ ] Related clubs section
  - [ ] Social sharing buttons

- [ ] **Components to Build**
  - [ ] ClubCard component
  - [ ] ClubFilters component
  - [ ] ClubMap component
  - [ ] ClubDetailHeader component
  - [ ] ClubInfoSection component
  - [ ] ClubCTA component

## 📋 Phase 3 - Technical SEO (Week 2-3)
- [ ] **Structured Data Implementation**
  - [ ] LocalBusiness schema for each club
  - [ ] SportsActivity schema
  - [ ] BreadcrumbList schema
  - [ ] WebSite schema with search functionality

- [ ] **SEO Assets**
  - [ ] Create og-image.png (1200x630px)
  - [ ] Create twitter-image.png (1200x600px)
  - [ ] Design and implement favicon.ico
  - [ ] Create apple-touch-icon.png
  - [ ] Design city-specific OG images

- [ ] **Technical Files**
  - [ ] Create comprehensive robots.txt
  - [ ] Generate multilingual XML sitemaps
  - [ ] Create manifest.json for PWA
  - [ ] Implement canonical URLs

- [ ] **Environment & Analytics**
  - [ ] Set up Google Site Verification
  - [ ] Configure Search Console
  - [ ] Set up Yandex verification (if needed)
  - [ ] Implement event tracking for conversions

## 📋 Phase 4 - Content & Launch (Week 3-4)
- [ ] **Content Creation**
  - [ ] Write city overview content (300+ words each)
  - [ ] Create unique club descriptions
  - [ ] Develop local tennis culture content
  - [ ] Write seasonal/weather content
  - [ ] Create FAQ content for each city

- [ ] **Conversion Optimization**
  - [ ] A/B test CTA placements
  - [ ] Optimize conversion funnels
  - [ ] Create urgency elements
  - [ ] Add social proof elements

- [ ] **Launch Tasks**
  - [ ] Soft launch with Málaga
  - [ ] Monitor Core Web Vitals
  - [ ] Submit sitemaps to Google
  - [ ] Begin link building outreach
  - [ ] Set up rank tracking

## 📋 Phase 5 - Growth Features
- [ ] **Waiting List System**
  - [ ] Create WaitingList model
  - [ ] Build signup forms
  - [ ] Email notification system
  - [ ] Admin dashboard for waiting lists

- [ ] **Product-Generated SEO**
  - [ ] Public player profiles (`/player/[name]`)
  - [ ] Public match pages (`/match/[id]`)
  - [ ] League archive pages
  - [ ] Rankings/leaderboard pages

- [ ] **Community Features**
  - [ ] Club reviews/ratings
  - [ ] Player tips per club
  - [ ] Club claiming system
  - [ ] Partner/sponsor integrations

## 🎯 Target Keywords by City

### Málaga
- [ ] pistas de tenis málaga
- [ ] clubs de tenis málaga
- [ ] jugar tenis málaga
- [ ] tennis clubs malaga spain
- [ ] clases tenis málaga
- [ ] torneos tenis málaga

### Marbella
- [ ] pistas de tenis marbella
- [ ] clubs de tenis marbella
- [ ] tennis marbella
- [ ] tennis clubs marbella spain
- [ ] jugar tenis marbella
- [ ] clases tenis marbella

### Estepona
- [ ] pistas de tenis estepona
- [ ] clubs de tenis estepona
- [ ] tennis estepona
- [ ] canchas tenis estepona
- [ ] donde jugar tenis estepona
- [ ] tenis estepona precios

## 📊 Success Metrics
- [ ] Set up tracking for:
  - [ ] Organic traffic by city
  - [ ] Directory → Signup conversion rate
  - [ ] Keyword rankings by city
  - [ ] User engagement metrics
  - [ ] Backlink acquisition

## 🐛 Known Issues to Fix
- [ ] Player dashboard routes need locale support
- [ ] Some API endpoints may need locale updates
- [ ] Mobile navigation improvements needed
- [ ] Club form modal needs to be implemented

## 📝 Notes
- Priority cities: Málaga → Marbella → Estepona
- Each city should have sufficient clubs (Málaga: 30+, Marbella: 20+, Estepona: 10+)
- Focus on long-tail local keywords
- Ensure all content is manually translated (no auto-translate)
- Keep CTAs contextual and compelling
- These cities are all in the Costa del Sol region, perfect for year-round tennis
- Run seed script: `node scripts/seedClubs.js`

---

**Last Updated:** July 2025
**Current Sprint:** Phase 1 - Database & Models Setup (90% complete)
**Next Priority:** Complete club form modal, then move to Phase 2 - Club Directory Pages