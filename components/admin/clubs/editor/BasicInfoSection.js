'use client'

export default function BasicInfoSection({ formData, handleChange, club }) {
  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Enter the fundamental details about the club</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Name and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Club Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                handleChange('name', e.target.value)
                if (!club) {
                  handleChange('slug', generateSlug(e.target.value))
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              placeholder="e.g., Tennis Club Marbella"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2">/clubs/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
                placeholder="tennis-club-marbella"
                required
              />
            </div>
          </div>
        </div>

        {/* Status and Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              min="0"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="w-4 h-4 text-parque-purple rounded focus:ring-parque-purple"
              />
              <span className="text-sm font-medium text-gray-700">Featured Club</span>
              {formData.featured && <span className="text-yellow-500">⭐</span>}
            </label>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Spanish)
            </label>
            <textarea
              value={formData.description.es}
              onChange={(e) => handleChange('description.es', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              rows={4}
              placeholder="Descripción del club en español..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.es.length}/500 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (English)
            </label>
            <textarea
              value={formData.description.en}
              onChange={(e) => handleChange('description.en', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              rows={4}
              placeholder="Club description in English..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.en.length}/500 characters
            </p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {['family-friendly', 'professional', 'beginner-friendly', 'tournaments', 
              'social-club', 'hotel-club', 'municipal', 'private', 'academy'].map(tag => {
              const isSelected = formData.tags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      handleChange('tags', formData.tags.filter(t => t !== tag))
                    } else {
                      handleChange('tags', [...formData.tags, tag])
                    }
                  }}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${isSelected 
                      ? 'bg-parque-purple text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}