import { IAdminStorageAdapter } from '../types/adapter';
import { Lead, VaultEntry } from '../types/crm';
import { CmsCollection, CmsItem } from '../types/cms';
import { KpiCardData, KeywordRank, SearchConsoleMetric } from '../types/analytics';
import { ConsentRecord, ErasureRequest, BackupSnapshot } from '../types/security';
import { StaffUser, PermissionSet } from '../types/staff';
import {
  DEMO_LEADS,
  DEMO_VAULT,
  DEMO_COLLECTIONS,
  DEMO_CMS_ITEMS,
  DEMO_KPIS,
  DEMO_KEYWORDS,
  DEMO_SEARCH_CONSOLE,
  DEMO_CONSENTS,
  DEMO_SNAPSHOTS,
  DEMO_STAFF
} from './fixtures';

const DEFAULT_BLANK_COLLECTIONS: CmsCollection[] = [
  {
    id: 'services',
    name: 'Services & Offerings',
    singularName: 'Service',
    description: 'Public catalogue of turnkey services with descriptions, deliverables, and rates.',
    fields: [
      { key: 'title', label: 'Service Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'priceRange', label: 'Price Range / Estimate', type: 'text' },
      { key: 'description', label: 'Overview Description', type: 'textarea' }
    ]
  },
  {
    id: 'portfolio',
    name: 'Project Portfolio',
    singularName: 'Project',
    description: 'High-resolution project case studies and completed client engagements.',
    fields: [
      { key: 'title', label: 'Project Name', type: 'text', required: true },
      { key: 'location', label: 'Location (City / Region)', type: 'text' },
      { key: 'year', label: 'Completion Year', type: 'number' },
      { key: 'imageUrl', label: 'Hero Image URL', type: 'image' }
    ]
  }
];

const DEFAULT_BLANK_USER: StaffUser = {
  id: 'current_user',
  email: 'operator@kazaxlabs.com',
  name: 'System Operator',
  role: 'owner',
  isActive: true,
  permissions: {
    canManageLeads: true,
    canExportData: true,
    canEditCMS: true,
    canManageSecurity: true,
    canManageStaff: true
  },
  invitedAt: new Date().toISOString()
};

export class MockStorageAdapter implements IAdminStorageAdapter {
  private demoMode: boolean = false;
  
  // In-memory data stores
  private leads: Lead[] = [];
  private vault: VaultEntry[] = [];
  private collections: CmsCollection[] = DEFAULT_BLANK_COLLECTIONS;
  private cmsItems: Record<string, CmsItem[]> = { services: [], portfolio: [] };
  private kpis: KpiCardData[] = [];
  private keywords: KeywordRank[] = [];
  private searchConsole: SearchConsoleMetric = {
    totalClicks: 0,
    totalImpressions: 0,
    averageCtr: 0,
    averagePosition: 0,
    dateRange: 'Unconnected',
    isSynced: false
  };
  private consents: ConsentRecord[] = [];
  private snapshots: BackupSnapshot[] = [];
  private staffUsers: StaffUser[] = [DEFAULT_BLANK_USER];
  private listeners: Array<() => void> = [];

  constructor() {
    this.resetState();
  }

  private resetState() {
    if (this.demoMode) {
      this.leads = [...DEMO_LEADS];
      this.vault = [...DEMO_VAULT];
      this.collections = [...DEMO_COLLECTIONS];
      this.cmsItems = JSON.parse(JSON.stringify(DEMO_CMS_ITEMS));
      this.kpis = [...DEMO_KPIS];
      this.keywords = [...DEMO_KEYWORDS];
      this.searchConsole = { ...DEMO_SEARCH_CONSOLE };
      this.consents = [...DEMO_CONSENTS];
      this.snapshots = [...DEMO_SNAPSHOTS];
      this.staffUsers = [...DEMO_STAFF];
    } else {
      this.leads = [];
      this.vault = [];
      this.collections = DEFAULT_BLANK_COLLECTIONS;
      this.cmsItems = { services: [], portfolio: [] };
      this.kpis = [];
      this.keywords = [];
      this.searchConsole = {
        totalClicks: 0,
        totalImpressions: 0,
        averageCtr: 0,
        averagePosition: 0,
        dateRange: 'Unconnected',
        isSynced: false
      };
      this.consents = [];
      this.snapshots = [];
      this.staffUsers = [DEFAULT_BLANK_USER];
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // =========================================================================
  // Mode toggle
  // =========================================================================
  public isDemoFixturesEnabled(): boolean {
    return this.demoMode;
  }

  public setDemoFixturesEnabled(enabled: boolean): void {
    this.demoMode = enabled;
    this.resetState();
    this.notify();
  }

  // =========================================================================
  // CRM Methods
  // =========================================================================
  async getLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.leads.unshift(newLead);
    this.notify();
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error(`Lead ${id} not found`);
    this.leads[index] = {
      ...this.leads[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.notify();
    return this.leads[index];
  }

  async deleteLead(id: string, reason = 'Operator deleted lead'): Promise<VaultEntry> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error(`Lead ${id} not found`);
    const lead = this.leads[index];
    this.leads.splice(index, 1);

    const vaultEntry: VaultEntry = {
      id: `vault_${Date.now()}`,
      originalId: lead.id,
      entityType: 'lead',
      deletedAt: new Date().toISOString(),
      summary: `${lead.name} (${lead.serviceInterest}) — ${reason}`,
      data: lead as unknown as Record<string, unknown>
    };
    this.vault.unshift(vaultEntry);
    this.notify();
    return vaultEntry;
  }

  async getVaultEntries(): Promise<VaultEntry[]> {
    return [...this.vault];
  }

  async restoreVaultEntry(vaultId: string): Promise<boolean> {
    const index = this.vault.findIndex(v => v.id === vaultId);
    if (index === -1) return false;
    const entry = this.vault[index];
    if (entry.entityType === 'lead') {
      this.leads.unshift(entry.data as unknown as Lead);
    }
    this.vault.splice(index, 1);
    this.notify();
    return true;
  }

  // =========================================================================
  // CMS Methods
  // =========================================================================
  async getCollections(): Promise<CmsCollection[]> {
    return [...this.collections];
  }

  async getItems(collectionId: string): Promise<CmsItem[]> {
    return [...(this.cmsItems[collectionId] || [])].sort((a, b) => a.order - b.order);
  }

  async saveItem(item: Omit<CmsItem, 'id' | 'updatedAt'> & { id?: string }): Promise<CmsItem> {
    const collId = item.collectionId;
    if (!this.cmsItems[collId]) this.cmsItems[collId] = [];

    if (item.id) {
      const idx = this.cmsItems[collId].findIndex(i => i.id === item.id);
      if (idx !== -1) {
        this.cmsItems[collId][idx] = {
          ...this.cmsItems[collId][idx],
          ...item,
          updatedAt: new Date().toISOString()
        } as CmsItem;
        this.notify();
        return this.cmsItems[collId][idx];
      }
    }

    const newItem: CmsItem = {
      id: item.id || `item_${Date.now()}`,
      collectionId: collId,
      order: item.order ?? this.cmsItems[collId].length,
      title: item.title,
      slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: item.status || 'published',
      metadata: item.metadata || {},
      updatedAt: new Date().toISOString()
    };
    this.cmsItems[collId].push(newItem);
    this.notify();
    return newItem;
  }

  async reorderItems(collectionId: string, itemIds: string[]): Promise<void> {
    if (!this.cmsItems[collectionId]) return;
    const itemMap = new Map(this.cmsItems[collectionId].map(item => [item.id, item]));
    const reordered: CmsItem[] = [];
    itemIds.forEach((id, index) => {
      const item = itemMap.get(id);
      if (item) {
        reordered.push({ ...item, order: index });
      }
    });
    this.cmsItems[collectionId] = reordered;
    this.notify();
  }

  async deleteItem(collectionId: string, itemId: string): Promise<void> {
    if (!this.cmsItems[collectionId]) return;
    this.cmsItems[collectionId] = this.cmsItems[collectionId].filter(i => i.id !== itemId);
    // Renumber remaining
    this.cmsItems[collectionId] = this.cmsItems[collectionId].map((item, idx) => ({
      ...item,
      order: idx
    }));
    this.notify();
  }

  // =========================================================================
  // Analytics & SEO Methods
  // =========================================================================
  async getKpiCards(): Promise<KpiCardData[]> {
    return [...this.kpis];
  }

  async getKeywordRanks(): Promise<KeywordRank[]> {
    return [...this.keywords];
  }

  async getSearchConsoleData(): Promise<SearchConsoleMetric> {
    return { ...this.searchConsole };
  }

  async syncAnalytics(): Promise<void> {
    // Simulated remote fetch
    if (this.demoMode) {
      this.searchConsole = {
        ...DEMO_SEARCH_CONSOLE,
        isSynced: true
      };
      this.keywords = [...DEMO_KEYWORDS];
      this.kpis = [...DEMO_KPIS];
    } else {
      this.searchConsole = {
        totalClicks: 0,
        totalImpressions: 0,
        averageCtr: 0,
        averagePosition: 0,
        dateRange: 'Sync Complete (0 Records)',
        isSynced: true
      };
    }
    this.notify();
  }

  // =========================================================================
  // Security & Law 25 Methods
  // =========================================================================
  async getConsentRecords(): Promise<ConsentRecord[]> {
    return [...this.consents];
  }

  async exportConsentCsv(): Promise<string> {
    const headers = ['id', 'email', 'fullName', 'serviceRequested', 'law25Consent', 'caslOptIn', 'timestamp'];
    const rows = this.consents.map(c => [
      c.id,
      c.email,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.serviceRequested.replace(/"/g, '""')}"`,
      c.law25Consent ? 'YES' : 'NO',
      c.caslOptIn ? 'YES' : 'NO',
      c.timestamp
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  async requestErasure(email: string): Promise<ErasureRequest> {
    const normalized = email.trim().toLowerCase();
    const leadsToRemove = this.leads.filter(l => l.email.toLowerCase() === normalized).length;
    this.leads = this.leads.filter(l => l.email.toLowerCase() !== normalized);
    this.consents = this.consents.filter(c => c.email.toLowerCase() !== normalized);
    
    const request: ErasureRequest = {
      id: `ers_${Date.now()}`,
      email: normalized,
      requestedAt: new Date().toISOString(),
      status: 'completed',
      recordsWipedCount: leadsToRemove,
      completedAt: new Date().toISOString(),
      auditSignature: `SHA256:${Math.random().toString(36).substring(2, 15)}`
    };
    this.notify();
    return request;
  }

  async getSnapshots(): Promise<BackupSnapshot[]> {
    return [...this.snapshots];
  }

  async triggerBackup(): Promise<BackupSnapshot> {
    const snapshot: BackupSnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      collectionsCount: Object.keys(this.cmsItems).length + 3,
      totalRecords: this.leads.length + this.consents.length + Object.values(this.cmsItems).flat().length,
      status: 'available',
      downloadUrl: '#'
    };
    this.snapshots.unshift(snapshot);
    this.notify();
    return snapshot;
  }

  // =========================================================================
  // Staff & RBAC Methods
  // =========================================================================
  async getStaffUsers(): Promise<StaffUser[]> {
    return [...this.staffUsers];
  }

  async inviteStaff(
    email: string,
    name: string,
    role: StaffUser['role'],
    permissions: PermissionSet
  ): Promise<StaffUser> {
    const newUser: StaffUser = {
      id: `staff_${Date.now()}`,
      email,
      name,
      role,
      isActive: true,
      permissions,
      invitedAt: new Date().toISOString()
    };
    this.staffUsers.push(newUser);
    this.notify();
    return newUser;
  }

  async updateStaffPermissions(id: string, permissions: Partial<PermissionSet>): Promise<StaffUser> {
    const idx = this.staffUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`Staff user ${id} not found`);
    this.staffUsers[idx].permissions = {
      ...this.staffUsers[idx].permissions,
      ...permissions
    };
    this.notify();
    return this.staffUsers[idx];
  }

  async toggleStaffStatus(id: string, isActive: boolean): Promise<StaffUser> {
    const idx = this.staffUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`Staff user ${id} not found`);
    this.staffUsers[idx].isActive = isActive;
    this.notify();
    return this.staffUsers[idx];
  }
}

// Singleton export
export const defaultStorageAdapter = new MockStorageAdapter();
