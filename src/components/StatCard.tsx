import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ label, value, color = 'indigo' }: StatCardProps) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700' },
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div className={cn('glass-card p-4', colors.bg)}>
      <p className={cn('text-2xl font-bold', colors.text)}>{value}</p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </div>
  );
}
