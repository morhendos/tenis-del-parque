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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-parque-purple/10 rounded-full text-sm font-medium text-parque-purple mb-4">
            <svg className="w-4 h-4 text-parque-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 17h.01" strokeLinecap="round" />
            </svg>
            <span>FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
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
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-parque-purple via-violet-600 to-purple-700 p-6 sm:p-8 md:p-10">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-parque-green/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                    {content.contact.title}
                  </h3>
                  <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-0">
                    {content.contact.subtitle}
                  </p>
                </div>
                
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <a
                    href="mailto:morhendos@gmail.com"
                    className="inline-flex items-center justify-center gap-2 bg-white text-parque-purple px-5 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 text-sm font-semibold touch-manipulation shadow-lg shadow-black/10"
                  >
                    <Icons.Mail className="w-4 h-4" />
                    {content.contact.email}
                  </a>
                  <a
                    href="https://wa.me/34652714328"
                    className="inline-flex items-center justify-center gap-2 bg-parque-green text-white px-5 py-2.5 rounded-full hover:bg-parque-green/90 transition-all duration-200 text-sm font-semibold touch-manipulation shadow-lg shadow-black/10"
                  >
                    <Icons.WhatsApp className="w-4 h-4" />
                    {content.contact.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
