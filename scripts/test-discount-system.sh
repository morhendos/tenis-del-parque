#!/bin/bash

# Test Discount Code System for Tenis del Parque
# Run this script to verify the discount system is working

echo "🎾 Testing Tenis del Parque Discount System"
echo "==========================================="
echo ""

# Configuration - adjust these based on your setup
BASE_URL="${BASE_URL:-http://localhost:3000}"
LEAGUE_SLUG="${LEAGUE_SLUG:-sotogrande-summer-2025}"  # Adjust based on your actual league slug
TEST_CODE="VERANO2025"

echo "📍 Testing against: $BASE_URL"
echo "🏆 League slug: $LEAGUE_SLUG"
echo "🎫 Test code: $TEST_CODE"
echo ""
echo "==========================================="
echo ""

# Test 1: Validate a valid discount code
echo "Test 1: Validating discount code '$TEST_CODE'..."
echo "----------------------------------------"
response=$(curl -s -X POST "$BASE_URL/api/leagues/$LEAGUE_SLUG/discount/validate" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$TEST_CODE\"}")

if echo "$response" | grep -q '"valid":true'; then
  echo "✅ PASS: Discount code is valid"
  echo ""
  echo "Response details:"
  echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
else
  echo "❌ FAIL: Discount code validation failed"
  echo "Response: $response"
fi
echo ""

# Test 2: Try an invalid code
echo "Test 2: Testing invalid code 'INVALIDCODE'..."
echo "----------------------------------------"
response=$(curl -s -X POST "$BASE_URL/api/leagues/$LEAGUE_SLUG/discount/validate" \
  -H "Content-Type: application/json" \
  -d '{"code":"INVALIDCODE"}')

if echo "$response" | grep -q '"valid":false'; then
  echo "✅ PASS: Invalid code correctly rejected"
else
  echo "❌ FAIL: Invalid code was not rejected properly"
  echo "Response: $response"
fi
echo ""

# Test 3: Check shareable link format
echo "Test 3: Shareable Link Generation..."
echo "----------------------------------------"
shareable_url="$BASE_URL/signup/$LEAGUE_SLUG?discount=$TEST_CODE"
echo "📎 Shareable URL: $shareable_url"
echo ""

# Test if the signup page is accessible
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/signup/${LEAGUE_SLUG}")
if [ "$status" = "200" ] || [ "$status" = "304" ]; then
  echo "✅ PASS: Signup page is accessible"
else
  echo "⚠️  WARNING: Signup page returned status $status"
  echo "   Make sure the league slug is correct: $LEAGUE_SLUG"
fi
echo ""

# Test 4: Display all created codes
echo "Test 4: Available Discount Codes..."
echo "----------------------------------------"
echo "Run 'node scripts/createDiscountCodes.js' to see all codes"
echo ""
echo "Expected codes:"
echo "  • VERANO2025 - 100% off (unlimited)"
echo "  • SOTOGRANDE2025 - 100% off (unlimited)"
echo "  • EARLYBIRD - 100% off (first 50 only)"
echo ""

# Summary
echo "==========================================="
echo "🎾 Test Summary & Next Steps"
echo "==========================================="
echo ""
echo "✅ If tests passed, your discount system is ready!"
echo ""
echo "📱 Share these with players:"
echo "   Direct link: $shareable_url"
echo "   Or code: $TEST_CODE"
echo ""
echo "📊 To track usage:"
echo "   1. Go to: $BASE_URL/admin/leagues/[your-league-id]/discounts"
echo "   2. Or check MongoDB: db.leagues.findOne({slug:'$LEAGUE_SLUG'}).discountCodes"
echo ""
echo "💡 Pro tip: Test the full registration flow:"
echo "   1. Open: $shareable_url"
echo "   2. Fill the form"
echo "   3. Verify price shows as: €29 → €0"
echo "   4. Complete registration"
echo "   5. Check usage count increased"
echo ""
echo "==========================================="
