import { normalizePhoneForWhatsApp } from '../utils/phoneUtils'

const firstRoundText = {
  es: {
    hello: (name) => `Hola ${name}, la espera ha terminado.`,
    intro: (league) => `Este es tu primer rival en la <strong>${league}</strong>.`,
    rivalLabel: 'Tu rival · Ronda 1',
    whatsapp: 'Escribir por WhatsApp',
    whatsappMsg: (rival, me) => `Hola ${rival}! Soy ${me} de la liga de tenis. ¿Cuándo te viene bien para jugar nuestro partido de la ronda 1?`,
    howTitle: 'Cómo funciona',
    steps: (rival) => [
      `Escribe a ${rival} y acordad día y hora`,
      'Jugad en la pista que os venga bien a los dos (cada uno paga la mitad)',
      'Tenéis <strong>1 semana</strong> por partido. Si no podéis, hay <strong>3 extensiones</strong> por temporada (+1 semana cada una)',
      'El ganador sube el resultado en la app'
    ],
    courtTitle: '¿Necesitáis pista?',
    courtBody: 'Lorenzo en las pistas del Faisán hace <strong>25€ por 1.5 horas</strong> (12.50€ cada uno) para partidos de la liga. Dile que es un partido de la Liga TDP.',
    courtCall: 'Llamar a Lorenzo',
    luck: '¡Mucha suerte!'
  },
  en: {
    hello: (name) => `Hi ${name}, the wait is over.`,
    intro: (league) => `Here's your first rival in the <strong>${league}</strong>.`,
    rivalLabel: 'Your rival · Round 1',
    whatsapp: 'Message on WhatsApp',
    whatsappMsg: (rival, me) => `Hi ${rival}! I'm ${me} from the tennis league. When would be a good time to play our round 1 match?`,
    howTitle: 'How it works',
    steps: (rival) => [
      `Message ${rival} and agree on a day and time`,
      'Play on any court that suits you both (you split the cost)',
      'You have <strong>1 week</strong> per match. If you can\'t make it, you get <strong>3 extensions</strong> per season (+1 week each)',
      'The winner reports the result in the app'
    ],
    courtTitle: 'Need a court?',
    courtBody: 'Lorenzo at the Faisán courts does <strong>25€ for 1.5 hours</strong> (12.50€ each) for league matches. Tell him it\'s a TDP League match.',
    courtCall: 'Call Lorenzo',
    luck: 'Good luck!'
  }
}

const initialsOf = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase()

function buildFirstRoundContent(lang, playerName, opponentName, opponentWhatsapp, matchDetails) {
  const t = firstRoundText[lang]
  const firstName = (playerName || '').trim().split(/\s+/)[0]
  const league = matchDetails?.leagueName || (lang === 'es' ? 'liga' : 'league')
  const phone = normalizePhoneForWhatsApp(opponentWhatsapp)
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(t.whatsappMsg(opponentName, playerName))}`
  const steps = t.steps(opponentName).map((s, i) => `
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-50 text-parque-purple text-xs font-bold flex items-center justify-center">${i + 1}</span>
            <span class="text-sm text-gray-700 leading-6">${s}</span>
          </li>`).join('')

  return `
    <p class="text-gray-900 font-medium">${t.hello(firstName)}</p>
    <p class="text-gray-600">${t.intro(league)}</p>

    <div class="mt-5 rounded-2xl bg-gradient-to-br from-parque-purple to-purple-900 p-5 text-white shadow-lg shadow-purple-900/20">
      <p class="text-[11px] font-semibold uppercase tracking-widest text-purple-200">${t.rivalLabel}</p>
      <div class="mt-3 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-white/15 ring-2 ring-white/30 flex items-center justify-center text-lg font-bold">${initialsOf(opponentName)}</div>
        <div class="min-w-0">
          <p class="text-2xl font-bold leading-tight truncate">${opponentName}</p>
          ${matchDetails?.level ? `<p class="text-sm text-purple-200 capitalize">${matchDetails.level}</p>` : ''}
        </div>
      </div>
      <a href="${whatsappUrl}" target="_blank" rel="noopener" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-95 transition">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        ${t.whatsapp}
      </a>
    </div>

    <div class="mt-5 rounded-2xl border border-gray-100 bg-white p-5">
      <p class="text-sm font-semibold text-gray-900 mb-3">${t.howTitle}</p>
      <ol class="space-y-3">${steps}
      </ol>
    </div>

    <div class="mt-4 rounded-2xl bg-purple-50/60 border border-purple-100 p-5">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center text-parque-purple">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900">${t.courtTitle}</p>
          <p class="mt-1 text-sm text-gray-600">${t.courtBody}</p>
          <a href="tel:+34617462570" class="mt-3 inline-flex items-center gap-2 rounded-lg border border-parque-purple/30 bg-white px-3 py-1.5 text-sm font-medium text-parque-purple hover:bg-purple-50 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            ${t.courtCall}
          </a>
        </div>
      </div>
    </div>

    <p class="mt-5 text-sm text-gray-500 text-center">${t.luck}</p>
  `
}

export const announcementContent = {
  // League-specific announcement for Gold League Sotogrande
  goldLeagueRegistrationExtended: {
    id: 'gold-league-registration-extended-jan-2026',
    date: new Date('2026-01-11T12:00:00'),
    // Target only this specific league
    targetLeagues: ['gold-league-sotogrande-winter-2026'],
    expiresAt: new Date('2026-01-19T00:00:00'),
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
    dynamic: true,
    es: {
      title: 'Tu primer partido está listo',
      subtitle: 'Ronda 1',
      getContent: (playerName, opponentName, opponentWhatsapp, matchDetails) =>
        buildFirstRoundContent('es', playerName, opponentName, opponentWhatsapp, matchDetails),
      buttonText: '¡Vamos!'
    },
    en: {
      title: 'Your first match is ready',
      subtitle: 'Round 1',
      getContent: (playerName, opponentName, opponentWhatsapp, matchDetails) =>
        buildFirstRoundContent('en', playerName, opponentName, opponentWhatsapp, matchDetails),
      buttonText: "Let's go"
    }
  },

  // BYE round announcement - shown when player has no opponent due to odd number of players
  byeRound: {
    id: 'bye-round-2026',
    dynamic: true,
    es: {
      title: 'Tienes un BYE esta ronda',
      subtitle: 'Jornada de descanso',
      getContent: (playerName, matchDetails) => {
        return `
        <p class="mb-4">
          Hola <strong>${playerName}</strong>,
        </p>
        <p class="mb-4">
          Debido a un número impar de jugadores en la <strong>${matchDetails?.leagueName || 'liga'}</strong>, 
          te ha tocado un <strong>BYE</strong> en la <strong>Ronda ${matchDetails?.round || ''}</strong>.
        </p>
        
        <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="font-semibold text-emerald-800">¿Qué significa esto?</p>
          </div>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Recibes automáticamente <strong>3 puntos</strong> (equivalente a una victoria 2-0)</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>No necesitas hacer nada - los puntos ya están sumados</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>La próxima ronda tendrás un rival como de costumbre</span>
            </li>
          </ul>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <p class="font-semibold text-blue-800">Aprovecha la semana</p>
          </div>
          <p class="text-sm text-gray-700">
            Es un buen momento para descansar, practicar tu servicio, o simplemente 
            disfrutar viendo los partidos de los demás jugadores.
          </p>
        </div>
        
        <p class="text-sm text-gray-600">
          ¡Nos vemos en la próxima ronda! 🎾
        </p>
      `
      },
      buttonText: 'Entendido'
    },
    en: {
      title: 'You have a BYE this round',
      subtitle: 'Bye round',
      getContent: (playerName, matchDetails) => {
        return `
        <p class="mb-4">
          Hello <strong>${playerName}</strong>,
        </p>
        <p class="mb-4">
          Due to an odd number of players in the <strong>${matchDetails?.leagueName || 'league'}</strong>, 
          you&apos;ve been assigned a <strong>BYE</strong> for <strong>Round ${matchDetails?.round || ''}</strong>.
        </p>
        
        <div class="bg-emerald-50 rounded-lg p-4 mb-4 border border-emerald-200">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="font-semibold text-emerald-800">What does this mean?</p>
          </div>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>You automatically receive <strong>3 points</strong> (equivalent to a 2-0 win)</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>No action needed - points are already added</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Next round you&apos;ll be paired with an opponent as usual</span>
            </li>
          </ul>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <p class="font-semibold text-blue-800">Make the most of the week</p>
          </div>
          <p class="text-sm text-gray-700">
            It&apos;s a good time to rest, practice your serve, or simply 
            enjoy watching other players&apos; matches.
          </p>
        </div>
        
        <p class="text-sm text-gray-600">
          See you next round! 🎾
        </p>
      `
      },
      buttonText: 'Got it'
    }
  }
};
