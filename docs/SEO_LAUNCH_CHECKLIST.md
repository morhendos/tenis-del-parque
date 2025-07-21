# 🚀 SEO Launch Checklist

## Current Status: 🔴 Crawlers Blocked

The site is currently blocking all search engine crawlers to prevent indexing of sample/placeholder content.

## When You're Ready to Launch

### 1. ✅ Prerequisites
- [ ] Added real tennis clubs data (minimum 10-15 clubs)
- [ ] Removed all sample/fake clubs
- [ ] Written unique descriptions for each club
- [ ] Added real contact information
- [ ] Verified all links work correctly
- [ ] Converted SVG placeholders to real images:
  - [ ] favicon.ico
  - [ ] og-image.png
  - [ ] apple-touch-icon.png

### 2. 🤖 Enable Crawlers
1. Edit `/public/robots.txt`
2. Remove the blocking section:
   ```
   # TEMPORARY: Block all crawlers until real content is ready
   # TODO: Remove this block when launching with real clubs
   User-agent: *
   Disallow: /
   ```
3. Uncomment the production configuration (everything after "Future configuration")

### 3. 🗺️ Update Sitemap
```bash
node scripts/generateSitemap.js
```
This will regenerate the sitemap with all your real clubs.

### 4. 🔍 Submit to Search Engines
1. **Google Search Console**
   - Verify ownership of www.tenisdp.es
   - Submit sitemap: https://www.tenisdp.es/sitemap.xml
   - Request indexing for homepage
   - Monitor for any crawl errors

2. **Bing Webmaster Tools**
   - Add and verify your site
   - Submit the same sitemap

### 5. 📊 Set Up Analytics
- [ ] Google Analytics 4
- [ ] Microsoft Clarity
- [ ] Set up conversion tracking for signups

### 6. 🏷️ Add Structured Data
Add to each club page the LocalBusiness schema (see SEO_CHECKLIST.md for example)

### 7. 🌐 Final Checks
- [ ] Test all pages in both languages (es/en)
- [ ] Verify hreflang tags are working
- [ ] Check meta descriptions are unique
- [ ] Ensure all images have alt text
- [ ] Test page load speed
- [ ] Mobile responsiveness check

## 🎯 Launch Timeline

### Week 1 - Content Ready
- Add all real clubs
- Write city-specific content
- Prepare images

### Week 2 - Technical Launch
- Enable crawlers
- Submit to search engines
- Monitor initial indexing

### Week 3 - Monitor & Optimize
- Check search console for errors
- Monitor which pages get indexed
- Start tracking rankings
- Begin link building

## ⚠️ Important Notes

1. **Don't enable crawlers with fake content** - It will hurt your SEO long-term
2. **Start with quality over quantity** - Better to have 10 real clubs than 50 fake ones
3. **Monitor closely after launch** - First impressions matter to Google
4. **Be patient** - It takes 2-4 weeks to see initial rankings

---

**Remember**: Currently crawlers are BLOCKED. This is intentional until you have real content!