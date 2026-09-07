import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Archive, 
  ChevronRight, 
  Users, 
  LayoutGrid, 
  List, 
  ArrowRight 
} from 'lucide-react';
import { IAdminStorageAdapter } from '../../types/adapter';
import { Lead, LeadStatus, VaultEntry } from '../../types/crm';
import { LeadDrawer } from './LeadDrawer';
import { VaultModal } from './VaultModal';
import { NewLeadModal } from './NewLeadModal';
import { EmptyState } from '../../layout/EmptyState';
import { SpatialContainer } from '../../layout/SpatialContainer';

interface CrmModuleProps {
  adapter: IAdminStorageAdapter;
  globalSearchQuery: string;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  isNewLeadModalOpenExternal?: boolean;
  onCloseNewLeadModalExternal?: () => void;
}

const STATUS_PILLS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Inquiries' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won' },
  { key: 'archived', label: 'Archived' }
];

const KANBAN_COLUMNS: { key: LeadStatus; label: string; badgeClass: string }[] = [
  { key: 'new', label: 'New Inquiries', badgeClass: 'badge-info' },
  { key: 'contacted', label: 'Contacted', badgeClass: 'badge-neutral' },
  { key: 'quoted', label: 'Quote Issued', badgeClass: 'badge-risk' },
  { key: 'negotiation', label: 'Negotiation', badgeClass: 'badge-neutral' },
  { key: 'won', label: 'Deals Won', badgeClass: 'badge-live' }
];

export const CrmModule: React.FC<CrmModuleProps> = ({ 
  adapter, 
  globalSearchQuery,
  onShowToast,
  isNewLeadModalOpenExternal,
  onCloseNewLeadModalExternal
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const effectiveNewLeadOpen = isNewLeadModalOpenExternal || isNewLeadOpen;

  const loadData = async () => {
    const [leadsData, vaultData] = await Promise.all([
      adapter.getLeads(),
      adapter.getVaultEntries()
    ]);
    setLeads(leadsData);
    setVaultEntries(vaultData);
  };

  useEffect(() => {
    loadData();
  }, [adapter]);

  // Filter logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const query = globalSearchQuery.toLowerCase();
      const matchesQuery = !query || 
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.serviceInterest.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [leads, statusFilter, globalSearchQuery]);

  // Metrics rollups
  const stats = useMemo(() => {
    const totalCount = leads.length;
    const totalValue = leads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
    const newCount = leads.filter(l => l.status === 'new').length;
    const wonCount = leads.filter(l => l.status === 'won').length;
    return { totalCount, totalValue, newCount, wonCount };
  }, [leads]);

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    const updated = await adapter.updateLead(id, { status });
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    if (selectedLead?.id === id) setSelectedLead(updated);
    onShowToast(`Lead advanced to ${status}`, 'info');
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const updated = await adapter.updateLead(id, { notes });
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    if (selectedLead?.id === id) setSelectedLead(updated);
    onShowToast('Notes updated successfully', 'success');
  };

  const handleDeleteLead = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    const vault = await adapter.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setVaultEntries(prev => [vault, ...prev]);
    onShowToast(`Moved ${lead?.name || 'lead'} to Corbeille vault`, 'info');
  };

  const handleRestoreVault = async (vaultId: string) => {
    const success = await adapter.restoreVaultEntry(vaultId);
    if (success) {
      await loadData();
      onShowToast('Record restored from vault', 'success');
    }
  };

  const handleCreateLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await adapter.createLead(leadData);
    setLeads(prev => [created, ...prev]);
    onShowToast(`Inquiry created for ${created.name}`, 'success');
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new': return <span className="badge badge-info">New</span>;
      case 'contacted': return <span className="badge badge-neutral">Contacted</span>;
      case 'quoted': return <span className="badge badge-risk">Quoted</span>;
      case 'negotiation': return <span className="badge badge-neutral">Negotiation</span>;
      case 'won': return <span className="badge badge-live">Won</span>;
      case 'archived': return <span className="badge badge-danger">Archived</span>;
    }
  };

  const getNextStatus = (current: LeadStatus): LeadStatus | null => {
    switch (current) {
      case 'new': return 'contacted';
      case 'contacted': return 'quoted';
      case 'quoted': return 'negotiation';
      case 'negotiation': return 'won';
      default: return null;
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Action Bar & Stat Cards with Sparkline Visuals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <SpatialContainer>
          <div style={{ padding: '18px' }}>
            <span className="form-label">Total Inquiries</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>
                {stats.totalCount}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>All sources</span>
            </div>
          </div>
        </SpatialContainer>
        <SpatialContainer>
          <div style={{ padding: '18px' }}>
            <span className="form-label">Pipeline Value</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>
                ${stats.totalValue.toLocaleString()}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--signal-live)', fontWeight: 600 }}>CAD gross</span>
            </div>
          </div>
        </SpatialContainer>
        <SpatialContainer>
          <div style={{ padding: '18px' }}>
            <span className="form-label">Awaiting Triage</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--signal-info)' }}>
                {stats.newCount}
              </div>
              <span className="badge badge-info" style={{ fontSize: '9px' }}>Action required</span>
            </div>
          </div>
        </SpatialContainer>
        <SpatialContainer>
          <div style={{ padding: '18px' }}>
            <span className="form-label">Deals Closed</span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--signal-live)' }}>
                {stats.wonCount}
              </div>
              <span className="badge badge-live" style={{ fontSize: '9px' }}>Won</span>
            </div>
          </div>
        </SpatialContainer>
      </div>

      {/* Main Table or Kanban Container */}
      <SpatialContainer
        title="Inbound Inquiries & Client Pipeline"
        badge={`${filteredLeads.length} record${filteredLeads.length === 1 ? '' : 's'}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Mode Switcher */}
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-control-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table List View"
              >
                <List size={13} />
                <span>Table</span>
              </button>
              <button
                type="button"
                className={`segmented-control-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <LayoutGrid size={13} />
                <span>Kanban</span>
              </button>
            </div>

            <button onClick={() => setIsVaultOpen(true)} className="btn-secondary" title="View soft-deleted records">
              <Archive size={14} />
              <span>Vault ({vaultEntries.length})</span>
            </button>
            <button onClick={() => setIsNewLeadOpen(true)} className="btn-primary">
              <Plus size={14} />
              <span>New Inquiry</span>
            </button>
          </div>
        }
      >
        {/* Status Filter Bar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-recessed)'
          }}
        >
          {STATUS_PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setStatusFilter(p.key)}
              className={statusFilter === p.key ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '5px 12px', fontSize: '11px', borderRadius: '16px' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Content View: Table vs Kanban */}
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={statusFilter === 'all' ? 'No Customer Inquiries' : `No inquiries matching '${statusFilter}'`}
            description="Client intake forms, RFQs, and manual inquiries appear in this centralized pipeline."
            actionLabel="Intake First Client"
            onAction={() => setIsNewLeadOpen(true)}
          />
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div
            style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              alignItems: 'flex-start',
              overflowX: 'auto',
              minHeight: '400px',
              backgroundColor: 'var(--surface-canvas)'
            }}
          >
            {KANBAN_COLUMNS.map((col) => {
              const colLeads = filteredLeads.filter(l => l.status === col.key);
              return (
                <div
                  key={col.key}
                  style={{
                    backgroundColor: 'var(--surface-recessed)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-hairline)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-hairline)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {col.label}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      {colLeads.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {colLeads.map((lead) => {
                      const next = getNextStatus(lead.status);
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          style={{
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--color-hairline)',
                            borderRadius: '6px',
                            padding: '12px',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'transform 0.15s ease, border-color 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-ink)' }}>
                            {lead.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)', marginTop: '2px' }}>
                            {lead.serviceInterest}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--color-hairline-subtle)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '12px' }}>
                              ${lead.estimatedValue.toLocaleString()}
                            </span>
                            {next && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(lead.id, next);
                                }}
                                className="btn-ghost"
                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                title={`Advance to ${next}`}
                              >
                                <span>Advance</span>
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client / Contact</th>
                  <th>Service Requested</th>
                  <th>Estimated Value</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{lead.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>{lead.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{lead.serviceInterest}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ${lead.estimatedValue.toLocaleString()} CAD
                      </span>
                    </td>
                    <td>{getStatusBadge(lead.status)}</td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--brand-text-secondary)' }}>
                        {lead.source}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="btn-ghost"
                        style={{ padding: '4px 8px' }}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpatialContainer>

      {/* Modals and Drawers */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateNotes={handleUpdateNotes}
        onDelete={handleDeleteLead}
      />

      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        entries={vaultEntries}
        onRestore={handleRestoreVault}
      />

      <NewLeadModal
        isOpen={effectiveNewLeadOpen}
        onClose={() => {
          setIsNewLeadOpen(false);
          onCloseNewLeadModalExternal?.();
        }}
        onSubmit={handleCreateLead}
      />
    </div>
  );
};
