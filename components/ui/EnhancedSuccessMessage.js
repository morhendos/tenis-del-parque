import React from 'react'
import Link from 'next/link'

export default function EnhancedSuccessMessage({ 
  playerName,
  leagueName, 
  leagueStatus,
  currentPlayerCount = 0,
  targetPlayerCount = 40,
  expectedStartDate,
  whatsappGroupLink,
  shareUrl,
  language = 'es'
}) {
  
  const messages = {
    es: {
      confirmed: '¡Registro Confirmado!',
      waitingList: '¡En Lista de Espera!',
      registeredFor: 'Te has registrado para',
      emailSent: 'Hemos enviado los detalles a tu email',
      whatsappContact: 'Te contactaremos por WhatsApp cuando la liga esté lista',
      nextSteps: '¿Qué pasa ahora?',
      waitingForPlayers: 'Esperamos reunir {target} jugadores para confirmar la liga',
      currentProgress: 'Actualmente tenemos {current} jugadores registrados',
      needed: 'Necesitamos {needed} jugadores más',
      estimatedStart: 'Fecha estimada de inicio: {date}',
      actualStart: 'Fecha de inicio: {date}',
      stayInformed: 'Te mantendremos informado del progreso',
      joinGroup: 'Únete al Grupo',
      shareWithFriends: 'Compartir con Amigos',
      helpComplete: '¡Ayúdanos a completar la liga invitando a más jugadores!',
      readyToStart: 'La liga está lista para comenzar',
      inviteSoon: 'Te invitaremos a crear tu cuenta muy pronto'
    },
    en: {
      confirmed: 'Registration Confirmed!',
      waitingList: 'On Waiting List!',
      registeredFor: 'You have registered for',
      emailSent: 'We have sent the details to your email',
      whatsappContact: 'We will contact you via WhatsApp when the league is ready',
      nextSteps: 'What happens now?',
      waitingForPlayers: 'We are waiting to gather {target} players to confirm the league',
      currentProgress: 'We currently have {current} players registered',
      needed: 'We need {needed} more players',
      estimatedStart: 'Estimated start date: {date}',
      actualStart: 'Start date: {date}',
      stayInformed: 'We will keep you informed of the progress',
      joinGroup: 'Join Group',
      shareWithFriends: 'Share with Friends',
      helpComplete: 'Help us complete the league by inviting more players!',
      readyToStart: 'The league is ready to start',
      inviteSoon: 'We will invite you to create your account very soon'
    }
  }

  const t = messages[language]
  const playersNeeded = Math.max(0, targetPlayerCount - currentPlayerCount)
  const isWaitingList = leagueStatus === 'coming_soon'
  const isReady = currentPlayerCount >= targetPlayerCount

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
          {isWaitingList ? '⏳' : '🏆'}
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
              <span className="text-lg mr-3 mt-0.5">👥</span>
              <div>
                <div>{t.waitingForPlayers.replace('{target}', targetPlayerCount)}</div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{t.currentProgress.replace('{current}', currentPlayerCount)}</span>
                    <span className="font-medium">{currentPlayerCount}/{targetPlayerCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-parque-green to-parque-purple h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((currentPlayerCount / targetPlayerCount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {playersNeeded > 0 && (
                    <div className="mt-2 text-sm text-parque-purple font-medium">
                      {t.needed.replace('{needed}', playersNeeded)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-lg mr-3">📅</span>
              <span>{t.estimatedStart.replace('{date}', formatDate(expectedStartDate))}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-lg mr-3">📢</span>
              <span>{t.stayInformed}</span>
            </div>
          </div>
        )}

        {!isWaitingList && (
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center">
              <span className="text-lg mr-3">✅</span>
              <span>{isReady ? t.readyToStart : t.inviteSoon}</span>
            </div>
            {expectedStartDate && (
              <div className="flex items-center">
                <span className="text-lg mr-3">📅</span>
                <span>{t.actualStart.replace('{date}', formatDate(expectedStartDate))}</span>
              </div>
            )}
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
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="text-lg mr-2">💬</span>
            {t.joinGroup}
          </a>
        )}
        
        {shareUrl && (
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-6 py-3 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors"
          >
            <span className="text-lg mr-2">📤</span>
            {t.shareWithFriends}
          </button>
        )}
      </div>

      {/* Help Complete League */}
      {isWaitingList && playersNeeded > 0 && (
        <div className="text-center p-4 bg-parque-purple/10 rounded-lg border border-parque-purple/20">
          <p className="text-parque-purple font-medium">
            {t.helpComplete}
          </p>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link 
          href="/"
          className="text-gray-600 hover:text-parque-purple transition-colors"
        >
          ← Volver al inicio
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
.hover\\:bg-parque-purple\\/90:hover { background-color: rgba(86, 51, 128, 0.9); }
`
