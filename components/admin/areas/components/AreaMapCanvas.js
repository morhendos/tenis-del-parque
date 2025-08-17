import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { MAP_CONFIG } from '../constants/mapConfig'

/**
 * AreaMapCanvas - Renders the Google Maps container with loading state
 * Uses forwardRef to allow parent access to the map container element
 */
const AreaMapCanvas = forwardRef(({ 
  loading = false, 
  height = MAP_CONFIG.containerHeight,
  className = '',
  loadingText = 'Loading map...',
  children
}, ref) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden relative ${className}`}>
      <div 
        ref={ref}
        className="w-full"
        style={{ height }}
        role="region"
        aria-label="Interactive map"
      />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">{loadingText}</p>
          </div>
        </div>
      )}
      
      {/* Additional overlays or controls can be passed as children */}
      {children}
    </div>
  )
})

AreaMapCanvas.displayName = 'AreaMapCanvas'

AreaMapCanvas.propTypes = {
  loading: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  loadingText: PropTypes.string,
  children: PropTypes.node
}

export default React.memo(AreaMapCanvas)
