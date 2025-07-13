# Tennis Club Directory SEO Implementation Plan

## 📋 Executive Summary
This implementation plan details how to build a multilingual tennis club directory for TenisDelParque to drive organic traffic and convert tennis players into league participants. The directory will initially cover Málaga, Valencia, and Sevilla with both Spanish and English versions.

## ✅ Implementation Checklist

### Phase 0: Foundation - Internationalization ✅ COMPLETED
- [x] Implement locale-based routing (/es/, /en/)
- [x] Update middleware for language detection
- [x] Create language switcher component
- [x] Update existing pages to support locales
- [x] Prepare multi-league homepage
- [x] Update signup flow for multiple cities
- [x] Create dynamic city-based signup pages

### Phase 1: Database & Models (Week 1) - NEXT
- [ ] Create Club model with multilingual support
- [ ] Add city-based league configuration
- [ ] Create admin interface for clubs
- [ ] Build data import scripts
- [ ] Set up proper indexes

### Phase 2: Club Directory Pages (Week 1-2)
- [ ] Create clubs landing page
- [ ] Build city directory pages
- [ ] Implement individual club pages
- [ ] Add filtering and search
- [ ] Create responsive club cards

### Phase 3: SEO Implementation (Week 2-3)
- [ ] Add structured data (Schema.org)
- [ ] Implement hreflang tags
- [ ] Create XML sitemaps
- [ ] Add meta tags optimization
- [ ] Submit to Google Search Console

### Phase 4: Content & Launch (Week 3-4)
- [ ] Research and add Málaga clubs
- [ ] Write SEO-optimized content
- [ ] Create CTA sections
- [ ] Test conversion flows
- [ ] Launch and monitor

## 🌐 URL Structure

### Current Structure (to update)
```
/signup/sotogrande
/login
/elo
/rules
/swiss
```

### New Structure (with locales) ✅ IMPLEMENTED
```
/es/                          → Spanish homepage ✅
/en/                          → English homepage ✅
/es/registro/[ciudad]         → Spanish signup by city ✅
/en/signup/[city]            → English signup by city ✅
/es/login                     → Spanish login ✅
/en/login                     → English login ✅
/es/reglas                    → Spanish rules ✅
/en/rules                     → English rules ✅
/es/elo                       → Spanish ELO ✅
/en/elo                       → English ELO ✅
/es/swiss                     → Spanish Swiss ✅
/en/swiss                     → English Swiss ✅
/es/activate                  → Spanish activation ✅
/en/activate                  → English activation ✅
/es/clubs                     → Spanish clubs directory (pending)
/en/clubs                     → English clubs directory (pending)
/es/clubs/malaga             → Spanish Málaga clubs (pending)
/en/clubs/malaga             → English Málaga clubs (pending)
/es/clubs/malaga/[club]      → Spanish club page (pending)
/en/clubs/malaga/[club]      → English club page (pending)
```

## 🏗️ Technical Architecture

### Internationalization Setup ✅ COMPLETED
1. **Middleware Configuration** ✅
   - Detect user language preference ✅
   - Redirect to appropriate locale ✅
   - Store preference in cookie ✅

2. **Routing Structure** ✅
   ```
   app/
   ├── [locale]/
   │   ├── page.js              → Homepage ✅
   │   ├── registro/            → Spanish routes ✅
   │   │   └── [ciudad]/        ✅
   │   ├── signup/              → English routes ✅
   │   │   └── [city]/          ✅
   │   ├── login/               → Login page ✅
   │   ├── reglas/              → Spanish rules ✅
   │   ├── rules/               → English rules ✅
   │   ├── elo/                 → ELO page ✅
   │   ├── swiss/               → Swiss page ✅
   │   ├── activate/            → Activation page ✅
   │   ├── not-found.js         → 404 page ✅
   │   ├── clubs/               → (pending)
   │   │   ├── page.js
   │   │   └── [city]/
   │   │       ├── page.js
   │   │       └── [club]/
   │   │           └── page.js
   ```

3. **Language Support** ✅
   - Spanish (es) - Primary ✅
   - English (en) - Secondary ✅
   - Browser detection fallback ✅
   - User preference persistence ✅

## 🎯 Multi-League Homepage Requirements

### Hero Section ✅
- Dynamic headline based on locale ✅
- List of available cities with active leagues ✅
- Clear CTA for registration ✅
- Language switcher in header ✅

### Features Section ✅
- League benefits ✅
- How it works ✅
- Player testimonials ✅
- Trust indicators ✅

### City Selection ✅
- Interactive map or grid ✅
- Show player count per city ✅
- "Coming soon" for future cities ✅
- Direct links to city signup ✅

### Content Strategy ✅
- City-specific landing pages ✅
- Local SEO optimization ✅
- Social proof per region ✅
- Testimonials from each city ✅

## 📱 Signup Flow Updates ✅

### Current Flow
1. User visits /signup/sotogrande
2. Fills form with league pre-selected
3. Submits to single league

### New Multi-City Flow ✅
1. User selects language (auto-detected) ✅
2. Visits homepage, sees available cities ✅
3. Clicks city → /[locale]/registro/[city] ✅
4. Form pre-fills city league ✅
5. Submit to appropriate league ✅

### Components Updated ✅
- Navigation component with locale support ✅
- Language switcher component ✅
- Footer with locale support ✅
- Signup forms for each city ✅

## 🔍 SEO Strategy (Next Phase)

### Target Keywords by City
**Málaga:**
- pistas de tenis málaga
- clubs de tenis málaga
- jugar tenis málaga
- tennis clubs malaga spain

**Valencia:**
- pistas de tenis valencia
- clubs tenis valencia
- tenis amateur valencia
- valencia tennis courts

**Sevilla:**
- pistas de tenis sevilla
- clubs de tenis sevilla
- donde jugar tenis sevilla
- seville tennis clubs

### Content Requirements
- 300+ words per city page
- Unique club descriptions
- Local tennis culture info
- Weather/seasonal content

## 📊 Success Metrics

### Phase 1 Goals (Month 1)
- [x] Multilingual routing live ✅
- [x] 3 cities with signup pages ✅
- [ ] Homepage conversion 5%+

### Phase 2 Goals (Month 2)
- [ ] 30+ clubs listed
- [ ] 1000+ organic visits
- [ ] 50+ signups from directory

### Phase 3 Goals (Month 3)
- [ ] 5000+ monthly organic visits
- [ ] Top 10 rankings for city keywords
- [ ] 100+ monthly signups

## 🚀 Implementation Summary

### Completed in Phase 0 ✅
1. **Internationalization Setup**
   - Implemented [locale] routing
   - Updated middleware for language detection
   - Created language context with useLocale hook
   - Updated navigation with language switcher

2. **Multi-League Homepage**
   - Designed city selection grid
   - Created responsive layout
   - Implemented language switcher
   - Updated hero content for multiple cities

3. **Signup Flow Updates**
   - Created [city] dynamic routes for both languages
   - Updated registration forms
   - Connected to league system
   - Ready for testing

4. **Page Migrations**
   - Login page with locale support
   - Rules pages (reglas/rules)
   - ELO page with locale
   - Swiss system page
   - Activation page
   - 404 page with locale

### Next Steps (Week 2)
1. Database setup for clubs
2. Create Club model
3. Admin interface for club management
4. Basic directory pages
5. Club detail pages

## 🔧 Technical Notes
- Using Next.js App Router with [locale] dynamic segments
- Middleware handles automatic locale detection and redirects
- Language preference stored in NEXT_LOCALE cookie
- All content files support both es/en languages
- Navigation automatically adjusts links based on current locale
- City signup pages validate city status before showing form

## 📝 Testing Checklist
- [ ] Language switching works correctly
- [ ] Locale persists across page navigation
- [ ] City signup forms submit to correct league
- [ ] 404 pages show in correct language
- [ ] Navigation links work for both locales
- [ ] Mobile responsive on all pages
- [ ] Browser language detection works
- [ ] Redirects from old URLs work