# Google Maps API Setup Guide

## Overview

This guide explains how to set up Google Maps API for the Tennis Club import feature in production.

## Current Implementation Status

✅ **Completed:**
- Frontend GoogleMapsImporter component
- API routes with mock data
- Data mapping from Google Places to Club format
- Duplicate detection
- Bulk import functionality
- UI/UX for the complete import flow

⚠️ **Using Mock Data:**
- Currently returns hardcoded test clubs
- No actual Google API calls yet
- Perfect for development and testing

## Setting Up Google Maps API

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable billing (required for Maps APIs)

### 2. Enable Required APIs

Enable these APIs in your project:
- **Places API** - For searching tennis clubs
- **Places API (New)** - For detailed place information
- **Geocoding API** - For address/coordinate conversion

### 3. Create API Key

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Restrict the API key:
   - Application restrictions: HTTP referrers
   - Website restrictions: Add your domains
   - API restrictions: Select only the APIs above

### 4. Add to Environment Variables

```env
# .env.local
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 5. Install Google Maps Client

```bash
npm install @googlemaps/google-maps-services-js
```

## Implementing Real API Calls

Replace the mock data in `/api/admin/clubs/google-import/search/route.js` with:

```javascript
import { Client } from '@googlemaps/google-maps-services-js'

const googleMapsClient = new Client({})

async function searchGooglePlaces(query, type, radius) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }

  if (type === 'city') {
    const response = await googleMapsClient.textSearch({
      params: {
        key: apiKey,
        query: `tennis clubs in ${query}`,
        language: 'es',
        type: 'establishment',
        radius: radius || 5000
      }
    })
    return response.data.results
  }
  
  // Add other search types...
}
```

## Testing the Integration

### 1. With Mock Data (Current)
- Click "Import from Google Maps"
- Search for "Marbella" or "Estepona"
- Select clubs and import
- Verify clubs appear in the list

### 2. With Real API (Production)
- Ensure API key is configured
- Test with small radius first
- Monitor API usage in Google Console
- Check for rate limits

## API Usage & Costs

### Free Tier
- $200 monthly credit
- ~40,000 basic requests
- ~6,600 detailed place requests

### Pricing (after free tier)
- Text Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests
- Geocoding: $5 per 1,000 requests

### Cost Optimization
- Cache search results for 30 days
- Only fetch details for selected clubs
- Use radius limits
- Implement user quotas

## Error Handling

The system handles these scenarios:
- ❌ API key missing
- ❌ Rate limit exceeded
- ❌ No results found
- ❌ Network errors
- ❌ Invalid search queries

## Security Best Practices

1. **Never expose API key in frontend**
   - All API calls through backend routes
   - API key only in server environment

2. **Implement rate limiting**
   ```javascript
   // Example rate limit
   const userSearchCount = await redis.incr(`search:${userId}:${date}`)
   if (userSearchCount > 100) {
     throw new Error('Daily search limit exceeded')
   }
   ```

3. **Log all imports**
   - Track who imported what
   - Monitor for abuse
   - Audit trail for billing

## Next Steps

1. 🔑 Add Google Maps API key to environment
2. 🔄 Update API routes to use real Google client
3. 🧪 Test with small batches first
4. 📊Monitor API usage and costs
5. 🚀 Deploy to production

## Troubleshooting

### "API key not valid"
- Check key restrictions
- Verify APIs are enabled
- Ensure billing is active

### "No results found"
- Try broader search terms
- Increase search radius
- Check language settings

### "Rate limit exceeded"
- Implement caching
- Add request delays
- Upgrade API quota

## Support

For issues or questions:
1. Check Google Maps API documentation
2. Review error logs in Google Console
3. Test with Postman/curl first
4. Contact Google Cloud support