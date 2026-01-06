// Welcome Email Template for Tennis League Registration
// Updated to match modern success page design
// File: lib/email/templates/welcomeEmail.js

export const welcomeEmailTemplate = {
  es: {
    subject: 'Bienvenido a {leagueName} - Información importante',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a {leagueName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 32px; text-align: center; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 20px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .icon-box { width: 40px; height: 40px; background: #d1fae5; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; }
        .button { display: inline-block; background-color: #059669; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 8px 4px; font-weight: 500; text-align: center; }
        .button-secondary { background-color: #10b981; }
        .button-dark { background-color: #1f2937; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .timeline { position: relative; padding-left: 32px; }
        .timeline-item { position: relative; padding-bottom: 24px; }
        .timeline-item::before { content: ''; position: absolute; left: -27px; top: 8px; width: 10px; height: 10px; background: #059669; border-radius: 50%; }
        .timeline-item::after { content: ''; position: absolute; left: -22px; top: 18px; width: 1px; height: calc(100% - 10px); background: #e5e7eb; }
        .timeline-item:last-child::after { display: none; }
        .timeline-item.inactive::before { background: #e5e7eb; }
        .highlight-box { background: linear-gradient(135deg, #f3f4f6, #fafafa); padding: 20px; border-radius: 12px; border-left: 4px solid #059669; margin: 20px 0; }
        .quote-box { background: linear-gradient(135deg, #ecfdf5, #f0fdf4); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid #a7f3d0; }
        .quote-text { font-size: 18px; font-style: italic; color: #065f46; margin: 0 0 8px 0; }
        .quote-author { font-size: 14px; color: #059669; margin: 0; }
        .feature-grid { display: flex; gap: 12px; margin: 16px 0; }
        .feature-item { flex: 1; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .structure-grid { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
        .structure-item { flex: 1; min-width: 80px; background: #f0fdf4; padding: 12px 8px; border-radius: 8px; text-align: center; border: 1px solid #a7f3d0; }
        .structure-number { font-size: 24px; font-weight: 700; color: #059669; }
        .structure-label { font-size: 11px; color: #065f46; margin-top: 4px; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="status-badge">
                {statusBadge}
            </div>
            <h1>¡Bienvenido {playerName}!</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.95;">Te has registrado exitosamente para</p>
            <p style="margin: 8px 0 0 0; font-size: 22px; font-weight: 600;">{leagueName}</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Registration Summary -->
            <div class="section">
                <h2>📋 Resumen de tu registro</h2>
                <div class="info-card">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #6b7280;">Nombre:</td><td style="padding: 8px 0; font-weight: 600;">{playerName}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Nivel:</td><td style="padding: 8px 0; font-weight: 600;">{playerLevel}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; font-weight: 600;">{playerEmail}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; font-weight: 600;">{playerWhatsApp}</td></tr>
                    </table>
                </div>
            </div>

            <!-- League Structure -->
            <div class="section">
                <h2>🎾 Formato de la Liga</h2>
                <div class="structure-grid">
                    <div class="structure-item">
                        <div class="structure-number">8</div>
                        <div class="structure-label">RONDAS</div>
                    </div>
                    <div class="structure-item">
                        <div class="structure-number">1</div>
                        <div class="structure-label">PARTIDO/SEMANA</div>
                    </div>
                    <div class="structure-item">
                        <div class="structure-number">~8</div>
                        <div class="structure-label">SEMANAS</div>
                    </div>
                </div>
                <div class="info-card" style="background: #f0fdf4; border-color: #a7f3d0;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                        <strong>Sistema Swiss:</strong> Cada ronda te emparejamos con un rival de nivel similar basado en tu ranking ELO. 
                        Tú y tu rival coordinan día, hora y pista que os convenga.
                    </p>
                </div>
            </div>

            <!-- Important: Play on Time -->
            <div class="section">
                <h2>⏰ Importante: Juega a Tiempo</h2>
                <div class="info-card" style="background: #fef3c7; border-color: #fbbf24;">
                    <p style="margin: 0 0 12px 0; color: #92400e;">
                        <strong>¿Por qué es importante?</strong> Nuestro sistema ELO y emparejamiento Swiss funciona mejor cuando todos jugamos nuestros partidos a tiempo. 
                        Esto asegura que siempre tengas rivales de tu nivel y que los rankings sean justos.
                    </p>
                    <p style="margin: 0; color: #92400e;">
                        <strong>🔄 Flexibilidad:</strong> Entendemos que la vida pasa. Tienes <strong>3 aplazamientos por temporada</strong> - 
                        cada uno te permite extender el plazo de tu partido por 1 semana adicional. ¡Úsalos con moderación!
                    </p>
                </div>
            </div>

            <!-- User Account Section -->
            {userAccountSection}

            <!-- Timeline -->
            <div class="section">
                <h2>📅 Calendario de la Temporada</h2>
                <div class="timeline">
                    {timelineItems}
                </div>
            </div>

            <!-- Community Section -->
            <div class="highlight-box">
                <h3 style="margin-top: 0;">🤝 ¡Invita a tus amigos!</h3>
                <p style="margin: 8px 0; color: #4b5563;">¿Conoces otros jugadores que podrían estar interesados? ¡Cuantos más seamos, mejor!</p>
                <p style="margin: 12px 0 0 0;"><strong>Comparte este enlace:</strong><br>
                <a href="{shareUrl}" style="word-break: break-all;">{shareUrl}</a></p>
            </div>

            <!-- WhatsApp Group -->
            {whatsappSection}

            <!-- Call to Action -->
            <div class="section" style="text-align: center; margin-top: 32px;">
                {ctaButtons}
            </div>

            <!-- Contact Info -->
            <div class="section">
                <h2>¿Necesitas ayuda?</h2>
                <p style="color: #6b7280; margin: 8px 0;">Si tienes cualquier pregunta, no dudes en contactarnos:</p>
                <div class="feature-grid">
                    <div class="feature-item">
                        <strong style="color: #1f2937;">Email</strong><br>
                        <a href="mailto:info@tenisdp.es">info@tenisdp.es</a>
                    </div>
                    <div class="feature-item">
                        <strong style="color: #1f2937;">WhatsApp</strong><br>
                        <a href="https://wa.me/34652714328">+34 652 714 328</a>
                    </div>
                    <div class="feature-item">
                        <strong style="color: #1f2937;">Web</strong><br>
                        <a href="https://tenisdp.es">tenisdp.es</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 600;">¡Nos vemos en las pistas! 🎾</p>
            <p style="margin: 0 0 16px 0;"><strong>Equipo Tenis del Parque</strong></p>
            <hr style="margin: 16px auto; width: 60px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Este email fue enviado porque te registraste en {leagueName}.<br>
                Si no deseas recibir más emails, <a href="{unsubscribeUrl}" style="color: #059669;">haz clic aquí</a>.
            </p>
        </div>
    </div>
</body>
</html>
    `,

    // Dynamic content templates
    statusBadge: {
      waiting: '⏳ Lista de Espera',
      active: '✅ Liga Confirmada',
      new: '🎉 Nuevo Registro'
    },

    userAccountSection: {
      noAccount: `
            <div class="info-card" style="background: #fef3c7; border-color: #fbbf24;">
                <h3 style="margin-top: 0; color: #92400e;">⚠️ Acción Requerida: Crea tu cuenta</h3>
                <p style="margin: 8px 0; color: #92400e;">Para acceder a tu dashboard personal y gestionar tus partidos, necesitas crear tu cuenta de usuario.</p>
                <p style="margin: 8px 0; color: #92400e;"><strong>Te enviaremos el enlace de activación por WhatsApp cuando la liga esté por comenzar.</strong></p>
            </div>
      `,
      hasAccount: `
            <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                <h3 style="color: #166534; margin-top: 0;">✅ Ya tienes una cuenta</h3>
                <p style="margin: 8px 0; color: #166534;">Ya tienes una cuenta de usuario activa. Puedes acceder a tu dashboard en cualquier momento.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{loginUrl}" class="button button-dark" style="color: white;">Acceder a mi cuenta</a>
                </div>
            </div>
      `,
      activationReady: `
            <div class="info-card" style="background: #fef3c7; border-color: #fbbf24;">
                <h3 style="margin-top: 0; color: #92400e;">🔐 Crea tu contraseña ahora</h3>
                <p style="margin: 8px 0; color: #92400e;">Tu cuenta está lista. Solo necesitas crear tu contraseña para acceder.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{activationLink}" class="button" style="color: white;">Crear mi contraseña</a>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #92400e;">Este enlace expira en 72 horas.</p>
            </div>
      `
    },

    timelineItems: {
      waiting: `
                    <div class="timeline-item">
                        <strong>Ahora</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">✅ Registro completado</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>Próximamente</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Formación de grupos por nivel</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🎾 Inicio de la liga - Ronda 1</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>+8 semanas</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🏆 Playoffs y Final</span>
                    </div>
      `,
      active: `
                    <div class="timeline-item">
                        <strong>Ahora</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">✅ Registro completado</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🎾 Inicio de la liga - Ronda 1</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>8 rondas</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">1 partido por semana, ~8 semanas</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>Final de temporada</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🏆 Playoffs y Final</span>
                    </div>
      `
    },

    whatsappSection: `
            <div class="section">
                <h2>💬 Grupo de WhatsApp</h2>
                <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                    <p style="margin: 0 0 12px 0;">Únete a nuestro grupo de WhatsApp para estar al día:</p>
                    <div style="text-align: center;">
                        <a href="{whatsappGroupLink}" class="button button-secondary" style="color: white;">Unirse al grupo</a>
                    </div>
                </div>
            </div>
    `
  },

  en: {
    subject: 'Welcome to {leagueName} - Important information',
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {leagueName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 32px; text-align: center; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 20px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .icon-box { width: 40px; height: 40px; background: #d1fae5; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; }
        .button { display: inline-block; background-color: #059669; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 8px 4px; font-weight: 500; text-align: center; }
        .button-secondary { background-color: #10b981; }
        .button-dark { background-color: #1f2937; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .timeline { position: relative; padding-left: 32px; }
        .timeline-item { position: relative; padding-bottom: 24px; }
        .timeline-item::before { content: ''; position: absolute; left: -27px; top: 8px; width: 10px; height: 10px; background: #059669; border-radius: 50%; }
        .timeline-item::after { content: ''; position: absolute; left: -22px; top: 18px; width: 1px; height: calc(100% - 10px); background: #e5e7eb; }
        .timeline-item:last-child::after { display: none; }
        .timeline-item.inactive::before { background: #e5e7eb; }
        .highlight-box { background: linear-gradient(135deg, #f3f4f6, #fafafa); padding: 20px; border-radius: 12px; border-left: 4px solid #059669; margin: 20px 0; }
        .quote-box { background: linear-gradient(135deg, #ecfdf5, #f0fdf4); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid #a7f3d0; }
        .quote-text { font-size: 18px; font-style: italic; color: #065f46; margin: 0 0 8px 0; }
        .quote-author { font-size: 14px; color: #059669; margin: 0; }
        .feature-grid { display: flex; gap: 12px; margin: 16px 0; }
        .feature-item { flex: 1; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .structure-grid { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
        .structure-item { flex: 1; min-width: 80px; background: #f0fdf4; padding: 12px 8px; border-radius: 8px; text-align: center; border: 1px solid #a7f3d0; }
        .structure-number { font-size: 24px; font-weight: 700; color: #059669; }
        .structure-label { font-size: 11px; color: #065f46; margin-top: 4px; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="status-badge">
                {statusBadge}
            </div>
            <h1>Welcome {playerName}!</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.95;">You have successfully registered for</p>
            <p style="margin: 8px 0 0 0; font-size: 22px; font-weight: 600;">{leagueName}</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Registration Summary -->
            <div class="section">
                <h2>📋 Registration Summary</h2>
                <div class="info-card">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #6b7280;">Name:</td><td style="padding: 8px 0; font-weight: 600;">{playerName}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Level:</td><td style="padding: 8px 0; font-weight: 600;">{playerLevel}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; font-weight: 600;">{playerEmail}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; font-weight: 600;">{playerWhatsApp}</td></tr>
                    </table>
                </div>
            </div>

            <!-- League Structure -->
            <div class="section">
                <h2>🎾 League Format</h2>
                <div class="structure-grid">
                    <div class="structure-item">
                        <div class="structure-number">8</div>
                        <div class="structure-label">ROUNDS</div>
                    </div>
                    <div class="structure-item">
                        <div class="structure-number">1</div>
                        <div class="structure-label">MATCH/WEEK</div>
                    </div>
                    <div class="structure-item">
                        <div class="structure-number">~8</div>
                        <div class="structure-label">WEEKS</div>
                    </div>
                </div>
                <div class="info-card" style="background: #f0fdf4; border-color: #a7f3d0;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                        <strong>Swiss System:</strong> Each round we pair you with a similarly-ranked opponent based on your ELO rating. 
                        You and your opponent coordinate the day, time, and court that works for both of you.
                    </p>
                </div>
            </div>

            <!-- Important: Play on Time -->
            <div class="section">
                <h2>⏰ Important: Play on Time</h2>
                <div class="info-card" style="background: #fef3c7; border-color: #fbbf24;">
                    <p style="margin: 0 0 12px 0; color: #92400e;">
                        <strong>Why does it matter?</strong> Our ELO rating and Swiss pairing system works best when everyone plays their matches on time. 
                        This ensures you always get opponents at your level and that rankings stay fair.
                    </p>
                    <p style="margin: 0; color: #92400e;">
                        <strong>🔄 Flexibility:</strong> We understand life happens. You have <strong>3 postponements per season</strong> - 
                        each one lets you extend your match deadline by 1 additional week. Use them wisely!
                    </p>
                </div>
            </div>

            <!-- User Account Section -->
            {userAccountSection}

            <!-- Timeline -->
            <div class="section">
                <h2>📅 Season Calendar</h2>
                <div class="timeline">
                    {timelineItems}
                </div>
            </div>

            <!-- Community Section -->
            <div class="highlight-box">
                <h3 style="margin-top: 0;">🤝 Invite your friends!</h3>
                <p style="margin: 8px 0; color: #4b5563;">Know other players who might be interested? The more players, the better!</p>
                <p style="margin: 12px 0 0 0;"><strong>Share this link:</strong><br>
                <a href="{shareUrl}" style="word-break: break-all;">{shareUrl}</a></p>
            </div>

            <!-- WhatsApp Group -->
            {whatsappSection}

            <!-- Call to Action -->
            <div class="section" style="text-align: center; margin-top: 32px;">
                {ctaButtons}
            </div>

            <!-- Contact Info -->
            <div class="section">
                <h2>Need help?</h2>
                <p style="color: #6b7280; margin: 8px 0;">If you have any questions, don't hesitate to contact us:</p>
                <div class="feature-grid">
                    <div class="feature-item">
                        <strong style="color: #1f2937;">Email</strong><br>
                        <a href="mailto:info@tenisdp.es">info@tenisdp.es</a>
                    </div>
                    <div class="feature-item">
                        <strong style="color: #1f2937;">WhatsApp</strong><br>
                        <a href="https://wa.me/34652714328">+34 652 714 328</a>
                    </div>
                    <div class="feature-item">
                        <strong style="color: #1f2937;">Web</strong><br>
                        <a href="https://tenisdp.es">tenisdp.es</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937; font-weight: 600;">See you on the courts! 🎾</p>
            <p style="margin: 0 0 16px 0;"><strong>Tenis del Parque Team</strong></p>
            <hr style="margin: 16px auto; width: 60px; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This email was sent because you registered for {leagueName}.<br>
                If you don't want to receive more emails, <a href="{unsubscribeUrl}" style="color: #059669;">click here</a>.
            </p>
        </div>
    </div>
</body>
</html>
    `,

    statusBadge: {
      waiting: '⏳ Waiting List',
      active: '✅ League Confirmed',
      new: '🎉 New Registration'
    },

    userAccountSection: {
      noAccount: `
            <div class="info-card" style="background: #fef3c7; border-color: #fbbf24;">
                <h3 style="margin-top: 0; color: #92400e;">⚠️ Action Required: Create your account</h3>
                <p style="margin: 8px 0; color: #92400e;">To access your personal dashboard and manage your matches, you need to create your user account.</p>
                <p style="margin: 8px 0; color: #92400e;"><strong>We'll send you the activation link via WhatsApp when the league is about to start.</strong></p>
            </div>
      `,
      hasAccount: `
            <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                <h3 style="color: #166534; margin-top: 0;">✅ You already have an account</h3>
                <p style="margin: 8px 0; color: #166534;">You already have an active user account. You can access your dashboard at any time.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{loginUrl}" class="button button-dark" style="color: white;">Access my account</a>
                </div>
            </div>
      `,
      activationReady: `
            <div class="info-card" style="background: #fef3c7; border-color: #fbbf24;">
                <h3 style="margin-top: 0; color: #92400e;">🔐 Create your password now</h3>
                <p style="margin: 8px 0; color: #92400e;">Your account is ready. You just need to create your password to access it.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{activationLink}" class="button" style="color: white;">Create my password</a>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #92400e;">This link expires in 72 hours.</p>
            </div>
      `
    },

    timelineItems: {
      waiting: `
                    <div class="timeline-item">
                        <strong>Now</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">✅ Registration completed</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>Coming Soon</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Group formation by level</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🎾 League start - Round 1</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>+8 weeks</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🏆 Playoffs & Final</span>
                    </div>
      `,
      active: `
                    <div class="timeline-item">
                        <strong>Now</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">✅ Registration completed</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🎾 League start - Round 1</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>8 rounds</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">1 match per week, ~8 weeks</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>End of season</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">🏆 Playoffs & Final</span>
                    </div>
      `
    },

    whatsappSection: `
            <div class="section">
                <h2>💬 WhatsApp Group</h2>
                <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                    <p style="margin: 0 0 12px 0;">Join our WhatsApp group to stay updated:</p>
                    <div style="text-align: center;">
                        <a href="{whatsappGroupLink}" class="button button-secondary" style="color: white;">Join group</a>
                    </div>
                </div>
            </div>
    `
  }
}

// Email generation function
export function generateWelcomeEmail(playerData, leagueData, options = {}) {
  const {
    playerName,
    playerEmail, 
    playerWhatsApp, // Fixed: capital W to match what's passed
    playerLevel,
    language = 'es',
    hasUserAccount = false,
    activationLink = null,
    isExistingPlayer = false
  } = playerData

  const {
    leagueName,
    leagueStatus,
    expectedStartDate,
    whatsappGroupLink,
    shareUrl
  } = leagueData

  const {
    unsubscribeUrl = '#',
    loginUrl = 'https://tenisdp.es/login'
  } = options

  const template = welcomeEmailTemplate[language]
  const isWaitingList = leagueStatus === 'coming_soon'

  // Determine status badge
  let statusBadge = template.statusBadge.waiting
  if (!isWaitingList) {
    statusBadge = template.statusBadge.active
  } else if (!isExistingPlayer) {
    statusBadge = template.statusBadge.new
  }

  // Generate user account section - only show if user needs to take action
  let userAccountSection = ''
  if (activationLink) {
    // User needs to create password
    userAccountSection = template.userAccountSection.activationReady
      .replace('{activationLink}', activationLink)
  }
  // If hasUserAccount is true, don't show anything - user just registered with password, they know they have an account

  // Generate timeline items
  const expectedDate = formatDate(expectedStartDate, language)
  const timelineItems = (isWaitingList 
    ? template.timelineItems.waiting 
    : template.timelineItems.active
  ).replace(/{expectedDate}/g, expectedDate)

  // Generate WhatsApp section if link available
  const whatsappSection = whatsappGroupLink 
    ? template.whatsappSection.replace('{whatsappGroupLink}', whatsappGroupLink)
    : ''

  // Generate CTA buttons
  let ctaButtons = ''
  if (activationLink) {
    ctaButtons += `
      <a href="${activationLink}" class="button" style="color: white;">
        ${language === 'es' ? '🔐 Crear mi contraseña' : '🔐 Create my password'}
      </a>
    `
  } else if (hasUserAccount) {
    ctaButtons += `
      <a href="${loginUrl}" class="button button-dark" style="color: white;">
        ${language === 'es' ? '📊 Acceder a mi cuenta' : '📊 Access my account'}
      </a>
    `
  }
  
  if (whatsappGroupLink && !ctaButtons.includes('WhatsApp')) {
    ctaButtons += `
      <a href="${whatsappGroupLink}" class="button button-secondary" style="color: white;">
        ${language === 'es' ? '💬 Unirse al grupo' : '💬 Join group'}
      </a>
    `
  }

  // Replace all placeholders in the template
  let emailHtml = template.html
  let emailSubject = template.subject

  const replacements = {
    '{playerName}': playerName || '',
    '{playerEmail}': playerEmail || '',
    '{playerWhatsApp}': playerWhatsApp || '-', // Show dash if empty
    '{playerLevel}': capitalizeFirst(playerLevel, language),
    '{leagueName}': leagueName || '',
    '{shareUrl}': shareUrl || '#',
    '{unsubscribeUrl}': unsubscribeUrl,
    '{loginUrl}': loginUrl,
    '{activationLink}': activationLink || '#',
    '{whatsappGroupLink}': whatsappGroupLink || '#',
    '{statusBadge}': statusBadge,
    '{userAccountSection}': userAccountSection,
    '{timelineItems}': timelineItems,
    '{whatsappSection}': whatsappSection,
    '{ctaButtons}': ctaButtons
  }

  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    emailHtml = emailHtml.replace(regex, value || '')
    emailSubject = emailSubject.replace(regex, value || '')
  })

  return {
    subject: emailSubject,
    html: emailHtml,
    text: htmlToText(emailHtml)
  }
}

// Utility functions
function formatDate(dateString, language = 'es') {
  if (!dateString) return language === 'es' ? 'Por determinar' : 'To be determined'
  const date = new Date(dateString)
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long'
  })
}

function capitalizeFirst(str, language = 'es') {
  if (!str) return ''
  const translations = {
    'beginner': { es: 'Principiante', en: 'Beginner' },
    'intermediate': { es: 'Intermedio', en: 'Intermediate' },
    'advanced': { es: 'Avanzado', en: 'Advanced' }
  }
  return translations[str]?.[language] || str.charAt(0).toUpperCase() + str.slice(1)
}

function htmlToText(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
