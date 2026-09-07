import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  DollarSign, 
  Tag, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Lead, LeadStatus } from '../../types/crm';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

const ALL_STATUSES: { key: LeadStatus; label: string; badgeClass: string }[] = [
  { key: 'new', label: 'New Inquiry', badgeClass: 'badge-info' },
  { key: 'contacted', label: 'Contacted', badgeClass: 'badge-neutral' },
  { key: 'quoted', label: 'Quote Issued', badgeClass: 'badge-risk' },
  { key: 'negotiation', label: 'In Negotiation', badgeClass: 'badge-neutral' },
  { key: 'won', label: 'Deal Won', badgeClass: 'badge-live' },
  { key: 'archived', label: 'Archived', badgeClass: 'badge-danger' }
];

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onDelete
}) => {
  if (!lead) return null;

  const [notes, setNotes] = useState(lead.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    onUpdateNotes(lead.id, notes);
    setTimeout(() => setIsSavingNotes(false), 300);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: 'var(--brand-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Lead Inspector
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>
              {lead.name}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Status Selector */}
          <div className="form-group">
            <label className="form-label">Lifecycle Status</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALL_STATUSES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onUpdateStatus(lead.id, s.key)}
                  className={`badge ${s.badgeClass}`}
                  style={{
                    cursor: 'pointer',
                    opacity: lead.status === s.key ? 1 : 0.45,
                    border: lead.status === s.key ? '2px solid var(--color-ink)' : undefined
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details Card */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--surface-recessed)',
              borderRadius: '4px',
              border: '1px solid var(--color-hairline)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Mail size={14} style={{ color: 'var(--brand-text-secondary)' }} />
              <a href={`mailto:${lead.email}`} style={{ color: 'var(--color-ink)', textDecoration: 'none', fontWeight: 500 }}>
                {lead.email}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Phone size={14} style={{ color: 'var(--brand-text-secondary)' }} />
              <span>{lead.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} style={{ color: 'var(--brand-text-secondary)' }} />
              <span style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>
                Received {new Date(lead.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Service & Estimate */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ padding: '12px', border: '1px solid var(--color-hairline)', borderRadius: '4px' }}>
              <span className="form-label">Service Interest</span>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{lead.serviceInterest}</div>
            </div>
            <div style={{ padding: '12px', border: '1px solid var(--color-hairline)', borderRadius: '4px' }}>
              <span className="form-label">Est. Value</span>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--signal-live)' }}>
                ${lead.estimatedValue.toLocaleString()} CAD
              </div>
            </div>
          </div>

          {/* Client Message */}
          {lead.message && (
            <div className="form-group">
              <label className="form-label">Original Inquiry Message</label>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: 'var(--color-graphite)'
                }}
              >
                {lead.message}
              </div>
            </div>
          )}

          {/* Operational Notes */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Internal Operator Notes</label>
              <button
                onClick={handleSaveNotes}
                className="btn-ghost"
                style={{ fontSize: '11px', padding: '2px 6px' }}
                disabled={isSavingNotes}
              >
                <CheckCircle2 size={12} />
                {isSavingNotes ? 'Saved' : 'Save Notes'}
              </button>
            </div>
            <textarea
              className="form-input"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal call logs, follow-up deadlines, or client preferences..."
            />
          </div>

          {/* Mock Quote Generator Affordance */}
          <div
            style={{
              padding: '14px',
              border: '1px dashed var(--color-hairline)',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FileText size={16} style={{ color: 'var(--color-ink)' }} />
              <span style={{ fontWeight: 600, fontSize: '12px' }}>Document Engine (PDF Quote)</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginBottom: '10px' }}>
              Quebec tax calculations (5% TPS, 9.975% TVQ) and 50% deposit schedule can be attached here.
            </p>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <DollarSign size={14} />
              <span>Generate Draft Proposal (Template)</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <button
            onClick={() => {
              if (window.confirm('Move lead to the Corbeille vault?')) {
                onDelete(lead.id);
                onClose();
              }
            }}
            className="btn-danger"
          >
            <Trash2 size={14} />
            <span>Move to Vault</span>
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
