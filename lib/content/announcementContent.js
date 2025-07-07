import { normalizePhoneForWhatsApp } from '../utils/phoneUtils'

export const announcementContent = {
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
    id: 'first-round-match-2025',
    date: new Date('2025-01-07T10:00:00'),
    dynamic: true, // This announcement needs dynamic content per player
    es: {
      title: '¡Tu primer partido está listo! 🎾',
      subtitle: 'Es hora de conocer a tu rival',
      getContent: (playerName, opponentName, opponentWhatsapp, matchDetails) => {
        // Normalize the phone number for WhatsApp
        const normalizedPhone = normalizePhoneForWhatsApp(opponentWhatsapp)
        // Create the message template - same as used in matches page
        const whatsappMessage = `Hola ${opponentName}! Soy ${playerName} de la liga de tenis. ¿Cuándo te viene bien para jugar nuestro partido de la ronda 1?`
        const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsappMessage)}`
        
        return `
        <p class="mb-4">
          ¡Hola <strong>${playerName}</strong>! 🎉
        </p>
        <p class="mb-4">
          ¡La espera ha terminado! Tu primer partido de la <strong>Liga del Parque Sotogrande</strong> ya está programado.
        </p>
        <div class="bg-parque-purple/10 rounded-lg p-4 mb-4">
          <p class="text-lg font-semibold mb-2">🎾 Tu rival de la Primera Ronda:</p>
          <p class="text-xl font-bold text-parque-purple mb-3">${opponentName}</p>
          
          <div class="space-y-2">
            <p class="flex items-center text-sm">
              <span class="mr-2">📅</span>
              <span><strong>Ronda:</strong> Primera Ronda</span>
            </p>
            ${matchDetails?.level ? `
            <p class="flex items-center text-sm">
              <span class="mr-2">🏆</span>
              <span><strong>Nivel:</strong> ${matchDetails.level}</span>
            </p>
            ` : ''}
          </div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 mb-4">
          <p class="font-semibold mb-2">📱 Contacta con tu rival:</p>
          <a href="${whatsappUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Enviar mensaje por WhatsApp
          </a>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <p class="font-semibold mb-2">📋 Próximos pasos:</p>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            <li>Contacta con ${opponentName} para acordar fecha y hora</li>
            <li>Reservad una pista (cada jugador paga la mitad)</li>
            <li>Jugad el partido antes del final de la ronda</li>
            <li>El ganador reporta el resultado en la plataforma</li>
          </ol>
        </div>
        
        <p class="mb-4">
          <strong>Recuerda:</strong> Tienes varias semanas para jugar este partido. 
          ¡Coordina con tu rival y encuentra el mejor momento para ambos!
        </p>
        
        <p class="text-sm text-gray-600">
          ¡Mucha suerte y que gane el mejor! 🏆
        </p>
      `
      },
      buttonText: '¡Vamos a jugar!'
    },
    en: {
      title: 'Your first match is ready! 🎾',
      subtitle: 'Time to meet your opponent',
      getContent: (playerName, opponentName, opponentWhatsapp, matchDetails) => {
        // Normalize the phone number for WhatsApp
        const normalizedPhone = normalizePhoneForWhatsApp(opponentWhatsapp)
        // Create the message template - same as used in matches page
        const whatsappMessage = `Hi ${opponentName}! I'm ${playerName} from the tennis league. When would be a good time to play our round 1 match?`
        const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsappMessage)}`
        
        return `
        <p class="mb-4">
          Hello <strong>${playerName}</strong>! 🎉
        </p>
        <p class="mb-4">
          The wait is over! Your first match in the <strong>Liga del Parque Sotogrande</strong> is now scheduled.
        </p>
        <div class="bg-parque-purple/10 rounded-lg p-4 mb-4">
          <p class="text-lg font-semibold mb-2">🎾 Your First Round opponent:</p>
          <p class="text-xl font-bold text-parque-purple mb-3">${opponentName}</p>
          
          <div class="space-y-2">
            <p class="flex items-center text-sm">
              <span class="mr-2">📅</span>
              <span><strong>Round:</strong> First Round</span>
            </p>
            ${matchDetails?.level ? `
            <p class="flex items-center text-sm">
              <span class="mr-2">🏆</span>
              <span><strong>Level:</strong> ${matchDetails.level}</span>
            </p>
            ` : ''}
          </div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 mb-4">
          <p class="font-semibold mb-2">📱 Contact your opponent:</p>
          <a href="${whatsappUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Send WhatsApp message
          </a>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <p class="font-semibold mb-2">📋 Next steps:</p>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            <li>Contact ${opponentName} to arrange date and time</li>
            <li>Book a court (each player pays half)</li>
            <li>Play the match before the round ends</li>
            <li>The winner reports the result on the platform</li>
          </ol>
        </div>
        
        <p class="mb-4">
          <strong>Remember:</strong> You have several weeks to play this match. 
          Coordinate with your opponent and find the best time for both!
        </p>
        
        <p class="text-sm text-gray-600">
          Good luck and may the best player win! 🏆
        </p>
      `
      },
      buttonText: "Let's play!"
    }
  }
};
