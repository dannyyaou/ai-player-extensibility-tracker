'use client';

import { useState, useMemo } from 'react';
import { CoverageEntry, VendorId } from '@/types';

interface CoverageTableProps {
  entries: CoverageEntry[];
  categories: string[];
}

type SortKey = 'dataSource' | 'category' | VendorId;
type SortDir = 'asc' | 'desc';

const vendors: { key: VendorId; label: string; color: string; bg: string; activeBg: string; activeText: string }[] = [
  { key: 'microsoft', label: 'Microsoft', color: 'text-blue-600', bg: 'bg-blue-50', activeBg: 'bg-blue-600', activeText: 'text-white' },
  { key: 'google', label: 'Google', color: 'text-emerald-600', bg: 'bg-emerald-50', activeBg: 'bg-emerald-600', activeText: 'text-white' },
  { key: 'anthropic', label: 'Anthropic', color: 'text-amber-600', bg: 'bg-amber-50', activeBg: 'bg-amber-600', activeText: 'text-white' },
  { key: 'openai', label: 'OpenAI', color: 'text-slate-700', bg: 'bg-slate-100', activeBg: 'bg-slate-700', activeText: 'text-white' },
  { key: 'glean', label: 'Glean', color: 'text-violet-600', bg: 'bg-violet-50', activeBg: 'bg-violet-600', activeText: 'text-white' },
];

export default function CoverageTable({ entries, categories }: CoverageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('dataSource');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [vendorFilters, setVendorFilters] = useState<Set<VendorId>>(new Set());

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleVendorFilter(vid: VendorId) {
    setVendorFilters(prev => {
      const next = new Set(prev);
      if (next.has(vid)) next.delete(vid);
      else next.add(vid);
      return next;
    });
  }

  const filtered = useMemo(() => {
    let result = entries;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.dataSource.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      result = result.filter(e => e.category === categoryFilter);
    }
    if (vendorFilters.size > 0) {
      result = result.filter(e =>
        Array.from(vendorFilters).some(v => e[v])
      );
    }

    return result;
  }, [entries, search, categoryFilter, vendorFilters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;

    arr.sort((a, b) => {
      switch (sortKey) {
        case 'dataSource':
          return dir * a.dataSource.localeCompare(b.dataSource);
        case 'category':
          return dir * a.category.localeCompare(b.category);
        case 'microsoft':
        case 'google':
        case 'anthropic':
        case 'openai':
        case 'glean': {
          const av = a[sortKey] ? 0 : 1;
          const bv = b[sortKey] ? 0 : 1;
          return dir * (av - bv);
        }
        default:
          return 0;
      }
    });

    return arr;
  }, [filtered, sortKey, sortDir]);

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return null;
    return <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search data sources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Vendor toggle pills */}
      <div className="flex flex-wrap gap-2">
        {vendors.map(v => {
          const active = vendorFilters.has(v.key);
          return (
            <button
              key={v.key}
              onClick={() => toggleVendorFilter(v.key)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                active
                  ? `${v.activeBg} ${v.activeText} border-transparent`
                  : `${v.bg} ${v.color} border-slate-200 hover:border-slate-300`
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-500">
        Showing {sorted.length} of {entries.length} entries
      </p>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th
                  onClick={() => toggleSort('dataSource')}
                  className="text-left text-xs font-semibold text-slate-600 px-4 py-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  Data Source{sortArrow('dataSource')}
                </th>
                <th
                  onClick={() => toggleSort('category')}
                  className="text-left text-xs font-semibold text-slate-600 px-4 py-3 cursor-pointer hover:bg-slate-100 select-none"
                >
                  Category{sortArrow('category')}
                </th>
                {vendors.map(v => (
                  <th
                    key={v.key}
                    onClick={() => toggleSort(v.key)}
                    className={`text-center text-xs font-semibold px-4 py-3 cursor-pointer hover:bg-slate-100 select-none ${v.color}`}
                  >
                    {v.label}{sortArrow(v.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry, i) => (
                <tr key={`${entry.dataSource}-${i}`} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{entry.dataSource}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{entry.category}</td>
                  {vendors.map(v => (
                    <td key={v.key} className="px-4 py-3 text-center">
                      {entry[v.key] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {sorted.length === 0 && (
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
    </div>
  );
}
