import Link from 'next/link'

export default function Footer({ content }) {
  return (
    <footer className="bg-white/80 backdrop-blur-sm py-16 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 font-light mb-4 md:mb-0">{content.copyright}</p>
          <div className="flex space-x-8">
            <Link href="/rules" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
              {content.links.rules}
            </Link>
            <Link href="/elo" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
              ELO Points
            </Link>
            <Link href="#" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
              {content.links.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 