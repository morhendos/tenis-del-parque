'use client'

import CityImageManager from '../CityImageManager'

export default function ImagesSection({ formData, cityPhotos, onImagesUpdate }) {
  // Prepare city data for the image manager
  const cityData = {
    ...formData,
    googleData: {
      photos: cityPhotos || []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">City Images</h2>
        <p className="text-gray-600">
          Manage images that will be displayed on the city page and in listings
        </p>
      </div>

      {/* Image Stats */}
      {(formData.images.main || cityPhotos?.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formData.images.main ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Main Image</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formData.images.gallery?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Gallery Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {cityPhotos?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Google Photos</div>
            </div>
          </div>
        </div>
      )}

      {/* Image Manager */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CityImageManager
          city={cityData}
          onImagesUpdate={onImagesUpdate}
          readOnly={false}
        />
      </div>
    </div>
  )
}