const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs').promises
const path = require('path')

dotenv.config({ path: '.env.local' })

// Minimal Club schema for sitemap generation - only fields we actually use
const ClubSchema = new mongoose.Schema({
  slug: String,
  location: {
    city: String,
    area: String
  },
  status: String
}, { 
  timestamps: true,
  collection: 'clubs' // Ensure we use the same collection as the main model
})

const Club = mongoose.models.Club || mongoose.model('Club', ClubSchema)

const DOMAIN = 'https://www.tenisdp.es'
const LOCALES = ['es', 'en']

// Static pages configuration with locale-aware paths
const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'reglas', pathEn: 'rules', priority: '0.7', changefreq: 'monthly' },
  { path: 'elo', priority: '0.7', changefreq: 'monthly' },
  { path: 'swiss', priority: '0.6', changefreq: 'monthly' },
  { path: 'ligas', pathEn: 'leagues', priority: '0.8', changefreq: 'weekly' },
  { path: 'clubes', pathEn: 'clubs', priority: '0.9', changefreq: 'weekly' },
  { path: 'login', priority: '0.5', changefreq: 'monthly' }
]

const CITIES = ['malaga', 'marbella', 'estepona', 'sotogrande']

function generateUrl(loc, alternates, changefreq = 'weekly', priority = '0.5') {
  let xml = `  <url>\n    <loc>${loc}</loc>\n`
  
  if (alternates && alternates.length > 0) {
    alternates.forEach(alt => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}"/>\n`
    })
  }
  
  xml += `    <changefreq>${changefreq}</changefreq>\n`
  xml += `    <priority>${priority}</priority>\n`
  xml += `  </url>\n`
  
  return xml
}

// Helper function to get locale-aware club path
function getClubPath(locale) {
  return locale === 'es' ? 'clubes' : 'clubs'
}

async function generateSitemap() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL)
    console.log('Connected to MongoDB')

    // Fetch all active clubs
    const clubs = await Club.find({ status: 'active' }).lean()
    console.log(`Found ${clubs.length} active clubs`)

    // Start sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
`

    // Add static pages
    STATIC_PAGES.forEach(page => {
      LOCALES.forEach(locale => {
        const path = page.path
        const pathAlt = locale === 'en' && page.pathEn ? page.pathEn : path
        const loc = `${DOMAIN}/${locale}${path ? '/' + pathAlt : ''}`
        
        const alternates = LOCALES.map(altLocale => {
          const altPath = altLocale === 'en' && page.pathEn ? page.pathEn : path
          return {
            lang: altLocale,
            href: `${DOMAIN}/${altLocale}${path ? '/' + altPath : ''}`
          }
        })
        
        // Add x-default for homepage
        if (!path) {
          alternates.push({
            lang: 'x-default',
            href: `${DOMAIN}/es`
          })
        }
        
        sitemap += generateUrl(loc, alternates, page.changefreq, page.priority)
      })
    })

    // Add city pages with locale-aware club paths
    const activeCities = [...new Set(clubs.map(club => club.location.city))]
    activeCities.forEach(city => {
      LOCALES.forEach(locale => {
        const clubPath = getClubPath(locale)
        const loc = `${DOMAIN}/${locale}/${clubPath}/${city}`
        const alternates = LOCALES.map(altLocale => ({
          lang: altLocale,
          href: `${DOMAIN}/${altLocale}/${getClubPath(altLocale)}/${city}`
        }))
        
        sitemap += generateUrl(loc, alternates, 'weekly', '0.8')
      })
    })

    // Add area pages with locale-aware club paths
    const areas = [...new Set(clubs.filter(club => club.location?.area).map(club => `${club.location.city}-${club.location.area}`))]
    areas.forEach(areaKey => {
      const [city, area] = areaKey.split('-')
      LOCALES.forEach(locale => {
        const clubPath = getClubPath(locale)
        const loc = `${DOMAIN}/${locale}/${clubPath}/${city}/area/${area}`
        const alternates = LOCALES.map(altLocale => ({
          lang: altLocale,
          href: `${DOMAIN}/${altLocale}/${getClubPath(altLocale)}/${city}/area/${area}`
        }))
        
        sitemap += generateUrl(loc, alternates, 'weekly', '0.7')
      })
    })

    // Add individual club pages with locale-aware paths
    clubs.forEach(club => {
      LOCALES.forEach(locale => {
        const clubPath = getClubPath(locale)
        const loc = `${DOMAIN}/${locale}/${clubPath}/${club.location.city}/${club.slug}`
        const alternates = LOCALES.map(altLocale => ({
          lang: altLocale,
          href: `${DOMAIN}/${altLocale}/${getClubPath(altLocale)}/${club.location.city}/${club.slug}`
        }))
        
        sitemap += generateUrl(loc, alternates, 'weekly', '0.7')
      })
    })

    // Add signup pages for all cities
    CITIES.forEach(city => {
      LOCALES.forEach(locale => {
        const path = locale === 'es' ? 'registro' : 'signup'
        const loc = `${DOMAIN}/${locale}/${path}/${city}`
        const alternates = [
          { lang: 'es', href: `${DOMAIN}/es/registro/${city}` },
          { lang: 'en', href: `${DOMAIN}/en/signup/${city}` }
        ]
        
        sitemap += generateUrl(loc, alternates, 'monthly', '0.9')
      })
    })

    // Close sitemap
    sitemap += `
</urlset>`

    // Write sitemap to file
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
    await fs.writeFile(sitemapPath, sitemap)
    
    console.log('Sitemap generated successfully!')
    console.log(`Total URLs: ${(sitemap.match(/<url>/g) || []).length}`)
    console.log('URLs with proper locale-aware paths:')
    console.log('  ✅ /es/clubes/* (Spanish)')
    console.log('  ✅ /en/clubs/* (English)')
    console.log('  ✅ /es/ligas (Spanish)')
    console.log('  ✅ /en/leagues (English)')
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the generator
generateSitemap()