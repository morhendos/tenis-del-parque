#!/bin/bash

# Cleanup script to remove old components after refactoring
# Run this from the project root

echo "🧹 Cleaning up old editor components..."

# Old City Components
if [ -f "components/admin/cities/CityFormModal.js" ]; then
    rm components/admin/cities/CityFormModal.js
    echo "✅ Removed CityFormModal.js"
fi

# Old Club Components (check if they exist)
if [ -f "components/admin/clubs/ClubFormModal.js" ]; then
    rm components/admin/clubs/ClubFormModal.js
    echo "✅ Removed ClubFormModal.js"
fi

if [ -f "components/admin/clubs/ClubForm.js" ]; then
    rm components/admin/clubs/ClubForm.js
    echo "✅ Removed ClubForm.js"
fi

if [ -f "components/admin/clubs/ClubModal.js" ]; then
    rm components/admin/clubs/ClubModal.js
    echo "✅ Removed ClubModal.js"
fi

echo "🎉 Cleanup complete!"
echo ""
echo "Files kept (still in use):"
echo "  ✓ CityImageManager.js - Used by ImagesSection"
echo "  ✓ CityGoogleEnhancer.js - Used for bulk enhancement"
echo "  ✓ ClubImageManager.js - Used by club editor"
echo "  ✓ GoogleMapsImporter.js - Used for importing clubs"
echo ""
echo "New structure:"
echo "  📁 components/admin/cities/"
echo "  ├── CityEditor.js (main)"
echo "  ├── editor/ (section components)"
echo "  ├── CityImageManager.js (kept)"
echo "  └── CityGoogleEnhancer.js (kept)"
echo ""
echo "  📁 components/admin/clubs/"
echo "  ├── ClubEditor.js (main)"
echo "  ├── editor/ (section components)"
echo "  ├── ClubImageManager.js (kept)"
echo "  └── GoogleMapsImporter.js (kept)"
