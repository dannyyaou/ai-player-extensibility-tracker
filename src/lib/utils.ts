export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return n.toString();
}

export const vendorColors: Record<string, { bg: string; text: string; border: string; light: string }> = {
  microsoft: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  google: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  anthropic: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  openai: { bg: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-300', light: 'bg-slate-100' },
};

export const statusColors: Record<string, string> = {
  stable: 'bg-green-100 text-green-700',
  beta: 'bg-yellow-100 text-yellow-700',
  preview: 'bg-purple-100 text-purple-700',
  deprecated: 'bg-red-100 text-red-700',
};

export const typeColors: Record<string, string> = {
  official: 'bg-blue-100 text-blue-700',
  community: 'bg-orange-100 text-orange-700',
  'third-party': 'bg-gray-100 text-gray-700',
};
