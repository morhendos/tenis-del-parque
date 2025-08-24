# 📸 Club Image Management System

> Complete image management solution for tennis clubs with support for both Google Maps imports and local uploads.

## 🌟 Overview

The Club Image Management System provides a comprehensive solution for managing tennis club images within the admin panel. It supports both **external image URLs** (from Google Maps imports) and **local file uploads**, offering maximum flexibility while maintaining excellent user experience.

## ✨ Key Features

### 🖼️ **Hybrid Image Storage**
- **External URLs**: Google Maps photos, external links
- **Local Uploads**: Secure file storage in `/public/uploads/clubs/`
- **Automatic Organization**: Smart categorization and management

### 🔄 **Multi-Source Support**
- **Google Maps Integration**: Import photos directly from Places API
- **Manual Uploads**: Drag & drop file uploads
- **Mixed Collections**: Seamlessly combine both sources

### 🎯 **Smart Management**
- **Main Image Selection**: Choose from any available source
- **Gallery Management**: Organize additional photos
- **Visual Indicators**: Clear source identification (Google vs Upload)
- **Bulk Operations**: Multi-file uploads with progress tracking

### 🛡️ **Security & Validation**
- **File Type Validation**: JPEG, PNG, WebP only
- **Size Limits**: 5MB maximum per image
- **Secure Naming**: Timestamp + random string naming
- **Error Handling**: Comprehensive validation with user feedback

## 🏗️ Architecture

```
📦 Image Management System
├── 🎛️ ClubImageManager Component
│   ├── Image Display & Preview
│   ├── Upload Interface
│   ├── Gallery Management
│   └── Google Photos Integration
├── 🔌 Upload API (/api/upload)
│   ├── File Validation
│   ├── Secure Storage
│   └── URL Generation
├── 💾 Storage System
│   ├── Local Files (/public/uploads/clubs/)
│   └── External URLs (Google Maps)
└── 🔧 Integration
    ├── ClubFormModal (Step 6)
    └── Admin Interface
```

## 🚀 Usage Guide

### For Admins

#### 1. **Managing Images in Club Form**
1. Navigate to **Admin → Clubs**
2. Click **Add Club** or **Edit** existing club
3. Go to **Step 6: Images**
4. Upload files or select from Google Photos
5. Set main image by clicking the green checkmark

#### 2. **Upload New Images**
- Click **"Upload Images"** button
- Select one or multiple files (max 5MB each)
- Supported formats: JPEG, PNG, WebP
- Images automatically added to gallery

#### 3. **Set Main Image**
- Click the green checkmark on any image
- Works for both uploaded and Google photos
- Main image appears in club listings

#### 4. **Remove Images**
- Click red X on uploaded images to remove
- Google photos are protected (can't be deleted)
- Confirmation required for main image removal

### For Developers

#### **ClubImageManager Component**

```jsx
import ClubImageManager from '@/components/admin/clubs/ClubImageManager'

<ClubImageManager
  club={clubData}
  onImagesUpdate={handleImagesUpdate}
  readOnly={false}
/>
```

**Props:**
- `club`: Club object with images and Google data
- `onImagesUpdate`: Callback when images change
- `readOnly`: Boolean to disable editing

#### **Upload API Integration**

```javascript
// Upload files
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'club_image')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const data = await response.json()
if (data.success) {
  console.log('Uploaded to:', data.url)
}
```

#### **Data Structure**

```javascript
// Club images structure
const club = {
  images: {
    main: '/uploads/clubs/club_image_123_abc.jpg', // Main image URL
    gallery: [                                      // Gallery images
      '/uploads/clubs/club_image_124_def.jpg',
      '/uploads/clubs/club_image_125_ghi.jpg'
    ],
    googlePhotoReference: 'ABC123...' // If main is from Google
  },
  googleData: {
    photos: [                        // Google Maps photos
      {
        photo_reference: 'ABC123...',
        width: 1920,
        height: 1080
      }
    ]
  }
}
```

## 🔧 Technical Implementation

### **Upload API (`/app/api/upload/route.js`)**

Features:
- **File Validation**: Type and size checking
- **Secure Storage**: Timestamp + random naming
- **Directory Management**: Auto-create upload folders
- **Error Handling**: Detailed error responses

```javascript
// File naming convention
const filename = `club_image_${timestamp}_${random}.${extension}`
// Example: club_image_1691234567_abc123.jpg
```

### **Storage Strategy**

#### **Local Storage (Current)**
- **Location**: `/public/uploads/clubs/`
- **Access**: Direct URL access
- **Backup**: File system backup required
- **Scaling**: Suitable for small to medium deployments

#### **Cloud Storage (Recommended for Production)**
Consider migrating to:
- **AWS S3**: Scalable, reliable, CDN integration
- **Cloudinary**: Image optimization, transformations
- **Google Cloud Storage**: Integration with existing Google services

### **Database Schema**

```javascript
// Club model - images field
images: {
  main: String,                    // URL to main image
  gallery: [String],              // Array of gallery image URLs
  googlePhotoReference: String    // Google photo reference if main is from Google
}
```

## 🎨 User Experience

### **Visual Design**
- **Clean Interface**: Minimal, intuitive design
- **Visual Indicators**: 
  - 🟢 Green border for main image
  - 🔵 Blue badge for Google photos
  - ✅ Main badge overlay
- **Hover Actions**: Contextual buttons on image hover
- **Responsive Grid**: Adapts to different screen sizes

### **Interaction Flow**
1. **Upload**: Drag files or click upload button
2. **Preview**: Immediate thumbnail preview
3. **Organize**: Set main image, organize gallery
4. **Feedback**: Clear success/error messages

### **Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Error Messages**: Clear, actionable feedback
- **Loading States**: Visual progress indicators

## 📊 Performance Optimization

### **Frontend Optimizations**
- **Lazy Loading**: Images load on demand
- **Progressive Enhancement**: Core functionality works without JS
- **Caching**: Proper cache headers for uploaded images

### **Backend Optimizations**
- **Efficient Uploads**: Direct file streaming
- **Error Recovery**: Graceful failure handling
- **Resource Limits**: Configurable file size limits

## 🔒 Security Considerations

### **Upload Security**
- **File Type Validation**: Whitelist approach
- **Size Limits**: Prevent DoS attacks
- **Filename Sanitization**: Secure naming convention
- **Directory Restrictions**: Sandboxed uploads

### **Access Control**
- **Admin Only**: Upload restricted to admins
- **Session Validation**: Authenticated requests only
- **CSRF Protection**: Built-in Next.js protection

## 🚦 Testing Guide

### **Manual Testing**

#### **Upload Flow**
1. ✅ Upload single image (JPEG, PNG, WebP)
2. ✅ Upload multiple images simultaneously
3. ✅ Validate file size limits (>5MB should fail)
4. ✅ Test invalid file types (.txt, .exe should fail)
5. ✅ Set uploaded image as main image
6. ✅ Remove uploaded images

#### **Google Integration**
1. ✅ View Google photos from imported clubs
2. ✅ Set Google photo as main image
3. ✅ Verify Google photos can't be deleted
4. ✅ Test mixed gallery (Google + uploaded)

#### **Error Handling**
1. ✅ Network failures during upload
2. ✅ Invalid file types
3. ✅ File size exceeded
4. ✅ Storage errors

### **API Testing**

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/upload \\
  -F "file=@test-image.jpg" \\
  -F "type=club_image"

# Expected response
{
  "success": true,
  "url": "/uploads/clubs/club_image_1691234567_abc123.jpg",
  "filename": "club_image_1691234567_abc123.jpg",
  "size": 1048576,
  "type": "image/jpeg",
  "originalName": "test-image.jpg"
}
```

## 🔄 Integration Points

### **ClubFormModal Integration**
- **Step 6**: Images step in club creation wizard
- **Data Binding**: Two-way data binding with form state
- **Validation**: Image requirements in form validation

### **Google Maps Import**
- **Photo Import**: Automatic photo discovery
- **Metadata Storage**: Photo references and dimensions
- **Reference Tracking**: Link between Google photos and main image

### **Admin Dashboard**
- **Quick Preview**: Thumbnail in club listings
- **Status Indicators**: Visual indication of image completion
- **Bulk Operations**: Future: batch image operations

## 🛠️ Maintenance

### **Regular Tasks**
- **Storage Monitoring**: Monitor disk usage
- **Cleanup**: Remove orphaned images
- **Backup**: Regular image backup procedures
- **Performance**: Monitor upload performance

### **Troubleshooting**

#### **Common Issues**
1. **"Upload failed"**: Check file permissions on `/public/uploads/clubs/`
2. **"File too large"**: Increase size limit in API
3. **"Invalid file type"**: Verify MIME type validation
4. **Missing thumbnails**: Check image processing

#### **Debug Steps**
1. Check browser console for JavaScript errors
2. Verify API endpoint responds correctly
3. Check file system permissions
4. Monitor server logs for errors

## 🚀 Future Enhancements

### **Short Term (Next Release)**
- **Image Optimization**: Automatic compression and resize
- **Bulk Upload**: Drag & drop multiple files
- **Image Editing**: Basic crop and rotate functionality

### **Medium Term**
- **Cloud Storage**: Migration to AWS S3/Cloudinary
- **CDN Integration**: Faster image delivery
- **Advanced Organization**: Folders and categories

### **Long Term**
- **AI Integration**: Automatic image tagging
- **Advanced Editing**: Built-in image editor
- **Performance Analytics**: Upload success metrics

## 📚 Related Documentation

- [Google Maps Import Feature](./GOOGLE_MAPS_IMPORT_FEATURE.md)
- [Club Model Documentation](./CLUB_MODEL.md)
- [Admin Panel Guide](./ADMIN_GUIDE.md)
- [API Routes Reference](./API_ROUTES.md)

## 🤝 Contributing

When working on image management features:

1. **Test Thoroughly**: Both upload and Google integration flows
2. **Consider Performance**: Large files impact user experience
3. **Security First**: Validate all inputs properly
4. **Mobile Support**: Ensure mobile upload works correctly
5. **Documentation**: Update this guide with any changes

---

*Built with ❤️ for the Tennis del Parque platform - Making club image management effortless and professional.*
