import Link from 'next/link';
import { Vendor } from '@/types';
import { vendorColors, formatNumber } from '@/lib/utils';

interface VendorSummaryCardProps {
  vendor: Vendor;
}

export default function VendorSummaryCard({ vendor }: VendorSummaryCardProps) {
  const colors = vendorColors[vendor.id];

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <div className="glass-card glass-card-hover p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
            <p className="text-sm text-slate-500">{vendor.productName}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
        </div>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{vendor.description}</p>
        <div className="flex items-center gap-4">
          <div>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {formatNumber(vendor.totalConnectors)}
            </p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <p className="text-lg font-semibold text-slate-700">
              {vendor.officialConnectors}
            </p>
            <p className="text-xs text-slate-500">Official</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
