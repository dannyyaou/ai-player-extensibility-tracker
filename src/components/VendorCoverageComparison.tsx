'use client';

import { Connector, Vendor, VendorId } from '@/types';

interface VendorCoverageComparisonProps {
  vendors: Vendor[];
  connectors: Connector[];
}

const VENDOR_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  google: { bar: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  anthropic: { bar: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' },
  openai: { bar: '#475569', bg: 'bg-slate-100', text: 'text-slate-700' },
};

function normalise(name: string) {
  return name.toLowerCase().trim();
}

export default function VendorCoverageComparison({ vendors, connectors }: VendorCoverageComparisonProps) {
  const competitors: VendorId[] = ['google', 'anthropic', 'openai'];
  const msOfficial = connectors.filter(c => c.vendorId === 'microsoft' && c.type === 'official');
  const msNames = new Set(msOfficial.map(c => normalise(c.name)));

  const comparisonData = competitors.map(vid => {
    const vendor = vendors.find(v => v.id === vid);
    const competitorConnectors = connectors.filter(c => c.vendorId === vid);
    const competitorNames = new Set(competitorConnectors.map(c => normalise(c.name)));

    // How many of this competitor's connectors does MS also have (by name)
    const shared = competitorConnectors.filter(c => msNames.has(normalise(c.name))).length;
    // MS official connectors this competitor doesn't have
    const msOnly = msOfficial.filter(c => !competitorNames.has(normalise(c.name))).length;

    const overlapPct = competitorConnectors.length > 0
      ? Math.round((shared / competitorConnectors.length) * 100)
      : 0;

    return {
      id: vid,
      name: vendor?.name || vid,
      totalConnectors: competitorConnectors.length,
      shared,
      msOnly,
      gap: competitorConnectors.length - shared,
      overlapPct,
    };
  });

  const msTotal = msOfficial.length;

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-1">Coverage Comparison vs. Competitors</h2>
      <p className="text-xs text-slate-500 mb-5">
        How much of each competitor&apos;s connector catalog Microsoft also covers (official MS connectors only)
      </p>

      <div className="space-y-5">
        {comparisonData.map(comp => {
          const colors = VENDOR_COLORS[comp.id];
          return (
            <div key={comp.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${colors.text}`}>{comp.name}</span>
                  <span className="text-xs text-slate-400">({comp.totalConnectors} connectors)</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{comp.overlapPct}% covered</span>
              </div>

              {/* Progress bar */}
              <div className="relative h-6 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${comp.overlapPct}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-700">
                    {comp.shared} of {comp.totalConnectors} connectors
                  </span>
                </div>
              </div>

              {/* Detail chips */}
              <div className="flex gap-3 text-xs">
                <span className="text-blue-600">
                  MS only: {comp.msOnly}
                </span>
                <span className="text-slate-400">|</span>
                <span className={colors.text}>
                  {comp.name} only: {comp.gap}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">
                  Shared: {comp.shared}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
            Microsoft covers
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-200" />
            Gap (competitor only)
          </span>
          <span className="ml-auto text-slate-600 font-medium">
            Microsoft total: {msTotal} official connectors
          </span>
        </div>
      </div>
    </div>
  );
}
