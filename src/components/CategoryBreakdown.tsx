'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Category } from '@/types';
import { Stats } from '@/types';

interface CategoryBreakdownProps {
  categories: Category[];
  stats: Stats;
}

export default function CategoryBreakdown({ categories, stats }: CategoryBreakdownProps) {
  const data = categories
    .map((cat) => ({
      name: cat.name,
      count: stats.categoryCounts[cat.id] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Connectors by Category</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={95} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
