import React, { useState } from 'react'

export default function ImportCSVModal({ show, onClose, onImport, importResult }) {
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
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Import Cities from CSV</h3>
        
        {!importResult ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with city data
              </p>
              
              <div className="mb-4">
                <a
                  href="/cities-import-template.csv"
                  download="cities-import-template.csv"
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template CSV
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="font-semibold text-gray-700">Required:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    <li>slug</li>
                    <li>nameEs</li>
                    <li>nameEn</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-700">Optional:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    <li>province</li>
                    <li>country</li>
                    <li>lat, lng</li>
                    <li>status</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <pre className="text-xs overflow-x-auto bg-white p-2 rounded">
{`slug,nameEs,nameEn,province,country
sotogrande,Sotogrande,Sotogrande,Cádiz,Spain`}
                </pre>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" disabled={importing}>
                Cancel
              </button>
              <button onClick={handleImport} disabled={!file || importing} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
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
                  <p>Created: {importResult.created || 0}</p>
                  <p>Updated: {importResult.updated || 0}</p>
                </div>
              )}
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
                  {importResult.errors.map((error, i) => (
                    <p key={i} className="text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
