# 🗑️ Manual Cleanup Required - Delete Duplicate Clubes Files

## Files to Delete (83KB+ duplicate code)

After merging this PR, manually delete these duplicate files:

```bash
# Delete the entire clubes folder structure
rm -rf app/[locale]/clubes/

# Or delete individual files:
rm app/[locale]/clubes/page.js                          # 138 bytes
rm app/[locale]/clubes/[city]/page.js                   # 34,363 bytes  
rm app/[locale]/clubes/[city]/[slug]/page.js            # 31,083 bytes
rm app/[locale]/clubes/[city]/area/[area]/page.js       # 17,852 bytes
```

## ✅ How to Verify Cleanup Works

1. **Delete the files above**
2. **Test Spanish URLs still work:**
   - Visit: `https://www.tenisdp.es/es/clubes/marbella/`
   - Should work via Next.js rewrite to `/es/clubs/marbella/`
   - Browser URL should remain `/es/clubes/` for SEO

3. **Test English URLs:**
   - Visit: `https://www.tenisdp.es/en/clubs/marbella/`
   - Should work normally

## 🎯 What This Achieves

- ✅ **83KB+ code reduction** in clubs section alone
- ✅ **SEO URLs preserved** - users still see `/es/clubes/`
- ✅ **Single codebase** - easier maintenance
- ✅ **No functionality loss** - everything works via rewrites

## 🔄 Next Phase

After completing this cleanup, proceed to **Phase 2** in the [Internationalization Cleanup Plan](./INTERNATIONALIZATION_CLEANUP_PLAN.md):
- Analyze `/leagues/` vs `/ligas/` duplication
- Same approach: unify + rewrite + delete duplicates
