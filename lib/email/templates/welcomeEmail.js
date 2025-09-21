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
        .header { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 32px; text-align: center; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 20px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .icon-box { width: 40px; height: 40px; background: #ede9fe; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; }
        .button { display: inline-block; background-color: #7c3aed; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 8px 4px; font-weight: 500; text-align: center; }
        .button-secondary { background-color: #10b981; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .timeline { position: relative; padding-left: 32px; }
        .timeline-item { position: relative; padding-bottom: 24px; }
        .timeline-item::before { content: ''; position: absolute; left: -27px; top: 8px; width: 10px; height: 10px; background: #7c3aed; border-radius: 50%; }
        .timeline-item::after { content: ''; position: absolute; left: -22px; top: 18px; width: 1px; height: calc(100% - 10px); background: #e5e7eb; }
        .timeline-item:last-child::after { display: none; }
        .timeline-item.inactive::before { background: #e5e7eb; }
        .highlight-box { background: linear-gradient(135deg, #f3f4f6, #fafafa); padding: 20px; border-radius: 12px; border-left: 4px solid #7c3aed; margin: 20px 0; }
        .feature-grid { display: flex; gap: 12px; margin: 16px 0; }
        .feature-item { flex: 1; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #7c3aed; }
        .warning-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 8px; margin: 20px 0; color: #92400e; }
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
                        <tr><td style="padding: 4px 0; color: #6b7280;">Nombre:</td><td style="padding: 4px 0; font-weight: 600;">{playerName}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Nivel:</td><td style="padding: 4px 0; font-weight: 600;">{playerLevel}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Email:</td><td style="padding: 4px 0; font-weight: 600;">{playerEmail}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 4px 0; font-weight: 600;">{playerWhatsApp}</td></tr>
                    </table>
                </div>
            </div>

            <!-- User Account Section -->
            {userAccountSection}

            <!-- What Happens Next -->
            <div class="section">
                <h2>🎯 Próximos pasos</h2>
                {nextStepsContent}
            </div>

            <!-- Timeline -->
            <div class="section">
                <h2>📅 Timeline</h2>
                <div class="timeline">
                    {timelineItems}
                </div>
            </div>

            <!-- Community Section -->
            <div class="highlight-box">
                <h3 style="margin-top: 0;">🤝 ¡Invita a tus amigos!</h3>
                <p style="margin: 8px 0; color: #4b5563;">¿Conoces otros jugadores que podrían estar interesados? ¡La liga será más divertida con más gente!</p>
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
                Si no deseas recibir más emails, <a href="{unsubscribeUrl}" style="color: #7c3aed;">haz clic aquí</a>.
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
            <div class="warning-box">
                <h3 style="margin-top: 0;">⚠️ Acción Requerida: Crea tu cuenta</h3>
                <p style="margin: 8px 0;">Para acceder a tu dashboard personal y gestionar tus partidos, necesitas crear tu cuenta de usuario.</p>
                <p style="margin: 8px 0;"><strong>Te enviaremos el enlace de activación por WhatsApp cuando la liga esté por comenzar.</strong></p>
            </div>
      `,
      hasAccount: `
            <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                <h3 style="color: #166534;">✅ Ya tienes una cuenta</h3>
                <p style="margin: 8px 0; color: #166534;">Ya tienes una cuenta de usuario activa. Puedes acceder a tu dashboard en cualquier momento.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{loginUrl}" class="button button-secondary" style="color: white;">Acceder a mi cuenta</a>
                </div>
            </div>
      `,
      activationReady: `
            <div class="warning-box">
                <h3 style="margin-top: 0;">🔐 Crea tu contraseña ahora</h3>
                <p style="margin: 8px 0;">Tu cuenta está lista. Solo necesitas crear tu contraseña para acceder.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{activationLink}" class="button" style="color: white;">Crear mi contraseña</a>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #92400e;">Este enlace expira en 72 horas.</p>
            </div>
      `
    },

    nextStepsContent: {
      waiting: `
                <div class="info-card">
                    <p style="margin: 0 0 12px 0;"><strong>Estás en la lista de espera.</strong> Esto es lo que sucederá:</p>
                    <ul style="margin: 0;">
                        <li>Estamos reuniendo jugadores de tu nivel</li>
                        <li>Te contactaremos cuando tengamos suficientes jugadores</li>
                        <li>Recibirás tu enlace de activación por WhatsApp</li>
                        <li>Podrás programar tus primeros partidos</li>
                    </ul>
                </div>
      `,
      active: `
                <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                    <p style="margin: 0 0 12px 0; color: #166534;"><strong>¡Tu liga está confirmada!</strong> Prepárate para:</p>
                    <ul style="margin: 0;">
                        <li>Acceder a tu dashboard personal</li>
                        <li>Ver tu ranking y estadísticas</li>
                        <li>Programar tus partidos</li>
                        <li>Conectar con otros jugadores</li>
                    </ul>
                </div>
      `
    },

    timelineItems: {
      waiting: `
                    <div class="timeline-item">
                        <strong>Ahora</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Registro completado</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>Próximamente</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Formación de grupos</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Inicio de liga</span>
                    </div>
      `,
      active: `
                    <div class="timeline-item">
                        <strong>Ahora</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Registro completado</span>
                    </div>
                    <div class="timeline-item">
                        <strong>24-48 horas</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Enlace de activación por WhatsApp</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Primeros partidos</span>
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
        .header { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 32px; text-align: center; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); margin-bottom: 20px; }
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .info-card { background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .icon-box { width: 40px; height: 40px; background: #ede9fe; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; }
        .button { display: inline-block; background-color: #7c3aed; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; margin: 8px 4px; font-weight: 500; text-align: center; }
        .button-secondary { background-color: #10b981; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        h1 { margin: 0 0 8px 0; font-size: 32px; font-weight: 700; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; }
        h3 { color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .timeline { position: relative; padding-left: 32px; }
        .timeline-item { position: relative; padding-bottom: 24px; }
        .timeline-item::before { content: ''; position: absolute; left: -27px; top: 8px; width: 10px; height: 10px; background: #7c3aed; border-radius: 50%; }
        .timeline-item::after { content: ''; position: absolute; left: -22px; top: 18px; width: 1px; height: calc(100% - 10px); background: #e5e7eb; }
        .timeline-item:last-child::after { display: none; }
        .timeline-item.inactive::before { background: #e5e7eb; }
        .highlight-box { background: linear-gradient(135deg, #f3f4f6, #fafafa); padding: 20px; border-radius: 12px; border-left: 4px solid #7c3aed; margin: 20px 0; }
        .feature-grid { display: flex; gap: 12px; margin: 16px 0; }
        .feature-item { flex: 1; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
        ul { padding-left: 20px; margin: 12px 0; }
        li { margin-bottom: 8px; color: #4b5563; }
        a { color: #7c3aed; }
        .warning-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 8px; margin: 20px 0; color: #92400e; }
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
                        <tr><td style="padding: 4px 0; color: #6b7280;">Name:</td><td style="padding: 4px 0; font-weight: 600;">{playerName}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Level:</td><td style="padding: 4px 0; font-weight: 600;">{playerLevel}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Email:</td><td style="padding: 4px 0; font-weight: 600;">{playerEmail}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 4px 0; font-weight: 600;">{playerWhatsApp}</td></tr>
                    </table>
                </div>
            </div>

            <!-- User Account Section -->
            {userAccountSection}

            <!-- What Happens Next -->
            <div class="section">
                <h2>🎯 Next Steps</h2>
                {nextStepsContent}
            </div>

            <!-- Timeline -->
            <div class="section">
                <h2>📅 Timeline</h2>
                <div class="timeline">
                    {timelineItems}
                </div>
            </div>

            <!-- Community Section -->
            <div class="highlight-box">
                <h3 style="margin-top: 0;">🤝 Invite your friends!</h3>
                <p style="margin: 8px 0; color: #4b5563;">Know other players who might be interested? The league will be more fun with more people!</p>
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
                If you don't want to receive more emails, <a href="{unsubscribeUrl}" style="color: #7c3aed;">click here</a>.
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
            <div class="warning-box">
                <h3 style="margin-top: 0;">⚠️ Action Required: Create your account</h3>
                <p style="margin: 8px 0;">To access your personal dashboard and manage your matches, you need to create your user account.</p>
                <p style="margin: 8px 0;"><strong>We'll send you the activation link via WhatsApp when the league is about to start.</strong></p>
            </div>
      `,
      hasAccount: `
            <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                <h3 style="color: #166534;">✅ You already have an account</h3>
                <p style="margin: 8px 0; color: #166534;">You already have an active user account. You can access your dashboard at any time.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{loginUrl}" class="button button-secondary" style="color: white;">Access my account</a>
                </div>
            </div>
      `,
      activationReady: `
            <div class="warning-box">
                <h3 style="margin-top: 0;">🔐 Create your password now</h3>
                <p style="margin: 8px 0;">Your account is ready. You just need to create your password to access it.</p>
                <div style="text-align: center; margin-top: 16px;">
                    <a href="{activationLink}" class="button" style="color: white;">Create my password</a>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #92400e;">This link expires in 72 hours.</p>
            </div>
      `
    },

    nextStepsContent: {
      waiting: `
                <div class="info-card">
                    <p style="margin: 0 0 12px 0;"><strong>You're on the waiting list.</strong> Here's what will happen:</p>
                    <ul style="margin: 0;">
                        <li>We're gathering players at your level</li>
                        <li>We'll contact you when we have enough players</li>
                        <li>You'll receive your activation link via WhatsApp</li>
                        <li>You'll be able to schedule your first matches</li>
                    </ul>
                </div>
      `,
      active: `
                <div class="info-card" style="background: #f0fdf4; border-color: #86efac;">
                    <p style="margin: 0 0 12px 0; color: #166534;"><strong>Your league is confirmed!</strong> Get ready to:</p>
                    <ul style="margin: 0;">
                        <li>Access your personal dashboard</li>
                        <li>View your ranking and stats</li>
                        <li>Schedule your matches</li>
                        <li>Connect with other players</li>
                    </ul>
                </div>
      `
    },

    timelineItems: {
      waiting: `
                    <div class="timeline-item">
                        <strong>Now</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Registration completed</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>Coming Soon</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Group formation</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">League start</span>
                    </div>
      `,
      active: `
                    <div class="timeline-item">
                        <strong>Now</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Registration completed</span>
                    </div>
                    <div class="timeline-item">
                        <strong>24-48 hours</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">Activation link via WhatsApp</span>
                    </div>
                    <div class="timeline-item inactive">
                        <strong>{expectedDate}</strong><br>
                        <span style="color: #6b7280; font-size: 14px;">First matches</span>
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
    playerWhatsapp,
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

  // Generate user account section
  let userAccountSection = ''
  if (activationLink) {
    userAccountSection = template.userAccountSection.activationReady
      .replace('{activationLink}', activationLink)
  } else if (hasUserAccount) {
    userAccountSection = template.userAccountSection.hasAccount
      .replace('{loginUrl}', loginUrl)
  } else {
    userAccountSection = template.userAccountSection.noAccount
  }

  // Generate next steps content
  const nextStepsContent = isWaitingList 
    ? template.nextStepsContent.waiting 
    : template.nextStepsContent.active

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
      <a href="${loginUrl}" class="button" style="color: white;">
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
    '{playerName}': playerName,
    '{playerEmail}': playerEmail,
    '{playerWhatsApp}': playerWhatsapp,
    '{playerLevel}': capitalizeFirst(playerLevel),
    '{leagueName}': leagueName,
    '{shareUrl}': shareUrl || '#',
    '{unsubscribeUrl}': unsubscribeUrl,
    '{loginUrl}': loginUrl,
    '{activationLink}': activationLink || '#',
    '{whatsappGroupLink}': whatsappGroupLink || '#',
    '{statusBadge}': statusBadge,
    '{userAccountSection}': userAccountSection,
    '{nextStepsContent}': nextStepsContent,
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

function capitalizeFirst(str) {
  if (!str) return ''
  const translations = {
    'beginner': { es: 'Principiante', en: 'Beginner' },
    'intermediate': { es: 'Intermedio', en: 'Intermediate' },
    'advanced': { es: 'Avanzado', en: 'Advanced' }
  }
  return translations[str]?.es || str.charAt(0).toUpperCase() + str.slice(1)
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
