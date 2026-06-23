import { getCoverage } from '@/lib/data';
import CoverageTable from '@/components/CoverageTable';

export default function CoveragePage() {
  const coverage = getCoverage();

  const criticalCount = coverage.filter((e) => e.importance === 'critical').length;
  const importantCount = coverage.filter((e) => e.importance === 'important').length;

  // Extract unique categories for the filter dropdown
  const categories = Array.from(new Set(coverage.map(e => e.category))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coverage Matrix</h1>
        <p className="text-sm text-slate-600 mt-1">
          Compare which popular data sources are supported by each vendor.
          Tracking {coverage.length} data sources ({criticalCount} critical, {importantCount} important).
        </p>
      </div>

      <CoverageTable entries={coverage} categories={categories} />
    </div>
  );
}
