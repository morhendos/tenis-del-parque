import Link from 'next/link';
import Image from 'next/image';

export default function LeagueCard({ league, content, locale }) {
  const isActive = league.status === 'active';
  const isComingSoon = league.status === 'coming_soon';
  const citySlug = league.slug;
  const cityContent = content?.cities?.cityDescriptions?.[citySlug];
  
  // Extract location string from location object
  const locationString = league.location?.city || league.location?.region || league.name;
  const regionString = league.location?.region || 'España';
  
  // Check if registration is open for active leagues
  const hasOpenRegistration = league.seasons?.some(season => 
    season.status === 'registration_open'
  );

  // Get active season for the league link
  const activeSeason = league.seasons?.find(season => 
    season.status === 'active' || season.status === 'registration_open'
  );
  
  // Format launch date if available
  const launchDate = league.expectedLaunchDate ? new Date(league.expectedLaunchDate) : null;
  const formattedDate = launchDate ? launchDate.toLocaleDateString(locale, { 
    month: 'long', 
    year: 'numeric' 
  }) : null;
  
  // Check if league has a custom image
  const hasCustomImage = ['liga-de-sotogrande', 'liga-de-malaga', 'liga-de-estepona', 'liga-de-marbella'].includes(citySlug);
  
  // Get the appropriate button text and link
  const getButtonConfig = () => {
    if (isActive) {
      if (activeSeason) {
        const seasonSlug = activeSeason.name.toLowerCase().replace(/\s+/g, '');
        return {
          text: locale === 'es' ? 'Ver Liga' : 'View League',
          href: `/${locale}/${citySlug}/liga/${seasonSlug}`,
          className: 'bg-parque-purple text-white hover:bg-parque-purple/90'
        };
      }
      return {
        text: locale === 'es' ? 'Ver Liga' : 'View League',
        href: `/${locale}/${citySlug}/liga/verano2025`,
        className: 'bg-parque-purple text-white hover:bg-parque-purple/90'
      };
    } else if (isComingSoon) {
      return {
        text: content?.cities?.preRegister || (locale === 'es' ? 'Pre-registro' : 'Pre-register'),
        href: `/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${citySlug}`,
        className: 'bg-parque-green text-white hover:bg-parque-green/90'
      };
    } else {
      return {
        text: locale === 'es' ? 'No disponible' : 'Not available',
        href: null,
        className: 'bg-gray-200 text-gray-500 cursor-not-allowed'
      };
    }
  };

  const buttonConfig = getButtonConfig();
  
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-full max-w-sm ${
      !isActive && !isComingSoon ? 'opacity-60' : ''
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : isComingSoon
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive 
            ? (content?.cities?.available || (locale === 'es' ? 'Activa' : 'Active'))
            : isComingSoon 
            ? (content?.cities?.comingSoon || (locale === 'es' ? 'Próximamente' : 'Coming Soon'))
            : (locale === 'es' ? 'Inactiva' : 'Inactive')
          }
        </span>
      </div>
      
      {/* City Image */}
      <div className="relative h-48 overflow-hidden">
        {hasCustomImage ? (
          <>
            <Image
              src={`/${citySlug === 'liga-de-sotogrande' ? 'sotogrande-01.jpg' : 
                citySlug === 'liga-de-estepona' ? 'estepona-01.webp' :
                citySlug === 'liga-de-malaga' ? 'malaga-01.avif' : 
                citySlug === 'liga-de-marbella' ? 'marbella-02.webp' : 
                     `${citySlug}-01.jpg`}`}
              alt={league.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-parque-purple/80 via-parque-purple/40 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-parque-purple to-parque-green"></div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white drop-shadow-lg">{league.name}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Description */}
        {(cityContent || league.description?.[locale] || league.description?.es) && (
          <p className="text-gray-600 mb-4">
            {cityContent || league.description?.[locale] || league.description?.es}
          </p>
        )}
        
        {/* Show player count for active leagues */}
        {isActive && league.playerCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{league.playerCount}</span> {
                content?.cities?.playersCount || (locale === 'es' ? 'jugadores' : 'players')
              }
            </div>
            <div className="text-sm text-gray-500">
              {regionString}
            </div>
          </div>
        )}
        
        {/* Show season info for active leagues */}
        {isActive && activeSeason && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">🏆 {activeSeason.name}</span>
              {activeSeason.price && (
                <span className="font-semibold text-parque-purple">
                  {activeSeason.price.isFree 
                    ? (locale === 'es' ? 'Gratis' : 'Free')
                    : `${activeSeason.price.amount || 0}${activeSeason.price.currency || '€'}`
                  }
                </span>
              )}
            </div>
            {activeSeason.startDate && (
              <div className="text-sm text-gray-500">
                📅 {locale === 'es' ? 'Inicio:' : 'Start:'} {
                  new Date(activeSeason.startDate).toLocaleDateString(
                    locale === 'es' ? 'es-ES' : 'en-US',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )
                }
              </div>
            )}
          </div>
        )}
        
        {/* Show launch date for coming soon leagues */}
        {isComingSoon && formattedDate && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              {content?.cities?.startsIn || (locale === 'es' ? 'Lanzamiento' : 'Launch')}: {' '}
              <span className="font-semibold text-gray-700">{formattedDate}</span>
            </p>
            {league.waitingListCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-gray-700">{league.waitingListCount}</span> {
                  content?.cities?.interested || (locale === 'es' ? 'interesados' : 'interested')
                }
              </p>
            )}
          </div>
        )}
        
        {/* Action Button */}
        {buttonConfig.href ? (
          <Link
            href={buttonConfig.href}
            className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${buttonConfig.className}`}
          >
            {buttonConfig.text}
          </Link>
        ) : (
          <button
            disabled
            className={`block w-full text-center px-6 py-3 rounded-lg font-medium ${buttonConfig.className}`}
          >
            {buttonConfig.text}
          </button>
        )}
      </div>
    </div>
  );
}