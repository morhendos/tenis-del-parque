# 🎾 TennisPreloader Standardization Plan

## ✅ **COMPLETED**
- ✅ `app/[locale]/player/dashboard/page.js` - Already using TennisPreloaderInline  
- ✅ `components/admin/clubs/GoogleMapsImporter.js` - **JUST UPDATED** ✨
  - Replaced 2 old `animate-spin` spinners with TennisPreloaderSmall and TennisPreloaderInline
  - Added locale-aware loading text

## 🎯 **NEXT STEPS**

### 1. **HIGH PRIORITY - Components with Visual Loading States**
- [ ] Check more admin components for loading states
- [ ] Search for any remaining `animate-spin` usage in codebase
- [ ] Update any other visual loading states

### 2. **MEDIUM PRIORITY - Data Hooks (used by components)**
These hooks provide loading states that components use - we need to ensure components using these hooks display TennisPreloader:

- [ ] **`lib/hooks/useAuth.js`** - `isLoading` state
  - Find components using this hook
  - Ensure they show TennisPreloader when `isLoading` is true

- [ ] **`lib/hooks/useLeaguesData.js`** - `loading` state  
  - Find admin components using this hook
  - Update to show TennisPreloader during data fetching

- [ ] **`lib/hooks/usePlayerDashboard.js`** - `loading` state
  - ✅ Already correctly used in dashboard page

### 3. **LOW PRIORITY - Text-Only Loading States**
- [ ] **`components/admin/clubs/ClubEditor.js`** - "Saving..." text loading
  - Could optionally add small TennisPreloader next to "Saving..." text

## 🔍 **AUDIT APPROACH**

1. **Search for old loading patterns:**
   - `animate-spin` classes
   - Custom loading divs/spinners
   - "Loading..." or "Cargando..." text without TennisPreloader

2. **Check components that use data hooks:**
   - Components using `useAuth`, `useLeaguesData`, etc.
   - Ensure they display TennisPreloader during loading states

3. **Verify consistency:**
   - All loading states use TennisPreloader variants
   - Proper locale support (es/en)
   - Appropriate sizes for context

## 📋 **TennisPreloader Usage Guide**

### Available Components:
- `TennisPreloader` - Main component with full props
- `TennisPreloaderFullScreen` - Full viewport height
- `TennisPreloaderInline` - Inline with padding  
- `TennisPreloaderSmall` - Small size for buttons/compact areas

### Props:
- `size`: 'sm', 'md', 'lg', 'xl'
- `fullScreen`: boolean  
- `text`: custom loading text
- `locale`: 'es' | 'en' for default text
- `className`: additional styling

### Usage Examples:
```jsx
// Full screen loading (page load)
<TennisPreloaderFullScreen locale={language} />

// Inline content loading  
<TennisPreloaderInline size="lg" locale={language} />

// Button/small loading
<TennisPreloaderSmall locale={language} />

// Custom text
<TennisPreloader text="Importing clubs..." size="xl" />
```

## 🎯 **IMMEDIATE NEXT STEPS**
1. Search for remaining `animate-spin` usage
2. Update any admin components with old loading states
3. Verify components using data hooks show TennisPreloader
4. Test loading consistency across the app

**Status:** 🟡 In Progress - Major components updated, systematic audit needed
