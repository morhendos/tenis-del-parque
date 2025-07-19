import { getRulesIcon } from '../../lib/utils/rulesIcons'

export default function RulesSection({ section, index }) {
  return (
    <div 
      id={section.id}
      className="rule-section mb-16 animate-fadeInUp"
      style={{animationDelay: `${index * 100}ms`}}
    >
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-parque-purple to-parque-purple/80 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
          {getRulesIcon(section.icon)}
        </div>
        <h2 className="text-3xl md:text-4xl font-light text-parque-purple">
          {section.title}
        </h2>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
        <ul className="space-y-4">
          {section.items.map((item, itemIndex) => (
            <li key={`${section.id}-item-${itemIndex}`} className="flex items-start group">
              <svg className="w-6 h-6 text-parque-green mt-0.5 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 leading-relaxed text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}