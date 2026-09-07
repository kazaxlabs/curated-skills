export interface ConsentRecord {
  id: string;
  email: string;
  fullName: string;
  serviceRequested: string;
  law25Consent: boolean;
  caslOptIn: boolean; // Canadian Anti-Spam Legislation
  timestamp: string;
  ipAddressMasked: string;
  retentionExpiresAt: string;
}

export interface ErasureRequest {
  id: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'completed' | 'rejected';
  recordsWipedCount: number;
  completedAt?: string;
  auditSignature: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  collectionsCount: number;
  totalRecords: number;
  status: 'available' | 'in_progress' | 'failed';
  downloadUrl?: string;
}
