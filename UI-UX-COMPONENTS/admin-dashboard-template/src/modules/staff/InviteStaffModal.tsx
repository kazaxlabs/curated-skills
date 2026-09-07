import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { StaffRole, PermissionSet } from '../../types/staff';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, name: string, role: StaffRole, permissions: PermissionSet) => void;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('editor');
  const [permissions, setPermissions] = useState<PermissionSet>({
    canManageLeads: true,
    canExportData: false,
    canEditCMS: true,
    canManageSecurity: false,
    canManageStaff: false,
    canSendEmails: true
  });

  const togglePermission = (key: keyof PermissionSet) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onInvite(email.trim(), name.trim(), role, permissions);
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
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>
            Invite Team Member
          </h3>
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
              placeholder="e.g. Marc Tremblay"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@domain.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
            >
              <option value="owner">Owner (Full Sovereignty)</option>
              <option value="manager">Manager (Operational Approvals)</option>
              <option value="editor">Editor (CMS & Inquiries)</option>
              <option value="viewer">Viewer (Read-Only)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Granular UI Permissions</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Object.keys(permissions) as Array<keyof PermissionSet>).map((permKey) => (
                <label key={permKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={permissions[permKey]}
                    onChange={() => togglePermission(permKey)}
                  />
                  <span>{permKey}</span>
                </label>
              ))}
            </div>
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
            <button type="submit" className="btn-primary">
              <UserPlus size={14} />
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
