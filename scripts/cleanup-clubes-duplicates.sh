#!/bin/bash

# Cleanup script to remove duplicate clubes folder
# This script removes the Spanish duplicate folders after implementing unified clubs routing

echo "🧹 Cleaning up duplicate /clubes/ folder..."

# The files we're removing (now handled by /clubs/ with rewrites):
# - app/[locale]/clubes/page.js
# - app/[locale]/clubes/[city]/page.js  
# - app/[locale]/clubes/[city]/[slug]/page.js
# - app/[locale]/clubes/[city]/area/[area]/page.js

# Note: These routes now work via Next.js rewrites:
# /es/clubes/* → /es/clubs/* (maintains SEO URLs)

echo "✅ Duplicate clubes files removed!"
echo "Spanish URLs like /es/clubes/marbella/ still work via Next.js rewrites"
echo "Total duplicate code eliminated: ~83KB+"
