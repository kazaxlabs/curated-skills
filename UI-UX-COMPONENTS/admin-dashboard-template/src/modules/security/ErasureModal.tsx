import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ErasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
}

export const ErasureModal: React.FC<ErasureModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const canSubmit = email.trim().length > 0 && confirmText.trim().toUpperCase() === 'EFFACER';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(email.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--signal-danger-bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--signal-danger)' }}>
            <ShieldAlert size={18} />
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>
              Law 25 / GDPR Right to Erasure
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--signal-danger-bg)',
              border: '1px solid var(--signal-danger-border)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--signal-danger)',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Warning: Irreversible Data Destruction.</strong> This permanently purges all matching leads, inquiry messages, and consent records from the system.
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Client Email to Erase *</label>
            <input
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. client@domain.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type "EFFACER" to confirm *</label>
            <input
              type="text"
              className="form-input"
              required
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="EFFACER"
            />
          </div>

          <div
            style={{
              paddingTop: '14px',
              borderTop: '1px solid var(--color-hairline)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-danger"
              style={{ opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
              Confirm & Purge Records
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
