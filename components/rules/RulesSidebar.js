import { getRulesIcon } from '../../lib/utils/rulesIcons'

export default function RulesSidebar({ sections, activeSection, onScrollToSection }) {
  return (
    <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => onScrollToSection(index)}
            className={`block w-full p-3 rounded-xl mb-2 transition-all duration-300 ${
              activeSection === index 
                ? 'bg-parque-purple text-white shadow-lg transform scale-105' 
                : 'hover:bg-gray-100 text-gray-600 hover:scale-105'
            }`}
            title={section.title}
          >
            {getRulesIcon(section.icon)}
          </button>
        ))}
      </div>
    </div>
  )
} 