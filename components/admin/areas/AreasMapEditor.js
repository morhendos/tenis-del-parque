// DEPRECATED: This file has been consolidated into AreasMapView.js
// 
// The Areas Editor functionality is now integrated into the unified AreasMapView component
// with view/edit mode toggle. This file can be safely deleted.
//
// Use AreasMapView.js instead, which includes:
// - All existing map viewing functionality  
// - Edit mode toggle for area editing
// - Drawing tools for custom areas
// - Unified interface with proper library loading
//
// TODO: Delete this file after confirming no imports remain

export default function AreasMapEditor() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-yellow-800 font-medium mb-2">Component Deprecated</h3>
      <p className="text-yellow-700">
        This component has been consolidated into AreasMapView.js. 
        Please use the unified Areas Management page instead.
      </p>
    </div>
  )
}