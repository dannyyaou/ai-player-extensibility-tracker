import { Vendor, Connector, Category, CoverageEntry, Stats } from '@/types';

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
