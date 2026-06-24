import { Vendor, Connector, Category, CoverageEntry, Stats, VendorId, CapabilityMatrixEntry, ConnectorCapabilities } from '@/types';

import vendorsData from '../../public/data/vendors.json';
import categoriesData from '../../public/data/categories.json';
import coverageData from '../../public/data/coverage.json';
import statsData from '../../public/data/stats.json';
import microsoftData from '../../public/data/connectors/microsoft.json';
import googleData from '../../public/data/connectors/google.json';
import anthropicData from '../../public/data/connectors/anthropic.json';
import openaiData from '../../public/data/connectors/openai.json';
import gleanData from '../../public/data/connectors/glean.json';

const connectorsByVendor: Record<string, Connector[]> = {
  microsoft: microsoftData as Connector[],
  google: googleData as Connector[],
  anthropic: anthropicData as Connector[],
  openai: openaiData as Connector[],
  glean: gleanData as Connector[],
};

export function getVendors(): Vendor[] {
  return vendorsData as Vendor[];
}

export function getVendor(id: string): Vendor | undefined {
  return (vendorsData as Vendor[]).find(v => v.id === id);
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getConnectors(vendorId: string): Connector[] {
  return connectorsByVendor[vendorId] || [];
}

export function getAllConnectors(): Connector[] {
  return Object.values(connectorsByVendor).flat();
}

export function getCoverage(): CoverageEntry[] {
  return coverageData as CoverageEntry[];
}

export function getStats(): Stats {
  return statsData as Stats;
}

const categoryIdToName: Record<string, string> = {};
for (const cat of categoriesData as Category[]) {
  categoryIdToName[cat.id] = cat.name;
}

/**
 * Build a comprehensive coverage matrix from all connector data.
 * Groups connectors by normalised name and checks which vendors offer each.
 * Microsoft is filtered to official connectors only.
 */
export function getFullCoverageMatrix(): CoverageEntry[] {
  const map = new Map<string, {
    displayName: string;
    category: string;
    microsoft: boolean;
    google: boolean;
    anthropic: boolean;
    openai: boolean;
    glean: boolean;
  }>();

  const allConnectors = Object.entries(connectorsByVendor).flatMap(([vendorId, list]) =>
    (list as Connector[])
      .filter(c => vendorId !== 'microsoft' || c.type === 'official')
      .map(c => ({ ...c, vendorId: vendorId as VendorId }))
  );

  for (const c of allConnectors) {
    const key = c.name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, {
        displayName: c.name,
        category: categoryIdToName[c.categoryId] || c.categoryId,
        microsoft: false,
        google: false,
        anthropic: false,
        openai: false,
        glean: false,
      });
    }
    const entry = map.get(key)!;
    entry[c.vendorId] = true;
  }

  return Array.from(map.values())
    .map(e => ({
      dataSource: e.displayName,
      category: e.category,
      importance: 'nice-to-have' as const,
      microsoft: e.microsoft,
      google: e.google,
      anthropic: e.anthropic,
      openai: e.openai,
      glean: e.glean,
    }))
    .sort((a, b) => a.dataSource.localeCompare(b.dataSource));
}

/**
 * Vendor-level capability defaults.
 */
const vendorCapabilityDefaults: Record<VendorId, ConnectorCapabilities> = {
  microsoft: { integrationType: 'Native Sync', dataFlow: 'read-only', authScope: 'tenant', syncMode: 'batch', authMethod: 'OAuth' },
  google: { integrationType: 'Extension', dataFlow: 'read-only', authScope: 'user', syncMode: 'real-time', authMethod: 'OAuth' },
  anthropic: { integrationType: 'MCP', dataFlow: 'read-write', authScope: 'user', syncMode: 'real-time', authMethod: 'OAuth' },
  openai: { integrationType: 'GPT Action', dataFlow: 'read-write', authScope: 'user', syncMode: 'real-time', authMethod: 'API Key' },
  glean: { integrationType: 'Native', dataFlow: 'read-only', authScope: 'tenant', syncMode: 'batch', authMethod: 'OAuth' },
};

/**
 * Build a cross-vendor capability comparison matrix.
 * For most vendors, uses vendor-level defaults.
 * For Glean, uses per-connector integrationTypes when available.
 */
export function getCapabilityMatrix(): CapabilityMatrixEntry[] {
  const map = new Map<string, CapabilityMatrixEntry>();

  const allConnectors = Object.entries(connectorsByVendor).flatMap(([vendorId, list]) =>
    (list as Connector[])
      .filter(c => vendorId !== 'microsoft' || c.type === 'official')
      .map(c => ({ ...c, vendorId: vendorId as VendorId }))
  );

  for (const c of allConnectors) {
    const key = c.name.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, {
        dataSource: c.name,
        category: categoryIdToName[c.categoryId] || c.categoryId,
        vendors: {},
      });
    }

    const entry = map.get(key)!;

    if (c.vendorId === 'glean' && c.integrationTypes && c.integrationTypes.length > 0) {
      const types = c.integrationTypes;
      const hasMcp = types.some(t => t.toLowerCase().includes('mcp'));
      const hasPush = types.some(t => t.toLowerCase().includes('push'));
      const hasNative = types.some(t => t.toLowerCase().includes('native'));
      const integrationType = types.join(', ');
      entry.vendors.glean = {
        integrationType,
        dataFlow: hasPush ? 'read-write' : 'read-only',
        authScope: 'tenant',
        syncMode: hasMcp ? 'real-time' : (hasNative ? 'batch' : 'batch'),
        authMethod: 'OAuth',
      };
    } else {
      entry.vendors[c.vendorId] = { ...vendorCapabilityDefaults[c.vendorId] };
    }
  }

  return Array.from(map.values())
    .sort((a, b) => a.dataSource.localeCompare(b.dataSource));
}
