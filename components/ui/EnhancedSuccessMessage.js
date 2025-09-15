import React from 'react'
import Link from 'next/link'

export default function EnhancedSuccessMessage({ 
  playerName,
  leagueName, 
  leagueStatus,
  expectedStartDate,
  whatsappGroupLink,
  shareUrl,
  language = 'es'
}) {
  
  const messages = {
    es: {
      confirmed: '¡Registro Confirmado!',
      waitingList: '¡Bienvenido a la Liga!',
      registeredFor: 'Te has registrado para',
      emailSent: 'Hemos enviado los detalles a tu email',
      whatsappContact: 'Te contactaremos por WhatsApp cuando la liga esté lista',
      nextSteps: '¿Qué pasa ahora?',
      waitingForStart: 'Estamos preparando una liga increíble para ti',
      estimatedStart: 'Fecha estimada de inicio: {date}',
      actualStart: 'Fecha de inicio: {date}',
      stayInformed: 'Te mantendremos informado del progreso',
      joinGroup: 'Únete al Grupo',
      shareWithFriends: 'Compartir con Amigos',
      helpComplete: '¡Invita a tus amigos para que la liga sea aún mejor!',
      readyToStart: 'La liga está lista para comenzar',
      inviteSoon: 'Te invitaremos a crear tu cuenta muy pronto',
      gatheringPlayers: 'Estamos reuniendo jugadores como tú',
      perfectTime: 'Es el momento perfecto para prepararte',
      buildCommunity: 'Estamos construyendo una comunidad increíble de tenistas'
    },
    en: {
      confirmed: 'Registration Confirmed!',
      waitingList: 'Welcome to the League!',
      registeredFor: 'You have registered for',
      emailSent: 'We have sent the details to your email',
      whatsappContact: 'We will contact you via WhatsApp when the league is ready',
      nextSteps: 'What happens now?',
      waitingForStart: 'We are preparing an amazing league for you',
      estimatedStart: 'Estimated start date: {date}',
      actualStart: 'Start date: {date}',
      stayInformed: 'We will keep you informed of the progress',
      joinGroup: 'Join Group',
      shareWithFriends: 'Share with Friends',
      helpComplete: 'Invite your friends to make the league even better!',
      readyToStart: 'The league is ready to start',
      inviteSoon: 'We will invite you to create your account very soon',
      gatheringPlayers: 'We are gathering players like you',
      perfectTime: 'This is the perfect time to get ready',
      buildCommunity: 'We are building an amazing community of tennis players'
    }
  }

  const t = messages[language]
  const isWaitingList = leagueStatus === 'coming_soon'

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const createShareText = () => {
    const baseText = language === 'es' 
      ? `¡Me he apuntado a ${leagueName}! ¿Te animas a jugar conmigo?`
      : `I just signed up for ${leagueName}! Want to play with me?`
    
    return encodeURIComponent(`${baseText}\n\n${shareUrl}`)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: leagueName,
        text: createShareText(),
        url: shareUrl
      })
    } else {
      // Fallback to WhatsApp share
      const whatsappUrl = `https://wa.me/?text=${createShareText()}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          🏆
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isWaitingList ? t.waitingList : t.confirmed}
        </h1>
        <p className="text-lg text-gray-600">
          {t.registeredFor} <span className="font-semibold text-parque-purple">{leagueName}</span>
        </p>
      </div>

      {/* Quick Info */}
      <div className="bg-parque-bg rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <span className="text-lg mr-3">📧</span>
            <span>{t.emailSent}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="text-lg mr-3">📱</span>
            <span>{t.whatsappContact}</span>
          </div>
        </div>
      </div>

      {/* League Status */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.nextSteps}</h3>
        
        {isWaitingList && (
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="text-lg mr-3 mt-0.5">🎾</span>
              <div>
                <div className="font-medium mb-1">{t.waitingForStart}</div>
                <div className="text-sm text-gray-600">{t.gatheringPlayers}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-lg mr-3 mt-0.5">📅</span>
              <div>
                <div>{t.estimatedStart.replace('{date}', formatDate(expectedStartDate))}</div>
                <div className="text-sm text-gray-600">{t.perfectTime}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-lg mr-3 mt-0.5">👥</span>
              <div>
                <div>{t.buildCommunity}</div>
                <div className="text-sm text-gray-600">{t.stayInformed}</div>
              </div>
            </div>
          </div>
        )}

        {!isWaitingList && (
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center">
              <span className="text-lg mr-3">✅</span>
              <span>{t.readyToStart}</span>
            </div>
            {expectedStartDate && (
              <div className="flex items-center">
                <span className="text-lg mr-3">📅</span>
                <span>{t.actualStart.replace('{date}', formatDate(expectedStartDate))}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="text-lg mr-3">🚀</span>
              <span>{t.inviteSoon}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {whatsappGroupLink && (
          <a
            href={whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <span className="text-lg mr-2">💬</span>
            {t.joinGroup}
          </a>
        )}
        
        {shareUrl && (
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-6 py-3 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors font-medium"
          >
            <span className="text-lg mr-2">📤</span>
            {t.shareWithFriends}
          </button>
        )}
      </div>

      {/* Encouragement for Sharing */}
      <div className="text-center p-4 bg-gradient-to-r from-parque-purple/10 to-parque-green/10 rounded-lg border border-parque-purple/20">
        <p className="text-parque-purple font-medium mb-2">
          {t.helpComplete}
        </p>
        <p className="text-sm text-gray-600">
          {language === 'es' 
            ? 'Cuantos más seamos, ¡más divertido será!' 
            : 'The more players we have, the more fun it will be!'
          }
        </p>
      </div>

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link 
          href="/"
          className="text-gray-600 hover:text-parque-purple transition-colors"
        >
          {language === 'es' ? '← Volver al inicio' : '← Back to home'}
        </Link>
      </div>
    </div>
  )
}

// CSS classes for Tailwind (add to globals.css or component)
const styles = `
.bg-parque-purple { background-color: #563380; }
.bg-parque-green { background-color: #8FBF60; }
.bg-parque-bg { background-color: #D5D3C3; }
.text-parque-purple { color: #563380; }
.border-parque-purple\\/20 { border-color: rgba(86, 51, 128, 0.2); }
.bg-parque-purple\\/10 { background-color: rgba(86, 51, 128, 0.1); }
.from-parque-purple\\/10 { --tw-gradient-from: rgba(86, 51, 128, 0.1); }
.to-parque-green\\/10 { --tw-gradient-to: rgba(143, 191, 96, 0.1); }
.hover\\:bg-parque-purple\\/90:hover { background-color: rgba(86, 51, 128, 0.9); }
`