import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  Database 
} from 'lucide-react';
import { IAdminStorageAdapter } from '../../types/adapter';
import { ConsentRecord, BackupSnapshot } from '../../types/security';
import { ErasureModal } from './ErasureModal';
import { EmptyState } from '../../layout/EmptyState';
import { SpatialContainer } from '../../layout/SpatialContainer';

interface SecurityModuleProps {
  adapter: IAdminStorageAdapter;
  globalSearchQuery: string;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  isBackupModalOpenExternal?: boolean;
}

export const SecurityModule: React.FC<SecurityModuleProps> = ({ 
  adapter, 
  globalSearchQuery,
  onShowToast 
}) => {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [isErasureOpen, setIsErasureOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const loadData = async () => {
    const [cData, sData] = await Promise.all([
      adapter.getConsentRecords(),
      adapter.getSnapshots()
    ]);
    setConsents(cData);
    setSnapshots(sData);
  };

  useEffect(() => {
    loadData();
  }, [adapter]);

  const handleExportCsv = async () => {
    const csvContent = await adapter.exportConsentCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `law25_consent_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Audit CSV exported to downloads', 'success');
  };

  const handleExecuteErasure = async (email: string) => {
    const result = await adapter.requestErasure(email);
    await loadData();
    onShowToast(`Permanently erased ${result.recordsWipedCount} records for ${email}`, 'info');
  };

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const snap = await adapter.triggerBackup();
      setSnapshots(prev => [snap, ...prev]);
      onShowToast(`System snapshot ${snap.id} created`, 'success');
    } finally {
      setIsBackingUp(false);
    }
  };

  const filteredConsents = consents.filter(c => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return c.email.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Compliance Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--surface-card)',
          borderRadius: '10px',
          border: '1px solid var(--color-hairline)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--signal-live-bg)',
              color: 'var(--signal-live)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
              Quebec Law 25 (Bill 64) & GDPR Governance Engine
            </div>
            <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '2px' }}>
              Append-only consent tracking, retention timers, and verified client PII destruction.
            </div>
          </div>
        </div>

        <span className="badge badge-live" style={{ fontSize: '10px' }}>
          100% COMPLIANT POSTURE
        </span>
      </div>

      {/* Main Consent Register */}
      <SpatialContainer
        title="Consent Register & Data Retention Log"
        badge={`${filteredConsents.length} record${filteredConsents.length === 1 ? '' : 's'}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportCsv}
              disabled={filteredConsents.length === 0}
              className="btn-secondary"
              style={{ fontSize: '12px', opacity: filteredConsents.length === 0 ? 0.4 : 1 }}
            >
              <Download size={14} />
              <span>Export Audit CSV</span>
            </button>
            <button
              onClick={() => setIsErasureOpen(true)}
              className="btn-danger"
              style={{ fontSize: '12px' }}
            >
              <Trash2 size={14} />
              <span>Right to Erasure</span>
            </button>
          </div>
        }
      >
        {filteredConsents.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Consent Register Empty"
            description="Immutable records of user consent, CASL opt-ins, and data retention deadlines are logged here in accordance with Quebec Law 25."
          />
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client / Email</th>
                  <th>Service Context</th>
                  <th>Law 25 Consent</th>
                  <th>CASL Marketing Opt-in</th>
                  <th>Masked IP Address</th>
                  <th>Retention Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsents.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.fullName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>{c.email}</div>
                    </td>
                    <td>{c.serviceRequested}</td>
                    <td>
                      <span className="badge badge-live">Verified</span>
                    </td>
                    <td>
                      <span className={`badge ${c.caslOptIn ? 'badge-info' : 'badge-neutral'}`}>
                        {c.caslOptIn ? 'Opted In' : 'Declined'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {c.ipAddressMasked}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>
                      {new Date(c.retentionExpiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpatialContainer>

      {/* Backup & System Snapshots Container */}
      <SpatialContainer
        title="Disaster Recovery & Point-in-Time Snapshots"
        badge={`${snapshots.length} available`}
        actions={
          <button
            onClick={handleTriggerBackup}
            disabled={isBackingUp}
            className="btn-primary"
            style={{ fontSize: '12px' }}
          >
            <Database size={14} />
            <span>{isBackingUp ? 'Archiving...' : 'Take Manual Snapshot'}</span>
          </button>
        }
      >
        {snapshots.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No Snapshots Recorded"
            description="Trigger on-demand backups or schedule automatic cloud storage exports to maintain audit continuity."
            actionLabel="Create First Snapshot"
            onAction={handleTriggerBackup}
            actionIcon={Database}
          />
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Snapshot ID</th>
                  <th>Creation Timestamp</th>
                  <th>Collections Archived</th>
                  <th>Record Volume</th>
                  <th>Archive Status</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap) => (
                  <tr key={snap.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {snap.id}
                    </td>
                    <td>
                      {new Date(snap.timestamp).toLocaleString()}
                    </td>
                    <td>{snap.collectionsCount} collections</td>
                    <td>{snap.totalRecords} records</td>
                    <td>
                      <span className="badge badge-live">Ready</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpatialContainer>

      {/* Erasure Modal */}
      <ErasureModal
        isOpen={isErasureOpen}
        onClose={() => setIsErasureOpen(false)}
        onConfirm={handleExecuteErasure}
      />
    </div>
  );
};
