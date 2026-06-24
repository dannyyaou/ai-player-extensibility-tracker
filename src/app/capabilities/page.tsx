import { getCapabilityMatrix } from '@/lib/data';
import CapabilitiesTable from '@/components/CapabilitiesTable';

export default function CapabilitiesPage() {
  const matrix = getCapabilityMatrix();

  // Only show entries with 2+ vendors for meaningful comparison
  const multiVendor = matrix.filter(e => Object.keys(e.vendors).length >= 2);

  // Extract unique categories for the filter dropdown
  const categories = Array.from(new Set(multiVendor.map(e => e.category))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Capabilities Comparison</h1>
        <p className="text-sm text-slate-600 mt-1">
          Compare integration types, data flow, and sync modes across vendors.
          Showing {multiVendor.length} data sources available from 2+ vendors
          (of {matrix.length} total).
        </p>
      </div>

      <CapabilitiesTable entries={multiVendor} categories={categories} />
    </div>
  );
}
