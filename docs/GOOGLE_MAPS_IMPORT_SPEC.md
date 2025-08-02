# Google Maps Club Import - Technical Specification (Phase 1)

## Overview

Automate tennis club data collection using Google Maps/Places API, eliminating manual data entry while ensuring high-quality, comprehensive club information.

## Key Features

### 1. Search & Discovery

```javascript
// Admin initiates search
Input: City name or Google Maps URL
Output: List of tennis clubs with preview data

// Search options:
- By city: "Find all tennis clubs in Marbella"
- By radius: "Tennis clubs within 10km of [coordinates]"
- By URL: "Import from https://maps.google.com/..."
```

### 2. Data Extraction from Google Places API

#### Available Data Points

- ✅ **Name** → `name`
- ✅ **Address** → `location.address`
- ✅ **Coordinates** → `location.coordinates`
- ✅ **Phone** → `contact.phone`
- ✅ **Website** → `contact.website`
- ✅ **Opening Hours** → `operatingHours`
- ✅ **Rating & Reviews** → Use for quality scoring
- ✅ **Photos** → `images.main` and `images.gallery`
- ✅ **Place ID** → Store for updates
- ⚠️ **Price Level** → Estimate pricing tier

#### Additional Enrichment

- Use reviews to detect amenities/services (keywords: "parking", "restaurant", "lessons")
- Check photos for court counts (manual verification)
- Generate descriptions from reviews summaries

## Implementation Architecture

### Frontend Component

```javascript
// New component: GoogleMapsImporter.js
<GoogleMapsImporter onImport={(clubs) => handleBulkImport(clubs)} />

// Features:
- Search input with city/URL options
- Results preview with selection checkboxes
- Field mapping preview
- Bulk import confirmation
```

### API Routes

```javascript
// /api/admin/clubs/google-import/search
POST: Search for clubs
Body: { query: "Marbella", type: "city|url|coordinates" }
Response: { clubs: [...], totalResults: 25 }

// /api/admin/clubs/google-import/details
POST: Get detailed info for selected clubs
Body: { placeIds: ["ChIJ..."] }
Response: { clubs: [...detailedData] }

// /api/admin/clubs/google-import/create
POST: Bulk create clubs
Body: { clubs: [...] }
Response: { created: 10, failed: 0, errors: [] }
```

## Data Mapping Strategy

```javascript
const mapGooglePlaceToClub = (place) => ({
  // Direct mappings
  name: place.name,
  location: {
    address: place.formatted_address,
    city: detectCity(place.address_components),
    postalCode: extractPostalCode(place.address_components),
    coordinates: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    },
    googleMapsUrl: place.url
  },
  contact: {
    phone: place.formatted_phone_number,
    website: place.website
  },
  
  // Generated fields
  slug: generateSlug(place.name),
  description: {
    es: generateDescription(place, 'es'),
    en: generateDescription(place, 'en')
  },
  
  // Estimated from price_level (0-4)
  pricing: estimatePricing(place.price_level),
  
  // Parse from opening_hours
  operatingHours: parseOpeningHours(place.opening_hours),
  
  // Default values (require manual update)
  courts: {
    total: 0, // Admin must fill
    surfaces: [],
    indoor: 0,
    outdoor: 0
  },
  
  // Detect from reviews/photos
  amenities: detectAmenities(place.reviews, place.photos),
  
  // Store Google data
  googlePlaceId: place.place_id,
  googleRating: place.rating,
  googleUserRatingsTotal: place.user_ratings_total
})
```

## Smart Features

### 1. Duplicate Detection

```javascript
// Before import, check:
- Exact name match
- Similar coordinates (within 100m)
- Same phone number
- Suggest merge if duplicate found
```

### 2. Quality Scoring

```javascript
const calculateQuality = (place) => {
  let score = 0
  if (place.rating >= 4.0) score += 20
  if (place.user_ratings_total > 50) score += 20
  if (place.website) score += 20
  if (place.photos?.length > 5) score += 20
  if (place.opening_hours) score += 20
  return score // 0-100
}
```

### 3. Auto-Description Generation

```javascript
const generateDescription = (place, lang) => {
  const template = lang === 'es' 
    ? `${place.name} es un club de tenis ubicado en ${city}. Con una valoración de ${rating} estrellas...`
    : `${place.name} is a tennis club located in ${city}. With a ${rating} star rating...`
  
  // Add details from reviews summary if available
  return enrichWithReviews(template, place.reviews)
}
```

## User Workflow

### 1. Admin clicks "Import from Google Maps"

### 2. Search Interface
- Enter city or paste Google Maps URL
- Select search radius (optional)
- Click "Search"

### 3. Results Preview
```
Found 12 tennis clubs in Marbella:
☑️ Club de Tenis Marbella (★4.5, 127 reviews)
☑️ Real Club de Tenis (★4.2, 89 reviews)
☐ Padel Club Costa (Not tennis - excluded)
```

### 4. Field Mapping Preview
- Show how Google data maps to club fields
- Highlight missing required fields
- Allow field editing before import

### 5. Bulk Import
- Review summary
- Confirm import
- Show progress bar
- Display results

## API Keys & Limits

### Required Google APIs
- Places API (Basic Data)
- Places API (Contact Data)
- Places API (Atmosphere Data)
- Geocoding API (backup)

### Rate Limits
- 1,000 requests/day (free tier)
- $17 per 1,000 requests after

### Cost Optimization
- Cache results for 30 days
- Batch requests where possible
- Only fetch details for selected clubs

## Security & Permissions

- Admin-only access
- API key stored in environment variables
- Rate limiting per admin user
- Audit log for imports

## Database Schema Updates

```javascript
// Add to Club model
googlePlaceId: {
  type: String,
  unique: true,
  sparse: true
},
googleData: {
  rating: Number,
  userRatingsTotal: Number,
  priceLevel: Number,
  lastSynced: Date
},
importSource: {
  type: String,
  enum: ['manual', 'google', 'csv'],
  default: 'manual'
}
```

## Error Handling

### Common Scenarios
- API rate limit exceeded
- Invalid API key
- No results found
- Network timeout
- Partial data available

### User Feedback
```javascript
// Success
"Successfully imported 10 clubs from Google Maps"

// Partial success
"Imported 8 of 10 clubs. 2 failed due to missing required data."

// Error
"Google Maps API limit reached. Please try again in 24 hours."
```

## Testing Strategy

### Unit Tests
- Data mapping functions
- Duplicate detection
- Quality scoring algorithm

### Integration Tests
- Mock Google API responses
- Test error scenarios
- Verify data persistence

### Manual Testing
- Import real clubs from each city
- Verify data accuracy
- Test edge cases

## Performance Considerations

- Implement pagination for large result sets
- Queue background jobs for bulk imports
- Show real-time progress updates
- Cache Google responses

## Future Enhancements (Phase 2+)

### Photo Analysis
- Use AI to count courts from aerial photos
- Extract court surface types from images
- Identify amenities from photos

### Review Mining
- Natural language processing for amenity detection
- Sentiment analysis for quality insights
- Extract pricing information from reviews

### Auto-Updates
- Periodic sync with Google for changes
- Alert admins to significant updates
- Track historical changes

### Competitor Analysis
- Import all clubs in an area
- Generate market reports
- Identify gaps in coverage

## Success Metrics

- **Time Saved**: 15 minutes → 2 minutes per club
- **Data Completeness**: 60% → 85% on import
- **Accuracy**: 95%+ for Google-provided fields
- **Admin Satisfaction**: Reduce manual data entry by 80%

## Implementation Timeline

### Week 1
- Set up Google Cloud project
- Implement search API
- Create basic UI

### Week 2
- Build data mapping
- Add duplicate detection
- Implement import flow

### Week 3
- Add error handling
- Create tests
- Polish UI/UX

### Week 4
- Deploy to staging
- User acceptance testing
- Documentation

## Conclusion

This Google Maps integration will dramatically reduce the time and effort required to populate the tennis club directory while ensuring high-quality, accurate data. The phased approach allows for quick wins in Phase 1 with room for advanced features in future phases.