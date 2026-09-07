export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'negotiation' | 'won' | 'archived';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceInterest: string;
  estimatedValue: number;
  status: LeadStatus;
  message?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  tags?: string[];
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteDraft {
  id: string;
  leadId: string;
  clientName: string;
  clientEmail: string;
  items: QuoteItem[];
  taxRateTPS: number; // 0.05
  taxRateTVQ: number; // 0.09975
  subtotal: number;
  depositPercentage: number; // 50
  notes: string;
}

export interface VaultEntry {
  id: string;
  originalId: string;
  entityType: 'lead' | 'cms_item' | 'staff';
  deletedAt: string;
  data: Record<string, unknown>;
  summary: string;
}

export interface CrmFilterState {
  searchQuery: string;
  statusFilter: string;
  sortBy: 'date' | 'value' | 'name';
  sortOrder: 'asc' | 'desc';
}
