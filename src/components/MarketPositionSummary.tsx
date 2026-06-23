import { Vendor, Connector, CoverageEntry } from '@/types';

interface MarketPositionSummaryProps {
  vendors: Vendor[];
  connectors?: Connector[];
  coverage: CoverageEntry[];
}

export default function MarketPositionSummary({ vendors, coverage }: MarketPositionSummaryProps) {
  const vendorIds = ['microsoft', 'google', 'anthropic', 'openai'] as const;
  const ms = vendors.find(v => v.id === 'microsoft');
  const criticalEntries = coverage.filter(e => e.importance === 'critical');

  // Where We Lead: data sources where Microsoft has coverage and no competitor does
  const msExclusive = coverage.filter(e =>
    e.microsoft && !e.google && !e.anthropic && !e.openai
  );

  // Coverage Advantage: critical sources covered by Microsoft vs each competitor
  const msCritical = criticalEntries.filter(e => e.microsoft).length;
  const competitorCritical = vendorIds
    .filter(v => v !== 'microsoft')
    .map(vid => ({
      name: vendors.find(v => v.id === vid)?.name || vid,
      count: criticalEntries.filter(e => e[vid]).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Where We Lag: data sources where a competitor has coverage but Microsoft doesn't
  const msGaps = coverage.filter(e =>
    !e.microsoft && (e.google || e.anthropic || e.openai)
  );
  const gapsByCompetitor = vendorIds
    .filter(v => v !== 'microsoft')
    .map(vid => ({
      name: vendors.find(v => v.id === vid)?.name || vid,
      sources: coverage.filter(e => !e.microsoft && e[vid]).map(e => e.dataSource),
    }))
    .filter(g => g.sources.length > 0);

  // Fastest Growing Competitor: most total connectors (non-Microsoft)
  const competitorsByTotal = [...vendors]
    .filter(v => v.id !== 'microsoft')
    .sort((a, b) => b.totalConnectors - a.totalConnectors);
  const topCompetitor = competitorsByTotal[0];

  // Strategic Opportunity: uncovered critical/important sources where no vendor or only competitors have coverage
  const uncoveredCritical = criticalEntries.filter(e =>
    !e.microsoft && !e.google && !e.anthropic && !e.openai
  );
  const competitorOnlyCritical = criticalEntries.filter(e =>
    !e.microsoft && (e.google || e.anthropic || e.openai)
  );

  // Connector Count Comparison
  const msConnectorCount = ms?.totalConnectors ?? 0;
  const msOfficialCount = ms?.officialConnectors ?? 0;

  const insights: { title: string; content: string; tone: 'positive' | 'warning' | 'neutral' | 'opportunity' }[] = [
    {
      title: 'Where We Lead',
      content: msExclusive.length > 0
        ? `Microsoft is the only vendor covering ${msExclusive.length} data source${msExclusive.length > 1 ? 's' : ''}: ${msExclusive.slice(0, 5).map(e => e.dataSource).join(', ')}${msExclusive.length > 5 ? ` (+${msExclusive.length - 5} more)` : ''}.`
        : 'No exclusive data source coverage found. All Microsoft-covered sources are also covered by at least one competitor.',
      tone: msExclusive.length > 0 ? 'positive' : 'warning',
    },
    {
      title: 'Our Coverage Advantage',
      content: `Microsoft covers ${msCritical} of ${criticalEntries.length} critical sources. ${competitorCritical.map(c => `${c.name}: ${c.count}`).join(', ')}.`,
      tone: msCritical >= (competitorCritical[0]?.count ?? 0) ? 'positive' : 'warning',
    },
    {
      title: 'Where We Lag',
      content: msGaps.length > 0
        ? gapsByCompetitor.map(g => `${g.name} covers ${g.sources.slice(0, 3).join(', ')}${g.sources.length > 3 ? ` (+${g.sources.length - 3} more)` : ''} which we don't`).join('. ') + '.'
        : 'We cover everything our competitors cover.',
      tone: msGaps.length > 0 ? 'warning' : 'positive',
    },
    {
      title: 'Fastest Growing Competitor',
      content: topCompetitor
        ? `${topCompetitor.name} leads competitors with ${topCompetitor.totalConnectors} total connectors (${topCompetitor.officialConnectors} official). ${topCompetitor.totalConnectors > msConnectorCount ? `That's ${topCompetitor.totalConnectors - msConnectorCount} more than our ${msConnectorCount}.` : `We still lead with ${msConnectorCount}.`}`
        : 'No competitor data available.',
      tone: topCompetitor && topCompetitor.totalConnectors > msConnectorCount ? 'warning' : 'positive',
    },
    {
      title: 'Strategic Opportunity',
      content: uncoveredCritical.length > 0 || competitorOnlyCritical.length > 0
        ? `${uncoveredCritical.length > 0 ? `${uncoveredCritical.length} critical source${uncoveredCritical.length > 1 ? 's' : ''} uncovered by any vendor: ${uncoveredCritical.slice(0, 3).map(e => e.dataSource).join(', ')}${uncoveredCritical.length > 3 ? ' (+more)' : ''}.` : ''} ${competitorOnlyCritical.length > 0 ? `${competitorOnlyCritical.length} critical source${competitorOnlyCritical.length > 1 ? 's' : ''} where only competitors have coverage.` : ''}`.trim()
        : 'All critical sources are either covered by Microsoft or uncovered by everyone.',
      tone: 'opportunity',
    },
    {
      title: 'Connector Count Comparison',
      content: `Microsoft: ${msConnectorCount} total (${msOfficialCount} official). ${competitorsByTotal.map(c => `${c.name}: ${c.totalConnectors} (${c.officialConnectors} official)`).join(', ')}.`,
      tone: 'neutral',
    },
  ];

  const toneStyles = {
    positive: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    opportunity: 'border-blue-200 bg-blue-50',
    neutral: 'border-slate-200 bg-slate-50',
  };

  const toneLabels = {
    positive: 'text-green-700',
    warning: 'text-amber-700',
    opportunity: 'text-blue-700',
    neutral: 'text-slate-700',
  };

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-1">Competitive Intelligence</h2>
      <p className="text-xs text-slate-500 mb-4">Microsoft extensibility position vs. competitors</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 ${toneStyles[insight.tone]}`}
          >
            <h3 className={`text-sm font-semibold mb-1 ${toneLabels[insight.tone]}`}>
              {insight.title}
            </h3>
            <p className="text-sm text-slate-700">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
