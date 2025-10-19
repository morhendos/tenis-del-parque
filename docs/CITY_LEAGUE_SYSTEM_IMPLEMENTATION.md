# City-Based League System - Using Existing Structure

## ✅ What We Already Have

### League Model (`lib/models/League.js`)
- ✅ `skillLevel` (all, beginner, intermediate, advanced)
- ✅ `displayOrder` (for sorting)
- ✅ `city` (reference to City model)
- ✅ `season.year` and `season.type`
- ✅ `status` (active, coming_soon, registration_open, etc.)
- ✅ Methods: `getCitySlug()`, `getCityName()`, `getSkillLevelName()`

### City Model (`lib/models/City.js`)
- ✅ `slug` (for URLs)
- ✅ `name.es` and `name.en`
- ✅ `status` (active/inactive)
- ✅ `displayOrder`
- ✅ `images.main` and `images.gallery`
- ✅ Static method: `getActive()`

### Current Cities in DB
- Sotogrande
- Estepona
- Marbella
- Malaga

---

## 🎯 What We Need to Build (Presentation Only)

1. City directory page (`/leagues`)
2. City-specific league page (`/leagues/[city]`)
3. API to fetch leagues by city
4. Components to display leagues grouped by season

---

## Implementation Steps

### Step 1: Create City Leagues API
**New File**: `app/api/cities/[slug]/leagues/route.js`

```javascript
import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const citySlug = params.slug
    
    // Find city by slug
    const city = await City.findOne({ slug: citySlug, status: 'active' })
    
    if (!city) {
      return Response.json({ error: 'City not found' }, { status: 404 })
    }
    
    // Find all leagues for this city
    const leagues = await League.find({ 
      city: city._id,
      status: { $in: ['active', 'coming_soon', 'registration_open', 'completed'] }
    })
    .populate('city', 'slug name images')
    .sort({ 
      'season.year': -1,           // Newest season first
      'season.type': 1,            // Spring > Summer > Autumn > Winter
      displayOrder: 1,             // Then by display order
      skillLevel: 1                // Then by skill level
    })
    
    // Group by season status
    const now = new Date()
    const grouped = {
      current: [],
      upcoming: [],
      past: []
    }
    
    leagues.forEach(league => {
      const start = new Date(league.seasonConfig?.startDate)
      const end = new Date(league.seasonConfig?.endDate)
      
      if (now >= start && now <= end) {
        grouped.current.push(league)
      } else if (now < start) {
        grouped.upcoming.push(league)
      } else {
        grouped.past.push(league)
      }
    })
    
    return Response.json({
      city: {
        slug: city.slug,
        name: city.name,
        images: city.images
      },
      leagues: grouped,
      total: leagues.length
    })
    
  } catch (error) {
    console.error('Error fetching city leagues:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Test**: `GET /api/cities/sotogrande/leagues`

---

### Step 2: Create City League Page
**New File**: `app/[locale]/leagues/[city]/page.js`

```javascript
import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import { notFound } from 'next/navigation'
import CityLeagueHero from '@/components/leagues/CityLeagueHero'
import LeagueSeasonSection from '@/components/leagues/LeagueSeasonSection'

export async function generateStaticParams() {
  await dbConnect()
  const cities = await City.find({ status: 'active' }).select('slug')
  
  const locales = ['en', 'es']
  const params = []
  
  cities.forEach(city => {
    locales.forEach(locale => {
      params.push({ locale, city: city.slug })
    })
  })
  
  return params
}

export async function generateMetadata({ params }) {
  const { city: citySlug, locale } = params
  
  await dbConnect()
  const city = await City.findOne({ slug: citySlug, status: 'active' })
  
  if (!city) return {}
  
  const cityName = city.name[locale] || city.name.es
  
  return {
    title: `${cityName} Tennis Leagues | Tenis del Parque`,
    description: `Join tennis leagues in ${cityName}. Multiple skill levels available.`
  }
}

export default async function CityLeaguePage({ params }) {
  const { city: citySlug, locale } = params
  
  await dbConnect()
  
  // Fetch city
  const city = await City.findOne({ slug: citySlug, status: 'active' })
  
  if (!city) {
    notFound()
  }
  
  // Fetch leagues for this city
  const leagues = await League.find({ 
    city: city._id,
    status: { $in: ['active', 'coming_soon', 'registration_open', 'completed'] }
  })
  .populate('city', 'slug name images')
  .sort({ 
    'season.year': -1,
    'season.type': 1,
    displayOrder: 1,
    skillLevel: 1
  })
  .lean()
  
  // Group by season status
  const now = new Date()
  const grouped = {
    current: [],
    upcoming: [],
    past: []
  }
  
  leagues.forEach(league => {
    const start = new Date(league.seasonConfig?.startDate)
    const end = new Date(league.seasonConfig?.endDate)
    
    if (now >= start && now <= end) {
      grouped.current.push(league)
    } else if (now < start) {
      grouped.upcoming.push(league)
    } else {
      grouped.past.push(league)
    }
  })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CityLeagueHero city={city} locale={locale} />
      
      <div className="container mx-auto px-4 py-12">
        {grouped.current.length > 0 && (
          <LeagueSeasonSection
            title={locale === 'es' ? 'Temporada Actual' : 'Current Season'}
            leagues={grouped.current}
            locale={locale}
            status="current"
          />
        )}
        
        {grouped.upcoming.length > 0 && (
          <LeagueSeasonSection
            title={locale === 'es' ? 'Próxima Temporada' : 'Upcoming Season'}
            leagues={grouped.upcoming}
            locale={locale}
            status="upcoming"
          />
        )}
        
        {grouped.past.length > 0 && (
          <LeagueSeasonSection
            title={locale === 'es' ? 'Temporadas Anteriores' : 'Past Seasons'}
            leagues={grouped.past}
            locale={locale}
            status="past"
            collapsible
          />
        )}
      </div>
    </div>
  )
}
```

---

### Step 3: Update Main Leagues Page
**File**: `app/[locale]/leagues/page.js`

Transform to city directory:

```javascript
import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Tennis Leagues by City | Tenis del Parque',
  description: 'Browse tennis leagues in Sotogrande, Marbella, Estepona, and Malaga'
}

export default async function LeaguesPage({ params }) {
  const { locale } = params
  
  await dbConnect()
  
  // Fetch all active cities
  const cities = await City.find({ status: 'active' })
    .sort({ displayOrder: 1, 'name.es': 1 })
    .lean()
  
  // Get league count per city
  for (let city of cities) {
    const count = await League.countDocuments({
      city: city._id,
      status: { $in: ['active', 'coming_soon', 'registration_open'] }
    })
    city.leagueCount = count
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            {locale === 'es' ? 'Elige Tu Ciudad' : 'Choose Your City'}
          </h1>
          <p className="text-xl opacity-90">
            {locale === 'es' 
              ? 'Selecciona una ciudad para ver las ligas disponibles' 
              : 'Select a city to view available tennis leagues'}
          </p>
        </div>
      </div>
      
      {/* City Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cities.map(city => (
            <Link
              key={city._id}
              href={`/${locale}/leagues/${city.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* City Image */}
                <div className="relative h-48">
                  {city.images?.main ? (
                    <Image
                      src={city.images.main}
                      alt={city.name[locale] || city.name.es}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                  )}
                </div>
                
                {/* City Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {city.name[locale] || city.name.es}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    {city.leagueCount > 0 
                      ? `${city.leagueCount} ${locale === 'es' ? 'ligas activas' : 'active leagues'}`
                      : locale === 'es' ? 'Próximamente' : 'Coming soon'}
                  </p>
                  
                  <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                    {locale === 'es' ? 'Ver Ligas' : 'View Leagues'}
                    <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### Step 4: Create Components

#### CityLeagueHero.js
**New File**: `components/leagues/CityLeagueHero.js`

```javascript
import Image from 'next/image'
import Link from 'next/link'

export default function CityLeagueHero({ city, locale }) {
  const cityName = city.name[locale] || city.name.es
  
  return (
    <div className="relative h-[400px] bg-gradient-to-r from-emerald-600 to-teal-600">
      {/* Background Image */}
      {city.images?.main && (
        <div className="absolute inset-0 opacity-40">
          <Image
            src={city.images.main}
            alt={cityName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        {/* Breadcrumb */}
        <nav className="mb-4 text-white/80">
          <Link href={`/${locale}/leagues`} className="hover:text-white">
            {locale === 'es' ? 'Ciudades' : 'Cities'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{cityName}</span>
        </nav>
        
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          {cityName}
        </h1>
        <p className="text-xl text-white/90 max-w-2xl">
          {locale === 'es' 
            ? 'Descubre nuestras ligas de tenis disponibles' 
            : 'Discover our available tennis leagues'}
        </p>
      </div>
    </div>
  )
}
```

#### LeagueSeasonSection.js
**New File**: `components/leagues/LeagueSeasonSection.js`

```javascript
'use client'
import { useState } from 'react'
import LeagueLevelCard from './LeagueLevelCard'

export default function LeagueSeasonSection({ 
  title, 
  leagues, 
  locale, 
  status,
  collapsible = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  
  if (leagues.length === 0) return null
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2"
          >
            {isExpanded 
              ? (locale === 'es' ? 'Ocultar' : 'Hide')
              : (locale === 'es' ? 'Mostrar' : 'Show')}
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map(league => (
            <LeagueLevelCard 
              key={league._id} 
              league={league} 
              locale={locale}
              status={status}
            />
          ))}
        </div>
      )}
    </section>
  )
}
```

#### LeagueLevelCard.js
**New File**: `components/leagues/LeagueLevelCard.js`

```javascript
import Link from 'next/link'

const skillLevelColors = {
  advanced: 'bg-amber-100 text-amber-800 border-amber-300',
  intermediate: 'bg-gray-100 text-gray-800 border-gray-300',
  beginner: 'bg-orange-100 text-orange-800 border-orange-300',
  all: 'bg-blue-100 text-blue-800 border-blue-300'
}

const skillLevelNames = {
  es: {
    advanced: 'Avanzado',
    intermediate: 'Intermedio',
    beginner: 'Principiantes',
    all: 'Todos los niveles'
  },
  en: {
    advanced: 'Advanced',
    intermediate: 'Intermediate',
    beginner: 'Beginners',
    all: 'All Levels'
  }
}

export default function LeagueLevelCard({ league, locale, status }) {
  const citySlug = league.city?.slug || 'unknown'
  const skillName = skillLevelNames[locale][league.skillLevel] || league.skillLevel
  const colorClass = skillLevelColors[league.skillLevel] || skillLevelColors.all
  
  // Build season name
  const seasonName = `${league.season.type} ${league.season.year}`
  
  // Registration status
  const isRegistrationOpen = league.status === 'registration_open'
  const isFull = league.stats?.registeredPlayers >= league.seasonConfig?.maxPlayers
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header with skill level */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colorClass}`}>
            {skillName}
          </span>
          {status === 'current' && (
            <span className="text-xs font-medium text-emerald-600">
              {locale === 'es' ? 'En Curso' : 'Active'}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mt-3">
          {league.name}
        </h3>
        
        <p className="text-sm text-gray-600 mt-1 capitalize">
          {seasonName}
        </p>
      </div>
      
      {/* Stats */}
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">{locale === 'es' ? 'Jugadores' : 'Players'}</p>
            <p className="font-bold text-gray-900">
              {league.stats?.registeredPlayers || 0} / {league.seasonConfig?.maxPlayers || 20}
            </p>
          </div>
          <div>
            <p className="text-gray-600">{locale === 'es' ? 'Precio' : 'Price'}</p>
            <p className="font-bold text-gray-900">
              {league.seasonConfig?.price?.isFree 
                ? (locale === 'es' ? 'Gratis' : 'Free')
                : `€${league.seasonConfig?.price?.amount || 0}`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-6 pt-4">
        <div className="flex gap-3">
          <Link
            href={`/${locale}/${citySlug}/liga/${league.slug}`}
            className="flex-1 text-center py-2 px-4 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
          >
            {locale === 'es' ? 'Ver Detalles' : 'View Details'}
          </Link>
          
          {isRegistrationOpen && !isFull && (
            <Link
              href={`/${locale}/registro/${league.slug}`}
              className="flex-1 text-center py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              {locale === 'es' ? 'Inscribirse' : 'Register'}
            </Link>
          )}
        </div>
        
        {isFull && isRegistrationOpen && (
          <p className="text-sm text-center text-amber-600 mt-2 font-medium">
            {locale === 'es' ? 'Liga Completa' : 'League Full'}
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## Implementation Checklist

### ✅ Phase 1: API (COMPLETE)
- [x] Create `/app/api/cities/[slug]/leagues/route.js`
- [x] Test with: `http://localhost:3000/api/cities/sotogrande/leagues`
- [x] Verify grouping by season status works
- [x] Test with all 4 cities

### ✅ Phase 2: City League Page (COMPLETE)
- [x] Create `/app/[locale]/leagues/[city]/page.js`
- [x] Create `CityLeagueHero` component
- [x] Create `LeagueSeasonSection` component
- [x] Create `LeagueLevelCard` component
- [x] Test responsive design
- [x] Test with leagues at different skill levels

### ✅ Phase 3: Main Leagues Directory (COMPLETE)
- [x] Update `/app/[locale]/leagues/page.js`
- [x] Create `CityCard` component
- [x] Test city grid displays correctly
- [x] Test league counts are accurate
- [x] Test city images display

### ✅ Phase 4: Admin Panel (ALREADY EXISTS)
- [x] Admin can set skillLevel when creating leagues
- [x] Admin can set displayOrder for sorting
- [x] City selector already works

### 🔍 Phase 5: Final Testing & QA
- [x] Test all 4 city pages load correctly (Sotogrande, Estepona, Marbella, Málaga)
- [x] Test bilingual content (EN/ES) - Titles and metadata working
- [ ] Test navigation flow (leagues -> city -> league detail) - Manual verification needed
- [ ] Test with no leagues (empty state) - Check Estepona/Marbella/Málaga
- [x] Test with multiple skill levels display (Gold/Silver/Bronze showing on Sotogrande)
- [ ] Test registration links work - Manual click test needed
- [ ] Mobile responsive testing - Manual verification needed

---

## Ready to Start!

Everything is already set up in the database. We just need to build the presentation layer using the existing fields.

**Next Action**: Start with Phase 1 - Create the API endpoint?
