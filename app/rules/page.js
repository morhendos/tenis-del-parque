'use client'

import { useLanguage } from '../../lib/hooks/useLanguage'
import { useActiveSection } from '../../lib/hooks/useActiveSection'
import { rulesContent } from '../../lib/content/rulesContent'
import Navigation from '../../components/common/Navigation'
import Footer from '../../components/common/Footer'
import RulesHeroSection from '../../components/rules/RulesHeroSection'
import RulesSidebar from '../../components/rules/RulesSidebar'
import RulesSection from '../../components/rules/RulesSection'
import RulesCTASection from '../../components/rules/RulesCTASection'

function RulesPage() {
  const { language, setLanguage, isLanguageLoaded } = useLanguage()
  const { activeSection, scrollToSection } = useActiveSection()

  const t = rulesContent[language]

  // Show loading state until language is resolved to prevent hydration flicker
  if (!isLanguageLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 tennis-ball mb-4 animate-bounce mx-auto"></div>
          <div className="text-parque-purple/60 text-lg font-light">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg">
      <Navigation currentPage="rules" language={language} onLanguageChange={setLanguage} />

      <RulesHeroSection 
        title={t.hero.title}
        subtitle={t.hero.subtitle}
      />

      <RulesSidebar 
        sections={t.sections}
        activeSection={activeSection}
        onScrollToSection={scrollToSection}
      />

      {/* Rules Content */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {t.sections.map((section, index) => (
              <RulesSection 
                key={index}
                section={section}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <RulesCTASection 
        title={t.cta.title}
        buttonText={t.cta.button}
      />

      <Footer content={t.footer} />
    </main>
  )
}

export default RulesPage 