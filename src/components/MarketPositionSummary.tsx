import { Vendor, Connector } from '@/types';

interface MarketPositionSummaryProps {
  vendors: Vendor[];
  connectors?: Connector[];
}

function normalise(name: string) {
  return name.toLowerCase().trim();
}

export default function MarketPositionSummary({ vendors, connectors = [] }: MarketPositionSummaryProps) {
  const ms = vendors.find(v => v.id === 'microsoft');
  const msOfficialCount = ms?.officialConnectors ?? 0;

  // Build name sets from actual connector data — Microsoft official only
  const msOfficial = connectors.filter(c => c.vendorId === 'microsoft' && c.type === 'official');
  const msNames = new Set(msOfficial.map(c => normalise(c.name)));
  const competitorIds = ['google', 'anthropic', 'openai'] as const;

  const competitorSets = competitorIds.map(vid => {
    const vendor = vendors.find(v => v.id === vid);
    const names = new Set(connectors.filter(c => c.vendorId === vid).map(c => normalise(c.name)));
    // Connectors they have that we don't
    const theyHaveWeNot = connectors
      .filter(c => c.vendorId === vid && !msNames.has(normalise(c.name)));
    // Connectors we have that they don't (official only)
    const weHaveTheyNot = msOfficial
      .filter(c => !names.has(normalise(c.name)));
    return {
      id: vid,
      name: vendor?.name || vid,
      totalConnectors: vendor?.totalConnectors ?? 0,
      theyHaveWeNot,
      weHaveTheyNot,
    };
  });

  // Where We Lead: official Microsoft connectors that NO competitor has
  const allCompetitorNames = new Set(
    connectors.filter(c => c.vendorId !== 'microsoft').map(c => normalise(c.name))
  );
  const msExclusive = msOfficial
    .filter(c => !allCompetitorNames.has(normalise(c.name)));

  // Sort competitors by gap size (largest lag first)
  const lagData = competitorSets
    .filter(c => c.theyHaveWeNot.length > 0)
    .sort((a, b) => b.theyHaveWeNot.length - a.theyHaveWeNot.length);

  const competitorsByTotal = [...vendors]
    .filter(v => v.id !== 'microsoft')
    .sort((a, b) => b.totalConnectors - a.totalConnectors);
  const topCompetitor = competitorsByTotal[0];

  const MAX_CHIPS = 20;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold text-slate-900">Competitive Intelligence</h2>
        <span className="text-xs text-slate-500">Based on actual connector data (Microsoft official only)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Where We Lead */}
        <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">+</span>
            <h3 className="text-sm font-bold text-green-800">Where We Lead</h3>
          </div>
          <p className="text-sm text-green-900 mb-2">
            <span className="font-semibold">{msExclusive.length}</span> connector{msExclusive.length !== 1 ? 's' : ''} only Microsoft offers
          </p>
          {msExclusive.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {msExclusive.slice(0, MAX_CHIPS).map(c => (
                <span key={c.id} className="inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                  {c.name}
                </span>
              ))}
              {msExclusive.length > MAX_CHIPS && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-green-200 text-green-700 text-xs font-medium">
                  +{msExclusive.length - MAX_CHIPS} more
                </span>
              )}
            </div>
          )}
          {/* Per-competitor lead counts */}
          <div className="mt-3 pt-3 border-t border-green-200 space-y-1">
            {competitorSets.map(c => (
              <p key={c.id} className="text-xs text-green-700">
                vs {c.name}: <span className="font-semibold">{c.weHaveTheyNot.length}</span> connectors they don&apos;t have
              </p>
            ))}
          </div>
        </div>

        {/* Where We Lag */}
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">-</span>
            <h3 className="text-sm font-bold text-amber-800">Where We Lag</h3>
          </div>
          {lagData.length > 0 ? (
            <div className="space-y-4">
              {lagData.map(g => (
                <div key={g.id}>
                  <p className="text-xs font-semibold text-amber-800 mb-1.5">
                    vs {g.name} — <span className="font-bold">{g.theyHaveWeNot.length}</span> connector{g.theyHaveWeNot.length !== 1 ? 's' : ''} we don&apos;t have
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.theyHaveWeNot.slice(0, MAX_CHIPS).map(c => (
                      <span key={c.id} className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                        {c.name}
                      </span>
                    ))}
                    {g.theyHaveWeNot.length > MAX_CHIPS && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-200 text-amber-700 text-xs font-medium">
                        +{g.theyHaveWeNot.length - MAX_CHIPS} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-700">We cover everything our competitors cover.</p>
          )}
          {topCompetitor && topCompetitor.totalConnectors > msOfficialCount && (
            <p className="text-xs text-amber-700 mt-3 pt-3 border-t border-amber-200">
              {topCompetitor.name} leads with {topCompetitor.totalConnectors} total connectors vs our {msOfficialCount} official
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
