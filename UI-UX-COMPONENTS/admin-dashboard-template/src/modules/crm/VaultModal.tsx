import React from 'react';
import { X, RotateCcw, Trash2, Archive } from 'lucide-react';
import { VaultEntry } from '../../types/crm';
import { EmptyState } from '../../layout/EmptyState';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: VaultEntry[];
  onRestore: (vaultId: string) => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  entries,
  onRestore
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Archive size={16} style={{ color: 'var(--color-ink)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Corbeille / Soft-Delete Vault</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {entries.length === 0 ? (
            <EmptyState
              icon={Trash2}
              title="Corbeille is Empty"
              description="Deleted records are stored here for safe rollback and undo restoration."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{entry.summary}</div>
                    <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '2px' }}>
                      Deleted at {new Date(entry.deletedAt).toLocaleString()} • Type: {entry.entityType}
                    </div>
                  </div>
                  <button
                    onClick={() => onRestore(entry.id)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                  >
                    <RotateCcw size={12} />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--color-hairline)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--surface-recessed)'
          }}
        >
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
