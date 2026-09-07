import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Archive, 
  Search, 
  ChevronRight, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar,
  Users
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

export const CrmModule: React.FC<CrmModuleProps> = ({ adapter, globalSearchQuery }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, vaultData] = await Promise.all([
        adapter.getLeads(),
        adapter.getVaultEntries()
      ]);
      setLeads(leadsData);
      setVaultEntries(vaultData);
    } finally {
      setIsLoading(false);
    }
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
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const updated = await adapter.updateLead(id, { notes });
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    if (selectedLead?.id === id) setSelectedLead(updated);
  };

  const handleDeleteLead = async (id: string) => {
    const vault = await adapter.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setVaultEntries(prev => [vault, ...prev]);
  };

  const handleRestoreVault = async (vaultId: string) => {
    const success = await adapter.restoreVaultEntry(vaultId);
    if (success) {
      loadData();
    }
  };

  const handleCreateLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await adapter.createLead(leadData);
    setLeads(prev => [created, ...prev]);
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

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar & Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <SpatialContainer>
          <div style={{ padding: '16px' }}>
            <span className="form-label">Total Inquiries</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)' }}>
              {stats.totalCount}
            </div>
          </div>
        </SpatialContainer>
        <SpatialContainer>
          <div style={{ padding: '16px' }}>
            <span className="form-label">Active Pipeline</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)' }}>
              ${stats.totalValue.toLocaleString()} CAD
            </div>
          </div>
        </SpatialContainer>
        <SpatialContainer>
          <div style={{ padding: '16px' }}>
            <span className="form-label">Unread / New</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--signal-info)' }}>
              {stats.newCount}
            </div>
          </div>
        </SpatialContainer>
        <SpatialContainer>
          <div style={{ padding: '16px' }}>
            <span className="form-label">Deals Closed</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--signal-live)' }}>
              {stats.wonCount}
            </div>
          </div>
        </SpatialContainer>
      </div>

      {/* Main Table Container */}
      <SpatialContainer
        title="Inbound Inquiries & Pipeline"
        badge={`${filteredLeads.length} record${filteredLeads.length === 1 ? '' : 's'}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setIsVaultOpen(true)} className="btn-secondary" title="View soft-deleted records">
              <Archive size={14} />
              <span>Corbeille ({vaultEntries.length})</span>
            </button>
            <button onClick={() => setIsNewLeadOpen(true)} className="btn-primary">
              <Plus size={14} />
              <span>New Lead</span>
            </button>
          </div>
        }
      >
        {/* Status Filter Bar */}
        <div
          style={{
            padding: '12px 16px',
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
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '14px' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Content Table or Empty State */}
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={statusFilter === 'all' ? 'No Customer Inquiries Yet' : `No inquiries with status '${statusFilter}'`}
            description="All public web submissions, RFQs, and manual intake inquiries will appear in this centralized CRM table."
            actionLabel="Add First Lead"
            onAction={() => setIsNewLeadOpen(true)}
          />
        ) : (
          <div className="data-table-container" style={{ border: 'none' }}>
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
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onSubmit={handleCreateLead}
      />
    </div>
  );
};
