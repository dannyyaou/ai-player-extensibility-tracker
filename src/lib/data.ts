import { Vendor, Connector, Category, CoverageEntry, Stats, VendorId } from '@/types';

import vendorsData from '../../public/data/vendors.json';
import categoriesData from '../../public/data/categories.json';
import coverageData from '../../public/data/coverage.json';
import statsData from '../../public/data/stats.json';
import microsoftData from '../../public/data/connectors/microsoft.json';
import googleData from '../../public/data/connectors/google.json';
import anthropicData from '../../public/data/connectors/anthropic.json';
import openaiData from '../../public/data/connectors/openai.json';

const connectorsByVendor: Record<string, Connector[]> = {
  microsoft: microsoftData as Connector[],
  google: googleData as Connector[],
  anthropic: anthropicData as Connector[],
  openai: openaiData as Connector[],
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
    }))
    .sort((a, b) => a.dataSource.localeCompare(b.dataSource));
}
