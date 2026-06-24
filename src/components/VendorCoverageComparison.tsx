'use client';

import { Connector, Vendor, VendorId } from '@/types';

interface VendorCoverageComparisonProps {
  vendors: Vendor[];
  connectors: Connector[];
}

const VENDOR_COLORS: Record<string, { text: string; bar: string }> = {
  google: { text: 'text-emerald-700', bar: '#d1fae5' },
  anthropic: { text: 'text-amber-700', bar: '#fef3c7' },
  openai: { text: 'text-slate-700', bar: '#e2e8f0' },
  glean: { text: 'text-violet-700', bar: '#ede9fe' },
};

// Shared = purple, MS only = blue, Competitor only = their color
const SHARED_COLOR = '#8b5cf6';
const MS_ONLY_COLOR = '#3b82f6';

function normalise(name: string) {
  return name.toLowerCase().trim();
}

export default function VendorCoverageComparison({ vendors, connectors }: VendorCoverageComparisonProps) {
  const competitors: VendorId[] = ['google', 'anthropic', 'openai', 'glean'];
  const msOfficial = connectors.filter(c => c.vendorId === 'microsoft' && c.type === 'official');
  const msNames = new Set(msOfficial.map(c => normalise(c.name)));

  const comparisonData = competitors.map(vid => {
    const vendor = vendors.find(v => v.id === vid);
    const competitorConnectors = connectors.filter(c => c.vendorId === vid);
    const competitorNames = new Set(competitorConnectors.map(c => normalise(c.name)));

    const shared = competitorConnectors.filter(c => msNames.has(normalise(c.name))).length;
    const msOnly = msOfficial.filter(c => !competitorNames.has(normalise(c.name))).length;
    const competitorOnly = competitorConnectors.length - shared;
    const total = shared + msOnly + competitorOnly;

    return {
      id: vid,
      name: vendor?.name || vid,
      totalConnectors: competitorConnectors.length,
      shared,
      msOnly,
      competitorOnly,
      total,
    };
  });

  const msTotal = msOfficial.length;

  const COMPETITOR_BAR_COLORS: Record<string, string> = {
    google: '#10b981',
    anthropic: '#f59e0b',
    openai: '#64748b',
    glean: '#8b5cf6',
  };

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-1">Coverage Comparison vs. Competitors</h2>
      <p className="text-xs text-slate-500 mb-5">
        Connector overlap between Microsoft (official only) and each competitor
      </p>

      <div className="space-y-6">
        {comparisonData.map(comp => {
          const colors = VENDOR_COLORS[comp.id];
          const compBarColor = COMPETITOR_BAR_COLORS[comp.id];
          const sharedPct = comp.total > 0 ? (comp.shared / comp.total) * 100 : 0;
          const msOnlyPct = comp.total > 0 ? (comp.msOnly / comp.total) * 100 : 0;
          const compOnlyPct = comp.total > 0 ? (comp.competitorOnly / comp.total) * 100 : 0;

          return (
            <div key={comp.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${colors.text}`}>vs {comp.name}</span>
                  <span className="text-xs text-slate-400">
                    ({comp.totalConnectors} connectors)
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {comp.shared + comp.msOnly + comp.competitorOnly} unique total
                </span>
              </div>

              {/* Stacked bar */}
              <div className="flex h-7 rounded-lg overflow-hidden">
                {comp.shared > 0 && (
                  <div
                    className="flex items-center justify-center transition-all"
                    style={{ width: `${sharedPct}%`, backgroundColor: SHARED_COLOR }}
                    title={`Shared: ${comp.shared}`}
                  >
                    {sharedPct > 8 && (
                      <span className="text-[10px] font-bold text-white">{comp.shared}</span>
                    )}
                  </div>
                )}
                {comp.msOnly > 0 && (
                  <div
                    className="flex items-center justify-center transition-all"
                    style={{ width: `${msOnlyPct}%`, backgroundColor: MS_ONLY_COLOR }}
                    title={`MS only: ${comp.msOnly}`}
                  >
                    {msOnlyPct > 8 && (
                      <span className="text-[10px] font-bold text-white">{comp.msOnly}</span>
                    )}
                  </div>
                )}
                {comp.competitorOnly > 0 && (
                  <div
                    className="flex items-center justify-center transition-all"
                    style={{ width: `${compOnlyPct}%`, backgroundColor: compBarColor, opacity: 0.5 }}
                    title={`${comp.name} only: ${comp.competitorOnly}`}
                  >
                    {compOnlyPct > 8 && (
                      <span className="text-[10px] font-bold text-slate-800">{comp.competitorOnly}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Legend row */}
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SHARED_COLOR }} />
                  Shared: {comp.shared}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MS_ONLY_COLOR }} />
                  MS only: {comp.msOnly}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: compBarColor, opacity: 0.5 }} />
                  {comp.name} only: {comp.competitorOnly}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: SHARED_COLOR }} />
            Both have
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: MS_ONLY_COLOR }} />
            MS only
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-300" />
            Competitor only
          </span>
          <span className="ml-auto text-slate-600 font-medium">
            Microsoft: {msTotal} official connectors
          </span>
        </div>
      </div>
    </div>
  );
}
