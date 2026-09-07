/**
 * Client-Side Branded Email Template & Preset Service (ADR-0016).
 *
 * Provides real-time HTML rendering identical to the backend Brevo dispatcher,
 * enabling zero-latency live visual preview in the CRM Follow-Up Studio.
 */

export interface EmailPreset {
  id: string;
  label: string;
  description: string;
  subject: string;
  badge: string;
  headline: string;
  greeting: string;
  bodyText: string;
  includeSummary: boolean;
  summaryTitle: string;
  includeRoadmap: boolean;
  roadmapTitle: string;
  closingNote: string;
  ctaType: 'phone' | 'reply' | 'custom' | 'none';
  ctaText: string;
  ctaUrl: string;
}

export const EMAIL_PRESETS: EmailPreset[] = [
  {
    id: 'followup_general',
    label: 'Premier contact & Suivi',
    description: 'Relance bienveillante pour faire le point sur la demande reçue.',
    subject: 'Suivi de votre demande d\'estimation — Paysagement Botanic',
    badge: '✓ Suivi de dossier',
    headline: 'Faisons le point sur votre projet d\'aménagement',
    greeting: 'Bonjour {{name}},',
    bodyText: `Merci encore d'avoir sollicité Paysagement Botanic pour votre projet de {{service}}.\n\nNotre équipe a attentivement analysé votre demande. Nous souhaitons échanger quelques instants avec vous afin de bien cerner vos attentes spécifiques et planifier la prochaine étape de votre projet.`,
    includeSummary: true,
    summaryTitle: 'Récapitulatif de votre dossier',
    includeRoadmap: true,
    roadmapTitle: 'Comment se déroule la suite :',
    closingNote: 'Nous avons hâte de collaborer avec vous à la mise en valeur de votre espace extérieur.',
    ctaType: 'phone',
    ctaText: '📞 Joindre notre équipe au (514) 850-1997',
    ctaUrl: 'tel:5148501997'
  },
  {
    id: 'appointment_proposal',
    label: 'Planification visite terrain',
    description: 'Propose une rencontre sans frais sur les lieux pour prise de cotes.',
    subject: 'Planification de votre visite de terrain — Paysagement Botanic',
    badge: '✓ Rendez-vous sur place',
    headline: 'Rencontre technique et évaluation sans frais',
    greeting: 'Bonjour {{name}},',
    bodyText: `Afin de concevoir une estimation précise, juste et adaptée à la configuration réelle de votre terrain pour vos travaux de {{service}}, un de nos spécialistes se rendra sur place.\n\nQuelles seraient vos disponibilités pour une brève rencontre de 20 à 30 minutes cette semaine ? Vous pouvez nous répondre directement par courriel avec vos plages horaires souhaitées.`,
    includeSummary: true,
    summaryTitle: 'Dossier de visite',
    includeRoadmap: true,
    roadmapTitle: 'Prochaines étapes :',
    closingNote: 'Au plaisir de vous rencontrer sur votre propriété.',
    ctaType: 'reply',
    ctaText: '✉️ Répondre avec mes disponibilités',
    ctaUrl: 'mailto:paysagementbotanic@gmail.com'
  },
  {
    id: 'quote_followup',
    label: 'Suivi suite au devis transmis',
    description: 'Prend des nouvelles après l\'envoi de la soumission chiffrée.',
    subject: 'Avez-vous des questions sur votre devis ? — Paysagement Botanic',
    badge: '✓ Suivi de proposition',
    headline: 'Votre proposition d\'aménagement extérieur',
    greeting: 'Bonjour {{name}},',
    bodyText: `Nous espérons que le devis chiffré transmis pour votre projet de {{service}} a retenu toute votre attention.\n\nUn projet d'aménagement paysager représente un investissement important. Avez-vous des questions techniques sur le choix des matériaux, le phasage des travaux ou l'échéancier ? Notre équipe se tient prête à ajuster les détails selon vos priorités.`,
    includeSummary: true,
    summaryTitle: 'Détails de la soumission',
    includeRoadmap: false,
    roadmapTitle: '',
    closingNote: 'Nous demeurons à votre entière disposition pour tout complément d\'information.',
    ctaType: 'phone',
    ctaText: '📞 Échanger avec notre conseiller au (514) 850-1997',
    ctaUrl: 'tel:5148501997'
  },
  {
    id: 'photos_request',
    label: 'Demande de photos du terrain',
    description: 'Invite le client à envoyer des photos pour accélérer le chiffrage.',
    subject: 'Précisions et photos pour votre estimation — Paysagement Botanic',
    badge: '✓ Information requise',
    headline: 'Quelques photos pour affiner votre estimation',
    greeting: 'Bonjour {{name}},',
    bodyText: `Afin d'accélérer l'analyse de votre demande d'aménagement ({{service}}), auriez-vous la possibilité de nous faire parvenir quelques photos récentes de la zone à aménager ainsi que de l'accès à votre cour ?\n\nVous pouvez simplement répondre directement à ce courriel en y joignant vos photos. Cela nous permettra de préparer notre rencontre avec une vision claire de votre espace.`,
    includeSummary: true,
    summaryTitle: 'Votre demande en cours',
    includeRoadmap: false,
    roadmapTitle: '',
    closingNote: 'Merci pour votre précieuse collaboration !',
    ctaType: 'reply',
    ctaText: '✉️ Répondre et joindre mes photos',
    ctaUrl: 'mailto:paysagementbotanic@gmail.com'
  },
  {
    id: 'custom_blank',
    label: 'Message libre (Personnalisé)',
    description: 'Formulaire vierge avec la même mise en page officielle Botanic.',
    subject: 'Votre projet d\'aménagement extérieur — Paysagement Botanic',
    badge: '✓ Message important',
    headline: 'Message de votre équipe Paysagement Botanic',
    greeting: 'Bonjour {{name}},',
    bodyText: `Nous vous contactons aujourd'hui concernant votre projet d'aménagement extérieur.\n\nN'hésitez pas à nous faire part de vos commentaires ou questions.`,
    includeSummary: false,
    summaryTitle: '',
    includeRoadmap: false,
    roadmapTitle: '',
    closingNote: 'L\'équipe de Paysagement Botanic reste à votre écoute.',
    ctaType: 'phone',
    ctaText: '📞 Joindre l\'équipe au (514) 850-1997',
    ctaUrl: 'tel:5148501997'
  }
];

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface EmailRenderData {
  name: string;
  service: string;
  auditId: string;
  language?: string;
  subject: string;
  preheader?: string;
  badge: string;
  headline: string;
  greeting: string;
  bodyText: string;
  includeSummary: boolean;
  summaryTitle?: string;
  summaryDetails?: string;
  includeRoadmap: boolean;
  roadmapTitle?: string;
  roadmapSteps?: Array<{ title: string; desc: string }>;
  closingNote?: string;
  ctaType: 'phone' | 'reply' | 'custom' | 'none';
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Replaces placeholders like {{name}}, {{service}}, {{auditId}} in preset text.
 */
export function interpolatePlaceholders(text: string, data: { name: string; service: string; auditId: string }): string {
  if (!text) return '';
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, data.name || 'Client')
    .replace(/\{\{\s*service\s*\}\}/gi, data.service || 'Aménagement')
    .replace(/\{\{\s*auditId\s*\}\}/gi, data.auditId || '');
}

/**
 * Generates the full HTML email document for real-time live preview.
 */
export function renderEmailPreviewHtml(data: EmailRenderData): string {
  const isEn = typeof data.language === 'string' && data.language.toLowerCase().startsWith('en');
  const safeName = escapeHtml(data.name || 'Client');
  const safeService = escapeHtml(data.service || (isEn ? 'Landscaping Project' : 'Projet d\'aménagement'));
  const safeAuditId = escapeHtml(data.auditId || 'REF');
  const currentYear = new Date().getFullYear();

  const title = escapeHtml(data.subject || 'Paysagement Botanic');
  const preheader = escapeHtml(data.preheader || data.headline || 'Suivi de votre projet avec Paysagement Botanic.');
  const badgeText = escapeHtml(data.badge || (isEn ? '✓ Project Follow-Up' : '✓ Suivi de Dossier'));
  const headlineText = escapeHtml(data.headline || (isEn ? 'Follow-up' : 'Suivi de votre demande'));
  const greetingText = escapeHtml(data.greeting || (isEn ? `Hello ${safeName},` : `Bonjour ${safeName},`));

  const paragraphs = (data.bodyText || '').trim().split(/\n\s*\n/);
  const bodyContent = paragraphs
    .map(p => `<p style="margin:0 0 16px 0;color:#3c4043;font-size:14px;line-height:22px;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

  let summaryBoxHtml = '';
  if (data.includeSummary) {
    const summaryTitle = escapeHtml(data.summaryTitle || (isEn ? 'Summary of your file' : 'Récapitulatif de votre dossier'));
    const serviceLabel = isEn ? 'Service requested:' : 'Service demandé :';
    const referenceLabel = isEn ? 'File reference:' : 'Numéro de dossier :';
    const notesLabel = isEn ? 'Notes & Details:' : 'Détails & Précisions :';
    const safeDetails = data.summaryDetails ? escapeHtml(data.summaryDetails).replace(/\n/g, '<br>') : '';

    summaryBoxHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8f9fa;border:1px solid #dadce0;border-radius:8px;margin:0 0 22px 0;">
        <tr>
          <td style="padding:16px 20px;">
            <div style="font-size:11px;letter-spacing:0.8px;color:#5f6368;font-weight:700;text-transform:uppercase;margin-bottom:12px;">
              ${summaryTitle}
            </div>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size:13.5px;">
              <tr>
                <td style="padding:6px 0;width:38%;color:#5f6368;font-weight:500;">${serviceLabel}</td>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;background-color:#2e5b38;color:#ffffff;font-size:12.5px;font-weight:600;padding:3px 10px;border-radius:4px;">
                    ${safeService}
                  </span>
                </td>
              </tr>
              ${safeDetails ? `
              <tr>
                <td style="padding:8px 0;color:#5f6368;font-weight:500;border-top:1px solid #e8eaed;vertical-align:top;">${notesLabel}</td>
                <td style="padding:8px 0;border-top:1px solid #e8eaed;color:#202124;line-height:1.5;">
                  <em style="color:#3c4043;">« ${safeDetails} »</em>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:6px 0;color:#5f6368;font-weight:500;border-top:1px solid #e8eaed;">${referenceLabel}</td>
                <td style="padding:6px 0;border-top:1px solid #e8eaed;">
                  <code style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#202124;background-color:#e8eaed;padding:2px 6px;border-radius:4px;">${safeAuditId}</code>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
  }

  let roadmapHtml = '';
  if (data.includeRoadmap) {
    const rTitle = escapeHtml(data.roadmapTitle || (isEn ? 'What happens next:' : 'Comment se déroule la suite :'));
    const steps = data.roadmapSteps && data.roadmapSteps.length > 0
      ? data.roadmapSteps
      : [
          {
            title: isEn ? 'Attentive project review' : 'Analyse attentive de votre projet',
            desc: isEn ? 'Our team carefully reviews your scope of work and property characteristics.' : 'Notre équipe étudie attentivement vos besoins et les particularités de votre espace.'
          },
          {
            title: isEn ? 'Personalized consultation' : 'Échange personnalisé',
            desc: isEn ? 'We discuss your expectations, answer your questions, and guide your options.' : 'Nous communiquons avec vous pour faire le point sur vos attentes et vos options.'
          },
          {
            title: isEn ? 'On-site assessment & proposal' : 'Visite de terrain & proposition',
            desc: isEn ? 'A complimentary on-site visit to assess your property in person, followed by a clear, detailed estimate.' : 'Une rencontre sans frais sur place afin d\'évaluer les lieux et vous préparer une proposition claire et détaillée.'
          }
        ];

    const stepsRows = steps.map((s, idx) => `
      <tr>
        <td style="padding:6px 0;vertical-align:top;width:28px;">
          <div style="width:20px;height:20px;background-color:#e6f4ea;color:#137333;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;">${idx + 1}</div>
        </td>
        <td style="padding:6px 0;">
          <strong style="color:#202124;">${escapeHtml(s.title)} :</strong> ${escapeHtml(s.desc)}
        </td>
      </tr>`).join('');

    roadmapHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border:1px solid #dadce0;border-radius:8px;margin:0 0 22px 0;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-size:11.5px;letter-spacing:0.8px;color:#2e5b38;font-weight:700;text-transform:uppercase;margin-bottom:14px;">
              ${rTitle}
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;color:#3c4043;">
              ${stepsRows}
            </table>
          </td>
        </tr>
      </table>`;
  }

  const closingNote = data.closingNote
    ? escapeHtml(data.closingNote)
    : '';

  let ctaButtonHtml = '';
  if (data.ctaType !== 'none') {
    let btnText = '';
    let btnUrl = '#';

    if (data.ctaType === 'phone') {
      btnText = data.ctaText || '📞 Joindre notre équipe au (514) 850-1997';
      btnUrl = 'tel:5148501997';
    } else if (data.ctaType === 'reply') {
      btnText = data.ctaText || '✉️ Répondre directement à ce courriel';
      btnUrl = 'mailto:paysagementbotanic@gmail.com';
    } else if (data.ctaType === 'custom') {
      btnText = data.ctaText || 'Visiter notre site web';
      btnUrl = data.ctaUrl || 'https://paysagementbotanic.com';
    }

    ctaButtonHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 24px auto;">
        <tr>
          <td align="center" style="border-radius:4px;background-color:#2e5b38;">
            <a href="${btnUrl}" target="_blank" style="background-color:#2e5b38;border:10px solid #2e5b38;border-left:22px solid #2e5b38;border-right:22px solid #2e5b38;font-family:'Google Sans','Montserrat',Roboto,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13.5px;color:#ffffff!important;text-decoration:none;border-radius:4px;font-weight:600;display:inline-block;letter-spacing:0.25px;">
              ${escapeHtml(btnText)}
            </a>
          </td>
        </tr>
      </table>`;
  }

  const linkWebsite = isEn ? 'Official Website' : 'Site officiel';
  const linkServices = isEn ? 'Our Services' : 'Nos services';
  const linkPortfolio = isEn ? 'Portfolio' : 'Réalisations';
  const linkContact = isEn ? 'Contact us' : 'Nous joindre';

  const transactionalNotice = isEn
    ? 'You are receiving this message regarding your inquiry with Paysagement Botanic.'
    : 'Vous recevez ce message dans le cadre du suivi de votre dossier auprès de Paysagement Botanic.';

  const law25Notice = isEn
    ? `Law 25 Compliance: File Reference ${safeAuditId}. Your personal information is handled securely and is never shared with third parties.`
    : `Conformité Loi 25 : Référence de dossier ${safeAuditId}. Vos renseignements personnels sont conservés en sécurité et ne sont jamais transmis à des tiers.`;

  const copyrightNotice = isEn
    ? `© ${currentYear} Paysagement Botanic. All rights reserved.`
    : `© ${currentYear} Paysagement Botanic. Tous droits réservés.`;

  return `
<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'fr'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse !important; }
    .email-container { max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #dadce0; box-shadow: 0 1px 3px rgba(60,64,67,0.08); margin: 0 auto; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8f9fa;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:20px 10px 32px 10px;">
        <div class="email-container">
          <!-- Top Accent Bar -->
          <div style="height:4px;background-color:#2e5b38;font-size:0;line-height:0;">&nbsp;</div>

          <!-- Header -->
          <div style="padding:22px 28px 18px 28px;background-color:#ffffff;border-bottom:1px solid #dadce0;display:flex;justify-content:space-between;align-items:center;">
            <a href="https://paysagementbotanic.com" target="_blank" style="text-decoration:none;display:inline-block;">
              <span style="font-weight:700;font-size:18px;color:#2e5b38;letter-spacing:-0.5px;">Paysagement Botanic</span>
            </a>
            <span style="display:inline-block;background-color:#e6f4ea;color:#137333;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:12px;letter-spacing:0.2px;">
              ${badgeText}
            </span>
          </div>

          <!-- Body -->
          <div class="mobile-padding" style="padding:26px 28px 22px 28px;color:#202124;font-size:14px;line-height:1.6;text-align:left;">
            <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#202124;line-height:26px;">
              ${headlineText}
            </h1>
            <p style="margin:0 0 14px 0;font-size:14.5px;color:#202124;line-height:23px;font-weight:500;">
              ${greetingText}
            </p>
            ${bodyContent}
            ${summaryBoxHtml}
            ${roadmapHtml}
            ${closingNote ? `<p style="margin:20px 0 12px 0;font-size:13.5px;color:#3c4043;line-height:21px;text-align:center;">${closingNote}</p>` : ''}
            ${ctaButtonHtml}
          </div>

          <!-- Footer -->
          <div style="background-color:#f8f9fa;padding:22px 28px;text-align:center;color:#5f6368;font-size:12px;line-height:1.6;border-top:1px solid #dadce0;">
            <div style="margin-bottom:10px;font-size:12px;">
              <a href="https://paysagementbotanic.com" target="_blank" style="color:#2e5b38;text-decoration:none;font-weight:600;">${linkWebsite}</a> &nbsp;•&nbsp; 
              <a href="https://paysagementbotanic.com/#services" target="_blank" style="color:#5f6368;text-decoration:none;">${linkServices}</a> &nbsp;•&nbsp; 
              <a href="https://paysagementbotanic.com/#collections" target="_blank" style="color:#5f6368;text-decoration:none;">${linkPortfolio}</a> &nbsp;•&nbsp; 
              <a href="tel:5148501997" style="color:#5f6368;text-decoration:none;">(514) 850-1997</a> &nbsp;•&nbsp; 
              <a href="mailto:paysagementbotanic@gmail.com" style="color:#5f6368;text-decoration:none;">${linkContact}</a>
            </div>
            <div style="font-size:11.5px;color:#5f6368;margin-bottom:6px;">
              <strong style="color:#202124;">Paysagement Botanic</strong> • Grand Montréal, Laval, Rive-Nord (Québec)
            </div>
            <div style="font-size:11px;color:#70757a;line-height:15px;margin-bottom:4px;">
              ${transactionalNotice}
            </div>
            <div style="font-size:11px;color:#70757a;line-height:15px;margin-bottom:6px;">
              ${law25Notice}
            </div>
            <div style="font-size:10.5px;color:#80868b;">
              ${copyrightNotice}
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
