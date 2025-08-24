#!/bin/bash

# Cleanup script for removing old club editor components after refactor
# Run this from the project root directory

echo "🧹 Cleaning up old club editor components..."
echo ""

# Files to remove
FILES_TO_REMOVE=(
  "components/admin/clubs/ClubFormModal.js"
  "components/admin/clubs/CourtsManager.js"
)

# Check if files exist and remove them
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing: $file"
    rm "$file"
    echo "✅ Removed successfully"
  else
    echo "⚠️  File not found: $file"
  fi
echo ""
done

echo "📊 Cleanup Summary:"
echo "-------------------"
echo "Removed components:"
echo "  - ClubFormModal.js (55KB) - Old 6-step modal system"
echo "  - CourtsManager.js (10KB) - Complex courts management with tabs"
echo ""
echo "Kept components:"
echo "  ✅ ClubEditor.js - New main editor component"
echo "  ✅ editor/ folder - All section components"
echo "  ✅ GoogleMapsImporter.js - Still needed for Google imports"
echo "  ✅ ClubImageManager.js - Still used by ImagesSection"
echo ""
echo "🎉 Cleanup complete! You've saved ~65KB by removing redundant code."
echo ""
echo "Next steps:"
echo "1. Commit these deletions: git add -A && git commit -m 'cleanup: Remove old club editor components'"
echo "2. Test the new editor at /admin/clubs/new"
echo "3. Merge the feature branch when ready"