import { Category, Connector, VendorId } from '@/types';
import { vendorColors } from '@/lib/utils';

interface CategoryLeadershipTableProps {
  categories: Category[];
  connectors: Connector[];
}

const vendorIds: VendorId[] = ['microsoft', 'google', 'anthropic', 'openai'];
const vendorNames: Record<VendorId, string> = {
  microsoft: 'Microsoft',
  google: 'Google',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
};

export default function CategoryLeadershipTable({ categories, connectors }: CategoryLeadershipTableProps) {
  const rows = categories.map(cat => {
    const counts: Record<VendorId, number> = { microsoft: 0, google: 0, anthropic: 0, openai: 0 };
    for (const c of connectors) {
      if (c.categoryId === cat.id && counts[c.vendorId as VendorId] !== undefined) {
        counts[c.vendorId as VendorId]++;
      }
    }
    const maxCount = Math.max(...Object.values(counts));
    const leaders = vendorIds.filter(v => counts[v] === maxCount && maxCount > 0);
    return { category: cat, counts, leaders };
  });

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="font-semibold text-slate-900">Category Leadership</h2>
        <p className="text-sm text-slate-600 mt-1">Connector count per vendor by category, leader highlighted</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left text-xs font-semibold text-slate-600 px-4 py-3">Category</th>
              {vendorIds.map(v => (
                <th key={v} className={`text-center text-xs font-semibold px-4 py-3 ${vendorColors[v]?.text || 'text-slate-600'}`}>
                  {vendorNames[v]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.category.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {row.category.icon} {row.category.name}
                </td>
                {vendorIds.map(v => {
                  const isLeader = row.leaders.includes(v) && row.counts[v] > 0;
                  return (
                    <td key={v} className="px-4 py-3 text-center text-sm">
                      {isLeader ? (
                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold ${vendorColors[v]?.light || 'bg-slate-100'} ${vendorColors[v]?.text || 'text-slate-700'}`}>
                          {row.counts[v]}
                        </span>
                      ) : (
                        <span className="text-slate-400">{row.counts[v] || '—'}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
