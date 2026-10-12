'use client'
import { BarChart3, Trophy, Calendar, Award, MessageCircle } from 'lucide-react'

// Icon mapping for each tab type
const iconMap = {
  'standings': BarChart3,
  'playoffs': Trophy,
  'schedule': Calendar,
  'results': Award,
  'community': MessageCircle
}

const Dot = ({ className = '' }) => <span className={`w-2 h-2 rounded-full bg-red-500 flex-shrink-0 ${className}`} />

export default function LeagueTabs({ tabs, activeTab, onTabChange, language = 'es' }) {
  return (
    <div className="league-tabs-container">
      {/* Mobile: iOS-style Segmented Control with purple gradient */}
      <div className="md:hidden p-1.5 bg-gradient-to-r from-parque-purple to-purple-600 rounded-xl shadow-sm">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = iconMap[tab.id]
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white text-parque-purple shadow-md'
                    : 'text-white/70 hover:text-white'
                  }
                `}
              >
                {Icon && tabs.length < 4 && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
                <span className="truncate">{tab.label}</span>
                {tab.dot && <Dot />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Bottom Border Style */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border-b border-gray-200">
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
                  {tab.dot && <Dot />}
                </div>
                
                {/* Active indicator */}
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
    </div>
  )
}
