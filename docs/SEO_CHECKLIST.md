# SEO Implementation Checklist

## ✅ Completed SEO Assets

### Technical Files
- [x] **robots.txt** - Controls crawler access
- [x] **sitemap.xml** - Lists all pages for search engines
- [x] **manifest.json** - PWA configuration
- [x] **generateSitemap.js** - Script to update sitemap dynamically

### Image Placeholders (SVG)
- [x] **favicon.svg** - Browser tab icon placeholder
- [x] **og-image.svg** - Social sharing image placeholder

## 📋 TODO: Convert SVG to Production Images

### High Priority
1. **favicon.ico** (32x32px)
   - Convert favicon.svg to .ico format
   - Use online converter or image editor
   - Place in /public/favicon.ico

2. **og-image.png** (1200x630px)
   - Convert og-image.svg to PNG
   - Or create custom image with your branding
   - Optimize file size (under 300KB)

3. **twitter-image.png** (1200x600px)
   - Similar to og-image but optimized for Twitter
   - Can reuse og-image with slight modifications

4. **apple-touch-icon.png** (180x180px)
   - App icon for iOS devices
   - Should be your logo on solid background

### Medium Priority
5. **logo-192.png** (192x192px)
   - For PWA manifest
   - Android app icon

6. **logo-512.png** (512x512px)
   - For PWA manifest
   - High-res app icon

## 🔧 Next Steps

### 1. Update Sitemap with Real Clubs
After adding real club data:
```bash
node scripts/generateSitemap.js
```

### 2. Submit to Google Search Console
1. Verify domain ownership for www.tenisdp.es
2. Submit sitemap: https://www.tenisdp.es/sitemap.xml
3. Request indexing for key pages

### 3. Add Structured Data
Add to club detail pages (`/[locale]/clubs/[city]/[slug]/page.js`):
```javascript
// LocalBusiness schema for each club
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": club.name,
  "description": club.description[locale],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": club.location.address,
    "addressLocality": club.location.city,
    "postalCode": club.location.postalCode,
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": club.location.coordinates.lat,
    "longitude": club.location.coordinates.lng
  },
  "url": `https://www.tenisdp.es/${locale}/clubs/${club.location.city}/${club.slug}`,
  "telephone": club.contact.phone,
  "email": club.contact.email
}
```

### 4. Monitor Performance
- Set up Google Analytics
- Configure Microsoft Clarity
- Track organic traffic growth
- Monitor keyword rankings

## 📊 SEO Goals

### Month 1
- [ ] All technical SEO files in place
- [ ] 10+ real tennis clubs listed
- [ ] Indexed in Google Search Console
- [ ] First organic visitors

### Month 2
- [ ] 500+ organic visits/month
- [ ] Ranking for "[city] tennis clubs"
- [ ] 20+ club listings
- [ ] 5% conversion rate

### Month 3
- [ ] 2000+ organic visits/month
- [ ] Top 10 for main keywords
- [ ] Expand to new cities
- [ ] Local backlinks acquired

## 🎾 Club Data Guidelines

When adding real clubs, ensure:
1. Unique, detailed descriptions (300+ words)
2. Complete contact information
3. Accurate coordinates for map display
4. High-quality photos (when available)
5. Correct amenities and services
6. Proper categorization with tags

## 📝 Content Tips

1. **City Pages**: Write unique content about tennis culture in each city
2. **Club Pages**: Include parking info, best times to play, local tips
3. **Meta Descriptions**: Unique for each page, include city name
4. **Image Alt Text**: Descriptive text for all images

Remember: Real club data > Placeholder content for SEO success!