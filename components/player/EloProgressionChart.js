'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts'

// Custom dot that shows win/loss color
const CustomDot = (props) => {
  const { cx, cy, payload } = props
  
  if (payload.isStart) {
    return (
      <circle cx={cx} cy={cy} r={5} fill="#6B7280" stroke="#fff" strokeWidth={2} />
    )
  }
  
  const color = payload.result === 'won' ? '#10B981' : '#EF4444'
  
  return (
    <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
  )
}

// Custom tooltip
const CustomTooltip = ({ active, payload, locale }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    
    if (data.isStart) {
      return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-sm">
          <p className="font-semibold text-gray-900">
            {locale === 'es' ? 'Inicio' : 'Start'}
          </p>
          <p className="text-gray-600">ELO: {data.elo}</p>
        </div>
      )
    }
    
    const changeColor = data.eloChange >= 0 ? 'text-emerald-600' : 'text-red-600'
    const changePrefix = data.eloChange >= 0 ? '+' : ''
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-sm min-w-[160px]">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-semibold ${data.result === 'won' ? 'text-emerald-600' : 'text-red-600'}`}>
            {data.result === 'won' 
              ? (locale === 'es' ? 'Victoria' : 'Win')
              : (locale === 'es' ? 'Derrota' : 'Loss')
            }
          </span>
          <span className={`font-bold ${changeColor}`}>
            {changePrefix}{data.eloChange}
          </span>
        </div>
        <p className="text-gray-600 text-xs mb-1">vs {data.opponent}</p>
        {data.score && (
          <p className="text-gray-500 text-xs">{data.score}</p>
        )}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-gray-900 font-medium">ELO: {data.elo}</p>
        </div>
      </div>
    )
  }
  return null
}

export default function EloProgressionChart({ chartData, stats, locale = 'es' }) {
  const [showDetails, setShowDetails] = useState(false)
  
  // Early return if no stats
  if (!stats) {
    return null
  }
  
  const content = {
    es: {
      title: 'Tu Progreso ELO',
      noData: 'Juega partidos para ver tu progreso',
      noDataDesc: 'Tu gráfico de ELO aparecerá aquí después de tu primer partido',
      starting: 'Inicial',
      current: 'Actual',
      peak: 'Máximo',
      overall: 'Total',
      lastMatch: 'Último',
      record: 'Record',
      matches: 'partidos',
      showHistory: 'Ver historial',
      hideHistory: 'Ocultar historial',
      matchNum: 'Partido',
      vs: 'vs',
      win: 'Victoria',
      loss: 'Derrota'
    },
    en: {
      title: 'Your ELO Progress',
      noData: 'Play matches to see your progress',
      noDataDesc: 'Your ELO chart will appear here after your first match',
      starting: 'Starting',
      current: 'Current',
      peak: 'Peak',
      overall: 'Overall',
      lastMatch: 'Last',
      record: 'Record',
      matches: 'matches',
      showHistory: 'Show history',
      hideHistory: 'Hide history',
      matchNum: 'Match',
      vs: 'vs',
      win: 'Win',
      loss: 'Loss'
    }
  }
  
  const t = content[locale] || content.es

  // No data state
  if (!chartData || chartData.length <= 1) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noData}</h3>
          <p className="text-gray-500 text-sm">{t.noDataDesc}</p>
        </div>
      </div>
    )
  }

  // Calculate Y-axis domain with padding
  const eloValues = chartData.map(d => d.elo)
  const minElo = Math.min(...eloValues)
  const maxElo = Math.max(...eloValues)
  const padding = Math.max(20, Math.round((maxElo - minElo) * 0.15))
  const yMin = Math.floor((minElo - padding) / 10) * 10
  const yMax = Math.ceil((maxElo + padding) / 10) * 10

  const changeColor = stats.totalChange >= 0 ? 'text-emerald-600' : 'text-red-600'
  const changePrefix = stats.totalChange >= 0 ? '+' : ''
  const lastChangeColor = stats.lastMatchChange >= 0 ? 'text-emerald-600' : 'text-red-600'
  const lastChangePrefix = stats.lastMatchChange >= 0 ? '+' : ''

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-500">
            {stats.totalMatches} {t.matches} • {stats.wins}W - {stats.losses}L
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] sm:h-[250px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="matchNumber" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => value === 0 ? '' : value}
            />
            <YAxis 
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickCount={5}
            />
            
            {/* Reference line at starting ELO */}
            <ReferenceLine 
              y={stats.startingElo} 
              stroke="#E5E7EB" 
              strokeDasharray="3 3" 
            />
            
            {/* Area under the line */}
            <Area
              type="monotone"
              dataKey="elo"
              stroke="none"
              fill="url(#eloGradient)"
            />
            
            {/* Main line */}
            <Line
              type="monotone"
              dataKey="elo"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 7, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
            />
            
            <Tooltip content={<CustomTooltip locale={locale} />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">{t.starting}</p>
          <p className="text-lg font-bold text-gray-700">{stats.startingElo}</p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-xs text-purple-600 mb-1">{t.current}</p>
          <p className="text-lg font-bold text-purple-700">{stats.currentElo}</p>
        </div>
        
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-xs text-amber-600 mb-1">{t.peak}</p>
          <p className="text-lg font-bold text-amber-700">{stats.peakElo}</p>
        </div>
        
        <div className={`rounded-xl p-3 text-center ${stats.totalChange >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className={`text-xs mb-1 ${stats.totalChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{t.overall}</p>
          <p className={`text-lg font-bold ${changeColor}`}>
            {changePrefix}{stats.totalChange}
          </p>
        </div>
        
        <div className={`rounded-xl p-3 text-center hidden sm:block ${stats.lastMatchChange >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className={`text-xs mb-1 ${stats.lastMatchChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{t.lastMatch}</p>
          <p className={`text-lg font-bold ${lastChangeColor}`}>
            {lastChangePrefix}{stats.lastMatchChange}
          </p>
        </div>
      </div>

      {/* Match History Toggle (Mobile-friendly) */}
      {chartData.length > 1 && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span>{showDetails ? t.hideHistory : t.showHistory}</span>
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
              {chartData.slice(1).reverse().map((match, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    match.result === 'won' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      match.result === 'won' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {match.result === 'won' ? 'W' : 'L'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.vs} {match.opponent}
                      </p>
                      {match.score && (
                        <p className="text-xs text-gray-500">{match.score}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${match.eloChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                    </p>
                    <p className="text-xs text-gray-500">{match.elo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
