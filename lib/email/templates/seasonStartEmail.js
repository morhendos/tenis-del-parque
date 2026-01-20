// Season Start Email Template
// Professional design with platform colors (purple #563380, yellow #E6E94E)
// Sent to all active players when Round 1 begins

export const seasonStartEmailTemplate = {
  es: {
    subject: '¡Comienza la temporada! Tu primer partido te espera',
    subjectBye: '¡Comienza la temporada! Tienes BYE en la Ronda 1',
    
    // Regular match email
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Comienza la temporada!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <span style="display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Temporada {season}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">¡Comienza la competición!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">{leagueName} · {city}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px 0; font-size: 18px; color: #374151;">Hola <strong>{playerName}</strong>,</p>
                            
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">Ha llegado el momento. La temporada {season} de {leagueName} comienza oficialmente y tu primer partido ya está programado.</p>

                            <!-- Match Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #563380; border-radius: 12px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <!-- Match Header -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #e9d5ff; padding-bottom: 16px; margin-bottom: 20px;">
                                            <tr>
                                                <td width="100">
                                                    <span style="display: inline-block; background: #563380; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;">Ronda 1</span>
                                                </td>
                                                <td style="text-align: right; color: #7c3aed; font-size: 14px; font-weight: 500;">
                                                    Fecha límite para agendar: {deadline}
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- VS Section - Centered -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center">
                                                    <table role="presentation" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="text-align: center; padding: 0 24px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Tú</p>
                                                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">{playerName}</p>
                                                            </td>
                                                            <td style="padding: 0 20px; font-size: 14px; color: #9ca3af; font-weight: 500;">
                                                                vs
                                                            </td>
                                                            <td style="text-align: center; padding: 0 24px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Rival</p>
                                                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">{opponentName}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Action Buttons -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="{whatsappLink}" style="display: inline-block; background: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 6px;">Contactar por WhatsApp</a>
                                                    <a href="{dashboardLink}" style="display: inline-block; background: #ffffff; color: #563380; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid #563380; margin: 0 6px;">Ver en mi cuenta</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Próximos pasos</h3>
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; font-size: 14px;">
                                                    <span style="position: absolute; left: 0; top: 10px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; display: inline-block;"></span>
                                                    Contacta con tu rival para acordar día, hora y pista
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; font-size: 14px;">
                                                    <span style="position: absolute; left: 0; top: 10px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; display: inline-block;"></span>
                                                    Jugad el partido antes de la fecha límite
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; font-size: 14px;">
                                                    <span style="position: absolute; left: 0; top: 10px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; display: inline-block;"></span>
                                                    Registra el resultado en tu cuenta
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Remember -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Recuerda</h3>
                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Tienes <strong>3 aplazamientos</strong> disponibles esta temporada. Cada uno extiende tu fecha límite 7 días adicionales. Úsalos solo cuando sea necesario.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{dashboardLink}" style="display: inline-block; background: #563380; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Acceder a mi cuenta</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;"><strong>Tenis del Parque</strong></p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">¿Preguntas? Escríbenos por <a href="https://wa.me/34652714328" style="color: #563380;">WhatsApp</a> o visita <a href="https://tenisdp.es" style="color: #563380;">tenisdp.es</a></p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // BYE match email
    htmlBye: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Comienza la temporada!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <span style="display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Temporada {season}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">¡Comienza la competición!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">{leagueName} · {city}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px 0; font-size: 18px; color: #374151;">Hola <strong>{playerName}</strong>,</p>
                            
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">Ha llegado el momento. La temporada {season} de {leagueName} comienza oficialmente.</p>
                            
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">En esta primera ronda tienes asignado un <strong>BYE</strong>, lo que significa que avanzas automáticamente sin necesidad de jugar partido.</p>

                            <!-- BYE Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 32px; text-align: center;">
                                        <span style="display: inline-block; background: #10b981; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">Ronda 1 - BYE</span>
                                        <h2 style="margin: 16px 0 8px 0; font-size: 20px; font-weight: 600; color: #065f46;">Avance automático</h2>
                                        <p style="margin: 16px 0; font-size: 32px; font-weight: 700; color: #10b981;">+3 <span style="font-size: 16px; font-weight: 500; color: #065f46;">puntos</span></p>
                                        <p style="margin: 0; color: #047857; font-size: 14px;">Recibes los puntos equivalentes a una victoria 2-0</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Why BYE -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">¿Por qué tengo un BYE?</h3>
                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Cuando hay un número impar de jugadores en la liga, el sistema asigna un BYE a un jugador cada ronda para que todos puedan participar. Es rotativo y justo para todos.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- What's next -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">¿Qué sigue?</h3>
                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Tu próximo partido será en la <strong>Ronda 2</strong>. Te notificaremos cuando se publiquen los emparejamientos. Mientras tanto, puedes seguir la clasificación y los resultados de otros partidos desde tu cuenta.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{dashboardLink}" style="display: inline-block; background: #563380; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Ver clasificación</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;"><strong>Tenis del Parque</strong></p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">¿Preguntas? Escríbenos por <a href="https://wa.me/34652714328" style="color: #563380;">WhatsApp</a> o visita <a href="https://tenisdp.es" style="color: #563380;">tenisdp.es</a></p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
  },

  en: {
    subject: 'The season begins! Your first match awaits',
    subjectBye: 'The season begins! You have a BYE in Round 1',
    
    // Regular match email
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The season begins!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <span style="display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Season {season}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Game on!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">{leagueName} · {city}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px 0; font-size: 18px; color: #374151;">Hi <strong>{playerName}</strong>,</p>
                            
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">The moment has arrived. The {season} season of {leagueName} officially begins and your first match is ready.</p>

                            <!-- Match Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #563380; border-radius: 12px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <!-- Match Header -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #e9d5ff; padding-bottom: 16px; margin-bottom: 20px;">
                                            <tr>
                                                <td width="100">
                                                    <span style="display: inline-block; background: #563380; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;">Round 1</span>
                                                </td>
                                                <td style="text-align: right; color: #7c3aed; font-size: 14px; font-weight: 500;">
                                                    Deadline to schedule: {deadline}
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- VS Section - Centered -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center">
                                                    <table role="presentation" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="text-align: center; padding: 0 24px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">You</p>
                                                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">{playerName}</p>
                                                            </td>
                                                            <td style="padding: 0 20px; font-size: 14px; color: #9ca3af; font-weight: 500;">
                                                                vs
                                                            </td>
                                                            <td style="text-align: center; padding: 0 24px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Opponent</p>
                                                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">{opponentName}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Action Buttons -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="{whatsappLink}" style="display: inline-block; background: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 6px;">Contact via WhatsApp</a>
                                                    <a href="{dashboardLink}" style="display: inline-block; background: #ffffff; color: #563380; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid #563380; margin: 0 6px;">View in my account</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Next steps</h3>
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; font-size: 14px;">
                                                    <span style="position: absolute; left: 0; top: 10px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; display: inline-block;"></span>
                                                    Contact your opponent to agree on day, time, and court
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; font-size: 14px;">
                                                    <span style="position: absolute; left: 0; top: 10px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; display: inline-block;"></span>
                                                    Play the match before the deadline
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; padding-left: 28px; position: relative; color: #4b5563; font-size: 14px;">
                                                    <span style="position: absolute; left: 0; top: 10px; width: 16px; height: 16px; background: #E6E94E; border-radius: 50%; display: inline-block;"></span>
                                                    Record the result in your account
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Remember -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Remember</h3>
                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">You have <strong>3 postponements</strong> available this season. Each one extends your deadline by 7 additional days. Use them only when necessary.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{dashboardLink}" style="display: inline-block; background: #563380; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Access my account</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;"><strong>Tenis del Parque</strong></p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">Questions? Contact us on <a href="https://wa.me/34652714328" style="color: #563380;">WhatsApp</a> or visit <a href="https://tenisdp.es" style="color: #563380;">tenisdp.es</a></p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,

    // BYE match email
    htmlBye: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The season begins!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <span style="display: inline-block; background: #E6E94E; color: #563380; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Season {season}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 16px;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Game on!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 12px;">
                                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">{leagueName} · {city}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px 0; font-size: 18px; color: #374151;">Hi <strong>{playerName}</strong>,</p>
                            
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">The moment has arrived. The {season} season of {leagueName} officially begins.</p>
                            
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">In this first round you have been assigned a <strong>BYE</strong>, which means you advance automatically without needing to play a match.</p>

                            <!-- BYE Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 32px; text-align: center;">
                                        <span style="display: inline-block; background: #10b981; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">Round 1 - BYE</span>
                                        <h2 style="margin: 16px 0 8px 0; font-size: 20px; font-weight: 600; color: #065f46;">Automatic advance</h2>
                                        <p style="margin: 16px 0; font-size: 32px; font-weight: 700; color: #10b981;">+3 <span style="font-size: 16px; font-weight: 500; color: #065f46;">points</span></p>
                                        <p style="margin: 0; color: #047857; font-size: 14px;">You receive points equivalent to a 2-0 victory</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Why BYE -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Why do I have a BYE?</h3>
                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">When there is an odd number of players in the league, the system assigns a BYE to one player each round so everyone can participate. It rotates and is fair for all.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- What's next -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f9fafb; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">What happens next?</h3>
                                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Your next match will be in <strong>Round 2</strong>. We will notify you when the pairings are published. Meanwhile, you can follow the standings and other match results from your account.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{dashboardLink}" style="display: inline-block; background: #563380; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">View standings</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px;"><strong>Tenis del Parque</strong></p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">Questions? Contact us on <a href="https://wa.me/34652714328" style="color: #563380;">WhatsApp</a> or visit <a href="https://tenisdp.es" style="color: #563380;">tenisdp.es</a></p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
  }
}

/**
 * Generate season start email for a player
 * @param {Object} data - Email data
 * @returns {Object} - { subject, html, text }
 */
export function generateSeasonStartEmail(data) {
  const {
    playerName,
    playerEmail,
    opponentName,
    opponentWhatsApp,
    leagueName,
    city,
    season,
    deadline,
    isBye = false,
    language = 'es'
  } = data

  const template = seasonStartEmailTemplate[language]
  const dashboardLink = 'https://tenisdp.es/login'
  
  // Generate WhatsApp link for opponent
  let whatsappLink = '#'
  if (opponentWhatsApp) {
    let cleaned = opponentWhatsApp.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2)
    }
    const message = language === 'es'
      ? `Hola ${opponentName}! Soy ${playerName} de la liga TDP. ¿Cuándo te viene bien para jugar nuestro partido de la Ronda 1?`
      : `Hi ${opponentName}! I'm ${playerName} from the TDP league. When would be a good time to play our Round 1 match?`
    whatsappLink = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
  }

  // Format deadline date
  const formattedDeadline = formatDeadline(deadline, language)

  // Select appropriate template (regular or BYE)
  const subject = isBye ? template.subjectBye : template.subject
  let html = isBye ? template.htmlBye : template.html

  // Replace placeholders
  const replacements = {
    '{playerName}': playerName,
    '{opponentName}': opponentName || '',
    '{leagueName}': leagueName,
    '{city}': city || '',
    '{season}': formatSeason(season, language),
    '{deadline}': formattedDeadline,
    '{whatsappLink}': whatsappLink,
    '{dashboardLink}': dashboardLink
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    html = html.replace(regex, value || '')
  })

  return {
    subject,
    html,
    text: htmlToText(html)
  }
}

// Utility functions
function formatDeadline(dateString, language) {
  if (!dateString) return language === 'es' ? '7 días' : '7 days'
  const date = new Date(dateString)
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function formatSeason(season, language) {
  if (!season) return ''
  // Convert "winter-2026" to "Winter 2026" or "Invierno 2026"
  const [type, year] = season.split('-')
  const seasonNames = {
    winter: { es: 'Invierno', en: 'Winter' },
    spring: { es: 'Primavera', en: 'Spring' },
    summer: { es: 'Verano', en: 'Summer' },
    fall: { es: 'Otoño', en: 'Fall' },
    autumn: { es: 'Otoño', en: 'Autumn' }
  }
  const seasonName = seasonNames[type]?.[language] || type
  return `${seasonName} ${year}`
}

function htmlToText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
