import { cn } from '@/lib/utils';

interface EnhancedStatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  color?: string;
}

export default function EnhancedStatCard({ label, value, detail, color = 'indigo' }: EnhancedStatCardProps) {
  const colorMap: Record<string, { bg: string; text: string; detail: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', detail: 'text-indigo-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', detail: 'text-blue-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', detail: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', detail: 'text-amber-500' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', detail: 'text-slate-500' },
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div className={cn('glass-card p-4', colors.bg)}>
      <p className={cn('text-2xl font-bold', colors.text)}>{value}</p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
      {detail && (
        <p className={cn('text-xs mt-1', colors.detail)}>{detail}</p>
      )}
    </div>
  );
}
