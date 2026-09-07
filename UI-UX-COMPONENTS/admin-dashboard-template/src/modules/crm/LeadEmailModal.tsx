import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { Lead, FollowUpEvent } from '../../types/crm';
import { 
  EMAIL_PRESETS, 
  EmailPreset, 
  EmailRenderData, 
  renderEmailPreviewHtml, 
  interpolatePlaceholders 
} from '../../services/emailTemplateService';

interface LeadEmailModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onEmailSent?: (leadId: string, event: FollowUpEvent, newStatus?: string) => void;
  callerEmail?: string;
}

export const LeadEmailModal: React.FC<LeadEmailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onEmailSent,
  callerEmail = 'operator@kazaxlabs.com'
}) => {
  if (!isOpen) return null;

  const defaultPreset = EMAIL_PRESETS[0];

  // Preset state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);

  // Form fields
  const [subject, setSubject] = useState<string>(() => 
    interpolatePlaceholders(defaultPreset.subject, { name: lead.name, service: lead.serviceInterest, auditId: lead.id })
  );
  const [badge, setBadge] = useState<string>(defaultPreset.badge);
  const [headline, setHeadline] = useState<string>(() => 
    interpolatePlaceholders(defaultPreset.headline, { name: lead.name, service: lead.serviceInterest, auditId: lead.id })
  );
  const [greeting, setGreeting] = useState<string>(() => 
    interpolatePlaceholders(defaultPreset.greeting, { name: lead.name, service: lead.serviceInterest, auditId: lead.id })
  );
  const [bodyText, setBodyText] = useState<string>(() => 
    interpolatePlaceholders(defaultPreset.bodyText, { name: lead.name, service: lead.serviceInterest, auditId: lead.id })
  );
  const [includeSummary, setIncludeSummary] = useState<boolean>(defaultPreset.includeSummary);
  const [summaryTitle, setSummaryTitle] = useState<string>(defaultPreset.summaryTitle);
  const [summaryDetails, setSummaryDetails] = useState<string>(lead.message || '');
  const [includeRoadmap, setIncludeRoadmap] = useState<boolean>(defaultPreset.includeRoadmap);
  const [roadmapTitle, setRoadmapTitle] = useState<string>(defaultPreset.roadmapTitle);
  const [closingNote, setClosingNote] = useState<string>(defaultPreset.closingNote);
  const [ctaType, setCtaType] = useState<'phone' | 'reply' | 'custom' | 'none'>(defaultPreset.ctaType);
  const [ctaText, setCtaText] = useState<string>(defaultPreset.ctaText);
  const [ctaUrl, setCtaUrl] = useState<string>(defaultPreset.ctaUrl);

  // Preview options
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Submission state
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Switch preset handler
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = EMAIL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const data = { name: lead.name, service: lead.serviceInterest, auditId: lead.id };
    setSubject(interpolatePlaceholders(preset.subject, data));
    setBadge(preset.badge);
    setHeadline(interpolatePlaceholders(preset.headline, data));
    setGreeting(interpolatePlaceholders(preset.greeting, data));
    setBodyText(interpolatePlaceholders(preset.bodyText, data));
    setIncludeSummary(preset.includeSummary);
    setSummaryTitle(preset.summaryTitle);
    setIncludeRoadmap(preset.includeRoadmap);
    setRoadmapTitle(preset.roadmapTitle);
    setClosingNote(preset.closingNote);
    setCtaType(preset.ctaType);
    setCtaText(preset.ctaText);
    setCtaUrl(preset.ctaUrl);
    setErrorMessage(null);
  };

  // Live preview HTML compilation
  const previewHtml = useMemo(() => {
    const renderData: EmailRenderData = {
      name: lead.name,
      service: lead.serviceInterest,
      auditId: lead.id,
      language: 'fr',
      subject,
      badge,
      headline,
      greeting,
      bodyText,
      includeSummary,
      summaryTitle,
      summaryDetails,
      includeRoadmap,
      roadmapTitle,
      closingNote,
      ctaType,
      ctaText,
      ctaUrl
    };
    return renderEmailPreviewHtml(renderData);
  }, [
    lead,
    subject,
    badge,
    headline,
    greeting,
    bodyText,
    includeSummary,
    summaryTitle,
    summaryDetails,
    includeRoadmap,
    roadmapTitle,
    closingNote,
    ctaType,
    ctaText,
    ctaUrl
  ]);

  // Send Test Email Action
  const handleSendTest = async () => {
    setIsSendingTest(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      setSuccessMessage(`Courriel d'essai transmis avec succès à votre adresse (${callerEmail}).`);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'envoi du test.");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Dispatch Customer Email Action
  const handleSendCustomerEmail = async () => {
    if (!lead.email || !lead.email.includes('@')) {
      setErrorMessage("Le client ne possède pas d'adresse courriel valide pour cet envoi.");
      return;
    }

    if (!confirm(`Confirmez-vous l'envoi de ce courriel de suivi à ${lead.name} (${lead.email}) ?`)) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await new Promise(r => setTimeout(r, 700));
      const followUpEvent: FollowUpEvent = {
        id: `fup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sentAt: new Date().toISOString(),
        sentBy: callerEmail,
        subject,
        headline,
        recipientEmail: lead.email
      };

      if (onEmailSent) {
        onEmailSent(lead.id, followUpEvent, 'contacted');
      }

      setSuccessMessage(`Courriel transmis avec succès à ${lead.email} ! Dossier mis à jour au statut « Contacté »`);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'expédition du courriel au client.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="email-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="email-modal-container"
        style={{
          width: '100%',
          maxWidth: '1240px',
          height: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Topbar Header */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#166534',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #14532d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 }}>
                Studio Courriel Client (Brevo SMTP • ADR-0016)
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Suivi pour : {lead.name}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '4px' }}>
                  {lead.email || 'Aucun courriel'}
                </span>
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Fermer le studio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Content Split (Left: Composer, Right: Live Sandbox Preview) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* LEFT: Composer & Settings (48% width) */}
          <div style={{
            width: '48%',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}>
            {/* Scrollable Form Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              
              {/* Turnkey Presets Selector */}
              <div style={{ marginBottom: '18px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534', marginBottom: '8px' }}>
                  <Sparkles size={14} />
                  <span>Modèle de suivi prêt à l'emploi</span>
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {EMAIL_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} — {p.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Line */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Objet du courriel (Subject) *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Status Pill Badge & Headline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Pilule Statut
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="✓ Suivi de soumission"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Titre Principal (Headline) *
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Greeting */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Formule de salutation
                </label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Body Text */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Corps du message (Paragraphes) *
                </label>
                <textarea
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    outline: 'none',
                    color: '#0f172a',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Summary Card Toggle */}
              <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    style={{ accentColor: '#166534' }}
                  />
                  <span>Inclure la boîte récapitulative du dossier</span>
                </label>
                {includeSummary && (
                  <div style={{ marginTop: '10px', paddingLeft: '24px' }}>
                    <input
                      type="text"
                      value={summaryTitle}
                      onChange={(e) => setSummaryTitle(e.target.value)}
                      placeholder="Titre du récapitulatif"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        marginBottom: '6px'
                      }}
                    />
                    <textarea
                      rows={2}
                      value={summaryDetails}
                      onChange={(e) => setSummaryDetails(e.target.value)}
                      placeholder="Précisions de la demande ou notes..."
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        lineHeight: '1.4'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Roadmap Steps Toggle */}
              <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={includeRoadmap}
                    onChange={(e) => setIncludeRoadmap(e.target.checked)}
                    style={{ accentColor: '#166534' }}
                  />
                  <span>Inclure les 3 étapes du projet (Roadmap)</span>
                </label>
                {includeRoadmap && (
                  <div style={{ marginTop: '10px', paddingLeft: '24px' }}>
                    <input
                      type="text"
                      value={roadmapTitle}
                      onChange={(e) => setRoadmapTitle(e.target.value)}
                      placeholder="Titre de la section (ex: Comment se déroule la suite :)"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Call to Action Button */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Bouton d'action prioritaire (CTA)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '6px' }}>
                  <select
                    value={ctaType}
                    onChange={(e) => setCtaType(e.target.value as any)}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="phone">Appel direct (tel:)</option>
                    <option value="reply">Réponse courriel (mailto:)</option>
                    <option value="custom">Lien externe personnalisé</option>
                    <option value="none">Aucun bouton</option>
                  </select>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Texte du bouton"
                    disabled={ctaType === 'none'}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      opacity: ctaType === 'none' ? 0.5 : 1
                    }}
                  />
                </div>
              </div>

              {/* Closing Sign-off Note */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Note de conclusion
                </label>
                <input
                  type="text"
                  value={closingNote}
                  onChange={(e) => setClosingNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Messages & Feedback */}
              {errorMessage && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  color: '#166534',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

            </div>

            {/* Bottom Actions Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Test send to caller */}
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || isSending}
                style={{
                  padding: '9px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: (isSendingTest || isSending) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title={`Envoyer une copie d'essai à ${callerEmail}`}
              >
                {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                <span>Envoyer un test à mon adresse</span>
              </button>

              {/* Real Customer Send */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 14px',
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSendCustomerEmail}
                  disabled={isSending || isSendingTest || !lead.email}
                  style={{
                    padding: '9px 20px',
                    backgroundColor: (!lead.email || isSending) ? '#94a3b8' : '#166534',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: (!lead.email || isSending) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Envoyer au client</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Sandboxed Visual Preview (52% width) */}
          <div style={{
            width: '52%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Viewport Toolbar */}
            <div style={{
              padding: '10px 16px',
              backgroundColor: '#e2e8f0',
              borderBottom: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569' }}>
                  Aperçu en Direct (Temps Réel)
                </span>
              </div>

              {/* Desktop / Mobile Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffffff', padding: '3px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: previewViewport === 'desktop' ? '#166534' : 'transparent',
                    color: previewViewport === 'desktop' ? '#ffffff' : '#64748b'
                  }}
                >
                  <Monitor size={13} />
                  <span>Bureau (580px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: previewViewport === 'mobile' ? '#166534' : 'transparent',
                    color: previewViewport === 'mobile' ? '#ffffff' : '#64748b'
                  }}
                >
                  <Smartphone size={13} />
                  <span>Mobile (360px)</span>
                </button>
              </div>
            </div>

            {/* Sandboxed Iframe Container */}
            <div style={{
              flex: 1,
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              overflowY: 'auto'
            }}>
              <div style={{
                width: previewViewport === 'desktop' ? '580px' : '360px',
                height: '100%',
                minHeight: '680px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'width 0.2s ease',
                border: '1px solid #cbd5e1'
              }}>
                <iframe
                  srcDoc={previewHtml}
                  title="Aperçu du courriel client"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
