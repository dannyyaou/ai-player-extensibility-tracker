import { getFullCoverageMatrix } from '@/lib/data';
import CoverageTable from '@/components/CoverageTable';

export default function CoveragePage() {
  const coverage = getFullCoverageMatrix();

  // Extract unique categories for the filter dropdown
  const categories = Array.from(new Set(coverage.map(e => e.category))).sort();

  // Count vendors per entry
  const msCount = coverage.filter(e => e.microsoft).length;
  const allVendorCount = coverage.filter(e => e.microsoft && e.google && e.anthropic && e.openai && e.glean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coverage Matrix</h1>
        <p className="text-sm text-slate-600 mt-1">
          Full connector coverage across all vendors.
          Tracking {coverage.length} unique connectors ({msCount} by Microsoft, {allVendorCount} offered by all 5 vendors).
          Microsoft shows official connectors only.
        </p>
      </div>

      <CoverageTable entries={coverage} categories={categories} />
    </div>
  );
}
