export type StaffRole = 'owner' | 'manager' | 'editor' | 'viewer';

export interface PermissionSet {
  canManageLeads: boolean;
  canExportData: boolean;
  canEditCMS: boolean;
  canManageSecurity: boolean;
  canManageStaff: boolean;
  canSendEmails: boolean;
}

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  avatarUrl?: string;
  isActive: boolean;
  permissions: PermissionSet;
  lastActiveAt?: string;
  invitedAt: string;
}
