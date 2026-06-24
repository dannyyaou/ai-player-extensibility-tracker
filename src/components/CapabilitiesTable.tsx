'use client';

import { useState, useMemo } from 'react';
import { CapabilityMatrixEntry, VendorId, ConnectorCapabilities } from '@/types';

interface CapabilitiesTableProps {
  entries: CapabilityMatrixEntry[];
  categories: string[];
}

const vendorIds: VendorId[] = ['microsoft', 'google', 'anthropic', 'openai', 'glean'];
const vendorMeta: Record<VendorId, { label: string; color: string; headerBg: string }> = {
  microsoft: { label: 'Microsoft', color: 'text-blue-600', headerBg: 'bg-blue-50' },
  google: { label: 'Google', color: 'text-emerald-600', headerBg: 'bg-emerald-50' },
  anthropic: { label: 'Anthropic', color: 'text-amber-600', headerBg: 'bg-amber-50' },
  openai: { label: 'OpenAI', color: 'text-slate-700', headerBg: 'bg-slate-100' },
  glean: { label: 'Glean', color: 'text-violet-600', headerBg: 'bg-violet-50' },
};

const INTEGRATION_COLORS: Record<string, string> = {
  'Native Sync': 'bg-blue-100 text-blue-800',
  'Native': 'bg-blue-100 text-blue-800',
  'MCP': 'bg-amber-100 text-amber-800',
  'Push API': 'bg-purple-100 text-purple-800',
  'GPT Action': 'bg-slate-200 text-slate-800',
  'Extension': 'bg-emerald-100 text-emerald-800',
  'Web history': 'bg-pink-100 text-pink-800',
  'Partner-built': 'bg-gray-100 text-gray-700',
  'MCP app': 'bg-orange-100 text-orange-800',
  'MCP tool': 'bg-yellow-100 text-yellow-800',
};

function getIntegrationColor(type: string): string {
  for (const [key, cls] of Object.entries(INTEGRATION_COLORS)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return 'bg-gray-100 text-gray-700';
}

function CapabilityCell({ cap }: { cap?: ConnectorCapabilities }) {
  if (!cap) {
    return <span className="text-slate-300 text-xs">--</span>;
  }

  const types = cap.integrationType.split(', ').map(t => t.trim());

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-0.5">
        {types.map((t, i) => (
          <span key={i} className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getIntegrationColor(t)}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex gap-2 text-[10px] text-slate-500">
        <span title="Data flow">{cap.dataFlow === 'read-write' ? 'R/W' : 'R/O'}</span>
        <span title="Sync mode">{cap.syncMode === 'real-time' ? 'RT' : 'Batch'}</span>
      </div>
    </div>
  );
}

const ALL_INTEGRATION_TYPES = ['Native Sync', 'MCP', 'Push API', 'GPT Action', 'Extension', 'Native', 'MCP app', 'MCP tool', 'Web history', 'Partner-built'];

export default function CapabilitiesTable({ entries, categories }: CapabilitiesTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [integrationFilter, setIntegrationFilter] = useState('');

  const filtered = useMemo(() => {
    let result = entries;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.dataSource.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      result = result.filter(e => e.category === categoryFilter);
    }
    if (integrationFilter) {
      result = result.filter(e =>
        Object.values(e.vendors).some(cap =>
          cap && cap.integrationType.toLowerCase().includes(integrationFilter.toLowerCase())
        )
      );
    }

    return result;
  }, [entries, search, categoryFilter, integrationFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search data sources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={integrationFilter}
          onChange={e => setIntegrationFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All Integration Types</option>
          {ALL_INTEGRATION_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-500">
        Showing {filtered.length} of {entries.length} data sources
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3 min-w-[140px]">
                  Data Source
                </th>
                <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3 min-w-[120px]">
                  Category
                </th>
                {vendorIds.map(vid => (
                  <th key={vid} className={`text-center text-xs font-semibold px-4 py-3 min-w-[120px] ${vendorMeta[vid].color}`}>
                    {vendorMeta[vid].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr key={`${entry.dataSource}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{entry.dataSource}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{entry.category}</td>
                  {vendorIds.map(vid => (
                    <td key={vid} className="px-4 py-3 text-center align-top">
                      <CapabilityCell cap={entry.vendors[vid]} />
                    </td>
                  ))}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No entries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-slate-700 mb-2">Legend</h3>
        <div className="flex flex-wrap gap-3 mb-2">
          {Object.entries(INTEGRATION_COLORS).map(([type, cls]) => (
            <span key={type} className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${cls}`}>
              {type}
            </span>
          ))}
        </div>
        <div className="flex gap-4 text-[10px] text-slate-500">
          <span><strong>R/O</strong> = Read-only</span>
          <span><strong>R/W</strong> = Read-write</span>
          <span><strong>RT</strong> = Real-time sync</span>
          <span><strong>Batch</strong> = Batch/scheduled sync</span>
          <span><strong>--</strong> = Not available</span>
        </div>
      </div>
    </div>
  );
}
