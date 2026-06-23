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
  const gaps = vendorIds.map(vid => {
    const missing = coverage.filter(e => !e[vid]);
    return {
      vendorId: vid,
      name: vendorNames[vid],
      missing,
      totalMissing: missing.length,
    };
  });

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-1">Coverage Gap Analysis</h2>
      <p className="text-sm text-slate-600 mb-4">Data sources each vendor is missing from the tracked matrix</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gaps.map(gap => (
          <div key={gap.vendorId} className={`rounded-lg border p-4 ${vendorColors[gap.vendorId]?.border || 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${vendorColors[gap.vendorId]?.text || 'text-slate-700'}`}>
              {gap.name}
            </h3>
            {gap.totalMissing === 0 ? (
              <p className="text-xs text-green-600 font-medium">Full coverage</p>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Missing {gap.totalMissing} of {coverage.length} sources
                </p>
                <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                  {gap.missing.slice(0, 10).map(e => (
                    <li key={e.dataSource} className="text-xs text-slate-600">
                      {e.dataSource}
                    </li>
                  ))}
                  {gap.totalMissing > 10 && (
                    <li className="text-xs text-slate-400 italic">
                      +{gap.totalMissing - 10} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
