'use client'

import { useState } from 'react'

// Icons
const Icons = {
  Plus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Minus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Mail: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  WhatsApp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
    </svg>
  )
}

export default function FAQSection({ content }) {
  const [openIndex, setOpenIndex] = useState(0)

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <p className="text-parque-purple font-medium text-sm sm:text-base mb-2 sm:mb-3">
            FAQ
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {content.title}
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            
            return (
              <div 
                key={index}
                className={`border-b border-gray-200 ${index === 0 ? 'border-t' : ''}`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group touch-manipulation"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base sm:text-lg font-medium transition-colors duration-200 ${
                    isOpen ? 'text-parque-purple' : 'text-gray-900 group-hover:text-parque-purple'
                  }`}>
                    {item.q}
                  </span>
                  
                  <span className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                      ? 'bg-parque-purple text-white rotate-0' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-parque-purple/10 group-hover:text-parque-purple'
                  }`}>
                    {isOpen ? (
                      <Icons.Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Icons.Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </span>
                </button>
                
                <div className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    <p className="pb-5 sm:pb-6 pr-12 sm:pr-14 text-gray-600 text-sm sm:text-base leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="inline-flex flex-col items-center">
            <p className="text-gray-900 font-medium text-base sm:text-lg mb-1">
              {content.contact.title}
            </p>
            <p className="text-gray-500 text-sm sm:text-base mb-5 sm:mb-6 max-w-md">
              {content.contact.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:morhendos@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full hover:bg-gray-800 transition-all duration-200 text-sm sm:text-base font-medium touch-manipulation"
              >
                <Icons.Mail className="w-4 h-4" />
                {content.contact.email}
              </a>
              <a
                href="https://wa.me/34652714328"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full hover:bg-[#20bd5a] transition-all duration-200 text-sm sm:text-base font-medium touch-manipulation"
              >
                <Icons.WhatsApp className="w-4 h-4" />
                {content.contact.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
