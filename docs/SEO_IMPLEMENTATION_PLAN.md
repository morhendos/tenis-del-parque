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
- [x] Fix page migrations to preserve original functionality
- [x] Implement comprehensive SEO metadata structure
- [x] Fix font loading issues with language switching

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
- [x] Add basic structured data (Organization schema) ✅
- [ ] Add more structured data (LocalBusiness, SportsActivity)
- [x] Implement hreflang tags ✅
- [ ] Create XML sitemaps
- [x] Add meta tags optimization ✅
- [ ] Submit to Google Search Console
- [ ] Add Open Graph images
- [ ] Create robots.txt
- [ ] Implement canonical URLs

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
   ├── layout.js                → Root layout with SEO metadata ✅
   ├── [locale]/
   │   ├── layout.js            → Locale layout with fonts ✅
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
   - Font loading fix across languages ✅

### SEO Implementation ✅ COMPLETED
1. **Root Layout SEO** ✅
   - Comprehensive metadata configuration ✅
   - Title template system ✅
   - Open Graph tags ✅
   - Twitter Card tags ✅
   - Robots configuration ✅
   - Viewport settings ✅
   - Organization schema (JSON-LD) ✅
   - Site verification support ✅

2. **Locale-Specific SEO** ✅
   - Dynamic meta titles and descriptions ✅
   - Hreflang alternate links ✅
   - Locale-specific Open Graph tags ✅
   - Language-based content ✅

3. **Technical Fixes** ✅
   - Fixed Swiss page structure preservation ✅
   - Fixed ELO page structure preservation ✅
   - Fixed Rules page navigation and key warnings ✅
   - Fixed font loading on language switch ✅

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
- All page components restored to original functionality ✅

## 🔍 SEO Strategy

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

### Technical SEO TODO
1. **Images** (High Priority)
   - [ ] Create og-image.png (1200x630px)
   - [ ] Create twitter-image.png (1200x600px)
   - [ ] Create logo.png (square format)
   - [ ] Add favicon.ico
   - [ ] Add apple-touch-icon.png

2. **Files** (High Priority)
   - [ ] Create robots.txt
   - [ ] Generate sitemap.xml
   - [ ] Create manifest.json for PWA

3. **Environment Variables**
   - [ ] Add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
   - [ ] Add NEXT_PUBLIC_YANDEX_VERIFICATION
   - [ ] Configure GA_MEASUREMENT_ID
   - [ ] Configure CLARITY_ID

4. **Schema Enhancement**
   - [ ] Add LocalBusiness schema for each club
   - [ ] Add SportsActivity schema
   - [ ] Add BreadcrumbList schema
   - [ ] Add WebSite schema with search

## 📊 Success Metrics

### Phase 1 Goals (Month 1)
- [x] Multilingual routing live ✅
- [x] 3 cities with signup pages ✅
- [x] SEO foundation implemented ✅
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
   - Rules pages (reglas/rules) - fixed navigation
   - ELO page with locale - restored original structure
   - Swiss system page - restored original structure
   - Activation page
   - 404 page with locale

5. **SEO Foundation**
   - Comprehensive metadata in root layout
   - Organization schema implementation
   - Hreflang tags for all pages
   - Open Graph and Twitter Card setup
   - Font loading fix for language switching
   - Proper robots and viewport configuration

### Next Steps (Week 2)
1. Create required SEO images
2. Set up robots.txt and sitemap
3. Database setup for clubs
4. Create Club model
5. Admin interface for club management
6. Basic directory pages
7. Club detail pages

## 🔧 Technical Notes
- Using Next.js App Router with [locale] dynamic segments
- Middleware handles automatic locale detection and redirects
- Language preference stored in NEXT_LOCALE cookie
- All content files support both es/en languages
- Navigation automatically adjusts links based on current locale
- City signup pages validate city status before showing form
- Root layout handles global SEO, locale layout handles fonts and analytics
- Font loading issue resolved by moving imports to locale layout

## 📝 Testing Checklist
- [x] Language switching works correctly ✅
- [x] Locale persists across page navigation ✅
- [x] City signup forms submit to correct league ✅
- [x] 404 pages show in correct language ✅
- [x] Navigation links work for both locales ✅
- [x] Mobile responsive on all pages ✅
- [x] Browser language detection works ✅
- [x] Redirects from old URLs work ✅
- [x] Swiss page displays correctly ✅
- [x] ELO page displays correctly ✅
- [x] Rules page sidebar navigation works ✅
- [x] Fonts load correctly on language switch ✅
- [ ] SEO metadata renders correctly
- [ ] Schema.org structured data validates
- [ ] Open Graph preview works

## 🐛 Known Issues Fixed
1. ✅ Swiss and ELO pages were completely rewritten - restored to original structure
2. ✅ Rules page key warnings - added proper id fields
3. ✅ Rules page sidebar navigation - restored useActiveSection functionality
4. ✅ Font loading on language switch - moved font imports to locale layout