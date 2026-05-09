import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart
} from 'recharts';
import type { Projection } from '@/lib/types';
import { brl, formatMonth } from '@/lib/formatters';

export function ProjectionChart({ data }: { data: Projection[] }) {
  const formatted = data.map(d => ({ ...d, label: formatMonth(d.month).slice(0, 3) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={formatted}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#EC4899" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
        <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.5)' }}
          formatter={(v: number) => brl(v)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="projectedBalance" name="Saldo projetado" stroke="#7C3AED" fill="url(#balanceGrad)" strokeWidth={2.5} />
        <Line type="monotone" dataKey="projectedIncome" name="Receita" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="projectedExpense" name="Despesa" stroke="#EC4899" strokeWidth={2} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
