// Internationalization configuration
export const i18n = {
  locales: ['es', 'en'],
  defaultLocale: 'es'
};

// Content translations for common elements
export const translations = {
  navigation: {
    es: {
      home: 'Inicio',
      leagues: 'Ligas',
      howItWorks: 'Cómo funciona',
      elo: 'Sistema ELO',
      rules: 'Reglas',
      signup: 'Inscríbete',
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      dashboard: 'Panel',
      profile: 'Perfil',
      switchToEnglish: 'English',
      switchToSpanish: 'Español'
    },
    en: {
      home: 'Home',
      leagues: 'Leagues',
      howItWorks: 'How it works',
      elo: 'ELO System',
      rules: 'Rules',
      signup: 'Sign up',
      login: 'Login',
      logout: 'Logout',
      dashboard: 'Dashboard',
      profile: 'Profile',
      switchToEnglish: 'English',
      switchToSpanish: 'Español'
    }
  },
  
  footer: {
    es: {
      aboutUs: 'Sobre nosotros',
      contact: 'Contacto',
      privacy: 'Privacidad',
      terms: 'Términos',
      copyright: '© 2025 Tenis del Parque. Todos los derechos reservados.',
      tagline: 'La plataforma líder de ligas de tenis amateur en España'
    },
    en: {
      aboutUs: 'About us',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      copyright: '© 2025 Tenis del Parque. All rights reserved.',
      tagline: 'The leading amateur tennis league platform in Spain'
    }
  },
  
  common: {
    es: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      close: 'Cerrar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      yes: 'Sí',
      no: 'No',
      noResults: 'No se encontraron resultados',
      seeMore: 'Ver más',
      seeLess: 'Ver menos',
      joinLeague: 'Únete a la liga',
      findMatches: 'Encuentra partidos',
      playersNearYou: 'jugadores cerca de ti',
      availableCities: 'Ciudades disponibles',
      comingSoon: 'Próximamente',
      startingJuly2025: 'Comenzando en Julio 2025'
    },
    en: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      noResults: 'No results found',
      seeMore: 'See more',
      seeLess: 'See less',
      joinLeague: 'Join the league',
      findMatches: 'Find matches',
      playersNearYou: 'players near you',
      availableCities: 'Available cities',
      comingSoon: 'Coming soon',
      startingJuly2025: 'Starting July 2025'
    }
  },
  
  cities: {
    es: {
      sotogrande: 'Sotogrande',
      malaga: 'Málaga',
      valencia: 'Valencia',
      sevilla: 'Sevilla',
      barcelona: 'Barcelona',
      madrid: 'Madrid',
      zaragoza: 'Zaragoza',
      alicante: 'Alicante',
      murcia: 'Murcia',
      marbella: 'Marbella'
    },
    en: {
      sotogrande: 'Sotogrande',
      malaga: 'Malaga',
      valencia: 'Valencia',
      sevilla: 'Seville',
      barcelona: 'Barcelona',
      madrid: 'Madrid',
      zaragoza: 'Zaragoza',
      alicante: 'Alicante',
      murcia: 'Murcia',
      marbella: 'Marbella'
    }
  }
};

// Helper function to get translation
export function getTranslation(locale, section, key) {
  return translations[section]?.[locale]?.[key] || key;
}

// Helper function to get all translations for a section
export function getSectionTranslations(locale, section) {
  return translations[section]?.[locale] || {};
}

// Route mappings for different languages
export const routeTranslations = {
  es: {
    '/signup': '/registro',
    '/leagues': '/ligas',
    '/rules': '/reglas',
    '/player': '/jugador',
    '/clubs': '/clubs'
  },
  en: {
    '/registro': '/signup',
    '/ligas': '/leagues',
    '/reglas': '/rules',
    '/jugador': '/player',
    '/clubs': '/clubs'
  }
};

// Get localized route
export function getLocalizedRoute(route, locale) {
  if (locale === 'es') {
    return routeTranslations.es[route] || route;
  }
  return route;
}

// City information with regions
export const cityInfo = {
  sotogrande: {
    es: { name: 'Sotogrande', region: 'Andalucía', status: 'active' },
    en: { name: 'Sotogrande', region: 'Andalusia', status: 'active' }
  },
  malaga: {
    es: { name: 'Málaga', region: 'Andalucía', status: 'active' },
    en: { name: 'Malaga', region: 'Andalusia', status: 'active' }
  },
  valencia: {
    es: { name: 'Valencia', region: 'Comunidad Valenciana', status: 'active' },
    en: { name: 'Valencia', region: 'Valencia', status: 'active' }
  },
  sevilla: {
    es: { name: 'Sevilla', region: 'Andalucía', status: 'active' },
    en: { name: 'Seville', region: 'Andalusia', status: 'active' }
  },
  barcelona: {
    es: { name: 'Barcelona', region: 'Cataluña', status: 'coming-soon' },
    en: { name: 'Barcelona', region: 'Catalonia', status: 'coming-soon' }
  },
  madrid: {
    es: { name: 'Madrid', region: 'Comunidad de Madrid', status: 'coming-soon' },
    en: { name: 'Madrid', region: 'Madrid', status: 'coming-soon' }
  },
  marbella: {
    es: { name: 'Marbella', region: 'Andalucía', status: 'coming-soon' },
    en: { name: 'Marbella', region: 'Andalusia', status: 'coming-soon' }
  }
};