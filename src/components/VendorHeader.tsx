import { Vendor } from '@/types';
import { vendorColors } from '@/lib/utils';

interface VendorHeaderProps {
  vendor: Vendor;
}

export default function VendorHeader({ vendor }: VendorHeaderProps) {
  const colors = vendorColors[vendor.id];

  return (
    <div className={`glass-card p-6 ${colors.light} border-${vendor.color}-200`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-4 h-4 rounded-full ${colors.bg}`} />
            <h1 className="text-2xl font-bold text-slate-900">{vendor.name}</h1>
          </div>
          <p className={`text-sm font-medium ${colors.text} mb-2`}>{vendor.productName}</p>
          <p className="text-sm text-slate-600 max-w-2xl">{vendor.description}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${colors.text}`}>{vendor.totalConnectors}</p>
          <p className="text-xs text-slate-500">Total Connectors</p>
        </div>
      </div>
    </div>
  );
}
