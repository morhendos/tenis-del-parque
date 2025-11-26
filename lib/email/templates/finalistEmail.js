// Finalists Email Template - Congratulations on reaching the final!
// File: lib/email/templates/finalistEmail.js

export const finalistEmailTemplate = {
  es: {
    subject: 'Finalista - A un partido del campeonato | {leagueName}',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eres Finalista</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 3px solid #7c3aed; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa); color: white; padding: 40px 32px; text-align: center; position: relative; overflow: hidden; border-radius: 16px 16px 0 0; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 700; background: rgba(255,255,255,0.95); color: #7c3aed; border: 2px solid white; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .final-match-card { background: linear-gradient(135deg, #ffffff, #ede9fe); border: 3px solid #7c3aed; padding: 24px; border-radius: 16px; margin: 20px 0; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15); }
        .button { display: inline-block; background-color: #7c3aed; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; margin: 8px 4px; font-weight: 600; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button-champion { background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa); font-size: 18px; }
        .button-secondary { background-color: #10b981; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; }
        h1 { margin: 0 0 12px 0; font-size: 36px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 8px 0; }
        .trophy-showcase { text-align: center; padding: 28px 20px; background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-radius: 16px; margin: 24px 0; border: 2px solid #7c3aed; }
        .journey-timeline { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #7c3aed; margin: 20px 0; }
        .timeline-item { margin: 16px 0; padding-left: 24px; position: relative; }
        .timeline-item::before { content: ''; position: absolute; left: 0; top: 6px; background: #10b981; width: 10px; height: 10px; border-radius: 50%; }
        .timeline-item.final::before { background: #7c3aed; width: 12px; height: 12px; top: 5px; }
        .motivational-quote { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2); }
        .prize-info { background: linear-gradient(135deg, #ede9fe, #ddd6fe); padding: 24px; border-radius: 12px; border: 2px solid #7c3aed; margin: 24px 0; text-align: center; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #7c3aed; }
        .celebration-banner { background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="status-badge">
                FINALISTA
            </div>
            <h1>Felicidades {playerName}</h1>
            <p style="margin: 12px 0; font-size: 22px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Estás a un partido del Campeonato
            </p>
            <p style="margin: 0; font-size: 16px; font-weight: 600; opacity: 0.95;">
                {leagueName} · Grupo {playoffGroup}
            </p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Trophy Showcase -->
            <div class="trophy-showcase">
                <h2 style="margin: 0 0 8px 0; color: #7c3aed;">Has llegado a la Final</h2>
                <p style="margin: 0; font-size: 16px; color: #4b5563; font-weight: 500;">
                    Solo quedan 2 jugadores en pie. Tú eres uno de ellos.
                </p>
            </div>

            <!-- Your Journey -->
            <div class="section">
                <h2>Tu Camino hasta Aquí</h2>
                <div class="journey-timeline">
                    <div class="timeline-item">
                        <strong>Liga Regular:</strong> Posición #{regularSeasonPosition} con {regularSeasonPoints} puntos
                    </div>
                    <div class="timeline-item">
                        <strong>Cuartos de Final:</strong> Victoria sobre {quarterfinalOpponent}
                    </div>
                    <div class="timeline-item">
                        <strong>Semifinal:</strong> Victoria sobre {semifinalOpponent}
                    </div>
                    <div class="timeline-item final">
                        <strong style="color: #7c3aed;">FINAL:</strong> El partido decisivo
                    </div>
                </div>
            </div>

            <!-- The Final Match -->
            <div class="section">
                <h2>La Gran Final</h2>
                <div class="final-match-card">
                    <h3 style="text-align: center; font-size: 20px; color: #7c3aed; font-weight: 800; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 1px;">
                        Por el Campeonato
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        <tr>
                            <td style="width: 40%; vertical-align: top;">
                                <div style="text-align: center; padding: 16px; background: white; border-radius: 12px; border: 2px solid #e5e7eb;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 700; margin: 4px 0;">Seed #{playerSeed}</div>
                                    <strong style="font-size: 16px; display: block; margin: 12px 0 8px 0;">{playerName}</strong>
                                    <div style="text-align: center; padding: 12px 8px; background: #f9fafb; border-radius: 10px; border: 2px solid #e5e7eb;">
                                        <div style="font-size: 28px; font-weight: 900; color: #7c3aed;">{playerElo}</div>
                                        <div style="font-size: 11px; color: #6b7280; margin-top: 4px; font-weight: 600; text-transform: uppercase;">ELO Rating</div>
                                    </div>
                                </div>
                            </td>
                            
                            <td style="width: 20%; text-align: center; vertical-align: middle;">
                                <span style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); border-radius: 24px; font-weight: 800; color: white; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">VS</span>
                            </td>
                            
                            <td style="width: 40%; vertical-align: top;">
                                <div style="text-align: center; padding: 16px; background: white; border-radius: 12px; border: 2px solid #e5e7eb;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 700; margin: 4px 0;">Seed #{opponentSeed}</div>
                                    <strong style="font-size: 16px; display: block; margin: 12px 0 8px 0;">{opponentName}</strong>
                                    <div style="text-align: center; padding: 12px 8px; background: #f9fafb; border-radius: 10px; border: 2px solid #e5e7eb;">
                                        <div style="font-size: 28px; font-weight: 900; color: #7c3aed;">{opponentElo}</div>
                                        <div style="font-size: 11px; color: #6b7280; margin-top: 4px; font-weight: 600; text-transform: uppercase;">ELO Rating</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Contact Opponent -->
            <div class="section">
                <h2>Contacto de tu Oponente</h2>
                <div class="info-card" style="background: white; border: 2px solid #e5e7eb;">
                    <h3 style="margin-top: 0;">{opponentName}</h3>
                    <ul style="margin: 8px 0; list-style: none; padding-left: 0;">
                        <li style="margin-bottom: 12px;"><strong>WhatsApp:</strong> <a href="https://wa.me/{opponentWhatsApp}">{opponentWhatsAppDisplay}</a></li>
                        <li><strong>Email:</strong> <a href="mailto:{opponentEmail}">{opponentEmail}</a></li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://wa.me/{opponentWhatsApp}?text={whatsappMessage}" class="button button-secondary" style="color: white; font-size: 16px;">
                        Enviar WhatsApp
                    </a>
                </div>
            </div>

            <!-- What's at Stake -->
            <div class="section">
                <h2>Lo Que Está en Juego</h2>
                <div class="prize-info">
                    <h3 style="margin-top: 0; font-size: 20px; color: #7c3aed; font-weight: 800;">
                        El Campeón se lleva:
                    </h3>
                    <ul style="text-align: left; display: inline-block; margin: 16px auto; list-style: none; padding-left: 0;">
                        <li style="font-size: 15px; margin: 10px 0;">Título de Campeón de {leagueName}</li>
                        <li style="font-size: 15px; margin: 10px 0;">Reconocimiento permanente</li>
                        <li style="font-size: 15px; margin: 10px 0;">Tu nombre en el Salón de la Fama</li>
                        <li style="font-size: 15px; margin: 10px 0;">Badge de Campeón en tu perfil</li>
                    </ul>
                </div>
            </div>

            <!-- Important Info -->
            <div class="section">
                <h2>Información de la Final</h2>
                <div class="info-card">
                    <ul style="margin: 8px 0;">
                        <li><strong>Formato:</strong> Mejor de 3 sets (con super tie-break en el 3er set si es necesario)</li>
                        <li><strong>Plazo:</strong> Recomendamos jugar dentro de 1 semana</li>
                        <li><strong>Fair Play:</strong> Recuerda que es un partido amistoso pero competitivo</li>
                        <li><strong>Resultado:</strong> Envía el resultado inmediatamente después del partido</li>
                        <li><strong>Certificado:</strong> El ganador recibirá un certificado digital de campeón</li>
                    </ul>
                </div>
            </div>

            <!-- Motivational Quote -->
            <div class="motivational-quote">
                <p style="margin: 0; font-size: 20px; font-weight: 600; font-style: italic;">
                    "Los campeones se hacen cuando nadie está mirando"
                </p>
                <p style="margin: 12px 0 0 0; font-size: 15px; opacity: 0.9;">
                    Has demostrado tu talento durante toda la temporada.<br>
                    Ahora es el momento de coronarte como campeón.
                </p>
            </div>

            <!-- Call to Action -->
            <div class="section" style="text-align: center; margin-top: 32px;">
                <a href="{dashboardUrl}" class="button" style="color: white; font-size: 16px;">
                    Ver Mi Dashboard
                </a>
                <a href="{bracketUrl}" class="button button-champion" style="color: white;">
                    Ver Cuadro de Playoffs
                </a>
            </div>

            <!-- Celebration Banner -->
            <div class="celebration-banner">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; color: white;">Este es tu momento</h2>
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.95);">
                    Todo el esfuerzo de la temporada ha llevado a este momento.<br>
                    Ve y trae ese trofeo a casa.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 600;">
                Suerte en la Final
            </p>
            <p style="margin: 0 0 16px 0;"><strong>Equipo Tenis del Parque</strong></p>
            <hr style="margin: 16px auto; width: 60px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Este email fue enviado porque llegaste a la final de {leagueName}.<br>
                Si tienes alguna pregunta, contacta con <a href="mailto:info@tenisdp.es">info@tenisdp.es</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  },

  en: {
    subject: 'Finalist - One match away from the championship | {leagueName}',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're a Finalist</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 3px solid #7c3aed; overflow: hidden; }
        .header { background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa); color: white; padding: 40px 32px; text-align: center; position: relative; overflow: hidden; border-radius: 16px 16px 0 0; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 700; background: rgba(255,255,255,0.95); color: #7c3aed; border: 2px solid white; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .final-match-card { background: linear-gradient(135deg, #ffffff, #ede9fe); border: 3px solid #7c3aed; padding: 24px; border-radius: 16px; margin: 20px 0; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15); }
        .button { display: inline-block; background-color: #7c3aed; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; margin: 8px 4px; font-weight: 600; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button-champion { background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa); font-size: 18px; }
        .button-secondary { background-color: #10b981; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; }
        h1 { margin: 0 0 12px 0; font-size: 36px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 8px 0; }
        .trophy-showcase { text-align: center; padding: 28px 20px; background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-radius: 16px; margin: 24px 0; border: 2px solid #7c3aed; }
        .journey-timeline { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #7c3aed; margin: 20px 0; }
        .timeline-item { margin: 16px 0; padding-left: 24px; position: relative; }
        .timeline-item::before { content: ''; position: absolute; left: 0; top: 6px; background: #10b981; width: 10px; height: 10px; border-radius: 50%; }
        .timeline-item.final::before { background: #7c3aed; width: 12px; height: 12px; top: 5px; }
        .motivational-quote { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2); }
        .prize-info { background: linear-gradient(135deg, #ede9fe, #ddd6fe); padding: 24px; border-radius: 12px; border: 2px solid #7c3aed; margin: 24px 0; text-align: center; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #7c3aed; }
        .celebration-banner { background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="status-badge">
                FINALIST
            </div>
            <h1>Congratulations {playerName}</h1>
            <p style="margin: 12px 0; font-size: 22px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                You're One Match Away from the Championship
            </p>
            <p style="margin: 0; font-size: 16px; font-weight: 600; opacity: 0.95;">
                {leagueName} · Group {playoffGroup}
            </p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Trophy Showcase -->
            <div class="trophy-showcase">
                <h2 style="margin: 0 0 8px 0; color: #7c3aed;">You've Reached the Final</h2>
                <p style="margin: 0; font-size: 16px; color: #4b5563; font-weight: 500;">
                    Only 2 players remain standing. You're one of them.
                </p>
            </div>

            <!-- Your Journey -->
            <div class="section">
                <h2>Your Journey So Far</h2>
                <div class="journey-timeline">
                    <div class="timeline-item">
                        <strong>Regular Season:</strong> Position #{regularSeasonPosition} with {regularSeasonPoints} points
                    </div>
                    <div class="timeline-item">
                        <strong>Quarterfinals:</strong> Victory over {quarterfinalOpponent}
                    </div>
                    <div class="timeline-item">
                        <strong>Semifinals:</strong> Victory over {semifinalOpponent}
                    </div>
                    <div class="timeline-item final">
                        <strong style="color: #7c3aed;">FINAL:</strong> The decisive match
                    </div>
                </div>
            </div>

            <!-- The Final Match -->
            <div class="section">
                <h2>The Grand Final</h2>
                <div class="final-match-card">
                    <h3 style="text-align: center; font-size: 20px; color: #7c3aed; font-weight: 800; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 1px;">
                        For the Championship
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        <tr>
                            <td style="width: 40%; vertical-align: top;">
                                <div style="text-align: center; padding: 16px; background: white; border-radius: 12px; border: 2px solid #e5e7eb;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 700; margin: 4px 0;">Seed #{playerSeed}</div>
                                    <strong style="font-size: 16px; display: block; margin: 12px 0 8px 0;">{playerName}</strong>
                                    <div style="text-align: center; padding: 12px 8px; background: #f9fafb; border-radius: 10px; border: 2px solid #e5e7eb;">
                                        <div style="font-size: 28px; font-weight: 900; color: #7c3aed;">{playerElo}</div>
                                        <div style="font-size: 11px; color: #6b7280; margin-top: 4px; font-weight: 600; text-transform: uppercase;">ELO Rating</div>
                                    </div>
                                </div>
                            </td>
                            
                            <td style="width: 20%; text-align: center; vertical-align: middle;">
                                <span style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); border-radius: 24px; font-weight: 800; color: white; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">VS</span>
                            </td>
                            
                            <td style="width: 40%; vertical-align: top;">
                                <div style="text-align: center; padding: 16px; background: white; border-radius: 12px; border: 2px solid #e5e7eb;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 700; margin: 4px 0;">Seed #{opponentSeed}</div>
                                    <strong style="font-size: 16px; display: block; margin: 12px 0 8px 0;">{opponentName}</strong>
                                    <div style="text-align: center; padding: 12px 8px; background: #f9fafb; border-radius: 10px; border: 2px solid #e5e7eb;">
                                        <div style="font-size: 28px; font-weight: 900; color: #7c3aed;">{opponentElo}</div>
                                        <div style="font-size: 11px; color: #6b7280; margin-top: 4px; font-weight: 600; text-transform: uppercase;">ELO Rating</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Contact Opponent -->
            <div class="section">
                <h2>Your Opponent's Contact</h2>
                <div class="info-card" style="background: white; border: 2px solid #e5e7eb;">
                    <h3 style="margin-top: 0;">{opponentName}</h3>
                    <ul style="margin: 8px 0; list-style: none; padding-left: 0;">
                        <li style="margin-bottom: 12px;"><strong>WhatsApp:</strong> <a href="https://wa.me/{opponentWhatsApp}">{opponentWhatsAppDisplay}</a></li>
                        <li><strong>Email:</strong> <a href="mailto:{opponentEmail}">{opponentEmail}</a></li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://wa.me/{opponentWhatsApp}?text={whatsappMessage}" class="button button-secondary" style="color: white; font-size: 16px;">
                        Send WhatsApp
                    </a>
                </div>
            </div>

            <!-- What's at Stake -->
            <div class="section">
                <h2>What's at Stake</h2>
                <div class="prize-info">
                    <h3 style="margin-top: 0; font-size: 20px; color: #7c3aed; font-weight: 800;">
                        The Champion Takes:
                    </h3>
                    <ul style="text-align: left; display: inline-block; margin: 16px auto; list-style: none; padding-left: 0;">
                        <li style="font-size: 15px; margin: 10px 0;">Champion Title of {leagueName}</li>
                        <li style="font-size: 15px; margin: 10px 0;">Permanent recognition</li>
                        <li style="font-size: 15px; margin: 10px 0;">Your name in the Hall of Fame</li>
                        <li style="font-size: 15px; margin: 10px 0;">Champion Badge on your profile</li>
                    </ul>
                </div>
            </div>

            <!-- Important Info -->
            <div class="section">
                <h2>Final Information</h2>
                <div class="info-card">
                    <ul style="margin: 8px 0;">
                        <li><strong>Format:</strong> Best of 3 sets (with super tie-break as a 3rd set if needed)</li>
                        <li><strong>Deadline:</strong> We recommend playing within 1 week</li>
                        <li><strong>Fair Play:</strong> Remember it's a friendly but competitive match</li>
                        <li><strong>Result:</strong> Submit the result immediately after the match</li>
                        <li><strong>Certificate:</strong> Winner will receive a digital championship certificate</li>
                    </ul>
                </div>
            </div>

            <!-- Motivational Quote -->
            <div class="motivational-quote">
                <p style="margin: 0; font-size: 20px; font-weight: 600; font-style: italic;">
                    "Champions are made when nobody is watching"
                </p>
                <p style="margin: 12px 0 0 0; font-size: 15px; opacity: 0.9;">
                    You've proven your talent throughout the season.<br>
                    Now it's time to crown yourself as champion.
                </p>
            </div>

            <!-- Call to Action -->
            <div class="section" style="text-align: center; margin-top: 32px;">
                <a href="{dashboardUrl}" class="button" style="color: white; font-size: 16px;">
                    View My Dashboard
                </a>
                <a href="{bracketUrl}" class="button button-champion" style="color: white;">
                    View Playoff Bracket
                </a>
            </div>

            <!-- Celebration Banner -->
            <div class="celebration-banner">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; color: white;">This is Your Moment</h2>
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.95);">
                    All the effort of the season has led to this moment.<br>
                    Go and bring that trophy home.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 600;">
                Good luck in the Final
            </p>
            <p style="margin: 0 0 16px 0;"><strong>Tenis del Parque Team</strong></p>
            <hr style="margin: 16px auto; width: 60px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This email was sent because you reached the final of {leagueName}.<br>
                If you have any questions, contact <a href="mailto:info@tenisdp.es">info@tenisdp.es</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
  }
}

// Email generation function
export function generateFinalistEmail(data) {
  const {
    playerName,
    playerEmail,
    language = 'es',
    leagueName,
    playoffGroup,
    playerSeed,
    opponentSeed,
    opponentName,
    opponentEmail,
    opponentWhatsApp,
    regularSeasonPosition,
    regularSeasonPoints,
    quarterfinalOpponent,
    semifinalOpponent,
    playerWins = 2, // They won QF and SF
    opponentWins = 2,
    playerElo,
    opponentElo,
    bracketUrl,
    dashboardUrl
  } = data

  const template = finalistEmailTemplate[language]
  
  // Format WhatsApp number
  const opponentWhatsAppClean = opponentWhatsApp ? opponentWhatsApp.replace(/\D/g, '') : ''
  const opponentWhatsAppDisplay = opponentWhatsApp || 'N/A'
  
  // Create WhatsApp message
  const whatsappMessage = language === 'es' 
    ? `Hola ${opponentName}, nos vemos en la FINAL. Ha sido un gran torneo hasta ahora. ¿Cuándo podemos jugar el partido decisivo? ¡Que gane el mejor!`
    : `Hi ${opponentName}, see you in the FINAL. It's been a great tournament so far. When can we play the deciding match? May the best player win!`
  
  // Replace all placeholders in the template
  let emailHtml = template.html
  let emailSubject = template.subject

  const replacements = {
    '{playerName}': playerName,
    '{playerEmail}': playerEmail,
    '{leagueName}': leagueName,
    '{playoffGroup}': playoffGroup,
    '{playerSeed}': playerSeed,
    '{opponentSeed}': opponentSeed,
    '{opponentName}': opponentName,
    '{opponentEmail}': opponentEmail,
    '{opponentWhatsApp}': opponentWhatsAppClean,
    '{opponentWhatsAppDisplay}': opponentWhatsAppDisplay,
    '{regularSeasonPosition}': regularSeasonPosition,
    '{regularSeasonPoints}': regularSeasonPoints,
    '{quarterfinalOpponent}': quarterfinalOpponent,
    '{semifinalOpponent}': semifinalOpponent,
    '{playerWins}': playerWins,
    '{opponentWins}': opponentWins,
    '{playerElo}': playerElo,
    '{opponentElo}': opponentElo,
    '{bracketUrl}': bracketUrl,
    '{dashboardUrl}': dashboardUrl,
    '{whatsappMessage}': encodeURIComponent(whatsappMessage)
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    emailHtml = emailHtml.replace(regex, value !== undefined && value !== null ? String(value) : '')
    emailSubject = emailSubject.replace(regex, value !== undefined && value !== null ? String(value) : '')
  })

  return {
    subject: emailSubject,
    html: emailHtml,
    text: emailSubject + '\n\n' + whatsappMessage
  }
}
