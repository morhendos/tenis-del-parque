import React, { useState } from 'react'

export default function ImportCSVModal({ 
  show, 
  onClose, 
  onImport, 
  importResult 
}) {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)

  if (!show) return null

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
    } else {
      alert('Please select a CSV file')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    try {
      await onImport(file)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setImporting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Import Leagues from CSV</h3>
        
        {!importResult ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with league data. The CSV should have the following columns:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                <li>name (required)</li>
                <li>type (public/private)</li>
                <li>location_city (required)</li>
                <li>location_region (required)</li>
                <li>location_venue</li>
                <li>surface (clay/hard/grass)</li>
                <li>ball_type (pressurized/depressurized)</li>
                <li>match_format (best_of_3/best_of_5/single_set)</li>
                <li>season_name</li>
                <li>season_status (draft/registration_open/active/completed)</li>
              </ul>
              <div className="mb-2">
                <a 
                  href="/leagues-import-template.csv" 
                  download
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Download CSV template
                </a>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If a league with the same name already exists, its information will be updated. 
                Each league can include season information which will be created or updated accordingly.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={importing}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`mb-4 p-4 rounded-lg ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {importResult.message}
              </p>
              {importResult.success && (
                <div className="mt-2 text-sm text-green-700">
                  <p>Created: {importResult.created || 0} leagues</p>
                  <p>Updated: {importResult.updated || 0} leagues</p>
                </div>
              )}
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                  {importResult.errors.map((error, index) => (
                    <p key={index} className="text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
