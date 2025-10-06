import React, { useState } from 'react'

export default function ImportCSVModal({ 
  show, 
  onClose, 
  onImport, 
  leagues, 
  selectedLeague,
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

  // Create a sample CSV template
  const downloadTemplate = () => {
    const template = `name,email,whatsapp,eloRating,level,status,leagueSlug
John Doe,john@example.com,+34600123456,1200,intermediate,pending,sotogrande-summer-2025
Jane Smith,jane@example.com,+34600123457,1250,advanced,confirmed,sotogrande-summer-2025
Bob Johnson,bob@example.com,+34600123458,1180,beginner,active,marbella-summer-2025`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'players-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Import Players from CSV</h3>
        
        {!importResult ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with player data. Players can be assigned to leagues during import.
              </p>

              <div className="mb-4">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template CSV
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="font-semibold text-gray-700">Required Fields:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    <li>name</li>
                    <li>email</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-700">Optional Fields:</p>
                  <ul className="text-gray-600 list-disc list-inside">
                    <li>whatsapp</li>
                    <li>eloRating (default: 1200)</li>
                    <li>level (beginner/intermediate/advanced)</li>
                    <li>status (waiting/pending/confirmed/active/inactive)</li>
                    <li>leagueSlug (e.g., sotogrande-summer-2025)</li>
                    <li>registrationDate (YYYY-MM-DD)</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ League Assignment:</strong> To assign players to leagues, include the <code className="bg-yellow-100 px-1 rounded">leagueSlug</code> column 
                  with the exact league slug (e.g., "sotogrande-summer-2025"). You can find league slugs in the Leagues page.
                </p>
              </div>

              {selectedLeague && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Default League: {leagues.find(l => l._id === selectedLeague)?.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Players without a leagueSlug will be assigned to this league
                  </p>
                </div>
              )}

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Example CSV:</strong>
                </p>
                <pre className="text-xs overflow-x-auto bg-white p-2 rounded border">
{`name,email,whatsapp,level,status,leagueSlug
John Doe,john@example.com,+34600123456,intermediate,pending,sotogrande-summer-2025
Jane Smith,jane@example.com,+34600123457,advanced,confirmed,marbella-summer-2025`}
                </pre>
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

            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>📝 Note:</strong> 
              </p>
              <ul className="text-sm text-green-800 mt-1 list-disc list-inside">
                <li>Existing players (matched by email) will be updated</li>
                <li>Players can be in multiple leagues (each export row = one registration)</li>
                <li>User accounts are NOT created - invite players separately via Users → Invite</li>
              </ul>
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
                  <p>Created: {importResult.created || 0} players</p>
                  <p>Updated: {importResult.updated || 0} players</p>
                </div>
              )}
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded text-sm space-y-1">
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
