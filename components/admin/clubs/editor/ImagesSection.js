'use client'

import ClubImageManager from '../ClubImageManager'

export default function ImagesSection({ formData, handleChange, club }) {
  const handleImagesUpdate = (updatedClub) => {
    // Update both images and googleData when available
    handleChange('images', updatedClub.images)
    
    // Also update googleData if it exists (for Google Photos deletion)
    if (updatedClub.googleData) {
      handleChange('googleData', updatedClub.googleData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Club Images</h2>
        <p className="text-gray-600">Upload photos to showcase the club</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ClubImageManager
          club={{ ...formData, _id: club?._id }}
          onImagesUpdate={handleImagesUpdate}
          readOnly={false}
        />
        
        {formData.images.main && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">
                Main image set! Your club will look great in the directory.
              </p>
            </div>
          </div>
        )}

        {!formData.images.main && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">No main image selected</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Upload an image to make your club more attractive to players
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📷 Image Guidelines</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality photos (minimum 800x600 pixels)</li>
          <li>• Show courts, facilities, and club atmosphere</li>
          <li>• Avoid heavily edited or filtered images</li>
          <li>• Include both indoor and outdoor areas if available</li>
          <li>• The main image will be displayed in search results</li>
        </ul>
      </div>
    </div>
  )
}
