import { IAdminStorageAdapter } from '../types/adapter';
import { Lead, VaultEntry } from '../types/crm';
import { CmsCollection, CmsItem } from '../types/cms';
import { KpiCardData, KeywordRank, SearchConsoleMetric } from '../types/analytics';
import { ConsentRecord, ErasureRequest, BackupSnapshot } from '../types/security';
import { StaffUser, PermissionSet } from '../types/staff';
import { ENDPOINTS_CONFIG } from '../config/endpoints.config';
import { MockStorageAdapter } from './MockStorageAdapter';

export class LiveApiAdapter implements IAdminStorageAdapter {
  private fallback: MockStorageAdapter;
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.fallback = new MockStorageAdapter();
    this.baseUrl = ENDPOINTS_CONFIG.apiBaseUrl;
    this.apiKey = ENDPOINTS_CONFIG.apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private async remoteFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    if (!this.baseUrl) return null;
    try {
      const url = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getLeads(): Promise<Lead[]> {
    const remote = await this.remoteFetch<Lead[]>('/api/leads');
    return remote || this.fallback.getLeads();
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const remote = await this.remoteFetch<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
    return remote || this.fallback.createLead(leadData);
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const remote = await this.remoteFetch<Lead>(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return remote || this.fallback.updateLead(id, updates);
  }

  async deleteLead(id: string, reason?: string): Promise<VaultEntry> {
    const remote = await this.remoteFetch<VaultEntry>(`/api/leads/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
    return remote || this.fallback.deleteLead(id, reason);
  }

  async getVaultEntries(): Promise<VaultEntry[]> {
    const remote = await this.remoteFetch<VaultEntry[]>('/api/leads/vault');
    return remote || this.fallback.getVaultEntries();
  }

  async restoreVaultEntry(vaultId: string): Promise<boolean> {
    const remote = await this.remoteFetch<{ success: boolean }>(`/api/leads/vault/${vaultId}/restore`, {
      method: 'POST'
    });
    return remote?.success ?? this.fallback.restoreVaultEntry(vaultId);
  }

  async getCollections(): Promise<CmsCollection[]> {
    const remote = await this.remoteFetch<CmsCollection[]>('/api/cms/collections');
    return remote || this.fallback.getCollections();
  }

  async getItems(collectionId: string): Promise<CmsItem[]> {
    const remote = await this.remoteFetch<CmsItem[]>(`/api/cms/collections/${collectionId}/items`);
    return remote || this.fallback.getItems(collectionId);
  }

  async saveItem(item: Omit<CmsItem, 'id' | 'updatedAt'> & { id?: string }): Promise<CmsItem> {
    const remote = await this.remoteFetch<CmsItem>(`/api/cms/collections/${item.collectionId}/items`, {
      method: item.id ? 'PUT' : 'POST',
      body: JSON.stringify(item)
    });
    return remote || this.fallback.saveItem(item);
  }

  async reorderItems(collectionId: string, itemIds: string[]): Promise<void> {
    await this.remoteFetch<void>(`/api/cms/collections/${collectionId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ itemIds })
    });
    await this.fallback.reorderItems(collectionId, itemIds);
  }

  async deleteItem(collectionId: string, itemId: string): Promise<void> {
    await this.remoteFetch<void>(`/api/cms/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE'
    });
    await this.fallback.deleteItem(collectionId, itemId);
  }

  async getKpiCards(): Promise<KpiCardData[]> {
    const remote = await this.remoteFetch<KpiCardData[]>('/api/analytics/kpis');
    return remote || this.fallback.getKpiCards();
  }

  async getKeywordRanks(): Promise<KeywordRank[]> {
    const remote = await this.remoteFetch<KeywordRank[]>('/api/analytics/keywords');
    return remote || this.fallback.getKeywordRanks();
  }

  async getSearchConsoleData(): Promise<SearchConsoleMetric> {
    const remote = await this.remoteFetch<SearchConsoleMetric>('/api/analytics/search-console');
    return remote || this.fallback.getSearchConsoleData();
  }

  async syncAnalytics(): Promise<void> {
    await this.remoteFetch<void>('/api/analytics/sync', { method: 'POST' });
    await this.fallback.syncAnalytics();
  }

  async getConsentRecords(): Promise<ConsentRecord[]> {
    const remote = await this.remoteFetch<ConsentRecord[]>('/api/security/consent-records');
    return remote || this.fallback.getConsentRecords();
  }

  async exportConsentCsv(): Promise<string> {
    const remote = await this.remoteFetch<{ csv: string }>('/api/security/consent-export');
    return remote?.csv || this.fallback.exportConsentCsv();
  }

  async requestErasure(email: string): Promise<ErasureRequest> {
    const remote = await this.remoteFetch<ErasureRequest>('/api/security/erasure', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return remote || this.fallback.requestErasure(email);
  }

  async getSnapshots(): Promise<BackupSnapshot[]> {
    const remote = await this.remoteFetch<BackupSnapshot[]>('/api/security/snapshots');
    return remote || this.fallback.getSnapshots();
  }

  async triggerBackup(): Promise<BackupSnapshot> {
    const remote = await this.remoteFetch<BackupSnapshot>('/api/security/snapshots', {
      method: 'POST'
    });
    return remote || this.fallback.triggerBackup();
  }

  async getStaffUsers(): Promise<StaffUser[]> {
    const remote = await this.remoteFetch<StaffUser[]>('/api/staff');
    return remote || this.fallback.getStaffUsers();
  }

  async inviteStaff(
    email: string,
    name: string,
    role: StaffUser['role'],
    permissions: PermissionSet
  ): Promise<StaffUser> {
    const remote = await this.remoteFetch<StaffUser>('/api/staff/invite', {
      method: 'POST',
      body: JSON.stringify({ email, name, role, permissions })
    });
    return remote || this.fallback.inviteStaff(email, name, role, permissions);
  }

  async updateStaffPermissions(id: string, permissions: Partial<PermissionSet>): Promise<StaffUser> {
    const remote = await this.remoteFetch<StaffUser>(`/api/staff/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions })
    });
    return remote || this.fallback.updateStaffPermissions(id, permissions);
  }

  async toggleStaffStatus(id: string, isActive: boolean): Promise<StaffUser> {
    const remote = await this.remoteFetch<StaffUser>(`/api/staff/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
    return remote || this.fallback.toggleStaffStatus(id, isActive);
  }

  isDemoFixturesEnabled(): boolean {
    return this.fallback.isDemoFixturesEnabled();
  }

  setDemoFixturesEnabled(enabled: boolean): void {
    this.fallback.setDemoFixturesEnabled(enabled);
  }
}
