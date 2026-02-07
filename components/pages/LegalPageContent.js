'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'
import { legalContent } from '@/lib/content/legalContent'

/**
 * Renders markdown-like content with support for:
 * - **bold** text
 * - [links](url)
 * - • bullet points
 * - | table | rows |
 * - Numbered lists (1. 2. 3.)
 */
function RenderContent({ content }) {
  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let inTable = false

  const processInlineFormatting = (text) => {
    const parts = []
    // Process bold, links, and inline code
    const regex = /(\*\*(.+?)\*\*)|(\[(.+?)\]\((.+?)\))|(`(.+?)`)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      if (match[1]) {
        // Bold
        parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[2]}</strong>)
      } else if (match[3]) {
        // Link
        const href = match[5]
        const isExternal = href.startsWith('http')
        if (isExternal) {
          parts.push(
            <a key={match.index} href={href} target="_blank" rel="noopener noreferrer"
               className="text-parque-purple hover:text-parque-purple/80 underline underline-offset-2">
              {match[4]}
            </a>
          )
        } else {
          parts.push(
            <Link key={match.index} href={href}
                  className="text-parque-purple hover:text-parque-purple/80 underline underline-offset-2">
              {match[4]}
            </Link>
          )
        }
      } else if (match[6]) {
        // Inline code
        parts.push(<code key={match.index} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{match[7]}</code>)
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : [text]
  }

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0]
      const dataRows = tableRows.slice(2) // Skip separator row

      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-4 -mx-2 px-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {headerRow.split('|').filter(c => c.trim()).map((cell, i) => (
                  <th key={i} className="text-left py-2 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 whitespace-nowrap">
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {row.split('|').filter(c => c.trim()).map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 border-b border-gray-100 text-gray-600 whitespace-nowrap">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableRows = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Table detection
    if (trimmed.startsWith('|')) {
      inTable = true
      tableRows.push(trimmed)
      continue
    } else if (inTable) {
      inTable = false
      flushTable()
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />)
      continue
    }

    // Bullet points
    if (trimmed.startsWith('•')) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-1.5">
          <span className="text-parque-purple mt-0.5 flex-shrink-0">•</span>
          <span className="text-gray-600 leading-relaxed">{processInlineFormatting(trimmed.slice(1).trim())}</span>
        </div>
      )
      continue
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)$/)
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 ml-1 mb-1.5">
          <span className="text-parque-purple font-medium flex-shrink-0 w-5 text-right">{numberedMatch[1]}.</span>
          <span className="text-gray-600 leading-relaxed">{processInlineFormatting(numberedMatch[2])}</span>
        </div>
      )
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-gray-600 leading-relaxed mb-1.5">
        {processInlineFormatting(trimmed)}
      </p>
    )
  }

  // Flush any remaining table
  if (inTable) flushTable()

  return <>{elements}</>
}

export default function LegalPageContent({ locale, pageKey }) {
  const footerContent = homeContent[locale]?.footer

  const content = legalContent[locale]?.[pageKey]

  // Scroll to section if hash in URL
  useEffect(() => {
    const hash = window.location.hash?.slice(1)
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [])

  if (!content) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg">
      <Navigation currentPage="legal" />

      {/* Hero */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-parque-purple/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {content.title}
            </h1>
            <p className="text-sm text-gray-400">{content.lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="pb-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <nav className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {locale === 'es' ? 'Contenido' : 'Contents'}
              </h2>
              <ul className="space-y-1.5">
                {content.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-gray-600 hover:text-parque-purple transition-colors block py-0.5"
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {content.sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-5 sm:p-8 shadow-sm"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="text-sm sm:text-base">
                  <RenderContent content={section.content} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-links to other legal pages */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {locale === 'es' ? 'Documentos legales' : 'Legal documents'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'avisoLegal', es: { label: 'Aviso Legal', href: '/es/aviso-legal' }, en: { label: 'Legal Notice', href: '/en/legal-notice' } },
                  { key: 'privacidad', es: { label: 'Política de Privacidad', href: '/es/politica-privacidad' }, en: { label: 'Privacy Policy', href: '/en/privacy-policy' } },
                  { key: 'cookies', es: { label: 'Política de Cookies', href: '/es/politica-cookies' }, en: { label: 'Cookie Policy', href: '/en/cookie-policy' } },
                  { key: 'terminos', es: { label: 'Términos y Condiciones', href: '/es/terminos-condiciones' }, en: { label: 'Terms & Conditions', href: '/en/terms-conditions' } },
                ].filter(item => item.key !== pageKey).map((item) => {
                  const loc = item[locale]
                  return (
                    <Link
                      key={item.key}
                      href={loc.href}
                      className="text-sm text-parque-purple hover:text-parque-purple/80 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-parque-purple/30 transition-colors"
                    >
                      {loc.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer content={footerContent} />
    </div>
  )
}
