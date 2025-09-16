# Registration Routes Refactoring Plan

## Current Problem

We have duplicate registration routes with poor internationalization:
- `/signup/[league]` - Old route with no locale support
- `/[locale]/registro/[league]` - New route but uses Spanish word for all locales

This creates:
- **Maintenance nightmare** - Same code in two places
- **Poor UX** - English users see "registro" in URL
- **SEO issues** - Duplicate content, confusing URLs
- **Inconsistent sharing** - Which URL to share?

## Desired Solution

Implement proper locale-specific routes:
- `/es/registro/[league]` - Spanish users
- `/en/signup/[league]` - English users

## Implementation Steps

### Step 1: Move and Rename Route ✅
- Move `/app/[locale]/registro/` to a neutral location first
- Create proper locale-based routing structure

### Step 2: Update Middleware ✅
- Modify middleware to handle locale-specific route names
- Map `/es/registro/` and `/en/signup/` to the same component

### Step 3: Delete Old Route ✅
- Remove `/app/signup/[league]/page.js` completely
- Clean up any related files

### Step 4: Set Up Redirects ✅
- Old `/signup/[league]` → `/en/signup/[league]`
- Wrong locale combinations → correct locale route

### Step 5: Update All Links ✅
- Search and replace all references to old routes
- Update navigation components
- Update share URLs in success messages

## Technical Implementation

### Middleware Changes

```javascript
// middleware.js updates
const routeTranslations = {
  'registro': {
    'es': 'registro',
    'en': 'signup'
  }
}

// Rewrite URLs based on locale
if (pathname.includes('/registro/') && locale === 'en') {
  return NextResponse.rewrite(
    new URL(`/en/signup/${league}`, request.url)
  )
}
```

### File Structure

**BEFORE:**
```
/app
  /signup
    /[league]
      page.js        <- Delete this
  /[locale]
    /registro
      /[league]
        page.js      <- Keep and enhance
```

**AFTER:**
```
/app
  /[locale]
    /register        <- Internal route name
      /[league]
        page.js      <- Single implementation
```

With middleware handling:
- `/es/registro/[league]` → `/es/register/[league]`
- `/en/signup/[league]` → `/en/register/[league]`

### Components to Update

1. **Navigation.js** - Update signup links
2. **LeagueCard.js** - Update registration buttons
3. **EnhancedSuccessMessage.js** - Update share URLs
4. **API responses** - Return correct locale-based URLs
5. **Email templates** - Use correct signup URLs

## URL Mapping

| Old URL | New URL | Notes |
|---------|---------|-------|
| `/signup/sotogrande` | `/en/signup/sotogrande` | Redirect |
| `/es/registro/sotogrande` | `/es/registro/sotogrande` | No change |
| `/en/registro/sotogrande` | `/en/signup/sotogrande` | Rewrite |
| `/registro/sotogrande` | `/es/registro/sotogrande` | Redirect |

## Benefits

1. **Proper i18n** - URLs make sense in each language
2. **Single source of truth** - One component to maintain
3. **Better SEO** - Language-appropriate URLs
4. **Consistent UX** - Users see familiar words

## Testing Checklist

- [ ] `/es/registro/[league]` works for Spanish
- [ ] `/en/signup/[league]` works for English
- [ ] Old `/signup/[league]` redirects properly
- [ ] Share URLs use correct locale
- [ ] Email links use correct locale
- [ ] Navigation updates based on current locale
- [ ] Success message shows correct share URL

## Rollback Plan

If issues arise:
1. Revert middleware changes
2. Restore `/app/signup/` route
3. Remove new redirects

The old route can coexist temporarily during migration.

## Timeline

1. **Documentation** - 5 min ✅
2. **Middleware updates** - 10 min
3. **Route refactoring** - 15 min
4. **Link updates** - 10 min
5. **Testing** - 10 min

**Total: ~50 minutes**

## Success Metrics

- No 404 errors on registration routes
- All registration flows work in both languages
- Share URLs are locale-appropriate
- No duplicate code for registration
