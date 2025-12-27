import Link from 'next/link'

export default function Footer({ content }) {
  return (
    <footer className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-parque-purple/5" />
      
      {/* Subtle purple orb */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-t from-parque-purple/10 to-transparent rounded-full blur-3xl" />
      
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-parque-purple/30 to-transparent" />
      
      <div className="container mx-auto px-4 py-10 sm:py-12 relative z-10">
        {/* Main footer content */}
        <div className="flex flex-col items-center text-center">
          {/* Navigation links */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6">
            <Link href="/rules" className="text-gray-500 hover:text-parque-purple transition-colors text-sm font-medium">
              {content.links.rules}
            </Link>
            <Link href="/elo" className="text-gray-500 hover:text-parque-purple transition-colors text-sm font-medium">
              ELO Points
            </Link>
            <Link href="/openrank" className="text-gray-500 hover:text-parque-purple transition-colors text-sm font-medium">
              OpenRank
            </Link>
            <Link href="/swiss" className="text-gray-500 hover:text-parque-purple transition-colors text-sm font-medium">
              Swiss System
            </Link>
          </div>
          
          {/* Social / Contact */}
          <div className="flex gap-2 mb-6">
            <a
              href="mailto:morhendos@gmail.com"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-parque-purple/30 hover:bg-parque-purple/5 hover:text-parque-purple flex items-center justify-center transition-all duration-200 text-gray-400 shadow-sm"
              aria-label="Email"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="https://wa.me/34652714328"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-parque-green/30 hover:bg-parque-green/5 hover:text-parque-green flex items-center justify-center transition-all duration-200 text-gray-400 shadow-sm"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/tenisdelparque"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-parque-purple/30 hover:bg-parque-purple/5 hover:text-parque-purple flex items-center justify-center transition-all duration-200 text-gray-400 shadow-sm"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-gray-400 text-xs sm:text-sm">
            {content.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
