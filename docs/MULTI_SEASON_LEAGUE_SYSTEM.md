# Multi-Season League System Design

## Overview

This document outlines the new multi-season and multi-skill-level league system implemented for Tenis del Parque. The system is designed to support multiple seasons per city and multiple skill levels while maintaining backward compatibility.

## 🎯 Key Features

- **Multiple Seasons**: Create multiple seasons for the same league (Spring 2025, Summer 2025, etc.)
- **Skill Levels**: Support for different skill levels (General, Beginners, Intermediate, Advanced)
- **City-based Organization**: Leagues are organized by cities with proper geographic coordination
- **Flexible Scheduling**: Each season can have its own dates, pricing, and configuration
- **Coming Soon Support**: Leagues can be marked as "coming soon" with expected launch dates
- **Backward Compatibility**: Existing leagues continue to work without modification

## 🏗️ Database Design

### League Model Structure

```javascript
{
  // Basic Information
  name: "Liga Sotogrande Primavera 2025",
  slug: "sotogrande-spring-2025",
  
  // NEW: Skill Level Support
  skillLevel: "all" | "beginner" | "intermediate" | "advanced",
  
  // NEW: Season Information
  season: {
    year: 2025,
    type: "spring" | "summer" | "autumn" | "winter" | "annual",
    number: 1 // For multiple seasons per year
  },
  
  // City Reference
  city: ObjectId, // References City model
  
  // NEW: Enhanced Season Configuration
  seasonConfig: {
    startDate: Date,
    endDate: Date,
    registrationStart: Date,
    registrationEnd: Date,
    maxPlayers: 20,
    minPlayers: 8,
    price: {
      amount: 0,
      currency: "EUR",
      isFree: true
    }
  },
  
  // Status
  status: "active" | "inactive" | "coming_soon" | "registration_open" | "completed",
  expectedLaunchDate: Date, // For coming_soon status
  
  // NEW: Parent League Reference (for grouping seasons)
  parentLeague: ObjectId, // References another League
  
  // Stats
  stats: {
    totalPlayers: 0,
    totalMatches: 0,
    registeredPlayers: 0
  }
}
```

### Unique Index

The system prevents duplicate leagues using a compound unique index:
```javascript
{ city: 1, skillLevel: 1, 'season.year': 1, 'season.type': 1, 'season.number': 1 }
```

## 🔧 How to Use

### Creating a New Season for Existing League

1. **Via Admin Panel**:
   - Go to `/admin/leagues`
   - Click "🏆 Create Season" button
   - Select "New Season" option
   - Choose base league from dropdown
   - Configure season details
   - Submit

2. **Via API**:
   ```javascript
   POST /api/admin/leagues/seasons/create
   {
     isNewLeague: false,
     baseLeagueId: "existing_league_id",
     seasonData: {
       season: {
         year: 2025,
         type: "summer",
         number: 1
       },
       seasonConfig: {
         startDate: "2025-06-21",
         endDate: "2025-09-22",
         maxPlayers: 20,
         price: { amount: 50, currency: "EUR", isFree: false }
       },
       status: "coming_soon",
       expectedLaunchDate: "2025-05-01"
     }
   }
   ```

### Creating a New League (Different Skill Level)

1. **Via Admin Panel**:
   - Go to `/admin/leagues`
   - Click "🏆 Create Season" button
   - Select "New League" option
   - Choose city and skill level
   - Configure season details
   - Submit

2. **Via API**:
   ```javascript
   POST /api/admin/leagues/seasons/create
   {
     isNewLeague: true,
     seasonData: {
       name: "Liga Sotogrande Principiantes Primavera 2025",
       cityId: "city_object_id",
       skillLevel: "beginner",
       season: {
         year: 2025,
         type: "spring",
         number: 1
       },
       seasonConfig: {
         startDate: "2025-03-21",
         endDate: "2025-06-20",
         maxPlayers: 16,
         price: { amount: 30, currency: "EUR", isFree: false }
       },
       status: "coming_soon",
       expectedLaunchDate: "2025-02-15"
     }
   }
   ```

## 📋 League Naming Convention

The system automatically generates league names following this pattern:

### Spanish
- **General League**: `Liga {Ciudad} {Temporada} {Año}`
  - Example: `Liga Sotogrande Primavera 2025`
- **Skill-specific League**: `Liga {Ciudad} {Nivel} {Temporada} {Año}`
  - Example: `Liga Sotogrande Principiantes Primavera 2025`
- **Multiple Seasons**: `Liga {Ciudad} {Nivel} {Temporada} {Año} - Temporada {Número}`
  - Example: `Liga Sotogrande Intermedio Verano 2025 - Temporada 2`

### English
- **General League**: `{City} League {Season} {Year}`
  - Example: `Sotogrande League Spring 2025`
- **Skill-specific League**: `{City} {Level} League {Season} {Year}`
  - Example: `Sotogrande Beginners League Spring 2025`

## 🎮 Admin Panel Features

### Enhanced Leagues Page (`/admin/leagues`)

- **Quick Stats Dashboard**: Shows counts of active, coming soon, and registration open leagues
- **Create Season Button**: Prominent button to create new seasons
- **Enhanced League Cards**: Display season info, skill level badges, and pricing
- **Skill Level Indicators**: Color-coded badges for different skill levels
- **Launch Date Display**: Shows expected launch dates for coming soon leagues

### Create Season Page (`/admin/leagues/seasons/create`)

- **Dual Mode**: Create new season vs create new league
- **Auto-naming**: Automatically generates league names based on selections
- **Comprehensive Configuration**: Full season setup with dates, pricing, limits
- **Validation**: Prevents duplicate leagues and validates date ranges

## 🌐 Public API Updates

### Enhanced Leagues Endpoint (`/api/leagues`)

Returns enhanced league data with:

```javascript
{
  leagues: [
    {
      _id: "league_id",
      name: "Liga Sotogrande Primavera 2025",
      slug: "sotogrande-spring-2025",
      
      // Enhanced display info
      fullName: {
        es: "Liga Sotogrande Primavera 2025",
        en: "Sotogrande League Spring 2025"
      },
      
      // Season information
      season: {
        year: 2025,
        type: "spring",
        number: 1,
        displayName: {
          es: "Primavera 2025",
          en: "Spring 2025"
        }
      },
      
      // Skill level information
      skillLevel: {
        value: "all",
        displayName: {
          es: "General",
          en: "General"
        }
      },
      
      // Registration status
      isRegistrationOpen: true,
      
      // Season configuration
      seasonConfig: {
        startDate: "2025-03-21",
        endDate: "2025-06-20",
        maxPlayers: 20,
        price: { amount: 0, currency: "EUR", isFree: true }
      }
    }
  ],
  
  // Grouped by city and skill level
  leagueGroups: [
    {
      city: { name: { es: "Sotogrande" }, slug: "sotogrande" },
      skillLevel: { value: "all", displayName: { es: "General" } },
      leagues: [/* leagues array */]
    }
  ],
  
  stats: {
    total: 4,
    active: 1,
    comingSoon: 2,
    registrationOpen: 1,
    cities: 2,
    skillLevels: 3
  }
}
```

## 🔄 Migration Strategy

### For Existing Leagues

The system maintains backward compatibility:

1. **Existing leagues** continue to work without modification
2. **Default values** are applied:
   - `skillLevel: "all"`
   - `season.year: current year`
   - `season.type: "annual"`
   - `season.number: 1`

### For New Leagues

1. **Always specify** city, skill level, and season information
2. **Use the admin panel** for easy creation with validation
3. **Follow naming conventions** for consistency

## 🚀 Example Scenarios

### Scenario 1: Sotogrande New Season
You want to create "Liga Sotogrande Verano 2025" as a new season:

1. Use existing Sotogrande league as base
2. Create new season with `type: "summer"`, `year: 2025`
3. Set as "coming_soon" with launch date
4. Configure pricing and player limits

### Scenario 2: Multi-Level Leagues
You want to create beginner, intermediate, and advanced leagues for Marbella:

1. Create three separate leagues:
   - `Liga Marbella Principiantes Primavera 2025`
   - `Liga Marbella Intermedio Primavera 2025`  
   - `Liga Marbella Avanzado Primavera 2025`
2. Each with different pricing and configurations
3. All set as "coming_soon" initially

### Scenario 3: Multiple Seasons per Year
You want Spring and Summer seasons for the same skill level:

1. Create first season: `Liga Málaga Intermedio Primavera 2025`
2. Create second season: `Liga Málaga Intermedio Verano 2025`
3. System prevents duplicates and manages transitions

## ⚠️ Important Notes

1. **Unique Constraint**: Cannot create duplicate leagues (same city + skill + season)
2. **City Requirement**: All leagues must be linked to a City model
3. **Slug Generation**: Automatic based on city, skill level, and season
4. **Parent League**: Used for grouping related seasons (optional)
5. **Status Management**: Proper status transitions are important for public display

## 🎯 Benefits

1. **Scalability**: Support for unlimited seasons and skill levels
2. **Organization**: Clear structure for managing complex league hierarchies
3. **Flexibility**: Each season can have unique configuration
4. **User Experience**: Better categorization for players
5. **Future-Proof**: Extensible design for additional features

## 📝 Next Steps

1. **Test the system** with your specific Sotogrande use case
2. **Create sample leagues** using the admin panel
3. **Verify public display** on leagues page
4. **Plan migration** of any existing data if needed
5. **Train team** on new admin interface

This system provides the foundation for your multi-season, multi-skill-level league management while maintaining the simplicity and user experience of the current platform.
