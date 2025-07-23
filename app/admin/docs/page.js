'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDocsPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()

  useEffect(() => {
    fetchDocs()
  }, [])

  const fetchDocs = async () => {
    try {
      const response = await fetch('/api/admin/docs')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        throw new Error('Failed to fetch docs')
      }

      const data = await response.json()
      setDocs(data.files)
    } catch (error) {
      console.error('Error fetching docs:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Normalize file names to proper titles
  const normalizeTitle = (fileName) => {
    // Remove .md extension
    let title = fileName.replace('.md', '')
    
    // Replace underscores with spaces
    title = title.replace(/_/g, ' ')
    
    // Handle common abbreviations and patterns
    title = title.replace(/^SEO\s+/i, 'SEO: ')
    title = title.replace(/\bTO\b/g, 'to')
    title = title.replace(/\bLED\b/g, 'Led')
    title = title.replace(/\bPR\b/g, 'PR:')
    
    // Convert to title case but preserve uppercase abbreviations
    title = title.replace(/\b\w+/g, (word) => {
      // Keep certain words uppercase
      if (['SEO', 'TODO', 'API', 'UI', 'URL', 'CSV', 'JSON', 'XML', 'HTML', 'CSS', 'JS'].includes(word.toUpperCase())) {
        return word.toUpperCase()
      }
      // Keep certain words lowercase
      if (['to', 'of', 'and', 'the', 'in', 'for', 'a', 'an'].includes(word.toLowerCase()) && word !== title.split(' ')[0]) {
        return word.toLowerCase()
      }
      // Capitalize first letter of other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    
    return title
  }

  const getCategoryFromFileName = (fileName) => {
    if (fileName.includes('SEO')) return 'SEO & Marketing'
    if (fileName.includes('PHASE') || fileName.includes('STATUS')) return 'Project Management'
    if (fileName.includes('PLAN') || fileName.includes('STRATEGY')) return 'Strategy & Planning'
    if (fileName.includes('IMPLEMENTATION') || fileName.includes('INTEGRATION')) return 'Technical Implementation'
    if (fileName.includes('MESSAGES') || fileName.includes('PRODUCT')) return 'Product Features'
    if (fileName.includes('TODO') || fileName.includes('CHECKLIST')) return 'Tasks & Checklists'
    return 'General Documentation'
  }

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'SEO & Marketing': '🔍',
      'Project Management': '📋',
      'Strategy & Planning': '🎯',
      'Technical Implementation': '🚀',
      'Product Features': '🛍️',
      'Tasks & Checklists': '✅',
      'General Documentation': '📄'
    }
    return emojiMap[category] || '📄'
  }

  // Group docs by category
  const groupedDocs = docs.reduce((acc, doc) => {
    const category = getCategoryFromFileName(doc.name)
    if (!acc[category]) acc[category] = []
    acc[category].push(doc)
    return acc
  }, {})

  // Get unique categories for filter
  const categories = ['all', ...Object.keys(groupedDocs)]

  // Filter docs based on selected category
  const filteredDocs = selectedCategory === 'all' 
    ? docs 
    : docs.filter(doc => getCategoryFromFileName(doc.name) === selectedCategory)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading documentation</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📚 Project Documentation</h1>
        <p className="mt-2 text-gray-600">Browse and read all project documentation files</p>
      </div>

      {/* Category Filter Menu */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-parque-purple text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? (
                <>📋 All Documents ({docs.length})</>  
              ) : (
                <>
                  {getCategoryEmoji(category)} {category} ({groupedDocs[category]?.length || 0})
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {selectedCategory === 'all' ? (
        // Show grouped view when "all" is selected
        <div className="space-y-8">
          {Object.entries(groupedDocs).map(([category, categoryDocs]) => (
            <div key={category}>
              <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-4">
                <span className="text-2xl mr-2">{getCategoryEmoji(category)}</span>
                {category}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryDocs.map((doc) => (
                  <Link
                    key={doc.name}
                    href={`/admin/docs/${doc.name.replace('.md', '')}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-parque-purple group"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-parque-purple transition-colors break-words">
                      {normalizeTitle(doc.name)}
                    </h2>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>{formatDate(doc.modified)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show filtered view
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <Link
              key={doc.name}
              href={`/admin/docs/${doc.name.replace('.md', '')}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-parque-purple group"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-parque-purple transition-colors break-words">
                  {normalizeTitle(doc.name)}
                </h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{formatFileSize(doc.size)}</span>
                <span>{formatDate(doc.modified)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {docs.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documentation found</h3>
          <p className="mt-1 text-sm text-gray-500">No markdown files were found in the docs directory.</p>
        </div>
      )}
    </div>
  )
}
