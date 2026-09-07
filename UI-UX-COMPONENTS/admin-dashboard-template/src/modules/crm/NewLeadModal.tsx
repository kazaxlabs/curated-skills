import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Lead, LeadStatus } from '../../types/crm';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceInterest, setServiceInterest] = useState('Turnkey Architectural Renovation');
  const [estimatedValue, setEstimatedValue] = useState<number>(5000);
  const [status, setStatus] = useState<LeadStatus>('new');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSubmit({
      name,
      email,
      phone,
      serviceInterest,
      estimatedValue: Number(estimatedValue) || 0,
      status,
      message,
      notes,
      source: 'Manual Admin Intake'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Intake New Client Lead</h3>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jean Tremblay"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(514) 000-0000"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Service Interest</label>
              <input
                type="text"
                className="form-input"
                value={serviceInterest}
                onChange={(e) => setServiceInterest(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Budget / Value ($ CAD)</label>
              <input
                type="number"
                className="form-input"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Inquiry Message</label>
            <textarea
              className="form-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Summary of requirements..."
            />
          </div>

          <div
            style={{
              padding: '12px 0 0 0',
              borderTop: '1px solid var(--color-hairline)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={14} />
              <span>Create Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
