'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AdminDocViewerPage() {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const params = useParams()
  const { slug } = params

  useEffect(() => {
    if (slug) {
      fetchDoc()
    }
  }, [slug])

  const fetchDoc = async () => {
    try {
      const fileName = `${slug}.md`
      const response = await fetch(`/api/admin/docs?file=${encodeURIComponent(fileName)}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        if (response.status === 404) {
          throw new Error('Document not found')
        }
        throw new Error('Failed to fetch document')
      }

      const data = await response.json()
      setDoc(data)
    } catch (error) {
      console.error('Error fetching doc:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Normalize file names to proper titles
  const normalizeTitle = (fileName) => {
    if (!fileName) return ''
    
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
    if (!fileName) return 'Documentation'
    if (fileName.includes('SEO')) return '🔍 SEO & Marketing'
    if (fileName.includes('PHASE') || fileName.includes('STATUS')) return '📋 Project Management'
    if (fileName.includes('PLAN') || fileName.includes('STRATEGY')) return '🎯 Strategy & Planning'
    if (fileName.includes('IMPLEMENTATION') || fileName.includes('INTEGRATION')) return '🚀 Technical Implementation'
    if (fileName.includes('MESSAGES') || fileName.includes('PRODUCT')) return '🛍️ Product Features'
    if (fileName.includes('TODO') || fileName.includes('CHECKLIST')) return '✅ Tasks & Checklists'
    return '📄 General Documentation'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading document</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/docs"
          className="inline-flex items-center text-sm text-parque-purple hover:text-purple-700"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Documentation
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/admin/docs"
          className="inline-flex items-center text-sm text-parque-purple hover:text-purple-700 mb-4"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Documentation
        </Link>
        
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            {getCategoryFromFileName(doc?.fileName)}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 break-words">
            {normalizeTitle(doc?.fileName)}
          </h1>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <a
              href={`https://github.com/morhendos/tenis-del-parque/blob/main/docs/${doc?.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-4" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-600 mb-4 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-600" {...props} />,
              a: ({node, ...props}) => <a className="text-parque-purple hover:text-purple-700 underline" {...props} />,
              code: ({node, inline, ...props}) => 
                inline 
                  ? <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm" {...props} />
                  : <code className="block bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm" {...props} />,
              pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-parque-purple pl-4 italic text-gray-600 mb-4" {...props} />,
              table: ({node, ...props}) => <table className="min-w-full divide-y divide-gray-200 mb-4" {...props} />,
              thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
              tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
              th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
              td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" {...props} />,
              hr: ({node, ...props}) => <hr className="my-8 border-gray-200" {...props} />,
            }}
          >
            {doc?.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
