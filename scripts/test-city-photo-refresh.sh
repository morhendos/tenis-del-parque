#!/bin/bash

# Test script for City Photo Refresh Feature
# Run this from the project root directory

echo "🧪 City Photo Refresh Feature - Test Script"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Prerequisites:${NC}"
echo "1. Make sure you're on the feature branch:"
echo "   git checkout feature/city-photo-refresh-edit-mode"
echo ""
echo "2. Install dependencies if needed:"
echo "   npm install"
echo ""
echo "3. Set up your environment variables:"
echo "   - GOOGLE_MAPS_API_KEY"
echo "   - MongoDB connection string"
echo ""

echo -e "${GREEN}Test Steps:${NC}"
echo ""
echo "Step 1: Start the development server"
echo "   npm run dev"
echo ""

echo "Step 2: Test with a city that HAS a Google Place ID"
echo "   1. Go to http://localhost:3000/admin/cities"
echo "   2. Find a city that was imported from Google (has 'Google' badge)"
echo "   3. Click Edit"
echo "   4. Navigate to Images tab"
echo "   5. Click 'Refresh Photos from Google'"
echo "   6. Verify photos are loaded"
echo "   7. Click 'Update City' to save"
echo ""

echo "Step 3: Test with a city that DOESN'T have a Google Place ID"
echo "   1. Create a new city manually or find one without Google data"
echo "   2. Click Edit"
echo "   3. Navigate to Images tab"
echo "   4. Click 'Refresh Photos from Google'"
echo "   5. System should search for the city and find Place ID"
echo "   6. Verify photos are loaded"
echo "   7. Check that coordinates are updated"
echo "   8. Click 'Update City' to save"
echo ""

echo "Step 4: Test error handling"
echo "   1. Try to refresh photos for a city with an invalid name"
echo "   2. Verify error message appears"
echo ""

echo -e "${YELLOW}Expected Results:${NC}"
echo "✅ Photos are successfully fetched from Google"
echo "✅ Place ID is automatically detected when missing"
echo "✅ Coordinates are updated if missing"
echo "✅ Success message shows photo count"
echo "✅ Unsaved changes indicator appears"
echo "✅ Data persists after saving"
echo ""

echo -e "${GREEN}Testing Cities (Examples):${NC}"
echo "• Málaga - Should have many photos"
echo "• Marbella - Should have photos" 
echo "• Estepona - Should have photos"
echo "• Small towns - May have fewer or no photos"
echo ""

echo -e "${RED}Common Issues:${NC}"
echo "• If photos don't load: Check GOOGLE_MAPS_API_KEY is set"
echo "• If Place ID not found: Check city name spelling"
echo "• If save fails: Check MongoDB connection"
echo ""

echo "🎉 Happy Testing!"
