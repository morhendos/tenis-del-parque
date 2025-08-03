'use client'

import { useState, useRef } from 'react'

export default function CityImageManager({ city, onImagesUpdate, readOnly = false }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [imageErrors, setImageErrors] = useState(new Set())
  const fileInputRef = useRef(null)

  // Helper function to get Google Photo URL without exposing API key
  const getGooglePhotoUrl = (photoReference, maxWidth = 800) => {
    if (!photoReference) return null
    // Use our backend API endpoint to get Google Photos
    return `/api/admin/cities/google-photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`
  }

  // Helper function to get proper fallback image
  const getFallbackImageUrl = (width = 800, height = 600, seed = 1) => {
    return `https://picsum.photos/${width}/${height}?random=${seed}`
  }

  // Helper function to handle image load errors
  const handleImageError = (imageId, width = 800, height = 600) => {
    setImageErrors(prev => new Set(prev).add(imageId))
    // Use a deterministic seed based on city name for consistent fallbacks
    const seed = city?.name?.es ? city.name.es.length + city.slug?.length || 0 : Math.floor(Math.random() * 1000)
    return getFallbackImageUrl(width, height, seed)
  }

  // Get all available images with better error handling
  const getAllImages = () => {
    const images = []
    
    // Main image
    if (city?.images?.main) {
      images.push({
        id: 'main',
        url: city.images.main,
        type: 'main',
        source: city.images.googlePhotoReference ? 'google' : 'upload',
        title: 'Main Image',
        reference: city.images.googlePhotoReference
      })
    }
    
    // Gallery images
    if (city?.images?.gallery && city.images.gallery.length > 0) {
      city.images.gallery.forEach((url, index) => {
        images.push({
          id: `gallery_${index}`,
          url: url,
          type: 'gallery',
          source: 'upload',
          title: `Gallery Image ${index + 1}`
        })
      })
    }
    
    // Google Photos (not yet used as main/gallery)
    if (city?.googleData?.photos && city.googleData.photos.length > 0) {
      city.googleData.photos.forEach((photo, index) => {
        const photoUrl = getGooglePhotoUrl(photo.photo_reference)
        if (photoUrl && photoUrl !== city?.images?.main) {
          images.push({
            id: `google_${index}`,
            url: photoUrl,
            type: 'google',
            source: 'google',
            title: `Google Photo ${index + 1}`,
            reference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })
        }
      })
    }
    
    return images
  }

  const allImages = getAllImages()

  // Handle file upload with progress
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    setUploadProgress(0)
    const uploadedUrls = []
    const errors = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            errors.push(`${file.name}: File too large (max 5MB)`)
            continue
          }
          
          // Validate file type
          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            errors.push(`${file.name}: Invalid file type (only JPEG, PNG, WebP allowed)`)
            continue
          }
          
          // Update progress
          setUploadProgress(Math.round((i / files.length) * 100))
          
          // Create FormData for file upload
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', 'city_image')
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          const data = await response.json()
          
          if (response.ok && data.success) {
            uploadedUrls.push(data.url)
          } else {
            errors.push(`${file.name}: ${data.error || 'Upload failed'}`)
          }
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError)
          errors.push(`${file.name}: Upload failed`)
        }
      }
      
      setUploadProgress(100)
      
      // Update city images if any uploads succeeded
      if (uploadedUrls.length > 0) {
        const updatedImages = {
          ...city.images,
          gallery: [...(city.images?.gallery || []), ...uploadedUrls]
        }
        
        // If no main image exists, set the first uploaded image as main
        if (!city.images?.main && uploadedUrls.length > 0) {
          updatedImages.main = uploadedUrls[0]
          updatedImages.googlePhotoReference = null
        }
        
        onImagesUpdate(updatedImages)
      }
      
      // Show results
      if (errors.length > 0) {
        alert(`Upload completed with errors:\n${errors.join('\n')}`)
      } else if (uploadedUrls.length > 0) {
        alert(`Successfully uploaded ${uploadedUrls.length} image(s)`)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Set image as main
  const setAsMain = (image) => {
    const updatedImages = {
      ...city.images,
      main: image.url,
      googlePhotoReference: image.source === 'google' ? image.reference : null
    }
    onImagesUpdate(updatedImages)
  }

  // Remove image
  const removeImage = (image) => {
    if (image.type === 'main') {
      const updatedImages = {
        ...city.images,
        main: '',
        googlePhotoReference: null
      }
      onImagesUpdate(updatedImages)
    } else if (image.type === 'gallery') {
      const updatedGallery = city.images.gallery.filter(url => url !== image.url)
      const updatedImages = {
        ...city.images,
        gallery: updatedGallery
      }
      onImagesUpdate(updatedImages)
    }
  }

  // Image preview component with better error handling
  const ImagePreview = ({ image, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
      xl: 'w-48 h-48'
    }

    const [imgSrc, setImgSrc] = useState(image.url)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
      // Use a proper fallback image with deterministic seed
      const seed = city?.name?.es ? city.name.es.charCodeAt(0) + (image.id ? image.id.length : 0) : Math.floor(Math.random() * 1000)
      const fallbackUrl = getFallbackImageUrl(400, 300, seed)
      setImgSrc(fallbackUrl)
    }

    return (
      <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden border-2 ${
        image.type === 'main' ? 'border-green-500' : 'border-gray-200'
      } group bg-gray-100`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        <img
          src={imgSrc}
          alt={image.title}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
        
        {hasError && (
          <div className="absolute top-1 right-1">
            <span className="px-1 py-0.5 bg-yellow-500 text-white text-xs rounded">Fallback</span>
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={() => setSelectedImage(image)}
              className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100"
              title="View Full Size"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            {!readOnly && image.type !== 'main' && (
              <button
                onClick={() => setAsMain(image)}
                className="p-1 bg-green-500 rounded-full text-white hover:bg-green-600"
                title="Set as Main Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            
            {!readOnly && image.type !== 'google' && (
              <button
                onClick={() => removeImage(image)}
                className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                title="Remove Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Image type badge */}
        <div className="absolute top-1 left-1">
          {image.type === 'main' && (
            <span className="px-1 py-0.5 bg-green-500 text-white text-xs rounded">Main</span>
          )}
          {image.source === 'google' && (
            <span className="px-1 py-0.5 bg-blue-500 text-white text-xs rounded">Google</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">City Images</h3>
        {!readOnly && (
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{uploadProgress}%</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload Images</span>
                </>
              )}
            </button>
            {allImages.length > 4 && (
              <button
                onClick={() => setShowGallery(true)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
              >
                View All ({allImages.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* File input */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          className="hidden"
        />
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm text-blue-700">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Main image */}
      {city?.images?.main ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Main City Image</h4>
          <div className="flex space-x-4">
            <ImagePreview 
              image={allImages.find(img => img.type === 'main')} 
              size="xl" 
            />
            <div className="flex-1 space-y-2">
              <div className="text-sm text-gray-600">
                <p><strong>Source:</strong> {city.images.googlePhotoReference ? 'Google Maps' : 'Uploaded'}</p>
                {city.images.googlePhotoReference && (
                  <p className="text-xs text-gray-500">From Google Maps city search</p>
                )}
              </div>
              {!readOnly && (
                <button
                  onClick={() => removeImage(allImages.find(img => img.type === 'main'))}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove Main Image</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No main city image set</p>
          {!readOnly && (
            <p className="text-xs text-gray-500">Upload images or select from Google Photos below</p>
          )}
        </div>
      )}

      {/* Available images grid */}
      {allImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Available Images ({allImages.length})
          </h4>
          <div className="grid grid-cols-6 gap-2">
            {allImages.slice(0, showGallery ? allImages.length : 6).map((image) => (
              <ImagePreview key={image.id} image={image} size="md" />
            ))}
          </div>
          
          {allImages.length > 6 && !showGallery && (
            <button
              onClick={() => setShowGallery(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              +{allImages.length - 6} more images
            </button>
          )}
        </div>
      )}

      {/* Google Photos section */}
      {city?.googleData?.photos && city.googleData.photos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h4 className="text-sm font-medium text-blue-900">
              Google Maps Photos ({city.googleData.photos.length})
            </h4>
          </div>
          <p className="text-xs text-blue-700 mb-3">
            These photos were automatically found when searching for the city on Google Maps. Click any photo to set as main image.
          </p>
          
          <div className="grid grid-cols-6 gap-2">
            {city.googleData.photos.slice(0, 6).map((photo, index) => {
              const photoUrl = getGooglePhotoUrl(photo.photo_reference)
              if (!photoUrl) return null
              
              const image = {
                id: `google_${index}`,
                url: photoUrl,
                type: 'google',
                source: 'google',
                title: `Google Photo ${index + 1}`,
                reference: photo.photo_reference,
                width: photo.width,
                height: photo.height
              }
              
              return <ImagePreview key={image.id} image={image} size="md" />
            })}
          </div>
        </div>
      )}

      {/* No images state */}
      {allImages.length === 0 && (!city?.googleData?.photos || city.googleData.photos.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm">No images available for this city</p>
          <p className="text-xs mt-1">Try searching for the city again to fetch Google Photos, or upload custom images.</p>
        </div>
      )}

      {/* Image viewer modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const seed = city?.name?.es ? city.name.es.charCodeAt(0) + selectedImage.id.length : Math.floor(Math.random() * 1000)
                e.target.src = getFallbackImageUrl(800, 600, seed)
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <p className="font-medium">{selectedImage.title}</p>
              <p className="text-sm opacity-75">Source: {selectedImage.source === 'google' ? 'Google Maps' : 'Uploaded'}</p>
              {selectedImage.width && selectedImage.height && (
                <p className="text-xs opacity-75">{selectedImage.width} × {selectedImage.height}px</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
        <p><strong>🏙️ City Image Management Tips:</strong></p>
        <ul className="mt-1 space-y-1">
          <li>• <strong>Main Image:</strong> Used in city listings and directory pages</li>
          <li>• <strong>Google Photos:</strong> Automatically discovered from Google Maps</li>
          <li>• <strong>Gallery:</strong> Additional photos for the city page</li>
          <li>• Click any image to view full size or set as main</li>
          <li>• Supported formats: JPEG, PNG, WebP (max 5MB each)</li>
          <li>• Images use quality fallbacks if originals fail to load</li>
        </ul>
      </div>
    </div>
  )
}
