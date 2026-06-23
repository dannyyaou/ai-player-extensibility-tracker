'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Vendor } from '@/types';

interface CoverageChartProps {
  vendors: Vendor[];
}

const VENDOR_CHART_COLORS: Record<string, string> = {
  microsoft: '#3b82f6',
  google: '#10b981',
  anthropic: '#f59e0b',
  openai: '#475569',
};

export default function CoverageChart({ vendors }: CoverageChartProps) {
  const data = vendors.map((v) => ({
    name: v.name,
    connectors: v.totalConnectors,
    official: v.officialConnectors,
    fill: VENDOR_CHART_COLORS[v.id] || '#94a3b8',
  }));

  return (
    <div className="glass-card p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Connector Coverage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="connectors" name="Total Connectors" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
