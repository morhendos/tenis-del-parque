'use client'

import { useState } from 'react'

export default function FAQSection({ content }) {
  const [openItems, setOpenItems] = useState(new Set([0])) // First item open by default

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const toggleAll = () => {
    if (openItems.size === content.items.length) {
      setOpenItems(new Set()) // Close all
    } else {
      setOpenItems(new Set(content.items.map((_, index) => index))) // Open all
    }
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-white/70 to-transparent relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-parque-purple/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-parque-green/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6 sm:mb-8 px-2">
            {content.title}
          </h2>
          
          {/* Toggle All Button */}
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-2 bg-parque-purple/10 hover:bg-parque-purple/20 text-parque-purple px-4 py-2 sm:px-6 sm:py-3 rounded-full transition-all duration-300 touch-manipulation text-sm sm:text-base font-medium"
          >
                         {openItems.size === content.items.length ? (
               <>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
                 <span>{content.toggleAll.closeAll}</span>
               </>
             ) : (
               <>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                 </svg>
                 <span>{content.toggleAll.openAll}</span>
               </>
             )}
          </button>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {content.items.map((item, index) => {
            const isOpen = openItems.has(index)
            
            return (
              <div 
                key={index} 
                className="animate-fadeInUp bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                style={{animationDelay: `${index * 100}ms`}}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left p-4 sm:p-6 md:p-8 focus:outline-none focus:ring-4 focus:ring-parque-purple/20 transition-all duration-300 group touch-manipulation min-h-[64px] flex items-center justify-between"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 pr-4">
                    {/* Question Number */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium flex-shrink-0 transition-all duration-300 ${
                      isOpen 
                        ? 'bg-parque-purple text-white shadow-lg scale-110' 
                        : 'bg-parque-purple/10 text-parque-purple group-hover:bg-parque-purple/20'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Question Text */}
                    <h3 className={`text-base sm:text-lg md:text-xl font-medium leading-relaxed transition-colors duration-300 ${
                      isOpen ? 'text-parque-purple' : 'text-gray-800 group-hover:text-parque-purple'
                    }`}>
                      {item.q}
                    </h3>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    isOpen ? 'text-parque-purple rotate-180' : 'text-gray-400 group-hover:text-parque-purple'
                  }`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Answer Content */}
                <div
                  id={`faq-answer-${index}`}
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                    <div className="pl-11 sm:pl-14 border-l-2 border-parque-purple/20">
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed animate-fadeIn">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
                 <div className="text-center mt-12 sm:mt-16">
           <div className="bg-gradient-to-br from-parque-purple/5 to-parque-green/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 max-w-2xl mx-auto">
             <h3 className="text-xl sm:text-2xl font-medium text-parque-purple mb-3 sm:mb-4">
               {content.contact.title}
             </h3>
             <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
               {content.contact.subtitle}
             </p>
             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
               <a
                 href="mailto:info@tenisdelparque.com"
                 className="inline-flex items-center justify-center gap-2 bg-parque-purple text-white px-6 py-3 rounded-full hover:bg-parque-purple/90 transition-all duration-300 text-sm sm:text-base font-medium touch-manipulation min-h-[48px]"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
                 {content.contact.email}
               </a>
               <a
                 href="https://wa.me/34600000000"
                 className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-all duration-300 text-sm sm:text-base font-medium touch-manipulation min-h-[48px]"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                 </svg>
                 {content.contact.whatsapp}
               </a>
             </div>
           </div>
         </div>
      </div>
    </section>
  )
} 