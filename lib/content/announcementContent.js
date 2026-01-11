import { normalizePhoneForWhatsApp } from '../utils/phoneUtils'

export const announcementContent = {
  // League-specific announcement for Gold League Sotogrande
  goldLeagueRegistrationExtended: {
    id: 'gold-league-registration-extended-jan-2026',
    date: new Date('2026-01-11T12:00:00'),
    // Target only this specific league
    targetLeagues: ['gold-league-sotogrande-winter-2026'],
    es: {
      title: 'Actualización Gold League',
      subtitle: 'Gold League Sotogrande - Inscripciones extendidas',
      content: `
        <p class="mb-4">
          ¡Hola! Gracias por inscribirte de los primeros.
        </p>
        <p class="mb-4">
          Pequeña actualización sobre la <strong>Gold League Sotogrande</strong>: Hemos extendido 
          las inscripciones hasta el <strong>18 de enero</strong> para dar a más grandes jugadores 
          de la zona la oportunidad de unirse. Queremos que esto sea épico desde el primer partido.
        </p>
        <p class="mb-4">
          Prepara tu raqueta, calienta el brazo... <strong>¡esto está a punto de empezar!</strong>
        </p>
        <p class="text-sm text-gray-600">
          El equipo de Tenis del Parque
        </p>
      `,
      buttonText: '¡Entendido!'
    },
    en: {
      title: 'Gold League Update',
      subtitle: 'Gold League Sotogrande - Registration extended',
      content: `
        <p class="mb-4">
          Hi! Thanks for signing up early.
        </p>
        <p class="mb-4">
          Quick update on the <strong>Gold League Sotogrande</strong>: We've extended registration 
          to <strong>January 18th</strong> so we can give more great players from the area a chance 
          to join. We want this to be epic from the very first match.
        </p>
        <p class="mb-4">
          Get your racket ready, warm up your arm... <strong>this is about to start!</strong>
        </p>
        <p class="text-sm text-gray-600">
          The Tenis del Parque team
        </p>
      `,
      buttonText: 'Got it!'
    }
  },

  registrationClosed: {
    id: 'registration-closed-2025',
    date: new Date('2025-07-07T21:00:00'),
    es: {
      title: '¡Inscripciones cerradas! La liga comienza 🎾',
      subtitle: 'Los partidos de la primera ronda están listos',
      content: `
        <p class="mb-4">
          ¡Hola tenistas! 👋
        </p>
        <p class="mb-4">
          <strong>¡Las inscripciones han cerrado oficialmente!</strong> 🎉
        </p>
        <p class="mb-4">
          Estamos emocionados de anunciar que hemos alcanzado el número perfecto de jugadores para comenzar 
          nuestra primera temporada histórica de la Liga de Tenis del Parque en Sotogrande.
        </p>
        <p class="mb-4">
          📅 <strong>Los emparejamientos de la primera ronda ya están creados</strong> y los jugadores 
          registrados recibirán pronto la información sobre sus primeros partidos.
        </p>
        <p class="mb-4">
          A todos los participantes: ¡Preparaos para una temporada increíble llena de tenis competitivo, 
          nuevas amistades y mucha diversión! 🏆
        </p>
        <p class="mb-6">
          <strong>¡Mucha suerte a todos y que disfruten de cada partido!</strong> 🎾✨
        </p>
        <p class="text-sm text-gray-600">
          El equipo de Tenis del Parque
        </p>
      `,
      buttonText: '¡Vamos allá!'
    },
    en: {
      title: 'Registration closed! The league begins 🎾',
      subtitle: 'First round matches are ready',
      content: `
        <p class="mb-4">
          Hello tennis players! 👋
        </p>
        <p class="mb-4">
          <strong>Registration has officially closed!</strong> 🎉
        </p>
        <p class="mb-4">
          We're excited to announce that we've reached the perfect number of players to begin 
          our historic first season of the Tenis del Parque League in Sotogrande.
        </p>
        <p class="mb-4">
          📅 <strong>First round pairings have been created</strong> and registered players 
          will soon receive information about their first matches.
        </p>
        <p class="mb-4">
          To all participants: Get ready for an incredible season full of competitive tennis, 
          new friendships, and lots of fun! 🏆
        </p>
        <p class="mb-6">
          <strong>Good luck to everyone and enjoy every match!</strong> 🎾✨
        </p>
        <p class="text-sm text-gray-600">
          The Tenis del Parque team
        </p>
      `,
      buttonText: "Let's go!"
    }
  },
  firstRoundDelay: {
    id: 'first-round-delay-2025',
    date: new Date('2025-01-05T23:00:00'),
    es: {
      title: '¡Importante! Actualización sobre la Primera Ronda',
      subtitle: 'Un día más para que todos se unan',
      content: `
        <p class="mb-4">
          ¡Hola tenistas! 👋
        </p>
        <p class="mb-4">
          Sabemos que estáis emocionados por empezar la liga, ¡y nosotros también! 🎾
        </p>
        <p class="mb-4">
          <strong>Hemos decidido esperar un día más</strong> antes de crear los emparejamientos de la primera ronda. 
          ¿Por qué? Queremos asegurarnos de que todos los jugadores registrados tengan la oportunidad de activar sus cuentas 
          y estar listos para participar.
        </p>
        <p class="mb-4">
          📅 <strong>Los emparejamientos de la primera ronda se publicarán el lunes por la noche.</strong>
        </p>
        <p class="mb-4">
          Esto nos permitirá crear los mejores emparejamientos posibles y asegurar que nadie se quede fuera. 
          Si conoces a alguien que aún no ha activado su cuenta, ¡recuérdale que lo haga hoy!
        </p>
        <p class="mb-6">
          Gracias por vuestra paciencia. ¡La espera valdrá la pena! 🏆
        </p>
        <p class="text-sm text-gray-600">
          El equipo de Tenis del Parque
        </p>
      `,
      buttonText: 'Entendido, ¡gracias!'
    },
    en: {
      title: 'Important! First Round Update',
      subtitle: 'One more day for everyone to join',
      content: `
        <p class="mb-4">
          Hello tennis players! 👋
        </p>
        <p class="mb-4">
          We know you're excited to start the league, and so are we! 🎾
        </p>
        <p class="mb-4">
          <strong>We've decided to wait one more day</strong> before creating the first round pairings. 
          Why? We want to make sure all registered players have the opportunity to activate their accounts 
          and be ready to participate.
        </p>
        <p class="mb-4">
          📅 <strong>First round pairings will be published Monday evening.</strong>
        </p>
        <p class="mb-4">
          This will allow us to create the best possible matchups and ensure no one is left out. 
          If you know someone who hasn't activated their account yet, remind them to do it today!
        </p>
        <p class="mb-6">
          Thank you for your patience. The wait will be worth it! 🏆
        </p>
        <p class="text-sm text-gray-600">
          The Tenis del Parque team
        </p>
      `,
      buttonText: 'Got it, thanks!'
    }
  },
  firstRoundMatch: {
    id: 'first-round-match-2026',
    date: new Date('2026-01-11T20:00:00'),
    dynamic: true, // This announcement needs dynamic content per player
    es: {
      title: 'Tu primer partido está listo',
      subtitle: 'Temporada Invierno 2026',
      getContent: (playerName, opponentName, opponentWhatsapp, matchDetails) => {
        // Normalize the phone number for WhatsApp
        const normalizedPhone = normalizePhoneForWhatsApp(opponentWhatsapp)
        // Create the message template - same as used in matches page
        const whatsappMessage = `Hola ${opponentName}! Soy ${playerName} de la liga de tenis. ¿Cuándo te viene bien para jugar nuestro partido de la ronda 1?`
        const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsappMessage)}`
        
        return `
        <p class="mb-4">
          Hola <strong>${playerName}</strong>,
        </p>
        <p class="mb-4">
          La espera ha terminado. Tu primer partido de la <strong>${matchDetails?.leagueName || 'liga'}</strong> 
          en la <strong>Temporada Invierno 2026</strong> ya está programado.
        </p>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-7 h-7 rounded-full bg-parque-purple text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <p class="text-base font-semibold text-gray-700">Tu rival de la Primera Ronda</p>
          </div>
          <p class="text-xl font-bold text-parque-purple mb-3">${opponentName}</p>
          
          <div class="space-y-2">
            <p class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span><strong>Ronda:</strong> Primera Ronda</span>
            </p>
            ${matchDetails?.level ? `
            <p class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 15c-1.95 0-3.74-.77-5.07-2.03A6.972 6.972 0 015 8V4h14v4c0 1.87-.74 3.57-1.93 4.97A7.024 7.024 0 0112 15z"/>
                <path d="M5 4h14M8 21h8M12 15v6"/>
              </svg>
              <span><strong>Nivel:</strong> ${matchDetails.level}</span>
            </p>
            ` : ''}
          </div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <p class="font-semibold text-green-800">Contacta con tu rival</p>
          </div>
          <a href="${whatsappUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Enviar mensaje por WhatsApp
          </a>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <p class="font-semibold text-blue-800">Próximos pasos</p>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Contacta con ${opponentName} para acordar fecha y hora</li>
            <li>Reservad una pista (cada jugador paga la mitad)</li>
            <li>Jugad el partido antes del final de la ronda</li>
            <li>El ganador reporta el resultado en la plataforma</li>
          </ol>
        </div>
        
        <div class="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p class="font-semibold text-amber-800">Plazos y extensiones</p>
          </div>
          <ul class="space-y-1 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Tienes <strong>1 semana</strong> para jugar cada partido</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Si no podéis esta semana, tienes <strong>3 extensiones</strong> disponibles por temporada</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Cada extensión añade 1 semana adicional al plazo</span>
            </li>
          </ul>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p class="font-semibold text-purple-800">Pista recomendada: Club El Faisán</p>
          </div>
          <p class="text-sm text-gray-700 mb-3">
            Tenemos un acuerdo especial para partidos de la liga: <strong>25€ por 1.5 horas</strong> (12.50€ por jugador).
          </p>
          <p class="text-sm text-gray-700 mb-3">
            Llama a Lorenzo para reservar y menciona que es un partido de la Liga TDP.
          </p>
          <a href="tel:+34617462570" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Lorenzo: +34 617 46 25 70
          </a>
          <p class="text-xs text-gray-500 mt-2">
            Recuerda indicar el lugar del partido en la app cuando confirméis la fecha.
          </p>
        </div>
        
        <p class="text-sm text-gray-600">
          Contacta a tu rival cuanto antes para encontrar el mejor momento para ambos. ¡Buena suerte!
        </p>
      `
      },
      buttonText: 'Entendido'
    },
    en: {
      title: 'Your first match is ready',
      subtitle: 'Winter Season 2026',
      getContent: (playerName, opponentName, opponentWhatsapp, matchDetails) => {
        // Normalize the phone number for WhatsApp
        const normalizedPhone = normalizePhoneForWhatsApp(opponentWhatsapp)
        // Create the message template - same as used in matches page
        const whatsappMessage = `Hi ${opponentName}! I'm ${playerName} from the tennis league. When would be a good time to play our round 1 match?`
        const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsappMessage)}`
        
        return `
        <p class="mb-4">
          Hello <strong>${playerName}</strong>,
        </p>
        <p class="mb-4">
          The wait is over. Your first match in the <strong>${matchDetails?.leagueName || 'league'}</strong> 
          for the <strong>Winter Season 2026</strong> is now scheduled.
        </p>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-7 h-7 rounded-full bg-parque-purple text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <p class="text-base font-semibold text-gray-700">Your First Round opponent</p>
          </div>
          <p class="text-xl font-bold text-parque-purple mb-3">${opponentName}</p>
          
          <div class="space-y-2">
            <p class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span><strong>Round:</strong> First Round</span>
            </p>
            ${matchDetails?.level ? `
            <p class="flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 15c-1.95 0-3.74-.77-5.07-2.03A6.972 6.972 0 015 8V4h14v4c0 1.87-.74 3.57-1.93 4.97A7.024 7.024 0 0112 15z"/>
                <path d="M5 4h14M8 21h8M12 15v6"/>
              </svg>
              <span><strong>Level:</strong> ${matchDetails.level}</span>
            </p>
            ` : ''}
          </div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <p class="font-semibold text-green-800">Contact your opponent</p>
          </div>
          <a href="${whatsappUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Send WhatsApp message
          </a>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <p class="font-semibold text-blue-800">Next steps</p>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Contact ${opponentName} to arrange date and time</li>
            <li>Book a court (each player pays half)</li>
            <li>Play the match before the round ends</li>
            <li>The winner reports the result on the platform</li>
          </ol>
        </div>
        
        <div class="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p class="font-semibold text-amber-800">Deadlines and extensions</p>
          </div>
          <ul class="space-y-1 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>You have <strong>1 week</strong> to play each match</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>If you can't make it this week, you have <strong>3 extensions</strong> available per season</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Each extension adds 1 extra week to the deadline</span>
            </li>
          </ul>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p class="font-semibold text-purple-800">Recommended court: Club El Faisán</p>
          </div>
          <p class="text-sm text-gray-700 mb-3">
            We have a special deal for league matches: <strong>€25 for 1.5 hours</strong> (€12.50 per player).
          </p>
          <p class="text-sm text-gray-700 mb-3">
            Call Lorenzo to book and mention it's a TDP League match.
          </p>
          <a href="tel:+34617462570" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Lorenzo: +34 617 46 25 70
          </a>
          <p class="text-xs text-gray-500 mt-2">
            Remember to add the venue in the app when you schedule your match.
          </p>
        </div>
        
        <p class="text-sm text-gray-600">
          Contact your opponent as soon as possible to find the best time for both. Good luck!
        </p>
      `
      },
      buttonText: 'Got it'
    }
  }
};
