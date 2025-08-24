import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Valid upload types and their directories
const UPLOAD_TYPES = {
  'club_image': 'clubs',
  'city_image': 'cities'
}

// Check if we're in production (Vercel)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL

// Generate secure filename
const generateFilename = (originalName, type) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = getExtensionFromMimeType(originalName)
  return `${type}_${timestamp}_${random}.${extension}`
}

// Get file extension from mime type or filename
const getExtensionFromMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'jpg'
  if (ext === '.png') return 'png'
  if (ext === '.webp') return 'webp'
  return 'jpg' // default
}

// Validate file type
const isValidImageType = (file) => {
  return ALLOWED_TYPES.includes(file.type)
}

// Validate file size
const isValidFileSize = (file) => {
  return file.size <= MAX_FILE_SIZE
}

// Validate upload type
const isValidUploadType = (type) => {
  return UPLOAD_TYPES.hasOwnProperty(type)
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type') || 'club_image'
    
    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate upload type
    if (!isValidUploadType(type)) {
      return NextResponse.json(
        { error: `Invalid upload type. Allowed types: ${Object.keys(UPLOAD_TYPES).join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!isValidImageType(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (!isValidFileSize(file)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }
    
    // Generate filename and paths
    const filename = generateFilename(file.name, type)
    const subDir = UPLOAD_TYPES[type]
    
    try {
      let publicUrl = ''
      
      if (isProduction) {
        // Use Vercel Blob Storage in production
        console.log('Using Vercel Blob Storage for upload')
        
        // Upload to Vercel Blob with folder structure
        const blob = await put(`${subDir}/${filename}`, file, {
          access: 'public',
          addRandomSuffix: false
        })
        
        publicUrl = blob.url
        
        console.log('Upload successful to Vercel Blob:', publicUrl)
        
      } else {
        // Use local filesystem in development
        console.log('Using local filesystem for upload')
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir)
        const filepath = path.join(uploadDir, filename)
        
        // Ensure upload directory exists
        try {
          await mkdir(uploadDir, { recursive: true })
        } catch (error) {
          // Directory might already exist, that's fine
          if (error.code !== 'EEXIST') {
            console.error('Error creating upload directory:', error)
            return NextResponse.json(
              { error: 'Failed to create upload directory' },
              { status: 500 }
            )
          }
        }
        
        // Convert file to buffer and write to filesystem
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        await writeFile(filepath, buffer)
        
        publicUrl = `/uploads/${subDir}/${filename}`
        
        console.log('Upload successful to local filesystem:', publicUrl)
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type,
        originalName: file.name,
        uploadType: type,
        storage: isProduction ? 'vercel-blob' : 'local',
        message: isProduction 
          ? 'File uploaded to Vercel Blob Storage' 
          : 'File uploaded to local filesystem'
      })
      
    } catch (uploadError) {
      console.error('Upload error:', uploadError)
      
      // Provide helpful error message for missing Blob token
      if (uploadError.message?.includes('BLOB_READ_WRITE_TOKEN')) {
        return NextResponse.json(
          { 
            error: 'Vercel Blob Storage not configured. Please add BLOB_READ_WRITE_TOKEN to your environment variables.',
            details: 'Visit https://vercel.com/docs/storage/vercel-blob to set up Blob Storage.'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to save file',
          details: uploadError.message 
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      allowedTypes: Object.keys(UPLOAD_TYPES),
      maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      allowedFormats: ALLOWED_TYPES,
      storage: isProduction ? 'vercel-blob' : 'local-filesystem',
      environment: process.env.NODE_ENV,
      blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
