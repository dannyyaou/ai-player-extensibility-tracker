import { Vendor, Connector, CoverageEntry } from '@/types';

interface MarketPositionSummaryProps {
  vendors: Vendor[];
  connectors?: Connector[];
  coverage: CoverageEntry[];
}

export default function MarketPositionSummary({ vendors, coverage }: MarketPositionSummaryProps) {
  const vendorIds = ['microsoft', 'google', 'anthropic', 'openai'] as const;
  const ms = vendors.find(v => v.id === 'microsoft');

  // Where We Lead: data sources where Microsoft has coverage and no competitor does
  const msExclusive = coverage.filter(e =>
    e.microsoft && !e.google && !e.anthropic && !e.openai
  );

  // Where We Lag: data sources where a competitor has coverage but Microsoft doesn't
  const gapsByCompetitor = vendorIds
    .filter(v => v !== 'microsoft')
    .map(vid => ({
      id: vid,
      name: vendors.find(v => v.id === vid)?.name || vid,
      sources: coverage.filter(e => !e.microsoft && e[vid]).map(e => e.dataSource),
    }))
    .filter(g => g.sources.length > 0);

  // Connector Count Comparison
  const msConnectorCount = ms?.totalConnectors ?? 0;
  const competitorsByTotal = [...vendors]
    .filter(v => v.id !== 'microsoft')
    .sort((a, b) => b.totalConnectors - a.totalConnectors);
  const topCompetitor = competitorsByTotal[0];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold text-slate-900">Competitive Intelligence</h2>
        <span className="text-xs text-slate-500">Microsoft extensibility position vs. competitors</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Where We Lead */}
        <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">+</span>
            <h3 className="text-sm font-bold text-green-800">Where We Lead</h3>
          </div>
          {msExclusive.length > 0 ? (
            <div>
              <p className="text-sm text-green-900 mb-2">
                <span className="font-semibold">{msExclusive.length}</span> data source{msExclusive.length > 1 ? 's' : ''} only Microsoft covers:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {msExclusive.map(e => (
                  <span key={e.dataSource} className="inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                    {e.dataSource}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-green-700">All Microsoft-covered sources are also covered by at least one competitor.</p>
          )}
          {topCompetitor && msConnectorCount > topCompetitor.totalConnectors && (
            <p className="text-xs text-green-700 mt-3 pt-3 border-t border-green-200">
              Total connector lead: {msConnectorCount} vs {topCompetitor.name}&apos;s {topCompetitor.totalConnectors}
            </p>
          )}
        </div>

        {/* Where We Lag */}
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">-</span>
            <h3 className="text-sm font-bold text-amber-800">Where We Lag</h3>
          </div>
          {gapsByCompetitor.length > 0 ? (
            <div className="space-y-3">
              {gapsByCompetitor.map(g => (
                <div key={g.id}>
                  <p className="text-xs font-semibold text-amber-800 mb-1">
                    vs {g.name} ({g.sources.length} source{g.sources.length > 1 ? 's' : ''})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.sources.map(s => (
                      <span key={s} className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-700">We cover everything our competitors cover.</p>
          )}
          {topCompetitor && topCompetitor.totalConnectors > msConnectorCount && (
            <p className="text-xs text-amber-700 mt-3 pt-3 border-t border-amber-200">
              {topCompetitor.name} leads with {topCompetitor.totalConnectors} total connectors vs our {msConnectorCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
