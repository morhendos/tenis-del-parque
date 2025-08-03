# 🧪 City Image Management Testing Checklist

## Quick Verification Tests

### ✅ Test 1: New City Creation with Photo Import

1. **Navigate to Admin Cities** → `/admin/cities`
2. **Click "Add City"** → Opens CityFormModal
3. **Search for a city** → Try "Málaga" or "Madrid"
4. **Select from results** → Should show photos count
5. **Complete Step 1** → Click "Next: Images"
6. **Verify Step 2** → Should show Google Photos and CityImageManager
7. **Check main image** → First photo should be auto-selected
8. **Save city** → Should create successfully

**Expected Result**: ✅ New city created with Google Photos imported

---

### ✅ Test 2: Edit Existing City Images

1. **Find existing city** → In cities listing table
2. **Click "Edit"** → Opens CityFormModal in edit mode
3. **Click "Manage Images"** → Jumps to Step 2 (image management)
4. **Upload a custom image** → Click "Upload Images"
5. **Set as main image** → Click green check on uploaded image
6. **Save changes** → Update city

**Expected Result**: ✅ Existing city updated with new images

---

### ✅ Test 3: Google Photos Error Handling

1. **Disable Google API** → Remove `GOOGLE_MAPS_API_KEY` from .env
2. **Try adding new city** → Search and select city
3. **Check Step 2** → Should show fallback images
4. **Verify fallbacks** → Unsplash images with "Fallback" badge
5. **Re-enable API** → Add key back and test again

**Expected Result**: ✅ Graceful fallback to placeholder images

---

### ✅ Test 4: Cities Listing Image Indicators

1. **View cities list** → `/admin/cities`
2. **Check "With Images" stat** → Should show count of cities with images
3. **Find Images column** → Should show image badges and thumbnails
4. **Check cities without images** → Should show "No Images" badge
5. **Verify thumbnails** → Should display and handle errors gracefully

**Expected Result**: ✅ Clear visual indicators of image status

---

### ✅ Test 5: Bulk Enhancement with Photos

1. **Click "Enhance with Google"** → Opens CityGoogleEnhancer
2. **Check "Include photos"** → Enable photo fetching option
3. **Select cities** → Choose cities without images
4. **Run enhancement** → Monitor progress
5. **Check results** → Should show photos added count

**Expected Result**: ✅ Cities enhanced with coordinates and photos

---

## 🔍 Detailed Testing Scenarios

### **API Endpoint Testing**

```bash
# Test Google Photo proxy (replace {photo_ref} with actual reference)
curl "http://localhost:3000/api/admin/cities/google-photo?photo_reference={photo_ref}&maxwidth=800"

# Should return image or redirect to fallback
```

### **Error Scenarios to Test**

1. **Invalid photo reference** → Should fallback to Unsplash
2. **Network timeout** → Should show fallback images
3. **Large file upload** → Should show error for >5MB files
4. **Invalid file type** → Should reject non-image files
5. **Duplicate city creation** → Should show validation error

### **Performance Testing**

1. **Multiple photo uploads** → Should show progress bars
2. **Large image loading** → Should show loading spinners
3. **Slow network** → Should handle timeouts gracefully
4. **Concurrent operations** → Multiple users editing cities

---

## 🐛 Common Issues & Solutions

### **Images not loading**
- ✅ Check if Google Maps API key is set
- ✅ Verify network connectivity
- ✅ Check browser console for errors
- ✅ Confirm fallback images load

### **Upload failures**
- ✅ Check file size (<5MB)
- ✅ Verify file format (JPEG, PNG, WebP)
- ✅ Check upload directory permissions
- ✅ Monitor browser network tab

### **Step 2 not accessible**
- ✅ Verify Step 1 form validation passes
- ✅ Check if editing existing city
- ✅ Confirm modal state management
- ✅ Review browser console errors

---

## 📊 Success Criteria

### **✅ All Tests Pass When:**

1. **New cities** can be created with Google Photos
2. **Existing cities** can be edited and images managed
3. **Fallback images** display when Google Photos fail
4. **Upload functionality** works for custom images
5. **Image indicators** show correctly in listings
6. **Error messages** are clear and helpful
7. **Performance** is acceptable with loading states
8. **Data persistence** works across page refreshes

### **⚠️ Known Limitations**

1. **Google API required** for full photo functionality
2. **5MB upload limit** per image file
3. **Fallback images** are generic Unsplash photos
4. **Caching** may delay image updates (24-hour cache)

---

## 🚀 Ready for Production When:

- [ ] All test scenarios pass ✅
- [ ] Google Maps API key configured ✅
- [ ] Upload directory has proper permissions ✅
- [ ] Error monitoring is in place ✅
- [ ] Performance is acceptable ✅
- [ ] Documentation is updated ✅

---

## 🆘 Troubleshooting Commands

```bash
# Check if API key is set
echo $GOOGLE_MAPS_API_KEY

# Check upload directory permissions
ls -la public/uploads/cities/

# Test API endpoints
curl -X POST http://localhost:3000/api/admin/cities/search-google \
  -H "Content-Type: application/json" \
  -d '{"query": "Madrid", "includePhotos": true}'

# Check image proxy
curl -I "http://localhost:3000/api/admin/cities/google-photo?photo_reference=test&maxwidth=400"
```

**Happy Testing! 🎉**

If any test fails, check the browser console for errors and refer to the troubleshooting section above.
