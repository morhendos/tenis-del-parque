/**
 * Legal pages content - bilingual (ES/EN)
 * 
 * Pages: Aviso Legal, Política de Privacidad, Política de Cookies, Términos y Condiciones
 * 
 * IMPORTANT: Update placeholder values marked with [TODO] before going live:
 * - Business name and NIF when registered as autónomo
 * - Physical address
 * - Any additional third-party services added
 */

export const legalContent = {
  es: {
    // ============================================================
    // AVISO LEGAL (Legal Notice) - LSSI-CE Article 10 compliance
    // ============================================================
    avisoLegal: {
      title: 'Aviso Legal',
      lastUpdated: 'Última actualización: febrero 2025',
      sections: [
        {
          id: 'titular',
          title: '1. Identificación del titular',
          content: `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que el titular de este sitio web es:

• **Titular:** Tomasz Mikolajewicz
• **NIF:** [Se actualizará tras el registro como autónomo]
• **Domicilio:** [Se actualizará tras el registro como autónomo]
• **Email:** info@tenisdp.es
• **Dominio principal:** https://www.tenisdp.es`
        },
        {
          id: 'objeto',
          title: '2. Objeto y ámbito',
          content: `Este Aviso Legal regula el acceso, navegación y uso del sitio web **tenisdp.es** (en adelante, la "Web"), así como los contenidos, funcionalidades y servicios de contratación online de inscripciones a ligas y competiciones de tenis amateur promovidas por Tenis del Parque.`
        },
        {
          id: 'usuario',
          title: '3. Condición de usuario',
          content: `La navegación y/o uso de la Web atribuye la condición de **Usuario** e implica la aceptación plena de este Aviso Legal. Si no está de acuerdo, debe abstenerse de usar la Web.

En caso de menores de edad, se entenderá que acceden con autorización y bajo la responsabilidad de sus padres, tutores o representantes legales.`
        },
        {
          id: 'reglas-uso',
          title: '4. Reglas de uso',
          content: `El Usuario se compromete a utilizar la Web de forma diligente, lícita y conforme a la normativa aplicable, la moral, el orden público y las buenas costumbres. Queda prohibido:

• Introducir o difundir virus, malware o cualquier software que afecte al funcionamiento de la Web.
• Intentar acceder a áreas restringidas o a datos de terceros sin autorización.
• Usar la Web con fines fraudulentos o que perjudiquen derechos del titular o de terceros.
• Suplantar la identidad de otro jugador o manipular resultados de partidos.`
        },
        {
          id: 'contratacion',
          title: '5. Contratación electrónica de inscripciones',
          content: `La Web ofrece la contratación online de inscripciones a ligas de tenis amateur. Antes de finalizar la compra se mostrará el precio total e impuestos aplicables. El pago se realiza mediante pasarela segura y el Usuario recibirá confirmación por email.

Las condiciones específicas de contratación (política de cancelaciones, calendario, niveles, normas de la liga, etc.) se detallan en la página de inscripción y en los Términos y Condiciones de Venta disponibles en esta Web.`
        },
        {
          id: 'propiedad',
          title: '6. Propiedad intelectual e industrial',
          content: `El diseño, logotipos, marcas, nombre comercial, código, textos, imágenes, vídeos y demás elementos de la Web están protegidos por derechos de propiedad intelectual e industrial titularidad de Tenis del Parque o de terceros licenciantes. Queda prohibida su reproducción, distribución, comunicación pública, transformación o cualquier uso no autorizado.`
        },
        {
          id: 'enlaces',
          title: '7. Enlaces',
          content: `La Web puede incluir enlaces a sitios de terceros. El titular no se responsabiliza de los contenidos o prácticas de privacidad de dichos sitios. La inclusión de enlaces no implica relación, recomendación o aprobación.`
        },
        {
          id: 'responsabilidad',
          title: '8. Responsabilidad',
          content: `El titular no garantiza la disponibilidad ininterrumpida de la Web ni la ausencia absoluta de errores, si bien adoptará las medidas razonables para su corrección. No se hace responsable de daños derivados de fallos de red, interrupciones, virus, ataques u otros hechos ajenos a su control.`
        },
        {
          id: 'datos-cookies',
          title: '9. Protección de datos y cookies',
          content: `El tratamiento de datos personales del Usuario se rige por la [Política de Privacidad](/es/politica-privacidad) y el uso de cookies por la [Política de Cookies](/es/politica-cookies).`
        },
        {
          id: 'legislacion',
          title: '10. Legislación y jurisdicción',
          content: `Este Aviso Legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales competentes según la normativa vigente.

Plataforma europea de resolución de litigios en línea (ODR): [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)`
        }
      ]
    },

    // ============================================================
    // POLÍTICA DE PRIVACIDAD (Privacy Policy) - GDPR/LOPDGDD
    // ============================================================
    privacidad: {
      title: 'Política de Privacidad',
      lastUpdated: 'Última actualización: febrero 2025',
      sections: [
        {
          id: 'responsable',
          title: '1. Responsable del tratamiento',
          content: `• **Responsable:** Tomasz Mikolajewicz
• **Email de contacto:** info@tenisdp.es
• **Sitio web:** https://www.tenisdp.es`
        },
        {
          id: 'datos-recogidos',
          title: '2. Datos que recogemos',
          content: `Recogemos los siguientes datos personales en función del servicio utilizado:

**Al crear una cuenta:**
• Nombre completo
• Dirección de email
• Número de teléfono (WhatsApp)
• Contraseña (almacenada de forma cifrada)
• Nivel de juego seleccionado

**Al participar en la liga:**
• Resultados de partidos
• Puntuación ELO y estadísticas de juego
• Ciudad y preferencias de liga

**Datos técnicos recogidos automáticamente:**
• Dirección IP
• Tipo de navegador y dispositivo
• Páginas visitadas y tiempo de navegación
• Cookies (ver nuestra [Política de Cookies](/es/politica-cookies))`
        },
        {
          id: 'finalidad',
          title: '3. Finalidad del tratamiento',
          content: `Utilizamos tus datos para las siguientes finalidades:

• **Gestión de la liga:** Organizar partidos, generar emparejamientos, calcular rankings ELO y mantener clasificaciones.
• **Comunicaciones:** Enviar notificaciones sobre partidos, resultados y novedades de la liga por email y WhatsApp.
• **Cuenta de usuario:** Gestionar tu registro, autenticación y perfil de jugador.
• **Mejora del servicio:** Analizar el uso de la plataforma para mejorar la experiencia del usuario.
• **Cumplimiento legal:** Cumplir con obligaciones legales y fiscales aplicables.`
        },
        {
          id: 'base-legal',
          title: '4. Base legal del tratamiento',
          content: `El tratamiento de tus datos se basa en:

• **Ejecución de contrato:** El tratamiento es necesario para gestionar tu inscripción y participación en la liga (Art. 6.1.b RGPD).
• **Consentimiento:** Para el envío de comunicaciones comerciales y el uso de cookies no esenciales (Art. 6.1.a RGPD).
• **Interés legítimo:** Para mejorar nuestros servicios y prevenir fraude (Art. 6.1.f RGPD).
• **Obligación legal:** Para cumplir con requisitos fiscales y legales (Art. 6.1.c RGPD).`
        },
        {
          id: 'destinatarios',
          title: '5. Destinatarios de los datos',
          content: `Podemos compartir datos con:

• Proveedores tecnológicos (alojamiento web, base de datos, mantenimiento y soporte técnico).
• Servicios de analítica y mejora de la experiencia de usuario.
• Pasarelas de pago y entidades financieras para procesar cobros.
• Administraciones públicas y juzgados cuando exista obligación legal.

Todos ellos actúan, en su caso, como encargados del tratamiento conforme al art. 28 RGPD, con los debidos contratos y medidas de seguridad. Cuando algún proveedor se encuentre fuera del Espacio Económico Europeo, se garantizará un nivel adecuado de protección mediante el Marco de Privacidad de Datos UE-EE.UU., cláusulas contractuales tipo u otras garantías apropiadas.

**Datos visibles para otros jugadores:**
Al participar en la liga, tu nombre, resultados de partidos, ranking ELO y estadísticas serán visibles para otros usuarios de la plataforma. Esta es una parte esencial del funcionamiento de la liga.

No vendemos ni cedemos tus datos personales a terceros con fines comerciales.`
        },
        {
          id: 'conservacion',
          title: '6. Conservación de datos',
          content: `Conservamos tus datos durante los siguientes plazos:

• **Datos de cuenta:** Mientras mantengas tu cuenta activa. Puedes solicitar la eliminación en cualquier momento.
• **Resultados y estadísticas:** Se mantienen como parte del historial de la liga. Los datos se anonimizarán tras la eliminación de tu cuenta.
• **Datos fiscales:** 4 años conforme a la normativa fiscal española.
• **Datos de navegación:** Según los plazos indicados en la [Política de Cookies](/es/politica-cookies).`
        },
        {
          id: 'derechos',
          title: '7. Tus derechos',
          content: `Conforme al RGPD y la LOPDGDD, tienes derecho a:

• **Acceso:** Conocer qué datos personales tratamos sobre ti.
• **Rectificación:** Corregir datos inexactos o incompletos.
• **Supresión:** Solicitar la eliminación de tus datos ("derecho al olvido").
• **Limitación:** Solicitar la limitación del tratamiento en determinadas circunstancias.
• **Portabilidad:** Recibir tus datos en un formato estructurado y de uso común.
• **Oposición:** Oponerte al tratamiento de tus datos, incluida la elaboración de perfiles.
• **Retirada del consentimiento:** Retirar tu consentimiento en cualquier momento sin que afecte a la licitud del tratamiento previo.

Para ejercer estos derechos, envía un email a **info@tenisdp.es** indicando tu solicitud y adjuntando copia de tu documento de identidad.

Si consideras que tus derechos no han sido debidamente atendidos, puedes presentar una reclamación ante la **Agencia Española de Protección de Datos (AEPD)**: [https://www.aepd.es](https://www.aepd.es)`
        },
        {
          id: 'seguridad',
          title: '8. Medidas de seguridad',
          content: `Aplicamos medidas técnicas y organizativas para proteger tus datos, incluyendo:

• Cifrado de contraseñas mediante algoritmos seguros (bcrypt)
• Comunicaciones cifradas mediante HTTPS/TLS
• Autenticación mediante tokens JWT con caducidad
• Acceso restringido a la base de datos
• Copias de seguridad periódicas`
        },
        {
          id: 'menores',
          title: '9. Menores de edad',
          content: `Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos conscientemente datos de menores de 16 años. Si eres padre/tutor y crees que tu hijo nos ha proporcionado datos, contacta con nosotros para proceder a su eliminación.`
        },
        {
          id: 'cambios',
          title: '10. Cambios en esta política',
          content: `Podemos actualizar esta Política de Privacidad periódicamente. Publicaremos cualquier cambio en esta página con la fecha de actualización. Para cambios significativos, te notificaremos por email.`
        }
      ]
    },

    // ============================================================
    // POLÍTICA DE COOKIES (Cookie Policy) - LSSI Art. 22 / RGPD
    // ============================================================
    cookies: {
      title: 'Política de Cookies',
      lastUpdated: 'Última actualización: febrero 2025',
      sections: [
        {
          id: 'que-son',
          title: '1. ¿Qué son las cookies?',
          content: `Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan para recordar preferencias, mejorar la experiencia de navegación y recopilar datos analíticos.`
        },
        {
          id: 'cookies-utilizamos',
          title: '2. Cookies que utilizamos',
          content: `**Cookies estrictamente necesarias (no requieren consentimiento):**

| Cookie | Proveedor | Finalidad | Duración |
|--------|-----------|-----------|----------|
| token | tenisdp.es | Autenticación de usuario (JWT) | Sesión |

**Cookies analíticas (requieren consentimiento):**

| Cookie | Proveedor | Finalidad | Duración |
|--------|-----------|-----------|----------|
| _ga | Google Analytics | Distinguir usuarios únicos | 2 años |
| _ga_* | Google Analytics | Mantener estado de sesión | 2 años |
| _clck | Microsoft Clarity | Identificar usuario | 1 año |
| _clsk | Microsoft Clarity | Sesión de usuario | 1 día |

Las cookies analíticas nos ayudan a entender cómo los usuarios interactúan con la plataforma para poder mejorarla.`
        },
        {
          id: 'gestionar',
          title: '3. Cómo gestionar las cookies',
          content: `Puedes configurar las cookies a través de nuestro banner de cookies que aparece al acceder a la Web por primera vez. También puedes gestionar las cookies desde la configuración de tu navegador:

• **Chrome:** Configuración → Privacidad y seguridad → Cookies
• **Firefox:** Opciones → Privacidad y seguridad
• **Safari:** Preferencias → Privacidad
• **Edge:** Configuración → Cookies y permisos del sitio

Ten en cuenta que deshabilitar las cookies esenciales puede afectar al funcionamiento de la Web (por ejemplo, no podrás mantener tu sesión iniciada).`
        },
        {
          id: 'terceros',
          title: '4. Cookies de terceros',
          content: `Utilizamos servicios de terceros que pueden instalar sus propias cookies:

• **Google Analytics:** Para medir el tráfico y comportamiento de uso. [Política de privacidad de Google](https://policies.google.com/privacy)
• **Microsoft Clarity:** Para analizar mapas de calor y sesiones de uso. [Política de privacidad de Microsoft](https://privacy.microsoft.com/privacystatement)

Estos terceros actúan como encargados del tratamiento y están sujetos a sus respectivas políticas de privacidad.`
        },
        {
          id: 'cambios-cookies',
          title: '5. Cambios en esta política',
          content: `Esta política de cookies puede actualizarse para reflejar cambios en las cookies que utilizamos. Publicaremos cualquier modificación en esta página.`
        }
      ]
    },

    // ============================================================
    // TÉRMINOS Y CONDICIONES DE VENTA (Terms & Conditions)
    // ============================================================
    terminos: {
      title: 'Términos y Condiciones',
      lastUpdated: 'Última actualización: febrero 2025',
      sections: [
        {
          id: 'generalidades',
          title: '1. Generalidades',
          content: `Estos Términos y Condiciones regulan la contratación de inscripciones a ligas de tenis amateur ofrecidas a través de la plataforma **Tenis del Parque** (tenisdp.es).

Al completar una inscripción, el Usuario declara haber leído y aceptado estos Términos, el [Aviso Legal](/es/aviso-legal) y la [Política de Privacidad](/es/politica-privacidad).`
        },
        {
          id: 'servicio',
          title: '2. Descripción del servicio',
          content: `Tenis del Parque ofrece un servicio de organización de ligas de tenis amateur que incluye:

• Inscripción en una liga de tenis para la temporada contratada
• Generación de emparejamientos mediante sistema suizo
• Acceso a la plataforma online con rankings ELO, clasificaciones y estadísticas
• Comunicación de partidos y resultados
• Fase de playoffs para los jugadores clasificados

El servicio **no incluye** la reserva ni el coste de las pistas de tenis, que serán acordados y compartidos directamente entre los jugadores emparejados.`
        },
        {
          id: 'inscripcion',
          title: '3. Proceso de inscripción y pago',
          content: `Para inscribirse, el Usuario debe:

1. Crear una cuenta en la plataforma con sus datos personales.
2. Seleccionar la ciudad y nivel de liga deseado.
3. Realizar el pago del precio indicado mediante pasarela segura.

El precio total, incluyendo impuestos aplicables, se mostrará claramente antes de confirmar el pago. Tras el pago, el Usuario recibirá una confirmación por email.`
        },
        {
          id: 'precios',
          title: '4. Precios',
          content: `Los precios de inscripción se indican en euros (€) e incluyen los impuestos aplicables. Los precios pueden variar entre temporadas y ciudades y estarán siempre visibles en la página de inscripción antes de realizar el pago.

Los códigos de descuento, cuando estén disponibles, se aplicarán antes de finalizar la compra y no son acumulables salvo indicación expresa.`
        },
        {
          id: 'desistimiento',
          title: '5. Derecho de desistimiento',
          content: `Conforme a la legislación de consumidores, tienes derecho a desistir de la inscripción en un plazo de **14 días naturales** desde la confirmación del pago, sin necesidad de justificación.

**Excepción:** Si la temporada de liga ya ha comenzado y has participado en algún partido o se te ha asignado un emparejamiento, el derecho de desistimiento no será aplicable al tratarse de un servicio que ya ha comenzado a ejecutarse con tu consentimiento.

Para ejercer el derecho de desistimiento, envía un email a **info@tenisdp.es** indicando tu nombre, email de registro y el motivo de la cancelación. El reembolso se realizará en un plazo máximo de 14 días usando el mismo medio de pago utilizado en la compra.`
        },
        {
          id: 'obligaciones-usuario',
          title: '6. Obligaciones del usuario',
          content: `Al inscribirse, el Usuario se compromete a:

• Proporcionar información veraz y actualizada.
• Respetar las reglas de la liga disponibles en la sección de [Reglamento](/es/rules).
• Mantener una conducta deportiva y respetuosa con los demás jugadores.
• Reportar los resultados de los partidos en el plazo establecido.
• No manipular resultados ni utilizar cuentas falsas.

El incumplimiento de estas obligaciones podrá suponer la expulsión de la liga sin derecho a reembolso.`
        },
        {
          id: 'obligaciones-titular',
          title: '7. Obligaciones de Tenis del Parque',
          content: `Tenis del Parque se compromete a:

• Organizar la liga según el calendario y formato anunciados.
• Generar emparejamientos justos basados en el sistema suizo y ranking ELO.
• Mantener la plataforma operativa y actualizada.
• Atender las consultas y reclamaciones de los usuarios de forma diligente.

Tenis del Parque se reserva el derecho de modificar el formato o calendario de la liga por causas justificadas (número insuficiente de jugadores, fuerza mayor, etc.), notificando a los usuarios afectados.`
        },
        {
          id: 'cancelacion-liga',
          title: '8. Cancelación de la liga',
          content: `Si Tenis del Parque cancela una liga antes de su inicio, se procederá al reembolso íntegro de las inscripciones. Si la cancelación se produce una vez iniciada, se evaluará un reembolso proporcional en función de las rondas completadas.`
        },
        {
          id: 'limitacion',
          title: '9. Limitación de responsabilidad',
          content: `Tenis del Parque actúa como organizador de la liga y plataforma tecnológica. No nos hacemos responsables de:

• Lesiones o accidentes ocurridos durante los partidos.
• Disponibilidad o estado de las pistas de tenis.
• Conflictos entre jugadores fuera del ámbito de la liga.
• Interrupciones del servicio por causas técnicas ajenas a nuestro control.

Los jugadores participan bajo su propia responsabilidad y se recomienda disponer de un seguro deportivo adecuado.`
        },
        {
          id: 'legislacion-terminos',
          title: '10. Legislación aplicable',
          content: `Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia, serán competentes los Juzgados y Tribunales correspondientes según la normativa vigente de protección de consumidores.

Plataforma europea de resolución de litigios en línea (ODR): [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)`
        }
      ]
    }
  },

  en: {
    // ============================================================
    // LEGAL NOTICE (Aviso Legal) - LSSI-CE Article 10 compliance
    // ============================================================
    avisoLegal: {
      title: 'Legal Notice',
      lastUpdated: 'Last updated: February 2025',
      sections: [
        {
          id: 'owner',
          title: '1. Website owner identification',
          content: `In compliance with Article 10 of Law 34/2002, of July 11, on Information Society Services and Electronic Commerce (LSSI-CE), the owner of this website is:

• **Owner:** Tomasz Mikolajewicz
• **NIF:** [To be updated upon autónomo registration]
• **Address:** [To be updated upon autónomo registration]
• **Email:** info@tenisdp.es
• **Main domain:** https://www.tenisdp.es`
        },
        {
          id: 'purpose',
          title: '2. Purpose and scope',
          content: `This Legal Notice governs access, browsing, and use of the website **tenisdp.es** (hereinafter, the "Website"), as well as its content, features, and online registration services for amateur tennis leagues and competitions organised by Tenis del Parque.`
        },
        {
          id: 'user-status',
          title: '3. User status',
          content: `Browsing and/or using the Website confers the status of **User** and implies full acceptance of this Legal Notice. If you disagree, you must refrain from using the Website.

Minors are deemed to access the site with the authorisation and under the responsibility of their parents, guardians, or legal representatives.`
        },
        {
          id: 'usage-rules',
          title: '4. Usage rules',
          content: `Users agree to use the Website diligently, lawfully, and in accordance with applicable regulations, morality, public order, and good customs. The following is prohibited:

• Introducing or distributing viruses, malware, or any software that affects the Website's operation.
• Attempting to access restricted areas or third-party data without authorisation.
• Using the Website for fraudulent purposes or to the detriment of the owner's or third parties' rights.
• Impersonating another player or manipulating match results.`
        },
        {
          id: 'registration-purchase',
          title: '5. Online registration purchases',
          content: `The Website offers online registration for amateur tennis leagues. The total price including applicable taxes will be displayed before completing the purchase. Payment is processed through a secure payment gateway and the User will receive confirmation by email.

Specific purchase conditions (cancellation policy, schedule, levels, league rules, etc.) are detailed on the registration page and in the Terms and Conditions available on this Website.`
        },
        {
          id: 'intellectual-property',
          title: '6. Intellectual and industrial property',
          content: `The design, logos, trademarks, trade names, code, text, images, videos, and other elements of the Website are protected by intellectual and industrial property rights owned by Tenis del Parque or third-party licensors. Their reproduction, distribution, public communication, transformation, or any unauthorised use is prohibited.`
        },
        {
          id: 'links',
          title: '7. Links',
          content: `The Website may include links to third-party sites. The owner is not responsible for the content or privacy practices of such sites. The inclusion of links does not imply any relationship, recommendation, or approval.`
        },
        {
          id: 'liability',
          title: '8. Liability',
          content: `The owner does not guarantee uninterrupted availability of the Website or the complete absence of errors, although reasonable measures will be taken to correct them. The owner is not liable for damages arising from network failures, interruptions, viruses, attacks, or other events beyond its control.`
        },
        {
          id: 'data-cookies',
          title: '9. Data protection and cookies',
          content: `User personal data processing is governed by the [Privacy Policy](/en/privacy-policy) and cookie usage by the [Cookie Policy](/en/cookie-policy).`
        },
        {
          id: 'jurisdiction',
          title: '10. Applicable law and jurisdiction',
          content: `This Legal Notice is governed by Spanish law. For any disputes, the parties submit to the competent Courts and Tribunals in accordance with applicable regulations.

European Online Dispute Resolution platform (ODR): [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)`
        }
      ]
    },

    // ============================================================
    // PRIVACY POLICY - GDPR/LOPDGDD
    // ============================================================
    privacidad: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: February 2025',
      sections: [
        {
          id: 'controller',
          title: '1. Data controller',
          content: `• **Controller:** Tomasz Mikolajewicz
• **Contact email:** info@tenisdp.es
• **Website:** https://www.tenisdp.es`
        },
        {
          id: 'data-collected',
          title: '2. Data we collect',
          content: `We collect the following personal data depending on the service used:

**When creating an account:**
• Full name
• Email address
• Phone number (WhatsApp)
• Password (stored encrypted)
• Selected playing level

**When participating in the league:**
• Match results
• ELO score and playing statistics
• City and league preferences

**Technical data collected automatically:**
• IP address
• Browser and device type
• Pages visited and browsing time
• Cookies (see our [Cookie Policy](/en/cookie-policy))`
        },
        {
          id: 'purposes',
          title: '3. Purposes of processing',
          content: `We use your data for the following purposes:

• **League management:** Organising matches, generating pairings, calculating ELO rankings, and maintaining standings.
• **Communications:** Sending notifications about matches, results, and league news via email and WhatsApp.
• **User account:** Managing your registration, authentication, and player profile.
• **Service improvement:** Analysing platform usage to improve user experience.
• **Legal compliance:** Meeting applicable legal and tax obligations.`
        },
        {
          id: 'legal-basis',
          title: '4. Legal basis for processing',
          content: `Your data processing is based on:

• **Contract performance:** Processing is necessary to manage your registration and league participation (Art. 6.1.b GDPR).
• **Consent:** For sending marketing communications and using non-essential cookies (Art. 6.1.a GDPR).
• **Legitimate interest:** To improve our services and prevent fraud (Art. 6.1.f GDPR).
• **Legal obligation:** To comply with tax and legal requirements (Art. 6.1.c GDPR).`
        },
        {
          id: 'recipients',
          title: '5. Data recipients',
          content: `We may share data with:

• Technology providers (web hosting, database, maintenance and technical support).
• Analytics and user experience improvement services.
• Payment gateways and financial institutions to process payments.
• Public authorities and courts where required by law.

All of them act, where applicable, as data processors in accordance with Art. 28 GDPR, with appropriate contracts and security measures in place. Where any provider is located outside the European Economic Area, an adequate level of protection is ensured through the EU-US Data Privacy Framework, standard contractual clauses, or other appropriate safeguards.

**Data visible to other players:**
By participating in the league, your name, match results, ELO ranking, and statistics will be visible to other platform users. This is an essential part of how the league operates.

We do not sell or share your personal data with third parties for commercial purposes.`
        },
        {
          id: 'retention',
          title: '6. Data retention',
          content: `We retain your data for the following periods:

• **Account data:** As long as your account remains active. You may request deletion at any time.
• **Results and statistics:** Maintained as part of league history. Data will be anonymised upon account deletion.
• **Tax data:** 4 years in accordance with Spanish tax regulations.
• **Browsing data:** As specified in the [Cookie Policy](/en/cookie-policy).`
        },
        {
          id: 'rights',
          title: '7. Your rights',
          content: `Under the GDPR and LOPDGDD, you have the right to:

• **Access:** Know what personal data we process about you.
• **Rectification:** Correct inaccurate or incomplete data.
• **Erasure:** Request deletion of your data ("right to be forgotten").
• **Restriction:** Request limitation of processing in certain circumstances.
• **Portability:** Receive your data in a structured, commonly used format.
• **Objection:** Object to the processing of your data, including profiling.
• **Withdraw consent:** Withdraw your consent at any time without affecting the lawfulness of prior processing.

To exercise these rights, send an email to **info@tenisdp.es** stating your request and attaching a copy of your identity document.

If you believe your rights have not been properly addressed, you may file a complaint with the **Spanish Data Protection Agency (AEPD)**: [https://www.aepd.es](https://www.aepd.es)`
        },
        {
          id: 'security',
          title: '8. Security measures',
          content: `We implement technical and organisational measures to protect your data, including:

• Password encryption using secure algorithms (bcrypt)
• Encrypted communications via HTTPS/TLS
• Authentication via JWT tokens with expiry
• Restricted database access
• Regular backups`
        },
        {
          id: 'minors',
          title: '9. Minors',
          content: `Our services are not directed at individuals under 16 years of age. We do not knowingly collect data from children under 16. If you are a parent/guardian and believe your child has provided us with data, please contact us to arrange its deletion.`
        },
        {
          id: 'policy-changes',
          title: '10. Changes to this policy',
          content: `We may update this Privacy Policy from time to time. Any changes will be published on this page with the updated date. For significant changes, we will notify you by email.`
        }
      ]
    },

    // ============================================================
    // COOKIE POLICY - LSSI Art. 22 / GDPR
    // ============================================================
    cookies: {
      title: 'Cookie Policy',
      lastUpdated: 'Last updated: February 2025',
      sections: [
        {
          id: 'what-are',
          title: '1. What are cookies?',
          content: `Cookies are small text files stored on your device when you visit a website. They are used to remember preferences, improve the browsing experience, and collect analytical data.`
        },
        {
          id: 'cookies-we-use',
          title: '2. Cookies we use',
          content: `**Strictly necessary cookies (no consent required):**

| Cookie | Provider | Purpose | Duration |
|--------|----------|---------|----------|
| token | tenisdp.es | User authentication (JWT) | Session |

**Analytical cookies (consent required):**

| Cookie | Provider | Purpose | Duration |
|--------|----------|---------|----------|
| _ga | Google Analytics | Distinguish unique users | 2 years |
| _ga_* | Google Analytics | Maintain session state | 2 years |
| _clck | Microsoft Clarity | User identification | 1 year |
| _clsk | Microsoft Clarity | User session | 1 day |

Analytical cookies help us understand how users interact with the platform so we can improve it.`
        },
        {
          id: 'manage',
          title: '3. How to manage cookies',
          content: `You can configure cookies through our cookie banner that appears when you first access the Website. You can also manage cookies through your browser settings:

• **Chrome:** Settings → Privacy and security → Cookies
• **Firefox:** Options → Privacy and security
• **Safari:** Preferences → Privacy
• **Edge:** Settings → Cookies and site permissions

Please note that disabling essential cookies may affect how the Website functions (for example, you may not be able to stay logged in).`
        },
        {
          id: 'third-party',
          title: '4. Third-party cookies',
          content: `We use third-party services that may install their own cookies:

• **Google Analytics:** To measure traffic and usage behaviour. [Google Privacy Policy](https://policies.google.com/privacy)
• **Microsoft Clarity:** To analyse heatmaps and usage sessions. [Microsoft Privacy Policy](https://privacy.microsoft.com/privacystatement)

These third parties act as data processors and are subject to their respective privacy policies.`
        },
        {
          id: 'cookie-changes',
          title: '5. Changes to this policy',
          content: `This cookie policy may be updated to reflect changes in the cookies we use. Any modifications will be published on this page.`
        }
      ]
    },

    // ============================================================
    // TERMS AND CONDITIONS
    // ============================================================
    terminos: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last updated: February 2025',
      sections: [
        {
          id: 'general',
          title: '1. General provisions',
          content: `These Terms and Conditions govern the purchase of registrations for amateur tennis leagues offered through the **Tenis del Parque** platform (tenisdp.es).

By completing a registration, the User declares having read and accepted these Terms, the [Legal Notice](/en/legal-notice) and the [Privacy Policy](/en/privacy-policy).`
        },
        {
          id: 'service-description',
          title: '2. Service description',
          content: `Tenis del Parque offers an amateur tennis league organisation service that includes:

• Registration in a tennis league for the contracted season
• Match pairing generation using the Swiss system
• Access to the online platform with ELO rankings, standings, and statistics
• Match and result communications
• Playoff stage for qualifying players

The service **does not include** tennis court booking or costs, which shall be agreed upon and shared directly between paired players.`
        },
        {
          id: 'registration-payment',
          title: '3. Registration and payment process',
          content: `To register, the User must:

1. Create an account on the platform with their personal details.
2. Select the desired city and league level.
3. Complete payment of the indicated price through the secure payment gateway.

The total price, including applicable taxes, will be clearly displayed before confirming payment. Following payment, the User will receive a confirmation email.`
        },
        {
          id: 'pricing',
          title: '4. Pricing',
          content: `Registration prices are shown in euros (€) and include applicable taxes. Prices may vary between seasons and cities and will always be visible on the registration page before payment.

Discount codes, when available, will be applied before completing the purchase and are not cumulative unless expressly indicated.`
        },
        {
          id: 'withdrawal',
          title: '5. Right of withdrawal',
          content: `Under consumer protection legislation, you have the right to withdraw from your registration within **14 calendar days** from payment confirmation, without giving any reason.

**Exception:** If the league season has already started and you have participated in any match or been assigned a pairing, the right of withdrawal will not apply as the service has already begun to be performed with your consent.

To exercise your right of withdrawal, send an email to **info@tenisdp.es** stating your name, registration email, and the reason for cancellation. The refund will be processed within a maximum of 14 days using the same payment method used for the purchase.`
        },
        {
          id: 'user-obligations',
          title: '6. User obligations',
          content: `Upon registration, the User agrees to:

• Provide truthful and up-to-date information.
• Respect the league rules available in the [Rules](/en/rules) section.
• Maintain sportsmanlike and respectful conduct towards other players.
• Report match results within the established timeframe.
• Not manipulate results or use fraudulent accounts.

Failure to comply with these obligations may result in expulsion from the league without the right to a refund.`
        },
        {
          id: 'our-obligations',
          title: '7. Tenis del Parque obligations',
          content: `Tenis del Parque commits to:

• Organising the league according to the announced schedule and format.
• Generating fair pairings based on the Swiss system and ELO ranking.
• Keeping the platform operational and up to date.
• Addressing user queries and complaints diligently.

Tenis del Parque reserves the right to modify the league format or schedule for justified reasons (insufficient players, force majeure, etc.), notifying affected users accordingly.`
        },
        {
          id: 'league-cancellation',
          title: '8. League cancellation',
          content: `If Tenis del Parque cancels a league before it starts, all registrations will be fully refunded. If cancellation occurs after the league has started, a proportional refund based on completed rounds will be evaluated.`
        },
        {
          id: 'liability-limitation',
          title: '9. Limitation of liability',
          content: `Tenis del Parque acts as a league organiser and technology platform. We are not responsible for:

• Injuries or accidents occurring during matches.
• Availability or condition of tennis courts.
• Conflicts between players outside the scope of the league.
• Service interruptions due to technical causes beyond our control.

Players participate at their own risk and are advised to have appropriate sports insurance.`
        },
        {
          id: 'applicable-law',
          title: '10. Applicable law',
          content: `These Terms and Conditions are governed by Spanish law. For any disputes, the competent Courts and Tribunals as per applicable consumer protection regulations shall have jurisdiction.

European Online Dispute Resolution platform (ODR): [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr)`
        }
      ]
    }
  }
}
