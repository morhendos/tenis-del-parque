'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/Toast'

export default function ClubImageManager({ club, onImagesUpdate, readOnly = false }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  // Helper function to get Google Photo URL without exposing API key
  const getGooglePhotoUrl = (photoReference, maxWidth = 800) => {
    if (!photoReference) return null
    // Use our backend API endpoint to get Google Photos
    return `/api/admin/clubs/google-photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`
  }

  // Get all available images
  const getAllImages = () => {
    const images = []
    
    // Main image - handle both uploaded images and Google photos
    if (club?.images?.main) {
      images.push({
        id: 'main',
        url: club.images.main,
        type: 'main',
        source: club.images.googlePhotoReference ? 'google' : 'upload',
        title: 'Main Image',
        reference: club.images.googlePhotoReference,
        isUsed: true // This photo is actively being used by the club
      })
    } else if (club?.images?.googlePhotoReference) {
      // If no main image URL but there is a Google photo reference, use it as main
      images.push({
        id: 'main',
        url: getGooglePhotoUrl(club.images.googlePhotoReference),
        type: 'main',
        source: 'google',
        title: 'Main Image',
        reference: club.images.googlePhotoReference,
        isUsed: true
      })
    }
    
    // Gallery images
    if (club?.images?.gallery && club.images.gallery.length > 0) {
      club.images.gallery.forEach((url, index) => {
        images.push({
          id: `gallery_${index}`,
          url: url,
          type: 'gallery',
          source: 'upload',
          title: `Gallery Image ${index + 1}`,
          isUsed: true
        })
      })
    }
    
    // Google Photos (not yet used as main/gallery) - these are just available options
    if (club?.googleData?.photos && club.googleData.photos.length > 0) {
      club.googleData.photos.forEach((photo, index) => {
        const photoUrl = getGooglePhotoUrl(photo.photo_reference)
        // Skip if this photo is already used as main image (compare by reference)
        if (photoUrl && photo.photo_reference !== club?.images?.googlePhotoReference) {
          images.push({
            id: `google_${index}`,
            url: photoUrl,
            type: 'google',
            source: 'google',
            title: `Google Photo ${index + 1}`,
            reference: photo.photo_reference,
            width: photo.width,
            height: photo.height,
            isUsed: false // This photo is just available, not actively used
          })
        }
      })
    }
    
    return images
  }

  const allImages = getAllImages()

  // Navigation functions for image modal
  const navigateToImage = useCallback((index) => {
    if (allImages.length === 0) return
    const validIndex = ((index % allImages.length) + allImages.length) % allImages.length
    setSelectedImageIndex(validIndex)
    setSelectedImage(allImages[validIndex])
  }, [allImages])

  const navigatePrevious = useCallback(() => {
    navigateToImage(selectedImageIndex - 1)
  }, [navigateToImage, selectedImageIndex])

  const navigateNext = useCallback(() => {
    navigateToImage(selectedImageIndex + 1)
  }, [navigateToImage, selectedImageIndex])

  const openImageModal = (image) => {
    const imageIndex = allImages.findIndex(img => img.id === image.id)
    setSelectedImageIndex(imageIndex >= 0 ? imageIndex : 0)
    setSelectedImage(image)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigatePrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedImage(null)
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedImage, selectedImageIndex, navigatePrevious, navigateNext])

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    const uploadedUrls = []
    const errors = []
    
    try {
      for (const file of files) {
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
          
          // Create FormData for file upload
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', 'club_image')
          
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
      
      // Update club images if any uploads succeeded
      if (uploadedUrls.length > 0) {
        const updatedClub = {
          ...club,
          images: {
            ...club.images,
            gallery: [...(club.images?.gallery || []), ...uploadedUrls]
          }
        }
        
        onImagesUpdate(updatedClub)
      }
      
      // Show results
      if (errors.length > 0) {
        toast.warning(`Upload completed with ${errors.length} error(s)`)
        console.error('Upload errors:', errors)
      } else if (uploadedUrls.length > 0) {
        toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Set image as main
  const setAsMain = (image) => {
    const updatedClub = {
      ...club,
      images: {
        ...club.images,
        main: image.url,
        googlePhotoReference: image.source === 'google' ? image.reference : null
      }
    }
    onImagesUpdate(updatedClub)
    toast.success('Main image updated')
  }

  // Remove image
  const removeImage = (image) => {
    if (image.type === 'main') {
      const updatedClub = {
        ...club,
        images: {
          ...club.images,
          main: '',
          googlePhotoReference: null
        }
      }
      onImagesUpdate(updatedClub)
      toast.success('Main image removed')
    } else if (image.type === 'gallery') {
      const updatedGallery = club.images.gallery.filter(url => url !== image.url)
      const updatedClub = {
        ...club,
        images: {
          ...club.images,
          gallery: updatedGallery
        }
      }
      onImagesUpdate(updatedClub)
      toast.success('Image removed from gallery')
    } else if (image.source === 'google' && !image.isUsed && image.reference) {
      // Remove Google Photo from available pool
      const updatedGooglePhotos = club.googleData.photos.filter(
        photo => photo.photo_reference !== image.reference
      )
      const updatedClub = {
        ...club,
        googleData: {
          ...club.googleData,
          photos: updatedGooglePhotos
        }
      }
      onImagesUpdate(updatedClub)
      toast.success('Google Photo removed')
    }
    
    // Close modal if this image was being viewed
    if (selectedImage?.id === image.id) {
      setSelectedImage(null)
    }
  }

  // Import Google Photos to Vercel Blob (permanent storage)
  const importGooglePhotosToBlob = async () => {
    if (!club?._id) {
      toast.error('Club ID not found')
      return
    }

    if (!club?.googlePlaceId) {
      toast.error('This club was not imported from Google Maps')
      return
    }

    setImporting(true)

    try {
      const response = await fetch('/api/admin/clubs/import-google-photos-to-blob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club._id, maxPhotos: 5 })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import photos')
      }

      // Reload the page to get fresh data
      toast.success(`${data.message}. Reloading...`)
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Error importing Google Photos:', error)
      toast.error(error.message || 'Failed to import Google Photos')
    } finally {
      setImporting(false)
    }
  }

  // Legacy refresh (only updates photo references - NOT recommended)
  const refreshGooglePhotos = async () => {
    if (!club?._id) {
      toast.error('Club ID not found')
      return
    }

    if (!club?.googlePlaceId) {
      toast.error('This club was not imported from Google Maps')
      return
    }

    setRefreshing(true)

    try {
      const response = await fetch('/api/admin/clubs/refresh-google-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club._id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh photos')
      }

      // Update club data with refreshed photos
      onImagesUpdate(data.club)

      toast.success(data.message)
    } catch (error) {
      console.error('Error refreshing Google Photos:', error)
      toast.error(error.message || 'Failed to refresh Google Photos')
    } finally {
      setRefreshing(false)
    }
  }

  // Image preview component
  const ImagePreview = ({ image, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
      xl: 'w-48 h-48'
    }

    // Can delete all images in edit mode - different actions for different types
    const canDelete = !readOnly
    const canSetAsMain = !readOnly && image.type !== 'main'

    return (
      <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden border-2 ${
        image.type === 'main' ? 'border-green-500' : 'border-gray-200'
      } group cursor-pointer`}>
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300'
            e.target.onerror = null
          }}
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={() => openImageModal(image)}
              className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 shadow-lg"
              title="View Full Size"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            {canSetAsMain && (
              <button
                onClick={() => setAsMain(image)}
                className="p-1.5 bg-green-500 rounded-full text-white hover:bg-green-600 shadow-lg"
                title="Set as Main Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(image)
                }}
                className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                title={
                  image.source === 'google' && image.isUsed 
                    ? `Remove Google Photo from ${image.type === 'main' ? 'main image' : 'gallery'}`
                    : image.source === 'google' && !image.isUsed
                    ? 'Remove Google Photo from available photos'
                    : `Delete ${image.type === 'main' ? 'Main' : 'Gallery'} Image`
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Image type badge */}
        <div className="absolute top-1 left-1">
          {image.type === 'main' && (
            <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded font-medium">Main</span>
          )}
          {image.source === 'google' && (
            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded font-medium">
              {image.isUsed ? 'Google' : 'Available'}
            </span>
          )}
        </div>

        {/* Delete indicator for all deletable images */}
        {canDelete && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Club Images</h3>
        {!readOnly && (
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Images
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

      {/* Main image */}
      {club?.images?.main ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Main Image</h4>
          <div className="flex space-x-4">
            <ImagePreview 
              image={allImages.find(img => img.type === 'main')} 
              size="xl" 
            />
            <div className="flex-1 space-y-2">
              <div className="text-sm text-gray-600">
                <p><strong>Source:</strong> {club.images.googlePhotoReference ? 'Google Maps' : 'Uploaded'}</p>
                {club.images.googlePhotoReference && (
                  <p className="text-xs text-gray-500">From Google Maps import</p>
                )}
              </div>
              {!readOnly && (
                <button
                  onClick={() => removeImage(allImages.find(img => img.type === 'main'))}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Main Image
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No main image set</p>
          {!readOnly && (
            <p className="text-xs text-gray-500">Upload images or select from Google Photos below</p>
          )}
        </div>
      )}

      {/* Available images grid */}
      {allImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Available Images ({allImages.length})
            </h4>
            {!readOnly && (
              <div className="text-xs text-gray-500">
                Hover over images to see edit options
              </div>
            )}
          </div>
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

      {/* Import button for clubs with Google Place ID */}
      {!readOnly && club?.googlePlaceId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">
                📸 Import Photos from Google Maps
              </h4>
              <p className="text-xs text-green-700">
                Downloads photos and saves them permanently to Vercel Blob storage. These images will never expire.
              </p>
            </div>
            <button
              onClick={importGooglePhotosToBlob}
              disabled={importing}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              title="Import photos permanently to Vercel Blob"
            >
              {importing ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Import to Blob Storage
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Google Photos section */}
      {club?.googleData?.photos && club.googleData.photos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-sm font-medium text-blue-900">
                Available Google Maps Photos ({club.googleData.photos.length})
              </h4>
            </div>
            {!readOnly && club?.googlePlaceId && (
              <button
                onClick={importGooglePhotosToBlob}
                disabled={importing}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                title="Re-import photos to Vercel Blob (permanent)"
              >
                {importing ? (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-import to Blob
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-blue-700 mb-3">
            These photos were imported from Google Maps. You can set any as main image or remove them from this list.
            <span className="block mt-1 text-blue-600 font-medium">
              💡 You can now remove unwanted Google Photos by clicking the delete button on each photo.
            </span>
          </p>
          
          <div className="grid grid-cols-6 gap-2">
            {club.googleData.photos.slice(0, 6).map((photo, index) => {
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
                height: photo.height,
                isUsed: false
              }
              
              return <ImagePreview key={image.id} image={image} size="md" />
            })}
          </div>
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
            />
            
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Delete button in modal for all images */}
            {!readOnly && (
              <button
                onClick={() => removeImage(selectedImage)}
                className="absolute top-4 right-16 p-2 bg-red-500 bg-opacity-75 text-white rounded-full hover:bg-opacity-100 transition-all"
                title={selectedImage.source === 'google' && selectedImage.isUsed 
                  ? 'Remove Google Photo from use' 
                  : selectedImage.source === 'google' && !selectedImage.isUsed
                  ? 'Remove Google Photo from available photos'
                  : 'Delete Image'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            {/* Left arrow button */}
            {allImages.length > 1 && (
              <button
                onClick={navigatePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
                title="Previous image (←)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Right arrow button */}
            {allImages.length > 1 && (
              <button
                onClick={navigateNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
                title="Next image (→)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image counter and info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <p className="font-medium">{selectedImage.title}</p>
              <p className="text-sm opacity-75">Source: {selectedImage.source === 'google' ? 'Google Maps' : 'Uploaded'}</p>
              {allImages.length > 1 && (
                <p className="text-sm opacity-75">{selectedImageIndex + 1} of {allImages.length}</p>
              )}
              {selectedImage.width && selectedImage.height && (
                <p className="text-xs opacity-75">{selectedImage.width} × {selectedImage.height}px</p>
              )}
            </div>

            {/* Navigation hint */}
            {allImages.length > 1 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
                Use ← → keys or click arrows to navigate
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
        <p><strong>💡 Image Management Tips:</strong></p>
        <ul className="mt-1 space-y-1">
          <li>• <strong>Main Image:</strong> Used in club listings and headers</li>
          <li>• <strong>Google Photos:</strong> Can be set as main image or removed from available pool</li>
          <li>• <strong>Gallery:</strong> Additional photos for the club page</li>
          <li>• <strong>Uploaded Images:</strong> Can be completely deleted</li>
          <li>• <strong>Available Google Photos:</strong> Can be removed to clean up your photo list</li>
          <li>• Click any image to view full size or set as main</li>
          <li>• Supported formats: JPEG, PNG, WebP (max 5MB each)</li>
        </ul>
      </div>
    </div>
  )
}
