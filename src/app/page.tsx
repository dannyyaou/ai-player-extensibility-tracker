import { getVendors, getCategories, getStats, getCoverage, getAllConnectors } from '@/lib/data';
import VendorSummaryCard from '@/components/VendorSummaryCard';
import CoverageChart from '@/components/CoverageChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import EnhancedStatCard from '@/components/EnhancedStatCard';
import MarketPositionSummary from '@/components/MarketPositionSummary';
import CategoryLeadershipTable from '@/components/CategoryLeadershipTable';
import CoverageGapAnalysis from '@/components/CoverageGapAnalysis';
import VendorCoverageComparison from '@/components/VendorCoverageComparison';

export default function Dashboard() {
  const vendors = getVendors();
  const categories = getCategories();
  const stats = getStats();
  const coverage = getCoverage();
  const connectors = getAllConnectors();

  // Compute enhanced stat details
  const officialCount = connectors.filter(c => c.type === 'official').length;
  const communityCount = connectors.filter(c => c.type === 'community' || c.type === 'third-party').length;

  return (
    <div className="space-y-8">
      {/* Title + description */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Microsoft Copilot Extensibility Intelligence</h1>
        <p className="text-sm text-slate-600 mt-1">
          Competitive positioning for the Microsoft extensibility team — where we lead, where we lag, and where to invest next
        </p>
      </div>

      {/* Market Position Summary — Lead vs Lag cards */}
      <MarketPositionSummary vendors={vendors} connectors={connectors} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EnhancedStatCard
          label="Total Connectors"
          value={stats.totalConnectors}
          detail={`${officialCount} official / ${communityCount} community`}
          color="indigo"
        />
        <EnhancedStatCard
          label="Vendors Tracked"
          value={stats.totalVendors}
          color="blue"
        />
        <EnhancedStatCard
          label="Categories"
          value={stats.totalCategories}
          color="emerald"
        />
        <EnhancedStatCard
          label="Coverage Sources"
          value={stats.coverageEntries}
          detail="Data sources tracked in matrix"
          color="amber"
        />
      </div>

      {/* Vendor Overview */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-4">Vendor Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendors.map((vendor) => (
            <VendorSummaryCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>

      {/* Charts row — connector totals + per-vendor coverage comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoverageChart vendors={vendors} />
        <VendorCoverageComparison vendors={vendors} connectors={connectors} />
      </div>

      {/* Category breakdown */}
      <CategoryBreakdown categories={categories} stats={stats} />

      {/* Category Leadership Table */}
      <CategoryLeadershipTable categories={categories} connectors={connectors} />

      {/* Coverage Gap Analysis */}
      <CoverageGapAnalysis coverage={coverage} />
    </div>
  );
}
