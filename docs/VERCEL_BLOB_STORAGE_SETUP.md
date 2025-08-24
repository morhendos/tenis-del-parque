# Vercel Blob Storage Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable Blob Storage in Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Blob Storage**
5. Choose your preferred region (closest to your users)
6. Click **Create**

### Step 2: Connect to Your Project

1. After creation, click **Connect Project**
2. Select your `tenis-del-parque` project
3. Choose the environments (Production, Preview, Development)
4. Click **Connect**

### Step 3: Environment Variables Are Auto-Added! ✨

Vercel automatically adds the required environment variable:
- `BLOB_READ_WRITE_TOKEN` - Added automatically to your project

No manual configuration needed!

### Step 4: Install Dependencies

```bash
# If you haven't already
npm install @vercel/blob
```

### Step 5: Deploy

```bash
git push
```

That's it! Your uploads will now work in production.

## 📝 How It Works

The upload API (`/api/upload/route.js`) now:
- **In Development**: Uses local filesystem (`/public/uploads/`)
- **In Production**: Uses Vercel Blob Storage automatically
- **Auto-detects** environment - no code changes needed

## 🧪 Testing

### Test Locally (Development)
```bash
npm run dev
# Uploads will save to /public/uploads/
```

### Test in Production
1. Deploy to Vercel
2. Try uploading a city image
3. Check the response - it should show `"storage": "vercel-blob"`

### Debug Endpoint
Visit `/api/upload` to see configuration:
```json
{
  "storage": "vercel-blob",
  "environment": "production",
  "blobConfigured": true
}
```

## 💰 Pricing

Vercel Blob Storage Free Tier includes:
- **5 GB** storage
- **10 GB** bandwidth per month
- Perfect for your tennis app!

## 🎯 Benefits

1. **Zero Configuration** - Vercel handles everything
2. **Global CDN** - Images served fast worldwide
3. **Automatic URLs** - Public URLs generated automatically
4. **Works Everywhere** - Production, preview, and development
5. **No Filesystem Issues** - Solves the read-only problem

## 🔍 Troubleshooting

### "BLOB_READ_WRITE_TOKEN not configured"
- Make sure you've connected Blob Storage to your project
- Redeploy after connecting

### Images not loading
- Check if the Blob URL is accessible
- Verify the image was uploaded successfully

### Upload fails in production
- Check Vercel Functions logs
- Verify Blob Storage is connected

## 📊 Monitor Usage

1. Go to Vercel Dashboard → Storage → Your Blob Store
2. View usage statistics
3. Monitor storage and bandwidth

## 🏗️ Architecture

```
User uploads image
        ↓
   /api/upload
        ↓
Is Production? 
   ↙        ↘
  Yes        No
   ↓          ↓
Vercel    Local
 Blob    Filesystem
   ↓          ↓
Return URL to client
```

## ✅ Complete Feature Set

With this implementation, you now have:
1. **Google Photo Refresh** - Working in edit mode ✅
2. **Custom Image Uploads** - Working in production ✅
3. **Automatic Environment Detection** - No config needed ✅
4. **Backwards Compatible** - Existing code works ✅

## 🚢 Ready to Deploy!

Your app now has complete image management:
- Scrape photos from Google Maps
- Upload custom images
- Works in both development and production
- No configuration headaches

---

**Created**: August 24, 2025
**Status**: Production Ready 🎉
