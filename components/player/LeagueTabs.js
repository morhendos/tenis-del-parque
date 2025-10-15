'use client'
import { BarChart3, Trophy, Calendar, Award } from 'lucide-react'

// Icon mapping for each tab type
const iconMap = {
  'standings': BarChart3,
  'playoffs': Trophy,
  'schedule': Calendar,
  'results': Award
}

export default function LeagueTabs({ tabs, activeTab, onTabChange, language = 'es' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden league-tabs-container">
      {/* Mobile: Horizontal Scroll with Pills */}
      <div className="md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-3 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap
                  transition-all duration-300 ease-out min-h-[40px]
                  ${isActive
                    ? 'bg-gradient-to-r from-parque-purple to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 active:scale-95'
                  }
                `}
              >
                {(() => {
                  const Icon = iconMap[tab.id]
                  return Icon ? <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} /> : null
                })()}
                <span className="font-semibold">{tab.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Bottom Border Style */}
      <div className="hidden md:block border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium transition-all duration-300
                  relative group
                  ${isActive
                    ? 'text-parque-purple bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {(() => {
                    const Icon = iconMap[tab.id]
                    return Icon ? (
                      <Icon 
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                        strokeWidth={2.5}
                      />
                    ) : null
                  })()}
                  <span>{tab.label}</span>
                </div>
                
                {/* Active indicator - smooth slide */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-parque-purple to-purple-600
                  transition-all duration-300
                  ${isActive ? 'opacity-100 h-1' : 'opacity-0 h-0.5'}
                `} />
              </button>
            )
          })}
        </nav>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="md:hidden text-center py-1 bg-gradient-to-r from-transparent via-purple-50 to-transparent">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <span>←</span>
          <span>{language === 'es' ? 'Desliza' : 'Swipe'}</span>
          <span>→</span>
        </p>
      </div>
    </div>
  )
}
