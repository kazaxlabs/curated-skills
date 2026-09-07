import { Lead, VaultEntry } from '../types/crm';
import { CmsCollection, CmsItem } from '../types/cms';
import { KpiCardData, KeywordRank, SearchConsoleMetric } from '../types/analytics';
import { ConsentRecord, BackupSnapshot } from '../types/security';
import { StaffUser } from '../types/staff';

export const DEMO_LEADS: Lead[] = [
  {
    id: 'lead_001',
    name: 'Élise Tremblay',
    email: 'elise.tremblay@example.qc.ca',
    phone: '(514) 892-4410',
    serviceInterest: 'Turnkey Architectural Renovation',
    estimatedValue: 14500,
    status: 'new',
    message: 'Looking for a comprehensive overhaul for residential terrace and exterior layout.',
    notes: 'Called on Monday; preferred contact via email after 5 PM.',
    createdAt: '2026-09-06T14:30:00Z',
    updatedAt: '2026-09-06T14:30:00Z',
    source: 'Website Contact Modal'
  },
  {
    id: 'lead_002',
    name: 'Marc-André Gagnon',
    email: 'magagnon@nordicsolutions.ca',
    phone: '(438) 330-8871',
    serviceInterest: 'Commercial Facilities Upgrade',
    estimatedValue: 28000,
    status: 'quoted',
    message: 'Corporate office courtyard redesign with sustainable stone pavers.',
    notes: 'Quote Q-2026-088 sent. Follow-up scheduled for next Friday.',
    createdAt: '2026-09-04T10:15:00Z',
    updatedAt: '2026-09-05T09:20:00Z',
    source: 'Partner Referral'
  },
  {
    id: 'lead_003',
    name: 'Sophie Beaudoin',
    email: 'sophie.beaudoin@montreal.org',
    phone: '(514) 450-9922',
    serviceInterest: 'Modular Urban Patio & Lighting',
    estimatedValue: 8200,
    status: 'won',
    message: '50% deposit received. Materials ordered from local supplier.',
    notes: 'Project kickoff on site set for late September.',
    createdAt: '2026-08-28T16:00:00Z',
    updatedAt: '2026-09-02T11:45:00Z',
    source: 'Direct Search (Google)'
  }
];

export const DEMO_VAULT: VaultEntry[] = [
  {
    id: 'vault_001',
    originalId: 'lead_old_99',
    entityType: 'lead',
    deletedAt: '2026-09-05T12:00:00Z',
    summary: 'Duplicate inquiry from test submission (test@example.com)',
    data: { name: 'Test User', email: 'test@example.com' }
  }
];

export const DEMO_COLLECTIONS: CmsCollection[] = [
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

export const DEMO_CMS_ITEMS: Record<string, CmsItem[]> = {
  services: [
    {
      id: 'srv_1',
      collectionId: 'services',
      order: 0,
      title: 'Turnkey Architectural Design',
      slug: 'turnkey-architectural-design',
      status: 'published',
      metadata: {
        category: 'Residential',
        priceRange: '$12,000 – $45,000 CAD',
        description: 'Complete spatial planning, 3D visualization, material selection, and site coordination.'
      },
      updatedAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'srv_2',
      collectionId: 'services',
      order: 1,
      title: 'Precision Hardscaping & Pavers',
      slug: 'precision-hardscaping',
      status: 'published',
      metadata: {
        category: 'Exterior Construction',
        priceRange: '$8,000 – $30,000 CAD',
        description: 'Commercial-grade interlocking pavers, retaining walls, and custom stone terraces.'
      },
      updatedAt: '2026-09-02T11:20:00Z'
    },
    {
      id: 'srv_3',
      collectionId: 'services',
      order: 2,
      title: 'Integrated Nightscape & Lighting',
      slug: 'nightscape-lighting',
      status: 'draft',
      metadata: {
        category: 'Electrical & Ambiance',
        priceRange: '$3,500 – $9,000 CAD',
        description: 'Low-voltage architectural illumination with automated smart timers and zoning.'
      },
      updatedAt: '2026-09-04T15:00:00Z'
    }
  ],
  portfolio: [
    {
      id: 'port_1',
      collectionId: 'portfolio',
      order: 0,
      title: 'Résidence Outremont',
      slug: 'residence-outremont',
      status: 'published',
      metadata: {
        location: 'Outremont, QC',
        year: 2026,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      },
      updatedAt: '2026-08-30T10:00:00Z'
    },
    {
      id: 'port_2',
      collectionId: 'portfolio',
      order: 1,
      title: 'Domaine de l’Île-Bizard',
      slug: 'domaine-ile-bizard',
      status: 'published',
      metadata: {
        location: 'Île-Bizard, QC',
        year: 2026,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      },
      updatedAt: '2026-09-03T14:10:00Z'
    }
  ]
};

export const DEMO_KPIS: KpiCardData[] = [
  {
    id: 'kpi_1',
    title: 'Active Inquiries',
    value: '18',
    previousValue: '12',
    deltaPercent: 50.0,
    trend: 'up',
    timeframe: 'vs last 30 days',
    category: 'conversion'
  },
  {
    id: 'kpi_2',
    title: 'Pipeline Quote Volume',
    value: '$142,500',
    previousValue: '$118,000',
    deltaPercent: 20.7,
    trend: 'up',
    timeframe: 'gross pending',
    category: 'revenue'
  },
  {
    id: 'kpi_3',
    title: 'Search Impressions',
    value: '4,892',
    previousValue: '5,100',
    deltaPercent: -4.1,
    trend: 'down',
    timeframe: 'GSC past 28d',
    category: 'seo'
  },
  {
    id: 'kpi_4',
    title: 'Average CTR',
    value: '4.8%',
    previousValue: '4.2%',
    deltaPercent: 14.3,
    trend: 'up',
    timeframe: 'organic search',
    category: 'traffic'
  }
];

export const DEMO_KEYWORDS: KeywordRank[] = [
  {
    id: 'kw_1',
    keyword: 'amenagement paysager montreal',
    position: 4,
    previousPosition: 7,
    monthlyVolume: 1900,
    targetUrl: 'https://paysagementbotanic.ca/',
    updatedAt: '2026-09-06'
  },
  {
    id: 'kw_2',
    keyword: 'pose de pave uni rive sud',
    position: 3,
    previousPosition: 3,
    monthlyVolume: 880,
    targetUrl: 'https://paysagementbotanic.ca/services',
    updatedAt: '2026-09-06'
  },
  {
    id: 'kw_3',
    keyword: 'terrasse contemporaine quebec',
    position: 8,
    previousPosition: 12,
    monthlyVolume: 450,
    targetUrl: 'https://paysagementbotanic.ca/galerie',
    updatedAt: '2026-09-05'
  }
];

export const DEMO_SEARCH_CONSOLE: SearchConsoleMetric = {
  totalClicks: 342,
  totalImpressions: 7120,
  averageCtr: 4.8,
  averagePosition: 9.4,
  dateRange: 'Past 28 Days',
  isSynced: true
};

export const DEMO_CONSENTS: ConsentRecord[] = [
  {
    id: 'cst_001',
    email: 'elise.tremblay@example.qc.ca',
    fullName: 'Élise Tremblay',
    serviceRequested: 'Turnkey Architectural Renovation',
    law25Consent: true,
    caslOptIn: false,
    timestamp: '2026-09-06T14:30:00Z',
    ipAddressMasked: '24.200.***.***',
    retentionExpiresAt: '2028-09-06T14:30:00Z'
  },
  {
    id: 'cst_002',
    email: 'magagnon@nordicsolutions.ca',
    fullName: 'Marc-André Gagnon',
    serviceRequested: 'Commercial Facilities Upgrade',
    law25Consent: true,
    caslOptIn: true,
    timestamp: '2026-09-04T10:15:00Z',
    ipAddressMasked: '198.168.***.***',
    retentionExpiresAt: '2028-09-04T10:15:00Z'
  }
];

export const DEMO_SNAPSHOTS: BackupSnapshot[] = [
  {
    id: 'snap_2026_09_06',
    timestamp: '2026-09-06T04:00:00Z',
    collectionsCount: 5,
    totalRecords: 142,
    status: 'available',
    downloadUrl: '#'
  },
  {
    id: 'snap_2026_08_30',
    timestamp: '2026-08-30T04:00:00Z',
    collectionsCount: 5,
    totalRecords: 138,
    status: 'available',
    downloadUrl: '#'
  }
];

export const DEMO_STAFF: StaffUser[] = [
  {
    id: 'staff_1',
    email: 'alexandre@kazaxlabs.com',
    name: 'Alexandre Kaza',
    role: 'owner',
    isActive: true,
    permissions: {
      canManageLeads: true,
      canExportData: true,
      canEditCMS: true,
      canManageSecurity: true,
      canManageStaff: true,
      canSendEmails: true
    },
    lastActiveAt: '2026-09-07T12:45:00Z',
    invitedAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'staff_2',
    email: 'marie.chef@example.com',
    name: 'Marie Dupont',
    role: 'manager',
    isActive: true,
    permissions: {
      canManageLeads: true,
      canExportData: false,
      canEditCMS: true,
      canManageSecurity: false,
      canManageStaff: false,
      canSendEmails: true
    },
    lastActiveAt: '2026-09-06T17:30:00Z',
    invitedAt: '2026-03-10T14:20:00Z'
  }
];
