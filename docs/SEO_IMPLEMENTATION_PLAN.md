# Tennis Club Directory SEO Implementation Plan

## 📋 Executive Summary
This implementation plan details how to build a multilingual tennis club directory for TenisDelParque to drive organic traffic and convert tennis players into league participants. The directory will initially cover Málaga, Valencia, and Sevilla with both Spanish and English versions.

## ✅ Implementation Checklist

### Phase 0: Foundation - Internationalization (CURRENT)
- [x] Implement locale-based routing (/es/, /en/)
- [x] Update middleware for language detection
- [x] Create language switcher component
- [x] Update existing pages to support locales
- [x] Prepare multi-league homepage
- [ ] Update signup flow for multiple cities
- [ ] Create dynamic city-based signup pages

### Phase 1: Database & Models (Week 1)
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

### New Structure (with locales) ✅
```
/es/                          → Spanish homepage ✅
/en/                          → English homepage ✅
/es/registro/[ciudad]         → Spanish signup by city
/en/signup/[city]            → English signup by city
/es/clubs                     → Spanish clubs directory
/en/clubs                     → English clubs directory
/es/clubs/malaga             → Spanish Málaga clubs
/en/clubs/malaga             → English Málaga clubs
/es/clubs/malaga/[club]      → Spanish club page
/en/clubs/malaga/[club]      → English club page
```

## 🏗️ Technical Architecture

### Internationalization Setup ✅
1. **Middleware Configuration** ✅
   - Detect user language preference ✅
   - Redirect to appropriate locale ✅
   - Store preference in cookie ✅

2. **Routing Structure** ✅
   ```
   app/
   ├── [locale]/
   │   ├── page.js              → Homepage ✅
   │   ├── registro/            → Spanish routes
   │   │   └── [ciudad]/
   │   ├── signup/              → English routes
   │   │   └── [city]/
   │   ├── clubs/
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

## 📱 Signup Flow Updates

### Current Flow
1. User visits /signup/sotogrande
2. Fills form with league pre-selected
3. Submits to single league

### New Multi-City Flow
1. User selects language (auto-detected) ✅
2. Visits homepage, sees available cities ✅
3. Clicks city → /[locale]/registro/[city]
4. Form pre-fills city league
5. Submit to appropriate league

### Database Considerations
- League slug matches city name
- Add city field to League model
- Update registration API
- Handle "coming soon" cities

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

## 📊 Success Metrics

### Phase 1 Goals (Month 1)
- [x] Multilingual routing live
- [ ] 3 cities with signup pages
- [ ] Homepage conversion 5%+

### Phase 2 Goals (Month 2)
- [ ] 30+ clubs listed
- [ ] 1000+ organic visits
- [ ] 50+ signups from directory

### Phase 3 Goals (Month 3)
- [ ] 5000+ monthly organic visits
- [ ] Top 10 rankings for city keywords
- [ ] 100+ monthly signups

## 🚀 Implementation Priority

### Week 1: Foundation
1. **Internationalization Setup** ✅
   - Implement [locale] routing ✅
   - Update middleware ✅
   - Create language context ✅
   - Update navigation ✅

2. **Multi-League Homepage** ✅
   - Design city selection ✅
   - Create responsive layout ✅
   - Implement language switcher ✅
   - Update hero content ✅

3. **Signup Flow Updates** (IN PROGRESS)
   - Create [city] dynamic routes
   - Update registration form
   - Connect to league system
   - Test full flow

### Week 2: Club Directory
1. Database setup
2. Admin interface
3. Basic directory pages
4. Club detail pages

### Week 3: SEO & Content
1. Add structured data
2. Create sitemaps
3. Write city content
4. Add club information

### Week 4: Launch & Monitor
1. Final testing
2. Submit to search engines
3. Monitor analytics
4. Iterate based on data

## 🔧 Technical Debt Considerations
- Maintain backward compatibility
- Update existing user flows
- Migrate current Sotogrande data
- Update email templates
- Update admin panel routes

## 📝 Notes
- Start with Spanish as primary language ✅
- English translations can be basic initially ✅
- Focus on Málaga as pilot city
- Use existing design system ✅
- Leverage current authentication