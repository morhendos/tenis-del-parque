import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Club from '../lib/models/Club.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env.local' })

const DOMAIN = 'https://www.tenisdp.es'
const LOCALES = ['es', 'en']

// Static pages configuration
const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'reglas', pathEn: 'rules', priority: '0.7', changefreq: 'monthly' },
  { path: 'elo', priority: '0.7', changefreq: 'monthly' },
  { path: 'swiss', priority: '0.6', changefreq: 'monthly' },
  { path: 'ligas', pathEn: 'leagues', priority: '0.8', changefreq: 'weekly' },
  { path: 'clubs', priority: '0.9', changefreq: 'weekly' },
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

    // Add city pages
    const activeCities = [...new Set(clubs.map(club => club.location.city))]
    activeCities.forEach(city => {
      LOCALES.forEach(locale => {
        const loc = `${DOMAIN}/${locale}/clubs/${city}`
        const alternates = LOCALES.map(altLocale => ({
          lang: altLocale,
          href: `${DOMAIN}/${altLocale}/clubs/${city}`
        }))
        
        sitemap += generateUrl(loc, alternates, 'weekly', '0.8')
      })
    })

    // Add individual club pages
    clubs.forEach(club => {
      LOCALES.forEach(locale => {
        const loc = `${DOMAIN}/${locale}/clubs/${club.location.city}/${club.slug}`
        const alternates = LOCALES.map(altLocale => ({
          lang: altLocale,
          href: `${DOMAIN}/${altLocale}/clubs/${club.location.city}/${club.slug}`
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
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the generator
generateSitemap()