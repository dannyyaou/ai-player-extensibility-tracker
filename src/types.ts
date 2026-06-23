export type VendorId = 'microsoft' | 'google' | 'anthropic' | 'openai';

export interface Vendor {
  id: VendorId;
  name: string;
  productName: string;
  description: string;
  color: string;
  websiteUrl: string;
  totalConnectors: number;
  officialConnectors: number;
}

export interface Connector {
  id: string;
  vendorId: VendorId;
  name: string;
  description: string;
  categoryId: string;
  type: 'official' | 'community' | 'third-party';
  status: 'stable' | 'beta' | 'preview' | 'deprecated';
  docsUrl?: string;
  sourceUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CoverageEntry {
  dataSource: string;
  category: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  microsoft: boolean;
  google: boolean;
  anthropic: boolean;
  openai: boolean;
}

export interface Stats {
  totalConnectors: number;
  totalVendors: number;
  totalCategories: number;
  coverageEntries: number;
  vendorCounts: Record<VendorId, number>;
  categoryCounts: Record<string, number>;
}
