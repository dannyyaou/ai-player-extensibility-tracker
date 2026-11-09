'use client';

import { useState, useMemo } from 'react';
import { Vendor, Connector, Category } from '@/types';
import VendorHeader from '@/components/VendorHeader';
import FilterBar from '@/components/FilterBar';
import ConnectorGrid from '@/components/ConnectorGrid';
import StatCard from '@/components/StatCard';

interface VendorDetailClientProps {
  vendor: Vendor;
  connectors: Connector[];
  categories: Category[];
}

export default function VendorDetailClient({ vendor, connectors, categories }: VendorDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredConnectors = useMemo(() => {
    return connectors.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || c.categoryId === selectedCategory;
      const matchesType = !selectedType || c.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [connectors, searchQuery, selectedCategory, selectedType]);

  const officialCount = connectors.filter((c) => c.type === 'official').length;
  const communityCount = connectors.filter((c) => c.type === 'community').length;
  const thirdPartyCount = connectors.filter((c) => c.type === 'third-party').length;

  // Source platform breakdown (Microsoft-specific)
  const graphOnlyCount = connectors.filter((c) => c.sourcePlatform === 'graph-connectors').length;
  const ppOnlyCount = connectors.filter((c) => c.sourcePlatform === 'power-platform').length;
  const bothCount = connectors.filter((c) => c.sourcePlatform === 'both').length;
  const hasSourcePlatform = graphOnlyCount > 0 || ppOnlyCount > 0 || bothCount > 0;

  return (
    <div className="space-y-6">
      <VendorHeader vendor={vendor} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Listed Connectors" value={connectors.length} color={vendor.color} />
        <StatCard label="Official" value={officialCount} color="blue" />
        <StatCard label="Community" value={communityCount} color="amber" />
        <StatCard label="Third-party" value={thirdPartyCount} color="slate" />
      </div>

      {hasSourcePlatform && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Source Platform Breakdown</h3>
          <div className="flex gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              {graphOnlyCount} from Graph Connectors
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              {ppOnlyCount} from Power Platform
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {bothCount} in both
            </span>
          </div>
        </div>
      )}

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        categories={categories}
      />

      <ConnectorGrid connectors={filteredConnectors} />
    </div>
  );
}
