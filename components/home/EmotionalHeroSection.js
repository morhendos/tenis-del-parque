import Link from 'next/link';
import Image from 'next/image';

export default function EmotionalHeroSection({ content, locale }) {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 via-white to-parque-green/5"></div>
      
      {/* Tennis ball decorations */}
      <div className="absolute top-20 right-10 w-32 h-32 opacity-10">
        <div className="tennis-ball"></div>
      </div>
      <div className="absolute bottom-20 left-10 w-24 h-24 opacity-10">
        <div className="tennis-ball"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <Image
              src="/logo-01.webp"
              alt="Tenis del Parque"
              width={200}
              height={200}
              className="mx-auto w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
              priority
            />
          </div>
          
          {/* Main title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {content.hero.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light">
            {content.hero.subtitle}
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {content.hero.description}
          </p>
          
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {content.hero.badges.map((badge, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#cities"
              className="group px-8 py-4 bg-parque-purple text-white rounded-lg font-medium text-lg hover:bg-parque-purple/90 transition-all transform hover:scale-105 shadow-lg"
            >
              {content.hero.cta.primary}
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#problem"
              className="px-8 py-4 border-2 border-parque-purple text-parque-purple rounded-lg font-medium text-lg hover:bg-parque-purple/10 transition-colors"
            >
              {content.hero.cta.secondary}
            </a>
          </div>
          
          {/* Trust indicator */}
          <p className="text-sm text-gray-500 mt-8">
            {locale === 'es' 
              ? 'Jugadores reales en Sotogrande ya están disfrutando' 
              : 'Real players in Sotogrande are already enjoying'}
          </p>
        </div>
      </div>
      
      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </section>
  );
}