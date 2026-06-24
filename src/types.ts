export type VendorId = 'microsoft' | 'google' | 'anthropic' | 'openai' | 'glean';

export type IntegrationType = 'native-sync' | 'mcp' | 'mcp-app' | 'mcp-tool' | 'push-api' | 'web-history' | 'partner-built' | 'gpt-action' | 'extension';

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
  integrationTypes?: string[];
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
  glean: boolean;
}

export interface ConnectorCapabilities {
  integrationType: string;
  dataFlow: 'read-only' | 'read-write';
  authScope: 'tenant' | 'user';
  syncMode: 'real-time' | 'batch';
  authMethod: string;
}

export interface CapabilityMatrixEntry {
  dataSource: string;
  category: string;
  vendors: Partial<Record<VendorId, ConnectorCapabilities>>;
}

export interface Stats {
  totalConnectors: number;
  totalVendors: number;
  totalCategories: number;
  coverageEntries: number;
  vendorCounts: Record<VendorId, number>;
  categoryCounts: Record<string, number>;
}
