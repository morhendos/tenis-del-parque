'use client'

import { WhatsAppUtils } from '@/lib/utils/whatsappUtils'

export default function NextMatchCard({ match, language, onResultClick, onScheduleClick }) {
  const content = {
    es: {
      title: 'Próximo Partido',
      noMatches: 'No tienes partidos programados',
      round: 'Ronda',
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      coordinate: 'Coordinar',
      result: 'Resultado'
    },
    en: {
      title: 'Next Match',
      noMatches: 'No matches scheduled',
      round: 'Round',
      confirmed: 'Confirmed',
      pending: 'Pending',
      coordinate: 'Schedule',
      result: 'Result'
    }
  }

  const t = content[language] || content.es

  if (!match) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-400">{t.title}</span>
        </div>
        <p className="text-gray-400 text-sm">{t.noMatches}</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  const hasSchedule = match.schedule?.confirmedDate
  const formattedDate = hasSchedule ? formatDate(match.schedule.confirmedDate) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">{t.title}</span>
        </div>
        <span className="text-sm text-gray-400">{t.round} {match.round}</span>
      </div>

      {/* Match Card */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Position Circle - show opponent's league position */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-parque-purple to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
            <span className="text-white text-base font-bold">
              {match.opponentPosition ? `#${match.opponentPosition}` : '—'}
            </span>
          </div>
          
          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {match.opponent}
            </p>
          </div>
          
          {/* Status */}
          <div className="text-right flex-shrink-0">
            {hasSchedule ? (
              <>
                <p className="text-sm font-semibold text-green-600">{t.confirmed}</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </>
            ) : (
              <p className="text-sm font-medium text-amber-600">{t.pending}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* WhatsApp Button - always visible */}
        {match.opponentWhatsapp && (
          <a
            href={WhatsAppUtils.createMessageUrl(match.opponentWhatsapp, '')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        )}
        
        {/* Schedule Button - only when not scheduled */}
        {!hasSchedule && (
          <button
            onClick={onScheduleClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.coordinate}
          </button>
        )}
        
        {/* Result Button - always visible */}
        <button
          onClick={onResultClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-parque-purple hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t.result}
        </button>
      </div>
    </div>
  )
}
