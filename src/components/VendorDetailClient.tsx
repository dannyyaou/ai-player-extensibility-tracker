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

  return (
    <div className="space-y-6">
      <VendorHeader vendor={vendor} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Listed Connectors" value={connectors.length} color={vendor.color} />
        <StatCard label="Official" value={officialCount} color="blue" />
        <StatCard label="Community" value={communityCount} color="amber" />
        <StatCard label="Third-party" value={thirdPartyCount} color="slate" />
      </div>

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
