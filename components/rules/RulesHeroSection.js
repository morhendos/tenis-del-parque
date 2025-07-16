export default function RulesHeroSection({ content }) {
  // Handle both old prop structure and new content object structure
  const title = content?.title || ''
  const subtitle = content?.subtitle || ''
  
  if (!content) {
    return null
  }
  
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-purple/70 mb-6 animate-fadeInUp">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light animate-fadeInUp animation-delay-200">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}