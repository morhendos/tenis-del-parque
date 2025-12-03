import Link from 'next/link'

export default function Footer({ content }) {
  return (
    <footer className="bg-white py-6 sm:py-10 md:py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:justify-between">
          <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-0">{content.copyright}</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            <Link href="/rules" className="text-gray-600 hover:text-parque-purple transition-colors text-sm sm:text-base font-medium">
              {content.links.rules}
            </Link>
            <Link href="/elo" className="text-gray-600 hover:text-parque-purple transition-colors text-sm sm:text-base font-medium">
              ELO Points
            </Link>
            <Link href="#" className="text-gray-600 hover:text-parque-purple transition-colors text-sm sm:text-base font-medium">
              {content.links.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 