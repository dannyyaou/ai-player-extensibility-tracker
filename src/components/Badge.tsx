import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  variant?: string;
  className?: string;
}

export default function Badge({ label, variant, className }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    stable: 'bg-green-100 text-green-700',
    beta: 'bg-yellow-100 text-yellow-700',
    preview: 'bg-purple-100 text-purple-700',
    deprecated: 'bg-red-100 text-red-700',
    official: 'bg-blue-100 text-blue-700',
    community: 'bg-orange-100 text-orange-700',
    'third-party': 'bg-gray-100 text-gray-700',
    critical: 'bg-red-100 text-red-700',
    important: 'bg-yellow-100 text-yellow-700',
    'nice-to-have': 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variant ? variantClasses[variant] || 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600',
        className
      )}
    >
      {label}
    </span>
  );
}
