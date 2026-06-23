'use client';

import { CoverageEntry, Vendor, VendorId } from '@/types';

interface VendorCoverageComparisonProps {
  vendors: Vendor[];
  coverage: CoverageEntry[];
}

const VENDOR_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  google: { bar: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  anthropic: { bar: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' },
  openai: { bar: '#475569', bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function VendorCoverageComparison({ vendors, coverage }: VendorCoverageComparisonProps) {
  const competitors: VendorId[] = ['google', 'anthropic', 'openai'];

  const comparisonData = competitors.map(vid => {
    const vendor = vendors.find(v => v.id === vid);
    // Sources this competitor covers
    const competitorSources = coverage.filter(e => e[vid]);
    // Of those, how many does Microsoft also cover
    const sharedSources = competitorSources.filter(e => e.microsoft);
    // Sources Microsoft covers that this competitor doesn't
    const msOnlySources = coverage.filter(e => e.microsoft && !e[vid]);

    const overlapPct = competitorSources.length > 0
      ? Math.round((sharedSources.length / competitorSources.length) * 100)
      : 0;

    return {
      id: vid,
      name: vendor?.name || vid,
      totalConnectors: vendor?.totalConnectors ?? 0,
      competitorSources: competitorSources.length,
      sharedSources: sharedSources.length,
      msOnlySources: msOnlySources.length,
      gapSources: competitorSources.length - sharedSources.length,
      overlapPct,
    };
  });

  const msTotal = vendors.find(v => v.id === 'microsoft')?.totalConnectors ?? 0;

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-1">Coverage Comparison vs. Competitors</h2>
      <p className="text-xs text-slate-500 mb-5">
        How much of each competitor&apos;s coverage matrix Microsoft also covers (based on {coverage.length} tracked sources)
      </p>

      <div className="space-y-5">
        {comparisonData.map(comp => {
          const colors = VENDOR_COLORS[comp.id];
          return (
            <div key={comp.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${colors.text}`}>{comp.name}</span>
                  <span className="text-xs text-slate-400">({comp.totalConnectors} total connectors)</span>
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
                    {comp.sharedSources} of {comp.competitorSources} sources
                  </span>
                </div>
              </div>

              {/* Detail chips */}
              <div className="flex gap-3 text-xs">
                <span className="text-blue-600">
                  MS only: {comp.msOnlySources}
                </span>
                <span className="text-slate-400">|</span>
                <span className={colors.text}>
                  {comp.name} only: {comp.gapSources}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">
                  Shared: {comp.sharedSources}
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
            Microsoft total: {msTotal} connectors
          </span>
        </div>
      </div>
    </div>
  );
}
