# 🎾 TennisPreloader Standardization

## ⚠️ IMPORTANT: ALWAYS USE TennisPreloader FOR LOADING STATES

**DO NOT** create custom spinners, loading animations, or any other preloader patterns!

**ALWAYS use** the standardized `TennisPreloader` component from `@/components/ui/TennisPreloader`

---

## 📦 Available Components

Import from: `@/components/ui/TennisPreloader`

### 1. `TennisPreloaderInline` (Most Common)
**Use this for page-level loading states within the player hub and logged-in areas.**

```jsx
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

// Basic usage
if (loading) {
  return (
    <TennisPreloaderInline 
      text="Loading..."
      locale={locale}
    />
  )
}

// With custom loading text
<TennisPreloaderInline 
  text={locale === 'es' ? 'Cargando mensajes...' : 'Loading messages...'}
  locale={locale}
/>
```

### 2. `TennisPreloaderFullScreen`
**Use this for full-page loading states (e.g., public pages before content loads).**

```jsx
import { TennisPreloaderFullScreen } from '@/components/ui/TennisPreloader'

<TennisPreloaderFullScreen locale={locale} />
```

### 3. `TennisPreloaderSmall`
**Use this for inline/small loading indicators within components.**

```jsx
import { TennisPreloaderSmall } from '@/components/ui/TennisPreloader'

<TennisPreloaderSmall 
  text={locale === 'es' ? 'Buscando...' : 'Searching...'}
  locale={locale}
/>
```

### 4. `TennisPreloader` (Base Component)
**For custom sizes or configurations, use the base component with props.**

```jsx
import TennisPreloader from '@/components/ui/TennisPreloader'

<TennisPreloader 
  size="md"       // 'sm' | 'md' | 'lg' | 'xl'
  fullScreen={false}
  text="Custom loading text..."
  locale="es"
  className="my-custom-class"
/>
```

---

## ✅ Standardized Files (Player Hub)

All player hub pages now use the TennisPreloader:

| File | Status | Component Used |
|------|--------|----------------|
| `app/[locale]/player/dashboard/page.js` | ✅ | `TennisPreloaderInline` |
| `app/[locale]/player/league/page.js` | ✅ | `TennisPreloaderInline` |
| `app/[locale]/player/matches/page.js` | ✅ | `TennisPreloaderInline` |
| `app/[locale]/player/messages/page.js` | ✅ | `TennisPreloaderInline` |
| `app/[locale]/player/openrank/page.js` | ✅ | `TennisPreloaderInline` |
| `app/[locale]/player/profile/page.js` | ✅ | `TennisPreloaderInline` |
| `app/[locale]/player/achievements/page.js` | ✅ | Uses TrophyRoom skeleton |
| `app/[locale]/player/rules/page.js` | ✅ | No loading needed (static) |

---

## ❌ BANNED PATTERNS

**NEVER** use any of these patterns:

```jsx
// ❌ DON'T: Custom border spinner
<div className="w-16 h-16 border-4 border-parque-purple rounded-full animate-spin border-t-transparent"></div>

// ❌ DON'T: Border-b spinner
<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-parque-purple"></div>

// ❌ DON'T: Any custom spinner with animate-spin
<div className="animate-spin ..."></div>

// ❌ DON'T: Simple loading text without the tennis ball
<p>Loading...</p>
```

---

## ✅ CORRECT PATTERN

```jsx
// ✅ DO: Use TennisPreloaderInline for page loading
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

if (loading) {
  return (
    <TennisPreloaderInline 
      text={locale === 'es' ? 'Cargando...' : 'Loading...'}
      locale={locale}
    />
  )
}
```

---

## 🎨 Why This Matters

1. **Visual Consistency** - All loading states look the same across the platform
2. **Brand Identity** - The bouncing tennis ball reinforces our tennis platform identity
3. **Bilingual Support** - Automatic "Cargando..." vs "Loading..." based on locale
4. **Professional UX** - More engaging than generic spinners
5. **Maintainability** - Single source of truth for loading animations

---

## 📝 Component-Level Loading States

For loading states **within components** (not full-page), skeleton loaders are acceptable:

```jsx
// ✅ OK: Skeleton loader for component-level loading
if (loading) {
  return (
    <div className="rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-48 bg-gray-200 rounded" />
    </div>
  )
}
```

**Examples:** TrophyRoom component uses skeleton loaders - this is fine because it's a component within a page, not the full page loading state.

---

## 🔧 Quick Reference

| Use Case | Component |
|----------|-----------|
| Page loading (player hub) | `TennisPreloaderInline` |
| Full-page loading (public) | `TennisPreloaderFullScreen` |
| Small inline loading | `TennisPreloaderSmall` |
| Component skeleton | Use `animate-pulse` skeleton |
| Button loading state | Keep existing button spinners |

---

**Last Updated:** December 2025
**Maintained By:** Development Team
