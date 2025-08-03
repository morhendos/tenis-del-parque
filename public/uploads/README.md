# Uploads Directory

This directory stores uploaded club images. The structure is:

```
uploads/
├── clubs/          # Club images
│   ├── main/       # Main club images (auto-organized)
│   └── gallery/    # Gallery images (auto-organized)
└── ...other types
```

## File Naming Convention

Files are automatically named with the pattern:
- `club_image_[timestamp]_[random].jpg`
- Example: `club_image_1691234567_abc123.jpg`

## Supported Formats

- JPEG/JPG (recommended)
- PNG
- WebP

## File Limits

- Maximum size: 5MB per image
- No limit on number of images per club

## Storage Notes

- Files are stored locally in `/public/uploads/`
- This makes them directly accessible via URL
- For production, consider cloud storage (S3, Cloudinary) for better performance
- Remember to backup this directory regularly
