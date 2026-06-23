import { CoverageEntry, VendorId } from '@/types';
import { vendorColors } from '@/lib/utils';

interface CoverageGapAnalysisProps {
  coverage: CoverageEntry[];
}

const vendorIds: VendorId[] = ['microsoft', 'google', 'anthropic', 'openai'];
const vendorNames: Record<VendorId, string> = {
  microsoft: 'Microsoft',
  google: 'Google',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
};

export default function CoverageGapAnalysis({ coverage }: CoverageGapAnalysisProps) {
  const importantEntries = coverage.filter(e => e.importance === 'critical' || e.importance === 'important');

  const gaps = vendorIds.map(vid => {
    const missing = importantEntries.filter(e => !e[vid]);
    const criticalMissing = missing.filter(e => e.importance === 'critical');
    const importantMissing = missing.filter(e => e.importance === 'important');
    return {
      vendorId: vid,
      name: vendorNames[vid],
      criticalMissing,
      importantMissing,
      totalMissing: missing.length,
    };
  });

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-1">Coverage Gap Analysis</h2>
      <p className="text-sm text-slate-600 mb-4">Critical and important data sources each vendor is missing</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gaps.map(gap => (
          <div key={gap.vendorId} className={`rounded-lg border p-4 ${vendorColors[gap.vendorId]?.border || 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${vendorColors[gap.vendorId]?.text || 'text-slate-700'}`}>
              {gap.name}
            </h3>
            {gap.totalMissing === 0 ? (
              <p className="text-xs text-green-600 font-medium">Full coverage</p>
            ) : (
              <div className="space-y-2">
                {gap.criticalMissing.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-1">
                      Critical ({gap.criticalMissing.length})
                    </p>
                    <ul className="space-y-0.5">
                      {gap.criticalMissing.map(e => (
                        <li key={e.dataSource} className="text-xs text-slate-600">
                          {e.dataSource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {gap.importantMissing.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-yellow-600 mb-1">
                      Important ({gap.importantMissing.length})
                    </p>
                    <ul className="space-y-0.5">
                      {gap.importantMissing.map(e => (
                        <li key={e.dataSource} className="text-xs text-slate-600">
                          {e.dataSource}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
