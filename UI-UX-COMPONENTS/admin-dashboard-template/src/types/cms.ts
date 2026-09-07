export interface CmsField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'image' | 'boolean';
  required?: boolean;
}

export interface CmsItem {
  id: string;
  collectionId: string;
  order: number;
  title: string;
  slug?: string;
  status: 'draft' | 'published';
  metadata: Record<string, unknown>;
  updatedAt: string;
}

export interface CmsCollection {
  id: string;
  name: string;
  singularName: string;
  description: string;
  fields: CmsField[];
}
