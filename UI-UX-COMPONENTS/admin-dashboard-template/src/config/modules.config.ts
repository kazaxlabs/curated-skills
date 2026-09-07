import { 
  Users, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import React from 'react';
import { PermissionSet } from '../types/staff';

export interface ModuleConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  requiredPermission?: keyof PermissionSet;
  badge?: string;
}

export const REGISTERED_MODULES: ModuleConfig[] = [
  {
    id: 'crm',
    label: 'CRM & Pipeline',
    description: 'Inbound inquiries, quote lifecycle, client communication, and soft-delete vault.',
    icon: Users,
    requiredPermission: 'canManageLeads'
  },
  {
    id: 'cms',
    label: 'Content Engine',
    description: 'Structured public site content, catalogues, project case studies, and live reordering.',
    icon: Layers,
    requiredPermission: 'canEditCMS'
  },
  {
    id: 'analytics',
    label: 'Telemetry & SEO',
    description: 'Search console telemetry, Google ranking positions, and conversion funnels.',
    icon: BarChart3
  },
  {
    id: 'security',
    label: 'Privacy & Law 25',
    description: 'Quebec Law 25 / GDPR consent registry, irreversible PII erasure, and system snapshots.',
    icon: ShieldCheck,
    requiredPermission: 'canManageSecurity'
  },
  {
    id: 'staff',
    label: 'Team & RBAC',
    description: 'Granular role-based access control, employee provisioning, and permission audits.',
    icon: UserCheck,
    requiredPermission: 'canManageStaff'
  }
];
