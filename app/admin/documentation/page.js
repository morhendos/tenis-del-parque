'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const documents = [
  {
    id: 'api-routes',
    title: 'API Routes Documentation',
    description: 'Complete reference for all API endpoints',
    category: 'Technical',
    path: '/docs/API_ROUTES.md'
  },
  {
    id: 'club-model',
    title: 'Club Model Schema',
    description: 'Database schema and model documentation',
    category: 'Technical',
    path: '/docs/CLUB_MODEL.md'
  },
  {
    id: 'deployment',
    title: 'Deployment Guide',
    description: 'How to deploy to production',
    category: 'Operations',
    path: '/docs/DEPLOYMENT.md'
  },
  {
    id: 'features',
    title: 'Features Overview',
    description: 'Complete list of platform features',
    category: 'Product',
    path: '/docs/FEATURES.md'
  },
  {
    id: 'google-maps-import',
    title: 'Google Maps Import Feature',
    description: 'Comprehensive guide to the tennis club import system',
    category: 'Features',
    path: '/docs/GOOGLE_MAPS_IMPORT_FEATURE.md',
    badge: '🌟 New'
  },
  {
    id: 'google-maps-setup',
    title: 'Google Maps API Setup',
    description: 'How to configure Google Maps API for production',
    category: 'Setup',
    path: '/docs/GOOGLE_MAPS_SETUP.md',
    badge: '🔑 Setup'
  },
  {
    id: 'google-maps-spec',
    title: 'Google Maps Import Spec',
    description: 'Technical specification for Phase 1 implementation',
    category: 'Technical',
    path: '/docs/GOOGLE_MAPS_IMPORT_SPEC.md'
  },
  {
    id: 'project-overview',
    title: 'Project Overview',
    description: 'Tennis del Parque platform introduction',
    category: 'General',
    path: '/docs/PROJECT_OVERVIEW.md'
  },
  {
    id: 'seo-strategy',
    title: 'SEO Strategy',
    description: 'Search engine optimization approach',
    category: 'Marketing',
    path: '/docs/SEO_STRATEGY.md'
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack',
    description: 'Technologies and architecture decisions',
    category: 'Technical',
    path: '/docs/TECH_STACK.md'
  }
]

export default function DocumentationPage() {
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [docContent, setDocContent] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['All', ...new Set(documents.map(doc => doc.category))]
  
  const filteredDocs = selectedCategory === 'All' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory)

  const loadDocument = async (doc) => {
    setLoading(true)
    setSelectedDoc(doc)
    
    try {
      // In production, this would fetch from your docs folder
      // For now, we'll show a message
      const response = await fetch(doc.path)
      if (response.ok) {
        const content = await response.text()
        setDocContent(content)
      } else {
        setDocContent(`# ${doc.title}\n\n*Document content will be loaded from ${doc.path}*\n\n${doc.description}`)
      }
    } catch (error) {
      setDocContent(`# ${doc.title}\n\n*Document content will be loaded from ${doc.path}*\n\n${doc.description}`)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Technical':
        return '🔧'
      case 'Features':
        return '✨'
      case 'Operations':
        return '🚀'
      case 'Product':
        return '📦'
      case 'Marketing':
        return '📊'
      case 'Setup':
        return '⚙️'
      default:
        return '📄'
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
          
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Document List */}
          <div className="space-y-2">
            {filteredDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => loadDocument(doc)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedDoc?.id === doc.id
                    ? 'bg-parque-purple text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{getCategoryIcon(doc.category)}</span>
                      <h3 className={`font-medium ${
                        selectedDoc?.id === doc.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {doc.title}
                      </h3>
                    </div>
                    <p className={`text-sm mt-1 ${
                      selectedDoc?.id === doc.id ? 'text-purple-100' : 'text-gray-600'
                    }`}>
                      {doc.description}
                    </p>
                  </div>
                  {doc.badge && (
                    <span className="ml-2 text-xs font-medium">
                      {doc.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {selectedDoc ? (
          <div className="max-w-4xl mx-auto p-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-xl text-gray-600">Loading documentation...</div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>
                  {docContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No document selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a document from the sidebar to view its content.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}