import { Lead, VaultEntry } from './crm';
import { CmsCollection, CmsItem } from './cms';
import { KpiCardData, KeywordRank, SearchConsoleMetric } from './analytics';
import { ConsentRecord, ErasureRequest, BackupSnapshot } from './security';
import { StaffUser, PermissionSet } from './staff';

export interface IAdminStorageAdapter {
  // CRM
  getLeads(): Promise<Lead[]>;
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string, reason?: string): Promise<VaultEntry>;
  getVaultEntries(): Promise<VaultEntry[]>;
  restoreVaultEntry(vaultId: string): Promise<boolean>;

  // CMS
  getCollections(): Promise<CmsCollection[]>;
  getItems(collectionId: string): Promise<CmsItem[]>;
  saveItem(item: Omit<CmsItem, 'id' | 'updatedAt'> & { id?: string }): Promise<CmsItem>;
  reorderItems(collectionId: string, itemIds: string[]): Promise<void>;
  deleteItem(collectionId: string, itemId: string): Promise<void>;

  // Analytics & SEO
  getKpiCards(): Promise<KpiCardData[]>;
  getKeywordRanks(): Promise<KeywordRank[]>;
  getSearchConsoleData(): Promise<SearchConsoleMetric>;
  syncAnalytics(): Promise<void>;

  // Security & Law 25
  getConsentRecords(): Promise<ConsentRecord[]>;
  exportConsentCsv(): Promise<string>;
  requestErasure(email: string): Promise<ErasureRequest>;
  getSnapshots(): Promise<BackupSnapshot[]>;
  triggerBackup(): Promise<BackupSnapshot>;

  // Staff & RBAC
  getStaffUsers(): Promise<StaffUser[]>;
  inviteStaff(email: string, name: string, role: StaffUser['role'], permissions: PermissionSet): Promise<StaffUser>;
  updateStaffPermissions(id: string, permissions: Partial<PermissionSet>): Promise<StaffUser>;
  toggleStaffStatus(id: string, isActive: boolean): Promise<StaffUser>;

  // Mode state
  isDemoFixturesEnabled(): boolean;
  setDemoFixturesEnabled(enabled: boolean): void;
}
