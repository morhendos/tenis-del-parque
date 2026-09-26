import { useState, useEffect } from 'react'

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.rule-section')
      const marker = 80

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= marker && rect.bottom > marker) {
          setActiveSection(index)
        }
      })
    }

    const scrollRoot = document.getElementById('player-scroll')
    window.addEventListener('scroll', handleScroll, { passive: true })
    scrollRoot?.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      scrollRoot?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToSection = (index) => {
    const element = document.querySelectorAll('.rule-section')[index]
    if (!element) return

    element.style.scrollMarginTop = '20px'
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return { activeSection, scrollToSection }
}
